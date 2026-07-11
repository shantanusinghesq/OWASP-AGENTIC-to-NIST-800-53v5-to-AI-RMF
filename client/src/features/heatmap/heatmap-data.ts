// ─── Heatmap Density Data ───────────────────────────────────────────
// Static derivations from the crosswalk (frozen at module load). These were
// useMemo(..., []) in Home; the empty dependency arrays made them constants.

import { AI_RMF, CROSSWALK, NIST_800_53, OWASP_ASI } from "@/data/crosswalk";

export interface HeatmapData {
  data: Record<string, Record<string, number>>;
  maxVal: number;
}

function buildNistHeatmap(): HeatmapData {
  const data: Record<string, Record<string, number>> = {};
  let maxVal = 0;
  OWASP_ASI.forEach((asi) => {
    data[asi.id] = {};
    const cw = CROSSWALK[asi.id];
    NIST_800_53.forEach((fam) => {
      const match = cw.nist53.find((n) => n.family === fam.id);
      const count = match ? match.controls.length : 0;
      data[asi.id][fam.id] = count;
      if (count > maxVal) maxVal = count;
    });
  });
  return { data, maxVal };
}

function buildAiRmfHeatmap(): HeatmapData {
  const data: Record<string, Record<string, number>> = {};
  let maxVal = 0;
  OWASP_ASI.forEach((asi) => {
    data[asi.id] = {};
    const cw = CROSSWALK[asi.id];
    AI_RMF.forEach((func) => {
      const match = cw.aiRmf.find((a) => a.func === func.id);
      const count = match ? match.cats.length : 0;
      data[asi.id][func.id] = count;
      if (count > maxVal) maxVal = count;
    });
  });
  return { data, maxVal };
}

export const NIST_HEATMAP: HeatmapData = buildNistHeatmap();
export const AI_RMF_HEATMAP: HeatmapData = buildAiRmfHeatmap();
