'use strict';

const ARTIST_KNOWLEDGE_TTL = 14 * 24 * 3600e3;
const ARTIST_KNOWLEDGE_MISS_TTL = 12 * 3600e3;
const ARTIST_KNOWLEDGE_VER = 2;
const ARTIST_MEDIA_SEED_VERSION = 2026042001;
const ARTIST_MEDIA_SEED_STORAGE_KEY = 'tt_artist_media_seed_version';
const ARTIST_MEDIA_SEED_URL = '/assets/data/artist-media-seed.json';

const artistKnowledgeCache = new Map();
const artistKnowledgeAliasCache = new Map();
const artistMediaCache = new Map();
const artistMediaInflight = new Map();
const artistMediaPrimed = new Set();
let artistAvatarObserver = null;
let artistMediaSeedImportPromise = null;

function artistMediaKey(artist) {
  return _normText(artist || '');
}

function artistAvatarInitials(artist) {
  const raw = String(artist || '').trim();
  if (!raw) return '?';
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function artistAvatarAccent(artist, fallbackColor) {
  if (fallbackColor) return fallbackColor;
  if (typeof getColor === 'function') return getColor(artist || '');
  return 'var(--accent)';
}

function _knowledgeList(...lists) {
  return _uniqueCI(lists.flat().filter(Boolean).map(v => String(v).trim()).filter(Boolean));
}

function _maxTs(...values) {
  let max = 0;
  for (const value of values) {
    const ts = Number(value) || 0;
    if (ts > max) max = ts;
  }
  return max;
}

function _normalizeKnowledgeMediaNode(node) {
  if (!node) return null;
  return {
    source: node.source || '',
    matchName: node.matchName || '',
    fetchedAt: Number(node.fetchedAt || node.ts || 0) || 0,
    miss: !!node.miss,
    images: {
      thumb: node.images?.thumb || node.thumb || '',
      large: node.images?.large || node.large || '',
      xl: node.images?.xl || node.xl || '',
    },
  };
}

function normalizeArtistKnowledgeRecord(record, artist = '') {
  const key = artistMediaKey(record?.artist || artist);
  const legacyMedia = record && !record.media && (
    record.images ||
    Object.prototype.hasOwnProperty.call(record, 'miss') ||
    record.matchName ||
    record.source ||
    record.fetchedAt
  ) ? {
    source: record.source || '',
    matchName: record.matchName || '',
    fetchedAt: record.fetchedAt || record.updatedAt || 0,
    miss: !!record.miss,
    images: record.images || {},
  } : null;

  const media = _normalizeKnowledgeMediaNode(record?.media || legacyMedia);
  const ticketmaster = record?.ticketmaster ? { ...record.ticketmaster } : {};
  const bandsintown = record?.bandsintown ? { ...record.bandsintown } : {};
  const coverage = record?.coverage ? { ...record.coverage } : {};
  const aliases = _knowledgeList(
    record?.artist || artist || '',
    ...(record?.aliases || []),
    media?.matchName || '',
    ticketmaster.attractionName || '',
    bandsintown.artistName || '',
    ...(coverage.aliases || []),
  );

  return {
    artist: record?.artist || artist || '',
    normalized: record?.normalized || key,
    ver: ARTIST_KNOWLEDGE_VER,
    updatedAt: _maxTs(
      record?.updatedAt || 0,
      media?.fetchedAt || 0,
      ticketmaster.checkedAt || 0,
      bandsintown.checkedAt || 0,
      coverage.lastConcertScanAt || 0,
    ),
    aliases,
    media,
    ticketmaster,
    bandsintown,
    coverage,
  };
}

function artistKnowledgeToMedia(record) {
  const mediaNode = _normalizeKnowledgeMediaNode(record?.media || record);
  if (!mediaNode || mediaNode.miss) return null;
  const images = mediaNode.images || {};
  const thumb = images.thumb || images.large || images.xl || '';
  const large = images.large || images.xl || thumb;
  const xl = images.xl || large || thumb;
  if (!thumb && !large && !xl) return null;
  return {
    thumb,
    large,
    xl,
    source: mediaNode.source || '',
    matchName: mediaNode.matchName || '',
    ts: mediaNode.fetchedAt || 0,
  };
}

function artistKnowledgeMediaFresh(record) {
  const mediaNode = _normalizeKnowledgeMediaNode(record?.media || record);
  if (!mediaNode || !mediaNode.fetchedAt) return false;
  const ttl = mediaNode.miss ? ARTIST_KNOWLEDGE_MISS_TTL : ARTIST_KNOWLEDGE_TTL;
  return (Date.now() - mediaNode.fetchedAt) < ttl;
}

function artistKnowledgeCoverageFresh(record) {
  const checkedAt = Number(record?.coverage?.lastConcertScanAt || 0) || 0;
  if (!checkedAt) return false;
  const upcomingCount = Number(record?.coverage?.upcomingCount || 0) || 0;
  const ttl = upcomingCount > 0 ? 18 * 3600e3 : 36 * 3600e3;
  return (Date.now() - checkedAt) < ttl;
}

function cacheArtistKnowledgeRecord(key, record) {
  const normalized = normalizeArtistKnowledgeRecord(record, record?.artist || '');
  const finalKey = normalized.normalized || key;
  artistKnowledgeCache.set(finalKey, normalized);
  artistKnowledgeAliasCache.set(finalKey, (normalized.aliases || []).map(alias => _normText(alias)).filter(Boolean));
  artistMediaCache.set(finalKey, artistKnowledgeToMedia(normalized));
  return normalized;
}

async function readArtistKnowledgeRecord(artistOrKey, opts = {}) {
  const key = opts.byKey ? artistOrKey : artistMediaKey(artistOrKey);
  if (!key || typeof DB === 'undefined') return null;
  if (artistKnowledgeCache.has(key)) return artistKnowledgeCache.get(key);
  try {
    const record = await DB.get('artistKnowledge', key);
    if (!record) return null;
    return cacheArtistKnowledgeRecord(key, {
      ...record,
      artist: record.artist || (opts.byKey ? '' : artistOrKey),
    });
  } catch (_) {
    return null;
  }
}

async function getArtistKnowledgeRecord(artist) {
  return readArtistKnowledgeRecord(artist);
}

async function hydrateArtistKnowledge(artists, concurrency = 12) {
  const queue = _uniqueCI(artists || [])
    .filter(Boolean)
    .filter(artist => !artistKnowledgeCache.has(artistMediaKey(artist)));
  if (!queue.length) return;

  let idx = 0;
  async function worker() {
    while (idx < queue.length) {
      const artist = queue[idx++];
      await readArtistKnowledgeRecord(artist);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
}

function getArtistKnowledgeAliases(artist) {
  const key = artistMediaKey(artist);
  return key && artistKnowledgeAliasCache.has(key) ? artistKnowledgeAliasCache.get(key) : [];
}

function getArtistCoverageHint(artist) {
  const key = artistMediaKey(artist);
  return key && artistKnowledgeCache.has(key) ? artistKnowledgeCache.get(key)?.coverage || null : null;
}

function persistArtistKnowledge(key, record) {
  if (!key || !record || typeof DB === 'undefined') return;
  const normalized = cacheArtistKnowledgeRecord(key, record);
  DB.put('artistKnowledge', key, normalized).catch(() => {});
}

function _artistMediaSeedImportedVersion() {
  try {
    return Number(localStorage.getItem(ARTIST_MEDIA_SEED_STORAGE_KEY) || 0) || 0;
  } catch (_) {
    return 0;
  }
}

function _setArtistMediaSeedImportedVersion(version) {
  try {
    localStorage.setItem(ARTIST_MEDIA_SEED_STORAGE_KEY, String(version || 0));
  } catch (_) {}
}

function clearArtistMediaSeedMarker() {
  try {
    localStorage.removeItem(ARTIST_MEDIA_SEED_STORAGE_KEY);
  } catch (_) {}
}

async function importArtistMediaSeed(opts = {}) {
  if (artistMediaSeedImportPromise && !opts.force) return artistMediaSeedImportPromise;
  artistMediaSeedImportPromise = (async () => {
    if (typeof DB === 'undefined' || typeof fetch !== 'function') {
      return { imported: 0, skipped: 0, reason: 'unavailable' };
    }

    const currentVersion = _artistMediaSeedImportedVersion();
    if (!opts.force && currentVersion >= ARTIST_MEDIA_SEED_VERSION) {
      return { imported: 0, skipped: 0, reason: 'current' };
    }

    let seed = null;
    try {
      const res = await fetch(`${ARTIST_MEDIA_SEED_URL}?v=${ARTIST_MEDIA_SEED_VERSION}`);
      if (!res.ok) return { imported: 0, skipped: 0, reason: `http:${res.status}` };
      seed = await res.json();
    } catch (_) {
      return { imported: 0, skipped: 0, reason: 'fetch-failed' };
    }

    const version = Number(seed?.version || 0) || ARTIST_MEDIA_SEED_VERSION;
    const records = Array.isArray(seed?.records) ? seed.records : [];
    if (!records.length) {
      _setArtistMediaSeedImportedVersion(version);
      return { imported: 0, skipped: 0, reason: 'empty' };
    }

    const existing = new Map();
    try {
      const existingKeys = await DB.keys('artistKnowledge');
      const existingRecords = await DB.getAll('artistKnowledge');
      existingKeys.forEach((key, idx) => {
        const record = existingRecords[idx];
        if (record) existing.set(key, record);
      });
    } catch (_) {}

    let imported = 0;
    let skipped = 0;
    let pendingWrites = [];
    const flushWrites = async () => {
      if (!pendingWrites.length) return;
      const batch = pendingWrites;
      pendingWrites = [];
      try {
        if (typeof DB.putMany === 'function') {
          await DB.putMany('artistKnowledge', batch);
        } else {
          for (const [key, record] of batch) await DB.put('artistKnowledge', key, record);
        }
        imported += batch.length;
      } catch (_) {
        skipped += batch.length;
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    };

    for (const item of records) {
      const media = _normalizeKnowledgeMediaNode(item?.media);
      const seedHasImage = !!artistKnowledgeToMedia(media);
      if (!media || (!media.miss && !seedHasImage)) {
        skipped += 1;
        continue;
      }

      const artist = item.artist || media.matchName || item.key || '';
      const key = artistMediaKey(item.key || artist);
      if (!key) {
        skipped += 1;
        continue;
      }

      const current = existing.get(key) || null;
      if (!opts.force && current && artistKnowledgeMediaFresh(current)) {
        const currentHasImage = !!artistKnowledgeToMedia(current);
        if (currentHasImage || current.media?.miss) {
          skipped += 1;
          continue;
        }
      }

      const normalized = normalizeArtistKnowledgeRecord({
        ...(current || {}),
        artist: current?.artist || artist,
        aliases: _knowledgeList(current?.aliases || [], item.aliases || [], artist, media.matchName || ''),
        media,
        updatedAt: Math.max(Number(current?.updatedAt || 0) || 0, media.fetchedAt || Date.now()),
      }, artist);

      cacheArtistKnowledgeRecord(key, normalized);
      pendingWrites.push([key, normalized]);
      if (pendingWrites.length >= 180) await flushWrites();
    }
    await flushWrites();

    _setArtistMediaSeedImportedVersion(version);
    return { imported, skipped, total: records.length, version };
  })();
  return artistMediaSeedImportPromise;
}

async function mergeArtistKnowledge(artist, patch = {}) {
  const key = artistMediaKey(artist);
  if (!key) return null;
  const current = await readArtistKnowledgeRecord(key, { byKey: true }) || normalizeArtistKnowledgeRecord({ artist }, artist);
  const next = normalizeArtistKnowledgeRecord({
    ...current,
    ...patch,
    artist: current.artist || artist,
    aliases: _knowledgeList(current.aliases || [], patch.aliases || [], patch.artist || '', artist || ''),
    media: patch.media ? {
      ...(current.media || {}),
      ...patch.media,
      images: {
        ...((current.media || {}).images || {}),
        ...((patch.media || {}).images || {}),
      },
    } : current.media,
    ticketmaster: patch.ticketmaster ? {
      ...(current.ticketmaster || {}),
      ...patch.ticketmaster,
    } : current.ticketmaster,
    bandsintown: patch.bandsintown ? {
      ...(current.bandsintown || {}),
      ...patch.bandsintown,
    } : current.bandsintown,
    coverage: patch.coverage ? {
      ...(current.coverage || {}),
      ...patch.coverage,
      sources: patch.coverage?.sources
        ? _knowledgeList(current.coverage?.sources || [], patch.coverage.sources || [])
        : (current.coverage || {}).sources,
      aliases: patch.coverage?.aliases
        ? _knowledgeList(current.coverage?.aliases || [], patch.coverage.aliases || [])
        : (current.coverage || {}).aliases,
    } : current.coverage,
    updatedAt: Date.now(),
  }, artist);
  persistArtistKnowledge(key, next);
  return next;
}

async function recordTicketmasterKnowledge(artist, patch = {}) {
  return mergeArtistKnowledge(artist, {
    aliases: [patch.attractionName || ''],
    ticketmaster: {
      ...patch,
      checkedAt: patch.checkedAt || Date.now(),
    },
  });
}

async function recordBandsintownKnowledge(artist, patch = {}) {
  return mergeArtistKnowledge(artist, {
    aliases: [patch.artistName || ''],
    bandsintown: {
      ...patch,
      checkedAt: patch.checkedAt || Date.now(),
    },
  });
}

async function recordConcertCoverageKnowledge(artist, shows, context = '') {
  const list = Array.isArray(shows) ? shows.slice() : [];
  const today = new Date().toISOString().split('T')[0];
  const dates = list.map(show => show?.date).filter(Boolean).sort();
  return mergeArtistKnowledge(artist, {
    coverage: {
      lastConcertScanAt: Date.now(),
      upcomingCount: list.filter(show => show?.date && show.date >= today).length,
      totalKnownCount: list.length,
      firstDate: dates[0] || '',
      lastDate: dates[dates.length - 1] || '',
      touring: list.some(show => show?.date && show.date >= today),
      sources: _knowledgeList(list.map(show => show?._src || '')),
      aliases: _knowledgeList(list.map(show => show?.artist || '')),
      context,
    },
  });
}

function getCachedArtistMedia(artist) {
  const key = artistMediaKey(artist);
  if (!key || !artistMediaCache.has(key)) return undefined;
  const record = artistKnowledgeCache.get(key);
  if (record && !artistKnowledgeMediaFresh(record)) return undefined;
  return artistMediaCache.get(key);
}

async function fetchArtistMedia(artist) {
  const key = artistMediaKey(artist);
  if (!key) return null;
  if (artistMediaCache.has(key)) {
    const cachedRecord = artistKnowledgeCache.get(key);
    if (!cachedRecord || artistKnowledgeMediaFresh(cachedRecord)) {
      return artistMediaCache.get(key);
    }
  }
  if (artistMediaInflight.has(key)) return artistMediaInflight.get(key);

  const req = (async () => {
    let fallbackMedia = null;
    try {
      const stored = await readArtistKnowledgeRecord(key, { byKey: true });
      fallbackMedia = artistKnowledgeToMedia(stored);
      if (stored && artistKnowledgeMediaFresh(stored)) return fallbackMedia;
      if (fallbackMedia) artistMediaCache.set(key, fallbackMedia);

      const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist)}&limit=5`);
      if (!res.ok) throw new Error(`deezer:${res.status}`);
      const data = await res.json();
      const items = Array.isArray(data?.data) ? data.data : [];
      const match =
        items.find(item => artistMediaKey(item?.name) === key) ||
        items.find(item => {
          const itemKey = artistMediaKey(item?.name);
          return itemKey && (itemKey.includes(key) || key.includes(itemKey));
        }) ||
        items[0] ||
        null;

      const record = await mergeArtistKnowledge(artist, {
        aliases: [match?.name || ''],
        media: {
          source: 'deezer',
          matchName: match?.name || '',
          fetchedAt: Date.now(),
          miss: !match,
          images: match ? {
            thumb: match.picture_medium || match.picture_big || match.picture_xl || '',
            large: match.picture_big || match.picture_xl || match.picture_medium || '',
            xl: match.picture_xl || match.picture_big || match.picture_medium || '',
          } : {},
        },
      });
      const media = artistKnowledgeToMedia(record);
      artistMediaCache.set(key, media);
      return media;
    } catch (_) {
      if (fallbackMedia) {
        artistMediaCache.set(key, fallbackMedia);
        return fallbackMedia;
      }
      await mergeArtistKnowledge(artist, {
        media: {
          source: 'deezer',
          matchName: '',
          fetchedAt: Date.now(),
          miss: true,
          images: {},
        },
      });
      artistMediaCache.set(key, null);
      return null;
    } finally {
      artistMediaInflight.delete(key);
    }
  })();

  artistMediaInflight.set(key, req);
  return req;
}

function applyArtistMediaToAvatar(el, media) {
  if (!el) return;
  const img = el.querySelector('img');
  const src = media?.thumb || media?.large || media?.xl || '';
  if (!img || !src) {
    el.classList.remove('has-image');
    return;
  }
  img.onload = () => el.classList.add('has-image');
  img.onerror = () => {
    el.classList.remove('has-image');
    img.removeAttribute('src');
  };
  img.src = src;
  if (img.complete && img.naturalWidth > 0) el.classList.add('has-image');
}

async function loadArtistAvatar(el, artist) {
  if (!el) return;
  const key = artistMediaKey(artist);
  const media = await fetchArtistMedia(artist);
  if (!el.isConnected || el.dataset.artistKey !== key) return;
  applyArtistMediaToAvatar(el, media);
}

function queueArtistAvatarLoad(el, artist) {
  if (!el) return;
  const cached = getCachedArtistMedia(artist);
  if (cached !== undefined) {
    applyArtistMediaToAvatar(el, cached);
    return;
  }
  if (!artistAvatarObserver && 'IntersectionObserver' in window) {
    artistAvatarObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        artistAvatarObserver.unobserve(entry.target);
        loadArtistAvatar(entry.target, entry.target.dataset.artist || '');
      });
    }, { rootMargin: '180px 0px' });
  }
  if (artistAvatarObserver) {
    artistAvatarObserver.observe(el);
  } else {
    loadArtistAvatar(el, artist);
  }
}

function createArtistAvatar(artist, opts = {}) {
  const el = document.createElement('div');
  el.className = 'artist-avatar';
  const sizeClass = opts.size === 'mx'
    ? 'artist-avatar--mx'
    : opts.size === 'chip'
      ? 'artist-avatar--chip'
      : 'artist-avatar--feed';
  el.classList.add(sizeClass);
  el.dataset.artist = artist || '';
  el.dataset.artistKey = artistMediaKey(artist);
  el.style.setProperty('--artist-avatar-accent', artistAvatarAccent(artist, opts.color));

  const fallback = document.createElement('span');
  fallback.className = 'artist-avatar-fallback';
  fallback.textContent = artistAvatarInitials(artist);

  const img = document.createElement('img');
  img.alt = artist ? `${artist} portrait` : 'Artist portrait';
  img.loading = 'lazy';
  img.referrerPolicy = 'no-referrer';

  el.appendChild(fallback);
  el.appendChild(img);
  queueArtistAvatarLoad(el, artist);
  return el;
}

function mountArtistPanelPhoto(panel, artist) {
  if (!panel) return;
  panel.querySelector('.cdr-artist-photo')?.remove();
  const key = artistMediaKey(artist);
  panel.dataset.artistKey = key;

  const insertPhoto = (media) => {
    if (!panel.isConnected || panel.dataset.artistKey !== key) return;
    panel.querySelector('.cdr-artist-photo')?.remove();
    const src = media?.xl || media?.large || media?.thumb || '';
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.className = 'cdr-artist-photo';
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => img.remove();
    panel.insertBefore(img, panel.firstChild);
  };

  const cached = getCachedArtistMedia(artist);
  if (cached !== undefined) {
    insertPhoto(cached);
    return;
  }
  fetchArtistMedia(artist).then(insertPhoto);
}

function primeArtistMediaKnowledge(artists, limit = 24) {
  if (!Array.isArray(artists) || !artists.length) return;
  const queue = [];
  for (const artist of artists) {
    const key = artistMediaKey(artist);
    if (!key || artistMediaPrimed.has(key)) continue;
    artistMediaPrimed.add(key);
    queue.push(artist);
    if (queue.length >= limit) break;
  }
  queue.forEach((artist, idx) => {
    window.setTimeout(() => {
      fetchArtistMedia(artist).catch(() => {});
    }, idx * 140);
  });
}

if (typeof window !== 'undefined') {
  window.importArtistMediaSeed = importArtistMediaSeed;
  window.clearArtistMediaSeedMarker = clearArtistMediaSeedMarker;
  window.setTimeout(() => {
    importArtistMediaSeed().catch(() => {});
  }, 1200);
}
