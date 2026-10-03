import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const appFile = path => new URL(`../client/assets/app/${path}`, import.meta.url);
function load(paths, globals = {}) {
  const context = vm.createContext({ window: {}, ...globals });
  for (const path of paths) vm.runInContext(readFileSync(appFile(path), 'utf8'), context, { filename: path });
  return context;
}

test('10,000 region checks build the country preset once and refresh when selection changes', () => {
  let countryTraversals = 0;
  const COUNTRY_MAP = new Proxy({ DE: { r: 'eu' }, GB: { r: 'eu' }, US: { r: 'na' }, CA: { r: 'na' } }, {
    ownKeys(target) { countryTraversals++; return Reflect.ownKeys(target); },
  });
  const context = load(['core/filter-presets.js', 'ui/calendar.js'], { COUNTRY_MAP, geoPreset: 'eu' });
  for (let index = 0; index < 10_000; index++) {
    assert.equal(context.geoPresetOk(index % 2 ? 'DE' : 'US'), Boolean(index % 2));
  }
  assert.equal(countryTraversals, 1);
  context.geoPreset = 'na';
  assert.equal(context.geoPresetOk('US'), true);
  assert.equal(context.geoPresetOk('DE'), false);
  assert.equal(countryTraversals, 2);
  context.COUNTRY_MAP = { MX: { r: 'na' } };
  assert.equal(context.geoPresetOk('MX'), true);
  assert.equal(context.geoPresetOk('US'), false);
});

test('a burst of filter changes queues one pair of frames and one calendar/map rebuild', () => {
  const frames = [];
  let nextFrameId = 0;
  const calls = { chips: 0, calendar: 0, map: 0 };
  const context = load(['ui/calendar.js'], {
    requestAnimationFrame(callback) { frames.push(callback); return ++nextFrameId; },
  });
  context.buildCalChips = () => { calls.chips++; };
  context.renderCalendar = () => { calls.calendar++; };
  context.refreshFilteredMap = () => { calls.map++; };
  for (let index = 0; index < 1_000; index++) context.scheduleFilterRefresh({ buildChips: index === 500 });
  assert.equal(frames.length, 1);
  frames.shift()();
  for (let index = 0; index < 100; index++) context.scheduleFilterRefresh();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(frames.length, 0);
  assert.equal(nextFrameId, 2);
  assert.deepEqual(calls, { chips: 1, calendar: 1, map: 1 });
  context.scheduleFilterRefresh({ map: false });
  frames.shift()();
  frames.shift()();
  assert.deepEqual(calls, { chips: 1, calendar: 2, map: 1 });
});

test('favorite changes rebuild the sidebar through the map once', () => {
  let sidebarBuilds = 0;
  let stopped = 0;
  const context = load(['ui/calendar.js'], {
    favoriteArtists: new Set(),
    document: { getElementById: () => ({ style: {} }) },
    persistSettingsDeferred() {}, persistSettings() {},
  });
  context.buildSidebar = () => { sidebarBuilds++; };
  context.renderMap = () => context.buildSidebar();
  context.refreshFilteredMap = () => context.buildSidebar();
  context.toggleFavorite('Muse', { stopPropagation: () => { stopped++; } });
  assert.equal(sidebarBuilds, 1);
  assert.equal(stopped, 1);
  assert.equal(context.favoriteArtists.has('muse'), true);
  context.resetFavorites();
  assert.equal(sidebarBuilds, 2);
  assert.equal(context.favoriteArtists.size, 0);
});

test('2,000 scored festival cards with no linked shows do not rescan concerts', () => {
  let linkedConcertScans = 0;
  const context = load(['ui/map/sidebar.js'], {
    focusedFest: null,
    document: { createElement: () => ({
      dataset: {}, style: {}, setAttribute() {}, querySelectorAll: () => [],
    }) },
    flag: () => '', fmtDateRange: () => 'Oct 3',
    _festivalLinkedConcerts() { linkedConcertScans++; return [{ artist: 'Muse' }]; },
    _resolvedFestivalLineup: () => [],
  });
  for (let index = 0; index < 2_000; index++) {
    context.createFestCardNode({ id: `festival-${index}`, name: 'Festival', date: '2026-10-03', linkedShows: 0, lineupResolved: [] });
  }
  assert.equal(linkedConcertScans, 0);
  const unscoredCard = context.createFestCardNode({ id: 'unscored', name: 'Festival', date: '2026-10-03' });
  assert.equal(linkedConcertScans, 1);
  assert.match(unscoredCard.innerHTML, /1 linked/);
});

test('festival match compiles patterns per profile artist while preserving scoring and boundaries', () => {
  let patternsCompiled = 0;
  function CountedRegExp(...args) { patternsCompiled++; return new RegExp(...args); }
  const artists = ['Muse', 'AC/DC', 'Dua Lipa', ...Array.from({ length: 247 }, (_, index) => `Artist ${index}`)];
  const context = load(['ui/map/match.js'], {
    RegExp: CountedRegExp, ARTISTS: artists, ARTIST_PLAYS: { muse: 12, 'ac/dc': 2 },
    matchHerMap: {
      muse: { name: 'Muse', count: 3 },
      gorillaz: { name: 'Gorillaz', count: 10 },
      'foo fighters': { name: 'Foo Fighters', count: 4 },
    },
    festivals: [
      { id: 'lineup', name: 'Festival', date: '2026-10-03', lineup: ['Muse', 'AC/DC', 'Gorillaz', 'Dua Lipa'] },
      { id: 'name-fallback', name: 'Foo Fighters Festival', date: '2026-10-04', lineup: [] },
      { id: 'word-boundary', name: 'Paramuse Festival', date: '2026-10-05', lineup: [] },
      ...Array.from({ length: 1_497 }, (_, index) => ({ id: `empty-${index}`, name: 'Festival', date: '2026-10-06', lineup: ['Nobody'] })),
    ],
  });
  const result = JSON.parse(JSON.stringify(context.matchScoreFestivals()));
  assert.equal(result.length, 1_500);
  assert.equal(patternsCompiled, 252);
  assert.deepEqual(result[0].matchedShared, ['Muse']);
  assert.deepEqual(result[0].matchedMe, ['AC/DC', 'Dua Lipa']);
  assert.deepEqual(result[0].matchedHer, ['Gorillaz']);
  assert.equal(result[0].matchScore, (20 + Math.log2(12) + 8) * 1.5 + 7 + 17);
  assert.equal(result[1].id, 'name-fallback');
  assert.deepEqual(result[1].matchedHer, ['Foo Fighters']);
  assert.equal(result.find(festival => festival.id === 'word-boundary').matchScore, 0);
  context.ARTIST_PLAYS = { muse: 20, 'ac/dc': 2 };
  assert.ok(context.matchScoreFestivals()[0].matchScore > result[0].matchScore);
  assert.equal(patternsCompiled, 504);
});

test('keyboard activation opens an artist once and ignores bubbled keys from nested actions', () => {
  let opened = 0;
  let prevented = 0;
  let propagationStopped = 0;
  const context = load(['ui/calendar.js'], { openArtistDetail: () => { opened++; } });
  const attributes = new Map();
  const node = {
    classList: { add() {} },
    getAttribute: key => attributes.get(key),
    setAttribute: (key, value) => attributes.set(key, value),
    click() { this.onclick({ preventDefault() {}, stopPropagation() {} }); },
  };
  context.bindArtistDetailTrigger(node, 'Muse');
  assert.equal(attributes.get('role'), 'button');
  assert.equal(node.tabIndex, 0);
  const keydown = (key, target = node, repeat = false) => node.onkeydown({
    key, target, repeat,
    preventDefault: () => { prevented++; },
    stopPropagation: () => { propagationStopped++; },
  });
  keydown('Enter');
  keydown(' ');
  assert.equal(opened, 2);
  assert.equal(prevented, 2);
  assert.equal(propagationStopped, 2);
  keydown('Enter', { tagName: 'BUTTON' });
  keydown(' ', node, true);
  keydown('Escape');
  assert.equal(opened, 2);
  assert.equal(prevented, 2);
});
