import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Loader2, 
  Check, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Copy, 
  Plus, 
  ArrowRight,
  KanbanSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useKnowledge } from '../../context/KnowledgeContext';
import { KnowledgeItem } from '../../types';
import { aiService, TransformResult } from '../../services/aiService';

interface TransformModalProps {
  itemsToTransform: KnowledgeItem[];
  onClose: () => void;
}

export const TransformModal: React.FC<TransformModalProps> = ({ itemsToTransform, onClose }) => {
  const { addItem, setSelectedItemId, setActiveTab } = useKnowledge();

  const [transformType, setTransformType] = useState('Executive Synthesis & Brief');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TransformResult | null>(null);
  const [copied, setCopied] = useState(false);

  const transformOptions = [
    {
      id: 'Executive Synthesis & Brief',
      label: 'Executive Brief',
      description: 'High-level synthesis of key concepts, strategic takeaways, and implications.',
    },
    {
      id: 'Structured Study & Research Guide',
      label: 'Study Guide',
      description: 'Systematic learning framework with foundational principles and review questions.',
    },
    {
      id: 'Action Plan & Implementation Roadmap',
      label: 'Action Plan',
      description: 'Concrete milestone-driven execution plan with derived action items.',
    },
    {
      id: 'Decision Matrix & Tradeoff Analysis',
      label: 'Decision Matrix',
      description: 'Structured comparison of options, edge cases, risks, and recommended paths.',
    },
  ];

  const handleGenerate = async () => {
    if (itemsToTransform.length === 0) return;
    setIsGenerating(true);
    try {
      const output = await aiService.transform({
        items: itemsToTransform,
        transformType,
        customInstructions: customInstructions.trim() || undefined,
      });
      setResult(output);
    } catch (err) {
      console.error('Transform error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsNote = async () => {
    if (!result) return;
    const newNote = await addItem({
      type: 'document',
      title: result.title,
      content: result.content,
      rawSummary: `Generated via AI Synthesis (${transformType}) across ${itemsToTransform.length} notes.`,
      topics: ['AI Synthesis', ...itemsToTransform.flatMap((i) => i.topics || []).slice(0, 3)],
      actionItems: result.suggestedTasks.map((t, idx) => ({
        id: `act-gen-${Date.now()}-${idx}`,
        text: t,
        done: false,
        priority: 'medium',
      })),
      connections: itemsToTransform.map((orig) => ({
        targetId: orig.id,
        targetTitle: orig.title,
        reason: 'Synthesized source material',
        strength: 0.9,
        type: 'foundation',
      })),
    });

    onClose();
    setSelectedItemId(newNote.id);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`# ${result.title}\n\n${result.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E4E6F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAEBF0] flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-aurora flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Knowledge Synthesizer</h2>
              <p className="text-xs text-slate-500">
                Transform {itemsToTransform.length} selected notes into high-order knowledge artifacts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Source items pill list */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Source Material ({itemsToTransform.length} items):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {itemsToTransform.map((item) => (
                <span
                  key={item.id}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#F6F7FC] border border-[#E4E6F0] text-slate-700 font-medium truncate max-w-xs"
                >
                  {item.title}
                </span>
              ))}
            </div>
          </div>

          {/* Transformation Format Selection */}
          {!result && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 block">
                  Select Output Format:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transformOptions.map((opt) => {
                    const isSelected = transformType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTransformType(opt.id)}
                        className={`p-4 rounded-2xl text-left border transition-all space-y-1 ${
                          isSelected
                            ? 'bg-[#F0EEFF] border-[#7B61FF] ring-2 ring-[#7B61FF]/20 shadow-xs'
                            : 'bg-white border-[#EAEBF0] hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{opt.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Custom Guidance (Optional):
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus specifically on parametric design formulas and pricing risks..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl bg-aurora text-white text-xs font-semibold shadow-md shadow-[#7B61FF]/25 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Knowledge Artifact with Gemini 2.5...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {transformType}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generated Result Preview */}
          {result && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7B61FF]">
                    {transformType}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{result.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-[#E4E6F0] text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => setResult(null)}
                    className="px-3 py-1.5 rounded-xl border border-[#E4E6F0] text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Re-generate
                  </button>
                </div>
              </div>

              {/* Rendered Markdown Output */}
              <div className="p-5 rounded-2xl bg-[#FAFBFD] border border-[#EAEBF0] text-xs leading-relaxed max-h-72 overflow-y-auto prose prose-sm max-w-none">
                <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>

              {/* Extracted Tasks */}
              {result.suggestedTasks && result.suggestedTasks.length > 0 && (
                <div className="space-y-2 p-4 rounded-2xl bg-[#F0EEFF]/50 border border-[#E4DEFF]">
                  <span className="text-xs font-bold text-[#7B61FF] block">
                    Derived Action Commitments ({result.suggestedTasks.length}):
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                    {result.suggestedTasks.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Save CTA */}
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>

                <button
                  onClick={handleSaveAsNote}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-md shadow-[#7B61FF]/25 hover:opacity-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save as Living Knowledge Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
