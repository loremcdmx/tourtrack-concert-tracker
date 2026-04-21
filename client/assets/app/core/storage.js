'use strict';

const DB = (() => {
  let _db = null;

  function open() {
    if (_db) return Promise.resolve();
    return new Promise((res, rej) => {
      const req = indexedDB.open('tourtrack_v1', 3); // v3 adds artist knowledge/media store
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('artists'))     db.createObjectStore('artists');
        if (!db.objectStoreNames.contains('meta'))        db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('attractions')) db.createObjectStore('attractions'); // attractionId cache
        if (!db.objectStoreNames.contains('artistKnowledge')) db.createObjectStore('artistKnowledge');
      };
      req.onsuccess = e => { _db = e.target.result; res(); };
      req.onerror   = () => rej(req.error);
    });
  }

  function tx(store, mode, fn) {
    return open().then(() => new Promise((res, rej) => {
      const t = _db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      req.onsuccess = () => res(req.result);
      req.onerror   = () => rej(req.error);
    }));
  }

  return {
    get:     (store, key)      => tx(store, 'readonly',  s => s.get(key)),
    put:     (store, key, val) => tx(store, 'readwrite', s => s.put(val, key)),
    putMany: (store, entries)  => open().then(() => new Promise((res, rej) => {
      const list = Array.isArray(entries) ? entries : [];
      if (!list.length) {
        res();
        return;
      }
      const t = _db.transaction(store, 'readwrite');
      const s = t.objectStore(store);
      t.oncomplete = () => res();
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('IndexedDB transaction aborted'));
      list.forEach(([key, val]) => s.put(val, key));
    })),
    delete:  (store, key)      => tx(store, 'readwrite', s => s.delete(key)),
    keys:    (store)           => tx(store, 'readonly',  s => s.getAllKeys()),
    getAll:  (store)           => tx(store, 'readonly',  s => s.getAll()),
    clear:   (store)           => tx(store, 'readwrite', s => s.clear()),
  };
})();

// Fingerprint of the active country filter — cache miss when this changes
function countryHash() {
  if (countryMode === 'world') return 'world';
  const set = countryMode === 'include' ? includeCountries : excludeCountries;
  return countryMode + ':' + [...set].sort().join(',');
}

const TTL_ARTIST = 24 * 3600e3;  // base freshness window for artist scan cache
const TTL_ARTIST_TOURING = 18 * 3600e3; // refresh active tours more often
const TTL_ARTIST_HOT = 12 * 3600e3;     // very active artists stay especially fresh
const TTL_ARTIST_DORMANT = 36 * 3600e3; // dormant artists can stay cached longer
const TTL_FEST   = 48 * 3600e3;  // 48h festival cache
const FEST_VER   = 3;             // bump to invalidate all festival caches (changed fetch logic)

function artistCacheTTLForRecord(record, today = new Date().toISOString().split('T')[0]) {
  const shows = Array.isArray(record?.shows) ? record.shows : [];
  const upcoming = shows.filter(show => show?.date && show.date >= today);
  if (!upcoming.length) return TTL_ARTIST_DORMANT;
  return upcoming.length >= 8 ? TTL_ARTIST_HOT : TTL_ARTIST_TOURING;
}

async function clearArtistCache() {
  try {
    await DB.clear('artists');
    await DB.clear('artistKnowledge');
    await clearAllArtistTrackState();
    if (typeof clearArtistMediaSeedMarker === 'function') clearArtistMediaSeedMarker();
    await DB.delete('meta', 'festivals');
    if (typeof clearOnboardCacheSummary === 'function') clearOnboardCacheSummary();
    softNotice('Cache cleared - next scan will re-fetch everything.', 'ok');
  } catch(e) { softNotice('Could not clear cache: ' + e.message, 'error'); }
}

// ═══════════════════════════════════════════════════════════════
// STORAGE — localStorage for settings + display data
// ═══════════════════════════════════════════════════════════════
function uniqueArtistNames(names) {
  const seen = new Set();
  const out = [];
  for (const value of names || []) {
    const name = String(value || '').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

function artistTrackLookupKeys(name) {
  const raw = String(name || '').trim();
  if (!raw) return [];
  const keys = [
    raw.toLowerCase(),
    typeof _normText === 'function' ? _normText(raw) : raw.toLowerCase(),
    typeof _artistLookupKey === 'function' ? _artistLookupKey(raw) : '',
    typeof _artistNormalizedKey === 'function' ? _artistNormalizedKey(raw) : '',
    typeof _artistFoldedKey === 'function' ? _artistFoldedKey(raw) : '',
  ].filter(Boolean);
  return [...new Set(keys)];
}

function artistTrackStoreKey(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  return `artistTracks:${String(profileName || 'Main')}`;
}

function setArtistTrackState(index, playlistMeta, profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  ARTIST_TRACKS = index && typeof index === 'object' ? index : {};
  SPOTIFY_PLAYLIST_META = playlistMeta && typeof playlistMeta === 'object' ? playlistMeta : null;
  _artistTracksHydratedProfile = artistTrackStoreKey(profileName);
  return ARTIST_TRACKS;
}

async function persistArtistTrackState(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  const profile = String(profileName || 'Main');
  setArtistTrackState(ARTIST_TRACKS, SPOTIFY_PLAYLIST_META, profile);
  try {
    await DB.put('meta', artistTrackStoreKey(profile), {
      profile,
      ts: Date.now(),
      data: ARTIST_TRACKS,
      playlistMeta: SPOTIFY_PLAYLIST_META,
    });
  } catch (_) {}
  return ARTIST_TRACKS;
}

async function hydrateArtistTrackState(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main', force = false) {
  const profile = String(profileName || 'Main');
  const storeKey = artistTrackStoreKey(profile);
  if (!force && _artistTracksHydratedProfile === storeKey && ARTIST_TRACKS && typeof ARTIST_TRACKS === 'object') {
    return ARTIST_TRACKS;
  }
  try {
    const record = await DB.get('meta', storeKey);
    setArtistTrackState(record?.data || {}, record?.playlistMeta || null, profile);
  } catch (_) {
    setArtistTrackState({}, null, profile);
  }
  return ARTIST_TRACKS;
}

async function clearArtistTrackState(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  const profile = String(profileName || 'Main');
  setArtistTrackState({}, null, profile);
  try {
    await DB.delete('meta', artistTrackStoreKey(profile));
  } catch (_) {}
}

async function clearAllArtistTrackState() {
  try {
    const keys = await DB.keys('meta');
    await Promise.all(
      (keys || [])
        .filter(key => String(key || '').startsWith('artistTracks:'))
        .map(key => DB.delete('meta', key).catch(() => {}))
    );
  } catch (_) {}
  ARTIST_TRACKS = {};
  SPOTIFY_PLAYLIST_META = null;
  _artistTracksHydratedProfile = '';
}

function artistNameInList(list, name) {
  const key = String(name || '').trim().toLowerCase();
  if (!key) return false;
  return (list || []).some(value => String(value || '').trim().toLowerCase() === key);
}

function setTrackedArtists(names) {
  TRACKED_ARTISTS = uniqueArtistNames(names);
}

function setScannedArtists(names) {
  SCANNED_ARTISTS = uniqueArtistNames(names);
}

function inferConcertArtists(list = concerts) {
  return uniqueArtistNames((list || []).map(c => c && c.artist));
}

function persistSettings() {
  try {
    localStorage.setItem('tt_key',     API_KEY);
    localStorage.setItem('tt_keys_pool', JSON.stringify(TM_KEYS.map(k => ({ key: k.key, label: k.label }))));
    localStorage.setItem('tt_cmode',   countryMode);
    localStorage.setItem('tt_inc',     JSON.stringify([...includeCountries]));
    localStorage.setItem('tt_exc',     JSON.stringify([...excludeCountries]));
    localStorage.setItem('tt_hidden',  JSON.stringify(hiddenArtists));
    localStorage.setItem('tt_cachets', String(cacheTimestamp));
    localStorage.setItem('tt_favs',    JSON.stringify([...favoriteArtists]));
    localStorage.setItem('tt_geo_preset', geoPreset);
    localStorage.setItem('tt_artist_preset', artistPreset);

    if (activeProf === PROF_MAIN) {
      // Only write the canonical artist keys when Main is active.
      // These keys ARE the Main profile's data — no other profile
      // should ever overwrite them.
      localStorage.setItem('tt_artists', JSON.stringify(ARTISTS));
      localStorage.setItem('tt_plays',   JSON.stringify(ARTIST_PLAYS));
      localStorage.setItem('tt_tracked_artists', JSON.stringify(TRACKED_ARTISTS));
      // Also keep a dedicated Main backup so restore() can always
      // distinguish "true Main data" from "last non-Main data".
      localStorage.setItem('tt_main_artists', JSON.stringify(ARTISTS));
      localStorage.setItem('tt_main_plays',   JSON.stringify(ARTIST_PLAYS));
      localStorage.setItem('tt_main_tracked_artists', JSON.stringify(TRACKED_ARTISTS));
    }
    // Non-Main profiles never touch tt_artists / tt_plays — their data
    // lives exclusively in the tt_profiles[name] snapshot (updated below).
  } catch(e) {}

  // For non-Main profiles, keep the profile snapshot in sync.
  profPersistCurrent();
}

function persistData() {
  persistSettings();
  try {
    localStorage.setItem('tt_concerts',  JSON.stringify(concerts));
    localStorage.setItem('tt_festivals', JSON.stringify(festivals));
    localStorage.setItem('tt_scanned_artists', JSON.stringify(SCANNED_ARTISTS));
  } catch(e) {}
  if (typeof syncOnboardCacheSummary === 'function') syncOnboardCacheSummary();
}

function restore() {
  try {
    ARTIST_TRACKS = {};
    SPOTIFY_PLAYLIST_META = null;
    _artistTracksHydratedProfile = '';
    const storedPool = (JSON.parse(localStorage.getItem('tt_keys_pool') || 'null') || [])
      .filter(k => k && k.key && (SERVER_MANAGED_TICKETMASTER || k.key !== SERVER_TM_PLACEHOLDER));
    if (SERVER_MANAGED_TICKETMASTER) {
      TM_KEYS = [{ key: SERVER_TM_PLACEHOLDER, label: 'Server managed', exhausted: false }];
      API_KEY = SERVER_TM_PLACEHOLDER;
    } else if (storedPool && storedPool.length) {
      TM_KEYS = storedPool.map(k => ({ key: k.key, label: k.label, exhausted: false }));
      API_KEY = localStorage.getItem('tt_key') || TM_KEYS[0]?.key || '';
    } else {
      API_KEY = localStorage.getItem('tt_key') || '';
      TM_KEYS = API_KEY ? [{ key: API_KEY, label: 'Key 1', exhausted: false }] : [];
    }
    if (!SERVER_MANAGED_TICKETMASTER && API_KEY === SERVER_TM_PLACEHOLDER) {
      API_KEY = '';
      TM_KEYS = [];
    }
    if (!API_KEY && !SERVER_MANAGED_TICKETMASTER) API_KEY = localStorage.getItem('tt3_key') || '';
    if (!TM_KEYS.length && API_KEY) TM_KEYS = [{ key: API_KEY, label: 'Key 1', exhausted: false }];
    _activeKeyIdx = Math.max(TM_KEYS.findIndex(k => k.key === API_KEY), 0);
    // Prefer tt_main_artists/tt_main_plays — written ONLY when Main is active.
    // tt_artists may be stale with a non-Main profile's data from before this fix.
    const _mainArtRaw  = localStorage.getItem('tt_main_artists');
    const _mainPlayRaw = localStorage.getItem('tt_main_plays');
    const _mainTrackedRaw = localStorage.getItem('tt_main_tracked_artists');
    if (_mainArtRaw) {
      ARTISTS      = JSON.parse(_mainArtRaw);
      ARTIST_PLAYS = _mainPlayRaw ? JSON.parse(_mainPlayRaw) : {};
      TRACKED_ARTISTS = _mainTrackedRaw
        ? JSON.parse(_mainTrackedRaw)
        : JSON.parse(localStorage.getItem('tt_tracked_artists') || '[]');
    } else {
      // No backup yet (first run after update) — fall back to tt_artists
      ARTISTS      = JSON.parse(localStorage.getItem('tt_artists') || '[]');
      ARTIST_PLAYS = JSON.parse(localStorage.getItem('tt_plays')   || '{}');
      TRACKED_ARTISTS = JSON.parse(localStorage.getItem('tt_tracked_artists') || '[]');
    }
    countryMode      = localStorage.getItem('tt_cmode') || 'world'; // default: worldwide
    includeCountries = new Set(JSON.parse(localStorage.getItem('tt_inc') || '["GB","DE","FR","NL","BE","ES","IT","SE","DK","NO","FI","PL","CZ","AT","CH","PT","IE","HU","RO","GR","HR","SK","BG","RS","LT","LV","EE","IS","LU","UA","TR"]'));
    excludeCountries = new Set(JSON.parse(localStorage.getItem('tt_exc') || '[]'));
    hiddenArtists    = JSON.parse(localStorage.getItem('tt_hidden') || '{}');
    concerts         = JSON.parse(localStorage.getItem('tt_concerts') || '[]');
    festivals        = JSON.parse(localStorage.getItem('tt_festivals') || '[]');
    SCANNED_ARTISTS  = JSON.parse(localStorage.getItem('tt_scanned_artists') || '[]');
    cacheTimestamp   = parseInt(localStorage.getItem('tt_cachets') || '0', 10);
    geoPreset        = localStorage.getItem('tt_geo_preset') || 'all';
    artistPreset     = localStorage.getItem('tt_artist_preset') || 'all';
    // Migrate from old keys
    if (!ARTISTS.length)    ARTISTS   = JSON.parse(localStorage.getItem('tt3_artists') || '[]');
    if (!concerts.length)   concerts  = JSON.parse(localStorage.getItem('tt3_concerts') || '[]');
    if (!festivals.length)  festivals = JSON.parse(localStorage.getItem('tt3_festivals') || '[]');
    if (!cacheTimestamp)    cacheTimestamp = parseInt(localStorage.getItem('tt3_cachets') || '0', 10);
    // Migrate old exclude-mode default (US,JP,AU excluded) → include EU by default
    const oldExc = localStorage.getItem('tt3_exc') || localStorage.getItem('tt_exc_legacy');
    if (!hiddenArtists || typeof hiddenArtists !== 'object') hiddenArtists = {};
    if (!ARTIST_PLAYS  || typeof ARTIST_PLAYS  !== 'object') ARTIST_PLAYS  = {};
    if (!Array.isArray(TRACKED_ARTISTS)) TRACKED_ARTISTS = [];
    if (!Array.isArray(SCANNED_ARTISTS)) SCANNED_ARTISTS = [];
    favoriteArtists = new Set(JSON.parse(localStorage.getItem('tt_favs') || '[]'));
    // Re-apply dedup to cached data (catches duplicates from old scans)
    if (concerts.length) concerts = deduplicateConcerts(concerts);
    if (festivals.length && typeof normalizeFestivalLabels === 'function') festivals = normalizeFestivalLabels(festivals);
    if (!SCANNED_ARTISTS.length && concerts.length) SCANNED_ARTISTS = inferConcertArtists(concerts);
    if (!TRACKED_ARTISTS.length) {
      TRACKED_ARTISTS = uniqueArtistNames([
        ...ARTISTS,
        ...Object.keys(ARTIST_PLAYS || {}),
        ...SCANNED_ARTISTS,
      ]);
    }
  } catch(e) {
    hiddenArtists = {};
    ARTIST_PLAYS = {};
    TRACKED_ARTISTS = [];
    SCANNED_ARTISTS = [];
    ARTIST_TRACKS = {};
    SPOTIFY_PLAYLIST_META = null;
    _artistTracksHydratedProfile = '';
    favoriteArtists = new Set();
    geoPreset = 'all';
    artistPreset = 'all';
  }
}

function cacheAge() {
  if (!cacheTimestamp) return null;
  const m = Math.round((Date.now() - cacheTimestamp) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h/24)}d ago`;
}

// ═══════════════════════════════════════════════════════════════
// SAVE / LOAD / NEW GAME
// ═══════════════════════════════════════════════════════════════
const SAVE_VER = 1;

function buildSavePayload(label) {
  // Grab playlist info from history if available
  const hist = getOnboardHistory();
  const pl = hist[0] || {};
  return {
    _tt: true, _ver: SAVE_VER,
    label: label || 'Save',
    savedAt: Date.now(),
    artists: ARTISTS,
    trackedArtists: TRACKED_ARTISTS,
    scannedArtists: SCANNED_ARTISTS,
    plays: ARTIST_PLAYS,
    concerts, festivals,
    cacheTimestamp,
    countryMode,
    includeCountries: [...includeCountries],
    excludeCountries: [...excludeCountries],
    geoPreset,
    hiddenArtists,
    favoriteArtists: [...favoriteArtists],
    artistPreset,
    // Playlist metadata for future load-without-rescan
    playlistName: pl.name || '',
    playlistUrl:  pl.url  || '',
    coverUrl:     pl.coverUrl || '',
    topArtists:   pl.topArtists || ARTISTS.slice(0, 4),
    trackCount:   pl.trackCount || ARTISTS.length,
    artistTracks: ARTIST_TRACKS,
    playlistMeta: SPOTIFY_PLAYLIST_META,
  };
}

function saveGame() {
  if (!concerts.length && !festivals.length) {
    softNotice('Nothing to save - run a scan first.');
    return;
  }
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  const timeStr = now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const artistCount = ARTISTS.length;
  const label = `${artistCount} artists · ${concerts.length} shows · ${festivals.length} festivals — ${dateStr} ${timeStr}`;

  const payload = buildSavePayload(label);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const filename = `concerttracker_${now.toISOString().slice(0,10)}_${now.getHours()}h${String(now.getMinutes()).padStart(2,'0')}.tt`;
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Remember save in localStorage (metadata only, not full data)
  const saves = getSaveIndex();
  saves.unshift({ label, savedAt: Date.now(), filename });
  localStorage.setItem('tt_saves', JSON.stringify(saves.slice(0, 10)));
  renderSaveSlots();
  setStatus(`Saved → ${filename}`, true);
}

function getSaveIndex() {
  try { return JSON.parse(localStorage.getItem('tt_saves') || '[]'); } catch(e) { return []; }
}

function loadGameFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data._tt) throw new Error('Not a ConcertTracker save file');
      applyLoadedState(data, file.name);
    } catch(err) {
      softNotice(`Load failed: ${err.message}`, 'error');
    }
    // Reset file input so same file can be loaded again
    document.getElementById('sl-file-input').value = '';
  };
  reader.readAsText(file);
}

function applyLoadedState(data, filename) {
  ARTISTS          = data.artists      || [];
  TRACKED_ARTISTS  = data.trackedArtists || data.playlistArtists || data.artists || [];
  SCANNED_ARTISTS  = data.scannedArtists || [];
  ARTIST_PLAYS     = data.plays        || {};
  concerts         = data.concerts     || [];
  festivals        = data.festivals    || [];
  cacheTimestamp   = data.cacheTimestamp || 0;
  countryMode      = data.countryMode  || 'world';
  includeCountries = new Set(data.includeCountries || []);
  excludeCountries = new Set(data.excludeCountries || []);
  geoPreset        = data.geoPreset || 'all';
  hiddenArtists    = data.hiddenArtists || {};
  favoriteArtists  = new Set(data.favoriteArtists || []);
  artistPreset     = data.artistPreset || 'all';
  setArtistTrackState(
    data.artistTracks || {},
    data.playlistMeta || {
      name: data.playlistName || '',
      spotifyUrl: data.playlistUrl || '',
      coverUrl: data.coverUrl || '',
      topArtists: data.topArtists || [],
      trackCount: data.trackCount || 0,
      importedAt: data.savedAt || Date.now(),
    },
    (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main'
  );

  // Re-apply dedup (may have been saved before 2-pass dedup)
  if (concerts.length) concerts = deduplicateConcerts(concerts);
  if (!SCANNED_ARTISTS.length && concerts.length) SCANNED_ARTISTS = inferConcertArtists(concerts);
  if (!TRACKED_ARTISTS.length) {
    TRACKED_ARTISTS = uniqueArtistNames([
      ...ARTISTS,
      ...Object.keys(ARTIST_PLAYS || {}),
      ...SCANNED_ARTISTS,
    ]);
  }

  persistData();
  persistArtistTrackState().catch(() => {});

  const age = data.savedAt ? new Date(data.savedAt).toLocaleString('en-GB',{
    day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
  }) : '?';
  const msg = `Loaded ${filename} · ${concerts.length} shows · ${festivals.length} festivals · saved ${age}`;
  setStatus(msg, true);
  dblog('info', `LOAD: ${msg}`);

  closeSaveLoad();
  hideOnboard();

  // Track that this data came from a save (not a scan) — mark in history
  if (data.playlistUrl || data.playlistName) {
    addToOnboardHistory(
      data.playlistName || filename,
      data.playlistUrl  || '',
      data.trackCount   || ARTISTS.length,
      ARTISTS.length,
      data.coverUrl     || '',
      (data.topArtists  || ARTISTS.slice(0, 4)),
      { fromSave: true, saveFile: filename }
    );
  }

  // Re-render everything
  buildCalChips();
  renderCalendar();
  renderMap();

  // If settings open, refresh them
  if (!document.getElementById('settings-bg').classList.contains('off')) {
    openSettings();
  }
}

// ── Reset map + lists, keep artists — rescan from scratch ──────────
