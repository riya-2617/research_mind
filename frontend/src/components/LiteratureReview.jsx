import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  Code, 
  BookOpen, 
  Layers, 
  Download,
  Share2,
  Clock,
  Hash,
  GraduationCap,
  SlidersHorizontal,
  CheckSquare,
  Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateLiteratureReview } from '../services/api';

export default function LiteratureReview({ papers, onCitationClick }) {
  const [focusArea, setFocusArea] = useState('Efficient Neural Attention & Parameter Adaptation Paradigms');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'markdown'
  const [copied, setCopied] = useState(false);

  const togglePaper = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(papers.map(p => p.paper_id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const ids = selectedIds.length > 0 ? selectedIds : null;
      const res = await generateLiteratureReview(ids, focusArea);
      setReviewResult(res);
    } catch (err) {
      console.error("Lit review error:", err);
      alert("Failed to generate literature review.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reviewResult) return;
    navigator.clipboard.writeText(reviewResult.review);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const sampleFocusAreas = [
    "Efficient Neural Attention & Parameter Adaptation Paradigms",
    "Hardware-Aware Algorithm Co-Design in Foundation Models",
    "Parameter-Efficient Fine-Tuning (PEFT) vs Full Retraining",
    "Reasoning Models & Reinforcement Learning via Direct Preference Optimization",
    "Algorithmic Strategies for Ultra-Long Context Sequence Modeling"
  ];

  // Calculate metrics
  const wordCount = reviewResult?.review ? reviewResult.review.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Publication-Grade Academic Synthesizer
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Structured Literature Review Generator
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Synthesizes uploaded papers into publication-grade surveys complete with abstract, taxonomy breakdown, comparative synthesis matrix, research trends, and verified page-level citations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleGenerate}
            disabled={loading || papers.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Synthesizing Survey...' : 'Generate Literature Review'}
          </button>
        </div>
      </div>

      {/* Configuration panel */}
      <div className="glass-panel p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Survey Focus Area or Working Title:
          </label>
          <input
            type="text"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder="e.g. Theoretical and Empirical Foundations of Scalable Attention..."
            className="w-full bg-academic-950 border border-academic-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-colors"
          />
        </div>

        {/* Paper inclusion selector */}
        <div className="space-y-2 pt-2 border-t border-academic-850">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Source Papers Included ({selectedIds.length === 0 ? 'All ' + papers.length + ' Papers' : `${selectedIds.length} of ${papers.length} Selected`}):
            </label>
            <div className="flex items-center gap-3 text-xs font-mono">
              <button 
                type="button" 
                onClick={selectAll} 
                className="text-primary-400 hover:text-primary-300 transition-colors cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button 
                type="button" 
                onClick={clearSelection} 
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {papers.map((p) => {
              const isSelected = selectedIds.length === 0 || selectedIds.includes(p.paper_id);
              return (
                <button
                  key={p.paper_id}
                  type="button"
                  onClick={() => togglePaper(p.paper_id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50'
                      : 'bg-academic-950/60 text-slate-400 border-academic-850 hover:border-academic-700'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="truncate max-w-[220px]">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus suggestions */}
        <div className="pt-2 border-t border-academic-850">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Scholarly Themes:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleFocusAreas.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setFocusArea(t)}
                className="text-xs px-3 py-1.5 rounded-lg bg-academic-950/80 hover:bg-academic-850 text-slate-300 hover:text-white border border-academic-800 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated Review Document */}
      {reviewResult && (
        <div className="glass-panel p-6 md:p-10 space-y-6">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-academic-800 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-academic-950 px-3 py-1.5 rounded-lg border border-academic-850">
                <Hash className="w-3.5 h-3.5 text-primary-400" />
                <span>{wordCount.toLocaleString()} Words</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-academic-950 px-3 py-1.5 rounded-lg border border-academic-850">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>~{readTime} min read</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-academic-950 px-3 py-1.5 rounded-lg border border-academic-850">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{reviewResult.citations?.length || 0} Grounded Citations</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-academic-950 p-1 rounded-xl border border-academic-850 mr-2">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    viewMode === 'preview' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Formatted Preview
                </button>
                <button
                  onClick={() => setViewMode('markdown')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                    viewMode === 'markdown' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  Raw Markdown
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white text-xs font-mono border border-academic-750 transition-colors cursor-pointer"
                title="Copy markdown to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white text-xs font-mono border border-academic-750 transition-colors cursor-pointer"
                title="Print or Export to PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </div>
          </div>

          {/* Content display */}
          {viewMode === 'preview' ? (
            <div className="prose-academic max-w-none bg-academic-950/60 p-8 md:p-12 rounded-2xl border border-academic-850 shadow-inner">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reviewResult.review}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              readOnly
              value={reviewResult.review}
              className="w-full h-[650px] bg-academic-950 font-mono text-xs text-slate-300 p-6 rounded-2xl border border-academic-800 focus:outline-none resize-y leading-relaxed"
            />
          )}

          {/* Grounding Citation chips */}
          {reviewResult.citations && reviewResult.citations.length > 0 && (
            <div className="pt-6 border-t border-academic-800 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Source Document Grounding ({reviewResult.citations.length} Verified References):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {reviewResult.citations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onCitationClick({
                      citation: c,
                      paper_title: c.replace(/[\[\]]/g, '').split(',')[0],
                      page: c.includes('Page') ? c.split('Page')[1].replace(/[\[\]]/g, '').trim() : '1',
                      section: 'Survey Citation',
                      excerpt: 'Synthesized reference from literature review corpus.'
                    })}
                    className="citation-chip cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
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
