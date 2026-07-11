/*
 * OverviewRoster — Progressive Disclosure Landing View
 * 
 * Displays all 15 OWASP ASI risks as discoverable cards, each showing:
 * - Risk ID + Name + Severity badge
 * - One-line description
 * - Coverage summary (NIST families/controls, AI-RMF functions/categories)
 * - "Explore →" CTA that navigates to Evidence Explorer with ASI pre-selected
 * 
 * This is the default landing view for first-time visitors, providing
 * Layer 0 context ("what are the 15 risks?") before exposing the dense heatmap.
 */

import { COVERAGE, OWASP_ASI } from "@/data/crosswalk";
import { ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { bySeverity } from "@/lib/severity";

type SeverityFilter = "all" | "Critical" | "High" | "Medium-High";

interface OverviewRosterProps {
  onExplore: (asiId: string) => void;
  severityFilter: SeverityFilter;
  onSeverityChange: (s: SeverityFilter) => void;
}

const SEVERITY_FILTERS: SeverityFilter[] = ["all", "Critical", "High", "Medium-High"];
const severityCount = (s: SeverityFilter): number =>
  s === "all" ? OWASP_ASI.length : OWASP_ASI.filter((a) => a.severity === s).length;

function RiskCard({ asi, onExplore }: { asi: typeof OWASP_ASI[0]; onExplore: () => void }) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 hover:bg-slate-900 transition-colors cursor-pointer group">
      {/* Header: ID, Name, Severity */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs text-blue-400/70 font-mono mb-1">{asi.id}</div>
          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{asi.name}</h3>
        </div>
        <SeverityBadge level={asi.severity} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{asi.desc}</p>

      {/* Coverage Summary */}
      <div className="text-xs text-slate-500 mb-4 space-y-1.5 pb-4 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <span className="text-blue-400/70">📋</span>
          <span>
            <span className="font-semibold text-slate-300">{COVERAGE[asi.id].nistFamilies}</span> NIST families,{" "}
            <span className="font-semibold text-slate-300">{COVERAGE[asi.id].nistControls}</span> controls
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400/70">🎯</span>
          <span>
            <span className="font-semibold text-slate-300">{COVERAGE[asi.id].aiRmfFunctions}</span> AI-RMF functions,{" "}
            <span className="font-semibold text-slate-300">{COVERAGE[asi.id].aiRmfCategories}</span> categories
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onExplore}
        className="w-full px-3 py-2.5 rounded-md text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 group/btn"
      >
        Explore Mappings
        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

export default function OverviewRoster({ onExplore, severityFilter, onSeverityChange }: OverviewRosterProps) {
  const rows = OWASP_ASI.filter((a) => severityFilter === "all" || a.severity === severityFilter)
    .slice()
    .sort(bySeverity);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white mb-2">{OWASP_ASI.length} Agentic AI Risks</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Ranked by severity. Each risk maps to specific NIST 800-53 controls and AI-RMF categories. Select any risk to explore the full crosswalk with rationale and real-world evidence.
        </p>
      </div>

      {/* Severity filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by severity">
        {SEVERITY_FILTERS.map((s) => {
          const active = severityFilter === s;
          return (
            <button
              key={s}
              onClick={() => onSeverityChange(s)}
              aria-pressed={active}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                active
                  ? "border-blue-500 bg-blue-500/15 text-blue-300"
                  : "border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s === "all" ? "All" : s} ({severityCount(s)})
            </button>
          );
        })}
      </div>

      {/* Risk Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((asi) => (
          <RiskCard
            key={asi.id}
            asi={asi}
            onExplore={() => onExplore(asi.id)}
          />
        ))}
      </div>

      {/* Footer Hint */}
      <div className="mt-8 p-4 rounded-lg bg-slate-900/50 border border-slate-700/30">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Tip:</span> Use the <span className="font-mono text-blue-400">Heatmaps</span> tab to see the full control density matrix, or the <span className="font-mono text-purple-400">Evidence Explorer</span> to search across all controls.
        </p>
      </div>
    </div>
  );
}
