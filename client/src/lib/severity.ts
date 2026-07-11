// Shared severity ordering — Critical first, then High, then Medium-High,
// ties broken by ASI id. Used to rank the overview roster and heatmap rows
// so the most severe risks read top-of-list (a prioritized story, not raw order).

export const SEVERITY_RANK: Record<string, number> = {
  Critical: 0,
  High: 1,
  "Medium-High": 2,
};

export function bySeverity<T extends { id: string; severity: string }>(a: T, b: T): number {
  const r = (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
  return r !== 0 ? r : a.id.localeCompare(b.id);
}
