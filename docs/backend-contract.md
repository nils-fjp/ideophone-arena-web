# Ideophone Arena demo contract

Date: 2026-06-04
Deadline: 2026-06-05

## Purpose

This document records the backend/frontend contract for the final demo. It exists to prevent last-minute scope drift.

## Backend base URL

Local backend:

```text
http://localhost:8081
```

For local Vite development, leaving `VITE_API_BASE_URL` empty uses the dev-server
proxy for `/api` and `/stimuli`. With `VITE_API_BASE_URL=http://localhost:8081`,
the frontend calls the backend directly.

## Supported demo settings

The final demo supports:

```json
{
  "conditionName": "CONDITION_1_SOKUON",
  "difficultyLevel": 1
}
```

Other seeded conditions may work:

```text
CONDITION_1_SOKUON
CONDITION_2_SOKUON
CONDITION_3_SOKUON
```

## Authentication

The frontend logs in through:

```text
POST /api/auth/login
```

The response contains a JWT token. Protected requests must send:

```text
Authorization: Bearer <token>
```

## Game flow

Start session:

```text
POST /api/game/sessions
```

Request body:

```json
{
  "conditionName": "CONDITION_1_SOKUON",
  "difficultyLevel": 1
}
```

Get next round:

```text
GET /api/game/sessions/{sessionUuid}/rounds/next
```

Submit answer:

```text
POST /api/game/sessions/{sessionUuid}/answers
```

Request body:

```json
{
  "roundId": 1,
  "selectedIdeophoneId": 1,
  "responseTimeMs": 1200
}
```

## Completion behavior

When there are no more unanswered rounds, the backend may return 404 from the next-round endpoint with a completion-related message. The frontend must treat this as normal session completion, not as a fatal error or automatic reset.

## Progress display

Do not rely on cumulative user-wide totals for per-session remaining count. The frontend should maintain session-local answered/correct counts, or the backend should provide session-scoped totals.

## Leaderboard

Public leaderboard:

```text
GET /api/leaderboard
```

This should be visible in the final demo.

## Recent attempts

Authenticated user history:

```text
GET /api/game/me/attempts
```

This is enough for minimal personal progress/history.

## Stimuli

Stimulus media is served by the backend under:

```text
GET /stimuli/**
```

The frontend may proxy this path during local Vite development, but the media
authority remains the backend. If the backend protects media requests, the
frontend should fetch media through the centralized bearer-token client and play
the returned blob URL rather than loading the protected URL directly in a media
element.

The frontend should require a pre-game sound check before starting the timed
trial sequence. Stimulus media must not be force-muted by the frontend. If
unmuted autoplay is blocked by the browser, the frontend should show a manual
play control instead of silently advancing as if the participant heard the
stimulus.
