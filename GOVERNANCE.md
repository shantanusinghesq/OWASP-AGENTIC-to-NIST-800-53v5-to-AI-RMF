# Governance

This document defines **how changes to the OWASP Agentic AI ↔ NIST crosswalk are
proposed, reviewed, and merged**, who holds which responsibilities, and the evidentiary
standard every data change must meet. It is deliberately scoped to the project as it
exists today — a single-maintainer, open-data crosswalk — while defining the concrete
trigger that graduates it to a multi-reviewer model.

## Roles

| Role | Who | Responsibilities |
|---|---|---|
| **Maintainer** | `@shantanusinghesq` | Final decision authority on all mappings, scope, and releases. Reviews and merges PRs. Records Decision Points in `CHANGELOG.md`. Owns the canonical data location and the CI gate. |
| **Reviewer** | *(none yet — see Board Mode)* | An external contributor who has completed ≥1 public data-PR review. Reviewers advise; in Board Mode a Reviewer approval becomes a required merge gate for canonical-data changes. |
| **Contributor** | Anyone | Opens issues (new mapping / mapping correction) and pull requests. Must meet the Mapping Provenance Standard for any data change. Has no merge rights. |

## Operating model — two modes

The project runs in exactly one of two modes at a time. **Solo Mode is ACTIVE today.**

### Solo Mode (ACTIVE)

- **Merge gate:** The maintainer's own review **plus** a green CI run (`ci.yml`:
  `check` → `test` → `build`, plus the single-data-source and license guards) is the
  **sole** merge gate.
- **Required approvals:** **Zero.** No external approval is required to merge. Branch
  protection requiring reviewer approvals is **not** enabled, by design — requiring
  approvals that no eligible reviewer exists to give would simply block the project.
- **Rationale:** A single maintainer cannot meaningfully "approve" their own PR a second
  time. CI is the objective, reproducible gate; the maintainer's judgment is the
  subjective one. Together they are sufficient for a single-author open-data project.

### Board Mode (INACTIVE)

Board Mode is a documented future state, **not** enabled now.

- **Activation trigger (all must hold):** **≥2 external Reviewers**, each having
  completed **≥1 public data-PR review**, are active on the project.
- **What activates:** When the trigger fires, the maintainer enables GitHub **branch
  protection** on the default branch requiring **1 approving review** for any PR touching
  `packages/crosswalk/**` (the canonical data). Non-data changes (docs, client UI,
  tooling) remain under the Solo-Mode gate unless the maintainer widens the rule.

#### Board Mode activation runbook (do NOT execute until the trigger fires)

> This is a runbook step recorded for the future. It is **not** performed as part of
> adopting this document.

1. Confirm the trigger: at least two external Reviewers each have ≥1 merged public
   data-PR review on record.
2. Add each Reviewer to `.github/CODEOWNERS` for `/packages/crosswalk/**` alongside
   `@shantanusinghesq`.
3. In GitHub → Settings → Branches → Branch protection rules for `main`: enable
   **Require a pull request before merging**, **Require approvals = 1**, and
   **Require review from Code Owners**. Keep **Require status checks to pass** (CI) on.
4. Record the activation as a new `CHANGELOG.md` Decision Point (what changed, why, and
   the two Reviewers who satisfied the trigger).
5. Update the "Operating model" section above to mark Board Mode ACTIVE and Solo Mode
   INACTIVE.

## Canonical data location

`packages/crosswalk/src` is the **sole canonical location** for crosswalk data
(`CROSSWALK`, `OWASP_ASI`, `NIST_800_53`, `AI_RMF`, and the description databases). The
client consumes this data exclusively through the `@shantanusinghesq/crosswalk` package; a CI
guard (`ci.yml` → "Guard single data source") fails the build if crosswalk data constants
reappear under `client/src/lib/`. **Never** introduce a second copy of the data. Any PR
that edits mappings must edit files under `packages/crosswalk/src`.

## Mapping Provenance Standard

Every **new or modified** mapping (an ASI ↔ 800-53 control link, or an ASI ↔ AI-RMF
category link) must cite **at least one authoritative source beyond editorial judgment**.
Editorial judgment is necessary but never sufficient on its own.

**Accepted citation formats:**

- **URL** to an authoritative publication — NIST (SP 800-53 Rev 5, AI 100-1, AI 600-1),
  OWASP (Agentic AI Threats / Top 10 for Agentic Applications), MITRE ATLAS, a CERT/CC or
  vendor advisory, or a peer-reviewed paper. Prefer a stable, versioned URL.
- **CVE identifier** in the form `CVE-YYYY-NNNN+` for a mapping grounded in a specific
  disclosed vulnerability or incident.
- **Publication reference** — a named standard/report with section or control ID (e.g.
  "NIST SP 800-53 Rev 5, AC-3" or "OWASP ASI09"), sufficient for a reader to locate the
  source.

The rationale string that ships with a mapping should make the causal link explicit; the
citation makes it **verifiable**. (The evidence-verifiability ratchet is tracked
separately by integrity test `T11`, which reports how many ASI evidence strings still lack
a machine-resolvable URL/CVE.)

## Mapping Dispute Resolution

Disputes about a mapping's correctness are resolved through the CHANGELOG **Decision
Point** convention:

1. **File** — open a GitHub issue labeled **`mapping-dispute`** that **references the
   relevant Decision Point number** (per the CHANGELOG convention: *"open an issue
   referencing the Decision Point number"*). State the mapping in question, the asserted
   error, and at least one authoritative citation per the Provenance Standard.
2. **Resolve** — in **Solo Mode**, the **Maintainer decides**. (In Board Mode, a disputed
   canonical-data change additionally requires the Board-Mode reviewer approval before
   merge.)
3. **Record** — the resolution is written up as a **new CHANGELOG Decision Point** (what
   changed, why it matters, and any effect on the coverage statistics), and any data
   change lands with its regression test so the decision cannot silently regress.

## Review cadence

This document does **not** redefine review cadence. The scope-review cadence — semi-annual
calendar review plus event-driven off-cycle review — is defined in
[`docs/EXPANSION_ROADMAP.md`](docs/EXPANSION_ROADMAP.md) ("Review process"). A separate
**per-mapping validation cadence** (`VALIDATION.md`) is **planned** under the evidence
workstream and is not yet published.

## Change process at a glance

1. Open an issue using the appropriate form (**New mapping** or **Mapping correction**).
2. Submit a PR editing only `packages/crosswalk/src` (for data) with rationale, ≥1
   citation, and a stated confidence estimate; add/adjust the relevant integrity test.
3. CI runs `pnpm check && pnpm test && pnpm build` plus the data-source and license
   guards.
4. In Solo Mode, the maintainer reviews and merges once CI is green. The decision, if it
   resolves a dispute or changes scope/coverage, is recorded as a CHANGELOG Decision
   Point.
