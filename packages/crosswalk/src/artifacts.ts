// ─── Artifact Builders (pure) ───────────────────────────────────────
// Single source of truth for the machine-readable export format. These PURE
// functions assemble the distribution payloads from the TS constants so that:
//   • the package build (build/emit-artifacts.ts) can write them to dist/, and
//   • the SPA (client) can generate the same JSON/CSV client-side (Blob) with
//     no server and no network — the export format lives in exactly one place.
//
// Nothing here touches the filesystem, the clock, or the network: buildJson /
// buildCsv are deterministic over the constants and safe to bundle into the
// browser build.

import { AI_RMF, CROSSWALK, NIST_800_53, OWASP_ASI, type EvidenceItem } from "./data.js";
import { parseControlRef } from "./derive.js";
import { NIST_AI_RMF_DESCRIPTIONS } from "./nist-ai-rmf-descriptions.js";
import { NIST_CONTROL_DESCRIPTIONS } from "./nist-control-descriptions.js";
import { UPSTREAM_VERSIONS } from "./provenance.js";
import { CROSSWALK_DATA_VERSION } from "./version.js";

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
  "framework",
  "family",
  "familyName",
  "controlId",
  "controlTitle",
  "rationale",
  "validationStatus",
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

/**
 * Plain-text rendering of a structured evidence list: item titles joined by
 * "; " with the CVE id appended in parens when present. Used for the CSV
 * `evidence` column, the client search index, and the T11 structural floor —
 * the single place prose is derived from the EvidenceItem[] source of truth.
 */
export function evidenceText(items: EvidenceItem[]): string {
  return items
    .map((item) => (item.cveId ? `${item.title} (${item.cveId})` : item.title))
    .join("; ");
}

/** RFC-4180 field quoting: quote if the value contains comma, quote, or newline. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Pure: builds the CSV text (header + one data row per ASI×family×control
 * mapping across BOTH frameworks — 800-53 and AI-RMF — no aggregation). Ends
 * with a trailing newline. Each ASI's 800-53 rows are followed immediately by
 * its AI-RMF rows, so a reader scanning by ASI sees one contiguous block.
 */
export function buildCsv(): string {
  const asiById = new Map(OWASP_ASI.map((a) => [a.id, a]));
  const familyById = new Map(NIST_800_53.map((f) => [f.id, f]));
  const funcById = new Map(AI_RMF.map((f) => [f.id, f]));

  const lines: string[] = [CSV_HEADER.join(",")];

  for (const [asiId, entry] of Object.entries(CROSSWALK)) {
    const asi = asiById.get(asiId);

    for (const mapping of entry.nist53) {
      const family = familyById.get(mapping.family);
      for (const control of mapping.controls) {
        const ref = parseControlRef(control);
        lines.push(
          [
            asiId,
            asi?.name ?? "",
            asi?.severity ?? "",
            "800-53",
            mapping.family,
            family?.name ?? "",
            ref ? ref.id : control,
            ref ? ref.title : "",
            mapping.rationale,
            mapping.validationStatus,
            evidenceText(entry.evidence),
          ]
            .map(csvField)
            .join(","),
        );
      }
    }

    for (const mapping of entry.aiRmf) {
      const func = funcById.get(mapping.func);
      for (const cat of mapping.cats) {
        const ref = parseControlRef(cat);
        lines.push(
          [
            asiId,
            asi?.name ?? "",
            asi?.severity ?? "",
            "AI-RMF",
            mapping.func,
            func?.name ?? "",
            ref ? ref.id : cat,
            ref ? ref.title : "",
            mapping.rationale,
            mapping.validationStatus,
            evidenceText(entry.evidence),
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
