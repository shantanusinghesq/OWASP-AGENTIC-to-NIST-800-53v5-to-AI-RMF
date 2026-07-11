import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Shield } from "lucide-react";
import { CROSSWALK, OWASP_ASI } from "@/data/crosswalk";
import { SearchPanel } from "./SearchPanel";
import { RiskDetail } from "./RiskDetail";

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
