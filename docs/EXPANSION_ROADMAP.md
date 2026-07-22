---
lastReviewed: 2026-07-11
nextReviewDue: 2027-01-11
owner: haremantra
decisionPointRef: DP4
---

# Scope Expansion Roadmap

This document is the single source of truth for **which NIST SP 800-53 Rev 5 control
families sit outside the current crosswalk scope, why, and the concrete conditions
under which each would be promoted into it.** It exists so that scope is a reviewable,
revisitable decision — not a silent omission.

Two categories of out-of-scope family are tracked here, and they are **not the same
thing**:

1. **Excluded families** — deliberately left out of the data model per CHANGELOG
   [Decision Point 4](../CHANGELOG.md) (heatmap scope disclosure). These families are
   *not even defined* in the `NIST_800_53` array: **AT, MA, PS, PT**.
2. **Defined-but-unmapped families** — present in the `NIST_800_53` array (they render
   as heatmap columns) but carrying **zero** mapped controls: **MP, PE**. These are a
   *coverage gap*, not an exclusion, and are treated differently below.

The current data truth this roadmap is written against: **54 distinct 800-53 controls
across 89 total mappings; 16 families in scope, 14 of which carry at least one mapped
control.** These figures are derived from the mappings at build time and pinned by the
integrity test suite (see `packages/crosswalk/tests/data.integrity.test.ts`, test
`T-scope`).

> **Provenance note.** Representative controls below are cited **by ID and official
> title only**, each hyperlinked to NIST's canonical Cybersecurity and Privacy Reference
> Tool (CPRT) catalog entry. This document deliberately does **not** paste NIST control
> description prose — the authoritative description text lives once, in
> `packages/crosswalk/src/nist-control-descriptions.ts`, and duplicating it here would
> create a third drifting copy.

---

## Coverage-truth table

| Bucket | Count | Families |
|---|---:|---|
| **Families with ≥1 mapped control** | 14 | AC, AU, CA, CM, CP, IA, IR, PL, PM, RA, SA, SC, SI, SR |
| **Defined-but-unmapped** (in scope, zero mappings — coverage gap) | 2 | MP, PE |
| **Excluded** (out of scope per DP4 — not defined in `NIST_800_53`) | 4 | AT, MA, PS, PT |
| In-scope total (defined in `NIST_800_53`) | 16 | 14 mapped + 2 defined-but-unmapped |
| NIST SP 800-53 Rev 5 full family count | 20 | 16 in scope + 4 excluded |

Sibling AI-RMF coverage, for completeness: **17 of the 19** NIST AI 100-1 subcategories
are referenced; **GV-3 (Workforce Diversity)** and **MS-4 (Measurement Effectiveness)**
are defined-but-unmapped on the `T16` known-orphan allowlist.

---

## Status legend

Every family below carries exactly one status from this closed enum:

- **Not Triggered** — no published incident or technology development yet justifies the
  editorial cost of mapping this family into an *agentic-AI* threat crosswalk. The
  family's controls remain conceptually valid 800-53 controls; they are simply not
  agentic-specific countermeasures today.
- **Partially Triggered** — at least one specific control in the family is already
  acknowledged in-data as directly applicable to a specific ASI risk, but the family is
  held out of `CROSSWALK` pending a full inclusion decision. Doc-only stub mappings may
  be recorded here (and *only* here) as a staging area.
- **Fully Triggered** — the inclusion trigger has fired; the family should be promoted
  into `CROSSWALK` following the activation checklist. (No family currently holds this
  status; it is defined so the enum is complete and the guard test can assert against it.)

---

## Activation checklist (canonical master)

When any family below is promoted, **every** artifact in this list must be updated in the
same change, and the gate (`pnpm check && pnpm test && pnpm build`) must pass. Individual
family sections reference this master list and note only their family-specific deltas.

1. **`packages/crosswalk/src/data.ts` — `CROSSWALK`**: add the family's `nist53` mapping
   (controls + rationale) to each affected `ASI` entry.
2. **`packages/crosswalk/src/data.ts` — `NIST_800_53` array**: for an **excluded** family
   (AT, MA, PS, PT), add the family object `{ id, name, color }`. For a
   **defined-but-unmapped** family (MP, PE) this object already exists — no change needed.
3. **`packages/crosswalk/src/nist-control-descriptions.ts`**: add a description entry for
   every newly-cited control ID (with `relatedASI`), so `T4` (control-id resolves) and the
   OSCAL existence checks pass.
4. **Heatmap columns**: the 800-53 heatmap renders one column per `NIST_800_53` family, so
   adding an excluded family adds a column automatically. MP/PE already render as columns —
   promotion only changes their cell density from zero.
5. **Scrambler mappings annotations** (`client/src/features/simulator/engine/mappings.ts`,
   `CONTROL_STATE_TO_FAMILIES`): wire the promoted family to the appropriate control-state
   boolean. For MP/PE, remove the `"not mapped in crosswalk; assigned here as default
   owner"` annotation once they carry real mappings.
6. **`README.md` and `CHANGELOG.md` counts**: update the family counts (e.g. "14 with
   mapped controls" → 15) and record a new **Decision Point** entry documenting the
   promotion and its trigger.
7. **Integrity tests** (`packages/crosswalk/tests/data.integrity.test.ts`): update
   **`T-scope`** — remove the family from the `definedUnmapped` expectation (MP/PE) or from
   the `excluded` never-mapped loop (AT/MA/PS/PT). Re-pin any coverage-count assertions.
8. **This roadmap**: move the family's status to **Fully Triggered** (or remove it once
   fully mapped and stable), bump `lastReviewed`, and update the coverage-truth table.
9. **`packages/crosswalk/src/oscal-index.ts`**: no manual edit — this file is
   auto-generated from the pinned NIST OSCAL catalog via `scripts/refresh-oscal.mjs` and
   regenerates on the next refresh; it already contains every Rev 5 family/control.

---

## AT — Awareness & Training

**Status:** Partially Triggered

**Rationale (traceable to DP4 / DP5).** DP4 excluded AT because its controls target
human training programs rather than technical agent controls. DP5 then created an explicit
bridge: the ASI09 (Human-Agent Trust Exploitation) `PM`-family rationale carries an in-data
note that **AT-2** and **AT-3** are directly applicable to ASI09 but held out of scope.
That note is the partial trigger — the applicability is acknowledged in the data itself.

- In-data evidence: `packages/crosswalk/src/data.ts:218` (the ASI09 PM-family rationale
  note).
- Decision-log evidence: `CHANGELOG.md:245` (Decision Point 5 — ASI09 Rationale Supplement
  for AT-Family Applicability).

**Representative controls** (ID + official title only):

- [AT-2 Literacy Training and Awareness](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=AT-2)
- [AT-3 Role-Based Training](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=AT-3)
- [AT-4 Training Records](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=AT-4)

**Doc-only stub mappings for ASI09** (staging area — these live **only** in this roadmap
and must **never** appear in `CROSSWALK` until the family is Fully Triggered, or the
`T-scope` test will fail):

| ASI | Control | Stub rationale (liftable from data.ts:218) |
|---|---|---|
| ASI09 | AT-2 Literacy Training and Awareness | Security-awareness training for recognizing agent-driven social engineering, automation bias, and anthropomorphism risks. |
| ASI09 | AT-3 Role-Based Training | Role-specific training for personnel operating in high-automation-bias roles where they must verify agent recommendations. |

**Inclusion trigger.** Promote AT to Fully Triggered when a published incident or
authoritative guidance establishes agentic-AI *social-engineering-of-operators* as a named,
recurring control-gap — e.g. a CVE or documented breach where an agent's anthropomorphic
manipulation of a human reviewer is the proximate cause, or a NIST/OWASP publication that
prescribes AT-2/AT-3-style literacy training as an agentic-AI countermeasure. On that
event, convert the two stubs above into real `CROSSWALK` entries.

**Activation checklist.** Follow the canonical master list above. Family-specific deltas:
AT is an **excluded** family, so step 2 (add the `NIST_800_53` family object for AT) and
step 4 (new heatmap column) both apply; promote the two ASI09 stubs in step 1.

---

## MA — Maintenance

**Status:** Not Triggered

**Rationale (traceable to DP4).** DP4 excluded MA because it addresses physical system
maintenance schedules with limited applicability to software-defined agent architectures.
No agentic-AI threat vector currently routes through scheduled hardware maintenance.

**Representative controls** (ID + official title only):

- [MA-2 Controlled Maintenance](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MA-2)
- [MA-4 Nonlocal Maintenance](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MA-4)
- [MA-6 Timely Maintenance](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MA-6)

**Inclusion trigger.** Promote MA when a published incident implicates *remote/nonlocal
maintenance of agent-hosting infrastructure* as an agentic attack surface — e.g. an agent
platform compromised through an unverified nonlocal maintenance channel (MA-4), or guidance
treating model/tool hot-patching pipelines as a maintenance-integrity control.

**Activation checklist.** Follow the canonical master list. Family-specific deltas: MA is an
**excluded** family, so steps 2 (add `NIST_800_53` object) and 4 (new heatmap column) apply.

---

## PS — Personnel Security

**Status:** Not Triggered

**Rationale (traceable to DP4).** DP4 excluded PS because it governs human personnel
screening, which does not directly map to non-human agent identity management. DP4 also
notes the conceptual parallel is already partially acknowledged via the ASI03 `IA`-family
mapping (identity, authenticator, and identifier management for agents).

**Representative controls** (ID + official title only):

- [PS-3 Personnel Screening](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PS-3)
- [PS-4 Personnel Termination](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PS-4)
- [PS-7 External Personnel Security](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PS-7)

**Inclusion trigger.** Promote PS when the "agent-as-workforce" analogy hardens into a named
control requirement — e.g. published guidance treating agent onboarding/offboarding
(joiner-mover-leaver for non-human identities) as a PS-4-style termination discipline
distinct from the existing IA mapping, or an incident where a de-provisioned agent identity
retained access.

**Activation checklist.** Follow the canonical master list. Family-specific deltas: PS is an
**excluded** family, so steps 2 and 4 apply. Coordinate with the ASI03 IA mapping to avoid
double-counting the identity-lifecycle rationale.

---

## PT — PII Processing and Transparency

**Status:** Not Triggered

**Rationale (traceable to DP4).** DP4 excluded PT because the crosswalk focuses on security
controls rather than privacy-specific requirements; DP4 explicitly advises organizations
with privacy obligations to evaluate PT controls independently.

**Representative controls** (ID + official title only):

- [PT-2 Authority to Process Personally Identifiable Information](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PT-2)
- [PT-3 Personally Identifiable Information Processing Purposes](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PT-3)
- [PT-5 Privacy Notice](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PT-5)

**Inclusion trigger.** Promote PT when the crosswalk's scope is deliberately widened from
security to security-plus-privacy, **or** when a published incident ties an agentic-AI
memory/context-poisoning risk (ASI06) to unauthorized PII processing such that PT-2/PT-3
become the load-bearing control rather than a privacy-program adjacency.

**Activation checklist.** Follow the canonical master list. Family-specific deltas: PT is an
**excluded** family, so steps 2 and 4 apply. A PT promotion likely co-occurs with a scope
statement change in `README.md` (security → security + privacy).

---

## MP — Media Protection

**Status:** Not Triggered *(coverage gap — defined-but-unmapped, not excluded)*

**Rationale (traceable to DP4 context).** MP is **in scope**: it is defined in the
`NIST_800_53` array and renders as a heatmap column, but currently carries **zero** mapped
controls. It is therefore a **coverage gap**, distinct from the four excluded families. No
ASI mapping has yet needed a media-protection control, but nothing about DP4 excludes it —
promotion here means *filling a gap*, not reversing an exclusion. The `T-scope` test pins MP
(with PE) as one of exactly two defined-but-unmapped families.

**Representative controls** (ID + official title only):

- [MP-2 Media Access](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MP-2)
- [MP-6 Media Sanitization](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MP-6)
- [MP-7 Media Use](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=MP-7)

**Inclusion trigger.** Map MP when an agentic-AI risk makes media handling load-bearing —
e.g. an ASI06 (Memory & Context Poisoning) incident where poisoned data persists on
removable/retained media and MP-6 (Media Sanitization) is the corrective control, or agent
data-exfiltration to removable media (MP-7 Media Use).

**Activation checklist.** Follow the canonical master list. Family-specific deltas: MP's
`NIST_800_53` object and heatmap column **already exist** (steps 2 and 4 are no-ops).
Promotion is steps 1, 3, 5, 6, 7, 8: add the mapping, add control descriptions, drop the
scrambler "not mapped" annotation, update counts, and **remove MP from the `T-scope`
`definedUnmapped` expectation** (leaving only PE).

---

## PE — Physical & Environmental Protection

**Status:** Not Triggered *(coverage gap — defined-but-unmapped, not excluded)*

**Rationale (traceable to DP4 context).** Same treatment as MP: PE is **in scope**, defined
in `NIST_800_53`, rendered as a heatmap column, but carries **zero** mapped controls today.
It is a **coverage gap**, not an exclusion. The `T-scope` test pins PE (with MP) as one of
exactly two defined-but-unmapped families.

**Representative controls** (ID + official title only):

- [PE-2 Physical Access Authorizations](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PE-2)
- [PE-3 Physical Access Control](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PE-3)
- [PE-6 Monitoring Physical Access](https://csrc.nist.gov/projects/cprt/catalog#/cprt/framework/version/SP_800_53_5_1_1/home?element=PE-6)

**Inclusion trigger.** Map PE when an agentic-AI risk routes through physical/edge
infrastructure — e.g. an incident where an agent controlling cyber-physical systems (robotics,
data-center automation) makes physical access control (PE-3) or physical access monitoring
(PE-6) the load-bearing countermeasure.

**Activation checklist.** Follow the canonical master list. Family-specific deltas: identical
to MP — PE's `NIST_800_53` object and heatmap column already exist (steps 2 and 4 are
no-ops); promotion **removes PE from the `T-scope` `definedUnmapped` expectation** (leaving
only MP).

---

## ISO 42001 coverage gaps (second scope axis)

Everything above tracks **NIST 800-53 family** scope. This section tracks the
separate question of **ISO/IEC 42001 Annex A coverage** in `FRAMEWORK_REFS`, opened
2026-07-22 when the bridge's clause citations were corrected (see CHANGELOG,
*The Governance Bridge Cites the Wrong Clauses*). These are **editorial-coverage**
items — deliberately excluded from that correction, which was scoped to citation
accuracy only. They do not carry the family status enum above.

| # | Gap | Proposed action | Trigger |
|---|---|---|---|
| 1 | **A.6.2.8 (AI system recording of event logs) is cited by no ASI.** It is the single most on-point Annex A clause for agent audit-trail risk, and the bridge currently routes those risks through the generic A.6.2.6. | Add A.6.2.8 to ASI10 (Rogue Agents) and ASI03 (Identity & Privilege Abuse). | Next editorial pass, or any Tier-3 practitioner review touching ASI03/ASI10. |
| 2 | **ASI04 (Supply Chain) cites A.10.2 Allocating responsibilities but not A.10.3 Suppliers.** A.10.3 is the more direct anchor for the risk the ASI actually names. | Add A.10.3 alongside A.10.2 on ASI04. | Same as above. |
| 3 | **Four agentic control areas have no Annex A anchor at all**: agent identity issuance, credential scoping/TTL, network egress control, and inter-agent authn/authz. | None — do not stretch a clause to cover them. Document the gap instead. | See note below; this is a property of the standard, not a backlog item. |

**On gap 3 — this is a finding, not a defect.** ISO/IEC 42001 is a *management-system*
standard: policy, roles, impact assessment, lifecycle process, data governance,
supplier relationships. It contains no network, identity, or credential controls
because that was never its remit. NIST 800-53r5 carries exactly those (AC, IA, SC,
SR), and CSA independently names AC, IA, AU and SR as the families with systematic
agentic gaps in current guidance.

That asymmetry is the crosswalk's strongest and currently *unstated* positioning
claim: **ISO 42001 and 800-53r5 are complements, not alternatives, and a firm
asserting "we are ISO 42001 certified" has said nothing about its agent identity or
egress posture.** Surfacing it in the UI — rather than leaving a reader to infer it
from an empty column — is a product decision, tracked separately from this roadmap.

---

## Review process

This roadmap is reviewed in **dual mode**, and every review is executable by a single
maintainer.

**Mode 1 — Semi-annual calendar review.** On or before `nextReviewDue`, the maintainer
re-reads each family's status and inclusion trigger against the intervening six months of
published incidents and NIST/OWASP guidance. If nothing has changed, the review is a no-op
apart from bumping `lastReviewed` (+6 months) and `nextReviewDue`. The header fields at the
top of this file are the machine-parseable review anchors (`lastReviewed`, `nextReviewDue`,
both ISO-8601, `nextReviewDue ≤ 6 months` after `lastReviewed`).

**Mode 2 — Event-driven off-cycle review.** A **published incident implicating any
out-of-scope family** (the four excluded or the two defined-but-unmapped) forces an
off-cycle review **within 30 days** of the maintainer becoming aware of it. The review
decides whether the incident fires that family's inclusion trigger.

**Filing.** Either mode is filed as a **GitHub issue referencing the relevant Decision
Point** (per the CHANGELOG convention: *"open an issue referencing the Decision Point
number"* — here, DP4 for the scope decision, or the family-specific DP for AT). If a review
promotes a family, the promotion is recorded as a **new CHANGELOG Decision Point** and the
activation checklist is executed.

---

## Change log for this document

| Date | Change |
|---|---|
| 2026-07-11 | Initial roadmap: six families (AT partially triggered; MA/PS/PT not triggered/excluded; MP/PE not triggered/defined-but-unmapped). Established dual-mode review process and canonical activation checklist. |
| 2026-07-22 | Added the ISO 42001 coverage-gap section as a second scope axis (three items), opened alongside the governance-bridge citation corrections. NIST family statuses unchanged; `lastReviewed` deliberately not bumped, since no family review occurred. |
