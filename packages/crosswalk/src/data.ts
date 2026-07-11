// ─── Data Model: The Middleware Bridge ─────────────────────────────
export interface ASIRisk {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium-High";
  desc: string;
}

export interface NISTFamily {
  id: string;
  name: string;
  color: string;
}

export interface AIRMFFunction {
  id: string;
  name: string;
  color: string;
  cats: string[];
}

// ─── Validation / Transparency Layer ───────────────────────────────
// Every mapping declares HOW it was validated. The launch state for all
// mappings is "editorial" — authored from public evidence and authoritative
// guidance, but not yet through external practitioner sign-off. Promotion
// above "editorial" is a human-in-the-loop Tier-3 action (see VALIDATION.md)
// and requires a `reviewIssue` reference; it NEVER gates a merge.
export type ValidationStatus =
  | "editorial"
  | "practitioner-reviewed"
  | "empirically-validated";

// Ordinal confidence rubric (provisional < moderate < high). Deliberately an
// ORDINAL enum, never a numeric float — see VALIDATION.md and constraint AD-3.
// No mapping carries a confidence value yet: the rubric exists but no mapping
// has been rated, and an unset field is the honest state.
export type ConfidenceLevel = "provisional" | "moderate" | "high";

export interface NISTMapping {
  family: string;
  controls: string[];
  rationale: string;
  validationStatus: ValidationStatus;
  confidence?: ConfidenceLevel;
  /** GitHub issue tracking the external review that promoted this mapping
   *  above "editorial". Required once validationStatus leaves "editorial". */
  reviewIssue?: string;
}

export interface AIRMFMapping {
  func: string;
  cats: string[];
  rationale: string;
  validationStatus: ValidationStatus;
  confidence?: ConfidenceLevel;
  /** GitHub issue tracking the external review that promoted this mapping
   *  above "editorial". Required once validationStatus leaves "editorial". */
  reviewIssue?: string;
}

export interface EvidenceItem {
  title: string;
  type: "incident" | "research" | "guidance";
  sourceUrl?: string;
  cveId?: string;
  datePublished?: string;
  dateVerified: string;
  relatedControls?: string[];
}

export interface CrosswalkEntry {
  nist53: NISTMapping[];
  aiRmf: AIRMFMapping[];
  evidence: EvidenceItem[];
}

/**
 * Editorial bridge to the governance frameworks a regulated firm reports
 * against, beyond 800-53 / AI-RMF. This is a **v1 editorial pass** — not an
 * authoritative mapping, not externally reviewed, and roadmap-flagged (see
 * docs/EXPANSION_ROADMAP.md). It exists so a second-line risk manager can
 * start from the frameworks they actually report against; verify before use.
 */
export interface FrameworkRefs {
  /** ISO/IEC 42001:2023 Annex A control references. */
  iso42001?: string[];
  /** EU AI Act article references (high-risk-system obligations). */
  euAiAct?: string[];
  /** The SR 11-7 / OCC 2011-12 model-risk lifecycle stage most implicated. */
  sr117Lifecycle?: "development" | "validation" | "ongoing-monitoring";
}

export const OWASP_ASI: ASIRisk[] = [
  { id: "ASI01", name: "Agent Goal Hijack", severity: "Critical",
    desc: "Attackers redirect agent objectives through poisoned inputs. Agents cannot reliably distinguish instructions from data." },
  { id: "ASI02", name: "Tool Misuse & Exploitation", severity: "High",
    desc: "Agents misuse legitimate tools due to prompt injection, misalignment, or unsafe delegation within authorized scope." },
  { id: "ASI03", name: "Identity & Privilege Abuse", severity: "Critical",
    desc: "Dynamic trust and delegation exploited to escalate access via cached credentials, role inheritance, or confused deputies." },
  { id: "ASI04", name: "Supply Chain Vulnerabilities", severity: "High",
    desc: "Malicious or tampered tools, MCP descriptors, agent personas, or model weights compromise runtime execution." },
  { id: "ASI05", name: "Unexpected Code Execution", severity: "High",
    desc: "Agent-generated or externally influenced code executes in unintended ways — RCE, sandbox escape, persistence." },
  { id: "ASI06", name: "Memory & Context Poisoning", severity: "High",
    desc: "Corrupted RAG stores, long-term memory, or shared contexts persist across sessions and alter autonomous reasoning." },
  { id: "ASI07", name: "Insecure Inter-Agent Comms", severity: "Medium-High",
    desc: "Agent-to-agent channels lack authentication, encryption, or schema validation — enabling spoofing and replay attacks." },
  { id: "ASI08", name: "Cascading Failures", severity: "Critical",
    desc: "Single fault propagates across autonomous agents, compounding into system-wide harm beyond stepwise human checks." },
  { id: "ASI09", name: "Human-Agent Trust Exploitation", severity: "High",
    desc: "Agents abuse anthropomorphism and authority bias to socially engineer users into approving harmful actions." },
  { id: "ASI10", name: "Rogue Agents", severity: "Critical",
    desc: "Compromised or misaligned agents deviate from intended purpose while appearing compliant on the surface." },
];

// Editorial v1 governance bridge (see FrameworkRefs). NOT authoritative —
// roadmap-flagged, pending practitioner review. Verify against the primary
// texts (ISO/IEC 42001:2023 Annex A; EU AI Act high-risk obligations) before
// relying on any citation.
export const FRAMEWORK_REFS: Record<string, FrameworkRefs> = {
  ASI01: { iso42001: ["A.6.2.4 Operation & monitoring", "A.5.2 AI system impact assessment"], euAiAct: ["Art. 15 Accuracy, robustness & cybersecurity", "Art. 14 Human oversight"], sr117Lifecycle: "ongoing-monitoring" },
  ASI02: { iso42001: ["A.6.2.4 Operation & monitoring", "A.9.2 Responsible use of AI systems"], euAiAct: ["Art. 15 Robustness & cybersecurity", "Art. 14 Human oversight"], sr117Lifecycle: "ongoing-monitoring" },
  ASI03: { iso42001: ["A.6.2.4 Operation & monitoring", "A.10.2 Third-party responsibilities"], euAiAct: ["Art. 15 Cybersecurity", "Art. 12 Record-keeping (logging)"], sr117Lifecycle: "ongoing-monitoring" },
  ASI04: { iso42001: ["A.10.2 Third-party & supplier responsibilities", "A.7.2 Data for AI systems"], euAiAct: ["Art. 15 Cybersecurity", "Art. 10 Data & data governance"], sr117Lifecycle: "development" },
  ASI05: { iso42001: ["A.6.2.3 AI system verification & validation", "A.6.2.4 Operation & monitoring"], euAiAct: ["Art. 15 Accuracy, robustness & cybersecurity"], sr117Lifecycle: "validation" },
  ASI06: { iso42001: ["A.7.2 Data for AI systems", "A.7.4 Data quality"], euAiAct: ["Art. 10 Data & data governance", "Art. 15 Robustness"], sr117Lifecycle: "ongoing-monitoring" },
  ASI07: { iso42001: ["A.6.2.4 Operation & monitoring"], euAiAct: ["Art. 15 Cybersecurity"], sr117Lifecycle: "development" },
  ASI08: { iso42001: ["A.5.2 AI system impact assessment", "A.6.2.4 Operation & monitoring"], euAiAct: ["Art. 9 Risk management system", "Art. 14 Human oversight"], sr117Lifecycle: "ongoing-monitoring" },
  ASI09: { iso42001: ["A.8.2 Information for interested parties", "A.9.2 Responsible use of AI systems"], euAiAct: ["Art. 13 Transparency & provision of information", "Art. 14 Human oversight"], sr117Lifecycle: "ongoing-monitoring" },
  ASI10: { iso42001: ["A.6.2.4 Operation & monitoring", "A.5.2 AI system impact assessment"], euAiAct: ["Art. 14 Human oversight", "Art. 72 Post-market monitoring"], sr117Lifecycle: "ongoing-monitoring" },
};

export const NIST_800_53: NISTFamily[] = [
  { id: "AC", name: "Access Control", color: "#3B82F6" },
  { id: "AU", name: "Audit & Accountability", color: "#8B5CF6" },
  { id: "CA", name: "Assessment & Authorization", color: "#10B981" },
  { id: "CM", name: "Configuration Management", color: "#F59E0B" },
  { id: "CP", name: "Contingency Planning", color: "#EF4444" },
  { id: "IA", name: "Identification & Authentication", color: "#06B6D4" },
  { id: "IR", name: "Incident Response", color: "#F43F5E" },
  { id: "MP", name: "Media Protection", color: "#6366F1" },
  { id: "PE", name: "Physical & Environmental", color: "#78716C" },
  { id: "PL", name: "Planning", color: "#4F46E5" },
  { id: "PM", name: "Program Management", color: "#14B8A6" },
  { id: "RA", name: "Risk Assessment", color: "#EA580C" },
  { id: "SA", name: "System & Services Acquisition", color: "#4338CA" },
  { id: "SC", name: "System & Comms Protection", color: "#2563EB" },
  { id: "SI", name: "System & Info Integrity", color: "#A855F7" },
  { id: "SR", name: "Supply Chain Risk Mgmt", color: "#DC2626" },
];

export const AI_RMF: AIRMFFunction[] = [
  { id: "GOVERN", name: "GOVERN", color: "#3B82F6",
    cats: ["GV-1 Policies & Processes", "GV-2 Accountability", "GV-3 Workforce Diversity", "GV-4 Organizational Practices", "GV-5 Stakeholder Engagement", "GV-6 Supply Chain & Third-Party"] },
  { id: "MAP", name: "MAP", color: "#10B981",
    cats: ["MP-1 Context Establishment", "MP-2 Categorization", "MP-3 Benefits & Costs", "MP-4 Risks from Third Parties", "MP-5 Impact Characterization"] },
  { id: "MEASURE", name: "MEASURE", color: "#F59E0B",
    cats: ["MS-1 Risk Metrics", "MS-2 Trustworthiness Evaluation", "MS-3 Risk Tracking", "MS-4 Measurement Effectiveness"] },
  { id: "MANAGE", name: "MANAGE", color: "#EF4444",
    cats: ["MG-1 Risk Prioritization", "MG-2 Risk Treatment", "MG-3 Response & Recovery", "MG-4 Residual Risk"] },
];

export const CROSSWALK: Record<string, CrosswalkEntry> = {
  ASI01: {
    nist53: [
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-4 Information Flow", "AC-6 Least Privilege"], rationale: "Goal hijack exploits excessive agent permissions. AC-3/6 enforce least privilege for agent tool access and goal-change authority.", validationStatus: "editorial" },
      { family: "SI", controls: ["SI-3 Malicious Code Protection", "SI-5 Security Alerts", "SI-10 Information Input Validation"], rationale: "Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic. SI-3 detects malicious instruction patterns.", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review", "AU-12 Audit Record Generation"], rationale: "Comprehensive logging of goal state, tool sequences, and behavioral baselines enables detection of unauthorized goal drift.", validationStatus: "editorial" },
      { family: "CM", controls: ["CM-3 Configuration Change Control", "CM-5 Access Restrictions for Change"], rationale: "Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Goal-integrity policies, locked system prompts, and escalation thresholds require governance structures (GV-1). Red-team attestation cadence maps to GV-4.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-1 Context Establishment", "MP-5 Impact Characterization"], rationale: "Establishing agent purpose boundaries (MP-1) and documenting the impact of goal-hijack scenarios (MP-5) are prerequisites for mitigation.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "KRIs around goal drift — anomalous tool sequences, unexpected data access — feed continuous risk measurement (MS-1/3).", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Goal override rollback procedures and kill-switch SLAs map to MG-3. Prioritization of goal-hijack as top-tier risk is MG-1.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "EchoLeak (CVE-2025-32711): zero-click prompt-injection data exfiltration in Microsoft 365 Copilot", type: "incident", sourceUrl: "https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html", cveId: "CVE-2025-32711", datePublished: "2025-06", dateVerified: "2026-07-11" },
      { title: "Invitation Is All You Need: Gemini calendar-invite prompt injection (SafeBreach)", type: "incident", sourceUrl: "https://www.safebreach.com/blog/invitation-is-all-you-need-hacking-gemini/", datePublished: "2025-08", dateVerified: "2026-07-11" },
      { title: "AgentFlayer: ChatGPT Connectors 0-click attack (Zenity Labs)", type: "incident", sourceUrl: "https://labs.zenity.io/p/agentflayer-chatgpt-connectors-0click-attack-5b41", datePublished: "2025-08-06", dateVerified: "2026-07-11" },
    ]
  },
  ASI02: {
    nist53: [
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-6 Least Privilege", "AC-25 Reference Monitor"], rationale: "Per-tool least-privilege profiles (scopes, rate limits, egress allowlists) map directly to AC-3/6. Policy enforcement middleware is a reference monitor (AC-25).", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-12 Audit Record Generation", "AU-16 Cross-Organizational Audit"], rationale: "Immutable logs of all tool invocations, parameter recording, and anomalous chaining detection require AU-2/12.", validationStatus: "editorial" },
      { family: "CM", controls: ["CM-7 Least Functionality", "CM-11 User-Installed Software"], rationale: "Restricting agent tool availability to minimum required set maps to CM-7. Controlling tool installation in agent environments is CM-11.", validationStatus: "editorial" },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Execution sandboxes with outbound allowlists (SC-7) and process isolation for tool execution (SC-39) prevent lateral movement.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-6 Supply Chain & Third-Party"], rationale: "Tool Authorization Standards and Agent Tool Registries require governance policy (GV-1). Third-party tool vetting maps to GV-6.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-2 Categorization", "MP-4 Risks from Third Parties"], rationale: "Categorizing tools by risk level (read-only vs destructive) and mapping third-party tool risks.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-2 Trustworthiness Evaluation"], rationale: "Tool budgeting metrics (cost ceilings, rate limits) and drift detection form the measurement baseline.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-3 Response & Recovery"], rationale: "Adaptive tool budgeting with automatic revocation (MG-2). Dry-run previews before destructive actions (MG-3).", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "Amazon Q Developer Vulnerability: Secrets Leaked via DNS and Prompt Injection", type: "incident", sourceUrl: "https://embracethered.com/blog/posts/2025/amazon-q-developer-data-exfil-via-dns/", datePublished: "2025-08-18", dateVerified: "2026-07-11" },
      { title: "MCP Tool Poisoning (OWASP community attack reference)", type: "guidance", sourceUrl: "https://owasp.org/www-community/attacks/MCP_Tool_Poisoning", dateVerified: "2026-07-11" },
      { title: "MITRE ATT&CK T1218 — System/Signed Binary Proxy Execution (LOLBins)", type: "guidance", sourceUrl: "https://attack.mitre.org/techniques/T1218/", dateVerified: "2026-07-11" },
    ]
  },
  ASI03: {
    nist53: [
      { family: "IA", controls: ["IA-2 User Identification", "IA-4 Identifier Management", "IA-5 Authenticator Management", "IA-9 Service Identification"], rationale: "Per-agent cryptographic identity, mTLS certificates, and scoped OAuth tokens map to IA-2/4/5. Agent service identification is IA-9.", validationStatus: "editorial" },
      { family: "AC", controls: ["AC-2 Account Management", "AC-5 Separation of Duties", "AC-6 Least Privilege"], rationale: "Agent identity lifecycle (joiner-mover-leaver), task-scoped permissions, and preventing privilege inheritance across agents.", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-10 Non-repudiation"], rationale: "Delegation chain logging and credential-lifetime tracking require audit capabilities with non-repudiation.", validationStatus: "editorial" },
      { family: "SC", controls: ["SC-23 Session Authenticity"], rationale: "Binding OAuth tokens to signed intent (subject, audience, purpose, session) prevents TOCTOU and session reuse attacks.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-2 Accountability"], rationale: "Extending enterprise IAM to non-human agent identities. Accountability for transitive privilege grants.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-1 Context Establishment", "MP-4 Risks from Third Parties"], rationale: "Mapping delegation chains and cross-agent trust boundaries as risk context.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "Credential-lifetime sampling, delegation-depth metrics, and access certification pass rates.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-4 Residual Risk"], rationale: "Automated revocation on session termination (MG-2). Residual risk from implicit trust inheritance (MG-4).", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "AutoGPT cross-origin credential & cookie leakage on redirect (CVE-2025-31491)", type: "incident", sourceUrl: "https://nvd.nist.gov/vuln/detail/CVE-2025-31491", cveId: "CVE-2025-31491", datePublished: "2025-04-14", dateVerified: "2026-07-11" },
      { title: "CSA Research Note: Confused Deputy Attacks on Autonomous AI Agents", type: "research", sourceUrl: "https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-agent-confused-deputy-prompt-injection/", datePublished: "2026-03-23", dateVerified: "2026-07-11" },
      { title: "OWASP AI Agent Security Cheat Sheet — memory poisoning & credential/privilege escalation", type: "guidance", sourceUrl: "https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html", dateVerified: "2026-07-11" },
      { title: "Security Analysis of Agentic AI Communication Protocols — agent registration/discovery spoofing (CWE-290)", type: "research", sourceUrl: "https://arxiv.org/abs/2511.03841", datePublished: "2025-11", dateVerified: "2026-07-11" },
    ]
  },
  ASI04: {
    nist53: [
      { family: "SR", controls: ["SR-1 Policy & Procedures", "SR-2 Supply Chain Risk Mgmt Plan", "SR-3 Supply Chain Controls", "SR-4 Provenance", "SR-11 Component Authenticity"], rationale: "Direct mapping: AIBOM governance, provenance verification, signature validation, and kill-switch procedures are SR controls — which in 800-53 Rev 5 supersede the withdrawn SA-12 Supply Chain Protection, covering component authenticity and runtime integrity.", validationStatus: "editorial" },
      { family: "SA", controls: ["SA-9 External System Services"], rationale: "Third-party MCP server vetting, agent persona validation, and runtime integrity checks.", validationStatus: "editorial" },
      { family: "CM", controls: ["CM-2 Baseline Configuration", "CM-3 Configuration Change Control"], rationale: "Pinning prompts, tools, and configs by content hash and commit ID with staged rollout.", validationStatus: "editorial" },
      { family: "SI", controls: ["SI-7 Software & Information Integrity"], rationale: "Runtime signature re-validation and behavioral monitoring for tampered components.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-6 Supply Chain & Third-Party"], rationale: "Agentic Component Governance Policy requiring AIBOM for all third-party tools, MCP servers, and agent personas.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-4 Risks from Third Parties"], rationale: "Mapping supply chain attack surfaces including model weights, tool descriptors, and agent personas.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-2 Trustworthiness Evaluation"], rationale: "Evaluating provenance, signature validity, and typosquat scanning results.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Supply-chain kill switches for emergency revocation. Blast-radius estimates for compromised components.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "Malicious data-wiping prompt injected into Amazon Q Developer VS Code extension v1.84.0", type: "incident", sourceUrl: "https://www.reversinglabs.com/blog/aws-amazonq-ai-incident", datePublished: "2025-07", dateVerified: "2026-07-11" },
      { title: "MCP Tool Poisoning Attacks — malicious instructions hidden in tool description/metadata", type: "research", sourceUrl: "https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks", datePublished: "2025-04", dateVerified: "2026-07-11" },
      { title: "Rogue postmark-mcp npm package BCC-exfiltrated emails (first malicious MCP server in the wild)", type: "incident", sourceUrl: "https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft", datePublished: "2025-09", dateVerified: "2026-07-11" },
      { title: "AgentSmith: LangSmith Prompt Hub malicious Proxy Provider agent leaks API keys and data", type: "incident", sourceUrl: "https://noma.security/blog/how-an-ai-agent-vulnerability-in-langsmith-could-lead-to-stolen-api-keys-and-hijacked-llm-responses/", datePublished: "2025-06", dateVerified: "2026-07-11" },
    ]
  },
  ASI05: {
    nist53: [
      { family: "SI", controls: ["SI-3 Malicious Code Protection", "SI-7 Software & Information Integrity", "SI-10 Information Input Validation", "SI-16 Memory Protection"], rationale: "Static scanning before execution, taint-tracking on generated code, and memory protection against RCE exploits.", validationStatus: "editorial" },
      { family: "SC", controls: ["SC-39 Process Isolation", "SC-44 Detonation Chambers"], rationale: "Sandboxed containers with no root access, network egress restrictions, and detonation chambers for untrusted code.", validationStatus: "editorial" },
      { family: "CM", controls: ["CM-7 Least Functionality", "CM-14 Signed Components"], rationale: "Banning eval in production agents, requiring safe interpreters, and signed code validation.", validationStatus: "editorial" },
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-6 Least Privilege"], rationale: "Separating code generation from execution with validation gates and role-based execution controls.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes"], rationale: "Code Execution Risk Policy mandating security gates for all agent-generated code before production execution.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-5 Impact Characterization"], rationale: "Documenting RCE blast radius, sandbox escape scenarios, and dependency poisoning pathways.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics"], rationale: "Tracking code-generation security scan pass rates, sandbox escape attempts, and dependency integrity scores.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-3 Response & Recovery"], rationale: "Kill switch and sandbox isolation as containment procedures. Rollback capabilities for corrupted environments.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "Replit AI agent deleted a production database during a code freeze (SaaStr / Jason Lemkin incident)", type: "incident", sourceUrl: "https://www.theregister.com/2025/07/21/replit_saastr_vibe_coding_incident/", datePublished: "2025-07-21", dateVerified: "2026-07-11" },
      { title: "\"Your AI, My Shell\": Demystifying Prompt Injection Attacks on Agentic AI Coding Editors", type: "research", sourceUrl: "https://arxiv.org/abs/2509.22040", datePublished: "2025-09", dateVerified: "2026-07-11" },
      { title: "Lockfile Poisoning: An Attack Vector to Introduce Malware in the Software Supply Chain", type: "research", sourceUrl: "https://safedep.substack.com/p/lockfile-poisoning-an-attack-vector", datePublished: "2023-12-27", dateVerified: "2026-07-11" },
    ]
  },
  ASI06: {
    nist53: [
      { family: "SC", controls: ["SC-8 Transmission Confidentiality", "SC-28 Protection of Information at Rest"], rationale: "Encryption of memory stores in transit and at rest. Protecting RAG indexes and vector databases.", validationStatus: "editorial" },
      { family: "SI", controls: ["SI-4 System Monitoring", "SI-7 Software & Information Integrity"], rationale: "Content scanning of memory writes, anomalous update frequency detection, and provenance verification.", validationStatus: "editorial" },
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-4 Information Flow"], rationale: "Memory segmentation by tenant/user/domain. Preventing cross-tenant vector bleed through access controls.", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-10 Non-repudiation"], rationale: "Provenance tracking (who wrote what, when) for all memory entries with tamper-evident logging.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Memory Integrity Standard treating agent memory as critical data assets under enterprise data governance.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-2 Categorization"], rationale: "Classifying memory stores by sensitivity, access requirements, and poisoning risk.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "KRIs around anomalous memory-write patterns, cross-tenant access attempts, and self-referential loops.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-3 Response & Recovery"], rationale: "Memory rollback capabilities, snapshot/versioning, and tested recovery procedures.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "Hacking Gemini's Memory with Prompt Injection and Delayed Tool Invocation (Johann Rehberger / Embrace The Red)", type: "incident", sourceUrl: "https://embracethered.com/blog/posts/2025/gemini-memory-persistence-prompt-injection/", datePublished: "2025-02-10", dateVerified: "2026-07-11" },
      { title: "SpAIware: Spyware/false-memory injection into ChatGPT's long-term memory (Johann Rehberger / Embrace The Red)", type: "incident", sourceUrl: "https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/", datePublished: "2024-09-20", dateVerified: "2026-07-11" },
      { title: "OWASP LLM08:2025 Vector and Embedding Weaknesses (cross-context / multi-tenant leakage)", type: "guidance", sourceUrl: "https://genai.owasp.org/llmrisk/llm08-excessive-agency/", datePublished: "2025", dateVerified: "2026-07-11" },
    ]
  },
  ASI07: {
    nist53: [
      { family: "SC", controls: ["SC-8 Transmission Confidentiality", "SC-12 Cryptographic Key Mgmt", "SC-13 Cryptographic Protection", "SC-23 Session Authenticity"], rationale: "End-to-end encryption, mutual authentication, PKI certificate pinning, and forward secrecy for inter-agent channels.", validationStatus: "editorial" },
      { family: "IA", controls: ["IA-3 Device Identification", "IA-9 Service Identification"], rationale: "Per-agent cryptographic identity and mutual authentication for discovery and routing.", validationStatus: "editorial" },
      { family: "SI", controls: ["SI-10 Information Input Validation"], rationale: "Schema validation for inter-agent messages, detecting hidden or modified natural-language instructions.", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging"], rationale: "Inter-agent traffic logging for encryption, signing, and schema validation verification.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes"], rationale: "Inter-Agent Communication Security Standard mandating mutual auth, E2E encryption, and message integrity.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-1 Context Establishment"], rationale: "Communication topology mapping documenting all inter-agent channels, protocols, and trust relationships.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-2 Trustworthiness Evaluation"], rationale: "Testing anti-replay protections and protocol version pinning during pre-production security reviews.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment"], rationale: "Protocol pinning, version enforcement, and discovery message authentication.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "OWASP ASI07 Insecure Inter-Agent Communication: MITM semantic injection over HTTP/unauthenticated channels", type: "guidance", sourceUrl: "https://github.com/microsoft/hve-core/blob/main/.github/skills/security/owasp-agentic/references/07-insecure-inter-agent-communication.md", datePublished: "2025-12", dateVerified: "2026-07-11" },
      { title: "OWASP ASI07: altered reputation messages skew agent trust (agentic trading network scenario)", type: "guidance", sourceUrl: "https://github.com/microsoft/hve-core/blob/main/.github/skills/security/owasp-agentic/references/07-insecure-inter-agent-communication.md", datePublished: "2025-12", dateVerified: "2026-07-11" },
      { title: "Invariant Labs - MCP Tool Poisoning / Shadowing Attacks (spoofed & overridden tool descriptors)", type: "research", sourceUrl: "https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks", datePublished: "2025-04-01", dateVerified: "2026-07-11" },
    ]
  },
  ASI08: {
    nist53: [
      { family: "CP", controls: ["CP-2 Contingency Plan", "CP-10 System Recovery"], rationale: "Business continuity for multi-agent systems. Digital twin replay testing and defined RTOs/RPOs for recovery.", validationStatus: "editorial" },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Agent isolation with strict I/O validation. Network segmentation between trust zones.", validationStatus: "editorial" },
      { family: "RA", controls: ["RA-3 Risk Assessment", "RA-5 Vulnerability Monitoring"], rationale: "Blast-radius assessment mapping maximum downstream impact and propagation pathways.", validationStatus: "editorial" },
      { family: "IR", controls: ["IR-4 Incident Handling", "IR-5 Incident Monitoring"], rationale: "Circuit breakers, rate limiting, and automated isolation of faulty agents during cascading events.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Classifying cascading failure as enterprise-level systemic risk. Circuit breaker mandates at inter-agent boundaries.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-5 Impact Characterization"], rationale: "Blast-radius assessment estimating maximum downstream impact of single-agent faults.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-3 Risk Tracking"], rationale: "Digital twin replay testing — re-running recorded actions in isolated environments to detect cascade potential.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-3 Response & Recovery", "MG-4 Residual Risk"], rationale: "Emergency isolation procedures, governance drift monitoring, and residual systemic risk tracking.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "TradeTrap: Are LLM-based Trading Agents Truly Reliable and Faithful?", type: "research", sourceUrl: "https://arxiv.org/abs/2512.02261", datePublished: "2025-12", dateVerified: "2026-07-11" },
      { title: "Data Poisoning Vulnerabilities Across Healthcare AI Architectures: A Security Threat Analysis", type: "research", sourceUrl: "https://arxiv.org/abs/2511.11020", datePublished: "2025-11", dateVerified: "2026-07-11" },
      { title: "Addressing Cascading Failures (Google SRE Book, Ch. 22)", type: "guidance", sourceUrl: "https://sre.google/sre-book/addressing-cascading-failures/", datePublished: "2016", dateVerified: "2026-07-11" },
    ]
  },
  ASI09: {
    nist53: [
      { family: "AC", controls: ["AC-3 Access Enforcement"], rationale: "Mandatory friction for high-risk actions — confirmation prompts, cooling-off periods, risk badges.", validationStatus: "editorial" },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review"], rationale: "Immutable logs of user queries, agent recommendations, and approval decisions for forensic review.", validationStatus: "editorial" },
      { family: "PM", controls: ["PM-13 Security & Privacy Workforce", "PM-14 Testing Training & Monitoring"], rationale: "Annual training for personnel on automation bias, anthropomorphism risks, and AI social engineering. Note: AT-2 (Literacy Training) and AT-3 (Role-Based Training) from the AT family are also directly applicable but are not included in this crosswalk's scope.", validationStatus: "editorial" },
      { family: "PL", controls: ["PL-4 Rules of Behavior"], rationale: "Human-Agent Interaction Governance Standard defining rules for how humans must verify agent recommendations.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-5 Stakeholder Engagement"], rationale: "Human-Agent Interaction Governance Standard. Stakeholder engagement ensuring users understand automation bias.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-3 Benefits & Costs"], rationale: "Mapping the cost of over-trust — analyzing where rubber-stamping agent recommendations creates systemic risk.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics"], rationale: "KRI: tracking override rates (human reviewers overriding vs rubber-stamping agent recommendations).", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment"], rationale: "Confidence-weighted cues, risk badges, and separate preview-from-effect mechanisms.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "CamoLeak: GitHub Copilot Chat prompt-injection flaw silently exfiltrating private source code and secrets", type: "incident", sourceUrl: "https://www.legitsecurity.com/blog/camoleak-critical-github-copilot-vulnerability-leaks-private-source-code", datePublished: "2025-10", dateVerified: "2026-07-11" },
      { title: "Human-Agent Trust Exploitation (OWASP ASI09) — SecureFlag Security Knowledge Base", type: "guidance", sourceUrl: "https://knowledge-base.secureflag.com/vulnerabilities/sensitive_information_exposure/human_agent_trust_exploitation_in_ai_llm_vulnerability.html", dateVerified: "2026-07-11" },
      { title: "Zscaler ThreatLabz — indirect prompt injection manipulating autonomous AI agents into executing fraudulent payments", type: "research", sourceUrl: "https://www.zscaler.com/blogs/security-research/indirect-prompt-injection-web-content-targets-ai-agents", datePublished: "2026-07", dateVerified: "2026-07-11" },
      { title: "Fooling LIME and SHAP: Adversarial Attacks on Post hoc Explanation Methods (Slack, Hilgard, Jia, Singh, Lakkaraju — AIES 2020)", type: "research", sourceUrl: "https://arxiv.org/abs/1911.02508", datePublished: "2019-11", dateVerified: "2026-07-11" },
    ]
  },
  ASI10: {
    nist53: [
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review", "AU-12 Audit Record Generation"], rationale: "Comprehensive signed audit logs of all agent actions, tool calls, and inter-agent communications.", validationStatus: "editorial" },
      { family: "IR", controls: ["IR-4 Incident Handling", "IR-6 Incident Reporting"], rationale: "Kill-switch and credential revocation procedures. Quarantine of suspicious agents for forensic review.", validationStatus: "editorial" },
      { family: "CA", controls: ["CA-7 Continuous Monitoring", "CA-8 Penetration Testing"], rationale: "Behavioral drift detection comparing actual actions against declared manifests. Periodic red-team testing.", validationStatus: "editorial" },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Trust zones with strict inter-zone rules. Preventing unauthorized self-replication via network segmentation.", validationStatus: "editorial" },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-2 Accountability"], rationale: "Rogue Agent Detection & Response Framework. Signed behavioral manifests declaring expected capabilities.", validationStatus: "editorial" },
      { func: "MAP", cats: ["MP-2 Categorization"], rationale: "Categorizing agent collusion and self-replication as critical risk scenarios requiring specific containment.", validationStatus: "editorial" },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "Behavioral drift detection metrics. Tool-use pattern monitoring against baseline manifests.", validationStatus: "editorial" },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Kill-switch SLA testing (quarterly). Automatic quarantine pending forensic review with risk committee reporting.", validationStatus: "editorial" },
    ],
    evidence: [
      { title: "AI agent fraud: agent impersonation / identity spoofing in multi-agent systems (Stytch)", type: "guidance", sourceUrl: "https://stytch.com/blog/ai-agent-fraud/", dateVerified: "2026-07-11" },
      { title: "Morris II / ComPromptMized: self-replicating zero-click GenAI worm (Cohen, Bitton, Nassi)", type: "research", sourceUrl: "https://arxiv.org/abs/2403.02817", datePublished: "2024-03", dateVerified: "2026-07-11" },
      { title: "Natural emergent misalignment from reward hacking (Anthropic)", type: "research", sourceUrl: "https://www.anthropic.com/research/emergent-misalignment-reward-hacking", datePublished: "2025-11", dateVerified: "2026-07-11" },
    ]
  },
};

export const severityColor: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F59E0B",
  "Medium-High": "#3B82F6",
};
