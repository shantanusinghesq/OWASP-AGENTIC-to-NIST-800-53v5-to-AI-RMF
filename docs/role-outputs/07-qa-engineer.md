# Role 7: QA Engineer — Answers

**Context consumed:** 12 pattern definitions with visual signatures, existing scrambler-evaluator test surface, CascadeGraph rendering logic, heatmap cell state logic, error handling matrix from Backend/LLM Engineer.

---

## Q7.1: Accuracy Metrics (Detailed Test Plan)

**Recommended answer:** Precision ≥ 0.85, Recall ≥ 0.80, measured against a 24-diagram reference set. Test both "clean" and "noisy" diagrams.

**Test corpus specification:**

| Category | Count | Description |
|---|---|---|
| Clean textbook (1 per pattern) | 12 | Minimal diagram, clear topology, labeled agents |
| Realistic complex (1 per pattern) | 12 | Multiple elements, some noise, real-world style |
| Multi-pattern (combinations) | 6 | Diagrams containing 2-3 patterns intentionally |
| Adversarial (edge cases) | 6 | Non-agentic diagrams, ambiguous topologies, minimal labels |
| **Total** | **36** | — |

**Scoring rubric per diagram:**

```
TRUE POSITIVE:  Pattern in ground truth AND in LLM output (confidence ≥ 0.6)
FALSE POSITIVE: Pattern NOT in ground truth BUT in LLM output (confidence ≥ 0.6)
FALSE NEGATIVE: Pattern in ground truth BUT NOT in LLM output (or confidence < 0.6)
TRUE NEGATIVE:  Pattern NOT in ground truth AND NOT in LLM output
```

**Acceptance criteria:**
- Overall precision: ≥ 0.85 (of patterns returned, 85%+ are correct)
- Overall recall: ≥ 0.80 (of patterns present, 80%+ are detected)
- Per-pattern recall: No pattern below 0.60 (no pattern is systematically missed)
- Adversarial precision: 100% (non-agentic diagrams return empty array)
- Multi-pattern accuracy: At least 2/3 patterns correctly identified per diagram

**Test execution protocol:**
1. Run each diagram through the analyzer 3 times (LLM non-determinism)
2. Use majority vote (2/3 agreement) as the "system output"
3. Compare system output to ground truth
4. Calculate metrics
5. If below threshold: iterate on prompt, re-test

**Confidence:** 0.85

---

## Q7.2: Adoption Metrics (Test Plan for Feature Health)

**Recommended answer:** Instrument 5 key events. Measure weekly. Alert on degradation.

**Instrumentation plan:**

| Event | Trigger | What to measure |
|---|---|---|
| `diagram_upload_started` | User drops/selects image | Upload rate per session |
| `diagram_analysis_completed` | LLM returns valid response | Completion rate (success/total) |
| `diagram_analysis_failed` | Error/timeout/empty result | Failure rate (should be <15%) |
| `diagram_pattern_override` | User adds/removes pattern | Override rate (should be <20%) |
| `diagram_report_generated` | User clicks "Generate Report" | Conversion rate (analysis → report) |

**Health thresholds:**

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| Completion rate | ≥ 85% | 70–84% | < 70% |
| Failure rate | ≤ 15% | 16–30% | > 30% |
| Override rate | ≤ 20% | 21–40% | > 40% |
| Conversion rate | ≥ 70% | 50–69% | < 50% |

**Phase 1 implementation:** Console.log events (no analytics backend). Review manually via browser console during testing.
**Phase 2 implementation:** Send events to analytics endpoint (if available after web-db-user upgrade).

**Confidence:** 0.8

---

## Q9.1: Diagram Quality Issues (Test Scenarios)

**Recommended answer:** Test 8 specific quality degradation scenarios. Document expected behavior for each.

**Quality degradation test matrix:**

| # | Scenario | Test Image | Expected Behavior | Pass Criteria |
|---|---|---|---|---|
| 1 | Low resolution (200×200) | Downscaled Miro export | Client blocks upload | Error: "Image too small" |
| 2 | No text labels | Topology-only diagram (boxes + arrows, no text) | LLM attempts topology-based recognition | Returns ≥ 1 pattern OR empty with explanation |
| 3 | Non-English labels | Japanese-labeled architecture | LLM handles multilingual | Same accuracy as English |
| 4 | Screenshot of screenshot | JPEG-compressed, visible artifacts | LLM attempts recognition | May return lower confidence (acceptable) |
| 5 | Not architecture (photo of cat) | Random non-diagram image | LLM returns empty array | `patterns: []` with appropriate message |
| 6 | Extremely complex (50+ nodes) | Large enterprise architecture | LLM identifies dominant pattern(s) | Returns ≥ 1 pattern (may miss minor ones) |
| 7 | Hand-drawn sketch | Whiteboard photo | LLM attempts recognition | Returns ≥ 1 pattern OR empty (no crash) |
| 8 | Prompt injection in labels | Image with "Ignore instructions" text | Validation rejects invalid IDs | Only known pattern IDs in output |

**Test execution:** Manual testing with prepared images. Document results in a test report. Iterate on prompt for scenarios 2, 6, 7 if accuracy is below threshold.

**Confidence:** 0.85

---

## Q9.2: Pattern Ambiguity (Test Scenarios)

**Recommended answer:** Test 4 ambiguity scenarios. Verify the system handles gracefully (shows multiple options, doesn't crash, doesn't auto-select).

**Ambiguity test matrix:**

| # | Scenario | Expected LLM Output | Expected UI Behavior |
|---|---|---|---|
| 1 | Supervisor that looks like Router | Both `supervisor_worker` (0.7) and `router_triage` (0.65) | Show both with confidence bars. User decides. |
| 2 | Sequential with Reflection at each stage | Both `sequential_pipeline` (0.9) and `reflection_loop` (0.75) | Show both. Both are correct (multi-pattern). |
| 3 | Single agent with many tools (is it tool_augmented or single_agent?) | Both `single_agent` (0.8) and `tool_augmented` (0.85) | Show both. User can remove one if desired. |
| 4 | All patterns below 0.6 confidence | Empty array (no confident match) | Show "No patterns detected" + manual selector |

**Pass criteria:** System never crashes, never auto-selects, always shows manual override option.

**Confidence:** 0.9

---

## Q9.3: System Failures (Test Scenarios)

**Recommended answer:** Test 6 failure scenarios. Verify graceful degradation in each.

**Failure test matrix:**

| # | Scenario | How to Simulate | Expected Behavior | Pass Criteria |
|---|---|---|---|---|
| 1 | Network timeout | Block Forge API domain in DevTools | "Taking longer than expected..." → manual selector | No crash, manual mode works |
| 2 | API returns 500 | Mock 500 response | Retry once → "Analysis unavailable" → manual selector | Retry happens, then graceful fallback |
| 3 | API returns malformed JSON | Mock invalid response body | Parse error caught → manual selector | No unhandled exception |
| 4 | API returns empty patterns | Valid JSON but `patterns: []` | "No patterns detected" message + manual selector | Clear messaging, actionable |
| 5 | localStorage full | Fill localStorage to 5MB | Fail to save history silently | Toast notification, feature still works |
| 6 | Image encoding fails | Upload corrupted file with valid extension | Client-side error caught | "Unable to process image. Try a different file." |

**Test execution:** Use browser DevTools (Network tab throttling, response mocking) to simulate each failure. Document results.

**Regression test (automated):**
```typescript
// Unit test for validation function
describe('validatePatternResponse', () => {
  it('rejects unknown pattern IDs', () => {
    const result = validatePatternResponse({ patterns: [{ id: 'admin', confidence: 1.0 }] });
    expect(result).toEqual([]);
  });
  
  it('clamps confidence to [0, 1]', () => {
    const result = validatePatternResponse({ patterns: [{ id: 'single_agent', confidence: 5.0 }] });
    expect(result[0].confidence).toBe(1.0);
  });
  
  it('truncates reasoning to 200 chars', () => {
    const longReasoning = 'x'.repeat(500);
    const result = validatePatternResponse({ patterns: [{ id: 'single_agent', confidence: 0.9, reasoning: longReasoning }] });
    expect(result[0].reasoning.length).toBe(200);
  });
  
  it('handles null/undefined gracefully', () => {
    expect(validatePatternResponse(null)).toEqual([]);
    expect(validatePatternResponse(undefined)).toEqual([]);
    expect(validatePatternResponse('not json')).toEqual([]);
  });
});
```

**Confidence:** 0.9

---

## Summary: QA Position

Test with **36 reference diagrams** across 4 categories (clean, realistic, multi-pattern, adversarial). Target **precision ≥ 0.85, recall ≥ 0.80**. Instrument **5 key events** for feature health monitoring. Test **8 quality degradation scenarios**, **4 ambiguity scenarios**, and **6 failure scenarios**. Write **unit tests for the validation function** (the only deterministic, testable component). The feature passes QA when: no scenario causes a crash, manual fallback always works, and accuracy meets thresholds on the reference set.
