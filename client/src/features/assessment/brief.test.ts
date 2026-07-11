// ─── Committee brief builder (node) ─────────────────────────────────
// buildBriefHtml is pure (no React, no DOM, no clock) — assert the document
// carries provenance + version pins, real evidence, validation labels, the
// print toolbar, and — critically — that annotation free-text is entity-
// encoded (the brief window is same-origin; a raw <script> would execute).

import { describe, expect, it } from "vitest";
import { CROSSWALK, CROSSWALK_DATA_VERSION, UPSTREAM_VERSIONS } from "@/data/crosswalk";
import { buildBriefHtml, buildSingleRiskAssessment, esc } from "./brief";
import { mappingKey, type Assessment, type MappingRef } from "./types";

const AC_REF: MappingRef = { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" };
const GOV_REF: MappingRef = { asiId: "ASI01", framework: "aiRmf", familyOrFunc: "GOVERN" };

const fixture: Assessment = {
  id: "test-fixture",
  name: "Q3 agent rollout review",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
  dataVersion: CROSSWALK_DATA_VERSION,
  selections: [AC_REF, GOV_REF],
  annotations: {
    [mappingKey(AC_REF)]: {
      owner: "SecOps <Lead>",
      raciRole: "R",
      statusOverride: "concur",
      note: "<script>alert(1)</script>",
    },
  },
};

describe("buildBriefHtml", () => {
  const html = buildBriefHtml(fixture, { generatedAt: "2026-07-11T12:00:00.000Z" });

  it("pins all three upstream framework layers and the crosswalk data version", () => {
    for (const layer of Object.values(UPSTREAM_VERSIONS)) {
      expect(html).toContain(layer.framework);
    }
    expect(html).toContain(CROSSWALK_DATA_VERSION);
    expect(html).toContain("2026-07-11T12:00:00.000Z");
  });

  it("renders only the selected mappings, with rationale and validation label", () => {
    const acMapping = CROSSWALK.ASI01.nist53.find((m) => m.family === "AC");
    const siMapping = CROSSWALK.ASI01.nist53.find((m) => m.family === "SI");
    expect(acMapping && siMapping).toBeTruthy();
    expect(html).toContain("AC — Access Control");
    expect(html).toContain(esc(acMapping!.rationale));
    // SI was NOT selected — its rationale must not leak into the brief.
    expect(html).not.toContain(esc(siMapping!.rationale));
    expect(html).toContain("Validation status: Editorial");
  });

  it("cites the ASI's real-world evidence including a real CVE id", () => {
    const cve = CROSSWALK.ASI01.evidence.find((e) => e.cveId)?.cveId;
    expect(cve).toBeTruthy();
    expect(html).toContain(cve!);
  });

  it("escapes annotation free-text — <script> in a note must never survive raw", () => {
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("SecOps &lt;Lead&gt;");
    expect(html).not.toContain("SecOps <Lead>");
    expect(html).toContain("R (Responsible)");
    expect(html).toContain("Concur");
  });

  it("ships a print toolbar wired to window.print()", () => {
    expect(html).toContain("window.print()");
    expect(html).toContain("@page");
    expect(html).toContain("<!doctype html>");
  });
});

describe("buildSingleRiskAssessment", () => {
  it("selects every nist53 family and aiRmf function for the ASI, provider-free", () => {
    const eph = buildSingleRiskAssessment("ASI01", "2026-07-11T12:00:00.000Z");
    const entry = CROSSWALK.ASI01;
    expect(eph.name).toBe("ASI01 risk brief");
    expect(eph.selections).toHaveLength(entry.nist53.length + entry.aiRmf.length);
    expect(eph.dataVersion).toBe(CROSSWALK_DATA_VERSION);
    // The resulting brief contains BOTH frameworks' sections.
    const html = buildBriefHtml(eph, { generatedAt: "2026-07-11T12:00:00.000Z" });
    expect(html).toContain("NIST SP 800-53 Rev 5 controls");
    expect(html).toContain("NIST AI RMF 100-1 categories");
  });

  it("returns an empty selection for an unknown ASI id", () => {
    expect(buildSingleRiskAssessment("ASI99", "2026-07-11T12:00:00.000Z").selections).toEqual([]);
  });
});
