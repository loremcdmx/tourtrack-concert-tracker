import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

function load(context, file) {
  const url = new URL(`../client/assets/app/${file}`, import.meta.url);
  vm.runInContext(readFileSync(url, 'utf8'), context, { filename: url.pathname });
}

function runtimeContext(stored = {}) {
  const values = new Map(Object.entries(stored));
  const nodes = new Map();
  const noop = () => {};
  const context = vm.createContext({
    window: { addEventListener: noop },
    document: { getElementById: id => {
      if (!nodes.has(id)) nodes.set(id, { style: {}, className: '', textContent: '', classList: { contains: () => true } });
      return nodes.get(id);
    } },
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key),
    },
    setTimeout: noop,
    ARTISTS: ['Alpha'], TRACKED_ARTISTS: ['Alpha'], SCANNED_ARTISTS: [],
    ARTIST_PLAYS: { alpha: 12 }, ARTIST_TRACKS: {}, SPOTIFY_PLAYLIST_META: null,
    _artistTracksHydratedProfile: '', activeProf: 'Main', PROF_MAIN: 'Main',
    API_KEY: 'offline', TM_KEYS: [], _activeKeyIdx: 0, SERVER_MANAGED_TICKETMASTER: true, SERVER_TM_PLACEHOLDER: '__SERVER__', INTERNAL_PROXY_TEMPLATE: '',
    concerts: [], festivals: [], cacheTimestamp: 0, countryMode: 'world',
    includeCountries: new Set(), excludeCountries: new Set(), hiddenArtists: {}, favoriteArtists: new Set(),
    geoPreset: 'all', artistPreset: 'all', scanAborted: false,
    isScenarioAProductMode: () => false,
    deduplicateConcerts: list => list,
    normalizeFestivalLabels: list => list,
    profPersistCurrent: noop,
    buildFestPanel: noop, renderMap: noop, renderCalendar: noop, buildCalChips: noop,
    setStatus: noop, setProgress: noop, dblog: noop, scoreFestivals: noop,
    dbDelete: async () => {}, dbPut: async () => {},
  });
  load(context, 'core/storage.js');
  load(context, 'scan/actions.js');
  vm.runInContext('DB.delete = dbDelete; DB.put = dbPut;', context);
  context.snapshotOngoingFestivals = () => ({ cHash: context.countryHash(), data: [] });
  context.mergeOngoingFestivals = (_snapshot, list = context.festivals) => list;
  return context;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

test('festival-only rescan survives a reload without replacing concert data', async () => {
  const concert = { artist: 'Alpha', date: '2026-10-08', country: 'DE' };
  const context = runtimeContext({
    tt_main_artists: '["Alpha"]', tt_main_plays: '{"alpha":12}',
    tt_cmode: 'world', tt_data_chash: 'world',
    tt_concerts: JSON.stringify([concert]), tt_festivals: '[{"id":"old-festival"}]',
  });
  const fresh = { id: 'fresh-festival', date: '2026-10-12', endDate: '2026-10-14', country: 'FR' };
  context.concerts = [concert];
  context.fetchFestivalsData = async () => { context.festivals = [fresh]; };
  await context.rescanFestsOnly();
  context.festivals = [];
  context.restore();
  assert.equal(context.festivals[0]?.id, fresh.id);
  assert.equal(context.festivals[0]?.endDate, fresh.endDate);
  assert.equal(context.concerts[0]?.country, 'DE');
});

test('a festival-only rescan saves its own scope without relabelling old concerts', async () => {
  const context = runtimeContext({
    tt_main_artists: '["Alpha"]', tt_cmode: 'include', tt_inc: '["FR"]',
    tt_data_chash: 'include:DE',
    tt_concerts: '[{"artist":"Alpha","date":"2026-10-08","country":"DE"}]',
    tt3_concerts: '[{"artist":"Alpha","date":"2026-10-08","country":"DE"}]',
    tt_festivals: '[{"id":"old-german-festival","country":"DE"}]',
  });
  context.countryMode = 'include';
  context.includeCountries = new Set(['FR']);
  context.fetchFestivalsData = async () => {
    context.festivals = [{ id: 'new-french-festival', date: '2026-10-12', country: 'FR' }];
  };
  await context.rescanFestsOnly();
  assert.equal(context.localStorage.getItem('tt_data_chash'), 'include:DE');
  context.restore();
  assert.equal(context.concerts.length, 0);
  assert.equal(context.festivals[0]?.id, 'new-french-festival');
  context.restore();
  assert.equal(context.concerts.length, 0, 'a second reload must not resurrect invalidated legacy concerts');
  assert.equal(context.festivals[0]?.id, 'new-french-festival');
});

test('an empty fresh festival snapshot does not resurrect legacy festival results', async () => {
  const context = runtimeContext({
    tt_main_artists: '["Alpha"]', tt_cmode: 'world', tt_data_chash: 'world',
    tt_festivals: '[{"id":"old-festival"}]', tt3_festivals: '[{"id":"legacy-festival"}]',
  });
  context.fetchFestivalsData = async () => { context.festivals = []; };
  await context.rescanFestsOnly();
  context.restore();
  assert.equal(context.festivals.length, 0);
});

test('older saved festival snapshots still use the shared scope stamp', () => {
  const context = runtimeContext({
    tt_main_artists: '["Alpha"]', tt_cmode: 'world', tt_data_chash: 'world',
    tt_festivals: '[{"id":"legacy-compatible","date":"2026-10-12"}]',
  });
  context.restore();
  assert.equal(context.festivals[0]?.id, 'legacy-compatible');
});

test('a delayed track-cache read cannot overwrite a newer playlist import', async () => {
  const context = runtimeContext();
  const read = deferred();
  context.dbGet = () => read.promise;
  vm.runInContext('DB.get = dbGet;', context);
  const hydration = context.hydrateArtistTrackState('Main');
  context.setArtistTrackState({ fresh: { artist: 'Fresh' } }, { name: 'New playlist' }, 'Main');
  read.resolve({ data: { stale: { artist: 'Stale' } }, playlistMeta: { name: 'Old playlist' } });
  await hydration;
  assert.equal(context.ARTIST_TRACKS.fresh?.artist, 'Fresh');
  assert.equal(context.SPOTIFY_PLAYLIST_META.name, 'New playlist');
});

test('a delayed track-cache error cannot clear a newer playlist import', async () => {
  const context = runtimeContext();
  const read = deferred();
  context.dbGet = () => read.promise;
  vm.runInContext('DB.get = dbGet;', context);
  const hydration = context.hydrateArtistTrackState('Main');
  context.setArtistTrackState({ fresh: { artist: 'Fresh' } }, { name: 'New playlist' }, 'Main');
  read.reject(new Error('Old cache read failed'));
  await hydration;
  assert.equal(context.ARTIST_TRACKS.fresh?.artist, 'Fresh');
  assert.equal(context.SPOTIFY_PLAYLIST_META.name, 'New playlist');
});

test('out-of-order profile hydration keeps the most recent profile state', async () => {
  const context = runtimeContext();
  const main = deferred();
  const guest = deferred();
  context.dbGet = (_store, key) => key === 'artistTracks:Main' ? main.promise : guest.promise;
  vm.runInContext('DB.get = dbGet;', context);
  const first = context.hydrateArtistTrackState('Main');
  context.activeProf = 'Guest';
  const second = context.hydrateArtistTrackState('Guest');
  guest.resolve({ data: { guest: { artist: 'Guest' } }, playlistMeta: { name: 'Guest playlist' } });
  await second;
  main.resolve({ data: { main: { artist: 'Main' } }, playlistMeta: { name: 'Main playlist' } });
  await first;
  assert.equal(context.ARTIST_TRACKS.guest?.artist, 'Guest');
  assert.equal(context.SPOTIFY_PLAYLIST_META.name, 'Guest playlist');
});
