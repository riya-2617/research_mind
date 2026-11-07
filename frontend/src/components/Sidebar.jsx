import React from 'react';
import { 
  BookOpen, 
  Bot, 
  GitCompare, 
  Search, 
  FileText, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Workflow, 
  Cpu, 
  Database, 
  ShieldAlert,
  Plus,
  Image as ImageIcon
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, paperCount, onOpenAddPaper }) {
  const coreWorkspaces = [
    {
      id: 'library',
      label: 'Document Library',
      description: 'PDF Ingestion & Metadata',
      icon: BookOpen,
      badge: paperCount > 0 ? `${paperCount}` : null,
      color: 'text-accent-cyan'
    },
    {
      id: 'agent',
      label: 'AI Research Agent',
      description: 'Multimodal LangGraph QA',
      icon: Bot,
      highlight: true,
      color: 'text-primary-400'
    },
    {
      id: 'visuals',
      label: 'Figure & Visual Explorer',
      description: 'Architecture Diagrams & Plots',
      icon: ImageIcon,
      color: 'text-cyan-400'
    },
  ];

  const analysisEngines = [
    {
      id: 'compare',
      label: 'Paper Comparison',
      description: 'Multi-Document Matrix',
      icon: GitCompare,
      color: 'text-accent-emerald'
    },
    {
      id: 'gaps',
      label: 'Research Gaps',
      description: 'Limitations & Thesis Questions',
      icon: Search,
      color: 'text-amber-400'
    },
    {
      id: 'review',
      label: 'Literature Review',
      description: 'Publication Survey Generator',
      icon: FileText,
      color: 'text-accent-violet'
    },
  ];

  const renderNavGroup = (title, items) => (
    <div className="space-y-1 mb-4">
      <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 relative group cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-primary-600/20 to-primary-600/5 text-primary-300 border border-primary-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-academic-900/50'
            }`}
          >
            {/* Active Left Glow Bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary-400 to-accent-cyan rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
            )}

            <div className={`p-2 rounded-lg transition-all ${
              isActive 
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105' 
                : 'bg-academic-900/80 text-slate-400 group-hover:text-white group-hover:bg-academic-800'
            }`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold tracking-tight ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-academic-800 text-primary-300 border border-academic-700">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-academic-950/70 backdrop-blur-xl flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] p-3">
      <div className="overflow-y-auto pr-1 custom-scrollbar">
        {/* Quick Add Paper Action */}
        <div className="mb-4">
          <button
            onClick={onOpenAddPaper}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-600 to-accent-cyan hover:from-primary-500 hover:to-accent-cyan text-white shadow-md shadow-primary-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Research Paper</span>
          </button>
        </div>

        {renderNavGroup('Research Core', coreWorkspaces)}
        {renderNavGroup('Analytical Engines', analysisEngines)}
      </div>

      {/* System Engine Widget */}
      <div className="p-3.5 rounded-xl bg-academic-900/60 border border-white/[0.06] shadow-inner space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px]">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            Engine Metrics
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Multimodal
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Vision Engine:</span>
            <span className="text-cyan-300 font-mono font-medium bg-cyan-950/80 px-1.5 py-0.5 rounded text-[10px] border border-cyan-800/40">
              PyMuPDF + Vision
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Vector Store:</span>
            <span className="text-slate-200 font-mono font-medium bg-academic-800 px-1.5 py-0.5 rounded text-[10px]">
              ChromaDB
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Orchestration:</span>
            <span className="text-primary-300 font-mono font-medium bg-primary-950 px-1.5 py-0.5 rounded text-[10px] border border-primary-800/40">
              LangGraph
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
