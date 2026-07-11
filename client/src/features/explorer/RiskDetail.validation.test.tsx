// @vitest-environment jsdom
// ─── RiskDetail validation-UI test ──────────────────────────────────
// Verifies the transparency layer's UI: every mapping shows a labelled
// (text, not color-only — NFR-7) validation badge, the legend + VALIDATION.md
// link render, and the status filter actually hides/shows mapping cards.

import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RiskDetail } from "./RiskDetail";

// This file renders more than once; unmount between cases so `screen` queries
// don't see a previous render's DOM (the shared setup has no global cleanup).
afterEach(cleanup);

describe("RiskDetail validation UI", () => {
  it("renders the legend, VALIDATION.md link, per-status filter counts, and labelled badges", () => {
    render(<RiskDetail asiId="ASI01" />);

    // Legend header + doc link
    expect(screen.getByText(/Mapping validation status/i)).toBeTruthy();
    const docLink = screen.getByRole("link", { name: /Read the validation model/i });
    expect(docLink.getAttribute("href")).toContain("/VALIDATION.md");

    // Filter buttons show per-status counts (ASI01 = 4 nist53 + 4 aiRmf = 8, all editorial)
    expect(screen.getByRole("button", { name: /All \(8\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Editorial \(8\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reviewed \(0\)/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Validated \(0\)/ })).toBeTruthy();

    // NFR-7: each badge carries a TEXT label (aria-label), not color alone.
    // 8 mapping-card badges + 1 legend badge = 9 "Editorial" badges.
    expect(screen.getAllByLabelText(/Validation status: Editorial/).length).toBeGreaterThanOrEqual(9);
  });

  it("filtering by 'Reviewed' hides all editorial mapping cards (legend badge remains)", () => {
    render(<RiskDetail asiId="ASI01" />);

    expect(screen.getAllByLabelText(/Validation status: Editorial/).length).toBeGreaterThanOrEqual(9);

    fireEvent.click(screen.getByRole("button", { name: /Reviewed \(0\)/ }));

    // Only the legend's Editorial badge survives; all 8 mapping cards are hidden.
    expect(screen.getAllByLabelText(/Validation status: Editorial/)).toHaveLength(1);
  });
});
