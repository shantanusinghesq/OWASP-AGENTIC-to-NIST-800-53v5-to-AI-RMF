import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@haremantra/crosswalk": path.resolve(import.meta.dirname, "packages", "crosswalk", "src"),
    },
  },
  test: {
    include: ["client/src/**/*.test.ts", "packages/**/tests/**/*.test.ts"],
    environment: "node",
  },
});
