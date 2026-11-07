import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  Filter, 
  ExternalLink, 
  Bot, 
  BookOpen, 
  Layers, 
  Eye, 
  Download, 
  Sparkles, 
  Maximize2, 
  X,
  FileQuestion,
  Cpu
} from 'lucide-react';
import { getAllFigures } from '../services/api';

export default function FigureExplorer({ papers, onSelectFigureForChat }) {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState('');
  const [zoomFigure, setZoomFigure] = useState(null);

  useEffect(() => {
    loadFigures();
  }, []);

  const loadFigures = async () => {
    setLoading(true);
    try {
      const data = await getAllFigures();
      setFigures(data);
    } catch (err) {
      console.error("Failed to load figures:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFigures = figures.filter((f) => {
    const matchesPaper = !selectedPaperFilter || f.paper_id === selectedPaperFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      f.paper_title.toLowerCase().includes(q) ||
      f.caption.toLowerCase().includes(q) ||
      f.section.toLowerCase().includes(q);
    return matchesPaper && matchesQuery;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Multimodal Visual Knowledge Base
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Visual & Figure Explorer
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Inspect architectural diagrams, algorithmic flowcharts, ablation plots, and empirical tables extracted directly from your indexed research papers. Click any figure to send it to the Multimodal Agent for rigorous visual reasoning.
          </p>
        </div>

        <button
          onClick={loadFigures}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white border border-academic-750 transition-all self-start md:self-auto shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Refresh Figures ({figures.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search figures by concept, architecture, caption..."
            className="w-full bg-academic-950 border border-academic-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedPaperFilter}
            onChange={(e) => setSelectedPaperFilter(e.target.value)}
            className="w-full md:w-72 bg-academic-950 border border-academic-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Research Papers</option>
            {papers.map((p) => (
              <option key={p.paper_id} value={p.paper_id}>
                {p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-slate-400 whitespace-nowrap hidden sm:inline">
            {filteredFigures.length} Visuals
          </span>
        </div>
      </div>

      {/* Figures Grid */}
      {loading ? (
        <div className="text-center py-20 border border-academic-800 rounded-2xl bg-academic-900/30 space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">Extracting high-resolution visual figures and diagrams...</p>
        </div>
      ) : filteredFigures.length === 0 ? (
        <div className="text-center py-20 border border-academic-800 rounded-2xl bg-academic-900/30 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">No visual figures match your filter criteria</p>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Upload research papers in the Document Library to extract diagrams, formulas, and empirical plots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFigures.map((fig) => (
            <div
              key={fig.figure_id}
              className="glass-panel overflow-hidden border border-academic-800 hover:border-cyan-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Figure Image Header / Thumbnail */}
              <div 
                onClick={() => setZoomFigure(fig)}
                className="relative h-56 bg-academic-950/80 overflow-hidden cursor-pointer border-b border-academic-850 flex items-center justify-center p-3 group"
              >
                <img
                  src={fig.image_url}
                  alt={fig.caption}
                  className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-md"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 rounded-xl bg-academic-900/90 text-white shadow-lg border border-white/10 flex items-center gap-1.5 text-xs font-mono">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Inspect
                  </span>
                </div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-academic-900/90 text-cyan-300 border border-cyan-800/40 backdrop-blur-sm">
                    Page {fig.page}
                  </span>
                </div>
              </div>

              {/* Figure Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1 leading-snug">
                    {fig.paper_title}
                  </h4>
                  <p className="text-[11px] text-cyan-400/90 font-mono line-clamp-1">
                    {fig.section}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {fig.caption}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-academic-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setZoomFigure(fig)}
                    className="p-2 rounded-lg bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Zoom in full resolution"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onSelectFigureForChat(fig)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white shadow-md shadow-primary-600/20 transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Ask Agent About Figure</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen Zoom Modal */}
      {zoomFigure && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-academic-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-academic-800 flex items-center justify-between bg-academic-900/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    Page {zoomFigure.page}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-xs text-slate-300 font-medium truncate max-w-md">
                    {zoomFigure.paper_title}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {zoomFigure.caption}
                </p>
              </div>

              <button
                onClick={() => setZoomFigure(null)}
                className="p-1.5 rounded-lg bg-academic-850 hover:bg-academic-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-academic-950/90">
              <img
                src={zoomFigure.image_url}
                alt={zoomFigure.caption}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-academic-800"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-academic-800 bg-academic-900/60 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                {zoomFigure.filename}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const z = zoomFigure;
                    setZoomFigure(null);
                    onSelectFigureForChat(z);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white transition-all cursor-pointer shadow-md"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Analyze in Multimodal Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
