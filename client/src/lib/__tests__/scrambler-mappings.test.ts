import { describe, expect, it } from "vitest";
import { NIST_800_53 } from "@obviate/crosswalk";
import { CONTROL_STATE_TO_FAMILIES } from "../scrambler-mappings";

const NIST_FAMILY_IDS = new Set(NIST_800_53.map((f) => f.id));

describe("scrambler-mappings integrity", () => {
  it("T8 CONTROL_STATE_TO_FAMILIES values are all valid NIST_800_53 ids", () => {
    const bad: string[] = [];
    for (const [boolName, families] of Object.entries(CONTROL_STATE_TO_FAMILIES)) {
      for (const f of families) {
        if (!NIST_FAMILY_IDS.has(f)) bad.push(`${boolName} → ${f}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
