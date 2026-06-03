# Ideophone Arena Web

React, Vite, and TypeScript frontend for Ideophone Arena.

## Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The development server runs at:

```text
http://localhost:5174
```

## Backend API

The frontend expects the Spring Boot API at:

```text
http://localhost:8080
```

Local Vite development uses the `/api` proxy in `vite.config.ts`. Keep `VITE_API_BASE_URL` empty for that path:

```text
VITE_API_BASE_URL=
```

Set `VITE_API_BASE_URL=http://localhost:8080` only if you bypass the Vite proxy. `.env.local` should stay untracked.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
