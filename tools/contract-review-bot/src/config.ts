import type { Check, Config, ManualOverride } from "./types.ts";

const AREAS = new Set(["lint", "tests", "security"]);
const TYPES = new Set([
  "command",
  "test-integrity",
  "protected-paths",
  "route-coverage",
  "forbidden-text",
  "tracked-env",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function needString(
  obj: Record<string, unknown>,
  key: string,
  where: string,
): string {
  const value = obj[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where}: "${key}" must be a non-empty string`);
  }
  return value;
}

function optionalString(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = obj[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`"${key}" must be a string`);
  return value;
}

function stringList(value: unknown, where: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${where} must be an array of strings`);
  }
  return value;
}

function parseOverride(value: unknown, where: string): ManualOverride {
  if (!isObject(value)) throw new Error(`${where} must be an object`);
  return {
    title_includes: needString(value, "title_includes", where),
    gate_id: needString(value, "gate_id", where),
    anchors: stringList(value.anchors, `${where}.anchors`),
  };
}

function parseCheck(value: unknown, index: number): Check {
  if (!isObject(value)) throw new Error(`checks[${index}] must be an object`);
  const where = `checks[${index}]`;
  const type = needString(value, "type", where);
  if (!TYPES.has(type)) throw new Error(`${where}: unknown type "${type}"`);
  const area = needString(value, "area", where);
  if (!AREAS.has(area))
    throw new Error(`${where}: area must be lint, tests, or security`);
  const base = {
    gate_id: needString(value, "gate_id", where),
    gate: needString(value, "gate", where),
    area: area as Check["area"],
    title: needString(value, "title", where),
    fix_hint: optionalString(value, "fix_hint"),
  };
  if (type === "command") {
    const timeout = value.timeout_ms;
    if (
      timeout !== undefined &&
      (typeof timeout !== "number" || timeout <= 0)
    ) {
      throw new Error(`${where}: timeout_ms must be a positive number`);
    }
    const codes = value.success_exit_codes;
    if (
      codes !== undefined &&
      (!Array.isArray(codes) || codes.some((code) => typeof code !== "number"))
    ) {
      throw new Error(
        `${where}: success_exit_codes must be an array of numbers`,
      );
    }
    return {
      ...base,
      type: "command",
      command: needString(value, "command", where),
      fail_on_pattern: optionalString(value, "fail_on_pattern"),
      success_exit_codes: codes as number[] | undefined,
      when_package_script: optionalString(value, "when_package_script"),
      skip_reason: optionalString(value, "skip_reason"),
      timeout_ms: timeout as number | undefined,
    };
  }
  if (type === "test-integrity") {
    return {
      ...base,
      type,
      test_path_pattern: needString(value, "test_path_pattern", where),
    };
  }
  if (type === "route-coverage") {
    const markers = value.route_markers;
    if (markers !== undefined && !isObject(markers)) {
      throw new Error(`${where}: route_markers must be an object`);
    }
    const routeMarkers: Record<string, string[]> = {};
    if (markers && isObject(markers)) {
      for (const [key, marker] of Object.entries(markers)) {
        routeMarkers[key] = stringList(marker, `${where}.route_markers.${key}`);
      }
    }
    return {
      ...base,
      type,
      routes_file: needString(value, "routes_file", where),
      view_type_file: needString(value, "view_type_file", where),
      view_type_name: needString(value, "view_type_name", where),
      tests_dir: needString(value, "tests_dir", where),
      test_suffixes: stringList(value.test_suffixes, `${where}.test_suffixes`),
      route_markers: routeMarkers,
      catch_all_markers: value.catch_all_markers
        ? stringList(value.catch_all_markers, `${where}.catch_all_markers`)
        : undefined,
    };
  }
  if (type === "forbidden-text") {
    return {
      ...base,
      type,
      roots: stringList(value.roots, `${where}.roots`),
      pattern: needString(value, "pattern", where),
      exclude_suffixes: value.exclude_suffixes
        ? stringList(value.exclude_suffixes, `${where}.exclude_suffixes`)
        : undefined,
      exclude_dir_names: value.exclude_dir_names
        ? stringList(value.exclude_dir_names, `${where}.exclude_dir_names`)
        : undefined,
    };
  }
  if (type === "protected-paths") return { ...base, type };
  return { ...base, type: "tracked-env" };
}

/** Parse and validate a config object. Throws on any shape the runner cannot trust. */
export function parseConfig(value: unknown): Config {
  if (!isObject(value)) throw new Error("config must be a JSON object");
  if (value.version !== 1) throw new Error('config "version" must be 1');
  if (!isObject(value.rules)) throw new Error("config.rules must be an object");
  if (
    !isObject(value.summarizer) ||
    typeof value.summarizer.enabled !== "boolean"
  ) {
    throw new Error("config.summarizer.enabled must be a boolean");
  }
  if (!Array.isArray(value.checks) || value.checks.length === 0) {
    throw new Error("config.checks must be a non-empty array");
  }
  const checks = value.checks.map((check, index) => parseCheck(check, index));
  const ids = checks.map((check) => check.gate_id);
  const dup = ids.find((id, index) => ids.indexOf(id) !== index);
  if (dup) throw new Error(`duplicate gate_id "${dup}"`);
  return {
    version: 1,
    rules: {
      gates: needString(value.rules, "gates", "rules"),
      constraints: needString(value.rules, "constraints", "rules"),
    },
    protected_paths: stringList(value.protected_paths, "protected_paths"),
    summarizer: { enabled: value.summarizer.enabled },
    manual: Array.isArray(value.manual)
      ? value.manual.map((item, i) => parseOverride(item, `manual[${i}]`))
      : [],
    na: Array.isArray(value.na)
      ? value.na.map((item, i) => parseOverride(item, `na[${i}]`))
      : [],
    checks,
  };
}
