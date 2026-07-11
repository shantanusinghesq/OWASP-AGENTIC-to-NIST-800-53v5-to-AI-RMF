import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Automatic JSX runtime for .tsx tests (vitest.config is standalone and
  // does not inherit @vitejs/plugin-react from vite.config).
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      // @haremantra/crosswalk resolves via the workspace:* dependency — no alias needed.
    },
  },
  test: {
    include: ["client/src/**/*.test.{ts,tsx}", "packages/**/tests/**/*.test.ts"],
    environment: "node",
    setupFiles: ["client/src/test/setup.ts"],
  },
});
