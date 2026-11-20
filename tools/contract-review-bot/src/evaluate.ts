import type { CheckResult, Config, Io, Report } from "./types.ts";
import { MINIMUM_PROTECTED_PATHS } from "./types.ts";
import { discover, lineAnswers } from "./discover.ts";
import {
  compilePattern,
  extractRoutes,
  extractViewType,
  findForbidden,
  findTrackedEnv,
  matchProtected,
  resultEvidence,
  testIntegrityFindings,
  uncoveredSurfaces,
} from "./checks.ts";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

function result(
  partial: Omit<CheckResult, "evidence" | "fix_hint"> & {
    evidence?: CheckResult["evidence"];
    fix_hint?: string;
    command?: string | null;
    exit_code?: number | null;
    log?: string;
  },
): CheckResult {
  return {
    gate_id: partial.gate_id,
    gate: partial.gate,
    area: partial.area,
    title: partial.title,
    status: partial.status,
    evidence:
      partial.evidence ??
      resultEvidence(
        partial.command ?? null,
        partial.exit_code ?? null,
        partial.log ?? "",
      ),
    fix_hint: partial.fix_hint ?? "",
  };
}

function unmapped(number: string, title: string): CheckResult {
  return result({
    gate_id: `gate-${number}`,
    gate: number,
    area: "unmapped",
    title,
    status: "skip",
    log: "No command is mapped for this gate on the base branch.",
    fix_hint:
      "The status check does not fail on an unmapped gate. Map a check with this gate number in the base config to enforce it. Gate 3 (accessibility) and Gate 6 (bundle budget) are outside this bot's lint, tests, and security scope unless you map them.",
  });
}

export interface EvaluateInput {
  config: Config;
  gatesMarkdown: string;
  constraintsMarkdown: string;
  prBody: string;
  baseSha: string;
  headSha: string;
  prNumber: number | null;
  io: Io;
  /** Trusted workflow only. Receives the report JSON on stdin. Null when off. */
  summaryCommand?: string | null;
}

/**
 * Run every mapped check. Pull-request text is used only as data for the manual-line scan.
 * Commands come from the base config, never from the pull request body or diff.
 */
export async function evaluate(input: EvaluateInput): Promise<Report> {
  const discovery = discover(
    input.gatesMarkdown,
    input.constraintsMarkdown,
    input.config,
  );
  const protectedPaths = Array.from(
    new Set([...MINIMUM_PROTECTED_PATHS, ...input.config.protected_paths]),
  );
  const results: CheckResult[] = [];
  let ownerPaths: string[] = [];

  for (const check of input.config.checks) {
    const hint = check.fix_hint ?? "";
    if (check.type === "command") {
      if (check.when_package_script) {
        const scripts = input.io.packageScripts();
        const script = scripts[check.when_package_script];
        if (typeof script !== "string" || script.trim() === "") {
          results.push(
            result({
              gate_id: check.gate_id,
              gate: check.gate,
              area: check.area,
              title: check.title,
              status: "skip",
              command: check.command,
              log:
                check.skip_reason ??
                `No "${check.when_package_script}" script in package.json.`,
              fix_hint: hint,
            }),
          );
          continue;
        }
      }
      const ran = await input.io.command(
        check.command,
        check.timeout_ms ?? DEFAULT_TIMEOUT_MS,
      );
      const success = new Set(check.success_exit_codes ?? [0]);
      let pattern: RegExp | undefined;
      let patternBad = false;
      if (check.fail_on_pattern) {
        try {
          pattern = compilePattern(check.fail_on_pattern);
        } catch {
          patternBad = true;
        }
      }
      const matched = pattern ? pattern.test(ran.log) : false;
      const failed = patternBad || !success.has(ran.code) || matched;
      results.push(
        result({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: failed ? "fail" : "pass",
          command: check.command,
          exit_code: ran.code,
          log: patternBad
            ? `fail_on_pattern is not a valid regular expression`
            : ran.log,
          fix_hint: failed ? hint : "",
        }),
      );
      continue;
    }

    if (check.type === "test-integrity") {
      let diff = "";
      let gitError = "";
      try {
        diff = input.io.diff();
      } catch (error) {
        gitError = error instanceof Error ? error.message : String(error);
      }
      const findings = gitError
        ? [`git diff failed: ${gitError}`]
        : testIntegrityFindings(diff, check.test_path_pattern);
      results.push(
        result({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: findings.length ? "fail" : "pass",
          command: "git diff base...head -- test files",
          exit_code: findings.length ? 1 : 0,
          log: findings.join("\n"),
          fix_hint: findings.length ? hint : "",
        }),
      );
      continue;
    }

    if (check.type === "protected-paths") {
      let names: string[] = [];
      let gitError = "";
      try {
        names = input.io.names();
      } catch (error) {
        gitError = error instanceof Error ? error.message : String(error);
      }
      const hits = gitError ? [] : matchProtected(names, protectedPaths);
      if (hits.length)
        ownerPaths = Array.from(new Set([...ownerPaths, ...hits]));
      const failed = Boolean(gitError) || hits.length > 0;
      results.push(
        result({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: failed ? "fail" : "pass",
          command: "git diff --name-only base...head",
          exit_code: failed ? 1 : 0,
          log: gitError ? `git diff failed: ${gitError}` : hits.join("\n"),
          fix_hint: failed ? hint : "",
        }),
      );
      continue;
    }

    if (check.type === "route-coverage") {
      const headRoutesFile = input.io.read(check.routes_file);
      const headViewsFile = input.io.read(check.view_type_file);
      if (headRoutesFile === null || headViewsFile === null) {
        results.push(
          result({
            gate_id: check.gate_id,
            gate: check.gate,
            area: check.area,
            title: check.title,
            status: "fail",
            command: `read ${check.routes_file} and ${check.view_type_file}`,
            exit_code: 1,
            log: "Route or view-type file is missing in the workspace.",
            fix_hint: hint,
          }),
        );
        continue;
      }
      const head = extractRoutes(headRoutesFile);
      const baseSource = input.io.readBase(check.routes_file);
      const base = baseSource
        ? extractRoutes(baseSource)
        : { paths: [], catchAll: false };
      const headViews = extractViewType(headViewsFile, check.view_type_name);
      const baseViewsSource = input.io.readBase(check.view_type_file);
      const baseViews = baseViewsSource
        ? extractViewType(baseViewsSource, check.view_type_name)
        : [];
      const tests = input.io.walk({
        roots: [check.tests_dir],
        suffixes: check.test_suffixes,
      });
      const testText = tests.map((file) => file.text).join("\n");
      const findings = uncoveredSurfaces({
        headRoutes: head.paths,
        baseRoutes: base.paths,
        headCatchAll: head.catchAll,
        baseCatchAll: base.catchAll,
        headViews,
        baseViews,
        testText,
        routeMarkers: check.route_markers ?? {},
        catchAllMarkers: check.catch_all_markers ?? ["NotFound"],
      });
      results.push(
        result({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: findings.length ? "fail" : "pass",
          command: `route coverage ${check.routes_file}`,
          exit_code: findings.length ? 1 : 0,
          log: findings.join("\n"),
          fix_hint: findings.length ? hint : "",
        }),
      );
      continue;
    }

    if (check.type === "forbidden-text") {
      let pattern: RegExp;
      try {
        pattern = compilePattern(check.pattern);
      } catch {
        results.push(
          result({
            gate_id: check.gate_id,
            gate: check.gate,
            area: check.area,
            title: check.title,
            status: "fail",
            log: "pattern is not a valid regular expression",
            fix_hint: hint,
          }),
        );
        continue;
      }
      const files = input.io.walk({
        roots: check.roots,
        exclude_suffixes: check.exclude_suffixes,
        exclude_dir_names: check.exclude_dir_names ?? [
          "node_modules",
          "dist",
          ".git",
        ],
      });
      const hits = findForbidden(files, pattern);
      results.push(
        result({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: hits.length ? "fail" : "pass",
          command: `scan ${check.roots.join(", ")} for /${check.pattern}/`,
          exit_code: hits.length ? 1 : 0,
          log: hits.join("\n"),
          fix_hint: hits.length ? hint : "",
        }),
      );
      continue;
    }

    const tracked = findTrackedEnv(input.io.lsFiles());
    results.push(
      result({
        gate_id: check.gate_id,
        gate: check.gate,
        area: check.area,
        title: check.title,
        status: tracked.length ? "fail" : "pass",
        command: "git ls-files",
        exit_code: tracked.length ? 1 : 0,
        log: tracked.join("\n"),
        fix_hint: tracked.length ? hint : "",
      }),
    );
  }

  const mappedGates = new Set(input.config.checks.map((check) => check.gate));
  for (const gate of discovery.gates) {
    if (!mappedGates.has(gate.number))
      results.push(unmapped(gate.number, gate.title));
  }
  if (discovery.hard_tests && !mappedGates.has("hard-tests-intact")) {
    results.push(
      result({
        gate_id: "hard-tests-intact",
        gate: "hard-tests-intact",
        area: "tests",
        title: "Do not weaken, skip, or delete a test",
        status: "fail",
        log: "The base rule file contains this hard rule and the config does not map it.",
        fix_hint:
          "Map a test-integrity check on the base branch. Do not delete the rule to get green.",
      }),
    );
  }
  if (discovery.hard_protected && !mappedGates.has("hard-protected-paths")) {
    results.push(
      result({
        gate_id: "hard-protected-paths",
        gate: "hard-protected-paths",
        area: "security",
        title: "Do not edit protected paths",
        status: "fail",
        log: "The base rule file contains this hard rule and the config does not map it.",
        fix_hint: "Map a protected-paths check on the base branch.",
      }),
    );
  }

  for (const item of discovery.items) {
    const answered = lineAnswers(input.prBody, item);
    results.push(
      result({
        gate_id: item.gate_id,
        gate: item.gate_id,
        area: item.kind === "manual" ? "manual" : "na",
        title: item.title,
        status: answered ? "manual" : "fail",
        command: "pr description",
        exit_code: null,
        log: answered
          ? "A description line names this item and says satisfied or N/A."
          : "No matching description line.",
        fix_hint: answered
          ? ""
          : `Add \`${item.gate_id}: satisfied — …\` or \`${item.gate_id}: N/A — …\`.`,
      }),
    );
  }

  let report: Report = {
    version: 1,
    head_sha: input.headSha,
    base_sha: input.baseSha,
    pr_number: input.prNumber,
    needs_owner_review: ownerPaths.length > 0,
    owner_review_paths: ownerPaths,
    protected_paths: protectedPaths,
    summarizer: "off",
    summary: null,
    results,
  };

  if (input.config.summarizer.enabled) {
    report = await applySummarizer(report, input);
  }
  return report;
}

async function applySummarizer(
  report: Report,
  input: EvaluateInput,
): Promise<Report> {
  const locked = report.results.map((item) => item.status);
  if (!input.summaryCommand) {
    return { ...report, summarizer: "ignored", summary: null };
  }
  try {
    const ran = await input.io.command(
      input.summaryCommand,
      30_000,
      JSON.stringify(report),
    );
    if (ran.code !== 0)
      return { ...report, summarizer: "ignored", summary: null };
    const next: Report = {
      ...report,
      summarizer: "appended",
      summary: ran.log.slice(0, 2000),
      results: report.results.map((item) => ({
        ...item,
        evidence: { ...item.evidence },
      })),
    };
    for (let i = 0; i < next.results.length; i++)
      next.results[i].status = locked[i];
    return next;
  } catch {
    return { ...report, summarizer: "ignored", summary: null };
  }
}
