'use strict';

const FEST_NON_MUSIC_RE = /\b(seafood|food|beer|wine|chili|bbq|barbeque|barbecue|taco|burger|whiskey|whisky|vodka|rum|sake|craft\s*beer|oktoberfest|brew\s*fest|film\s*fest|film\s*festival|movie\s*fest|cinema\s*fest|comedy\s*fest|comedy\s*festival|stand[- ]?up\s*fest|theatre\s*fest|theater\s*fest|play\s*fest|improv\s*fest|art\s*fest(?!ival.*music)|arts\s*fest(?!.*music)|ballet\s*fest|dance\s*fest(?!.*music)|fishing\s*fest|fly\s*fish|hunting\s*fest|car\s*fest|auto\s*fest|motor\s*fest|boat\s*fest|air\s*show|balloon\s*fest|kite\s*fest|chess\s*fest|comic\s*(?:con|fest)|gaming\s*fest|esport|sports?\s*fest|soccer|hockey|baseball|basketball|football|rugby|tennis|golf\s*(?:open|classic|tournament)|yoga\s*fest|cannabis\s*fest|weed\s*fest|420\s*fest|psychedelic\s*(?:conference|summit)|haunted|halloween\s*(?:horror|haunt)|renaissance\s*faire|medieval\s*fest|pirate\s*fest|cowboy\s*fest|rodeo\s*fest|parade|marathon\s*(?:event|race)|triathlon|5k\s*(?:run|race)|dog\s*show|cat\s*show|flower\s*show|garden\s*fest|harvest\s*fest(?!.*music)|pumpkin\s*fest|strawberry\s*fest|cherry\s*fest|peach\s*fest|apple\s*fest|garlic\s*fest|lobster\s*fest|oyster\s*fest|shrimp\s*fest|pizza\s*fest|ice\s*cream\s*fest|chocolate\s*fest|vs\s+\w|\w+\s+vs\b)\b/i;
const FEST_GENERIC_NON_MUSIC_RE = /\b(indoor\s+(?:ski|swim|sport)|aquatic|swimming|rowing|cycling\s+tour|horse\s+(?:show|race)|polo|lacrosse|wrestling|boxing\s+(?:event|show|card)|mma\s+(?:event|card)|ufc|bellator|cage|fight\s+(?:night|card)|concert\s+series\s+(?:ticket|pass))\b/i;
const FEST_NAME_RE = /\bfest(?:ival)?\b|open\s+air\b|music\s+week\b|corona\s+capital|vans\s+warped|pa(?:l)?\s+norte|lollapalooza|coachella|primavera\b|vive\s+latino|tecate\b|estereo\s+picnic|rock\s+(?:en|am|im|al|in\s+the)\b|rock\s+al\s+parque|afropunk|creamfields|tomorrowland|ultra\s+(?:music|miami|europe)|electric\s+daisy|day\s+\d\b|weekend\s+\d\b|day\s+one\b|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|nos\s+primavera|rock\s+werchter|flow\s+festival|way\s+out\s+west|parklife|latitude\b|wireless\b|field\s+day|all\s+points\s+east|burning\s+man|outside\s+lands|governors\s+ball|bonnaroo|acl\b|austin\s+city|splendour|fuji\s+rock|summer\s+sonic|bahidora|nrmal|bpm\s+festival|coordenada|cosquin\s+rock|rolling\s+loud|head\s+in\s+the\s+clouds|warped\s+tour/i;
const FEST_HINT_STOPWORDS = new Set(['festival', 'music', 'arts', 'the', 'and', 'de', 'la', 'el']);

function buildFestivalGeoTargets() {
  if (countryMode === 'world') return [''];
  if (countryMode === 'include' && includeCountries.size > 0) {
    return [...includeCountries].map(code => `&countryCode=${code}`);
  }
  return [''];
}

function buildAlwaysSweepFestivalCountries() {
  return ['US', 'MX', 'AR', 'BR', 'CL', 'CO', 'CA', 'AU', 'JP']
    .filter(code => !includeCountries.has(code) && countryMode !== 'world');
}

function festivalGeoTargetCount(targets) {
  return (targets || []).filter(Boolean).length || 'worldwide';
}

function festivalHintWords(hint) {
  return _normText(hint || '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !FEST_HINT_STOPWORDS.has(word));
}

function pickFestivalImage(ev) {
  const images = ev?.images || [];
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted.find(image => image.ratio === '16_9' && image.width >= 640) ||
    sorted.find(image => image.ratio === '16_9') ||
    sorted[0] ||
    null;
}

function isMusicFestivalEvent(ev, hint) {
  const cls = ev?.classifications?.[0];
  const segment = _normText(cls?.segment?.name || '');
  const normalizedName = _normText(ev?.name || '');
  const hints = festivalHintWords(hint);
  const hintHits = hints.filter(word => normalizedName.includes(word)).length;
  const hintMatch = hints.length > 0 && hintHits >= Math.ceil(hints.length * 0.5);

  if (segment && segment !== 'music') return { accepted: false, hintMatch };
  if (FEST_NON_MUSIC_RE.test(normalizedName) || FEST_GENERIC_NON_MUSIC_RE.test(normalizedName)) {
    return { accepted: false, hintMatch };
  }
  const isFestName = FEST_NAME_RE.test(normalizedName) || isFestivalLikeEvent(ev);
  return { accepted: isFestName || hintMatch, hintMatch };
}

function buildFestivalRecordFromEvent(ev, hint) {
  const date = ev?.dates?.start?.localDate;
  if (!date) return null;

  const venue = ev?._embedded?.venues?.[0];
  const lat = parseFloat(venue?.location?.latitude);
  const lng = parseFloat(venue?.location?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const { accepted, hintMatch } = isMusicFestivalEvent(ev, hint);
  if (!accepted) return null;

  const displayName = _canonicalFestivalName([
    hint && hintMatch ? hint : '',
    ev?.name || '',
    hint || '',
  ]) || (ev?.name || hint || 'Festival');
  const image = pickFestivalImage(ev);

  return {
    id: ev.id,
    name: displayName,
    rawName: ev?.name || displayName,
    date,
    venue: venue?.name || '',
    city: venue?.city?.name || '',
    country: venue?.country?.countryCode || '',
    lat,
    lng,
    url: ev?.url || '',
    lineup: _festivalLineupFromEvent(ev, displayName),
    imageUrl: image?.url || '',
    sourceHints: _uniqueCI([hint, ev?.name].filter(Boolean)),
  };
}

function ingestFestEvents(events, hint) {
  for (const ev of events || []) {
    const record = buildFestivalRecordFromEvent(ev, hint);
    if (!record) continue;
    festivals.push(record);
  }
}
