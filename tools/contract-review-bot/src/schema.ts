import { statSync, readFileSync } from "node:fs";
import type {
  Area,
  CheckResult,
  Report,
  Status,
  SummarizerState,
} from "./types.ts";

/** Results artifact cap. Stat the file and refuse anything larger before reading. */
export const MAX_ARTIFACT_BYTES = 1_000_000;

const STATUSES: readonly Status[] = ["pass", "fail", "skip", "manual"];
const AREAS: readonly Area[] = [
  "lint",
  "tests",
  "security",
  "manual",
  "na",
  "unmapped",
];
const SUMMARIZERS: readonly SummarizerState[] = ["off", "appended", "ignored"];

export interface ResultSchema {
  required?: string[];
  properties?: {
    results?: { items?: { required?: string[] } };
  };
}

export function readTextCapped(
  file: string,
  maxBytes = MAX_ARTIFACT_BYTES,
): string {
  const info = statSync(file);
  if (!info.isFile()) throw new Error("results path is not a file");
  if (info.size > maxBytes) {
    throw new Error(`results file is ${info.size} bytes; cap is ${maxBytes}`);
  }
  return readFileSync(file, "utf8");
}

/**
 * A safe pull-request number. `1e21` parses as a number and `Number.isInteger` is true,
 * but it is not a safe integer and must not be written into a shell URL.
 */
export function parsePrNumber(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 1_000_000_000
  ) {
    throw new Error("pr_number must be a safe positive integer");
  }
  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function needString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];
  if (typeof value !== "string")
    throw new Error(`results.${key} must be a string`);
  return value;
}

/**
 * Hand-written check of `result.schema.json`. `schema.required` is enforced from the file
 * the caller loads, so the schema is not decorative.
 */
export function validateReport(value: unknown, schema?: ResultSchema): Report {
  if (!isObject(value)) throw new Error("results must be a JSON object");
  const required = schema?.required ?? [
    "version",
    "head_sha",
    "base_sha",
    "pr_number",
    "needs_owner_review",
    "owner_review_paths",
    "protected_paths",
    "summarizer",
    "summary",
    "results",
  ];
  for (const key of required) {
    if (!(key in value)) throw new Error(`results missing ${key}`);
  }
  if (value.version !== 1) throw new Error("results.version must be 1");
  const head = needString(value, "head_sha");
  const base = needString(value, "base_sha");
  if (!/^[0-9a-f]{40}$/.test(head) || !/^[0-9a-f]{40}$/.test(base)) {
    throw new Error("results head_sha and base_sha must be 40 hex characters");
  }
  if (value.pr_number !== null) parsePrNumber(value.pr_number);
  if (typeof value.needs_owner_review !== "boolean") {
    throw new Error("results.needs_owner_review must be a boolean");
  }
  if (
    !Array.isArray(value.owner_review_paths) ||
    !Array.isArray(value.protected_paths)
  ) {
    throw new Error("results path lists must be arrays");
  }
  if (!value.owner_review_paths.every((item) => typeof item === "string")) {
    throw new Error("results.owner_review_paths must be strings");
  }
  if (!value.protected_paths.every((item) => typeof item === "string")) {
    throw new Error("results.protected_paths must be strings");
  }
  if (!SUMMARIZERS.includes(value.summarizer as SummarizerState)) {
    throw new Error("results.summarizer is not a known value");
  }
  if (value.summary !== null && typeof value.summary !== "string") {
    throw new Error("results.summary must be a string or null");
  }
  if (!Array.isArray(value.results))
    throw new Error("results.results must be an array");
  const itemRequired = schema?.properties?.results?.items?.required ?? [
    "gate_id",
    "gate",
    "area",
    "title",
    "status",
    "evidence",
    "fix_hint",
  ];
  const results: CheckResult[] = value.results.map((item, index) => {
    if (!isObject(item))
      throw new Error(`results.results[${index}] must be an object`);
    for (const key of itemRequired) {
      if (!(key in item))
        throw new Error(`results.results[${index}] missing ${key}`);
    }
    if (!AREAS.includes(item.area as Area)) {
      throw new Error(`results.results[${index}].area is not a known value`);
    }
    if (!STATUSES.includes(item.status as Status)) {
      throw new Error(`results.results[${index}].status is not a known value`);
    }
    if (!isObject(item.evidence)) {
      throw new Error(`results.results[${index}].evidence must be an object`);
    }
    const command = item.evidence.command;
    const exitCode = item.evidence.exit_code;
    if (command !== null && typeof command !== "string") {
      throw new Error(
        `results.results[${index}].evidence.command must be a string or null`,
      );
    }
    if (
      exitCode !== null &&
      (typeof exitCode !== "number" || !Number.isInteger(exitCode))
    ) {
      throw new Error(
        `results.results[${index}].evidence.exit_code must be an integer or null`,
      );
    }
    if (typeof item.evidence.log_excerpt !== "string") {
      throw new Error(
        `results.results[${index}].evidence.log_excerpt must be a string`,
      );
    }
    return {
      gate_id: needString(item, "gate_id"),
      gate: needString(item, "gate"),
      area: item.area as Area,
      title: needString(item, "title"),
      status: item.status as Status,
      evidence: {
        command,
        exit_code: exitCode,
        log_excerpt: item.evidence.log_excerpt,
      },
      fix_hint: needString(item, "fix_hint"),
    };
  });
  return {
    version: 1,
    head_sha: head,
    base_sha: base,
    pr_number: value.pr_number === null ? null : parsePrNumber(value.pr_number),
    needs_owner_review: value.needs_owner_review,
    owner_review_paths: value.owner_review_paths as string[],
    protected_paths: value.protected_paths as string[],
    summarizer: value.summarizer as SummarizerState,
    summary: value.summary as string | null,
    results,
  };
}
