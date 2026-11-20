# Contract review bot

A drop-in checker for the quality-gates framework: `.cursor/rules/quality-gates.mdc` and `.cursor/rules/agent-constraints.mdc`. It reviews a pull request only against those contracts, and only in three areas:

- **lint** — zero-warning build, typecheck, and lint (Gate 1)
- **tests** — every route and view has a render test, and no test is deleted, skipped, or weakened (Gate 2 and the hard rule against weakening tests)
- **security** — dependency audit, secret scan, no client-exposed `VITE_` secrets, no stack traces in the UI, no edits to protected paths (Gates 4 and 5, and the hard rule against editing `.github/`)

It is not a general review. It does not comment on style or features.

Gate 3 (WCAG) and Gate 6 (bundle budget) stay in the rule file for agents. This bot reports them as `skip` unless the adopting repo maps a command. The status check does not fail on that skip.

## Triggers

**Pull requests.** `opened`, `synchronize`, and `reopened`.

The unprivileged workflow checks out the pull request and runs the mapped commands. It uploads `results.json`. It does not comment and it does not have a write token.

A second workflow, `workflow_run`, runs from the default branch after that job finishes. It does not check out the pull request. It posts the comment and the status check.

**Issues.** `opened` and `labeled`.

The bot classifies which gate or constraint the issue text mentions and suggests a label. It does not apply the label. It does not install dependencies, start a shell, or compile a regular expression from the issue. Issue text is data for a fixed keyword list.

## Checks

Each automated check carries one gate id from the rule files. Gate 1 and Gate 4 have several verifying commands, so each command has its own id and the same `gate` number.

| `gate_id`              | Rule                                            | Area     | What runs                                                                                                                                        |
| ---------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `gate-1-typecheck`     | Gate 1                                          | lint     | `pnpm check`. A log line with `error` or `warning` fails.                                                                                        |
| `gate-1-build`         | Gate 1                                          | lint     | `pnpm build`. A `(!)` line or the word `warning` fails, including a zero exit.                                                                   |
| `gate-1-lint`          | Gate 1                                          | lint     | `pnpm lint` only when `package.json` has a `lint` script. Otherwise `skip`.                                                                      |
| `gate-2-test`          | Gate 2                                          | tests    | `pnpm test` must exit 0.                                                                                                                         |
| `gate-2-coverage`      | Gate 2                                          | tests    | Every `<Route>` and every `ViewType` member is mentioned by a `*.test.tsx` file. Removing a route or a tab that exists on the base commit fails. |
| `hard-tests-intact`    | Hard rule: never weaken, skip, or delete a test | tests    | No test file deleted, no new `it.skip` / `test.skip` / `describe.skip` / `.only`, no net drop in `expect(` / `assert`.                           |
| `gate-4-audit`         | Gate 4                                          | security | `pnpm audit --audit-level high`.                                                                                                                 |
| `gate-4-secrets`       | Gate 4                                          | security | `gitleaks detect --source . --redact --no-banner`. A missing binary fails.                                                                       |
| `gate-4-vite-secrets`  | Gate 4                                          | security | Scan `client/` and `packages/` for `VITE_` names that look like keys, secrets, tokens, passwords, or credentials.                                |
| `gate-4-tracked-env`   | Gate 4                                          | security | `git ls-files` must not list a `.env` file.                                                                                                      |
| `gate-5-no-stack`      | Gate 5                                          | security | `client/src` must not contain `.stack` outside tests.                                                                                            |
| `hard-protected-paths` | Hard rule: never edit `.github/`                | security | The diff must not touch `.github/`, `CODEOWNERS`, `.cursor/rules/`, `contract-review.config.json`, or `tools/contract-review-bot/`.              |

`[manual]` constraints and the N/A items (authentication, observability, internationalization) are not commands. The bot checks that the pull request description has a line for each one.

## Contract discovery

The runner reads three files from the **base** commit, not from the pull request head:

1. `contract-review.config.json` (path set by the workflow; this repo keeps the example at `tools/contract-review-bot/contract-review.config.json`)
2. The gates rule file named in that config
3. The constraints rule file named in that config

The config maps gate ids to commands or to a built-in check type (`command`, `route-coverage`, `test-integrity`, `forbidden-text`, `tracked-env`, `protected-paths`). Another repo replaces the commands. The runner does not hard-code pnpm.

Discovery then parses the base rule files:

- `## Gate N — …` headings become gate numbers.
- A gate number with no mapped check becomes a `skip` result (`gate-3`, `gate-6` on this repo).
- The hard-rule sentences ("Never weaken, skip, or delete" and "Never edit `.github/`") must have a mapped check. If the sentence is present and the check is missing, the result is `fail`.
- `##` headings that contain `[manual]`, and sections that say `**N/A today.**`, become description checks. `manual` / `na` entries in the config assign stable ids and the words that count as a mention.

A pull request that edits the rules or the config does not change the commands that judge it. The job runs the base copy. The same edit is flagged `needs-owner-review`.

## Output

One sticky comment on the pull request. The body starts with `<!-- contract-review-bot -->`. The publisher finds that marker and updates the comment. A new push does not add a second comment.

The comment has:

- the conclusion (`success` or `failure`) and the check name `contract-review`
- a `needs owner review` banner when a protected path changed, listing the paths
- a Markdown table of every result
- the `[manual]` and N/A lines, with missing ones called out and a line the author can paste
- fenced log excerpts for failures

`results.json` matches `result.schema.json`. Each result is:

```json
{
  "gate_id": "gate-1-build",
  "status": "fail",
  "evidence": {
    "command": "pnpm build",
    "exit_code": 0,
    "log_excerpt": "(!) Some chunks are larger than 500 kB"
  },
  "fix_hint": "Fix the build warning. Do not raise the chunk size limit or swallow Vite warnings."
}
```

`status` is `pass`, `fail`, `skip`, or `manual`. `manual` means the description has a line. The bot does not decide whether the sentence is true. A missing line is `fail`.

An optional summarizer is **off**. `summarizer.enabled` is `false` in the example config. Turning it on requires `CONTRACT_REVIEW_SUMMARY_COMMAND` on the trusted workflow. That command receives the result JSON on stdin and its stdout is appended. The pass/fail statuses are copied from the tool results after the summary returns. The summary cannot change a status. The template does not set the command and does not give it a model key.

## Merge-blocking

The publisher creates one check run named `contract-review` on the workflow head SHA.

- Conclusion `failure` if any result is `fail`, or if `needs_owner_review` is true.
- Conclusion `success` when every result is `pass`, `skip`, or `manual`.

Branch protection can require that check. The bot does not call the branch-protection API, does not approve, does not request changes as a review, does not merge, does not push, and does not edit the pull request body. The comment is an issue comment, not a review.

## How it stays inside the rules

**Token.** The job that runs pull request code has `contents: read` only. The comment job adds `pull-requests: write`. The issue job adds `issues: write`. The check job adds `checks: write` and `actions: read` (so it can download the artifact). No job gets `contents: write`.

**Event.** Untrusted code runs on `pull_request`, not `pull_request_target`. `pull_request_target` would run the default-branch workflow with a write token in the same job as the pull request.

**Fork pull requests.** The same split is used for every pull request, including same-repo ones, so the job that executes the change never has a write token. The unprivileged job uploads `results.json`. `workflow_run` on the default branch downloads it, checks the head SHA against the pull request API, and posts the comment. It does not check out the pull request head. If `workflow_run.pull_requests` is empty (common for forks), the artifact's pull request number is used only after the API head SHA equals the workflow head SHA. A mismatch posts no comment and fails the check.

**Pins.** Every action is pinned by full commit SHA. See `workflow.template.yml`.

**Secrets.** The install step and the check step set `GITHUB_TOKEN`, `GH_TOKEN`, `NPM_TOKEN`, and `NODE_AUTH_TOKEN` to empty. The runner also drops any environment variable that is not on a short allow-list (`PATH`, `HOME`, locale, CI, pnpm and proxy variables) before it starts a command. Pull request code does not receive secrets. The checkout credential is removed from `.git/config` before install.

**Untrusted data.** Pull request bodies, issue bodies, diffs, and file contents are data. Commands come from the base config. The issue classifier uses `String.includes` against a fixed word list. Log excerpts are fenced and token-shaped strings are redacted. Nothing in the description is passed to a shell.

**Rules from the base branch.** The workflow checks the base SHA out into `contract/` and the head into `workspace/`. The CLI path is the base copy. Config and rule paths must stay inside `contract/`.

**Protected paths.** The publisher, which lives on the default branch, unions a hard-coded minimum set (`.github/`, `.cursor/rules/`, `CODEOWNERS`, `tools/contract-review-bot/`, `contract-review.config.json`) with the artifact's list. It reads the changed files from the pulls API, not from the artifact's own pass/fail. A pull request that edits the workflow and uploads a forged all-pass artifact still fails, because the default-branch publisher sees `.github/` in the file list and sets `needs-owner-review`.

## Sketch

| File                          | Role                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `workflow.template.yml`       | Three workflows the owner copies into `.github/workflows/`. Not active in this repo.                       |
| `src/cli.ts`                  | `run`, `classify-issue`, `publish-plan`, `issue-plan`.                                                     |
| `src/evaluate.ts`             | Runs mapped checks and the description scan.                                                               |
| `contract-review.config.json` | This repo's commands (`pnpm check`, `pnpm build`, `pnpm test`, `pnpm audit --audit-level high`, gitleaks). |
| `result.schema.json`          | The result JSON schema.                                                                                    |
| `tests/`                      | Parser, diff, render, publish, and injection tests.                                                        |
