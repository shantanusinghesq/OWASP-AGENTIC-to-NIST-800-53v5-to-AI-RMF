// @vitest-environment jsdom
// ─── ViewTabs — front-door contract ─────────────────────────────────
// Move 1: the Architecture Analyzer is promoted out of the Scenario
// Simulator sidebar to a top-level, first-position tab. These tests pin
// that the analyzer is discoverable at the top level and sits at the
// front of the nav — the "front door".

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewTabs } from "./ViewTabs";

afterEach(cleanup);

describe("ViewTabs", () => {
  it("exposes Analyze Architecture as a top-level tab", () => {
    render(<ViewTabs view="analyze" onViewChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /analyze architecture/i })).toBeTruthy();
  });

  it("places the analyzer first — before Overview (the front door)", () => {
    render(<ViewTabs view="overview" onViewChange={vi.fn()} />);
    const analyze = screen.getByRole("button", { name: /analyze architecture/i });
    const overview = screen.getByRole("button", { name: /^overview$/i });
    // Overview must FOLLOW analyze in document order.
    expect(
      analyze.compareDocumentPosition(overview) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("does not drop the existing tabs", () => {
    render(<ViewTabs view="overview" onViewChange={vi.fn()} />);
    for (const label of ["Overview", "Heatmaps", "Evidence Explorer", "Scenario Simulator"]) {
      expect(screen.getByText(label), `tab "${label}"`).toBeTruthy();
    }
  });
});
