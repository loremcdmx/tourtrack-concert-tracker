'use strict';

const _vbadge = document.getElementById('app-ver-badge');
if (_vbadge) _vbadge.textContent = 'v' + (SERVER_CONFIG.appVersion || APP_VERSION);
const _onboardUrlInput = document.getElementById('onboard-url');
if (_onboardUrlInput) {
  _onboardUrlInput.addEventListener('input', syncOnboardPrimaryAction);
}
handleSpotifyAuthReturnFlag();
restore();
profInit();       // load active profile snapshot into ARTISTS/ARTIST_PLAYS if non-Main
restoreProxySettings();
renderSpotifyAccessButton();
renderOnboardSpotifyAuth();
refreshSpotifyAccount({ withPlaylists: !!spotifyAuthFlash }).catch(() => {});
initMap();

if (ARTISTS.length) {
  const ta = document.getElementById('artists-ta');
  if (ta) ta.value = ARTISTS.join('\n');
}
updateArtistCount();

if (concerts.length || festivals.length) {
  // Data in localStorage — go straight to app immediately
  if (festivals.length && ARTISTS.length) scoreFestivals();
  setStatus(`${concerts.length} concerts · ${festivals.length} festivals · cached ${cacheAge()} — use ↻ Merge rescan to refresh`, true);
  /* refresh-btn removed */
  buildCalChips(); renderCalendar(); renderMap();
  hideOnboard();
} else {
  // No localStorage data — silently check IDB before showing anything
  // Show a minimal loading state on the onboard card while we check
  const onboardEl = document.getElementById('onboard');
  if (onboardEl) onboardEl.classList.remove('hidden');

  checkIDBCache().then(info => {
    if (info && info.artistCount > 0) {
      // ── IDB has data: auto-resume immediately, no manual steps ──
      instantResume();
    } else {
      // ── Truly empty: show the new-import screen ──
      setStatus('Connect Spotify or open the sample to get started', false);
      renderOnboardHistory();
      const skip = document.getElementById('onboard-skip');
      if (skip) skip.style.display = 'none';
      setTimeout(() => {
        const inp = document.getElementById('onboard-url');
        if (inp) inp.focus();
      }, 150);
    }
  }).catch(() => {
    // IDB check failed — fall back to normal onboard
    setStatus('Connect Spotify or open the sample to get started', false);
    showOnboard();
  });
}

