// ─── Assessment Tray: Per-mapping Annotation Editor ─────────────────
// Compact owner / RACI / status-override / note editor for one selected
// mapping. Controlled by the parent via `annotation` + `onChange(patch)`.

import type { ReactElement } from "react";
import type { MappingAnnotation, RaciRole, StatusOverride } from "./types";

const RACI_OPTIONS: { value: "" | RaciRole; label: string }[] = [
  { value: "", label: "—" },
  { value: "R", label: "R — Responsible" },
  { value: "A", label: "A — Accountable" },
  { value: "C", label: "C — Consulted" },
  { value: "I", label: "I — Informed" },
];

const STATUS_OPTIONS: { value: "" | StatusOverride; label: string }[] = [
  { value: "", label: "—" },
  { value: "concur", label: "Concur" },
  { value: "challenge", label: "Challenge" },
  { value: "n-a", label: "N/A" },
];

const fieldClass =
  "bg-slate-800/80 border border-slate-600/60 rounded px-1.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500/60 w-full";

export function AnnotationEditor({
  mkey,
  annotation,
  onChange,
}: {
  mkey: string;
  annotation: MappingAnnotation;
  onChange: (patch: Partial<MappingAnnotation>) => void;
}): ReactElement {
  return (
    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 rounded-md border border-slate-700/50 bg-slate-900/60 p-2">
      <label className="flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        Owner
        <input
          type="text"
          value={annotation.owner}
          onChange={(e) => onChange({ owner: e.target.value })}
          placeholder="Team or person"
          aria-label={`Owner for ${mkey}`}
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        RACI
        <select
          value={annotation.raciRole ?? ""}
          onChange={(e) => onChange({ raciRole: e.target.value === "" ? null : (e.target.value as RaciRole) })}
          aria-label={`RACI role for ${mkey}`}
          className={fieldClass}
        >
          {RACI_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        Status
        <select
          value={annotation.statusOverride ?? ""}
          onChange={(e) =>
            onChange({ statusOverride: e.target.value === "" ? null : (e.target.value as StatusOverride) })
          }
          aria-label={`Status override for ${mkey}`}
          className={fieldClass}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-3 flex flex-col gap-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        Note
        <textarea
          value={annotation.note}
          onChange={(e) => onChange({ note: e.target.value })}
          rows={2}
          placeholder="Assessment note"
          aria-label={`Note for ${mkey}`}
          className={`${fieldClass} resize-y`}
        />
      </label>
    </div>
  );
}
