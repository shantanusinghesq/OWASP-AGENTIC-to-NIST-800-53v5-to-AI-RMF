/**
 * @file pattern-evaluator.ts
 * @description Converts detected architecture patterns into a ScenarioResult
 * compatible with the existing Scenario Simulator renderer.
 *
 * This is a parallel engine to the scrambler's evaluator module — it MUST NOT
 * import from it. Relevance is pattern-driven (ASI weights from the detected
 * patterns) rather than IMDA-risk-category-driven, while cell breakage uses the
 * same FAMILY_TO_PRIMARY_BOOLEAN governance model so diagram-sourced scenarios
 * stay consistent with the rest of the platform.
 *
 * It MAY import types/mappings/bias-model from features/simulator/engine/* —
 * that is the allowed one-way diagram → simulator/engine dependency edge.
 */

import type {
  CellState,
  CheckpointResult,
  ControlEvaluation,
  FactPattern,
  GovernancePosture,
  ScenarioResult,
} from "@/features/simulator/engine/types";
import { generateBiasCurve, type BiasDataPoint } from "@/features/simulator/engine/bias-model";
import {
  getPatternById,
  type LLMPatternMatch,
  type PatternDefinition,
  type PatternId,
} from "./agentic-patterns";
import {
  CONTROL_STATE_TO_FAMILIES,
  FAMILY_TO_PRIMARY_BOOLEAN,
} from "@/features/simulator/engine/mappings";
import { OWASP_ASI, NIST_800_53 } from "@/data/crosswalk";

// ─── Contracts ──────────────────────────────────────────────────────────────

export interface PatternEvaluationInput {
  /** Detected patterns (vision or manual), from DiagramAnalysisResult. */
  matches: LLMPatternMatch[];
  /** User-selectable: "Minimal" | "Standard" | "Full". */
  governancePosture: GovernancePosture;
}

export interface PatternEvaluationOutput {
  factPattern: FactPattern;
  result: ScenarioResult;
  biasData: BiasDataPoint[];
  label: string;
}

type ControlState = FactPattern["control_state"];
type ControlKey = keyof ControlState;

/** Declaration order doubles as the tie-breaker for posture ranking. */
const CONTROL_KEYS: ControlKey[] = [
  "has_agent_limits",
  "has_identity_management",
  "has_oversight_design",
  "has_dev_controls",
  "has_testing",
  "has_phased_deployment",
  "has_monitoring",
];

const ASI_TO_RISK_CATEGORY: Record<string, FactPattern["risk_category"]> = {
  ASI01: "Unauthorised",
  ASI02: "Disruption",
  ASI03: "Unauthorised",
  ASI04: "DataBreach",
  ASI05: "Disruption",
  ASI06: "Erroneous",
  ASI07: "DataBreach",
  ASI08: "Disruption",
  ASI09: "Biased",
  ASI10: "Disruption",
};

/** Collapses the 12 analyzer patterns onto the 4 cascade-graph archetypes. */
const PATTERN_TO_ARCHETYPE: Record<PatternId, FactPattern["agent_archetype"]> = {
  single_agent: "Single",
  sequential_pipeline: "Sequential",
  supervisor_worker: "Supervisor",
  swarm_peer: "Swarm",
  router_triage: "Sequential",
  parallel_sectioning: "Sequential",
  reflection_loop: "Single",
  orchestrator_dynamic: "Supervisor",
  group_chat: "Swarm",
  handoff_chain: "Sequential",
  human_in_loop: "Single",
  tool_augmented: "Single",
};

// ─── Step 1: Composite Control State ────────────────────────────────────────

function resolvePatterns(matches: LLMPatternMatch[]): PatternDefinition[] {
  return matches
    .map((m) => getPatternById(m.patternId))
    .filter((p): p is PatternDefinition => p !== undefined);
}

/**
 * Intersection (AND) of all detected patterns' controlStateDefaults — if a
 * control is false in ANY detected pattern, it is false in the composite
 * ("weakest link" principle) — then adjusted for governance posture.
 */
function computeCompositeControlState(
  matches: LLMPatternMatch[],
  posture: GovernancePosture
): ControlState {
  const detected = resolvePatterns(matches);
  const state = {} as ControlState;

  for (const key of CONTROL_KEYS) {
    // AND over an empty set is vacuously true; with zero matches every cell
    // is irrelevant anyway, so the control state never surfaces as "broken".
    state[key] = detected.every((p) => p.controlStateDefaults[key]);
  }

  if (posture === "Full") {
    for (const key of CONTROL_KEYS) state[key] = true;
  } else if (posture === "Minimal") {
    // Keep only the 2 controls that are true in the most detected patterns.
    const ranked = CONTROL_KEYS.map((key) => ({
      key,
      trueCount: detected.filter((p) => p.controlStateDefaults[key]).length,
    })).sort((a, b) => b.trueCount - a.trueCount);
    const kept = new Set(ranked.slice(0, 2).map((r) => r.key));
    for (const key of CONTROL_KEYS) state[key] = kept.has(key);
  }

  return state;
}

// ─── Step 2: Map to FactPattern ─────────────────────────────────────────────

function determineDominantRiskCategory(
  matches: LLMPatternMatch[]
): FactPattern["risk_category"] {
  const weightedTotals = new Map<string, number>();
  for (const match of matches) {
    const pattern = getPatternById(match.patternId);
    if (!pattern) continue;
    for (const mapping of pattern.asiMappings) {
      weightedTotals.set(
        mapping.asiId,
        (weightedTotals.get(mapping.asiId) ?? 0) + mapping.weight * match.confidence
      );
    }
  }

  let dominantAsi = "";
  let dominantWeight = 0;
  weightedTotals.forEach((total, asiId) => {
    if (total > dominantWeight) {
      dominantWeight = total;
      dominantAsi = asiId;
    }
  });

  return ASI_TO_RISK_CATEGORY[dominantAsi] ?? "Erroneous";
}

function mapToArchetype(matches: LLMPatternMatch[]): FactPattern["agent_archetype"] {
  if (matches.length === 0) return "Single";
  const top = matches.reduce((best, m) => (m.confidence > best.confidence ? m : best));
  return PATTERN_TO_ARCHETYPE[top.patternId] ?? "Single";
}

// ─── Step 3: Evaluate Cells ─────────────────────────────────────────────────

/**
 * Maximum (weight × confidence) for the given ASI across all detected
 * patterns. 0 when no detected pattern maps to the ASI.
 */
function getMaxASIWeight(asiId: string, matches: LLMPatternMatch[]): number {
  let max = 0;
  for (const match of matches) {
    const pattern = getPatternById(match.patternId);
    if (!pattern) continue;
    const mapping = pattern.asiMappings.find((m) => m.asiId === asiId);
    if (mapping) max = Math.max(max, mapping.weight * match.confidence);
  }
  return max;
}

export function getCellStateForPattern(
  asiId: string,
  familyId: string,
  matches: LLMPatternMatch[],
  controlState: ControlState
): CellState {
  const maxWeight = getMaxASIWeight(asiId, matches);
  if (maxWeight === 0) return "irrelevant";

  const governingBoolean = FAMILY_TO_PRIMARY_BOOLEAN[familyId];
  if (!governingBoolean) return "irrelevant";

  const controlPresent = controlState[governingBoolean as ControlKey];
  return controlPresent ? "active" : "broken";
}

function humanizeControlKey(key: string): string {
  return key
    .replace("has_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * The strongest detected pattern's rationale for the given ASI, used as the
 * cell-level explanation in the analysis panel.
 */
function strongestRationaleForASI(asiId: string, matches: LLMPatternMatch[]): string {
  let best = "";
  let bestWeight = 0;
  for (const match of matches) {
    const pattern = getPatternById(match.patternId);
    if (!pattern) continue;
    const mapping = pattern.asiMappings.find((m) => m.asiId === asiId);
    if (mapping && mapping.weight * match.confidence > bestWeight) {
      bestWeight = mapping.weight * match.confidence;
      best = `${pattern.name}: ${mapping.rationale}`;
    }
  }
  return best;
}

function evaluateCells(
  matches: LLMPatternMatch[],
  controlState: ControlState
): ControlEvaluation[] {
  const evaluations: ControlEvaluation[] = [];

  for (const asi of OWASP_ASI) {
    const rationale = strongestRationaleForASI(asi.id, matches);
    for (const family of NIST_800_53) {
      const state = getCellStateForPattern(asi.id, family.id, matches, controlState);
      const governingBoolean = FAMILY_TO_PRIMARY_BOOLEAN[family.id] ?? "";
      evaluations.push({
        control_id: governingBoolean || family.id,
        family: family.id,
        state,
        rationale:
          state === "irrelevant"
            ? `No detected pattern implicates ${asi.id} (${asi.name}) for this cell.`
            : rationale || `Detected pattern(s) implicate ${asi.id} (${asi.name}).`,
        mitigation:
          state === "broken"
            ? `Implement ${humanizeControlKey(governingBoolean)} to restore ${family.name} (${family.id}) coverage against ${asi.name}.`
            : `${family.name} (${family.id}) coverage is governed by ${humanizeControlKey(governingBoolean)}.`,
      });
    }
  }

  return evaluations;
}

// ─── Steps 4–5: Checkpoints, Cascade Path, Assembly ─────────────────────────

function generateCheckpoints(
  matches: LLMPatternMatch[],
  controlState: ControlState
): CheckpointResult[] {
  const detected = resolvePatterns(matches);
  return CONTROL_KEYS.map((key) => {
    const weakestLinks = detected
      .filter((p) => !p.controlStateDefaults[key])
      .map((p) => p.name);
    return {
      checkpoint_id: key,
      description: `${humanizeControlKey(key)} present in the analyzed architecture?`,
      result: controlState[key] ? "passed" : "failed",
      details: {
        governs_families: CONTROL_STATE_TO_FAMILIES[key] ?? [],
        typically_absent_in: weakestLinks,
      },
    };
  });
}

function generateCascadePath(
  archetype: FactPattern["agent_archetype"],
  brokenFamilies: string[]
): string[] {
  const path: string[] = [];
  let origin = "Agent";

  switch (archetype) {
    case "Sequential":
      path.push("Agent A → Agent B → Agent C");
      origin = "Agent C";
      break;
    case "Supervisor":
      path.push("Supervisor → Agent A", "Supervisor → Agent B", "Supervisor → Agent C");
      origin = "Supervisor";
      break;
    case "Swarm":
      path.push(
        "Coordinator → Agent A",
        "Coordinator → Agent B",
        "Coordinator → Agent C",
        "Agent A ↔ Agent B",
        "Agent A ↔ Agent C",
        "Agent B ↔ Agent C"
      );
      origin = "Coordinator";
      break;
    case "Single":
      break;
  }

  for (const family of brokenFamilies.slice(0, 3)) {
    path.push(`${origin} → ${family} (control gap)`);
  }

  return path;
}

export function evaluatePatterns(input: PatternEvaluationInput): PatternEvaluationOutput {
  const { matches, governancePosture } = input;

  // Step 1: composite control state (weakest link + posture adjustment)
  const controlState = computeCompositeControlState(matches, governancePosture);

  // Step 2: FactPattern
  const factPattern: FactPattern = {
    risk_category: determineDominantRiskCategory(matches),
    agent_archetype: mapToArchetype(matches),
    control_state: controlState,
    impact_profile: {
      domain_error_tolerance: "Low",
      data_sensitivity: "Confidential",
      external_access: "External",
      action_scope: "ReadWrite",
      reversibility: "Irreversible",
    },
    likelihood_profile: {
      autonomy: "High",
      task_complexity: "Complex",
      external_exposure: "High",
    },
  };

  // Step 3: per-cell evaluation
  const controlEvaluations = evaluateCells(matches, controlState);
  const brokenCells = controlEvaluations.filter((c) => c.state === "broken");
  const brokenFamilies = Array.from(new Set(brokenCells.map((c) => c.family)));

  // Step 4: bias curve (same 25-action window the simulator uses)
  const biasData = generateBiasCurve(25);

  // Step 5: assemble
  const patternNames = matches
    .map((m) => getPatternById(m.patternId)?.name)
    .filter((name): name is string => Boolean(name));

  return {
    factPattern,
    result: {
      failure_injected: brokenCells.length > 0,
      controls_evaluated: controlEvaluations,
      outcome: `Architecture analysis: ${matches.length} pattern(s) detected. ${brokenCells.length} control gaps identified across ${brokenFamilies.length} NIST families.`,
      checkpoint_results: generateCheckpoints(matches, controlState),
      cascade_path: generateCascadePath(factPattern.agent_archetype, brokenFamilies),
    },
    biasData,
    label:
      patternNames.length > 0
        ? `Diagram: ${patternNames.join(" + ")}`
        : "Diagram: No patterns detected",
  };
}
