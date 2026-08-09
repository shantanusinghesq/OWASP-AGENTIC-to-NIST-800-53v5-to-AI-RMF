import { defineConfig } from "tsup";

// Builds the published artifact set for @shantanusinghesq/crosswalk.
// The WORKSPACE client keeps consuming raw src/ (package.json main/exports
// point at ./src/index.ts); only the PUBLISHED package points at dist/ via
// publishConfig. This build produces ESM + CJS + .d.ts for external consumers.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
  sourcemap: false,
});
