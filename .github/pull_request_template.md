<!--
Thanks for contributing to the OWASP Agentic AI ↔ NIST crosswalk.
See GOVERNANCE.md for roles, the merge gate (Solo Mode: maintainer review + green CI),
and the Mapping Provenance Standard.
-->

## Summary

<!-- What does this PR change, and why? Link any related issue (new-mapping / mapping-correction / mapping-dispute). -->

## Data-change checklist

If this PR touches crosswalk data (`packages/crosswalk/src`), all boxes must be checked:

- [ ] **Canonical path only** — data changes are under `packages/crosswalk/src` (no second copy under `client/src/lib`).
- [ ] **Rationale included** — each new/modified mapping ships an explicit rationale string.
- [ ] **≥1 authoritative citation** — a URL, CVE (`CVE-YYYY-NNNN+`), or named publication/section, per the Mapping Provenance Standard.
- [ ] **Confidence stated** — I have stated my confidence estimate for each mapping change (in the PR or the linked issue).
- [ ] **Tests updated** — added/adjusted the relevant integrity test(s) so the change is pinned.
- [ ] **`pnpm test` passing locally** — I ran `pnpm check && pnpm test && pnpm build` and it is green.

## Scope / coverage impact

<!-- Does this change any coverage count (distinct controls, total mappings, families mapped, AI-RMF subcategories)?
     If yes, note the delta and confirm README.md / CHANGELOG.md were updated. If a scope decision changed,
     confirm a new CHANGELOG Decision Point was recorded. -->

## Notes for the maintainer

<!-- Anything else the reviewer should know (assumptions, open questions, follow-ups). -->
