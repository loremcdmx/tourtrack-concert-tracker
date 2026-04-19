'use strict';

async function apiFetch(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  const short = url.replace(/apikey=[^&]+/, 'apikey=…').slice(0, 100);
  const t0 = Date.now();
  try {
    // Route through tmFetch so TM proxy (none/auto/corsproxy/allorigins/custom) is respected.
    // Note: when using a proxy the AbortSignal targets the proxy request, which is correct.
    const r = await tmFetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    const proxyNote = tmProxyWorking && tmProxyWorking !== 'direct' ? ` [via ${tmProxyWorking}]` : '';
    if (r.status === 200) {
      window._tmReqCount = (window._tmReqCount || 0) + 1;
      window._onTmOk?.();
      dblog('ok', `HTTP 200 (${ms2}ms)${proxyNote} [TM req #${window._tmReqCount}]`, short);
    }
    else if (r.status === 429) {
      // CRITICAL DISTINCTION: burst throttle vs daily quota exhaustion.
      //
      // A burst-rate-limit 429 takes 100-400ms because TM's server actually
      // processes the request before deciding to reject it. Waiting 5-10 seconds
      // and retrying is the correct response.
      //
      // A daily-quota-exhaustion 429 takes < 15ms because TM's gateway instantly
      // rejects the request at the network edge without routing it anywhere. The
      // key is at its hard daily limit — retrying in 5 seconds is pointless and
      // just wastes more of the quota you don't have. You need to wait until
      // midnight UTC when the counters reset.
      const isHardQuota = r.headers.get('x-tourtrack-tm-state') === 'all-keys-exhausted' || ms2 < 15;
      if (isHardQuota) {
        window._onTmHardQuota?.();
      } else {
        window._onTm429?.();
      }
      dblog('rate', `HTTP 429 ${isHardQuota ? '⛔ QUOTA EXHAUSTED' : 'rate-limited'} (${ms2}ms)`, short);
    }
    else                       dblog('warn', `HTTP ${r.status} (${ms2}ms)`, short);
    return r;
  } catch(e) {
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    if (e.name === 'AbortError') {
      dblog('timeout', `Timeout after ${ms2}ms — TM did not respond`, short);
      throw new Error('timeout');
    }
    // NET error — just log, don't rotate proxy (TM bans by API key, not IP — rotating doesn't help)
    const diagnosis = diagnoseNetworkError(e, url);
    dblog('net', `Network error after ${ms2}ms: ${diagnosis}`, short);
    // Rethrow as 'net' so processArtist can detect it separately from API errors
    const err = new Error('net:' + (e.message || 'Failed to fetch'));
    err.isNet = true;
    throw err;
  }
}

function countryAllowed(cc) {
  if (countryMode === 'world') return true;
  if (!cc) return true;
  return countryMode === 'include'
    ? (includeCountries.size === 0 || includeCountries.has(cc))
    : !excludeCountries.has(cc);
}

function apiCountryParam() {
  // TM Discovery API only supports a SINGLE countryCode value - comma-separated silently breaks.
  // For include-mode with exactly 1 country: pass it for server-side filtering.
  // For multiple countries or exclude mode: no param - fetch globally, filter client-side via countryAllowed().
  if (countryMode === 'include' && includeCountries.size === 1) {
    return '&countryCode=' + [...includeCountries][0];
  }
  return '';
}
