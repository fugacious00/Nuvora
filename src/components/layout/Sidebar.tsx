import React, { useRef, useState, useEffect } from 'react';
import { 
  Home, 
  Inbox, 
  BookOpen, 
  Sparkles, 
  KanbanSquare, 
  CheckSquare, 
  FolderHeart, 
  Network, 
  Settings, 
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
  Layers,
  Database
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { ViewTab } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen, 
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    inboxCount, 
    openTasksCount, 
    activeProjectsCount,
    projects,
    collections,
    allTopics,
    setSelectedTopic,
    setSelectedCollectionId,
    setSelectedProjectId,
    items
  } = useKnowledge();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 10);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    const maxScroll = scrollHeight - clientHeight;
    setScrollProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [items, projects, collections, isCollapsed]);

  const handleScrollToggle = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (canScrollDown) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems: { id: ViewTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: inboxCount, badgeColor: 'bg-[#FFB86B] text-slate-900 font-bold' },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'ask', label: 'Ask AI', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: KanbanSquare, count: activeProjectsCount },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: openTasksCount, badgeColor: 'bg-[#E7E9F2] text-slate-700' },
    { id: 'collections', label: 'Collections', icon: FolderHeart, count: collections.length },
    { id: 'graph', label: 'Connections Graph', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: ViewTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 4);
  const displayCollections = collections.slice(0, 4);
  const displayTopics = allTopics.slice(0, 5);

  const sidebarContent = (
    <div 
      className={`relative flex flex-col h-full bg-white border-r border-[#EAEBF0] select-none transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-100 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Menu
            </span>
            <div className="flex items-center space-x-1">
              {/* Rail Scroll Toggle Button at top marked area */}
              <button
                id="vertical-rail-scroll-toggle"
                onClick={handleScrollToggle}
                className="hidden lg:flex p-1.5 text-slate-400 hover:text-[#7B61FF] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={canScrollDown ? 'Scroll down to see all options' : 'Scroll to top'}
                aria-label="Toggle rail scroll"
              >
                {canScrollDown ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            {onToggleCollapse && (
              <button
                id="expand-sidebar-btn"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-4 h-4 text-[#7B61FF]" />
              </button>
            )}
          </div>
        )}

        {/* Mobile Close X */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Container with custom vertical scroll track */}
      <div 
        ref={scrollContainerRef}
        id="sidebar-scrollable-container"
        className={`flex-1 overflow-y-auto overflow-x-hidden ${
          isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-5'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#7B61FF33 transparent'
        }}
      >
        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F0EEFF] text-[#7B61FF] font-semibold'
                    : 'text-slate-600 hover:bg-[#F6F7FC] hover:text-slate-900'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-[#7B61FF]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-[#F0EEFF] text-[#7B61FF]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {isCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className="sr-only">({item.count})</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Expanded Sections: Active Outcomes */}
        {!isCollapsed && activeProjects.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <KanbanSquare className="w-3 h-3 text-slate-400" />
                <span>Active Outcomes</span>
              </span>
              <button
                onClick={() => handleNavClick('projects')}
                className="text-[11px] text-[#7B61FF] hover:underline font-medium cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="space-y-0.5">
              {activeProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    handleNavClick('projects');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg group text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color || '#7B61FF' }}
                    />
                    <span className="truncate">{p.title}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Sections: Curated Collections */}
        {!isCollapsed && displayCollections.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <FolderHeart className="w-3 h-3 text-slate-400" />
                <span>Collections</span>
              </span>
              <button
                onClick={() => handleNavClick('collections')}
                className="text-[11px] text-[#7B61FF] hover:underline font-medium cursor-pointer"
              >
                All ({collections.length})
              </button>
            </div>
            <div className="space-y-0.5">
              {displayCollections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setSelectedCollectionId(col.id);
                    handleNavClick('collections');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg group text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs">{col.icon || '📁'}</span>
                    <span className="truncate">{col.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{col.itemIds?.length || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Sections: Quick Topics */}
        {!isCollapsed && displayTopics.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2 pb-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Topics</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {displayTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    handleNavClick('knowledge');
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-[#F0EEFF] hover:text-[#7B61FF] text-[11px] text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Vertical Rail Edge on the Right Border (Marked Area) */}
      {!isCollapsed && (
        <div 
          id="vertical-rail-track"
          className="absolute right-0 top-0 bottom-0 w-1 flex flex-col justify-between items-center group pointer-events-auto"
        >
          {/* Top Rail Scroll Button */}
          <button
            onClick={handleScrollToggle}
            className="opacity-0 group-hover:opacity-100 absolute -right-3 top-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-[#7B61FF] hover:border-[#7B61FF]/40 transition-all z-20 cursor-pointer"
            title={canScrollDown ? 'Scroll down rail' : 'Scroll to top'}
            aria-label="Scroll vertical rail"
          >
            {canScrollDown ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Dynamic Scroll Progress Indicator on the Rail */}
          <div 
            className="w-1 bg-[#7B61FF] rounded-full transition-all duration-100 opacity-30 group-hover:opacity-100"
            style={{
              height: `${Math.max(15, scrollProgress)}%`,
              transform: `translateY(${scrollProgress > 0 ? (scrollProgress * 0.8) : 0}%)`
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-[calc(100vh-61px)] sticky top-[61px] flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
