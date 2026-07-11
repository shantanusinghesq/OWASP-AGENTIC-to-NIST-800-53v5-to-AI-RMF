import type { ReactElement } from "react";
import { AlertTriangle } from "lucide-react";
import { AI_RMF, CROSSWALK, NIST_800_53, OWASP_ASI } from "@/data/crosswalk";
import { SeverityBadge } from "@/components/SeverityBadge";
import { MappingCard } from "./MappingCard";

export function RiskDetail({ asiId }: { asiId: string }): ReactElement | null {
  const selected = CROSSWALK[asiId];
  const selectedMeta = OWASP_ASI.find((a) => a.id === asiId);
  if (!selected || !selectedMeta) return null;

  return (
    <>
      {/* Header card */}
      <div className="bg-slate-900 rounded-lg p-5 mb-5 border border-slate-700/50 glow-blue">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
          <div>
            <div className="text-sm text-blue-400/70 mb-1" style={{ fontFamily: "var(--font-mono)" }}>
              {selectedMeta.id}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{selectedMeta.name}</h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {selectedMeta.desc}
            </p>
          </div>
          <SeverityBadge level={selectedMeta.severity} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 800-53 column */}
        <div>
          <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-blue-500" />
            NIST 800-53 Rev 5 Controls
          </h3>
          {selected.nist53.map((mapping, i) => {
            const fam = NIST_800_53.find((f) => f.id === mapping.family);
            if (!fam) return null;
            return (
              <MappingCard
                key={i}
                title={`${fam.id} — ${fam.name}`}
                color={fam.color}
                framework="nist"
                items={[
                  ...mapping.controls.map((c) => ({ id: "", text: c })),
                  { id: "↳", text: mapping.rationale },
                ]}
              />
            );
          })}
        </div>

        {/* AI-RMF column */}
        <div>
          <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-emerald-500" />
            NIST AI-RMF 100-1 Categories
          </h3>
          {selected.aiRmf.map((mapping, i) => {
            const func = AI_RMF.find((f) => f.id === mapping.func);
            if (!func) return null;
            return (
              <MappingCard
                key={i}
                title={func.name}
                color={func.color}
                framework="aiRmf"
                items={[
                  ...mapping.cats.map((c) => ({ id: "", text: c })),
                  { id: "↳", text: mapping.rationale },
                ]}
              />
            );
          })}
        </div>
      </div>

      {/* Evidence strip */}
      <div className="mt-5 p-4 rounded-md border border-red-500/30 bg-red-500/5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="font-bold text-xs text-red-400 uppercase tracking-wider">
            Real-World Evidence
          </span>
        </div>
        <div className="text-[11px] text-red-300/80 leading-relaxed">
          {selected.evidence}
        </div>
      </div>
    </>
  );
}
