export function AIRmfHeatCell({ count, max, riskId, riskName, functionName }: { count: number; max: number; riskId: string; riskName: string; functionName: string }) {
  const intensity = max > 0 ? count / max : 0;
  const bg =
    count === 0
      ? "rgba(15,23,42,0.5)"
      : intensity > 0.7
        ? "#047857"
        : intensity > 0.4
          ? "#10B981"
          : "#10B98140";
  const textColor = count === 0 ? "#334155" : intensity > 0.4 ? "white" : "#6EE7B7";
  return (
    <td
      className="text-center border border-slate-700/50 transition-all duration-150 hover:brightness-125"
      style={{
        backgroundColor: bg,
        color: textColor,
        padding: "8px 6px",
        fontSize: 12,
        fontWeight: count > 0 ? 700 : 400,
        fontFamily: count > 0 ? "var(--font-mono)" : "inherit",
        minWidth: 100,
      }}
      aria-label={count > 0 ? `${riskId} ${riskName} × ${functionName}: ${count} subcategories` : `${riskId} ${riskName} × ${functionName}: no subcategories`}
    >
      {count || ""}
    </td>
  );
}
