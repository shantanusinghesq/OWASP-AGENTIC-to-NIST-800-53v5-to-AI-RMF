// ─── selectionCoverage / asiGaps ────────────────────────────────────
// Pure derivations over a fixture selection against the REAL crosswalk data.
// ASI01 ground truth (pinned by RiskDetail.validation.test.tsx as 4+4):
//   nist53 families: AC, SI, AU, CM — AC carries AC-3, AC-4, AC-6
//   aiRmf functions: GOVERN, MAP, MEASURE, MANAGE — GOVERN carries GV-1, GV-4

import { describe, expect, it } from "vitest";
import { asiGaps, selectionCoverage } from "./coverage";
import type { Assessment, MappingRef } from "./types";

const fixture = (selections: MappingRef[]): Assessment => ({
  id: "test-id",
  name: "Fixture",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  dataVersion: "0.0.0-test",
  selections,
  annotations: {},
});

describe("selectionCoverage", () => {
  it("returns zeros for an empty selection", () => {
    expect(selectionCoverage(fixture([]))).toEqual({
      controls: 0,
      families: 0,
      functions: 0,
      cats: 0,
    });
  });

  it("counts distinct controls/families/functions/cats for ASI01 AC + GOVERN", () => {
    const a = fixture([
      { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" },
      { asiId: "ASI01", framework: "aiRmf", familyOrFunc: "GOVERN" },
    ]);
    expect(selectionCoverage(a)).toEqual({
      controls: 3, // AC-3, AC-4, AC-6
      families: 1, // AC
      functions: 1, // GOVERN
      cats: 2, // GV-1, GV-4
    });
  });

  it("ignores refs that no longer resolve against the data", () => {
    const a = fixture([
      { asiId: "ASI99", framework: "nist", familyOrFunc: "AC" },
      { asiId: "ASI01", framework: "nist", familyOrFunc: "ZZ" },
    ]);
    expect(selectionCoverage(a)).toEqual({ controls: 0, families: 0, functions: 0, cats: 0 });
  });
});

describe("asiGaps", () => {
  it("reports per-framework available/selected/missing/pct for each selected ASI", () => {
    const a = fixture([
      { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" },
      { asiId: "ASI01", framework: "aiRmf", familyOrFunc: "GOVERN" },
    ]);
    const gaps = asiGaps(a);
    expect(gaps).toHaveLength(1);
    const [gap] = gaps;
    expect(gap.asiId).toBe("ASI01");

    expect(gap.nist.available).toEqual(["AC", "SI", "AU", "CM"]);
    expect(gap.nist.selected).toEqual(["AC"]);
    expect(gap.nist.missing).toEqual(["SI", "AU", "CM"]);
    expect(gap.nist.pct).toBe(25);

    expect(gap.aiRmf.available).toEqual(["GOVERN", "MAP", "MEASURE", "MANAGE"]);
    expect(gap.aiRmf.selected).toEqual(["GOVERN"]);
    expect(gap.aiRmf.missing).toEqual(["MAP", "MEASURE", "MANAGE"]);
    expect(gap.aiRmf.pct).toBe(25);
  });

  it("returns one entry per distinct selected ASI, sorted, skipping unknown ASIs", () => {
    const a = fixture([
      { asiId: "ASI02", framework: "nist", familyOrFunc: "CM" },
      { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" },
      { asiId: "ASI99", framework: "nist", familyOrFunc: "AC" },
    ]);
    expect(asiGaps(a).map((g) => g.asiId)).toEqual(["ASI01", "ASI02"]);
  });
});
