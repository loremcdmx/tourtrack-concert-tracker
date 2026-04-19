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
const AMBIG_OVERRIDE = new Set(['yes','air','mos','run','now','war','rem']);
function artistIsAmbiguous(name) {
  const n = (name || '').trim().toLowerCase();
  if (n.length <= 2) return true;
  if (!n.includes(' ') && n.length <= 3) return true;
  if (AMBIG_OVERRIDE.has(n)) return true;
  return false;
}

// Cache TTL for attractionIds — they almost never change
const TTL_ATTRACTION    = 30 * 24 * 3600e3; // 30 days — IDs never change, cache aggressively
const TTL_UPCOMING      = 24 * 3600e3;       // 24h — re-check event count daily
const TTL_UPCOMING_ZERO = 48 * 3600e3;       // 48h — if 0 today, unlikely to tour overnight

// ── In-memory L1 cache for attraction info ───────────────────────
// IDB writes are async and fire-and-forget. Without this, a retry that fires
// within ~50ms of the original request will miss the IDB cache and make a
// second network call for the same artist. L1 is synchronous — zero latency.
const _attractionL1 = new Map(); // key → { id, totalUpcoming, ts }

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
        _attractionL1.set(key, result);
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
              _attractionL1.set(key, result);
              dblog('ok', `${artist}: count refresh → ${totalUpcoming ?? '?'} upcoming (id cached)`);
              return result;
            }
          } catch(e) {
            // Count refresh failed — fall through to return stale count rather than erroring
            dblog('warn', `${artist}: count refresh failed (${e.message}) — using stale count`);
          }
          // Return stale data rather than making a full re-fetch on network error
          const stale = { id: cached.id, totalUpcoming: cached.totalUpcoming ?? null };
          _attractionL1.set(key, stale);
          return stale;
        }
      }
    }
  } catch(e) {}

  // ── Full network fetch (cache miss or ID expired) ─────────────────
  const ambig = artistIsAmbiguous(artist);
  let id = null, totalUpcoming = null;

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
    // 3. Fallback: first result for unambiguous artists
    return (!ambig && items[0]) || null;
  };

  try {
    await (window._rateLimitedWait?.());
    const aUrl = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artist)}&classificationName=music&size=5`;
    const aRes = await apiFetch(aUrl, 6000);
    if (aRes.ok) {
      const aData = await aRes.json();
      const items = aData?._embedded?.attractions || [];
      let best = _findBest(items);

      // If no match with original name AND artist has diacritics, retry with ASCII version
      if (!best && artistAscii !== artist && artistAscii.trim()) {
        await (window._rateLimitedWait?.());
        const aUrl2 = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artistAscii)}&classificationName=music&size=5`;
        const aRes2 = await apiFetch(aUrl2, 6000);
        if (aRes2.ok) {
          const aData2 = await aRes2.json();
          const items2 = aData2?._embedded?.attractions || [];
          best = _findBest(items2);
          if (best) dblog('info', `${artist}: found via ASCII fallback "${artistAscii}" → ${best.name}`);
        }
      }

      if (best) {
        id = best.id;
        const ue = best.upcomingEvents;
        totalUpcoming = ue ? (ue._total ?? null) : null;
      } else {
        totalUpcoming = 0; // Not found on TM — no events possible
      }
    } else if (aRes.status === 429) {
      // Rate-limited on the attraction lookup itself — propagate as a thrown error
      // so processArtist's retry logic handles it, rather than silently returning null
      throw new Error('429');
    }
  } catch(e) {
    if (e.message === '429') throw e; // let caller handle 429
    dblog('warn', `${artist}: attraction lookup failed — ${e.message}`);
  }

  const record = { id, ts: now, tsCounted: now, name: artist, totalUpcoming };
  DB.put('attractions', key, record).catch(() => {});
  const result = { id, totalUpcoming };
  _attractionL1.set(key, result); // populate L1 so retries within same session are free
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
  const TM_MAX = 200;
  const MAX_PAGE = attractionId ? 5 : 2; // full pages for known attraction, limit for keyword
  const shows = [];

  // In incremental mode: build a set of already-known event IDs so we can diff
  const knownIds = existingShows ? new Set(existingShows.map(s => s.id)) : null;

  for (let page = 0; page < MAX_PAGE; page++) {
    if (scanAborted) break;
    await (window._rateLimitedWait?.());  // rate-limit every individual TM request

    const url = attractionId
      ? `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&attractionId=${attractionId}&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`
      : `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artist)}&classificationName=music&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;

    const r = await apiFetch(url);
    if (r.status === 429) throw new Error('429');
    if (r.status === 413) {
      // 413 = URL too long or bad chars — try ASCII-normalized name
      if (!attractionId) {
        const ascii = artist.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, '');
        if (ascii !== artist) {
          dblog('warn', `"${artist}": 413 — retrying with ASCII name "${ascii}"`);
          const urlAscii = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(ascii)}&classificationName=music&size=${TM_MAX}&page=${page}&sort=date,asc${apiCountryParam()}&startDateTime=${today}T00:00:00Z`;
          const r2 = await apiFetch(urlAscii);
          if (r2.ok) {
            const d2 = await r2.json();
            const evs2 = d2?._embedded?.events || [];
            for (const ev of evs2) {
              if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
              const date = ev.dates?.start?.localDate; if (!date) continue;
              const v = ev._embedded?.venues?.[0];
              const lat = parseFloat(v?.location?.latitude);
              const lng = parseFloat(v?.location?.longitude);
              const cc = v?.country?.countryCode || '';
              if (!countryAllowed(cc)) continue;
              shows.push({
                id: ev.id, artist, date,
                venue: v?.name || '', city: v?.city?.name || '',
                country: cc, state: v?.state?.stateCode || '',
                lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
                url: ev.url, eventName: ev.name || '', _src: 'tm',
                isFest: isFestivalLikeEvent(ev),
              });
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

    for (const ev of evs) {
      if (!attractionId && !artistMatch(artist, ev, ambig)) continue;
      const date = ev.dates?.start?.localDate; if (!date) continue;
      const v = ev._embedded?.venues?.[0];
      const lat = parseFloat(v?.location?.latitude);
      const lng = parseFloat(v?.location?.longitude);
      const cc = v?.country?.countryCode || '';
      if (!countryAllowed(cc)) continue;

      shows.push({
        id: ev.id, artist, date,
        venue: v?.name || '', city: v?.city?.name || '',
        country: cc, state: v?.state?.stateCode || '',
        lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
        url: ev.url, eventName: ev.name || '', _src: 'tm',
        isFest: isFestivalLikeEvent(ev),
      });
    }

    if (evs.length < TM_MAX) break; // last page — no need to fetch more

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
      const date = ev.datetime?.split('T')[0]; if (!date || date < today) continue;
      const v = ev.venue || {};
      const lat = parseFloat(v.latitude), lng = parseFloat(v.longitude);
      const cc = (v.country || '').slice(0,2).toUpperCase() || '';
      if (!countryAllowed(cc)) continue;
      shows.push({
        id: 'bit_' + ev.id, artist, date,
        venue: v.name || '', city: v.city || '',
        country: cc, state: v.region || '',
        lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
        url: ev.url || '', eventName: ev.title || ev.description || '', _src: 'bit',
      });
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


async function fetchFestivalsData() {
  const today = new Date().toISOString().split('T')[0];

  // ── Pass 1: User geo-aware sweep (covers whatever countries the user has selected) ──
  const geoTargets = (() => {
    if (countryMode === 'world') return ['']; // worldwide — no country param
    if (countryMode === 'include' && includeCountries.size > 0) {
      return [...includeCountries].map(cc => `&countryCode=${cc}`);
    }
    return [''];  // exclude mode: fetch globally, calendar geo-filter handles display
  })();

  const batches = [];
  for (let i = 0; i < geoTargets.length; i += 5) batches.push(geoTargets.slice(i, i + 5));

  let pagesDone = 0;
  for (const batch of batches) {
    if (scanAborted) break;
    for (const geo of batch) {
      if (scanAborted) break;
      for (let page = 0; page < 3; page++) {
        if (scanAborted) break;
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc${geo}&startDateTime=${today}T00:00:00Z`;
        try {
          const r = await apiFetch(url); if (!r.ok) break;
          const d = await r.json();
          const evs = d?._embedded?.events || [];
          if (!evs.length) break;
          ingestFestEvents(evs, null);
          pagesDone++;
          setProgress(`Festivals: user-geo sweep ${pagesDone} pages · ${festivals.length} found`, 87);
        } catch(e) { break; }
        await sleep(150);
      }
    }
  }

  // ── Pass 1b: Hardcoded western hemisphere + key global markets sweep ──
  // ALWAYS runs regardless of user geo settings — these regions have major festivals
  // that users want even when their concert filter is EU-only.
  const ALWAYS_SWEEP = ['US','MX','AR','BR','CL','CO','CA','AU','JP'].filter(
    cc => !includeCountries.has(cc) && countryMode !== 'world' // skip if already covered
  );
  for (const cc of ALWAYS_SWEEP) {
    if (scanAborted) break;
    for (let page = 0; page < 2; page++) {
      if (scanAborted) break;
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc&countryCode=${cc}&startDateTime=${today}T00:00:00Z`;
      try {
        const r = await apiFetch(url); if (!r.ok) break;
        const d = await r.json();
        const evs = d?._embedded?.events || [];
        if (!evs.length) break;
        ingestFestEvents(evs, null);
        pagesDone++;
        setProgress(`Festivals: global sweep ${cc} · ${festivals.length} found`, 89);
      } catch(e) { break; }
      await sleep(150);
    }
  }

  // ── Pass 2: KNOWN_FESTIVALS by exact name — worldwide, no geo filter ──
  // size=50 so we get the actual festival event not just parking/addon tickets
  for (let i = 0; i < KNOWN_FESTIVALS.length; i++) {
    if (scanAborted) break;
    const name = KNOWN_FESTIVALS[i];
    if (i % 10 === 0) setProgress(`Festivals: named lookup ${i+1}/${KNOWN_FESTIVALS.length} · ${festivals.length} found`, 91);
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}&size=50&sort=date,asc&startDateTime=${today}T00:00:00Z`;
      const r = await apiFetch(url); if (!r.ok) continue;
      const d = await r.json();
      ingestFestEvents(d?._embedded?.events || [], name);
    } catch(e) {}
    await sleep(80);
  }

  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog('info', `Festivals: ${festivals.length} after dedup (geo: ${geo_targets_count(geoTargets)}, always-sweep: ${ALWAYS_SWEEP.join(',')}, named: ${KNOWN_FESTIVALS.length})`);
}

function geo_targets_count(arr) { return arr.filter(s=>s).length || 'worldwide'; }


function ingestFestEvents(evs, hint) {
  // ── Music classification check ────────────────────────────────
  // TM events carry segment/genre classification. We want Music only.
  // If classification data exists and segment is NOT Music → skip.
  const isMusicEvent = (ev) => {
    const cls = ev.classifications?.[0];
    if (!cls) return true; // no classification data — allow (better safe than sorry)
    const seg = (cls.segment?.name || '').toLowerCase();
    if (seg && seg !== 'music') return false; // definitely not music
    return true;
  };

  // ── Blocklist: non-music events whose names contain "festival" ──
  // These slip through because "festival" is in the name, but they're
  // sports, food, film, theatre, comedy, fishing, etc.
  const NON_MUSIC_RE = /\b(seafood|food|beer|wine|chili|bbq|barbeque|barbecue|taco|burger|whiskey|whisky|vodka|rum|sake|craft\s*beer|oktoberfest|brew\s*fest|film\s*fest|film\s*festival|movie\s*fest|cinema\s*fest|comedy\s*fest|comedy\s*festival|stand[- ]?up\s*fest|theatre\s*fest|theater\s*fest|play\s*fest|improv\s*fest|art\s*fest(?!ival.*music)|arts\s*fest(?!.*music)|ballet\s*fest|dance\s*fest(?!.*music)|fishing\s*fest|fly\s*fish|hunting\s*fest|car\s*fest|auto\s*fest|motor\s*fest|boat\s*fest|air\s*show|balloon\s*fest|kite\s*fest|chess\s*fest|comic\s*(?:con|fest)|gaming\s*fest|esport|sports?\s*fest|soccer|hockey|baseball|basketball|football|rugby|tennis|golf\s*(?:open|classic|tournament)|yoga\s*fest|cannabis\s*fest|weed\s*fest|420\s*fest|psychedelic\s*(?:conference|summit)|haunted|halloween\s*(?:horror|haunt)|renaissance\s*faire|medieval\s*fest|pirate\s*fest|cowboy\s*fest|rodeo\s*fest|parade|marathon\s*(?:event|race)|triathlon|5k\s*(?:run|race)|dog\s*show|cat\s*show|flower\s*show|garden\s*fest|harvest\s*fest(?!.*music)|pumpkin\s*fest|strawberry\s*fest|cherry\s*fest|peach\s*fest|apple\s*fest|garlic\s*fest|lobster\s*fest|oyster\s*fest|shrimp\s*fest|pizza\s*fest|ice\s*cream\s*fest|chocolate\s*fest|vs\s+\w|\w+\s+vs\b)\b/i;

  // Names that generically say "festival" but are definitely not music concerts
  const GENERIC_NON_MUSIC = /\b(indoor\s+(?:ski|swim|sport)|aquatic|swimming|rowing|cycling\s+tour|horse\s+(?:show|race)|polo|lacrosse|wrestling|boxing\s+(?:event|show|card)|mma\s+(?:event|card)|ufc|bellator|cage|fight\s+(?:night|card)|concert\s+series\s+(?:ticket|pass))\b/i;

  // Broad patterns — but now gated by music classification check above
  const FEST_NAME_RE = /\bfest(ival)?\b|open\s+air\b|music\s+week\b|corona\s+capital|vans\s+warped|pa['''`]?l\s+norte|pal\s+norte|lollapalooza|coachella|primavera\b|vive\s+latino|tecate\b|estéreo\s+picnic|stereo\s+picnic|rock\s+(en|am|im|al|in\s+the)\b|rock\s+al\s+parque|afropunk|creamfields|tomorrowland|ultra\s+(music|miami|europe)|electric\s+daisy|day\s+\d\b|weekend\s+\d\b|day\s+one\b|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|nos\s+primavera|rock\s+werchter|flow\s+festival|way\s+out\s+west|parklife|latitude\b|wireless\b|field\s+day|all\s+points\s+east|burning\s+man|outside\s+lands|governors\s+ball|bonnaroo|acl\b|austin\s+city|splendour|fuji\s+rock|summer\s+sonic|bahidora|nrmal|bpm\s+festival|coordenada|cosquin\s+rock|rolling\s+loud|head\s+in\s+the\s+clouds|warped\s+tour/i;

  // Hint words — significant words from the festival name we searched for
  const hintWords = hint
    ? hint.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !/^(festival|music|arts|the|and|de|la|el)$/i.test(w))
    : [];

  for (const ev of evs) {
    const date = ev.dates?.start?.localDate; if (!date) continue;
    const v = ev._embedded?.venues?.[0];
    const lat = parseFloat(v?.location?.latitude), lng = parseFloat(v?.location?.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    const cc = v?.country?.countryCode || '';
    const nameL = (ev.name || '').toLowerCase();

    if (!isMusicEvent(ev)) continue;
    if (NON_MUSIC_RE.test(nameL) || GENERIC_NON_MUSIC.test(nameL)) continue;

    const isFestName = FEST_NAME_RE.test(nameL) || isFestivalLikeEvent(ev);
    const hintMatch = hintWords.length > 0 &&
      hintWords.filter(w => nameL.includes(w)).length >= Math.ceil(hintWords.length * 0.5);
    if (!isFestName && !hintMatch) continue;

    const displayName = (hint && hintMatch && hint.length <= (ev.name || '').length) ? hint : (ev.name || hint || 'Festival');
    const lineup = _festivalLineupFromEvent(ev, displayName);

    const imgs = ev.images || [];
    const img16x9 = imgs.find(i => i.ratio === '16_9' && i.width >= 640) ||
                    imgs.find(i => i.ratio === '16_9') ||
                    imgs.sort((a,b) => (b.width||0)-(a.width||0))[0];
    const imageUrl = img16x9?.url || '';

    festivals.push({
      id: ev.id,
      name: displayName,
      rawName: ev.name || displayName,
      date,
      venue: v?.name || '',
      city: v?.city?.name || '',
      country: cc,
      lat, lng,
      url: ev.url,
      lineup,
      imageUrl,
      sourceHints: _uniqueCI([hint, ev.name].filter(Boolean)),
    });
  }
}

function deduplicateFestivals(list) {
  const sorted = (list || [])
    .filter(f => f && f.date)
    .map(f => ({ ...f, lineup: _uniqueCI(f.lineup || []) }))
    .sort((a, b) =>
      (a.date || '').localeCompare(b.date || '') ||
      festCore(a.name || a.rawName || '').localeCompare(festCore(b.name || b.rawName || '')));

  const merged = [];
  for (const f of sorted) {
    const dup = merged.find(m =>
      (f.id && m.id && f.id === m.id) || _sameFestival(m, f));
    if (!dup) merged.push({ ...f });
    else Object.assign(dup, _mergeFestivalPair(dup, f));
  }
  return merged.map(f => {
    if (f.endDate && f.endDate < f.date) f.endDate = f.date;
    if (f.endDate === f.date) delete f.endDate;
    f.lineup = _uniqueCI(f.lineup || []);
    f.sourceHints = _uniqueCI(f.sourceHints || []);
    return f;
  });
}

function festCore(name) {
  return _festivalBaseName(name);
}

function geoDist(lat1, lng1, lat2, lng2) {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function _festivalNameScore(name) {
  const raw = _normText(name);
  const base = festCore(name);
  return (base ? 20 - Math.min(base.length, 20) : 0)
    + (FEST_EVENT_RE.test(raw) ? 6 : 0)
    - (TICKET_TIER_TEST_RE.test(name || '') ? 18 : 0)
    - (/\b(ticket|parking|camping|hotel|upgrade|bundle)\b/i.test(raw) ? 14 : 0);
}
function _sameFestival(a, b) {
  const coreA = festCore(a.name || a.rawName || '');
  const coreB = festCore(b.name || b.rawName || '');
  if (!coreA || !coreB) return false;
  if (coreA !== coreB && _tokenOverlap(coreA, coreB) < 0.65) return false;

  const diffDays = Math.abs((new Date((a.date || '') + 'T12:00:00') - new Date((b.date || '') + 'T12:00:00')) / 86400000);
  if (diffDays > 7) return false;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null && geoDist(a.lat, a.lng, b.lat, b.lng) <= 12) return true;
  if (venueA && venueB && (venueA === venueB || _tokenOverlap(venueA, venueB) >= 0.72)) return sameCountry;
  if (cityA && cityB && cityA === cityB && sameCountry) return true;
  return false;
}
function _mergeFestivalPair(a, b) {
  const primary = _festivalNameScore(b.name || '') > _festivalNameScore(a.name || '') ? b : a;
  const secondary = primary === a ? b : a;
  const startDate = [a.date, b.date].filter(Boolean).sort()[0] || a.date || b.date;
  const endDate = [a.endDate || a.date, b.endDate || b.date].filter(Boolean).sort().slice(-1)[0] || startDate;
  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    name: primary.name || secondary.name,
    rawName: primary.rawName || secondary.rawName || primary.name || secondary.name,
    date: startDate,
    endDate: endDate !== startDate ? endDate : undefined,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    imageUrl: primary.imageUrl || secondary.imageUrl || '',
    lineup: _uniqueCI([...(a.lineup || []), ...(b.lineup || [])]),
    sourceHints: _uniqueCI([...(a.sourceHints || []), ...(b.sourceHints || []), a.rawName, b.rawName].filter(Boolean)),
  };
}

function scoreFestivals() {
  // Non-linear play weight — four clear tiers with smooth intra-tier variation:
  //   0 plays   →  0     (not tracked)
  //   1         →  2     (in playlist once, casual)
  //   2–3       →  7–8   (неплохо — you know them)
  //   4–10      →  14–17 (отлично — real fan)
  //   11+       →  23+   (супер — in heavy rotation)
  // Clear jumps between tiers, log smoothing within 11+ to avoid Radiohead×142 crushing everything
  const playWeight = plays => {
    if (!plays || plays <= 0) return 0;
    if (plays === 1) return 2;
    if (plays <= 3)  return 5 + plays;                    // 2→7, 3→8
    if (plays <= 10) return 12 + plays * 0.5;             // 4→14, 10→17
    return 20 + Math.log2(plays);                         // 11→23.5, 20→24.3, 50→25.6, 142→27.1
  };

  const playsTotal = Object.values(ARTIST_PLAYS).reduce((s, v) => s + v, 0);
  const hasPlays = playsTotal > 0;

  const artistWeight = name => {
    const key = (name || '').toLowerCase();
    if (hasPlays) return playWeight(ARTIST_PLAYS[key] || 0);
    // Fallback: position-based weight (earlier in list = heavier)
    const idx = ARTISTS.findIndex(a => a.toLowerCase() === key);
    return idx >= 0 ? (ARTISTS.length - idx) : 0;
  };

  // First pass: compute raw scores
  for (const f of festivals) {
    const ll = _resolvedFestivalLineup(f);
    f.lineupResolved = ll;
    f.linkedShows = _festivalLinkedConcerts(f).length;
    const matched = [];
    let rawScore = 0;
    ARTISTS.forEach(artist => {
      if (!artist) return;
      const hit = _lineupArtistHit(artist, ll) || (!ll.length && _lineupArtistHit(artist, [f.name || '']));
      if (hit) {
        const w = artistWeight(artist);
        matched.push({ artist, plays: ARTIST_PLAYS[artist.toLowerCase()] || 0, weight: w });
        rawScore += w;
      }
    });
    if (matched.length >= 2) rawScore += matched.length * 1.5;
    // Sort matched by weight desc (most-played first)
    f.matched = matched.sort((a, b) => b.weight - a.weight);
    f._rawScore = rawScore;
  }

  // Second pass: normalise scores to 0–100
  const maxRaw = Math.max(...festivals.map(f => f._rawScore || 0), 1);
  for (const f of festivals) {
    f.score = Math.round((f._rawScore / maxRaw) * 100);
    delete f._rawScore;
  }

  festivals.sort((a, b) => (b.score - a.score) || a.date.localeCompare(b.date));
}

function deduplicateConcerts(list) {
  return _deduplicateConcerts(list, false);
}

function _concertScore(c) {
  return (c.url ? 6 : 0)
    + (c.lat != null && c.lng != null ? 4 : 0)
    + (_venueCore(c.venue || '').length ? 3 : 0)
    + (_cityCore(c.city || '').length ? 2 : 0)
    + (_normalizedUrlKey(c.url).length ? 1 : 0)
    + ((c.eventName || '').length > (c.artist || '').length ? 1 : 0)
    + (c.isFest ? 1 : 0);
}
function _sameConcert(a, b, aggressive) {
  if (_normText(a.artist) !== _normText(b.artist) || a.date !== b.date) return false;

  const urlA = _normalizedUrlKey(a.url);
  const urlB = _normalizedUrlKey(b.url);
  if (urlA && urlB && urlA === urlB) return true;
  if (a.id && b.id && a.id === b.id) return true;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (venueA && venueB && venueA === venueB && (!cityA || !cityB || cityA === cityB) && sameCountry) return true;
  if (venueA && venueB && sameCountry && (!cityA || !cityB || cityA === cityB) &&
      _tokenOverlap(venueA, venueB) >= (aggressive ? 0.58 : 0.72)) return true;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
    const dist = geoDist(a.lat, a.lng, b.lat, b.lng);
    if (dist <= (aggressive ? 8 : 3)) {
      if (!cityA || !cityB || cityA === cityB) return true;
      if (venueA && venueB && _tokenOverlap(venueA, venueB) >= 0.45) return true;
    }
  }

  if (aggressive && cityA && cityB && cityA === cityB && sameCountry) {
    const eventOverlap = _tokenOverlap(a.eventName || a.venue, b.eventName || b.venue);
    if ((!venueA || !venueB || _tokenOverlap(venueA, venueB) >= 0.45) && eventOverlap >= 0.35) return true;
  }
  return false;
}
function _mergeConcertPair(a, b) {
  const primary = _concertScore(b) > _concertScore(a) ? b : a;
  const secondary = primary === a ? b : a;
  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    artist: primary.artist || secondary.artist,
    date: primary.date || secondary.date,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    state: primary.state || secondary.state || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    eventName: primary.eventName || secondary.eventName || '',
    isFest: !!(primary.isFest || secondary.isFest),
    _src: _uniqueCI([primary._src, secondary._src].filter(Boolean)).join('+'),
  };
}
function _deduplicateConcerts(list, aggressive) {
  const buckets = new Map();
  for (const c of list || []) {
    if (!c || !c.artist || !c.date) continue;
    const key = `${_normText(c.artist)}|${c.date}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...c });
  }

  const out = [];
  for (const group of buckets.values()) {
    group.sort((a, b) => _concertScore(b) - _concertScore(a));
    const merged = [];
    for (const c of group) {
      const dup = merged.find(m => _sameConcert(m, c, aggressive));
      if (!dup) merged.push(c);
      else Object.assign(dup, _mergeConcertPair(dup, c));
    }
    out.push(...merged);
  }
  return out.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    (a.artist || '').localeCompare(b.artist || '') ||
    (a.city || '').localeCompare(b.city || ''));
}

// ── visibleConcerts() ─────────────────────────────────────────────
// Central render-time filter for the concerts array.
// When showPossibleDupes is false (default), applies an aggressive third
// dedup pass on top of the two passes already baked into the array:
//   Key: artist|date|venue.slice(0,12)
// Any two entries sharing this key are treated as dupes — keep the one
// with a ticket URL, otherwise keep the first seen.
// This catches cases like "Ziggo Dome Hall A" vs "Ziggo Dome Club" that
// slip through the city-level second pass because the sub-venue names differ.
function visibleConcerts() {
  if (showPossibleDupes) return concerts;
  return _deduplicateConcerts(concerts, true);
}

function togglePossibleDupes() {
  showPossibleDupes = !showPossibleDupes;
  const btn = document.getElementById('dupes-toggle');
  if (btn) {
    btn.style.color         = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.borderColor   = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.background    = showPossibleDupes ? 'rgba(200,255,95,.08)' : '';
    btn.title = showPossibleDupes
      ? 'Showing possible duplicate entries — click to hide them again'
      : 'Possible duplicate entries hidden — click to show';
  }
  buildCalChips(); renderCalendar(); renderMap();
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
function flag(code) { return COUNTRY_MAP[code]?.f || code; }
function fmtDate(d) { return d ? new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''; }
function fmtDateRange(f) {
  if (!f.endDate || f.endDate === f.date) return fmtDate(f.date);
  const s = new Date(f.date+'T12:00:00'), e = new Date(f.endDate+'T12:00:00');
  const sm = s.toLocaleDateString('en-US',{month:'short'}), em = e.toLocaleDateString('en-US',{month:'short'});
  const sd = s.getDate(), ed = e.getDate(), ey = e.getFullYear();
  if (sm === em) return sm+' '+sd+'–'+ed+', '+ey;  // Jun 26–28, 2026
  return sm+' '+sd+'–'+em+' '+ed+', '+ey;          // Jun 30–Jul 2, 2026
}

// ── CALENDAR GEO FILTER (region-based) ───────────────────────────
