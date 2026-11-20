export interface Suggestion {
  gate_id: string;
  label: string;
  reason: string;
}

/**
 * Fixed keywords. The issue title and body are searched with String.includes.
 * They are never compiled as a regular expression and never passed to a shell.
 */
const KEYWORDS: {
  gate_id: string;
  label: string;
  words: string[];
  reason: string;
}[] = [
  {
    gate_id: "gate-1",
    label: "area:lint",
    words: [
      "lint",
      "typecheck",
      "type check",
      "tsc",
      "zero warning",
      "build warning",
    ],
    reason: "The text mentions the build, typecheck, or lint gate.",
  },
  {
    gate_id: "gate-2",
    label: "area:tests",
    words: [
      "render test",
      "missing test",
      "skipped test",
      "?tab",
      "viewtype",
      "route test",
    ],
    reason: "The text mentions route or view tests.",
  },
  {
    gate_id: "hard-tests-intact",
    label: "area:tests",
    words: ["it.skip", "test.skip", "deleted test", "weaken"],
    reason: "The text mentions a skipped, deleted, or weakened test.",
  },
  {
    gate_id: "gate-4",
    label: "area:security",
    words: [
      "cve",
      "dependenc",
      "audit",
      "secret",
      "gitleaks",
      "vite_",
      "credential",
      ".env",
    ],
    reason: "The text mentions dependencies or secrets.",
  },
  {
    gate_id: "gate-5",
    label: "area:security",
    words: ["stack trace", "stacktrace", "error boundary", ".stack"],
    reason: "The text mentions a stack trace in the UI.",
  },
  {
    gate_id: "hard-protected-paths",
    label: "needs-owner-review",
    words: [
      ".github",
      "codeowners",
      "workflow",
      ".cursor/rules",
      "branch protection",
    ],
    reason: "The text mentions a protected path or branch protection.",
  },
  {
    gate_id: "manual-lcp",
    label: "manual:lcp",
    words: ["lighthouse", "lcp", "load time"],
    reason: "The text mentions the load-time constraint.",
  },
  {
    gate_id: "manual-legal",
    label: "manual:legal",
    words: ["privacy", "cookie", "gdpr", "retention"],
    reason: "The text mentions the legal constraint.",
  },
  {
    gate_id: "na-auth",
    label: "na:auth",
    words: ["authentication", "authorization", "login"],
    reason:
      "The text mentions authentication. The constraint is N/A until its trigger fires.",
  },
];

export function classifyIssue(title: string, body: string): Suggestion[] {
  const text = `${title}\n${body}`.toLowerCase();
  const suggestions: Suggestion[] = [];
  const seen = new Set<string>();
  for (const entry of KEYWORDS) {
    if (!entry.words.some((word) => text.includes(word))) continue;
    const key = `${entry.label}:${entry.gate_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push({
      gate_id: entry.gate_id,
      label: entry.label,
      reason: entry.reason,
    });
  }
  return suggestions;
}
