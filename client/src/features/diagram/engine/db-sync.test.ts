// ─── db/ Derived-Data Drift Guard ───────────────────────────────────
// db/ is a standalone offline SQLite analyst tool (intentionally outside the
// pnpm workspace so its native better-sqlite3 dep never enters the app/CI
// install). Its checked-in JSON artifacts are generated from the TypeScript
// source and must not drift. This test — run by the normal client suite in
// node env, no better-sqlite3 needed — regenerates the expected artifacts and
// asserts equality. Regeneration commands live in db/README.md.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AGENTIC_PATTERNS, PATTERN_TAXONOMY_VERSION } from "./agentic-patterns";
import { FAMILY_TO_PRIMARY_BOOLEAN } from "../../simulator/engine/mappings";

const readJson = (rel: string) => JSON.parse(readFileSync(resolve(process.cwd(), rel), "utf-8"));

describe("db/ derived data", () => {
  it("patterns.json mirrors the pattern taxonomy source", () => {
    const expected = { taxonomyVersion: PATTERN_TAXONOMY_VERSION, patterns: AGENTIC_PATTERNS };
    expect(readJson("db/patterns.json")).toEqual(expected);
  });

  it("family-boolean.json mirrors FAMILY_TO_PRIMARY_BOOLEAN", () => {
    expect(readJson("db/family-boolean.json")).toEqual(FAMILY_TO_PRIMARY_BOOLEAN);
  });
});
