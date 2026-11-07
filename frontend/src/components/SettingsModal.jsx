import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, Sparkles, CheckCircle2, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { getSettingsStatus, updateSettings } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [provider, setProvider] = useState('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getSettingsStatus().then((status) => {
        setProvider(status.active_provider || 'local');
        setSavedStatus(status);
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSettings({
        gemini_key: geminiKey || undefined,
        openai_key: openaiKey || undefined,
        provider: provider
      });
      setSavedStatus(res.current_status);
      if (onSettingsUpdated) onSettingsUpdated(res.current_status);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
      alert("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg overflow-hidden shadow-2xl border border-academic-750 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-academic-800 flex items-start justify-between bg-academic-900/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-primary-500/10 text-primary-300 border border-primary-500/25 uppercase tracking-wider mb-1.5">
              <Key className="w-3 h-3" />
              Runtime Configuration
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              LLM & Synthesis Engine
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-academic-850 hover:bg-academic-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Active Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary-400" />
              Select Active Generation Model:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'gemini', label: 'Google Gemini', desc: 'gemini-2.5-flash', tag: 'Fast / Cloud' },
                { id: 'openai', label: 'OpenAI GPT', desc: 'gpt-4o-mini', tag: 'Reasoning' },
                { id: 'local', label: 'Local Grounded', desc: 'Vector Extractor', tag: '100% Offline' }
              ].map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-primary-950/70 border-primary-500 shadow-lg ring-1 ring-primary-500/50' 
                        : 'bg-academic-950/60 border-academic-850 hover:border-academic-750 hover:bg-academic-900/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-100 block truncate">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5">
                      {p.desc}
                    </span>
                    <span className={`inline-block text-[9px] font-mono mt-2 px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-primary-500/20 text-primary-300' : 'bg-academic-800 text-slate-400'
                    }`}>
                      {p.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-slate-400" />
                Google Gemini API Key:
              </span>
              {savedStatus?.has_gemini_key && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Configured
                </span>
              )}
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder={savedStatus?.has_gemini_key ? "••••••••••••••••••••••••" : "AIzaSy..."}
              className="w-full bg-academic-950 border border-academic-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-slate-400" />
                OpenAI API Key:
              </span>
              {savedStatus?.has_openai_key && (
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Configured
                </span>
              )}
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={savedStatus?.has_openai_key ? "••••••••••••••••••••••••" : "sk-..."}
              className="w-full bg-academic-950 border border-academic-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Local Zero-Key Guarantee Banner */}
          <div className="p-4 rounded-xl bg-academic-950/80 border border-academic-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fully Offline / Zero-Key Fallback Guarantee
            </div>
            <p className="leading-relaxed">
              When no cloud API keys are provided, RESEARCHMIND activates its offline deterministic academic synthesizer. All queries, comparisons, gap detections, and literature reviews run entirely locally using ChromaDB vector lookups.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-academic-850 hover:bg-academic-800 text-slate-300 border border-academic-750 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white transition-all shadow-lg shadow-primary-600/30 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Apply Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
