import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
async function until(predicate) {
  for (let i = 0; i < 40 && !predicate(); i++) await Promise.resolve();
  assert.ok(predicate(), 'expected asynchronous stage was reached');
}
function fixture(files = ['scan/runtime.js']) {
  const nodes = new Map();
  const writes = [];
  const timers = [];
  let saved = 0;
  const context = vm.createContext({
    window: {}, activeProf: 'Main', playlistId: 'A', getActivePlaylistSessionId: () => context.playlistId,
    isPlaylistSessionTransitioning: () => false, ARTISTS: ['Muse', 'Sting'], TRACKED_ARTISTS: [], SCANNED_ARTISTS: [],
    scanAborted: false, countryHash: () => 'world', concerts: [], festivals: [], fetchErrors: {}, cacheTimestamp: 0,
    API_KEY: 'offline', dbgVisible: true, _mapFirstFit: false, netErrStreak: 0, netErrTotal: 0,
    circuitOpen: false, dbgBannerDismissed: false, includeCountries: new Set(),
    document: { getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { style: {}, classList: { remove() {} } });
      return nodes.get(id);
    } },
    dblog() {}, setProgress() {}, setStatus() {}, updateErrorTab() {}, scheduleUiRefresh() {}, openSettings() {},
    setScannedArtists(names) { context.SCANNED_ARTISTS = [...names]; },
    setTrackedArtists(names) { context.TRACKED_ARTISTS = [...names]; },
    _isoDateOnly: () => '2026-10-03', snapshotOngoingFestivals: () => ({ data: [] }),
    mergeOngoingFestivals: (_snapshot, list) => list, deduplicateConcerts: list => list,
    DB: { async get() {}, async put(...args) { writes.push(args); } },
    TTL_ARTIST: 1, TTL_FEST: 1, FEST_VER: 4,
    bitPreFlightScan: async () => new Map(), shouldUseGeoSweep: () => false,
    artistCacheTTLForRecord: () => 1, fetchConcerts: async () => [], fetchBIT: async () => [],
    fetchFestivalsData: async () => {}, scoreFestivals() {},
    persistData() { saved++; }, sleep: async () => {},
    setTimeout(fn) { timers.push(fn); },
  });
  for (const file of files) {
    vm.runInContext(readFileSync(new URL(`../client/assets/app/${file}`, import.meta.url), 'utf8'), context, { filename: file });
  }
  return { context, nodes, writes, timers, saved: () => saved };
}

test('a tracked job keeps its artist snapshot and Stop waits for the complete outer lifecycle', async () => {
  const f = fixture();
  const gate = deferred();
  let run;
  let stopped = false;
  const job = f.context.withTrackedScanJob('festivals', async owner => {
    run = owner;
    await gate.promise;
    assert.equal(f.context.isScanRunCurrent(owner), false);
  });
  await until(() => !!run);
  f.context.ARTISTS.push('New artist');
  assert.deepEqual(Array.from(run.artists), ['Muse', 'Sting']);
  assert.ok(Object.isFrozen(run.artists));
  const stop = f.context.stopActiveScanAndWait().then(() => { stopped = true; });
  assert.equal(await f.context.withTrackedScanJob('new', () => assert.fail('must wait for old job')), false);
  await Promise.resolve();
  assert.equal(stopped, false);
  gate.resolve();
  await job;
  await stop;
  assert.equal(stopped, true);
  assert.equal(f.nodes.get('loadbar').style.display, 'none');
  assert.equal(f.nodes.get('stop-btn').style.display, 'none');
  f.context.playlistId = 'B';
  await f.context.withTrackedScanJob('new', owner => {
    assert.equal(owner.playlistId, 'B');
    assert.equal(f.context.isScanRunCurrent(owner), true);
  });
});

test('an old runtime cannot clear replacement hooks and callbacks cannot mutate another owner', () => {
  const f = fixture();
  const oldRun = f.context.getScanContext();
  const old = f.context.installScanRuntime(f.context.createScanRuntime(), oldRun);
  const old429 = f.context.window._onTm429;
  f.context.invalidateScanRun();
  f.context.scanAborted = false;
  const current = f.context.installScanRuntime(f.context.createScanRuntime(), f.context.getScanContext());
  const currentWait = f.context.window._rateLimitedWait;
  f.context.clearScanRuntime(old);
  assert.equal(f.context.window._rateLimitedWait, currentWait);
  old429();
  assert.equal(old.consecutive429, 0);
  f.context.window._onTm429();
  assert.equal(current.consecutive429, 1);
});

test('aborting concurrent artist cache reads drains both workers and skips late writes/finalize', async () => {
  const f = fixture(['scan/runtime.js', 'scan/pipeline.js']);
  const gates = new Map();
  f.context.DB.get = async (store, key) => {
    if (store !== 'artists' || key === '__ping__') return;
    const gate = deferred();
    gates.set(key, gate);
    await gate.promise;
    return { shows: [{ id: key, artist: key, date: '2026-10-04' }] };
  };
  const job = f.context.fetchAll(true);
  await until(() => gates.size === 2);
  let drained = false;
  const stop = f.context.stopActiveScanAndWait().then(() => { drained = true; });
  gates.get('muse').resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(drained, false);
  gates.get('sting').resolve();
  await job;
  await stop;
  assert.equal(f.context.concerts.length, 0);
  assert.equal(f.writes.length, 0);
  assert.equal(f.saved(), 0);
  assert.equal(f.context.window._rateLimitedWait, null);
});

test('late provider results cannot populate the next playlist after a handoff request', async () => {
  const f = fixture(['scan/runtime.js', 'scan/pipeline.js']);
  const pending = [];
  f.context.fetchConcerts = async artist => {
    const gate = deferred(); pending.push(gate);
    await gate.promise;
    return [{ id: artist, artist, date: '2026-10-04' }];
  };
  const job = f.context.fetchAll(true);
  await until(() => pending.length === 2);
  const stop = f.context.stopActiveScanAndWait();
  pending.forEach(gate => gate.resolve());
  await stop;
  await job;
  f.context.playlistId = 'B';
  f.context.ARTISTS = ['New artist'];
  assert.equal(f.context.concerts.length, 0);
  assert.equal(f.writes.length, 0);
  assert.equal(f.saved(), 0);
});

test('festival JSON completed after invalidation is ignored, including final scoring', async () => {
  const f = fixture(['scan/runtime.js', 'scan/festivals.js']);
  const json = deferred();
  let requested = 0;
  let ingested = 0;
  let scored = 0;
  Object.assign(f.context, {
    FESTIVAL_FETCH_CONCURRENCY: 2, KNOWN_FESTIVALS: ['Festival'],
    buildFestivalGeoTargets: () => [], buildAlwaysSweepFestivalCountries: () => [],
    festivalGeoTargetCount: () => 0, deduplicateFestivals: list => list,
    ingestFestEvents() { ingested++; }, scoreFestivals() { scored++; },
    async apiFetch() { requested++; return { ok: true, json: () => json.promise }; },
  });
  const job = f.context.withTrackedScanJob('festivals', run => f.context.fetchFestivalsData(run));
  await until(() => requested === 1);
  const stop = f.context.stopActiveScanAndWait();
  json.resolve({ _embedded: { events: [{ id: 'stale' }] } });
  await job;
  await stop;
  assert.equal(ingested, 0);
  assert.equal(scored, 0);
});
