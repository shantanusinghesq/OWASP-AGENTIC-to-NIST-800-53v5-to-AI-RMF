// @vitest-environment jsdom
// ─── AssessmentTray + SelectToggle integration ──────────────────────
// RiskDetail(ASI01) and the tray under one provider: the tray is always
// present, showing a zero-state invitation when untouched; toggling a
// mapping in the detail view surfaces a live count; removing it from the
// expanded tray unchecks the toggle and returns the tray to its zero-state.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RiskDetail } from "@/features/explorer/RiskDetail";
import { AssessmentProvider } from "./AssessmentContext";
import { AssessmentTray } from "./AssessmentTray";

const renderTray = (): void => {
  render(
    <AssessmentProvider>
      <RiskDetail asiId="ASI01" />
      <AssessmentTray onNavigate={() => {}} />
    </AssessmentProvider>,
  );
};

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("AssessmentTray", () => {
  it("shows a zero-state invitation while the assessment is untouched", () => {
    renderTray();
    expect(screen.getByTestId("assessment-tray")).toBeTruthy();
    expect(screen.getByTestId("assessment-tray-count").textContent).toBe("0");
    expect(screen.getByTestId("assessment-tray-zero-state")).toBeTruthy();
    // But the select toggles ARE offered (provider present): 4 nist + 4 aiRmf.
    expect(screen.getAllByRole("checkbox")).toHaveLength(8);
  });

  it("selecting a mapping shows the tray with count 1; removing returns it to the zero-state", () => {
    renderTray();

    const acToggle = screen.getByRole("checkbox", {
      name: "Include ASI01 AC in assessment",
    });
    fireEvent.click(acToggle);

    expect(acToggle.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByTestId("assessment-tray")).toBeTruthy();
    expect(screen.getByTestId("assessment-tray-count").textContent).toBe("1");
    expect(screen.queryByTestId("assessment-tray-zero-state")).toBeNull();

    // Expand and remove the selection from the tray.
    fireEvent.click(screen.getByRole("button", { name: /Expand/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove ASI01 AC from assessment" }),
    );

    expect(acToggle.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByTestId("assessment-tray")).toBeTruthy();
    expect(screen.getByTestId("assessment-tray-count").textContent).toBe("0");
    expect(screen.getByTestId("assessment-tray-zero-state")).toBeTruthy();
  });

  it("annotating from the expanded tray records an owner", () => {
    renderTray();
    fireEvent.click(screen.getByRole("checkbox", { name: "Include ASI01 AC in assessment" }));
    fireEvent.click(screen.getByRole("button", { name: /Expand/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Edit annotation for ASI01 AC" }),
    );

    const owner = screen.getByLabelText("Owner for ASI01|nist|AC");
    fireEvent.change(owner, { target: { value: "SecOps" } });
    expect((owner as HTMLInputElement).value).toBe("SecOps");
  });
});
