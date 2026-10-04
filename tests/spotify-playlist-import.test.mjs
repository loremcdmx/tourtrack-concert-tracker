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

function harness(fetchImpl, { timeoutMs = null, env = {} } = {}) {
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
      SPOTIFY_CLIENT_SECRET: 'fixture-secret', SESSION_SECRET: 'fixture-session', ...env } },
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

function beginRequest(context, url, { cookie = '', method = 'GET', body = null,
  host = 'localhost', remoteAddress = '127.0.0.1', headers = {} } = {}) {
  const req = new EventEmitter();
  Object.assign(req, { url, method, headers: { host, cookie, ...headers },
    socket: { remoteAddress } });
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

function sessionCookie(context, { expired = false, withoutUser = false } = {}) {
  const session = { accessToken: 'fixture-user-access', refreshToken: 'fixture-user-refresh',
    expiresAt: Date.now() + (expired ? -1000 : 3600_000), scope: ['playlist-read-private'],
    user: withoutUser ? null : { id: 'fixture-user', displayName: 'Fixture User' } };
  return `tt_spotify_session=${encodeURIComponent(context.sealJson(session))}`;
}

function hangingJsonBody(options, onStart, onAbort) {
  return { ok: true, json: () => new Promise((resolve, reject) => {
    onStart();
    const abort = () => { onAbort(); reject(options.signal.reason); };
    if (options.signal.aborted) abort();
    else options.signal.addEventListener('abort', abort, { once: true });
  }) };
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

test('a stalled profile body times out without losing a valid or freshly refreshed session', async () => {
  for (const expired of [false, true]) {
    let bodiesStarted = 0;
    let bodiesAborted = 0;
    const { context, calls } = harness(async (url, options) => {
      if (url === 'https://accounts.spotify.com/api/token') {
        assert.equal(new URLSearchParams(options.body).get('grant_type'), 'refresh_token');
        return json({ access_token: 'fixture-new-access', expires_in: 3600 });
      }
      assert.equal(url, 'https://api.spotify.com/v1/me');
      return hangingJsonBody(options, () => { bodiesStarted += 1; }, () => { bodiesAborted += 1; });
    }, { timeoutMs: 5 });
    const res = await request(context, '/api/auth/spotify/session', {
      cookie: sessionCookie(context, { expired, withoutUser: true }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.json().connected, true);
    assert.equal(res.json().user, null, 'Optional profile enrichment can fail while account access stays valid');
    assert.ok(bodiesStarted > 0, 'Headers arrived and JSON body consumption actually started');
    assert.equal(bodiesAborted, bodiesStarted, 'Every stalled body is aborted by its own deadline');
    const cookies = res.getHeader('set-cookie') || [];
    assert.ok(cookies.every(value => !value.includes('Max-Age=0')), 'A profile timeout must not clear the user session');
    if (expired) {
      assert.ok(cookies.some(value => value.startsWith('tt_spotify_session=')), 'A successful token refresh is retained');
      assert.equal(calls.filter(call => call.url === 'https://accounts.spotify.com/api/token').length, 1);
    } else {
      assert.equal(calls.filter(call => call.url === 'https://accounts.spotify.com/api/token').length, 0);
    }
  }
});

test('OAuth callback completes and stores the session when only the profile response body stalls', async () => {
  let bodiesStarted = 0;
  let bodiesAborted = 0;
  const { context } = harness(async (url, options) => {
    if (url === 'https://accounts.spotify.com/api/token') {
      assert.equal(new URLSearchParams(options.body).get('grant_type'), 'authorization_code');
      return json({ access_token: 'fixture-login-access', refresh_token: 'fixture-login-refresh',
        expires_in: 3600, scope: 'playlist-read-private' });
    }
    assert.equal(url, 'https://api.spotify.com/v1/me');
    return hangingJsonBody(options, () => { bodiesStarted += 1; }, () => { bodiesAborted += 1; });
  }, { timeoutMs: 5 });
  const cookie = `tt_spotify_state=${encodeURIComponent(context.sealJson({
    state: 'fixture-login-state', returnTo: '/?fixture=return', ts: Date.now(),
  }))}`;
  const res = await request(context, '/api/auth/spotify/callback?code=fixture-code&state=fixture-login-state', { cookie });
  assert.equal(res.status, 302);
  assert.equal(res.getHeader('location'), '/?fixture=return&spotify=connected');
  const savedSession = (res.getHeader('set-cookie') || []).find(value => value.startsWith('tt_spotify_session='));
  assert.ok(savedSession);
  assert.equal(savedSession.includes('Max-Age=0'), false);
  assert.equal(bodiesStarted, 1);
  assert.equal(bodiesAborted, 1);
});

test('a stalled user-playlist response body returns 504 without clearing authentication', async () => {
  let bodiesStarted = 0;
  let bodiesAborted = 0;
  const { context, calls } = harness(async (url, options) => {
    assert.equal(url, 'https://api.spotify.com/v1/me/playlists?limit=50');
    return hangingJsonBody(options, () => { bodiesStarted += 1; }, () => { bodiesAborted += 1; });
  }, { timeoutMs: 5 });
  const res = await request(context, '/api/spotify/me/playlists', { cookie: sessionCookie(context) });
  assert.equal(res.status, 504);
  assert.equal('items' in res.json(), false, 'No partial playlist list is reported as successful');
  assert.equal(res.getHeader('set-cookie'), undefined);
  assert.equal(calls.length, 1);
  assert.equal(bodiesStarted, 1);
  assert.equal(bodiesAborted, 1);
});

test('user-playlist choices accept modern and legacy totals while preserving zero and rejecting malformed counts', async () => {
  for (const [metadata, expected] of [
    [{ items: { total: 87 } }, 87],
    [{ tracks: { total: 42 } }, 42],
    [{ items: { total: 0 }, tracks: { total: 99 } }, 0],
    [{ items: {}, tracks: { total: 12 } }, 12],
  ]) {
    const { context } = harness(async () => json({ items: [{ id: playlistId, name: 'Fixture', ...metadata }], next: null }));
    const res = await request(context, '/api/spotify/me/playlists', { cookie: sessionCookie(context) });
    assert.equal(res.status, 200);
    assert.equal(res.json().items[0].trackCount, expected);
  }
  for (const metadata of [{}, { items: { total: -1 } }, { items: { total: 1.5 } },
    { items: { total: '87' } }, { items: { total: 9007199254740992 } },
    { items: { total: -1 }, tracks: { total: 12 } }]) {
    const { context } = harness(async () => json({ items: [{ id: playlistId, ...metadata }], next: null }));
    const res = await request(context, '/api/spotify/me/playlists', { cookie: sessionCookie(context) });
    assert.equal(res.status, 502);
    assert.equal(res.json().code, 'INCOMPLETE_IMPORT');
    assert.equal('items' in res.json(), false);
    assert.equal(res.getHeader('set-cookie'), undefined);
  }
});

test('malformed profile objects reject with 502 while optional enrichment preserves an existing session', async () => {
  for (const payload of [{}, { id: '' }, { id: '   ' }, { id: 12 }]) {
    const { context } = harness(async url => {
      assert.equal(url, 'https://api.spotify.com/v1/me');
      return json(payload);
    });
    await assert.rejects(context.fetchSpotifyProfile('fixture-access'), { status: 502, code: 'INCOMPLETE_IMPORT' });
    const res = await request(context, '/api/auth/spotify/session', {
      cookie: sessionCookie(context, { withoutUser: true }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.json().connected, true);
    assert.equal(res.json().user, null, 'Malformed metadata must never fabricate an empty account identity');
    assert.equal(res.getHeader('set-cookie'), undefined, 'Optional metadata failure must not revoke an existing session');
  }
  const valid = harness(async () => json({ id: 'fixture-id' }));
  const profile = await valid.context.fetchSpotifyProfile('fixture-access');
  assert.equal(profile.id, 'fixture-id');
  assert.equal(profile.displayName, 'fixture-id', 'Removed or absent display_name does not invalidate an account');
});

test('malformed playlist-list objects return 502 without emitting an empty success or clearing cookies', async () => {
  for (const payload of [{}, { items: null }, { items: {} }, { items: 'invalid' }]) {
    const { context } = harness(async url => {
      assert.equal(url, 'https://api.spotify.com/v1/me/playlists?limit=50');
      return json(payload);
    });
    const res = await request(context, '/api/spotify/me/playlists', { cookie: sessionCookie(context) });
    assert.equal(res.status, 502);
    assert.equal(res.json().code, 'INCOMPLETE_IMPORT');
    assert.equal('items' in res.json(), false);
    assert.equal(res.getHeader('set-cookie'), undefined);
  }
  const empty = harness(async () => json({ items: [], next: null }));
  const res = await request(empty.context, '/api/spotify/me/playlists', { cookie: sessionCookie(empty.context) });
  assert.equal(res.status, 200);
  assert.deepEqual(res.json().items, []);
});

const localOAuthEnv = { PORT: '3002', SPOTIFY_REDIRECT_URI: 'http://localhost:3002/api/auth/spotify/callback' };
const localhostOAuthOptions = { host: 'localhost:3002' };
const loopbackOAuthOptions = { host: '127.0.0.1:3002' };
const fixtureOAuthSession = { accessToken: 'fixture-login-access', refreshToken: 'fixture-login-refresh',
  expiresAt: Date.now() + 3600_000, scope: ['playlist-read-private'], user: { id: 'fixture-login-user' } };

function responseCookie(res, name) {
  return (res.getHeader('set-cookie') || []).find(value => value.startsWith(`${name}=`))?.split(';')[0] || '';
}

async function beginLocalOAuth(context, returnTo = '/?fixture=return#map') {
  const start = await request(context, `/api/auth/spotify/login?returnTo=${encodeURIComponent(returnTo)}&show_dialog=1`, localhostOAuthOptions);
  assert.equal(start.status, 302);
  const relayUrl = new URL(start.getHeader('location'));
  assert.equal(relayUrl.origin, 'http://127.0.0.1:3002');
  const originalCookie = responseCookie(start, 'tt_spotify_state');
  assert.ok(originalCookie);
  const login = await request(context, `${relayUrl.pathname}${relayUrl.search}`, loopbackOAuthOptions);
  assert.equal(login.status, 302);
  const authUrl = new URL(login.getHeader('location'));
  assert.equal(authUrl.origin, 'https://accounts.spotify.com');
  assert.equal(authUrl.searchParams.get('redirect_uri'), 'http://127.0.0.1:3002/api/auth/spotify/callback');
  assert.equal(authUrl.searchParams.get('show_dialog'), 'true');
  return { start, login, relayUrl, originalCookie, callbackCookie: responseCookie(login, 'tt_spotify_state'),
    state: authUrl.searchParams.get('state') };
}

function oauthFixtureProvider(url, options) {
  if (url === 'https://accounts.spotify.com/api/token') {
    const form = new URLSearchParams(options.body);
    assert.equal(form.get('grant_type'), 'authorization_code');
    assert.equal(form.get('redirect_uri'), 'http://127.0.0.1:3002/api/auth/spotify/callback');
    return json({ access_token: fixtureOAuthSession.accessToken, refresh_token: fixtureOAuthSession.refreshToken,
      expires_in: 3600, scope: 'playlist-read-private' });
  }
  assert.equal(url, 'https://api.spotify.com/v1/me');
  return json({ id: 'fixture-login-user', display_name: 'Fixture User' });
}

test('local Spotify callbacks use a literal loopback IP while production HTTPS configuration stays exact', async () => {
  const local = harness(async () => { throw new Error('Unexpected provider call'); }, { env: localOAuthEnv });
  for (const host of ['localhost:3002', '127.0.0.1:3002', '[::1]:3002']) {
    const health = await request(local.context, '/api/health', { host });
    assert.equal(health.json().spotifyRedirectUri, 'http://127.0.0.1:3002/api/auth/spotify/callback');
  }
  const inferred = harness(async () => {}, { env: { PORT: '3002' } });
  const health = await request(inferred.context, '/api/health', localhostOAuthOptions);
  assert.equal(health.json().spotifyRedirectUri, 'http://127.0.0.1:3002/api/auth/spotify/callback');
  const production = harness(async () => {}, { env: { SPOTIFY_REDIRECT_URI: 'https://concert.example/api/auth/spotify/callback' } });
  const prodHealth = await request(production.context, '/api/health', { host: 'concert.example',
    remoteAddress: '203.0.113.1', headers: { 'x-forwarded-proto': 'https' } });
  assert.equal(prodHealth.json().spotifyRedirectUri, 'https://concert.example/api/auth/spotify/callback');
  const prodLogin = await request(production.context, '/api/auth/spotify/login?returnTo=%2Fagenda', {
    host: 'concert.example', remoteAddress: '203.0.113.1', headers: { 'x-forwarded-proto': 'https' },
  });
  assert.equal(new URL(prodLogin.getHeader('location')).searchParams.get('redirect_uri'), 'https://concert.example/api/auth/spotify/callback');
  assert.match(responseCookie(prodLogin, 'tt_spotify_state'), /^tt_spotify_state=/);
  assert.match(prodLogin.getHeader('set-cookie').join(';'), /Secure/);
});

test('localhost OAuth returns to the original browser origin and claims the session once without tokens in URLs', async () => {
  const { context, calls } = harness(oauthFixtureProvider, { env: localOAuthEnv });
  const flow = await beginLocalOAuth(context);
  for (const res of [flow.start, flow.login]) {
    assert.equal(res.getHeader('cache-control'), 'no-store');
    assert.equal(res.getHeader('referrer-policy'), 'no-referrer');
    assert.match(res.getHeader('set-cookie').join(';'), /Path=\/api\/auth\/spotify; SameSite=Lax; HttpOnly; Max-Age=600/);
    assert.equal(res.getHeader('set-cookie').join(';').includes('Domain='), false, 'Cookies stay scoped to their own host');
    assert.equal(responseCookie(res, 'tt_spotify_session'), '');
  }
  const callback = await request(context, `/api/auth/spotify/callback?code=fixture-code&state=${flow.state}`, {
    ...loopbackOAuthOptions, cookie: flow.callbackCookie,
  });
  assert.equal(callback.status, 302);
  assert.equal(callback.getHeader('location'), 'http://localhost:3002/api/auth/spotify/complete');
  assert.equal(callback.getHeader('referrer-policy'), 'no-referrer');
  assert.equal(responseCookie(callback, 'tt_spotify_session'), '', 'The IP origin must not acquire a second account session');
  for (const res of [flow.start, flow.login, callback]) {
    assert.equal(res.getHeader('location').includes(fixtureOAuthSession.accessToken), false);
    assert.equal(res.getHeader('location').includes(fixtureOAuthSession.refreshToken), false);
  }
  const withoutProof = await request(context, '/api/auth/spotify/session', localhostOAuthOptions);
  assert.equal(withoutProof.json().connected, false);
  const completeWithoutProof = await request(context, '/api/auth/spotify/complete', localhostOAuthOptions);
  assert.equal(completeWithoutProof.getHeader('location'), '/?spotify=error&code=state_mismatch');
  assert.equal(responseCookie(completeWithoutProof, 'tt_spotify_session'), '');
  const otherBrowserCookie = `tt_spotify_state=${encodeURIComponent(context.sealJson({
    state: 'a'.repeat(36), ts: Date.now(), bridgeOrigin: 'http://localhost:3002',
  }))}`;
  for (const options of [
    { ...localhostOAuthOptions, cookie: otherBrowserCookie },
    { host: 'localhost:3003', cookie: flow.originalCookie },
    { ...loopbackOAuthOptions, cookie: flow.originalCookie },
    { ...localhostOAuthOptions, remoteAddress: '203.0.113.1', cookie: flow.originalCookie },
  ]) {
    const refused = await request(context, '/api/auth/spotify/session', options);
    assert.equal(refused.json().connected, false, 'Another browser, port, host or remote connection cannot claim the session');
    assert.equal(responseCookie(refused, 'tt_spotify_session'), '');
    const refusedComplete = await request(context, '/api/auth/spotify/complete', options);
    assert.equal(refusedComplete.status, options.host === '127.0.0.1:3002' || options.remoteAddress ? 400 : 302);
    if (refusedComplete.status === 302) assert.match(refusedComplete.getHeader('location'), /spotify=error&code=state_mismatch/);
    assert.equal(responseCookie(refusedComplete, 'tt_spotify_session'), '');
  }
  const accepted = await request(context, '/api/auth/spotify/complete', { ...localhostOAuthOptions, cookie: flow.originalCookie });
  assert.equal(accepted.status, 302);
  assert.equal(accepted.getHeader('location'), '/?fixture=return&spotify=connected#map');
  assert.equal(accepted.getHeader('cache-control'), 'no-store');
  assert.equal(accepted.getHeader('referrer-policy'), 'no-referrer');
  const session = responseCookie(accepted, 'tt_spotify_session');
  assert.ok(session);
  assert.match(accepted.getHeader('set-cookie').join(';'), /Path=\/; SameSite=Lax; HttpOnly/);
  assert.match(accepted.getHeader('set-cookie').join(';'), /tt_spotify_state=.*Max-Age=0/);
  assert.equal(accepted.body.includes(fixtureOAuthSession.accessToken), false);
  assert.equal(accepted.body.includes(fixtureOAuthSession.refreshToken), false);
  const replay = await request(context, '/api/auth/spotify/complete', { ...localhostOAuthOptions, cookie: flow.originalCookie });
  assert.equal(replay.getHeader('location'), '/?fixture=return&spotify=error&code=state_mismatch#map');
  assert.equal(responseCookie(replay, 'tt_spotify_session'), '');
  const retained = await request(context, '/api/auth/spotify/session', { ...localhostOAuthOptions, cookie: session });
  assert.equal(retained.json().connected, true, 'The final localhost HttpOnly cookie works on subsequent reloads');
  assert.equal(retained.json().user.id, 'fixture-login-user');
  assert.equal(calls.length, 2, 'Handoff and session claims make no extra provider requests');
  const postComplete = await request(context, '/api/auth/spotify/complete', { ...localhostOAuthOptions, method: 'POST' });
  assert.equal(postComplete.status, 405);
  assert.equal(postComplete.getHeader('allow'), 'GET');
});

test('direct loopback OAuth keeps its own session and does not create a localhost handoff', async () => {
  const { context } = harness(oauthFixtureProvider, { env: localOAuthEnv });
  const login = await request(context, '/api/auth/spotify/login?returnTo=%2Fagenda', loopbackOAuthOptions);
  const authUrl = new URL(login.getHeader('location'));
  const callback = await request(context, `/api/auth/spotify/callback?code=fixture-code&state=${authUrl.searchParams.get('state')}`, {
    ...loopbackOAuthOptions, cookie: responseCookie(login, 'tt_spotify_state'),
  });
  assert.equal(callback.getHeader('location'), '/agenda?spotify=connected');
  const saved = responseCookie(callback, 'tt_spotify_session');
  assert.ok(saved);
  const session = await request(context, '/api/auth/spotify/session', { ...loopbackOAuthOptions, cookie: saved });
  assert.equal(session.json().connected, true);
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', context), 0);
});

test('production HTTPS OAuth exchanges the configured callback and retains its own Secure session without the local bridge', async () => {
  const callbackUri = 'https://concert.example/api/auth/spotify/callback';
  const { context } = harness(async (url, options) => {
    if (url === 'https://accounts.spotify.com/api/token') {
      assert.equal(new URLSearchParams(options.body).get('redirect_uri'), callbackUri);
      return json({ access_token: fixtureOAuthSession.accessToken, refresh_token: fixtureOAuthSession.refreshToken,
        expires_in: 3600, scope: 'playlist-read-private' });
    }
    assert.equal(url, 'https://api.spotify.com/v1/me');
    return json({ id: 'fixture-login-user' });
  }, { env: { SPOTIFY_REDIRECT_URI: callbackUri } });
  const options = { host: 'concert.example', remoteAddress: '203.0.113.1', headers: { 'x-forwarded-proto': 'https' } };
  const login = await request(context, '/api/auth/spotify/login?returnTo=%2Fagenda', options);
  const authUrl = new URL(login.getHeader('location'));
  const callback = await request(context, `/api/auth/spotify/callback?code=fixture-code&state=${authUrl.searchParams.get('state')}`, {
    ...options, cookie: responseCookie(login, 'tt_spotify_state'),
  });
  assert.equal(callback.getHeader('location'), '/agenda?spotify=connected');
  const sessionCookieValue = responseCookie(callback, 'tt_spotify_session');
  assert.ok(sessionCookieValue);
  assert.match(callback.getHeader('set-cookie').find(value => value.startsWith('tt_spotify_session=')), /HttpOnly; Secure/);
  const session = await request(context, '/api/auth/spotify/session', { ...options, cookie: sessionCookieValue });
  assert.equal(session.json().connected, true);
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', context), 0);
});

test('local OAuth rejects forged, expired or cross-origin relay links before creating state or calling Spotify', async () => {
  const { context, calls } = harness(async () => { throw new Error('Unexpected provider call'); }, { env: localOAuthEnv });
  const valid = { purpose: 'spotify-local-auth-relay', state: 'a'.repeat(36), ts: Date.now(), returnTo: '/', bridgeOrigin: 'http://localhost:3002' };
  const relayValues = ['', 'forged', 'x'.repeat(4097), ...[
    { ...valid, purpose: 'other' }, { ...valid, state: '' },
    { ...valid, ts: Date.now() - 600001 }, { ...valid, ts: Date.now() + 60000 },
    { ...valid, bridgeOrigin: 'http://evil.example:3002' },
    { ...valid, bridgeOrigin: 'http://localhost:3003' },
    { ...valid, bridgeOrigin: 'https://localhost:3002' },
    { ...valid, bridgeOrigin: 'http://localhost:3002/path' },
    { ...valid, bridgeOrigin: 'http://user:pass@localhost:3002' },
  ].map(value => context.sealJson(value))];
  for (const bridge of relayValues) {
    const res = await request(context, `/api/auth/spotify/login?bridge=${encodeURIComponent(bridge)}`, loopbackOAuthOptions);
    assert.equal(res.status, 400);
    assert.equal(res.json().code, 'SPOTIFY_STATE_MISMATCH');
    assert.equal(res.getHeader('set-cookie'), undefined);
  }
  const remote = await request(context, `/api/auth/spotify/login?bridge=${encodeURIComponent(context.sealJson(valid))}`, {
    ...loopbackOAuthOptions, remoteAddress: '203.0.113.1',
  });
  assert.equal(remote.status, 400);
  assert.equal(calls.length, 0);
});

test('local OAuth refuses mismatched callback ports, paths and query strings rather than moving browser data to another origin', async () => {
  for (const uri of ['http://localhost:3003/api/auth/spotify/callback', 'http://localhost:3002/wrong-callback',
    'http://localhost:3002/api/auth/spotify/callback?extra=1', 'http://localhost:3002/api/auth/spotify/callback#fragment']) {
    const { context, calls } = harness(async () => {}, { env: { ...localOAuthEnv, SPOTIFY_REDIRECT_URI: uri } });
    const res = await request(context, '/api/auth/spotify/login', localhostOAuthOptions);
    assert.equal(res.status, 400);
    assert.equal(res.json().code, 'SPOTIFY_REDIRECT_MISMATCH');
    assert.equal(res.getHeader('set-cookie'), undefined);
    assert.equal(calls.length, 0);
  }
});

test('OAuth callbacks require a fresh matching cookie even for provider denial and never exchange invalid state', async () => {
  const { context, calls } = harness(async () => { throw new Error('Unexpected provider call'); }, { env: localOAuthEnv });
  for (const payload of [null, { state: 'fixture-state', ts: Date.now() - 600001 },
    { state: 'fixture-state', ts: Date.now() + 60000 }, { state: 'different-state', ts: Date.now() },
    { state: 'fixture-state' }]) {
    const cookie = payload ? `tt_spotify_state=${encodeURIComponent(context.sealJson(payload))}` : '';
    for (const query of ['code=fixture-code&state=fixture-state', 'error=access_denied&state=fixture-state']) {
      const res = await request(context, `/api/auth/spotify/callback?${query}`, { ...loopbackOAuthOptions, cookie });
      assert.equal(res.status, 302);
      assert.match(res.getHeader('location'), /spotify=error&code=state_mismatch/);
      assert.equal(responseCookie(res, 'tt_spotify_session'), '');
    }
  }
  assert.equal(calls.length, 0);
});

test('provider denial and token exchange failure return to localhost without claiming an account', async () => {
  for (const denied of [true, false]) {
    const { context, calls } = harness(async () => json({ error: 'invalid_grant' }, 400), { env: localOAuthEnv });
    const flow = await beginLocalOAuth(context, '/agenda');
    const callback = await request(context, `/api/auth/spotify/callback?${denied ? 'error=access_denied' : 'code=bad-code'}&state=${flow.state}`, {
      ...loopbackOAuthOptions, cookie: flow.callbackCookie,
    });
    assert.equal(callback.getHeader('location'), `http://localhost:3002/agenda?spotify=error&code=${denied ? 'access_denied' : 'token_exchange_failed'}`);
    assert.equal(responseCookie(callback, 'tt_spotify_session'), '');
    const session = await request(context, '/api/auth/spotify/session', { ...localhostOAuthOptions, cookie: flow.originalCookie });
    assert.equal(session.json().connected, false);
    assert.equal(calls.length, denied ? 0 : 1);
  }
});

test('unsafe or oversized OAuth return paths are sanitized and valid local paths retain query and fragment', async () => {
  for (const returnTo of ['https://evil.example/', '//evil.example/', '/\\evil.example/', '/\nunsafe', `/${'x'.repeat(2048)}`]) {
    const { context } = harness(oauthFixtureProvider, { env: localOAuthEnv });
    const flow = await beginLocalOAuth(context, returnTo);
    const callback = await request(context, `/api/auth/spotify/callback?code=fixture-code&state=${flow.state}`, {
      ...loopbackOAuthOptions, cookie: flow.callbackCookie,
    });
    assert.equal(callback.getHeader('location'), 'http://localhost:3002/api/auth/spotify/complete');
    const completed = await request(context, '/api/auth/spotify/complete', { ...localhostOAuthOptions, cookie: flow.originalCookie });
    assert.equal(completed.getHeader('location'), '/?spotify=connected');
  }
});

test('pending local sessions expire after thirty seconds and the handoff store is bounded without evicting active logins', async () => {
  const { context } = harness(oauthFixtureProvider, { env: localOAuthEnv });
  const flow = await beginLocalOAuth(context);
  await request(context, `/api/auth/spotify/callback?code=fixture-code&state=${flow.state}`, {
    ...loopbackOAuthOptions, cookie: flow.callbackCookie,
  });
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', context), 1);
  const future = Date.now() + 31000;
  vm.runInContext(`Date.now = () => ${future}`, context);
  const expired = await request(context, '/api/auth/spotify/complete', { ...localhostOAuthOptions, cookie: flow.originalCookie });
  assert.equal(expired.getHeader('location'), '/?fixture=return&spotify=error&code=state_mismatch#map');
  assert.equal(responseCookie(expired, 'tt_spotify_session'), '');
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', context), 0);

  const bounded = harness(oauthFixtureProvider, { env: localOAuthEnv });
  for (let index = 0; index < 128; index += 1) {
    assert.equal(bounded.context.saveSpotifyLocalHandoff(`fixture-${index}`, 'http://localhost:3002', fixtureOAuthSession), true);
  }
  assert.equal(bounded.context.saveSpotifyLocalHandoff('overflow', 'http://localhost:3002', fixtureOAuthSession), false);
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', bounded.context), 128);
  const overflowingFlow = await beginLocalOAuth(bounded.context);
  const rejected = await request(bounded.context, `/api/auth/spotify/callback?code=fixture-code&state=${overflowingFlow.state}`, {
    ...loopbackOAuthOptions, cookie: overflowingFlow.callbackCookie,
  });
  assert.equal(rejected.getHeader('location'), 'http://localhost:3002/?fixture=return&spotify=error&code=login_busy#map');
  assert.equal(responseCookie(rejected, 'tt_spotify_session'), '');
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', bounded.context), 128);
  vm.runInContext(`Date.now = () => ${Date.now() + 31000}`, bounded.context);
  bounded.context.pruneSpotifyLocalHandoffs();
  assert.equal(vm.runInContext('spotifyLocalHandoffs.size', bounded.context), 0);
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
