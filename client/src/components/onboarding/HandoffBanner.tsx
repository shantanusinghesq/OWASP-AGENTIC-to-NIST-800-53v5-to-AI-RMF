/**
 * HandoffBanner — Phase 5: The Handoff (Self-Serve Discovery)
 * Persistent top-of-screen banner with next-step suggestions and dismiss action.
 */

import { motion } from "framer-motion";
import { X, Zap } from "lucide-react";

interface HandoffBannerProps {
  onDismiss: () => void;
}

export default function HandoffBanner({ onDismiss }: HandoffBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-[9990] px-4 py-3"
      style={{
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        borderBottom: "1px solid rgba(37, 99, 235, 0.2)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-[12px]" style={{ color: "#94A3B8" }}>
            <span className="font-bold text-slate-200">You're all set.</span>{" "}
            Try generating a{" "}
            <span className="font-semibold text-blue-400">Swarm</span> scenario
            next to see how peer-to-peer architectures change your risk profile,
            or click any cell in the heatmap to dive into the{" "}
            <span className="font-semibold text-blue-400">Evidence Explorer</span>.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-md transition-colors hover:bg-slate-700/50 shrink-0"
          style={{ color: "#64748B" }}
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
