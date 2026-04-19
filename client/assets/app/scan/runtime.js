'use strict';

function createScanCounters() {
  return { cached: 0, fresh: 0, error: 0, done: 0, skipped: 0, geoSweep: 0, bit: 0 };
}

function beginScanRun(forceRefresh = false) {
  scanAborted = false;

  document.getElementById('loadbar').style.display = 'block';
  document.getElementById('hd-progress').style.display = '';
  document.getElementById('stop-btn').style.display = '';
  document.getElementById('pulse').className = 'pulse';

  if (!dbgVisible) toggleDbg();
  const mode = forceRefresh ? 'FORCE-INCREMENTAL (diffs new shows vs cache)' : 'SMART (per-artist 24h cache)';
  dblog('info', `Scan started - ${mode} - key: ..${API_KEY.slice(-6)}, artists: ${ARTISTS.length}`);

  const staleConcertCount = concerts.length;
  const staleFestivalCount = festivals.length;
  if (forceRefresh) {
    concerts = [];
    festivals = [];
    fetchErrors = {};
  }

  window._scanActive = true;
  updateProgress._times = [];
  _mapFirstFit = false;
  document.getElementById('dbg-banner')?.classList.remove('visible');

  return {
    staleConcertCount,
    staleFestivalCount,
    total: ARTISTS.length,
    now: Date.now(),
    today: new Date().toISOString().split('T')[0],
    cHash: countryHash(),
  };
}

function createScanRuntime() {
  return {
    baseSleep: 750,
    consecErrors: 0,
    minGapMs: 750,
    lastRequestAt: 0,
    consecutive429: 0,
  };
}

async function scanRateLimitedWait(runtime) {
  const gap = Date.now() - runtime.lastRequestAt;
  if (gap < runtime.minGapMs) await sleep(runtime.minGapMs - gap);
  runtime.lastRequestAt = Date.now();
}

function scanQuotaResetLabel() {
  const nowUTC = new Date();
  const midnightUTC = new Date(Date.UTC(
    nowUTC.getUTCFullYear(),
    nowUTC.getUTCMonth(),
    nowUTC.getUTCDate() + 1
  ));
  const hoursUntilReset = Math.ceil((midnightUTC - nowUTC) / 3600000);
  return hoursUntilReset <= 1 ? 'in < 1 hour' : `in ~${hoursUntilReset} hours`;
}

function noteTmRateLimit(runtime) {
  runtime.consecutive429++;
  const pause = Math.min(5000 * Math.pow(2, Math.floor((runtime.consecutive429 - 1) / 3)), 60000);
  dblog('warn', `429 x${runtime.consecutive429} - cooling down ${Math.round(pause / 1000)}s`);
  runtime.lastRequestAt = Date.now() + pause;
  runtime.baseSleep = Math.min(runtime.baseSleep * 1.3, 3000);
}

function noteTmRecovery(runtime) {
  if (runtime.consecutive429 > 0) {
    runtime.consecutive429 = Math.max(0, runtime.consecutive429 - 1);
    runtime.baseSleep = Math.max(750, runtime.baseSleep * 0.95);
  }
}

function resetScanDiagnostics() {
  netErrStreak = 0;
  netErrTotal = 0;
  circuitOpen = false;
  dbgBannerDismissed = false;
  window._tmReqCount = 0;
  window._hardQuotaHit = false;
}

function handleTmHardQuota(runtime) {
  if (scanAborted) return;

  if (SERVER_MANAGED_TICKETMASTER) {
    scanAborted = true;
    window._scanActive = false;
    window._hardQuotaHit = true;
    document.getElementById('stop-btn').style.display = 'none';
    const resetStr = scanQuotaResetLabel();
    dblog('error', `Ticketmaster server quota exhausted - aborting. Resets midnight UTC (${resetStr}).`);
    setStatus(`Ticketmaster server quota exhausted - ${concerts.length} shows found`, false);
    showQuotaModal(resetStr, concerts.length + festivals.length);
    return;
  }

  dblog('warn', `Hard quota on key ..${API_KEY.slice(-6)} - rotating now`);
  if (TM_KEYS[_activeKeyIdx]) TM_KEYS[_activeKeyIdx].exhausted = true;

  const nextIdx = TM_KEYS.findIndex((key, index) => index !== _activeKeyIdx && !key.exhausted);
  if (nextIdx >= 0) {
    _activeKeyIdx = nextIdx;
    API_KEY = TM_KEYS[nextIdx].key;
    window._hardQuotaHit = false;
    window._tmReqCount = 0;
    localStorage.setItem('tt_key', API_KEY);
    const label = TM_KEYS[nextIdx].label || ('Key ' + (nextIdx + 1));
    dblog('info', `Rotated to ${label} (..${API_KEY.slice(-6)}) - scan continues`);
    setStatus(`Key rotated -> ${label} - continuing scan...`, true);
    const apiInput = document.getElementById('api-input');
    if (apiInput) apiInput.value = API_KEY;
    refreshKeyPoolUI();
    runtime.lastRequestAt = Date.now() + 1500;
    return;
  }

  scanAborted = true;
  window._scanActive = false;
  window._hardQuotaHit = true;
  document.getElementById('stop-btn').style.display = 'none';
  const resetStr = scanQuotaResetLabel();
  dblog('error', `All ${TM_KEYS.length} keys exhausted - aborting. Resets midnight UTC (${resetStr}).`);
  setStatus(`All keys exhausted - ${concerts.length} shows found - resets midnight UTC`, false);
  showQuotaModal(resetStr, concerts.length + festivals.length);
}

function installScanRuntime(runtime) {
  resetScanDiagnostics();
  window._rateLimitedWait = () => scanRateLimitedWait(runtime);
  window._onTm429 = () => noteTmRateLimit(runtime);
  window._onTmOk = () => noteTmRecovery(runtime);
  window._onTmHardQuota = () => handleTmHardQuota(runtime);
  window._onTmNet = null;
  return runtime;
}

function clearScanRuntime() {
  window._rateLimitedWait = null;
}

async function waitForCircuitRecovery() {
  if (!circuitOpen) return;
  dblog('warn', 'Circuit open - pausing dispatch until network recovers (or Stop is pressed)');
  setProgress('Network errors - paused. Check Debug Log or press Diagnose.', null);
  while (circuitOpen && !scanAborted) {
    await sleep(500);
  }
  if (!scanAborted) dblog('info', 'Resuming scan...');
}

function noteArtistScanSuccess(runtime) {
  runtime.consecErrors = Math.max(0, runtime.consecErrors - 1);
  runtime.baseSleep = Math.max(130, runtime.baseSleep * 0.96);
}

function getArtistRetryDelay(runtime, state, attempt) {
  if (state.isNet) return Math.min(runtime.baseSleep * 4 * attempt, 8000);
  if (state.is429) return Math.min(3000 * Math.pow(2, attempt - 1), 20000);
  return runtime.baseSleep * attempt;
}

function noteArtistRetry(runtime, state) {
  if (state.is429) window._onTm429?.();
  if (state.isNet) runtime.baseSleep = Math.min(runtime.baseSleep * 1.6, 900);
}

async function noteArtistFailure(runtime) {
  runtime.consecErrors++;
  if (runtime.consecErrors < 6) return;
  const pause = Math.min(runtime.consecErrors * 2000, 20000);
  dblog('warn', `${runtime.consecErrors} consecutive errors - pausing ${pause / 1000}s before next artist`);
  runtime.baseSleep = Math.min(runtime.baseSleep * 2, 900);
  await sleep(pause);
  runtime.consecErrors = 0;
}
