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
    appVersion: '2.28.0031',
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
    let cacheControl;
    if (ext === '.html') {
      cacheControl = 'no-store';
    } else if (IMMUTABLE_EXTS.has(ext) && hasVersionQuery) {
      cacheControl = 'public, max-age=31536000, immutable';
    } else if (IMMUTABLE_EXTS.has(ext)) {
      cacheControl = 'no-store';
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
  return String(value || '')
    .trim()
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(':')[0]
    .toLowerCase();
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

function getLocalhostBaseUrl(req) {
  const protocol = getRequestProtocol(req);
  try {
    const requestOrigin = new URL(`${protocol}://${getRequestHost(req)}`);
    if (isLoopbackHost(requestOrigin.hostname)) {
      const port = requestOrigin.port || String(PORT);
      return `${protocol}://localhost${port ? `:${port}` : ''}`;
    }
  } catch (error) {
    // Fall through to the request host when the header is malformed.
  }
  return getExternalBaseUrl(req);
}

function sanitizeReturnTo(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return '/';
  if (!rawValue.startsWith('/')) return '/';
  if (rawValue.startsWith('//')) return '/';
  return rawValue;
}

function getSpotifyRedirectUri(req) {
  const configured = (process.env.SPOTIFY_REDIRECT_URI || '').trim();
  if (configured) return configured;
  return `${getLocalhostBaseUrl(req)}/api/auth/spotify/callback`;
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
  if (!isLoopbackHost(redirectUrl.hostname) || !isLoopbackHost(requestOrigin.hostname)) return '';
  if (redirectUrl.origin === requestOrigin.origin) return '';
  return new URL(`${requestUrl.pathname}${requestUrl.search}`, redirectUrl.origin).toString();
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

  const rawBody = await upstream.text();

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
  let response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
        ...(options.headers || {}),
      },
      body: options.body,
      signal: controller.signal,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      const timeoutError = new Error(`Spotify request timed out after ${Math.round(timeoutMs / 1000)}s.`);
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const rawBody = await response.text();
    let payload = {};
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      payload = {};
    }
    const details = payload.error && typeof payload.error === 'object'
      ? payload.error.message
      : payload.error_description || payload.error;
    const error = new Error(details || `Spotify API request failed (${response.status}).`);
    error.status = response.status;
    error.payload = payload;
    error.rawBody = rawBody;
    throw error;
  }

  return response;
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
  const response = await spotifyApiFetch('https://api.spotify.com/v1/me', {
    accessToken,
  });
  const data = await response.json();
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
    clearCookie(res, req, SPOTIFY_SESSION_COOKIE);
    return null;
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
    const response = await spotifyApiFetch(nextUrl, { accessToken });
    const data = await response.json();

    for (const item of data.items || []) {
      if (!item || !item.id) continue;
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
        trackCount: item.tracks && typeof item.tracks.total === 'number' ? item.tracks.total : 0,
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

const PLAYLIST_IMPORT_PAGE_SIZE = 100;
const PLAYLIST_IMPORT_CONCURRENCY = 6;
const PLAYLIST_TRACK_FIELDS =
  'items(track(id,name,uri,is_local,duration_ms,preview_url,external_urls,album(name,images),artists(name,id))),next,total';

async function fetchSpotifyPlaylistImport(accessToken, playlistId) {
  const baseFields = [
    'id',
    'name',
    'images',
    'external_urls',
    'owner(display_name,id)',
    'tracks(total)',
  ].join(',');

  const tracksPageUrl = offset =>
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks` +
    `?limit=${PLAYLIST_IMPORT_PAGE_SIZE}&offset=${offset}` +
    `&fields=${encodeURIComponent(PLAYLIST_TRACK_FIELDS)}`;

  const fetchJson = async url => {
    const response = await spotifyApiFetch(url, { accessToken });
    return response.json();
  };

  const [playlist, firstPage] = await Promise.all([
    fetchJson(`https://api.spotify.com/v1/playlists/${playlistId}?fields=${encodeURIComponent(baseFields)}`),
    fetchJson(tracksPageUrl(0)),
  ]);

  const total = Number(firstPage.total) || 0;
  const pageCount = Math.max(1, Math.ceil(total / PLAYLIST_IMPORT_PAGE_SIZE));
  const pages = new Array(pageCount);
  pages[0] = firstPage.items || [];

  const remainingOffsets = [];
  for (let offset = PLAYLIST_IMPORT_PAGE_SIZE; offset < total; offset += PLAYLIST_IMPORT_PAGE_SIZE) {
    remainingOffsets.push(offset);
  }

  if (remainingOffsets.length) {
    let cursor = 0;
    const worker = async () => {
      while (cursor < remainingOffsets.length) {
        const myIndex = cursor++;
        const offset = remainingOffsets[myIndex];
        const data = await fetchJson(tracksPageUrl(offset));
        pages[offset / PLAYLIST_IMPORT_PAGE_SIZE] = data.items || [];
      }
    };
    const workerCount = Math.min(PLAYLIST_IMPORT_CONCURRENCY, remainingOffsets.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
  }

  const tracks = [];
  for (const page of pages) {
    for (const item of page || []) {
      const normalized = normalizeSpotifyImportTrack(item && item.track);
      if (normalized) tracks.push(normalized);
    }
  }

  return {
    playlist: {
      id: playlist.id,
      name: playlist.name || 'Untitled playlist',
      external_urls: playlist.external_urls || {},
      images: simplifySpotifyImages(playlist.images),
      owner: playlist.owner || {},
      tracks: { total: total || (playlist.tracks && playlist.tracks.total) || tracks.length },
    },
    tracks,
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
    sendJson(res, error.status || 502, {
      error: error.message || 'Failed to get Spotify token from upstream.',
      detail: error.payload || undefined,
    });
  }
}

async function handleSpotifyLogin(req, res, requestUrl) {
  if (!spotifyConfigured()) {
    sendJson(res, 501, { error: 'Spotify login is not configured on the server.' });
    return;
  }

  const canonicalLoginUrl = getCanonicalSpotifyLoginUrl(req, requestUrl);
  if (canonicalLoginUrl) {
    sendRedirect(res, 302, canonicalLoginUrl);
    return;
  }

  const { clientId } = getSpotifyCredentials();
  const state = crypto.randomBytes(18).toString('hex');
  const returnTo = sanitizeReturnTo(requestUrl.searchParams.get('returnTo') || '/');
  writeSpotifyStateCookie(res, req, {
    state,
    returnTo,
    ts: Date.now(),
  });

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', getSpotifyRedirectUri(req));
  authUrl.searchParams.set('scope', SPOTIFY_OAUTH_SCOPES.join(' '));
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('show_dialog', requestUrl.searchParams.get('show_dialog') === '1' ? 'true' : 'false');

  sendRedirect(res, 302, authUrl.toString());
}

async function handleSpotifyCallback(req, res, requestUrl) {
  const cookies = parseCookies(req);
  const stateCookie = openJson(cookies[SPOTIFY_STATE_COOKIE]);
  const returnTo = sanitizeReturnTo(stateCookie && stateCookie.returnTo ? stateCookie.returnTo : '/');
  clearCookie(res, req, SPOTIFY_STATE_COOKIE, '/api/auth/spotify');

  const errorCode = requestUrl.searchParams.get('error');
  if (errorCode) {
    sendRedirect(res, 302, buildReturnUrl(returnTo, { spotify: 'error', code: errorCode }));
    return;
  }

  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  if (!code || !stateCookie || stateCookie.state !== state) {
    sendRedirect(res, 302, buildReturnUrl(returnTo, { spotify: 'error', code: 'state_mismatch' }));
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

    writeSpotifySessionCookie(res, req, session);
    sendRedirect(res, 302, buildReturnUrl(returnTo, { spotify: 'connected' }));
  } catch (error) {
    console.error('Spotify callback error:', error);
    sendRedirect(res, 302, buildReturnUrl(returnTo, { spotify: 'error', code: 'token_exchange_failed' }));
  }
}

async function handleSpotifyLogout(req, res) {
  clearCookie(res, req, SPOTIFY_SESSION_COOKIE);
  sendJson(res, 200, { ok: true });
}

async function handleSpotifySession(req, res) {
  const session = await getSpotifyUserSession(req, res);
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
}

async function handleSpotifyUserPlaylists(req, res) {
  const session = await getSpotifyUserSession(req, res);
  if (!session) {
    sendJson(res, 401, {
      error: 'Sign in with Spotify first to browse your playlists.',
    });
    return;
  }

  try {
    const items = await fetchSpotifyUserPlaylists(session.accessToken);
    sendJson(res, 200, { items });
  } catch (error) {
    console.error('Spotify playlists error:', error);
    sendJson(res, error.status || 502, {
      error: error.message || 'Failed to load Spotify playlists.',
    });
  }
}

async function handleSpotifyPlaylistImport(req, res, playlistId) {
  try {
    const session = await getSpotifyUserSession(req, res);
    let accessToken = '';
    let source = 'app';

    if (session) {
      accessToken = session.accessToken;
      source = 'user';
    } else {
      const payload = await getSpotifyAppTokenPayload();
      accessToken = payload.access_token;
    }

    const payload = await fetchSpotifyPlaylistImport(accessToken, playlistId);
    const cacheHeaders = source === 'app'
      ? { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600' }
      : {};
    sendJson(res, 200, { source, ...payload }, cacheHeaders);
  } catch (error) {
    console.error('Spotify playlist import error:', error);
    const needsLogin =
      (error.status === 401 || error.status === 403 || error.status === 404) &&
      spotifyConfigured();

    sendJson(res, needsLogin ? 401 : (error.status || 502), {
      error: needsLogin
        ? 'Sign in with Spotify to open private or collaborative playlists.'
        : (error.message || 'Failed to load Spotify playlist.'),
      detail: error.payload || undefined,
    });
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
