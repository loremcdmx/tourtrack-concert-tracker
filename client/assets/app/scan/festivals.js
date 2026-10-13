'use strict';

const FESTIVAL_FETCH_CONCURRENCY = 4;
const FESTIVAL_PAGE_SIZE = 100;
const FESTIVAL_DEEP_LIMIT = 1000;
const FESTIVAL_MAX_REQUESTS = 1500;
const FESTIVAL_MAX_PARTITIONS = 2048;
const FESTIVAL_REQUEST_TIMEOUT_MS = 5000;

async function festivalResponseJson(response, timeoutMs) {
  let reader;
  let timer;
  const body = Promise.resolve().then(async () => {
    if (!response.body?.getReader) return response.json();
    reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      text += decoder.decode(chunk.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  });
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reader?.cancel().catch(() => {});
      reject(new Error('Festival response timed out'));
    }, Math.max(1, timeoutMs));
  });
  try { return await Promise.race([body, deadline]); }
  finally { clearTimeout(timer); }
}

function snapshotOngoingFestivals(list = festivals, today = _isoDateOnly(new Date())) {
  const data = (Array.isArray(list) ? list : [])
    .filter(festival => _isValidIsoDateOnly(festival?.date)
      && _isValidIsoDateOnly(festival?.endDate)
      && festival.date <= today && festival.endDate >= today
      && countryAllowed(festival.country || ''))
    .map(festival => Object.freeze({
      ...festival,
      lineup: Object.freeze([...(festival.lineup || [])]),
      sourceHints: Object.freeze([...(festival.sourceHints || [])]),
      matched: Object.freeze((festival.matched || []).map(match => Object.freeze({ ...match }))),
    }));
  return Object.freeze({ cHash: countryHash(), data: Object.freeze(data) });
}

function mergeOngoingFestivals(snapshot, list = festivals, today = _isoDateOnly(new Date())) {
  const retained = snapshot?.cHash === countryHash()
    ? snapshot.data.filter(festival => festival.endDate >= today && countryAllowed(festival.country || ''))
    : [];
  return deduplicateFestivals([...retained, ...(Array.isArray(list) ? list : [])]);
}

async function fetchFestivalsData(run = getScanContext()) {
  const result = { complete: false, requests: 0, totalQueries: 0, completedQueries: 0, failedQueries: [], partitions: 0 };
  if (!isScanRunCurrent(run)) return result;
  const today = _isoDateOnly(new Date());
  const geoTargets = buildFestivalGeoTargets();
  const alwaysSweep = buildAlwaysSweepFestivalCountries();
  const tasks = [];
  for (const geo of geoTargets) {
    tasks.push({ geo, keyword: 'festival', hint: null, kind: 'user-geo', music: true });
  }
  for (const countryCode of alwaysSweep) {
    tasks.push({ geo: '&countryCode=' + countryCode, keyword: 'festival', hint: null, kind: 'global-' + countryCode, music: true });
  }
  for (const name of KNOWN_FESTIVALS) {
    tasks.push({ geo: '', keyword: name, hint: name, kind: 'named', music: false });
  }
  result.totalQueries = tasks.length;
  let cursor = 0;
  const iso = seconds => new Date(seconds * 1000).toISOString().replace('.000Z', 'Z');
  const from = Math.floor(Date.parse(today + 'T00:00:00Z') / 1000);

  async function pageData(task, start, end, page, descending = false) {
    for (let attempt = 0; attempt < 2; attempt++) {
      await window._rateLimitedWait?.();
      if (!isScanRunCurrent(run)) throw new Error('Festival search stopped');
      if (result.requests >= FESTIVAL_MAX_REQUESTS) throw new Error('Festival request budget reached');
      const size = descending ? 1 : FESTIVAL_PAGE_SIZE;
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(task.keyword)}${task.music ? '&classificationName=music' : ''}&size=${size}&page=${page}&sort=date,${descending ? 'desc' : 'asc'}${task.geo}&startDateTime=${iso(start)}${end == null ? '' : '&endDateTime=' + iso(end)}`;
      const began = Date.now();
      result.requests++;
      try {
        const response = await apiFetch(url, FESTIVAL_REQUEST_TIMEOUT_MS);
        if (!isScanRunCurrent(run)) throw new Error('Festival search stopped');
        if (!response.ok) {
          const error = new Error('Festival HTTP ' + response.status);
          error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
          throw error;
        }
        const data = await festivalResponseJson(response, FESTIVAL_REQUEST_TIMEOUT_MS - (Date.now() - began));
        if (!isScanRunCurrent(run)) throw new Error('Festival search stopped');
        const info = data?.page;
        const events = data?._embedded?.events || [];
        const expected = info ? Math.min(size, Math.max(0, info.totalElements - page * size)) : NaN;
        if (!data || typeof data !== 'object' || Array.isArray(data) || data.fault || data.errors
            || (data._embedded?.events != null && !Array.isArray(data._embedded.events))
            || !info || !Number.isSafeInteger(info.totalElements) || info.totalElements < 0
            || !Number.isSafeInteger(info.totalPages) || info.totalPages !== Math.ceil(info.totalElements / size)
            || (info.number != null && (!Number.isSafeInteger(info.number) || info.number !== page))
            || (info.size != null && (!Number.isSafeInteger(info.size) || info.size !== size))
            || events.length !== expected) {
          throw new Error('Invalid festival response');
        }
        return data;
      } catch (error) {
        if (!isScanRunCurrent(run) || attempt === 1 || error.retryable === false
            || (error.retryable === undefined && error.message.startsWith('Festival HTTP '))) throw error;
        if (typeof sleep === 'function') await sleep(250);
      }
    }
  }

  async function partition(task, start, end, depth = 0) {
    if (++result.partitions > FESTIVAL_MAX_PARTITIONS || depth > 40) throw new Error('Festival partition budget reached');
    const first = await pageData(task, start, end, 0);
    const events = first._embedded?.events || [];
    if (events.length) ingestFestEvents(events, task.hint);
    const totalElements = Number(first.page?.totalElements);
    const totalPages = Number(first.page?.totalPages);
    const overflow = totalElements > FESTIVAL_DEEP_LIMIT || totalPages > FESTIVAL_DEEP_LIMIT / FESTIVAL_PAGE_SIZE;
    if (overflow) return split();
    const pages = Number.isInteger(totalPages) && totalPages >= 0 ? totalPages
      : Number.isInteger(totalElements) && totalElements >= 0 ? Math.ceil(totalElements / FESTIVAL_PAGE_SIZE) : null;
    if (pages != null && pages <= 1) return;
    let previous = events;
    for (let page = 1; page * FESTIVAL_PAGE_SIZE < FESTIVAL_DEEP_LIMIT; page++) {
      if (pages == null && previous.length < FESTIVAL_PAGE_SIZE) return;
      if (pages != null && page >= pages) return;
      const data = await pageData(task, start, end, page);
      previous = data._embedded?.events || [];
      if (previous.length) ingestFestEvents(previous, task.hint);
    }
    if (pages != null && pages <= FESTIVAL_DEEP_LIMIT / FESTIVAL_PAGE_SIZE) return;
    if (previous.length < FESTIVAL_PAGE_SIZE) return;
    return split();

    async function split() {
      let last = end;
      if (last == null) {
        const tail = await pageData(task, start, null, 0, true);
        const event = tail._embedded?.events?.[0];
        const dateTime = Date.parse(event?.dates?.start?.dateTime || '');
        const dateOnly = Date.parse((event?.dates?.start?.localDate || '') + 'T00:00:00Z');
        last = Number.isFinite(dateTime) ? Math.floor(dateTime / 1000)
          : Number.isFinite(dateOnly) ? Math.floor(dateOnly / 1000) + 2 * 86400 - 1 : NaN;
      }
      if (!Number.isFinite(last) || last <= start) throw new Error('Festival results exceed paging at one second');
      const middle = start + Math.floor((last - start) / 2);
      await partition(task, start, middle, depth + 1);
      await partition(task, middle + 1, last, depth + 1);
    }
  }

  async function worker() {
    while (isScanRunCurrent(run) && cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        await partition(task, from, null);
        result.completedQueries++;
      } catch (error) {
        result.failedQueries.push({ kind: task.kind, hint: task.hint, reason: error.message });
        dblog('warn', `Festival search ${task.hint || task.kind}: ${error.message}`);
      }
      const done = result.completedQueries + result.failedQueries.length;
      setProgress(`Festivals: ${done}/${tasks.length} searches · ${festivals.length} found`, 87 + Math.round(done / Math.max(1, tasks.length) * 6));
    }
  }
  await Promise.all(Array.from({ length: Math.min(FESTIVAL_FETCH_CONCURRENCY, Math.max(1, tasks.length)) }, () => worker()));
  result.complete = isScanRunCurrent(run) && result.completedQueries === tasks.length && !result.failedQueries.length;
  if (!isScanRunCurrent(run)) return result;
  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog(result.complete ? 'info' : 'warn', `Festivals: ${festivals.length} after dedup; ${result.completedQueries}/${tasks.length} searches complete, ${result.requests} requests`);
  return result;
}
