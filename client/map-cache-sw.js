'use strict';

// The cache schema stays independent of app releases. Cache only tiles requested
// by the visible Leaflet map; never prefetch regions or intercept app/API data.
const TILE_CACHE = 'concerttracker-osm-tiles-v1';
const MAX_TILES = 512;
const MAX_TILE_BYTES = 128 * 1024; // At most 64 MiB of tile bodies.
const FALLBACK_TTL = 7 * 24 * 60 * 60 * 1000;
const FRESH_UNTIL = 'x-ct-tile-fresh-until';
const tileRequests = new Map();
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

async function storeMapTile(cache, request, response) {
  if (!cache || response.status !== 200 || response.type === 'opaque'
      || !/^image\/png(?:;|$)/i.test(response.headers.get('content-type') || '')) return;
  const freshUntil = tileFreshUntil(response, Date.now());
  if (freshUntil <= Date.now()) {
    await cache.delete(request);
    return;
  }
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_TILE_BYTES) return;
  const headers = new Headers(response.headers);
  headers.set(FRESH_UNTIL, String(freshUntil));
  headers.delete('content-encoding');
  headers.set('content-length', String(bytes.byteLength));
  const stored = new Response(bytes, { status: 200, headers });
  // Serialize writes so concurrent viewport loads cannot exceed the cap or
  // prune one another's new entries. Browser quota failures never break the map.
  const write = tileWrites.then(async () => {
    await cache.delete(request);
    await cache.put(request, stored);
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - MAX_TILES))) {
      await cache.delete(key);
    }
  });
  tileWrites = write.catch(() => {});
  await tileWrites;
}

async function loadMapTile(request) {
  let cache;
  try {
    cache = await caches.open(TILE_CACHE);
    const cached = await cache.match(request);
    if (cached && Number(cached.headers.get(FRESH_UNTIL)) > Date.now()) return cached;
  } catch (_) { /* Private-mode/quota restrictions: use the normal HTTP cache. */ }
  // Default HTTP caching preserves the browser's conditional revalidation for
  // expired tiles. Custom If-None-Match headers would cause CORS preflights.
  const response = await fetch(request);
  try { await storeMapTile(cache, request, response.clone()); } catch (_) {}
  return response;
}

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (!isMapTileRequest(event.request)) return;
  const key = event.request.url;
  let pending = tileRequests.get(key);
  if (!pending) {
    pending = loadMapTile(event.request);
    tileRequests.set(key, pending);
    pending.then(() => tileRequests.delete(key), () => tileRequests.delete(key));
  }
  event.respondWith(pending.then(response => response.clone()));
});
