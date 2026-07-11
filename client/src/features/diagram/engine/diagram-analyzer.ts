/**
 * @file diagram-analyzer.ts
 * @description LLM integration for the Architecture Diagram Analyzer.
 * Sends a preprocessed diagram image to the Forge API vision endpoint,
 * validates the structured JSON response against the pattern taxonomy, and
 * degrades to manual-selection mode whenever vision is unavailable (missing
 * credentials, 4xx rejection, invalid JSON, or timeout).
 *
 * Phase 3 validation gate (2026-06-12): the Forge API could not be reached
 * from the implementation environment (network egress allowlist), so vision
 * support could not be confirmed or denied. VISION_AVAILABLE is therefore
 * derived from credential presence at runtime: without a key the analyzer
 * runs in manual-selection-only mode; with a key, every vision failure mode
 * in TRD Section 13 still falls back to manual mode.
 */

import {
  AGENTIC_PATTERNS,
  PATTERN_TAXONOMY_VERSION,
  type LLMPatternMatch,
  type PatternId,
} from "./agentic-patterns";

export type { LLMPatternMatch };

// ─── Contracts ──────────────────────────────────────────────────────────────

export interface DiagramAnalysisRequest {
  /** Base64-encoded image (resized to max 1024x1024). */
  imageBase64: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
}

export interface DiagramAnalysisResult {
  id: string;
  timestamp: number;
  matches: LLMPatternMatch[];
  /** PATTERN_TAXONOMY_VERSION at time of analysis. */
  taxonomyVersion: string;
  source: "vision" | "manual";
  /** 100x100 JPEG data URL for history. Set by caller after canvas resize. */
  thumbnailDataUrl: string;
}

// ─── Forge API Integration ──────────────────────────────────────────────────

const FORGE_API_KEY: string | undefined = import.meta.env?.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_API_URL: string =
  import.meta.env?.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const VISION_ENDPOINT = `${FORGE_API_URL}/v1/chat/completions`;

export const VISION_AVAILABLE = Boolean(FORGE_API_KEY);

if (!VISION_AVAILABLE) {
  console.info("[DiagramAnalyzer] Vision API unavailable. Manual selection mode active.");
}

const SYSTEM_PROMPT = `You are an expert in agentic AI architecture patterns. Analyze the provided architecture diagram and identify which of the following 12 patterns are present.

PATTERNS:
${AGENTIC_PATTERNS.map(
  (p) => `- ${p.id}: ${p.name} — ${p.description}. Visual signatures: ${p.visualSignatures.join("; ")}`
).join("\n")}

RESPONSE FORMAT (strict JSON):
{
  "patterns": [
    {
      "patternId": "<one of the 12 pattern IDs above>",
      "confidence": <number between 0.0 and 1.0>,
      "reasoning": "<one sentence explaining why this pattern was detected>"
    }
  ]
}

RULES:
1. Only return patterns you are confident are present (confidence >= 0.3)
2. A diagram may contain multiple patterns (e.g., supervisor_worker + tool_augmented)
3. If the image is not an agentic AI architecture diagram, return {"patterns": []}
4. patternId MUST be one of the 12 exact IDs listed above
5. confidence MUST be a number between 0.0 and 1.0
6. reasoning MUST be a single sentence, max 200 characters`;

async function analyzeWithVision(
  request: DiagramAnalysisRequest,
  timeoutMs: number
): Promise<LLMPatternMatch[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(VISION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FORGE_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${request.mimeType};base64,${request.imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Analyze this architecture diagram. Identify which agentic AI patterns are present. Return ONLY valid JSON.",
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    return validateAndParseResponse(data);
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Response Validation ────────────────────────────────────────────────────

const VALID_PATTERN_IDS = new Set<string>(AGENTIC_PATTERNS.map((p) => p.id));

export function validateAndParseResponse(data: any): LLMPatternMatch[] {
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") return [];

  // Some providers wrap JSON in markdown fences despite response_format.
  const stripped = content.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");

  let parsed: any;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed?.patterns)) return [];

  return parsed.patterns
    .filter(
      (p: any) =>
        typeof p?.patternId === "string" &&
        VALID_PATTERN_IDS.has(p.patternId) &&
        typeof p?.confidence === "number" &&
        Number.isFinite(p.confidence)
    )
    .map((p: any) => ({
      patternId: p.patternId as PatternId,
      confidence: Math.max(0, Math.min(1, p.confidence)),
      reasoning: typeof p.reasoning === "string" ? p.reasoning.slice(0, 200) : "",
    }))
    .sort((a: LLMPatternMatch, b: LLMPatternMatch) => b.confidence - a.confidence);
}

// ─── Error Handling ─────────────────────────────────────────────────────────

export async function analyzeDiagram(
  request: DiagramAnalysisRequest
): Promise<DiagramAnalysisResult> {
  const id = crypto.randomUUID();
  const timestamp = Date.now();

  let matches: LLMPatternMatch[] = [];
  let source: "vision" | "manual" = "manual";

  if (VISION_AVAILABLE) {
    try {
      matches = await analyzeWithVision(request, 15000);
      source = "vision";
    } catch {
      // Retry once with a longer timeout after a 2s backoff.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        matches = await analyzeWithVision(request, 20000);
        source = "vision";
      } catch {
        matches = [];
        source = "manual";
      }
    }
  }

  return {
    id,
    timestamp,
    matches,
    taxonomyVersion: PATTERN_TAXONOMY_VERSION,
    source,
    thumbnailDataUrl: "",
  };
}

// ─── Image Preprocessing ────────────────────────────────────────────────────

export function preprocessImage(file: File): Promise<DiagramAnalysisRequest> {
  return new Promise((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      reject(new Error("Unsupported format. Use PNG, JPG, or WebP."));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("File too large. Maximum 10MB."));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          reject(new Error("Image too small. Minimum 400×400 pixels."));
          return;
        }

        // Resize to max 1024x1024 maintaining aspect ratio.
        const canvas = document.createElement("canvas");
        const scale = Math.min(1024 / img.width, 1024 / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas rendering unavailable in this browser."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL(file.type, 0.9).split(",")[1];
        if (!base64) {
          reject(new Error("Failed to encode image."));
          return;
        }
        resolve({
          imageBase64: base64,
          mimeType: file.type as DiagramAnalysisRequest["mimeType"],
        });
      };
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * 100x100 center-cropped JPEG data URL for the history strip. Resolves to an
 * empty string on failure — history degrades gracefully without a thumbnail.
 */
export function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("");
          return;
        }
        // Center-crop to square.
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 100, 100);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = () => resolve("");
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
