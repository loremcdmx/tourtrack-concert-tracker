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
cp .env.example .env
```

Fill `.env` with:

```env
PORT=3002
TICKETMASTER_API_KEYS=your_ticketmaster_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3002/api/auth/spotify/callback
SESSION_SECRET=replace_with_a_long_random_secret
```

Spotify dashboard redirect URI must match exactly:

```text
http://localhost:3002/api/auth/spotify/callback
```

## 3. Verify the checkout

```bash
npm run check
npm test
```

## 4. Run locally

```bash
npm start
```

Open [http://localhost:3002](http://localhost:3002).

## 5. Good Codex starter prompt

```text
Read AGENTS.md, README.md, and MAC_HANDOFF.md. Check git status, run npm run check, and continue working on ConcertTracker. Do not edit .env and do not commit secrets.
```

## 6. Current linkage

- GitHub remote: `origin -> https://github.com/loremcdmx/tourtrack-concert-tracker.git`
- Vercel project linkage exists in `.vercel/project.json`
