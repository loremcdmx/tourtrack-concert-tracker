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
