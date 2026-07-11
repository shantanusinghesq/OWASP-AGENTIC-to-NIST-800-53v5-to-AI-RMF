/**
 * OnboardingContext — Scrim & Spotlight State Machine
 * 
 * Manages the 5-phase guided onboarding sequence:
 * hook → guided-action → translation → root-cause → handoff → inactive
 * 
 * Persists completion state in localStorage (key: agentic_risk_onboarding_v1)
 * Coordinates cross-component actions via registered callbacks.
 *
 * Imperative registration pattern (deliberately kept): components hand this
 * context a callback via registerGenerateHandler / registerTabSwitcher, and the
 * onboarding flow fires them via triggerGenerate / switchToSimulator. This lets
 * onboarding drive UI it does not own, without prop drilling or event buses.
 * Registration sites:
 *   - features/simulator/ScenarioSimulator.tsx → registerGenerateHandler
 *   - pages/Home.tsx → registerTabSwitcher
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type OnboardingPhase =
  | "inactive"
  | "hook"
  | "guided-action"
  | "translation"
  | "root-cause"
  | "handoff";

interface OnboardingContextValue {
  phase: OnboardingPhase;
  isActive: boolean;
  advance: () => void;
  skip: () => void;
  restart: () => void;
  registerGenerateHandler: (handler: () => void) => void;
  triggerGenerate: () => void;
  registerTabSwitcher: (switcher: (tab: string) => void) => void;
  switchToSimulator: () => void;
}

const STORAGE_KEY = "agentic_risk_onboarding_v1";
const PHASE_SEQUENCE: OnboardingPhase[] = [
  "hook", "guided-action", "translation", "root-cause", "handoff",
];

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<OnboardingPhase>("inactive");
  const generateHandlerRef = useRef<(() => void) | null>(null);
  const tabSwitcherRef = useRef<((tab: string) => void) | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setPhase("hook"), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const isActive = phase !== "inactive";

  const advance = useCallback(() => {
    setPhase((current) => {
      const idx = PHASE_SEQUENCE.indexOf(current);
      if (idx === -1 || idx === PHASE_SEQUENCE.length - 1) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          completedAt: new Date().toISOString(),
          version: 1,
        }));
        return "inactive";
      }
      return PHASE_SEQUENCE[idx + 1];
    });
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      skippedAt: new Date().toISOString(),
      version: 1,
    }));
    setPhase("inactive");
  }, []);

  const restart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("hook");
  }, []);

  const registerGenerateHandler = useCallback((handler: () => void) => {
    generateHandlerRef.current = handler;
  }, []);

  const triggerGenerate = useCallback(() => {
    if (generateHandlerRef.current) generateHandlerRef.current();
  }, []);

  const registerTabSwitcher = useCallback((switcher: (tab: string) => void) => {
    tabSwitcherRef.current = switcher;
  }, []);

  const switchToSimulator = useCallback(() => {
    if (tabSwitcherRef.current) tabSwitcherRef.current("simulator");
  }, []);

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
