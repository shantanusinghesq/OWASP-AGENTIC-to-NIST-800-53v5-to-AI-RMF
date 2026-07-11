/*
 * Design: "Command Center" — Military-Grade Intelligence Dashboard
 * Dark tactical interface with information density, strategic color coding
 * Blue (#3B82F6) for NIST 800-53, Emerald (#10B981) for AI-RMF
 * Crimson (#EF4444) for critical severity
 * JetBrains Mono for identifiers, Inter for body text
 *
 * Home is a thin composition root: it owns exactly two pieces of state
 * (view via useTabParam, selectedASI) plus the two effects that write
 * them (onboarding tab switcher, simulator→explorer deep link). All data
 * derivations and view JSX live in features/.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OWASP_ASI } from "@/data/crosswalk";
import { useScenario } from "@/features/simulator/ScenarioContext";
import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { useTabParam } from "@/hooks/useTabParam";
import OnboardingController from "@/features/onboarding/OnboardingController";
import { HomeHero } from "@/components/HomeHero";
import { ViewTabs, type ViewType } from "@/components/ViewTabs";
import { SiteFooter } from "@/components/SiteFooter";
import OverviewRoster from "@/features/overview/OverviewRoster";
import { NistHeatmapView } from "@/features/heatmap/NistHeatmapView";
import { AiRmfHeatmapView } from "@/features/heatmap/AiRmfHeatmapView";
import { ExplorerView } from "@/features/explorer/ExplorerView";
import ScenarioSimulator from "@/features/simulator/ScenarioSimulator";
import { AssessmentTray } from "@/features/assessment/AssessmentTray";

type SeverityFilter = "all" | "Critical" | "High" | "Medium-High";
const VALID_ASI = new Set(OWASP_ASI.map((a) => a.id));
const readRiskParam = (): string | null => {
  const r = new URLSearchParams(window.location.search).get("risk");
  return r && VALID_ASI.has(r) ? r : null;
};

export default function Home() {
  const [view, setView] = useTabParam();
  const [selectedASI, setSelectedASI] = useState<string | null>(() => readRiskParam());
  const [overviewSeverity, setOverviewSeverity] = useState<SeverityFilter>("all");
  const { pendingEvidenceFilter, clearPendingFilter } = useScenario();
  const { registerTabSwitcher } = useOnboarding();

  // Register tab switcher for onboarding orchestration
  useEffect(() => {
    registerTabSwitcher((tab: string) => {
      setView(tab as ViewType);
    });
  }, [registerTabSwitcher]);

  // A bare ?risk=ASI0X link lands directly on the Evidence Explorer.
  useEffect(() => {
    if (readRiskParam()) setView("detail");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep ?risk= in sync with the selected ASI (only meaningful in the detail view).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (view === "detail" && selectedASI) params.set("risk", selectedASI);
    else params.delete("risk");
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  }, [selectedASI, view]);

  // Follow back/forward for the ?risk= param.
  useEffect(() => {
    const onPop = () => setSelectedASI(readRiskParam());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Deep-link: when simulator requests navigation to Evidence Explorer
  useEffect(() => {
    if (pendingEvidenceFilter) {
      setView("detail");
      setSelectedASI(pendingEvidenceFilter.asiId);
      clearPendingFilter();
    }
  }, [pendingEvidenceFilter, clearPendingFilter]);

  const handleViewChange = (v: ViewType): void => {
    setView(v);
    setSelectedASI(null);
  };

  const showCritical = (): void => {
    setOverviewSeverity("Critical");
    setSelectedASI(null);
    setView("overview");
  };

  const openDetail = (asiId: string): void => {
    setSelectedASI(asiId);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Onboarding Overlay ─── */}
      <OnboardingController />
      {/* ─── Hero Header ─── */}
      <HomeHero onOpenView={handleViewChange} onShowCritical={showCritical} onOpenRisk={openDetail} />
      {/* ─── Navigation Tabs ─── */}
      <ViewTabs view={view} onViewChange={handleViewChange} />

      {/* ─── Content Area ─── */}
      <main className="container py-6">
        <AnimatePresence mode="wait">
          {/* ─── Overview View ─── */}
          {view === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <OverviewRoster
                onExplore={openDetail}
                severityFilter={overviewSeverity}
                onSeverityChange={setOverviewSeverity}
              />
            </motion.div>
          )}

          {/* ─── 800-53 Heatmap View ─── */}
          {view === "matrix" && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <NistHeatmapView onSelectRisk={openDetail} />
            </motion.div>
          )}

          {/* ─── AI-RMF Heatmap View ─── */}
          {view === "aiRmf" && (
            <motion.div
              key="aiRmf"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <AiRmfHeatmapView onSelectRisk={openDetail} />
            </motion.div>
          )}

          {/* ─── Evidence Explorer View ─── */}
          {view === "detail" && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ExplorerView selectedASI={selectedASI} onSelectASI={setSelectedASI} />
            </motion.div>
          )}

          {/* ─── Scenario Simulator View ─── */}
          {view === "simulator" && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ScenarioSimulator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Assessment Tray (null until the user selects a mapping) ─── */}
      <AssessmentTray onNavigate={openDetail} />

      {/* ─── Footer ─── */}
      <SiteFooter />
    </div>
  );
}
