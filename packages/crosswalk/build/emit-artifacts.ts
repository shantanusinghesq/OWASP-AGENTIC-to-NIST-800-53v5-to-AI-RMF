// ─── Artifact Emitter (file writer) ─────────────────────────────────
// Writes the machine-readable distribution artifacts from the TS source of
// truth:
//   dist/crosswalk.json       — full data payload (round-trips against constants)
//   dist/crosswalk.csv        — one row per (ASI, family, control) mapping pair
//   dist/crosswalk.oscal.json — OSCAL-aligned mapping (catalog-resolved)
//
// The PURE builders (buildJson / buildCsv / serializeJson / buildOscalMapping)
// now live in ../src so the SPA can reuse the exact same export format. This
// module keeps ONLY the filesystem side-effects + the run-as-entrypoint guard.
// Run via `tsx build/emit-artifacts.ts` (wired into the package `build` script
// after tsup).

import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { buildCsv, serializeJson } from "../src/artifacts.js";
import { buildOscalMapping } from "../src/oscal-mapping.js";

/** Serializes the OSCAL-aligned mapping the way the file is written. */
function serializeOscal(): string {
  return JSON.stringify(buildOscalMapping(), null, 2) + "\n";
}

/** Writes all artifacts into `distDir`, returning the paths written. */
export function writeArtifacts(distDir: string): {
  json: string;
  csv: string;
  oscal: string;
} {
  mkdirSync(distDir, { recursive: true });
  const jsonPath = join(distDir, "crosswalk.json");
  const csvPath = join(distDir, "crosswalk.csv");
  const oscalPath = join(distDir, "crosswalk.oscal.json");
  writeFileSync(jsonPath, serializeJson(), "utf8");
  writeFileSync(csvPath, buildCsv(), "utf8");
  writeFileSync(oscalPath, serializeOscal(), "utf8");
  return { json: jsonPath, csv: csvPath, oscal: oscalPath };
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  const distDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
  const { json, csv, oscal } = writeArtifacts(distDir);
  console.log(`[emit-artifacts] wrote ${json}`);
  console.log(`[emit-artifacts] wrote ${csv}`);
  console.log(`[emit-artifacts] wrote ${oscal}`);
}
