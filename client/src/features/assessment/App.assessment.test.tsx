// @vitest-environment jsdom
// ─── App × Assessment integration guard ─────────────────────────────
// The full <App/> must mount with AssessmentProvider in the tree (Home
// renders AssessmentTray, whose strict hook throws without the provider —
// a successful render IS the proof), and the tray must contribute zero DOM
// while the assessment is untouched, keeping App.smoke.test.tsx assertions
// byte-identical.

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "@/App";

afterEach(cleanup);

describe("App × assessment", () => {
  it("renders the full app with the provider mounted and no tray DOM when empty", async () => {
    render(<App />);

    // Shell renders — AssessmentTray's strict useAssessment() did not throw,
    // so AssessmentProvider is present above Home.
    expect(await screen.findAllByText("Agentic AI Risks")).not.toHaveLength(0);

    // Null-when-empty: untouched assessment contributes no DOM at all.
    expect(screen.queryByTestId("assessment-tray")).toBeNull();
  });
});
