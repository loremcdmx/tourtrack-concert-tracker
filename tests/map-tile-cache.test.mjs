import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const WORKER_SOURCE = readFileSync(new URL('../client/map-cache-sw.js', import.meta.url), 'utf8');
const REGISTRATION_SOURCE = readFileSync(new URL('../client/assets/app/ui/map/tile-cache.js', import.meta.url), 'utf8');
const CACHE_NAME = 'concerttracker-osm-tiles-v1';
const FRESH_UNTIL = 'x-ct-tile-fresh-until';
const NOW = Date.parse('2026-10-03T12:00:00Z');
const WEEK = 7 * 24 * 60 * 60 * 1000;
const TILE_URL = 'https://tile.openstreetmap.org/3/4/2.png';
const PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function typedResponse(response, type) {
  Object.defineProperty(response, 'type', { value: type });
  Object.defineProperty(response, 'clone', {
    value() { return typedResponse(Response.prototype.clone.call(this), type); },
  });
  return response;
}

function tileResponse({ body = PNG, status = 200, type = 'cors', headers = {} } = {}) {
  if (status === 0) return typedResponse(Response.error(), type);
  return typedResponse(new Response(body, {
    status,
    headers: { 'content-type': 'image/png', 'cache-control': 'max-age=3600', ...headers },
  }), type);
}

function keyOf(request) { return typeof request === 'string' ? request : request.url; }

class MemoryCache {
  constructor() { this.entries = new Map(); this.failure = ''; }
  async match(request) {
    if (this.failure === 'match') throw new Error('Cache reads unavailable');
    return this.entries.get(keyOf(request))?.clone();
  }
  async put(request, response) {
    if (this.failure === 'put') throw new Error('Quota exceeded');
    this.entries.set(keyOf(request), response.clone());
    await response.arrayBuffer(); // Cache.put consumes its input body.
  }
  async delete(request) { return this.entries.delete(keyOf(request)); }
  async keys() { return [...this.entries.keys()].map(url => new Request(url, { mode: 'cors' })); }
}

function memoryStorage() {
  const named = new Map();
  return {
    named,
    failure: '',
    async open(name) {
      if (this.failure === 'open') throw new Error('CacheStorage blocked');
      if (!named.has(name)) named.set(name, new MemoryCache());
      return named.get(name);
    },
    async keys() { return [...named.keys()]; },
    async delete(name) { return named.delete(name); },
  };
}

function workerHarness({ storage = memoryStorage(), fetchImpl = async () => tileResponse(), now = NOW } = {}) {
  const clock = { now };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  const handlers = new Map();
  const fetchCalls = [];
  let claims = 0;
  let skips = 0;
  const context = vm.createContext({
    Date: FixedDate, URL, Request, Response, Headers, caches: storage,
    fetch: async request => {
      fetchCalls.push(request);
      return fetchImpl(request);
    },
    self: {
      addEventListener(type, callback) { handlers.set(type, callback); },
      async skipWaiting() { skips++; },
      clients: { async claim() { claims++; } },
    },
  });
  vm.runInContext(WORKER_SOURCE, context, { filename: 'map-cache-sw.js' });
  function intercept(request) {
    let response = null;
    handlers.get('fetch')({ request, respondWith(value) { response = Promise.resolve(value); } });
    return response;
  }
  return {
    context, storage, clock, fetchCalls, intercept,
    serve(url = TILE_URL) {
      const response = intercept(new Request(url, { mode: 'cors' }));
      assert.ok(response, 'A permitted tile must be intercepted');
      return response;
    },
    async lifecycle(type) {
      const jobs = [];
      handlers.get(type)({ waitUntil(job) { jobs.push(job); } });
      await Promise.all(jobs);
    },
    get claims() { return claims; },
    get skips() { return skips; },
  };
}

function registrationHarness({ secure = true, supported = true, controller = null, registerImpl, listenerFailure = false } = {}) {
  const listeners = new Set();
  const timers = new Map();
  const registerCalls = [];
  let nextTimer = 0;
  const serviceWorker = {
    controller,
    addEventListener(type, listener) {
      assert.equal(type, 'controllerchange');
      if (listenerFailure) throw new Error('Worker events blocked');
      listeners.add(listener);
    },
    removeEventListener(type, listener) { assert.equal(type, 'controllerchange'); listeners.delete(listener); },
    register(url, options) {
      registerCalls.push({ url, scope: options.scope });
      return registerImpl ? registerImpl() : Promise.resolve({});
    },
  };
  const context = vm.createContext({
    window: { isSecureContext: secure },
    navigator: supported ? { serviceWorker } : {},
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  vm.runInContext(REGISTRATION_SOURCE, context, { filename: 'tile-cache.js' });
  return {
    context, listeners, timers, registerCalls,
    claim() { serviceWorker.controller = {}; for (const listener of [...listeners]) listener(); },
    expire() { for (const { callback } of [...timers.values()]) callback(); },
  };
}

test('the worker handles only exact CORS GET requests for valid standard OSM tile coordinates', () => {
  const harness = workerHarness();
  for (const url of [TILE_URL, 'https://tile.openstreetmap.org/0/0/0.png', 'https://tile.openstreetmap.org/19/524287/524287.png']) {
    assert.equal(harness.context.isMapTileRequest(new Request(url, { mode: 'cors' })), true, url);
  }
  for (const request of [
    new Request(TILE_URL, { method: 'POST', mode: 'cors' }),
    new Request(TILE_URL, { mode: 'no-cors' }),
    ...[
      'http://tile.openstreetmap.org/3/4/2.png',
      'https://tile.openstreetmap.org.evil.example/3/4/2.png',
      'https://a.tile.openstreetmap.org/3/4/2.png',
      'https://tile.openstreetmap.org:444/3/4/2.png',
      `${TILE_URL}?v=1`,
      'https://tile.openstreetmap.org/3/8/2.png',
      'https://tile.openstreetmap.org/3/4/8.png',
      'https://tile.openstreetmap.org/20/0/0.png',
      'https://tile.openstreetmap.org/3/4/2.jpg',
      'https://concerttracker.example/api/spotify/token',
      'https://concerttracker.example/assets/app.js',
    ].map(url => new Request(url, { mode: 'cors' })),
  ]) {
    assert.equal(harness.intercept(request), null, request.url);
  }
  assert.equal(harness.fetchCalls.length, 0);
  assert.equal(harness.storage.named.size, 0);
});

test('fresh tiles survive worker replacement and produce independently readable cache hits without prefetch', async () => {
  const storage = memoryStorage();
  const foreign = await storage.open('another-feature-cache');
  await foreign.put('https://concerttracker.example/other', new Response('keep me'));
  const first = workerHarness({ storage });
  await first.lifecycle('install');
  await first.lifecycle('activate');
  assert.equal(first.skips, 1);
  assert.equal(first.claims, 1);
  assert.equal(first.fetchCalls.length, 0, 'Lifecycle events must not prefetch tiles');
  const initial = await first.serve();
  assert.deepEqual(new Uint8Array(await initial.arrayBuffer()), PNG);
  assert.equal(first.fetchCalls[0].cache, 'default');
  const replacement = workerHarness({ storage, now: NOW + 1000, fetchImpl: async () => { throw new Error('Network must not be used for fresh tiles'); } });
  await replacement.lifecycle('activate');
  const [hitA, hitB] = await Promise.all([replacement.serve(), replacement.serve()]);
  assert.notEqual(hitA, hitB);
  assert.deepEqual(new Uint8Array(await hitA.arrayBuffer()), PNG);
  assert.deepEqual(new Uint8Array(await hitB.arrayBuffer()), PNG);
  assert.equal(first.fetchCalls.length, 1);
  assert.equal(replacement.fetchCalls.length, 0);
  assert.equal(await (await foreign.match('https://concerttracker.example/other')).text(), 'keep me');
  assert.ok(storage.named.has(CACHE_NAME));
});

test('freshness honors HTTP max-age priority, Date/Age, Expires, zero directives and a seven-day fallback', () => {
  const { context } = workerHarness();
  const expires = value => new Date(value).toUTCString();
  for (const scenario of [
    { headers: { 'cache-control': 'public, max-age=60' }, expected: NOW + 60_000 },
    { headers: { 'cache-control': 'max-age="60"', age: '30' }, expected: NOW + 30_000 },
    { headers: { 'cache-control': 'max-age=60', date: expires(NOW - 50_000) }, expected: NOW + 10_000 },
    { headers: { 'cache-control': 'max-age=60', age: '30', date: expires(NOW - 50_000) }, expected: NOW + 10_000 },
    { headers: { 'cache-control': 'max-age=60', expires: expires(NOW - 1000) }, expected: NOW + 60_000 },
    { headers: { 'cache-control': '', expires: expires(NOW + 120_000) }, expected: NOW + 120_000 },
    { headers: { 'cache-control': '', expires: expires(NOW - 1000) }, expected: NOW - 1000 },
    { headers: { 'cache-control': '' }, expected: NOW + WEEK },
    { headers: { 'cache-control': 'max-age=0' }, expected: NOW },
    { headers: { 'cache-control': 'public, no-cache, max-age=3600' }, expected: NOW },
    { headers: { 'cache-control': 'no-store, max-age=3600' }, expected: NOW },
  ]) {
    assert.equal(context.tileFreshUntil(tileResponse({ headers: scenario.headers }), NOW), scenario.expected, JSON.stringify(scenario.headers));
  }
});

test('expired tiles are refreshed while no-cache and no-store responses are never reused', async () => {
  let revision = 0;
  const harness = workerHarness({ fetchImpl: async () => tileResponse({ body: `revision-${++revision}`, headers: { 'cache-control': 'max-age=1' } }) });
  assert.equal(await (await harness.serve()).text(), 'revision-1');
  harness.clock.now += 1001;
  assert.equal(await (await harness.serve()).text(), 'revision-2');
  assert.equal(await (await harness.serve()).text(), 'revision-2');
  assert.equal(harness.fetchCalls.length, 2);
  for (const directive of ['max-age=0', 'no-cache', 'no-store']) {
    const uncached = workerHarness({ fetchImpl: async () => tileResponse({ headers: { 'cache-control': directive } }) });
    await uncached.serve();
    await uncached.serve();
    assert.equal(uncached.fetchCalls.length, 2, directive);
    assert.equal((await uncached.storage.open(CACHE_NAME)).entries.size, 0, directive);
  }
});

test('HTTP errors, opaque/error responses and non-PNG payloads cannot poison the tile cache', async () => {
  for (const options of [
    { status: 403 }, { status: 429 }, { status: 503 }, { status: 206 },
    { status: 0, type: 'opaque' }, { status: 0, type: 'error' },
    { headers: { 'content-type': 'text/html' } },
    { headers: { 'content-type': 'application/octet-stream' } },
  ]) {
    const harness = workerHarness({ fetchImpl: async () => tileResponse(options) });
    await harness.serve();
    await harness.serve();
    assert.equal(harness.fetchCalls.length, 2, JSON.stringify(options));
    assert.equal((await harness.storage.open(CACHE_NAME)).entries.size, 0, JSON.stringify(options));
  }
});

test('the cache accepts a 128 KiB tile and excludes larger tile bodies', async () => {
  for (const size of [128 * 1024, 128 * 1024 + 1]) {
    const harness = workerHarness({ fetchImpl: async () => tileResponse({ body: new Uint8Array(size) }) });
    const response = await harness.serve();
    assert.equal((await response.arrayBuffer()).byteLength, size, 'An uncached oversized response still reaches the map');
    const cache = await harness.storage.open(CACHE_NAME);
    assert.equal(cache.entries.size, size === 128 * 1024 ? 1 : 0);
    if (cache.entries.size) assert.equal(cache.entries.get(TILE_URL).headers.get('content-length'), String(size));
  }
});

test('concurrent viewport loads keep at most 512 cached tiles and retain the newest writes', async () => {
  const harness = workerHarness();
  const urls = Array.from({ length: 515 }, (_, x) => `https://tile.openstreetmap.org/10/${x}/0.png`);
  await Promise.all(urls.map(url => harness.serve(url)));
  const cache = await harness.storage.open(CACHE_NAME);
  assert.equal(harness.fetchCalls.length, urls.length);
  assert.equal(cache.entries.size, 512);
  assert.equal(cache.entries.has(urls[0]), false);
  assert.equal(cache.entries.has(urls.at(-1)), true);
  const replacement = workerHarness({ storage: harness.storage });
  await replacement.lifecycle('activate');
  assert.equal(cache.entries.size, 512, 'Activation must preserve the bounded cache');
});

test('simultaneous requests fetch a tile once, clone each response and release a failed in-flight request', async () => {
  const gate = deferred();
  const harness = workerHarness({ fetchImpl: () => gate.promise });
  const first = harness.serve();
  const second = harness.serve();
  gate.resolve(tileResponse({ body: 'shared tile' }));
  const [responseA, responseB] = await Promise.all([first, second]);
  assert.equal(harness.fetchCalls.length, 1);
  assert.notEqual(responseA, responseB);
  assert.equal(await responseA.text(), 'shared tile');
  assert.equal(await responseB.text(), 'shared tile');
  let attempts = 0;
  const retry = workerHarness({ fetchImpl: async () => {
    if (++attempts === 1) throw new Error('Offline');
    return tileResponse();
  } });
  await assert.rejects(retry.serve(), /Offline/);
  assert.deepEqual(new Uint8Array(await (await retry.serve()).arrayBuffer()), PNG);
  assert.equal(attempts, 2);
});

test('missing CacheStorage and open, match or put failures return the fetched tile without fetching it twice', async () => {
  for (const failure of ['unsupported', 'open', 'match', 'put']) {
    const storage = memoryStorage();
    if (failure === 'open') storage.failure = failure;
    else if (failure !== 'unsupported') (await storage.open(CACHE_NAME)).failure = failure;
    const harness = workerHarness({ storage });
    if (failure === 'unsupported') delete harness.context.caches;
    const response = await harness.serve();
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), PNG, failure);
    assert.equal(harness.fetchCalls.length, 1, failure);
  }
});

test('registration waits for controllerchange, registers once and releases listeners and its timer', async () => {
  const harness = registrationHarness();
  const first = harness.context.prepareMapTileCache();
  const second = harness.context.prepareMapTileCache();
  assert.equal(first, second);
  let ready = false;
  first.then(() => { ready = true; });
  await Promise.resolve();
  assert.equal(ready, false, 'A registered worker without a controller cannot serve the initial tiles yet');
  assert.deepEqual(harness.registerCalls, [{ url: '/map-cache-sw.js', scope: '/' }]);
  harness.claim();
  await first;
  assert.equal(ready, true);
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.timers.size, 0);
  const controlled = registrationHarness({ controller: {} });
  await controlled.context.prepareMapTileCache();
  assert.equal(controlled.timers.size, 0);
});

test('rejected registration and synchronous registration/event failures fall back without a rejected readiness promise', async () => {
  for (const options of [
    { registerImpl: () => Promise.reject(new Error('Worker blocked')) },
    { registerImpl: () => { throw new Error('Security restrictions'); } },
    { listenerFailure: true },
  ]) {
    const harness = registrationHarness(options);
    await harness.context.prepareMapTileCache();
    assert.equal(harness.listeners.size, 0);
    assert.equal(harness.timers.size, 0);
  }
});

test('unsupported or insecure contexts use normal loading and a stalled worker cannot block tiles past the timeout', async () => {
  for (const options of [{ secure: false }, { supported: false }]) {
    const harness = registrationHarness(options);
    await harness.context.prepareMapTileCache();
    assert.equal(harness.registerCalls.length, 0);
    assert.equal(harness.timers.size, 0);
  }
  const harness = registrationHarness({ registerImpl: () => new Promise(() => {}) });
  const ready = harness.context.prepareMapTileCache();
  assert.equal(harness.timers.size, 1);
  assert.equal([...harness.timers.values()][0].delay, 2000);
  harness.expire();
  await ready;
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.timers.size, 0);
});
