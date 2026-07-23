# Session Checkpoint — 2026-07-22
**Focus:** ISO 42001 citation correction + registry guard; WS11 backlog; PM thesis; next-options gate
**Token estimate before:** ~185k
**Token estimate after:** ~1.5k

## Decisions
- D: `FRAMEWORK_REFS` shipped wrong ISO 42001 citations in 9/10 entries — all 10 corrected. Headline: `A.6.2.4 Operation & monitoring` (7 entries) → `A.6.2.6 AI system operation and monitoring`; ASI05 `A.6.2.3`→`A.6.2.4`; ASI09 `A.8.2`→`A.8.5`. EU AI Act article *numbers* were all correct; Art. 15 normalized from 3 display strings to 1. Per-entry detail in CHANGELOG DP "The Governance Bridge Cites the Wrong Clauses".
- D: Root cause structural, not clerical — NIST refs resolve against a pinned OSCAL catalog; ISO/EU refs were free-text validated only for non-emptiness (`framework-refs.test.ts:21`). Fix = build the missing substrate, not just edit strings.
- D: New `packages/crosswalk/src/framework-index.ts` — 38 ISO Annex A controls under 9 objectives, 14 EU AI Act articles, `isoRef()`/`euAiActRef()`. HAND-CURATED, no refresh script by design: ISO/IEC 42001:2023 is copyrighted/paywalled → clause IDs + official titles only, never control text. Sourced from ISMS.online + Mindset Cyber (corroborating); EU articles verified exact against EU AI Act Explorer.
- D: Kept `iso42001?: string[]` / `euAiAct?: string[]` shape — preserves published interface, zero UI change, MINOR not MAJOR. 0.9.0 → 0.10.0.
- D: Landed the upgraded guard test BEFORE the correction and confirmed RED on all 3 defect classes first. A guard that never failed is not a proven guard.
- D: Six residual items filed as `docs/trd/TRD-GAP-REMEDIATION.md` §WS11 (WS11-01..06) + traceability row — not bundled into the fix.
- D: PM thesis `docs/role-outputs/08-product-manager.md` recommends Option C (crosswalk = free door-opener, `/acc` = paid evidence layer), confidence 0.7.
- D (`docs/scratchpad-next-options.md`): D-01 new branch off `origin/main` + PR; D-02 zero WS11 items now; D-03 buyer conversations before more building; D-04 buy ISO standard now, decoupled from the $500–1500 A-02 consult.

## Current State
- Branch `remediation/pr2-comprehension-design`, 1 commit ahead of `origin/main` (`09d8635`). **All work UNCOMMITTED.**
- Modified: `CHANGELOG.md`, `VALIDATION.md`, `docs/EXPANSION_ROADMAP.md`, `docs/trd/TRD-GAP-REMEDIATION.md`, `packages/crosswalk/{package.json,src/data.ts,src/index.ts,src/version.ts,tests/framework-refs.test.ts}`.
- New: `packages/crosswalk/src/framework-index.ts`, `docs/role-outputs/08-product-manager.md`, `docs/scratchpad-next-options.md`, this ACC.
- Gates green: `pnpm check` clean; `pnpm test` **117 passed / 27 files** (was 112); build emits `dataVersion: 0.10.0`, zero stale strings in `dist/crosswalk.json|csv`; new exports in `dist/index.d.ts`.
- `framework-refs.test.ts` now 7 tests (was 2): ISO resolve+exact-title, EU resolve+canonical-short, one-display-string-per-id (ISO/EU analogue of T13b), registry well-formedness.
- UI verified via Playwright at 640px (`sm:grid-cols-3`, tightest): ASI06's longest string renders 178px, no clipping, no horizontal scroll.
- **GitHub Pages LIVE and `status: built`** at `https://haremantra.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/` — still serving the pre-fix wrong clauses until the correction lands.
- Cross-repo artifact from this session: `~/linuxshanti/scratchpad/2026-07-22-agentic-ai-risk-controls.md` (18-control agentic checklist; companion to the PM thesis).
- `HANDOFF.md` STALE — dated 2026-05-01, describes v0.2.0.
- CPPG active at `~/Documents/CPPG/`; matched `defer-out-of-scope-work-to-a-forcing-function`, `reject-added-process-for-existing-simpler-convention`.

## Open Questions
- Q: PM-01 — did any `/acc` design-partner outreach happen 2026-05-21 → 2026-07-22? All GTM artifacts frozen at 2026-05-21; `haremantra/acc` 8 stars, last push 2026-06-12. Mtimes cannot see email/calls. **Free to answer; gates the whole PM thesis.**
- Q: A-03 — are 5 second-line risk practitioners reachable in ~4 weeks? Inherited unverified from the `/acc` plan. **Largest risk**; if false, D-03 has no execution path and the honest move is explicit kill, not drift back into building.
- Q: PM-03/04/05 — is the ISO gap *news*? Does blanket `editorial` status disqualify the artifact? Is assess-then-evidence the real buyer sequence? Same 5 conversations answer all three.
- Q: WS11-03 — `FRAMEWORK_REFS` absent from `dist/crosswalk.json`/`.csv` (`artifacts.ts` never emitted it). Emit, or document the TS-only limitation?
- Q: `main` is UNPROTECTED on a repo publishing an MIT package for GRC consumption — adjacent to WS10-01 Solo/Board mode.
- Q: Registry rests on 2 secondary sources; primary ISO text NOT purchased (WS11-04). Guard proves data↔registry, not registry↔ISO.

## Rejected Approaches
- X: Correcting strings without the registry — free-text substrate is the root cause; errors would silently return.
- X: Structured `{id,title}` refs with derived titles — drift becomes impossible but breaks every JSON consumer for a MAJOR bump; the guard catches drift anyway.
- X: CertPro and Hicomply as ISO sources — both publish FABRICATED, mutually contradictory Annex A schemas. Named in `VALIDATION.md` so they are never re-cited.
- X: Bundling WS11-01/02 into the fix — per OWASP-AGENTIC `rej-003-04` and linuxshanti `spdec-009-01`, the fix commit contains exactly the fix.
- X: Committing onto the pr2 branch — zero file overlap with its 8 UI files; bundling buries a P1 correction under unrelated review.
- X: Committing direct to `main` — permitted (unprotected) but direct-to-main prior art (DQJACOB `dec-006-03`) was qualified to *trivial doc commits*.
- X: Hybrid "light engineering while scheduling conversations" — that is what the last 60 days already were; obviate-archaeology `rej-002-05`: "interviews need nothing built".
- X: Bumping `EXPANSION_ROADMAP.md` `lastReviewed` — no NIST family review occurred.

## Next Actions
1. Land D-01 — new branch off `origin/main`, move the 11 files, PR. **Unblocks the Pages redeploy that fixes publicly-visible wrong clauses.**
2. Answer PM-01 (ask the maintainer). Free; re-baselines the PM thesis if outreach did occur.
3. Buy ISO/IEC 42001:2023 (~CHF 200), reconcile `framework-index.ts`, close WS11-04.
4. Run the 5 practitioner conversations — resolves PM-03/04/05 together.
5. Only then: A-02 Big-4 consult ($500–1500), and whichever of WS11-01/02/03/05/06 the conversations show matters.
6. Refresh or retire stale `HANDOFF.md`.

**Not doing** until step 4 reports back: WS11 execution, further product documents, crosswalk feature work.
