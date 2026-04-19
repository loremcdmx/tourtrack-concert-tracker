'use strict';

function updateErrorTab() {
  const errors = Object.entries(fetchErrors).filter(([, v]) => !v.resolved);
  const tabBtn = document.getElementById('tab-errors');
  const errList = document.getElementById('err-list');
  const subEl = document.getElementById('err-pane-sub');

  if (!tabBtn) return;

  if (!errors.length) {
    tabBtn.style.display = 'none';
    if (errList) errList.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">No errors 🎉</div>';
    return;
  }

  // Show tab with count badge
  tabBtn.style.display = '';
  tabBtn.textContent = `⚡ Errors · ${errors.length}`;

  if (subEl) subEl.textContent = `${errors.length} artist${errors.length > 1 ? 's' : ''} failed after all retries`;

  if (!errList) return;
  const frag = document.createDocumentFragment();
  errors.forEach(([artist, info]) => {
    const row = document.createElement('div');
    row.className = 'err-row';
    row.id = `err-row-${CSS.escape(artist)}`;

    const errLabel = info.lastErr === '429'
      ? '429 rate limited'
      : info.lastErr === 'timeout'
        ? '⏱ timeout'
        : `HTTP ${info.lastErr}`;

    row.innerHTML = `
      <div class="err-artist">
        <div class="err-artist-name">${artist}</div>
        <div class="err-reason">${errLabel} · ${info.attempts} attempts · ${info.pass || ''}</div>
      </div>
      <span class="err-count">${info.attempts}×</span>
      <button class="err-retry-btn" onclick="retrySingleArtist('${artist.replace(/'/g, "\\'")}')">↺ Retry</button>`;
    frag.appendChild(row);
  });
  errList.innerHTML = '';
  errList.appendChild(frag);
}

async function retrySingleArtist(artist) {
  if (!API_KEY) return;
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();
  const cHash = countryHash();
  const idbKey = artist.toLowerCase().trim();

  // Update UI
  const row = document.getElementById(`err-row-${CSS.escape(artist)}`);
  if (row) {
    row.style.opacity = '.4';
    const btn = row.querySelector('.err-retry-btn');
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
  }
  setStatus(`Retrying ${artist}…`, false);

  try {
    const shows = await fetchConcerts(artist, today);
    let finalShows = shows;
    if (!shows.length) finalShows = await fetchBIT(artist, today);
    const upcoming = finalShows.filter(s => s.date >= today);
    concerts.push(...upcoming);
    concerts = deduplicateConcerts(concerts);
    DB.put('artists', idbKey, { ts: now, cHash, shows: finalShows }).catch(() => {});
    delete fetchErrors[artist];
    dblog('ok', `Manual retry: "${artist}" succeeded — ${upcoming.length} shows`);
    setStatus(`✓ ${artist}: ${upcoming.length} shows`, true);
    persistData();
    buildCalChips(); renderCalendar(); renderMap();
  } catch(e) {
    if (fetchErrors[artist]) {
      fetchErrors[artist].attempts++;
      fetchErrors[artist].lastErr = e.message;
    }
    dblog('error', `Manual retry: "${artist}" still failing — ${e.message}`);
    setStatus(`⚠ ${artist}: ${e.message}`, false);
    if (row) row.style.opacity = '1';
  }
  updateErrorTab();
}

async function retryAllErrors() {
  const toRetry = Object.keys(fetchErrors).filter(a => !fetchErrors[a].resolved);
  for (const artist of toRetry) {
    await retrySingleArtist(artist);
    await sleep(500);
  }
}

// ── QUOTA MODAL ────────────────────────────────────────────────────
function refreshKeyPoolUI() {
  const container = document.getElementById('key-pool-list');
  if (!container) return;
  container.innerHTML = '';
  if (SERVER_MANAGED_TICKETMASTER) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;border:1px solid var(--accent);background:rgba(200,255,95,.08);margin-bottom:6px;font-family:"DM Mono",monospace;font-size:.68rem;';
    row.innerHTML = '<div style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:var(--accent);"></div>' +
      '<span style="flex:1;color:var(--text)">Server-managed Ticketmaster pool</span>' +
      '<span style="font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid var(--accent);color:var(--accent);background:rgba(200,255,95,.08)">SERVER</span>';
    container.appendChild(row);

    const note = document.createElement('div');
    note.style.cssText = 'font-size:.58rem;color:var(--muted2);line-height:1.45;';
    note.textContent = 'Shared deployments keep Ticketmaster keys on the backend. End users scan without seeing or storing those keys in the browser.';
    container.appendChild(note);
    return;
  }
  TM_KEYS.forEach((k, i) => {
    const isActive = i === _activeKeyIdx;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;border:1px solid var(--border);background:var(--s2);margin-bottom:4px;font-family:"DM Mono",monospace;font-size:.68rem;';
    if (isActive) row.style.borderColor = 'var(--accent)';

    const dot = document.createElement('div');
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;flex-shrink:0;background:' +
      (k.exhausted ? '#ff4444' : isActive ? 'var(--accent)' : '#555') + ';';

    const label = document.createElement('span');
    label.style.cssText = 'flex:1;color:' + (isActive ? 'var(--accent)' : k.exhausted ? '#888' : 'var(--text)') + ';';
    label.textContent = (k.label || ('Key ' + (i+1))) + ' — ..' + k.key.slice(-8);

    const badge = document.createElement('span');
    const badgeStyle = isActive
      ? 'color:var(--accent);border-color:var(--accent);background:rgba(200,255,95,.08)'
      : k.exhausted
        ? 'color:#ff6b6b;border-color:#ff4444;background:rgba(255,68,68,.08)'
        : 'color:#888;border-color:#444;background:transparent';
    badge.style.cssText = 'font-size:.52rem;padding:2px 7px;border-radius:100px;border:1px solid;' + badgeStyle;
    badge.textContent = isActive ? 'ACTIVE' : k.exhausted ? 'EXHAUSTED' : 'READY';

    const del = document.createElement('button');
    del.style.cssText = 'background:none;border:none;color:#555;cursor:pointer;font-size:.8rem;padding:0 2px;line-height:1;';
    del.textContent = 'x';
    del.title = 'Remove this key';
    del.onclick = () => {
      if (TM_KEYS.length <= 1) { softNotice('Keep at least one API key.'); return; }
      TM_KEYS.splice(i, 1);
      if (_activeKeyIdx >= TM_KEYS.length) _activeKeyIdx = 0;
      API_KEY = TM_KEYS[_activeKeyIdx].key;
      localStorage.setItem('tt_key', API_KEY);
      persistSettings();
      refreshKeyPoolUI();
    };

    row.appendChild(dot); row.appendChild(label); row.appendChild(badge); row.appendChild(del);
    container.appendChild(row);
  });

  const addRow = document.createElement('div');
  addRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
  addRow.innerHTML = '<input id="new-pool-key" type="password" placeholder="Paste new Consumer Key..."' +
    ' style="flex:1;font-family:\'DM Mono\',monospace;font-size:.72rem;background:var(--s2);' +
    'border:1.5px solid var(--border2);border-radius:6px;padding:7px 10px;color:var(--text);outline:none;"' +
    ' autocomplete="off" spellcheck="false">' +
    '<button onclick="addKeyToPool()" style="font-family:\'DM Mono\',monospace;font-size:.7rem;font-weight:700;' +
    'padding:7px 14px;border-radius:6px;border:none;background:var(--accent);color:var(--bg);cursor:pointer;">+ Add</button>';
  container.appendChild(addRow);
}

function addKeyToPool() {
  const input = document.getElementById('new-pool-key');
  const key = input ? input.value.trim() : '';
  if (!key) return;
  if (TM_KEYS.some(k => k.key === key)) { softNotice('This key is already in the pool.', 'warn', { focusId: 'new-pool-key' }); return; }
  TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
  input.value = '';
  persistSettings();
  refreshKeyPoolUI();
  dblog('info', 'Key pool: added key ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys)');
}

function showQuotaModal(resetStr, totalFound) {
  const el = document.getElementById('quota-reset-str');
  const cnt = document.getElementById('quota-found-count');
  const title = document.getElementById('quota-title');
  const subtitle = document.getElementById('quota-subtitle');
  const newKeyBlock = document.getElementById('quota-new-key-block');
  const getLink = document.getElementById('quota-get-link');
  if (title) title.textContent = SERVER_MANAGED_TICKETMASTER ? 'Ticketmaster Server Quota Exhausted' : 'API Key Quota Exhausted';
  if (subtitle) {
    subtitle.innerHTML = SERVER_MANAGED_TICKETMASTER
      ? 'The shared Ticketmaster key pool for this deployment is exhausted. Browsing still works, but new scans need to wait until <strong>midnight UTC</strong> or until the server gets more quota.'
      : 'Ticketmaster is rejecting every request instantly (&lt;15ms), which means the daily hard quota for this API key has been reached. Waiting and retrying will not help - the counter resets at <strong>midnight UTC</strong>.';
  }
  if (newKeyBlock) newKeyBlock.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (getLink) getLink.style.display = SERVER_MANAGED_TICKETMASTER ? 'none' : '';
  if (el) el.textContent = resetStr || 'at midnight UTC';
  if (cnt) cnt.textContent = totalFound || (concerts.length + festivals.length);
  document.getElementById('quota-bg').classList.add('open');
}

function closeQuotaModal() {
  document.getElementById('quota-bg').classList.remove('open');
  buildCalChips(); renderCalendar(); renderMap();
}

function quotaApplyNewKey() {
  if (SERVER_MANAGED_TICKETMASTER) {
    softNotice('Ticketmaster keys are managed by the server for this deployment.');
    return;
  }
  const input = document.getElementById('quota-key-input');
  const key = input ? input.value.trim() : '';
  if (!key) return;

  const existing = TM_KEYS.findIndex(k => k.key === key);
  if (existing >= 0) {
    TM_KEYS[existing].exhausted = false;
    _activeKeyIdx = existing;
  } else {
    TM_KEYS.push({ key, label: 'Key ' + (TM_KEYS.length + 1), exhausted: false });
    _activeKeyIdx = TM_KEYS.length - 1;
  }
  API_KEY = key;
  localStorage.setItem('tt_key', key);
  const apiInput = document.getElementById('api-input');
  if (apiInput) apiInput.value = key;
  window._hardQuotaHit = false;
  window._tmReqCount = 0;
  persistSettings();
  refreshKeyPoolUI();
  closeQuotaModal();
  dblog('info', 'Key pool: activated ..' + key.slice(-6) + ' (pool now has ' + TM_KEYS.length + ' keys) — restarting scan');
  saveAndFetch(false);
}
