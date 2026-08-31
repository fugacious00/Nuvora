import React from 'react';
import { 
  Lightbulb, 
  Network, 
  CheckSquare, 
  KanbanSquare, 
  Clock, 
  Compass, 
  Flame, 
  RefreshCw,
  BookOpen,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem, MemoryInsight } from '../../types';
import { DailyDigest } from '../home/DailyDigest';
import { WeeklyActivityChart } from '../home/WeeklyActivityChart';

export const HomeView: React.FC = () => {
  const { 
    items, 
    projects, 
    memoryInsights, 
    setSelectedItemId, 
    setActiveTab, 
    setIsCaptureOpen, 
    toggleTask,
    totalConnectionsCount,
    activeProjectsCount,
    openTasksCount,
    runGraphConnectionAnalysis,
    isAnalyzingConnections
  } = useKnowledge();

  // Recently accessed / modified notes
  const recentItems = [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Outstanding high-priority or immediate action items
  const immediateTasks = items
    .flatMap((item) => item.actionItems)
    .filter((task) => !task.done)
    .slice(0, 4);

  // Discover pairs of connected items
  const connectedPairs: { source: KnowledgeItem; target: KnowledgeItem; reason: string; type: string }[] = [];
  for (const item of items) {
    if (item.connections && item.connections.length > 0) {
      for (const conn of item.connections.slice(0, 1)) {
        const target = items.find((i) => i.id === conn.targetId);
        if (target && !connectedPairs.some((p) => p.source.id === target.id && p.target.id === item.id)) {
          connectedPairs.push({
            source: item,
            target,
            reason: conn.reason,
            type: conn.type,
          });
        }
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* 1. Morning Daily Digest & Executive Briefing */}
      <DailyDigest />

      {/* 2. Weekly Knowledge Velocity Chart */}
      <WeeklyActivityChart items={items} />

      {/* 3. Memory Sparks & Forgotten Ideas (Remember Over Time) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-[#FFB86B]" />
            <h2 className="text-base font-semibold text-slate-900">Memory Sparks & Forgotten Ideas</h2>
          </div>
          <span className="text-xs text-slate-500">
            Nuvora surfaces high-value thoughts from your archive
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memoryInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-sm transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFF6EE] text-[#FF9E3B]">
                    {insight.type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(insight.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>

              {insight.relatedItemIds.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {insight.relatedItemIds.length} related notes
                  </span>
                  <button
                    onClick={() => {
                      if (insight.relatedItemIds[0]) {
                        setSelectedItemId(insight.relatedItemIds[0]);
                      }
                    }}
                    className="text-xs text-[#7B61FF] font-semibold flex items-center space-x-1 hover:underline"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Discovered Semantic Connections (Connect Naturally) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-[#4C9CFF]" />
            <h2 className="text-base font-semibold text-slate-900">Discovered Semantic Connections</h2>
          </div>
          <button
            onClick={runGraphConnectionAnalysis}
            disabled={isAnalyzingConnections}
            className="flex items-center space-x-1 text-xs text-[#7B61FF] font-medium hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingConnections ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingConnections ? 'Discovering Connections...' : 'Scan New Connections'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectedPairs.slice(0, 2).map((pair, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#4C9CFF]/40 hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#4C9CFF]">
                  {pair.type} relationship
                </span>
                <span className="text-xs text-emerald-600 font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Verified Link</span>
                </span>
              </div>

              {/* Linked items cards */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedItemId(pair.source.id)}
                  className="flex-1 p-2.5 rounded-xl bg-[#F6F7FC] border border-[#E4E6F0] hover:bg-white transition-colors text-left truncate"
                >
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Source Note</div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{pair.source.title}</div>
                </button>

                <div className="w-6 h-6 rounded-full bg-[#F0EEFF] text-[#7B61FF] flex items-center justify-center flex-shrink-0">
                  <Network className="w-3 h-3" />
                </div>

                <button
                  onClick={() => setSelectedItemId(pair.target.id)}
                  className="flex-1 p-2.5 rounded-xl bg-[#F6F7FC] border border-[#E4E6F0] hover:bg-white transition-colors text-left truncate"
                >
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Connected Note</div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{pair.target.title}</div>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-[#FAFBFD] p-2.5 rounded-xl border border-slate-100">
                "{pair.reason}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Two Column Grid: Continue Where You Left Off & Immediate Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Continue Where You Left Off */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="text-base font-semibold text-slate-900">Continue Where You Left Off</h2>
            </div>
            <button
              onClick={() => setActiveTab('knowledge')}
              className="text-xs text-[#7B61FF] font-semibold hover:underline"
            >
              All knowledge ({items.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className="p-3.5 rounded-xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-xs cursor-pointer transition-all flex items-start justify-between space-x-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                      {item.type}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#7B61FF] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.rawSummary || item.content}
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 pt-1">
                    <span>{(item.topics || []).slice(0, 2).join(', ')}</span>
                    {item.connections?.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#7B61FF] font-medium">
                          {item.connections.length} connections
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </section>

        {/* Right: Turn Knowledge into Action (Immediate Tasks) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-[#10B981]" />
              <h2 className="text-base font-semibold text-slate-900">Knowledge In Action</h2>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-[#7B61FF] font-semibold hover:underline"
            >
              View all tasks ({openTasksCount})
            </button>
          </div>

          <div className="space-y-2.5">
            {immediateTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-[#EAEBF0] text-center space-y-1">
                <p className="text-xs text-slate-500">All captured action items are currently completed.</p>
              </div>
            ) : (
              immediateTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl bg-white border border-[#EAEBF0] hover:border-[#10B981]/40 transition-all flex items-start space-x-3"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => task.originItemId && toggleTask(task.originItemId, task.id)}
                    className="w-4 h-4 mt-0.5 rounded text-[#10B981] focus:ring-[#10B981] border-slate-300 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium text-slate-800 ${task.done ? 'line-through text-slate-400' : ''}`}>
                      {task.text}
                    </p>
                    {task.originItemTitle && (
                      <button
                        onClick={() => task.originItemId && setSelectedItemId(task.originItemId)}
                        className="text-[10px] text-slate-400 hover:text-[#7B61FF] truncate block mt-0.5 text-left"
                      >
                        From: {task.originItemTitle}
                      </button>
                    )}
                  </div>
                  {task.priority && (
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
