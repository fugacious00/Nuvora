import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Database,
  Command,
  Info,
  User,
  LogOut
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { LogoutConfirmModal } from '../modals/LogoutConfirmModal';
import { PrivacySecuritySection } from '../settings/PrivacySecuritySection';

export const SettingsView: React.FC = () => {
  const { 
    items, 
    projects, 
    collections, 
    exportData, 
    importData, 
    resetToSampleData,
    currentUser,
    logout
  } = useKnowledge();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Successfully restored knowledge library!');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Failed to import backup file. Please ensure it is a valid Nuvora JSON backup.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to sample data? Any unexported captures will be replaced.')) {
      resetToSampleData();
      setImportStatus('Reset to sample dataset complete.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#EAEBF0]">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
          System Settings & Data Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Full data sovereignty. Export, restore, configure, and inspect your knowledge system.
        </p>
      </div>

      {importStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Account Profile Card */}
      {currentUser && (
        <section className="p-6 rounded-3xl bg-white border border-[#EAEBF0] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7B61FF] to-[#6366F1] text-white text-base font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-sm font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#7B61FF]">
                    {currentUser.provider} account
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Session active
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setLogoutModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      )}

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={logout}
        userName={currentUser?.name}
      />

      {/* Privacy Center & Security */}
      <PrivacySecuritySection />

      {/* 1. Data Portability & Sovereignty */}
      <section className="p-6 rounded-3xl bg-white border border-[#EAEBF0] space-y-4 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F0EEFF] text-[#7B61FF] flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Data Sovereignty & Backups</h2>
            <p className="text-xs text-slate-500">Your knowledge is completely exportable as human-readable JSON.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export */}
          <button
            onClick={exportData}
            className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E4E6F0] hover:border-[#7B61FF] hover:bg-white text-left transition-all space-y-2 group"
          >
            <Download className="w-5 h-5 text-[#7B61FF]" />
            <div>
              <div className="text-xs font-bold text-slate-900">Export Knowledge Base</div>
              <div className="text-[11px] text-slate-500">Download complete library as JSON file</div>
            </div>
          </button>

          {/* Import */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full p-4 rounded-2xl bg-[#FAFBFD] border border-[#E4E6F0] hover:border-[#4C9CFF] hover:bg-white text-left transition-all space-y-2 group"
            >
              <Upload className="w-5 h-5 text-[#4C9CFF]" />
              <div>
                <div className="text-xs font-bold text-slate-900">Restore / Import</div>
                <div className="text-[11px] text-slate-500">Load Nuvora JSON backup file</div>
              </div>
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E4E6F0] hover:border-rose-400 hover:bg-white text-left transition-all space-y-2 group"
          >
            <RotateCcw className="w-5 h-5 text-rose-500" />
            <div>
              <div className="text-xs font-bold text-slate-900">Reset Sample Data</div>
              <div className="text-[11px] text-slate-500">Restore rich initial knowledge graph</div>
            </div>
          </button>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="p-6 rounded-3xl bg-white border border-[#EAEBF0] space-y-4 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Command className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Keyboard Shortcuts</h2>
            <p className="text-xs text-slate-500">Speed up capture and navigation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBFD] border border-slate-100">
            <span className="text-slate-700">Universal Search</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[10px]">⌘K or /</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBFD] border border-slate-100">
            <span className="text-slate-700">Quick Capture</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[10px]">C</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBFD] border border-slate-100">
            <span className="text-slate-700">Ask AI</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[10px]">⌥A</kbd>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFBFD] border border-slate-100">
            <span className="text-slate-700">Close Overlay</span>
            <kbd className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[10px]">Esc</kbd>
          </div>
        </div>
      </section>
    </div>
  );
};
