import type { ReactElement } from "react";
import { AlertTriangle, ExternalLink, Info } from "lucide-react";
import { UPSTREAM_VERSIONS } from "@/data/crosswalk";

// ─── Provenance & Limitations ───────────────────────────────────────
// Renders (a) the exact upstream framework editions this crosswalk was pinned
// against (machine-readable, straight from UPSTREAM_VERSIONS) and (b) a short,
// honest "known limitations" list so the reader can calibrate trust in the
// mapping. Collapsible <details> keeps the footer compact.
//
// Accessibility: severity/status is NEVER conveyed by colour or opacity alone.
// Every item carries a text label and an aria-hidden icon that duplicates the
// meaning already stated in words.

interface Limitation {
  label: string;
  detail: string;
}

// Hardcoded, single-source list of known limitations (editorial ground truth).
const LIMITATIONS: Limitation[] = [
  {
    label: "Severity ratings are editorial",
    detail:
      "ASI severity ratings are this project's editorial judgement, not an official OWASP classification.",
  },
  {
    label: "Control coverage",
    detail:
      "54 distinct NIST 800-53 controls are mapped across 14 of the 16 in-scope families; Media Protection (MP) and Physical & Environmental (PE) are currently unmapped.",
  },
  {
    label: "AI-RMF coverage",
    detail:
      "17 of 19 AI-RMF subcategories are referenced; GV-3 (Workforce Diversity) and MS-4 (Measurement Effectiveness) are tracked but not yet mapped.",
  },
  {
    label: "Single-author provenance",
    detail:
      "Mappings and rationales reflect a single-author editorial process; they have not undergone independent multi-reviewer validation.",
  },
  {
    label: "Evidence backfill in progress",
    detail:
      "Evidence citations are being backfilled; some mappings cite illustrative incidents rather than an exhaustive evidence base.",
  },
];

export function ProvenancePanel(): ReactElement {
  const upstream = Object.entries(UPSTREAM_VERSIONS);

  return (
    <details className="group rounded-md border border-slate-700/40 bg-slate-900/40 px-4 py-2.5 text-left">
      <summary className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-300 marker:content-none list-none">
        <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        Provenance &amp; Limitations
        <span className="ml-auto text-[10px] font-normal normal-case text-slate-500 group-open:hidden">
          Show
        </span>
        <span className="ml-auto hidden text-[10px] font-normal normal-case text-slate-500 group-open:inline">
          Hide
        </span>
      </summary>

      <div className="mt-3 space-y-3">
        {/* Pinned upstream editions */}
        <div>
          <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Pinned upstream editions
          </h3>
          <ul className="space-y-1">
            {upstream.map(([key, layer]) => (
              <li
                key={key}
                className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2 text-[11px] leading-relaxed"
              >
                <span className="font-medium text-slate-200">{layer.framework}</span>
                <span className="text-slate-400">{layer.edition}</span>
                <span className="text-slate-500">
                  verified {layer.lastVerified}
                </span>
                <a
                  href={layer.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  source
                  <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Known limitations */}
        <div>
          <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Known limitations
          </h3>
          <ul className="space-y-1.5">
            {LIMITATIONS.map((item) => (
              <li key={item.label} className="flex gap-1.5 text-[11px] leading-relaxed">
                <AlertTriangle
                  className="mt-0.5 w-3 h-3 shrink-0 text-amber-400"
                  aria-hidden="true"
                />
                <span className="text-slate-400">
                  <span className="font-medium text-slate-200">{item.label}:</span>{" "}
                  {item.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
