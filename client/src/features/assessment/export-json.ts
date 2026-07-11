// ─── Assessment Tray: JSON Export / Import ──────────────────────────
// The export envelope pins the crosswalk data version + upstream framework
// editions so an imported assessment can be checked (and pruned) against
// whatever data revision the app is running when it comes back in.

import { CROSSWALK_DATA_VERSION, UPSTREAM_VERSIONS } from "@/data/crosswalk";
import type { Assessment } from "./types";

export const ASSESSMENT_EXPORT_KIND = "agentic-crosswalk-assessment";
const SCHEMA_VERSION = 1;

export interface AssessmentExport {
  kind: typeof ASSESSMENT_EXPORT_KIND;
  schemaVersion: 1;
  dataVersion: string;
  upstreamVersions: typeof UPSTREAM_VERSIONS;
  exportedAt?: string;
  assessment: Assessment;
}

export function buildAssessmentExport(
  assessment: Assessment,
  exportedAt?: string,
): AssessmentExport {
  return {
    kind: ASSESSMENT_EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    dataVersion: CROSSWALK_DATA_VERSION,
    upstreamVersions: UPSTREAM_VERSIONS,
    ...(exportedAt !== undefined ? { exportedAt } : {}),
    assessment,
  };
}

/** Parse an exported assessment. Throws with a human-readable message on any mismatch. */
export function parseAssessmentImport(text: string): Assessment {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Not valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Not an assessment export (expected a JSON object).");
  }
  const envelope = parsed as Record<string, unknown>;
  if (envelope.kind !== ASSESSMENT_EXPORT_KIND) {
    throw new Error(`Not an assessment export (kind must be "${ASSESSMENT_EXPORT_KIND}").`);
  }
  if (envelope.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Unsupported schemaVersion (expected ${SCHEMA_VERSION}).`);
  }
  const assessment = envelope.assessment as Record<string, unknown> | undefined;
  if (
    typeof assessment !== "object" ||
    assessment === null ||
    typeof assessment.id !== "string" ||
    typeof assessment.name !== "string" ||
    !Array.isArray(assessment.selections) ||
    typeof assessment.annotations !== "object" ||
    assessment.annotations === null
  ) {
    throw new Error("Malformed assessment payload.");
  }
  return assessment as unknown as Assessment;
}
