import { defineConfig } from "vitest/config";

// Standalone test config so vitest does not load the dev-server proxy
// settings in vite.config.ts. Tests render with react-dom/server, so the
// default node environment is enough.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
