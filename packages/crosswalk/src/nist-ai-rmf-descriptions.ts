/**
 * NIST AI-RMF 100-1 Control Descriptions
 * Comprehensive database of all AI-RMF controls with titles, descriptions, and implementation guidance
 * for agentic AI systems
 */

export interface AIRMFControlDesc {
  title: string;
  description: string;
  implementation: string;
  relatedASI: string[];
}

export const NIST_AI_RMF_DESCRIPTIONS: Record<string, AIRMFControlDesc> = {
  // GOVERN Function Controls (GV-1 through GV-7)
  "GV-1": {
    title: "GV-1 — Policies & Processes",
    description: "Establishes and maintains AI governance policies and processes that define how AI systems are developed, deployed, and monitored within the organization.",
    implementation: "For agentic AI systems, governance policies must address agent autonomy levels, goal alignment verification, tool access restrictions, and escalation procedures for ambiguous decisions.",
    relatedASI: ["ASI01", "ASI03", "ASI08"],
  },
  "GV-2": {
    title: "GV-2 — Risk Management Framework",
    description: "Implements a comprehensive risk management framework that identifies, assesses, and mitigates AI-specific risks throughout the system lifecycle.",
    implementation: "Agentic AI risk management must include threat modeling for agent goal hijacking, tool misuse, cascading failures, and supply chain vulnerabilities specific to AI models and agents.",
    relatedASI: ["ASI01", "ASI02", "ASI04", "ASI05", "ASI08"],
  },
  "GV-3": {
    title: "GV-3 — Workforce Diversity",
    description: "Promotes workforce diversity, equity, inclusion, and accessibility in the teams that design, deploy, and oversee AI systems, so a broad range of perspectives informs risk identification.",
    implementation: "For agentic AI systems, assemble cross-functional review teams spanning security, domain, and affected-user perspectives to surface goal-alignment and misuse risks a homogeneous team would miss.",
    relatedASI: ["ASI01", "ASI03", "ASI10"],
  },
  "GV-4": {
    title: "GV-4 — Oversight & Accountability",
    description: "Establishes oversight mechanisms and accountability structures to ensure AI systems operate within approved parameters and organizational policies.",
    implementation: "For agentic AI, implement continuous monitoring of agent behavior, goal alignment verification, audit trails for all autonomous decisions, and human-in-the-loop controls for critical actions.",
    relatedASI: ["ASI01", "ASI03", "ASI08", "ASI10"],
  },
  "GV-5": {
    title: "GV-5 — Stakeholder Engagement",
    description: "Engages relevant stakeholders in AI governance decisions, including technical teams, business units, and external parties.",
    implementation: "Ensure transparent communication about agentic AI capabilities and limitations to all stakeholders; establish feedback mechanisms for users to report unexpected agent behavior.",
    relatedASI: ["ASI09"],
  },
  "GV-6": {
    title: "GV-6 — Resource Allocation",
    description: "Allocates appropriate resources (budget, personnel, tools) to support AI governance and risk management activities.",
    implementation: "Allocate sufficient resources for continuous monitoring, testing, and red-teaming of agentic AI systems; invest in tools for detecting agent goal drift and anomalous behavior.",
    relatedASI: ["ASI01", "ASI02", "ASI08"],
  },

  // MAP Function Controls (MP-1 through MP-5)
  "MP-1": {
    title: "MP-1 — Context Establishment",
    description: "Establishes the context in which the AI system will be deployed, including intended purpose, settings, expected users, stakeholders, mission objectives, and the legal, regulatory, and ethical considerations that frame acceptable system behavior.",
    implementation: "For agentic AI, document the agent's authorized goals, decision boundaries, permitted tool surfaces, deployment environment, and the human stakeholders responsible for accepting risk before any autonomous action is enabled.",
    relatedASI: ["ASI01", "ASI03", "ASI07"],
  },
  "MP-2": {
    title: "MP-2 — Categorization",
    description: "Categorizes the AI system by task, capability, and deployment context so that risk treatment, oversight intensity, and applicable controls can be calibrated to the system's classification.",
    implementation: "Classify agents and the tools they can invoke by sensitivity tier (read-only vs state-changing, internal vs external, reversible vs destructive); attach control requirements to each tier rather than to the agent as a whole.",
    relatedASI: ["ASI02", "ASI06", "ASI10"],
  },
  "MP-3": {
    title: "MP-3 — Benefits & Costs",
    description: "Identifies and analyzes the expected benefits and costs of the AI system — including non-monetary social, environmental, and human-rights costs — so trade-offs are explicit rather than implicit.",
    implementation: "For agentic AI, weigh productivity gains against the cost of over-trust (rubber-stamped recommendations), oversight burden, and the downstream cost of agent errors that bypass human review.",
    relatedASI: ["ASI09"],
  },
  "MP-4": {
    title: "MP-4 — Risks from Third Parties",
    description: "Identifies risks introduced by third-party AI components, data, models, infrastructure, and tools, and the obligations between the organization and those third parties.",
    implementation: "Inventory third-party model weights, tool descriptors, agent personas, MCP servers, and dependency chains; require provenance, signing, and typosquat scanning before any third-party tool is exposed to an agent.",
    relatedASI: ["ASI02", "ASI03", "ASI04"],
  },
  "MP-5": {
    title: "MP-5 — Impact Characterization",
    description: "Characterizes the likelihood and magnitude of impacts — both positive and negative — that the AI system may have on individuals, groups, organizations, and society.",
    implementation: "Document blast radius for agentic failure modes — goal hijacking, sandbox escape, cascading multi-agent faults, dependency poisoning — including reversibility, affected parties, and worst-case scope.",
    relatedASI: ["ASI01", "ASI05", "ASI08"],
  },

  // MEASURE Function Controls (MS-1 through MS-4)
  "MS-1": {
    title: "MS-1 — Risk Metrics",
    description: "Identifies and applies appropriate methods and metrics for measuring identified AI risks, including selection criteria, known limitations, and the conditions under which each metric is valid.",
    implementation: "For agentic AI, define KRIs such as goal-drift scores, anomalous tool-sequence counts, override rates, credential lifetimes, and dependency integrity scores; document each metric's blind spots before relying on it.",
    relatedASI: ["ASI01", "ASI02", "ASI03", "ASI05", "ASI06", "ASI09", "ASI10"],
  },
  "MS-2": {
    title: "MS-2 — Trustworthiness Evaluation",
    description: "Evaluates AI systems for trustworthy characteristics — validity, reliability, safety, security, accountability, transparency, explainability, privacy, and fairness — using both quantitative and qualitative methods.",
    implementation: "Subject agents to red-team evaluation of prompt-injection resilience, tool-use drift, anti-replay protections, and protocol version pinning; require provenance and signature validation for any third-party component.",
    relatedASI: ["ASI02", "ASI04", "ASI07"],
  },
  "MS-3": {
    title: "MS-3 — Risk Tracking",
    description: "Tracks identified risks over time, including emergent risks, and uses ongoing measurement to inform mitigation decisions and feedback to the MAP and MANAGE functions.",
    implementation: "Continuously track agent behavioral drift against baseline manifests, cross-tenant memory access attempts, delegation depth, and replay-test outcomes; feed deltas back into risk treatment decisions.",
    relatedASI: ["ASI01", "ASI03", "ASI06", "ASI08", "ASI10"],
  },
  "MS-4": {
    title: "MS-4 — Measurement Effectiveness",
    description: "Assesses the effectiveness of the measurement program itself — whether the chosen metrics, tests, and feedback loops are actually surfacing the risks that matter and informing decisions.",
    implementation: "Periodically validate that agent KRIs catch real incidents (not just synthetic ones) by replaying historical near-misses; retire metrics that produce no signal and add coverage where post-incident reviews reveal blind spots.",
    // No CROSSWALK references — listed in AI_RMF.cats but not yet wired into any ASI mapping.
    relatedASI: [],
  },

  // MANAGE Function Controls (MG-1 through MG-4)
  "MG-1": {
    title: "MG-1 — Incident Response",
    description: "Establishes and executes incident response procedures for AI-related security and safety incidents.",
    implementation: "For agentic AI incidents (goal hijacking, tool misuse, cascading failures), activate emergency shutdown, isolate affected agents, and initiate forensic analysis.",
    relatedASI: ["ASI01", "ASI02", "ASI08", "ASI10"],
  },
  "MG-2": {
    title: "MG-2 — Corrective Actions",
    description: "Implements corrective actions to address identified risks and incidents, including system updates and policy changes.",
    implementation: "Apply patches to agentic AI systems, update tool access policies, refine goal definitions, and retrain models based on incident analysis.",
    relatedASI: ["ASI01", "ASI02", "ASI05"],
  },
  "MG-3": {
    title: "MG-3 — Continuous Monitoring",
    description: "Maintains continuous monitoring of AI system performance and risk indicators to detect emerging issues.",
    implementation: "Continuously monitor agentic AI for goal drift, tool misuse patterns, performance degradation, and emerging vulnerabilities in dependencies.",
    relatedASI: ["ASI01", "ASI02", "ASI04", "ASI08"],
  },
  "MG-4": {
    title: "MG-4 — Lessons Learned",
    description: "Captures and applies lessons learned from incidents and monitoring activities to improve AI governance and controls.",
    implementation: "Document agentic AI incidents, near-misses, and red-team findings; share lessons across the organization to prevent similar issues in other AI systems.",
    relatedASI: ["ASI01", "ASI02", "ASI08"],
  },
};
