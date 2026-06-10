# PRD Alignment Document: Architecture Diagram → Pattern Matching → Crosswalk Report

**Document type:** Product Requirements Definition — Alignment Consensus  
**Status:** COMPLETE — Ready for Technical Requirements Document (TRD) authoring  
**Date:** 2026-06-10  
**Roles consulted:** Product Strategist, UX Designer, Data Architect, Backend/LLM Engineer, Security Officer, Technical Architect, QA Engineer  
**Confidence (aggregate):** 0.86

---

## Executive Summary

This feature allows compliance auditors to upload architecture diagrams (PNG/JPG) of agentic AI systems. A vision LLM identifies which of 12 curated agentic AI patterns are present. Matched patterns are evaluated against the OWASP ASI → NIST 800-53 → AI-RMF crosswalk to produce the same heatmap, cascade topology, and analysis panel output as the existing Scenario Simulator. The feature operates entirely client-side (no server upgrade required), with manual pattern selection as a universal fallback.

---

## 1. Scope & User Definition

### 1.1 Primary User

**Consensus:** Post-deployment compliance auditors (70%) and pre-deployment security architects (30%).

The product's crosswalk structure (OWASP ASI → NIST 800-53 → AI-RMF) is an audit artifact. The diagram upload feature serves auditors analyzing existing systems ("our architecture looks like this — what's our exposure?"). Architects benefit secondarily ("if we use this pattern, what controls do we need?").

**Framing decision:** Results are presented as *risk exposure* (diagnostic), not *design guidance* (prescriptive). Remediation suggestions serve both audiences.

### 1.2 Input Format

**Consensus:** PNG/JPG/WebP from any digital drawing tool. No whiteboard/handwritten support in Phase 1.

| Accepted | Rejected (Phase 1) |
|---|---|
| Miro exports (PNG/JPG) | Whiteboard photos |
| Lucidchart exports | Hand-drawn sketches |
| draw.io exports | SVG files (XSS vector) |
| Figma exports | PDF documents |
| Any digital diagram tool | Video/animated formats |

**Constraints:** Minimum 400×400px. Maximum 10MB. Resize to 1024×1024 before LLM submission.

### 1.3 Pattern Matching Scope

**Consensus:** Multiple patterns per diagram. Single combined report (union of risk mappings). Split-view comparison is Phase 2.

Real architectures combine patterns. The LLM returns ALL detected patterns with confidence scores. The evaluator computes the union of ASI risk mappings using max-weight aggregation.

### 1.4 Output Scope

**Consensus:** Full report with confidence breakdown, editable pattern list, crosswalk heatmap, cascade topology, analysis panel, and exportable artifact (Phase 2).

| Output Component | Phase 1 | Phase 2 |
|---|---|---|
| Matched patterns with confidence | Yes | Yes |
| Editable pattern list (add/remove) | Yes | Yes |
| Crosswalk heatmap (same as simulator) | Yes | Yes |
| Cascade topology graph | Yes | Yes |
| Analysis panel (cell click) | Yes | Yes |
| PDF/Markdown export | No | Yes |
| Side-by-side comparison (two diagrams) | No | Yes |

---

## 2. Pattern Taxonomy

### 2.1 The 12 Patterns

| # | ID | Name | Category | Primary Risk |
|---|---|---|---|---|
| 1 | `single_agent` | Single Agent | agent | Concentrated failure point |
| 2 | `sequential_pipeline` | Sequential Pipeline | workflow | Cascading failure propagation |
| 3 | `supervisor_worker` | Supervisor-Worker | multi_agent | Single point of control failure |
| 4 | `swarm_peer` | Swarm (Peer-to-Peer) | multi_agent | Emergent behavior, unpredictability |
| 5 | `router_triage` | Router/Triage | workflow | Misclassification → wrong handler |
| 6 | `parallel_sectioning` | Parallel Sectioning | workflow | Partial failure, merge conflicts |
| 7 | `reflection_loop` | Reflection Loop | agent | Infinite loop, self-reinforcing errors |
| 8 | `orchestrator_dynamic` | Dynamic Orchestrator | multi_agent | Unbounded delegation, goal drift |
| 9 | `group_chat` | Group Chat/Debate | multi_agent | Consensus deadlock, persuasion attacks |
| 10 | `handoff_chain` | Handoff Chain | workflow | Context loss, privilege escalation |
| 11 | `human_in_loop` | Human-in-the-Loop | agent | Approval fatigue, override bypass |
| 12 | `tool_augmented` | Tool-Augmented Agent | agent | Tool misuse, injection via output |

### 2.2 Pattern-to-ASI Mappings

**Model:** Weighted mappings (0.0–1.0) with explicit rationale per mapping. Same schema as existing `RISK_TO_ASI` in `scrambler-mappings.ts`.

**Validation rules:**
- Each pattern maps to 2–8 ASI risks (minimum ensures utility, maximum prevents dilution)
- Weights are independent (not a probability distribution)
- Confidence < 0.5 shows "provisional" badge
- Versioned via `PATTERN_TAXONOMY_VERSION` constant

### 2.3 Ground Truth Validation

**Test corpus:** 36 reference diagrams (12 clean + 12 realistic + 6 multi-pattern + 6 adversarial).

**Acceptance criteria:** Precision ≥ 0.85, Recall ≥ 0.80, no per-pattern recall below 0.60.

---

## 3. LLM Integration

### 3.1 Provider

**Consensus:** Forge API (primary). Manual selection (fallback). No secondary provider in Phase 1.

**Critical validation step:** Test Forge API vision support before implementing Phase 3. If unsupported, ship with manual-selection-only.

| Provider | Cost/analysis | Latency | Status |
|---|---|---|---|
| Forge API (Gemini) | ~$0.01 | 3–12s | Primary (needs validation) |
| Manual selection | $0.00 | Instant | Universal fallback |
| Custom OpenAI key | ~$0.03 | 5–10s | Phase 2 (requires web-db-user) |

### 3.2 Prompt Architecture

**Single call.** Temperature 0.2. Max tokens 1024. Structured JSON output.

The prompt includes all 12 pattern definitions with visual signatures. The LLM returns a JSON array of matched pattern IDs with confidence scores and one-sentence reasoning.

### 3.3 Error Handling

**Three-tier degradation:** Retry (1x, 2s backoff) → Timeout (15s first, 20s retry) → Manual fallback.

**Never show raw errors.** Every failure state has a user-actionable next step (retry button or manual selector).

---

## 4. User Experience

### 4.1 Sidebar Behavior

**Consensus:** Semi-persistent. Stays open within Simulator tab. Closes on tab switch. Restores state on return.

| Viewport | Behavior |
|---|---|
| Desktop (≥1024px) | Right sidebar, 420px, pushes content left |
| Tablet (768–1023px) | Right sidebar, 360px, overlays with scrim |
| Mobile (<768px) | Bottom sheet, full width, 70% height |

### 4.2 Results Presentation

**Consensus:** Show matched patterns with confidence bars, editable before report generation. Show "also detected" patterns below a divider. Include manual override.

**Flow:**
```
Upload → Analyzing (progress states at 2s/5s/10s) → Results (editable) → Generate Report → Heatmap
```

### 4.3 History

Store last 5 analyses in localStorage. Show as thumbnails. Click to restore without re-running LLM.

### 4.4 Diagram Quality Handling

| Issue | Response |
|---|---|
| Too small (<400px) | Block upload with guidance |
| No patterns detected | "No patterns detected" + manual selector |
| Non-architecture image | "Doesn't appear to be an agentic AI diagram" + manual selector |
| Low confidence on all | Show all with low bars + manual override |

---

## 5. Architecture & Integration

### 5.1 Boundary Contract

The diagram analyzer is a self-contained subsystem. Its ONLY output to the existing system is a `ScenarioResult` object (same type as the scrambler-evaluator produces). The renderer doesn't know or care about the source.

```
┌─────────────────────────────────────────────┐
│ DIAGRAM ANALYZER SUBSYSTEM (new code)       │
│                                             │
│  DiagramAnalyzer.tsx (sidebar UI)           │
│  diagram-analyzer.ts (LLM integration)     │
│  pattern-evaluator.ts (patterns → result)  │
│  agentic-patterns.ts (12 definitions)      │
│                                             │
│  OUTPUT: ScenarioResult                     │
├─────────────────────────────────────────────┤
│ EXISTING SYSTEM (unchanged)                 │
│                                             │
│  ScenarioSimulator.tsx                      │
│  CascadeGraph.tsx                           │
│  AnalysisPanel.tsx                          │
│  ScenarioContext.tsx                        │
│  Home.tsx                                   │
└─────────────────────────────────────────────┘
```

### 5.2 Integration Points

| Integration | Mechanism | Changes Required |
|---|---|---|
| Simulator rendering | `ScenarioResult` via `ScenarioContext` | Add `resultSource` field |
| Evidence Explorer deep-links | Existing `deepLinkTarget` mechanism | None |
| Onboarding | Conditional Phase 6 (second visit) | Add one phase to controller |
| Comparison mode | Existing `ScenarioComparison` component | None (Phase 2) |

### 5.3 What Does NOT Change

- `CascadeGraph.tsx` — same data structure
- `AnalysisPanel.tsx` — same data structure
- `ScenarioComparison.tsx` — same data structure
- Heatmap cell rendering — same `CellState` enum
- Evidence Explorer — same deep-link mechanism

---

## 6. Data & Storage

### 6.1 Client-Side (Phase 1)

- **localStorage:** Last 5 analyses (JSON metadata + 100×100 thumbnail, ~10KB total)
- **sessionStorage:** Current analysis state (via ScenarioContext)
- **No server-side storage** (web-static project)

### 6.2 GitHub Local Install

- `db/patterns.db` — SQLite file with all 12 patterns + mappings
- `db/query.mjs` — CLI tool for local queries
- `db/seed.mjs` — Script to regenerate SQLite from TypeScript source

### 6.3 Versioning

- `PATTERN_TAXONOMY_VERSION` constant (semver)
- Each stored analysis records the version used
- No automatic re-evaluation on version change
- Banner: "Pattern definitions updated. [Re-analyze →]"

---

## 7. Security

### 7.1 Data Flow

```
User → [image in browser] → [base64 encode] → [Forge API proxy] → [LLM] → [JSON response] → [validate] → [render]
```

- Image is NEVER stored server-side (by us)
- Image IS processed by the LLM provider (Manus proxy → Google/OpenAI)
- User should be informed: "Your diagram is sent to an AI service for analysis."

### 7.2 Attack Surface

| Vector | Mitigation |
|---|---|
| SVG XSS | Reject SVG (PNG/JPG/WebP only) |
| Prompt injection via labels | Validate response against known pattern ID enum |
| Oversized payloads | Client-side 10MB limit + resize to 1024×1024 |
| API key exposure | By design (Manus proxy, domain-scoped) |
| localStorage poisoning | Validate on read, informational only |

### 7.3 Prompt Injection Defense

Strict validation: only known pattern IDs pass through. Confidence clamped to [0.0, 1.0]. Reasoning truncated to 200 characters. React's JSX escaping prevents XSS in rendered text.

---

## 8. Success Metrics

### 8.1 Accuracy

| Metric | Target | Measurement |
|---|---|---|
| Precision | ≥ 0.85 | 36-diagram reference set, 3 runs each |
| Recall | ≥ 0.80 | Same reference set |
| Per-pattern recall | ≥ 0.60 | No pattern systematically missed |
| Adversarial precision | 1.00 | Non-agentic diagrams return empty |

### 8.2 Adoption

| Metric | Target | Timeframe |
|---|---|---|
| Upload rate | 15% of sessions | 60 days post-launch |
| Completion rate | ≥ 80% | Ongoing |
| Override rate | ≤ 20% | Ongoing (lower = better accuracy) |
| Conversion rate (analysis → report) | ≥ 70% | Ongoing |
| Return rate (2nd upload within 7 days) | 30% | 90 days post-launch |

### 8.3 Latency

| Step | Target | Maximum |
|---|---|---|
| Client-side processing | <500ms | 800ms |
| LLM inference | <5s | 12s |
| Total end-to-end | <10s | 20s |

---

## 9. Constraints & Boundaries

### 9.1 In Scope

- Upload PNG/JPG/WebP for analysis
- Identify patterns from 12-pattern taxonomy
- Generate crosswalk report (same UI as simulator)
- Manual pattern override
- Last 5 analyses in localStorage
- SQLite file in GitHub repo for local queries

### 9.2 Out of Scope (Phase 1)

- Server-side storage of diagrams or analyses
- Miro/Figma API direct integration
- User-defined custom patterns
- Real-time monitoring
- Email/share reports
- Whiteboard/handwritten diagram support
- PDF export
- Side-by-side diagram comparison
- Camera capture (mobile)
- Rate limiting

### 9.3 Scope Creep Prevention Rules

1. The diagram analyzer NEVER modifies existing types
2. The diagram analyzer NEVER imports from `scrambler-evaluator.ts`
3. The diagram analyzer NEVER writes to DOM outside its sidebar
4. The pattern-evaluator produces `ScenarioResult` indistinguishable from scrambler output
5. If a future feature requires `ScenarioResult` changes, it must be a separate RFC

---

## 10. Conflicts Resolved

### Conflict 1: Sidebar vs. Full Tab

- **UX Designer:** Sidebar (non-disruptive, matches AnalysisPanel precedent)
- **Technical Architect:** Sidebar (minimal architectural change)
- **Resolution:** Sidebar. Unanimous.

### Conflict 2: Multiple Patterns vs. Single Pattern

- **Product Strategist:** Multiple (real architectures combine patterns)
- **Data Architect:** Multiple (union aggregation with max-weight)
- **QA Engineer:** Multiple (but test multi-pattern accuracy separately)
- **Resolution:** Multiple patterns in Phase 1. Union aggregation. Test with dedicated multi-pattern corpus.

### Conflict 3: Forge API vs. Custom Key

- **Backend/LLM Engineer:** Forge API primary, but confidence only 0.65 (vision support uncertain)
- **Security Officer:** Forge API preferred (no additional secrets to manage)
- **Technical Architect:** Forge API (already integrated, minimal changes)
- **Resolution:** Forge API primary. **MUST validate vision support before Phase 3 implementation.** If unsupported, ship manual-selection-only for Phase 1.

### Conflict 4: Store Diagrams Server-Side?

- **Security Officer:** NEVER store diagrams (IP risk)
- **Data Architect:** Store metadata only (pattern IDs, confidence, timestamp)
- **Product Strategist:** No server in Phase 1 (web-static)
- **Resolution:** No server-side storage in Phase 1. Phase 2 (if upgraded): metadata only, never images.

---

## 11. Assumptions Requiring Validation

| # | Assumption | Confidence | Impact if False | Validation Method |
|---|---|---|---|---|
| A1 | Forge API supports multimodal/vision requests | 0.65 | Must ship manual-only or upgrade to web-db-user | Send test image to API |
| A2 | 12 patterns covers enterprise agentic AI | 0.80 | Users request patterns not in taxonomy | User feedback post-launch |
| A3 | Digital diagrams have recognizable topology | 0.85 | Low accuracy on messy diagrams | Reference set testing |
| A4 | Existing evaluator can extend to 12 archetypes | 0.75 | Need parallel evaluation engine | Code review of scrambler-evaluator |
| A5 | Pattern-to-ASI mappings are accurate | 0.78 | Misleading compliance reports | Practitioner review |

---

## 12. Implementation Estimate

| Phase | Description | Effort | Dependencies |
|---|---|---|---|
| 1 | Pattern data layer (12 definitions + mappings) | 60 min | None |
| 2 | Pattern evaluator (patterns → ScenarioResult) | 45 min | Phase 1 |
| 3 | Vision LLM integration | 60 min | Phase 1, A1 validation |
| 4 | Sidebar UI component | 90 min | Phases 1–3 |
| 5 | Integration with existing simulator | 60 min | Phases 1–4 |
| 6 | GitHub SQLite package | 45 min | Phase 1 |
| 7 | Testing & checkpoint | 30 min | All phases |
| **Total** | — | **~7.5 hours** | — |

---

## 13. Counterfactuals That Collapse the Approach

| # | Counterfactual | Impact | Fallback |
|---|---|---|---|
| C1 | Forge API does NOT support vision | Cannot do LLM-based pattern recognition | Manual selection only (Phase 1); add custom secret (Phase 2) |
| C2 | LLM accuracy is below 0.60 precision | Feature is unreliable, users won't trust it | Manual selection becomes primary; LLM becomes "suggestion" mode |
| C3 | Real diagrams combine 5+ patterns routinely | Union aggregation produces "everything is broken" heatmaps | Add weighting by confidence; show top-3 only |
| C4 | Users expect real-time Miro integration (not upload) | Upload feels outdated; low adoption | Phase 2: Miro API OAuth integration (requires web-db-user) |
| C5 | Authentication is added to the app | localStorage persistence model is per-device, not per-user | Migrate to server-side user preferences |

---

## 14. Decision Log

| # | Decision | Rationale | Alternatives Rejected |
|---|---|---|---|
| D1 | Auditor-primary framing | Codebase evidence (crosswalk structure, Evidence Explorer) | Architect-primary, dual-primary |
| D2 | 12 patterns (not 4, not 20+) | Covers major topologies without overwhelming | Keep 4 (too limited), 20+ (unmaintainable) |
| D3 | Client-side only (web-static) | No upgrade needed; simpler; faster to ship | web-db-user upgrade (adds auth/DB complexity) |
| D4 | Single LLM call (not multi-stage) | Lower latency, simpler error handling | Two-stage describe→classify (2x cost, 2x latency) |
| D5 | Union aggregation (max weight) | Prevents over-counting while preserving strongest signal | Sum (inflates risk), average (dilutes signal) |
| D6 | Manual selection as fallback (not error page) | Always actionable; never a dead end | Error page (frustrating), retry-only (may fail again) |
| D7 | No diagram storage (client or server) | IP protection; privacy-first | Store for history (IP risk), store hashes only (limited value) |
| D8 | Semi-persistent sidebar (not full tab) | Non-disruptive; matches existing AnalysisPanel | Full tab (breaks progressive disclosure), modal (can't see results) |

---

## 15. Ready for TRD

This document establishes full alignment on:
- **What** the feature does (diagram → patterns → crosswalk report)
- **Who** it serves (compliance auditors, primarily)
- **How** it integrates (self-contained subsystem, `ScenarioResult` boundary)
- **What** success looks like (precision ≥ 0.85, upload rate 15%)
- **What** could go wrong (5 counterfactuals documented)
- **What** is explicitly excluded (scope boundaries defined)

**Next step:** Author the Technical Requirements Document (TRD) for long-horizon agentic coding AI consumption. The TRD should be executable without further human clarification for any Phase 1 item.
