import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

function node(tag = 'div') {
  const classes = new Set();
  const listeners = new Map();
  let html = '';
  return {
    tagName: tag.toUpperCase(), children: [], style: {}, dataset: {}, hidden: false,
    value: '', textContent: '', disabled: false,
    classList: { add(name) { classes.add(name); }, contains(name) { return classes.has(name); } },
    set innerHTML(value) { html = value; this.children = []; }, get innerHTML() { return html; },
    appendChild(child) { this.children.push(child); },
    addEventListener(type, callback) { listeners.set(type, callback); },
    click() { if (!this.disabled) listeners.get('click')?.(); },
  };
}

function fixture() {
  const nodes = new Map(['onboard-auth-list-wrap', 'onboard-auth-list', 'onboard-playlist-search-wrap',
    'onboard-playlist-search', 'onboard-playlist-count', 'onboard-url', 'rhandle', 'cal-panel'].map(id => [id, node()]));
  const frames = [];
  const timers = [];
  const f = { nodes, frames, timers, preferred: null, primaryCalls: [], progressShown: 0, progressHidden: 0, statuses: [] };
  const context = vm.createContext({
    document: { getElementById: id => nodes.get(id) || null, createElement: tag => node(tag), addEventListener() {} },
    isScenarioAProductMode: () => false, SERVER_MANAGED_SPOTIFY_LOGIN: true,
    getPreferredOnboardPlaylist: () => f.preferred,
    spExtractId: raw => String(raw).match(/(?:playlist\/)?([a-zA-Z0-9]{22})$/)?.[1] || null,
    esc2: value => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
    markOnboardManualIntent() {}, syncOnboardPrimaryAction() {}, onboardLog() {},
    onboardSetStatus(message) { f.statuses.push(message); },
    onboardShowProgress() { f.progressShown++; }, onboardHideProgress() { f.progressHidden++; },
    requestAnimationFrame(fn) { frames.push(fn); }, setTimeout(fn) { timers.push(fn); },
    _playlistImportGeneration: 0,
    async handleOnboardPrimaryAction() {
      f.primaryCalls.push(nodes.get('onboard-url').value);
      context._playlistImportGeneration++;
      f.state.pendingPlaylistId = '';
      return true;
    },
    onboardImport() { assert.fail('Saved account choices must use the resume-or-import action'); },
  });
  vm.runInContext(readFileSync(new URL('../client/assets/app/ui/overlays.js', import.meta.url), 'utf8'), context);
  f.context = context;
  f.state = vm.runInContext('spotifyAccountState', context);
  Object.assign(f.state, { loaded: true, connected: true, playlistsLoaded: true });
  f.cards = () => nodes.get('onboard-auth-list').children;
  f.ids = () => f.cards().map(card => card.dataset.playlistId);
  f.render = () => context.renderSpotifyPlaylistChoices();
  f.flush = async () => {
    while (frames.length) frames.shift()();
    while (timers.length) timers.shift()();
    for (let i = 0; i < 12; i++) await Promise.resolve();
  };
  return f;
}

const playlist = (index, extra = {}) => ({ id: String(index).padStart(22, '0'), name: `Playlist ${index}`,
  url: `https://open.spotify.com/playlist/${String(index).padStart(22, '0')}`, ownerName: `Owner ${index}`, trackCount: index, ...extra });

test('all 30 account playlists remain selectable, including entries beyond the former twelve-card cap', async () => {
  const f = fixture();
  f.state.playlists = Array.from({ length: 30 }, (_, index) => playlist(index + 1));
  f.render();
  assert.equal(f.cards().length, 30);
  assert.equal(f.nodes.get('onboard-playlist-count').textContent, '30 playlists');
  assert.equal(f.nodes.get('onboard-playlist-search-wrap').hidden, false);
  assert.equal(f.cards()[29].tagName, 'BUTTON');
  f.cards()[29].click();
  await f.flush();
  assert.deepEqual(f.primaryCalls, [playlist(30).url]);
  assert.equal(f.state.pendingPlaylistId, '');
  assert.equal(f.progressHidden, 1, 'A saved resume clears the earlier import progress indicator');
});

test('name and owner search is trimmed, case-insensitive and can reach playlist thirty', () => {
  const f = fixture();
  f.state.playlists = Array.from({ length: 30 }, (_, index) => playlist(index + 1));
  f.nodes.get('onboard-playlist-search').value = '  PLAYLIST 30  ';
  f.render();
  assert.deepEqual(f.ids(), [playlist(30).id]);
  assert.equal(f.nodes.get('onboard-playlist-count').textContent, '1 of 30 playlists');
  f.nodes.get('onboard-playlist-search').value = 'owner 29';
  f.render();
  assert.deepEqual(f.ids(), [playlist(29).id]);
  f.nodes.get('onboard-playlist-search').value = '';
  f.render();
  assert.equal(f.cards().length, 30);
});

test('explicit preferred choice sorts first without mutating account order or injecting another user playlist', () => {
  const f = fixture();
  f.state.playlists = [playlist(1), playlist(2), playlist(3)];
  f.preferred = playlist(3);
  f.render();
  assert.deepEqual(f.ids(), [playlist(3).id, playlist(1).id, playlist(2).id]);
  assert.deepEqual(f.state.playlists.map(item => item.id), [playlist(1).id, playlist(2).id, playlist(3).id]);
  f.nodes.get('onboard-playlist-search').value = 'Playlist 2';
  f.render();
  assert.deepEqual(f.ids(), [playlist(2).id], 'Preference must not escape the current search');
  f.preferred = playlist(99);
  f.nodes.get('onboard-playlist-search').value = '';
  f.render();
  assert.deepEqual(f.ids(), [playlist(1).id, playlist(2).id, playlist(3).id]);
});

test('empty account and no search matches have distinct states and honest counts', () => {
  const f = fixture();
  f.render();
  assert.equal(f.nodes.get('onboard-playlist-count').textContent, '0 playlists');
  assert.match(f.nodes.get('onboard-auth-list').innerHTML, /No playlists found/);
  f.state.playlists = [playlist(1)];
  f.nodes.get('onboard-playlist-search').value = 'missing';
  f.render();
  assert.equal(f.nodes.get('onboard-playlist-count').textContent, '0 of 1 playlist');
  assert.match(f.nodes.get('onboard-auth-list').innerHTML, /No playlists match/);
  f.state.connected = false;
  f.render();
  assert.equal(f.nodes.get('onboard-auth-list-wrap').style.display, 'none');
  assert.equal(f.nodes.get('onboard-playlist-search-wrap').hidden, true);
  assert.equal(f.nodes.get('onboard-playlist-count').textContent, '');
});

test('pending choice stays disabled through filtering and other choices remain selectable', () => {
  const f = fixture();
  f.state.playlists = [playlist(1), playlist(2)];
  f.state.pendingPlaylistId = playlist(2).id;
  f.nodes.get('onboard-playlist-search').value = 'Owner 2';
  f.render();
  assert.equal(f.cards()[0].disabled, true);
  assert.equal(f.cards()[0].classList.contains('is-active'), true);
  f.cards()[0].click();
  assert.equal(f.frames.length, 0);
  f.nodes.get('onboard-playlist-search').value = '';
  f.render();
  assert.equal(f.cards()[0].disabled, false);
  assert.equal(f.cards()[1].disabled, true);
});

test('a failed selection clears pending and progress so its native button can retry', async () => {
  const f = fixture();
  f.state.playlists = [playlist(1)];
  f.context.handleOnboardPrimaryAction = async () => { throw new Error('fixture import failed'); };
  f.render();
  f.cards()[0].click();
  await f.flush();
  assert.equal(f.state.pendingPlaylistId, '');
  assert.equal(f.progressHidden, 1);
  assert.equal(f.cards()[0].disabled, false);
  assert.equal(f.statuses.at(-1), 'fixture import failed');
});

test('a queued selection canceled before its launch never starts an import', async () => {
  const f = fixture();
  f.context.startOnboardSpotifyPlaylistSelection(playlist(1));
  f.state.pendingPlaylistId = '';
  f.context._playlistImportGeneration++;
  await f.flush();
  assert.equal(f.primaryCalls.length, 0);
});

test('editing the link before the queued selection launches releases its pending card and progress', async () => {
  const f = fixture();
  f.state.playlists = [playlist(1)];
  f.context.startOnboardSpotifyPlaylistSelection(playlist(1));
  f.nodes.get('onboard-url').value = playlist(2).url;
  await f.flush();
  assert.equal(f.primaryCalls.length, 0);
  assert.equal(f.state.pendingPlaylistId, '');
  assert.equal(f.progressHidden, 1);
  assert.equal(f.cards()[0].disabled, false);
});

test('late failure from an older selection cannot clear the new pending card or progress', async () => {
  const f = fixture();
  f.state.playlists = [playlist(1), playlist(2)];
  const jobs = [];
  f.context.handleOnboardPrimaryAction = () => {
    f.context._playlistImportGeneration++;
    return new Promise((resolve, reject) => jobs.push({ resolve, reject }));
  };
  f.context.startOnboardSpotifyPlaylistSelection(playlist(1));
  await f.flush();
  f.context.startOnboardSpotifyPlaylistSelection(playlist(2));
  await f.flush();
  jobs[0].reject(new Error('stale failure'));
  await f.flush();
  assert.equal(f.state.pendingPlaylistId, playlist(2).id);
  assert.equal(f.progressHidden, 0);
  assert.ok(!f.statuses.includes('stale failure'));
  jobs[1].resolve(true);
  await f.flush();
  assert.equal(f.state.pendingPlaylistId, '');
  assert.equal(f.progressHidden, 1);
});
