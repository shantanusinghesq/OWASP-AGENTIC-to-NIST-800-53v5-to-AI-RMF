// ─── Assessment Tray: Selection List ────────────────────────────────
// Selected mappings grouped by ASI. Each row: framework + family/function,
// remove button, and an expandable per-mapping AnnotationEditor. The ASI id
// is a link back into the Evidence Explorer via onNavigate.

import { useState, type ReactElement } from "react";
import { ChevronDown, X } from "lucide-react";
import { OWASP_ASI } from "@/data/crosswalk";
import { useAssessment } from "./AssessmentContext";
import { AnnotationEditor } from "./AnnotationEditor";
import { blankAnnotation, mappingKey, type MappingRef } from "./types";

const FRAMEWORK_LABEL: Record<MappingRef["framework"], string> = {
  nist: "800-53",
  aiRmf: "AI-RMF",
};

export function TraySelectionList({
  onNavigate,
}: {
  onNavigate: (asiId: string) => void;
}): ReactElement | null {
  const { assessment, toggle, annotate } = useAssessment();
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  if (assessment.selections.length === 0) return null;

  const toggleOpen = (key: string): void =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const grouped = new Map<string, MappingRef[]>();
  for (const ref of assessment.selections) {
    const list = grouped.get(ref.asiId) ?? [];
    list.push(ref);
    grouped.set(ref.asiId, list);
  }

  return (
    <div className="space-y-3">
      {Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([asiId, refs]) => {
          const meta = OWASP_ASI.find((a) => a.id === asiId);
          return (
            <div key={asiId} className="rounded-md border border-slate-700/50 bg-slate-900/40 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate(asiId)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline decoration-blue-500/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                  aria-label={`Open ${asiId} in the Evidence Explorer`}
                >
                  {asiId}
                </button>
                {meta && <span className="text-[11px] text-slate-400">{meta.name}</span>}
              </div>
              <ul className="space-y-1.5">
                {refs.map((ref) => {
                  const key = mappingKey(ref);
                  const isOpen = openKeys.has(key);
                  const annotation = assessment.annotations[key] ?? blankAnnotation();
                  return (
                    <li key={key} className="text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded border border-slate-600/60 bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {FRAMEWORK_LABEL[ref.framework]}
                        </span>
                        <span className="font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
                          {ref.familyOrFunc}
                        </span>
                        {annotation.owner && (
                          <span className="text-[10px] text-slate-500 truncate">→ {annotation.owner}</span>
                        )}
                        <span className="flex-1" />
                        <button
                          type="button"
                          onClick={() => toggleOpen(key)}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Hide" : "Edit"} annotation for ${ref.asiId} ${ref.familyOrFunc}`}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-300"
                        >
                          Annotate
                          <ChevronDown
                            className="w-3 h-3 transition-transform"
                            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggle(ref)}
                          aria-label={`Remove ${ref.asiId} ${ref.familyOrFunc} from assessment`}
                          className="inline-flex items-center justify-center w-4 h-4 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                      {isOpen && (
                        <AnnotationEditor
                          mkey={key}
                          annotation={annotation}
                          onChange={(patch) => annotate(key, patch)}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
