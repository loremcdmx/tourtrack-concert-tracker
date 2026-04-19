'use strict';

let focusedConcertKey = '';

function _concertFocusKey(ev) {
  if (!ev) return '';
  if (ev.id) return `id:${String(ev.id)}`;
  return [
    _normText(ev.artist || ''),
    ev.date || '',
    _venueCore(ev.venue || ''),
    _cityCore(ev.city || '')
  ].join('|');
}

function focusConcert(ev) {
  if (!ev?.artist) return;
  focusedConcertKey = _concertFocusKey(ev);
  focusArtist(ev.artist);
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function focusArtist(artist) {
  focusedArtist = artist;
  { const _mr3 = document.getElementById('map-reset'); if (_mr3) _mr3.style.display = artist ? '' : 'none'; }
  document.querySelectorAll('.msb-artist').forEach(r => r.classList.toggle('on', r.dataset.artist === artist));
  document.getElementById('msb-all').classList.toggle('on', artist === null);
  clearMapLayers();

  if (!artist) {
    focusedConcertKey = '';
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
  const targetConcertKey = focusedConcertKey;
  focusedConcertKey = '';
  const matchedTargetIndex = targetConcertKey ? display.findIndex(ev => _concertFocusKey(ev) === targetConcertKey) : -1;
  let activeIndex = matchedTargetIndex;
  if (activeIndex < 0) activeIndex = 0;
  const targetEvent = matchedTargetIndex >= 0 ? display[matchedTargetIndex] : null;

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
  const markersByKey = new Map();

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
    const isActiveRow = i === activeIndex;
    row.className = 'fshow' + (isActiveRow ? ' active' : '');

    // Accent bar
    const accent = document.createElement('div');
    accent.className = 'fshow-accent';
    accent.style.background = isActiveRow ? col : 'transparent';
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
      const marker = markersByKey.get(_concertFocusKey(ev));
      if (ev.lat) {
        lmap.flyTo([ev.lat, ev.lng], 11, { duration:.7 });
        if (marker) window.setTimeout(() => marker.openPopup(), 180);
      }
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
    markersByKey.set(_concertFocusKey(ev), mk);
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
    if (targetEvent?.lat && targetEvent?.lng) {
      lmap.flyTo([targetEvent.lat, targetEvent.lng], 11, { duration:.7 });
      const targetMarker = markersByKey.get(_concertFocusKey(targetEvent));
      if (targetMarker) window.setTimeout(() => targetMarker.openPopup(), 220);
    } else {
      const bounds = L.latLngBounds(coords.map(e => [e.lat, e.lng]));
      lmap.fitBounds(bounds, { padding:[40, 320], maxZoom:8, duration:.9 });
    }
  }
  if (targetEvent) {
    const activeRow = document.querySelectorAll('.fshow')[activeIndex];
    if (activeRow) {
      window.setTimeout(() => activeRow.scrollIntoView({ behavior:'smooth', block:'nearest' }), 120);
    }
  }
}

// Maximum artists to show on the map overview when results are abundant.
// When more than this pass the filters, only the top MAP_MAX_ARTISTS by rank
// are rendered as markers. The sidebar list still shows everyone.
// This is a `let` so the in-map stepper control can change it without a reload.
