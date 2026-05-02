# Context Compression — 2026-05-01 (delta on 001)
**Focus:** publishing `@obviate/crosswalk` → blockers cascade → rename + manual bypass
**Token estimate before:** ~30k (this session-since-ACC-001)
**Token estimate after:** ~1.5k
**Read 001 first:** `docs/acc/001-2026-05-01-aegis-integration-batch.md`

## Decisions

- D: Renamed package `@obviate/crosswalk` → `@haremantra/crosswalk` — GitHub Packages npm registry requires the scope to match the GitHub user/org owning the repo; no `obviate` org exists under `haremantra`
- D: Bypass GH Actions; publish manually with classic PAT — Actions blocked at user-account level, can't fix from harness or quickly
- D: Token type for GH Packages npm = **classic PAT** (`write:packages` scope) — fine-grained PATs do not yet support GitHub Packages npm publishing (documented GitHub limitation)
- D: When/if `obviate` GH org is created, bump version + republish under `@obviate/crosswalk`; AEGIS imports change in one place

## Current State

- `origin/main`: `5d272a4` — 9 new commits this session total (3 Phase-0 + 1 workflow-fix + 3 PR merges + 1 v0.2.0 release + 1 docs + 1 rename + 1 handoff-update)
- `@haremantra/crosswalk@0.2.0`: **LIVE on https://npm.pkg.github.com** — confirmed by `+ @haremantra/crosswalk@0.2.0` from `pnpm publish`
- 18 files renamed `@obviate/crosswalk` → `@haremantra/crosswalk` (configs, code, docs, scratchpads, ACC#001 included via sed)
- `~/.npmrc`: contains `@haremantra:registry=https://npm.pkg.github.com` + classic PAT auth (duplicate lines from earlier `>>` appends — harmless)
- Tag `crosswalk-v0.2.0` on origin still points at pre-rename commit `51258be` — stale but harmless (npm immutability prevents republish even if Actions fires later)
- Tests: still 11 passing, 0 skipped
- `gh auth` scopes: `gist, read:org, repo, workflow` — does NOT include `read:packages`, so package list API requires the manual classic PAT instead

## Open Questions

- Q: GH Actions disabled at user-account level — `HTTP 422: Actions has been disabled for this user`; user-level billing endpoint returns 404 (no Actions billing record). Affects publish workflow + Pages deploy. Adding a payment method did not flip it within ~2 min observation window. Path forward: wait longer / check dashboard banner / GH Support
- Q: Future `obviate` GH org strategy — register the org, transfer repo or republish, deprecate `@haremantra/crosswalk`?
- Q: AEGIS consumption (Phase 4) — install `@haremantra/crosswalk@0.2.0` in `/Users/shantanusingh/Projects/AEGIS/packages/report`, replace prototype `link:` dep, delete the 26-line ambient shim `packages/report/src/obviate-crosswalk.d.ts`. Blocked only on user decision

## Rejected Approaches

- X: Fine-grained PAT for publishing — rejected, GitHub Packages npm registry doesn't support fine-grained tokens (no `Packages` permission category exposed)
- X: Add `pnpm/action-setup@v4` to repo Actions allowlist as the fix — necessary but not sufficient; user-account Actions disable is the deeper blocker
- X: Add payment method to enable Actions — tried; did not flip the disable within observation window. May propagate later
- X: Make repo public to bypass user-account Actions disable (Path B) — user chose Path A (billing) instead; harness also blocked the visibility flip without explicit named authorization
- X: `@obviate` scope publish — rejected by registry with `403 permission_denied: create_package` because no `obviate` GH user/org exists under `haremantra`'s account

## Next Actions

1. **Wire AEGIS to consume** — `cd /Users/shantanusingh/Projects/AEGIS && pnpm add @haremantra/crosswalk@0.2.0 --filter @aegis/report` (after `~/.npmrc` is set up there too); update `packages/report/src/pdf/RemediationRoadmap.tsx` import; delete `packages/report/src/obviate-crosswalk.d.ts` shim; lift prototype branch into a real PR if AEGIS gets a remote
2. **Verify Actions enablement state** — visit https://github.com/dashboard for any banner; if still blocked, open GH Support ticket
3. **(After Actions enabled)** Bump to `0.2.1`, tag `crosswalk-v0.2.1`, push tag → confirm publish workflow runs end-to-end
4. **Editorial follow-ups** (unchanged from #001) — `Home.tsx:97` fallback ordering bug, `GV-7`/`MS-4` orphans

## See also

- `docs/acc/001-2026-05-01-aegis-integration-batch.md` — full session #1 context (extraction, /batch, AEGIS prototype)
- `HANDOFF.md` (at `5d272a4`) — current narrative state with two-layer Actions disable doc
- `packages/crosswalk/README.md` — consumer `.npmrc` instructions
