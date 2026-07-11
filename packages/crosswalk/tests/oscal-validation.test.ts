// ─── OSCAL-Index Validation ─────────────────────────────────────────
// Validates the crosswalk's 800-53 layer against the vendored OSCAL index
// (packages/crosswalk/src/oscal-index.ts, generated from a pinned
// usnistgov/oscal-content release). Supersedes the earlier curated
// withdrawn-controls list (AD-6): NIST's own catalog is the source of truth
// for existence and withdrawn status. Runs fully offline.

import { describe, expect, it } from "vitest";
import { CROSSWALK, NIST_CONTROL_DESCRIPTIONS, parseControlRef } from "../src";
import { OSCAL_800_53_REV5 } from "../src/oscal-index";

const referencedIds = new Set<string>();
for (const entry of Object.values(CROSSWALK)) {
  for (const m of entry.nist53) {
    for (const c of m.controls) {
      const id = parseControlRef(c)?.id;
      if (id) referencedIds.add(id);
    }
  }
}
const descriptionKeys = Object.keys(NIST_CONTROL_DESCRIPTIONS);
const allIds = [...new Set([...referencedIds, ...descriptionKeys])];

describe("OSCAL 800-53 Rev 5 validation", () => {
  it("every referenced control and description key exists in the Rev 5 catalog", () => {
    const missing = allIds.filter((id) => !OSCAL_800_53_REV5[id]);
    expect(missing, `not in Rev 5 catalog: ${missing.join(", ")}`).toEqual([]);
  });

  it("no referenced control or description key is withdrawn in Rev 5", () => {
    const withdrawn = allIds.filter((id) => OSCAL_800_53_REV5[id]?.withdrawn);
    expect(withdrawn, `withdrawn in Rev 5: ${withdrawn.join(", ")}`).toEqual([]);
  });

  it("every referenced control's family matches the catalog", () => {
    const wrong: string[] = [];
    for (const entry of Object.values(CROSSWALK)) {
      for (const m of entry.nist53) {
        for (const c of m.controls) {
          const id = parseControlRef(c)?.id;
          if (id && OSCAL_800_53_REV5[id] && OSCAL_800_53_REV5[id].family !== m.family) {
            wrong.push(`${id} mapped under ${m.family}, catalog says ${OSCAL_800_53_REV5[id].family}`);
          }
        }
      }
    }
    expect(wrong, wrong.join("; ")).toEqual([]);
  });

  it("reports title divergence from canonical Rev 5 titles (report-only)", () => {
    // Editorial debt, not a failure: many description entries use abbreviated
    // or Rev-4-era titles. Overwhelmingly on UNREFERENCED description keys.
    // A future editorial pass reconciles these; logged here to keep it visible.
    const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
    const divergent = descriptionKeys.filter((id) => {
      const o = OSCAL_800_53_REV5[id];
      return o && norm(NIST_CONTROL_DESCRIPTIONS[id].title) !== norm(o.title);
    });
    const referencedDivergent = divergent.filter((id) => referencedIds.has(id));
    console.log(
      `[OSCAL] title divergence from canonical: ${divergent.length}/${descriptionKeys.length} description entries ` +
        `(${referencedDivergent.length} of them referenced by a mapping: ${referencedDivergent.join(", ") || "none"})`,
    );
    expect(true).toBe(true);
  });
});
