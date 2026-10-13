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
const base = 'https://api.spotify.com/v1/me/playlists';
const item = id => ({ id: `playlist-${id}`, name: `Playlist ${id}`, items: { total: id }, owner: { id: 'fixture-owner' } });
const json = body => new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });

function harness(fetchImpl, { deadlineMs = null } = {}) {
  const calls = [];
  const timers = new Set();
  const fakeRequire = name => name === 'node:fs'
    ? { ...nativeRequire(name), existsSync() { return false; }, readFileSync() { throw new Error('No environment file reads'); } }
    : nativeRequire(name);
  fakeRequire.main = null;
  const context = vm.createContext({
    require: fakeRequire, module: { exports: {} }, __dirname: dirname(serverPath),
    process: { env: { PORT: '0' } }, Buffer, URL, URLSearchParams, Headers, AbortController,
    console: { warn() {}, error() {} },
    setTimeout(callback, delay) {
      const id = setTimeout(callback, deadlineMs === null ? delay : Math.min(delay, deadlineMs));
      timers.add(id); return id;
    },
    clearTimeout(id) { clearTimeout(id); timers.delete(id); },
    async fetch(url, options) {
      calls.push({ url: String(url), options });
      assert.equal(options.headers.Authorization, 'Bearer fixture-user-access');
      return fetchImpl(String(url), options);
    },
  });
  vm.runInContext(source, context, { filename: serverPath });
  return { context, calls, timers };
}

async function rejectsIncomplete(f, expectedCalls) {
  await assert.rejects(f.context.fetchSpotifyUserPlaylists('fixture-user-access'), { status: 502, code: 'INCOMPLETE_IMPORT' });
  if (expectedCalls !== undefined) assert.equal(f.calls.length, expectedCalls);
  assert.equal(f.timers.size, 0);
}

test('seven pages load all 350 account playlists once and retain original order and metadata', async () => {
  const entries = Array.from({ length: 350 }, (_, index) => item(index + 1));
  const f = harness(async url => {
    const offset = Number(new URL(url).searchParams.get('offset') || 0);
    return json({ items: entries.slice(offset, offset + 50), offset, limit: 50, total: entries.length,
      next: offset + 50 < entries.length ? `${base}?offset=${offset + 50}&limit=50` : null });
  });
  const result = await f.context.fetchSpotifyUserPlaylists('fixture-user-access');
  assert.equal(result.length, 350);
  assert.deepEqual(Array.from(result, entry => entry.id), entries.map(entry => entry.id));
  assert.equal(new Set(Array.from(result, entry => entry.id)).size, 350);
  assert.equal(result[349].trackCount, 350);
  assert.equal(result[349].ownerName, 'fixture-owner');
  assert.equal(f.calls.length, 7);
  assert.equal(f.timers.size, 0);
});

test('single-page empty and minimal modern/legacy schemas remain valid without optional pagination fields', async () => {
  for (const entries of [[], [item(1)], [{ id: 'legacy', tracks: { total: 0 } }]]) {
    const f = harness(async () => json({ items: entries, next: null }));
    assert.equal((await f.context.fetchSpotifyUserPlaylists('fixture-user-access')).length, entries.length);
    assert.equal(f.timers.size, 0);
  }
});

for (const next of ['https://attacker.example/collect?offset=1&limit=50',
  'http://api.spotify.com/v1/me/playlists?offset=1&limit=50',
  'https://user@api.spotify.com/v1/me/playlists?offset=1&limit=50',
  'https://api.spotify.com:444/v1/me/playlists?offset=1&limit=50',
  'https://api.spotify.com/v1/me/profile?offset=1&limit=50',
  `${base}?offset=1&limit=50#fragment`, `${base}?offset=1&limit=500`,
  `${base}?offset=-1&limit=50`, `${base}?offset=2&limit=50`]) {
  test(`unsafe or non-progressing continuation is rejected before another provider call: ${next}`, async () => {
    const f = harness(async () => json({ items: [item(1)], next }));
    await rejectsIncomplete(f, 1);
  });
}

test('a continuation cycle never produces a partial successful list', async () => {
  const f = harness(async () => json({ items: [item(1)], next: `${base}?limit=50` }));
  await rejectsIncomplete(f, 1);
});

test('duplicate IDs across pages fail instead of silently hiding a changed account list', async () => {
  let calls = 0;
  const f = harness(async () => json({ items: [item(1)], total: 2,
    next: calls++ === 0 ? `${base}?offset=1&limit=50` : null }));
  await rejectsIncomplete(f, 2);
});

for (const total of [-1, 1.5, '1', null, Number.MAX_SAFE_INTEGER + 1, 5001]) {
  test(`invalid or over-budget total ${String(total)} is explicit failure, never partial success`, async () => {
    const f = harness(async () => json({ items: [item(1)], total, next: null }));
    await rejectsIncomplete(f, 1);
  });
}

test('changed totals and premature final pages fail rather than returning an incomplete list', async () => {
  let calls = 0;
  const changed = harness(async () => {
    calls++;
    return json({ items: [item(calls)], total: calls === 1 ? 2 : 3,
      next: calls === 1 ? `${base}?offset=1&limit=50` : null });
  });
  await rejectsIncomplete(changed, 2);
  const premature = harness(async () => json({ items: [item(1)], total: 2, next: null }));
  await rejectsIncomplete(premature, 1);
});

test('empty intermediate pages and malformed pagination cannot certify complete account data', async () => {
  for (const page of [
    { items: [], next: `${base}?offset=0&limit=50` },
    { items: [item(1)], next: null, offset: 5 },
    { items: [item(1)], next: null, limit: 20 },
    { items: [item(1)], next: '' }, { items: [item(1)] },
  ]) await rejectsIncomplete(harness(async () => json(page)), 1);
});

test('a hundred-page guard fails before page 101 without returning the first hundred playlists', async () => {
  let page = 0;
  const f = harness(async () => {
    page++;
    return json({ items: [item(page)], next: `${base}?offset=${page}&limit=50` });
  });
  await rejectsIncomplete(f, 100);
});

test('overall list deadline aborts a stalled body and returns an explicit incomplete timeout', { timeout: 1000 }, async () => {
  let aborted = false;
  const f = harness(async (_url, { signal }) => ({ ok: true,
    json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => { aborted = true; reject(signal.reason); }, { once: true });
    }),
  }), { deadlineMs: 10 });
  await assert.rejects(f.context.fetchSpotifyUserPlaylists('fixture-user-access'), { status: 504, code: 'INCOMPLETE_IMPORT' });
  assert.equal(aborted, true);
  assert.equal(f.calls.length, 1);
  assert.equal(f.timers.size, 0);
});
