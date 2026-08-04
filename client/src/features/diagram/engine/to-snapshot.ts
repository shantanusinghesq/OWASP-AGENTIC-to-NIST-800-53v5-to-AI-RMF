// ─── Diagram result → Scenario snapshot ─────────────────────────────
// Shared by the Scenario Simulator's in-panel analyzer and the inline
// front-door analyzer, so the two paths build an identical snapshot
// (avoids the byte-duplicated-builder drift the two callers would
// otherwise reinvent).

import type { PatternEvaluationOutput } from "./pattern-evaluator";
import type { ScenarioSnapshot } from "@/features/simulator/ScenarioContext";

export function snapshotFromDiagram(output: PatternEvaluationOutput): ScenarioSnapshot {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    factPattern: output.factPattern,
    result: output.result,
    biasData: output.biasData,
    label: output.label,
    resultSource: "diagram",
  };
}
