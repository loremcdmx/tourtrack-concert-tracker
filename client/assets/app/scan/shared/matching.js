'use strict';

function _normDia(s) { return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function shiftIsoDate(iso, days) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function _normText(s) {
  return _normDia(s)
    .replace(/&/g, ' and ')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const _splitBillPartsCache = new Map();
function _splitBillParts(s) {
  const key = String(s || '');
  const cached = _splitBillPartsCache.get(key);
  if (cached) return cached;
  const out = _normText(key)
    .split(/\s*(?:,|\/|\+| x | with | feat\.?| ft\.?| and )\s*/i)
    .map(v => v.trim())
    .filter(Boolean);
  // Cap the cache to avoid unbounded growth if callers feed unique strings.
  if (_splitBillPartsCache.size >= 2048) _splitBillPartsCache.clear();
  _splitBillPartsCache.set(key, out);
  return out;
}
function _uniqueCI(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const label = String(item || '').trim();
    const key = _normText(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}
function _tokenOverlap(a, b) {
  const aa = new Set(_normText(a).split(' ').filter(w => w.length > 1));
  const bb = new Set(_normText(b).split(' ').filter(w => w.length > 1));
  if (!aa.size || !bb.size) return 0;
  let hits = 0;
  aa.forEach(w => { if (bb.has(w)) hits++; });
  return hits / Math.max(aa.size, bb.size);
}
function _wordBoundaryRe(s) {
  const esc = String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^a-z0-9])' + esc + '([^a-z0-9]|$)', 'i');
}
function _hasBoundaryMatch(needle, haystack) {
  if (!needle || !haystack) return false;
  return _wordBoundaryRe(needle).test(haystack);
}
function _artistAliases(name) {
  const base = _normText(name);
  const aliases = new Set(base ? [base] : []);
  if (base.startsWith('the ')) aliases.add(base.slice(4));
  if (typeof getArtistKnowledgeAliases === 'function') {
    for (const alias of getArtistKnowledgeAliases(name)) {
      const normAlias = _normText(alias);
      if (!normAlias) continue;
      aliases.add(normAlias);
      if (normAlias.startsWith('the ')) aliases.add(normAlias.slice(4));
    }
  }
  return [...aliases].filter(Boolean);
}

const FALSE_EVENT_CONTEXT_RE = /\b(experience|tribute|legacy|celebration|salute|story|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|after[- ]party|party|club night|dance night|dance party|brunch|burlesque|drag brunch|performed by|featuring the music of|music of|songs of|sounds of|inspired by|tribute to|vs\.?|meets|battle of|versus|plays the music of|best of)\b/i;
const FALSE_ATTRACTION_CONTEXT_RE = /\b(tribute|experience|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|party|night|brunch|burlesque|drag)\b/i;
const POSITIVE_EVENT_CONTEXT_RE = /\b(live|tour|concert|headline|headlining|special|acoustic|solo|residency|showcase|session|world tour|north american tour|european tour)\b/i;
const FEST_EVENT_RE = /\bfest(?:ival)?\b|open\s+air\b|weekender\b|lollapalooza|coachella|primavera\b|rock\s+(?:en|am|im|al)\b|pal\s+norte|vive\s+latino|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|rock\s+werchter|outside\s+lands|governors\s+ball|bonnaroo|austin\s+city|fuji\s+rock|summer\s+sonic|rolling\s+loud/i;
const FEST_VENUE_HINT_RE = /\b(park|grounds|field|fields|festival|open air|camping|weekender)\b/i;
const TICKET_TIER_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|pass(?:es)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/gi;
const TICKET_TIER_TEST_RE = /\b(vip|ga|general admission|weekend pass|day pass|single[- ]day|early bird|platinum|premium|package|parking|camping|hotel|shuttle|upgrade|fast lane|bundle|combo|presale|admission|entry|ticket(?:s)?|pass(?:es)?|3 day|2 day|three day|two day|domingo|sabado|viernes|sunday|saturday|friday|abono(?:s)?|boleto(?:s)?|pase(?:s)?|ascendente|full pass)\b/i;

const _EV_QUALIFIER = new Set([
  'live','tour','concert','feat','ft','with','at','in','the','a','an','and',
  'of','vol','part','edition','anniversary','special','acoustic','solo',
  'residency','headline','showcase','session','world','north','american',
  'european','farewell','finale','2023','2024','2025','2026','2027','2028'
]);

function _trimTicketWords(s) {
  return _normText(s).replace(TICKET_TIER_RE, ' ').replace(/\s+/g, ' ').trim();
}
function _venueCore(s) {
  return _trimTicketWords(s)
    .replace(/\b(official|tickets?|stage|hall|club|room)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _cityCore(s) {
  return _normText(s)
    .replace(/\b(city|metropolitan area)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _normalizedUrlKey(url) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.toLowerCase();
  } catch {
    return String(url || '').split('?')[0].toLowerCase();
  }
}
function _festivalBaseName(name) {
  return _trimTicketWords(name)
    .replace(/\b(20\d{2}|festival|music|weekender|weekend|day\s*\d+|day one|day two|day three|north|south|east|west|official|presented by)\b/g, ' ')
    .replace(/\b(friday|saturday|sunday|jueves|viernes|sabado|domingo)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function _knownFestivalNameFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const normRaw = _normText(raw);
  const baseRaw = _festivalBaseName(raw);
  let best = '';
  let bestScore = -Infinity;
  for (const festivalName of KNOWN_FESTIVALS || []) {
    const normFestival = _normText(festivalName);
    if (!normFestival) continue;
    const baseFestival = _festivalBaseName(festivalName);
    const matches =
      normRaw === normFestival ||
      normRaw.includes(normFestival) ||
      (!!baseRaw && !!baseFestival && baseRaw === baseFestival);
    if (!matches) continue;
    const score =
      normFestival.length +
      (normRaw === normFestival ? 24 : 0) +
      (baseRaw && baseFestival && baseRaw === baseFestival ? 12 : 0);
    if (score > bestScore) {
      best = festivalName;
      bestScore = score;
    }
  }
  return best;
}
function _titleCaseFestivalName(text) {
  return String(text || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, idx) => {
      if (/^(acl|edc|iii|m3f|nrmal|sxsw|ultra)$/i.test(word)) return word.toUpperCase();
      const lower = word.toLowerCase();
      if (idx > 0 && /^(a|an|and|at|by|da|de|del|do|dos|el|en|for|la|las|los|of|on|the|y)$/i.test(word)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}
function _canonicalFestivalName(candidates) {
  const list = _uniqueCI((Array.isArray(candidates) ? candidates : [candidates]).filter(Boolean));
  const firstKnown = list.length ? _knownFestivalNameFromText(list[0]) : '';
  if (firstKnown) return firstKnown;
  let bestLabel = '';
  let bestScore = -Infinity;
  list.forEach((candidate, idx) => {
    const raw = String(candidate || '').trim();
    if (!raw) return;
    const base = _festivalBaseName(raw);
    const normRaw = _normText(raw);
    const known = _knownFestivalNameFromText(raw);
    const cleanRaw = !TICKET_TIER_TEST_RE.test(raw);
    const keepRaw = cleanRaw && (!base || raw.length <= base.length + 8);
    const label = known || (keepRaw ? raw : (_titleCaseFestivalName(base) || raw));

    let score = Math.max(0, 40 - idx * 12);
    if (cleanRaw) score += 18;
    else score -= 18;
    if (FEST_EVENT_RE.test(normRaw)) score += 10;
    if (known) score += 18;
    if (idx === 0 && known) score += 40;
    if (known && _normText(known) === normRaw) score += 10;
    if (known && base && _festivalBaseName(known) === base) score += 24;
    if (base && _normText(base) === normRaw) score += 6;
    if (base && raw.length <= base.length + 8) score += 6;

    if (score > bestScore) {
      bestLabel = label;
      bestScore = score;
    }
  });
  return bestLabel || list[0] || '';
}
function _isFestivalSelfReference(candidate, festName) {
  const cand = _festivalBaseName(candidate);
  const fest = _festivalBaseName(festName);
  if (!cand || !fest) return false;
  if (cand === fest) return true;
  if (cand.length >= 4 && (fest.includes(cand) || cand.includes(fest))) return true;
  return _tokenOverlap(cand, fest) >= 0.75;
}
function _festivalLineupFromEvent(ev, displayName) {
  const festName = displayName || ev?.name || '';
  const raw = (ev?._embedded?.attractions || []).map(a => a.name).filter(Boolean);
  return _uniqueCI(raw
    .map(name => _trimTicketWords(name))
    .filter(name => {
      if (!name || name.length < 2) return false;
      if (FALSE_ATTRACTION_CONTEXT_RE.test(_normText(name))) return false;
      if (TICKET_TIER_TEST_RE.test(name)) return false;
      return !_isFestivalSelfReference(name, festName);
    }));
}
function isFestivalLikeEvent(ev) {
  const name = _normText(ev?.name || '');
  const venue = _normText(ev?._embedded?.venues?.[0]?.name || '');
  const lineup = _festivalLineupFromEvent(ev, ev?.name || '');
  const rawAttractions = ev?._embedded?.attractions || [];
  if (FEST_EVENT_RE.test(name)) return true;
  if (lineup.length >= 4 || rawAttractions.length >= 6) return true;
  if (lineup.length >= 2 && FEST_VENUE_HINT_RE.test(venue)) return true;
  return false;
}

function _isCleanEvNameMatch(alias, evName) {
  if (!_hasBoundaryMatch(alias, evName)) return false;
  const esc = String(alias || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(esc + '(.*)$', 'i').exec(evName);
  const after = m ? m[1].trim() : '';
  if (!after) return true;
  const fc = after[0];
  if (/[-:,.(\[!?/]/.test(fc)) return true;
  if (/[0-9]/.test(fc)) {
    const num = parseInt(after, 10);
    return num >= 2020 && num <= 2035;
  }
  if (!/^[a-z]/i.test(fc)) return true;
  const w = after.split(/[\s\-:,.!?()[\]\/]+/)[0].toLowerCase();
  return _EV_QUALIFIER.has(w);
}
// Core matcher driven by pre-computed inputs. Callers that iterate the same
// (artist × lineup) grid — e.g. scoreFestivals across 400 artists × 20 lineup
// entries per festival — can compute each side's aliases / target / parts
// once and hand them in, avoiding O(A × L) repeated normalization.
function _attractionMatchesArtistFast(aliases, target, parts) {
  if (!target) return false;
  for (const alias of aliases) {
    if (!alias) continue;
    if (target === alias) return true;
    let hit = false;
    for (const part of parts) {
      if (part === alias) { hit = true; break; }
      if (!_hasBoundaryMatch(alias, part)) continue;
      const remainder = part.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) continue;
      if (_tokenOverlap(alias, part) >= 0.7) { hit = true; break; }
    }
    if (hit) return true;
    if (_hasBoundaryMatch(alias, target)) {
      const remainder = target.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
      if (remainder && FALSE_ATTRACTION_CONTEXT_RE.test(remainder)) continue;
      if (_tokenOverlap(alias, target) >= 0.7) return true;
    }
  }
  return false;
}

function _attractionMatchesArtist(artist, attractionName) {
  const target = _normText(attractionName);
  if (!target) return false;
  const parts = _splitBillParts(attractionName);
  return _attractionMatchesArtistFast(_artistAliases(artist), target, parts);
}
function _eventNameLooksLikeArtistShow(artist, evName) {
  const norm = _normText(evName);
  if (!norm) return false;
  return _artistAliases(artist).some(alias => {
    if (!_isCleanEvNameMatch(alias, norm)) return false;
    const stripped = norm.replace(_wordBoundaryRe(alias), ' ').replace(/\s+/g, ' ').trim();
    if (stripped && FALSE_EVENT_CONTEXT_RE.test(stripped)) return false;
    if (!stripped) return true;
    if (POSITIVE_EVENT_CONTEXT_RE.test(stripped)) return true;
    const words = stripped.split(/\s+/).filter(Boolean);
    return words.length <= 2 && words.every(w => _EV_QUALIFIER.has(w) || /^\d{4}$/.test(w));
  });
}

function _festivalConcertBridge(f, c) {
  if (!f || !c || !f.date || !c.date || !c.artist) return false;
  const from = shiftIsoDate(f.date, -1);
  const to = f.endDate || f.date;
  if (c.date < from || c.date > to) return false;

  const festVenue = _venueCore(f.venue || '');
  const showVenue = _venueCore(c.venue || '');
  const festCity = _cityCore(f.city || '');
  const showCity = _cityCore(c.city || '');
  const sameCountry = !(f.country && c.country) || f.country === c.country;

  if (f.lat != null && f.lng != null && c.lat != null && c.lng != null) {
    const dist = geoDist(f.lat, f.lng, c.lat, c.lng);
    if (dist <= 6) return true;
    if (dist <= 12 && festVenue && showVenue && _tokenOverlap(festVenue, showVenue) >= 0.45) return true;
  }
  if (festVenue && showVenue && (festVenue === showVenue || _tokenOverlap(festVenue, showVenue) >= 0.72)) {
    return sameCountry;
  }
  if (festCity && showCity && festCity === showCity && sameCountry && c.isFest) return true;
  return false;
}
function _festivalLinkedConcerts(f, sourceList = concerts) {
  return (sourceList || []).filter(c => _festivalConcertBridge(f, c));
}
function _resolvedFestivalLineup(f) {
  return _uniqueCI([...(f.lineup || []), ..._festivalLinkedConcerts(f).map(c => c.artist)]);
}
function _lineupArtistHit(artist, lineup) {
  return (lineup || []).some(name => _attractionMatchesArtist(artist, name));
}
function shouldGroupAsVenueFestival(group) {
  const artists = _uniqueCI((group || []).map(c => c.artist));
  if (artists.length < 3) return false;
  const withCoords = (group || []).filter(c => c.lat != null && c.lng != null);
  if (withCoords.length >= 2) {
    const anchor = withCoords[0];
    if (withCoords.some(c => geoDist(anchor.lat, anchor.lng, c.lat, c.lng) > 8)) return false;
  }
  const venue = _venueCore(group?.[0]?.venue || '');
  const city = _cityCore(group?.[0]?.city || '');
  const venueName = _normText(group?.[0]?.venue || '');
  const festSignals = (group || []).some(c => c.isFest) || FEST_VENUE_HINT_RE.test(venueName) || artists.length >= 4;
  return !!(venue || city) && festSignals;
}
