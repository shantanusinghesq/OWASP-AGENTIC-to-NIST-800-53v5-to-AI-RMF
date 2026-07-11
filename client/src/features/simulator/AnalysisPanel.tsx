/**
 * AnalysisPanel — Dynamic Side Panel for Causal Analysis
 * 
 * Swiss/Bauhaus Design: Clean geometric layout, slate + cobalt palette
 * Replaces the legacy "What These Results Mean" bottom section.
 * 
 * Features:
 * - Slides in from the right when a heatmap cell or row is selected
 * - Shows archetype-specific causal analysis for broken controls
 * - Provides direct-to-evidence deep link buttons
 * - Responsive: full-width on mobile, side panel on desktop
 */

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScenario } from "./ScenarioContext";
import { CROSSWALK, OWASP_ASI, NIST_800_53, NIST_CONTROL_DESCRIPTIONS } from "@/data/crosswalk";
import { X, ExternalLink, AlertTriangle, Shield, ArrowRight } from "lucide-react";

const COLORS = {
  bg: "#0F172A",
  border: "#1E293B",
  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  cobalt: "#2563EB",
  cobaltLight: "#3B82F6",
  red: "#DC2626",
  emerald: "#10B981",
};

interface AnalysisPanelProps {
  onNavigateToEvidence: (asiId: string) => void;
}

export default function AnalysisPanel({ onNavigateToEvidence }: AnalysisPanelProps) {
  const { analysisPanel, closeAnalysisPanel, activeScenario } = useScenario();
  const { isOpen, selectedCell, selectedRow } = analysisPanel;

  const analysis = useMemo(() => {
    if (!activeScenario || (!selectedCell && !selectedRow)) return null;

    const { factPattern, result } = activeScenario;
    const asiId = selectedCell?.asiId || selectedRow || "";
    const familyId = selectedCell?.familyId;

    const asiMeta = OWASP_ASI.find(a => a.id === asiId);
    const familyMeta = familyId ? NIST_800_53.find(f => f.id === familyId) : null;
    const crosswalkEntry = CROSSWALK[asiId];

    if (!crosswalkEntry || !asiMeta) return null;

    // Get broken controls for this cell
    const relevantControls = result.controls_evaluated.filter(c => {
      if (familyId) return c.family === familyId;
      return true;
    });

    const brokenControls = relevantControls.filter(c => c.state === "broken");
    const activeControls = relevantControls.filter(c => c.state === "active");

    // Generate archetype-specific causal explanation
    const archetypeExplanation = generateArchetypeCausal(
      factPattern.agent_archetype,
      factPattern.risk_category,
      familyId || "",
      asiId
    );

    // Get NIST control descriptions for this family
    const controlDescriptions = familyId
      ? Object.entries(NIST_CONTROL_DESCRIPTIONS)
          .filter(([key]) => key.startsWith(familyId))
          .slice(0, 5)
          .map(([id, data]) => ({ id, ...data }))
      : [];

    return {
      asiId,
      asiMeta,
      familyId,
      familyMeta,
      brokenControls,
      activeControls,
      archetypeExplanation,
      controlDescriptions,
      crosswalkEntry,
      archetype: factPattern.agent_archetype,
      risk: factPattern.risk_category,
    };
  }, [activeScenario, selectedCell, selectedRow]);

  return (
    <AnimatePresence>
      {isOpen && analysis && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 overflow-y-auto border-l"
          style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}>
            <div>
              <h3 className="text-[13px] font-bold" style={{ color: COLORS.text }}>
                Causal Analysis
              </h3>
              <p className="text-[10px] mt-0.5 font-mono" style={{ color: COLORS.textSecondary }}>
                {analysis.asiId}{analysis.familyId ? ` × ${analysis.familyId}` : ""} — {analysis.archetype}
              </p>
            </div>
            <button
              onClick={closeAnalysisPanel}
              className="p-1.5 rounded-md hover:bg-slate-800 transition-colors"
              aria-label="Close analysis panel"
            >
              <X className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4 space-y-5">
            {/* Risk Context */}
            <section>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: COLORS.cobaltLight }}>
                Risk Context
              </div>
              <div className="p-3 rounded-md border" style={{ borderColor: `${COLORS.cobalt}30`, backgroundColor: `${COLORS.cobalt}08` }}>
                <div className="text-[12px] font-bold mb-1" style={{ color: COLORS.text }}>
                  {analysis.asiMeta.name}
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: COLORS.textSecondary }}>
                  {analysis.asiMeta.desc}
                </p>
              </div>
            </section>

            {/* Archetype-Specific Causal Explanation */}
            <section>
              <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: COLORS.red }}>
                Why This Failed — {analysis.archetype} Architecture
              </div>
              <div className="p-3 rounded-md border" style={{ borderColor: `${COLORS.red}30`, backgroundColor: `${COLORS.red}05` }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: COLORS.red }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: COLORS.textSecondary }}>
                    {analysis.archetypeExplanation}
                  </p>
                </div>
              </div>
            </section>

            {/* Broken Controls */}
            {analysis.brokenControls.length > 0 && (
              <section>
                <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: COLORS.red }}>
                  Broken Controls ({analysis.brokenControls.length})
                </div>
                <div className="space-y-2">
                  {analysis.brokenControls.slice(0, 6).map((ctrl, i) => (
                    <div key={i} className="p-2.5 rounded-md border" style={{ borderColor: `${COLORS.red}20`, backgroundColor: `${COLORS.red}05` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold font-mono" style={{ color: COLORS.red }}>
                          {ctrl.control_id}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.red}15`, color: COLORS.red }}>
                          {ctrl.family}
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: COLORS.textSecondary }}>
                        {ctrl.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Controls */}
            {analysis.activeControls.length > 0 && (
              <section>
                <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: COLORS.emerald }}>
                  Active Controls ({analysis.activeControls.length})
                </div>
                <div className="space-y-1.5">
                  {analysis.activeControls.slice(0, 4).map((ctrl, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-md" style={{ backgroundColor: `${COLORS.emerald}08` }}>
                      <Shield className="w-3 h-3 shrink-0" style={{ color: COLORS.emerald }} />
                      <span className="text-[10px] font-mono" style={{ color: COLORS.emerald }}>{ctrl.control_id}</span>
                      <span className="text-[10px]" style={{ color: COLORS.textSecondary }}>{ctrl.family}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Deep Link to Evidence */}
            <section>
              <button
                onClick={() => onNavigateToEvidence(analysis.asiId)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[11px] font-bold transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: `${COLORS.cobalt}15`,
                  color: COLORS.cobaltLight,
                  border: `1px solid ${COLORS.cobalt}30`,
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View in Evidence Explorer
                <ArrowRight className="w-3 h-3" />
              </button>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Archetype-Specific Causal Explanation Generator ─────────────────────────

function generateArchetypeCausal(archetype: string, risk: string, familyId: string, asiId: string): string {
  const familyName = NIST_800_53.find(f => f.id === familyId)?.name || familyId;

  switch (archetype) {
    case "Single":
      return `The single agent operated without peer verification. When the ${risk.toLowerCase()} event occurred, no secondary agent was available to validate the ${familyName} control boundary. The agent's autonomous decision-making directly violated ${familyId} requirements for ${asiId}.`;
    case "Sequential":
      return `In the sequential chain, Agent A's compromised output propagated downstream without intermediate validation. Agent B accepted the tainted context, and Agent C executed the final action — all without ${familyName} controls being enforced at any handoff point. This created a linear blast radius for ${asiId}.`;
    case "Supervisor":
      return `The supervisor pattern failed because the orchestrating agent delegated ${familyName}-sensitive operations to sub-agents without enforcing verification at the delegation boundary. When the ${risk.toLowerCase()} event triggered, the supervisor's oversight loop was too slow to prevent the sub-agent from violating ${familyId} controls related to ${asiId}.`;
    case "Swarm":
      return `In the swarm architecture, peer-to-peer communication bypassed the coordinator's ${familyName} enforcement. Agent B received a poisoned state from Agent A during a ${risk.toLowerCase()} event, then propagated it to Agents C and D through mesh connections — creating multi-directional failure propagation that violated ${familyId} across the entire swarm topology for ${asiId}.`;
    default:
      return `The ${archetype} architecture lacked adequate ${familyName} controls to prevent ${risk.toLowerCase()} events from impacting ${asiId}.`;
  }
}
