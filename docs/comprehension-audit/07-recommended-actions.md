# Recommended Actions — Comprehension Audit Follow-up

**Date:** 2026-07-15
**Source:** `00-sealed-key.md`, `05-scorecard.md`, `06-findings-and-fixes.md`, `r1`–`r4` transcripts (all in this dir, currently **untracked** — nothing here is committed yet)
**Status of the audit itself:** complete and adversarially verified. I spot-checked two of its load-bearing claims against live code (below) — both hold.

---

## What this is (for the record)

A four-persona blind comprehension study of the live v0.9.0 GitHub Pages build, run 2026-07-14. A sealed answer key was frozen from the repo *before* any reader looked at the site; four simulated readers (naive GRC lead, agentic engineer, exec skimmer, model-risk manager) were scored against it; findings were then adversarially verified against the actual source. Headline result:

> **The site transmits its honesty perfectly (4/4 readers, every stage) and its purpose not at all.** The reader the v0.9.0 release was rebuilt for (R4, the model-risk manager) spent an hour searching for the Assessment Tray workflow, couldn't find it, and wrote in their report that it doesn't exist — even with a browser tab from another reader's completed assessment open on their own screen. Gate G4 ("the deliverable lands") **FAILS**.

Root cause, confirmed live: `AssessmentTray.tsx:57` renders `null` until a mapping is already selected, so a reader hunting for the feature is shown proof it doesn't exist.

---

## Decision 1 — Commit the audit artifacts?

`docs/comprehension-audit/` (7 files, ~230KB) is untracked. It's a real, dated, adversarially-verified artifact in the same lineage as `docs/UX-AUDIT-2026-07-11.md` and `docs/acc/004-*.md`. Recommend committing as-is (`docs: comprehension audit — v0.9.0 gate G4 fails, deliverable engine undiscoverable`), same pattern as ACC 004.

**Your call:** commit now, hold until fixes land (so the audit and its fix commit tell one story), or discard.

---

## Decision 2 — Which fixes to greenlight

`06-findings-and-fixes.md` already contains an adversarially-verified prioritized list (refuted claims removed). I'm not re-deriving it — I'm triaging it into what should happen now vs. later, since "recommend actions" implies a sequencing judgment, not just a reprint.

### Ship now — small, unambiguous, no design decision required

| # | Fix | File | Effort |
|---|---|---|---|
| 1 | Give the Assessment Tray a zero-state (`count === 0` → "Tick a mapping to build an assessment"); update the smoke test instead of suppressing the UI | `AssessmentTray.tsx:57-60` + `App.smoke.test.tsx` | S |
| 2 | Fix `asi_id` missing from `ControlEvaluation` — simulator currently reports controls from the *wrong ASI* with that ASI's rationale text | `evaluator.ts:114`, `AnalysisPanel.tsx:53`, `types.ts:90` | S |
| 3 | `prevents` → `constrains` — site currently states a security claim false on its own terms (same page says "agents cannot reliably distinguish instructions from data") | `data.ts:167` | XS |
| 4 | CSV export: add `validationStatus` + `framework` columns; emit the 62 missing AI-RMF rows (CSV currently claims 800-53-only and drops the "unreviewed" flag before it reaches a GRC tool) | `artifacts.ts:31-41, 84-109` | S |
| 5 | Modal: Escape/backdrop close (currently a keyboard trap); point primary CTA at the crosswalk, not the simulator | `HookModal.tsx:135`, `features/onboarding/` | S |
| 6 | User-facing editorial caveat on the Scenario Simulator header (weights are "editorial estimates," currently only in a code comment) | simulator scenario header | XS |

These six are correctness/discoverability bugs with a stated fix and no open design question. #1 is the one that matters most — it's the entire reason G4 failed.

### Needs your judgment before I touch it — design or scope decisions

| # | Item | Why it's not mine to just fix |
|---|---|---|
| 7 | Expand "ASI" on first use, define "prompt injection," legend the 800-53 heatmap columns | Copy/IA decision across multiple screens — where and how much |
| 8 | Bring the validation model on-site instead of linking to `VALIDATION.md` on GitHub | New panel/route — real scope, not a one-line fix |
| 9 | Tray z-index occludes the Provenance & Limitations panel | Straightforward but touches shared layout — flag before I change stacking |
| 10 | Per-family rationale reuse (AC-3/AC-4/AC-6 share one string) — reword per-control or explicitly label as family-level | Editorial decision about the data model, not a bug |

### Explicitly not recommending right now

- Renaming "Compliance Middleware" (K1/H10, 4/4 mis-parse) — real finding, but it's brand/positioning language that shows up in the hero, README, and onboarding modal simultaneously. Bundling it into the same PR as the bug fixes above would blur a mechanical fix commit with an editorial one.
- Reconciling the two contradictory "who this is for" statements (README vs. v0.9.0 persona, finding G3) — same reason.

---

## Suggested execution plan (pending your sign-off)

1. Commit `docs/comprehension-audit/` as-is.
2. One PR for the six "ship now" fixes — they're independently small and touch disjoint files (`AssessmentTray.tsx`, `evaluator.ts`+`AnalysisPanel.tsx`+`types.ts`, `data.ts`, `artifacts.ts`, `HookModal.tsx`, simulator header), so this could run as parallel subagents per file if you want it fast, or I can do it serially in one sitting.
3. Re-run `pnpm test` + the smoke test after #1 specifically, since the audit's own root-cause note says a snapshot test is currently *encoding* the bug (`App.smoke.test.tsx` requires the tray's default-hidden DOM to stay byte-identical).
4. Come back to you on items 7–10 as a separate batch once you've said which of those you actually want.

I have not made any code changes yet — this is the review you asked for. Tell me which of Decision 1 / Decision 2's rows to greenlight and I'll proceed.
