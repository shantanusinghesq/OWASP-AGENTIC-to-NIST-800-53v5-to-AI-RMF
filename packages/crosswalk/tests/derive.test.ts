// ─── Derivation Pinning Tests ───────────────────────────────────────
// Pins the full derived coverage table and aggregate stats. These reviewed
// values are the source of truth for the client cutover: the client's
// hand-maintained coverage constants disagreed with the actual mappings for
// 9 of 10 ASI risks, so the UI numbers will visibly change to the values
// asserted here. Any future data edit that shifts coverage must consciously
// update this table.

import { describe, expect, it } from "vitest";
import { AI_RMF, CROSSWALK, computeCoverage, computeStats, parseControlRef } from "../src";

describe("parseControlRef", () => {
  it("parses control and category reference strings", () => {
    expect(parseControlRef("AC-3 Access Enforcement")).toEqual({ id: "AC-3", title: "Access Enforcement" });
    expect(parseControlRef("MP-1 Context Establishment")).toEqual({ id: "MP-1", title: "Context Establishment" });
    expect(parseControlRef("GV-1 Policies & Processes")).toEqual({ id: "GV-1", title: "Policies & Processes" });
    expect(parseControlRef("not a control")).toBeNull();
    expect(parseControlRef("AC-3")).toBeNull(); // bare ID without title is not a display string
  });
});

describe("computeCoverage", () => {
  it("derives the reviewed per-ASI coverage table", () => {
    expect(computeCoverage(CROSSWALK)).toEqual({
      ASI01: { nistFamilies: 4, nistControls: 11, aiRmfFunctions: 4, aiRmfCategories: 8 },
      ASI02: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 8 },
      ASI03: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 8 },
      ASI04: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 5 },
      ASI05: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 5 },
      ASI06: { nistFamilies: 4, nistControls: 8, aiRmfFunctions: 4, aiRmfCategories: 6 },
      ASI07: { nistFamilies: 4, nistControls: 8, aiRmfFunctions: 4, aiRmfCategories: 4 },
      ASI08: { nistFamilies: 4, nistControls: 8, aiRmfFunctions: 4, aiRmfCategories: 6 },
      ASI09: { nistFamilies: 4, nistControls: 6, aiRmfFunctions: 4, aiRmfCategories: 5 },
      ASI10: { nistFamilies: 4, nistControls: 9, aiRmfFunctions: 4, aiRmfCategories: 7 },
    });
  });
});

describe("computeStats", () => {
  it("derives the reviewed aggregate statistics", () => {
    expect(computeStats(CROSSWALK, AI_RMF)).toEqual({
      totalNistControlMappings: 90,
      totalAiRmfCategoryMappings: 62,
      uniqueNistControls: 55,
      uniqueAiRmfCategories: 17,
    });
  });
});
