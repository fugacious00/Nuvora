import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Pin, 
  Trash2, 
  Archive, 
  BookOpen, 
  CheckSquare, 
  Network, 
  Plus, 
  ExternalLink, 
  Tag, 
  Lightbulb, 
  FolderHeart, 
  KanbanSquare, 
  Edit3, 
  Save, 
  ArrowRight,
  Share2,
  Search,
  Quote
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem } from '../../types';
import { 
  analyzeItemSearchMatch, 
  HighlightedText 
} from '../../utils/searchHighlight';

interface NoteDetailModalProps {
  onOpenTransform: (items: KnowledgeItem[]) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ onOpenTransform }) => {
  const { 
    items, 
    selectedItemId, 
    setSelectedItemId, 
    updateItem, 
    deleteItem, 
    archiveItem, 
    pinItem, 
    toggleTask, 
    addTask, 
    deleteTask, 
    projects, 
    collections, 
    setActiveTab,
    searchQuery,
    setSearchQuery
  } = useKnowledge();

  const item = items.find((i) => i.id === selectedItemId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [newActionText, setNewActionText] = useState('');

  useEffect(() => {
    if (item) {
      setEditedTitle(item.title);
      setEditedContent(item.content);
      setIsEditing(false);
    }
  }, [item]);

  if (!item) return null;

  const searchAnalysis = analyzeItemSearchMatch(item, searchQuery);
  const isSearchActive = Boolean(searchQuery.trim());

  const handleSaveEdit = () => {
    updateItem(item.id, {
      title: editedTitle.trim() || item.title,
      content: editedContent,
    });
    setIsEditing(false);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    addTask(item.id, newActionText.trim(), 'medium', item.projectId);
    setNewActionText('');
  };

  const currentProject = projects.find((p) => p.id === item.projectId);
  const currentCollection = collections.find((c) => c.id === item.collectionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E4E6F0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#EAEBF0] flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center space-x-2.5">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#7B61FF]">
              {item.type}
            </span>
            {currentProject && (
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <span>/</span>
                <span className="font-semibold text-slate-700">{currentProject.title}</span>
              </span>
            )}
            {currentCollection && (
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <span>/</span>
                <span className="font-semibold text-slate-700">{currentCollection.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Pin */}
            <button
              onClick={() => pinItem(item.id)}
              className={`p-2 rounded-xl transition-colors ${
                item.status === 'pinned' ? 'bg-[#F0EEFF] text-[#7B61FF]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Pin Note"
            >
              <Pin className="w-4 h-4 fill-current" />
            </button>

            {/* Synthesize with AI */}
            <button
              onClick={() => {
                onOpenTransform([item]);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F0EEFF] text-[#7B61FF] text-xs font-semibold hover:bg-[#E4DEFF] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Synthesize</span>
            </button>

            {/* Archive */}
            <button
              onClick={() => {
                archiveItem(item.id);
                setSelectedItemId(null);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => {
                deleteItem(item.id);
                setSelectedItemId(null);
              }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedItemId(null)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Search Query Notice Banner */}
        {isSearchActive && searchAnalysis.hasMatch && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-amber-50 to-[#FAF8FF] border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span>
                Search active for: <strong className="bg-[#FEEA9F] px-1.5 py-0.5 rounded font-mono text-[11px]">"{searchQuery}"</strong>
              </span>
              <span className="text-amber-700 text-[11px]">
                ({searchAnalysis.totalOccurrences} matched {searchAnalysis.totalOccurrences === 1 ? 'occurrence' : 'occurrences'} highlighted below)
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              {searchAnalysis.matchesTitle && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                  In Title
                </span>
              )}
              {searchAnalysis.matchesContent && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F0EEFF] text-[#7B61FF]">
                  In Content
                </span>
              )}
              {searchAnalysis.matchedTopics.length > 0 && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  In Topics
                </span>
              )}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Title Area */}
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-xl sm:text-2xl font-bold text-slate-900 border-b border-[#7B61FF] pb-1 focus:outline-none"
              />
            ) : (
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B0F19]">
                  <HighlightedText text={item.title} query={searchQuery} />
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="Edit note"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
              <span>Updated {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{item.wordCount || 0} words</span>
              {item.sourceUrl && (
                <>
                  <span>•</span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7B61FF] hover:underline flex items-center space-x-1"
                  >
                    <span>Source Web Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* AI Executive Summary Block */}
          {item.rawSummary && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF8FF] to-[#F3F4FF] border border-[#E4DEFF] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#7B61FF]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Essence & Key Insight</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                <HighlightedText text={item.rawSummary} query={searchQuery} />
              </p>
            </div>
          )}

          {/* Key Insights List */}
          {item.keyInsights && item.keyInsights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                <Lightbulb className="w-4 h-4 text-[#FFB86B]" />
                <span>Discovered Principles & Insights</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-xs text-slate-600">
                {item.keyInsights.map((ins, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <HighlightedText text={ins} query={searchQuery} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Note Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Content
              </span>
              {isSearchActive && searchAnalysis.matchesContent && (
                <span className="text-[11px] text-[#7B61FF] font-semibold flex items-center space-x-1">
                  <Quote className="w-3 h-3" />
                  <span>Matches present in document body</span>
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={10}
                  className="w-full p-4 text-sm font-mono bg-[#FAFBFD] border border-[#E4E6F0] rounded-2xl focus:ring-2 focus:ring-[#7B61FF]/30 resize-none leading-relaxed"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold bg-aurora text-white rounded-lg shadow-sm hover:opacity-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#FAFBFD] border border-[#EAEBF0] text-slate-800 text-sm leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Items Derived Checklist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                <CheckSquare className="w-4 h-4 text-[#10B981]" />
                <span>Action Items & Next Steps ({item.actionItems.length})</span>
              </div>
            </div>

            {/* Actions List */}
            <div className="space-y-2">
              {item.actionItems.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-white border border-[#EAEBF0] hover:border-[#10B981]/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={act.done}
                      onChange={() => toggleTask(item.id, act.id)}
                      className="w-4 h-4 mt-0.5 rounded text-[#10B981] focus:ring-[#10B981] border-slate-300 cursor-pointer"
                    />
                    <span className={`text-xs font-medium text-slate-800 ${act.done ? 'line-through text-slate-400' : ''}`}>
                      <HighlightedText text={act.text} query={searchQuery} />
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {act.priority && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {act.priority}
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(item.id, act.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add action form */}
            <form onSubmit={handleAddAction} className="flex items-center space-x-2">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Add derived action item..."
                className="flex-1 px-3 py-1.5 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 font-medium"
              />
              <button
                type="submit"
                disabled={!newActionText.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#0B0F19] text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
              >
                Add Action
              </button>
            </form>
          </div>

          {/* Connected Semantic Links */}
          {item.connections && item.connections.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                <Network className="w-4 h-4 text-[#4C9CFF]" />
                <span>Connected Ideas ({item.connections.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.connections.map((conn, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedItemId(conn.targetId)}
                    className="p-3.5 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF] hover:shadow-xs transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#4C9CFF]">
                        {conn.type}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#7B61FF] transition-colors" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#7B61FF]">
                      <HighlightedText text={conn.targetTitle || ''} query={searchQuery} />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      "<HighlightedText text={conn.reason} query={searchQuery} />"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics and Entities */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 mr-1">Topics:</span>
              {(item.topics || []).map((t, idx) => {
                const isMatch = searchAnalysis.matchedTopics.includes(t);
                return (
                  <span 
                    key={idx} 
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                      isMatch ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'bg-[#F0EEFF] text-[#7B61FF]'
                    }`}
                  >
                    <HighlightedText text={t} query={searchQuery} />
                  </span>
                );
              })}
            </div>

            {item.entities && item.entities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Entities:</span>
                {item.entities.map((e, idx) => {
                  const isMatch = searchAnalysis.matchedEntities.includes(e);
                  return (
                    <span 
                      key={idx} 
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                        isMatch ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : 'bg-[#F6F7FC] text-slate-600'
                      }`}
                    >
                      <HighlightedText text={e} query={searchQuery} />
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

