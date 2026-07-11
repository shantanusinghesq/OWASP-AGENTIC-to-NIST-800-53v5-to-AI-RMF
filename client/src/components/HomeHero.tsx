import type { ReactElement } from "react";
import { Shield } from "lucide-react";
import { CROSSWALK_STATS, OWASP_ASI } from "@/data/crosswalk";
import { StatCard } from "@/components/StatCard";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663361461713/Bxv8kAWRJNLYA27hMDxSrg/hero-banner-WgxSTgdd9RwHSwF7ESq4Lf.webp";

// Stats — derived from the mappings by the package (pinned by its test
// suite), replacing inline counts that drifted from the data. Current
// derived truth: 54 distinct controls / 89 mappings; 17 of 19 AI-RMF
// subcategories referenced / 62 mappings.
const totalControls = CROSSWALK_STATS.totalNistControlMappings;
const totalCategories = CROSSWALK_STATS.totalAiRmfCategoryMappings;
const uniqueControls = CROSSWALK_STATS.uniqueNistControls;
const uniqueCategories = CROSSWALK_STATS.uniqueAiRmfCategories;

export function HomeHero(): ReactElement {
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

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatCard label="ASI Risks" value={OWASP_ASI.length} color="#3B82F6" subtitle={`across ${OWASP_ASI.length} threat categories`} />
          <StatCard label="Unique 800-53 Controls" value={uniqueControls} color="#3B82F6" subtitle={`${totalControls} total control mappings across ${OWASP_ASI.length} ASI risks`} />
          <StatCard label="Unique AI-RMF Categories" value={uniqueCategories} color="#10B981" subtitle={`${totalCategories} total category mappings across ${OWASP_ASI.length} ASI risks`} />
          <StatCard label="Critical Risks" value={OWASP_ASI.filter((a) => a.severity === "Critical").length} color="#EF4444" subtitle="ASI01, ASI03, ASI08, ASI10 rated Critical severity" />
        </div>
      </div>
    </header>
  );
}
