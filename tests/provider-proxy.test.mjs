import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';

const serverPath = fileURLToPath(new URL('../server/index.js', import.meta.url));
const source = readFileSync(serverPath, 'utf8');
const nativeRequire = createRequire(import.meta.url);
const target = 'https://rest.bandsintown.com/artists/Fixture/events?app_id=__SERVER__&date=upcoming';
const route = url => '/api/proxy?url=' + encodeURIComponent(url);

function harness(fetchImpl, { appId = '', timeoutMs = null } = {}) {
  const calls = [];
  const fakeRequire = name => name === 'node:fs'
    ? { ...nativeRequire(name), existsSync() { return false; }, readFileSync() { throw new Error('No environment file reads'); } }
    : nativeRequire(name);
  fakeRequire.main = null;
  const context = vm.createContext({
    require: fakeRequire, module: { exports: {} }, __dirname: dirname(serverPath),
    process: { env: { PORT: '0', BANDSINTOWN_APP_ID: appId } },
    Buffer, URL, URLSearchParams, Headers, AbortController,
    setTimeout: timeoutMs === null ? setTimeout : (fn, ms) => setTimeout(fn, Math.min(ms, timeoutMs)),
    clearTimeout, console: { warn() {}, error() {} },
    fetch: async (url, options) => { calls.push({ url: String(url), options }); return fetchImpl(url, options); },
  });
  vm.runInContext(source, context, { filename: serverPath });
  return { context, calls };
}

async function request(context, url, method = 'GET') {
  const headers = new Map();
  const res = {
    setHeader(k, v) { headers.set(k.toLowerCase(), v); },
    writeHead(status, values) { this.status = status; Object.entries(values).forEach(([k, v]) => this.setHeader(k, v)); },
    end(body = '') { this.body = String(body); },
  };
  await context.handleRequest({ url, method, headers: { host: 'example.test' }, socket: { remoteAddress: '203.0.113.1' } }, res);
  return { ...res, headers, json: () => JSON.parse(res.body) };
}

test('unconfigured Bandsintown is explicit and cannot send a guessed client app_id upstream', async () => {
  const { context, calls } = harness(() => { throw new Error('Must not reach the provider'); });
  for (const appId of ['__SERVER__', 'tourtrack', 'client-override']) {
    const res = await request(context, route(target.replace('__SERVER__', appId)));
    assert.equal(res.status, 501);
    assert.equal(res.json().code, 'BANDSINTOWN_NOT_CONFIGURED');
  }
  const health = await request(context, '/api/health');
  assert.equal(health.json().bandsintownManaged, false);
  assert.equal(calls.length, 0);
});

test('configured access stays server-side and authorized event requests preserve provider denial', async () => {
  const fixtureId = 'fixture-issued-access';
  const { context, calls } = harness(() => new Response('{"error":"denied"}', {
    status: 403, headers: { 'Content-Type': 'application/json' },
  }), { appId: fixtureId });
  const config = await request(context, '/config.js');
  assert.match(config.body, /"bandsintownManaged": true/);
  assert.ok(!config.body.includes(fixtureId));
  const response = await request(context, route(target.replace('__SERVER__', 'client-override')));
  assert.equal(response.status, 403);
  assert.equal(response.json().error, 'denied');
  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0].url).searchParams.get('app_id'), fixtureId);
  assert.equal(calls[0].options.redirect, 'error');
  assert.ok(!response.body.includes(fixtureId));
});

test('server Bandsintown access cannot be redirected to other paths, protocols or writes', async () => {
  const { context, calls } = harness(() => { throw new Error('Forbidden target'); }, { appId: 'fixture-issued' });
  for (const [url, method] of [
    [target.replace('https:', 'http:'), 'GET'],
    [target.replace('/artists/Fixture/events', '/arbitrary'), 'GET'],
    [target.replace('https://', 'https://user@'), 'GET'],
    [target.replace('rest.bandsintown.com', 'rest.bandsintown.com:444'), 'GET'],
    [target, 'POST'],
  ]) assert.equal((await request(context, route(url), method)).status, 403);
  assert.equal(calls.length, 0);
});

test('successful Bandsintown events do not echo the server app_id in nested ticket and artist URLs', async () => {
  const fixtureId = 'fixture-issued-access';
  const { context } = harness(() => new Response(JSON.stringify([{
    id: 'event-1', url: 'https://www.bandsintown.com/e/1?app_id=' + fixtureId + '&came_from=fixture',
    artist: { url: 'https://www.bandsintown.com/a/1?app_id=' + fixtureId },
    offers: [{ type: 'Tickets', url: 'https://www.bandsintown.com/t/1?app_id=' + fixtureId }],
    diagnostic: fixtureId,
  }]), { status: 200, headers: { 'Content-Type': 'application/json' } }), { appId: fixtureId });
  const response = await request(context, route(target));
  assert.equal(response.status, 200);
  assert.ok(!response.body.includes(fixtureId));
  const event = response.json()[0];
  assert.equal(event.id, 'event-1');
  assert.equal(new URL(event.url).searchParams.get('came_from'), 'fixture');
  for (const url of [event.url, event.artist.url, event.offers[0].url]) assert.equal(new URL(url).searchParams.has('app_id'), false);
});

test('Bandsintown deadline covers stalled response bodies without exposing the access credential', async () => {
  const { context } = harness((url, { signal }) => new Response(new ReadableStream({
    start(controller) {
      signal.addEventListener('abort', () => controller.error(new Error('fixture-issued body failure')), { once: true });
    },
  }), { status: 200 }), { appId: 'fixture-issued', timeoutMs: 5 });
  const response = await request(context, route(target));
  assert.equal(response.status, 504);
  assert.equal(response.json().error, 'Bandsintown request failed.');
  assert.ok(!response.body.includes('fixture-issued'));
});
