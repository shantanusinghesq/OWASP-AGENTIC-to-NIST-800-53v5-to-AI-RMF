// ─── Crosswalk Data Adapter ─────────────────────────────────────────
// The ONLY module in the client allowed to import @haremantra/crosswalk.
// Everything else imports from here, so the data dependency has a one-file
// blast radius (package build step, versioned API, etc. land here alone).

import {
  AI_RMF,
  CROSSWALK,
  NIST_AI_RMF_DESCRIPTIONS,
  NIST_CONTROL_DESCRIPTIONS,
  computeCoverage,
  computeStats,
  type AIRMFControlDesc,
} from "@haremantra/crosswalk";

export {
  AI_RMF,
  CROSSWALK,
  CROSSWALK_DATA_VERSION,
  NIST_800_53,
  NIST_AI_RMF_DESCRIPTIONS,
  NIST_CONTROL_DESCRIPTIONS,
  OWASP_ASI,
  UPSTREAM_VERSIONS,
  buildCsv,
  buildJson,
  buildOscalMapping,
  evidenceText,
  parseControlRef,
  severityColor,
  type AIRMFControlDesc,
  type AIRMFFunction,
  type AIRMFMapping,
  type ASIRisk,
  type ConfidenceLevel,
  type Coverage,
  type CrosswalkEntry,
  type CrosswalkStats,
  type EvidenceItem,
  type NISTFamily,
  type NISTMapping,
  type OscalMapping,
  type OscalMappingEntry,
  type ValidationStatus,
} from "@haremantra/crosswalk";

export type Framework = "nist" | "aiRmf";

/**
 * Framework-scoped description lookup. NEVER fall back across frameworks:
 * 800-53 legitimately owns MP-1..MP-8 (Media Protection) while AI-RMF's MAP
 * categories use the same MP-* short-form IDs — a fallback chain resolves
 * AI-RMF categories to the wrong framework's text.
 */
export function getControlDescription(
  framework: Framework,
  controlId: string,
): AIRMFControlDesc | undefined {
  return framework === "nist"
    ? NIST_CONTROL_DESCRIPTIONS[controlId]
    : NIST_AI_RMF_DESCRIPTIONS[controlId];
}

/** Per-ASI coverage counts, derived from the mappings (frozen at module load). */
export const COVERAGE = computeCoverage(CROSSWALK);

/** Aggregate crosswalk statistics, derived from the mappings (frozen at module load). */
export const CROSSWALK_STATS = computeStats(CROSSWALK, AI_RMF);

export interface ValidationMix {
  total: number;
  editorial: number;
  "practitioner-reviewed": number;
  "empirically-validated": number;
}

/** Aggregate validation-status breakdown across every mapping (nist53 + aiRmf). */
export function computeValidationMix(cw: typeof CROSSWALK): ValidationMix {
  const mix: ValidationMix = {
    total: 0,
    editorial: 0,
    "practitioner-reviewed": 0,
    "empirically-validated": 0,
  };
  for (const entry of Object.values(cw)) {
    for (const m of [...entry.nist53, ...entry.aiRmf]) {
      mix.total += 1;
      mix[m.validationStatus] += 1;
    }
  }
  return mix;
}

/** Firm-wide validation posture (frozen at module load) — currently 100% editorial. */
export const VALIDATION_MIX = computeValidationMix(CROSSWALK);
