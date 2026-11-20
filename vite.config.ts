import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

/**
 * GitHub Pages serves `terms.html` at `/terms` with HTTP 200 and does not
 * redirect. The built shell's script and stylesheet URLs are absolute
 * (`base` starts with `/`), so the copy loads the same assets from `/terms`
 * as from `/`. `/terms/` is a directory URL and still 404s; the in-app link
 * is `/terms`. This stays in the client build so the deploy workflow is unchanged.
 */
function spaRouteShells(): Plugin {
  let outDir = "";
  return {
    name: "spa-route-shells",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      fs.copyFileSync(
        path.join(outDir, "index.html"),
        path.join(outDir, "terms.html"),
      );
    },
  };
}

export default defineConfig({
  // GitHub Pages project site — served under the repo subpath.
  // Absolute (not './') so a copied route shell resolves assets from any path.
  base: "/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/",
  plugins: [react(), tailwindcss(), spaRouteShells()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
