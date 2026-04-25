'use strict';

function festivalPlayWeight(plays) {
  if (!plays || plays <= 0) return 0;
  if (plays === 1) return 2;
  if (plays <= 3) return 5 + plays;
  if (plays <= 10) return 12 + plays * 0.5;
  return 20 + Math.log2(plays);
}

function festivalArtistWeight(name, hasPlays) {
  const key = (name || '').toLowerCase();
  if (hasPlays) return festivalPlayWeight(ARTIST_PLAYS[key] || 0);
  const index = ARTISTS.findIndex(artist => artist.toLowerCase() === key);
  return index >= 0 ? (ARTISTS.length - index) : 0;
}

function scoreFestivals() {
  const playsTotal = Object.values(ARTIST_PLAYS).reduce((sum, value) => sum + value, 0);
  const hasPlays = playsTotal > 0;

  // Pre-compute alias sets for every artist once. Previously done 20× per
  // festival (once per lineup entry) per artist — cost scaled as
  // O(festivals × lineup × artists × alias-build). Now it's O(artists).
  const artistAliasPairs = ARTISTS
    .filter(Boolean)
    .map(artist => ({ artist, aliases: _artistAliases(artist) }));

  for (const festival of festivals) {
    const lineup = _resolvedFestivalLineup(festival);
    festival.lineupResolved = lineup;
    festival.linkedShows = _festivalLinkedConcerts(festival).length;

    const lineupSource = lineup.length ? lineup : [festival.name || ''];
    // Normalize lineup entries once per festival instead of once per (artist,
    // lineup entry) pair inside _attractionMatchesArtist.
    const lineupTargets = [];
    for (const name of lineupSource) {
      const target = _normText(name || '');
      if (!target) continue;
      lineupTargets.push({ target, parts: _splitBillParts(name || '') });
    }

    const matched = [];
    let rawScore = 0;
    for (const { artist, aliases } of artistAliasPairs) {
      let hit = false;
      for (const { target, parts } of lineupTargets) {
        if (_attractionMatchesArtistFast(aliases, target, parts)) { hit = true; break; }
      }
      if (!hit) continue;

      const weight = festivalArtistWeight(artist, hasPlays);
      matched.push({
        artist,
        plays: ARTIST_PLAYS[artist.toLowerCase()] || 0,
        weight,
      });
      rawScore += weight;
    }

    if (matched.length >= 2) rawScore += matched.length * 1.5;
    festival.matched = matched.sort((a, b) => b.weight - a.weight);
    festival._rawScore = rawScore;
  }

  const maxRaw = Math.max(...festivals.map(festival => festival._rawScore || 0), 1);
  for (const festival of festivals) {
    festival.score = Math.round((festival._rawScore / maxRaw) * 100);
    delete festival._rawScore;
  }

  festivals.sort((a, b) => (b.score - a.score) || a.date.localeCompare(b.date));
}
