import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  Lightbulb, 
  Layers, 
  BookOpen, 
  AlertTriangle,
  ArrowRight,
  Compass,
  FileQuestion,
  TrendingUp,
  Cpu,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeGaps } from '../services/api';

export default function ResearchGaps({ papers, onCitationClick }) {
  const [topic, setTopic] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [loading, setLoading] = useState(false);
  const [gapResult, setGapResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (searchTopic = null) => {
    const finalTopic = searchTopic !== null ? searchTopic : topic;
    setLoading(true);
    try {
      const paperIds = selectedPaperId ? [selectedPaperId] : null;
      const res = await analyzeGaps(paperIds, finalTopic);
      setGapResult(res);
    } catch (err) {
      console.error("Gaps error:", err);
      alert("Failed to analyze research gaps.");
    } finally {
      setLoading(false);
    }
  };

  const sampleTopics = [
    { label: "Attention Bottlenecks", query: "Long-context extrapolation & quadratic attention bottlenecks" },
    { label: "PEFT & Low-Resource", query: "Parameter-efficient adaptation on non-English low-resource languages" },
    { label: "Hardware & SRAM Scaling", query: "Hardware-level SRAM scaling and multi-GPU distributed attention IO" },
    { label: "Extreme Quantization", query: "Robustness under extreme low-precision quantization (INT4 / FP4)" },
    { label: "Reinforcement Alignment", query: "Direct Preference Optimization failure modes and reward hacking in reasoning models" }
  ];

  const handleCopy = () => {
    if (!gapResult) return;
    navigator.clipboard.writeText(gapResult.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
            <Compass className="w-3.5 h-3.5" />
            Empirical Frontier Discovery
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-amber-400" />
            Research Gap Identification Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Systematically mines limitation disclosures, negative empirical findings, and computational bottlenecks across your paper library to construct grounded thesis topics and open research questions.
          </p>
        </div>

        <button
          onClick={() => handleAnalyze()}
          disabled={loading || papers.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 text-white shadow-lg shadow-amber-600/20 transition-all self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? 'Mining Research Gaps...' : 'Identify Research Gaps'}
        </button>
      </div>

      {/* Control panel */}
      <div className="glass-panel p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-primary-400" />
              Research Topic or Technical Focus:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Memory complexity, low-precision quantization, multi-modal transfer, alignment..."
              className="w-full bg-academic-950 border border-academic-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Scope / Document:
            </label>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="w-full bg-academic-950 border border-academic-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/80 transition-colors"
            >
              <option value="">Cross-Paper Synthesis (All Uploaded)</option>
              {papers.map((p) => (
                <option key={p.paper_id} value={p.paper_id}>
                  {p.title.length > 38 ? p.title.slice(0, 38) + "..." : p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Suggested topics */}
        <div className="pt-2 border-t border-academic-850">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Preset Exploration Vectors:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => { setTopic(item.query); handleAnalyze(item.query); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-academic-950/80 hover:bg-academic-850 text-slate-300 hover:text-white border border-academic-800 hover:border-amber-500/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {gapResult && (
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-academic-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1.5">
                <Check className="w-3 h-3" />
                Grounded in Indexed Corpus
              </div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Discovered Research Gaps & Formulated Questions
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Target Scope: <span className="text-slate-200 font-mono">{gapResult.topic || "General Architectural & Empirical Constraints"}</span>
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white text-xs font-mono border border-academic-750 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Report'}
            </button>
          </div>

          {/* Markdown Content */}
          <div className="prose-academic max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {gapResult.analysis}
            </ReactMarkdown>
          </div>

          {/* Grounding Citations */}
          {gapResult.citations && gapResult.citations.length > 0 && (
            <div className="pt-6 border-t border-academic-800 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Source Document Grounding ({gapResult.citations.length} Verified References):
              </span>
              <div className="flex flex-wrap gap-2.5">
                {gapResult.citations.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onCitationClick({
                      citation: c,
                      paper_title: c.replace(/[\[\]]/g, '').split(',')[0],
                      page: c.includes('Page') ? c.split('Page')[1].replace(/[\[\]]/g, '').trim() : '1',
                      section: 'Limitation Section',
                      excerpt: 'Disclosed boundary or unaddressed constraint cited in paper.'
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
