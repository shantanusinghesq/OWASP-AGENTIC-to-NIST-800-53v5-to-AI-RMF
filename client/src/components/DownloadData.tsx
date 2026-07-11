import type { ReactElement } from "react";
import { Download } from "lucide-react";
import { CROSSWALK_DATA_VERSION, buildCsv, buildJson } from "@/data/crosswalk";
import { triggerDownload } from "@/lib/download";

// ─── Client-side Data Export ────────────────────────────────────────
// Downloads are generated entirely in the browser via @/lib/download —
// NO server and NO network request (NFR-1/2: static SPA on GitHub Pages).
// The export format is the package's single source of truth: buildJson /
// buildCsv come from @haremantra/crosswalk via the data adapter, so the
// in-app download is byte-identical to the published dist/ artifacts.

function downloadJson(): void {
  triggerDownload(
    `agentic-crosswalk-v${CROSSWALK_DATA_VERSION}.json`,
    JSON.stringify(buildJson(), null, 2) + "\n",
    "application/json",
  );
}

function downloadCsv(): void {
  triggerDownload(
    `agentic-crosswalk-v${CROSSWALK_DATA_VERSION}.csv`,
    buildCsv(),
    "text/csv;charset=utf-8",
  );
}

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-md border border-slate-700/50 bg-slate-800/40 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50";

export function DownloadData(): ReactElement {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
      <span className="text-[11px] text-slate-500">
        Export data (v{CROSSWALK_DATA_VERSION}):
      </span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={downloadJson} className={buttonClass}>
          <Download className="w-3 h-3" aria-hidden="true" />
          Download JSON
        </button>
        <button type="button" onClick={downloadCsv} className={buttonClass}>
          <Download className="w-3 h-3" aria-hidden="true" />
          Download CSV
        </button>
      </div>
    </div>
  );
}
