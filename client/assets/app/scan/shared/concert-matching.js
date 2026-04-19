'use strict';

const AMBIG_OVERRIDE = new Set(['yes', 'air', 'mos', 'run', 'now', 'war', 'rem']);
const FALSE_ARTIST_EDGE_RE = /\b(tribute(?:\s+to)?|salute(?:\s+to)?|celebration(?:\s+of)?|story(?:\s+of)?|legacy(?:\s+of)?|experience|karaoke|candlelight|symphonic|orchestra|quartet|ensemble|cover(?:s| band)?|music of|songs of|sounds of|plays the music of|best of|inspired by|performed by|featuring the music of|after[- ]party|party|club night|dance night|dance party|brunch|burlesque|drag brunch|vs\.?|versus|meets|battle of)\b/i;

function artistIsAmbiguous(name) {
  const n = (name || '').trim().toLowerCase();
  if (n.length <= 2) return true;
  if (!n.includes(' ') && n.length <= 3) return true;
  if (AMBIG_OVERRIDE.has(n)) return true;
  return false;
}

function buildArtistAliasIndex(artists) {
  const aliasOwners = new Map();
  for (const artist of artists || []) {
    for (const alias of _artistAliases(artist)) {
      if (!alias) continue;
      if (!aliasOwners.has(alias)) aliasOwners.set(alias, new Set());
      aliasOwners.get(alias).add(artist);
    }
  }

  const index = new Map();
  for (const [alias, owners] of aliasOwners.entries()) {
    if (owners.size !== 1) continue;
    for (const owner of owners) {
      index.set(alias, owner);
    }
  }
  return index;
}

function _eventAttractions(ev) {
  return ev?._embedded?.attractions || [];
}

function _artistAliasContext(alias, normName) {
  const match = _wordBoundaryRe(alias).exec(normName);
  if (!match) return null;
  const center = match.index;
  const start = Math.max(0, center - 40);
  const end = Math.min(normName.length, center + alias.length + 40);
  return {
    before: normName.slice(0, center).trim(),
    after: normName.slice(center + alias.length).trim(),
    window: normName.slice(start, end),
  };
}

function eventHasFalseArtistContext(artist, evName) {
  const normName = _normText(evName);
  if (!normName) return false;

  return _artistAliases(artist).some(alias => {
    if (!_hasBoundaryMatch(alias, normName)) return false;
    const ctx = _artistAliasContext(alias, normName);
    if (!ctx) return false;
    if (FALSE_ARTIST_EDGE_RE.test(ctx.window)) return true;
    if (ctx.before && FALSE_ARTIST_EDGE_RE.test(ctx.before)) return true;
    if (ctx.after && FALSE_ARTIST_EDGE_RE.test(ctx.after)) return true;
    return false;
  });
}

function getArtistEventMatchDecision(artist, ev, opts = {}) {
  const attractions = _eventAttractions(ev);
  if (attractions.some(a => _attractionMatchesArtist(artist, a.name))) {
    return { matched: true, reason: 'attraction', confidence: 1 };
  }
  if (attractions.length) {
    return { matched: false, reason: 'different-attraction', confidence: 0 };
  }

  const ambiguous = opts.ambiguous == null ? artistIsAmbiguous(artist) : !!opts.ambiguous;
  if (ambiguous) {
    return { matched: false, reason: 'ambiguous-artist', confidence: 0 };
  }
  if (eventHasFalseArtistContext(artist, ev?.name || '')) {
    return { matched: false, reason: 'false-positive-context', confidence: 0 };
  }
  if (_eventNameLooksLikeArtistShow(artist, ev?.name || '')) {
    return { matched: true, reason: 'event-name', confidence: 0.55 };
  }
  return { matched: false, reason: 'no-match', confidence: 0 };
}

function artistMatch(artist, ev, ambig) {
  return getArtistEventMatchDecision(artist, ev, { ambiguous: ambig }).matched;
}
