export {
  AI_RMF,
  CROSSWALK,
  NIST_800_53,
  OWASP_ASI,
  severityColor,
  type AIRMFFunction,
  type AIRMFMapping,
  type ASIRisk,
  type CrosswalkEntry,
  type NISTFamily,
  type NISTMapping,
} from "./data.js";

export {
  computeCoverage,
  computeStats,
  parseControlRef,
  type Coverage,
  type CrosswalkStats,
} from "./derive.js";

export { OSCAL_SOURCE, type OscalControl } from "./oscal-index.js";
export { UPSTREAM_VERSIONS, type UpstreamLayer } from "./provenance.js";

export { NIST_CONTROL_DESCRIPTIONS } from "./nist-control-descriptions.js";
export {
  NIST_AI_RMF_DESCRIPTIONS,
  type AIRMFControlDesc,
} from "./nist-ai-rmf-descriptions.js";
