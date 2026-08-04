// @vitest-environment jsdom
// ─── App — analyzer front door ──────────────────────────────────────
// Move 1: landing on ?tab=analyze (a shareable deep link) renders the
// Architecture Analyzer inline as the primary view — not buried inside
// the Scenario Simulator. Proves the Home → analyze wiring end to end.

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("App — analyzer front door", () => {
  beforeEach(() => {
    // Deep-link straight to the analyzer, and mark onboarding seen so the
    // welcome modal doesn't sit over the assertion.
    window.history.replaceState({}, "", "?tab=analyze");
    try {
      localStorage.setItem("agentic_risk_onboarding_v1", JSON.stringify({ completed: true }));
    } catch {
      /* storage unavailable — assertions are presence-based regardless */
    }
  });

  it("renders the analyzer inline when landing on ?tab=analyze", async () => {
    // Warm the lazy chunk into the module cache first, so React.lazy resolves
    // from cache instead of racing a cold dynamic import under parallel-worker
    // CPU contention (the sole source of this test's flakiness).
    await import("@/features/diagram/DiagramAnalyzer");
    render(<App />);
    // The analyzer's key-free manual path is unique to it — a robust anchor.
    expect(
      await screen.findByLabelText(/add a pattern manually/i, {}, { timeout: 5000 }),
    ).toBeTruthy();
    // And it is the front door, not the buried panel.
    expect(document.querySelector('[aria-modal="true"]')).toBeNull();
  });
});
