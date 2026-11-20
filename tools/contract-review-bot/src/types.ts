/** Status of one gate. `manual` means a person answered it; the bot does not judge the prose. */
export type Status = "pass" | "fail" | "skip" | "manual";

export type Area = "lint" | "tests" | "security" | "manual" | "na" | "unmapped";

export type SummarizerState = "off" | "appended" | "ignored";

export interface Evidence {
  command: string | null;
  exit_code: number | null;
  log_excerpt: string;
}

export interface CheckResult {
  gate_id: string;
  /** Rule id this check maps to: "1", "2", "4", "5", or a hard-rule / manual id. */
  gate: string;
  area: Area;
  title: string;
  status: Status;
  evidence: Evidence;
  fix_hint: string;
}

export interface Report {
  version: 1;
  head_sha: string;
  base_sha: string;
  pr_number: number | null;
  needs_owner_review: boolean;
  owner_review_paths: string[];
  /** Union of the base config paths and the publisher's minimum set. */
  protected_paths: string[];
  summarizer: SummarizerState;
  /** Present only when a summarizer appended text. Never read back as a status. */
  summary: string | null;
  results: CheckResult[];
}

export interface ManualOverride {
  title_includes: string;
  gate_id: string;
  anchors: string[];
}

interface CheckBase {
  gate_id: string;
  gate: string;
  area: "lint" | "tests" | "security";
  title: string;
  fix_hint?: string;
}

export interface CommandCheck extends CheckBase {
  type: "command";
  command: string;
  /** JavaScript regular expression, tested against the combined log. A match fails a zero exit. */
  fail_on_pattern?: string;
  /** Exit codes that count as a clean run before `fail_on_pattern`. Default [0]. */
  success_exit_codes?: number[];
  /** Skip (do not fail) when `package.json` has no such script. */
  when_package_script?: string;
  skip_reason?: string;
  timeout_ms?: number;
}

export interface TestIntegrityCheck extends CheckBase {
  type: "test-integrity";
  /** Regex tested against diff paths. */
  test_path_pattern: string;
}

export interface ProtectedPathsCheck extends CheckBase {
  type: "protected-paths";
}

export interface RouteCoverageCheck extends CheckBase {
  type: "route-coverage";
  routes_file: string;
  view_type_file: string;
  view_type_name: string;
  tests_dir: string;
  test_suffixes: string[];
  /** Path → strings that must appear in some test file. Default marker is the path itself. */
  route_markers?: Record<string, string[]>;
  catch_all_markers?: string[];
}

export interface ForbiddenTextCheck extends CheckBase {
  type: "forbidden-text";
  roots: string[];
  pattern: string;
  exclude_suffixes?: string[];
  exclude_dir_names?: string[];
}

export interface TrackedEnvCheck extends CheckBase {
  type: "tracked-env";
}

export type Check =
  | CommandCheck
  | TestIntegrityCheck
  | ProtectedPathsCheck
  | RouteCoverageCheck
  | ForbiddenTextCheck
  | TrackedEnvCheck;

export interface Config {
  version: 1;
  rules: { gates: string; constraints: string };
  protected_paths: string[];
  summarizer: { enabled: boolean };
  manual: ManualOverride[];
  na: ManualOverride[];
  checks: Check[];
}

export interface DiscoveredItem {
  gate_id: string;
  title: string;
  kind: "manual" | "na";
  anchors: string[];
}

export interface Discovery {
  gates: { number: string; title: string }[];
  hard_tests: boolean;
  hard_protected: boolean;
  items: DiscoveredItem[];
}

/** Filesystem and process hooks. Tests pass fakes. The CLI passes real ones. */
export interface Io {
  /** Read a workspace-relative file. Null when it does not exist. */
  read(rel: string): string | null;
  /** Read the same path from the base commit. Null when it does not exist. */
  readBase(rel: string): string | null;
  walk(opts: {
    roots: string[];
    suffixes?: string[];
    exclude_suffixes?: string[];
    exclude_dir_names?: string[];
  }): { path: string; text: string }[];
  /** `git diff base...head`. Throws if git cannot produce it. */
  diff(): string;
  /** `git diff --name-only base...head`. */
  names(): string[];
  /** `git ls-files`. */
  lsFiles(): string[];
  /** `package.json` "scripts" object from the workspace. */
  packageScripts(): Record<string, string>;
  command(
    command: string,
    timeoutMs: number,
    stdin?: string,
  ): Promise<{ code: number; log: string }>;
}

export const COMMENT_MARKER = "<!-- contract-review-bot -->";
export const ISSUE_MARKER = "<!-- contract-review-bot:issue -->";
export const CHECK_NAME = "contract-review";

/** Paths the trusted publisher always enforces, even if a forged artifact omits them. */
export const MINIMUM_PROTECTED_PATHS = [
  ".github/",
  ".cursor/rules/",
  "CODEOWNERS",
  "tools/contract-review-bot/",
  "contract-review.config.json",
];
