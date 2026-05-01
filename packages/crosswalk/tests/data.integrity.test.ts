import { describe, expect, it } from "vitest";
import {
  AI_RMF,
  CROSSWALK,
  NIST_800_53,
  NIST_AI_RMF_DESCRIPTIONS,
  NIST_CONTROL_DESCRIPTIONS,
  OWASP_ASI,
} from "../src";

const NIST_FAMILY_IDS = new Set(NIST_800_53.map((f) => f.id));
const AI_RMF_FUNC_IDS = new Set(AI_RMF.map((f) => f.id));
const AI_RMF_CATS_BY_FUNC = new Map(AI_RMF.map((f) => [f.id, new Set(f.cats)]));
const ASI_IDS = new Set(OWASP_ASI.map((r) => r.id));

const firstToken = (s: string): string => s.split(/\s+/)[0];

describe("@obviate/crosswalk integrity", () => {
  it("T1 every OWASP_ASI has a CROSSWALK entry", () => {
    const missing = OWASP_ASI.filter((r) => !CROSSWALK[r.id]).map((r) => r.id);
    expect(missing).toEqual([]);
  });

  it("T2 every CROSSWALK key exists in OWASP_ASI", () => {
    const orphans = Object.keys(CROSSWALK).filter((id) => !ASI_IDS.has(id));
    expect(orphans).toEqual([]);
  });

  it("T3 every CROSSWALK[asi].nist53[].family is a valid NIST_800_53 id", () => {
    const bad: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.nist53) {
        if (!NIST_FAMILY_IDS.has(m.family)) bad.push(`${asi} → ${m.family}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("T4 every nist53 control id resolves in NIST_CONTROL_DESCRIPTIONS", () => {
    const bad: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.nist53) {
        for (const c of m.controls) {
          const id = firstToken(c);
          if (!NIST_CONTROL_DESCRIPTIONS[id]) bad.push(`${asi} → "${c}" (id=${id})`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("T5 every CROSSWALK[asi].aiRmf[].func is a valid AI_RMF id", () => {
    const bad: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        if (!AI_RMF_FUNC_IDS.has(m.func)) bad.push(`${asi} → ${m.func}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("T6a every aiRmf cat exists in matching AI_RMF cats", () => {
    const badCat: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        const validCats = AI_RMF_CATS_BY_FUNC.get(m.func);
        for (const cat of m.cats) {
          if (!validCats?.has(cat)) badCat.push(`${asi} → ${m.func}: "${cat}"`);
        }
      }
    }
    expect(badCat).toEqual([]);
  });

  it("T6b every aiRmf cat id resolves in NIST_AI_RMF_DESCRIPTIONS", () => {
    const badDesc: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        for (const cat of m.cats) {
          const id = firstToken(cat);
          if (!NIST_AI_RMF_DESCRIPTIONS[id]) badDesc.push(`${asi} → "${cat}" (id=${id})`);
        }
      }
    }
    expect(badDesc).toEqual([]);
  });

  it("T7 every ASI has ≥1 nist53 mapping AND ≥1 aiRmf mapping", () => {
    const thin: string[] = [];
    for (const [asi, entry] of Object.entries(CROSSWALK)) {
      if (entry.nist53.length === 0) thin.push(`${asi} nist53=0`);
      if (entry.aiRmf.length === 0) thin.push(`${asi} aiRmf=0`);
    }
    expect(thin).toEqual([]);
  });

  it("T9 every relatedASI in description maps refers to a real OWASP_ASI[].id", () => {
    const bad: string[] = [];
    for (const [k, d] of Object.entries(NIST_CONTROL_DESCRIPTIONS)) {
      for (const asi of d.relatedASI) if (!ASI_IDS.has(asi)) bad.push(`NIST ${k} → ${asi}`);
    }
    for (const [k, d] of Object.entries(NIST_AI_RMF_DESCRIPTIONS)) {
      for (const asi of d.relatedASI) if (!ASI_IDS.has(asi)) bad.push(`AI-RMF ${k} → ${asi}`);
    }
    expect(bad).toEqual([]);
  });

  it("T10 NIST_AI_RMF_DESCRIPTIONS keys use canonical short-form (regression guard against MAP-*/MEASURE-* long-form drift)", () => {
    // Valid prefixes per NIST AI 100-1: GV (GOVERN), MP (MAP), MS (MEASURE), MG (MANAGE).
    // Why: Home.tsx extracts the short-form id (e.g. "MP-1") from CROSSWALK strings
    // like "MP-1 Context Establishment". Long-form keys like "MAP-1" never resolve.
    const validShape = /^(GV|MP|MS|MG)-\d+$/;
    const malformed = Object.keys(NIST_AI_RMF_DESCRIPTIONS).filter((k) => !validShape.test(k));
    expect(malformed).toEqual([]);
  });
});
