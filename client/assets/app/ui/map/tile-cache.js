'use strict';

let _mapTileCacheReady = null;

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
