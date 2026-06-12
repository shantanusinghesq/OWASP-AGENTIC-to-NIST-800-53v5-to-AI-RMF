#!/usr/bin/env node
// Query the patterns database.
// Usage:
//   node db/query.mjs --pattern supervisor_worker
//   node db/query.mjs --asi ASI01
//   node db/query.mjs --family AC
//   node db/query.mjs --all

import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(resolve(__dirname, "patterns.db"), { readonly: true });

// Mirrors FAMILY_TO_PRIMARY_BOOLEAN in client/src/lib/scrambler-mappings.ts:
// given a NIST 800-53 family, which control boolean governs it.
const FAMILY_TO_PRIMARY_BOOLEAN = {
  AC: "has_agent_limits",
  AU: "has_monitoring",
  CA: "has_testing",
  CM: "has_dev_controls",
  CP: "has_phased_deployment",
  IA: "has_identity_management",
  IR: "has_monitoring",
  MP: "has_dev_controls",
  PE: "has_dev_controls",
  PL: "has_oversight_design",
  PM: "has_oversight_design",
  RA: "has_testing",
  SA: "has_dev_controls",
  SC: "has_agent_limits",
  SI: "has_monitoring",
  SR: "has_dev_controls",
};

function usage(code = 1) {
  console.log(`Usage:
  node db/query.mjs --pattern <pattern_id>   Show one pattern with its ASI mappings
  node db/query.mjs --asi <ASI_id>           Patterns mapped to an OWASP ASI risk (by weight)
  node db/query.mjs --family <NIST_family>   Patterns whose typical control posture leaves the family exposed
  node db/query.mjs --all                    List all patterns`);
  process.exit(code);
}

function rowToPattern(row) {
  return {
    ...row,
    visual_signatures: JSON.parse(row.visual_signatures),
    control_state_defaults: JSON.parse(row.control_state_defaults),
  };
}

function printPattern(row, mappings) {
  const p = rowToPattern(row);
  console.log(`\n${p.id} — ${p.name} [${p.category}]`);
  console.log(`  ${p.description}`);
  console.log(`  Primary risk: ${p.primary_risk}`);
  console.log(`  Visual signatures:`);
  for (const sig of p.visual_signatures) console.log(`    - ${sig}`);
  console.log(`  Control state defaults:`);
  for (const [key, value] of Object.entries(p.control_state_defaults)) {
    console.log(`    ${value ? "✓" : "✗"} ${key}`);
  }
  if (mappings?.length) {
    console.log(`  ASI mappings:`);
    for (const m of mappings) {
      console.log(`    ${m.asi_id} (weight ${m.weight.toFixed(2)}): ${m.rationale}`);
    }
  }
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

const mode = args[0];
const value = args[1];

switch (mode) {
  case "--pattern": {
    if (!value) usage();
    const row = db.prepare("SELECT * FROM patterns WHERE id = ?").get(value);
    if (!row) {
      console.error(`Pattern not found: ${value}`);
      process.exit(1);
    }
    const mappings = db
      .prepare("SELECT * FROM asi_mappings WHERE pattern_id = ? ORDER BY weight DESC")
      .all(value);
    printPattern(row, mappings);
    break;
  }

  case "--asi": {
    if (!value) usage();
    const rows = db
      .prepare(
        `SELECT p.id, p.name, p.category, m.weight, m.rationale
         FROM asi_mappings m JOIN patterns p ON p.id = m.pattern_id
         WHERE m.asi_id = ? ORDER BY m.weight DESC`
      )
      .all(value.toUpperCase());
    if (rows.length === 0) {
      console.error(`No patterns mapped to ${value}`);
      process.exit(1);
    }
    console.log(`\nPatterns mapped to ${value.toUpperCase()}:`);
    for (const r of rows) {
      console.log(`  ${r.weight.toFixed(2)}  ${r.id} — ${r.name} [${r.category}]`);
      console.log(`        ${r.rationale}`);
    }
    break;
  }

  case "--family": {
    if (!value) usage();
    const family = value.toUpperCase();
    const boolKey = FAMILY_TO_PRIMARY_BOOLEAN[family];
    if (!boolKey) {
      console.error(`Unknown NIST 800-53 family: ${value}`);
      console.error(`Known families: ${Object.keys(FAMILY_TO_PRIMARY_BOOLEAN).join(", ")}`);
      process.exit(1);
    }
    const rows = db.prepare("SELECT * FROM patterns ORDER BY id").all();
    const exposed = rows.map(rowToPattern).filter((p) => !p.control_state_defaults[boolKey]);
    console.log(
      `\n${family} is governed by ${boolKey}. Patterns whose typical posture leaves ${family} exposed:`
    );
    if (exposed.length === 0) {
      console.log("  (none — all patterns typically include this control)");
    }
    for (const p of exposed) {
      console.log(`  ${p.id} — ${p.name}: ${p.primary_risk}`);
    }
    break;
  }

  case "--all": {
    const rows = db.prepare("SELECT * FROM patterns ORDER BY id").all();
    const meta = db.prepare("SELECT value FROM meta WHERE key = 'taxonomy_version'").get();
    console.log(`Pattern taxonomy v${meta?.value ?? "?"} — ${rows.length} patterns:`);
    for (const row of rows) {
      const count = db
        .prepare("SELECT COUNT(*) AS n FROM asi_mappings WHERE pattern_id = ?")
        .get(row.id).n;
      console.log(`  ${row.id.padEnd(22)} ${row.name.padEnd(28)} [${row.category}] ${count} ASI mappings`);
    }
    break;
  }

  case "--help":
  case "-h":
    usage(0);
    break;

  default:
    usage();
}

db.close();
