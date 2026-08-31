import React, { useState } from 'react';
import { 
  KanbanSquare, 
  Plus, 
  CheckSquare, 
  BookOpen, 
  Calendar, 
  Tag, 
  ChevronRight, 
  ArrowRight, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { Project } from '../../types';

export const ProjectsView: React.FC = () => {
  const { 
    projects, 
    items, 
    addProject, 
    updateProject, 
    deleteProject, 
    setSelectedItemId,
    selectedProjectId,
    setSelectedProjectId,
    toggleTask,
    setIsCaptureOpen
  } = useKnowledge();

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addProject({
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: 'active',
      color: '#7B61FF',
      targetDate: newTargetDate || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      linkedItemIds: [],
    });

    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
    setNewTags('');
    setIsCreatingProject(false);
  };

  const projectStatuses: { id: Project['status']; label: string; color: string }[] = [
    { id: 'active', label: 'Active Outcomes', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'planning', label: 'In Planning', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { id: 'completed', label: 'Completed Outcomes', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'abandoned', label: 'Archived / Abandoned', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Active Projects & Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Turn your captured knowledge, insights, and mental models into realized outcomes.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingProject(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* New Project Creation Form Modal / Card */}
      {isCreatingProject && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-white border border-[#7B61FF]/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Define New Active Project</h3>
            <button
              type="button"
              onClick={() => setIsCreatingProject(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Project Title (e.g. Architect Cost Estimator MVP)"
              required
              className="px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 font-medium"
            />
            <input
              type="date"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              className="px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl text-slate-600"
            />
          </div>

          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Outcome summary and success criteria..."
            rows={2}
            className="w-full p-3 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 resize-none"
          />

          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags comma-separated (e.g. Architecture, SaaS, Pricing)"
            className="w-full px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl text-slate-700"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreatingProject(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-aurora text-white rounded-lg shadow-sm hover:opacity-95"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Projects List / Board */}
      <div className="space-y-8">
        {projectStatuses.map((statusGroup) => {
          const groupProjects = projects.filter((p) => p.status === statusGroup.id);
          if (groupProjects.length === 0 && statusGroup.id !== 'active') return null;

          return (
            <div key={statusGroup.id} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusGroup.color}`}>
                  {statusGroup.label} ({groupProjects.length})
                </span>
              </div>

              {groupProjects.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-[#EAEBF0] text-xs text-slate-400">
                  No active projects currently in this state.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupProjects.map((project) => {
                    // Find all items associated with this project
                    const projectItems = items.filter((i) => i.projectId === project.id);
                    const allProjectTasks = projectItems.flatMap((i) => i.actionItems);
                    const openTasks = allProjectTasks.filter((t) => !t.done);

                    return (
                      <div
                        key={project.id}
                        className="p-5 rounded-2xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: project.color || '#7B61FF' }}
                              />
                              <h3 className="text-sm font-bold text-slate-900">{project.title}</h3>
                            </div>

                            {project.targetDate && (
                              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Target: {new Date(project.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {project.description}
                          </p>

                          {/* Tag chips */}
                          {project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {project.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F6F7FC] text-slate-600">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Linked Notes & Tasks */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-100">
                          {/* Associated Notes count */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-[#7B61FF]" />
                              <span>{projectItems.length} Connected Notes</span>
                            </span>
                            <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>{openTasks.length} Open Actions</span>
                            </span>
                          </div>

                          {/* Quick list of notes */}
                          {projectItems.length > 0 && (
                            <div className="space-y-1">
                              {projectItems.slice(0, 2).map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => setSelectedItemId(item.id)}
                                  className="w-full flex items-center justify-between p-2 rounded-lg bg-[#FAFBFD] hover:bg-[#F0EEFF] text-left transition-colors text-xs text-slate-700 hover:text-[#7B61FF]"
                                >
                                  <span className="truncate">{item.title}</span>
                                  <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status Change selector */}
                        <div className="pt-2 flex items-center justify-between text-xs">
                          <select
                            value={project.status}
                            onChange={(e) => updateProject(project.id, { status: e.target.value as any })}
                            className="text-[11px] px-2 py-1 bg-[#F6F7FC] border border-[#E4E6F0] rounded-lg text-slate-700 font-medium"
                          >
                            <option value="active">Active</option>
                            <option value="planning">In Planning</option>
                            <option value="completed">Completed</option>
                            <option value="abandoned">Archived</option>
                          </select>

                          <button
                            onClick={() => setIsCaptureOpen(true)}
                            className="text-xs text-[#7B61FF] font-semibold hover:underline flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Capture note to project</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
