import React, { useState } from 'react';
import { 
  FolderHeart, 
  Plus, 
  BookOpen, 
  ChevronRight, 
  Trash2, 
  Sparkles, 
  X,
  Layers,
  FileText
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { Collection } from '../../types';

export const CollectionsView: React.FC = () => {
  const { 
    collections, 
    items, 
    addCollection, 
    deleteCollection, 
    setSelectedItemId, 
    setSelectedCollectionId, 
    setActiveTab, 
    setIsCaptureOpen 
  } = useKnowledge();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7B61FF');
  const [icon, setIcon] = useState('FolderHeart');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCollection({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
      itemIds: [],
    });

    setName('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAEBF0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B0F19]">
            Themed Knowledge Vaults
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Collections are thematic home bases for deep domains, long-term research, and ongoing interests.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-aurora text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Collection</span>
        </button>
      </div>

      {/* New Collection Modal / Card */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-white border border-[#7B61FF]/40 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Create Themed Collection</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection Name (e.g. Architecture & Design)"
              required
              className="px-3.5 py-2 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 font-medium"
            />
            <div className="flex items-center space-x-2">
              <label className="text-xs text-slate-500 font-medium">Color Accent:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0"
              />
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description of the domain or research theme..."
            rows={2}
            className="w-full p-3 text-xs bg-[#F6F7FC] border border-[#E4E6F0] rounded-xl focus:ring-2 focus:ring-[#7B61FF]/30 resize-none"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-aurora text-white rounded-lg shadow-sm hover:opacity-95"
            >
              Save Collection
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          // Find all items in collection
          const colItems = items.filter((i) => i.collectionId === col.id);

          return (
            <div
              key={col.id}
              className="p-6 rounded-3xl bg-white border border-[#EAEBF0] hover:border-[#7B61FF]/40 hover:shadow-sm transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: col.color || '#7B61FF' }}
                  >
                    <FolderHeart className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {colItems.length} items
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#7B61FF] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {col.description}
                  </p>
                </div>
              </div>

              {/* Items List Inside Collection */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                {colItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes filed in this collection yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {colItems.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-[#FAFBFD] hover:bg-[#F0EEFF] text-left transition-colors text-xs text-slate-700 hover:text-[#7B61FF]"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* View all in knowledge library button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedCollectionId(col.id);
                      setActiveTab('knowledge');
                    }}
                    className="text-xs text-[#7B61FF] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Open in Library</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteCollection(col.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
