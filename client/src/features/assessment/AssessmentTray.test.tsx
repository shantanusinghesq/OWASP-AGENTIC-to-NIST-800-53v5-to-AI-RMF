// @vitest-environment jsdom
// ─── AssessmentTray + SelectToggle integration ──────────────────────
// RiskDetail(ASI01) and the tray under one provider: toggling a mapping in
// the detail view surfaces the tray with a live count; removing it from the
// expanded tray unchecks the toggle and hides the tray again (null-when-empty).

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
  it("stays hidden while the assessment is untouched", () => {
    renderTray();
    expect(screen.queryByTestId("assessment-tray")).toBeNull();
    // But the select toggles ARE offered (provider present): 4 nist + 4 aiRmf.
    expect(screen.getAllByRole("checkbox")).toHaveLength(8);
  });

  it("selecting a mapping shows the tray with count 1; removing unchecks and hides it", () => {
    renderTray();

    const acToggle = screen.getByRole("checkbox", {
      name: "Include ASI01 AC in assessment",
    });
    fireEvent.click(acToggle);

    expect(acToggle.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByTestId("assessment-tray")).toBeTruthy();
    expect(screen.getByTestId("assessment-tray-count").textContent).toBe("1");

    // Expand and remove the selection from the tray.
    fireEvent.click(screen.getByRole("button", { name: /Expand/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Remove ASI01 AC from assessment" }),
    );

    expect(acToggle.getAttribute("aria-checked")).toBe("false");
    expect(screen.queryByTestId("assessment-tray")).toBeNull();
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
