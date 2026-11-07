import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DocumentLibrary from './components/DocumentLibrary';
import AgentChat from './components/AgentChat';
import FigureExplorer from './components/FigureExplorer';
import PaperComparison from './components/PaperComparison';
import ResearchGaps from './components/ResearchGaps';
import LiteratureReview from './components/LiteratureReview';
import CitationDrawer from './components/CitationDrawer';
import SettingsModal from './components/SettingsModal';
import AddPaperModal from './components/AddPaperModal';
import { getPapers, getSettingsStatus, loadSamplePapers } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [selectedVisualForChat, setSelectedVisualForChat] = useState(null);

  useEffect(() => {
    // Load indexed papers
    getPapersList();
    // Load settings
    getSettingsStatus()
      .then(status => setModelStatus(status))
      .catch(err => console.error(err));
  }, []);

  const getPapersList = async () => {
    try {
      const data = await getPapers();
      setPapers(data);
    } catch (err) {
      console.error("Failed to load papers:", err);
    }
  };

  const handlePapersAdded = (newPapers) => {
    setPapers(prev => {
      const existingIds = new Set(prev.map(p => p.paper_id));
      const added = newPapers.filter(p => !existingIds.has(p.paper_id));
      return [...prev, ...added];
    });
  };

  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    try {
      const samples = await loadSamplePapers();
      setPapers(samples);
    } catch (err) {
      console.error("Load samples error:", err);
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleSelectFigureForChat = (figure) => {
    setSelectedVisualForChat(figure);
    setActiveTab('agent');
  };

  return (
    <div className="min-h-screen bg-academic-950 text-slate-100 flex flex-col font-sans selection:bg-primary-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        paperCount={papers.length}
        modelStatus={modelStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddPaper={() => setIsAddPaperOpen(true)}
        onLoadSamples={handleLoadSamples}
        loadingSamples={loadingSamples}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          paperCount={papers.length}
          onOpenAddPaper={() => setIsAddPaperOpen(true)}
        />

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-academic-950 via-academic-950 to-academic-900/30">
          {activeTab === 'library' && (
            <DocumentLibrary 
              papers={papers} 
              setPapers={setPapers}
              onOpenAddPaper={() => setIsAddPaperOpen(true)}
              onPaperSelect={(id) => {
                setSelectedPaperId(id);
                setActiveTab('agent');
              }}
              selectedPaperId={selectedPaperId}
            />
          )}

          {activeTab === 'agent' && (
            <AgentChat 
              papers={papers}
              selectedPaperId={selectedPaperId}
              setSelectedPaperId={setSelectedPaperId}
              onCitationClick={(cit) => setActiveCitation(cit)}
              preloadedVisual={selectedVisualForChat}
              onClearPreloadedVisual={() => setSelectedVisualForChat(null)}
            />
          )}

          {activeTab === 'visuals' && (
            <FigureExplorer 
              papers={papers}
              onSelectFigureForChat={handleSelectFigureForChat}
            />
          )}

          {activeTab === 'compare' && (
            <PaperComparison 
              papers={papers}
              onCitationClick={(cit) => setActiveCitation(cit)}
            />
          )}

          {activeTab === 'gaps' && (
            <ResearchGaps 
              papers={papers}
              onCitationClick={(cit) => setActiveCitation(cit)}
            />
          )}

          {activeTab === 'review' && (
            <LiteratureReview 
              papers={papers}
              onCitationClick={(cit) => setActiveCitation(cit)}
            />
          )}
        </main>
      </div>

      {/* Slide-over Citation Drawer */}
      <CitationDrawer 
        citation={activeCitation} 
        onClose={() => setActiveCitation(null)} 
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={(newStatus) => setModelStatus(newStatus)}
      />

      {/* Add Paper Modal */}
      <AddPaperModal
        isOpen={isAddPaperOpen}
        onClose={() => setIsAddPaperOpen(false)}
        onPaperAdded={handlePapersAdded}
        currentPaperCount={papers.length}
      />
    </div>
  );
}
