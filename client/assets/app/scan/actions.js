'use strict';

function openScanLibrary() {
  openSettings();
  setSettingsTab('database');
}

function runScanAction(mode = 'smart') {
  if (mode === 'smart') return saveAndFetch(false);
  if (mode === 'replace') {
    const ok = confirm(
      'Replace current concert results?\n\n' +
      'This refreshes every artist from Ticketmaster and rebuilds the result set.\n' +
      'Old results are cleared before fresh ones come back.\n\n' +
      'Use Add-only refresh if you want to keep existing shows visible.'
    );
    if (!ok) return;
    return saveAndFetch(true);
  }
  if (mode === 'merge') {
    if (typeof commitScanInputs === 'function' && !commitScanInputs()) return;
    closeSettings();
    return mergeRescan();
  }
  if (mode === 'festivals') {
    if (typeof commitScanInputs === 'function') commitScanInputs({ requireArtists: false });
    closeSettings();
    return rescanFestsOnly();
  }
  return saveAndFetch(false);
}

// MERGE RESCAN
// ════════════════════════════════════════════════════════════════
//
// Difference from the other scan modes:
//
//   fetchAll(false)        Smart scan. Respects per-artist IDB TTL (3 days).
//                          Artists scanned recently are served from cache.
//                          Shows accumulate; stale entries trimmed at scan start.
//
//   fetchAll(true)         Force rescan. Ignores IDB cache, hits TM for everyone.
//                          CLEARS concerts[] before starting → blank UI during scan.
//
//                          cacheTimestamp, fetchErrors, etc.
//
//   mergeRescan()   ←THIS  Invalidates every IDB TTL (sets ts=0) so every artist
//                          misses the TTL check and gets a fresh TM query, BUT:
//                          · concerts[] is NEVER cleared — existing shows stay visible
//                          · per-artist: incoming fresh shows are MERGED with the old
//                            ones for that artist (union, not replace)
//                          · shows that disappeared from TM but were in the database
//                            are KEPT (you asked for additive-only)
//                          · deduplication runs at the end to remove true duplicates
//
// ════════════════════════════════════════════════════════════════
// Implementation strategy:
//
// 1. Invalidate IDB TTLs by rewriting ts=0 on all 'artists' store entries.
//    This forces every processArtist call to fall through the cache check and
//    make a live TM request, identical to force-refresh behaviour — except we
//    do NOT clear concerts[] beforehand.
//
// 2. Set window._mergeMode = true before calling fetchAll(false).
//    Three places inside fetchAll check this flag:
//
//    A) The stale-splice block (concerts.splice(0, _staleCount)) MUST be
//       skipped in merge mode, otherwise the existing concerts we want to
//       keep get deleted before any fresh data arrives.
//
//    B) The concerts.push(…finalShows) call in processArtist is replaced
//       by a merge push: for each artist, build a dedup-key Set from
//       incoming freshShows, then also push any baseline shows for that
//       artist whose key isn't already covered.
//
//    C) Pass-2 retry push also gets the same merge treatment.
//
// 3. finalizeScan runs deduplicateConcerts over the full merged array
//    (it already does this) and clears window._mergeMode.
// ════════════════════════════════════════════════════════════════

// Helper: canonical dedup key matching deduplicateConcerts() format
function _concertKey(c) {
  return `${_normText(c.artist)}|${c.date}|${_venueCore(c.venue) || _cityCore(c.city) || _normalizedUrlKey(c.url) || _normText(c.eventName)}`;
}

async function mergeRescan() {
  if (!API_KEY || !ARTISTS.length) { openSettings(); return; }

  if (!confirm(
    `Merge Rescan — refetch all ${ARTISTS.length} artists but keep current shows?\n\n` +
    '• Every artist cache is expired → all get fresh TM queries\n' +
    '• Existing concerts are preserved throughout the scan\n' +
    '• New shows found are added to the database (merge, not replace)\n' +
    '• No shows are deleted — only new ones added\n' +
    '• Duplicates removed automatically at the end\n\n' +
    'This will use Ticketmaster API quota. Continue?'
  )) return;

  dblog('info', `MERGE RESCAN start — ${concerts.length} shows in DB, ${ARTISTS.length} artists to re-fetch`);

  // Step 1: expire every per-artist IDB entry by setting ts=0.
  // The TTL check is:  (now - cached.ts) < artistCacheTTLForRecord(cached)
  // Setting ts=0 makes any freshness window fail immediately,
  // so processArtist falls through to a live TM fetch for every single artist.
  // We keep the .shows[] in each entry intact — processArtist uses them as
  // the "existingShows" diff base in force-refresh mode, but in smart mode
  // (which we use here) they're just ignored after the TTL miss. That's fine;
  // the merge logic below handles combining old + new shows independently.
  try {
    const allIdbKeys = await DB.keys('artists');
    await Promise.all(allIdbKeys.map(async k => {
      try {
        const entry = await DB.get('artists', k);
        if (entry) await DB.put('artists', k, { ...entry, ts: 0 });
      } catch(e) {}
    }));
    dblog('info', `IDB: expired ${allIdbKeys.length} artist cache entries (ts=0)`);
  } catch(e) {
    dblog('warn', `IDB invalidation failed: ${e.message} — will scan anyway`);
  }

  // Step 2: set the merge mode flag.
  // fetchAll checks this flag at three injection points (see below).
  window._mergeMode = true;

  // Step 3: snapshot dedup keys of ALL current concerts.
  // When processArtist returns fresh shows for artist X, we want to add
  // any existing shows for X that are NOT in the fresh result set.
  // Building the key set once here avoids O(n²) lookups during the scan.
  window._mergeBaseKeys = new Set(concerts.map(_concertKey));

  // Group baseline concerts by artist (lowercase) for fast lookup during merge.
  window._mergeBaseByArtist = {};
  for (const c of concerts) {
    const k = (c.artist||'').toLowerCase();
    (window._mergeBaseByArtist[k] = window._mergeBaseByArtist[k] || []).push(c);
  }

  dblog('info', `Merge baseline: ${window._mergeBaseKeys.size} dedup keys across ${Object.keys(window._mergeBaseByArtist).length} artists`);

  // Step 4: run smart scan (false = respect IDB cache).
  // Since we zeroed all ts values in step 1, every artist will miss the TTL
  // check and trigger a live TM fetch. The three injection points in fetchAll
  // handle the merge behaviour.
  fetchAll(false);
}

// ── Purge concerts that have already happened ──────────────────────
function purgePastConcerts() {
  const today = new Date().toISOString().split('T')[0];
  const before = concerts.length;
  const pastCount = concerts.filter(c => c.date < today).length;

  if (!pastCount) {
    softNotice('No past concerts to remove - everything is upcoming.');
    return;
  }

  const ok = confirm(
    `Remove ${pastCount} past concert${pastCount !== 1 ? 's' : ''} (before ${today})?\n\n` +
    `${before - pastCount} upcoming concerts will remain.`
  );
  if (!ok) return;

  concerts = concerts.filter(c => c.date >= today);

  // Persist
  try { localStorage.setItem('tt_concerts', JSON.stringify(concerts)); } catch(e) {}
  cacheTimestamp = Date.now();

  scheduleUiRefresh();
  renderSaveSlots(); // refresh save button state
  setStatus(`🗑 Removed ${pastCount} past concerts · ${concerts.length} upcoming remain`, true);
  dblog('info', `PURGE: removed ${pastCount} past concerts (before ${today}), ${concerts.length} remain`);
}

function openSaveLoad() {
  renderSaveSlots();
  document.getElementById('sl-panel').classList.add('open');
}
function closeSaveLoad() {
  document.getElementById('sl-panel').classList.remove('open');
}

function renderSaveSlots() {
  const list = document.getElementById('sl-slots-list');
  const saves = getSaveIndex();
  const hasCurrent = concerts.length > 0 || festivals.length > 0;

  // Disable save button if nothing loaded
  const saveBtn = document.getElementById('sl-save-btn');
  if (saveBtn) saveBtn.disabled = !hasCurrent;

  if (!saves.length) {
    list.innerHTML = `<div style="font-size:.58rem;color:var(--muted2);padding:10px 0;text-align:center">
      No saves yet — save your current scan to create a slot
    </div>`;
    return;
  }

  list.innerHTML = '';
  saves.forEach((s, i) => {
    const d = s.savedAt ? new Date(s.savedAt) : null;
    const dateStr = d ? d.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'}) : '';
    const timeStr = d ? d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '';

    const slot = document.createElement('div');
    slot.className = 'sl-slot';
    slot.innerHTML = `
      <div class="sl-slot-icon">💾</div>
      <div class="sl-slot-info">
        <div class="sl-slot-name">${s.label || s.filename || 'Save'}</div>
        <div class="sl-slot-meta">${dateStr}${dateStr&&timeStr?' · ':''}${timeStr}${s.filename?' · '+s.filename:''}</div>
      </div>
      <div class="sl-slot-actions">
        <button class="sl-btn" onclick="triggerFileLoad()">📂 Load file…</button>
        <button class="sl-btn danger" onclick="deleteSave(${i})">✕</button>
      </div>`;
    list.appendChild(slot);
  });

  // Always show a "load from file" row even if saves exist
  const loadRow = document.createElement('div');
  loadRow.style.cssText = 'padding:6px 0;text-align:center';
  loadRow.innerHTML = `<button class="sl-btn" onclick="triggerFileLoad()" style="width:100%">📂 Load a .tt save file…</button>`;
  list.appendChild(loadRow);
}

function deleteSave(idx) {
  const saves = getSaveIndex();
  saves.splice(idx, 1);
  localStorage.setItem('tt_saves', JSON.stringify(saves));
  renderSaveSlots();
}

function triggerFileLoad() {
  document.getElementById('sl-file-input').click();
}

// ═══════════════════════════════════════════════════════════════
// SPOTIFY IMPORT
// ═══════════════════════════════════════════════════════════════
let spTokenCache = null; // { token, exp }
const SPOTIFY_SERVER_TIMEOUT_MS = 15000;
const SPOTIFY_IMPORT_TIMEOUT_MS = 45000;

// ═══════════════════════════════════════════════════════════════
// UNIFIED PROXY SYSTEM  (Spotify + Ticketmaster)
// ═══════════════════════════════════════════════════════════════
// mode: 'none' | 'auto' | 'corsproxy' | 'allorigins' | 'custom'
// 'auto' = try direct, auto-fallback to corsproxy.io on CORS/net error

const PROXY_BUILDERS = {
  corsproxy:  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  allorigins: url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  custom:     (url, tpl) => tpl ? tpl.replace('{url}', encodeURIComponent(url)) : url,
};

// ── Spotify proxy ─────────────────────────────────────────────
let spProxyMode    = 'none';
let spCustomProxy  = '';
let spProxyWorking = null; // 'direct' | 'corsproxy' | 'allorigins' | 'custom'

function buildProxiedUrl(url, mode, customTpl) {
  if (mode === 'none' || mode === 'auto') return url;
  const fn = PROXY_BUILDERS[mode];
  return fn ? fn(url, customTpl) : url;
}

function hasSpotifyUserTokenInFlight(options = {}) {
  try {
    const headers = new Headers(options.headers || {});
    return headers.has('Authorization') && spTokenCache?.source === 'user';
  } catch {
    return false;
  }
}

function isSameOriginSpotifyProxy(mode) {
  if (mode === 'none' || mode === 'auto') return true;
  if (mode !== 'custom') return false;
  try {
    const sample = buildProxiedUrl('https://api.spotify.com/v1/me', mode, spCustomProxy || INTERNAL_PROXY_TEMPLATE);
    const resolved = new URL(sample, window.location.origin);
    return resolved.origin === window.location.origin;
  } catch {
    return false;
  }
}

// Spotify fetch with proxy support + auto-fallback + hard timeout on direct calls
const SP_FETCH_TIMEOUT = 8000; // ms — if direct hangs, try proxy instead

async function spFetch(url, options = {}) {
  if (hasSpotifyUserTokenInFlight(options) && !isSameOriginSpotifyProxy(spProxyMode)) {
    throw new Error('Spotify account login is active. External Spotify proxies are disabled for privacy. Switch Spotify proxy to Direct/Internal and try again.');
  }

  // Direct fetch with a hard timeout so we never hang forever on a blocked connection
  const direct = () => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), SP_FETCH_TIMEOUT);
    // Merge any existing signal with our timeout signal
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(tid));
  };
  const viaProxy = mode => fetch(buildProxiedUrl(url, mode, spCustomProxy), options);

  if (spProxyMode === 'corsproxy')  return viaProxy('corsproxy');
  if (spProxyMode === 'allorigins') return viaProxy('allorigins');
  if (spProxyMode === 'custom')     return viaProxy('custom');

  // 'none' — direct with timeout, surface a helpful error if it hangs/fails
  if (spProxyMode === 'none') {
    try {
      return await direct();
    } catch(e) {
      if (e.name === 'AbortError') {
        onboardLog?.('✗ Timed out after 8s — IP likely blocked', 'err');
        throw new Error('Spotify не ответил за 8с — ваш IP заблокирован. В настройках Advanced → Spotify proxy включите ⚡ Auto-fallback.');
      }
      onboardLog?.('✗ ' + e.message, 'err');
      throw e;
    }
  }

  // 'auto' — try direct (with timeout), then corsproxy.io, then allorigins.win
  if (hasSpotifyUserTokenInFlight(options)) {
    return direct();
  }

  if (spProxyWorking === 'direct')     return direct();
  if (spProxyWorking === 'corsproxy')  return viaProxy('corsproxy');
  if (spProxyWorking === 'allorigins') return viaProxy('allorigins');

  try {
    const r = await direct();
    if (r.ok || r.status === 400 || r.status === 401 || r.status === 403) {
      spProxyWorking = 'direct'; return r;
    }
    throw new Error('non-ok: ' + r.status);
  } catch(e) {
    const reason = e.name === 'AbortError' ? 'timed out (8s)' : e.message;
    console.warn(`Spotify direct blocked/hung (${reason}) — trying corsproxy.io`);
    try {
      const r2 = await viaProxy('corsproxy');
      spProxyWorking = 'corsproxy';
      setTmProxyStatus('sp', `✓ Via corsproxy.io (direct blocked)`, 'warn');
      return r2;
    } catch(e2) {
      try {
        const r3 = await viaProxy('allorigins');
        spProxyWorking = 'allorigins';
        setTmProxyStatus('sp', `✓ Via allorigins.win`, 'warn');
        return r3;
      } catch(e3) {
        setTmProxyStatus('sp', `✗ All proxy routes failed`, 'err');
        throw new Error('Spotify недоступен через все прокси. Проверьте интернет или настройте Custom proxy.');
      }
    }
  }
}

// ── Ticketmaster proxy ────────────────────────────────────────
let tmProxyMode    = 'none';   // default: direct connection — change in Settings > Proxy if your IP is blocked
let tmCustomProxy  = '';
let tmProxyWorking = null; // 'direct' | 'corsproxy' | 'allorigins' | 'custom'

// Called from apiFetch — wraps a TM URL with proxy if needed
// Returns the fetch Promise (with AbortSignal passed through in options)
async function tmFetch(url, options = {}) {
  const direct    = () => fetch(url, options);
  const viaProxy  = mode => fetch(buildProxiedUrl(url, mode, tmCustomProxy), options);

  if (tmProxyMode === 'none')       return direct();
  if (tmProxyMode === 'corsproxy')  return viaProxy('corsproxy');
  if (tmProxyMode === 'allorigins') return viaProxy('allorigins');
  if (tmProxyMode === 'custom')     return viaProxy('custom');

  // 'auto' — cache the working route within this scan
  if (tmProxyWorking === 'direct')     return direct();
  if (tmProxyWorking === 'corsproxy')  return viaProxy('corsproxy');
  if (tmProxyWorking === 'allorigins') return viaProxy('allorigins');

  try {
    const r = await direct();
    // Any real HTTP response = TM is reachable directly
    if (r.status !== 0) { tmProxyWorking = 'direct'; return r; }
    throw new Error('status 0');
  } catch(e) {
    // Network/CORS error — fall through to proxies
    dblog('warn', `TM direct blocked (${e.message}) — trying corsproxy.io`);
    try {
      const r2 = await viaProxy('corsproxy');
      tmProxyWorking = 'corsproxy';
      setTmProxyStatus('tm', `✓ Via corsproxy.io (direct blocked)`, 'warn');
      dblog('ok', `TM: auto-fallback to corsproxy.io succeeded`);
      return r2;
    } catch(e2) {
      // Try allorigins as second fallback
      dblog('warn', `TM corsproxy failed (${e2.message}) — trying allorigins.win`);
      try {
        const r3 = await viaProxy('allorigins');
        tmProxyWorking = 'allorigins';
        setTmProxyStatus('tm', `✓ Via allorigins.win (direct+corsproxy blocked)`, 'warn');
        dblog('ok', `TM: auto-fallback to allorigins.win succeeded`);
        return r3;
      } catch(e3) {
        setTmProxyStatus('tm', `✗ All proxy attempts failed`, 'err');
        throw e3;
      }
    }
  }
}

// ── Proxy UI helpers ─────────────────────────────────────────
function setTmProxyStatus(which, msg, type) {
  const id = which === 'tm' ? 'tm-proxy-status' : 'proxy-status';
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = '';
  el.className = 'proxy-status' + (type ? ' ' + type : '');
  el.textContent = msg;
}

const SP_PROXY_HINTS = {
  none:       'Direct connection to Spotify — default.',
  auto:       'Tries direct first, falls back to corsproxy.io automatically if your IP is blocked.',
  corsproxy:  'Spotify requests routed through corsproxy.io (free, public).',
  allorigins: 'Spotify requests routed through allorigins.win (free, public).',
  custom:     'Custom proxy — use <code>{url}</code> as placeholder, e.g. <code>https://proxy.mine.com/?u={url}</code>',
};
const TM_PROXY_HINTS = {
  none:       'Direct Ticketmaster calls — default. Enable if you see "Failed to fetch" in Debug Log.',
  auto:       '⚡ Recommended fix for "Failed to fetch". Tries direct, auto-falls back to corsproxy.io → allorigins.win.',
  corsproxy:  'TM requests via corsproxy.io. Use if direct is blocked.',
  allorigins: 'TM requests via allorigins.win. Use as alternative to corsproxy.',
  custom:     'Custom proxy — use <code>{url}</code> as placeholder.',
};
if (INTERNAL_PROXY_TEMPLATE) {
  SP_PROXY_HINTS.custom = 'App server proxy - same-origin route for shared and deployed builds.';
  TM_PROXY_HINTS.none = 'Direct browser calls. Prefer the app server proxy for shared users and deployed builds.';
  TM_PROXY_HINTS.custom = 'App server proxy - recommended default for external users.';
}

function setSpProxy(mode) {
  spProxyMode = mode; spProxyWorking = null;
  localStorage.setItem('sp_proxy', mode);
  document.querySelectorAll('#proxy-opts .proxy-opt').forEach(b =>
    b.classList.toggle('on', b.dataset.p === mode));
  const el = document.getElementById('proxy-custom-row');
  if (el) el.style.display = mode === 'custom' ? '' : 'none';
  const st = document.getElementById('proxy-status');
  if (st) st.style.display = 'none';
  const h = document.getElementById('proxy-hint');
  if (h) h.innerHTML = SP_PROXY_HINTS[mode] || '';
}

function setTmProxy(mode) {
  tmProxyMode = mode; tmProxyWorking = null;
  localStorage.setItem('tm_proxy', mode);
  document.querySelectorAll('#tm-proxy-opts .proxy-opt').forEach(b =>
    b.classList.toggle('on', b.dataset.p === mode));
  const el = document.getElementById('tm-proxy-custom-row');
  if (el) el.style.display = mode === 'custom' ? '' : 'none';
  const st = document.getElementById('tm-proxy-status');
  if (st) st.style.display = 'none';
  const h = document.getElementById('tm-proxy-hint');
  if (h) h.innerHTML = TM_PROXY_HINTS[mode] || '';
}

function setProxyStatus(msg, type) { setTmProxyStatus('sp', msg, type); }

async function testSpProxy() {
  const custom = (document.getElementById('proxy-custom-url')?.value || '').trim();
  if (spProxyMode === 'custom') spCustomProxy = custom;
  setTmProxyStatus('sp', 'Testing…', '');
  try {
    const r = await spFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    setTmProxyStatus('sp', `✓ Spotify reachable (HTTP ${r.status})`, r.status < 500 ? 'ok' : 'warn');
  } catch(e) {
    setTmProxyStatus('sp', `✗ Failed: ${e.message}`, 'err');
  }
}

async function testTmProxy() {
  const custom = (document.getElementById('tm-proxy-custom-url')?.value || '').trim();
  if (tmProxyMode === 'custom') tmCustomProxy = custom;
  setTmProxyStatus('tm', 'Testing…', '');
  try {
    // Small test fetch — 1 result, no key needed for OPTIONS, but we need the key
    const testUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${SERVER_MANAGED_TICKETMASTER ? SERVER_TM_PLACEHOLDER : API_KEY}&size=1&classificationName=music`;
    const r = await tmFetch(testUrl);
    if (r.ok || r.status === 401) {
      setTmProxyStatus('tm', `✓ Ticketmaster reachable (HTTP ${r.status})`, 'ok');
    } else {
      setTmProxyStatus('tm', `⚠ Got HTTP ${r.status}`, 'warn');
    }
  } catch(e) {
    setTmProxyStatus('tm', `✗ Failed: ${e.message}`, 'err');
  }
}

function restoreProxySettings() {
  const defaultProxyMode = INTERNAL_PROXY_TEMPLATE ? 'custom' : 'none';
  spProxyMode    = localStorage.getItem('sp_proxy')         || defaultProxyMode;
  spCustomProxy  = localStorage.getItem('sp_proxy_custom')  || INTERNAL_PROXY_TEMPLATE || '';
  tmProxyMode    = localStorage.getItem('tm_proxy')         || defaultProxyMode;
  tmCustomProxy  = localStorage.getItem('tm_proxy_custom')  || INTERNAL_PROXY_TEMPLATE || '';
  if (spProxyMode === 'custom' && !spCustomProxy && INTERNAL_PROXY_TEMPLATE) spCustomProxy = INTERNAL_PROXY_TEMPLATE;
  if (tmProxyMode === 'custom' && !tmCustomProxy && INTERNAL_PROXY_TEMPLATE) tmCustomProxy = INTERNAL_PROXY_TEMPLATE;
}

function syncProxyUI() {
  setSpProxy(spProxyMode);
  setTmProxy(tmProxyMode);

  const spInput = document.getElementById('proxy-custom-url');
  if (spInput && spCustomProxy) spInput.value = spCustomProxy;
  if (spInput && !spInput._bound) {
    spInput._bound = true;
    spInput.addEventListener('input', () => { spCustomProxy = spInput.value.trim(); localStorage.setItem('sp_proxy_custom', spCustomProxy); });
  }
  const tmInput = document.getElementById('tm-proxy-custom-url');
  if (tmInput && tmCustomProxy) tmInput.value = tmCustomProxy;
  if (tmInput && !tmInput._bound) {
    tmInput._bound = true;
    tmInput.addEventListener('input', () => { tmCustomProxy = tmInput.value.trim(); localStorage.setItem('tm_proxy_custom', tmCustomProxy); });
  }
}

function spSetError(msg) {
  const el = document.getElementById('hero-status-text');
  if (el) { el.style.color = msg ? '#ff7070' : ''; el.textContent = msg ? '⚠ ' + msg : ''; }
}
function spSetResult(msg) {
  const el = document.getElementById('hero-status-text');
  if (el) { el.style.color = msg ? 'var(--accent)' : ''; el.textContent = msg || ''; }
}
function spSetProgress(done, total) {
  const prog = document.getElementById('hero-progress');
  const fill = document.getElementById('hero-prog-fill');
  const lbl  = document.getElementById('hero-status-text');
  if (prog) prog.style.display = '';
  if (fill) fill.style.width = (total ? done/total*100 : 15) + '%';
  if (lbl)  { lbl.style.color = ''; lbl.textContent = total ? `Fetched ${done} / ${total} tracks…` : 'Authenticating…'; }
}
function spClearProgress() {
  const prog = document.getElementById('hero-progress');
  if (prog) prog.style.display = 'none';
}

async function spGetToken() {
  if (spTokenCache && Date.now() < spTokenCache.exp) return spTokenCache.token;
  if (!SERVER_MANAGED_SPOTIFY) {
    throw new Error('Spotify is not configured for this deployment yet.');
  }
  const data = await spFetchServerJson('/api/spotify/token', {
    method: 'POST',
    credentials: 'same-origin',
  }, {
    label: 'Spotify auth',
    timeoutMs: SPOTIFY_SERVER_TIMEOUT_MS,
  });
  const expiresIn = Math.max(60, Number(data.expires_in) || 3600);
  spTokenCache = {
    token: data.access_token,
    exp: Date.now() + Math.max(30, expiresIn - 60) * 1000,
    source: data.source || 'app',
  };
  return spTokenCache.token;
}

function spExtractId(raw) {
  raw = (raw || '').trim();
  const m = raw.match(/playlist\/([a-zA-Z0-9]+)/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9]{22}$/.test(raw)) return raw;
  return null;
}

async function spFetchAllTracks(token, pid) {
  const res = await spFetch(`https://api.spotify.com/v1/playlists/${pid}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Spotify HTTP ${res.status}`);
  }
  const playlist = await res.json();
  const tracks = [];
  const total = playlist.tracks.total;
  const pages = Math.ceil(total / 100);
  playlist.tracks.items.forEach(i => { if (i?.track) tracks.push(i.track); });

  // Use hooked progress fn if available (set by runSpotifyImport), otherwise spSetProgress
  const reportProgress = window._spProgHook || spSetProgress;
  reportProgress(tracks.length, total);
  onboardLog?.(`✓ Playlist loaded — ${total} tracks, ~${Math.ceil(total/100)} pages to fetch`, 'ok');

  let next = playlist.tracks.next;
  let page = 1;
  while (next) {
    const r = await spFetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) break;
    const data = await r.json();
    data.items.forEach(i => { if (i?.track) tracks.push(i.track); });
    next = data.next;
    page++;
    reportProgress(tracks.length, total);
    // Log every 10 pages so the minilog isn't spammed
    if (page % 10 === 0) {
      const pct = Math.round(tracks.length / total * 100);
      onboardLog?.(`page ${page}/${pages} — ${tracks.length}/${total} tracks (${pct}%)`, 'ok');
    }
  }
  return { playlist, tracks };
}

async function spFetchPlaylistImport(pid) {
  return spFetchServerJson(`/api/spotify/playlists/${encodeURIComponent(pid)}/import`, {
    credentials: 'same-origin',
  }, {
    label: 'Spotify playlist import',
    timeoutMs: SPOTIFY_IMPORT_TIMEOUT_MS,
  });
}

async function spFetchServerJson(url, fetchOptions = {}, opts = {}) {
  const timeoutMs = Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : SPOTIFY_SERVER_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || data.message || `${opts.label || 'Spotify request'} failed (${response.status}).`);
      error.status = response.status;
      error.detail = data.detail;
      throw error;
    }
    return data;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error(`${opts.label || 'Spotify request'} timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function spBuildArtistMap(tracks) {
  // artist.id → { name, count }
  const map = {};
  tracks.forEach(track => {
    if (!track || track.is_local) return;
    (track.artists || []).forEach(a => {
      if (!map[a.id]) map[a.id] = { name: a.name, count: 0 };
      map[a.id].count++;
    });
  });
  return map;
}


// ═══════════════════════════════════════════════════════════════
// IMPORT FESTIVALS ONLY
// ═══════════════════════════════════════════════════════════════
async function importFestivalsOnly() {
  const btn = document.getElementById('fest-import-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Importing…'; }
  scanAborted = false;

  try {
    setStatus('Importing festivals…', false);
    await fetchFestivalsData();

    // Persist festivals
    try { localStorage.setItem('tt_festivals', JSON.stringify(festivals)); } catch(e) {}
    DB.put('meta', 'festivals', { data: festivals, ts: Date.now() }).catch(() => {});

    buildFestPanel();
    renderMap();
    setStatus(`✓ ${festivals.length} festivals imported`, true);
    dblog('info', `Festival-only import done: ${festivals.length} festivals`);
  } catch(e) {
    setStatus('Festival import failed: ' + e.message, false);
    dblog('error', 'Festival import error: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⬇ Import festivals'; }
  }
}

async function rescanFestsOnly() {
  if (!ARTISTS.length) { setStatus('No artists loaded — import a playlist first', false); return; }
  const btn     = document.getElementById('fest-rescan-btn');
  const stopBtn = document.getElementById('stop-btn');
  const loadbar = document.getElementById('loadbar');
  const hdProg  = document.getElementById('hd-progress');
  if (btn) { btn.disabled = true; btn.textContent = 'Fests...'; }
  scanAborted = false;

  // Show scan UI (loadbar + hd-progress + stop btn)
  if (loadbar) { loadbar.style.display = 'block'; document.getElementById('loadbar-fill').style.width = '0%'; }
  if (hdProg)  { hdProg.style.display = ''; hdProg.textContent = ''; }
  if (stopBtn) stopBtn.style.display = '';
  document.getElementById('pulse').className = 'pulse';

  try {
    // Wipe stale festival data — start fresh with current geo filters + artist set
    await DB.delete('meta', 'festivals').catch(() => {});
    festivals = [];
    buildFestPanel(); renderMap(); // clear stale from UI immediately

    setStatus('Fetching festivals...', false);
    setProgress('Festivals: starting...', 2);

    // fetchFestivalsData calls setProgress internally throughout
    await fetchFestivalsData();

    // Post-process: dedup + score against current artist set
    festivals = deduplicateFestivals(festivals);
    if (ARTISTS.length) scoreFestivals();

    // Save fresh data to IDB
    DB.put('meta', 'festivals', { data: festivals, ts: Date.now() }).catch(() => {});

    setProgress('', 100);
    buildCalChips(); renderCalendar();
    buildFestPanel(); renderMap();

    setStatus(festivals.length + ' festivals — re-scanned', true);
    dblog('info', 'Fest-only rescan done: ' + festivals.length + ' festivals');
  } catch(e) {
    setStatus('Festival rescan failed: ' + e.message, false);
    dblog('error', 'Fest rescan error: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '\uD83C\uDFAA Fests'; }
    if (stopBtn) stopBtn.style.display = 'none';
    if (loadbar) setTimeout(() => { loadbar.style.display = 'none'; }, 800);
    if (hdProg)  setTimeout(() => { hdProg.style.display = 'none'; hdProg.textContent = ''; }, 800);
    document.getElementById('pulse').className = 'pulse live';
  }
}

// ═══════════════════════════════════════════════════════════════
// GO-THRU FESTIVALS — swipe-style review mode
// ═══════════════════════════════════════════════════════════════
let _gf = {
  queue: [],   // sorted festivals to go through
  idx: 0,
  saved: new Set(),  // festival ids user saved
};

function openGoThru() {
  const today = new Date().toISOString().split('T')[0];
  const upFests = festivals.filter(f => f.date >= today && geoDisplayOk(f.country || '') && dateMatchesPreset(f.date));

  if (!upFests.length) {
    softNotice('No festivals match the current date / location filters.');
    return;
  }

  // Sort: matched (score>0) first by score desc, then unmatched by date
  _gf.queue = [
    ...upFests.filter(f => (f.score||0) > 0).sort((a,b) => (b.score-a.score) || a.date.localeCompare(b.date)),
    ...upFests.filter(f => !(f.score||0) > 0).sort((a,b) => a.date.localeCompare(b.date)),
  ];
  _gf.idx = 0;
  _gf.saved = new Set();

  document.getElementById('gf-overlay').classList.add('open');
  gfRender();

  // Keyboard nav
  document.addEventListener('keydown', _gfKeyHandler);
}

function closeGoThru() {
  document.getElementById('gf-overlay').classList.remove('open');
  document.removeEventListener('keydown', _gfKeyHandler);

  // If user saved anything, show summary
  if (_gf.saved.size > 0) {
    const names = _gf.queue.filter(f => _gf.saved.has(f.id)).map(f => f.name);
    dblog('info', `Go-Thru: saved ${_gf.saved.size} festivals — ${names.join(', ')}`);
    setStatus(`🎪 ${_gf.saved.size} festival${_gf.saved.size>1?'s':''} saved to list`, true);
    // Scroll festival pane to show saved ones highlighted
    buildFestPanel();
  }
}

function _gfKeyHandler(e) {
  if (e.key === 'Escape') { closeGoThru(); return; }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { gfNext(); return; }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { gfPrev(); return; }
  if (e.key === 's' || e.key === 'S') { gfToggleSave(); return; }
  if (e.key === 'Enter') { gfToggleSave(); return; }
}

function gfRender() {
  const f = _gf.queue[_gf.idx];
  const total = _gf.queue.length;
  if (!f) { gfShowDone(); return; }

  // Progress
  document.getElementById('gf-progress-fill').style.width = `${(_gf.idx / total) * 100}%`;
  document.getElementById('gf-counter').textContent = `${_gf.idx + 1} / ${total}`;

  const score = f.score || 0;
  const matched = f.matched || [];
  const isSaved = _gf.saved.has(f.id);
  const perfect = score >= 80 && matched.length >= 2;
  const ringCls = perfect ? 'p' : score > 0 ? 's' : '';
  const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
  const hasPlays = matched.some(m => m.plays > 0);

  const topMatched = matched.slice(0, 8);
  const extraCount = matched.length - topMatched.length;

  const matchedChips = topMatched.map((m, i) =>
    `<span class="gf-chip${i < 2 ? ' top' : ''}">${esc2(m.artist)}${hasPlays && m.plays ? `<span class="gf-chip-plays">${m.plays}</span>` : ''}</span>`
  ).join('');
  const extraChip = extraCount > 0 ? `<span class="gf-chip-other">+${extraCount} more</span>` : '';

  // Lineup artists not in our list
  const lineup = (f.lineup || []).filter(l => !matched.some(m => m.artist.toLowerCase() === l.toLowerCase()));
  const lineupChips = lineup.slice(0, 12).map(l => `<span class="gf-chip-other">${esc2(l)}</span>`).join('');
  const lineupExtra = lineup.length > 12 ? `<span class="gf-chip-other">+${lineup.length - 12}</span>` : '';

  document.getElementById('gf-body').innerHTML = `
    <div class="gf-score-row">
      <div class="gf-ring ${ringCls}">${score > 0 ? score : '—'}</div>
      <div>
        <div class="gf-name">${esc2(f.name)}</div>
        <div class="gf-meta">${fmtDate(f.date)} · ${loc}</div>
      </div>
    </div>
    ${score > 0 ? `<div class="gf-bar-wrap"><div class="gf-bar-fill${perfect?' p':''}" style="width:${score}%"></div></div>` : ''}
    ${matched.length ? `
      <div class="gf-section">Your artists (${matched.length})</div>
      <div class="gf-chips">${matchedChips}${extraChip}</div>
    ` : `<div class="gf-none" style="margin-bottom:8px">None of your tracked artists on lineup</div>`}
    ${lineup.length ? `
      <div class="gf-section">Full lineup</div>
      <div class="gf-chips">${lineupChips}${lineupExtra}</div>
    ` : ''}
  `;

  // Update action bar
  const starBtn = document.getElementById('gf-star-btn');
  starBtn.className = 'gf-btn-star' + (isSaved ? ' saved' : '');
  starBtn.textContent = isSaved ? '★ Saved' : '☆ Save';

  const actions = document.getElementById('gf-actions');
  const existing = actions.querySelector('.gf-btn-tkt');
  if (existing) existing.remove();
  if (f.url) {
    const tktBtn = document.createElement('a');
    tktBtn.className = 'gf-btn-tkt';
    tktBtn.href = f.url; tktBtn.target = '_blank';
    tktBtn.textContent = 'Tickets';
    actions.insertBefore(tktBtn, starBtn);
  }
}

function gfNext() {
  if (_gf.idx < _gf.queue.length - 1) {
    _gf.idx++;
    gfRender();
  } else {
    gfShowDone();
  }
}

function gfPrev() {
  if (_gf.idx > 0) {
    _gf.idx--;
    gfRender();
  }
}

function gfToggleSave() {
  const f = _gf.queue[_gf.idx];
  if (!f) return;
  if (_gf.saved.has(f.id)) {
    _gf.saved.delete(f.id);
  } else {
    _gf.saved.add(f.id);
  }
  gfRender();
}

function gfShowDone() {
  const saved = _gf.queue.filter(f => _gf.saved.has(f.id));
  document.getElementById('gf-progress-fill').style.width = '100%';
  document.getElementById('gf-counter').textContent = `Done · ${saved.length} saved`;

  document.getElementById('gf-body').innerHTML = `
    <div style="text-align:center;padding:24px 0 12px">
      <div style="font-size:2rem;margin-bottom:10px">🎪</div>
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;margin-bottom:6px">All done!</div>
      <div style="font-size:.62rem;color:var(--muted);margin-bottom:20px">Reviewed ${_gf.queue.length} festival${_gf.queue.length!==1?'s':''}</div>
      ${saved.length ? `
        <div style="font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);margin-bottom:8px">Saved festivals (${saved.length})</div>
        ${saved.map(f => {
          const score = f.score || 0;
          const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);text-align:left">
            <div class="gf-ring ${score>=80?'p':score>0?'s':''}" style="width:32px;height:32px;font-size:.5rem">${score||'—'}</div>
            <div>
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:.75rem">${esc2(f.name)}</div>
              <div style="font-size:.56rem;color:var(--muted)">${fmtDate(f.date)} · ${loc}</div>
            </div>
          </div>`;
        }).join('')}
      ` : `<div style="font-size:.62rem;color:var(--muted2)">Nothing saved — that's fine too</div>`}
    </div>
  `;

  document.getElementById('gf-actions').innerHTML = `
    <button class="gf-btn-skip" onclick="closeGoThru()">Close</button>
    ${_gf.idx > 0 ? `<button class="gf-btn-skip" onclick="gfPrev()">← Back</button>` : ''}
  `;
}

let pickerBuilt = false;
