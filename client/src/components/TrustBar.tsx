import type { ReactElement } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { VALIDATION_MIX } from "@/data/crosswalk";

const VALIDATION_DOC_URL =
  "https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF/blob/main/VALIDATION.md";

// Aggregate "evidence confidence" posture. Every mapping declares how it was
// validated; today all are Editorial. Shown as labelled text segments (never
// color alone) so an examiner can read the posture at a glance.
const SEGMENTS: { key: keyof typeof VALIDATION_MIX; label: string; color: string }[] = [
  { key: "editorial", label: "Editorial", color: "#64748B" },
  { key: "practitioner-reviewed", label: "Reviewed", color: "#3B82F6" },
  { key: "empirically-validated", label: "Validated", color: "#10B981" },
];

export function TrustBar(): ReactElement {
  const total = VALIDATION_MIX.total || 1;
  const pct = (n: number): number => Math.round((n / total) * 100);

  return (
    <div className="mt-6 rounded-md border border-slate-600/40 bg-slate-900/50 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Evidence confidence — {VALIDATION_MIX.total} mappings
        </div>
        <a
          href={VALIDATION_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-0.5"
        >
          How mappings are validated
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
      {/* Proportion bar (redundant with the labels below — never the only signal) */}
      <div className="flex h-2 w-full overflow-hidden rounded-sm bg-slate-800" aria-hidden="true">
        {SEGMENTS.map((s) => {
          const w = pct(VALIDATION_MIX[s.key]);
          return w > 0 ? <span key={s.key} style={{ width: `${w}%`, backgroundColor: s.color }} /> : null;
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
            <span className="font-semibold">{pct(VALIDATION_MIX[s.key])}%</span> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
