'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { URL, URLSearchParams } = require('node:url');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
loadDotEnv(path.join(ROOT_DIR, '.env'));
const PORT = Number(process.env.PORT || 3000);
const TICKETMASTER_PLACEHOLDER = '__SERVER__';
const PROXYABLE_HOSTS = new Set([
  'app.ticketmaster.com',
  'ticketmaster.com',
  'www.ticketmaster.com',
  'rest.bandsintown.com',
  'api.deezer.com',
  'api.spotify.com',
  'accounts.spotify.com',
]);
const STATIC_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function getTicketmasterKeys() {
  const keys = new Set();
  const bulk = (process.env.TICKETMASTER_API_KEYS || '')
    .split(/[,\n\r\t ]+/)
    .map(value => value.trim())
    .filter(Boolean);
  for (const key of bulk) keys.add(key);
  const single = (process.env.TICKETMASTER_API_KEY || '').trim();
  if (single) keys.add(single);
  return [...keys];
}

function getSpotifyCredentials() {
  return {
    clientId: (process.env.SPOTIFY_CLIENT_ID || '').trim(),
    clientSecret: (process.env.SPOTIFY_CLIENT_SECRET || '').trim(),
  };
}

function appConfig() {
  const tmKeys = getTicketmasterKeys();
  const spotify = getSpotifyCredentials();
  return {
    appVersion: '2.24.0000',
    internalProxyTemplate: '/api/proxy?url={url}',
    ticketmasterManaged: tmKeys.length > 0,
    ticketmasterPlaceholder: TICKETMASTER_PLACEHOLDER,
    spotifyManaged: Boolean(spotify.clientId && spotify.clientSecret),
  };
}

function setBaseHeaders(res) {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

function sendText(res, statusCode, body, headers = {}) {
  setBaseHeaders(res);
  res.writeHead(statusCode, headers);
  res.end(body);
}

function sendJson(res, statusCode, payload, headers = {}) {
  sendText(
    res,
    statusCode,
    JSON.stringify(payload, null, 2),
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  );
}

function safeStaticPath(urlPath) {
  let pathname = urlPath;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch (error) {
    return null;
  }
  if (pathname === '/') pathname = '/index.html';
  const relativePath = pathname.replace(/^\/+/, '');
  const normalized = path.normalize(relativePath);
  const absolutePath = path.join(CLIENT_DIR, normalized);
  if (!absolutePath.startsWith(CLIENT_DIR)) return null;
  return absolutePath;
}

async function serveStatic(req, res, pathname) {
  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    sendJson(res, 400, { error: 'Invalid path.' });
    return;
  }

  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) {
      sendJson(res, 404, { error: 'Not found.' });
      return;
    }
    const body = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    sendText(res, 200, body, {
      'Content-Type': STATIC_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=300',
    });
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      sendJson(res, 404, { error: 'Not found.' });
      return;
    }
    console.error('Static file error:', error);
    sendJson(res, 500, { error: 'Failed to read file.' });
  }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function forwardableHeaders(sourceHeaders) {
  const out = new Headers();
  const allow = ['accept', 'authorization', 'content-type', 'if-none-match', 'if-modified-since', 'cache-control'];
  for (const name of allow) {
    const value = sourceHeaders[name];
    if (!value) continue;
    out.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  return out;
}

function responseHeaders(upstreamHeaders) {
  const headers = {};
  const allow = ['cache-control', 'content-type', 'etag', 'expires', 'last-modified'];
  for (const name of allow) {
    const value = upstreamHeaders.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

async function fetchTicketmasterWithPool(targetUrl, requestInit, serverKeys) {
  const clientKey = (targetUrl.searchParams.get('apikey') || '').trim();
  const useServerKeys = serverKeys.length > 0 && (!clientKey || clientKey === TICKETMASTER_PLACEHOLDER);
  const candidates = useServerKeys ? serverKeys : [clientKey].filter(Boolean);

  if (!candidates.length) {
    return {
      response: await fetch(targetUrl, requestInit),
      exhaustedServerPool: false,
    };
  }

  let lastResponse = null;
  for (let index = 0; index < candidates.length; index += 1) {
    const upstreamUrl = new URL(targetUrl);
    upstreamUrl.searchParams.set('apikey', candidates[index]);
    const response = await fetch(upstreamUrl, requestInit);
    lastResponse = response;
    const retriable = useServerKeys && (response.status === 401 || response.status === 403 || response.status === 429);
    if (!retriable || index === candidates.length - 1) {
      return {
        response,
        exhaustedServerPool: useServerKeys && response.status === 429 && index === candidates.length - 1,
      };
    }
  }

  return {
    response: lastResponse,
    exhaustedServerPool: false,
  };
}

async function handleProxy(req, res, requestUrl) {
  const rawTarget = requestUrl.searchParams.get('url');
  if (!rawTarget) {
    sendJson(res, 400, { error: 'Missing "url" query parameter.' });
    return;
  }

  let targetUrl;
  try {
    targetUrl = new URL(rawTarget);
  } catch (error) {
    sendJson(res, 400, { error: 'Proxy target must be an absolute URL.' });
    return;
  }

  if (!/^https?:$/.test(targetUrl.protocol) || !PROXYABLE_HOSTS.has(targetUrl.hostname)) {
    sendJson(res, 403, { error: 'Proxy target is not allowed.' });
    return;
  }

  try {
    const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readRequestBody(req);
    const init = {
      method: req.method,
      headers: forwardableHeaders(req.headers),
      body,
      redirect: 'follow',
    };

    let result;
    if (targetUrl.hostname === 'app.ticketmaster.com') {
      result = await fetchTicketmasterWithPool(targetUrl, init, getTicketmasterKeys());
    } else {
      result = {
        response: await fetch(targetUrl, init),
        exhaustedServerPool: false,
      };
    }

    const payload = Buffer.from(await result.response.arrayBuffer());
    sendText(res, result.response.status, payload, {
      ...responseHeaders(result.response.headers),
      'Cache-Control': result.response.headers.get('cache-control') || 'no-store',
      'X-Tourtrack-Proxy': 'internal',
      ...(result.exhaustedServerPool ? { 'X-Tourtrack-TM-State': 'all-keys-exhausted' } : {}),
    });
  } catch (error) {
    console.error('Proxy request failed:', error);
    sendJson(res, 502, { error: 'Upstream request failed.', detail: error.message });
  }
}

async function handleSpotifyToken(res) {
  const { clientId, clientSecret } = getSpotifyCredentials();
  if (!clientId || !clientSecret) {
    sendJson(res, 501, {
      error: 'Spotify credentials are not configured on the server.',
    });
    return;
  }

  try {
    const upstream = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });
    const payload = await upstream.text();
    sendText(res, upstream.status, payload, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  } catch (error) {
    console.error('Spotify token error:', error);
    sendJson(res, 502, {
      error: 'Failed to get Spotify token from upstream.',
      detail: error.message,
    });
  }
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = requestUrl.pathname;

  if (req.method === 'OPTIONS') {
    setBaseHeaders(res);
    res.writeHead(204, { Allow: 'GET,HEAD,POST,OPTIONS' });
    res.end();
    return;
  }

  if (pathname === '/config.js') {
    sendText(
      res,
      200,
      `window.__SERVER_CONFIG__ = ${JSON.stringify(appConfig(), null, 2)};\n`,
      {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    );
    return;
  }

  if (pathname === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      ticketmasterManaged: appConfig().ticketmasterManaged,
      spotifyManaged: appConfig().spotifyManaged,
    });
    return;
  }

  if (pathname === '/api/spotify/token') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      return;
    }
    await handleSpotifyToken(res);
    return;
  }

  if (pathname === '/api/proxy') {
    await handleProxy(req, res, requestUrl);
    return;
  }

  if (pathname === '/favicon.ico') {
    sendText(res, 204, '');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET,HEAD,POST,OPTIONS' });
    return;
  }

  await serveStatic(req, res, pathname);
}

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`TourTrack server listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = { handleRequest };
