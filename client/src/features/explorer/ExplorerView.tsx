import { useState, type ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Search, Shield, X } from "lucide-react";
import { CROSSWALK, OWASP_ASI } from "@/data/crosswalk";
import { SearchPanel } from "./SearchPanel";
import { RiskDetail } from "./RiskDetail";

const PRIMER_KEY = "explorer-primer-dismissed-v1";

function ReadingPrimer(): ReactElement | null {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PRIMER_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (dismissed) return null;
  const dismiss = (): void => {
    try {
      localStorage.setItem(PRIMER_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };
  return (
    <div className="mb-5 rounded-md border border-purple-500/30 bg-purple-950/20 p-4 relative">
      <button
        onClick={dismiss}
        aria-label="Dismiss reading guide"
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-purple-300">
        <BookOpen className="w-3.5 h-3.5" />
        How to read this crosswalk
      </div>
      <ul className="text-[11px] text-slate-300 leading-relaxed space-y-1 list-disc pl-4">
        <li><span className="font-semibold">ASI01–ASI10</span> — the OWASP Top 10 agentic-AI threat categories (the risks).</li>
        <li><span className="font-semibold">NIST 800-53 families</span> (AC, AU, SI, SR…) — the technical controls that mitigate each risk; click any control to expand its description and agentic-AI implementation guidance.</li>
        <li><span className="font-semibold">AI-RMF functions</span> (GOVERN / MAP / MEASURE / MANAGE) — the governance activities the risk engages.</li>
        <li><span className="font-semibold">Validation status</span> — how each mapping was validated (all currently <em>Editorial</em>); real-world <span className="font-semibold">evidence</span> cites the incidents that substantiate the risk.</li>
      </ul>
    </div>
  );
}

export function ExplorerView({
  selectedASI,
  onSelectASI,
}: {
  selectedASI: string | null;
  onSelectASI: (id: string | null) => void;
}): ReactElement {
  const selected = selectedASI ? CROSSWALK[selectedASI] : null;
  const selectedMeta = selectedASI ? OWASP_ASI.find((a) => a.id === selectedASI) : null;

  return (
    <>
      <div className="mb-4">
        <h2 className="text-base font-bold text-purple-400 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Evidence Explorer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Select an ASI risk to see the full crosswalk with NIST 800-53 controls, AI-RMF categories, rationale, and real-world evidence.
        </p>
      </div>

      <ReadingPrimer />

      {/* ─── Search Bar ─── */}
      <SearchPanel onPickResult={(asiId) => onSelectASI(asiId)} />

      {/* ASI selector pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {OWASP_ASI.map((asi) => (
          <button
            key={asi.id}
            onClick={() => onSelectASI(asi.id)}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 border"
            style={{
              borderColor: selectedASI === asi.id ? "#3B82F6" : "#334155",
              backgroundColor: selectedASI === asi.id ? "rgba(59,130,246,0.15)" : "transparent",
              color: selectedASI === asi.id ? "#60A5FA" : "#94A3B8",
              fontFamily: "var(--font-mono)",
            }}
          >
            {asi.id}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedASI && selected && selectedMeta ? (
          <motion.div
            key={selectedASI}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <RiskDetail asiId={selectedASI} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-slate-400"
          >
            <Shield className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <div className="text-sm">Select an ASI risk above to explore its crosswalk</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
