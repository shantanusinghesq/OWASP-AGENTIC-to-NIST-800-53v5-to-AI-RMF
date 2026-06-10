# Implementation Plan: Progressive Disclosure UX Overhaul

**Role:** Lead Product Engineer & Architect  
**Scope:** Restructure the default landing experience from flat-dashboard (800-53 Heatmap) to progressive-disclosure (Overview → Drill-Down)  
**Timeline:** 5–6 hours of implementation + 1 hour testing = 6–7 hours total  
**Risk Level:** Medium (changes default UX, but all views remain accessible; rollback is 1 commit)

---

## Executive Summary

The product currently lands users on a 240-cell NIST 800-53 heatmap with zero context. This memo proposes:

1. **New Overview view** — 15 risk cards (name, severity, coverage, "Explore →" link)
2. **Restructured tab bar** — Overview | Heatmaps ▾ | Evidence | Simulator (4 tabs, one dropdown)
3. **URL-based tab persistence** — `?tab=matrix` to support bookmarks
4. **Collapsible explainers** — "What am I looking at?" in each heatmap (default-expanded first visit)

**Devaluations from the evaluation memo:**
- ❌ Do NOT gate or lock any views
- ❌ Do NOT hide the heatmaps behind a tutorial
- ❌ Do NOT remove expert shortcuts (tab bar remains fully visible)
- ✅ DO make the default landing cognitively appropriate for first-time visitors
- ✅ DO preserve direct access for returning users and experts

---

## Decision Point 1: What Is the "Overview" View?

### Option A: Risk Roster (Recommended)
A vertical list of 15 risk cards, each showing:
- Risk ID + Name (e.g., "ASI01 Agent Goal Hijack")
- Severity badge (Critical/High/Medium-High)
- One-line description
- Coverage summary ("5 NIST families, 12 controls | 3 AI-RMF functions, 8 categories")
- "Explore →" CTA that navigates to Evidence Explorer with that ASI pre-selected

**Pros:**
- Minimal cognitive load (one risk per card, no matrix)
- Clear navigation path (card → Evidence → optionally Simulator)
- Respects the data hierarchy (Layer 0 before Layer 1)
- Reuses existing ASI data structure

**Cons:**
- Adds a new view (more code to maintain)
- Requires computing coverage counts (5 NIST families per ASI)
- Slightly longer than a single-screen heatmap

**Decision:** ✅ **PROCEED with Option A**

### Option B: Minimalist Summary
A single hero section with 4 stats (15 risks, X unique controls, Y AI-RMF categories, Z critical) + a "Choose a risk" dropdown.

**Pros:**
- Minimal code (one component, ~80 lines)
- Fast to build

**Cons:**
- Dropdown is a worse affordance than cards for discovery
- Loses the "one risk per card" visual chunking
- Doesn't show severity at a glance

**Decision:** ❌ **REJECT Option B** — the card-based roster is more discoverable and only 1 hour more work.

### Option C: Guided Wizard
"What's your role? (Auditor/Engineer/Manager)" → filtered view of relevant risks.

**Pros:**
- Highly personalized

**Cons:**
- Adds friction (requires a choice before seeing content)
- Requires maintaining role-based filtering logic
- Violates the "no gates" principle

**Decision:** ❌ **REJECT Option C** — too much friction for a first-time experience.

---

## Decision Point 2: Should the Overview Be Mandatory or Optional?

### Option A: Overview Is the Default Landing (Recommended)
- `Home.tsx` initializes `view = "overview"` instead of `"matrix"`
- Returning users who bookmarked the heatmap will land on Overview first
- They can immediately click the Heatmaps tab to get to their bookmarked view

**Pros:**
- Consistent first-impression for all users
- Aligns with the "progressive disclosure" philosophy

**Cons:**
- Breaks existing bookmarks (users who bookmarked `?tab=matrix` will see Overview)
- Returning users see an extra click

**Mitigation:** Implement URL-based tab persistence (`?tab=matrix`) so bookmarks continue to work. When a user bookmarks the heatmap, the URL includes `?tab=matrix`, and that tab is restored on return.

**Decision:** ✅ **PROCEED with Option A + URL persistence**

### Option B: Overview Is Optional (Tab Only)
- Keep 800-53 Heatmap as the default
- Add Overview as a 5th tab
- Users who want the Overview must click it

**Pros:**
- No breaking change to existing bookmarks
- Doesn't force the Overview on anyone

**Cons:**
- Defeats the purpose of progressive disclosure (first-time users still see the heatmap)
- Adds a 5th tab (tab bar becomes crowded)

**Decision:** ❌ **REJECT Option B** — it doesn't solve the core problem (overwhelming first-time users).

---

## Decision Point 3: How Should the Tab Bar Be Restructured?

### Option A: 5 Tabs (Overview | 800-53 | AI-RMF | Evidence | Simulator)
Flat structure, no dropdown.

**Pros:**
- Simple, all tabs visible

**Cons:**
- Tab bar becomes crowded (5 tabs + icons is ~600px wide)
- The two heatmaps are structurally identical; grouping them makes sense

**Decision:** ❌ **REJECT Option A** — too many tabs.

### Option B: 4 Tabs with Dropdown (Overview | Heatmaps ▾ | Evidence | Simulator) (Recommended)
- "Heatmaps ▾" is a clickable dropdown that reveals "800-53" and "AI-RMF"
- Clicking either heatmap switches to that view
- The active heatmap is indicated in the dropdown (e.g., "Heatmaps ▾ (800-53)")

**Pros:**
- Reduces tab count to 4 (cleaner)
- Groups related views (both heatmaps are density matrices)
- Makes the hierarchy visible ("Heatmaps" is a category, not a single view)

**Cons:**
- Requires a custom dropdown component (or shadcn/ui Popover)
- Slightly more complex state management

**Decision:** ✅ **PROCEED with Option B**

### Option C: Tabs + Sidebar
Move the heatmaps to a left sidebar, keep tabs for Overview/Evidence/Simulator.

**Pros:**
- Lots of space for the heatmap selector

**Cons:**
- Adds a sidebar (major layout change)
- Increases visual complexity

**Decision:** ❌ **REJECT Option C** — too much layout disruption.

---

## Decision Point 4: Should the Heatmap Explainers Be Collapsible or Always-On?

### Option A: Collapsible (Default-Expanded First Visit, Collapsed Thereafter) (Recommended)
- Add a "What am I looking at?" section at the top of each heatmap
- On first visit (detected via localStorage), it's expanded by default
- On return visits, it's collapsed (user has seen it before)
- User can toggle it open/closed at any time

**Pros:**
- Helps first-time users understand the axes and colors
- Doesn't clutter the view for returning users
- Respects user agency (they can re-open it if needed)

**Cons:**
- Requires localStorage tracking per heatmap
- Adds ~50 lines per heatmap

**Decision:** ✅ **PROCEED with Option A**

### Option B: Always-On
The explainer is always visible at the top of each heatmap.

**Pros:**
- Simple (no state tracking)

**Cons:**
- Takes up screen real estate for returning users
- Feels redundant after the first visit

**Decision:** ❌ **REJECT Option B** — wastes space.

### Option C: Tooltip on Hover
Hovering over the heatmap title shows a tooltip with the explanation.

**Pros:**
- Minimal visual footprint

**Cons:**
- Hidden by default (users won't discover it)
- Doesn't help first-time users who don't know to hover

**Decision:** ❌ **REJECT Option C** — too discoverable.

---

## Decision Point 5: URL-Based Tab Persistence — How Should It Work?

### Option A: Query Parameter (`?tab=matrix`) (Recommended)
- When a user clicks a tab, the URL updates to `?tab=matrix` or `?tab=aiRmf` or `?tab=detail` or `?tab=simulator`
- On page load, if `?tab=X` is present, that tab is selected
- If no `?tab` parameter, default to `"overview"`

**Pros:**
- Bookmarks work correctly (user bookmarks `?tab=matrix`, returns to that tab)
- Shareable links (user can share a link to a specific view)
- Standard web pattern

**Cons:**
- Adds URL state management (useEffect to parse query params)
- Slightly more complex routing logic

**Decision:** ✅ **PROCEED with Option A**

### Option B: Hash-Based (`#matrix`)
Similar to Option A, but uses URL fragments instead of query params.

**Pros:**
- Slightly cleaner URLs

**Cons:**
- No real advantage over query params
- Fragments are traditionally for page sections, not app state

**Decision:** ❌ **REJECT Option B** — query params are more standard for app state.

### Option C: No Persistence
Don't persist the tab selection in the URL.

**Pros:**
- Simpler code

**Cons:**
- Bookmarks don't work (user bookmarks the heatmap, returns to Overview)
- Breaks the user's mental model of "bookmarkable state"

**Decision:** ❌ **REJECT Option C** — bookmarks are essential.

---

## Decision Point 6: Should the Overview Cards Link to Evidence or Simulator?

### Option A: Evidence Explorer (Recommended)
Clicking "Explore →" on a risk card navigates to the Evidence Explorer tab with that ASI pre-selected.

**Pros:**
- Natural flow: Overview (what is this risk?) → Evidence (what controls map to it?) → Simulator (what happens if it fails?)
- Matches the data hierarchy (Layer 0 → Layer 2 → Layer 3)
- Doesn't overwhelm with the Simulator immediately

**Cons:**
- One extra click to reach the Simulator

**Decision:** ✅ **PROCEED with Option A**

### Option B: Simulator
Clicking "Explore →" launches the Scenario Simulator with that risk pre-selected.

**Pros:**
- Fewer clicks to the most interactive view

**Cons:**
- Skips the Evidence layer (user doesn't understand the control mappings before seeing them fail)
- Simulator is complex; jumping there without context is jarring

**Decision:** ❌ **REJECT Option B** — violates the progressive disclosure principle.

---

## Decision Point 7: How Should Coverage Counts Be Computed?

The Overview cards show "5 NIST families, 12 controls | 3 AI-RMF functions, 8 categories" for each risk. How is this computed?

### Option A: Pre-Computed in data.ts (Recommended)
Add a `coverage` field to each ASIRisk object:
```typescript
export interface ASIRisk {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium-High";
  desc: string;
  coverage: {
    nistFamilies: number;
    nistControls: number;
    aiRmfFunctions: number;
    aiRmfCategories: number;
  };
}
```

**Pros:**
- Fast (no computation on render)
- Deterministic (same value every time)
- Easy to update (edit data.ts, commit)

**Cons:**
- Requires manual computation or a script to populate
- If the crosswalk data changes, these counts must be updated

**Decision:** ✅ **PROCEED with Option A**

### Option B: Computed at Runtime
In the Overview component, loop through CROSSWALK and count unique families/functions for each ASI.

**Pros:**
- Always in sync with the crosswalk data
- No manual updates needed

**Cons:**
- Slower (O(n²) computation on every render)
- Requires memoization to avoid re-computing

**Decision:** ❌ **REJECT Option B** — unnecessary performance cost.

---

## Decision Point 8: Should the Overview Be Responsive (Mobile-First)?

### Option A: Yes, Responsive Grid (Recommended)
- Desktop: 2–3 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row
- Cards scale to fit the viewport

**Pros:**
- Works on all devices
- Matches the product's existing responsive design

**Cons:**
- Requires CSS media queries or Tailwind responsive classes

**Decision:** ✅ **PROCEED with Option A**

### Option B: Desktop-Only
The Overview is optimized for desktop; mobile users see a simplified view (e.g., a dropdown selector).

**Pros:**
- Simpler CSS

**Cons:**
- Mobile users get a degraded experience
- Violates the product's mobile-first design principle

**Decision:** ❌ **REJECT Option B** — the product is mobile-responsive.

---

## Devaluations from the Evaluation Memo

The evaluation memo proposed several ideas that are **NOT** being implemented:

| Idea | Status | Reason |
|---|---|---|
| "Guided Wizard" (role-based filtering) | ❌ Rejected | Adds friction; violates "no gates" principle |
| "Minimalist Summary" (single hero + dropdown) | ❌ Rejected | Less discoverable than cards |
| "Sidebar for heatmap selection" | ❌ Rejected | Too much layout disruption |
| "Always-on explainers" in heatmaps | ❌ Rejected | Wastes space for returning users |
| "Hash-based URL persistence" | ❌ Rejected | Query params are more standard |
| "Simulator as default drill-down" | ❌ Rejected | Skips Evidence layer; violates hierarchy |
| "Desktop-only Overview" | ❌ Rejected | Degrades mobile experience |

**Kept from evaluation memo:**
- ✅ Overview as default landing
- ✅ Risk Roster card design
- ✅ Tab bar restructure (4 tabs + dropdown)
- ✅ Collapsible explainers (first-visit expanded)
- ✅ URL-based tab persistence
- ✅ Evidence Explorer as the drill-down target

---

## Implementation Sequence

### Phase 1: Data Layer (30 minutes)

**File:** `client/src/lib/data.ts`

**Changes:**
1. Add `coverage` field to `ASIRisk` interface
2. Populate coverage counts for all 15 ASI risks by analyzing CROSSWALK

**Example:**
```typescript
export interface ASIRisk {
  id: string;
  name: string;
  severity: "Critical" | "High" | "Medium-High";
  desc: string;
  coverage: {
    nistFamilies: number;
    nistControls: number;
    aiRmfFunctions: number;
    aiRmfCategories: number;
  };
}

export const OWASP_ASI: ASIRisk[] = [
  {
    id: "ASI01",
    name: "Agent Goal Hijack",
    severity: "Critical",
    desc: "Attackers redirect agent objectives through poisoned inputs...",
    coverage: {
      nistFamilies: 5,
      nistControls: 12,
      aiRmfFunctions: 3,
      aiRmfCategories: 8,
    },
  },
  // ... rest of ASI risks
];
```

**Validation:**
- ✅ TypeScript compiles
- ✅ Coverage counts match manual spot-check (pick 2–3 ASI risks, verify counts against CROSSWALK)

---

### Phase 2: Overview Component (90 minutes)

**File:** `client/src/components/OverviewRoster.tsx` (new)

**Changes:**
1. Create a new component that renders 15 risk cards
2. Each card displays:
   - Risk ID + Name
   - Severity badge (reuse existing `SeverityBadge` component)
   - One-line description (from `desc`)
   - Coverage summary (from `coverage` field)
   - "Explore →" CTA button
3. Cards are arranged in a responsive grid (2–3 per row on desktop, 1 on mobile)
4. Clicking "Explore →" calls `setSelectedASI(asiId)` and `setView("detail")`

**Code structure (~150 lines):**
```typescript
export default function OverviewRoster() {
  const navigate = useNavigate(); // or use setView + setSelectedASI from Home context
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-400">15 Agentic AI Risks</h2>
        <p className="text-sm text-slate-400 mt-2">
          Select a risk to explore its NIST 800-53 and AI-RMF mappings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OWASP_ASI.map((asi) => (
          <RiskCard key={asi.id} asi={asi} onExplore={() => {
            // Navigate to Evidence Explorer with this ASI selected
          }} />
        ))}
      </div>
    </div>
  );
}

function RiskCard({ asi, onExplore }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 hover:bg-slate-900 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-blue-400/70 font-mono">{asi.id}</div>
          <h3 className="text-sm font-bold text-white">{asi.name}</h3>
        </div>
        <SeverityBadge level={asi.severity} />
      </div>
      
      <p className="text-xs text-slate-400 mb-3">{asi.desc}</p>
      
      <div className="text-xs text-slate-500 mb-4 space-y-1">
        <div>📋 {asi.coverage.nistFamilies} NIST families, {asi.coverage.nistControls} controls</div>
        <div>🎯 {asi.coverage.aiRmfFunctions} AI-RMF functions, {asi.coverage.aiRmfCategories} categories</div>
      </div>
      
      <button
        onClick={onExplore}
        className="w-full px-3 py-2 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
      >
        Explore →
      </button>
    </div>
  );
}
```

**Validation:**
- ✅ Component renders 15 cards
- ✅ Cards display correct coverage counts
- ✅ "Explore →" button navigates to Evidence Explorer with ASI pre-selected
- ✅ Responsive grid works on mobile/tablet/desktop

---

### Phase 3: Tab Bar Restructure (60 minutes)

**File:** `client/src/pages/Home.tsx`

**Changes:**
1. Replace the flat tab array with a nested structure:
   ```typescript
   const tabs = [
     { key: "overview", label: "Overview", icon: <Home /> },
     { key: "heatmaps", label: "Heatmaps", icon: <Grid3X3 />, submenu: [
       { key: "matrix", label: "800-53 Heatmap" },
       { key: "aiRmf", label: "AI-RMF Heatmap" },
     ]},
     { key: "detail", label: "Evidence Explorer", icon: <Search /> },
     { key: "simulator", label: "Scenario Simulator", icon: <Zap /> },
   ];
   ```

2. Render the tab bar with a dropdown for "Heatmaps":
   ```tsx
   {tabs.map((tab) => {
     if (tab.submenu) {
       return (
         <Popover key={tab.key}>
           <PopoverTrigger asChild>
             <button className="...">
               {tab.icon}
               {tab.label} ▾
               {(view === "matrix" || view === "aiRmf") && " (active)"}
             </button>
           </PopoverTrigger>
           <PopoverContent>
             {tab.submenu.map((item) => (
               <button
                 key={item.key}
                 onClick={() => setView(item.key)}
                 className={view === item.key ? "font-bold" : ""}
               >
                 {item.label}
               </button>
             ))}
           </PopoverContent>
         </Popover>
       );
     }
     // Regular tab rendering for non-submenu tabs
   })}
   ```

3. Change the default view from `"matrix"` to `"overview"`:
   ```typescript
   const [view, setView] = useState<ViewType>("overview");
   ```

**Validation:**
- ✅ Tab bar displays 4 tabs + dropdown
- ✅ Clicking "Heatmaps ▾" opens a dropdown with "800-53" and "AI-RMF"
- ✅ Clicking either heatmap switches to that view
- ✅ The active heatmap is indicated (e.g., "Heatmaps ▾ (800-53)")
- ✅ Default view is "overview"

---

### Phase 4: URL-Based Tab Persistence (45 minutes)

**File:** `client/src/pages/Home.tsx`

**Changes:**
1. Add a useEffect that reads the `?tab` query parameter on mount:
   ```typescript
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     const tabParam = params.get("tab");
     if (tabParam && ["overview", "matrix", "aiRmf", "detail", "simulator"].includes(tabParam)) {
       setView(tabParam as ViewType);
     }
   }, []);
   ```

2. Add a useEffect that updates the URL when the view changes:
   ```typescript
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     params.set("tab", view);
     window.history.replaceState({}, "", `?${params.toString()}`);
   }, [view]);
   ```

**Validation:**
- ✅ Bookmarking a tab (e.g., `?tab=matrix`) returns to that tab on next visit
- ✅ Sharing a link with `?tab=simulator` opens the Simulator
- ✅ Default (no `?tab` param) opens Overview

---

### Phase 5: Heatmap Explainers (60 minutes)

**File:** `client/src/pages/Home.tsx` (modify the 800-53 and AI-RMF heatmap sections)

**Changes:**
1. Add a collapsible "What am I looking at?" section at the top of each heatmap
2. Track expansion state in localStorage (`heatmap_explainer_expanded_800-53`, `heatmap_explainer_expanded_aiRmf`)
3. On first visit, default to expanded; on return visits, default to collapsed

**Example for 800-53 heatmap:**
```typescript
const [explainerExpanded, setExplainerExpanded] = useState(() => {
  // First visit: default to expanded
  // Return visit: default to collapsed
  const stored = localStorage.getItem("heatmap_explainer_expanded_800-53");
  return stored === null ? true : stored === "true";
});

useEffect(() => {
  localStorage.setItem("heatmap_explainer_expanded_800-53", String(explainerExpanded));
}, [explainerExpanded]);

return (
  <>
    <div className="mb-4">
      <button
        onClick={() => setExplainerExpanded(!explainerExpanded)}
        className="text-base font-bold text-blue-400 flex items-center gap-2 cursor-pointer"
      >
        <Layers className="w-4 h-4" />
        OWASP ASI → NIST 800-53 Rev 5 Control Density
        {explainerExpanded ? "▼" : "▶"}
      </button>
      
      {explainerExpanded && (
        <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 text-sm text-slate-300 space-y-2">
          <p><strong>What you're looking at:</strong> Each row is an OWASP ASI risk. Each column is a NIST 800-53 control family.</p>
          <p><strong>The numbers:</strong> Darker cells = more controls in that family map to that risk. Light cells = fewer mappings.</p>
          <p><strong>How to use it:</strong> Click any row to see the full crosswalk with specific control IDs, rationale, and evidence.</p>
          <p><strong>The families:</strong> AC = Access Control, AU = Audit & Accountability, etc. Hover over column headers for full names.</p>
        </div>
      )}
    </div>
    
    {/* Rest of heatmap rendering */}
  </>
);
```

**Validation:**
- ✅ Explainer is expanded on first visit
- ✅ Explainer is collapsed on return visits (localStorage persists)
- ✅ User can toggle it open/closed at any time
- ✅ Same pattern applied to AI-RMF heatmap

---

### Phase 6: Integration & Testing (60 minutes)

**File:** `client/src/pages/Home.tsx` (full integration)

**Changes:**
1. Import the new `OverviewRoster` component
2. Add "overview" case to the view rendering:
   ```typescript
   {view === "overview" && (
     <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
       <OverviewRoster />
     </motion.div>
   )}
   ```

3. Update the ViewType type to include "overview":
   ```typescript
   type ViewType = "overview" | "matrix" | "aiRmf" | "detail" | "simulator";
   ```

**Testing checklist:**
- ✅ First-time visitor lands on Overview
- ✅ Overview displays 15 risk cards with correct coverage counts
- ✅ Clicking "Explore →" navigates to Evidence Explorer with ASI pre-selected
- ✅ Tab bar shows 4 tabs + "Heatmaps ▾" dropdown
- ✅ Clicking "Heatmaps ▾" opens dropdown with "800-53" and "AI-RMF"
- ✅ Clicking either heatmap switches to that view
- ✅ Bookmarking `?tab=matrix` returns to that tab
- ✅ Heatmap explainers are expanded on first visit, collapsed on return
- ✅ Heatmap explainers can be toggled open/closed
- ✅ All existing functionality (search, filters, simulator, etc.) works unchanged
- ✅ Mobile responsive (cards stack to 1 per row on mobile)

---

## Risk Mitigation

### Risk 1: Breaking Existing Bookmarks
**Scenario:** A user bookmarked the 800-53 heatmap (`?tab=matrix`). They return and land on Overview instead.

**Mitigation:** Implement URL-based tab persistence (Phase 4). When they bookmark, the URL includes `?tab=matrix`. On return, that tab is restored automatically.

**Fallback:** If they bookmarked without the `?tab` parameter, they'll see Overview. They can click "Heatmaps ▾" → "800-53" to get back to the heatmap (1 click).

---

### Risk 2: Slower First Load
**Scenario:** The Overview component renders 15 cards, each with coverage counts. This could be slower than the previous heatmap view.

**Mitigation:** Coverage counts are pre-computed in `data.ts` (no runtime computation). Card rendering is simple (no complex calculations). The Overview should be *faster* than the heatmap because it has fewer DOM elements (15 cards vs. 240 cells).

**Validation:** Measure first paint time before and after implementation.

---

### Risk 3: Users Skip the Overview
**Scenario:** Expert users immediately click "Heatmaps ▾" to get to the heatmap, bypassing the Overview entirely.

**Mitigation:** This is *expected and desired*. The Overview is for first-time/exploratory users. Experts should skip it. The tab bar is always visible, so they can reach the heatmap in 1 click.

**Non-issue:** This is not a problem; it's the design working as intended.

---

### Risk 4: Mobile Users See a Cluttered Tab Bar
**Scenario:** On mobile, 4 tabs + dropdown might overflow the screen width.

**Mitigation:** Use Tailwind's responsive classes to hide the tab bar on very small screens and replace it with a hamburger menu or bottom navigation.

**Implementation:** Add a mobile-specific tab selector (e.g., a select dropdown) for screens < 640px.

---

## Rollback Plan

If the Overview causes unexpected issues:

1. **Revert to old default:** Change `setView("overview")` back to `setView("matrix")` in Home.tsx
2. **Remove Overview tab:** Comment out the "overview" case in the view rendering
3. **Revert tab bar:** Remove the "Heatmaps ▾" dropdown, restore flat 4-tab structure
4. **Commit:** `git revert <commit-hash>`

**Rollback time:** < 5 minutes (single commit revert)

---

## Success Metrics

After implementation, measure:

1. **First-time user bounce rate** — Does it decrease? (users who previously bounced at the heatmap now explore the Overview)
2. **Time to first interaction** — How long before a user clicks something? (should be faster with Overview)
3. **Evidence Explorer usage** — Does it increase? (users navigate from Overview cards to Evidence)
4. **Heatmap tab usage** — Does it stay the same? (experts should still use it)
5. **Mobile conversion** — Do mobile users complete more actions? (Overview is simpler than heatmap)

---

## Implementation Effort Breakdown

| Phase | Task | Effort | Owner |
|---|---|---|---|
| 1 | Add coverage field to data.ts | 30 min | Agent |
| 2 | Build OverviewRoster component | 90 min | Agent |
| 3 | Restructure tab bar + dropdown | 60 min | Agent |
| 4 | URL-based tab persistence | 45 min | Agent |
| 5 | Heatmap explainers | 60 min | Agent |
| 6 | Integration + testing | 60 min | Agent |
| **Total** | | **345 min (5.75 hours)** | |

---

## Timeline

- **Start:** Now
- **Phase 1–3:** 3 hours (data + Overview + tabs)
- **Phase 4–5:** 1.75 hours (URL + explainers)
- **Phase 6:** 1 hour (integration + testing)
- **Checkpoint:** After Phase 6 (all features working)
- **GitHub push:** After checkpoint
- **Total time to production:** ~6 hours

---

## Devaluations Summary

**NOT implementing:**
- Role-based filtering (adds friction)
- Minimalist summary view (less discoverable)
- Sidebar for heatmap selection (layout disruption)
- Always-on explainers (wastes space)
- Hash-based URLs (query params are standard)
- Simulator as drill-down (skips Evidence layer)
- Desktop-only Overview (degrades mobile)

**Implementing:**
- Overview as default landing
- Risk Roster card design
- 4-tab bar + Heatmaps dropdown
- Collapsible explainers (first-visit expanded)
- Query-param URL persistence
- Evidence Explorer as drill-down target

---

## Next Step

Proceed with Phase 1 (add coverage field to data.ts) and build forward through Phase 6. Checkpoint after Phase 6, then push to GitHub.

Ready to start?
