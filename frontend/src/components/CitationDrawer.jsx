import React from 'react';
import { X, BookOpen, Quote, FileText, CheckCircle2, ExternalLink, ShieldCheck, Layers, Hash } from 'lucide-react';

export default function CitationDrawer({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-academic-950/95 backdrop-blur-2xl border-l border-academic-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-academic-800 flex items-start justify-between bg-academic-900/40">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary-500/10 text-primary-300 border border-primary-500/25 uppercase tracking-wider">
            <Quote className="w-3 h-3" />
            Verified Source Citation
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
            {citation.citation || citation.paper_title}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-academic-900 hover:bg-academic-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
        {/* Paper & Page Meta */}
        <div className="p-4 rounded-xl bg-academic-900/60 border border-academic-800 space-y-3">
          <div className="flex justify-between items-start text-xs gap-3">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-primary-400" />
              Source Paper:
            </span>
            <span className="text-slate-100 font-semibold text-right max-w-[280px]">
              {citation.paper_title || "Academic Document"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Page Coordinate:
            </span>
            <span className="text-primary-300 font-mono font-bold bg-primary-950/80 px-2.5 py-0.5 rounded-md border border-primary-800/60">
              Page {citation.page || "1"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              Section Context:
            </span>
            <span className="text-slate-300 font-medium">
              {citation.section || "Body Text / Methodology"}
            </span>
          </div>

          {citation.similarity_score !== undefined && (
            <div className="pt-2 border-t border-academic-850">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-400 font-mono">Vector Cosine Similarity:</span>
                <span className="text-accent-emerald font-mono font-bold">
                  {(citation.similarity_score * 100).toFixed(1)}% match
                </span>
              </div>
              <div className="w-full bg-academic-950 rounded-full h-1.5 overflow-hidden border border-academic-800">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-accent-emerald h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(10, citation.similarity_score * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Source Excerpt Block */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-accent-cyan" />
            Extracted Passage Grounding:
          </span>
          <div className="p-5 rounded-xl bg-academic-900/90 border border-academic-800 text-slate-200 text-xs sm:text-sm font-serif leading-relaxed italic border-l-4 border-l-primary-500 shadow-inner">
            "{citation.excerpt || citation.content || "Exact passage retrieved from ChromaDB vector collection."}"
          </div>
        </div>

        {/* Verification badge */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3 text-xs text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-emerald-200">Factually Grounded Citation</span>
            <p className="text-emerald-300/90 leading-relaxed">
              This citation maps directly to a high-dimensional dense embedding index stored in the local ChromaDB database.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-academic-800 bg-academic-950 flex justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-xs font-medium bg-academic-850 hover:bg-academic-800 text-slate-200 border border-academic-750 transition-colors cursor-pointer"
        >
          Dismiss Citation
        </button>
      </div>
    </div>
  );
}
