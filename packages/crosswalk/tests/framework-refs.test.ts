// ─── Framework-Bridge Integrity ─────────────────────────────────────
// The editorial v1 governance bridge (ISO 42001 / EU AI Act / SR 11-7) is
// not authoritative, but it must at least be structurally sound: keyed by
// real ASI ids, with valid lifecycle stages and non-empty reference strings.

import { describe, expect, it } from "vitest";
import { FRAMEWORK_REFS, OWASP_ASI } from "../src";

const ASI_IDS = new Set(OWASP_ASI.map((a) => a.id));
const LIFECYCLE = new Set(["development", "validation", "ongoing-monitoring"]);

describe("FRAMEWORK_REFS", () => {
  it("covers every ASI risk exactly, keyed by a real id", () => {
    expect(Object.keys(FRAMEWORK_REFS).sort()).toEqual([...ASI_IDS].sort());
  });

  it("every entry has valid, non-empty references and lifecycle stage", () => {
    for (const [asiId, refs] of Object.entries(FRAMEWORK_REFS)) {
      expect(ASI_IDS.has(asiId)).toBe(true);
      for (const r of [...(refs.iso42001 ?? []), ...(refs.euAiAct ?? [])]) {
        expect(r.trim().length, `${asiId} ref`).toBeGreaterThan(0);
      }
      if (refs.sr117Lifecycle) {
        expect(LIFECYCLE.has(refs.sr117Lifecycle), `${asiId} lifecycle`).toBe(true);
      }
    }
  });
});
