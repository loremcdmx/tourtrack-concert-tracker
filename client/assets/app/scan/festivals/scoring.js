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

  for (const festival of festivals) {
    const lineup = _resolvedFestivalLineup(festival);
    festival.lineupResolved = lineup;
    festival.linkedShows = _festivalLinkedConcerts(festival).length;

    const matched = [];
    let rawScore = 0;
    ARTISTS.forEach(artist => {
      if (!artist) return;
      const hit = _lineupArtistHit(artist, lineup) || (!lineup.length && _lineupArtistHit(artist, [festival.name || '']));
      if (!hit) return;

      const weight = festivalArtistWeight(artist, hasPlays);
      matched.push({
        artist,
        plays: ARTIST_PLAYS[artist.toLowerCase()] || 0,
        weight,
      });
      rawScore += weight;
    });

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
