// @vitest-environment jsdom
// ─── AssessmentContext: reducer wiring + persistence ────────────────
// Exercises the provider through renderHook: select/deselect, annotate,
// clear, the working-key autosave roundtrip (unmount → remount restores),
// corrupt-storage recovery, and the two-hook provider-tolerance rule.

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import {
  AssessmentProvider,
  assessmentReducer,
  useAssessment,
  useAssessmentMaybe,
} from "./AssessmentContext";
import { WORKING_KEY } from "./storage";
import { DEFAULT_ASSESSMENT_NAME, mappingKey, type MappingRef } from "./types";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AssessmentProvider>{children}</AssessmentProvider>
);

const AC_REF: MappingRef = { asiId: "ASI01", framework: "nist", familyOrFunc: "AC" };
const AC_KEY = mappingKey(AC_REF);

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("AssessmentContext", () => {
  it("toggle selects and deselects a mapping", () => {
    const { result } = renderHook(() => useAssessment(), { wrapper });
    expect(result.current.selectedKeys.size).toBe(0);

    act(() => result.current.toggle(AC_REF));
    expect(result.current.selectedKeys.has(AC_KEY)).toBe(true);
    expect(result.current.assessment.selections).toHaveLength(1);

    act(() => result.current.toggle(AC_REF));
    expect(result.current.selectedKeys.has(AC_KEY)).toBe(false);
    expect(result.current.assessment.selections).toHaveLength(0);
  });

  it("setAsiSelected selects every mapping the crosswalk offers for the ASI", () => {
    const { result } = renderHook(() => useAssessment(), { wrapper });
    act(() => result.current.setAsiSelected("ASI01", true));
    // ASI01 = 4 nist53 + 4 aiRmf mappings (pinned by RiskDetail.validation.test.tsx)
    expect(result.current.assessment.selections).toHaveLength(8);
    act(() => result.current.setAsiSelected("ASI01", false));
    expect(result.current.assessment.selections).toHaveLength(0);
  });

  it("annotate merges patches onto a blank annotation", () => {
    const { result } = renderHook(() => useAssessment(), { wrapper });
    act(() => result.current.toggle(AC_REF));
    act(() => result.current.annotate(AC_KEY, { owner: "SecOps" }));
    act(() => result.current.annotate(AC_KEY, { raciRole: "A" }));

    expect(result.current.assessment.annotations[AC_KEY]).toEqual({
      owner: "SecOps",
      raciRole: "A",
      statusOverride: null,
      note: "",
    });
  });

  it("clear empties selections and annotations but keeps the name", () => {
    const { result } = renderHook(() => useAssessment(), { wrapper });
    act(() => {
      result.current.toggle(AC_REF);
      result.current.rename("Q3 rollout");
    });
    act(() => result.current.clear());

    expect(result.current.assessment.selections).toHaveLength(0);
    expect(result.current.assessment.annotations).toEqual({});
    expect(result.current.assessment.name).toBe("Q3 rollout");
  });

  it("persists the working assessment: unmount → remount restores selections", () => {
    const first = renderHook(() => useAssessment(), { wrapper });
    act(() => {
      first.result.current.toggle(AC_REF);
      first.result.current.rename("Persisted");
    });
    first.unmount();

    const second = renderHook(() => useAssessment(), { wrapper });
    expect(second.result.current.assessment.name).toBe("Persisted");
    expect(second.result.current.selectedKeys.has(AC_KEY)).toBe(true);
  });

  it("recovers from corrupt stored JSON with a blank assessment", () => {
    localStorage.setItem(WORKING_KEY, "{ not valid json");
    const { result } = renderHook(() => useAssessment(), { wrapper });
    expect(result.current.assessment.name).toBe(DEFAULT_ASSESSMENT_NAME);
    expect(result.current.assessment.selections).toHaveLength(0);
  });

  it("provider-tolerance rule: useAssessmentMaybe is null without a provider, useAssessment throws", () => {
    const { result } = renderHook(() => useAssessmentMaybe());
    expect(result.current).toBeNull();

    expect(() => renderHook(() => useAssessment())).toThrow(/AssessmentProvider/);
  });
});

describe("assessmentReducer (pure)", () => {
  it("toggle-off drops the mapping's annotation", () => {
    const base = assessmentReducer(
      {
        id: "r",
        name: "n",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        dataVersion: "0",
        selections: [AC_REF],
        annotations: { [AC_KEY]: { owner: "x", raciRole: null, statusOverride: null, note: "" } },
      },
      { type: "toggle", refr: AC_REF },
    );
    expect(base.selections).toHaveLength(0);
    expect(base.annotations).toEqual({});
  });
});
