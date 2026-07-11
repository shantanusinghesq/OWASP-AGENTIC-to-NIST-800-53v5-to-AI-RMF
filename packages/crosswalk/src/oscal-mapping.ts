// ─── OSCAL-Aligned Mapping ──────────────────────────────────────────
// Renders the crosswalk as an OSCAL-*aligned* mapping object: every 800-53
// control reference is resolved against the vendored OSCAL Rev 5 catalog
// (src/oscal-index.ts, generated from a pinned usnistgov/oscal-content
// release), carrying the canonical catalog title alongside the editorial
// rationale.
//
// NOTE ON CONFORMANCE: this is an OSCAL-*aligned* shape, NOT a formal OSCAL
// model — it is intentionally not validated against the OSCAL JSON Schema
// (no `mapping` layer / `back-matter` / UUID rigor). Full OSCAL schema
// validation is a deliberate follow-up (would add an external validator +
// the OSCAL mapping model); out of scope here. What IS guaranteed: every
// referenced control exists in the pinned catalog and is NOT withdrawn —
// buildOscalMapping() THROWS otherwise, so a stale/ghost control can never
// silently ship in the artifact.

import { CROSSWALK, OWASP_ASI } from "./data.js";
import { parseControlRef } from "./derive.js";
import { OSCAL_800_53_REV5, OSCAL_SOURCE } from "./oscal-index.js";
import { CROSSWALK_DATA_VERSION } from "./version.js";

export interface OscalMappingControl {
  id: string;
  family: string;
  catalogTitle: string;
  withdrawn: false;
  rationale: string;
}

export interface OscalMappingAiRmf {
  function: string;
  categories: string[];
  rationale: string;
}

export interface OscalMappingEntry {
  asiId: string;
  asiName: string;
  severity: string;
  controls: OscalMappingControl[];
  aiRmf: OscalMappingAiRmf[];
}

export interface OscalMapping {
  "$schema-note": string;
  metadata: {
    title: string;
    version: string;
    /** ISO 8601 timestamp. Passed in by the caller; omitted when not provided
     * so the builder stays deterministic and clock-free (see gate: no Date). */
    lastModified?: string;
    oscalCatalog: typeof OSCAL_SOURCE;
  };
  mappings: OscalMappingEntry[];
}

/**
 * Builds the OSCAL-aligned mapping object for the whole crosswalk.
 *
 * @param lastModified Optional ISO 8601 timestamp for metadata.lastModified.
 *   Left as a caller-supplied parameter (never `Date.now()`/`new Date()`) so
 *   the function is pure and the output is byte-stable for tests and diffs.
 * @throws if any referenced 800-53 control id is absent from the pinned OSCAL
 *   Rev 5 catalog or is marked withdrawn — this is the withdrawn/ghost guard.
 */
export function buildOscalMapping(lastModified?: string): OscalMapping {
  const asiById = new Map(OWASP_ASI.map((a) => [a.id, a]));
  const mappings: OscalMappingEntry[] = [];

  for (const [asiId, entry] of Object.entries(CROSSWALK)) {
    const asi = asiById.get(asiId);
    const controls: OscalMappingControl[] = [];

    for (const mapping of entry.nist53) {
      for (const control of mapping.controls) {
        const ref = parseControlRef(control);
        const id = ref ? ref.id : control;
        const catalogEntry = OSCAL_800_53_REV5[id];
        if (!catalogEntry) {
          throw new Error(
            `buildOscalMapping: control "${id}" (from "${control}" under ${asiId}) is not present in the OSCAL 800-53 Rev 5 catalog (${OSCAL_SOURCE.tag}).`,
          );
        }
        if (catalogEntry.withdrawn) {
          throw new Error(
            `buildOscalMapping: control "${id}" (under ${asiId}) is WITHDRAWN in the OSCAL 800-53 Rev 5 catalog (${OSCAL_SOURCE.tag}) and must not be mapped.`,
          );
        }
        controls.push({
          id,
          family: catalogEntry.family,
          catalogTitle: catalogEntry.title,
          withdrawn: false,
          rationale: mapping.rationale,
        });
      }
    }

    mappings.push({
      asiId,
      asiName: asi?.name ?? "",
      severity: asi?.severity ?? "",
      controls,
      aiRmf: entry.aiRmf.map((m) => ({
        function: m.func,
        categories: m.cats,
        rationale: m.rationale,
      })),
    });
  }

  const metadata: OscalMapping["metadata"] = {
    title:
      "OWASP Agentic AI (ASI) ↔ NIST SP 800-53 Rev 5 ↔ NIST AI-RMF crosswalk (OSCAL-aligned mapping)",
    version: CROSSWALK_DATA_VERSION,
    oscalCatalog: OSCAL_SOURCE,
  };
  if (lastModified !== undefined) {
    metadata.lastModified = lastModified;
  }

  return {
    "$schema-note": "OSCAL-aligned mapping (not a formal OSCAL model)",
    metadata,
    mappings,
  };
}
