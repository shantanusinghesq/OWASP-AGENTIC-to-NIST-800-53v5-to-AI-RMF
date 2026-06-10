# Implementation Plan: Architecture Diagram → Pattern Matching → Crosswalk Report

**Role assumed:** Lead Product Engineer — Feature Architecture  
**Date:** 2026-06-10  
**Estimated implementation:** 8–12 hours across 7 phases

---

## 1. Feature Summary

A sidebar panel that accepts image uploads (PNG/JPG) of architecture diagrams from Miro or similar drawing tools. A vision LLM (Gemini or ChatGPT) interprets the diagram to identify which agentic AI patterns are present. The identified patterns are matched against a curated SQLite datastore of 12 agentic AI design patterns. Matched patterns are fed into the existing crosswalk engine to produce the same simulator UI output (heatmap + cascade topology + analysis panel).

---

## 2. Pattern Taxonomy (12 Patterns)

Expanding from the current 4 archetypes (`Single`, `Sequential`, `Supervisor`, `Swarm`) to 12 curated agentic AI patterns. Each pattern has a distinct **risk profile** and **visual signature** that a vision model can identify from architecture diagrams.

| # | Pattern ID | Name | Visual Signature | Risk Profile |
|---|---|---|---|---|
| 1 | `single_agent` | Single Agent | One large node with tool connections | Concentrated failure point, no redundancy |
| 2 | `sequential_pipeline` | Sequential Pipeline | Left-to-right chain, unidirectional arrows | Cascading failure propagation, linear dependency |
| 3 | `supervisor_worker` | Supervisor-Worker | Star/hub-spoke topology, center hub | Single point of control failure, bottleneck |
| 4 | `swarm_peer` | Swarm (Peer-to-Peer) | Fully connected mesh or cluster | Emergent behavior, consensus failure, unpredictability |
| 5 | `router_triage` | Router/Triage | Diamond decision node with multiple branches | Misclassification → wrong handler, single point of failure |
| 6 | `parallel_sectioning` | Parallel Sectioning | Fork-join topology, parallel lanes | Partial failure, merge conflicts, inconsistent outputs |
| 7 | `reflection_loop` | Reflection Loop | Circular arrow back to self, iterative cycle | Infinite loop, self-reinforcing errors, resource exhaustion |
| 8 | `orchestrator_dynamic` | Dynamic Orchestrator | Hub with dashed/dotted spokes (unknown workers) | Unbounded delegation, goal drift, uncontrolled spawning |
| 9 | `group_chat` | Group Chat/Debate | Circular arrangement, bidirectional arrows, shared context | Consensus deadlock, persuasion attacks, groupthink |
| 10 | `handoff_chain` | Handoff Chain | Linear with transfer/handoff markers between agents | Context loss at boundaries, privilege escalation |
| 11 | `human_in_loop` | Human-in-the-Loop | Agent nodes + distinct human/gate node | Approval fatigue, override bypass, latency bottleneck |
| 12 | `tool_augmented` | Tool-Augmented Agent | Agent + external system boxes (APIs, DBs, tools) | Tool misuse, injection via tool output, dependency failure |

---

## 3. Decision Points

### DP-1: Vision LLM Provider

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Gemini (via Forge API)** | Already available via BUILT_IN_FORGE_API; supports vision natively; no additional secrets needed | Forge API may not expose Gemini vision directly | ✅ **Selected** |
| ChatGPT (OpenAI API) | Best vision model (GPT-4o); well-documented | Requires new API key secret; additional cost | ❌ Devalued |
| Client-side only (no LLM) | No backend needed; stays static | Cannot interpret diagrams; defeats the purpose | ❌ Devalued |

**Assumption:** The Forge API (BUILT_IN_FORGE_API_KEY / VITE_FRONTEND_FORGE_API_KEY) supports vision/multimodal requests. If it does not, we fall back to requiring a user-provided OpenAI key stored in Secrets.

**Counterfactual that collapses this:** If the Forge API does not support image inputs, we must either (a) upgrade to web-db-user and add a custom secret for OpenAI/Gemini, or (b) implement a pattern-matching heuristic without LLM vision (dramatically reducing accuracy).

**Confidence:** 0.7

---

### DP-2: Datastore Technology

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **In-app JSON datastore** | No backend needed; stays web-static; instant query; ships with GitHub clone | Not a "real" database; limited query flexibility | ✅ **Selected for v1** |
| SQLite via better-sqlite3 (backend) | True SQL queries; scalable; matches user's "sqlite local install" request | Requires web-db-user upgrade; adds backend complexity | ⬜ **Phase 2 target** |
| External API | Decoupled; independently scalable | Over-engineered for 12 patterns; latency | ❌ Devalued |

**Rationale:** The user specified "sqlite local install through github local install." This means the GitHub repo should include a SQLite database file that can be queried locally. However, the deployed web app cannot run SQLite in-browser without WASM overhead. The pragmatic approach: ship a JSON datastore in the web app (queryable client-side) AND include a `patterns.db` SQLite file in the GitHub repo with a Node.js query script for local use.

**Assumption:** 12 patterns with ~20 fields each is small enough for a JSON file (~15KB). The SQLite file is for the GitHub-local workflow, not the deployed app.

**Counterfactual that collapses this:** If the pattern count grows beyond 50, or if patterns need user-contributed entries, a backend database becomes necessary and we must upgrade to web-db-user.

**Confidence:** 0.85

---

### DP-3: Integration Point (Sidebar vs. Tab vs. Modal)

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Sidebar (slide-in panel)** | Non-disruptive; can coexist with any tab; matches AnalysisPanel precedent | Competes for horizontal space on narrow viewports | ✅ **Selected** |
| New tab | Clean separation; full-width | Breaks progressive disclosure (adds 5th tab); disconnected from simulator output | ❌ Devalued |
| Modal | Focused attention; no layout disruption | Cannot show results alongside heatmap; must dismiss to see output | ❌ Devalued |

**Assumption:** The sidebar will be triggered from a persistent "Analyze Diagram" button in the app header or simulator toolbar. Results flow into the existing simulator UI (same heatmap, same cascade graph).

**Counterfactual that collapses this:** If the sidebar needs to display the full heatmap + cascade graph inside itself (rather than driving the main content area), it becomes too narrow and a full tab is required.

**Confidence:** 0.9

---

### DP-4: Pattern Matching Strategy

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **LLM vision → structured JSON → exact match against pattern IDs** | High accuracy; leverages LLM reasoning; structured output | Requires LLM call; latency; cost per analysis | ✅ **Selected** |
| Computer vision (edge detection, topology analysis) | No LLM cost; deterministic | Extremely brittle; Miro diagrams vary wildly in style | ❌ Devalued |
| User self-selects patterns from a list | No LLM needed; 100% accurate | Defeats the "upload diagram" value proposition | ❌ Devalued (but kept as fallback) |

**Implementation:** The LLM receives the image + a system prompt containing the 12 pattern definitions with visual signatures. It returns a JSON array of matched pattern IDs with confidence scores. The app then queries the pattern datastore for those IDs and feeds them into the crosswalk engine.

**Fallback:** If LLM vision is unavailable, show a manual pattern selector (checkboxes) as degraded mode.

**Confidence:** 0.85

---

### DP-5: Output Rendering

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Reuse existing simulator UI components** | Consistent UX; no new components; proven rendering | Must adapt ScenarioSimulator to accept external pattern input | ✅ **Selected** |
| New dedicated report view | Clean slate; optimized for this flow | Duplicates UI; maintenance burden; inconsistent experience | ❌ Devalued |

**Assumption:** The existing `ScenarioSimulator` can be driven by an external pattern input (bypassing the random generator). The `FactPattern.agent_archetype` field currently accepts 4 values; we extend it to accept any of the 12 pattern IDs, and the evaluator maps them to relevant ASI risks and NIST controls.

**Counterfactual that collapses this:** If the evaluator's logic is too tightly coupled to the 4 original archetypes and cannot be extended without a full rewrite, we need a separate evaluation engine for the 8 new patterns.

**Confidence:** 0.75

---

### DP-6: LLM Prompt Architecture

| Option | Pros | Cons | Decision |
|---|---|---|---|
| **Single vision call with structured output** | One round-trip; lower latency; simpler error handling | Prompt must be comprehensive; may miss edge cases | ✅ **Selected** |
| Two-stage (describe → classify) | Better accuracy; separation of concerns | 2x latency; 2x cost; more failure modes | ❌ Devalued |

**Prompt structure:**
```
System: You are an expert in agentic AI architecture patterns. Given an architecture diagram image, identify which of the following 12 patterns are present. Return ONLY a JSON array.

[12 pattern definitions with visual signatures]

Return format: { "patterns": [{ "id": "pattern_id", "confidence": 0.0-1.0, "reasoning": "..." }] }
```

**Confidence:** 0.8

---

## 4. Assumptions Accepted

| # | Assumption | Impact if False |
|---|---|---|
| A1 | Forge API supports multimodal/vision requests with image input | Must add custom OpenAI/Gemini secret; upgrade to web-db-user |
| A2 | 12 patterns is sufficient coverage for enterprise agentic AI architectures | Users may request patterns not in taxonomy; need extensibility |
| A3 | Architecture diagrams from Miro/Lucidchart/draw.io have recognizable topological features | Low-fidelity sketches may confuse the vision model; need fallback |
| A4 | The existing scrambler-evaluator can be extended to handle 12 archetypes | May need a parallel evaluation engine for new patterns |
| A5 | Users upload one diagram at a time (not batch) | Batch would require queue/progress UI |
| A6 | The sidebar width (400px) is sufficient for upload + results summary | May need responsive breakpoints or full-width mode |
| A7 | Pattern-to-ASI-risk mappings can be curated statically (not learned) | If mappings are wrong, reports are misleading |
| A8 | The Forge API returns responses within 10 seconds for vision requests | Need loading states and timeout handling |

---

## 5. Data Schema

### Pattern Datastore (JSON for web app, SQLite for GitHub local)

```typescript
interface AgenticPattern {
  id: string;                    // e.g., "router_triage"
  name: string;                  // e.g., "Router/Triage"
  category: "workflow" | "agent" | "multi_agent";
  description: string;           // 2-3 sentence description
  visual_signature: string;      // How it looks in diagrams
  risk_profile: string;          // Primary risk characteristics
  failure_modes: string[];       // Specific ways this pattern fails
  asi_relevance: {               // Which ASI risks are most relevant
    asiId: string;               // e.g., "ASI01"
    weight: number;              // 0.0-1.0
    rationale: string;
  }[];
  nist_families: string[];       // Primary NIST 800-53 families engaged
  ai_rmf_functions: string[];    // Primary AI-RMF functions engaged
  mitigations: string[];         // Key security controls for this pattern
  real_world_examples: string[]; // Known implementations
}
```

### SQLite Schema (for GitHub local install)

```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  visual_signature TEXT NOT NULL,
  risk_profile TEXT NOT NULL,
  failure_modes TEXT NOT NULL,  -- JSON array
  mitigations TEXT NOT NULL,    -- JSON array
  real_world_examples TEXT NOT NULL  -- JSON array
);

CREATE TABLE pattern_asi_mappings (
  pattern_id TEXT NOT NULL,
  asi_id TEXT NOT NULL,
  weight REAL NOT NULL,
  rationale TEXT NOT NULL,
  PRIMARY KEY (pattern_id, asi_id),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id)
);

CREATE TABLE pattern_nist_families (
  pattern_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  PRIMARY KEY (pattern_id, family_id),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id)
);

CREATE TABLE pattern_ai_rmf_functions (
  pattern_id TEXT NOT NULL,
  function_id TEXT NOT NULL,
  PRIMARY KEY (pattern_id, function_id),
  FOREIGN KEY (pattern_id) REFERENCES patterns(id)
);
```

---

## 6. Implementation Phases

### Phase 1: Pattern Data Layer (60 min)
- Create `client/src/lib/agentic-patterns.ts` with all 12 pattern definitions
- Include `asi_relevance` mappings, `nist_families`, `ai_rmf_functions` for each
- Create `db/patterns.sql` schema + seed script for GitHub SQLite file
- Generate `db/patterns.db` SQLite file via Node.js seed script

### Phase 2: Pattern Evaluator (45 min)
- Create `client/src/lib/pattern-evaluator.ts`
- Accepts array of matched pattern IDs → produces same output as `scrambler-evaluator`
- Maps patterns to ASI risks using weights from the datastore
- Generates heatmap cell states, cascade paths, and bias data
- Reuses existing `CellState`, `ControlEvaluation`, `ScenarioResult` types

### Phase 3: Vision LLM Integration (60 min)
- Create `client/src/lib/diagram-analyzer.ts`
- Implements the vision API call (Forge API or fallback)
- Sends image + structured prompt → receives JSON pattern matches
- Handles errors, timeouts, and fallback to manual selection

### Phase 4: Sidebar UI Component (90 min)
- Create `client/src/components/DiagramAnalyzer.tsx`
- Slide-in sidebar (right side, 420px width)
- States: idle → uploading → analyzing → results → report
- Upload zone (drag & drop + click)
- Analysis progress indicator
- Results: matched patterns with confidence bars
- "Generate Report" button → drives ScenarioSimulator with matched patterns
- Manual pattern selector as fallback/override

### Phase 5: Integration with Existing Simulator (60 min)
- Extend `ScenarioContext` to accept external pattern input
- Extend `FactPattern.agent_archetype` to accept all 12 pattern IDs
- Modify `ScenarioSimulator` to render results from diagram analysis
- Wire sidebar "Generate Report" → same heatmap + cascade + analysis panel output

### Phase 6: GitHub SQLite Package (45 min)
- Create `db/` directory in project root
- Write `db/seed.mjs` script that generates `patterns.db` from the JSON data
- Write `db/query.mjs` CLI tool for local pattern queries
- Update README with local SQLite usage instructions

### Phase 7: Testing & Checkpoint (30 min)
- Test with sample architecture diagrams
- Verify fallback mode (manual pattern selection)
- Verify report output matches existing simulator format
- Save checkpoint and push to GitHub

---

## 7. File Inventory (New Files)

| File | Purpose | Lines (est.) |
|---|---|---|
| `client/src/lib/agentic-patterns.ts` | 12 pattern definitions with all metadata | ~400 |
| `client/src/lib/pattern-evaluator.ts` | Pattern → crosswalk evaluation engine | ~200 |
| `client/src/lib/diagram-analyzer.ts` | Vision LLM integration for diagram interpretation | ~120 |
| `client/src/components/DiagramAnalyzer.tsx` | Sidebar UI component | ~350 |
| `db/seed.mjs` | SQLite database generator script | ~80 |
| `db/query.mjs` | CLI query tool for local use | ~60 |
| `db/schema.sql` | SQLite schema definition | ~40 |

**Total new code:** ~1,250 lines

---

## 8. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Forge API doesn't support vision | Fallback: manual pattern selector; user can add OpenAI key as custom secret |
| Vision model misidentifies patterns | Show confidence scores; allow user to override/correct matches before generating report |
| 12 patterns insufficient | Extensible JSON structure; easy to add patterns without code changes |
| Evaluator too coupled to 4 archetypes | New `pattern-evaluator.ts` is independent; doesn't modify existing evaluator |
| Sidebar too narrow for results | Expandable width; "pop out to full screen" option |
| Diagram quality too low | Prompt includes instruction to request re-upload if confidence < 0.3 |

---

## 9. Counterfactuals That Would Collapse This Approach

1. **If the Forge API cannot process images** → The entire LLM vision pipeline fails. Mitigation: manual pattern selection mode works without any LLM.

2. **If users expect the SQLite to be the primary runtime datastore** → The web app cannot run SQLite without WASM. Mitigation: JSON is the runtime store; SQLite is the GitHub-local companion.

3. **If architecture diagrams are too abstract for pattern recognition** → The vision model returns low-confidence or no matches. Mitigation: fallback to manual selection; prompt engineering to handle abstract diagrams.

4. **If the 8 new patterns cannot be meaningfully mapped to ASI risks** → Reports for new patterns would be empty or misleading. Mitigation: each pattern's `asi_relevance` is manually curated with rationale; we validate coverage before shipping.

5. **If users expect real-time collaborative diagram editing** → This is an upload-and-analyze tool, not a diagram editor. Mitigation: clear UX copy ("Upload your diagram from Miro, Lucidchart, or any drawing tool").

---

## 10. Execution Sequence

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
  ↓          ↓          ↓          ↓          ↓          ↓         ↓
 Data      Engine     Vision      UI       Wire-up    GitHub    Test
```

All phases are sequential (each depends on the previous). Total estimated time: 8 hours.
