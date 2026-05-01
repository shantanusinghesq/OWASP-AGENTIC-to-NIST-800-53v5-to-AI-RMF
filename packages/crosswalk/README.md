## @obviate/crosswalk

Reference data mapping the **OWASP Top 10 for Agentic Applications (ASI 2026)** to **NIST SP 800-53 Rev 5** security controls and the **NIST AI Risk Management Framework (AI 100-1)**.

This package contains the curated crosswalk that powers the [OWASP Agentic AI ↔ NIST Crosswalk](../../README.md) interactive web application. It is published separately under the **MIT License** so that downstream tools — assessment platforms, GRC integrations, SIEM dashboards — can consume the data without inheriting the AGPL-3.0 license of the SPA.

### Exports

| Symbol | Shape | Source |
|---|---|---|
| `OWASP_ASI` | `ASIRisk[]` (10 entries: ASI01–ASI10) | OWASP ASI 2026 |
| `NIST_800_53` | `NISTFamily[]` (16 control families) | NIST SP 800-53 Rev 5 |
| `AI_RMF` | `AIRMFFunction[]` (4 functions × N subcategories) | NIST AI 100-1 |
| `CROSSWALK` | `Record<ASIId, CrosswalkEntry>` — per-ASI control + AI-RMF mappings with rationale and evidence | Editorial |
| `severityColor` | `Record<Severity, hexstring>` | Editorial |
| `NIST_CONTROL_DESCRIPTIONS` | `Record<ControlId, {title, description, implementation, relatedASI}>` | NIST + editorial |
| `NIST_AI_RMF_DESCRIPTIONS` | `Record<CatId, AIRMFControlDesc>` | NIST + editorial *(currently GOVERN-only; MAP/MEASURE/MANAGE pending)* |

Plus the corresponding TypeScript interfaces.

### Usage

```ts
import { CROSSWALK, NIST_CONTROL_DESCRIPTIONS } from "@obviate/crosswalk";

const asi01 = CROSSWALK.ASI01;
for (const mapping of asi01.nist53) {
  console.log(mapping.family, mapping.controls, mapping.rationale);
}

const ac3 = NIST_CONTROL_DESCRIPTIONS["AC-3"];
console.log(ac3.title, ac3.description);
```

### Data integrity

A Vitest suite at `tests/data.integrity.test.ts` guards against drift: every referenced family / control / AI-RMF cat resolves; every ASI has at least one mapping per framework. Two checks (`T4`, `T6b`) are `.skip`'d pending editorial backfill of missing description entries.

### License

MIT. The underlying frameworks (NIST SP 800-53 Rev 5 and NIST AI 100-1) are U.S. Government works in the public domain. The OWASP Top 10 for Agentic Applications is published by OWASP under their open licensing terms. Editorial rationale, mappings, and evidence citations are original work © 2026 Shantanu Singh / Obviate AI, released under MIT.

The parent repository (the React/Vite SPA that consumes this package) is licensed separately under **AGPL-3.0**. See the root `LICENSE` for that.

### Consuming from GitHub Packages

This package is published to the GitHub Packages npm registry under the `@obviate` scope. Consumers need a `GITHUB_TOKEN` env var with at least the `read:packages` scope.

Add a `.npmrc` at the root of your consuming project:

```
@obviate:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then install:

```sh
pnpm add @obviate/crosswalk
```

Usage:

```ts
import { CROSSWALK, NIST_CONTROL_DESCRIPTIONS } from "@obviate/crosswalk";

const asi01 = CROSSWALK.ASI01;
console.log(asi01.nist53, asi01.aiRmf, asi01.evidence);
```
