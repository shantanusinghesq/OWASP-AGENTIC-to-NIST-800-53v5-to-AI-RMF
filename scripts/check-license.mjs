#!/usr/bin/env node
// Asserts every package.json "license" field matches the SPDX identifier in its
// adjacent LICENSE file. License scanners (FOSSA, Snyk, ORT) read the field, not
// the file — a mismatch misreports the AGPL-app / MIT-data boundary this repo sells.

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// package dir -> expected SPDX license (from its LICENSE file's content)
const targets = [
  { dir: ".", spdx: "AGPL-3.0-only", marker: "GNU AFFERO GENERAL PUBLIC LICENSE" },
  { dir: "packages/crosswalk", spdx: "MIT", marker: "MIT License" },
];

let failed = false;
for (const { dir, spdx, marker } of targets) {
  const pkgPath = resolve(root, dir, "package.json");
  const licPath = resolve(root, dir, "LICENSE");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  if (pkg.license !== spdx) {
    console.error(`✗ ${dir}/package.json license "${pkg.license}" !== expected "${spdx}"`);
    failed = true;
  }
  if (!existsSync(licPath)) {
    console.error(`✗ ${dir}/LICENSE missing`);
    failed = true;
    continue;
  }
  const licText = readFileSync(licPath, "utf-8");
  if (!licText.toUpperCase().includes(marker.toUpperCase())) {
    console.error(`✗ ${dir}/LICENSE content does not look like ${spdx} (missing "${marker}")`);
    failed = true;
  }
  if (!failed) console.log(`✓ ${dir}: ${spdx}`);
}

if (failed) {
  console.error("License metadata check FAILED.");
  process.exit(1);
}
console.log("License metadata consistent.");
