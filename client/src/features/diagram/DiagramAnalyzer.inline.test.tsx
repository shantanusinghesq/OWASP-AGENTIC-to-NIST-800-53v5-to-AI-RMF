// @vitest-environment jsdom
// ─── DiagramAnalyzer — inline (front-door) variant ──────────────────
// Move 1: the analyzer must render as a primary inline surface, not the
// buried aria-modal sidebar, and its key-free manual path must be a
// first-class action (VISION is unavailable without a key — the exact
// condition of the public GitHub Pages deploy).

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DiagramAnalyzer from "./DiagramAnalyzer";

afterEach(cleanup);

describe("DiagramAnalyzer inline variant", () => {
  it("renders as a primary inline surface, not an aria-modal dialog", () => {
    const { container } = render(<DiagramAnalyzer variant="inline" onResultReady={vi.fn()} />);
    // The analyzer surface is present as a heading...
    expect(screen.getByRole("heading", { name: /architecture analyzer/i })).toBeTruthy();
    // ...but NOT wrapped in the buried modal panel.
    expect(container.querySelector('[aria-modal="true"]')).toBeNull();
    // ...and the front door has no "close" affordance (it is the page, not a panel).
    expect(
      screen.queryByRole("button", { name: /close architecture analyzer/i }),
    ).toBeNull();
  });

  it("offers the key-free manual pattern path as a first-class action", () => {
    render(<DiagramAnalyzer variant="inline" onResultReady={vi.fn()} />);
    // No API key in the test env → VISION unavailable → the manual add path
    // must be present and usable (this is the public-site condition).
    expect(screen.getByLabelText(/add a pattern manually/i)).toBeTruthy();
  });
});
