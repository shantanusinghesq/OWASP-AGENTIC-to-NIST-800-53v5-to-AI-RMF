/**
 * HookModal — Phase 1: The Hook (Establishing Value)
 * Full-screen blurred scrim with center modal showing animated node graphic,
 * value proposition copy, and Run First Simulation / Skip CTAs.
 */

import { motion } from "framer-motion";
import { Shield, GitBranch, Zap } from "lucide-react";

interface HookModalProps {
  onProceed: () => void;
  onSkip: () => void;
}

export default function HookModal({ onProceed, onSkip }: HookModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      {/* Blurred scrim */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.92)", backdropFilter: "blur(8px)" }}
      />

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.94 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
        className="relative z-10 rounded-xl border p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{
          backgroundColor: "#1E293B",
          borderColor: "rgba(37, 99, 235, 0.2)",
          boxShadow: "0 0 80px rgba(37, 99, 235, 0.1)",
        }}
      >
        {/* Animated graphic: AI node branching with shield */}
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28">
            {/* Center node */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.2)", border: "2px solid #3B82F6" }}
            >
              <Zap className="w-5 h-5 text-blue-400" />
            </motion.div>

            {/* Branch nodes */}
            {[
              { top: "5%", left: "50%", delay: 0.5 },
              { top: "80%", left: "12%", delay: 0.7 },
              { top: "80%", left: "88%", delay: 0.9 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: pos.delay, duration: 0.35, ease: "backOut" }}
                className="absolute w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  border: "1.5px solid #10B981",
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              </motion.div>
            ))}

            {/* Connecting lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              {[
                { x1: "50%", y1: "42%", x2: "50%", y2: "12%" },
                { x1: "42%", y1: "55%", x2: "15%", y2: "78%" },
                { x1: "58%", y1: "55%", x2: "85%", y2: "78%" },
              ].map((line, i) => (
                <motion.line
                  key={i}
                  x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                />
              ))}
            </svg>

            {/* Shield icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4, ease: "backOut" }}
              className="absolute -top-1 -right-1"
            >
              <Shield className="w-6 h-6 text-blue-400" />
            </motion.div>
          </div>
        </div>

        {/* Copy */}
        <div className="text-center">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#E2E8F0" }}>
            Welcome to the Compliance Middleware.
          </h2>
          <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#94A3B8" }}>
            AI agents don't just generate text—they take action. This platform bridges the gap
            between emerging agentic threats (OWASP) and established enterprise security frameworks
            (NIST). Let's run a quick simulation to see how a single AI failure impacts your
            compliance posture.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onProceed}
              className="w-full px-5 py-2.5 rounded-md text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                color: "#3B82F6",
                border: "1px solid rgba(37, 99, 235, 0.4)",
              }}
            >
              Run First Simulation
            </button>
            <button
              onClick={onSkip}
              className="px-4 py-2 text-[11px] font-medium transition-colors hover:text-slate-300"
              style={{ color: "#64748B" }}
            >
              Skip tutorial (I know my way around)
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
