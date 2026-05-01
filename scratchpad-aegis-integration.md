# Scratchpad — Integrate AEGIS with `@obviate/crosswalk`
**Status:** Draft (post-CoVE)
**Date opened:** 2026-05-01

## Context

`@obviate/crosswalk` was extracted from the SPA in this repo earlier today (Phase 3 of the recommended sequence; see `scratchpad-aegis-relationship.md` D-01/D-02/D-03). Phase 4 — actually wiring AEGIS to consume it — was deferred. This scratchpad plans Phase 4.

Implementation work executes in `/Users/shantanusingh/Projects/AEGIS`. This file lives here because it records this repo's stance on consumption (versioning, publication, surface area).

---

## CoVE Verification Questions

| ID | Question | Decision it affects |
|---|---|---|
| CoVE-01 | Where in AEGIS is `ASI_CONTROL_MAPPING` consumed? Replace or coexist? | D-05 |
| CoVE-02 | What does AEGIS's report layer currently render per ASI? Where does crosswalk slot in? | D-02, D-03 |
| CoVE-03 | What's AEGIS's policy for adding cross-repo dependencies? | D-01 |
| CoVE-04 | Does AEGIS have any AI-RMF awareness today? | D-03 |

## CoVE Answers

### CoVE-01 — `ASI_CONTROL_MAPPING` consumers
**FINDING:** 4 sites; 3 are scoring math, 1 is rendering.
- `packages/shared/src/constants/weights.ts:236, 305` — internal lookup helpers
- `packages/audit/src/explain-score.ts:23, 405, 467` — score explanation
- `packages/scoring/src/stage1.ts:227` — Stage 1 attenuation math
- `packages/report/src/pdf/RemediationRoadmap.tsx:161` — rendered to PDF

**Impact:** D-05 has a clear answer — coexist. The boolean mapping is load-bearing for scoring; only the rendering site benefits from the rich crosswalk. Don't touch the scoring path.

### CoVE-02 — Report rendering surface
**FINDING:** `RemediationRoadmap.tsx` renders per-gap cards with NIST control IDs (`gap.nist_controls`) and a "Mitigating Controls" line that joins `ASI_CONTROL_MAPPING[asi]` through `CONTROL_DISPLAY_NAMES`. No rationale text. No AI-RMF mapping. No evidence citations. The full PDF section list (`packages/report/src/pdf/`):
```
ASIRiskMatrix · AttackTreeSection · Attestation · ControlGapAnalysis ·
CoverPage · DomainContextSection · ExecutiveSummary · GlossarySection ·
LegalNoticesSection · Methodology · ReadingThisReportSection ·
RemediationRoadmap · ReportDocument
```
None reference AI-RMF.

**Impact:** Two natural integration points: (a) augment `RemediationRoadmap` per-gap with crosswalk rationale + evidence; (b) add a new top-level section `AuthoritativeReferences` that renders the full crosswalk per ASI in scope. D-02/D-03 below.

### CoVE-03 — Cross-repo dep policy
**FINDING:** AEGIS enforces `frozen-lockfile=true`, `save-exact=true`, `audit=true`, `strict-peer-dependencies=true` (see `.npmrc`). CLAUDE.md "Adding New Dependencies Safely" prescribes:
```
pnpm add <package> --filter @aegis/<workspace>
git diff pnpm-lock.yaml
# review hash + provenance, run pnpm audit
```
Lockfile changes require explicit PR review.

**Impact:** Cannot use `file:` or `link:` for production builds — those don't satisfy `frozen-lockfile`. Either publish `@obviate/crosswalk` to a registry that produces a deterministic integrity hash, or vendor (copy the source into AEGIS). Frames D-01.

### CoVE-04 — AEGIS AI-RMF awareness
**FINDING:** Zero. Confirmed by prior CoVE in `scratchpad-aegis-relationship.md`. Reinforced — no AI-RMF symbols anywhere in `packages/`.

**Impact:** Adopting crosswalk gives AEGIS a brand-new capability it has never had. This is the most material gain from the integration; weight D-03 toward shipping AI-RMF first.

---

## Decision Points

### D-01 — How does AEGIS pull in `@obviate/crosswalk` given strict frozen-lockfile policy?

| Criterion | A: GitHub Packages | B: npm Pro | C: Vendor (copy source) | D: `file:` link |
|---|---|---|---|---|
| Satisfies `frozen-lockfile=true` | Yes | Yes | Yes (no ext dep) | **No** — path resolves differently per env |
| Satisfies `save-exact=true` | Yes (pin SHA) | Yes | N/A | N/A |
| Single source of truth preserved | Yes | Yes | **No** — copies diverge | Yes |
| Cost | $0 (existing GH org) | ~$7/user/mo | $0 | $0 |
| Setup effort | Medium (~2 hrs: GH workflow + `.npmrc` + token) | Low | Trivial | Trivial |
| Cross-machine reproducibility | Yes | Yes | Yes | No |

**Options considered:**
- A: Publish to GitHub Packages from this repo on version tags; AEGIS pulls via authenticated `.npmrc`.
- B: Publish to npm Pro (paid private registry).
- C: Copy `packages/crosswalk/` source into AEGIS's `packages/crosswalk/` (vendor).
- D: Use `file:../Agentic AI Risks/packages/crosswalk` in AEGIS's `package.json`.

**Accepted:** Option **A** — GitHub Packages publish from this repo, consumed by AEGIS via authenticated `.npmrc`.

**Rejected:** Option B
**Reasoning against B:** No incremental capability over GitHub Packages. Costs money; this is a one-package use case with no ecosystem need (no scoped packages already on npm Pro, no team-distribution problem to solve).

**Rejected:** Option C
**Reasoning against C:** Defeats the entire point of extracting the package. Two copies of the same data drift the moment one of them is edited; we just spent a session establishing a single source of truth (D-04 in prior scratchpad).

**Rejected:** Option D
**Reasoning against D:** `file:` paths produce different lockfile entries per developer machine (absolute path differences) and don't generate integrity hashes. Breaks AEGIS's `frozen-lockfile=true` immediately.

**Assumption accepted:** Both repos are/will be hosted under the same GitHub org or user account (`haremantra`), so a single `GITHUB_TOKEN` at AEGIS's CI grants read access to packages published from this repo.
**Assumption rejected:** That a registry-less workspace symlink across two unrelated git repos is feasible — pnpm workspaces don't span repository roots without bespoke tooling.

---

### D-02 — Where does crosswalk render in the AEGIS PDF report?

**Options considered:**
- A: Augment existing `RemediationRoadmap.tsx` only — minimum diff.
- B: Add a new top-level section `AuthoritativeReferences` for the full per-ASI crosswalk; leave `RemediationRoadmap` alone.
- C: Both — minor enhancement to `RemediationRoadmap` (1-line evidence citation per card) + new `AuthoritativeReferences` section after `ControlGapAnalysis`.

**Accepted:** Option **C** — both. The Roadmap card is the natural home for a one-line citation ("Cited evidence: …"); the dedicated section is where the AI-RMF mapping and full rationale live without bloating the Roadmap.

**Rejected:** Option A
**Reasoning against A:** Cramming AI-RMF subcategories + 4 rationale paragraphs + evidence citations into a per-gap card destroys the Roadmap's compact actionable form. The Roadmap is for the remediation team; a 1-pager-per-ASI crosswalk is for the auditor.

**Rejected:** Option B
**Reasoning against B:** Misses the lowest-friction win — adding the evidence citation line in the Roadmap takes ~5 LOC and addresses Tony's "0.300 means nothing to a lawyer" concern (per AEGIS HANDOFF P1 review) directly in the most-read section.

**Assumption accepted:** Adding sections to the PDF is additive; existing snapshot tests (if any) for other sections continue to pass.
**Assumption rejected:** That a single combined section is enough — the audience split (remediation team vs. auditor) is real.

---

### D-03 — What ships in the first integration PR vs. follow-ups?

| Capability | Ship in PR1 | Why |
|---|---|---|
| Evidence citation line in `RemediationRoadmap` cards | **Yes** | 5 LOC. Direct response to Tony's review. Visible value. |
| New `AuthoritativeReferences` section: NIST 800-53 mappings + rationale per ASI | **Yes** | Rich content already exists in crosswalk; PDF rendering is mechanical. |
| `AuthoritativeReferences` section: AI-RMF mappings + rationale per ASI | **Yes** | This is AEGIS's first AI-RMF awareness ever (CoVE-04). Material differentiator. |
| `AuthoritativeReferences` section: NIST control descriptions (full text, expandable) | **Defer** | T4 has 3 missing descriptions; rendering "TBD" looks bad. Ship after backfill. |
| `AuthoritativeReferences` section: AI-RMF cat descriptions | **Defer** | T6b has 28 missing entries (entire MAP/MEASURE/MANAGE). Ship after backfill. |
| Glossary updates referencing crosswalk | Defer | Editorial; can land in any later PR. |
| Search index of crosswalk for future report drill-downs | Defer | No reader use case until the section ships. |

**Accepted:** Ship the three Yes rows in PR1. Defer description-rendering until T4/T6b TODOs land.

**Rejected:** "Ship everything at once"
**Reasoning against:** Description rendering depends on backfilling missing entries; shipping with "Description: TBD" rendered for ¾ of AI-RMF cats undermines the report's professionalism.

**Rejected:** "Ship only the evidence line; defer the section to PR2"
**Reasoning against:** AI-RMF awareness is the most material new capability; no reason to delay it. The crosswalk section without descriptions still renders meaningful content (mapping IDs + rationale).

**Assumption accepted:** AEGIS's PDF tests are tolerant of new section additions (per CoVE-02, sections are independent React components).
**Assumption rejected:** That backfilling descriptions before any AEGIS integration is the right ordering — no, ship what's clean now, backfill in parallel.

---

### D-04 — Backwards compatibility / opt-in?

**Options considered:**
- A: Default-on. Every AEGIS report gets the new section.
- B: Feature-flagged via `GenerateReportOptions` (e.g., `includeCrosswalk: boolean`).
- C: Default-on, but only when assessment includes `domain_context` (proxy for "real customer assessment, not synthetic test").

**Accepted:** Option **A** — default-on.

**Rejected:** Option B
**Reasoning against B:** Adds API surface area for a question that has one defensible answer. Customers want richer reports; there's no scenario where opting out improves anything. Synthetic reports (per AEGIS HANDOFF: 6 LaxParents PDFs) get the same treatment, which is fine — they're test fixtures, not deliverables.

**Rejected:** Option C
**Reasoning against C:** Conflates two unrelated concerns (domain context = harm scenarios; crosswalk = control rationale). A real customer might submit an assessment without domain context yet still want the crosswalk reference material.

**Assumption accepted:** Existing snapshot tests need rebaselining once but no semantic regression.
**Assumption rejected:** That A/B testing the section's value is necessary — its value (AI-RMF awareness) is unambiguous.

---

### D-05 — Replace `ASI_CONTROL_MAPPING` with crosswalk-derived data?

**Options considered:**
- A: Replace. Derive AEGIS's `ASI_CONTROL_MAPPING` from `CROSSWALK[asi].nist53[].family` at build time.
- B: Coexist. Crosswalk supplies rendering data; existing `ASI_CONTROL_MAPPING` continues to drive scoring math.

**Accepted:** Option **B** — coexist (per CoVE-01).

**Rejected:** Option A
**Reasoning against A:** The two data structures answer different questions. `ASI_CONTROL_MAPPING` says "which of the 7 simulator booleans matters for ASI X" — used in Stage 1 attenuation math. `CROSSWALK[asi].nist53` says "which specific NIST control IDs apply to ASI X" — used for human-readable output. Deriving one from the other would require a `family → boolean` reverse mapping that doesn't naturally exist (one family maps to multiple booleans and vice versa). High coupling, no benefit.

**Assumption accepted:** Scoring math is stable; touching it requires F2-style design effort (per AEGIS's prior `MITIGATION_BY_STATE` decision in HANDOFF) — not in scope for this integration.
**Assumption rejected:** That a single source of truth requires ALL data to come from one place. Different audiences, different abstractions; both can be canonical for their respective uses.

---

### D-06 — Block integration on T4/T6b backfill, or ship with placeholders?

T4: 3 missing NIST control descriptions (`AC-25`, `AU-16`, `CM-14`).
T6b: 28 missing AI-RMF cat descriptions (entire MAP/MEASURE/MANAGE).

**Options considered:**
- A: Block — backfill all 31 missing descriptions before AEGIS integration ships.
- B: Ship integration without rendering descriptions (only render IDs + crosswalk's rationale text). Backfill in parallel; render descriptions in PR2.
- C: Ship integration with placeholders ("Description: TBD") for missing entries.

**Accepted:** Option **B** — ship without description rendering. Defer to PR2 when descriptions are complete.

**Rejected:** Option A
**Reasoning against A:** 31 entries of editorial text is days of work. Blocks the AI-RMF reveal — the most material capability — for that long. Decoupling means progress can happen in parallel.

**Rejected:** Option C
**Reasoning against C:** "TBD" rendered repeatedly throughout an audit-ready PDF undermines the report's credibility with the actual auditor reading it. Empty is better than placeholder.

**Assumption accepted:** Crosswalk's `rationale` field per mapping is itself substantial enough to render meaningfully without the description text appended. (Confirmed by inspection — rationale strings are 1–3 sentences, audit-grade.)
**Assumption rejected:** That description rendering is the load-bearing value — no, the mapping + rationale + AI-RMF presence is.

---

### D-07 — Test coverage for the integration

**Options considered:**
- A: Snapshot test the new `AuthoritativeReferences` PDF section against a fixed assessment fixture.
- B: Differential test: render the report twice (with and without `@obviate/crosswalk` import), assert the new section appears + is non-empty for every ASI in the fixture.
- C: Both A + B.
- D: No new tests; rely on existing report snapshot tests to detect breakage.

**Accepted:** Option **C** — both. Snapshot for content stability; differential for "does the integration actually run."

**Rejected:** Option A alone
**Reasoning against:** Snapshots regress silently if someone updates the snapshot mechanically without reading the diff. A differential test catches "the new section is conditionally absent for some ASI" — a bug snapshots can mask.

**Rejected:** Option D
**Reasoning against D:** Existing snapshots cover existing sections; a brand-new section has no baseline. Untested code in a PDF report layer is exactly where Tony's review surfaces issues post-ship.

**Assumption accepted:** Adding a new test file in `packages/report/tests/` doesn't disturb the existing test budget (598 unit tests per AEGIS HANDOFF; 10 more is noise).
**Assumption rejected:** That snapshot-only testing is sufficient — it isn't, because rendering "[]" for AI-RMF mappings would still serialize to a valid (but useless) snapshot.

---

## Assumptions Register

### Accepted Assumptions
| ID | Assumption | Rationale | Decision |
|---|---|---|---|
| A-01 | Both repos hosted under same GH org/user, single token grants read | User confirmed sole authorship; default GH posture | D-01 |
| A-02 | PDF section additions are additive, don't break existing tests | Sections are independent React components per CoVE-02 | D-02, D-04 |
| A-03 | Crosswalk's `rationale` strings stand alone without description text | 1–3 sentence audit-grade prose per mapping (verified by inspection) | D-06 |
| A-04 | AEGIS scoring math is stable; integration is render-only | F2 closure documented in AEGIS HANDOFF; no scoring drift in scope | D-05 |
| A-05 | Existing snapshot tests need one rebaseline, no semantic regression | Pure additive change | D-04 |

### Rejected Assumptions
| ID | Assumption | Why Rejected | Decision |
|---|---|---|---|
| R-01 | `file:` or `link:` deps are workable across repos | Path differs per machine; no integrity hash; breaks `frozen-lockfile` | D-01 |
| R-02 | Cross-repo pnpm workspace symlink is viable | pnpm workspaces don't span git repository roots | D-01 |
| R-03 | One combined report section serves both remediation team and auditor | Different audiences need different density | D-02 |
| R-04 | Description backfill must precede any AEGIS integration | Decouples; backfill can land in PR2 in parallel | D-03, D-06 |
| R-05 | A/B test the new section before defaulting on | Value is unambiguous (AI-RMF awareness); A/B adds API surface for no gain | D-04 |
| R-06 | Single source of truth requires ALL data from one place | Different abstractions can each be canonical for their use | D-05 |
| R-07 | Snapshot tests alone are sufficient | They serialize empty-but-valid output, masking integration failures | D-07 |

---

## Summary

| Decision | Outcome |
|---|---|
| D-01 | **A** — Publish `@obviate/crosswalk` to GitHub Packages; AEGIS pulls via authenticated `.npmrc` |
| D-02 | **C** — Both: 1-line evidence citation in `RemediationRoadmap` + new `AuthoritativeReferences` section |
| D-03 | Ship NIST mappings + AI-RMF mappings + evidence in PR1; defer description rendering to PR2 (post-backfill) |
| D-04 | **A** — Default-on; no feature flag |
| D-05 | **B** — Coexist (scoring keeps boolean mapping; rendering uses rich crosswalk) |
| D-06 | **B** — Ship without rendering descriptions; backfill T4/T6b in parallel |
| D-07 | **C** — Snapshot test + differential test |

## Execution sequence (PR1 + parallel work)

**Track A — `@obviate/crosswalk` publishing (this repo)**
1. Add `publishConfig.registry` and `repository` to `packages/crosswalk/package.json`.
2. Create `.github/workflows/publish-crosswalk.yml` triggered on tags matching `crosswalk-v*`.
3. Tag `crosswalk-v0.1.0`, push, verify package appears in GH Packages.

**Track B — AEGIS PR1 (in `/Users/shantanusingh/Projects/AEGIS`)**
1. Configure `.npmrc` for `@obviate` scope pointing to GH Packages registry.
2. `pnpm add @obviate/crosswalk@0.1.0 --filter @aegis/report`. Review lockfile diff per AEGIS CLAUDE.md "Adding New Dependencies Safely".
3. Modify `packages/report/src/pdf/RemediationRoadmap.tsx:161` — append a one-line evidence citation pulled from `CROSSWALK[gap.asi_id].evidence` after the "Mitigating Controls" row.
4. Create `packages/report/src/pdf/AuthoritativeReferences.tsx` — per-ASI section rendering `nist53` mappings (family + control IDs + rationale) and `aiRmf` mappings (function + cats + rationale).
5. Wire into `ReportDocument.tsx` after `ControlGapAnalysis`.
6. Snapshot test (`packages/report/tests/authoritative-references.test.tsx`) + differential test (rendering with vs. without crosswalk; assert section non-empty for every ASI in fixture).
7. Update AEGIS HANDOFF.md "Carryover from AEGIS HANDOFF" → mark P1.5 enhanced via `@obviate/crosswalk`.

**Track C — Description backfill (this repo, in parallel)**
- T4 (`AC-25`, `AU-16`, `CM-14`): 3 NIST control descriptions in `nist-control-descriptions.ts`.
- T6b (28 entries): all `MP-*`, `MS-*`, `MG-*` AI-RMF descriptions in `nist-ai-rmf-descriptions.ts`.
- Unskip the corresponding tests in `packages/crosswalk/tests/data.integrity.test.ts`.
- Bump to `0.2.0` and re-publish.

**AEGIS PR2** (after Track C lands): import descriptions from `@obviate/crosswalk@^0.2.0`, render expandable per-control descriptions in `AuthoritativeReferences`.

## Sequencing note

Tracks A, B, C can run in parallel. PR1 in AEGIS gates on Track A only (needs the package to be installable). PR2 in AEGIS gates on Track C (needs descriptions complete) AND PR1 merging.

The smallest end-to-end demonstration is: **publish `0.1.0` → AEGIS PR1 → re-render the LaxParents synthetic report** (per AEGIS HANDOFF) and visually diff the new sections.
