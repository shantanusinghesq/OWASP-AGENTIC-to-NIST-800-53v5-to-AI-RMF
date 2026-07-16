import type { ReactElement } from "react";
import { ChevronRight, Layers } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NIST_800_53, OWASP_ASI } from "@/data/crosswalk";
import { SeverityBadge } from "@/components/SeverityBadge";
import { bySeverity } from "@/lib/severity";
import { HeatCell } from "./HeatCell";
import HeatmapExplainer from "./HeatmapExplainer";
import { NIST_HEATMAP } from "./heatmap-data";
import { NIST_FAMILY_DESCRIPTIONS } from "./descriptions";

const ROW_TOTAL = Object.fromEntries(
  OWASP_ASI.map((a) => [a.id, NIST_800_53.reduce((s, f) => s + NIST_HEATMAP.data[a.id][f.id], 0)]),
) as Record<string, number>;
const MAX_TOTAL = Math.max(...Object.values(ROW_TOTAL));
const RANKED_ROWS = OWASP_ASI.slice().sort(bySeverity);
const TOP_EXPOSURE = OWASP_ASI.slice().sort((a, b) => ROW_TOTAL[b.id] - ROW_TOTAL[a.id])[0];

export function NistHeatmapView({
  onSelectRisk,
}: {
  onSelectRisk: (asiId: string) => void;
}): ReactElement {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-base font-bold text-blue-400 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          OWASP ASI → NIST 800-53 Rev 5 Control Density
        </h2>
      </div>
      <div className="mb-3 text-[11px] text-slate-400">
        Rows ranked by severity (Critical first). Highest control exposure:{" "}
        <span className="font-semibold text-blue-300" style={{ fontFamily: "var(--font-mono)" }}>
          {TOP_EXPOSURE.id}
        </span>{" "}
        {TOP_EXPOSURE.name} — {ROW_TOTAL[TOP_EXPOSURE.id]} mapped controls.
      </div>
      <HeatmapExplainer type="nist" />
      {/* Family-code legend — always visible (not hover-only) so the 16 bare
          two-letter codes are never unexplained, including on mobile, where
          the hover tooltips on the desktop table below don't reach. */}
      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
        {NIST_800_53.map((f) => (
          <span key={f.id}>
            <span className="font-semibold text-slate-300" style={{ fontFamily: "var(--font-mono)" }}>
              {f.id}
            </span>{" "}
            {f.name}
          </span>
        ))}
      </div>
      {/* Mobile fallback: severity-ranked stacked list instead of the wide matrix */}
      <div className="md:hidden space-y-2">
        {RANKED_ROWS.map((asi) => (
          <div key={asi.id} className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-blue-400 font-semibold text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                {asi.id}
              </span>
              <span className="text-slate-200 font-medium text-[12px]">{asi.name}</span>
              <SeverityBadge level={asi.severity} />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Exposure:{" "}
                <span className="text-blue-300 font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  {ROW_TOTAL[asi.id]}
                </span>{" "}
                mapped controls
              </span>
              <button
                onClick={() => onSelectRisk(asi.id)}
                className="shrink-0 rounded border border-blue-500/40 px-2 py-1 text-[11px] font-medium text-blue-300 transition hover:bg-blue-500/10"
              >
                View mappings
              </button>
            </div>
          </div>
        ))}
      </div>
      <TooltipProvider delayDuration={200}>
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-700/50 scanline-overlay">
        <table className="w-full border-collapse" role="table" aria-label="OWASP ASI to NIST 800-53 control density heatmap" style={{ fontSize: 11 }}>
          <thead>
            <tr>
              <th scope="col" className="text-left p-2 bg-slate-900 text-slate-200 font-semibold sticky left-0 z-10 min-w-[180px]" style={{ fontFamily: "var(--font-sans)" }}>
                OWASP ASI Risk
              </th>
              {NIST_800_53.map((f) => (
                <th
                  key={f.id}
                  scope="col"
                  className="bg-slate-900 text-slate-300 font-medium"
                  style={{
                    padding: "6px 2px",
                    fontSize: 9,
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    height: 80,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.5px",
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {f.id}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs font-normal w-80 bg-slate-900 border border-slate-700 text-slate-100">
                      <div className="space-y-2 p-2">
                        <div className="font-mono font-semibold">{f.id} — {f.name}</div>
                        <div className="text-slate-300 leading-relaxed whitespace-normal">{NIST_FAMILY_DESCRIPTIONS[f.id]}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </th>
              ))}
              <th scope="col" className="bg-slate-900 text-slate-300 font-semibold text-center px-2" style={{ fontSize: 9, minWidth: 64, fontFamily: "var(--font-sans)" }}>
                Exposure
              </th>
            </tr>
          </thead>
          <tbody>
            {RANKED_ROWS.map((asi) => (
              <tr
                key={asi.id}
                onClick={() => onSelectRisk(asi.id)}
                className="cursor-pointer transition-colors duration-100 hover:bg-[rgba(59,130,246,0.08)] group"
                role="row"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRisk(asi.id); } }}
              >
                <td scope="row" className="p-2 border-b border-slate-700/30 sticky left-0 bg-background group-hover:bg-[rgba(59,130,246,0.08)] z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                      {asi.id}
                    </span>
                    <span className="text-slate-200 font-medium text-[11px]">{asi.name}</span>
                    <SeverityBadge level={asi.severity} />
                    <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                </td>
                {NIST_800_53.map((f) => (
                  <HeatCell key={f.id} count={NIST_HEATMAP.data[asi.id][f.id]} max={NIST_HEATMAP.maxVal} riskId={asi.id} riskName={asi.name} familyCode={f.id} />
                ))}
                <td
                  className="border-b border-slate-700/30 px-2"
                  aria-label={`${asi.id} total exposure: ${ROW_TOTAL[asi.id]} mapped controls`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-300 font-bold text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {ROW_TOTAL[asi.id]}
                    </span>
                    <span className="h-1.5 rounded-sm bg-blue-500/60" style={{ width: `${(ROW_TOTAL[asi.id] / MAX_TOTAL) * 40}px` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </TooltipProvider>
      {/* Legend — describes the desktop density grid, so hidden alongside it */}
      <div className="mt-4 hidden md:flex gap-3 items-center text-[11px] text-slate-400">
        <span className="font-medium">Density:</span>
        {[
          { bg: "rgba(15,23,42,0.5)", label: "0" },
          { bg: "#3B82F640", label: "1-2" },
          { bg: "#3B82F6", label: "3" },
          { bg: "#1E40AF", label: "4+" },
        ].map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-sm border border-slate-600/50"
              style={{ backgroundColor: l.bg }}
            />
            <span className="text-slate-400">{l.label}</span>
          </span>
        ))}
      </div>
    </>
  );
}
