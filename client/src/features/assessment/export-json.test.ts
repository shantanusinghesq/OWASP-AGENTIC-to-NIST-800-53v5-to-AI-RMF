// ─── Assessment export/import + stale-ref pruning ───────────────────

import { describe, expect, it } from "vitest";
import { CROSSWALK_DATA_VERSION, UPSTREAM_VERSIONS } from "@/data/crosswalk";
import { buildAssessmentExport, parseAssessmentImport } from "./export-json";
import { pruneStale } from "./storage";
import { mappingKey, type Assessment } from "./types";

const fixture = (): Assessment => ({
  id: "export-test-id",
  name: "Q3 agent rollout",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
  dataVersion: CROSSWALK_DATA_VERSION,
  selections: [
    { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" },
    { asiId: "ASI01", framework: "aiRmf", familyOrFunc: "GOVERN" },
  ],
  annotations: {
    "ASI01|nist|AC": { owner: "SecOps", raciRole: "R", statusOverride: "concur", note: "check" },
  },
});

describe("buildAssessmentExport / parseAssessmentImport", () => {
  it("roundtrips: export → stringify → parse yields the same assessment", () => {
    const assessment = fixture();
    const envelope = buildAssessmentExport(assessment, "2026-03-01T00:00:00.000Z");

    expect(envelope.kind).toBe("agentic-crosswalk-assessment");
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.dataVersion).toBe(CROSSWALK_DATA_VERSION);
    expect(envelope.upstreamVersions).toEqual(UPSTREAM_VERSIONS);
    expect(envelope.exportedAt).toBe("2026-03-01T00:00:00.000Z");

    const parsed = parseAssessmentImport(JSON.stringify(envelope));
    expect(parsed).toEqual(assessment);
  });

  it("omits exportedAt when not supplied (deterministic envelope)", () => {
    const envelope = buildAssessmentExport(fixture());
    expect("exportedAt" in envelope).toBe(false);
  });

  it("throws on the wrong kind, wrong schemaVersion, and non-JSON", () => {
    const good = buildAssessmentExport(fixture());
    expect(() =>
      parseAssessmentImport(JSON.stringify({ ...good, kind: "something-else" })),
    ).toThrow(/kind/);
    expect(() =>
      parseAssessmentImport(JSON.stringify({ ...good, schemaVersion: 2 })),
    ).toThrow(/schemaVersion/);
    expect(() => parseAssessmentImport("not json {")).toThrow(/JSON/);
    expect(() => parseAssessmentImport(JSON.stringify({ ...good, assessment: 42 }))).toThrow(
      /Malformed/,
    );
  });
});

describe("pruneStale", () => {
  it("drops refs that no longer resolve (unknown ASI or family/func) and their annotations", () => {
    const base = fixture();
    const badAsi = { asiId: "ASI99", framework: "nist" as const, familyOrFunc: "AC" };
    const badFamily = { asiId: "ASI01", framework: "nist" as const, familyOrFunc: "ZZ" };
    const withStale: Assessment = {
      ...base,
      selections: [...base.selections, badAsi, badFamily],
      annotations: {
        ...base.annotations,
        [mappingKey(badAsi)]: { owner: "ghost", raciRole: null, statusOverride: null, note: "" },
        [mappingKey(badFamily)]: { owner: "ghost", raciRole: null, statusOverride: null, note: "" },
      },
    };

    const { assessment, droppedCount } = pruneStale(withStale);
    expect(droppedCount).toBe(2);
    expect(assessment.selections).toEqual(base.selections);
    expect(Object.keys(assessment.annotations)).toEqual(["ASI01|nist|AC"]);
  });

  it("returns the assessment unchanged (same reference) when nothing is stale", () => {
    const base = fixture();
    const { assessment, droppedCount } = pruneStale(base);
    expect(droppedCount).toBe(0);
    expect(assessment).toBe(base);
  });
});
