import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EventEmitter } from 'node:events';
import vm from 'node:vm';
import { test } from 'node:test';

const serverPath = fileURLToPath(new URL('../server/index.js', import.meta.url));
const source = readFileSync(serverPath, 'utf8');
const nativeRequire = createRequire(import.meta.url);
const playlistId = 'abcdefghijklmnopqrstuv';
const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', ...headers },
});
const track = index => ({ id: `track-${index}`, name: `Track ${index}`, type: 'track',
  artists: [{ id: 'artist-1', name: 'Artist' }], album: { name: 'Album', images: [] } });

function harness(fetchImpl, { timeoutMs = null } = {}) {
  const calls = [];
  const envReads = [];
  const fakeRequire = name => {
    if (name === 'node:fs') return {
      ...nativeRequire(name),
      existsSync(path) {
        envReads.push(path);
        assert.equal(resolve(path), resolve(dirname(serverPath), '..', '.env'));
        return false;
      },
      readFileSync() { throw new Error('Tests must not read environment files.'); },
    };
    return nativeRequire(name);
  };
  fakeRequire.main = null;
  const context = vm.createContext({
    require: fakeRequire, module: { exports: {} }, __dirname: dirname(serverPath),
    process: { env: { PORT: '0', SPOTIFY_CLIENT_ID: 'fixture-client',
      SPOTIFY_CLIENT_SECRET: 'fixture-secret', SESSION_SECRET: 'fixture-session' } },
    Buffer, URL, URLSearchParams, Headers, AbortController,
    setTimeout: timeoutMs === null ? setTimeout : (callback, duration) => setTimeout(callback, Math.min(duration, timeoutMs)),
    clearTimeout, console: { warn() {}, error() {} },
    fetch: async (url, options = {}) => {
      calls.push({ url: String(url), options });
      return fetchImpl(String(url), options);
    },
  });
  vm.runInContext(source, context, { filename: serverPath });
  assert.equal(envReads.length, 1, 'The environment file probe is intercepted before any read');
  return { context, calls };
}

function responseRecorder() {
  const headers = new Map();
  return Object.assign(new EventEmitter(), {
    status: 0, body: '', writableEnded: false,
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    getHeader(name) { return headers.get(name.toLowerCase()); },
    writeHead(status, values) {
      this.status = status;
      for (const [name, value] of Object.entries(values)) this.setHeader(name, value);
    },
    end(body = '') { this.body = String(body); this.writableEnded = true; },
    json() { return JSON.parse(this.body); },
  });
}

function beginRequest(context, url, { cookie = '', method = 'GET', body = null } = {}) {
  const req = new EventEmitter();
  Object.assign(req, { url, method, headers: { host: 'localhost', cookie },
    socket: { remoteAddress: '127.0.0.1' } });
  const res = responseRecorder();
  const pending = context.handleRequest(req, res);
  if (body !== null) queueMicrotask(() => { req.emit('data', Buffer.from(body)); req.emit('end'); });
  return { req, res, pending };
}

async function request(context, url, options) {
  const { res, pending } = beginRequest(context, url, options);
  await pending;
  return res;
}

function sessionCookie(context, { expired = false } = {}) {
  const session = { accessToken: 'fixture-user-access', refreshToken: 'fixture-user-refresh',
    expiresAt: Date.now() + (expired ? -1000 : 3600_000), scope: ['playlist-read-private'],
    user: { id: 'fixture-user', displayName: 'Fixture User' } };
  return `tt_spotify_session=${encodeURIComponent(context.sealJson(session))}`;
}

function playlistProvider({ endpoint = 'items', entries = [], snapshot = 'stable', pageHook = null } = {}) {
  let metadataReads = 0;
  return async (url, options) => {
    if (url === 'https://accounts.spotify.com/api/token') {
      assert.equal(new URLSearchParams(options.body).get('grant_type'), 'client_credentials');
      return json({ access_token: 'fixture-app-access', expires_in: 3600 });
    }
    if (url === playlistUrl) {
      metadataReads += 1;
      return json({ id: playlistId, name: 'Fixture playlist', [endpoint]: { total: entries.length },
        snapshot_id: typeof snapshot === 'function' ? snapshot(metadataReads) : snapshot });
    }
    const parsed = new URL(url);
    assert.equal(parsed.pathname, `/v1/playlists/${playlistId}/${endpoint}`);
    assert.equal(parsed.searchParams.get('limit'), '50');
    assert.equal(parsed.searchParams.has('fields'), false, 'Removed fields must not be requested');
    const offset = Number(parsed.searchParams.get('offset'));
    if (pageHook) await pageHook(offset, options);
    const nextOffset = offset + 50;
    return json({ items: entries.slice(offset, nextOffset), offset, limit: 50, total: entries.length,
      next: nextOffset < entries.length ? `${playlistUrl}/${endpoint}?offset=${nextOffset}&limit=50` : null });
  };
}

test('modern /items imports every page in original order with at most three workers', async () => {
  const entries = Array.from({ length: 201 }, (_, index) => ({ item: track(index) }));
  let active = 0;
  let peak = 0;
  const provider = playlistProvider({ entries, pageHook: async offset => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, offset === 50 ? 8 : 1));
    active -= 1;
  } });
  const { context, calls } = harness(provider);
  const res = await request(context, `/api/spotify/playlists/${playlistId}/import`);
  assert.equal(res.status, 200);
  assert.equal(res.getHeader('cache-control'), 'no-store');
  const result = res.json();
  assert.equal(result.source, 'app');
  assert.equal(result.playlist.items.total, 201);
  assert.equal(result.playlist.tracks.total, 201, 'Existing frontend metadata remains compatible');
  assert.deepEqual(result.tracks.map(record => record.id), entries.map(record => record.item.id));
  assert.equal(result.importSummary.importedTracks, 201);
  assert.equal(peak, 3);
  assert.deepEqual(calls.filter(call => call.url.includes('/items?')).map(call => Number(new URL(call.url).searchParams.get('offset'))).sort((a, b) => a - b), [0, 50, 100, 150, 200]);
  assert.equal(calls.filter(call => call.url === playlistUrl).length, 2, 'Snapshot is checked after paging');
});

for (const endpoint of ['items', 'tracks']) {
  test(`${endpoint} schema skips unavailable, episode and local slots with honest totals and preserves repeats`, async () => {
    const key = endpoint === 'items' ? 'item' : 'track';
    const entries = [{ [key]: track(1) }, { [key]: track(1) }, { [key]: null },
      { [key]: { type: 'episode', id: 'episode-1' } }, { [key]: track(5), is_local: true }];
    const { context, calls } = harness(playlistProvider({ endpoint, entries }));
    const result = await context.fetchSpotifyPlaylistImport('fixture-user-access', playlistId);
    assert.deepEqual(JSON.parse(JSON.stringify(result.importSummary)), {
      totalItems: 5, importedTracks: 2, skippedItems: { unavailable: 1, episodes: 1, local: 1 },
    });
    assert.equal(result.tracks.length, 2, 'Repeated tracks remain repeated playlist entries');
    assert.equal(result.tracks[0].preview_url, '', 'Missing preview is not fabricated');
    assert.ok(calls.every(call => call.url === playlistUrl || call.url.includes(`/${endpoint}?`)));
  });
}

test('user import is private and preserves the user token instead of requesting an app token', async () => {
  const { context, calls } = harness(playlistProvider({ entries: [{ item: track(1) }] }));
  const res = await request(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
  assert.equal(res.status, 200);
  assert.equal(res.json().source, 'user');
  assert.equal(res.getHeader('cache-control'), 'no-store');
  assert.ok(calls.every(call => call.options.headers.Authorization === 'Bearer fixture-user-access'));
});

test('401, 403, 404 and 429 retain their status and structured code without leaking upstream payloads', async () => {
  for (const [status, code] of [[401, 'SPOTIFY_LOGIN_REQUIRED'], [403, 'PLAYLIST_ACCESS_DENIED'],
    [404, 'PLAYLIST_NOT_FOUND'], [429, 'RATE_LIMITED']]) {
    const { context } = harness(async () => json({ error: { message: 'Provider refusal' }, access_token: 'must-not-leak' }, status,
      status === 429 ? { 'Retry-After': '17' } : {}));
    const res = await request(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
    assert.equal(res.status, status);
    assert.equal(res.json().code, code);
    assert.equal(res.body.includes('must-not-leak'), false);
    assert.equal(res.getHeader('cache-control'), 'no-store');
    if (status === 429) assert.equal(res.getHeader('retry-after'), '17');
  }
});

test('a failed page aborts peer requests, starts no later pages and never returns partial success', async () => {
  for (const malformed of [false, true]) {
    const entries = Array.from({ length: 501 }, (_, index) => ({ item: track(index) }));
    const base = playlistProvider({ entries });
    let aborted = 0;
    const { context, calls } = harness(async (url, options) => {
      if (url.includes('/items?')) {
        const offset = Number(new URL(url).searchParams.get('offset'));
        if (offset === 50) {
          if (!malformed) return json({ error: { message: 'Rate limited' } }, 429, { 'Retry-After': '9' });
          return json({ items: Array.from({ length: 50 }, () => ({ invalid: true })), offset: 50,
            limit: 50, total: entries.length, next: `${playlistUrl}/items?offset=100&limit=50` });
        }
        if (offset > 50) return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => { aborted += 1; reject(options.signal.reason); }, { once: true });
        });
      }
      return base(url, options);
    });
    const res = await request(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
    assert.equal(res.status, malformed ? 502 : 429);
    assert.equal(res.json().code, malformed ? 'INCOMPLETE_IMPORT' : 'RATE_LIMITED');
    assert.equal('tracks' in res.json(), false);
    if (!malformed) assert.equal(res.getHeader('retry-after'), '9');
    assert.deepEqual(calls.filter(call => call.url.includes('/items?')).map(call => Number(new URL(call.url).searchParams.get('offset'))), [0, 50, 100, 150]);
    assert.equal(aborted, 2);
  }
});

test('client disconnect aborts all playlist workers without paging further or writing a response', async () => {
  const entries = Array.from({ length: 501 }, (_, index) => ({ item: track(index) }));
  const base = playlistProvider({ entries });
  let ready;
  const workersReady = new Promise(resolve => { ready = resolve; });
  const signals = [];
  let aborted = 0;
  const { context, calls } = harness(async (url, options) => {
    if (url.includes('/items?') && Number(new URL(url).searchParams.get('offset')) > 0) {
      signals.push(options.signal);
      if (signals.length === 3) ready();
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          aborted += 1;
          reject(options.signal.reason);
        }, { once: true });
      });
    }
    return base(url, options);
  });
  const { req, res, pending } = beginRequest(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
  await workersReady;
  req.emit('close');
  assert.ok(signals.every(signal => !signal.aborted), 'Normal request completion does not cancel the response work');
  res.emit('close');
  await pending;
  assert.equal(aborted, 3);
  assert.deepEqual(calls.filter(call => call.url.includes('/items?')).map(call => Number(new URL(call.url).searchParams.get('offset'))), [0, 50, 100, 150]);
  assert.equal(calls.filter(call => call.url === playlistUrl).length, 1, 'No snapshot request follows cancellation');
  assert.equal(res.status, 0);
  assert.equal(res.body, '');
  assert.equal(req.listenerCount('aborted'), 0);
  assert.equal(res.listenerCount('close'), 0);
});

test('an aborted incoming request cancels metadata and disposes both HTTP listeners', async () => {
  let ready;
  const metadataReady = new Promise(resolve => { ready = resolve; });
  let aborted = false;
  const { context, calls } = harness(async (url, options) => {
    assert.equal(url, playlistUrl);
    ready();
    return new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => { aborted = true; reject(options.signal.reason); }, { once: true });
    });
  });
  const { req, res, pending } = beginRequest(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
  await metadataReady;
  req.aborted = true;
  req.emit('aborted');
  await pending;
  assert.equal(aborted, true);
  assert.equal(calls.length, 1);
  assert.equal(res.status, 0);
  assert.equal(req.listenerCount('aborted'), 0);
  assert.equal(res.listenerCount('close'), 0);
});

test('completed and failed imports remove cancellation listeners and a pre-aborted import never fetches', async () => {
  for (const status of [200, 403]) {
    const base = playlistProvider({ entries: [{ item: track(1) }] });
    const { context } = harness(status === 200 ? base : async () => json({ error: 'Denied' }, status));
    const { req, res, pending } = beginRequest(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
    await pending;
    assert.equal(res.status, status);
    assert.equal(res.writableEnded, true);
    assert.equal(req.listenerCount('aborted'), 0);
    assert.equal(res.listenerCount('close'), 0);
    res.emit('close');
    assert.equal(res.status, status);
  }
  const { context, calls } = harness(async () => { throw new Error('No fetch expected'); });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(context.fetchSpotifyPlaylistImport('fixture-user-access', playlistId, { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(calls.length, 0);
});

test('bad page shape, incomplete pages and changing snapshots are rejected', async () => {
  for (const kind of ['missing-items', 'missing-wrapper', 'short-page', 'changed-total', 'changed-snapshot']) {
    const entries = Array.from({ length: 51 }, (_, index) => ({ item: track(index) }));
    const base = playlistProvider({ entries, snapshot: read => kind === 'changed-snapshot' && read > 1 ? 'changed' : 'stable' });
    const { context } = harness(async (url, options) => {
      const response = await base(url, options);
      if (!url.includes('/items?') || !url.includes('offset=50')) return response;
      const page = await response.json();
      if (kind === 'missing-items') delete page.items;
      if (kind === 'missing-wrapper') page.items[0] = { invalid: true };
      if (kind === 'short-page') page.items = [];
      if (kind === 'changed-total') page.total += 1;
      return json(page);
    });
    const res = await request(context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(context) });
    assert.equal(res.status, 502, kind);
    assert.equal(res.json().code, 'INCOMPLETE_IMPORT', kind);
    assert.equal('tracks' in res.json(), false, kind);
  }
});

test('empty playlists are successful empty imports and missing content access remains a 403', async () => {
  const empty = harness(playlistProvider());
  const result = await empty.context.fetchSpotifyPlaylistImport('fixture-user-access', playlistId);
  assert.equal(result.tracks.length, 0);
  assert.equal(result.importSummary.totalItems, 0);
  const denied = harness(async () => json({ id: playlistId, name: 'Restricted playlist' }));
  const res = await request(denied.context, `/api/spotify/playlists/${playlistId}/import`, { cookie: sessionCookie(denied.context) });
  assert.equal(res.status, 403);
  assert.equal(res.json().code, 'PLAYLIST_ACCESS_DENIED');
});

test('refresh rate limits and outages preserve cookies and never fall back to app credentials', async () => {
  for (const status of [429, 503]) {
    const { context, calls } = harness(async (url, options) => {
      assert.equal(url, 'https://accounts.spotify.com/api/token');
      assert.equal(new URLSearchParams(options.body).get('grant_type'), 'refresh_token');
      return json({ error: 'temporarily_unavailable' }, status, { 'Retry-After': '12' });
    });
    for (const route of [`/api/spotify/playlists/${playlistId}/import`, '/api/auth/spotify/session', '/api/spotify/me/playlists']) {
      const res = await request(context, route, { cookie: sessionCookie(context, { expired: true }) });
      assert.equal(res.status, status);
      assert.equal(res.getHeader('set-cookie'), undefined, 'A temporary failure must not clear the encrypted session');
      assert.equal(res.getHeader('retry-after'), '12');
    }
    assert.equal(calls.length, 3, 'Each route only attempted its user-token refresh');
  }
});

test('refresh timeout preserves the session while invalid_grant alone clears it', async () => {
  const timeout = harness(async (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }), { timeoutMs: 5 });
  const timedOut = await request(timeout.context, '/api/auth/spotify/session', { cookie: sessionCookie(timeout.context, { expired: true }) });
  assert.equal(timedOut.status, 504);
  assert.equal(timedOut.getHeader('set-cookie'), undefined);
  const revoked = harness(async () => json({ error: 'invalid_grant' }, 400));
  const res = await request(revoked.context, '/api/auth/spotify/session', { cookie: sessionCookie(revoked.context, { expired: true }) });
  assert.equal(res.status, 200);
  assert.equal(res.json().connected, false);
  assert.match(res.getHeader('set-cookie').join(';'), /Max-Age=0/);
});

test('share-link resolver follows only validated manual redirects and cancels preview bodies', async () => {
  let cancellations = 0;
  const { context, calls } = harness(async (url, options) => {
    assert.equal(options.redirect, 'manual');
    return { status: 302, headers: new Headers({ Location: url.endsWith('/first') ? '/second' : `https://open.spotify.com/intl-es/playlist/${playlistId}?si=ignored` }),
      body: { cancel: async () => { cancellations += 1; } } };
  });
  const res = await request(context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/first' }) });
  assert.equal(res.status, 200);
  assert.deepEqual(res.json(), { id: playlistId, url: `https://open.spotify.com/playlist/${playlistId}` });
  assert.deepEqual(calls.map(call => call.url), ['https://spotify.link/first', 'https://spotify.link/second']);
  assert.equal(cancellations, 2);
});

test('share-link resolver refuses foreign hosts, credentials, ports and non-playlist redirects before fetching them', async () => {
  for (const target of ['http://127.0.0.1/private', 'https://foreign.example/private',
    'https://spotify.link@foreign.example/private', 'https://spotify.link:443/second',
    '//spotify.link:443/second',
    'https://open.spotify.com/track/abcdefghijklmnopqrstuv', 'https://spotify.app.link/second']) {
    const { context, calls } = harness(async () => new Response(null, { status: 302, headers: { Location: target } }));
    const res = await request(context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/first' }) });
    assert.equal(res.status, 400, target);
    assert.equal(res.json().code, 'UNSUPPORTED_SPOTIFY_LINK');
    assert.equal(calls.length, 1, 'An unsafe redirect must never be fetched');
  }
});

test('share-link resolver bounds loops, redirect chains, timeout and request/response sizes', async () => {
  for (const kind of ['loop', 'chain', 'large-response', 'terminal-preview']) {
    const { context, calls } = harness(async url => {
      if (kind === 'large-response') return new Response(null, { status: 302, headers: { Location: '/second', 'Content-Length': '65537' } });
      if (kind === 'terminal-preview') return new Response('Preview HTML', { status: 200 });
      const hop = Number(new URL(url).pathname.slice(1)) || 0;
      return new Response(null, { status: 302, headers: { Location: kind === 'loop' ? '/0' : `/${hop + 1}` } });
    });
    const res = await request(context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/0' }) });
    assert.equal(res.status, kind === 'large-response' ? 502 : 400, kind);
    assert.equal(res.json().code, 'UNSUPPORTED_SPOTIFY_LINK');
    assert.ok(calls.length <= 4);
  }
  const oversized = harness(async () => { throw new Error('An oversized client body must not trigger fetch'); });
  const res = await request(oversized.context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/' + 'x'.repeat(4096) }) });
  assert.equal(res.status, 413);
  assert.equal(oversized.calls.length, 0);
  const timeout = harness(async (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }), { timeoutMs: 5 });
  const timedOut = await request(timeout.context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/timeout' }) });
  assert.equal(timedOut.status, 504);
});

test('invalid playlist IDs and share-link inputs perform no provider calls', async () => {
  const { context, calls } = harness(async () => { throw new Error('No fetch expected'); });
  const invalid = await request(context, '/api/spotify/playlists/invalid/import', { cookie: sessionCookie(context) });
  assert.equal(invalid.status, 400);
  const invalidPublic = await request(context, '/api/spotify/playlists/invalid/import');
  assert.equal(invalidPublic.status, 400);
  for (const value of ['https://foreign.example/path', 'https://spotify.link/', `https://open.spotify.com/playlist/${playlistId}`, 'spotify:playlist:abcdefghijklmnopqrstuv']) {
    const res = await request(context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: value }) });
    assert.equal(res.status, 400);
  }
  assert.equal(calls.length, 0);
});

test('share-link provider rate limits retain Retry-After instead of masquerading as invalid links', async () => {
  const { context } = harness(async () => new Response(null, { status: 429, headers: { 'Retry-After': '23' } }));
  const res = await request(context, '/api/spotify/resolve-link', { method: 'POST', body: JSON.stringify({ url: 'https://spotify.link/limited' }) });
  assert.equal(res.status, 429);
  assert.equal(res.json().code, 'RATE_LIMITED');
  assert.equal(res.getHeader('retry-after'), '23');
});
