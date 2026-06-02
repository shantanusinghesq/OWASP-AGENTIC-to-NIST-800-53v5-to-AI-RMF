/**
 * ScenarioContext — Global Scenario State Persistence
 * 
 * Swiss/Bauhaus Design System: Slate + Cobalt Blue
 * 
 * Provides scenario-locked global views across all tabs.
 * When a scenario is generated, it persists as the "active scenario"
 * and can be applied as filters to Evidence Explorer and Heatmaps.
 * Also supports pinning scenarios for split-screen comparison.
 */

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { FactPattern, ScenarioResult } from "@/lib/scrambler-types";
import type { BiasDataPoint } from "@/lib/scrambler-bias-model";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ScenarioSnapshot {
  id: string;
  timestamp: number;
  factPattern: FactPattern;
  result: ScenarioResult;
  biasData: BiasDataPoint[];
  label: string;
}

export interface CascadeNode {
  id: string;
  label: string;
  type: "coordinator" | "agent" | "risk" | "control";
  x: number;
  y: number;
  failed: boolean;
  failedAt?: number; // timeline step
}

export interface CascadeEdge {
  source: string;
  target: string;
  type: "command" | "peer" | "propagation";
  activatedAt?: number; // timeline step
  label?: string;
}

export interface CascadeGraph {
  nodes: CascadeNode[];
  edges: CascadeEdge[];
  totalSteps: number;
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

// ─── Cascade Graph Generator ────────────────────────────────────────────────

function generateCascadeGraph(fp: FactPattern, result: ScenarioResult): CascadeGraph {
  const { agent_archetype, risk_category, control_state } = fp;
  const brokenFamilies = Array.from(
    new Set(result.controls_evaluated.filter(c => c.state === "broken").map(c => c.family))
  );

  const nodes: CascadeNode[] = [];
  const edges: CascadeEdge[] = [];
  let totalSteps = 1;

  // Layout constants
  const cx = 250;
  const cy = 200;
  const radius = 140;

  switch (agent_archetype) {
    case "Single": {
      nodes.push({ id: "agent-a", label: "Agent", type: "agent", x: cx, y: cy, failed: brokenFamilies.length > 0, failedAt: 1 });
      brokenFamilies.forEach((fam, i) => {
        const angle = (i / Math.max(brokenFamilies.length, 1)) * Math.PI * 2 - Math.PI / 2;
        nodes.push({
          id: `risk-${fam}`, label: fam, type: "control", x: cx + Math.cos(angle) * 100, y: cy + Math.sin(angle) * 100, failed: true, failedAt: 2,
        });
        edges.push({ source: "agent-a", target: `risk-${fam}`, type: "propagation", activatedAt: 1 });
      });
      totalSteps = 2;
      break;
    }
    case "Sequential": {
      const agents = ["Agent A", "Agent B", "Agent C"];
      agents.forEach((label, i) => {
        const x = 80 + i * 170;
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y: cy, failed: i > 0 && brokenFamilies.length > 0, failedAt: i + 1 });
        if (i > 0) edges.push({ source: `agent-${i - 1}`, target: `agent-${i}`, type: "command", activatedAt: i });
      });
      // Add risk nodes below the chain
      brokenFamilies.slice(0, 4).forEach((fam, i) => {
        nodes.push({ id: `risk-${fam}`, label: fam, type: "control", x: 80 + i * 130, y: cy + 120, failed: true, failedAt: 3 });
        edges.push({ source: "agent-2", target: `risk-${fam}`, type: "propagation", activatedAt: 3 });
      });
      totalSteps = 4;
      break;
    }
    case "Supervisor": {
      nodes.push({ id: "supervisor", label: "Supervisor", type: "coordinator", x: cx, y: 80, failed: false, failedAt: undefined });
      const subAgents = ["Agent A", "Agent B", "Agent C"];
      subAgents.forEach((label, i) => {
        const angle = ((i + 0.5) / subAgents.length) * Math.PI + Math.PI * 0.1;
        const x = cx + Math.cos(angle) * radius;
        const y = 80 + Math.sin(angle) * radius;
        const isFailed = i < brokenFamilies.length;
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y, failed: isFailed, failedAt: isFailed ? i + 2 : undefined });
        edges.push({ source: "supervisor", target: `agent-${i}`, type: "command", activatedAt: 1 });
      });
      // Risk propagation from failed agents
      brokenFamilies.slice(0, 3).forEach((fam, i) => {
        nodes.push({ id: `risk-${fam}`, label: fam, type: "control", x: 80 + i * 150, y: cy + 140, failed: true, failedAt: 4 });
        edges.push({ source: `agent-${i}`, target: `risk-${fam}`, type: "propagation", activatedAt: 3 });
      });
      totalSteps = 5;
      break;
    }
    case "Swarm": {
      // Coordinator at center
      nodes.push({ id: "coordinator", label: "Coordinator", type: "coordinator", x: cx, y: cy, failed: brokenFamilies.length > 3, failedAt: brokenFamilies.length > 3 ? 5 : undefined });
      // Swarm agents in a hexagonal ring
      const swarmAgents = ["Agent A", "Agent B", "Agent C", "Agent D", "Agent E", "Agent F"];
      swarmAgents.forEach((label, i) => {
        const angle = (i / swarmAgents.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const isFailed = i < Math.min(brokenFamilies.length, 4);
        nodes.push({ id: `agent-${i}`, label, type: "agent", x, y, failed: isFailed, failedAt: isFailed ? i + 1 : undefined });
        // Peer connections (mesh)
        if (i > 0) edges.push({ source: `agent-${i - 1}`, target: `agent-${i}`, type: "peer", activatedAt: Math.ceil(i / 2) });
        edges.push({ source: "coordinator", target: `agent-${i}`, type: "command", activatedAt: 1 });
      });
      // Close the ring
      edges.push({ source: `agent-${swarmAgents.length - 1}`, target: "agent-0", type: "peer", activatedAt: 3 });
      // Cross connections for mesh
      edges.push({ source: "agent-0", target: "agent-3", type: "peer", activatedAt: 2 });
      edges.push({ source: "agent-1", target: "agent-4", type: "peer", activatedAt: 3 });
      edges.push({ source: "agent-2", target: "agent-5", type: "peer", activatedAt: 4 });
      totalSteps = 6;
      break;
    }
  }

  return { nodes, edges, totalSteps };
}

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
