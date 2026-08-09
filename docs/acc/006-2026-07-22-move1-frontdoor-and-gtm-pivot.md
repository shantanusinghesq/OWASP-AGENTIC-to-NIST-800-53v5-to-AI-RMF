# Session Checkpoint — 2026-07-22
**Focus:** PR#41 merged; GTM pivot (5 mock interviews + findings); Move 1 analyzer front door shipped TDD; Gemini/Ultra vision decision
**Token estimate before:** ~320k
**Token estimate after:** ~1.8k

Continues [[005-2026-07-22-governance-bridge-fix-and-product-thesis]] (governance-bridge ISO fix + PM thesis). This checkpoint = everything after that.

## Decisions
- D: PR #41 squash-merged (`bd1ed96`) → `@shantanusinghesq/crosswalk` v0.10.0 on `main`; Pages redeployed, public site now serves corrected ISO clauses.
- D: **GTM redirect (user): "lighten up."** Drop the ISO-standard purchase + running real conversations as near-term focus. This is a solo OSS POC; priority = SHIP for adoption before the window passes. Sales playbook was the wrong instrument. Supersedes the "full reactivate" direction.
- D: PM-01 = **No** (no design-partner outreach 2026-05-21→now) — recorded in `docs/role-outputs/08-product-manager.md`. Direction briefly "full reactivate," then superseded by the product/adoption redirect above.
- D: Ran 5 adversarial mock interviews (personas 1-5), both-sides, under anti-laundering guardrails (buyer must not fold to fluency; mark where scripted buyer went easier than real). NOT market signal — rehearsal only.
- D (Tier-A findings, robust — act on): **F1** opener is segment-specific and the ISO-gap opener is its weakest cut (dead on all 3 sophisticated cold buyers; live only via SR 11-7 for financial, via the incident for ops). **F2** editorial-status ceiling caps every citable/high-stakes use → practitioner-review promotion is commercially load-bearing. **F3 (biggest)** product is missing a 3rd leg = **ENFORCEMENT (pipeline gate)**; assess→evidence→enforce; for the operator segment it's the only leg that counts.
- D (Tier-B findings, setup-contaminated — re-point the experiment, do NOT rewrite the plan): F4 budgeted demand looked technical/ops not legal; F5 warmest-fit≠purchasing-authority. Both partly restate persona params I chose.
- D: **Move 1 chosen + shipped** = un-bury the diagram analyzer to the front door, key-free, via TDD. Root problem: analyzer was buried in the Scenario Simulator sidebar AND its vision is silently dead on the public site (needs `VITE_FRONTEND_FORGE_API_KEY`, never in the public bundle → degrades to manual-only).
- D: Move 1 design = "analyze" is first `ViewType`/tab; `DiagramAnalyzer` gets `variant="inline"` (non-modal page surface); shared `snapshotFromDiagram()` helper; Home hand-off (setActiveScenario + navigate to simulator) + simulator hydration effect renders it.
- D: Vision model = **Gemini 2.5 Flash-Lite** (`gemini-2.5-flash-lite`) — image UNDERSTANDING (not generation; ignore Nano Banana). Capable enough for 12-pattern classification, near-free. Upgrade path = 3.5 Flash. Skip 3.1 Pro (overkill, lost free tier Apr 2026).
- D: Delivery flipped by new info — **user is on Google AI Ultra = $100/mo Google Cloud credits toward Gemini API.** Makes a serverless proxy viable at ~$0 (≈330K Flash-Lite analyses/mo within credit). Rec: ship BYO-key first (fast/static), then proxy-on-Ultra-credits as the zero-friction default. **Hard Cloud budget cap ≤$100 + per-IP rate limit is non-negotiable** (public endpoint on personal credits).

## Current State
- `main` @ `bd1ed96`; crosswalk v0.10.0 published; Pages live + correct.
- **Move 1 UNCOMMITTED, ON `main` (not a branch).** Modified: `client/src/components/ViewTabs.tsx`, `client/src/features/diagram/DiagramAnalyzer.tsx`, `client/src/features/simulator/ScenarioSimulator.tsx`, `client/src/pages/Home.tsx`. New: `client/src/App.analyze.test.tsx`, `client/src/components/ViewTabs.test.tsx`, `client/src/features/diagram/DiagramAnalyzer.inline.test.tsx`, `client/src/features/diagram/engine/to-snapshot.ts`.
- Gates: `pnpm check` clean; **123 tests pass** (was 117), stable across 4 full-suite runs; `pnpm build` clean. Fixed a flake: React.lazy analyzer stalled >6s under worker contention → warm module cache in `App.analyze.test.tsx`.
- Live-verified (Playwright): analyze = first tab, renders inline non-modal, key-free 12-pattern manual path, pick pattern→Generate→hands to simulator→result renders (hydration works), no horizontal scroll, only console error = favicon 404.
- GTM artifacts in `~/linuxshanti/scratchpad/`: `2026-07-22-reactivation-kit.md`, `-mock-interview-insider.md`, `-mock-interview-findings.md`, `-agentic-ai-risk-controls.md` (18-control checklist).
- `HANDOFF.md` STALE (2026-05-01, v0.2.0).

## Open Questions
- Q: Commit Move 1 — uncommitted on `main`; needs a branch off `origin/main` before commit/PR (repo squash convention; `main` unprotected).
- Q: Flip default landing to `analyze` (true front door) — deferred; entangles onboarding welcome modal + `App.smoke.test` default-overview assertion; one-liner in `useTabParam.ts` done deliberately.
- Q: Move 2 (shareable result URL = growth loop) and Move 3 (Gemini BYO-key vision + proxy) not started.
- Q: Verify Ultra $100 credit applies to the proxy project's API key (Cloud billing); confirm exact model ID at `ai.google.dev/gemini-api/docs/pricing`.
- Q: Enforcement leg (F3) — the budgeted demand's real need; not in WS11 or the thesis; biggest product bet, unscoped.

## Rejected Approaches
- X: BYO-key-only for vision — superseded once Ultra $100/mo credit surfaced (proxy now free within cap).
- X: Baking a vision key into the public static bundle — leaks it; this IS the current Forge bug.
- X: Gemini 3.1 Pro / Nano Banana for the analyzer — Pro overkill + no free tier; Nano Banana is image *generation*, task needs *understanding*.
- X: Acting on mock-interview findings directly / rewriting the plan on them — Tier-B findings are setup-contaminated; re-point the experiment, don't rewrite.
- X: Flipping default landing inside Move 1 — scoped out to keep blast radius small (onboarding + smoke test).
- X: ISO-standard purchase + 5 real conversations as near-term focus — deprioritized per user redirect (solo OSS POC; ship for adoption).

## Next Actions
1. Commit Move 1 — branch off `origin/main`, move the 8 files, PR (squash convention). It's uncommitted on `main`.
2. (optional) Flip default landing to `analyze` — `useTabParam.ts`; update `App.smoke.test` + handle onboarding deliberately.
3. Move 3 BYO-key Gemini vision, TDD — swap the Forge call in `client/src/features/diagram/engine/diagram-analyzer.ts` for `gemini-2.5-flash-lite`, key from user-pasted localStorage; JSON-schema output → `LLMPatternMatch`.
4. Scaffold proxy (Cloudflare Worker / Cloud Function) on Ultra $100 credit + hard budget cap ≤$100 + per-IP rate limit; server-side key only; BYO-key fallback when cap trips.
5. Move 2 shareable result URL (encode analysis in URL / risk card) — the growth loop.
6. Refresh or retire stale `HANDOFF.md`.
