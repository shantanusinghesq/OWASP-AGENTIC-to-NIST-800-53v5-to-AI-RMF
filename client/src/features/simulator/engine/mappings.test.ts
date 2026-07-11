// ─── T15 Scrambler Mapping Validation ───────────────────────────────
// Validates the Scenario Simulator's control-state → NIST-family model.
// Lives client-side (AD-8): its subject data is client-only, so the package
// test suite must not import it. Reads NIST families / ASI ids through the
// data adapter (the client's single crosswalk source).

import { describe, expect, it } from "vitest";
import { NIST_800_53, OWASP_ASI } from "@/data/crosswalk";
import {
  CONTROL_STATE_TO_FAMILIES,
  FAMILY_TO_PRIMARY_BOOLEAN,
  RISK_TO_ASI,
  SECONDARY_BOOLEANS,
} from "./mappings";

const FAMILY_IDS = new Set(NIST_800_53.map((f) => f.id));
const ASI_IDS = new Set(OWASP_ASI.map((r) => r.id));
const BOOLEAN_KEYS = new Set(Object.keys(CONTROL_STATE_TO_FAMILIES));

describe("scrambler mappings (T15)", () => {
  it("every family in CONTROL_STATE_TO_FAMILIES is a real NIST 800-53 family", () => {
    for (const [boolKey, families] of Object.entries(CONTROL_STATE_TO_FAMILIES)) {
      for (const f of families) {
        expect(FAMILY_IDS.has(f), `${boolKey} → unknown family ${f}`).toBe(true);
      }
    }
  });

  it("SECONDARY_BOOLEANS keys are valid families and values are known booleans", () => {
    for (const [family, bools] of Object.entries(SECONDARY_BOOLEANS)) {
      expect(FAMILY_IDS.has(family), `unknown family ${family}`).toBe(true);
      for (const b of bools) {
        expect(BOOLEAN_KEYS.has(b), `${family} → unknown boolean ${b}`).toBe(true);
      }
    }
  });

  it("FAMILY_TO_PRIMARY_BOOLEAN covers every family, bidirectionally consistent with CONTROL_STATE_TO_FAMILIES", () => {
    // Every NIST family has a primary boolean...
    for (const f of FAMILY_IDS) {
      expect(FAMILY_TO_PRIMARY_BOOLEAN[f], `family ${f} has no primary boolean`).toBeDefined();
    }
    // ...and each mapping is the inverse of CONTROL_STATE_TO_FAMILIES.
    for (const [family, boolKey] of Object.entries(FAMILY_TO_PRIMARY_BOOLEAN)) {
      expect(BOOLEAN_KEYS.has(boolKey), `${family} → unknown boolean ${boolKey}`).toBe(true);
      expect(
        CONTROL_STATE_TO_FAMILIES[boolKey].includes(family),
        `${family}'s primary boolean ${boolKey} does not list ${family}`,
      ).toBe(true);
    }
  });

  it("RISK_TO_ASI entries resolve to real ASI ids with weight in [0,1]", () => {
    for (const [risk, relevances] of Object.entries(RISK_TO_ASI)) {
      for (const r of relevances) {
        expect(ASI_IDS.has(r.asiId), `${risk} → unknown ASI ${r.asiId}`).toBe(true);
        expect(r.weight, `${risk} → ${r.asiId} weight out of range`).toBeGreaterThanOrEqual(0);
        expect(r.weight, `${risk} → ${r.asiId} weight out of range`).toBeLessThanOrEqual(1);
      }
    }
  });
});
