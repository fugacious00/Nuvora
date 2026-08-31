import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  KanbanSquare,
  Sparkles
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { ActionItem } from '../../types';

export const TasksView: React.FC = () => {
  const { 
    items, 
    toggleTask, 
    addTask, 
    deleteTask, 
    setSelectedItemId, 
    projects 
  } = useKnowledge();

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'open' | 'completed' | 'all'>('open');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Aggregate all action items from all notes
  const allTasks: ActionItem[] = useMemo(() => {
    return items.flatMap((item) => item.actionItems);
  }, [items]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (filterStatus === 'open' && task.done) return false;
      if (filterStatus === 'completed' && !task.done) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
      return true;
    });
  }, [allTasks, filterStatus, filterPriority, selectedProjectId]);

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || items.length === 0) return;
    addTask(items[0].id, newTaskText.trim(), newTaskPriority);
    setNewTaskText('');
  };

  const openCount = allTasks.filter((t) => !t.done).length;
  const completedCount = allTasks.filter((t) => t.done).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Actions & Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Every commitment and next step discovered from your notes, meetings, and research.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            {openCount} Open
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* Quick Add Task Input */}
      <form onSubmit={handleAddNewTask} className="p-3 bg-white rounded-2xl border border-[#EAEBF0] shadow-xs flex items-center space-x-2">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a new action item..."
          className="flex-1 px-3 py-1.5 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 font-medium"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          className="px-2.5 py-1.5 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl text-slate-700"
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <button
          type="submit"
          disabled={!newTaskText.trim()}
          className="px-4 py-1.5 rounded-xl bg-aurora text-white text-xs font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity"
        >
          Add Action
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 bg-[#F6F7FC] p-1 rounded-xl border border-[#E4E6F0]">
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'open' ? 'bg-white shadow-2xs text-[#7B61FF] font-semibold' : 'text-slate-600'
            }`}
          >
            Open ({openCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'completed' ? 'bg-white shadow-2xs text-[#7B61FF] font-semibold' : 'text-slate-600'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'all' ? 'bg-white shadow-2xs text-[#7B61FF] font-semibold' : 'text-slate-600'
            }`}
          >
            All ({allTasks.length})
          </button>
        </div>

        {/* Priority & Project dropdowns */}
        <div className="flex items-center space-x-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1 text-xs bg-white border border-[#E4E6F0] rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1 text-xs bg-white border border-[#E4E6F0] rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#EAEBF0] space-y-2">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No action items found</h3>
          <p className="text-xs text-slate-500">Capture notes or meetings to let Gemini extract actionable commitments.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const originItem = items.find((i) => i.id === task.originItemId);
            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#10B981]/40 hover:shadow-xs transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => task.originItemId && toggleTask(task.originItemId, task.id)}
                    className="w-4 h-4 mt-0.5 rounded text-[#10B981] focus:ring-[#10B981] border-slate-300 cursor-pointer"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className={`text-xs sm:text-sm font-medium text-slate-800 leading-snug ${task.done ? 'line-through text-slate-400' : ''}`}>
                      {task.text}
                    </p>

                    {/* Origin Note reference */}
                    {task.originItemTitle && (
                      <button
                        onClick={() => task.originItemId && setSelectedItemId(task.originItemId)}
                        className="text-[11px] text-slate-400 hover:text-[#7B61FF] truncate flex items-center space-x-1 transition-colors text-left"
                      >
                        <span className="font-semibold text-slate-500">From capture:</span>
                        <span className="truncate max-w-sm">{task.originItemTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {task.priority && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
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

                  {task.originItemId && (
                    <button
                      onClick={() => deleteTask(task.originItemId!, task.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
