// ─── Adapter Resolver Test ──────────────────────────────────────────
// Locks the framework-scoped description lookup. The MP-* ID space is
// legitimately owned by BOTH frameworks (800-53 Media Protection vs AI-RMF
// MAP categories), which is why a fallback chain can never be correct and
// the resolver takes an explicit framework discriminator.

import { describe, expect, it } from "vitest";
import { getControlDescription } from "./crosswalk";

describe("getControlDescription", () => {
  it("resolves MP-* per framework — the collision that broke tooltips", () => {
    const aiRmf = getControlDescription("aiRmf", "MP-1");
    expect(aiRmf?.title).toContain("Context Establishment");

    const nist = getControlDescription("nist", "MP-1");
    expect(nist?.title).toContain("Media Protection");
  });

  it("resolves MS-* categories (previously dead data — no tooltip rendered)", () => {
    expect(getControlDescription("aiRmf", "MS-1")).toBeDefined();
    expect(getControlDescription("aiRmf", "MS-2")).toBeDefined();
  });

  it("never falls back across frameworks", () => {
    // GV-* exists only in AI-RMF; AC-* only in 800-53.
    expect(getControlDescription("nist", "GV-1")).toBeUndefined();
    expect(getControlDescription("aiRmf", "AC-3")).toBeUndefined();
  });
});
