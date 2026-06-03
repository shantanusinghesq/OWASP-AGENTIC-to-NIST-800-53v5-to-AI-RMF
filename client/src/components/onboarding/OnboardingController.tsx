/**
 * OnboardingController — Phase Orchestrator
 * 
 * Manages the 5-phase Scrim & Spotlight sequence:
 * 1. Hook (center modal)
 * 2. Guided Action (spotlight config bar → user clicks Generate)
 * 3. Translation (spotlight first broken heatmap cell) — scrolls DOWN to target
 * 4. Root Cause (spotlight cascade topology) — scrolls UP to target
 * 5. Handoff (dismissible banner)
 * 
 * AUTO-SCROLL: Each phase transition scrolls the viewport to the next spotlight
 * target so first-time users never need to discover scroll positions manually.
 * 
 * Uses MutationObserver to wait for DOM elements before positioning spotlights.
 * Elevates spotlight targets above the scrim via z-index.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/contexts/OnboardingContext";
import Scrim from "./Scrim";
import SpotlightTooltip from "./SpotlightTooltip";
import HookModal from "./HookModal";
import HandoffBanner from "./HandoffBanner";

// data-onboarding attribute selectors
const TARGETS = {
  configBar: '[data-onboarding="config-bar"]',
  generateButton: '[data-onboarding="generate-button"]',
  firstBrokenCell: '[data-onboarding="first-broken-cell"]',
  cascadeTopology: '[data-onboarding="cascade-topology"]',
};

// Scroll offset to keep the target comfortably visible (not pinned to edge)
const SCROLL_OFFSET = 120;

/**
 * Smooth-scroll an element into view with a fixed top offset,
 * then invoke a callback once the scroll settles.
 */
function scrollToTarget(el: HTMLElement, callback?: () => void) {
  const rect = el.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top - SCROLL_OFFSET;

  window.scrollTo({ top: Math.max(0, absoluteTop), behavior: "smooth" });

  // Wait for scroll to settle before positioning the spotlight
  const settle = setTimeout(() => {
    callback?.();
  }, 500);

  return () => clearTimeout(settle);
}

export default function OnboardingController() {
  const { phase, isActive, advance, skip, switchToSimulator } = useOnboarding();
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const observerRef = useRef<MutationObserver | null>(null);
  const elevatedEls = useRef<HTMLElement[]>([]);
  const scrollCleanupRef = useRef<(() => void) | null>(null);

  // ─── Elevate element above scrim ──────────────────────────────────────────
  const elevateElement = useCallback((el: HTMLElement) => {
    el.style.position = "relative";
    el.style.zIndex = "9999";
    elevatedEls.current.push(el);
  }, []);

  // ─── Clean up all elevated elements ───────────────────────────────────────
  const cleanupElevation = useCallback(() => {
    elevatedEls.current.forEach((el) => {
      el.style.zIndex = "";
      el.style.position = "";
    });
    elevatedEls.current = [];
  }, []);

  // ─── Find element, scroll to it, then position spotlight ─────────────────
  const spotlightElement = useCallback(
    (selector: string, position: "top" | "bottom" | "left" | "right" = "bottom", shouldScroll = true) => {
      const tryFind = (): boolean => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          if (shouldScroll) {
            // Scroll to the element first, then position spotlight after settling
            scrollCleanupRef.current?.();
            scrollCleanupRef.current = scrollToTarget(el, () => {
              const rect = el.getBoundingClientRect();
              setSpotlightRect(rect);
              setTooltipPosition(position);
              cleanupElevation();
              elevateElement(el);
            });
          } else {
            // No scroll needed — position immediately
            const rect = el.getBoundingClientRect();
            setSpotlightRect(rect);
            setTooltipPosition(position);
            cleanupElevation();
            elevateElement(el);
          }
          return true;
        }
        return false;
      };

      if (tryFind()) return;

      // Element not yet in DOM — observe mutations
      observerRef.current?.disconnect();
      observerRef.current = new MutationObserver(() => {
        if (tryFind()) {
          observerRef.current?.disconnect();
        }
      });
      observerRef.current.observe(document.body, { childList: true, subtree: true });
    },
    [cleanupElevation, elevateElement]
  );

  // ─── Phase transition effects ─────────────────────────────────────────────
  useEffect(() => {
    observerRef.current?.disconnect();
    scrollCleanupRef.current?.();

    switch (phase) {
      case "hook":
        setSpotlightRect(null);
        cleanupElevation();
        break;

      case "guided-action":
        // Phase 2: Switch to simulator tab, then spotlight the config bar
        // The config bar is near the top, so we scroll UP to "Start Here"
        switchToSimulator();
        setTimeout(() => {
          spotlightElement(TARGETS.configBar, "bottom", true);
        }, 350);
        break;

      case "translation":
        // Phase 3: Scroll DOWN to the first broken heatmap cell
        setTimeout(() => {
          spotlightElement(TARGETS.firstBrokenCell, "right", true);
        }, 600);
        break;

      case "root-cause":
        // Phase 4: Scroll UP to the cascade topology (it's above the heatmap)
        setTimeout(() => {
          spotlightElement(TARGETS.cascadeTopology, "bottom", true);
        }, 300);
        break;

      case "handoff":
        setSpotlightRect(null);
        cleanupElevation();
        // Scroll back to the top so the user sees the full platform
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;

      case "inactive":
        setSpotlightRect(null);
        cleanupElevation();
        break;
    }

    return () => {
      observerRef.current?.disconnect();
      scrollCleanupRef.current?.();
    };
  }, [phase, switchToSimulator, spotlightElement, cleanupElevation]);

  // ─── Recompute spotlight on window resize ─────────────────────────────────
  useEffect(() => {
    if (!isActive || !spotlightRect) return;
    const handleResize = () => {
      const elevated = elevatedEls.current[elevatedEls.current.length - 1];
      if (elevated) {
        setSpotlightRect(elevated.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isActive, spotlightRect]);

  // ─── Render nothing if inactive and not in handoff ────────────────────────
  if (!isActive && phase !== "handoff") return null;

  return (
    <>
      {/* Phase 1: Hook Modal */}
      <AnimatePresence>
        {phase === "hook" && (
          <HookModal onProceed={advance} onSkip={skip} />
        )}
      </AnimatePresence>

      {/* Phases 2–4: Scrim + Spotlight Tooltip */}
      {(phase === "guided-action" || phase === "translation" || phase === "root-cause") && (
        <>
          <Scrim visible={true} spotlightRect={spotlightRect} />
          <AnimatePresence mode="wait">
            <SpotlightTooltip
              key={phase}
              targetRect={spotlightRect}
              position={tooltipPosition}
              {...getPhaseTooltipProps(phase, advance)}
            />
          </AnimatePresence>
        </>
      )}

      {/* Phase 5: Handoff Banner */}
      <AnimatePresence>
        {phase === "handoff" && <HandoffBanner onDismiss={advance} />}
      </AnimatePresence>
    </>
  );
}

// ─── Phase-specific tooltip content ─────────────────────────────────────────

function getPhaseTooltipProps(phase: string, advance: () => void) {
  switch (phase) {
    case "guided-action":
      return {
        stepLabel: "Start Here",
        headline: "Set the Parameters",
        body: "We've pre-selected a standard scenario: an Erroneous risk occurring in a Sequential agent chain. This is a common hallucination pattern.",
        interactionHint: 'Click the "Generate Scenario" button to proceed.',
      };
    case "translation":
      return {
        stepLabel: "Step 2 of 3",
        headline: "The Crosswalk in Action",
        body: "This is where the translation happens. The simulation triggered a failure event. The Red X shows you exactly which NIST 800-53 control family is broken as a result.",
        interactionHint: "Hover over the column header to see the full control family name.",
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
