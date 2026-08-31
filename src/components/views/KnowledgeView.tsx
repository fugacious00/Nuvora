import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar, 
  Sparkles, 
  Plus, 
  Tag, 
  Network, 
  CheckSquare, 
  ExternalLink, 
  Clock, 
  Check, 
  X,
  FileText,
  SlidersHorizontal,
  Bookmark,
  Pin,
  Quote,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  Eye
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { ItemType, ItemStatus, KnowledgeItem } from '../../types';
import { 
  analyzeItemSearchMatch, 
  HighlightedText, 
  MatchAnalysis, 
  MatchLocationType 
} from '../../utils/searchHighlight';

interface KnowledgeViewProps {
  onOpenTransform: (selectedItems: KnowledgeItem[]) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ onOpenTransform }) => {
  const { 
    items, 
    searchQuery, 
    setSearchQuery, 
    selectedTopic, 
    setSelectedTopic, 
    selectedTypeFilter, 
    setSelectedTypeFilter, 
    selectedStatusFilter, 
    setSelectedStatusFilter,
    selectedProjectId,
    setSelectedProjectId,
    selectedCollectionId,
    setSelectedCollectionId,
    projects, 
    collections, 
    setSelectedItemId, 
    setIsCaptureOpen,
    pinItem,
    allTopics 
  } = useKnowledge();

  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'timeline'>('grid');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [expandedSnippetsItemIds, setExpandedSnippetsItemIds] = useState<string[]>([]);
  const [searchLocationFilter, setSearchLocationFilter] = useState<'all' | MatchLocationType>('all');

  // Compute search match analysis for all items
  const itemsWithAnalysis = useMemo(() => {
    return items.map((item) => {
      const analysis = analyzeItemSearchMatch(item, searchQuery);
      return { item, analysis };
    });
  }, [items, searchQuery]);

  // Aggregate search match location counts
  const matchLocationCounts = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const counts = {
      all: 0,
      title: 0,
      content: 0,
      summary: 0,
      topic: 0,
      entity: 0,
      task: 0,
      connection: 0,
    };

    itemsWithAnalysis.forEach(({ analysis }) => {
      if (analysis.hasMatch) {
        counts.all += 1;
        if (analysis.matchesTitle) counts.title += 1;
        if (analysis.matchesContent) counts.content += 1;
        if (analysis.matchesSummary) counts.summary += 1;
        if (analysis.matchedTopics.length > 0) counts.topic += 1;
        if (analysis.matchedEntities.length > 0) counts.entity += 1;
        if (analysis.matchedActions.length > 0) counts.task += 1;
        if (analysis.matchedConnections.length > 0) counts.connection += 1;
      }
    });

    return counts;
  }, [itemsWithAnalysis, searchQuery]);

  // Filter & Sort items by relevance
  const filteredItemsWithAnalysis = useMemo(() => {
    let result = itemsWithAnalysis.filter(({ item, analysis }) => {
      // Search match filter
      if (searchQuery.trim()) {
        if (!analysis.hasMatch) return false;

        // Sub-filter by specific match location if user clicked a filter chip
        if (searchLocationFilter !== 'all') {
          if (!analysis.locations.includes(searchLocationFilter)) {
            return false;
          }
        }
      }

      // Topic filter
      if (selectedTopic && !(item.topics || []).includes(selectedTopic)) {
        return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
        return false;
      }

      // Project filter
      if (selectedProjectId && item.projectId !== selectedProjectId) {
        return false;
      }

      // Collection filter
      if (selectedCollectionId && item.collectionId !== selectedCollectionId) {
        return false;
      }

      return true;
    });

    // If searching, sort by relevance score
    if (searchQuery.trim()) {
      result.sort((a, b) => b.analysis.score - a.analysis.score);
    }

    return result;
  }, [
    itemsWithAnalysis, 
    searchQuery, 
    searchLocationFilter,
    selectedTopic, 
    selectedTypeFilter, 
    selectedStatusFilter, 
    selectedProjectId, 
    selectedCollectionId
  ]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSnippetExpansion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSnippetsItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTransformSelected = () => {
    const selected = items.filter((i) => selectedItemIds.includes(i.id));
    if (selected.length > 0) {
      onOpenTransform(selected);
    }
  };

  const itemTypes: { id: ItemType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Formats' },
    { id: 'note', label: 'Notes' },
    { id: 'idea', label: 'Ideas' },
    { id: 'document', label: 'Documents' },
    { id: 'voice', label: 'Voice' },
    { id: 'web', label: 'Web & Articles' },
    { id: 'meeting', label: 'Meetings' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Connected Knowledge Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, filter, and synthesize across your {items.length} interconnected knowledge captures.
          </p>
        </div>

        {/* View mode switcher & Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Multi-selection action bar */}
          {selectedItemIds.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F0EEFF] border border-[#7B61FF]/30">
              <span className="text-xs font-semibold text-[#7B61FF]">
                {selectedItemIds.length} selected
              </span>
              <button
                onClick={handleTransformSelected}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-aurora text-white text-xs font-semibold shadow-xs hover:opacity-95"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Synthesize</span>
              </button>
              <button
                onClick={() => setSelectedItemIds([])}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-[#7B61FF]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-[#7B61FF]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-white shadow-2xs text-[#7B61FF]' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Timeline View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCaptureOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Capture</span>
          </button>
        </div>
      </div>

      {/* 2. Enhanced Search Insight Banner (shows when query is active) */}
      {searchQuery.trim() && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF8FF] via-white to-[#F0EEFF]/40 border border-[#E4DEFF] shadow-xs space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#7B61FF] text-white flex items-center justify-center shadow-xs">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    Search Results for:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FEEA9F] text-[#543805] font-semibold text-xs font-mono">
                    "{searchQuery}"
                  </span>
                  <span className="text-xs text-slate-500">
                    ({filteredItemsWithAnalysis.length} {filteredItemsWithAnalysis.length === 1 ? 'match' : 'matches'})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Highlighted snippets below display exact sentences and context where your search term matched.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchLocationFilter('all');
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E4E6F0] hover:border-slate-300 text-xs font-medium text-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Clear Search</span>
              </button>
            </div>
          </div>

          {/* Match Location Filter Chips */}
          {matchLocationCounts && matchLocationCounts.all > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 text-xs border-t border-slate-100/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Filter by Match Source:
              </span>

              <button
                onClick={() => setSearchLocationFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  searchLocationFilter === 'all'
                    ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                    : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Sources ({matchLocationCounts.all})
              </button>

              {matchLocationCounts.content > 0 && (
                <button
                  onClick={() => setSearchLocationFilter('content')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    searchLocationFilter === 'content'
                      ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In Document Content ({matchLocationCounts.content})
                </button>
              )}

              {matchLocationCounts.title > 0 && (
                <button
                  onClick={() => setSearchLocationFilter('title')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    searchLocationFilter === 'title'
                      ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In Title ({matchLocationCounts.title})
                </button>
              )}

              {matchLocationCounts.topic > 0 && (
                <button
                  onClick={() => setSearchLocationFilter('topic')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    searchLocationFilter === 'topic'
                      ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In Topics ({matchLocationCounts.topic})
                </button>
              )}

              {matchLocationCounts.task > 0 && (
                <button
                  onClick={() => setSearchLocationFilter('task')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    searchLocationFilter === 'task'
                      ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In Action Tasks ({matchLocationCounts.task})
                </button>
              )}

              {matchLocationCounts.summary > 0 && (
                <button
                  onClick={() => setSearchLocationFilter('summary')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    searchLocationFilter === 'summary'
                      ? 'bg-[#7B61FF] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  In AI Summary ({matchLocationCounts.summary})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Filter Bar (Type tabs + Topic Tags + Dropdowns) */}
      <div className="space-y-3">
        {/* Type pills & Active Filter Clear */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center space-x-1.5">
            {itemTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeFilter(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTypeFilter === type.id
                    ? 'bg-[#0B0F19] text-white font-semibold shadow-2xs'
                    : 'bg-white border border-[#E4E6F0] text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Clear all active filters if any active */}
          {(selectedTopic || selectedTypeFilter !== 'all' || selectedProjectId || selectedCollectionId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTopic(null);
                setSelectedTypeFilter('all');
                setSelectedProjectId(null);
                setSelectedCollectionId(null);
                setSearchQuery('');
                setSearchLocationFilter('all');
              }}
              className="text-xs text-rose-600 hover:underline flex items-center space-x-1 whitespace-nowrap flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Topic Pills Carousel */}
        {allTopics.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-1 flex items-center space-x-1">
              <Tag className="w-3 h-3" />
              <span>Topics:</span>
            </span>
            {allTopics.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(isSelected ? null : topic)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#F0EEFF] text-[#7B61FF] border border-[#7B61FF]/40 font-semibold'
                      : 'bg-white text-slate-600 border border-[#E4E6F0] hover:border-slate-300'
                  }`}
                >
                  <HighlightedText text={topic} query={searchQuery} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Items View Rendering (Grid, Table, or Timeline) */}
      {filteredItemsWithAnalysis.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAEBF0] space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {searchQuery.trim() ? `No knowledge captures match "${searchQuery}"` : 'No knowledge captures found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery.trim() 
              ? 'Try a broader keyword, check for spelling, or clear your topic/type filters.' 
              : 'Try adjusting your filters or capture a new note.'}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchLocationFilter('all');
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0B0F19] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search Query</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* ==================== GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItemsWithAnalysis.map(({ item, analysis }) => {
            const isSelected = selectedItemIds.includes(item.id);
            const isSnippetsExpanded = expandedSnippetsItemIds.includes(item.id);
            const isSearchActive = Boolean(searchQuery.trim());

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                  isSelected
                    ? 'border-[#7B61FF] ring-2 ring-[#7B61FF]/20 shadow-md'
                    : isSearchActive && analysis.hasMatch
                    ? 'border-[#E4DEFF] hover:border-[#7B61FF] hover:shadow-sm'
                    : 'border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-xs'
                }`}
              >
                {/* Top bar: Type + Status + Match badges + Multi-select checkbox */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                      {item.type}
                    </span>
                    {item.status === 'pinned' && (
                      <Pin className="w-3 h-3 text-[#7B61FF] fill-current" />
                    )}

                    {/* Search match location pills on card header */}
                    {isSearchActive && (
                      <div className="flex items-center space-x-1">
                        {analysis.matchesTitle && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Title Match
                          </span>
                        )}
                        {analysis.matchesContent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F0EEFF] text-[#7B61FF] border border-[#E4DEFF]">
                            Content ({analysis.totalOccurrences} hits)
                          </span>
                        )}
                        {analysis.matchedTopics.length > 0 && !analysis.matchesTitle && !analysis.matchesContent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Topic Match
                          </span>
                        )}
                        {analysis.matchedActions.length > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            Task Match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Selection checkbox */}
                    <button
                      onClick={(e) => toggleSelect(item.id, e)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#7B61FF] border-[#7B61FF] text-white'
                          : 'border-slate-300 opacity-0 group-hover:opacity-100 hover:border-[#7B61FF]'
                      }`}
                      aria-label="Select note"
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Title & Highlighted Search Snippets */}
                <div className="space-y-2.5 flex-1">
                  {/* Highlighted Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#7B61FF] transition-colors leading-snug">
                    <HighlightedText text={item.title} query={searchQuery} />
                  </h3>

                  {/* 🌟 ENHANCED SEARCH SNIPPET: Show exactly why this matched */}
                  {isSearchActive && analysis.primarySnippet ? (
                    <div className="space-y-2">
                      {/* Highlighted context quotation box */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAF8FF] to-[#F5F6FF] border border-[#E4DEFF] text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#7B61FF]">
                          <span className="flex items-center space-x-1">
                            <Quote className="w-3 h-3 text-[#7B61FF]" />
                            <span>{analysis.primarySnippet.label}</span>
                          </span>
                          {analysis.primarySnippet.occurrences > 1 && (
                            <span className="text-slate-500 font-mono text-[9px]">
                              {analysis.primarySnippet.occurrences} matches in note
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          <HighlightedText 
                            text={analysis.primarySnippet.text} 
                            query={searchQuery} 
                          />
                        </p>
                      </div>

                      {/* Expandable secondary snippets if multiple paragraphs matched */}
                      {analysis.allContentSnippets.length > 1 && (
                        <div className="space-y-1.5">
                          <button
                            type="button"
                            onClick={(e) => toggleSnippetExpansion(item.id, e)}
                            className="text-[11px] text-[#7B61FF] font-semibold hover:underline flex items-center space-x-1 pt-0.5"
                          >
                            {isSnippetsExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Hide additional match snippets</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>Show {analysis.allContentSnippets.length - 1} more match excerpt{analysis.allContentSnippets.length > 2 ? 's' : ''}</span>
                              </>
                            )}
                          </button>

                          {isSnippetsExpanded && (
                            <div className="space-y-1.5 pl-2 border-l-2 border-[#7B61FF]/30 pt-1 animate-in fade-in">
                              {analysis.allContentSnippets.slice(1).map((extraSnippet, sIdx) => (
                                <div 
                                  key={sIdx}
                                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed"
                                >
                                  <HighlightedText text={extraSnippet} query={searchQuery} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Matched Action Item highlight */}
                      {analysis.matchedActions.length > 0 && analysis.primarySnippet.location !== 'task' && (
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-start space-x-1.5">
                          <CheckSquare className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-[10px] uppercase text-emerald-700 block">Matched Action Task:</span>
                            <HighlightedText text={analysis.matchedActions[0].text} query={searchQuery} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Note Summary / Excerpt when no query is active */
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-normal">
                      {item.rawSummary || item.content}
                    </p>
                  )}
                </div>

                {/* Topics & Entities */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {(item.topics || []).slice(0, 3).map((topic, i) => {
                      const isMatchedTopic = analysis.matchedTopics.includes(topic);
                      return (
                        <span
                          key={i}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                            isMatchedTopic
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : 'bg-[#F6F7FC] text-slate-600'
                          }`}
                        >
                          <HighlightedText text={topic} query={searchQuery} />
                        </span>
                      );
                    })}
                  </div>

                  {/* Bottom metrics: Connections count, tasks count, date */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center space-x-3">
                      {item.connections?.length > 0 && (
                        <span className="flex items-center space-x-1 text-[#7B61FF] font-medium">
                          <Network className="w-3 h-3" />
                          <span>{item.connections.length} links</span>
                        </span>
                      )}
                      {item.actionItems?.length > 0 && (
                        <span className="flex items-center space-x-1 text-slate-500">
                          <CheckSquare className="w-3 h-3" />
                          <span>{item.actionItems.length} tasks</span>
                        </span>
                      )}
                    </div>

                    <span>
                      {new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* ==================== TABLE VIEW ==================== */
        <div className="bg-white rounded-2xl border border-[#EAEBF0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFBFD] border-b border-[#EAEBF0] text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  <th className="py-3 px-4 w-10">Select</th>
                  <th className="py-3 px-4">Title & Search Match Snippet</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Topics</th>
                  <th className="py-3 px-4">Connections</th>
                  <th className="py-3 px-4">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItemsWithAnalysis.map(({ item, analysis }) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className="hover:bg-[#F9FAFD] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4" onClick={(e) => toggleSelect(item.id, e)}>
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => {}}
                        className="rounded text-[#7B61FF] focus:ring-[#7B61FF] border-slate-300"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-slate-900 truncate hover:text-[#7B61FF] flex items-center space-x-2">
                        <HighlightedText text={item.title} query={searchQuery} />
                        {searchQuery.trim() && analysis.matchesTitle && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            Title Hit
                          </span>
                        )}
                      </div>

                      {/* Excerpt with Highlighted Snippet */}
                      <div className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                        {searchQuery.trim() && analysis.primarySnippet ? (
                          <div className="flex items-start space-x-1">
                            <span className="text-[9px] font-bold uppercase text-[#7B61FF] px-1 rounded bg-[#F0EEFF] flex-shrink-0 mt-0.5">
                              {analysis.primarySnippet.location}
                            </span>
                            <span>
                              <HighlightedText text={analysis.primarySnippet.text} query={searchQuery} />
                            </span>
                          </div>
                        ) : (
                          item.rawSummary || item.content
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.topics || []).slice(0, 2).map((t, idx) => {
                          const isMatch = analysis.matchedTopics.includes(t);
                          return (
                            <span 
                              key={idx} 
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                isMatch ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-[#F6F7FC] text-slate-600'
                              }`}
                            >
                              <HighlightedText text={t} query={searchQuery} />
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.connections?.length > 0 ? (
                        <span className="text-[#7B61FF] font-medium flex items-center space-x-1">
                          <Network className="w-3 h-3" />
                          <span>{item.connections.length}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== TIMELINE VIEW ==================== */
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAEBF0]">
          {filteredItemsWithAnalysis.map(({ item, analysis }) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className="relative p-5 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
            >
              {/* Timeline marker node */}
              <div className="absolute -left-[27px] top-6 w-3 h-3 rounded-full bg-white border-2 border-[#7B61FF] group-hover:scale-125 transition-transform" />

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100">
                  {item.type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#7B61FF] transition-colors">
                <HighlightedText text={item.title} query={searchQuery} />
              </h3>

              {searchQuery.trim() && analysis.primarySnippet ? (
                <div className="p-3 rounded-xl bg-[#FAF8FF] border border-[#E4DEFF] text-xs space-y-1">
                  <div className="text-[10px] font-bold text-[#7B61FF] flex items-center space-x-1">
                    <Quote className="w-3 h-3 text-[#7B61FF]" />
                    <span>{analysis.primarySnippet.label}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    <HighlightedText text={analysis.primarySnippet.text} query={searchQuery} />
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.rawSummary || item.content}
                </p>
              )}

              {(item.topics || []).length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.topics.map((t, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        analysis.matchedTopics.includes(t) ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-[#F6F7FC] text-slate-600'
                      }`}
                    >
                      <HighlightedText text={t} query={searchQuery} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

