'use strict';

// One import owns the HTTP request, session commit and delayed scan together.
let _playlistImportGeneration = 0;
let _playlistImportController = null;
let _playlistImportScanTimer = null;
let _playlistImportMinTracks = 1;
let _playlistImportTarget = '';

function cancelPlaylistImport() {
  _playlistImportGeneration += 1;
  _playlistImportController?.abort();
  _playlistImportController = null;
  clearTimeout(_playlistImportScanTimer);
  _playlistImportScanTimer = null;
  _playlistImportTarget = '';
  spotifyAccountState.pendingPlaylistId = '';
  for (const id of ['onboard-btn', 'sp-import-btn']) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = false;
  }
  renderSpotifyPlaylistChoices();
}

function setPlaylistImportMinTracks(value) {
  _playlistImportMinTracks = Math.max(1, Math.round(Number(value) || 1));
  document.querySelectorAll('[data-import-cutoff]').forEach(btn => {
    const selected = Number(btn.dataset.importCutoff) === _playlistImportMinTracks;
    btn.classList.toggle('on', selected);
    btn.setAttribute('aria-pressed', String(selected));
  });
  const hint = document.getElementById('onboard-mintracks-hint');
  if (hint) hint.textContent = _playlistImportMinTracks === 1
    ? 'Include every artist'
    : `Include artists with ${_playlistImportMinTracks}+ tracks`;
}

function renderPlaylistContext() {
  const link = document.getElementById('active-playlist-link');
  if (!link) return;
  const meta = SPOTIFY_PLAYLIST_META;
  const id = getActivePlaylistSessionId() || spExtractId(meta?.spotifyUrl || '') || meta?.id;
  if (id && /^[a-zA-Z0-9]{22}$/.test(id)) {
    link.href = `https://open.spotify.com/playlist/${id}`;
    link.textContent = `Spotify · ${meta?.name || 'Your playlist'}`;
    link.hidden = false;
    document.getElementById('playlist-context-default').hidden = true;
  } else {
    link.hidden = true;
    document.getElementById('playlist-context-default').hidden = false;
  }
}

function applyPlaylistLinkProductMode() {
  if (isScenarioAProductMode()) return;
  document.body.classList.add('playlist-links');
  document.querySelector('.onboard-headnote').textContent = 'Your music, live';
  document.getElementById('onboard-main-title').textContent = DEFAULT_ONBOARD_TITLE;
  document.getElementById('onboard-sub-text').textContent = DEFAULT_ONBOARD_SUB;
  for (const id of ['onboard-url', 'sp-playlist-url']) {
    const input = document.getElementById(id);
    input.readOnly = false;
    input.removeAttribute('aria-readonly');
  }
  const chips = document.getElementById('onboard-mintracks-chips');
  chips.style.display = '';
  chips.replaceChildren();
  for (const cutoff of [1, 2, 4, 8]) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'onboard-mt-chip';
    btn.dataset.importCutoff = String(cutoff);
    btn.textContent = cutoff === 1 ? 'All' : `${cutoff}+`;
    btn.onclick = () => setPlaylistImportMinTracks(cutoff);
    chips.appendChild(btn);
  }
  setPlaylistImportMinTracks(1);
  renderPlaylistContext();
  try {
    const pending = localStorage.getItem('tt_pending_spotify_playlist');
    if (pending && spotifyAuthFlash) {
      document.getElementById('onboard-url').value = pending;
      localStorage.removeItem('tt_pending_spotify_playlist');
      window.__ttRestorePlaylistImport = true;
    }
  } catch (_) {}
}

function openPlaylistImport() {
  if (isScenarioAProductMode()) return openSpotifyAccess();
  cancelPlaylistImport();
  _onboardAborted = false;
  closeSettings();
  showOnboard();
  showNewImport();
  onboardClearProgress();
  clearPlaylistImportError();
  setPlaylistImportMinTracks(1);
  onboardSetStatus('Paste a playlist link, or reopen a saved playlist below.');
  focusOnboardPlaylistInput(true);
}

function clearPlaylistImportError() {
  const actions = document.getElementById('playlist-error-actions');
  if (actions) actions.hidden = true;
}

function showPlaylistImportError(error, raw, mode) {
  const accessError = ['SPOTIFY_LOGIN_REQUIRED', 'PLAYLIST_ACCESS_DENIED'].includes(error?.code)
    || error?.status === 401 || error?.status === 403;
  let message = error?.message || 'Playlist import failed. Try again.';
  if (accessError) {
    message = spotifyAccountState.connected
      ? 'Spotify restricts this playlist. Sign in as its owner or collaborator, then try again.'
      : 'Connect Spotify as the playlist owner or collaborator, then try this link again.';
  } else if (error?.code === 'PLAYLIST_NOT_FOUND' || error?.status === 404) {
    message = 'Spotify could not find this playlist. Check the link and your account access.';
  } else if (error?.status === 429) {
    message = `Spotify is busy. Try again${error.retryAfter ? ` in ${error.retryAfter}s` : ' shortly'}.`;
  }
  if (mode === 'onboard') onboardSetStatus(message, 'var(--red)');
  else spSetError(message);
  const actions = document.getElementById('playlist-error-actions');
  if (actions) actions.hidden = !accessError;
  const login = document.getElementById('playlist-login-action');
  if (login) {
    login.hidden = !SERVER_MANAGED_SPOTIFY_LOGIN;
    login.textContent = spotifyAccountState.connected ? 'Switch Spotify account' : 'Connect Spotify';
  }
  const link = document.getElementById('playlist-access-link');
  const id = spExtractId(raw);
  if (link) {
    link.hidden = !id;
    if (id) link.href = `https://open.spotify.com/playlist/${id}`;
  }
  if (accessError) renderOnboardSpotifyAuth();
}

async function resolveSpotifyPlaylistLink(raw, { signal } = {}) {
  const id = spExtractId(raw);
  if (id) return { id, url: `https://open.spotify.com/playlist/${id}` };
  let short;
  try { short = new URL(raw); } catch (_) {}
  if (short?.protocol === 'https:' && short.hostname === 'spotify.link'
      && !short.username && !short.password && !short.port && short.pathname !== '/') {
    return spFetchServerJson('/api/spotify/resolve-link', {
      method: 'POST', credentials: 'same-origin', signal,
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: short.href }),
    }, { label: 'Spotify link', timeoutMs: 15000 });
  }
  throw new Error('Paste a Spotify playlist link (open.spotify.com or spotify.link).');
}

async function importPlaylistByLink(opts = {}) {
  const mode = opts.mode || 'onboard';
  const isOnboard = mode === 'onboard';
  const input = document.getElementById(isOnboard ? 'onboard-url' : 'sp-playlist-url');
  const raw = resolveSpotifyImportUrl(input?.value || '', isOnboard);
  cancelPlaylistImport();
  const generation = _playlistImportGeneration;
  const profile = activeProf;
  const current = () => generation === _playlistImportGeneration && activeProf === profile;
  const controller = new AbortController();
  _playlistImportController = controller;
  _playlistImportTarget = raw;
  _onboardAborted = false;
  clearPlaylistImportError();
  const btn = document.getElementById(isOnboard ? 'onboard-btn' : 'sp-import-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Loading playlist…'; }
  if (isOnboard) onboardShowProgress('Loading playlist…');
  let canonical = raw;
  try {
    const resolved = await resolveSpotifyPlaylistLink(raw, { signal: controller.signal });
    if (!current()) return false;
    const pid = resolved.id;
    canonical = resolved.url;
    if (!/^[a-zA-Z0-9]{22}$/.test(pid || '')) throw new Error('Spotify returned an invalid playlist link.');
    _playlistImportTarget = canonical;
    spotifyAccountState.pendingPlaylistId = pid;
    renderSpotifyPlaylistChoices();
    const minTracks = isScenarioAProductMode() ? scenarioAFixedMinTracks() : _playlistImportMinTracks;
    const payload = await spFetchPlaylistImport(pid, { signal: controller.signal });
    if (!current()) return false;
    const tracks = Array.isArray(payload?.tracks) ? payload.tracks : [];
    if (!tracks.length) throw new Error('This playlist has no available music tracks to scan.');
    const allArtists = Object.values(spBuildArtistMap(tracks)).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const artists = allArtists.filter(artist => artist.count >= minTracks);
    if (!artists.length) throw new Error(`No artists have ${minTracks}+ tracks in this playlist. Lower the artist cutoff and try again.`);
    const playlistMeta = spBuildPlaylistMeta({ ...payload.playlist, id: pid }, canonical, tracks.length);
    playlistMeta.importSummary = payload.importSummary || null;
    const result = await activateImportedPlaylistSession({
      playlistId: pid, playlistMeta, artists: artists.map(a => a.name),
      trackedArtists: allArtists.map(a => a.name),
      artistPlays: Object.fromEntries(allArtists.map(a => [a.name.toLowerCase(), a.count])),
      artistTracks: spBuildArtistTrackIndex(tracks), minTracks,
    }, { isCurrent: current });
    if (!current() || !result.committed) return false;
    document.getElementById('artists-ta').value = artists.map(a => `${a.name} ${a.count}`).join('\n');
    updateArtistCount();
    for (const id of ['onboard-url', 'sp-playlist-url']) document.getElementById(id).value = canonical;
    let saveWarning = '';
    try {
      addToOnboardHistory(playlistMeta.name, canonical, tracks.length, artists.length,
        playlistMeta.coverUrl, artists.slice(0, 8).map(a => a.name));
    } catch (_) { saveWarning = 'Playlist loaded, but history could not be saved on this device.'; }
    renderOnboardHistory();
    renderPlaylistContext();
    persistSettings();
    await persistActivePlaylistSession().catch(() => {
      saveWarning = 'Playlist loaded. This device could not save the latest changes.';
    });
    if (!current()) return false;
    const summary = payload.importSummary;
    const skipped = summary?.skippedItems ? Object.values(summary.skippedItems).reduce((sum, count) => sum + (Number(count) || 0), 0) : 0;
    const message = `${playlistMeta.name} · ${tracks.length} tracks · ${artists.length} artists${skipped ? ` · ${skipped} unavailable, local or podcast items skipped` : ''}`;
    if (isOnboard) { onboardClearProgress(); onboardSetStatus(saveWarning || `${message}. Starting concert scan…`, saveWarning ? 'var(--red)' : 'var(--accent)'); }
    else document.getElementById('hero-status-text').textContent = message;
    buildCalChips(); renderCalendar(); renderMap();
    // Retain a cancellable handoff so a new link/cancel cannot start this scan.
    _playlistImportScanTimer = setTimeout(() => {
      _playlistImportScanTimer = null;
      if (!current() || getActivePlaylistSessionId() !== pid) return;
      if (isOnboard) profHideEmpty(); else closeSettings();
      saveAndFetch(false);
    }, 500);
    return true;
  } catch (error) {
    if (!current()) return false;
    if (isOnboard) onboardClearProgress(); else spClearProgress();
    if (error?.name !== 'AbortError') showPlaylistImportError(error, canonical, mode);
    return false;
  } finally {
    if (current()) {
      _playlistImportController = null;
      spotifyAccountState.pendingPlaylistId = '';
      renderSpotifyPlaylistChoices();
      if (btn) btn.disabled = false;
      if (isOnboard) syncOnboardPrimaryAction(); else if (btn) btn.textContent = 'Import & scan';
    }
  }
}

async function resumePlaylistByLink() {
  const raw = resolveSpotifyImportUrl(document.getElementById('onboard-url')?.value || '', true);
  const id = spExtractId(raw);
  if (!id) return onboardImport();
  cancelPlaylistImport();
  const generation = _playlistImportGeneration;
  const profile = activeProf;
  const current = () => generation === _playlistImportGeneration && activeProf === profile;
  _playlistImportTarget = raw;
  try {
    const result = await resumePlaylistSession(id, { isCurrent: current });
    if (!current()) return false;
    if (!result.committed) return onboardImport();
    document.getElementById('artists-ta').value = ARTISTS.map(a => `${a} ${ARTIST_PLAYS[a.toLowerCase()] || 0}`).join('\n');
    updateArtistCount();
    renderPlaylistContext();
    buildCalChips(); renderCalendar(); renderMap();
    setStatus(`${SPOTIFY_PLAYLIST_META?.name || 'Playlist'} · ${concerts.length} concerts · ${festivals.length} festivals · saved`, true);
    hideOnboard();
    return true;
  } catch (error) {
    if (current()) showPlaylistImportError(error, raw, 'onboard');
    return false;
  }
}

for (const id of ['onboard-url', 'sp-playlist-url']) {
  document.getElementById(id)?.addEventListener('input', event => {
    if (_playlistImportTarget && !samePlaylistUrl(event.target.value, _playlistImportTarget)
        && event.target.value.trim() !== _playlistImportTarget) {
      cancelPlaylistImport();
      onboardClearProgress();
      onboardSetStatus('Link changed. Ready to import this playlist.');
    }
    clearPlaylistImportError();
  });
}
