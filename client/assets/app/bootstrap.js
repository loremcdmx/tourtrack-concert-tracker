'use strict';

function showInitialOnboardImport() {
  setStatus(
    isScenarioAProductMode()
      ? `Pinned playlist ready — only artists with ${scenarioAFixedMinTracks()}+ repeats enter the product`
      : 'Connect Spotify or open the sample to get started',
    false,
  );
  renderOnboardHistory();
  const skip = document.getElementById('onboard-skip');
  if (skip) skip.style.display = 'none';
  setTimeout(() => {
    const inp = document.getElementById('onboard-url');
    if (inp) inp.focus();
  }, 150);
}

function hasScenarioAStoredSession() {
  if (!isScenarioAProductMode()) return true;
  const latestUrl = getOnboardHistory()[0]?.url || readOnboardCacheSummary()?.latestPlaylistUrl || '';
  return isPinnedPlaylistSelection(latestUrl);
}

const _vbadge = document.getElementById('app-ver-badge');
if (_vbadge) _vbadge.textContent = 'v' + (SERVER_CONFIG.appVersion || APP_VERSION);
const _onboardUrlInput = document.getElementById('onboard-url');
if (_onboardUrlInput) {
  _onboardUrlInput.addEventListener('input', syncOnboardPrimaryAction);
}
handleSpotifyAuthReturnFlag();
restore();
profInit();
restoreProxySettings();
if (isScenarioAProductMode() && !hasScenarioAStoredSession()) {
  ARTISTS = [];
  TRACKED_ARTISTS = [];
  SCANNED_ARTISTS = [];
  ARTIST_PLAYS = {};
  ARTIST_TRACKS = {};
  SPOTIFY_PLAYLIST_META = null;
  concerts = [];
  festivals = [];
  cacheTimestamp = 0;
}
if (isScenarioAProductMode()) applyScenarioAProductMode();
renderSpotifyAccessButton();
renderOnboardSpotifyAuth();
installOnboardCardDelegates();
if (!isScenarioAProductMode()) {
  refreshSpotifyAccount({ withPlaylists: !!spotifyAuthFlash }).catch(() => {});
}
initMap();

if (ARTISTS.length) {
  const ta = document.getElementById('artists-ta');
  if (ta) {
    ta.value = ARTISTS.map(name => {
      const plays = Number((ARTIST_PLAYS || {})[String(name || '').toLowerCase()] || 0);
      return plays > 0 ? `${name} ${plays}` : name;
    }).join('\n');
  }
}
updateArtistCount();

if (concerts.length || festivals.length) {
  if (festivals.length && ARTISTS.length) scoreFestivals();
  setStatus(`${concerts.length} concerts · ${festivals.length} festivals · cached ${cacheAge()} — use ↻ Merge rescan to refresh`, true);
  buildCalChips();
  renderCalendar();
  renderMap();
  hideOnboard();
} else {
  const onboardEl = document.getElementById('onboard');
  if (onboardEl) onboardEl.classList.remove('hidden');

  if (spotifyAuthFlash?.message) {
    showInitialOnboardImport();
  } else {
    checkIDBCache().then(info => {
      if (typeof hasOnboardManualIntent === 'function' && hasOnboardManualIntent()) return;
      if (info && info.artistCount > 0) {
        instantResume();
      } else {
        showInitialOnboardImport();
      }
    }).catch(() => {
      if (typeof hasOnboardManualIntent === 'function' && hasOnboardManualIntent()) return;
      showOnboard();
    });
  }
}
