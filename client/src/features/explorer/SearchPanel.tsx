import { useRef } from "react";
import type { ReactElement } from "react";
import { ChevronRight, Search } from "lucide-react";
import { useSearch } from "./useSearch";

export function SearchPanel({
  onPickResult,
}: {
  onPickResult: (asiId: string) => void;
}): ReactElement {
  const { query, setQuery, filter, setFilter, results } = useSearch();
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#dc2626' }} />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for specific controls or standards..."
          className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all duration-150"
          style={{
            backgroundColor: '#0f172a',
            border: '2px solid #334155',
            fontFamily: 'var(--font-sans)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <style>{`input::placeholder { color: #dc2626 !important; font-style: italic; font-weight: 500; }`}</style>
        {query && (
          <button
            onClick={() => { setQuery(''); searchInputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mt-2">
        {([['all', 'All Controls'], ['nist', '800-53 Only'], ['aiRmf', 'AI-RMF Only']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 border"
            style={{
              borderColor: filter === key ? '#2563eb' : '#334155',
              backgroundColor: filter === key ? 'rgba(37,99,235,0.15)' : 'transparent',
              color: filter === key ? '#60a5fa' : '#64748b',
            }}
          >
            {label}
          </button>
        ))}
        {results.length > 0 && (
          <span className="ml-auto text-[11px] text-slate-400 self-center">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </span>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <span className="ml-auto text-[11px] text-slate-500 self-center">
            No results — try 'access', 'encryption', or 'governance'
          </span>
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="bg-slate-900 px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold border-b border-slate-700/50">
            Search Results
          </div>
          <div className="divide-y divide-slate-700/30 max-h-72 overflow-y-auto">
            {results.slice(0, 50).map((item, idx) => (
              <button
                key={idx}
                onClick={() => { onPickResult(item.asiId); setQuery(''); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-800/60 transition-colors flex items-start gap-3 group"
              >
                <span
                  className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                  style={{
                    backgroundColor: item.type === 'nist' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                    color: item.type === 'nist' ? '#60a5fa' : '#34d399',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.type === 'nist' ? '800-53' : 'AI-RMF'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-semibold" style={{ color: item.type === 'nist' ? '#60a5fa' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                      {item.controlId}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{item.familyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">{item.controlText}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {item.asiId} — {item.asiName}
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </button>
            ))}
            {results.length > 50 && (
              <div className="px-3 py-2 text-[10px] text-slate-500 text-center">
                Showing 50 of {results.length} results — refine your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
