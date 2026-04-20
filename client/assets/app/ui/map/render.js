'use strict';

let MAP_MAX_ARTISTS = 30;
let _mapWasCapped = false;   // true when last render trimmed to top 20
let _mapFirstFit  = false;   // becomes true after the first fitBounds — prevents jumping on filter changes

function _mapCreateEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

function _mapPopupBadgeEl(label, tone = '') {
  return _mapCreateEl('span', `map-popup-badge${tone ? ` is-${tone}` : ''}`, label);
}

function _mapPopupMetricEl(label, value) {
  const el = _mapCreateEl('div', 'map-popup-metric');
  el.appendChild(_mapCreateEl('span', 'map-popup-metric__value', String(value)));
  el.appendChild(_mapCreateEl('span', 'map-popup-metric__label', label));
  return el;
}

function _mapPopupActionEl(label, opts = {}) {
  const isLink = !!opts.href;
  const el = _mapCreateEl(isLink ? 'a' : 'button', `map-popup-action${opts.tone ? ` is-${opts.tone}` : ''}`, label);
  if (isLink) {
    el.href = opts.href;
    el.target = '_blank';
    el.rel = 'noreferrer noopener';
  } else {
    el.type = 'button';
  }
  el.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    if (isLink) {
      openExternalUrl(opts.href);
      return;
    }
    if (typeof opts.onClick === 'function') opts.onClick(ev);
  });
  return el;
}

function _mapPopupEnableInteraction(root) {
  if (window.L?.DomEvent) {
    L.DomEvent.disableClickPropagation(root);
    L.DomEvent.disableScrollPropagation(root);
  }
  root.addEventListener('click', ev => ev.stopPropagation());
}

function _mapMarkerAvatarHtml(artist, accent) {
  const media = typeof getCachedArtistMedia === 'function' ? getCachedArtistMedia(artist) : null;
  const src = media?.thumb || media?.large || media?.xl || '';
  return `<span class="map-marker-avatar${src ? ' has-image' : ''}" style="--map-marker-accent:${accent}">
    ${src ? `<img src="${esc2(src)}" alt="${esc2(artist)} portrait" referrerpolicy="no-referrer">` : ''}
    <span class="map-marker-avatar__fallback">${esc2(artistAvatarInitials(artist))}</span>
  </span>`;
}

function _mapShortDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(date.getTime()) ? dateStr : date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function _mapConcertLocation(ev) {
  return [ev.city, ev.state && ev.country === 'US' ? ev.state : '', ev.country ? flag(ev.country) : '']
    .filter(Boolean)
    .join(' ');
}

function _mapUrgencyTone(dateStr, in7, in30) {
  if (!dateStr) return 'later';
  if (dateStr <= in7) return 'urgent';
  if (dateStr <= in30) return 'soon';
  return 'later';
}

function _mapUrgencyLabel(tone) {
  if (tone === 'urgent') return 'This week';
  if (tone === 'soon') return 'This month';
  return 'Upcoming';
}

// ── Festival map popup — rich card with lineup ──────────────────
const MAP_FEST_PALETTE = [
  { fg:'#c8ff5f', bg:'rgba(200,255,95,.18)' },
  { fg:'#54d6ff', bg:'rgba(84,214,255,.18)' },
  { fg:'#45e2b8', bg:'rgba(69,226,184,.18)' },
  { fg:'#ff6b9a', bg:'rgba(255,107,154,.17)' },
  { fg:'#ffd166', bg:'rgba(255,209,102,.18)' },
  { fg:'#ff8f5c', bg:'rgba(255,143,92,.18)' },
  { fg:'#9cf6a3', bg:'rgba(156,246,163,.17)' },
  { fg:'#ff5e57', bg:'rgba(255,94,87,.16)' },
  { fg:'#7ee7ff', bg:'rgba(126,231,255,.17)' }
];

function _mapHashText(value) {
  let h = 2166136261;
  const str = String(value || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function _mapFestTone(f) {
  const key = `${f?.country || ''}|${f?.city || ''}|${f?.name || ''}`;
  return MAP_FEST_PALETTE[_mapHashText(key) % MAP_FEST_PALETTE.length];
}

function _mapFestPriority(f) {
  const matched = (f?.matched || []).length;
  const linked = Number(f?.linkedShows || 0);
  const score = Number(f?.score || 0);
  return score * 10 + matched * 28 + linked * 10;
}

function _mapFestShortName(f, maxLen = 24) {
  const name = String(f?.name || 'Festival').trim() || 'Festival';
  if (name.length <= maxLen) return name;
  return `${name.slice(0, Math.max(4, maxLen - 1))}\u2026`;
}

function _mapFestLabelBudget(zoom, mapSize, count) {
  const area = Math.max(1, (mapSize?.x || 1200) * (mapSize?.y || 800));
  const density = zoom <= 4.5 ? 150000 : zoom <= 5.6 ? 105000 : zoom <= 6.8 ? 78000 : 54000;
  const budget = Math.round(area / density);
  const min = zoom <= 4.5 ? 6 : zoom <= 5.6 ? 10 : 16;
  const max = zoom <= 4.5 ? 16 : zoom <= 5.6 ? 24 : zoom <= 6.8 ? 34 : 64;
  return Math.min(count, Math.max(min, Math.min(max, budget)));
}

function _mapFestClusterCellSize(zoom) {
  if (zoom <= 4.5) return 150;
  if (zoom <= 5.6) return 120;
  if (zoom <= 6.8) return 94;
  return 72;
}

function _mapFestClusterThreshold(zoom) {
  if (zoom <= 4.8) return 2;
  if (zoom <= 6.2) return 3;
  return 4;
}

function _mapFestClusterCenter(items) {
  let lat = 0, lng = 0, total = 0;
  items.forEach(f => {
    const weight = Math.max(1, _mapFestPriority(f) / 30);
    lat += Number(f.lat || 0) * weight;
    lng += Number(f.lng || 0) * weight;
    total += weight;
  });
  return total ? [lat / total, lng / total] : [items[0]?.lat || 0, items[0]?.lng || 0];
}

function _buildFestClusterPopup(items, center) {
  const ranked = [...items].sort((a, b) => _mapFestPriority(b) - _mapFestPriority(a));
  const top = ranked[0] || {};
  const tone = _mapFestTone(top);
  const root = _mapCreateEl('div', 'map-popup map-popup--festival map-popup--festival-cluster');
  root.style.setProperty('--map-popup-accent', tone.fg);

  const body = _mapCreateEl('div', 'map-popup__body');
  const badges = _mapCreateEl('div', 'map-popup__badges');
  badges.appendChild(_mapPopupBadgeEl(`${ranked.length} festivals`, 'fest'));
  const tracked = ranked.reduce((sum, f) => sum + (f.matched || []).length, 0);
  if (tracked) badges.appendChild(_mapPopupBadgeEl(`${tracked} tracked`, 'accent'));
  body.appendChild(badges);

  body.appendChild(_mapCreateEl('div', 'map-popup__title', 'Nearby festivals'));
  const places = [...new Set(ranked.map(f => [f.city, f.country ? flag(f.country) : ''].filter(Boolean).join(' ')).filter(Boolean))];
  if (places.length) body.appendChild(_mapCreateEl('div', 'map-popup__meta', places.slice(0, 4).join(' / ')));

  const list = _mapCreateEl('div', 'map-popup__chips map-popup__chips--stacked');
  ranked.slice(0, 9).forEach(f => {
    const btn = _mapCreateEl('button', 'map-popup-chip map-popup-chip--fest-cluster', _mapFestShortName(f, 26));
    btn.type = 'button';
    const fTone = _mapFestTone(f);
    btn.style.setProperty('--map-chip-accent', fTone.fg);
    const meta = [fmtDateRange(f), f.city].filter(Boolean).join(' / ');
    if (meta) btn.appendChild(_mapCreateEl('span', 'map-popup-chip__meta', meta));
    if (f.id) btn.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openFestDetail(f.id);
    });
    list.appendChild(btn);
  });
  if (ranked.length > 9) list.appendChild(_mapCreateEl('span', 'map-popup-chip map-popup-chip--muted', `+${ranked.length - 9} more`));
  body.appendChild(list);

  const actions = _mapCreateEl('div', 'map-popup__actions');
  actions.appendChild(_mapPopupActionEl('Zoom in', {
    tone: 'primary',
    onClick: () => {
      if (!lmap) return;
      lmap.closePopup();
      lmap.flyTo(center, Math.min(10, Math.max((lmap.getZoom() || 5) + 2, 7)), { duration: .55 });
    }
  }));
  body.appendChild(actions);

  root.appendChild(body);
  _mapPopupEnableInteraction(root);
  return root;
}

function _renderFestCluster(items) {
  if (!items?.length || !lmap) return;
  const ranked = [...items].sort((a, b) => _mapFestPriority(b) - _mapFestPriority(a));
  const top = ranked[0];
  const tone = _mapFestTone(top);
  const center = _mapFestClusterCenter(ranked);
  const label = ranked.length > 1 ? `${_mapFestShortName(top, 14)} +${ranked.length - 1}` : _mapFestShortName(top, 18);
  const width = Math.max(94, Math.min(172, Math.round(label.length * 7.1) + 42));
  const height = 32;
  const swatches = ranked.slice(0, 4)
    .map(f => `<span class="map-fest-cluster__swatch" style="background:${_mapFestTone(f).fg}"></span>`)
    .join('');
  const html = `<div class="map-fest-cluster" style="--map-fest-color:${tone.fg};--map-fest-bg:${tone.bg};width:${width}px;height:${height}px">
    <span class="map-fest-cluster__count">${ranked.length}</span>
    <span class="map-fest-cluster__copy">
      <span class="map-fest-cluster__name">${esc2(label)}</span>
      <span class="map-fest-cluster__swatches">${swatches}</span>
    </span>
  </div>`;
  const icon = L.divIcon({ className:'', iconSize:[width, height], iconAnchor:[width / 2, height / 2], html });
  const zIndex = Math.round(_mapFestPriority(top) + ranked.length * 20);
  const mk = L.marker(center, { icon, zIndexOffset:zIndex })
    .addTo(lmap)
    .bindPopup(() => _buildFestClusterPopup(ranked, center), {
      maxWidth: 460,
      className: 'map-popup-shell map-popup-shell--festival'
    });
  festMarkers.push(mk);
}

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
    const plays = typeof artistPlayCount === 'function' ? artistPlayCount(artist) : (ARTIST_PLAYS[key] || 0);
    matched.push({ artist, plays, weight: plays });
  }
  matched.sort((a, b) => (b.plays || b.weight || 0) - (a.plays || a.weight || 0));

  const topOther = lineup
    .filter(n => !matchedNames.has(_normText(n)) && !_isFestivalSelfReference(n, f.name))
    .slice(0, 6);
  const linkedShows = _festivalLinkedConcerts(f).filter(c => !isHidden(c.artist));

  const root = _mapCreateEl('div', 'map-popup map-popup--festival');
  root.style.setProperty('--map-popup-accent', 'var(--fest)');

  if (f.imageUrl) {
    const mediaWrap = _mapCreateEl(f.url ? 'a' : 'div', 'map-popup__media');
    if (f.url) {
      mediaWrap.href = f.url;
      mediaWrap.target = '_blank';
      mediaWrap.rel = 'noreferrer noopener';
      mediaWrap.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        openExternalUrl(f.url);
      });
    }
    const img = document.createElement('img');
    img.src = f.imageUrl;
    img.alt = f.name ? `${f.name} poster` : 'Festival poster';
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => mediaWrap.remove();
    mediaWrap.appendChild(img);
    root.appendChild(mediaWrap);
  }

  const body = _mapCreateEl('div', 'map-popup__body');
  const badges = _mapCreateEl('div', 'map-popup__badges');
  badges.appendChild(_mapPopupBadgeEl('Festival', 'fest'));
  if (matched.length) badges.appendChild(_mapPopupBadgeEl(`${matched.length} tracked`, 'accent'));
  if (lineup.length) badges.appendChild(_mapPopupBadgeEl(`${lineup.length} lineup`, 'muted'));
  if (linkedShows.length) badges.appendChild(_mapPopupBadgeEl(`${linkedShows.length} linked`, 'muted'));
  body.appendChild(badges);

  body.appendChild(_mapCreateEl('div', 'map-popup__title', f.name || 'Festival'));
  if (dateStr) body.appendChild(_mapCreateEl('div', 'map-popup__meta', dateStr));
  if (f.venue) body.appendChild(_mapCreateEl('div', 'map-popup__subhead', f.venue));

  const locLabel = `${f.city || ''}${cc}`.trim();
  if (locLabel) body.appendChild(_mapCreateEl('div', 'map-popup__meta map-popup__meta--secondary', locLabel));

  const metrics = _mapCreateEl('div', 'map-popup__metrics');
  metrics.appendChild(_mapPopupMetricEl('Score', Math.round(f.score || 0)));
  metrics.appendChild(_mapPopupMetricEl('Tracked', matched.length));
  metrics.appendChild(_mapPopupMetricEl('Linked', linkedShows.length));
  body.appendChild(metrics);

  if (matched.length) {
    const section = _mapCreateEl('div', 'map-popup__section');
    section.appendChild(_mapCreateEl('div', 'map-popup__section-title', 'Your artists'));
    const chips = _mapCreateEl('div', 'map-popup__chips');
    matched.slice(0, 8).forEach(item => {
      const name = item.artist || item;
      const chip = _mapCreateEl('button', 'map-popup-chip map-popup-chip--artist', name);
      chip.type = 'button';
      chip.style.setProperty('--map-chip-accent', getColor(name));
      chip.addEventListener('click', ev => {
        ev.preventDefault();
        ev.stopPropagation();
        focusArtist(name);
      });
      if (item.plays > 0) chip.appendChild(_mapCreateEl('span', 'map-popup-chip__meta', `${item.plays} plays`));
      chips.appendChild(chip);
    });
    if (matched.length > 8) chips.appendChild(_mapCreateEl('span', 'map-popup-chip map-popup-chip--muted', `+${matched.length - 8} more`));
    section.appendChild(chips);
    body.appendChild(section);
  }

  if (topOther.length) {
    const section = _mapCreateEl('div', 'map-popup__section');
    section.appendChild(_mapCreateEl('div', 'map-popup__section-title', 'Also on lineup'));
    const list = _mapCreateEl('div', 'map-popup__chips');
    topOther.forEach(name => list.appendChild(_mapCreateEl('span', 'map-popup-chip map-popup-chip--muted', name)));
    section.appendChild(list);
    body.appendChild(section);
  }

  const actions = _mapCreateEl('div', 'map-popup__actions');
  if (f.id) actions.appendChild(_mapPopupActionEl('Festival card', { tone: 'primary', onClick: () => openFestDetail(f.id) }));
  if (f.url) actions.appendChild(_mapPopupActionEl('Tickets', { href: f.url, tone: 'ghost' }));
  if (actions.childNodes.length) body.appendChild(actions);

  root.appendChild(body);
  _mapPopupEnableInteraction(root);
  return root;
}

function _buildConcertPopup(artist, ev, accent, isFav, plays, in7, in30) {
  const root = _mapCreateEl('div', 'map-popup map-popup--concert');
  root.style.setProperty('--map-popup-accent', accent);

  const body = _mapCreateEl('div', 'map-popup__body');
  const header = _mapCreateEl('div', 'map-popup__header');
  header.appendChild(createArtistAvatar(artist, { size: 'feed', color: accent }));

  const copy = _mapCreateEl('div', 'map-popup__header-copy');
  const urgency = _mapUrgencyTone(ev.date, in7, in30);
  const badges = _mapCreateEl('div', 'map-popup__badges');
  if (isFav) badges.appendChild(_mapPopupBadgeEl('Favorite', 'accent'));
  badges.appendChild(_mapPopupBadgeEl(_mapShortDate(ev.date), 'muted'));
  badges.appendChild(_mapPopupBadgeEl(_mapUrgencyLabel(urgency), urgency === 'urgent' ? 'danger' : (urgency === 'soon' ? 'accent' : 'muted')));
  copy.appendChild(badges);
  copy.appendChild(_mapCreateEl('div', 'map-popup__title', artist));
  if (ev.eventName && _normText(ev.eventName) !== _normText(artist)) copy.appendChild(_mapCreateEl('div', 'map-popup__subhead', ev.eventName));
  header.appendChild(copy);
  body.appendChild(header);

  if (ev.venue) body.appendChild(_mapCreateEl('div', 'map-popup__meta', ev.venue));
  const location = _mapConcertLocation(ev);
  if (location) body.appendChild(_mapCreateEl('div', 'map-popup__meta map-popup__meta--secondary', location));

  const linkedFest = _festForConcert(ev);
  const chips = _mapCreateEl('div', 'map-popup__chips');
  if (plays > 0) chips.appendChild(_mapCreateEl('span', 'map-popup-chip', `${plays} plays`));
  if (linkedFest?.name) {
    const chip = _mapCreateEl('button', 'map-popup-chip map-popup-chip--fest', linkedFest.name);
    chip.type = 'button';
    if (linkedFest.id) chip.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      openFestDetail(linkedFest.id);
    });
    chips.appendChild(chip);
  }
  if (ev.country) chips.appendChild(_mapCreateEl('span', 'map-popup-chip map-popup-chip--muted', flag(ev.country)));
  if (chips.childNodes.length) body.appendChild(chips);

  const actions = _mapCreateEl('div', 'map-popup__actions');
  actions.appendChild(_mapPopupActionEl('Open tour', { tone: 'primary', onClick: () => focusConcert(ev) }));
  if (linkedFest?.id) actions.appendChild(_mapPopupActionEl('Festival', { tone: 'secondary', onClick: () => openFestDetail(linkedFest.id) }));
  if (ev.url) actions.appendChild(_mapPopupActionEl('Tickets', { href: ev.url, tone: 'ghost' }));
  body.appendChild(actions);

  root.appendChild(body);
  _mapPopupEnableInteraction(root);
  return root;
}
function _renderFestLabels() {
  if (!lmap) return;
  clearFestMarkers();

  const today = new Date().toISOString().split('T')[0];
  const skipFests = mapTypeFilter === 'tours';
  if (skipFests) return;

  const festsToRender = festivals.filter(f => f.date >= today && f.lat && f.lng
    && geoDisplayOk(f.country || '') && mapDateOk(f.date) && mapScoreOkFest(f));

  festsToRender.sort((a, b) => _mapFestPriority(b) - _mapFestPriority(a));

  const zoom = lmap.getZoom();
  const mapSize = lmap.getSize();
  const labelBudget = _mapFestLabelBudget(zoom, mapSize, festsToRender.length);
  const clusterCell = _mapFestClusterCellSize(zoom);
  const clusterThreshold = _mapFestClusterThreshold(zoom);
  const shouldCull = _mapFirstFit && typeof lmap.getBounds === 'function';
  const viewBounds = shouldCull ? lmap.getBounds().pad(0.28) : null;
  const festItems = festsToRender
    .filter(f => !viewBounds || viewBounds.contains([f.lat, f.lng]))
    .map(f => ({
      f,
      pt: lmap.latLngToContainerPoint([f.lat, f.lng]),
      tone: _mapFestTone(f),
      priority: _mapFestPriority(f)
    }));

  const labelItems = [];
  const clusterGroups = [];
  if (zoom <= 7.25) {
    const buckets = new Map();
    festItems.forEach(item => {
      const key = `${Math.floor(item.pt.x / clusterCell)}|${Math.floor(item.pt.y / clusterCell)}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(item);
    });
    buckets.forEach(bucket => {
      bucket.sort((a, b) => b.priority - a.priority);
      if (bucket.length >= clusterThreshold) clusterGroups.push(bucket.map(item => item.f));
      else labelItems.push(...bucket);
    });
  } else {
    labelItems.push(...festItems);
  }

  labelItems.sort((a, b) => b.priority - a.priority);
  clusterGroups.sort((a, b) => _mapFestPriority(b[0]) - _mapFestPriority(a[0]));
  clusterGroups.forEach(group => _renderFestCluster(group));

  const occupied = [];
  const PX_PAD = zoom <= 5.6 ? 12 : zoom <= 6.8 ? 9 : 6;
  const rectOverlap = (a, b) =>
    a[0] < b[0] + b[2] + PX_PAD && a[0] + a[2] + PX_PAD > b[0] &&
    a[1] < b[1] + b[3] + PX_PAD && a[1] + a[3] + PX_PAD > b[1];

  let renderedLabels = 0;
  labelItems.forEach(item => {
    const f = item.f;
    const score = f.score || 0;
    const pct = score / 100;
    const col = item.tone.fg;
    const colBg = item.tone.bg;
    const opacity = score === 0 ? 0.55 : 0.78 + pct * 0.22;
    const sz = Math.round(8 + pct * 6);
    const shortName = _mapFestShortName(f, zoom <= 5.6 ? 17 : zoom <= 6.8 ? 21 : 24);
    const trackedCount = (f.matched || []).length;

    const labelMaxW = zoom <= 5.6 ? 170 : zoom <= 6.8 ? 192 : 220;
    const labelW = Math.max(78, Math.min(labelMaxW, Math.round(shortName.length * 7.2) + (trackedCount ? 34 : 44)));
    const labelH = zoom <= 5.6 ? 22 : 24;
    const totalH = labelH + 10;
    const totalW = labelW;

    const pt = item.pt;
    const offsets = [
      [0, 0],
      [0, totalH + sz + 4],
      [totalW + 12, -totalH / 2],
      [-(totalW + 12), -totalH / 2],
      [Math.round(totalW * .55), totalH + 4],
      [-Math.round(totalW * .55), totalH + 4],
      [Math.round(totalW * .58), -totalH - 6],
      [-Math.round(totalW * .58), -totalH - 6],
    ];

    const baseRect = [pt.x - totalW / 2, pt.y - totalH, totalW, totalH];
    let chosenOffset = null;
    if (renderedLabels < labelBudget) {
      for (const [dx, dy] of offsets) {
        const rect = [baseRect[0] + dx, baseRect[1] + dy, totalW, totalH];
        if (!occupied.some(o => rectOverlap(rect, o))) {
          chosenOffset = [dx, dy];
          occupied.push(rect);
          break;
        }
      }
    }

    const renderLabel = chosenOffset !== null;
    if (renderLabel) renderedLabels++;
    const [dx, dy] = chosenOffset || [0, 0];
    const html = renderLabel
      ? `<div class="map-fest-marker-wrap" style="opacity:${opacity};--map-fest-color:${col};--map-fest-bg:${colBg}">
          <div class="map-fest-marker">
            <span class="map-fest-marker__count">${trackedCount || 'Fest'}</span>
            <span class="map-fest-marker__name">${esc2(shortName)}</span>
          </div>
          <div class="map-fest-marker__pin"></div>
        </div>`
      : `<div class="map-fest-dot" style="width:${sz}px;height:${sz}px;opacity:${Math.max(opacity - 0.1, 0.35)};--map-fest-color:${col};--map-fest-bg:${colBg}"></div>`;

    const dotOnlyW = sz + 4;
    const dotOnlyH = sz + 4;
    const w = renderLabel ? totalW : dotOnlyW;
    const h = renderLabel ? totalH : dotOnlyH;
    const anchorX = renderLabel ? (totalW / 2 - dx) : dotOnlyW / 2;
    const anchorY = renderLabel ? (totalH - dy) : dotOnlyH / 2;

    const icon = L.divIcon({ className: '', iconSize: [w, h], iconAnchor: [anchorX, anchorY], html });
    const mk = L.marker([f.lat, f.lng], { icon, zIndexOffset: Math.round(item.priority + score * 5) })
      .addTo(lmap)
      .bindPopup(() => _buildFestPopup(f), { maxWidth: 460, className: 'map-popup-shell map-popup-shell--festival' });
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
  const cityLabel = (city || '?').length > 11 ? `${(city || '?').slice(0, 10)}...` : (city || '?');
  const width = Math.max(52, Math.min(108, cityLabel.length * 7 + 28));
  const height = 40;
  const glow   = urgency === 'urgent' ? `0 0 18px ${col}90` :
                 urgency === 'soon'   ? `0 0 10px ${col}60` : 'none';
  const isPulse = urgency === 'urgent';

  const html = `<div class="map-cluster-marker ${isFav ? 'is-fav' : ''} is-${urgency}" style="--map-cluster-color:${col};--map-cluster-shadow:${glow};width:${width}px;height:${height}px">
    ${isPulse ? `<div class="map-pulse-ring" style="color:${col};border-radius:10px"></div>` : ''}
    <span class="map-cluster-marker__count">${count}</span>
    <span class="map-cluster-marker__city">${esc2(cityLabel)}</span>
  </div>`;

  const icon = L.divIcon({ className: '', iconSize: [width, height], iconAnchor: [width / 2, height / 2], html });
  const mk = L.marker([lat, lng], { icon, zIndexOffset: count * 20 }).addTo(lmap);
  mk.on('click', () => {
    lmap.flyTo([lat, lng], Math.max(lmap.getZoom() + 3, 8), { duration: .65 });
  });
  tourMarkers.push(mk);
}
function _renderArtistPill(artist, ev, rank, today, in7, in30, jitterIdx) {
  const col    = getColor(artist);
  const plays  = typeof artistPlayCount === 'function' ? artistPlayCount(artist) : (ARTIST_PLAYS[(artist || '').toLowerCase()] || 0);
  const isFav  = favoriteArtists.has((artist || '').toLowerCase());
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
    const metaParts = [_mapShortDate(ev.date)];
    if (plays > 0) metaParts.push(`${plays} plays`);
    if (isFav) metaParts.push('Fav');
    const metaLabel = metaParts.filter(Boolean).join(' / ');
    const estW = Math.min(240, Math.max(108, artist.length * (tierS ? 7.3 : 6.8) + 84 + (metaLabel.length > 12 ? 22 : 0)));
    const markerHeight = tierS ? 34 : 30;

    html = `<div class="map-tour-marker ${tierS ? 'is-hero' : 'is-strong'} ${isFav ? 'is-fav' : ''} is-${urgency}"
      style="--map-marker-color:${acc};--map-marker-shadow:${glow};opacity:${dimOp}">
      ${urgency === 'urgent' ? `<div class="map-pulse-ring" style="color:${acc};border-radius:10px"></div>` : ''}
      ${_mapMarkerAvatarHtml(artist, acc)}
      <span class="map-tour-marker__copy">
        <span class="map-tour-marker__name">${esc2(artist)}</span>
        <span class="map-tour-marker__meta">${esc2(metaLabel)}</span>
      </span>
    </div>`;
    iconW = estW;
    iconH = markerHeight;
    anchorX = iconW / 2;
    anchorY = markerHeight / 2;
  } else {
    const sz = tierB ? 10 : 7;
    html = `<div class="map-tour-dot ${tierB ? 'is-tracked' : ''} ${isFav ? 'is-fav' : ''} is-${urgency}"
      style="width:${sz}px;height:${sz}px;--map-marker-color:${acc};--map-marker-shadow:${glow};opacity:${dimOp}"></div>`;
    iconW = sz + 2;
    iconH = sz + 2;
    anchorX = iconW / 2;
    anchorY = iconH / 2;
  }

  let jLat = ev.lat, jLng = ev.lng;
  if (jitterIdx && jitterIdx > 0) {
    const zoom  = lmap ? lmap.getZoom() : 5;
    const r     = (70 * 360 / (256 * Math.pow(2, zoom))) * Math.ceil(jitterIdx / 5);
    const angle = (jitterIdx * 137.5) * (Math.PI / 180);
    jLat = ev.lat + Math.cos(angle) * r;
    jLng = ev.lng + Math.sin(angle) * r;
  }

  const icon = L.divIcon({ className: '', iconSize: [iconW, iconH], iconAnchor: [anchorX, anchorY], html });
  const zIdx = Math.round(rank) + (isFav ? 5000 : 0) +
               (urgency === 'urgent' ? 2000 : urgency === 'soon' ? 800 : 0);

  const mk = L.marker([jLat, jLng], { icon, zIndexOffset: zIdx })
    .addTo(lmap)
    .bindPopup(() => _buildConcertPopup(artist, ev, acc, isFav, plays, in7, in30), {
      maxWidth: 360,
      className: 'map-popup-shell map-popup-shell--concert'
    });
  mk.on('popupopen', () => {
    if (typeof primeArtistMediaKnowledge === 'function') primeArtistMediaKnowledge([artist], 1);
  });
  tourMarkers.push(mk);
}
