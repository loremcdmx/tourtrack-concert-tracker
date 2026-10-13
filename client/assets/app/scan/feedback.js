'use strict';

function setProgress(msg, pct) {
  if (typeof document === 'undefined') return;
  const fill = document.getElementById('loadbar-fill');
  if (fill && Number.isFinite(pct)) fill.style.width = pct + '%';
  const progress = document.getElementById('hd-progress');
  if (progress) progress.textContent = msg;
  const cardActive = typeof ScanProgress !== 'undefined' && ScanProgress.isActive();
  const message = document.getElementById('hd-msg');
  if (!cardActive && !scanAborted && msg && message) message.textContent = msg;
}

function setStatus(msg, live) {
  if (typeof document === 'undefined') return;
  const message = document.getElementById('hd-msg');
  if (message) message.textContent = msg;
  const pulse = document.getElementById('pulse');
  if (pulse) pulse.className = 'pulse' + (live ? ' live' : '');
}

function softNotice(msg, tone = 'warn', opts = {}) {
  const text = String(msg || '');
  const live = tone === 'ok';
  setStatus(text, live);
  if (typeof dblog === 'function') {
    const level = tone === 'error' ? 'error' : live ? 'ok' : 'warn';
    dblog(level, text);
  }
  const focusId = opts && opts.focusId;
  if (focusId) {
    const el = document.getElementById(focusId);
    if (el && typeof el.focus === 'function') el.focus();
  }
}
