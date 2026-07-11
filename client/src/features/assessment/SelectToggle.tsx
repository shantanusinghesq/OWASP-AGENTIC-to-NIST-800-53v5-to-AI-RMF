// ─── Assessment Tray: Mapping Select Toggle ─────────────────────────
// Small checkbox rendered inside MappingCard headers. Uses the NULL-TOLERANT
// hook: when no AssessmentProvider is mounted (e.g. RiskDetail rendered bare
// in tests) it renders nothing, so host components stay provider-agnostic.

import type { ReactElement } from "react";
import { Check } from "lucide-react";
import { useAssessmentMaybe } from "./AssessmentContext";
import { mappingKey, type MappingRef } from "./types";

export function SelectToggle({ refr }: { refr: MappingRef }): ReactElement | null {
  const ctx = useAssessmentMaybe();
  if (!ctx) return null;

  const selected = ctx.selectedKeys.has(mappingKey(refr));
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`Include ${refr.asiId} ${refr.familyOrFunc} in assessment`}
      onClick={() => ctx.toggle(refr)}
      className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded border transition-colors ${
        selected
          ? "bg-blue-500/80 border-blue-400 text-white"
          : "bg-transparent border-slate-500 text-transparent hover:border-blue-400"
      }`}
    >
      <Check className="w-3 h-3" aria-hidden="true" />
    </button>
  );
}
