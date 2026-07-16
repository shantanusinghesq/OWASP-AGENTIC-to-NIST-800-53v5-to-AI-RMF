// ─── Committee Brief (print-ready HTML) ─────────────────────────────
// Pure builder for the committee brief: a complete, self-contained,
// LIGHT-THEME html document string the caller opens in a new window and
// prints (window.print → Save as PDF). No React, no DOM, no clock — the
// timestamp arrives via opts.generatedAt so the output is byte-stable and
// node-testable.
//
// XSS guard: the opened window is SAME-ORIGIN, so every interpolated value
// — including user-typed annotation text (owner/note) — passes through
// esc() before it reaches the document string. No exceptions.

import {
  AI_RMF,
  CROSSWALK,
  CROSSWALK_DATA_VERSION,
  NIST_800_53,
  OWASP_ASI,
  UPSTREAM_VERSIONS,
  getControlDescription,
  parseControlRef,
  type EvidenceItem,
  type Framework,
  type ValidationStatus,
} from "@/data/crosswalk";
import {
  mappingKey,
  type Assessment,
  type MappingAnnotation,
  type MappingRef,
  type RaciRole,
  type StatusOverride,
} from "./types";

/** Entity-encode every character that can break out of HTML text or attributes. */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const VALIDATION_LABEL: Record<ValidationStatus, string> = {
  editorial: "Editorial",
  "practitioner-reviewed": "Practitioner-reviewed",
  "empirically-validated": "Empirically-validated",
};

const RACI_LABEL: Record<RaciRole, string> = {
  R: "R (Responsible)",
  A: "A (Accountable)",
  C: "C (Consulted)",
  I: "I (Informed)",
};

const STATUS_OVERRIDE_LABEL: Record<StatusOverride, string> = {
  concur: "Concur",
  challenge: "Challenge",
  "n-a": "Not applicable",
};

/** "AC-3 Access Enforcement" → "AC-3 — Access Enforcement" via the catalog title. */
function controlLabel(framework: Framework, refText: string): string {
  const ref = parseControlRef(refText);
  if (!ref) return refText;
  const title = getControlDescription(framework, ref.id)?.title ?? ref.title;
  // AI-RMF description titles already lead with the id; 800-53 titles do not.
  return title.startsWith(ref.id) ? title : `${ref.id} — ${title}`;
}

function hasAnnotation(a: MappingAnnotation | undefined): a is MappingAnnotation {
  if (!a) return false;
  return (
    a.owner.trim() !== "" || a.raciRole !== null || a.statusOverride !== null || a.note.trim() !== ""
  );
}

function annotationHtml(a: MappingAnnotation | undefined): string {
  if (!hasAnnotation(a)) return "";
  const fields: string[] = [];
  if (a.owner.trim() !== "") fields.push(`<strong>Owner:</strong> ${esc(a.owner)}`);
  if (a.raciRole !== null) fields.push(`<strong>RACI:</strong> ${esc(RACI_LABEL[a.raciRole])}`);
  if (a.statusOverride !== null)
    fields.push(`<strong>Status:</strong> ${esc(STATUS_OVERRIDE_LABEL[a.statusOverride])}`);
  const note = a.note.trim() !== "" ? `<p class="note">${esc(a.note)}</p>` : "";
  return `<div class="annotation"><p>${fields.join(" &middot; ")}</p>${note}</div>`;
}

function mappingHtml(
  title: string,
  refs: string[],
  framework: Framework,
  rationale: string,
  status: ValidationStatus,
  annotation: MappingAnnotation | undefined,
): string {
  const items = refs.map((r) => `<li>${esc(controlLabel(framework, r))}</li>`).join("");
  return [
    `<article class="mapping">`,
    `<h4>${esc(title)}</h4>`,
    `<ul class="refs">${items}</ul>`,
    // One rationale is authored per family, covering every control listed
    // above it — labelled as such, not implied as per-control justification
    // (comprehension-audit F9/H7).
    `<p class="rationale"><strong>Family rationale:</strong> ${esc(rationale)}</p>`,
    `<p class="status">Validation status: ${esc(VALIDATION_LABEL[status])}</p>`,
    annotationHtml(annotation),
    `</article>`,
  ].join("\n");
}

function evidenceHtml(items: EvidenceItem[]): string {
  if (items.length === 0) return "";
  const lis = items
    .map((e) => {
      const cve = e.cveId ? ` <span class="cve">${esc(e.cveId)}</span>` : "";
      const url = e.sourceUrl
        ? ` <a class="url" href="${esc(e.sourceUrl)}">${esc(e.sourceUrl)}</a>`
        : "";
      return `<li><span class="etype">${esc(e.type)}</span> ${esc(e.title)}${cve}${url}</li>`;
    })
    .join("");
  return `<h3>Real-world evidence</h3>\n<ul class="evidence">${lis}</ul>`;
}

const STYLE = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #ffffff;
  color: #1e293b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 13px;
  line-height: 1.55;
}
@page { margin: 2cm; }
.toolbar {
  position: sticky;
  top: 0;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 1.5rem;
  text-align: right;
}
.toolbar button {
  font: inherit;
  font-weight: 600;
  padding: 0.35rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
  cursor: pointer;
}
@media print { .toolbar { display: none; } }
header.doc, main, footer.doc { max-width: 50rem; margin: 0 auto; padding: 0 1.5rem; }
header.doc { padding-top: 1.5rem; }
h1 { font-size: 1.4rem; margin: 0 0 0.25rem; }
h2 { font-size: 1.1rem; margin: 0 0 0.25rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.25rem; }
h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 1.1rem 0 0.4rem; }
h4 { font-size: 0.9rem; margin: 0 0 0.3rem; }
.meta { color: #64748b; margin: 0 0 1rem; }
section.asi { margin: 1.5rem 0 2rem; page-break-inside: avoid; }
section.asi > .desc { color: #475569; margin: 0.4rem 0 0; }
.sev { display: inline-block; margin-left: 0.5rem; padding: 0.05rem 0.5rem; border: 1px solid #cbd5e1; border-radius: 999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; vertical-align: middle; }
.asi-id { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #2563eb; }
article.mapping { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; margin: 0 0 0.75rem; page-break-inside: avoid; }
ul.refs { margin: 0.25rem 0 0.5rem; padding-left: 1.25rem; }
ul.refs li { margin: 0.1rem 0; }
.rationale { margin: 0.25rem 0; }
.status { margin: 0.25rem 0 0; font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
.annotation { margin-top: 0.5rem; border-left: 3px solid #cbd5e1; padding: 0.25rem 0 0.25rem 0.75rem; background: #f8fafc; }
.annotation p { margin: 0.15rem 0; }
.annotation .note { white-space: pre-wrap; }
ul.evidence { margin: 0.25rem 0; padding-left: 1.25rem; }
ul.evidence li { margin: 0.25rem 0; page-break-inside: avoid; }
.etype { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b91c1c; }
.cve { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #b91c1c; }
.url { color: #2563eb; word-break: break-all; }
footer.doc { margin-top: 2rem; padding-top: 1rem; padding-bottom: 2rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; }
footer.doc ul { margin: 0.25rem 0; padding-left: 1.25rem; }
`;

/**
 * Builds the complete committee-brief html document for the given assessment.
 * Pure: never reads the clock — pass opts.generatedAt (ISO 8601) for the
 * header/footer timestamp; it is omitted when not provided.
 */
export function buildBriefHtml(
  assessment: Assessment,
  opts?: { generatedAt?: string },
): string {
  const generatedAt = opts?.generatedAt ?? "";
  const generatedLabel = generatedAt !== "" ? ` &middot; generated ${esc(generatedAt)}` : "";

  const selectedFamilies = (asiId: string): Set<string> =>
    new Set(
      assessment.selections
        .filter((r) => r.asiId === asiId && r.framework === "nist")
        .map((r) => r.familyOrFunc),
    );
  const selectedFuncs = (asiId: string): Set<string> =>
    new Set(
      assessment.selections
        .filter((r) => r.asiId === asiId && r.framework === "aiRmf")
        .map((r) => r.familyOrFunc),
    );
  const annotationFor = (ref: MappingRef): MappingAnnotation | undefined =>
    assessment.annotations[mappingKey(ref)];

  const sections: string[] = [];
  for (const asi of OWASP_ASI) {
    const entry = CROSSWALK[asi.id];
    if (!entry) continue;
    const families = selectedFamilies(asi.id);
    const funcs = selectedFuncs(asi.id);
    if (families.size === 0 && funcs.size === 0) continue;

    const nistBlocks = entry.nist53
      .filter((m) => families.has(m.family))
      .map((m) => {
        const fam = NIST_800_53.find((f) => f.id === m.family);
        return mappingHtml(
          fam ? `${fam.id} — ${fam.name}` : m.family,
          m.controls,
          "nist",
          m.rationale,
          m.validationStatus,
          annotationFor({ asiId: asi.id, framework: "nist", familyOrFunc: m.family }),
        );
      });

    const rmfBlocks = entry.aiRmf
      .filter((m) => funcs.has(m.func))
      .map((m) => {
        const func = AI_RMF.find((f) => f.id === m.func);
        return mappingHtml(
          func ? func.name : m.func,
          m.cats,
          "aiRmf",
          m.rationale,
          m.validationStatus,
          annotationFor({ asiId: asi.id, framework: "aiRmf", familyOrFunc: m.func }),
        );
      });

    sections.push(
      [
        `<section class="asi">`,
        `<h2><span class="asi-id">${esc(asi.id)}</span> ${esc(asi.name)}<span class="sev">Severity: ${esc(asi.severity)}</span></h2>`,
        `<p class="desc">${esc(asi.desc)}</p>`,
        nistBlocks.length > 0 ? `<h3>NIST SP 800-53 Rev 5 controls</h3>\n${nistBlocks.join("\n")}` : "",
        rmfBlocks.length > 0 ? `<h3>NIST AI RMF 100-1 categories</h3>\n${rmfBlocks.join("\n")}` : "",
        evidenceHtml(entry.evidence),
        `</section>`,
      ]
        .filter((s) => s !== "")
        .join("\n"),
    );
  }

  const provenance = Object.values(UPSTREAM_VERSIONS)
    .map(
      (layer) =>
        `<li>${esc(layer.framework)} — ${esc(layer.edition)} (verified ${esc(layer.lastVerified)})</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(assessment.name)} — committee brief</title>
<style>${STYLE}</style>
</head>
<body>
<div class="toolbar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>
<header class="doc">
<h1>Agentic AI risk — committee brief</h1>
<p class="meta">${esc(assessment.name)}${generatedLabel}</p>
</header>
<main>
${sections.join("\n")}
</main>
<footer class="doc">
<h3>Provenance</h3>
<ul>${provenance}</ul>
<p>Crosswalk data version ${esc(CROSSWALK_DATA_VERSION)}${generatedLabel}</p>
</footer>
</body>
</html>
`;
}

/**
 * Ephemeral single-risk assessment: selects EVERY nist53 family and aiRmf
 * function the crosswalk offers for one ASI. Powers the per-risk "Export
 * brief" button WITHOUT touching AssessmentContext — RiskDetail must keep
 * rendering provider-less. Pure: the caller supplies the timestamp.
 */
export function buildSingleRiskAssessment(asiId: string, nowIso: string): Assessment {
  const entry = CROSSWALK[asiId];
  const selections: MappingRef[] = entry
    ? [
        ...entry.nist53.map(
          (m): MappingRef => ({ asiId, framework: "nist", familyOrFunc: m.family }),
        ),
        ...entry.aiRmf.map(
          (m): MappingRef => ({ asiId, framework: "aiRmf", familyOrFunc: m.func }),
        ),
      ]
    : [];
  return {
    id: `${asiId}-risk-brief`,
    name: `${asiId} risk brief`,
    createdAt: nowIso,
    updatedAt: nowIso,
    dataVersion: CROSSWALK_DATA_VERSION,
    selections,
    annotations: {},
  };
}
