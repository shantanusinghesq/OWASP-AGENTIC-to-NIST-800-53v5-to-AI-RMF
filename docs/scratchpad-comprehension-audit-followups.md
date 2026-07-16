# Scratchpad — Comprehension Audit Follow-ups (items 7–10)
**Status:** Draft (post-CoVE)
**Date opened:** 2026-07-15

Source: `docs/comprehension-audit/07-recommended-actions.md`, Decision 2, "needs your judgment" table. These are the four findings the comprehension audit surfaced that are design/scope decisions, not mechanical bug fixes — deliberately not bundled into the six "ship now" fixes.

---

### D-01 — How should vocabulary/legend fixes (item 7) ship: expand "ASI," define "prompt injection," legend the 800-53 heatmap?

**Options considered:**
- A: One bundled copy/IA PR touching hero, `RiskDetail`, and the heatmap simultaneously
- B: Three independent small diffs, one per surface (hero acronym expansion, `RiskDetail` prompt-injection definition, heatmap legend)
- C: Defer until the README-vs-v0.9.0 audience contradiction (finding G3) is resolved, since tone/reading-level depends on who you're writing for
- D: Build a shared first-use glossary/tooltip pattern reused across all three surfaces

**Accepted:** Option B — three independent diffs, each reviewable and revertable on its own, since the three surfaces are unrelated components with no shared logic.

**Rejected:** Option A
**Reasoning against A:** Bundling forces all-or-nothing review across three unrelated screens. If the heatmap legend design is contested but the ASI expansion isn't, blocking one blocks the other two for no reason.

**Rejected:** Option C
**Reasoning against C:** Defining "ASI" or "prompt injection" is true regardless of who the audience turns out to be — R1 (the audit's own naive-reader persona) finished a full session not knowing what ASI stands for. That's a baseline-correctness gap, not something contingent on the unresolved audience question. Blocking a mechanical fix on an unrelated open decision is over-scoping.

**Rejected:** Option D
**Reasoning against D:** This is three isolated text/legend fixes, not a recurring pattern yet. Building shared glossary infrastructure for three call sites is the kind of premature abstraction this project's conventions explicitly warn against — three similar lines beat a premature abstraction.

**Assumption accepted:** shadcn/ui already ships a `Tooltip` primitive (`client/src/components/ui/tooltip.tsx`), so "define on first use" doesn't require new UI infrastructure — confirmed via CoVE-01.
**Assumption rejected:** that a full glossary page/route is needed to solve this — rejected; that's item 8's territory (validation methodology), not vocabulary, and conflating the two would re-introduce the "new IA surface" scope creep D-02 explicitly avoids.

---

### D-02 — Bring the validation model on-site (item 8), or improve the off-tool link?

**Options considered:**
- A: New dedicated route/page rendering `VALIDATION.md` in full
- B: Expand the existing `ProvenancePanel` with a summarized, expandable "Validation model" section — full doc stays linked for readers who want every clause
- C: Keep the GitHub link, just make it more prominent/better-worded
- D: Render `VALIDATION.md` in a modal triggered from the existing "How mappings are validated" link

**Accepted:** Option B — extend the existing credibility surface (`ProvenancePanel`) rather than add new navigation, and summarize rather than reproduce the full document verbatim.

**Rejected:** Option A
**Reasoning against A:** A new route adds nav surface and IA the audit didn't ask for. The actual finding is "R4 wanted three paragraphs of methodology without leaving the tool" — a full mirrored doc-site is overbuilt for that.

**Rejected:** Option C
**Reasoning against C:** Already tried, in effect — the link already exists ("How mappings are validated" / "Read the validation model") and the audit found it fails anyway: R4 *"wanted it badly and logged the urge rather than following it."* The problem is off-tool, not under-labeled.

**Rejected:** Option D
**Reasoning against D:** The audit already flags the onboarding modal as a keyboard trap and a source of lost trust (findings F6/H6, M9). Introducing a second modal for critical trust content risks repeating that exact failure mode instead of fixing it.

**Assumption accepted:** `ProvenancePanel` is the right existing home — it's already the credibility surface readers reach for (per findings F10/H9, the readers who go looking for methodology already look at Provenance & Limitations).
**Assumption rejected:** that the full `VALIDATION.md` (all three tiers, thresholds, definitions) needs to be reproduced verbatim on-site — rejected in favor of a summary; the doc's length is itself part of why it isn't inlined today, and a summary-plus-link keeps the audit-grade full text available without duplicating a maintenance surface.

---

### D-03 — How to stop the tray from occluding the Provenance & Limitations panel (item 9)?

**Options considered:**
- A: Fix the spacer/reserved-space calculation so it matches the tray's actual rendered height (collapsed vs. expanded), instead of a fixed guess
- B: Auto-collapse the tray when the user scrolls near the footer
- C: Redesign the collapsed tray to have a smaller footprint

**Accepted:** Option A, refined by CoVE-02 below — this is a pure sizing bug, not a missing feature.

**Rejected:** Option B
**Reasoning against B:** Scroll-triggered auto-collapse is new interaction behavior for what is, on inspection, a static sizing bug. It adds flicker/jank risk for a problem that doesn't need new state.

**Rejected:** Option C
**Reasoning against C:** Doesn't address the actual defect. R1's transcript reports the overlap happens with the tray in its normal state and is only escaped *by* collapsing it — the collapse affordance already exists; shrinking it further doesn't fix the underlying miscalculation.

**Assumption accepted (pre-CoVE):** this is a pure CSS layout bug, fixable without touching tray state/logic.
**Assumption rejected:** that new interaction design is required — rejected per above, confirmed by CoVE-02.

---

### D-04 — Per-family rationale reuse (item 10): rewrite per-control, relabel, or defer?

**Options considered:**
- A: Write distinct per-control rationale text for all 89 mappings (full editorial rewrite)
- B: Keep the shared family-level rationale, but restructure the UI/copy to present it honestly as family-level ("Why this family") rather than implying per-control justification
- C: Hybrid — bespoke rationale for the highest-severity mappings first, family-level for the rest, staged over time
- D: Defer — log to the roadmap doc, no near-term change

**Accepted:** Option B — relabel to match what the data actually is; treat full per-control rewrite as a separate, larger editorial roadmap item, not a blocker to shipping the honesty fix now.

**Rejected:** Option A
**Reasoning against A:** This is a single-author editorial undertaking across 89 mappings with no stated timeline (per `ProvenancePanel`'s own "single-author provenance" disclosure). Treating a full rewrite as the immediate fix means shipping nothing now.

**Rejected:** Option C
**Reasoning against C:** A staged rollout creates an inconsistent product mid-migration — some controls get bespoke rationale, most don't — with no visible marker distinguishing which is which. For a product whose entire differentiator is honesty about validation status (the audit's own headline finding: this is the one thing that transmits perfectly and must not be traded away), a silent partial-rewrite is a regression risk, not an improvement, until it's finished. That's also a half-finished implementation, which this project's conventions rule out.

**Rejected:** Option D
**Reasoning against D:** Leaves a live, adversarially-confirmed misleading-precision defect unaddressed (R1 explicitly downgraded trust in their memo because of it: *"That is the difference between this being a scoping input and being an assessment"*). The audit's own conclusion is that the honesty layer is load-bearing and must be protected — doing nothing lets a precision-honesty gap stand uncorrected while a cheap truthful fix is available.

**Assumption accepted:** relabeling is achievable without new data — confirmed via CoVE-03: `rationale` is stored as one string per `{family, controls[]}` entry in `CROSSWALK`, i.e. it already *is* family-level data; the UI just doesn't say so.
**Assumption rejected:** that per-control rationale could be auto-generated/templated from the family string — rejected; that would fabricate specific-sounding justification without new grounding, which `VALIDATION.md`'s evidence standard already prohibits for causal claims.

---

## Assumptions Register

### Accepted Assumptions
| ID | Assumption | Rationale | Decision |
|---|---|---|---|
| A1 | A `Tooltip` UI primitive already exists in the codebase | Avoids building new UI infra for a 3-surface text fix | D-01 |
| A2 | `ProvenancePanel` is the correct existing surface to extend for validation-methodology content | It's already the credibility surface readers reach for per audit findings F10/H9 | D-02 |
| A3 | The tray/footer overlap is a pure CSS sizing bug | Confirmed by CoVE-02 — a fixed-height spacer under-reserves space for the tray's dynamic expanded height | D-03 |
| A4 | Rationale is already stored at family granularity in the data model | Confirmed by CoVE-03 — relabeling is a copy/structure change, not a data migration | D-04 |

### Rejected Assumptions
| ID | Assumption | Why Rejected | Decision |
|---|---|---|---|
| R1 | A full glossary/tooltip system is warranted now | Only 3 call sites exist; premature abstraction for the current scope | D-01 |
| R2 | The full `VALIDATION.md` needs to be reproduced verbatim on-site | Doc length is part of why it isn't inlined today; a summary + link serves the actual finding | D-02 |
| R3 | Fixing the tray overlap requires new scroll-based interaction | The defect reproduces in the tray's normal (non-scrolled) state; it's a static miscalculation | D-03 |
| R4 | Per-control rationale can be safely auto-generated from the family string | Would fabricate specific-sounding justification without new grounding, against `VALIDATION.md`'s own evidence standard | D-04 |

---

## CoVE Verification Questions
| ID | Question | Decision it affects |
|---|---|---|
| CoVE-01 | Does the codebase already have a reusable Tooltip component? | D-01 |
| CoVE-02 | Is the tray/footer overlap a static height-calculation bug, and where exactly? | D-03 |
| CoVE-03 | Is `rationale` stored per-family or per-control in `CROSSWALK`? | D-04 |

## CoVE Answers

### CoVE-01 — Does the codebase already have a reusable Tooltip component?
**FINDING:** YES. `client/src/components/ui/tooltip.tsx` exists (shadcn/ui primitive).
**Impact:** Confirms D-01/A1 — no new UI infrastructure needed for the vocabulary fixes.

### CoVE-02 — Is the tray/footer overlap a static height-calculation bug, and where exactly?
**FINDING:** YES. `client/src/features/assessment/AssessmentTray.tsx:97-101` renders a spacer `<div className="h-14" />` (56px, fixed) immediately before the tray itself, which is `fixed bottom-0 inset-x-0 z-40` (`:99-101`). The spacer's height matches only the *collapsed* bar. When `expanded` is true, the tray grows to `max-h-[70vh]` (`:104`) but the spacer does not grow with it — so the page content underneath (including the footer/`ProvenancePanel`) is still reserved only 56px of clearance while the actual tray can occupy up to 70% of viewport height. This exactly matches R1's transcript: the overlap occurs in the tray's normal state and is escaped only by manually collapsing it.
**Impact:** Confirms D-03/A3 and sharpens the fix: it's not "add padding" from scratch — it's "make the spacer's reserved height track the tray's actual current height" (e.g., conditional height class tied to `expanded`, or a measured/ref-based height instead of a hardcoded `h-14`).

### CoVE-03 — Is `rationale` stored per-family or per-control in `CROSSWALK`?
**FINDING:** Per-family. `packages/crosswalk/src/data.ts:164-167` (ASI01 example): each `nist53[]` entry has the shape `{ family, controls: string[], rationale: string, validationStatus }` — one `rationale` string attached to a `controls` array that can hold 2–3 individual control IDs (e.g., AC-3/AC-4/AC-6 share one `rationale` under `family: "AC"`).
**Impact:** Confirms D-04/A4 — "relabel as family-level" requires no schema change or data migration, only a UI/copy change to stop implying per-control specificity that the data was never structured to carry.

---

**Next step:** these four decisions are recommendations for approval, not yet implemented. Once you greenlight some or all, I'll scope each into a small diff — D-01 and D-03 are the cheapest (no new components, confirmed-precise fix locations); D-02 and D-04 involve writing new summary/label copy and are slightly larger.
