'use strict';

function deduplicateConcerts(list) {
  return _deduplicateConcerts(list, false);
}

function _concertScore(c) {
  return (c.url ? 6 : 0)
    + (c.lat != null && c.lng != null ? 4 : 0)
    + (_venueCore(c.venue || '').length ? 3 : 0)
    + (_cityCore(c.city || '').length ? 2 : 0)
    + (_normalizedUrlKey(c.url).length ? 1 : 0)
    + ((c.eventName || '').length > (c.artist || '').length ? 1 : 0)
    + (c.isFest ? 1 : 0);
}
function _sameConcert(a, b, aggressive) {
  if (_normText(a.artist) !== _normText(b.artist) || a.date !== b.date) return false;

  const urlA = _normalizedUrlKey(a.url);
  const urlB = _normalizedUrlKey(b.url);
  if (urlA && urlB && urlA === urlB) return true;
  if (a.id && b.id && a.id === b.id) return true;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (venueA && venueB && venueA === venueB && (!cityA || !cityB || cityA === cityB) && sameCountry) return true;
  if (venueA && venueB && sameCountry && (!cityA || !cityB || cityA === cityB) &&
      _tokenOverlap(venueA, venueB) >= (aggressive ? 0.58 : 0.72)) return true;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
    const dist = geoDist(a.lat, a.lng, b.lat, b.lng);
    if (dist <= (aggressive ? 8 : 3)) {
      if (!cityA || !cityB || cityA === cityB) return true;
      if (venueA && venueB && _tokenOverlap(venueA, venueB) >= 0.45) return true;
    }
  }

  if (aggressive && cityA && cityB && cityA === cityB && sameCountry) {
    const eventOverlap = _tokenOverlap(a.eventName || a.venue, b.eventName || b.venue);
    if ((!venueA || !venueB || _tokenOverlap(venueA, venueB) >= 0.45) && eventOverlap >= 0.35) return true;
  }
  return false;
}
function _mergeConcertPair(a, b) {
  const primary = _concertScore(b) > _concertScore(a) ? b : a;
  const secondary = primary === a ? b : a;
  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    artist: primary.artist || secondary.artist,
    date: primary.date || secondary.date,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    state: primary.state || secondary.state || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    eventName: primary.eventName || secondary.eventName || '',
    isFest: !!(primary.isFest || secondary.isFest),
    _src: _uniqueCI([primary._src, secondary._src].filter(Boolean)).join('+'),
  };
}
function _deduplicateConcerts(list, aggressive) {
  const buckets = new Map();
  for (const c of list || []) {
    if (!c || !c.artist || !c.date) continue;
    const key = `${_normText(c.artist)}|${c.date}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...c });
  }

  const out = [];
  for (const group of buckets.values()) {
    group.sort((a, b) => _concertScore(b) - _concertScore(a));
    const merged = [];
    for (const c of group) {
      const dup = merged.find(m => _sameConcert(m, c, aggressive));
      if (!dup) merged.push(c);
      else Object.assign(dup, _mergeConcertPair(dup, c));
    }
    out.push(...merged);
  }
  return out.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    (a.artist || '').localeCompare(b.artist || '') ||
    (a.city || '').localeCompare(b.city || ''));
}

// ── visibleConcerts() ─────────────────────────────────────────────
// Central render-time filter for the concerts array.
// When showPossibleDupes is false (default), applies an aggressive third
// dedup pass on top of the two passes already baked into the array:
//   Key: artist|date|venue.slice(0,12)
// Any two entries sharing this key are treated as dupes — keep the one
// with a ticket URL, otherwise keep the first seen.
// This catches cases like "Ziggo Dome Hall A" vs "Ziggo Dome Club" that
// slip through the city-level second pass because the sub-venue names differ.
function visibleConcerts() {
  if (showPossibleDupes) return concerts;
  return _deduplicateConcerts(concerts, true);
}

function togglePossibleDupes() {
  showPossibleDupes = !showPossibleDupes;
  const btn = document.getElementById('dupes-toggle');
  if (btn) {
    btn.style.color         = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.borderColor   = showPossibleDupes ? 'var(--accent)' : '';
    btn.style.background    = showPossibleDupes ? 'rgba(200,255,95,.08)' : '';
    btn.title = showPossibleDupes
      ? 'Showing possible duplicate entries — click to hide them again'
      : 'Possible duplicate entries hidden — click to show';
  }
  buildCalChips(); renderCalendar(); renderMap();
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
function flag(code) { return COUNTRY_MAP[code]?.f || code; }
function fmtDate(d) { return d ? new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : ''; }
function fmtDateRange(f) {
  if (!f.endDate || f.endDate === f.date) return fmtDate(f.date);
  const s = new Date(f.date+'T12:00:00'), e = new Date(f.endDate+'T12:00:00');
  const sm = s.toLocaleDateString('en-US',{month:'short'}), em = e.toLocaleDateString('en-US',{month:'short'});
  const sd = s.getDate(), ed = e.getDate(), ey = e.getFullYear();
  if (sm === em) return sm+' '+sd+'–'+ed+', '+ey;  // Jun 26–28, 2026
  return sm+' '+sd+'–'+em+' '+ed+', '+ey;          // Jun 30–Jul 2, 2026
}

// ── CALENDAR GEO FILTER (region-based) ───────────────────────────
