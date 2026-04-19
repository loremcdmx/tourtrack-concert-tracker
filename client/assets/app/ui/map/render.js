'use strict';

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
  clearFestMarkers();

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

  if (!showMapFests) clearFestMarkers();
}

function renderOverview(opts = {}) {
  const preserveRoutes = !!opts.preserveRoutes;
  const today = new Date().toISOString().split('T')[0];
  const in7   = dateOffset(7);
  const in30  = dateOffset(30);
  const in90  = dateOffset(90);
  const zoom  = lmap ? lmap.getZoom() : 3;
  const rankCache = new Map();
  const rankOf = artist => {
    if (!rankCache.has(artist)) rankCache.set(artist, _rankScore(artist));
    return rankCache.get(artist);
  };

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
      .map(([a, evs]) => ({ artist: a, evs, rank: rankOf(a) }))
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
  if (!preserveRoutes) {
    clearRouteLines();
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
    const rank  = rankOf(artist);
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
  }

  // ── 2. FUTURE SHOW DOTS at zoom > 7 (tiny, along route) ───────
  clearTourMarkers();
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
    const rank = rankOf(artist);
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

  if (!showMapTours) { clearTourMarkers(); clearRouteLines(); }
  if (!showMapFests) clearFestMarkers();

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
