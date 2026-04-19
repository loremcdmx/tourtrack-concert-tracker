'use strict';

function _coordOrNull(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getTicketmasterVenue(ev) {
  return ev?._embedded?.venues?.[0] || null;
}

function inferFestivalFlagFromConcertName(eventName, venueName) {
  const name = _normText(eventName || '');
  const venue = _normText(venueName || '');
  if (!name && !venue) return false;
  if (FEST_EVENT_RE.test(name)) return true;
  if (FEST_VENUE_HINT_RE.test(venue) && /\b(fest|festival|open air|weekender)\b/i.test(name)) return true;
  return false;
}

function buildConcertFromTicketmasterEvent(artist, ev, source = 'tm', fallback = {}) {
  const date = ev?.dates?.start?.localDate;
  if (!artist || !date) return null;

  const venue = getTicketmasterVenue(ev);
  return {
    id: ev.id,
    artist,
    date,
    venue: venue?.name || '',
    city: venue?.city?.name || '',
    country: venue?.country?.countryCode || fallback.country || '',
    state: venue?.state?.stateCode || fallback.state || '',
    lat: _coordOrNull(venue?.location?.latitude),
    lng: _coordOrNull(venue?.location?.longitude),
    url: ev?.url || '',
    eventName: ev?.name || '',
    _src: source,
    isFest: isFestivalLikeEvent(ev),
  };
}

function buildConcertFromBandsintownEvent(artist, ev, today) {
  const date = ev?.datetime?.split('T')[0];
  if (!artist || !date || (today && date < today)) return null;

  const venue = ev?.venue || {};
  const eventName = ev?.title || ev?.description || '';
  return {
    id: `bit_${ev.id}`,
    artist,
    date,
    venue: venue.name || '',
    city: venue.city || '',
    country: (venue.country || '').slice(0, 2).toUpperCase() || '',
    state: venue.region || '',
    lat: _coordOrNull(venue.latitude),
    lng: _coordOrNull(venue.longitude),
    url: ev?.url || '',
    eventName,
    _src: 'bit',
    isFest: inferFestivalFlagFromConcertName(eventName, venue.name || ''),
  };
}

function normalizeConcertRecord(c) {
  return {
    artistKey: _normText(c?.artist || ''),
    venueKey: _venueCore(c?.venue || ''),
    cityKey: _cityCore(c?.city || ''),
    countryKey: String(c?.country || '').trim().toUpperCase(),
    urlKey: _normalizedUrlKey(c?.url || ''),
    eventKey: _normText(c?.eventName || ''),
  };
}

function concertQualityScore(c) {
  const norm = normalizeConcertRecord(c);
  return (c?.url ? 6 : 0)
    + (c?.lat != null && c?.lng != null ? 4 : 0)
    + (norm.venueKey.length ? 3 : 0)
    + (norm.cityKey.length ? 2 : 0)
    + (norm.urlKey.length ? 1 : 0)
    + ((c?.eventName || '').length > (c?.artist || '').length ? 1 : 0)
    + (c?.isFest ? 1 : 0);
}

function concertsLikelySame(a, b, opts = {}) {
  const aggressive = !!opts.aggressive;
  const left = normalizeConcertRecord(a);
  const right = normalizeConcertRecord(b);
  if (!left.artistKey || left.artistKey !== right.artistKey || a?.date !== b?.date) return false;

  if (left.urlKey && right.urlKey && left.urlKey === right.urlKey) return true;
  if (a?.id && b?.id && a.id === b.id) return true;

  const sameCountry = !(left.countryKey && right.countryKey) || left.countryKey === right.countryKey;
  if (left.venueKey && right.venueKey && left.venueKey === right.venueKey &&
      (!left.cityKey || !right.cityKey || left.cityKey === right.cityKey) &&
      sameCountry) {
    return true;
  }
  if (left.venueKey && right.venueKey && sameCountry &&
      (!left.cityKey || !right.cityKey || left.cityKey === right.cityKey) &&
      _tokenOverlap(left.venueKey, right.venueKey) >= (aggressive ? 0.58 : 0.72)) {
    return true;
  }

  if (a?.lat != null && a?.lng != null && b?.lat != null && b?.lng != null) {
    const dist = geoDist(a.lat, a.lng, b.lat, b.lng);
    if (dist <= (aggressive ? 8 : 3)) {
      if (!left.cityKey || !right.cityKey || left.cityKey === right.cityKey) return true;
      if (left.venueKey && right.venueKey && _tokenOverlap(left.venueKey, right.venueKey) >= 0.45) return true;
    }
  }

  if (aggressive && left.cityKey && right.cityKey && left.cityKey === right.cityKey && sameCountry) {
    const eventOverlap = _tokenOverlap(left.eventKey || left.venueKey, right.eventKey || right.venueKey);
    if ((!left.venueKey || !right.venueKey || _tokenOverlap(left.venueKey, right.venueKey) >= 0.45) && eventOverlap >= 0.35) {
      return true;
    }
  }
  return false;
}

function mergeConcertRecords(a, b) {
  const primary = concertQualityScore(b) > concertQualityScore(a) ? b : a;
  const secondary = primary === a ? b : a;
  const primaryNorm = normalizeConcertRecord(primary);
  const secondaryNorm = normalizeConcertRecord(secondary);

  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    artist: primary.artist || secondary.artist,
    date: primary.date || secondary.date,
    venue: (primaryNorm.venueKey.length >= secondaryNorm.venueKey.length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
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

function deduplicateConcertRecords(list, aggressive = false) {
  const buckets = new Map();
  for (const concert of list || []) {
    const norm = normalizeConcertRecord(concert);
    if (!concert || !norm.artistKey || !concert.date) continue;
    const key = `${norm.artistKey}|${concert.date}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...concert });
  }

  const out = [];
  for (const group of buckets.values()) {
    group.sort((a, b) => concertQualityScore(b) - concertQualityScore(a));
    const merged = [];
    for (const concert of group) {
      const dup = merged.find(existing => concertsLikelySame(existing, concert, { aggressive }));
      if (!dup) merged.push(concert);
      else Object.assign(dup, mergeConcertRecords(dup, concert));
    }
    out.push(...merged);
  }

  return out.sort((a, b) =>
    (a.date || '').localeCompare(b.date || '') ||
    (a.artist || '').localeCompare(b.artist || '') ||
    (a.city || '').localeCompare(b.city || ''));
}
