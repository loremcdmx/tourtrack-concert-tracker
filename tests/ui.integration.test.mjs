import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = process.cwd();
const MEDIA_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

let serverProc = null;
let serverPort = 0;
let baseUrl = '';
let browser = null;
let page = null;

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  const hit = candidates.find(candidate => existsSync(candidate));
  if (!hit) throw new Error('Chrome executable not found. Set CHROME_PATH for UI tests.');
  return hit;
}

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(error => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 1000);
      let response;
      try {
        response = await fetch(url, { signal: ctrl.signal });
      } finally {
        clearTimeout(tid);
      }
      if (response.ok) return response;
    } catch (_) {}
    await delay(120);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CdpBrowser {
  static async launch() {
    const chromePath = resolveChromePath();
    const port = await getFreePort();
    const profileDir = mkdtempSync(path.join(os.tmpdir(), 'concerttracker-ui-'));
    const proc = spawn(
      chromePath,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        'about:blank',
      ],
      { stdio: 'ignore' },
    );

    const versionResponse = await waitForHttp(`http://127.0.0.1:${port}/json/version`);
    const version = await versionResponse.json();
    const ws = new WebSocket(version.webSocketDebuggerUrl);
    const browser = new CdpBrowser(proc, ws, profileDir);
    await browser._connect();
    return browser;
  }

  constructor(proc, ws, profileDir) {
    this.proc = proc;
    this.ws = ws;
    this.profileDir = profileDir;
    this.nextId = 0;
    this.pending = new Map();
  }

  async _connect() {
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
    };
    this.ws.onclose = () => {
      const error = new Error('Chrome DevTools WebSocket closed.');
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(error);
      }
      this.pending.clear();
    };

    await new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      const timeout = setTimeout(() => reject(new Error('Timed out connecting to Chrome DevTools WebSocket.')), 10000);
      this.ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      this.ws.onerror = error => {
        clearTimeout(timeout);
        reject(error);
      };
    });
  }

  send(method, params = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for CDP method ${method}.`));
      }, 10000);
      this.pending.set(id, { resolve, reject, timeout });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async newPage(url, { pinnedPlaylistOnly = false } = {}) {
    const target = await this.send('Target.createTarget', { url: 'about:blank' });
    const attached = await this.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    const page = new CdpPage(this, target.targetId, attached.sessionId);
    await page.enable();
    if (pinnedPlaylistOnly) {
      await this.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(() => {
          let config;
          Object.defineProperty(window, '__SERVER_CONFIG__', {
            configurable: true,
            get: () => config,
            set: value => { config = { ...value, pinnedPlaylistOnly: true }; },
          });
        })();`,
      }, page.sessionId);
    }
    await page.navigate(url);
    return page;
  }

  async close() {
    try { this.ws.close(); } catch (_) {}
    if (this.proc && !this.proc.killed) {
      this.proc.kill('SIGTERM');
      await delay(250);
      if (!this.proc.killed) this.proc.kill('SIGKILL');
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        rmSync(this.profileDir, { recursive: true, force: true });
        return;
      } catch (_) {
        await delay(150);
      }
    }
  }
}

class CdpPage {
  constructor(browser, targetId, sessionId) {
    this.browser = browser;
    this.targetId = targetId;
    this.sessionId = sessionId;
  }

  async enable() {
    await this.browser.send('Runtime.enable', {}, this.sessionId);
    await this.browser.send('Page.enable', {}, this.sessionId);
    await this.browser.send('Network.enable', {}, this.sessionId);
    await this.browser.send('Network.setBypassServiceWorker', { bypass: true }, this.sessionId);
    await this.browser.send('Network.setBlockedURLs', { urls: ['https://*'] }, this.sessionId);
  }

  async navigate(url) {
    await this.browser.send('Page.navigate', { url }, this.sessionId);
    await this.waitFor(
      () =>
        document.readyState === 'complete' &&
        typeof window.renderCalendar === 'function' &&
        typeof window.renderMap === 'function' &&
        typeof window.setScoreFilter === 'function',
      { timeoutMs: 15000 },
    );
  }

  async evaluate(fn, ...args) {
    const expression =
      typeof fn === 'string'
        ? fn
        : `(${fn.toString()})(...${JSON.stringify(args)})`;
    const result = await this.browser.send(
      'Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true },
      this.sessionId,
    );
    if (result.exceptionDetails) {
      const exception =
        result.exceptionDetails.exception?.description ||
        result.exceptionDetails.text ||
        'Page evaluation failed.';
      throw new Error(exception);
    }
    return result.result?.value;
  }

  async waitFor(fn, { timeoutMs = 5000, intervalMs = 80 } = {}) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const value = await this.evaluate(fn);
        if (value) return value;
      } catch (_) {}
      await delay(intervalMs);
    }
    throw new Error('Timed out waiting for page condition.');
  }

  async close() {
    await this.browser.send('Target.closeTarget', { targetId: this.targetId });
  }
}

function isoOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function makeConcert(artist, daysFromNow, venue, city, country, lat, lng, extra = {}) {
  return {
    artist,
    id: extra.id || `${artist.toLowerCase().replace(/\s+/g, '-')}-${daysFromNow}`,
    date: isoOffset(daysFromNow),
    venue,
    city,
    country,
    lat,
    lng,
    url: extra.url || `https://tickets.example/${artist.toLowerCase().replace(/\s+/g, '-')}`,
    eventName: extra.eventName || `${artist} Live`,
    state: extra.state || '',
  };
}

function makeFestival(name, daysFromNow, city, country, lat, lng, extra = {}) {
  const matched = (extra.matched || []).map(item => ({
    artist: item.artist,
    plays: Number(item.plays || 0),
    weight: Number(item.weight || item.plays || 1),
  }));
  return {
    id: extra.id || `${name.toLowerCase().replace(/\s+/g, '-')}-${daysFromNow}`,
    name,
    date: isoOffset(daysFromNow),
    endDate: extra.endDate || isoOffset(daysFromNow + 2),
    venue: extra.venue || `${name} Grounds`,
    city,
    country,
    lat,
    lng,
    score: Number(extra.score || 0),
    matched,
    lineup: extra.lineup || matched.map(item => item.artist),
    linkedShows: Number(extra.linkedShows || 0),
    url: extra.url || `https://tickets.example/${name.toLowerCase().replace(/\s+/g, '-')}`,
    imageUrl: extra.imageUrl || '',
  };
}

function installFixture(fixture) {
  const sourceConcerts = (fixture.concerts || []).map(item => ({ ...item }));
  const sourceFestivals = (fixture.festivals || []).map(item => ({
    ...item,
    matched: (item.matched || []).map(match => ({ ...match })),
    lineup: [...(item.lineup || [])],
  }));

  window.open = () => ({ closed: false });
  openExternalUrl = url => {
    window.__testOpenedUrls.push(String(url || ''));
  };
  if (!window.__testOriginalFetchArtistMedia && typeof fetchArtistMedia === 'function') {
    window.__testOriginalFetchArtistMedia = fetchArtistMedia;
  }
  if (typeof fetchArtistMedia === 'function') {
    fetchArtistMedia = async artist => {
      const cached = getCachedArtistMedia(artist);
      return cached === undefined ? null : cached;
    };
  }

  localStorage.clear();
  window.__testOpenedUrls = [];
  window._scanActive = false;

  API_KEY = '';
  ARTISTS = [...(fixture.artists || [])];
  TRACKED_ARTISTS = [...(fixture.trackedArtists || fixture.artists || [])];
  SCANNED_ARTISTS = [...(fixture.scannedArtists || sourceConcerts.map(item => item.artist))];
  ARTIST_PLAYS = { ...(fixture.artistPlays || {}) };
  concerts = sourceConcerts;
  festivals = sourceFestivals;
  hiddenArtists = {};
  favoriteArtists = new Set();
  cacheTimestamp = Date.now();
  const profileName = typeof activeProf !== 'undefined' && activeProf ? activeProf : 'Main';
  if (typeof setArtistTrackState === 'function') {
    setArtistTrackState({ ...(fixture.artistTracks || {}) }, fixture.playlistMeta || null, profileName);
  } else {
    ARTIST_TRACKS = { ...(fixture.artistTracks || {}) };
    SPOTIFY_PLAYLIST_META = fixture.playlistMeta || null;
  }

  calGeoFilter = new Set();
  calGeoExpanded = null;
  countryMode = 'world';
  includeCountries = new Set();
  excludeCountries = new Set();
  geoPreset = 'all';
  geoNoUSA = false;
  geoNoCA = false;
  geoNoGB = false;
  dateFilter = 'all';
  showShows = true;
  showFests = true;
  calView = 'all';
  mxSort = 'date';

  mapTypeFilter = 'both';
  mapScoreFilter = 0;
  mapDateMode = 'all';
  mapDateFrom = '';
  mapDateTo = '';
  showMapTours = true;
  showMapFests = true;
  showPossibleDupes = false;
  showFavOnly = false;
  showUnrankedFests = true;
  artistPreset = 'all';
  artistSort = 'list';
  festSort = 'score';
  focusedArtist = null;
  focusedFest = null;
  focusedConcertKey = '';
  artistColors = {};
  colorIdx = 0;
  allTourData = {};

  applyDateFilterValue('all');
  applyScoreFilterLevel(0);
  _syncGeoButtons();
  closeFestDetail?.();
  closeArtistDetail?.();
  document.getElementById('focus-overlay')?.style?.setProperty('display', 'none');
  document.getElementById('map-reset')?.style?.setProperty('display', 'none');

  buildCalChips();
  renderCalendar();
  renderMap({ smartFit: false });
  buildSidebar();

  return {
    concerts: concerts.length,
    festivals: festivals.length,
  };
}

async function settleUi(pageRef, extraMs = 120) {
  await pageRef.evaluate(
    async waitMs => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await new Promise(resolve => setTimeout(resolve, waitMs));
      return true;
    },
    extraMs,
  );
}

async function setViewport(pageRef, width, height) {
  await pageRef.browser.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: false,
  }, pageRef.sessionId);
  await settleUi(pageRef);
}

function workspaceLayoutSnapshot() {
  const panel = selector => {
    const element = document.querySelector(selector);
    const bounds = element.getBoundingClientRect();
    return {
      visible: getComputedStyle(element).display !== 'none' && bounds.width > 0 && bounds.height > 0,
      left: bounds.left, right: bounds.right, bottom: bounds.bottom,
      width: bounds.width, height: bounds.height,
    };
  };
  return {
    view: document.body.dataset.workspaceView,
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    agenda: panel('.cal-panel'),
    map: panel('.map-panel'),
    controls: [...document.querySelectorAll('button[data-workspace-view]')].map(button => ({
      view: button.dataset.workspaceView,
      tag: button.tagName,
      pressed: button.getAttribute('aria-pressed'),
    })),
  };
}

before(async () => {
  serverPort = await getFreePort();
  baseUrl = `http://127.0.0.1:${serverPort}`;
  serverProc = spawn(process.execPath, ['tests/offline-server.cjs'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(serverPort) },
    stdio: 'ignore',
  });
  await waitForHttp(`${baseUrl}/api/health`);
  browser = await CdpBrowser.launch();
});

after(async () => {
  if (page) {
    await page.close();
    page = null;
  }
  if (browser) {
    await browser.close();
    browser = null;
  }
  if (serverProc && !serverProc.killed) {
    serverProc.kill('SIGTERM');
    await delay(250);
    if (!serverProc.killed) serverProc.kill('SIGKILL');
  }
});

beforeEach(async context => {
  // Only the explicit legacy baseline gets the product-lock flag.
  page = await browser.newPage(baseUrl, { pinnedPlaylistOnly: context.name.startsWith('scenario A ') });
});

afterEach(async () => {
  if (page) {
    await page.close();
    page = null;
  }
});

test('scenario A locks onboarding to the pinned playlist and hides multi-user chrome', { concurrency: false }, async () => {
  const state = await page.evaluate(() => ({
    scenario: isScenarioAProductMode(),
    bodyClass: document.body.classList.contains('scenario-a'),
    profileBarDisplay: getComputedStyle(document.querySelector('.prof-bar')).display,
    spotifyBtnDisplay: getComputedStyle(document.getElementById('spotify-auth-btn')).display,
    matchTabDisplay: getComputedStyle(document.getElementById('tab-match')).display,
    floatMatchDisplay: getComputedStyle(document.getElementById('tab-match-float')).display,
    onboardUrl: document.getElementById('onboard-url')?.value || '',
    onboardReadonly: !!document.getElementById('onboard-url')?.readOnly,
    settingsUrl: document.getElementById('sp-playlist-url')?.value || '',
    settingsReadonly: !!document.getElementById('sp-playlist-url')?.readOnly,
    title: document.getElementById('onboard-main-title')?.textContent?.trim() || '',
    hint: document.getElementById('onboard-mintracks-hint')?.textContent?.trim() || '',
    button: document.getElementById('onboard-btn')?.textContent?.trim() || '',
  }));

  assert.equal(state.scenario, true);
  assert.equal(state.bodyClass, true);
  assert.equal(state.profileBarDisplay, 'none');
  assert.equal(state.spotifyBtnDisplay, 'none');
  assert.equal(state.matchTabDisplay, 'none');
  assert.equal(state.floatMatchDisplay, 'none');
  assert.equal(state.onboardUrl, 'https://open.spotify.com/playlist/0lXmCRl0wc26aSdwfgIAwQ');
  assert.equal(state.onboardReadonly, true);
  assert.equal(state.settingsUrl, 'https://open.spotify.com/playlist/0lXmCRl0wc26aSdwfgIAwQ');
  assert.equal(state.settingsReadonly, true);
  assert.match(state.title, /pinned playlist/i);
  assert.equal(state.hint, '384 of 2477 artists shown (>=4 repeats)');
  assert.equal(state.button, 'Open playlist');
});

test('mobile agenda occupies the workspace without a second map pane or horizontal overflow', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  await page.evaluate(installFixture, {
    artists: ['Atlas'], artistPlays: { atlas: 12 },
    concerts: [makeConcert('Atlas', 4, 'A venue with a deliberately long name', 'Berlin', 'DE', 52.52, 13.405)],
  });
  await page.evaluate(() => {
    hideOnboard();
    document.querySelector('[data-workspace-view="agenda"]').click();
  });
  await settleUi(page);
  const result = await page.evaluate(workspaceLayoutSnapshot);
  assert.equal(result.view, 'agenda');
  assert.equal(result.agenda.visible, true);
  assert.equal(result.map.visible, false);
  assert.ok(result.agenda.width >= result.width - 32);
  assert.ok(result.agenda.height > result.height / 2);
  assert.ok(result.agenda.left >= -1 && result.agenda.right <= result.width + 1);
  assert.ok(result.agenda.bottom <= result.height + 1);
  assert.ok(result.scrollWidth <= result.width + 1);
  assert.deepEqual(result.controls, [
    { view: 'agenda', tag: 'BUTTON', pressed: 'true' },
    { view: 'map', tag: 'BUTTON', pressed: 'false' },
  ]);
});

test('mobile workspace buttons support keyboard activation and resize Leaflet to the visible map', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  await page.evaluate(installFixture, {
    artists: ['Atlas'], artistPlays: { atlas: 12 },
    concerts: [makeConcert('Atlas', 4, 'Forum', 'Berlin', 'DE', 52.52, 13.405)],
  });
  await page.evaluate(() => {
    hideOnboard();
    setWorkspaceView('agenda');
    document.querySelector('[data-workspace-view="map"]').focus();
  });
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32,
  }, page.sessionId);
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32,
  }, page.sessionId);
  await settleUi(page, 180);
  const result = await page.evaluate(workspaceLayoutSnapshot);
  const mapSize = await page.evaluate(() => {
    const element = document.getElementById('map');
    const size = lmap.getSize();
    return { width: size.x, height: size.y, clientWidth: element.clientWidth, clientHeight: element.clientHeight };
  });
  assert.equal(result.view, 'map');
  assert.equal(result.agenda.visible, false);
  assert.equal(result.map.visible, true);
  assert.ok(result.map.width >= result.width - 32);
  assert.ok(result.map.height > result.height / 2);
  assert.ok(result.map.left >= -1 && result.map.right <= result.width + 1);
  assert.ok(result.map.bottom <= result.height + 1);
  assert.ok(result.scrollWidth <= result.width + 1);
  assert.deepEqual(result.controls, [
    { view: 'agenda', tag: 'BUTTON', pressed: 'false' },
    { view: 'map', tag: 'BUTTON', pressed: 'true' },
  ]);
  assert.equal(mapSize.width, mapSize.clientWidth);
  assert.equal(mapSize.height, mapSize.clientHeight);
  assert.ok(mapSize.width > 0 && mapSize.height > 0);
});

test('first opening a mobile map fits the events after its hidden viewport becomes visible', { concurrency: false }, async () => {
  await setViewport(page, 390, 844);
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon'], artistPlays: { atlas: 12, beacon: 9 },
    concerts: [
      makeConcert('Atlas', 3, 'Forum', 'Berlin', 'DE', 52.52, 13.405),
      makeConcert('Beacon', 18, 'Auditorio', 'Mexico City', 'MX', 19.4326, -99.1332),
    ],
  });
  const before = await page.evaluate(() => {
    setWorkspaceView('agenda');
    _mapFirstFit = false;
    lmap.invalidateSize({pan:false});
    renderMap();
    return _mapFirstFit;
  });
  assert.equal(before, false);
  await page.evaluate(() => setWorkspaceView('map'));
  await settleUi(page, 180);
  const after = await page.evaluate(() => ({
    fitted: _mapFirstFit,
    berlin: lmap.getBounds().contains([52.52, 13.405]),
    mexico: lmap.getBounds().contains([19.4326, -99.1332]),
  }));
  assert.deepEqual(after, { fitted:true, berlin:true, mexico:true });
});

test('mobile filters collapse accessibly and retain the selected date filter when switching views', { concurrency: false }, async () => {
  await setViewport(page, 390, 844);
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon'], artistPlays: { atlas: 12, beacon: 9 },
    concerts: [
      makeConcert('Atlas', 3, 'Forum', 'Berlin', 'DE', 52.52, 13.405),
      makeConcert('Beacon', 18, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
  });
  await page.evaluate(() => { hideOnboard(); setWorkspaceView('agenda'); });
  const collapsed = await page.evaluate(() => {
    const toggle = document.getElementById('calendar-filters-toggle');
    const toolbar = document.querySelector('.cal-toolbar');
    return {
      tag: toggle.tagName,
      expanded: toggle.getAttribute('aria-expanded'),
      controlsToolbar: document.getElementById(toggle.getAttribute('aria-controls')) === toolbar,
      toolbarVisible: toolbar.getClientRects().length > 0,
      chipVisible: toolbar.querySelector('[data-d="7"]').getClientRects().length > 0,
    };
  });
  assert.deepEqual(collapsed, { tag: 'BUTTON', expanded: 'false', controlsToolbar: true, toolbarVisible: false, chipVisible: false });

  await page.evaluate(() => document.getElementById('calendar-filters-toggle').click());
  const expanded = await page.evaluate(() => ({
    expanded: document.getElementById('calendar-filters-toggle').getAttribute('aria-expanded'),
    toolbarVisible: document.querySelector('.cal-toolbar').getClientRects().length > 0,
  }));
  assert.deepEqual(expanded, { expanded: 'true', toolbarVisible: true });
  await page.evaluate(() => {
    document.querySelector('.cal-toolbar [data-d="7"]').click();
    document.getElementById('calendar-filters-toggle').click();
    document.querySelector('[data-workspace-view="map"]').click();
  });
  await settleUi(page);
  const filtered = await page.evaluate(() => ({
    view: document.body.dataset.workspaceView,
    filter: dateFilter,
    expanded: document.getElementById('calendar-filters-toggle').getAttribute('aria-expanded'),
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(element => (element.firstChild?.textContent || element.textContent || '').trim()),
    mapArtists: Object.keys(allTourData).sort(),
  }));
  assert.deepEqual(filtered, { view: 'map', filter: '7', expanded: 'false', calendarArtists: ['Atlas'], mapArtists: ['Atlas'] });
});

test('resizing from the mobile map to desktop restores both panels without losing results', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  await page.evaluate(installFixture, {
    artists: ['Atlas'], artistPlays: { atlas: 12 },
    concerts: [makeConcert('Atlas', 4, 'Forum', 'Berlin', 'DE', 52.52, 13.405)],
  });
  await page.evaluate(() => { hideOnboard(); setWorkspaceView('map'); });
  await settleUi(page);
  await setViewport(page, 1366, 900);
  const desktop = await page.evaluate(workspaceLayoutSnapshot);
  assert.equal(desktop.agenda.visible, true);
  assert.equal(desktop.map.visible, true);
  assert.ok(desktop.agenda.right <= desktop.map.left + 16);
  assert.ok(desktop.agenda.width >= 280 && desktop.map.width >= 500);
  assert.ok(desktop.scrollWidth <= desktop.width + 1);
  const retained = await page.evaluate(() => ({
    rows: document.querySelectorAll('#cal-body .ev-row').length,
    mapArtists: Object.keys(allTourData),
    filter: dateFilter,
  }));
  assert.deepEqual(retained, { rows: 1, mapArtists: ['Atlas'], filter: 'all' });
  await setViewport(page, 375, 812);
  const mobile = await page.evaluate(workspaceLayoutSnapshot);
  assert.equal(mobile.view, 'map');
  assert.equal(mobile.agenda.visible, false);
  assert.equal(mobile.map.visible, true);
  assert.ok(mobile.scrollWidth <= mobile.width + 1);
});

test('scenario A keeps low-frequency cached artists out of calendar and map', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon'],
    trackedArtists: ['Atlas', 'Beacon', 'Cipher'],
    artistPlays: { atlas: 11, beacon: 4, cipher: 1 },
    concerts: [
      makeConcert('Atlas', 4, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Beacon', 6, 'Tempodrom', 'Berlin', 'DE', 52.499, 13.374),
      makeConcert('Cipher', 8, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
  });

  await settleUi(page);

  const result = await page.evaluate(() => ({
    visibleArtists: visibleConcerts().map(item => item.artist).sort(),
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim())
      .filter(Boolean)
      .sort(),
    mapArtists: Object.keys(allTourData).sort(),
  }));

  assert.deepEqual(result.visibleArtists, ['Atlas', 'Beacon']);
  assert.deepEqual(result.calendarArtists, ['Atlas', 'Beacon']);
  assert.deepEqual(result.mapArtists, ['Atlas', 'Beacon']);
});

test('quality filter keeps calendar and map artist sets aligned', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha', 'Bravo', 'Charlie', 'Delta'],
    artistPlays: { alpha: 12, bravo: 6, charlie: 5, delta: 1 },
    concerts: [
      makeConcert('Alpha', 7, 'Roundhouse', 'London', 'GB', 51.543, -0.151),
      makeConcert('Bravo', 9, 'Columbiahalle', 'Berlin', 'DE', 52.486, 13.369),
      makeConcert('Charlie', 11, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
      makeConcert('Delta', 13, 'Ancienne Belgique', 'Brussels', 'BE', 50.847, 4.349),
    ],
  });

  await page.evaluate(() => setScoreFilter(3));
  await settleUi(page);
  await page.waitFor(() =>
    Object.keys(allTourData).length === 2 &&
    document.querySelectorAll('#cal-body .ev-headline .ev-name').length === 2,
  );

  const result = await page.evaluate(() => ({
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim())
      .filter(Boolean)
      .sort(),
    mapArtists: Object.keys(allTourData).sort(),
  }));

  assert.deepEqual(result.calendarArtists, ['Alpha', 'Bravo']);
  assert.deepEqual(result.mapArtists, ['Alpha', 'Bravo']);
});

test('date filter applies to both calendar and map', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon', 'Comet'],
    artistPlays: { atlas: 12, beacon: 9, comet: 7 },
    concerts: [
      makeConcert('Atlas', 3, 'Forum', 'London', 'GB', 51.55, -0.142),
      makeConcert('Beacon', 18, 'Tempodrom', 'Berlin', 'DE', 52.499, 13.374),
      makeConcert('Comet', 48, 'Bataclan', 'Paris', 'FR', 48.863, 2.37),
    ],
  });

  await page.evaluate(() => setDateFilter('7'));
  await settleUi(page);
  await page.waitFor(() =>
    Object.keys(allTourData).length === 1 &&
    document.querySelectorAll('#cal-body .ev-headline .ev-name').length === 1,
  );

  const sevenDay = await page.evaluate(() => ({
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim())
      .filter(Boolean)
      .sort(),
    mapArtists: Object.keys(allTourData).sort(),
  }));
  assert.deepEqual(sevenDay.calendarArtists, ['Atlas']);
  assert.deepEqual(sevenDay.mapArtists, ['Atlas']);

  await page.evaluate(() => setDateFilter('30'));
  await settleUi(page);
  await page.waitFor(() =>
    Object.keys(allTourData).length === 2 &&
    document.querySelectorAll('#cal-body .ev-headline .ev-name').length === 2,
  );

  const thirtyDay = await page.evaluate(() => ({
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim())
      .filter(Boolean)
      .sort(),
    mapArtists: Object.keys(allTourData).sort(),
  }));
  assert.deepEqual(thirtyDay.calendarArtists, ['Atlas', 'Beacon']);
  assert.deepEqual(thirtyDay.mapArtists, ['Atlas', 'Beacon']);
});

test('an ongoing festival stays visible in the calendar, map and festival sidebar', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha'],
    artistPlays: { alpha: 12 },
    festivals: [
      makeFestival('OngoingFest', -2, 'Berlin', 'DE', 52.52, 13.405, {
        id: 'ongoing-fest', endDate: isoOffset(2), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('ExpiredFest', -5, 'London', 'GB', 51.5074, -0.1278, {
        id: 'expired-fest', endDate: isoOffset(-1), score: 76, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('LaterFest', 12, 'Paris', 'FR', 48.8566, 2.3522, {
        id: 'later-fest', score: 71, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
    ],
  });
  await page.evaluate(() => {
    setTab('fests');
    setDateFilter('7');
  });
  await settleUi(page);

  const result = await page.evaluate(() => ({
    calendarFestivals: [...document.querySelectorAll('#cal-body .ev-row .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim()),
    mapLocations: festMarkers.map(marker => {
      const point = marker.getLatLng();
      return [point.lat, point.lng];
    }),
    sidebarIds: [...document.querySelectorAll('#fest-cards .fcard')].map(card => card.dataset.id),
  }));
  assert.deepEqual(result.calendarFestivals, ['OngoingFest']);
  assert.deepEqual(result.mapLocations, [[52.52, 13.405]]);
  assert.deepEqual(result.sidebarIds, ['ongoing-fest']);
});

test('custom ranges keep overlapping festivals aligned across calendar, map and sidebar, including the past', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha'],
    artistPlays: { alpha: 12 },
    festivals: [
      makeFestival('FutureOverlapFest', 2, 'Berlin', 'DE', 52.52, 13.405, {
        id: 'future-overlap', endDate: isoOffset(6), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('PastOverlapFest', -12, 'London', 'GB', 51.5074, -0.1278, {
        id: 'past-overlap', endDate: isoOffset(-6), score: 76, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('NonOverlappingFest', 11, 'Paris', 'FR', 48.8566, 2.3522, {
        id: 'non-overlapping', score: 71, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('OlderFest', -20, 'Barcelona', 'ES', 41.387, 2.17, {
        id: 'older-fest', endDate: isoOffset(-11), score: 65, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
    ],
  });
  for (const scenario of [
    { from: isoOffset(4), to: isoOffset(8), name: 'FutureOverlapFest', id: 'future-overlap', location: [52.52, 13.405] },
    { from: isoOffset(-10), to: isoOffset(-4), name: 'PastOverlapFest', id: 'past-overlap', location: [51.5074, -0.1278] },
  ]) {
    await page.evaluate((from, to) => {
      setTab('fests');
      setDateFilter('range', from, to);
    }, scenario.from, scenario.to);
    await settleUi(page);
    const result = await page.evaluate(() => ({
      calendarFestivals: [...document.querySelectorAll('#cal-body .ev-row .ev-name')]
        .map(el => (el.firstChild?.textContent || el.textContent || '').trim()),
      mapLocations: festMarkers.map(marker => {
        const point = marker.getLatLng();
        return [point.lat, point.lng];
      }),
      sidebarIds: [...document.querySelectorAll('#fest-cards .fcard')].map(card => card.dataset.id),
    }));
    assert.deepEqual(result.calendarFestivals, [scenario.name]);
    assert.deepEqual(result.mapLocations, [scenario.location]);
    assert.deepEqual(result.sidebarIds, [scenario.id]);
  }
});

test('world geo scope keeps non-UK concerts visible in calendar and map', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon', 'Comet', 'Delta', 'Echo'],
    artistPlays: { atlas: 12, beacon: 10, comet: 9, delta: 8, echo: 7 },
    concerts: [
      makeConcert('Atlas', 4, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Beacon', 6, 'Tempodrom', 'Berlin', 'DE', 52.499, 13.374),
      makeConcert('Comet', 8, 'Hollywood Palladium', 'Los Angeles', 'US', 34.098, -118.325),
      makeConcert('Delta', 10, 'Foro Sol', 'Mexico City', 'MX', 19.404, -99.095),
      makeConcert('Echo', 12, 'Zepp Haneda', 'Tokyo', 'JP', 35.548, 139.754),
    ],
  });

  await settleUi(page);
  await page.waitFor(() =>
    Object.keys(allTourData).length === 5 &&
    document.querySelectorAll('#cal-body .ev-headline .ev-name').length === 5,
  );

  const result = await page.evaluate(() => ({
    scope: countryHash(),
    apiCountryParam: apiCountryParam(),
    allowedCountries: ['GB', 'DE', 'US', 'MX', 'JP'].filter(countryAllowed),
    calendarArtists: [...document.querySelectorAll('#cal-body .ev-headline .ev-name')]
      .map(el => (el.firstChild?.textContent || el.textContent || '').trim())
      .filter(Boolean)
      .sort(),
    mapCountries: [...new Set(Object.values(allTourData).flat().map(ev => ev.country))].sort(),
  }));

  assert.equal(result.scope, 'world');
  assert.equal(result.apiCountryParam, '');
  assert.deepEqual(result.allowedCountries, ['GB', 'DE', 'US', 'MX', 'JP']);
  assert.deepEqual(result.calendarArtists, ['Atlas', 'Beacon', 'Comet', 'Delta', 'Echo']);
  assert.deepEqual(result.mapCountries, ['DE', 'GB', 'JP', 'MX', 'US']);
});

test('scenario A migrates legacy UK-only scope back to worldwide', { concurrency: false }, async () => {
  const state = await page.evaluate(() => {
    localStorage.clear();
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('tt_cmode', 'include');
    localStorage.setItem('tt_inc', JSON.stringify(['GB']));
    localStorage.setItem('tt_exc', JSON.stringify([]));
    localStorage.setItem('tt_geo_preset', 'ukie');
    localStorage.setItem('tt_concerts', JSON.stringify([{
      artist: 'Atlas',
      id: 'legacy-gb-only',
      date: today,
      venue: 'Forum',
      city: 'London',
      country: 'GB',
      lat: 51.5074,
      lng: -0.1278,
    }]));
    localStorage.setItem('tt_festivals', JSON.stringify([]));
    localStorage.setItem('tt_scanned_artists', JSON.stringify(['Atlas']));
    localStorage.setItem('tt_cachets', String(Date.now()));

    restore();

    return {
      countryMode,
      includeCountries: [...includeCountries],
      excludeCountries: [...excludeCountries],
      geoPreset,
      concerts: concerts.length,
      festivals: festivals.length,
      scannedArtists: SCANNED_ARTISTS.length,
      cacheTimestamp,
      storedMode: localStorage.getItem('tt_cmode'),
      storedGeoPreset: localStorage.getItem('tt_geo_preset'),
      storedConcerts: localStorage.getItem('tt_concerts'),
    };
  });

  assert.equal(state.countryMode, 'world');
  assert.deepEqual(state.includeCountries, []);
  assert.deepEqual(state.excludeCountries, []);
  assert.equal(state.geoPreset, 'all');
  assert.equal(state.concerts, 0);
  assert.equal(state.festivals, 0);
  assert.equal(state.scannedArtists, 0);
  assert.equal(state.cacheTimestamp, 0);
  assert.equal(state.storedMode, 'world');
  assert.equal(state.storedGeoPreset, 'all');
  assert.equal(state.storedConcerts, '[]');
});

test('scenario A clears legacy UK-only snapshot without a stored scope hash', { concurrency: false }, async () => {
  const state = await page.evaluate(() => {
    localStorage.clear();
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('tt_cmode', 'world');
    localStorage.setItem('tt_inc', JSON.stringify([]));
    localStorage.setItem('tt_exc', JSON.stringify([]));
    localStorage.setItem('tt_geo_preset', 'all');
    localStorage.setItem('tt_concerts', JSON.stringify([{
      artist: 'Atlas',
      id: 'legacy-world-but-gb-only',
      date: today,
      venue: 'Forum',
      city: 'London',
      country: 'GB',
      lat: 51.5074,
      lng: -0.1278,
    }]));
    localStorage.setItem('tt_cachets', String(Date.now()));

    restore();

    return {
      countryMode,
      geoPreset,
      concerts: concerts.length,
      cacheTimestamp,
      storedConcerts: localStorage.getItem('tt_concerts'),
    };
  });

  assert.equal(state.countryMode, 'world');
  assert.equal(state.geoPreset, 'all');
  assert.equal(state.concerts, 0);
  assert.equal(state.cacheTimestamp, 0);
  assert.equal(state.storedConcerts, '[]');
});

test('instant resume ignores artist cache from a different search scope', { concurrency: false }, async () => {
  const state = await page.evaluate(async () => {
    localStorage.clear();
    await DB.clear('artists');
    await DB.delete('meta', 'festivals').catch(() => {});
    countryMode = 'world';
    includeCountries = new Set();
    excludeCountries = new Set();
    geoPreset = 'all';
    ARTISTS = ['Atlas'];
    TRACKED_ARTISTS = ['Atlas'];
    ARTIST_PLAYS = { atlas: 12 };
    concerts = [];
    festivals = [];
    SCANNED_ARTISTS = [];
    cacheTimestamp = 0;

    const today = new Date().toISOString().split('T')[0];
    await DB.put('artists', 'atlas', {
      ts: Date.now(),
      cHash: 'include:GB',
      shows: [{
        artist: 'Atlas',
        id: 'cached-gb-only',
        date: today,
        venue: 'Forum',
        city: 'London',
        country: 'GB',
        lat: 51.5074,
        lng: -0.1278,
      }],
    });
    localStorage.setItem(ONBOARD_CACHE_SUMMARY_KEY, JSON.stringify({
      artistCount: 1,
      concertCount: 1,
      festCount: 0,
      cacheTimestamp: Date.now(),
      latestPlaylistUrl: PINNED_PLAYLIST.url,
      cHash: 'include:GB',
      ts: Date.now(),
    }));

    const info = await checkIDBCache();
    return {
      info,
      summary: localStorage.getItem(ONBOARD_CACHE_SUMMARY_KEY),
    };
  });

  assert.equal(state.info, null);
  assert.equal(state.summary, null);
});

test('cached festival count and instant resume retain ongoing festivals and drop expired ones', { concurrency: false }, async () => {
  const cachedFestivals = [
    makeFestival('CachedOngoingFest', -2, 'Berlin', 'DE', 52.52, 13.405, {
      id: 'cached-ongoing', endDate: isoOffset(2), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
    }),
    makeFestival('CachedExpiredFest', -5, 'London', 'GB', 51.5074, -0.1278, {
      id: 'cached-expired', endDate: isoOffset(-1), score: 76, matched: [{ artist: 'Alpha', plays: 12 }],
    }),
  ];
  await page.evaluate(installFixture, { artists: ['Alpha'], artistPlays: { alpha: 12 } });
  const state = await page.evaluate(async data => {
    await DB.clear('artists');
    await DB.put('artists', 'alpha', { ts: Date.now(), cHash: countryHash(), shows: [] });
    await DB.put('meta', 'festivals', { ts: Date.now(), cHash: countryHash(), ver: FEST_VER, data });
    localStorage.setItem(ONBOARD_CACHE_SUMMARY_KEY, JSON.stringify({
      artistCount: 1,
      concertCount: 0,
      festCount: 2,
      cacheTimestamp: Date.now(),
      latestPlaylistUrl: PINNED_PLAYLIST.url,
      cHash: countryHash(),
      ts: Date.now(),
    }));
    const info = await checkIDBCache();
    await instantResume({ manual: true });
    return {
      festCount: info?.festCount,
      resumedIds: festivals.map(festival => festival.id),
      endDate: festivals[0]?.endDate,
      refreshRunning: Boolean(window._festRefreshRunning),
    };
  }, cachedFestivals);
  assert.equal(state.festCount, 1);
  assert.deepEqual(state.resumedIds, ['cached-ongoing']);
  assert.equal(state.endDate, cachedFestivals[0].endDate);
  assert.equal(state.refreshRunning, false);
});

test('festival-only refresh retains ongoing events and saves a restorable cache', { concurrency: false }, async () => {
  const freshFestival = makeFestival('FreshFest', 7, 'Paris', 'FR', 48.8566, 2.3522, {
    id: 'fresh-fest', score: 80, matched: [{ artist: 'Alpha', plays: 12 }],
  });
  await page.evaluate(installFixture, {
    artists: ['Alpha'], artistPlays: { alpha: 12 },
    festivals: [
      makeFestival('OngoingFest', -2, 'Berlin', 'DE', 52.52, 13.405, {
        id: 'ongoing-fest', endDate: isoOffset(2), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('ExpiredFest', -5, 'London', 'GB', 51.5074, -0.1278, {
        id: 'expired-fest', endDate: isoOffset(-1), score: 76, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('StaleFutureFest', 30, 'Madrid', 'ES', 40.41, -3.7, { id: 'stale-future' }),
    ],
  });
  const result = await page.evaluate(async fresh => {
    const originalFetch = fetchFestivalsData;
    fetchFestivalsData = async () => { festivals.push(fresh); };
    API_KEY = 'offline-ui-test';
    try {
      await rescanFestsOnly();
      const cache = await DB.get('meta', 'festivals');
      return {
        ids: festivals.map(f => f.id).sort(),
        cacheIds: cache.data.map(f => f.id).sort(),
        scopeMatches: cache.cHash === countryHash(),
        versionMatches: cache.ver === FEST_VER,
      };
    } finally {
      fetchFestivalsData = originalFetch;
    }
  }, freshFestival);
  assert.deepEqual(result.ids, ['fresh-fest', 'ongoing-fest']);
  assert.deepEqual(result.cacheIds, result.ids);
  assert.equal(result.scopeMatches, true);
  assert.equal(result.versionMatches, true);
});

test('a full refresh retains ongoing festivals without carrying them into a changed search scope', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha'], artistPlays: { alpha: 12 },
    festivals: [
      makeFestival('OngoingFest', -2, 'Berlin', 'DE', 52.52, 13.405, {
        id: 'ongoing-fest', endDate: isoOffset(2), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('ExpiredFest', -5, 'London', 'GB', 51.5074, -0.1278, {
        id: 'expired-fest', endDate: isoOffset(-1), score: 76, matched: [{ artist: 'Alpha', plays: 12 }],
      }),
      makeFestival('StaleFutureFest', 30, 'Madrid', 'ES', 40.41, -3.7, { id: 'stale-future' }),
    ],
  });
  const result = await page.evaluate(() => {
    const scan = beginScanRun(true);
    const initial = festivals.map(f => f.id);
    const restored = mergeOngoingFestivals(scan.ongoingFestivalSnapshot, []).map(f => f.id);
    countryMode = 'include';
    includeCountries = new Set(['FR']);
    const changedScope = mergeOngoingFestivals(scan.ongoingFestivalSnapshot, []).map(f => f.id);
    window._scanActive = false;
    return { initial, restored, changedScope };
  });
  assert.deepEqual(result.initial, ['ongoing-fest']);
  assert.deepEqual(result.restored, ['ongoing-fest']);
  assert.deepEqual(result.changedScope, []);
});

for (const action of ['importFestivalsOnly', 'rescanFestsOnly']) {
  test(`${action} marks stopped discovery as partial instead of a fresh complete cache`, { concurrency: false }, async () => {
    await page.evaluate(installFixture, {
      artists: ['Alpha'], artistPlays: { alpha: 12 },
      festivals: [makeFestival('OngoingFest', -2, 'Berlin', 'DE', 52.52, 13.405, {
        id: 'ongoing-fest', endDate: isoOffset(2), score: 82, matched: [{ artist: 'Alpha', plays: 12 }],
      })],
    });
    const result = await page.evaluate(async actionName => {
      await DB.put('meta', 'festivals', {
        data: festivals, ts: Date.now(), cHash: countryHash(), ver: FEST_VER,
      });
      const originalFetch = fetchFestivalsData;
      fetchFestivalsData = async () => { scanAborted = true; };
      API_KEY = 'offline-ui-test';
      try {
        await window[actionName]();
        const cache = await DB.get('meta', 'festivals');
        return {
          cacheTimestamp: cache.ts,
          acceptsAsFresh: (Date.now() - cache.ts) < TTL_FEST,
          retained: cache.data.map(f => f.id),
          status: document.getElementById('hd-msg').textContent,
        };
      } finally {
        fetchFestivalsData = originalFetch;
      }
    }, action);
    assert.equal(result.cacheTimestamp, 0);
    assert.equal(result.acceptsAsFresh, false);
    assert.deepEqual(result.retained, ['ongoing-fest']);
    assert.match(result.status, /stopped.*partial/i);
  });
}

test('festival rows open the overlay and ticket links use openExternalUrl', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha'],
    artistPlays: { alpha: 12 },
    festivals: [
      makeFestival('AlphaFest', 14, 'Barcelona', 'ES', 41.387, 2.17, {
        score: 82,
        matched: [{ artist: 'Alpha', plays: 12 }],
        lineup: ['Alpha', 'Guest One', 'Guest Two'],
        linkedShows: 1,
      }),
    ],
  });
  await settleUi(page);

  const rowState = await page.evaluate(() => {
    const row = document.querySelector('#cal-body .ev-row.is-clickable');
    return {
      exists: !!row,
      clickable: row?.classList.contains('is-clickable') || false,
      hasClickHandler: typeof row?.onclick === 'function',
      label: row?.querySelector('.ev-name')?.childNodes?.[0]?.textContent?.trim() || '',
    };
  });

  assert.equal(rowState.exists, true);
  assert.equal(rowState.clickable, true);
  assert.equal(rowState.hasClickHandler, true);
  assert.equal(rowState.label, 'AlphaFest');

  await page.evaluate(() => openFestDetail(festivals[0].id));
  await page.waitFor(() => document.getElementById('fd-overlay').classList.contains('open'));

  const overlayState = await page.evaluate(() => ({
    open: document.getElementById('fd-overlay').classList.contains('open'),
    title: document.querySelector('.fd-name')?.textContent || '',
  }));

  assert.equal(overlayState.open, true);
  assert.equal(overlayState.title, 'AlphaFest');

  const openedUrls = await page.evaluate(() => {
    const link = document.querySelector('.fd-tkt-btn');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return [...window.__testOpenedUrls];
  });

  assert.deepEqual(openedUrls, ['https://tickets.example/alphafest']);
});

test('concert rows focus the selected artist', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Nova'],
    artistPlays: { nova: 10 },
    concerts: [makeConcert('Nova', 6, 'Ancienne Belgique', 'Brussels', 'BE', 50.847, 4.349)],
  });

  const focusState = await page.evaluate(() => {
    const row = document.querySelector('#cal-body .ev-row.is-clickable');
    row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return {
      focusedArtist,
      focusName: document.getElementById('focus-name')?.textContent || '',
      overlayDisplay: getComputedStyle(document.getElementById('focus-overlay')).display,
    };
  });

  assert.equal(focusState.focusedArtist, 'Nova');
  assert.equal(focusState.focusName, 'Nova');
  assert.notEqual(focusState.overlayDisplay, 'none');
});

test('Enter on a concert row opens its map on mobile', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  await page.evaluate(installFixture, {
    artists: ['Nova'], artistPlays: { nova: 10 },
    concerts: [
      makeConcert('Nova', 3, 'Roundhouse', 'London', 'GB', 51.54, -0.15),
      makeConcert('Nova', 6, 'Ancienne Belgique', 'Brussels', 'BE', 50.847, 4.349, { id: 'nova-keyboard-show' }),
    ],
  });
  const semantics = await page.evaluate(() => {
    hideOnboard();
    setWorkspaceView('agenda');
    const row = [...document.querySelectorAll('#cal-body .ev-row.is-clickable')].find(row => row.querySelector('.ev-sub strong')?.textContent === 'Ancienne Belgique');
    row.focus();
    return { role: row.getAttribute('role'), tabIndex: row.tabIndex, focused: document.activeElement === row };
  });
  assert.deepEqual(semantics, { role: 'button', tabIndex: 0, focused: true });
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13,
  }, page.sessionId);
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13,
  }, page.sessionId);
  await settleUi(page);
  const result = await page.evaluate(() => ({
    view: document.body.dataset.workspaceView,
    mapVisible: getComputedStyle(document.querySelector('.map-panel')).display !== 'none',
    focusedArtist,
    activeVenue: document.querySelector('#focus-list .fshow.active .fshow-venue')?.textContent,
    artistDetailOpen: document.getElementById('ad-overlay').classList.contains('open'),
  }));
  assert.deepEqual(result, { view: 'map', mapVisible: true, focusedArtist: 'Nova', activeVenue: 'Ancienne Belgique', artistDetailOpen: false });
});

test('Space on a concert headline opens artist detail without triggering its parent map action', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  await page.evaluate(installFixture, {
    artists: ['Nova'], artistPlays: { nova: 10 },
    concerts: [makeConcert('Nova', 6, 'Ancienne Belgique', 'Brussels', 'BE', 50.847, 4.349)],
  });
  const semantics = await page.evaluate(() => {
    hideOnboard();
    setWorkspaceView('agenda');
    const headline = document.querySelector('#cal-body .ev-row .ev-headline');
    headline.focus();
    return { role: headline.getAttribute('role'), tabIndex: headline.tabIndex, focused: document.activeElement === headline };
  });
  assert.deepEqual(semantics, { role: 'button', tabIndex: 0, focused: true });
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32,
  }, page.sessionId);
  await page.browser.send('Input.dispatchKeyEvent', {
    type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32,
  }, page.sessionId);
  await page.waitFor(() => document.getElementById('ad-overlay').classList.contains('open'));
  const result = await page.evaluate(() => ({
    view: document.body.dataset.workspaceView,
    artistDetailOpen: document.getElementById('ad-overlay').classList.contains('open'),
    detailArtist: document.querySelector('#ad-body .ad-name')?.textContent.trim(),
    focusedArtist,
    focusedConcertKey,
  }));
  assert.deepEqual(result, { view: 'agenda', artistDetailOpen: true, detailArtist: 'Nova', focusedArtist: null, focusedConcertKey: '' });
});

test('artist avatars render cached media when knowledge exists', { concurrency: false }, async () => {
  await page.evaluate(installFixture, { artists: ['Avatar Hero'], artistPlays: { 'avatar hero': 9 } });

  const avatarState = await page.evaluate(
    async mediaUrl => {
      const artist = 'Avatar Hero';
      const key = artistMediaKey(artist);
      cacheArtistKnowledgeRecord(
        key,
        normalizeArtistKnowledgeRecord(
          {
            artist,
            media: {
              source: 'test',
              matchName: artist,
              fetchedAt: Date.now(),
              miss: false,
              images: { thumb: mediaUrl, large: mediaUrl, xl: mediaUrl },
            },
          },
          artist,
        ),
      );
      const avatar = createArtistAvatar(artist, { size: 'feed' });
      document.body.appendChild(avatar);
      const img = avatar.querySelector('img');
      if (!(img.complete && img.naturalWidth > 0)) {
        await new Promise(resolve => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 1200);
        });
      }
      await new Promise(resolve => setTimeout(resolve, 260));
      return {
        hasImage: avatar.classList.contains('has-image'),
        naturalWidth: img.naturalWidth,
        opacity: Number(getComputedStyle(img).opacity),
        fallbackOpacity: Number(getComputedStyle(avatar.querySelector('.artist-avatar-fallback')).opacity),
      };
    },
    MEDIA_PIXEL,
  );

  assert.equal(avatarState.hasImage, true);
  assert.ok(avatarState.naturalWidth > 0);
  assert.ok(avatarState.opacity > 0.95);
  assert.ok(avatarState.fallbackOpacity < 0.05);
});

test('rapid filter updates coalesce into one deferred refresh', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Alpha', 'Bravo', 'Charlie'],
    artistPlays: { alpha: 12, bravo: 6, charlie: 5 },
    concerts: [
      makeConcert('Alpha', 7, 'Roundhouse', 'London', 'GB', 51.543, -0.151),
      makeConcert('Bravo', 9, 'Columbiahalle', 'Berlin', 'DE', 52.486, 13.369),
      makeConcert('Charlie', 11, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
  });

  const result = await page.evaluate(async () => {
    const originalRenderCalendar = window.renderCalendar;
    const originalRefreshFilteredMap = window.refreshFilteredMap;
    const calls = { renderCalendar: 0, refreshFilteredMap: 0 };

    window.renderCalendar = function(...args) {
      calls.renderCalendar += 1;
      return originalRenderCalendar.apply(this, args);
    };
    window.refreshFilteredMap = function(...args) {
      calls.refreshFilteredMap += 1;
      return originalRefreshFilteredMap.apply(this, args);
    };

    setScoreFilter(1);
    setScoreFilter(2);
    setScoreFilter(3);

    const button = document.querySelector('#score-filter-row .plays-chip[data-s="3"]');
    const immediate = {
      ...calls,
      buttonOn: button.classList.contains('on'),
    };

    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await new Promise(resolve => setTimeout(resolve, 100));

    const settled = {
      ...calls,
      buttonOn: button.classList.contains('on'),
    };

    window.renderCalendar = originalRenderCalendar;
    window.refreshFilteredMap = originalRefreshFilteredMap;
    return { immediate, settled };
  });

  assert.deepEqual(result.immediate, {
    renderCalendar: 0,
    refreshFilteredMap: 0,
    buttonOn: true,
  });
  assert.deepEqual(result.settled, {
    renderCalendar: 1,
    refreshFilteredMap: 1,
    buttonOn: true,
  });
});

test('map drag skips closed visible-panel work and makes no tile prefetch', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Drift'],
    artistPlays: { drift: 9 },
    concerts: [
      makeConcert('Drift', 5, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Drift', 11, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
  });

  const result = await page.evaluate(async () => {
    const originalUpdateVisiblePanel = window.updateVisiblePanel;
    const calls = { visible: 0 };
    const mapEl = document.getElementById('map');

    window.updateVisiblePanel = function(...args) {
      calls.visible += 1;
      return originalUpdateVisiblePanel.apply(this, args);
    };

    _visiblePanelOpen = false;
    clearTimeout(_moveTimer);
    clearTimeout(_zRenderTimer);
    await new Promise(resolve => setTimeout(resolve, 260));
    calls.visible = 0;

    lmap.fire('movestart');
    const start = {
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    lmap.fire('move');
    const moving = {
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    lmap.fire('moveend');
    const endImmediate = {
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    await new Promise(resolve => setTimeout(resolve, 260));
    const settled = {
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    window.updateVisiblePanel = originalUpdateVisiblePanel;
    return { start, moving, endImmediate, settled, hasPrefetch: typeof window.scheduleMapTileWarmup === 'function' };
  });

  assert.deepEqual(result.start, { visible: 0, isPanning: true });
  assert.deepEqual(result.moving, { visible: 0, isPanning: true });
  assert.deepEqual(result.endImmediate, { visible: 0, isPanning: false });
  assert.deepEqual(result.settled, { visible: 0, isPanning: false });
  assert.equal(result.hasPrefetch, false);
});

test('renderOverview skips visible-panel scan when the panel is collapsed', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Atlas', 'Beacon'],
    artistPlays: { atlas: 9, beacon: 6 },
    concerts: [
      makeConcert('Atlas', 5, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Atlas', 14, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
      makeConcert('Beacon', 8, 'Tempodrom', 'Berlin', 'DE', 52.499, 13.374),
    ],
  });

  const result = await page.evaluate(async () => {
    const originalUpdateVisiblePanel = window.updateVisiblePanel;
    let calls = 0;
    window.updateVisiblePanel = function(...args) {
      calls += 1;
      return originalUpdateVisiblePanel.apply(this, args);
    };

    _visiblePanelOpen = false;
    const panel = document.getElementById('msb-visible');
    panel.classList.remove('open');
    await new Promise(resolve => setTimeout(resolve, 160));
    calls = 0;

    clearMapLayers();
    renderOverview({ smartFit: false });
    await new Promise(resolve => setTimeout(resolve, 80));

    const badgeText = document.getElementById('msb-visible-count')?.textContent || '';
    const panelDisplay = getComputedStyle(panel).display;
    window.updateVisiblePanel = originalUpdateVisiblePanel;
    return { calls, badgeText, panelDisplay };
  });

  assert.equal(result.calls, 0);
  assert.ok(Number(result.badgeText) >= 1);
  assert.notEqual(result.panelDisplay, 'none');
});

test('renderOverview keeps secondary future shows off the DOM marker path', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Drift'],
    artistPlays: { drift: 9 },
    concerts: [
      makeConcert('Drift', 4, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Drift', 7, 'Roundhouse', 'London', 'GB', 51.5432, -0.1512),
      makeConcert('Drift', 10, 'Brixton Academy', 'London', 'GB', 51.4653, -0.1156),
      makeConcert('Drift', 13, 'Alexandra Palace', 'London', 'GB', 51.5942, -0.1292),
      makeConcert('Drift', 16, 'Eventim Apollo', 'London', 'GB', 51.4907, -0.2254),
    ],
  });

  const result = await page.evaluate(async () => {
    lmap.setView([51.5074, -0.1278], 8, { animate: false });
    clearMapLayers();
    renderOverview({ smartFit: false });
    await new Promise(resolve => setTimeout(resolve, 120));

    return {
      markerLayers: tourMarkers.length,
      domTourMarkers: document.querySelectorAll('.map-tour-marker, .map-tour-dot').length,
      leafletMarkerIcons: document.querySelectorAll('.leaflet-marker-icon').length,
      overlayCanvases: document.querySelectorAll('.leaflet-overlay-pane canvas').length,
    };
  });

  assert.equal(result.markerLayers, 5);
  assert.equal(result.domTourMarkers, 1);
  assert.ok(result.leafletMarkerIcons <= 1);
  assert.ok(result.overlayCanvases >= 1);
});

test('concert feed exposes artist score breakdown for filter tuning', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Delta', 'Atlas', 'Beacon', 'Pulse', 'Quill', 'Rivet', 'Cipher'],
    artistPlays: {
      delta: 4,
      atlas: 7,
      beacon: 1,
      pulse: 3,
      quill: 2,
      rivet: 2,
    },
    concerts: [
      makeConcert('Delta', 3, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Atlas', 5, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
      makeConcert('Beacon', 7, 'Tempodrom', 'Berlin', 'DE', 52.499, 13.374),
      makeConcert('Cipher', 9, 'Ancienne Belgique', 'Brussels', 'BE', 50.8478, 4.3499),
    ],
  });

  const result = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.ev-row')].map(row => ({
      artist: row.querySelector('.ev-name')?.childNodes?.[0]?.textContent?.trim() || '',
      chips: [...row.querySelectorAll('.ev-score-chip')].map(el => el.textContent.trim()),
      title: row.querySelector('.ev-score-row')?.getAttribute('title') || '',
    }));
    return {
      delta: artistScoreBreakdown('Delta'),
      atlas: artistScoreBreakdown('Atlas'),
      beacon: artistScoreBreakdown('Beacon'),
      cipher: artistScoreBreakdown('Cipher'),
      rows,
    };
  });

  assert.equal(result.delta.label, 'High+');
  assert.equal(result.atlas.label, 'High+');
  assert.equal(result.beacon.label, 'Low+');
  assert.equal(result.cipher.label, 'Low+');
  assert.equal(result.delta.chips[2].text, 'top 17%');

  const deltaRow = result.rows.find(row => row.artist === 'Delta');
  const cipherRow = result.rows.find(row => row.artist === 'Cipher');
  assert.ok(deltaRow);
  assert.deepEqual(deltaRow.chips, ['High+', '4 plays', 'top 17%']);
  assert.match(deltaRow.title, /positive rank 1\/6/);
  assert.ok(cipherRow);
  assert.deepEqual(cipherRow.chips, ['Low+', 'tracked']);
});

test('clicking a concert artist opens playlist detail with preview and parrot score', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Nova'],
    artistPlays: { nova: 8 },
    concerts: [
      makeConcert('Nova', 5, 'Roundhouse', 'London', 'GB', 51.5432, -0.1512, {
        eventName: 'Nova World Tour',
      }),
      makeConcert('Nova', 9, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
    artistTracks: {
      nova: {
        artist: 'Nova',
        totalTrackHits: 3,
        uniqueTrackCount: 2,
        tracks: [
          {
            id: 'nova-night-drive',
            name: 'Night Drive',
            previewUrl: 'https://cdn.example.test/night-drive.mp3',
            spotifyUrl: 'https://open.spotify.com/track/night-drive',
            durationMs: 213000,
            albumName: 'Afterlight',
            count: 2,
          },
          {
            id: 'nova-halo',
            name: 'Halo Static',
            previewUrl: '',
            spotifyUrl: 'https://open.spotify.com/track/halo-static',
            durationMs: 187000,
            albumName: 'Afterlight',
            count: 1,
          },
        ],
      },
    },
    playlistMeta: {
      id: 'playlist-1',
      name: 'Main Rotation',
      spotifyUrl: 'https://open.spotify.com/playlist/main-rotation',
      ownerName: 'Codex',
      trackCount: 42,
    },
  });

  await page.evaluate(() => {
    window.__audioStubState = { playCalls: 0, pauseCalls: 0, lastSrc: '' };
    window.Audio = function AudioStub() {
      this.preload = 'none';
      this.currentTime = 0;
      this.src = '';
      this.addEventListener = () => {};
      this.pause = () => {
        window.__audioStubState.pauseCalls += 1;
        this.currentTime = 0;
      };
      this.play = () => {
        window.__audioStubState.playCalls += 1;
        window.__audioStubState.lastSrc = this.src;
        return Promise.resolve();
      };
    };
  });

  await page.evaluate(() => {
    document.querySelector('.ev-row .ev-headline')?.click();
    return true;
  });
  await page.waitFor(() => document.getElementById('ad-overlay')?.classList.contains('open'));
  await settleUi(page, 80);

  await page.evaluate(() => {
    document.querySelector('.ad-track-btn.is-preview:not([disabled])')?.click();
    return true;
  });
  await settleUi(page, 40);

  const detail = await page.evaluate(() => ({
    open: document.getElementById('ad-overlay')?.classList.contains('open') || false,
    artist: document.querySelector('#ad-body .ad-name')?.textContent?.trim() || '',
    sub: document.querySelector('#ad-body .ad-sub')?.textContent?.trim() || '',
    playlistMeta: document.querySelector('#ad-body .ad-panel-meta')?.textContent?.trim() || '',
    tracks: [...document.querySelectorAll('#ad-body .ad-track-name')].map(el => el.textContent.trim()),
    previewLabels: [...document.querySelectorAll('#ad-body .ad-track-btn.is-preview')].map(el => ({
      text: el.textContent.trim(),
      disabled: el.disabled,
    })),
    metricLabels: [...document.querySelectorAll('#ad-body .ad-metric-label')].map(el => el.textContent.trim()),
    metricValues: [...document.querySelectorAll('#ad-body .ad-metric-value')].map(el => el.textContent.trim()),
    scoreNote: document.querySelector('#ad-body .ad-score-note')?.textContent?.trim() || '',
    chips: [...document.querySelectorAll('#ad-body .ad-chip')].map(el => el.textContent.trim()),
    audioStub: window.__audioStubState,
  }));

  assert.equal(detail.open, true);
  assert.equal(detail.artist, 'Nova');
  assert.match(detail.sub, /Main Rotation/);
  assert.match(detail.playlistMeta, /3 hits across 2 saved tracks/i);
  assert.deepEqual(detail.tracks, ['Night Drive', 'Halo Static', 'Roundhouse', 'Paradiso']);
  assert.deepEqual(detail.previewLabels, [
    { text: 'Pause', disabled: false },
    { text: 'No preview', disabled: true },
  ]);
  assert.deepEqual(detail.metricLabels, ['Filter', 'Plays', 'Rank', 'Parrots']);
  assert.equal(detail.metricValues[0], 'High+');
  assert.equal(detail.metricValues[1], '8');
  assert.match(detail.scoreNote, /absolute tier/i);
  assert.ok(detail.chips.includes('42 tracks'));
  assert.equal(detail.audioStub.playCalls, 1);
  assert.equal(detail.audioStub.lastSrc, 'https://cdn.example.test/night-drive.mp3');
});

function denseMapFixture({ tourCount = 16, festivalCount = 32, nearby = false } = {}) {
  const artists = Array.from({ length: tourCount }, (_, index) => `Dense Artist ${index + 1}`);
  const location = index => nearby
    ? [52.52 + (index % 3 - 1) * 0.0007, 13.405 + (index % 5 - 2) * 0.0007]
    : [52.52, 13.405];
  return {
    artists,
    artistPlays: Object.fromEntries(artists.map(artist => [artist.toLowerCase(), 12])),
    concerts: artists.map((artist, index) => makeConcert(
      artist, index + 2, `Dense Tour Venue ${index + 1}`, `Tour City ${index + 1}`, 'DE',
      ...location(index), { id: `dense-tour-${index + 1}` },
    )),
    festivals: Array.from({ length: festivalCount }, (_, index) => makeFestival(
      `Dense Festival ${index + 1}`, index + 25, `Festival City ${index + 1}`, 'DE',
      ...location(index + tourCount), {
        id: `dense-fest-${index + 1}`, score: 85 - index,
        matched: [{ artist: artists[index % artists.length], plays: 12 }],
      },
    )),
  };
}

function mapLabelSnapshot() {
  const itemId = item => item.kind === 'fest' ? item.f.id : item.ev.id;
  const mapBounds = document.getElementById('map').getBoundingClientRect();
  const markerBounds = element => {
    const childBounds = element.firstElementChild?.getBoundingClientRect();
    return childBounds?.width && childBounds?.height ? childBounds : element.getBoundingClientRect();
  };
  const descriptors = [];
  lmap.eachLayer(layer => {
    const descriptor = layer._ctLayout;
    if (!descriptor || typeof layer.getLatLng !== 'function') return;
    const point = layer.getLatLng();
    const element = layer.getElement();
    descriptors.push({
      layoutId: element?.dataset.layoutId || '',
      originalIds: descriptor.items.map(itemId).sort(),
      displayedIds: (descriptor.displayItems || descriptor.items).map(itemId).sort(),
      numbers: descriptor.items.map(item => item.number ?? null),
      point: [point.lat, point.lng],
    });
  });
  const visible = [...document.querySelectorAll('.map-layout-marker')].filter(element => {
    const style = getComputedStyle(element);
    const rect = markerBounds(element);
    return element.getAttribute('aria-hidden') !== 'true' && style.visibility !== 'hidden'
      && style.display !== 'none' && rect.width > 0 && rect.height > 0
      && rect.right > mapBounds.left && rect.left < mapBounds.right
      && rect.bottom > mapBounds.top && rect.top < mapBounds.bottom;
  }).map(element => {
    const rect = markerBounds(element);
    return {
      layoutId: element.dataset.layoutId,
      members: Number(element.dataset.layoutMembers),
      left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
    };
  });
  return { descriptors, visible };
}

function assertMapLabelsDoNotOverlap(snapshot, context = '') {
  assert.ok(snapshot.visible.length > 0, `${context}: some map labels must remain visible`);
  for (let i = 0; i < snapshot.visible.length; i++) {
    const first = snapshot.visible[i];
    assert.ok(first.layoutId, `${context}: a visible marker needs a layout identity`);
    assert.ok(first.members >= 1, `${context}: a visible marker must expose its original events`);
    for (const second of snapshot.visible.slice(i + 1)) {
      const separated = first.right + 1.8 <= second.left || second.right + 1.8 <= first.left
        || first.bottom + 1.8 <= second.top || second.bottom + 1.8 <= first.top;
      assert.ok(separated, `${context}: labels ${first.layoutId} and ${second.layoutId} overlap or lack a 2px gap`);
    }
  }
}

function assertMapEventCoverage(snapshot, expectedIds) {
  const originals = [...new Set(snapshot.descriptors.flatMap(marker => marker.originalIds))].sort();
  assert.deepEqual(originals, [...expectedIds].sort(), 'Layout must retain every original event');
  const visibleIds = new Set(snapshot.visible.flatMap(element => {
    const descriptor = snapshot.descriptors.find(marker => marker.layoutId === element.layoutId);
    assert.ok(descriptor, `Visible layout ${element.layoutId} must have an event descriptor`);
    assert.equal(element.members, descriptor.displayedIds.length);
    return descriptor.displayedIds;
  }));
  assert.deepEqual([...visibleIds].sort(), [...expectedIds].sort(), 'Every original event must remain accessible from a visible marker');
  assert.equal(snapshot.visible.reduce((count, marker) => count + marker.members, 0), expectedIds.length, 'Visible groups must not duplicate or omit original events');
}

async function installDenseMap(pageRef, fixture) {
  await pageRef.evaluate(installFixture, fixture);
  await pageRef.evaluate(() => {
    hideOnboard();
    setWorkspaceView('map');
    lmap.stop();
    lmap.setView([52.52, 13.405], 10, { animate: false });
    clearMapLayers();
    renderOverview({ smartFit: false });
    scheduleMapLabelLayout();
  });
  await settleUi(pageRef, 260);
  await pageRef.evaluate(() => relayoutMapLabels());
  await settleUi(pageRef, 80);
}

test('dense mixed tour and festival labels do not overlap and preserve all events on desktop and mobile', { concurrency: false }, async () => {
  const fixture = denseMapFixture();
  const expectedIds = [...fixture.concerts, ...fixture.festivals].map(event => event.id);
  for (const viewport of [{ width: 1366, height: 900 }, { width: 375, height: 812 }]) {
    await setViewport(page, viewport.width, viewport.height);
    await installDenseMap(page, fixture);
    const snapshot = await page.evaluate(mapLabelSnapshot);
    assertMapLabelsDoNotOverlap(snapshot, `${viewport.width}px`);
    assertMapEventCoverage(snapshot, expectedIds);
    assert.ok(snapshot.visible.some(marker => marker.members >= 12), 'A dense group must preserve more than a truncated preview');
  }
});

test('mixed overflow groups list every event and preserve the festival and tour button actions', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  const fixture = denseMapFixture();
  await installDenseMap(page, fixture);
  const openLargestGroup = () => {
    const groups = [...document.querySelectorAll('.map-layout-marker')]
      .filter(element => element.getAttribute('aria-hidden') !== 'true'
        && getComputedStyle(element).visibility !== 'hidden'
        && (element.matches('.map-event-group') || element.querySelector('.map-event-group')))
      .sort((a, b) => Number(b.dataset.layoutMembers) - Number(a.dataset.layoutMembers));
    const group = groups[0];
    if (!group) throw new Error('No visible overflow group');
    const members = Number(group.dataset.layoutMembers);
    let expectedIds = [];
    lmap.eachLayer(layer => {
      if (layer._ctLayout && layer.getElement?.() === group) {
        expectedIds = layer._ctLayout.displayItems.map(item => item.kind === 'fest' ? item.f.id : item.ev.id).sort();
      }
    });
    group.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return { members, expectedIds };
  };
  const expectedGroup = await page.evaluate(openLargestGroup);
  await page.waitFor(() => document.querySelector('.map-event-group-list .map-event-group-row'));
  const rows = await page.evaluate(() => [...document.querySelectorAll('.map-event-group-list .map-event-group-row')].map(button => ({
    tag: button.tagName, kind: button.dataset.kind, id: button.dataset.eventId,
  })));
  assert.ok(expectedGroup.members >= 12);
  assert.equal(rows.length, expectedGroup.members, 'The group popup must list every represented event');
  assert.deepEqual(rows.map(row => row.id).sort(), expectedGroup.expectedIds, 'The popup must retain the identities of all grouped events');
  assert.equal(new Set(rows.map(row => row.id)).size, rows.length);
  assert.ok(rows.every(row => row.tag === 'BUTTON'));
  assert.ok(rows.some(row => row.kind === 'tour') && rows.some(row => row.kind === 'fest'));
  const selectedFestival = rows.find(row => row.kind === 'fest');
  await page.evaluate(id => document.querySelector(`.map-event-group-row[data-event-id="${id}"]`).click(), selectedFestival.id);
  await page.waitFor(() => document.getElementById('fd-overlay').classList.contains('open'));
  assert.equal(await page.evaluate(() => document.querySelector('.fd-name').textContent.trim()), fixture.festivals.find(festival => festival.id === selectedFestival.id).name);

  await page.evaluate(() => { closeFestDetail(); lmap.closePopup(); });
  await installDenseMap(page, fixture);
  await page.evaluate(openLargestGroup);
  await page.waitFor(() => document.querySelector('.map-event-group-row[data-kind="tour"]'));
  const selectedTourId = await page.evaluate(() => {
    const button = document.querySelector('.map-event-group-row[data-kind="tour"]');
    const id = button.dataset.eventId;
    button.click();
    return id;
  });
  await settleUi(page, 260);
  const focused = await page.evaluate(() => ({
    artist: focusedArtist,
    view: document.body.dataset.workspaceView,
    title: document.getElementById('focus-name').textContent.trim(),
  }));
  const expectedArtist = fixture.concerts.find(concert => concert.id === selectedTourId).artist;
  assert.deepEqual(focused, { artist: expectedArtist, view: 'map', title: expectedArtist });
});

test('nearby map labels remain separated through repeated pans and resizes without changing event coordinates', { concurrency: false }, async () => {
  await setViewport(page, 1366, 900);
  const fixture = denseMapFixture({ tourCount: 8, festivalCount: 16, nearby: true });
  const expectedIds = [...fixture.concerts, ...fixture.festivals].map(event => event.id);
  await installDenseMap(page, fixture);
  const initial = await page.evaluate(mapLabelSnapshot);
  const markerCoordinates = snapshot => snapshot.descriptors.map(marker => ({
    ids: marker.originalIds.join('|'), point: marker.point,
  })).sort((a, b) => a.ids.localeCompare(b.ids));
  const originalCoordinates = markerCoordinates(initial);
  assertMapLabelsDoNotOverlap(initial, 'initial');
  assertMapEventCoverage(initial, expectedIds);
  for (const width of [1100, 1440, 1200]) {
    await page.evaluate(() => {
      lmap.panBy([18, -12], { animate: false });
      scheduleMapLabelLayout();
    });
    await setViewport(page, width, 900);
    await settleUi(page, 220);
    await page.evaluate(() => relayoutMapLabels());
    const snapshot = await page.evaluate(mapLabelSnapshot);
    assertMapLabelsDoNotOverlap(snapshot, `${width}px after pan`);
    assertMapEventCoverage(snapshot, expectedIds);
    assert.deepEqual(markerCoordinates(snapshot), originalCoordinates, 'Collision layout must not relocate the actual Leaflet event coordinates');
  }
});

test('numbered focus markers at a repeated venue preserve every show and do not overlap after zoom changes', { concurrency: false }, async () => {
  await setViewport(page, 1366, 900);
  const fixture = {
    artists: ['Repeat Artist'], artistPlays: { 'repeat artist': 12 },
    concerts: Array.from({ length: 12 }, (_, index) => makeConcert(
      'Repeat Artist', index + 2, 'Repeated Venue', 'Berlin', 'DE', 52.52, 13.405,
      { id: `repeated-venue-${index + 1}` },
    )),
  };
  await page.evaluate(installFixture, fixture);
  await page.evaluate(() => {
    hideOnboard();
    focusArtist('Repeat Artist');
    lmap.stop();
    lmap.setView([52.52, 13.405], 10, { animate: false });
    scheduleMapLabelLayout();
  });
  const expectedIds = fixture.concerts.map(concert => concert.id);
  for (const zoom of [10, 12, 9]) {
    await page.evaluate(value => { lmap.setZoom(value, { animate: false }); scheduleMapLabelLayout(); }, zoom);
    await settleUi(page, 240);
    await page.evaluate(() => relayoutMapLabels());
    const snapshot = await page.evaluate(mapLabelSnapshot);
    assertMapLabelsDoNotOverlap(snapshot, `focus zoom ${zoom}`);
    assertMapEventCoverage(snapshot, expectedIds);
    const focusBounds = await page.evaluate(() => {
      const bounds = document.getElementById('focus-overlay').getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
    });
    assert.ok(snapshot.visible.every(marker => marker.right <= focusBounds.left || marker.left >= focusBounds.right
      || marker.bottom <= focusBounds.top || marker.top >= focusBounds.bottom), 'Focus markers must remain outside the artist overlay');
    assert.deepEqual(snapshot.descriptors.flatMap(marker => marker.numbers).sort((a, b) => a - b), Array.from({ length: 12 }, (_, index) => index + 1));
    assert.equal(await page.evaluate(() => document.querySelectorAll('#focus-list .fshow').length), 12);
    assert.ok(snapshot.descriptors.every(marker => marker.point[0] === 52.52 && marker.point[1] === 13.405));
  }
});

function openMapGroupForLifecycleTest() {
  const groups = [...document.querySelectorAll('.map-layout-marker')]
    .filter(element => element.getAttribute('aria-hidden') !== 'true'
      && getComputedStyle(element).visibility !== 'hidden'
      && element.querySelector('.map-event-group'))
    .sort((first, second) => Number(second.dataset.layoutMembers) - Number(first.dataset.layoutMembers));
  if (!groups.length) throw new Error('No visible overflow group');
  lmap.eachLayer(layer => {
    if (layer._ctLayout && layer.getElement?.() === groups[0]) window.__testPopupOwner = layer;
  });
  window.__testPopupOwner.openPopup();
}

function mapPopupLifecycleSnapshot() {
  const owner = window.__testPopupOwner;
  const element = owner.getElement();
  const popup = owner.getPopup();
  const open = owner.isPopupOpen();
  if (!element) return { removed: true, open };
  const popupBounds = open ? popup.getElement().getBoundingClientRect() : null;
  const labelBounds = (element.firstElementChild || element).getBoundingClientRect();
  const marginBottom = open ? Number.parseFloat(getComputedStyle(popup.getElement()).marginBottom) : 0;
  const point = owner.getLatLng();
  return {
    open,
    hidden: element.getAttribute('aria-hidden') === 'true',
    compact: !!owner._ctLayout.compact,
    expectedIds: owner._ctLayout.displayItems.map(item => item.kind === 'fest' ? item.f.id : item.ev.id).sort(),
    popupIds: open ? [...popup.getElement().querySelectorAll('.map-event-group-row')].map(row => row.dataset.eventId).sort() : [],
    centerError: open ? Math.abs((popupBounds.left + popupBounds.right - labelBounds.left - labelBounds.right) / 2) : 0,
    topError: open ? Math.abs(popupBounds.bottom + marginBottom - labelBounds.top) : 0,
    point: [point.lat, point.lng],
    panCalls: window.__testPopupPanCalls || 0,
  };
}

test('open overflow popup follows current group membership and label placement through pan and resize, and closes when hidden', { concurrency: false }, async () => {
  // The startup seed importer otherwise rebuilds all markers after 1200ms.
  // Keep that unrelated media refresh out of this popup reflow scenario.
  await page.evaluate(() => { importArtistMediaSeed = async () => ({ imported: 0, hydrated: 0 }); });
  await setViewport(page, 375, 812);
  await installDenseMap(page, denseMapFixture());
  await page.evaluate(openMapGroupForLifecycleTest);
  await settleUi(page, 260);
  const initial = await page.evaluate(mapPopupLifecycleSnapshot);
  assert.equal(initial.open, true, 'Opening a visible compact group must keep its list open');
  assert.equal(initial.compact, true);
  assert.ok(initial.expectedIds.length >= 12);
  assert.deepEqual(initial.popupIds, initial.expectedIds);
  await page.evaluate(() => {
    window.__testPopupPanCalls = 0;
    const originalPanBy = lmap.panBy;
    lmap.panBy = function (...args) {
      window.__testPopupPanCalls++;
      return originalPanBy.apply(this, args);
    };
  });
  let expectedPanCalls = 0;
  for (const width of [400, 420, 375]) {
    await page.evaluate(() => { lmap.panBy([8, -5], { animate: false }); scheduleMapLabelLayout(); });
    await setViewport(page, width, 812);
    await settleUi(page, 180);
    await page.evaluate(() => relayoutMapLabels());
    const state = await page.evaluate(mapPopupLifecycleSnapshot);
    assert.notEqual(state.removed, true, 'Pan and resize must retain the open popup owner');
    assert.deepEqual(state.point, initial.point, 'Popup movement must not change the event coordinates');
    assert.equal(state.panCalls, ++expectedPanCalls, 'Refreshing an open popup must not cause an auto-pan layout loop');
    if (state.hidden) {
      assert.equal(state.open, false, 'A popup whose marker becomes hidden must close');
    } else {
      assert.equal(state.open, true);
      if (state.compact) assert.deepEqual(state.popupIds, state.expectedIds, 'An open group must show the current members after reflow');
      assert.ok(state.centerError <= 1.1, `Popup horizontal anchor differs from its visible label by ${state.centerError}px`);
      assert.ok(state.topError <= 1.1, `Popup vertical anchor differs from its visible label by ${state.topError}px`);
    }
  }
  await page.evaluate(() => {
    lmap.closePopup();
    window.__testPopupOwner = null;
  });
  await page.evaluate(openMapGroupForLifecycleTest);
  await settleUi(page, 180);
  assert.equal((await page.evaluate(mapPopupLifecycleSnapshot)).open, true);
  await page.evaluate(() => {
    const overlay = document.getElementById('focus-overlay');
    overlay.style.cssText = 'display:block;position:absolute;inset:0;width:100%;height:100%;max-width:none;';
    relayoutMapLabels();
  });
  const hidden = await page.evaluate(mapPopupLifecycleSnapshot);
  assert.equal(hidden.hidden, true, 'Labels covered by the focus overlay must be hidden');
  assert.deepEqual(hidden.expectedIds, []);
  assert.equal(hidden.open, false, 'The hidden owner must not leave a stale group popup open');
});

test('markers recreated while the mobile map is hidden receive real footprints when the map reopens', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  const fixture = denseMapFixture({ tourCount: 8, festivalCount: 16, nearby: true });
  const expectedIds = [...fixture.concerts, ...fixture.festivals].map(event => event.id);
  await installDenseMap(page, fixture);
  const hidden = await page.evaluate(() => {
    setWorkspaceView('agenda');
    clearMapLayers();
    renderOverview({ smartFit: false });
    relayoutMapLabels();
    const bounds = document.getElementById('map').getBoundingClientRect();
    return {
      width: bounds.width,
      footprints: [...tourMarkers, ...festMarkers].map(marker => marker._ctLayout.footprint),
    };
  });
  assert.equal(hidden.width, 0, 'The mobile agenda must actually hide the map');
  assert.equal(hidden.footprints.length, expectedIds.length);
  assert.ok(hidden.footprints.every(footprint => footprint === null), 'A hidden map must not cache zero-size marker measurements');
  await settleUi(page, 120);
  await page.evaluate(() => { setWorkspaceView('map'); scheduleMapLabelLayout(); });
  await settleUi(page, 260);
  await page.evaluate(() => relayoutMapLabels());
  const footprints = await page.evaluate(() => [...tourMarkers, ...festMarkers].map(marker => marker._ctLayout.footprint));
  assert.ok(footprints.every(footprint => footprint?.width > 0 && footprint?.height > 0), 'Every marker needs a measured footprint after returning to the map');
  const snapshot = await page.evaluate(mapLabelSnapshot);
  assertMapLabelsDoNotOverlap(snapshot, 'mobile map reopened');
  assertMapEventCoverage(snapshot, expectedIds);
});

test('festival tab and highlighted festival preserve every coincident event in the shared collision layout', { concurrency: false }, async () => {
  await setViewport(page, 1366, 900);
  const fixture = denseMapFixture({ tourCount: 1, festivalCount: 32 });
  fixture.concerts = [];
  await page.evaluate(installFixture, fixture);
  const expectedIds = fixture.festivals.map(festival => festival.id);
  const highlightedId = expectedIds.at(-1);
  for (const id of [null, highlightedId]) {
    await page.evaluate(selectedId => {
      hideOnboard();
      setWorkspaceView('map');
      if (selectedId === null) setTab('fests');
      else renderFestMap(selectedId);
      lmap.stop();
      lmap.setView([52.52, 13.405], 10, { animate: false });
      scheduleMapLabelLayout();
    }, id);
    await settleUi(page, 220);
    await page.evaluate(() => relayoutMapLabels());
    const snapshot = await page.evaluate(mapLabelSnapshot);
    assert.equal(snapshot.descriptors.length, expectedIds.length, 'The festival-only route must register every event for collision layout');
    assertMapLabelsDoNotOverlap(snapshot, id ? 'highlighted festival' : 'festival tab');
    assertMapEventCoverage(snapshot, expectedIds);
    assert.ok(snapshot.descriptors.every(marker => marker.point[0] === 52.52 && marker.point[1] === 13.405));
    const state = await page.evaluate(selectedId => {
      const selected = festMarkers.find(marker => marker._ctLayout.items.some(item => item.f.id === selectedId));
      return {
        tab: sidebarTab,
        focused: focusedFest,
        selectedCard: document.querySelector('.fcard.hl')?.dataset.id || null,
        selectedStyle: selected?._ctLayout.icon.options.html.includes('is-selected') || false,
        selectedPriority: selected?._ctLayout.priority || 0,
        otherPriority: Math.max(...festMarkers.filter(marker => marker !== selected).map(marker => marker._ctLayout.priority)),
      };
    }, id);
    assert.equal(state.tab, 'fests');
    assert.equal(state.focused, id);
    if (id) {
      assert.equal(state.selectedCard, id);
      assert.equal(state.selectedStyle, true);
      assert.ok(state.selectedPriority > state.otherPriority, 'The selected festival must have layout priority without an oversized absolute label');
    }
  }
});

test('mobile zoom controls stay clear of the legend, honesty button and event labels', { concurrency: false }, async () => {
  await setViewport(page, 375, 812);
  const fixture = denseMapFixture({ tourCount: 8, festivalCount: 16, nearby: true });
  await installDenseMap(page, fixture);
  // Put an actual event underneath the zoom buttons so the layout must avoid them.
  const eventPoint = await page.evaluate(() => {
    const mapBounds = document.getElementById('map').getBoundingClientRect();
    const zoomBounds = document.querySelector('.leaflet-control-zoom').getBoundingClientRect();
    const point = lmap.containerPointToLatLng([
      (zoomBounds.left + zoomBounds.right) / 2 - mapBounds.left,
      (zoomBounds.top + zoomBounds.bottom) / 2 - mapBounds.top,
    ]);
    return { lat: point.lat, lng: point.lng };
  });
  Object.assign(fixture.concerts[0], eventPoint);
  await installDenseMap(page, fixture);
  const controls = await page.evaluate(() => {
    const bounds = selector => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    return {
      map: bounds('#map'), zoom: bounds('.leaflet-control-zoom'),
      legend: bounds('#map-legend'), honesty: bounds('#honesty-float-btn'),
      clickable: [...document.querySelectorAll('.leaflet-control-zoom a')].map(button => {
        const rect = button.getBoundingClientRect();
        return !!document.elementFromPoint((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2)?.closest('.leaflet-control-zoom');
      }),
    };
  });
  const separate = (first, second) => first.right <= second.left || first.left >= second.right
    || first.bottom <= second.top || first.top >= second.bottom;
  assert.ok(controls.zoom.width > 0 && controls.zoom.height > 0);
  assert.ok(controls.zoom.left >= controls.map.left && controls.zoom.right <= controls.map.right
    && controls.zoom.top >= controls.map.top && controls.zoom.bottom <= controls.map.bottom, 'Both zoom buttons must fit inside the visible mobile map');
  assert.ok(separate(controls.zoom, controls.legend), 'The legend must not cover the zoom buttons');
  assert.ok(separate(controls.zoom, controls.honesty), 'The honesty button must not cover the zoom buttons');
  assert.deepEqual(controls.clickable, [true, true], 'Both zoom buttons must receive pointer input');
  const snapshot = await page.evaluate(mapLabelSnapshot);
  assertMapLabelsDoNotOverlap(snapshot, 'mobile controls');
  assertMapEventCoverage(snapshot, [...fixture.concerts, ...fixture.festivals].map(event => event.id));
  assert.ok(snapshot.visible.every(marker => separate(marker, controls.zoom)), 'Event labels must leave the zoom controls accessible');
});

const IMPORT_IDS = { a: '1'.repeat(22), b: '2'.repeat(22), c: '3'.repeat(22) };
const importUrl = id => `https://open.spotify.com/playlist/${id}`;

function spotifyImportFixture(id, name, credits = [['Alpha', 'Beta'], ['Alpha'], ['Gamma'], ['Alpha'], ['Beta']], extra = {}) {
  const tracks = credits.map((artists, index) => ({
    type: 'track', id: `${id}-${index}`, name: `${name} Track ${index + 1}`,
    uri: `spotify:track:${id}`, duration_ms: 180000 + index, is_local: false,
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    album: { name: `${name} Album`, images: [] },
    artists: artists.map(artist => ({ id: `artist-${artist.toLowerCase().replace(/\W/g, '-')}`, name: artist })),
  }));
  return {
    playlist: {
      id, name, owner: { display_name: 'Offline Listener' }, images: [],
      external_urls: { spotify: importUrl(id) }, tracks: { total: tracks.length }, snapshot_id: `snapshot-${id}`,
    },
    tracks, ...extra,
  };
}

async function configureSpotifyImports(playlists) {
  const response = await fetch(`${baseUrl}/__test/spotify`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playlists }),
  });
  assert.equal(response.status, 200);
}

async function prepareSpotifyImportTest(pageRef, original = {}) {
  await pageRef.evaluate(async () => {
    importArtistMediaSeed = async () => ({ imported: 0, hydrated: 0 });
    await DB.clear('artists');
    await DB.clear('meta');
  });
  await pageRef.evaluate(installFixture, original);
  await pageRef.evaluate(() => {
    if (typeof resetActivePlaylistSessionContext === 'function') resetActivePlaylistSessionContext();
    saveOnboardHistory([]);
    setMinTracks(1);
    openPlaylistImport();
    setPlaylistImportMinTracks(1);
    window.__testImportScanCalls = [];
    saveAndFetch = () => {
      window.__testImportScanCalls.push({ id: SPOTIFY_PLAYLIST_META?.id || '', artists: [...ARTISTS] });
    };
  });
}

function spotifySessionSnapshot() {
  return {
    artists: [...ARTISTS], tracked: [...TRACKED_ARTISTS], plays: { ...ARTIST_PLAYS },
    tracks: ARTIST_TRACKS, playlist: SPOTIFY_PLAYLIST_META,
    concerts: concerts.map(event => event.id), festivals: festivals.map(event => event.id),
    scanned: [...SCANNED_ARTISTS], cacheTimestamp, active: localStorage.getItem('tt_active_playlist'),
    minTracks: getEffectiveMinTracks(), history: getOnboardHistory(),
  };
}

async function runOfflineSpotifyImport(pageRef, url, mode = 'onboard') {
  return pageRef.evaluate(async (value, importMode) => {
    document.getElementById(importMode === 'onboard' ? 'onboard-url' : 'sp-playlist-url').value = value;
    return runSpotifyImport({ mode: importMode });
  }, url, mode);
}

test('playlist links mode is the editable default and the header opens an import that works with Enter', { concurrency: false }, async () => {
  await configureSpotifyImports({ [IMPORT_IDS.a]: spotifyImportFixture(IMPORT_IDS.a, 'Keyboard Playlist') });
  await page.evaluate(() => localStorage.clear());
  await page.navigate(baseUrl);
  const initial = await page.evaluate(() => ({
    mode: PRODUCT_SCENARIO.id, pinned: isScenarioAProductMode(), minTracks: getEffectiveMinTracks(),
    onboardReadonly: document.getElementById('onboard-url').readOnly,
    settingsReadonly: document.getElementById('sp-playlist-url').readOnly,
    title: document.getElementById('onboard-main-title').textContent,
    cutoffVisible: getComputedStyle(document.getElementById('onboard-mintracks-chips')).display !== 'none',
  }));
  assert.equal(initial.mode, 'playlist-links');
  assert.equal(initial.pinned, false);
  assert.equal(initial.minTracks, 1);
  assert.equal(initial.onboardReadonly, false);
  assert.equal(initial.settingsReadonly, false);
  assert.equal(initial.cutoffVisible, true);
  assert.doesNotMatch(initial.title, /pinned/i);
  await prepareSpotifyImportTest(page);
  await page.evaluate(url => {
    hideOnboard();
    document.getElementById('playlist-open-btn').click();
    const input = document.getElementById('onboard-url');
    input.value = url;
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  }, importUrl(IMPORT_IDS.a));
  await page.waitFor(() => SPOTIFY_PLAYLIST_META?.id === '1'.repeat(22));
  const imported = await page.evaluate(spotifySessionSnapshot);
  assert.equal(imported.playlist.name, 'Keyboard Playlist');
  assert.deepEqual(imported.artists, ['Alpha', 'Beta', 'Gamma']);
  await settleUi(page, 560);
  assert.deepEqual(await page.evaluate(() => window.__testImportScanCalls), [{ id: IMPORT_IDS.a, artists: ['Alpha', 'Beta', 'Gamma'] }]);
});

test('Spotify link parsing accepts canonical URI localized and embed links and rejects unrelated hosts and paths', { concurrency: false }, async () => {
  const valid = [
    importUrl(IMPORT_IDS.a), `${importUrl(IMPORT_IDS.a)}?si=share&utm_source=copy-link`,
    `spotify:playlist:${IMPORT_IDS.a}`, `https://open.spotify.com/intl-ru/playlist/${IMPORT_IDS.a}`,
    `https://open.spotify.com/embed/playlist/${IMPORT_IDS.a}`, IMPORT_IDS.a,
  ];
  const invalid = [
    `https://evil.example/playlist/${IMPORT_IDS.a}`, `https://open.spotify.com.evil.example/playlist/${IMPORT_IDS.a}`,
    `https://open.spotify.com@evil.example/playlist/${IMPORT_IDS.a}`, `https://open.spotify.com/artist/${IMPORT_IDS.a}`,
    `https://open.spotify.com/playlist/${IMPORT_IDS.a}/extra`, 'https://open.spotify.com/playlist/short',
    `spotify:track:${IMPORT_IDS.a}`, `javascript:playlist/${IMPORT_IDS.a}`, `http://open.spotify.com/playlist/${IMPORT_IDS.a}`,
  ];
  const parsed = await page.evaluate((good, bad) => ({
    valid: good.map(value => spExtractId(value)), invalid: bad.map(value => spExtractId(value)),
  }), valid, invalid);
  assert.deepEqual(parsed.valid, valid.map(() => IMPORT_IDS.a));
  assert.ok(parsed.invalid.every(id => id === null), 'Only a real Spotify playlist resource may select a playlist');
});

test('arbitrary playlist import retains metadata and multi-artist counts while applying the selected cutoff', { concurrency: false }, async () => {
  await configureSpotifyImports({ [IMPORT_IDS.a]: spotifyImportFixture(IMPORT_IDS.a, 'My Joint Credits') });
  await prepareSpotifyImportTest(page);
  await page.evaluate(() => setPlaylistImportMinTracks(2));
  assert.equal(await runOfflineSpotifyImport(page, `spotify:playlist:${IMPORT_IDS.a}`), true);
  const state = await page.evaluate(spotifySessionSnapshot);
  assert.equal(state.playlist.id, IMPORT_IDS.a);
  assert.equal(state.playlist.name, 'My Joint Credits');
  assert.equal(state.playlist.ownerName, 'Offline Listener');
  assert.equal(state.playlist.trackCount, 5);
  assert.equal(state.playlist.spotifyUrl, importUrl(IMPORT_IDS.a));
  assert.deepEqual(state.artists, ['Alpha', 'Beta']);
  assert.deepEqual(state.tracked, ['Alpha', 'Beta', 'Gamma']);
  assert.deepEqual(state.plays, { alpha: 3, beta: 2, gamma: 1 });
  assert.equal(state.tracks.alpha.totalTrackHits, 3);
  assert.equal(state.tracks.beta.totalTrackHits, 2);
  assert.equal(state.tracks.gamma.totalTrackHits, 1);
  assert.equal(state.minTracks, 2);
  assert.equal(state.active, IMPORT_IDS.a);
  assert.ok(state.history.some(item => item.url === importUrl(IMPORT_IDS.a) && item.name === 'My Joint Credits'));
  assert.deepEqual(await page.evaluate(() => ({ onboard: document.getElementById('onboard-url').value, settings: document.getElementById('sp-playlist-url').value })), {
    onboard: importUrl(IMPORT_IDS.a), settings: importUrl(IMPORT_IDS.a),
  });
});

test('failed and empty-threshold Spotify imports preserve the previous playlist session atomically', { concurrency: false }, async () => {
  const successful = spotifyImportFixture(IMPORT_IDS.a, 'Keep This Playlist');
  await configureSpotifyImports({ [IMPORT_IDS.a]: successful, [IMPORT_IDS.b]: spotifyImportFixture(IMPORT_IDS.b, 'Rejected Playlist') });
  await prepareSpotifyImportTest(page);
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.a)), true);
  await settleUi(page, 560);
  const originalConcert = makeConcert('Alpha', 4, 'Saved Venue', 'Berlin', 'DE', 52.52, 13.405, { id: 'saved-before-failure' });
  await page.evaluate(event => { concerts = [event]; SCANNED_ARTISTS = ['Alpha']; persistData(); }, originalConcert);
  for (const scenario of [
    { fixture: spotifyImportFixture(IMPORT_IDS.b, 'Server Failure', undefined, { error: { status: 503, message: 'Spotify is temporarily unavailable' } }), cutoff: 1 },
    { fixture: spotifyImportFixture(IMPORT_IDS.b, 'Empty Playlist', []), cutoff: 1 },
    { fixture: spotifyImportFixture(IMPORT_IDS.b, 'No Threshold Match'), cutoff: 20 },
  ]) {
    await configureSpotifyImports({ [IMPORT_IDS.a]: successful, [IMPORT_IDS.b]: scenario.fixture });
    await page.evaluate(cutoff => setPlaylistImportMinTracks(cutoff), scenario.cutoff);
    const before = await page.evaluate(spotifySessionSnapshot);
    assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.b)), false);
    const after = await page.evaluate(spotifySessionSnapshot);
    assert.deepEqual(after, before, 'A rejected import must not replace artists, tracks, events, history or active playlist');
    assert.equal(await page.evaluate(() => document.getElementById('onboard-url').value), importUrl(IMPORT_IDS.b), 'Keep the attempted link editable so the user can correct or retry it');
  }
});

test('a newer Spotify import wins when an older playlist responds late', { concurrency: false }, async () => {
  await configureSpotifyImports({
    [IMPORT_IDS.a]: spotifyImportFixture(IMPORT_IDS.a, 'Slow Playlist', [['Slow Artist']], { delayMs: 250 }),
    [IMPORT_IDS.b]: spotifyImportFixture(IMPORT_IDS.b, 'Fast Playlist', [['Fast Artist']]),
  });
  await prepareSpotifyImportTest(page);
  await page.evaluate(url => {
    document.getElementById('onboard-url').value = url;
    window.__testSlowImport = runSpotifyImport({ mode: 'onboard' });
  }, importUrl(IMPORT_IDS.a));
  await page.waitFor(() => spotifyAccountState.pendingPlaylistId === '1'.repeat(22));
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.b)), true);
  assert.equal(await page.evaluate(() => window.__testSlowImport), false);
  await settleUi(page, 600);
  const state = await page.evaluate(spotifySessionSnapshot);
  assert.equal(state.active, IMPORT_IDS.b);
  assert.equal(state.playlist.name, 'Fast Playlist');
  assert.deepEqual(state.artists, ['Fast Artist']);
  assert.deepEqual(state.plays, { 'fast artist': 1 });
  assert.ok(state.history.every(item => item.url !== importUrl(IMPORT_IDS.a)), 'A superseded response must not enter playlist history');
  assert.deepEqual(await page.evaluate(() => window.__testImportScanCalls), [{ id: IMPORT_IDS.b, artists: ['Fast Artist'] }]);
});

test('superseded 500ms scan callbacks and canceled imports cannot replace or scan the previous session', { concurrency: false }, async () => {
  await configureSpotifyImports({
    [IMPORT_IDS.a]: spotifyImportFixture(IMPORT_IDS.a, 'Initial Playlist', [['Alpha']]),
    [IMPORT_IDS.b]: spotifyImportFixture(IMPORT_IDS.b, 'Pending Playlist', [['Beta']], { delayMs: 900 }),
  });
  await prepareSpotifyImportTest(page);
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.a)), true);
  const before = await page.evaluate(spotifySessionSnapshot);
  await page.evaluate(url => {
    document.getElementById('onboard-url').value = url;
    window.__testCanceledImport = runSpotifyImport({ mode: 'onboard' });
  }, importUrl(IMPORT_IDS.b));
  await page.waitFor(() => spotifyAccountState.pendingPlaylistId === '2'.repeat(22));
  await settleUi(page, 550);
  assert.deepEqual(await page.evaluate(() => window.__testImportScanCalls), [], 'The older delayed scan must not run while a newer import owns the UI');
  await page.evaluate(() => onboardCancel());
  assert.equal(await page.evaluate(() => window.__testCanceledImport), false);
  await settleUi(page, 600);
  assert.deepEqual(await page.evaluate(spotifySessionSnapshot), before);
  assert.deepEqual(await page.evaluate(() => window.__testImportScanCalls), [], 'Cancel must invalidate pending scan callbacks as well as the HTTP request');
  assert.match(await page.evaluate(() => document.getElementById('onboard-status-text').textContent), /cancel/i);
});

test('Spotify access denial offers a clear reconnect action while retaining the link and current results', { concurrency: false }, async () => {
  await configureSpotifyImports({ [IMPORT_IDS.b]: spotifyImportFixture(IMPORT_IDS.b, 'Private Playlist', undefined, {
    error: { status: 403, message: 'Playlist access denied' },
  }) });
  await prepareSpotifyImportTest(page, {
    artists: ['Saved Artist'], artistPlays: { 'saved artist': 6 },
    concerts: [makeConcert('Saved Artist', 5, 'Saved Venue', 'Berlin', 'DE', 52.52, 13.405, { id: 'kept-on-denial' })],
  });
  const before = await page.evaluate(spotifySessionSnapshot);
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.b)), false);
  assert.deepEqual(await page.evaluate(spotifySessionSnapshot), before);
  const ui = await page.evaluate(() => ({
    input: document.getElementById('onboard-url').value,
    status: document.getElementById('onboard-status-text').textContent,
    authLabel: document.getElementById('onboard-auth-btn').textContent,
    authDisabled: document.getElementById('onboard-auth-btn').disabled,
    authVisible: getComputedStyle(document.getElementById('onboard-auth-btn')).display !== 'none'
      && document.getElementById('onboard-auth-btn').getBoundingClientRect().height > 0,
    retryDisabled: document.getElementById('onboard-btn').disabled,
  }));
  assert.equal(ui.input, importUrl(IMPORT_IDS.b));
  assert.match(ui.status, /connect|sign in|access|private/i);
  assert.match(ui.authLabel, /Spotify/i);
  assert.equal(ui.authDisabled, false);
  assert.equal(ui.authVisible, true);
  assert.equal(ui.retryDisabled, false);

  await page.evaluate(() => {
    spotifyAccountState.loaded = true;
    spotifyAccountState.loading = false;
    spotifyAccountState.connected = true;
    spotifyAccountState.user = { id: 'other-listener', displayName: 'Other Listener' };
    spotifyAccountState.playlistsLoaded = true;
    renderOnboardSpotifyAuth();
  });
  const typedLink = `${importUrl(IMPORT_IDS.b)}?si=keep-the-typed-link`;
  assert.equal(await runOfflineSpotifyImport(page, typedLink), false);
  assert.deepEqual(await page.evaluate(spotifySessionSnapshot), before, 'An access error from a connected account must preserve the previous session');
  const connectedUi = await page.evaluate(() => {
    const action = document.getElementById('playlist-login-action');
    return {
      label: action.textContent.trim(),
      visible: !action.hidden && action.getBoundingClientRect().height > 0,
      input: document.getElementById('onboard-url').value,
    };
  });
  assert.equal(connectedUi.label, 'Switch Spotify account');
  assert.equal(connectedUi.visible, true);
  assert.equal(connectedUi.input, typedLink);
  const reconnect = await page.evaluate(async () => {
    window.__testAuthRoutes = [];
    window.__testAuthOptions = [];
    window.__testPlaylistListReloads = 0;
    // Run the real auth handler with its navigation boundary replaced.
    // The UI click must select reconnection without leaving this offline page.
    const realAuthHandler = onboardSpotifyAuthAction;
    const offlineAuthHandler = new Function('window', `return (${realAuthHandler.toString()});`)({
      location: {
        pathname: location.pathname, search: location.search, hash: location.hash,
        assign: url => window.__testAuthRoutes.push(url),
      },
    });
    onboardSpotifyAuthAction = opts => {
      window.__testAuthOptions.push(opts || {});
      window.__testAuthAction = offlineAuthHandler(opts);
      return window.__testAuthAction;
    };
    loadSpotifyAccountPlaylists = async () => { window.__testPlaylistListReloads++; return []; };
    document.getElementById('playlist-login-action').click();
    await window.__testAuthAction;
    return {
      routes: window.__testAuthRoutes, options: window.__testAuthOptions,
      listReloads: window.__testPlaylistListReloads,
      pendingLink: localStorage.getItem('tt_pending_spotify_playlist'),
      input: document.getElementById('onboard-url').value,
    };
  });
  assert.deepEqual(reconnect.options, [{ reconnect: true }]);
  assert.equal(reconnect.listReloads, 0, 'Switching accounts must enter login rather than refresh the current account playlists');
  assert.equal(reconnect.routes.length, 1);
  const route = new URL(reconnect.routes[0], baseUrl);
  assert.equal(route.origin, baseUrl);
  assert.equal(route.pathname, '/api/auth/spotify/login');
  assert.equal(route.searchParams.get('show_dialog'), '1');
  assert.equal(route.searchParams.get('returnTo'), '/');
  assert.equal(reconnect.pendingLink, typedLink);
  assert.equal(reconnect.input, typedLink);
  assert.deepEqual(await page.evaluate(spotifySessionSnapshot), before, 'Starting account reconnection must not discard the working playlist results');
});

test('desktop and mobile playlist importers keep readable text and usable link widths within the viewport', { concurrency: false }, async () => {
  await prepareSpotifyImportTest(page);
  for (const viewport of [{ width: 1440, height: 900, minInputWidth: 260 }, { width: 375, height: 667, minInputWidth: 200 }]) {
    await setViewport(page, viewport.width, viewport.height);
    await page.evaluate(url => {
      hideOnboard();
      document.getElementById('playlist-open-btn').click();
      document.getElementById('onboard-url').value = url;
    }, `${importUrl(IMPORT_IDS.a)}?si=${'a'.repeat(100)}`);
    await settleUi(page, 120);
    const ui = await page.evaluate(() => {
      const bounds = selector => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      };
      const text = selector => {
        const element = document.querySelector(selector);
        const style = getComputedStyle(element);
        return {
          ...bounds(selector), text: element.textContent.trim(),
          clientWidth: element.clientWidth, scrollWidth: element.scrollWidth,
          clientHeight: element.clientHeight, scrollHeight: element.scrollHeight,
          overflowX: style.overflowX, overflowY: style.overflowY,
        };
      };
      return {
        viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        card: bounds('.onboard-card'), input: bounds('#onboard-url'), button: bounds('#onboard-btn'),
        title: text('#onboard-main-title'), sub: text('#onboard-sub-text'),
        editable: !document.getElementById('onboard-url').readOnly,
      };
    });
    assert.equal(ui.editable, true);
    assert.ok(ui.scrollWidth <= ui.viewport + 1, `${viewport.width}px: the importer must not create horizontal page scrolling`);
    assert.ok(ui.input.width >= viewport.minInputWidth, `${viewport.width}px: link field needs at least ${viewport.minInputWidth}px, got ${ui.input.width}px`);
    for (const [name, rect] of Object.entries({ card: ui.card, input: ui.input, button: ui.button, title: ui.title, sub: ui.sub })) {
      assert.ok(rect.width > 0 && rect.left >= -1 && rect.right <= ui.viewport + 1, `${viewport.width}px: ${name} must fit within the viewport`);
    }
    for (const [name, element] of Object.entries({ title: ui.title, subtitle: ui.sub })) {
      assert.ok(element.text.length > 0, `${viewport.width}px: ${name} must remain visible`);
      assert.ok(element.clientHeight > 0 && (element.scrollHeight <= element.clientHeight + 1 || element.overflowY === 'visible')
        && element.scrollWidth <= element.clientWidth + 1, `${viewport.width}px: the full ${name} must wrap without clipping: ${JSON.stringify(element)}`);
    }
  }
});

test('saved playlist sessions restore A after importing B and reloading without Spotify calls or cross-playlist cache data', { concurrency: false }, async () => {
  await configureSpotifyImports({
    [IMPORT_IDS.a]: spotifyImportFixture(IMPORT_IDS.a, 'Saved Playlist A', [['Alpha', 'Shared'], ['Alpha']]),
    [IMPORT_IDS.b]: spotifyImportFixture(IMPORT_IDS.b, 'Saved Playlist B', [['Beta'], ['Beta']]),
  });
  await prepareSpotifyImportTest(page, { artists: ['Original Main'], artistPlays: { 'original main': 8 } });
  await page.evaluate(() => persistSettings());
  const mainArtists = await page.evaluate(() => localStorage.getItem('tt_main_artists'));
  assert.deepEqual(JSON.parse(mainArtists), ['Original Main']);
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.a)), true);
  const concertA = makeConcert('Alpha', 4, 'A Venue', 'Berlin', 'DE', 52.52, 13.405, { id: 'session-a-show' });
  const festivalA = makeFestival('A Festival', 6, 'Berlin', 'DE', 52.52, 13.405, { id: 'session-a-fest', lineup: ['Alpha'], matched: [{ artist: 'Alpha', plays: 2 }] });
  const concertB = makeConcert('Beta', 9, 'B Venue', 'Paris', 'FR', 48.8566, 2.3522, { id: 'session-b-show' });
  await page.evaluate(async (event, festival) => {
    concerts = [event]; festivals = [festival]; SCANNED_ARTISTS = ['Alpha']; cacheTimestamp = Date.now();
    persistData();
    await persistActivePlaylistSession();
  }, concertA, festivalA);
  assert.equal(await runOfflineSpotifyImport(page, importUrl(IMPORT_IDS.b)), true);
  await page.evaluate(async event => {
    concerts = [event]; festivals = []; SCANNED_ARTISTS = ['Beta']; cacheTimestamp = Date.now();
    persistData();
    await persistActivePlaylistSession();
    await DB.put('artists', 'beta', { ts: Date.now(), cHash: countryHash(), shows: [event] });
    await DB.put('artists', 'unrelated', { ts: Date.now(), cHash: countryHash(), shows: [{ ...event, id: 'unrelated-cached-show', artist: 'Unrelated' }] });
  }, concertB);
  const callsBeforeReload = (await (await fetch(`${baseUrl}/__test/spotify`)).json()).calls;
  await page.navigate(baseUrl);
  await page.waitFor(() => window.__testImportScanCalls === undefined
    && SPOTIFY_PLAYLIST_META?.id === '2'.repeat(22) && concerts.some(event => event.id === 'session-b-show'));
  const reloadedB = await page.evaluate(spotifySessionSnapshot);
  assert.equal(reloadedB.active, IMPORT_IDS.b);
  assert.deepEqual(reloadedB.artists, ['Beta']);
  assert.deepEqual(reloadedB.plays, { beta: 2 });
  assert.deepEqual(reloadedB.concerts, ['session-b-show']);
  assert.deepEqual(reloadedB.festivals, []);
  assert.deepEqual(reloadedB.scanned, ['Beta']);
  await page.evaluate(url => {
    importArtistMediaSeed = async () => ({ imported: 0, hydrated: 0 });
    window.__testImportScanCalls = [];
    saveAndFetch = () => window.__testImportScanCalls.push(true);
    openPlaylistImport();
    renderOnboardHistory();
    const historyCard = [...document.querySelectorAll('#onboard-history [data-playlist-url]')].find(card => card.dataset.playlistUrl === url);
    if (!historyCard) throw new Error('Saved playlist A is missing from history');
    historyCard.click();
  }, importUrl(IMPORT_IDS.a));
  await page.waitFor(() => SPOTIFY_PLAYLIST_META?.id === '1'.repeat(22) && concerts.some(event => event.id === 'session-a-show'));
  await settleUi(page, 620);
  const restoredA = await page.evaluate(spotifySessionSnapshot);
  assert.equal(restoredA.active, IMPORT_IDS.a);
  assert.equal(restoredA.playlist.name, 'Saved Playlist A');
  assert.deepEqual(restoredA.artists, ['Alpha', 'Shared']);
  assert.deepEqual(restoredA.tracked, ['Alpha', 'Shared']);
  assert.deepEqual(restoredA.plays, { alpha: 2, shared: 1 });
  assert.equal(restoredA.tracks.alpha.totalTrackHits, 2);
  assert.equal(restoredA.tracks.shared.totalTrackHits, 1);
  assert.equal(restoredA.tracks.beta, undefined, 'Artist track caches must belong to the selected playlist');
  assert.deepEqual(restoredA.concerts, ['session-a-show']);
  assert.deepEqual(restoredA.festivals, ['session-a-fest']);
  assert.deepEqual(restoredA.scanned, ['Alpha']);
  assert.deepEqual((await (await fetch(`${baseUrl}/__test/spotify`)).json()).calls, callsBeforeReload, 'History restore must use saved sessions without calling Spotify again');
  assert.deepEqual(await page.evaluate(() => window.__testImportScanCalls), [], 'Opening a cached session must not start a replacement discovery scan');
  assert.equal(await page.evaluate(() => localStorage.getItem('tt_main_artists')), mainArtists, 'Arbitrary imports must preserve the original Main artist source');
  const sessions = await page.evaluate(async (first, second) => ({ a: await getPlaylistSession(first), b: await getPlaylistSession(second) }), IMPORT_IDS.a, IMPORT_IDS.b);
  assert.deepEqual(sessions.a.concerts.map(event => event.id), ['session-a-show']);
  assert.deepEqual(sessions.b.concerts.map(event => event.id), ['session-b-show']);
});
