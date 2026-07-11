# Validation & Transparency Model

This crosswalk maps OWASP Agentic AI risks (ASI) to NIST SP 800-53 Rev 5 and the
NIST AI RMF (AI 100-1). A mapping is an **editorial judgement** about which
controls are relevant to a risk — not a measured fact. This document states,
honestly and in one place, **how each mapping is validated, how far that
validation currently reaches, and how it is allowed to progress.**

The load-bearing honesty commitment: **every mapping ships labelled with its
validation tier, and the label never claims more than has actually happened.**
At launch, all 80 mappings (40 × NIST 800-53, 40 × AI-RMF) are `editorial`. No
mapping carries a confidence rating, because none has been rated yet — and an
unset field is the honest state, not a gap to paper over.

---

## The three tiers

Validation is layered. Each tier is stronger evidence than the one below it, runs
on a different trigger, and has a different relationship to the merge gate.

| Tier | What it checks | Automation | Gates merges? | Where |
|---|---|---|---|---|
| **Tier 1 — Structural integrity** | The data is internally consistent and well-formed | Automated, **every commit** | **Yes — hard fail** | `packages/crosswalk/tests/` |
| **Tier 2 — Editorial quality** | Rationales and evidence meet quality floors | Automated, **report-only** | No (until promoted per-check) | `packages/crosswalk/tests/editorial-quality.test.ts` |
| **Tier 3 — Practitioner validation** | A human expert corroborates the mapping | Human-in-the-loop | **Never** | Review calendar + `validationStatus` field |

### Tier 1 — Structural integrity (hard gate, every commit)

The existing integrity suite (`data.integrity.test.ts`, `data.contract.test.ts`,
`artifacts.test.ts`, `oscal-*.test.ts`, `version.test.ts`, and siblings) is the
floor. It asserts machine-checkable facts: every ASI has a crosswalk entry; every
cited control ID resolves in the NIST catalogs; every AI-RMF category is a real
taxonomy category; the JSON/CSV artifacts round-trip losslessly; scope is exactly
the declared set of families; and — new in this layer — **every mapping declares a
valid `validationStatus`, no mapping carries a numeric confidence (constraint
AD-3), and no mapping is promoted above `editorial` without a `reviewIssue`
reference.** Tier 1 runs on every commit in CI and **fails the build** on any
violation. It says nothing about whether a mapping is *good* — only that it is
*well-formed*.

### Tier 2 — Editorial quality (automated, report-only, ratcheted)

Tier 2 measures editorial quality that we believe should hold but are not yet
willing to hard-gate. It runs in CI on every commit, **logs violation counts, and
passes regardless of the count.** Three checks today, all in
`editorial-quality.test.ts`:

- **(a) Rationale length** — each rationale is ≥ 50 characters (a one-line "maps
  to X" stub is not an explanation).
- **(b) Rationale ↔ mapping cross-reference** — the rationale actually names at
  least one of its own mapped control/category IDs, its family/function, or the
  family display name. Tolerant of compound shorthand (`AC-3/6` counts as
  referencing both AC-3 and AC-6).
- **(c) Evidence structure** — every ASI carries at least one evidence item with a
  machine-resolvable reference (a `sourceUrl` or a `cveId`).

Each check logs `[Tier2] <check>: N violations`.

#### Promotion rule for Tier-2 checks (explicit)

> **When a Tier-2 check's violation count reaches 0 on `main`, that check is
> promoted — in the same change that observes the zero — from a `console.log`
> report into a hard `expect(...)` assertion, converting it into a Tier-1-style
> ratchet that fails the build if the count ever rises above 0 again.**

Promotion is **per-check and independent**: a check at 0 hardens even while its
siblings are still report-only. This turns editorial quality into a monotonic
ratchet — quality can be improved incrementally and each gain is locked in — without
ever blocking a commit on a quality bar the data has not yet met. The comment block
at the top of `editorial-quality.test.ts` restates this rule at the point of
change.

Current measured counts (at the time this layer landed): **(a) 0**, **(b) 65**,
**(c) 0**. Checks (a) and (c) are therefore promotion-eligible; (b) is not — most
rationales (AI-RMF rationales especially) describe the mapped concept in prose
rather than citing its short-form ID verbatim, and closing that gap is future
editorial work.

### Tier 3 — Practitioner validation (human-in-the-loop, never gates)

Tier 3 is the only tier that can move a mapping's `validationStatus` **above**
`editorial`. It is a human judgement by a qualified practitioner, recorded against
a mapping and traceable to a GitHub issue (`reviewIssue`).

- **`practitioner-reviewed`** — an external practitioner has read the mapping and
  its evidence and signed off that the control selection and rationale are sound.
- **`empirically-validated`** — beyond review, the mapping is corroborated by
  observed incident / exploitation evidence tying the risk to the mapped control
  domain (see the evidence standard below).

**Tier 3 NEVER gates a merge (CF-03, single-author-safe).** The project is
maintained such that one author can ship a change end-to-end. Practitioner sign-off
is a *promotion* event that *raises* a label; the absence of sign-off is the
default (`editorial`) and blocks nothing. There is no "waiting for a second
reviewer" state that can stall a merge — the merge gate is Tier 1 alone. This is a
deliberate design constraint (**CF-03**): the transparency layer must never create a
review bottleneck that a solo maintainer cannot clear. Promotion is append-only
provenance, not a precondition for release.

**Cadence is not redefined here.** Tier-3 practitioner review rides the existing
**dual-mode review calendar defined in
[`docs/EXPANSION_ROADMAP.md`](docs/EXPANSION_ROADMAP.md)** — a semi-annual calendar
review plus an event-driven off-cycle review within 30 days of a published incident
implicating the crosswalk. There is exactly one cadence, and it lives in that
document. Within each calendar cycle a **rotating** subset of ASIs receives deep
practitioner validation, so validation coverage rotates across the register over
successive cycles rather than attempting all ten ASIs at once. An incident that
fires an off-cycle review is also the natural trigger to (re-)validate the affected
ASI's mappings. Any promotion is filed as a GitHub issue (the mapping's
`reviewIssue`) and, where it changes scope, recorded as a CHANGELOG Decision Point
per the roadmap's convention.

---

## The ordinal confidence rubric

`confidence` is an **optional, ordinal** field on every mapping:
`provisional < moderate < high`. It is deliberately an ordinal enum and **never a
numeric float** (constraint **AD-3**) — a float would imply a precision this
editorial judgement does not have, and would invite smuggling the scenario
simulator's differential-privacy scores back in as if they were mapping
confidences. They are unrelated and must never be conflated.

**No mapping is rated today.** The rubric is defined so that ratings, when they
happen, are consistent — but leaving `confidence` unset is the honest current
state, because rating is a Tier-3 human act that has not yet occurred.

The rubric is a function of **evidence count, recency, and corroboration**:

| Level | Criteria |
|---|---|
| **`provisional`** | Rationale rests on authoritative guidance alone, or on a single evidence item, or on evidence that is dated / not independently corroborated. The mapping is defensible but under-witnessed. |
| **`moderate`** | Multiple independent evidence items support the risk, at least one of them recent (within the current review horizon), and the control selection is consistent with authoritative guidance. No single item is load-bearing on its own. |
| **`high`** | The risk is corroborated by **several independent, recent** evidence items — ideally including at least one documented incident or CVE — and the mapped control domain is explicitly named as a countermeasure by authoritative guidance. Removing any one source would not collapse the mapping. |

Confidence is a property of *how well-witnessed the risk-to-control relevance is*,
not a probability that the control fully mitigates the risk.

---

## The two-part evidence standard

Evidence attached to an ASI is held to a **two-part** standard. Both parts together
justify a mapping; neither alone is sufficient, and — importantly — the standard
does **not** demand proof that a specific control stopped a specific attack.

1. **Risk-exploitability evidence.** A concrete, verifiable demonstration that the
   risk is real and exploitable in agentic systems — a documented incident, a CVE,
   a published research proof-of-concept, or a red-team result. This answers *"does
   this risk actually happen?"*
2. **Authoritative-guidance citation.** A citation to authoritative security
   guidance (NIST, OWASP, MITRE, CSA, or equivalent) establishing that the mapped
   control domain is a recognised countermeasure for that class of risk. This
   answers *"is this the right family of control to point at?"*

**What the standard deliberately does NOT require.** We do **not** require evidence
that the specific mapped control *did* mitigate the specific cited incident.
Establishing counterfactual mitigation ("incident X would have been prevented by
control Y") is generally impossible from public post-mortems and would force either
fabricated causal claims or an empty crosswalk. Instead we separate the two
questions above: the risk is demonstrably real (part 1) and the control domain is a
recognised countermeasure for that risk class per authoritative guidance (part 2).
That is an honest, defensible basis for an `editorial` mapping — and it is exactly
the gap that Tier-3 `empirically-validated` promotion exists to close, case by case,
where stronger causal evidence does exist.

---

## The incident register

`packages/crosswalk/src/incident-register.ts` exposes `INCIDENT_REGISTER`, a flat,
derived projection of every evidence item across every ASI (33 entries at launch),
each stamped with its owning ASI. It is **derived** from the crosswalk data at
module load — there is no separate JSON file to drift — and `buildRegisterReport()`
summarises it (`totalIncidents`, `byType`, `asisWithNoIncident`). The report is
**register-relative and disclaimed**: `asisWithNoIncident` means "no evidence item
is attached to that ASI *in this dataset*", not a claim that the risk is unobserved
in the wild.

---

## How this renders in the app

The Evidence Explorer shows each mapping's `validationStatus` as a **labelled
badge** (glyph + text — never color alone, per NFR-7) next to the family/function
title, a **legend** explaining the three statuses with a link back to this
document, and a **status filter** that hides/shows mapping cards by status with
per-status counts. At launch every badge reads **Editorial** and every count sits
under that status — which is precisely the point: the UI tells the truth about
where validation currently stands.
