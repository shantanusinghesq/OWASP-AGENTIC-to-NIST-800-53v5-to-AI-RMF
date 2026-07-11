// ─── Incident Register (derived, disclaimed) ────────────────────────
// A FLAT, machine-readable projection of the evidence attached to each ASI in
// CROSSWALK. Nothing new is asserted here: every entry is lifted verbatim from
// an existing `EvidenceItem`, tagged with the ASI it documents. There is no
// separate JSON file — the register is derived from the single source of truth
// (packages/crosswalk/src/data.ts) at module load, so it can never drift.
//
// DISCLAIMER: This is a *register-relative* view. "asisWithNoIncident" means
// "no evidence item is attached to that ASI in THIS dataset", NOT a claim that
// the risk is unobserved in the wild. The register is an editorial evidence
// index, not an exhaustive incident database.

import { CROSSWALK, type EvidenceItem } from "./data.js";

export interface IncidentRecord {
  /** Owning OWASP ASI id (e.g. "ASI01"). */
  asiId: string;
  title: string;
  type: EvidenceItem["type"];
  sourceUrl?: string;
  cveId?: string;
  datePublished?: string;
  dateVerified: string;
}

/**
 * Flat array of every evidence item across every ASI, each stamped with the
 * ASI it belongs to. Built by iterating CROSSWALK in insertion order so the
 * register order is stable and reproducible.
 */
export const INCIDENT_REGISTER: IncidentRecord[] = Object.entries(CROSSWALK).flatMap(
  ([asiId, entry]) =>
    entry.evidence.map((item) => ({
      asiId,
      title: item.title,
      type: item.type,
      ...(item.sourceUrl !== undefined ? { sourceUrl: item.sourceUrl } : {}),
      ...(item.cveId !== undefined ? { cveId: item.cveId } : {}),
      ...(item.datePublished !== undefined ? { datePublished: item.datePublished } : {}),
      dateVerified: item.dateVerified,
    })),
);

export interface RegisterReport {
  totalIncidents: number;
  byType: Record<IncidentRecord["type"], number>;
  /** ASI ids that carry ZERO evidence items IN THIS REGISTER. Disclaimed:
   *  register-relative, not a real-world "no incident" claim. */
  asisWithNoIncident: string[];
}

/**
 * Pure summary of the register. `asisWithNoIncident` is register-relative (see
 * the module disclaimer) — it lists ASIs whose evidence array is empty in the
 * current dataset, which is expected to be empty since WS7 backfilled every ASI.
 */
export function buildRegisterReport(): RegisterReport {
  const byType: Record<IncidentRecord["type"], number> = {
    incident: 0,
    research: 0,
    guidance: 0,
  };
  for (const record of INCIDENT_REGISTER) {
    byType[record.type] += 1;
  }

  const asisWithNoIncident = Object.entries(CROSSWALK)
    .filter(([, entry]) => entry.evidence.length === 0)
    .map(([asiId]) => asiId);

  return {
    totalIncidents: INCIDENT_REGISTER.length,
    byType,
    asisWithNoIncident,
  };
}
