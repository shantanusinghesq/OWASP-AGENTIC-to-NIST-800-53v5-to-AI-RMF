/**
 * SpotlightTooltip — Positioned tooltip attached to the spotlight target.
 * Renders phase-specific headline, body, interaction hints, and CTAs.
 */

import { motion } from "framer-motion";

interface SpotlightTooltipProps {
  targetRect: DOMRect | null;
  position: "top" | "bottom" | "left" | "right";
  stepLabel?: string;
  headline: string;
  body: string;
  interactionHint?: string;
  primaryCTA?: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
}

export default function SpotlightTooltip({
  targetRect,
  position,
  stepLabel,
  headline,
  body,
  interactionHint,
  primaryCTA,
  secondaryCTA,
}: SpotlightTooltipProps) {
  if (!targetRect) return null;

  const OFFSET = 16;
  const style: React.CSSProperties = { position: "fixed", zIndex: 9999, maxWidth: 380 };

  switch (position) {
    case "bottom":
      style.top = targetRect.bottom + OFFSET;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = "translateX(-50%)";
      break;
    case "top":
      style.bottom = window.innerHeight - targetRect.top + OFFSET;
      style.left = targetRect.left + targetRect.width / 2;
      style.transform = "translateX(-50%)";
      break;
    case "right":
      style.top = targetRect.top + targetRect.height / 2;
      style.left = targetRect.right + OFFSET;
      style.transform = "translateY(-50%)";
      break;
    case "left":
      style.top = targetRect.top + targetRect.height / 2;
      style.right = window.innerWidth - targetRect.left + OFFSET;
      style.transform = "translateY(-50%)";
      break;
  }

  const yDir = position === "bottom" ? -8 : 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: yDir, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: yDir, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={style}
    >
      <div
        className="rounded-lg border p-5 shadow-2xl"
        style={{
          backgroundColor: "#1E293B",
          borderColor: "rgba(37, 99, 235, 0.3)",
          boxShadow: "0 0 40px rgba(37, 99, 235, 0.15)",
        }}
      >
        {stepLabel && (
          <div
            className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: "#3B82F6" }}
          >
            {stepLabel}
          </div>
        )}
        <h4 className="text-sm font-bold mb-2" style={{ color: "#E2E8F0" }}>
          {headline}
        </h4>
        <p className="text-[12px] leading-relaxed mb-3" style={{ color: "#94A3B8" }}>
          {body}
        </p>
        {interactionHint && (
          <div
            className="text-[11px] italic mb-3 flex items-center gap-1.5"
            style={{ color: "#60A5FA" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {interactionHint}
          </div>
        )}
        {(primaryCTA || secondaryCTA) && (
          <div className="flex items-center gap-3 mt-3">
            {primaryCTA && (
              <button
                onClick={primaryCTA.onClick}
                className="px-4 py-2 rounded-md text-[12px] font-bold transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgba(37, 99, 235, 0.2)",
                  color: "#3B82F6",
                  border: "1px solid rgba(37, 99, 235, 0.4)",
                }}
              >
                {primaryCTA.label}
              </button>
            )}
            {secondaryCTA && (
              <button
                onClick={secondaryCTA.onClick}
                className="px-3 py-2 text-[11px] font-medium transition-colors hover:text-slate-200"
                style={{ color: "#64748B" }}
              >
                {secondaryCTA.label}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
