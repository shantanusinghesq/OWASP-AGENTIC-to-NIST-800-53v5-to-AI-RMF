import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyIssue } from "./classify.ts";
import { parseConfig } from "./config.ts";
import { evaluate } from "./evaluate.ts";
import { loadGitSnapshot } from "./git-snapshot.ts";
import { createIo, isSha, workspaceHead } from "./io.ts";
import {
  buildIssueComment,
  buildPublishPlan,
  failureCheckBody,
  readChangedFiles,
  readComments,
  readPull,
} from "./publish.ts";
import { recomputeStructural } from "./recompute.ts";
import { renderIssueComment, renderMarkdown } from "./render.ts";
import {
  parsePrNumber,
  readTextCapped,
  validateReport,
  type ResultSchema,
} from "./schema.ts";
import type { CheckResult, Report } from "./types.ts";

const SCHEMA_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../result.schema.json",
);

function flags(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = "true";
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function readJson(file: string, maxBytes = 5_000_000): unknown {
  return JSON.parse(readTextCapped(file, maxBytes));
}

function loadSchema(): ResultSchema {
  return JSON.parse(readTextCapped(SCHEMA_PATH, 200_000)) as ResultSchema;
}

function loadReport(file: string): Report {
  return validateReport(JSON.parse(readTextCapped(file)), loadSchema());
}

function eventPrNumber(raw: string | undefined): number | null {
  if (!raw || raw === "true") return null;
  if (!/^[0-9]+$/.test(raw))
    throw new Error("--event-pr must be a decimal integer");
  return parsePrNumber(Number(raw));
}

function failureReport(
  message: string,
  baseSha: string,
  headSha: string,
  prNumber: number | null,
): Report {
  return {
    version: 1,
    head_sha: headSha,
    base_sha: baseSha,
    pr_number: prNumber,
    needs_owner_review: false,
    owner_review_paths: [],
    protected_paths: [],
    summarizer: "off",
    summary: null,
    results: [
      {
        gate_id: "contract-review",
        gate: "contract-review",
        area: "security",
        title: "Runner failed before checks",
        status: "fail",
        evidence: {
          command: null,
          exit_code: 1,
          log_excerpt: message.slice(0, 1200),
        },
        fix_hint: "Fix the runner error. A crash is a fail, not a skip.",
      },
    ],
  };
}

async function run(args: Record<string, string>): Promise<void> {
  const contractRoot = args["contract-root"] ?? "";
  const workspace = args.workspace ?? "";
  const configRel = args.config ?? "contract-review.config.json";
  const baseSha = args["base-sha"] ?? "";
  const headSha = args["head-sha"] ?? "";
  const out = args.out ?? "";
  const prRaw = args["pr-number"];
  const prNumber = prRaw && /^[0-9]+$/.test(prRaw) ? Number(prRaw) : null;
  if (!out) throw new Error("--out is required");
  const write = (report: Report) => {
    mkdirSync(path.dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
    if (args.markdown) {
      mkdirSync(path.dirname(args.markdown), { recursive: true });
      writeFileSync(args.markdown, renderMarkdown(report));
    }
  };
  if (!isSha(baseSha) || !isSha(headSha)) {
    write(
      failureReport(
        "base SHA and head SHA must be 40 hex characters",
        baseSha,
        headSha,
        prNumber,
      ),
    );
    return;
  }
  try {
    const root = path.resolve(contractRoot);
    const inside = (file: string) =>
      file === root || file.startsWith(root + path.sep);
    const configPath = path.resolve(root, configRel);
    if (!inside(configPath))
      throw new Error("config path escapes the contract root");
    const config = parseConfig(readJson(configPath));
    const gatesPath = path.resolve(root, config.rules.gates);
    const constraintsPath = path.resolve(root, config.rules.constraints);
    if (!inside(gatesPath) || !inside(constraintsPath)) {
      throw new Error("rules path escapes the contract root");
    }
    const head = workspaceHead(workspace);
    if (head !== headSha)
      throw new Error(`workspace HEAD ${head} does not match --head-sha`);
    const prBody = args["pr-body-file"]
      ? readFileSync(args["pr-body-file"], "utf8")
      : "";
    const report = await evaluate({
      config,
      gatesMarkdown: readFileSync(gatesPath, "utf8"),
      constraintsMarkdown: readFileSync(constraintsPath, "utf8"),
      prBody,
      baseSha,
      headSha,
      prNumber,
      io: createIo(workspace, baseSha),
      summaryCommand: process.env.CONTRACT_REVIEW_SUMMARY_COMMAND ?? null,
    });
    write(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    write(failureReport(message, baseSha, headSha, prNumber));
  }
}

function classify(): void {
  const suggestions = classifyIssue(
    process.env.ISSUE_TITLE ?? "",
    process.env.ISSUE_BODY ?? "",
  );
  process.stdout.write(`${JSON.stringify({ suggestions }, null, 2)}\n`);
}

function publish(args: Record<string, string>): void {
  const repo = args.repo ?? "";
  const eventSha = args["event-sha"] ?? "";
  const out = args.out ?? "";
  if (!out) throw new Error("--out is required");
  const writeFailure = (message: string) => {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !isSha(eventSha)) {
      throw new Error(message);
    }
    mkdirSync(out, { recursive: true });
    writeFileSync(
      path.join(out, "check-body.json"),
      `${JSON.stringify(failureCheckBody(eventSha, message))}\n`,
    );
    writeFileSync(path.join(out, "check-path"), `/repos/${repo}/check-runs\n`);
    writeFileSync(path.join(out, "comment-method"), "SKIP\n");
    writeFileSync(path.join(out, "comment-path"), "\n");
    writeFileSync(path.join(out, "comment-fallback-path"), "\n");
    writeFileSync(path.join(out, "comment-body.json"), "{}\n");
    writeFileSync(path.join(out, "binding"), "refused\n");
    process.stderr.write(`${message}\n`);
  };
  try {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
      throw new Error("--repo must be owner/name");
    if (!isSha(eventSha))
      throw new Error("--event-sha must be 40 hex characters");
    const report = loadReport(args.results ?? "");
    const eventPr = eventPrNumber(args["event-pr"]);
    if (eventPr !== null && report.pr_number !== eventPr) {
      throw new Error(
        `artifact pr_number ${String(report.pr_number)} does not match workflow_run pr ${eventPr}`,
      );
    }
    const pull = readPull(readJson(args.pr ?? ""));
    if (!pull) throw new Error("pull request JSON has no number and head SHA");
    if (report.pr_number !== null && pull.number !== report.pr_number) {
      throw new Error("pull request API number does not match the artifact");
    }
    const configPath = path.resolve(
      args["contract-root"] ?? ".",
      args.config ?? "tools/contract-review-bot/contract-review.config.json",
    );
    const config = parseConfig(JSON.parse(readTextCapped(configPath)));
    let structural: CheckResult[] | undefined;
    let commandsBound = false;
    if (args["git-dir"]) {
      try {
        const snap = loadGitSnapshot(
          args["git-dir"],
          report.base_sha,
          report.head_sha,
        );
        const recomputed = recomputeStructural(config, snap);
        structural = recomputed.results;
        commandsBound = recomputed.commandsBound;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        structural = [
          {
            gate_id: "hard-tooling",
            gate: "hard-tooling",
            area: "security",
            title: "Reporter could not read the pull request tree",
            status: "fail",
            evidence: {
              command: "git show",
              exit_code: 1,
              log_excerpt: message.slice(0, 1200),
            },
            fix_hint:
              "Command results stay unbound when the reporter cannot read the commits. This is a failure.",
          },
        ];
        commandsBound = false;
      }
    }
    const plan = buildPublishPlan({
      report,
      eventSha,
      pull,
      changedFiles: readChangedFiles(readJson(args.files ?? "")),
      comments: readComments(readJson(args.comments ?? "")),
      repo,
      structural,
      commandsBound,
      botLogin: args["bot-login"],
    });
    mkdirSync(out, { recursive: true });
    writeFileSync(
      path.join(out, "check-body.json"),
      `${JSON.stringify(plan.check.body)}\n`,
    );
    writeFileSync(path.join(out, "check-path"), `${plan.check.path}\n`);
    if (plan.comment) {
      writeFileSync(
        path.join(out, "comment-method"),
        `${plan.comment.method}\n`,
      );
      writeFileSync(path.join(out, "comment-path"), `${plan.comment.path}\n`);
      writeFileSync(
        path.join(out, "comment-fallback-path"),
        `${plan.comment.fallbackPath}\n`,
      );
      writeFileSync(
        path.join(out, "comment-body.json"),
        `${JSON.stringify({ body: plan.comment.body })}\n`,
      );
    } else {
      writeFileSync(path.join(out, "comment-method"), "SKIP\n");
      writeFileSync(path.join(out, "comment-path"), "\n");
      writeFileSync(path.join(out, "comment-fallback-path"), "\n");
      writeFileSync(path.join(out, "comment-body.json"), "{}\n");
    }
    writeFileSync(path.join(out, "binding"), `${plan.binding}\n`);
  } catch (error) {
    writeFailure(error instanceof Error ? error.message : String(error));
  }
}

function issuePlan(args: Record<string, string>): void {
  const repo = args.repo ?? "";
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))
    throw new Error("--repo must be owner/name");
  const issueRaw = args.issue ?? "";
  if (!/^[0-9]+$/.test(issueRaw)) throw new Error("--issue must be a number");
  const out = args.out ?? "";
  if (!out) throw new Error("--out is required");
  const body = readFileSync(args.body ?? "", "utf8");
  const plan = buildIssueComment({
    repo,
    issue: Number(issueRaw),
    comments: readComments(readJson(args.comments ?? "")),
    body,
  });
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "comment-method"), `${plan.method}\n`);
  writeFileSync(path.join(out, "comment-path"), `${plan.path}\n`);
  writeFileSync(
    path.join(out, "comment-fallback-path"),
    `${plan.fallbackPath}\n`,
  );
  writeFileSync(
    path.join(out, "comment-body.json"),
    `${JSON.stringify({ body: plan.body })}\n`,
  );
}

function readBinding(args: Record<string, string>): void {
  const out = args.out ?? "";
  if (!out) throw new Error("--out is required");
  const report = loadReport(args.results ?? "");
  if (report.pr_number === null)
    throw new Error("results have no pull request number");
  const eventPr = eventPrNumber(args["event-pr"]);
  if (eventPr !== null && report.pr_number !== eventPr) {
    throw new Error(
      `artifact pr_number ${report.pr_number} does not match workflow_run pr ${eventPr}`,
    );
  }
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "pr"), `${report.pr_number}\n`);
  writeFileSync(path.join(out, "sha"), `${report.head_sha}\n`);
  writeFileSync(path.join(out, "base"), `${report.base_sha}\n`);
}

const [command, ...rest] = process.argv.slice(2);
const args = flags(rest);

if (command === "run") {
  run(args).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  });
} else if (command === "classify-issue") {
  classify();
} else if (command === "publish-plan") {
  publish(args);
} else if (command === "read-binding") {
  readBinding(args);
} else if (command === "issue-plan") {
  issuePlan(args);
} else if (command === "render-issue") {
  const parsed = JSON.parse(readFileSync(args.in ?? "/dev/stdin", "utf8")) as {
    suggestions?: { gate_id: string; label: string; reason: string }[];
  };
  process.stdout.write(renderIssueComment(parsed.suggestions ?? []));
} else {
  process.stderr.write(
    "usage: cli.ts <run|classify-issue|publish-plan|read-binding|issue-plan|render-issue> [flags]\n",
  );
  process.exit(2);
}
