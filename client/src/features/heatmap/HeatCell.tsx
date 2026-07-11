import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { NIST_FAMILY_DESCRIPTIONS } from "./descriptions";

export function HeatCell({ count, max, riskId, riskName, familyCode }: { count: number; max: number; riskId: string; riskName: string; familyCode: string }) {
  const intensity = max > 0 ? count / max : 0;
  const bg =
    count === 0
      ? "rgba(15,23,42,0.5)"
      : intensity > 0.7
        ? "#1E40AF"
        : intensity > 0.4
          ? "#3B82F6"
          : "#3B82F640";
  const textColor = count === 0 ? "#334155" : intensity > 0.4 ? "white" : "#93C5FD";

  const cell = (
    <td
      className="text-center border border-slate-700/50 transition-all duration-150 hover:brightness-125 cursor-help"
      style={{
        backgroundColor: bg,
        color: textColor,
        padding: "6px 4px",
        fontSize: 11,
        fontWeight: count > 0 ? 700 : 400,
        fontFamily: count > 0 ? "var(--font-mono)" : "inherit",
        minWidth: 36,
      }}
      aria-label={count > 0 ? `${riskId} ${riskName} × ${familyCode}: ${count} controls mapped` : `${riskId} ${riskName} × ${familyCode}: no controls mapped`}
    >
      {count || ""}
    </td>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {cell}
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-normal w-80 bg-slate-900 border border-slate-700 text-slate-100">
        <div className="space-y-2 p-2">
          <div className="font-mono font-semibold">{riskId} × {familyCode}</div>
          <div className="text-slate-300 leading-relaxed whitespace-normal">{riskName}</div>
          <div className="text-slate-400 text-[10px]">{NIST_FAMILY_DESCRIPTIONS[familyCode]}</div>
          {count > 0 && <div className="text-slate-300 font-semibold pt-1">{count} controls mapped</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
