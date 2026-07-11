/**
 * CascadeGraph — Interactive Node-Link Diagram
 * 
 * Swiss/Bauhaus Design: Geometric nodes, clean edges, slate + cobalt palette
 * Replaces the static text-based cascade failure paths with an interactive
 * network visualization showing multi-agent failure propagation.
 * 
 * Features:
 * - Animated node-link graph showing agent topology
 * - Timeline slider for "Risk Replay" — step through failure propagation
 * - Color-coded nodes: healthy (cobalt), failed (crimson), coordinator (slate)
 * - Edge activation animation synced to timeline
 */

import { useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScenario } from "./ScenarioContext";
import type { CascadeNode, CascadeEdge } from "./engine/cascade-graph";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

// ─── Design Tokens (Swiss/Bauhaus) ──────────────────────────────────────────

const COLORS = {
  nodeFill: "#1E293B",         // slate-800
  nodeStroke: "#2563EB",       // cobalt-600
  nodeStrokeActive: "#3B82F6", // cobalt-500
  nodeFailed: "#DC2626",       // red-600
  nodeFailedFill: "#1C1917",   // warm-dark
  coordinatorFill: "#0F172A",  // slate-900
  coordinatorStroke: "#475569",// slate-600
  edgeDefault: "#334155",      // slate-700
  edgeActive: "#3B82F6",       // cobalt-500
  edgePropagation: "#DC2626",  // red-600
  edgePeer: "#64748B",         // slate-500
  textPrimary: "#E2E8F0",      // slate-200
  textSecondary: "#94A3B8",    // slate-400
  bgPanel: "#0F172A",          // slate-900
  bgTimeline: "#1E293B",       // slate-800
};

const NODE_RADIUS = 24;
const COORD_RADIUS = 28;

// ─── Edge Component ─────────────────────────────────────────────────────────

function GraphEdge({ edge, nodes, currentStep }: { edge: CascadeEdge; nodes: CascadeNode[]; currentStep: number }) {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);
  if (!source || !target) return null;

  const isActivated = edge.activatedAt !== undefined && edge.activatedAt <= currentStep;
  const isPropagation = edge.type === "propagation";
  const isPeer = edge.type === "peer";

  const strokeColor = !isActivated
    ? COLORS.edgeDefault
    : isPropagation
    ? COLORS.edgePropagation
    : COLORS.edgeActive;

  const strokeWidth = isActivated ? (isPropagation ? 2.5 : 2) : 1;
  const dashArray = isPeer ? "4 3" : "none";
  const opacity = isActivated ? 1 : 0.3;

  // Calculate midpoint for edge label
  const mx = (source.x + target.x) / 2;
  const my = (source.y + target.y) / 2;

  return (
    <g>
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        opacity={opacity}
        className="transition-all duration-500"
      />
      {isActivated && isPropagation && (
        <circle r="3" fill={COLORS.edgePropagation} opacity="0.8">
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={`M${source.x},${source.y} L${target.x},${target.y}`}
          />
        </circle>
      )}
      {edge.label && isActivated && (
        <text x={mx} y={my - 8} textAnchor="middle" fill={COLORS.textSecondary} fontSize="9" fontWeight="500">
          {edge.label}
        </text>
      )}
    </g>
  );
}

// ─── Node Component ─────────────────────────────────────────────────────────

function GraphNode({ node, currentStep }: { node: CascadeNode; currentStep: number }) {
  const isVisible = !node.failedAt || node.failedAt <= currentStep || !node.failed;
  const isFailed = node.failed && node.failedAt !== undefined && node.failedAt <= currentStep;
  const isCoordinator = node.type === "coordinator";
  const isControl = node.type === "control";
  const r = isCoordinator ? COORD_RADIUS : isControl ? 20 : NODE_RADIUS;

  const fill = isFailed ? COLORS.nodeFailedFill : isCoordinator ? COLORS.coordinatorFill : COLORS.nodeFill;
  const stroke = isFailed ? COLORS.nodeFailed : isCoordinator ? COLORS.coordinatorStroke : COLORS.nodeStroke;

  return (
    <g className="transition-all duration-300">
      {/* Glow effect for failed nodes */}
      {isFailed && (
        <circle cx={node.x} cy={node.y} r={r + 6} fill="none" stroke={COLORS.nodeFailed} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values={`${r + 4};${r + 8};${r + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Node shape */}
      {isControl ? (
        // Diamond shape for control/risk nodes
        <rect
          x={node.x - r * 0.7}
          y={node.y - r * 0.7}
          width={r * 1.4}
          height={r * 1.4}
          transform={`rotate(45 ${node.x} ${node.y})`}
          fill={fill}
          stroke={stroke}
          strokeWidth={isFailed ? 2 : 1.5}
          rx="2"
        />
      ) : (
        <circle
          cx={node.x}
          cy={node.y}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={isFailed ? 2.5 : 1.5}
        />
      )}
      {/* Label */}
      <text
        x={node.x}
        y={node.y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isFailed ? COLORS.nodeFailed : COLORS.textPrimary}
        fontSize={isControl ? "8" : "9"}
        fontWeight="600"
        fontFamily="'JetBrains Mono', monospace"
      >
        {node.label}
      </text>
      {/* Status indicator */}
      {isFailed && (
        <text
          x={node.x}
          y={node.y + r + 14}
          textAnchor="middle"
          fill={COLORS.nodeFailed}
          fontSize="8"
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
        >
          FAILED
        </text>
      )}
    </g>
  );
}

// ─── Timeline Slider ────────────────────────────────────────────────────────

function TimelineSlider({ totalSteps, currentStep, onStepChange, isPlaying, onTogglePlay }: {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-md" style={{ backgroundColor: COLORS.bgTimeline }}>
      {/* Playback controls */}
      <button
        onClick={() => onStepChange(0)}
        className="p-1 rounded hover:bg-slate-700 transition-colors"
        aria-label="Reset timeline"
      >
        <SkipBack className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
      </button>
      <button
        onClick={onTogglePlay}
        className="p-1.5 rounded-md transition-colors"
        style={{ backgroundColor: isPlaying ? "rgba(37,99,235,0.2)" : "transparent" }}
        aria-label={isPlaying ? "Pause replay" : "Play replay"}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5" style={{ color: COLORS.nodeStrokeActive }} />
        ) : (
          <Play className="w-3.5 h-3.5" style={{ color: COLORS.nodeStrokeActive }} />
        )}
      </button>
      <button
        onClick={() => onStepChange(totalSteps)}
        className="p-1 rounded hover:bg-slate-700 transition-colors"
        aria-label="Skip to end"
      >
        <SkipForward className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
      </button>

      {/* Timeline track */}
      <div className="flex-1 relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-0.5 rounded-full" style={{ backgroundColor: COLORS.edgeDefault }} />
        {/* Step markers */}
        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => onStepChange(i)}
            className="absolute w-3 h-3 rounded-full border-2 transition-all duration-200 -translate-x-1/2"
            style={{
              left: `${(i / totalSteps) * 100}%`,
              backgroundColor: i <= currentStep ? COLORS.nodeStrokeActive : COLORS.nodeFill,
              borderColor: i <= currentStep ? COLORS.nodeStrokeActive : COLORS.edgeDefault,
              transform: `translateX(-50%) scale(${i === currentStep ? 1.3 : 1})`,
            }}
            aria-label={`Step ${i}`}
          />
        ))}
        {/* Progress fill */}
        <div
          className="absolute h-0.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: COLORS.nodeStrokeActive,
            width: `${(currentStep / totalSteps) * 100}%`,
            left: 0,
          }}
        />
      </div>

      {/* Step label */}
      <span className="text-[11px] font-mono tabular-nums min-w-[60px] text-right" style={{ color: COLORS.textSecondary }}>
        Step {currentStep}/{totalSteps}
      </span>
    </div>
  );
}

// ─── Main CascadeGraph Component ────────────────────────────────────────────

export default function CascadeGraph() {
  const { cascadeGraph, replayStep, setReplayStep, isReplaying, setIsReplaying, activeScenario } = useScenario();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step forward during replay
  useEffect(() => {
    if (!isReplaying || !cascadeGraph) return;
    const timer = setInterval(() => {
      if (replayStep >= cascadeGraph.totalSteps) {
        setIsReplaying(false);
      } else {
        setReplayStep(replayStep + 1);
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [isReplaying, replayStep, cascadeGraph, setReplayStep, setIsReplaying]);

  const handleTogglePlay = useCallback(() => {
    if (!cascadeGraph) return;
    if (isReplaying) {
      setIsReplaying(false);
    } else {
      if (replayStep >= cascadeGraph.totalSteps) setReplayStep(0);
      setIsReplaying(true);
    }
  }, [isReplaying, replayStep, cascadeGraph, setIsReplaying, setReplayStep]);

  if (!cascadeGraph || !activeScenario) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg border border-slate-700/50" style={{ backgroundColor: COLORS.bgPanel }}>
        <p className="text-[12px]" style={{ color: COLORS.textSecondary }}>
          Generate a scenario to visualize cascade failure propagation.
        </p>
      </div>
    );
  }

  const { nodes, edges, totalSteps } = cascadeGraph;
  const svgWidth = 500;
  const svgHeight = 400;

  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden" style={{ backgroundColor: COLORS.bgPanel }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
        <div>
          <h3 className="text-[12px] font-bold" style={{ color: COLORS.textPrimary }}>
            Cascade Failure Topology
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: COLORS.textSecondary }}>
            {activeScenario.factPattern.agent_archetype} Architecture — {activeScenario.factPattern.risk_category} Risk
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.nodeStroke }} />
            <span className="text-[9px]" style={{ color: COLORS.textSecondary }}>Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS.nodeFailed }} />
            <span className="text-[9px]" style={{ color: COLORS.textSecondary }}>Failed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: COLORS.nodeFailed, width: 8, height: 8 }} />
            <span className="text-[9px]" style={{ color: COLORS.textSecondary }}>Broken Control</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ height: 320 }}
        role="img"
        aria-label={`Network diagram showing ${activeScenario.factPattern.agent_archetype} cascade failure topology`}
      >
        {/* Grid background (Swiss design) */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.edgeDefault} strokeWidth="0.2" opacity="0.3" />
          </pattern>
        </defs>
        <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

        {/* Edges (rendered first, below nodes) */}
        {edges.map((edge, i) => (
          <GraphEdge key={i} edge={edge} nodes={nodes} currentStep={replayStep} />
        ))}

        {/* Nodes */}
        {nodes.map(node => (
          <GraphNode key={node.id} node={node} currentStep={replayStep} />
        ))}
      </svg>

      {/* Timeline Slider */}
      <div className="px-4 pb-3">
        <TimelineSlider
          totalSteps={totalSteps}
          currentStep={replayStep}
          onStepChange={setReplayStep}
          isPlaying={isReplaying}
          onTogglePlay={handleTogglePlay}
        />
      </div>
    </div>
  );
}
