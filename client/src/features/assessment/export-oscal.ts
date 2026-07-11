// ─── Scoped OSCAL Export ────────────────────────────────────────────
// Filters the full OSCAL-aligned mapping (packages/crosswalk, via the data
// adapter) down to exactly what the assessment selected: kept ASIs, then
// within each ASI only the selected 800-53 families and AI-RMF functions.
// buildOscalMapping THROWS on a ghost/withdrawn control — scopeOscalMapping
// surfaces that to the caller; exportScopedOscal catches it and toasts.

import { buildOscalMapping, type OscalMapping } from "@/data/crosswalk";
import { triggerDownload } from "@/lib/download";
import { toast } from "sonner";
import type { Assessment } from "./types";

export interface OscalScope {
  assessmentName: string;
  selectionCount: number;
  note: string;
}

export type ScopedOscalMapping = OscalMapping & { scope: OscalScope };

export function scopeOscalMapping(assessment: Assessment): ScopedOscalMapping {
  let full: OscalMapping;
  try {
    full = buildOscalMapping(new Date().toISOString());
  } catch (err) {
    // Ghost/withdrawn-control guard tripped — surface it to the caller
    // (package tests make this unreachable for shipped data).
    throw err instanceof Error ? err : new Error(String(err));
  }

  const keptAsis = new Set(assessment.selections.map((r) => r.asiId));
  const families = new Map<string, Set<string>>();
  const funcs = new Map<string, Set<string>>();
  for (const r of assessment.selections) {
    const bucket = r.framework === "nist" ? families : funcs;
    const set = bucket.get(r.asiId) ?? new Set<string>();
    set.add(r.familyOrFunc);
    bucket.set(r.asiId, set);
  }

  const mappings = full.mappings
    .filter((entry) => keptAsis.has(entry.asiId))
    .map((entry) => ({
      ...entry,
      controls: entry.controls.filter((c) => families.get(entry.asiId)?.has(c.family) ?? false),
      aiRmf: entry.aiRmf.filter((m) => funcs.get(entry.asiId)?.has(m.function) ?? false),
    }))
    .filter((entry) => entry.controls.length > 0 || entry.aiRmf.length > 0);

  return {
    ...full,
    mappings,
    scope: {
      assessmentName: assessment.name,
      selectionCount: assessment.selections.length,
      note: "client-scoped subset of the full mapping",
    },
  };
}

export function exportScopedOscal(assessment: Assessment): void {
  try {
    const scoped = scopeOscalMapping(assessment);
    const slug =
      assessment.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "assessment";
    triggerDownload(
      `assessment-${slug}-oscal-v${assessment.dataVersion}.json`,
      JSON.stringify(scoped, null, 2) + "\n",
      "application/json",
    );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Could not build the OSCAL export.");
  }
}
