# Agentic Patterns DB

SQLite packaging of the **agentic AI architecture pattern taxonomy** used by the
Architecture Diagram Analyzer (`client/src/features/diagram/engine/agentic-patterns.ts`). Useful for
querying the 12 patterns and their OWASP ASI risk mappings outside the web app
(scripts, notebooks, CI checks, downstream tools).

This directory is intentionally **not** part of the pnpm workspace — it is a
self-contained Node package so the web app's dependency tree stays untouched.

## Files

| File | Purpose |
|---|---|
| `patterns.json` | JSON mirror of `client/src/features/diagram/engine/agentic-patterns.ts` (12 patterns + taxonomy version). Checked in. |
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
node db/seed.mjs
```
