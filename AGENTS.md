# ConcertTracker Agent Notes

## Working style

- Do not omit code. Provide full implementation.
- Analyze the full local context before editing.
- Optimize for product quality over effort.

## Repo facts

- Local dev server: `http://localhost:3002`
- Syntax gate: `npm run check`
- UI regression suite: `npm test`
- Start app: `npm start`
- Watch mode: `npm run dev`

## Environment

- Copy `.env.example` to `.env`
- Keep secrets only in `.env` or the deployment environment
- Never commit `.env`
- Canonical local Spotify redirect URI:

```text
http://localhost:3002/api/auth/spotify/callback
```

## Git and handoff

- Remote: `https://github.com/loremcdmx/tourtrack-concert-tracker.git`
- Default branch: `main`
- Before editing: read `README.md`, check `git status`, run `npm run check`
- Before handoff: summarize what changed, what was validated, and any remaining env or dashboard step
