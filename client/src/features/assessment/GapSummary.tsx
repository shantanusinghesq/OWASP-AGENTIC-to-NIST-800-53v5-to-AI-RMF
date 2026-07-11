// ─── Assessment Tray: Gap Summary ───────────────────────────────────
// For every ASI touched by the selection: how much of the crosswalk's mapped
// surface is covered, and which families/functions are still missing. Chips
// are text-labelled (framework prefix), never color-only (NFR-7).

import type { ReactElement } from "react";
import { asiGaps, type FrameworkGap } from "./coverage";
import type { Assessment } from "./types";

const missingChips = (prefix: string, gap: FrameworkGap): ReactElement[] =>
  gap.missing.map((item) => (
    <span
      key={`${prefix}-${item}`}
      className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {prefix} {item}
    </span>
  ));

export function GapSummary({ assessment }: { assessment: Assessment }): ReactElement | null {
  const gaps = asiGaps(assessment);
  if (gaps.length === 0) return null;

  return (
    <div className="rounded-md border border-slate-700/50 bg-slate-900/40 p-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        Coverage gaps per selected risk
      </h4>
      <ul className="space-y-2">
        {gaps.map((gap) => {
          const available = gap.nist.available.length + gap.aiRmf.available.length;
          const selected = gap.nist.selected.length + gap.aiRmf.selected.length;
          const pct = available === 0 ? 100 : Math.round((selected / available) * 100);
          const missing = [...missingChips("800-53", gap.nist), ...missingChips("AI-RMF", gap.aiRmf)];
          return (
            <li key={gap.asiId} className="text-[11px] text-slate-300">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-blue-300" style={{ fontFamily: "var(--font-mono)" }}>
                  {gap.asiId}
                </span>
                <span className="text-slate-400">
                  {pct}% covered ({selected}/{available} mapped areas)
                </span>
              </div>
              {missing.length > 0 && (
                <div className="mt-1 flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Missing:</span>
                  {missing}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
