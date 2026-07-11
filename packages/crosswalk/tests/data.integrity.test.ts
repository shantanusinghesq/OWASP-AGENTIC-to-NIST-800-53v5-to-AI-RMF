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

describe("@haremantra/crosswalk integrity", () => {
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

  it("T11 every ASI evidence is a non-empty structured array (+ verifiability report)", () => {
    const validTypes = new Set(["incident", "research", "guidance"]);
    const noVerifiableRef: string[] = [];
    for (const [asiId, entry] of Object.entries(CROSSWALK)) {
      const ev = entry.evidence;
      expect(Array.isArray(ev), `${asiId}: evidence must be an array`).toBe(true);
      expect(ev.length, `${asiId}: evidence array is empty`).toBeGreaterThan(0);
      for (const item of ev) {
        expect(item.title.trim().length, `${asiId}: evidence item has empty title`).toBeGreaterThan(0);
        expect(validTypes.has(item.type), `${asiId}: invalid evidence type "${item.type}"`).toBe(true);
        expect(item.dateVerified, `${asiId}: dateVerified "${item.dateVerified}" not YYYY-MM-DD`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        );
      }
      // An ASI is "unverifiable" only if NO item carries a sourceUrl or CVE id.
      if (!ev.some((item) => item.sourceUrl || item.cveId)) noVerifiableRef.push(asiId);
    }
    // Report-only: WS7 backfilled structured, web-verified evidence — every ASI
    // now carries at least one sourceUrl/CVE, so this should be 0/10.
    console.log(
      `[T11] ASIs with no machine-resolvable reference (URL/CVE): ${noVerifiableRef.length}/10 — ${noVerifiableRef.join(", ")}`,
    );
  });

  it("T-scope defined-but-unmapped families are exactly {MP, PE}; no excluded family is mapped", () => {
    const mappedFamilies = new Set<string>();
    for (const entry of Object.values(CROSSWALK)) {
      for (const m of entry.nist53) mappedFamilies.add(m.family);
    }
    const definedUnmapped = NIST_800_53.map((f) => f.id).filter((id) => !mappedFamilies.has(id)).sort();
    expect(definedUnmapped).toEqual(["MP", "PE"]);
    // The four out-of-scope families must never appear in a mapping.
    for (const excluded of ["AT", "MA", "PS", "PT"]) {
      expect(mappedFamilies.has(excluded), `excluded family ${excluded} is mapped`).toBe(false);
    }
  });

  it("T-title every AI-RMF description title matches its taxonomy display name", () => {
    // The tooltip shows NIST_AI_RMF_DESCRIPTIONS[id].title while the visible
    // label is the AI_RMF.cats display string; a mismatch renders the wrong
    // category name (e.g. GV-6 "Supply Chain" labelled "Resource Allocation").
    // Description titles use "ID — Name"; taxonomy strings use "ID Name".
    const mismatches: string[] = [];
    for (const func of AI_RMF) {
      for (const cat of func.cats) {
        const m = cat.match(/^(\S+)\s+(.*)$/);
        if (!m) continue;
        const [, id, name] = m;
        const desc = NIST_AI_RMF_DESCRIPTIONS[id];
        if (!desc) {
          mismatches.push(`${id}: no description`);
          continue;
        }
        const descName = desc.title.replace(/^\S+\s*—\s*/, "").trim();
        if (descName !== name) mismatches.push(`${id}: "${descName}" != "${name}"`);
      }
    }
    expect(mismatches, `title/display-name mismatches: ${mismatches.join("; ")}`).toEqual([]);
  });

  it("T16 unreferenced AI-RMF description keys equal the known-orphan allowlist", () => {
    // Ratchet: description keys not cited by any CROSSWALK aiRmf mapping must
    // equal exactly this allowlist. Shrinking it requires wiring the category
    // into a mapping (with rationale); a NEW orphan fails immediately.
    // GV-3 (Workforce Diversity) and MS-4 (Measurement Effectiveness) are valid
    // taxonomy categories not yet mapped — tracked for future editorial wiring.
    const KNOWN_ORPHANS = new Set(["GV-3", "MS-4"]);
    const referenced = new Set<string>();
    for (const entry of Object.values(CROSSWALK)) {
      for (const m of entry.aiRmf) {
        for (const cat of m.cats) referenced.add(firstToken(cat));
      }
    }
    const orphans = Object.keys(NIST_AI_RMF_DESCRIPTIONS).filter((k) => !referenced.has(k)).sort();
    expect(orphans, `orphan set changed; update wiring or allowlist`).toEqual([...KNOWN_ORPHANS].sort());
  });

  it("T13b every control ID renders exactly one display string across all CROSSWALK mappings", () => {
    // Guards the SI-7 class of defect: the same control ID cited under two
    // display names ("SI-7 Software Integrity" vs "...Software & Information
    // Integrity") inflated the distinct-control statistic.
    const byId = new Map<string, Set<string>>();
    for (const entry of Object.values(CROSSWALK)) {
      for (const m of entry.nist53) {
        for (const c of m.controls) {
          const id = firstToken(c);
          if (!byId.has(id)) byId.set(id, new Set());
          byId.get(id)!.add(c);
        }
      }
    }
    const inconsistent = [...byId.entries()]
      .filter(([, strings]) => strings.size > 1)
      .map(([id, strings]) => `${id}: ${[...strings].join(" | ")}`);
    expect(inconsistent, `controls with inconsistent display strings: ${inconsistent.join("; ")}`).toEqual([]);
  });
});
