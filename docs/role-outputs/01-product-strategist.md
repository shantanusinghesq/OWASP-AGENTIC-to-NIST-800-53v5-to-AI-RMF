# Role 1: Product Strategist — Answers

**Context consumed:** Full chat history (80 days, 48 commits), builder assessment, progressive disclosure evaluation, implementation plan, all pasted user specifications, OWASP_ASI data model, scrambler-types, scrambler-evaluator, scrambler-mappings.

---

## Q1.1: Primary User & Use Case

**Inferred answer:** Both — but weighted 70% post-deployment auditors, 30% pre-deployment architects.

**Evidence from codebase/chat:**
- The product title "Compliance Middleware" and the crosswalk structure (OWASP ASI → NIST 800-53 → AI-RMF) is an *audit artifact*. It answers "are we covered?" not "how should we build?"
- The Evidence Explorer tab is investigative — users search for specific controls and examine rationale/evidence. This is auditor behavior.
- The Scenario Simulator is *exploratory* — users test hypothetical patterns to understand risk. This serves both architects (pre-deployment: "what happens if we use a Swarm?") and auditors (post-deployment: "our system is a Swarm, what's our exposure?")
- The user's feature request ("take a diagram from Miro") implies an existing architecture being analyzed — this is post-deployment auditing behavior.
- However, the user also said "generate a query to a datastore of design patterns" — this implies the feature could also serve architects evaluating pattern choices.

**Confidence:** 0.75

**Strategic implication:** The feature should present results as *risk exposure* (auditor framing: "here's what's broken") rather than *design guidance* (architect framing: "here's how to build safely"). The remediation section can serve architects, but the primary flow is diagnostic.

**Assumption to validate:** None — the codebase evidence is strong enough to proceed with auditor-primary framing.

---

## Q1.4: Output Scope

**Inferred answer:** Full report with confidence breakdown, remediations, and exportable artifact.

**Evidence from codebase/chat:**
- The user explicitly said "produce report" — not "show results" or "display patterns"
- The existing simulator already produces: heatmap + cascade topology + analysis panel + bias chart
- The user said "the output is the same UI as today" — meaning the heatmap/cascade/panel output
- The builder assessment identified "PDF export" as a feature mentioned twice but never built — this is a latent need
- The user's maturity stage (Orchestrator) suggests they want *shareable artifacts*, not just interactive views

**Recommended output scope:**
1. **Confidence breakdown** — Yes. Show which patterns were matched and why (reasoning from LLM). This builds trust.
2. **Remediations** — Yes. The existing `mitigations` field in `ControlEvaluation` already provides this per-control. Pattern-level mitigations should be added.
3. **Lock-in and re-run** — Yes. Users should be able to override matched patterns and regenerate. This is the "human review" step.
4. **Exportable artifact** — Yes. PDF/Markdown report containing: matched patterns, confidence scores, heatmap snapshot, broken controls, remediations. This is the compliance deliverable.

**Confidence:** 0.9

---

## Q7.1: Accuracy Metrics

**Inferred answer:** Precision > Recall. Target: 85% precision, 75% recall.

**Evidence from codebase/chat:**
- The product is a *compliance tool*. False positives (incorrectly flagging a pattern) are worse than false negatives (missing a pattern). A false positive generates unnecessary compliance work. A false negative means the user adds the pattern manually.
- The existing scrambler-mappings.ts already states "Weights are editorial estimates. Practitioner validation required." The product has always operated at ~0.78 confidence. Users expect imperfection.
- The fallback to manual selection means false negatives are recoverable. False positives are not (user may not notice the incorrect pattern).

**Success definition:**
- **Phase 1 (MVP):** Users upload a diagram, get a recognizable pattern match 85% of the time, and generate a useful report. "Useful" = the matched pattern's ASI risks are relevant to the actual architecture.
- **Phase 2:** Users trust the system enough to skip manual verification for high-confidence matches (>0.85).

**Measurement approach:**
- Create 24 reference diagrams (2 per pattern × 12 patterns)
- Run each through the analyzer
- Calculate precision and recall per pattern
- Iterate on the LLM prompt until precision ≥ 0.85

**Confidence:** 0.85

---

## Q7.2: Adoption Metrics

**Inferred answer:** Feature adoption measured by "diagram uploads per active user per month."

**Evidence from codebase/chat:**
- The product currently has no analytics infrastructure (no tracking events, no user identification beyond localStorage)
- The user's maturity assessment identified "no CI/CD pipeline actually runs" — analytics are likely not instrumented
- However, the progressive disclosure evaluation recommended analytics to validate the Overview landing

**Recommended metrics (in priority order):**
1. **Upload rate:** % of sessions that include a diagram upload (target: 15% within 60 days of launch)
2. **Completion rate:** % of uploads that result in a generated report (target: 80%)
3. **Override rate:** % of analyses where user manually corrects the pattern (target: <20% — indicates accuracy)
4. **Time-to-report:** Median time from upload to report generation (target: <15 seconds)
5. **Return rate:** % of users who upload a second diagram within 7 days (target: 30%)

**Confidence:** 0.7 (metrics are aspirational without analytics infrastructure)

---

## Q7.3: User Satisfaction

**Inferred answer:** Lightweight feedback mechanism (thumbs up/down per analysis) + correction tracking.

**Evidence from codebase/chat:**
- The user's builder assessment identified "write acceptance criteria before your next feature prompt" as the critical growth edge. A feedback mechanism serves this purpose — it's the acceptance criteria from the user's perspective.
- The existing product has no feedback mechanism. Adding one is low-effort and high-signal.

**Recommended approach:**
1. After report generation, show: "Was this analysis accurate? [👍] [👎]"
2. If 👎, show: "What was wrong? [Pattern incorrect] [Missing pattern] [Other]"
3. Store corrections in localStorage (Phase 1) or server-side (Phase 2)
4. Use corrections to refine the LLM prompt over time (manual process, not automated)

**Confidence:** 0.8

---

## Q8.4: Rollback & Versioning Strategy

**Inferred answer:** Pattern definitions are versioned. Old analyses remain valid with their original version. No automatic re-evaluation.

**Evidence from codebase/chat:**
- The existing CROSSWALK is static (hardcoded in data.ts). It has no versioning.
- The scrambler-mappings.ts includes "Decision Point: DP-02 (confidence 0.78)" — suggesting the author expects these to evolve.
- The builder assessment noted "data is hardcoded, not fetched" as a medium-severity limitation.
- The user said "sqlite local install through github local install" — this implies the pattern datastore lives in the repo and is versioned via git commits.

**Recommended versioning model:**
- Pattern definitions are versioned via git (each commit to `agentic-patterns.ts` or `patterns.db` is a version)
- Each analysis stores the pattern version used (e.g., `"analyzed_with": "patterns-v1.0"`)
- Old analyses are NOT re-evaluated when patterns change (too complex, too risky)
- Users can see "This analysis used Pattern Taxonomy v1.0" in the report footer
- If patterns change significantly, show a banner: "Pattern definitions have been updated. Re-analyze your diagram for the latest results."

**Confidence:** 0.85

---

## Summary: Product Strategy Position

The feature serves **compliance auditors analyzing existing agentic AI systems**. It produces a **full diagnostic report** (same UI as simulator + exportable PDF). Success is measured by **upload rate, accuracy (precision > recall), and completion rate**. Pattern definitions are **versioned via git** and old analyses remain valid. The feature is **AI-assisted with human review** (users can override matched patterns before generating the report).
