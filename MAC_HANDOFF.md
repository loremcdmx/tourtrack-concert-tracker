# Continue On Mac

Use this when resuming ConcertTracker on a Mac through Codex.

## 1. Prerequisites

```bash
brew install git node
brew install --cask google-chrome
node -v
```

Use Node 20 or newer. This repo pins `20` in `.nvmrc`.

## 2. Clone and prepare

```bash
git clone https://github.com/loremcdmx/tourtrack-concert-tracker.git
cd tourtrack-concert-tracker
npm install
```

## 3. Pull secrets from Vercel

Secrets are not in git and Codex on another device will not see your local `.env` automatically.
The supported restore path is Vercel `development` env:

```bash
npx vercel login
npm run env:pull:dev
```

`npm run env:pull:dev` is safe to rerun when `.env` already exists. It first writes a backup copy into `tmp/` and then overwrites `.env` from the linked Vercel project.
If the checkout is not linked yet, the script attempts `vercel link --yes --project concerttracker` automatically and then retries the env pull.

If Vercel says the repo is not linked yet:

```bash
npx vercel link --yes --project concerttracker
npm run env:pull:dev
```

That command writes `.env` locally from the linked `concerttracker` project and keeps the canonical local callback:

```text
http://localhost:3002/api/auth/spotify/callback
```

Fallback only if Vercel access is unavailable: copy `.env.example` to `.env` and fill:

```env
PORT=3002
TICKETMASTER_API_KEYS=your_ticketmaster_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3002/api/auth/spotify/callback
SESSION_SECRET=replace_with_a_long_random_secret
```

Spotify dashboard redirect URI must still match exactly.

## 4. Verify the checkout

```bash
npm run check
npm test
```

## 5. Run locally

```bash
npm start
```

Open [http://localhost:3002](http://localhost:3002).

## 6. Good Codex starter prompt

```text
Read AGENTS.md, README.md, and MAC_HANDOFF.md. Check git status, run npm run check, and continue working on ConcertTracker. Do not edit .env and do not commit secrets.
```

## 7. Current linkage

- GitHub remote: `origin -> https://github.com/loremcdmx/tourtrack-concert-tracker.git`
- Vercel project linkage exists in `.vercel/project.json`
- preferred secret restore command: `npm run env:pull:dev`
