# Critical UX Review — Maximum Depth

**Product:** Agentic AI Risks — Compliance Middleware Platform  
**Role Assumed:** Principal Design Critic & Product Strategist  
**Audit Scope:** Every screen, interaction, micro-state, visual hierarchy, cognitive load pattern, and architectural decision  
**Posture:** Unflinching. Not to shame — to present the superior product that exists inside the current one. The refactoring required is significant. The struggle is worth it.

---

## Executive Verdict

This product has genuine intellectual ambition. It attempts to make three dense compliance frameworks (OWASP ASI, NIST 800-53 Rev 5, NIST AI-RMF 100-1) not just legible but *interactive* — and then goes further by simulating failure cascades across them. That ambition is rare and valuable.

The execution, however, suffers from **density addiction** — the belief that showing more data equals more value. The result is a product that impresses on first glance and exhausts on second use. Every surface competes for attention. Nothing breathes. The user is never told "you can stop looking now."

What follows is a systematic audit of every major surface, organized by severity. Each finding includes the specific code-level evidence, the user impact, and the refactoring required.

---

## I. LANDING STATE & INFORMATION ARCHITECTURE

### 1.1 The Hero Banner Promises More Than It Delivers

**Evidence:** `Home.tsx` lines 463–499. A full-bleed background image with gradient overlay, a shield icon, the label "Compliance Middleware," a title "Agentic AI Risks," and a paragraph that includes an editorial disclaimer about severity ratings.

**The Problem:** The hero communicates *what the product is* but not *what the user should do*. There is no primary call-to-action. No "Start here." No indication of which tab matters most for which persona. The user lands and is immediately confronted with four stat cards (ASI Risks: 15, Unique 800-53 Controls: 67, Unique AI-RMF Categories: 25, Critical Risks: 4) that are informative but not actionable.

**Cognitive Load:** The editorial disclaimer ("Severity ratings are editorially assigned...") is defensive legal copy embedded in the hero. It signals uncertainty at the moment the product should signal authority.

**The Superior Version:** The hero should answer one question: "What do I do first?" A single sentence below the title — "Select a risk below to see which controls protect against it" — would reduce time-to-first-action by 5–10 seconds. The disclaimer belongs in the footer or a dedicated methodology page.

**Courage Required:** Removing the disclaimer from the hero feels risky because it was placed there for transparency. But transparency that creates hesitation is worse than transparency placed where curious users will find it.

---

### 1.2 The Stats Bar Is Decorative, Not Functional

**Evidence:** `StatCard` component (lines 238–259) renders 4 cards: ASI Risks (15), Unique 800-53 Controls (67), Unique AI-RMF Categories (25), Critical Risks (4).

**The Problem:** These numbers are static. They never change. They are not clickable. They do not filter anything. They exist to establish credibility — "look how much data we have" — but they occupy 25% of the above-the-fold viewport on desktop without enabling any user action.

**The Superior Version:** Either (a) make them clickable filters (clicking "Critical Risks: 4" should filter the heatmap to show only critical-severity rows), or (b) collapse them into a single inline sentence: "15 ASI risks mapped to 67 unique 800-53 controls and 25 AI-RMF categories." This recovers ~120px of vertical space.

**Courage Required:** The stats bar *looks* impressive. Removing it feels like losing perceived value. But perceived value that doesn't convert to user action is vanity.

---

### 1.3 Tab Navigation Has No Hierarchy

**Evidence:** `tabs` array (line 451–456) defines 4 equal-weight tabs: 800-53 Heatmap, AI-RMF Heatmap, Evidence Explorer, Scenario Simulator.

**The Problem:** All four tabs are presented with identical visual weight. But they serve fundamentally different purposes:
- **800-53 Heatmap** and **AI-RMF Heatmap** are *reference views* (read-only exploration)
- **Evidence Explorer** is a *search tool* (query-driven)
- **Scenario Simulator** is an *interactive tool* (generative, stateful)

Treating them as equals forces the user to understand all four before choosing. A new user has no mental model for why there are two heatmaps or what "Evidence Explorer" means in this context.

**The Superior Version:** Two-level navigation. Top level: "Explore" (heatmaps + evidence) and "Simulate" (scenario simulator). Within "Explore," sub-tabs for 800-53, AI-RMF, and Evidence. This creates a clear fork: "Are you here to look at data, or to run experiments?"

**Courage Required:** Restructuring navigation is the highest-risk refactor in any product. It breaks bookmarks, invalidates onboarding copy, and requires rethinking the URL structure. But the current flat structure will not scale if you add a fifth or sixth view.

---

## II. 800-53 HEATMAP — THE FLAGSHIP VIEW

### 2.1 The Heatmap Is Visually Successful But Interaction-Starved

**Evidence:** Lines 550–660. A 15-row × 16-column table with color-coded cells (density: 0, 1–2, 3, 4+). Column headers are rotated 90° with tooltips. Rows are clickable (navigate to Evidence Explorer).

**What Works:** The color gradient is legible. The rotated headers save horizontal space. The tooltip on hover provides family descriptions. The sticky left column prevents disorientation during horizontal scroll. The `scanline-overlay` pseudo-element adds subtle texture without reducing readability.

**What Doesn't Work:**

**2.1.1 — No sorting.** The rows are in ASI ID order (ASI01–ASI15). But the user's question is often "which risk has the most control coverage?" or "which risk has the least?" There is no way to sort by total density, by a specific column, or by severity.

**2.1.2 — No filtering.** The user cannot filter to show only Critical-severity risks, or only risks that have coverage in a specific family. The heatmap is always 15 rows × 16 columns regardless of the user's focus.

**2.1.3 — The click target is the entire row, but the affordance is invisible.** The `cursor-pointer` and `hover:bg-[rgba(59,130,246,0.08)]` are subtle. The `ChevronRight` icon only appears on hover (opacity-0 → opacity-100). A new user may not realize rows are clickable for 30+ seconds.

**2.1.4 — Clicking a row navigates away from the heatmap.** It switches to the Evidence Explorer tab with that ASI pre-selected. This is a *destructive navigation* — the user loses their position in the heatmap. There is no "back" button, no breadcrumb, no way to return to the exact scroll position they left.

**The Superior Version:** (a) Add a sort dropdown above the table (by ID, by total density, by severity). (b) Add a severity filter (show only Critical/High/Medium-High). (c) Make the click action open a *slide-over panel* (like the AnalysisPanel in the Simulator) rather than navigating away. (d) Add a visible "View Details →" affordance in the last column.

**Courage Required:** The current "click row → switch tab" pattern was the simplest implementation. Replacing it with a slide-over panel means building a new component and managing a new state. But the payoff is enormous: users can explore details without losing context.

---

### 2.2 The Column Headers Are Hostile to Non-Experts

**Evidence:** Column headers display only the 2-letter family code (AC, AU, CA, CM...) in 9px rotated monospace text. The tooltip provides the full name and description, but only on hover.

**The Problem:** A user who doesn't already know what "SC" means must hover over every column to build a mental map. The tooltip disappears on mouse-leave, so they cannot compare two column descriptions simultaneously. On mobile/touch devices, the tooltips are unreachable.

**The Superior Version:** Replace the 2-letter codes with abbreviated names that fit in the rotated space: "Access Ctrl", "Audit", "Config Mgmt", etc. Keep the tooltip for the full description. This reduces the hover-dependency from "required to understand" to "optional for depth."

---

### 2.3 The Legend Is Afterthought-Positioned

**Evidence:** Lines 642–659. The density legend (0, 1–2, 3, 4+) appears *below* the table.

**The Problem:** The user encounters the colored cells before they encounter the legend. They must scroll past the entire table to learn what the colors mean, then scroll back up to interpret the data. This is backwards.

**The Superior Version:** Position the legend *above* the table, inline with the section heading. It occupies one line and provides the decoding key before the user needs it.

---

## III. AI-RMF HEATMAP

### 3.1 Structural Parity With 800-53 Creates False Equivalence

**Evidence:** Lines 663–778. The AI-RMF heatmap has the same structure as the 800-53 heatmap but with only 4 columns (GOVERN, MAP, MEASURE, MANAGE) instead of 16.

**The Problem:** A 15-row × 4-column table does not need a heatmap. It needs a *bar chart* or a *stacked comparison*. The heatmap format was designed for high-dimensional data (many columns). With only 4 columns, the visual encoding is wasteful — the user's eye has to scan 60 cells when the information could be conveyed in a single stacked bar per row.

**The Superior Version:** Replace the table with a horizontal stacked bar chart. Each row (ASI risk) gets one bar divided into 4 colored segments (GOVERN, MAP, MEASURE, MANAGE). The bar length represents total coverage. This communicates both absolute and relative coverage in a single glance.

**Courage Required:** This means admitting that the 800-53 and AI-RMF views need *different* visual treatments despite being conceptually parallel. Structural consistency is a design principle, but it should not override perceptual efficiency.

---

### 3.2 The Subcategory Legend Below Is Excellent But Buried

**Evidence:** Lines 751–778. A 4-column grid showing each AI-RMF function with its subcategories listed.

**What Works:** This is genuinely useful. It provides the full taxonomy in a scannable format with color coding.

**What Doesn't Work:** It appears *below* the heatmap, so users who don't scroll past the table never see it. It should be the *first* thing shown — as a "key" or "legend" — before the data table.

---

## IV. EVIDENCE EXPLORER

### 4.1 The Search Bar Has a Red Placeholder — Why?

**Evidence:** Lines 804–820. The search icon and placeholder text are styled with `color: '#dc2626'` (red). A global style override forces `input::placeholder { color: #dc2626 !important; font-style: italic; font-weight: 500; }`.

**The Problem:** Red universally signals error, danger, or required-field-not-filled. Using it for a neutral placeholder creates a false alarm on every page load. The user's first instinct is "something is wrong" rather than "I should type here."

**The Superior Version:** Use `#64748B` (the caption color already defined in the design system) for the placeholder. Reserve red exclusively for error states.

**Courage Required:** None. This is a 2-line fix. The fact that it hasn't been fixed suggests it was an intentional design choice that should be reconsidered.

---

### 4.2 The ASI Selector Pills Are Overwhelming

**Evidence:** Lines 909–924. Fifteen `button` elements in a flex-wrap layout, each showing an ASI ID (ASI01–ASI15) in monospace.

**The Problem:** Fifteen identical-looking pills with cryptic IDs (ASI01, ASI02...) provide no semantic information. The user must already know what ASI07 means to decide whether to click it. The pills are a navigation mechanism that requires pre-existing knowledge to use.

**The Superior Version:** Replace pills with a searchable dropdown or a grouped list (grouped by severity: Critical → High → Medium-High). Show the risk *name* alongside the ID: "ASI01 — Hallucination & Confabulation." If space is a concern, show the top 5 most-searched risks as quick-access pills and put the rest in a "More..." dropdown.

---

### 4.3 The Empty State Is Passive

**Evidence:** Lines 1015–1024. When no ASI is selected, a centered Shield icon with "Select an ASI risk above to explore its crosswalk."

**The Problem:** The empty state tells the user what to do but doesn't help them decide *which* ASI to select. It's a dead end that requires the user to already have a question in mind.

**The Superior Version:** Show a "most explored" or "start with" suggestion: "New here? Start with ASI01 (Hallucination) — the most common agentic AI failure mode." Or show a random-rotation of "Did you know?" facts that link to specific ASI risks.

---

### 4.4 The Two-Column Layout (800-53 / AI-RMF) Is Correct But Unlinked

**Evidence:** Lines 953–998. When an ASI is selected, the detail view shows two columns: NIST 800-53 controls on the left, AI-RMF categories on the right.

**What Works:** The parallel structure makes the dual-framework nature of the crosswalk immediately visible. The `MappingCard` component with its left-border accent is clean and scannable.

**What Doesn't Work:** There is no visual connection between a specific 800-53 control and its corresponding AI-RMF category. The user cannot see "AC-3 (Access Enforcement) relates to GOVERN GV-1 (Policies & Processes)" without reading both columns and making the connection mentally. The two columns are *parallel* but not *linked*.

**The Superior Version:** Add hover-highlighting: when the user hovers over a specific control in the left column, highlight the corresponding AI-RMF categories in the right column (and vice versa). This transforms the view from "two independent lists" to "an interactive crosswalk."

---

## V. SCENARIO SIMULATOR

### 5.1 The Onboarding Is Mechanically Sound But Narratively Weak

**Evidence:** `OnboardingController.tsx` lines 229–255. Phase copy:
- Step 1: "Set the Parameters" / "We've pre-selected a standard scenario..."
- Step 2: "The Crosswalk in Action" / "The Red X shows you exactly which NIST 800-53 control family is broken..."
- Step 3: "Track the Contagion" / "Risk isn't static..."

**What Works:** The auto-scroll between steps is excellent. The user never needs to discover scroll positions. The MutationObserver pattern for waiting on DOM elements is technically robust.

**What Doesn't Work:**

**5.1.1 — The copy is explanatory, not motivational.** It tells the user *what they're seeing* but not *why they should care*. "The Red X shows you exactly which NIST 800-53 control family is broken" is a description. "This is the gap your auditor will find" is a motivation.

**5.1.2 — The onboarding generates a scenario *for* the user.** The `registerGenerateHandler` pre-selects "Erroneous + Sequential + Standard" and auto-generates. This means the user's first experience is *watching*, not *doing*. They didn't choose the parameters. They didn't click Generate. They have no ownership of the result.

**5.1.3 — There is no "why this matters" framing.** The HookModal says "Compliance Middleware" and "Run First Simulation." But it doesn't say "In 30 seconds, you'll see exactly how a hallucinating AI agent breaks 7 NIST controls simultaneously." The hook should create anticipation, not just describe the tool.

**The Superior Version:** (a) Rewrite all onboarding copy to be outcome-oriented: "After this, you'll know which controls to prioritize." (b) Let the user click Generate themselves — the spotlight should highlight the button and *wait* for the click, not auto-fire. (c) Add a "why" sentence to the HookModal: "See how one AI failure cascades into a compliance gap your team hasn't planned for."

---

### 5.2 The Guided Mode Is Excellent But the Random Mode Is Pointless

**Evidence:** Lines 461–476. A toggle between "Random" and "Guided" mode.

**The Problem:** Random mode generates a scenario with no user input. The user clicks Generate and gets... something. They have no hypothesis, no expectation, no basis for interpreting the result. It's a slot machine. The only users who benefit from Random mode are those who have already used Guided mode enough to understand the parameter space and want to be surprised.

**The Superior Version:** Default to Guided mode. Move Random to a secondary position (smaller button, or a "Surprise me" link below the Guided controls). Better yet: rename "Random" to "Surprise Me" — this signals that it's a secondary, playful option rather than a primary workflow.

---

### 5.3 The Summary Cards Compete With the Heatmap for Attention

**Evidence:** Lines 570–594. Four summary cards (Risk Category, Archetype, Broken Controls, Active Controls) appear above the heatmap.

**The Problem:** The cards and the heatmap both show control state information. The cards show aggregate numbers; the heatmap shows per-cell detail. But they're rendered at the same visual weight, creating a "which one should I look at?" moment. The cards are also static after generation — they don't update, respond to hover, or link to anything.

**The Superior Version:** Reduce the cards to a single inline summary bar: "Erroneous × Sequential — 7 broken / 42 active / 31 N/A across 5 families." This frees vertical space and makes the heatmap the unambiguous primary visualization.

---

### 5.4 The Cascade Topology Graph Is Technically Impressive But Semantically Opaque

**Evidence:** `CascadeGraph.tsx` (362 lines). An SVG force-directed graph with nodes (controls/agents), edges (propagation paths), and a timeline replay slider.

**The Problem:** The graph shows *that* a cascade happened, but not *what it means*. Nodes are labeled with family codes (AC, SI, IR...) but not with human-readable descriptions. The edges show propagation direction but not *why* the failure propagated. The replay advances through steps but doesn't explain what each step represents.

**The Superior Version:** (a) Add a one-sentence annotation per replay step: "Step 2: AC failure propagates to SI because access control is a prerequisite for system integrity." (b) On node hover, show the full family name and the specific control that failed. (c) Add a "What am I looking at?" expandable explanation above the graph.

---

### 5.5 The Dynamic Heatmap Is the Product's Best Feature — But It's Below the Fold

**Evidence:** Lines 632–701. The interactive heatmap with clickable cells that open the AnalysisPanel.

**What Works:** The cell interaction model (click → slide-in panel with causal analysis) is the single best UX pattern in the entire product. It provides depth without navigation. It maintains context. It rewards curiosity.

**What Doesn't Work:** On a standard 1080p display, the heatmap is below the fold after a scenario is generated. The user must scroll past the summary cards, the outcome banner, and the cascade topology to reach it. The most interactive and valuable component is buried.

**The Superior Version:** Invert the order. Show the heatmap *first* (immediately after the summary bar), then the cascade topology (collapsible, default-collapsed), then the bias chart and implicated risks. The heatmap is the "what" — the cascade is the "why." Users need "what" before "why."

---

### 5.6 The AnalysisPanel Is Good But Has No Exit Affordance

**Evidence:** `AnalysisPanel.tsx` (239 lines). A slide-in right drawer with causal explanation, broken/active controls, and a deep-link to Evidence Explorer.

**The Problem:** The panel slides in from the right, but there is no visible close button in the panel header. The user must click outside the panel or press Escape to dismiss it. This is a discoverability failure — users who don't know the convention will feel trapped.

**The Superior Version:** Add an explicit "×" close button in the panel header, top-right corner. This is a 5-line fix with outsized impact on perceived polish.

---

### 5.7 The Automation Bias Chart Is Interesting But Disconnected

**Evidence:** Lines 744–762. A collapsible section showing a line chart of human oversight accuracy degradation over action count.

**The Problem:** The chart is visually interesting but has no connection to the scenario's actual parameters. It always shows the same curve shape regardless of archetype or governance posture. The "spike at action 12" is described in the label text but not explained in terms of the current scenario. It feels like a static educational illustration rather than a dynamic simulation output.

**The Superior Version:** Either (a) make the curve responsive to the scenario parameters (Swarm should degrade faster than Single; Full governance should degrade slower than Minimal), or (b) explicitly label it as "Reference Model" and move it to a separate "Learn" section rather than embedding it in the simulation output.

---

## VI. CROSS-TAB FLOWS & STATE COHERENCE

### 6.1 The ScenarioContext Claims Persistence But Doesn't Persist

**Evidence:** `ScenarioContext.tsx`. The header comment says "persists state across all tabs." The implementation uses React state (`useState`) with no `localStorage` or `sessionStorage` write. If the user refreshes the page, all scenario state is lost.

**The Problem:** This is a broken contract. The architecture was designed for persistence (the context exists, the types support serialization), but the implementation never writes to storage. A user who generates a scenario, switches to Evidence Explorer, and then refreshes loses everything.

**The Superior Version:** Add `sessionStorage` serialization on every `setActiveScenario` call. Hydrate from `sessionStorage` on mount. This is a 15-line fix that fulfills the architectural promise.

---

### 6.2 The Deep-Link From Simulator to Evidence Explorer Works But Is One-Way

**Evidence:** `Home.tsx` lines 282–289. The `pendingEvidenceFilter` triggers a tab switch and ASI selection.

**The Problem:** The user can navigate from Simulator → Evidence Explorer, but not back. After viewing the evidence for a specific ASI, there is no "Return to Simulator" button. The user must manually click the Simulator tab and re-generate their scenario (which is lost because state doesn't persist — see 6.1).

**The Superior Version:** (a) Fix persistence (6.1). (b) Add a "← Back to Scenario" breadcrumb in the Evidence Explorer when the user arrived via deep-link.

---

### 6.3 The Onboarding's Tab-Switching Is Invisible to the User

**Evidence:** `OnboardingController.tsx` line 136: `switchToSimulator()`. This programmatically changes the active tab without any visual transition or explanation.

**The Problem:** The user clicks "Run First Simulation" in the HookModal and suddenly the entire page content changes (from the heatmap to the simulator). There is no animation explaining that a tab switch occurred. The user may not even notice they're now on a different tab.

**The Superior Version:** Add a brief (200ms) highlight animation on the "Scenario Simulator" tab when the onboarding switches to it. A pulse or border-flash that draws the eye to the tab bar and communicates "we moved you here."

---

## VII. VISUAL SYSTEM & DESIGN LANGUAGE

### 7.1 Two Design Systems Coexist Without Resolution

**Evidence:** `Home.tsx` header comment: "Command Center — Military-Grade Intelligence Dashboard." `ScenarioSimulator.tsx` header comment: "Swiss/Bauhaus Design System: Slate + Cobalt Blue."

**The Problem:** The product has two named design philosophies applied to different sections. The heatmaps use a "military command center" aesthetic (scanline overlays, glow effects, dense information). The simulator uses a "Swiss/Bauhaus" aesthetic (geometric data presentation, clean grid structures). These are not the same thing. The result is subtle visual inconsistency: the heatmap cells have scanline textures; the simulator cells don't. The heatmap uses `glow-blue` effects; the simulator uses flat borders.

**The Superior Version:** Choose one. The Swiss/Bauhaus system is more scalable and accessible. Retire the scanline overlay and glow effects. They add visual noise without information value.

---

### 7.2 The Toast System Is Architecturally Fragmented

**Evidence:** `ScenarioSimulator.tsx` lines 102–115: a manual DOM-injection toast (`showToast`). `App.tsx`: mounts `<Toaster />` from sonner. `ui/sonner.tsx`: imports `useTheme` from `next-themes` (a library not used elsewhere in the app's active theme system).

**The Problem:** There are two independent toast systems:
1. A hand-rolled DOM toast in the Simulator (creates/removes DOM elements directly)
2. A sonner-based toast system mounted globally but wired to `next-themes` instead of the app's actual `ThemeContext`

The hand-rolled toast exists because the developer needed a toast inside a component that predated the sonner integration. But now both coexist, creating maintenance burden and inconsistent notification behavior.

**The Superior Version:** Remove the hand-rolled toast. Replace all `showToast()` calls with sonner's `toast()` function. Fix the sonner theme integration to use the app's actual theme context. This unifies all user feedback into one system.

---

### 7.3 The Error Boundary Is Engineering-Facing, Not User-Facing

**Evidence:** `ErrorBoundary.tsx` (62 lines). On crash: shows `AlertTriangle`, prints `error.stack` in a `<pre>` block, offers "Reload Page."

**The Problem:** A compliance professional encountering a crash sees a raw stack trace. This is appropriate for a development build but inappropriate for a product that positions itself as "military-grade."

**The Superior Version:** Show a branded error state: "Something went wrong. Your scenario data has been preserved. [Reload] [Report Issue]." Log the stack trace to console but don't display it.

---

## VIII. ACCESSIBILITY & RESPONSIVE BEHAVIOR

### 8.1 The Heatmaps Are Inaccessible on Mobile

**Evidence:** The 800-53 heatmap is a 15×16 table with 36px-wide cells. Total minimum width: ~576px + 180px sticky column = 756px. On a 375px mobile viewport, the user must scroll horizontally through 380px of hidden content.

**The Problem:** The `heatmap-scroll-container` class adds a fade gradient on the right edge when overflow is detected. This is a good affordance. But the fade only appears when `has-overflow` class is toggled — and the toggle depends on a `resize` event listener. On initial mobile load, the class may not be applied until after the first resize event.

**The Superior Version:** (a) Default `has-overflow` to true on viewports < 768px. (b) Consider a mobile-specific view that shows the heatmap as a vertical list (one ASI per card, with a mini bar chart of family coverage) rather than forcing horizontal scroll.

---

### 8.2 Keyboard Navigation Is Incomplete

**Evidence:** Heatmap rows have `tabIndex={0}` and `onKeyDown` handlers for Enter/Space. But the simulator's heatmap cells have no `tabIndex` — they're only clickable via mouse. The cascade graph nodes are SVG elements with no keyboard accessibility.

**The Superior Version:** Add `tabIndex={0}` and `role="button"` to all interactive heatmap cells in the simulator. Add `aria-label` descriptions to cascade graph nodes. Add keyboard navigation (arrow keys) within the heatmap grid.

---

### 8.3 The Onboarding Spotlight Has No Mobile Breakpoint

**Evidence:** `SpotlightTooltip.tsx` positions tooltips using fixed pixel offsets from the target rect. There is no viewport-width check or position-flip logic.

**The Problem:** On a 375px viewport, a tooltip positioned to the "right" of a target element will overflow off-screen. The scrim's SVG mask cutout will also be incorrectly sized if the target element wraps to a different position on mobile.

**The Superior Version:** Add a responsive position calculation: if the tooltip would overflow the viewport, flip to "bottom" (which always has space on mobile since the target is scrolled into view with offset).

---

## IX. PERFORMANCE & PERCEIVED SPEED

### 9.1 The Search Index Is Built on Every Mount

**Evidence:** `Home.tsx` lines 292–360. A `useMemo` with empty dependency array builds a flat array of all controls on first render.

**What Works:** The empty dependency array means it only runs once. The search itself is a simple `.filter()` on the pre-built array.

**What Could Be Better:** The index construction iterates over all ASI risks, all NIST families, and all AI-RMF functions — producing ~200+ entries. This is fast enough for 15 ASI risks, but if the dataset grows (OWASP adds more risks, more controls are mapped), the linear scan in `searchResults` will become perceptible. Consider pre-computing a trigram index or using a lightweight search library (e.g., Fuse.js) if the dataset exceeds 500 entries.

---

### 9.2 Framer Motion AnimatePresence on Tab Switches Is Unnecessary

**Evidence:** Lines 528–536. Every tab switch triggers an opacity fade (0 → 1, duration 0.15s).

**The Problem:** 150ms is fast enough to be imperceptible as a deliberate animation but slow enough to feel sluggish compared to an instant swap. The user clicked a tab — they expect immediate content. The fade adds latency without adding meaning.

**The Superior Version:** Remove the AnimatePresence wrapper on tab content. Use instant swaps. Reserve animation for *meaningful* transitions (panel slide-ins, scenario generation feedback, onboarding spotlights).

---

## X. PRIORITIZED REMEDIATION ROADMAP

### Tier 1 — Ship This Week (High Impact, Low Effort)

| # | Fix | Effort | Impact |
|---|---|---|---|
| 1 | Move heatmap legend above the table | 5 min | Eliminates "what do the colors mean?" confusion |
| 2 | Change search placeholder from red to slate | 2 min | Removes false error signal |
| 3 | Add close button to AnalysisPanel | 5 min | Eliminates "how do I dismiss this?" friction |
| 4 | Add sessionStorage persistence to ScenarioContext | 15 min | Fulfills the architectural promise |
| 5 | Remove AnimatePresence from tab switches | 5 min | Instant-feeling navigation |
| 6 | Default to Guided mode in Simulator | 2 min | Reduces "what does Random do?" confusion |
| 7 | Replace hand-rolled toast with sonner | 20 min | Unifies feedback system |

### Tier 2 — Ship This Month (Medium Effort, High Impact)

| # | Fix | Effort | Impact |
|---|---|---|---|
| 8 | Add sort/filter to 800-53 heatmap | 2 hrs | Transforms passive reference into active tool |
| 9 | Replace AI-RMF table with stacked bar chart | 3 hrs | Matches visualization to data dimensionality |
| 10 | Add "Back to Scenario" breadcrumb in Evidence Explorer | 1 hr | Completes the navigation loop |
| 11 | Rewrite onboarding copy to be outcome-oriented | 1 hr | Increases completion rate |
| 12 | Invert Simulator layout (heatmap first, cascade second) | 30 min | Surfaces the best feature |
| 13 | Add per-step annotations to cascade replay | 2 hrs | Makes the graph interpretable |
| 14 | Unify design system (retire scanlines, choose Swiss) | 3 hrs | Visual coherence |

### Tier 3 — Ship Next Quarter (High Effort, Transformative)

| # | Fix | Effort | Impact |
|---|---|---|---|
| 15 | Replace heatmap row-click with slide-over panel | 1 week | Context-preserving exploration |
| 16 | Add cross-column highlighting in Evidence Explorer | 3 days | Makes the crosswalk *visible* |
| 17 | Mobile-specific heatmap view (card-based) | 1 week | Opens mobile as a viable platform |
| 18 | Make bias chart responsive to scenario parameters | 3 days | Transforms decoration into simulation |
| 19 | Two-level navigation (Explore / Simulate) | 1 week | Scales to future views |
| 20 | Branded error boundary with recovery | 2 hrs | Professional failure handling |

---

## XI. THE SINGLE MOST IMPORTANT CHANGE

If you make only one change from this entire review, make it this:

> **Add `sessionStorage` persistence to `ScenarioContext` and a "← Back to Scenario" link in Evidence Explorer.**

This single change (30 minutes of work) transforms the product from "a collection of independent views" into "a coherent workflow." Right now, the Simulator and Evidence Explorer are islands. With persistence and back-navigation, they become a *loop*: generate → explore → understand → generate again. That loop is where learning happens. That loop is the product.

---

## XII. ACKNOWLEDGMENT

The architectural decisions already made — the cascade graph, the onboarding system, the AnalysisPanel pattern, the dual-framework crosswalk, the bias model — represent genuine product thinking. These are not features that emerge from "make it look nice." They emerge from someone who understands that compliance is a *reasoning problem*, not a *reading problem*.

The refactoring required to reach the superior version is significant. It requires admitting that some early decisions (flat tabs, row-click navigation, dual design systems) were expedient rather than optimal. That admission is not failure — it's the natural consequence of building fast and learning what works.

The product that exists inside this codebase is better than the product currently rendered on screen. The gap is not talent or vision. The gap is editing — the willingness to remove what doesn't serve the user, even when it was hard to build.

The struggle is worth it.
