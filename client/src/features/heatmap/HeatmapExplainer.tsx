/*
 * HeatmapExplainer — Collapsible guidance for heatmap views
 * 
 * Provides context-specific explainers for the NIST 800-53 and AI-RMF heatmaps.
 * Default-expanded on first visit, collapsible thereafter. Stored in localStorage.
 */

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface HeatmapExplainerProps {
  type: "nist" | "aiRmf";
}

const EXPLAINERS = {
  nist: {
    title: "NIST 800-53 Control Density",
    description: "Each cell shows how many specific 800-53 controls map to that ASI risk.",
    details: [
      "Darker cells = more controls engaged for that risk-family pair",
      "Click any row to see the full control list with rationale",
      "Scope: 16 of the 20 NIST 800-53 Rev 5 families are in scope; 14 carry mapped controls (MP and PE are defined but currently unmapped)",
      "Excluded families (AT, MA, PS, PT) have lower relevance to agentic AI threat vectors",
    ],
  },
  aiRmf: {
    title: "AI-RMF Function Coverage",
    description: "Each cell shows how many AI-RMF categories map to that ASI risk.",
    details: [
      "Darker cells = more AI-RMF categories engaged for that risk-function pair",
      "Click any row to see the full category list with rationale",
      "All 4 AI-RMF functions (GOVERN, MAP, MEASURE, MANAGE) are represented",
      "Coverage reflects the full AI-RMF 100-1 framework",
    ],
  },
};

export default function HeatmapExplainer({ type }: HeatmapExplainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const storageKey = `heatmap-explainer-${type}-expanded`;

  // Initialize from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === null) {
      // First visit: default expanded
      setIsExpanded(true);
    } else {
      setIsExpanded(stored === "true");
    }
  }, [storageKey]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  const explainer = EXPLAINERS[type];

  return (
    <div className="mb-4 rounded-lg border border-slate-700/30 bg-slate-900/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-sm font-semibold text-slate-200">{explainer.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{explainer.description}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-slate-700/20 bg-slate-900/20 space-y-2">
          {explainer.details.map((detail, idx) => (
            <div key={idx} className="flex gap-2 text-xs text-slate-400">
              <span className="text-slate-500 flex-shrink-0">•</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
