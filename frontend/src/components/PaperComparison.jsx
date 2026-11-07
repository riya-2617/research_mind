import React, { useState } from 'react';
import { 
  GitCompare, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  BookOpen, 
  Table, 
  FileText,
  AlertCircle,
  Zap,
  Download,
  Filter
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { comparePapers } from '../services/api';

export default function PaperComparison({ papers, onCitationClick }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const togglePaper = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === papers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(papers.map(p => p.paper_id));
    }
  };

  const applyPreset = (titleKeywords) => {
    const matched = papers.filter(p => 
      titleKeywords.some(kw => p.title.toLowerCase().includes(kw.toLowerCase()))
    ).map(p => p.paper_id);
    setSelectedIds(matched);
  };

  const handleCompare = async () => {
    const idsToCompare = selectedIds.length > 0 ? selectedIds : papers.slice(0, 3).map(p => p.paper_id);
    if (idsToCompare.length < 2) {
      alert("Please select at least 2 papers to compare.");
      return;
    }

    setLoading(true);
    try {
      const res = await comparePapers(idsToCompare);
      setComparisonResult(res);
    } catch (err) {
      console.error("Comparison error:", err);
      alert("Failed to run paper comparison tool.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!comparisonResult) return;
    navigator.clipboard.writeText(comparisonResult.synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: 'Architecture vs Hardware IO', kw: ['Attention Is All', 'FlashAttention'] },
    { label: 'Adapter Efficiency vs Alignment', kw: ['LoRA', 'Direct Preference'] },
    { label: 'Bidirectional vs Vector RAG', kw: ['BERT', 'Retrieval-Augmented'] },
    { label: 'Reasoning RL vs Attention', kw: ['DeepSeek', 'Attention Is All'] }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent-emerald font-semibold mb-1">
            <GitCompare className="w-3.5 h-3.5" />
            Cross-Document Evaluation
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Paper Comparison Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Compare research papers across core academic dimensions: Research Objectives, Methodological Architectures, Empirical Benchmarks, and Limitations.
          </p>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || papers.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-accent-cyan hover:opacity-90 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/25 transition-all self-start md:self-auto shrink-0 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          {loading ? 'Synthesizing Matrix...' : `Compare ${selectedIds.length || (papers.length > 0 ? Math.min(papers.length, 3) : 0)} Papers`}
        </button>
      </div>

      {/* Quick Comparison Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Comparative Analysis Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset.kw)}
              className="px-3 py-1.5 rounded-xl bg-academic-900/60 hover:bg-academic-800 border border-white/[0.08] hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all font-medium flex items-center gap-1.5 shadow-sm"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Paper selection checklist */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Select Research Papers to Compare ({selectedIds.length} of {papers.length} selected):
          </span>
          <button
            onClick={handleSelectAll}
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors"
          >
            {selectedIds.length === papers.length ? 'Deselect All' : 'Select All Papers'}
          </button>
        </div>

        {papers.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No papers available. Please upload papers in the Document Library or click "Seed Landmark Papers".
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {papers.map((p) => {
              const isChecked = selectedIds.includes(p.paper_id);
              return (
                <div
                  key={p.paper_id}
                  onClick={() => togglePaper(p.paper_id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-academic-950/70 border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 rounded bg-academic-900 border-academic-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-200 truncate leading-snug">
                      {p.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 italic truncate mt-0.5 font-serif">
                      {p.author}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      {p.total_pages} pages • {p.chunk_count} chunks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="glass-panel p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Table className="w-5 h-5 text-accent-cyan" />
                Cross-Paper Methodological Matrix & Synthesis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzed {comparisonResult.papers?.length || 0} papers using executable LangChain tool calling.
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-academic-800 hover:bg-academic-700 text-slate-300 hover:text-white text-xs font-mono transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Markdown'}
            </button>
          </div>

          {/* Markdown Content */}
          <div className="prose-academic max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comparisonResult.synthesis}
            </ReactMarkdown>
          </div>

          {/* Grounding Citations */}
          {comparisonResult.citations && comparisonResult.citations.length > 0 && (
            <div className="pt-4 border-t border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Grounding Evidence Sources ({comparisonResult.citations.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {comparisonResult.citations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onCitationClick({
                      citation: c,
                      paper_title: c.replace(/[\[\]]/g, '').split(',')[0],
                      page: c.includes('Page') ? c.split('Page')[1].replace(/[\[\]]/g, '').trim() : '1',
                      section: 'Comparative Evidence',
                      excerpt: 'Verified across comparative paper dimensions.'
                    })}
                    className="citation-chip"
                  >
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span>{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
