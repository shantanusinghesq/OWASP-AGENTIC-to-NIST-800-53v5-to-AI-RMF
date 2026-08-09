# Session Handoff — Agentic AI Risks Crosswalk

## Current State — 2026-05-01 (handoff #3)

**Session goal shipped:** Full /batch execution of the AEGIS-integration plan.
- Phase 0 — bootstrapped repo (license fix, ErrorBoundary restore, CI workflow fix, scratchpads, CLAUDE.md, HANDOFF.md), extracted `@shantanusinghesq/crosswalk` MIT-licensed workspace package, committed lockfile.
- Phase 1 — 4 parallel batch agents shipped 3 PRs (publishing setup, NIST descriptions backfill, AI-RMF descriptions backfill +9/-11) and a local-only AEGIS prototype (`prototype/obviate-crosswalk-integration` branch in AEGIS repo).
- Phase 2 — unskipped T4/T6b, added T9/T10, fixed nodenext compat (`.js` extensions in `index.ts`), bumped to 0.2.0.

**Local main (and origin/main):** `42e4db8 feat(crosswalk): release 0.2.0 — unskip T4/T6b, add T9/T10, fix nodenext compat`

## Verification status

| Gate | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passes |
| `pnpm test` | **11 passed, 0 skipped** (was 7+2 at handoff #2) |
| `pnpm check` | Clean |
| `pnpm build` | Clean (`dist/public/` 704 KB JS, 128 KB CSS) |
| GH Pages deploy | **Blocked at user-account level** (see below). Workflow file committed at `f6ee490` but no run has executed since the npm→pnpm migration. Total workflow runs ever on this repo: 0. |
| Publish workflow (`crosswalk-v*` trigger) | **Workflow blocked, but package published manually instead.** `@shantanusinghesq/crosswalk@0.2.0` is LIVE on GH Packages (verified by `+ @shantanusinghesq/crosswalk@0.2.0` in `pnpm publish` output, May 1). Verify at https://github.com/shantanusinghesq?tab=packages. |
| Package name | **Renamed** `@obviate/crosswalk` → `@shantanusinghesq/crosswalk` — GH Packages requires the npm scope to match the GitHub user/org owning the repo, and there's no `obviate` GH org. Bump back when/if Obviate AI registers as a GH org. |

### How to unblock both workflows (two layers — both required)

**Layer 1 — User-account Actions disable (root cause).** Despite the repo showing `actions.enabled=true`, every workflow dispatch returns `HTTP 422: Actions has been disabled for this user`. The user-level Actions billing endpoint returns 404 (no record exists). Path forward (one of):
- Wait for billing propagation if a payment method was just added — can take hours.
- Open https://github.com/dashboard for any account-level banner / required action.
- Check https://github.com/settings/billing for plan + spending-limit state.
- Open a GitHub Support ticket: https://support.github.com/contact → "Account & permissions" → "Actions disabled".

**Layer 2 — Repo Actions allowlist (also fixed by user this session).** `actions/permissions` = `selected`, allowlist now includes `pnpm/action-setup@v4` plus the four Pages/Node actions. This was the first blocker; once Layer 1 clears, no further action needed here.

**After Layer 1 clears, re-fire the publish workflow:**
```bash
git tag -d crosswalk-v0.2.0
git push origin :refs/tags/crosswalk-v0.2.0
git tag crosswalk-v0.2.1   # new version since 0.2.0 already on registry
# bump packages/crosswalk/package.json version to 0.2.1 first
git push origin crosswalk-v0.2.1
```

Pages deploy will fire on the next push to `main` (or via `workflow_dispatch`).

**Workaround used this session:** `pnpm publish` from local with a classic PAT (`write:packages` scope) configured in `~/.npmrc` — fully bypasses Actions. Instructions repeat in `packages/crosswalk/README.md`.

## Commit log this session (top of `main`)

```
42e4db8 feat(crosswalk): release 0.2.0 — unskip T4/T6b, add T9/T10, fix nodenext compat
511f58d feat(crosswalk): add GitHub Packages publishing setup (#1)
b876d37 feat(crosswalk): backfill MP-*/MS-* AI-RMF descriptions; remove MAP-*/MEASURE-* orphans (#3)
d2b113c feat(crosswalk): backfill 3 NIST 800-53 descriptions (AC-25, AU-16, CM-14) (#2)
f6ee490 fix(ci): switch GitHub Pages workflow from npm ci to pnpm; correct artifact path
4b8383a chore(deps): commit pnpm-lock.yaml
f7d9e3a refactor: extract @shantanusinghesq/crosswalk as MIT-licensed workspace package
59ca2bd chore: bootstrap docs, scratchpads, license fix, ErrorBoundary restore
7ff0262 chore: full codebase sync — migrate from Parcel/JSX to Vite/React 19/TypeScript
```

PRs landed: #1, #2, #3 (all squash-merged after a brief accidental-close detour).

## Pre-existing issues still present

- **`tsconfig.node.json` is dead.** Exists, configures `vite.config.ts`, but `tsconfig.json` has no `references` field pointing to it. Either wire it up or delete.
- **Manus runtime artifacts.** `vite-plugin-manus-runtime` and the in-file `vitePluginManusDebugCollector` write to `.manus-logs/` during dev. Dev-only, gitignored, harmless.
- **`shared/const.ts` is effectively unused.** Re-exported by `client/src/const.ts` but nothing else imports either. Fold into `client/src/` if the directory is touched.
- **`@builder.io/vite-plugin-jsx-loc` peer warning.** Plugin expects Vite 4–5; we're on 7.3.2. Cosmetic — install succeeds.
- **Pre-existing build warnings.** `index.html` references `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` env vars not defined in any `.env` file. Bundle is also >500 KB (chunk-split warning). Both pre-existing, not introduced this session.

## Newly surfaced issues (from this session, deferred)

- **Repo Actions allowlist blocks both workflows.** `actions/permissions` = `selected`; allowlist excludes `pnpm/action-setup@v4`. Result: 0 workflow runs ever recorded on this repo. Both `publish-crosswalk.yml` and `deploy-pages.yml` (since the npm→pnpm migration in `f6ee490`) silently fail to schedule. **Fix is in the "How to unblock both workflows" section above** — one-time settings change, requires user (the harness blocks API writes to repo Actions permissions for security reasons).
- **`Home.tsx:97` fallback ordering bug.** `NIST_CONTROL_DESCRIPTIONS[id]` is checked before `NIST_AI_RMF_DESCRIPTIONS[id]`. After v0.2.0 added `MP-1` to the AI-RMF map, search for `"MP-1"` will resolve to NIST 800-53's existing `"MP-1 Media Protection Policy"` first — wrong context. Surface in the next UI session.
- **Two known-orphan AI-RMF entries** (`GV-7`, `MS-4`). Have correct short-form keys (so T10 passes) but aren't currently referenced from `CROSSWALK`. `MS-4` is a valid AI-RMF cat that AI_RMF.cats lists; CROSSWALK editorial team should decide whether to add a reference. `GV-7` is likely a leftover from an earlier 7-cat GOVERN list (current `AI_RMF.cats` has GV-1..GV-6) — either restore to AI_RMF.cats or delete from descriptions.
- **AEGIS upstream-shim cleanup.** AEGIS prototype branch contains `packages/report/src/obviate-crosswalk.d.ts` — a 26-line ambient type shim added because of the `.js`-extensions bug. Now that v0.2.0 fixes that, the shim should be deleted when AEGIS migrates from the prototype `link:` dep to a real `@shantanusinghesq/crosswalk@^0.2.0` install.

## AEGIS local state

`/Users/shantanusingh/Projects/AEGIS` (no git remote):
- `main` at `38c5f7f` — unchanged this session.
- `prototype/obviate-crosswalk-integration` at `8c5f13f` — Unit 4's prototype work (RemediationRoadmap evidence citations + AuthoritativeReferences section + ambient type shim). Marked "do not merge as-is" in commit body. Use as seed for the real PR once AEGIS gets a remote.
- Rendered demo PDF: `~/synthetic-reports/aegis-synthetic-06-laxparents-senior-pm.pdf` (62.5 KB, +24% over baseline).

## Next session candidates

1. **[BLOCKER] Add `pnpm/action-setup@v4` to the repo's Actions allowlist.** See "How to unblock both workflows" above. Until this lands, neither the publish workflow nor the Pages deploy will run. Tag `crosswalk-v0.2.0` is already on origin waiting; re-push it after the settings change.
2. **Verify the publish workflow run** once unblocked. Check https://github.com/shantanusinghesq/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/actions and https://github.com/shantanusinghesq/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/packages.
3. **Verify GH Pages deploy** also fires (it'll trigger on next push to `main` once the allowlist is fixed).
4. **Create AEGIS GitHub remote** (or decide it stays local-only). If remote: `gh repo create shantanusinghesq/aegis --private --source=. --push`, then lift the `prototype/obviate-crosswalk-integration` branch into a real PR using `@shantanusinghesq/crosswalk@^0.2.0` from GH Packages and delete the type shim.
5. **Fix `Home.tsx:97` fallback ordering** — check AI-RMF descriptions before NIST 800-53 when the prefix matches an AI-RMF function (or unify the two maps with namespaced keys).
6. **Resolve `GV-7` / `MS-4` orphans** — editorial decision on whether to delete from descriptions or add to CROSSWALK / AI_RMF.cats.
7. **Apps/* layout migration** (deferred from prior plan) — `client/` → `apps/web/`, `server/` → `apps/server/`. Pure cosmetic; reversible. Do anytime.

## Carryover from AEGIS HANDOFF — status

| AEGIS item | Status here |
|---|---|
| P1.5 — `ASI_CONTROL_MAPPING` in report | Complementary, not duplicate. AEGIS now has a path to consume the rich crosswalk via `@shantanusinghesq/crosswalk` v0.2.0 (Phase 4 = AEGIS PR1, blocked on AEGIS remote). |
| Differential-oracle / known-findings testing discipline | **Adopted.** 11-test data-integrity suite at `packages/crosswalk/tests/data.integrity.test.ts`. T10 specifically guards against the known-finding orphan-key pattern. |
| Quality gate stack (`knip`, `madge`, `verify-deps`, `check:all`) | **Deferred.** Per scratchpad D-05: low marginal value for a single-package SPA. Revisit if/when apps/* migration happens. |
| F2 `MITIGATION_BY_STATE` decision | Not applicable — this repo has no scoring engine. |
| Per-package script consolidation under `scripts/*-all.sh` | Not applicable — single-package SPA. |

---

*Updated 2026-05-01*
