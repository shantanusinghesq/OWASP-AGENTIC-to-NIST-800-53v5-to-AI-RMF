import type { ReactElement } from "react";
import { AlertTriangle, ArrowRight, Radar, Search, Shield } from "lucide-react";
import { CROSSWALK, CROSSWALK_STATS, OWASP_ASI } from "@/data/crosswalk";
import { StatCard } from "@/components/StatCard";
import { TrustBar } from "@/components/TrustBar";
import type { ViewType } from "@/components/ViewTabs";

// Self-hosted (client/public/) so first paint doesn't depend on a third-party
// CDN; BASE_URL keeps the path correct under the GitHub Pages subpath.
const HERO_IMAGE = `${import.meta.env.BASE_URL}hero-banner.webp`;

// Featured incident — the worked-example front door. A real, cited breach
// (EchoLeak/ASI01) that maps to concrete controls; the CTA jumps straight
// into its full crosswalk so the "aha" is one click, not three.
const SPOTLIGHT_ASI = "ASI01";
const SPOTLIGHT = CROSSWALK[SPOTLIGHT_ASI]?.evidence?.[0];
const SPOTLIGHT_META = OWASP_ASI.find((a) => a.id === SPOTLIGHT_ASI);

// Stats — derived from the mappings by the package (pinned by its test
// suite), replacing inline counts that drifted from the data. Current
// derived truth: 54 distinct controls / 89 mappings; 17 of 19 AI-RMF
// subcategories referenced / 62 mappings.
const totalControls = CROSSWALK_STATS.totalNistControlMappings;
const totalCategories = CROSSWALK_STATS.totalAiRmfCategoryMappings;
const uniqueControls = CROSSWALK_STATS.uniqueNistControls;
const uniqueCategories = CROSSWALK_STATS.uniqueAiRmfCategories;
const criticalCount = OWASP_ASI.filter((a) => a.severity === "Critical").length;

export function HomeHero({
  onOpenView,
  onShowCritical,
  onOpenRisk,
}: {
  onOpenView: (v: ViewType) => void;
  onShowCritical: () => void;
  onOpenRisk: (asiId: string) => void;
}): ReactElement {
  return (
    <header
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
      <div className="relative container py-8 md:py-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[3px] text-blue-400/80 font-medium">
              Compliance Middleware
            </div>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
          Agentic AI Risks
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Bridging ASI 2026 → NIST 800-53 Rev 5 → NIST AI-RMF 100-1. Interactive compliance mapping
          for agentic AI security risks across {OWASP_ASI.length} threat categories.{" "}
          Severity ratings (Critical, High, Medium-High) are editorially assigned based on OWASP ordinal risk ranking and are not official OWASP severity classifications.
        </p>

        {/* Primary actions — give the hero a spine */}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onShowCritical}
            className="px-4 py-2.5 rounded-md text-sm font-semibold bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30 transition inline-flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            See the {criticalCount} Critical risks →
          </button>
          <button
            onClick={() => onOpenView("detail")}
            className="px-4 py-2.5 rounded-md text-sm font-medium bg-slate-100/10 text-slate-100 border border-slate-400/30 hover:bg-slate-100/15 transition inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explore the evidence
          </button>
        </div>

        {/* Featured incident — a real breach, mapped to controls in one click */}
        {SPOTLIGHT && SPOTLIGHT_META && (
          <button
            onClick={() => onOpenRisk(SPOTLIGHT_ASI)}
            data-onboarding="featured-incident"
            className="group mt-5 w-full text-left rounded-lg border border-red-500/30 bg-red-950/30 hover:bg-red-950/50 transition p-3 flex items-start gap-3"
            aria-label={`See how ${SPOTLIGHT_META.name} maps to controls`}
          >
            <Radar className="w-4 h-4 text-red-300 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-red-300/80 font-semibold mb-0.5">
                Featured incident · {SPOTLIGHT_ASI} {SPOTLIGHT_META.name}
                {SPOTLIGHT.cveId ? ` · ${SPOTLIGHT.cveId}` : ""}
              </div>
              <div className="text-sm text-slate-100 leading-snug">{SPOTLIGHT.title}</div>
              <div className="mt-1 text-[12px] text-red-200 font-medium inline-flex items-center gap-1">
                See how it maps to NIST controls
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </button>
        )}

        {/* Stats row — each card is a doorway into the matching view */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatCard label="ASI Risks" value={OWASP_ASI.length} color="#3B82F6" subtitle={`across ${OWASP_ASI.length} threat categories`} onClick={() => onOpenView("overview")} />
          <StatCard label="Unique 800-53 Controls" value={uniqueControls} color="#3B82F6" subtitle={`${totalControls} total control mappings across ${OWASP_ASI.length} ASI risks`} onClick={() => onOpenView("matrix")} />
          <StatCard label="Unique AI-RMF Categories" value={uniqueCategories} color="#10B981" subtitle={`${totalCategories} total category mappings across ${OWASP_ASI.length} ASI risks`} onClick={() => onOpenView("aiRmf")} />
          <StatCard label="Critical Risks" value={criticalCount} color="#EF4444" subtitle="ASI01, ASI03, ASI08, ASI10 rated Critical severity" onClick={onShowCritical} />
        </div>

        {/* Aggregate validation posture */}
        <TrustBar />
      </div>
    </header>
  );
}
