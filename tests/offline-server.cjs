'use strict';

// UI regressions must never consume API quota or use the developer's secrets.
for (const name of ['TICKETMASTER_API_KEYS', 'TICKETMASTER_API_KEY', 'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET', 'SESSION_SECRET']) {
  process.env[name] = 'offline-ui-test';
}
process.env.SPOTIFY_REDIRECT_URI = `http://127.0.0.1:${process.env.PORT}/api/auth/spotify/callback`;
globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Offline UI test' }), {
  status: 503,
  headers: { 'Content-Type': 'application/json' },
});

const http = require('node:http');
const { handleRequest } = require('../server/index.js');
http.createServer(handleRequest).listen(Number(process.env.PORT), '127.0.0.1');
