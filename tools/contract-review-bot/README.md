# Contract review bot

Drop-in reviewer for the quality-gates framework (`.cursor/rules/quality-gates.mdc` and `.cursor/rules/agent-constraints.mdc`). Design details are in [DESIGN.md](DESIGN.md).

This directory is a template. Nothing here runs in GitHub Actions until a person copies the workflows into `.github/workflows/`. Agents must not make that copy. This repository's rules forbid agents from editing `.github/`.

The bot checks lint, tests, and security only. It does not review style or features.

## Adoption

Do these five steps on the default branch. The bot reads the config and the rule files from that branch, so a pull request cannot swap the commands that judge it.

1. **Put the two rule files on the default branch.** The paths in the example config are `.cursor/rules/quality-gates.mdc` and `.cursor/rules/agent-constraints.mdc`. Change `rules` in the config if your repo uses different paths. This repo's copies are added by the quality-gates pull request; the bot has nothing to read until those files are on the default branch.

2. **Commit the config on the default branch.** Start from `contract-review.config.json` in this folder. Replace the `command` values with direct binaries if you are not this repo. The example uses `node_modules/.bin/tsc --noEmit`, `node_modules/.bin/vite build`, `node_modules/.bin/vitest run`, and `pnpm audit --audit-level high`. Do not point a command at `pnpm <script>`. The runner does not execute `package.json` script bodies. Leave `summarizer.enabled` at `false`. `node_modules/.bin` still comes from the pull request lockfile, so a lockfile change is flagged `needs-owner-review` and the check fails.

3. **Copy the workflows yourself.** `workflow.template.yml` holds three documents. Copy each one into its own file:
   - `.github/workflows/contract-review.yml`
   - `.github/workflows/contract-review-report.yml`
   - `.github/workflows/contract-review-issues.yml`

   Do not commit the template as a single workflow file. Keep the action SHAs pinned. If you are not this repo, replace the pnpm install block and the `--config` path. Keep `--ignore-scripts`, and keep the step that records the absolute `node` and `pnpm` before install. The report job's token is `contents: read`, `actions: read`, `checks: write`, `issues: write`, and `pull-requests: read`. It does not have `pull-requests: write`. Point `--config` at the config file on the default branch (the example path is `tools/contract-review-bot/contract-review.config.json`).

4. **Install gitleaks on the runner, and give the evaluate job no secrets.** Pin a gitleaks release and verify its checksum. Do not `curl | sh`. The evaluate job's token stays `contents: read`. Do not add repository secrets to that job. The check step clears `GITHUB_TOKEN` before it runs pull request code.

5. **Require the check only if you want it to block merges.** The check name is `contract-review`. Adding it to branch protection is a repository setting. The bot will not turn protection on, will not approve, and will not merge. Open a test pull request and confirm there is one comment, that a second push updates that comment, and that the check appears on the head commit.

## Run it locally

From the repository root, on Node 22, with dependencies already installed:

```bash
node --experimental-strip-types tools/contract-review-bot/src/cli.ts run \
  --contract-root . \
  --workspace . \
  --config tools/contract-review-bot/contract-review.config.json \
  --base-sha "$(git rev-parse HEAD)" \
  --head-sha "$(git rev-parse HEAD)" \
  --out /tmp/contract-review.json \
  --markdown /tmp/contract-review.md
```

`--contract-root` is the tree whose rules and config are trusted. In Actions that is the base commit. Locally, pointing both roots at the same checkout runs the commands; it does not reproduce the base-versus-head split.

The unit tests run with the repo suite: `pnpm test`.

## Pull request description lines

Each `[manual]` item and each N/A item needs one line that names it and says `satisfied` or `N/A`. The disposition has to be on the same line as the name.

```text
manual-lcp: N/A — this diff does not change client rendering
manual-schema: satisfied — the diff does not touch a JSON or URL boundary
na-auth: N/A — the off-device user-data trigger has not fired
```

The ids are in the config (`manual-lcp`, `manual-schema`, `manual-env`, `manual-flags`, `manual-rollback`, `manual-review`, `manual-incident`, `manual-design`, `manual-empty`, `manual-responsive`, `manual-legal`, `na-auth`, `na-observability`, `na-i18n`).

## Known limits

- **Gate 3 and Gate 6 are not run.** Accessibility and the bundle budget stay in the rule file. The comment lists them as `skip`. Map a command if you want them to block.
- **Lint is `skip` until a `lint` script exists.** Gate 1 says not to add a linter only to satisfy the clause.
- **`pnpm audit` includes dev dependencies.** High or critical advisories in tools such as vitest fail Gate 4. The bot does not lower `--audit-level` and does not add an ignore. If there is no fix, the owner decides.
- **gitleaks is not installed by this template.** A missing binary fails Gate 4. It is not a skip. Trufflehog is not substituted.
- **Route coverage is a string check.** `gate-2-coverage` looks for `tab=<view>` and the configured route markers in `*.test.tsx` files. It does not prove the test renders the page and asserts on it. `node_modules/.bin/vitest run` still has to exit 0.
- **The assertion count can false-positive.** Moving an `expect(` from one test file to another drops the count in the first file. The fix hint says to tell the owner. Deleting a test file, or adding `it.skip` / `.only`, is a hard fail.
- **Manual lines are presence checks.** The bot does not judge whether "satisfied" is true.
- **Fork pull requests.** The evaluate job cannot comment. The default-branch reporter comments only when the artifact's head SHA, the workflow head SHA, and the pull request's current head SHA all match. `pr_number` has to be a safe positive integer and, when `workflow_run` includes a pull request number, it has to match. An invalid or oversized artifact posts a failing `contract-review` check and no comment. The check is posted before the comment. A stale run records a check on its own commit and leaves the sticky comment alone. The sticky update only touches a comment from `github-actions[bot]` with type `Bot`. A 403 or 404 on that patch creates a new comment instead of dropping the check.
- **Command results are advisory until the reporter binds them.** The reporter recomputes protected paths, script bodies, lockfiles, tool configs, test deletions and renames, tracked env files, forbidden text, and route coverage from git blobs and the pulls API. It does not run tsc, vite, vitest, audit, or gitleaks. Those exit codes count only when that recomputation is clean. A forged all-pass is not posted as success. The reporter still does not re-execute those tools, because that would run pull request code in the privileged job.
- **`node_modules/.bin` comes from the pull request lockfile.** A lockfile change, a referenced script-body change, or a change to `vite.config.*`, `vitest.config.*`, or `tsconfig*.json` fails the check and sets `needs-owner-review`. A dependency that was already in the base lockfile is not a new diff. A bug in a pinned action is outside this check.
- **Install does not run lifecycle scripts.** The template uses `pnpm install --frozen-lockfile --ignore-scripts`, records the absolute `node` and `pnpm` before install, and execs commands with `shell: false`. A `~/.bashrc` written by the pull request is not sourced. What remains is code those tools load on purpose, such as `vite.config.ts`, and that file is in the tooling check.
- **Branch protection is the owner's setting.** On this repo, Solo Mode in `GOVERNANCE.md` leaves required approvals at zero, and branch protection is Shanti's setting. This bot only creates a check named `contract-review`. It does not enable protection, and requiring the check does not by itself change the approval rule.
- **A live run on today's main would be red** for reasons already recorded against the gates: the production build prints a chunk-size warning, `pnpm audit --audit-level high` reports high and critical advisories, and gitleaks is not on the machine. Those are gate results, not a reason to weaken the config.
