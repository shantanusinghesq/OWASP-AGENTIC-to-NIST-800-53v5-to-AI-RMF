// ─── Governance Framework Reference Index ───────────────────────────
// HAND-CURATED — there is no refresh script, and there must not be one.
//
// Unlike `oscal-index.ts`, which is GENERATED from NIST's openly-published
// OSCAL catalog, ISO/IEC 42001:2023 is a copyrighted, paywalled standard.
// No lawful machine-readable catalog exists to pin against. This index
// therefore carries **clause identifiers and official titles only** — never
// control text, never requirement prose. Adding the text of an ISO control
// to this file would be a licensing violation.
//
// Provenance: verified 2026-07-22 by two-source corroboration. Two further
// sources consulted (CertPro, Hicomply) publish FABRICATED Annex A schemas
// that contradict both the standard and each other — see docs/VALIDATION.md.
// Do not re-introduce them as references.
//
// Residual risk: the primary ISO/IEC 42001:2023 text has NOT been purchased.
// The guard test proves FRAMEWORK_REFS matches this index; it cannot prove
// this index matches ISO. Buy the standard before this backs a paid
// deliverable — the registry makes that a single-file diff.

/** One ISO/IEC 42001:2023 Annex A control. */
export interface Iso42001Control {
  /** Parent control objective, e.g. "A.6" for control "A.6.2.4". */
  objective: string;
  /** Official Annex A control title. */
  title: string;
}

/** One EU AI Act article. */
export interface EuAiActArticle {
  /** Official article title as published. */
  title: string;
  /** Condensed display form used in crosswalk reference strings and UI chips. */
  short: string;
}

export const ISO_42001_SOURCE = {
  standard: "ISO/IEC 42001:2023",
  annex: "Annex A — 9 control objectives (A.2–A.10), 38 controls",
  verified: "2026-07-22",
  method:
    "Two-source corroboration (ISMS.online, Mindset Cyber). Primary standard text not purchased.",
  note: "Clause IDs and titles only; ISO control text is copyrighted and is deliberately absent.",
} as const;

export const EU_AI_ACT_SOURCE = {
  instrument: "Regulation (EU) 2024/1689 (EU AI Act)",
  verified: "2026-07-22",
  method: "Article numbers and titles verified against the EU AI Act Explorer.",
} as const;

/** The nine Annex A control objectives, for grouping and display. */
export const ISO_42001_OBJECTIVES: Record<string, string> = {
  "A.2": "Policies related to AI",
  "A.3": "Internal organization",
  "A.4": "Resources for AI systems",
  "A.5": "Assessing impacts of AI systems",
  "A.6": "AI system life cycle",
  "A.7": "Data for AI systems",
  "A.8": "Information for interested parties of AI systems",
  "A.9": "Use of AI systems",
  "A.10": "Third-party and customer relationships",
};

/** All 38 Annex A controls, keyed by clause id. */
export const ISO_42001_ANNEX_A: Record<string, Iso42001Control> = {
  // A.2 — Policies related to AI
  "A.2.2": { objective: "A.2", title: "AI policy" },
  "A.2.3": { objective: "A.2", title: "Alignment with other organizational policies" },
  "A.2.4": { objective: "A.2", title: "Review of the AI policy" },

  // A.3 — Internal organization
  "A.3.2": { objective: "A.3", title: "AI roles and responsibilities" },
  "A.3.3": { objective: "A.3", title: "Reporting of concerns" },

  // A.4 — Resources for AI systems
  "A.4.2": { objective: "A.4", title: "Resource documentation" },
  "A.4.3": { objective: "A.4", title: "Data resources" },
  "A.4.4": { objective: "A.4", title: "Tooling resources" },
  "A.4.5": { objective: "A.4", title: "System and computing resources" },
  "A.4.6": { objective: "A.4", title: "Human resources" },

  // A.5 — Assessing impacts of AI systems
  "A.5.2": { objective: "A.5", title: "AI system impact assessment process" },
  "A.5.3": { objective: "A.5", title: "Documentation of AI system impact assessments" },
  "A.5.4": {
    objective: "A.5",
    title: "Assessing AI system impact on individuals or groups of individuals",
  },
  "A.5.5": { objective: "A.5", title: "Assessing societal impacts of AI systems" },

  // A.6 — AI system life cycle
  "A.6.1.2": { objective: "A.6", title: "Objectives for responsible development of AI system" },
  "A.6.1.3": {
    objective: "A.6",
    title: "Processes for responsible design and development of AI systems",
  },
  "A.6.2.2": { objective: "A.6", title: "AI system requirements and specification" },
  "A.6.2.3": { objective: "A.6", title: "Documentation of AI system design and development" },
  "A.6.2.4": { objective: "A.6", title: "AI system verification and validation" },
  "A.6.2.5": { objective: "A.6", title: "AI system deployment" },
  "A.6.2.6": { objective: "A.6", title: "AI system operation and monitoring" },
  "A.6.2.7": { objective: "A.6", title: "AI system technical documentation" },
  "A.6.2.8": { objective: "A.6", title: "AI system recording of event logs" },

  // A.7 — Data for AI systems
  "A.7.2": { objective: "A.7", title: "Data for development and enhancement of AI system" },
  "A.7.3": { objective: "A.7", title: "Acquisition of data" },
  "A.7.4": { objective: "A.7", title: "Quality of data for AI systems" },
  "A.7.5": { objective: "A.7", title: "Data provenance" },
  "A.7.6": { objective: "A.7", title: "Data preparation" },

  // A.8 — Information for interested parties of AI systems
  "A.8.2": { objective: "A.8", title: "System documentation and information for users" },
  "A.8.3": { objective: "A.8", title: "External reporting" },
  "A.8.4": { objective: "A.8", title: "Communication of incidents" },
  "A.8.5": { objective: "A.8", title: "Information for interested parties" },

  // A.9 — Use of AI systems
  "A.9.2": { objective: "A.9", title: "Processes for responsible use of AI systems" },
  "A.9.3": { objective: "A.9", title: "Objectives for responsible use of AI system" },
  "A.9.4": { objective: "A.9", title: "Intended use of the AI system" },

  // A.10 — Third-party and customer relationships
  "A.10.2": { objective: "A.10", title: "Allocating responsibilities" },
  "A.10.3": { objective: "A.10", title: "Suppliers" },
  "A.10.4": { objective: "A.10", title: "Customers" },
};

/**
 * EU AI Act articles cited by the crosswalk, plus adjacent high-risk articles
 * kept as headroom so a new mapping does not require a registry edit.
 */
export const EU_AI_ACT_ARTICLES: Record<string, EuAiActArticle> = {
  "9": { title: "Risk Management System", short: "Risk management system" },
  "10": { title: "Data and Data Governance", short: "Data and data governance" },
  "11": { title: "Technical Documentation", short: "Technical documentation" },
  "12": { title: "Record-Keeping", short: "Record-keeping" },
  "13": {
    title: "Transparency and Provision of Information to Deployers",
    short: "Transparency and provision of information",
  },
  "14": { title: "Human Oversight", short: "Human oversight" },
  "15": {
    title: "Accuracy, Robustness and Cybersecurity",
    short: "Accuracy, robustness and cybersecurity",
  },
  "25": {
    title: "Responsibilities Along the AI Value Chain",
    short: "Responsibilities along the AI value chain",
  },
  "26": {
    title: "Obligations of Deployers of High-Risk AI Systems",
    short: "Obligations of deployers",
  },
  "27": {
    title: "Fundamental Rights Impact Assessment for High-Risk AI Systems",
    short: "Fundamental rights impact assessment",
  },
  "50": {
    title: "Transparency Obligations for Providers and Deployers of Certain AI Systems",
    short: "Transparency obligations",
  },
  "55": {
    title: "Obligations for Providers of General-Purpose AI Models with Systemic Risk",
    short: "GPAI systemic-risk obligations",
  },
  "72": {
    title:
      "Post-Market Monitoring by Providers and Post-Market Monitoring Plan for High-Risk AI Systems",
    short: "Post-market monitoring",
  },
  "73": { title: "Reporting of Serious Incidents", short: "Reporting of serious incidents" },
};

/** Canonical display string for an ISO clause: `"<id> <title>"`. */
export function isoRef(id: string): string {
  const control = ISO_42001_ANNEX_A[id];
  if (!control) throw new Error(`Unknown ISO/IEC 42001 Annex A clause: ${id}`);
  return `${id} ${control.title}`;
}

/** Canonical display string for an EU AI Act article: `"Art. <n> <short>"`. */
export function euAiActRef(article: string): string {
  const entry = EU_AI_ACT_ARTICLES[article];
  if (!entry) throw new Error(`Unknown EU AI Act article: ${article}`);
  return `Art. ${article} ${entry.short}`;
}
