// ─── Upstream Provenance ────────────────────────────────────────────
// Machine-readable record of which upstream framework editions this crosswalk
// maps. Ships with the data so downstream consumers (and the SPA) can display
// exactly what was mapped, and so upstream drift can be detected against a
// known baseline (see scripts/drift-oscal.mjs).

import { OSCAL_SOURCE } from "./oscal-index.js";

export interface UpstreamLayer {
  framework: string;
  edition: string;
  sourceUrl: string;
  lastVerified: string; // ISO 8601 date
}

export const UPSTREAM_VERSIONS: Record<"owaspAsi" | "nist80053" | "aiRmf", UpstreamLayer> = {
  owaspAsi: {
    framework: "OWASP Top 10 for Agentic AI (ASI)",
    edition: "2026",
    sourceUrl: "https://genai.owasp.org/",
    lastVerified: "2026-07-11",
  },
  nist80053: {
    framework: "NIST SP 800-53",
    edition: `Rev 5 (OSCAL ${OSCAL_SOURCE.tag})`,
    sourceUrl: OSCAL_SOURCE.url,
    lastVerified: OSCAL_SOURCE.retrieved,
  },
  aiRmf: {
    framework: "NIST AI Risk Management Framework",
    edition: "AI 100-1, v1.0",
    sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
    lastVerified: "2026-07-11",
  },
};
