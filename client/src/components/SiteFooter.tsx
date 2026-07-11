import type { ReactElement } from "react";
import { Link } from "wouter";
import { ExternalLink, FileText, Scale } from "lucide-react";

export function SiteFooter(): ReactElement {
  return (
    <footer className="container pb-8">
      <div className="rounded-lg bg-slate-900/50 border border-slate-700/30 px-5 py-4">
        {/* License badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-700/30">
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] text-slate-300 font-medium">Licensed under</span>
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
            >
              AGPL-3.0
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Terms of Service
            </Link>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com/haremantra/OWASP-AGENTIC-to-NIST-800-53v5-to-AI-RMF"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Source Code
            </a>
          </div>
        </div>
        {/* Sources */}
        <p className="text-[11px] text-slate-400 leading-relaxed text-center">
          Sources: OWASP Top 10 for Agentic Applications v2026 (CC BY-SA 4.0) | NIST SP 800-53 Rev 5 | NIST AI 100-1 (AI RMF 1.0) | NIST AI 600-1 GenAI Profile
        </p>
        <p className="text-[11px] text-slate-400 mt-1 text-center">
          Copyright &copy; {new Date().getFullYear()} haremantra. All rights reserved for the hosted service. Source code available under AGPL-3.0.
        </p>
      </div>
    </footer>
  );
}
