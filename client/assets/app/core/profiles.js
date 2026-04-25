'use strict';

const PROF_MAIN = 'Main';
let activeProf = PROF_MAIN;

// ── Storage helpers ──────────────────────────────────────────
function profAll() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) {
    return { [PROF_MAIN]: { artists: null, plays: null, tracked: null } };
  }
  try {
    const raw = localStorage.getItem('tt_profiles');
    const all = raw ? JSON.parse(raw) : {};
    // Always guarantee Main exists with null data (reads from tt_artists / tt_plays)
    if (!all[PROF_MAIN]) all[PROF_MAIN] = { artists: null, plays: null };
    return all;
  } catch(e) { return { [PROF_MAIN]: { artists: null, plays: null } }; }
}

function profSaveAll(all) {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  try { localStorage.setItem('tt_profiles', JSON.stringify(all)); } catch(e) {}
}

// Snapshot the current in-memory ARTISTS/ARTIST_PLAYS into a
// non-Main profile slot so it survives page refreshes.
function profPersistCurrent() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  if (activeProf === PROF_MAIN) return; // Main is always read from tt_artists/tt_plays
  const all = profAll();
  if (!all[activeProf]) return;
  all[activeProf].artists = ARTISTS.slice();
  all[activeProf].tracked = TRACKED_ARTISTS.slice();
  all[activeProf].plays   = Object.assign({}, ARTIST_PLAYS);
  profSaveAll(all);
  if (typeof persistArtistTrackState === 'function') persistArtistTrackState(activeProf).catch(() => {});
}

// ── UI ────────────────────────────────────────────────────────
// Rebuild the <select> to reflect the current profile list and
// update the delete-button's disabled state.
function profRenderSelect() {
  const sel   = document.getElementById('prof-select');
  const delBtn = document.getElementById('prof-del-btn');
  const bar = document.querySelector('.prof-bar');
  const toast = document.getElementById('prof-toast');
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) {
    activeProf = PROF_MAIN;
    if (bar) bar.style.display = 'none';
    if (toast) toast.style.display = 'none';
    return;
  }
  if (!sel) return;

  const all = profAll();
  sel.innerHTML = Object.keys(all).map(name => {
    const isActive = name === activeProf;
    return `<option value="${esc2(name)}" ${isActive ? 'selected' : ''}>${esc2(name)}</option>`;
  }).join('');

  if (delBtn) delBtn.disabled = (activeProf === PROF_MAIN);
}

// ── Switch ─────────────────────────────────────────────────────
// THIS is the single place that writes activeProf.
// All other functions (create, delete) call _profApply() directly
// so they never hit the "already active" early-return guard.
function profSwitch(name) {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  // Called from the <select> onChange — skip if already on this profile.
  if (name === activeProf) return;
  // Scan loops capture ARTISTS by reference and push results into the global
  // concerts[]. If we let the user swap profiles mid-scan, in-flight artists
  // belonging to the OLD profile would land in the NEW profile's concerts[]
  // and the loop body would start reading the NEW profile's ARTISTS array
  // mid-iteration. Cleanest mitigation: abort the running scan first; the
  // user can rescan in the new profile when they're ready.
  if (window._scanActive) {
    if (typeof scanAborted !== 'undefined') {
      scanAborted = true;
      window._scanActive = false;
    }
    if (typeof flushScheduledUiRefresh === 'function') {
      try { flushScheduledUiRefresh(); } catch (e) {}
    }
    if (typeof setStatus === 'function') {
      setStatus(`Scan stopped — switching to "${name}"`, false);
    }
    if (typeof dblog === 'function') dblog('warn', `Scan aborted by profile switch (${activeProf} → ${name})`);
  }
  // Flush any pending deferred settings write so it commits against the OLD
  // profile context. Without this, a favorite toggled in the same frame as the
  // dropdown click could land its profile-snapshot write under the NEW profile
  // by the time the rAF fires.
  if (typeof _persistSettingsScheduled !== 'undefined' && _persistSettingsScheduled
      && typeof persistSettings === 'function') {
    _persistSettingsScheduled = false;
    try { persistSettings(); } catch (e) {}
  }
  profPersistCurrent();   // snapshot the profile we're leaving
  _profApply(name);
}

// Internal: load a profile into memory and re-render everything.
// No guard — safe to call even when name === activeProf.
function _profApply(name) {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) {
    name = PROF_MAIN;
  }
  const all  = profAll();
  const prof = all[name];
  if (!prof) return; // unknown profile — do nothing

  activeProf = name;
  try { localStorage.setItem('tt_active_profile', name); } catch(e) {}

  // Load artists/plays.  Main always reads from the canonical
  // tt_artists/tt_plays keys; every other profile uses its snapshot.
  if (prof.artists === null) {
    ARTISTS      = JSON.parse(localStorage.getItem('tt_artists') || '[]');
    ARTIST_PLAYS = JSON.parse(localStorage.getItem('tt_plays')   || '{}');
    TRACKED_ARTISTS = JSON.parse(localStorage.getItem('tt_tracked_artists') || localStorage.getItem('tt_main_tracked_artists') || '[]');
  } else {
    ARTISTS      = (prof.artists || []).slice();
    TRACKED_ARTISTS = (prof.tracked || prof.artists || []).slice();
    ARTIST_PLAYS = Object.assign({}, prof.plays || {});
  }
  if (!Array.isArray(TRACKED_ARTISTS) || !TRACKED_ARTISTS.length) {
    TRACKED_ARTISTS = typeof uniqueArtistNames === 'function'
      ? uniqueArtistNames([...ARTISTS, ...Object.keys(ARTIST_PLAYS || {})])
      : ARTISTS.slice();
  }
  ARTIST_TRACKS = {};
  SPOTIFY_PLAYLIST_META = null;
  _artistTracksHydratedProfile = '';
  if (typeof hydrateArtistTrackState === 'function') hydrateArtistTrackState(activeProf).catch(() => {});

  // Keep the artists textarea in Settings in sync if it's open.
  const ta = document.getElementById('artists-ta');
  if (ta) {
    ta.value = ARTISTS.map(n => {
      const p = ARTIST_PLAYS[n.toLowerCase()] || 0;
      return p ? `${n} ${p}` : n;
    }).join('\n');
  }
  updateArtistCount && updateArtistCount();
  profRenderSelect(); // always refresh the dropdown + delete-btn state

  if (!ARTISTS.length) {
    // Empty profile — rescore festivals to zero (they still hold scores
    // from whatever profile was active before), then show the import prompt.
    if (festivals.length) scoreFestivals();
    profShowEmpty();
    return;
  }

  // Profile has data — close the onboard overlay if it's still open
  // (e.g. user came back from an empty profile), recompute scores, re-render.
  profHideEmpty();   // safe to call even if overlay was already hidden
  if (festivals.length) scoreFestivals();
  buildCalChips();
  renderCalendar();
  renderMap();
  if (typeof buildSidebar === 'function') buildSidebar();
  // Show switch confirmation toast
  _showProfToast(name, ARTISTS.length);
}

// ── Empty-state overlay ────────────────────────────────────────
// Called by _profApply when the active profile has no artists.
// At this point ARTISTS=[] and festivals are already rescored to 0,
// and the views have already been re-rendered (showing empty lists).
// This function only handles the onboard overlay UI.
function profShowEmpty() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) {
    const title = document.getElementById('onboard-main-title');
    const sub = document.getElementById('onboard-sub-text');
    if (title) title.innerHTML = DEFAULT_ONBOARD_TITLE;
    if (sub) sub.textContent = DEFAULT_ONBOARD_SUB;
    showOnboard();
    return;
  }
  const title = document.getElementById('onboard-main-title');
  const sub   = document.getElementById('onboard-sub-text');
  if (title) title.innerHTML =
    `Import playlist<br>for <span style="color:var(--accent)">${esc2(activeProf)}</span>`;
  if (sub) sub.textContent =
    'Paste a Spotify playlist URL to populate this profile. ' +
    'The concerts & festivals database is already loaded — ' +
    'your new playlist will be scored against it instantly.';
  showOnboard();
}

// ── Profile toast ─────────────────────────────────────────────
let _profToastTimer = null;
function _showProfToast(name, artists) {
  const el = document.getElementById('prof-toast');
  if (!el) return;
  const count = artists ? ` &middot; <span style="color:var(--muted)">${artists} artists</span>` : '';
  el.innerHTML = `&#x2713; <span class="prof-toast-name">${esc2(name)}</span>${count}`;
  el.classList.add('show');
  clearTimeout(_profToastTimer);
  _profToastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function profReload() {
  // Force-reapply the current active profile (useful if switch didn't apply)
  _profApply(activeProf);
  _showProfToast(activeProf + ' reloaded', ARTISTS.length);
}

// ── Playlist mosaic avatar ─────────────────────────────────────
// Draws a 2x2 grid of colored squares for each top artist
const MOSAIC_PALETTE = ['#c8ff5f','#ff5f5f','#5fc8ff','#ffaa3c','#c85fff',
  '#5fffb8','#ff5faa','#5fd4ff','#ffdd5f','#ff885f','#5faeff','#88ff5f'];

function _drawPlaylistMosaic(canvas, topArtists) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 68, H = 68, gap = 1;
  const cw = (W - gap) / 2, ch = (H - gap) / 2;
  // For known artists use their color; others use palette by hash
  const colors = topArtists.slice(0, 4).map((name, idx) => {
    const col = getColor ? getColor(name) : null;
    return col || MOSAIC_PALETTE[idx % MOSAIC_PALETTE.length];
  });
  // Fill any missing slots
  while (colors.length < 4) colors.push('#1e1e2a');
  ctx.fillStyle = '#0d0d14';
  ctx.fillRect(0, 0, W, H);
  const pos = [[0,0],[cw+gap,0],[0,ch+gap],[cw+gap,ch+gap]];
  colors.forEach((col, i) => {
    ctx.fillStyle = col + '55'; // semi-transparent base
    ctx.fillRect(pos[i][0], pos[i][1], cw, ch);
    // Lighter inner highlight
    ctx.fillStyle = col + 'aa';
    ctx.fillRect(pos[i][0]+2, pos[i][1]+2, cw-4, ch-4);
    // Text: first letter of artist
    if (topArtists[i]) {
      ctx.fillStyle = col;
      ctx.font = `bold ${Math.round(ch * 0.42)}px Syne, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(topArtists[i][0].toUpperCase(), pos[i][0] + cw/2, pos[i][1] + ch/2);
    }
  });
}

// Called after onboarding renders to paint the pinned card mosaic
function _paintPinnedMosaic() {
  const canvas = document.getElementById('ql-pinned-mosaic');
  if (!canvas) return;
  _drawPlaylistMosaic(canvas, PINNED_PLAYLIST.topArtists);
}

// Reset onboard text and close the overlay after a successful import.
function profHideEmpty() {
  const title = document.getElementById('onboard-main-title');
  const sub   = document.getElementById('onboard-sub-text');
  if (title) title.innerHTML = DEFAULT_ONBOARD_TITLE;
  if (sub)   sub.textContent = DEFAULT_ONBOARD_SUB;
  hideOnboard();
}

// ── Create ─────────────────────────────────────────────────────
function profOpenDialog() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  document.getElementById('prof-dialog-bg').classList.add('open');
  const inp = document.getElementById('prof-name-inp');
  inp.value = '';
  inp.classList.remove('err');
  setTimeout(() => inp.focus(), 60);
}

function profCloseDialog() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  document.getElementById('prof-dialog-bg').classList.remove('open');
}

function profConfirm() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  const inp  = document.getElementById('prof-name-inp');
  const name = (inp.value || '').trim();
  if (!name) { inp.classList.add('err'); inp.focus(); return; }

  const all = profAll();
  if (all[name]) {
    inp.classList.add('err');
    inp.title = 'A profile with that name already exists';
    setTimeout(() => { inp.classList.remove('err'); inp.title = ''; }, 1600);
    return;
  }

  // New profile is empty — the user will import their own playlist.
  all[name] = { artists: [], plays: {} };
  profSaveAll(all);
  profCloseDialog();

  // Use _profApply directly so we never hit the activeProf === name guard.
  profPersistCurrent(); // snapshot the profile we're leaving first
  _profApply(name);
}

// ── Delete ─────────────────────────────────────────────────────
function profDelete() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) return;
  if (activeProf === PROF_MAIN) return;
  if (!confirm(`Delete profile "${activeProf}"?\n\nThe concerts & festivals database is NOT affected.`)) return;

  const all = profAll();
  delete all[activeProf];
  profSaveAll(all);

  // Use _profApply directly — activeProf is still the deleted name,
  // so profSwitch's guard would fire if we targeted PROF_MAIN.
  _profApply(PROF_MAIN);
}

// ── Boot ────────────────────────────────────────────────────────
function profInit() {
  if (typeof isScenarioAProductMode === 'function' && isScenarioAProductMode()) {
    activeProf = PROF_MAIN;
    try { localStorage.setItem('tt_active_profile', PROF_MAIN); } catch(e) {}
    ARTIST_TRACKS = {};
    SPOTIFY_PLAYLIST_META = null;
    _artistTracksHydratedProfile = '';
    if (typeof hydrateArtistTrackState === 'function') hydrateArtistTrackState(activeProf).catch(() => {});
    profRenderSelect();
    return;
  }
  const saved = localStorage.getItem('tt_active_profile') || PROF_MAIN;
  const all   = profAll();
  // If the saved name doesn't exist any more, fall back to Main.
  activeProf = all[saved] ? saved : PROF_MAIN;

  // For non-Main profiles with data, replace what restore() loaded so
  // the rest of the boot sequence scores against the right taste.
  if (activeProf !== PROF_MAIN) {
    const prof = all[activeProf];
    if (prof && prof.artists && prof.artists.length) {
      ARTISTS      = prof.artists.slice();
      ARTIST_PLAYS = Object.assign({}, prof.plays || {});
    }
  }

  ARTIST_TRACKS = {};
  SPOTIFY_PLAYLIST_META = null;
  _artistTracksHydratedProfile = '';
  if (typeof hydrateArtistTrackState === 'function') hydrateArtistTrackState(activeProf).catch(() => {});

  profRenderSelect();
}

// ═══════════════════════════════════════════════════════════════
// INDEXEDDB — per-artist and festival cache
// ═══════════════════════════════════════════════════════════════
