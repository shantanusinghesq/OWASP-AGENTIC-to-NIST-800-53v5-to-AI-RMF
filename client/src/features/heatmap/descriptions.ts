// ─── Heatmap Header/Cell Descriptions ───────────────────────────────
// Single source for the framework descriptions shown in heatmap tooltips.
// Previously inlined twice (HeatCell + the 800-53 heatmap header) — the two
// copies were verified identical before deduplication.

export const NIST_FAMILY_DESCRIPTIONS: Record<string, string> = {
  AC: "Access Control: Manages user access, permissions, and authentication to protect systems and data from unauthorized use.",
  AU: "Audit & Accountability: Tracks and logs system activities to enable detection of unauthorized actions and accountability.",
  CA: "Assessment & Authorization: Evaluates security controls and authorizes systems for operation based on risk assessment.",
  CM: "Configuration Management: Controls system configuration changes to maintain baseline integrity and prevent unauthorized modifications.",
  CP: "Contingency Planning: Prepares for disruptions through backup, recovery, and continuity procedures.",
  IA: "Identification & Authentication: Verifies user and system identities through credentials and multi-factor authentication.",
  IR: "Incident Response: Detects, responds to, and recovers from security incidents and breaches.",
  MP: "Media Protection: Protects physical and digital media containing sensitive information from unauthorized access.",
  PE: "Physical & Environmental: Secures physical facilities, equipment, and environmental controls against threats.",
  PL: "Planning: Develops security strategies, policies, and plans aligned with organizational objectives.",
  PM: "Program Management: Oversees security program governance, resource allocation, and compliance.",
  RA: "Risk Assessment: Identifies, analyzes, and evaluates security risks to inform mitigation strategies.",
  SA: "System & Services Acquisition: Ensures security requirements are met in procurement and development of systems and services.",
  SC: "System & Comms Protection: Protects system boundaries and communications channels from unauthorized access and interference.",
  SI: "System & Info Integrity: Maintains system and information integrity through monitoring, validation, and protection mechanisms.",
  SR: "Supply Chain Risk Mgmt: Manages risks from suppliers, vendors, and third-party dependencies.",
};

export const AI_RMF_FUNCTION_DESCRIPTIONS: Record<string, string> = {
  GOVERN: "Establish AI governance structures, policies, and accountability mechanisms for managing agentic AI systems.",
  MAP: "Map and characterize AI risks, including context establishment, categorization, and impact assessment.",
  MEASURE: "Measure and track AI risks through metrics, trustworthiness evaluation, and effectiveness monitoring.",
  MANAGE: "Manage AI risks through prioritization, treatment, response, recovery, and residual risk acceptance.",
};
