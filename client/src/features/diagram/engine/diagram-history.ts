/**
 * @file diagram-history.ts
 * @description localStorage persistence for the last 5 diagram analyses.
 * Storage failures (quota exceeded, privacy mode) degrade silently — the
 * history feature is non-essential.
 */

import type { DiagramAnalysisResult } from "./diagram-analyzer";

const STORAGE_KEY = "diagram-analysis-history";
const MAX_ENTRIES = 5;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  thumbnailDataUrl: string;
  matchCount: number;
  patternNames: string[];
  taxonomyVersion: string;
  source: "vision" | "manual";
  /** Full matches stored for restoration. */
  matches: DiagramAnalysisResult["matches"];
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function addToHistory(result: DiagramAnalysisResult, patternNames: string[]): void {
  const entry: HistoryEntry = {
    id: result.id,
    timestamp: result.timestamp,
    thumbnailDataUrl: result.thumbnailDataUrl,
    matchCount: result.matches.length,
    patternNames,
    taxonomyVersion: result.taxonomyVersion,
    source: result.source,
    matches: result.matches,
  };

  const history = getHistory();
  const updated = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Quota exceeded or storage unavailable — history degrades gracefully.
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
