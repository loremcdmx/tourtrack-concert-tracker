'use strict';

async function fetchAll(forceRefresh = false) {
  if (!API_KEY || !ARTISTS.length) { openSettings(); return; }
  setScannedArtists(ARTISTS);
  if (!TRACKED_ARTISTS.length) setTrackedArtists(ARTISTS);

  const scan = beginScanRun(forceRefresh);
  const {
    staleConcertCount: _staleCount,
    staleFestivalCount: _staleFestCount,
    total,
    now,
    today,
    cHash,
  } = scan;
  const C = createScanCounters();
  const runtime = installScanRuntime(createScanRuntime());

  // Keep stale data visible while the new scan runs.
  // Instead of wiping concerts[] immediately (which triggers showOnboard() on
  // the first render when new data has not arrived yet), we hold onto the old
  // arrays. New results are pushed into the same arrays progressively, so the
  // calendar/map always has something to show. The stale counts mark how many
  // entries are old so they can be stripped once fresh data is in.

  try { await DB.get('artists', '__ping__'); } catch (e) {}
  if (typeof hydrateArtistKnowledge === 'function') {
    try {
      setProgress('Loading artist knowledge…', 1);
      await hydrateArtistKnowledge(ARTISTS);
    } catch (e) {
      dblog('warn', `Artist knowledge hydrate failed: ${e.message}`);
    }
  }
  // ════════════════════════════════════════════════════════════════
  // PHASE 0: BIT PRE-FLIGHT
  // Run all artists through Bandsintown in parallel before touching TM.
  // This is cheap (free API, no rate limit, CORS-friendly) and gives us:
  //   1. Immediate show data for artists who appear on BIT
  //   2. A "dormant" signal for artists with 0 BIT events, which we can
  //      combine with TM's upcomingEvents._total to skip TM entirely
  // Skip in force-refresh mode since the user explicitly wants fresh TM data.
  // ════════════════════════════════════════════════════════════════
  let bitResults = new Map(); // artist → shows[]
  if (!forceRefresh && !scanAborted) {
    setProgress('Phase 0: BIT pre-flight…', 2);
    bitResults = await bitPreFlightScan(ARTISTS);
    // Add BIT shows immediately so the UI can show partial results quickly
    for (const [artist, shows] of bitResults) {
      if (shows.length) {
        concerts.push(...shows.filter(s => s.date >= today));
        C.bit++;
      }
    }
    if (!scanAborted) scheduleUiRefresh();
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 0.5: INVERTED GEO SWEEP
  // For geographically focused users (≤5 non-large-market countries),
  // sweep ALL music events in those countries rather than querying per-artist.
  // This turns N_artists requests into N_pages requests — typically 10–20× fewer.
  // Artists found in the sweep are marked as covered; their per-artist TM
  // queries are skipped. Artists NOT found in the sweep still need TM queries
  // (the artist might have events that TM didn't return in the geo sweep, e.g.
  // multi-country artists whose MX date isn't the right start window).
  // ════════════════════════════════════════════════════════════════
  const geoSweepCovered = new Set(); // artists whose shows came from geo sweep
  if (!scanAborted && shouldUseGeoSweep()) {
    setProgress(`Phase 0.5: Geo sweep (${[...includeCountries].join(',')})…`, 18);
    try {
      const geoShows = await geoSweepScan(today);
      for (const [artist, shows] of geoShows) {
        const upcoming = shows.filter(s => s.date >= today);
        if (upcoming.length) {
          // Replace any BIT shows for this artist with the richer TM geo shows
          concerts = concerts.filter(s => !(s.artist === artist && s._src === 'bit'));
          concerts.push(...upcoming);
          C.geoSweep++;
          if (typeof recordConcertCoverageKnowledge === 'function') {
            recordConcertCoverageKnowledge(artist, upcoming, 'geo-sweep').catch(() => {});
          }
        }
        geoSweepCovered.add(artist); // mark as covered regardless of result count
      }
      if (!scanAborted) scheduleUiRefresh();
    } catch(e) {
      dblog('warn', `Geo sweep failed: ${e.message} — falling back to per-artist TM scan`);
    }
  }

  // ════════════════════════════════════════════════════════════════
  // PHASE 1: PER-ARTIST TM SCAN (only for artists not already covered)
  // ════════════════════════════════════════════════════════════════

  // Determine which artists still need a TM query.
  // An artist can be skipped if:
  //   (a) Geo sweep already confirmed their shows in the target region, OR
  //   (b) BIT says 0 events AND their TM attraction cache says 0 upcoming
  //       (two independent sources agreeing they're not touring = high confidence)
  // Artists with uncertain status (BIT blocked, new artists not in cache) still
  // go through TM to ensure nothing is missed.
  function shouldSkipTM(artist) {
    if (geoSweepCovered.has(artist)) return true; // geo sweep covered this one

    // If BIT confirms they're not touring AND we have a TM totalUpcoming hint,
    // we can skip. We'll check totalUpcoming inside processArtist via the
    // attraction info cache, so here we just check BIT as a pre-filter.
    // We don't skip solely on BIT (some artists aren't on BIT but are on TM).
    return false;
  }

  // ── Per-artist task ─────────────────────────────────────────────────
  async function processArtist(artist) {
    // Phase 1a: skip artists already handled by geo sweep
    if (shouldSkipTM(artist)) {
      C.skipped++; C.done++;
      if (C.done % 5 === 0) updateProgress(C, total);
      return;
    }

    if (scanAborted) return;
    await waitForCircuitRecovery();
    if (scanAborted) return;

    const idbKey = artist.toLowerCase().trim();

    // Smart scan: cache hit → no network at all
    if (!forceRefresh) {
      try {
        const cached = await DB.get('artists', idbKey);
        const cacheTtl = cached ? artistCacheTTLForRecord(cached, today) : TTL_ARTIST;
        if (cached && (now - cached.ts) < cacheTtl && cached.cHash === cHash) {
          concerts.push(...cached.shows.filter(s => s.date >= today));
          C.cached++; C.done++;
          if (C.done % 5 === 0) updateProgress(C, total);
          return;
        }
      } catch(e) {}
    }

    // Force rescan: load old cached shows for incremental diff (only new shows fetched)
    let existingShows = null;
    if (forceRefresh) {
      try {
        const old = await DB.get('artists', idbKey);
        if (old?.shows?.length) existingShows = old.shows;
      } catch(e) {}
    }

    updateProgress(C, total);

    const MAX_TRIES = 3;
    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
      if (scanAborted) return;
      await waitForCircuitRecovery();
      if (scanAborted) return;
      await window._rateLimitedWait?.();
      if (scanAborted) return;  // quota abort may have fired during the wait
      try {
        const shows = await fetchConcerts(artist, today, existingShows);
        const finalShows = shows.length ? shows : await fetchBIT(artist, today);
        const upcomingFresh = finalShows.filter(s => s.date >= today);

        if (window._mergeMode) {
          // MERGE MODE: push fresh shows first, then re-add any baseline shows for
          // this artist whose dedup key is NOT covered by the fresh result set.
          // This means: if TM now shows 5 concerts and we had 3, we end up with
          // at least 5 (the 2 new ones are added). If TM shows 3 and we had 5,
          // we still end up with 5 (the 2 that disappeared from TM are kept).
          concerts.push(...upcomingFresh);
          const freshKeys = new Set(upcomingFresh.map(_concertKey));
          const artistBaseline = window._mergeBaseByArtist[(artist||'').toLowerCase()] || [];
          for (const old of artistBaseline) {
            if (old.date >= today && !freshKeys.has(_concertKey(old))) {
              concerts.push(old); // was in DB but not in fresh TM result → keep it
            }
          }
          // Update the baseline key set so subsequent artists don't re-add these
          for (const s of upcomingFresh) window._mergeBaseKeys.add(_concertKey(s));
        } else {
          concerts.push(...upcomingFresh);
        }
        DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
        if (typeof recordConcertCoverageKnowledge === 'function') {
          recordConcertCoverageKnowledge(
            artist,
            finalShows,
            forceRefresh ? 'concert-scan-force' : 'concert-scan-smart'
          ).catch(() => {});
        }
        C.fresh++; C.done++;
        noteArtistScanSuccess(runtime);
        if (fetchErrors[artist]) { delete fetchErrors[artist]; updateErrorTab(); }
        // ── Progressive render: update calendar+map every time new shows found ──
        // This makes results appear as they stream in rather than all at once.
        // We throttle to once per 3 fresh artists (or whenever new shows land)
        // to avoid layout thrash while still feeling live.
        if (finalShows.length > 0 || C.fresh % 3 === 0) {
          scheduleUiRefresh();
        }
        return;
      } catch(e) {
        const is429  = e.message === '429';
        const isNet  = e.isNet || e.message?.startsWith('net:');
        const isTimeout = e.message === 'timeout';

        // If the hard-quota flag was set during this attempt, stop retrying this
        // artist immediately — every further attempt is guaranteed to fail the same way.
        if (window._hardQuotaHit || scanAborted) {
          C.error++; C.done++;
          updateErrorTab();
          return;
        }

        if (attempt < MAX_TRIES) {
          const wait = getArtistRetryDelay(runtime, { isNet, is429 }, attempt);
          const reason = isNet ? 'network error' : is429 ? '429 rate limit' : e.message;
          dblog('warn', `"${artist}": ${reason} — attempt ${attempt}/${MAX_TRIES}, retry in ${Math.round(wait)}ms`);
          noteArtistRetry(runtime, { isNet, is429 });
          await sleep(wait);
          if (scanAborted) return; // quota abort may have fired during the sleep
        } else {
          // Final attempt failed
          const lastErr = is429 ? '429' : isNet ? 'net' : isTimeout ? 'timeout' : e.message;
          dblog('error', `"${artist}": FAILED after ${MAX_TRIES} tries — ${lastErr}`);
          fetchErrors[artist] = { attempts: (fetchErrors[artist]?.attempts || 0) + MAX_TRIES, lastErr, resolved: false, pass: 'Pass1' };
          C.error++; C.done++;
          await noteArtistFailure(runtime);
          updateErrorTab();
        }
      }
    }
  }

  // Smart scan: clear stale entries now that we're about to accumulate fresh ones.
  // This runs only once, right before the per-artist TM pass begins — by this point
  // BIT pre-flight and geo sweep have already populated concerts[] with fresh data,
  // so the user always sees something rather than a blank state.
  //
  // MERGE MODE EXCEPTION: in merge mode we deliberately keep the stale entries.
  // They are the preserved baseline the user asked to retain. Fresh results will
  // be merged IN (added on top) by injection point B below. The full dedup at
  // finalizeScan will clean up any true duplicates.
  if (!forceRefresh && !window._mergeMode && _staleCount > 0) {
    // Remove the old stale entries (they were at the front of the array).
    // Fresh results from BIT/geo sweep are already appended after them.
    concerts.splice(0, _staleCount);
    festivals.splice(0, _staleFestCount);
    scheduleUiRefresh();
  }

  // ── PASS 1: concurrent batch dispatch ─────────────────────────────
  // Two workers share the single `scanRateLimitedWait` gap (750ms default),
  // so total throughput stays under the TM 100 req/min ceiling while
  // overlapping network latency with rate-limit sleep on the other worker.
  const CONCURRENCY = 2;
  const t0 = Date.now();

  await new Promise(resolve => {
    let idx = 0;
    let running = 0;

    function dispatch() {
      while (running < CONCURRENCY && idx < total && !scanAborted) {
        const artist = ARTISTS[idx++];
        running++;
        processArtist(artist).then(() => {
          running--;
          if (idx < total && !scanAborted) dispatch();
          else if (running === 0) resolve();
        });
      }
      if ((running === 0 && idx >= total) || scanAborted) resolve();
    }

    dispatch();
  });

  const t1 = Date.now();
  dblog('info', `Pass 1: ${((t1-t0)/1000).toFixed(1)}s — ↩${C.cached} cache · ↻${C.fresh} fresh · ✗${C.error} failed · ⏭${C.skipped} geo-skipped · TM reqs: ${window._tmReqCount || 0}`);

  // ── PASS 2: quick retry of failed artists (no cooldown) ──────────
  const failedArtists = Object.keys(fetchErrors).filter(a => !fetchErrors[a]?.resolved);
  if (failedArtists.length && !scanAborted) {
    // Skip retry entirely if too many failures — likely a key ban, not worth waiting
    if (failedArtists.length > 20) {
      dblog('warn', `Pass 2 skipped — ${failedArtists.length} failures is too many (likely key ban), not retrying`);
    } else {
      dblog('info', `Pass 2: quick retry of ${failedArtists.length} failed artist${failedArtists.length !== 1 ? 's' : ''}`);
      setProgress(`↺ Quick retry: ${failedArtists.length} artists…`, 84);

      for (let fi = 0; fi < failedArtists.length; fi++) {
        if (scanAborted) break;
        await window._rateLimitedWait?.();
        const artist = failedArtists[fi];
        const idbKey = artist.toLowerCase().trim();
        setProgress(`↺ Retry [${fi+1}/${failedArtists.length}]: ${artist}`, 84 + (fi / failedArtists.length) * 10);
        try {
          const shows = await fetchConcerts(artist, today, null);
          const finalShows = shows.length ? shows : await fetchBIT(artist, today);
          const upcomingFresh = finalShows.filter(s => s.date >= today);
          if (window._mergeMode) {
            concerts.push(...upcomingFresh);
            const freshKeys = new Set(upcomingFresh.map(_concertKey));
            const artistBaseline = window._mergeBaseByArtist[(artist||'').toLowerCase()] || [];
            for (const old of artistBaseline) {
              if (old.date >= today && !freshKeys.has(_concertKey(old))) concerts.push(old);
            }
          } else {
            concerts.push(...upcomingFresh);
          }
          DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
          if (typeof recordConcertCoverageKnowledge === 'function') {
            recordConcertCoverageKnowledge(artist, finalShows, 'concert-scan-pass2').catch(() => {});
          }
          C.fresh++;
          delete fetchErrors[artist];
        } catch(e) {
          // Failed again — just leave it in the error tab, don't retry further
          if (fetchErrors[artist]) { fetchErrors[artist].attempts++; fetchErrors[artist].lastErr = e.message; fetchErrors[artist].pass = 'Pass2'; }
          dblog('warn', `Pass2: "${artist}" — ${e.message}`);
        }
        updateErrorTab();
      }

      const stillFailed = Object.keys(fetchErrors).filter(a => !fetchErrors[a]?.resolved);
      const recovered = failedArtists.length - stillFailed.length;
      dblog('info', `Pass 2 done: ${recovered} recovered · ${stillFailed.length} persistent`);
    }
  }

  dblog('info', `All done in ${((Date.now()-t0)/1000).toFixed(1)}s: ↩${C.cached} · ↻${C.fresh} · ✗${Object.keys(fetchErrors).length} errors · ⏭${C.skipped} skipped · 🎵${C.bit} BIT · 🗺${C.geoSweep} geo-sweep`);
  updateErrorTab();

  if (!scanAborted) {
    setProgress(`Checking festivals…`, 88);
    let festFromCache = false;
    if (!forceRefresh) {
      try {
        const fc = await DB.get('meta', 'festivals');
        if (fc && (now - fc.ts) < TTL_FEST && fc.cHash === cHash && fc.ver === FEST_VER) {
          festivals = deduplicateFestivals(fc.data);
          festFromCache = true;
          dblog('info', `Festivals: from cache (${festivals.length}), age ${Math.round((now-fc.ts)/3600e3)}h`);
        } else if (fc && fc.ver !== FEST_VER) {
          dblog('info', `Festivals: cache v mismatch (v${fc.ver||0}→v${FEST_VER}), re-fetching`);
        }
      } catch(e) {}
    }
    if (!festFromCache) {
      setProgress(`Fetching festivals…`, 90);
      try {
        await fetchFestivalsData();
        DB.put('meta', 'festivals', { ts: now, cHash, data: festivals, ver: FEST_VER }).catch(() => {});
      } catch(e) { dblog('error', `Festival fetch: ${e.message}`); }
    }
  }

  // Tear down the scan runtime only after the festival worker pool has fully
  // returned. Otherwise window._rateLimitedWait goes null mid-fetch and the
  // optional-chained `?.()` silently skips the gap, letting the workers spam
  // Ticketmaster at whatever rate the event loop can sustain.
  clearScanRuntime();

  concerts = deduplicateConcerts(concerts);
  dblog('info', `Done: ${concerts.length} concerts, ${festivals.length} festivals`);
  finalizeScan(scanAborted, C.cached, C.fresh);
}

function updateProgress(C, total) {
  const errNote  = C.error    ? ` · ✗${C.error}`    : '';
  const skipNote = C.skipped  ? ` · ⏭${C.skipped} skipped` : '';
  const bitNote  = C.bit      ? ` · 🎵${C.bit} BIT`  : '';
  const geoNote  = C.geoSweep ? ` · 🗺${C.geoSweep} geo` : '';

  // ── Self-correcting ETA using a 60-second rolling window ──────────────
  // Every call to updateProgress records a completion event in a ring buffer.
  // ETA = pending / (completions_in_last_60s / 60s)
  // This adapts automatically to cache hits (fast), rate-limit cooldowns (slow),
  // BIT skips (fast), and proxy overhead (slow).
  const now = Date.now();
  if (!updateProgress._times) updateProgress._times = [];
  updateProgress._times.push(now);
  // Trim events older than 60 seconds
  const cutoff = now - 60000;
  while (updateProgress._times.length && updateProgress._times[0] < cutoff)
    updateProgress._times.shift();

  let etaNote = '';
  const tmPending = total - C.done;
  if (tmPending > 5) {
    const windowEvents = updateProgress._times.length;
    if (windowEvents >= 3) {
      // Actual rate: events completed in the observation window
      const windowMs = now - updateProgress._times[0];
      const ratePerMs = windowEvents / Math.max(windowMs, 1000); // artists/ms
      const etaSec = Math.ceil(tmPending / (ratePerMs * 1000));
      if (etaSec < 3600) {
        // Format as Xm Ys when over 90s, otherwise just Xs
        etaNote = etaSec >= 90
          ? ` · ~${Math.floor(etaSec/60)}m ${etaSec%60}s left`
          : ` · ~${etaSec}s left`;
      }
    } else {
      // Not enough data yet — fall back to a conservative static estimate
      // (0.9s/artist is more honest than 0.75 before we have real numbers)
      const etaSec = Math.ceil(tmPending * 0.9);
      etaNote = etaSec < 3600
        ? ` · ~${Math.floor(etaSec/60)}m left`
        : '';
    }
  }
  setProgress(`[${C.done}/${total}] ↩${C.cached} cached · ↻${C.fresh} fresh${errNote}${skipNote}${bitNote}${geoNote}${etaNote}`, (C.done / total) * 80);
}
function finalizeScan(aborted, nCached = 0, nFresh = 0) {
  window._scanActive = false;  // allow showOnboard() again once scan is truly done

  // Merge mode cleanup: run a full dedup over the combined baseline+fresh array,
  // then clear the merge-mode flags so normal scans behave normally again.
  const wasMerge = !!window._mergeMode;
  if (wasMerge) {
    const before = concerts.length;
    concerts = deduplicateConcerts(concerts);
    const removed = before - concerts.length;
    dblog('info', `MERGE RESCAN complete — ${before} total shows after merge, ${removed} duplicates removed, ${concerts.length} final`);
    window._mergeMode = false;
    window._mergeBaseKeys = null;
    window._mergeBaseByArtist = null;
  }
  cacheTimestamp = Date.now();
  persistData();
  setProgress('', 100);
  const errCount = Object.keys(fetchErrors).length;
  const errNote = errCount ? ` · ✗${errCount} errors` : '';
  const cacheNote = nCached > 0 ? ` · ↩${nCached} cached · ↻${nFresh} fresh` : '';
  setStatus(
    (aborted ? '⚠ Partial — ' : '') +
    `${new Date(cacheTimestamp).toLocaleTimeString()} · ${concerts.length} shows · ${festivals.length} festivals${cacheNote}${errNote}`,
    !aborted
  );
  setTimeout(() => {
    document.getElementById('loadbar').style.display = 'none';
    document.getElementById('hd-progress').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'none';
    /* refresh-btn removed */
  }, 1200);
  updateErrorTab();
  scheduleUiRefresh();
}

// ── ERROR TAB ────────────────────────────────────────────────────
