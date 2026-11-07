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
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAgent } from '../services/api';

export default function AgentChat({ papers, selectedPaperId, setSelectedPaperId, onCitationClick }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am **RESEARCHMIND**, your Agentic AI Research Assistant. I examine your uploaded academic literature using **LangGraph**, **ChromaDB vector retrieval**, and strict **page-level source citations**.\n\n### What I can help you with:\n- **Deep Technical Q&A**: Mathematical formulations, architectural dynamics, algorithmic proofs.\n- **Cross-Paper Comparisons**: Contrast objectives, methodologies, and benchmarks across papers.\n- **Research Gap Mining**: Identify unaddressed limitations, compute bottlenecks, and novel thesis questions.\n- **Literature Review Synthesis**: Generate structured, publication-grade academic surveys.\n\n*Select a prompt below or ask any research question!*",
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAgent(query, selectedPaperId);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        intent: response.intent,
        citations: response.citations || [],
        verified_citations: response.verified_citations || [],
        tool_calls: response.tool_calls || [],
        execution_trace: response.execution_trace || []
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

  const toggleTrace = (msgId) => {
    setExpandedTraces(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categorizedPrompts = {
    'All': [
      "What is the mathematical formulation of Scaled Dot-Product Attention?",
      "How does DPO derive its closed-form loss without a PPO critic network?",
      "Explain Group Relative Policy Optimization (GRPO) in DeepSeek-R1",
      "How does FlashAttention utilize GPU SRAM tiling to minimize HBM IO?",
      "Compare LoRA vs full fine-tuning in terms of GPU memory and parameter count",
      "How does RAG marginalize over retrieved passages in RAG-Sequence vs RAG-Token?",
      "What is the Masked Language Model (MLM) objective in BERT?",
      "Identify key research gaps in long-context Transformer scaling"
    ],
    'Architecture': [
      "What is the mathematical formulation of Scaled Dot-Product Attention?",
      "What is the Masked Language Model (MLM) objective in BERT?",
      "Compare the Transformer encoder-decoder vs BERT encoder-only architecture"
    ],
    'Efficiency': [
      "How does FlashAttention utilize GPU SRAM tiling to minimize HBM IO?",
      "Compare LoRA vs full fine-tuning in terms of GPU memory and parameter count",
      "Where does the paper discuss quadratic computational complexity O(n^2)?"
    ],
    'Alignment': [
      "How does DPO derive its closed-form loss without a PPO critic network?",
      "Explain Group Relative Policy Optimization (GRPO) in DeepSeek-R1",
      "How does rule-based reward verification work in DeepSeek-R1-Zero?"
    ]
  };

  const selectedPaper = papers.find(p => p.paper_id === selectedPaperId);

  const renderCitationPills = (citations, verified = []) => {
    if (!citations || citations.length === 0) return null;

    return (
      <div className="mt-4 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
          <Quote className="w-3.5 h-3.5 text-primary-400" />
          Page-Level Grounded Citations ({citations.length}):
        </div>
        <div className="flex flex-wrap gap-2">
          {citations.map((cit, idx) => {
            const vData = verified.find(v => v.citation === cit) || {
              citation: cit,
              paper_title: cit.replace(/[\[\]]/g, '').split(',')[0],
              page: cit.includes('Page') ? cit.split('Page')[1].replace(/[\[\]]/g, '').trim() : '1',
              section: 'Source Document',
              excerpt: 'Grounded citation retrieved from indexed paper vector store.'
            };

            return (
              <button
                key={idx}
                onClick={() => onCitationClick(vData)}
                className="citation-chip group text-left"
                title="Click to inspect exact source excerpt & page"
              >
                <BookOpen className="w-3 h-3 text-primary-400 group-hover:text-primary-300" />
                <span>{cit}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto p-4 md:p-6 space-y-3">
      {/* Top Workflow Visualizer Bar */}
      <div className="glass-panel p-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-bold text-slate-200">Scope:</span>
          </div>

          <div className="relative">
            <select
              value={selectedPaperId || ""}
              onChange={(e) => setSelectedPaperId(e.target.value || null)}
              className="bg-academic-950/90 border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-primary-500 font-medium pr-8"
            >
              <option value="">Full Knowledge Base (All 7 Uploaded Papers)</option>
              {papers.map((p) => (
                <option key={p.paper_id} value={p.paper_id}>
                  {p.title.length > 45 ? p.title.slice(0, 45) + "..." : p.title} ({p.total_pages}p)
                </option>
              ))}
            </select>
          </div>

          {selectedPaper && (
            <button
              onClick={() => setSelectedPaperId(null)}
              className="p-1 rounded-lg bg-academic-800 hover:bg-academic-700 text-slate-400 hover:text-white"
              title="Clear Scope (Search All Papers)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* LangGraph Pipeline Stage Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-academic-950/60 px-3 py-1 rounded-full border border-white/[0.06]">
          <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
          <span className="text-slate-300 font-medium">LangGraph Pipeline:</span>
          <span className="text-primary-300">Router</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
          <span className="text-cyan-300">Tool</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
          <span className="text-violet-300">Synthesis</span>
          <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
          <span className="text-emerald-300">Verifier</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTraceOpen = expandedTraces[msg.id];
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-cyan to-accent-violet p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[88%] md:max-w-[82%] rounded-2xl p-5 shadow-xl relative group ${
                isUser 
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none' 
                  : 'glass-panel text-slate-200 rounded-tl-none border border-white/[0.08]'
              }`}>
                {/* Copy button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-academic-800/60 hover:bg-academic-700 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-xs"
                    title="Copy Answer Markdown"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Intent & Tool Execution Badges */}
                {!isUser && msg.intent && msg.intent !== 'welcome' && (
                  <div className="mb-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary-950/90 text-primary-300 border border-primary-500/30">
                        Intent: {msg.intent.replace('_', ' ')}
                      </span>

                      {msg.tool_calls && msg.tool_calls.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 flex items-center gap-1 font-medium">
                          <Cpu className="w-2.5 h-2.5" />
                          Tool: {t.tool}
                        </span>
                      ))}

                      {msg.execution_trace && msg.execution_trace.length > 0 && (
                        <button
                          onClick={() => toggleTrace(msg.id)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-academic-800/80 hover:bg-academic-700 transition-colors ml-auto font-mono font-medium"
                        >
                          Trace ({msg.execution_trace.length} steps)
                          {isTraceOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Trace Dropdown */}
                    {isTraceOpen && (
                      <div className="p-3.5 rounded-xl bg-academic-950/90 border border-white/[0.08] text-xs font-mono space-y-2 text-slate-400 shadow-inner">
                        <div className="font-bold text-primary-300 border-b border-white/[0.06] pb-1.5 flex items-center justify-between">
                          <span>LangGraph State Execution Trace:</span>
                          <span className="text-[10px] text-slate-500 font-normal">StateGraph Flow</span>
                        </div>
                        {msg.execution_trace.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2.5 text-[11px]">
                            <span className="text-accent-cyan font-bold">[{sIdx + 1}]</span>
                            <div>
                              <span className="text-slate-200 font-semibold">{step.step}:</span>{' '}
                              <span className="text-slate-400">{step.decision || step.details || step.tool || JSON.stringify(step)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={`prose-academic ${isUser ? 'text-white' : ''}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Citations block */}
                {!isUser && renderCitationPills(msg.citations, msg.verified_citations)}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-9 h-9 rounded-xl bg-academic-800 p-0.5 shrink-0 flex items-center justify-center text-slate-300 shadow-md border border-white/[0.08]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-cyan to-accent-violet p-0.5 shrink-0 animate-pulse">
              <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
            </div>
            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border border-white/[0.08] space-y-2.5 max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono text-primary-300 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent-cyan" />
                <span>LangGraph Agent routing query & executing tools...</span>
              </div>
              <div className="h-1.5 w-full bg-academic-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 via-accent-cyan to-accent-violet rounded-full animate-indeterminate"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts with Category Tabs */}
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
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
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
                className="text-xs p-2.5 rounded-xl bg-academic-900/60 hover:bg-academic-800 text-slate-300 hover:text-white border border-white/[0.06] hover:border-primary-500/40 transition-all text-left flex items-start gap-2 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-snug">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="glass-panel p-2 flex items-center gap-2 rounded-2xl shrink-0 border border-white/[0.1] focus-within:border-primary-500/80 transition-all shadow-xl"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedPaperId ? `Ask about "${selectedPaper?.title.slice(0, 30)}..."` : "Ask a technical research question across all indexed literature..."}
          disabled={loading}
          className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan disabled:opacity-40 disabled:hover:from-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-600/30 flex items-center gap-1.5 text-xs"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
