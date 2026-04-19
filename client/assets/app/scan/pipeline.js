'use strict';

async function fetchAll(forceRefresh = false) {
  if (!API_KEY || !ARTISTS.length) { openSettings(); return; }
  scanAborted = false;

  document.getElementById('loadbar').style.display = 'block';
  document.getElementById('hd-progress').style.display = '';
  document.getElementById('stop-btn').style.display = '';
  /* refresh-btn removed */
  document.getElementById('pulse').className = 'pulse';

  if (!dbgVisible) toggleDbg();
  const mode = forceRefresh ? 'FORCE-INCREMENTAL (diffs new shows vs cache)' : 'SMART (per-artist 24h cache)';
  dblog('info', `Scan started — ${mode} — key: …${API_KEY.slice(-6)}, artists: ${ARTISTS.length}`);

  // ── Keep stale data visible while the new scan runs ─────────────
  // Instead of wiping concerts[] immediately (which triggers showOnboard() on
  // the first render when new data hasn't arrived yet), we hold onto the old
  // arrays. New results are pushed into the same arrays progressively, so the
  // calendar/map always has something to show. _staleCount marks how many of
  // the entries are "old" — we can strip them at the end once fresh data is in.
  const _staleCount = concerts.length;
  const _staleFestCount = festivals.length;
  if (forceRefresh) {
    concerts = []; festivals = [];
  }
  // _scanActive tells renderCalendar/renderMxCalendar not to call showOnboard()
  // even if concerts[] happens to be empty (e.g. between clearing stale and
  // receiving first fresh results).
  window._scanActive = true;
  if (forceRefresh) fetchErrors = {};

  const total = ARTISTS.length;
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  const cHash = countryHash();

  // Shared counters — safe to mutate in JS single-threaded event loop
  const C = { cached: 0, fresh: 0, error: 0, done: 0, skipped: 0, geoSweep: 0, bit: 0 };
  let baseSleep = 750;
  let consecErrors = 0;

  // ── Global rate limiter + proxy rotation on 429 ──────────────────
  const MIN_GAP_MS = 750;  // 80 req/min baseline
  let lastRequestAt = 0;
  let consecutive429 = 0;
  const PROXY_ROTATION = ['auto', 'corsproxy', 'allorigins', 'none'];

  async function rateLimitedWait() {
    const now = Date.now();
    const gap = now - lastRequestAt;
    if (gap < MIN_GAP_MS) await sleep(MIN_GAP_MS - gap);
    lastRequestAt = Date.now();
  }
  window._rateLimitedWait = rateLimitedWait;

  window._onTm429 = () => {
    consecutive429++;
    const pause = Math.min(5000 * Math.pow(2, Math.floor((consecutive429 - 1) / 3)), 60000);
    dblog('warn', `429 ×${consecutive429} — cooling down ${Math.round(pause/1000)}s`);
    lastRequestAt = Date.now() + pause;
    baseSleep = Math.min(baseSleep * 1.3, 3000);
  };

  // Hard quota exhaustion detection.
  // A hard-quota 429 returns in <15ms (gateway rejects at edge without routing).
  // A burst-rate-limit 429 takes 100-400ms. We distinguish by response latency.
  //
  // Key rotation strategy: on the SECOND instant 429 we mark the current key
  // exhausted and try the next key in TM_KEYS[]. Scan continues uninterrupted.
  // Only if ALL keys are exhausted do we stop and show the quota modal.
  window._onTmHardQuota = () => {
    // A hard-quota 429 arrives in <15ms — TM's gateway edge-rejects without routing.
    // This is unmistakable: corsproxy normal responses are 250-800ms (see log).
    // No need to wait for a second confirmation. Rotate immediately on first hit.
    if (scanAborted) return;
    if (SERVER_MANAGED_TICKETMASTER) {
      scanAborted = true;
      window._scanActive = false;
      window._hardQuotaHit = true;
      document.getElementById('stop-btn').style.display = 'none';
      const nowUTC = new Date();
      const midnightUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() + 1));
      const hoursUntilReset = Math.ceil((midnightUTC - nowUTC) / 3600000);
      const resetStr = hoursUntilReset <= 1 ? 'in < 1 hour' : `in ~${hoursUntilReset} hours`;
      dblog('error', `Ticketmaster server quota exhausted - aborting. Resets midnight UTC (${resetStr}).`);
      setStatus(`Ticketmaster server quota exhausted - ${concerts.length} shows found`, false);
      showQuotaModal(resetStr, concerts.length + festivals.length);
      return;
    }

    dblog('warn', `⛔ Hard quota on key ..${API_KEY.slice(-6)} — rotating now`);

    // Mark current key exhausted so it is skipped for the rest of the session
    if (TM_KEYS[_activeKeyIdx]) TM_KEYS[_activeKeyIdx].exhausted = true;

    const nextIdx = TM_KEYS.findIndex((k, i) => i !== _activeKeyIdx && !k.exhausted);

    if (nextIdx >= 0) {
      // Switch to next key — no interruption to the scan
      _activeKeyIdx = nextIdx;
      API_KEY = TM_KEYS[nextIdx].key;
      window._hardQuotaHit = false;
      window._tmReqCount = 0;
      localStorage.setItem('tt_key', API_KEY);
      const lbl = TM_KEYS[nextIdx].label || ('Key ' + (nextIdx + 1));
      dblog('info', `🔄 Rotated to ${lbl} (..${API_KEY.slice(-6)}) — scan continues`);
      setStatus(`🔄 Key rotated → ${lbl} · continuing scan…`, true);
      const apiInput = document.getElementById('api-input');
      if (apiInput) apiInput.value = API_KEY;
      refreshKeyPoolUI();
      // Brief pause so the new key doesn't get hit before the rotation is fully applied
      lastRequestAt = Date.now() + 1500;
    } else {
      // All keys exhausted — stop
      scanAborted = true;
      window._scanActive = false;
      window._hardQuotaHit = true;
      document.getElementById('stop-btn').style.display = 'none';
      const nowUTC = new Date();
      const midnightUTC = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() + 1));
      const hoursUntilReset = Math.ceil((midnightUTC - nowUTC) / 3600000);
      const resetStr = hoursUntilReset <= 1 ? 'in < 1 hour' : `in ~${hoursUntilReset} hours`;
      dblog('error', `⛔ All ${TM_KEYS.length} keys exhausted — aborting. Resets midnight UTC (${resetStr}).`);
      setStatus(`⛔ All keys exhausted · ${concerts.length} shows found · resets midnight UTC`, false);
      showQuotaModal(resetStr, concerts.length + festivals.length);
    }
  };

  window._onTmOk = () => {
    if (consecutive429 > 0) {
      consecutive429 = Math.max(0, consecutive429 - 1);
      baseSleep = Math.max(750, baseSleep * 0.95);
    }
  };

  window._onTmNet = null;
  window._onTmOk = () => {
    if (consecutive429 > 0) {
      consecutive429 = Math.max(0, consecutive429 - 1);
      baseSleep = Math.max(750, baseSleep * 0.95);
    }
  };
  netErrStreak = 0; netErrTotal = 0; circuitOpen = false;
  dbgBannerDismissed = false;
  window._tmReqCount = 0;
  window._hardQuotaHit = false; // reset hard-quota flag so new scan starts clean
  // Reset ETA rolling window — stale timestamps from a previous scan would skew the estimate
  updateProgress._times = [];
  // Reset map auto-fit so the new data gets a fresh fitBounds on first render
  _mapFirstFit = false;
  document.getElementById('dbg-banner')?.classList.remove('visible');

  try { await DB.get('artists', '__ping__'); } catch(e) {}

  async function waitIfCircuit() {
    if (!circuitOpen) return;
    dblog('warn', `⏸ Circuit open — pausing dispatch until network recovers (or Stop is pressed)`);
    setProgress('⏸ Network errors — paused. Check Debug Log or press Diagnose.', null);
    while (circuitOpen && !scanAborted) {
      await sleep(500);
    }
    if (!scanAborted) dblog('info', '▶ Resuming scan…');
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
    if (!scanAborted) { buildCalChips(); renderCalendar(); renderMap(); }
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
        }
        geoSweepCovered.add(artist); // mark as covered regardless of result count
      }
      if (!scanAborted) { buildCalChips(); renderCalendar(); renderMap(); }
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
    await waitIfCircuit();
    if (scanAborted) return;

    const idbKey = artist.toLowerCase().trim();

    // Smart scan: cache hit → no network at all
    if (!forceRefresh) {
      try {
        const cached = await DB.get('artists', idbKey);
        if (cached && (now - cached.ts) < TTL_ARTIST && cached.cHash === cHash) {
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
      await waitIfCircuit();
      if (scanAborted) return;
      await rateLimitedWait();  // global 4 req/s throttle
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
        C.fresh++; C.done++;
        consecErrors = Math.max(0, consecErrors - 1);
        // Recover baseSleep after success
        baseSleep = Math.max(130, baseSleep * 0.96);
        if (fetchErrors[artist]) { delete fetchErrors[artist]; updateErrorTab(); }
        // ── Progressive render: update calendar+map every time new shows found ──
        // This makes results appear as they stream in rather than all at once.
        // We throttle to once per 3 fresh artists (or whenever new shows land)
        // to avoid layout thrash while still feeling live.
        if (finalShows.length > 0 || C.fresh % 3 === 0) {
          buildCalChips(); renderCalendar(); renderMap();
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
          const wait = isNet    ? Math.min(baseSleep * 4 * attempt, 8000)
                     : is429   ? Math.min(3000 * Math.pow(2, attempt - 1), 20000)
                     : baseSleep * attempt;
          const reason = isNet ? 'network error' : is429 ? '429 rate limit' : e.message;
          dblog('warn', `"${artist}": ${reason} — attempt ${attempt}/${MAX_TRIES}, retry in ${Math.round(wait)}ms`);
          if (is429) window._onTm429?.();
          if (isNet) baseSleep = Math.min(baseSleep * 1.6, 900);
          await sleep(wait);
          if (scanAborted) return; // quota abort may have fired during the sleep
        } else {
          // Final attempt failed
          const lastErr = is429 ? '429' : isNet ? 'net' : isTimeout ? 'timeout' : e.message;
          dblog('error', `"${artist}": FAILED after ${MAX_TRIES} tries — ${lastErr}`);
          fetchErrors[artist] = { attempts: (fetchErrors[artist]?.attempts || 0) + MAX_TRIES, lastErr, resolved: false, pass: 'Pass1' };
          C.error++; C.done++; consecErrors++;

          // Hard backoff on consecutive errors
          if (consecErrors >= 6) {
            const pause = Math.min(consecErrors * 2000, 20000);
            dblog('warn', `${consecErrors} consecutive errors — pausing ${pause/1000}s before next artist`);
            baseSleep = Math.min(baseSleep * 2, 900);
            await sleep(pause);
            consecErrors = 0;
          }
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
    buildCalChips(); renderCalendar(); renderMap();
  }

  // ── PASS 1: concurrent batch dispatch ─────────────────────────────
  // CONCURRENCY=1 — TM limit is 100 req/min, no benefit to parallelism
  const CONCURRENCY = 1;
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
        await rateLimitedWait();
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
  window._rateLimitedWait = null;  // cleanup
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
  buildCalChips(); renderCalendar(); renderMap();
}

// ── ERROR TAB ────────────────────────────────────────────────────
function updateErrorTab() {
  const errors = Object.entries(fetchErrors).filter(([, v]) => !v.resolved);
  const tabBtn = document.getElementById('tab-errors');
  const errList = document.getElementById('err-list');
  const subEl = document.getElementById('err-pane-sub');

  if (!tabBtn) return;

  if (!errors.length) {
    tabBtn.style.display = 'none';
    if (errList) errList.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">No errors 🎉</div>';
    return;
  }

  // Show tab with count badge
  tabBtn.style.display = '';
  tabBtn.textContent = `⚡ Errors · ${errors.length}`;

  if (subEl) subEl.textContent = `${errors.length} artist${errors.length > 1 ? 's' : ''} failed after all retries`;

  if (!errList) return;
  const frag = document.createDocumentFragment();
  errors.forEach(([artist, info]) => {
    const row = document.createElement('div');
    row.className = 'err-row';
    row.id = `err-row-${CSS.escape(artist)}`;

    const errLabel = info.lastErr === '429'
      ? '429 rate limited'
      : info.lastErr === 'timeout'
        ? '⏱ timeout'
        : `HTTP ${info.lastErr}`;

    row.innerHTML = `
      <div class="err-artist">
        <div class="err-artist-name">${artist}</div>
        <div class="err-reason">${errLabel} · ${info.attempts} attempts · ${info.pass || ''}</div>
      </div>
      <span class="err-count">${info.attempts}×</span>
      <button class="err-retry-btn" onclick="retrySingleArtist('${artist.replace(/'/g, "\\'")}')">↺ Retry</button>`;
    frag.appendChild(row);
  });
  errList.innerHTML = '';
  errList.appendChild(frag);
}

async function retrySingleArtist(artist) {
  if (!API_KEY) return;
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  const cHash = countryHash();
  const idbKey = artist.toLowerCase().trim();

  // Update UI
  const row = document.getElementById(`err-row-${CSS.escape(artist)}`);
  if (row) {
    row.style.opacity = '.4';
    const btn = row.querySelector('.err-retry-btn');
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
  }
  setStatus(`Retrying ${artist}…`, false);

  try {
    const shows = await fetchConcerts(artist, today);
    let finalShows = shows;
    if (!shows.length) finalShows = await fetchBIT(artist, today);
    const upcoming = finalShows.filter(s => s.date >= today);
    concerts.push(...upcoming);
    concerts = deduplicateConcerts(concerts);
    DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
    delete fetchErrors[artist];
    dblog('ok', `Manual retry: "${artist}" succeeded — ${upcoming.length} shows`);
    setStatus(`✓ ${artist}: ${upcoming.length} shows`, true);
    persistData();
    buildCalChips(); renderCalendar(); renderMap();
  } catch(e) {
    if (fetchErrors[artist]) {
      fetchErrors[artist].attempts++;
      fetchErrors[artist].lastErr = e.message;
    }
    dblog('error', `Manual retry: "${artist}" still failing — ${e.message}`);
    setStatus(`⚠ ${artist}: ${e.message}`, false);
    if (row) row.style.opacity = '1';
  }
  updateErrorTab();
}

async function retryAllErrors() {
  const toRetry = Object.keys(fetchErrors).filter(a => !fetchErrors[a].resolved);
  for (const artist of toRetry) {
    await retrySingleArtist(artist);
    await sleep(500);
  }
}

// ── QUOTA MODAL ────────────────────────────────────────────────────
function refreshKeyPoolUI() {
  const container = document.getElementById('key-pool-list');
  if (!container) return;
  container.innerHTML = '';
  if (SERVER_MANAGED_TICKETMASTER) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;border:1px solid var(--accent);background:rgba(200,255,95,.08);margin-bottom:6px;font-family:"DM Mono",monospace;font-size:.68rem;';
    row.innerHTML = '<div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--accent);"></div>' +
      '<span style="flex:1;color:var(--text)">Server-managed Ticketmaster pool</span>' +
      '<span style="font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid var(--accent);color:var(--accent);background:rgba(200,255,95,.08)">SERVER</span>';
    container.appendChild(row);

    const note = document.createElement('div');
    note.style.cssText = 'font-size:.58rem;color:var(--muted2);line-height:1.45;';
    note.textContent = 'Shared deployments keep Ticketmaster keys on the backend. End users scan without seeing or storing those keys in the browser.';
    container.appendChild(note);
    return;
  }
  TM_KEYS.forEach((k, i) => {
    const isActive = i === _activeKeyIdx;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--s2);margin-bottom:4px;font-family:"DM Mono",monospace;font-size:.68rem;';
    if (isActive) row.style.borderColor = 'var(--accent)';

    const dot = document.createElement('div');
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' +
      (k.exhausted ? '#ff4444' : isActive ? 'var(--accent)' : '#555') + ';';

    const label = document.createElement('span');
    label.style.cssText = 'flex:1;color:' + (isActive ? 'var(--accent)' : k.exhausted ? '#888' : 'var(--text)') + ';';
    label.textContent = (k.label || ('Key ' + (i+1))) + ' — ..' + k.key.slice(-8);

    const badge = document.createElement('span');
    const badgeStyle = isActive
      ? 'color:var(--accent);border-color:var(--accent);background:rgba(200,255,95,.08)'
      : k.exhausted
        ? 'color:#ff6b6b;border-color:#ff4444;background:rgba(255,68,68,.08)'
        : 'color:#888;border-color:#444;background:transparent';
    badge.style.cssText = 'font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid;' + badgeStyle;
    badge.textContent = isActive ? 'ACTIVE' : k.exhausted ? 'EXHAUSTED' : 'READY';

    const del = document.createElement('button');
    del.style.cssText = 'background:none;border:none;color:#555;cursor:pointer;font-size:.8rem;padding:0 2px;line-height:1;';
    del.textContent = 'x';
    del.title = 'Remove this key';
    del.onclick = () => {
      if (TM_KEYS.length <= 1) { softNotice('Keep at least one API key.'); return; }
      TM_KEYS.splice(i, 1);
      if (_activeKeyIdx >= TM_KEYS.length) _activeKeyIdx = 0;
      API_KEY = TM_KEYS[_activeKeyIdx].key;
      localStorage.setItem('tt_key', API_KEY);
      persistSettings();
      refreshKeyPoolUI();
    };

    row.appendChild(dot); row.appendChild(label); row.appendChild(badge); row.appendChild(del);
    container.appendChild(row);
  });

  const addRow = document.createElement('div');
  addRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
  addRow.innerHTML = '<input id="new-pool-key" type="password" placeholder="Paste new Consumer Key..."' +
    ' style="flex:1;font-family:\'DM Mono\',monospace;font-size:.72rem;background:var(--s2);' +
    'border:1.5px solid var(--border2);border-radius:6px;padding:7px 10px;color:var(--text);outline:none;"' +
    ' autocomplete="off" spellcheck="false">' +
    '<button onclick="addKeyToPool()" style="font-family:\'DM Mono\',monospace;font-size:.7rem;font-weight:700;' +
    'padding:7px 14px;border-radius:6px;border:none;background:var(--accent);color:var(--bg);cursor:pointer;">+ Add</button>';
  container.appendChild(addRow);
}

function addKeyToPool() {
  const input = document.getElementById('new-pool-key');
  const key = input ? input.value.trim() : '';
  if (!key) return;
  if (TM_KEYS.some(k => k.key === key)) { softNotice('This key is already in the pool.', 'warn', { focusId: 'new-pool-key' }); return; }
  TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
  input.value = '';
  persistSettings();
  refreshKeyPoolUI();
  dblog('info', 'Key pool: added key ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys)');
}

function showQuotaModal(resetStr, totalFound) {
  const el = document.getElementById('quota-reset-str');
  const cnt = document.getElementById('quota-found-count');
  const title = document.getElementById('quota-title');
  const subtitle = document.getElementById('quota-subtitle');
  const newKeyBlock = document.getElementById('quota-new-key-block');
  const getLink = document.getElementById('quota-get-link');
  if (title) title.textContent = SERVER_MANAGED_TICKETMASTER ? 'Ticketmaster Server Quota Exhausted' : 'API Key Quota Exhausted';
  if (subtitle) {
    subtitle.innerHTML = SERVER_MANAGED_TICKETMASTER
      ? 'The shared Ticketmaster key pool for this deployment is exhausted. Browsing still works, but new scans need to wait until <strong>midnight UTC</strong> or until the server gets more quota.'
      : 'Ticketmaster is rejecting every request instantly (&lt;15ms), which means the daily hard quota for this API key has been reached. Waiting and retrying will not help - the counter resets at <strong>midnight UTC</strong>.';
  }
  if (newKeyBlock) newKeyBlock.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (getLink) getLink.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (el) el.textContent = resetStr || 'at midnight UTC';
  if (cnt) cnt.textContent = totalFound || (concerts.length + festivals.length);
  document.getElementById('quota-bg').classList.add('open');
}

function closeQuotaModal() {
  document.getElementById('quota-bg').classList.remove('open');
  buildCalChips(); renderCalendar(); renderMap();
}

function quotaApplyNewKey() {
  if (SERVER_MANAGED_TICKETMASTER) {
    softNotice('Ticketmaster keys are managed by the server for this deployment.');
    return;
  }
  const input = document.getElementById('quota-key-input');
  const key = input ? input.value.trim() : '';
  if (!key) return;

  const existing = TM_KEYS.findIndex(k => k.key === key);
  if (existing >= 0) {
    TM_KEYS[existing].exhausted = false;
    _activeKeyIdx = existing;
  } else {
    TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
    _activeKeyIdx = TM_KEYS.length - 1;
  }
  API_KEY = key;
  localStorage.setItem('tt_key', key);
  const apiInput = document.getElementById('api-input');
  if (apiInput) apiInput.value = key;
  window._hardQuotaHit = false;
  window._tmReqCount = 0;
  persistSettings();
  refreshKeyPoolUI();
  closeQuotaModal();
  dblog('info', 'Key pool: activated ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys) — restarting scan');
  saveAndFetch(false);
}

function setProgress(msg, pct) {
  document.getElementById('loadbar-fill').style.width = pct + '%';
  document.getElementById('hd-progress').textContent = msg;
  if (!scanAborted && msg) document.getElementById('hd-msg').textContent = msg;
}

function setStatus(msg, live) {
  document.getElementById('hd-msg').textContent = msg;
  document.getElementById('pulse').className = 'pulse' + (live ? ' live' : '');
}

function softNotice(msg, tone = 'warn', opts = {}) {
  const text = String(msg || '');
  const live = tone === 'ok';
  setStatus(text, live);
  if (typeof dblog === 'function') {
    const level = tone === 'error' ? 'error' : live ? 'ok' : 'warn';
    dblog(level, text);
  }
  const focusId = opts && opts.focusId;
  if (focusId) {
    const el = document.getElementById(focusId);
    if (el && typeof el.focus === 'function') el.focus();
  }
}

// ── DISAMBIGUATION GUARD ─────────────────────────────────────────
// Short/ambiguous artist names (≤3 chars or single common word) must only
// match via TM attractions (confirmed performer slot), never via event name.
// This prevents "Yes" → "Yes, concert", "Air" → "Air Guitar Night" etc.
