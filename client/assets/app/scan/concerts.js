'use strict';

function deduplicateConcerts(list) {
  return deduplicateConcertRecords(list, false);
}

function _concertScore(c) {
  return concertQualityScore(c);
}
function _sameConcert(a, b, aggressive) {
  return concertsLikelySame(a, b, { aggressive });
}
function _mergeConcertPair(a, b) {
  return mergeConcertRecords(a, b);
}
function _deduplicateConcerts(list, aggressive) {
  return deduplicateConcertRecords(list, aggressive);
}

let _visibleConcertsCacheList = null;
let _visibleConcertsCacheLength = -1;
let _visibleConcertsCacheFirst = null;
let _visibleConcertsCacheLast = null;
let _visibleConcertsCacheArtistSignature = '';
let _visibleConcertsCacheShowDupes = null;
let _visibleConcertsCache = [];

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
  const list = concerts;
  const len = list.length;
  const first = len ? list[0] : null;
  const last = len ? list[len - 1] : null;
  const artistSignature = isScenarioAProductMode()
    ? (Array.isArray(ARTISTS) ? ARTISTS.map(name => String(name || '')).join('\u0001') : '')
    : '';
  if (
    _visibleConcertsCacheList === list &&
    _visibleConcertsCacheLength === len &&
    _visibleConcertsCacheFirst === first &&
    _visibleConcertsCacheLast === last &&
    _visibleConcertsCacheArtistSignature === artistSignature &&
    _visibleConcertsCacheShowDupes === showPossibleDupes
  ) {
    return _visibleConcertsCache;
  }
  const base = showPossibleDupes ? list : deduplicateConcertRecords(list, true);
  _visibleConcertsCache = isScenarioAProductMode()
    ? base.filter(item => scenarioArtistAllowed(item?.artist))
    : base;
  _visibleConcertsCacheList = list;
  _visibleConcertsCacheLength = len;
  _visibleConcertsCacheFirst = first;
  _visibleConcertsCacheLast = last;
  _visibleConcertsCacheArtistSignature = artistSignature;
  _visibleConcertsCacheShowDupes = showPossibleDupes;
  return _visibleConcertsCache;
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
