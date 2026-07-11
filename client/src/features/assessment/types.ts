// ─── Assessment Tray: Core Types ────────────────────────────────────
// An Assessment is a named, persisted selection of crosswalk mappings
// (ASI × framework × family/function) plus per-mapping annotations
// (owner / RACI / status override / note). Pure types + key helper only —
// no storage, no React, no Date/crypto calls at module scope.

import type { Framework } from "@/data/crosswalk";

export type RaciRole = "R" | "A" | "C" | "I";

export type StatusOverride = "concur" | "challenge" | "n-a";

export interface MappingRef {
  asiId: string;
  framework: Framework;
  familyOrFunc: string;
}

/** Stable identity for a selected mapping — used as Set/Record key. */
export const mappingKey = (r: MappingRef): string =>
  `${r.asiId}|${r.framework}|${r.familyOrFunc}`;

export interface MappingAnnotation {
  owner: string;
  raciRole: RaciRole | null;
  statusOverride: StatusOverride | null;
  note: string;
}

export interface Assessment {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  dataVersion: string;
  selections: MappingRef[];
  annotations: Record<string, MappingAnnotation>;
}

export const DEFAULT_ASSESSMENT_NAME = "Untitled assessment";

export const blankAnnotation = (): MappingAnnotation => ({
  owner: "",
  raciRole: null,
  statusOverride: null,
  note: "",
});
