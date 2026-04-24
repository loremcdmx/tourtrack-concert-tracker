'use strict';

function isPinnedPlaylistSelection(value) {
  const id = spExtractId(String(value || '').trim());
  return !!id && id === PINNED_PLAYLIST.id;
}

function scenarioAThresholdHint(filteredCount = null) {
  const shown = Number.isFinite(filteredCount) && filteredCount > 0
    ? Math.round(filteredCount)
    : PINNED_PLAYLIST.filteredArtistCount;
  return `${shown} of ${PINNED_PLAYLIST.artistCount} artists shown (>=${scenarioAFixedMinTracks()} repeats)`;
}

function getEffectiveMinTracks() {
  return isScenarioAProductMode() ? scenarioAFixedMinTracks() : (_minTracksFilter || 1);
}

function resolveSpotifyImportUrl(rawValue, isOnboard = false) {
  if (isScenarioAProductMode()) return PINNED_PLAYLIST.url;
  const raw = String(rawValue || '').trim();
  return raw || (isOnboard ? getDefaultOnboardPlaylistUrl() : '');
}

function applyScenarioAProductMode() {
  if (!isScenarioAProductMode()) return;
  document.body.classList.add('scenario-a');

  const onboardTitle = document.getElementById('onboard-main-title');
  const onboardSub = document.getElementById('onboard-sub-text');
  const onboardHeadnote = document.querySelector('.onboard-headnote');
  const onboardInput = document.getElementById('onboard-url');
  const onboardButton = document.getElementById('onboard-btn');
  const settingsInput = document.getElementById('sp-playlist-url');
  const settingsButton = document.getElementById('sp-import-btn');
  const hint = document.getElementById('onboard-mintracks-hint');
  const chips = document.getElementById('onboard-mintracks-chips');
  const label = document.querySelector('.onboard-mintracks-label');
  const quickload = document.getElementById('onboard-quickload');
  const quickloadMeta = quickload?.querySelector('.onboard-pl-meta');
  const quickloadName = quickload?.querySelector('.onboard-pl-name');
  const spotifyBtn = document.getElementById('spotify-auth-btn');
  const matchTab = document.getElementById('tab-match');
  const matchPane = document.getElementById('pane-match');
  const floatMatch = document.getElementById('tab-match-float');
  const settingsHistory = document.getElementById('settings-history-wrap');
  const profileDialog = document.getElementById('prof-dialog-bg');
  const importLabel = document.querySelector('#stab-pane-import .sset-label');

  if (onboardHeadnote) onboardHeadnote.textContent = 'Scenario A - pinned playlist only';
  if (onboardTitle) onboardTitle.innerHTML = DEFAULT_ONBOARD_TITLE;
  if (onboardSub) onboardSub.textContent = DEFAULT_ONBOARD_SUB;
  if (onboardInput) {
    onboardInput.value = PINNED_PLAYLIST.url;
    onboardInput.readOnly = true;
    onboardInput.setAttribute('aria-readonly', 'true');
    onboardInput.title = 'Scenario A is locked to the pinned playlist.';
  }
  if (onboardButton) onboardButton.textContent = 'Open playlist';

  if (settingsInput) {
    settingsInput.value = PINNED_PLAYLIST.url;
    settingsInput.readOnly = true;
    settingsInput.setAttribute('aria-readonly', 'true');
    settingsInput.title = 'Scenario A is locked to the pinned playlist.';
  }
  if (settingsButton) settingsButton.textContent = 'Reload';
  if (importLabel) importLabel.textContent = 'Pinned playlist';

  if (label) label.textContent = 'Artist cutoff';
  if (hint) hint.textContent = scenarioAThresholdHint();
  if (chips) chips.style.display = 'none';

  if (quickloadName) quickloadName.textContent = PINNED_PLAYLIST.name;
  if (quickloadMeta) {
    quickloadMeta.textContent = `${PINNED_PLAYLIST.filteredArtistCount} shown / ${PINNED_PLAYLIST.artistCount} artists / ${PINNED_PLAYLIST.trackCount} tracks`;
  }
  if (spotifyBtn) spotifyBtn.style.display = 'none';
  if (matchTab) matchTab.style.display = 'none';
  if (matchPane) matchPane.style.display = 'none';
  if (floatMatch) floatMatch.style.display = 'none';
  if (settingsHistory) settingsHistory.style.display = 'none';
  if (profileDialog) profileDialog.style.display = 'none';

  setMinTracks(scenarioAFixedMinTracks());
}

function renderSpotifyAccessButton() {
  const btn = document.getElementById('spotify-auth-btn');
  if (!btn) return;
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    btn.style.display = 'none';
    return;
  }

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
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    wrap.style.display = 'none';
    renderOnboardSetupNotice();
    return;
  }
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
    message = `${name} connected. Choose a playlist or open the sample.`;
    tone = 'ok';
  } else {
    message = 'Connect Spotify to browse your playlists, or paste any playlist link.';
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

  if (isScenarioAProductMode()) {
    wrap.style.display = '';
    status.textContent = 'Add one Ticketmaster key to enable live concert and festival scans for the pinned playlist.';
    btn.textContent = 'Add Ticketmaster key';
    return;
  }

  wrap.style.display = '';
  status.textContent = SERVER_MANAGED_SPOTIFY_LOGIN
    ? 'Spotify is ready. Add one free Ticketmaster key to unlock live concert and festival scans for your playlists.'
    : 'After Spotify setup, you will still need one Ticketmaster key for live concert and festival scans.';
  btn.textContent = 'Add Ticketmaster key';
}

async function fetchSpotifyUiJson(url, fetchOptions = {}, opts = {}) {
  const timeoutMs = Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `${opts.label || 'Spotify request'} failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error(`${opts.label || 'Spotify request'} timed out after ${Math.round(timeoutMs / 1000)}s.`);
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function refreshSpotifyAccount(opts = {}) {
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    return null;
  }
  if (!SERVER_MANAGED_SPOTIFY_LOGIN) return null;

  spotifyAccountState.loading = true;
  spotifyAccountState.error = '';
  renderOnboardSpotifyAuth();

  try {
    const data = await fetchSpotifyUiJson('/api/auth/spotify/session', {
      credentials: 'same-origin',
    }, {
      label: 'Spotify session check',
      timeoutMs: 12000,
    });

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
    const data = await fetchSpotifyUiJson('/api/spotify/me/playlists', {
      credentials: 'same-origin',
    }, {
      label: 'Spotify playlists',
      timeoutMs: 20000,
    });
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
    setSpotifyAuthFlash('Spotify connected. Choose a playlist or open the sample.', 'ok');
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
  markOnboardManualIntent();
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    usePinnedPlaylist({ start: true });
    return;
  }
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
  markOnboardManualIntent();
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    showOnboard();
    showNewImport();
    return;
  }
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

const ONBOARD_CACHE_SUMMARY_KEY = 'tt_onboard_cache_summary';

function markOnboardManualIntent() {
  window.__ttOnboardManualIntent = true;
}

function hasOnboardManualIntent() {
  return window.__ttOnboardManualIntent === true;
}

function clearOnboardManualIntent() {
  window.__ttOnboardManualIntent = false;
}

function readOnboardCacheSummary() {
  try {
    const raw = localStorage.getItem(ONBOARD_CACHE_SUMMARY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (isScenarioAProductMode() && !isPinnedPlaylistSelection(parsed.latestPlaylistUrl || '')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function syncOnboardCacheSummary() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const summary = {
      artistCount: Array.isArray(ARTISTS) ? ARTISTS.length : 0,
      concertCount: Array.isArray(concerts)
        ? concerts.filter(show => show?.date && show.date >= today).length
        : 0,
      festCount: Array.isArray(festivals)
        ? festivals.filter(fest => fest?.date && fest.date >= today).length
        : 0,
      cacheTimestamp: Number(cacheTimestamp) || 0,
      latestPlaylistUrl: getOnboardHistory()[0]?.url || '',
      ts: Date.now(),
    };
    localStorage.setItem(ONBOARD_CACHE_SUMMARY_KEY, JSON.stringify(summary));
    return summary;
  } catch {
    return null;
  }
}

function clearOnboardCacheSummary() {
  try {
    localStorage.removeItem(ONBOARD_CACHE_SUMMARY_KEY);
  } catch {}
}

function getDefaultOnboardPlaylistUrl() {
  if (isScenarioAProductMode()) return PINNED_PLAYLIST.url;
  return getOnboardHistory()[0]?.url || PINNED_PLAYLIST.url;
}

function focusOnboardPlaylistInput(selectText = false) {
  if (isScenarioAProductMode()) {
    document.getElementById('onboard-btn')?.focus();
    return;
  }
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  inp.focus();
  if (selectText) inp.select();
}

function usePinnedPlaylist(opts = {}) {
  const inp = document.getElementById('onboard-url');
  if (inp) inp.value = PINNED_PLAYLIST.url;
  syncOnboardPrimaryAction();
  if (opts.start) {
    return startOnboardPlaylistUrl(PINNED_PLAYLIST.url, PINNED_PLAYLIST.name || 'playlist');
  }
  focusOnboardPlaylistInput();
  return Promise.resolve(false);
}

async function handleOnboardPrimaryAction() {
  markOnboardManualIntent();
  primeOnboardPlaylistInput();
  return resumeOrImport();
}

function bindOnboardCardAction(el, handler, opts = {}) {
  if (!el || typeof handler !== 'function') return;

  let lastActivationTs = 0;
  const ignoredSelector = opts.ignoredSelector || '';
  const isIgnored = event => {
    if (!ignoredSelector || !event?.target?.closest) return false;
    return !!event.target.closest(ignoredSelector);
  };

  const activate = event => {
    if (event?.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (isIgnored(event)) return;

    const now = Date.now();
    if (now - lastActivationTs < 450) return;
    lastActivationTs = now;

    if (event?.preventDefault) event.preventDefault();
    handler(event);
  };

  el.addEventListener('click', activate);
  el.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch' || event.pointerType === 'pen') activate(event);
  });
  el.addEventListener('keydown', activate);
}

function startOnboardPlaylistUrl(url, label = 'playlist') {
  const cleanUrl = String(url || '').trim();
  const input = document.getElementById('onboard-url');
  if (input) input.value = cleanUrl;

  markOnboardManualIntent();
  syncOnboardPrimaryAction();

  const latestUrl = getOnboardHistory()[0]?.url || '';
  const cacheInfo = readOnboardCacheSummary();
  const canResume =
    samePlaylistUrl(cleanUrl, latestUrl) &&
    Number(cacheInfo?.artistCount) > 0;

  if (typeof onboardSetStatus === 'function') {
    onboardSetStatus(`Opening "${label || 'playlist'}"...`);
  }
  if (!canResume && typeof onboardShowProgress === 'function') {
    onboardShowProgress('Loading playlist...');
  }
  if (typeof onboardLog === 'function') {
    onboardLog(`Opening playlist: ${label || cleanUrl || 'playlist'}`, 'ok');
  }

  requestAnimationFrame(() => {
    setTimeout(() => {
      Promise.resolve(handleOnboardPrimaryAction()).catch(error => {
        if (typeof onboardSetStatus === 'function') {
          onboardSetStatus(error?.message || 'Playlist import failed.', '#ff7070');
        }
      });
    }, 16);
  });

  return Promise.resolve(true);
}

function installOnboardCardDelegates() {
  if (window.__ttOnboardCardDelegatesInstalled) return;
  const root = document.getElementById('onboard');
  if (!root) return;
  window.__ttOnboardCardDelegatesInstalled = true;

  const triggerFromTarget = target => {
    if (!target?.closest) return false;
    if (target.closest('.onboard-pl-del')) return false;

    const card = target.closest('.onboard-pl');
    if (!card || !root.contains(card)) return false;

    if (card.closest('#onboard-auth-list')) {
      const playlistId = card.dataset.playlistId || '';
      const item = (spotifyAccountState.playlists || []).find(entry => getOnboardSpotifyPlaylistId(entry) === playlistId);
      if (!item) return false;
      startOnboardSpotifyPlaylistSelection(item);
      return true;
    }

    const url = card.dataset.playlistUrl || '';
    const name = card.dataset.playlistName || 'playlist';
    if (!url) return false;
    startOnboardPlaylistUrl(url, name);
    return true;
  };

  const handle = event => {
    if (event.type === 'pointerup' && event.pointerType === 'mouse') return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;

    if (triggerFromTarget(event.target)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  root.addEventListener('click', handle, true);
  root.addEventListener('pointerup', handle, true);
  root.addEventListener('keydown', handle, true);
}

function syncOnboardPrimaryAction() {
  const inp = document.getElementById('onboard-url');
  const btn = document.getElementById('onboard-btn');
  if (!btn) return;
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    btn.textContent = 'Open playlist';
    return;
  }
  const raw = (inp?.value || '').trim();
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (samePlaylistUrl(raw, latestUrl)) {
    btn.textContent = 'Open last result';
  } else if (samePlaylistUrl(raw, PINNED_PLAYLIST.url)) {
    btn.textContent = 'Open sample';
  } else {
    btn.textContent = 'Scan playlist';
  }
}

function primeOnboardPlaylistInput() {
  const inp = document.getElementById('onboard-url');
  if (!inp) return;
  if (isScenarioAProductMode()) {
    applyScenarioAProductMode();
    inp.placeholder = PINNED_PLAYLIST.url;
    inp.value = PINNED_PLAYLIST.url;
    inp.readOnly = true;
    syncOnboardPrimaryAction();
    return;
  }
  inp.placeholder = 'https://open.spotify.com/playlist/...';
  if (!inp.value.trim()) inp.value = getDefaultOnboardPlaylistUrl();
  syncOnboardPrimaryAction();
}

function canInstantResumeFor(rawValue, info) {
  if (!info || info.artistCount <= 0) return false;
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (!rawValue) return true;
  if (!latestUrl) return false;
  return samePlaylistUrl(rawValue, latestUrl);
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
  const cachedSummary = readOnboardCacheSummary();
  if (isScenarioAProductMode() && (!cachedSummary || !isPinnedPlaylistSelection(cachedSummary.latestPlaylistUrl || ''))) {
    return null;
  }
  try {
    const keys = await DB.keys('artists');
    const artistKeys = keys.filter(key => key !== '__ping__');
    if (!artistKeys.length) {
      clearOnboardCacheSummary();
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    let festCount = Number(cachedSummary?.festCount) || 0;
    try {
      const fc = await DB.get('meta', 'festivals');
      if (Array.isArray(fc?.data)) {
        festCount = fc.data.filter(fest => fest?.date && fest.date >= today).length;
      }
    } catch {}
    return {
      artistCount: artistKeys.length,
      concertCount: Number(cachedSummary?.concertCount) || 0,
      festCount,
      cacheTimestamp: Number(cachedSummary?.cacheTimestamp) || 0,
      latestPlaylistUrl: cachedSummary?.latestPlaylistUrl || '',
      ts: Number(cachedSummary?.ts) || 0,
    };
  } catch {
    return cachedSummary || null;
  }
}

// Rebuild concerts + festivals from IDB cache instantly
async function instantResume(opts = {}) {
  if (!opts.manual && hasOnboardManualIntent()) return false;

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
  if (typeof applyScoreFilterLevel === 'function') {
    applyScoreFilterLevel(_obScore);
  } else {
    calScoreFilter = _obScore;
    mapScoreFilter = _obScore;
    document.querySelectorAll('#score-filter-row .plays-chip').forEach(c =>
      c.classList.toggle('on', parseInt(c.dataset.s) === calScoreFilter));
    document.querySelectorAll('[data-ms]').forEach(c =>
      c.classList.toggle('on', parseInt(c.dataset.ms) === mapScoreFilter));
  }

  // Apply min-tracks filter — same logic as runSpotifyImport but applied here
  // so Quick Load respects the chip selection too
  const minT = getEffectiveMinTracks();
  if (minT > 1 && ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length) {
    const before = Array.isArray(ARTISTS) ? ARTISTS.length : 0;
    const sourceArtists = (Array.isArray(TRACKED_ARTISTS) && TRACKED_ARTISTS.length)
      ? TRACKED_ARTISTS
      : ARTISTS;
    ARTISTS = filterArtistsByPlayThreshold(sourceArtists, ARTIST_PLAYS, minT);
    const skipped = before - ARTISTS.length;
    if (skipped > 0) dblog('info', `Min-tracks filter (>=${minT}): kept ${ARTISTS.length} artists, skipped ${skipped}`);
  }

  const today = new Date().toISOString().split('T')[0];
  try {
    // Rebuild concerts from IDB artist cache. getAll pulls every record in a
    // single read transaction, which is O(N) faster than the previous N×DB.get
    // loop (e.g. 384 sequential round-trips → one scan for the pinned playlist).
    // Festival meta fetch rides the same Promise.all so both stores are read
    // concurrently instead of one after the other.
    const [keys, records, fc] = await Promise.all([
      DB.keys('artists'),
      DB.getAll('artists'),
      DB.get('meta', 'festivals').catch(() => null),
    ]);
    const artistKeys = [];
    const artistRecords = [];
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === '__ping__') continue;
      artistKeys.push(keys[i]);
      artistRecords.push(records[i]);
    }
    setScannedArtists(artistKeys);
    if (!TRACKED_ARTISTS.length) {
      setTrackedArtists([...ARTISTS, ...Object.keys(ARTIST_PLAYS || {}), ...artistKeys]);
    }
    concerts = [];
    for (const rec of artistRecords) {
      if (rec?.shows) {
        for (const show of rec.shows) {
          if (show.date >= today) concerts.push(show);
        }
      }
    }
    concerts = deduplicateConcerts(concerts);
    applyScenarioAResultFilter();

    // Rebuild festivals from IDB meta cache (already fetched above)
    if (fc?.data) festivals = deduplicateFestivals(fc.data.filter(f => f.date >= today));

    cacheTimestamp = Date.now();

    if (festivals.length && ARTISTS.length) scoreFestivals();
    persistData();
    clearOnboardManualIntent();

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
  markOnboardManualIntent();
  document.getElementById('onboard-resume').style.display = 'none';
  document.getElementById('onboard-import-panel').style.display = '';
  if (isScenarioAProductMode()) applyScenarioAProductMode();
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
  if (isScenarioAProductMode()) applyScenarioAProductMode();
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
  try {
    const parsed = JSON.parse(localStorage.getItem('tt_pl_history') || '[]');
    const list = Array.isArray(parsed) ? parsed : [];
    if (!isScenarioAProductMode()) return list;
    return list.filter(item => isPinnedPlaylistSelection(item?.url || ''));
  } catch {
    return [];
  }
}
function saveOnboardHistory(list) {
  const items = Array.isArray(list) ? list : [];
  const next = isScenarioAProductMode()
    ? items.filter(item => isPinnedPlaylistSelection(item?.url || '')).slice(0, 1)
    : items.slice(0, 10);
  localStorage.setItem('tt_pl_history', JSON.stringify(next));
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
  if (isScenarioAProductMode()) {
    const wrap = document.getElementById('onboard-history-wrap');
    const hist = document.getElementById('onboard-history');
    const ql = document.getElementById('onboard-quickload');
    if (wrap) wrap.style.display = 'none';
    if (hist) hist.innerHTML = '';
    if (ql) ql.style.display = '';
    return;
  }
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
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.dataset.playlistUrl = p.url || '';
      el.dataset.playlistName = p.name || 'playlist';
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
      bindOnboardCardAction(el, () => {
        startOnboardPlaylistUrl(p.url, p.name || 'playlist');
      }, { ignoredSelector: '.onboard-pl-del' });
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
  el.textContent = msg || '';
  el.style.color = color || '';
}

let _minTracksFilter = 1; // global: min track count for artist to be included in scan

function setMinTracks(v) {
  _minTracksFilter = isScenarioAProductMode() ? scenarioAFixedMinTracks() : v;
  document.querySelectorAll('.onboard-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === _minTracksFilter));
  const hint = document.getElementById('onboard-mintracks-hint');
  if (hint) {
    if (isScenarioAProductMode()) {
      const universe = (Array.isArray(TRACKED_ARTISTS) && TRACKED_ARTISTS.length)
        ? TRACKED_ARTISTS
        : Object.keys(ARTIST_PLAYS || {});
      const shown = universe.length
        ? filterArtistsByPlayThreshold(universe, ARTIST_PLAYS, scenarioAFixedMinTracks()).length
        : PINNED_PLAYLIST.filteredArtistCount;
      hint.textContent = scenarioAThresholdHint(shown);
    } else if (_minTracksFilter <= 1) {
      hint.textContent = 'all artists';
    } else if (ARTIST_PLAYS && Object.keys(ARTIST_PLAYS).length) {
      const universe = (Array.isArray(TRACKED_ARTISTS) && TRACKED_ARTISTS.length)
        ? TRACKED_ARTISTS
        : uniqueArtistNames([
            ...(Array.isArray(ARTISTS) ? ARTISTS : []),
            ...Object.keys(ARTIST_PLAYS || {}),
          ]);
      const passing = filterArtistsByPlayThreshold(universe, ARTIST_PLAYS, _minTracksFilter).length;
      hint.textContent = `${passing} of ${universe.length} artists`;
    } else {
      hint.textContent = 'artists with <' + _minTracksFilter + ' tracks skipped';
    }
  }
  document.querySelectorAll('.settings-mt-chip').forEach(b =>
    b.classList.toggle('on', +b.dataset.v === _minTracksFilter));
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
  if (fill) fill.style.width = '8%';
  const lbl = document.getElementById('onboard-prog-label');
  if (lbl) lbl.textContent = label || 'Loading playlist...';
  _onboardStartTs = Date.now();
  _onboardAborted = false;

  const logBox = document.getElementById('onboard-minilog');
  if (logBox) logBox.innerHTML = '';
  const logWrap = document.getElementById('onboard-minilog-wrap');
  if (logWrap) logWrap.style.display = 'none';

  clearInterval(_onboardTimerInt);
  _onboardTimerInt = setInterval(() => {
    const elapsed = Math.round((Date.now() - _onboardStartTs) / 1000);
    const el = document.getElementById('onboard-prog-timer');
    if (el) el.textContent = `${elapsed}s`;
    if (elapsed >= 5 && logWrap) logWrap.style.display = '';
    const currentFill = document.getElementById('onboard-prog-fill');
    const pct = currentFill ? parseFloat(currentFill.style.width) : 0;
    if (currentFill && Number.isFinite(pct) && pct < 68) {
      const nextPct = Math.min(68, pct + (elapsed < 12 ? 1.6 : 0.7));
      currentFill.style.width = `${nextPct}%`;
    }
    if (elapsed === 10 && pct < 15) {
      onboardLog('Still waiting for Spotify. The server request is taking longer than usual.', 'warn');
    }
    if (elapsed === 20 && pct < 15) {
      onboardLog('You can keep waiting or cancel and try again. Cached results are not affected.', 'warn');
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
  const lbl = document.getElementById('onboard-prog-label');
  const pct = total ? Math.round(done / total * 100) : 28;
  if (fill) fill.style.width = `${Math.max(8, Math.min(100, pct))}%`;
  if (lbl) {
    lbl.textContent = total
      ? `Imported ${done} / ${total} tracks`
      : 'Preparing artist list...';
  }
}

function onboardClearProgress() {
  onboardHideProgress();
}

function onboardCancel() {
  _onboardAborted = true;
  onboardHideProgress();
  onboardSetStatus('Import canceled.');
  spTokenCache = null;
  spotifyAccountState.pendingPlaylistId = '';
  renderSpotifyPlaylistChoices();
  const btn = document.getElementById('onboard-btn');
  if (btn) btn.disabled = false;
  syncOnboardPrimaryAction();
}


// ── Shared Spotify import logic ──────────────────────────────────
// Used by both onboarding screen and settings modal.
// opts.mode: 'onboard' | 'settings'
// Returns true on success, false on failure.
function spNormalizeArtistTrackRecord(track) {
  if (!track) return null;
  const spotifyUrl = track.external_urls?.spotify || track.externalUrl || '';
  const albumImage = track.album?.images?.[0]?.url || track.albumImage || '';
  return {
    id: track.id || track.uri || spotifyUrl || '',
    name: track.name || 'Untitled track',
    previewUrl: track.preview_url || track.previewUrl || '',
    spotifyUrl,
    durationMs: Number(track.duration_ms || track.durationMs || 0) || 0,
    albumName: track.album?.name || track.albumName || '',
    albumImage,
  };
}

function spBuildArtistTrackIndex(tracks, opts = {}) {
  const maxTracksPerArtist = Math.max(4, Number(opts.maxTracksPerArtist) || 12);
  const buckets = new Map();

  (tracks || []).forEach((track, trackIdx) => {
    if (!track || track.is_local) return;
    const normalizedTrack = spNormalizeArtistTrackRecord(track);
    if (!normalizedTrack) return;

    (track.artists || []).forEach(artist => {
      const artistName = String(artist?.name || '').trim();
      if (!artistName) return;
      const bucketKey = typeof _normText === 'function' ? _normText(artistName) : artistName.toLowerCase();
      if (!bucketKey) return;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          artist: artistName,
          aliases: new Set(typeof artistTrackLookupKeys === 'function' ? artistTrackLookupKeys(artistName) : [bucketKey]),
          totalTrackHits: 0,
          tracks: new Map(),
        });
      }

      const bucket = buckets.get(bucketKey);
      bucket.totalTrackHits += 1;
      (typeof artistTrackLookupKeys === 'function' ? artistTrackLookupKeys(artistName) : [bucketKey]).forEach(key => {
        if (key) bucket.aliases.add(key);
      });

      const trackKey = normalizedTrack.id || `${normalizedTrack.name}|${bucketKey}`;
      if (!bucket.tracks.has(trackKey)) {
        bucket.tracks.set(trackKey, {
          ...normalizedTrack,
          count: 0,
          firstSeen: trackIdx,
        });
      }
      bucket.tracks.get(trackKey).count += 1;
    });
  });

  const index = {};
  buckets.forEach(bucket => {
    const rankedTracks = [...bucket.tracks.values()]
      .sort((a, b) => (b.count - a.count) || (a.firstSeen - b.firstSeen) || a.name.localeCompare(b.name))
      .slice(0, maxTracksPerArtist)
      .map(track => ({
        id: track.id,
        name: track.name,
        previewUrl: track.previewUrl,
        spotifyUrl: track.spotifyUrl,
        durationMs: track.durationMs,
        albumName: track.albumName,
        albumImage: track.albumImage,
        count: track.count,
      }));

    const summary = {
      artist: bucket.artist,
      totalTrackHits: bucket.totalTrackHits,
      uniqueTrackCount: bucket.tracks.size,
      tracks: rankedTracks,
    };

    bucket.aliases.forEach(key => {
      if (key) index[key] = summary;
    });
  });

  return index;
}

function spBuildPlaylistMeta(playlist, fallbackUrl, importedTrackCount) {
  return {
    id: playlist?.id || '',
    name: playlist?.name || 'Playlist',
    spotifyUrl: playlist?.external_urls?.spotify || fallbackUrl || '',
    coverUrl: playlist?.images?.[0]?.url || '',
    ownerName: playlist?.owner?.display_name || playlist?.ownerName || '',
    trackCount: Number(playlist?.tracks?.total || importedTrackCount || 0) || 0,
    importedAt: Date.now(),
  };
}

async function legacyRunSpotifyImport(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';

  const urlInputId = isOnboard ? 'onboard-url' : 'sp-playlist-url';
  const btnId      = isOnboard ? 'onboard-btn'  : 'sp-import-btn';

  const raw = resolveSpotifyImportUrl(
    (document.getElementById(urlInputId)?.value || '').trim(),
    isOnboard,
  );
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
    const minT = getEffectiveMinTracks();
    const artists = minT > 1 ? allArtists.filter(a => a.count >= minT) : allArtists;
    setTrackedArtists(allArtists.map(a => a.name));
    ARTIST_PLAYS = Object.fromEntries(allArtists.map(a => [a.name.toLowerCase(), a.count]));
    setArtistTrackState(
      spBuildArtistTrackIndex(tracks),
      spBuildPlaylistMeta(pl, raw, tracks.length)
    );
    persistArtistTrackState().catch(() => {});
    setMinTracks(minT);
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

async function runSpotifyImport(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';
  const urlInputId = isOnboard ? 'onboard-url' : 'sp-playlist-url';
  const btnId = isOnboard ? 'onboard-btn' : 'sp-import-btn';
  const raw = resolveSpotifyImportUrl(
    (document.getElementById(urlInputId)?.value || '').trim(),
    isOnboard,
  );
  const pid = spExtractId(raw);

  if (!pid) {
    if (isOnboard) onboardSetStatus('Paste a valid Spotify playlist URL.', '#ff7070');
    else spSetError("Couldn't parse playlist ID. Paste the full Spotify URL.");
    return false;
  }

  const btn = document.getElementById(btnId);
  if (btn) {
    btn.disabled = true;
    btn.textContent = isOnboard ? 'Loading...' : 'Importing...';
  }

  spotifyAccountState.pendingPlaylistId = pid;
  renderSpotifyPlaylistChoices();

  if (isOnboard) onboardShowProgress('Loading playlist...');
  if (isOnboard) {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  const setStatus = isOnboard
    ? (msg, color) => onboardSetStatus(msg, color)
    : (msg, color) => {
        const el = document.getElementById('hero-status-text');
        if (!el) return;
        el.style.color = color || '';
        el.textContent = msg;
      };
  const setProgress = isOnboard
    ? (done, total) => {
        if (_onboardAborted) return;
        onboardSetProgress(done, total);
      }
    : (done, total) => spSetProgress(done, total);
  const clearProgress = isOnboard ? onboardClearProgress : spClearProgress;

  let success = false;
  try {
    setStatus('Loading playlist from Spotify...', '');
    setProgress(1, 4);
    onboardLog('Requesting playlist from the local server...', 'ok');

    const payload = await spFetchPlaylistImport(pid);
    if (isOnboard && _onboardAborted) return false;

    const pl = payload?.playlist || {};
    const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
    if (!tracks.length) {
      throw new Error('This playlist has no tracks to scan.');
    }

    setProgress(3, 4);
    onboardLog(`Playlist loaded: ${tracks.length} tracks`, 'ok');

    const artistMap = spBuildArtistMap(tracks);
    const allArtists = Object.values(artistMap).sort((a, b) => b.count - a.count);
    if (!allArtists.length) {
      throw new Error('This playlist has no scannable artist data.');
    }

    const minT = getEffectiveMinTracks();
    const artists = minT > 1 ? allArtists.filter(a => a.count >= minT) : allArtists;
    setTrackedArtists(allArtists.map(a => a.name));
    ARTIST_PLAYS = Object.fromEntries(allArtists.map(a => [a.name.toLowerCase(), a.count]));
    setArtistTrackState(
      spBuildArtistTrackIndex(tracks),
      spBuildPlaylistMeta(pl, raw, tracks.length)
    );
    persistArtistTrackState().catch(() => {});
    setMinTracks(minT);
    if (!artists.length) {
      throw new Error(`No artists matched the current threshold (${minT}+ tracks).`);
    }

    const skipped = allArtists.length - artists.length;
    if (skipped > 0) {
      dblog('info', `Min-tracks filter (>=${minT}): kept ${artists.length} artists, skipped ${skipped} with fewer tracks`);
    }

    const lines = artists.map(a => `${a.name} ${a.count}`);
    const ta = document.getElementById('artists-ta');
    if (ta) ta.value = lines.join('\n');
    updateArtistCount();

    const coverUrl = pl.images?.[0]?.url || '';
    const topArtists = artists.slice(0, 8).map(a => a.name);
    addToOnboardHistory(pl.name || 'Playlist', raw, tracks.length, artists.length, coverUrl, topArtists);
    renderOnboardHistory();

    const onboardInput = document.getElementById('onboard-url');
    const settingsInput = document.getElementById('sp-playlist-url');
    if (onboardInput && onboardInput.value !== raw) onboardInput.value = raw;
    if (settingsInput && settingsInput.value !== raw) settingsInput.value = raw;

    setProgress(4, 4);
    clearProgress();
    const skipNote = skipped > 0 ? ` (${skipped} skipped below ${minT})` : '';
    setStatus(`"${pl.name || 'Playlist'}" loaded. ${artists.length} artists${skipNote}. Starting concert scan...`, 'var(--accent)');

    setTimeout(() => {
      if (isOnboard) profHideEmpty();
      else closeSettings();
      saveAndFetch(false);
    }, 500);

    success = true;
    return true;
  } catch (error) {
    clearProgress();
    onboardLog(error.message || 'Playlist import failed.', 'err');
    setStatus(error.message || 'Playlist import failed.', '#ff7070');
    if (btn) {
      btn.disabled = false;
      btn.textContent = isOnboard ? 'Try again' : 'Import & Scan';
    }
    if (isOnboard) syncOnboardPrimaryAction();
    return false;
  } finally {
    spotifyAccountState.pendingPlaylistId = '';
    renderSpotifyPlaylistChoices();
    if (!success && !isOnboard && btn) {
      btn.disabled = false;
    }
  }
}

async function runSpotifyImportV2(opts = {}) {
  return runSpotifyImport(opts);
}

// Smart entry point: if IDB has cached data, resume instantly; otherwise run full Spotify import
async function resumeOrImport() {
  const raw = resolveSpotifyImportUrl((document.getElementById('onboard-url')?.value || '').trim(), true);
  const latestUrl = getOnboardHistory()[0]?.url || '';
  if (raw && (!latestUrl || !samePlaylistUrl(raw, latestUrl))) {
    return onboardImport();
  }
  const info = await checkIDBCache().catch(() => null);
  if (canInstantResumeFor(raw, info)) {
    return instantResume({ manual: true });
  } else {
    return onboardImport();
  }
}

// Thin wrappers that delegate to the shared function
async function onboardImport() { return runSpotifyImportV2({ mode: 'onboard' }); }
async function spotifyImport()  { return runSpotifyImportV2({ mode: 'settings' }); }

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════
