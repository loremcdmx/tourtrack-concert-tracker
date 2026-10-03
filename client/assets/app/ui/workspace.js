'use strict';

function setWorkspaceView(view) {
  if (view !== 'agenda' && view !== 'map') return;
  document.body.dataset.workspaceView = view;
  document.querySelectorAll('button[data-workspace-view]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.workspaceView === view));
  });
  if (view === 'map') {
    // Update the cached Leaflet size before a concert click fits its tour bounds.
    if (typeof lmap !== 'undefined' && lmap) lmap.invalidateSize({pan:false, animate:false});
    if (typeof _mapFirstFit !== 'undefined' && !_mapFirstFit && typeof _mapMaybeFitFilteredView === 'function') {
      _mapMaybeFitFilteredView();
    }
    if (typeof scheduleMapResize === 'function') scheduleMapResize();
  }
}

function toggleCalendarFilters() {
  const expanded = document.body.classList.toggle('calendar-filters-open');
  const button = document.getElementById('calendar-filters-toggle');
  if (button) {
    button.setAttribute('aria-expanded', String(expanded));
    const sign = button.querySelector('span');
    if (sign) sign.textContent = expanded ? '−' : '+';
  }
}

// Keep the full agenda available at phone widths; the map has its own view.
setWorkspaceView('agenda');
