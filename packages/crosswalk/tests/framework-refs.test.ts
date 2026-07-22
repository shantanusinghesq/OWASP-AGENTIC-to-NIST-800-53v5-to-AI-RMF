// ─── Framework-Bridge Integrity ─────────────────────────────────────
// The governance bridge (ISO 42001 / EU AI Act / SR 11-7) is editorial in
// its *judgment* — which clause best matches an ASI risk is a defensible
// opinion. It is NOT editorial in its *citations*: a clause id must exist,
// and it must render under its official title.
//
// Before this suite existed, refs were free-text validated only for
// non-emptiness, and "A.6.2.4 Operation & monitoring" (wrong id AND wrong
// title) passed as happily as a correct value. Seven of ten entries shipped
// with that error. These tests resolve every ref against the hand-curated
// index in src/framework-index.ts so neither class of defect can recur.

import { describe, expect, it } from "vitest";
import {
  EU_AI_ACT_ARTICLES,
  FRAMEWORK_REFS,
  ISO_42001_ANNEX_A,
  ISO_42001_OBJECTIVES,
  OWASP_ASI,
} from "../src";

const ASI_IDS = new Set(OWASP_ASI.map((a) => a.id));
const LIFECYCLE = new Set(["development", "validation", "ongoing-monitoring"]);

/** "A.6.2.6 AI system operation and monitoring" -> ["A.6.2.6", "AI system…"] */
const ISO_REF = /^(A\.\d+(?:\.\d+){0,2})\s+(.+)$/;
/** "Art. 15 Accuracy, robustness and cybersecurity" -> ["15", "Accuracy…"] */
const EU_REF = /^Art\.\s+(\d+)\s+(.+)$/;

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

  it("every ISO 42001 reference resolves to a real Annex A clause with its official title", () => {
    for (const [asiId, refs] of Object.entries(FRAMEWORK_REFS)) {
      for (const ref of refs.iso42001 ?? []) {
        const match = ISO_REF.exec(ref);
        expect(match, `${asiId}: ISO ref is not "<clause> <title>": "${ref}"`).not.toBeNull();
        const [, id, title] = match!;

        const control = ISO_42001_ANNEX_A[id];
        expect(control, `${asiId}: unknown ISO clause "${id}"`).toBeDefined();
        expect(title, `${asiId}: ${id} must render its official title`).toBe(control!.title);
      }
    }
  });

  it("every EU AI Act reference resolves to a real article with its canonical short title", () => {
    for (const [asiId, refs] of Object.entries(FRAMEWORK_REFS)) {
      for (const ref of refs.euAiAct ?? []) {
        const match = EU_REF.exec(ref);
        expect(match, `${asiId}: EU ref is not "Art. <n> <title>": "${ref}"`).not.toBeNull();
        const [, article, title] = match!;

        const entry = EU_AI_ACT_ARTICLES[article];
        expect(entry, `${asiId}: unknown EU AI Act article "${article}"`).toBeDefined();
        expect(title, `${asiId}: Art. ${article} must render its canonical short title`).toBe(
          entry!.short,
        );
      }
    }
  });

  // The ISO/EU analogue of T13b (one display string per NIST control id).
  // Art. 15 previously rendered as three different strings across ASI01/02/03,
  // inflating any count that groups by display text.
  it("renders exactly one display string per clause id, across both axes", () => {
    const seen = new Map<string, string>();
    for (const [asiId, refs] of Object.entries(FRAMEWORK_REFS)) {
      for (const ref of [...(refs.iso42001 ?? []), ...(refs.euAiAct ?? [])]) {
        const id = (ISO_REF.exec(ref) ?? EU_REF.exec(ref))?.[1];
        if (!id) continue;
        const prior = seen.get(id);
        if (prior === undefined) seen.set(id, ref);
        else expect(ref, `${asiId}: ${id} already renders as "${prior}"`).toBe(prior);
      }
    }
  });
});

describe("framework index", () => {
  it("holds all 38 ISO/IEC 42001 Annex A controls under the nine objectives", () => {
    const controls = Object.entries(ISO_42001_ANNEX_A);
    expect(controls).toHaveLength(38);
    expect(Object.keys(ISO_42001_OBJECTIVES)).toHaveLength(9);

    for (const [id, control] of controls) {
      expect(control.title.trim().length, `${id} title`).toBeGreaterThan(0);
      expect(
        ISO_42001_OBJECTIVES[control.objective],
        `${id}: unknown objective "${control.objective}"`,
      ).toBeDefined();
      expect(id.startsWith(`${control.objective}.`), `${id} must sit under ${control.objective}`).toBe(
        true,
      );
    }
  });

  it("holds well-formed EU AI Act article entries", () => {
    for (const [article, entry] of Object.entries(EU_AI_ACT_ARTICLES)) {
      expect(/^\d+$/.test(article), `article key "${article}" must be numeric`).toBe(true);
      expect(entry.title.trim().length, `Art. ${article} title`).toBeGreaterThan(0);
      expect(entry.short.trim().length, `Art. ${article} short`).toBeGreaterThan(0);
    }
  });
});
