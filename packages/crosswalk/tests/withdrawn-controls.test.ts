// ─── Withdrawn-Control Guard ────────────────────────────────────────
// The dataset is labelled "NIST 800-53 Rev 5", yet historically carried
// controls withdrawn in Rev 5 (their intent redistributed to other families).
// This guard fails if any withdrawn control ID is either referenced by a
// CROSSWALK mapping OR retained as a description key. It uses a curated list
// for now; WS5 (Wave 3) replaces this list with the vendored OSCAL index'
// authoritative withdrawn flags.

import { describe, expect, it } from "vitest";
import { CROSSWALK, NIST_CONTROL_DESCRIPTIONS, parseControlRef } from "../src";

// Controls withdrawn in SP 800-53 Rev 5 (Appendix — "Withdrawn Controls"),
// limited to those this dataset previously contained. SA-12 was the only one
// ever referenced by a mapping (ASI04); it is superseded by the SR family.
const WITHDRAWN_REV5 = new Set([
  "SA-6",
  "SA-7",
  "SA-12",
  "SA-13",
  "SA-14",
  "SA-18",
  "SA-19",
  "SC-9",
  "SC-19",
  "SC-33",
  "SI-9",
]);

describe("withdrawn controls", () => {
  it("no CROSSWALK mapping references a Rev-5-withdrawn control", () => {
    const offenders: string[] = [];
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.nist53) {
        for (const c of m.controls) {
          const id = parseControlRef(c)?.id;
          if (id && WITHDRAWN_REV5.has(id)) offenders.push(`${asiId}: ${c}`);
        }
      }
    }
    expect(offenders, `withdrawn controls referenced: ${offenders.join(", ")}`).toEqual([]);
  });

  it("no description key is a Rev-5-withdrawn control", () => {
    const offenders = Object.keys(NIST_CONTROL_DESCRIPTIONS).filter((k) => WITHDRAWN_REV5.has(k));
    expect(offenders, `withdrawn description keys: ${offenders.join(", ")}`).toEqual([]);
  });
});
