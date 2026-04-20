'use strict';

function festCore(name) {
  return _festivalBaseName(name);
}

function _festivalNameScore(name) {
  const raw = _normText(name);
  const base = festCore(name);
  return (base ? 20 - Math.min(base.length, 20) : 0)
    + (FEST_EVENT_RE.test(raw) ? 6 : 0)
    - (TICKET_TIER_TEST_RE.test(name || '') ? 18 : 0)
    - (/\b(ticket|parking|camping|hotel|upgrade|bundle)\b/i.test(raw) ? 14 : 0);
}

function _sameFestival(a, b) {
  const coreA = festCore(a?.name || a?.rawName || '');
  const coreB = festCore(b?.name || b?.rawName || '');
  if (!coreA || !coreB) return false;
  if (coreA !== coreB && _tokenOverlap(coreA, coreB) < 0.65) return false;

  const diffDays = Math.abs(
    (new Date((a?.date || '') + 'T12:00:00') - new Date((b?.date || '') + 'T12:00:00')) / 86400000
  );
  if (diffDays > 7) return false;

  const venueA = _venueCore(a?.venue || '');
  const venueB = _venueCore(b?.venue || '');
  const cityA = _cityCore(a?.city || '');
  const cityB = _cityCore(b?.city || '');
  const sameCountry = !(a?.country && b?.country) || a.country === b.country;

  if (a?.lat != null && a?.lng != null && b?.lat != null && b?.lng != null && sameCountry && geoDist(a.lat, a.lng, b.lat, b.lng) <= 12) {
    return true;
  }
  if (venueA && venueB && (venueA === venueB || _tokenOverlap(venueA, venueB) >= 0.72)) return sameCountry;
  if (cityA && cityB && cityA === cityB && sameCountry) return true;
  return false;
}

function _mergeFestivalPair(a, b) {
  const primary = _festivalNameScore(b?.name || '') > _festivalNameScore(a?.name || '') ? b : a;
  const secondary = primary === a ? b : a;
  const startDate = [a?.date, b?.date].filter(Boolean).sort()[0] || a?.date || b?.date;
  const endDate = [a?.endDate || a?.date, b?.endDate || b?.date].filter(Boolean).sort().slice(-1)[0] || startDate;

  return {
    ...secondary,
    ...primary,
    id: primary.id || secondary.id,
    name: primary.name || secondary.name,
    rawName: primary.rawName || secondary.rawName || primary.name || secondary.name,
    date: startDate,
    endDate: endDate !== startDate ? endDate : undefined,
    venue: (_venueCore(primary.venue).length >= _venueCore(secondary.venue).length ? primary.venue : secondary.venue) || primary.venue || secondary.venue || '',
    city: primary.city || secondary.city || '',
    country: primary.country || secondary.country || '',
    lat: primary.lat != null ? primary.lat : secondary.lat,
    lng: primary.lng != null ? primary.lng : secondary.lng,
    url: primary.url || secondary.url || '',
    imageUrl: primary.imageUrl || secondary.imageUrl || '',
    lineup: _uniqueCI([...(a?.lineup || []), ...(b?.lineup || [])]),
    sourceHints: _uniqueCI([...(a?.sourceHints || []), ...(b?.sourceHints || []), a?.rawName, b?.rawName].filter(Boolean)),
  };
}

function deduplicateFestivals(list) {
  const sorted = (list || [])
    .filter(festival => festival && festival.date)
    .map(festival => ({ ...festival, lineup: _uniqueCI(festival.lineup || []) }))
    .sort((a, b) =>
      (a.date || '').localeCompare(b.date || '') ||
      festCore(a.name || a.rawName || '').localeCompare(festCore(b.name || b.rawName || '')));

  const merged = [];
  for (const festival of sorted) {
    const dup = merged.find(existing =>
      (festival.id && existing.id && festival.id === existing.id) || _sameFestival(existing, festival));
    if (!dup) merged.push({ ...festival });
    else Object.assign(dup, _mergeFestivalPair(dup, festival));
  }

  return merged.map(festival => {
    if (festival.endDate && festival.endDate < festival.date) festival.endDate = festival.date;
    if (festival.endDate === festival.date) delete festival.endDate;
    festival.lineup = _uniqueCI(festival.lineup || []);
    festival.sourceHints = _uniqueCI(festival.sourceHints || []);
    festival.name = _canonicalFestivalName([
      festival.rawName,
      ...(festival.sourceHints || []),
      festival.name,
    ]) || festival.name || festival.rawName || 'Festival';
    return festival;
  });
}

function normalizeFestivalLabels(list) {
  return (list || []).map(festival => {
    if (!festival || typeof festival !== 'object') return festival;
    const next = { ...festival };
    next.lineup = _uniqueCI(next.lineup || []);
    next.sourceHints = _uniqueCI(next.sourceHints || []);
    next.name = _canonicalFestivalName([
      next.rawName,
      ...(next.sourceHints || []),
      next.name,
    ]) || next.name || next.rawName || 'Festival';
    return next;
  });
}
