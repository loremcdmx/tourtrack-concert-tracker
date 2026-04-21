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
      const response = await fetch(url);
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
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
    };

    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}, sessionId = null) {
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }

  async newPage(url) {
    const target = await this.send('Target.createTarget', { url: 'about:blank' });
    const attached = await this.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    const page = new CdpPage(this, target.targetId, attached.sessionId);
    await page.enable();
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
    rmSync(this.profileDir, { recursive: true, force: true });
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
  return date.toISOString().split('T')[0];
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

  calGeoFilter = new Set();
  calGeoExpanded = null;
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

before(async () => {
  serverPort = await getFreePort();
  baseUrl = `http://127.0.0.1:${serverPort}`;
  serverProc = spawn(process.execPath, ['server/index.js'], {
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

beforeEach(async () => {
  page = await browser.newPage(baseUrl);
});

afterEach(async () => {
  if (page) {
    await page.close();
    page = null;
  }
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

test('map drag defers tile warmup and skips closed visible-panel work', { concurrency: false }, async () => {
  await page.evaluate(installFixture, {
    artists: ['Drift'],
    artistPlays: { drift: 9 },
    concerts: [
      makeConcert('Drift', 5, 'Forum', 'London', 'GB', 51.5074, -0.1278),
      makeConcert('Drift', 11, 'Paradiso', 'Amsterdam', 'NL', 52.362, 4.883),
    ],
  });

  const result = await page.evaluate(async () => {
    const originalWarm = window.scheduleMapTileWarmup;
    const originalUpdateVisiblePanel = window.updateVisiblePanel;
    const calls = { warm: 0, visible: 0 };
    const mapEl = document.getElementById('map');

    window.scheduleMapTileWarmup = function(...args) {
      calls.warm += 1;
      return originalWarm.apply(this, args);
    };
    window.updateVisiblePanel = function(...args) {
      calls.visible += 1;
      return originalUpdateVisiblePanel.apply(this, args);
    };

    _visiblePanelOpen = false;
    if (typeof _cancelMapTileWarmup === 'function') _cancelMapTileWarmup();
    clearTimeout(_moveTimer);
    clearTimeout(_zRenderTimer);
    await new Promise(resolve => setTimeout(resolve, 260));
    calls.warm = 0;
    calls.visible = 0;

    lmap.fire('movestart');
    const start = {
      warm: calls.warm,
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    lmap.fire('move');
    const moving = {
      warm: calls.warm,
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    lmap.fire('moveend');
    const endImmediate = {
      warm: calls.warm,
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    await new Promise(resolve => setTimeout(resolve, 260));
    const settled = {
      warm: calls.warm,
      visible: calls.visible,
      isPanning: mapEl.classList.contains('is-panning'),
    };

    window.scheduleMapTileWarmup = originalWarm;
    window.updateVisiblePanel = originalUpdateVisiblePanel;
    return { start, moving, endImmediate, settled };
  });

  assert.deepEqual(result.start, { warm: 0, visible: 0, isPanning: true });
  assert.deepEqual(result.moving, { warm: 0, visible: 0, isPanning: true });
  assert.deepEqual(result.endImmediate, { warm: 1, visible: 0, isPanning: false });
  assert.deepEqual(result.settled, { warm: 1, visible: 0, isPanning: false });
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
