// ─── Incident Register Tests ────────────────────────────────────────
// The register is a derived projection of CROSSWALK evidence — these tests pin
// its shape and prove it never drifts from the source of truth.

import { describe, expect, it } from "vitest";
import { CROSSWALK, INCIDENT_REGISTER, OWASP_ASI, buildRegisterReport } from "../src";

const ASI_IDS = new Set(OWASP_ASI.map((r) => r.id));

// Ground-truth count derived from the data (41 at time of writing: the
// original 33 plus 8 public primary sources added 2026-11-19), asserted
// against the hard-pinned expectation so a stray evidence add/remove is caught.
const DERIVED_TOTAL = Object.values(CROSSWALK).reduce((n, e) => n + e.evidence.length, 0);

describe("incident register", () => {
  it("has exactly 41 entries (one per evidence item), matching the derived total", () => {
    expect(DERIVED_TOTAL).toBe(41);
    expect(INCIDENT_REGISTER).toHaveLength(41);
    expect(INCIDENT_REGISTER.length).toBe(DERIVED_TOTAL);
  });

  it("every entry maps to a real OWASP ASI and carries a title + dateVerified", () => {
    const bad: string[] = [];
    for (const rec of INCIDENT_REGISTER) {
      if (!ASI_IDS.has(rec.asiId)) bad.push(`unknown asiId ${rec.asiId}`);
      if (rec.title.trim().length === 0) bad.push(`${rec.asiId}: empty title`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.dateVerified)) bad.push(`${rec.asiId}: bad dateVerified ${rec.dateVerified}`);
    }
    expect(bad, bad.join("; ")).toEqual([]);
  });

  it("buildRegisterReport totals reconcile and asisWithNoIncident is empty", () => {
    const report = buildRegisterReport();
    expect(report.totalIncidents).toBe(41);
    expect(report.byType.incident + report.byType.research + report.byType.guidance).toBe(41);
    // Register-relative: every ASI carries >=1 evidence item post-WS7 backfill.
    expect(report.asisWithNoIncident).toEqual([]);
  });
});
