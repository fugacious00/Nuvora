import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sun, 
  Sunrise, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  KanbanSquare, 
  BookOpen, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  RefreshCw, 
  Flame, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Copy, 
  Check, 
  ExternalLink,
  Target,
  AlertCircle,
  Lightbulb,
  Layers,
  Filter,
  Plus,
  Trash2,
  Trophy,
  Award,
  Zap,
  TrendingUp,
  History,
  RotateCcw
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem, Project, ActionItem } from '../../types';
import { aiService, DailyDigestResult } from '../../services/aiService';

interface DailyGoalMilestone {
  id: string;
  title: string;
  category: 'captures' | 'tasks' | 'synthesis' | 'custom';
  current: number;
  target: number;
  unit: string;
  completed: boolean;
  isAutoTracked?: boolean;
}

export const DailyDigest: React.FC = () => {
  const { 
    items, 
    projects, 
    currentUser, 
    setSelectedItemId, 
    setSelectedProjectId, 
    setActiveTab, 
    setIsCaptureOpen, 
    toggleTask 
  } = useKnowledge();

  const [isGenerating, setIsGenerating] = useState(false);
  const [digestData, setDigestData] = useState<DailyDigestResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Calendar toggle & Date selector state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Real today date string in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  // Month navigation in calendar popover
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => new Date());

  const isToday = selectedDateStr === todayStr;
  const userName = currentUser?.name || 'Explorer';

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Map of activity per date across all captured items in the user's knowledge history
  const activityByDate = useMemo(() => {
    const map: Record<string, { itemsCount: number; tasksCount: number; titles: string[] }> = {};
    items.forEach((item) => {
      const createdDate = new Date(item.createdAt).toISOString().split('T')[0];
      if (!map[createdDate]) {
        map[createdDate] = { itemsCount: 0, tasksCount: 0, titles: [] };
      }
      map[createdDate].itemsCount += 1;
      if (map[createdDate].titles.length < 3) {
        map[createdDate].titles.push(item.title);
      }
      if (item.actionItems && item.actionItems.length > 0) {
        map[createdDate].tasksCount += item.actionItems.length;
      }
    });
    return map;
  }, [items]);

  // Unique list of historical dates with knowledge captures, sorted newest first
  const activeHistoryDates = useMemo(() => {
    return Object.keys(activityByDate).sort((a, b) => b.localeCompare(a));
  }, [activityByDate]);

  // Date parsing for the selected date
  const selectedDateObj = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateStr]);

  const selectedDateFormatted = useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDateObj]);

  const selectedDateShort = useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, [selectedDateObj]);

  // Compute items captured on or before selected date (historical context)
  const itemsOnSelectedDate = useMemo(() => {
    return items.filter((i) => {
      const d = new Date(i.createdAt).toISOString().split('T')[0];
      return d === selectedDateStr;
    });
  }, [items, selectedDateStr]);

  const itemsCapturedOnSelectedDate = itemsOnSelectedDate.length;

  // Items active up to the selected date
  const itemsActiveUpToDate = useMemo(() => {
    const endOfDayTimestamp = new Date(`${selectedDateStr}T23:59:59.999Z`).getTime();
    return items.filter((i) => new Date(i.createdAt).getTime() <= endOfDayTimestamp);
  }, [items, selectedDateStr]);

  // Compute tasks done on or active as of the selected date
  const tasksCompletedOnSelectedDate = useMemo(() => {
    return itemsActiveUpToDate
      .flatMap((item) => item.actionItems || [])
      .filter((task) => task.done).length;
  }, [itemsActiveUpToDate]);

  // Compute greeting according to time of day and historical date context
  const getGreeting = () => {
    if (!isToday) {
      return `Briefing Archive • ${selectedDateShort}`;
    }
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${userName}`;
    if (hour < 17) return `Good afternoon, ${userName}`;
    return `Good evening, ${userName}`;
  };

  // Top 4 recent knowledge items relative to the selected date
  const recentItems = useMemo(() => {
    return [...itemsActiveUpToDate]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 4);
  }, [itemsActiveUpToDate]);

  // Pending action items relative to selected date
  const pendingTasks = useMemo(() => {
    return itemsActiveUpToDate
      .flatMap((item) => item.actionItems || [])
      .filter((task) => !task.done)
      .sort((a, b) => {
        const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const weightA = priorityWeights[a.priority || 'medium'] || 2;
        const weightB = priorityWeights[b.priority || 'medium'] || 2;
        return weightB - weightA;
      })
      .slice(0, 5);
  }, [itemsActiveUpToDate]);

  // Active / urgent projects
  const activeProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'active' || p.status === 'planning')
      .sort((a, b) => {
        if (a.targetDate && b.targetDate) {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        return a.targetDate ? -1 : 1;
      })
      .slice(0, 3);
  }, [projects]);

  // Daily Goal Milestones State with LocalStorage Persistence per Date
  const [goals, setGoals] = useState<DailyGoalMilestone[]>(() => {
    const stored = localStorage.getItem(`nuvora_daily_milestones_${selectedDateStr}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'goal-captures',
        title: 'Capture Fresh Insights',
        category: 'captures',
        current: itemsCapturedOnSelectedDate,
        target: 3,
        unit: 'notes',
        completed: itemsCapturedOnSelectedDate >= 3,
        isAutoTracked: true,
      },
      {
        id: 'goal-tasks',
        title: 'Clear Pending Actions',
        category: 'tasks',
        current: tasksCompletedOnSelectedDate,
        target: 4,
        unit: 'tasks',
        completed: tasksCompletedOnSelectedDate >= 4,
        isAutoTracked: true,
      },
      {
        id: 'goal-synthesis',
        title: isToday ? 'Morning AI Synthesis' : 'Daily AI Retrospective',
        category: 'synthesis',
        current: 0,
        target: 1,
        unit: 'briefing',
        completed: false,
        isAutoTracked: false,
      },
      {
        id: 'goal-project',
        title: 'Advance Core Project Milestone',
        category: 'custom',
        current: 0,
        target: 1,
        unit: 'deliverable',
        completed: false,
        isAutoTracked: false,
      },
    ];
  });

  // When selected date changes, load saved milestones and cached digest for that date
  useEffect(() => {
    const storedGoals = localStorage.getItem(`nuvora_daily_milestones_${selectedDateStr}`);
    if (storedGoals) {
      try {
        setGoals(JSON.parse(storedGoals));
      } catch {
        // fallback
      }
    } else {
      setGoals([
        {
          id: 'goal-captures',
          title: 'Capture Fresh Insights',
          category: 'captures',
          current: itemsCapturedOnSelectedDate,
          target: 3,
          unit: 'notes',
          completed: itemsCapturedOnSelectedDate >= 3,
          isAutoTracked: true,
        },
        {
          id: 'goal-tasks',
          title: 'Clear Pending Actions',
          category: 'tasks',
          current: tasksCompletedOnSelectedDate,
          target: 4,
          unit: 'tasks',
          completed: tasksCompletedOnSelectedDate >= 4,
          isAutoTracked: true,
        },
        {
          id: 'goal-synthesis',
          title: isToday ? 'Morning AI Synthesis' : 'Daily AI Retrospective',
          category: 'synthesis',
          current: 0,
          target: 1,
          unit: 'briefing',
          completed: false,
          isAutoTracked: false,
        },
        {
          id: 'goal-project',
          title: 'Advance Core Project Milestone',
          category: 'custom',
          current: 0,
          target: 1,
          unit: 'deliverable',
          completed: false,
          isAutoTracked: false,
        },
      ]);
    }

    // Load cached digest if available for this date
    const cachedDigest = localStorage.getItem(`nuvora_daily_digest_${selectedDateStr}`);
    if (cachedDigest) {
      try {
        setDigestData(JSON.parse(cachedDigest));
      } catch {
        setDigestData(null);
      }
    } else {
      setDigestData(null);
    }
  }, [selectedDateStr, isToday, itemsCapturedOnSelectedDate, tasksCompletedOnSelectedDate]);

  // Sync auto-tracked goals when items change
  useEffect(() => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === 'goal-captures') {
          const isDone = itemsCapturedOnSelectedDate >= g.target;
          return { ...g, current: itemsCapturedOnSelectedDate, completed: isDone };
        }
        if (g.id === 'goal-tasks') {
          const isDone = tasksCompletedOnSelectedDate >= g.target;
          return { ...g, current: tasksCompletedOnSelectedDate, completed: isDone };
        }
        return g;
      })
    );
  }, [itemsCapturedOnSelectedDate, tasksCompletedOnSelectedDate]);

  // Persist goals to LocalStorage for current selected date
  useEffect(() => {
    localStorage.setItem(`nuvora_daily_milestones_${selectedDateStr}`, JSON.stringify(goals));
  }, [goals, selectedDateStr]);

  // Toggle or increment manual goal
  const handleToggleManualGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            current: nextCompleted ? g.target : Math.max(0, g.target - 1),
          };
        }
        return g;
      })
    );
  };

  // Add custom daily milestone
  const handleAddCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: DailyGoalMilestone = {
      id: `goal-custom-${Date.now()}`,
      title: newGoalTitle.trim(),
      category: 'custom',
      current: 0,
      target: 1,
      unit: 'milestone',
      completed: false,
      isAutoTracked: false,
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Calculate overall goal completion percentage
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const totalGoalsCount = goals.length;
  const overallProgressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  // Date Navigation Handlers
  const handlePreviousDay = () => {
    const prev = new Date(selectedDateObj.getTime() - 86400000);
    const prevStr = prev.toISOString().split('T')[0];
    setSelectedDateStr(prevStr);
    setCalendarViewMonth(prev);
  };

  const handleNextDay = () => {
    if (isToday) return;
    const next = new Date(selectedDateObj.getTime() + 86400000);
    const nextStr = next.toISOString().split('T')[0];
    if (nextStr > todayStr) {
      setSelectedDateStr(todayStr);
      setCalendarViewMonth(new Date());
    } else {
      setSelectedDateStr(nextStr);
      setCalendarViewMonth(next);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    if (dateStr > todayStr) return; // Disallow future dates
    setSelectedDateStr(dateStr);
    const [y, m, d] = dateStr.split('-').map(Number);
    setCalendarViewMonth(new Date(y, m - 1, d));
    setIsCalendarOpen(false);
  };

  const handleResetToToday = () => {
    setSelectedDateStr(todayStr);
    setCalendarViewMonth(new Date());
    setIsCalendarOpen(false);
  };

  // Fallback / Initial Computed Digest for Selected Date
  const defaultDigest: DailyDigestResult = useMemo(() => {
    if (!isToday) {
      return {
        greeting: `Briefing Archive • ${selectedDateFormatted}`,
        headline: `Knowledge Retrospective for ${selectedDateShort}`,
        executiveSummary: `On ${selectedDateFormatted}, your knowledge library included ${itemsActiveUpToDate.length} total captures, with ${itemsCapturedOnSelectedDate} fresh insights captured on this day and ${pendingTasks.length} active tasks progressing.`,
        coreFocus: activeProjects[0] 
          ? `Historical Focus: Advance ${activeProjects[0].title} & Synthesize Knowledge`
          : 'Historical Focus: Knowledge Integration & Action Review',
        suggestedPriorities: [
          pendingTasks[0] ? `Address core task: "${pendingTasks[0].text}"` : 'Review the day\'s priority action queue.',
          recentItems[0] ? `Reflect on note: "${recentItems[0].title}".` : 'Review historical knowledge captures.',
          activeProjects[0] ? `Review milestones for project "${activeProjects[0].title}".` : 'Organize knowledge items into themed collections.',
        ],
        knowledgeHighlight: recentItems[0]?.title 
          ? `Archived Knowledge: "${recentItems[0].title}" — ${recentItems[0].rawSummary || recentItems[0].content.slice(0, 90) + '...'}`
          : 'Serendipitous insights emerge when reviewing knowledge over time.',
        productivityQuote: 'Reviewing past knowledge clarifies future momentum.',
      };
    }

    return {
      greeting: getGreeting(),
      headline: 'Your Daily Knowledge & Execution Briefing',
      executiveSummary: `You have ${recentItems.length} fresh captures to synthesize, ${pendingTasks.length} pending action items requiring execution, and ${activeProjects.length} active project outcomes progressing.`,
      coreFocus: activeProjects[0] 
        ? `Core Focus: Advance ${activeProjects[0].title} & Synthesize Recent Insights`
        : 'Core Focus: Synthesize Recent Notes & Execute Priority Tasks',
      suggestedPriorities: [
        pendingTasks[0] ? `Execute priority task: "${pendingTasks[0].text}"` : 'Review today\'s primary action queue.',
        recentItems[0] ? `Connect recent notes from "${recentItems[0].title}" to active projects.` : 'Capture notes from your morning thoughts.',
        activeProjects[0] ? `Check milestone deliverables for project "${activeProjects[0].title}".` : 'Organize unassigned items into focused collections.',
      ],
      knowledgeHighlight: recentItems[0]?.title 
        ? `Standout Knowledge: "${recentItems[0].title}" — ${recentItems[0].rawSummary || recentItems[0].content.slice(0, 90) + '...'}`
        : 'Connect your notes together to unlock serendipitous associations.',
      productivityQuote: 'Knowledge compounds when organized, but creates lasting impact when translated into direct action.',
    };
  }, [isToday, selectedDateFormatted, selectedDateShort, itemsActiveUpToDate, itemsCapturedOnSelectedDate, pendingTasks, recentItems, activeProjects]);

  const currentDigest = digestData || defaultDigest;

  // AI Briefing Generator (Supports historical or today synthesis)
  const handleGenerateBriefing = async () => {
    setIsGenerating(true);
    try {
      const res = await aiService.generateDailyDigest({
        items: itemsActiveUpToDate,
        projects,
        userName,
        targetDate: selectedDateStr,
        formattedDate: selectedDateFormatted,
      });
      setDigestData(res);
      // Cache generated digest
      localStorage.setItem(`nuvora_daily_digest_${selectedDateStr}`, JSON.stringify(res));

      // Mark synthesis goal as completed
      setGoals((prev) =>
        prev.map((g) => (g.id === 'goal-synthesis' ? { ...g, current: 1, completed: true } : g))
      );
    } catch (err) {
      console.warn('Failed to generate AI digest, using computed briefing:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyBriefing = () => {
    const textToCopy = `# Daily Briefing • ${selectedDateFormatted}
${currentDigest.greeting}

## ${currentDigest.headline}
${currentDigest.executiveSummary}

🎯 **${currentDigest.coreFocus}**

### Daily Milestones Progress (${overallProgressPercent}% Complete • ${completedGoalsCount}/${totalGoalsCount}):
${goals.map((g) => `- [${g.completed ? 'x' : ' '}] ${g.title} (${g.current}/${g.target} ${g.unit})`).join('\n')}

### Recommended Priorities:
${currentDigest.suggestedPriorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}

### 📚 Standout Knowledge:
${currentDigest.knowledgeHighlight}

### ⚡ Action Items (${pendingTasks.length} pending):
${pendingTasks.map((t) => `- [ ] ${t.text} (${t.priority || 'medium'} priority)`).join('\n')}

### 🚀 Active Projects (${activeProjects.length}):
${activeProjects.map((p) => `- ${p.title}: ${p.description}`).join('\n')}

> "${currentDigest.productivityQuote}"
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calendar Grid Generator Helpers
  const renderCalendarDays = () => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty cells for alignment before day 1
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDayToday = dateStr === todayStr;
      const isDaySelected = dateStr === selectedDateStr;
      const isFuture = dateStr > todayStr;
      const activity = activityByDate[dateStr];
      const hasCaptures = !!activity && activity.itemsCount > 0;

      days.push(
        <button
          key={dateStr}
          type="button"
          disabled={isFuture}
          onClick={() => handleSelectDate(dateStr)}
          className={`w-8 h-8 text-xs font-semibold rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
            isFuture
              ? 'text-slate-300 cursor-not-allowed opacity-40'
              : isDaySelected
              ? 'bg-[#7B61FF] text-white shadow-xs scale-105 font-bold'
              : isDayToday
              ? 'bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 border border-amber-200'
              : hasCaptures
              ? 'text-slate-900 hover:bg-indigo-50/80 font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={
            activity
              ? `${activity.itemsCount} note(s) captured, ${activity.tasksCount} task(s)`
              : dateStr
          }
        >
          <span>{d}</span>
          {/* Knowledge Activity Indicator Dot */}
          {hasCaptures && !isDaySelected && (
            <span
              className={`w-1 h-1 rounded-full absolute bottom-1 ${
                isDayToday ? 'bg-amber-500' : 'bg-[#7B61FF]'
              }`}
            />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-white via-[#FCFCFE] to-[#F7F8FD] border border-[#E2E5F2] shadow-sm overflow-hidden transition-all duration-300">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-6 border-b border-[#EAEBF4] bg-gradient-to-r from-white via-[#F9FAFE] to-[#F1F3FD]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Title, Greeting & Calendar Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              {/* Daily Digest Pill */}
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFF4E6] to-[#FFF9F2] text-[#FF8A00] border border-[#FFE3C7] text-[11px] font-bold tracking-wide uppercase">
                {isToday ? (
                  <Sun className="w-3.5 h-3.5 text-[#FF8A00] animate-pulse" />
                ) : (
                  <History className="w-3.5 h-3.5 text-[#7B61FF]" />
                )}
                <span>{isToday ? 'Daily Digest' : 'Briefing Archive'}</span>
              </span>

              {/* 📅 Interactive Calendar Toggle Component */}
              <div className="relative inline-block" ref={calendarRef}>
                <div className="inline-flex items-center bg-white border border-[#E1E4F0] rounded-xl shadow-2xs p-0.5">
                  {/* Prev Day Button */}
                  <button
                    onClick={handlePreviousDay}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Previous day's briefing"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Calendar Toggle Button */}
                  <button
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="flex items-center space-x-1.5 px-2 py-0.5 text-xs font-semibold text-slate-700 hover:text-[#7B61FF] hover:bg-indigo-50/50 rounded-lg transition-colors cursor-pointer"
                    title="Open calendar to view briefings for previous days"
                    aria-expanded={isCalendarOpen}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#7B61FF]" />
                    <span className="font-bold text-slate-800">
                      {isToday ? `Today, ${selectedDateShort}` : selectedDateShort}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Next Day Button */}
                  <button
                    onClick={handleNextDay}
                    disabled={isToday}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title={isToday ? 'Cannot navigate past today' : "Next day's briefing"}
                    aria-label="Next day"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Calendar Dropdown Popover */}
                {isCalendarOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-auto mt-2 z-50 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/10 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    {/* Popover Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="w-4 h-4 text-[#7B61FF]" />
                        <span className="text-xs font-bold text-slate-900">Knowledge History Calendar</span>
                      </div>
                      <button
                        onClick={handleResetToToday}
                        className="text-[11px] font-bold text-[#7B61FF] hover:underline cursor-pointer"
                      >
                        Today
                      </button>
                    </div>

                    {/* Month Switcher */}
                    <div className="flex items-center justify-between px-1">
                      <button
                        onClick={() => {
                          setCalendarViewMonth(
                            new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() - 1, 1)
                          );
                        }}
                        className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Previous Month"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-bold text-slate-800">
                        {calendarViewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>

                      <button
                        onClick={() => {
                          setCalendarViewMonth(
                            new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + 1, 1)
                          );
                        }}
                        disabled={
                          calendarViewMonth.getFullYear() === new Date().getFullYear() &&
                          calendarViewMonth.getMonth() >= new Date().getMonth()
                        }
                        className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Next Month"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 justify-items-center">
                      {renderCalendarDays()}
                    </div>

                    {/* Quick Jump Shortcuts */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Quick Timeline Jump
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={handleResetToToday}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                            isToday
                              ? 'bg-indigo-50 text-[#7B61FF] border-[#7B61FF]/30 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                            handleSelectDate(y);
                          }}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                            selectedDateStr === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                              ? 'bg-indigo-50 text-[#7B61FF] border-[#7B61FF]/30 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                          }`}
                        >
                          Yesterday
                        </button>
                        <button
                          onClick={() => {
                            const d3 = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
                            handleSelectDate(d3);
                          }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors cursor-pointer"
                        >
                          3 Days Ago
                        </button>
                        <button
                          onClick={() => {
                            const d7 = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
                            handleSelectDate(d7);
                          }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-colors cursor-pointer"
                        >
                          7 Days Ago
                        </button>
                      </div>

                      {/* Recent Active Note Dates */}
                      {activeHistoryDates.length > 0 && (
                        <div className="pt-1.5">
                          <div className="text-[10px] font-bold text-slate-400 mb-1">
                            Recent Note Activity Days:
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {activeHistoryDates.slice(0, 4).map((date) => (
                              <button
                                key={date}
                                onClick={() => handleSelectDate(date)}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center space-x-1 cursor-pointer ${
                                  selectedDateStr === date
                                    ? 'bg-[#7B61FF] text-white font-bold'
                                    : 'bg-indigo-50/70 hover:bg-indigo-100 text-[#7B61FF]'
                                }`}
                              >
                                <span>{date}</span>
                                <span className="text-[9px] opacity-70">({activityByDate[date]?.itemsCount} notes)</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Jump to Today Button (Only when browsing previous days) */}
              {!isToday && (
                <button
                  onClick={handleResetToToday}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-[#7B61FF] border border-indigo-200 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Return to today's active briefing"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Return to Today</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B0F19]">
                {currentDigest.greeting}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {isToday
                ? 'Your synthesized morning briefing connecting recent captures, high-impact tasks, and project milestones.'
                : `Historical briefing and snapshot of knowledge captures, active milestones, and priorities as of ${selectedDateFormatted}.`}
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleGenerateBriefing}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#6366F1] hover:from-[#6D52FE] hover:to-[#5458E8] text-white text-xs font-semibold shadow-xs shadow-[#7B61FF]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
              title={isToday ? 'Generate intelligent AI briefing with Gemini' : 'Synthesize AI retrospective for this day in history'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : isToday ? 'AI Synthesis' : 'Synthesize Archive'}</span>
            </button>

            <button
              onClick={handleCopyBriefing}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Copy markdown briefing"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Briefing</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
              aria-label={isCollapsed ? 'Expand Daily Digest' : 'Collapse Daily Digest'}
            >
              {isCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>

        {/* Historical Day Indicator Banner */}
        {!isToday && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-2 text-xs text-indigo-900">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-[#7B61FF] flex-shrink-0" />
              <span>
                <strong>Viewing Historical Briefing:</strong> {selectedDateFormatted}. Showing knowledge base activity recorded on this day.
              </span>
            </div>
            <button
              onClick={handleResetToToday}
              className="font-bold text-[#7B61FF] hover:underline flex-shrink-0 cursor-pointer"
            >
              Jump back to today →
            </button>
          </div>
        )}

        {/* Status Metrics Ribbon */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-100/80">
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#7B61FF] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">{recentItems.length} Notes</div>
              <div className="text-[10px] text-slate-400 truncate">
                {isToday ? 'Recent Captures' : `Captures as of ${selectedDateShort}`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">{pendingTasks.length} Pending</div>
              <div className="text-[10px] text-slate-400 truncate">Action Items</div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/70 border border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <KanbanSquare className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900">{activeProjects.length} Active</div>
              <div className="text-[10px] text-slate-400 truncate">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-200">
          
          {/* 🎯 DAILY GOAL TRACKING & MILESTONES SECTION */}
          <div className="p-5 rounded-2xl bg-white border border-[#E3E6F3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7B61FF] to-[#6366F1] text-white flex items-center justify-center shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isToday ? 'Daily Milestones & Progress Tracker' : `Milestones Tracker (${selectedDateShort})`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[#7B61FF] text-[10px] font-extrabold uppercase">
                      {completedGoalsCount}/{totalGoalsCount} Achieved
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Track momentum across captures, action tasks, and project deliverables for {selectedDateShort}.
                  </p>
                </div>
              </div>

              {/* Progress Ring / Bar Summary */}
              <div className="flex items-center space-x-3 self-end sm:self-auto">
                <div className="text-right">
                  <div className="text-sm font-extrabold text-slate-900">
                    {overallProgressPercent}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Daily Goal
                  </div>
                </div>
                <div className="w-24 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7B61FF] via-[#6366F1] to-[#10B981] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${overallProgressPercent}%` }}
                  />
                </div>
                {overallProgressPercent === 100 && (
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 animate-bounce" title="All milestones completed!">
                    <Trophy className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                
                // Determine category theme color & icon
                const getCategoryConfig = () => {
                  switch (goal.category) {
                    case 'captures':
                      return {
                        icon: <BookOpen className="w-3.5 h-3.5" />,
                        bg: 'bg-indigo-50',
                        text: 'text-[#7B61FF]',
                        barColor: 'from-[#7B61FF] to-[#9061FF]',
                      };
                    case 'tasks':
                      return {
                        icon: <CheckSquare className="w-3.5 h-3.5" />,
                        bg: 'bg-emerald-50',
                        text: 'text-emerald-600',
                        barColor: 'from-emerald-500 to-teal-500',
                      };
                    case 'synthesis':
                      return {
                        icon: <Sparkles className="w-3.5 h-3.5" />,
                        bg: 'bg-amber-50',
                        text: 'text-amber-600',
                        barColor: 'from-amber-500 to-orange-500',
                      };
                    default:
                      return {
                        icon: <Target className="w-3.5 h-3.5" />,
                        bg: 'bg-purple-50',
                        text: 'text-purple-600',
                        barColor: 'from-[#6366F1] to-[#7B61FF]',
                      };
                  }
                };

                const catConfig = getCategoryConfig();

                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                      goal.completed
                        ? 'bg-gradient-to-b from-[#F2FBF5] via-[#F9FDFB] to-white border-emerald-300/80 shadow-xs ring-1 ring-emerald-400/20'
                        : 'bg-white hover:bg-[#FAFBFD] border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              goal.completed ? 'bg-emerald-100 text-emerald-700' : `${catConfig.bg} ${catConfig.text}`
                            }`}
                          >
                            {goal.completed ? <Check className="w-4 h-4 stroke-[2.5]" /> : catConfig.icon}
                          </div>
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {goal.title}
                          </span>
                        </div>

                        {!goal.isAutoTracked && (
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 transition-opacity cursor-pointer rounded"
                            title="Remove milestone"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Visual Progress Bar & Numerical / Percentage Badge */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">
                            {goal.current} <span className="text-slate-400 font-normal">/ {goal.target} {goal.unit}</span>
                          </span>
                          
                          {/* Completion Percentage Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide inline-flex items-center space-x-1 ${
                              goal.completed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : percent > 0
                                ? 'bg-indigo-50 text-[#7B61FF] border border-indigo-100'
                                : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                            }`}
                          >
                            {goal.completed ? (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>100%</span>
                              </>
                            ) : (
                              <span>{percent}%</span>
                            )}
                          </span>
                        </div>

                        {/* Enhanced Visual Progress Bar */}
                        <div className="relative w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 p-[1px]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                              goal.completed
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-2xs shadow-emerald-500/20'
                                : `bg-gradient-to-r ${catConfig.barColor} shadow-2xs`
                            }`}
                            style={{ width: `${Math.max(percent > 0 ? 6 : 0, percent)}%` }}
                          >
                            {/* Subtle inner highlight shimmer on active bar */}
                            {percent > 0 && !goal.completed && (
                              <div className="absolute inset-0 bg-white/25 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action & Status Footer */}
                    <div className="pt-3 border-t border-slate-100/90 mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {goal.isAutoTracked ? '⚡ Auto-synced' : '📌 Manual Goal'}
                      </span>
                      
                      {goal.isAutoTracked ? (
                        <button
                          onClick={() => {
                            if (goal.category === 'captures') setIsCaptureOpen(true);
                            if (goal.category === 'tasks') setActiveTab('tasks');
                          }}
                          className="text-[10px] font-bold text-[#7B61FF] hover:text-[#6366F1] hover:underline cursor-pointer flex items-center space-x-0.5"
                        >
                          <span>{goal.category === 'captures' ? '+ Capture' : 'Go to Tasks'}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleManualGoal(goal.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center space-x-1 ${
                            goal.completed
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-[#7B61FF] border border-indigo-100'
                          }`}
                        >
                          {goal.completed ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <span>Mark Complete</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Milestone Row */}
            <div className="pt-1 flex items-center justify-between">
              {isAddingGoal ? (
                <form onSubmit={handleAddCustomGoal} className="flex-1 flex items-center space-x-2 animate-in fade-in">
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Enter custom daily milestone (e.g. Finish reading Q3 strategy document)..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#7B61FF] text-white text-xs font-semibold hover:bg-[#6D52FE] transition-colors cursor-pointer"
                  >
                    Save Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingGoal(false);
                      setNewGoalTitle('');
                    }}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-[#7B61FF] hover:text-[#6366F1] px-2.5 py-1 rounded-lg hover:bg-indigo-50/70 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Daily Milestone</span>
                </button>
              )}

              <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Daily goals reset at midnight</span>
              </div>
            </div>
          </div>

          {/* 2. Executive Synthesis & Focus Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#F5F3FF] via-[#F8F9FE] to-[#EEF2FF] border border-[#DDD6FE]/80 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#7B61FF]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#7B61FF]">
                  {currentDigest.headline}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 italic">
                "{currentDigest.productivityQuote}"
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {currentDigest.executiveSummary}
            </p>

            {/* Strategic Focus Pill */}
            <div className="p-3 rounded-xl bg-white/90 border border-[#E0D7FE] flex items-start sm:items-center space-x-2.5">
              <Flame className="w-4 h-4 text-[#FF8A00] flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs font-bold text-slate-900">
                {currentDigest.coreFocus}
              </div>
            </div>

            {/* Suggested Morning Priorities Checklist */}
            {currentDigest.suggestedPriorities && currentDigest.suggestedPriorities.length > 0 && (
              <div className="pt-2 border-t border-[#DDD6FE]/60">
                <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center space-x-1.5">
                  <span>Today's Recommended Execution Flow:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentDigest.suggestedPriorities.map((priorityText, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-700 flex items-start space-x-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#EDE9FE] text-[#7B61FF] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{priorityText}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Three-Column Morning Briefing Pillars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Pillar 1: Recent Knowledge Items */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E9F2] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#7B61FF] flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Recent Captures
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="text-[11px] text-[#7B61FF] font-semibold hover:underline flex items-center space-x-0.5"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {recentItems.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No captures yet</p>
                  ) : (
                    recentItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className="p-2.5 rounded-xl bg-[#F9FAFD] hover:bg-[#F3F4FB] border border-slate-100 hover:border-[#7B61FF]/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#7B61FF] transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.rawSummary || item.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsCaptureOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Capture Morning Thought</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pillar 2: Urgent & Pending Tasks */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E9F2] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Pending Action Queue
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[11px] text-[#7B61FF] font-semibold hover:underline flex items-center space-x-0.5"
                  >
                    <span>{pendingTasks.length} tasks</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {pendingTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      🎉 All action items are complete!
                    </div>
                  ) : (
                    pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-xl bg-[#F9FAFD] hover:bg-[#F3FDF8] border border-slate-100 hover:border-emerald-200 transition-all flex items-start space-x-2.5"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => task.originItemId && toggleTask(task.originItemId, task.id)}
                          className="w-3.5 h-3.5 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-snug truncate">
                            {task.text}
                          </p>
                          {task.originItemTitle && (
                            <button
                              onClick={() => task.originItemId && setSelectedItemId(task.originItemId)}
                              className="text-[10px] text-slate-400 hover:text-[#7B61FF] truncate block text-left"
                            >
                              From: {task.originItemTitle}
                            </button>
                          )}
                        </div>
                        {task.priority && (
                          <span
                            className={`text-[8px] uppercase font-extrabold px-1.5 py-0.2 rounded-full ${
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
              </div>

              <button
                onClick={() => setActiveTab('tasks')}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Go to Tasks Board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pillar 3: Urgent Projects (Outcomes) */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E9F2] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <KanbanSquare className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Active Projects
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-[11px] text-[#7B61FF] font-semibold hover:underline flex items-center space-x-0.5"
                  >
                    <span>All projects</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {activeProjects.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No active projects</p>
                  ) : (
                    activeProjects.map((project) => {
                      const linkedItemsCount = (project.linkedItemIds || []).length;
                      return (
                        <div
                          key={project.id}
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setActiveTab('projects');
                          }}
                          className="p-2.5 rounded-xl bg-[#F9FAFD] hover:bg-[#FFFBF5] border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color || '#7B61FF' }}
                            />
                            {project.targetDate && (
                              <span className="text-[10px] font-semibold text-amber-600 flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>Due {project.targetDate}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                          <div className="text-[10px] text-slate-400 pt-1 flex items-center space-x-2">
                            <span>{linkedItemsCount} linked notes</span>
                            <span>•</span>
                            <span className="capitalize">{project.status}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('projects');
                }}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Explore Project Outcomes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

