import { useEffect, useState } from "react";
import type { ViewType } from "@/components/ViewTabs";

/**
 * Syncs the active view with the ?tab= URL query parameter:
 * initializes from the query, mirrors changes via replaceState, and
 * follows back/forward navigation via popstate. The ?tab= values are
 * live deep-link URLs — never rename them.
 */
export function useTabParam(): [ViewType, (v: ViewType) => void] {
  const [view, setView] = useState<ViewType>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return (tab as ViewType) || "overview";
  });

  // Persist view to URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", view);
    window.history.replaceState({}, "", `?${params.toString()}`);
  }, [view]);

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setView(tab as ViewType);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return [view, setView];
}
