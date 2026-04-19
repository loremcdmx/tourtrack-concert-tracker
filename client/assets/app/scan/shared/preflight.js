'use strict';

function stopScan() {
  scanAborted = true;
  window._scanActive = false;
  document.getElementById('stop-btn').style.display = 'none';
  setStatus('Stopped — showing partial results', false);
}

// ═══════════════════════════════════════════════════════════════
// BIT PRE-FLIGHT SCAN
// ═══════════════════════════════════════════════════════════════
// The key insight here is that Bandsintown is CORS-friendly, has no enforced
// rate limit for reasonable usage, and requires no API key. Instead of calling
// it only as a last-resort fallback after TM fails, we use it as an upfront
// oracle: run all artists in parallel BEFORE the TM scan, collect their shows
// directly, and use the results to decide who even needs a TM query at all.
//
// An artist that BIT says has 0 upcoming events almost certainly isn't touring.
// Combined with totalUpcoming===0 from TM's attraction data, this lets us skip
// the TM event fetch for those artists entirely, dramatically reducing quota use.
//
// Returns: Map<artistName, shows[]>  (empty array = confirmed not touring on BIT)
const TTL_BIT_PREFLIGHT = 12 * 3600e3; // 12h — tour status changes slowly

async function bitPreFlightScan(artists) {
  if (window._bitBlocked) {
    dblog('warn', 'BIT pre-flight: skipped (BIT is blocked this session)');
    return new Map();
  }

  const results = new Map(); // artist → shows[]
  const toCheck = [];

  // Load IDB cache first — avoids re-checking artists we already know about
  for (const artist of artists) {
    const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
    try {
      const cached = await DB.get('meta', cacheKey);
      if (cached && (Date.now() - cached.ts) < TTL_BIT_PREFLIGHT) {
        results.set(artist, cached.shows || []);
        continue;
      }
    } catch(e) {}
    toCheck.push(artist);
  }

  if (!toCheck.length) {
    const touring = [...results.values()].filter(s => s.length > 0).length;
    dblog('info', `BIT pre-flight: all ${artists.length} cached — ${touring} touring`);
    return results;
  }

  dblog('info', `BIT pre-flight: ${toCheck.length} to check (${results.size} cached) · concurrency=8`);
  setProgress(`BIT pre-flight: 0/${toCheck.length} checked…`, 5);

  const today = new Date().toISOString().split('T')[0];
  let checked = 0;
  let idx = 0;

  // Worker coroutine — each of the 8 runs independently until the queue is empty
  async function worker() {
    while (idx < toCheck.length && !scanAborted) {
      const artist = toCheck[idx++];
      const shows = await fetchBIT(artist, today).catch(() => []);
      results.set(artist, shows);

      // Persist to IDB so subsequent smart scans don't re-check
      const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
      DB.put('meta', cacheKey, { ts: Date.now(), shows }).catch(() => {});

      checked++;
      if (checked % 10 === 0 || checked === toCheck.length) {
        const touring = [...results.values()].filter(s => s.length > 0).length;
        setProgress(`BIT pre-flight: ${checked}/${toCheck.length} · ${touring} on tour`, Math.round(checked / toCheck.length * 18));
      }
    }
  }

  // 8 parallel workers — BIT handles this fine, no shared rate limiter needed
  await Promise.all(Array.from({ length: 8 }, worker));

  const touring = [...results.values()].filter(s => s.length > 0).length;
  const notTouring = results.size - touring;
  dblog('info', `BIT pre-flight done: ${touring} touring · ${notTouring} dormant · ${results.size} total`);
  return results;
}

// ═══════════════════════════════════════════════════════════════
// INVERTED GEO SWEEP
// ═══════════════════════════════════════════════════════════════
// The normal approach asks "what concerts does Artist X have?" for each artist,
// one by one. This inverted approach asks instead "what concerts are happening in
// Mexico (or wherever)?" and then matches those events against the artist list.
//
// Why this is much better for focused geographic searches:
//   Normal:  200 artists × 2 TM requests = 400 requests
//   Inverted: ~10–20 pages of all MX events = 10–20 requests → 95% fewer
//
// Activates automatically when countryMode='include' with ≤5 countries and none
// of them are large markets that would require hundreds of pages to sweep.
//
// Returns: Map<artistName, shows[]>

// Markets too large to sweep efficiently (10k+ events / year each)
const GEO_SWEEP_LARGE_MARKETS = new Set(['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'BR']);
const GEO_SWEEP_MAX_PAGES = 30; // safety cap: 30 pages × 200 events = 6000 events max per country

function shouldUseGeoSweep() {
  if (countryMode !== 'include') return false;
  if (includeCountries.size === 0 || includeCountries.size > 5) return false;
  // Skip if any of the selected countries is a large market
  for (const cc of includeCountries) {
    if (GEO_SWEEP_LARGE_MARKETS.has(cc)) return false;
  }
  return true;
}

async function geoSweepScan(today) {
  // Build a normalized alias index for exact performer-slot matches.
  const artistIndex = buildArtistAliasIndex(ARTISTS);
  const found = new Map(); // artist → shows[]

  dblog('info', `Geo sweep: scanning ${[...includeCountries].join(',')} for all music events, then matching ${ARTISTS.length} artists`);

  for (const cc of includeCountries) {
    if (scanAborted) break;
    let page = 0;
    let totalPages = null;

    while (page < GEO_SWEEP_MAX_PAGES && !scanAborted) {
      await (window._rateLimitedWait?.());
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&classificationName=music&countryCode=${cc}&size=200&page=${page}&sort=date,asc&startDateTime=${today}T00:00:00Z`;

      let evs = [];
      try {
        const r = await apiFetch(url);
        if (r.status === 429) { window._onTm429?.(); await sleep(6000); continue; }
        if (!r.ok) break;
        const d = await r.json();
        evs = d?._embedded?.events || [];

        // On first page, figure out how many total pages exist for logging
        if (page === 0 && d?.page) {
          totalPages = Math.ceil(d.page.totalElements / 200);
          dblog('info', `Geo sweep ${cc}: ${d.page.totalElements} total music events (${totalPages} pages)`);
        }
      } catch(e) {
        dblog('warn', `Geo sweep ${cc} p${page}: ${e.message}`);
        break;
      }

      // Match each event's performers against our artist list
      for (const ev of evs) {
        const date = ev.dates?.start?.localDate;
        if (!date || date < today) continue;

        const attractions = ev._embedded?.attractions || [];
        for (const attr of attractions) {
          const attrKey = _normText(attr.name || '');
          if (!artistIndex.has(attrKey)) continue; // not one of our artists

          const artist = artistIndex.get(attrKey);
          const show = buildConcertFromTicketmasterEvent(artist, ev, 'tm_geo', { country: cc });
          if (!show) continue;
          if (!found.has(artist)) found.set(artist, []);
          // Avoid duplicate events (same ID, same artist)
          const existing = found.get(artist);
          if (!existing.some(s => s.id === ev.id)) existing.push(show);
        }
      }

      const pageLabel = totalPages ? `${page + 1}/${totalPages}` : `${page + 1}`;
      setProgress(`Geo sweep ${cc} p${pageLabel}: ${found.size} artists found so far`, 20 + Math.round(page / GEO_SWEEP_MAX_PAGES * 30));

      if (evs.length < 200) break; // reached last page
      page++;
    }

    const cc_shows = [...found.values()].flat().filter(s => s.country === cc).length;
    dblog('ok', `Geo sweep ${cc} done: ${cc_shows} shows, ${page + 1} pages scanned`);
  }

  const totalFound = [...found.values()].flat().length;
  dblog('info', `Geo sweep complete: ${totalFound} shows across ${found.size} artists`);
  return found;
}
