'use strict';

function appendArtistChipIdentity(chip, artist, plays = 0) {
  if (!chip || !artist) return;
  chip.classList.add('has-avatar');
  chip.appendChild(createArtistAvatar(artist, { size:'chip', color:getColor(artist) }));

  const label = document.createElement('span');
  label.textContent = artist;
  chip.appendChild(label);

  if (plays > 0) {
    const playCount = document.createElement('span');
    playCount.style.cssText = 'opacity:.55;font-size:.8em;margin-left:2px';
    playCount.textContent = plays;
    chip.appendChild(playCount);
  }
}

function buildCalChips() {
  // Count events per country
  const ccCount = new Map();
  const _vc = visibleConcerts();
  for (const e of _vc)  if (e.country) ccCount.set(e.country, (ccCount.get(e.country)||0)+1);
  for (const f of festivals) if (f.country) ccCount.set(f.country, (ccCount.get(f.country)||0)+1);

  // Count per region
  const regCount = new Map();
  for (const [cc, n] of ccCount) {
    const r = COUNTRY_MAP[cc]?.r;
    if (r) regCount.set(r, (regCount.get(r)||0)+n);
  }

  const wrap = document.getElementById('cal-geo-chips');
  if (!wrap) return; // element removed from toolbar - geo filtering handled by geo-quick-row
  wrap.innerHTML = '';
  if (!ccCount.size) { wrap.innerHTML = '<span style="font-size:.6rem;color:var(--muted2)">No data</span>'; return; }

  // "All" chip
  const allChip = document.createElement('button');
  allChip.className = 'geo-chip' + (calGeoFilter.size === 0 ? ' on' : '');
  allChip.dataset.geo = '__all__';
  const totalEv = [...ccCount.values()].reduce((a,b)=>a+b,0);
  allChip.innerHTML = `All <span class="geo-cnt">${totalEv}</span>`;
  allChip.onclick = () => { calGeoFilter.clear(); calGeoExpanded = null; buildCalChips(); renderCalendar(); };
  wrap.appendChild(allChip);

  // Region chips — only show regions that have events
  REGIONS.forEach(r => {
    const cnt = regCount.get(r.id);
    if (!cnt) return;
    const on = calGeoFilter.has(r.id);
    const chip = document.createElement('button');
    chip.className = 'geo-chip' + (on ? ' on' : '');
    chip.dataset.geo = r.id;
    chip.innerHTML = `${r.e} ${r.lbl} <span class="geo-cnt">${cnt}</span>`;
    chip.onclick = () => {
      if (calGeoFilter.has(r.id)) { calGeoFilter.delete(r.id); calGeoExpanded = null; }
      else { calGeoFilter.add(r.id); calGeoExpanded = r.id; }
      buildCalChips(); renderCalendar();
    };
    wrap.appendChild(chip);
  });

  // If a region is expanded, show its country chips inline
  if (calGeoExpanded && calGeoFilter.has(calGeoExpanded)) {
    const subRow = document.createElement('div');
    subRow.className = 'geo-sub-chips';
    const codes = regionCodes(calGeoExpanded).filter(c => ccCount.has(c));
    codes.forEach(code => {
      const m = COUNTRY_MAP[code]; if (!m) return;
      const cnt = ccCount.get(code) || 0;
      // Individual country filter stored in calGeoFilter as 'cc:XX'
      const key = 'cc:' + code;
      const active = calGeoFilter.has(key);
      const sub = document.createElement('button');
      sub.className = 'chip' + (active ? ' on' : '');
      sub.innerHTML = `${m.f} ${m.n} <span style="color:var(--muted2);font-size:.52rem">${cnt}</span>`;
      sub.onclick = () => {
        if (calGeoFilter.has(key)) calGeoFilter.delete(key); else calGeoFilter.add(key);
        buildCalChips(); renderCalendar();
      };
      subRow.appendChild(sub);
    });
    if (subRow.children.length) wrap.appendChild(subRow);
  }
}

function calFilter(arr) {
  if (calGeoFilter.size === 0) return arr;
  // Collect region IDs and explicit country codes from filter
  const activeRegions = new Set([...calGeoFilter].filter(k => !k.startsWith('cc:')));
  const activeCountries = new Set([...calGeoFilter].filter(k => k.startsWith('cc:')).map(k => k.slice(3)));

  return arr.filter(e => {
    const cc = e.country || '';
    const r  = COUNTRY_MAP[cc]?.r || '';
    if (activeCountries.size > 0 && activeRegions.size > 0) {
      // Mixed: show if matches an active country OR belongs to an active region (but not expanded one, where country filter applies)
      if (activeRegions.has(r) && r !== calGeoExpanded) return true;
      if (activeCountries.has(cc)) return true;
      return false;
    }
    if (activeCountries.size > 0) return activeCountries.has(cc) || activeRegions.has(r);
    return activeRegions.has(r);
  });
}

function setCalView(view) {
  calView = view;
  document.getElementById('calview-all').classList.toggle('on', view === 'all');
  document.getElementById('calview-mx').classList.toggle('on', view === 'mx');
  // Show/hide rows that only make sense for global view
  const mxRow = document.getElementById('mx-sort-row');
  const typeRow = document.getElementById('cal-type-row');
  if (mxRow) mxRow.style.display = view === 'mx' ? 'flex' : 'none';
  if (typeRow) typeRow.style.display = view === 'mx' ? 'none' : '';
  renderCalendar();
}

function setMxSort(sort) {
  mxSort = sort;
  document.getElementById('mxsort-date').classList.toggle('on', sort === 'date');
  document.getElementById('mxsort-rank').classList.toggle('on', sort === 'rank');
  renderCalendar();
}

// CDMX city detection — handles common Ticketmaster city name variants
function isCDMX(city) {
  const c = (city || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /\b(mexico\s*city|cdmx|ciudad\s*de\s*mexico|ciudad\s*de\s*mex|d\.?\s*f\.?|cuauhtemoc|benito\s*juarez|miguel\s*hidalgo|coyoacan|iztapalapa|tlalpan|gustavo|alvaro\s*obregon|azcapotzalco|venustiano|xochimilco|tlahuac|milpa\s*alta|cuajimalpa|iztacalco|magdalena\s*contreras)\b/.test(c);
}

// Rank score for an artist — combines plays and list position
// ── DATE OFFSET HELPER ──────────────────────────────────────────
function dateOffset(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

let _artistIndexCacheRef = null;
let _artistIndexCacheLen = -1;
let _artistIndexCacheFirst = '';
let _artistIndexCacheLast = '';
let _artistIndexCacheMap = new Map();

function getArtistIndexMap() {
  const list = Array.isArray(ARTISTS) ? ARTISTS : [];
  const len = list.length;
  const first = len ? String(list[0] || '') : '';
  const last = len ? String(list[len - 1] || '') : '';
  if (
    _artistIndexCacheRef !== list ||
    _artistIndexCacheLen !== len ||
    _artistIndexCacheFirst !== first ||
    _artistIndexCacheLast !== last
  ) {
    const map = new Map();
    list.forEach((artist, idx) => {
      const key = (artist || '').toLowerCase();
      if (key && !map.has(key)) map.set(key, idx);
    });
    _artistIndexCacheRef = list;
    _artistIndexCacheLen = len;
    _artistIndexCacheFirst = first;
    _artistIndexCacheLast = last;
    _artistIndexCacheMap = map;
  }
  return _artistIndexCacheMap;
}

function artistListPosition(artistName) {
  const idx = getArtistIndexMap().get((artistName || '').toLowerCase());
  return Number.isInteger(idx) ? idx : -1;
}

// ── UNIFIED ARTIST RANK SCORE ────────────────────────────────────
// Shared by MX calendar, overview map, and everywhere else
// Returns: high = artist you listen to a lot = show higher priority
function artistRankScore(artistName) {
  const key = (artistName || '').toLowerCase();
  const plays = ARTIST_PLAYS[key] || 0;
  const listIdx = artistListPosition(key);
  const posScore = listIdx >= 0 ? (ARTISTS.length - listIdx) : 0;
  return plays * 100 + posScore;
}
// Alias used by map rendering (non-linear weighting for visual sizing)
function _rankScore(artist) {
  const key = (artist || '').toLowerCase();
  const plays = ARTIST_PLAYS[key] || 0;
  const idx   = artistListPosition(key);
  const pos   = idx >= 0 ? (ARTISTS.length - idx) / Math.max(ARTISTS.length, 1) * 20 : 0;
  return (plays >= 20 ? 200 + Math.log2(plays) * 10 :
          plays >= 5  ? 100 + plays * 4 :
          plays >= 1  ? 20  + plays * 5 : 0) + pos;
}

function renderMxCalendar() {
  const today = new Date().toISOString().split('T')[0];

  // All future MX concerts — use unified score filter
  let mxCons = dateFilter_(visibleConcerts())
    .filter(c => c.country === 'MX' && !isHidden(c.artist) && scoreOkArtist(c.artist));

  // MX festivals — use score filter for fests
  const mxFests = showFests
    ? dateFilter_(festivals).filter(f => f.country === 'MX' && scoreOkFest(f))
    : [];

  // Split concerts into CDMX and Resto
  const cdmx  = mxCons.filter(c => isCDMX(c.city));
  const resto  = mxCons.filter(c => !isCDMX(c.city));

  const tallyEl = document.getElementById('mx-tally');
  const total = mxCons.length + mxFests.length;
  if (tallyEl) tallyEl.textContent = total ? `${total} events` : '';

  const body = document.getElementById('cal-body');
  if (!total && !mxCons.length) {
    if (concerts.length) {
      body.innerHTML = `<div class="empty"><div class="empty-icon">🇲🇽</div><div class="empty-msg">No México concerts in current data.<br><span style="font-size:.62rem;color:var(--muted2)">Check your geo filter settings or run a new scan.</span></div></div>`;
    } else if (window._scanActive) {
      // Scan is still running — show a scanning placeholder instead of the onboard overlay
      body.innerHTML = `<div class="empty"><div class="empty-icon" style="animation:breathe 1.5s ease-in-out infinite">🔍</div><div class="empty-msg">Scanning for México concerts…<br><span style="font-size:.62rem;color:var(--muted2)">Results will appear here as artists are checked.</span></div></div>`;
    } else {
      body.innerHTML = ''; showOnboard();
    }
    return;
  }

  // Sort function by ranking (plays + list position)
  const byRank = (a, b) => {
    const ra = artistRankScore(a.artist), rb = artistRankScore(b.artist);
    return rb - ra || a.date.localeCompare(b.date);
  };
  const byDate = (a, b) => a.date.localeCompare(b.date) || artistRankScore(b.artist) - artistRankScore(a.artist);
  const sortFn = mxSort === 'rank' ? byRank : byDate;

  const frag = document.createDocumentFragment();
  const primeArtists = new Set();

  const renderMxSection = (concerts, label, cls) => {
    if (!concerts.length) return;

    const sec = document.createElement('div');
    sec.className = 'mx-section';
    sec.innerHTML = `
      <div class="mx-section-name ${cls}">${label}</div>
      <div class="mx-section-count">${concerts.length} show${concerts.length !== 1 ? 's' : ''}</div>`;
    frag.appendChild(sec);

    const sorted = [...concerts].sort(sortFn);

    if (mxSort === 'rank') {
      // By rank: flat list, show date prominently
      sorted.forEach(c => {
        if (c.artist) primeArtists.add(c.artist);
        frag.appendChild(renderMxRow(c));
      });
    } else {
      // By date: grouped by month
      const byMonth = {};
      sorted.forEach(c => {
        const m = c.date.slice(0, 7);
        (byMonth[m] = byMonth[m] || []).push(c);
      });
      for (const [month, evs] of Object.entries(byMonth)) {
        const sep = document.createElement('div');
        sep.className = 'month-sep';
        sep.textContent = new Date(month + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
        frag.appendChild(sep);
        evs.forEach(c => {
          if (c.artist) primeArtists.add(c.artist);
          frag.appendChild(renderMxRow(c));
        });
      }
    }
  };

  renderMxSection(cdmx,  'CDMX', 'cdmx');
  renderMxSection(resto, 'Resto de México', 'resto');

  // MX festivals at the end
  if (mxFests.length) {
    const sec = document.createElement('div');
    sec.className = 'mx-section';
    sec.innerHTML = `<div class="mx-section-name cdmx">Festivales</div>
      <div class="mx-section-count">${mxFests.length}</div>`;
    frag.appendChild(sec);
    [...mxFests].sort((a,b) => a.date.localeCompare(b.date)).forEach(f => {
      const d = f.date.split('-');
      const dayname = new Date(f.date + 'T12:00:00').toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      const loc = [f.city].filter(Boolean).join(' ');
      const row = document.createElement('div');
      row.className = 'ev-row';
      const dayblock = document.createElement('div');
      dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;
      const main = document.createElement('div');
      main.className = 'ev-main';
      const nameEl = document.createElement('div');
      nameEl.className = 'ev-name' + (f.url ? ' tkt' : '');
      nameEl.textContent = f.name;
      const badge = document.createElement('span');
      badge.className = 'fest-badge'; badge.textContent = 'Festival';
      nameEl.appendChild(badge);
      if (f.url) nameEl.onclick = () => window.open(f.url, '_blank');
      const sub = document.createElement('div');
      sub.className = 'ev-sub';
      sub.innerHTML = `<strong>${f.venue || ''}</strong>${loc ? ' · ' + loc : ''}`;
      main.appendChild(nameEl); main.appendChild(sub);
      row.appendChild(dayblock); row.appendChild(main); row.appendChild(document.createElement('div'));
      frag.appendChild(row);
    });
  }

  body.innerHTML = '';
  body.appendChild(frag);
  primeArtistMediaKnowledge([...primeArtists], 24);
}

function renderMxRow(c) {
  const d = c.date.split('-');
  const dayname = new Date(c.date + 'T12:00:00').toLocaleString('en-US', { weekday: 'short' }).toUpperCase();

  // Location: in rank mode show city, in date mode show venue
  const venuePart = c.venue || '';
  const cityPart  = [c.city, c.state && c.country === 'US' ? c.state : ''].filter(Boolean).join(', ');

  const row = document.createElement('div');
  const dim = isHidden(c.artist);
  row.className = 'ev-row' + (dim ? ' faded' : '');

  const dayblock = document.createElement('div');
  if (mxSort === 'rank') {
    // In rank mode: show date compactly
    const [, mon, day] = d;
    dayblock.innerHTML = `<span class="ev-daynum" style="font-size:1.3rem">${day}</span><span class="ev-dayname">${new Date(c.date + 'T12:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()}</span>`;
  } else {
    dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;
  }

  const main = document.createElement('div');
  main.className = 'ev-main';

  const nameEl = document.createElement('div');
  nameEl.className = 'ev-name';

  // Artist name + rank badge
  nameEl.textContent = c.artist;
  const plays = ARTIST_PLAYS[(c.artist || '').toLowerCase()] || 0;
  const isFav = favoriteArtists.has((c.artist || '').toLowerCase());
  if (plays > 0 || isFav) {
    const badge = document.createElement('span');
    badge.className = 'mx-rank-badge' + (isFav ? ' fav' : '');
    badge.textContent = isFav ? '★' + (plays || '') : plays + ' ▶';
    nameEl.appendChild(badge);
  }

  const headline = document.createElement('div');
  headline.className = 'ev-headline';
  headline.appendChild(createArtistAvatar(c.artist, { size:'mx', color:getColor(c.artist) }));
  headline.appendChild(nameEl);

  const sub = document.createElement('div');
  sub.className = 'ev-sub';
  if (c.url && venuePart) {
    const vLink = document.createElement('strong');
    vLink.textContent = venuePart;
    vLink.style.cssText = 'cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;';
    vLink.title = 'Open ticket page';
    vLink.onclick = (e) => { e.stopPropagation(); window.open(c.url, '_blank'); };
    sub.appendChild(vLink);
    if (cityPart) sub.appendChild(document.createTextNode(' · ' + cityPart));
  } else {
    sub.innerHTML = `<strong>${venuePart}</strong>${cityPart ? ' · ' + cityPart : ''}`;
  }

  main.appendChild(headline);
  main.appendChild(sub);

  const actions = document.createElement('div');
  actions.className = 'ev-actions';
  const btn = document.createElement('button');
  btn.className = 'hide-btn' + (dim ? ' rst' : '');
  btn.textContent = dim ? 'Restore' : 'Hide';
  btn.onclick = dim ? () => restoreArtist(c.artist) : () => openSnooze(c.artist);
  actions.appendChild(btn);

  row.classList.add('is-clickable');
  row.title = 'Open on map';
  row.onclick = (e) => {
    if (e.target.closest('.hide-btn,.ev-sub strong')) return;
    focusConcert(c);
  };

  row.appendChild(dayblock); row.appendChild(main); row.appendChild(actions);
  return row;
}

let calDateFrom = '';  // ISO date for range start
let calDateTo   = '';  // ISO date for range end

// ── DATE RANGE PICKER ─────────────────────────────────────────────
let _drpYear, _drpMonth;   // currently viewed month
let _drpSelStart = '';      // selected start (ISO)
let _drpSelEnd   = '';      // selected end (ISO)

function drpToggle(e) {
  e && e.stopPropagation();
  const pop = document.getElementById('drp-popover');
  if (pop.classList.contains('open')) { pop.classList.remove('open'); return; }
  // Init to current month or start of range
  const ref = calDateFrom ? new Date(calDateFrom + 'T12:00') : new Date();
  _drpYear = ref.getFullYear(); _drpMonth = ref.getMonth();
  _drpSelStart = calDateFrom; _drpSelEnd = calDateTo;
  drpRender();
  pop.classList.add('open');
  // Close on outside click — use capture so we can check containment properly
  setTimeout(() => document.addEventListener('click', _drpOutside, { once: true }), 0);
}
function _drpOutside(e) {
  const pop = document.getElementById('drp-popover');
  if (pop && pop.contains(e.target)) {
    // Click was inside — re-register the listener
    setTimeout(() => document.addEventListener('click', _drpOutside, { once: true }), 0);
    return;
  }
  if (pop) pop.classList.remove('open');
}
function drpNavMonth(dir, e) {
  e && e.stopPropagation();
  _drpMonth += dir;
  if (_drpMonth > 11) { _drpMonth = 0; _drpYear++; }
  if (_drpMonth < 0)  { _drpMonth = 11; _drpYear--; }
  drpRender();
}
function drpRender() {
  const ML = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('drp-month-lbl').textContent = ML[_drpMonth] + ' ' + _drpYear;
  const grid = document.getElementById('drp-grid');
  const today = new Date().toISOString().split('T')[0];
  grid.innerHTML = '';
  // Day-of-week headers
  ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(d => {
    const el = document.createElement('div'); el.className = 'drp-dow'; el.textContent = d;
    grid.appendChild(el);
  });
  const first = new Date(_drpYear, _drpMonth, 1);
  const lastDay = new Date(_drpYear, _drpMonth + 1, 0).getDate();
  // Offset: Monday=0
  let startDow = (first.getDay() + 6) % 7;
  for (let i = 0; i < startDow; i++) {
    const el = document.createElement('div'); el.className = 'drp-day drp-empty';
    grid.appendChild(el);
  }
  for (let d = 1; d <= lastDay; d++) {
    const iso = _drpYear + '-' + String(_drpMonth + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const el = document.createElement('div');
    el.className = 'drp-day';
    el.textContent = d;
    if (iso < today) el.classList.add('drp-past');
    if (iso === today) el.classList.add('drp-today');
    if (_drpSelStart && iso === _drpSelStart) el.classList.add('drp-start');
    if (_drpSelEnd   && iso === _drpSelEnd)   el.classList.add('drp-end');
    if (_drpSelStart && _drpSelEnd && iso > _drpSelStart && iso < _drpSelEnd) el.classList.add('drp-in-range');
    el.onclick = (ev) => drpDayClick(iso, ev);
    grid.appendChild(el);
  }
  // Update hint
  const hint = document.getElementById('drp-hint');
  const applyBtn = document.querySelector('#drp-popover .drp-apply-btn');
  if (!_drpSelStart) {
    hint.textContent = 'Click a date to select';
    if (applyBtn) applyBtn.disabled = true;
  } else if (!_drpSelEnd) {
    const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
    hint.textContent = fmt(_drpSelStart) + ' — click another date for range, or Apply';
    if (applyBtn) applyBtn.disabled = false;
  } else {
    const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
    hint.textContent = fmt(_drpSelStart) + ' → ' + fmt(_drpSelEnd);
    if (applyBtn) applyBtn.disabled = false;
  }
}
function drpDayClick(iso, e) {
  e && e.stopPropagation();
  if (!_drpSelStart || (_drpSelStart && _drpSelEnd)) {
    // Start fresh: first click sets start only
    _drpSelStart = iso; _drpSelEnd = '';
  } else {
    // Second click — set end (ensure order)
    if (iso < _drpSelStart) { _drpSelEnd = _drpSelStart; _drpSelStart = iso; }
    else if (iso === _drpSelStart) { _drpSelEnd = ''; } // toggle off
    else _drpSelEnd = iso;
  }
  drpRender();
  // If both dates chosen, apply immediately
  if (_drpSelStart && _drpSelEnd) drpApply();
}
function drpClear(e) {
  e && e.stopPropagation();
  _drpSelStart = ''; _drpSelEnd = '';
  drpRender();
}
function drpApply(e) {
  e && e.stopPropagation();
  if (!_drpSelStart) return;
  document.getElementById('drp-popover').classList.remove('open');
  // Single date = one-day filter; range = start→end
  const end = _drpSelEnd && _drpSelEnd !== _drpSelStart ? _drpSelEnd : _drpSelStart;
  setDateFilter('range', _drpSelStart, end);
  // Update chip label
  const fmt = s => new Date(s+'T12:00').toLocaleString('en-US',{month:'short',day:'numeric'});
  const chip = document.getElementById('drp-chip');
  const label = _drpSelEnd && _drpSelEnd !== _drpSelStart
    ? '📅 ' + fmt(_drpSelStart) + ' – ' + fmt(_drpSelEnd)
    : '📅 ' + fmt(_drpSelStart);
  if (chip) chip.textContent = label;
}

function monthBounds(offsetMonths = 0) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  const iso = d => d.toISOString().split('T')[0];
  return { from: iso(first), to: iso(last) };
}

function dateMatchesPreset(dateStr, filter = dateFilter) {
  return dateMatchesNamedPreset(dateStr, filter, {
    rangeFrom: calDateFrom,
    rangeTo: calDateTo,
  });
}

function setDateFilter(f, fromDate, toDate) {
  dateFilter = f;
  if (f === 'range') { calDateFrom = fromDate || ''; calDateTo = toDate || ''; }
  else { const chip = document.getElementById('drp-chip'); if (chip) chip.textContent = '📅'; }
  document.querySelectorAll('.chip[data-d]').forEach(c => c.classList.toggle('on', c.dataset.d === f));
  renderCalendar(); renderMap(); _updateTally();
}

// setPlaysFilter removed — use setScoreFilter instead

// ── FAVORITES ────────────────────────────────────────────────────
let showFavOnly = false;
let showPossibleDupes = false; // when false, aggressive dedup hides same-artist/date/venue-prefix entries

function toggleFavorite(artistName, e) {
  if (e) e.stopPropagation();
  const key = artistName.toLowerCase();
  if (favoriteArtists.has(key)) favoriteArtists.delete(key);
  else favoriteArtists.add(key);
  persistSettings();
  buildSidebar();
  renderMap();
  // Show/hide fav-only toggle
  const favBtn = document.getElementById('lt-fav');
  if (favBtn) favBtn.style.display = favoriteArtists.size ? '' : 'none';
}

function toggleFavOnly() {
  showFavOnly = !showFavOnly;
  const btn = document.getElementById('lt-fav');
  if (btn) { btn.style.color = showFavOnly ? '#ffd700' : ''; btn.style.borderColor = showFavOnly ? '#ffd700' : ''; }
  renderMap();
}

function resetFavorites() {
  favoriteArtists.clear();
  showFavOnly = false;
  const btn = document.getElementById('lt-fav');
  if (btn) btn.style.display = 'none';
  persistSettings();
  buildSidebar();
  renderMap();
}

function toggleType(t) {
  if (t === 'shows') { showShows = !showShows; document.querySelector('[data-t=shows]').classList.toggle('on', showShows); }
  else               { showFests  = !showFests;  document.querySelector('[data-t=fests]').classList.toggle('on', showFests); }
  renderCalendar(); renderMap();
}

function dateFilter_(arr) {
  return arr.filter(e => dateMatchesPreset(e.date));
}

// ── SCORE FILTER ─────────────────────────────────────────────────
// Level 0 = all, 1 = low+, 2 = mid+, 3 = high+, 4 = top+
// For artists (tracks in playlist): 0, >3, >5, >10, >20
// For festivals (0-100 score):      0, >20, >30, >50, >70
const SCORE_ARTIST_MIN = [0, 3, 5, 10, 20];  // min ARTIST_PLAYS tracks per level
const SCORE_FEST_MIN   = [0, 20, 30, 50, 70]; // min f.score per level
let calScoreFilter = 0;   // 0–4

function setScoreFilter(level) {
  calScoreFilter = level;
  document.querySelectorAll('#score-filter-row .plays-chip').forEach(c =>
    c.classList.toggle('on', parseInt(c.dataset.s) === level));
  renderCalendar(); renderMap(); _updateTally();
}

// ── MAP-SPECIFIC FILTER HELPERS ──────────────────────────────────────
// Map date/score filters are independent from the calendar chips and should
// narrow the dataset before Leaflet rebuilds markers and routes.
function _mapDateWindowBounds(today) {
  if (mapDateMode === 'week') return { from: today, to: dateOffset(7) };
  if (mapDateMode === 'month') return { from: today, to: dateOffset(30) };
  if (mapDateMode === 'range') {
    return {
      from: mapDateFrom || today,
      to: mapDateTo || dateOffset(30),
    };
  }
  return { from: today, to: '' };
}
function mapScoreOkArtist(name) {
  const level = Number(mapScoreFilter) || 0;
  if (!level) return true;
  return (ARTIST_PLAYS[(name || '').toLowerCase()] || 0) >= (SCORE_ARTIST_MIN[level] || 0);
}
function mapScoreOkFest(f) {
  const level = Number(mapScoreFilter) || 0;
  if (!level) return true;
  return (f?.score || 0) >= (SCORE_FEST_MIN[level] || 0);
}
function mapDateOk(dateStr) {
  if (!dateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  if (dateStr < today) return false;
  const { from, to } = _mapDateWindowBounds(today);
  return dateStr >= from && (!to || dateStr <= to);
}

// ── MAP RENDER PIPELINE ──────────────────────────────────────────────────
//
// _rebuildMapData(): lightweight alternative to full renderMap().
// Rebuilds allTourData applying current map filter state WITHOUT
// also rebuilding the full sidebar DOM (which renderMap does via buildSidebar).
//
function _rebuildMapData() {
  const today = new Date().toISOString().split('T')[0];
  allTourData = {};
  const skipTours = mapTypeFilter === 'fests';
  if (!skipTours) {
    for (const c of visibleConcerts()) {
      if (c.date < today || isHidden(c.artist)) continue;
      if (!geoDisplayOk(c.country || '')) continue;
      if (!mapDateOk(c.date)) continue;
      if (!mapScoreOkArtist(c.artist)) continue;
      (allTourData[c.artist] = allTourData[c.artist] || []).push(c);
    }
    for (const a in allTourData) {
      allTourData[a].sort((a, b) => a.date.localeCompare(b.date));
      getColor(a);
    }
  }
  // Update sidebar artist count to reflect the current filter
  const cntEl = document.getElementById('msb-all-cnt');
  if (cntEl) cntEl.textContent = Object.keys(allTourData).length + ' artists';
}

// withMapSpinner(workFn): shows the loading overlay for one paint frame,
// then runs workFn, then hides the overlay.
//
// Why double-rAF? The browser renders frames in a pipeline:
//   JS runs → Style recalc → Layout → Paint → Composite
// A single rAF yields until after the current frame paints (showing the
// spinner). The second rAF gives CSS transition time to complete.
// workFn() runs in the second frame — by then the spinner is on screen.
//
let _mapRenderPending = false;
let _mapRenderQueuedWork = null;
function withMapSpinner(workFn) {
  const overlay = document.getElementById('map-loading-overlay');

  // Coalesce rapid changes into one follow-up render so the latest filter
  // state wins without piling up multiple heavy Leaflet rebuilds.
  if (_mapRenderPending) {
    _mapRenderQueuedWork = workFn;
    return;
  }
  _mapRenderPending = true;

  if (overlay) overlay.classList.add('visible');

  requestAnimationFrame(() => {          // frame 1: browser paints overlay
    requestAnimationFrame(() => {        // frame 2: CSS transition applied
      try {
        workFn();                        // ← heavy synchronous Leaflet work
      } catch (err) {
        // Surface the error in the debug log but don't let it leave
        // the spinner permanently visible or _mapRenderPending stuck.
        console.error('[map render error]', err);
        if (typeof dblog === 'function') dblog('warn', 'Map render error: ' + err.message);
      } finally {
        if (overlay) overlay.classList.remove('visible');
        _mapRenderPending = false;
        const queuedWork = _mapRenderQueuedWork;
        _mapRenderQueuedWork = null;
        if (typeof queuedWork === 'function') withMapSpinner(queuedWork);
      }
    });
  });
}

let _scheduledUiRefreshRaf = 0;
let _scheduledUiRefreshPending = false;
const CALENDAR_RENDER_BATCH_SIZE = 60;
let _calendarRenderToken = 0;

function flushScheduledUiRefresh() {
  _scheduledUiRefreshRaf = 0;
  if (!_scheduledUiRefreshPending) return;
  _scheduledUiRefreshPending = false;
  buildCalChips();
  renderCalendar();
  renderMap();
  _updateTally();
}

function scheduleUiRefresh() {
  _scheduledUiRefreshPending = true;
  if (_scheduledUiRefreshRaf) return;
  _scheduledUiRefreshRaf = requestAnimationFrame(flushScheduledUiRefresh);
}

// Filter control handlers
function setMapType(t) {
  mapTypeFilter = t;
  // Update button styles: tours/fests use their respective colors
  ['both','tours','fests'].forEach(v => {
    const btn = document.getElementById('mft-' + v);
    if (!btn) return;
    btn.classList.remove('on', 'on-f');
    if (v === t) btn.classList.add(v === 'fests' ? 'on-f' : 'on');
  });
  // Sync the old layer-toggle state variables
  showMapTours = t !== 'fests';
  showMapFests = t !== 'tours';
  // Keep score controls available in every mode: tours use ARTIST_PLAYS,
  // festivals use festival.score.
  const scoreRow = document.getElementById('mfilt-score-row');
  if (scoreRow) scoreRow.style.display = '';
  // Sync sidebar tab to match map type
  if (t === 'fests' && sidebarTab === 'tours') setTab('fests');
  else if (t === 'tours' && sidebarTab === 'fests') setTab('tours');
  else withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function setMapScore(s) {
  mapScoreFilter = s;
  document.querySelectorAll('[data-ms]').forEach(b =>
    b.classList.toggle('on', +b.dataset.ms === s));
  withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function setMapDate(d) {
  mapDateMode = d;
  document.querySelectorAll('[data-md],[data-md2]').forEach(b => {
    const val = b.dataset.md || b.dataset.md2;
    b.classList.toggle('on', val === d);
  });
  const rangeRow = document.getElementById('mfilt-range-row');
  if (rangeRow) rangeRow.style.display = d === 'range' ? '' : 'none';
  if (d === 'range') {
    const today = new Date().toISOString().split('T')[0];
    const end   = dateOffset(30);
    const fromEl = document.getElementById('mfilt-from');
    const toEl   = document.getElementById('mfilt-to');
    if (fromEl && !fromEl.value) fromEl.value = today;
    if (toEl   && !toEl.value)   toEl.value   = end;
    mapDateFrom = fromEl?.value || today;
    mapDateTo   = toEl?.value   || end;
  }
  if (d !== 'range') withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}
function applyMapRange() {
  mapDateFrom = document.getElementById('mfilt-from')?.value || '';
  mapDateTo   = document.getElementById('mfilt-to')?.value   || '';
  withMapSpinner(() => { _rebuildMapData(); clearMapLayers(); renderOverview(); });
}

function setMapMaxArtists(n) {
  // Clamp between 5 and 200 in steps of 5
  MAP_MAX_ARTISTS = Math.max(5, Math.min(200, Math.round(n / 5) * 5));
  const valEl = document.getElementById('mfilt-max-val');
  if (valEl) valEl.textContent = MAP_MAX_ARTISTS;
  // No need to rebuild allTourData — the cap is applied inside renderOverview
  withMapSpinner(() => { clearMapLayers(); renderOverview(); });
}

function scoreOkArtist(artistName) {
  if (!calScoreFilter) return true;
  const plays = ARTIST_PLAYS[(artistName||'').toLowerCase()] || 0;
  return plays >= SCORE_ARTIST_MIN[calScoreFilter];
}
function scoreOkFest(f) {
  if (!calScoreFilter) return true;
  return (f.score || 0) >= SCORE_FEST_MIN[calScoreFilter];
}

// ── GEO QUICK FILTER ─────────────────────────────────────────────
let geoNoUSA = true;   // default: hide US events
let geoNoCA  = false;
let geoNoGB  = false;

// Legacy compat — some restore paths still call setGeoQuick with old modes
let geoQuick = 'nousa'; // kept for state restore only
function setGeoQuick(mode) {
  // Convert legacy mode → new booleans
  geoNoUSA = (mode === 'nousa' || mode === 'nousacanada');
  geoNoCA  = (mode === 'nocanada' || mode === 'nousacanada');
  geoQuick = mode;
  _syncGeoButtons();
  renderCalendar(); _updateTally();
}

function toggleGeoExclude(cc) {
  if (cc === 'US') geoNoUSA = !geoNoUSA;
  if (cc === 'CA') geoNoCA  = !geoNoCA;
  if (cc === 'GB') geoNoGB  = !geoNoGB;
  _syncGeoButtons();
  _mapFirstFit = false;
  renderCalendar(); renderMap(); _updateTally();
}

function _syncGeoButtons() {
  const btnUS = document.getElementById('geoq-nousa');
  const btnCA = document.getElementById('geoq-noca');
  const btnGB = document.getElementById('geoq-nouk');
  if (btnUS) btnUS.classList.toggle('on', geoNoUSA);
  if (btnCA) btnCA.classList.toggle('on', geoNoCA);
  if (btnGB) btnGB.classList.toggle('on', geoNoGB);
  document.querySelectorAll('[data-gp]').forEach(btn =>
    btn.classList.toggle('on', btn.dataset.gp === geoPreset));
}

function geoPresetCodes(preset) {
  return getDisplayGeoPresetCodes(preset);
}

function geoPresetOk(cc) {
  if (!cc || geoPreset === 'all') return true;
  const set = geoPresetCodes(geoPreset);
  return !set || set.has(cc);
}

function geoDisplayOk(cc) {
  return geoQuickOk(cc) && geoPresetOk(cc);
}

function setGeoPreset(preset) {
  geoPreset = preset;
  _syncGeoButtons();
  persistSettings();
  _mapFirstFit = false;
  renderCalendar();
  renderMap();
  _updateTally();
}

function _updateTally() {
  const el = document.getElementById('ev-tally');
  if (!el) return;
  const today = new Date().toISOString().split('T')[0];
  const con = visibleConcerts().filter(c => c.date >= today && geoDisplayOk(c.country||'') && scoreOkArtist(c.artist) && !isHidden(c.artist) && dateMatchesPreset(c.date));
  const fst = festivals.filter(f => f.date >= today && (f.score||0) > 0 && geoDisplayOk(f.country||'') && scoreOkFest(f) && dateMatchesPreset(f.date));
  const total = con.length + fst.length;
  el.textContent = total ? `${total} events` : '';
}

// Fast geo check using geoQuick — replaces calGeoFilter for the quick buttons
// Fast lookup: is a concert actually a festival appearance?
// Cross-references against the festivals[] array by date + proximity (< 2 km).
// Used in map popup to show correct 🎪 marker and festival name.
function _festForConcert(c) {
  if (!c || !c.date) return null;
  return festivals
    .filter(f => _festivalConcertBridge(f, c))
    .sort((a, b) => {
      const da = (a.lat != null && c.lat != null) ? geoDist(a.lat, a.lng, c.lat, c.lng) : 999;
      const db = (b.lat != null && c.lat != null) ? geoDist(b.lat, b.lng, c.lat, c.lng) : 999;
      return da - db || (a.date || '').localeCompare(b.date || '');
    })[0] || null;
}

function geoQuickOk(cc) {
  if (geoNoUSA && cc === 'US') return false;
  if (geoNoCA  && cc === 'CA') return false;
  if (geoNoGB  && cc === 'GB') return false;
  return true;
}

function expireHidden() {
  const now = Date.now();
  for (const a in hiddenArtists) if (hiddenArtists[a] !== 0 && hiddenArtists[a] < now) delete hiddenArtists[a];
}
function isHidden(a) { if (!(a in hiddenArtists)) return false; const u = hiddenArtists[a]; return u === 0 || Date.now() < u; }

function renderCalendar() {
  expireHidden();
  const renderToken = ++_calendarRenderToken;
  const today = new Date().toISOString().split('T')[0];

  // Show score-filter row only when there's play count data
  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  const scoreRow = document.getElementById('score-filter-row');
  if (scoreRow) scoreRow.style.display = hasPlays || festivals.some(f => f.score > 0) ? '' : 'none';

  // Delegate to Mexico view renderer
  if (calView === 'mx') { renderMxCalendar(); return; }

  // Combined filter: geoQuick + score
  const scoreFilterOk = (ev) => {
    if (!ev.artist) return scoreOkFest(ev);  // festival object
    return scoreOkArtist(ev.artist);
  };

  // calFilter still handles the old region chips if present; geoQuick is additive
  const geoOk = (ev) => geoDisplayOk(ev.country || '');

  const con = showShows ? dateFilter_(visibleConcerts()).filter(e => !isHidden(e.artist) && geoOk(e) && scoreFilterOk(e)) : [];
  const fst = showFests  ? dateFilter_(festivals).filter(e => geoOk(e) && (e.score||0) > 0 && scoreOkFest(e)) : [];

  // Hidden bar
  const hidList = Object.keys(hiddenArtists).filter(isHidden);
  const bar = document.getElementById('hidden-bar');
  if (hidList.length) {
    bar.style.display = 'flex';
    const frag = document.createDocumentFragment();
    const lbl = document.createElement('span');
    lbl.className = 'hidden-lbl'; lbl.textContent = 'Hidden';
    frag.appendChild(lbl);
    hidList.forEach(a => {
      const u = hiddenArtists[a];
      const lbl2 = u === 0 ? '∞' : new Date(u).toLocaleDateString('en',{month:'short',day:'numeric'});
      const pill = document.createElement('span');
      pill.className = 'hidden-pill';
      pill.innerHTML = `${a} <span class="hidden-lbl" style="font-size:.5rem">${lbl2}</span>`;
      const x = document.createElement('span');
      x.className = 'hidden-pill-x'; x.textContent = '×';
      x.onclick = () => restoreArtist(a);
      pill.appendChild(x);
      frag.appendChild(pill);
    });
    bar.innerHTML = '';
    bar.appendChild(frag);
  } else bar.style.display = 'none';

  // ── Group concerts by date+venue (implicit festival detection) ──
  // Key: date|venueSlug — groups with 3+ tracked artists = one venue-festival row
  const IMPLICIT_FEST_THRESHOLD = 3;
  const venueGroups = new Map(); // key → [{concert}]
  const venueKey = c => `${c.date}|${(c.venue||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,30)}|${(c.city||'').toLowerCase().slice(0,15)}`;

  for (const c of con) {
    const k = venueKey(c);
    if (!venueGroups.has(k)) venueGroups.set(k, []);
    venueGroups.get(k).push(c);
  }

  // Build display items: either single concert or a grouped venue-festival
  const displayItems = []; // {type:'concert'|'venue-fest', date, ...}
  const usedKeys = new Set();

  for (const c of con) {
    const k = venueKey(c);
    if (usedKeys.has(k)) continue;
    usedKeys.add(k);
    const group = venueGroups.get(k);
    if (group.length >= IMPLICIT_FEST_THRESHOLD && shouldGroupAsVenueFestival(group)) {
      // Grouped: sort by ARTISTS list order (or alpha), visible ones first
      const trackedSet = new Set(ARTISTS.map(a => a.toLowerCase()));
      const sorted = [...group].sort((a, b) => {
        const ia = artistListPosition(a.artist);
        const ib = artistListPosition(b.artist);
        return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
      });
      // Deduplicate by artist name (same artist can appear multiple times as featured)
      const seenNames = new Set();
      const dedupSorted = sorted.filter(a => {
        const k = a.artist.toLowerCase();
        if (seenNames.has(k)) return false;
        seenNames.add(k);
        return true;
      });
      displayItems.push({
        type: 'venue-fest',
        date: c.date, venue: c.venue, city: c.city, country: c.country, state: c.state,
        artists: dedupSorted,
        url: dedupSorted.find(x => x.url)?.url || null,
      });
    } else {
      group.forEach(cc => displayItems.push({ type: 'concert', ...cc }));
    }
  }

  // Add festivals
  fst.forEach(f => displayItems.push({ type: 'festival', _fest: true, ...f }));
  displayItems.sort((a, b) => a.date.localeCompare(b.date));

  const el = document.getElementById('ev-tally');
  if (el) el.textContent = (concerts.length || festivals.length) ? `${con.length} shows · ${fst.length} festivals` : '';

  const body = document.getElementById('cal-body');
  if (!displayItems.length) {
    if (concerts.length || festivals.length) {
      body.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><div class="empty-msg">No events match current filters.</div></div>`;
    } else if (window._scanActive) {
      // Scan running but no results yet — show live scanning state instead of onboarding
      body.innerHTML = `<div class="empty"><div class="empty-icon" style="animation:breathe 1.5s ease-in-out infinite">🔍</div><div class="empty-msg">Scanning for concerts…<br><span style="font-size:.62rem;color:var(--muted2)">Results will appear here as artists are checked.</span></div></div>`;
    } else {
      body.innerHTML = '';
      // No data at all — show the onboarding overlay
      showOnboard();
    }
    return;
  }

  const byMonth = {};
  for (const ev of displayItems) {
    const m = ev.date.slice(0,7);
    (byMonth[m] = byMonth[m] || []).push(ev);
  }

  // Precompute last-show dates per artist (only for tours with ≥3 shows)
  const lastShowByArtist = {};
  const tourCountsByArtist = {};
  for (const [artist, evs] of Object.entries(allTourData)) {
    const artistKey = artist.toLowerCase();
    if (evs.length >= 3) lastShowByArtist[artistKey] = evs[evs.length - 1].date;
    tourCountsByArtist[artistKey] = evs.filter(x => x.date >= today).length;
  }
  const trackedArtistKeys = new Set(ARTISTS.map(a => a.toLowerCase()));

  const frag = document.createDocumentFragment();
  const primeArtists = new Set();
  for (const [month, evs] of Object.entries(byMonth)) {
    const sep = document.createElement('div');
    sep.className = 'month-sep';
    sep.textContent = new Date(month+'-02').toLocaleString('en-US',{month:'long',year:'numeric'}).toUpperCase();
    frag.appendChild(sep);

    for (const ev of evs) {
      const d = ev.date.split('-');
      const dayname = new Date(ev.date+'T12:00:00').toLocaleString('en-US',{weekday:'short'}).toUpperCase();
      const loc = [ev.city, ev.state && ev.country==='US' ? ev.state : '', ev.country ? flag(ev.country) : ''].filter(Boolean).join(' ');

      const row = document.createElement('div');
      const dim = ev.type === 'concert' && isHidden(ev.artist);
      row.className = 'ev-row' + (dim ? ' faded' : '');

      const dayblock = document.createElement('div');
      dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;

      const main = document.createElement('div');
      main.className = 'ev-main';
      const actions = document.createElement('div');
      actions.className = 'ev-actions';

      if (ev.type === 'venue-fest') {
        // ── Implicit festival row (multi-artist same venue/date) ───
        row.classList.add('ev-implicit-fest');

        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
        nameEl.textContent = ev.venue || 'Multi-artist show';
        if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');

        const badgeWrap = document.createElement('span');
        const festBadge = document.createElement('span');
        festBadge.className = 'fest-badge'; festBadge.textContent = 'Festival';
        const cntBadge = document.createElement('span');
        cntBadge.className = 'fest-badge';
        cntBadge.style.cssText = 'background:rgba(255,170,60,.15);border-color:rgba(255,170,60,.5);color:#ffaa3c';
        cntBadge.textContent = `&#9733; ${ev.artists.length}`;
        badgeWrap.appendChild(festBadge);
        badgeWrap.appendChild(cntBadge);
        nameEl.appendChild(badgeWrap);

        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' · '+loc : ''}`;

        const chipsEl = document.createElement('div');
        chipsEl.className = 'ev-artists';
        const trackedSet = new Set(ARTISTS.map(a => a.toLowerCase()));
        const seenArtists = new Set();

        ev.artists.forEach(cc => {
          if (!cc.artist) return;
          const key = cc.artist.toLowerCase();
          if (seenArtists.has(key)) return;
          seenArtists.add(key);
          primeArtists.add(cc.artist);
          const isMine = trackedSet.has(key);
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip' + (isMine ? ' mine' : '');
          appendArtistChipIdentity(chip, cc.artist, isMine ? (ARTIST_PLAYS[key] || 0) : 0);
          chip.style.cursor = 'pointer';
          chip.onclick = () => { focusArtist(cc.artist); setTab('tours'); };
          chipsEl.appendChild(chip);
        });

        main.appendChild(nameEl); main.appendChild(sub); main.appendChild(chipsEl);

      } else if (ev.type === 'festival') {
        // ── Known festival from Ticketmaster ───────────────────────
        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
        nameEl.textContent = ev.name;
        const badge = document.createElement('span');
        badge.className = 'fest-badge'; badge.textContent = 'Festival';
        nameEl.appendChild(badge);
        if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');
        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        const dateStr = fmtDateRange(ev._fest ? ev : {date:ev.date, endDate:ev.endDate});
        sub.innerHTML = `<strong>${ev.venue||''}</strong>${loc ? ' · '+loc : ''}${ev.endDate ? ' · '+dateStr : ''}`;
        main.appendChild(nameEl); main.appendChild(sub);

        // Show matched artists (what triggered this festival to appear)
        const matched = ev.matched || [];
        if (matched.length) {
          matched.forEach(m => m.artist && primeArtists.add(m.artist));
          const chipsEl = document.createElement('div');
          chipsEl.className = 'ev-artists';
          matched.slice(0, 6).forEach(m => {
            const chip = document.createElement('span');
            chip.className = 'ev-artist-chip mine';
            appendArtistChipIdentity(chip, m.artist, m.plays || 0);
            chip.onclick = () => focusArtist(m.artist);
            chipsEl.appendChild(chip);
          });
          if (matched.length > 6) {
            const more = document.createElement('span');
            more.className = 'ev-artist-chip ev-more-chip';
            more.textContent = `+${matched.length - 6} more`;
            more.title = 'Click to show all';
            more.onclick = () => {
              // Replace this chip with the remaining artists
              more.remove();
              matched.slice(6).forEach(m => {
                const chip = document.createElement('span');
                chip.className = 'ev-artist-chip mine';
                appendArtistChipIdentity(chip, m.artist, m.plays || 0);
                chip.onclick = () => focusArtist(m.artist);
                chipsEl.appendChild(chip);
              });
            };
            chipsEl.appendChild(more);
          }
          main.appendChild(chipsEl);
        }

      } else {
        // ── Single concert ─────────────────────────────────────────
        if (ev.artist) primeArtists.add(ev.artist);
        const nameEl = document.createElement('div');
        nameEl.className = 'ev-name';
        nameEl.textContent = ev.artist;

        // LAST SHOW badge: is this the final known date for this artist's tour?
        const artistKey = (ev.artist || '').toLowerCase();
        if (lastShowByArtist[artistKey] && ev.date === lastShowByArtist[artistKey]) {
          const badge = document.createElement('span');
          badge.style.cssText = 'font-size:.44rem;padding:1px 6px;border-radius:100px;border:1px solid #ff8080;color:#ff8080;background:rgba(255,80,80,.07);margin-left:6px;vertical-align:middle;letter-spacing:.04em';
          badge.textContent = 'LAST SHOW';
          nameEl.appendChild(badge);
        }

        const headline = document.createElement('div');
        headline.className = 'ev-headline';
        headline.appendChild(createArtistAvatar(ev.artist, { size:'feed', color:getColor(ev.artist) }));
        headline.appendChild(nameEl);

        const sub = document.createElement('div');
        sub.className = 'ev-sub';
        if (ev.url && ev.venue) {
          const vLink = document.createElement('strong');
          vLink.textContent = ev.venue;
          vLink.style.cssText = 'cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;';
          vLink.title = 'Open ticket page';
          vLink.onclick = (e) => { e.stopPropagation(); window.open(ev.url, '_blank'); };
          sub.appendChild(vLink);
          if (loc) sub.appendChild(document.createTextNode(' · ' + loc));
        } else {
          sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' · '+loc : ''}`;
        }
        main.appendChild(headline); main.appendChild(sub);

        const fest = _festForConcert(ev);
        const metaRow = document.createElement('div');
        metaRow.className = 'ev-artists';
        const artistTourCount = (allTourData[ev.artist] || []).filter(x => x.date >= today).length;
        if (fest) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip mine';
          chip.textContent = `Festival · ${fest.name}`;
          chip.onclick = e => { e.stopPropagation(); openFestDetail(fest.id); };
          metaRow.appendChild(chip);
        }
        if (artistTourCount > 1) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip';
          chip.textContent = `${artistTourCount} tour dates`;
          metaRow.appendChild(chip);
        }
        if (ev.eventName && _normText(ev.eventName) !== _normText(ev.artist)) {
          const chip = document.createElement('span');
          chip.className = 'ev-artist-chip';
          chip.textContent = ev.eventName;
          metaRow.appendChild(chip);
        }
        if (metaRow.childNodes.length) main.appendChild(metaRow);

        row.classList.add('is-clickable');
        row.title = 'Open on map';
        row.onclick = (e) => {
          if (e.target.closest('.hide-btn,.ev-sub strong')) return;
          focusConcert(ev);
        };

        const btn = document.createElement('button');
        btn.className = 'hide-btn' + (dim ? ' rst' : '');
        btn.textContent = dim ? 'Restore' : 'Hide';
        btn.onclick = dim ? () => restoreArtist(ev.artist) : () => openSnooze(ev.artist);
        actions.appendChild(btn);
      }

      row.appendChild(dayblock); row.appendChild(main); row.appendChild(actions);
      frag.appendChild(row);
    }
  }
  body.innerHTML = '';
  body.appendChild(frag);
  primeArtistMediaKnowledge([...primeArtists], 24);
  _updateTally();
}

// ── SNOOZE ──────────────────────────────────────────────────────
function createCalendarMonthSeparator(month) {
  const sep = document.createElement('div');
  sep.className = 'month-sep';
  sep.textContent = new Date(month + '-02').toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  return sep;
}

function buildCalendarEventRow(ev, ctx) {
  const { today, lastShowByArtist, primeArtists, trackedArtistKeys, tourCountsByArtist } = ctx;
  const d = ev.date.split('-');
  const dayname = new Date(ev.date + 'T12:00:00').toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
  const loc = [ev.city, ev.state && ev.country === 'US' ? ev.state : '', ev.country ? flag(ev.country) : ''].filter(Boolean).join(' ');

  const row = document.createElement('div');
  const dim = ev.type === 'concert' && isHidden(ev.artist);
  row.className = 'ev-row' + (dim ? ' faded' : '');

  const dayblock = document.createElement('div');
  dayblock.innerHTML = `<span class="ev-daynum">${d[2]}</span><span class="ev-dayname">${dayname}</span>`;

  const main = document.createElement('div');
  main.className = 'ev-main';
  const actions = document.createElement('div');
  actions.className = 'ev-actions';

  if (ev.type === 'venue-fest') {
    row.classList.add('ev-implicit-fest');
    const nameEl = document.createElement('div');
    nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
    nameEl.textContent = ev.venue || 'Multi-artist show';
    if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');

    const badgeWrap = document.createElement('span');
    const festBadge = document.createElement('span');
    festBadge.className = 'fest-badge';
    festBadge.textContent = 'Festival';
    const cntBadge = document.createElement('span');
    cntBadge.className = 'fest-badge';
    cntBadge.style.cssText = 'background:rgba(255,170,60,.15);border-color:rgba(255,170,60,.5);color:#ffaa3c';
    cntBadge.textContent = `★ ${ev.artists.length}`;
    badgeWrap.appendChild(festBadge);
    badgeWrap.appendChild(cntBadge);
    nameEl.appendChild(badgeWrap);

    const sub = document.createElement('div');
    sub.className = 'ev-sub';
    sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' · ' + loc : ''}`;

    const chipsEl = document.createElement('div');
    chipsEl.className = 'ev-artists';
    const seenArtists = new Set();

    ev.artists.forEach(cc => {
      if (!cc.artist) return;
      const key = cc.artist.toLowerCase();
      if (seenArtists.has(key)) return;
      seenArtists.add(key);
      primeArtists.add(cc.artist);
      const isMine = trackedArtistKeys.has(key);
      const chip = document.createElement('span');
      chip.className = 'ev-artist-chip' + (isMine ? ' mine' : '');
      appendArtistChipIdentity(chip, cc.artist, isMine ? (ARTIST_PLAYS[key] || 0) : 0);
      chip.style.cursor = 'pointer';
      chip.onclick = () => { focusArtist(cc.artist); setTab('tours'); };
      chipsEl.appendChild(chip);
    });

    main.appendChild(nameEl);
    main.appendChild(sub);
    main.appendChild(chipsEl);
  } else if (ev.type === 'festival') {
    const nameEl = document.createElement('div');
    nameEl.className = 'ev-name' + (ev.url ? ' tkt' : '');
    nameEl.textContent = ev.name;
    const badge = document.createElement('span');
    badge.className = 'fest-badge';
    badge.textContent = 'Festival';
    nameEl.appendChild(badge);
    if (ev.url) nameEl.onclick = () => window.open(ev.url, '_blank');

    const sub = document.createElement('div');
    sub.className = 'ev-sub';
    const dateStr = fmtDateRange(ev._fest ? ev : { date: ev.date, endDate: ev.endDate });
    sub.innerHTML = `<strong>${ev.venue || ''}</strong>${loc ? ' · ' + loc : ''}${ev.endDate ? ' · ' + dateStr : ''}`;
    main.appendChild(nameEl);
    main.appendChild(sub);

    const matched = ev.matched || [];
    if (matched.length) {
      matched.forEach(m => m.artist && primeArtists.add(m.artist));
      const chipsEl = document.createElement('div');
      chipsEl.className = 'ev-artists';
      matched.slice(0, 6).forEach(m => {
        const chip = document.createElement('span');
        chip.className = 'ev-artist-chip mine';
        appendArtistChipIdentity(chip, m.artist, m.plays || 0);
        chip.onclick = () => focusArtist(m.artist);
        chipsEl.appendChild(chip);
      });
      if (matched.length > 6) {
        const more = document.createElement('span');
        more.className = 'ev-artist-chip ev-more-chip';
        more.textContent = `+${matched.length - 6} more`;
        more.title = 'Click to show all';
        more.onclick = () => {
          more.remove();
          matched.slice(6).forEach(m => {
            const chip = document.createElement('span');
            chip.className = 'ev-artist-chip mine';
            appendArtistChipIdentity(chip, m.artist, m.plays || 0);
            chip.onclick = () => focusArtist(m.artist);
            chipsEl.appendChild(chip);
          });
        };
        chipsEl.appendChild(more);
      }
      main.appendChild(chipsEl);
    }
  } else {
    if (ev.artist) primeArtists.add(ev.artist);
    const nameEl = document.createElement('div');
    nameEl.className = 'ev-name';
    nameEl.textContent = ev.artist;

    const artistKey = (ev.artist || '').toLowerCase();
    if (lastShowByArtist[artistKey] && ev.date === lastShowByArtist[artistKey]) {
      const badge = document.createElement('span');
      badge.style.cssText = 'font-size:.44rem;padding:1px 6px;border-radius:100px;border:1px solid #ff8080;color:#ff8080;background:rgba(255,80,80,.07);margin-left:6px;vertical-align:middle;letter-spacing:.04em';
      badge.textContent = 'LAST SHOW';
      nameEl.appendChild(badge);
    }

    const headline = document.createElement('div');
    headline.className = 'ev-headline';
    headline.appendChild(createArtistAvatar(ev.artist, { size: 'feed', color: getColor(ev.artist) }));
    headline.appendChild(nameEl);

    const sub = document.createElement('div');
    sub.className = 'ev-sub';
    if (ev.url && ev.venue) {
      const vLink = document.createElement('strong');
      vLink.textContent = ev.venue;
      vLink.style.cssText = 'cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;';
      vLink.title = 'Open ticket page';
      vLink.onclick = e => { e.stopPropagation(); window.open(ev.url, '_blank'); };
      sub.appendChild(vLink);
      if (loc) sub.appendChild(document.createTextNode(' · ' + loc));
    } else {
      sub.innerHTML = `<strong>${ev.venue}</strong>${loc ? ' · ' + loc : ''}`;
    }
    main.appendChild(headline);
    main.appendChild(sub);

    const fest = _festForConcert(ev);
    const metaRow = document.createElement('div');
    metaRow.className = 'ev-artists';
    const artistTourCount = tourCountsByArtist[(ev.artist || '').toLowerCase()] || 0;
    if (fest) {
      const chip = document.createElement('span');
      chip.className = 'ev-artist-chip mine';
      chip.textContent = `Festival · ${fest.name}`;
      chip.onclick = e => { e.stopPropagation(); openFestDetail(fest.id); };
      metaRow.appendChild(chip);
    }
    if (artistTourCount > 1) {
      const chip = document.createElement('span');
      chip.className = 'ev-artist-chip';
      chip.textContent = `${artistTourCount} tour dates`;
      metaRow.appendChild(chip);
    }
    if (ev.eventName && _normText(ev.eventName) !== _normText(ev.artist)) {
      const chip = document.createElement('span');
      chip.className = 'ev-artist-chip';
      chip.textContent = ev.eventName;
      metaRow.appendChild(chip);
    }
    if (metaRow.childNodes.length) main.appendChild(metaRow);

    row.classList.add('is-clickable');
    row.title = 'Open on map';
    row.onclick = e => {
      if (e.target.closest('.hide-btn,.ev-sub strong')) return;
      focusConcert(ev);
    };

    const btn = document.createElement('button');
    btn.className = 'hide-btn' + (dim ? ' rst' : '');
    btn.textContent = dim ? 'Restore' : 'Hide';
    btn.onclick = dim ? () => restoreArtist(ev.artist) : () => openSnooze(ev.artist);
    actions.appendChild(btn);
  }

  row.appendChild(dayblock);
  row.appendChild(main);
  row.appendChild(actions);
  return row;
}

renderCalendar = window.renderCalendar = function renderCalendarOptimized() {
  expireHidden();
  const renderToken = ++_calendarRenderToken;
  const today = new Date().toISOString().split('T')[0];

  const hasPlays = Object.values(ARTIST_PLAYS).some(v => v > 0);
  const scoreRow = document.getElementById('score-filter-row');
  if (scoreRow) scoreRow.style.display = hasPlays || festivals.some(f => f.score > 0) ? '' : 'none';

  if (calView === 'mx') { renderMxCalendar(); return; }

  const scoreFilterOk = ev => {
    if (!ev.artist) return scoreOkFest(ev);
    return scoreOkArtist(ev.artist);
  };
  const geoOk = ev => geoDisplayOk(ev.country || '');

  const con = showShows ? dateFilter_(visibleConcerts()).filter(e => !isHidden(e.artist) && geoOk(e) && scoreFilterOk(e)) : [];
  const fst = showFests ? dateFilter_(festivals).filter(e => geoOk(e) && (e.score || 0) > 0 && scoreOkFest(e)) : [];

  const hidList = Object.keys(hiddenArtists).filter(isHidden);
  const bar = document.getElementById('hidden-bar');
  if (hidList.length) {
    bar.style.display = 'flex';
    const frag = document.createDocumentFragment();
    const lbl = document.createElement('span');
    lbl.className = 'hidden-lbl';
    lbl.textContent = 'Hidden';
    frag.appendChild(lbl);
    hidList.forEach(a => {
      const u = hiddenArtists[a];
      const lbl2 = u === 0 ? '∞' : new Date(u).toLocaleDateString('en', { month: 'short', day: 'numeric' });
      const pill = document.createElement('span');
      pill.className = 'hidden-pill';
      pill.innerHTML = `${a} <span class="hidden-lbl" style="font-size:.5rem">${lbl2}</span>`;
      const x = document.createElement('span');
      x.className = 'hidden-pill-x';
      x.textContent = '×';
      x.onclick = () => restoreArtist(a);
      pill.appendChild(x);
      frag.appendChild(pill);
    });
    bar.innerHTML = '';
    bar.appendChild(frag);
  } else bar.style.display = 'none';

  const IMPLICIT_FEST_THRESHOLD = 3;
  const venueGroups = new Map();
  const venueKey = c => `${c.date}|${(c.venue || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)}|${(c.city || '').toLowerCase().slice(0, 15)}`;
  for (const c of con) {
    const key = venueKey(c);
    if (!venueGroups.has(key)) venueGroups.set(key, []);
    venueGroups.get(key).push(c);
  }

  const displayItems = [];
  const usedKeys = new Set();
  for (const c of con) {
    const key = venueKey(c);
    if (usedKeys.has(key)) continue;
    usedKeys.add(key);
    const group = venueGroups.get(key);
    if (group.length >= IMPLICIT_FEST_THRESHOLD && shouldGroupAsVenueFestival(group)) {
      const sorted = [...group].sort((a, b) => {
        const ia = artistListPosition(a.artist);
        const ib = artistListPosition(b.artist);
        return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
      });
      const seenNames = new Set();
      const dedupSorted = sorted.filter(a => {
        const artistKey = a.artist.toLowerCase();
        if (seenNames.has(artistKey)) return false;
        seenNames.add(artistKey);
        return true;
      });
      displayItems.push({
        type: 'venue-fest',
        date: c.date,
        venue: c.venue,
        city: c.city,
        country: c.country,
        state: c.state,
        artists: dedupSorted,
        url: dedupSorted.find(x => x.url)?.url || null,
      });
    } else {
      group.forEach(cc => displayItems.push({ type: 'concert', ...cc }));
    }
  }

  fst.forEach(f => displayItems.push({ type: 'festival', _fest: true, ...f }));
  displayItems.sort((a, b) => a.date.localeCompare(b.date));

  const el = document.getElementById('ev-tally');
  if (el) el.textContent = (concerts.length || festivals.length) ? `${con.length} shows · ${fst.length} festivals` : '';

  const body = document.getElementById('cal-body');
  if (!displayItems.length) {
    if (concerts.length || festivals.length) {
      body.innerHTML = `<div class="empty"><div class="empty-icon">📭</div><div class="empty-msg">No events match current filters.</div></div>`;
    } else if (window._scanActive) {
      body.innerHTML = `<div class="empty"><div class="empty-icon" style="animation:breathe 1.5s ease-in-out infinite">🔍</div><div class="empty-msg">Scanning for concerts…<br><span style="font-size:.62rem;color:var(--muted2)">Results will appear here as artists are checked.</span></div></div>`;
    } else {
      body.innerHTML = '';
      showOnboard();
    }
    return;
  }

  const byMonth = {};
  for (const ev of displayItems) {
    const month = ev.date.slice(0, 7);
    (byMonth[month] = byMonth[month] || []).push(ev);
  }

  const lastShowByArtist = {};
  const tourCountsByArtist = {};
  for (const [artist, evs] of Object.entries(allTourData)) {
    const artistKey = artist.toLowerCase();
    if (evs.length >= 3) lastShowByArtist[artistKey] = evs[evs.length - 1].date;
    tourCountsByArtist[artistKey] = evs.filter(x => x.date >= today).length;
  }
  const trackedArtistKeys = new Set(ARTISTS.map(a => a.toLowerCase()));

  const renderItems = [];
  for (const [month, evs] of Object.entries(byMonth)) {
    renderItems.push({ type: 'month', month });
    for (const ev of evs) renderItems.push({ type: 'event', ev });
  }

  const primeArtists = new Set();
  body.innerHTML = '';

  const renderChunk = start => {
    if (_calendarRenderToken !== renderToken) return;
    const frag = document.createDocumentFragment();
    const end = Math.min(start + CALENDAR_RENDER_BATCH_SIZE, renderItems.length);
    for (let i = start; i < end; i++) {
      const item = renderItems[i];
      if (item.type === 'month') frag.appendChild(createCalendarMonthSeparator(item.month));
      else frag.appendChild(buildCalendarEventRow(item.ev, { today, lastShowByArtist, primeArtists, trackedArtistKeys, tourCountsByArtist }));
    }
    body.appendChild(frag);
    if (end < renderItems.length) requestAnimationFrame(() => renderChunk(end));
    else {
      primeArtistMediaKnowledge([...primeArtists], 24);
      _updateTally();
    }
  };

  renderChunk(0);
};

function openSnooze(artist) {
  snoozeTarget = artist;
  document.getElementById('snooze-sub').textContent = `Hide upcoming events for "${artist}"`;
  document.getElementById('snooze-bg').classList.remove('off');
}
function closeSnooze() { document.getElementById('snooze-bg').classList.add('off'); snoozeTarget = ''; }
function doSnooze(days) {
  if (!snoozeTarget) return;
  hiddenArtists[snoozeTarget] = days === 0 ? 0 : Date.now() + days * 86400000;
  persistSettings(); closeSnooze(); renderCalendar();
}
function restoreArtist(artist) { delete hiddenArtists[artist]; persistSettings(); renderCalendar(); }

// ═══════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════
function getColor(artist) {
  if (!artistColors[artist]) artistColors[artist] = ARTIST_COLORS[colorIdx++ % ARTIST_COLORS.length];
  return artistColors[artist];
}
