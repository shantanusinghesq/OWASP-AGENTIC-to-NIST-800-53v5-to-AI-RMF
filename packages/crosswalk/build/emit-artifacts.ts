// ─── Artifact Emitter ───────────────────────────────────────────────
// Generates the machine-readable distribution artifacts from the TS source
// of truth:
//   dist/crosswalk.json — full data payload (round-trips against the constants)
//   dist/crosswalk.csv  — one row per (ASI, family, control) mapping pair
//
// The JSON object and CSV string are produced by PURE exported functions
// (buildJson / buildCsv) so tests can assert against them without the build
// having run. Run via `tsx build/emit-artifacts.ts` (wired into the package
// `build` script after tsup).

import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  AI_RMF,
  CROSSWALK,
  CROSSWALK_DATA_VERSION,
  NIST_800_53,
  NIST_AI_RMF_DESCRIPTIONS,
  NIST_CONTROL_DESCRIPTIONS,
  OWASP_ASI,
  UPSTREAM_VERSIONS,
  parseControlRef,
} from "../src/index.js";

export interface CrosswalkArtifact {
  dataVersion: string;
  upstreamVersions: typeof UPSTREAM_VERSIONS;
  owaspAsi: typeof OWASP_ASI;
  nist80053: typeof NIST_800_53;
  aiRmf: typeof AI_RMF;
  crosswalk: typeof CROSSWALK;
  nistControlDescriptions: typeof NIST_CONTROL_DESCRIPTIONS;
  aiRmfDescriptions: typeof NIST_AI_RMF_DESCRIPTIONS;
}

/** Column order for dist/crosswalk.csv. Exported so tests can pin the header. */
export const CSV_HEADER = [
  "asiId",
  "asiName",
  "severity",
  "family",
  "familyName",
  "controlId",
  "controlTitle",
  "rationale",
  "evidence",
] as const;

/** Pure: assembles the full JSON payload from the TS constants. */
export function buildJson(): CrosswalkArtifact {
  return {
    dataVersion: CROSSWALK_DATA_VERSION,
    upstreamVersions: UPSTREAM_VERSIONS,
    owaspAsi: OWASP_ASI,
    nist80053: NIST_800_53,
    aiRmf: AI_RMF,
    crosswalk: CROSSWALK,
    nistControlDescriptions: NIST_CONTROL_DESCRIPTIONS,
    aiRmfDescriptions: NIST_AI_RMF_DESCRIPTIONS,
  };
}

/** RFC-4180 field quoting: quote if the value contains comma, quote, or newline. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Pure: builds the CSV text (header + one data row per ASI×family×control
 * mapping, no aggregation). Ends with a trailing newline.
 */
export function buildCsv(): string {
  const asiById = new Map(OWASP_ASI.map((a) => [a.id, a]));
  const familyById = new Map(NIST_800_53.map((f) => [f.id, f]));

  const lines: string[] = [CSV_HEADER.join(",")];

  for (const [asiId, entry] of Object.entries(CROSSWALK)) {
    const asi = asiById.get(asiId);
    for (const mapping of entry.nist53) {
      const family = familyById.get(mapping.family);
      for (const control of mapping.controls) {
        const ref = parseControlRef(control);
        const controlId = ref ? ref.id : control;
        const controlTitle = ref ? ref.title : "";
        lines.push(
          [
            asiId,
            asi?.name ?? "",
            asi?.severity ?? "",
            mapping.family,
            family?.name ?? "",
            controlId,
            controlTitle,
            mapping.rationale,
            entry.evidence,
          ]
            .map(csvField)
            .join(","),
        );
      }
    }
  }

  return lines.join("\n") + "\n";
}

/** Serializes the JSON payload the way the file is written (pretty + trailing newline). */
export function serializeJson(): string {
  return JSON.stringify(buildJson(), null, 2) + "\n";
}

/** Writes both artifacts into `distDir`, returning the paths written. */
export function writeArtifacts(distDir: string): { json: string; csv: string } {
  mkdirSync(distDir, { recursive: true });
  const jsonPath = join(distDir, "crosswalk.json");
  const csvPath = join(distDir, "crosswalk.csv");
  writeFileSync(jsonPath, serializeJson(), "utf8");
  writeFileSync(csvPath, buildCsv(), "utf8");
  return { json: jsonPath, csv: csvPath };
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
  const { json, csv } = writeArtifacts(distDir);
  console.log(`[emit-artifacts] wrote ${json}`);
  console.log(`[emit-artifacts] wrote ${csv}`);
}
