/**
 * DiagramAnalyzer — Architecture Diagram Analyzer sidebar
 *
 * Swiss/Bauhaus Design System: Slate + Cobalt Blue
 *
 * Upload an architecture diagram, detect agentic AI patterns (vision LLM when
 * available, manual selection otherwise), tune the governance posture, and
 * generate a ScenarioResult that drives the existing Scenario Simulator UI.
 *
 * Responsive: desktop (≥1024px) fixed right sidebar 420px; tablet (768–1023px)
 * 360px overlay with backdrop; mobile (<768px) bottom sheet at 70vh.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/useMobile";
import {
  AGENTIC_PATTERNS,
  PATTERN_TAXONOMY_VERSION,
  getPatternById,
  type PatternId,
} from "@/lib/agentic-patterns";
import {
  analyzeDiagram,
  generateThumbnail,
  preprocessImage,
  VISION_AVAILABLE,
  type DiagramAnalysisResult,
  type LLMPatternMatch,
} from "@/lib/diagram-analyzer";
import { addToHistory, getHistory, clearHistory, type HistoryEntry } from "@/lib/diagram-history";
import { evaluatePatterns, type PatternEvaluationOutput } from "@/lib/pattern-evaluator";
import type { GovernancePosture } from "@/lib/scrambler-types";

// ─── Types & Constants ──────────────────────────────────────────────────────

interface DiagramAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  onResultReady: (output: PatternEvaluationOutput) => void;
}

type AnalyzerPhase =
  | "idle" // Waiting for upload
  | "processing" // Image preprocessing
  | "analyzing" // LLM call in progress
  | "results" // Matches returned, editable
  | "error"; // Error state with retry/manual option

const PRIVACY_FLAG_KEY = "diagram-analyzer-privacy-acknowledged";

const POSTURES: GovernancePosture[] = ["Minimal", "Standard", "Full"];

function confidenceBarColor(confidence: number): string {
  if (confidence >= 0.7) return "bg-emerald-500";
  if (confidence >= 0.5) return "bg-amber-500";
  return "bg-red-500";
}

function readPrivacyAcknowledged(): boolean {
  try {
    return localStorage.getItem(PRIVACY_FLAG_KEY) === "true";
  } catch {
    return true; // Storage unavailable — don't block the feature on the notice.
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DiagramAnalyzer({ isOpen, onClose, onResultReady }: DiagramAnalyzerProps) {
  const isMobile = useIsMobile();

  const [phase, setPhase] = useState<AnalyzerPhase>("idle");
  const [matches, setMatches] = useState<LLMPatternMatch[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [governancePosture, setGovernancePosture] = useState<GovernancePosture>("Standard");
  const [progressMessage, setProgressMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState<boolean>(readPrivacyAcknowledged);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // The analysis backing the current results; re-saved (deduped by id) when a
  // report is generated so history reflects manual edits.
  const currentResultRef = useRef<DiagramAnalysisResult | null>(null);

  useEffect(() => {
    if (isOpen) setHistory(getHistory());
  }, [isOpen]);

  const clearProgressTimers = useCallback(() => {
    progressTimersRef.current.forEach(clearTimeout);
    progressTimersRef.current = [];
  }, []);

  useEffect(() => clearProgressTimers, [clearProgressTimers]);

  // Escape closes the desktop/tablet panel (the mobile Sheet handles its own).
  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isMobile, onClose]);

  // ─── Analysis Flow ────────────────────────────────────────────────────────

  const handleFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setError("");
      setPhase("processing");
      clearProgressTimers();
      setProgressMessage("Preprocessing image...");
      progressTimersRef.current.push(
        setTimeout(() => setProgressMessage("Identifying architectural patterns..."), 2000),
        setTimeout(() => setProgressMessage("Analyzing risk topology..."), 5000)
      );

      try {
        const request = await preprocessImage(file);
        const thumb = await generateThumbnail(file);
        setThumbnail(thumb);

        setPhase("analyzing");
        const result = await analyzeDiagram(request);
        result.thumbnailDataUrl = thumb;
        currentResultRef.current = result;

        clearProgressTimers();
        setMatches(result.matches);
        setPhase("results");

        if (result.source === "vision") {
          const names = result.matches
            .map((m) => getPatternById(m.patternId)?.name)
            .filter((n): n is string => Boolean(n));
          addToHistory(result, names);
          setHistory(getHistory());
        }
      } catch (e) {
        clearProgressTimers();
        setError(e instanceof Error ? e.message : "Analysis failed.");
        setPhase("error");
      }
    },
    [clearProgressTimers]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  // ─── Match Editing ────────────────────────────────────────────────────────

  const removeMatch = useCallback((patternId: PatternId) => {
    setMatches((prev) => prev.filter((m) => m.patternId !== patternId));
  }, []);

  const addManualPattern = useCallback((patternId: PatternId) => {
    setMatches((prev) => {
      if (prev.some((m) => m.patternId === patternId)) return prev;
      return [...prev, { patternId, confidence: 1.0, reasoning: "Manually selected" }];
    });
    setPhase("results");
  }, []);

  const availablePatterns = useMemo(
    () => AGENTIC_PATTERNS.filter((p) => !matches.some((m) => m.patternId === p.id)),
    [matches]
  );

  // ─── Report Generation ────────────────────────────────────────────────────

  const handleGenerateReport = useCallback(() => {
    if (matches.length === 0) return;
    const output = evaluatePatterns({ matches, governancePosture });

    const names = matches
      .map((m) => getPatternById(m.patternId)?.name)
      .filter((n): n is string => Boolean(n));
    const base = currentResultRef.current;
    addToHistory(
      {
        id: base?.id ?? crypto.randomUUID(),
        timestamp: Date.now(),
        matches,
        taxonomyVersion: PATTERN_TAXONOMY_VERSION,
        source: base?.source ?? "manual",
        thumbnailDataUrl: base?.thumbnailDataUrl ?? thumbnail,
      },
      names
    );
    setHistory(getHistory());

    onResultReady(output);
  }, [matches, governancePosture, onResultReady, thumbnail]);

  // ─── History ──────────────────────────────────────────────────────────────

  const restoreHistoryEntry = useCallback((entry: HistoryEntry) => {
    const validMatches = entry.matches.filter((m) => getPatternById(m.patternId));
    currentResultRef.current = {
      id: entry.id,
      timestamp: entry.timestamp,
      matches: validMatches,
      taxonomyVersion: entry.taxonomyVersion,
      source: entry.source,
      thumbnailDataUrl: entry.thumbnailDataUrl,
    };
    setMatches(validMatches);
    setThumbnail(entry.thumbnailDataUrl);
    setSelectedFile(null);
    setError("");
    setPhase("results");
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const acknowledgePrivacy = useCallback(() => {
    try {
      localStorage.setItem(PRIVACY_FLAG_KEY, "true");
    } catch {
      // Storage unavailable — acknowledge for this session only.
    }
    setPrivacyAcknowledged(true);
  }, []);

  const isBusy = phase === "processing" || phase === "analyzing";
  const uploadBlocked = VISION_AVAILABLE && !privacyAcknowledged;

  // ─── Panel Content ──────────────────────────────────────────────────────────

  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
          <h2 className="text-sm font-bold tracking-wide text-slate-100">Architecture Analyzer</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          aria-label="Close Architecture Analyzer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Privacy notice — first use only, only when images leave the browser */}
        {VISION_AVAILABLE && !privacyAcknowledged && (
          <div className="rounded-md border border-blue-500/40 bg-blue-500/10 p-3">
            <p className="text-xs leading-relaxed text-slate-300">
              Your diagram is sent to an AI service for pattern analysis. The image is not stored.
            </p>
            <button
              onClick={acknowledgePrivacy}
              className="mt-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Got it
            </button>
          </div>
        )}

        {!VISION_AVAILABLE && (
          <div className="flex items-start gap-2 rounded-md border border-slate-700 bg-slate-800/60 p-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <p className="text-[11px] leading-relaxed text-slate-400">
              AI vision analysis is unavailable in this deployment. Your image stays in the
              browser — select the patterns you see in your diagram manually below.
            </p>
          </div>
        )}

        {/* 2. Upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploadBlocked && !isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={uploadBlocked || isBusy ? (e) => e.preventDefault() : handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-4 text-center transition-all duration-300 ease-in-out ${
            isDragging ? "border-blue-400 bg-blue-500/10" : "border-slate-700 bg-slate-800/40"
          } ${uploadBlocked || isBusy ? "opacity-50" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileInput}
            className="hidden"
            aria-label="Upload architecture diagram"
            disabled={uploadBlocked || isBusy}
          />
          {thumbnail ? (
            <div className="flex items-center justify-center gap-3">
              <img
                src={thumbnail}
                alt="Selected diagram thumbnail"
                className="h-16 w-16 rounded border border-slate-700 object-cover"
              />
              <div className="text-left">
                <p className="max-w-[180px] truncate text-xs font-medium text-slate-300">
                  {selectedFile?.name ?? "Restored analysis"}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadBlocked || isBusy}
                  className="mt-1 text-[11px] font-semibold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
                >
                  Choose a different image
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-2 h-6 w-6 text-slate-500" aria-hidden="true" />
              <p className="text-xs text-slate-300">
                Drag &amp; drop an architecture diagram here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadBlocked || isBusy}
                  className="font-semibold text-blue-400 transition-colors hover:text-blue-300 disabled:opacity-50"
                >
                  browse
                </button>
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                PNG, JPG, or WebP · min 400×400 · max 10MB
              </p>
            </>
          )}
        </div>

        {/* 3. Progress indicator */}
        {isBusy && (
          <div
            className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800/60 p-3"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin text-blue-400 motion-reduce:animate-none" aria-hidden="true" />
            <span className="text-xs text-slate-300">{progressMessage}</span>
          </div>
        )}

        {/* 9. Error state */}
        {phase === "error" && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3" role="alert">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-red-300">{error}</p>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={() => selectedFile && void handleFile(selectedFile)}
                disabled={!selectedFile}
                className="rounded bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-600 disabled:opacity-50"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  setError("");
                  setPhase("results");
                }}
                className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
              >
                Select Manually
              </button>
            </div>
          </div>
        )}

        {/* 4. Results list */}
        {phase === "results" && (
          <div>
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Detected Patterns ({matches.length})
            </h3>
            {matches.length === 0 ? (
              <p className="rounded-md border border-slate-700 bg-slate-800/40 p-3 text-xs text-slate-400">
                No patterns detected. Add the patterns you can see in your diagram below.
              </p>
            ) : (
              <ul className="space-y-2">
                {matches.map((match) => {
                  const pattern = getPatternById(match.patternId);
                  if (!pattern) return null;
                  const pct = Math.round(match.confidence * 100);
                  return (
                    <li
                      key={match.patternId}
                      className="rounded-md border border-slate-700 bg-slate-800/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{pattern.name}</span>
                            <Badge
                              variant="outline"
                              className="border-slate-600 px-1.5 py-0 font-mono text-[9px] text-slate-400"
                            >
                              {pattern.id}
                            </Badge>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div
                              className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700"
                              role="meter"
                              aria-valuenow={pct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${pattern.name} confidence ${pct}%`}
                            >
                              <div
                                className={`h-full ${confidenceBarColor(match.confidence)} transition-all duration-300`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">{pct}%</span>
                          </div>
                          {match.reasoning && (
                            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                              {match.reasoning}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeMatch(match.patternId)}
                          className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-200"
                          aria-label={`Remove ${pattern.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* 5. Manual override */}
        {(phase === "results" || phase === "idle") && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Plus className="h-3 w-3" aria-hidden="true" />
              Add Pattern
            </h3>
            <Select value="" onValueChange={(v) => addManualPattern(v as PatternId)}>
              <SelectTrigger
                className="w-full border-slate-700 bg-slate-800/60 text-xs text-slate-200"
                aria-label="Add a pattern manually"
              >
                <SelectValue placeholder="Select a pattern to add..." />
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-900 text-slate-200">
                {availablePatterns.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} — {p.primaryRisk.split("—")[0].trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 6. Governance posture selector */}
        <div>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Governance Posture
          </h3>
          <div className="flex gap-2" role="radiogroup" aria-label="Governance posture">
            {POSTURES.map((posture) => (
              <label
                key={posture}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out ${
                  governancePosture === posture
                    ? "border-blue-500 bg-blue-500/15 text-blue-400"
                    : "border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="governance-posture"
                  value={posture}
                  checked={governancePosture === posture}
                  onChange={() => setGovernancePosture(posture)}
                  className="sr-only"
                />
                {posture}
              </label>
            ))}
          </div>
        </div>

        {/* 8. History section */}
        <div className="border-t border-slate-700 pt-3">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-200"
            aria-expanded={historyOpen}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Recent Analyses ({history.length})
            </span>
            {historyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {historyOpen && (
            <div className="mt-2">
              {history.length === 0 ? (
                <p className="text-[11px] text-slate-500">No previous analyses.</p>
              ) : (
                <>
                  <ul className="grid grid-cols-5 gap-2">
                    {history.map((entry) => (
                      <li key={entry.id}>
                        <button
                          onClick={() => restoreHistoryEntry(entry)}
                          className="group relative block w-full overflow-hidden rounded border border-slate-700 transition-all hover:border-blue-500"
                          title={`${entry.patternNames.join(", ") || "No patterns"} · ${new Date(entry.timestamp).toLocaleString()}${
                            entry.taxonomyVersion !== PATTERN_TAXONOMY_VERSION
                              ? ` · taxonomy v${entry.taxonomyVersion}`
                              : ""
                          }`}
                          aria-label={`Restore analysis from ${new Date(entry.timestamp).toLocaleString()} with ${entry.matchCount} pattern(s)`}
                        >
                          {entry.thumbnailDataUrl ? (
                            <img
                              src={entry.thumbnailDataUrl}
                              alt=""
                              className="aspect-square w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square w-full items-center justify-center bg-slate-800">
                              <Eye className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 rounded-tl bg-slate-900/90 px-1 font-mono text-[9px] text-slate-300">
                            {entry.matchCount}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleClearHistory}
                    className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    Clear history
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 7. Generate Report button */}
      <div className="border-t border-slate-700 px-4 py-3">
        <button
          onClick={handleGenerateReport}
          disabled={matches.length === 0 || isBusy}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all duration-300 ease-in-out hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          Generate Report
        </button>
        {matches.length === 0 && (
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Upload a diagram or add at least one pattern to generate a report.
          </p>
        )}
      </div>
    </div>
  );

  // ─── Responsive Shell ─────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="bottom"
          className="h-[70vh] border-slate-700 bg-slate-900 p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Architecture Analyzer</SheetTitle>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {/* Tablet (768–1023px) backdrop; desktop has none */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Architecture Analyzer"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 w-[360px] border-l border-slate-700 bg-slate-900 shadow-2xl transition-all duration-300 ease-in-out motion-reduce:transition-none lg:w-[420px] ${
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
