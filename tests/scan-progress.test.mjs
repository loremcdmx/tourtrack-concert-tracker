import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../client/assets/app/core/scan-progress.js', import.meta.url), 'utf8');

function fixture({ dom = true } = {}) {
  let now = Date.UTC(2026, 9, 13, 12);
  let timerId = 0;
  let owner = null;
  const timers = new Map();
  const nodes = new Map();
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  function node(id) {
    if (!nodes.has(id)) {
      const attributes = new Map();
      const classes = new Set();
      nodes.set(id, {
        hidden: true, textContent: '', style: {}, dataset: {}, attributes, classes,
        setAttribute(name, value) { attributes.set(name, String(value)); },
        removeAttribute(name) { attributes.delete(name); },
        classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
      });
    }
    return nodes.get(id);
  }
  const context = vm.createContext({
    Date: ClockDate,
    isScanRunOwned: run => run === owner,
    setInterval(fn, interval) {
      const id = ++timerId;
      timers.set(id, { fn, interval, next: now + interval });
      return id;
    },
    clearInterval(id) { timers.delete(id); },
    ...(dom ? { document: { getElementById: node } } : {}),
  });
  vm.runInContext(source, context, { filename: 'core/scan-progress.js' });
  const progress = vm.runInContext('ScanProgress', context);
  function advance(ms) {
    const end = now + ms;
    while (true) {
      let dueId;
      let dueAt = Infinity;
      for (const [id, timer] of timers) {
        if (timer.next <= end && timer.next < dueAt) { dueId = id; dueAt = timer.next; }
      }
      if (dueId === undefined) break;
      now = dueAt;
      const timer = timers.get(dueId);
      timer.next += timer.interval;
      timer.fn();
    }
    now = end;
  }
  function begin(kind = 'concert-scan') {
    const run = { id: Symbol(kind) };
    owner = run;
    progress.begin(run, kind);
    return run;
  }
  function step(run, total = 12, stage = 'artists') {
    progress.step(run, { stage, title: `Checking ${stage}`, detail: 'Working', total,
      unit: 'artists', next: 'Then check festivals' });
  }
  function sample(run, done, ms = 2000) {
    advance(ms);
    progress.count(run, done, { remote: true });
  }
  return { progress, nodes, timers, begin, step, sample, advance, now: () => now,
    invalidate() { owner = null; } };
}

test('a new search is indeterminate until its work and remote pace are known', () => {
  const f = fixture();
  const run = f.begin();
  const view = f.progress.snapshot();
  assert.equal(view.stage, 'preparation');
  assert.equal(view.status, 'running');
  assert.equal(view.total, null);
  assert.equal(view.done, 0);
  assert.equal(view.etaSeconds, null);
  assert.equal(view.elapsedSeconds, 0);
  assert.equal(f.timers.size, 1);
  assert.ok(f.nodes.get('scan-progress-track').classes.has('is-indeterminate'));
  assert.equal(f.nodes.get('scan-progress-track').attributes.has('aria-valuenow'), false);
  assert.equal(f.progress.isActive(run), true);
});

test('repaints and elapsed-clock ticks cannot become remote completions', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  for (let i = 0; i < 100; i++) {
    f.advance(1000);
    f.progress.detail(run, `Request still running: ${i}`);
    f.progress.count(run, 0, { remote: true });
  }
  const view = f.progress.snapshot();
  assert.equal(view.elapsedSeconds, 100);
  assert.equal(view.done, 0);
  assert.equal(view.remoteCompleted, 0);
  assert.equal(view.sampleCount, 0);
  assert.equal(view.etaSeconds, null);
  assert.equal(f.nodes.get('scan-eta').textContent, 'Estimating…');
});

test('a fast cache burst does not make slow remote work look nearly finished', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 1000);
  f.advance(200);
  f.progress.count(run, 400);
  assert.equal(f.progress.snapshot().etaSeconds, null);
  f.sample(run, 401);
  f.sample(run, 402);
  f.sample(run, 403);
  const view = f.progress.snapshot();
  assert.equal(view.done, 403);
  assert.equal(view.remoteCompleted, 3);
  assert.equal(view.sampleCount, 3);
  // The remaining 597 remote units at the observed two seconds each need 19m54s.
  assert.equal(view.etaSeconds, 1194);
  assert.ok(f.nodes.get('scan-eta').textContent.includes('19m 54s'));
});

test('an absolute counter jump records one remote completion, not its cached delta', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 1000);
  f.sample(run, 400);
  f.sample(run, 700);
  assert.equal(f.progress.snapshot().remoteCompleted, 2);
  assert.equal(f.progress.snapshot().sampleCount, 2);
  assert.equal(f.progress.snapshot().etaSeconds, null);
  f.sample(run, 701);
  assert.equal(f.progress.snapshot().etaSeconds, 598);
});

test('low sample counts and very short remote bursts keep ETA unknown', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.sample(run, 1, 1000);
  f.sample(run, 2, 1000);
  assert.equal(f.progress.snapshot().etaSeconds, null);
  f.sample(run, 3, 500);
  assert.equal(f.progress.snapshot().etaSeconds, null);
  assert.equal(f.progress.snapshot().sampleCount, 3);
});

test('a known slow pace supports a finite multi-hour ETA without truncation', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 10000);
  f.sample(run, 1, 3000);
  f.sample(run, 2, 3000);
  f.sample(run, 3, 3000);
  const view = f.progress.snapshot();
  assert.equal(view.etaSeconds, 29991);
  assert.ok(Number.isSafeInteger(view.etaSeconds));
  assert.ok(f.nodes.get('scan-eta').textContent.includes('8h 19m'));
});

test('duplicate and invalid counters do not increase completed work or rate', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 100);
  f.sample(run, 1);
  for (const done of [1, 0, -1, NaN, Infinity]) {
    f.advance(1000);
    assert.equal(f.progress.count(run, done, { remote: true }), false);
  }
  const view = f.progress.snapshot();
  assert.equal(view.done, 1);
  assert.equal(view.sampleCount, 1);
  assert.equal(view.remoteCompleted, 1);
  assert.equal(view.etaSeconds, null);
});

test('counts clamp to the phase total and replaying overflow does not add samples', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 5);
  f.sample(run, 100);
  f.sample(run, 101);
  const view = f.progress.snapshot();
  assert.equal(view.done, 5);
  assert.equal(view.remoteCompleted, 1);
  assert.equal(view.sampleCount, 1);
  assert.equal(view.etaSeconds, 0);
  assert.equal(f.nodes.get('scan-progress-fill').style.width, '100%');
  assert.equal(f.nodes.get('scan-progress-track').attributes.get('aria-valuenow'), '5');
  assert.equal(view.status, 'running');
});

test('stalled work ages out its old pace instead of retaining a stale ETA forever', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  assert.equal(f.progress.snapshot().etaSeconds, 18);
  f.advance(61000);
  const view = f.progress.snapshot();
  assert.equal(view.done, 3);
  assert.equal(view.remoteCompleted, 3);
  assert.equal(view.sampleCount, 0);
  assert.equal(view.etaSeconds, null);
});

test('provider cooldown hides ETA, keeps real elapsed time, and discards its old pace', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  f.progress.pause(run, 'Provider cooldown', { key: 'rate-limit', until: f.now() + 20000 });
  f.advance(19000);
  let view = f.progress.snapshot();
  assert.equal(view.pause, 'Provider cooldown');
  assert.equal(view.etaSeconds, null);
  assert.equal(view.done, 3);
  assert.equal(view.elapsedSeconds, 25);
  assert.equal(f.nodes.get('scan-status').dataset.state, 'paused');
  f.advance(1000);
  view = f.progress.snapshot();
  assert.equal(view.pause, null);
  assert.equal(view.sampleCount, 0);
  assert.equal(view.etaSeconds, null);
  f.sample(run, 4);
  f.sample(run, 5);
  assert.equal(f.progress.snapshot().etaSeconds, null);
  f.sample(run, 6);
  assert.equal(f.progress.snapshot().etaSeconds, 12);
});

test('an indefinite network pause cannot count down to completion', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  f.progress.pause(run, 'Network paused', { key: 'network' });
  f.advance(120000);
  const view = f.progress.snapshot();
  assert.equal(view.pause, 'Network paused');
  assert.equal(view.done, 3);
  assert.equal(view.etaSeconds, null);
  assert.equal(view.elapsedSeconds, 126);
  assert.equal(view.status, 'running');
  assert.equal(f.nodes.get('scan-status-diagnostics').hidden, false);
  assert.equal(f.nodes.get('scan-status-stop').hidden, false);
  assert.equal(f.nodes.get('scan-detail').textContent, 'Network paused');
  assert.equal(f.nodes.get('scan-eta').textContent, 'ETA on hold');
  assert.equal([...f.nodes.values()].filter(node => node.textContent.includes('Network paused')).length, 1);
});

test('one recovery cannot release another active pause or reuse paused samples', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.progress.pause(run, 'Provider cooldown', { key: 'rate-limit' });
  f.progress.pause(run, 'Network paused', { key: 'network' });
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  assert.equal(f.progress.snapshot().sampleCount, 0);
  f.progress.resume(run, 'rate-limit');
  assert.equal(f.progress.snapshot().pause, 'Network paused');
  assert.equal(f.progress.snapshot().etaSeconds, null);
  f.progress.resume(run, 'network');
  assert.equal(f.progress.snapshot().pause, null);
  assert.equal(f.progress.snapshot().etaSeconds, null);
});

test('stage changes reset phase counters and rate but preserve whole-search elapsed time', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 3);
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  assert.equal(f.progress.snapshot().status, 'running');
  assert.equal(f.progress.isActive(run), true);
  f.step(run, 2, 'retry');
  f.advance(2000);
  f.progress.count(run, 2);
  f.step(run, 157, 'festivals');
  const view = f.progress.snapshot();
  assert.equal(view.stage, 'festivals');
  assert.equal(view.total, 157);
  assert.equal(view.done, 0);
  assert.equal(view.elapsedSeconds, 8);
  assert.equal(view.sampleCount, 0);
  assert.equal(view.remoteCompleted, 0);
  assert.equal(view.etaSeconds, null);
  assert.equal(view.status, 'running');
  assert.equal(f.nodes.get('scan-count').textContent, '0 / 157 artists');
});

test('zero or unknown phase totals never fabricate a successful whole search', () => {
  const f = fixture();
  const run = f.begin('festivals');
  f.step(run, 0);
  let view = f.progress.snapshot();
  assert.equal(view.etaSeconds, 0);
  assert.equal(view.status, 'running');
  assert.equal(f.nodes.get('scan-progress-fill').style.width, '0%');
  f.progress.step(run, { stage: 'partitioning', title: 'Checking search partitions' });
  view = f.progress.snapshot();
  assert.equal(view.total, null);
  assert.equal(view.etaSeconds, null);
  assert.equal(f.nodes.get('scan-progress-track').attributes.has('aria-valuemax'), false);
  assert.equal(f.nodes.get('scan-progress-track').attributes.has('aria-valuenow'), false);
  assert.equal(f.progress.isActive(run), true);
});

test('successful completion fills the bar even after a final step with no known total', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 100);
  f.progress.count(run, 73);
  f.progress.step(run, { stage: 'finishing', title: 'Saving results' });
  assert.equal(f.progress.snapshot().total, null);
  assert.equal(f.nodes.get('scan-progress-fill').style.width, '73%');
  f.progress.finish(run, 'complete');
  assert.equal(f.progress.snapshot().total, null);
  assert.equal(f.progress.snapshot().done, 0);
  assert.equal(f.nodes.get('scan-progress-fill').style.width, '100%');
  assert.equal(f.nodes.get('scan-progress-track').attributes.get('aria-valuemax'), '100');
  assert.equal(f.nodes.get('scan-progress-track').attributes.get('aria-valuenow'), '100');
  assert.equal(f.nodes.get('scan-progress-track').classes.has('is-indeterminate'), false);
});

test('partial completion preserves progress through a final step with no known total', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run, 100);
  f.progress.count(run, 73);
  f.progress.step(run, { stage: 'finishing', title: 'Saving available results' });
  f.progress.finish(run, 'partial');
  assert.equal(f.progress.snapshot().status, 'partial');
  assert.equal(f.nodes.get('scan-progress-fill').style.width, '73%');
  assert.equal(f.nodes.get('scan-progress-track').attributes.has('aria-valuenow'), false);
  assert.equal(f.nodes.get('scan-progress-track').classes.has('is-indeterminate'), false);
});

for (const [outcome, status] of [['complete', 'complete'], ['partial', 'partial'],
  ['stopped', 'partial'], ['superseded', 'partial'], ['error', 'error']]) {
  test(`${outcome} freezes elapsed time, clears the timer and retains the actual phase count`, () => {
    const f = fixture();
    const run = f.begin();
    f.step(run, 100);
    f.advance(4500);
    f.progress.count(run, 7);
    assert.equal(f.progress.finish(run, outcome, { detail: 'Results kept' }), true);
    assert.equal(f.timers.size, 0);
    assert.equal(f.progress.isActive(run), false);
    f.advance(7200000);
    const view = f.progress.snapshot();
    assert.equal(view.status, status);
    assert.equal(view.outcome, outcome);
    assert.equal(view.done, 7);
    assert.equal(view.elapsedSeconds, 4);
    assert.equal(view.etaSeconds, null);
    assert.equal(view.pause, null);
    assert.equal(f.nodes.get('scan-status-stop').hidden, true);
    assert.equal(f.nodes.get('scan-status-dismiss').hidden, false);
    assert.equal(f.nodes.get('scan-eta').textContent, '');
    assert.equal(f.progress.count(run, 99, { remote: true }), false);
    assert.equal(f.progress.finish(run, 'complete'), false);
    assert.equal(f.progress.snapshot().done, 7);
  });
}

test('late callbacks from a replaced generation cannot repaint or finish its successor', () => {
  const f = fixture();
  const old = f.begin();
  f.step(old);
  f.advance(5000);
  const current = f.begin('festivals');
  f.step(current, 157, 'festivals');
  f.advance(1000);
  const before = JSON.stringify(f.progress.snapshot());
  assert.equal(f.progress.step(old, { stage: 'late', total: 1 }), false);
  assert.equal(f.progress.count(old, 12, { remote: true }), false);
  assert.equal(f.progress.detail(old, 'Old result'), false);
  assert.equal(f.progress.pause(old, 'Old pause'), false);
  assert.equal(f.progress.resume(old), false);
  assert.equal(f.progress.finish(old, 'complete'), false);
  assert.equal(JSON.stringify(f.progress.snapshot()), before);
  assert.equal(f.nodes.get('scan-title').textContent, 'Checking festivals');
  assert.equal(f.timers.size, 1);
  assert.equal(f.progress.isActive(current), true);
  f.sample(current, 1);
  assert.equal(f.progress.snapshot().remoteCompleted, 1);
});

test('an invalidated owner can end its own card, and its timer cannot outlive ownership', () => {
  const f = fixture();
  const run = f.begin();
  f.step(run);
  f.advance(3000);
  f.invalidate();
  assert.equal(f.progress.count(run, 1, { remote: true }), false);
  assert.equal(f.progress.finish(run, 'stopped'), true);
  assert.equal(f.progress.snapshot().outcome, 'stopped');
  assert.equal(f.timers.size, 0);
  const next = f.begin();
  f.invalidate();
  f.advance(1000);
  assert.equal(f.progress.snapshot().outcome, 'superseded');
  assert.equal(f.progress.isActive(next), false);
  assert.equal(f.timers.size, 0);
});

test('dismiss is available only for a terminal summary and clears that summary', () => {
  const f = fixture();
  const run = f.begin();
  assert.equal(f.progress.dismiss(), false);
  assert.equal(f.progress.snapshot().status, 'running');
  f.progress.finish(run, 'stopped');
  assert.equal(f.progress.dismiss(), true);
  assert.equal(f.progress.snapshot(), null);
  assert.equal(f.nodes.get('scan-status').hidden, true);
  assert.equal(f.timers.size, 0);
});

test('the model remains usable without a document in non-UI scan consumers', () => {
  const f = fixture({ dom: false });
  const run = f.begin();
  f.step(run, 4);
  f.sample(run, 1);
  f.sample(run, 2);
  f.sample(run, 3);
  assert.equal(f.progress.snapshot().etaSeconds, 2);
  assert.equal(f.progress.finish(run, 'complete'), true);
  assert.equal(f.timers.size, 0);
});
