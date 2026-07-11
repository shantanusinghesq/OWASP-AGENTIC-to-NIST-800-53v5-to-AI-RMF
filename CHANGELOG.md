# Changelog

All notable changes to the **OWASP Agentic AI ↔ NIST Crosswalk** are documented in this file. This is not a conventional changelog of version bumps and bug fixes. It is a **decision log** — a record of the conceptual reasoning, data integrity corrections, and design philosophy shifts that have shaped this crosswalk from its initial commit to its current form. Each entry explains not just *what* changed, but *why* it matters for compliance practitioners, auditors, and security architects working at the intersection of agentic AI and federal control frameworks.

This project follows a philosophy of **transparent provenance**: every editorial judgment is disclosed, every scope limitation is documented, and every data distinction (unique vs. aggregate) is surfaced to the reader rather than buried in computed totals.

---

## [Unreleased] — 2026-07-11 — Data Integrity Corrections (TRD WS3)

A series of data-accuracy corrections closing the gap-analysis remediation backlog (`docs/trd/TRD-GAP-REMEDIATION.md`). Each is landed with a regression test so it cannot recur.

### Decision Point: Withdrawn Rev-4 controls purged; SA-12 remapped to the SR family

**What changed.** The control-descriptions database — labelled "NIST 800-53 Rev 5" — contained eleven controls that were *withdrawn* in Rev 5, their intent redistributed to other families: SA-6, SA-7, SA-12, SA-13, SA-14, SA-18, SA-19, SC-9, SC-19, SC-33, SI-9. Ten were description-only (never referenced by a mapping) and have been deleted. The eleventh, **SA-12 Supply Chain Protection**, was live in the ASI04 (Supply Chain Vulnerabilities) mapping. It has been removed and its intent folded into ASI04's existing SR-family mapping, which in Rev 5 supersedes SA-12 via SR-3 (Supply Chain Controls), SR-4 (Provenance), and SR-11 (Component Authenticity).

**Why it matters.** A crosswalk asserting Rev 5 alignment cannot cite controls Rev 5 withdrew — an auditor mapping a citation back to the catalog would find no such control. A new `withdrawn-controls` test now fails CI if any withdrawn ID reappears as a mapping reference or a description key.

**Effect on statistics.** Removing the withdrawn SA-12 citation lowers the distinct-control count from 55 to **54** (89 total mappings). This is the honest count of *valid Rev 5 controls* referenced; the previous 55 counted a withdrawn control.

### Decision Point: SI-7 normalized to one canonical display name

**What changed.** SI-7 was cited under two different display strings — "SI-7 Software Integrity" (ASI05, ASI06) and "SI-7 Software & Information Integrity" (ASI04). Both are the same control. All references are now normalized to the canonical Rev 5 title, **SI-7 Software & Information Integrity**.

**Why it matters.** The duplicate name inflated the "unique controls" statistic: the app counted display strings, so one control appeared as two. A new integrity check (T13b) now asserts every control ID renders exactly one display string, making this class of drift impossible.

### Decision Point: AI-RMF orphans resolved; GV-7 removed, GV-3 title corrected

**What changed.** Three AI-RMF description entries were referenced by no crosswalk mapping. **GV-7 (Continuous Improvement)** was a stray — absent from the AI-RMF category taxonomy entirely — and has been deleted. **GV-3** carried a title/description mismatch: it was labelled "Organizational Practices" (the name of GV-4) while the taxonomy correctly lists it as **Workforce Diversity**; its title and description are corrected. **GV-3** and **MS-4 (Measurement Effectiveness)** remain valid taxonomy categories that no ASI risk currently maps to; they are retained and tracked on an explicit allowlist.

**Why it matters.** A new orphan-detection check (T16) asserts the set of unmapped description keys equals exactly the known-orphan allowlist — a newly-introduced unmapped entry now fails CI, and removing an allowlist entry requires wiring the category into a mapping with rationale. This keeps the "complete coverage" question honest: the crosswalk references **17 of the 19** defined AI-RMF subcategories.

### Decision Point: Evidence migrated to structured, web-verified citations

**What changed.** Each ASI risk's `evidence` field changed from a single prose string to a typed `EvidenceItem[]` (`{ title, type: incident|research|guidance, sourceUrl?, cveId?, datePublished?, dateVerified, relatedControls? }`). All **33** evidence references across the 10 risks were web-researched and adversarially verified — every proposed source was fetched and confirmed on-topic before acceptance. The audit is recorded in `docs/EVIDENCE_AUDIT.md`. Highlights: EchoLeak is pinned to its actual CVE (CVE-2025-32711); AgentFlayer to Zenity Labs' disclosure; the Amazon Q wiper to ReversingLabs; the Replit production-database deletion to The Register; the malicious `postmark-mcp` package to Koi.ai; technique-class references (confused-deputy, MCP tool poisoning, cascading failures) to authoritative research/guidance (CSA, OWASP, MITRE ATT&CK, arXiv, Google SRE).

**Why it matters.** Previously the evidence was unsourced prose — of ten risks, only one carried a verifiable identifier, so an auditor got assertions rather than citations. Now every risk carries at least one machine-resolvable source (the T11 verifiability gap went from 9/10 to **0/10**), the Evidence Explorer renders each citation as a typed, linked reference, and the data ships the sources in `crosswalk.json`/`.csv`. This is the difference between a citable compliance artifact and an unsourced spreadsheet.

### Decision Point: Scope roadmap and contribution governance

**What changed.** Two governance artifacts landed. `docs/EXPANSION_ROADMAP.md` converts the static scope exclusions into a documented, condition-triggered roadmap covering six families — the four excluded (AT, MA, PS, PT) plus the two defined-but-unmapped (MP, PE) — each with a status, an inclusion trigger, representative controls (by ID/title, linked to NIST's catalog, no prose copied), and an activation checklist enumerating every artifact to change on promotion. AT is marked *Partially Triggered* (AT-2/AT-3 are acknowledged directly-applicable to ASI09; the stubs live only in the roadmap, never in the crosswalk data). The roadmap carries a coverage-truth table (14 mapped / 2 defined-unmapped / 4 excluded) and a dual-mode review process (semi-annual + incident-triggered), guarded by a test. `GOVERNANCE.md` defines a two-mode contribution model — Solo Mode (active: CI is the sole merge gate, no required approvals) and Board Mode (inactive: activates only on a documented reviewer trigger) — plus a Mapping Provenance Standard, a dispute process built on this Decision Point convention, `CODEOWNERS`, issue forms, and a PR template.

**Why it matters.** A framework claiming superior flexibility to technology advances should show *how* it adapts: the roadmap makes the scope boundary conditional and reviewable rather than static, and the governance docs make contribution and dispute paths explicit while staying honest that the project is currently single-author (no external approval is required to merge, and Board Mode is documented but not enabled).

### Decision Point: Consumable data product — machine-readable exports and provenance

**What changed.** The `@haremantra/crosswalk` package now builds distributable artifacts (`tsup` → ESM + CJS + type declarations) and emits, at build time, `crosswalk.json` (the full dataset with `dataVersion` and `upstreamVersions`), `crosswalk.csv` (one row per ASI × control mapping — 89 rows), and `crosswalk.oscal.json` (an OSCAL-aligned mapping whose every control is resolved against the pinned Rev 5 catalog, throwing on any missing or withdrawn id). `publishConfig` points the *published* package at `dist/` and exposes a `./data.json` subpath, while the workspace app keeps consuming raw `src`. The hosted app gained client-side **Download JSON / Download CSV** actions (Blob only — no server) and a **Provenance & Limitations** panel that renders the pinned upstream editions and the crosswalk's disclosed limitations. `TERMS_OF_SERVICE.md` §4.2 now expressly permits these sanctioned export artifacts.

**Why it matters.** The framework's flexibility claim depends on the crosswalk functioning as a data product other governance tooling can adapt around. Previously the package shipped only raw TypeScript — unusable by Python GRC pipelines, spreadsheets, or SIEM ingestion, and the hosted app's terms forbade extraction. Now the data travels in JSON/CSV/OSCAL with a version stamp and its provenance and limitations attached.

### Decision Point: Anchored to NIST's canonical OSCAL catalog (upstream validation)

**What changed.** The 800-53 layer is now validated against a vendored slim index of the NIST SP 800-53 Rev 5 catalog, generated from a pinned `usnistgov/oscal-content` release (v1.5.0) via `scripts/refresh-oscal.mjs` and checked in at `packages/crosswalk/src/oscal-index.ts`. The integrity suite now asserts that every referenced control and description key **exists in Rev 5**, is **not withdrawn**, and sits in the **correct family**. This caught three further withdrawn controls the manual purge missed — **CP-5, IR-10, SC-14** (all description-only orphans) — now deleted. Control-title divergence from the canonical catalog is surfaced report-only (107 description entries use abbreviated or Rev-4-era titles; 14 are referenced by a mapping) and flagged for a future editorial pass.

The package now exports `UPSTREAM_VERSIONS` (OWASP ASI 2026, NIST 800-53 Rev 5 + OSCAL tag, NIST AI 100-1) — the app footer renders these pinned editions from that single source. A non-blocking monthly workflow (`oscal-drift.yml`, plus `pnpm drift:oscal` locally) diffs the latest catalog against the vendored index and reports added / removed / newly-withdrawn / retitled controls without mutating data or gating CI.

**Why it matters.** A crosswalk claiming Rev 5 alignment should be checkable against Rev 5 itself, and should notice when the upstream catalog moves. Existence and withdrawn status are now enforced against NIST's own machine-readable catalog rather than a hand-curated list, and drift is detected rather than discovered by accident.

### Decision Point: AI-RMF description titles aligned to the taxonomy display names

**What changed.** The description database's GOVERN and MANAGE entry *titles* had drifted from the category names the app actually displays: GV-2 was titled "Risk Management Framework" (canonical: Accountability), GV-4 "Oversight & Accountability" (Organizational Practices), GV-6 "Resource Allocation" (Supply Chain & Third-Party), and all four MANAGE entries were mislabeled (MG-1 "Incident Response" → Risk Prioritization, MG-2 "Corrective Actions" → Risk Treatment, MG-3 "Continuous Monitoring" → Response & Recovery, MG-4 "Lessons Learned" → Residual Risk). All seven titles — and their description/implementation text — are corrected to match. (MAP and MEASURE were already consistent.)

**Why it matters.** The tooltip renders the description title while the visible label is the taxonomy display name, so a hover on "GV-6 Supply Chain & Third-Party" showed "Resource Allocation" — the wrong category. A new check (T-title) asserts every description title matches its taxonomy display name, so this mismatch class is now impossible.

### Decision Point: Coverage statistics corrected (authoritative current figures)

**What changed.** Several earlier entries reported coverage figures that no longer hold after the data corrections above. The authoritative current figures — now **derived from the mappings** at build time and pinned by the test suite, rather than hand-maintained — are:

| Statistic | Old claim | Corrected |
|---|---|---|
| Distinct 800-53 controls | 56 | **54** |
| Total 800-53 control mappings | 90 | **89** |
| 800-53 families | "16 of 20 represented" | **16 in scope, 14 with mapped controls** (MP, PE defined but unmapped) |
| AI-RMF subcategory coverage | "complete coverage of all 19" | **17 of 19 referenced** (GV-3, MS-4 unmapped) |
| Total AI-RMF category mappings | 62 | 62 (unchanged) |

**Why it matters.** The prior figures overstated coverage: they counted a withdrawn control (SA-12), double-counted SI-7, treated all 16 in-scope families as "represented" when two carry no mappings, and claimed complete AI-RMF coverage when two subcategories are unmapped. The corrected figures are the honest, test-enforced counts. Earlier entries below are annotated *(superseded 2026-07-11)* where they state the old numbers.

---

## [0.5.2] — 2026-03-26

### Tier 2 Accessibility & UX Consistency — Fixes 6–10

Five fixes targeting WCAG AA compliance, screen reader support, motion sensitivity, and cross-heatmap UX parity.

**Fix 6: AI-RMF Row Clickability.** The AI-RMF heatmap rows already had `onClick` handlers and `cursor-pointer`, but lacked the helper text, keyboard accessibility, and ARIA roles present on the 800-53 heatmap. Added "Click any row for full detail" to the description text. Added `role="row"`, `tabIndex={0}`, and `onKeyDown` (Enter/Space → navigate to Evidence Explorer) to all AI-RMF rows. Added `scope="row"` to row header cells. Both heatmaps now have identical interaction affordances.

**Fix 7: WCAG AA Text Contrast.** Audited all text elements against the `#0F172A` background. Bumped inactive tab labels from `#64748B` (~3.5:1) to `#94A3B8` (~5.5:1). Bumped stat card labels from `${color}90` (semi-transparent) to full brand color. Bumped footer source text from `text-[10px] text-slate-500` to `text-[11px] text-slate-400`. Bumped legend text to `text-slate-400`. The remaining `text-slate-500` instance is a decorative icon (Shield) in the empty Evidence Explorer state, which is non-informational.

**Fix 8: Heatmap Cell Aria-Labels.** Refactored `HeatCell` and `AIRmfHeatCell` components to accept `riskId`, `riskName`, and `familyCode`/`functionName` props. Every cell now has a descriptive `aria-label` (e.g., "ASI01 Agent Goal Hijack × AC: 3 controls mapped" or "ASI01 Agent Goal Hijack × GOVERN: 2 subcategories"). Both `<table>` elements now have `role="table"` and `aria-label`. All column headers have `scope="col"`. Total: 160 800-53 cells + 40 AI-RMF cells = 200 labeled cells across both heatmaps.

**Fix 9: prefers-reduced-motion.** Added a global CSS media query that suppresses all `animation-duration`, `animation-iteration-count`, `transition-duration`, and `scroll-behavior` when the user's OS requests reduced motion. Wrapped the card-pulse and toast-enter animations in `@media (prefers-reduced-motion: no-preference)` so they only play when the user has not opted out. The hero background is a static image (not canvas), so no JS check was needed.

**Fix 10: Stat Card Context Lines.** Added "across 10 threat categories" subtitle to the ASI Risks card. The Critical Risks card already had its context line from Fix 5 (v0.5.0). All four stat cards now have descriptive subtitles for visual consistency.

---

## [0.5.1] — 2026-03-26

### Tier 1 Immediate Fixes — SEO, Accessibility, and Visual Polish

Five surgical fixes applied without altering existing functionality, data, or layout.

**Fix 1: Title Tag.** Browser tab title already matched the OG meta tags ("OWASP Agentic AI ↔ NIST Crosswalk"). Confirmed correct.

**Fix 2: OG Image and Meta Tags.** Added `og:url`, `og:image`, and `twitter:image` meta tags to `index.html`. Generated a 1200×630 `og-card.png` using Pillow with the app's dark navy background (#0a0f1a), shield icon, cyan "COMPLIANCE MIDDLEWARE" label, white title, slate-400 subtitle with key stats, cyan accent line, and "haremantra" attribution.

**Fix 3: Column Header Tooltips.** Wrapped all 16 NIST 800-53 column headers (AC through SR) in Radix `<Tooltip>` components showing the full family name (e.g., "AC — Access Control"). Added `title` attribute fallback for non-hover devices. Wrapped the heatmap table in `<TooltipProvider delayDuration={200}>`.

**Fix 4: Row Hover States.** Changed 800-53 heatmap row hover from invisible `#F0F9FF` to visible `rgba(59,130,246,0.08)`. Changed AI-RMF heatmap row hover from invisible `#F0FDF4` to visible `rgba(34,197,94,0.08)`. Both heatmaps already had `group` class with `ChevronRight` opacity transition — confirmed working.

**Fix 5: Critical Risks Context.** Added supporting text "ASI01, ASI03, ASI08, ASI10 rated Critical severity" to the Critical Risks stat card, matching the subtitle pattern used by the other three stat cards.

---

## [0.5.0] — 2026-03-26

### UX Remediation — 11-Bug Fix Across 3 Phases

This release addresses eleven confirmed UX/UI bugs identified through systematic review of the Scenario Simulator's interaction model, accessibility compliance, and visual feedback systems. The fixes were executed in dependency order across three phases: design tokens and component rewrites (Phase 1), chart accessibility (Phase 2), and full regression verification (Phase 3).

#### Phase 1A: Design Token System (Bug 4)

Introduced three CSS custom properties (`--text-primary`, `--text-secondary`, `--text-caption`) in `index.css` to replace ad-hoc text color classes throughout the Scenario Simulator. All text elements now reference these tokens, ensuring consistent WCAG-compliant contrast ratios against the dark background. Added `@keyframes pulse-once` and `.scenario-toast` CSS for the feedback system.

#### Phase 1B: Guided Mode Panel Rewrite (Bugs 1, 2, 3, 6)

**Bug 1 — Tooltip Mutex.** Lifted tooltip state to a shared `openTooltipId` at the parent level. Opening one tooltip now automatically closes any previously open tooltip, preventing the stacking behavior where multiple info bubbles could overlap.

**Bug 2 — Event Propagation.** Added `e.stopPropagation()` on the info icon (`ⓘ`) click handler, isolating it from the card selection handler. Clicking the info icon no longer inadvertently selects the card.

**Bug 3 — Dismiss Mechanisms.** Added three dismiss paths: Escape key (via `useEffect` keydown listener), click-outside (via ref-based detection), and an explicit close button (`✕`) within the tooltip. All three paths clear `openTooltipId`.

**Bug 6 — Interaction Model Simplification.** Replaced the confusing "click once to learn, click again to select" model with a clean separation: clicking the card body selects it immediately; clicking the `ⓘ` icon opens the info tooltip. Updated instruction text to "Select one option per column. Click ⓘ for details."

#### Phase 1C: Heatmap Grid Rewrite (Bugs 7, 8, 11)

**Bug 7 — Colorblind-Safe Icons.** Replaced color-only cell indicators with shape-coded SVG icons: checkmark-in-square for Active (green), X-in-diamond for Broken (red), and horizontal dash for N/A (gray). The legend mirrors these shapes.

**Bug 8 — Cell Size and ARIA.** Increased cell dimensions to 32×32px for touch targets. Added `role="table"`, `role="row"`, `role="columnheader"`, and `role="cell"` with `aria-label` attributes describing each cell's state (e.g., "ASI01 AC: Broken").

**Bug 11 — Responsive Scroll.** Wrapped the heatmap in a horizontally scrollable container with sticky row headers. The ASI Risk column remains visible during horizontal scroll on narrow viewports.

#### Phase 1D: Scenario Feedback + Mode Badge (Bugs 9, 10)

**Bug 9 — Generation Feedback.** Added three feedback signals on scenario generation: (1) a toast notification ("Scenario generated — scroll down to view results") that auto-dismisses after 4 seconds, (2) smooth scroll-to-results using `scrollIntoView`, and (3) a one-second pulse animation on the results container. The Generate button now shows a counter ("Generate Scenario #N").

**Bug 10 — Mode Context Badge.** Added a blue badge displaying the current mode and selections (e.g., "Guided: DataBreach × Swarm × Minimal") in both the outcome banner and the heatmap section header.

#### Phase 2: Chart Accessibility (Bug 5)

Increased axis label font size to 12px using `--text-secondary`. Added `role="img"`, `<title>`, and `<desc>` elements to the SVG chart. Added faint grid lines for value reference. Data point labels now display percentage values at key action counts.

#### Regression Verification

All 11 bugs verified in browser with the DataBreach × Swarm × Minimal scenario. Tooltip mutex, event isolation, Escape dismiss, single-click selection, colorblind icons, ARIA labels, responsive scroll, toast feedback, mode badges, and chart accessibility all confirmed working.

---

## [0.4.0] — 2026-03-26

### Scenario Simulator — Pedagogical Compliance Engine

This release introduces the fourth major view in the crosswalk: a **Scenario Simulator** that generates deterministic compliance breakage scenarios by combining three independent parameters — risk category, agent architecture, and governance posture — and then evaluates which NIST 800-53 control families break under the resulting conditions. The simulator is not a toy. It is a structured pedagogical tool designed to help compliance practitioners, security architects, and auditors develop intuition for *how* control gaps emerge in agentic AI systems, rather than merely memorizing *which* controls exist.

The simulator operates on a **fact-pattern scrambler** architecture: nine TypeScript modules that encode the crosswalk's control mappings, governance posture definitions, architecture capacity models, and narrative generation logic into a composable engine. No randomness is involved in the evaluation itself — given the same three parameters, the simulator always produces the same broken-control set. The "Random" mode randomizes parameter selection, not evaluation.

#### The 5-Step Pedagogical UX

The Scenario Simulator implements a five-step learning flow designed to move the user from ignorance to understanding before they encounter results:

**Step 1 — Info Bubbles (Learn Before You Choose).** In Guided mode, the first click on any parameter card opens an educational tooltip explaining what that parameter means, what real-world scenario it models, and which ASI risks it implicates. The DataBreach card, for example, explains that it models scenarios where sensitive or confidential data is improperly disclosed by the agent, references ASI04 (Supply Chain and Dependency Attacks) and ASI07 (Insecure Multi-Agent Communication), and describes the exfiltration vectors that distinguish data breach from other risk categories. This "click to learn, click again to select" pattern ensures that users understand the parameter space before committing to a scenario configuration.

**Step 2 — Card Selection (Deliberate Configuration).** The second click on a card selects it, updating the scenario preview in real time. The visual feedback — highlighted borders, updated preview text — reinforces the causal relationship between parameter choices and scenario outcomes. Users can change selections freely before generating, encouraging experimentation.

**Step 3 — Scenario Preview (Anticipation Before Execution).** Before the user clicks "Generate Scenario," a preview panel displays the scenario headline, a narrative paragraph explaining the threat model, and three key questions the scenario will answer. This preview is generated by the `scrambler-preview.ts` module using the same narrative templates that drive the full results. The preview serves a pedagogical function: it asks the user to predict which controls will break before revealing the answer.

**Step 4 — "What These Results Mean" (Consequence Narratives).** After generation, each broken NIST control family is presented with its full name (e.g., "AC — Access Control"), a consequence narrative explaining *why* that family breaks under the selected conditions, and a disclosure of which specific control boolean was disabled. The `scrambler-narrative.ts` module generates these narratives by combining architecture-specific templates ("Without access control, the Swarm agent can access any data source without restriction") with risk-specific consequence chains ("This allows the agent to read and potentially leak sensitive data it should not have access to"). Active control families are also displayed under a "What Is Holding" section, providing positive reinforcement for controls that survived the scenario.

**Step 5 — "What Full Governance Looks Like" (Contrast Panel).** The final pedagogical step is a collapsible panel generated by `scrambler-contrast.ts` that shows, for every control family in the scenario, a before/after comparison between the current governance posture and full governance. Each family entry includes: a "Was Broken" badge (for families that failed), the current-posture consequence, the full-governance outcome, and a "What Changes" explanation describing the specific control improvement. The panel concludes with an **Overall Verdict** — a nuanced statement acknowledging that even full governance does not eliminate all risk (e.g., "Even with full governance, swarm architectures retain inherent coordination complexity. Insider threats and zero-day vulnerabilities persist. The risk is mitigated but not eliminated — media protection and incident response are crucial."). This verdict prevents the false conclusion that compliance equals security.

#### Scrambler Module Architecture

The simulator's logic is distributed across nine TypeScript modules, each with a single responsibility:

| Module | Responsibility |
|---|---|
| `scrambler-types.ts` | Type definitions for risk categories, archetypes, governance postures, and evaluation results |
| `scrambler-mappings.ts` | The crosswalk's control-family-to-boolean mapping for all 10 ASI risks across 7 control dimensions |
| `scrambler-generator.ts` | Parameter randomization and scenario generation with architecture-specific load profiles |
| `scrambler-evaluator.ts` | Deterministic evaluation engine that computes broken/active control sets from governance posture |
| `scrambler-info-content.ts` | Educational content for all 12 parameter cards (5 risks, 4 archetypes, 3 postures) |
| `scrambler-preview.ts` | Scenario preview generation with headline, narrative, and key questions |
| `scrambler-narrative.ts` | Consequence narrative generation for broken and active control families |
| `scrambler-contrast.ts` | Before/after governance contrast generation with overall verdict |
| `scrambler-bias-model.ts` | Automation bias degradation curve modeling for the oversight accuracy chart |

The `ScenarioSimulator.tsx` component orchestrates these modules into a single-page experience with animated transitions, collapsible accordion panels, a dynamic heatmap, and the automation bias degradation chart.

#### Additional Features

**Cascade Failure Paths.** A collapsible panel showing how a single broken control family can cascade into failures across related families, modeled as directed paths through the control dependency graph.

**Implicated ASI Risks.** A panel listing all OWASP ASI risks that are relevant to the selected risk category, with severity badges and brief descriptions.

**Automation Bias Chart.** A degradation curve showing how human oversight accuracy declines as agent action count increases, with architecture-specific inflection points. The chart models ASI09 (Automation Bias) risk using a logarithmic decay function with a false-confidence recovery spike.

**Impact and Likelihood Profiles.** Summary cards showing the scenario's domain error tolerance, data sensitivity, external access scope, action scope, reversibility, autonomy level, task complexity, and external exposure — all derived from the selected parameters.

---

## [0.3.1] — 2026-03-15

### Revert — UX/Design Recommendations Rolled Back

Seven UX/design recommendations were implemented and then reverted in the same release cycle. The changes included: (1) shifting Medium-High severity badges from blue to amber with accessibility icons, (2) an expandable control family legend, (3) enhanced row hover affordance, (4) thicker tab underlines with brighter active colors, (5) monospace typography for identifiers with increased row height, (6) responsive breakpoints for mobile and tablet, and (7) a sticky density legend with an expandable methodology panel and a centralized DESIGN_TOKENS constant.

These changes were reverted because the cumulative visual impact degraded the overall user experience rather than improving it. The original design — while simpler — communicated the crosswalk data more effectively. This decision reflects a core principle: **design changes must serve the data, not compete with it.** When seven simultaneous UX modifications are applied to a data-dense compliance tool, the result can overwhelm the reader rather than guide them. Future UX improvements will be introduced incrementally, tested individually, and evaluated against the standard of whether they make the crosswalk easier to read, not just more visually sophisticated.

The revert was applied to both the hosted web application and the GitHub repository source code. No data, content accuracy, or legal changes from v0.3.0 or v0.2.0 were affected.

---

## [0.3.0] — 2026-03-15

### Content Accuracy and Intellectual Honesty Overhaul

This release represents the most significant conceptual revision since the initial commit. Five targeted changes were made, each addressing a specific gap in how the crosswalk communicates its editorial boundaries, data precision, and scope limitations to the reader. No styling, layout, or visual design was altered — these are purely content and data integrity changes.

#### Decision Point 1 — Severity Badge Disclaimer

**What changed.** A disclosure sentence was appended to the header subtitle: *"Severity ratings (Critical, High, Medium-High) are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications."*

**Why it matters.** The original crosswalk displayed severity badges (Critical, High, Medium-High) next to each ASI risk without any attribution methodology. A compliance practitioner encountering this tool could reasonably assume these ratings were assigned by OWASP itself as part of the ASI 2026 specification. They are not. The OWASP Top 10 for Agentic Applications presents risks in ordinal rank order (ASI01 is the highest-priority risk, ASI10 the lowest) but does not assign severity labels in the CVSS or qualitative-rating sense. The severity badges in this crosswalk are **editorial interpretations** derived from the ordinal ranking: the top four risks (ASI01, ASI03, ASI08, ASI10) were classified as Critical based on their potential for autonomous, system-wide harm; the middle five (ASI02, ASI04, ASI05, ASI06, ASI09) as High; and ASI07 as Medium-High given its dependency on specific multi-agent architectures. Disclosing this methodology prevents the crosswalk from being cited as an authoritative OWASP severity classification when it is, in fact, an editorial overlay.

#### Decision Point 2 — Distinguishing Unique Controls from Total Mappings

**What changed.** The stat card previously labeled "800-53 CONTROLS" showing the value **90** was revised to display **"UNIQUE 800-53 CONTROLS"** with a dynamically computed count of distinct control identifiers (56), accompanied by a subtitle: *"90 total control mappings across 10 ASI risks."*

**Why it matters.** The original value of 90 was the sum of all `controls.length` values across every `nist53` entry in the crosswalk — a measure of **mapping density**, not control breadth. This is a critical distinction for compliance teams. A CISO reading "90 controls" might conclude that the crosswalk engages 90 distinct NIST 800-53 controls, implying broad coverage of the SP 800-53 catalog (which contains over 1,000 controls across 20 families). In reality, many controls appear in multiple ASI mappings because they are foundational to agentic AI security. For example, AC-3 (Access Enforcement) and AU-2 (Event Logging) each appear in six or more ASI risk mappings. The revised presentation makes both numbers visible: the unique count tells the reader how many distinct controls are engaged, while the total tells them how densely those controls are mapped across the threat landscape. This dual-number approach follows the principle that **aggregate statistics without decomposition obscure more than they reveal** in compliance contexts.

#### Decision Point 3 — Distinguishing Unique AI-RMF Categories from Total Mappings

**What changed.** The stat card previously labeled "AI-RMF CATEGORIES" showing the value **62** was revised to display **"UNIQUE AI-RMF CATEGORIES"** with the value **19**, accompanied by a subtitle: *"62 total category mappings across 10 ASI risks."*

**Why it matters.** The reasoning mirrors Decision Point 2 but carries additional weight because the AI-RMF category space is inherently smaller. The NIST AI Risk Management Framework (AI 100-1) defines exactly 19 subcategories across four functions: GOVERN (GV-1 through GV-6), MAP (MP-1 through MP-5), MEASURE (MS-1 through MS-4), and MANAGE (MG-1 through MG-4). The original display of "62" — the sum of all category references across all ASI mappings — could mislead a reader into thinking the AI-RMF contains 62 subcategories, or that this crosswalk references 62 distinct categories from a larger taxonomy. Neither is true. The crosswalk achieves **complete coverage** of all 19 AI-RMF subcategories, and the 62 figure represents the total number of times those 19 categories are referenced across 10 ASI risks. *(Superseded 2026-07-11: the crosswalk references 17 of the 19 subcategories — GV-3 and MS-4 are defined but unmapped.)* Surfacing "19" as the primary number immediately communicates full-framework coverage — a significant finding for organizations attempting to satisfy AI-RMF requirements through their agentic AI security program.

#### Decision Point 4 — Heatmap Scope Disclosure

**What changed.** An italic annotation was added below the 800-53 heatmap subtitle: *"Scope: 16 of 20 NIST 800-53 Rev 5 control families are represented. Families AT (Awareness & Training), MA (Maintenance), PS (Personnel Security), and PT (PII Transparency) were excluded as lower relevance to agentic AI threat vectors."* *(superseded 2026-07-11: 16 in scope, 14 with mapped controls — MP and PE are defined but unmapped.)*

**Why it matters.** The 800-53 heatmap displays 16 column headers representing NIST control families. Without disclosure, a reader might assume these are the only families in SP 800-53, or that the four missing families were accidentally omitted. In fact, their exclusion was a deliberate editorial decision. AT (Awareness & Training) was excluded because its controls focus on human training programs rather than technical agent controls — though this decision is itself nuanced, as noted in Decision Point 5 below. MA (Maintenance) addresses physical system maintenance schedules with limited applicability to software-defined agent architectures. PS (Personnel Security) governs human personnel screening, which does not directly map to non-human agent identity management (though the conceptual parallel is acknowledged in the ASI03 mapping via IA-family controls). PT (PII Processing and Transparency) was excluded because the crosswalk focuses on security controls rather than privacy-specific requirements, though organizations with privacy obligations should evaluate PT controls independently. Disclosing these exclusions and their rationale transforms the heatmap from a potentially misleading "complete picture" into an honest scoped analysis.

#### Decision Point 5 — ASI09 Rationale Supplement for AT-Family Applicability

**What changed.** The rationale string for ASI09's PM-family mapping was supplemented with: *"Note: AT-2 (Literacy Training) and AT-3 (Role-Based Training) from the AT family are also directly applicable but are not included in this crosswalk's scope."*

**Why it matters.** This change creates an explicit bridge between Decision Point 4 (the scope exclusion of the AT family) and a specific ASI risk where that exclusion has material consequences. ASI09 (Human-Agent Trust Exploitation) addresses the risk that agents exploit anthropomorphism and authority bias to socially engineer users. The most direct NIST 800-53 countermeasure for this risk is training — specifically, AT-2 (Literacy Training and Awareness) which covers security awareness for recognizing social engineering, and AT-3 (Role-Based Training) which provides specialized training for personnel in roles where automation bias is a factor. By mapping ASI09 only to PM-13 and PM-14 (which address workforce planning and monitoring rather than training content), the original crosswalk created a gap: the reader sees a training-adjacent control but not the training controls themselves. The supplemental note acknowledges this gap without breaking the crosswalk's scoping decision. It tells the reader: "We know AT-2 and AT-3 belong here conceptually, and we chose not to include the AT family for scope reasons, but you should evaluate them independently." This pattern of **acknowledging what was excluded and why** is essential for crosswalks that will be used in audit and compliance contexts, where omissions can be as consequential as inclusions.

### Stat Card Architecture

Beyond the five content changes, this release introduced a stat card row between the header and navigation tabs. The four cards (ASI Risks, Unique 800-53 Controls, Unique AI-RMF Categories, Critical Risks) provide an at-a-glance summary that serves two audiences: executives who need coverage metrics for board reporting, and practitioners who need to quickly assess the crosswalk's scope before diving into heatmaps. The subtitle pattern (showing total mappings below unique counts) was designed to preempt the most common misreading of compliance dashboards: conflating mapping density with control breadth.

### Footer — License and Legal Visibility

The footer was updated to include direct links to the AGPL-3.0 license, Terms of Service, and source code repository. This ensures that every rendered instance of the crosswalk — whether deployed via GitHub Pages, embedded in a compliance tool, or shared as a screenshot — carries its legal provenance.

---

## [0.2.0] — 2026-03-14

### Governance, Licensing, and Legal Framework

This release established the legal and documentation foundation for the project, adding three files that collectively define how the crosswalk can be used, shared, and built upon.

#### README.md — The Case for a Crosswalk

The README was written not as a technical setup guide (though it includes one) but as a **conceptual argument** for why compliance crosswalks between OWASP agentic AI risks and federal control frameworks are necessary. The core thesis is that organizations face a three-layer governance gap: OWASP identifies *what can go wrong* with agentic AI systems, NIST 800-53 prescribes *how to control information systems*, and NIST AI-RMF defines *how to govern AI risk* — but no authoritative document maps between them. Without a crosswalk, security teams must independently derive these mappings for every audit cycle, leading to inconsistent control selection, redundant compliance efforts, and gaps where agentic-specific risks fall between framework boundaries.

The README also documents the project's three-layer data architecture (OWASP ASI as the threat layer, NIST 800-53 as the control layer, AI-RMF as the governance layer) and provides step-by-step local installation instructions for practitioners who want to run the crosswalk locally or fork it for their own compliance programs.

#### LICENSE — AGPL-3.0

The GNU Affero General Public License v3.0 was chosen deliberately over MIT or Apache-2.0. The AGPL's network-use clause (Section 13) requires that any organization deploying a modified version of this crosswalk as a network service must make their source code available. This prevents a scenario where a consulting firm forks the crosswalk, adds proprietary mappings, deploys it as a paid SaaS tool, and removes attribution — while still benefiting from the community's original mapping work. The AGPL ensures that improvements to the crosswalk data flow back to the community.

#### TERMS_OF_SERVICE.md — Protecting the Developer

The Terms of Service establishes a legal distinction between the source code (governed by AGPL-3.0, freely forkable) and the hosted service (governed by SaaS terms that prohibit service replication, scraping, and commercial resale). This dual-licensing approach protects the developer's ability to operate a hosted version while keeping the underlying data and code open. Key provisions include a liability cap ($100), binding arbitration, and indemnification clauses that are standard for developer-protective SaaS agreements.

---

## [0.1.1] — 2026-03-14

### GitHub Pages Deployment Removal

The GitHub Pages deployment was replaced with a notice redirecting users to the primary hosted application. This decision was made because the Parcel-built static site on GitHub Pages lacked the enhanced design, stat cards, and content accuracy updates that were being developed for the primary deployment. Maintaining two divergent frontends would create confusion about which version is authoritative.

---

## [0.1.0] — 2026-03-14

### Initial Release — The Crosswalk Data Model

The initial commit established the core intellectual contribution of this project: a structured mapping between 10 OWASP ASI 2026 risks, 16 NIST 800-53 Rev 5 control families (90 total control references), 4 NIST AI-RMF functions (19 subcategories, 62 total category references), and real-world evidence citations for each risk. *(Superseded 2026-07-11: 89 control references after the withdrawn-control purge; 17 of 19 subcategories referenced.)*

The crosswalk was implemented as a single-page React application with three views: an 800-53 heatmap showing control density per ASI risk per family, an AI-RMF heatmap showing category coverage per ASI risk per function, and an evidence explorer providing full rationale text and incident citations for each mapping.

The data model was designed around the principle that **every mapping must carry a rationale** — not just a control ID, but an explanation of *why* that control mitigates that specific agentic AI risk. This distinguishes the crosswalk from simple lookup tables and makes it useful for auditors who need to justify control selection in their System Security Plans (SSPs) and Plans of Action and Milestones (POA&Ms).

---

## Design Principles

The following principles have guided every change documented above and will continue to guide future development:

**Transparent provenance.** Every editorial judgment is disclosed. Severity ratings are labeled as editorial. Scope exclusions are documented with rationale. The reader should never have to guess whether a data point is authoritative or interpretive.

**Dual-number reporting.** Aggregate statistics are always accompanied by their decomposition. "56 unique controls (90 total mappings)" *(superseded 2026-07-11: 54 unique controls, 89 total mappings)* is more honest than either number alone. Compliance dashboards that show only aggregates invite misinterpretation.

**Acknowledged omissions.** What the crosswalk *excludes* is as important as what it includes. The AT-family scope note in ASI09 and the heatmap scoping disclosure are examples of this principle in practice.

**Rationale-first mappings.** A control ID without a rationale is a compliance checkbox. A control ID with a rationale is a defensible audit position. Every mapping in this crosswalk carries an explanation of *why*, not just *what*.

**Legal clarity.** The AGPL-3.0 license and Terms of Service work together to keep the data open while protecting the developer's ability to operate a hosted service. This dual approach ensures the crosswalk remains a community resource without becoming a free input to proprietary compliance products.

---

*This changelog is maintained by the project contributors. For questions about specific decisions, open an issue referencing the Decision Point number.*
