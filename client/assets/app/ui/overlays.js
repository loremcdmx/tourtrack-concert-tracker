'use strict';

function openFestDetail(festId) {
  const f = festivals.find(x => x.id === festId);
  if (!f) return;

  const today = new Date().toISOString().split('T')[0];
  const score    = f.score  || 0;
  const matched  = (f.matched || []).slice().sort((a, b) => b.weight - a.weight);
  const lineup   = (f.lineup || []);

  // The "untracked" list: lineup members not in matched (case-insensitive).
  const trackedNames = new Set(matched.map(m => m.artist.toLowerCase()));
  const untracked = lineup.filter(n => n && !trackedNames.has(n.toLowerCase()));

  // Visual accent depends on score tier
  const accentCol = score >= 70 ? 'var(--accent)'
                  : score >= 30 ? 'var(--fest)'
                  : 'var(--muted)';
  const ringCls = score >= 70 ? 'top' : score > 0 ? '' : 'none';
  const ringLabel = score > 0 ? score : '—';

  // Max weight across matched artists — used to normalise play bars
  const maxW = matched.length ? matched[0].weight : 1;

  const loc = [f.venue, f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' · ');

  // ── Hero section ──────────────────────────────────────────────
  document.getElementById('fd-hero').innerHTML = `
    <button class="fd-close" onclick="closeFestDetail()">✕</button>
    <div class="fd-hero-top">
      <div class="fd-score-ring ${ringCls}">${ringLabel}</div>
      <div class="fd-title-block">
        <div class="fd-name">${esc(f.name)}</div>
        <div class="fd-meta">
          <span class="fd-meta-pill">📅 ${fmtDate(f.date)}</span>
          <span class="fd-meta-pill">📍 ${esc(loc)}</span>
          ${matched.length ? `<span class="fd-meta-pill" style="border-color:${accentCol};color:${accentCol}">★ ${matched.length} of your artists</span>` : ''}
        </div>
        <div style="margin-top:8px">
          ${f.url ? `<a class="fd-tkt-btn" href="${f.url}" target="_blank">🎟 Tickets →</a>` : ''}
          <button class="fd-map-btn" onclick="closeFestDetail();clearMapLayers();renderFestMap('${f.id}')">🗺 View on map</button>
        </div>
      </div>
    </div>`;

  // ── Body: tracked artists ────────────────────────────────────
  let bodyHtml = '';

  if (matched.length) {
    bodyHtml += `<div class="fd-section-hd">Your artists<span>${matched.length}</span></div>`;
    matched.forEach((m, i) => {
      const col     = getColor(m.artist);
      const barPct  = Math.round(m.weight / maxW * 100);
      const playsLbl = m.plays > 0 ? `${m.plays}▶` : '';
      // Show position rank (#1, #2, …) as a subtle contextual hint
      bodyHtml += `
        <div class="fd-artist-row" onclick="closeFestDetail();focusArtist('${m.artist.replace(/'/g,"\\'")}')">
          <span class="fd-artist-rank" style="color:${accentCol}">#${i+1}</span>
          <div class="fd-artist-dot" style="background:${col}"></div>
          <div class="fd-artist-name" style="color:${col}">${esc(m.artist)}</div>
          <div class="fd-artist-bar-wrap">
            <div class="fd-artist-bar" style="width:${barPct}%;background:${col}"></div>
          </div>
          <div class="fd-artist-plays">${playsLbl}</div>
        </div>`;
    });
  }

  // ── Body: full lineup (untracked portion) ─────────────────────
  if (untracked.length) {
    if (matched.length) bodyHtml += '<div class="fd-divider"></div>';
    bodyHtml += `<div class="fd-section-hd">Full lineup<span>${lineup.length} artists</span></div>`;
    bodyHtml += '<div class="fd-lineup-grid">';
    // Sort untracked alphabetically for easy scanning
    [...untracked].sort((a, b) => a.localeCompare(b)).forEach(name => {
      bodyHtml += `<span class="fd-lineup-pill">${esc(name)}</span>`;
    });
    bodyHtml += '</div>';
  } else if (!matched.length && !lineup.length) {
    bodyHtml += '<div class="fd-empty">No lineup data available from Ticketmaster for this festival.</div>';
  }

  document.getElementById('fd-body').innerHTML = bodyHtml;

  // Open with animation
  document.getElementById('fd-overlay').classList.add('open');
  document.addEventListener('keydown', _fdKeyHandler);
}

function closeFestDetail() {
  document.getElementById('fd-overlay').classList.remove('open');
  document.removeEventListener('keydown', _fdKeyHandler);
}

function _fdKeyHandler(e) {
  if (e.key === 'Escape') closeFestDetail();
}

function renderFestMap(hlId) {
  festMarkers.forEach(m => m.remove()); festMarkers = [];
  focusedFest = hlId;
  document.querySelectorAll('.fcard').forEach(c => c.classList.toggle('hl', c.dataset.id === hlId));

  const today = new Date().toISOString().split('T')[0];
  const up = festivals.filter(f => f.date >= today && f.lat && f.lng && geoDisplayOk(f.country || ''));
  if (!up.length) return;

  const maxS = Math.max(...up.map(f => f.score||0), 1);

  up.forEach(f => {
    const score = f.score || 0, isHL = f.id === focusedFest;
    // score is 0-100; pct is 0-1 for visual sizing/coloring
    const pct = score / 100;
    const size = isHL ? 32 : score > 0 ? Math.round(10 + pct * 18) : 8;
    const col = isHL ? '#c8ff5f' : pct > .5 ? '#c8ff5f' : pct > .15 ? '#ffaa3c' : score > 0 ? '#ff8c5f' : '#3a3a42';
    const bg = isHL ? 'rgba(200,255,95,.22)' : score > 0 ? `rgba(200,170,95,${.07+pct*.13})` : 'rgba(8,8,10,.75)';
    const glow = isHL ? '0 0 16px rgba(200,255,95,.5)' : score > 0 ? '0 0 6px rgba(200,170,95,.35)' : 'none';
    const mc = (f.matched||[]).length;
    // Show score number inside marker (instead of match count)
    const inner = score > 0 ? `<span style="font-size:${Math.max(.44,.34+pct*.2)}rem;font-weight:700;font-family:'DM Mono',monospace;color:${isHL?'#08080a':col};line-height:1">${score}</span>` : '';
    const label = isHL ? `<div style="position:absolute;bottom:${size+6}px;left:50%;transform:translateX(-50%);white-space:nowrap;background:rgba(8,8,10,.96);border:1.5px solid #c8ff5f;border-radius:5px;padding:3px 9px;font-family:Syne,sans-serif;font-weight:800;font-size:.6rem;color:#c8ff5f;box-shadow:0 2px 14px rgba(0,0,0,.85);pointer-events:none">${f.name}</div>` : '';
    const totalH = size + (isHL ? size+8 : 0);

    const icon = L.divIcon({ className:'', iconSize:[size, totalH], iconAnchor:[size/2, totalH],
      html:`<div style="position:relative;width:${size}px;height:${totalH}px;display:flex;align-items:flex-end;justify-content:center">
        ${label}
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${isHL?2.5:1.5}px solid ${col};display:flex;align-items:center;justify-content:center;box-shadow:${glow};flex-shrink:0">${inner}</div>
      </div>`
    });

    const cc = f.country ? ' '+flag(f.country) : '';
    const matched = f.matched || [];
    const artistChips = matched.map(m => {
      const label = m.plays > 0 ? `${m.artist} <span style="opacity:.55;font-size:.58rem">${m.plays}</span>` : m.artist;
      return `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;margin:2px 2px 0 0;border-radius:100px;background:rgba(200,255,95,.1);border:1px solid rgba(200,255,95,.3);color:#c8ff5f;font-size:.6rem;white-space:nowrap">${label}</span>`;
    }).join('');
    const artistBlock = matched.length
      ? `<div style="margin:6px 0 4px;max-height:120px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:0">★ ${artistChips}</div>`
      : '';
    const popup = `<b style="font-family:Syne,sans-serif;color:${score>0?'#c8ff5f':'#ffaa3c'}">${f.name}</b><br>${fmtDate(f.date)} · ${f.city}${cc}<br>${f.venue?`<span style="color:var(--muted);font-size:.62rem">${f.venue}</span><br>`:''}${artistBlock}${f.url?`<a href="${f.url}" target="_blank" style="color:#ffaa3c">Tickets →</a>`:''}`;

    const mk = L.marker([f.lat, f.lng], { icon, zIndexOffset: isHL ? 1000 : Math.round(score * 5) })
      .addTo(lmap).bindPopup(popup);
    mk.on('click', () => {
      if (f.id !== focusedFest) {
        renderFestMap(f.id);
        const card = document.querySelector(`.fcard[data-id="${f.id}"]`);
        if (card) card.scrollIntoView({ behavior:'smooth', block:'nearest' });
      }
    });
    festMarkers.push(mk);
  });

  if (hlId) {
    const hf = up.find(f => f.id === hlId);
    if (hf) lmap.flyTo([hf.lat, hf.lng], 7, { duration:.8 });
  } else {
    const matched = up.filter(f => f.score > 0);
    const fits = matched.length ? matched : up;
    if (fits.length === 1) lmap.setView([fits[0].lat, fits[0].lng], 7);
    else lmap.fitBounds(L.latLngBounds(fits.map(f => [f.lat, f.lng])), { padding:[40,40], maxZoom:6 });
  }
}

// ═══════════════════════════════════════════════════════════════
// DEBUG LOG
// ═══════════════════════════════════════════════════════════════
const dbgEntries = [];
let dbgVisible = false;
let dbgFilter  = 'all';        // active filter tab
let dbgBannerDismissed = false;

// Per-type counters and error streak tracking
const dbgStats = { ok:0, error:0, timeout:0, rate:0, net:0 };
let netErrStreak   = 0;  // consecutive network-level errors
let netErrTotal    = 0;  // total network errors this scan
let circuitOpen    = false;  // true when scan is paused for network

const DBG_COLORS = {
  ok:      '#4ade80',
  error:   '#f87171',
  net:     '#ff9f6b',   // network-level errors — distinct from API errors
  warn:    '#facc15',
  info:    '#60a5fa',
  timeout: '#fb923c',
  rate:    '#e879f9',
};

// Categorise an error message as 'net' (browser-level) vs 'error' (API-level)
function classifyLevel(level, msg) {
  if (level === 'error' && (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('NETWORK') || msg.includes('net::') || msg.includes('ERR_'))) return 'net';
  return level;
}

// Better human-readable diagnosis for "Failed to fetch"
function diagnoseNetworkError(e, url) {
  const msg = (e?.message || String(e)).toLowerCase();
  if (!navigator.onLine) return 'browser is offline (navigator.onLine = false)';
  if (msg.includes('cors') || msg.includes('cross-origin')) return 'CORS blocked — TM API not allowing requests from this origin';
  if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed')) {
    if (url?.includes('ticketmaster')) return '"Failed to fetch" — likely CORS block or TM blocking this origin. Check Network tab for red CORS error.';
    return '"Failed to fetch" — network request blocked before it left the browser';
  }
  if (msg.includes('abort')) return 'request aborted (timeout)';
  return e?.message || String(e);
}

function dblog(level, msg, detail='') {
  const ts = new Date().toLocaleTimeString('en-GB', { hour12:false });
  const effectiveLevel = classifyLevel(level, msg);
  const entry = { ts, level: effectiveLevel, origLevel: level, msg, detail, col: DBG_COLORS[effectiveLevel] || '#9ca3af' };
  dbgEntries.push(entry);

  // Mirror to onboard minilog — only errors and warnings (not OK spam)
  const onboardActive = document.getElementById('onboard-prog-wrap')?.classList.contains('visible');
  if (onboardActive && typeof onboardLog === 'function') {
    if (effectiveLevel === 'net' || effectiveLevel === 'error') {
      onboardLog(msg.slice(0, 120), 'err');
    } else if (effectiveLevel === 'warn') {
      onboardLog(msg.slice(0, 120), 'warn');
    }
  }

  // Update counters
  if (effectiveLevel === 'ok')      dbgStats.ok++;
  else if (effectiveLevel === 'net') { dbgStats.net++; dbgStats.error++; netErrStreak++; netErrTotal++; }
  else if (effectiveLevel === 'error')  dbgStats.error++;
  else if (effectiveLevel === 'timeout') { dbgStats.timeout++; netErrStreak++; }
  else if (effectiveLevel === 'rate') dbgStats.rate++;

  if (effectiveLevel === 'ok' || effectiveLevel === 'info') {
    netErrStreak = Math.max(0, netErrStreak - 1);
  }

  // Circuit breaker: consecutive network failures → show banner and pause
  checkCircuitBreaker(effectiveLevel, msg);

  if (dbgVisible) appendDbgRow(entry);
  updateDbgSummary();
}

function updateDbgSummary() {
  const el = document.getElementById('dbg-summary');
  if (!el) return;
  const parts = [];
  if (dbgStats.ok)      parts.push(`<span style="color:#4ade80">✓${dbgStats.ok}</span>`);
  if (dbgStats.net)     parts.push(`<span style="color:#ff9f6b">📡${dbgStats.net}</span>`);
  if (dbgStats.error)   parts.push(`<span style="color:#f87171">✗${dbgStats.error}</span>`);
  if (dbgStats.timeout) parts.push(`<span style="color:#fb923c">⏱${dbgStats.timeout}</span>`);
  if (dbgStats.rate)    parts.push(`<span style="color:#e879f9">429:${dbgStats.rate}</span>`);
  el.innerHTML = parts.join(' ');
}

function checkCircuitBreaker(level, msg) {
  const banner = document.getElementById('dbg-banner');
  const bannerText = document.getElementById('dbg-banner-text');
  if (!banner || !bannerText) return;

  // Trip circuit: 5 consecutive network/timeout errors → pause dispatch
  if (netErrStreak >= 5 && !circuitOpen) {
    circuitOpen = true;
    dbgBannerDismissed = false;
    const isOffline = !navigator.onLine;
    const proxyAlreadyOn = tmProxyMode !== 'none';
    // Don't auto-switch proxy mode — user chose direct, respect that.
    // Just surface a button so they can enable it manually if they want.
    const diagHint = isOffline
      ? '⚠ Browser reports you are <strong>offline</strong>. Check your connection.'
      : (proxyAlreadyOn
          ? '"Failed to fetch" even with proxy. The proxy may be down or blocking TM. Try a different proxy in Settings → Proxy settings.'
          : '"Failed to fetch" — TM is blocking direct requests from your browser (CORS or IP ban).<br>' +
            '&nbsp;<strong>Fix: enable TM proxy in Settings → Proxy settings</strong>');
    const proxyBtn = (!isOffline && !proxyAlreadyOn)
      ? `&nbsp;<button onclick="setTmProxy('auto');openSettings();setSettingsTab('advanced');dbgDismissBanner()" style="font-family:'DM Mono',monospace;font-size:.6rem;padding:3px 10px;border-radius:4px;border:1px solid var(--accent);background:rgba(200,255,95,.1);color:var(--accent);cursor:pointer;margin-top:4px;display:inline-block">⚡ Enable TM proxy →</button>`
      : '';
    bannerText.innerHTML = `<strong>🔴 ${netErrStreak} consecutive network failures — scan paused</strong><br>${diagHint}${proxyBtn}`;
    banner.classList.add('visible');
    dblog('warn', `⏸ Circuit open after ${netErrStreak} net errors — new artists queued but paused`);
  } else if (netErrStreak === 0 && circuitOpen) {
    circuitOpen = false;
    banner.classList.remove('visible');
    dbgBannerDismissed = false;
    dblog('ok', '▶ Network recovered — scan resuming');
  } else if (circuitOpen && !dbgBannerDismissed) {
    // Keep updating the count in the banner
    bannerText.querySelector && (bannerText.innerHTML = bannerText.innerHTML.replace(/\d+ consecutive/, `${netErrStreak} consecutive`));
    banner.classList.add('visible');
  }
}

function dbgDismissBanner() {
  dbgBannerDismissed = true;
  circuitOpen = false;  // force-resume scan even with network issues
  document.getElementById('dbg-banner').classList.remove('visible');
  dblog('info', '▶ Banner dismissed — scan resuming (errors will continue to retry)');
}

function dbgClear() {
  dbgEntries.length = 0;
  dbgStats.ok = dbgStats.error = dbgStats.timeout = dbgStats.rate = dbgStats.net = 0;
  netErrStreak = netErrTotal = 0;
  circuitOpen = false;
  dbgBannerDismissed = false;
  document.getElementById('dbg-log').innerHTML = '';
  document.getElementById('dbg-banner').classList.remove('visible');
  updateDbgSummary();
}

// Grouping: collapse consecutive same-message errors into one row with a ×N count
let _lastGroupKey = null;
let _lastGroupRow = null;
let _lastGroupCount = 0;

function appendDbgRow(entry) {
  const log = document.getElementById('dbg-log');
  if (!log) return;

  // Filter visibility
  const visible = dbgFilter === 'all'
    || (dbgFilter === 'net'   && (entry.level === 'net' || entry.level === 'timeout'))
    || (dbgFilter === 'error' && (entry.level === 'error' || entry.level === 'net'))
    || (dbgFilter === 'warn'  && entry.level === 'warn')
    || (dbgFilter === 'ok'    && entry.level === 'ok')
    || (dbgFilter === 'info'  && entry.level === 'info');

  // Group consecutive identical-type entries (e.g. 10× "Failed to fetch")
  const groupKey = entry.level + '|' + entry.msg.slice(0, 60);
  if (groupKey === _lastGroupKey && _lastGroupRow && _lastGroupCount < 50) {
    _lastGroupCount++;
    const countEl = _lastGroupRow.querySelector('.dbg-count');
    if (countEl) { countEl.textContent = `×${_lastGroupCount}`; countEl.style.display = ''; }
    else {
      const c = document.createElement('span');
      c.className = 'dbg-count'; c.textContent = `×2`;
      _lastGroupRow.appendChild(c);
    }
    _lastGroupRow.classList.toggle('hidden', !visible);
    return;
  }

  _lastGroupKey = groupKey;
  _lastGroupCount = 1;

  const row = document.createElement('div');
  row.className = 'dbg-row' +
    (entry.level === 'net' || entry.level === 'timeout' ? ' net-err' : '') +
    (visible ? '' : ' hidden');
  row.dataset.level = entry.level;

  // Enrich "Failed to fetch" with a hint
  let displayMsg = entry.msg;
  if (entry.level === 'net') {
    displayMsg += ' <em>· browser blocked request (CORS / offline / IP ban)</em>';
  }

  row.innerHTML =
    `<span class="dbg-ts">${entry.ts}</span>` +
    `<span class="dbg-lvl" style="color:${entry.col}">[${entry.level.toUpperCase()}]</span>` +
    `<span class="dbg-msg">${displayMsg}</span>` +
    (entry.detail ? `<span class="dbg-detail" title="${entry.detail}">${entry.detail}</span>` : '');

  log.appendChild(row);
  _lastGroupRow = row;
  log.scrollTop = log.scrollHeight;
}

function dbgSetFilter(f) {
  dbgFilter = f;
  document.querySelectorAll('.dbg-filter').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.f === f);
  });
  // Re-apply visibility to all rows
  const log = document.getElementById('dbg-log');
  if (!log) return;
  log.querySelectorAll('.dbg-row').forEach(row => {
    const level = row.dataset.level || 'info';
    const visible = f === 'all'
      || (f === 'net'   && (level === 'net' || level === 'timeout'))
      || (f === 'error' && (level === 'error' || level === 'net'))
      || (f === 'warn'  && level === 'warn')
      || (f === 'ok'    && level === 'ok')
      || (f === 'info'  && level === 'info');
    row.classList.toggle('hidden', !visible);
  });
}

function toggleDbg() {
  dbgVisible = !dbgVisible;
  const panel = document.getElementById('dbg-panel');
  panel.classList.toggle('off', !dbgVisible);
  if (dbgVisible) {
    _lastGroupKey = null; _lastGroupRow = null; _lastGroupCount = 0;
    const log = document.getElementById('dbg-log');
    log.innerHTML = '';
    dbgEntries.forEach(appendDbgRow);
    log.scrollTop = log.scrollHeight;
    updateDbgSummary();
  }
}

function copyDbg() {
  const text = dbgEntries.map(e => `${e.ts} [${e.level.toUpperCase()}] ${e.msg}${e.detail?' | '+e.detail:''}`).join('\n');
  navigator.clipboard.writeText(text).catch(() => prompt('Copy this:', text));
}

// ── NETWORK DIAGNOSIS ──────────────────────────────────────────────
async function dbgRunDiagnose() {
  if (!dbgVisible) toggleDbg();
  dblog('info', '🩺 Running network diagnosis…');

  // 1. Browser online?
  dblog('info', `navigator.onLine = ${navigator.onLine}`);

  // 2. Can we reach a neutral endpoint?
  const neutralOk = await testUrl('https://www.google.com/favicon.ico', 'Internet (google.com)');
  if (!neutralOk) {
    dblog('error', '⚠ Cannot reach google.com — you appear to be completely offline');
    return;
  }

  // 3. Can we reach TM's root domain?
  const tmRoot = await testUrl('https://ticketmaster.com/favicon.ico', 'ticketmaster.com root');

  // 4. Can we reach TM's API domain?
  const tmApi = await testUrl(
    `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=test&size=1`,
    'app.ticketmaster.com API'
  );

  if (neutralOk && !tmApi) {
    dblog('net', '🔴 Diagnosis: Internet works but TM API is unreachable.');
    dblog('info', 'Possible causes: CORS block (check browser Network tab for red OPTIONS/GET), IP ban, or TM API outage.');
    dblog('info', 'Try: open the TM URL in a new tab and see if you get a JSON response.');
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${API_KEY}&keyword=test&size=1`;
    dblog('info', `Direct test URL: ${tmUrl}`);
  } else if (tmApi) {
    dblog('ok', '✅ TM API is reachable — errors were temporary. Scan will resume automatically.');
    netErrStreak = 0;
    circuitOpen = false;
    dbgBannerDismissed = false;
    document.getElementById('dbg-banner')?.classList.remove('visible');
  }
}

async function testUrl(url, label) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, { method:'HEAD', signal: AbortSignal.timeout(5000), mode:'no-cors' });
    dblog('ok', `✓ Reachable: ${label} (${Date.now()-t0}ms)`);
    return true;
  } catch(e) {
    dblog('net', `✗ Unreachable: ${label} — ${e.message}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// RESIZE
// ═══════════════════════════════════════════════════════════════
(function() {
  const handle = document.getElementById('rhandle');
  const panel = document.getElementById('cal-panel');
  let drag = false, sx = 0, sw = 0, raf = null;

  handle.addEventListener('mousedown', e => {
    drag = true; sx = e.clientX; sw = panel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cssText = 'cursor:col-resize;user-select:none';
  });
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    if (raf) return; // throttle to 1 rAF per frame
    raf = requestAnimationFrame(() => {
      raf = null;
      const minW = parseFloat(getComputedStyle(document.documentElement).fontSize) * 18;
      panel.style.width = Math.max(minW, Math.min(sw + (e.clientX - sx), window.innerWidth - 400)) + 'px';
      lmap?.invalidateSize();
    });
  });
  document.addEventListener('mouseup', () => {
    if (!drag) return;
    drag = false; handle.classList.remove('dragging');
    document.body.style.cssText = '';
  });
})();

// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// INSTANT RESUME — rebuild results from IDB cache without re-scanning
// ─────────────────────────────────────────────────────────────────

// State mirrored from onboard filter panel (applied before entering app)
const PINNED_PLAYLIST = Object.freeze({
  id: '0lXmCRl0wc26aSdwfgIAwQ',
  url: 'https://open.spotify.com/playlist/0lXmCRl0wc26aSdwfgIAwQ',
  name: 'loremcdmx twitch playlist',
  artistCount: 2449,
  trackCount: 5569,
  topArtists: ['Fall Out Boy', 'The Maine', 'Anacondaz', 'Panic! At The Disco'],
});
const DEFAULT_ONBOARD_TITLE = 'Start with Spotify<br>or open the sample';
const DEFAULT_ONBOARD_SUB =
  'Connect Spotify to pick one of your playlists, or open the loremcdmx twitch playlist instantly. Cached scans reopen fast on this device.';
const spotifyAccountState = {
  loaded: false,
  loading: false,
  connected: false,
  user: null,
  playlists: [],
  playlistsLoaded: false,
  playlistsLoading: false,
  error: '',
};
let spotifyAuthFlash = null;

function setSpotifyAuthFlash(message, tone = '') {
  spotifyAuthFlash = message ? { message, tone } : null;
}

function getSpotifyAuthErrorMessage(code) {
  switch (String(code || '').toLowerCase()) {
    case 'access_denied':
      return 'Spotify login was canceled.';
    case 'state_mismatch':
      return 'Spotify login expired before it finished. Try again.';
    case 'token_exchange_failed':
      return 'Spotify login did not complete. Check the redirect URI in the server environment.';
    default:
      return 'Spotify login failed. Try again.';
  }
}

function renderSpotifyPlaylistChoices() {
  const wrap = document.getElementById('onboard-auth-list-wrap');
  const list = document.getElementById('onboard-auth-list');
  if (!wrap || !list) return;

  if (!SERVER_MANAGED_SPOTIFY_LOGIN || !spotifyAccountState.connected) {
    wrap.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  wrap.style.display = '';
  list.innerHTML = '';

  if (spotifyAccountState.playlistsLoading) {
    list.innerHTML = '<div class="onboard-auth-empty">Loading your Spotify playlists...</div>';
    return;
  }

  if (!spotifyAccountState.playlistsLoaded) {
    list.innerHTML = '<div class="onboard-auth-empty">Load your Spotify playlists, then pick one to scan.</div>';
    return;
  }

  if (!spotifyAccountState.playlists.length) {
    list.innerHTML = '<div class="onboard-auth-empty">No playlists found on this Spotify account yet.</div>';
    return;
  }

  spotifyAccountState.playlists.slice(0, 12).forEach(item => {
    const card = document.createElement('div');
    card.className = 'onboard-pl';

    if (item.imageUrl) {
      const coverWrap = document.createElement('div');
      coverWrap.className = 'onboard-pl-cover-wrap';
      const cover = document.createElement('img');
      cover.className = 'onboard-pl-cover';
      cover.src = item.imageUrl;
      cover.alt = '';
      cover.loading = 'lazy';
      coverWrap.appendChild(cover);
      card.appendChild(coverWrap);
    } else {
      const ph = document.createElement('div');
      ph.className = 'onboard-pl-cover-ph';
      ph.textContent = '♪';
      card.appendChild(ph);
    }

    const body = document.createElement('div');
    body.className = 'onboard-pl-body';
    body.innerHTML =
      `<div class="onboard-pl-name">${esc2(item.name || 'Untitled playlist')}</div>` +
      `<div class="onboard-pl-meta">${item.trackCount || 0} tracks${item.ownerName ? ` · ${esc2(item.ownerName)}` : ''}</div>`;
    card.appendChild(body);

    const arrow = document.createElement('div');
    arrow.className = 'onboard-pl-arrow';
    arrow.innerHTML = '&#x2192;';
    card.appendChild(arrow);

    card.onclick = () => {
      const url = item.url || `https://open.spotify.com/playlist/${item.id}`;
      const inp = document.getElementById('onboard-url');
      if (inp) inp.value = url;
      syncOnboardPrimaryAction();
      handleOnboardPrimaryAction();
    };

    list.appendChild(card);
  });
}

function setSpotifyLocalSetupStatus(message, tone = '') {
  const el = document.getElementById('sp-local-setup-status');
  if (!el) return;
  el.textContent = message || '';
  el.style.color = tone === 'error'
    ? '#ff7070'
    : tone === 'ok'
      ? 'var(--accent)'
      : '';
}

function hasTicketmasterSetup() {
  if (SERVER_MANAGED_TICKETMASTER) return true;
  if ((API_KEY || '').trim()) return true;
  if (Array.isArray(TM_KEYS) && TM_KEYS.some(item => item?.key && item.key !== SERVER_TM_PLACEHOLDER)) {
    return true;
  }
  try {
    return Boolean(
      (localStorage.getItem('tt_key') || '').trim() ||
      (localStorage.getItem('tt3_key') || '').trim(),
    );
  } catch {
    return false;
  }
}

function renderSpotifyLocalSetupPanel() {
  const wrap = document.getElementById('sp-local-setup');
  const redirect = document.getElementById('sp-local-redirect');
  const hint = document.getElementById('sp-local-setup-hint');
  const saveBtn = document.getElementById('sp-local-save-btn');
  const spotifyGuide = document.getElementById('sp-local-spotify-guide');
  const spotifyFields = document.getElementById('sp-local-spotify-fields');
  const redirectRow = document.getElementById('sp-local-redirect-row');
  const tmFields = document.getElementById('sp-local-tm-fields');
  if (!wrap || !redirect || !hint || !saveBtn) return;

  redirect.textContent = SPOTIFY_REDIRECT_URI_HINT;

  if (!LOCAL_SETUP_ALLOWED) {
    wrap.style.display = 'none';
    return;
  }

  const needsSpotify = !SERVER_MANAGED_SPOTIFY_LOGIN;
  const needsTicketmaster = !hasTicketmasterSetup();

  if (!needsSpotify && !needsTicketmaster) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = '';
  if (spotifyGuide) spotifyGuide.style.display = needsSpotify ? '' : 'none';
  if (spotifyFields) spotifyFields.style.display = needsSpotify ? '' : 'none';
  if (redirectRow) redirectRow.style.display = needsSpotify ? '' : 'none';
  if (tmFields) tmFields.style.display = needsTicketmaster ? '' : 'none';

  if (needsSpotify && needsTicketmaster) {
    hint.textContent = 'Finish Spotify login setup and add at least one Ticketmaster key so playlist scans can immediately fetch concerts.';
    saveBtn.textContent = 'Save Spotify + Ticketmaster locally';
  } else if (needsSpotify) {
    hint.textContent = 'Use the Spotify Dashboard link below, copy Client ID and Client Secret, then add the Redirect URI shown here.';
    saveBtn.textContent = 'Save Spotify locally & enable login';
  } else {
    hint.textContent = 'Spotify is already configured on this local server. Add a Ticketmaster key once to enable live concert and festival scans.';
    saveBtn.textContent = 'Save Ticketmaster key locally';
  }
  saveBtn.disabled = false;
}

function focusSpotifyLocalSetup() {
  const input = !SERVER_MANAGED_SPOTIFY_LOGIN
    ? document.getElementById('sp-local-client-id')
    : document.getElementById('sp-local-ticketmaster-keys');
  if (input) input.focus();
}

function openTicketmasterSetup() {
  showOnboard();
  showNewImport();
  if (typeof openSettings === 'function') {
    openSettings();
    if (typeof setSettingsTab === 'function') setSettingsTab('advanced');
  }
  renderSpotifyLocalSetupPanel();
  setTimeout(() => {
    const input = document.getElementById('sp-local-ticketmaster-keys')
      || document.getElementById('api-input');
    if (input) input.focus();
  }, 60);
}

async function saveSpotifyLocalSetup() {
  const clientId = (document.getElementById('sp-local-client-id')?.value || '').trim();
  const clientSecret = (document.getElementById('sp-local-client-secret')?.value || '').trim();
  const ticketmasterApiKeys = (document.getElementById('sp-local-ticketmaster-keys')?.value || '').trim();
  const saveBtn = document.getElementById('sp-local-save-btn');
  const needsSpotify = !SERVER_MANAGED_SPOTIFY_LOGIN;
  const savingSpotify = needsSpotify || clientId || clientSecret;
  const savingTicketmaster = !!ticketmasterApiKeys;

  if (!savingSpotify && !savingTicketmaster) {
    setSpotifyLocalSetupStatus('Paste Spotify credentials or at least one Ticketmaster API key.', 'error');
    focusSpotifyLocalSetup();
    return;
  }

  if (savingSpotify && (!clientId || !clientSecret)) {
    setSpotifyLocalSetupStatus('Paste both Spotify Client ID and Client Secret.', 'error');
    if (!clientId) document.getElementById('sp-local-client-id')?.focus();
    else document.getElementById('sp-local-client-secret')?.focus();
    return;
  }

  if (saveBtn) saveBtn.disabled = true;
  setSpotifyLocalSetupStatus(
    savingSpotify && savingTicketmaster
      ? 'Saving Spotify and Ticketmaster setup locally...'
      : savingSpotify
        ? 'Saving Spotify setup locally...'
        : 'Saving Ticketmaster keys locally...',
    '',
  );

  try {
    const body = {};
    if (savingSpotify) {
      body.spotifyClientId = clientId;
      body.spotifyClientSecret = clientSecret;
    }
    if (savingTicketmaster) {
      body.ticketmasterApiKeys = ticketmasterApiKeys;
    }
    const res = await fetch('/api/local/setup', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Local setup failed (${res.status}).`);
    }

    setSpotifyLocalSetupStatus('Saved. Reloading local setup...', 'ok');
    setSpotifyAuthFlash(
      data.message || 'Local provider setup saved. Reloading now.',
      'ok',
    );
    setTimeout(() => window.location.reload(), 900);
  } catch (e) {
    setSpotifyLocalSetupStatus(e.message || 'Could not save local provider setup.', 'error');
    if (saveBtn) saveBtn.disabled = false;
  }
}

