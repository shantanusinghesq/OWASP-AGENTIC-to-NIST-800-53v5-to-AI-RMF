// ─── Assessment Tray: Coverage & Gap Derivations ────────────────────
// Pure functions over an Assessment + the crosswalk data. Distinct-ID
// semantics match packages/crosswalk/src/derive.ts (parseControlRef).

import { CROSSWALK, parseControlRef } from "@/data/crosswalk";
import type { Assessment } from "./types";

export interface SelectionCoverage {
  /** Distinct 800-53 control IDs (e.g. "AC-3") across selected nist mappings. */
  controls: number;
  /** Distinct 800-53 families across selected nist mappings. */
  families: number;
  /** Distinct AI-RMF functions across selected aiRmf mappings. */
  functions: number;
  /** Distinct AI-RMF category IDs (e.g. "GV-1") across selected aiRmf mappings. */
  cats: number;
}

export function selectionCoverage(assessment: Assessment): SelectionCoverage {
  const controls = new Set<string>();
  const families = new Set<string>();
  const functions = new Set<string>();
  const cats = new Set<string>();

  for (const ref of assessment.selections) {
    const entry = CROSSWALK[ref.asiId];
    if (!entry) continue;
    if (ref.framework === "nist") {
      const mapping = entry.nist53.find((m) => m.family === ref.familyOrFunc);
      if (!mapping) continue;
      families.add(mapping.family);
      for (const c of mapping.controls) {
        const parsed = parseControlRef(c);
        if (parsed) controls.add(parsed.id);
      }
    } else {
      const mapping = entry.aiRmf.find((m) => m.func === ref.familyOrFunc);
      if (!mapping) continue;
      functions.add(mapping.func);
      for (const c of mapping.cats) {
        const parsed = parseControlRef(c);
        if (parsed) cats.add(parsed.id);
      }
    }
  }

  return {
    controls: controls.size,
    families: families.size,
    functions: functions.size,
    cats: cats.size,
  };
}

export interface FrameworkGap {
  /** All families/functions the crosswalk maps for this ASI. */
  available: string[];
  /** The subset currently selected in the assessment. */
  selected: string[];
  /** available minus selected. */
  missing: string[];
  /** Selected share of available, rounded percent (100 when nothing is available). */
  pct: number;
}

export interface AsiGap {
  asiId: string;
  nist: FrameworkGap;
  aiRmf: FrameworkGap;
}

const frameworkGap = (available: string[], selectedSet: Set<string>): FrameworkGap => {
  const selected = available.filter((f) => selectedSet.has(f));
  const missing = available.filter((f) => !selectedSet.has(f));
  const pct =
    available.length === 0 ? 100 : Math.round((selected.length / available.length) * 100);
  return { available, selected, missing, pct };
};

/** Per selected ASI: what the data offers vs. what the assessment covers. */
export function asiGaps(assessment: Assessment): AsiGap[] {
  const byAsi = new Map<string, { nist: Set<string>; aiRmf: Set<string> }>();
  for (const ref of assessment.selections) {
    if (!CROSSWALK[ref.asiId]) continue;
    let buckets = byAsi.get(ref.asiId);
    if (!buckets) {
      buckets = { nist: new Set(), aiRmf: new Set() };
      byAsi.set(ref.asiId, buckets);
    }
    buckets[ref.framework === "nist" ? "nist" : "aiRmf"].add(ref.familyOrFunc);
  }

  return Array.from(byAsi.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([asiId, buckets]) => {
      const entry = CROSSWALK[asiId];
      return {
        asiId,
        nist: frameworkGap(
          entry.nist53.map((m) => m.family),
          buckets.nist,
        ),
        aiRmf: frameworkGap(
          entry.aiRmf.map((m) => m.func),
          buckets.aiRmf,
        ),
      };
    });
}
