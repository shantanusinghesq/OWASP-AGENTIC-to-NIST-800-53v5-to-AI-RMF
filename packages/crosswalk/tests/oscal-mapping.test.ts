// ─── OSCAL-Aligned Mapping Tests ────────────────────────────────────
// Proves buildOscalMapping() emits one entry per ASI risk, that every 800-53
// control it references resolves to a NON-withdrawn entry in the pinned OSCAL
// Rev 5 catalog, and that the catalog title it carries matches the catalog.
// The builder itself throws on a missing/withdrawn control — these assertions
// pin the guarantee at the artifact boundary.

import { describe, expect, it } from "vitest";
import { CROSSWALK_DATA_VERSION, OSCAL_800_53_REV5, OSCAL_SOURCE, OWASP_ASI, buildOscalMapping } from "../src";

describe("buildOscalMapping", () => {
  it("builds successfully (no missing/withdrawn control throws)", () => {
    expect(() => buildOscalMapping()).not.toThrow();
  });

  it("emits exactly one mapping per ASI risk (10)", () => {
    const mapping = buildOscalMapping();
    expect(mapping.mappings).toHaveLength(OWASP_ASI.length);
    expect(mapping.mappings).toHaveLength(10);
  });

  it("carries the OSCAL-aligned schema note and versioned metadata", () => {
    const mapping = buildOscalMapping();
    expect(mapping["$schema-note"]).toBe("OSCAL-aligned mapping (not a formal OSCAL model)");
    expect(mapping.metadata.version).toBe(CROSSWALK_DATA_VERSION);
    expect(mapping.metadata.oscalCatalog.tag).toBe(OSCAL_SOURCE.tag);
    // Deterministic / clock-free by default: no lastModified unless passed in.
    expect(mapping.metadata.lastModified).toBeUndefined();
  });

  it("uses the caller-supplied lastModified verbatim when provided", () => {
    const mapping = buildOscalMapping("2026-07-11T00:00:00Z");
    expect(mapping.metadata.lastModified).toBe("2026-07-11T00:00:00Z");
  });

  it("every referenced control resolves to a non-withdrawn catalog entry with the catalog title", () => {
    const mapping = buildOscalMapping();
    let controlCount = 0;
    for (const entry of mapping.mappings) {
      for (const control of entry.controls) {
        controlCount++;
        const catalogEntry = OSCAL_800_53_REV5[control.id];
        expect(catalogEntry, `catalog entry for ${control.id}`).toBeDefined();
        expect(catalogEntry.withdrawn, `${control.id} withdrawn`).toBe(false);
        expect(control.withdrawn).toBe(false);
        expect(control.catalogTitle).toBe(catalogEntry.title);
        expect(control.family).toBe(catalogEntry.family);
      }
    }
    // Sanity: the mapping actually carries controls (matches the 89 CSV rows).
    expect(controlCount).toBe(89);
  });
});
