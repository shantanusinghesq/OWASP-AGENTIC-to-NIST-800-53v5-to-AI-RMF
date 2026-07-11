# Session Checkpoint — 2026-07-11
**Focus:** 3-persona UX audit + full implementation (PRs #31-35, v0.9.0) + demo evaluation
**Token estimate before:** ~520k
**Token estimate after:** ~2k

Continues from ACC 003 (TRD backlog complete). This session = UX audit → implement every rec → evaluate.

## Decisions
- D: Ran a 3-persona UX audit (OpenAI/clarity, Palo Alto/workflow, Wiz/PLG) of the live app → `docs/UX-AUDIT-2026-07-11.md`. Scores 72/63/61; convergent thesis: "rotate the product 90° — make a **defensible control set** the atomic object; **lead with the evidence** (real incidents), not the map."
- D: Implemented ALL recs across **5 sequenced PRs #31-#35** (each green through ci.yml, squash-merged, live-verified). Package `@haremantra/crosswalk` v0.8.0→**v0.9.0**; tests **67→107**.
- D: Assessment tray uses **provider-tolerant hooks** — `useAssessment()` throws / `useAssessmentMaybe()` returns null — so `SelectToggle` renders nothing without the provider, keeping `App.smoke` + `RiskDetail.validation` tests byte-identical (verified empty diff every PR).
- D: Committee brief = pure `buildBriefHtml()` → `window.open`+`document.write` of a **self-contained light-theme** doc (dark app theme can't leak); `esc()` on every interpolated value (XSS guard). Not a route/iframe.
- D: Package publish uses **publishConfig** to point the published artifact at `dist`; workspace client keeps consuming raw `src` (no build coupling). Simulator **React.lazy** code-split (main bundle 879→741 KB + 142 KB lazy chunk). Hero image **self-hosted** (`client/public/hero-banner.webp`, dropped CloudFront) + preload.
- D: Governance bridge (ISO 42001 / EU AI Act / SR 11-7) shipped as explicit **editorial v1** (`FRAMEWORK_REFS`), UI-labelled "Editorial v1 · verify before use" — NOT authoritative.
- D: `?risk=ASI0X` permalink additive to frozen `?tab=`; heatmaps severity-ranked (`bySeverity`, `client/src/lib/severity.ts`) with exposure-total columns.
- D: Demo evaluated by **generating real deliverables via the app's pure export fns** (not narration/browser/re-audit) → `docs/scratchpad-demo-evaluate-updated-app.md`. Verdict **PASS**: 5/5 persona jobs now complete end-to-end (were 0/5), 14/14 recs present, 107 tests green.

## Current State
- main @ `b2e3390` (after #35); `crosswalk-v0.9.0` published + deployed; live 200; **107 tests / 26 files**.
- New feature slice `client/src/features/assessment/` (types, storage, AssessmentContext, coverage, SelectToggle, AssessmentTray, TraySelectionList, AnnotationEditor, GapSummary, export-json, export-oscal, brief, BriefExport + tests).
- New: `client/src/components/TrustBar.tsx`, `client/src/lib/{severity,download}.ts`, `client/public/hero-banner.webp`.
- Package: `FRAMEWORK_REFS` + `FrameworkRefs` (data.ts); `buildOscalMapping`/`OscalMapping`/`OscalMappingEntry` re-exported via adapter `client/src/data/crosswalk.ts` (still SOLE package importer); `computeValidationMix`/`VALIDATION_MIX` added to adapter.
- Docs: `docs/UX-AUDIT-2026-07-11.md`, `docs/scratchpad-demo-evaluate-updated-app.md`, `docs/acc/003` (TRD backlog).
- `demo-artifacts/` (committee-brief.html, scoped-oscal.json, assessment.json) = throwaway eval outputs, **untracked, NOT committed**.
- New localStorage keys: `agentic_assessment_working_v1`, `agentic_assessments_v1`, `explorer-primer-dismissed-v1`.
- Repo `HANDOFF.md` still STALE (2026-05-01) — use CHANGELOG/TRD/this ACC.

## Open Questions
- Q: `FRAMEWORK_REFS` is unverified editorial — needs practitioner review before any citation use (UI already flags this).
- Q: `demo-artifacts/` disposition — gitignore or delete (currently untracked, uncommitted).
- Q: Deferred UX items — per-risk prerendered OG images (needs a prerender/SSR pipeline); fully authoritative multi-framework mapping (only editorial v1 shipped); `?sel=` URL selection-share (designed in the tray-arch plan, NOT built).
- Q: Pre-UX editorial debt from ACC 003 still open — ~107 OSCAL title divergences + 65 Tier-2 rationale-cross-reference (both report-only, non-blocking).

## Rejected Approaches
- X: Browser click-through / Playwright to evaluate the app — rejected: client-rendered SPA can't be driven from this session; pure-function artifact generation is stronger + reproducible.
- X: Re-run the 3 auditor subagents to re-score — rejected: they can't see the rendered SPA either (fetch returns the shell); opinion, not measurement.
- X: Nest `frameworkRefs` inline in the 10 CROSSWALK entries — rejected: fragile multiline edits; used a separate keyed `FRAMEWORK_REFS` const instead.
- X: Repoint package main/types/exports to `dist` directly — rejected: couples the workspace client's build to a prebuilt package; used `publishConfig` override so only the *published* package points at dist.

## Next Actions
1. (Optional, human layer) Live click-through per `docs/scratchpad-demo-evaluate-updated-app.md` §"human layer"; open `demo-artifacts/committee-brief.html` in a browser.
2. (Optional) Decide `demo-artifacts/` disposition — add to `.gitignore` or delete.
3. (Optional) Practitioner review of `FRAMEWORK_REFS` before promoting it above editorial.
4. (Optional, backlog from ACC 003) Editorial pass on the 107 OSCAL title divergences; promote Tier-2 checks whose count is 0 — `packages/crosswalk/src/nist-control-descriptions.ts`, `packages/crosswalk/tests/editorial-quality.test.ts`.
5. Otherwise: UX overhaul complete — no required action. Verify anytime with `pnpm check && pnpm test && pnpm build`.
