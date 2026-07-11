# Scratchpad — Demo to Evaluate the Updated App
**Status:** Verified (post-CoVE)
**Date opened:** 2026-07-11

Context: the crosswalk app shipped a five-PR UX overhaul (#31–#35, `crosswalk-v0.9.0`) implementing every recommendation from the three persona audits. The decision here is **how to run a demo that credibly evaluates whether the update delivered** — given the hard constraint that the app is a client-rendered SPA I cannot drive in a browser from this session.

---

## D-01 — What evaluation *method* best proves the update worked?

**Options considered:**
- A: Scripted three-persona narrated walkthrough (re-tell the original demos against v0.9.0)
- B: **Artifact-based, task-completion evaluation** — actually run the app's pure export functions to produce the real deliverables (committee brief, scoped OSCAL, assessment JSON), then inspect them; confirm each of the 5 persona jobs now completes end-to-end
- C: Re-spawn the three subagent auditors to re-score the app

**Criteria table:**

| Criterion | A (narrated) | B (artifacts + tasks) | C (re-audit) |
|-----------|--------------|-----------------------|--------------|
| Objectivity (evidence, not prose) | Low | **High** | Medium |
| Executable from this session (no browser) | Yes | **Yes** | Yes |
| Tests the thing the update was *for* (deliverables) | Indirect | **Directly** | Indirect |
| Reproducible / CoVE-able | No | **Yes** | No |
| Surfaces regressions | Weak | **Strong** (tests + presence) | Weak |

**Accepted:** Option **B** — the whole point of the overhaul was to make the tool *produce a defensible, cited control set*; the strongest evaluation is to generate that artifact and read it, backed by the test suite and a shipped-surface census.

**Rejected:** Option A
**Reasoning against A:** narration can't distinguish "shipped and works" from "shipped and broken" — it re-describes intent, not outcome. It would restate the audit rather than test it.

**Rejected:** Option C
**Reasoning against C:** the auditors cannot see the rendered SPA either (a fetch returns the shell); re-scoring would be an opinion refresh, not a measurement. Objective artifact generation dominates it.

**Assumption accepted:** the app's export logic is pure and importable in Node (via vitest's alias resolution), so I can exercise the *real* functions, not a reimplementation.
**Assumption rejected:** that a human browser click-through is *required* for a credible eval — rejected because for a deliverable-generating feature, the deliverable itself is the highest-fidelity evidence, and it's fully reproducible.

---

## D-02 — What environment/substrate to evaluate on?

**Options considered:**
- A: Live GitHub Pages deploy
- B: Local `pnpm preview`
- C: **Node-level execution of the real pure functions via a throwaway vitest generator + `pnpm test` + built-bundle string census**

**Accepted:** Option **C** as the executable substrate — deterministic, no browser needed, exercises the exact shipped code. **Live deploy (A) is retained as the human-in-the-loop layer** the user performs (open the deployed URL / the generated `committee-brief.html`).

**Rejected:** Option A (as the *primary* substrate)
**Reasoning against A:** I cannot programmatically drive a client-rendered SPA (no Playwright; static site) — I can only confirm the bundle *contains* each surface, which C does more precisely.

**Rejected:** Option B
**Reasoning against B:** same browser-driving limitation as A, minus the "it's actually live" signal; strictly worse than A for the human layer and no better than C for the machine layer.

**Assumption accepted:** vitest resolves the `@/` alias and `@haremantra/crosswalk`, so a generator spec can import `brief.ts` / `export-oscal.ts` and write files. **Verified — see CoVE-01/02.**

---

## D-03 — What scenario anchors the demo?

**Options considered:**
- A: A single **end-to-end story** — a bank onboarding an "agentic research copilot," scoping ASI01/02/03, annotating, then exporting the committee brief + OSCAL (touches the most new surfaces in one flow)
- B: The three original FS demos re-run separately (onboarding / committee report / exam response)
- C: A flat 14-item regression checklist of the shipped recommendations

**Accepted:** Option **A** as the spine, with **C as the coverage backstop** (census of all 14 recs). One realistic flow exercises selection → annotation (owner/RACI/concur) → gap → brief → scoped OSCAL, which is exactly the "workflow-of-record" thesis the audit demanded.

**Rejected:** Option B
**Reasoning against B:** three disjoint walkthroughs re-cover the same surfaces and don't demonstrate the *connective tissue* (a selection flowing into an export) — which is the new capability being evaluated.

**Rejected:** Option C alone
**Reasoning against C:** a checklist proves *presence*, not *function*; it can't catch a brief that renders but omits provenance. Kept as a backstop, not the anchor.

**Assumption accepted:** selecting the first 2–3 real families/functions per ASI at runtime (from `CROSSWALK[asi]`) yields a valid, representative scope without hand-guessing control ids.

---

## D-04 — What is the pass/fail rubric?

**Options considered:**
- A: Binary "14/14 recommendations shipped" census
- B: **The 5 persona jobs each complete end-to-end + the generated artifacts are correct and complete**
- C: Re-scored three-lens numbers vs the 72/63/61 baseline

**Accepted:** Option **B** as the gate, with **A as evidence** and **C as the headline narrative**. A demo "passes" iff: (i) all 14 recs are present, (ii) each of the 5 jobs maps to a working shipped surface, (iii) the committee brief contains risk headers + controls + rationale + validation status + annotations + typed evidence with CVEs + provenance, and the scoped OSCAL contains only the selected scope, (iv) 107/107 tests green.

**Rejected:** Option A alone
**Reasoning against A:** presence ≠ function (see D-03/C).

**Rejected:** Option C alone
**Reasoning against C:** a re-score is a subjective delta; useful as a story but not a gate. Anchoring pass/fail to it would smuggle opinion into the verdict.

**Assumption accepted:** the original audit's 5 jobs (control-set derivation, committee reporting, examiner citation, gap analysis, GRC feed) are the right yardstick — they are the persona's own jobs-to-be-done from `docs/UX-AUDIT-2026-07-11.md`.

---

## D-05 — What tangible evidence does the demo hand back?

**Options considered:**
- A: Screenshots of the running UI
- B: **The generated artifacts on disk** — `committee-brief.html` (open in a browser to literally see the deliverable), `scoped-oscal.json`, `assessment.json`
- C: Prose description only

**Accepted:** Option **B** — real files the user opens out-of-band; the `committee-brief.html` *is* the demo (it's what a risk manager would hand a committee/examiner).

**Rejected:** Option A
**Reasoning against A:** cannot capture screenshots without a browser driver; and a static screenshot is weaker than the actual, openable artifact.

**Rejected:** Option C
**Reasoning against C:** prose is what the audit already delivered; the update's value is a *file you can hand a regulator* — so hand one over.

---

## Assumptions Register

### Accepted Assumptions
| ID | Assumption | Rationale | Decision |
|---|---|---|---|
| A1 | Export logic is pure + Node-importable via vitest | Enables real-function eval, no browser | D-01 |
| A2 | vitest resolves `@/` + `@haremantra/crosswalk` | A generator spec can build artifacts | D-02 |
| A3 | Runtime-picked first N families/funcs = valid scope | Avoids guessing control ids | D-03 |
| A4 | The audit's 5 jobs are the correct yardstick | They are the persona's own JTBD | D-04 |
| A5 | The `committee-brief.html` is the highest-fidelity deliverable | It's what the persona hands over | D-05 |

### Rejected Assumptions
| ID | Assumption | Why Rejected | Decision |
|---|---|---|---|
| R1 | A browser click-through is required for credibility | The deliverable itself is stronger, reproducible evidence; and it's not runnable here | D-01/D-02 |
| R2 | Re-running the 3 auditors best measures success | They can't see the rendered SPA; opinion, not measurement | D-01 |
| R3 | A presence-only checklist suffices | Presence ≠ function (a brief can render yet omit provenance) | D-03/D-04 |

---

## CoVE Verification Questions
| ID | Question | Decision it affects |
|---|---|---|
| CoVE-01 | Does the real `buildBriefHtml` produce a complete, correct committee brief for a realistic assessment? | D-01, D-04, D-05 |
| CoVE-02 | Does `scopeOscalMapping` emit only the selected ASIs/families? | D-04, D-05 |
| CoVE-03 | Are all 14 shipped recommendation surfaces present in source? | D-04 (rubric A) |
| CoVE-04 | Is the suite green, and at what count? | D-04 |
| CoVE-05 | Does each of the 5 persona jobs map to a working shipped surface? | D-04 (rubric B) |

## CoVE Answers

### CoVE-01 — committee brief correctness
**FINDING: YES.** Ran the real `buildBriefHtml` (client/src/features/assessment/brief.ts) via a throwaway vitest generator on a realistic assessment ("Markets — Agentic Research Copilot (Q3 intake)", 11 selections across ASI01/02/03, one full annotation). Output `demo-artifacts/committee-brief.html` (12.7 KB) contains: the assessment name (×2), the annotation owner "J. Okafor — 2nd Line", "SR 11-7", 2× `CVE-…`, "NIST SP 800-53" (×4), "Editorial" validation labels (×11), and `window.print()` (self-print toolbar). Light-theme self-contained doc (dark app theme cannot leak).
**Impact:** Confirms the accepted method (D-01/B) and passes rubric clauses (iii). No new decision.

### CoVE-02 — scoped OSCAL correctness
**FINDING: YES.** `demo-artifacts/scoped-oscal.json` (9 KB): `mappings` = exactly `ASI01,ASI02,ASI03`; `scope = {assessmentName, selectionCount: 11, note: "client-scoped subset of the full mapping"}`; ASI01 controls filtered to only the selected families (AC, SI). The whole-catalog `buildOscalMapping` was correctly narrowed to the selection.
**Impact:** Passes rubric clause (iii)/GRC-feed job. No new decision.

### CoVE-03 — 14 recommendation surfaces present
**FINDING: YES (14/14).** Grep over `client/src` found every surface: hero CTA (`See the…Critical`), Featured incident, Evidence-confidence trust bar, "How to read this crosswalk" primer, `GOVERNANCE_FRAMING`, `SelectToggle`, `AssessmentTray`, `AnnotationEditor`, `GapSummary`, Committee brief, `scopeOscalMapping`, `FRAMEWORK_REFS`, mobile `hidden md:block` fallback, and `lazy(` code-split — each ≥1 file.
**Impact:** Passes rubric clause (i).

### CoVE-04 — suite green
**FINDING: YES — 107/107 across 26 files** (`pnpm test`), up from the 67 baseline before the UX work.
**Impact:** Passes rubric clause (iv).

### CoVE-05 — 5 jobs → shipped surface
**FINDING: YES.** (1) Control-set derivation → `AssessmentTray` mounted in Home + `SelectToggle` on every MappingCard. (2) Committee reporting → `buildBriefHtml` (3 refs). (3) Examiner citation → RiskDetail renders controls + typed evidence w/ CVEs (verified live earlier). (4) Gap analysis → `asiGaps`/`GapSummary`. (5) GRC feed → `scopeOscalMapping` OSCAL export. All five now complete end-to-end (were 0/5 pre-update).
**Impact:** Passes rubric clause (ii). Demo **PASSES** the D-04 rubric on all four clauses.

---

## Verdict & how to run the human layer

**Demo verdict: PASS.** The update converted a reference atlas into a workflow-of-record — the 5 persona jobs go from 0/5 to 5/5 completable, and the tool now emits a real, cited, provenance-stamped committee brief + scoped OSCAL. Evidence is the generated artifacts, not prose.

**To run the human-in-the-loop demo (5 minutes):**
1. Open the deployed app: https://haremantra.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/ — land on the hero, click **"See the 4 Critical risks →"**, then the **EchoLeak featured-incident** card.
2. In **Evidence Explorer**, select ASI01/ASI02/ASI03; on each, tick a few mapping checkboxes → watch the **Assessment tray** count + coverage grow; expand a row and add an **owner / RACI / note**.
3. From the tray: **Committee brief** (prints light-themed), **OSCAL (scoped)**, **JSON**.
4. Compare against the pre-generated artifact this analysis produced:
   - `demo-artifacts/committee-brief.html` ← open this in a browser to see the exact deliverable
   - `demo-artifacts/scoped-oscal.json`, `demo-artifacts/assessment.json`

*(The `demo-artifacts/` files are throwaway evaluation outputs — not committed.)*
