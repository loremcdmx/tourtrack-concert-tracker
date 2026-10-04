'use strict';

let _mapLabelFrame = null;
let _mapLabelLeaders = [];

function _mapRegisterLabel(marker, id, priority, items) {
  marker._ctLayout = {
    id, priority, items, displayItems: items,
    icon: marker.options.icon,
    popup: marker.getPopup()?.getContent(),
    footprint: null,
  };
  return marker;
}

function _mapGroupItems(items) {
  const seen = new Set();
  return items.filter(item => {
    const event = item.kind === 'fest' ? item.f : item.ev;
    const key = `${item.kind}|${item.artist || ''}|${event.id || ''}|${event.date}|${event.venue || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function _mapBuildGroupPopup(items) {
  items = _mapGroupItems(items);
  const root = _mapCreateEl('div', 'map-popup map-popup--event-group');
  const body = _mapCreateEl('div', 'map-popup__body');
  body.appendChild(_mapCreateEl('div', 'map-popup__title', `${items.length} nearby events`));
  const tours = items.filter(item => item.kind === 'tour').length;
  body.appendChild(_mapCreateEl('div', 'map-popup__meta', `${tours} shows · ${items.length - tours} festivals`));
  const list = _mapCreateEl('div', 'map-event-group-list');
  items.forEach(item => {
    const isFest = item.kind === 'fest';
    const event = isFest ? item.f : item.ev;
    const name = isFest ? event.name : item.artist;
    const row = _mapCreateEl('button', 'map-event-group-row');
    row.type = 'button';
    row.dataset.kind = item.kind;
    row.dataset.eventId = String(event.id || '');
    row.appendChild(_mapCreateEl('strong', '', `${isFest ? 'Festival · ' : ''}${name}`));
    row.appendChild(_mapCreateEl('span', '', [isFest ? fmtDateRange(event) : fmtDate(event.date), event.venue || event.city].filter(Boolean).join(' · ')));
    row.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      lmap.closePopup();
      if (isFest) openFestDetail(event.id);
      else focusConcert(event);
    });
    list.appendChild(row);
  });
  body.appendChild(list);
  body.appendChild(_mapPopupActionEl('Zoom into this area', {
    tone: 'primary',
    onClick: () => {
      const points = items.map(item => item.kind === 'fest' ? item.f : item.ev);
      const bounds = L.latLngBounds(points.map(event => [event.lat, event.lng]));
      lmap.closePopup();
      if (bounds.isValid()) lmap.fitBounds(bounds, { padding: [60, 60], maxZoom: Math.min(19, lmap.getZoom() + 2), animate: false });
    },
  }));
  root.appendChild(body);
  _mapPopupEnableInteraction(root);
  return root;
}

function scheduleMapLabelLayout() {
  if (_mapLabelFrame !== null) return;
  _mapLabelFrame = requestAnimationFrame(() => {
    _mapLabelFrame = null;
    relayoutMapLabels();
  });
}

function _mapLabelBlockedRects(mapRect) {
  const selectors = '.atlas-heading, #map-refresh-area-btn, .leaflet-control, #sidebar-open-tabs, #map-sidebar:not(.collapsed), #map-legend, #honesty-float-btn, #focus-overlay';
  return [...document.querySelectorAll(selectors)].flatMap(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (!rect.width || !rect.height || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0'
        || rect.right <= mapRect.left || rect.left >= mapRect.right || rect.bottom <= mapRect.top || rect.top >= mapRect.bottom) return [];
    return [{ x: rect.left - mapRect.left, y: rect.top - mapRect.top, width: rect.width, height: rect.height }];
  });
}

function relayoutMapLabels() {
  if (!lmap || typeof layoutMapLabels !== 'function') return;
  const mapRect = document.getElementById('map').getBoundingClientRect();
  // Leaflet may retain its last size while the mobile agenda hides the map.
  // Wait for real geometry rather than permanently measuring zero-size icons.
  if (!mapRect.width || !mapRect.height) return;
  const size = lmap.getSize();
  if (!size.x || !size.y) return;
  _mapLabelLeaders.forEach(layer => layer.remove());
  _mapLabelLeaders = [];
  const markers = [...tourMarkers, ...festMarkers].filter(marker => marker._ctLayout && marker.getElement());
  const openPopups = markers.filter(marker => marker.isPopupOpen()).map(marker => {
    const popup = marker.getPopup();
    const autoPan = popup.options.autoPan;
    // Updating a label must not pan the map and trigger another layout cycle.
    popup.options.autoPan = false;
    return { marker, popup, autoPan };
  });
  const byId = new Map();
  const candidates = markers.map(marker => {
    const data = marker._ctLayout;
    const element = marker.getElement();
    element.style.visibility = '';
    element.removeAttribute('aria-hidden');
    element.tabIndex = 0;
    if (!data.footprint) {
      const outer = element.getBoundingClientRect();
      const child = element.firstElementChild;
      const rects = [child || element, ...element.querySelectorAll('[data-map-label-footprint]')]
        .map(node => node.getBoundingClientRect()).filter(rect => rect.width && rect.height);
      if (rects.length) {
        const left = Math.min(...rects.map(rect => rect.left));
        const top = Math.min(...rects.map(rect => rect.top));
        data.footprint = { width: Math.max(...rects.map(rect => rect.right)) - left,
          height: Math.max(...rects.map(rect => rect.bottom)) - top,
          left: left - outer.left, top: top - outer.top };
      }
    }
    const footprint = data.footprint || { width: marker.options.icon.options.iconSize[0], height: marker.options.icon.options.iconSize[1] };
    const point = lmap.latLngToContainerPoint(marker.getLatLng());
    byId.set(data.id, { marker, point });
    return { id: data.id, x: point.x, y: point.y, width: footprint.width, height: footprint.height, priority: data.priority };
  });
  const placements = layoutMapLabels(candidates, { width: size.x, height: size.y, blocked: _mapLabelBlockedRects(mapRect) });
  markers.forEach(marker => {
    const element = marker.getElement();
    element.style.visibility = 'hidden';
    element.setAttribute('aria-hidden', 'true');
    element.tabIndex = -1;
    marker._ctLayout.displayItems = [];
  });
  placements.forEach(placement => {
    const { marker, point } = byId.get(placement.id);
    const data = marker._ctLayout;
    const items = _mapGroupItems(placement.members.flatMap(id => byId.get(id).marker._ctLayout.items));
    data.displayItems = items;
    let footprint = data.footprint || { width: marker.options.icon.options.iconSize[0], height: marker.options.icon.options.iconSize[1], left: 0, top: 0 };
    if (placement.compact) {
      if (!data.compact) marker.setIcon(L.divIcon({ className: '', iconSize: [48, 28], iconAnchor: [0, 0],
        html: '<div class="map-event-group"><span></span><span></span></div>' }));
      const spans = marker.getElement().querySelectorAll('.map-event-group span');
      spans[0].textContent = items.length;
      spans[1].textContent = items.length === 1 ? 'event' : 'events';
      footprint = { width: 48, height: 28, left: 0, top: 0 };
      const content = () => _mapBuildGroupPopup(data.displayItems);
      if (!data.compact) {
        if (marker.getPopup()) marker.setPopupContent(content);
        else marker.bindPopup(content, { maxWidth: 380, className: 'map-popup-shell' });
      }
    } else if (data.compact) {
      marker.setIcon(data.icon);
      if (data.popup !== undefined) marker.setPopupContent(data.popup);
    }
    data.compact = placement.compact;
    const left = placement.x + (placement.width - footprint.width) / 2;
    const top = placement.y + (placement.height - footprint.height) / 2;
    const element = marker.getElement();
    element.classList.add('map-layout-marker');
    element.dataset.layoutId = data.id;
    element.dataset.layoutMembers = String(items.length);
    element.style.marginLeft = `${left - point.x - footprint.left}px`;
    element.style.marginTop = `${top - point.y - footprint.top}px`;
    element.style.visibility = '';
    element.removeAttribute('aria-hidden');
    element.tabIndex = 0;
    const names = items.map(item => item.kind === 'fest' ? item.f.name : item.artist);
    element.setAttribute('aria-label', placement.compact ? `${items.length} nearby events: ${names.slice(0, 3).join(', ')}` : names.join(', '));
    // Popups follow the visible label while the marker's lat/lng stays exact.
    if (marker.getPopup()) marker.getPopup().options.offset = L.point(left + footprint.width / 2 - point.x, top - point.y);
    const edge = { x: Math.max(left, Math.min(point.x, left + footprint.width)), y: Math.max(top, Math.min(point.y, top + footprint.height)) };
    if (Math.hypot(edge.x - point.x, edge.y - point.y) > 8) {
      _mapLabelLeaders.push(L.polyline([marker.getLatLng(), lmap.containerPointToLatLng(L.point(edge.x, edge.y))], {
        color: '#6c506d', weight: 1, opacity: .7, interactive: false, dashArray: '2 3', renderer: _mapGetCanvasRenderer(),
      }).addTo(lmap));
    }
  });
  openPopups.forEach(({ marker, popup, autoPan }) => {
    const data = marker._ctLayout;
    if (!data.displayItems.length) marker.closePopup();
    else {
      if (data.compact) marker.setPopupContent(() => _mapBuildGroupPopup(data.displayItems));
      popup.update();
    }
    popup.options.autoPan = autoPan;
  });
}

if (document.fonts) document.fonts.ready.then(scheduleMapLabelLayout);
