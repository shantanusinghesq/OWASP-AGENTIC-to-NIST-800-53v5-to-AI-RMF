// Gate 1 item 4 — GitHub Pages deep links.
//
// Project Pages returns HTTP 200 only for a real file. deploy-pages.yml copies
// the shell to 404.html, so /terms is still an HTTP 404. This test pins the
// outcome, not the tool that produces it: after `pnpm build`, each public
// route must have its own HTML document at <route>/index.html or <route>.html
// (a copied shell or a prerender both qualify). The document must include the
// SPA mount point. The build runs inside the test so a stale dist/ cannot
// satisfy it, and nothing here calls the network.
//
// A full client build is the contract a later fix can meet from a Vite plugin
// or a package.json postbuild step without this file naming either one.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const DIST = path.join(REPO_ROOT, "dist/public");

/** Routes the SPA actually mounts. `/` is the shell Vite already emits. */
const ROUTES = ["/", "/terms"] as const;

function shellCandidates(route: string): string[] {
  if (route === "/") return ["index.html"];
  const slug = route.replace(/^\//, "").replace(/\/$/, "");
  return [`${slug}/index.html`, `${slug}.html`];
}

function runBuild(): void {
  try {
    execFileSync("pnpm", ["build"], {
      cwd: REPO_ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 180_000,
    });
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer };
    const output =
      `${err.stdout?.toString() ?? ""}\n${err.stderr?.toString() ?? ""}`.trim();
    throw new Error(
      `pnpm build failed (Gate 1 item 4 could not inspect dist/public):\n${output.slice(-4000)}`,
    );
  }
}

describe("Gate 1 item 4: GitHub Pages route shells", () => {
  it("emits a real HTML document for / and /terms so Pages does not 404", () => {
    runBuild();
    const problems: string[] = [];

    for (const route of ROUTES) {
      const candidates = shellCandidates(route);
      const found = candidates
        .map((rel) => path.join(DIST, rel))
        .find((file) => existsSync(file));
      if (!found) {
        problems.push(
          `${route}: no HTML shell in dist/public (${candidates.join(" or ")}). GitHub Pages returns HTTP 404 for this path; a 404.html fallback still responds 404.`,
        );
        continue;
      }
      const html = readFileSync(found, "utf8");
      if (!html.includes('id="root"')) {
        problems.push(
          `${route}: ${path.relative(DIST, found)} is not the SPA shell (missing id="root")`,
        );
      }
    }

    expect(problems, problems.join("\n")).toEqual([]);
  }, 180_000);
});
