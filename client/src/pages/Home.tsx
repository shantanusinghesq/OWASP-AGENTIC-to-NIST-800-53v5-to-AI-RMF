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

export default function Home() {
  const [view, setView] = useTabParam();
  const [selectedASI, setSelectedASI] = useState<string | null>(null);
  const { pendingEvidenceFilter, clearPendingFilter } = useScenario();
  const { registerTabSwitcher } = useOnboarding();

  // Register tab switcher for onboarding orchestration
  useEffect(() => {
    registerTabSwitcher((tab: string) => {
      setView(tab as ViewType);
    });
  }, [registerTabSwitcher]);

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

  const openDetail = (asiId: string): void => {
    setSelectedASI(asiId);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Onboarding Overlay ─── */}
      <OnboardingController />
      {/* ─── Hero Header ─── */}
      <HomeHero />
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
              <OverviewRoster onExplore={openDetail} />
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

      {/* ─── Footer ─── */}
      <SiteFooter />
    </div>
  );
}
