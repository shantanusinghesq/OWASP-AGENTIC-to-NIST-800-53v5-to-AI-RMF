# Scratchpad — Agentic AI Risks ↔ AEGIS Relationship
**Status:** Draft (post-CoVE)
**Date opened:** 2026-04-30

## Context

Single author (Shantanu) wrote both this repo and AEGIS. HANDOFF.md flags a strategic decision pending: how should this repo relate to AEGIS? Earlier framing assumed `CROSSWALK` (here) and `ASI_CONTROL_MAPPING` (AEGIS) were duplicate editorial work. CoVE checks below revise that.

---

## CoVE Verification Questions

| ID | Question | Decision it affects |
|---|---|---|
| CoVE-01 | Are this repo's `CROSSWALK` and AEGIS's `ASI_CONTROL_MAPPING` actually the same shape of data? | D-01, D-04 |
| CoVE-02 | Does AEGIS have any AI-RMF mapping data? | D-01, D-04 |
| CoVE-03 | Does AEGIS have any NIST 800-53 control rationale or evidence citations? | D-01, D-04 |
| CoVE-04 | Is AEGIS already structured to consume an internal package? | D-02 |
| CoVE-05 | How big is the data this repo would extract? | D-02 effort estimate |

## CoVE Answers

### CoVE-01 — Shape of `CROSSWALK` vs. `ASI_CONTROL_MAPPING`
**FINDING:** NO, structurally different.
- This repo: `CROSSWALK[ASI] = { nist53: [{family, controls[], rationale}], aiRmf: [{func, cats[], rationale}], evidence: string }` (`client/src/lib/data.ts:93`).
- AEGIS: `ASI_CONTROL_MAPPING[ASI] = readonly ControlId[]` where `ControlId` is one of the 7 simulator-style booleans like `agent_limits`, `oversight_design` (`packages/shared/src/constants/weights.ts:162`).

AEGIS maps ASI → 7 abstract booleans for scoring. This repo maps ASI → specific NIST control IDs + AI-RMF subcategories + rationale + evidence. **Not duplicates — complementary.**

**Impact:** D-04 collapses (little reconciliation needed). New decision D-07 added: should AEGIS *consume* this repo's richer data to enrich reports?

### CoVE-02 — AI-RMF in AEGIS
**FINDING:** NO. `grep -rE "AI[-_]?RMF|aiRmf"` across `packages/` returns zero hits. AEGIS has no AI-RMF awareness at all.

**Impact:** Reinforces D-07 — AEGIS could meaningfully gain AI-RMF mapping if this repo's data is shared.

### CoVE-03 — NIST rationale / evidence in AEGIS
**FINDING:** NO. The `evidence`-keyed strings in AEGIS's report package (`packages/report/src/pdf/ControlGapAnalysis.tsx`, `RemediationRoadmap.tsx`) describe *per-customer questionnaire evidence* ("Implemented: fully operational with supporting evidence"), not the published-attack / CVE citations stored in `CROSSWALK[asi].evidence` here.

**Impact:** This repo's `evidence` field and `nist-control-descriptions.ts` (1,451 lines, 200+ controls) are unique editorial assets. AEGIS reports cite NIST controls by ID with no description text.

### CoVE-04 — AEGIS internal-package readiness
**FINDING:** YES. `pnpm-workspace.yaml` exists with `packages/*` glob; AEGIS already has 6 internal packages (`audit`, `events`, `inference`, `report`, `scoring`, `shared`) consumed via `workspace:*`. Adding `@aegis/crosswalk` would slot in mechanically.

**Impact:** D-02 Option C (workspace path) is essentially free.

### CoVE-05 — Extraction size
**FINDING:** 1,855 lines across three files (`data.ts` 250, `nist-control-descriptions.ts` 1,451, `nist-ai-rmf-descriptions.ts` 154). Pure data + thin TS interfaces, zero runtime dependencies.

**Impact:** Extraction is a few hours of work, not a project.

---

## Decision Points

### D-01 — What is the strategic posture of this repo relative to AEGIS?

| Criterion | A: Independent + shared package | B: Fold into AEGIS as `apps/learn` | C: Freeze, archive |
|---|---|---|---|
| Public discoverability of crosswalk data | High (separate repo, AGPL signal) | Medium (buried inside private monorepo) | Low (archived) |
| Editorial cost ongoing | Low (one source of truth) | Low | None — but data freezes |
| Coupling between codebases | Low | High | N/A |
| Branding / lead-gen for AEGIS | Weak (separate brand) | Strong (one product surface) | None |
| Reversibility | High | Medium (repo merge is hard to undo) | Low |
| Effort to reach | Low (~1 day extraction) | Medium (~3 days monorepo migration) | Low (port + delete) |

**Options considered:**
- A: Keep this repo standalone. Extract `data.ts` + descriptions into a permissively-licensed `@aegis/crosswalk` (or `@shantanusinghesq/crosswalk`) consumed by both. SPA imports its own data via the package; AEGIS imports it for report enrichment.
- B: Fold `client/` into AEGIS as `apps/learn`. One product, three surfaces (Learn → Try → Assess). Drop standalone repo.
- C: Freeze this repo. Port data into AEGIS. Archive.

**Accepted:** Option **A** — preserves the public-good posture of the crosswalk, ends self-duplication, and lets AEGIS strategy stay flexible. Reversible to B if a unified-product story later emerges.

**Rejected:** Option B
**Reasoning against B:** Premature commitment. The unification thesis (Learn → Try → Assess funnel) is plausible but unvalidated; folding in the SPA before validating that customers actually browse before assessing locks in a UX bet. Also collapses the AGPL public-good signal that's load-bearing for community trust on a security artifact.

**Rejected:** Option C
**Reasoning against C:** Throws away the SPA's accessibility work (per `CHANGELOG.md` v0.5.0/0.5.1/0.5.2), the Evidence Explorer search, and the public discoverability that an independent repo provides. The Scenario Simulator is also genuinely educational on its own — burying it inside AEGIS's paid funnel destroys that.

**Assumption accepted:** The crosswalk data has independent value as a public reference even after AEGIS exists.
**Assumption rejected:** That maintaining two repos is meaningfully more expensive than one — given the data is ~1,855 lines of static TS and changes infrequently, the maintenance delta is small.

---

### D-02 — How is the shared crosswalk data physically distributed? (only if D-01 = A)

**Options considered:**
- A: Published private npm package (`@shantanusinghesq/crosswalk` on a private registry).
- B: Git submodule from this repo into AEGIS.
- C: pnpm `overrides` / workspace path pointing into a sibling clone of this repo on disk.
- D: Copy-paste / manual sync (status quo).

**Accepted:** Option **A** — published private package. Clean dependency graph; no path-coupling between developer machines; AEGIS pins a version.

**Rejected:** Option B
**Reasoning against B:** Submodules are a known foot-gun (detached HEADs, missing fetches in CI, broken clones for new devs). The AEGIS HANDOFF already documents pnpm-9 fragility — adding submodule complexity on top is asking for trouble.

**Rejected:** Option C
**Reasoning against C:** Requires AEGIS contributors to clone this repo at a specific path. Breaks CI without further glue. Couples dev environments.

**Rejected:** Option D
**Reasoning against D:** This is the status quo and the entire reason for this scratchpad.

**Assumption accepted:** A private npm registry is available or trivially set up (e.g., GitHub Packages, Verdaccio, or paid npm Pro).
**Assumption rejected:** That public-npm-publish is acceptable — the crosswalk data's value to Obviate AI is nontrivial and freely-published lookup data invites scraping into competitor products.

---

### D-03 — How is the extracted crosswalk data licensed?

| Criterion | A: AGPL-3.0 | B: Dual-license | C: MIT/Apache |
|---|---|---|---|
| AEGIS (private, commercial) can consume | NO (would force AEGIS source disclosure) | YES (under permissive arm) | YES |
| Public good signal preserved | Strong | Strong (SPA stays AGPL) | Weak |
| Competitor consumption acceptable | Acceptable (must open-source) | Concerning (permissive arm freely usable) | Concerning |
| Complexity | Low | Medium (LICENSE-DATA + LICENSE) | Low |

**Options considered:**
- A: Keep AGPL-3.0 on the data package as well. AEGIS cannot consume.
- B: Dual-license — SPA stays AGPL-3.0 (defends public-good repo); the extracted `@shantanusinghesq/crosswalk` package is MIT (so AEGIS can consume cleanly).
- C: Relicense everything as MIT/Apache.

**Accepted:** Option **B** — dual-license. The SPA shell (UI, layout, styling, accessibility work) stays AGPL because that's where the original public-good intent applies. The data package (citations of NIST 800-53 and OWASP ASI, plus Shantanu's editorial rationale) is MIT so AEGIS and any commercial consumer can use it.

**Rejected:** Option A
**Reasoning against A:** Defeats the entire purpose of extracting a shared package — AEGIS still cannot consume it.

**Rejected:** Option C
**Reasoning against C:** Throws away the AGPL signal on the public SPA without offsetting benefit. The SPA is the public-good front; the data package is the consumption interface. Different licensing serves different goals.

**Assumption accepted:** Author can dual-license his own work freely (single copyright holder, no contributor agreements outstanding).
**Assumption rejected:** That AGPL would somehow taint AEGIS via static type imports alone — internal use without distribution doesn't trigger AGPL §13. (Still, dual-license is safer and explicit.)

---

### D-04 — When `CROSSWALK` and AEGIS's `ASI_CONTROL_MAPPING` disagree, which is canonical?

**FINDING from CoVE-01:** They are not the same shape. There is little to reconcile. The only overlap is the ASI risk identifiers themselves (ASI01–ASI10), and those agree.

**Accepted:** No reconciliation needed. Both stay; they describe different things. ASI identifiers are canonicalized in the shared `@shantanusinghesq/crosswalk` package; both this repo and AEGIS import from there. AEGIS's `ASI_CONTROL_MAPPING` (ASI → 7 booleans) stays in `@aegis/shared` because it's tied to AEGIS's scoring logic, not the public crosswalk.

**Rejected:** Cell-by-cell editorial reconciliation
**Reasoning against:** Was the original recommended path; CoVE-01 invalidated it. There is nothing meaningful to reconcile beyond ASI ID/name/severity/desc, which are already in agreement.

---

### D-05 — Should this repo adopt AEGIS's quality-gate stack now?

**Options considered:**
- A: Adopt full stack now (`knip`, `madge`, `verify-deps`, `check:all`, ESLint flat config).
- B: Adopt only data-integrity tests (Vitest checks that every `CROSSWALK[asi].nist53[].controls[]` resolves in `nist-control-descriptions.ts`, every `aiRmf.cats` exists in `AI_RMF`, every ASI has ≥1 mapping).
- C: Defer all until D-01 / D-02 land.

**Accepted:** Option **B** — data-integrity tests now, the rest deferred.

**Rejected:** Option A
**Reasoning against A:** `knip`, `madge`, `verify-deps` provide value mostly in monorepos with many packages. This is a single-package SPA. Marginal value, real setup cost.

**Rejected:** Option C
**Reasoning against C:** Data-integrity tests are the highest-leverage check for this repo specifically — the data IS the product, and there's currently no guard against silent drift. They cost ~30 lines of Vitest and pay back the moment anyone edits `data.ts`. Cheap enough to do regardless of D-01.

**Assumption accepted:** Data-integrity tests are useful in any of the three D-01 outcomes (kept locally if standalone, lifted into the shared package if extracted).

---

### D-06 — Should `pnpm-lock.yaml` be committed?

**Options considered:**
- A: Commit the lockfile. Standard practice. Enables `--frozen-lockfile` in CI for reproducible builds.
- B: Keep gitignored (status quo). Deliberate prior choice.

**Accepted:** Option **A** — commit. The argument for B is unclear from the .gitignore comment ("Lock files") — likely a leftover from when this repo was a Manus playground rather than a production artifact. With CI now running real Pages deploys and the goal of extracting a shared package, reproducibility matters.

**Rejected:** Option B
**Reasoning against B:** Forces `--no-frozen-lockfile` in CI (current state after this session's workflow fix), which means CI installs whatever pnpm resolves on the day. A transitive dep can ship a bad version and break the deploy without any change in this repo. That's the exact scenario lockfiles exist to prevent.

**Assumption accepted:** Whatever original reason gitignored the lockfile (Manus harness?) is no longer load-bearing.
**Assumption rejected:** That the user explicitly intended `pnpm-lock.yaml` to be gitignored as a long-term decision — the surrounding comments are generic ("Lock files"), not justified.

---

### D-07 — Should AEGIS reports consume this repo's rich crosswalk data? (NEW from CoVE-01/02/03)

**Options considered:**
- A: Yes — AEGIS imports `@shantanusinghesq/crosswalk` to enrich reports with NIST control rationale, AI-RMF mapping, and published-attack evidence citations per ASI.
- B: No — AEGIS reports stay scoped to questionnaire-derived findings; crosswalk is reference-only.

**Accepted:** Option **A** — but as a Phase 2 follow-up after D-01/D-02 ship, not part of the initial extraction.

**Rejected:** Option B
**Reasoning against B:** Tony's review (per AEGIS HANDOFF P1) flagged that "0.300 exposure means nothing to a lawyer." The rationale text and AI-RMF mapping in this repo's `CROSSWALK` are exactly the bridge from technical score to compliance language that the report currently lacks. Refusing to use it leaves AEGIS reports thinner than they need to be.

**Assumption accepted:** Report-layer consumption can be additive — wrap rich crosswalk lookups behind a feature flag or scoped section, no breaking change to existing report templates.
**Assumption rejected:** That report integration must wait on customer demand — the editorial work is already done; not using it is leaving value on the table.

---

## Assumptions Register

### Accepted Assumptions
| ID | Assumption | Rationale | Decision |
|---|---|---|---|
| A-01 | Crosswalk has independent value as public reference even with AEGIS existing | Distinct audience: public reference vs. paid assessment | D-01 |
| A-02 | Maintaining two repos is cheap (data is small + stable) | 1,855 LOC, infrequent edits per CHANGELOG cadence | D-01 |
| A-03 | Private npm registry is available or trivial to set up | GitHub Packages exists; Obviate already operates infra | D-02 |
| A-04 | Single copyright holder can dual-license freely | Confirmed in conversation 2026-04-30 | D-03 |
| A-05 | Data-integrity tests are useful regardless of D-01 outcome | Tests follow the data wherever it lives | D-05 |
| A-06 | The original gitignore of `pnpm-lock.yaml` is no longer load-bearing | Generic "Lock files" comment, no documented rationale | D-06 |
| A-07 | AEGIS report can consume crosswalk additively | Report templates already accept optional sections | D-07 |

### Rejected Assumptions
| ID | Assumption | Why Rejected | Decision |
|---|---|---|---|
| R-01 | `CROSSWALK` and `ASI_CONTROL_MAPPING` are duplicate editorial work | CoVE-01: structurally different — complementary, not duplicative | D-04 |
| R-02 | Public-npm publish of crosswalk is acceptable | Invites competitor scraping into derivative products | D-02 |
| R-03 | AGPL would taint AEGIS via type-only imports | Internal use without distribution doesn't trigger §13; but dual-license is explicit/safer | D-03 |
| R-04 | Cell-by-cell reconciliation between the two crosswalks is needed | CoVE-01: shapes don't overlap meaningfully | D-04 |
| R-05 | Quality-gate stack (`knip`, `madge`, etc.) is high-leverage here | Single-package SPA — most monorepo gates don't apply | D-05 |
| R-06 | Lockfile gitignore was an explicit production decision | Comment is generic; likely Manus-harness leftover | D-06 |
| R-07 | Report enrichment must wait for customer demand | Editorial work is sunk cost; not using it leaves value unrealized | D-07 |

---

## Summary

| Decision | Outcome |
|---|---|
| D-01 | **A** — Keep standalone, extract shared package |
| D-02 | **A** — Private npm registry |
| D-03 | **B** — Dual-license: SPA AGPL, package MIT |
| D-04 | **No reconciliation needed** (CoVE invalidated premise) |
| D-05 | **B** — Data-integrity tests now, monorepo gates deferred |
| D-06 | **A** — Commit `pnpm-lock.yaml` |
| D-07 | **A (Phase 2)** — AEGIS consumes crosswalk for report enrichment, after D-01/D-02 ship |

**Sequencing:** Data-integrity tests (D-05) → lockfile commit (D-06) → package extraction with dual-license (D-01/D-02/D-03) → AEGIS consumption (D-07).

D-04 is closed — no work needed. The "double-curation" framing in HANDOFF.md is incorrect and should be revised.
