// @vitest-environment jsdom
// Gate 1 item 5 — analyzer-first front door.
// Selectors follow PR #44 (cursor/move-1-analyzer-frontdoor-rebased-23e1):
// the control is a button named "Analyze Architecture", placed first in the
// tab row. Visiting / with no ?tab= must show that entry as the first tab,
// or render the analyzer as the default view.

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

const ANALYZE_NAME = /analyze architecture/i;

afterEach(cleanup);

describe("Gate 1 item 5: analyzer front door", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    // The welcome modal opens on a timer and is not part of this contract.
    localStorage.setItem(
      "agentic_risk_onboarding_v1",
      JSON.stringify({ completed: true }),
    );
  });

  it("shows Analyze Architecture first when visiting / with no ?tab=", async () => {
    expect(
      new URLSearchParams(window.location.search).get("tab"),
      "visit must not preset ?tab=",
    ).toBeNull();

    render(<App />);

    const tabs = screen.queryAllByRole("tab", { name: ANALYZE_NAME });
    const buttons = screen.queryAllByRole("button", { name: ANALYZE_NAME });
    const analyze = tabs[0] ?? buttons[0];
    expect(
      analyze,
      "expected an accessible tab or button named /analyze architecture/i",
    ).toBeTruthy();

    const firstInRow = analyze.parentElement?.querySelector(
      ":scope > button, :scope > [role='tab']",
    );
    const isFirstTab = firstInRow === analyze;

    let isDefaultView = false;
    if (!isFirstTab) {
      const heading = await screen
        .findByRole(
          "heading",
          { name: /architecture analyzer/i },
          { timeout: 3000 },
        )
        .catch(() => null);
      isDefaultView = Boolean(
        heading || screen.queryByLabelText(/add a pattern manually/i),
      );
    }

    expect(
      isFirstTab || isDefaultView,
      "visiting / with no ?tab= must show Analyze Architecture as the first tab or as the default view",
    ).toBe(true);
  });
});
