'use strict';

// UI regressions must never consume API quota or use the developer's secrets.
for (const name of ['TICKETMASTER_API_KEYS', 'TICKETMASTER_API_KEY', 'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET', 'SESSION_SECRET']) {
  process.env[name] = 'offline-ui-test';
}
process.env.SPOTIFY_REDIRECT_URI = `http://127.0.0.1:${process.env.PORT}/api/auth/spotify/callback`;
let spotifyFixtures = {};
let spotifyCalls = [];
const jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { 'Content-Type': 'application/json' },
});

globalThis.fetch = async input => {
  const url = new URL(typeof input === 'string' ? input : input.url);
  if (url.origin === 'https://accounts.spotify.com' && url.pathname === '/api/token') {
    return jsonResponse({ access_token: 'offline-test-token', token_type: 'Bearer', expires_in: 3600 });
  }
  if (url.origin === 'https://api.spotify.com') {
    const match = url.pathname.match(/^\/v1\/playlists\/([A-Za-z0-9]{22})(?:\/(tracks|items))?$/);
    if (match) {
      const [, id, endpoint] = match;
      spotifyCalls.push({ id, endpoint: endpoint || 'metadata', offset: Number(url.searchParams.get('offset') || 0) });
      const fixture = spotifyFixtures[id];
      if (!fixture) return jsonResponse({ error: { status: 404, message: 'Offline playlist not found' } }, 404);
      if (fixture.delayMs) await new Promise(resolve => setTimeout(resolve, fixture.delayMs));
      if (fixture.error) return jsonResponse({ error: { status: fixture.error.status, message: fixture.error.message } }, fixture.error.status);
      if (!endpoint) return jsonResponse(fixture.playlist);
      const tracks = fixture.tracks || [];
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 50);
      const key = endpoint === 'items' ? 'item' : 'track';
      return jsonResponse({
        items: tracks.slice(offset, offset + limit).map(track => ({ [key]: track })),
        total: tracks.length, offset, limit,
        next: offset + limit < tracks.length ? `${url.origin}${url.pathname}?limit=${limit}&offset=${offset + limit}` : null,
      });
    }
  }
  return jsonResponse({ error: 'Offline UI test' }, 503);
};

const http = require('node:http');
const { handleRequest } = require('../server/index.js');
http.createServer(async (req, res) => {
  if (new URL(req.url, 'http://127.0.0.1').pathname === '/__test/spotify') {
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      spotifyFixtures = JSON.parse(Buffer.concat(chunks).toString('utf8')).playlists || {};
      spotifyCalls = [];
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ calls: spotifyCalls }));
    return;
  }
  handleRequest(req, res);
}).listen(Number(process.env.PORT), '127.0.0.1');
