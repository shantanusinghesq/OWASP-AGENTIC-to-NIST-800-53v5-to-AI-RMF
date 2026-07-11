// ─── Assessment Tray ────────────────────────────────────────────────
// Fixed bottom bar summarizing the working assessment. Renders NOTHING when
// the assessment is untouched (no selections + default name) so the app's
// default DOM is unchanged — App.smoke.test.tsx must stay byte-identical.
// Collapsed: count + coverage chips + editable name + committee exports
// (print brief / scoped OSCAL). Expanded: selection list, gap summary, and
// save/load/import/export actions (JSON roundtrip).

import { useRef, useState, type ReactElement } from "react";
import { ChevronDown, ChevronUp, ClipboardList, Download, FileJson, Upload } from "lucide-react";
import { toast } from "sonner";
import { triggerDownload } from "@/lib/download";
import { useAssessment } from "./AssessmentContext";
import { BriefExport } from "./BriefExport";
import { selectionCoverage } from "./coverage";
import { buildAssessmentExport, parseAssessmentImport } from "./export-json";
import { exportScopedOscal } from "./export-oscal";
import { pruneStale } from "./storage";
import { GapSummary } from "./GapSummary";
import { TraySelectionList } from "./TraySelectionList";
import { DEFAULT_ASSESSMENT_NAME } from "./types";

const actionClass =
  "inline-flex items-center gap-1 rounded-md border border-slate-600/60 bg-slate-800/60 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-blue-300 hover:border-blue-500/40 transition-colors disabled:opacity-40 disabled:pointer-events-none";

const chip = (label: string, value: number): ReactElement => (
  <span
    key={label}
    className="inline-flex items-center gap-1 rounded border border-slate-600/50 bg-slate-800/60 px-1.5 py-0.5 text-[10px] text-slate-300"
  >
    <span className="font-bold text-blue-300" style={{ fontFamily: "var(--font-mono)" }}>
      {value}
    </span>
    {label}
  </span>
);

export function AssessmentTray({
  onNavigate,
}: {
  onNavigate: (asiId: string) => void;
}): ReactElement | null {
  const {
    assessment,
    rename,
    clear,
    newAssessment,
    loadAssessment,
    saved,
    saveCurrent,
    loadSaved,
    deleteSaved,
  } = useAssessment();
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Untouched assessment → no tray. Keeps the default App DOM unchanged.
  const untouchedName =
    assessment.name.trim() === "" || assessment.name === DEFAULT_ASSESSMENT_NAME;
  if (assessment.selections.length === 0 && untouchedName) return null;

  const coverage = selectionCoverage(assessment);
  const count = assessment.selections.length;

  const exportJson = (): void => {
    const slug =
      assessment.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "assessment";
    triggerDownload(
      `${slug}.assessment.json`,
      JSON.stringify(buildAssessmentExport(assessment, new Date().toISOString()), null, 2) + "\n",
      "application/json",
    );
  };

  const importJson = async (file: File): Promise<void> => {
    try {
      const imported = parseAssessmentImport(await file.text());
      const { assessment: pruned, droppedCount } = pruneStale(imported);
      loadAssessment(pruned);
      if (droppedCount > 0) {
        toast.warning(
          `${droppedCount} selection${droppedCount === 1 ? "" : "s"} referenced mappings that changed and ${droppedCount === 1 ? "was" : "were"} dropped.`,
        );
      } else {
        toast.success(`Imported "${pruned.name}"`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import assessment.");
    }
  };

  return (
    <>
      {/* Spacer keeps the fixed bar from covering the footer. */}
      <div aria-hidden="true" className="h-14" />
      <div
        data-testid="assessment-tray"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-700/60 bg-slate-950/95 backdrop-blur"
      >
        {expanded && (
          <div className="max-h-[70vh] overflow-y-auto border-b border-slate-800/80">
            <div className="container py-3 space-y-3">
              <TraySelectionList onNavigate={onNavigate} />
              <GapSummary assessment={assessment} />
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" onClick={newAssessment} className={actionClass}>
                  New
                </button>
                <button type="button" onClick={clear} className={actionClass}>
                  Clear
                </button>
                <button type="button" onClick={saveCurrent} className={actionClass}>
                  Save
                </button>
                {saved.length > 0 && (
                  <>
                    <select
                      aria-label="Load saved assessment"
                      className="rounded-md border border-slate-600/60 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-300"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) loadSaved(e.target.value);
                      }}
                    >
                      <option value="">Load saved…</option>
                      {saved.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.count})
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Delete saved assessment"
                      className="rounded-md border border-slate-600/60 bg-slate-800/60 px-2 py-1 text-[11px] text-slate-400"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) deleteSaved(e.target.value);
                      }}
                    >
                      <option value="">Delete saved…</option>
                      {saved.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.count})
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <span className="flex-1" />
                <button type="button" onClick={exportJson} className={actionClass}>
                  <Download className="w-3 h-3" aria-hidden="true" />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={actionClass}
                >
                  <Upload className="w-3 h-3" aria-hidden="true" />
                  Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-label="Import assessment JSON file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void importJson(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Collapsed bar */}
        <div className="container py-2 flex items-center gap-2 flex-wrap">
          <ClipboardList className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-slate-200">
            <span
              data-testid="assessment-tray-count"
              className="text-blue-300"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {count}
            </span>{" "}
            selected
          </span>
          <div className="hidden sm:flex items-center gap-1">
            {chip("controls", coverage.controls)}
            {chip("families", coverage.families)}
            {chip("functions", coverage.functions)}
            {chip("cats", coverage.cats)}
          </div>
          <input
            type="text"
            value={assessment.name}
            onChange={(e) => rename(e.target.value)}
            aria-label="Assessment name"
            className="flex-1 min-w-32 max-w-64 rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500/60"
          />
          <span className="flex-1" />
          <BriefExport
            assessment={assessment}
            disabled={count === 0}
            className={actionClass}
          />
          <button
            type="button"
            onClick={() => exportScopedOscal(assessment)}
            disabled={count === 0}
            className={actionClass}
            title="Download the OSCAL-aligned mapping scoped to the selected mappings"
          >
            <FileJson className="w-3 h-3" aria-hidden="true" />
            OSCAL (scoped)
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className={actionClass}
          >
            {expanded ? (
              <>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
                Collapse
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3" aria-hidden="true" />
                Expand
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
