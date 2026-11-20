# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent quality gates

Hard gates: `.cursor/rules/quality-gates.mdc`. Constraints that are not a single command: `.cursor/rules/agent-constraints.mdc`. Both are `alwaysApply: true`. Satisfy them before treating work as done. Do not restate them here.

## Commands

Package manager is **pnpm** (see `packageManager` field in `package.json`). The lockfile (`pnpm-lock.yaml`) is committed; CI uses `pnpm install --frozen-lockfile` for reproducibility.

| Command | Purpose |
|---|---|
| `pnpm dev` | Vite dev server on port 3000 (HMR, host-exposed). |
| `pnpm build` | Vite client build → `dist/public/`, then `esbuild` bundles `server/index.ts` → `dist/index.js`. |
| `pnpm start` | Run the production Express server (`NODE_ENV=production node dist/index.js`). |
| `pnpm preview` | Vite preview of the built client at port 4173. |
| `pnpm check` | TypeScript type-check only (`tsc --noEmit`). No separate lint step. |
| `pnpm test` | Vitest run (data-integrity suite at `client/src/lib/__tests__/`). |
| `pnpm test:watch` | Vitest watch mode. |
| `pnpm format` | Prettier on the entire repo. |

The data-integrity suite (`packages/crosswalk/tests/data.integrity.test.ts`) guards the crosswalk against drift: every referenced NIST control / AI-RMF cat resolves to a description entry; every `relatedASI` cross-reference points at a real ASI; AI-RMF description keys must use canonical short-form (`GV|MP|MS|MG-\d+`) — regression guard against the long-form `MAP-*`/`MEASURE-*` orphan pattern that was caught and removed in v0.2.0. 11 tests, 0 skipped.

### Publishing the package

`@haremantra/crosswalk` is published to GitHub Packages on tag push. Bump `packages/crosswalk/package.json` `version`, then:
```bash
git tag crosswalk-v0.2.0 && git push --tags
```
The `.github/workflows/publish-crosswalk.yml` workflow runs `pnpm publish` against `https://npm.pkg.github.com` using `GITHUB_TOKEN`. Consumers add an `.npmrc` line `@haremantra:registry=https://npm.pkg.github.com` plus an auth token (see `packages/crosswalk/README.md`).

### Known latent bug — `Home.tsx:97` fallback

`client/src/pages/Home.tsx` falls back from `NIST_CONTROL_DESCRIPTIONS[id]` → `NIST_AI_RMF_DESCRIPTIONS[id]`. Search for `"MP-1"` will resolve to NIST 800-53's `"MP-1 Media Protection Policy"` (in `nist-control-descriptions.ts`) before checking the AI-RMF map. Out of scope for the v0.2.0 cycle; tracked here for future cleanup.

## Architecture

This is a **fully client-side** interactive crosswalk between three frameworks: OWASP Top 10 for Agentic AI (ASI 2026), NIST SP 800-53 Rev 5, and NIST AI-RMF (AI 100-1). All data is embedded in TypeScript — there is no database, no API, no backend logic.

### Workspace layout (asymmetric pnpm workspace)

`pnpm-workspace.yaml` declares `packages/*`. The SPA lives at the **repo root** in `client/` (Vite config still sets `root: "client"`); only the data layer is a workspace package.

- **`client/`** — the React 19 SPA. `client/index.html` is the Vite entry. Build output goes to `dist/public/`.
- **`server/index.ts`** — a minimal Express server that only serves the static client build. Used solely for production hosting (e.g., the Docker path); the GitHub Pages deploy ignores it. Do not add API routes here without coordinating — the data model assumes 100% client-side rendering.
- **`shared/`** — tiny constants module re-exported by `client/src/const.ts` (`@shared/*` alias). Effectively unused — fold into `client/src/` if touched.
- **`packages/crosswalk/`** — `@haremantra/crosswalk` workspace dep, **MIT-licensed** (see "Licensing" below).

Path aliases (defined in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`): `@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets/*` → `attached_assets/*`, `@haremantra/crosswalk` → `packages/crosswalk/src`.

The asymmetric layout (workspace-package next to a non-workspace SPA) is intentional and minimal. A future migration could move `client/` → `apps/web/` and `server/` → `apps/server/`; the path aliases above would need updating.

### Data model is the product — `@haremantra/crosswalk`

`packages/crosswalk/src/data.ts` is the **single source of truth** for the crosswalk. It exports four structures consumed by every view, plus the description databases:

- `OWASP_ASI` — 10 risk objects (`ASI01`–`ASI10`).
- `NIST_800_53` — 16 control families (with display colors for the heatmap).
- `AI_RMF` — 4 functions (GOVERN, MAP, MEASURE, MANAGE) with their subcategories.
- `CROSSWALK` — keyed by ASI id; each entry has `nist53[]` (family + specific controls + rationale), `aiRmf[]` (function + subcategories + rationale), and free-text `evidence` (CVEs, incident reports, citations).
- `NIST_CONTROL_DESCRIPTIONS` and `NIST_AI_RMF_DESCRIPTIONS` — keyed by control/cat id, supply tooltip/expand text consumed only by `Home.tsx`.

When adding or editing a mapping, update **both** the mapping in `data.ts` and (if the rationale references a control not yet documented) the relevant descriptions file. The `CrosswalkEntry` interface at the top of `data.ts` is the schema contract. Run `pnpm test` before committing — the integrity suite catches missing description entries and orphan ASI keys instantly.

### Licensing (dual)

- Repo root and SPA (`client/`, `server/`, `shared/`): **AGPL-3.0** (see root `LICENSE`).
- `packages/crosswalk/`: **MIT** (see `packages/crosswalk/LICENSE`). Permits AEGIS and other commercial consumers to import the data without inheriting AGPL. The package's `README.md` documents the rationale and source attribution.

### Two pages, two engines

Routing is via **Wouter** in `client/src/App.tsx`.

- **`pages/Home.tsx`** (~1,070 lines) — the 800-53 heatmap, AI-RMF heatmap, and Evidence Explorer. Pure transformations over `@haremantra/crosswalk`. The Evidence Explorer search index spans rationale, evidence, implementation, and ASI description fields.
- **`pages/ScenarioSimulator.tsx`** (~1,420 lines) — the Scenario Scrambler. Driven by the `lib/scrambler-*.ts` modules:
  - `scrambler-types.ts` — `FactPattern`, `ScenarioResult`, `ControlEvaluation`, `CellState` ('active' | 'broken' | 'irrelevant').
  - `scrambler-generator.ts` — produces random `FactPattern`s using IMDA-derived probability weights and `GovernancePosture` ('Minimal' | 'Standard' | 'Full') for Guided Mode.
  - `scrambler-mappings.ts` — `CONTROL_STATE_TO_FAMILIES` (the 7 control booleans → NIST families) and `RISK_TO_ASI` (IMDA category → ASI relevance weights). This is the bridge between the simulator's 7 simplified controls and the 16 NIST families. Editorial decisions (DP-04, DP-04a) are documented inline.
  - `scrambler-evaluator.ts` — given a `FactPattern`, computes per-cell state for the simulator's heatmap.
  - `scrambler-bias-model.ts`, `scrambler-contrast.ts`, `scrambler-info-content.ts`, `scrambler-narrative.ts`, `scrambler-preview.ts` — UI-facing helpers that turn evaluation output into displayable narrative/contrast text.

The simulator's heatmap uses a **different** schema than the Home heatmaps (3-state cells per scenario vs. count-density cells per static crosswalk). Don't share components between them without converting models.

### UI

- **shadcn/ui** ("new-york" style, neutral base) in `client/src/components/ui/` — see `components.json`. Add new shadcn components via the CLI; don't hand-edit existing ones unless a fix is project-specific.
- **Tailwind CSS 4** via `@tailwindcss/vite` (no `tailwind.config.js`); design tokens live in `client/src/index.css` as CSS custom properties (`--text-primary`, `--text-secondary`, `--text-caption`, animations like `pulse-once`).
- Theme: dark default, provided by `contexts/ThemeContext.tsx` wrapping the app.
- Charts: Recharts. Animations: Framer Motion. Toasts: Sonner.
- Accessibility commitments documented in `CHANGELOG.md` are load-bearing — heatmap cells use shape-coded SVGs (not color alone), all cells carry descriptive `aria-label`s, and `prefers-reduced-motion` is respected. Preserve these when modifying heatmaps.

### Deployment

`.github/workflows/deploy-pages.yml` builds with `pnpm install --no-frozen-lockfile && pnpm build` on push to `main` and publishes `./dist/public` (Vite's actual client output) to GitHub Pages. The Express server bundle at `dist/index.js` is built but unused by Pages.

### Manus runtime artifacts

`vite.config.ts` registers two Manus-specific dev plugins (`vite-plugin-manus-runtime`, an in-file `vitePluginManusDebugCollector`) that write browser console/network/session logs into `.manus-logs/` during `pnpm dev`. These are dev-only, gitignored, and safe to delete; do not remove the plugins themselves without a reason.
