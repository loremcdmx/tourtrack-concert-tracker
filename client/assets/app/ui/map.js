'use strict';

function initMap() {
  if (lmap) return;
  // Show floating tab buttons since sidebar starts collapsed
  const floatTabs = document.getElementById('sidebar-open-tabs');
  if (floatTabs) { floatTabs.style.opacity = '1'; floatTabs.style.pointerEvents = 'auto'; }
  // Start at a reasonable zoom/center — renderOverview will immediately fitBounds to
  // actual data on first render, so this is just a placeholder while tiles load.
  // minZoom:2 + worldCopyJump:true prevents the "world repeats 3 times" artifact.
  lmap = L.map('map', {
    zoomControl: false,
    minZoom: 2,
    worldCopyJump: true,
  }).setView([30, 10], 3);
  L.control.zoom({ position:'bottomright' }).addTo(lmap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19
  }).addTo(lmap);

  // Zoom-responsive re-render (overview only, not focus mode)
  let _zRenderTimer = null;
  lmap.on('zoomend', () => {
    // Always clear any pending timer first — even in focus mode.
    // If we return early without clearing, a prior-queued timer would
    // fire 180ms later and destroy focus mode with renderOverview().
    clearTimeout(_zRenderTimer);
    if (focusedArtist || focusedFest) return;
    _zRenderTimer = setTimeout(() => {
      if (focusedArtist || focusedFest) return; // user may have entered focus during debounce
      try { clearMapLayers(); renderOverview(); }
      catch(e) { console.error('[zoomend render]', e); }
    }, 180);
  });
  // Pan: don't re-render markers, just update the visible list
  let _moveTimer = null;
  lmap.on('moveend', () => {
    clearTimeout(_moveTimer);
    _moveTimer = setTimeout(updateVisiblePanel, 150);
  });
}

function clearMapLayers() {
  tourMarkers.forEach(m => m.remove()); tourMarkers = [];
  festMarkers.forEach(m => m.remove()); festMarkers = [];
  routeLines.forEach(l => l.remove()); routeLines = [];
}

function toggleLayer(type) {
  // Update mapTypeFilter to match toggle state, then re-render
  if (type === 't') {
    showMapTours = !showMapTours;
    if (!showMapTours && !showMapFests) { showMapFests = true; } // at least one must be on
    document.getElementById('lt-t').classList.toggle('on-t', showMapTours);
  } else {
    showMapFests = !showMapFests;
    if (!showMapTours && !showMapFests) { showMapTours = true; }
    document.getElementById('lt-f').classList.toggle('on-f', showMapFests);
  }
  mapTypeFilter = (showMapTours && showMapFests) ? 'both' : showMapTours ? 'tours' : 'fests';
  // Sync the filter bar chips
  ['both','tours','fests'].forEach(v => {
    const btn = document.getElementById('mft-' + v);
    if (!btn) return;
    btn.classList.remove('on', 'on-f');
    if (v === mapTypeFilter) btn.classList.add(v === 'fests' ? 'on-f' : 'on');
  });
  clearMapLayers(); renderOverview();
}

// ── VISIBLE-NOW PANEL ───────────────────────────────────────────────────
// Shows which artists/fests have a marker currently in the map viewport.
// Rebuilds on every renderOverview call and on zoomend/moveend.

let _visiblePanelOpen = false;

function toggleVisiblePanel() {
  _visiblePanelOpen = !_visiblePanelOpen;
  const panel = document.getElementById('msb-visible');
  if (panel) panel.classList.toggle('open', _visiblePanelOpen);
  const dateRow = document.getElementById('msb-date-row');
  if (dateRow) dateRow.style.display = _visiblePanelOpen ? 'flex' : 'none';
  if (_visiblePanelOpen) updateVisiblePanel();
}

function updateVisiblePanel() {
  const panel  = document.getElementById('msb-visible');
  const list   = document.getElementById('msb-visible-list');
  const badge  = document.getElementById('msb-visible-count');
  if (!panel || !list || !badge || !lmap) return;

  const bounds = lmap.getBounds();
  const today  = new Date().toISOString().split('T')[0];
  const in7    = dateOffset(7);
  const in30   = dateOffset(30);

  // Collect visible tours — apply ALL active map filters (geo, score, date, hidden)
  const visibleTours = [];
  if (mapTypeFilter !== 'fests') {
    for (const [artist, evs] of Object.entries(allTourData)) {
      if (isHidden(artist)) continue;
      if (!mapScoreOkArtist(artist)) continue;
      const next = evs.find(e =>
        e.date >= today && e.lat && e.lng &&
        geoDisplayOk(e.country || '') &&
        mapDateOk(e.date) &&
        bounds.contains([e.lat, e.lng])
      );
      if (next) {
        visibleTours.push({ type: 'tour', artist, ev: next,
          urgency: next.date <= in7 ? 'urgent' : next.date <= in30 ? 'soon' : 'far' });
      }
    }
  }
  // Sort: urgent first, then soon, then far; within tier by rank
  const urgOrder = { urgent:0, soon:1, far:2 };
  visibleTours.sort((a, b) =>
    (urgOrder[a.urgency] - urgOrder[b.urgency]) ||
    (_rankScore(b.artist) - _rankScore(a.artist)));

  // Collect visible festivals
  const visibleFests = [];
  if (mapTypeFilter !== 'tours') {
    for (const f of festivals) {
      if (f.date >= today && f.lat && f.lng
          && geoDisplayOk(f.country || '') && mapDateOk(f.date) && mapScoreOkFest(f)
          && bounds.contains([f.lat, f.lng])) {
        visibleFests.push(f);
      }
    }
    visibleFests.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  const total = visibleTours.length + visibleFests.length;
  badge.textContent = total;

  // Show panel when we have tours data
  panel.style.display = total > 0 || Object.keys(allTourData).length > 0 ? '' : 'none';

  if (!_visiblePanelOpen) { list.innerHTML = ''; return; }

  if (!total) {
    list.innerHTML = '<div class="msb-vis-empty">Nothing in this area — zoom out or pan</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  // Tours (only when map shows tours)
  if (mapTypeFilter !== 'fests') {
    visibleTours.forEach(({ artist, ev, urgency }) => {
    const row = document.createElement('div');
    row.className = 'msb-vis-row';
    const col = getColor(artist);

    const dot = document.createElement('div');
    dot.className = 'msb-vis-dot';
    dot.style.background = col;
    dot.style.boxShadow = urgency === 'urgent' ? `0 0 5px ${col}` : '';

    const name = document.createElement('div');
    name.className = 'msb-vis-name';
    name.title = artist;
    name.textContent = artist;

    const date = document.createElement('div');
    date.className = 'msb-vis-date';
    date.textContent = fmtDate(ev.date);
    if (urgency === 'urgent') date.style.color = '#ff9060';
    else if (urgency === 'soon') date.style.color = 'var(--accent)';

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(date);

    // Click → focus this artist
    row.onclick = () => { focusArtist(artist); };
    frag.appendChild(row);
  });
  } // end if (mapTypeFilter !== 'fests')

  // Festivals
  visibleFests.forEach(f => {
    const row = document.createElement('div');
    row.className = 'msb-vis-row';

    const dot = document.createElement('div');
    dot.className = 'msb-vis-dot';
    dot.style.background = 'var(--fest)';
    dot.style.borderRadius = '2px'; // diamond-ish

    const name = document.createElement('div');
    name.className = 'msb-vis-name';
    name.title = f.name;
    name.textContent = f.name;

    const lbl = document.createElement('div');
    lbl.className = 'msb-vis-fest';
    lbl.textContent = fmtDate(f.date);

    row.appendChild(dot);
    row.appendChild(name);
    row.appendChild(lbl);
    row.onclick = () => { setTab('fests'); };
    frag.appendChild(row);
  });

  list.innerHTML = '';
  list.appendChild(frag);
}

function renderMap() {
  initMap();
  clearMapLayers();
  const today = new Date().toISOString().split('T')[0];
  allTourData = {};
  // Apply map-local filters: type, score, date window
  const skipTours = mapTypeFilter === 'fests';
  for (const c of visibleConcerts()) {
    if (skipTours) continue; // tours excluded when fests-only mode
    if (c.date < today || isHidden(c.artist)) continue;
    if (!geoDisplayOk(c.country || '')) continue;
    if (!mapDateOk(c.date)) continue;
    if (!mapScoreOkArtist(c.artist)) continue;
    (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
  }
  for (const a in allTourData) { allTourData[a].sort((a,b) => a.date.localeCompare(b.date)); getColor(a); }
  buildSidebar();
  // If an artist was already focused, keep focus mode — don't reset to overview.
  // renderFocusMode handles the case where allTourData[focusedArtist] is missing
  // (case-insensitive fallback + rebuild guard are inside renderFocusMode itself).
  if (focusedArtist) renderFocusMode(focusedArtist);
  else renderOverview();
}

// ── MAP SIDEBAR TOGGLE ───────────────────────────────────────────
function toggleMapSidebar(tab) {
  const sidebar = document.getElementById('map-sidebar');
  const tabs = document.getElementById('sidebar-open-tabs');
  const collapsed = sidebar.classList.contains('collapsed');
  if (collapsed || tab) {
    sidebar.classList.remove('collapsed');
    if (tabs) { tabs.style.opacity = '0'; tabs.style.pointerEvents = 'none'; }
    if (tab) setTab(tab);
  } else {
    sidebar.classList.add('collapsed');
    if (tabs) { tabs.style.opacity = '1'; tabs.style.pointerEvents = 'auto'; }
  }
}

// ── CONCERT CARD DRAWER ──────────────────────────────────────────
function openConcertDrawer(ev) {
  const drawer = document.getElementById('concert-drawer');
  const backdrop = document.getElementById('cdr-backdrop');
  const concertPanel = document.getElementById('cdr-concert-panel');
  const artistPanel = document.getElementById('cdr-artist-panel');

  const col = getColor(ev.artist);
  const plays = ARTIST_PLAYS[(ev.artist||'').toLowerCase()] || 0;
  const fest = _festForConcert(ev);
  const today = new Date().toISOString().split('T')[0];
  const weekday = new Date(ev.date + 'T12:00:00').toLocaleString('en-US', { weekday:'long' });
  const loc = [ev.city, ev.state && ev.country === 'US' ? ev.state : '', ev.country ? flag(ev.country) : ''].filter(Boolean).join(' ');
  const tourShows = [...(
    allTourData[ev.artist] ||
    concerts.filter(c => _normText(c.artist) === _normText(ev.artist))
  )].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const upcomingShows = tourShows.filter(c => c.date >= today);
  const currentIdx = Math.max(0, upcomingShows.findIndex(c =>
    (c.id && ev.id && c.id === ev.id) ||
    (c.date === ev.date && _venueCore(c.venue) === _venueCore(ev.venue) && _cityCore(c.city) === _cityCore(ev.city))
  ));
  const strip = upcomingShows.slice(Math.max(0, currentIdx - 2), Math.max(0, currentIdx - 2) + 6);
  const sameDayPeers = _uniqueCI(concerts
    .filter(c =>
      c.date === ev.date &&
      _normText(c.artist) !== _normText(ev.artist) &&
      _venueCore(c.venue) === _venueCore(ev.venue) &&
      _cityCore(c.city) === _cityCore(ev.city))
    .map(c => c.artist));
  const festLineup = fest ? (fest.lineupResolved || _resolvedFestivalLineup(fest)) : [];
  const festTracked = fest ? (fest.matched || []) : [];
  const ticketUrl = fest?.url || ev.url || '';
  const tourStrip = strip.length ? `
    <div class="cdr-tour-strip">
      <div class="cdr-tour-head">Tour dates</div>
      <div class="cdr-tour-list">
        ${strip.map(stop => {
          const isCurrent = (
            (stop.id && ev.id && stop.id === ev.id) ||
            (stop.date === ev.date && _venueCore(stop.venue) === _venueCore(ev.venue) && _cityCore(stop.city) === _cityCore(ev.city))
          );
          return `
            <div class="cdr-tour-stop${isCurrent ? ' is-current' : ''}">
              <div class="cdr-tour-date">${esc2(fmtDate(stop.date))}</div>
              <div class="cdr-tour-main">${esc2(stop.city || stop.venue || 'Unknown city')}</div>
              <div class="cdr-tour-sub">${esc2(stop.venue || '')}${stop.country ? ` · ${flag(stop.country)}` : ''}</div>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';
  const festCard = fest ? `
    <div class="cdr-fest-card">
      <div class="cdr-fest-head">
        <div>
          <div class="cdr-fest-name">${esc2(fest.name)}</div>
          <div class="cdr-fest-meta">${esc2(fmtDateRange(fest))}${fest.city ? ` · ${esc2(fest.city)}` : ''}${fest.country ? ` ${flag(fest.country)}` : ''}</div>
        </div>
        <div class="cdr-fest-match">${fest.score || 0}</div>
      </div>
      <div class="cdr-mini-note">
        ${festTracked.length ? `${festTracked.length} tracked artist${festTracked.length > 1 ? 's' : ''}` : 'No tracked lineup hits yet'}
        ${festLineup.length ? ` · lineup ${festLineup.length}` : ''}
      </div>
      ${(festTracked.length || festLineup.length) ? `
        <div class="cdr-badge-row" style="margin-top:8px">
          ${festTracked.slice(0, 4).map(m => `<span class="cdr-pill fest">${esc2(m.artist)}</span>`).join('')}
          ${festLineup.filter(name => !festTracked.some(m => _normText(m.artist) === _normText(name))).slice(0, 4).map(name => `<span class="cdr-pill meta">${esc2(name)}</span>`).join('')}
        </div>` : ''}
      ${fest.id ? `<div class="cdr-link-row"><a href="#" onclick="openFestDetail('${esc2(fest.id)}');return false;">Open festival</a></div>` : ''}
    </div>` : '';
  concertPanel.innerHTML = `
    <div class="cdr-label">Concert</div>
    <div class="cdr-title" style="color:${col}">${esc2(ev.artist)}</div>
    ${ev.eventName && _normText(ev.eventName) !== _normText(ev.artist) ? `<div class="cdr-mini-note">${esc2(ev.eventName)}</div>` : ''}
    <div class="cdr-badge-row">
      <span class="cdr-pill">${esc2(fmtDate(ev.date))}</span>
      <span class="cdr-pill meta">${esc2(weekday)}</span>
      ${fest ? `<span class="cdr-pill fest">Festival slot</span>` : ''}
      ${upcomingShows.length > 1 ? `<span class="cdr-pill meta">${upcomingShows.length} tour dates</span>` : ''}
    </div>
    <div class="cdr-kv-grid">
      <div class="cdr-kv">
        <div class="cdr-kv-label">Venue</div>
        <div class="cdr-kv-value">${esc2(ev.venue || 'Unknown venue')}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Location</div>
        <div class="cdr-kv-value">${esc2(loc || 'Unknown location')}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Source</div>
        <div class="cdr-kv-value">${esc2((ev._src || 'tm').toUpperCase())}</div>
      </div>
      <div class="cdr-kv">
        <div class="cdr-kv-label">Status</div>
        <div class="cdr-kv-value">${fest ? 'Festival appearance' : 'Headline / tour stop'}</div>
      </div>
    </div>
    <div class="cdr-link-row">
      ${ticketUrl ? `<a class="cdr-tkt-btn" href="${ticketUrl}" target="_blank">Tickets</a>` : ''}
      ${ev.url && fest && ev.url !== fest.url ? `<a href="${ev.url}" target="_blank">Artist event</a>` : ''}
    </div>
    ${sameDayPeers.length ? `<div class="cdr-mini-note">Same venue/day: ${esc2(sameDayPeers.slice(0, 5).join(', '))}${sameDayPeers.length > 5 ? ` +${sameDayPeers.length - 5}` : ''}</div>` : ''}
    ${tourStrip}
    ${festCard}
  `;

  artistPanel.innerHTML = `
    <div class="cdr-label">Artist</div>
    <div class="cdr-title" style="color:${col}">${esc2(ev.artist)}</div>
    <div class="cdr-badge-row">
      ${plays ? `<span class="cdr-pill">${plays} plays</span>` : ''}
      <span class="cdr-pill meta">${tourShows.length || 1} known shows</span>
      ${fest ? `<span class="cdr-pill fest">Festival linked</span>` : ''}
    </div>
    <div class="cdr-mini-note">${upcomingShows[0] ? `Next stop: ${esc2(fmtDate(upcomingShows[0].date))} · ${esc2(upcomingShows[0].city || upcomingShows[0].venue || '')}` : 'No more upcoming dates in current dataset'}</div>
    <a class="cdr-sp-btn" href="https://open.spotify.com/search/${encodeURIComponent(ev.artist)}" target="_blank">Open in Spotify</a>
    <div class="cdr-tracks-title" style="margin-top:16px">Top tracks</div>
    <div id="cdr-tracks-list" style="color:var(--muted);font-size:.58rem">Loading...</div>
  `;

  backdrop.style.display = '';
  drawer.classList.add('open');

  // Fetch artist photo + top tracks from Deezer
  _loadConcertDrawerData(ev.artist);
}

async function _loadConcertDrawerData(artist) {
  const tracksEl = document.getElementById('cdr-tracks-list');
  const artistPanel = document.getElementById('cdr-artist-panel');
  if (!tracksEl || !artistPanel) return;

  // ── 1. Photo from Deezer (no key needed) ──────────────────────
  try {
    const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=1`);
    const data = await res.json();
    const deezerArtist = data.data?.[0];
    if (deezerArtist?.picture_xl) {
      const img = document.createElement('img');
      img.src = deezerArtist.picture_xl;
      img.className = 'cdr-artist-photo';
      img.onerror = () => img.remove();
      artistPanel.insertBefore(img, artistPanel.firstChild);
    }
  } catch(e) { /* photo non-critical */ }

  // ── 2. Top tracks from Spotify (client credentials, no OAuth) ─
  try {
    const token = await spGetToken();

    // Search for artist
    const sRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(artist)}&type=artist&limit=5`,
      { headers: { Authorization: 'Bearer ' + token } }
    );
    const sData = await sRes.json();
    const items = sData.artists?.items || [];
    const al = artist.toLowerCase();
    const spArtist = items.find(a => a.name.toLowerCase() === al) || items[0];

    if (spArtist?.id) {
      const tRes = await fetch(
        `https://api.spotify.com/v1/artists/${spArtist.id}/top-tracks?market=US`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      const tData = await tRes.json();
      const tracks = (tData.tracks || []).slice(0, 8);

      if (tracks.length) {
        tracksEl.innerHTML = '';
        tracks.forEach(t => {
          const pop = t.popularity || 0;
          const row = document.createElement('div');
          row.className = 'cdr-track';
          row.innerHTML = `
            <div class="cdr-track-play" title="Open on Spotify"
              onclick="window.open('${t.external_urls?.spotify || '#'}','_blank');event.stopPropagation()">▶</div>
            <div class="cdr-track-name">${t.name}</div>
            <div class="cdr-track-plays" title="Spotify popularity ${pop}/100"
              style="display:flex;align-items:center;gap:4px">
              <div style="width:28px;height:3px;border-radius:2px;background:var(--border2);overflow:hidden;flex-shrink:0">
                <div style="width:${pop}%;height:100%;background:var(--accent);border-radius:2px"></div>
              </div>
              <span>${pop}</span>
            </div>
          `;
          tracksEl.appendChild(row);
        });
      } else {
        tracksEl.textContent = 'No track data';
      }
    } else {
      tracksEl.textContent = 'Artist not found on Spotify';
    }
  } catch(e) {
    if (tracksEl) tracksEl.textContent = SERVER_MANAGED_SPOTIFY ? 'Could not load tracks' : 'Top tracks unavailable on this deployment';
  }
}

function closeConcertDrawer() {
  document.getElementById('concert-drawer')?.classList.remove('open');
  document.getElementById('cdr-backdrop').style.display = 'none';
}


// ── SIDEBAR ─────────────────────────────────────────────────────
function setTab(tab) {
  sidebarTab = tab;
  document.getElementById('tab-tours').className   = 'msb-tab' + (tab === 'tours'  ? ' t-on' : '');
  document.getElementById('tab-fests').className   = 'msb-tab' + (tab === 'fests'  ? ' f-on' : '');
  document.getElementById('tab-match').className   = 'msb-tab' + (tab === 'match'  ? ' m-on' : '');
  document.getElementById('tab-errors').className  = 'msb-tab' + (tab === 'errors' ? ' e-on' : '') +
    (Object.keys(fetchErrors).length ? '' : ''); // keep visible/hidden via display:none in updateErrorTab
  document.getElementById('tab-honest').className  = 'msb-tab' + (tab === 'honest' ? ' h-on' : '');
  document.getElementById('pane-tours').classList.toggle('on',   tab === 'tours');
  document.getElementById('pane-fests').classList.toggle('on',   tab === 'fests');
  document.getElementById('pane-match').classList.toggle('on',   tab === 'match');
  document.getElementById('pane-errors').classList.toggle('on',  tab === 'errors');
  document.getElementById('pane-honest').classList.toggle('on',  tab === 'honest');
  document.getElementById('map-sidebar').classList.toggle('fests-mode', tab === 'fests');

  { const _lt = document.getElementById('lt-t'); if (_lt) _lt.style.display = (tab === 'fests' || tab === 'match') ? 'none' : ''; }
  { const _lf = document.getElementById('lt-f'); if (_lf) _lf.style.display = (tab === 'fests' || tab === 'match') ? 'none' : ''; }

  if (tab === 'honest') {
    // Ensure sidebar is open
    const sidebar = document.getElementById('map-sidebar');
    const floatTabs = document.getElementById('sidebar-open-tabs');
    if (sidebar?.classList.contains('collapsed')) {
      sidebar.classList.remove('collapsed');
      if (floatTabs) { floatTabs.style.opacity = '0'; floatTabs.style.pointerEvents = 'none'; }
    }
    buildHonestyPane(); return;
  }
  if (tab === 'errors') { updateErrorTab(); return; }  // just refresh error list, don't touch map
  if (tab === 'match') {
    focusedArtist = null;
    { const _fo1 = document.getElementById('focus-overlay'); if (_fo1) _fo1.style.display = 'none'; }
    { const _mr1 = document.getElementById('map-reset'); if (_mr1) _mr1.style.display = 'none'; }
    if (matchHerMap && Object.keys(matchHerMap).length) renderMatchMap();
    else { clearMapLayers(); lmap && lmap.flyTo && lmap.flyTo([30, 10], 2, { duration:1 }); }
    return;
  }
  if (tab === 'fests') {
    focusedArtist = null; focusedFest = null;
    { const _fo2 = document.getElementById('focus-overlay'); if (_fo2) _fo2.style.display = 'none'; }
    { const _mr2 = document.getElementById('map-reset'); if (_mr2) _mr2.style.display = 'none'; }
    const leg = document.getElementById('map-legend');
    if (leg) leg.style.opacity = '0';
    // Sync map type to Fests if it was Tours-only
    if (mapTypeFilter === 'tours') {
      mapTypeFilter = 'both'; showMapTours = true; showMapFests = true;
      ['both','tours','fests'].forEach(v => {
        const b = document.getElementById('mft-'+v);
        if (b) { b.classList.remove('on','on-f'); if (v==='both') b.classList.add('on'); }
      });
    }
    clearMapLayers();
    renderFestMap(null);
  } else {
    const leg = document.getElementById('map-legend');
    if (leg) leg.style.opacity = '1';
    // Sync map type to Tours if it was Fests-only
    if (mapTypeFilter === 'fests') {
      mapTypeFilter = 'both'; showMapTours = true; showMapFests = true;
      ['both','tours','fests'].forEach(v => {
        const b = document.getElementById('mft-'+v);
        if (b) { b.classList.remove('on','on-f'); if (v==='both') b.classList.add('on'); }
      });
    }
    clearMapLayers();
    _rebuildMapData();
    if (focusedArtist && allTourData[focusedArtist]) renderFocusMode(focusedArtist);
    else renderOverview();
  }
}

function toggleUnrankedFests(checked) {
  showUnrankedFests = checked;
  buildFestPanel();
}

function setFestSort(s) {
  festSort = s;
  document.getElementById('fsort-score').classList.toggle('on', s === 'score');
  document.getElementById('fsort-date').classList.toggle('on', s === 'date');
  buildFestPanel();
}

function setArtistSort(s) {
  artistSort = s;
  document.getElementById('asort-list').classList.toggle('on', s === 'list');
  document.getElementById('asort-alpha').classList.toggle('on', s === 'alpha');
  document.getElementById('asort-shows').classList.toggle('on', s === 'shows');
  persistSettings();
  buildSidebar();
}

function setArtistPreset(preset) {
  artistPreset = preset;
  document.querySelectorAll('[data-ap]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.ap === preset));
  persistSettings();
  buildSidebar();
}

function applyArtistPreset(list) {
  if (artistPreset === 'all') return list;
  const today = new Date().toISOString().split('T')[0];
  if (artistPreset === 'fav') {
    return list.filter(artist => favoriteArtists.has((artist || '').toLowerCase()));
  }
  if (artistPreset === 'dense') {
    return list.filter(artist => (allTourData[artist] || []).length >= 3);
  }
  if (artistPreset === 'soon') {
    const soon = dateOffset(30);
    return list.filter(artist => (allTourData[artist] || []).some(ev => ev.date >= today && ev.date <= soon));
  }
  if (artistPreset === 'ending') {
    const endWindow = dateOffset(90);
    return list.filter(artist => {
      const evs = allTourData[artist] || [];
      const last = evs[evs.length - 1]?.date || '';
      return evs.length >= 3 && last >= today && last <= endWindow;
    });
  }
  if (artistPreset === 'top') {
    const ranked = [...list].sort((a, b) => _rankScore(b) - _rankScore(a));
    const keep = new Set(ranked.slice(0, Math.min(20, Math.max(8, Math.ceil(ranked.length * 0.3)))));
    return list.filter(artist => keep.has(artist));
  }
  return list;
}

function sortedArtists() {
  const keys = Object.keys(allTourData);
  if (artistSort === 'alpha') {
    return keys.sort((a, b) => a.localeCompare(b));
  }
  if (artistSort === 'shows') {
    return keys.sort((a, b) => allTourData[b].length - allTourData[a].length || a.localeCompare(b));
  }
  // 'list' — sort by plays desc (if plays data exists), then by textarea line order
  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  const lineIdx  = Object.fromEntries(ARTISTS.map((a, i) => [a.toLowerCase(), i]));
  return keys.sort((a, b) => {
    if (hasPlays) {
      const pa = ARTIST_PLAYS[a.toLowerCase()] || 0;
      const pb = ARTIST_PLAYS[b.toLowerCase()] || 0;
      if (pa !== pb) return pb - pa; // more plays = higher
    }
    // Tie-break: preserve textarea order
    const ia = lineIdx[a.toLowerCase()] ?? Infinity;
    const ib = lineIdx[b.toLowerCase()] ?? Infinity;
    return ia !== ib ? ia - ib : a.localeCompare(b);
  });
}

// ═══════════════════════════════════════════════════════════════
// MATCH — find shared artists between two playlists
// ═══════════════════════════════════════════════════════════════

function matchSetStatus(msg, cls) {
  const el = document.getElementById('match-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'match-status' + (cls ? ' ' + cls : '');
}
function matchSetProgress(done, total) {
  const bar = document.getElementById('match-progress');
  const fill = document.getElementById('match-prog-fill');
  if (bar) bar.style.display = '';
  if (fill) fill.style.width = (total ? done / total * 100 : 20) + '%';
}
function matchClearProgress() {
  const bar = document.getElementById('match-progress');
  if (bar) bar.style.display = 'none';
}

async function runMatch() {
  const raw = (document.getElementById('match-url').value || '').trim();
  const pid = spExtractId(raw);
  if (!pid) { matchSetStatus('⚠ Paste a valid Spotify playlist URL', 'err'); return; }
  if (!ARTISTS.length) { matchSetStatus('⚠ Load your playlist first (Settings → Import)', 'err'); return; }

  const btn = document.getElementById('match-btn');
  btn.disabled = true; btn.textContent = 'Loading…';
  matchSetStatus('Authenticating…');
  matchSetProgress(0, 0);

  try {
    const token = await spGetToken();
    matchSetStatus('Fetching her playlist…');

    // Wrap spFetchAllTracks to feed our progress bar
    const { playlist, tracks } = await (async () => {
      const res = await spFetch(`https://api.spotify.com/v1/playlists/${pid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `HTTP ${res.status}`); }
      const pl = await res.json();
      const trks = [];
      const total = pl.tracks.total;
      pl.tracks.items.forEach(i => { if (i?.track) trks.push(i.track); });
      matchSetProgress(trks.length, total);
      let next = pl.tracks.next;
      while (next) {
        const r = await spFetch(next, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) break;
        const page = await r.json();
        page.items.forEach(i => { if (i?.track) trks.push(i.track); });
        next = page.next;
        matchSetProgress(trks.length, total);
      }
      return { playlist: pl, tracks: trks };
    })();

    // Build her artist map
    matchHerMap = {};
    tracks.forEach(track => {
      if (!track || track.is_local) return;
      (track.artists || []).forEach(a => {
        const key = a.name.toLowerCase();
        if (!matchHerMap[key]) matchHerMap[key] = { name: a.name, count: 0 };
        matchHerMap[key].count++;
      });
    });

    // Find intersection with my artists
    matchShared = [];
    for (const myName of ARTISTS) {
      const key = myName.toLowerCase();
      if (matchHerMap[key]) {
        matchShared.push({
          name: myName,
          myCount:  ARTIST_PLAYS[key] || 0,
          herCount: matchHerMap[key].count,
          combined: (ARTIST_PLAYS[key] || 0) + matchHerMap[key].count,
        });
      }
    }
    matchShared.sort((a, b) => b.combined - a.combined);

    matchClearProgress();
    matchSetStatus(`✓ "${playlist.name}" · ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();

  } catch(e) {
    matchClearProgress();
    matchSetStatus('⚠ ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    btn.disabled = false; btn.textContent = '▶ Match';
  }
}

async function runMatchV2() {
  const raw = (document.getElementById('match-url').value || '').trim();
  const pid = spExtractId(raw);
  if (!pid) { matchSetStatus('Paste a valid Spotify playlist URL', 'err'); return; }
  if (!ARTISTS.length) { matchSetStatus('Load your playlist first (Settings -> Import)', 'err'); return; }

  const btn = document.getElementById('match-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Loading...';
  }
  matchSetStatus('Opening playlist...');
  matchSetProgress(0, 0);

  try {
    const { playlist, tracks } = await spFetchPlaylistImport(pid);
    matchSetProgress(tracks.length || 1, tracks.length || 1);

    matchHerMap = {};
    tracks.forEach(track => {
      if (!track || track.is_local) return;
      (track.artists || []).forEach(a => {
        const key = a.name.toLowerCase();
        if (!matchHerMap[key]) matchHerMap[key] = { name: a.name, count: 0 };
        matchHerMap[key].count++;
      });
    });

    matchShared = [];
    for (const myName of ARTISTS) {
      const key = myName.toLowerCase();
      if (matchHerMap[key]) {
        matchShared.push({
          name: myName,
          myCount: ARTIST_PLAYS[key] || 0,
          herCount: matchHerMap[key].count,
          combined: (ARTIST_PLAYS[key] || 0) + matchHerMap[key].count,
        });
      }
    }
    matchShared.sort((a, b) => b.combined - a.combined);

    matchClearProgress();
    matchSetStatus(`"${playlist.name}" · ${matchShared.length} shared artists`, 'ok');
    buildMatchPane();
    renderMatchMap();
  } catch (e) {
    matchClearProgress();
    if (e.status === 401 && SERVER_MANAGED_SPOTIFY_LOGIN) {
      setSpotifyAuthFlash('Connect Spotify to open private or collaborative playlists.', 'error');
      renderOnboardSpotifyAuth();
    }
    matchSetStatus('⚠ ' + (e.message || 'Something went wrong'), 'err');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '▶ Match';
    }
  }
}

function buildMatchPane() {
  const body = document.getElementById('match-body');
  if (!body) return;
  const today = new Date().toISOString().split('T')[0];

  if (!matchShared.length) {
    body.innerHTML = '<div style="padding:20px 14px;font-size:.6rem;color:var(--muted2);text-align:center">No shared artists found.</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  // ── Shared concerts section ──
  const concertHd = document.createElement('div');
  concertHd.className = 'match-section-hd';
  const sharedWithShows = matchShared.filter(s => allTourData[s.name]);
  concertHd.innerHTML = `<span>🎸 Shared artists on tour</span><span class="match-section-cnt purple">${sharedWithShows.length}</span>`;
  frag.appendChild(concertHd);

  if (sharedWithShows.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px 14px;font-size:.6rem;color:var(--muted2)';
    empty.textContent = 'None of your shared artists have upcoming shows in the current data.';
    frag.appendChild(empty);
  } else {
    sharedWithShows.forEach(s => {
      const col = getColor(s.name);
      const evs = allTourData[s.name] || [];
      const next = evs.find(e => e.date >= today);
      const row = document.createElement('div');
      row.className = 'match-artist-row';
      row.innerHTML = `
        <div class="match-dot" style="background:${col}"></div>
        <div class="match-aname">${s.name}</div>
        <div class="match-plays">
          <span class="match-plays-me" title="Your plays">${s.myCount > 0 ? '▶ '+s.myCount : '·'}</span>
          <span class="match-plays-her" title="Her plays">♡ ${s.herCount}</span>
        </div>`;
      row.onclick = () => {
        // Switch to tours tab and focus this artist
        setTab('tours');
        focusArtist(s.name);
      };
      frag.appendChild(row);
    });
  }

  // ── Festival ranking section ──
  const festHd = document.createElement('div');
  festHd.className = 'match-section-hd';
  festHd.style.marginTop = '4px';

  // Score festivals by combined taste
  const scoredFests = matchScoreFestivals();
  const topFests = scoredFests.filter(f => f.matchScore > 0).slice(0, 30);
  festHd.innerHTML = `<span>🎪 Festivals for both of you</span><span class="match-section-cnt purple">${topFests.length}</span>`;
  frag.appendChild(festHd);

  if (!topFests.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:10px 14px;font-size:.6rem;color:var(--muted2)';
    empty.textContent = 'No festivals scored — scan data first.';
    frag.appendChild(empty);
  } else {
    const maxScore = topFests[0].matchScore || 1;
    topFests.forEach(f => {
      const scoreNorm = Math.round((f.matchScore / maxScore) * 100);
      const card = document.createElement('div');
      card.className = 'match-fcard';
      const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
      const myChips  = f.matchedMe.slice(0,3).map(m => `<span class="match-chip-me" title="Your list">▶ ${m}</span>`).join('');
      const herChips = f.matchedHer.slice(0,3).map(m => `<span class="match-chip-her" title="Her list">♡ ${m}</span>`).join('');
      const sharedChips = f.matchedShared.slice(0,4).map(m => `<span class="match-chip-shared">★ ${m}</span>`).join('');
      const extra = (f.matchedShared.length + f.matchedMe.length + f.matchedHer.length) > 7
        ? `<span class="match-chip-shared" style="opacity:.5">+${f.matchedShared.length + f.matchedMe.length + f.matchedHer.length - 7}</span>` : '';
      card.innerHTML = `
        <div class="match-fcard-top">
          <div class="match-fcard-ring">${scoreNorm}</div>
          <div class="match-fcard-info">
            <div class="match-fcard-name">${f.name}</div>
            <div class="match-fcard-meta">${fmtDate(f.date)} · ${loc}</div>
          </div>
          ${f.url ? `<a style="font-size:.52rem;color:var(--muted2);text-decoration:none;flex-shrink:0" href="${f.url}" target="_blank" onclick="event.stopPropagation()">Tickets</a>` : ''}
        </div>
        <div class="match-fcard-chips">${sharedChips}${myChips}${herChips}${extra}</div>
        <div class="match-fcard-bar"><div class="match-fcard-bar-fill" style="width:${scoreNorm}%"></div></div>`;
      card.onclick = e => {
        if (e.target.tagName === 'A') return;
        clearMapLayers(); renderFestMap(f.id);
      };
      frag.appendChild(card);
    });
  }

  body.innerHTML = '';
  body.appendChild(frag);
}

function matchScoreFestivals() {
  // Weight function — same tier system as scoreFestivals
  const pw = plays => {
    if (!plays || plays <= 0) return 0;
    if (plays === 1) return 2;
    if (plays <= 3)  return 5 + plays;
    if (plays <= 10) return 12 + plays * 0.5;
    return 20 + Math.log2(plays);
  };

  const mySet  = new Set(ARTISTS.map(a => a.toLowerCase()));
  const herSet = new Set(Object.keys(matchHerMap));
  const re = a => new RegExp(`(^|[^a-z])${(a||'').toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}([^a-z]|$)`);

  return festivals.map(f => {
    const ll   = (f.lineup||[]).map(n => n.toLowerCase());
    const fn   = (f.name||'').toLowerCase();
    const test = name => {
      const r = re(name);
      return ll.length ? ll.some(l => r.test(l)) : r.test(fn);
    };

    const matchedShared = [], matchedMe = [], matchedHer = [];
    let score = 0;

    // My artists
    for (const myName of ARTISTS) {
      if (!test(myName)) continue;
      const key = myName.toLowerCase();
      const myW = pw(ARTIST_PLAYS[key] || 0);
      if (herSet.has(key)) {
        const herW = pw(matchHerMap[key].count);
        matchedShared.push(myName);
        score += (myW + herW) * 1.5; // shared = bonus
      } else {
        matchedMe.push(myName);
        score += myW;
      }
    }
    // Her-only artists
    for (const herKey of herSet) {
      if (mySet.has(herKey)) continue; // already handled
      const herName = matchHerMap[herKey].name;
      if (!test(herName)) continue;
      matchedHer.push(herName);
      score += pw(matchHerMap[herKey].count);
    }

    return { ...f, matchScore: score, matchedShared, matchedMe, matchedHer };
  }).sort((a, b) => b.matchScore - a.matchScore || a.date.localeCompare(b.date));
}

function renderMatchMap() {
  if (!lmap) { initMap(); }
  clearMapLayers();
  const today = new Date().toISOString().split('T')[0];
  const sharedNames = new Set(matchShared.map(s => s.name));

  // Plot only shared artist concerts
  let bounds = [];
  matchShared.forEach(s => {
    const evs = allTourData[s.name];
    if (!evs) return;
    const col = getColor(s.name);
    evs.forEach(ev => {
      if (!ev.lat || !ev.lng) return;
      const m = L.circleMarker([ev.lat, ev.lng], {
        radius: 7, color: '#e87fff', fillColor: col, fillOpacity: 0.85, weight: 2
      }).addTo(lmap);
      m.bindPopup(`<div style="font-family:'DM Mono',monospace;font-size:11px;line-height:1.6">
        <strong>${s.name}</strong><br>${fmtDate(ev.date)}<br>${ev.venue || ''}${ev.city ? ' · '+ev.city : ''}
        ${ev.url ? `<br><a href="${ev.url}" target="_blank" style="color:#e87fff">Tickets</a>` : ''}
      </div>`);
      tourMarkers.push(m);
      bounds.push([ev.lat, ev.lng]);
    });
  });

  if (bounds.length) {
    lmap.fitBounds(L.latLngBounds(bounds).pad(0.15), { maxZoom: 6 });
  }
}

// ── HONESTY PANE ────────────────────────────────────────────────
function buildHonestyPane() {
  const el = document.getElementById('honest-body');

  function item(tag, tagCls, text) {
    return `<div class="honest-item">
      <span class="honest-tag ${tagCls}">${tag}</span>
      <span class="honest-text">${text}</span>
    </div>`;
  }

  // Live diagnostics
  const totalArtists = ARTISTS.length;
  const hasData = concerts.length || festivals.length;
  const artistsWithShows = Object.keys(allTourData).length;
  const artistsNoShows = totalArtists - artistsWithShows;
  const dupeCheck = (() => {
    const raw  = concerts.length;
    const deduped = visibleConcerts().length;
    return raw - deduped;
  })();

  const scopeNote = countryMode === 'world'
    ? 'Worldwide — no country filter on API calls'
    : countryMode === 'include' && includeCountries.size > 1
      ? `⚠ Include-mode with ${includeCountries.size} countries — TM API only accepts 1 countryCode, so no server-side geo filter is active. All results fetched, filtered client-side. <strong>Slow + uses more quota.</strong>`
      : countryMode === 'include' && includeCountries.size === 1
        ? `1 country set — server-side filter active (fast)`
        : `Exclude mode — no server-side filter, client-side only`;

  el.innerHTML = `
<div class="honest-h1">✅ Fixed / shipped</div>

${item('FIXED', 'htag-fix', '<strong>attractionId fetch:</strong> Resolve each artist\'s TM <code>attractionId</code> first → query by ID, not keyword. Up to 1000 shows (5×200), no keyword noise. Keyword fallback retained for artists not in TM.')}
${item('FIXED', 'htag-fix', '<strong>Diacritic matching:</strong> "Síloé" finds "Siloe", "Arda Bogotá" finds "Arda Bogota". Two-pass: exact name → diacritic-normalized → ASCII fallback API request.')}
${item('FIXED', 'htag-fix', '<strong>Hi-Fi / substring false matches:</strong> Attraction name match now requires artist to appear at start or after a bill separator (×, &, +). "Mungos Hi Fi" no longer matches "Hi-Fi".')}
${item('FIXED', 'htag-fix', '<strong>Duplicate shows:</strong> Three-pass dedup — venue key, city+country, and city+country+date across sources. Catches TM + BIT returning same show independently.')}
${item('FIXED', 'htag-fix', '<strong>Multi-day festival date ranges:</strong> "Jun 26–28, 2026" or "Jun 30–Jul 2, 2026" displayed on all cards. endDate preserved through deduplication.')}
${item('FIXED', 'htag-fix', '<strong>Festival map labels with collision avoidance:</strong> Labels sorted by score (high priority first), each tries 6 positions; lowest-score label hides when all overlap. Recalculates on zoom so hidden labels can reappear.')}
${item('FIXED', 'htag-fix', '<strong>No USA / No CA / No UK geo filters:</strong> Applied to calendar, map markers, route lines, festival labels, and ON SCREEN panel simultaneously.')}
${item('FIXED', 'htag-fix', '<strong>Map sidebar collapsed by default:</strong> Floating tab buttons show on map edge. Clicking Tours/Fests/Match opens sidebar to the right tab.')}
${item('FIXED', 'htag-fix', '<strong>ON SCREEN panel respects all active filters:</strong> Geo, score, date, hidden artists — list matches exactly what\'s on the map.')}
${item('FIXED', 'htag-fix', '<strong>Concert card drawer:</strong> Click any concert row → bottom sheet with full concert info + artist photo (Deezer), top 8 Spotify tracks with real global popularity score (0–100), Spotify link. Uses existing Spotify Client Credentials — no extra OAuth needed.')}
${item('FIXED', 'htag-fix', '<strong>Map type ↔ sidebar tab sync:</strong> Selecting "Fests" on map switches sidebar to Festivals tab (and vice versa). No more showing concert list while fests-only map is active.')}
${item('FIXED', 'htag-fix', '<strong>Festival ticket links:</strong> When an artist\'s map marker is a festival appearance, "Tickets →" links to the festival page, not the individual concert listing.')}
${item('FIXED', 'htag-fix', '<strong>Stats bar, last-show badge, BIT cross-check, favorites, festival rescan progress bar.</strong> (Prior sessions.)')}

<div class="honest-h1">⚠ Active workarounds</div>

${item('HACK', 'htag-hack', '<strong>Festival lineup from TM attractions:</strong> TM only populates attractions[] if they explicitly linked performers. Most LatAm and smaller festivals return empty lineup → score = 0. Artist cross-reference via geo+venue+date is a best-effort workaround.')}
${item('HACK', 'htag-hack', '<strong>Concert drawer photo:</strong> Artist photo still from Deezer (no key needed). Tracks are Spotify top-tracks with real popularity score. If Spotify credentials are missing, tracks section shows a prompt.')}
${item('HACK', 'htag-hack', '<strong>Festival map popup artist list:</strong> TM often stores tour name as attraction instead of individual bands. "My artists" section may be empty for small fests where TM has no structured data.')}
${item('HACK', 'htag-hack', '<strong>Bandsintown CORS:</strong> BIT API called from browser. If CORS tightened, fallback silently returns [].')}
${item('HACK', 'htag-hack', '<strong>Multi-country speed:</strong> 30 EU countries = 30+ sequential API calls for festival discovery. ~10s in EU-include mode.')}
${item('HACK', 'htag-hack', '<strong>Artist matching is intentionally conservative:</strong> tribute / candlelight / cover-style events are filtered harder now, so a few edge-case promoter titles may still be skipped until Ticketmaster links the real attraction correctly.')}

<div class="honest-h1">📊 Live diagnostics</div>

${hasData ? `
${item('INFO', 'htag-limit', `Artists loaded: <strong>${totalArtists}</strong> · on tour: <strong>${artistsWithShows}</strong> · no shows found: <strong>${artistsNoShows}</strong>`)}
${item('INFO', 'htag-limit', `Concerts: <strong>${concerts.length}</strong> · Festivals: <strong>${festivals.length}</strong>`)}
${item('INFO', 'htag-limit', `Festival appearances in tour data: <strong>${concerts.filter(c=>c.isFest).length}</strong>`)}
${item('INFO', 'htag-limit', `BIT-sourced shows: <strong>${Object.values(allTourData).reduce((s,evs)=>s+evs.filter(e=>e._src==='bit').length,0)}</strong>`)}
${item('INFO', 'htag-limit', `Shows per artist (avg / max): <strong>${artistsWithShows ? Math.round(concerts.length / artistsWithShows) : 0} / ${Math.max(0, ...Object.values(allTourData).map(e => e.length))}</strong> — low is normal: TM only lists shows sold via TM.`)}
${dupeCheck > 0
  ? item('INFO', 'htag-limit', `<strong>${dupeCheck} probable duplicate entries</strong> hidden. ⧉ in map toolbar reveals them.`)
  : item('OK', 'htag-fix', 'No probable duplicates detected.')
}
${item('INFO', 'htag-limit', `Geo scope: ${scopeNote}`)}
` : item('INFO', 'htag-limit', 'No data loaded yet — run a scan to see live diagnostics.')}

<div class="honest-h1">🚧 Still needs engineering</div>

${item('TODO', 'htag-todo', '<strong>Festival lineup enrichment:</strong> No reliable free API. Setlist.fm (key needed) or Songkick would be better sources.')}

<div style="margin-top:16px;padding:8px 10px;background:var(--s2);border-radius:6px;border:1px solid var(--border);font-size:.58rem;color:var(--muted2);line-height:1.6">
  v${APP_VERSION} · Updated this session. All items above are observed behaviors, not theoretical edge cases.
</div>`;
}

function buildStats() {
  const el = document.getElementById('msb-stats');
  const today = new Date().toISOString().split('T')[0];
  const in30  = new Date(); in30.setDate(in30.getDate() + 30);
  const in30s = in30.toISOString().split('T')[0];
  const in90  = new Date(); in90.setDate(in90.getDate() + 90);
  const in90s = in90.toISOString().split('T')[0];

  const artistsOnTour = Object.keys(allTourData).length;
  if (!artistsOnTour) { if (el) el.style.display = 'none'; return; }
  // Show map filter bar when we have data
  const filtersEl = document.getElementById('msb-filters');
  if (filtersEl) {
    filtersEl.style.display = '';
    const maxVal = document.getElementById('mfilt-max-val');
    if (maxVal) maxVal.textContent = MAP_MAX_ARTISTS;
  }

  // Tours ending soon: last show is within 90 days, tour has ≥5 shows
  const endingSoon = Object.entries(allTourData).filter(([, evs]) => {
    if (evs.length < 5) return false;
    const last = evs[evs.length - 1].date;
    return last >= today && last <= in90s;
  });

  // Total upcoming shows
  const totalShows = Object.values(allTourData).reduce((s, evs) => s + evs.length, 0);

  // Source breakdown
  const bitShows = Object.values(allTourData).reduce((s, evs) =>
    s + evs.filter(e => e._src === 'bit').length, 0);

  const sep = '<span class="msb-stat-sep">·</span>';
  const items = [
    `<span class="msb-stat"><strong>${artistsOnTour}</strong> on tour</span>`,
    sep,
    `<span class="msb-stat"><strong>${totalShows}</strong> shows</span>`,
  ];
  if (endingSoon.length) {
    items.push(sep);
    items.push(`<span class="msb-stat" style="color:#ff8080"><strong>${endingSoon.length}</strong> tours ending <90d</span>`);
  }
  if (bitShows > 0) {
    items.push(sep);
    items.push(`<span class="msb-stat" title="Bandsintown supplemental data"><strong>${bitShows}</strong> via BIT</span>`);
  }

  el.innerHTML = items.join('');
  el.style.display = 'flex';
}

function buildSidebar() {
  buildStats();
  const today = new Date().toISOString().split('T')[0];
  const in90  = new Date(); in90.setDate(in90.getDate() + 90);
  const in90s = in90.toISOString().split('T')[0];
  document.querySelectorAll('[data-ap]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.ap === artistPreset));

  // Show/hide fav-only toggle
  const favBtn = document.getElementById('lt-fav');
  if (favBtn) favBtn.style.display = favoriteArtists.size ? '' : 'none';

  // Show dupe-toggle button only when there are actually hidden dupes
  const dupesBtn = document.getElementById('dupes-toggle');
  if (dupesBtn) {
    const rawCount   = concerts.length;
    const dedupCount = visibleConcerts().length;
    const hiddenDupes = rawCount - dedupCount;
    dupesBtn.style.display = hiddenDupes > 0 ? '' : 'none';
    dupesBtn.style.color       = showPossibleDupes ? 'var(--accent)' : '';
    dupesBtn.style.borderColor = showPossibleDupes ? 'var(--accent)' : '';
    dupesBtn.style.background  = showPossibleDupes ? 'rgba(200,255,95,.08)' : '';
    dupesBtn.title = !showPossibleDupes && hiddenDupes > 0
      ? `${hiddenDupes} possible duplicate show${hiddenDupes !== 1 ? 's' : ''} hidden — click to show`
      : 'Showing all entries including possible duplicates — click to hide';
  }

  let artists = sortedArtists();
  if (showFavOnly) artists = artists.filter(a => favoriteArtists.has(a.toLowerCase()));
  artists = applyArtistPreset(artists);

  document.getElementById('msb-all').classList.toggle('on', focusedArtist === null);
  document.getElementById('msb-all-cnt').textContent =
    showFavOnly ? `${artists.length} favorites` : artistPreset === 'all' ? `${artists.length} artists` : `${artists.length} filtered`;

  const list = document.getElementById('msb-list');

  // Show reset button if there are favorites
  const existingReset = list.parentElement.querySelector('.fav-reset-btn');
  if (existingReset) existingReset.remove();
  if (favoriteArtists.size > 0) {
    const rb = document.createElement('button');
    rb.className = 'fav-reset-btn';
    rb.textContent = `✕ Clear ${favoriteArtists.size} favorites`;
    rb.style.cssText = 'display:block;margin:6px 14px 2px;font-size:.52rem;';
    rb.onclick = resetFavorites;
    list.before(rb);
  }

  if (!artists.length) {
    const emptyMsg = showFavOnly
      ? 'No favorites on tour'
      : artistPreset === 'all'
        ? 'No tour data'
        : 'No artists match this preset';
    list.innerHTML = `<div style="padding:16px;font-size:.62rem;color:var(--muted2)">${emptyMsg}</div>`;
    buildFestPanel(); return;
  }

  const frag = document.createDocumentFragment();
  artists.forEach(artist => {
    const col = getColor(artist);
    const evs = allTourData[artist];
    const isFav = favoriteArtists.has(artist.toLowerCase());
    const row = document.createElement('div');
    row.className = 'msb-artist' + (focusedArtist === artist ? ' on' : '');
    if (isFav) row.style.borderLeft = '2px solid rgba(255,215,0,.7)';
    row.dataset.artist = artist;

    const showCount = evs.length;
    const badgeCol = showCount >= 5 ? 'var(--accent)' : showCount >= 2 ? 'var(--text)' : 'var(--muted)';
    const lastDate = evs[evs.length - 1]?.date || '';
    // ENDING: last known show within 90 days AND tour has ≥3 shows (short gigs don't "end")
    const isEndingSoon = evs.length >= 3 && lastDate >= today && lastDate <= in90s;
    const nextShow = evs.find(e => e.date >= today);
    const metaText = nextShow
      ? `${nextShow.city || nextShow.venue || '—'}${nextShow.country ? ' ' + flag(nextShow.country) : ''}`
      : evs[0]?.city || '—';

    // In "My list" mode show plays score visually — a bar + play count label
    const plays = ARTIST_PLAYS[artist.toLowerCase()] || 0;
    const _allPlays = Object.values(ARTIST_PLAYS);
    const topPlays = _allPlays.length ? Math.max(1, ..._allPlays) : 1;
    const playBarPct = (artistSort === 'list' && plays > 0)
      ? Math.round(plays / topPlays * 100) : 0;
    const playsLabel = (artistSort === 'list' && plays > 0)
      ? `<span style="font-size:.48rem;color:var(--accent);font-family:'DM Mono',monospace;opacity:.9">${plays}▶</span>` : '';

    row.innerHTML = `
      <button class="msb-star ${isFav ? 'on' : ''}" title="${isFav ? 'Unfavorite' : 'Favorite'}">★</button>
      <div class="msb-dot" style="background:${col}${isFav ? ';box-shadow:0 0 7px rgba(255,215,0,.55)' : ''}"></div>
      <div class="msb-ainfo">
        <div class="msb-aname">${artist}</div>
        <div class="msb-ameta">${metaText}</div>
        ${playBarPct > 0 ? `<div style="height:2px;border-radius:1px;background:var(--s3);overflow:hidden;margin-top:3px;width:80px"><div style="height:100%;width:${playBarPct}%;background:var(--accent);border-radius:1px;opacity:.55"></div></div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
        ${playsLabel}
        <span style="font-size:.54rem;color:${badgeCol};font-family:'DM Mono',monospace">${showCount}×</span>
        ${isEndingSoon ? '<span style="font-size:.44rem;color:#ff8080;letter-spacing:.04em">ENDING</span>' : ''}
      </div>
      <button class="msb-focus">→</button>`;
    row.querySelector('.msb-star').onclick  = e => toggleFavorite(artist, e);
    row.querySelector('.msb-focus').onclick = e => { e.stopPropagation(); focusArtist(artist); };
    row.onclick = () => focusArtist(artist);
    frag.appendChild(row);
  });
  list.innerHTML = '';
  list.appendChild(frag);
  buildFestPanel();
}

function buildFestPanel() {
  const today = new Date().toISOString().split('T')[0];
  const upFests = festivals.filter(f => f.date >= today && geoDisplayOk(f.country || '') && dateMatchesPreset(f.date));
  const withM = upFests.filter(f => f.score > 0).length;
  document.getElementById('tab-fests').textContent = upFests.length ? `🎪 Festivals · ${withM}★` : '🎪 Festivals';

  const container = document.getElementById('fest-cards');
  // Sync checkbox to state (handles cases where the DOM is rebuilt)
  const cb = document.getElementById('show-unranked-cb');
  if (cb) cb.checked = showUnrankedFests;
  if (!upFests.length) { container.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">No festivals match current date / location filters</div>'; return; }

  // Respect the "show unranked" toggle — filter out score=0 fests when off
  const displayFests = showUnrankedFests ? upFests : upFests.filter(f => (f.score || 0) > 0);

  // Update the empty-state message to explain why the list might be short
  if (!displayFests.length) {
    container.innerHTML = '<div style="padding:16px;font-size:.62rem;color:var(--muted2)">'
      + (showUnrankedFests ? 'No festivals match current filters' : 'No ranked festivals in current filters — enable "unranked" to see all')
      + '</div>';
    return;
  }

  const sorted = [...displayFests].sort((a, b) =>
    festSort === 'date' ? a.date.localeCompare(b.date) : ((b.score - a.score) || a.date.localeCompare(b.date))
  );
  const frag = document.createDocumentFragment();
  sorted.forEach(f => {
    const score = f.score || 0, matched = f.matched || [];
    const lineup = f.lineupResolved || _resolvedFestivalLineup(f);
    const linkedShows = f.linkedShows || _festivalLinkedConcerts(f).length;
    // score is already 0-100 (normalized in scoreFestivals)
    const perfect = score >= 80 && matched.length >= 2;
    const ringCls = perfect ? 'p' : score > 0 ? 's' : '';
    const loc = [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ');
    const lineupMeta = [
      matched.length ? `${matched.length} tracked` : '',
      lineup.length ? `lineup ${lineup.length}` : '',
      linkedShows ? `${linkedShows} linked` : ''
    ].filter(Boolean).join(' · ');

    const card = document.createElement('div');
    card.className = 'fcard' + (f.id === focusedFest ? ' hl' : '');
    card.dataset.id = f.id;

    const hasPlays = matched.some(m => m.plays > 0);
    const chips = matched.slice(0,6).map((m, i) => {
      const playsTag = hasPlays && m.plays > 0
        ? `<span style="opacity:.55;margin-left:3px">${m.plays}</span>`
        : '';
      return `<span class="fcard-chip${i<2?' top':''}">${m.artist}${playsTag}</span>`;
    }).join('');

    const ringLabel = score > 0 ? score : '—';

    card.innerHTML = `
      <div class="fcard-top">
        <div class="fcard-ring ${ringCls}" title="${score}/100">${ringLabel}</div>
        <div class="fcard-info">
          <div class="fcard-name">${f.name}</div>
          <div class="fcard-meta">${fmtDateRange(f)}${f.endDate ? '<span style="font-size:.5rem;margin-left:4px;opacity:.6;vertical-align:middle">'+(Math.round((new Date(f.endDate)-new Date(f.date))/86400000)+1)+'d</span>' : ''} · ${loc}</div>
          ${lineupMeta ? `<div class="fcard-meta" style="opacity:.72">${lineupMeta}</div>` : ''}
        </div>
        ${f.url ? `<a class="fcard-tkt" href="${f.url}" target="_blank">Tickets</a>` : ''}
      </div>
      <div class="fcard-chips" data-fid="${f.id}">${matched.length ? chips : '<span class="fcard-none">No tracked artists</span>'}</div>
      ${score > 0 ? `<div class="fcard-bar"><div class="fcard-bar-fill${perfect?' p':''}" style="width:${score}%"></div></div>` : ''}`;

    // Add +N chip via DOM (so click handler can expand inline)
    if (matched.length > 6) {
      const chipsEl = card.querySelector('.fcard-chips');
      const more = document.createElement('span');
      more.className = 'fcard-chip fcard-chip-more';
      more.textContent = `+${matched.length - 6}`;
      more.title = 'Show all';
      more.onclick = e => {
        e.stopPropagation();
        more.remove();
        matched.slice(6).forEach(m => {
          const pl = hasPlays && m.plays > 0 ? `<span style="opacity:.55;margin-left:3px">${m.plays}</span>` : '';
          const chip = document.createElement('span');
          chip.className = 'fcard-chip';
          chip.innerHTML = m.artist + pl;
          chipsEl.appendChild(chip);
        });
      };
      card.querySelector('.fcard-chips').appendChild(more);
    }

    card.onclick = e => { if (e.target.tagName === 'A' || e.target.classList.contains('fcard-chip-more')) return; openFestDetail(f.id); };
    frag.appendChild(card);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

function filterArtists() {
  const q = document.getElementById('msb-search').value.trim().toLowerCase();
  document.querySelectorAll('.msb-artist').forEach(r => {
    r.style.display = !q || (r.dataset.artist||'').toLowerCase().includes(q) ? '' : 'none';
  });
}

// ── FOCUS MODE ───────────────────────────────────────────────────
function focusArtist(artist) {
  focusedArtist = artist;
  { const _mr3 = document.getElementById('map-reset'); if (_mr3) _mr3.style.display = artist ? '' : 'none'; }
  document.querySelectorAll('.msb-artist').forEach(r => r.classList.toggle('on', r.dataset.artist === artist));
  document.getElementById('msb-all').classList.toggle('on', artist === null);
  clearMapLayers();

  if (!artist) {
    { const _fo3 = document.getElementById('focus-overlay'); if (_fo3) _fo3.style.display = 'none'; }
    lmap.flyTo([30, 10], 2, { duration:1 });
    renderOverview();
  } else {
    // Switch to tours tab visually if needed — but don't call setTab() which would
    // trigger a second clearMapLayers()+renderFocusMode() call and double fitBounds.
    if (sidebarTab !== 'tours') {
      sidebarTab = 'tours';
      document.getElementById('tab-tours').className = 'msb-tab t-on';
      document.getElementById('tab-fests').className = 'msb-tab';
      document.getElementById('tab-match').className = 'msb-tab';
      document.getElementById('pane-tours').classList.add('on');
      document.getElementById('pane-fests').classList.remove('on');
      document.getElementById('pane-match').classList.remove('on');
      document.getElementById('map-sidebar').classList.remove('fests-mode');
      const leg = document.getElementById('map-legend'); if (leg) leg.style.opacity = '1';
      const _lt = document.getElementById('lt-t'); if (_lt) _lt.style.display = '';
      const _lf = document.getElementById('lt-f'); if (_lf) _lf.style.display = '';
    }
    { const _fo4 = document.getElementById('focus-overlay'); if (_fo4) _fo4.style.display = 'block'; }
    renderFocusMode(artist);
  }
}

function renderFocusMode(artist) {
  // allTourData keys are canonical names from concerts[]. Two failure modes:
  // 1. allTourData was wiped by a mid-scan renderMap() while focusedArtist was
  //    still set — we rebuild it before the lookup.
  // 2. Name case/whitespace mismatch between the click closure and the stored key
  //    — we do a case-insensitive fallback.
  if (Object.keys(allTourData).length === 0 && concerts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    for (const c of concerts) {
      if (c.date < today || isHidden(c.artist)) continue;
      (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
    }
    for (const a in allTourData) allTourData[a].sort((a, b) => a.date.localeCompare(b.date));
  }
  let evs = allTourData[artist];
  if (!evs) {
    const lower = artist.toLowerCase();
    const key = Object.keys(allTourData).find(k => k.toLowerCase() === lower);
    if (key) { evs = allTourData[key]; artist = key; }
  }
  if (!evs) { renderOverview(); return; }
  const col = getColor(artist);
  const today = new Date().toISOString().split('T')[0];
  const future = evs.filter(e => e.date >= today);
  const display = future.length ? future : evs;

  document.getElementById('focus-name').textContent = artist;
  { const _fn = document.getElementById('focus-name'); if (_fn) _fn.style.color = col; }
  document.getElementById('focus-sub').textContent =
    `${display.length} show${display.length!==1?'s':''} · ${future.length} upcoming`;

  // Build a venue+date → other tracked artists map for festival co-detection
  // Key: date|venueSlug — same logic as calendar grouping
  const venueSlug = c => `${c.date}|${(c.venue||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,25)}`;
  const venueMap = new Map(); // key → [artistName, ...]
  for (const c of concerts) {
    const k = venueSlug(c);
    if (!venueMap.has(k)) venueMap.set(k, []);
    venueMap.get(k).push(c.artist);
  }

  // Build a date+city → festival info map
  const festMap = new Map(); // date|city → festival
  for (const f of festivals) {
    const k = `${f.date}|${(f.city||'').toLowerCase().slice(0,15)}`;
    if (!festMap.has(k)) festMap.set(k, f);
  }

  const listEl = document.getElementById('focus-list');
  const frag = document.createDocumentFragment();

  display.forEach((ev, i) => {
    const dayObj  = new Date(ev.date + 'T12:00:00');
    const dayNum  = ev.date.slice(8);
    const month   = dayObj.toLocaleString('en-US', { month:'short' }).toUpperCase();
    const dayName = dayObj.toLocaleString('en-US', { weekday:'short' }).toUpperCase();

    // Co-artist detection: other tracked artists at same venue
    const vk = venueSlug(ev);
    const coAtVenue = (venueMap.get(vk) || [])
      .filter(a => a !== artist && a.toLowerCase() !== artist.toLowerCase());

    // Festival match: same date+city
    const fk = `${ev.date}|${(ev.city||'').toLowerCase().slice(0,15)}`;
    const matchedFest = festMap.get(fk);
    const festCoArtists = matchedFest
      ? (matchedFest.matched || []).filter(m => m.artist.toLowerCase() !== artist.toLowerCase())
      : [];

    // Merge co-artists (prefer festCoArtists as they have plays data)
    const coArtists = festCoArtists.length
      ? festCoArtists
      : coAtVenue.map(a => ({ artist: a, plays: ARTIST_PLAYS[a.toLowerCase()] || 0 }));

    const isFest = coArtists.length >= 2 || !!matchedFest;
    // LAST SHOW: only flag the actual final show in the list, and only for real tours (≥3 shows)
    const isLast = i === display.length - 1 && display.length >= 3;

    const row = document.createElement('div');
    row.className = 'fshow' + (i === 0 ? ' active' : '');

    // Accent bar
    const accent = document.createElement('div');
    accent.className = 'fshow-accent';
    accent.style.background = i === 0 ? col : 'transparent';
    row.appendChild(accent);

    // Date header
    const head = document.createElement('div');
    head.className = 'fshow-head';
    head.innerHTML = `
      <span class="fshow-date" style="color:${col}">${dayNum} ${month}</span>
      <span class="fshow-day">${dayName}${isFest ? '<span class="fshow-fest-badge">FEST</span>' : ''}${isLast ? '<span class="fshow-last-badge">LAST SHOW</span>' : ''}</span>`;

    // Body: city, venue, co-artists, footer
    const body = document.createElement('div');
    body.className = 'fshow-body';

    const cityLine = document.createElement('div');
    cityLine.className = 'fshow-city';
    cityLine.textContent = ev.city || ev.venue || '?';

    const venueLine = document.createElement('div');
    venueLine.className = 'fshow-venue';
    venueLine.textContent = ev.venue || '';

    body.appendChild(cityLine);
    body.appendChild(venueLine);

    // Co-artist chips
    if (coArtists.length) {
      const coEl = document.createElement('div');
      coEl.className = 'fshow-co';
      // Show self first then others
      const selfChip = document.createElement('span');
      selfChip.className = 'fshow-co-chip self';
      selfChip.textContent = artist;
      coEl.appendChild(selfChip);

      coArtists.slice(0, 5).forEach(m => {
        const chip = document.createElement('span');
        chip.className = 'fshow-co-chip';
        const label = m.plays > 0 ? `${m.artist} ${m.plays}` : m.artist;
        chip.textContent = label;
        coEl.appendChild(chip);
      });
      if (coArtists.length > 5) {
        const more = document.createElement('span');
        more.className = 'fshow-co-chip';
        more.style.opacity = '.5';
        more.textContent = `+${coArtists.length - 5} more`;
        coEl.appendChild(more);
      }
      body.appendChild(coEl);
    }

    // Footer: flag + tickets
    const foot = document.createElement('div');
    foot.className = 'fshow-foot';
    const flagEl = document.createElement('span');
    flagEl.className = 'fshow-flag';
    flagEl.textContent = ev.country ? flag(ev.country) : '';
    foot.appendChild(flagEl);

    if (ev.url) {
      const tkt = document.createElement('a');
      tkt.className = 'fshow-tkt';
      tkt.href = ev.url; tkt.target = '_blank';
      tkt.textContent = 'Tickets →';
      tkt.style.borderColor = col; tkt.style.color = col;
      tkt.onclick = e => e.stopPropagation();
      foot.appendChild(tkt);
    }
    body.appendChild(foot);

    row.appendChild(head);
    row.appendChild(body);

    // Click = fly to venue, highlight accent
    row.onclick = () => {
      document.querySelectorAll('.fshow').forEach(r => {
        r.classList.remove('active');
        const _fa1 = r.querySelector('.fshow-accent'); if (_fa1) _fa1.style.background = 'transparent';
      });
      row.classList.add('active');
      accent.style.background = col;
      if (ev.lat) lmap.flyTo([ev.lat, ev.lng], 11, { duration:.7 });
    };

    frag.appendChild(row);
  });

  listEl.innerHTML = '';
  listEl.appendChild(frag);

  // "← All artists" footer — lets user close without scrolling back to the top.
  // Useful when a tour has many shows (The Neighbourhood had 19, user had to scroll to bottom).
  const backFooter = document.createElement('div');
  backFooter.style.cssText = 'padding:14px;border-top:1px solid var(--border);text-align:center;';
  const backBtn = document.createElement('button');
  backBtn.style.cssText = 'font-family:"DM Mono",monospace;font-size:.6rem;padding:6px 16px;' +
    'border-radius:var(--r);border:1px solid var(--border2);background:var(--s2);' +
    'color:var(--muted);cursor:pointer;transition:all .12s;width:100%;';
  backBtn.textContent = '← All artists';
  backBtn.onmouseenter = () => { backBtn.style.borderColor = 'var(--accent)'; backBtn.style.color = 'var(--accent)'; };
  backBtn.onmouseleave = () => { backBtn.style.borderColor = ''; backBtn.style.color = ''; };
  backBtn.onclick = () => focusArtist(null);
  backFooter.appendChild(backBtn);
  listEl.appendChild(backFooter);

  // Map: geo-index → display-index (fixes row sync when non-geo shows exist)
  const geoToDisplay = {};
  let gi = 0;
  display.forEach((ev, di) => { if (ev.lat) geoToDisplay[gi++] = di; });

  // Map: draw route + numbered markers
  const coords = display.filter(e => e.lat);
  if (coords.length > 1)
    routeLines.push(L.polyline(coords.map(e => [e.lat, e.lng]),
      { color: col, weight: 2.5, opacity: .65, dashArray: '6 4' }).addTo(lmap));

  coords.forEach((ev, i) => {
    const dispIdx  = geoToDisplay[i] ?? i; // corrected display index
    const first = i === 0;
    // Check isFest flag OR cross-reference with festivals[] by date+geo
    const matchedFest = _festForConcert(ev);
    const isFestShow = ev.isFest || !!matchedFest;
    const festName = matchedFest ? matchedFest.name : null;
    const sz = first ? 28 : 22;

    let markerHtml;
    if (isFestShow && !first) {
      markerHtml = `<div style="width:${sz}px;height:${sz}px;border-radius:4px;transform:rotate(45deg);
        background:rgba(8,8,10,.92);border:2px solid #ffaa3c;
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(-45deg);font-family:'DM Mono',monospace;font-weight:700;font-size:.52rem;color:#ffaa3c">${i+1}</span>
      </div>`;
    } else {
      markerHtml = `<div style="width:${sz}px;height:${sz}px;border-radius:50%;
        background:${first ? col : 'rgba(8,8,10,.92)'};border:2px solid ${col};
        color:${first ? '#fff' : col};display:flex;align-items:center;justify-content:center;
        font-family:'DM Mono',monospace;font-weight:700;font-size:${first?'.6':'.52'}rem;
        box-shadow:0 2px 12px rgba(0,0,0,.7);cursor:pointer">${i+1}</div>`;
    }

    const icon = L.divIcon({ className:'', iconSize:[sz, sz], iconAnchor:[sz/2, sz/2], html: markerHtml });
    // Show festival name in popup when the concert is actually a fest appearance
    const popTitle = isFestShow && festName
      ? `<b style="color:#ffaa3c">🎪 ${festName}</b><br><span style="color:${col};font-size:.62rem">${artist}</span>`
      : `<b style="color:${col}">${artist}</b>`;
    // For fest appearances, prefer the festival's own ticket URL over the artist-specific one
    const ticketUrl = (isFestShow && matchedFest?.url) ? matchedFest.url : (ev.url || '');
    const pop = `${popTitle} #${i+1}<br>${fmtDate(ev.date)}<br>
      ${ev.venue}<br><span style="color:var(--muted)">${ev.city} ${ev.country ? flag(ev.country) : ''}</span>
      ${ticketUrl ? `<br><a href="${ticketUrl}" target="_blank" style="color:${isFestShow?'#ffaa3c':col}">Tickets →</a>` : ''}`;
    // bubblingMouseEvents:false prevents click bubbling to the map where
    // Leaflet's closePopupOnClick would immediately close the just-opened popup.
    const mk = L.marker([ev.lat, ev.lng], { icon, bubblingMouseEvents: false })
      .addTo(lmap)
      .bindPopup(pop, { autoPan: true, autoPanPaddingTopLeft: [10,10], autoPanPaddingBottomRight: [10,80] });
    mk.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      const rows = document.querySelectorAll('.fshow');
      rows.forEach((r, ri) => {
        const isThis = ri === dispIdx;  // use corrected index
        r.classList.toggle('active', isThis);
        const _fa2 = r.querySelector('.fshow-accent'); if (_fa2) _fa2.style.background = isThis ? col : 'transparent';
        if (isThis) r.scrollIntoView({ behavior:'smooth', block:'nearest' });
      });
    });
    tourMarkers.push(mk);
  });

  // Fly to fit all markers
  if (coords.length > 0) {
    const bounds = L.latLngBounds(coords.map(e => [e.lat, e.lng]));
    lmap.fitBounds(bounds, { padding:[40, 320], maxZoom:8, duration:.9 });
  }
}

// Maximum artists to show on the map overview when results are abundant.
// When more than this pass the filters, only the top MAP_MAX_ARTISTS by rank
// are rendered as markers. The sidebar list still shows everyone.
// This is a `let` so the in-map stepper control can change it without a reload.
let MAP_MAX_ARTISTS = 30;
let _mapWasCapped = false;   // true when last render trimmed to top 20
let _mapFirstFit  = false;   // becomes true after the first fitBounds — prevents jumping on filter changes

// ── Festival map popup — rich card with lineup ──────────────────
function _buildFestPopup(f) {
  const cc      = f.country ? ' ' + flag(f.country) : '';
  const dateStr = fmtDateRange(f);
  let matched   = (f.matched || []).slice();
  const lineup  = f.lineupResolved || _resolvedFestivalLineup(f);
  const matchedNames = new Set(matched.map(m => _normText(m.artist || m)));

  for (const artist of ARTISTS) {
    const key = _normText(artist);
    if (!key || matchedNames.has(key) || !_lineupArtistHit(artist, lineup)) continue;
    matchedNames.add(key);
    matched.push({ artist, plays: ARTIST_PLAYS[key] || 0, weight: ARTIST_PLAYS[key] || 0 });
  }
  matched.sort((a, b) => (b.plays || b.weight || 0) - (a.plays || a.weight || 0));

  const topOther = lineup
    .filter(n => !matchedNames.has(_normText(n)) && !_isFestivalSelfReference(n, f.name))
    .slice(0, 6);
  const linkedShows = _festivalLinkedConcerts(f).filter(c => !isHidden(c.artist));

  // My artists row
  const myRows = matched.map(m => {
    const name  = m.artist || m;
    const plays = m.plays  || 0;
    const col   = getColor(name);
    return `<div style="display:flex;align-items:center;gap:6px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05)">
      <span style="width:8px;height:8px;border-radius:50%;background:${col};flex-shrink:0"></span>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:.72rem;color:${col};flex:1">${esc2(name)}</span>
      ${plays > 0 ? `<span style="font-size:.55rem;color:rgba(255,255,255,.35);font-family:'DM Mono',monospace">${plays}×</span>` : ''}
    </div>`;
  }).join('');

  // Other top headliners row
  const otherRows = topOther.length ? `
    <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.08)">
      <div style="font-size:.46rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:4px">Headliners</div>
      ${topOther.map(n => `<div style="font-size:.64rem;color:rgba(255,255,255,.5);padding:1px 0">${esc2(n)}</div>`).join('')}
    </div>` : '';

  const hasLineup = matched.length > 0 || topOther.length > 0;
  const lineupBlock = hasLineup ? `
    <div style="margin-top:10px">
      ${myRows}
      ${otherRows}
    </div>` : '';

  const scoreBar = f.score > 0 ? `
    <div style="margin-top:8px;height:2px;background:rgba(255,255,255,.1);border-radius:1px;overflow:hidden">
      <div style="height:100%;width:${f.score}%;background:#ffaa3c;border-radius:1px"></div>
    </div>` : '';

  // Poster image (from TM or a Songkick/Bands-in-Town fallback via Google image search not available)
  // We use TM's stored image directly. Clicking opens the ticket page.
  const imgHtml = f.imageUrl ? `
    <a href="${f.url || '#'}" target="_blank" style="display:block;margin-bottom:10px;border-radius:6px;overflow:hidden;line-height:0;border:1px solid rgba(255,170,60,.2)">
      <img src="${f.imageUrl}" alt="${esc2(f.name)}"
        style="width:100%;max-height:140px;object-fit:cover;display:block"
        onerror="this.parentElement.style.display='none'">
    </a>` : '';

  return `<div style="min-width:260px;max-width:320px">
    ${imgHtml}
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;color:#ffaa3c;line-height:1.2;margin-bottom:3px">${esc2(f.name)}</div>
    <div style="font-size:.64rem;color:rgba(255,255,255,.65);margin-bottom:1px">${dateStr}</div>
    ${f.venue ? `<div style="font-size:.6rem;color:rgba(255,255,255,.45)">${esc2(f.venue)}</div>` : ''}
    <div style="font-size:.58rem;color:rgba(255,255,255,.35);margin-bottom:4px">${esc2(f.city)}${cc}</div>
    <div style="font-size:.54rem;color:rgba(255,255,255,.42);margin-bottom:4px">
      ${matched.length ? `${matched.length} tracked` : '0 tracked'}${lineup.length ? ` · lineup ${lineup.length}` : ''}${linkedShows.length ? ` · linked ${linkedShows.length}` : ''}
    </div>
    ${lineupBlock}
    ${scoreBar}
    ${f.url ? `<div style="margin-top:10px"><a href="${f.url}" target="_blank" style="color:#ffaa3c;font-size:.64rem;font-family:'DM Mono',monospace;text-decoration:none;letter-spacing:.02em">🎫 Tickets →</a></div>` : ''}
  </div>`;
}

// ── Festival label renderer — called from renderOverview AND on zoom ────
// On zoom: only redraws festMarkers (cheap), tour markers stay in place.
function _renderFestLabels() {
  if (!lmap) return;
  // Remove existing fest markers only
  festMarkers.forEach(m => m.remove()); festMarkers = [];

  const today = new Date().toISOString().split('T')[0];
  const skipFests = mapTypeFilter === 'tours';
  if (skipFests) return;

  const festsToRender = festivals.filter(f => f.date >= today && f.lat && f.lng
    && geoDisplayOk(f.country || '') && mapDateOk(f.date) && mapScoreOkFest(f));

  // High-score fests get label priority in collision resolution
  festsToRender.sort((a, b) => (b.score||0) - (a.score||0));

  // Occupied rectangles in screen px [x, y, w, h]
  const occupied = [];
  const PX_PAD = 6;
  const rectOverlap = (a, b) =>
    a[0] < b[0]+b[2]+PX_PAD && a[0]+a[2]+PX_PAD > b[0] &&
    a[1] < b[1]+b[3]+PX_PAD && a[1]+a[3]+PX_PAD > b[1];

  festsToRender.forEach(f => {
    const score = f.score || 0;
    const pct   = score / 100;
    const col   = pct > .6 ? '#c8ff5f' : pct > .25 ? '#ffaa3c' : '#d4813a';
    const colBg = pct > .6 ? 'rgba(200,255,95,' : pct > .25 ? 'rgba(255,170,60,' : 'rgba(200,120,60,';
    const fs    = score === 0 ? 10 : score < 25 ? 11 : score < 50 ? 13 : score < 75 ? 15 : 18;
    const fw    = score >= 50 ? 700 : score >= 25 ? 600 : 500;
    const opacity = score === 0 ? 0.55 : 0.78 + pct * 0.22;
    const sz    = Math.round(5 + pct * 7);
    const shortName = f.name.length > 24 ? f.name.slice(0, 22) + '\u2026' : f.name;

    const labelW = Math.round(shortName.length * fs * 0.62);
    const labelH = fs + 2;
    const totalH = labelH + 3 + sz;
    const totalW = Math.max(labelW, sz + 4);

    const pt = lmap.latLngToContainerPoint([f.lat, f.lng]);

    // Candidate offsets: above, below, right, left, lower-right, lower-left
    const offsets = [
      [0, 0],
      [0, totalH + sz],
      [totalW + 2, -totalH/2],
      [-(totalW + 2), -totalH/2],
      [totalW/2, totalH],
      [-totalW/2, totalH],
    ];

    // Base rect when label is above
    const baseRect = [pt.x - totalW/2, pt.y - totalH, totalW, totalH];

    let chosenOffset = null;
    for (const [dx, dy] of offsets) {
      const rect = [baseRect[0]+dx, baseRect[1]+dy, totalW, totalH];
      if (!occupied.some(o => rectOverlap(rect, o))) {
        chosenOffset = [dx, dy];
        occupied.push(rect);
        break;
      }
    }

    // If every position overlaps — render dot only (no label text), so location is still visible
    const renderLabel = chosenOffset !== null;
    const [dx, dy] = chosenOffset || [0, 0];

    const html = renderLabel
      ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none">
          <div style="font-family:'Syne',sans-serif;font-weight:${fw};font-size:${fs}px;
            color:${col};opacity:${opacity};white-space:nowrap;
            text-shadow:0 1px 5px rgba(0,0,0,.95),0 0 10px rgba(0,0,0,.9);
            letter-spacing:.01em;line-height:1">${shortName}</div>
          <div style="width:${sz}px;height:${sz}px;border:1.5px solid ${col};
            transform:rotate(45deg);background:${colBg}.18);border-radius:1px;opacity:${opacity}"></div>
        </div>`
      // Dot-only when label hidden due to overlap
      : `<div style="width:${sz}px;height:${sz}px;border:1.5px solid ${col};
            transform:rotate(45deg);background:${colBg}.18);border-radius:1px;
            opacity:${Math.max(opacity - 0.1, 0.35)}"></div>`;

    const dotOnlyW = sz + 4, dotOnlyH = sz + 4;
    const w = renderLabel ? totalW : dotOnlyW;
    const h = renderLabel ? totalH : dotOnlyH;
    const anchorX = renderLabel ? (totalW/2 - dx) : dotOnlyW/2;
    const anchorY = renderLabel ? (totalH - dy)   : dotOnlyH;

    const icon = L.divIcon({ className:'', iconSize:[w, h], iconAnchor:[anchorX, anchorY], html });
    const popup = _buildFestPopup(f);
    const mk = L.marker([f.lat, f.lng], { icon, zIndexOffset: Math.round(score * 5) })
      .addTo(lmap).bindPopup(popup, { maxWidth: 340, className: 'fest-map-popup' });
    festMarkers.push(mk);
  });

  if (!showMapFests) festMarkers.forEach(m => m.remove());
}

function renderOverview() {
  const today = new Date().toISOString().split('T')[0];
  const in7   = dateOffset(7);
  const in30  = dateOffset(30);
  const in90  = dateOffset(90);
  const zoom  = lmap ? lmap.getZoom() : 3;

  // Fav filter applied to full entry set
  let tourEntries = Object.entries(allTourData).filter(([a]) =>
    !showFavOnly || favoriteArtists.has(a.toLowerCase())
  );

  // ── Top-N cap ─────────────────────────────────────────────────
  // When too many artists pass all the map filters, showing all of them
  // produces a noisy unreadable dot-cloud. Cap the map to the top 20 by
  // rank score so the most relevant artists are always visible.
  const totalPassing = tourEntries.length;
  if (totalPassing > MAP_MAX_ARTISTS) {
    // Sort descending by rank
    const ranked = tourEntries
      .map(([a, evs]) => ({ artist: a, evs, rank: _rankScore(a) }))
      .sort((a, b) => b.rank - a.rank);

    // Take top N
    const top = ranked.slice(0, MAP_MAX_ARTISTS);
    const topSet = new Set(top.map(x => x.artist));

    // Country coverage: for each country that has concerts but no artist in top N,
    // add the highest-ranked artist from that country
    const today2 = new Date().toISOString().split('T')[0];
    const coveredCountries = new Set();
    top.forEach(({ evs }) => evs.forEach(e => { if (e.date >= today2 && e.country) coveredCountries.add(e.country); }));

    ranked.slice(MAP_MAX_ARTISTS).forEach(({ artist, evs, rank }) => {
      const artistCountries = new Set(evs.filter(e => e.date >= today2 && e.country).map(e => e.country));
      const uncovered = [...artistCountries].filter(cc => !coveredCountries.has(cc));
      if (uncovered.length > 0) {
        top.push({ artist, evs, rank });
        uncovered.forEach(cc => coveredCountries.add(cc));
      }
    });

    tourEntries = top.map(({ artist, evs }) => [artist, evs]);
    _mapWasCapped = true;
  } else {
    _mapWasCapped = false;
  }
  // Update sidebar cap notice
  const capNotice = document.getElementById('map-cap-notice');
  if (capNotice) {
    if (_mapWasCapped) {
      capNotice.textContent = `Top ${MAP_MAX_ARTISTS} of ${totalPassing} shown — use filters to narrow`;
      capNotice.style.display = '';
    } else {
      capNotice.style.display = 'none';
    }
  }

  // ── 1. ROUTE LINES (all zoom levels) ──────────────────────────
  // We clip each artist's route to only include points that are within
  // the viewport (padded 80%) so zooming into a region doesn't show
  // dangling lines flying off to distant continents.
  const bounds = lmap.getBounds().pad(0.8);
  tourEntries.forEach(([artist, evs]) => {
    const pts = evs.filter(e => e.lat && e.date >= today);
    if (pts.length < 2) return;

    // Only keep points within the padded viewport, OR that are adjacent
    // to a visible point (so lines exit the viewport smoothly rather than
    // hard-stopping at the edge). We do a two-pass: mark in-bounds pts,
    // then include immediate neighbors.
    const inBounds = pts.map(e => bounds.contains([e.lat, e.lng]));
    const keep = pts.map((_, i) =>
      inBounds[i] ||
      (i > 0              && inBounds[i - 1]) ||
      (i < pts.length - 1 && inBounds[i + 1])
    );

    // Gather the kept points into continuous segments (split on gaps)
    const segments = [];
    let seg = null;
    pts.forEach((e, i) => {
      if (keep[i]) {
        if (!seg) { seg = []; segments.push(seg); }
        seg.push([e.lat, e.lng]);
      } else {
        seg = null; // gap — start a new segment on next kept point
      }
    });

    if (!segments.length) return;
    const isFav = favoriteArtists.has(artist.toLowerCase());
    const rank  = _rankScore(artist);
    const col   = getColor(artist);
    segments.forEach(segPts => {
      if (segPts.length < 2) return;
      routeLines.push(L.polyline(segPts, {
        color: col,
        weight:  isFav ? 2 : rank > 150 ? 1.5 : 0.9,
        opacity: isFav ? .45 : rank > 150 ? .22 : rank > 50 ? .14 : .08,
        dashArray: '4 9'
      }).addTo(lmap));
    });
  });

  // ── 2. FUTURE SHOW DOTS at zoom > 7 (tiny, along route) ───────
  if (zoom > 7) {
    tourEntries.forEach(([artist, evs]) => {
      const col = getColor(artist);
      const nextGeo = evs.find(e => e.date >= today && e.lat);
      evs.filter(e => e.lat && e.date >= today && e !== nextGeo).forEach(ev => {
        const sz = 3;
        tourMarkers.push(L.marker([ev.lat, ev.lng], { icon: L.divIcon({
          className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2],
          html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${col};opacity:.35"></div>`
        })}).addTo(lmap));
      });
    });
  }

  // ── 3. NEXT-SHOW MARKERS — city clustered ─────────────────────
  // Group each artist's next geolocated show into city buckets.
  // KEY FIX: prefer the first in-bounds future show over the globally-first show.
  // This prevents "ghost lines" — route lines that enter the viewport but whose
  // marker is off-screen because the artist's next show is in a different region.
  const vpBounds = lmap.getBounds().pad(0.15); // tighter than route-line padding
  const cityMap = new Map();
  tourEntries.forEach(([artist, evs]) => {
    const futureGeo = evs.filter(e => e.date >= today && e.lat);
    if (!futureGeo.length) return;
    // Prefer first in-viewport show; fall back to globally first
    const inViewport = futureGeo.find(e => vpBounds.contains([e.lat, e.lng]));
    const nextGeo = inViewport || futureGeo[0];
    const rank = _rankScore(artist);
    const cityKey = `${(nextGeo.city||'?').toLowerCase().trim().slice(0,13)}|${nextGeo.country||''}`;
    if (!cityMap.has(cityKey)) cityMap.set(cityKey, {
      lat: nextGeo.lat, lng: nextGeo.lng,
      city: nextGeo.city || '?', country: nextGeo.country || '',
      entries: []
    });
    cityMap.get(cityKey).entries.push({ artist, ev: nextGeo, rank });
  });

  // Render each city cluster
  cityMap.forEach(({ lat, lng, city, country, entries }) => {
    entries.sort((a, b) => b.rank - a.rank);
    const topArtist = entries[0].artist;
    const topEv     = entries[0].ev;
    const topRank   = entries[0].rank;
    const topCol    = getColor(topArtist);
    const isFav     = entries.some(e => favoriteArtists.has(e.artist.toLowerCase()));
    const accentCol = isFav ? '#ffd700' : topCol;
    const count     = entries.length;
    const isCluster = count > 1 && zoom <= 6;

    // Temporal urgency of the top artist's next show
    const urgency = topEv.date <= in7  ? 'urgent' :
                    topEv.date <= in30 ? 'soon'   :
                    topEv.date <= in90 ? 'near'   : 'far';

    if (isCluster) {
      // City bubble: shows count + top artist color
      _renderCityBubble(lat, lng, city, country, entries, accentCol, urgency, isFav, topArtist);
    } else if (entries.length === 1 || zoom > 6) {
      // Individual pill for each artist, with jitter to de-overlap same-location markers
      entries.forEach(({ artist, ev, rank }, ji) => {
        _renderArtistPill(artist, ev, rank, today, in7, in30, entries.length > 1 ? ji : 0);
      });
    } else {
      // zoom ≤ 6 but only 1 artist → single pill
      _renderArtistPill(topArtist, topEv, topRank, today, in7, in30, 0);
    }
  });

  // ── 4. FESTIVALS — rendered via standalone function (also called on zoom) ─
  _renderFestLabels();

  if (!showMapTours) { tourMarkers.forEach(m=>m.remove()); routeLines.forEach(l=>l.remove()); }
  if (!showMapFests) festMarkers.forEach(m=>m.remove());

  updateVisiblePanel();

  // ── Auto-fit: on the very first render with data, fly to the bounding box
  // of all visible markers so the map opens at a sensible zoom level.
  // We only do this once (_mapFirstFit flag) so that filter changes don't
  // re-center the map while the user is panning/zooming.
  if (!_mapFirstFit && lmap) {
    const allPts = [];
    tourMarkers.forEach(m => { const ll = m.getLatLng(); allPts.push([ll.lat, ll.lng]); });
    festMarkers.forEach(m => { const ll = m.getLatLng(); allPts.push([ll.lat, ll.lng]); });
    // Also include route line coordinates so we fit even when all markers are clustered
    routeLines.forEach(l => l.getLatLngs().forEach(pt => allPts.push([pt.lat, pt.lng])));
    if (allPts.length > 0) {
      const bounds = L.latLngBounds(allPts);
      if (bounds.isValid()) {
        // padding: [top/bottom px, left px] — left padding accounts for the ~240px sidebar
        lmap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7, animate: false });
        _mapFirstFit = true;
      }
    }
  }
}

// ── City cluster bubble marker ───────────────────────────────────
function _renderCityBubble(lat, lng, city, country, entries, col, urgency, isFav, topArtist) {
  const count  = entries.length;
  const sz     = Math.min(54, 26 + count * 4);
  const glow   = urgency === 'urgent' ? `0 0 18px ${col}90` :
                 urgency === 'soon'   ? `0 0 10px ${col}60` : 'none';
  const isPulse = urgency === 'urgent';

  const plays = ARTIST_PLAYS[(topArtist||'').toLowerCase()] || 0;
  const showName = plays >= 5 || isFav;

  const html = `<div style="position:relative;width:${sz}px;height:${sz}px">
    ${isPulse ? `<div class="map-pulse-ring" style="color:${col}"></div>` : ''}
    <div class="${isPulse?'map-glow':''}" style="position:absolute;inset:0;border-radius:50%;
      background:rgba(8,8,10,.96);border:2.5px solid ${col};
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      cursor:pointer;box-shadow:${glow};overflow:hidden;gap:0">
      <span style="font-family:'DM Mono',monospace;font-weight:800;
        font-size:${count>9?'.5':'.62'}rem;color:${col};line-height:1.1">${count}</span>
      ${showName ? `<span style="font-size:.27rem;color:${col};opacity:.7;line-height:1.1;
        text-align:center;max-width:${sz-6}px;overflow:hidden;white-space:nowrap;
        text-overflow:ellipsis;padding:0 3px">${topArtist}</span>` : ''}
    </div>
  </div>`;

  const icon = L.divIcon({ className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2], html });

  const cc = country ? flag(country) : '';
  const artistLines = entries.slice(0, 8).map(e => {
    const p = ARTIST_PLAYS[(e.artist||'').toLowerCase()] || 0;
    return `<span style="color:${getColor(e.artist)}">${e.artist}${p ? ` <span style="opacity:.5;font-size:.58rem">${p}▶</span>` : ''}</span>`;
  }).join(' · ');
  const extra = entries.length > 8 ? ` <span style="opacity:.4">+${entries.length-8}</span>` : '';
  const popup = `<b style="font-family:Syne,sans-serif;color:${col}">${city} ${cc}</b> — ${count} shows<br><span style="font-size:.62rem;line-height:1.9">${artistLines}${extra}</span><br><span style="font-size:.5rem;color:var(--muted2)">Click to zoom in → see individual shows</span>`;

  const mk = L.marker([lat, lng], { icon, zIndexOffset: count * 20 })
    .addTo(lmap);
  mk.bindPopup(popup);
  // Click zooms in to reveal individual pills (don't block on isPopupOpen - just close popup and zoom)
  mk.on('click', () => {
    mk.closePopup();
    lmap.flyTo([lat, lng], Math.max(lmap.getZoom() + 3, 8), { duration: .65 });
  });
  tourMarkers.push(mk);
}

// ── Individual artist pill/dot marker ───────────────────────────
function _renderArtistPill(artist, ev, rank, today, in7, in30, jitterIdx) {
  const col    = getColor(artist);
  const plays  = ARTIST_PLAYS[(artist||'').toLowerCase()] || 0;
  const isFav  = favoriteArtists.has((artist||'').toLowerCase());
  const acc    = isFav ? '#ffd700' : col;
  const urgency = ev.date <= in7  ? 'urgent' :
                  ev.date <= in30 ? 'soon'   : 'far';
  const glow   = isFav               ? `0 0 14px rgba(255,215,0,.65)` :
                 urgency === 'urgent' ? `0 0 12px ${col}90` :
                 urgency === 'soon'   ? `0 0 7px ${col}60` : 'none';
  const dimOp  = urgency === 'far' && !isFav && plays === 0 ? '.45' : '1';

  const tierS  = plays >= 20 || isFav;
  const tierA  = plays >= 5;
  const tierB  = plays >= 1;

  let html, iconW, iconH, anchorX, anchorY;

  if (tierS || tierA) {
    const ph   = tierS ? 22 : 18;
    const ds   = tierS ? 8  : 6;
    const fs   = tierS ? '.55rem' : '.48rem';
    // Syne is wider than monospace — use 8.5px/char for Syne bold
    // Width: content-driven, no hard max — short names (e.g. "EDEN") must never truncate
    const estW = Math.min(220, Math.max(60, artist.length * (tierS ? 8.5 : 7.5) + 46));

    html = `<div style="position:relative;display:inline-flex;align-items:center;gap:4px;
      padding:3px 8px 3px ${3+ds}px;background:rgba(8,8,10,.94);
      border:${tierS?1.5:1}px solid ${acc};border-radius:100px;
      cursor:pointer;white-space:nowrap;box-shadow:${glow};opacity:${dimOp}">
      ${urgency==='urgent'?`<div class="map-pulse-ring" style="color:${acc};border-radius:100px"></div>`:''}
      <div style="width:${ds}px;height:${ds}px;border-radius:50%;background:${acc};flex-shrink:0"></div>
      <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:${fs};
        color:${acc}">${artist}</span>
      ${plays > 0 ? `<span style="font-family:'DM Mono',monospace;font-size:.38rem;color:${acc};opacity:.55;flex-shrink:0">${plays}</span>` : ''}
    </div>`;
    iconW = estW; iconH = ph;
    anchorX = iconW / 2; anchorY = ph / 2;

  } else {
    const sz = tierB ? 7 : 5;
    html = `<div style="width:${sz}px;height:${sz}px;border-radius:50%;
      background:${col};border:1px solid ${col};cursor:pointer;
      box-shadow:${glow};opacity:${dimOp}"></div>`;
    iconW = sz + 2; iconH = sz + 2;
    anchorX = iconW / 2; anchorY = iconH / 2;
  }

  // Jitter overlapping markers so they don't stack on the same pixel.
  // The offset radius scales with zoom so it always produces ~70px visual
  // separation regardless of zoom level:
  //   r_degrees = 70px × 360 / (256 × 2^zoom)
  let jLat = ev.lat, jLng = ev.lng;
  if (jitterIdx && jitterIdx > 0) {
    const zoom  = lmap ? lmap.getZoom() : 5;
    const r     = (70 * 360 / (256 * Math.pow(2, zoom))) * Math.ceil(jitterIdx / 5);
    const angle = (jitterIdx * 137.5) * (Math.PI / 180); // golden-angle spiral avoids clumping
    jLat = ev.lat + Math.cos(angle) * r;
    jLng = ev.lng + Math.sin(angle) * r;
  }

  const icon = L.divIcon({ className:'', iconSize:[iconW, iconH], iconAnchor:[anchorX, anchorY], html });
  const popup = `<b style="font-family:Syne,sans-serif;color:${acc}">${isFav?'★ ':''}${artist}</b><br>
    ${fmtDate(ev.date)}<br>${ev.venue}<br>
    <span style="color:var(--muted)">${ev.city}${ev.country?' '+flag(ev.country):''}</span>
    ${ev.url?`<br><a href="${ev.url}" target="_blank" style="color:${acc}">Tickets →</a>`:''}`;

  const zIdx = Math.round(rank) + (isFav ? 5000 : 0) +
               (urgency === 'urgent' ? 2000 : urgency === 'soon' ? 800 : 0);

  const mk = L.marker([jLat, jLng], { icon, zIndexOffset: zIdx })
    .addTo(lmap).bindPopup(popup);
  mk.on('click', () => { mk.closePopup(); focusArtist(artist); });
  tourMarkers.push(mk);
}

// ── FESTIVAL MAP ─────────────────────────────────────────────────
// ── FESTIVAL DETAIL MODAL ────────────────────────────────────────
