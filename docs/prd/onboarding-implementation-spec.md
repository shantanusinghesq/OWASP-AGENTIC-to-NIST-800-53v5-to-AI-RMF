# Implementation Specification: Scrim & Spotlight Onboarding Flow

**Role:** Lead Frontend Architect — Interaction Systems  
**Date:** 2026-06-03  
**Target codebase:** `vibe-security-app` (React 19 + Tailwind 4 + Framer Motion + Wouter)  
**Scope:** Level 1 Onboarding Sequence — 5-phase guided first-run experience

---

## Drafting Discretionary Thinking

### Decision Point 1: Where does the onboarding state live?

**Options considered:**

| Option | Mechanism | Persistence | Tradeoff |
|---|---|---|---|
| A | `localStorage` flag `onboarding_completed` | Permanent per-browser | Cannot reset without DevTools |
| B | `sessionStorage` flag | Per-session only | User sees onboarding every new session |
| C | `localStorage` with explicit reset path | Permanent + user-resettable | Requires a "Replay Tutorial" affordance |

**Decision:** Option C. The onboarding must fire exactly once (first visit) and never again unless the user explicitly requests it. A `localStorage.getItem("agentic_risk_onboarding_v1")` check gates the entire flow. The version suffix (`_v1`) allows future onboarding revisions to re-trigger without clearing the old flag. A "Replay Tutorial" ghost button is added to the platform's help/info area.

**Counterfactual that would collapse this:** If the platform adds user authentication (Manus OAuth), onboarding state should migrate to the user profile (server-side). The `localStorage` approach becomes incorrect because the same user on a different device would see the tutorial again, and a different user on the same device would not. If auth is added, replace `localStorage` with a `user.preferences.onboardingCompleted` field on the backend.

---

### Decision Point 2: Component architecture — monolithic overlay vs. composable system?

**Options considered:**

| Option | Architecture | Complexity | Reusability |
|---|---|---|---|
| A | Single `<OnboardingOverlay>` component with internal phase state machine | Low | None — one-off |
| B | Composable system: `<Scrim>` + `<Spotlight>` + `<SpotlightTooltip>` + `<OnboardingController>` | Medium | High — reusable for future L2/L3 tutorials |
| C | Third-party library (react-joyride, intro.js) | Low (integration) | Vendor dependency |

**Decision:** Option B. The composable system. Rationale: the spec explicitly describes a multi-phase flow with different spotlight targets, different tooltip positions, and different interaction requirements (forced click vs. hover prompt vs. free dismiss). A monolithic component would become an unreadable state machine. A third-party library would fight the existing Framer Motion animation system and the Swiss/Bauhaus design tokens.

**Counterfactual that would collapse this:** If the platform will never have a Level 2 or Level 3 onboarding sequence, Option A is faster to ship. The composable system's reusability value is zero if this is the only guided flow that will ever exist. However, the spec's own framing ("Level 1 Onboarding Sequence") implies future levels exist.

---

### Decision Point 3: How does the spotlight "cut through" the scrim?

**Options considered:**

| Option | Technique | Browser support | Performance |
|---|---|---|---|
| A | CSS `clip-path` on the scrim with a polygon hole | Universal | Requires recalculating polygon on resize/scroll |
| B | CSS `mix-blend-mode: multiply` with a white spotlight element | Modern browsers | Fragile with dark backgrounds |
| C | SVG `<mask>` on the scrim element with a `<rect>` minus a `<circle>`/`<rect>` cutout | Universal | GPU-composited, smooth transitions |
| D | `box-shadow` with massive spread on the target element | Universal | Cannot dim non-adjacent areas independently |

**Decision:** Option C — SVG mask. The scrim is a full-viewport `<div>` with `position: fixed` and a dark semi-transparent background. An inline SVG mask defines a white rectangle (full coverage = visible scrim) with a black rectangle/rounded-rect at the spotlight coordinates (black = transparent = hole in scrim). The spotlight position is computed from `getBoundingClientRect()` of the target element, with padding. Framer Motion animates the mask coordinates between phases for smooth spotlight movement.

**Counterfactual that would collapse this:** If the platform must support IE11 or browsers without SVG mask support, fall back to Option A (clip-path polygon). However, the existing codebase uses Framer Motion and CSS custom properties, which already exclude IE11. SVG masks are safe.

---

### Decision Point 4: How does the onboarding interact with the tab system?

**Problem:** The user lands on the default tab (`matrix` — the 800-53 Heatmap). The onboarding must navigate them to the `simulator` tab, force a scenario generation, then spotlight elements that only exist *after* generation (the heatmap cells, the cascade topology). The onboarding controller must orchestrate tab switches and wait for DOM elements to render before positioning spotlights.

**Decision:** The `<OnboardingController>` component:
1. Lives at the `Home.tsx` level (above the tab content, below the tab bar)
2. Has access to `setView` (the tab switcher) via a prop or a new `OnboardingContext`
3. Uses a `MutationObserver` + `requestAnimationFrame` loop to wait for target elements to appear in the DOM before advancing spotlight position
4. Phases 2–4 programmatically switch to the `simulator` tab and invoke `generateScenarioHandler` via a ref or context callback

**Counterfactual that would collapse this:** If the Scenario Simulator is moved to its own route (e.g., `/simulator`) instead of being a tab within `Home.tsx`, the onboarding controller cannot share React state with the simulator. It would need to use URL-based navigation and cross-component event buses. The current tab-based architecture makes intra-component orchestration possible.

---

### Decision Point 5: "Forced click" interaction — how to enforce without breaking accessibility?

**Problem:** Phase 2 requires the user to click the "Generate Scenario #1" button. The spec says "The user is forced to click." But we cannot disable all other interactions (that breaks keyboard navigation, screen readers, and escape hatches).

**Decision:** The scrim blocks pointer events on everything *except* the spotlighted element. Implementation: the scrim has `pointer-events: all` and sits at `z-index: 9998`. The spotlighted element is elevated to `z-index: 9999` via a temporary inline style applied by the controller. This naturally blocks clicks on non-spotlighted elements while keeping the target fully interactive. Keyboard focus is trapped to the spotlight target using `inert` attribute on the rest of the DOM (or `aria-hidden="true"` on siblings).

**Counterfactual that would collapse this:** If the platform uses a Shadow DOM or iframe for any component, `z-index` stacking contexts break. The current codebase is a single React tree with no Shadow DOM or iframes, so z-index elevation is safe.

---

### Decision Point 6: What triggers the onboarding — page load or hydration complete?

**Decision:** The onboarding fires after a 500ms delay post-`useEffect` mount in `Home.tsx`. This ensures:
- React hydration is complete
- The hero image has started loading (avoids layout shift during onboarding)
- The tab bar is rendered and measurable

The delay is implemented as `setTimeout` inside a `useEffect` with the `onboarding_completed` localStorage check as the gate.

**Counterfactual that would collapse this:** If the app uses SSR/streaming (e.g., Next.js), hydration timing is non-deterministic. The current app is a pure SPA (Vite + client-only React), so mount timing is predictable.

---

## Assumptions Accepted

1. **Single-page app with client-side tabs.** The simulator is a tab within `Home.tsx`, not a separate route. All spotlight targets are in the same React tree.

2. **No authentication.** First-visit detection uses `localStorage`, not server-side user state.

3. **Framer Motion is available.** All animations (scrim fade, spotlight movement, tooltip entrance) use the existing Framer Motion dependency. No additional animation library needed.

4. **The "Generate Scenario" handler can be invoked programmatically.** The existing `generateScenarioHandler` is a `useCallback` that can be called from a ref or context without user interaction, enabling the onboarding to pre-generate the scenario for Phase 2.

5. **The heatmap renders synchronously after scenario generation.** The `heatmapData` is a `useMemo` derived from `scenario` state — it renders in the same frame as the state update. No async data fetching is required.

6. **The cascade topology is expanded by default after generation.** The `showCascade` state is set to `true` in `generateScenarioHandler`. The onboarding does not need to toggle it open.

7. **The platform will have future onboarding levels (L2, L3).** The composable architecture is justified by this assumption.

8. **Touch devices are secondary.** The "hover over CP column header" interaction in Phase 3 degrades to "tap" on mobile. The tooltip shows on tap instead of hover. This is acceptable.

---

## Complete Implementation Instructions

---

### File 1: `client/src/contexts/OnboardingContext.tsx`

**Purpose:** Global onboarding state machine. Manages phase progression, completion persistence, and cross-component coordination.

```typescript
import { createContext, useContext, useState, useCallback, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type OnboardingPhase = 
  | "inactive"      // Onboarding not running (completed or skipped)
  | "hook"          // Phase 1: Center modal with value proposition
  | "guided-action" // Phase 2: Spotlight on config bar + Generate button
  | "translation"   // Phase 3: Spotlight on broken heatmap cell
  | "root-cause"    // Phase 4: Spotlight on cascade topology
  | "handoff";      // Phase 5: Persistent banner, full access

interface OnboardingContextValue {
  phase: OnboardingPhase;
  isActive: boolean;
  advance: () => void;
  skip: () => void;
  restart: () => void;
  
  // Coordination callbacks (set by child components)
  registerGenerateHandler: (handler: () => void) => void;
  triggerGenerate: () => void;
  
  // Tab control (set by Home.tsx)
  registerTabSwitcher: (switcher: (tab: string) => void) => void;
  switchToSimulator: () => void;
}

const STORAGE_KEY = "agentic_risk_onboarding_v1";
const PHASE_SEQUENCE: OnboardingPhase[] = [
  "hook", "guided-action", "translation", "root-cause", "handoff"
];

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<OnboardingPhase>("inactive");
  const [generateHandler, setGenerateHandler] = useState<(() => void) | null>(null);
  const [tabSwitcher, setTabSwitcher] = useState<((tab: string) => void) | null>(null);

  // Check localStorage on mount — fire onboarding if first visit
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Delay to allow initial render to settle
      const timer = setTimeout(() => setPhase("hook"), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const isActive = phase !== "inactive";

  const advance = useCallback(() => {
    setPhase(current => {
      const idx = PHASE_SEQUENCE.indexOf(current);
      if (idx === -1 || idx === PHASE_SEQUENCE.length - 1) {
        // Complete onboarding
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          completedAt: new Date().toISOString(), 
          version: 1 
        }));
        return "inactive";
      }
      return PHASE_SEQUENCE[idx + 1];
    });
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      skippedAt: new Date().toISOString(), 
      version: 1 
    }));
    setPhase("inactive");
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("hook");
  }, []);

  const registerGenerateHandler = useCallback((handler: () => void) => {
    setGenerateHandler(() => handler);
  }, []);

  const triggerGenerate = useCallback(() => {
    if (generateHandler) generateHandler();
  }, [generateHandler]);

  const registerTabSwitcher = useCallback((switcher: (tab: string) => void) => {
    setTabSwitcher(() => switcher);
  }, []);

  const switchToSimulator = useCallback(() => {
    if (tabSwitcher) tabSwitcher("simulator");
  }, [tabSwitcher]);

  return (
    <OnboardingContext.Provider value={{
      phase, isActive, advance, skip, restart,
      registerGenerateHandler, triggerGenerate,
      registerTabSwitcher, switchToSimulator,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
```

**Integration point:** Wrap in `App.tsx` inside `ScenarioProvider` (onboarding needs scenario context access):

```tsx
// App.tsx — add OnboardingProvider
<ScenarioProvider>
  <OnboardingProvider>
    <TooltipProvider>
      ...
    </TooltipProvider>
  </OnboardingProvider>
</ScenarioProvider>
```

---

### File 2: `client/src/components/onboarding/Scrim.tsx`

**Purpose:** Full-viewport dark overlay with SVG mask cutout for spotlight hole.

```typescript
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface ScrimProps {
  /** Spotlight target rect (from getBoundingClientRect) + padding */
  spotlightRect: DOMRect | null;
  /** Padding around the spotlight target */
  padding?: number;
  /** Border radius of the spotlight cutout */
  borderRadius?: number;
}

export default function Scrim({ spotlightRect, padding = 12, borderRadius = 8 }: ScrimProps) {
  const { isActive } = useOnboarding();

  if (!isActive) return null;

  // Compute cutout coordinates
  const cutout = spotlightRect ? {
    x: spotlightRect.x - padding,
    y: spotlightRect.y - padding,
    width: spotlightRect.width + padding * 2,
    height: spotlightRect.height + padding * 2,
  } : null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9998]"
          style={{ pointerEvents: "all" }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <mask id="spotlight-mask">
                {/* White = visible (scrim shows) */}
                <rect width="100%" height="100%" fill="white" />
                {/* Black = transparent (spotlight hole) */}
                {cutout && (
                  <motion.rect
                    initial={{ opacity: 0 }}
                    animate={{ 
                      x: cutout.x, 
                      y: cutout.y, 
                      width: cutout.width, 
                      height: cutout.height,
                      opacity: 1 
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                    rx={borderRadius}
                    ry={borderRadius}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect 
              width="100%" 
              height="100%" 
              fill="rgba(15, 23, 42, 0.85)" 
              mask="url(#spotlight-mask)" 
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Design note:** The scrim color `rgba(15, 23, 42, 0.85)` matches `PALETTE.bg` at 85% opacity, maintaining the Swiss/Bauhaus dark slate aesthetic. The spotlight hole animates between positions using Framer Motion spring physics.

---

### File 3: `client/src/components/onboarding/SpotlightTooltip.tsx`

**Purpose:** Positioned tooltip that attaches to the spotlight target with phase-specific content.

```typescript
import { motion } from "framer-motion";

interface SpotlightTooltipProps {
  targetRect: DOMRect | null;
  position: "top" | "bottom" | "left" | "right";
  headline: string;
  body: string;
  stepLabel?: string;
  primaryCTA?: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
  interactionHint?: string;
}

export default function SpotlightTooltip({
  targetRect,
  position,
  headline,
  body,
  stepLabel,
  primaryCTA,
  secondaryCTA,
  interactionHint,
}: SpotlightTooltipProps) {
  if (!targetRect) return null;

  // Compute tooltip position relative to target
  const OFFSET = 16; // px gap between target and tooltip
  let style: React.CSSProperties = { position: "fixed", zIndex: 9999, maxWidth: 360 };

  switch (position) {
    case "bottom":
      style.top = targetRect.bottom + OFFSET;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = "translateX(-50%)";
      break;
    case "top":
      style.bottom = window.innerHeight - targetRect.top + OFFSET;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = "translateX(-50%)";
      break;
    case "right":
      style.top = targetRect.top + targetRect.height / 2;
      style.left = targetRect.right + OFFSET;
      style.transform = "translateY(-50%)";
      break;
    case "left":
      style.top = targetRect.top + targetRect.height / 2;
      style.right = window.innerWidth - targetRect.left + OFFSET;
      style.transform = "translateY(-50%)";
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: position === "bottom" ? -8 : 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: position === "bottom" ? -8 : 8, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={style}
    >
      <div className="rounded-lg border p-5 shadow-2xl"
        style={{ 
          backgroundColor: "#1E293B", 
          borderColor: "rgba(37, 99, 235, 0.3)",
          boxShadow: "0 0 40px rgba(37, 99, 235, 0.15)"
        }}>
        {stepLabel && (
          <div className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "#3B82F6" }}>
            {stepLabel}
          </div>
        )}
        <h4 className="text-sm font-bold mb-2" style={{ color: "#E2E8F0" }}>
          {headline}
        </h4>
        <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#94A3B8" }}>
          {body}
        </p>
        {interactionHint && (
          <div className="text-[11px] italic mb-3 flex items-center gap-1.5"
            style={{ color: "#60A5FA" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {interactionHint}
          </div>
        )}
        {(primaryCTA || secondaryCTA) && (
          <div className="flex items-center gap-3 mt-3">
            {primaryCTA && (
              <button
                onClick={primaryCTA.onClick}
                className="px-4 py-2 rounded-md text-[12px] font-bold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: "rgba(37, 99, 235, 0.2)", 
                  color: "#3B82F6",
                  border: "1px solid rgba(37, 99, 235, 0.4)" 
                }}>
                {primaryCTA.label}
              </button>
            )}
            {secondaryCTA && (
              <button
                onClick={secondaryCTA.onClick}
                className="px-3 py-2 text-[11px] font-medium transition-colors hover:text-slate-200"
                style={{ color: "#64748B" }}>
                {secondaryCTA.label}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

---

### File 4: `client/src/components/onboarding/OnboardingController.tsx`

**Purpose:** Orchestrates the 5-phase sequence. Computes spotlight targets, manages phase transitions, coordinates with ScenarioSimulator.

```typescript
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/contexts/OnboardingContext";
import Scrim from "./Scrim";
import SpotlightTooltip from "./SpotlightTooltip";
import HookModal from "./HookModal";
import HandoffBanner from "./HandoffBanner";

// Element selectors for spotlight targets (data-onboarding attributes)
const TARGETS = {
  configBar: '[data-onboarding="config-bar"]',
  generateButton: '[data-onboarding="generate-button"]',
  heatmapBrokenCell: '[data-onboarding="first-broken-cell"]',
  cascadeTopology: '[data-onboarding="cascade-topology"]',
} as const;

export default function OnboardingController() {
  const { phase, isActive, advance, skip, switchToSimulator, triggerGenerate } = useOnboarding();
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const observerRef = useRef<MutationObserver | null>(null);
  const rafRef = useRef<number>(0);

  // ─── Spotlight Position Calculator ────────────────────────────────────────
  const updateSpotlightForSelector = useCallback((selector: string, position: "top" | "bottom" | "left" | "right" = "bottom") => {
    const findAndPosition = () => {
      const el = document.querySelector(selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect(rect);
        setTooltipPosition(position);
        // Elevate the target above the scrim
        (el as HTMLElement).style.position = "relative";
        (el as HTMLElement).style.zIndex = "9999";
        return true;
      }
      return false;
    };

    // Try immediately
    if (findAndPosition()) return;

    // If element doesn't exist yet, observe DOM mutations
    observerRef.current?.disconnect();
    observerRef.current = new MutationObserver(() => {
      if (findAndPosition()) {
        observerRef.current?.disconnect();
      }
    });
    observerRef.current.observe(document.body, { childList: true, subtree: true });
  }, []);

  // ─── Clean up elevated elements ──────────────────────────────────────────
  const cleanupElevation = useCallback(() => {
    document.querySelectorAll('[style*="z-index: 9999"]').forEach(el => {
      (el as HTMLElement).style.zIndex = "";
      (el as HTMLElement).style.position = "";
    });
  }, []);

  // ─── Phase Transitions ────────────────────────────────────────────────────
  useEffect(() => {
    cleanupElevation();

    switch (phase) {
      case "hook":
        // No spotlight — center modal only
        setSpotlightRect(null);
        break;

      case "guided-action":
        // Switch to simulator tab, then spotlight the config bar
        switchToSimulator();
        // Wait for tab to render, then find the config bar
        setTimeout(() => {
          updateSpotlightForSelector(TARGETS.configBar, "bottom");
        }, 300);
        break;

      case "translation":
        // Spotlight the first broken cell in the heatmap
        // The scenario was generated in the previous phase
        setTimeout(() => {
          updateSpotlightForSelector(TARGETS.heatmapBrokenCell, "bottom");
        }, 200);
        break;

      case "root-cause":
        // Spotlight the cascade topology
        setTimeout(() => {
          updateSpotlightForSelector(TARGETS.cascadeTopology, "top");
        }, 200);
        break;

      case "handoff":
        // No spotlight — banner only
        setSpotlightRect(null);
        cleanupElevation();
        break;

      case "inactive":
        setSpotlightRect(null);
        cleanupElevation();
        break;
    }

    return () => {
      observerRef.current?.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase, switchToSimulator, updateSpotlightForSelector, cleanupElevation]);

  // ─── Handle resize (recompute spotlight position) ─────────────────────────
  useEffect(() => {
    if (!isActive || !spotlightRect) return;
    const handleResize = () => {
      // Re-find the current target
      const selectors = Object.values(TARGETS);
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && (el as HTMLElement).style.zIndex === "9999") {
          setSpotlightRect(el.getBoundingClientRect());
          break;
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isActive, spotlightRect]);

  // ─── Phase 2: After user clicks Generate, advance to Phase 3 ─────────────
  // This is handled by the ScenarioSimulator detecting onboarding phase
  // and calling advance() after generation completes.

  if (!isActive && phase !== "handoff") return null;

  return (
    <>
      {/* Phase 1: Hook Modal */}
      <AnimatePresence>
        {phase === "hook" && (
          <HookModal
            onProceed={() => {
              advance(); // → guided-action
            }}
            onSkip={skip}
          />
        )}
      </AnimatePresence>

      {/* Phases 2–4: Scrim + Spotlight */}
      {(phase === "guided-action" || phase === "translation" || phase === "root-cause") && (
        <>
          <Scrim spotlightRect={spotlightRect} />
          <SpotlightTooltip
            targetRect={spotlightRect}
            position={tooltipPosition}
            {...getTooltipContent(phase, advance, triggerGenerate)}
          />
        </>
      )}

      {/* Phase 5: Handoff Banner */}
      <AnimatePresence>
        {phase === "handoff" && (
          <HandoffBanner onDismiss={advance} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Tooltip Content per Phase ──────────────────────────────────────────────

function getTooltipContent(
  phase: string, 
  advance: () => void,
  triggerGenerate: () => void
): Omit<React.ComponentProps<typeof SpotlightTooltip>, "targetRect" | "position"> {
  switch (phase) {
    case "guided-action":
      return {
        stepLabel: "Step 1 of 3",
        headline: "Set the Parameters",
        body: "We've pre-selected a standard scenario: an Erroneous risk occurring in a Sequential agent chain. This is a common hallucination pattern.",
        interactionHint: "Click the Generate Scenario button to proceed",
        // The advance happens when the user clicks Generate (detected by ScenarioSimulator)
      };
    case "translation":
      return {
        stepLabel: "Step 2 of 3",
        headline: "The Crosswalk in Action",
        body: "This is where the translation happens. The simulation triggered a failure event. The Red X shows you exactly which NIST 800-53 control family is broken as a result.",
        interactionHint: "Hover over the column header to see the full control family name",
        primaryCTA: { label: "Continue", onClick: advance },
      };
    case "root-cause":
      return {
        stepLabel: "Step 3 of 3",
        headline: "Track the Contagion",
        body: "Risk isn't static. This topology maps the exact path of the failure. You can see how an error originating in Agent A cascaded to compromise the security controls of Agent B and C.",
        primaryCTA: { label: "Explore the Platform", onClick: advance },
      };
    default:
      return { headline: "", body: "" };
  }
}
```

---

### File 5: `client/src/components/onboarding/HookModal.tsx`

**Purpose:** Phase 1 center modal — value proposition with animated graphic.

```typescript
import { motion } from "framer-motion";
import { Shield, GitBranch, Zap } from "lucide-react";

interface HookModalProps {
  onProceed: () => void;
  onSkip: () => void;
}

export default function HookModal({ onProceed, onSkip }: HookModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {/* Scrim (full blur) */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)" }} />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        className="relative z-10 rounded-xl border p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{ 
          backgroundColor: "#1E293B", 
          borderColor: "rgba(37, 99, 235, 0.2)",
          boxShadow: "0 0 80px rgba(37, 99, 235, 0.1)"
        }}
      >
        {/* Animated Graphic: Node branching with shield */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            {/* Center node */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.2)", border: "2px solid #3B82F6" }}
            >
              <Zap className="w-5 h-5 text-blue-400" />
            </motion.div>
            {/* Branch nodes */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.3 }}
                className="absolute w-6 h-6 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: "rgba(16, 185, 129, 0.2)", 
                  border: "1.5px solid #10B981",
                  top: i === 0 ? "0%" : i === 1 ? "75%" : "75%",
                  left: i === 0 ? "50%" : i === 1 ? "10%" : "90%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <GitBranch className="w-3 h-3 text-emerald-400" />
              </motion.div>
            ))}
            {/* Shield overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <Shield className="w-6 h-6 text-blue-400" />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#E2E8F0" }}>
            Welcome to the Compliance Middleware.
          </h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#94A3B8" }}>
            AI agents don't just generate text—they take action. This platform bridges the gap between emerging agentic threats (OWASP) and established enterprise security frameworks (NIST). Let's run a quick simulation to see how a single AI failure impacts your compliance posture.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onProceed}
              className="w-full px-5 py-2.5 rounded-md text-[13px] font-bold transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: "rgba(37, 99, 235, 0.2)", 
                color: "#3B82F6",
                border: "1px solid rgba(37, 99, 235, 0.4)" 
              }}
            >
              Run First Simulation
            </button>
            <button
              onClick={onSkip}
              className="px-4 py-2 text-[11px] font-medium transition-colors hover:text-slate-300"
              style={{ color: "#64748B" }}
            >
              Skip tutorial (I know my way around)
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

---

### File 6: `client/src/components/onboarding/HandoffBanner.tsx`

**Purpose:** Phase 5 persistent dismissible banner.

```typescript
import { motion } from "framer-motion";
import { X, Zap, MousePointer } from "lucide-react";

interface HandoffBannerProps {
  onDismiss: () => void;
}

export default function HandoffBanner({ onDismiss }: HandoffBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[9990] px-4 py-3"
      style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", borderBottom: "1px solid rgba(37, 99, 235, 0.2)" }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[12px]" style={{ color: "#94A3B8" }}>
            <span className="font-bold text-slate-200">You're all set.</span>{" "}
            Try generating a <span className="font-semibold text-blue-400">Swarm</span> scenario next to see how peer-to-peer architectures change your risk profile, or click any cell in the heatmap to dive into the <span className="font-semibold text-blue-400">Evidence Explorer</span>.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-md transition-colors hover:bg-slate-700/50"
          style={{ color: "#64748B" }}
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
```

---

### Integration Point 1: `client/src/pages/ScenarioSimulator.tsx`

**Modifications required:**

1. **Add `data-onboarding` attributes** to spotlight targets:

```tsx
// On the config bar container (the flex div containing mode toggle + Generate button):
<div data-onboarding="config-bar" className="flex items-center gap-3">
  ...
</div>

// On the Generate button specifically:
<button data-onboarding="generate-button" onClick={generateScenarioHandler} ...>
  Generate Scenario
</button>

// On the cascade topology container:
<div data-onboarding="cascade-topology" className="mb-6">
  <button onClick={() => setShowCascade(!showCascade)} ...>
    Cascade Failure Topology
  </button>
  ...
</div>
```

2. **Mark the first broken cell** after scenario generation:

```tsx
// Inside the heatmap cell render loop, add data attribute to the first broken cell:
let firstBrokenMarked = false;
// ...in the cell map:
{row.cells.map((cell) => {
  const isFirstBroken = cell.state === "broken" && !firstBrokenMarked;
  if (isFirstBroken) firstBrokenMarked = true;
  return (
    <td key={cell.familyId} ...>
      <div
        data-onboarding={isFirstBroken ? "first-broken-cell" : undefined}
        ...
      >
```

3. **Register the generate handler with OnboardingContext:**

```tsx
import { useOnboarding } from "@/contexts/OnboardingContext";

// Inside ScenarioSimulator component:
const { phase, advance, registerGenerateHandler } = useOnboarding();

// Register the generate handler for onboarding to invoke
useEffect(() => {
  registerGenerateHandler(() => {
    // Force guided mode with Erroneous + Sequential + Standard
    setMode("guided");
    setGuidedRisk("Erroneous");
    setGuidedArchetype("Sequential");
    setGuidedPosture("Standard");
    // Small delay to let state settle, then generate
    setTimeout(() => {
      const fp = generateFromPreset("Erroneous", "Sequential", "Standard");
      const res = evaluateScenario(fp);
      const bias = generateBiasCurve(25);
      setScenario(fp);
      setResult(res);
      setBiasData(bias);
      setShowCascade(true);
      setScenarioGenerated(true);
      setScenarioCount(1);
      const snapshot = {
        id: `scenario-${Date.now()}`,
        timestamp: Date.now(),
        factPattern: fp,
        result: res,
        biasData: bias,
        label: "Erroneous × Sequential #1",
      };
      setActiveScenario(snapshot);
      setReplayStep(0);
    }, 100);
  });
}, [registerGenerateHandler]);

// Detect when user clicks Generate during onboarding Phase 2
// Modify generateScenarioHandler to advance onboarding:
const generateScenarioHandler = useCallback(() => {
  // ... existing generation logic ...
  
  // If onboarding is in guided-action phase, advance to translation
  if (phase === "guided-action") {
    setTimeout(() => advance(), 800); // Wait for heatmap to render
  }
}, [/* existing deps */, phase, advance]);
```

---

### Integration Point 2: `client/src/pages/Home.tsx`

**Modifications required:**

1. **Register the tab switcher with OnboardingContext:**

```tsx
import { useOnboarding } from "@/contexts/OnboardingContext";
import OnboardingController from "@/components/onboarding/OnboardingController";

// Inside Home component:
const { registerTabSwitcher } = useOnboarding();

useEffect(() => {
  registerTabSwitcher((tab: string) => {
    setView(tab as ViewType);
  });
}, [registerTabSwitcher]);
```

2. **Render the OnboardingController** at the top level of Home's return:

```tsx
return (
  <div className="min-h-screen bg-background">
    <OnboardingController />
    {/* ... rest of Home */}
  </div>
);
```

---

### Integration Point 3: `client/src/App.tsx`

**Add OnboardingProvider to the provider tree:**

```tsx
import { OnboardingProvider } from "./contexts/OnboardingContext";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <ScenarioProvider>
          <OnboardingProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </OnboardingProvider>
        </ScenarioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

### Optional: "Replay Tutorial" Affordance

Add to the platform's footer or an info menu:

```tsx
import { useOnboarding } from "@/contexts/OnboardingContext";

function ReplayTutorialButton() {
  const { restart } = useOnboarding();
  return (
    <button onClick={restart} className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors">
      Replay Tutorial
    </button>
  );
}
```

---

## Execution Sequence

| Step | Action | Validates |
|---|---|---|
| 1 | Create `OnboardingContext.tsx` | State machine compiles, localStorage read/write works |
| 2 | Create `onboarding/` component directory with Scrim, SpotlightTooltip, HookModal, HandoffBanner | Components render in isolation |
| 3 | Create `OnboardingController.tsx` | Phase transitions fire, spotlight positions compute |
| 4 | Add `OnboardingProvider` to `App.tsx` | No runtime errors, context available |
| 5 | Add `data-onboarding` attributes to ScenarioSimulator | Attributes present in DOM |
| 6 | Register generate handler + tab switcher | Cross-component coordination works |
| 7 | Clear localStorage, reload — verify full 5-phase flow | End-to-end golden path |
| 8 | Click "Skip" in Phase 1 — verify immediate dismiss | Skip path works |
| 9 | Reload after completion — verify onboarding does not re-fire | Persistence works |
| 10 | Click "Replay Tutorial" — verify full re-run | Reset path works |

---

## File Manifest

| File | Lines (est.) | Purpose |
|---|---|---|
| `client/src/contexts/OnboardingContext.tsx` | ~110 | State machine + persistence + coordination |
| `client/src/components/onboarding/Scrim.tsx` | ~55 | SVG-masked viewport overlay |
| `client/src/components/onboarding/SpotlightTooltip.tsx` | ~95 | Positioned phase-specific tooltip |
| `client/src/components/onboarding/OnboardingController.tsx` | ~165 | Phase orchestrator + DOM observer |
| `client/src/components/onboarding/HookModal.tsx` | ~95 | Phase 1 center modal |
| `client/src/components/onboarding/HandoffBanner.tsx` | ~45 | Phase 5 dismissible banner |
| **Total new code** | **~565** | |
| Modifications to `ScenarioSimulator.tsx` | ~30 lines added | data attributes + handler registration |
| Modifications to `Home.tsx` | ~10 lines added | tab switcher registration + controller render |
| Modifications to `App.tsx` | ~3 lines added | provider wrapping |
