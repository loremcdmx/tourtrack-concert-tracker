'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { URL, URLSearchParams } = require('node:url');

const ROOT_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const ENV_FILE = path.join(ROOT_DIR, '.env');
loadDotEnv(ENV_FILE);

const PORT = Number(process.env.PORT || 3000);
const TICKETMASTER_PLACEHOLDER = '__SERVER__';
const SPOTIFY_SESSION_COOKIE = 'tt_spotify_session';
const SPOTIFY_STATE_COOKIE = 'tt_spotify_state';
const SPOTIFY_STATE_TTL_MS = 10 * 60 * 1000;
const SPOTIFY_LOCAL_HANDOFF_TTL_MS = 30 * 1000;
const SPOTIFY_LOCAL_HANDOFF_LIMIT = 128;
const spotifyLocalHandoffs = new Map();
const SPOTIFY_OAUTH_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
];
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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const IMMUTABLE_EXTS = new Set(['.js', '.css', '.woff', '.woff2']);

let cachedSessionSecret = '';
let cachedSessionKey = null;
let spotifyAppTokenCache = null;
const SPOTIFY_UPSTREAM_TIMEOUT_MS = 15000;

function spotifyRequestError(message, status = 502, code = '') {
  const error = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
}

function spotifyRetryAfter(headers) {
  const value = String(headers.get('retry-after') || '').trim();
  return /^\d+$/.test(value) || (value && Number.isFinite(Date.parse(value))) ? value : '';
}

function sendSpotifyError(res, error, fallbackMessage, code = '') {
  const status = error.status || 502;
  const codes = {
    401: 'SPOTIFY_LOGIN_REQUIRED',
    403: 'PLAYLIST_ACCESS_DENIED',
    404: 'PLAYLIST_NOT_FOUND',
    429: 'RATE_LIMITED',
  };
  sendJson(res, status, {
    error: error.message || fallbackMessage,
    code: error.code || codes[status] || code || 'INCOMPLETE_IMPORT',
    ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
  }, error.retryAfter ? { 'Retry-After': error.retryAfter } : {});
}

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

function getSpotifySessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.SPOTIFY_CLIENT_SECRET ||
    ''
  ).trim();
}

function parseDotEnvText(text) {
  const out = {};
  for (const rawLine of String(text || '').split(/\r?\n/)) {
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
    out[key] = value;
  }
  return out;
}

function serializeEnvValue(value) {
  const text = String(value == null ? '' : value);
  if (!text) return '';
  if (/^[A-Za-z0-9_./:@,\-]+$/.test(text)) return text;
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function writeLocalEnv(updates) {
  let envMap = {};
  try {
    envMap = parseDotEnvText(await fsp.readFile(ENV_FILE, 'utf8'));
  } catch (error) {
    if (!error || error.code !== 'ENOENT') throw error;
  }

  for (const [key, value] of Object.entries(updates)) {
    envMap[key] = String(value == null ? '' : value);
    process.env[key] = envMap[key];
  }

  const orderedKeys = [
    'PORT',
    'TICKETMASTER_API_KEYS',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'SPOTIFY_REDIRECT_URI',
    'SESSION_SECRET',
  ];
  const finalKeys = [
    ...orderedKeys.filter(key => key in envMap),
    ...Object.keys(envMap).filter(key => !orderedKeys.includes(key)).sort(),
  ];
  const body = finalKeys
    .map(key => `${key}=${serializeEnvValue(envMap[key])}`)
    .join('\n') + '\n';

  await fsp.writeFile(ENV_FILE, body, 'utf8');
  spotifyAppTokenCache = null;
  cachedSessionSecret = '';
  cachedSessionKey = null;
}

function spotifyConfigured() {
  const { clientId, clientSecret } = getSpotifyCredentials();
  return Boolean(clientId && clientSecret);
}

function appConfig(req = null) {
  const tmKeys = getTicketmasterKeys();
  const spotifyReady = spotifyConfigured();
  return {
    appVersion: '2.31.0061',
    internalProxyTemplate: '/api/proxy?url={url}',
    ticketmasterManaged: tmKeys.length > 0,
    ticketmasterPlaceholder: TICKETMASTER_PLACEHOLDER,
    spotifyManaged: spotifyReady,
    spotifyLoginManaged: spotifyReady,
    localSetupAllowed: !!req && isLocalRequest(req),
    spotifyRedirectUri: req ? getSpotifyRedirectUri(req) : '',
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

function sendRedirect(res, statusCode, location, headers = {}) {
  setBaseHeaders(res);
  res.writeHead(statusCode, {
    Location: location,
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end();
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

const _cssMinCache = new Map();
async function maybeMinifyCss(filePath, body) {
  const cached = _cssMinCache.get(filePath);
  const text = body.toString('utf8');
  if (cached && cached.src === text) return cached.out;

  const out = Buffer.from(minifyCssText(text), 'utf8');
  _cssMinCache.set(filePath, { src: text, out });
  return out;
}

function minifyCssText(src) {
  // Pass 1: state machine that removes comments and collapses whitespace
  // outside of string literals so quoted `content:"foo; bar"` survives intact.
  let out = '';
  const n = src.length;
  let i = 0;
  let pendingSpace = false;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];

    if (c === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      if (pendingSpace) { out += ' '; pendingSpace = false; }
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const ch = src[i];
        out += ch;
        i++;
        if (ch === '\\' && i < n) { out += src[i]; i++; continue; }
        if (ch === quote) break;
      }
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
      pendingSpace = out.length > 0;
      i++;
      continue;
    }
    if (pendingSpace) {
      const last = out.charCodeAt(out.length - 1);
      // Drop the space after/before structural chars; keep it between tokens
      // (e.g. descendant combinators, space-separated values).
      if (last !== 0x7b /* { */ && last !== 0x7d /* } */ && last !== 0x3b /* ; */ &&
          last !== 0x2c /* , */ && last !== 0x3e /* > */ && last !== 0x28 /* ( */ &&
          c !== '{' && c !== '}' && c !== ';' && c !== ',' && c !== ')') {
        out += ' ';
      }
      pendingSpace = false;
    }
    out += c;
    i++;
  }
  // Pass 2: drop semicolons right before a closing brace.
  out = out.replace(/;\}/g, '}');
  return out;
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
    const hasVersionQuery = typeof req.url === 'string' && req.url.includes('?');
    // Font filenames from Google are already content-hashed (e.g.
    // aFTR7PB1QTsUX8KYvrGyEY2tbYf-Vlh3uA.woff2), so they're safe to cache
    // forever without a ?v= query. Same for anything under /assets/vendor/
    // which we bundle ourselves and update by path rename.
    const isVendorAsset = typeof req.url === 'string' && req.url.startsWith('/assets/vendor/');
    const isContentAddressedFont = ext === '.woff' || ext === '.woff2';
    let cacheControl;
    if (ext === '.html') {
      cacheControl = 'no-store';
    } else if (IMMUTABLE_EXTS.has(ext) && (hasVersionQuery || isVendorAsset || isContentAddressedFont)) {
      cacheControl = 'public, max-age=31536000, immutable';
    } else if (IMMUTABLE_EXTS.has(ext)) {
      cacheControl = 'no-store';
    } else if (isVendorAsset) {
      cacheControl = 'public, max-age=31536000, immutable';
    } else {
      cacheControl = 'public, max-age=300';
    }
    const stylesMin = ext === '.css' ? await maybeMinifyCss(filePath, body) : null;
    sendText(res, 200, stylesMin || body, {
      'Content-Type': STATIC_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': cacheControl,
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

function readRequestBody(req, maxBytes = Infinity) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    let exceeded = false;
    req.on('data', chunk => {
      if (exceeded) return;
      bytes += chunk.length;
      if (bytes > maxBytes) {
        exceeded = true;
        chunks.length = 0;
        reject(spotifyRequestError('Request body is too large.', 413, 'UNSUPPORTED_SPOTIFY_LINK'));
        return;
      }
      chunks.push(chunk);
    });
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

function getRequestProtocol(req) {
  const forwarded = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (forwarded === 'http' || forwarded === 'https') return forwarded;
  return req.socket && req.socket.encrypted ? 'https' : 'http';
}

function getRequestHost(req) {
  const forwarded = String(req.headers['x-forwarded-host'] || '')
    .split(',')[0]
    .trim();
  return forwarded || req.headers.host || `127.0.0.1:${PORT}`;
}

function getExternalBaseUrl(req) {
  return `${getRequestProtocol(req)}://${getRequestHost(req)}`;
}

function normalizeHostname(value) {
  const host = String(value || '').trim().toLowerCase();
  const ipv6 = host.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (ipv6) return ipv6[1];
  return host === '::1' ? host : host.split(':')[0];
}

function isLoopbackHost(value) {
  const host = normalizeHostname(value);
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

function isLocalRequest(req) {
  const host = normalizeHostname(getRequestHost(req));
  const remote = String(req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '')
    .replace(/^::ffff:/, '')
    .toLowerCase();
  return isLoopbackHost(host) && (remote === '127.0.0.1' || remote === '::1');
}

function sanitizeReturnTo(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return '/';
  if (rawValue.length > 2048 || /[\\\u0000-\u001f\u007f]/.test(rawValue)) return '/';
  if (!rawValue.startsWith('/')) return '/';
  if (rawValue.startsWith('//')) return '/';
  return rawValue;
}

function getSpotifyRedirectUri(req) {
  const configured = (process.env.SPOTIFY_REDIRECT_URI || '').trim();
  if (configured) {
    try {
      const redirect = new URL(configured);
      // Spotify requires a literal loopback IP. Keep old local .env files usable
      // without changing the application's localhost origin or deployment config.
      if (isLocalRequest(req) && redirect.hostname === 'localhost') {
        redirect.hostname = '127.0.0.1';
        return redirect.toString();
      }
    } catch (error) {
      // An explicit non-local configuration remains the deployment's responsibility.
    }
    return configured;
  }
  const origin = new URL(getExternalBaseUrl(req));
  if (isLocalRequest(req)) origin.hostname = '127.0.0.1';
  return new URL('/api/auth/spotify/callback', origin).toString();
}

function getCanonicalSpotifyLoginUrl(req, requestUrl) {
  let redirectUrl;
  let requestOrigin;
  try {
    redirectUrl = new URL(getSpotifyRedirectUri(req));
    requestOrigin = new URL(`${getRequestProtocol(req)}://${getRequestHost(req)}`);
  } catch (error) {
    return '';
  }
  if (!isLocalRequest(req) || !isLoopbackHost(redirectUrl.hostname) || !isLoopbackHost(requestOrigin.hostname)) return '';
  if (redirectUrl.origin === requestOrigin.origin) return '';
  return new URL(`${requestUrl.pathname}${requestUrl.search}`, redirectUrl.origin).toString();
}

function spotifyStateIsFresh(payload) {
  const now = Date.now();
  return !!payload && Number.isFinite(payload.ts) && payload.ts <= now && now - payload.ts <= SPOTIFY_STATE_TTL_MS;
}

function getSpotifyLocalBridgeOrigin(req, payload) {
  if (!isLocalRequest(req) || !payload || typeof payload.bridgeOrigin !== 'string') return '';
  try {
    const current = new URL(getExternalBaseUrl(req));
    const target = new URL(payload.bridgeOrigin);
    const callback = new URL(getSpotifyRedirectUri(req));
    if (current.hostname !== '127.0.0.1' || target.hostname !== 'localhost') return '';
    if (target.origin !== payload.bridgeOrigin || target.username || target.password) return '';
    if (target.protocol !== current.protocol || target.port !== current.port) return '';
    if (callback.origin !== current.origin || callback.pathname !== '/api/auth/spotify/callback' || callback.search || callback.hash) return '';
    return target.origin;
  } catch (error) {
    return '';
  }
}

function pruneSpotifyLocalHandoffs() {
  const now = Date.now();
  for (const [state, record] of spotifyLocalHandoffs) {
    if (record.expiresAt <= now) {
      clearTimeout(record.timer);
      spotifyLocalHandoffs.delete(state);
    }
  }
}

function saveSpotifyLocalHandoff(state, targetOrigin, session) {
  pruneSpotifyLocalHandoffs();
  if (spotifyLocalHandoffs.size >= SPOTIFY_LOCAL_HANDOFF_LIMIT || spotifyLocalHandoffs.has(state)) return false;
  const sealedSession = sealJson(session);
  if (!sealedSession) return false;
  const timer = setTimeout(() => spotifyLocalHandoffs.delete(state), SPOTIFY_LOCAL_HANDOFF_TTL_MS);
  timer.unref?.();
  spotifyLocalHandoffs.set(state, { targetOrigin, sealedSession, expiresAt: Date.now() + SPOTIFY_LOCAL_HANDOFF_TTL_MS, timer });
  return true;
}

function claimSpotifyLocalHandoff(req, res) {
  pruneSpotifyLocalHandoffs();
  if (!isLocalRequest(req)) return null;
  const origin = new URL(getExternalBaseUrl(req));
  if (origin.hostname !== 'localhost') return null;
  const stateCookie = openJson(parseCookies(req)[SPOTIFY_STATE_COOKIE]);
  if (!spotifyStateIsFresh(stateCookie) || stateCookie.bridgeOrigin !== origin.origin) return null;
  const record = spotifyLocalHandoffs.get(stateCookie.state);
  if (!record || record.targetOrigin !== origin.origin) return null;
  const session = sanitizeSpotifySession(openJson(record.sealedSession));
  clearTimeout(record.timer);
  spotifyLocalHandoffs.delete(stateCookie.state);
  clearCookie(res, req, SPOTIFY_STATE_COOKIE, '/api/auth/spotify');
  if (!session || !writeSpotifySessionCookie(res, req, session)) return null;
  return session;
}

function isSecureRequest(req) {
  return getRequestProtocol(req) === 'https';
}

function base64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64urlDecode(value) {
  let normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  return Buffer.from(normalized, 'base64');
}

function getSessionKey() {
  const secret = getSpotifySessionSecret();
  if (!secret) return null;
  if (secret !== cachedSessionSecret) {
    cachedSessionSecret = secret;
    cachedSessionKey = crypto.scryptSync(secret, 'tourtrack-session', 32);
  }
  return cachedSessionKey;
}

function sealJson(payload) {
  const key = getSessionKey();
  if (!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map(base64urlEncode).join('.');
}

function openJson(token) {
  if (!token) return null;
  const key = getSessionKey();
  if (!key) return null;
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;

  try {
    const iv = base64urlDecode(parts[0]);
    const tag = base64urlDecode(parts[1]);
    const encrypted = base64urlDecode(parts[2]);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const text = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  parts.push(`SameSite=${options.sameSite || 'Lax'}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (Number.isFinite(options.maxAge)) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`);
  return parts.join('; ');
}

function appendSetCookie(res, cookieValue) {
  const current = res.getHeader('Set-Cookie');
  if (!current) {
    res.setHeader('Set-Cookie', [cookieValue]);
    return;
  }
  if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, cookieValue]);
    return;
  }
  res.setHeader('Set-Cookie', [current, cookieValue]);
}

function clearCookie(res, req, name, pathName = '/') {
  appendSetCookie(res, serializeCookie(name, '', {
    path: pathName,
    sameSite: 'Lax',
    httpOnly: true,
    secure: isSecureRequest(req),
    maxAge: 0,
    expires: new Date(0),
  }));
}

function parseCookies(req) {
  const out = {};
  const header = String(req.headers.cookie || '');
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 0) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

function sanitizeSpotifySession(session) {
  if (!session || typeof session !== 'object') return null;
  if (!session.accessToken || !session.refreshToken) return null;
  return {
    accessToken: String(session.accessToken),
    refreshToken: String(session.refreshToken),
    expiresAt: Number(session.expiresAt) || 0,
    scope: Array.isArray(session.scope)
      ? session.scope.filter(Boolean)
      : String(session.scope || '').split(/\s+/).filter(Boolean),
    user: session.user && typeof session.user === 'object'
      ? {
          id: session.user.id || '',
          displayName: session.user.displayName || '',
          spotifyUrl: session.user.spotifyUrl || '',
          imageUrl: session.user.imageUrl || '',
        }
      : null,
  };
}

function writeSpotifySessionCookie(res, req, session) {
  const sealed = sealJson(session);
  if (!sealed) return false;
  appendSetCookie(res, serializeCookie(SPOTIFY_SESSION_COOKIE, sealed, {
    path: '/',
    sameSite: 'Lax',
    httpOnly: true,
    secure: isSecureRequest(req),
    maxAge: 60 * 60 * 24 * 30,
  }));
  return true;
}

function writeSpotifyStateCookie(res, req, payload) {
  const sealed = sealJson(payload);
  if (!sealed) return false;
  appendSetCookie(res, serializeCookie(SPOTIFY_STATE_COOKIE, sealed, {
    path: '/api/auth/spotify',
    sameSite: 'Lax',
    httpOnly: true,
    secure: isSecureRequest(req),
    maxAge: 60 * 10,
  }));
  return true;
}

function buildReturnUrl(pathName, params = {}) {
  const nextUrl = new URL(pathName, 'http://127.0.0.1');
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    nextUrl.searchParams.set(key, String(value));
  }
  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
}

async function requestSpotifyToken(formParams) {
  const { clientId, clientSecret } = getSpotifyCredentials();
  if (!clientId || !clientSecret) {
    const error = new Error('Spotify credentials are not configured on the server.');
    error.status = 501;
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SPOTIFY_UPSTREAM_TIMEOUT_MS);
  let upstream;
  let rawBody;
  try {
    upstream = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(formParams),
      signal: controller.signal,
    });
    rawBody = await upstream.text();
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error(`Spotify token request timed out after ${Math.round(SPOTIFY_UPSTREAM_TIMEOUT_MS / 1000)}s.`);
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  let payload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    payload = {};
  }

  if (!upstream.ok) {
    const error = new Error(
      payload.error_description ||
      payload.error?.message ||
      payload.error ||
      `Spotify token request failed (${upstream.status}).`
    );
    error.status = upstream.status;
    error.payload = payload;
    error.retryAfter = spotifyRetryAfter(upstream.headers);
    throw error;
  }

  return payload;
}

async function getSpotifyAppTokenPayload() {
  if (
    spotifyAppTokenCache &&
    spotifyAppTokenCache.expiresAt > Date.now() + 60 * 1000
  ) {
    return {
      access_token: spotifyAppTokenCache.accessToken,
      token_type: spotifyAppTokenCache.tokenType,
      expires_in: Math.max(1, Math.round((spotifyAppTokenCache.expiresAt - Date.now()) / 1000)),
    };
  }

  const payload = await requestSpotifyToken({ grant_type: 'client_credentials' });
  spotifyAppTokenCache = {
    accessToken: payload.access_token,
    tokenType: payload.token_type || 'Bearer',
    expiresAt: Date.now() + Math.max(60, Number(payload.expires_in) || 3600) * 1000,
  };

  return {
    access_token: spotifyAppTokenCache.accessToken,
    token_type: spotifyAppTokenCache.tokenType,
    expires_in: Math.max(1, Math.round((spotifyAppTokenCache.expiresAt - Date.now()) / 1000)),
  };
}

async function spotifyApiFetch(url, options = {}) {
  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : SPOTIFY_UPSTREAM_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort(options.signal.reason);
  if (options.signal) {
    if (options.signal.aborted) abortFromCaller();
    else options.signal.addEventListener('abort', abortFromCaller, { once: true });
  }
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        ...(options.headers || {}),
      },
      body: options.body,
      signal: controller.signal,
    });
    if (!response.ok) {
      const rawBody = await response.text();
      let payload = {};
      try {
        payload = JSON.parse(rawBody);
      } catch (_) {}
      const details = payload.error && typeof payload.error === 'object'
        ? payload.error.message
        : payload.error_description || payload.error;
      const error = spotifyRequestError(details || `Spotify API request failed (${response.status}).`, response.status);
      error.retryAfter = spotifyRetryAfter(response.headers);
      throw error;
    }
    if (options.json) {
      try {
        return await response.json();
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw spotifyRequestError('Spotify returned an invalid JSON response.', 502, 'INCOMPLETE_IMPORT');
      }
    }
    return response;
  } catch (error) {
    if (options.signal?.aborted) throw options.signal.reason || error;
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error(`Spotify request timed out after ${Math.round(timeoutMs / 1000)}s.`);
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortFromCaller);
  }
}

function simplifySpotifyImages(images) {
  return Array.isArray(images)
    ? images
        .filter(image => image && image.url)
        .map(image => ({
          url: image.url,
          width: image.width || null,
          height: image.height || null,
        }))
    : [];
}

async function fetchSpotifyProfile(accessToken) {
  const data = await spotifyApiFetch('https://api.spotify.com/v1/me', {
    accessToken, json: true,
  });
  if (typeof data?.id !== 'string' || !data.id.trim()) {
    throw spotifyRequestError('Spotify returned invalid account metadata.', 502, 'INCOMPLETE_IMPORT');
  }
  return {
    id: data.id || '',
    displayName: data.display_name || data.id || 'Spotify',
    spotifyUrl: data.external_urls && data.external_urls.spotify ? data.external_urls.spotify : '',
    imageUrl: data.images && data.images[0] ? data.images[0].url : '',
  };
}

async function refreshSpotifyUserSession(req, res, session) {
  if (!session) return null;
  if (session.expiresAt > Date.now() + 60 * 1000) return session;

  try {
    const payload = await requestSpotifyToken({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken,
    });
    const nextSession = {
      ...session,
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token || session.refreshToken,
      expiresAt: Date.now() + Math.max(60, Number(payload.expires_in) || 3600) * 1000,
      scope: String(payload.scope || session.scope.join(' '))
        .split(/\s+/)
        .filter(Boolean),
    };
    if (!nextSession.user) {
      try {
        nextSession.user = await fetchSpotifyProfile(nextSession.accessToken);
      } catch (error) {
        nextSession.user = null;
      }
    }
    writeSpotifySessionCookie(res, req, nextSession);
    return nextSession;
  } catch (error) {
    if (error.payload?.error === 'invalid_grant') {
      clearCookie(res, req, SPOTIFY_SESSION_COOKIE);
      return null;
    }
    // A rate limit or provider outage does not revoke the user's consent.
    // Preserve the session and let the caller retry, rather than falling back
    // to an app token with different playlist access.
    throw error;
  }
}

async function getSpotifyUserSession(req, res) {
  const cookies = parseCookies(req);
  const session = sanitizeSpotifySession(openJson(cookies[SPOTIFY_SESSION_COOKIE]));
  if (!session) return null;
  return refreshSpotifyUserSession(req, res, session);
}

async function fetchSpotifyUserPlaylists(accessToken) {
  const items = [];
  let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
  let pageCount = 0;

  while (nextUrl && pageCount < 6) {
    pageCount += 1;
    const data = await spotifyApiFetch(nextUrl, { accessToken, json: true });
    if (!Array.isArray(data?.items)) {
      throw spotifyRequestError('Spotify returned an invalid playlist list.', 502, 'INCOMPLETE_IMPORT');
    }

    for (const item of data.items) {
      if (!item || !item.id) continue;
      const trackCount = item.items?.total ?? item.tracks?.total;
      if (!Number.isSafeInteger(trackCount) || trackCount < 0) {
        throw spotifyRequestError('Spotify returned an invalid playlist item count.', 502, 'INCOMPLETE_IMPORT');
      }
      items.push({
        id: item.id,
        name: item.name || 'Untitled playlist',
        url: item.external_urls && item.external_urls.spotify
          ? item.external_urls.spotify
          : `https://open.spotify.com/playlist/${item.id}`,
        ownerName: item.owner && (item.owner.display_name || item.owner.id)
          ? item.owner.display_name || item.owner.id
          : '',
        imageUrl: item.images && item.images[0] ? item.images[0].url : '',
        images: simplifySpotifyImages(item.images),
        trackCount,
        collaborative: Boolean(item.collaborative),
        public: item.public,
      });
    }

    nextUrl = data.next || null;
  }

  return items;
}

function normalizeSpotifyImportTrack(track) {
  if (!track) return null;
  return {
    id: track.id || null,
    name: track.name || '',
    uri: track.uri || '',
    is_local: Boolean(track.is_local),
    duration_ms: track.duration_ms || 0,
    preview_url: track.preview_url || '',
    external_urls: track.external_urls && track.external_urls.spotify
      ? { spotify: track.external_urls.spotify }
      : {},
    album: track.album ? {
      name: track.album.name || '',
      images: simplifySpotifyImages(track.album.images),
    } : null,
    artists: Array.isArray(track.artists)
      ? track.artists
          .filter(artist => artist && artist.name)
          .map(artist => ({ id: artist.id || null, name: artist.name }))
      : [],
  };
}

const PLAYLIST_IMPORT_PAGE_SIZE = 50;
const PLAYLIST_IMPORT_CONCURRENCY = 3;

async function fetchSpotifyPlaylistImport(accessToken, playlistId, { signal } = {}) {
  if (!/^[A-Za-z0-9]{22}$/.test(playlistId)) {
    throw spotifyRequestError('Enter a valid Spotify playlist ID.', 400, 'INVALID_PLAYLIST_ID');
  }
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) abortFromCaller();
    else signal.addEventListener('abort', abortFromCaller, { once: true });
  }
  try {
    controller.signal.throwIfAborted();
    return await fetchSpotifyPlaylistImportSnapshot(accessToken, playlistId, controller);
  } finally {
    signal?.removeEventListener('abort', abortFromCaller);
  }
}

async function fetchSpotifyPlaylistImportSnapshot(accessToken, playlistId, controller) {
  const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
  const fetchJson = async url => {
    controller.signal.throwIfAborted();
    const payload = await spotifyApiFetch(url, { accessToken, signal: controller.signal, json: true });
    controller.signal.throwIfAborted();
    return payload;
  };
  // February 2026 Development apps expose items/item; Extended apps retain
  // tracks/track. Avoid a fields filter containing fields removed in either API.
  const playlist = await fetchJson(playlistUrl);
  if (!playlist || playlist.id !== playlistId) {
    throw spotifyRequestError('Spotify returned invalid playlist metadata.', 502, 'INCOMPLETE_IMPORT');
  }
  const endpoint = playlist.items && typeof playlist.items === 'object' ? 'items'
    : playlist.tracks && typeof playlist.tracks === 'object' ? 'tracks' : '';
  if (!endpoint) {
    throw spotifyRequestError('Spotify did not expose this playlist to the current app or account.', 403, 'PLAYLIST_ACCESS_DENIED');
  }
  const total = playlist[endpoint].total;
  if (!Number.isSafeInteger(total) || total < 0) {
    throw spotifyRequestError('Spotify returned an invalid playlist item count.', 502, 'INCOMPLETE_IMPORT');
  }
  const itemKey = endpoint === 'items' ? 'item' : 'track';
  const unwrapItem = item => {
    if (!item || typeof item !== 'object' || !Object.prototype.hasOwnProperty.call(item, itemKey)) {
      throw spotifyRequestError('Spotify returned an invalid playlist item.', 502, 'INCOMPLETE_IMPORT');
    }
    const media = item[itemKey];
    if (media != null && (typeof media !== 'object' || Array.isArray(media)
        || (media.type && !['track', 'episode'].includes(media.type))
        || (media.type !== 'episode' && !item.is_local && !media.is_local && !Array.isArray(media.artists)))) {
      throw spotifyRequestError('Spotify returned an unsupported playlist item.', 502, 'INCOMPLETE_IMPORT');
    }
    return media;
  };
  const pageUrl = offset => `${playlistUrl}/${endpoint}?limit=${PLAYLIST_IMPORT_PAGE_SIZE}&offset=${offset}`;
  const fetchPage = async offset => {
    const page = await fetchJson(pageUrl(offset));
    const expected = Math.min(PLAYLIST_IMPORT_PAGE_SIZE, total - offset);
    if (!page || !Array.isArray(page.items) || page.total !== total || page.items.length !== expected
        || (page.offset !== undefined && page.offset !== offset)
        || (page.limit !== undefined && page.limit !== PLAYLIST_IMPORT_PAGE_SIZE)
        || (offset + expected < total ? typeof page.next !== 'string' || !page.next : page.next !== null)) {
      throw spotifyRequestError('Spotify playlist pages were incomplete or changed during import. Try again.', 502, 'INCOMPLETE_IMPORT');
    }
    page.items.forEach(unwrapItem);
    return page.items;
  };
  const firstPage = await fetchPage(0);
  const pageCount = Math.max(1, Math.ceil(total / PLAYLIST_IMPORT_PAGE_SIZE));
  const pages = new Array(pageCount);
  pages[0] = firstPage;

  const remainingOffsets = [];
  for (let offset = PLAYLIST_IMPORT_PAGE_SIZE; offset < total; offset += PLAYLIST_IMPORT_PAGE_SIZE) {
    remainingOffsets.push(offset);
  }

  if (remainingOffsets.length) {
    let cursor = 0;
    let failure = null;
    const worker = async () => {
      while (!failure && !controller.signal.aborted && cursor < remainingOffsets.length) {
        const myIndex = cursor++;
        const offset = remainingOffsets[myIndex];
        try {
          pages[offset / PLAYLIST_IMPORT_PAGE_SIZE] = await fetchPage(offset);
        } catch (error) {
          if (!failure) {
            failure = error;
            controller.abort(error);
          }
        }
      }
    };
    const workerCount = Math.min(PLAYLIST_IMPORT_CONCURRENCY, remainingOffsets.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    if (failure) throw failure;
  }
  controller.signal.throwIfAborted();
  if (playlist.snapshot_id) {
    const current = await fetchJson(playlistUrl);
    if (current?.id !== playlist.id || current.snapshot_id !== playlist.snapshot_id) {
      throw spotifyRequestError('This playlist changed during import. Try again to load a consistent copy.', 502, 'INCOMPLETE_IMPORT');
    }
  }

  const tracks = [];
  const skippedItems = { unavailable: 0, episodes: 0, local: 0 };
  for (const page of pages) {
    for (const item of page) {
      const track = unwrapItem(item);
      if (!track) { skippedItems.unavailable += 1; continue; }
      if (track.type === 'episode') { skippedItems.episodes += 1; continue; }
      if (item.is_local || track.is_local) { skippedItems.local += 1; continue; }
      const normalized = normalizeSpotifyImportTrack(track);
      if (!normalized.artists.length) { skippedItems.unavailable += 1; continue; }
      tracks.push(normalized);
    }
  }

  return {
    playlist: {
      id: playlist.id,
      name: playlist.name || 'Untitled playlist',
      external_urls: playlist.external_urls || {},
      images: simplifySpotifyImages(playlist.images),
      owner: playlist.owner || {},
      tracks: { total },
      items: { total },
      ...(playlist.snapshot_id ? { snapshot_id: playlist.snapshot_id } : {}),
    },
    tracks,
    importSummary: { totalItems: total, importedTracks: tracks.length, skippedItems },
  };
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

async function handleSpotifyToken(req, res) {
  try {
    const session = await getSpotifyUserSession(req, res);
    if (session) {
      sendJson(res, 200, {
        access_token: session.accessToken,
        token_type: 'Bearer',
        expires_in: Math.max(1, Math.round((session.expiresAt - Date.now()) / 1000)),
        source: 'user',
        scope: session.scope,
      });
      return;
    }

    const payload = await getSpotifyAppTokenPayload();
    sendJson(res, 200, {
      ...payload,
      source: 'app',
    });
  } catch (error) {
    sendSpotifyError(res, error, 'Failed to get Spotify token from upstream.');
  }
}

async function handleSpotifyLogin(req, res, requestUrl) {
  if (!spotifyConfigured()) {
    sendJson(res, 501, { error: 'Spotify login is not configured on the server.' });
    return;
  }

  pruneSpotifyLocalHandoffs();
  const canonicalLoginUrl = getCanonicalSpotifyLoginUrl(req, requestUrl);
  if (canonicalLoginUrl) {
    const origin = new URL(getExternalBaseUrl(req));
    const loginUrl = new URL(canonicalLoginUrl);
    if (origin.hostname === 'localhost' && loginUrl.hostname === '127.0.0.1') {
      const callback = new URL(getSpotifyRedirectUri(req));
      if (origin.protocol !== loginUrl.protocol || origin.port !== loginUrl.port ||
          callback.pathname !== '/api/auth/spotify/callback' || callback.search || callback.hash) {
        sendJson(res, 400, { error: 'The local Spotify callback must use the same port and protocol as this app.', code: 'SPOTIFY_REDIRECT_MISMATCH' });
        return;
      }
      const relay = {
        purpose: 'spotify-local-auth-relay',
        state: crypto.randomBytes(18).toString('hex'),
        returnTo: sanitizeReturnTo(requestUrl.searchParams.get('returnTo') || '/'),
        bridgeOrigin: origin.origin,
        ts: Date.now(),
      };
      writeSpotifyStateCookie(res, req, relay);
      loginUrl.search = '';
      loginUrl.searchParams.set('bridge', sealJson(relay));
      if (requestUrl.searchParams.get('show_dialog') === '1') loginUrl.searchParams.set('show_dialog', '1');
      sendRedirect(res, 302, loginUrl.toString(), { 'Referrer-Policy': 'no-referrer' });
      return;
    }
    sendRedirect(res, 302, canonicalLoginUrl);
    return;
  }

  const { clientId } = getSpotifyCredentials();
  let statePayload;
  const bridge = requestUrl.searchParams.get('bridge');
  if (bridge !== null) {
    statePayload = bridge.length <= 4096 ? openJson(bridge) : null;
    if (!spotifyStateIsFresh(statePayload) || statePayload.purpose !== 'spotify-local-auth-relay' ||
        !/^[a-f0-9]{36}$/.test(statePayload.state) || !getSpotifyLocalBridgeOrigin(req, statePayload)) {
      sendJson(res, 400, { error: 'This local Spotify login link is invalid or expired. Start again from the app.', code: 'SPOTIFY_STATE_MISMATCH' });
      return;
    }
    statePayload.returnTo = sanitizeReturnTo(statePayload.returnTo);
  } else {
    statePayload = {
      state: crypto.randomBytes(18).toString('hex'),
      returnTo: sanitizeReturnTo(requestUrl.searchParams.get('returnTo') || '/'),
      ts: Date.now(),
    };
  }
  writeSpotifyStateCookie(res, req, statePayload);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', getSpotifyRedirectUri(req));
  authUrl.searchParams.set('scope', SPOTIFY_OAUTH_SCOPES.join(' '));
  authUrl.searchParams.set('state', statePayload.state);
  authUrl.searchParams.set('show_dialog', requestUrl.searchParams.get('show_dialog') === '1' ? 'true' : 'false');

  sendRedirect(res, 302, authUrl.toString(), { 'Referrer-Policy': 'no-referrer' });
}

async function handleSpotifyCallback(req, res, requestUrl) {
  const cookies = parseCookies(req);
  const stateCookie = openJson(cookies[SPOTIFY_STATE_COOKIE]);
  const returnTo = sanitizeReturnTo(stateCookie && stateCookie.returnTo ? stateCookie.returnTo : '/');
  clearCookie(res, req, SPOTIFY_STATE_COOKIE, '/api/auth/spotify');
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  if (!spotifyStateIsFresh(stateCookie) || !state || stateCookie.state !== state) {
    sendRedirect(res, 302, buildReturnUrl(returnTo, { spotify: 'error', code: 'state_mismatch' }));
    return;
  }
  const bridgeOrigin = getSpotifyLocalBridgeOrigin(req, stateCookie);
  if (stateCookie.bridgeOrigin && !bridgeOrigin) {
    sendRedirect(res, 302, buildReturnUrl('/', { spotify: 'error', code: 'state_mismatch' }));
    return;
  }
  const finishUrl = params => `${bridgeOrigin}${buildReturnUrl(returnTo, params)}`;
  const errorCode = requestUrl.searchParams.get('error');
  if (errorCode) {
    sendRedirect(res, 302, finishUrl({ spotify: 'error', code: errorCode }), { 'Referrer-Policy': 'no-referrer' });
    return;
  }
  if (!code) {
    sendRedirect(res, 302, finishUrl({ spotify: 'error', code: 'state_mismatch' }));
    return;
  }

  try {
    const payload = await requestSpotifyToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: getSpotifyRedirectUri(req),
    });

    const session = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      expiresAt: Date.now() + Math.max(60, Number(payload.expires_in) || 3600) * 1000,
      scope: String(payload.scope || '').split(/\s+/).filter(Boolean),
      user: null,
    };

    try {
      session.user = await fetchSpotifyProfile(session.accessToken);
    } catch (error) {
      session.user = null;
    }

    if (bridgeOrigin) {
      if (!saveSpotifyLocalHandoff(stateCookie.state, bridgeOrigin, session)) {
        sendRedirect(res, 302, finishUrl({ spotify: 'error', code: 'login_busy' }));
        return;
      }
    } else {
      writeSpotifySessionCookie(res, req, session);
    }
    sendRedirect(res, 302, bridgeOrigin ? `${bridgeOrigin}/api/auth/spotify/complete` : finishUrl({ spotify: 'connected' }), {
      'Referrer-Policy': 'no-referrer',
    });
  } catch (error) {
    console.warn('Spotify callback failed:', error.status || 502);
    sendRedirect(res, 302, finishUrl({ spotify: 'error', code: 'token_exchange_failed' }));
  }
}

async function handleSpotifyComplete(req, res) {
  const origin = new URL(getExternalBaseUrl(req));
  if (!isLocalRequest(req) || origin.hostname !== 'localhost') {
    sendJson(res, 400, { error: 'This Spotify login must finish on its original local app.', code: 'SPOTIFY_STATE_MISMATCH' });
    return;
  }
  const stateCookie = openJson(parseCookies(req)[SPOTIFY_STATE_COOKIE]);
  const returnTo = stateCookie && stateCookie.bridgeOrigin === origin.origin
    ? sanitizeReturnTo(stateCookie.returnTo) : '/';
  const session = claimSpotifyLocalHandoff(req, res);
  if (!session) clearCookie(res, req, SPOTIFY_STATE_COOKIE, '/api/auth/spotify');
  sendRedirect(res, 302, buildReturnUrl(returnTo, session
    ? { spotify: 'connected' }
    : { spotify: 'error', code: 'state_mismatch' }), { 'Referrer-Policy': 'no-referrer' });
}

async function handleSpotifyLogout(req, res) {
  clearCookie(res, req, SPOTIFY_SESSION_COOKIE);
  sendJson(res, 200, { ok: true });
}

async function handleSpotifySession(req, res) {
  try {
    const session = claimSpotifyLocalHandoff(req, res) || await getSpotifyUserSession(req, res);
    if (!session) {
      sendJson(res, 200, {
        connected: false,
        spotifyManaged: spotifyConfigured(),
      });
      return;
    }

    if (!session.user) {
      try {
        session.user = await fetchSpotifyProfile(session.accessToken);
        writeSpotifySessionCookie(res, req, session);
      } catch (error) {
        session.user = null;
      }
    }

    sendJson(res, 200, {
      connected: true,
      user: session.user,
      scope: session.scope,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    sendSpotifyError(res, error, 'Spotify session is temporarily unavailable.');
  }
}

async function handleSpotifyUserPlaylists(req, res) {
  try {
    const session = await getSpotifyUserSession(req, res);
    if (!session) {
      sendJson(res, 401, {
        error: 'Sign in with Spotify first to browse your playlists.',
        code: 'SPOTIFY_LOGIN_REQUIRED',
      });
      return;
    }
    const items = await fetchSpotifyUserPlaylists(session.accessToken);
    sendJson(res, 200, { items });
  } catch (error) {
    sendSpotifyError(res, error, 'Failed to load Spotify playlists.');
  }
}

async function handleSpotifyPlaylistImport(req, res, playlistId) {
  if (!/^[A-Za-z0-9]{22}$/.test(playlistId)) {
    sendSpotifyError(res, spotifyRequestError('Enter a valid Spotify playlist ID.', 400, 'INVALID_PLAYLIST_ID'));
    return;
  }
  const controller = new AbortController();
  const abortOnDisconnect = () => controller.abort();
  const onResponseClose = () => {
    if (!res.writableEnded) abortOnDisconnect();
  };
  // IncomingMessage.close also fires after a normal, fully received request.
  // Response.close identifies a client that disappeared while we were paging.
  req.once('aborted', abortOnDisconnect);
  res.once('close', onResponseClose);
  if (req.aborted || res.destroyed) abortOnDisconnect();
  try {
    controller.signal.throwIfAborted();
    const session = await getSpotifyUserSession(req, res);
    controller.signal.throwIfAborted();
    let accessToken = '';
    let source = 'app';

    if (session) {
      accessToken = session.accessToken;
      source = 'user';
    } else {
      const payload = await getSpotifyAppTokenPayload();
      accessToken = payload.access_token;
    }

    controller.signal.throwIfAborted();
    const payload = await fetchSpotifyPlaylistImport(accessToken, playlistId, { signal: controller.signal });
    // The same route can return private content selected by a user cookie.
    // Keep imports out of shared/CDN caches, including app-token responses.
    sendJson(res, 200, { source, ...payload });
  } catch (error) {
    if (!controller.signal.aborted) sendSpotifyError(res, error, 'Failed to load Spotify playlist.');
  } finally {
    req.removeListener('aborted', abortOnDisconnect);
    res.removeListener('close', onResponseClose);
  }
}

const SPOTIFY_SHORTLINK_TIMEOUT_MS = 8000;
const SPOTIFY_SHORTLINK_MAX_REDIRECTS = 4;
const SPOTIFY_SHORTLINK_BODY_CAP = 64 * 1024;

function validateSpotifyShareTarget(raw, base = undefined) {
  let url;
  try { url = new URL(raw, base); } catch (_) {}
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.port
      || !['spotify.link', 'open.spotify.com'].includes(url.hostname)) {
    throw spotifyRequestError('This share link cannot be opened safely. Paste the full open.spotify.com playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
  }
  // URL removes an explicit default :443. Reject that spelling as well.
  if (/^(?:https:)?\/{2,}[^/?#]*:/i.test(String(raw).replace(/\\/g, '/'))) {
    throw spotifyRequestError('Use a Spotify share link without a port or credentials.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
  }
  url.hash = '';
  if (url.hostname === 'open.spotify.com') {
    const match = url.pathname.match(/^\/(?:intl-[a-z]{2}\/)?playlist\/([A-Za-z0-9]{22})\/?$/);
    if (!match) {
      throw spotifyRequestError('This Spotify link is not a playlist. Paste the full playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
    }
    return { url, id: match[1] };
  }
  if (!url.pathname.slice(1)) {
    throw spotifyRequestError('Paste a complete Spotify share link or the full playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
  }
  return { url, id: '' };
}

async function resolveSpotifyShareLink(raw) {
  let target = validateSpotifyShareTarget(raw);
  if (target.url.hostname !== 'spotify.link') {
    throw spotifyRequestError('The share-link resolver accepts spotify.link links only.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SPOTIFY_SHORTLINK_TIMEOUT_MS);
  const visited = new Set();
  try {
    for (let hop = 0; hop < SPOTIFY_SHORTLINK_MAX_REDIRECTS; hop++) {
      if (visited.has(target.url.href)) {
        throw spotifyRequestError('This Spotify share link redirects in a loop. Paste the full playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
      }
      visited.add(target.url.href);
      const response = await fetch(target.url.href, { redirect: 'manual', signal: controller.signal });
      const location = response.headers.get('location');
      const length = Number(response.headers.get('content-length') || 0);
      // A short link is resolved only from Location, never from HTML or preview
      // data. Cancel every body without reading it; reject oversized previews.
      if (response.body) await response.body.cancel();
      if (length > SPOTIFY_SHORTLINK_BODY_CAP) {
        throw spotifyRequestError('Spotify returned an oversized share-link response. Paste the full playlist link.', 502, 'UNSUPPORTED_SPOTIFY_LINK');
      }
      if (response.status === 429) {
        const error = spotifyRequestError('Spotify share links are rate limited. Try again later or paste the full playlist link.', 429, 'RATE_LIMITED');
        error.retryAfter = spotifyRetryAfter(response.headers);
        throw error;
      }
      if (response.status >= 500) {
        throw spotifyRequestError('Spotify share links are temporarily unavailable. Paste the full playlist link or try again later.', response.status, 'UNSUPPORTED_SPOTIFY_LINK');
      }
      if (![301, 302, 303, 307, 308].includes(response.status) || !location) {
        throw spotifyRequestError('Spotify did not redirect to a playlist. Paste the full open.spotify.com playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
      }
      target = validateSpotifyShareTarget(location, target.url);
      if (target.id) return { id: target.id, url: `https://open.spotify.com/playlist/${target.id}` };
    }
    throw spotifyRequestError('This Spotify share link has too many redirects. Paste the full playlist link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
  } catch (error) {
    if (error.name === 'AbortError') {
      throw spotifyRequestError('Spotify share-link resolution timed out. Paste the full playlist link.', 504, 'UNSUPPORTED_SPOTIFY_LINK');
    }
    throw error;
  } finally {
    controller.abort();
    clearTimeout(timeout);
  }
}

async function handleSpotifyResolveLink(req, res) {
  try {
    let payload;
    try { payload = JSON.parse((await readRequestBody(req, 4096)).toString('utf8')); }
    catch (error) {
      if (error.status) throw error;
      throw spotifyRequestError('Send a Spotify share link as JSON.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
    }
    if (!payload || typeof payload.url !== 'string') {
      throw spotifyRequestError('Paste a complete Spotify share link.', 400, 'UNSUPPORTED_SPOTIFY_LINK');
    }
    sendJson(res, 200, await resolveSpotifyShareLink(payload.url));
  } catch (error) {
    sendSpotifyError(res, error, 'Could not resolve the Spotify share link. Paste the full playlist link.', 'UNSUPPORTED_SPOTIFY_LINK');
  }
}

async function handleLocalSetup(req, res) {
  if (!isLocalRequest(req)) {
    sendJson(res, 403, { error: 'Local setup is only available on localhost.' });
    return;
  }

  let payload = {};
  try {
    const rawBody = await readRequestBody(req);
    payload = rawBody.length ? JSON.parse(rawBody.toString('utf8')) : {};
  } catch (error) {
    sendJson(res, 400, { error: 'Setup payload must be valid JSON.' });
    return;
  }

  const spotifyClientId = String(payload.spotifyClientId || '').trim();
  const spotifyClientSecret = String(payload.spotifyClientSecret || '').trim();
  const ticketmasterApiKeys = String(payload.ticketmasterApiKeys || '').trim();
  const currentSpotify = getSpotifyCredentials();
  const hasIncomingSpotify = Boolean(spotifyClientId || spotifyClientSecret);
  const hasIncomingTicketmaster = Boolean(ticketmasterApiKeys);
  const finalSpotifyClientId = spotifyClientId || currentSpotify.clientId;
  const finalSpotifyClientSecret = spotifyClientSecret || currentSpotify.clientSecret;
  const hasFinalSpotify = Boolean(finalSpotifyClientId && finalSpotifyClientSecret);

  if (!hasIncomingSpotify && !hasIncomingTicketmaster) {
    sendJson(res, 400, { error: 'Paste Spotify credentials and/or at least one Ticketmaster API key.' });
    return;
  }

  if (hasIncomingSpotify && (!spotifyClientId || !spotifyClientSecret)) {
    sendJson(res, 400, { error: 'Spotify Client ID and Client Secret must both be provided together.' });
    return;
  }

  const redirectUri = getSpotifyRedirectUri(req);

  try {
    const updates = { PORT: String(PORT) };
    const savedParts = [];

    if (hasFinalSpotify) {
      const sessionSecret = process.env.SESSION_SECRET
        ? String(process.env.SESSION_SECRET).trim()
        : crypto.randomBytes(32).toString('hex');
      updates.SPOTIFY_CLIENT_ID = finalSpotifyClientId;
      updates.SPOTIFY_CLIENT_SECRET = finalSpotifyClientSecret;
      updates.SPOTIFY_REDIRECT_URI = redirectUri;
      updates.SESSION_SECRET = sessionSecret;
      savedParts.push(hasIncomingSpotify ? 'Spotify login is enabled.' : 'Spotify login stays enabled.');
    }

    if (hasIncomingTicketmaster) {
      updates.TICKETMASTER_API_KEYS = ticketmasterApiKeys;
      savedParts.push('Ticketmaster keys were saved locally.');
    }

    await writeLocalEnv(updates);
    sendJson(res, 200, {
      ok: true,
      redirectUri,
      config: appConfig(req),
      message: savedParts.join(' '),
    });
  } catch (error) {
    console.error('Local setup error:', error);
    sendJson(res, 500, { error: 'Failed to save local setup.' });
  }
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, `${getRequestProtocol(req)}://${getRequestHost(req)}`);
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
      `window.__SERVER_CONFIG__ = ${JSON.stringify(appConfig(req), null, 2)};\n`,
      {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    );
    return;
  }

  if (pathname === '/api/health') {
    const config = appConfig(req);
    sendJson(res, 200, {
      ok: true,
      ticketmasterManaged: config.ticketmasterManaged,
      spotifyManaged: config.spotifyManaged,
      spotifyLoginManaged: config.spotifyLoginManaged,
      localSetupAllowed: config.localSetupAllowed,
      spotifyRedirectUri: config.spotifyRedirectUri,
    });
    return;
  }

  if (pathname === '/api/local/setup') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      return;
    }
    await handleLocalSetup(req, res);
    return;
  }

  if (pathname === '/api/auth/spotify/login') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifyLogin(req, res, requestUrl);
    return;
  }

  if (pathname === '/api/auth/spotify/callback') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifyCallback(req, res, requestUrl);
    return;
  }

  if (pathname === '/api/auth/spotify/complete') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifyComplete(req, res);
    return;
  }

  if (pathname === '/api/auth/spotify/session') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifySession(req, res);
    return;
  }

  if (pathname === '/api/auth/spotify/logout') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      return;
    }
    await handleSpotifyLogout(req, res);
    return;
  }

  if (pathname === '/api/spotify/token') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      return;
    }
    await handleSpotifyToken(req, res);
    return;
  }

  if (pathname === '/api/spotify/me/playlists') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifyUserPlaylists(req, res);
    return;
  }

  if (pathname === '/api/spotify/resolve-link') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'POST' });
      return;
    }
    await handleSpotifyResolveLink(req, res);
    return;
  }

  const playlistImportMatch = pathname.match(/^\/api\/spotify\/playlists\/([A-Za-z0-9]+)\/import$/);
  if (playlistImportMatch) {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET' });
      return;
    }
    await handleSpotifyPlaylistImport(req, res, playlistImportMatch[1]);
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
    console.log(`ConcertTracker server listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = { handleRequest };
