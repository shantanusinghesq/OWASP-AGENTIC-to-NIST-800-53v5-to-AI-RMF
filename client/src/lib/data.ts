// ─── Data Model: The Middleware Bridge ─────────────────────────────
export interface ASIRisk {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium-High";
  desc: string;
  coverage: {
    nistFamilies: number;
    nistControls: number;
    aiRmfFunctions: number;
    aiRmfCategories: number;
  };
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

export interface NISTMapping {
  family: string;
  controls: string[];
  rationale: string;
}

export interface AIRMFMapping {
  func: string;
  cats: string[];
  rationale: string;
}

export interface CrosswalkEntry {
  nist53: NISTMapping[];
  aiRmf: AIRMFMapping[];
  evidence: string;
}

export const OWASP_ASI: ASIRisk[] = [
  { id: "ASI01", name: "Agent Goal Hijack", severity: "Critical",
    desc: "Attackers redirect agent objectives through poisoned inputs. Agents cannot reliably distinguish instructions from data.",
    coverage: { nistFamilies: 4, nistControls: 11, aiRmfFunctions: 4, aiRmfCategories: 8 } },
  { id: "ASI02", name: "Tool Misuse & Exploitation", severity: "High",
    desc: "Agents misuse legitimate tools due to prompt injection, misalignment, or unsafe delegation within authorized scope.",
    coverage: { nistFamilies: 4, nistControls: 9, aiRmfFunctions: 4, aiRmfCategories: 6 } },
  { id: "ASI03", name: "Identity & Privilege Abuse", severity: "Critical",
    desc: "Dynamic trust and delegation exploited to escalate access via cached credentials, role inheritance, or confused deputies.",
    coverage: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 6 } },
  { id: "ASI04", name: "Supply Chain Vulnerabilities", severity: "High",
    desc: "Malicious or tampered tools, MCP descriptors, agent personas, or model weights compromise runtime execution.",
    coverage: { nistFamilies: 4, nistControls: 11, aiRmfFunctions: 4, aiRmfCategories: 6 } },
  { id: "ASI05", name: "Unexpected Code Execution", severity: "High",
    desc: "Agent-generated or externally influenced code executes in unintended ways — RCE, sandbox escape, persistence.",
    coverage: { nistFamilies: 4, nistControls: 10, aiRmfFunctions: 4, aiRmfCategories: 6 } },
  { id: "ASI06", name: "Memory & Context Poisoning", severity: "High",
    desc: "Corrupted RAG stores, long-term memory, or shared contexts persist across sessions and alter autonomous reasoning.",
    coverage: { nistFamilies: 4, nistControls: 9, aiRmfFunctions: 4, aiRmfCategories: 5 } },
  { id: "ASI07", name: "Insecure Inter-Agent Comms", severity: "Medium-High",
    desc: "Agent-to-agent channels lack authentication, encryption, or schema validation — enabling spoofing and replay attacks.",
    coverage: { nistFamilies: 4, nistControls: 8, aiRmfFunctions: 4, aiRmfCategories: 5 } },
  { id: "ASI08", name: "Cascading Failures", severity: "Critical",
    desc: "Single fault propagates across autonomous agents, compounding into system-wide harm beyond stepwise human checks.",
    coverage: { nistFamilies: 4, nistControls: 9, aiRmfFunctions: 4, aiRmfCategories: 8 } },
  { id: "ASI09", name: "Human-Agent Trust Exploitation", severity: "High",
    desc: "Agents abuse anthropomorphism and authority bias to socially engineer users into approving harmful actions.",
    coverage: { nistFamilies: 4, nistControls: 8, aiRmfFunctions: 4, aiRmfCategories: 6 } },
  { id: "ASI10", name: "Rogue Agents", severity: "Critical",
    desc: "Compromised or misaligned agents deviate from intended purpose while appearing compliant on the surface.",
    coverage: { nistFamilies: 5, nistControls: 12, aiRmfFunctions: 4, aiRmfCategories: 7 } },
];

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
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-4 Information Flow", "AC-6 Least Privilege"], rationale: "Goal hijack exploits excessive agent permissions. AC-3/6 enforce least privilege for agent tool access and goal-change authority." },
      { family: "SI", controls: ["SI-3 Malicious Code Protection", "SI-5 Security Alerts", "SI-10 Information Input Validation"], rationale: "Input validation (SI-10) prevents prompt injection payloads from reaching goal-selection logic. SI-3 detects malicious instruction patterns." },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review", "AU-12 Audit Record Generation"], rationale: "Comprehensive logging of goal state, tool sequences, and behavioral baselines enables detection of unauthorized goal drift." },
      { family: "CM", controls: ["CM-3 Configuration Change Control", "CM-5 Access Restrictions for Change"], rationale: "Locking agent system prompts and requiring configuration management for goal changes maps directly to CM-3/5." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Goal-integrity policies, locked system prompts, and escalation thresholds require governance structures (GV-1). Red-team attestation cadence maps to GV-4." },
      { func: "MAP", cats: ["MP-1 Context Establishment", "MP-5 Impact Characterization"], rationale: "Establishing agent purpose boundaries (MP-1) and documenting the impact of goal-hijack scenarios (MP-5) are prerequisites for mitigation." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "KRIs around goal drift — anomalous tool sequences, unexpected data access — feed continuous risk measurement (MS-1/3)." },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Goal override rollback procedures and kill-switch SLAs map to MG-3. Prioritization of goal-hijack as top-tier risk is MG-1." },
    ],
    evidence: "EchoLeak zero-click exfiltration via M365 Copilot; Calendar invite goal-lock drift; AgentFlayer inception attack on ChatGPT users."
  },
  ASI02: {
    nist53: [
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-6 Least Privilege", "AC-25 Reference Monitor"], rationale: "Per-tool least-privilege profiles (scopes, rate limits, egress allowlists) map directly to AC-3/6. Policy enforcement middleware is a reference monitor (AC-25)." },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-12 Audit Record Generation", "AU-16 Cross-Organizational Audit"], rationale: "Immutable logs of all tool invocations, parameter recording, and anomalous chaining detection require AU-2/12." },
      { family: "CM", controls: ["CM-7 Least Functionality", "CM-11 User-Installed Software"], rationale: "Restricting agent tool availability to minimum required set maps to CM-7. Controlling tool installation in agent environments is CM-11." },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Execution sandboxes with outbound allowlists (SC-7) and process isolation for tool execution (SC-39) prevent lateral movement." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-6 Supply Chain & Third-Party"], rationale: "Tool Authorization Standards and Agent Tool Registries require governance policy (GV-1). Third-party tool vetting maps to GV-6." },
      { func: "MAP", cats: ["MP-2 Categorization", "MP-4 Risks from Third Parties"], rationale: "Categorizing tools by risk level (read-only vs destructive) and mapping third-party tool risks." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-2 Trustworthiness Evaluation"], rationale: "Tool budgeting metrics (cost ceilings, rate limits) and drift detection form the measurement baseline." },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-3 Response & Recovery"], rationale: "Adaptive tool budgeting with automatic revocation (MG-2). Dry-run previews before destructive actions (MG-3)." },
    ],
    evidence: "Amazon Q secrets via DNS exfiltration; EDR bypass via tool chaining under trusted credentials; MCP tool descriptor poisoning."
  },
  ASI03: {
    nist53: [
      { family: "IA", controls: ["IA-2 User Identification", "IA-4 Identifier Management", "IA-5 Authenticator Management", "IA-9 Service Identification"], rationale: "Per-agent cryptographic identity, mTLS certificates, and scoped OAuth tokens map to IA-2/4/5. Agent service identification is IA-9." },
      { family: "AC", controls: ["AC-2 Account Management", "AC-5 Separation of Duties", "AC-6 Least Privilege"], rationale: "Agent identity lifecycle (joiner-mover-leaver), task-scoped permissions, and preventing privilege inheritance across agents." },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-10 Non-repudiation"], rationale: "Delegation chain logging and credential-lifetime tracking require audit capabilities with non-repudiation." },
      { family: "SC", controls: ["SC-23 Session Authenticity"], rationale: "Binding OAuth tokens to signed intent (subject, audience, purpose, session) prevents TOCTOU and session reuse attacks." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-2 Accountability"], rationale: "Extending enterprise IAM to non-human agent identities. Accountability for transitive privilege grants." },
      { func: "MAP", cats: ["MP-1 Context Establishment", "MP-4 Risks from Third Parties"], rationale: "Mapping delegation chains and cross-agent trust boundaries as risk context." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "Credential-lifetime sampling, delegation-depth metrics, and access certification pass rates." },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-4 Residual Risk"], rationale: "Automated revocation on session termination (MG-2). Residual risk from implicit trust inheritance (MG-4)." },
    ],
    evidence: "CVE-2025-31491; Confused deputy via cross-agent trust; Memory-based SSH credential escalation; Forged Agent Persona registration."
  },
  ASI04: {
    nist53: [
      { family: "SR", controls: ["SR-1 Policy & Procedures", "SR-2 Supply Chain Risk Mgmt Plan", "SR-3 Supply Chain Controls", "SR-4 Provenance", "SR-11 Component Authenticity"], rationale: "Direct mapping: AIBOM governance, provenance verification, signature validation, and kill-switch procedures are SR controls." },
      { family: "SA", controls: ["SA-9 External System Services", "SA-12 Supply Chain Protection"], rationale: "Third-party MCP server vetting, agent persona validation, and runtime integrity checks." },
      { family: "CM", controls: ["CM-2 Baseline Configuration", "CM-3 Configuration Change Control"], rationale: "Pinning prompts, tools, and configs by content hash and commit ID with staged rollout." },
      { family: "SI", controls: ["SI-7 Software & Information Integrity"], rationale: "Runtime signature re-validation and behavioral monitoring for tampered components." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-6 Supply Chain & Third-Party"], rationale: "Agentic Component Governance Policy requiring AIBOM for all third-party tools, MCP servers, and agent personas." },
      { func: "MAP", cats: ["MP-4 Risks from Third Parties"], rationale: "Mapping supply chain attack surfaces including model weights, tool descriptors, and agent personas." },
      { func: "MEASURE", cats: ["MS-2 Trustworthiness Evaluation"], rationale: "Evaluating provenance, signature validity, and typosquat scanning results." },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Supply-chain kill switches for emergency revocation. Blast-radius estimates for compromised components." },
    ],
    evidence: "Amazon Q supply chain compromise; MCP Tool Descriptor Poisoning; Malicious Postmark MCP server; AgentSmith Prompt-Hub proxy attack."
  },
  ASI05: {
    nist53: [
      { family: "SI", controls: ["SI-3 Malicious Code Protection", "SI-7 Software Integrity", "SI-10 Information Input Validation", "SI-16 Memory Protection"], rationale: "Static scanning before execution, taint-tracking on generated code, and memory protection against RCE exploits." },
      { family: "SC", controls: ["SC-39 Process Isolation", "SC-44 Detonation Chambers"], rationale: "Sandboxed containers with no root access, network egress restrictions, and detonation chambers for untrusted code." },
      { family: "CM", controls: ["CM-7 Least Functionality", "CM-14 Signed Components"], rationale: "Banning eval in production agents, requiring safe interpreters, and signed code validation." },
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-6 Least Privilege"], rationale: "Separating code generation from execution with validation gates and role-based execution controls." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes"], rationale: "Code Execution Risk Policy mandating security gates for all agent-generated code before production execution." },
      { func: "MAP", cats: ["MP-5 Impact Characterization"], rationale: "Documenting RCE blast radius, sandbox escape scenarios, and dependency poisoning pathways." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics"], rationale: "Tracking code-generation security scan pass rates, sandbox escape attempts, and dependency integrity scores." },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment", "MG-3 Response & Recovery"], rationale: "Kill switch and sandbox isolation as containment procedures. Rollback capabilities for corrupted environments." },
    ],
    evidence: "Replit vibe-coding agents executing unreviewed install commands; Direct shell injection via embedded prompts; Dependency lockfile poisoning."
  },
  ASI06: {
    nist53: [
      { family: "SC", controls: ["SC-8 Transmission Confidentiality", "SC-28 Protection of Information at Rest"], rationale: "Encryption of memory stores in transit and at rest. Protecting RAG indexes and vector databases." },
      { family: "SI", controls: ["SI-4 System Monitoring", "SI-7 Software Integrity"], rationale: "Content scanning of memory writes, anomalous update frequency detection, and provenance verification." },
      { family: "AC", controls: ["AC-3 Access Enforcement", "AC-4 Information Flow"], rationale: "Memory segmentation by tenant/user/domain. Preventing cross-tenant vector bleed through access controls." },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-10 Non-repudiation"], rationale: "Provenance tracking (who wrote what, when) for all memory entries with tamper-evident logging." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Memory Integrity Standard treating agent memory as critical data assets under enterprise data governance." },
      { func: "MAP", cats: ["MP-2 Categorization"], rationale: "Classifying memory stores by sensitivity, access requirements, and poisoning risk." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "KRIs around anomalous memory-write patterns, cross-tenant access attempts, and self-referential loops." },
      { func: "MANAGE", cats: ["MG-3 Response & Recovery"], rationale: "Memory rollback capabilities, snapshot/versioning, and tested recovery procedures." },
    ],
    evidence: "Gemini long-term memory corruption via prompt injection; ChatGPT persistent false memory planting; Cross-tenant vector namespace bleed."
  },
  ASI07: {
    nist53: [
      { family: "SC", controls: ["SC-8 Transmission Confidentiality", "SC-12 Cryptographic Key Mgmt", "SC-13 Cryptographic Protection", "SC-23 Session Authenticity"], rationale: "End-to-end encryption, mutual authentication, PKI certificate pinning, and forward secrecy for inter-agent channels." },
      { family: "IA", controls: ["IA-3 Device Identification", "IA-9 Service Identification"], rationale: "Per-agent cryptographic identity and mutual authentication for discovery and routing." },
      { family: "SI", controls: ["SI-10 Information Input Validation"], rationale: "Schema validation for inter-agent messages, detecting hidden or modified natural-language instructions." },
      { family: "AU", controls: ["AU-2 Event Logging"], rationale: "Inter-agent traffic logging for encryption, signing, and schema validation verification." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes"], rationale: "Inter-Agent Communication Security Standard mandating mutual auth, E2E encryption, and message integrity." },
      { func: "MAP", cats: ["MP-1 Context Establishment"], rationale: "Communication topology mapping documenting all inter-agent channels, protocols, and trust relationships." },
      { func: "MEASURE", cats: ["MS-2 Trustworthiness Evaluation"], rationale: "Testing anti-replay protections and protocol version pinning during pre-production security reviews." },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment"], rationale: "Protocol pinning, version enforcement, and discovery message authentication." },
    ],
    evidence: "Semantic injection over unencrypted HTTP channels; Trust poisoning via altered reputation messages; MCP descriptor spoofing."
  },
  ASI08: {
    nist53: [
      { family: "CP", controls: ["CP-2 Contingency Plan", "CP-10 System Recovery"], rationale: "Business continuity for multi-agent systems. Digital twin replay testing and defined RTOs/RPOs for recovery." },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Agent isolation with strict I/O validation. Network segmentation between trust zones." },
      { family: "RA", controls: ["RA-3 Risk Assessment", "RA-5 Vulnerability Monitoring"], rationale: "Blast-radius assessment mapping maximum downstream impact and propagation pathways." },
      { family: "IR", controls: ["IR-4 Incident Handling", "IR-5 Incident Monitoring"], rationale: "Circuit breakers, rate limiting, and automated isolation of faulty agents during cascading events." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-4 Organizational Practices"], rationale: "Classifying cascading failure as enterprise-level systemic risk. Circuit breaker mandates at inter-agent boundaries." },
      { func: "MAP", cats: ["MP-5 Impact Characterization"], rationale: "Blast-radius assessment estimating maximum downstream impact of single-agent faults." },
      { func: "MEASURE", cats: ["MS-3 Risk Tracking"], rationale: "Digital twin replay testing — re-running recorded actions in isolated environments to detect cascade potential." },
      { func: "MANAGE", cats: ["MG-3 Response & Recovery", "MG-4 Residual Risk"], rationale: "Emergency isolation procedures, governance drift monitoring, and residual systemic risk tracking." },
    ],
    evidence: "Financial trading cascade via prompt-injected risk limits; Healthcare protocol propagation from supply-chain tampering; Auto-remediation feedback loops."
  },
  ASI09: {
    nist53: [
      { family: "AC", controls: ["AC-3 Access Enforcement"], rationale: "Mandatory friction for high-risk actions — confirmation prompts, cooling-off periods, risk badges." },
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review"], rationale: "Immutable logs of user queries, agent recommendations, and approval decisions for forensic review." },
      { family: "PM", controls: ["PM-13 Security & Privacy Workforce", "PM-14 Testing Training & Monitoring"], rationale: "Annual training for personnel on automation bias, anthropomorphism risks, and AI social engineering. Note: AT-2 (Literacy Training) and AT-3 (Role-Based Training) from the AT family are also directly applicable but are not included in this crosswalk's scope." },
      { family: "PL", controls: ["PL-4 Rules of Behavior"], rationale: "Human-Agent Interaction Governance Standard defining rules for how humans must verify agent recommendations." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-5 Stakeholder Engagement"], rationale: "Human-Agent Interaction Governance Standard. Stakeholder engagement ensuring users understand automation bias." },
      { func: "MAP", cats: ["MP-3 Benefits & Costs"], rationale: "Mapping the cost of over-trust — analyzing where rubber-stamping agent recommendations creates systemic risk." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics"], rationale: "KRI: tracking override rates (human reviewers overriding vs rubber-stamping agent recommendations)." },
      { func: "MANAGE", cats: ["MG-2 Risk Treatment"], rationale: "Confidence-weighted cues, risk badges, and separate preview-from-effect mechanisms." },
    ],
    evidence: "Helpful Assistant Trojan exfiltrating code; Credential harvesting via contextual deception; Invoice Copilot Fraud; Weaponized Explainability."
  },
  ASI10: {
    nist53: [
      { family: "AU", controls: ["AU-2 Event Logging", "AU-6 Audit Record Review", "AU-12 Audit Record Generation"], rationale: "Comprehensive signed audit logs of all agent actions, tool calls, and inter-agent communications." },
      { family: "IR", controls: ["IR-4 Incident Handling", "IR-6 Incident Reporting"], rationale: "Kill-switch and credential revocation procedures. Quarantine of suspicious agents for forensic review." },
      { family: "CA", controls: ["CA-7 Continuous Monitoring", "CA-8 Penetration Testing"], rationale: "Behavioral drift detection comparing actual actions against declared manifests. Periodic red-team testing." },
      { family: "SC", controls: ["SC-7 Boundary Protection", "SC-39 Process Isolation"], rationale: "Trust zones with strict inter-zone rules. Preventing unauthorized self-replication via network segmentation." },
    ],
    aiRmf: [
      { func: "GOVERN", cats: ["GV-1 Policies & Processes", "GV-2 Accountability"], rationale: "Rogue Agent Detection & Response Framework. Signed behavioral manifests declaring expected capabilities." },
      { func: "MAP", cats: ["MP-2 Categorization"], rationale: "Categorizing agent collusion and self-replication as critical risk scenarios requiring specific containment." },
      { func: "MEASURE", cats: ["MS-1 Risk Metrics", "MS-3 Risk Tracking"], rationale: "Behavioral drift detection metrics. Tool-use pattern monitoring against baseline manifests." },
      { func: "MANAGE", cats: ["MG-1 Risk Prioritization", "MG-3 Response & Recovery"], rationale: "Kill-switch SLA testing (quarterly). Automatic quarantine pending forensic review with risk committee reporting." },
    ],
    evidence: "Impersonated observer agent approving fraudulent transactions; Compromised automation agent spawning unauthorized replicas; Reward-hacking DR deletion."
  },
};

export const severityColor: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F59E0B",
  "Medium-High": "#3B82F6",
};
