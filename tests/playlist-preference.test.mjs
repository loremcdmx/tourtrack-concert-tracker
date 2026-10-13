import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const app = new URL('../client/assets/app/', import.meta.url);
const spotifySource = readFileSync(new URL('integrations/spotify.js', app), 'utf8');
const importSource = readFileSync(new URL('integrations/playlist-import.js', app), 'utf8');
const actionsSource = readFileSync(new URL('scan/actions.js', app), 'utf8');
const overlaySource = readFileSync(new URL('ui/overlays.js', app), 'utf8');
const A = 'A'.repeat(22);
const B = 'B'.repeat(22);
const STANDARD = 'S'.repeat(22);
const url = id => `https://open.spotify.com/playlist/${id}`;
const item = (id, name = id, extra = {}) => ({ id, name, url: url(id), trackCount: 11, artistCount: 7, topArtists: [], ts: Date.now(), ...extra });
const plain = value => JSON.parse(JSON.stringify(value));

class Element {
  constructor(tag = 'div', id = '') {
    this.tagName = tag.toUpperCase(); this.id = id; this.className = ''; this.dataset = {};
    this.children = []; this.listeners = new Map(); this.style = {}; this.attributes = new Map();
    this.hidden = false; this.disabled = false; this.value = ''; this.innerHTML = ''; this.textContent = '';
    this.classList = { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false };
  }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  append(...children) { children.forEach(child => this.appendChild(child)); }
  replaceChildren(...children) { this.children.forEach(child => { child.parentElement = null; }); this.children = []; this.append(...children); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(type, callback) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(callback); }
  contains(child) { for (let node = child; node; node = node.parentElement) if (node === this) return true; return false; }
  closest(selector) {
    const selectors = selector.split(',').map(part => part.trim());
    for (let node = this; node; node = node.parentElement) {
      for (const part of selectors) {
        if (part.startsWith('#') && node.id === part.slice(1)) return node;
        const match = part.match(/^(?:([a-z]+))?\.([\w-]+)$/);
        if (match && (!match[1] || node.tagName === match[1].toUpperCase()) && node.className.split(/\s+/).includes(match[2])) return node;
      }
    }
    return null;
  }
  querySelector(selector) { return selector === 'canvas' ? new Element('canvas') : null; }
  emit(type, target = this, extra = {}) {
    const event = { type, target, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; }, ...extra };
    for (const callback of this.listeners.get(type) || []) callback(event);
    return event;
  }
  focus() {} select() {}
}

function fixture(shared = new Map(), { history = null, connected = false, playlists = [], importWiring = false } = {}) {
  const local = shared;
  if (history) local.set('tt_pl_history', JSON.stringify(history));
  const nodes = new Map(['onboard', 'onboard-url', 'sp-playlist-url', 'onboard-btn', 'onboard-status-text',
    'onboard-main-playlist', 'onboard-main-playlist-card', 'onboard-main-playlist-label', 'onboard-main-playlist-reset',
    'onboard-history-wrap', 'onboard-history', 'onboard-history-label', 'onboard-quickload', 'onboard-main-title',
    'onboard-sub-text', 'onboard-mintracks-chips', 'onboard-mintracks-hint', 'playlist-context-default']
    .map(id => [id, new Element('div', id)]));
  const headnote = new Element();
  const controls = { denyPreferenceWrite: false };
  const opens = [];
  const context = vm.createContext({
    URL, URLSearchParams, window: {}, document: { body: new Element('body'), getElementById: id => nodes.get(id) || null,
      createElement: tag => new Element(tag), querySelector: selector => selector === '.onboard-headnote' ? headnote : null,
      querySelectorAll: () => [] },
    localStorage: { getItem: key => local.get(key) ?? null,
      setItem(key, value) { if (key === 'tt_preferred_playlist' && controls.denyPreferenceWrite) throw new Error('QuotaExceededError'); local.set(key, String(value)); },
      removeItem: key => local.delete(key) },
    PINNED_PLAYLIST: { id: STANDARD, url: url(STANDARD), name: 'Standard', trackCount: 5656, artistCount: 2477 },
    spotifyAccountState: { connected, playlists, loaded: true, loading: false, pendingPlaylistId: '' },
    isScenarioAProductMode: () => false, _drawPlaylistMosaic() {}, renderSpotifyPlaylistChoices() {},
    getActivePlaylistSessionId: () => '', SPOTIFY_PLAYLIST_META: null,
    DEFAULT_ONBOARD_TITLE: 'Your playlist', DEFAULT_ONBOARD_SUB: 'Your music', spotifyAuthFlash: null,
    setTimeout() {}, clearTimeout() {},
  });
  const parser = actionsSource.slice(actionsSource.indexOf('function spExtractId('), actionsSource.indexOf('async function spFetchAllTracks('));
  vm.runInContext(parser, context);
  vm.runInContext(spotifySource, context);
  const accountParser = overlaySource.slice(overlaySource.indexOf('function getOnboardSpotifyPlaylistId('), overlaySource.indexOf('function startOnboardSpotifyPlaylistSelection('));
  vm.runInContext(accountParser, context);
  context.resumeOrImport = async () => { opens.push(nodes.get('onboard-url').value); return true; };
  context.startOnboardSpotifyPlaylistSelection = selected => { opens.push(selected.url); };
  if (importWiring) vm.runInContext(importSource, context);
  return { context, local, nodes, controls, opens };
}

test('explicit main A survives opening and importing B then reload on this device', async () => {
  const f = fixture(new Map(), { history: [item(A, 'Playlist A')] });
  assert.equal(f.context.setPreferredOnboardPlaylist(url(A)), true);
  await f.context.startOnboardPlaylistUrl(url(B), 'Playlist B');
  f.context.addToOnboardHistory('Playlist B', url(B), 30, 9, '', []);
  assert.deepEqual(f.opens, [url(B)]);
  const reload = fixture(f.local);
  assert.equal(reload.context.getOnboardHistory()[0].url, url(B));
  assert.equal(reload.context.getPreferredOnboardPlaylist().id, A);
  reload.context.primeOnboardPlaylistInput();
  assert.equal(reload.nodes.get('onboard-url').value, url(A));
});

test('new visitors get no standard playlist and the standard is offered only from their history or connected account', () => {
  const fresh = fixture();
  assert.equal(fresh.context.getPreferredOnboardPlaylist(), null);
  assert.equal(fresh.context.getDefaultOnboardPlaylistUrl(), '');
  fresh.context.renderOnboardHistory();
  assert.equal(fresh.nodes.get('onboard-main-playlist').hidden, true);
  const recent = fixture(new Map(), { history: [item(B, 'Recent')] });
  assert.equal(recent.context.getPreferredOnboardPlaylist().id, B);
  const history = fixture(new Map(), { history: [item(B), item(STANDARD, 'Used standard')] });
  assert.equal(history.context.getPreferredOnboardPlaylist().id, STANDARD);
  const account = fixture(new Map(), { connected: true, playlists: [item(STANDARD, 'Account standard')] });
  assert.equal(account.context.getPreferredOnboardPlaylist().id, STANDARD);
  const disconnected = fixture(new Map(), { playlists: [item(STANDARD)] });
  assert.equal(disconnected.context.getPreferredOnboardPlaylist(), null);
});

test('main preference canonicalizes localized embed URI and shared URLs without accepting foreign hosts', () => {
  for (const value of [`https://open.spotify.com/intl-ru/playlist/${A}?si=share`,
    `https://open.spotify.com/embed/playlist/${A}`, `spotify:playlist:${A}`, A]) {
    const f = fixture(new Map(), { history: [item(A, 'A', { url: value })] });
    assert.equal(f.context.setPreferredOnboardPlaylist(url(A)), true);
    assert.equal(f.context.readPreferredOnboardPlaylist().url, url(A));
    assert.equal(JSON.parse(f.local.get('tt_preferred_playlist')).url, url(A));
  }
  const invalid = fixture(new Map(), { history: [item(A, 'Unsafe', { url: `https://evil.example/playlist/${A}` })] });
  assert.equal(invalid.context.setPreferredOnboardPlaylist(url(A)), false);
  assert.equal(invalid.context.getPreferredOnboardPlaylist(), null);
});

test('standard card uses actual history/account counts and preserves measured zero instead of static defaults', () => {
  const actual = fixture(new Map(), { history: [item(STANDARD, 'Before refresh')] });
  actual.context.setPreferredOnboardPlaylist(url(STANDARD));
  actual.context.addToOnboardHistory('Actual', url(STANDARD), 5786, 2544, '', []);
  actual.context.renderOnboardHistory();
  const card = actual.nodes.get('onboard-main-playlist-card').children[0];
  assert.match(card.innerHTML, /5,786 tracks/);
  assert.match(card.innerHTML, /2,544 artists/);
  assert.doesNotMatch(card.innerHTML, /5,656|2,477/);
  const account = fixture(new Map(), { connected: true, playlists: [item(STANDARD, 'Actual account', { trackCount: 5786, artistCount: undefined })] });
  account.context.renderOnboardHistory();
  assert.match(account.nodes.get('onboard-main-playlist-card').children[0].innerHTML, /5,786 tracks/);
  assert.doesNotMatch(account.nodes.get('onboard-main-playlist-card').children[0].innerHTML, /artists/);
  const zero = actual.context.createOnboardSavedPlaylistCard(item(A, 'Empty', { trackCount: 0, artistCount: 0 }), true);
  assert.match(zero.innerHTML, /0 tracks/);
  assert.match(zero.innerHTML, /0 artists/);
});

test('priming fills only empty input and preserves both typed links and the actual pending OAuth restoration', () => {
  const f = fixture(new Map(), { history: [item(A)], importWiring: true });
  f.context.setPreferredOnboardPlaylist(url(A));
  const typed = `${url(B)}?si=typed`;
  f.nodes.get('onboard-url').value = typed;
  f.context.primeOnboardPlaylistInput();
  assert.equal(f.nodes.get('onboard-url').value, typed);
  f.local.set('tt_pending_spotify_playlist', typed);
  f.context.spotifyAuthFlash = { message: 'Connected' };
  f.context.applyPlaylistLinkProductMode();
  f.context.primeOnboardPlaylistInput();
  assert.equal(f.nodes.get('onboard-url').value, typed);
  assert.equal(f.local.has('tt_pending_spotify_playlist'), false);
  assert.equal(f.context.window.__ttRestorePlaylistImport, true);
  f.nodes.get('onboard-url').value = '  ';
  f.context.primeOnboardPlaylistInput();
  assert.equal(f.nodes.get('onboard-url').value, url(A));
});

test('storage write failure returns failure and retains the previous explicit main playlist', () => {
  const f = fixture(new Map(), { history: [item(A), item(B)] });
  assert.equal(f.context.setPreferredOnboardPlaylist(url(A)), true);
  f.controls.denyPreferenceWrite = true;
  assert.equal(f.context.setPreferredOnboardPlaylist(url(B)), false);
  assert.equal(f.context.readPreferredOnboardPlaylist().id, A);
  assert.match(f.nodes.get('onboard-status-text').textContent, /Could not remember/);
});

test('history eviction does not remove the explicit main playlist or its saved actual metadata', () => {
  const f = fixture(new Map(), { history: [item(A, 'Durable A', { trackCount: 5786, artistCount: 2544 })] });
  f.context.setPreferredOnboardPlaylist(url(A));
  for (let i = 0; i < 12; i++) f.context.addToOnboardHistory(`Recent ${i}`, url(String(i).padStart(22, '0')), i, i, '', []);
  assert.equal(f.context.getOnboardHistory().length, 10);
  assert.equal(f.context.getOnboardHistory().some(entry => entry.url === url(A)), false);
  const reload = fixture(f.local);
  assert.deepEqual(plain(reload.context.getPreferredOnboardPlaylist()), item(A, 'Durable A', {
    trackCount: 5786, artistCount: 2544, ts: JSON.parse(f.local.get('tt_preferred_playlist')).ts,
  }));
});

test('delegates ignore disabled cards and preference controls; native touch and keyboard produce one start per click', () => {
  const f = fixture(new Map(), { history: [item(A)] });
  const root = f.nodes.get('onboard');
  const card = f.context.createOnboardSavedPlaylistCard(item(A), true);
  root.appendChild(card);
  const child = card.appendChild(new Element('span'));
  const pin = card.appendChild(new Element('button'));
  pin.className = 'onboard-pl-pin';
  const pinChild = pin.appendChild(new Element('span'));
  const remove = card.appendChild(new Element('button'));
  remove.className = 'onboard-pl-del';
  f.context.installOnboardCardDelegates();
  f.context.installOnboardCardDelegates();
  assert.equal(root.listeners.get('click').length, 1);
  for (const target of [pinChild, remove]) {
    for (const type of ['click', 'pointerup', 'keydown']) {
      assert.equal(root.emit(type, target, { pointerType: 'touch', key: 'Enter' }).prevented, undefined,
        'Preference and history actions must remain available to their own native handlers');
    }
  }
  card.disabled = true;
  root.emit('click', child);
  assert.equal(f.opens.length, 0);
  card.disabled = false;
  root.emit('pointerup', child, { pointerType: 'touch' });
  assert.equal(f.opens.length, 0, 'Native pointerup must remain available for the browser-generated click');
  root.emit('click', child);
  assert.equal(f.opens.length, 1);
  for (const key of ['Enter', ' ']) {
    root.emit('keydown', child, { key });
    root.emit('click', child);
  }
  assert.deepEqual(f.opens, [url(A), url(A), url(A)]);
  root.emit('keydown', child, { key: 'ArrowDown' });
  root.emit('pointerup', child, { pointerType: 'mouse' });
  assert.equal(f.opens.length, 3);
});
