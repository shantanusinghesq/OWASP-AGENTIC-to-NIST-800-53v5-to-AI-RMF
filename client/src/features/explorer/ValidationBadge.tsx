import type { ReactElement } from "react";
import { Pencil, UserCheck, ShieldCheck } from "lucide-react";
import type { ValidationStatus } from "@/data/crosswalk";

// NFR-7: status is conveyed by TEXT + GLYPH, never by color/opacity alone.
// Color here is a redundant secondary channel — the label and icon carry the
// meaning, so the badge stays legible in grayscale / for color-blind users.
const STATUS_META: Record<
  ValidationStatus,
  { label: string; glyph: typeof Pencil; color: string; title: string }
> = {
  editorial: {
    label: "Editorial",
    glyph: Pencil,
    color: "#94A3B8",
    title: "Editorial — authored from public evidence + authoritative guidance; not yet externally reviewed.",
  },
  "practitioner-reviewed": {
    label: "Reviewed",
    glyph: UserCheck,
    color: "#38BDF8",
    title: "Practitioner-reviewed — an external practitioner has signed off on this mapping (see reviewIssue).",
  },
  "empirically-validated": {
    label: "Validated",
    glyph: ShieldCheck,
    color: "#34D399",
    title: "Empirically-validated — corroborated by observed incident/exploitation evidence (see reviewIssue).",
  },
};

export function ValidationBadge({ status }: { status: ValidationStatus }): ReactElement {
  const meta = STATUS_META[status];
  const Glyph = meta.glyph;
  return (
    <span
      title={meta.title}
      aria-label={`Validation status: ${meta.label}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider align-middle"
      style={{
        color: meta.color,
        border: `1px solid ${meta.color}40`,
        backgroundColor: `${meta.color}12`,
      }}
    >
      <Glyph className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Ordered list of the three statuses + their labels/glyphs, for the legend & filter. */
export const VALIDATION_STATUS_ORDER: ValidationStatus[] = [
  "editorial",
  "practitioner-reviewed",
  "empirically-validated",
];

export function validationStatusLabel(status: ValidationStatus): string {
  return STATUS_META[status].label;
}
