export {
  AI_RMF,
  CROSSWALK,
  FRAMEWORK_REFS,
  NIST_800_53,
  OWASP_ASI,
  severityColor,
  type AIRMFFunction,
  type AIRMFMapping,
  type ASIRisk,
  type ConfidenceLevel,
  type CrosswalkEntry,
  type EvidenceItem,
  type FrameworkRefs,
  type NISTFamily,
  type NISTMapping,
  type ValidationStatus,
} from "./data.js";

export {
  computeCoverage,
  computeStats,
  parseControlRef,
  type Coverage,
  type CrosswalkStats,
} from "./derive.js";

export { OSCAL_800_53_REV5, OSCAL_SOURCE, type OscalControl } from "./oscal-index.js";
export { UPSTREAM_VERSIONS, type UpstreamLayer } from "./provenance.js";

export {
  CSV_HEADER,
  buildCsv,
  buildJson,
  evidenceText,
  serializeJson,
  type CrosswalkArtifact,
} from "./artifacts.js";

export {
  buildOscalMapping,
  type OscalMapping,
  type OscalMappingAiRmf,
  type OscalMappingControl,
  type OscalMappingEntry,
} from "./oscal-mapping.js";

export { NIST_CONTROL_DESCRIPTIONS } from "./nist-control-descriptions.js";
export {
  NIST_AI_RMF_DESCRIPTIONS,
  type AIRMFControlDesc,
} from "./nist-ai-rmf-descriptions.js";

export { CROSSWALK_DATA_VERSION } from "./version.js";

export {
  INCIDENT_REGISTER,
  buildRegisterReport,
  type IncidentRecord,
  type RegisterReport,
} from "./incident-register.js";
