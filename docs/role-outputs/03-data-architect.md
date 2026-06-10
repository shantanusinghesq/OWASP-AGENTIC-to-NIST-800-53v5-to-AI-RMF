# Role 3: Data Architect — Answers

**Context consumed:** data.ts (ASIRisk, CrosswalkEntry, OWASP_ASI, CROSSWALK), scrambler-types.ts (FactPattern, ScenarioResult, ControlEvaluation), scrambler-mappings.ts (RISK_TO_ASI, CONTROL_STATE_TO_FAMILIES), scrambler-evaluator.ts (evaluateScenario, getCellState, generateCascadePath).

---

## Q2.1: Pattern-to-ASI Mappings

**Recommended answer:** Weighted mappings (0.0–1.0) with explicit rationale per mapping. Versioned via git. Validated by the builder (practitioner) with documented confidence levels.

**Rationale:**
- The existing `RISK_TO_ASI` in `scrambler-mappings.ts` already uses this exact model: `{ asiId, weight, rationale, imdaRef }`. The pattern-to-ASI mappings should follow the same schema for consistency.
- The existing mappings carry confidence annotations: "Decision Point: DP-02 (confidence 0.78)" — this is the validation model already in use.
- No external reviewer (OWASP, NIST) is available for validation. The builder is the domain expert. This is acceptable for a Phase 1 product.

**Schema (extends existing model):**
```typescript
interface PatternASIRelevance {
  patternId: string;      // e.g., "router_triage"
  asiId: string;          // e.g., "ASI01"
  weight: number;         // 0.0-1.0
  rationale: string;      // Why this pattern triggers this risk
  confidence: number;     // 0.0-1.0 (author's confidence in the mapping)
  version: string;        // e.g., "1.0.0" (semver)
}
```

**Validation rules:**
- Each pattern MUST map to at least 2 ASI risks (no pattern is risk-free)
- Each pattern MUST map to at most 8 ASI risks (prevents over-mapping that dilutes signal)
- Sum of weights per pattern is NOT constrained (unlike probability distributions, risk weights are independent)
- Confidence < 0.5 triggers a "provisional" badge in the UI

**Who validates:** The builder (practitioner). The `confidence` field makes uncertainty explicit. Future: community validation via GitHub issues/PRs on the patterns file.

**Confidence:** 0.9

---

## Q2.2: Pattern Definitions

**Recommended answer:** Static for Phase 1 (ship once). Versioned via git for Phase 2. No user overrides of definitions (only of matched results). No anti-patterns in Phase 1.

**Rationale:**
- 12 patterns is a bounded, curated set. The value is in curation, not extensibility.
- The existing OWASP_ASI data is static (hardcoded in data.ts). The product's credibility comes from the builder's editorial judgment, not from dynamic updates.
- User overrides of *definitions* (changing what a pattern means) would break the crosswalk integrity. User overrides of *matches* (saying "my diagram is actually Pattern X") are safe and encouraged.
- Anti-patterns ("looks like agentic AI but isn't") add complexity without clear value in Phase 1. The LLM can return an empty match set if the diagram isn't agentic.

**Versioning model:**
- `agentic-patterns.ts` has a `PATTERN_TAXONOMY_VERSION` constant (e.g., `"1.0.0"`)
- Each analysis stores this version in its result metadata
- When the version changes, old analyses show: "Analyzed with Pattern Taxonomy v1.0.0 (current: v1.1.0)"
- No automatic re-evaluation (too complex, too risky for a static product)

**Confidence:** 0.85

---

## Q2.3: Ground Truth Validation

**Recommended answer:** Create 24 reference diagrams (2 per pattern). Test LLM accuracy against these. Acceptable false-positive rate: 15%. Acceptable false-negative rate: 20%.

**Rationale:**
- False positives (incorrectly identifying a pattern) are worse than false negatives (missing a pattern) because:
  - A false positive generates a compliance report with irrelevant controls → wastes auditor time
  - A false negative means the user adds the pattern manually → minor friction
- 24 reference diagrams (2 per pattern) is the minimum viable test set
- Each diagram should be: (a) a "textbook" example of the pattern, (b) a "realistic" example with noise/complexity

**Measurement approach:**
1. Create reference diagrams using Miro (export as PNG)
2. Run each through the analyzer 3 times (LLM outputs are non-deterministic)
3. Calculate per-pattern: precision, recall, F1
4. Overall targets: precision ≥ 0.85, recall ≥ 0.80
5. Iterate on LLM prompt until targets are met

**Ground truth format:**
```json
{
  "diagram": "ref_diagrams/sequential_pipeline_01.png",
  "expected_patterns": ["sequential_pipeline"],
  "expected_confidence_min": 0.7,
  "notes": "Clean Miro export, 3 agents in linear chain with validation gates"
}
```

**Confidence:** 0.8

---

## Q6.1: Local Storage (Client-Side Persistence)

**Recommended answer:** Store last 5 analyses in localStorage. Include: pattern matches, confidence scores, timestamp, thumbnail reference. Do NOT store the full image (too large).

**Rationale:**
- localStorage limit is ~5MB per domain. A single analysis result (JSON) is ~2KB. 5 analyses = ~10KB. Well within limits.
- The uploaded image should NOT be stored in localStorage (a 2MB PNG would consume 40% of the budget). Instead, store a 100×100 thumbnail (base64, ~5KB) for the history view.
- Users expect to see their recent analyses when they return. This is the "history" feature from the UX role.

**Storage schema:**
```typescript
interface StoredAnalysis {
  id: string;                    // UUID
  timestamp: number;             // Unix ms
  thumbnail: string;             // base64 data URL (100×100)
  matchedPatterns: {
    id: string;
    confidence: number;
    userOverride: boolean;       // Was this manually added/removed?
  }[];
  taxonomyVersion: string;       // e.g., "1.0.0"
  reportGenerated: boolean;      // Did user click "Generate Report"?
}
```

**localStorage key:** `agentic_diagram_analyses_v1`

**Cleanup:** When count exceeds 5, remove oldest. Show "Clear history" link.

**Confidence:** 0.9

---

## Q6.3: Pattern Datastore Versioning

**Recommended answer:** Versioned via git. No automatic re-evaluation. Old analyses show their taxonomy version. Users can manually re-analyze.

**Rationale:**
- The pattern datastore is a TypeScript file (`agentic-patterns.ts`) committed to the repo. Every change is a git commit with a message explaining what changed.
- The `PATTERN_TAXONOMY_VERSION` constant is bumped on every change (semver: patch for typos, minor for new mappings, major for new patterns or removed patterns).
- Re-evaluating old analyses when patterns change is dangerous: the user may have made decisions based on the old report. Changing it retroactively undermines trust.
- Instead: show a non-intrusive banner "Pattern definitions updated since this analysis. [Re-analyze →]"

**Version tracking in stored analyses:**
```typescript
// In StoredAnalysis:
taxonomyVersion: "1.0.0"  // Locked at time of analysis

// In agentic-patterns.ts:
export const PATTERN_TAXONOMY_VERSION = "1.0.0";
```

**Migration path (if major version change):**
- Old analyses remain valid with their version
- New analyses use the new version
- No automatic migration

**Confidence:** 0.9

---

## Q9.2: Pattern Ambiguity (Data Model Implications)

**Recommended answer:** Support multiple pattern matches per diagram. Rank by confidence. Allow user to select which patterns to include in the report.

**Rationale:**
- Real architectures are rarely a single pure pattern. A system might be "Sequential Pipeline + Reflection Loop" (pipeline with self-review at each stage).
- The LLM should return ALL detected patterns with confidence scores, not just the top one.
- The evaluator should handle multiple patterns by computing the UNION of their ASI risk mappings (a cell is "broken" if ANY matched pattern implicates it).

**Data model for multi-pattern results:**
```typescript
interface DiagramAnalysisResult {
  patterns: {
    id: string;
    confidence: number;
    reasoning: string;
  }[];
  // For the evaluator:
  effectiveASIRisks: {
    asiId: string;
    aggregateWeight: number;  // max(weights across matched patterns)
    contributingPatterns: string[];
  }[];
}
```

**Aggregation rule:** When multiple patterns map to the same ASI risk, use the MAXIMUM weight (not sum). This prevents over-counting while preserving the strongest signal.

**Confidence:** 0.85

---

## Summary: Data Architecture Position

Pattern-to-ASI mappings follow the **existing `RISK_TO_ASI` schema** (weighted, rationalized, confidence-annotated). Definitions are **static in Phase 1, versioned via git**. Ground truth validation uses **24 reference diagrams** with precision ≥ 0.85 target. Client-side persistence stores **last 5 analyses** in localStorage (no full images). Multi-pattern results use **max-weight aggregation** across matched patterns. Old analyses are **never automatically re-evaluated**.
