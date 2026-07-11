# Session Checkpoint — 2026-07-11
**Focus:** OWASP crosswalk — full TRD gap-remediation backlog (Waves 1-6) + preceding refactor
**Token estimate before:** ~450k
**Token estimate after:** ~2k

## Decisions
- D: Executed entire TRD backlog (`docs/trd/TRD-GAP-REMEDIATION.md`) Waves 1-6, PRs #18-#30 — after the S1-S7 refactor (PRs #9-#17). Package `@haremantra/crosswalk` v0.2.0→**v0.8.0**; tests 21→**67**.
- D: Honest counts over padded — removed withdrawn SA-12, dropping distinct controls 55→**54** / mappings 90→**89**, rather than substituting a mismatched successor.
- D: Orphans handled non-destructively (user choice) — claim "complete 19"→"**17 of 19 referenced**"; keep GV-3/MS-4 on T16 allowlist; delete stray GV-7.
- D: Fixed systemic GOVERN/MANAGE description-title mismatch (user-approved) — was rendering wrong Evidence-Explorer tooltips (e.g. GV-6→"Resource Allocation").
- D: WS6 YAML migration OUT of scope (user: TS-native). WS7 evidence sourced by web research (user choice) — all 33 refs adversarially verified, **0 unverifiable**.
- D: `validationStatus` on all 80 mappings = `editorial`; ordinal `confidence` left unassigned — no numeric floats, no scrambler-score imports (AD-3).
- D: db/ kept standalone npm island (NOT folded into workspace) so native better-sqlite3 stays out of app CI; enforced by a JSON drift-guard test instead.
- D: Package publish uses `publishConfig` to point the *published* artifact at `dist/`; workspace client keeps consuming raw `src` (no build-before-build coupling).
- D: OSCAL title validation + Tier-2 rationale-cross-reference are **report-only** (editorial debt surfaced, not blocking).

## Current State
- main @ `0d7c3bf`; site live (200) at https://haremantra.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/; 67 tests green; `crosswalk-v0.8.0` published (GitHub Packages).
- Repo: `C:\Users\shant\linuxshanti\OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF` (private; gh authed as owner haremantra).
- Data truth (test-pinned): 54 controls / 89 mappings; 16 families in scope, **14 mapped** (MP/PE unmapped); 17 of 19 AI-RMF subcategories; evidence = `EvidenceItem[]`, 33 verified sources.
- New infra: vendored OSCAL index (`packages/crosswalk/src/oscal-index.ts`, pinned oscal-content v1.5.0) + monthly `oscal-drift.yml`; tsup `dist/` (ESM+CJS+.d.ts) + `crosswalk.json`/`.csv`/`.oscal.json`; SPA Download JSON/CSV + Provenance panel; `UPSTREAM_VERSIONS` export.
- Governance/docs: `GOVERNANCE.md` (two-mode, Solo active), `docs/EXPANSION_ROADMAP.md` (6 families), `VALIDATION.md` (3-tier), `docs/EVIDENCE_AUDIT.md`, CHANGELOG 2026-07-11 decision points + `(superseded)` errata, CODEOWNERS + issue/PR templates.
- Repo settings changed via gh: Actions allowlist broadened `pnpm/action-setup@v4`→`@*` (SHA-pins require it); Pages `build_type=workflow` (legacy `/docs` retired).
- Memory updated: `~/.claude/projects/C--Users-shant-linuxshanti-marketing/memory/owasp-crosswalk-repo-state.md` (full completion). Repo `HANDOFF.md` is STALE (2026-05-01) — do not trust; use CHANGELOG/TRD/this ACC.

## Open Questions
- Q: Residual editorial debt (report-only, tracked, non-blocking) — ~107 OSCAL title divergences (14 referenced = benign Rev-4 renames; rest unreferenced desc keys) + 65 Tier-2 rationale↔ID cross-reference gaps. Future editorial pass; promote Tier-2 checks to hard-fail when a count hits 0.
- Q: Node-20 action deprecation warning on the pinned SHAs — cosmetic; bump SHAs when convenient.
- Q: npm provenance (WS1-7) moot on GitHub Packages restricted — a standalone registry-strategy decision if public-npm anonymous consumption is ever wanted.

## Rejected Approaches
- X: SA-12→SR-9 substitution to keep count=55 — rejected: repo's SR-9 title "Supplier Security Incident Response" semantically mismatches SA-12's tamper/integrity intent; padding is the inaccuracy being fought.
- X: Folding db/ into pnpm workspace — rejected: pulls native better-sqlite3 into app CI; kept standalone + drift guard.
- X: byte-identical data regression guard (earlier refactor) — rejected: formatter-brittle; used semantic deep-equality snapshot.
- X: Fixing all 107 OSCAL title divergences now — deferred: editorial, overwhelmingly on unreferenced description keys.

## Next Actions
1. (Optional) Editorial pass — correct the 14 *referenced* OSCAL title divergences; then promote Tier-2 checks whose violation count is 0. Targets: `packages/crosswalk/src/nist-control-descriptions.ts`, `packages/crosswalk/tests/editorial-quality.test.ts`.
2. (Optional) Bump the 5 pinned action SHAs to clear the Node-20 deprecation — the 3 files under `.github/workflows/`.
3. (Optional) If AT fully triggers per `docs/EXPANSION_ROADMAP.md`, wire AT-2/AT-3 into ASI09 CROSSWALK (follow that family's activation checklist).
4. Otherwise: backlog complete — no required next action. Verify anytime with `pnpm check && pnpm test && pnpm build`.
