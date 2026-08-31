import React, { useState, useEffect } from 'react';
import { KnowledgeProvider, useKnowledge } from './context/KnowledgeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { UniversalCaptureModal } from './components/capture/UniversalCaptureModal';
import { NoteDetailModal } from './components/modals/NoteDetailModal';
import { TransformModal } from './components/modals/TransformModal';
import { LoginPage } from './components/auth/LoginPage';

// Views
import { HomeView } from './components/views/HomeView';
import { InboxView } from './components/views/InboxView';
import { KnowledgeView } from './components/views/KnowledgeView';
import { AskAIView } from './components/views/AskAIView';
import { ProjectsView } from './components/views/ProjectsView';
import { TasksView } from './components/views/TasksView';
import { CollectionsView } from './components/views/CollectionsView';
import { GraphView } from './components/views/GraphView';
import { SettingsView } from './components/views/SettingsView';
import { KnowledgeItem } from './types';

const MainAppContent: React.FC = () => {
  const { 
    currentUser,
    activeTab, 
    setIsCaptureOpen, 
    selectedItemId, 
    setSelectedItemId 
  } = useKnowledge();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [itemsToTransform, setItemsToTransform] = useState<KnowledgeItem[] | null>(null);

  // Global Keyboard Shortcuts (Hooks must always execute unconditionally)
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      // 'c' to open capture modal if not in an input
      if (!isInput && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCaptureOpen(true);
      }

      // Escape to close note modal or transform modal
      if (e.key === 'Escape') {
        setSelectedItemId(null);
        setItemsToTransform(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, setIsCaptureOpen, setSelectedItemId]);

  // If user is not logged in, display the authentic Nuvora Login Screen
  if (!currentUser) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'inbox':
        return <InboxView />;
      case 'knowledge':
        return <KnowledgeView onOpenTransform={(items) => setItemsToTransform(items)} />;
      case 'ask':
        return <AskAIView />;
      case 'projects':
        return <ProjectsView />;
      case 'tasks':
        return <TasksView />;
      case 'collections':
        return <CollectionsView />;
      case 'graph':
        return <GraphView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FC] text-[#0B0F19] flex flex-col font-sans selection:bg-[#7B61FF]/15 selection:text-[#7B61FF]">
      {/* Top Navbar */}
      <Navbar 
        onOpenMobileMenu={() => setMobileMenuOpen(true)} 
        isSidebarCollapsed={sidebarCollapsed}
        onToggleSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* View Workspace */}
        <main className="flex-1 px-4 sm:px-8 lg:px-10 py-6 max-w-full overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Universal Capture Modal */}
      <UniversalCaptureModal />

      {/* Note Detail Modal */}
      {selectedItemId && (
        <NoteDetailModal onOpenTransform={(items) => setItemsToTransform(items)} />
      )}

      {/* Knowledge Synthesizer Modal */}
      {itemsToTransform && (
        <TransformModal
          itemsToTransform={itemsToTransform}
          onClose={() => setItemsToTransform(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <KnowledgeProvider>
      <MainAppContent />
    </KnowledgeProvider>
  );
}
