# Agentic Patterns DB

SQLite packaging of the **agentic AI architecture pattern taxonomy** used by the
Architecture Diagram Analyzer (`client/src/features/diagram/engine/agentic-patterns.ts`). Useful for
querying the 12 patterns and their OWASP ASI risk mappings outside the web app
(scripts, notebooks, CI checks, downstream tools).

This directory is intentionally **not** part of the pnpm workspace — it is a
self-contained npm package with its own lockfile, so its native `better-sqlite3`
dependency never enters the web app's install or CI pipeline. Its checked-in JSON
artifacts (`patterns.json`, `family-boolean.json`) are generated from the
TypeScript source; a drift test in the main suite
(`client/src/features/diagram/engine/db-sync.test.ts`) fails CI if they fall out
of sync, so the npm island stays honest without joining the workspace.

## Files

| File | Purpose |
|---|---|
| `patterns.json` | JSON mirror of `client/src/features/diagram/engine/agentic-patterns.ts` (12 patterns + taxonomy version). Checked in, generated. |
| `family-boolean.json` | JSON mirror of `FAMILY_TO_PRIMARY_BOOLEAN` in `client/src/features/simulator/engine/mappings.ts`. Checked in, generated. |
| `seed.mjs` | Generates `patterns.db` from `patterns.json`. |
| `query.mjs` | CLI for querying the database. |
| `patterns.db` | Generated SQLite file. Gitignored (the repo root `.gitignore` excludes `*.db`) — run the seed to produce it. |

## Setup

```bash
cd db
npm install        # installs better-sqlite3 locally to db/
node seed.mjs      # creates patterns.db
```

## Querying

```bash
node db/query.mjs --all                        # list all 12 patterns
node db/query.mjs --pattern supervisor_worker  # one pattern, full detail + ASI mappings
node db/query.mjs --asi ASI01                  # patterns mapped to an OWASP ASI risk, by weight
node db/query.mjs --family AC                  # patterns whose typical posture leaves a NIST family exposed
```

`--family` resolves the NIST 800-53 family to its governing control boolean
(the same `FAMILY_TO_PRIMARY_BOOLEAN` model as
`client/src/features/simulator/engine/mappings.ts`) and returns the patterns whose
`controlStateDefaults` leave that control absent.

## Schema

```sql
meta          (key TEXT PRIMARY KEY, value TEXT)           -- taxonomy_version, seeded_at
patterns      (id TEXT PRIMARY KEY, name, category, description,
               primary_risk, visual_signatures /* JSON */,
               control_state_defaults /* JSON */)
asi_mappings  (id INTEGER PK AUTOINCREMENT, pattern_id → patterns.id,
               asi_id, weight REAL, rationale)
-- indexes: idx_mappings_pattern(pattern_id), idx_mappings_asi(asi_id)
```

## Keeping patterns.json in sync

`client/src/features/diagram/engine/agentic-patterns.ts` is the source of truth.
After editing it, regenerate the JSON from the repo root and reseed:

```bash
npx tsx -e "import { AGENTIC_PATTERNS, PATTERN_TAXONOMY_VERSION } from './client/src/features/diagram/engine/agentic-patterns'; import { writeFileSync } from 'fs'; writeFileSync('db/patterns.json', JSON.stringify({ taxonomyVersion: PATTERN_TAXONOMY_VERSION, patterns: AGENTIC_PATTERNS }, null, 2) + '\n');"
npx tsx -e "import { FAMILY_TO_PRIMARY_BOOLEAN } from './client/src/features/simulator/engine/mappings'; import { writeFileSync } from 'fs'; writeFileSync('db/family-boolean.json', JSON.stringify(FAMILY_TO_PRIMARY_BOOLEAN, null, 2) + '\n');"
node db/seed.mjs
```

The drift test `client/src/features/diagram/engine/db-sync.test.ts` (part of `pnpm test`)
fails if either JSON falls out of sync with its TypeScript source.
