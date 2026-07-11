// ─── Data Contract Tests ────────────────────────────────────────────
// Pins the data-shape invariants the client depends on. Added ahead of the
// client's cutover to this package (single-source-of-truth migration) so any
// data change that would break rendering fails here first.

import { describe, expect, it } from "vitest";
import {
  AI_RMF,
  CROSSWALK,
  NIST_AI_RMF_DESCRIPTIONS,
  OWASP_ASI,
  parseControlRef,
  severityColor,
} from "../src";

describe("data contract", () => {
  it("C1: distinct 800-53 control IDs === 54 (strings === 54 — one canonical display name per ID)", () => {
    const ids = new Set<string>();
    const strings = new Set<string>();
    for (const entry of Object.values(CROSSWALK)) {
      for (const m of entry.nist53) {
        for (const c of m.controls) {
          strings.add(c);
          const ref = parseControlRef(c);
          expect(ref, `unparseable control ref: "${c}"`).not.toBeNull();
          ids.add(ref!.id);
        }
      }
    }
    expect(ids.size).toBe(54);
    // strings === ids: SI-7 is now normalized to one canonical display name,
    // so every distinct ID maps to exactly one string (enforced by T13b).
    expect(strings.size).toBe(54);
  });

  it("C2: every aiRmf category reference resolves in NIST_AI_RMF_DESCRIPTIONS via the canonical ID parser", () => {
    // Encodes the client's lookup pattern (regex-extracted short-form key)
    // as a package-level invariant: a key-form drift between CROSSWALK cat
    // strings and the descriptions map breaks tooltips in the shipped app.
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        for (const cat of m.cats) {
          const ref = parseControlRef(cat);
          expect(ref, `${asiId}: unparseable category ref "${cat}"`).not.toBeNull();
          expect(
            NIST_AI_RMF_DESCRIPTIONS[ref!.id],
            `${asiId}: category "${cat}" (id ${ref!.id}) has no description entry`,
          ).toBeDefined();
        }
      }
    }
  });

  it("C3: severityColor covers every severity present in OWASP_ASI", () => {
    for (const asi of OWASP_ASI) {
      expect(severityColor[asi.severity], `no color for severity "${asi.severity}"`).toBeDefined();
    }
  });

  it("C4: every aiRmf mapping's cats exist in its function's taxonomy list", () => {
    const byFunc = new Map(AI_RMF.map((f) => [f.id, new Set(f.cats)]));
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        const cats = byFunc.get(m.func);
        expect(cats, `${asiId}: unknown function "${m.func}"`).toBeDefined();
        for (const cat of m.cats) {
          expect(cats!.has(cat), `${asiId}: "${cat}" not in ${m.func} taxonomy`).toBe(true);
        }
      }
    }
  });
});
