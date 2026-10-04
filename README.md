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
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3002/api/auth/spotify/callback
SESSION_SECRET=replace_with_a_long_random_secret
```

Register the same redirect URI in the Spotify developer dashboard before testing login.

Spotify no longer accepts `localhost` in redirect URIs. Register
`http://127.0.0.1:3002/api/auth/spotify/callback` exactly. The tracker can stay
open at `http://localhost:3002`: local login uses the loopback IP for OAuth and
returns to the original browser origin, preserving its saved playlist data.
The local server also normalizes a legacy `localhost` callback from the
environment; the corresponding IP callback must still be registered with Spotify.

4. Start the app:

```bash
npm start
```

5. Open [http://localhost:3002](http://localhost:3002).

## Continue On Mac With Codex

Use the dedicated handoff guide in [MAC_HANDOFF.md](./MAC_HANDOFF.md).

Short version:

1. Install Node 20+, Git, and Chrome.
2. Clone the repo and install dependencies.
3. Pull secrets from Vercel:

```text
npx vercel login
npm run env:pull:dev
```

That command overwrites local `.env` from the linked Vercel `development` env. The current file is backed up into `tmp/` first.
If the repo is not linked yet, the script now attempts `vercel link --yes --project concerttracker` automatically before retrying.

4. Keep Spotify redirect canonical:

```text
http://127.0.0.1:3002/api/auth/spotify/callback
```

5. Run:

```bash
npm run check
npm test
npm start
```

6. Open this repo in Codex and start with:

```text
Read AGENTS.md, README.md, and MAC_HANDOFF.md. Check git status, run npm run check, and continue working on ConcertTracker. Do not edit .env and do not commit secrets.
```

## Scripts

- `npm start` - start the local server
- `npm run dev` - start the server with Node watch mode
- `npm run env:pull:dev` - pull `.env` from the linked Vercel project's `development` environment after backing up any existing local file
- `npm run check` - syntax check server and client code
- `npm test` - run the UI regression suite

Date filters use your local calendar day. Multi-day festivals stay visible until
their final day and match any selected date range they overlap, including after
restoring a saved session. Ticketmaster end dates are retained during import.

The map uses OpenStreetMap tiles with visible attribution. A service worker
keeps viewed tiles in a persistent cache independent of app releases, honoring
server freshness headers (seven days when no readable expiry is provided).
The cache trims to 512 tiles of up to 128 KiB each; expired tiles use normal
HTTP revalidation, and unsupported/restricted browsers retain normal loading.
Storage reads, network/body reads and background writes have separate deadlines
so a stalled cache cannot hold up a downloaded tile. A permitted stale PNG can
bridge a transient outage without extending its freshness; rate limits retain
the provider's Retry-After pause. Late native storage writes and pruning resume
bounded reconciliation when they finish, restoring newer known tiles and the
cache limit. Native storage calls cannot be canceled, so the limit is eventual
after a stall; worker termination can interrupt repair until another tile is stored.
Failed visible tiles retry twice at the same URL. **Retry map** and returning
online recover failed tiles without reloading healthy tiles or event markers.
Leaving the viewport cancels pending retries; hung image requests are stopped.
It loads the current viewport without background tile prefetching. Regression
tests run with isolated browser storage and offline API responses, so they do
not consume live provider quota or use your API credentials.

Map labels share one screen-space layout across tours, festivals, city clusters,
and focused routes. Labels avoid each other and map controls while venue
coordinates and route geometry remain exact. Crowded areas become compact
groups with a complete, scrollable event list. The layout follows pan, zoom,
resize, and the phone's Agenda/Map switch, including open popup positions.

The workspace has an agenda beside the live atlas on desktop, with separate
Agenda and Map views on phones. Filters expand from the agenda header. Concert
rows and artist controls support keyboard activation. Festival-only refreshes
survive reloads without changing the search scope of stored concert results.
Late track-cache responses cannot overwrite a newer import or profile choice.
Deterministic regressions also cover batched filter redraws and reuse of festival
matching patterns; these verify work counts rather than machine timing.

## Playlist links

Use **Playlist** in the header to paste a Spotify playlist link. Full
`open.spotify.com/playlist/...` links (including locale and embed variants),
`spotify:playlist:...` URIs, playlist IDs, and mobile `spotify.link` share links
are accepted. Import includes every available music track, with all artists
selected by default and an optional minimum track count. Unavailable tracks,
local files and podcast episodes are counted separately. A failed page or a
playlist edited during import never produces a successful partial import.

Each imported playlist keeps its own artists, track counts, track details,
concerts, festival scores and scan progress on this device. Previously imported
playlists reopen from history without Spotify requests. Discovery caches remain
shared for reuse; results are restricted to the active playlist's artists and
country scope. Switching playlists stops and drains the old scan before the
new session is activated. Failed or canceled imports preserve the active session.
The original Main session is preserved during migration.

Spotify access rules still apply. Since the February 2026 Development Mode
migration, playlist items are available only to the playlist owner or a
collaborator; app-only credentials cannot bypass this restriction. Connect the
appropriate Spotify account when prompted. Extended Quota applications can
retain the older public-playlist access. See the official
[playlist items reference](https://developer.spotify.com/documentation/web-api/reference/get-playlists-items)
and [migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide).
Other streaming services are not supported by this importer.

The old pinned-playlist experience is available only with an explicit
`window.__SERVER_CONFIG__.pinnedPlaylistOnly === true` configuration.

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
