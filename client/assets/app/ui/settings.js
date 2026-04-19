'use strict';

function openSettings() {
  document.getElementById('api-input').value = SERVER_MANAGED_TICKETMASTER ? SERVER_TM_PLACEHOLDER : API_KEY;
  refreshKeyPoolUI();
  const tmKeyHint = document.getElementById('tm-key-hint');
  if (tmKeyHint) {
    tmKeyHint.innerHTML = SERVER_MANAGED_TICKETMASTER
      ? 'Ticketmaster keys live on the server for this deployment. The browser never stores or exposes them.'
      : 'Keys rotate when quota is hit (5,000 req/day). <span style="color:var(--green)">&#x25cf;</span> Active &#xb7; <span style="color:var(--red)">&#x25cf;</span> Exhausted (resets midnight UTC)';
  }
  const spNote = document.getElementById('sp-cred-note');
  if (spNote) {
    spNote.textContent = SERVER_MANAGED_SPOTIFY
      ? '- managed by server for this deployment'
      : '- set server env vars to enable Spotify';
  }
  const spIdInput = document.getElementById('sp-client-id');
  const spSecretInput = document.getElementById('sp-client-secret');
  if (spIdInput && spSecretInput) {
    spIdInput.value = '';
    spSecretInput.value = '';
    spIdInput.placeholder = SERVER_MANAGED_SPOTIFY ? 'Managed by server' : 'Server env required';
    spSecretInput.placeholder = SERVER_MANAGED_SPOTIFY ? 'Managed by server' : 'Server env required';
    spIdInput.disabled = true;
    spSecretInput.disabled = true;
  }
  spSetError(''); spSetResult(''); spClearProgress();
  syncProxyUI();
  if (typeof renderSpotifyLocalSetupPanel === 'function') renderSpotifyLocalSetupPanel();
  document.getElementById('artists-ta').value = ARTISTS.map(name => {
    const p = ARTIST_PLAYS[name.toLowerCase()] || 0;
    return p > 0 ? `${name} ${p}` : name;
  }).join('\n');
  updateArtistCount();
  if (!pickerBuilt) { buildScopePicker(); }
  else { setScopeMode(countryMode); document.querySelectorAll('.rcard').forEach(syncRCard); refreshScopeSummary(); }

  const cb = document.getElementById('use-cached-btn');
  if (concerts.length || festivals.length) {
    cb.textContent = `📦 Use cached (${cacheAge()})`;
    cb.style.display = '';
  } else {
    cb.style.display = 'none';
  }

  const badge = document.getElementById('artist-count-badge');
  if (badge) badge.textContent = ARTISTS.length ? `${ARTISTS.length} artists` : '';
  renderScanActionPanels();

  const localSetupWrap = document.getElementById('sp-local-setup');
  const showSetupBlocks = !!localSetupWrap && localSetupWrap.style.display !== 'none';
  const tmBlock = document.getElementById('settings-tm-block');
  const spotifyBlock = document.getElementById('settings-spotify-block');
  const utilitiesBlock = document.getElementById('settings-utilities-block');
  const proxyDetails = document.getElementById('proxy-details');
  if (tmBlock) tmBlock.style.display = (!SERVER_MANAGED_TICKETMASTER || showSetupBlocks) ? '' : 'none';
  if (spotifyBlock) spotifyBlock.style.display = (!SERVER_MANAGED_SPOTIFY || showSetupBlocks) ? '' : 'none';
  if (utilitiesBlock) utilitiesBlock.style.display = '';
  if (proxyDetails) proxyDetails.open = false;

  // Show/hide Database tab
  const dbTab = document.getElementById('stab-database');
  if (dbTab) dbTab.style.display = ARTISTS.length > 1 ? '' : 'none';

  // Render settings import history
  renderSettingsHistory();

  // Default to import tab when opening
  setSettingsTab(ARTISTS.length > 1 && (concerts.length || festivals.length) ? 'database' : 'import');

  document.getElementById('settings-bg').classList.remove('off');
}

let settingsTab = 'import';
function setSettingsTab(tab) {
  settingsTab = tab;
  ['import','database','advanced'].forEach(t => {
    document.getElementById(`stab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`stab-pane-${t}`)?.classList.toggle('active', t === tab);
  });
  if (tab === 'database') buildDatabaseTab();
}

function buildScanActionSummary() {
  const age = cacheAge() || 'not scanned yet';
  return `${ARTISTS.length} artists · ${concerts.length} shows · ${festivals.length} festivals · ${age}`;
}

function buildScanActionsMarkup(context = 'settings') {
  const note = context === 'library'
    ? 'Refresh the current library without digging through low-level settings.'
    : 'Smart refresh is the default. Use the stronger modes only when you need them.';
  return `
    <div class="scan-action-note">${note}</div>
    <div class="scan-action-grid${context === 'library' ? ' compact' : ''}">
      <button class="scan-action-btn primary" onclick="runScanAction('smart')">
        <span class="scan-action-title">Smart refresh</span>
        <span class="scan-action-copy">Uses recent cache, refreshes stale artists, keeps results live.</span>
      </button>
      <button class="scan-action-btn" onclick="runScanAction('replace')">
        <span class="scan-action-title">Replace results</span>
        <span class="scan-action-copy">Rebuilds the concert list from fresh Ticketmaster data.</span>
      </button>
      <button class="scan-action-btn" onclick="runScanAction('merge')">
        <span class="scan-action-title">Add-only refresh</span>
        <span class="scan-action-copy">Keeps current shows visible and only adds newly found ones.</span>
      </button>
      <button class="scan-action-btn" onclick="runScanAction('festivals')">
        <span class="scan-action-title">Festivals only</span>
        <span class="scan-action-copy">Leaves concerts alone and refreshes festival matching only.</span>
      </button>
    </div>
    <div class="scan-action-meta">${buildScanActionSummary()}</div>
  `;
}

function renderScanActionPanels() {
  const settingsPanel = document.getElementById('scan-actions-panel');
  if (settingsPanel) settingsPanel.innerHTML = buildScanActionsMarkup('settings');
}

function buildDatabaseTab() {
  const el = document.getElementById('db-tab-content');
  if (!el) return;

  const hist = getOnboardHistory();
  const pl = hist[0]; // most recent
  const artistsOnTour = Object.keys(allTourData).length;
  const today = new Date().toISOString().split('T')[0];
  const in90 = new Date(Date.now() + 90*86400000).toISOString().split('T')[0];
  const endingSoon = Object.entries(allTourData).filter(([,evs]) =>
    evs.length >= 5 && evs[evs.length-1].date >= today && evs[evs.length-1].date <= in90).length;
  const topFests = festivals.filter(f => f.score > 0).slice(0,5);

  const coverHtml = pl?.coverUrl
    ? `<img class="db-cover" src="${pl.coverUrl}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
    + `<div class="db-cover-ph" style="display:none">🎧</div>`
    : `<div class="db-cover-ph">🎧</div>`;

  const topChips = ARTISTS.slice(0,20).map((a,i) =>
    `<span class="db-artist-chip ${i<5?'top':''}">${esc2(a)}</span>`).join('');

  const festRows = topFests.map(f => {
    const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
    return `<div class="db-fest-row">
      <span class="db-fest-score">${f.score}</span>
      <span class="db-fest-name">${esc2(f.name)}</span>
      <span class="db-fest-date">${fmtDate(f.date)} ${loc}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="db-hero">
      ${coverHtml}
      <div class="db-hero-info">
        <div class="db-pl-name">${esc2(pl?.name || 'Your library')}</div>
        <div class="db-pl-meta">Last scanned ${cacheAge()} · ${pl?.trackCount || '?'} tracks</div>
      </div>

    </div>
    <div class="db-stats-grid">
      <div class="db-stat"><div class="db-stat-n">${ARTISTS.length}</div><div class="db-stat-l">Artists</div></div>
      <div class="db-stat"><div class="db-stat-n">${artistsOnTour}</div><div class="db-stat-l">On tour</div></div>
      <div class="db-stat"><div class="db-stat-n">${concerts.length}</div><div class="db-stat-l">Shows found</div></div>
      <div class="db-stat"><div class="db-stat-n">${festivals.length}</div><div class="db-stat-l">Festivals</div></div>
      <div class="db-stat"><div class="db-stat-n">${endingSoon}</div><div class="db-stat-l">Ending &lt;90d</div></div>
      <div class="db-stat"><div class="db-stat-n">${topFests.length ? topFests[0].score : '—'}</div><div class="db-stat-l">Top fest score</div></div>
    </div>
    <div class="db-section db-scan-section">
      <div class="db-section-title">Refresh library</div>
      ${buildScanActionsMarkup('library')}
    </div>
    ${ARTISTS.length ? `
    <div class="db-section">
      <div class="db-section-title">Top artists in your library</div>
      <div class="db-artists-grid">${topChips}</div>
    </div>` : ''}
    ${topFests.length ? `
    <div class="db-section">
      <div class="db-section-title">Top festivals for you</div>
      <div class="db-fests-row">${festRows}</div>
    </div>` : ''}
    <div class="db-cache-info">
      Cache age: ${cacheAge() || '—'} · ${concerts.length} shows · ${festivals.length} festivals
      <br>API quota estimate: ~${Math.ceil(ARTISTS.length * 1.5)} req/scan (TM free tier: 5000/day)
    </div>`;
}

function renderSettingsHistory() {
  const list = getOnboardHistory();
  const wrap = document.getElementById('settings-history-wrap');
  const hist = document.getElementById('settings-history');
  if (!wrap || !hist) return;
  if (!list.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = '';
  hist.innerHTML = '';
  list.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'onboard-pl';
    const ago = tsAgo(p.ts);
    const chips = (p.topArtists || []).slice(0,4).map(a =>
      `<span class="onboard-pl-chip">${esc2(a)}</span>`).join('');
    const coverHtml = p.coverUrl
      ? `<img class="onboard-pl-cover" src="${p.coverUrl}" alt="" onerror="this.style.display='none';this.nextSibling.style.display='flex'"><div class="onboard-pl-cover-ph" style="display:none">🎧</div>`
      : `<div class="onboard-pl-cover-ph">🎧</div>`;
    el.innerHTML = `
      ${coverHtml}
      <div class="onboard-pl-body">
        <div class="onboard-pl-name">${esc2(p.name)}</div>
        <div class="onboard-pl-meta">${p.artistCount} artists · ${p.trackCount} tracks · ${ago}</div>
        <div class="onboard-pl-chips">${chips}</div>
      </div>
      <button class="onboard-pl-del" title="Remove from history" onclick="removeOnboardHistory(event,${i})">×</button>`;
    el.onclick = e => {
      if (e.target.classList.contains('onboard-pl-del')) return;
      document.getElementById('sp-playlist-url').value = p.url;
      spotifyImport();
    };
    hist.appendChild(el);
  });
}

function closeSettings() { document.getElementById('settings-bg').classList.add('off'); }
function settingsBgClick(e) { if (e.target.id === 'settings-bg') closeSettings(); }
function useCached() { closeSettings(); buildCalChips(); renderCalendar(); renderMap(); }

function commitScanInputs(opts = {}) {
  const requireArtists = opts.requireArtists !== false;
  const apiInput = document.getElementById('api-input');
  const key = apiInput ? apiInput.value.trim() : '';
  if (SERVER_MANAGED_TICKETMASTER) API_KEY = SERVER_TM_PLACEHOLDER;
  else if (key) API_KEY = key;
  if (!API_KEY) {
    softNotice('Add a Ticketmaster API key to start the scan.', 'warn', { focusId: 'api-input' });
    setSettingsTab('advanced');
    return false;
  }

  const artistInput = document.getElementById('artists-ta');
  const parsed = parseArtistLines(artistInput ? artistInput.value : '');
  if (requireArtists && !parsed.length) {
    softNotice('Add at least one artist.', 'warn', { focusId: 'artists-ta' });
    setSettingsTab('advanced');
    return false;
  }

  if (parsed.length) applyParsedArtists(parsed);
  persistSettings();
  return true;
}

function saveAndFetch(forceRefresh = false) {
  if (!commitScanInputs()) return;
  closeSettings();
  fetchAll(forceRefresh);
}

// Parse textarea lines into {name, plays} pairs.
// Format: "Artist Name 14" or "Artist Name" (plays=0 if no number)
function parseArtistLines(text) {
  return text.trim().split('\n').map(line => {
    line = line.trim();
    if (!line) return null;
    const m = line.match(/^(.*?)\s+(\d+)\s*$/);
    if (m) return { name: m[1].trim(), plays: parseInt(m[2], 10) };
    return { name: line, plays: 0 };
  }).filter(Boolean);
}

// Rebuild ARTISTS (string[]) and ARTIST_PLAYS from parsed data
function applyParsedArtists(parsed) {
  ARTISTS = parsed.map(p => p.name);
  ARTIST_PLAYS = Object.fromEntries(parsed.map(p => [p.name.toLowerCase(), p.plays]));
}

function updateArtistCount() {
  const parsed = parseArtistLines(document.getElementById('artists-ta').value);
  const totalPlays = parsed.reduce((s, p) => s + p.plays, 0);
  const withPlays = parsed.filter(p => p.plays > 0).length;
  let msg = `${parsed.length} artist${parsed.length !== 1 ? 's' : ''}`;
  if (withPlays > 0) msg += ` · ${withPlays} weighted`;
  document.getElementById('artist-count').textContent = msg;
}
document.getElementById('artists-ta').addEventListener('input', updateArtistCount);

function clearArtists() {
  if (!confirm('Clear artist list?')) return;
  document.getElementById('artists-ta').value = '';
  updateArtistCount();
}

function trimArtistsByTracks(minCount) {
  const ta = document.getElementById('artists-ta');
  const parsed = parseArtistLines(ta.value);
  const before = parsed.length;

  // Artists with plays=0 have no track count info — keep them (can't filter)
  const hasAnyPlays = parsed.some(p => p.plays > 0);
  if (!hasAnyPlays) {
    const hint = document.getElementById('artist-trim-hint');
    if (hint) { hint.textContent = 'No track counts — re-import from Spotify first'; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 3000); }
    return;
  }

  // Keep artists that either: have plays >= minCount, OR have no play info (plays=0 = unknown)
  const kept = parsed.filter(p => p.plays === 0 || p.plays >= minCount);
  const removed = before - kept.length;

  if (removed === 0) {
    const hint = document.getElementById('artist-trim-hint');
    if (hint) { hint.textContent = 'Nothing to remove'; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 2500); }
    return;
  }

  if (!confirm(`Remove ${removed} artist${removed !== 1 ? 's' : ''} with fewer than ${minCount} tracks? (${kept.length} will remain)`)) return;

  ta.value = kept.map(p => p.plays > 0 ? `${p.name} ${p.plays}` : p.name).join('\n');
  updateArtistCount();

  const hint = document.getElementById('artist-trim-hint');
  if (hint) { hint.textContent = `✓ Removed ${removed} artists`; hint.classList.add('visible'); setTimeout(() => hint.classList.remove('visible'), 3000); }
}

// ── SEARCH SCOPE PICKER ──────────────────────────────────────────
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
async function apiFetch(url, ms = 5000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  const short = url.replace(/apikey=[^&]+/, 'apikey=…').slice(0, 100);
  const t0 = Date.now();
  try {
    // Route through tmFetch so TM proxy (none/auto/corsproxy/allorigins/custom) is respected.
    // Note: when using a proxy the AbortSignal targets the proxy request, which is correct.
    const r = await tmFetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    const proxyNote = tmProxyWorking && tmProxyWorking !== 'direct' ? ` [via ${tmProxyWorking}]` : '';
    if (r.status === 200) {
      window._tmReqCount = (window._tmReqCount || 0) + 1;
      window._onTmOk?.();
      dblog('ok', `HTTP 200 (${ms2}ms)${proxyNote} [TM req #${window._tmReqCount}]`, short);
    }
    else if (r.status === 429) {
      // CRITICAL DISTINCTION: burst throttle vs daily quota exhaustion.
      //
      // A burst-rate-limit 429 takes 100-400ms because TM's server actually
      // processes the request before deciding to reject it. Waiting 5-10 seconds
      // and retrying is the correct response.
      //
      // A daily-quota-exhaustion 429 takes < 15ms because TM's gateway instantly
      // rejects the request at the network edge without routing it anywhere. The
      // key is at its hard daily limit — retrying in 5 seconds is pointless and
      // just wastes more of the quota you don't have. You need to wait until
      // midnight UTC when the counters reset.
      const isHardQuota = r.headers.get('x-tourtrack-tm-state') === 'all-keys-exhausted' || ms2 < 15;
      if (isHardQuota) {
        window._onTmHardQuota?.();
      } else {
        window._onTm429?.();
      }
      dblog('rate', `HTTP 429 ${isHardQuota ? '⛔ QUOTA EXHAUSTED' : 'rate-limited'} (${ms2}ms)`, short);
    }
    else                       dblog('warn', `HTTP ${r.status} (${ms2}ms)`, short);
    return r;
  } catch(e) {
    clearTimeout(tid);
    const ms2 = Date.now() - t0;
    if (e.name === 'AbortError') {
      dblog('timeout', `Timeout after ${ms2}ms — TM did not respond`, short);
      throw new Error('timeout');
    }
    // NET error — just log, don't rotate proxy (TM bans by API key, not IP — rotating doesn't help)
    const diagnosis = diagnoseNetworkError(e, url);
    dblog('net', `Network error after ${ms2}ms: ${diagnosis}`, short);
    // Rethrow as 'net' so processArtist can detect it separately from API errors
    const err = new Error('net:' + (e.message || 'Failed to fetch'));
    err.isNet = true;
    throw err;
  }
}

function countryAllowed(cc) {
  if (countryMode === 'world') return true;
  if (!cc) return true;
  return countryMode === 'include'
    ? (includeCountries.size === 0 || includeCountries.has(cc))
    : !excludeCountries.has(cc);
}

function apiCountryParam() {
  // TM Discovery API only supports a SINGLE countryCode value — comma-separated silently breaks.
  // For include-mode with exactly 1 country: pass it for server-side filtering.
  // For multiple countries or exclude mode: no param — fetch globally, filter client-side via countryAllowed().
  if (countryMode === 'include' && includeCountries.size === 1) {
    return '&countryCode=' + [...includeCountries][0];
  }
  return '';
}


// Strip diacritics: Siloe -> siloe, Bogota -> bogota
function _normDia(s) { return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function shiftIsoDate(iso, days) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function _normText(s) {
  return _normDia(s)
    .replace(/&/g, ' and ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _splitBillParts(s) {
  return _normText(s)
    .split(/\s*(?:,|\/|\+| x | with | feat\.?| ft\.?| and )\s*/i)
    .map(v => v.trim())
    .filter(Boolean);
}
function _uniqueCI(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const label = String(item || '').trim();
    const key = _normText(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}
function _tokenOverlap(a, b) {
  const aa = new Set(_normText(a).split(' ').filter(w => w.length > 1));
  const bb = new Set(_normText(b).split(' ').filter(w => w.length > 1));
  if (!aa.size || !bb.size) return 0;
  let hits = 0;
  aa.forEach(w => { if (bb.has(w)) hits++; });
  return hits / Math.max(aa.size, bb.size);
}
function _wordBoundaryRe(s) {
  const esc = String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9])' + esc + '([^a-z0-9]|$)', 'i');
}
function _hasBoundaryMatch(needle, haystack) {
  if (!needle || !haystack) return false;
  return _wordBoundaryRe(needle).test(haystack);
}
function _artistAliases(name) {
  const base = _normText(name);
  const aliases = new Set(base ? [base] : []);
  if (base.startsWith('the ')) aliases.add(base.slice(4));
  return [...aliases].filter(Boolean);
}

const FALSE_EVENT_CONTEXT_RE = /\b(experience|tribute|legacy|celebration|salute|story|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|after[- ]party|party|club night|dance night|dance party|brunch|burlesque|drag brunch|performed by|featuring the music of|music of|songs of|sounds of|inspired by|tribute to|vs\.?|meets|battle of|versus|plays the music of|best of)\b/i;
const FALSE_ATTRACTION_CONTEXT_RE = /\b(tribute|experience|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|party|night|brunch|burlesque|drag)\b/i;
const POSITIVE_EVENT_CONTEXT_RE = /\b(live|tour|concert|headline|headlining|special|acoustic|solo|residency|showcase|session|world tour|north american tour|european tour)\b/i;
const FEST_EVENT_RE = /\bfest(?:ival)?\b|open\s+air\b|weekender\b|lollapalooza|coachella|primavera\b|rock\s+(?:en|am|im|al)\b|pal\s+norte|vive\s+latino|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|rock\s+werchter|outside\s+lands|governors\s+ball|bonnaroo|austin\s+city|fuji\s+rock|summer\s+sonic|rolling\s+loud/i;
const FEST_VENUE_HINT_RE = /\b(park|grounds|field|fields|festival|open air|camping|weekender)\b/i;
const TICKET_TIER_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/gi;
const TICKET_TIER_TEST_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/i;

const _EV_QUALIFIER = new Set([
  'live','tour','concert','feat','ft','with','at','in','the','a','an','and',
  'of','vol','part','edition','anniversary','special','acoustic','solo',
  'residency','headline','showcase','session','world','north','american',
  'european','farewell','finale','2023','2024','2025','2026','2027','2028'
]);

function _trimTicketWords(s) {
  return _normText(s).replace(TICKET_TIER_RE, ' ').replace(/\s+/g, ' ').trim();
}
function _venueCore(s) {
  return _trimTicketWords(s)
    .replace(/\b(official|tickets?|stage|hall|club|room)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _cityCore(s) {
  return _normText(s)
    .replace(/\b(city|metropolitan area)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _normalizedUrlKey(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch {
    return String(url || '').split('?')[0].toLowerCase();
  }
}
function _festivalBaseName(name) {
  return _trimTicketWords(name)
    .replace(/\b(20\d{2}|festival|music|weekender|weekend|day\s*\d+|day one|day two|day three|north|south|east|west|official|presented by)\b/g, ' ')
    .replace(/\b(friday|saturday|sunday|jueves|viernes|sabado|domingo)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _isFestivalSelfReference(candidate, festName) {
  const cand = _festivalBaseName(candidate);
  const fest = _festivalBaseName(festName);
  if (!cand || !fest) return false;
  if (cand === fest) return true;
  if (cand.length >= 4 && (fest.includes(cand) || cand.includes(fest))) return true;
  return _tokenOverlap(cand, fest) >= 0.75;
}
function _festivalLineupFromEvent(ev, displayName) {
  const festName = displayName || ev?.name || '';
  const raw = (ev?._embedded?.attractions || []).map(a => a.name).filter(Boolean);
  return _uniqueCI(raw
    .map(name => _trimTicketWords(name))
    .filter(name => {
      if (!name || name.length < 2) return false;
      if (FALSE_ATTRACTION_CONTEXT_RE.test(_normText(name))) return false;
      if (TICKET_TIER_TEST_RE.test(name)) return false;
      return !_isFestivalSelfReference(name, festName);
    }));
}
function isFestivalLikeEvent(ev) {
  const name = _normText(ev?.name || '');
  const venue = _normText(ev?._embedded?.venues?.[0]?.name || '');
  const lineup = _festivalLineupFromEvent(ev, ev?.name || '');
  const rawAttractions = ev?._embedded?.attractions || [];
  if (FEST_EVENT_RE.test(name)) return true;
  if (lineup.length >= 4 || rawAttractions.length >= 6) return true;
  if (lineup.length >= 2 && FEST_VENUE_HINT_RE.test(venue)) return true;
  return false;
}

function _isCleanEvNameMatch(alias, evName) {
  if (!_hasBoundaryMatch(alias, evName)) return false;
  const esc = String(alias || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(esc + '(.*)$', 'i').exec(evName);
  const after = m ? m[1].trim() : '';
  if (!after) return true;
  const fc = after[0];
  if (/[-:,.(\[!?/]/.test(fc)) return true;
  if (/[0-9]/.test(fc)) {
    const num = parseInt(after, 10);
    return num >= 2020 && num <= 2035;
  }
  if (!/^[a-z]/i.test(fc)) return true;
  const w = after.split(/[\s\-:,.!?()[\]\/]+/)[0].toLowerCase();
  return _EV_QUALIFIER.has(w);
}
function _attractionMatchesArtist(artist, attractionName) {
  const target = _normText(attractionName);
  if (!target) return false;
  const parts = _splitBillParts(attractionName);
  return _artistAliases(artist).some(alias => {
    if (!alias) return false;
    if (target === alias) return true;
    if (parts.some(part => {
      if (part === alias) return true;
      if (!_hasBoundaryMatch(alias, part)) return false;
      const remainder = part.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) return false;
      return _tokenOverlap(alias, part) >= 0.7;
    })) return true;
    if (_hasBoundaryMatch(alias, target)) {
      const remainder = target.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) return false;
      if (_tokenOverlap(alias, target) >= 0.7) return true;
    }
    return false;
  });
}
function _eventNameLooksLikeArtistShow(artist, evName) {
  const norm = _normText(evName);
  if (!norm) return false;
  return _artistAliases(artist).some(alias => {
    if (!_isCleanEvNameMatch(alias, norm)) return false;
    const stripped = norm.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
    if (stripped && FALSE_EVENT_CONTEXT_RE.test(stripped)) return false;
    if (!stripped) return true;
    if (POSITIVE_EVENT_CONTEXT_RE.test(stripped)) return true;
    const words = stripped.split(/\s+/).filter(Boolean);
    return words.length <= 2 && words.every(w => _EV_QUALIFIER.has(w) || /^\d{4}$/.test(w));
  });
}

function artistMatch(artist, ev, ambig) {
  const attractions = ev._embedded?.attractions || [];
  if (attractions.some(a => _attractionMatchesArtist(artist, a.name))) return true;
  if (ambig || attractions.length) return false;
  return _eventNameLooksLikeArtistShow(artist, ev.name || '');
}

function _festivalConcertBridge(f, c) {
  if (!f || !c || !f.date || !c.date || !c.artist) return false;
  const from = shiftIsoDate(f.date, -1);
  const to = f.endDate || f.date;
  if (c.date < from || c.date > to) return false;

  const festVenue = _venueCore(f.venue || '');
  const showVenue = _venueCore(c.venue || '');
  const festCity = _cityCore(f.city || '');
  const showCity = _cityCore(c.city || '');
  const sameCountry = !(f.country && c.country) || f.country === c.country;

  if (f.lat != null && f.lng != null && c.lat != null && c.lng != null) {
    const dist = geoDist(f.lat, f.lng, c.lat, c.lng);
    if (dist <= 6) return true;
    if (dist <= 12 && festVenue && showVenue && _tokenOverlap(festVenue, showVenue) >= 0.45) return true;
  }
  if (festVenue && showVenue && (festVenue === showVenue || _tokenOverlap(festVenue, showVenue) >= 0.72)) {
    return sameCountry;
  }
  if (festCity && showCity && festCity === showCity && sameCountry && c.isFest) return true;
  return false;
}
function _festivalLinkedConcerts(f, sourceList = concerts) {
  return (sourceList || []).filter(c => _festivalConcertBridge(f, c));
}
function _resolvedFestivalLineup(f) {
  return _uniqueCI([...(f.lineup || []), ..._festivalLinkedConcerts(f).map(c => c.artist)]);
}
function _lineupArtistHit(artist, lineup) {
  return (lineup || []).some(name => _attractionMatchesArtist(artist, name));
}
function shouldGroupAsVenueFestival(group) {
  const artists = _uniqueCI((group || []).map(c => c.artist));
  if (artists.length < 3) return false;
  const withCoords = (group || []).filter(c => c.lat != null && c.lng != null);
  if (withCoords.length >= 2) {
    const anchor = withCoords[0];
    if (withCoords.some(c => geoDist(anchor.lat, anchor.lng, c.lat, c.lng) > 8)) return false;
  }
  const venue = _venueCore(group?.[0]?.venue || '');
  const city = _cityCore(group?.[0]?.city || '');
  const venueName = _normText(group?.[0]?.venue || '');
  const festSignals = (group || []).some(c => c.isFest) || FEST_VENUE_HINT_RE.test(venueName) || artists.length >= 4;
  return !!(venue || city) && festSignals;
}

function stopScan() {
  scanAborted = true;
  window._scanActive = false;
  document.getElementById('stop-btn').style.display = 'none';
  setStatus('Stopped — showing partial results', false);
}

// ═══════════════════════════════════════════════════════════════
// BIT PRE-FLIGHT SCAN
// ═══════════════════════════════════════════════════════════════
// The key insight here is that Bandsintown is CORS-friendly, has no enforced
// rate limit for reasonable usage, and requires no API key. Instead of calling
// it only as a last-resort fallback after TM fails, we use it as an upfront
// oracle: run all artists in parallel BEFORE the TM scan, collect their shows
// directly, and use the results to decide who even needs a TM query at all.
//
// An artist that BIT says has 0 upcoming events almost certainly isn't touring.
// Combined with totalUpcoming===0 from TM's attraction data, this lets us skip
// the TM event fetch for those artists entirely, dramatically reducing quota use.
//
// Returns: Map<artistName, shows[]>  (empty array = confirmed not touring on BIT)
const TTL_BIT_PREFLIGHT = 12 * 3600e3; // 12h — tour status changes slowly

async function bitPreFlightScan(artists) {
  if (window._bitBlocked) {
    dblog('warn', 'BIT pre-flight: skipped (BIT is blocked this session)');
    return new Map();
  }

  const results = new Map(); // artist → shows[]
  const toCheck = [];

  // Load IDB cache first — avoids re-checking artists we already know about
  for (const artist of artists) {
    const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
    try {
      const cached = await DB.get('meta', cacheKey);
      if (cached && (Date.now() - cached.ts) < TTL_BIT_PREFLIGHT) {
        results.set(artist, cached.shows || []);
        continue;
      }
    } catch(e) {}
    toCheck.push(artist);
  }

  if (!toCheck.length) {
    const touring = [...results.values()].filter(s => s.length > 0).length;
    dblog('info', `BIT pre-flight: all ${artists.length} cached — ${touring} touring`);
    return results;
  }

  dblog('info', `BIT pre-flight: ${toCheck.length} to check (${results.size} cached) · concurrency=8`);
  setProgress(`BIT pre-flight: 0/${toCheck.length} checked…`, 5);

  const today = new Date().toISOString().split('T')[0];
  let checked = 0;
  let idx = 0;

  // Worker coroutine — each of the 8 runs independently until the queue is empty
  async function worker() {
    while (idx < toCheck.length && !scanAborted) {
      const artist = toCheck[idx++];
      const shows = await fetchBIT(artist, today).catch(() => []);
      results.set(artist, shows);

      // Persist to IDB so subsequent smart scans don't re-check
      const cacheKey = 'bit_pf_' + artist.toLowerCase().trim();
      DB.put('meta', cacheKey, { ts: Date.now(), shows }).catch(() => {});

      checked++;
      if (checked % 10 === 0 || checked === toCheck.length) {
        const touring = [...results.values()].filter(s => s.length > 0).length;
        setProgress(`BIT pre-flight: ${checked}/${toCheck.length} · ${touring} on tour`, Math.round(checked / toCheck.length * 18));
      }
    }
  }

  // 8 parallel workers — BIT handles this fine, no shared rate limiter needed
  await Promise.all(Array.from({ length: 8 }, worker));

  const touring = [...results.values()].filter(s => s.length > 0).length;
  const notTouring = results.size - touring;
  dblog('info', `BIT pre-flight done: ${touring} touring · ${notTouring} dormant · ${results.size} total`);
  return results;
}

// ═══════════════════════════════════════════════════════════════
// INVERTED GEO SWEEP
// ═══════════════════════════════════════════════════════════════
// The normal approach asks "what concerts does Artist X have?" for each artist,
// one by one. This inverted approach asks instead "what concerts are happening in
// Mexico (or wherever)?" and then matches those events against the artist list.
//
// Why this is much better for focused geographic searches:
//   Normal:  200 artists × 2 TM requests = 400 requests
//   Inverted: ~10–20 pages of all MX events = 10–20 requests → 95% fewer
//
// Activates automatically when countryMode='include' with ≤5 countries and none
// of them are large markets that would require hundreds of pages to sweep.
//
// Returns: Map<artistName, shows[]>

// Markets too large to sweep efficiently (10k+ events / year each)
const GEO_SWEEP_LARGE_MARKETS = new Set(['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'BR']);
const GEO_SWEEP_MAX_PAGES = 30; // safety cap: 30 pages × 200 events = 6000 events max per country

function shouldUseGeoSweep() {
  if (countryMode !== 'include') return false;
  if (includeCountries.size === 0 || includeCountries.size > 5) return false;
  // Skip if any of the selected countries is a large market
  for (const cc of includeCountries) {
    if (GEO_SWEEP_LARGE_MARKETS.has(cc)) return false;
  }
  return true;
}

async function geoSweepScan(today) {
  // Build a fast lookup: lowercase name → original name (for case-insensitive matching)
  const artistIndex = new Map(ARTISTS.map(a => [a.toLowerCase(), a]));
  const found = new Map(); // artist → shows[]

  dblog('info', `Geo sweep: scanning ${[...includeCountries].join(',')} for all music events, then matching ${ARTISTS.length} artists`);

  for (const cc of includeCountries) {
    if (scanAborted) break;
    let page = 0;
    let totalPages = null;

    while (page < GEO_SWEEP_MAX_PAGES && !scanAborted) {
      await (window._rateLimitedWait?.());
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&classificationName=music&countryCode=${cc}&size=200&page=${page}&sort=date,asc&startDateTime=${today}T00:00:00Z`;

      let evs = [];
      try {
        const r = await apiFetch(url);
        if (r.status === 429) { window._onTm429?.(); await sleep(6000); continue; }
        if (!r.ok) break;
        const d = await r.json();
        evs = d?._embedded?.events || [];

        // On first page, figure out how many total pages exist for logging
        if (page === 0 && d?.page) {
          totalPages = Math.ceil(d.page.totalElements / 200);
          dblog('info', `Geo sweep ${cc}: ${d.page.totalElements} total music events (${totalPages} pages)`);
        }
      } catch(e) {
        dblog('warn', `Geo sweep ${cc} p${page}: ${e.message}`);
        break;
      }

      // Match each event's performers against our artist list
      for (const ev of evs) {
        const date = ev.dates?.start?.localDate;
        if (!date || date < today) continue;

        const v = ev._embedded?.venues?.[0];
        const lat = parseFloat(v?.location?.latitude);
        const lng = parseFloat(v?.location?.longitude);
        const attractions = ev._embedded?.attractions || [];
        for (const attr of attractions) {
          const attrLower = (attr.name || '').toLowerCase();
          if (!artistIndex.has(attrLower)) continue; // not one of our artists

          const artist = artistIndex.get(attrLower);
          const show = {
            id: ev.id, artist, date,
            venue: v?.name || '', city: v?.city?.name || '',
            country: cc, state: v?.state?.stateCode || '',
            lat: isNaN(lat) ? null : lat, lng: isNaN(lng) ? null : lng,
            url: ev.url, eventName: ev.name || '', _src: 'tm_geo', isFest: isFestivalLikeEvent(ev),
          };
          if (!found.has(artist)) found.set(artist, []);
          // Avoid duplicate events (same ID, same artist)
          const existing = found.get(artist);
          if (!existing.some(s => s.id === ev.id)) existing.push(show);
        }
      }

      const pageLabel = totalPages ? `${page + 1}/${totalPages}` : `${page + 1}`;
      setProgress(`Geo sweep ${cc} p${pageLabel}: ${found.size} artists found so far`, 20 + Math.round(page / GEO_SWEEP_MAX_PAGES * 30));

      if (evs.length < 200) break; // reached last page
      page++;
    }

    const cc_shows = [...found.values()].flat().filter(s => s.country === cc).length;
    dblog('ok', `Geo sweep ${cc} done: ${cc_shows} shows, ${page + 1} pages scanned`);
  }

  const totalFound = [...found.values()].flat().length;
  dblog('info', `Geo sweep complete: ${totalFound} shows across ${found.size} artists`);
  return found;
}
