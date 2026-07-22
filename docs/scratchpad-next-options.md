# Scratchpad — Next Options
**Status:** Draft — CoVE executed (3 checks, 1 changed a recommendation)
**Date opened:** 2026-07-22

## Context

Phase 1 (ISO 42001 citation correction + clause registry + resolve-and-match guard) is complete and green: 117/117 tests, `pnpm check` clean, build emits `dataVersion: 0.10.0`, UI verified live at the tightest breakpoint. Phase 2 (`docs/role-outputs/08-product-manager.md`) is written. Six residual items are filed as `docs/trd/TRD-GAP-REMEDIATION.md` §WS11.

Nothing is committed. The working tree sits on branch `remediation/pr2-comprehension-design` and carries 9 modified + 2 new tracked files.

This scratchpad decides what happens next across four forks: how to land the code, whether to execute any WS11 item now, whether to keep building or go talk to buyers, and whether to buy ISO/IEC 42001:2023.

## Prior Art

- **obviate-archaeology** `dec-002-06` [acc, 2026-07-11]: "Gate verdict: GO interviews now; HOLD surfacing slice until a claim scores mean ≥3/6 on R+D…; **no more analysis documents until interview data**" — same founder, same buyer-facing question, ruled 11 days ago. Directly governs D-03, and indicts the document we produced today.
- **obviate-archaeology** `dec-001-07` [acc, 2026-05-20]: "Platform-vs-plug-in fork remains unresolved by design — to be decided after customer interviews, **not by further analysis**" — the same fork-shaped question deliberately left open pending buyer contact. The `/acc`-vs-crosswalk sequencing question in D-03 is the identical shape.
- **OWASP-AGENTIC** `rej-003-04` [acc, 2026-07-11]: "Fixing all 107 OSCAL title divergences now — deferred: editorial, overwhelmingly on unreferenced description keys." — *this repo*, deferring editorial coverage work to keep a correctness change focused. WS11-01/02 are the same class.
- **linuxshanti** `spdec-009-01` [scratchpad, 2026-07-20]: "the fix commit should contain exactly the fix; the migration is real future work but belongs to a future change set, where it is motivated by **an actual forcing function** rather than by this session's refuted hypothesis." — the governing precedent for D-02.

---

## D-01 — How should the Phase 1 + Phase 2 work be landed?

| Criterion | A: commit on current branch | B: new branch off main + PR | C: commit direct to main |
|---|---|---|---|
| Concern coherence | ✗ mixes governance-bridge fix into a comprehension-audit branch | ✓ self-contained releasable unit | ✓ coherent, but no review surface |
| Matches recent repo convention | partial | ✓ PRs #38, #39 both merged this way | ✗ diverges from last two changes |
| Required by tooling? | — | **No** — CoVE-03: main is unprotected | allowed |
| Review visibility of a P1 data correction | ✗ buried under 8 unrelated UI files | ✓ diff is exactly the correction | ✗ none |
| Cost | none | one branch switch (zero file overlap — CoVE-02) | none |

**Options considered:**
- A: Commit onto `remediation/pr2-comprehension-design`
- B: New branch off `origin/main`, open a PR
- C: Commit direct to `main`

**Accepted:** Option **B** — the change carries a CHANGELOG Decision Point and a semver bump, which makes it a self-contained releasable unit that deserves its own diff.

**Rejected:** Option A
**Reasoning against A:** CoVE-02 shows the branch's single commit touches 8 files — 7 `client/` UI components plus one comprehension-audit scratchpad — with **zero overlap** against the 11 files this work touches. The two change sets share no code and no rationale. Bundling them means a reviewer opening the PR sees a data-correctness fix to a published package sitting underneath unrelated UI work, which is exactly how a P1 gets rubber-stamped. The absence of overlap is what makes B cheap, not what makes A acceptable.

**Rejected:** Option C
**Reasoning against C:** CoVE-03 confirms `main` is unprotected, so this is permitted — but the prior art that supports direct-to-main (DQJACOB `dec-006-03`) qualified it as a *single-contributor repo, trivial doc commit, explicit user request*. This is a versioned data correction to an MIT package published for downstream GRC consumption, and the repo's own last two changes (#38, #39) went through PRs voluntarily. Choosing the weaker process for the higher-stakes change inverts the convention.

**Assumption accepted:** The pr2 branch work is unrelated and will be landed separately on its own schedule.
**Assumption rejected:** *That branch protection would have forced a PR anyway, so the choice is moot.* CoVE-03 refutes this — protection is off. B is a deliberate choice, and worth naming as one.

---

## D-02 — Execute any WS11 items before landing?

**Options considered:**
- A: All six WS11 items now
- B: Only WS11-01/02 (the cheap editorial adds: `A.6.2.8`, `A.10.3`)
- C: None — land the correction exactly as scoped, WS11 stays backlog

**Accepted:** Option **C** — the fix commit should contain exactly the fix.

**Rejected:** Option A
**Reasoning against A:** WS11-04 is gated on a purchase that has not happened and WS11-05 is a product decision that D-03 may moot entirely. Two of the six cannot be executed today at all, so "all six" is not a real option — it is a commitment to stall the correction behind unavailable inputs.

**Rejected:** Option B
**Reasoning against B:** Superficially attractive because both are S-effort, but they are *editorial coverage* changes — choosing which clause best fits a risk — while everything landed so far is *citation accuracy*. Per OWASP-AGENTIC `rej-003-04`, this repo already deferred exactly this class of work (107 OSCAL title divergences) to keep a correctness change clean, and per linuxshanti `spdec-009-01` the rule is that future work waits for "an actual forcing function." Mixing an editorial judgment into a correctness fix also muddies the CHANGELOG Decision Point, which currently tells one clean story: the citations were wrong, here is the substrate that stops it recurring.

**Assumption accepted:** WS11's six entries carry enough acceptance detail to be executed cold by a future session without re-deriving context.
**Assumption rejected:** *That WS11-01 (`A.6.2.8` unused) is severe enough to be a correctness item rather than coverage.* It is a missed opportunity, not a wrong statement — no shipped citation is false because A.6.2.8 is absent. It stays coverage.

---

## D-03 — Keep building, or execute the buyer-conversation gate?

This is the load-bearing decision. The other three are hygiene.

| Criterion | A: continue engineering | B: conversations first | C: hybrid |
|---|---|---|---|
| Resolves PM-03/04/05 | ✗ none of them | ✓ all three, same 5 calls | ✓ eventually |
| Cost | weeks | ~free, time only | weeks |
| Reversible | yes | yes | yes |
| Prior-art alignment | ✗ contradicts `dec-002-06` | ✓ matches it | partial |
| Risk | 4th month of building without a buyer | conversations may invalidate the wedge — *which is the point* | dilutes both |

**Options considered:**
- A: Continue engineering — WS11-05 UI work, checklist productization
- B: Answer PM-01, then run the five practitioner conversations before any further product work
- C: Hybrid — light engineering while scheduling conversations

**Accepted:** Option **B** — and the prior art is not merely supportive, it is a standing ruling that was already made.

**Rejected:** Option A
**Reasoning against A:** Three assumptions gate every product decision downstream (PM-03: is the ISO gap news? PM-04: does blanket `editorial` status disqualify the artifact? PM-05: is assess-then-evidence the real buyer sequence?). **None is resolvable by building.** All three are answered by the same five conversations. Continuing to engineer is not neutral — it consumes the calendar that the `/acc` plan's own kill criteria were designed to protect, and that plan already lapsed 32 days ago without being executed or killed.

**Rejected:** Option C
**Reasoning against C:** The hybrid is what the last 60 days already were, and it produced a well-built artifact with zero recorded buyer contact. It also fails on its own terms: obviate-archaeology `rej-002-05` ruled "surfacing slice before interviews — gate resequenced; **interviews need nothing built**." There is no engineering prerequisite to a conversation, so the hybrid's engineering half is not enabling the other half — it is competing with it.

**Assumption accepted:** Five second-line risk practitioners are reachable within ~4 weeks (inherits `/acc` plan A-03, "~20 addressable buyers in magic circle + Big 4 legal"). **This assumption is unverified and is the single largest risk in this scratchpad** — if it is false, Option B has no execution path and the honest move is to say so and kill the commercial track explicitly rather than default back into building.
**Assumption rejected:** *That today's Phase 2 thesis was the wrong artifact to produce.* It was the right content at arguably the wrong time — it generated the ISO-gap positioning claim, which is the *substance* of the five conversations. But per obviate-archaeology `dec-002-06` ("no more analysis documents until interview data"), ruled 11 days before this one was written, it must be the **last** such document. That ruling was made by the same person about the same class of problem and was not honored; naming that is the point of this entry.

---

## D-04 — Buy ISO/IEC 42001:2023 now?

**Options considered:**
- A: Buy now (~CHF 200), reconcile the registry, then run conversations
- B: Defer until a conversation shows the ISO wedge has traction
- C: Never buy — continue on two corroborating secondary sources

**Accepted:** Option **A** — but decouple the purchase from the advisor consult the `/acc` plan bundled with it.

**Rejected:** Option B
**Reasoning against B:** The ISO gap *is* the content of the conversations under D-03. Walking into a magic-circle risk conversation with clause titles sourced from compliance-vendor blogs — two of which were caught publishing fabricated Annex A schemas — risks being wrong in front of exactly the audience that would notice. The purchase de-risks the artifact the conversation depends on, so deferring it inverts the dependency.

**Rejected:** Option C
**Reasoning against C:** `VALIDATION.md` and WS11-04 already record that the guard proves *data matches registry* but cannot prove *registry matches ISO*. Leaving that permanently open caps the crosswalk at "interesting" and bars it from backing anything paid. CHF 200 against a $25–75k pilot is not a real trade-off.

**Assumption accepted:** The `/acc` plan's $500–1500 Big-4 consult for A-02 should wait until *after* the five free conversations, not before — those conversations may change what is worth asking. The plan bundled purchase and consult; splitting them is a deliberate amendment.
**Assumption rejected:** *That A-02's consult is still the highest-value Phase-1 spend.* It was when the plan was written. Today PM-01 (ask the maintainer whether outreach happened) costs nothing and gates more.

---

## Assumptions Register

### Accepted Assumptions
| ID | Assumption | Rationale | Decision |
|---|---|---|---|
| A-01 | pr2 branch work is unrelated and lands separately | CoVE-02: zero file overlap across 8 vs 11 files | D-01 |
| A-02 | WS11 entries are executable cold by a future session | Each carries requirement + acceptance + effort + source in TRD format | D-02 |
| A-03 | Five second-line risk practitioners are reachable in ~4 weeks | Inherits `/acc` plan A-03 (~20 addressable buyers) — **unverified, highest risk here** | D-03 |
| A-04 | The ISO gap is the substance of the conversations, so the registry must be right first | Follows from Phase 2 Q8.2 | D-04 |
| A-05 | The crosswalk demos publicly with nothing installed | CoVE-01: Pages live and built | D-03 |

### Rejected Assumptions
| ID | Assumption | Why Rejected | Decision |
|---|---|---|---|
| R-01 | Branch protection forces a PR, so D-01 is moot | CoVE-03: `main` is unprotected — B is a choice, not a constraint | D-01 |
| R-02 | WS11-01 (`A.6.2.8` unused) is a correctness defect | No shipped citation is false because it is absent; it is coverage | D-02 |
| R-03 | Today's PM thesis was the wrong artifact | Right content, wrong ordering — but it must be the last one before conversations | D-03 |
| R-04 | The A-02 advisor consult is still the top Phase-1 spend | PM-01 costs nothing and gates more; consult should follow the free conversations | D-04 |

---

## CoVE Verification Questions
| ID | Question | Decision it affects |
|---|---|---|
| CoVE-01 | Is the crosswalk actually deployed and publicly reachable today? | D-03 |
| CoVE-02 | Does the current branch's commit overlap the files this work changed? | D-01 |
| CoVE-03 | Does `main` require a PR (branch protection)? | D-01 |

## CoVE Answers

### CoVE-01 — Is the crosswalk publicly deployed today?
**FINDING: YES.** `gh api repos/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/pages` returns `status: "built"`, `build_type: "workflow"`, live at `https://haremantra.github.io/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/`.
**Impact:** Confirms the Phase 2 claim that the crosswalk "demos in 60 seconds with nothing installed." No change to D-03 — it strengthens it. Note the deployed build predates today's correction, so the live site still shows the wrong ISO clauses until D-01 lands and Pages redeploys. **That is a reason to land D-01 before any conversation, and it re-orders the next actions below.**

### CoVE-02 — Does the branch commit overlap this work?
**FINDING: NO.** `git diff --name-only origin/main..HEAD` returns 8 files, all under `client/` plus `docs/scratchpad-comprehension-audit-followups.md`. This work touches `packages/crosswalk/**`, `CHANGELOG.md`, `VALIDATION.md`, `docs/trd/`, `docs/EXPANSION_ROADMAP.md`, `docs/role-outputs/`. Disjoint. Branch is 1 commit ahead of `origin/main`.
**Impact:** Makes Option B cheap and clean — a branch switch carries no conflict risk. Confirms D-01.

### CoVE-03 — Is `main` protected?
**FINDING: NO.** `gh api .../branches/main/protection` returns HTTP 404 "Branch not protected".
**Impact:** **Changed the reasoning, not the outcome.** Option C (direct to main) is permitted, and prior art exists for it on solo repos. D-01 still selects B, but now as a deliberate convention choice rather than a tooling requirement — and R-01 is recorded as a rejected assumption. Worth noting separately: an unprotected `main` on a repo publishing an MIT data package is its own small finding, adjacent to WS10-01's Solo/Board mode model.

---

## Next Actions (ordered)

1. **Land D-01** — new branch off `origin/main`, move the 11 files, PR. Unblocks the Pages redeploy that fixes the publicly-visible wrong clauses (CoVE-01).
2. **Answer PM-01** — did any design-partner outreach happen 2026-05-21 → today? Free, and re-baselines Phase 2 if the answer is yes.
3. **Buy ISO/IEC 42001:2023** (~CHF 200), reconcile the registry, close WS11-04.
4. **Run the five practitioner conversations** — resolves PM-03, PM-04, PM-05 together.
5. **Only then**: the A-02 advisor consult, and whichever of WS11-01/02/03/05/06 the conversations show matters.

**Not doing:** WS11 execution, further product documents, or crosswalk feature work until step 4 reports back.
