'use strict';

const SIDEBAR_BATCH_SIZE = 120;
let _sidebarBuildToken = 0;

function buildSidebarArtistRow(artist, evs, ctx) {
  const col = getColor(artist);
  const isFav = favoriteArtists.has(artist.toLowerCase());
  const row = document.createElement('div');
  row.className = 'msb-artist' + (focusedArtist === artist ? ' on' : '');
  if (isFav) row.style.borderLeft = '2px solid rgba(255,215,0,.7)';
  row.dataset.artist = artist;

  const showCount = evs.length;
  const badgeCol = showCount >= 5 ? 'var(--accent)' : showCount >= 2 ? 'var(--text)' : 'var(--muted)';
  const lastDate = evs[evs.length - 1]?.date || '';
  const isEndingSoon = evs.length >= 3 && lastDate >= ctx.today && lastDate <= ctx.in90s;
  const nextShow = evs.find(e => e.date >= ctx.today);
  const metaText = nextShow
    ? `${nextShow.city || nextShow.venue || 'â€”'}${nextShow.country ? ' ' + flag(nextShow.country) : ''}`
    : evs[0]?.city || 'â€”';

  const plays = ARTIST_PLAYS[artist.toLowerCase()] || 0;
  const playBarPct = (artistSort === 'list' && plays > 0)
    ? Math.round(plays / ctx.topPlays * 100)
    : 0;
  const playsLabel = (artistSort === 'list' && plays > 0)
    ? `<span style="font-size:.48rem;color:var(--accent);font-family:'DM Mono',monospace;opacity:.9">${plays}â–¶</span>`
    : '';

  row.innerHTML = `
    <button class="msb-star ${isFav ? 'on' : ''}" title="${isFav ? 'Unfavorite' : 'Favorite'}">â˜…</button>
    <div class="msb-dot" style="background:${col}${isFav ? ';box-shadow:0 0 7px rgba(255,215,0,.55)' : ''}"></div>
    <div class="msb-ainfo">
      <div class="msb-aname">${artist}</div>
      <div class="msb-ameta">${metaText}</div>
      ${playBarPct > 0 ? `<div style="height:2px;border-radius:1px;background:var(--s3);overflow:hidden;margin-top:3px;width:80px"><div style="height:100%;width:${playBarPct}%;background:var(--accent);border-radius:1px;opacity:.55"></div></div>` : ''}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
      ${playsLabel}
      <span style="font-size:.54rem;color:${badgeCol};font-family:'DM Mono',monospace">${showCount}Ã—</span>
      ${isEndingSoon ? '<span style="font-size:.44rem;color:#ff8080;letter-spacing:.04em">ENDING</span>' : ''}
    </div>
    <button class="msb-focus">â†’</button>`;
  row.querySelector('.msb-star').onclick  = e => toggleFavorite(artist, e);
  row.querySelector('.msb-focus').onclick = e => { e.stopPropagation(); focusArtist(artist); };
  row.onclick = () => focusArtist(artist);
  return row;
}

function renderSidebarArtistList(list, artists, ctx) {
  const token = ++_sidebarBuildToken;
  list.innerHTML = '';

  const renderChunk = start => {
    if (_sidebarBuildToken !== token) return;
    const frag = document.createDocumentFragment();
    const end = Math.min(start + SIDEBAR_BATCH_SIZE, artists.length);
    for (let i = start; i < end; i++) {
      const artist = artists[i];
      frag.appendChild(buildSidebarArtistRow(artist, allTourData[artist], ctx));
    }
    list.appendChild(frag);
    if (end < artists.length) requestAnimationFrame(() => renderChunk(end));
  };

  renderChunk(0);
}

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
  if (typeof scheduleMapResize === 'function') scheduleMapResize(40);

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
  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  if (artistPreset === 'fav') {
    return list.filter(artist => favoriteArtists.has((artist || '').toLowerCase()));
  }
  if (artistPreset === 'heavy') {
    if (hasPlays) return list.filter(artist => (ARTIST_PLAYS[(artist || '').toLowerCase()] || 0) >= 10);
    const ranked = [...list].sort((a, b) => _rankScore(b) - _rankScore(a));
    const keep = new Set(ranked.slice(0, Math.min(12, Math.max(6, Math.ceil(ranked.length * 0.2)))));
    return list.filter(artist => keep.has(artist));
  }
  if (artistPreset === 'hot') {
    const hotWindow = dateOffset(14);
    return list.filter(artist => (allTourData[artist] || []).some(ev => ev.date >= today && ev.date <= hotWindow));
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
  return keys.sort((a, b) => {
    if (hasPlays) {
      const pa = ARTIST_PLAYS[a.toLowerCase()] || 0;
      const pb = ARTIST_PLAYS[b.toLowerCase()] || 0;
      if (pa !== pb) return pb - pa; // more plays = higher
    }
    // Tie-break: preserve textarea order
    const ia = artistListPosition(a);
    const ib = artistListPosition(b);
    return ia !== ib ? ia - ib : a.localeCompare(b);
  });
}

// ═══════════════════════════════════════════════════════════════
// MATCH — find shared artists between two playlists
// ═══════════════════════════════════════════════════════════════


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
    _sidebarBuildToken++;
    const emptyMsg = showFavOnly
      ? 'No favorites on tour'
      : artistPreset === 'all'
        ? 'No tour data'
        : 'No artists match this preset';
    list.innerHTML = `<div style="padding:16px;font-size:.62rem;color:var(--muted2)">${emptyMsg}</div>`;
    buildFestPanel(); return;
  }

  buildFestPanel();
  const topPlays = Math.max(1, ...Object.values(ARTIST_PLAYS).map(v => v || 0));
  renderSidebarArtistList(list, artists, { today, in90s, topPlays });
  return;
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
