# ConcertTracker

ConcertTracker is a concert and festival tracker that scans large artist lists, deduplicates overlapping events, builds tour lines, and surfaces likely false positives before they pollute the calendar.

This repo is the production-ready restructure of the old single-file prototype:

- `client/` contains the browser app.
- `server/` serves the app and proxies external APIs through the same origin.
- secrets now live in environment variables instead of the browser bundle.

## Why the backend exists

The old app called Ticketmaster, Bandsintown, Spotify, and Deezer directly from the browser. That caused three real problems:

1. Ticketmaster and some other providers were frequently blocked by CORS or origin rules.
2. API keys and Spotify secrets were embedded in client code.
3. The app was difficult to share with external users because every user effectively needed your private setup.

The new backend fixes that by serving a same-origin proxy at `/api/proxy`, a dedicated Spotify token route at `/api/spotify/token`, and Spotify login/session endpoints for private playlist access.

## Quick start

1. Copy `.env.example` to `.env`.
2. Add at least one Ticketmaster key:

```env
TICKETMASTER_API_KEYS=your_ticketmaster_key
```

3. Add Spotify credentials if you want playlist import, Spotify login, and Spotify top-tracks:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3002/api/auth/spotify/callback
SESSION_SECRET=replace_with_a_long_random_secret
```

Register the same redirect URI in the Spotify developer dashboard before testing login.

4. Start the app:

```bash
npm start
```

5. Open [http://localhost:3002](http://localhost:3002).

## Continue On Mac With Codex

Use the dedicated handoff guide in [MAC_HANDOFF.md](./MAC_HANDOFF.md).

Short version:

1. Install Node 20+, Git, and Chrome.
2. Clone the repo and copy `.env.example` to `.env`.
3. Keep Spotify redirect canonical:

```text
http://localhost:3002/api/auth/spotify/callback
```

4. Run:

```bash
npm run check
npm test
npm start
```

5. Open this repo in Codex and start with:

```text
Read AGENTS.md, README.md, and MAC_HANDOFF.md. Check git status, run npm run check, and continue working on ConcertTracker. Do not edit .env and do not commit secrets.
```

## Scripts

- `npm start` - start the local server
- `npm run dev` - start the server with Node watch mode
- `npm run check` - syntax check server and client code
- `npm test` - run the UI regression suite

## External-user readiness

This restructure is aimed at deployable sharing:

- Ticketmaster keys can be managed entirely on the server.
- Spotify credentials can be managed entirely on the server.
- Spotify login runs through encrypted HttpOnly cookies, so user sessions stay out of local JS storage.
- browser-side requests are routed through a same-origin proxy, which removes the `Failed to fetch` / CORS pattern that the prototype was hitting.
- browser-side Spotify credentials are no longer accepted or stored.
- scanned playlist results, artist caches, and UI state stay in the browser via `localStorage` and IndexedDB, so a Vercel deploy still keeps each user's local cache on that origin.

## Deployment notes

Any platform that can run a small Node HTTP server will work. The server has no runtime dependencies beyond Node 20+.

This repo is prepared for Vercel with:

- `api/index.js` exporting the request handler
- `vercel.json` routing all requests through that handler
- `.vercelignore` excluding local env files, logs, screenshots, and legacy artifacts

Recommended environment variables:

- `PORT`
- `TICKETMASTER_API_KEYS`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`
- `SESSION_SECRET`

Without the Spotify env vars, playlist import, Spotify login, and Spotify-derived track panels stay unavailable for that deployment.

## Repository layout

```text
api/
  index.js
client/
  index.html
  assets/
    app.js
    styles.css
server/
  index.js
tests/
  ui.integration.test.mjs
vercel.json
```

## Security

- do not commit `.env`
- do not put production keys back into `client/assets/app.js`
- use `TICKETMASTER_API_KEYS` when you want server-side key rotation
- keep `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` only in the deployment environment
- use a separate `SESSION_SECRET` in production instead of reusing the Spotify client secret fallback
