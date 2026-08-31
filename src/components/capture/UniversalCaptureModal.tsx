import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Mic, 
  Lightbulb, 
  Globe, 
  Users, 
  Camera, 
  CheckSquare, 
  ArrowRight, 
  Loader2,
  FolderHeart,
  KanbanSquare,
  Square,
  Play,
  Volume2
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { ItemType } from '../../types';
import { aiService } from '../../services/aiService';

export const UniversalCaptureModal: React.FC = () => {
  const { 
    isCaptureOpen, 
    setIsCaptureOpen, 
    addItem, 
    projects, 
    collections, 
    setSelectedItemId,
    setActiveTab 
  } = useKnowledge();

  const [activeType, setActiveType] = useState<ItemType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [autoUnderstand, setAutoUnderstand] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  // Audio synthesis helper for voice memo playback
  const [isCleaningVoice, setIsCleaningVoice] = useState(false);

  useEffect(() => {
    // Reset form on open
    if (isCaptureOpen) {
      setTitle('');
      setContent('');
      setSourceUrl('');
      setProjectId('');
      setCollectionId('');
      setSpeechTranscript('');
      setIsRecording(false);
    }
  }, [isCaptureOpen]);

  if (!isCaptureOpen) return null;

  // Speech Recognition handler
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment. You can type or paste your voice transcript directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setSpeechTranscript(currentTranscript);
        setContent(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Speech recognition init error:', e);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    // If we have transcribed text, offer auto-cleanup
    if (speechTranscript.trim()) {
      setIsCleaningVoice(true);
      try {
        const cleaned = await aiService.transcribeVoice(speechTranscript, 'Voice thought capture');
        if (cleaned) {
          if (cleaned.title && !title) setTitle(cleaned.title);
          if (cleaned.cleanedText) setContent(cleaned.cleanedText);
        }
      } catch (err) {
        console.warn('Voice auto-clean fallback:', err);
      } finally {
        setIsCleaningVoice(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await addItem(
        {
          type: activeType,
          title: title.trim() || undefined,
          content: content.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
          projectId: projectId || undefined,
          collectionId: collectionId || undefined,
        },
        autoUnderstand
      );

      setIsCaptureOpen(false);
      setSelectedItemId(created.id);
    } catch (err) {
      console.error('Capture error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureTabs: { type: ItemType; label: string; icon: any; placeholder: string; defaultTitle?: string }[] = [
    { type: 'note', label: 'Note', icon: FileText, placeholder: 'Write freely or paste markdown... Nuvora will extract key insights, entities, and actions.' },
    { type: 'voice', label: 'Voice Thought', icon: Mic, placeholder: 'Record or paste a voice transcript... AI will structure and clean it into an actionable note.' },
    { type: 'idea', label: 'Idea Spark', icon: Lightbulb, placeholder: 'Describe a hypothesis, product concept, or mental model...' },
    { type: 'web', label: 'Web / Article', icon: Globe, placeholder: 'Paste article excerpt, key quotes, or research findings...' },
    { type: 'meeting', label: 'Meeting', icon: Users, placeholder: 'Attendees, agenda, decisions made, and follow-up commitments...' },
    { type: 'scan', label: 'Scan / OCR', icon: Camera, placeholder: 'Paste OCR text from a book page, whiteboard, or document...' },
    { type: 'task', label: 'Task', icon: CheckSquare, placeholder: 'What action needs to be taken? Include context or deadline...' },
  ];

  const currentTab = captureTabs.find((t) => t.type === activeType) || captureTabs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E4E6F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAEBF0] flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-aurora flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Universal Capture</h2>
              <p className="text-xs text-slate-500">Capture anything first. Nuvora will understand and connect it.</p>
            </div>
          </div>
          <button
            onClick={() => setIsCaptureOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close capture modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capture Type Tabs */}
        <div className="px-6 py-2.5 bg-white border-b border-[#EAEBF0] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {captureTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeType === tab.type;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveType(tab.type)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#F0EEFF] text-[#7B61FF] font-semibold border border-[#7B61FF]/20 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Capture Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional — Gemini will auto-generate if blank)"
              className="w-full px-3.5 py-2 text-sm font-medium bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Web Source URL (for Web type) */}
          {activeType === 'web' && (
            <div>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Source URL (e.g. https://example.com/article)"
                className="w-full px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF] transition-all placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Voice Memo Controls */}
          {activeType === 'voice' && (
            <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#E6E0FF] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
                      : 'bg-[#7B61FF] text-white hover:bg-[#6A4FE8]'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Voice Recording</span>
                    </>
                  )}
                </button>
                {isRecording && (
                  <span className="text-xs text-rose-600 font-medium animate-pulse">
                    Listening & transcribing...
                  </span>
                )}
                {isCleaningVoice && (
                  <span className="text-xs text-[#7B61FF] font-medium flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Cleaning voice note with AI...</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-500">
                Live transcription with Gemini clean-up
              </span>
            </div>
          )}

          {/* Main Content Area */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentTab.placeholder}
              rows={6}
              className="w-full p-3.5 text-sm bg-white border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 focus:border-[#7B61FF] transition-all placeholder:text-slate-400 resize-none font-normal leading-relaxed"
              required={!title.trim()}
            />
          </div>

          {/* Organization: Target Project & Collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 text-slate-700"
              >
                <option value="">No Project Assigned</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                File in Collection (Optional)
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/30 text-slate-700"
              >
                <option value="">No Collection Assigned</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto Understand Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUnderstand}
                onChange={(e) => setAutoUnderstand(e.target.checked)}
                className="w-4 h-4 rounded text-[#7B61FF] focus:ring-[#7B61FF] border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                Auto-understand with Gemini (extract title, topics, entities & action items)
              </span>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCaptureOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !title.trim())}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-md shadow-[#7B61FF]/25 hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Understanding & Saving...</span>
                </>
              ) : (
                <>
                  <span>Capture Knowledge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
