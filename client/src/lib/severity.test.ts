import { describe, expect, it } from "vitest";
import { bySeverity } from "./severity";

describe("bySeverity", () => {
  it("orders Critical → High → Medium-High, ties broken by id", () => {
    const rows = [
      { id: "ASI07", severity: "Medium-High" },
      { id: "ASI02", severity: "High" },
      { id: "ASI08", severity: "Critical" },
      { id: "ASI01", severity: "Critical" },
      { id: "ASI05", severity: "High" },
    ];
    expect(rows.slice().sort(bySeverity).map((r) => r.id)).toEqual([
      "ASI01", // Critical, lower id first
      "ASI08", // Critical
      "ASI02", // High
      "ASI05", // High
      "ASI07", // Medium-High
    ]);
  });

  it("is a stable, total order (unknown severities sink to the end)", () => {
    const rows = [
      { id: "ASI09", severity: "Unknown" },
      { id: "ASI03", severity: "Critical" },
    ];
    expect(rows.slice().sort(bySeverity).map((r) => r.id)).toEqual(["ASI03", "ASI09"]);
  });
});
