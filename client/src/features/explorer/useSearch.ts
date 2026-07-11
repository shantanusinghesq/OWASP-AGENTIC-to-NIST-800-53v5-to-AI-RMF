import { useMemo, useState } from "react";
import { SEARCH_INDEX, type SearchEntry } from "./search-index";

export type SearchFilter = "all" | "nist" | "aiRmf";

export interface SearchState {
  query: string;
  setQuery: (q: string) => void;
  filter: SearchFilter;
  setFilter: (f: SearchFilter) => void;
  results: SearchEntry[];
}

export function useSearch(): SearchState {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return SEARCH_INDEX.filter((item) => {
      if (filter === "nist" && item.type !== "nist") return false;
      if (filter === "aiRmf" && item.type !== "aiRmf") return false;
      return (
        item.controlId.toLowerCase().includes(q) ||
        item.controlText.toLowerCase().includes(q) ||
        item.familyName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.implementation.toLowerCase().includes(q) ||
        item.rationale.toLowerCase().includes(q) ||
        item.evidence.toLowerCase().includes(q) ||
        item.asiName.toLowerCase().includes(q) ||
        item.asiDesc.toLowerCase().includes(q) ||
        item.asiId.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return { query, setQuery, filter, setFilter, results };
}
