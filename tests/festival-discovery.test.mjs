import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = fs.readFileSync(new URL('../client/assets/app/scan/festivals.js', import.meta.url), 'utf8');
const actions = fs.readFileSync(new URL('../client/assets/app/scan/actions.js', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const start = actions.indexOf('function runFestivalRefresh(');
const refreshSource = actions.slice(start, actions.indexOf('\n}\n', start) + 3);
const FROM = Date.parse('2026-10-12T00:00:00Z') / 1000;

function fixture({ geo = [''], countries = [], names = [], fetchImpl } = {}) {
  const calls = [];
  const writes = [];
  const statuses = [];
  const timers = new Map();
  let timerId = 0;
  const nodes = new Map();
  const run = { cHash: 'world' };
  const context = vm.createContext({
    Date, URL, TextDecoder, Object, Array, Math, Promise,
    API_KEY: 'offline', ARTISTS: ['Fixture'], festivals: [], scanAborted: false, owned: true,
    FEST_VER: 4, KNOWN_FESTIVALS: names, window: {},
    document: { getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, { style: {} });
      return nodes.get(id);
    } },
    _isoDateOnly: () => '2026-10-12', _isValidIsoDateOnly: () => true,
    countryAllowed: () => true, countryHash: () => 'world', getScanContext: () => run,
    isScanRunCurrent: () => context.owned && !context.scanAborted, isScanRunOwned: () => context.owned,
    buildFestivalGeoTargets: () => geo, buildAlwaysSweepFestivalCountries: () => countries,
    deduplicateFestivals: list => [...new Map(list.map(event => [event.id, event])).values()],
    scoreFestivals() {}, dblog() {}, sleep: async () => {},
    ingestFestEvents(events) { context.festivals.push(...events); },
    setProgress() {}, setStatus(message, success) { statuses.push({ message, success }); },
    createScanRuntime: () => ({}), installScanRuntime: runtime => runtime, clearScanRuntime() {},
    withTrackedScanJob: (_kind, work) => work(run),
    DB: { async delete() {}, async put(store, key, value) { writes.push({ store, key, value }); } },
    persistFestivalData() {}, async persistActivePlaylistSession() {},
    buildCalChips() {}, renderCalendar() {}, buildFestPanel() {}, renderMap() {},
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    async apiFetch(url) {
      const params = new URL(url).searchParams;
      calls.push(params);
      return fetchImpl ? fetchImpl(params, calls.length, context) : response([]);
    },
  });
  vm.runInContext(source + '\n' + refreshSource, context);
  return { context, calls, writes, statuses, timers };
}

function response(events, page = {}) {
  return { ok: true, status: 200, async json() { return { _embedded: { events },
    page: { totalElements: events.length, totalPages: events.length ? 1 : 0, ...page } }; } };
}
function event(id, second = FROM) {
  return { id, date: '2026-10-12', dates: { start: { dateTime: new Date(second * 1000).toISOString() } } };
}
async function flush() { for (let i = 0; i < 30; i++) await Promise.resolve(); }

test('every geo, country and named query paginates beyond the former page caps', async () => {
  const f = fixture({ countries: ['US'], names: ['Example Festival'], fetchImpl: params => {
    const page = Number(params.get('page'));
    const key = params.get('countryCode') || params.get('keyword');
    return response(Array.from({ length: page === 5 ? 50 : 100 }, (_, i) => event(key + '-' + page + '-' + i)),
      { number: page, totalPages: 6, totalElements: 550 });
  } });
  const result = await f.context.fetchFestivalsData();
  assert.equal(result.complete, true);
  assert.equal(result.completedQueries, 3);
  assert.equal(result.requests, 18);
  for (const [keyword, country] of [['festival', null], ['festival', 'US'], ['Example Festival', null]]) {
    assert.deepEqual(f.calls.filter(p => p.get('keyword') === keyword && p.get('countryCode') === country)
      .map(p => Number(p.get('page'))), [0, 1, 2, 3, 4, 5]);
  }
});

test('all 147 named searches and the country sweeps run even when empty', async () => {
  const names = Array.from({ length: 147 }, (_, i) => 'Known ' + i);
  const f = fixture({ countries: ['US', 'MX', 'AR', 'BR', 'CL', 'CO', 'CA', 'AU', 'JP'], names });
  const result = await f.context.fetchFestivalsData();
  assert.equal(result.complete, true);
  assert.equal(result.totalQueries, 157);
  assert.equal(result.completedQueries, 157);
  assert.equal(result.requests, 157);
  assert.deepEqual(f.calls.filter(p => p.get('keyword') !== 'festival').map(p => p.get('keyword')).sort(), names.sort());
});

test('more than 1000 results use disjoint second-precision windows and a real far-future tail', async () => {
  const events = Array.from({ length: 1205 }, (_, i) => event(String(i), FROM + i));
  events.push(event('far-future', Date.parse('2075-07-01T00:00:00Z') / 1000));
  const f = fixture({ fetchImpl: params => {
    const begin = Date.parse(params.get('startDateTime')) / 1000;
    const end = params.has('endDateTime') ? Date.parse(params.get('endDateTime')) / 1000 : Infinity;
    let matches = events.filter(ev => {
      const second = Date.parse(ev.dates.start.dateTime) / 1000;
      return second >= begin && second <= end;
    });
    const size = Number(params.get('size'));
    const page = Number(params.get('page'));
    assert.ok(page * size < 1000, 'No request can exceed Ticketmaster deep paging');
    if (params.get('sort') === 'date,desc') matches = [...matches].reverse();
    return response(matches.slice(page * size, (page + 1) * size),
      { number: page, totalPages: Math.ceil(matches.length / size), totalElements: matches.length });
  } });
  const result = await f.context.fetchFestivalsData();
  assert.equal(result.complete, true);
  assert.equal(f.context.festivals.length, events.length);
  assert.ok(f.context.festivals.some(ev => ev.id === 'far-future'));
  assert.ok(f.calls.some(p => p.get('sort') === 'date,desc'));
  const bounded = f.calls.filter(p => p.has('endDateTime') && p.get('page') === '0');
  assert.ok(bounded.some(p => Date.parse(p.get('startDateTime')) > FROM * 1000), 'The second child starts after its sibling ends');
});

test('more than 1000 events at one second remain explicitly partial', async () => {
  const f = fixture({ fetchImpl: params => response(
    Array.from({ length: Number(params.get('size')) }, (_, i) => event(String(i))),
    { totalPages: Math.ceil(1100 / Number(params.get('size'))), totalElements: 1100 }) });
  const result = await f.context.fetchFestivalsData();
  assert.equal(result.complete, false);
  assert.equal(result.failedQueries.length, 1);
  assert.match(result.failedQueries[0].reason, /one second/);
  assert.equal(result.requests, 2);
});

test('a transient failure retries once; persistent errors never become a fresh successful cache', async () => {
  const recovered = fixture({ fetchImpl: (_p, count) => count === 1 ? { ok: false, status: 503 } : response([]) });
  assert.equal((await recovered.context.fetchFestivalsData()).complete, true);
  assert.equal(recovered.calls.length, 2);
  const failed = fixture({ fetchImpl: () => ({ ok: false, status: 503 }) });
  assert.equal(await failed.context.runFestivalRefresh(), false);
  assert.equal(failed.calls.length, 2);
  assert.equal(failed.writes[0].value.ts, 0);
  assert.equal(failed.writes[0].value.complete, false);
  assert.equal(failed.statuses.at(-1).success, false);
  assert.match(failed.statuses.at(-1).message, /partial/i);
});

test('a complete forced refresh preserves ongoing festivals and records proven cache completeness', async () => {
  const f = fixture();
  f.context.festivals = [{ ...event('ongoing'), endDate: '2026-10-14', lineup: [], sourceHints: [], matched: [] }];
  assert.equal(await f.context.runFestivalRefresh({ force: true }), true);
  assert.equal(f.context.festivals.length, 1);
  assert.equal(f.context.festivals[0].id, 'ongoing');
  assert.ok(f.writes[0].value.ts > 0);
  assert.equal(f.writes[0].value.complete, true);
  assert.equal(f.writes[0].value.discovery.complete, true);
  assert.equal(f.statuses.at(-1).success, true);
});

test('hard quota stops discovery without fresh caching and permanent HTTP failures do not retry', async () => {
  const stopped = fixture({ fetchImpl: (_params, _count, context) => {
    context.scanAborted = true;
    return { ok: false, status: 429 };
  } });
  assert.equal(await stopped.context.runFestivalRefresh(), false);
  assert.equal(stopped.calls.length, 1);
  assert.equal(stopped.writes[0].value.ts, 0);
  assert.equal(stopped.writes[0].value.complete, false);
  assert.equal(stopped.statuses.at(-1).success, false);
  const forbidden = fixture({ fetchImpl: () => ({ ok: false, status: 403 }) });
  assert.equal((await forbidden.context.fetchFestivalsData()).complete, false);
  assert.equal(forbidden.calls.length, 1);
});

test('the global request budget bounds work and leaves the search explicitly incomplete', async () => {
  const f = fixture({ geo: [], names: Array.from({ length: 1503 }, (_, i) => 'Budget ' + i) });
  const result = await f.context.fetchFestivalsData();
  assert.equal(result.requests, 1500);
  assert.equal(f.calls.length, 1500);
  assert.equal(result.complete, false);
  assert.equal(result.completedQueries, 1500);
  assert.equal(result.failedQueries.length, 3);
  assert.ok(result.failedQueries.every(failure => /budget/.test(failure.reason)));
});

test('a stalled JSON body has the remaining request deadline and bounded retries', async () => {
  const f = fixture({ fetchImpl: () => ({ ok: true, status: 200, json: () => new Promise(() => {}) }) });
  const pending = f.context.fetchFestivalsData();
  await flush();
  assert.equal(f.timers.size, 1);
  assert.ok([...f.timers.values()][0].delay <= 5000);
  [...f.timers.values()][0].callback();
  await flush();
  [...f.timers.values()][0].callback();
  const result = await pending;
  assert.equal(result.complete, false);
  assert.equal(result.requests, 2);
  assert.equal(f.timers.size, 0);
});

test('missing, malformed and truncated page metadata cannot produce complete discovery', async () => {
  for (const payload of [
    {},
    { page: { totalElements: -1, totalPages: 0 } },
    { page: { totalElements: 0, totalPages: '0' } },
    { page: { totalElements: 0, totalPages: 0, number: 1 } },
    { page: { totalElements: 0, totalPages: 0, size: 20 } },
    { page: { totalElements: 120, totalPages: 2 }, _embedded: { events: [event('truncated')] } },
  ]) {
    const f = fixture({ fetchImpl: () => ({ ok: true, status: 200, json: async () => payload }) });
    const result = await f.context.fetchFestivalsData();
    assert.equal(result.complete, false, JSON.stringify(payload));
    assert.equal(result.requests, 2);
    assert.match(result.failedQueries[0].reason, /Invalid festival response/);
  }
  const f = fixture({ fetchImpl: params => Number(params.get('page')) === 0
    ? response(Array.from({ length: 100 }, (_, i) => event(String(i))), { totalElements: 120, totalPages: 2, number: 0, size: 100 })
    : response(Array.from({ length: 10 }, (_, i) => event('last-' + i)), { totalElements: 120, totalPages: 2, number: 1, size: 100 }) });
  assert.equal((await f.context.fetchFestivalsData()).complete, false, 'A truncated last page must not complete a query');
  assert.equal(f.calls.length, 3);
});

test('native body timeout cancels its reader and late session responses cannot be ingested', async () => {
  let canceled = 0;
  const stalled = fixture({ fetchImpl: () => ({ ok: true, status: 200, body: { getReader: () => ({
    read: () => new Promise(() => {}), cancel: async () => { canceled++; },
  }) } }) });
  const pending = stalled.context.fetchFestivalsData();
  await flush();
  [...stalled.timers.values()][0].callback();
  await flush();
  [...stalled.timers.values()][0].callback();
  assert.equal((await pending).complete, false);
  assert.equal(canceled, 2);
  let resolve;
  const late = fixture({ fetchImpl: () => ({ ok: true, status: 200, json: () => new Promise(done => { resolve = done; }) }) });
  const job = late.context.fetchFestivalsData();
  await flush();
  late.context.owned = false;
  resolve({ _embedded: { events: [event('late')] } });
  assert.equal((await job).complete, false);
  assert.equal(late.context.festivals.length, 0);
});
