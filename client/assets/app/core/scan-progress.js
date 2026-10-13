'use strict';

const ScanProgress = (() => {
  let state = null;
  let timer = null;
  const node = id => typeof document !== 'undefined' ? document.getElementById(id) : null;
  const owned = run => !!state && state.run === run
    && (typeof isScanRunOwned !== 'function' || isScanRunOwned(run));
  const current = run => owned(run) && state.active;
  const clearTimer = () => {
    if (timer !== null && typeof clearInterval === 'function') clearInterval(timer);
    timer = null;
  };
  const duration = seconds => seconds >= 3600 ? `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`
    : seconds >= 60 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`;
  const text = (id, value) => { const element = node(id); if (element) element.textContent = value; };

  function pauseMessage(now) {
    if (!state) return '';
    const hadPauses = state.pauses.size > 0;
    for (const [key, pause] of state.pauses) if (pause.until !== null && pause.until <= now) state.pauses.delete(key);
    if (hadPauses && !state.pauses.size) state.samples = [];
    return [...state.pauses.values()][0]?.text || '';
  }

  function snapshot() {
    if (!state) return null;
    const now = state.active ? Date.now() : state.endedAt;
    const pause = pauseMessage(now);
    state.samples = state.samples.filter(time => time >= now - 60000);
    let etaSeconds = null;
    const remaining = state.total === null ? null : Math.max(0, state.total - state.done);
    if (state.active && !pause && remaining !== null) {
      if (!remaining) etaSeconds = 0;
      else if (state.samples.length >= 3) {
        const elapsed = now - state.samples[0];
        if (elapsed >= 3000) etaSeconds = Math.ceil(remaining * elapsed / ((state.samples.length - 1) * 1000));
      }
    }
    return { status: state.status, outcome: state.outcome, stage: state.stage, title: state.title,
      detail: state.detail, total: state.total, done: state.done, unit: state.unit, next: state.next,
      elapsedSeconds: Math.max(0, Math.floor((now - state.startedAt) / 1000)), etaSeconds,
      pause: pause || null, sampleCount: state.samples.length, remoteCompleted: state.remoteCompleted };
  }

  function render() {
    const view = snapshot();
    const card = node('scan-status');
    if (!view || !card) return;
    card.hidden = false;
    if (card.dataset) card.dataset.state = view.pause ? 'paused' : view.status;
    text('scan-title', view.title);
    text('scan-detail', view.pause || view.detail);
    text('scan-count', view.total === null ? '' : `${view.done} / ${view.total} ${view.unit}`);
    text('scan-eta', !state.active ? '' : view.pause ? 'ETA on hold'
      : view.etaSeconds === null ? 'Estimating…' : `About ${duration(view.etaSeconds)} for this step`);
    text('scan-elapsed', `${duration(view.elapsedSeconds)} elapsed`);
    text('scan-next-step', state.active ? view.next : '');
    const track = node('scan-progress-track');
    const complete = view.status === 'complete';
    const determinate = complete || view.total !== null && view.total > 0;
    if (track) {
      track.classList?.toggle('is-indeterminate', state.active && !determinate);
      track.setAttribute?.('aria-valuemin', '0');
      if (determinate) {
        track.setAttribute?.('aria-valuemax', String(complete ? 100 : view.total));
        track.setAttribute?.('aria-valuenow', String(complete ? 100 : view.done));
      } else {
        track.removeAttribute?.('aria-valuemax'); track.removeAttribute?.('aria-valuenow');
      }
    }
    const fill = node('scan-progress-fill');
    if (fill?.style) fill.style.width = `${complete ? 100 : state.progressPercent}%`;
    const stop = node('scan-status-stop');
    if (stop) stop.hidden = !state.active;
    const dismiss = node('scan-status-dismiss');
    if (dismiss) dismiss.hidden = state.active;
    const diagnostics = node('scan-status-diagnostics');
    if (diagnostics) diagnostics.hidden = !view.pause || !/network/i.test(view.pause);
  }

  function finish(run, outcome = 'complete', options = {}) {
    if (!state || state.run !== run || !state.active) return false;
    state.active = false;
    state.endedAt = Date.now();
    state.outcome = outcome;
    state.status = outcome === 'error' ? 'error' : ['stopped', 'superseded', 'partial'].includes(outcome) ? 'partial' : 'complete';
    state.title = outcome === 'error' ? 'Scan could not finish' : outcome === 'stopped' ? 'Scan stopped'
      : outcome === 'superseded' ? 'Search changed' : outcome === 'partial' ? 'Partial results saved' : 'Scan complete';
    state.detail = options.detail || (outcome === 'superseded' ? 'The previous search has ended.'
      : outcome === 'error' ? 'Your available results are kept. Try again when you are ready.'
      : outcome === 'stopped' ? 'Showing the results found before you stopped.' : state.detail);
    state.pauses.clear();
    clearTimer();
    render();
    return true;
  }

  function begin(run, kind = 'concert-scan') {
    clearTimer();
    state = { run, active: true, status: 'running', outcome: null, stage: 'preparation', title: 'Preparing your search',
      detail: kind === 'festivals' ? 'Preparing festival searches.' : 'Loading saved artist information.',
      total: null, done: 0, unit: '', next: '', startedAt: Date.now(), endedAt: null,
      samples: [], remoteCompleted: 0, pauses: new Map(), progressPercent: 0 };
    render();
    if (typeof setInterval === 'function') timer = setInterval(() => {
      if (!state?.active) return;
      if (!owned(state.run)) { finish(state.run, 'superseded'); return; }
      render();
    }, 1000);
  }

  function step(run, options) {
    if (!current(run)) return false;
    state.stage = options.stage || 'preparation'; state.title = options.title || 'Preparing your search';
    state.detail = options.detail || ''; state.total = Number.isFinite(options.total) ? Math.max(0, options.total) : null;
    state.done = 0; state.unit = options.unit || ''; state.next = options.next || '';
    if (state.total !== null) state.progressPercent = 0;
    state.samples = []; state.remoteCompleted = 0; state.pauses.clear();
    render(); return true;
  }

  function count(run, done, { remote = false } = {}) {
    if (!current(run) || !Number.isFinite(done) || done <= state.done) return false;
    const next = state.total === null ? done : Math.min(state.total, done);
    if (next <= state.done) return false;
    state.done = next;
    if (state.total > 0) state.progressPercent = Math.min(100, state.done / state.total * 100);
    // One call comes from one completed remote unit. The absolute counter can
    // also jump over cached/skipped units; those must never inflate throughput.
    if (remote) {
      state.remoteCompleted++;
      if (!pauseMessage(Date.now())) state.samples.push(Date.now());
    }
    render(); return true;
  }

  function detail(run, value) {
    if (!current(run)) return false;
    state.detail = value || ''; render(); return true;
  }
  function pause(run, value, { key = 'wait', until = null } = {}) {
    if (!current(run)) return false;
    state.samples = [];
    state.pauses.set(key, { text: value, until: Number.isFinite(until) ? until : null });
    render(); return true;
  }
  function resume(run, key = 'wait') {
    if (!current(run)) return false;
    if (state.pauses.delete(key) && !state.pauses.size) state.samples = [];
    render(); return true;
  }
  function dismiss() {
    if (state?.active) return false;
    clearTimer(); state = null;
    const card = node('scan-status'); if (card) card.hidden = true;
    return true;
  }
  return { begin, step, count, detail, pause, resume, finish, dismiss, snapshot,
    isActive: run => !!state?.active && (!run || current(run)) };
})();

function dismissScanProgress() { return ScanProgress.dismiss(); }
