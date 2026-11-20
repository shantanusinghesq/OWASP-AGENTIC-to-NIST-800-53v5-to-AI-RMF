import {
  CHECK_NAME,
  COMMENT_MARKER,
  ISSUE_MARKER,
  type Report,
  type Status,
} from "./types.ts";

export function conclusionOf(report: Report): "success" | "failure" {
  if (report.needs_owner_review) return "failure";
  if (report.results.some((result) => result.status === "fail"))
    return "failure";
  return "success";
}

function cell(value: string): string {
  return value
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ")
    .replace(/`/g, "'")
    .slice(0, 220);
}

function fence(text: string): string {
  return "```text\n" + text.replace(/```/g, "'''") + "\n```";
}

function statusLabel(status: Status): string {
  return status;
}

/**
 * One sticky comment. The marker is how the publisher finds the comment to update.
 * Log excerpts are fenced so build output is shown as data.
 */
export function renderMarkdown(report: Report): string {
  const conclusion = conclusionOf(report);
  const lines: string[] = [
    COMMENT_MARKER,
    "## Contract review",
    "",
    `Conclusion: **${conclusion}**. Status check: \`${CHECK_NAME}\`.`,
    "",
  ];
  if (report.needs_owner_review) {
    lines.push(
      `**Needs owner review.** This pull request touches a protected path: ${report.owner_review_paths
        .map((p) => `\`${p}\``)
        .join(
          ", ",
        )}. The bot judged the change with the base-branch rules and config. It does not adopt the pull request's copy.`,
      "",
    );
  }
  lines.push(
    "The bot does not approve, request changes, merge, push, or edit this pull request.",
    "",
    "| Gate | Area | Status | Evidence | Fix hint |",
    "|---|---|---|---|---|",
  );
  for (const result of report.results) {
    const evidence = [
      result.evidence.command ? `\`${cell(result.evidence.command)}\`` : "",
      result.evidence.exit_code === null
        ? ""
        : `exit ${result.evidence.exit_code}`,
      result.evidence.log_excerpt ? cell(result.evidence.log_excerpt) : "",
    ]
      .filter(Boolean)
      .join(" — ");
    lines.push(
      `| \`${result.gate_id}\` | ${result.area} | ${statusLabel(result.status)} | ${evidence || "—"} | ${cell(result.fix_hint) || "—"} |`,
    );
  }

  const manual = report.results.filter(
    (result) => result.area === "manual" || result.area === "na",
  );
  if (manual.length > 0) {
    lines.push("", "### Manual constraints the PR description must answer", "");
    lines.push(
      "Each `[manual]` item, and each N/A item, needs one line that names it and says `satisfied` or `N/A`. A missing line is a fail. The bot checks that the line is present. It does not decide whether the sentence is true.",
      "",
    );
    for (const result of manual) {
      const mark = result.status === "fail" ? " " : "x";
      const state = result.status === "fail" ? "missing" : "answered";
      lines.push(
        `- [${mark}] \`${result.gate_id}\` ${result.title} — ${state}`,
      );
    }
    const missing = manual.filter((result) => result.status === "fail");
    if (missing.length > 0) {
      lines.push("", "Missing:", "");
      for (const result of missing) {
        lines.push(
          `- \`${result.gate_id}\`: satisfied — …  or  \`${result.gate_id}\`: N/A — …`,
        );
      }
    }
  }

  const failures = report.results.filter(
    (result) =>
      result.status === "fail" &&
      result.evidence.log_excerpt &&
      result.area !== "manual" &&
      result.area !== "na",
  );
  if (failures.length > 0) {
    lines.push("", "### Log excerpts", "");
    for (const result of failures) {
      lines.push(
        `#### \`${result.gate_id}\``,
        "",
        fence(result.evidence.log_excerpt),
        "",
      );
    }
  }

  if (report.summarizer === "appended" && report.summary) {
    lines.push(
      "### Summary",
      "",
      "This note rephrases tool output. It is not a status. The table above is the result.",
      "",
      fence(report.summary),
      "",
    );
  } else if (report.summarizer === "ignored") {
    lines.push(
      "",
      "Summarizer was enabled and did not run. Statuses were not changed.",
      "",
    );
  }

  let text = lines.join("\n");
  if (text.length > 60000) {
    text = `${text.slice(0, 59000)}\n\n…comment truncated…\n`;
  }
  return text;
}

export function renderIssueComment(
  suggestions: { gate_id: string; label: string; reason: string }[],
): string {
  const lines = [
    ISSUE_MARKER,
    "## Contract review — issue classification",
    "",
    "This bot does not run code from issue text. It suggests a label. It does not apply one.",
    "",
  ];
  if (suggestions.length === 0) {
    lines.push("No gate or constraint keyword matched. No label suggested.");
  } else {
    lines.push("| Suggested label | Gate | Why |", "|---|---|---|");
    for (const suggestion of suggestions) {
      lines.push(
        `| \`${suggestion.label}\` | \`${suggestion.gate_id}\` | ${suggestion.reason} |`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}
