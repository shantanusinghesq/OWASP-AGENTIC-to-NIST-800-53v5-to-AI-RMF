// ─── Tier 2 · Editorial-Quality Suite (REPORT-ONLY) ─────────────────
// These checks measure editorial quality; they DO NOT fail the build. Each
// logs `[Tier2] <check>: N violations` and asserts nothing about N. See
// VALIDATION.md for the three-tier model.
//
// PROMOTION RULE (per VALIDATION.md): when a check's violation count reaches 0
// on `main`, convert its `console.log` into a hard `expect(...).toEqual([])`
// (or `expect(count).toBe(0)`) assertion in the SAME change, so the ratchet can
// never slip back. Promote each check INDEPENDENTLY — a check at 0 hardens even
// while its siblings are still report-only.

import { describe, expect, it } from "vitest";
import { AI_RMF, CROSSWALK, NIST_800_53 } from "../src";

const firstToken = (s: string): string => s.split(/\s+/)[0];

const MIN_RATIONALE_CHARS = 50;

const FAMILY_NAME = new Map(NIST_800_53.map((f) => [f.id, f.name]));
const FUNC_NAME = new Map(AI_RMF.map((f) => [f.id, f.name]));

/**
 * Does `rationale` reference at least one of the mapping's own identifiers?
 * Tolerant of compound shorthand ("AC-3/6" references both AC-3 and AC-6): a
 * match on the family/category prefix ("AC-", "GV-") counts, as does the full
 * control id, the bare family id, or the human family/function name.
 */
function rationaleCrossReferences(
  rationale: string,
  ids: string[],
  prefix: string,
  humanName: string | undefined,
): boolean {
  if (ids.some((id) => rationale.includes(id))) return true; // full id e.g. "SI-10"
  if (rationale.includes(`${prefix}-`)) return true; // compound shorthand e.g. "AC-3/6"
  if (humanName && rationale.includes(humanName)) return true; // "Access Control"
  return false;
}

describe("Tier 2 editorial quality (report-only)", () => {
  it("(a) rationale length >= 50 chars", () => {
    const violations: string[] = [];
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.nist53) {
        if (m.rationale.trim().length < MIN_RATIONALE_CHARS)
          violations.push(`${asiId} nist53 ${m.family} (${m.rationale.trim().length})`);
      }
      for (const m of entry.aiRmf) {
        if (m.rationale.trim().length < MIN_RATIONALE_CHARS)
          violations.push(`${asiId} aiRmf ${m.func} (${m.rationale.trim().length})`);
      }
    }
    // PROMOTE to `expect(violations).toEqual([])` when this reaches 0 on main.
    console.log(`[Tier2] rationale-length: ${violations.length} violations`);
    expect(Array.isArray(violations)).toBe(true);
  });

  it("(b) rationale cross-references its own mapping id/family/function", () => {
    const violations: string[] = [];
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.nist53) {
        const ids = m.controls.map(firstToken); // e.g. ["AC-3", "AC-6"]
        if (!rationaleCrossReferences(m.rationale, ids, m.family, FAMILY_NAME.get(m.family)))
          violations.push(`${asiId} nist53 ${m.family}`);
      }
      for (const m of entry.aiRmf) {
        const ids = m.cats.map(firstToken); // e.g. ["GV-1", "GV-6"]
        if (!rationaleCrossReferences(m.rationale, ids, firstToken(m.cats[0] ?? "").split("-")[0], FUNC_NAME.get(m.func)))
          violations.push(`${asiId} aiRmf ${m.func}`);
      }
    }
    // PROMOTE to `expect(violations).toEqual([])` when this reaches 0 on main.
    console.log(`[Tier2] rationale-cross-reference: ${violations.length} violations — ${violations.join(", ")}`);
    expect(Array.isArray(violations)).toBe(true);
  });

  it("(c) evidence structure — every ASI has >=1 evidence item with a sourceUrl or cveId", () => {
    const violations: string[] = [];
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      if (!entry.evidence.some((e) => e.sourceUrl || e.cveId)) violations.push(asiId);
    }
    // PROMOTE to `expect(violations).toEqual([])` when this reaches 0 on main.
    console.log(`[Tier2] evidence-structure: ${violations.length} violations — ${violations.join(", ")}`);
    expect(Array.isArray(violations)).toBe(true);
  });
});
