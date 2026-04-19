'use strict';

function setProgress(msg, pct) {
  document.getElementById('loadbar-fill').style.width = pct + '%';
  document.getElementById('hd-progress').textContent = msg;
  if (!scanAborted && msg) document.getElementById('hd-msg').textContent = msg;
}

function setStatus(msg, live) {
  document.getElementById('hd-msg').textContent = msg;
  document.getElementById('pulse').className = 'pulse' + (live ? ' live' : '');
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
