# TRD — Gap Remediation for AI Risk Management Design

**Document:** Technical Requirements Document — implementation of gap closure per "Gap Analysis and Remediation Options for AI Risk Management Design" (Manus AI, 2026-07-10)
**Repo:** `haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF` @ `42f1e88` (main, pushed 2026-06-13)
**Date:** 2026-07-10
**Status:** Draft for maintainer review

**Role assumed (secondary perspective):** Principal Platform & Security Engineer — Compliance Tooling. The gap analysis was authored from the Enterprise AI Governance Architect seat (what *should* exist); this TRD is written from the seat that must *build and operate* it: implementation feasibility against the repo as it actually exists, sequencing, effort-vs-value, supply-chain and licensing integrity, and conflict detection between recommendations. This role is optimal for the reassessment because the gap analysis's failures are not conceptual but empirical — it was written against a stale repo snapshot and its recommendations collide with each other at the requirement level, which only an implementation-owner review surfaces.

**Verification method:** 17-agent verification/assessment workflow against the cloned repo — 4 fact-check agents (including a live test-suite run and GitHub Actions API queries), 10 per-recommendation assessors, 2 completeness agents hunting missed gaps, 1 adversarial pass that attacked every verdict. 14 cross-recommendation conflicts were found and are resolved in §3. Trust level: **high** on the verified facts (every claim cites file:line at commit `42f1e88`); **moderate-high** on requirement design; **moderate** on editorial-effort estimates (the softest numbers in this document).

---

## 0. Review Assessment Summary Chart

**Headline conclusion, stated expressly:** No recommendation is usable exactly as presented — zero ACCEPT-as-is verdicts. Every recommendation required modification, for two systemic reasons: (1) the analysis was built on the stale 2026-05-01 `HANDOFF.md` — its central operational finding (G-04: "Actions disabled, zero workflow runs") is **refuted** (17 runs; CI and Pages green since 2026-06-12/13); (2) it missed the repo's true structural root cause — the crosswalk data ships as **two independent, divergent copies** (`client/src/lib/` vs `packages/crosswalk/src/`), with live user-facing bugs in the shipped copy. Several *sub-elements* are confirmed usable as presented (listed after the chart).

### 0.1 Verdicts on the analysis's recommendations

| # | Recommendation | Verdict | Brief explanation |
|---|---|---|---|
| G-04 / CF-07 premise | "CI/CD blocked; Actions disabled 70+ days; zero runs" | **REJECT (premise refuted)** | Actions enabled; 17 recorded runs; CI + Pages green since 2026-06-13. Only `publish-crosswalk.yml` has zero runs. Roadmap item 1 re-scoped to publish-pipeline hardening (WS1). CF-07 retired. |
| A.1 | Dynamic data layer w/ external source ingestion (OSCAL) | **MODIFY** | Narrowed from "dynamic ingestion" to a **vendored, version-pinned OSCAL reference index** validated offline at test time, plus a non-blocking monthly drift-detection cron. Runtime data fetching expressly prohibited (preserves static-deploy constraint). No machine-readable OWASP ASI or AI-RMF feed exists — those layers stay version-pinned curated data. The analysis's own CoVE V-02 already conceded the format-vs-process point. → WS5 |
| A.2 | Multi-stakeholder governance (Mapping Review Board) | **MODIFY** | A mandatory two-practitioner board is unenforceable with one contributor (CF-03-fatal) and contradicts the analysis's own Hybrid table (one reviewer). Replaced with **two-mode governance**: Solo Mode (CI-gated, self-review checklist) now; Board Mode activates on a concrete trigger (≥2 onboarded external reviewers). Recruitment descoped from deliverable to unlock condition. → WS10 |
| A.3 | Empirical validation framework | **MODIFY** | Per-mapping incident-proof standard is empirically unachievable (public incident writeups don't record which 800-53 control mitigated an attack; baseline today: 1 verifiable citation in 10 evidence strings). Weakened to a two-part standard (risk-exploitability evidence + authoritative-guidance citation), ASI-level structured evidence objects, and a versioned incident register replacing the circular "coverage adequacy" metric. → WS7 |
| B.1 | Expanded integrity test suite (T11–T16) | **MODIFY** | Direction right; spec not implementable green: T11 strict-mode fails 9/10 ASIs today; T16 fails on **three** orphans (GV-3, GV-7, MS-4 — the analysis missed GV-3); T15's target data lives only in `client/src/lib`, so package-side placement creates a reverse dependency. Re-specified as ratchets with allowlists + burn-down issues; T13b (control-name consistency) added — catches the live SI-7 defect. Baseline is 10 tests, not 11. → WS4 |
| B.2 | Excluded-families annex | **MODIFY + MERGE into C.3** | Near-duplicate of C.3 (the analysis's own §6 synthesis includes C.3 and omits B.2). Its "full control list" instruction would create a third hand-maintained NIST text copy — the repo's demonstrated failure mode. Unique contributions retained: coverage-truth table, HeatmapExplainer extension, DP4/CHANGELOG errata. **Prohibition:** the repo shall never contain two exclusion/expansion artifacts. → WS8 |
| B.3 | Confidence transparency layer | **MODIFY** | `validationStatus` field accepted (mandatory, all `'editorial'` at launch — the only claim verifiably true today). Numeric 0.0–1.0 confidence floats **rejected** — the DP-02/DP-04/A5 scores (0.68–0.78) belong to the Scenario Simulator and pattern taxonomy, *not* crosswalk mappings; hand-assigning fresh floats reproduces G-02 as false precision. Optional ordinal enum + rubric instead. Opacity heatmap encoding rejected (channel already encodes density; accessibility failure) — badge/tooltip/aria instead. → WS7 |
| C.1 | Schema-first YAML migration | **MODIFY** | Core hybrid direction confirmed correct. Three fixes: (1) hard prerequisite added — single-source cutover (the analysis assumed one `data.ts`; there are two divergent ones); (2) "byte-identical output" regression guard is literally unsatisfiable (identical to *which* copy?) — replaced with semantic deep-equality + documented intentional-delta allowlist; (3) `data/` tree relocated inside `packages/crosswalk/` to preserve the MIT-data/AGPL-app license boundary the root-level sketch would blur. YAML layer is severable if CF-03 persists. → WS6 |
| C.2 | Tiered validation model | **MODIFY** | Tier structure confirmed. Tier 2 must launch report-only and ratchet to hard-fail per-check (evidence-format check would fail 9/10 entries today). Tier 3 sign-off gates only *status promotion*, never merges (CF-03-safe degradation). Confidence-bounds check referenced a field that does not exist. C.2 becomes the umbrella owning `VALIDATION.md`; it consumes B.3's schema and B.1's tests rather than duplicating them. → WS7 |
| C.3 | Conditional scope expansion (technology triggers) | **MODIFY** | Cheapest, most CF-robust recommendation; "AT Partially Triggered" verified defensible (CHANGELOG.md:185; data.ts:218). Fixes: absorbs B.2 (single artifact `docs/EXPANSION_ROADMAP.md`); stubs are **doc-only** (inserting AT-2/AT-3 into data today breaks T3/T4 and inflates stats); scope expanded from 4 to **6 families** — MP and PE are defined-but-unmapped heatmap columns the analysis missed, contradicting DP4's "16 of 20 represented" claim; per-family activation checklists added. → WS8 |
| §6 Synthesized roadmap | 8-item priority sequence | **MODIFY (resequenced)** | Item 1 targets a refuted blocker; the true prerequisite (data unification) is absent entirely; B.1 (1 wk) was sequenced *after* C.1 (2–4 wk), inverting migrate-under-test practice; item 6's confidence-sourcing clause contradicted B.3's own verdict. Corrected sequence in §5. A.2/A.3 converted from calendar timelines to concrete unlock gates. |

### 0.2 New recommendations developed in this review (supplements)

The analysis missed an entire class of gaps: **the data product's delivery, licensing, and consumption surface.** Nine supplemental findings were raised by the completeness pass; after dedup against the modified A/B/C set, seven survive as new workstreams. Per-item disposition:

| ID | New recommendation | Disposition | Gap addressed |
|---|---|---|---|
| S-1 | **Single-source-of-truth cutover** — client consumes `@haremantra/crosswalk`; delete `client/src/lib` duplicates; fix `Home.tsx:104` framework-discriminator bug | **ADOPT — highest-leverage fix in the repo; prerequisite for A.1/B.1/B.3/C.1/C.2** | NEW gap (root cause the analysis filed as G-09 symptoms). The shipped app and the tested/published package are different artifacts; the 10-test suite protects data the app does not ship. → WS2 |
| S-2 | **License-metadata correction** — root `package.json:5` declares `"MIT"` while root `LICENSE` is AGPL-3.0; add `"private": true`; fix 3 stale README claims | **ADOPT — 15-minute fix, disproportionate credibility return** | NEW gap. License scanners (FOSSA/Snyk/ORT) read `package.json`, not `LICENSE` — the repo self-misreports the exact boundary its GRC-consumption pitch (CF-05) depends on. → WS0 |
| S-3 | **Publish-pipeline hardening** — gate publish on `pnpm check`+`test`, tag↔version assertion, `@obviate`→`@haremantra` scope fix, SHA-pin all actions, registry/provenance decision, resolve Pages double-deploy | **ADOPT — absorbs and expands roadmap item 1** | Extends G-04's one live remnant: `publish-crosswalk.yml` has zero runs and currently publishes ungated. → WS1 |
| S-4 | **Consumable release artifacts** — `dist/` (ESM+CJS+`.d.ts`), versioned `crosswalk.json`, per-mapping CSV, SPA download buttons, `CROSSWALK_DATA_VERSION`, data-vs-schema SemVer contract, ToS §4.2 carve-out | **ADOPT (merged from two overlapping proposals S-E4+S-C1)** | NEW gap. Package ships raw `.ts` only — CF-05's mitigation ("GRC platforms can consume the package") is currently false; ToS §4.2 prohibits the only machine-consumption path from the hosted app. → WS9 |
| S-5 | **OSCAL emission** — publish the crosswalk *itself* as an OSCAL-aligned artifact resolved against NIST's canonical catalog | **ADOPT** | NEW gap. The analysis proposed OSCAL only for *ingestion*; emission is what GRC/SSP/FedRAMP toolchains consume, and catalog resolution mechanically kills the free-text-control-string defect class. → WS9 |
| S-6 | **Provenance travels with the data** — `PROVENANCE` export (dataset version, DP index, known limitations), per-mapping `decisionRefs`, ship CHANGELOG/DECISIONS in package files | **ADOPT** | NEW gap. The repo's transparency posture (its distinguishing asset) is structurally severed from the distributed package: MIT consumers receive mappings stripped of every disclosure, and CHANGELOG.md:257's dispute hook is unusable from the data side. → WS9 |
| S-7 | **Derived-data sync + supply-chain pruning** — CI drift check for `db/patterns.json` (a third manually-synced data copy), remove unused `axios`, rule on `server/index.ts` vs the static-deploy commitment, enroll/eliminate the second lockfile | **ADOPT** | NEW gap. `db/` and the dependency surface are absent from the analysis; unused network-capable deps are audit findings in a security-tooling repo. → WS10 |
| S-C3 | Upstream-edition manifest + drift watch + ghost-control purge | **MERGE (dissolved)** | ~90% duplicate of modified A.1 (FR-A1-02/04/05) and WS3. Its one distinct contribution — the ghost-control purge — is retained in WS3 with the inventory **corrected from 8 to 11 entries** (adversarial pass finding). |
| S-C1 | Machine-readable exports | **MERGE → S-4** | Same artifact pipeline as S-E4; merged to prevent two build configurations for one package. |

### 0.3 Confirmed usable as presented (sub-elements)

Stated expressly, these survive review unchanged:

1. **The Hybrid Retentions table** (analysis §Option C) — all five preserved constraints are confirmed load-bearing and are adopted as NFRs in §4.0.
2. **B.1's T12/T13/T14 specs** — verified green against current data (min rationale 82 chars; no intra-ASI dupes; all ASIs at exactly 4 families); adopted verbatim as regression guards.
3. **C.3's four trigger definitions** for AT/MA/PS/PT — adopted verbatim into WS8.
4. **"AT = Partially Triggered"** — verified defensible via CHANGELOG.md:185 and `packages/crosswalk/src/data.ts:218`.
5. **CoVE V-01** (NIST publishes machine-consumable OSCAL for 800-53 Rev 5) — confirmed; underpins WS5/WS9.
6. **CoVE V-02's refinement** (root cause is process absence, not data format; Hybrid > Foundational) — confirmed and extended: the root cause is more specifically *duplication without process* (S-1).
7. **The counterfactual frame CF-01–CF-08** — retained, with CF-07 retired as factually refuted and CF-03 promoted to the design-dominant counterfactual (every requirement below is annotated for CF-03 survival).

---

## 1. Ground-Truth Corrections (evidence base for the verdicts)

The following verified facts contradict or materially refine the gap analysis. Every downstream requirement builds on these, not on the analysis's claims.

| # | Gap-analysis claim | Verified reality (repo @ 42f1e88) |
|---|---|---|
| GT-1 | G-04: zero workflow runs; Actions disabled 70+ days | **17 runs.** Actions enabled (`allowed_actions: selected`). CI green since 2026-06-12; Pages deployed and green since 2026-06-13. `ci.yml` didn't exist when HANDOFF was written (added 2026-06-12, PR #7). Only `publish-crosswalk.yml` has never run. |
| GT-2 | "The data" treated as one artifact | **Two divergent copies.** No import relationship between `client/src/lib/` and `packages/crosswalk/src/` (zero `@haremantra/crosswalk` imports in client). Drift: package dropped the `coverage` field; package added AC-25/AU-16/CM-14; AI-RMF keys diverged — client `MAP-1..6`/`MEASURE-1..5` vs package `MP-1..5`/`MS-1..4` with different text; client-only `MAP-6`/`MEASURE-5` entries. |
| GT-3 | Home.tsx:97 fallback bug | Real, now at **Home.tsx:104**. Consequence larger than claimed: MP-* AI-RMF categories render the **wrong framework's tooltip** (800-53 Media Protection wins the `\|\|` ordering) and every MS-* category renders **no tooltip** (key mismatch). Root-cause fix = framework-discriminator prop on MappingCard, **not** fallback reordering (which would break genuine 800-53 MP-* controls). |
| GT-4 | 11-test integrity suite | **10 tests** (T1–T7, T9, T10; T6 split a/b; no T8). All pass (`10 passed (10)`). No `.skip` anywhere — `packages/crosswalk/README.md:37`'s claim of skipped T4/T6b is stale. All checks structural; none touch `rationale`/`evidence`. Suite covers **only the package copy** — the shipped client data is unprotected. |
| GT-5 | Orphans GV-7, MS-4 | **Three orphans: GV-3, GV-7, MS-4** (analysis missed GV-3). Asymmetric: MS-4/GV-3 are valid-but-unmapped categories; GV-7 is absent from `AI_RMF.cats` entirely (leftover from a 7-category GOVERN draft). |
| GT-6 | "16 families, 90+ controls, 62+ categories" | Exactly **90** control references = **55 distinct** control IDs (the "56 unique" stat at CHANGELOG.md:167 is inflated by the SI-7 naming inconsistency: "Software Integrity" vs "Software & Information Integrity"). Exactly **62** category references = **17 distinct** of 19 defined (GV-3, MS-4 never referenced — falsifying CHANGELOG.md:175's "complete coverage of all 19"). **14 of 16** defined families carry mappings; MP and PE are zero-mapping heatmap columns — DP4's "16 of 20 represented" overstates. |
| GT-7 | Evidence citations exist | 10 flat prose strings. **1** contains a CVE (CVE-2025-31491, ASI03, `data.ts:137`); **0** URLs; **0** dates. Not one citation independently verifiable without original research. |
| GT-8 | "Rev 5" dataset | **11 withdrawn/non-Rev-5 ghost controls** in `nist-control-descriptions.ts` (package): SA-6:869, SA-7:875, SA-12:905, SA-13:911, SA-14:917, SA-18:941, SA-19:947, SC-9:1021, SC-19:1081, SC-33:1165, SI-9:1311. SA-12 is the only one live in CROSSWALK (`data.ts:142`, ASI04) and in shipped UI tooltips. T4 cannot catch this — the IDs resolve, to Rev-4 ghosts. |
| GT-9 | (not examined by analysis) | **Root `package.json:5` declares `"license": "MIT"` while root `LICENSE` is AGPL-3.0.** The app (`vibe-security-app@1.0.0`) is unscoped, non-private, publishable. Package copy correctly MIT. |
| GT-10 | Confidence scores 0.68–0.78 on mappings | Those scores annotate the **Scenario Simulator** (`scrambler-mappings.ts:14,96` — DP-04a 0.68, DP-04 0.72, DP-02 0.78) and the **pattern taxonomy** (PRD A5 0.78). **Zero per-mapping confidence values exist on crosswalk entries.** DP-05 carries 0.85, so 0.68–0.78 isn't even the full annotation range. |
| GT-11 | (not examined) | `publish-crosswalk.yml` publishes with **no test/typecheck gate**; scope `'@obviate'` at :24 vs package `@haremantra/crosswalk`; actions pinned to mutable major tags; registry is GitHub Packages `access: restricted` (consumers need a token even to read); no provenance attestation. Pages **double-deploys** (legacy build_type + Actions artifact path both run). |
| GT-12 | (not examined) | `axios` (root `package.json:44`) has zero imports repo-wide. `server/index.ts` is a static-file server duplicating GitHub Pages, yet bundled into `dist/` on every build. `db/` sits outside the pnpm workspace with its own npm `package-lock.json`; `db/patterns.json` is a third manually-synced data copy with no drift enforcement. `vite.config.ts` alias block (~:158) lacks the crosswalk alias that `vitest.config.ts:9` has. |
| GT-13 | (not examined) | `TERMS_OF_SERVICE.md` §4.2 (:38–40) prohibits automated download/extraction from the hosted service — foreclosing the only machine-consumption path of the app while the package remains unconsumable (GT-11), contradicting the data-product positioning. |

**Severity re-rating stated expressly:** G-09 ("orphans and documentation drift — Low-Medium, Hygiene") is re-rated **High / Structural**. It is not hygiene; it is the visible surface of the dual-copy architecture defect (GT-2), which produces live wrong-content rendering in the shipped product (GT-3) and false published statistics (GT-6).

---

## 2. Scope

**In scope:** All requirements needed to close G-01 through G-10 as modified in §0.1, plus the seven adopted supplements (§0.2), sequenced in §5.
**Out of scope (named prohibitions):**
- Runtime data fetching of any kind in the client (NFR-1 prohibits it permanently, not just for now).
- Validation/re-scoring of the Scenario Simulator weights (DP-02/DP-04/DP-04a) — a distinct artifact; explicitly deferred to a future TRD.
- Migration of the pattern taxonomy (`agentic-patterns.ts`, `db/patterns.json`) into the YAML data layer — WS10 only enforces sync.
- FedRAMP authorization of the tool itself (CF-05: the consumption path is the MIT package/artifacts, not authorization).
- Recruiting external reviewers as a *deliverable* — it is an unlock condition (WS10), not engineering work.

---

## 3. Architecture Decisions (conflict resolutions — binding on all requirements)

The adversarial pass found 14 cross-recommendation conflicts (4 blocking). Resolutions below are **imperatives**; any requirement in the source assessments that contradicts them is superseded.

| AD | Decision | Resolves |
|---|---|---|
| AD-1 | **Exactly one single-source cutover requirement exists: R-WS2-01.** It owns: `workspace:*` dependency, the missing `vite.config.ts` alias, client import switchover, deletion of the three `client/src/lib` data files, drift reconciliation (adopt package short-form AI-RMF keys; keep AC-25/AU-16/CM-14; **drop** client-only MAP-6/MEASURE-5 — they do not exist in the real AI-RMF category structure the package matches; record as a CHANGELOG decision point), computed coverage stats, the Home.tsx:104 framework-discriminator fix, and a CI grep guard against reintroduction. Seven prior specifications (FR-A1-01, FR-B1-06, FR-B3-02, FR-C1-01, FR-C2-01, FR-SR-02, S-E1) collapse into dependencies on it. The byte-sync and dual-copy-test fallbacks are **deleted**, not deprecated. |
| AD-2 | **One evidence schema, defined once, ASI-level.** `EvidenceItem = { title: string; sourceUrl?: string; cveId?: string; type: 'incident'\|'research'\|'guidance'; datePublished?: string; dateVerified: string; relatedControls?: string[] }`, attached as `evidence: EvidenceItem[]` on `CrosswalkEntry` (per-ASI, not per-mapping — per-mapping evidence across 90 references is ~9× editorial cost and stalls under CF-03). Owner: WS7 (R-WS7-01). C.1's schema imports it; C.2's Tier-2 check validates it; S-6's exports carry it. The four competing shapes (FR-A3-01/FR-C1-02/FR-C2-04/S-C4d) are superseded. |
| AD-3 | **One confidence design.** `validationStatus: 'editorial'\|'practitioner-reviewed'\|'empirically-validated'` — mandatory on every mapping, all initialized `'editorial'`. `confidence?: 'provisional'\|'moderate'\|'high'` — optional ordinal, assignable only per a written rubric. **Prohibitions:** no numeric 0.0–1.0 floats in the data model; no copying of scrambler/PRD scores (DP-02/DP-04/DP-04a/A5) onto crosswalk entries; the repo never exposes two confidence values for one mapping. A.3's future computed rubric (WS7, gated) may upgrade the ordinal to derived numerics — at which point hand-assigned values are deleted, not blended. |
| AD-4 | **One scope-expansion artifact: `docs/EXPANSION_ROADMAP.md`** (C.3 as owner — its spec is the more complete). B.2's coverage-truth table, HeatmapExplainer extension, and DP4/CHANGELOG errata fold in as requirements of WS8. No `EXCLUDED_FAMILIES.md` shall exist. UI disclosure = HeatmapExplainer extension (the component already discloses exclusions at :22); the footer-link variant is dropped. |
| AD-5 | **`VALIDATION.md` has one owner: WS7 (C.2 umbrella).** A.3 contributes the evidence-standard section; A.2's `GOVERNANCE.md` references it as the single cadence authority. One review calendar exists (quarterly + incident-triggered); A.2 step 4, A.3 step 5, and C.3's semi-annual clause are views of it, not parallel processes. |
| AD-6 | **The withdrawn-controls source of truth is the vendored OSCAL index** (R-WS5-01) — its `withdrawn` flags. No separately curated withdrawn-list is created (supersedes FR-C1-07's second artifact). The ghost purge covers the full **11-entry** inventory (GT-8), not 8, not SA-12 alone. |
| AD-7 | **Tests before migration.** WS4 (suite expansion) lands before WS6 (YAML migration) so the expanded suite is the migration's regression gate. All "un-skip T4/T6b" clauses are deleted (GT-4: nothing is skipped). |
| AD-8 | **T15 lives client-side** (`client/src/lib/scrambler-mappings.test.ts`) — its subject data exists only in the client. Package tests never import from `client/`. |
| AD-9 | **One artifact pipeline** (WS9): S-E4's build/versioning/SemVer/prepublishOnly base + S-C1's CSV, SPA downloads, and ToS carve-out. Single `dist/` layout, single `exports` map. |
| AD-10 | **WS1 owns every change to `publish-crosswalk.yml` and the deploy topology** (absorbs S-E3 + FR-SR-01). No other workstream touches those files. |

---

## 4. Requirements by Workstream

### 4.0 Non-Functional Requirements (global, inherited by every workstream)

| ID | Requirement |
|---|---|
| NFR-1 | The client shall perform **no runtime network fetches** for crosswalk or reference data; all ingestion, validation, drift detection, and artifact generation occur at dev/build/CI time. Enforced by a static-inspection test over `dist/public` and `client/src`. |
| NFR-2 | Client-side static GitHub Pages deployment is preserved; no new runtime dependencies enter the client bundle; new tooling is devDependency-only. |
| NFR-3 | Rationale-first philosophy is preserved: no requirement may delete or truncate rationale text; editorial changes (SA-12 remap, orphan wiring) require a CHANGELOG Decision Point entry. |
| NFR-4 | The MIT-data / AGPL-app license boundary is machine-readable and preserved: all data, schemas, build scripts, and generated artifacts live under `packages/crosswalk/` (MIT); nothing data-licensed lives at AGPL root. |
| NFR-5 | Every automated check runs locally via a pnpm script with identical results to CI (CF-07 hedge, even though CF-07 is refuted); compile/emit steps are deterministic (two consecutive runs → zero diff; LF endings enforced for Windows/CI parity). |
| NFR-6 | Every ratchet allowlist entry (orphans, evidence strictness, OSCAL title aliases) carries a tracking-issue link; allowlists without burn-down issues fail review. |
| NFR-7 | UI status/confidence indicators are never communicated by color or opacity alone (badge/glyph/text + aria-label); the heatmap fill channel remains reserved for mapping density. |
| NFR-8 | Every requirement below is executable by a single maintainer (CF-03-safe) except those explicitly gated in WS10. |

---

### WS0 — Immediate corrections (effort: S total; no dependencies; do first)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS0-01 | Root `package.json` shall declare `"license": "AGPL-3.0-only"` and `"private": true`. | License scanners report AGPL for the app; `npm publish` at root is impossible. | S | S-2 |
| R-WS0-02 | `packages/crosswalk/README.md` shall be corrected: :47 scope → `@haremantra`; :17 "GOVERN-only" claim removed (all four functions exist); :37 skipped-tests claim removed (no `.skip` exists). | Zero occurrences of `@obviate` in the file; claims match GT-4. | S | S-2 |
| R-WS0-03 | A 5-line CI step shall assert each `package.json` `license` field matches its adjacent LICENSE file. | Mutating either fails CI. | S | S-2 |

### WS1 — Publish & deploy pipeline hardening (effort: S–M; no dependencies)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS1-01 | `publish-crosswalk.yml` shall gate publication on `pnpm check` and `pnpm test` (and `pnpm build` once WS9 lands), with scope corrected to `'@haremantra'` (:24). | A tag push with a failing suite publishes nothing; no repo file contains `@obviate`. | S | S-3, FR-SR-01 |
| R-WS1-02 | The workflow shall assert `github.ref_name == 'crosswalk-v' + package.json version` and fail on mismatch. | Pushing `crosswalk-v0.2.1` against a `0.2.0` manifest fails before publish. | S | S-3 |
| R-WS1-03 | All third-party actions across all three workflows shall be pinned to full commit SHAs with version comments. | No mutable tag refs remain; a workflow-lint grep passes in CI. | S | S-3 |
| R-WS1-04 | One successful publish of `@haremantra/crosswalk` shall be executed (v0.2.1) after R-WS1-01..03. | `gh api` shows ≥1 successful publish run; package resolves at 0.2.1. | S | FR-SR-01 |
| R-WS1-05 | The registry strategy shall be decided and documented: **recommended** — public npmjs with `npm publish --provenance` (`id-token: write`), matching the GRC-consumption pitch; if staying on GitHub Packages restricted, the read-token requirement is documented as a deliberate limitation and build-provenance attestations are attached. | README states the decision and rationale; publish run carries provenance/attestation. | S | S-3 |
| R-WS1-06 | Exactly one Pages deploy path shall serve the site: disable the legacy Pages build **or** `deploy-pages.yml`. | A push to main triggers exactly one deployment; Pages `build_type` matches the chosen path. | S | S-3, FR-SR-01 |

### WS2 — Single source of truth cutover (effort: M; no dependencies; prerequisite for WS4–WS7, WS9)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS2-01 | The client shall consume all crosswalk data exclusively from `@haremantra/crosswalk`: add `workspace:*` dep to root `package.json`; add the package alias to `vite.config.ts` resolve.alias (mirroring `vitest.config.ts:9`); switch all client imports (`AnalysisPanel.tsx:17`, `Home.tsx:17,41`, et al.); delete `client/src/lib/{data,nist-control-descriptions,nist-ai-rmf-descriptions}.ts`. Drift reconciliation per AD-1: adopt package short-form MP-*/MS-* keys; retain AC-25/AU-16/CM-14; drop client-only MAP-6/MEASURE-5 with a CHANGELOG DP entry. | Grep shows zero client imports of the deleted modules and zero crosswalk constants under `client/src/lib`; `pnpm check`, `pnpm test`, `pnpm build` green; Pages build needs no registry auth (workspace link). | M | AD-1 (7 sources) |
| R-WS2-02 | `MappingCard` shall receive an explicit framework-discriminator prop replacing the `NIST_CONTROL_DESCRIPTIONS \|\| NIST_AI_RMF_DESCRIPTIONS` fallback at `Home.tsx:104`; the `Home.tsx:368` regex lookup updated for short-form keys. | Every MP-*/MS-* AI-RMF category renders its correct AI-RMF tooltip; no AI-RMF cell renders 800-53 Media Protection text; genuine 800-53 MP-* controls in the other column still resolve correctly. | S | GT-3 |
| R-WS2-03 | Per-risk coverage statistics shall be **computed from CROSSWALK** at module load or build time, replacing the hand-maintained `coverage` constants the package copy dropped; `OverviewRoster.tsx:58-66` and the stat cards (`Home.tsx:461-473`) consume derived values. | Displayed stats match scripted tallies (55 distinct controls, 17 referenced categories, 14 mapped families) — the false 56/19/16 figures self-correct; a unit test locks derivation = display. | S | GT-6 |
| R-WS2-04 | A CI grep guard shall fail if crosswalk data constants reappear under `client/src/lib`. | Reintroducing an `export const CROSSWALK` under client fails CI. | S | S-1 |
| R-WS2-05 | The cutover's user-visible changes (tooltips appearing, stat corrections) shall be recorded as a CHANGELOG Decision Point (transparent-provenance posture, NFR-3). | CHANGELOG entry exists naming the deltas and citing this TRD. | S | NFR-3 |

### WS3 — Data-accuracy remediation (effort: M; depends: WS2; interleaves with WS4 ratchets)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS3-01 | The full 11-entry ghost-control inventory (GT-8) shall be purged from `nist-control-descriptions.ts` or annotated `{ withdrawn: true, supersededBy: [...] }`; SA-12 (the only ghost live in CROSSWALK) shall be editorially remapped to its SR-family successors (SR-3/SR-9/SR-11 — already present in ASI04's SR mapping) with rationale preserved and a CHANGELOG DP entry. | No key in the descriptions file is withdrawn-unannotated; CROSSWALK cites zero withdrawn controls; WS5's validation test (R-WS5-02) goes green on this item. | M | AD-6, GT-8 |
| R-WS3-02 | SI-7 naming shall be normalized to one canonical string in the canonical data source. | T13b (R-WS4-02) green; distinct-control count = 55 everywhere. | S | GT-6 |
| R-WS3-03 | The three AI-RMF orphans shall be resolved: GV-7 deleted from descriptions **or** added to `AI_RMF.cats` (decide; it is absent from cats entirely); GV-3 and MS-4 either wired into ≥1 mapping with rationale or retained on the T16 allowlist with tracking issues; CHANGELOG.md:175's "complete coverage of all 19" claim corrected or made true. | T16 allowlist shrinks or claims match data; no unreferenced description keys outside the allowlist. | M | GT-5 |
| R-WS3-04 | Scope-representation claims shall be corrected in the same change set: CHANGELOG DP4 (:179) and README (:28) revised to distinguish 16 defined / 14 mapped families, MP and PE documented as defined-but-unmapped (consistent with `scrambler-mappings.ts:33-34`); `HeatmapExplainer.tsx:22` string updated. | No remaining doc claims "16 families represented/covered"; corrections are append-style errata per CHANGELOG convention. | S | GT-6, B.2 |

### WS4 — Integrity test suite expansion (effort: S–M; depends: WS2; lands before WS6 per AD-7)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS4-01 | Add green-today guards to `packages/crosswalk/tests`: **T12** (every rationale ≥ 50 chars), **T13** (no duplicate control IDs within one ASI), **T14** (every ASI maps to ≥ 3 distinct families). | Suite green at head; mutation testing flips exactly the corresponding test red (truncated rationale / duplicated ID / 2-family ASI). | S | B.1 (confirmed as-is) |
| R-WS4-02 | Add **T13b**: each distinct control ID resolves to exactly one display string across all CROSSWALK entries. | Red before R-WS3-02, green after; guards the 55-vs-56 class permanently. | S | B.1 mod |
| R-WS4-03 | Add **T16** orphan detection as a ratchet: unreferenced `NIST_AI_RMF_DESCRIPTIONS` keys must equal the `KNOWN_ORPHANS` allowlist (init `['GV-3','GV-7','MS-4']`, each with a tracking issue per NFR-6). | Green at head; any new orphan fails CI; allowlist shrink requires the R-WS3-03 editorial wiring. | S | B.1 mod, GT-5 |
| R-WS4-04 | Add **T11** evidence floor as a ratchet: evidence non-empty, ≥ 50 chars, ≥ 2 delimited incident references; plus a **non-failing** verifiability report listing entries lacking URL/CVE patterns. Strict enforcement activates per-check only when its violation count is 0 on main (promotion rule documented in `VALIDATION.md`). | Green at head (all 10 pass the floor); report lists exactly the 9 non-verifiable ASIs; post-WS7 backfill, strict mode flips on without code change. | M | B.1/C.2 merged |
| R-WS4-05 | Add **T15** at `client/src/lib/scrambler-mappings.test.ts` (AD-8): validate `CONTROL_STATE_TO_FAMILIES` and `SECONDARY_BOOLEANS` family IDs against `NIST_800_53`, `SECONDARY_BOOLEANS` values ↔ `CONTROL_STATE_TO_FAMILIES` keys, `FAMILY_TO_PRIMARY_BOOLEAN` bidirectional consistency, and every `RISK_TO_ASI` asiId resolving with weight ∈ [0,1]. | Picked up by the existing vitest include; package imports nothing from client; mutation checks flip it red. | S | B.1 mod, AD-8 |
| R-WS4-06 | Add the WS8 scope drift-guard: defined-but-unmapped families == exactly `{MP, PE}`; no CROSSWALK mapping references AT/MA/PS/PT. | Green at current data; any silent scope change fails CI and forces a deliberate `EXPANSION_ROADMAP.md` update. | S | B.2/C.3 |

### WS5 — Upstream reference validation & drift watch (modified A.1) (effort: M; depends: WS2, WS3 for green activation)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS5-01 | Vendor a slim NIST 800-53 Rev 5 reference index (ID, canonical title, family, withdrawn flag) generated by `pnpm refresh:oscal` from a **pinned** `usnistgov/oscal-content` release tag; tag, source URL, and retrieval date in the generated header; checked in; deterministic. | Re-run against same pin → byte-identical; no network access in test/build/runtime paths; SA-12 present with `withdrawn: true`. | S | A.1 mod |
| R-WS5-02 | The integrity suite shall validate every CROSSWALK control ID and every descriptions key against the vendored index: exists in Rev 5, not withdrawn (per AD-6), title matches canonical under documented normalization with a **reviewed** alias allowlist (NFR-6). | Fails at head on the 11 ghosts + SI-7; green after WS3; runs fully offline. | M | A.1 mod |
| R-WS5-03 | Each of the three layers (OWASP ASI, 800-53, AI-RMF) shall export provenance metadata: upstream version/edition, source URL, last-verified date. OWASP ASI and AI-RMF remain **version-pinned curated data with no automated ingestion** until official machine-readable feeds exist (none do today). | `PROVENANCE` constant exported and integrity-tested (valid ISO dates, non-empty versions); client renders pinned versions in methodology/about UI. | S | A.1 mod |
| R-WS5-04 | A **non-blocking** drift-detection job (workflow_dispatch + monthly cron) shall diff the latest oscal-content release against the vendored index and publish a report (job summary / auto-filed issue) of added/withdrawn/retitled controls. It never mutates data and never gates CI/deploy. Identical diff runnable locally via `pnpm drift:oscal` (NFR-5). | Green on dispatch; synthetic index edit produces a delta report; `ci.yml`/`deploy-pages.yml` untouched. | S | A.1 mod |

### WS6 — Schema-first YAML migration (modified C.1) (effort: L; depends: WS2, WS4; **severable** — skippable under CF-03 without breaking any other workstream)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS6-01 | Define schemas under `packages/crosswalk/data/schema/` for per-ASI mapping files, evidence objects (**importing AD-2's shape — not redefining**), and provenance metadata; validator is devDependency-only (zod — already a repo dep — or ajv), with JSON Schema artifacts emitted for editor-side YAML validation. | Fixture missing rationale or evidence fails with path-precise error; root `dependencies` unchanged. | M | C.1 mod, AD-2 |
| R-WS6-02 | Migrate content to YAML under `packages/crosswalk/data/` — one file per ASI (10) plus version-pinned reference files — via a committed, re-runnable extraction script; every rationale/evidence string preserved verbatim. | All files pass schema validation; extraction is reproducible; reference files carry WS5 provenance metadata (CF-01 independence). | M | C.1 |
| R-WS6-03 | Build-time compiler (`packages/crosswalk/build/compile.ts`, via existing `tsx`) validates YAML and emits `src/*.ts` with generated headers, **computing** coverage counts and aggregates (never accepting hand-maintained numbers). Deterministic per NFR-5. | Two runs → zero diff; derived stats match GT-6 actuals; client bundle unchanged in kind. | M | C.1 mod |
| R-WS6-04 | **Semantic** regression guard (replaces byte-identical): vitest deep-equality of compiled exports vs a committed pre-migration snapshot, modulo a documented intentional-delta allowlist (computed coverage, reconciled keys, AC-25/AU-16/CM-14); full expanded WS4 suite green against compiled output. | Any out-of-allowlist mutation fails; allowlist entries carry per-delta justification. | S | C.1 mod, AD-7 |
| R-WS6-05 | Generated `src/*.ts` committed; `ci.yml` gains (a) schema validation, (b) recompile + `git diff --exit-code`; equivalent local `pnpm validate:data` (NFR-5). Compiler enforces reference validity via **WS5's index withdrawn flags** (AD-6) — unresolvable or withdrawn control IDs fail the build. | Hand-editing generated files or stale YAML fails CI; fictitious control ID fails compile; `validate:data` < 60s locally. | S | C.1 mod, AD-6 |

### WS7 — Transparency & validation layers (modified B.3 + C.2 + A.3) (effort: M–L; depends: WS2; schema items coordinate with WS6 if it proceeds)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS7-01 | Migrate `evidence: string` → `evidence: EvidenceItem[]` per **AD-2** in the canonical source; all 10 ASI entries backfilled with ≥ 1 item each; client rendering updated (`Home.tsx:357,381,403,1100`). | Interface exported; `pnpm check`/`build` green; UI shows structured citations without regression. | M | AD-2 |
| R-WS7-02 | Audit all ~30 currently-cited incidents for verifiability; commit the audit table (docs/) mapping each prose fragment → found identifier or tracked exception; every ASI reaches ≥ 1 item with URL/CVE and `dateVerified` within 12 months. | Baseline documented as 1/30 verifiable (GT-7); count meeting the floor reported; exceptions carry issues (NFR-6). | M | A.3 mod |
| R-WS7-03 | Add `validationStatus` (mandatory) and optional ordinal `confidence` per **AD-3** to every mapping (~80 rows), all initialized `'editorial'`; integrity tests enforce enum validity and reject `'practitioner-reviewed'`/`'empirically-validated'` lacking a `reviewIssue` reference. **Prohibited:** numeric floats; scrambler-score imports (grep-tested). | Fields present on all rows; mutation to invalid status fails; a CHANGELOG DP records why numeric confidence is deferred. | M | AD-3 |
| R-WS7-04 | UI: per-mapping validation-status badge in Evidence Explorer; status text in heatmap tooltips + aria-labels; a validation legend stating all mappings are currently editorial (linked to CHANGELOG DPs); a status filter with per-status counts. **Prohibited:** opacity/fill encoding (NFR-7). Sequence after R-WS2-02 so badges don't inherit the wrong-framework tooltip bug. | Badge on every card; density tiers visually unchanged; filter shows launch state 100% editorial. | M | B.3 mod |
| R-WS7-05 | `VALIDATION.md` (owner: this workstream, per AD-5) shall define: the three tiers; Tier-2 report-only→hard-fail promotion rule ("a check promotes when its violation count is 0 on main"); the two-part evidence standard (A.3's section — risk-exploitability evidence + authoritative-guidance citation; explicitly NOT requiring proof a specific control mitigated a specific incident); the ordinal-confidence rubric; and the single review calendar (quarterly rotating 25% cohort + incident-triggered ≤ 30 days). | Doc exists, linked from README; GOVERNANCE.md and the roadmap annex reference it as sole cadence authority; no duplicate standards elsewhere (grep). | S | AD-5 |
| R-WS7-06 | Tier-2 editorial-quality suite (`packages/crosswalk/tests/editorial-quality.test.ts`): rationale length, rationale↔mapping cross-reference (tolerant of compound shorthand "AC-3/6"), evidence-structure validation vs AD-2 — launched **report-only**, promoted per R-WS7-05's rule. | Runs on every CI run; emits per-check violation counts; post-promotion, a 20-char rationale or identifier-free evidence entry fails CI. | M | C.2 mod |
| R-WS7-07 | Tier-3 process artifacts: "Quarterly Mapping Review" issue template with the rotating cohort checklist (evidence refresh folded in — single cadence per AD-5); "Incident-Triggered Mapping Review" template with trigger criteria; a quarterly cron that opens the pre-populated review issue. External sign-off is required **only to promote validationStatus above `'editorial'`, never to merge** (CF-03-safe). | Templates exist under `.github/ISSUE_TEMPLATE/`; cron dry-runs green via dispatch with correct cohort; solo-reviewed mappings retain `'editorial'` with a recorded self-review note. | S | C.2 mod |
| R-WS7-08 | Versioned incident register (id, title, date, sourceUrl, mappedAsiIds[] possibly empty), seeded from the R-WS7-02 audit, plus a report script outputting (a) incidents mapping to zero ASI (taxonomy-gap signal) and (b) ASIs with zero incidents — **disclaimed as register-relative**, replacing A.3's circular population metric. | Register seeded (~30 entries); report runs via pnpm script at test time; disclaimer in output and header. | M | A.3 mod |

### WS8 — Scope-expansion roadmap (merged B.2 + C.3) (effort: M; no hard dependencies; annex claims tally against canonical copy post-WS2)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS8-01 | Create the single artifact `docs/EXPANSION_ROADMAP.md` (AD-4) covering **six** families — AT, MA, PS, PT (excluded) + MP, PE (defined-but-unmapped) — each with: exclusion/unmapped rationale traceable to CHANGELOG DP4 (:179-181); 2–3 representative controls by **ID and title only**, hyperlinked to the official NIST catalog (**prohibited:** copying control description prose — prevents a third drifting NIST text copy); the trigger condition (C.3's four definitions adopted verbatim; MP/PE triggers authored new); status ∈ {Not Triggered, Partially Triggered, Fully Triggered}; a concrete evidence threshold; and a review log. | File exists; all six sections complete; no `EXCLUDED_FAMILIES.md` anywhere; zero duplicated NIST prose (grep). | M | AD-4 |
| R-WS8-02 | AT marked **Partially Triggered** citing CHANGELOG.md:185 and `packages/crosswalk/src/data.ts:218`; MA/PS/PT Not Triggered with dated rationale. AT-2/AT-3 stub mappings (rationale adapted from data.ts:218) exist **only in the roadmap document** — no stub ID enters CROSSWALK, the families array, or descriptions until Fully Triggered (else T3/T4 break and stats inflate). | Grep for AT-2/AT-3 in data files returns only the existing PM-mapping note; suite stays green with no modified tests. | S | C.3 (confirmed) |
| R-WS8-03 | Each family section shall include an **activation checklist** enumerating every artifact that changes on promotion: canonical data source, families array, descriptions catalog, heatmap columns, `scrambler-mappings.ts:33-34` annotations, computed coverage derivation, README/CHANGELOG counts, integrity-test expectations (T3/T4, R-WS4-06 guard). | Dry-run walkthrough of the AT checklist identifies every affected file with no omissions. | M | C.3 mod |
| R-WS8-04 | Include B.2's coverage-truth table (14 mapped / 2 defined-unmapped / 4 excluded); extend the existing `HeatmapExplainer` details array with the corrected coverage statement and an anchor link to the annex (GitHub blob URL — zero new runtime deps). | Deployed site renders the link; `package.json` diff shows no new dependencies. | S | B.2 mod |
| R-WS8-05 | Review process is dual-mode — semi-annual calendar + event-driven (≤ 30 days after a published incident matching any trigger) — with machine-parseable `lastReviewed`/`nextReviewDue` header dates; executable by one maintainer in under an hour with no CI dependency. A vitest guard validates the annex's machine-readable elements (six sections, valid status enum, parseable dates). | Test green; removing a section or breaking a date fails locally via `pnpm test`; first review-log entry dated at artifact creation. | S | C.3 mod |

### WS9 — Consumable data product (merged S-4 + S-5 + S-6) (effort: M–L; depends: WS2; artifacts gain fields from WS5/WS7 as they land)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS9-01 | `packages/crosswalk` gains a build (tsup or dual tsc) emitting `dist/` ESM + CJS + `.d.ts`; `main`/`types`/`exports` repointed to `dist/`; `src` retained in `files` for transparency; `prepublishOnly` runs the integrity suite + build so any publish is self-gating. | A plain-JS consumer can `require`/`import` the package; publish from any context runs tests first. | M | S-4 |
| R-WS9-02 | Emit `dist/crosswalk.json` (full dataset + `CROSSWALK_DATA_VERSION` + WS5 `PROVENANCE`) exposed via a `'./data.json'` subpath export and attached to GitHub Releases; a test asserts lossless round-trip against the TS constants. | Non-npm consumers fetch the data over plain HTTPS; round-trip test green. | S | S-4 |
| R-WS9-03 | Emit `dist/crosswalk.csv` preserving **per-mapping granularity**: one row per (ASI, family, control) with rationale, evidence, validationStatus, and AI-RMF columns — no per-ASI aggregation. | Row count = 90 (mapping references); spreadsheet-openable; columns documented. | S | S-4 |
| R-WS9-04 | The SPA shall offer Download JSON / CSV actions generated client-side (Blob from bundled data — no server, NFR-1/2 preserved), and `TERMS_OF_SERVICE.md` §4.2 shall be amended to expressly permit the sanctioned export artifacts. | Buttons work on the deployed Pages site; ToS no longer forbids the app's own export path. | S | S-4 |
| R-WS9-05 | Document the data-vs-schema SemVer contract in the package README: key renames / interface changes = major; new ASI risks, controls, or mappings = minor; rationale/description/evidence text edits = patch. (The MAP→MP rename between the two copies is exactly the consumer-breaking class this contract makes visible.) | Contract section exists; CHANGELOG references it on the next version bump. | S | S-4 |
| R-WS9-06 | An OSCAL emitter (`packages/crosswalk/build/emit-oscal.ts`) shall produce an OSCAL JSON artifact from CROSSWALK — the draft OSCAL mapping model, or conservatively a component-definition whose control selections resolve against the canonical catalog via WS5's index — with rationale/evidence carried as remarks/props; validated in CI against NIST's published OSCAL schema; failing on unresolvable or withdrawn control tokens. | Artifact validates (oscal-cli or ajv); published alongside the npm package and linked from README's integration section; build fails on a fictitious control ID. | M | S-5 |
| R-WS9-07 | A `PROVENANCE` export shall travel with the data: dataset version, upstream versions (WS5), author, `reviewStatus: 'single-author-editorial'`, decision-point index (DP1–DP5 with summaries + source URLs), known limitations (editorial severity; 14-of-16 mapped; excluded families; orphan status). CHANGELOG.md (or an extracted DECISIONS.md) enters the package `files` array. An optional `decisionRefs?: string[]` field on mappings links entries to their governing DPs (e.g., ASI09 PM note → DP5), making CHANGELOG.md:257's dispute hook usable from the data side. A "Provenance & Limitations" SPA panel renders the manifest. | MIT consumers receive disclosures with the data; DP references resolvable; panel sourced from the manifest, not hand-maintained prose. | M | S-6 |

### WS10 — Governance & hygiene (modified A.2 + S-7) (effort: S–M; artifacts now, board gated)

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS10-01 | `GOVERNANCE.md`: roles (Maintainer/Reviewer/Contributor); **two-mode model** — Solo Mode (active): maintainer self-review checklist + CI gates as sole merge requirement; Board Mode: activates only when the trigger fires (≥ 2 external reviewers each having completed ≥ 1 public data-PR review), at which point branch protection requiring 1 approval on data paths is enabled (runbook documented). Every merge-gate claim is either CI-enforced today or labeled aspirational — no governance theater. | Doc names the active mode and the testable trigger; a data PR merges in Solo Mode with zero approvals but green CI. | S | A.2 mod |
| R-WS10-02 | `GOVERNANCE.md` designates `packages/crosswalk` as the sole canonical data location **before** any contribution template is published (ordering is load-bearing — templates naming two divergent copies would worsen drift). | Templates reference only canonical paths. | S | A.2 mod |
| R-WS10-03 | Issue forms "New Mapping Proposal" / "Mapping Correction" (required fields: affected IDs, proposed change, rationale, ≥ 1 authoritative citation per the Provenance Standard, confidence estimate, assumptions) + a PR template (rationale, citations, canonical-path checklist, local `pnpm test` pass). If WS6 lands first, field structure derives from the schema. | Forms block submission on empty required fields; template renders on new PRs. | S | A.2 mod |
| R-WS10-04 | Mapping Dispute Resolution built on the existing CHANGELOG DP convention (:257): issues labeled `mapping-dispute` referencing the DP number; Maintainer decision in Solo Mode / Board majority in Board Mode; every resolution recorded as a new DP. One worked example filed end-to-end (candidate: the SA-12 remap, R-WS3-01). | Label exists; process documented with response-time target; worked example closed through the process. | S | A.2 mod |
| R-WS10-05 | The Mapping Provenance Standard (≥ 1 verifiable authoritative source beyond editorial judgment, with matchable citation formats) is defined **once** in GOVERNANCE.md; WS4/WS7 tests cite it as their normative source. `CODEOWNERS` maps `packages/crosswalk/**` to the maintainer. | No second provenance definition exists (grep); CODEOWNERS resolves. | S | A.2 mod, AD-5 |
| R-WS10-06 | Derived-data drift check: a test (or CI step) regenerates the patterns JSON from `agentic-patterns.ts` via the documented tsx command and asserts equality with `db/patterns.json`; `db/` is either folded into the pnpm workspace or its npm lockfile explicitly enrolled in audit/renovate coverage with documented rationale. | Editing the taxonomy without regenerating fails CI; exactly one dependency-audit surface covers db/. | S | S-7 |
| R-WS10-07 | Supply-chain pruning: remove `axios` (zero imports, GT-12); rule on `server/index.ts` — document as local-preview-only and remove server bundling from the `build` script, **or** delete it in favor of `vite preview` (the analysis's own Hybrid Retentions commit to client-side static deployment; a bundled Express server contradicts it); audit remaining declared-but-unimported deps in the same pass. | `pnpm audit`/SBOM shows no unused network-capable deps; build output contains no server bundle (or the ruling is documented). | S | S-7 |

---

### WS11 — Governance-bridge integrity (ISO 42001 / EU AI Act) (effort: S–M; opened 2026-07-22 post-P4; depends: nothing blocking)

Opened after the 2026-07-22 correction of `FRAMEWORK_REFS` (CHANGELOG, *The Governance Bridge Cites the Wrong Clauses*). That change landed the clause registry `packages/crosswalk/src/framework-index.ts` and the resolve-and-match guard in `tests/framework-refs.test.ts`, closing the **citation-accuracy** defect. Everything below is what that change deliberately did **not** close. The suite is green; these remain open.

**Root cause worth carrying forward:** the NIST axis had a pinned upstream catalog (WS5) and the ISO/EU axis had nothing, so wrong ids were unrepresentable on one axis and invisible on the other. WS11-04 and WS11-06 are the ISO-side analogues of WS5's anchoring and drift watch — until they land, the asymmetry is reduced but not gone.

| ID | Requirement | Acceptance | Effort | Source |
|---|---|---|---|---|
| R-WS11-01 | Cite **A.6.2.8 (AI system recording of event logs)** on ASI10 (Rogue Agents) and ASI03 (Identity & Privilege Abuse). It is the most on-point Annex A clause for agent audit-trail risk and is currently referenced by **no** ASI; those risks route through the generic A.6.2.6 instead. | `A.6.2.8` appears in ≥ 1 `FRAMEWORK_REFS` entry; guard suite green. | S | Bridge correction follow-up 1 |
| R-WS11-02 | Add **A.10.3 (Suppliers)** to ASI04 alongside A.10.2. A.10.2 (*Allocating responsibilities*) is a weaker anchor than A.10.3 for a risk whose entire subject is supply chain. | ASI04 cites both A.10.2 and A.10.3. | S | Bridge correction follow-up 2 |
| R-WS11-03 | **`FRAMEWORK_REFS` is absent from `dist/crosswalk.json` and `dist/crosswalk.csv`.** `artifacts.ts` never emitted it, so the WS9 data product does not carry the governance bridge at all — non-TS consumers (GRC integrations, spreadsheets) cannot see it. Rule: emit it, or state in the package README that the bridge is a TS/ESM-only export. The 2026-07-11 CHANGELOG line "the field is exported with the data" is true only for TS importers and should be corrected either way. | `frameworkRefs` present in the JSON payload with a `dataVersion` bump, **or** README documents the omission and the CHANGELOG line is corrected. | S | Discovered during 2026-07-22 verification |
| R-WS11-04 | **Reconcile the registry against the purchased primary text.** `framework-index.ts` was built from two corroborating secondary sources (ISMS.online, Mindset Cyber); ISO/IEC 42001:2023 has not been bought. The guard proves *data matches registry* and cannot prove *registry matches ISO*. Buy the standard and diff all 38 controls before the bridge backs any paid deliverable. | Registry header records reconciliation against the primary text with a date; any deltas landed as a DP. | S (cost, not labor — the registry makes this a single-file diff) | VALIDATION.md residual risk |
| R-WS11-05 | Surface the **ISO-anchor gap** in the UI rather than leaving a reader to infer it from a short chip list. Four agentic control areas — agent identity issuance, credential scoping/TTL, network egress control, inter-agent authn/authz — have **no** Annex A anchor, because ISO 42001 is a management-system standard with no network/identity/credential controls. NIST 800-53r5 (AC, IA, SC, SR) carries exactly those, and CSA independently names AC/IA/AU/SR as the systematically-gapped families. Product decision, not a data fix. | Bridge panel (or adjacent copy) states where ISO is structurally silent and which 800-53 families cover it. | M | EXPANSION_ROADMAP §ISO gaps, item 3 |
| R-WS11-06 | **Drift watch for the ISO/EU axis** — the WS5 analogue. An ISO 42001 amendment or an EU AI Act consolidation would silently invalidate the registry with no signal, exactly as pre-WS5 NIST drift did. A cron cannot fetch a paywalled standard, so this is a dated review anchor (`lastReviewed` / `nextReviewDue` in the registry header, mirroring EXPANSION_ROADMAP) plus a test asserting the review is not overdue. | Registry carries ISO-8601 review anchors; a test fails when `nextReviewDue` has passed. | S | Structural parity with WS5 |

---

## 5. Sequenced Roadmap (supersedes gap-analysis §6)

Corrections applied, stated expressly: item 1 re-scoped (blocker refuted, GT-1); data unification inserted as the missing prerequisite; tests before migration (AD-7); data-accuracy fixes gate the confidence UI (no confidence layer over known-false statistics); WS5 placed after the ghost purge so its validation activates green; A.2/A.3 remainders converted from calendar timelines to **unlock gates**.

| Phase | Workstreams | Duration (single author, part-time) | Gate to next phase |
|---|---|---|---|
| **P0 — Truth & pipes** | WS0 (license/docs), WS1 (publish hardening) | 2–4 days | One successful gated publish (R-WS1-04); zero `@obviate` refs; single deploy path |
| **P1 — One source of truth** | WS2 (cutover + Home.tsx fix) | 3–5 days | `pnpm check/test/build` green; MS-*/MP-* tooltips correct on deployed Pages; stat cards show derived values |
| **P2 — Tests, then truth-in-data** | WS4 (suite → ~17+ tests w/ ratchets), then WS3 (ghost purge, SI-7, orphans, claim corrections) | 1–2 weeks | Suite green with allowlists at documented baselines; R-WS5-02 pre-activation run shows only allowlisted failures |
| **P3 — Upstream anchoring & data product** | WS5 (OSCAL index + validation + drift cron), WS9 (dist/JSON/CSV/OSCAL/provenance), WS8 (expansion roadmap annex) | 2–3 weeks | WS5 validation green; artifacts published on a tagged release; annex live with 6 families |
| **P4 — Structured evidence & transparency** | WS7 (evidence schema + backfill audit, validationStatus, Tier-2 report-only, VALIDATION.md, register); WS6 (YAML migration — **optional/severable**; execute only if contributor accessibility is still wanted after P0–P3) | 3–5 weeks (WS7); +2–3 weeks (WS6 if taken) | Tier-2 checks promoted to hard-fail as violation counts hit 0; every ASI ≥ 1 verifiable evidence item |
| **P5 — Gated governance** | WS10-01..05 artifacts ship with P2–P3 (cheap); **Board Mode, Tier-3 status promotion, and A.3's practitioner-review remainder unlock only on:** first external contributor PR **or** 2 confirmed onboarded reviewers | Artifacts: days. Unlock: external | Trigger condition in GOVERNANCE.md fires |

**WS11 (added 2026-07-22) sits outside P0–P5.** It was opened after the phase plan was written and has no blocking dependency on it. Suggested order: R-WS11-01/02 (S, editorial, do with the next data pass) → R-WS11-03 (S, closes a WS9 hole) → R-WS11-06 (S, structural parity with WS5) → R-WS11-05 (M, product decision) → R-WS11-04 (gated on purchasing the standard, and a hard prerequisite before the bridge backs anything sold).

**Prohibitions on sequencing, named:** Do not start WS6 before WS4 is green (AD-7). Do not ship R-WS7-04's confidence UI before WS3 completes (no transparency layer over false statistics). Do not publish contribution templates before R-WS10-02's canonical designation. Do not implement any second exclusion artifact, evidence schema, confidence design, or cutover path (AD-1..AD-4).

---

## 6. Traceability Matrix (gap → disposition → requirements)

| Gap | Original severity | This review | Closing requirements |
|---|---|---|---|
| G-01 static data | Critical | Confirmed, root cause refined to dual-copy + process absence | WS2 (all), WS5-01..04, WS6 (optional) |
| G-02 unvalidated assertions | High | Confirmed; confidence-score premise corrected (GT-10) | WS7-01..08, WS10-05 |
| G-03 scope exclusions | High | Confirmed + expanded (6 families, not 4 — GT-6) | WS8-01..05, WS4-06 |
| G-04 CI/CD non-operational | High | **Refuted** (GT-1); residual = publish pipeline | WS1-01..06 |
| G-05 shallow verification | Med-High | Confirmed (10 structural tests, package copy only) | WS4-01..06, WS5-02, WS7-06 |
| G-06 single-author provenance | Medium | Confirmed; board model corrected for CF-03 | WS10-01..05, WS9-07 |
| G-07 no update cadence | Medium | Confirmed | WS5-03/04, WS7-05/07, WS9-05 |
| G-08 low-confidence weights | Medium | Re-attributed: scrambler artifact, out of scope this TRD (GT-10) | Deferred — named in §2 |
| G-09 data drift | Low-Med | **Re-rated High/Structural** (GT-2/3/5/6/8) | WS2, WS3-01..04, WS10-06 |
| G-10 no contribution governance | Low | Confirmed | WS10-01..05 |
| NEW: dual-copy shipping | — | **High/Structural** | WS2 (owner) |
| NEW: license self-misreport | — | High (procurement-visible) | WS0-01..03 |
| NEW: unconsumable data product + ToS conflict | — | High (falsifies CF-05 mitigation) | WS9-01..07 |
| NEW: publish integrity | — | Medium-High | WS1-01..05 |
| NEW: supply-chain surface | — | Medium | WS10-06/07 |
| NEW: governance-bridge citation drift (ISO/EU axis unanchored while NIST axis pinned) | — | **High (procurement-visible; 7/10 entries shipped wrong)** | Citation accuracy CLOSED 2026-07-22; anchoring/drift/coverage remainder → WS11-01..06 |

---

## 7. Counterfactual Sensitivity (updated)

- **CF-03 (single-author forever) — design-dominant.** Every requirement outside P5's gate is solo-executable (NFR-8). Degradation is graceful and honest: all statuses stay `'editorial'`, Board Mode never activates, WS6 is skipped. Nothing collapses.
- **CF-07 (Actions disabled) — retired as refuted** (GT-1). Hedge retained anyway at zero marginal cost: NFR-5's local-parity scripts.
- **CF-01 (OWASP discontinues ASI):** WS5-03's version pinning makes the threat layer independently maintainable; WS9's artifacts make the editorial layer portable.
- **CF-02 (NIST publishes official mapping):** WS7's evidence layer and WS9-07's provenance are precisely the differentiators of an "agentic-specific interpretation" — value increases, not decreases.
- **CF-04 (monthly threat velocity):** WS7-07's incident-triggered path and WS8-05's 30-day event clause are the compensating controls; register appends are S-effort each.
- **CF-05 (FedRAMP-adjacent consumption):** now actually true post-WS9 + WS0 (machine-readable MIT boundary, provenance-attested artifacts) — it was false as presented.
- **CF-06 (pattern-taxonomy insufficiency):** out of scope here (simulator artifact); WS10-06 at least pins its derived data.
- **CF-08 (competing crosswalk emerges):** the moat this TRD builds is WS9 (consumable, provenance-carrying artifacts) + WS7 (verifiable evidence) — accelerate P3 if this materializes.

## 8. Verification Plan

1. **Per-requirement:** every R-* above carries testable acceptance criteria; ~70% are CI-enforced (vitest/grep/workflow assertions), the rest are one-time verifiable states (files, publishes, UI renders on the deployed Pages site).
2. **Phase gates:** §5's gate column is the release checklist; no phase starts before its predecessor's gate is verifiably met.
3. **Regression posture:** WS4's suite + WS6-04's semantic snapshot + R-WS2-04/WS4-06 grep guards make the three historical defect classes (copy drift, ghost references, silent scope change) unrepresentable rather than merely detected.
4. **Effort honesty:** automation is days; the true long pole is **editorial labor** (R-WS7-02's 30-incident audit, R-WS3-01/03's remaps with rationale) — the softest estimates in this document, flagged per the stated trust level.

---

*Prepared by: Claude (Opus 4.8), assuming the role of Principal Platform & Security Engineer — Compliance Tooling.*
*Evidence: 17-agent verification workflow against repo @ 42f1e88 (2026-07-10); 14 cross-recommendation conflicts adversarially surfaced and resolved in §3.*
*Companion document: "Gap Analysis and Remediation Options for AI Risk Management Design" (Manus AI, 2026-07-10).*
