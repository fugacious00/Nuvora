import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  ArrowRight, 
  Loader2, 
  KanbanSquare, 
  CheckSquare, 
  ExternalLink, 
  Clock, 
  Bot, 
  User, 
  HelpCircle,
  FileText,
  BookmarkPlus,
  History,
  Plus,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useKnowledge } from '../../context/KnowledgeContext';
import { aiService, AskResult } from '../../services/aiService';
import { AskMessage } from '../../types';

interface ConversationThread {
  id: string;
  title: string;
  messages: AskMessage[];
  updatedAt: string;
}

const STORAGE_KEY = 'nuvora_ask_conversations_history_v1';
const ACTIVE_CONV_KEY = 'nuvora_ask_active_conv_id';

export const AskAIView: React.FC = () => {
  const { items, setSelectedItemId, addProject, addTask, setActiveTab } = useKnowledge();

  // Multi-conversation history state
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'conv-default',
        title: 'New Conversation',
        messages: [
          {
            id: 'msg-welcome',
            role: 'assistant',
            content: `I am **Nuvora**, your personal knowledge librarian and researcher.

I have indexed all **${items.length} captures** in your library. Ask me anything about what you've learned, ideas you've brainstormed, notes you've taken, or active outcomes you're pursuing.

Every answer is strictly grounded in your personal archive with verifiable source citations.`,
            suggestedActions: [
              'Explore Renaissance architecture notes',
              'Review the Architect pricing estimator idea',
              'Summarize active system design principles',
            ],
            timestamp: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    ];
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_CONV_KEY);
      if (saved) return saved;
    } catch {}
    return 'conv-default';
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Active thread & messages
  const currentThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: 'conv-default',
    title: 'New Conversation',
    messages: [],
    updatedAt: new Date().toISOString(),
  };

  const messages = currentThread.messages;

  // Persist conversation history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {}
  }, [threads]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CONV_KEY, activeThreadId);
    } catch {}
  }, [activeThreadId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Start a new conversation thread
  const handleStartNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newThread: ConversationThread = {
      id: newId,
      title: 'New Conversation',
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `I am **Nuvora**, your personal knowledge librarian and researcher.\n\nI have indexed all **${items.length} captures** in your library. What would you like to explore or synthesize today?`,
          suggestedActions: [
            'Explore Renaissance architecture notes',
            'Review the Architect pricing estimator idea',
            'Summarize active system design principles',
          ],
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);
    setIsHistoryOpen(false);
    setInputQuery('');
  };

  // Delete current or specific conversation
  const handleDeleteConversation = (threadIdToDelete?: string) => {
    const targetId = threadIdToDelete || activeThreadId;

    if (threads.length <= 1) {
      // If only 1 thread exists, reset it to a clean slate
      const resetThread: ConversationThread = {
        id: 'conv-default',
        title: 'New Conversation',
        messages: [
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `I am **Nuvora**, your personal knowledge librarian and researcher.\n\nAsk me anything across your **${items.length} captured notes**, ideas, and outcomes.`,
            suggestedActions: [
              'Explore Renaissance architecture notes',
              'Review the Architect pricing estimator idea',
              'Summarize active system design principles',
            ],
            timestamp: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      setThreads([resetThread]);
      setActiveThreadId('conv-default');
    } else {
      const filtered = threads.filter((t) => t.id !== targetId);
      setThreads(filtered);
      if (targetId === activeThreadId) {
        setActiveThreadId(filtered[0]?.id || 'conv-default');
      }
    }
    setIsHistoryOpen(false);
  };

  // Helper to update messages in active thread
  const updateActiveThreadMessages = (newMessages: AskMessage[], updatedTitle?: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            title: updatedTitle || t.title,
            messages: newMessages,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    const userMsg: AskMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    // Calculate thread title from first user message
    const isFirstUserQuery = !messages.some((m) => m.role === 'user');
    const newTitle = isFirstUserQuery
      ? (q.length > 28 ? q.slice(0, 28) + '...' : q)
      : undefined;

    const updatedWithUser = [...messages, userMsg];
    updateActiveThreadMessages(updatedWithUser, newTitle);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result: AskResult = await aiService.ask({
        query: q,
        items,
        history: updatedWithUser.slice(-4).map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg: AskMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        sourceItemIds: result.sourceItemIds,
        suggestedActions: result.suggestedActions,
        relatedTopics: result.relatedTopics,
        temporalMemory: result.temporalMemory,
        timestamp: new Date().toISOString(),
      };

      updateActiveThreadMessages([...updatedWithUser, assistantMsg], newTitle);
    } catch (err: any) {
      console.error('Ask AI error:', err);
      const errorMsg: AskMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue analyzing your knowledge base. ${err.message || 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      updateActiveThreadMessages([...updatedWithUser, errorMsg], newTitle);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'What have I learned about Renaissance architecture and structural geometry?',
    'Find the business idea I had about helping architects estimate prices.',
    'What am I currently working on across all active outcomes?',
    'Synthesize the main cognitive biases mentioned in my notes.',
    'What did I abandon or leave unfinished?',
    'How do my system design notes relate to local-first software?',
  ];

  // Helper to convert suggested action into a real Project or Task
  const handleActionClick = (actionText: string) => {
    if (actionText.toLowerCase().includes('project')) {
      const cleanTitle = actionText.replace(/^(create a? project:?|start project:?)/i, '').trim();
      addProject({
        title: cleanTitle || actionText,
        description: `Project spawned from AI synthesis: "${actionText}"`,
        status: 'active',
        color: '#7B61FF',
        tags: ['AI Derived'],
        linkedItemIds: [],
      });
      setActiveTab('projects');
    } else {
      if (items.length > 0) {
        addTask(items[0].id, actionText, 'high');
        setActiveTab('tasks');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-130px)] flex flex-col justify-between space-y-4 animate-in fade-in duration-200">
      {/* Header Info with History, New Chat, and Delete Conversation */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EAEBF0] flex-shrink-0 relative">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-aurora flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0B0F19]">Ask Nuvora</h1>
            <p className="text-xs text-slate-500">
              Grounded contextual search across your {items.length} captured notes & outcomes
            </p>
          </div>
        </div>

        {/* Right Toolbar: History Dropdown, New Chat, Delete */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* History Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isHistoryOpen
                  ? 'bg-[#7B61FF]/10 text-[#7B61FF] border-[#7B61FF]/30 shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80 shadow-2xs'
              }`}
              title="Conversation History"
            >
              <History className="w-3.5 h-3.5 text-[#7B61FF]" />
              <span className="hidden sm:inline">History</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-bold">
                {threads.length}
              </span>
            </button>

            {/* History Dropdown Menu */}
            {isHistoryOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Past Conversations
                  </span>
                  <button
                    onClick={handleStartNewConversation}
                    className="text-[11px] text-[#7B61FF] font-semibold hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New</span>
                  </button>
                </div>
                <div className="p-1 space-y-0.5">
                  {threads.map((t) => (
                    <div
                      key={t.id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        t.id === activeThreadId
                          ? 'bg-[#7B61FF]/10 text-[#7B61FF] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setActiveThreadId(t.id);
                        setIsHistoryOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{t.title || 'Untitled Conversation'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(t.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        title="Delete this conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plus icon: Start New Conversation */}
          <button
            onClick={handleStartNewConversation}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#7B61FF] hover:bg-[#6D52FE] text-white rounded-xl text-xs font-semibold shadow-xs shadow-[#7B61FF]/20 transition-all active:scale-95 cursor-pointer"
            title="Start New Conversation"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Delete icon: Delete/Clear Current Conversation */}
          <button
            onClick={() => handleDeleteConversation()}
            className="p-1.5 sm:p-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Delete Current Conversation"
            aria-label="Delete Current Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Chat Flow */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-2xs ${
                  isUser ? 'bg-[#0B0F19]' : 'bg-aurora'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`space-y-3 max-w-[85%] ${isUser ? 'items-end text-right' : 'items-start'}`}>
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#0B0F19] text-white rounded-tr-none font-medium'
                      : 'bg-white border border-[#E4E6F0] text-slate-800 rounded-tl-none shadow-2xs'
                  }`}
                >
                  {/* Markdown Renderer */}
                  <div className="prose prose-sm max-w-none prose-slate prose-p:my-1.5 prose-headings:font-bold prose-headings:text-slate-900 prose-ul:my-1.5 prose-li:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Temporal Memory Callout */}
                  {msg.temporalMemory && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FFF9F2] border border-[#FFE8D1] text-xs text-[#B45309] flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{msg.temporalMemory}</span>
                    </div>
                  )}
                </div>

                {/* Grounded Source Citations */}
                {!isUser && msg.sourceItemIds && msg.sourceItemIds.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#F6F7FC] border border-[#E6E8F2] space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <BookOpen className="w-3.5 h-3.5 text-[#7B61FF]" />
                      <span>Grounded Source Citations:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sourceItemIds.map((itemId) => {
                        const foundItem = items.find((i) => i.id === itemId);
                        if (!foundItem) return null;
                        return (
                          <button
                            key={itemId}
                            onClick={() => setSelectedItemId(itemId)}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#DCE0EE] hover:border-[#7B61FF] text-xs font-semibold text-slate-800 hover:text-[#7B61FF] transition-all shadow-2xs cursor-pointer"
                          >
                            <span className="text-[10px] uppercase font-bold text-slate-400">[{foundItem.type}]</span>
                            <span className="truncate max-w-[200px]">{foundItem.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Proactive Action Suggestions */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#F0EEFF] hover:bg-[#E4DEFF] text-[#7B61FF] text-xs font-semibold transition-colors border border-[#7B61FF]/20 cursor-pointer"
                      >
                        <span>→ {action}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-aurora flex items-center justify-center text-white shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E4E6F0] rounded-tl-none flex items-center space-x-2 text-xs text-slate-500 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#7B61FF]" />
              <span>Scanning personal knowledge graph & synthesizing citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills (When chat is clean or ready) */}
      {messages.length <= 2 && (
        <div className="space-y-1.5 pt-2 flex-shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Questions:
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {samplePrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleAsk(prompt)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E4E6F0] hover:border-[#7B61FF] text-xs text-slate-600 hover:text-[#7B61FF] whitespace-nowrap transition-all shadow-2xs cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(inputQuery);
        }}
        className="relative flex-shrink-0 pt-2"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about what you've captured or learned..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3.5 text-sm bg-white border border-[#DCE0EE] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF] disabled:opacity-50 transition-all placeholder:text-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="absolute right-2.5 p-2 rounded-xl bg-aurora text-white hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shadow-xs cursor-pointer"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

