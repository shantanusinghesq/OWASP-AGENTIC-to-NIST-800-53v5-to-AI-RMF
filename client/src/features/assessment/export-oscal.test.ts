// ─── Scoped OSCAL export (node) ─────────────────────────────────────
// scopeOscalMapping filters the full OSCAL-aligned mapping down to the
// assessment's selections: kept ASIs → kept 800-53 families → kept AI-RMF
// functions, dropping entries left empty, while passing the catalog
// provenance metadata through untouched.

import { describe, expect, it } from "vitest";
import { CROSSWALK, CROSSWALK_DATA_VERSION } from "@/data/crosswalk";
import { scopeOscalMapping } from "./export-oscal";
import type { Assessment, MappingRef } from "./types";

const makeAssessment = (selections: MappingRef[]): Assessment => ({
  id: "test-fixture",
  name: "Scoped OSCAL fixture",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  dataVersion: CROSSWALK_DATA_VERSION,
  selections,
  annotations: {},
});

describe("scopeOscalMapping", () => {
  it("keeps only the selected ASI, family, and (empty) aiRmf set", () => {
    const scoped = scopeOscalMapping(
      makeAssessment([{ asiId: "ASI01", framework: "nist", familyOrFunc: "AC" }]),
    );

    expect(scoped.mappings).toHaveLength(1);
    const entry = scoped.mappings[0];
    expect(entry.asiId).toBe("ASI01");

    // Every AC control the crosswalk maps for ASI01, and ONLY family AC.
    const acControls = CROSSWALK.ASI01.nist53.find((m) => m.family === "AC")!.controls;
    expect(entry.controls).toHaveLength(acControls.length);
    expect(new Set(entry.controls.map((c) => c.family))).toEqual(new Set(["AC"]));
    expect(entry.controls.every((c) => c.withdrawn === false)).toBe(true);
    expect(entry.controls.every((c) => c.catalogTitle.length > 0)).toBe(true);

    // No aiRmf function selected → filtered to empty.
    expect(entry.aiRmf).toEqual([]);

    expect(scoped.scope).toEqual({
      assessmentName: "Scoped OSCAL fixture",
      selectionCount: 1,
      note: "client-scoped subset of the full mapping",
    });
  });

  it("filters aiRmf to the selected functions and drops unselected ASIs", () => {
    const scoped = scopeOscalMapping(
      makeAssessment([
        { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" },
        { asiId: "ASI01", framework: "aiRmf", familyOrFunc: "GOVERN" },
        { asiId: "ASI02", framework: "aiRmf", familyOrFunc: "MAP" },
      ]),
    );

    expect(scoped.mappings.map((m) => m.asiId)).toEqual(["ASI01", "ASI02"]);

    const asi01 = scoped.mappings.find((m) => m.asiId === "ASI01")!;
    expect(asi01.aiRmf.map((m) => m.function)).toEqual(["GOVERN"]);

    const asi02 = scoped.mappings.find((m) => m.asiId === "ASI02")!;
    expect(asi02.controls).toEqual([]);
    expect(asi02.aiRmf.map((m) => m.function)).toEqual(["MAP"]);

    expect(scoped.scope.selectionCount).toBe(3);
  });

  it("passes the OSCAL catalog provenance metadata through untouched", () => {
    const scoped = scopeOscalMapping(
      makeAssessment([{ asiId: "ASI01", framework: "nist", familyOrFunc: "AC" }]),
    );
    expect(scoped.metadata.oscalCatalog.tag).toMatch(/^v\d/);
    expect(scoped.metadata.oscalCatalog.url).toContain("oscal-content");
    expect(scoped.metadata.version).toBe(CROSSWALK_DATA_VERSION);
    expect(scoped["$schema-note"]).toContain("OSCAL-aligned");
  });

  it("drops an ASI whose only selections filter to nothing", () => {
    // ASI02 selected under a family it doesn't map (IA) → entry left empty → dropped.
    const scoped = scopeOscalMapping(
      makeAssessment([{ asiId: "ASI02", framework: "nist", familyOrFunc: "IA" }]),
    );
    expect(scoped.mappings).toEqual([]);
    expect(scoped.scope.selectionCount).toBe(1);
  });
});
