#!/usr/bin/env node
// Generates patterns.db from the pattern taxonomy.
//
// patterns.json is the JSON mirror of client/src/features/diagram/engine/agentic-patterns.ts
// (the TypeScript file is the source of truth; regenerate the JSON with:
//   npx tsx -e "import { AGENTIC_PATTERNS, PATTERN_TAXONOMY_VERSION } from './client/src/features/diagram/engine/agentic-patterns'; import { writeFileSync } from 'fs'; writeFileSync('db/patterns.json', JSON.stringify({ taxonomyVersion: PATTERN_TAXONOMY_VERSION, patterns: AGENTIC_PATTERNS }, null, 2) + '\n');"
// from the repo root).
//
// Run: node db/seed.mjs   (after `npm install` inside db/)

import Database from "better-sqlite3";
import { readFileSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PATTERNS_JSON_PATH = resolve(__dirname, "patterns.json");
const DB_PATH = resolve(__dirname, "patterns.db");

const { taxonomyVersion, patterns } = JSON.parse(readFileSync(PATTERNS_JSON_PATH, "utf-8"));

// Rebuild from scratch so reseeding is idempotent.
rmSync(DB_PATH, { force: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patterns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    primary_risk TEXT NOT NULL,
    visual_signatures TEXT NOT NULL,
    control_state_defaults TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS asi_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_id TEXT NOT NULL REFERENCES patterns(id),
    asi_id TEXT NOT NULL,
    weight REAL NOT NULL,
    rationale TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_mappings_pattern ON asi_mappings(pattern_id);
  CREATE INDEX IF NOT EXISTS idx_mappings_asi ON asi_mappings(asi_id);
`);

const insertMeta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");
const insertPattern = db.prepare(`
  INSERT INTO patterns (id, name, category, description, primary_risk, visual_signatures, control_state_defaults)
  VALUES (@id, @name, @category, @description, @primary_risk, @visual_signatures, @control_state_defaults)
`);
const insertMapping = db.prepare(`
  INSERT INTO asi_mappings (pattern_id, asi_id, weight, rationale)
  VALUES (@pattern_id, @asi_id, @weight, @rationale)
`);

const seed = db.transaction(() => {
  insertMeta.run("taxonomy_version", taxonomyVersion);
  insertMeta.run("seeded_at", new Date().toISOString());

  for (const p of patterns) {
    insertPattern.run({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      primary_risk: p.primaryRisk,
      visual_signatures: JSON.stringify(p.visualSignatures),
      control_state_defaults: JSON.stringify(p.controlStateDefaults),
    });
    for (const m of p.asiMappings) {
      insertMapping.run({
        pattern_id: p.id,
        asi_id: m.asiId,
        weight: m.weight,
        rationale: m.rationale,
      });
    }
  }
});

seed();

const patternCount = db.prepare("SELECT COUNT(*) AS n FROM patterns").get().n;
const mappingCount = db.prepare("SELECT COUNT(*) AS n FROM asi_mappings").get().n;
db.close();

console.log(`Seeded ${DB_PATH}`);
console.log(`  taxonomy version: ${taxonomyVersion}`);
console.log(`  patterns:         ${patternCount}`);
console.log(`  asi_mappings:     ${mappingCount}`);
