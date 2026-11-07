import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Eye, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  X,
  Search,
  MessageSquare,
  BookMarked,
  Filter,
  BarChart3,
  Cpu,
  Plus
} from 'lucide-react';
import { uploadPapers, deletePaper, loadSamplePapers } from '../services/api';

export default function DocumentLibrary({ papers, setPapers, onPaperSelect, selectedPaperId, onOpenAddPaper }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [expandedAbstracts, setExpandedAbstracts] = useState({});
  const [previewPaper, setPreviewPaper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const totalPages = papers.reduce((sum, p) => sum + (p.total_pages || 0), 0);
  const totalChunks = papers.reduce((sum, p) => sum + (p.chunk_count || 0), 0);

  const filteredPapers = papers.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.author && p.author.toLowerCase().includes(q)) ||
      (p.filename && p.filename.toLowerCase().includes(q))
    );
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files) => {
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      alert("Please upload PDF documents only.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      pdfFiles.forEach(file => {
        formData.append('files', file);
      });
      const newPapers = await uploadPapers(formData);
      setPapers(prev => {
        const existingIds = new Set(prev.map(p => p.paper_id));
        const filteredNew = newPapers.filter(p => !existingIds.has(p.paper_id));
        return [...prev, ...filteredNew];
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to process PDF documents. Check backend status.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (paperId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this paper from the vector index?")) return;
    try {
      await deletePaper(paperId);
      setPapers(prev => prev.filter(p => p.paper_id !== paperId));
      if (selectedPaperId === paperId) {
        onPaperSelect(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete paper.");
    }
  };

  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    try {
      const samples = await loadSamplePapers();
      setPapers(samples);
    } catch (err) {
      console.error("Load samples error:", err);
      alert("Failed to load sample papers.");
    } finally {
      setLoadingSamples(false);
    }
  };

  const toggleAbstract = (paperId, e) => {
    e.stopPropagation();
    setExpandedAbstracts(prev => ({
      ...prev,
      [paperId]: !prev[paperId]
    }));
  };

  const getParadigmTag = (title) => {
    const t = title.toLowerCase();
    if (t.includes('attention is all') || t.includes('transformer')) return { label: 'Architecture', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
    if (t.includes('lora') || t.includes('adaptation') || t.includes('qlora')) return { label: 'PEFT Adapter', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (t.includes('flashattention') || t.includes('io-aware')) return { label: 'Hardware IO', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
    if (t.includes('bert') || t.includes('bidirectional')) return { label: 'Pre-Training', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    if (t.includes('retrieval') || t.includes('rag')) return { label: 'RAG Memory', color: 'bg-violet-500/10 text-violet-300 border-violet-500/30' };
    if (t.includes('dpo') || t.includes('preference') || t.includes('constitutional')) return { label: 'Alignment', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
    if (t.includes('deepseek') || t.includes('reasoning') || t.includes('chain-of-thought')) return { label: 'Reasoning RL', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
    if (t.includes('llama') || t.includes('chinchilla') || t.includes('scaling')) return { label: 'Foundation Model', color: 'bg-teal-500/10 text-teal-300 border-teal-500/30' };
    return { label: 'Academic Paper', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' };
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary-400 font-semibold mb-1">
            <BookMarked className="w-3.5 h-3.5" />
            Knowledge Base Management
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Document Library & Vector Ingestion
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Upload academic research papers or add landmark benchmark studies. Each paper is parsed with layout awareness, section-tagged, chunked, and embedded into persistent ChromaDB storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={onOpenAddPaper}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-lg shadow-primary-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Research Paper</span>
          </button>

          <button
            onClick={handleLoadSamples}
            disabled={loadingSamples}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-academic-850 hover:bg-academic-800 text-slate-300 hover:text-white border border-academic-750 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {loadingSamples ? 'Indexing Landmark Papers...' : 'Seed Benchmark Papers'}
          </button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{papers.length}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Indexed Papers</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{totalPages}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Document Pages</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">{totalChunks}</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Vector Chunks</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono text-white">384-d</div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Embedding Vector</div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 relative overflow-hidden ${
          isDragging 
            ? 'border-primary-400 bg-primary-950/40 scale-[1.01]' 
            : 'border-white/[0.1] hover:border-primary-500/60 bg-academic-900/40 hover:bg-academic-900/70 shadow-lg'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".pdf" 
          onChange={handleFileChange}
          className="hidden" 
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-2xl bg-academic-800/80 text-primary-400 border border-white/[0.08] shadow-xl group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-200">
              {uploading ? 'Extracting layout, metadata and building vector embeddings...' : 'Drop research papers here, or browse files'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Supports single or batch PDF ingestion. PyMuPDF automatically extracts sections, abstracts, and page coordinates.
            </p>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenAddPaper) onOpenAddPaper();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary-600/80 hover:bg-primary-600 text-white border border-primary-500/40 shadow-sm transition-all"
              >
                Open Ingestion Hub (Catalog / PDF / ArXiv)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 bg-academic-950/60 px-2.5 py-1 rounded-lg border border-white/[0.05]">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" /> PyMuPDF C++ Engine
            </span>
            <span className="flex items-center gap-1.5 bg-academic-950/60 px-2.5 py-1 rounded-lg border border-white/[0.05]">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" /> 384-d Dense Hashing
            </span>
            <span className="flex items-center gap-1.5 bg-academic-950/60 px-2.5 py-1 rounded-lg border border-white/[0.05]">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-400" /> ChromaDB Disk Storage
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by title, author, filename..."
            className="w-full bg-academic-900/60 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 self-end sm:self-auto">
          Showing <span className="text-white font-bold">{filteredPapers.length}</span> of {papers.length} Papers
        </div>
      </div>

      {/* Papers Grid */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <div className="text-center py-16 border border-white/[0.06] rounded-2xl bg-academic-900/20 space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 text-sm font-semibold">No research papers match your query</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Upload custom PDFs above, or click "Seed 7 Landmark Papers" to populate the research library!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper) => {
              const isSelected = selectedPaperId === paper.paper_id;
              const isAbstractExpanded = expandedAbstracts[paper.paper_id];
              const paradigm = getParadigmTag(paper.title);

              return (
                <div
                  key={paper.paper_id}
                  onClick={() => onPaperSelect(isSelected ? null : paper.paper_id)}
                  className={`glass-panel p-5 cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected 
                      ? 'border-primary-500 shadow-xl shadow-primary-500/10 ring-2 ring-primary-500/50 bg-academic-900/90' 
                      : 'hover:border-white/[0.18] hover:bg-academic-900/80 hover:-translate-y-1'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top badging & Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${paradigm.color}`}>
                        {paradigm.label}
                      </span>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPaper(paper);
                          }}
                          className="p-1.5 rounded-lg bg-academic-800/80 hover:bg-academic-700 text-slate-300 hover:text-white transition-colors"
                          title="View Paper Details & Extracted Pages"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(paper.paper_id, e)}
                          className="p-1.5 rounded-lg bg-academic-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition-colors"
                          title="Remove Paper"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-primary-300 transition-colors">
                      {paper.title}
                    </h4>

                    {/* Authors */}
                    <p className="text-xs text-slate-400 line-clamp-1 italic font-serif">
                      {paper.author || 'Scholarly Authors'}
                    </p>

                    {/* Abstract disclosure */}
                    {paper.abstract && (
                      <div className="text-xs text-slate-400 bg-academic-950/70 p-3 rounded-xl border border-white/[0.05]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                            Abstract
                          </span>
                          <button
                            onClick={(e) => toggleAbstract(paper.paper_id, e)}
                            className="text-primary-400 hover:text-primary-300 text-[11px] flex items-center gap-0.5 font-medium"
                          >
                            {isAbstractExpanded ? (
                              <>Less <ChevronUp className="w-3 h-3" /></>
                            ) : (
                              <>More <ChevronDown className="w-3 h-3" /></>
                            )}
                          </button>
                        </div>
                        <p className={`text-slate-300 leading-relaxed text-[11px] ${isAbstractExpanded ? '' : 'line-clamp-3'}`}>
                          {paper.abstract}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer stats & Chat Shortcut */}
                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                        <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                        {paper.total_pages} {paper.total_pages === 1 ? 'Page' : 'Pages'}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-accent-emerald" />
                        {paper.chunk_count} Chunks
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPaperSelect(paper.paper_id);
                      }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                        isSelected 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-academic-800 text-slate-300 hover:bg-primary-600 hover:text-white'
                      }`}
                      title="Focus assistant on this paper"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {isSelected ? 'Active Scope' : 'Focus'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paper Inspection Modal */}
      {previewPaper && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="p-6 border-b border-white/[0.08] flex items-start justify-between bg-academic-950/40">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-primary-400 uppercase tracking-wider font-bold">
                  Document Inspector
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {previewPaper.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Authors: {previewPaper.author} • {previewPaper.total_pages} Pages • {previewPaper.chunk_count} Chunks
                </p>
              </div>
              <button
                onClick={() => setPreviewPaper(null)}
                className="p-2 rounded-xl bg-academic-800 hover:bg-academic-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Abstract */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-2">
                  Complete Abstract
                </h4>
                <div className="p-4 rounded-xl bg-academic-950/80 border border-white/[0.06] text-xs text-slate-200 leading-relaxed font-serif italic">
                  {previewPaper.abstract || 'No abstract detected.'}
                </div>
              </div>

              {/* Page Previews */}
              {previewPaper.full_text_pages && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-3">
                    Extracted Pages ({previewPaper.full_text_pages.length})
                  </h4>
                  <div className="space-y-4">
                    {previewPaper.full_text_pages.map((p) => (
                      <div key={p.page} className="p-4 rounded-xl bg-academic-950/90 border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono text-primary-400 border-b border-white/[0.06] pb-2 font-semibold">
                          <span>PAGE {p.page}</span>
                          <span className="text-slate-500 font-normal">{p.text.length} characters</span>
                        </div>
                        <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto pr-2">
                          {p.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-white/[0.08] bg-academic-950/80 flex justify-end">
              <button
                onClick={() => setPreviewPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-academic-800 hover:bg-academic-700 text-slate-200 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
