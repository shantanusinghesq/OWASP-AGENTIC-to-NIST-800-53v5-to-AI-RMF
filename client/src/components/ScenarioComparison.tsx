/**
 * ScenarioComparison — Split-Screen Comparative Mode
 * 
 * Swiss/Bauhaus Design: Geometric split layout, slate + cobalt palette
 * Shows two scenarios side-by-side with visual diff highlighting.
 * 
 * Features:
 * - Left/Right scenario panels with identical structure
 * - Color-coded diff: green for improvements, red for regressions
 * - Pinned scenario selector dropdown
 * - Summary delta metrics at top
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useScenario, type ScenarioSnapshot } from "@/contexts/ScenarioContext";
import { OWASP_ASI, NIST_800_53 } from "@/lib/data";
import { getCellState } from "@/lib/scrambler-evaluator";
import { Pin, PinOff, ArrowLeftRight, X } from "lucide-react";

const COLORS = {
  bg: "#0F172A",
  bgPanel: "#1E293B",
  border: "#334155",
  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  cobalt: "#2563EB",
  red: "#DC2626",
  emerald: "#10B981",
  amber: "#F59E0B",
};

// ─── Mini Heatmap for Comparison ────────────────────────────────────────────

function MiniHeatmap({ scenario }: { scenario: ScenarioSnapshot }) {
  const { factPattern } = scenario;
  const cells = useMemo(() => {
    const result: { asiId: string; familyId: string; state: string }[] = [];
    for (const asi of OWASP_ASI) {
      for (const fam of NIST_800_53) {
        const state = getCellState(asi.id, fam.id, factPattern.control_state, factPattern.risk_category);
        result.push({ asiId: asi.id, familyId: fam.id, state });
      }
    }
    return result;
  }, [factPattern]);

  const brokenCount = cells.filter(c => c.state === "broken").length;
  const activeCount = cells.filter(c => c.state === "active").length;

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.red }} />
          <span className="text-[10px] font-mono" style={{ color: COLORS.textSecondary }}>{brokenCount} broken</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.emerald }} />
          <span className="text-[10px] font-mono" style={{ color: COLORS.textSecondary }}>{activeCount} active</span>
        </div>
      </div>
      {/* Mini grid */}
      <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${NIST_800_53.length}, 1fr)` }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className="aspect-square rounded-[1px]"
            style={{
              backgroundColor: cell.state === "broken" ? `${COLORS.red}60` : cell.state === "active" ? `${COLORS.emerald}40` : `${COLORS.border}40`,
              minWidth: 4,
              minHeight: 4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Comparison Delta ───────────────────────────────────────────────────────

function ComparisonDelta({ left, right }: { left: ScenarioSnapshot; right: ScenarioSnapshot }) {
  const delta = useMemo(() => {
    const leftBroken = left.result.controls_evaluated.filter(c => c.state === "broken").length;
    const rightBroken = right.result.controls_evaluated.filter(c => c.state === "broken").length;
    const leftActive = left.result.controls_evaluated.filter(c => c.state === "active").length;
    const rightActive = right.result.controls_evaluated.filter(c => c.state === "active").length;

    const leftFamilies = new Set(left.result.controls_evaluated.filter(c => c.state === "broken").map(c => c.family));
    const rightFamilies = new Set(right.result.controls_evaluated.filter(c => c.state === "broken").map(c => c.family));

    const newBroken = Array.from(rightFamilies).filter(f => !leftFamilies.has(f));
    const resolved = Array.from(leftFamilies).filter(f => !rightFamilies.has(f));

    return {
      brokenDelta: rightBroken - leftBroken,
      activeDelta: rightActive - leftActive,
      newBroken,
      resolved,
    };
  }, [left, right]);

  return (
    <div className="flex items-center justify-center gap-4 px-4 py-2.5 rounded-md" style={{ backgroundColor: `${COLORS.cobalt}08`, border: `1px solid ${COLORS.cobalt}20` }}>
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.textSecondary }}>Broken Δ</div>
        <div className="text-[14px] font-bold font-mono" style={{ color: delta.brokenDelta > 0 ? COLORS.red : delta.brokenDelta < 0 ? COLORS.emerald : COLORS.textSecondary }}>
          {delta.brokenDelta > 0 ? "+" : ""}{delta.brokenDelta}
        </div>
      </div>
      <div className="w-px h-8" style={{ backgroundColor: COLORS.border }} />
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.textSecondary }}>Active Δ</div>
        <div className="text-[14px] font-bold font-mono" style={{ color: delta.activeDelta > 0 ? COLORS.emerald : delta.activeDelta < 0 ? COLORS.red : COLORS.textSecondary }}>
          {delta.activeDelta > 0 ? "+" : ""}{delta.activeDelta}
        </div>
      </div>
      {delta.newBroken.length > 0 && (
        <>
          <div className="w-px h-8" style={{ backgroundColor: COLORS.border }} />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.red }}>New Failures</div>
            <div className="text-[11px] font-mono" style={{ color: COLORS.red }}>{delta.newBroken.join(", ")}</div>
          </div>
        </>
      )}
      {delta.resolved.length > 0 && (
        <>
          <div className="w-px h-8" style={{ backgroundColor: COLORS.border }} />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: COLORS.emerald }}>Resolved</div>
            <div className="text-[11px] font-mono" style={{ color: COLORS.emerald }}>{delta.resolved.join(", ")}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Scenario Panel ─────────────────────────────────────────────────────────

function ScenarioPanel({ scenario, side, onPin, isPinned }: {
  scenario: ScenarioSnapshot;
  side: "left" | "right";
  onPin: () => void;
  isPinned: boolean;
}) {
  const { factPattern } = scenario;
  const brokenFamilies = Array.from(
    new Set(scenario.result.controls_evaluated.filter(c => c.state === "broken").map(c => c.family))
  );

  return (
    <div className="flex-1 p-4 rounded-lg border" style={{ backgroundColor: COLORS.bgPanel, borderColor: COLORS.border }}>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: side === "left" ? COLORS.cobalt : COLORS.amber }}>
            {side === "left" ? "Scenario A" : "Scenario B"}
          </div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: COLORS.text }}>
            {factPattern.risk_category} × {factPattern.agent_archetype}
          </div>
        </div>
        <button
          onClick={onPin}
          className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
          title={isPinned ? "Unpin scenario" : "Pin scenario"}
        >
          {isPinned ? (
            <PinOff className="w-3.5 h-3.5" style={{ color: COLORS.amber }} />
          ) : (
            <Pin className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
          )}
        </button>
      </div>

      {/* Control state summary */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(factPattern.control_state).map(([key, value]) => (
          <span
            key={key}
            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
            style={{
              backgroundColor: value ? `${COLORS.emerald}15` : `${COLORS.red}15`,
              color: value ? COLORS.emerald : COLORS.red,
            }}
          >
            {key.replace("has_", "").replace(/_/g, " ")}
          </span>
        ))}
      </div>

      {/* Mini heatmap */}
      <MiniHeatmap scenario={scenario} />

      {/* Broken families list */}
      {brokenFamilies.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: COLORS.border }}>
          <div className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: COLORS.red }}>
            Failed Families
          </div>
          <div className="flex flex-wrap gap-1">
            {brokenFamilies.map(fam => (
              <span key={fam} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.red}15`, color: COLORS.red }}>
                {fam}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-3 text-[9px]" style={{ color: COLORS.textSecondary }}>
        {new Date(scenario.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

// ─── Main ScenarioComparison Component ──────────────────────────────────────

export default function ScenarioComparison() {
  const { activeScenario, comparisonScenario, setComparisonScenario, pinnedScenarios, pinScenario, unpinScenario, splitMode, setSplitMode } = useScenario();

  if (!splitMode || !activeScenario) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="rounded-lg border overflow-hidden"
      style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4" style={{ color: COLORS.cobalt }} />
          <h3 className="text-[12px] font-bold" style={{ color: COLORS.text }}>Comparative Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Pinned scenario selector */}
          {pinnedScenarios.length > 0 && !comparisonScenario && (
            <select
              onChange={(e) => {
                const s = pinnedScenarios.find(p => p.id === e.target.value);
                if (s) setComparisonScenario(s);
              }}
              className="text-[10px] px-2 py-1 rounded border bg-transparent"
              style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
              defaultValue=""
            >
              <option value="" disabled>Select pinned scenario...</option>
              {pinnedScenarios.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setSplitMode(false)}
            className="p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
          </button>
        </div>
      </div>

      {/* Delta bar */}
      {comparisonScenario && (
        <div className="px-4 py-2">
          <ComparisonDelta left={activeScenario} right={comparisonScenario} />
        </div>
      )}

      {/* Split panels */}
      <div className="flex gap-3 p-4">
        <ScenarioPanel
          scenario={activeScenario}
          side="left"
          onPin={() => pinScenario(activeScenario)}
          isPinned={!!pinnedScenarios.find(p => p.id === activeScenario.id)}
        />
        {comparisonScenario ? (
          <ScenarioPanel
            scenario={comparisonScenario}
            side="right"
            onPin={() => unpinScenario(comparisonScenario.id)}
            isPinned={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 rounded-lg border border-dashed" style={{ borderColor: COLORS.border }}>
            <div className="text-center">
              <ArrowLeftRight className="w-8 h-8 mx-auto mb-2" style={{ color: COLORS.textSecondary }} />
              <p className="text-[11px]" style={{ color: COLORS.textSecondary }}>
                {pinnedScenarios.length > 0
                  ? "Select a pinned scenario above to compare"
                  : "Pin a scenario first, then generate a new one to compare"}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
