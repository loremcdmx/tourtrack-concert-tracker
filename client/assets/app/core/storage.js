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
      let result;
      req.onsuccess = () => { result = req.result; };
      req.onerror   = () => rej(req.error);
      t.oncomplete = () => res(result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('IndexedDB transaction aborted'));
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
    entries: (store)           => open().then(() => new Promise((res, rej) => {
      const entries = [];
      const t = _db.transaction(store, 'readonly');
      const req = t.objectStore(store).openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) return;
        entries.push([cursor.key, cursor.value]);
        cursor.continue();
      };
      req.onerror = () => rej(req.error);
      t.oncomplete = () => res(entries);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error('IndexedDB transaction aborted'));
    })),
    clear:   (store)           => tx(store, 'readwrite', s => s.clear()),
  };
})();

// Fingerprint of the active country filter — cache miss when this changes
function countryHash() {
  if (countryMode === 'world') return 'world';
  const set = countryMode === 'include' ? includeCountries : excludeCountries;
  return countryMode + ':' + [...set].sort().join(',');
}

function scanRecordMatchesCurrentCountryScope(record) {
  return !!record && record.cHash === countryHash();
}

function isLegacyUkOnlyCountryScope() {
  if (countryMode !== 'include' || !includeCountries || includeCountries.size === 0) return false;
  const selected = [...includeCountries].map(code => String(code || '').toUpperCase());
  return selected.every(code => code === 'GB' || code === 'IE');
}

function scanSnapshotLooksUkOnly() {
  const countries = new Set();
  for (const item of [...(concerts || []), ...(festivals || [])]) {
    const code = String(item?.country || '').toUpperCase();
    if (code) countries.add(code);
  }
  if (!countries.size) return false;
  return [...countries].every(code => code === 'GB' || code === 'IE');
}

function clearLocalConcertSnapshot() {
  concerts = [];
  SCANNED_ARTISTS = [];
  cacheTimestamp = 0;
  try {
    localStorage.setItem('tt_concerts', '[]');
    localStorage.removeItem('tt_scanned_artists');
    localStorage.removeItem('tt_cachets');
    localStorage.setItem('tt_data_chash', countryHash());
  } catch(e) {}
}

function clearLocalFestivalSnapshot() {
  festivals = [];
  try {
    localStorage.setItem('tt_festivals', '[]');
    localStorage.setItem('tt_festivals_chash', countryHash());
  } catch(e) {}
}

function clearLocalScanSnapshot() {
  clearLocalConcertSnapshot();
  clearLocalFestivalSnapshot();
}

function normalizeScenarioAGeoState() {
  if (!isScenarioAProductMode()) return false;
  const resetSearchScope = isLegacyUkOnlyCountryScope();
  const resetDisplayScope = geoPreset === 'ukie';
  if (!resetSearchScope && !resetDisplayScope) return false;

  if (resetSearchScope) {
    countryMode = 'world';
    includeCountries = new Set();
    excludeCountries = new Set();
  }
  if (resetDisplayScope) geoPreset = 'all';

  try {
    localStorage.setItem('tt_cmode', countryMode);
    localStorage.setItem('tt_inc', JSON.stringify([...includeCountries]));
    localStorage.setItem('tt_exc', JSON.stringify([...excludeCountries]));
    localStorage.setItem('tt_geo_preset', geoPreset);
  } catch(e) {}

  return resetSearchScope;
}

const TTL_ARTIST = 24 * 3600e3;  // base freshness window for artist scan cache
const TTL_ARTIST_TOURING = 18 * 3600e3; // refresh active tours more often
const TTL_ARTIST_HOT = 12 * 3600e3;     // very active artists stay especially fresh
const TTL_ARTIST_DORMANT = 36 * 3600e3; // dormant artists can stay cached longer
const TTL_FEST   = 48 * 3600e3;  // 48h festival cache
const FEST_VER   = 4;             // bump to invalidate all festival caches (changed fetch logic)

function artistCacheTTLForRecord(record, today = _isoDateOnly(new Date())) {
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

// Provider facts remain shared. Only playlist taste and displayed scan results
// are snapshotted, so switching playlists does not duplicate the provider DB.
let _activePlaylistSessionId = (() => {
  try { return localStorage.getItem('tt_active_playlist') || ''; } catch (_) { return ''; }
})();
let _playlistSessionTransitionDepth = 0;
let _playlistActivationGeneration = 0;
const _playlistSessionWrites = new Map();

function getActivePlaylistSessionId() { return _activePlaylistSessionId; }
function isPlaylistSessionTransitioning() { return _playlistSessionTransitionDepth > 0; }
function playlistSessionStoreKey(id) { return `playlistSession:${String(id || 'Main')}`; }
function _playlistCopy(value) { return JSON.parse(JSON.stringify(value)); }

function _capturePlaylistSession(id = getActivePlaylistSessionId()) {
  return _playlistCopy({
    version: 1, playlistId: id, savedAt: Date.now(),
    artists: ARTISTS, trackedArtists: TRACKED_ARTISTS, scannedArtists: SCANNED_ARTISTS,
    artistPlays: ARTIST_PLAYS, artistTracks: ARTIST_TRACKS, playlistMeta: SPOTIFY_PLAYLIST_META,
    minTracks: typeof _minTracksFilter !== 'undefined' ? _minTracksFilter : 1,
    concerts, festivals, fetchErrors, cacheTimestamp, cHash: countryHash(),
  });
}

function _writePlaylistSession(snapshot) {
  const key = playlistSessionStoreKey(snapshot.playlistId);
  const previous = _playlistSessionWrites.get(key) || Promise.resolve();
  // Serialize writes for one playlist; a slower earlier autosave cannot win.
  const write = previous.catch(() => {}).then(() => DB.put('meta', key, snapshot));
  _playlistSessionWrites.set(key, write);
  write.finally(() => {
    if (_playlistSessionWrites.get(key) === write) _playlistSessionWrites.delete(key);
  }).catch(() => {});
  return write;
}

async function persistActivePlaylistSession() {
  // Capture before the first await: a subsequent activation may replace globals.
  const snapshot = _capturePlaylistSession();
  if (!snapshot.playlistId) return false;
  await _writePlaylistSession(snapshot);
  return true;
}

async function getPlaylistSession(id) {
  const key = playlistSessionStoreKey(id);
  const pending = _playlistSessionWrites.get(key);
  if (pending) await pending.catch(() => {});
  const record = await DB.get('meta', key);
  return record && record.version === 1 && Array.isArray(record.artists) ? _playlistCopy(record) : null;
}

function _persistPlaylistContextMirror() {
  if (!getActivePlaylistSessionId()) return;
  try {
    localStorage.setItem('tt_active_playlist', getActivePlaylistSessionId());
    // Results already have localStorage mirrors; large track indexes live in IDB.
    localStorage.setItem('tt_playlist_session', JSON.stringify({
      playlistId: getActivePlaylistSessionId(), artists: ARTISTS, trackedArtists: TRACKED_ARTISTS,
      artistPlays: ARTIST_PLAYS, playlistMeta: SPOTIFY_PLAYLIST_META,
      minTracks: typeof _minTracksFilter !== 'undefined' ? _minTracksFilter : 1,
      fetchErrors,
    }));
  } catch (_) {}
}

function resetActivePlaylistSessionContext() {
  _activePlaylistSessionId = '';
  _artistTrackStateRevision += 1;
  try {
    localStorage.removeItem('tt_active_playlist');
    localStorage.removeItem('tt_playlist_session');
  } catch (_) {}
}

async function _preserveLegacyMainPlaylistSession() {
  const snapshot = _capturePlaylistSession('');
  if (typeof activeProf !== 'undefined' && activeProf !== 'Main') {
    snapshot.artists = JSON.parse(localStorage.getItem('tt_main_artists') || localStorage.getItem('tt_artists') || '[]');
    snapshot.artistPlays = JSON.parse(localStorage.getItem('tt_main_plays') || localStorage.getItem('tt_plays') || '{}');
    snapshot.trackedArtists = JSON.parse(localStorage.getItem('tt_main_tracked_artists') || localStorage.getItem('tt_tracked_artists') || '[]');
    snapshot.concerts = []; snapshot.festivals = []; snapshot.scannedArtists = []; snapshot.fetchErrors = {};
    snapshot.artistTracks = {}; snapshot.playlistMeta = null; snapshot.cacheTimestamp = 0;
  }
  if (await getPlaylistSession('Main')) return;
  const legacyTracks = await DB.get('meta', 'artistTracks:Main');
  if (!snapshot.playlistMeta && legacyTracks?.playlistMeta) snapshot.playlistMeta = _playlistCopy(legacyTracks.playlistMeta);
  if (!Object.keys(snapshot.artistTracks || {}).length && legacyTracks?.data) snapshot.artistTracks = _playlistCopy(legacyTracks.data);
  await _writePlaylistSession(snapshot);
  // Old releases saved only one global playlist. Give it its real session id
  // once while retaining the original Main backup and canonical artist keys.
  let legacyId = snapshot.playlistMeta?.id || snapshot.playlistMeta?.playlistId || '';
  if (!legacyId) {
    try {
      const latest = JSON.parse(localStorage.getItem('tt_pl_history') || '[]')[0];
      legacyId = String(latest?.url || '').match(/(?:playlist\/|spotify:playlist:)([a-zA-Z0-9]{22})/)?.[1] || '';
    } catch (_) {}
  }
  if (legacyId && !(await getPlaylistSession(legacyId))) {
    await _writePlaylistSession({ ...snapshot, playlistId: legacyId });
  }
}

function _prepareImportedPlaylistSession(payload) {
  const id = String(payload?.playlistId || '').trim();
  const artists = uniqueArtistNames(payload?.artists);
  if (!id || !/^[a-zA-Z0-9_-]{1,128}$/.test(id) || !artists.length) {
    throw new Error('Playlist must have an id and at least one selected artist');
  }
  return _playlistCopy({
    version: 1, playlistId: id, savedAt: Date.now(), artists,
    trackedArtists: uniqueArtistNames(payload.trackedArtists || artists),
    artistPlays: payload.artistPlays && typeof payload.artistPlays === 'object' ? payload.artistPlays : {},
    artistTracks: payload.artistTracks && typeof payload.artistTracks === 'object' ? payload.artistTracks : {},
    playlistMeta: payload.playlistMeta && typeof payload.playlistMeta === 'object' ? payload.playlistMeta : { id },
    minTracks: Math.max(1, Number(payload.minTracks) || 1),
    scannedArtists: [], concerts: [], festivals: [], fetchErrors: {}, cacheTimestamp: 0, cHash: countryHash(),
  });
}

function _commitPlaylistSession(snapshot) {
  const artists = uniqueArtistNames(snapshot.artists);
  const tracked = uniqueArtistNames(snapshot.trackedArtists || artists);
  const allowed = new Set(artists.map(name => name.toLowerCase()));
  const scopeMatches = snapshot.cHash === countryHash();
  const shows = scopeMatches && Array.isArray(snapshot.concerts)
    ? snapshot.concerts.filter(show => allowed.has(String(show?.artist || '').toLowerCase())) : [];
  const fests = scopeMatches && Array.isArray(snapshot.festivals) ? snapshot.festivals : [];
  const scanned = scopeMatches ? uniqueArtistNames((Array.isArray(snapshot.scannedArtists) ? snapshot.scannedArtists : [])
    .filter(name => allowed.has(String(name || '').toLowerCase()))) : [];
  const errors = scopeMatches ? Object.fromEntries(Object.entries(snapshot.fetchErrors || {})
    .filter(([name]) => allowed.has(name.toLowerCase()))) : {};
  _activePlaylistSessionId = snapshot.playlistId;
  ARTISTS = artists;
  TRACKED_ARTISTS = tracked;
  ARTIST_PLAYS = { ...(snapshot.artistPlays || {}) };
  setArtistTrackState(snapshot.artistTracks || {}, snapshot.playlistMeta || null);
  if (typeof _minTracksFilter !== 'undefined') _minTracksFilter = Math.max(1, Number(snapshot.minTracks) || 1);
  concerts = shows;
  festivals = fests;
  SCANNED_ARTISTS = scanned;
  fetchErrors = errors;
  cacheTimestamp = scopeMatches ? Number(snapshot.cacheTimestamp) || 0 : 0;
  focusedArtist = null;
  if (typeof focusedFest !== 'undefined') focusedFest = null;
  window._mergeMode = false; window._mergeBaseKeys = null; window._mergeBaseByArtist = null;
  // Scores belong to this playlist, even when discovery facts were reused.
  if (festivals.length && typeof scoreFestivals === 'function') scoreFestivals();
  persistData();
  persistArtistTrackState().catch(() => {});
}

async function _activatePlaylistSession(id, imported, { isCurrent = () => true } = {}) {
  const result = { committed: false, resumed: false, playlistId: id };
  // A stale import must not invalidate or stop a newer scan.
  if (!isCurrent()) return result;
  const generation = ++_playlistActivationGeneration;
  const current = () => generation === _playlistActivationGeneration && isCurrent();
  _playlistSessionTransitionDepth += 1;
  try {
    let existing = await getPlaylistSession(id);
    if (!current() || (!imported && !existing)) return result;
    if (typeof stopActiveScanAndWait === 'function') await stopActiveScanAndWait();
    if (!current()) return result;
    // Deferred frames have not run yet; capture the old state before replacing it.
    if (typeof flushScheduledUiRefresh === 'function') flushScheduledUiRefresh();
    persistSettings();
    await persistActivePlaylistSession();
    if (!current()) return result;
    if (!getActivePlaylistSessionId()) await _preserveLegacyMainPlaylistSession();
    if (!current()) return result;
    existing = await getPlaylistSession(id); // legacy migration may have created it
    if (!current()) return result;
    let next = imported || existing;
    if (imported && existing) {
      next = { ...imported, concerts: existing.concerts, festivals: existing.festivals,
        scannedArtists: existing.scannedArtists, fetchErrors: existing.fetchErrors,
        cacheTimestamp: existing.cacheTimestamp, cHash: existing.cHash };
    }
    // Clone all validated locals before the synchronous commit starts.
    next = _playlistCopy(next);
    if (!current()) return result;
    // Do not expose a new active playlist until its first snapshot commits.
    // A quota/storage error must leave the previous globals and mirror intact.
    await _writePlaylistSession(next);
    if (!current()) return result;
    _commitPlaylistSession(next);
    return { committed: true, resumed: !!existing, playlistId: id };
  } finally {
    _playlistSessionTransitionDepth -= 1;
  }
}

function activateImportedPlaylistSession(payload, options) {
  let prepared;
  try { prepared = _prepareImportedPlaylistSession(payload); } catch (error) { return Promise.reject(error); }
  return _activatePlaylistSession(prepared.playlistId, prepared, options);
}

function resumePlaylistSession(id, options) {
  const playlistId = String(id || '').trim();
  if (!playlistId) return Promise.resolve({ committed: false, resumed: false, playlistId });
  return _activatePlaylistSession(playlistId, null, options);
}

async function leavePlaylistSessionForProfile(apply) {
  const generation = ++_playlistActivationGeneration;
  _playlistSessionTransitionDepth += 1;
  try {
    if (typeof stopActiveScanAndWait === 'function') await stopActiveScanAndWait();
    if (generation !== _playlistActivationGeneration) return false;
    persistSettings();
    await persistActivePlaylistSession();
    if (generation !== _playlistActivationGeneration) return false;
    const originalMain = getActivePlaylistSessionId() ? await getPlaylistSession('Main') : null;
    if (generation !== _playlistActivationGeneration) return false;
    resetActivePlaylistSessionContext();
    // Applying a manual profile is part of the same synchronous commit.
    apply(originalMain);
    return true;
  } finally { _playlistSessionTransitionDepth -= 1; }
}

function scenarioArtistKeys(name) {
  const raw = String(name || '').trim();
  if (!raw) return [];
  const normalized = typeof _normText === 'function' ? _normText(raw) : raw.toLowerCase();
  const folded = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return [...new Set([raw.toLowerCase(), normalized, folded].filter(Boolean))];
}

function filterArtistsByPlayThreshold(names, playsMap = ARTIST_PLAYS, minTracks = 1) {
  const threshold = Math.max(1, Number(minTracks) || 1);
  const unique = uniqueArtistNames(names);
  if (threshold <= 1) return unique;
  const plays = playsMap && typeof playsMap === 'object' ? playsMap : {};
  return unique.filter(name => Number(plays[String(name || '').toLowerCase()] || 0) >= threshold);
}

let _scenarioArtistLookupSignature = '';
let _scenarioArtistLookup = new Set();

function getScenarioArtistLookup() {
  if (!isScenarioAProductMode()) return null;
  const list = Array.isArray(ARTISTS) ? ARTISTS : [];
  const signature = list.map(name => String(name || '')).join('\u0001');
  if (_scenarioArtistLookupSignature === signature) return _scenarioArtistLookup;

  const next = new Set();
  list.forEach(name => {
    scenarioArtistKeys(name).forEach(key => next.add(key));
  });
  _scenarioArtistLookupSignature = signature;
  _scenarioArtistLookup = next;
  return next;
}

function scenarioArtistAllowed(name) {
  if (!isScenarioAProductMode()) return true;
  const lookup = getScenarioArtistLookup();
  if (!lookup || !lookup.size) return false;
  return scenarioArtistKeys(name).some(key => lookup.has(key));
}

function applyScenarioAArtistThreshold(sourceNames) {
  if (!isScenarioAProductMode()) return Array.isArray(ARTISTS) ? ARTISTS : [];
  const source = Array.isArray(sourceNames) && sourceNames.length
    ? sourceNames
    : (Array.isArray(TRACKED_ARTISTS) && TRACKED_ARTISTS.length
        ? TRACKED_ARTISTS
        : uniqueArtistNames([
            ...(Array.isArray(ARTISTS) ? ARTISTS : []),
            ...Object.keys(ARTIST_PLAYS || {}),
          ]));
  ARTISTS = filterArtistsByPlayThreshold(source, ARTIST_PLAYS, scenarioAFixedMinTracks());
  return ARTISTS;
}

function applyScenarioAResultFilter() {
  if (!isScenarioAProductMode()) return;
  concerts = (Array.isArray(concerts) ? concerts : []).filter(show => scenarioArtistAllowed(show?.artist));
  SCANNED_ARTISTS = uniqueArtistNames((Array.isArray(SCANNED_ARTISTS) ? SCANNED_ARTISTS : []).filter(name => scenarioArtistAllowed(name)));
  if (focusedArtist && !scenarioArtistAllowed(focusedArtist)) {
    focusedArtist = null;
  }
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
  if (getActivePlaylistSessionId()) return `artistTracks:playlist:${getActivePlaylistSessionId()}`;
  return `artistTracks:${String(profileName || 'Main')}`;
}

let _artistTrackStateRevision = 0;

function setArtistTrackState(index, playlistMeta, profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  _artistTrackStateRevision += 1;
  ARTIST_TRACKS = index && typeof index === 'object' ? index : {};
  SPOTIFY_PLAYLIST_META = playlistMeta && typeof playlistMeta === 'object' ? playlistMeta : null;
  _artistTracksHydratedProfile = artistTrackStoreKey(profileName);
  return ARTIST_TRACKS;
}

async function persistArtistTrackState(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main') {
  const profile = String(profileName || 'Main');
  setArtistTrackState(ARTIST_TRACKS, SPOTIFY_PLAYLIST_META, profile);
  const storeKey = artistTrackStoreKey(profile);
  const record = _playlistCopy({ profile, ts: Date.now(), data: ARTIST_TRACKS, playlistMeta: SPOTIFY_PLAYLIST_META });
  try {
    await DB.put('meta', storeKey, record);
  } catch (_) {}
  return ARTIST_TRACKS;
}

async function hydrateArtistTrackState(profileName = (typeof activeProf !== 'undefined' && activeProf) ? activeProf : 'Main', force = false) {
  const profile = String(profileName || 'Main');
  const storeKey = artistTrackStoreKey(profile);
  if (!force && _artistTracksHydratedProfile === storeKey && ARTIST_TRACKS && typeof ARTIST_TRACKS === 'object') {
    return ARTIST_TRACKS;
  }
  const revision = ++_artistTrackStateRevision;
  const playlistId = getActivePlaylistSessionId();
  try {
    let record = await DB.get('meta', storeKey);
    if (!record && playlistId && revision === _artistTrackStateRevision) {
      const session = await getPlaylistSession(playlistId);
      if (session) record = { data: session.artistTracks, playlistMeta: session.playlistMeta };
      if (!record) {
        const legacy = await DB.get('meta', `artistTracks:${profile}`);
        const legacyId = legacy?.playlistMeta?.id || legacy?.playlistMeta?.playlistId;
        if (legacyId === playlistId) record = legacy;
      }
      if (record && revision === _artistTrackStateRevision) {
        DB.put('meta', storeKey, _playlistCopy(record)).catch(() => {});
      }
    }
    if (revision === _artistTrackStateRevision) {
      setArtistTrackState(record?.data || {}, record?.playlistMeta || null, profile);
    }
  } catch (_) {
    if (revision === _artistTrackStateRevision) setArtistTrackState({}, null, profile);
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
  _artistTrackStateRevision += 1;
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

// Coalesces rapid calls (favorite-star clicks, filter chips) into a single
// write after the next two animation frames, so the click handler can return
// and let the browser paint before ~10 localStorage.setItem calls fire.
let _persistSettingsScheduled = false;
function persistSettingsDeferred() {
  if (_persistSettingsScheduled) return;
  _persistSettingsScheduled = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _persistSettingsScheduled = false;
      persistSettings();
    });
  });
}
// Flush pending writes synchronously before the tab unloads — a favorite
// toggled inside the last frame before navigation would otherwise be lost
// because the double-rAF never gets to fire.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (_persistSettingsScheduled) {
      _persistSettingsScheduled = false;
      try { persistSettings(); } catch (e) {}
    }
  });
}

function persistSettings(saveSession = true) {
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

    if (activeProf === PROF_MAIN && !getActivePlaylistSessionId()) {
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
  _persistPlaylistContextMirror();
  if (saveSession && getActivePlaylistSessionId()) persistActivePlaylistSession().catch(() => {});
}

function persistFestivalData() {
  try {
    localStorage.setItem('tt_festivals', JSON.stringify(festivals));
    localStorage.setItem('tt_festivals_chash', countryHash());
  } catch(e) {}
  if (typeof syncOnboardCacheSummary === 'function') syncOnboardCacheSummary();
  _persistPlaylistContextMirror();
  if (getActivePlaylistSessionId()) persistActivePlaylistSession().catch(() => {});
}

function persistData() {
  persistSettings(false);
  try {
    localStorage.setItem('tt_concerts',  JSON.stringify(concerts));
    localStorage.setItem('tt_festivals', JSON.stringify(festivals));
    localStorage.setItem('tt_festivals_chash', countryHash());
    localStorage.setItem('tt_scanned_artists', JSON.stringify(SCANNED_ARTISTS));
    localStorage.setItem('tt_data_chash', countryHash());
  } catch(e) {}
  if (typeof syncOnboardCacheSummary === 'function') syncOnboardCacheSummary();
  if (getActivePlaylistSessionId()) persistActivePlaylistSession().catch(() => {});
}

// Coalesces bursts of persistData() calls (retryAllErrors loop, rapid
// refresh-area clicks) into a single write after two animation frames.
let _persistDataScheduled = false;
function persistDataDeferred() {
  if (_persistDataScheduled) return;
  _persistDataScheduled = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _persistDataScheduled = false;
      persistData();
    });
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (_persistDataScheduled) {
      _persistDataScheduled = false;
      try { persistData(); } catch (e) {}
    }
  });
}

function restore() {
  _artistTrackStateRevision += 1;
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
    const storedDataHash = localStorage.getItem('tt_data_chash') || '';
    const storedFestivalHash = localStorage.getItem('tt_festivals_chash') || storedDataHash;
    const storedConcertSnapshot = localStorage.getItem('tt_concerts');
    const storedFestivalSnapshot = localStorage.getItem('tt_festivals');
    concerts         = JSON.parse(storedConcertSnapshot || '[]');
    festivals        = JSON.parse(storedFestivalSnapshot || '[]');
    SCANNED_ARTISTS  = JSON.parse(localStorage.getItem('tt_scanned_artists') || '[]');
    cacheTimestamp   = parseInt(localStorage.getItem('tt_cachets') || '0', 10);
    geoPreset        = localStorage.getItem('tt_geo_preset') || 'all';
    artistPreset     = localStorage.getItem('tt_artist_preset') || 'all';
    const resetScanSnapshot = normalizeScenarioAGeoState();
    const legacyUkOnlySnapshot = isScenarioAProductMode() && !storedDataHash && !storedFestivalHash && scanSnapshotLooksUkOnly();
    const scanSnapshotCleared = resetScanSnapshot || legacyUkOnlySnapshot || (storedDataHash && storedDataHash !== countryHash());
    const festivalSnapshotCleared = resetScanSnapshot || legacyUkOnlySnapshot || (storedFestivalHash && storedFestivalHash !== countryHash());
    if (scanSnapshotCleared) clearLocalConcertSnapshot();
    if (festivalSnapshotCleared) clearLocalFestivalSnapshot();
    // Migrate from old keys
    if (!ARTISTS.length)    ARTISTS   = JSON.parse(localStorage.getItem('tt3_artists') || '[]');
    if (!scanSnapshotCleared && storedConcertSnapshot === null && !concerts.length) concerts = JSON.parse(localStorage.getItem('tt3_concerts') || '[]');
    if (!festivalSnapshotCleared && storedFestivalSnapshot === null && !festivals.length) festivals = JSON.parse(localStorage.getItem('tt3_festivals') || '[]');
    if (!scanSnapshotCleared && !cacheTimestamp)    cacheTimestamp = parseInt(localStorage.getItem('tt3_cachets') || '0', 10);
    // Migrate old exclude-mode default (US,JP,AU excluded) → include EU by default
    const oldExc = localStorage.getItem('tt3_exc') || localStorage.getItem('tt_exc_legacy');
    if (!hiddenArtists || typeof hiddenArtists !== 'object') hiddenArtists = {};
    if (!ARTIST_PLAYS  || typeof ARTIST_PLAYS  !== 'object') ARTIST_PLAYS  = {};
    if (!Array.isArray(TRACKED_ARTISTS)) TRACKED_ARTISTS = [];
    if (!Array.isArray(SCANNED_ARTISTS)) SCANNED_ARTISTS = [];
    favoriteArtists = new Set(JSON.parse(localStorage.getItem('tt_favs') || '[]'));
    if (getActivePlaylistSessionId()) {
      const session = JSON.parse(localStorage.getItem('tt_playlist_session') || 'null');
      if (session?.playlistId === getActivePlaylistSessionId() && Array.isArray(session.artists)) {
        ARTISTS = uniqueArtistNames(session.artists);
        TRACKED_ARTISTS = uniqueArtistNames(session.trackedArtists || session.artists);
        ARTIST_PLAYS = session.artistPlays || {};
        SPOTIFY_PLAYLIST_META = session.playlistMeta || null;
        fetchErrors = session.fetchErrors || {};
        if (typeof _minTracksFilter !== 'undefined') _minTracksFilter = Math.max(1, Number(session.minTracks) || 1);
        const allowed = new Set(ARTISTS.map(name => name.toLowerCase()));
        concerts = concerts.filter(show => allowed.has(String(show?.artist || '').toLowerCase()));
        SCANNED_ARTISTS = SCANNED_ARTISTS.filter(name => allowed.has(String(name || '').toLowerCase()));
      } else {
        ARTISTS = []; TRACKED_ARTISTS = []; ARTIST_PLAYS = {};
        concerts = []; festivals = []; SCANNED_ARTISTS = []; cacheTimestamp = 0;
      }
    }
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
    if (isScenarioAProductMode()) {
      applyScenarioAArtistThreshold();
      applyScenarioAResultFilter();
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
  const playlistId = getActivePlaylistSessionId();
  const meta = SPOTIFY_PLAYLIST_META || {};
  const history = typeof getOnboardHistory === 'function' ? getOnboardHistory() : [];
  const pl = playlistId
    ? (history.find(item => String(item?.url || '').includes(`/playlist/${playlistId}`)) || {})
    : {};
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
    playlistId,
    minTracks: typeof _minTracksFilter !== 'undefined' ? _minTracksFilter : 1,
    fetchErrors: _playlistCopy(fetchErrors || {}),
    // Playlist metadata for future load-without-rescan
    playlistName: meta.name || pl.name || '',
    playlistUrl: meta.spotifyUrl || (playlistId ? `https://open.spotify.com/playlist/${playlistId}` : '') || pl.url || '',
    coverUrl: meta.coverUrl || pl.coverUrl || '',
    topArtists: meta.topArtists || pl.topArtists || ARTISTS.slice(0, 4),
    trackCount: meta.trackCount || pl.trackCount || ARTISTS.length,
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

let _savedStateLoadGeneration = 0;
function loadGameFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  if (typeof cancelPlaylistImport === 'function') cancelPlaylistImport();
  const generation = ++_savedStateLoadGeneration;
  const importGeneration = typeof _playlistImportGeneration !== 'undefined' ? _playlistImportGeneration : null;
  const current = () => generation === _savedStateLoadGeneration
    && (importGeneration === null || importGeneration === _playlistImportGeneration);
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      if (!current()) return;
      const data = JSON.parse(e.target.result);
      if (!data._tt) throw new Error('Not a ConcertTracker save file');
      await applyLoadedState(data, file.name, { isCurrent: current, cancelImport: false });
    } catch(err) {
      if (current()) softNotice(`Load failed: ${err.message}`, 'error');
    }
    // Reset file input so same file can be loaded again
    document.getElementById('sl-file-input').value = '';
  };
  reader.readAsText(file);
}

function _prepareLoadedState(data) {
  if (!data || !Array.isArray(data.artists)) throw new Error('Save file must contain an artist list');
  for (const key of ['concerts', 'festivals', 'trackedArtists', 'scannedArtists', 'includeCountries', 'excludeCountries', 'favoriteArtists']) {
    if (data[key] !== undefined && !Array.isArray(data[key])) throw new Error(`Invalid saved ${key}`);
  }
  const copy = _playlistCopy(data);
  const metadata = copy.playlistMeta || {
      name: data.playlistName || '',
      spotifyUrl: data.playlistUrl || '',
      coverUrl: data.coverUrl || '',
      topArtists: data.topArtists || [],
      trackCount: data.trackCount || 0,
      importedAt: data.savedAt || Date.now(),
  };
  const playlistId = String(copy.playlistId || metadata.id
    || String(metadata.spotifyUrl || copy.playlistUrl || '').match(/(?:playlist\/|spotify:playlist:)([a-zA-Z0-9]{22})/)?.[1] || '');
  if (playlistId && !/^[a-zA-Z0-9_-]{1,128}$/.test(playlistId)) throw new Error('Invalid saved playlist id');
  const mode = ['world', 'include', 'exclude'].includes(copy.countryMode) ? copy.countryMode : 'world';
  const include = uniqueArtistNames(copy.includeCountries || []).map(code => code.toUpperCase());
  const exclude = uniqueArtistNames(copy.excludeCountries || []).map(code => code.toUpperCase());
  const scope = mode === 'world' ? 'world' : `${mode}:${[...(mode === 'include' ? include : exclude)].sort().join(',')}`;
  const plays = copy.plays || {};
  const artists = isScenarioAProductMode()
    ? filterArtistsByPlayThreshold(copy.trackedArtists || copy.artists, plays, scenarioAFixedMinTracks())
    : uniqueArtistNames(copy.artists);
  const shows = deduplicateConcerts(copy.concerts || []);
  return { data: copy, mode, include, exclude, session: {
    version: 1, playlistId, savedAt: Date.now(), artists,
    trackedArtists: uniqueArtistNames(copy.trackedArtists || copy.playlistArtists || copy.artists),
    scannedArtists: uniqueArtistNames(copy.scannedArtists?.length ? copy.scannedArtists : inferConcertArtists(shows)),
    artistPlays: plays, artistTracks: copy.artistTracks || {}, playlistMeta: { ...metadata, id: playlistId },
    concerts: shows, festivals: copy.festivals || [], fetchErrors: copy.fetchErrors || {},
    minTracks: isScenarioAProductMode() ? scenarioAFixedMinTracks() : Math.max(1, Number(copy.minTracks) || 1),
    cacheTimestamp: Number(copy.cacheTimestamp) || 0, cHash: scope,
  } };
}

async function applyLoadedState(data, filename, { isCurrent = () => true, cancelImport = true } = {}) {
  // Parse/clone every input before stopping anything or replacing globals.
  const prepared = _prepareLoadedState(data);
  if (!isCurrent()) return false;
  if (cancelImport && typeof cancelPlaylistImport === 'function') cancelPlaylistImport();
  const generation = ++_playlistActivationGeneration;
  const importGeneration = typeof _playlistImportGeneration !== 'undefined' ? _playlistImportGeneration : null;
  const current = () => generation === _playlistActivationGeneration && isCurrent()
    && (importGeneration === null || importGeneration === _playlistImportGeneration);
  _playlistSessionTransitionDepth += 1;
  try {
    if (typeof stopActiveScanAndWait === 'function') await stopActiveScanAndWait();
    if (!current()) return false;
    persistSettings();
    await persistActivePlaylistSession();
    if (!current()) return false;
    if (!getActivePlaylistSessionId()) await _preserveLegacyMainPlaylistSession();
    if (!current()) return false;
    if (prepared.session.playlistId) await _writePlaylistSession(prepared.session);
    if (!current()) return false;
    countryMode = prepared.mode;
    includeCountries = new Set(prepared.include);
    excludeCountries = new Set(prepared.exclude);
    geoPreset = prepared.data.geoPreset || 'all';
    hiddenArtists = prepared.data.hiddenArtists || {};
    favoriteArtists = new Set(prepared.data.favoriteArtists || []);
    artistPreset = prepared.data.artistPreset || 'all';
    resetActivePlaylistSessionContext();
    _commitPlaylistSession(prepared.session);
    const textarea = document.getElementById('artists-ta');
    if (textarea) textarea.value = ARTISTS.map(name => {
      const plays = ARTIST_PLAYS[name.toLowerCase()] || 0;
      return plays ? `${name} ${plays}` : name;
    }).join('\n');
    if (typeof updateArtistCount === 'function') updateArtistCount();
    const playlistUrl = SPOTIFY_PLAYLIST_META?.spotifyUrl
      || (getActivePlaylistSessionId() ? `https://open.spotify.com/playlist/${getActivePlaylistSessionId()}` : '');
    for (const id of ['onboard-url', 'sp-playlist-url']) {
      const input = document.getElementById(id);
      if (input) input.value = playlistUrl;
    }

    const age = data.savedAt ? new Date(data.savedAt).toLocaleString('en-GB',{
      day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'
    }) : '?';
    const msg = `Loaded ${filename} · ${concerts.length} shows · ${festivals.length} festivals · saved ${age}`;
    setStatus(msg, true);
    dblog('info', `LOAD: ${msg}`);

    closeSaveLoad();
    hideOnboard();

    // Track that this data came from a save (not a scan) — mark in history
    try {
      if (playlistUrl || data.playlistName) {
        addToOnboardHistory(
          SPOTIFY_PLAYLIST_META?.name || data.playlistName || filename,
          playlistUrl,
          SPOTIFY_PLAYLIST_META?.trackCount || data.trackCount || ARTISTS.length,
          ARTISTS.length,
          SPOTIFY_PLAYLIST_META?.coverUrl || data.coverUrl || '',
          (data.topArtists || ARTISTS.slice(0, 4)),
          { fromSave: true, saveFile: filename }
        );
      }
      if (typeof renderOnboardHistory === 'function') renderOnboardHistory();
    } catch (error) {
      // The loaded session has already committed. History is secondary and
      // cannot turn a successful load into a misleading "Load failed" state.
      if (typeof softNotice === 'function') softNotice('Loaded successfully; playlist history could not be saved.', 'warn');
    }

    // Re-render everything
    buildCalChips();
    renderCalendar();
    renderMap();

    // If settings open, refresh them
    if (typeof renderPlaylistContext === 'function') renderPlaylistContext();
    const settings = document.getElementById('settings-bg');
    if (settings && !settings.classList.contains('off')) {
      openSettings();
    }
    return true;
  } finally { _playlistSessionTransitionDepth -= 1; }
}

// ── Reset map + lists, keep artists — rescan from scratch ──────────
