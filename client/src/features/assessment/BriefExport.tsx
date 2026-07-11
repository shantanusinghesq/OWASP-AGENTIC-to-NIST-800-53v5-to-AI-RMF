// ─── Committee Brief Export (button + window plumbing) ──────────────
// Opens the print-ready brief in a new same-origin window. window.open MUST
// run synchronously inside the click handler's call stack or pop-up blockers
// eat it — exportBrief is therefore a plain synchronous function that both
// call sites (tray button here, RiskDetail's single-risk button) invoke
// directly from onClick.

import type { ReactElement } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { buildBriefHtml } from "./brief";
import type { Assessment } from "./types";

/** Synchronous: open window → build html → write. Toasts when pop-ups are blocked. */
export function exportBrief(assessment: Assessment): void {
  const w = window.open("", "_blank");
  if (!w) {
    toast.error("Allow pop-ups to export the brief");
    return;
  }
  const html = buildBriefHtml(assessment, { generatedAt: new Date().toISOString() });
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export function BriefExport({
  assessment,
  disabled,
  className,
}: {
  assessment: Assessment;
  disabled?: boolean;
  className?: string;
}): ReactElement {
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={() => exportBrief(assessment)}
      title="Open a print-ready committee brief of the selected mappings"
    >
      <FileText className="w-3 h-3" aria-hidden="true" />
      Committee brief
    </button>
  );
}
