import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseConfig } from "../src/config.ts";
import type { Config } from "../src/types.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

export const GATES = `# Quality gates

## Hard rules

- Never weaken, skip, or delete a gate, test, or check to get green.
- Never edit \`.github/\`, workflows, CODEOWNERS, branch protection, or repo settings.
- Open PRs. Never merge.

## Gate 1 — Build passes with zero warnings

body

## Gate 2 — Every route and \`?tab=\` view has a test

## Gate 3 — WCAG 2.2 AA before merge

## Gate 4 — Dependencies and secrets

## Gate 5 — No stack traces in the UI

## Gate 6 — Bundle budget
`;

export const CONSTRAINTS = `# Agent constraints

## Load time and LCP \`[manual]\`

Target Lighthouse.

## Authentication and authorization

**N/A today.** No accounts.

## Observability

**N/A today.** No analytics.

## Schema validation, migrations, backup \`[manual]\`

## Environment parity \`[manual]\`

## Feature flags \`[manual]\`

## Rollback \`[manual]\`

## Code review \`[manual]\`

## Definition of done

Not a separate checklist item.

## Incident accountability \`[manual]\`

## Design system \`[manual]\`

## Empty and error states \`[manual]\`

## Responsive behavior \`[manual]\`

## Internationalization

**N/A today.** English only.

## Legal \`[manual]\`
`;

export function exampleConfig(): Config {
  const file = path.resolve(here, "../contract-review.config.json");
  return parseConfig(JSON.parse(readFileSync(file, "utf8")));
}
