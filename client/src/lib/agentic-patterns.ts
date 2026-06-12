/**
 * @file agentic-patterns.ts
 * @description Pattern taxonomy for the Architecture Diagram Analyzer.
 * Defines the 12 agentic AI architecture patterns, their visual signatures
 * (consumed by the vision LLM prompt), their OWASP ASI risk mappings, and
 * the "typical" control posture for systems built on each pattern.
 *
 * This is the data layer of the diagram analyzer subsystem. It has no
 * dependencies and is the single source of truth mirrored by db/patterns.json.
 */

export const PATTERN_TAXONOMY_VERSION = "1.0.0";

export type PatternCategory = "agent" | "workflow" | "multi_agent";

export type PatternId =
  | "single_agent"
  | "sequential_pipeline"
  | "supervisor_worker"
  | "swarm_peer"
  | "router_triage"
  | "parallel_sectioning"
  | "reflection_loop"
  | "orchestrator_dynamic"
  | "group_chat"
  | "handoff_chain"
  | "human_in_loop"
  | "tool_augmented";

export interface PatternDefinition {
  id: PatternId;
  name: string;
  category: PatternCategory;
  description: string;
  primaryRisk: string;
  /** Phrases the LLM prompt uses to identify the pattern in diagrams. */
  visualSignatures: string[];
  asiMappings: PatternASIMapping[];
  /** Typical control posture for systems using this pattern. */
  controlStateDefaults: ControlStateDefaults;
}

export interface PatternASIMapping {
  /** OWASP ASI risk ID, e.g. "ASI01". */
  asiId: string;
  /** 0.0–1.0 relevance of the ASI risk to the pattern. */
  weight: number;
  /** One sentence explaining the mapping. */
  rationale: string;
}

export interface ControlStateDefaults {
  has_agent_limits: boolean;
  has_identity_management: boolean;
  has_oversight_design: boolean;
  has_dev_controls: boolean;
  has_testing: boolean;
  has_phased_deployment: boolean;
  has_monitoring: boolean;
}

/**
 * A single pattern detection produced by the vision LLM (or by manual
 * selection). Defined here, in the dependency-free data layer, so that
 * both the pattern evaluator (Phase 2) and the LLM integration (Phase 3)
 * can consume it; diagram-analyzer.ts re-exports it.
 */
export interface LLMPatternMatch {
  patternId: PatternId;
  /** 0.0–1.0, clamped. */
  confidence: number;
  /** Max 200 chars, truncated if longer. */
  reasoning: string;
}

export const AGENTIC_PATTERNS: PatternDefinition[] = [
  {
    id: "single_agent",
    name: "Single Agent",
    category: "agent",
    description:
      "A single LLM-powered agent with tool access operating autonomously. All decision-making concentrated in one entity.",
    primaryRisk: "Concentrated failure point — no redundancy, no peer validation",
    visualSignatures: [
      "Single box labeled 'Agent' or 'LLM' with arrows to multiple tools",
      "One central node connected to databases, APIs, or external services",
      "Star topology with single center and tool/service spokes",
    ],
    asiMappings: [
      { asiId: "ASI01", weight: 0.85, rationale: "Single agent is the primary target for goal hijacking — no peer to detect deviation" },
      { asiId: "ASI02", weight: 0.9, rationale: "All tool access flows through one entity — tool misuse has no checkpoint" },
      { asiId: "ASI05", weight: 0.7, rationale: "Code execution decisions made unilaterally without review" },
      { asiId: "ASI09", weight: 0.75, rationale: "Users interact with single agent — trust calibration has no comparative reference" },
    ],
    controlStateDefaults: {
      has_agent_limits: false,
      has_identity_management: true,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
  {
    id: "sequential_pipeline",
    name: "Sequential Pipeline",
    category: "workflow",
    description:
      "Agents arranged in a linear chain where each agent's output becomes the next agent's input. Errors propagate forward.",
    primaryRisk: "Cascading failure propagation — errors compound through the chain",
    visualSignatures: [
      "Linear chain of boxes connected by arrows flowing left-to-right or top-to-bottom",
      "Pipeline or conveyor belt metaphor with sequential processing stages",
      "Numbered steps (Step 1 → Step 2 → Step 3) with agent labels",
    ],
    asiMappings: [
      { asiId: "ASI06", weight: 0.8, rationale: "Context passed between agents accumulates corruption — memory poisoning propagates forward" },
      { asiId: "ASI07", weight: 0.85, rationale: "Each handoff is an inter-agent communication channel vulnerable to injection" },
      { asiId: "ASI08", weight: 0.95, rationale: "Sequential architecture is the canonical cascading failure topology" },
      { asiId: "ASI10", weight: 0.65, rationale: "A rogue agent mid-chain corrupts all downstream outputs" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: false,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
  {
    id: "supervisor_worker",
    name: "Supervisor-Worker",
    category: "multi_agent",
    description:
      "A supervisor agent delegates tasks to worker agents and aggregates results. Single point of control.",
    primaryRisk: "Single point of control failure — supervisor compromise cascades to all workers",
    visualSignatures: [
      "Tree structure with one node at top connected to multiple nodes below",
      "Hub-and-spoke with labeled 'Supervisor', 'Manager', or 'Orchestrator' at center/top",
      "One-to-many delegation arrows from a controller to worker agents",
    ],
    asiMappings: [
      { asiId: "ASI01", weight: 0.9, rationale: "Hijacking the supervisor redirects all worker agents simultaneously" },
      { asiId: "ASI03", weight: 0.8, rationale: "Supervisor holds elevated privileges — identity compromise grants total access" },
      { asiId: "ASI08", weight: 0.85, rationale: "Supervisor failure cascades to all workers — systemic single point of failure" },
      { asiId: "ASI09", weight: 0.7, rationale: "Humans trust supervisor's aggregated output without verifying individual worker results" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: true,
      has_dev_controls: true,
      has_testing: false,
      has_phased_deployment: false,
      has_monitoring: false,
    },
  },
  {
    id: "swarm_peer",
    name: "Swarm (Peer-to-Peer)",
    category: "multi_agent",
    description:
      "Multiple agents communicate as peers in a mesh network. Emergent behavior arises from collective interaction.",
    primaryRisk: "Emergent behavior and unpredictability — collective dynamics are unauditable",
    visualSignatures: [
      "Mesh or fully-connected graph with bidirectional arrows between all nodes",
      "Hexagonal or circular arrangement of agents with cross-connections",
      "Labels like 'Swarm', 'Mesh', 'P2P', or 'Consensus' with multiple equal-sized nodes",
    ],
    asiMappings: [
      { asiId: "ASI07", weight: 0.95, rationale: "Mesh communication creates maximum inter-agent attack surface" },
      { asiId: "ASI08", weight: 0.9, rationale: "Peer propagation means one compromised agent can infect the entire swarm" },
      { asiId: "ASI10", weight: 0.95, rationale: "Emergent behavior makes rogue detection nearly impossible — no single authority" },
      { asiId: "ASI06", weight: 0.75, rationale: "Shared memory or context pools are vulnerable to poisoning by any peer" },
      { asiId: "ASI09", weight: 0.6, rationale: "Swarm consensus creates false confidence — humans trust collective agreement" },
    ],
    controlStateDefaults: {
      has_agent_limits: false,
      has_identity_management: false,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
  {
    id: "router_triage",
    name: "Router/Triage",
    category: "workflow",
    description:
      "A routing agent classifies incoming requests and dispatches them to specialized handler agents.",
    primaryRisk: "Misclassification sends requests to wrong handler — wrong agent processes sensitive data",
    visualSignatures: [
      "Diamond or decision node with multiple outgoing paths to different agents",
      "Funnel or gateway labeled 'Router', 'Classifier', or 'Triage' with branching outputs",
      "If/else or switch-case visual metaphor with labeled branches",
    ],
    asiMappings: [
      { asiId: "ASI01", weight: 0.8, rationale: "Hijacking the router redirects all traffic to attacker-controlled handlers" },
      { asiId: "ASI03", weight: 0.75, rationale: "Router has access to all request types — privilege boundary is the classification logic" },
      { asiId: "ASI06", weight: 0.65, rationale: "Poisoned classification context causes systematic misrouting" },
      { asiId: "ASI08", weight: 0.6, rationale: "Misrouting creates cascading failures when wrong handler processes incompatible requests" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: true,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: false,
      has_monitoring: false,
    },
  },
  {
    id: "parallel_sectioning",
    name: "Parallel Sectioning",
    category: "workflow",
    description:
      "Work is split into independent parallel tracks processed simultaneously, then merged. Partial failures create inconsistent outputs.",
    primaryRisk: "Partial failure and merge conflicts — inconsistent state when some branches fail",
    visualSignatures: [
      "Fork-join pattern: one node splitting into parallel lanes that reconverge",
      "Parallel horizontal lanes or swim lanes with a merge/join point",
      "Fan-out/fan-in topology with 'Split' and 'Merge' or 'Aggregate' labels",
    ],
    asiMappings: [
      { asiId: "ASI05", weight: 0.7, rationale: "Parallel execution of code across branches increases attack surface for unexpected execution" },
      { asiId: "ASI07", weight: 0.75, rationale: "Merge point must reconcile outputs from multiple channels — injection at merge is high-value" },
      { asiId: "ASI08", weight: 0.8, rationale: "Partial branch failure creates inconsistent merged state — cascading from merge point" },
      { asiId: "ASI02", weight: 0.65, rationale: "Parallel tool invocations multiply misuse risk — N simultaneous tool calls" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: true,
      has_monitoring: false,
    },
  },
  {
    id: "reflection_loop",
    name: "Reflection Loop",
    category: "agent",
    description:
      "An agent iteratively evaluates and refines its own output through self-critique cycles. Risk of infinite loops and self-reinforcing errors.",
    primaryRisk: "Infinite loop and self-reinforcing errors — no external correction signal",
    visualSignatures: [
      "Circular arrow or loop connecting an agent back to itself",
      "Labels like 'Reflect', 'Self-Critique', 'Iterate', or 'Refine' with feedback arrows",
      "Two boxes (Generator + Critic) with bidirectional arrows forming a cycle",
    ],
    asiMappings: [
      { asiId: "ASI06", weight: 0.9, rationale: "Self-referential loops amplify memory corruption — poisoned context reinforces itself" },
      { asiId: "ASI10", weight: 0.8, rationale: "Reflection without external grounding enables gradual drift toward rogue behavior" },
      { asiId: "ASI09", weight: 0.75, rationale: "Self-reported confidence from reflection creates false assurance — automation bias amplified" },
      { asiId: "ASI01", weight: 0.65, rationale: "Goal drift through iterative refinement — original intent erodes over cycles" },
    ],
    controlStateDefaults: {
      has_agent_limits: false,
      has_identity_management: true,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: false,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
  {
    id: "orchestrator_dynamic",
    name: "Dynamic Orchestrator",
    category: "multi_agent",
    description:
      "An orchestrator dynamically creates, assigns, and terminates sub-agents based on runtime conditions. Unbounded delegation.",
    primaryRisk: "Unbounded delegation and goal drift — orchestrator spawns agents without predefined limits",
    visualSignatures: [
      "Central node with dashed or dynamic connections to variable-count sub-nodes",
      "Labels like 'Orchestrator', 'Planner', or 'Coordinator' with 'spawn', 'create', or 'delegate' arrows",
      "Variable-size cluster of agents with a controller that can add/remove members",
    ],
    asiMappings: [
      { asiId: "ASI01", weight: 0.85, rationale: "Dynamic orchestrator can be hijacked to spawn malicious sub-agents" },
      { asiId: "ASI02", weight: 0.8, rationale: "Dynamically spawned agents inherit tool access without per-agent review" },
      { asiId: "ASI03", weight: 0.9, rationale: "Privilege escalation via spawning agents with elevated permissions" },
      { asiId: "ASI05", weight: 0.75, rationale: "Dynamic code generation for new agents enables unexpected execution" },
      { asiId: "ASI08", weight: 0.85, rationale: "Unbounded spawning creates resource exhaustion cascades" },
      { asiId: "ASI10", weight: 0.8, rationale: "Spawned agents may deviate from orchestrator intent — rogue by delegation" },
    ],
    controlStateDefaults: {
      has_agent_limits: false,
      has_identity_management: false,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: false,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
  {
    id: "group_chat",
    name: "Group Chat/Debate",
    category: "multi_agent",
    description:
      "Multiple agents engage in structured debate or discussion to reach consensus. Vulnerable to persuasion attacks and deadlock.",
    primaryRisk: "Consensus deadlock and persuasion attacks — one eloquent agent can dominate group decisions",
    visualSignatures: [
      "Multiple agents arranged around a shared space (chat room, forum, or table metaphor)",
      "Bidirectional arrows between all participants with a shared message bus or channel",
      "Labels like 'Debate', 'Discussion', 'Consensus', 'Vote', or 'Chat' with multiple participants",
    ],
    asiMappings: [
      { asiId: "ASI01", weight: 0.75, rationale: "A persuasive agent can hijack group consensus toward attacker goals" },
      { asiId: "ASI07", weight: 0.85, rationale: "Shared communication channel is the primary attack surface — all messages visible to all" },
      { asiId: "ASI09", weight: 0.8, rationale: "Group consensus creates amplified automation bias — 'the group agreed' fallacy" },
      { asiId: "ASI10", weight: 0.7, rationale: "Rogue agent in debate can systematically steer outcomes while appearing collaborative" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: true,
      has_dev_controls: true,
      has_testing: false,
      has_phased_deployment: false,
      has_monitoring: false,
    },
  },
  {
    id: "handoff_chain",
    name: "Handoff Chain",
    category: "workflow",
    description:
      "Agents transfer full control to the next agent in sequence. Context and authority pass entirely — no shared state, no backtracking.",
    primaryRisk: "Context loss and privilege escalation — each handoff is a trust boundary crossing",
    visualSignatures: [
      "Linear sequence with 'handoff', 'transfer', or 'pass' labels on arrows",
      "Agents with clear entry/exit points and no return arrows",
      "Baton-pass or relay metaphor with distinct agent boundaries",
    ],
    asiMappings: [
      { asiId: "ASI03", weight: 0.9, rationale: "Each handoff crosses a privilege boundary — escalation via accumulated context" },
      { asiId: "ASI06", weight: 0.85, rationale: "Context transferred at handoff can be poisoned — receiving agent trusts inherited state" },
      { asiId: "ASI07", weight: 0.8, rationale: "Handoff channel is a high-value interception point — full context in transit" },
      { asiId: "ASI08", weight: 0.7, rationale: "Failure at any handoff point breaks the entire chain — no recovery path" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: false,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: false,
      has_monitoring: false,
    },
  },
  {
    id: "human_in_loop",
    name: "Human-in-the-Loop",
    category: "agent",
    description:
      "Agent actions require human approval at defined checkpoints. Risk of approval fatigue leading to rubber-stamping.",
    primaryRisk: "Approval fatigue and override bypass — humans stop reviewing after repeated approvals",
    visualSignatures: [
      "Agent box connected to a human icon or 'Approval' gate with yes/no paths",
      "Checkpoint or gate symbol between agent actions with human review step",
      "Labels like 'HITL', 'Human Review', 'Approve/Reject', or 'Manual Gate'",
    ],
    asiMappings: [
      { asiId: "ASI09", weight: 0.95, rationale: "HITL is the canonical automation bias scenario — humans defer to agent recommendations" },
      { asiId: "ASI01", weight: 0.6, rationale: "Goal hijack that produces plausible-looking outputs bypasses fatigued human reviewers" },
      { asiId: "ASI10", weight: 0.65, rationale: "Rogue behavior masked as normal requests passes through rubber-stamp approval" },
    ],
    controlStateDefaults: {
      has_agent_limits: true,
      has_identity_management: true,
      has_oversight_design: true,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: true,
      has_monitoring: true,
    },
  },
  {
    id: "tool_augmented",
    name: "Tool-Augmented Agent",
    category: "agent",
    description:
      "An agent with access to external tools (code execution, web browsing, file system, APIs). Tool outputs become agent inputs.",
    primaryRisk: "Tool misuse and injection via output — agent trusts tool responses without validation",
    visualSignatures: [
      "Agent connected to multiple tool icons (wrench, terminal, globe, database)",
      "Function-calling or tool-use arrows with labeled tool names",
      "Agent with 'Tools' sidebar or palette showing available capabilities",
    ],
    asiMappings: [
      { asiId: "ASI02", weight: 0.95, rationale: "Tool-augmented agent is the canonical tool misuse scenario — direct tool access" },
      { asiId: "ASI04", weight: 0.75, rationale: "Third-party tools are supply chain dependencies — compromised tool compromises agent" },
      { asiId: "ASI05", weight: 0.9, rationale: "Code execution tool enables arbitrary code — the primary unexpected execution vector" },
      { asiId: "ASI01", weight: 0.7, rationale: "Tool outputs can inject instructions that hijack agent goals (indirect prompt injection)" },
    ],
    controlStateDefaults: {
      has_agent_limits: false,
      has_identity_management: true,
      has_oversight_design: false,
      has_dev_controls: true,
      has_testing: true,
      has_phased_deployment: false,
      has_monitoring: true,
    },
  },
];

export function getPatternById(id: PatternId): PatternDefinition | undefined {
  return AGENTIC_PATTERNS.find((p) => p.id === id);
}

export function getPatternsByCategory(cat: PatternCategory): PatternDefinition[] {
  return AGENTIC_PATTERNS.filter((p) => p.category === cat);
}
