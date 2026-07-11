// ─── Assessment Tray: localStorage Persistence ──────────────────────
// Two keys: a live autosave slot (working assessment) and a named-save
// list. Storage failures (quota, privacy mode) degrade silently, matching
// diagram-history.ts. An unknown/newer schemaVersion returns null/[] but
// NEVER deletes the stored payload — a future app version may read it.

import { CROSSWALK } from "@/data/crosswalk";
import { mappingKey, type Assessment, type MappingRef } from "./types";

export const WORKING_KEY = "agentic_assessment_working_v1";
export const SAVED_KEY = "agentic_assessments_v1";
const SCHEMA_VERSION = 1;

const isMappingRef = (r: unknown): r is MappingRef => {
  if (typeof r !== "object" || r === null) return false;
  const ref = r as Record<string, unknown>;
  return (
    typeof ref.asiId === "string" &&
    (ref.framework === "nist" || ref.framework === "aiRmf") &&
    typeof ref.familyOrFunc === "string"
  );
};

const isAssessment = (a: unknown): a is Assessment => {
  if (typeof a !== "object" || a === null) return false;
  const obj = a as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.createdAt === "string" &&
    typeof obj.updatedAt === "string" &&
    typeof obj.dataVersion === "string" &&
    Array.isArray(obj.selections) &&
    obj.selections.every(isMappingRef) &&
    typeof obj.annotations === "object" &&
    obj.annotations !== null
  );
};

export function loadWorking(): Assessment | null {
  try {
    const raw = localStorage.getItem(WORKING_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const envelope = parsed as Record<string, unknown>;
    if (envelope.schemaVersion !== SCHEMA_VERSION) return null;
    return isAssessment(envelope.assessment) ? envelope.assessment : null;
  } catch {
    return null;
  }
}

export function saveWorking(assessment: Assessment): void {
  try {
    localStorage.setItem(
      WORKING_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, assessment }),
    );
  } catch {
    // Quota exceeded or storage unavailable — autosave degrades gracefully.
  }
}

export function loadSaved(): Assessment[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [];
    const envelope = parsed as Record<string, unknown>;
    if (envelope.schemaVersion !== SCHEMA_VERSION) return [];
    if (!Array.isArray(envelope.assessments)) return [];
    return envelope.assessments.filter(isAssessment);
  } catch {
    return [];
  }
}

function persistSaved(assessments: Assessment[]): void {
  try {
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, assessments }),
    );
  } catch {
    // Storage unavailable — named saves degrade gracefully.
  }
}

/** Upsert (by id) into the named-save list. */
export function saveNamed(assessment: Assessment): void {
  const existing = loadSaved();
  const next = [assessment, ...existing.filter((a) => a.id !== assessment.id)];
  persistSaved(next);
}

export function deleteSaved(id: string): void {
  persistSaved(loadSaved().filter((a) => a.id !== id));
}

/**
 * Drop selections that no longer resolve against the current crosswalk data
 * (unknown ASI, or a family/function no longer mapped for that ASI), along
 * with their annotations. Pure — never touches storage.
 */
export function pruneStale(assessment: Assessment): {
  assessment: Assessment;
  droppedCount: number;
} {
  const isLive = (r: MappingRef): boolean => {
    const entry = CROSSWALK[r.asiId];
    if (!entry) return false;
    return r.framework === "nist"
      ? entry.nist53.some((m) => m.family === r.familyOrFunc)
      : entry.aiRmf.some((m) => m.func === r.familyOrFunc);
  };

  const kept = assessment.selections.filter(isLive);
  const droppedCount = assessment.selections.length - kept.length;
  if (droppedCount === 0) return { assessment, droppedCount: 0 };

  const keptKeys = new Set(kept.map(mappingKey));
  const annotations: Assessment["annotations"] = {};
  for (const [key, ann] of Object.entries(assessment.annotations)) {
    if (keptKeys.has(key)) annotations[key] = ann;
  }
  return { assessment: { ...assessment, selections: kept, annotations }, droppedCount };
}
