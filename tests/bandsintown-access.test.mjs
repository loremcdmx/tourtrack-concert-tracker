import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

function fixture(fetchImpl, { managed = true, deadlineMs = null } = {}) {
  const records = new Map();
  const calls = [];
  const writes = [];
  const reads = [];
  const timers = new Set();
  const f = { scope: 'world', records, calls, writes, reads, timers };
  const context = vm.createContext({
    window: { __SERVER_CONFIG__: { bandsintownManaged: managed } },
    AbortController, URL, encodeURIComponent,
    countryHash: () => f.scope,
    countryAllowed: country => f.scope === 'world' || f.scope === `include:${country}`,
    getScanContext: () => ({ cHash: f.scope }),
    isScanRunCurrent: run => run?.cHash === f.scope,
    _isoDateOnly: () => '2026-10-12', dblog() {}, setProgress() {},
    buildConcertFromBandsintownEvent: (artist, event) => ({ ...event, artist }),
    DB: {
      async get(store, key) { reads.push([store, key]); return records.get(key); },
      async put(store, key, value) { writes.push([store, key, value]); records.set(key, value); },
    },
    async fetch(url, options) { calls.push({ url, options }); return fetchImpl(url, options); },
    setTimeout(callback, delay) {
      const id = setTimeout(callback, deadlineMs === null ? delay : Math.min(delay, deadlineMs));
      timers.add(id);
      return id;
    },
    clearTimeout(id) { clearTimeout(id); timers.delete(id); },
  });
  for (const file of ['scan/providers.js', 'scan/shared/preflight.js']) {
    vm.runInContext(readFileSync(new URL(`../client/assets/app/${file}`, import.meta.url), 'utf8'), context, { filename: file });
  }
  return { ...f, context, setScope(value) { f.scope = value; } };
}

const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, async json() { return data; } });

test('missing approved access silently skips requests and legacy cache reads', async () => {
  const f = fixture(() => assert.fail('no provider request without approved access'), { managed: false });
  f.records.set('bit_pf_muse', { ts: Date.now(), shows: [] });
  assert.equal(await f.context.fetchBIT('Muse', '2026-10-12'), null);
  assert.equal((await f.context.bitPreFlightScan(['Muse'])).size, 0);
  assert.equal(f.reads.length, 0);
  assert.equal(f.writes.length, 0);
});

test('an approved request uses only the same-origin proxy and server placeholder', async () => {
  const f = fixture(async () => response([]));
  assert.deepEqual(Array.from(await f.context.fetchBIT('Fall Out Boy', '2026-10-12')), []);
  const { url, options } = f.calls[0];
  assert.ok(url.startsWith('/api/proxy?url='));
  const target = new URL(new URL(url, 'https://tracker.example').searchParams.get('url'));
  assert.equal(target.hostname, 'rest.bandsintown.com');
  assert.equal(target.pathname, '/artists/Fall%20Out%20Boy/events');
  assert.equal(target.searchParams.get('app_id'), '__SERVER__');
  assert.equal(options.credentials, 'same-origin');
  assert.equal(f.timers.size, 0);
});

for (const status of [401, 403, 429, 500, 501, 503]) {
  test(`HTTP ${status} remains unknown and never enters the empty-result cache`, async () => {
    const f = fixture(async () => response(null, status));
    const result = await f.context.bitPreFlightScan(['Muse']);
    assert.equal(result.has('Muse'), false);
    assert.equal(f.writes.length, 0);
    assert.equal(f.timers.size, 0);
  });
}

test('a provider refusal stops dispatching beyond the eight already-running workers', async () => {
  const f = fixture(async () => response(null, 403));
  const result = await f.context.bitPreFlightScan(Array.from({ length: 24 }, (_, i) => `Artist ${i}`));
  assert.equal(result.size, 0);
  assert.equal(f.calls.length, 8);
  assert.equal(f.writes.length, 0);
  assert.equal(f.context.window._bitBlocked, true);
});

for (const kind of ['invalid-json', 'non-array', 'network']) {
  test(`${kind} responses do not become confirmed empty results`, async () => {
    const f = fixture(async () => {
      if (kind === 'network') throw new TypeError('Failed to fetch');
      if (kind === 'non-array') return response({ error: 'invalid artist' });
      return { ok: true, status: 200, async json() { throw new SyntaxError('invalid JSON'); } };
    });
    assert.equal((await f.context.bitPreFlightScan(['Muse'])).size, 0);
    assert.equal(f.writes.length, 0);
    assert.equal(f.timers.size, 0);
  });
}

test('the deadline covers a body stalled after successful HTTP headers', { timeout: 1000 }, async () => {
  let aborted = false;
  const f = fixture(async (_url, options) => ({
    ok: true, status: 200,
    json: () => new Promise((_resolve, reject) => {
      const abort = () => { aborted = true; reject(options.signal.reason); };
      if (options.signal.aborted) abort();
      else options.signal.addEventListener('abort', abort, { once: true });
    }),
  }), { deadlineMs: 20 });
  assert.equal((await f.context.bitPreFlightScan(['Muse'])).size, 0);
  assert.equal(aborted, true);
  assert.equal(f.writes.length, 0);
  assert.equal(f.timers.size, 0);
});

test('a genuine empty success is cached and reused without another request', async () => {
  const f = fixture(async () => response([]));
  const first = await f.context.bitPreFlightScan(['Muse']);
  assert.equal(first.has('Muse'), true);
  assert.deepEqual(Array.from(first.get('Muse')), []);
  assert.equal(f.writes.length, 1);
  const [, key, saved] = f.writes[0];
  assert.ok(key.startsWith('bit_pf_v2_'));
  assert.equal(saved.version, 2);
  assert.equal(saved.cHash, 'world');
  assert.equal((await f.context.bitPreFlightScan(['Muse'])).has('Muse'), true);
  assert.equal(f.calls.length, 1);
});

test('old unverified empty records are ignored even when their timestamp is fresh', async () => {
  const f = fixture(async () => response([{ id: 'real-show', country: 'MX', date: '2026-11-01' }]));
  f.records.set('bit_pf_muse', { ts: Date.now(), shows: [] });
  f.records.set('bit_pf_v2_world:muse', { ts: Date.now(), shows: [] });
  const result = await f.context.bitPreFlightScan(['Muse']);
  assert.equal(result.get('Muse').length, 1);
  assert.equal(f.calls.length, 1);
  assert.ok(f.reads.every(([, key]) => key !== 'bit_pf_muse'));
});

test('changing country scope fetches that scope and cannot reuse filtered MX-only results', async () => {
  const events = [{ id: 'mx', country: 'MX', date: '2026-11-01' }, { id: 'gb', country: 'GB', date: '2026-11-02' }];
  const f = fixture(async () => response(events));
  f.setScope('include:MX');
  assert.deepEqual(Array.from((await f.context.bitPreFlightScan(['Muse'])).get('Muse'), show => show.id), ['mx']);
  f.setScope('world');
  assert.deepEqual(Array.from((await f.context.bitPreFlightScan(['Muse'])).get('Muse'), show => show.id), ['mx', 'gb']);
  assert.equal(f.calls.length, 2);
  assert.equal(f.writes.length, 2);
  assert.notEqual(f.writes[0][1], f.writes[1][1]);
  f.setScope('include:MX');
  assert.deepEqual(Array.from((await f.context.bitPreFlightScan(['Muse'])).get('Muse'), show => show.id), ['mx']);
  assert.equal(f.calls.length, 2);
});

test('a scope changed while the body arrives cannot cache or expose the old response', async () => {
  let release;
  let started;
  const bodyStarted = new Promise(resolve => { started = resolve; });
  const f = fixture(async () => ({ ok: true, status: 200,
    json: () => { started(); return new Promise(resolve => { release = resolve; }); } }));
  const pending = f.context.bitPreFlightScan(['Muse']);
  await bodyStarted;
  f.setScope('include:MX');
  release([{ id: 'gb', country: 'GB', date: '2026-11-02' }]);
  assert.equal((await pending).size, 0);
  assert.equal(f.writes.length, 0);
  assert.equal(f.timers.size, 0);
});
