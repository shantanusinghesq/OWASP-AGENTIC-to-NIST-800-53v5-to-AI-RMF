# Technical Requirements Document: Architecture Diagram Analyzer

**Document type:** Technical Requirements Document (TRD) for Long-Horizon Agentic Coding AI  
**Version:** 1.0.0  
**Date:** 2026-06-10  
**Upstream:** PRD-ALIGNMENT-DOCUMENT.md (2026-06-10)  
**Target executor:** Autonomous coding agent with multi-file write, TypeScript compilation, browser testing, and git capabilities  
**Project path:** `/home/ubuntu/vibe-security-app`  
**Framework:** React 19 + Vite + Tailwind 4 + shadcn/ui (web-static, no backend)

---

## 0. Execution Protocol

This document is structured for sequential phase execution. Each phase is self-contained and produces testable output. The agent MUST:

1. Execute phases in order (Phase 1 → Phase 7).
2. Run `npx tsc --noEmit` after each phase. Zero errors required before advancing.
3. Never modify files listed in Section 0.2 (Immutable Files).
4. Produce output that conforms exactly to the interfaces defined in Section 2.
5. Use ONLY the file paths specified in Section 1.

### 0.1 New Files to Create

| # | Path (relative to project root) | Purpose |
|---|---|---|
| 1 | `client/src/lib/agentic-patterns.ts` | 12 pattern definitions + visual signatures + ASI mappings |
| 2 | `client/src/lib/pattern-evaluator.ts` | Patterns → ScenarioResult converter |
| 3 | `client/src/lib/diagram-analyzer.ts` | LLM integration (Forge API vision call + response validation) |
| 4 | `client/src/components/DiagramAnalyzer.tsx` | Sidebar UI component (upload, progress, results, manual override) |
| 5 | `client/src/lib/diagram-history.ts` | localStorage persistence for last 5 analyses |

### 0.2 Immutable Files (DO NOT MODIFY)

These files must not be changed. The diagram analyzer subsystem integrates with them via their existing public APIs only.

```
client/src/lib/scrambler-types.ts
client/src/lib/scrambler-evaluator.ts
client/src/lib/scrambler-generator.ts
client/src/lib/scrambler-mappings.ts
client/src/lib/scrambler-bias-model.ts
client/src/lib/scrambler-narrative.ts
client/src/lib/scrambler-preview.ts
client/src/lib/scrambler-info-content.ts
client/src/lib/scrambler-contrast.ts
client/src/components/CascadeGraph.tsx
client/src/components/AnalysisPanel.tsx
client/src/components/ScenarioComparison.tsx
```

### 0.3 Files to Modify (Minimal Integration)

| File | Change |
|---|---|
| `client/src/contexts/ScenarioContext.tsx` | Add `resultSource` field to `ScenarioSnapshot` interface |
| `client/src/pages/ScenarioSimulator.tsx` | Add sidebar trigger button + render `DiagramAnalyzer` |

### 0.4 Validation Gate (Phase 3)

Before implementing Phase 3 (LLM integration), the agent MUST send a test request to the Forge API with an image payload. If the API returns a 4xx error indicating vision/multimodal is unsupported, the agent MUST:
- Set `VISION_AVAILABLE = false` in `diagram-analyzer.ts`
- Skip the LLM call path entirely
- Default to manual-selection-only mode
- Log the decision: `console.info("[DiagramAnalyzer] Vision API unavailable. Manual selection mode active.")`

---

## 1. Type Definitions

### 1.1 Pattern Definition Schema

```typescript
// File: client/src/lib/agentic-patterns.ts

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
  visualSignatures: string[];  // Used in LLM prompt to describe what to look for
  asiMappings: PatternASIMapping[];
  controlStateDefaults: ControlStateDefaults;
}

export interface PatternASIMapping {
  asiId: string;       // e.g., "ASI01"
  weight: number;      // 0.0–1.0
  rationale: string;   // One sentence explaining the mapping
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
```

### 1.2 Analysis Result Schema

```typescript
// File: client/src/lib/diagram-analyzer.ts

export interface DiagramAnalysisRequest {
  imageBase64: string;       // Base64-encoded image (resized to max 1024x1024)
  mimeType: "image/png" | "image/jpeg" | "image/webp";
}

export interface LLMPatternMatch {
  patternId: PatternId;
  confidence: number;        // 0.0–1.0, clamped
  reasoning: string;         // Max 200 chars, truncated if longer
}

export interface DiagramAnalysisResult {
  id: string;                // crypto.randomUUID()
  timestamp: number;         // Date.now()
  matches: LLMPatternMatch[];
  taxonomyVersion: string;   // PATTERN_TAXONOMY_VERSION at time of analysis
  source: "vision" | "manual";
  thumbnailDataUrl: string;  // 100x100 JPEG data URL for history
}
```

### 1.3 ScenarioSnapshot Extension

```typescript
// File: client/src/contexts/ScenarioContext.tsx (MODIFY)
// Add ONE field to the existing ScenarioSnapshot interface:

export interface ScenarioSnapshot {
  id: string;
  timestamp: number;
  factPattern: FactPattern;
  result: ScenarioResult;
  biasData: BiasDataPoint[];
  label: string;
  resultSource?: "scrambler" | "diagram";  // NEW FIELD — optional, defaults to "scrambler"
}
```

### 1.4 Pattern Evaluator Output Contract

```typescript
// File: client/src/lib/pattern-evaluator.ts

export interface PatternEvaluationInput {
  matches: LLMPatternMatch[];          // From DiagramAnalysisResult
  governancePosture: GovernancePosture; // User-selectable: "Minimal" | "Standard" | "Full"
}

export interface PatternEvaluationOutput {
  factPattern: FactPattern;
  result: ScenarioResult;
  biasData: BiasDataPoint[];
  label: string;
}
```

---

## 2. Phase 1: Pattern Data Layer

**File to create:** `client/src/lib/agentic-patterns.ts`  
**Estimated lines:** 350–450  
**Dependencies:** None  
**Test:** `npx tsc --noEmit` passes; all 12 patterns have 2–8 ASI mappings each.

### 2.1 Requirements

The file MUST export:

```typescript
export const PATTERN_TAXONOMY_VERSION: string;
export const AGENTIC_PATTERNS: PatternDefinition[];
export function getPatternById(id: PatternId): PatternDefinition | undefined;
export function getPatternsByCategory(cat: PatternCategory): PatternDefinition[];
```

### 2.2 Pattern Definitions (Complete Specification)

Each pattern below MUST be implemented exactly as specified. The `visualSignatures` array contains phrases the LLM prompt uses to identify the pattern in diagrams. The `controlStateDefaults` represents the "typical" control posture for systems using this pattern (used when generating the `FactPattern`).

#### Pattern 1: `single_agent`

```
name: "Single Agent"
category: "agent"
description: "A single LLM-powered agent with tool access operating autonomously. All decision-making concentrated in one entity."
primaryRisk: "Concentrated failure point — no redundancy, no peer validation"
visualSignatures: [
  "Single box labeled 'Agent' or 'LLM' with arrows to multiple tools",
  "One central node connected to databases, APIs, or external services",
  "Star topology with single center and tool/service spokes"
]
asiMappings: [
  { asiId: "ASI01", weight: 0.85, rationale: "Single agent is the primary target for goal hijacking — no peer to detect deviation" },
  { asiId: "ASI02", weight: 0.90, rationale: "All tool access flows through one entity — tool misuse has no checkpoint" },
  { asiId: "ASI05", weight: 0.70, rationale: "Code execution decisions made unilaterally without review" },
  { asiId: "ASI09", weight: 0.75, rationale: "Users interact with single agent — trust calibration has no comparative reference" }
]
controlStateDefaults: {
  has_agent_limits: false,
  has_identity_management: true,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: false,
  has_monitoring: true
}
```

#### Pattern 2: `sequential_pipeline`

```
name: "Sequential Pipeline"
category: "workflow"
description: "Agents arranged in a linear chain where each agent's output becomes the next agent's input. Errors propagate forward."
primaryRisk: "Cascading failure propagation — errors compound through the chain"
visualSignatures: [
  "Linear chain of boxes connected by arrows flowing left-to-right or top-to-bottom",
  "Pipeline or conveyor belt metaphor with sequential processing stages",
  "Numbered steps (Step 1 → Step 2 → Step 3) with agent labels"
]
asiMappings: [
  { asiId: "ASI06", weight: 0.80, rationale: "Context passed between agents accumulates corruption — memory poisoning propagates forward" },
  { asiId: "ASI07", weight: 0.85, rationale: "Each handoff is an inter-agent communication channel vulnerable to injection" },
  { asiId: "ASI08", weight: 0.95, rationale: "Sequential architecture is the canonical cascading failure topology" },
  { asiId: "ASI10", weight: 0.65, rationale: "A rogue agent mid-chain corrupts all downstream outputs" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: false,
  has_phased_deployment: false,
  has_monitoring: true
}
```

#### Pattern 3: `supervisor_worker`

```
name: "Supervisor-Worker"
category: "multi_agent"
description: "A supervisor agent delegates tasks to worker agents and aggregates results. Single point of control."
primaryRisk: "Single point of control failure — supervisor compromise cascades to all workers"
visualSignatures: [
  "Tree structure with one node at top connected to multiple nodes below",
  "Hub-and-spoke with labeled 'Supervisor', 'Manager', or 'Orchestrator' at center/top",
  "One-to-many delegation arrows from a controller to worker agents"
]
asiMappings: [
  { asiId: "ASI01", weight: 0.90, rationale: "Hijacking the supervisor redirects all worker agents simultaneously" },
  { asiId: "ASI03", weight: 0.80, rationale: "Supervisor holds elevated privileges — identity compromise grants total access" },
  { asiId: "ASI08", weight: 0.85, rationale: "Supervisor failure cascades to all workers — systemic single point of failure" },
  { asiId: "ASI09", weight: 0.70, rationale: "Humans trust supervisor's aggregated output without verifying individual worker results" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: true,
  has_dev_controls: true,
  has_testing: false,
  has_phased_deployment: false,
  has_monitoring: false
}
```

#### Pattern 4: `swarm_peer`

```
name: "Swarm (Peer-to-Peer)"
category: "multi_agent"
description: "Multiple agents communicate as peers in a mesh network. Emergent behavior arises from collective interaction."
primaryRisk: "Emergent behavior and unpredictability — collective dynamics are unauditable"
visualSignatures: [
  "Mesh or fully-connected graph with bidirectional arrows between all nodes",
  "Hexagonal or circular arrangement of agents with cross-connections",
  "Labels like 'Swarm', 'Mesh', 'P2P', or 'Consensus' with multiple equal-sized nodes"
]
asiMappings: [
  { asiId: "ASI07", weight: 0.95, rationale: "Mesh communication creates maximum inter-agent attack surface" },
  { asiId: "ASI08", weight: 0.90, rationale: "Peer propagation means one compromised agent can infect the entire swarm" },
  { asiId: "ASI10", weight: 0.95, rationale: "Emergent behavior makes rogue detection nearly impossible — no single authority" },
  { asiId: "ASI06", weight: 0.75, rationale: "Shared memory or context pools are vulnerable to poisoning by any peer" },
  { asiId: "ASI09", weight: 0.60, rationale: "Swarm consensus creates false confidence — humans trust collective agreement" }
]
controlStateDefaults: {
  has_agent_limits: false,
  has_identity_management: false,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: false,
  has_monitoring: true
}
```

#### Pattern 5: `router_triage`

```
name: "Router/Triage"
category: "workflow"
description: "A routing agent classifies incoming requests and dispatches them to specialized handler agents."
primaryRisk: "Misclassification sends requests to wrong handler — wrong agent processes sensitive data"
visualSignatures: [
  "Diamond or decision node with multiple outgoing paths to different agents",
  "Funnel or gateway labeled 'Router', 'Classifier', or 'Triage' with branching outputs",
  "If/else or switch-case visual metaphor with labeled branches"
]
asiMappings: [
  { asiId: "ASI01", weight: 0.80, rationale: "Hijacking the router redirects all traffic to attacker-controlled handlers" },
  { asiId: "ASI03", weight: 0.75, rationale: "Router has access to all request types — privilege boundary is the classification logic" },
  { asiId: "ASI06", weight: 0.65, rationale: "Poisoned classification context causes systematic misrouting" },
  { asiId: "ASI08", weight: 0.60, rationale: "Misrouting creates cascading failures when wrong handler processes incompatible requests" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: true,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: false,
  has_monitoring: false
}
```

#### Pattern 6: `parallel_sectioning`

```
name: "Parallel Sectioning"
category: "workflow"
description: "Work is split into independent parallel tracks processed simultaneously, then merged. Partial failures create inconsistent outputs."
primaryRisk: "Partial failure and merge conflicts — inconsistent state when some branches fail"
visualSignatures: [
  "Fork-join pattern: one node splitting into parallel lanes that reconverge",
  "Parallel horizontal lanes or swim lanes with a merge/join point",
  "Fan-out/fan-in topology with 'Split' and 'Merge' or 'Aggregate' labels"
]
asiMappings: [
  { asiId: "ASI05", weight: 0.70, rationale: "Parallel execution of code across branches increases attack surface for unexpected execution" },
  { asiId: "ASI07", weight: 0.75, rationale: "Merge point must reconcile outputs from multiple channels — injection at merge is high-value" },
  { asiId: "ASI08", weight: 0.80, rationale: "Partial branch failure creates inconsistent merged state — cascading from merge point" },
  { asiId: "ASI02", weight: 0.65, rationale: "Parallel tool invocations multiply misuse risk — N simultaneous tool calls" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: true,
  has_monitoring: false
}
```

#### Pattern 7: `reflection_loop`

```
name: "Reflection Loop"
category: "agent"
description: "An agent iteratively evaluates and refines its own output through self-critique cycles. Risk of infinite loops and self-reinforcing errors."
primaryRisk: "Infinite loop and self-reinforcing errors — no external correction signal"
visualSignatures: [
  "Circular arrow or loop connecting an agent back to itself",
  "Labels like 'Reflect', 'Self-Critique', 'Iterate', or 'Refine' with feedback arrows",
  "Two boxes (Generator + Critic) with bidirectional arrows forming a cycle"
]
asiMappings: [
  { asiId: "ASI06", weight: 0.90, rationale: "Self-referential loops amplify memory corruption — poisoned context reinforces itself" },
  { asiId: "ASI10", weight: 0.80, rationale: "Reflection without external grounding enables gradual drift toward rogue behavior" },
  { asiId: "ASI09", weight: 0.75, rationale: "Self-reported confidence from reflection creates false assurance — automation bias amplified" },
  { asiId: "ASI01", weight: 0.65, rationale: "Goal drift through iterative refinement — original intent erodes over cycles" }
]
controlStateDefaults: {
  has_agent_limits: false,
  has_identity_management: true,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: false,
  has_phased_deployment: false,
  has_monitoring: true
}
```

#### Pattern 8: `orchestrator_dynamic`

```
name: "Dynamic Orchestrator"
category: "multi_agent"
description: "An orchestrator dynamically creates, assigns, and terminates sub-agents based on runtime conditions. Unbounded delegation."
primaryRisk: "Unbounded delegation and goal drift — orchestrator spawns agents without predefined limits"
visualSignatures: [
  "Central node with dashed or dynamic connections to variable-count sub-nodes",
  "Labels like 'Orchestrator', 'Planner', or 'Coordinator' with 'spawn', 'create', or 'delegate' arrows",
  "Variable-size cluster of agents with a controller that can add/remove members"
]
asiMappings: [
  { asiId: "ASI01", weight: 0.85, rationale: "Dynamic orchestrator can be hijacked to spawn malicious sub-agents" },
  { asiId: "ASI02", weight: 0.80, rationale: "Dynamically spawned agents inherit tool access without per-agent review" },
  { asiId: "ASI03", weight: 0.90, rationale: "Privilege escalation via spawning agents with elevated permissions" },
  { asiId: "ASI05", weight: 0.75, rationale: "Dynamic code generation for new agents enables unexpected execution" },
  { asiId: "ASI08", weight: 0.85, rationale: "Unbounded spawning creates resource exhaustion cascades" },
  { asiId: "ASI10", weight: 0.80, rationale: "Spawned agents may deviate from orchestrator intent — rogue by delegation" }
]
controlStateDefaults: {
  has_agent_limits: false,
  has_identity_management: false,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: false,
  has_phased_deployment: false,
  has_monitoring: true
}
```

#### Pattern 9: `group_chat`

```
name: "Group Chat/Debate"
category: "multi_agent"
description: "Multiple agents engage in structured debate or discussion to reach consensus. Vulnerable to persuasion attacks and deadlock."
primaryRisk: "Consensus deadlock and persuasion attacks — one eloquent agent can dominate group decisions"
visualSignatures: [
  "Multiple agents arranged around a shared space (chat room, forum, or table metaphor)",
  "Bidirectional arrows between all participants with a shared message bus or channel",
  "Labels like 'Debate', 'Discussion', 'Consensus', 'Vote', or 'Chat' with multiple participants"
]
asiMappings: [
  { asiId: "ASI01", weight: 0.75, rationale: "A persuasive agent can hijack group consensus toward attacker goals" },
  { asiId: "ASI07", weight: 0.85, rationale: "Shared communication channel is the primary attack surface — all messages visible to all" },
  { asiId: "ASI09", weight: 0.80, rationale: "Group consensus creates amplified automation bias — 'the group agreed' fallacy" },
  { asiId: "ASI10", weight: 0.70, rationale: "Rogue agent in debate can systematically steer outcomes while appearing collaborative" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: true,
  has_dev_controls: true,
  has_testing: false,
  has_phased_deployment: false,
  has_monitoring: false
}
```

#### Pattern 10: `handoff_chain`

```
name: "Handoff Chain"
category: "workflow"
description: "Agents transfer full control to the next agent in sequence. Context and authority pass entirely — no shared state, no backtracking."
primaryRisk: "Context loss and privilege escalation — each handoff is a trust boundary crossing"
visualSignatures: [
  "Linear sequence with 'handoff', 'transfer', or 'pass' labels on arrows",
  "Agents with clear entry/exit points and no return arrows",
  "Baton-pass or relay metaphor with distinct agent boundaries"
]
asiMappings: [
  { asiId: "ASI03", weight: 0.90, rationale: "Each handoff crosses a privilege boundary — escalation via accumulated context" },
  { asiId: "ASI06", weight: 0.85, rationale: "Context transferred at handoff can be poisoned — receiving agent trusts inherited state" },
  { asiId: "ASI07", weight: 0.80, rationale: "Handoff channel is a high-value interception point — full context in transit" },
  { asiId: "ASI08", weight: 0.70, rationale: "Failure at any handoff point breaks the entire chain — no recovery path" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: false,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: false,
  has_monitoring: false
}
```

#### Pattern 11: `human_in_loop`

```
name: "Human-in-the-Loop"
category: "agent"
description: "Agent actions require human approval at defined checkpoints. Risk of approval fatigue leading to rubber-stamping."
primaryRisk: "Approval fatigue and override bypass — humans stop reviewing after repeated approvals"
visualSignatures: [
  "Agent box connected to a human icon or 'Approval' gate with yes/no paths",
  "Checkpoint or gate symbol between agent actions with human review step",
  "Labels like 'HITL', 'Human Review', 'Approve/Reject', or 'Manual Gate'"
]
asiMappings: [
  { asiId: "ASI09", weight: 0.95, rationale: "HITL is the canonical automation bias scenario — humans defer to agent recommendations" },
  { asiId: "ASI01", weight: 0.60, rationale: "Goal hijack that produces plausible-looking outputs bypasses fatigued human reviewers" },
  { asiId: "ASI10", weight: 0.65, rationale: "Rogue behavior masked as normal requests passes through rubber-stamp approval" }
]
controlStateDefaults: {
  has_agent_limits: true,
  has_identity_management: true,
  has_oversight_design: true,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: true,
  has_monitoring: true
}
```

#### Pattern 12: `tool_augmented`

```
name: "Tool-Augmented Agent"
category: "agent"
description: "An agent with access to external tools (code execution, web browsing, file system, APIs). Tool outputs become agent inputs."
primaryRisk: "Tool misuse and injection via output — agent trusts tool responses without validation"
visualSignatures: [
  "Agent connected to multiple tool icons (wrench, terminal, globe, database)",
  "Function-calling or tool-use arrows with labeled tool names",
  "Agent with 'Tools' sidebar or palette showing available capabilities"
]
asiMappings: [
  { asiId: "ASI02", weight: 0.95, rationale: "Tool-augmented agent is the canonical tool misuse scenario — direct tool access" },
  { asiId: "ASI04", weight: 0.75, rationale: "Third-party tools are supply chain dependencies — compromised tool compromises agent" },
  { asiId: "ASI05", weight: 0.90, rationale: "Code execution tool enables arbitrary code — the primary unexpected execution vector" },
  { asiId: "ASI01", weight: 0.70, rationale: "Tool outputs can inject instructions that hijack agent goals (indirect prompt injection)" }
]
controlStateDefaults: {
  has_agent_limits: false,
  has_identity_management: true,
  has_oversight_design: false,
  has_dev_controls: true,
  has_testing: true,
  has_phased_deployment: false,
  has_monitoring: true
}
```

---

## 3. Phase 2: Pattern Evaluator

**File to create:** `client/src/lib/pattern-evaluator.ts`  
**Estimated lines:** 120–160  
**Dependencies:** Phase 1 (`agentic-patterns.ts`), existing types from `scrambler-types.ts`  
**Test:** `npx tsc --noEmit` passes; calling `evaluatePatterns()` with a single-pattern input returns a valid `ScenarioResult`.

### 3.1 Algorithm

The pattern evaluator converts detected patterns into a `ScenarioResult` compatible with the existing renderer. It does NOT import from `scrambler-evaluator.ts`. It is a parallel evaluation engine.

```typescript
// File: client/src/lib/pattern-evaluator.ts

import type { FactPattern, ScenarioResult, ControlEvaluation, CheckpointResult, GovernancePosture } from "./scrambler-types";
import type { BiasDataPoint } from "./scrambler-bias-model";
import { AGENTIC_PATTERNS, getPatternById, type PatternId, type LLMPatternMatch } from "./agentic-patterns";
import { CONTROL_STATE_TO_FAMILIES, FAMILY_TO_PRIMARY_BOOLEAN } from "./scrambler-mappings";
import { OWASP_ASI, NIST_800_53 } from "./data";

export function evaluatePatterns(input: PatternEvaluationInput): PatternEvaluationOutput {
  // Step 1: Determine composite control state
  // Step 2: Map to FactPattern
  // Step 3: Evaluate each ASI × Family cell
  // Step 4: Generate bias curve
  // Step 5: Return ScenarioResult
}
```

### 3.2 Step 1: Composite Control State

For multiple detected patterns, compute the **intersection** (AND) of all patterns' `controlStateDefaults`. If a control is `false` in ANY detected pattern, it is `false` in the composite. This models the "weakest link" principle.

Then apply governance posture adjustment:
- `"Minimal"`: Set 5 of 7 controls to `false` (keep only the 2 that are `true` in the most patterns)
- `"Standard"`: Use the computed intersection as-is
- `"Full"`: Set all 7 controls to `true`

### 3.3 Step 2: Map to FactPattern

```typescript
const factPattern: FactPattern = {
  risk_category: determineDominantRiskCategory(matches),  // See 3.3.1
  agent_archetype: mapToArchetype(matches),               // See 3.3.2
  control_state: compositeControlState,
  impact_profile: {
    domain_error_tolerance: "Low",
    data_sensitivity: "Confidential",
    external_access: "External",
    action_scope: "ReadWrite",
    reversibility: "Irreversible",
  },
  likelihood_profile: {
    autonomy: "High",
    task_complexity: "Complex",
    external_exposure: "High",
  },
};
```

#### 3.3.1 `determineDominantRiskCategory`

Compute the weighted sum of ASI mappings across all detected patterns. Map the highest-weighted ASI to its IMDA risk category using this lookup:

```typescript
const ASI_TO_RISK_CATEGORY: Record<string, FactPattern["risk_category"]> = {
  ASI01: "Unauthorised",
  ASI02: "Disruption",
  ASI03: "Unauthorised",
  ASI04: "DataBreach",
  ASI05: "Disruption",
  ASI06: "Erroneous",
  ASI07: "DataBreach",
  ASI08: "Disruption",
  ASI09: "Biased",
  ASI10: "Disruption",
};
```

#### 3.3.2 `mapToArchetype`

Map the highest-confidence detected pattern to one of the existing 4 archetypes for cascade graph compatibility:

```typescript
const PATTERN_TO_ARCHETYPE: Record<PatternId, FactPattern["agent_archetype"]> = {
  single_agent: "Single",
  sequential_pipeline: "Sequential",
  supervisor_worker: "Supervisor",
  swarm_peer: "Swarm",
  router_triage: "Sequential",
  parallel_sectioning: "Sequential",
  reflection_loop: "Single",
  orchestrator_dynamic: "Supervisor",
  group_chat: "Swarm",
  handoff_chain: "Sequential",
  human_in_loop: "Single",
  tool_augmented: "Single",
};
```

### 3.4 Step 3: Evaluate Cells

For each ASI risk and each NIST family, determine the cell state:

```typescript
function getCellStateForPattern(
  asiId: string,
  familyId: string,
  matches: LLMPatternMatch[],
  controlState: FactPattern["control_state"]
): CellState {
  // 1. Check if ANY detected pattern maps to this ASI
  const maxWeight = getMaxASIWeight(asiId, matches);
  if (maxWeight === 0) return "irrelevant";

  // 2. Check if the control governing this family is present
  const governingBoolean = FAMILY_TO_PRIMARY_BOOLEAN[familyId];
  if (!governingBoolean) return "irrelevant";

  const controlPresent = controlState[governingBoolean as keyof typeof controlState];
  return controlPresent ? "active" : "broken";
}
```

`getMaxASIWeight`: For each detected pattern, look up its `asiMappings` for the given `asiId`. Return the maximum `weight * confidence` across all detected patterns. If no pattern maps to this ASI, return 0.

### 3.5 Step 4: Generate Bias Curve

Import and call `generateBiasCurve` from `scrambler-bias-model.ts` with the computed `FactPattern`. This function is already designed to accept any valid `FactPattern`.

### 3.6 Step 5: Assemble Output

```typescript
return {
  factPattern,
  result: {
    failure_injected: true,
    controls_evaluated: controlEvaluations,
    outcome: `Architecture analysis: ${matches.length} pattern(s) detected. ${brokenCount} control gaps identified across ${affectedFamilies} NIST families.`,
    checkpoint_results: generateCheckpoints(matches, controlState),
    cascade_path: generateCascadePath(factPattern.agent_archetype, brokenFamilies),
  },
  biasData,
  label: `Diagram: ${matches.map(m => getPatternById(m.patternId)?.name).join(" + ")}`,
};
```

---

## 4. Phase 3: LLM Integration

**File to create:** `client/src/lib/diagram-analyzer.ts`  
**Estimated lines:** 150–200  
**Dependencies:** Phase 1 (`agentic-patterns.ts`)  
**Validation gate:** Test Forge API vision support BEFORE full implementation.  
**Test:** `npx tsc --noEmit` passes; manual invocation with a test image returns valid `DiagramAnalysisResult`.

### 4.1 Forge API Integration

```typescript
const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_API_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const VISION_ENDPOINT = `${FORGE_API_URL}/v1/chat/completions`;
```

### 4.2 Request Format

```typescript
async function analyzeWithVision(request: DiagramAnalysisRequest): Promise<LLMPatternMatch[]> {
  const response = await fetch(VISION_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${FORGE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gemini-2.0-flash",  // or "gpt-4o" — use whichever is available
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${request.mimeType};base64,${request.imageBase64}`,
              },
            },
            {
              type: "text",
              text: "Analyze this architecture diagram. Identify which agentic AI patterns are present. Return ONLY valid JSON.",
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status}`);
  }

  const data = await response.json();
  return validateAndParseResponse(data);
}
```

### 4.3 System Prompt

```typescript
const SYSTEM_PROMPT = `You are an expert in agentic AI architecture patterns. Analyze the provided architecture diagram and identify which of the following 12 patterns are present.

PATTERNS:
${AGENTIC_PATTERNS.map(p => `- ${p.id}: ${p.name} — ${p.description}. Visual signatures: ${p.visualSignatures.join("; ")}`).join("\n")}

RESPONSE FORMAT (strict JSON):
{
  "patterns": [
    {
      "patternId": "<one of the 12 pattern IDs above>",
      "confidence": <number between 0.0 and 1.0>,
      "reasoning": "<one sentence explaining why this pattern was detected>"
    }
  ]
}

RULES:
1. Only return patterns you are confident are present (confidence >= 0.3)
2. A diagram may contain multiple patterns (e.g., supervisor_worker + tool_augmented)
3. If the image is not an agentic AI architecture diagram, return {"patterns": []}
4. patternId MUST be one of the 12 exact IDs listed above
5. confidence MUST be a number between 0.0 and 1.0
6. reasoning MUST be a single sentence, max 200 characters`;
```

### 4.4 Response Validation

```typescript
const VALID_PATTERN_IDS = new Set<string>(AGENTIC_PATTERNS.map(p => p.id));

function validateAndParseResponse(data: any): LLMPatternMatch[] {
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return [];

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed?.patterns)) return [];

  return parsed.patterns
    .filter((p: any) =>
      typeof p.patternId === "string" &&
      VALID_PATTERN_IDS.has(p.patternId) &&
      typeof p.confidence === "number"
    )
    .map((p: any) => ({
      patternId: p.patternId as PatternId,
      confidence: Math.max(0, Math.min(1, p.confidence)),
      reasoning: typeof p.reasoning === "string" ? p.reasoning.slice(0, 200) : "",
    }))
    .sort((a: LLMPatternMatch, b: LLMPatternMatch) => b.confidence - a.confidence);
}
```

### 4.5 Error Handling

```typescript
export async function analyzeDiagram(request: DiagramAnalysisRequest): Promise<DiagramAnalysisResult> {
  const id = crypto.randomUUID();
  const timestamp = Date.now();

  let matches: LLMPatternMatch[] = [];
  let source: "vision" | "manual" = "manual";

  if (FORGE_API_KEY) {
    try {
      const controller = new AbortController();
      const timeout1 = setTimeout(() => controller.abort(), 15000); // 15s first attempt

      try {
        matches = await analyzeWithVision(request);
        source = "vision";
      } catch (firstError) {
        clearTimeout(timeout1);
        // Retry once with 20s timeout after 2s backoff
        await new Promise(r => setTimeout(r, 2000));
        const timeout2 = setTimeout(() => controller.abort(), 20000);
        try {
          matches = await analyzeWithVision(request);
          source = "vision";
        } catch {
          // Fall through to manual mode
          source = "manual";
        } finally {
          clearTimeout(timeout2);
        }
      } finally {
        clearTimeout(timeout1);
      }
    } catch {
      source = "manual";
    }
  }

  return {
    id,
    timestamp,
    matches,
    taxonomyVersion: PATTERN_TAXONOMY_VERSION,
    source,
    thumbnailDataUrl: "", // Set by caller after canvas resize
  };
}
```

### 4.6 Image Preprocessing

```typescript
export function preprocessImage(file: File): Promise<DiagramAnalysisRequest> {
  return new Promise((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      reject(new Error("Unsupported format. Use PNG, JPG, or WebP."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("File too large. Maximum 10MB."));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          reject(new Error("Image too small. Minimum 400×400 pixels."));
          return;
        }

        // Resize to max 1024x1024 maintaining aspect ratio
        const canvas = document.createElement("canvas");
        const scale = Math.min(1024 / img.width, 1024 / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL(file.type, 0.9).split(",")[1];
        resolve({
          imageBase64: base64,
          mimeType: file.type as DiagramAnalysisRequest["mimeType"],
        });
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d")!;
        // Center-crop to square
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 100, 100);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

---

## 5. Phase 4: History Persistence

**File to create:** `client/src/lib/diagram-history.ts`  
**Estimated lines:** 50–70  
**Dependencies:** Phase 3 types  
**Test:** `npx tsc --noEmit` passes.

```typescript
// File: client/src/lib/diagram-history.ts

import type { DiagramAnalysisResult } from "./diagram-analyzer";

const STORAGE_KEY = "diagram-analysis-history";
const MAX_ENTRIES = 5;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  thumbnailDataUrl: string;
  matchCount: number;
  patternNames: string[];
  taxonomyVersion: string;
  source: "vision" | "manual";
  // Full matches stored for restoration
  matches: DiagramAnalysisResult["matches"];
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function addToHistory(result: DiagramAnalysisResult, patternNames: string[]): void {
  const entry: HistoryEntry = {
    id: result.id,
    timestamp: result.timestamp,
    thumbnailDataUrl: result.thumbnailDataUrl,
    matchCount: result.matches.length,
    patternNames,
    taxonomyVersion: result.taxonomyVersion,
    source: result.source,
    matches: result.matches,
  };

  const history = getHistory();
  const updated = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
```

---

## 6. Phase 5: Sidebar UI Component

**File to create:** `client/src/components/DiagramAnalyzer.tsx`  
**Estimated lines:** 350–450  
**Dependencies:** Phases 1–4  
**Test:** `npx tsc --noEmit` passes; component renders without runtime errors.

### 6.1 Component Interface

```typescript
interface DiagramAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onResultReady: (output: PatternEvaluationOutput) => void;
}
```

### 6.2 Internal State Machine

```typescript
type AnalyzerPhase =
  | "idle"           // Waiting for upload
  | "processing"    // Image preprocessing
  | "analyzing"     // LLM call in progress
  | "results"       // Matches returned, editable
  | "error";        // Error state with retry/manual option

const [phase, setPhase] = useState<AnalyzerPhase>("idle");
const [matches, setMatches] = useState<LLMPatternMatch[]>([]);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [error, setError] = useState<string>("");
const [governancePosture, setGovernancePosture] = useState<GovernancePosture>("Standard");
const [progressMessage, setProgressMessage] = useState("");
```

### 6.3 UI Sections

The sidebar MUST contain these sections in order:

1. **Header**: "Architecture Analyzer" title + close button (X icon)
2. **Upload zone**: Drag-and-drop area with file input. Accepts PNG/JPG/WebP. Shows thumbnail after selection.
3. **Progress indicator**: Three-stage text updates during analysis:
   - 0–2s: "Preprocessing image..."
   - 2–5s: "Identifying architectural patterns..."
   - 5–10s: "Analyzing risk topology..."
4. **Results list**: Each matched pattern shown as a card with:
   - Pattern name (bold)
   - Confidence bar (0–100%, colored: green ≥ 0.7, yellow ≥ 0.5, red < 0.5)
   - One-line reasoning
   - Remove button (X)
5. **Manual override**: "Add Pattern" dropdown to manually add patterns not detected
6. **Governance posture selector**: Three radio buttons (Minimal / Standard / Full)
7. **Generate Report button**: Primary action. Calls `evaluatePatterns()` and invokes `onResultReady`.
8. **History section**: Collapsible. Shows last 5 thumbnails. Click to restore.
9. **Error state**: Shows error message + "Try Again" button + "Select Manually" link.

### 6.4 Responsive Behavior

```typescript
// Desktop (≥1024px): Right sidebar, 420px width, pushes content
// Tablet (768–1023px): Right sidebar, 360px, overlays with backdrop
// Mobile (<768px): Bottom sheet, full width, 70vh height

// Use the existing Sheet component from @/components/ui/sheet for mobile
// Use a fixed-position div with transition for desktop
```

### 6.5 Privacy Notice

Display once (localStorage flag `diagram-analyzer-privacy-acknowledged`):

> "Your diagram is sent to an AI service for pattern analysis. The image is not stored. [Got it]"

### 6.6 Styling Requirements

Follow the existing Swiss/Bauhaus design system:
- Background: `bg-slate-900` (sidebar panel)
- Text: `text-slate-100` (primary), `text-slate-400` (secondary)
- Accent: `text-blue-400` (cobalt) for interactive elements
- Borders: `border-slate-700`
- Confidence bars: `bg-emerald-500` (high), `bg-amber-500` (medium), `bg-red-500` (low)
- Font: Monospace for pattern IDs, Inter for descriptions
- Transitions: `transition-all duration-300 ease-in-out` for sidebar open/close

---

## 7. Phase 6: Integration

### 7.1 ScenarioContext.tsx Modification

**Change:** Add `resultSource` field to `ScenarioSnapshot` interface.

```typescript
// Line 25 (after `label: string;`), add:
resultSource?: "scrambler" | "diagram";
```

This is the ONLY change to this file.

### 7.2 ScenarioSimulator.tsx Modifications

Add the following to `ScenarioSimulator.tsx`:

#### 7.2.1 Import

```typescript
import DiagramAnalyzer from "@/components/DiagramAnalyzer";
import type { PatternEvaluationOutput } from "@/lib/pattern-evaluator";
```

#### 7.2.2 State

Add to the component's state declarations:

```typescript
const [diagramSidebarOpen, setDiagramSidebarOpen] = useState(false);
```

#### 7.2.3 Handler

Add a handler for diagram analysis results:

```typescript
const handleDiagramResult = useCallback((output: PatternEvaluationOutput) => {
  const snapshot: ScenarioSnapshot = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    factPattern: output.factPattern,
    result: output.result,
    biasData: output.biasData,
    label: output.label,
    resultSource: "diagram",
  };
  setActiveScenario(snapshot);
  setDiagramSidebarOpen(false);
  // Update local state to show results
  setResult(output.result);
  setFactPattern(output.factPattern);
  setBiasData(output.biasData);
  setHasGenerated(true);
}, [setActiveScenario]);
```

#### 7.2.4 Trigger Button

Add a button in the action bar (near the existing "Generate Scenario" button):

```tsx
<button
  onClick={() => setDiagramSidebarOpen(true)}
  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors border border-slate-600"
>
  <Upload className="w-4 h-4" />
  <span className="text-sm font-medium">Analyze Diagram</span>
</button>
```

#### 7.2.5 Render Sidebar

Add at the end of the component's return JSX (before the closing fragment):

```tsx
<DiagramAnalyzer
  isOpen={diagramSidebarOpen}
  onClose={() => setDiagramSidebarOpen(false)}
  onResultReady={handleDiagramResult}
/>
```

---

## 8. Phase 7: GitHub SQLite Package

**Files to create in the GitHub repo** (not in the Vite project):

```
db/
  seed.mjs          — Generates patterns.db from agentic-patterns.ts
  query.mjs         — CLI tool for querying patterns
  patterns.db       — Generated SQLite file (gitignored until generated)
  README.md         — Usage instructions
```

### 8.1 seed.mjs

```javascript
#!/usr/bin/env node
// Generates patterns.db from the TypeScript pattern definitions
// Run: node db/seed.mjs

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse the TypeScript source to extract pattern data
// (In practice, maintain a parallel JSON file or use ts-node)
const PATTERNS_JSON_PATH = resolve(__dirname, "patterns.json");

const db = new Database(resolve(__dirname, "patterns.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS patterns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    primary_risk TEXT NOT NULL,
    visual_signatures TEXT NOT NULL,
    control_state_defaults TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS asi_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id TEXT NOT NULL REFERENCES patterns(id),
    asi_id TEXT NOT NULL,
    weight REAL NOT NULL,
    rationale TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_mappings_pattern ON asi_mappings(pattern_id);
  CREATE INDEX IF NOT EXISTS idx_mappings_asi ON asi_mappings(asi_id);
`);

// ... insert all 12 patterns and their mappings
```

### 8.2 query.mjs

```javascript
#!/usr/bin/env node
// Query the patterns database
// Usage:
//   node db/query.mjs --pattern supervisor_worker
//   node db/query.mjs --asi ASI01
//   node db/query.mjs --family AC
//   node db/query.mjs --all

import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(resolve(__dirname, "patterns.db"), { readonly: true });

const args = process.argv.slice(2);
// ... CLI argument parsing and query execution
```

---

## 9. Testing Criteria

### 9.1 TypeScript Compilation

After ALL phases complete: `npx tsc --noEmit` MUST return 0 errors.

### 9.2 Unit Test Cases (Manual Verification)

| # | Test | Expected |
|---|---|---|
| 1 | `getPatternById("single_agent")` | Returns PatternDefinition with 4 ASI mappings |
| 2 | `getPatternById("invalid_id")` | Returns `undefined` |
| 3 | `evaluatePatterns({ matches: [{ patternId: "swarm_peer", confidence: 0.9, reasoning: "..." }], governancePosture: "Minimal" })` | Returns valid ScenarioResult with ≥3 broken controls |
| 4 | `evaluatePatterns({ matches: [], governancePosture: "Standard" })` | Returns ScenarioResult with all cells "irrelevant" |
| 5 | Multi-pattern: `[swarm_peer + tool_augmented]` | Union of ASI mappings; max-weight aggregation |
| 6 | `preprocessImage(file)` where file is 200×200 | Throws "Image too small" |
| 7 | `preprocessImage(file)` where file is 15MB | Throws "File too large" |
| 8 | `validateAndParseResponse({ choices: [{ message: { content: '{"patterns":[{"patternId":"INVALID","confidence":0.9}]}' } }] })` | Returns empty array (invalid ID filtered) |
| 9 | Confidence > 1.0 in response | Clamped to 1.0 |
| 10 | `addToHistory()` called 6 times | `getHistory()` returns 5 entries |

### 9.3 Integration Test (Browser)

1. Navigate to Scenario Simulator tab
2. Click "Analyze Diagram" button → sidebar opens
3. Upload a PNG file → progress states appear
4. If vision available: results appear with confidence bars
5. If vision unavailable: manual selector appears
6. Select patterns manually → click "Generate Report"
7. Heatmap, cascade graph, and analysis panel render with diagram-sourced data
8. `resultSource` in ScenarioContext is "diagram"
9. Close sidebar → results persist
10. Switch to Evidence Explorer → deep-link from broken cell works

---

## 10. Dependency Requirements

No new npm packages required. All functionality uses:
- `crypto.randomUUID()` (built-in)
- `fetch` (built-in)
- `Canvas API` (built-in)
- `localStorage` (built-in)
- Existing shadcn/ui components: `Sheet`, `Progress`, `Button`, `Select`, `Badge`, `Tooltip`
- Existing Forge API credentials (already in environment)

---

## 11. Scope Boundary Enforcement

The implementing agent MUST verify these invariants after completion:

1. `grep -r "scrambler-evaluator" client/src/lib/pattern-evaluator.ts` → 0 results
2. `grep -r "scrambler-evaluator" client/src/lib/diagram-analyzer.ts` → 0 results
3. `grep -r "scrambler-evaluator" client/src/components/DiagramAnalyzer.tsx` → 0 results
4. `git diff client/src/lib/scrambler-types.ts` → 0 changes
5. `git diff client/src/lib/scrambler-evaluator.ts` → 0 changes
6. `git diff client/src/components/CascadeGraph.tsx` → 0 changes
7. `git diff client/src/components/AnalysisPanel.tsx` → 0 changes

---

## 12. Execution Order Summary

```
Phase 1: Create agentic-patterns.ts (12 patterns, types, exports)
  └─ Test: tsc --noEmit passes
Phase 2: Create pattern-evaluator.ts (patterns → ScenarioResult)
  └─ Test: tsc --noEmit passes
Phase 3: Validate Forge API vision → Create diagram-analyzer.ts
  └─ Test: tsc --noEmit passes; test request succeeds or graceful fallback
Phase 4: Create diagram-history.ts (localStorage persistence)
  └─ Test: tsc --noEmit passes
Phase 5: Create DiagramAnalyzer.tsx (sidebar UI)
  └─ Test: tsc --noEmit passes; renders without error
Phase 6: Modify ScenarioContext.tsx + ScenarioSimulator.tsx (integration)
  └─ Test: tsc --noEmit passes; full flow works in browser
Phase 7: Create db/ directory in GitHub repo (SQLite package)
  └─ Test: seed.mjs generates valid .db; query.mjs returns results
```

---

## 13. Failure Modes & Recovery

| Failure | Detection | Recovery |
|---|---|---|
| Forge API rejects image payload | HTTP 4xx response | Set `VISION_AVAILABLE = false`; show manual selector |
| LLM returns invalid JSON | `JSON.parse` throws | Return empty matches; show manual selector |
| LLM returns unknown pattern IDs | Validation filter removes them | Filtered out silently; remaining valid matches shown |
| All confidences below 0.3 | Empty array after filter | Show "No patterns detected" + manual selector |
| localStorage quota exceeded | `setItem` throws | Catch silently; history feature degrades gracefully |
| Image too large for base64 encoding | Memory pressure | Client-side resize to 1024×1024 before encoding |
| Network timeout (>20s total) | AbortController fires | Show timeout error + "Try Again" + manual selector |

---

## 14. Post-Implementation Checklist

The implementing agent MUST verify all items before declaring completion:

- [ ] All 5 new files created at specified paths
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] ScenarioContext.tsx has exactly 1 new line (`resultSource` field)
- [ ] ScenarioSimulator.tsx has sidebar trigger + DiagramAnalyzer render
- [ ] No immutable files modified (Section 0.2)
- [ ] Sidebar opens/closes without console errors
- [ ] Manual pattern selection produces valid heatmap
- [ ] Vision API tested (success OR graceful fallback documented)
- [ ] History persists across page reloads
- [ ] Privacy notice appears on first use only
- [ ] Responsive behavior verified (desktop sidebar, mobile sheet)
- [ ] `webdev_save_checkpoint` called after all phases pass

---

*End of Technical Requirements Document.*
