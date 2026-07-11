// ─── Derived Statistics ─────────────────────────────────────────────
// Pure derivations over the crosswalk data. These replace hand-maintained
// coverage counts (which had drifted for 9 of 10 ASI risks) so that displayed
// statistics can never disagree with the mappings they describe.

import type { AIRMFFunction, CrosswalkEntry } from "./data.js";

export interface Coverage {
  nistFamilies: number;
  nistControls: number;
  aiRmfFunctions: number;
  aiRmfCategories: number;
}

export interface CrosswalkStats {
  /** Total nist53 control mapping references across all ASI risks (rows, not distinct). */
  totalNistControlMappings: number;
  /** Total aiRmf category mapping references across all ASI risks (rows, not distinct). */
  totalAiRmfCategoryMappings: number;
  /** Distinct 800-53 control IDs (e.g. "SI-7") across all mappings. Immune to display-string variance. */
  uniqueNistControls: number;
  /** Distinct AI-RMF category IDs (e.g. "MP-1") referenced by at least one mapping. */
  uniqueAiRmfCategories: number;
}

/**
 * Canonical parser for control/category reference strings
 * (e.g. "AC-3 Access Enforcement" → { id: "AC-3", title: "Access Enforcement" }).
 */
export function parseControlRef(text: string): { id: string; title: string } | null {
  const match = text.match(/^([A-Z]{2,8}-\d{1,2})\s(.+)$/);
  return match ? { id: match[1], title: match[2] } : null;
}

/** Per-ASI coverage counts, computed from the mappings (distinct IDs, not rows). */
export function computeCoverage(crosswalk: Record<string, CrosswalkEntry>): Record<string, Coverage> {
  const result: Record<string, Coverage> = {};
  for (const [asiId, entry] of Object.entries(crosswalk)) {
    const families = new Set(entry.nist53.map((m) => m.family));
    const controls = new Set(
      entry.nist53.flatMap((m) => m.controls.map((c) => parseControlRef(c)?.id).filter(Boolean)),
    );
    const funcs = new Set(entry.aiRmf.map((m) => m.func));
    const cats = new Set(
      entry.aiRmf.flatMap((m) => m.cats.map((c) => parseControlRef(c)?.id).filter(Boolean)),
    );
    result[asiId] = {
      nistFamilies: families.size,
      nistControls: controls.size,
      aiRmfFunctions: funcs.size,
      aiRmfCategories: cats.size,
    };
  }
  return result;
}

/** Aggregate statistics across the whole crosswalk. */
export function computeStats(
  crosswalk: Record<string, CrosswalkEntry>,
  _aiRmf: AIRMFFunction[],
): CrosswalkStats {
  let totalNist = 0;
  let totalAiRmf = 0;
  const controlIds = new Set<string>();
  const catIds = new Set<string>();
  for (const entry of Object.values(crosswalk)) {
    for (const m of entry.nist53) {
      for (const c of m.controls) {
        totalNist++;
        const ref = parseControlRef(c);
        if (ref) controlIds.add(ref.id);
      }
    }
    for (const m of entry.aiRmf) {
      for (const c of m.cats) {
        totalAiRmf++;
        const ref = parseControlRef(c);
        if (ref) catIds.add(ref.id);
      }
    }
  }
  return {
    totalNistControlMappings: totalNist,
    totalAiRmfCategoryMappings: totalAiRmf,
    uniqueNistControls: controlIds.size,
    uniqueAiRmfCategories: catIds.size,
  };
}
