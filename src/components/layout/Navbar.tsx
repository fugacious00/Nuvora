import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Menu, 
  Layers, 
  CheckCircle2, 
  Brain,
  ChevronDown,
  LogOut,
  Sliders,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { LogoutConfirmModal } from '../modals/LogoutConfirmModal';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenMobileMenu,
  isSidebarCollapsed = false,
  onToggleSidebarCollapse
}) => {
  const { 
    setIsCaptureOpen, 
    searchQuery, 
    setSearchQuery, 
    setActiveTab, 
    activeTab, 
    items, 
    activeProjectsCount, 
    totalConnectionsCount, 
    currentUser,
    logout
  } = useKnowledge();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#EAEBF0] px-4 lg:px-6 py-3.5 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand Lockup & Desktop Collapse Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Nuvora Logo */}
        <button 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 group text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-aurora flex items-center justify-center shadow-sm shadow-[#7B61FF]/25 group-hover:scale-105 transition-transform">
            {/* Abstract continuous ribbon N */}
            <svg 
              className="w-4 h-4 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 19V5l16 14V5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-[#0B0F19]">Nuvora</span>
            </div>
          </div>
        </button>

        {/* Sidebar Toggle Icon right beside logo / header */}
        {onToggleSidebarCollapse && (
          <button
            id="navbar-toggle-sidebar-btn"
            onClick={onToggleSidebarCollapse}
            className="hidden lg:flex p-1.5 ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            aria-label={isSidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#7B61FF]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'knowledge' && e.target.value.trim().length > 0) {
                setActiveTab('knowledge');
              }
            }}
            placeholder="Search notes, concepts, ideas, tasks, entities... (Press '/' to focus)"
            className="w-full pl-10 pr-12 py-2 text-sm bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF] transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Ambient Knowledge Pulse & Primary Capture CTA */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Ambient Knowledge Pulse badge */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F4F5FB] border border-[#E7E9F2] text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-[#22D3A6] animate-pulse" />
          <span>{items.length} items</span>
          <span className="text-slate-300">•</span>
          <span>{totalConnectionsCount} connections</span>
          <span className="text-slate-300">•</span>
          <span>{activeProjectsCount} outcomes</span>
        </div>

        {/* Primary Capture CTA */}
        <button
          onClick={() => setIsCaptureOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm shadow-[#7B61FF]/30 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Capture</span>
        </button>

        {/* User Account / Sign Out Dropdown */}
        {currentUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              aria-label="User Account Menu"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#7B61FF] to-[#6366F1] text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser.email}
                  </div>
                  <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600">
                    {currentUser.provider} account
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <LogoutConfirmModal
          isOpen={logoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={logout}
          userName={currentUser?.name}
        />
      </div>
    </header>
  );
};
