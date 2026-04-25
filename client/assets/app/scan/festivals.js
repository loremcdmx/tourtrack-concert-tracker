'use strict';

const FESTIVAL_FETCH_CONCURRENCY = 4;

async function fetchFestivalsData() {
  const today = new Date().toISOString().split('T')[0];
  const geoTargets = buildFestivalGeoTargets();
  const alwaysSweep = buildAlwaysSweepFestivalCountries();

  // Flatten the three sequential sweeps into a single task queue so a worker
  // pool can pull from it with concurrency. `window._rateLimitedWait` already
  // keeps the aggregate request rate under the 100 req/min TM ceiling, so we
  // no longer need the per-request 80–150 ms sleeps that used to dominate the
  // wall-clock cost of the festival phase.
  const tasks = [];
  for (const geo of geoTargets) {
    for (let page = 0; page < 3; page++) {
      tasks.push({
        url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc${geo}&startDateTime=${today}T00:00:00Z`,
        hint: null,
        kind: 'user-geo',
      });
    }
  }
  for (const countryCode of alwaysSweep) {
    for (let page = 0; page < 2; page++) {
      tasks.push({
        url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc&countryCode=${countryCode}&startDateTime=${today}T00:00:00Z`,
        hint: null,
        kind: `global-${countryCode}`,
      });
    }
  }
  for (const name of KNOWN_FESTIVALS) {
    tasks.push({
      url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}&size=50&sort=date,asc&startDateTime=${today}T00:00:00Z`,
      hint: name,
      kind: 'named',
    });
  }

  const total = tasks.length;
  let done = 0;
  let cursor = 0;

  async function runOne(task) {
    await (window._rateLimitedWait?.());
    if (scanAborted) return;
    try {
      const response = await apiFetch(task.url);
      if (!response.ok) return;
      const data = await response.json();
      const events = data?._embedded?.events || [];
      if (events.length) ingestFestEvents(events, task.hint);
    } catch (error) {
      // swallow per-task failures — festival discovery is best-effort
    }
  }

  async function worker() {
    while (!scanAborted) {
      const myIndex = cursor++;
      if (myIndex >= tasks.length) return;
      await runOne(tasks[myIndex]);
      done++;
      if (done % 8 === 0 || done === total) {
        const pct = 87 + Math.round((done / Math.max(1, total)) * 6);
        setProgress(`Festivals: ${done}/${total} sweeps · ${festivals.length} found`, pct);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(FESTIVAL_FETCH_CONCURRENCY, Math.max(1, tasks.length)) },
    () => worker(),
  );
  await Promise.all(workers);

  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog('info', `Festivals: ${festivals.length} after dedup (geo: ${festivalGeoTargetCount(geoTargets)}, always-sweep: ${alwaysSweep.join(',')}, named: ${KNOWN_FESTIVALS.length})`);
}
