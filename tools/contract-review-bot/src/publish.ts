import { conclusionOf, renderMarkdown } from "./render.ts";
import { matchProtected } from "./checks.ts";
import { parsePrNumber } from "./schema.ts";
import {
  CHECK_NAME,
  COMMENT_MARKER,
  DEFAULT_BOT_LOGIN,
  ISSUE_MARKER,
  MINIMUM_PROTECTED_PATHS,
  type CheckResult,
  type Report,
} from "./types.ts";

export interface PullHead {
  number: number;
  headSha: string;
}

export interface CommentRef {
  id: number;
  body: string;
  authorLogin: string | null;
  authorType: string | null;
}

export interface PublishDecision {
  /** Post a check run on the workflow head. Always true so a bad artifact still fails closed. */
  check: boolean;
  /** Update the sticky comment only when this artifact belongs to the pull request's current head. */
  comment: boolean;
  trustResults: boolean;
  reason: string;
}

const SHA = /^[0-9a-f]{40}$/;

export function decidePublish(input: {
  artifactSha: string;
  eventSha: string;
  apiHeadSha: string;
}): PublishDecision {
  if (
    !SHA.test(input.eventSha) ||
    !SHA.test(input.artifactSha) ||
    input.artifactSha !== input.eventSha
  ) {
    return {
      check: true,
      comment: false,
      trustResults: false,
      reason:
        "Artifact head SHA does not match the workflow head. The comment was not posted.",
    };
  }
  if (!SHA.test(input.apiHeadSha) || input.apiHeadSha !== input.eventSha) {
    return {
      check: true,
      comment: false,
      trustResults: true,
      reason:
        "This commit is no longer the pull request head. The check was recorded and the sticky comment was left alone.",
    };
  }
  return { check: true, comment: true, trustResults: true, reason: "ok" };
}

function asArray(payload: unknown): unknown[] {
  if (Array.isArray(payload))
    return payload.flatMap((item) =>
      Array.isArray(item) ? asArray(item) : [item],
    );
  return [];
}

export function readChangedFiles(payload: unknown): string[] {
  if (!Array.isArray(payload))
    throw new Error("files payload is not a JSON array");
  const names: string[] = [];
  for (const item of asArray(payload)) {
    if (typeof item === "object" && item !== null && "filename" in item) {
      const filename = (item as { filename?: unknown }).filename;
      if (typeof filename === "string") names.push(filename);
    }
  }
  return names;
}

export function readComments(payload: unknown): CommentRef[] {
  const comments: CommentRef[] = [];
  for (const item of asArray(payload)) {
    if (typeof item !== "object" || item === null) continue;
    const id = (item as { id?: unknown }).id;
    const body = (item as { body?: unknown }).body;
    const user = (item as { user?: { login?: unknown; type?: unknown } }).user;
    if (typeof id === "number" && typeof body === "string") {
      comments.push({
        id,
        body,
        authorLogin: user && typeof user.login === "string" ? user.login : null,
        authorType: user && typeof user.type === "string" ? user.type : null,
      });
    }
  }
  return comments;
}

export function readPull(payload: unknown): PullHead | null {
  if (typeof payload !== "object" || payload === null) return null;
  const number = (payload as { number?: unknown }).number;
  const head = (payload as { head?: { sha?: unknown } }).head;
  if (!head || typeof head.sha !== "string") return null;
  try {
    return { number: parsePrNumber(number), headSha: head.sha };
  } catch {
    return null;
  }
}

export function isTrustedBot(
  comment: CommentRef,
  botLogin = DEFAULT_BOT_LOGIN,
): boolean {
  return comment.authorLogin === botLogin && comment.authorType === "Bot";
}

/** Only a comment the bot itself posted. A planted marker from a person is ignored. */
export function findStickyComment(
  comments: CommentRef[],
  marker: string,
  botLogin = DEFAULT_BOT_LOGIN,
): number | null {
  const found = comments.find(
    (comment) =>
      comment.body.includes(marker) && isTrustedBot(comment, botLogin),
  );
  return found ? found.id : null;
}

/** Issue comments are updated in place. The issue body is not part of this request. */
export function buildIssueComment(input: {
  repo: string;
  issue: number;
  comments: CommentRef[];
  body: string;
  botLogin?: string;
}): {
  method: "POST" | "PATCH";
  path: string;
  fallbackPath: string;
  body: string;
} {
  const sticky = findStickyComment(
    input.comments,
    ISSUE_MARKER,
    input.botLogin,
  );
  const fallbackPath = `/repos/${input.repo}/issues/${input.issue}/comments`;
  if (sticky === null) {
    return {
      method: "POST",
      path: fallbackPath,
      fallbackPath,
      body: input.body,
    };
  }
  return {
    method: "PATCH",
    path: `/repos/${input.repo}/issues/comments/${sticky}`,
    fallbackPath,
    body: input.body,
  };
}

export function failureCheckBody(headSha: string, message: string) {
  return {
    name: CHECK_NAME,
    head_sha: headSha,
    status: "completed" as const,
    conclusion: "failure" as const,
    output: {
      title: "Contract review failed closed",
      summary: message.slice(0, 1200),
    },
  };
}

const ADVISORY_HINT =
  "This command result came from the pull request job and is not bound. The reporter accepts command results only when protected paths, package script bodies, the lockfile, and tool configs are unchanged.";

/**
 * Structural results from the reporter replace the artifact's copy of the same gate.
 * Command passes count only when `commandsBound` is true. Otherwise they become failures,
 * so a forged all-pass artifact is not posted as success.
 */
export function bindCommandResults(
  report: Report,
  opts: {
    changedFiles: string[];
    structural: CheckResult[];
    commandsBound: boolean;
  },
): Report {
  const base = applyTrustedFiles(report, opts.changedFiles);
  const structuralIds = new Set(opts.structural.map((item) => item.gate_id));
  const kept = base.results.filter((item) => !structuralIds.has(item.gate_id));
  const results = [...kept, ...opts.structural].map((item) => ({
    ...item,
    evidence: { ...item.evidence },
  }));
  if (!opts.commandsBound) {
    for (const item of results) {
      if (structuralIds.has(item.gate_id)) continue;
      if (
        item.area !== "lint" &&
        item.area !== "tests" &&
        item.area !== "security"
      )
        continue;
      if (item.status !== "pass") continue;
      item.status = "fail";
      item.fix_hint = ADVISORY_HINT;
      item.evidence.log_excerpt = "advisory; not bound";
    }
  }
  const owner = Array.from(
    new Set([
      ...base.owner_review_paths,
      ...opts.structural
        .filter(
          (item) => item.status === "fail" && item.gate_id === "hard-tooling",
        )
        .flatMap((item) =>
          item.evidence.log_excerpt
            .split("\n")
            .map((line) => {
              const lock = /(?:lockfile|tool config) changed: (\S+)/.exec(line);
              return lock ? lock[1] : "";
            })
            .filter(Boolean),
        ),
    ]),
  );
  const toolingFailed = opts.structural.some(
    (item) => item.gate_id === "hard-tooling" && item.status === "fail",
  );
  return {
    ...base,
    needs_owner_review: base.needs_owner_review || toolingFailed,
    owner_review_paths: owner,
    results,
  };
}

function failureShell(report: Report, reason: string): Report {
  const shell: CheckResult = {
    gate_id: "contract-review",
    gate: "contract-review",
    area: "security",
    title: "Publish refused",
    status: "fail",
    evidence: { command: null, exit_code: 1, log_excerpt: reason },
    fix_hint:
      "Re-run the unprivileged job. Do not trust an artifact whose head SHA does not match.",
  };
  return {
    ...report,
    needs_owner_review: false,
    owner_review_paths: [],
    results: [shell],
    summarizer: "off",
    summary: null,
  };
}

/**
 * Apply the trusted file list. A forged all-pass artifact cannot hide a protected-path edit,
 * because the minimum path set lives in this file on the default branch.
 */
export function applyTrustedFiles(
  report: Report,
  changedFiles: string[],
): Report {
  const patterns = Array.from(
    new Set([...MINIMUM_PROTECTED_PATHS, ...report.protected_paths]),
  );
  const hits = matchProtected(changedFiles, patterns);
  if (hits.length === 0) return { ...report, protected_paths: patterns };
  const paths = Array.from(new Set([...report.owner_review_paths, ...hits]));
  const results = report.results.map((item) => ({
    ...item,
    evidence: { ...item.evidence },
  }));
  const existing = results.find(
    (item) => item.gate_id === "hard-protected-paths",
  );
  const log = paths.join("\n");
  if (existing) {
    existing.status = "fail";
    existing.evidence = {
      command: "pull request files API",
      exit_code: 1,
      log_excerpt: log,
    };
    existing.fix_hint =
      "This pull request touches a protected path. Owner review is required. The bot does not merge.";
  } else {
    results.push({
      gate_id: "hard-protected-paths",
      gate: "hard-protected-paths",
      area: "security",
      title: "Do not edit protected paths",
      status: "fail",
      evidence: {
        command: "pull request files API",
        exit_code: 1,
        log_excerpt: log,
      },
      fix_hint:
        "This pull request touches a protected path. Owner review is required. The bot does not merge.",
    });
  }
  return {
    ...report,
    needs_owner_review: true,
    owner_review_paths: paths,
    protected_paths: patterns,
    results,
  };
}

export interface PublishPlan {
  binding: "ok" | "refused" | "stale";
  reason: string;
  comment: {
    method: "POST" | "PATCH";
    path: string;
    fallbackPath: string;
    body: string;
  } | null;
  check: {
    path: string;
    body: {
      name: string;
      head_sha: string;
      status: "completed";
      conclusion: "success" | "failure";
      output: { title: string; summary: string };
    };
  };
}

export function buildPublishPlan(input: {
  report: Report;
  eventSha: string;
  pull: PullHead;
  changedFiles: string[];
  comments: CommentRef[];
  repo: string;
  /** Structural recomputation. Command passes are unbound unless this says they are. */
  structural?: CheckResult[];
  commandsBound?: boolean;
  botLogin?: string;
}): PublishPlan {
  const decision = decidePublish({
    artifactSha: input.report.head_sha,
    eventSha: input.eventSha,
    apiHeadSha: input.pull.headSha,
  });
  let report = input.report;
  if (!decision.trustResults) report = failureShell(report, decision.reason);
  else {
    report = bindCommandResults(report, {
      changedFiles: input.changedFiles,
      structural: input.structural ?? [],
      commandsBound: input.commandsBound === true,
    });
  }

  const conclusion = conclusionOf(report);
  const markdown = renderMarkdown(report);
  const sticky = findStickyComment(
    input.comments,
    COMMENT_MARKER,
    input.botLogin,
  );
  const fallbackPath = `/repos/${input.repo}/issues/${input.pull.number}/comments`;
  const comment =
    decision.comment && decision.trustResults
      ? {
          method: sticky === null ? ("POST" as const) : ("PATCH" as const),
          path:
            sticky === null
              ? fallbackPath
              : `/repos/${input.repo}/issues/comments/${sticky}`,
          fallbackPath,
          body: markdown,
        }
      : null;
  return {
    binding: !decision.trustResults
      ? "refused"
      : decision.comment
        ? "ok"
        : "stale",
    reason: decision.reason,
    comment,
    check: {
      path: `/repos/${input.repo}/check-runs`,
      body: {
        name: CHECK_NAME,
        head_sha: input.eventSha,
        status: "completed",
        conclusion,
        output: {
          title:
            conclusion === "success"
              ? "Contract review passed"
              : "Contract review failed",
          summary: markdown.slice(0, 60000),
        },
      },
    },
  };
}
