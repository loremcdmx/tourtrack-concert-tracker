'use strict';

async function fetchFestivalsData() {
  const today = new Date().toISOString().split('T')[0];

  // ── Pass 1: User geo-aware sweep (covers whatever countries the user has selected) ──
  const geoTargets = (() => {
    if (countryMode === 'world') return ['']; // worldwide — no country param
    if (countryMode === 'include' && includeCountries.size > 0) {
      return [...includeCountries].map(cc => `&countryCode=${cc}`);
    }
    return [''];  // exclude mode: fetch globally, calendar geo-filter handles display
  })();

  const batches = [];
  for (let i = 0; i < geoTargets.length; i += 5) batches.push(geoTargets.slice(i, i + 5));

  let pagesDone = 0;
  for (const batch of batches) {
    if (scanAborted) break;
    for (const geo of batch) {
      if (scanAborted) break;
      for (let page = 0; page < 3; page++) {
        if (scanAborted) break;
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc${geo}&startDateTime=${today}T00:00:00Z`;
        try {
          const r = await apiFetch(url); if (!r.ok) break;
          const d = await r.json();
          const evs = d?._embedded?.events || [];
          if (!evs.length) break;
          ingestFestEvents(evs, null);
          pagesDone++;
          setProgress(`Festivals: user-geo sweep ${pagesDone} pages · ${festivals.length} found`, 87);
        } catch(e) { break; }
        await sleep(150);
      }
    }
  }

  // ── Pass 1b: Hardcoded western hemisphere + key global markets sweep ──
  // ALWAYS runs regardless of user geo settings — these regions have major festivals
  // that users want even when their concert filter is EU-only.
  const ALWAYS_SWEEP = ['US','MX','AR','BR','CL','CO','CA','AU','JP'].filter(
    cc => !includeCountries.has(cc) && countryMode !== 'world' // skip if already covered
  );
  for (const cc of ALWAYS_SWEEP) {
    if (scanAborted) break;
    for (let page = 0; page < 2; page++) {
      if (scanAborted) break;
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=festival&classificationName=music&size=100&page=${page}&sort=date,asc&countryCode=${cc}&startDateTime=${today}T00:00:00Z`;
      try {
        const r = await apiFetch(url); if (!r.ok) break;
        const d = await r.json();
        const evs = d?._embedded?.events || [];
        if (!evs.length) break;
        ingestFestEvents(evs, null);
        pagesDone++;
        setProgress(`Festivals: global sweep ${cc} · ${festivals.length} found`, 89);
      } catch(e) { break; }
      await sleep(150);
    }
  }

  // ── Pass 2: KNOWN_FESTIVALS by exact name — worldwide, no geo filter ──
  // size=50 so we get the actual festival event not just parking/addon tickets
  for (let i = 0; i < KNOWN_FESTIVALS.length; i++) {
    if (scanAborted) break;
    const name = KNOWN_FESTIVALS[i];
    if (i % 10 === 0) setProgress(`Festivals: named lookup ${i+1}/${KNOWN_FESTIVALS.length} · ${festivals.length} found`, 91);
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}&size=50&sort=date,asc&startDateTime=${today}T00:00:00Z`;
      const r = await apiFetch(url); if (!r.ok) continue;
      const d = await r.json();
      ingestFestEvents(d?._embedded?.events || [], name);
    } catch(e) {}
    await sleep(80);
  }

  festivals = deduplicateFestivals(festivals);
  scoreFestivals();
  dblog('info', `Festivals: ${festivals.length} after dedup (geo: ${geo_targets_count(geoTargets)}, always-sweep: ${ALWAYS_SWEEP.join(',')}, named: ${KNOWN_FESTIVALS.length})`);
}

function geo_targets_count(arr) { return arr.filter(s=>s).length || 'worldwide'; }


function ingestFestEvents(evs, hint) {
  // ── Music classification check ────────────────────────────────
  // TM events carry segment/genre classification. We want Music only.
  // If classification data exists and segment is NOT Music → skip.
  const isMusicEvent = (ev) => {
    const cls = ev.classifications?.[0];
    if (!cls) return true; // no classification data — allow (better safe than sorry)
    const seg = (cls.segment?.name || '').toLowerCase();
    if (seg && seg !== 'music') return false; // definitely not music
    return true;
  };

  // ── Blocklist: non-music events whose names contain "festival" ──
  // These slip through because "festival" is in the name, but they're
  // sports, food, film, theatre, comedy, fishing, etc.
  const NON_MUSIC_RE = /\b(seafood|food|beer|wine|chili|bbq|barbeque|barbecue|taco|burger|whiskey|whisky|vodka|rum|sake|craft\s*beer|oktoberfest|brew\s*fest|film\s*fest|film\s*festival|movie\s*fest|cinema\s*fest|comedy\s*fest|comedy\s*festival|stand[- ]?up\s*fest|theatre\s*fest|theater\s*fest|play\s*fest|improv\s*fest|art\s*fest(?!ival.*music)|arts\s*fest(?!.*music)|ballet\s*fest|dance\s*fest(?!.*music)|fishing\s*fest|fly\s*fish|hunting\s*fest|car\s*fest|auto\s*fest|motor\s*fest|boat\s*fest|air\s*show|balloon\s*fest|kite\s*fest|chess\s*fest|comic\s*(?:con|fest)|gaming\s*fest|esport|sports?\s*fest|soccer|hockey|baseball|basketball|football|rugby|tennis|golf\s*(?:open|classic|tournament)|yoga\s*fest|cannabis\s*fest|weed\s*fest|420\s*fest|psychedelic\s*(?:conference|summit)|haunted|halloween\s*(?:horror|haunt)|renaissance\s*faire|medieval\s*fest|pirate\s*fest|cowboy\s*fest|rodeo\s*fest|parade|marathon\s*(?:event|race)|triathlon|5k\s*(?:run|race)|dog\s*show|cat\s*show|flower\s*show|garden\s*fest|harvest\s*fest(?!.*music)|pumpkin\s*fest|strawberry\s*fest|cherry\s*fest|peach\s*fest|apple\s*fest|garlic\s*fest|lobster\s*fest|oyster\s*fest|shrimp\s*fest|pizza\s*fest|ice\s*cream\s*fest|chocolate\s*fest|vs\s+\w|\w+\s+vs\b)\b/i;

  // Names that generically say "festival" but are definitely not music concerts
  const GENERIC_NON_MUSIC = /\b(indoor\s+(?:ski|swim|sport)|aquatic|swimming|rowing|cycling\s+tour|horse\s+(?:show|race)|polo|lacrosse|wrestling|boxing\s+(?:event|show|card)|mma\s+(?:event|card)|ufc|bellator|cage|fight\s+(?:night|card)|concert\s+series\s+(?:ticket|pass))\b/i;

  // Broad patterns — but now gated by music classification check above
  const FEST_NAME_RE = /\bfest(ival)?\b|open\s+air\b|music\s+week\b|corona\s+capital|vans\s+warped|pa['''`]?l\s+norte|pal\s+norte|lollapalooza|coachella|primavera\b|vive\s+latino|tecate\b|estéreo\s+picnic|stereo\s+picnic|rock\s+(en|am|im|al|in\s+the)\b|rock\s+al\s+parque|afropunk|creamfields|tomorrowland|ultra\s+(music|miami|europe)|electric\s+daisy|day\s+\d\b|weekend\s+\d\b|day\s+one\b|summerfest|glastonbury|reading\b|leeds\b|download\b|roskilde|sziget|pukkelpop|lowlands|pinkpop|nos\s+alive|nos\s+primavera|rock\s+werchter|flow\s+festival|way\s+out\s+west|parklife|latitude\b|wireless\b|field\s+day|all\s+points\s+east|burning\s+man|outside\s+lands|governors\s+ball|bonnaroo|acl\b|austin\s+city|splendour|fuji\s+rock|summer\s+sonic|bahidora|nrmal|bpm\s+festival|coordenada|cosquin\s+rock|rolling\s+loud|head\s+in\s+the\s+clouds|warped\s+tour/i;

  // Hint words — significant words from the festival name we searched for
  const hintWords = hint
    ? hint.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !/^(festival|music|arts|the|and|de|la|el)$/i.test(w))
    : [];

  for (const ev of evs) {
    const date = ev.dates?.start?.localDate; if (!date) continue;
    const v = ev._embedded?.venues?.[0];
    const lat = parseFloat(v?.location?.latitude), lng = parseFloat(v?.location?.longitude);
    if (isNaN(lat) || isNaN(lng)) continue;
    const cc = v?.country?.countryCode || '';
    const nameL = (ev.name || '').toLowerCase();

    if (!isMusicEvent(ev)) continue;
    if (NON_MUSIC_RE.test(nameL) || GENERIC_NON_MUSIC.test(nameL)) continue;

    const isFestName = FEST_NAME_RE.test(nameL) || isFestivalLikeEvent(ev);
    const hintMatch = hintWords.length > 0 &&
      hintWords.filter(w => nameL.includes(w)).length >= Math.ceil(hintWords.length * 0.5);
    if (!isFestName && !hintMatch) continue;

    const displayName = (hint && hintMatch && hint.length <= (ev.name || '').length) ? hint : (ev.name || hint || 'Festival');
    const lineup = _festivalLineupFromEvent(ev, displayName);

    const imgs = ev.images || [];
    const img16x9 = imgs.find(i => i.ratio === '16_9' && i.width >= 640) ||
                    imgs.find(i => i.ratio === '16_9') ||
                    imgs.sort((a,b) => (b.width||0)-(a.width||0))[0];
    const imageUrl = img16x9?.url || '';

    festivals.push({
      id: ev.id,
      name: displayName,
      rawName: ev.name || displayName,
      date,
      venue: v?.name || '',
      city: v?.city?.name || '',
      country: cc,
      lat, lng,
      url: ev.url,
      lineup,
      imageUrl,
      sourceHints: _uniqueCI([hint, ev.name].filter(Boolean)),
    });
  }
}

function deduplicateFestivals(list) {
  const sorted = (list || [])
    .filter(f => f && f.date)
    .map(f => ({ ...f, lineup: _uniqueCI(f.lineup || []) }))
    .sort((a, b) =>
      (a.date || '').localeCompare(b.date || '') ||
      festCore(a.name || a.rawName || '').localeCompare(festCore(b.name || b.rawName || '')));

  const merged = [];
  for (const f of sorted) {
    const dup = merged.find(m =>
      (f.id && m.id && f.id === m.id) || _sameFestival(m, f));
    if (!dup) merged.push({ ...f });
    else Object.assign(dup, _mergeFestivalPair(dup, f));
  }
  return merged.map(f => {
    if (f.endDate && f.endDate < f.date) f.endDate = f.date;
    if (f.endDate === f.date) delete f.endDate;
    f.lineup = _uniqueCI(f.lineup || []);
    f.sourceHints = _uniqueCI(f.sourceHints || []);
    return f;
  });
}

function festCore(name) {
  return _festivalBaseName(name);
}

function geoDist(lat1, lng1, lat2, lng2) {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
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
  const coreA = festCore(a.name || a.rawName || '');
  const coreB = festCore(b.name || b.rawName || '');
  if (!coreA || !coreB) return false;
  if (coreA !== coreB && _tokenOverlap(coreA, coreB) < 0.65) return false;

  const diffDays = Math.abs((new Date((a.date || '') + 'T12:00:00') - new Date((b.date || '') + 'T12:00:00')) / 86400000);
  if (diffDays > 7) return false;

  const venueA = _venueCore(a.venue || '');
  const venueB = _venueCore(b.venue || '');
  const cityA = _cityCore(a.city || '');
  const cityB = _cityCore(b.city || '');
  const sameCountry = !(a.country && b.country) || a.country === b.country;

  if (a.lat != null && a.lng != null && b.lat != null && b.lng != null && geoDist(a.lat, a.lng, b.lat, b.lng) <= 12) return true;
  if (venueA && venueB && (venueA === venueB || _tokenOverlap(venueA, venueB) >= 0.72)) return sameCountry;
  if (cityA && cityB && cityA === cityB && sameCountry) return true;
  return false;
}
function _mergeFestivalPair(a, b) {
  const primary = _festivalNameScore(b.name || '') > _festivalNameScore(a.name || '') ? b : a;
  const secondary = primary === a ? b : a;
  const startDate = [a.date, b.date].filter(Boolean).sort()[0] || a.date || b.date;
  const endDate = [a.endDate || a.date, b.endDate || b.date].filter(Boolean).sort().slice(-1)[0] || startDate;
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
    lineup: _uniqueCI([...(a.lineup || []), ...(b.lineup || [])]),
    sourceHints: _uniqueCI([...(a.sourceHints || []), ...(b.sourceHints || []), a.rawName, b.rawName].filter(Boolean)),
  };
}

function scoreFestivals() {
  // Non-linear play weight — four clear tiers with smooth intra-tier variation:
  //   0 plays   →  0     (not tracked)
  //   1         →  2     (in playlist once, casual)
  //   2–3       →  7–8   (неплохо — you know them)
  //   4–10      →  14–17 (отлично — real fan)
  //   11+       →  23+   (супер — in heavy rotation)
  // Clear jumps between tiers, log smoothing within 11+ to avoid Radiohead×142 crushing everything
  const playWeight = plays => {
    if (!plays || plays <= 0) return 0;
    if (plays === 1) return 2;
    if (plays <= 3)  return 5 + plays;                    // 2→7, 3→8
    if (plays <= 10) return 12 + plays * 0.5;             // 4→14, 10→17
    return 20 + Math.log2(plays);                         // 11→23.5, 20→24.3, 50→25.6, 142→27.1
  };

  const playsTotal = Object.values(ARTIST_PLAYS).reduce((s, v) => s + v, 0);
  const hasPlays = playsTotal > 0;

  const artistWeight = name => {
    const key = (name || '').toLowerCase();
    if (hasPlays) return playWeight(ARTIST_PLAYS[key] || 0);
    // Fallback: position-based weight (earlier in list = heavier)
    const idx = ARTISTS.findIndex(a => a.toLowerCase() === key);
    return idx >= 0 ? (ARTISTS.length - idx) : 0;
  };

  // First pass: compute raw scores
  for (const f of festivals) {
    const ll = _resolvedFestivalLineup(f);
    f.lineupResolved = ll;
    f.linkedShows = _festivalLinkedConcerts(f).length;
    const matched = [];
    let rawScore = 0;
    ARTISTS.forEach(artist => {
      if (!artist) return;
      const hit = _lineupArtistHit(artist, ll) || (!ll.length && _lineupArtistHit(artist, [f.name || '']));
      if (hit) {
        const w = artistWeight(artist);
        matched.push({ artist, plays: ARTIST_PLAYS[artist.toLowerCase()] || 0, weight: w });
        rawScore += w;
      }
    });
    if (matched.length >= 2) rawScore += matched.length * 1.5;
    // Sort matched by weight desc (most-played first)
    f.matched = matched.sort((a, b) => b.weight - a.weight);
    f._rawScore = rawScore;
  }

  // Second pass: normalise scores to 0–100
  const maxRaw = Math.max(...festivals.map(f => f._rawScore || 0), 1);
  for (const f of festivals) {
    f.score = Math.round((f._rawScore / maxRaw) * 100);
    delete f._rawScore;
  }

  festivals.sort((a, b) => (b.score - a.score) || a.date.localeCompare(b.date));
}
