'use strict';

function regionCodes(rid) {
  return Object.entries(COUNTRY_MAP).filter(([,v]) => v.r === rid).map(([k]) => k);
}

function activeSet() {
  return countryMode === 'exclude' ? excludeCountries : includeCountries;
}

function setScopeMode(mode) {
  countryMode = mode;
  // Sync button highlights
  document.getElementById('scm-world').className   = 'sset-scope-btn' + (mode === 'world'   ? ' on-world'   : '');
  document.getElementById('scm-include').className = 'sset-scope-btn' + (mode === 'include' ? ' on-include' : '');
  document.getElementById('scm-exclude').className = 'sset-scope-btn' + (mode === 'exclude' ? ' on-exclude' : '');
  // Show/hide region panel
  { const _sr = document.getElementById('scope-regions'); if (_sr) _sr.style.display = mode === 'world' ? 'none' : 'block'; }
  // Recolor all rcard borders and cc chips
  document.querySelectorAll('.rcard').forEach(syncRCard);
  document.querySelectorAll('.cc').forEach(syncCCStyle);
  refreshScopeSummary();
}

function buildScopePicker() {
  setScopeMode(countryMode); // sync buttons

  const list = document.getElementById('rcard-list');
  list.innerHTML = '';

  REGIONS.forEach(r => {
    const codes = regionCodes(r.id);
    const card = document.createElement('div');
    card.className = 'rcard';
    card.dataset.rid = r.id;

    // Header
    const hd = document.createElement('div');
    hd.className = 'rcard-hd';
    hd.innerHTML = `
      <span class="rcard-emoji">${r.e}</span>
      <span class="rcard-name">${r.lbl}</span>
      <span class="rcard-badge" id="rbadge-${r.id}"></span>
      <div class="rcard-btns">
        <button class="rcard-btn a" title="Select all">All</button>
        <button class="rcard-btn n" title="Clear all">None</button>
      </div>
      <span class="rcard-chevron" id="rchev-${r.id}">▾</span>`;

    const body = document.createElement('div');
    body.className = 'rcard-body';
    body.id = `rbody-${r.id}`;

    // Auto-expand EU by default
    if (r.id === 'eu') { hd.querySelector('.rcard-chevron').classList.add('open'); body.classList.add('open'); }

    const grid = document.createElement('div');
    grid.className = 'cc-grid';
    grid.dataset.region = r.id;
    codes.forEach(code => {
      const m = COUNTRY_MAP[code]; if (!m) return;
      const cc = document.createElement('button');
      cc.className = 'cc'; cc.dataset.code = code;
      cc.innerHTML = `<span class="cf">${m.f}</span>${m.n}`;
      cc.onclick = e => { e.stopPropagation(); toggleCC(cc, code); };
      syncCCStyle(cc);
      grid.appendChild(cc);
    });
    body.appendChild(grid);

    // Header click = toggle expand
    hd.onclick = () => {
      const isOpen = body.classList.toggle('open');
      hd.querySelector('.rcard-chevron').classList.toggle('open', isOpen);
    };
    // "All" / "None" buttons
    hd.querySelector('.rcard-btn.a').onclick = e => { e.stopPropagation(); selectRegion(r.id, true); };
    hd.querySelector('.rcard-btn.n').onclick = e => { e.stopPropagation(); selectRegion(r.id, false); };

    card.appendChild(hd);
    card.appendChild(body);
    list.appendChild(card);
    syncRCard(card);
  });

  refreshScopeSummary();
  pickerBuilt = true;
}

function syncRCard(card) {
  const rid = card.dataset?.rid; if (!rid) return;
  const codes = regionCodes(rid);
  const set = activeSet();
  const selCount = codes.filter(c => set.has(c)).length;
  const badge = document.getElementById(`rbadge-${rid}`);
  if (badge) {
    const hasSel = selCount > 0;
    badge.textContent = hasSel ? `${selCount}/${codes.length}` : '';
    badge.className = 'rcard-badge' + (hasSel && countryMode === 'include' ? ' sel' : hasSel && countryMode === 'exclude' ? ' sel-exc' : '');
  }
  card.className = 'rcard' + (selCount > 0 ? ` has-sel ${countryMode === 'exclude' ? 'exc-mode' : 'inc-mode'}` : '');
}

function syncCCStyle(chip) {
  const code = chip.dataset.code;
  const set = activeSet();
  const active = set.has(code);
  chip.classList.toggle('inc', active && countryMode === 'include');
  chip.classList.toggle('exc', active && countryMode === 'exclude');
}

function toggleCC(chip, code) {
  const set = activeSet();
  if (set.has(code)) set.delete(code); else set.add(code);
  syncCCStyle(chip);
  const card = chip.closest('.rcard');
  if (card) syncRCard(card);
  refreshScopeSummary();
}

function selectRegion(rid, sel) {
  const codes = regionCodes(rid);
  const set = activeSet();
  codes.forEach(c => sel ? set.add(c) : set.delete(c));
  document.querySelectorAll(`.cc-grid[data-region="${rid}"] .cc`).forEach(syncCCStyle);
  const card = document.querySelector(`.rcard[data-rid="${rid}"]`);
  if (card) syncRCard(card);
  refreshScopeSummary();
}

function scopePreset(preset) {
  const EU = regionCodes('eu');
  const ALL = Object.keys(COUNTRY_MAP);
  const set = activeSet();
  set.clear();
  if (preset === 'eu')    EU.forEach(c => set.add(c));
  if (preset === 'eu+na') [...EU, ...regionCodes('na')].forEach(c => set.add(c));
  if (preset === 'all')   ALL.forEach(c => set.add(c));
  // 'none' = already cleared
  document.querySelectorAll('.cc').forEach(syncCCStyle);
  document.querySelectorAll('.rcard').forEach(syncRCard);
  refreshScopeSummary();
}

function refreshScopeSummary() {
  const el = document.getElementById('scope-summary');
  if (!el) return;
  if (countryMode === 'world') { el.textContent = '· worldwide'; return; }
  const set = activeSet();
  if (!set.size) {
    el.textContent = countryMode === 'include' ? '· nothing selected (worldwide)' : '· nothing excluded (worldwide)';
    return;
  }
  // Summarize by region
  const byRegion = {};
  for (const code of set) {
    const r = COUNTRY_MAP[code]?.r || '?';
    byRegion[r] = (byRegion[r] || 0) + 1;
  }
  const parts = Object.entries(byRegion).map(([r, n]) => {
    const total = regionCodes(r).length;
    const reg = REGIONS.find(x => x.id === r);
    return n === total ? `${reg?.e || r} all` : `${reg?.e || r} ${n}`;
  });
  el.textContent = `· ${countryMode === 'exclude' ? 'excluding: ' : ''}${parts.join(', ')}`;
}

// ═══════════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════════
const sleep = ms => new Promise(r => setTimeout(r, ms));

// AbortController properly cancels TCP sockets — unlike XHR.timeout or Promise.race
