'use strict';

let _zRenderTimer = null;
let _moveTimer = null;
let _mapResizeObserver = null;
let _mapResizeTimer = null;
let _mapResizeRaf = null;
let _mapResizeQueued = false;

function scheduleMapResize(delay = 0) {
  if (!lmap) return;
  _mapResizeQueued = true;
  if (_mapResizeTimer) {
    clearTimeout(_mapResizeTimer);
    _mapResizeTimer = null;
  }
  const run = () => {
    _mapResizeTimer = null;
    if (_mapResizeRaf) return;
    _mapResizeRaf = requestAnimationFrame(() => {
      _mapResizeRaf = null;
      if (!lmap || !_mapResizeQueued) return;
      _mapResizeQueued = false;
      try {
        lmap.invalidateSize({ pan: false, debounceMoveend: true, animate: false });
      } catch (err) {
        console.error('[map resize]', err);
      }
    });
  };
  if (delay > 0) _mapResizeTimer = setTimeout(run, delay);
  else run();
}

function clearTourMarkers() {
  tourMarkers.forEach(m => m.remove());
  tourMarkers = [];
}

function clearFestMarkers() {
  festMarkers.forEach(m => m.remove());
  festMarkers = [];
}

function clearRouteLines() {
  routeLines.forEach(l => l.remove());
  routeLines = [];
}

function clearOverviewDynamicLayers() {
  clearTourMarkers();
  clearFestMarkers();
}

function initMap() {
  if (lmap) return;
  // Show floating tab buttons since sidebar starts collapsed
  const floatTabs = document.getElementById('sidebar-open-tabs');
  if (floatTabs) { floatTabs.style.opacity = '1'; floatTabs.style.pointerEvents = 'auto'; }
  // Start at a reasonable zoom/center — renderOverview will immediately fitBounds to
  // actual data on first render, so this is just a placeholder while tiles load.
  // minZoom:2 + worldCopyJump:true prevents the "world repeats 3 times" artifact.
  lmap = L.map('map', {
    preferCanvas: true,
    zoomControl: false,
    zoomAnimation: false,
    markerZoomAnimation: false,
    fadeAnimation: false,
    minZoom: 2,
    worldCopyJump: true,
  }).setView([30, 10], 3);
  L.control.zoom({ position:'bottomright' }).addTo(lmap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution:'© OpenStreetMap © CARTO', subdomains:'abcd', maxZoom:19
  }).addTo(lmap);

  // Zoom-responsive re-render (overview only, not focus mode)
  lmap.on('zoomend', () => {
    // Always clear any pending timer first — even in focus mode.
    // If we return early without clearing, a prior-queued timer would
    // fire 180ms later and destroy focus mode with renderOverview().
    clearTimeout(_zRenderTimer);
    if (focusedArtist || focusedFest) return;
    _zRenderTimer = setTimeout(() => {
      if (focusedArtist || focusedFest) return; // user may have entered focus during debounce
      try {
        clearOverviewDynamicLayers();
        renderOverview({ preserveRoutes: true });
      }
      catch(e) { console.error('[zoomend render]', e); }
    }, 90);
  });
  // Pan: don't re-render markers, just update the visible list
  lmap.on('moveend', () => {
    clearTimeout(_moveTimer);
    _moveTimer = setTimeout(updateVisiblePanel, 150);
  });

  const mapEl = document.getElementById('map');
  if (typeof ResizeObserver === 'function' && mapEl) {
    _mapResizeObserver = new ResizeObserver(() => scheduleMapResize(24));
    _mapResizeObserver.observe(mapEl);
  }
  window.addEventListener('resize', () => scheduleMapResize(40), { passive: true });
  scheduleMapResize(0);
}

function clearMapLayers() {
  clearOverviewDynamicLayers();
  clearRouteLines();
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
  const rankCache = new Map();
  const rankOf = artist => {
    if (!rankCache.has(artist)) rankCache.set(artist, _rankScore(artist));
    return rankCache.get(artist);
  };

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
    (rankOf(b.artist) - rankOf(a.artist)));

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
  scheduleMapResize(40);
}
