import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { ChevronDown, Grid3X3, Search, Shield, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ViewType = "overview" | "matrix" | "aiRmf" | "detail" | "simulator";

interface TabDef {
  key: ViewType | "heatmaps";
  label: string;
  icon: ReactNode;
  submenu?: { key: ViewType; label: string }[];
}

const TABS: TabDef[] = [
  { key: "overview", label: "Overview", icon: <Shield className="w-3.5 h-3.5" /> },
  {
    key: "heatmaps",
    label: "Heatmaps",
    icon: <Grid3X3 className="w-3.5 h-3.5" />,
    submenu: [
      { key: "matrix", label: "800-53 Heatmap" },
      { key: "aiRmf", label: "AI-RMF Heatmap" },
    ],
  },
  { key: "detail", label: "Evidence Explorer", icon: <Search className="w-3.5 h-3.5" /> },
  { key: "simulator", label: "Scenario Simulator", icon: <Zap className="w-3.5 h-3.5" /> },
];

export function ViewTabs({
  view,
  onViewChange,
}: {
  view: ViewType;
  onViewChange: (v: ViewType) => void;
}): ReactElement {
  const [heatmapDropdownOpen, setHeatmapDropdownOpen] = useState(false);

  return (
    <div className="container">
      <div className="flex gap-0 border-b border-slate-700/50 -mt-px">
        {TABS.map((tab) => {
          if (tab.submenu) {
            // Heatmaps dropdown
            const isActive = view === "matrix" || view === "aiRmf";
            return (
              <Popover key={tab.key} open={heatmapDropdownOpen} onOpenChange={setHeatmapDropdownOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all duration-150 border-b-2"
                    style={{
                      color: isActive ? "#3B82F6" : "#94A3B8",
                      backgroundColor: isActive ? "rgba(59,130,246,0.06)" : "transparent",
                      borderBottomColor: isActive ? "#3B82F6" : "transparent",
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  {tab.submenu.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        onViewChange(item.key);
                        setHeatmapDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                      style={{
                        backgroundColor: view === item.key ? "rgba(59,130,246,0.2)" : "transparent",
                        color: view === item.key ? "#60a5fa" : "#94A3B8",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            );
          }
          // Regular tabs
          return (
            <button
              key={tab.key}
              onClick={() => onViewChange(tab.key as ViewType)}
              className="flex items-center gap-2 px-5 py-3 text-[13px] font-medium transition-all duration-150 border-b-2"
              style={{
                color: view === tab.key ? "#3B82F6" : "#94A3B8",
                backgroundColor: view === tab.key ? "rgba(59,130,246,0.06)" : "transparent",
                borderBottomColor: view === tab.key ? "#3B82F6" : "transparent",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
