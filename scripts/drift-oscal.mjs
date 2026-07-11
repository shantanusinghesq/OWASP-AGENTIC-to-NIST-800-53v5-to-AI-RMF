#!/usr/bin/env node
// Non-blocking upstream drift watch. Fetches the LATEST usnistgov/oscal-content
// release catalog, builds a slim index the same way scripts/refresh-oscal.mjs
// does, and diffs it against the checked-in vendored index. Reports added,
// removed, newly-withdrawn, and retitled controls. Never mutates repo data and
// never fails (exit 0) — it prints a report for a human/issue to act on.
//
//   node scripts/drift-oscal.mjs        (local parity with the scheduled CI job)

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Load the vendored index by importing the generated module's data via a light parse.
const vendoredTs = readFileSync(resolve(root, "packages/crosswalk/src/oscal-index.ts"), "utf-8");
const pinnedTag = vendoredTs.match(/tag:\s*"([^"]+)"/)?.[1] ?? "unknown";
const vendored = {};
for (const m of vendoredTs.matchAll(/^\s*"([A-Z]{2}-\d+)":\s*\{ title: (".*?"), family: ".*?", withdrawn: (true|false) \},$/gm)) {
  vendored[m[1]] = { title: JSON.parse(m[2]), withdrawn: m[3] === "true" };
}

const latestTag = process.env.LATEST_TAG || "main";
const url = `https://raw.githubusercontent.com/usnistgov/oscal-content/${latestTag}/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json`;
const labelOf = (c) => (c.props || []).find((x) => x.name === "label" && !x.class)?.value ?? c.id.toUpperCase();
const isWithdrawn = (c) => (c.props || []).some((p) => p.name === "status" && p.value === "withdrawn");

const res = await fetch(url);
if (!res.ok) {
  console.log(`Could not fetch latest catalog (${latestTag}): HTTP ${res.status}. No drift report.`);
  process.exit(0);
}
const catalog = (await res.json()).catalog;
const latest = {};
for (const g of catalog.groups) for (const c of g.controls || []) latest[labelOf(c)] = { title: c.title, withdrawn: isWithdrawn(c) };

const added = [], removed = [], newlyWithdrawn = [], retitled = [];
for (const id of Object.keys(latest)) if (!vendored[id]) added.push(id);
for (const id of Object.keys(vendored)) {
  const l = latest[id];
  if (!l) { removed.push(id); continue; }
  if (l.withdrawn && !vendored[id].withdrawn) newlyWithdrawn.push(id);
  if (l.title !== vendored[id].title) retitled.push(`${id}: "${vendored[id].title}" -> "${l.title}"`);
}

const clean = !added.length && !removed.length && !newlyWithdrawn.length && !retitled.length;
console.log(`# OSCAL upstream drift — vendored ${pinnedTag} vs latest (${latestTag})\n`);
if (clean) {
  console.log("No drift: the vendored index matches the latest catalog for all base controls.");
} else {
  const section = (name, arr) => arr.length && console.log(`## ${name} (${arr.length})\n${arr.map((x) => `- ${x}`).join("\n")}\n`);
  section("Added base controls", added);
  section("Removed base controls", removed);
  section("Newly withdrawn", newlyWithdrawn);
  section("Retitled", retitled);
  console.log(`\nTo adopt: bump OSCAL_TAG in scripts/refresh-oscal.mjs, run \`pnpm refresh:oscal\`, review the diff.`);
}
process.exit(0);
