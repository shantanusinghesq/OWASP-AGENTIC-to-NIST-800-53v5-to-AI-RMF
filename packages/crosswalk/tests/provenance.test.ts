import { describe, expect, it } from "vitest";
import { UPSTREAM_VERSIONS } from "../src";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("upstream provenance", () => {
  it("every layer declares a non-empty edition, source URL, and ISO last-verified date", () => {
    for (const [key, layer] of Object.entries(UPSTREAM_VERSIONS)) {
      expect(layer.framework.length, `${key}.framework`).toBeGreaterThan(0);
      expect(layer.edition.length, `${key}.edition`).toBeGreaterThan(0);
      expect(layer.sourceUrl, `${key}.sourceUrl`).toMatch(/^https:\/\//);
      expect(layer.lastVerified, `${key}.lastVerified`).toMatch(ISO_DATE);
    }
  });
});
