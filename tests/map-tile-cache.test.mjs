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
    const stored = response.clone();
    await response.arrayBuffer(); // Cache.put consumes its input body.
    this.entries.set(keyOf(request), stored);
  }
  async delete(request) {
    if (this.failure === 'delete') throw new Error('Cache deletion unavailable');
    return this.entries.delete(keyOf(request));
  }
  async keys() {
    if (this.failure === 'keys') throw new Error('Cache enumeration unavailable');
    return [...this.entries.keys()].map(url => new Request(url, { mode: 'cors' }));
  }
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
  const timers = new Map();
  const backgroundJobs = [];
  let nextTimer = 0;
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  const handlers = new Map();
  const fetchCalls = [];
  let claims = 0;
  let skips = 0;
  const context = vm.createContext({
    Date: FixedDate, URL, Request, Response, Headers, AbortController, DOMException,
    ReadableStream, Uint8Array, caches: storage,
    setTimeout(callback, delay) {
      const id = ++nextTimer;
      timers.set(id, { callback, delay, due: clock.now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    fetch: async (request, options = {}) => {
      fetchCalls.push(request);
      return fetchImpl(request, options);
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
    handlers.get('fetch')({
      request,
      respondWith(value) { response = Promise.resolve(value); },
      waitUntil(value) {
        const job = Promise.resolve(value);
        backgroundJobs.push(job);
        job.catch(() => {});
      },
    });
    return response;
  }
  return {
    context, storage, clock, timers, backgroundJobs, fetchCalls, intercept,
    constant(name) { return vm.runInContext(name, context); },
    async advance(ms) {
      await drainMicrotasks();
      clock.now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.due > clock.now || !timers.has(id)) continue;
        timers.delete(id);
        timer.callback();
      }
      await drainMicrotasks();
    },
    async settleBackground() {
      await drainMicrotasks();
      let index = 0;
      while (index < backgroundJobs.length) {
        const end = backgroundJobs.length;
        await Promise.allSettled(backgroundJobs.slice(index, end));
        index = end;
      }
    },
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

async function drainMicrotasks() {
  for (let index = 0; index < 8; index++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
  for (let index = 0; index < 8; index++) await Promise.resolve();
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
  await first.settleBackground();
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
  await harness.settleBackground();
  harness.clock.now += 1001;
  assert.equal(await (await harness.serve()).text(), 'revision-2');
  await harness.settleBackground();
  assert.equal(await (await harness.serve()).text(), 'revision-2');
  assert.equal(harness.fetchCalls.length, 2);
  for (const directive of ['max-age=0', 'no-cache', 'no-store']) {
    const uncached = workerHarness({ fetchImpl: async () => tileResponse({ headers: { 'cache-control': directive } }) });
    await uncached.serve();
    await uncached.settleBackground();
    await uncached.serve();
    await uncached.settleBackground();
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
    for (let attempt = 0; attempt < 2; attempt++) {
      if (options.status === 0) await assert.rejects(harness.serve(), /unavailable/i);
      else await harness.serve();
    }
    await harness.settleBackground();
    assert.equal(harness.fetchCalls.length, options.status === 429 ? 1 : 2, JSON.stringify(options));
    assert.equal((await harness.storage.open(CACHE_NAME)).entries.size, 0, JSON.stringify(options));
  }
});

test('the cache accepts a 128 KiB tile and excludes larger tile bodies', async () => {
  for (const size of [128 * 1024, 128 * 1024 + 1]) {
    const harness = workerHarness({ fetchImpl: async () => tileResponse({ body: new Uint8Array(size) }) });
    const response = await harness.serve();
    assert.equal((await response.arrayBuffer()).byteLength, size, 'An uncached oversized response still reaches the map');
    await harness.settleBackground();
    const cache = await harness.storage.open(CACHE_NAME);
    assert.equal(cache.entries.size, size === 128 * 1024 ? 1 : 0);
    if (cache.entries.size) assert.equal(cache.entries.get(TILE_URL).headers.get('content-length'), String(size));
  }
});

test('concurrent viewport loads keep at most 512 cached tiles and retain the newest writes', async () => {
  const harness = workerHarness();
  const urls = Array.from({ length: 515 }, (_, x) => `https://tile.openstreetmap.org/10/${x}/0.png`);
  await Promise.all(urls.map(url => harness.serve(url)));
  await harness.settleBackground();
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
  await harness.settleBackground();
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
    await harness.settleBackground();
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

function stalledTileFetch(kind, signal) {
  assert.ok(signal instanceof AbortSignal, 'The worker must pass an AbortSignal to the network boundary');
  if (kind === 'fetch') return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Offline fetch aborted', 'AbortError')), { once: true });
  });
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(PNG);
      signal.addEventListener('abort', () => controller.error(new DOMException('Offline tile body aborted', 'AbortError')), { once: true });
    },
  });
  return tileResponse({ body });
}

async function seedStaleTile(storage, headers = {}) {
  const cache = await storage.open(CACHE_NAME);
  await cache.put(TILE_URL, tileResponse({ headers: { [FRESH_UNTIL]: String(NOW - 1), ...headers } }));
  return cache;
}

test('stalled cache open, match and cached body stop waiting at the read deadline and fetch the visible tile once', { timeout: 3000 }, async () => {
  for (const operation of ['open', 'match', 'body']) {
    const storage = memoryStorage();
    const cache = await storage.open(CACHE_NAME);
    const gate = deferred();
    let cachedBodyController;
    if (operation === 'open') storage.open = () => gate.promise;
    else if (operation === 'match') cache.match = () => gate.promise;
    else cache.match = async () => tileResponse({
      headers: { [FRESH_UNTIL]: String(NOW + WEEK) },
      body: new ReadableStream({ start(controller) { cachedBodyController = controller; controller.enqueue(PNG); } }),
    });
    const harness = workerHarness({ storage });
    assert.equal(harness.constant('CACHE_READ_TIMEOUT_MS'), 300);
    const pending = harness.serve();
    await harness.advance(299);
    assert.equal(harness.fetchCalls.length, 0, `${operation}: cache reads may finish within their deadline`);
    await harness.advance(1);
    assert.deepEqual(new Uint8Array(await (await pending).arrayBuffer()), PNG, `${operation}: a stalled cache must not blank the map`);
    assert.equal(harness.fetchCalls.length, 1, operation);
    if (operation === 'body') cachedBodyController.close();
    else gate.resolve(operation === 'open' ? cache : tileResponse({ headers: { [FRESH_UNTIL]: String(NOW + WEEK) } }));
    await harness.settleBackground();
    assert.equal(harness.fetchCalls.length, 1, `${operation}: a late cache result must not trigger another network load`);
    assert.equal(harness.timers.size, 0, operation);
  }
});

test('network and PNG-body deadlines abort shared requests and allow a later independent retry', { timeout: 3000 }, async () => {
  for (const kind of ['fetch', 'body']) {
    let stall = true;
    let signal;
    const harness = workerHarness({ fetchImpl: (request, options) => {
      signal = options.signal || request.signal;
      return stall ? stalledTileFetch(kind, signal) : tileResponse();
    } });
    assert.equal(harness.constant('TILE_FETCH_TIMEOUT_MS'), 8000);
    const first = harness.serve();
    const second = harness.serve();
    const rejected = Promise.all([
      assert.rejects(first, /timed?\s*out|abort|timeout/i),
      assert.rejects(second, /timed?\s*out|abort|timeout/i),
    ]);
    await harness.advance(7999);
    assert.equal(harness.fetchCalls.length, 1, `${kind}: simultaneous requests share one network load`);
    assert.equal(signal.aborted, false, kind);
    await harness.advance(1);
    await rejected;
    assert.equal(signal.aborted, true, `${kind}: the worker must abort the underlying operation`);
    stall = false;
    const [retryA, retryB] = await Promise.all([harness.serve(), harness.serve()]);
    assert.notEqual(retryA, retryB);
    assert.deepEqual(new Uint8Array(await retryA.arrayBuffer()), PNG);
    assert.deepEqual(new Uint8Array(await retryB.arrayBuffer()), PNG);
    assert.equal(harness.fetchCalls.length, 2, `${kind}: a timed-out in-flight entry must be released`);
    await harness.settleBackground();
    assert.equal(harness.timers.size, 0, kind);
  }
});

test('background put, keys and prune stalls do not block responses or permanently wedge later cache writes', { timeout: 5000 }, async () => {
  for (const operation of ['put', 'keys', 'delete']) {
    const storage = memoryStorage();
    const cache = await storage.open(CACHE_NAME);
    if (operation === 'delete') {
      for (let x = 0; x < 512; x++) cache.entries.set(`https://tile.openstreetmap.org/10/${x}/0.png`, tileResponse());
    }
    const gate = deferred();
    const original = cache[operation].bind(cache);
    let blocked = false;
    let delayedOperation;
    cache[operation] = (...args) => {
      if (!blocked) {
        blocked = true;
        delayedOperation = gate.promise.then(() => original(...args));
        return delayedOperation;
      }
      return original(...args);
    };
    const harness = workerHarness({ storage });
    assert.equal(harness.constant('CACHE_WRITE_TIMEOUT_MS'), 1500);
    const first = await harness.serve();
    assert.deepEqual(new Uint8Array(await first.arrayBuffer()), PNG, `${operation}: respondWith must not await storage`);
    await drainMicrotasks();
    assert.equal(blocked, true, operation);
    assert.ok(harness.backgroundJobs.length > 0, `${operation}: cache work must be held by fetch-event.waitUntil`);
    const secondUrl = 'https://tile.openstreetmap.org/3/5/2.png';
    const second = await harness.serve(secondUrl);
    assert.deepEqual(new Uint8Array(await second.arrayBuffer()), PNG, `${operation}: another visible tile must reach the map while storage is stalled`);
    assert.equal(harness.fetchCalls.length, 2, operation);
    await harness.advance(1500);
    await harness.settleBackground();
    // Jobs already queued behind the blocked write may exhaust their own
    // deadline. A newly requested tile must still get a functioning queue.
    const thirdUrl = 'https://tile.openstreetmap.org/3/6/2.png';
    const third = await harness.serve(thirdUrl);
    assert.deepEqual(new Uint8Array(await third.arrayBuffer()), PNG);
    await harness.settleBackground();
    assert.ok(cache.entries.has(thirdUrl), `${operation}: the write queue must recover for later tiles`);
    assert.equal(harness.fetchCalls.length, 3, operation);
    assert.ok(cache.entries.size <= 512, `${operation}: later writes must restore the cache cap`);
    gate.resolve();
    await delayedOperation;
    await harness.settleBackground();
    assert.ok(cache.entries.has(thirdUrl), `${operation}: completing an expired cache operation must not erase the newer tile`);
    assert.equal(harness.timers.size, 0, operation);
  }
});

test('expired PNG tiles survive transient network, body-timeout, 408 and 5xx failures without extending freshness', { timeout: 4000 }, async () => {
  for (const scenario of [{ kind: 'offline' }, { kind: 'body' }, { status: 408 }, { status: 500 }, { status: 503 }]) {
    const storage = memoryStorage();
    const cache = await seedStaleTile(storage);
    const harness = workerHarness({ storage, fetchImpl: (request, options) => {
      if (scenario.kind === 'offline') throw new TypeError('Offline');
      if (scenario.kind === 'body') return stalledTileFetch('body', options.signal || request.signal);
      return tileResponse({ status: scenario.status });
    } });
    const pending = harness.serve();
    if (scenario.kind === 'body') await harness.advance(8000);
    const response = await pending;
    assert.equal(response.status, 200, JSON.stringify(scenario));
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), PNG, JSON.stringify(scenario));
    assert.equal(response.headers.get(FRESH_UNTIL), String(NOW - 1), 'Fallback must not pretend the old tile became fresh');
    await harness.settleBackground();
    assert.equal(cache.entries.get(TILE_URL).headers.get(FRESH_UNTIL), String(NOW - 1));
    assert.equal(harness.fetchCalls.length, 1, 'Fallback must not prefetch or automatically retry the unavailable provider');
  }
});

test('403, 404 and 429 do not serve stale tiles and revalidation-only or invalid cached responses cannot fall back', { timeout: 3000 }, async () => {
  for (const status of [403, 404, 429]) {
    const storage = memoryStorage();
    await seedStaleTile(storage);
    const harness = workerHarness({ storage, fetchImpl: async () => tileResponse({ status }) });
    const response = await harness.serve();
    assert.equal(response.status, status, 'An authoritative or rate-limit error must not be hidden by stale data');
    await harness.settleBackground();
  }
  for (const headers of [
    { 'cache-control': 'no-cache' },
    { 'cache-control': 'max-age=60, must-revalidate' },
    { 'cache-control': 'max-age=60, proxy-revalidate' },
    { 'content-type': 'text/html' },
  ]) {
    const storage = memoryStorage();
    await seedStaleTile(storage, headers);
    const harness = workerHarness({ storage, fetchImpl: async () => { throw new TypeError('Offline'); } });
    await assert.rejects(harness.serve(), /Offline|unavailable/i, JSON.stringify(headers));
    assert.equal(harness.fetchCalls.length, 1);
  }
});

test('a failed replacement put preserves the old tile for a later offline request', { timeout: 3000 }, async () => {
  const storage = memoryStorage();
  const cache = await seedStaleTile(storage);
  cache.failure = 'put';
  let offline = false;
  const newer = new Uint8Array([...PNG, 42]);
  const harness = workerHarness({ storage, fetchImpl: async () => {
    if (offline) throw new TypeError('Offline');
    return tileResponse({ body: newer });
  } });
  assert.deepEqual(new Uint8Array(await (await harness.serve()).arrayBuffer()), newer, 'A quota failure must not block the newly fetched tile');
  await harness.settleBackground();
  assert.ok(cache.entries.has(TILE_URL), 'Replacing a tile must not delete the old entry before a successful put');
  assert.deepEqual(new Uint8Array(await (await cache.match(TILE_URL)).arrayBuffer()), PNG);
  assert.equal(cache.entries.get(TILE_URL).headers.get(FRESH_UNTIL), String(NOW - 1));
  offline = true;
  assert.deepEqual(new Uint8Array(await (await harness.serve()).arrayBuffer()), PNG, 'The previous tile remains useful offline after a failed replacement');
  assert.equal(harness.fetchCalls.length, 2);
});

test('429 cooldown honors Retry-After without stale fallback or automatic network retries', { timeout: 4000 }, async () => {
  for (const scenario of [
    { retryAfter: '2', deadline: 2000 },
    { retryAfter: new Date(NOW + 3000).toUTCString(), deadline: 3000 },
    { retryAfter: 'invalid', deadline: 60_000 },
  ]) {
    const storage = memoryStorage();
    await seedStaleTile(storage);
    let requests = 0;
    const harness = workerHarness({ storage, fetchImpl: async () => ++requests === 1
      ? tileResponse({ status: 429, headers: { 'retry-after': scenario.retryAfter } })
      : tileResponse() });
    const first = await harness.serve();
    const second = await harness.serve();
    assert.equal(first.status, 429);
    assert.equal(second.status, 429);
    assert.notEqual(first, second, 'Each cooldown caller must receive its own readable response');
    await first.arrayBuffer();
    await second.arrayBuffer();
    assert.equal(harness.fetchCalls.length, 1);
    await harness.advance(scenario.deadline - 1);
    assert.equal((await harness.serve()).status, 429);
    assert.equal(harness.fetchCalls.length, 1, 'Panning or retrying inside Retry-After must not hit the provider again');
    await harness.advance(1);
    assert.equal(harness.fetchCalls.length, 1, 'Cooldown expiry alone must not prefetch anything');
    assert.equal((await harness.serve()).status, 200);
    assert.equal(harness.fetchCalls.length, 2, 'A visible-tile request after the deadline may retry');
    await harness.settleBackground();
  }
});

test('registration timeout remains settled after a late controller change and cannot duplicate layer readiness', async () => {
  const registration = deferred();
  const harness = registrationHarness({ registerImpl: () => registration.promise });
  const ready = harness.context.prepareMapTileCache();
  let initializations = 0;
  ready.then(() => { initializations++; });
  harness.expire();
  await ready;
  assert.equal(initializations, 1);
  harness.claim();
  registration.resolve({});
  await drainMicrotasks();
  assert.equal(harness.context.prepareMapTileCache(), ready);
  assert.equal(initializations, 1, 'Late worker readiness must not repeat map-layer initialization');
  assert.equal(harness.registerCalls.length, 1);
  assert.equal(harness.listeners.size, 0);
  assert.equal(harness.timers.size, 0);
});

test('canceling one tile subscriber preserves another subscriber and the original request settings', { timeout: 3000 }, async () => {
  const gate = deferred();
  let sharedSignal;
  const harness = workerHarness({ fetchImpl: (request, options) => {
    sharedSignal = options.signal || request.signal;
    return new Promise((resolve, reject) => {
      const abort = () => reject(new DOMException('Shared tile fetch aborted', 'AbortError'));
      sharedSignal.addEventListener('abort', abort, { once: true });
      gate.promise.then(value => { sharedSignal.removeEventListener('abort', abort); resolve(value); }, reject);
    });
  } });
  const firstController = new AbortController();
  const secondController = new AbortController();
  const firstRequest = new Request(TILE_URL, {
    mode: 'cors', signal: firstController.signal, cache: 'default', credentials: 'omit',
    headers: { accept: 'image/png' }, referrer: 'https://concerttracker.example/map',
    referrerPolicy: 'strict-origin-when-cross-origin',
  });
  const first = harness.intercept(firstRequest);
  const second = harness.intercept(new Request(TILE_URL, { mode: 'cors', signal: secondController.signal }));
  const secondOutcome = second.then(response => ({ response }), error => ({ error }));
  const firstRejected = assert.rejects(first, { name: 'AbortError' });
  await drainMicrotasks();
  assert.equal(harness.fetchCalls.length, 1);
  const networkRequest = harness.fetchCalls[0];
  for (const property of ['mode', 'cache', 'credentials', 'referrer', 'referrerPolicy']) {
    assert.equal(networkRequest[property], firstRequest[property], `Cloning a shared request must preserve ${property}`);
  }
  assert.equal(networkRequest.headers.get('accept'), 'image/png');
  firstController.abort();
  await firstRejected;
  assert.equal(sharedSignal.aborted, false, 'Canceling one caller must leave the shared network load alive for the other caller');
  assert.equal(secondController.signal.aborted, false);
  gate.resolve(tileResponse());
  const outcome = await secondOutcome;
  assert.equal(outcome.error, undefined, 'A non-canceled subscriber must not inherit the first caller cancellation');
  assert.deepEqual(new Uint8Array(await outcome.response.arrayBuffer()), PNG);
  assert.equal(harness.fetchCalls.length, 1);
  await harness.settleBackground();
  assert.equal(harness.timers.size, 0);
});

test('canceling every tile subscriber aborts the shared load and releases the URL for a new request', { timeout: 3000 }, async () => {
  let attempts = 0;
  let sharedSignal;
  const harness = workerHarness({ fetchImpl: (request, options) => {
    if (++attempts > 1) return tileResponse();
    sharedSignal = options.signal || request.signal;
    return new Promise((resolve, reject) => {
      sharedSignal.addEventListener('abort', () => reject(new DOMException('No remaining tile subscribers', 'AbortError')), { once: true });
    });
  } });
  const firstController = new AbortController();
  const secondController = new AbortController();
  const first = harness.intercept(new Request(TILE_URL, { mode: 'cors', signal: firstController.signal }));
  const second = harness.intercept(new Request(TILE_URL, { mode: 'cors', signal: secondController.signal }));
  const firstRejected = assert.rejects(first, { name: 'AbortError' });
  const secondRejected = assert.rejects(second, { name: 'AbortError' });
  await drainMicrotasks();
  assert.equal(harness.fetchCalls.length, 1);
  firstController.abort();
  await firstRejected;
  assert.equal(sharedSignal.aborted, false, 'The remaining caller still owns the shared request');
  secondController.abort();
  await secondRejected;
  await drainMicrotasks();
  assert.equal(sharedSignal.aborted, true, 'Canceling the last caller must abort network and body work');
  const retry = await harness.serve();
  assert.deepEqual(new Uint8Array(await retry.arrayBuffer()), PNG);
  assert.equal(harness.fetchCalls.length, 2, 'A request after cancel-all must not reuse the canceled in-flight entry');
  await harness.settleBackground();
  assert.equal(harness.timers.size, 0);
});

test('a late native put is reconciled after timeout so the persistent tile cache returns to its cap', { timeout: 3000 }, async () => {
  const storage = memoryStorage();
  const cache = await storage.open(CACHE_NAME);
  for (let x = 0; x < 512; x++) cache.entries.set(`https://tile.openstreetmap.org/10/${x}/0.png`, tileResponse());
  const gate = deferred();
  const originalPut = cache.put.bind(cache);
  let delayedPut;
  cache.put = (...args) => {
    if (!delayedPut) {
      delayedPut = gate.promise.then(() => originalPut(...args));
      return delayedPut;
    }
    return originalPut(...args);
  };
  const harness = workerHarness({ storage });
  await harness.serve();
  await drainMicrotasks();
  assert.ok(delayedPut);
  await harness.advance(1500);
  await harness.settleBackground();
  const newerUrl = 'https://tile.openstreetmap.org/3/6/2.png';
  await harness.serve(newerUrl);
  await harness.settleBackground();
  assert.equal(cache.entries.size, 512);
  assert.ok(cache.entries.has(newerUrl));
  gate.resolve();
  await delayedPut;
  await harness.settleBackground();
  assert.equal(cache.entries.size, 512, 'A timed-out native Cache.put can still commit; its late commit must trigger bounded reconciliation');
  assert.ok(cache.entries.has(newerUrl), 'Reconciling the late commit must preserve the newer requested tile');
  assert.equal(harness.fetchCalls.length, 2, 'Cache reconciliation must not prefetch or retry the provider');
  assert.equal(harness.timers.size, 0);
});

test('a timed-out native put cannot leave an older body over a newer response for the same tile', { timeout: 3000 }, async () => {
  const storage = memoryStorage();
  const cache = await seedStaleTile(storage);
  const gate = deferred();
  const originalPut = cache.put.bind(cache);
  let delayedPut;
  cache.put = (...args) => {
    if (!delayedPut) {
      delayedPut = gate.promise.then(() => originalPut(...args));
      return delayedPut;
    }
    return originalPut(...args);
  };
  let revision = 0;
  const harness = workerHarness({ storage, fetchImpl: async () => tileResponse({ body: new Uint8Array([...PNG, ++revision]) }) });
  await harness.serve();
  await drainMicrotasks();
  assert.ok(delayedPut);
  await harness.advance(1500);
  await harness.settleBackground();
  const newer = new Uint8Array([...PNG, 2]);
  assert.deepEqual(new Uint8Array(await (await harness.serve()).arrayBuffer()), newer);
  await harness.settleBackground();
  const newest = await cache.match(TILE_URL);
  const newestFreshUntil = newest.headers.get(FRESH_UNTIL);
  assert.deepEqual(new Uint8Array(await newest.arrayBuffer()), newer);
  gate.resolve();
  await delayedPut;
  await harness.settleBackground();
  const repaired = await cache.match(TILE_URL);
  assert.deepEqual(new Uint8Array(await repaired.arrayBuffer()), newer, 'A late write of revision 1 must not leave it cached over revision 2');
  assert.equal(repaired.headers.get(FRESH_UNTIL), newestFreshUntil, 'Repair must preserve the newer response freshness rather than the expired task metadata');
  assert.equal(harness.fetchCalls.length, 2);
  assert.equal(harness.timers.size, 0);
});

test('a foreground keys result arriving after its deadline repairs committed overflow without another provider request', { timeout: 3000 }, async () => {
  const storage = memoryStorage();
  const cache = await storage.open(CACHE_NAME);
  for (let x = 0; x < 512; x++) cache.entries.set(`https://tile.openstreetmap.org/10/${x}/0.png`, tileResponse());
  const gate = deferred();
  const originalKeys = cache.keys.bind(cache);
  let delayedKeys;
  let keysCalls = 0;
  cache.keys = () => {
    keysCalls++;
    if (!delayedKeys) {
      delayedKeys = gate.promise.then(() => originalKeys());
      return delayedKeys;
    }
    return originalKeys();
  };
  const harness = workerHarness({ storage });
  assert.deepEqual(new Uint8Array(await (await harness.serve()).arrayBuffer()), PNG);
  await drainMicrotasks();
  assert.ok(delayedKeys);
  assert.equal(cache.entries.size, 513, 'The new PNG was committed before enumeration stalled');
  await harness.advance(1500);
  await harness.settleBackground();
  gate.resolve();
  await delayedKeys;
  await harness.settleBackground();
  assert.equal(cache.entries.size, 512, 'A late foreground keys result must repair overflow even when no later tile is requested');
  assert.ok(cache.entries.has(TILE_URL), 'Cap-only repair must retain the successfully requested tile');
  assert.equal(harness.fetchCalls.length, 1);
  const settledKeysCalls = keysCalls;
  await harness.advance(3000);
  await harness.settleBackground();
  assert.equal(keysCalls, settledKeysCalls, 'Successful cap repair must not schedule recurring enumeration');
  assert.equal(harness.timers.size, 0);
});

test('a foreground prune deletion completing late repairs every remaining excess entry without a future tile request', { timeout: 3000 }, async () => {
  const storage = memoryStorage();
  const cache = await storage.open(CACHE_NAME);
  // Recover an already oversized persistent cache, so finishing just one
  // pending deletion still leaves multiple entries to prune.
  for (let x = 0; x < 514; x++) cache.entries.set(`https://tile.openstreetmap.org/10/${x}/0.png`, tileResponse());
  const gate = deferred();
  const originalDelete = cache.delete.bind(cache);
  let delayedDelete;
  let deleteCalls = 0;
  cache.delete = (...args) => {
    deleteCalls++;
    if (!delayedDelete) {
      delayedDelete = gate.promise.then(() => originalDelete(...args));
      return delayedDelete;
    }
    return originalDelete(...args);
  };
  const harness = workerHarness({ storage });
  assert.deepEqual(new Uint8Array(await (await harness.serve()).arrayBuffer()), PNG);
  await drainMicrotasks();
  assert.ok(delayedDelete);
  assert.equal(cache.entries.size, 515);
  await harness.advance(1500);
  await harness.settleBackground();
  gate.resolve();
  await delayedDelete;
  await harness.settleBackground();
  assert.equal(cache.entries.size, 512, 'Completing the first late deletion must trigger cleanup of the remaining overflow');
  assert.ok(cache.entries.has(TILE_URL));
  assert.equal(harness.fetchCalls.length, 1, 'Cache-only recovery must not fetch a replacement tile');
  const settledDeleteCalls = deleteCalls;
  await harness.advance(3000);
  await harness.settleBackground();
  assert.equal(deleteCalls, settledDeleteCalls);
  assert.equal(harness.timers.size, 0);
});

test('a cap-only repair whose own keys or delete times out does not retry itself after late completion', { timeout: 4000 }, async () => {
  for (const operation of ['keys', 'delete']) {
    const storage = memoryStorage();
    const cache = await storage.open(CACHE_NAME);
    for (let x = 0; x < 514; x++) cache.entries.set(`https://tile.openstreetmap.org/10/${x}/0.png`, tileResponse());
    const foregroundGate = deferred();
    const repairGate = deferred();
    const originalKeys = cache.keys.bind(cache);
    const originalDelete = cache.delete.bind(cache);
    let delayedForegroundKeys;
    let delayedRepairOperation;
    let keysCalls = 0;
    let deleteCalls = 0;
    cache.keys = () => {
      keysCalls++;
      if (keysCalls > 4) throw new Error('Unexpected recurring cap repair');
      if (keysCalls === 1) {
        delayedForegroundKeys = foregroundGate.promise.then(() => originalKeys());
        return delayedForegroundKeys;
      }
      if (operation === 'keys' && keysCalls === 2) {
        delayedRepairOperation = repairGate.promise.then(() => originalKeys());
        return delayedRepairOperation;
      }
      return originalKeys();
    };
    cache.delete = (...args) => {
      deleteCalls++;
      if (operation === 'delete' && deleteCalls === 1) {
        delayedRepairOperation = repairGate.promise.then(() => originalDelete(...args));
        return delayedRepairOperation;
      }
      return originalDelete(...args);
    };
    const harness = workerHarness({ storage });
    await harness.serve();
    await drainMicrotasks();
    await harness.advance(1500);
    await harness.settleBackground();
    foregroundGate.resolve();
    await delayedForegroundKeys;
    await drainMicrotasks();
    assert.ok(delayedRepairOperation, `${operation}: the initial late result schedules one cap-only recovery`);
    await harness.advance(1500);
    await harness.settleBackground();
    const settledJobs = harness.backgroundJobs.length;
    repairGate.resolve();
    await delayedRepairOperation;
    await harness.settleBackground();
    assert.equal(keysCalls, 2, `${operation}: a failed recovery must not recursively enqueue another recovery`);
    assert.equal(deleteCalls, operation === 'delete' ? 1 : 0);
    assert.equal(harness.backgroundJobs.length, settledJobs, 'Late repair completion must not create another waitUntil task');
    await harness.advance(3000);
    await harness.settleBackground();
    assert.equal(keysCalls, 2);
    assert.equal(harness.fetchCalls.length, 1, 'A failed cache-only repair must never retry the provider');
    assert.equal(harness.timers.size, 0);
  }
});
