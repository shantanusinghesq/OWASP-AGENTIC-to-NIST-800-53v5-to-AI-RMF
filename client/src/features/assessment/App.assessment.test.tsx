// @vitest-environment jsdom
// ─── App × Assessment integration guard ─────────────────────────────
// The full <App/> must mount with AssessmentProvider in the tree (Home
// renders AssessmentTray, whose strict hook throws without the provider —
// a successful render IS the proof), and the tray must render its zero-state
// invitation while the assessment is untouched — the tray is the entrance to
// the deliverable workflow and must not require a selection to be discovered
// (comprehension-audit F1).

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "@/App";

afterEach(cleanup);

describe("App × assessment", () => {
  it("renders the full app with the provider mounted and a zero-state tray when empty", async () => {
    render(<App />);

    // Shell renders — AssessmentTray's strict useAssessment() did not throw,
    // so AssessmentProvider is present above Home.
    expect(await screen.findAllByText("Agentic AI Risks")).not.toHaveLength(0);

    // Zero-state: untouched assessment still renders the tray, inviting selection.
    expect(screen.getByTestId("assessment-tray")).toBeTruthy();
    expect(screen.getByTestId("assessment-tray-zero-state")).toBeTruthy();
  });
});
