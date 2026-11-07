import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  RefreshCw, 
  Workflow, 
  Search, 
  Quote, 
  Copy, 
  Check, 
  X, 
  Compass, 
  ArrowRight,
  Image as ImageIcon,
  Paperclip,
  Eye,
  Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAgent } from '../services/api';

export default function AgentChat({ 
  papers, 
  selectedPaperId, 
  setSelectedPaperId, 
  onCitationClick,
  preloadedVisual,
  onClearPreloadedVisual
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am **RESEARCHMIND**, your Multimodal Agentic AI Research Assistant. I examine your uploaded academic literature using **LangGraph**, **ChromaDB vector retrieval**, and strict **page-level source citations**.\n\n### What I can help you with:\n- **Multimodal Visual Inspection**: Upload or paste screenshots of architecture diagrams, flowcharts, benchmark plots, and equations for deep technical dissection.\n- **Deep Technical Q&A**: Mathematical formulations, architectural dynamics, algorithmic proofs.\n- **Cross-Paper Comparisons**: Contrast objectives, methodologies, and benchmarks across papers.\n- **Research Gap Mining**: Identify unaddressed limitations, compute bottlenecks, and novel thesis questions.\n- **Literature Review Synthesis**: Generate structured, publication-grade academic surveys.\n\n*Select a prompt below, ask a question, or attach a paper figure!*",
      intent: 'welcome',
      citations: [],
      verified_citations: [],
      tool_calls: [],
      execution_trace: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState('All');
  const [attachedImage, setAttachedImage] = useState(null); // { dataUrl, name, mimeType }
  const [previewImageModal, setPreviewImageModal] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Check if a figure was passed from FigureExplorer
  useEffect(() => {
    if (preloadedVisual) {
      setAttachedImage({
        dataUrl: preloadedVisual.image_url,
        name: preloadedVisual.caption || `${preloadedVisual.paper_title} (Page ${preloadedVisual.page})`,
        mimeType: 'image/png'
      });
      setInput(`Explain this visual figure (${preloadedVisual.caption || 'architecture diagram'}) from ${preloadedVisual.paper_title} in detail. What are its core components, operational flows, and empirical implications?`);
      if (preloadedVisual.paper_id) {
        setSelectedPaperId(preloadedVisual.paper_id);
      }
      if (onClearPreloadedVisual) onClearPreloadedVisual();
    }
  }, [preloadedVisual]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachedImage({
        dataUrl: e.target.result,
        name: file.name,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        handleImageFile(file);
        break;
      }
    }
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query && !attachedImage) return;
    if (loading) return;

    const currentImage = attachedImage;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query || "Analyze this attached research paper visual in detail.",
      image: currentImage ? currentImage.dataUrl : null,
      imageName: currentImage ? currentImage.name : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const response = await chatWithAgent(
        query || "Analyze this attached research paper visual in detail.", 
        selectedPaperId, 
        currentImage?.dataUrl, 
        currentImage?.mimeType || 'image/png'
      );
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        intent: response.intent,
        citations: response.citations || [],
        verified_citations: response.verified_citations || [],
        tool_calls: response.tool_calls || [],
        execution_trace: response.execution_trace || [],
        has_visual: response.has_visual || Boolean(currentImage)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Agent error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Encountered an error executing the agent workflow. Please ensure the backend server is running and papers are indexed in the library.",
          intent: 'error',
          citations: [],
          verified_citations: [],
          tool_calls: [],
          execution_trace: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrace = (id) => {
    setExpandedTraces(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedPaper = papers.find(p => p.paper_id === selectedPaperId);

  const categorizedPrompts = {
    'All': [
      "Explain the Scaled Dot-Product Attention mechanism in Attention Is All You Need and why sqrt(d_k) scaling is needed.",
      "Analyze the mathematical formulation of LoRA: How does W = W_0 + (alpha/r)*BA achieve parameter efficiency?",
      "Compare FlashAttention's SRAM tiling with standard attention: Why is IO awareness faster than FLOP reduction?",
      "Identify the core research gaps and quadratic scaling bottlenecks across all uploaded papers."
    ],
    'Multimodal': [
      "Explain the architecture diagram and attention component connections in this paper.",
      "What do the empirical benchmark curves and Pareto trade-off plots demonstrate?",
      "Analyze this figure's hardware memory flow between slow GPU HBM and fast SRAM."
    ],
    'PEFT & Adapters': [
      "How does LoRA reduce trainable parameters by 10,000x on GPT-3 without adding inference latency?",
      "What are the primary operational failure modes of LoRA during multi-tenant dynamic serving?",
      "How does QLoRA's 4-bit NormalFloat (NF4) quantization maintain full 16-bit performance?"
    ],
    'Hardware & IO': [
      "What is the IO complexity of FlashAttention compared to standard PyTorch attention?",
      "Explain why attention is memory-bandwidth-bound rather than compute-bound on modern GPUs.",
      "How does online softmax evaluate attention without materializing intermediate N x N matrices?"
    ]
  };

  const renderCitationPills = (citations, verifiedList = []) => {
    if (!citations || citations.length === 0) return null;
    return (
      <div className="mt-3.5 pt-3 border-t border-academic-850 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <BookOpen className="w-3 h-3 text-primary-400" />
          Sources:
        </span>
        {citations.map((c, i) => {
          const verified = verifiedList.find(v => v.citation === c);
          return (
            <button
              key={i}
              onClick={() => onCitationClick(verified || {
                citation: c,
                paper_title: c.replace(/[\[\]]/g, '').split(',')[0],
                page: c.includes('Page') ? c.split('Page')[1].replace(/[\[\]]/g, '').trim() : '1',
                section: 'Referenced Context',
                excerpt: 'Passage verified by LangGraph agent grounding node.'
              })}
              className="citation-chip cursor-pointer"
            >
              <span>{c}</span>
              <CheckCircle2 className="w-2.5 h-2.5 text-accent-emerald ml-0.5" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Workspace Header & Scoping Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 p-0.5 shadow-md shadow-primary-500/20">
            <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Multimodal AI Research Assistant
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                <ImageIcon className="w-2.5 h-2.5 text-cyan-400" /> Vision & RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              LangGraph StateGraph Engine with Visual Diagram Reasoning
            </p>
          </div>
        </div>

        {/* Paper Scope Selector */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Scope:</span>
          <select
            value={selectedPaperId || ''}
            onChange={(e) => setSelectedPaperId(e.target.value || null)}
            className="w-full sm:w-64 bg-academic-950 border border-academic-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="">Cross-Paper Synthesis (All {papers.length} Papers)</option>
            {papers.map((p) => (
              <option key={p.paper_id} value={p.paper_id}>
                {p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        onPaste={handlePaste}
        className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTraceOpen = expandedTraces[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-cyan-500 to-indigo-600 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-3xl rounded-2xl p-5 shadow-lg space-y-3 ${
                  isUser
                    ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white rounded-tr-none'
                    : 'glass-panel border border-academic-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* User Attached Image Thumbnail */}
                {isUser && msg.image && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 bg-black/40 p-1.5 inline-block">
                    <div 
                      onClick={() => setPreviewImageModal(msg.image)}
                      className="relative cursor-pointer group rounded-lg overflow-hidden"
                    >
                      <img 
                        src={msg.image} 
                        alt="Attached research visual" 
                        className="max-h-48 max-w-sm rounded-lg object-contain"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white gap-1">
                        <Maximize2 className="w-3.5 h-3.5" /> Click to enlarge
                      </div>
                    </div>
                    {msg.imageName && (
                      <span className="text-[10px] font-mono text-slate-300 block mt-1 truncate max-w-xs px-1">
                        {msg.imageName}
                      </span>
                    )}
                  </div>
                )}

                {/* Intent & Workflow Header for Assistant */}
                {!isUser && msg.intent && msg.intent !== 'welcome' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-academic-850 pb-2.5 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        msg.intent === 'multimodal_visual_qa'
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          : msg.intent === 'paper_comparison'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : msg.intent === 'research_gaps'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-primary-500/10 text-primary-300 border border-primary-500/30'
                      }`}>
                        {msg.intent === 'multimodal_visual_qa' ? 'Multimodal Visual Reasoning' : msg.intent.replace('_', ' ')}
                      </span>

                      {msg.tool_calls && msg.tool_calls.length > 0 && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Workflow className="w-3 h-3 text-cyan-400" />
                          <span>{msg.tool_calls[0].tool}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {msg.execution_trace && msg.execution_trace.length > 0 && (
                        <button
                          onClick={() => toggleTrace(msg.id)}
                          className="flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <span>{isTraceOpen ? 'Hide Trace' : 'View Trace'}</span>
                          {isTraceOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Execution Trace Accordion */}
                {!isUser && isTraceOpen && msg.execution_trace && (
                  <div className="p-3.5 rounded-xl bg-academic-950/90 border border-academic-800 text-xs font-mono space-y-2 text-slate-400 shadow-inner">
                    <div className="font-bold text-primary-300 border-b border-academic-850 pb-1.5 flex items-center justify-between">
                      <span>LangGraph State Execution Trace:</span>
                      <span className="text-[10px] text-slate-500 font-normal">StateGraph Flow</span>
                    </div>
                    {msg.execution_trace.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 text-[11px]">
                        <span className="text-cyan-400 font-bold">[{sIdx + 1}]</span>
                        <div>
                          <span className="text-slate-200 font-semibold">{step.step}:</span>{' '}
                          <span className="text-slate-400">{step.decision || step.details || step.tool || JSON.stringify(step)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Markdown Content */}
                <div className={`prose-academic ${isUser ? 'text-white' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Verified Grounding Citations */}
                {!isUser && renderCitationPills(msg.citations, msg.verified_citations)}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-academic-800 shrink-0 flex items-center justify-center text-slate-300 shadow-md border border-white/10">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-cyan-500 to-indigo-600 p-0.5 shrink-0 animate-pulse">
              <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-academic-800 space-y-2.5 max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono text-primary-300 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>LangGraph Agent performing multimodal retrieval & reasoning...</span>
              </div>
              <div className="h-1.5 w-full bg-academic-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 via-cyan-400 to-indigo-500 rounded-full animate-indeterminate"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Scholarly Research Prompts:
              </span>
              <div className="flex items-center gap-1">
                {Object.keys(categorizedPrompts).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedPromptCategory(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors cursor-pointer ${
                      selectedPromptCategory === cat 
                        ? 'bg-primary-600 text-white font-semibold' 
                        : 'bg-academic-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1">
            {categorizedPrompts[selectedPromptCategory].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-xs p-2.5 rounded-xl bg-academic-900/60 hover:bg-academic-850 text-slate-300 hover:text-white border border-academic-800 hover:border-cyan-500/40 transition-all text-left flex items-start gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box with Multimodal Image Attachment */}
      <div className="space-y-2">
        {/* Attached image preview banner */}
        {attachedImage && (
          <div className="glass-panel p-2.5 px-3 flex items-center justify-between border border-cyan-500/40 rounded-xl bg-cyan-950/20">
            <div className="flex items-center gap-2.5">
              <img 
                src={attachedImage.dataUrl} 
                alt="Upload preview" 
                className="w-9 h-9 object-cover rounded-lg border border-cyan-500/30"
              />
              <div>
                <span className="text-xs font-semibold text-slate-100 block truncate max-w-xs">
                  {attachedImage.name}
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  Ready for Multimodal Visual Reasoning
                </span>
              </div>
            </div>

            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-academic-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="glass-panel p-2 flex items-center gap-2 rounded-2xl shrink-0 border border-academic-750 focus-within:border-primary-500 shadow-xl"
        >
          {/* File attachment hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-academic-900 hover:bg-academic-800 text-slate-400 hover:text-cyan-300 border border-academic-800 transition-colors cursor-pointer"
            title="Attach paper figure, architecture diagram, or plot (or press Ctrl+V to paste)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            placeholder={
              attachedImage 
                ? "Ask a question about this attached figure (e.g. 'Explain the components and memory flow')..."
                : selectedPaperId 
                ? `Ask about "${selectedPaper?.title.slice(0, 30)}..." (Paste screenshots with Ctrl+V)` 
                : "Ask a technical question across literature, or paste a diagram with Ctrl+V..."
            }
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !attachedImage)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 disabled:opacity-40 disabled:hover:from-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-600/30 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Image Zoom Modal */}
      {previewImageModal && (
        <div 
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] p-2">
            <button 
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImageModal} 
              alt="Enlarged visual" 
              className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain border border-academic-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}
