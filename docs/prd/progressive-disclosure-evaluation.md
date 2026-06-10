# Progressive Disclosure Evaluation

**Product:** Agentic AI Risks — Compliance Middleware  
**Role Assumed:** Information Architect & Cognitive Load Specialist  
**Question:** Should the product adopt a progressive disclosure model, revealing complexity only when the user has demonstrated readiness?

---

## The Current Model: Flat Dashboard

The product currently presents all four views (800-53 Heatmap, AI-RMF Heatmap, Evidence Explorer, Scenario Simulator) as equal-weight tabs available from the first pixel. The default landing is the 800-53 Heatmap — a 15×16 dense matrix with rotated column headers, severity badges, and scanline textures. The user encounters maximum complexity at the moment of minimum context.

This is the **"expert cockpit" pattern**: assume the user knows what they're looking for, give them all the instruments, let them self-navigate. It works when the audience is exclusively compliance professionals who already understand NIST family codes and OWASP ASI identifiers. It fails when the audience includes security engineers, product managers, or executives who need to *build* that understanding before they can use the tools.

---

## The Case FOR Progressive Disclosure

### Argument 1: The Data Has Natural Layers

The product's data architecture already has a clear hierarchy:

```
Layer 0: "15 AI risks exist. 4 are Critical."
Layer 1: "Each risk maps to specific NIST 800-53 control families."
Layer 2: "Each mapping has a rationale and real-world evidence."
Layer 3: "Failures cascade across agents in predictable patterns."
Layer 4: "You can simulate and compare those patterns."
```

The current UI exposes Layers 1–4 simultaneously. But the user's comprehension must proceed 0 → 1 → 2 → 3 → 4. There is no shortcut. A user who doesn't understand Layer 0 ("what are the 15 risks?") cannot meaningfully interpret Layer 1 (the heatmap). A user who hasn't internalized Layer 2 (evidence) cannot evaluate Layer 4 (simulation results).

### Argument 2: The Onboarding Already Proves the Point

The existing onboarding system (HookModal → Spotlight → Handoff) is *already* progressive disclosure — but scoped only to the Simulator tab. It works because it reveals one concept at a time: "here's the config" → "here's what broke" → "here's how it spread." The product-level navigation doesn't apply the same principle.

### Argument 3: The Cognitive Load Budget

A compliance professional's cognitive load budget is not infinite. The current landing state demands the user simultaneously process:
- A hero banner with 4 stat cards (4 numbers to interpret)
- A tab bar with 4 options (4 labels to evaluate)
- A 15×16 heatmap (240 cells to scan)
- Rotated column headers in 2-letter codes (16 abbreviations to decode)
- Severity badges with 3 levels (a color system to learn)
- Row-click affordances (an interaction model to discover)

That's ~270 discrete information units before the user has taken a single action. The cognitive science literature suggests working memory holds 4±1 chunks. We're asking for 270.

---

## The Case AGAINST Progressive Disclosure

### Counter-Argument 1: Expert Users Hate Gating

If the primary audience is compliance professionals who already know NIST families, forcing them through a "learn the basics" flow is patronizing and slow. They want the cockpit. They want all instruments visible. They'll leave if they have to click through a tutorial to reach the heatmap.

### Counter-Argument 2: The Product Is Already Small

With only 4 tabs and 15 risks, the total surface area is bounded. This isn't a 200-feature enterprise platform. A skilled user can learn the entire interface in 5 minutes. Progressive disclosure adds navigation overhead that may exceed the comprehension overhead it removes.

### Counter-Argument 3: SEO and Shareability

If the heatmap is hidden behind a disclosure gate, it can't be directly linked to or indexed. A compliance officer who wants to share "look at the ASI08 row" needs a direct URL to the heatmap, not a URL that starts them at a summary view.

---

## The Verdict: Hybrid Model

Neither pure flat-dashboard nor pure progressive-disclosure is correct. The optimal approach is a **hybrid** that provides:

1. A **summary landing** that orients without overwhelming
2. **Direct access** to all views for returning users
3. **Contextual revelation** within each view

Here is the specific architecture:

---

## Proposed Architecture: "Overview → Drill → Simulate"

### Level 0: The Overview (New Default Landing)

Replace the 800-53 Heatmap as the default tab with a new **Overview** view. This view shows:

**A. The Risk Roster** — A vertical list of all 15 ASI risks, each as a compact card:
```
┌─────────────────────────────────────────────────────┐
│ ASI01  Agent Goal Hijack                   Critical  │
│ Attackers redirect agent objectives through...       │
│ ──────────────────────────────────────────────────── │
│ 800-53: 5 families, 12 controls                     │
│ AI-RMF: 3 functions, 8 categories                   │
│                                     [Explore →]      │
└─────────────────────────────────────────────────────┘
```

Each card answers: "What is this risk? How much coverage does it have? Where do I go deeper?"

**B. A Single Sentence of Orientation:**
> "15 agentic AI risks. Each one mapped to NIST 800-53 controls and AI-RMF categories. Click any risk to see the evidence, or use the tabs above for the full heatmap and simulator."

**C. A "Quick Start" Prompt:**
> "New here? → [Run a Scenario] to see how one failure cascades across your control framework."

**Why this works:** It gives the user Layer 0 ("what are the 15 risks?") without requiring them to decode a heatmap. It provides an exit to every deeper view. It respects experts by keeping the tab bar visible — they can skip directly to the heatmap or simulator.

---

### Level 1: The Heatmaps (Existing, Unchanged)

The 800-53 and AI-RMF heatmaps remain as they are, accessible via tabs. They are the "expert view" for users who already understand the risk landscape and want to see density patterns.

**One change:** Add a "What am I looking at?" collapsible explainer at the top of each heatmap (default-collapsed for returning users, default-expanded on first visit). This is not a gate — it's a lifeline.

---

### Level 2: The Evidence Explorer (Existing, Unchanged)

The Evidence Explorer remains as-is. But clicking "Explore →" on a risk card in the Overview should navigate directly here with that ASI pre-selected. This creates a natural flow: Overview → Evidence → (optionally) Simulator.

---

### Level 3: The Scenario Simulator (Existing, with Onboarding)

The Simulator remains as the most complex view, gated by its existing onboarding for first-time visitors. No additional disclosure needed — the onboarding already handles it.

---

## The Disclosure Trigger Points

The key question is: **when does each view become available?**

| View | Availability | Rationale |
|---|---|---|
| Overview | Always (default landing) | Zero-knowledge entry point |
| 800-53 Heatmap | Always (tab) | Expert shortcut, no gate |
| AI-RMF Heatmap | Always (tab) | Expert shortcut, no gate |
| Evidence Explorer | Always (tab + card link) | Accessible from Overview cards |
| Scenario Simulator | Always (tab) | Onboarding handles disclosure internally |

**Critical decision:** The tabs are NOT gated. All views are always accessible. The progressive disclosure happens through the *default landing* and the *information hierarchy within each view* — not through locking views behind prerequisites.

This is the distinction between **progressive disclosure** (reveal complexity gradually) and **progressive onboarding** (lock features until earned). The former respects user agency. The latter frustrates experts.

---

## What Changes In Practice

### Change 1: New Default View — "Overview"

A new `ViewType = "overview"` becomes the default. It renders the Risk Roster (15 cards in a responsive grid). Each card links to Evidence Explorer with that ASI pre-selected.

**Effort:** 2–3 hours. One new component (~150 lines), one state change in Home.tsx.

### Change 2: Tab Bar Gets a Fifth Tab (or Restructured)

Option A: Add "Overview" as the first tab (5 tabs total).  
Option B: Restructure to "Overview | Heatmaps ▾ | Evidence | Simulator" where Heatmaps is a dropdown containing both 800-53 and AI-RMF.

**Recommendation:** Option B. It reduces tab count from 5 to 4, groups the two heatmaps (which are structurally identical), and makes the hierarchy visible.

**Effort:** 1 hour for the dropdown, 30 min for the restructure.

### Change 3: "What Am I Looking At?" Explainer in Heatmaps

A collapsible section at the top of each heatmap that explains the axes, the color encoding, and the interaction model. Default-expanded on first visit (tracked via localStorage), default-collapsed thereafter.

**Effort:** 30 minutes per heatmap.

### Change 4: Overview Cards Link to Evidence Explorer

Clicking "Explore →" on a risk card sets `selectedASI` and switches to the Evidence Explorer tab.

**Effort:** 15 minutes. Reuses the existing `setSelectedASI` + `setView("detail")` pattern.

---

## What Does NOT Change

- The heatmaps remain dense. They are the expert view. They should not be simplified.
- The Simulator remains complex. Its internal onboarding handles disclosure.
- The Evidence Explorer remains search-first. It serves a query-driven workflow.
- No views are locked, gated, or hidden behind progress requirements.

---

## The Minimalist Principle Applied

The minimalist approach is not "show less." It is "show the right thing at the right time." The current product shows the *most complex* thing (a 240-cell heatmap) at the *earliest* time (first load). The proposed model shows the *simplest* thing (a list of 15 named risks) at the earliest time, and lets the user choose their depth.

This is the difference between:
- **Current:** "Here's everything. Figure out what matters."
- **Proposed:** "Here are 15 risks. Which one concerns you? Let's go deeper on that one."

The second model respects the user's time, reduces cognitive load, and still provides full expert access via the tab bar. It is progressive without being patronizing.

---

## Counterfactual That Collapses This Approach

> **If the primary audience is exclusively NIST auditors who arrive with a specific control ID in mind (e.g., "I need to check AC-3 coverage"), then the Overview is a speed bump.**

In that scenario, the correct default landing is the Evidence Explorer with the search bar focused — because the user's intent is query-driven, not exploratory. The Overview serves exploratory users ("what risks exist?") but not lookup users ("show me AC-3").

**Mitigation:** If analytics show >60% of sessions begin with a search query, make Evidence Explorer the default landing instead of Overview. The architecture supports either default without structural changes.

---

## Summary Decision Matrix

| User Type | Current Experience | Proposed Experience | Delta |
|---|---|---|---|
| First-time visitor | Sees 240-cell heatmap, confused | Sees 15 risk cards, oriented | +++ |
| Compliance professional | Tabs to heatmap immediately | Tabs to heatmap immediately | Neutral |
| Executive / manager | Overwhelmed, leaves | Reads risk roster, clicks one | ++ |
| Security engineer | Explores tabs randomly | Follows Overview → Evidence → Simulate | + |
| Returning user with bookmark | Lands on heatmap (current default) | Lands on Overview, clicks tab | – (minor) |

The only user who is slightly worse off is the returning user with a bookmarked default tab. This is mitigated by URL-based tab persistence (add `?tab=matrix` support).

---

## Implementation Priority

1. **Build the Overview component** (Risk Roster cards) — 2 hours
2. **Add "overview" as default ViewType** — 15 minutes
3. **Restructure tabs** (Overview | Heatmaps ▾ | Evidence | Simulator) — 1 hour
4. **Add "What am I looking at?" collapsible to heatmaps** — 1 hour
5. **Add URL-based tab persistence** (`?tab=matrix`) — 30 minutes

**Total: ~5 hours of implementation for a fundamentally different first-impression experience.**

---

## The Courage Statement

The courage here is admitting that the heatmap — the product's most visually impressive artifact — is not the right *first* thing to show. It's the right *second* thing. The Overview is less visually dramatic but more cognitively appropriate. Choosing cognitive appropriateness over visual impressiveness is the mark of a product that prioritizes users over demos.
