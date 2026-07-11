import { useState, type ReactElement } from "react";
import { AlertTriangle, ExternalLink, ShieldQuestion } from "lucide-react";
import {
  AI_RMF,
  CROSSWALK,
  NIST_800_53,
  OWASP_ASI,
  type ValidationStatus,
} from "@/data/crosswalk";
import { SeverityBadge } from "@/components/SeverityBadge";
import { MappingCard } from "./MappingCard";
import {
  ValidationBadge,
  VALIDATION_STATUS_ORDER,
  validationStatusLabel,
} from "./ValidationBadge";

const VALIDATION_DOC_URL =
  "https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/blob/main/VALIDATION.md";

const STATUS_BLURB: Record<ValidationStatus, string> = {
  editorial: "Authored from public evidence + authoritative guidance; not yet externally reviewed.",
  "practitioner-reviewed": "An external practitioner has signed off on the mapping.",
  "empirically-validated": "Corroborated by observed incident / exploitation evidence.",
};

type StatusFilter = ValidationStatus | "all";

export function RiskDetail({ asiId }: { asiId: string }): ReactElement | null {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const selected = CROSSWALK[asiId];
  const selectedMeta = OWASP_ASI.find((a) => a.id === asiId);
  if (!selected || !selectedMeta) return null;

  // Per-status counts for THIS ASI (nist53 + aiRmf). Launch state: all editorial.
  const statusCounts: Record<ValidationStatus, number> = {
    editorial: 0,
    "practitioner-reviewed": 0,
    "empirically-validated": 0,
  };
  for (const m of selected.nist53) statusCounts[m.validationStatus] += 1;
  for (const m of selected.aiRmf) statusCounts[m.validationStatus] += 1;
  const totalMappings = selected.nist53.length + selected.aiRmf.length;

  const shows = (status: ValidationStatus): boolean =>
    statusFilter === "all" || statusFilter === status;

  const filterButton = (value: StatusFilter, label: string, count: number): ReactElement => {
    const active = statusFilter === value;
    return (
      <button
        key={value}
        onClick={() => setStatusFilter(value)}
        aria-pressed={active}
        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors duration-150"
        style={{
          borderColor: active ? "#8B5CF6" : "#334155",
          backgroundColor: active ? "rgba(139,92,246,0.15)" : "transparent",
          color: active ? "#C4B5FD" : "#94A3B8",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label} ({count})
      </button>
    );
  };

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

      {/* ─── Validation legend + status filter ─── */}
      <div className="mb-5 p-4 rounded-md border border-slate-700/50 bg-slate-900/40">
        <div className="flex items-center gap-2 mb-2">
          <ShieldQuestion className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold text-xs text-purple-300 uppercase tracking-wider">
            Mapping validation status
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Every mapping declares how it was validated. All mappings are currently{" "}
          <span className="font-semibold text-slate-300">Editorial</span> — no mapping has yet
          been through external practitioner sign-off. Status is shown as a labelled badge on
          each card (not by color alone).{" "}
          <a
            href={VALIDATION_DOC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-purple-200 underline decoration-purple-400/40 inline-flex items-center gap-0.5"
          >
            Read the validation model
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>

        {/* Legend rows */}
        <ul className="space-y-1.5 mb-3">
          {VALIDATION_STATUS_ORDER.map((status) => (
            <li key={status} className="flex items-start gap-2 text-[11px] text-slate-400">
              <ValidationBadge status={status} />
              <span className="leading-relaxed">{STATUS_BLURB[status]}</span>
            </li>
          ))}
        </ul>

        {/* Filter control */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Filter:</span>
          {filterButton("all", "All", totalMappings)}
          {VALIDATION_STATUS_ORDER.map((status) =>
            filterButton(status, validationStatusLabel(status), statusCounts[status]),
          )}
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
          {selected.nist53.filter((m) => shows(m.validationStatus)).map((mapping, i) => {
            const fam = NIST_800_53.find((f) => f.id === mapping.family);
            if (!fam) return null;
            return (
              <MappingCard
                key={i}
                title={`${fam.id} — ${fam.name}`}
                color={fam.color}
                framework="nist"
                validationStatus={mapping.validationStatus}
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
          {selected.aiRmf.filter((m) => shows(m.validationStatus)).map((mapping, i) => {
            const func = AI_RMF.find((f) => f.id === mapping.func);
            if (!func) return null;
            return (
              <MappingCard
                key={i}
                title={func.name}
                color={func.color}
                framework="aiRmf"
                validationStatus={mapping.validationStatus}
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
        <ul className="space-y-2">
          {selected.evidence.map((item, i) => (
            <li key={i} className="text-[11px] text-red-300/80 leading-relaxed">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="shrink-0 mt-px px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-red-500/15 text-red-300/90 border border-red-500/20">
                  {item.type}
                </span>
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-200/90 hover:text-red-100 underline decoration-red-400/40 hover:decoration-red-300 inline-flex items-center gap-1"
                  >
                    {item.title}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span>{item.title}</span>
                )}
                {item.cveId && (
                  <span className="shrink-0 font-mono text-[10px] text-red-400/90">
                    {item.cveId}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
