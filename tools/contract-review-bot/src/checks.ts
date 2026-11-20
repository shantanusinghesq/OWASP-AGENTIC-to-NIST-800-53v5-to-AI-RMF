import path from "node:path";

export interface DiffFile {
  path: string;
  deleted: boolean;
  addedLines: string[];
  removedLines: string[];
}

/** Parse a unified diff into per-file added and removed lines. */
export function parseUnifiedDiff(diff: string): DiffFile[] {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      current = {
        path: match ? match[2] : "",
        deleted: false,
        addedLines: [],
        removedLines: [],
      };
      files.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith("deleted file mode")) {
      current.deleted = true;
      continue;
    }
    if (
      line.startsWith("+++ ") ||
      line.startsWith("--- ") ||
      line.startsWith("@@") ||
      line.startsWith("index ") ||
      line.startsWith("new file") ||
      line.startsWith("similarity ") ||
      line.startsWith("rename ") ||
      line.startsWith("old mode") ||
      line.startsWith("new mode") ||
      line.startsWith("Binary ")
    ) {
      continue;
    }
    if (line.startsWith("+")) current.addedLines.push(line.slice(1));
    else if (line.startsWith("-")) current.removedLines.push(line.slice(1));
  }
  return files;
}

const SKIP_ADDED =
  /\b(?:it|test|describe)\.(?:skip|todo)\b|\b(?:xit|xtest|xdescribe)\s*\(|\b(?:it|test|describe)\.only\b|\.(?:only)\s*\(/;

function assertionCount(lines: string[]): number {
  let count = 0;
  for (const line of lines) {
    const matches = line.match(/\bexpect\s*\(|\bassert\s*\(|\bassert\./g);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Deleted test files, newly skipped or focused tests, and a net drop in assertions.
 * A moved assertion can trip the count. The fix hint says so.
 */
export function testIntegrityFindings(
  diff: string,
  testPathPattern: string,
): string[] {
  let testRe: RegExp;
  try {
    testRe = new RegExp(testPathPattern);
  } catch {
    return [
      `test_path_pattern is not a valid regular expression: ${testPathPattern}`,
    ];
  }
  const findings: string[] = [];
  for (const file of parseUnifiedDiff(diff)) {
    if (!testRe.test(file.path)) continue;
    if (file.deleted) findings.push(`deleted test file ${file.path}`);
    for (const line of file.addedLines) {
      if (SKIP_ADDED.test(line)) {
        findings.push(
          `skip or focused test added in ${file.path}: ${line.trim().slice(0, 160)}`,
        );
      }
    }
    const removed = assertionCount(file.removedLines);
    const added = assertionCount(file.addedLines);
    if (removed > added) {
      findings.push(
        `assertions dropped in ${file.path}: removed ${removed}, added ${added}`,
      );
    }
  }
  return findings;
}

/** A pattern ending in `/` is a directory prefix. `CODEOWNERS` matches any path with that name. */
export function matchProtected(files: string[], patterns: string[]): string[] {
  const hits = new Set<string>();
  for (const file of files) {
    const normalized = file.replace(/\\/g, "/").replace(/^\.\//, "");
    for (const pattern of patterns) {
      if (pattern.endsWith("/")) {
        if (
          normalized === pattern.slice(0, -1) ||
          normalized.startsWith(pattern)
        )
          hits.add(normalized);
      } else if (pattern === "CODEOWNERS") {
        if (normalized === "CODEOWNERS" || normalized.endsWith("/CODEOWNERS"))
          hits.add(normalized);
      } else if (normalized === pattern || normalized.endsWith(`/${pattern}`)) {
        hits.add(normalized);
      }
    }
  }
  return Array.from(hits);
}

export function findTrackedEnv(files: string[]): string[] {
  return files.filter((file) =>
    /(^|\/)\.env($|\.)/.test(file.replace(/\\/g, "/")),
  );
}

export interface Surface {
  kind: "route" | "view" | "catch-all";
  id: string;
}

export function extractRoutes(source: string): {
  paths: string[];
  catchAll: boolean;
} {
  const paths: string[] = [];
  let catchAll = false;
  const tagRe = /<Route\b([\s\S]*?)\/?>/g;
  let tag: RegExpExecArray | null;
  while ((tag = tagRe.exec(source)) !== null) {
    const pathMatch = /\bpath=\{?"(\/[^"]*)"\}?/.exec(tag[1]);
    if (pathMatch) paths.push(pathMatch[1]);
    else catchAll = true;
  }
  return { paths: Array.from(new Set(paths)), catchAll };
}

export function extractViewType(source: string, name: string): string[] {
  const match = new RegExp(
    `export type ${escapeRegExp(name)} = ([\\s\\S]*?);`,
  ).exec(source);
  if (!match) return [];
  const names: string[] = [];
  const re = /"([^"]+)"/g;
  let part: RegExpExecArray | null;
  while ((part = re.exec(match[1])) !== null) names.push(part[1]);
  return names;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function uncoveredSurfaces(opts: {
  headRoutes: string[];
  baseRoutes: string[];
  headCatchAll: boolean;
  baseCatchAll: boolean;
  headViews: string[];
  baseViews: string[];
  testText: string;
  routeMarkers: Record<string, string[]>;
  catchAllMarkers: string[];
}): string[] {
  const findings: string[] = [];
  const has = (markers: string[]) =>
    markers.some(
      (marker) => marker.length > 0 && opts.testText.includes(marker),
    );
  for (const route of opts.baseRoutes) {
    if (!opts.headRoutes.includes(route))
      findings.push(`route removed: ${route}`);
  }
  if (opts.baseCatchAll && !opts.headCatchAll)
    findings.push("catch-all route removed");
  for (const view of opts.baseViews) {
    if (!opts.headViews.includes(view)) findings.push(`view removed: ${view}`);
  }
  for (const route of opts.headRoutes) {
    const markers = opts.routeMarkers[route] ?? [route];
    if (!has(markers))
      findings.push(
        `no render test mentions route ${route} (${markers.join(", ")})`,
      );
  }
  if (opts.headCatchAll && !has(opts.catchAllMarkers)) {
    findings.push(
      `no render test mentions the catch-all (${opts.catchAllMarkers.join(", ")})`,
    );
  }
  for (const view of opts.headViews) {
    const marker = `tab=${view}`;
    if (!opts.testText.includes(marker))
      findings.push(`no render test mentions ${marker}`);
  }
  return findings;
}

export function compilePattern(source: string): RegExp {
  return new RegExp(source, "m");
}

export function findForbidden(
  files: { path: string; text: string }[],
  pattern: RegExp,
  limit = 20,
): string[] {
  const hits: string[] = [];
  for (const file of files) {
    const lines = file.text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        hits.push(`${file.path}:${i + 1}`);
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

/** Resolve `rel` inside `root`, or return null when it escapes. */
export function safeJoin(root: string, rel: string): string | null {
  const base = path.resolve(root);
  const abs = path.resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + path.sep)) return null;
  return abs;
}

const REDACT = [
  /ghp_[A-Za-z0-9_]+/g,
  /github_pat_[A-Za-z0-9_]+/g,
  /AKIA[0-9A-Z]{16}/g,
  /xox[baprs]-[A-Za-z0-9-]+/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
];

export function redact(text: string): string {
  let out = text;
  for (const pattern of REDACT) out = out.replace(pattern, "[redacted]");
  return out;
}

/** Short, single-block excerpt. Matching lines win; otherwise the tail. */
export function excerpt(log: string, pattern?: RegExp): string {
  const clean = redact(log).replace(/\u0000/g, "");
  let chosen = clean;
  if (pattern) {
    const lines = clean.split(/\r?\n/).filter((line) => {
      pattern.lastIndex = 0;
      return pattern.test(line);
    });
    if (lines.length > 0) chosen = lines.slice(0, 20).join("\n");
  } else {
    const lines = clean.split(/\r?\n/);
    chosen = lines.slice(-30).join("\n");
  }
  if (chosen.length > 1200) chosen = `${chosen.slice(0, 1200)}\n…`;
  return chosen;
}

export function resultEvidence(
  command: string | null,
  exitCode: number | null,
  log: string,
  pattern?: RegExp,
) {
  return { command, exit_code: exitCode, log_excerpt: excerpt(log, pattern) };
}
