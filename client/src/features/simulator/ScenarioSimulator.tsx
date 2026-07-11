/**
 * Scenario Simulator — v1.0 Relational Risk Engineering Platform
 * 
 * Swiss/Bauhaus Design System: Slate + Cobalt Blue
 * - Geometric data presentation with clean grid structures
 * - Monospace identifiers (JetBrains Mono), Inter for body
 * - Palette: Slate-900 base, Cobalt-500 accent, Red-600 failures, Emerald-500 active
 * 
 * Architecture:
 * - Global state via ScenarioContext (persists across tabs)
 * - CascadeGraph: Interactive node-link failure topology with timeline replay
 * - AnalysisPanel: Slide-in causal analysis panel (replaces legacy narrative)
 * - ScenarioComparison: Split-screen comparative mode
 * - Utility Action Bar: Pin, Compare, Export, Deep-link actions
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OWASP_ASI,
  NIST_800_53,
} from "@/data/crosswalk";
import { generateFactPattern, generateFromPreset } from "./engine/generator";
import { evaluateScenario, getCellState } from "./engine/evaluator";
import { RISK_TO_ASI, FAMILY_TO_PRIMARY_BOOLEAN } from "./engine/mappings";
import { generateBiasCurve, getOversightLoad, isCapacityExceeded } from "./engine/bias-model";
import { CARD_INFO } from "./engine/info-content";
import { generateScenarioPreview } from "./engine/preview";
import { FAMILY_FULL_NAMES } from "./engine/narrative";
import type { FactPattern, GovernancePosture } from "./engine/types";
import type { BiasDataPoint } from "./engine/bias-model";
import { useScenario, type ScenarioSnapshot } from "./ScenarioContext";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import CascadeGraph from "./CascadeGraph";
import ScenarioComparison from "./ScenarioComparison";
import AnalysisPanel from "./AnalysisPanel";
import DiagramAnalyzer from "@/features/diagram/DiagramAnalyzer";
import type { PatternEvaluationOutput } from "@/features/diagram/engine/pattern-evaluator";
import {
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Shield,
  Target,
  Gauge,
  Info,
  X,
  Eye,
  ArrowRight,
  Pin,
  ArrowLeftRight,
  Layers,
  Network,
  Upload,
} from "lucide-react";

// ─── Design Tokens (Swiss/Bauhaus) ──────────────────────────────────────────

const PALETTE = {
  bg: "#0F172A",
  surface: "#1E293B",
  border: "#334155",
  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  textCaption: "#64748B",
  cobalt: "#2563EB",
  cobaltLight: "#3B82F6",
  cobaltMuted: "rgba(37,99,235,0.15)",
  red: "#DC2626",
  redMuted: "rgba(220,38,38,0.15)",
  emerald: "#10B981",
  emeraldMuted: "rgba(16,185,129,0.15)",
  amber: "#F59E0B",
  amberMuted: "rgba(245,158,11,0.15)",
};

const CELL_COLORS = {
  active: { bg: "#065F46", border: "#10B981", text: "#6EE7B7", label: "Active" },
  broken: { bg: "#7F1D1D", border: "#EF4444", text: "#FCA5A5", label: "Broken" },
  irrelevant: { bg: "#1E293B", border: "#334155", text: "#475569", label: "N/A" },
} as const;

const RISK_COLORS: Record<string, string> = {
  Erroneous: "#F59E0B",
  Unauthorised: "#EF4444",
  Biased: "#A855F7",
  DataBreach: "#3B82F6",
  Disruption: "#F97316",
};

const ARCHETYPE_LABELS: Record<string, string> = {
  Single: "Single Agent",
  Sequential: "Sequential Chain",
  Supervisor: "Supervisor Pattern",
  Swarm: "Swarm Architecture",
};

// ─── Toast Utility ──────────────────────────────────────────────────────────

function showToast(message: string, duration = 4000) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, duration);
}

// ─── Colorblind-Safe Heatmap Icons ──────────────────────────────────────────

function ActiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="#10B981" opacity="0.3" />
      <path d="M4.5 8.5L7 11L11.5 5.5" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function BrokenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="8" y="1.5" width="9" height="9" rx="1" transform="rotate(45 8 1.5)" fill="#EF4444" opacity="0.3" />
      <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IrrelevantIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <line x1="4" y1="8" x2="12" y2="8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Info Bubble Component ──────────────────────────────────────────────────

function InfoBubble({ cardKey, onClose, bubbleRef }: { cardKey: string; onClose: () => void; bubbleRef: React.RefObject<HTMLDivElement | null> }) {
  const info = CARD_INFO[cardKey];
  if (!info) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute z-50 left-0 top-full mt-2" ref={bubbleRef}>
      <div className="rounded-lg p-3 border shadow-xl overflow-hidden flex flex-col" style={{ backgroundColor: PALETTE.cobalt, borderColor: "rgba(255,255,255,0.2)", width: 320, height: 280, fontSize: 14, lineHeight: 1.5 }}>
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="flex items-start justify-between mb-2 sticky top-0">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-xs font-bold text-white">{info.title}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-0.5 rounded hover:bg-blue-600 transition-colors shrink-0" aria-label="Close tooltip">
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-[13px] leading-relaxed mb-3 text-blue-100">{info.description}</p>
          {info.examples.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1 text-blue-200">Real-World Examples</div>
              <ul className="space-y-1">
                {info.examples.map((ex, i) => (
                  <li key={i} className="text-[12px] flex items-start gap-1.5 text-blue-100"><span className="text-blue-300 mt-0.5 shrink-0">&#x2022;</span>{ex}</li>
                ))}
              </ul>
            </div>
          )}
          {info.relatedASI.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {info.relatedASI.map((asi) => (<span key={asi} className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/10 text-white border border-white/20">{asi}</span>))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Selectable Card ────────────────────────────────────────────────────────

function SelectableCard({ cardKey, isSelected, accentColor, onSelect, openTooltipId, setOpenTooltipId, bubbleRef }: {
  cardKey: string; isSelected: boolean; accentColor: string; onSelect: (key: string) => void;
  openTooltipId: string | null; setOpenTooltipId: (id: string | null) => void; bubbleRef: React.RefObject<HTMLDivElement | null>;
}) {
  const isInfoOpen = openTooltipId === cardKey;
  return (
    <div className="relative">
      <button onClick={() => onSelect(cardKey)} className="px-2.5 py-1.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1"
        style={{ backgroundColor: isSelected ? `${accentColor}20` : "transparent", color: isSelected ? accentColor : PALETTE.textSecondary, border: `1.5px solid ${isSelected ? accentColor : PALETTE.border}` }}>
        {cardKey}
        <span onClick={(e) => { e.stopPropagation(); setOpenTooltipId(isInfoOpen ? null : cardKey); }} className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-help" role="button" aria-label={`More info about ${cardKey}`} tabIndex={0}>
          <Info className="w-3 h-3" />
        </span>
      </button>
      <AnimatePresence>{isInfoOpen && <InfoBubble cardKey={cardKey} onClose={() => setOpenTooltipId(null)} bubbleRef={bubbleRef} />}</AnimatePresence>
    </div>
  );
}

// ─── Control Toggle ─────────────────────────────────────────────────────────

function ControlToggle({ label, value, familyIds }: { label: string; value: boolean; familyIds: string[] }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded" style={{ backgroundColor: value ? PALETTE.emeraldMuted : PALETTE.redMuted }}>
      <div className="flex items-center gap-2">
        {value ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
        <span className="text-[11px]" style={{ color: PALETTE.text }}>{label}</span>
      </div>
      <div className="flex gap-1">
        {familyIds.map((fam) => (
          <span key={fam} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: value ? PALETTE.emeraldMuted : PALETTE.redMuted, color: value ? "#6EE7B7" : "#FCA5A5" }}>{fam}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Bias Chart ─────────────────────────────────────────────────────────────

function BiasChart({ data, archetype, actionsPerHr }: { data: BiasDataPoint[]; archetype: string; actionsPerHr: number }) {
  if (data.length === 0) return null;
  const maxAction = Math.max(...data.map((d) => d.action));
  const chartWidth = 100;
  const chartHeight = 60;
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 12}`} className="w-full h-28" role="img" aria-label={`Automation Bias chart for ${archetype} at ${actionsPerHr} actions/hr`}>
        <title>Automation Bias — Human Oversight Degradation</title>
        {[95, 82, 65].map((pct) => {
          const y = chartHeight - ((pct - 60) / 40) * chartHeight;
          return (<g key={pct}><line x1="0" y1={y} x2={chartWidth} y2={y} stroke="rgba(148,163,184,0.15)" strokeWidth="0.3" /><text x="1" y={y - 1.5} fill={PALETTE.textSecondary} fontSize="3.5" fontWeight="500">{pct}%</text></g>);
        })}
        <polyline fill="none" stroke={PALETTE.amber} strokeWidth="0.8" points={data.map((d) => { const x = (d.action / maxAction) * (chartWidth - 4) + 2; const y = chartHeight - ((d.accuracy - 60) / 40) * chartHeight; return `${x},${y}`; }).join(" ")} />
        {data.map((d) => { const x = (d.action / maxAction) * (chartWidth - 4) + 2; const y = chartHeight - ((d.accuracy - 60) / 40) * chartHeight; const isSpike = d.action === 12; return (
          <g key={d.action}><circle cx={x} cy={y} r={isSpike ? 1.5 : 0.8} fill={isSpike ? PALETTE.red : PALETTE.amber} />
          {(d.action === 1 || d.action === 12 || d.action === maxAction || d.action === 5) && (<><rect x={x - 4} y={y - 6} width="8" height="4" rx="0.5" fill="rgba(15,23,42,0.85)" /><text x={x} y={y - 3} fill={PALETTE.text} fontSize="2.8" textAnchor="middle" fontWeight="600">{Math.round(d.accuracy)}%</text></>)}</g>
        ); })}
        {[1, 5, 10, 15, 20, 25].map((a) => { if (a > maxAction) return null; const x = (a / maxAction) * (chartWidth - 4) + 2; return (<text key={a} x={x} y={chartHeight + 5} fill={PALETTE.textSecondary} fontSize="3.5" textAnchor="middle" fontWeight="500">{a}</text>); })}
        <text x={chartWidth / 2} y={chartHeight + 10} fill={PALETTE.textSecondary} fontSize="3" textAnchor="middle">Action Count →</text>
      </svg>
    </div>
  );
}

// ─── Utility Action Bar ─────────────────────────────────────────────────────

function ActionBar({ onPin, onCompare, isPinned }: { onPin: () => void; onCompare: () => void; isPinned: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onPin} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all hover:scale-105" style={{ backgroundColor: isPinned ? PALETTE.amberMuted : "transparent", color: isPinned ? PALETTE.amber : PALETTE.textSecondary, border: `1px solid ${isPinned ? PALETTE.amber + "40" : PALETTE.border}` }}>
        <Pin className="w-3 h-3" />
        {isPinned ? "Pinned" : "Pin"}
      </button>
      <button onClick={onCompare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all hover:scale-105" style={{ backgroundColor: "transparent", color: PALETTE.cobaltLight, border: `1px solid ${PALETTE.cobalt}40` }}>
        <ArrowLeftRight className="w-3 h-3" />
        Compare
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ScenarioSimulator() {
  const { activeScenario, setActiveScenario, pinScenario, pinnedScenarios, splitMode, setSplitMode, openAnalysisPanel, navigateToEvidence, setReplayStep } = useScenario();
  const { phase, advance, registerGenerateHandler } = useOnboarding();

  const [scenario, setScenario] = useState<FactPattern | null>(null);
  const [result, setResult] = useState<ReturnType<typeof evaluateScenario> | null>(null);
  const [biasData, setBiasData] = useState<BiasDataPoint[]>([]);
  const [mode, setMode] = useState<"random" | "guided">("random");
  const [showCascade, setShowCascade] = useState(true);
  const [scenarioCount, setScenarioCount] = useState(0);
  const [scenarioGenerated, setScenarioGenerated] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [showBias, setShowBias] = useState(false);
  const [diagramSidebarOpen, setDiagramSidebarOpen] = useState(false);

  // Guided mode state
  const [guidedRisk, setGuidedRisk] = useState<string>("Erroneous");
  const [guidedArchetype, setGuidedArchetype] = useState<string>("Single");
  const [guidedPosture, setGuidedPosture] = useState<GovernancePosture>("Standard");

  // Tooltip state
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const resultCardsRef = useRef<HTMLDivElement>(null);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // Escape key dismisses tooltip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenTooltipId(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Click-outside dismisses tooltip
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openTooltipId && bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[aria-label^="More info"]')) setOpenTooltipId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openTooltipId]);

  // Register onboarding generate handler
  useEffect(() => {
    registerGenerateHandler(() => {
      // Pre-select Erroneous + Sequential + Standard for the tutorial
      setMode("guided");
      setGuidedRisk("Erroneous");
      setGuidedArchetype("Sequential");
      setGuidedPosture("Standard");
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
          label: "Erroneous \u00d7 Sequential #1",
        };
        setActiveScenario(snapshot);
        setReplayStep(0);
      }, 150);
    });
  }, [registerGenerateHandler, setActiveScenario, setReplayStep]);

  // Heatmap overflow detection
  useEffect(() => {
    const el = heatmapScrollRef.current;
    if (!el) return;
    const checkOverflow = () => { el.classList.toggle('has-overflow', el.scrollWidth > el.clientWidth); };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [scenario]);

  // Scenario Preview
  const scenarioPreview = useMemo(() => {
    if (mode !== "guided") return null;
    return generateScenarioPreview(guidedRisk, guidedArchetype, guidedPosture);
  }, [mode, guidedRisk, guidedArchetype, guidedPosture]);

  // Generate Scenario Handler — now writes to global context
  const generateScenarioHandler = useCallback(() => {
    let fp: FactPattern;
    if (mode === "guided") {
      fp = generateFromPreset(guidedRisk as FactPattern["risk_category"], guidedArchetype as FactPattern["agent_archetype"], guidedPosture);
    } else {
      fp = generateFactPattern();
    }
    const res = evaluateScenario(fp);
    const bias = generateBiasCurve(25);
    setScenario(fp);
    setResult(res);
    setBiasData(bias);
    setShowCascade(true);
    setScenarioGenerated(true);
    const newCount = scenarioCount + 1;
    setScenarioCount(newCount);

    // Write to global context
    const snapshot = {
      id: `scenario-${Date.now()}`,
      timestamp: Date.now(),
      factPattern: fp,
      result: res,
      biasData: bias,
      label: `${fp.risk_category} × ${fp.agent_archetype} #${newCount}`,
    };
    setActiveScenario(snapshot);
    setReplayStep(0);

    // Pulse animation
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 700);

    // Scroll to results
    requestAnimationFrame(() => {
      const isNearTop = window.scrollY < 400;
      if (isNearTop || newCount === 1) {
        resultCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    showToast(`Scenario #${newCount} generated — ${fp.risk_category} × ${fp.agent_archetype}`);

    // Advance onboarding if in guided-action phase
    if (phase === "guided-action") {
      setTimeout(() => advance(), 800);
    }
  }, [mode, guidedRisk, guidedArchetype, guidedPosture, scenarioCount, setActiveScenario, setReplayStep, phase, advance]);

  // Diagram analysis result handler — mirrors generateScenarioHandler but
  // sources the scenario from the Architecture Diagram Analyzer sidebar
  const handleDiagramResult = useCallback((output: PatternEvaluationOutput) => {
    const snapshot: ScenarioSnapshot = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      factPattern: output.factPattern,
      result: output.result,
      biasData: output.biasData,
      label: output.label,
      resultSource: "diagram",
    };
    setActiveScenario(snapshot);
    setDiagramSidebarOpen(false);

    // Update local state to show results
    setScenario(output.factPattern);
    setResult(output.result);
    setBiasData(output.biasData);
    setShowCascade(true);
    setScenarioGenerated(true);
    setScenarioCount((c) => c + 1);
    setReplayStep(0);

    requestAnimationFrame(() => {
      resultCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    showToast(`Diagram analysis applied — ${output.label}`);
  }, [setActiveScenario, setReplayStep]);

  // Computed data
  const heatmapData = useMemo(() => {
    if (!scenario) return null;
    return OWASP_ASI.map((asi) => ({
      asiId: asi.id,
      asiName: asi.name,
      cells: NIST_800_53.map((fam) => ({ familyId: fam.id, state: getCellState(asi.id, fam.id, scenario.control_state, scenario.risk_category) })),
    }));
  }, [scenario]);

  const stats = useMemo(() => {
    if (!result) return null;
    const broken = result.controls_evaluated.filter((c) => c.state === "broken").length;
    const active = result.controls_evaluated.filter((c) => c.state === "active").length;
    const irrelevant = result.controls_evaluated.filter((c) => c.state === "irrelevant").length;
    const brokenFamilies = Array.from(new Set(result.controls_evaluated.filter((c) => c.state === "broken").map((c) => c.family)));
    const activeFamilies = Array.from(new Set(result.controls_evaluated.filter((c) => c.state === "active").map((c) => c.family)));
    return { broken, active, irrelevant, brokenFamilies, activeFamilies };
  }, [result]);

  const oversightLoad = scenario ? getOversightLoad(scenario.agent_archetype) : 0;
  const capacityExceeded = scenario ? isCapacityExceeded(scenario.agent_archetype) : false;
  const implicatedRisks = useMemo(() => scenario ? (RISK_TO_ASI[scenario.risk_category] || []) : [], [scenario]);

  // Pin handler
  const handlePin = useCallback(() => {
    if (activeScenario) pinScenario(activeScenario);
  }, [activeScenario, pinScenario]);

  const isPinned = activeScenario ? !!pinnedScenarios.find(p => p.id === activeScenario.id) : false;

  // Navigate to evidence handler
  const handleNavigateToEvidence = useCallback((asiId: string) => {
    navigateToEvidence(asiId);
  }, [navigateToEvidence]);

  return (
    <div>
      {/* ─── Header & Controls ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: PALETTE.cobaltLight }}>
            <Network className="w-4 h-4" />
            Risk Engineering Platform
          </h2>
          <p className="text-xs mt-1" style={{ color: PALETTE.textSecondary }}>
            Generate scenarios, observe cascade failures, and analyze causal control relationships across the OWASP-NIST crosswalk.
          </p>
        </div>
        <div data-onboarding="config-bar" className="flex items-center gap-3">
          <div className="flex rounded-md overflow-hidden border" style={{ borderColor: PALETTE.border }}>
            {(["random", "guided"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setOpenTooltipId(null); }} className="px-3 py-1.5 text-[11px] font-semibold transition-all"
                style={{ backgroundColor: mode === m ? PALETTE.cobaltMuted : "transparent", color: mode === m ? PALETTE.cobaltLight : PALETTE.textSecondary }}>
                {m === "random" ? "Random" : "Guided"}
              </button>
            ))}
          </div>
          <button data-onboarding="generate-button" onClick={generateScenarioHandler} className="flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-bold transition-all hover:scale-105"
            style={{ backgroundColor: PALETTE.cobaltMuted, color: PALETTE.cobaltLight, border: `1px solid ${PALETTE.cobalt}40` }}>
            <RefreshCw className="w-3.5 h-3.5" />
            Generate Scenario
            {scenarioCount > 0 && <span className="text-[10px] ml-1" style={{ color: PALETTE.textCaption }}>#{scenarioCount}</span>}
          </button>
          <button
            onClick={() => setDiagramSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors border border-slate-600"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Analyze Diagram</span>
          </button>
        </div>
      </div>

      {/* ─── Guided Mode Controls ─── */}
      <AnimatePresence>
        {mode === "guided" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
            <div className="p-4 rounded-lg border" style={{ borderColor: `${PALETTE.cobalt}30`, backgroundColor: `${PALETTE.cobalt}05` }}>
              <div className="text-[13px] mb-3 flex items-center gap-1.5" style={{ color: PALETTE.textSecondary }}>
                <Info className="w-3.5 h-3.5 shrink-0" />
                Select one option per column. Click <Info className="w-3 h-3 inline mx-0.5" /> for details.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Risk Category */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold mb-2 block" style={{ color: PALETTE.textSecondary }}>Risk Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(RISK_COLORS).map((risk) => (
                      <SelectableCard key={risk} cardKey={risk} isSelected={guidedRisk === risk} accentColor={RISK_COLORS[risk]} onSelect={setGuidedRisk} openTooltipId={openTooltipId} setOpenTooltipId={setOpenTooltipId} bubbleRef={bubbleRef} />
                    ))}
                  </div>
                </div>
                {/* Agent Archetype */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold mb-2 block" style={{ color: PALETTE.textSecondary }}>Agent Archetype</label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(ARCHETYPE_LABELS).map((arch) => (
                      <SelectableCard key={arch} cardKey={arch} isSelected={guidedArchetype === arch} accentColor={PALETTE.cobaltLight} onSelect={setGuidedArchetype} openTooltipId={openTooltipId} setOpenTooltipId={setOpenTooltipId} bubbleRef={bubbleRef} />
                    ))}
                  </div>
                </div>
                {/* Governance Posture */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold mb-2 block" style={{ color: PALETTE.textSecondary }}>Governance Posture</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["Minimal", "Standard", "Full"] as GovernancePosture[]).map((p) => (
                      <SelectableCard key={p} cardKey={p} isSelected={guidedPosture === p} accentColor={PALETTE.emerald} onSelect={(key) => setGuidedPosture(key as GovernancePosture)} openTooltipId={openTooltipId} setOpenTooltipId={setOpenTooltipId} bubbleRef={bubbleRef} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scenario Preview */}
              {scenarioPreview && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg border" style={{ borderColor: `${PALETTE.border}80`, backgroundColor: `${PALETTE.surface}80` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-3.5 h-3.5" style={{ color: PALETTE.cobaltLight }} />
                    <span className="text-[11px] font-bold" style={{ color: PALETTE.cobaltLight }}>Scenario Preview</span>
                  </div>
                  <div className="text-xs font-bold mb-2" style={{ color: PALETTE.text }}>{scenarioPreview.headline}</div>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: PALETTE.textSecondary }}>{scenarioPreview.narrative}</p>
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: PALETTE.textCaption }}>Key Questions</div>
                  <ul className="space-y-1">
                    {scenarioPreview.keyQuestions.map((q, i) => (
                      <li key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: PALETTE.textSecondary }}>
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: `${PALETTE.cobalt}80` }} />{q}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Empty State ─── */}
      {!scenarioGenerated && (
        <div className="text-center py-20" style={{ color: PALETTE.textSecondary }}>
          <Network className="w-14 h-14 mx-auto mb-4" style={{ color: PALETTE.textCaption }} />
          <div className="text-sm font-medium mb-2">No scenario generated yet</div>
          <div className="text-xs max-w-md mx-auto" style={{ color: PALETTE.textCaption }}>
            {mode === "guided"
              ? 'Select parameters above, then click "Generate Scenario" to run the simulation.'
              : 'Click "Generate Scenario" to create a randomized fact pattern and observe cascade failure propagation.'}
          </div>
        </div>
      )}

      {/* ─── Scenario Results ─── */}
      {scenario && result && stats && (
        <motion.div key={scenarioCount} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

          {/* Utility Action Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: PALETTE.textCaption }}>Scenario #{scenarioCount}</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: PALETTE.cobaltMuted, color: PALETTE.cobaltLight }}>
                {scenario.risk_category} × {scenario.agent_archetype}
              </span>
            </div>
            <ActionBar onPin={handlePin} onCompare={() => setSplitMode(!splitMode)} isPinned={isPinned} />
          </div>

          {/* Summary Cards */}
          <div ref={resultCardsRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 ${isPulsing ? 'card-pulse' : ''}`}>
            <div className="rounded-lg p-3 border" style={{ borderColor: `${RISK_COLORS[scenario.risk_category]}30`, backgroundColor: `${RISK_COLORS[scenario.risk_category]}08` }}>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: PALETTE.textSecondary }}>Risk Category</div>
              <div className="text-sm font-bold" style={{ color: RISK_COLORS[scenario.risk_category] }}>{scenario.risk_category}</div>
              <div className="text-[11px] mt-1" style={{ color: PALETTE.textSecondary }}>{implicatedRisks.length} ASI risks implicated</div>
            </div>
            <div className="rounded-lg p-3 border" style={{ borderColor: `${PALETTE.cobalt}30`, backgroundColor: PALETTE.cobaltMuted }}>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: PALETTE.textSecondary }}>Archetype</div>
              <div className="text-sm font-bold" style={{ color: PALETTE.cobaltLight }}>{ARCHETYPE_LABELS[scenario.agent_archetype]}</div>
              <div className="text-[11px] mt-1" style={{ color: PALETTE.textSecondary }}>
                {oversightLoad} actions/hr{capacityExceeded && <span className="text-red-400 ml-1">&#x26A0; Exceeded</span>}
              </div>
            </div>
            <div className="rounded-lg p-3 border" style={{ borderColor: `${PALETTE.red}30`, backgroundColor: PALETTE.redMuted }}>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: PALETTE.textSecondary }}>Broken Controls</div>
              <div className="text-sm font-bold text-red-400">{stats.broken}</div>
              <div className="text-[11px] mt-1" style={{ color: PALETTE.textSecondary }}>{stats.brokenFamilies.length} families affected</div>
            </div>
            <div className="rounded-lg p-3 border" style={{ borderColor: `${PALETTE.emerald}30`, backgroundColor: PALETTE.emeraldMuted }}>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: PALETTE.textSecondary }}>Active Controls</div>
              <div className="text-sm font-bold text-emerald-400">{stats.active}</div>
              <div className="text-[11px] mt-1" style={{ color: PALETTE.textSecondary }}>{stats.irrelevant} irrelevant</div>
            </div>
          </div>

          {/* Outcome Banner */}
          <div className="rounded-lg p-4 mb-6 border flex items-start gap-3" style={{ borderColor: result.failure_injected ? `${PALETTE.red}40` : `${PALETTE.emerald}40`, backgroundColor: result.failure_injected ? `${PALETTE.red}05` : `${PALETTE.emerald}05` }}>
            {result.failure_injected ? <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />}
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: result.failure_injected ? "#FCA5A5" : "#6EE7B7" }}>
                {result.failure_injected ? "SECURITY GAPS DETECTED" : "ALL CONTROLS EFFECTIVE"}
              </div>
              <div className="text-[12px] leading-relaxed" style={{ color: PALETTE.textSecondary }}>{result.outcome}</div>
            </div>
          </div>

          {/* ─── Cascade Failure Graph (NEW) ─── */}
          <div data-onboarding="cascade-topology" className="mb-6">
            <button onClick={() => setShowCascade(!showCascade)} className="flex items-center gap-2 text-xs font-bold transition-colors mb-3" style={{ color: PALETTE.cobaltLight }}>
              {showCascade ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <Network className="w-3.5 h-3.5" />
              Cascade Failure Topology
            </button>
            <AnimatePresence>
              {showCascade && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <CascadeGraph />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Split-Screen Comparison (NEW) ─── */}
          <AnimatePresence>
            {splitMode && (
              <div className="mb-6">
                <ScenarioComparison />
              </div>
            )}
          </AnimatePresence>

          {/* ─── Interactive Heatmap ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="text-xs font-bold flex items-center gap-1.5" style={{ color: PALETTE.cobaltLight }}>
                  <Activity className="w-3.5 h-3.5" />
                  Dynamic Heatmap — {scenario.risk_category}
                </h3>
                <div className="flex items-center gap-3">
                  {(["active", "broken", "irrelevant"] as const).map((state) => (
                    <div key={state} className="flex items-center gap-1.5">
                      {state === "active" && <ActiveIcon />}
                      {state === "broken" && <BrokenIcon />}
                      {state === "irrelevant" && <IrrelevantIcon />}
                      <span className="text-[10px]" style={{ color: PALETTE.textSecondary }}>{CELL_COLORS[state].label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div ref={heatmapScrollRef} className="heatmap-scroll-container">
                <table className="w-full border-collapse" style={{ fontSize: 11 }} role="table" aria-label="Dynamic scenario heatmap">
                  <thead>
                    <tr>
                      <th className="text-left text-[11px] font-medium p-1.5 sticky left-0 z-10" style={{ color: PALETTE.textSecondary, backgroundColor: PALETTE.bg, minWidth: 64 }} scope="col">ASI Risk</th>
                      {NIST_800_53.map((fam) => (
                        <th key={fam.id} className="text-center p-1" style={{ minWidth: 36 }} title={FAMILY_FULL_NAMES[fam.id] || fam.id} scope="col">
                          <span className="text-[12px] font-bold" style={{ color: fam.color, fontFamily: "var(--font-mono)" }}>{fam.id}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let firstBrokenMarked = false;
                      return heatmapData?.map((row) => (
                        <tr key={row.asiId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-1.5 text-[11px] font-bold sticky left-0 z-10 whitespace-nowrap cursor-pointer hover:text-blue-400 transition-colors" style={{ color: PALETTE.text, fontFamily: "var(--font-mono)", backgroundColor: PALETTE.bg }} scope="row"
                            onClick={() => openAnalysisPanel(undefined, row.asiId)}>
                            {row.asiId}
                          </td>
                          {row.cells.map((cell) => {
                            const colors = CELL_COLORS[cell.state];
                            const isFirstBroken = cell.state === "broken" && !firstBrokenMarked;
                            if (isFirstBroken) firstBrokenMarked = true;
                            return (
                              <td key={cell.familyId} className="p-0.5 text-center" aria-label={`${row.asiId} \u00d7 ${cell.familyId}: ${colors.label}`}>
                                <div
                                  data-onboarding={isFirstBroken ? "first-broken-cell" : undefined}
                                  className="flex items-center justify-center transition-all duration-200 rounded-sm cursor-pointer hover:ring-1 hover:ring-blue-400/50"
                                  style={{ width: 32, height: 32, backgroundColor: colors.bg, border: `1px solid ${colors.border}40`, margin: "0 auto" }}
                                  title={`${row.asiId} \u00d7 ${cell.familyId} (${FAMILY_FULL_NAMES[cell.familyId] || cell.familyId}): ${colors.label}`}
                                  onClick={() => openAnalysisPanel({ asiId: row.asiId, familyId: cell.familyId })}
                                >
                                  {cell.state === "active" && <ActiveIcon />}
                                  {cell.state === "broken" && <BrokenIcon />}
                                  {cell.state === "irrelevant" && <IrrelevantIcon />}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] mt-2 italic" style={{ color: PALETTE.textCaption }}>
                Click any cell to open the causal analysis panel. Click an ASI row header for full-row analysis.
              </p>
            </div>

            {/* Control State Panel */}
            <div>
              <h3 className="text-xs font-bold flex items-center gap-1.5 mb-3" style={{ color: PALETTE.text }}>
                <Shield className="w-3.5 h-3.5" style={{ color: PALETTE.textSecondary }} />
                Control State
              </h3>
              <div className="space-y-1.5">
                {Object.entries(scenario.control_state).map(([key, value]) => {
                  const label = key.replace("has_", "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const families = Object.entries(FAMILY_TO_PRIMARY_BOOLEAN).filter(([, bool]) => bool === key).map(([fam]) => fam);
                  return <ControlToggle key={key} label={label} value={value} familyIds={families} />;
                })}
              </div>

              {/* Impact & Likelihood */}
              <div className="mt-4 pt-4 border-t" style={{ borderColor: PALETTE.border }}>
                <h4 className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: PALETTE.textSecondary }}>Impact Profile</h4>
                <div className="space-y-1 text-[11px]">
                  {Object.entries(scenario.impact_profile).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: PALETTE.textSecondary }}>{k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                      <span className="font-mono" style={{ color: PALETTE.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: PALETTE.border }}>
                <h4 className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: PALETTE.textSecondary }}>Likelihood Profile</h4>
                <div className="space-y-1 text-[11px]">
                  {Object.entries(scenario.likelihood_profile).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: PALETTE.textSecondary }}>{k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                      <span className="font-mono" style={{ color: PALETTE.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Automation Bias Curve ─── */}
          <div className="mb-6">
            <button onClick={() => setShowBias(!showBias)} className="flex items-center gap-2 text-xs font-bold transition-colors mb-3" style={{ color: PALETTE.amber }}>
              {showBias ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <Gauge className="w-3.5 h-3.5" />
              Automation Bias — Human Oversight Degradation
            </button>
            <AnimatePresence>
              {showBias && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="rounded-lg border p-4" style={{ borderColor: `${PALETTE.amber}30`, backgroundColor: PALETTE.amberMuted }}>
                    <p className="text-[11px] mb-2" style={{ color: PALETTE.textSecondary }}>
                      As action count increases, human oversight accuracy degrades. The spike at action 12 represents a false-confidence recovery before accelerated decline.
                    </p>
                    <BiasChart data={biasData} archetype={ARCHETYPE_LABELS[scenario.agent_archetype]} actionsPerHr={oversightLoad} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── Implicated ASI Risks ─── */}
          <div className="mb-6">
            <button onClick={() => {}} className="flex items-center gap-2 text-xs font-bold transition-colors mb-3" style={{ color: PALETTE.cobaltLight }}>
              <Layers className="w-3.5 h-3.5" />
              Implicated ASI Risks ({implicatedRisks.length})
            </button>
            <div className="space-y-2">
              {implicatedRisks.map((risk) => {
                const asiMeta = OWASP_ASI.find((a) => a.id === risk.asiId);
                return (
                  <div key={risk.asiId} className="rounded-md p-3 border cursor-pointer hover:border-blue-500/30 transition-colors" style={{ borderColor: PALETTE.border, backgroundColor: `${PALETTE.surface}80` }}
                    onClick={() => openAnalysisPanel(undefined, risk.asiId)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-bold font-mono" style={{ color: PALETTE.cobaltLight }}>{risk.asiId} — {asiMeta?.name}</span>
                      <span className="text-[11px]" style={{ color: PALETTE.textSecondary }}>Weight: {(risk.weight * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: PALETTE.textSecondary }}>{risk.rationale}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Analysis Panel (slides in from right) ─── */}
      <AnalysisPanel onNavigateToEvidence={handleNavigateToEvidence} />

      {/* ─── Architecture Diagram Analyzer Sidebar ─── */}
      <DiagramAnalyzer
        isOpen={diagramSidebarOpen}
        onClose={() => setDiagramSidebarOpen(false)}
        onResultReady={handleDiagramResult}
      />
    </div>
  );
}
