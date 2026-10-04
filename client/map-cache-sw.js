'use strict';

// The cache schema stays independent of app releases. Cache only tiles requested
// by the visible Leaflet map; never prefetch regions or intercept app/API data.
const TILE_CACHE = 'concerttracker-osm-tiles-v1';
const MAX_TILES = 512;
const MAX_TILE_BYTES = 128 * 1024; // At most 64 MiB of tile bodies.
const FALLBACK_TTL = 7 * 24 * 60 * 60 * 1000;
const FRESH_UNTIL = 'x-ct-tile-fresh-until';
const CACHE_READ_TIMEOUT_MS = 300;
const TILE_FETCH_TIMEOUT_MS = 8000;
const CACHE_WRITE_TIMEOUT_MS = 1500;
const tileRequests = new Map();
const tileCooldowns = new Map();
const tileLatestPuts = new Map();
const tileReconcileRequests = new Map();
let tilePutVersion = 0;
let tileReconcileScheduled = false;
let tileWrites = Promise.resolve();

function isMapTileRequest(request) {
  if (request.method !== 'GET' || request.mode !== 'cors') return false;
  const url = new URL(request.url);
  if (url.origin !== 'https://tile.openstreetmap.org' || url.search) return false;
  const match = /^\/(\d{1,2})\/(\d+)\/(\d+)\.png$/.exec(url.pathname);
  if (!match) return false;
  const [z, x, y] = match.slice(1).map(Number);
  return z <= 19 && x < 2 ** z && y < 2 ** z;
}

function tileFreshUntil(response, now) {
  const directives = response.headers.get('cache-control') || '';
  if (/(?:^|,)\s*(?:no-store|no-cache)\b/i.test(directives)) return now;
  const maxAge = /(?:^|,)\s*max-age\s*=\s*"?(\d+)/i.exec(directives);
  const expires = Date.parse(response.headers.get('expires') || '');
  const serverDate = Date.parse(response.headers.get('date') || '');
  const age = Math.max(0, Number(response.headers.get('age')) || 0) * 1000;
  const apparentAge = Number.isFinite(serverDate) ? Math.max(0, now - serverDate) : 0;
  return maxAge
    ? now + Number(maxAge[1]) * 1000 - Math.max(age, apparentAge)
    : Number.isFinite(expires) ? expires : now + FALLBACK_TTL;
}

function isPngTile(response) {
  return !!response && response.status === 200 && response.type !== 'opaque' && response.type !== 'error'
    && /^image\/png(?:;|$)/i.test(response.headers.get('content-type') || '');
}

function tileAbortError() {
  const error = new Error('Map tile request aborted');
  error.name = 'AbortError';
  return error;
}

function withTileDeadline(work, timeoutMs, onTimeout) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try { onTimeout?.(); } catch (_) {}
      const error = new Error('Map tile operation timed out');
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([Promise.resolve().then(work), timeout]).finally(() => clearTimeout(timer));
}

function pngTileResponse(bytes, response) {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.set('content-length', String(bytes.byteLength));
  return new Response(bytes, { status: 200, headers });
}

function queueTileWrite(work) {
  let active = true;
  // Cache operations cannot be canceled. A deadline releases the queue, and
  // an expired task must not start more writes or pruning when it resumes.
  const write = tileWrites.then(() => active ? work(() => active) : undefined);
  const bounded = withTileDeadline(() => write, CACHE_WRITE_TIMEOUT_MS, () => { active = false; })
    .catch(() => {});
  tileWrites = bounded;
  return bounded;
}

async function putTileVersioned(cache, request, stored, version, isActive, event) {
  const retained = stored.clone();
  // Never delete before this atomic replacement: quota errors retain old data.
  await cache.put(request, stored);
  let latest = tileLatestPuts.get(request.url);
  if (!latest || latest.version < version) {
    latest = { version, response: retained };
    tileLatestPuts.delete(request.url);
    tileLatestPuts.set(request.url, latest);
    while (tileLatestPuts.size > MAX_TILES) tileLatestPuts.delete(tileLatestPuts.keys().next().value);
  }
  if (!isActive() || latest.version > version) {
    queueTileReconcile(cache, request, version, event);
  }
}

async function deleteTileVersioned(cache, request, isActive, event) {
  const url = typeof request === 'string' ? request : request.url;
  const prior = tileLatestPuts.get(url);
  await cache.delete(request);
  const latest = tileLatestPuts.get(url);
  if (latest && latest !== prior) {
    // A deletion that settled late must not erase a newer confirmed image.
    queueTileReconcile(cache, new Request(url, { mode: 'cors' }), prior?.version || 0, event);
  } else if (latest) tileLatestPuts.delete(url);
}

function queueTileReconcile(cache, request, committedVersion, event, capOnly = false) {
  const previous = tileReconcileRequests.get(request.url);
  tileReconcileRequests.set(request.url, { cache, request, event,
    capOnly: capOnly && (!previous || previous.capOnly),
    committedVersion: previous ? Math.min(previous.committedVersion, committedVersion) : committedVersion });
  while (tileReconcileRequests.size > MAX_TILES) tileReconcileRequests.delete(tileReconcileRequests.keys().next().value);
  startTileReconcile();
}

function startTileReconcile() {
  if (tileReconcileScheduled || !tileReconcileRequests.size) return;
  tileReconcileScheduled = true;
  const jobs = [...tileReconcileRequests.values()];
  tileReconcileRequests.clear();
  const repair = queueTileWrite(async isActive => {
    for (const job of jobs) {
      if (!isActive()) return;
      const latest = tileLatestPuts.get(job.request.url);
      if (!job.capOnly && latest && latest.version > job.committedVersion) {
        await putTileVersioned(job.cache, job.request, latest.response.clone(), latest.version, isActive, job.event);
      }
    }
    if (!isActive()) return;
    const { cache, event } = jobs[jobs.length - 1];
    const keys = await cache.keys();
    if (!isActive()) return;
    let excess = Math.max(0, keys.length - MAX_TILES);
    const lateUrls = new Set(jobs.filter(job => !job.capOnly &&
      (tileLatestPuts.get(job.request.url)?.version || 0) <= job.committedVersion).map(job => job.request.url));
    // Prefer discarding the late insertion over evicting a newer healthy tile.
    const ordered = [...keys.filter(key => lateUrls.has(key.url)), ...keys.filter(key => !lateUrls.has(key.url))];
    for (const key of ordered) {
      if (!isActive() || !excess) return;
      await deleteTileVersioned(cache, key, isActive, event);
      excess--;
    }
  });
  for (const job of jobs) {
    try { job.event?.waitUntil(repair); } catch (_) {}
  }
  repair.finally(() => {
    tileReconcileScheduled = false;
    // Only newly settled operations create another pass; failed storage never retries
    // itself. Both the coalesced request set and retained PNG set are bounded.
    startTileReconcile();
  });
}

function storeMapTile(cache, request, response, event) {
  if (!cache || !isPngTile(response)) return Promise.resolve();
  const freshUntil = tileFreshUntil(response, Date.now());
  if (freshUntil <= Date.now()) return Promise.resolve();
  const version = ++tilePutVersion;
  return queueTileWrite(async isActive => {
    const bytes = await response.arrayBuffer();
    if (!isActive() || bytes.byteLength > MAX_TILE_BYTES) return;
    const stored = pngTileResponse(bytes, response);
    stored.headers.set(FRESH_UNTIL, String(freshUntil));
    await putTileVersioned(cache, request, stored, version, isActive, event);
    if (!isActive()) return;
    const keys = await cache.keys();
    if (!isActive()) {
      if (keys.length > MAX_TILES) queueTileReconcile(cache, request, version, event, true);
      return;
    }
    for (const key of keys.slice(0, Math.max(0, keys.length - MAX_TILES))) {
      if (!isActive()) return;
      await deleteTileVersioned(cache, key, isActive, event);
      if (!isActive()) {
        // A late foreground deletion may leave more than one excess entry.
        // Repair once in a new bounded pass; repair timeouts do not self-retry.
        queueTileReconcile(cache, request, version, event, true);
        return;
      }
    }
  });
}

async function readMapTile(request) {
  return withTileDeadline(async () => {
    const cache = await caches.open(TILE_CACHE);
    let cached = await cache.match(request);
    const directives = cached?.headers.get('cache-control') || '';
    const freshUntil = Number(cached?.headers.get(FRESH_UNTIL));
    if (!isPngTile(cached) || !Number.isFinite(freshUntil) || freshUntil <= 0
        || /(?:^|,)\s*(?:no-store|no-cache)\b/i.test(directives)) return { cache, cached: null };
    const bytes = await cached.arrayBuffer();
    cached = bytes.byteLength <= MAX_TILE_BYTES ? pngTileResponse(bytes, cached) : null;
    return { cache, cached };
  }, CACHE_READ_TIMEOUT_MS);
}

function staleTileAllowed(cached) {
  return isPngTile(cached)
    && !/(?:^|,)\s*(?:no-store|no-cache|must-revalidate|proxy-revalidate)\b/i
      .test(cached.headers.get('cache-control') || '');
}

function tileCooldownResponse(request) {
  const now = Date.now();
  for (const [url, until] of tileCooldowns) if (until <= now) tileCooldowns.delete(url);
  const until = tileCooldowns.get(request.url);
  if (!until) return null;
  return new Response(null, { status: 429, headers: {
    'Cache-Control': 'no-store', 'Retry-After': String(Math.max(1, Math.ceil((until - now) / 1000))),
  } });
}

function rememberTileCooldown(request, response) {
  const now = Date.now();
  const retryAfter = (response.headers.get('retry-after') || '').trim();
  const delay = /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - now;
  const until = now + (Number.isFinite(delay) ? Math.max(0, delay) : 60000);
  tileCooldowns.delete(request.url);
  tileCooldowns.set(request.url, until);
  while (tileCooldowns.size > MAX_TILES) tileCooldowns.delete(tileCooldowns.keys().next().value);
}

async function fetchMapTile(request) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  request.signal?.addEventListener('abort', onAbort, { once: true });
  if (request.signal?.aborted) controller.abort();
  try {
    // Preserve default HTTP caching and the original CORS/referrer settings.
    return await withTileDeadline(async () => {
      const response = await fetch(request, { signal: controller.signal });
      if (!isPngTile(response)) {
        if (response.status < 200 || response.type === 'opaque' || response.type === 'error') {
          throw new Error('Map tile network response is unavailable');
        }
        const failed = new Response(null, { status: response.status, headers: response.headers });
        controller.abort();
        return failed;
      }
      const bytes = await response.arrayBuffer();
      return pngTileResponse(bytes, response);
    }, TILE_FETCH_TIMEOUT_MS, onAbort);
  } finally {
    request.signal?.removeEventListener('abort', onAbort);
  }
}

async function loadMapTile(request, event) {
  if (request.signal?.aborted) throw tileAbortError();
  let cache;
  let cached;
  try {
    ({ cache, cached } = await readMapTile(request));
    if (cached && Number(cached.headers.get(FRESH_UNTIL)) > Date.now()) return cached;
  } catch (_) { /* Missing, failed or stalled storage must not delay the network. */ }
  if (request.signal?.aborted) throw tileAbortError();
  const cooldown = tileCooldownResponse(request);
  if (cooldown) return cooldown;
  let response;
  try {
    response = await fetchMapTile(request);
  } catch (error) {
    if (!request.signal?.aborted && staleTileAllowed(cached)) return cached;
    throw error;
  }
  if (response.status === 429) rememberTileCooldown(request, response);
  if ((response.status === 408 || response.status >= 500) && staleTileAllowed(cached)) return cached;
  // Delivery never waits for CacheStorage writes. waitUntil keeps the bounded
  // background task alive without turning storage failures into blank tiles.
  if (cache && isPngTile(response)) {
    const write = storeMapTile(cache, request, response.clone(), event);
    try { event?.waitUntil(write); } catch (_) {}
  }
  return response;
}

function subscribeMapTile(entry, request) {
  return new Promise((resolve, reject) => {
    const subscriber = { finished: false };
    const finish = (error, response) => {
      if (subscriber.finished) return;
      subscriber.finished = true;
      request.signal?.removeEventListener('abort', onAbort);
      entry.subscribers.delete(subscriber);
      if (!entry.settled && !entry.subscribers.size) {
        entry.controller.abort();
        if (tileRequests.get(request.url) === entry) tileRequests.delete(request.url);
      }
      if (error) reject(error);
      else {
        try { resolve(response.clone()); } catch (cloneError) { reject(cloneError); }
      }
    };
    const onAbort = () => finish(tileAbortError());
    // Register every consumer before the shared operation's first microtask.
    entry.subscribers.add(subscriber);
    request.signal?.addEventListener('abort', onAbort, { once: true });
    entry.pending.then(response => finish(null, response), error => finish(error));
    if (request.signal?.aborted) onAbort();
  });
}

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (!isMapTileRequest(event.request)) return;
  const key = event.request.url;
  let entry = tileRequests.get(key);
  if (!entry) {
    const controller = new AbortController();
    const sharedRequest = new Request(event.request, {
      signal: controller.signal,
      mode: event.request.mode,
      headers: event.request.headers,
      credentials: event.request.credentials,
      cache: event.request.cache,
      redirect: event.request.redirect,
      referrer: event.request.referrer,
      referrerPolicy: event.request.referrerPolicy,
      integrity: event.request.integrity,
    });
    entry = { controller, subscribers: new Set(), pending: null, settled: false };
    entry.pending = Promise.resolve().then(() => loadMapTile(sharedRequest, event));
    tileRequests.set(key, entry);
    const finish = () => {
      entry.settled = true;
      if (tileRequests.get(key) === entry) tileRequests.delete(key);
    };
    entry.pending.then(finish, finish);
  }
  event.respondWith(subscribeMapTile(entry, event.request));
  // Even a canceled first consumer keeps the shared task alive for the other
  // consumers and allows its eventual bounded background write to register.
  try { event.waitUntil(entry.pending.catch(() => {})); } catch (_) {}
});
