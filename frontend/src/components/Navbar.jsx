import React from 'react';
import { 
  Brain, 
  Cpu, 
  Database, 
  Settings as SettingsIcon, 
  Sparkles,
  Workflow,
  ExternalLink,
  BookMarked,
  Plus
} from 'lucide-react';

export default function Navbar({ 
  paperCount, 
  modelStatus, 
  onOpenSettings, 
  onOpenAddPaper, 
  onLoadSamples, 
  loadingSamples 
}) {
  const getProviderBadge = () => {
    const provider = modelStatus?.active_provider || 'local';
    if (provider === 'gemini') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="font-mono text-[11px]">Gemini 2.5 Flash</span>
        </div>
      );
    }
    if (provider === 'openai') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[11px]">GPT-4o Mini</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/30 text-xs font-medium shadow-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <span className="font-mono text-[11px]">Local Grounded Engine</span>
      </div>
    );
  };

  return (
    <header className="h-16 border-b border-white/[0.08] bg-academic-950/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between shadow-lg">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3.5">
        <div className="relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-cyan to-accent-violet p-0.5 shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-academic-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-emerald rounded-full border-2 border-academic-950"></span>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
              RESEARCH<span className="bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-300 bg-clip-text text-transparent">MIND</span>
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary-950/80 text-primary-300 border border-primary-500/30 font-semibold tracking-wider">
              Agentic RAG
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
            Autonomous Academic Research Assistant & Literature Synthesis
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* ChromaDB Vector Storage Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-academic-900/60 border border-white/[0.06] text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-slate-400">Vector Index:</span>
          <span className="font-semibold text-white font-mono bg-academic-800 px-1.5 py-0.5 rounded text-[11px]">
            {paperCount} {paperCount === 1 ? 'Paper' : 'Papers'}
          </span>
        </div>

        {/* LangGraph Agent Ready Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-academic-900/60 border border-white/[0.06] text-xs text-slate-300">
          <Workflow className="w-3.5 h-3.5 text-accent-violet" />
          <span className="text-slate-400">Agent:</span>
          <span className="font-medium text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LangGraph
          </span>
        </div>

        {/* Active Provider Badge */}
        <div className="hidden sm:block">
          {getProviderBadge()}
        </div>

        {/* Add Paper Button */}
        <button
          onClick={onOpenAddPaper}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Add research papers via PDF upload, curated catalog, or custom entry"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Paper</span>
        </button>

        {/* Load Landmark Papers Shortcut */}
        {paperCount < 7 && (
          <button
            onClick={onLoadSamples}
            disabled={loadingSamples}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-md shadow-primary-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Seed all landmark AI papers into ChromaDB"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            {loadingSamples ? 'Indexing...' : 'Seed Landmark Papers'}
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-academic-900/80 hover:bg-academic-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          title="Configure API Keys & LLM Provider"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
