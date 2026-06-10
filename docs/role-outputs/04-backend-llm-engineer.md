# Role 4: Backend/LLM Engineer — Answers

**Context consumed:** Forge API integration (VITE_FRONTEND_FORGE_API_KEY, VITE_FRONTEND_FORGE_API_URL env vars), Map.tsx proxy pattern, implementation plan DP-1 (vision LLM provider), agentic patterns research (12 patterns with visual signatures).

---

## Q3.1: Vision Model Choice

**Recommended answer:** Forge API (primary) with structured JSON output. Manual selection as fallback. No secondary LLM provider in Phase 1.

**Rationale:**
- The Forge API is already available via `VITE_FRONTEND_FORGE_API_KEY` and `VITE_FRONTEND_FORGE_API_URL`. The Map.tsx component demonstrates the proxy authentication pattern — requests go through a Manus-managed proxy that handles auth transparently.
- The Forge API abstracts the underlying model (likely Gemini or GPT-4o). We don't need to choose between Gemini and ChatGPT — the proxy handles model routing.
- Adding a secondary provider (custom OpenAI key) requires upgrading to web-db-user and managing secrets. This is Phase 2 complexity.
- Manual selection (checkboxes for all 12 patterns) is the zero-cost, zero-latency fallback that works regardless of API availability.

**Implementation:**
```typescript
// Client-side call (same pattern as Map.tsx proxy)
const response = await fetch(`${import.meta.env.VITE_FRONTEND_FORGE_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_FRONTEND_FORGE_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gemini-2.0-flash',  // or whatever the proxy supports
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: PATTERN_RECOGNITION_PROMPT },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
      ]
    }],
    response_format: { type: 'json_object' }
  })
});
```

**Critical unknown:** Whether the Forge API supports `image_url` content type in multimodal messages. If it does not, the entire vision feature degrades to manual-selection-only until we upgrade to web-db-user with a custom OpenAI/Gemini key.

**Validation step (must execute before Phase 3 of implementation):**
1. Send a test request with a small base64 image to the Forge API
2. If 200 + valid response → proceed with vision
3. If 400/415/unsupported → implement manual-selection-only for Phase 1, add vision in Phase 2 with custom secret

**Confidence:** 0.65 (uncertain about Forge API vision support)

---

## Q3.2: Prompt Engineering

**Recommended answer:** Single system prompt with all 12 pattern definitions, visual signatures, and structured output format. Temperature 0.2 for determinism. Max tokens 1024.

**Prompt architecture:**

```
SYSTEM:
You are an expert in agentic AI architecture patterns. You analyze architecture diagrams to identify which agentic AI design patterns are present.

Given an architecture diagram image, identify which of the following 12 patterns are present. Consider the visual topology, agent labels, connection types, and data flow directions.

PATTERNS:
1. single_agent: One large central node with tool/API connections. No other agents.
2. sequential_pipeline: Linear left-to-right chain. Unidirectional arrows. Validation gates between stages.
3. supervisor_worker: Star/hub-spoke topology. One center node labeled "supervisor" or "orchestrator" connected to multiple worker nodes.
4. swarm_peer: Fully connected mesh. Multiple agents with bidirectional connections. No hierarchy.
5. router_triage: Diamond/decision node with multiple outgoing branches to specialized handlers.
6. parallel_sectioning: Fork at top, multiple parallel lanes, join at bottom. Same input split across workers.
7. reflection_loop: Circular arrow back to same node. Iterative self-review cycle.
8. orchestrator_dynamic: Hub with dashed/dotted connections to unknown/dynamic workers. Worker count not fixed.
9. group_chat: Circular arrangement. Bidirectional arrows. Shared context/memory in center.
10. handoff_chain: Linear with explicit "transfer" or "handoff" markers between agents. Context passed at boundaries.
11. human_in_loop: Agent nodes plus a distinct human/approval gate node. Approval step before action.
12. tool_augmented: Agent connected to external system boxes (APIs, databases, tools). Agent + environment.

RULES:
- Return ONLY patterns you are confident about (confidence ≥ 0.6)
- A diagram may contain multiple patterns (e.g., a supervisor that uses reflection loops)
- If you cannot identify any pattern with confidence ≥ 0.6, return an empty array
- Base your analysis on TOPOLOGY (node arrangement, connection direction) not just labels

OUTPUT FORMAT (strict JSON):
{
  "patterns": [
    {
      "id": "pattern_id",
      "confidence": 0.0-1.0,
      "reasoning": "One sentence explaining what visual evidence supports this match"
    }
  ],
  "diagram_summary": "One sentence describing what the diagram shows overall"
}
```

**Temperature:** 0.2 (low variance for classification tasks)
**Max tokens:** 1024 (structured output is compact)
**Image preprocessing:** Resize to max 1024×1024 before encoding (reduces token cost, maintains topology readability)

**Confidence:** 0.85

---

## Q3.3: Error Handling

**Recommended answer:** Three-tier degradation: retry → timeout → manual fallback. Never show a raw error to the user.

**Error handling matrix:**

| Error Type | Detection | Recovery | User Experience |
|---|---|---|---|
| Network timeout (>15s) | AbortController timeout | Retry once with 20s timeout | "Analysis taking longer than expected... [Retry] [Select manually]" |
| API rate limit (429) | Response status code | Show manual selector immediately | "Service busy. Select patterns manually, or try again in a moment." |
| Invalid response (malformed JSON) | JSON.parse failure | Retry once | "Analysis incomplete. [Retry] [Select manually]" |
| Empty result (no patterns found) | `patterns.length === 0` | Show manual selector | "No patterns detected with high confidence. This may not be an agentic AI diagram, or patterns may be unclear. [Select manually]" |
| API key invalid (401/403) | Response status code | Show manual selector permanently | "Diagram analysis unavailable. Select patterns manually." |
| Image too large (>10MB) | Client-side check before upload | Resize automatically | "Image resized for analysis." (no user action needed) |
| Unsupported format | Client-side check | Block upload | "Please upload PNG, JPG, or WebP." |

**Retry policy:**
- Max 1 retry per analysis
- Exponential backoff: 2s wait before retry
- After retry failure: show manual selector with explanation
- Never retry on 401/403 (permanent failure)

**Timeout budget:**
- Image encoding (client-side): <500ms
- API call: 15s timeout (first attempt), 20s timeout (retry)
- Total maximum wait: 37.5s (encoding + first attempt + backoff + retry)
- Show progress indicator after 2s: "Analyzing your architecture diagram..."
- Show "taking longer than expected" after 10s

**Confidence:** 0.9

---

## Q8.1: Cost Constraints

**Recommended answer:** ~$0.01–0.03 per analysis. No user-facing cost. No rate limiting in Phase 1 (trust the user).

**Cost breakdown (per analysis):**
- Image input tokens: ~1,000 tokens (1024×1024 image ≈ 765 tokens for Gemini, ~1,000 for GPT-4o)
- Text input tokens: ~800 tokens (system prompt + pattern definitions)
- Output tokens: ~200 tokens (JSON response)
- Total: ~2,000 tokens per analysis
- Cost at Gemini Flash pricing: ~$0.01 per analysis
- Cost at GPT-4o pricing: ~$0.03 per analysis
- Forge API pricing: Unknown (proxied), likely absorbed by platform

**Monthly budget estimate:**
- Assume 50 analyses/month (early adoption): $0.50–$1.50/month
- Assume 500 analyses/month (growth): $5–$15/month
- This is negligible and does not require rate limiting in Phase 1

**Phase 2 consideration:** If usage exceeds 1,000 analyses/month, implement per-session rate limiting (5 analyses per session) or require authentication.

**Confidence:** 0.8

---

## Q8.2: Latency Constraints

**Recommended answer:** Target <10s for full analysis (upload + encode + API call + parse). Acceptable maximum: 20s. Show progress states at 2s, 5s, 10s.

**Latency breakdown:**
| Step | Expected | Maximum | Mitigation |
|---|---|---|---|
| Client-side image resize | 200ms | 500ms | Canvas API, max 1024×1024 |
| Base64 encoding | 100ms | 300ms | FileReader API |
| Network upload to API | 500ms | 2,000ms | Compressed base64 |
| LLM inference | 3,000ms | 12,000ms | Gemini Flash (faster than GPT-4o) |
| Response parsing | 50ms | 100ms | JSON.parse |
| **Total** | **~4s** | **~15s** | — |

**Progress states:**
- 0–2s: Spinner with "Uploading diagram..."
- 2–5s: "Analyzing architecture patterns..."
- 5–10s: "Identifying agent topology..." (reassurance)
- 10–15s: "Taking longer than expected. Almost done..."
- 15s+: "Analysis timed out. [Retry] [Select manually]"

**Optimization (Phase 2):**
- Cache results by image hash (SHA-256 of base64). If same image uploaded twice, return cached result instantly.
- Precompute image hash client-side to check cache before API call.

**Confidence:** 0.85

---

## Q9.3: System Failures (Recovery & Resilience)

**Recommended answer:** The feature is non-critical (the app works without it). Failure mode is graceful degradation to manual selection. No data loss possible (nothing is stored server-side in Phase 1).

**Failure scenarios:**
1. **Forge API goes down entirely:** Manual selection works. Show banner: "AI analysis temporarily unavailable."
2. **LLM returns hallucinated pattern IDs:** Validate against known pattern ID enum. Reject unknown IDs silently. Only pass validated IDs to the evaluator.
3. **LLM returns confidence > 1.0 or < 0.0:** Clamp to [0.0, 1.0].
4. **Browser localStorage full:** Gracefully fail to store history. Show toast: "History storage full. Clear old analyses to save new ones."
5. **Image causes browser crash (extremely large):** Client-side size check (max 10MB) prevents this.

**Resilience architecture:**
```
User uploads image
  → Client validates (size, format)
  → Client resizes (max 1024×1024)
  → Client encodes (base64)
  → Client calls Forge API
  → [SUCCESS] Parse response → validate pattern IDs → show results
  → [FAILURE] Show manual selector → user picks patterns → same downstream flow
```

The manual selector produces the EXACT same output as the LLM path (`{ patterns: [{ id, confidence: 1.0, reasoning: "Manually selected" }] }`). The downstream evaluator doesn't know or care whether patterns came from LLM or manual selection.

**Confidence:** 0.95

---

## Summary: Backend/LLM Position

Use **Forge API** (single call, structured JSON output, temperature 0.2). **Manual selection** is the universal fallback. Cost is **negligible** (~$0.01/analysis). Latency target is **<10s** with progress states. Error handling follows **three-tier degradation** (retry → timeout → manual). The feature is **non-critical** — the app works without it. **Validate Forge API vision support** before implementing Phase 3.
