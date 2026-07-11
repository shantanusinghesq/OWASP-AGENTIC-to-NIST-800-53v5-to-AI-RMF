// ─── Data-Version Pin ───────────────────────────────────────────────
// CROSSWALK_DATA_VERSION is the value emitted into dist/crosswalk.json as
// `dataVersion`. It MUST equal the package.json version so external consumers
// can pin the data revision by the same semver they install.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CROSSWALK_DATA_VERSION } from "../src";

describe("CROSSWALK_DATA_VERSION", () => {
  it("equals the version in package.json", () => {
    const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
    expect(CROSSWALK_DATA_VERSION).toBe(pkg.version);
  });
});
