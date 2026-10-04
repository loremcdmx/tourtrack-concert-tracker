'use strict';

let _mapTileCacheReady = null;
let _mapTileLayer = null;
const MAP_TILE_RETRY_DELAYS = [1000, 3000];
const MAP_TILE_LOAD_TIMEOUT_MS = 10000;

function prepareMapTileCache() {
  if (_mapTileCacheReady) return _mapTileCacheReady;
  if (!window.isSecureContext || !navigator.serviceWorker) return Promise.resolve();
  _mapTileCacheReady = new Promise(resolve => {
    const serviceWorker = navigator.serviceWorker;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      try { serviceWorker.removeEventListener('controllerchange', onController); } catch (_) {}
      resolve();
    };
    const onController = () => { if (serviceWorker.controller) finish(); };
    // A failed/blocked worker must never prevent tiles from appearing.
    const timeout = setTimeout(finish, 2000);
    try {
      serviceWorker.addEventListener('controllerchange', onController);
      serviceWorker.register('/map-cache-sw.js', { scope: '/' }).then(() => {
        if (serviceWorker.controller) finish();
      }).catch(finish);
    } catch (_) { finish(); }
  });
  return _mapTileCacheReady;
}

function createResilientMapTileLayer(url, options) {
  const TileLayer = L.TileLayer.extend({
    initialize(tileUrl, tileOptions) {
      L.TileLayer.prototype.initialize.call(this, tileUrl, tileOptions);
      this._ctRecords = new Map();
      this._ctLastManualRetry = -Infinity;
      this._ctLastOnlineRetry = -Infinity;
      this._ctOnline = () => {
        if (Date.now() - this._ctLastOnlineRetry < 10000) return;
        this._ctLastOnlineRetry = Date.now();
        this.recoverMapTiles(true);
      };
      this._ctViewportChanged = () => this.recoverMapTiles(false);
      this.on('tileunload tileabort', event => this._ctForget(event.tile));
    },
    onAdd(map) {
      map.on('moveend resize', this._ctViewportChanged);
      window.addEventListener('online', this._ctOnline);
      L.TileLayer.prototype.onAdd.call(this, map);
    },
    onRemove(map) {
      map.off('moveend resize', this._ctViewportChanged);
      window.removeEventListener('online', this._ctOnline);
      for (const tile of [...this._ctRecords.keys()]) this._ctForget(tile);
      L.TileLayer.prototype.onRemove.call(this, map);
      if (_mapTileLayer === this) _mapTileLayer = null;
      this._ctUpdateStatus();
    },
    _ctForget(tile) {
      const record = this._ctRecords.get(tile);
      if (!record) return;
      record.removed = true;
      clearTimeout(record.watchdog);
      clearTimeout(record.retryTimer);
      this._ctRecords.delete(tile);
      this._ctUpdateStatus();
    },
    _ctVisible(record) {
      if (!this._map || record.removed || !record.tile.isConnected || record.coords.z !== this._map.getZoom()) return false;
      const tile = record.tile.getBoundingClientRect();
      const map = this._map.getContainer().getBoundingClientRect();
      return map.width > 0 && map.height > 0 && tile.width > 0 && tile.height > 0
        && tile.right > map.left && tile.left < map.right && tile.bottom > map.top && tile.top < map.bottom;
    },
    createTile(coords, done) {
      const record = { coords, tile: null, retries: this._ctNextRetries || 0,
        failed: false, finished: false, removed: false, retryTimer: null, watchdog: null };
      const finish = error => {
        if (record.finished || record.removed) return;
        record.finished = true;
        clearTimeout(record.watchdog);
        clearTimeout(record.retryTimer);
        done(error, record.tile);
        this._ctUpdateStatus();
      };
      const startWatchdog = () => {
        clearTimeout(record.watchdog);
        record.watchdog = setTimeout(() => {
          // Stop the hung image before another attempt or terminal completion.
          // A late load after done(error) would otherwise remain hidden by
          // Leaflet, which accepts completion only once for this grid entry.
          record.tile.removeAttribute('src');
          complete(new Error('Map tile timed out'));
        }, MAP_TILE_LOAD_TIMEOUT_MS);
      };
      const complete = error => {
        if (record.finished || record.removed) return;
        clearTimeout(record.watchdog);
        if (!error) {
          record.failed = false;
          finish(null);
          return;
        }
        record.failed = true;
        if (record.retryTimer) return;
        if (record.retries < MAP_TILE_RETRY_DELAYS.length && this._ctVisible(record)) {
          const delay = MAP_TILE_RETRY_DELAYS[record.retries];
          record.retryTimer = setTimeout(() => {
            record.retryTimer = null;
            if (!this._ctVisible(record)) { finish(error); return; }
            record.retries++;
            startWatchdog();
            // Same URL keeps normal browser/SW caching and provider backoff.
            record.tile.src = this.getTileUrl(coords);
          }, delay);
          this._ctUpdateStatus();
        } else finish(error);
      };
      record.tile = L.TileLayer.prototype.createTile.call(this, coords, complete);
      this._ctRecords.set(record.tile, record);
      startWatchdog();
      return record.tile;
    },
    _ctUpdateStatus() {
      const status = document.getElementById('map-tile-status');
      if (!status) return;
      const failed = [...this._ctRecords.values()].filter(record => record.failed && this._ctVisible(record));
      status.hidden = !failed.length;
      if (!failed.length) return;
      const busy = failed.some(record => !record.finished);
      document.getElementById('map-tile-message').textContent = busy
        ? 'Restoring the map background…' : 'Part of the map could not load.';
      document.getElementById('map-tile-retry').disabled = busy;
    },
    recoverMapTiles(resetBudget = false) {
      for (const record of [...this._ctRecords.values()]) {
        if (!record.failed || !record.finished || !this._ctVisible(record)) continue;
        if (!resetBudget && record.retries >= MAP_TILE_RETRY_DELAYS.length) continue;
        // Leaflet 1.9.4 has no public single-tile invalidation API. Recreate
        // only this failed entry, preserving healthy tiles and wrapped coords.
        const entry = Object.entries(this._tiles).find(([, tile]) => tile.el === record.tile);
        if (!entry) continue;
        const [key, tile] = entry;
        const parent = record.tile.parentNode;
        this._ctNextRetries = resetBudget ? 0 : record.retries;
        try {
          this._removeTile(key);
          if (!this._loading) { this._loading = true; this.fire('loading'); }
          this._addTile(tile.coords, parent);
        } finally { this._ctNextRetries = 0; }
      }
      this._ctUpdateStatus();
    },
    retryMapTiles() {
      if (Date.now() - this._ctLastManualRetry < 2000) return;
      this._ctLastManualRetry = Date.now();
      this.recoverMapTiles(true);
    },
  });
  return new TileLayer(url, options);
}

function retryMapTiles() {
  _mapTileLayer?.retryMapTiles();
}
