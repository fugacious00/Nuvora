import React, { useState } from 'react';
import { 
  Inbox, 
  Sparkles, 
  Check, 
  Trash2, 
  Archive, 
  KanbanSquare, 
  FolderHeart, 
  Loader2, 
  ArrowRight, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem } from '../../types';

export const InboxView: React.FC = () => {
  const { 
    items, 
    processInboxItem, 
    updateItem, 
    deleteItem, 
    archiveItem, 
    setSelectedItemId, 
    projects, 
    collections,
    linkItemToProject,
    linkItemToCollection,
    setIsCaptureOpen 
  } = useKnowledge();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const inboxItems = items.filter((item) => item.status === 'inbox');

  const handleProcessSingle = async (id: string) => {
    setProcessingId(id);
    try {
      await processInboxItem(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessAll = async () => {
    if (inboxItems.length === 0) return;
    setIsProcessingAll(true);
    try {
      for (const item of inboxItems) {
        await processInboxItem(item.id);
      }
    } finally {
      setIsProcessingAll(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Inbox Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">Inbox</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFB86B]/20 text-[#D97706] font-bold">
              {inboxItems.length} unprocessed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture first, organize second. Let AI understand topics, entities, and action items.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {inboxItems.length > 0 && (
            <button
              onClick={handleProcessAll}
              disabled={isProcessingAll}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing All...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Process All ({inboxItems.length})</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsCaptureOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E4E6F0] text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Capture</span>
          </button>
        </div>
      </div>

      {/* Inbox Item List */}
      {inboxItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAEBF0] space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#EDFDF8] text-[#10B981] mx-auto flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Inbox Zero Reached</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              All captured thoughts have been understood and connected into your living knowledge system.
            </p>
          </div>
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capture a New Thought</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {inboxItems.map((item) => {
            const isProcessing = processingId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-sm transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                        {item.type}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Captured {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 
                      onClick={() => setSelectedItemId(item.id)}
                      className="text-sm font-bold text-slate-900 hover:text-[#7B61FF] cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Top quick action */}
                  <button
                    onClick={() => handleProcessSingle(item.id)}
                    disabled={isProcessing}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F0EEFF] text-[#7B61FF] text-xs font-semibold hover:bg-[#E4DEFF] disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Understanding...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Understand & Process</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Content snippet */}
                <p 
                  onClick={() => setSelectedItemId(item.id)}
                  className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal bg-[#FAFBFD] p-3 rounded-xl border border-slate-100 cursor-pointer"
                >
                  {item.content}
                </p>

                {/* Bottom triage bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Quick file into Project & Collection */}
                  <div className="flex items-center space-x-2">
                    <select
                      value={item.projectId || ''}
                      onChange={(e) => linkItemToProject(item.id, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-lg text-slate-600"
                    >
                      <option value="">+ Assign Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>

                    <select
                      value={item.collectionId || ''}
                      onChange={(e) => linkItemToCollection(item.id, e.target.value)}
                      className="px-2.5 py-1 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-lg text-slate-600"
                    >
                      <option value="">+ File in Collection</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateItem(item.id, { status: 'processed' })}
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Mark as Processed"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => archiveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
