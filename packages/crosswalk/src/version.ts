// ─── Data Version ───────────────────────────────────────────────────
// Single source of truth for the crosswalk data revision. MUST equal the
// version in packages/crosswalk/package.json (pinned by tests/version.test.ts).
// Emitted into dist/crosswalk.json as `dataVersion` so non-TS/non-workspace
// consumers can pin against a known data revision.
export const CROSSWALK_DATA_VERSION = "0.10.0";
