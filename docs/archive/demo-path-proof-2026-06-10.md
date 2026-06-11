# Demo path narrative proof — 2026-06-10

Archived from the README "Demo Path" section. This is a historical manual-proof
transcript from the S1 task context and is superseded by the automated verification
in `scripts/verify-presentation-logic.mjs` and `scripts/verify-browser-loop.mjs`.

---

Vite was served at `http://127.0.0.1:5174/` with `VITE_API_BASE_URL=` so the
dev-server `/api` and `/stimuli` proxies forwarded requests to
`http://localhost:8081`. The flow registered a new user, passed the sound check,
started a game session with the demo setup, completed a session, showed a final
summary, and loaded leaderboard plus recent attempts without leaving the app in a
stuck loading state. The same proof observed successful backend-served `/stimuli/`
media requests and no muted stimulus media elements.

Current game-loop UX keeps answer feedback and the research note visible until the
user clicks `Next round` (the button appears in the reserved question slot at
feedback). Leaderboard and recent attempts are shown from the completion screen
rather than below the active round. The leaderboard is paginated
(`GET /api/leaderboard?page&size`, contract change 2026-06-11): the frontend reads
the wrapper's `entries` and shows a Previous/Next pager when the backend reports
more than one page.

Stimulus playback is separated from visible presentation. The backend serves per-word
audio files (`/stimuli/audio/<file>.m4a`) for playback, and React renders the visible
layer from backend-provided fields: the neutral A/B placeholder (Audio only) or the
round's `displayForm` verbatim (Script match and Script mismatch). Feedback reveals
`canonicalForm`, romaji, and meaning. The frontend never converts or detects kana.

Script Lab selection is available before session start with exactly three
backend-supported presentation options: Audio only, Script match, and Script mismatch.
The default remains Audio only, difficulty remains fixed at `1`, and React renders
placeholders or script rather than trusting baked-in video visuals.

Remaining blocker: none for the frontend demo path while the backend is running on
port `8081`.
