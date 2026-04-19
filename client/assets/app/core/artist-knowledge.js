'use strict';

const ARTIST_KNOWLEDGE_TTL = 14 * 24 * 3600e3;
const ARTIST_KNOWLEDGE_MISS_TTL = 12 * 3600e3;
const ARTIST_KNOWLEDGE_VER = 1;

const artistMediaCache = new Map();
const artistMediaInflight = new Map();
const artistMediaPrimed = new Set();
let artistAvatarObserver = null;

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

function getCachedArtistMedia(artist) {
  const key = artistMediaKey(artist);
  return key && artistMediaCache.has(key) ? artistMediaCache.get(key) : undefined;
}

function artistKnowledgeFresh(record) {
  if (!record || record.ver !== ARTIST_KNOWLEDGE_VER || !record.fetchedAt) return false;
  const ttl = record.miss ? ARTIST_KNOWLEDGE_MISS_TTL : ARTIST_KNOWLEDGE_TTL;
  return (Date.now() - record.fetchedAt) < ttl;
}

function artistKnowledgeToMedia(record) {
  if (!record || record.miss) return null;
  const images = record.images || {};
  const thumb = images.thumb || images.large || images.xl || '';
  const large = images.large || images.xl || thumb;
  const xl = images.xl || large || thumb;
  if (!thumb && !large && !xl) return null;
  return {
    thumb,
    large,
    xl,
    source: record.source || '',
    matchName: record.matchName || '',
    ts: record.fetchedAt || 0,
  };
}

function buildArtistKnowledgeRecord(artist, match) {
  const key = artistMediaKey(artist);
  const record = {
    artist: artist || '',
    normalized: key,
    fetchedAt: Date.now(),
    ver: ARTIST_KNOWLEDGE_VER,
    source: 'deezer',
    matchName: match?.name || '',
    miss: !match,
    images: {},
  };
  if (match) {
    record.images = {
      thumb: match.picture_medium || match.picture_big || match.picture_xl || '',
      large: match.picture_big || match.picture_xl || match.picture_medium || '',
      xl: match.picture_xl || match.picture_big || match.picture_medium || '',
    };
  }
  return record;
}

async function readArtistKnowledge(key) {
  if (!key || typeof DB === 'undefined') return undefined;
  try {
    const record = await DB.get('artistKnowledge', key);
    if (!record) return undefined;
    if (!artistKnowledgeFresh(record)) {
      DB.delete('artistKnowledge', key).catch(() => {});
      return undefined;
    }
    const media = artistKnowledgeToMedia(record);
    artistMediaCache.set(key, media);
    return media;
  } catch (_) {
    return undefined;
  }
}

function persistArtistKnowledge(key, record) {
  if (!key || !record || typeof DB === 'undefined') return;
  DB.put('artistKnowledge', key, record).catch(() => {});
}

async function fetchArtistMedia(artist) {
  const key = artistMediaKey(artist);
  if (!key) return null;
  if (artistMediaCache.has(key)) return artistMediaCache.get(key);
  if (artistMediaInflight.has(key)) return artistMediaInflight.get(key);

  const req = (async () => {
    try {
      const stored = await readArtistKnowledge(key);
      if (stored !== undefined) return stored;

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

      const record = buildArtistKnowledgeRecord(artist, match);
      const media = artistKnowledgeToMedia(record);
      artistMediaCache.set(key, media);
      persistArtistKnowledge(key, record);
      return media;
    } catch (_) {
      const missRecord = buildArtistKnowledgeRecord(artist, null);
      artistMediaCache.set(key, null);
      persistArtistKnowledge(key, missRecord);
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
  el.classList.add(opts.size === 'mx' ? 'artist-avatar--mx' : 'artist-avatar--feed');
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
