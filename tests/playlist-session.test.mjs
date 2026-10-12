import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../client/assets/app/core/storage.js', import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const A = 'AAAAAAAAAAAAAAAAAAAAAA';
const B = 'BBBBBBBBBBBBBBBBBBBBBB';
const imported = (id, artist) => ({ playlistId: id, artists: [artist], trackedArtists: [artist, 'Skipped'],
  artistPlays: { [artist.toLowerCase()]: 4, skipped: 1 }, artistTracks: { [artist.toLowerCase()]: [{ name: `${artist} song` }] },
  playlistMeta: { id, name: artist }, minTracks: 4 });
function fixture(shared = {}) {
  const local = shared.local || new Map();
  const records = shared.records || new Map();
  let stops = 0;
  const mockDB = {
    async get(store, key) { return records.get(`${store}:${key}`); },
    async put(store, key, value) { records.set(`${store}:${key}`, plain(value)); },
    async delete(store, key) { records.delete(`${store}:${key}`); },
  };
  const context = vm.createContext({
    window: { addEventListener() {} }, localStorage: { getItem: key => local.get(key) ?? null,
      setItem: (key, value) => local.set(key, String(value)), removeItem: key => local.delete(key) },
    mockDB, ARTISTS: ['Original'], TRACKED_ARTISTS: ['Original'], SCANNED_ARTISTS: ['Original'],
    ARTIST_PLAYS: { original: 8 }, ARTIST_TRACKS: { original: [{ name: 'Original song' }] },
    SPOTIFY_PLAYLIST_META: null, _artistTracksHydratedProfile: '', _minTracksFilter: 1,
    concerts: [{ id: 'original-show', artist: 'Original' }], festivals: [{ id: 'original-fest' }],
    fetchErrors: {}, cacheTimestamp: 123, countryMode: 'world', includeCountries: new Set(), excludeCountries: new Set(),
    focusedArtist: 'Original', focusedFest: null, activeProf: 'Main', PROF_MAIN: 'Main',
    API_KEY: '', TM_KEYS: [], hiddenArtists: {}, favoriteArtists: new Set(), geoPreset: 'all', artistPreset: 'all',
    SERVER_MANAGED_TICKETMASTER: false, SERVER_TM_PLACEHOLDER: 'server', _activeKeyIdx: 0,
    isScenarioAProductMode: () => false, profPersistCurrent() {}, requestAnimationFrame() {},
    deduplicateConcerts: list => list, normalizeFestivalLabels: list => list,
    scoreFestivals() { context.festivals.forEach(fest => { fest.scoreArtist = context.ARTISTS[0]; }); },
    async stopActiveScanAndWait() { stops++; },
  });
  vm.runInContext(source, context);
  vm.runInContext('DB.get = (...args) => mockDB.get(...args); DB.put = (...args) => mockDB.put(...args); DB.delete = (...args) => mockDB.delete(...args);', context);
  return { context, local, records, mockDB, stops: () => stops };
}

test('A → B → reload → A restores isolated results, tracks and cutoff while preserving original Main', async () => {
  const f = fixture();
  const c = f.context;
  c.persistSettings();
  assert.equal((await c.activateImportedPlaylistSession(imported(A, 'Muse'))).committed, true);
  assert.equal(c.concerts.length, 0);
  c.concerts = [{ id: 'a', artist: 'Muse' }, { id: 'wrong', artist: 'Sting' }];
  c.festivals = [{ id: 'a-fest', scoreArtist: 'Old' }];
  c.SCANNED_ARTISTS = ['Muse', 'Sting'];
  c.fetchErrors = { Muse: { attempts: 2 }, Sting: { attempts: 1 } };
  c.persistData();
  await c.persistActivePlaylistSession();
  await c.activateImportedPlaylistSession(imported(B, 'Sting'));
  assert.equal(c.concerts.length, 0);
  c.concerts = [{ id: 'b', artist: 'Sting' }];
  c.festivals = [{ id: 'b-fest' }];
  c.persistData();
  await c.persistActivePlaylistSession();
  assert.deepEqual(JSON.parse(f.local.get('tt_main_artists')), ['Original']);
  assert.deepEqual(plain((await c.getPlaylistSession('Main')).artists), ['Original']);

  const reloaded = fixture(f);
  reloaded.context.restore();
  await reloaded.context.hydrateArtistTrackState();
  assert.equal(reloaded.context.getActivePlaylistSessionId(), B);
  assert.deepEqual(plain(reloaded.context.ARTISTS), ['Sting']);
  assert.deepEqual(plain(reloaded.context.concerts).map(show => show.id), ['b']);
  assert.equal(reloaded.context.ARTIST_TRACKS.sting[0].name, 'Sting song');
  assert.equal((await reloaded.context.resumePlaylistSession(A)).resumed, true);
  assert.deepEqual(plain(reloaded.context.concerts).map(show => show.id), ['a']);
  assert.deepEqual(plain(reloaded.context.SCANNED_ARTISTS), ['Muse']);
  assert.deepEqual(Object.keys(reloaded.context.fetchErrors), ['Muse']);
  assert.equal(reloaded.context.festivals[0].scoreArtist, 'Muse');
  assert.equal(reloaded.context._minTracksFilter, 4);
  assert.equal(reloaded.context.artistTrackStoreKey(), `artistTracks:playlist:${A}`);
});

test('stale import never stops a scan or modifies current globals', async () => {
  const f = fixture();
  const before = plain(f.context.concerts);
  assert.equal((await f.context.activateImportedPlaylistSession(imported(A, 'Muse'), { isCurrent: () => false })).committed, false);
  assert.equal(f.stops(), 0);
  assert.deepEqual(plain(f.context.concerts), before);
  assert.equal(f.context.getActivePlaylistSessionId(), '');
});

test('import invalidated during its target read cannot stop the newer scan', async () => {
  const f = fixture();
  let release;
  let current = true;
  const get = f.mockDB.get;
  f.mockDB.get = async (store, key) => {
    if (key === `playlistSession:${A}`) await new Promise(resolve => { release = resolve; });
    return get(store, key);
  };
  const pending = f.context.activateImportedPlaylistSession(imported(A, 'Muse'), { isCurrent: () => current });
  await Promise.resolve();
  current = false;
  release();
  assert.equal((await pending).committed, false);
  assert.equal(f.stops(), 0);
});

test('invalid import and unknown resume leave the prior session intact', async () => {
  const f = fixture();
  await assert.rejects(f.context.activateImportedPlaylistSession({ playlistId: A, artists: [] }), /selected artist/);
  assert.equal((await f.context.resumePlaylistSession(B)).committed, false);
  assert.equal(f.stops(), 0);
  assert.deepEqual(plain(f.context.ARTISTS), ['Original']);
});

test('autosave captures before awaiting and serializes writes for the same playlist', async () => {
  const f = fixture();
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  await f.context.getPlaylistSession(A);
  let release;
  let writes = 0;
  const put = f.mockDB.put;
  f.mockDB.put = async (store, key, record) => {
    if (key === `playlistSession:${A}` && ++writes === 1) await new Promise(resolve => { release = resolve; });
    return put(store, key, record);
  };
  f.context.concerts = [{ id: 'first', artist: 'Muse' }];
  const first = f.context.persistActivePlaylistSession();
  await Promise.resolve();
  f.context.concerts = [{ id: 'latest', artist: 'Muse' }];
  const latest = f.context.persistActivePlaylistSession();
  await Promise.resolve();
  assert.equal(writes, 1);
  release();
  await first;
  await latest;
  assert.equal(writes, 2);
  assert.equal((await f.context.getPlaylistSession(A)).concerts[0].id, 'latest');
});

test('scope changes clear scan results but retain the selected playlist source', async () => {
  const f = fixture();
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  f.context.concerts = [{ id: 'a', artist: 'Muse' }];
  f.context.festivals = [{ id: 'a-fest' }];
  await f.context.persistActivePlaylistSession();
  await f.context.activateImportedPlaylistSession(imported(B, 'Sting'));
  f.context.countryMode = 'include';
  f.context.includeCountries.add('MX');
  await f.context.resumePlaylistSession(A);
  assert.deepEqual(plain(f.context.ARTISTS), ['Muse']);
  assert.equal(f.context.concerts.length, 0);
  assert.equal(f.context.festivals.length, 0);
  assert.equal(f.context.cacheTimestamp, 0);
});

test('target snapshot quota failure leaves the prior active playlist and mirror intact', async () => {
  const f = fixture();
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  f.context.concerts = [{ id: 'a', artist: 'Muse' }];
  await f.context.persistActivePlaylistSession();
  const put = f.mockDB.put;
  f.mockDB.put = (store, key, value) => key === `playlistSession:${B}`
    ? Promise.reject(new Error('QuotaExceededError')) : put(store, key, value);
  await assert.rejects(f.context.activateImportedPlaylistSession(imported(B, 'Sting')), /QuotaExceeded/);
  assert.equal(f.context.getActivePlaylistSessionId(), A);
  assert.deepEqual(plain(f.context.ARTISTS), ['Muse']);
  assert.equal(f.context.concerts[0].id, 'a');
  assert.equal(f.local.get('tt_active_playlist'), A);
  assert.equal(JSON.parse(f.local.get('tt_playlist_session')).playlistId, A);
});

test('saving a resumed playlist uses its active metadata, not the newest history entry', async () => {
  const f = fixture();
  f.context.getOnboardHistory = () => [{ name: 'Sting', url: `https://open.spotify.com/playlist/${B}` }];
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  const save = f.context.buildSavePayload('A save');
  assert.equal(save.playlistId, A);
  assert.equal(save.playlistName, 'Muse');
  assert.equal(save.playlistUrl, `https://open.spotify.com/playlist/${A}`);
  assert.equal(save.minTracks, 4);
});

test('loading a playlist file preserves the current session, restores file settings and requires no Spotify', async () => {
  const f = fixture();
  const textarea = { value: '' };
  const input = { value: '' };
  const notices = [];
  let counts = 0;
  Object.assign(f.context, { document: { getElementById: id => id === 'artists-ta' ? textarea : id.endsWith('-url') ? input : null },
    setStatus() {}, dblog() {}, closeSaveLoad() {}, hideOnboard() {}, addToOnboardHistory() {},
    updateArtistCount() { counts++; }, softNotice(message) { notices.push(message); },
    buildCalChips() {}, renderCalendar() {}, renderMap() {},
  });
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  f.context.concerts = [{ id: 'a', artist: 'Muse' }];
  const file = { _tt: true, artists: ['Sting'], plays: { sting: 8 }, playlistId: B,
    concerts: [{ id: 'saved-b', artist: 'Sting', country: 'MX' }], festivals: [{ id: 'saved-fest' }],
    countryMode: 'include', includeCountries: ['MX'], excludeCountries: [], minTracks: 8,
    playlistMeta: { id: B, name: 'Saved Sting' }, artistTracks: { sting: [{ name: 'Saved song' }] } };
  assert.equal(await f.context.applyLoadedState(file, 'saved.tt'), true);
  assert.equal(f.context.getActivePlaylistSessionId(), B);
  assert.equal(f.context.concerts[0].id, 'saved-b');
  assert.equal(f.context.SPOTIFY_PLAYLIST_META.name, 'Saved Sting');
  assert.equal(f.context._minTracksFilter, 8);
  assert.equal(f.context.countryHash(), 'include:MX');
  assert.equal((await f.context.getPlaylistSession(A)).concerts[0].id, 'a');
  assert.deepEqual(JSON.parse(f.local.get('tt_main_artists')), ['Original']);
  assert.equal(textarea.value, 'Sting 8');
  assert.equal(input.value, `https://open.spotify.com/playlist/${B}`);
  assert.equal(counts, 1);
  f.context.addToOnboardHistory = () => { throw new Error('LocalStorage quota'); };
  assert.equal(await f.context.applyLoadedState(file, 'saved.tt'), true);
  assert.match(notices[0], /Loaded successfully/);
});

test('invalid or failed file load does not modify playlist id, results or geographic scope', async () => {
  const f = fixture();
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  f.context.concerts = [{ id: 'a', artist: 'Muse' }];
  const stopped = f.stops();
  await assert.rejects(f.context.applyLoadedState({ artists: ['Sting'], concerts: {} }, 'bad.tt'), /Invalid saved concerts/);
  assert.equal(f.stops(), stopped);
  const put = f.mockDB.put;
  f.mockDB.put = (store, key, value) => key === `playlistSession:${B}`
    ? Promise.reject(new Error('QuotaExceededError')) : put(store, key, value);
  await assert.rejects(f.context.applyLoadedState({ artists: ['Sting'], playlistId: B, countryMode: 'include', includeCountries: ['MX'] }, 'b.tt'), /QuotaExceeded/);
  assert.equal(f.context.getActivePlaylistSessionId(), A);
  assert.equal(f.context.concerts[0].id, 'a');
  assert.equal(f.context.countryHash(), 'world');
  assert.equal(f.local.get('tt_active_playlist'), A);
});

test('new playlist track hydration cannot reuse another playlist legacy Main index', async () => {
  const f = fixture();
  f.records.set('meta:artistTracks:Main', { data: { original: ['old'] }, playlistMeta: { id: A } });
  await f.context.activateImportedPlaylistSession(imported(B, 'Sting'));
  await f.context.hydrateArtistTrackState('Main', true);
  assert.equal(f.context.ARTIST_TRACKS.original, undefined);
  assert.equal(f.context.SPOTIFY_PLAYLIST_META.id, B);
});

test('manual Main selection saves the playlist and restores the complete original Main backup', async () => {
  const f = fixture();
  Object.assign(f.context, { document: { getElementById: () => null, querySelector: () => null },
    updateArtistCount() {}, hideOnboard() {}, buildCalChips() {}, renderCalendar() {}, renderMap() {},
    clearTimeout() {}, setTimeout() {},
  });
  vm.runInContext(readFileSync(new URL('../client/assets/app/core/profiles.js', import.meta.url), 'utf8'), f.context);
  f.context.persistSettings();
  await f.context.activateImportedPlaylistSession(imported(A, 'Muse'));
  f.context.concerts = [{ id: 'a', artist: 'Muse' }];
  await f.context.profSwitch('Main');
  assert.equal(f.context.getActivePlaylistSessionId(), '');
  assert.deepEqual(plain(f.context.ARTISTS), ['Original']);
  assert.equal(f.context.concerts[0].id, 'original-show');
  assert.equal(f.context.ARTIST_TRACKS.original[0].name, 'Original song');
  assert.equal(f.context._minTracksFilter, 1);
  assert.equal((await f.context.getPlaylistSession(A)).concerts[0].id, 'a');
  assert.deepEqual(JSON.parse(f.local.get('tt_main_artists')), ['Original']);
});

test('IndexedDB writes resolve after commit, and entries pair keys and values in one transaction', async () => {
  const transactions = [];
  const database = { transaction(store, mode) {
    const transaction = { store, mode, request: null, objectStore() {
      return { put() { const request = {}; transaction.request = request; return request; },
        openCursor() { const request = {}; transaction.request = request; return request; } };
    } };
    transactions.push(transaction);
    return transaction;
  } };
  const context = vm.createContext({
    window: { addEventListener() {} }, localStorage: { getItem: () => null },
    indexedDB: { open() {
      const request = {};
      queueMicrotask(() => request.onsuccess({ target: { result: database } }));
      return request;
    } },
  });
  vm.runInContext(source, context);
  let committed = false;
  const write = vm.runInContext('DB.put("meta", "session", {})', context).then(() => { committed = true; });
  for (let i = 0; i < 5 && !transactions.length; i++) await Promise.resolve();
  const writer = transactions[0];
  writer.request.result = 'written';
  writer.request.onsuccess();
  await Promise.resolve();
  assert.equal(committed, false);
  writer.oncomplete();
  await write;
  assert.equal(committed, true);

  const entries = vm.runInContext('DB.entries("artists")', context);
  await Promise.resolve();
  const reader = transactions[1];
  let advanced = 0;
  reader.request.result = { key: 'muse', value: { shows: [1] }, continue() { advanced++; } };
  reader.request.onsuccess();
  reader.request.result = { key: 'sting', value: { shows: [2] }, continue() { advanced++; } };
  reader.request.onsuccess();
  reader.request.result = null;
  reader.request.onsuccess();
  reader.oncomplete();
  assert.equal(transactions.length, 2);
  assert.equal(reader.mode, 'readonly');
  assert.equal(advanced, 2);
  assert.deepEqual(plain(await entries), [['muse', { shows: [1] }], ['sting', { shows: [2] }]]);
});
