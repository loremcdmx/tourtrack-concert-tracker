'use strict';

// Cache TTL for attractionIds — they almost never change
const TTL_ATTRACTION    = 30 * 24 * 3600e3; // 30 days — IDs never change, cache aggressively
const TTL_UPCOMING      = 24 * 3600e3;       // 24h — re-check event count daily
const TTL_UPCOMING_ZERO = 48 * 3600e3;       // 48h — if 0 today, unlikely to tour overnight
const TM_EVENTS_PAGE_SIZE = 200;
const TM_MAX_ATTRACTION_PAGES = 12;
const TM_MAX_KEYWORD_PAGES = 4;

// ── In-memory L1 cache for attraction info ───────────────────────
// IDB writes are async and fire-and-forget. Without this, a retry that fires
// within ~50ms of the original request will miss the IDB cache and make a
// second network call for the same artist. L1 is synchronous — zero latency.
// Capped at L1_MAX entries with a simple FIFO eviction so a long-running tab
// with many rescans doesn't grow the map unbounded.
const _L1_MAX = 1024;
const _attractionL1 = new Map(); // key → { id, totalUpcoming, ts }
function _attractionL1Set(key, value) {
  if (_attractionL1.has(key)) _attractionL1.delete(key);
  _attractionL1.set(key, value);
  if (_attractionL1.size > _L1_MAX) {
    const oldest = _attractionL1.keys().next().value;
    if (oldest !== undefined) _attractionL1.delete(oldest);
  }
}

// ── resolveAttractionInfo ──────────────────────────────────────────
// Returns { id, totalUpcoming } for an artist.
//
// TWO-LEVEL CACHE STRATEGY:
//   L1 (in-memory Map): synchronous, lives for the duration of the browser session.
//      Prevents duplicate TM requests when the retry loop calls this function
//      multiple times for the same artist before the IDB write has committed.
//   L2 (IndexedDB): persists across sessions. Separate TTLs for the ID (30 days —
//      attraction IDs are permanent identifiers that never change) vs the upcoming
//      count (24h for active artists, 48h for confirmed-dormant artists with 0 events).
//
// WHY SEPARATE TTLs: Before this change, a single 7-day TTL bundled the ID and
// event count together. When the entry expired, you re-fetched the ID even though
// it hadn't changed — wasting a TM request on data you already knew. Now:
//   - ID re-fetch: only if > 30 days old (almost never happens in practice)
//   - Count re-fetch: every 24-48h, because tour announcements happen daily
async function resolveAttractionInfo(artist) {
  const key = artist.toLowerCase().trim();

  // ── L1 check (in-memory) ─────────────────────────────────────────
  const l1 = _attractionL1.get(key);
  if (l1) return { id: l1.id, totalUpcoming: l1.totalUpcoming };

  // ── L2 check (IDB) ───────────────────────────────────────────────
  const now = Date.now();
  try {
    const cached = await DB.get('attractions', key);
    if (cached) {
      const idFresh      = (now - cached.ts) < TTL_ATTRACTION;
      const countTTL     = (cached.totalUpcoming === 0) ? TTL_UPCOMING_ZERO : TTL_UPCOMING;
      const countFresh   = cached.tsCounted && (now - cached.tsCounted) < countTTL;

      if (idFresh && countFresh) {
        // Both ID and count are fresh — return from cache, no network call
        const result = { id: cached.id, totalUpcoming: cached.totalUpcoming ?? null };
        _attractionL1Set(key, result);
        if (typeof recordTicketmasterKnowledge === 'function') {
          recordTicketmasterKnowledge(artist, {
            attractionId: cached.id || '',
            attractionName: cached.matchName || cached.name || '',
            totalUpcoming: cached.totalUpcoming ?? null,
            checkedAt: cached.tsCounted || cached.ts || now,
            freshness: 'idb',
          }).catch(() => {});
        }
        return result;
      }

      if (idFresh && !countFresh) {
        // ID is still good, only need to re-check the event count.
        // We can do this with a targeted request using the known attractionId,
        // which is faster and cheaper than a keyword search.
        if (cached.id) {
          try {
            await (window._rateLimitedWait?.());
            const countUrl = `https://app.ticketmaster.com/discovery/v2/attractions/${cached.id}.json?apikey=${API_KEY}`;
            const cr = await apiFetch(countUrl, 5000);
            if (cr.ok) {
              const cd = await cr.json();
              const ue = cd.upcomingEvents;
              const totalUpcoming = ue ? (ue._total ?? null) : 0;
              const updated = { ...cached, totalUpcoming, tsCounted: now };
              DB.put('attractions', key, updated).catch(() => {});
              const result = { id: cached.id, totalUpcoming };
              _attractionL1Set(key, result);
              if (typeof recordTicketmasterKnowledge === 'function') {
                recordTicketmasterKnowledge(artist, {
                  attractionId: cached.id || '',
                  attractionName: cached.matchName || cached.name || '',
                  totalUpcoming,
                  checkedAt: now,
                  freshness: 'count-refresh',
                }).catch(() => {});
              }
              dblog('ok', `${artist}: count refresh → ${totalUpcoming ?? '?'} upcoming (id cached)`);
              return result;
            }
          } catch(e) {
            // Count refresh failed — fall through to return stale count rather than erroring
            dblog('warn', `${artist}: count refresh failed (${e.message}) — using stale count`);
          }
          // Return stale data rather than making a full re-fetch on network error
          const stale = { id: cached.id, totalUpcoming: cached.totalUpcoming ?? null };
          _attractionL1Set(key, stale);
          return stale;
        }
      }
    }
  } catch(e) {}

  // ── Full network fetch (cache miss or ID expired) ─────────────────
  const ambig = artistIsAmbiguous(artist);
  let id = null, totalUpcoming = null, attractionName = '';

  // Normalize diacritics for comparison and fallback search
  // e.g. "Síloé" → "Siloe", "Arda Bogotá" → "Arda Bogota"
  const _stripDia = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const artistNorm = _stripDia(artist);
  const artistAscii = artist.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');

  const _findBest = (items) => {
    const al = artist.toLowerCase();
    // 1. Exact original name match
    const exact = items.find(a => (a.name||'').toLowerCase() === al);
    if (exact) return exact;
    // 2. Diacritic-normalized match (Síloé == Siloe, Bogotá == Bogota)
    const normMatch = items.find(a => _stripDia(a.name) === artistNorm);
    if (normMatch) return normMatch;
    // 3. Alias-aware attraction match using the artist knowledge base
    const aliasMatch = items.find(a => _attractionMatchesArtist(artist, a.name));
    if (aliasMatch) return aliasMatch;
    // 4. Fallback: first result for unambiguous artists
    return (!ambig && items[0]) || null;
  };

  try {
    const buildUrl = keyword =>
      `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}&classificationName=music&size=5`;
    const hasDiacritics = artistAscii !== artist && artistAscii.trim();

    await (window._rateLimitedWait?.());
    const primary = apiFetch(buildUrl(artist), 6000);
    // Fire ASCII fallback in parallel when diacritics are present — we'd otherwise
    // pay a second rate-limit gap after the primary miss, which dominates runtime
    // for the 10% of artists with non-ASCII names.
    let ascii = null;
    if (hasDiacritics) {
      await (window._rateLimitedWait?.());
      ascii = apiFetch(buildUrl(artistAscii), 6000);
      // Attach a swallow-handler eagerly so if the primary path throws (e.g.
      // 429) we don't leak an unhandled rejection or a pinned response body.
      ascii.catch(() => {});
    }

    try {
      const aRes = await primary;
      if (aRes.ok) {
        const aData = await aRes.json();
        const items = aData?._embedded?.attractions || [];
        let best = _findBest(items);

        if (!best && ascii) {
          let aRes2 = null;
          try { aRes2 = await ascii; } catch { aRes2 = null; }
          if (aRes2?.ok) {
            const aData2 = await aRes2.json();
            const items2 = aData2?._embedded?.attractions || [];
            best = _findBest(items2);
            if (best) dblog('info', `${artist}: found via ASCII fallback "${artistAscii}" → ${best.name}`);
          } else if (aRes2?.status === 429) {
            throw new Error('429');
          }
        } else if (ascii) {
          ascii.then(r => r.text?.()).catch(() => {}); // drain unused body
        }

        if (best) {
          id = best.id;
          attractionName = best.name || '';
          const ue = best.upcomingEvents;
          totalUpcoming = ue ? (ue._total ?? null) : null;
        } else {
          totalUpcoming = 0; // Not found on TM — no events possible
        }
      } else if (aRes.status === 429) {
        throw new Error('429');
      }
    } finally {
      // Make sure the ASCII body is always consumed so the socket is freed,
      // even when the primary branch throws before we read it.
      if (ascii) ascii.then(r => r?.text?.()).catch(() => {});
    }
  } catch(e) {
    if (e.message === '429') throw e; // let caller handle 429
    dblog('warn', `${artist}: attraction lookup failed — ${e.message}`);
  }

  const record = { id, ts: now, tsCounted: now, name: artist, matchName: attractionName, totalUpcoming };
  if (typeof recordTicketmasterKnowledge === 'function') {
    recordTicketmasterKnowledge(artist, {
      attractionId: id || '',
      attractionName,
      totalUpcoming,
      checkedAt: now,
      freshness: id ? 'network' : 'network-miss',
    }).catch(() => {});
  }
  DB.put('attractions', key, record).catch(() => {});
  const result = { id, totalUpcoming };
  _attractionL1Set(key, result); // populate L1 so retries within same session are free
  return result;
}

// Backward-compatible shim — callers that only need the ID (retrySingleArtist, etc.)
async function resolveAttractionId(artist) {
  const info = await resolveAttractionInfo(artist);
  return info.id;
}

// Returns an array of concert objects.
// - If existingShows provided (incremental mode): fetches page 0 only, diffs by event ID,
//   returns merged set (existing + any new events found).
// - Otherwise: full paginated fetch.
async function fetchConcerts(artist, today, existingShows = null) {
  today = today || new Date().toISOString().split('T')[0];
  const ambig = artistIsAmbiguous(artist);

  // ── Step 1: attraction info (id + upcoming count from TM) ────────
  // resolveAttractionInfo costs exactly 1 TM request on first run; subsequent
  // calls are free (7-day IDB cache). The returned totalUpcoming lets us bail out
  // before ever hitting the events endpoint for artists who aren't touring.
  const { id: attractionId, totalUpcoming } = await resolveAttractionInfo(artist);

  if (attractionId) {
    dblog('ok', `${artist}: attractionId=${attractionId} · TM upcoming=${totalUpcoming ?? '?'}`);
  }

  // Early exit: TM explicitly says 0 upcoming events → don't burn a request.
  // We skip this check in incremental mode (existingShows provided) because the
  // artist might have had events when last scanned, so we trust the cache diff.
  if (totalUpcoming === 0 && !existingShows) {
    dblog('info', `${artist}: TM reports 0 upcoming → skip event fetch (saves 1 req)`);
    return [];
  }

  // ── Step 2: fetch events ─────────────────────────────────────────
  const MAX_PAGE = attractionId
    ? Math.min(TM_MAX_ATTRACTION_PAGES, Math.max(5, Math.ceil(Math.max(totalUpcoming || 0, 0) / TM_EVENTS_PAGE_SIZE) + 1))
    : (existingShows ? TM_MAX_KEYWORD_PAGES : 3);
  const shows = [];

  // In incremental mode: build a set of already-known event IDs so we can diff
  const knownIds = existingShows ? new Set(existingShows.map(s => s.id)) : null;

  for (let page = 0; page < MAX_PAGE; page++) {
    if (scanAborted) break;
    await (window._rateLimitedWait?.());  // rate-limit every individual TM request

    const url = attractionId
      ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&attractionId=${attractionId}&size=${TM_EVENTS_PAGE_SIZE}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`
      : `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artist)}&classificationName=music&size=${TM_EVENTS_PAGE_SIZE}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;

    const r = await apiFetch(url);
    if (r.status === 429) throw new Error('429');
    if (r.status === 413) {
      // 413 = URL too long or bad chars — try ASCII-normalized name
      if (!attractionId) {
        const ascii = artist.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');
        if (ascii !== artist) {
          dblog('warn', `"${artist}": 413 — retrying with ASCII name "${ascii}"`);
          const urlAscii = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(ascii)}&classificationName=music&size=${TM_EVENTS_PAGE_SIZE}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;
          const r2 = await apiFetch(urlAscii);
          if (r2.ok) {
            const d2 = await r2.json();
            const evs2 = d2?._embedded?.events || [];
            for (const ev of evs2) {
              if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
              const show = buildConcertFromTicketmasterEvent(artist, ev, 'tm');
              if (!show || !countryAllowed(show.country)) continue;
              shows.push(show);
            }
            break;
          }
        }
      }
      break; // skip this page on 413, don't retry as-is
    }
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    const evs = d?._embedded?.events || [];
    const totalPages = Number.isFinite(d?.page?.totalPages) ? d.page.totalPages : null;

    for (const ev of evs) {
      if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
      const show = buildConcertFromTicketmasterEvent(artist, ev, 'tm');
      if (!show || !countryAllowed(show.country)) continue;
      shows.push(show);
    }

    if (totalPages != null && page + 1 >= totalPages) break;
    if (evs.length < TM_EVENTS_PAGE_SIZE) break; // last page — no need to fetch more

    // In incremental mode: if page 0 has no new IDs, we're done (no new shows announced)
    if (knownIds && page === 0) {
      const hasNew = shows.some(s => !knownIds.has(s.id));
      if (!hasNew) {
        dblog('info', `${artist}: page 0 matches cache — no new shows`);
        break;
      }
    }

    if (page < MAX_PAGE - 1) await sleep(80); // tight sleep between pages — we already paid ~300ms per fetch
  }

  // Incremental: merge new shows with existing, avoiding duplicates
  if (existingShows && knownIds) {
    const newShows = shows.filter(s => !knownIds.has(s.id));
    if (newShows.length) dblog('ok', `${artist}: +${newShows.length} NEW shows found`);
    return [...existingShows, ...newShows];
  }

  if (shows.length) dblog('ok', `${artist}: +${shows.length} shows via ${attractionId ? 'attractionId' : 'keyword'}`);
  return shows;
}

// ── bitFetch ──────────────────────────────────────────────────────
// Bandsintown's API sets correct CORS headers — no proxy needed.
// Using raw fetch() keeps BIT calls completely separate from the TM
// rate-limit pipeline so they can run in parallel without burning quota.
async function bitFetch(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    return r;
  } catch(e) {
    clearTimeout(tid);
    if (e.name === 'AbortError') throw new Error('timeout');
    const err = new Error('net:' + (e.message || 'Failed to fetch'));
    err.isNet = true;
    throw err;
  }
}

// Bandsintown fallback — called ONLY for artists with 0 TM results
// API is free, no key required, CORS-friendly from browser
async function fetchBIT(artist, today) {
  // Circuit breaker — skip if BIT is globally unreachable this session
  if (window._bitBlocked) return [];
  try {
    const name = encodeURIComponent(artist);
    const url = `https://rest.bandsintown.com/artists/${name}/events?app_id=tourtrack&date=upcoming`;
    const r = await bitFetch(url, 4000); // BIT-specific fetch — no TM proxy, no rate limit
    if (r.status === 403 || r.status === 401 || r.status === 503) {
      window._bitBlocked = true;
      dblog('warn', `BIT API: HTTP ${r.status} — disabling Bandsintown for this session`);
      return [];
    }
    if (!r.ok) return [];
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    const shows = [];
    for (const ev of data) {
      const show = buildConcertFromBandsintownEvent(artist, ev, today);
      if (!show || !countryAllowed(show.country)) continue;
      shows.push(show);
    }
    if (typeof recordBandsintownKnowledge === 'function') {
      recordBandsintownKnowledge(artist, {
        artistName: artist,
        upcomingCount: shows.length,
        checkedAt: Date.now(),
      }).catch(() => {});
    }
    if (shows.length) dblog('ok', `${artist}: +${shows.length} shows (Bandsintown fallback)`);
    return shows;
  } catch(e) {
    // Network-level block ("Failed to fetch") — BIT is unreachable, stop trying
    const isNetBlock = e.message?.includes('Failed to fetch') ||
                       e.message?.includes('NetworkError') ||
                       e.message?.includes('net::') ||
                       e.name === 'TypeError';
    if (isNetBlock) {
      window._bitBlocked = true;
      dblog('warn', 'BIT API: network blocked — disabling Bandsintown for this session');
    }
    return [];
  }
}
