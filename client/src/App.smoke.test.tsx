// @vitest-environment jsdom
// ─── App Smoke Test ─────────────────────────────────────────────────
// The single highest-leverage guard for the refactor: renders the full app
// (all providers included) and asserts the shell and default Overview view
// appear. Must survive the data-source cutover and the Home decomposition
// unchanged — if it breaks, the change broke rendering, not the test.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App smoke", () => {
  it("renders the shell tabs and the Overview roster", async () => {
    render(<App />);

    // Hero + nav shell (labels may render more than once — e.g. tab + submenu)
    expect(await screen.findAllByText("Agentic AI Risks")).not.toHaveLength(0);
    for (const label of ["Overview", "Heatmaps", "Evidence Explorer", "Scenario Simulator"]) {
      expect(screen.getAllByText(label).length, `nav label "${label}"`).toBeGreaterThan(0);
    }

    // Default view: Overview roster cards (first and last ASI)
    expect(await screen.findAllByText("ASI01")).not.toHaveLength(0);
    expect(screen.getAllByText("Agent Goal Hijack").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ASI10").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rogue Agents").length).toBeGreaterThan(0);
  });
});
