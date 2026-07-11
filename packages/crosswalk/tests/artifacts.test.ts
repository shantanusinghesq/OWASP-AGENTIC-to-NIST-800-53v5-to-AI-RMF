// ─── Artifact Emitter Tests ─────────────────────────────────────────
// Exercises the PURE emit functions (buildJson / buildCsv) so the assertions
// hold without the build having run, plus a write-and-read-back pass over
// writeArtifacts to prove the on-disk files match the pure output.

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  CROSSWALK,
  CROSSWALK_DATA_VERSION,
  CSV_HEADER,
  OWASP_ASI,
  buildCsv,
  buildJson,
  serializeJson,
} from "../src";
import { writeArtifacts } from "../build/emit-artifacts";

/** Quote-aware single-line CSV parser (fields never contain newlines here). */
function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

const EXPECTED_ROWS = Object.values(CROSSWALK).reduce(
  (sum, entry) => sum + entry.nist53.reduce((s, m) => s + m.controls.length, 0),
  0,
);

describe("crosswalk.json", () => {
  it("round-trips losslessly against the TS constants", () => {
    const parsed = JSON.parse(JSON.stringify(buildJson()));
    expect(parsed.owaspAsi).toEqual(OWASP_ASI);
    expect(parsed.crosswalk).toEqual(CROSSWALK);
  });

  it("carries dataVersion matching CROSSWALK_DATA_VERSION", () => {
    expect(buildJson().dataVersion).toBe(CROSSWALK_DATA_VERSION);
  });
});

describe("crosswalk.csv", () => {
  const csv = buildCsv();
  const lines = csv.replace(/\n$/, "").split("\n");

  it("has the spec header in the documented column order", () => {
    expect(lines[0]).toBe(
      "asiId,asiName,severity,family,familyName,controlId,controlTitle,rationale,evidence",
    );
    expect(lines[0]).toBe(CSV_HEADER.join(","));
  });

  it("has exactly 89 data rows — one per (ASI, family, control) mapping (no aggregation)", () => {
    expect(EXPECTED_ROWS).toBe(89);
    expect(lines.length - 1).toBe(89);
    expect(lines.length - 1).toBe(EXPECTED_ROWS);
  });

  it("every data row parses to exactly 9 fields (quoting is correct throughout)", () => {
    for (let i = 1; i < lines.length; i++) {
      expect(parseCsvRow(lines[i]), `row ${i}: ${lines[i]}`).toHaveLength(9);
    }
  });

  it("quotes a field containing a comma and preserves its value", () => {
    const commaRationale =
      "Per-tool least-privilege profiles (scopes, rate limits, egress allowlists) map directly to AC-3/6. Policy enforcement middleware is a reference monitor (AC-25).";
    const row = lines.find((l) => l.includes("Per-tool least-privilege"));
    expect(row, "expected the ASI02 AC rationale row").toBeDefined();
    // Raw text is wrapped in quotes...
    expect(row).toContain(`"${commaRationale}"`);
    // ...and decodes back to the exact original value.
    expect(parseCsvRow(row!)[7]).toBe(commaRationale);
  });

  it("first data row maps ASI01 → AC-3 with the expected columns", () => {
    expect(parseCsvRow(lines[1]).slice(0, 7)).toEqual([
      "ASI01",
      "Agent Goal Hijack",
      "Critical",
      "AC",
      "Access Control",
      "AC-3",
      "Access Enforcement",
    ]);
  });
});

describe("writeArtifacts", () => {
  const outDir = mkdtempSync(join(tmpdir(), "crosswalk-artifacts-"));
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it("writes files whose contents equal the pure emit functions", () => {
    const { json, csv } = writeArtifacts(outDir);
    expect(readFileSync(csv, "utf8")).toBe(buildCsv());
    expect(readFileSync(json, "utf8")).toBe(serializeJson());

    const parsed = JSON.parse(readFileSync(json, "utf8"));
    expect(parsed.crosswalk).toEqual(CROSSWALK);
    expect(readFileSync(json, "utf8").endsWith("\n")).toBe(true);
  });
});
