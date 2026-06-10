# Role 2: UX Designer — Answers

**Context consumed:** Home.tsx (tab structure, progressive disclosure), ScenarioSimulator.tsx (sidebar AnalysisPanel, heatmap interactions), OnboardingController.tsx (guided flow precedent), OverviewRoster.tsx (card-based entry point), HeatmapExplainer.tsx (collapsible guidance).

---

## Q1.2: Diagram Source & Format Constraints

**Recommended answer:** Accept PNG/JPG/WebP from any source. Expect digital diagrams with text labels. Reject images below 400×400px. No whiteboard/handwritten support in Phase 1.

**Rationale:**
- The user explicitly said "PNG/JPG" and "from Miro or other drawing tools" — this implies clean, digital, exported diagrams
- Miro exports at 2x resolution by default (typically 1920×1080+). Lucidchart and draw.io export similarly.
- Text labels are critical for pattern recognition — the LLM needs to read "Agent A," "Router," "Supervisor" etc.
- Whiteboard photos introduce noise (glare, handwriting OCR, perspective distortion) that would dramatically reduce accuracy
- Maximum resolution: 4096×4096 (Gemini's limit). Resize client-side before upload to control cost.

**UX implications:**
- Upload zone should show accepted formats: "PNG, JPG, or WebP (max 10MB)"
- If image is below 400×400px, show inline error: "Image too small. Export at higher resolution."
- If image has no detectable text (future enhancement), suggest: "This diagram has no labels. Consider adding agent names for better accuracy."

**Design precedent:** The existing `AnalysisPanel.tsx` slide-in panel (420px width) establishes the right-side panel pattern. The diagram upload zone should live at the top of this panel.

**Confidence:** 0.9

---

## Q4.1: Sidebar Behavior

**Recommended answer:** Semi-persistent. Stays open within the Simulator tab. Closes when navigating to other tabs. Reopens with last state when returning to Simulator.

**Rationale:**
- The existing `AnalysisPanel` is ephemeral — it opens on cell click and closes on dismiss. But it only shows contextual data for one cell.
- The diagram analyzer sidebar has a *workflow* (upload → analyze → results → generate report). Closing it mid-workflow would lose state.
- However, keeping it open on Evidence Explorer or Heatmap tabs would compete for space and confuse the information hierarchy.
- Compromise: Persist within Simulator tab (where results are rendered). Close on tab switch. Store state in ScenarioContext so it restores when user returns.

**Layout specification:**
- Desktop (≥1024px): Right sidebar, 420px fixed width, pushes main content left
- Tablet (768–1023px): Right sidebar, 360px fixed width, overlays main content with scrim
- Mobile (<768px): Bottom sheet, full width, 70% viewport height, swipe-to-dismiss

**History feature:**
- Show last 3 analyses as thumbnails at the top of the sidebar (stored in localStorage)
- Clicking a thumbnail restores that analysis (pattern matches + report) without re-running LLM
- "Clear history" link below thumbnails

**Confidence:** 0.85

**Assumption to validate:** Should the sidebar be accessible from the Overview tab (as a "quick analyze" entry point), or only from the Simulator?

---

## Q4.2: Results Presentation

**Recommended answer:** Show matched patterns with confidence bars, editable before report generation. Show "almost matched" patterns below a divider. Include confidence summary header.

**Rationale:**
- The user explicitly said "if there is a match, query the crosswalk" — implying the match step is distinct from the report step
- Users need to verify/correct before generating the compliance report (trust but verify)
- Showing "almost matched" patterns (confidence 0.3–0.6) gives users agency to include patterns the LLM was uncertain about
- This aligns with the product's existing "AI-assisted with human review" philosophy (the scrambler-mappings.ts already states "Practitioner validation required")

**Results UI structure:**
```
┌─────────────────────────────────────────────┐
│ 📊 Analysis Complete                        │
│ High confidence: 2 patterns                 │
│ Medium confidence: 1 pattern                │
├─────────────────────────────────────────────┤
│ ✅ Sequential Pipeline        [0.94] [✕]    │
│    "Linear chain detected with gates"       │
│                                             │
│ ✅ Reflection Loop            [0.87] [✕]    │
│    "Self-review cycle at Agent B"           │
├─────────────────────────────────────────────┤
│ ── Also detected (lower confidence) ──      │
│ ○ Tool-Augmented Agent        [0.52] [+]    │
│    "External API connections visible"       │
├─────────────────────────────────────────────┤
│ [+ Add pattern manually]                    │
│                                             │
│ [▶ Generate Crosswalk Report]               │
└─────────────────────────────────────────────┘
```

- [✕] removes a matched pattern (user override)
- [+] adds a lower-confidence pattern to the report
- [+ Add pattern manually] opens a dropdown of all 12 patterns

**Confidence:** 0.9

---

## Q4.3: Mobile Experience

**Recommended answer:** Desktop-first. Mobile is functional but not optimized. No camera capture in Phase 1.

**Rationale:**
- The existing product is desktop-first (240-cell heatmaps don't work on phones)
- Architecture diagrams are typically created and viewed on desktop
- Camera capture (whiteboard photos) was explicitly excluded from Phase 1 (Q1.2)
- The sidebar converts to a bottom sheet on mobile (functional, not ideal)

**Mobile-specific decisions:**
- Upload button replaces drag-and-drop zone on touch devices
- Results display in a full-screen modal (not sidebar) on phones
- "Generate Report" navigates to the simulator tab (full-width heatmap)
- No split-screen comparison on mobile

**Confidence:** 0.85

---

## Q9.1: Diagram Quality Issues (UX Implications)

**Recommended answer:** Graceful degradation with user-actionable feedback.

**Handling matrix:**

| Issue | Detection | User Feedback | Fallback |
|---|---|---|---|
| Blurry/low-res | Client-side: check dimensions < 400px | "Image too small. Export at higher resolution from your drawing tool." | Block upload |
| No labels/annotations | LLM returns low confidence (<0.4) on all patterns | "We couldn't identify clear patterns. Try adding agent labels to your diagram, or select patterns manually below." | Show manual selector |
| Non-English labels | LLM handles natively (Gemini supports 100+ languages) | No special handling needed | N/A |
| Screenshot of screenshot | LLM returns low confidence due to compression artifacts | Same as "no labels" — suggest manual selection | Show manual selector |
| Not an architecture diagram | LLM returns empty pattern array | "This doesn't appear to be an agentic AI architecture diagram. Upload a diagram showing agent interactions, or select patterns manually." | Show manual selector |

**Key UX principle:** Never show a blank error state. Always provide a next action (manual selection, re-upload guidance, or help link).

**Confidence:** 0.9

---

## Summary: UX Position

The sidebar is **semi-persistent** (lives within Simulator tab, restores on return). Results are **editable before report generation** (users can add/remove patterns). Mobile is **functional but desktop-first**. Quality issues trigger **graceful degradation with actionable guidance** (never a dead end). The upload accepts **digital diagrams only** (no whiteboard/handwritten in Phase 1). History shows **last 3 analyses** as thumbnails for quick recall.
