import { describe, expect, it } from "vitest";
import { CROSSWALK, VALIDATION_MIX, computeValidationMix } from "./crosswalk";

describe("computeValidationMix", () => {
  it("counts every mapping (nist53 + aiRmf) across all risks", () => {
    const expectedTotal = Object.values(CROSSWALK).reduce(
      (n, e) => n + e.nist53.length + e.aiRmf.length,
      0,
    );
    expect(VALIDATION_MIX.total).toBe(expectedTotal);
  });

  it("is currently 100% editorial (honest single-author posture)", () => {
    expect(VALIDATION_MIX.editorial).toBe(VALIDATION_MIX.total);
    expect(VALIDATION_MIX["practitioner-reviewed"]).toBe(0);
    expect(VALIDATION_MIX["empirically-validated"]).toBe(0);
  });

  it("segment counts sum to the total", () => {
    const mix = computeValidationMix(CROSSWALK);
    expect(
      mix.editorial + mix["practitioner-reviewed"] + mix["empirically-validated"],
    ).toBe(mix.total);
  });
});
