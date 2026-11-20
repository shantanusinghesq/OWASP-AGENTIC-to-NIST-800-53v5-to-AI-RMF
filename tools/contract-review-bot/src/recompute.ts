import type { CheckResult, Config } from "./types.ts";
import { MINIMUM_PROTECTED_PATHS } from "./types.ts";
import {
  compilePattern,
  extractRoutes,
  extractViewType,
  findForbidden,
  findTrackedEnv,
  matchProtected,
  scriptsFromPackageJson,
  testIntegrityFindings,
  toolingFindings,
  uncoveredSurfaces,
} from "./checks.ts";

export interface Snapshot {
  changedFiles: string[];
  diff: string;
  read(rel: string): string | null;
  readBase(rel: string): string | null;
  /** Every path in the head tree. Used for tracked env files. */
  listFiles(): string[];
  filesUnder(opts: {
    roots: string[];
    suffixes?: string[];
    exclude_suffixes?: string[];
  }): { path: string; text: string }[];
}

function structuralResult(partial: {
  gate_id: string;
  gate: string;
  area: CheckResult["area"];
  title: string;
  status: CheckResult["status"];
  command: string;
  log: string;
  fix_hint: string;
}): CheckResult {
  return {
    gate_id: partial.gate_id,
    gate: partial.gate,
    area: partial.area,
    title: partial.title,
    status: partial.status,
    evidence: {
      command: partial.command,
      exit_code: partial.status === "fail" ? 1 : 0,
      log_excerpt: partial.status === "pass" ? "" : partial.log.slice(0, 1200),
    },
    fix_hint: partial.status === "fail" ? partial.fix_hint : "",
  };
}

/**
 * Recompute the checks that do not execute pull-request code.
 * Command exit codes are not produced here. `commandsBound` is true only when
 * protected paths, script bodies, the lockfile, and tool configs are unchanged,
 * which is the condition for trusting the evaluate job's command results.
 */
export function recomputeStructural(
  config: Config,
  snap: Snapshot,
): { results: CheckResult[]; commandsBound: boolean; ownerPaths: string[] } {
  const results: CheckResult[] = [];
  const protectedPaths = Array.from(
    new Set([...MINIMUM_PROTECTED_PATHS, ...config.protected_paths]),
  );
  const protectedHits = matchProtected(snap.changedFiles, protectedPaths);
  let toolingClean = true;
  const ownerPaths = [...protectedHits];

  for (const check of config.checks) {
    const hint = check.fix_hint ?? "";
    if (check.type === "protected-paths") {
      results.push(
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: protectedHits.length ? "fail" : "pass",
          command: "pull request files API",
          log: protectedHits.join("\n"),
          fix_hint: hint,
        }),
      );
      continue;
    }
    if (check.type === "tooling-integrity") {
      const findings = toolingFindings({
        scriptNames: check.script_names,
        baseScripts: scriptsFromPackageJson(snap.readBase(check.package_file)),
        headScripts: scriptsFromPackageJson(snap.read(check.package_file)),
        changedFiles: snap.changedFiles,
      });
      if (findings.length) toolingClean = false;
      for (const file of snap.changedFiles) {
        if (findings.some((line) => line.includes(file))) ownerPaths.push(file);
      }
      if (findings.some((line) => line.startsWith("script ")))
        ownerPaths.push(check.package_file);
      results.push(
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: findings.length ? "fail" : "pass",
          command: `compare ${check.package_file} scripts, lockfiles, and tool configs`,
          log: findings.join("\n"),
          fix_hint: hint,
        }),
      );
      continue;
    }
    if (check.type === "test-integrity") {
      const findings = testIntegrityFindings(
        snap.diff,
        check.test_path_pattern,
      );
      results.push(
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: findings.length ? "fail" : "pass",
          command: "git diff base...head",
          log: findings.join("\n"),
          fix_hint: hint,
        }),
      );
      continue;
    }
    if (check.type === "tracked-env") {
      const tracked = findTrackedEnv(snap.listFiles());
      results.push(
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: tracked.length ? "fail" : "pass",
          command: "git ls-tree head",
          log: tracked.join("\n"),
          fix_hint: hint,
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
          structuralResult({
            gate_id: check.gate_id,
            gate: check.gate,
            area: check.area,
            title: check.title,
            status: "fail",
            command: "forbidden-text",
            log: "pattern is not a valid regular expression",
            fix_hint: hint,
          }),
        );
        continue;
      }
      const hits = findForbidden(
        snap.filesUnder({
          roots: check.roots,
          exclude_suffixes: check.exclude_suffixes,
        }),
        pattern,
      );
      results.push(
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: hits.length ? "fail" : "pass",
          command: `scan ${check.roots.join(", ")}`,
          log: hits.join("\n"),
          fix_hint: hint,
        }),
      );
      continue;
    }
    if (check.type === "route-coverage") {
      const headRoutesFile = snap.read(check.routes_file);
      const headViewsFile = snap.read(check.view_type_file);
      if (headRoutesFile === null || headViewsFile === null) {
        results.push(
          structuralResult({
            gate_id: check.gate_id,
            gate: check.gate,
            area: check.area,
            title: check.title,
            status: "fail",
            command: "route coverage",
            log: "Route or view-type file is missing.",
            fix_hint: hint,
          }),
        );
        continue;
      }
      const head = extractRoutes(headRoutesFile);
      const baseSource = snap.readBase(check.routes_file);
      const base = baseSource
        ? extractRoutes(baseSource)
        : { paths: [], catchAll: false };
      const headViews = extractViewType(headViewsFile, check.view_type_name);
      const baseViewsSource = snap.readBase(check.view_type_file);
      const baseViews = baseViewsSource
        ? extractViewType(baseViewsSource, check.view_type_name)
        : [];
      const testText = snap
        .filesUnder({ roots: [check.tests_dir], suffixes: check.test_suffixes })
        .map((file) => file.text)
        .join("\n");
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
        structuralResult({
          gate_id: check.gate_id,
          gate: check.gate,
          area: check.area,
          title: check.title,
          status: findings.length ? "fail" : "pass",
          command: `route coverage ${check.routes_file}`,
          log: findings.join("\n"),
          fix_hint: hint,
        }),
      );
    }
  }

  const commandsBound = protectedHits.length === 0 && toolingClean;
  return {
    results,
    commandsBound,
    ownerPaths: Array.from(new Set(ownerPaths)),
  };
}
