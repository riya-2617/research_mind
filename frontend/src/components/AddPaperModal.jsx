import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Check, 
  FileText, 
  Layers, 
  ExternalLink, 
  Hash, 
  Library, 
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { 
  uploadPapers, 
  getPaperCatalog, 
  addCatalogPaper, 
  addCustomPaper, 
  addArxivPaper 
} from '../services/api';

export default function AddPaperModal({ isOpen, onClose, onPaperAdded, currentPaperCount }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'catalog' | 'custom'
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogId, setLoadingCatalogId] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const fileInputRef = useRef(null);

  // Custom paper form state
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customAbstract, setCustomAbstract] = useState('');
  const [customMethodology, setCustomMethodology] = useState('');
  const [customFindings, setCustomFindings] = useState('');
  const [customLimitations, setCustomLimitations] = useState('');
  const [arxivQuery, setArxivQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCatalog();
    }
  }, [isOpen]);

  const loadCatalog = async () => {
    try {
      const data = await getPaperCatalog();
      setCatalog(data);
    } catch (err) {
      console.error("Failed to load catalog:", err);
    }
  };

  if (!isOpen) return null;

  // Upload handler
  const handleFileUpload = async (files) => {
    const pdfFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) {
      alert("Please upload PDF files only (.pdf)");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      pdfFiles.forEach(file => formData.append('files', file));
      const newPapers = await uploadPapers(formData);
      if (onPaperAdded) onPaperAdded(newPapers);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to process and index PDF. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Catalog Add handler
  const handleAddFromCatalog = async (item) => {
    if (item.is_indexed) return;
    setLoadingCatalogId(item.id);
    try {
      const newPaper = await addCatalogPaper(item.id);
      if (onPaperAdded) onPaperAdded([newPaper]);
      // Update catalog locally
      setCatalog(prev => prev.map(p => p.id === item.id ? { ...p, is_indexed: true } : p));
    } catch (err) {
      console.error("Failed to add catalog paper:", err);
      alert("Failed to add paper from catalog.");
    } finally {
      setLoadingCatalogId(null);
    }
  };

  // Custom Paper Submit
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customTitle.trim() || !customAbstract.trim()) {
      alert("Please fill in at least the Title and Abstract.");
      return;
    }

    setLoading(true);
    try {
      const newPaper = await addCustomPaper({
        title: customTitle,
        author: customAuthor || "Anonymous Researcher",
        abstract: customAbstract,
        methodology: customMethodology,
        findings: customFindings,
        limitations: customLimitations
      });
      if (onPaperAdded) onPaperAdded([newPaper]);
      onClose();
    } catch (err) {
      console.error("Custom paper error:", err);
      alert("Failed to create custom paper.");
    } finally {
      setLoading(false);
    }
  };

  // ArXiv Import Submit
  const handleArxivSubmit = async (e) => {
    e.preventDefault();
    if (!arxivQuery.trim()) return;

    setLoading(true);
    try {
      const newPaper = await addArxivPaper(arxivQuery.trim());
      if (onPaperAdded) onPaperAdded([newPaper]);
      onClose();
    } catch (err) {
      console.error("ArXiv import error:", err);
      alert("Failed to import from ArXiv.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog = catalog.filter(p => 
    p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.authors.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.abstract.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-academic-750">
        
        {/* Header */}
        <div className="p-6 border-b border-academic-800 flex items-start justify-between bg-academic-900/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary-500/10 text-primary-300 border border-primary-500/25 uppercase tracking-wider mb-1.5">
              <Plus className="w-3 h-3" />
              Document Ingestion & Indexing
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-400" />
              Add Research Papers to Workspace
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Indexed papers are automatically chunked with layout awareness and embedded into your local ChromaDB vector store.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-academic-850 hover:bg-academic-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-academic-800 bg-academic-950/60 px-6 pt-3 gap-2">
          {[
            { id: 'upload', label: 'Upload PDF Document', icon: UploadCloud },
            { id: 'catalog', label: 'Curated Benchmark Catalog', icon: Library, badge: `${catalog.filter(p => !p.is_indexed).length} Available` },
            { id: 'custom', label: 'Custom Paper / ArXiv Form', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-t border-x cursor-pointer ${
                  isActive 
                    ? 'bg-academic-900 text-white border-academic-700 -mb-px' 
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-academic-900/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-primary-500/20 text-primary-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">

          {/* TAB 1: UPLOAD LOCAL PDF */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging 
                    ? 'border-primary-400 bg-primary-950/40 scale-[1.01]' 
                    : 'border-academic-800 hover:border-academic-700 bg-academic-950/40 hover:bg-academic-900/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  multiple
                  accept=".pdf"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-academic-900 flex items-center justify-center text-primary-400 border border-academic-800 shadow-md">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-100 block">
                    {loading ? 'Processing & Indexing PDF Document...' : 'Drag and drop research paper PDFs here'}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    or click to browse local files (Supports multi-file batch upload)
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-academic-950 px-3 py-1 rounded-full border border-academic-850 mt-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  Auto-extracts text, sections, abstract, and page coordinates into ChromaDB
                </div>
              </div>

              {loading && (
                <div className="p-4 rounded-xl bg-primary-950/40 border border-primary-800/50 flex items-center gap-3 text-xs text-primary-300">
                  <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  <span>
                    PyMuPDF layout-aware engine is extracting sections and computing 384-dimensional dense embeddings...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CURATED BENCHMARK CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter catalog by title, author, or architectural concept..."
                  className="w-full bg-academic-950 border border-academic-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500"
                />
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  {catalog.filter(p => p.is_indexed).length} / {catalog.length} Indexed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCatalog.map((item) => {
                  const isAdding = loadingCatalogId === item.id;
                  return (
                    <div 
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        item.is_indexed 
                          ? 'bg-academic-950/40 border-academic-850 opacity-80' 
                          : 'bg-academic-900/60 border-academic-800 hover:border-academic-700 hover:bg-academic-900'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-100 leading-snug">
                            {item.title}
                          </h4>
                          {item.is_indexed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> In Library
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-950/60 text-primary-300 border border-primary-800/40 shrink-0">
                              Catalog
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                          {item.authors}
                        </p>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                          {item.abstract}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-academic-850 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.filename}
                        </span>

                        <button
                          onClick={() => handleAddFromCatalog(item)}
                          disabled={item.is_indexed || isAdding}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                            item.is_indexed
                              ? 'bg-academic-950 text-slate-500 cursor-default'
                              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm shadow-primary-600/25'
                          }`}
                        >
                          {isAdding ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Embedding...</span>
                            </>
                          ) : item.is_indexed ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Indexed</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Library</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM PAPER / ARXIV ENTRY */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* ArXiv Fast Ingestion Box */}
              <div className="p-4 rounded-xl bg-academic-950/60 border border-academic-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    Option A: Instant Import by ArXiv ID or URL:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    e.g. 2305.18290 or https://arxiv.org/abs/...
                  </span>
                </div>
                <form onSubmit={handleArxivSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={arxivQuery}
                    onChange={(e) => setArxivQuery(e.target.value)}
                    placeholder="Paste ArXiv ID (e.g., 2302.13971 for LLaMA, 2203.15556 for Chinchilla, 2305.14314 for QLoRA)"
                    className="flex-1 bg-academic-900 border border-academic-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !arxivQuery.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white transition-all cursor-pointer whitespace-nowrap"
                  >
                    {loading ? 'Importing...' : 'Fetch & Index'}
                  </button>
                </form>
              </div>

              {/* Manual Paper Form */}
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-academic-850 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-400" />
                    Option B: Create Paper / Manual Manuscript Entry:
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    Creates publication-formatted PDF & indexes chunks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Paper Title *:
                    </label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Hybrid State Space Models for Long-Context Genomic Sequencing"
                      className="w-full bg-academic-950 border border-academic-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Authors / Organization:
                    </label>
                    <input
                      type="text"
                      value={customAuthor}
                      onChange={(e) => setCustomAuthor(e.target.value)}
                      placeholder="e.g. Alice Chen, Bob Smith (Stanford University)"
                      className="w-full bg-academic-950 border border-academic-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Abstract *:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={customAbstract}
                    onChange={(e) => setCustomAbstract(e.target.value)}
                    placeholder="Provide a comprehensive academic summary of the paper's core motivation, architecture, and empirical outcomes..."
                    className="w-full bg-academic-950 border border-academic-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 font-mono">
                      Methodology & Formulation:
                    </label>
                    <textarea
                      rows={3}
                      value={customMethodology}
                      onChange={(e) => setCustomMethodology(e.target.value)}
                      placeholder="Algorithmic details, loss objectives, layer mechanics..."
                      className="w-full bg-academic-950 border border-academic-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 font-mono">
                      Empirical Findings & Results:
                    </label>
                    <textarea
                      rows={3}
                      value={customFindings}
                      onChange={(e) => setCustomFindings(e.target.value)}
                      placeholder="Quantitative metrics, speedups, accuracy on benchmarks..."
                      className="w-full bg-academic-950 border border-academic-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 font-mono">
                      Disclosed Limitations & Gaps:
                    </label>
                    <textarea
                      rows={3}
                      value={customLimitations}
                      onChange={(e) => setCustomLimitations(e.target.value)}
                      placeholder="Failure cases, compute boundaries, hardware prerequisites..."
                      className="w-full bg-academic-950 border border-academic-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating & Indexing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create & Index Paper</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-academic-800 bg-academic-950 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Currently {currentPaperCount} papers indexed in ChromaDB vector store
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-academic-850 hover:bg-academic-800 text-slate-300 border border-academic-750 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

