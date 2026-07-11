import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getControlDescription, type Framework, type ValidationStatus } from "@/data/crosswalk";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { ValidationBadge } from "./ValidationBadge";
import { SelectToggle } from "@/features/assessment/SelectToggle";
import type { MappingRef } from "@/features/assessment/types";

export function MappingCard({
  title,
  items,
  color,
  framework,
  validationStatus,
  mappingRef,
}: {
  title: string;
  items: { id: string; text: string }[];
  color: string;
  framework: Framework;
  validationStatus: ValidationStatus;
  /** When provided, the card header offers an assessment-tray select toggle. */
  mappingRef?: MappingRef;
}) {
  // Click-to-expand set (by item index) — accessible alternative to the
  // hover-only tooltip (works on touch, projectors, and keyboards).
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggle = (i: number): void =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  // Extract control ID from text (e.g., "AC-3 Access Enforcement" -> "AC-3" or "GV-1 Policies & Processes" -> "GV-1")
  const extractControlId = (text: string): string | null => {
    const match = text.match(/^([A-Z]{2,8}-\d{1,2})\s/);
    return match ? match[1] : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-md mb-2 overflow-hidden"
      style={{
        border: `1px solid ${color}25`,
        borderLeft: `3px solid ${color}`,
        backgroundColor: `${color}08`,
      }}
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="font-bold text-xs" style={{ color, fontFamily: "var(--font-mono)" }}>
            {title}
          </div>
          <div className="flex items-center gap-2">
            <ValidationBadge status={validationStatus} />
            {mappingRef && <SelectToggle refr={mappingRef} />}
          </div>
        </div>
        {items.map((item, i) => {
          // Framework-scoped lookup — never fall back across frameworks: 800-53
          // owns MP-1..MP-8 (Media Protection) while AI-RMF MAP categories use
          // the same MP-* IDs, so a fallback chain shows wrong-framework text.
          const controlId = extractControlId(item.text);
          const controlDesc = controlId ? getControlDescription(framework, controlId) : null;
          const isRationale = item.id === "\u21b3";

          const isOpen = expanded.has(i);
          return (
            <div key={i} className="text-[11px] leading-relaxed text-slate-300 mb-1">
              {item.id && (
                <span className="font-semibold mr-1" style={{ color, fontFamily: "var(--font-mono)" }}>
                  {item.id}
                </span>
              )}
              {controlDesc && !isRationale ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggle(i)}
                        aria-expanded={isOpen}
                        className="cursor-pointer border-b border-dashed text-left inline-flex items-center gap-1 hover:text-white"
                        style={{ borderColor: color }}
                      >
                        {item.text}
                        <ChevronDown
                          className="w-3 h-3 opacity-60 transition-transform"
                          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs" style={{ backgroundColor: "#2563EB", color: "white" }}>
                      <div className="text-xs">
                        <div className="font-bold mb-1">{controlDesc.title}</div>
                        <div className="text-[11px] mb-2 text-blue-100">{controlDesc.description}</div>
                        <div className="text-[10px] text-blue-200 italic mb-2">{controlDesc.implementation}</div>
                        {controlDesc.relatedASI && controlDesc.relatedASI.length > 0 && (
                          <div className="text-[10px] text-blue-100">
                            <span className="font-semibold">Related ASI:</span> {controlDesc.relatedASI.join(", ")}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  {isOpen && (
                    <div className="mt-1 mb-2 ml-1 pl-2 border-l text-[10px] text-slate-400 space-y-1" style={{ borderColor: `${color}40` }}>
                      <div className="text-slate-300">{controlDesc.description}</div>
                      <div className="italic">{controlDesc.implementation}</div>
                      {controlDesc.relatedASI && controlDesc.relatedASI.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-300">Related ASI:</span>{" "}
                          {controlDesc.relatedASI.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <span>{item.text}</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
