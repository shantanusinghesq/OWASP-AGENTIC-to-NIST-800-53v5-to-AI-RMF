// ─── Explorer Search Index ──────────────────────────────────────────
// Flat searchable index of every mapped control/category (frozen at module
// load). Was a useMemo(..., []) in Home; the empty deps made it a constant.

import {
  AI_RMF,
  CROSSWALK,
  NIST_800_53,
  NIST_AI_RMF_DESCRIPTIONS,
  NIST_CONTROL_DESCRIPTIONS,
  OWASP_ASI,
  evidenceText,
} from "@/data/crosswalk";

export interface SearchEntry {
  type: "nist" | "aiRmf";
  asiId: string;
  asiName: string;
  asiDesc: string;
  controlId: string;
  controlText: string;
  family: string;
  familyName: string;
  description: string;
  implementation: string;
  rationale: string;
  evidence: string;
}

function buildSearchIndex(): SearchEntry[] {
  const results: SearchEntry[] = [];

  OWASP_ASI.forEach((asi) => {
    const cw = CROSSWALK[asi.id];
    // NIST 800-53 controls
    cw.nist53.forEach((mapping) => {
      const fam = NIST_800_53.find((f) => f.id === mapping.family);
      if (!fam) return;
      mapping.controls.forEach((ctrl) => {
        const match = ctrl.match(/^([A-Z]{2,8}-\d{1,2})\s(.+)/);
        const controlId = match ? match[1] : ctrl;
        const desc = NIST_CONTROL_DESCRIPTIONS[controlId];
        results.push({
          type: "nist",
          asiId: asi.id,
          asiName: asi.name,
          asiDesc: asi.desc,
          controlId,
          controlText: ctrl,
          family: fam.id,
          familyName: fam.name,
          description: desc ? desc.description : "",
          implementation: desc ? desc.implementation : "",
          rationale: mapping.rationale,
          evidence: evidenceText(cw.evidence),
        });
      });
    });
    // AI-RMF categories
    cw.aiRmf.forEach((mapping) => {
      const func = AI_RMF.find((f) => f.id === mapping.func);
      if (!func) return;
      mapping.cats.forEach((cat) => {
        const match = cat.match(/^([A-Z]{2,8}-\d{1,2})\s(.+)/);
        const controlId = match ? match[1] : cat;
        const desc = NIST_AI_RMF_DESCRIPTIONS[controlId];
        results.push({
          type: "aiRmf",
          asiId: asi.id,
          asiName: asi.name,
          asiDesc: asi.desc,
          controlId,
          controlText: cat,
          family: func.id,
          familyName: func.name,
          description: desc ? desc.description : "",
          implementation: desc ? desc.implementation : "",
          rationale: mapping.rationale,
          evidence: evidenceText(cw.evidence),
        });
      });
    });
  });
  return results;
}

export const SEARCH_INDEX: SearchEntry[] = buildSearchIndex();
