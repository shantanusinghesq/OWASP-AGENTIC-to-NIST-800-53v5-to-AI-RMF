import { severityColor } from "@/data/crosswalk";

export function SeverityBadge({ level }: { level: string }) {
  const isCritical = level === "Critical";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${isCritical ? "pulse-critical" : ""}`}
      style={{
        backgroundColor: `${severityColor[level]}20`,
        color: severityColor[level],
        border: `1px solid ${severityColor[level]}40`,
      }}
    >
      {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      {level}
    </span>
  );
}
