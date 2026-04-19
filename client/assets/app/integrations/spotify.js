'use strict';

function renderSpotifyAccessButton() {
  const btn = document.getElementById('spotify-auth-btn');
  if (!btn) return;

  btn.classList.remove('setup', 'connected');
  btn.disabled = false;

  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    btn.textContent = 'Spotify Setup';
    btn.classList.add('setup');
    btn.title = 'Spotify login is not configured on this server yet.';
    return;
  }

  if (spotifyAccountState.loading || spotifyAccountState.playlistsLoading) {
    btn.textContent = 'Spotify...';
    btn.disabled = true;
    btn.title = 'Checking Spotify status...';
    return;
  }

  if (spotifyAccountState.connected) {
    btn.textContent = 'Spotify Ready';
    btn.classList.add('connected');
    btn.title = spotifyAccountState.user?.displayName
      ? `Connected as ${spotifyAccountState.user.displayName}`
      : 'Spotify is connected.';
    return;
  }

  btn.textContent = 'Connect Spotify';
  btn.title = 'Connect Spotify and pick a playlist.';
}

function renderOnboardSpotifyAuth() {
  const wrap = document.getElementById('onboard-auth-wrap');
  const button = document.getElementById('onboard-auth-btn');
  const logout = document.getElementById('onboard-auth-logout');
  const status = document.getElementById('onboard-auth-status');
  if (!wrap || !button || !logout || !status) return;
  renderSpotifyLocalSetupPanel();

  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    wrap.style.display = '';
    button.disabled = false;
    button.textContent = 'Open Spotify setup';
    logout.style.display = 'none';
    status.textContent = LOCAL_SETUP_ALLOWED
      ? `Spotify login is not configured yet. Open setup and add your Spotify Client ID + Client Secret. Redirect URI: ${SPOTIFY_REDIRECT_URI_HINT}`
      : 'Spotify login is not configured on this server yet. Add SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SESSION_SECRET in .env or Vercel, then reload.';
    status.dataset.tone = 'error';
    renderSpotifyPlaylistChoices();
    renderSpotifyAccessButton();
    renderOnboardSetupNotice();
    return;
  }

  wrap.style.display = '';
  button.disabled = spotifyAccountState.loading || spotifyAccountState.playlistsLoading;

  if (!spotifyAccountState.loaded || spotifyAccountState.loading) {
    button.textContent = 'Checking Spotify...';
  } else if (!spotifyAccountState.connected) {
    button.textContent = 'Continue with Spotify';
  } else if (spotifyAccountState.playlistsLoading) {
    button.textContent = 'Loading playlists...';
  } else if (spotifyAccountState.playlistsLoaded) {
    button.textContent = 'Refresh playlists';
  } else {
    button.textContent = 'Show my playlists';
  }

  logout.style.display = spotifyAccountState.connected ? '' : 'none';

  let message = '';
  let tone = '';
  if (spotifyAuthFlash && spotifyAuthFlash.message) {
    message = spotifyAuthFlash.message;
    tone = spotifyAuthFlash.tone || '';
  } else if (spotifyAccountState.error) {
    message = spotifyAccountState.error;
    tone = 'error';
  } else if (spotifyAccountState.connected) {
    const name = spotifyAccountState.user?.displayName || 'Spotify';
    message = `${name} connected. Pick one of your playlists or open the sample below.`;
    tone = 'ok';
  } else {
    message = 'Connect Spotify to browse your playlists, or open the sample below.';
  }

  status.textContent = message;
  status.dataset.tone = tone;
  renderSpotifyPlaylistChoices();
  renderSpotifyAccessButton();
  renderOnboardSetupNotice();
}

function renderOnboardSetupNotice() {
  const wrap = document.getElementById('onboard-setup-note');
  const status = document.getElementById('onboard-setup-status');
  const btn = document.getElementById('onboard-tm-setup-btn');
  if (!wrap || !status || !btn) return;

  if (hasTicketmasterSetup()) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = '';
  status.textContent = SERVER_MANAGED_SPOTIFY_LOGIN
    ? 'Spotify is ready. Add one free Ticketmaster key to unlock live concert and festival scans for your playlists.'
    : 'After Spotify setup, you will still need one Ticketmaster key for live concert and festival scans.';
  btn.textContent = 'Add Ticketmaster key';
}

async function refreshSpotifyAccount(opts = {}) {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) return null;

  spotifyAccountState.loading = true;
  spotifyAccountState.error = '';
  renderOnboardSpotifyAuth();

  try {
    const res = await fetch('/api/auth/spotify/session', {
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || `Spotify session check failed (${res.status}).`);
      error.status = res.status;
      throw error;
    }

    spotifyAccountState.loaded = true;
    spotifyAccountState.connected = !!data.connected;
    spotifyAccountState.user = data.user || null;
    spotifyAccountState.error = '';
    if (!spotifyAccountState.connected) {
      spotifyAccountState.playlists = [];
      spotifyAccountState.playlistsLoaded = false;
      spotifyAccountState.playlistsLoading = false;
    }
  } catch (e) {
    spotifyAccountState.loaded = true;
    spotifyAccountState.connected = false;
    spotifyAccountState.user = null;
    spotifyAccountState.playlists = [];
    spotifyAccountState.playlistsLoaded = false;
    spotifyAccountState.playlistsLoading = false;
    spotifyAccountState.error = e.message || 'Spotify is unavailable right now.';
  } finally {
    spotifyAccountState.loading = false;
    renderOnboardSpotifyAuth();
  }

  if (spotifyAccountState.connected && opts.withPlaylists) {
    return loadSpotifyAccountPlaylists(Boolean(opts.force));
  }

  return spotifyAccountState;
}

async function loadSpotifyAccountPlaylists(force = false) {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN || !spotifyAccountState.connected) return [];
  if (spotifyAccountState.playlistsLoaded && !force) {
    renderOnboardSpotifyAuth();
    return spotifyAccountState.playlists;
  }

  spotifyAccountState.playlistsLoading = true;
  spotifyAccountState.error = '';
  renderOnboardSpotifyAuth();

  try {
    const res = await fetch('/api/spotify/me/playlists', {
      credentials: 'same-origin',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || `Spotify playlists failed (${res.status}).`);
      error.status = res.status;
      throw error;
    }
    spotifyAccountState.playlists = Array.isArray(data.items) ? data.items : [];
    spotifyAccountState.playlistsLoaded = true;
    spotifyAccountState.error = '';
  } catch (e) {
    if (e.status === 401) {
      spotifyAccountState.connected = false;
      spotifyAccountState.user = null;
      spotifyAccountState.playlists = [];
      spotifyAccountState.playlistsLoaded = false;
      spotifyAccountState.error = 'Spotify session expired. Connect again.';
    } else {
      spotifyAccountState.error = e.message || 'Could not load Spotify playlists.';
    }
  } finally {
    spotifyAccountState.playlistsLoading = false;
    renderOnboardSpotifyAuth();
  }

  return spotifyAccountState.playlists;
}

function handleSpotifyAuthReturnFlag() {
  const url = new URL(window.location.href);
  const status = url.searchParams.get('spotify');
  if (!status) return;

  if (status === 'connected') {
    setSpotifyAuthFlash('Spotify connected. Pick a playlist or open the sample below.', 'ok');
  } else {
    setSpotifyAuthFlash(
      getSpotifyAuthErrorMessage(url.searchParams.get('code')),
      'error',
    );
  }

  url.searchParams.delete('spotify');
  url.searchParams.delete('code');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

async function onboardSpotifyAuthAction() {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    setSpotifyAuthFlash('Spotify login is not configured yet. Finish server setup, then reload this page.', 'error');
    renderOnboardSpotifyAuth();
    if (typeof openSettings === 'function') {
      openSettings();
      if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
    }
    setTimeout(focusSpotifyLocalSetup, 60);
    return;
  }
  if (!spotifyAccountState.connected) {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/api/auth/spotify/login?returnTo=${encodeURIComponent(returnTo)}`);
    return;
  }
  await loadSpotifyAccountPlaylists(true);
}

function openSpotifyAccess() {
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) {
    setSpotifyAuthFlash('Spotify login is not configured yet. Finish server setup, then reload this page.', 'error');
    showOnboard();
    showNewImport();
    if (typeof openSettings === 'function') {
      openSettings();
      if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
    }
    renderOnboardSpotifyAuth();
    setTimeout(focusSpotifyLocalSetup, 60);
    return;
  }

  if (spotifyAccountState.connected) {
    showOnboard();
    showNewImport();
    loadSpotifyAccountPlaylists(true).catch(() => {});
    return;
  }

  onboardSpotifyAuthAction();
}

async function spotifyLogout() {
  try {
    await fetch('/api/auth/spotify/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch (e) {
    // keep local state reset even if the network call fails
  }

  spotifyAccountState.loaded = true;
  spotifyAccountState.loading = false;
  spotifyAccountState.connected = false;
  spotifyAccountState.user = null;
  spotifyAccountState.playlists = [];
  spotifyAccountState.playlistsLoaded = false;
  spotifyAccountState.playlistsLoading = false;
  spotifyAccountState.error = '';
  setSpotifyAuthFlash('Spotify disconnected. You can still open the sample below.');
  renderOnboardSpotifyAuth();
  renderSpotifyAccessButton();
}

function samePlaylistUrl(a, b) {
  const aId = spExtractId(a || '');
  const bId = spExtractId(b || '');
  return !!aId && aId === bId;
}

function getDefaultOnboardPlaylistUrl() {
  return getOnboardHistory()[0]?.url || PINNED_PLAYLIST.url;
}

function syncOnboardPrimaryAction() {
  const inp = document.getElementById('onboard-url');
  const btn = document.getElementById('onboard-btn');
  if (!btn) return;
  const raw = (inp?.value || '').trim();
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (samePlaylistUrl(raw, latestUrl)) {
    btn.textContent = '→ Open last';
  } else if (samePlaylistUrl(raw, PINNED_PLAYLIST.url)) {
    btn.textContent = '→ Open sample';
  } else {
    btn.textContent = '→ Start scan';
  }
}

function primeOnboardPlaylistInput() {
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  if (!inp.value.trim()) inp.value = getDefaultOnboardPlaylistUrl();
  syncOnboardPrimaryAction();
}

function focusOnboardPlaylistInput(selectText = false) {
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  inp.focus();
  if (selectText) inp.select();
}

function usePinnedPlaylist(opts = {}) {
  const inp = document.getElementById('onboard-url');
  if (inp) inp.value = PINNED_PLAYLIST.url;
  syncOnboardPrimaryAction();
  if (opts.start) return handleOnboardPrimaryAction();
  focusOnboardPlaylistInput();
  return Promise.resolve(false);
}

function canInstantResumeFor(rawValue, info) {
  if (!info || info.artistCount <= 0) return false;
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (!rawValue) return true;
  if (!latestUrl) return true;
  return samePlaylistUrl(rawValue, latestUrl);
}

async function handleOnboardPrimaryAction() {
  primeOnboardPlaylistInput();
  return resumeOrImport();
}

let _obGeo   = 'nousa';  // mirrors geoQuick
let _obScore = 0;        // mirrors calScoreFilter

function obSetGeo(mode) {
  _obGeo = mode;
  document.querySelectorAll('.obf-btn[id^="obfq-"]').forEach(b => b.classList.remove('on'));
  const el = document.getElementById('obfq-' + mode);
  if (el) el.classList.add('on');
}

function obSetScore(level) {
  _obScore = level;
  document.querySelectorAll('.obf-btn[data-os]').forEach(b =>
    b.classList.toggle('on', parseInt(b.dataset.os) === level));
}

// Check IDB for cached artist data — returns summary or null
async function checkIDBCache() {
  try {
    const keys = await DB.keys('artists');
    // Filter out special keys
    const artistKeys = keys.filter(k => k !== '__ping__');
    if (!artistKeys.length) return null;
    // Count total cached shows
    let concertCount = 0;
    const today = new Date().toISOString().split('T')[0];
    for (const key of artistKeys) {
      try {
        const rec = await DB.get('artists', key);
        if (rec?.shows) concertCount += rec.shows.filter(s => s.date >= today).length;
      } catch {}
    }
    // Get festival cache
    let festCount = 0;
    try {
      const fc = await DB.get('meta', 'festivals');
      if (fc?.data) festCount = fc.data.filter(f => f.date >= today).length;
    } catch {}
    return { artistCount: artistKeys.length, concertCount, festCount };
  } catch { return null; }
}

// Rebuild concerts + festivals from IDB cache instantly
async function instantResume(opts = {}) {
  const btn = document.getElementById('onboard-resume-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⟳ Loading…'; }

  // Show a brief loading hint on the onboard card (auto-resume case)
  const titleEl = document.getElementById('onboard-resume-title');
  const importPanelEl = document.getElementById('onboard-import-panel');
  if (!opts.manual) {
    // Auto-resume: hide import panel, show a spinner in the card
    if (importPanelEl) importPanelEl.style.display = 'none';
    const resumeEl = document.getElementById('onboard-resume');
    if (resumeEl) {
      resumeEl.style.display = '';
      // Build stat summary while loading
      const hist = getOnboardHistory();
      const plName = hist[0]?.name || 'Your playlist';
      const lastScan = hist[0]?.ts ? tsAgo(hist[0].ts) : '';
      if (titleEl) titleEl.textContent = plName;
      const metaEl = document.getElementById('onboard-resume-meta');
      if (metaEl) metaEl.textContent = lastScan ? `last scan ${lastScan}` : '';
      const statsEl = document.getElementById('onboard-resume-stats');
      if (statsEl) statsEl.innerHTML = '<div class="onboard-resume-stat" style="color:var(--muted2)">Loading from cache…</div>';
    }
  }

  // Apply onboard filters to toolbar state
  setGeoQuick(_obGeo);  // converts legacy mode → geoNoUSA/geoNoCA + syncs buttons
  calScoreFilter = _obScore;
  document.querySelectorAll('#score-filter-row .plays-chip').forEach(c =>
    c.classList.toggle('on', parseInt(c.dataset.s) === calScoreFilter));

  // Apply min-tracks filter — same logic as runSpotifyImport but applied here
  // so Quick Load respects the chip selection too
  if (_minTracksFilter > 1 && ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length) {
    const before = ARTISTS.length;
    ARTISTS = ARTISTS.filter(name => (ARTIST_PLAYS[name.toLowerCase()] || 0) >= _minTracksFilter);
    const skipped = before - ARTISTS.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (>=${_minTracksFilter}): kept ${ARTISTS.length} artists, skipped ${skipped}`);
  }

  const today = new Date().toISOString().split('T')[0];
  try {
    // Rebuild concerts from IDB artist cache
    const keys = await DB.keys('artists');
    const artistKeys = keys.filter(k => k !== '__ping__');
    concerts = [];
    for (const key of artistKeys) {
      try {
        const rec = await DB.get('artists', key);
        if (rec?.shows) concerts.push(...rec.shows.filter(s => s.date >= today));
      } catch {}
    }
    concerts = deduplicateConcerts(concerts);

    // Rebuild festivals from IDB meta cache
    try {
      const fc = await DB.get('meta', 'festivals');
      if (fc?.data) festivals = deduplicateFestivals(fc.data.filter(f => f.date >= today));
    } catch {}

    cacheTimestamp = Date.now();

    if (festivals.length && ARTISTS.length) scoreFestivals();

    const age = cacheAge() || 'cached';
    setStatus(`↻ Resumed · ${concerts.length} concerts · ${festivals.length} festivals · ${age} — use ↻ Merge rescan to refresh`, true);
    /* refresh-btn removed */

    buildCalChips(); renderCalendar(); renderMap();
    hideOnboard();

  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = '▶ Resume session'; }
    const statusEl = document.getElementById('onboard-status-text');
    if (statusEl) statusEl.textContent = '⚠ Resume failed: ' + e.message;
    // Fall back to showing the import panel
    if (importPanelEl) importPanelEl.style.display = '';
    const resumeEl = document.getElementById('onboard-resume');
    if (resumeEl) resumeEl.style.display = 'none';
  }
}

// Show new import panel (switch from resume UI)
function showNewImport() {
  document.getElementById('onboard-resume').style.display = 'none';
  document.getElementById('onboard-import-panel').style.display = '';
  renderOnboardSpotifyAuth();
  primeOnboardPlaylistInput();
  setTimeout(() => {
    focusOnboardPlaylistInput();
  }, 80);
}

function showOnboard() {
  const el = document.getElementById('onboard');
  if (!el) return;
  el.classList.remove('hidden');
  renderOnboardSpotifyAuth();
  renderOnboardHistory();
  primeOnboardPlaylistInput();
  setTimeout(_paintPinnedMosaic, 0);
  // Show "back to last session" only if there's cached data
  const skip = document.getElementById('onboard-skip');
  if (skip) skip.style.display = (concerts.length || festivals.length) ? '' : 'none';
  // Focus the input after a brief delay
  setTimeout(() => {
    focusOnboardPlaylistInput();
  }, 150);
}

function hideOnboard() {
  const el = document.getElementById('onboard');
  if (el) el.classList.add('hidden');
}

// Saved playlists store for onboarding history
function getOnboardHistory() {
  try { return JSON.parse(localStorage.getItem('tt_pl_history') || '[]'); } catch { return []; }
}
function saveOnboardHistory(list) {
  localStorage.setItem('tt_pl_history', JSON.stringify(list.slice(0, 10)));
}
function addToOnboardHistory(name, url, trackCount, artistCount, coverUrl, topArtists, meta) {
  const list = getOnboardHistory();
  const existing = list.findIndex(p => p.url === url);
  if (existing >= 0) list.splice(existing, 1);
  list.unshift({ name, url, trackCount, artistCount, coverUrl: coverUrl || '', topArtists: topArtists || [], ts: Date.now(), ...(meta||{}) });
  saveOnboardHistory(list);
}

function tsAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h/24)}d ago`;
}

function renderOnboardHistory() {
  const list = getOnboardHistory();
  const wrap = document.getElementById('onboard-history-wrap');
  const hist = document.getElementById('onboard-history');
  if (!wrap || !hist) return;
  if (!list.length) { wrap.style.display = 'none'; } else {
    wrap.style.display = '';
    hist.innerHTML = '';
    list.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'onboard-pl';
      const ago = tsAgo(p.ts);
      const artists = (p.topArtists || []).slice(0, 4);
      const chips = artists.map(a => `<span class="onboard-pl-chip">${esc2(a)}</span>`).join('');
      el.innerHTML = `
        <canvas class="onboard-pl-canvas" width="68" height="68"
          style="width:68px;height:68px;flex-shrink:0;display:block"></canvas>
        <div class="onboard-pl-body">
          <div class="onboard-pl-name">${esc2(p.name)}</div>
          <div class="onboard-pl-meta">${p.artistCount||'?'} artists &middot; ${p.trackCount||'?'} tracks &middot; ${ago}</div>
          ${chips ? `<div class="onboard-pl-chips">${chips}</div>` : ''}
        </div>
        <div class="onboard-pl-arrow">&#x2192;</div>
        <button class="onboard-pl-del" title="Remove from history" onclick="removeOnboardHistory(event,${i})">&#xd7;</button>`;
      // Draw mosaic on the canvas
      _drawPlaylistMosaic(el.querySelector('canvas'), artists);
      el.onclick = e => {
        if (e.target.classList.contains('onboard-pl-del')) return;
        document.getElementById('onboard-url').value = p.url;
        syncOnboardPrimaryAction();
        handleOnboardPrimaryAction();
      };
      hist.appendChild(el);
    });
  }
  // Hide quick-load card if this playlist is already in history (avoid duplication)
  const alreadyInHistory = list.some(p => samePlaylistUrl(p.url || '', PINNED_PLAYLIST.url));
  const ql = document.getElementById('onboard-quickload');
  if (ql) ql.style.display = alreadyInHistory ? 'none' : '';
}

function removeOnboardHistory(e, i) {
  e.stopPropagation();
  const list = getOnboardHistory();
  list.splice(i, 1);
  saveOnboardHistory(list);
  renderOnboardHistory();
}

function esc2(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let _onboardTimerInt = null;
let _onboardStartTs  = 0;
let _onboardAborted  = false;

function onboardSetStatus(msg, color) {
  const el = document.getElementById('onboard-status-text');
  if (!el) return;
  el.textContent = msg;
  el.style.color = color || '';
  // Auto-show proxy row on error
  const proxyRow = document.getElementById('onboard-proxy-row');
  if (proxyRow) {
    const isError = color === '#ff7070' || (msg && msg.startsWith('⚠'));
    proxyRow.style.display = isError ? '' : 'none';
    if (isError) syncOnboardProxyBtns();
  }
}

let _minTracksFilter = 1; // global: min track count for artist to be included in scan

function setMinTracks(v) {
  _minTracksFilter = v;
  document.querySelectorAll('.onboard-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === v));
  const hint = document.getElementById('onboard-mintracks-hint');
  if (hint) {
    if (v <= 1) {
      hint.textContent = 'all artists';
    } else if (ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length && ARTISTS.length) {
      const passing = ARTISTS.filter(name => (ARTIST_PLAYS[name.toLowerCase()] || 0) >= v).length;
      hint.textContent = passing + ' of ' + ARTISTS.length + ' artists';
    } else {
      hint.textContent = 'artists with <' + v + ' tracks skipped';
    }
  }
  document.querySelectorAll('.settings-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === v));
}

function onboardSetSpProxy(mode) {
  setSpProxy(mode);
  syncOnboardProxyBtns();
}

function syncOnboardProxyBtns() {
  document.querySelectorAll('.onboard-proxy-btn').forEach(b =>
    b.classList.toggle('on', b.dataset.p === spProxyMode));
}

function onboardLog(msg, type) {
  const box = document.getElementById('onboard-minilog');
  if (!box) return;
  const colors = { ok:'#4cd97a', warn:'#ffaa3c', err:'#ff7070', net:'#ff9f6b' };
  const line = document.createElement('div');
  line.style.color = colors[type] || 'var(--muted)';
  const ts = Math.round((Date.now() - _onboardStartTs) / 1000);
  line.textContent = `[${ts}s] ${msg}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function onboardShowProgress(label) {
  const wrap = document.getElementById('onboard-prog-wrap');
  if (wrap) wrap.classList.add('visible');
  const fill = document.getElementById('onboard-prog-fill');
  if (fill) fill.style.width = '5%';
  const lbl = document.getElementById('onboard-prog-label');
  if (lbl) lbl.textContent = label || 'Connecting…';
  _onboardStartTs = Date.now();
  _onboardAborted = false;
  // Clear minilog
  const logBox = document.getElementById('onboard-minilog');
  if (logBox) logBox.innerHTML = '';
  const logWrap = document.getElementById('onboard-minilog-wrap');
  if (logWrap) logWrap.style.display = 'none';

  clearInterval(_onboardTimerInt);
  _onboardTimerInt = setInterval(() => {
    const elapsed = Math.round((Date.now() - _onboardStartTs) / 1000);
    const el = document.getElementById('onboard-prog-timer');
    if (el) el.textContent = elapsed + 's';
    // Show log after 5 seconds
    if (elapsed >= 5 && logWrap) logWrap.style.display = '';
    // Only warn if genuinely stuck — progress bar still at 5% (no tracks fetched yet)
    const fill = document.getElementById('onboard-prog-fill');
    const pct = fill ? parseFloat(fill.style.width) : 0;
    if (elapsed === 10 && pct < 10) {
      onboardLog('Still on auth/first page after 10s — possible IP block', 'warn');
      onboardLog('Try: cancel → enable ⚡ Auto-fallback proxy → retry', 'warn');
      // Auto-show proxy row
      const pr = document.getElementById('onboard-proxy-row');
      if (pr) { pr.style.display = ''; syncOnboardProxyBtns(); }
    }
  }, 1000);
}

function onboardHideProgress() {
  const wrap = document.getElementById('onboard-prog-wrap');
  if (wrap) wrap.classList.remove('visible');
  clearInterval(_onboardTimerInt);
  _onboardTimerInt = null;
  const timer = document.getElementById('onboard-prog-timer');
  if (timer) timer.textContent = '';
}

function onboardSetProgress(done, total) {
  const fill = document.getElementById('onboard-prog-fill');
  const lbl  = document.getElementById('onboard-prog-label');
  const pct  = total ? Math.round(done / total * 100) : 20;
  if (fill) fill.style.width = pct + '%';
  if (lbl)  lbl.textContent = total ? `Fetched ${done} / ${total} tracks…` : 'Authenticating…';
}

function onboardClearProgress() {
  onboardHideProgress();
}

function onboardCancel() {
  _onboardAborted = true;
  onboardHideProgress();
  onboardSetStatus('Cancelled.');
  spTokenCache = null; // force fresh token next attempt
  const btn = document.getElementById('onboard-btn');
  if (btn) btn.disabled = false;
  syncOnboardPrimaryAction();
}


// ── Shared Spotify import logic ──────────────────────────────────
// Used by both onboarding screen and settings modal.
// opts.mode: 'onboard' | 'settings'
// Returns true on success, false on failure.
async function runSpotifyImport(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';

  const urlInputId = isOnboard ? 'onboard-url' : 'sp-playlist-url';
  const btnId      = isOnboard ? 'onboard-btn'  : 'sp-import-btn';

  const raw = ((document.getElementById(urlInputId)?.value || '').trim()) || (isOnboard ? getDefaultOnboardPlaylistUrl() : '');
  const pid = spExtractId(raw);

  if (!pid) {
    if (isOnboard) onboardSetStatus('⚠ Paste a valid Spotify playlist URL', '#ff7070');
    else spSetError("Couldn't parse playlist ID — paste the full Spotify URL.");
    return false;
  }

  const btn = document.getElementById(btnId);
  if (btn) { btn.disabled = true; btn.textContent = isOnboard ? '…' : 'Importing…'; }

  // Show progress immediately so user sees something is happening
  if (isOnboard) onboardShowProgress('Connecting to Spotify…');

  // Sync progress to whichever UI is active
  const setStatus = isOnboard
    ? (msg, color) => onboardSetStatus(msg, color)
    : (msg, color) => { const el = document.getElementById('hero-status-text'); if (el) { el.style.color = color||''; el.textContent = msg; } };

  const setProgress = isOnboard
    ? (done, total) => {
        if (_onboardAborted) return;
        onboardSetProgress(done, total);
      }
    : (done, total) => spSetProgress(done, total);

  const clearProgress = isOnboard ? onboardClearProgress : spClearProgress;

  try {
    setStatus('Authenticating with Spotify…', '');

    // Temporarily hook spSetProgress for the shared fetch function
    const _origSpSetProg = window._spProgHook;
    window._spProgHook = setProgress;

    const token = await spGetToken();
    if (isOnboard && _onboardAborted) return false;
    if (isOnboard) onboardSetProgress(0, 0); // show indeterminate progress
    setStatus('Fetching playlist…', '');

    const { playlist: pl, tracks } = await spFetchAllTracks(token, pid);
    if (isOnboard && _onboardAborted) return false;

    window._spProgHook = _origSpSetProg;

    const artistMap = spBuildArtistMap(tracks);
    const allArtists = Object.values(artistMap).sort((a, b) => b.count - a.count);
    const minT = _minTracksFilter || 1;
    const artists = minT > 1 ? allArtists.filter(a => a.count >= minT) : allArtists;
    const skipped = allArtists.length - artists.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (≥${minT}): kept ${artists.length} artists, skipped ${skipped} with fewer tracks`);
    const lines = artists.map(a => `${a.name} ${a.count}`);

    // Populate artist textarea
    const ta = document.getElementById('artists-ta');
    if (ta) ta.value = lines.join('\n');
    updateArtistCount();

    // Save to history
    const coverUrl = pl.images?.[0]?.url || '';
    const topArtists = artists.slice(0, 8).map(a => a.name);
    addToOnboardHistory(pl.name || 'Playlist', raw, tracks.length, artists.length, coverUrl, topArtists);

    // Keep both URL inputs in sync
    const onboardInput = document.getElementById('onboard-url');
    const settingsInput = document.getElementById('sp-playlist-url');
    if (onboardInput  && onboardInput.value  !== raw) onboardInput.value  = raw;
    if (settingsInput && settingsInput.value !== raw) settingsInput.value = raw;

    clearProgress();
    const skipNote = skipped > 0 ? ` (${skipped} skipped <${minT}tr)` : '';
    setStatus(`✓ "${pl.name}" · ${artists.length} artists${skipNote} — scanning…`, 'var(--accent)');

    setTimeout(() => {
      // profHideEmpty() resets the onboard title/subtitle back to their
      // default wording (in case we were showing the per-profile import prompt)
      // and then calls hideOnboard() — so it's safe to call unconditionally.
      if (isOnboard) profHideEmpty(); else closeSettings();
      saveAndFetch(false);
    }, 700);

    return true;

  } catch(e) {
    clearProgress();
    // Detect likely IP-block / timeout — add a proxy hint
    const isBlock = e.message && (e.message.includes('8с') || e.message.includes('blocked') ||
      e.message.includes('Failed to fetch') || e.message.includes('NetworkError'));
    const proxyHint = (isBlock && spProxyMode === 'none')
      ? ' → Попробуй ⚡ Auto-fallback proxy ниже.' : '';
    const msg = '⚠ ' + (e.message || 'Something went wrong') + proxyHint;
    setStatus(msg, '#ff7070');
    if (btn) btn.disabled = false;
    if (isOnboard) syncOnboardPrimaryAction();
    else if (btn) btn.textContent = '↓ Import & Scan';
    return false;
  }
}

async function runSpotifyImportV2(opts = {}) {
  return runSpotifyImport(opts);
}

// Smart entry point: if IDB has cached data, resume instantly; otherwise run full Spotify import
async function resumeOrImport() {
  const raw = (document.getElementById('onboard-url')?.value || '').trim();
  const info = await checkIDBCache().catch(() => null);
  if (canInstantResumeFor(raw, info)) {
    instantResume();
  } else {
    onboardImport();
  }
}

// Thin wrappers that delegate to the shared function
async function onboardImport() { return runSpotifyImportV2({ mode: 'onboard' }); }
async function spotifyImport()  { return runSpotifyImportV2({ mode: 'settings' }); }

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
