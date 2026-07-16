// ─── Comprehension-audit F5 regression ──────────────────────────────
// evaluateScenario() iterates every ASI risk × NIST family, but families are
// reused across multiple ASIs (e.g. CM appears under both ASI01 and ASI05).
// Without asi_id, downstream consumers filtering controls_evaluated by
// family alone (AnalysisPanel.tsx) surfaced the WRONG ASI's controls and
// rationale for a given cell. This test pins the fix at the data-shape
// level: every evaluation carries its owning asi_id, and filtering by
// asi_id + family never leaks another ASI's controls.

import { describe, expect, it } from "vitest";
import { evaluateScenario } from "./evaluator";
import type { FactPattern } from "./types";

const factPattern: FactPattern = {
  risk_category: "Erroneous",
  agent_archetype: "Single",
  control_state: {
    has_agent_limits: false,
    has_identity_management: false,
    has_oversight_design: false,
    has_dev_controls: false,
    has_testing: false,
    has_phased_deployment: false,
    has_monitoring: false,
  },
  impact_profile: {
    domain_error_tolerance: "Low",
    data_sensitivity: "PII",
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

describe("evaluateScenario — asi_id scoping (comprehension-audit F5)", () => {
  it("every ControlEvaluation carries a non-empty asi_id", () => {
    const result = evaluateScenario(factPattern);
    expect(result.controls_evaluated.length).toBeGreaterThan(0);
    for (const ctrl of result.controls_evaluated) {
      expect(ctrl.asi_id).toBeTruthy();
    }
  });

  it("ASI01 x CM yields exactly CM-3/CM-5 with ASI01's rationale, never ASI05's CM-7/CM-14", () => {
    const result = evaluateScenario(factPattern);

    const asi01Cm = result.controls_evaluated.filter(
      (c) => c.asi_id === "ASI01" && c.family === "CM",
    );
    const controlIds = asi01Cm.map((c) => c.control_id).sort();
    expect(controlIds).toEqual(["CM-3", "CM-5"]);

    for (const ctrl of asi01Cm) {
      expect(ctrl.rationale).toContain("Locking agent system prompts");
      expect(ctrl.rationale).not.toContain("Banning eval in production agents");
    }
  });

  it("ASI05 x CM never appears when filtering by ASI01 (no cross-ASI leakage)", () => {
    const result = evaluateScenario(factPattern);

    const asi01Only = result.controls_evaluated.filter((c) => c.asi_id === "ASI01");
    const leakedAsi05Controls = asi01Only.filter(
      (c) => c.control_id === "CM-7" || c.control_id === "CM-14",
    );
    expect(leakedAsi05Controls).toEqual([]);
  });
});
