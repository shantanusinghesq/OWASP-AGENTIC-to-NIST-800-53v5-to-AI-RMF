import type { ReactElement } from "react";
import { Brain, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AI_RMF, OWASP_ASI } from "@/data/crosswalk";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AIRmfHeatCell } from "./AiRmfHeatCell";
import HeatmapExplainer from "./HeatmapExplainer";
import { AI_RMF_HEATMAP } from "./heatmap-data";
import { AI_RMF_FUNCTION_DESCRIPTIONS } from "./descriptions";

export function AiRmfHeatmapView({
  onSelectRisk,
}: {
  onSelectRisk: (asiId: string) => void;
}): ReactElement {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          OWASP ASI → NIST AI-RMF Function Coverage
        </h2>
      </div>
      <HeatmapExplainer type="aiRmf" />
      <div className="overflow-x-auto rounded-lg border border-slate-700/50 scanline-overlay">
        <table className="w-full border-collapse" role="table" aria-label="OWASP ASI to NIST AI-RMF function coverage heatmap" style={{ fontSize: 12 }}>
          <thead>
            <tr>
              <th scope="col" className="text-left p-3 bg-slate-900 text-slate-200 font-semibold min-w-[220px]">
                OWASP ASI Risk
              </th>
              {AI_RMF.map((f) => (
                <Tooltip key={f.id}>
                  <TooltipTrigger asChild>
                    <th
                      scope="col"
                      className="text-center text-white font-bold p-3 min-w-[110px] cursor-help"
                      style={{
                        backgroundColor: f.color,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "1px",
                      }}
                    >
                      {f.name}
                    </th>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-normal max-w-xs">
                    {AI_RMF_FUNCTION_DESCRIPTIONS[f.id]}
                  </TooltipContent>
                </Tooltip>
              ))}
            </tr>
          </thead>
          <tbody>
            {OWASP_ASI.map((asi) => (
              <tr
                key={asi.id}
                onClick={() => onSelectRisk(asi.id)}
                className="cursor-pointer transition-colors duration-100 hover:bg-[rgba(34,197,94,0.08)] group"
                role="row"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRisk(asi.id); } }}
              >
                <td scope="row" className="p-3 border-b border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                      {asi.id}
                    </span>
                    <span className="text-slate-200 font-medium">{asi.name}</span>
                    <SeverityBadge level={asi.severity} />
                    <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                </td>
                {AI_RMF.map((f) => (
                  <AIRmfHeatCell key={f.id} count={AI_RMF_HEATMAP.data[asi.id][f.id]} max={AI_RMF_HEATMAP.maxVal} riskId={asi.id} riskName={asi.name} functionName={f.name} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI-RMF subcategory legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {AI_RMF.map((f) => (
          <div
            key={f.id}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${f.color}08`,
              borderColor: `${f.color}25`,
            }}
          >
            <div
              className="font-bold text-sm mb-2 flex items-center gap-2"
              style={{ color: f.color, fontFamily: "var(--font-mono)" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: f.color }}
              />
              {f.name}
            </div>
            {f.cats.map((c) => (
              <div key={c} className="text-[10px] text-slate-400 leading-relaxed pl-4">
                {c}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
