# AGENTS.md - Ideophone Arena Web

## Project context

This is the frontend for Ideophone Arena, a small playable web app for a Spring Boot course. The backend is the grading-critical part. The deadline is June 5, 2026. The frontend must demonstrate the backend MVP, not become a design project.

Use this repo only after the backend proves the core API with curl or Postman.

## Stack

Use the existing stack:

- React
- Vite
- TypeScript
- Minimal CSS or Tailwind only if already installed

Do not add a UI framework unless explicitly asked.

## MVP frontend scope

Build only the smallest UI that proves the game loop:

1. Register or log in.
2. Store the JWT locally.
3. Fetch one playable round.
4. Show the prompt and two choices.
5. Submit the selected choice.
6. Show immediate feedback.
7. Show either personal recent attempts or a simple leaderboard.

Anything else is later.

Avoid until the MVP works:

- Animation
- Rich visual design
- Routing complexity
- Global state libraries
- Unlockable levels
- Detailed educational pages
- Thesis background pages
- Charts
- Audio playback
- Admin UI
- Complex error UX
- Deployment work

## Backend assumptions

Expected backend development origin:

```text
http://localhost:8080
```

Expected frontend development origin:

```text
http://localhost:5173
```

Expected API shape unless the backend already differs:

```text
POST /api/auth/register
POST /api/auth/login

GET  /api/rounds/next
POST /api/rounds/{roundId}/answer

GET  /api/me/attempts
GET  /api/leaderboard
```

Protected requests must include:

```text
Authorization: Bearer <token>
```

Do not invent frontend endpoints. Match the backend.

## Implementation rules

Keep the app small.

Prefer one `api.ts` module for fetch logic.

Centralize token handling.

Do not duplicate Authorization header logic in every component.

Use TypeScript types for API request and response shapes.

Handle non-2xx responses visibly enough for a demo.

Do not build frontend state that the backend should own.

Do not bypass CORS by relying only on a Vite proxy. Backend CORS must still be configured explicitly.

## Suggested file structure

Use existing structure if present. If still close to the Vite template, this is enough:

```text
src/
  api.ts
  App.tsx
  main.tsx
  types.ts
  components/
    LoginForm.tsx
    RoundView.tsx
    Leaderboard.tsx
```

Avoid deep architecture.

## API helper target

Prefer a minimal helper like this pattern:

```ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
  }

  return response;
}
```

Do not overbuild auth. For the MVP, `localStorage` is acceptable.

## Environment variables

If needed, use:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Do not commit secrets. The frontend should not contain JWT secrets or database credentials.

## Development commands

From repo root:

```sh
npm install
npm run dev
```

For a production check:

```sh
npm run build
```

Only add or change scripts if the existing `package.json` requires it.

## Proof requirement

Every meaningful frontend change must end with at least one proof:

```sh
npm run build
```

or a browser demo step such as:

```text
Open http://localhost:5173
Log in
Fetch a round
Submit an answer
See feedback
```

If the backend is unavailable, write the exact blocker instead of building mock systems.

## Error handling for demo

Minimum acceptable behavior:

- Login failure shows a message.
- Missing or expired token sends the user back to login state.
- Failed round fetch shows a message.
- Failed answer submission shows a message.
- Successful answer submission shows correct/incorrect feedback.

Do not spend time on polished copy.

## Styling

Keep styling minimal and readable.

Do not spend time on themes, fonts, animations, layouts, icons, or responsive polish before the complete backend-to-frontend loop works.

## When editing existing code

First inspect current files.

Do not rewrite the whole app unless it is still the default Vite template and replacement is smaller than patching it.

Prefer small changes that make one demo step work.

After a change, state:

1. What changed
2. How to run it
3. How to prove it works
4. What backend dependency remains, if any

## Hard rule

The frontend exists to demonstrate the backend. If a task does not help the user register/login, play one round, submit one answer, and see stored score/history/leaderboard data, defer it.
