/**
 * ScenarioContext — Global Scenario State Persistence
 *
 * Swiss/Bauhaus Design System: Slate + Cobalt Blue
 *
 * Provides scenario-locked global views across all tabs.
 * When a scenario is generated, it persists as the "active scenario"
 * and can be applied as filters to Evidence Explorer and Heatmaps.
 * Also supports pinning scenarios for split-screen comparison.
 * Cascade topology layout lives in engine/cascade-graph (pure); this
 * context only memoizes it against the active scenario.
 */

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { FactPattern, ScenarioResult } from "./engine/types";
import type { BiasDataPoint } from "./engine/bias-model";
import { generateCascadeGraph, type CascadeGraph } from "./engine/cascade-graph";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ScenarioSnapshot {
  id: string;
  timestamp: number;
  factPattern: FactPattern;
  result: ScenarioResult;
  biasData: BiasDataPoint[];
  label: string;
  resultSource?: "scrambler" | "diagram";
}

export interface AnalysisPanelState {
  isOpen: boolean;
  selectedCell: { asiId: string; familyId: string } | null;
  selectedRow: string | null;
}

interface ScenarioContextValue {
  // Active scenario (persists across tabs)
  activeScenario: ScenarioSnapshot | null;
  setActiveScenario: (snapshot: ScenarioSnapshot | null) => void;

  // Scenario lock indicator
  isScenarioLocked: boolean;
  lockScenario: () => void;
  unlockScenario: () => void;

  // Pinned scenarios for comparison
  pinnedScenarios: ScenarioSnapshot[];
  pinScenario: (snapshot: ScenarioSnapshot) => void;
  unpinScenario: (id: string) => void;
  clearPinned: () => void;

  // Split-screen mode
  splitMode: boolean;
  setSplitMode: (v: boolean) => void;
  comparisonScenario: ScenarioSnapshot | null;
  setComparisonScenario: (s: ScenarioSnapshot | null) => void;

  // Cascade graph (computed from active scenario)
  cascadeGraph: CascadeGraph | null;

  // Analysis panel state
  analysisPanel: AnalysisPanelState;
  openAnalysisPanel: (cell?: { asiId: string; familyId: string }, row?: string) => void;
  closeAnalysisPanel: () => void;

  // Deep link navigation
  navigateToEvidence: (asiId: string, familyId?: string) => void;
  pendingEvidenceFilter: { asiId: string; familyId?: string } | null;
  clearPendingFilter: () => void;

  // Timeline replay
  replayStep: number;
  setReplayStep: (step: number) => void;
  isReplaying: boolean;
  setIsReplaying: (v: boolean) => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [activeScenario, setActiveScenario] = useState<ScenarioSnapshot | null>(null);
  const [isScenarioLocked, setIsScenarioLocked] = useState(false);
  const [pinnedScenarios, setPinnedScenarios] = useState<ScenarioSnapshot[]>([]);
  const [splitMode, setSplitMode] = useState(false);
  const [comparisonScenario, setComparisonScenario] = useState<ScenarioSnapshot | null>(null);
  const [analysisPanel, setAnalysisPanel] = useState<AnalysisPanelState>({ isOpen: false, selectedCell: null, selectedRow: null });
  const [pendingEvidenceFilter, setPendingEvidenceFilter] = useState<{ asiId: string; familyId?: string } | null>(null);
  const [replayStep, setReplayStep] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  const lockScenario = useCallback(() => setIsScenarioLocked(true), []);
  const unlockScenario = useCallback(() => setIsScenarioLocked(false), []);

  const pinScenario = useCallback((snapshot: ScenarioSnapshot) => {
    setPinnedScenarios(prev => {
      if (prev.find(p => p.id === snapshot.id)) return prev;
      return [...prev.slice(-4), snapshot]; // Keep max 5
    });
  }, []);

  const unpinScenario = useCallback((id: string) => {
    setPinnedScenarios(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearPinned = useCallback(() => setPinnedScenarios([]), []);

  const openAnalysisPanel = useCallback((cell?: { asiId: string; familyId: string }, row?: string) => {
    setAnalysisPanel({ isOpen: true, selectedCell: cell || null, selectedRow: row || null });
  }, []);

  const closeAnalysisPanel = useCallback(() => {
    setAnalysisPanel({ isOpen: false, selectedCell: null, selectedRow: null });
  }, []);

  const navigateToEvidence = useCallback((asiId: string, familyId?: string) => {
    setPendingEvidenceFilter({ asiId, familyId });
  }, []);

  const clearPendingFilter = useCallback(() => setPendingEvidenceFilter(null), []);

  const cascadeGraph = useMemo(() => {
    if (!activeScenario) return null;
    return generateCascadeGraph(activeScenario.factPattern, activeScenario.result);
  }, [activeScenario]);

  const value: ScenarioContextValue = {
    activeScenario, setActiveScenario,
    isScenarioLocked, lockScenario, unlockScenario,
    pinnedScenarios, pinScenario, unpinScenario, clearPinned,
    splitMode, setSplitMode, comparisonScenario, setComparisonScenario,
    cascadeGraph,
    analysisPanel, openAnalysisPanel, closeAnalysisPanel,
    navigateToEvidence, pendingEvidenceFilter, clearPendingFilter,
    replayStep, setReplayStep, isReplaying, setIsReplaying,
  };

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within ScenarioProvider");
  return ctx;
}
