import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  KnowledgeItem, 
  Project, 
  Collection, 
  MemoryInsight, 
  ViewTab, 
  ItemType, 
  ItemStatus,
  ActionItem,
  UserProfile
} from '../types';
import { 
  SEED_KNOWLEDGE_ITEMS, 
  SEED_PROJECTS, 
  SEED_COLLECTIONS, 
  SEED_MEMORY_INSIGHTS 
} from '../data/seedData';
import { aiService } from '../services/aiService';

interface KnowledgeContextType {
  // Auth state
  currentUser: UserProfile | null;
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;

  items: KnowledgeItem[];
  projects: Project[];
  collections: Collection[];
  memoryInsights: MemoryInsight[];
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  isCaptureOpen: boolean;
  setIsCaptureOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  selectedTypeFilter: ItemType | 'all';
  setSelectedTypeFilter: (type: ItemType | 'all') => void;
  selectedStatusFilter: ItemStatus | 'all';
  setSelectedStatusFilter: (status: ItemStatus | 'all') => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;
  
  // Knowledge Operations
  addItem: (item: Partial<KnowledgeItem>, autoUnderstand?: boolean) => Promise<KnowledgeItem>;
  updateItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  deleteItem: (id: string) => void;
  archiveItem: (id: string) => void;
  pinItem: (id: string) => void;
  processInboxItem: (id: string) => Promise<void>;
  
  // Task Operations
  toggleTask: (originItemId: string, taskId: string) => void;
  addTask: (originItemId: string, text: string, priority?: 'high' | 'medium' | 'low', projectId?: string) => void;
  deleteTask: (originItemId: string, taskId: string) => void;
  
  // Project Operations
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  linkItemToProject: (itemId: string, projectId: string) => void;
  
  // Collection Operations
  addCollection: (col: Omit<Collection, 'id' | 'createdAt'>) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  linkItemToCollection: (itemId: string, collectionId: string) => void;
  
  // AI Connect & Sync
  runGraphConnectionAnalysis: () => Promise<void>;
  isAnalyzingConnections: boolean;
  
  // Export & Import
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetToSampleData: () => void;

  // Stats
  inboxCount: number;
  openTasksCount: number;
  activeProjectsCount: number;
  totalConnectionsCount: number;
  allTopics: string[];
  allEntities: string[];
}

const STORAGE_KEY_ITEMS = 'nuvora_knowledge_items_v1';
const STORAGE_KEY_PROJECTS = 'nuvora_projects_v1';
const STORAGE_KEY_COLLECTIONS = 'nuvora_collections_v1';
const STORAGE_KEY_INSIGHTS = 'nuvora_insights_v1';
const STORAGE_KEY_USER = 'nuvora_user_session_v1';

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export const KnowledgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.warn('Failed to load user from storage:', e);
    }
    return null;
  });

  // Sync user to storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      console.error('Failed to sync user storage:', e);
    }
  }, [currentUser]);

  const loginWithGoogle = async (email?: string, name?: string) => {
    const userEmail = email || 'alex.chen@nuvora.ai';
    const userName = name || (email ? email.split('@')[0] : 'Alex Chen');
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: userName,
      email: userEmail,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
  };

  const loginWithEmail = async (email: string, name?: string) => {
    const userEmail = email.trim() || 'user@nuvora.ai';
    const userName = name || userEmail.split('@')[0];
    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      name: userName,
      email: userEmail,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
  };

  const loginAsGuest = () => {
    const user: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Explorer',
      email: 'guest@nuvora.local',
      provider: 'guest',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Load initial state from LocalStorage or seed data
  const [items, setItems] = useState<KnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load items from storage, using seed data:', e);
    }
    return SEED_KNOWLEDGE_ITEMS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load projects from storage:', e);
    }
    return SEED_PROJECTS;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load collections from storage:', e);
    }
    return SEED_COLLECTIONS;
  });

  const [memoryInsights, setMemoryInsights] = useState<MemoryInsight[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSIGHTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load insights from storage:', e);
    }
    return SEED_MEMORY_INSIGHTS;
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ItemType | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isAnalyzingConnections, setIsAnalyzingConnections] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items to storage:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections));
    } catch (e) {
      console.error('Failed to save collections to storage:', e);
    }
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INSIGHTS, JSON.stringify(memoryInsights));
    } catch (e) {
      console.error('Failed to save insights to storage:', e);
    }
  }, [memoryInsights]);

  // Add Item
  const addItem = useCallback(async (
    itemData: Partial<KnowledgeItem>,
    autoUnderstand: boolean = true
  ): Promise<KnowledgeItem> => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const now = new Date().toISOString();
    
    let newItem: KnowledgeItem = {
      id,
      type: itemData.type || 'note',
      title: itemData.title || 'Untitled Capture',
      content: itemData.content || '',
      rawSummary: itemData.rawSummary || '',
      status: itemData.status || (autoUnderstand ? 'processed' : 'inbox'),
      topics: itemData.topics || [],
      entities: itemData.entities || [],
      actionItems: itemData.actionItems || [],
      connections: itemData.connections || [],
      keyInsights: itemData.keyInsights || [],
      category: itemData.category || 'concept',
      projectId: itemData.projectId,
      collectionId: itemData.collectionId,
      sourceUrl: itemData.sourceUrl,
      mediaUrl: itemData.mediaUrl,
      wordCount: (itemData.content || '').trim().split(/\s+/).filter(Boolean).length,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
    };

    // If autoUnderstand is requested and we have text, run AI understanding
    if (autoUnderstand && (newItem.content || newItem.title)) {
      try {
        const aiResult = await aiService.understand({
          text: newItem.content,
          title: newItem.title !== 'Untitled Capture' ? newItem.title : undefined,
          type: newItem.type,
          sourceUrl: newItem.sourceUrl,
        });

        if (aiResult) {
          const generatedTasks: ActionItem[] = (aiResult.actionItems || []).map((t, idx) => ({
            id: `act-${id}-${idx}-${Date.now()}`,
            text: t.text,
            done: false,
            priority: t.priority || 'medium',
            suggestedTimeframe: (t.suggestedTimeframe as any) || 'this-week',
            originItemId: id,
            originItemTitle: aiResult.title || newItem.title,
            projectId: newItem.projectId,
          }));

          newItem = {
            ...newItem,
            title: aiResult.title || newItem.title,
            rawSummary: aiResult.summary || newItem.rawSummary,
            topics: Array.from(new Set([...newItem.topics, ...(aiResult.topics || [])])),
            entities: Array.from(new Set([...newItem.entities, ...(aiResult.entities || [])])),
            actionItems: [...newItem.actionItems, ...generatedTasks],
            keyInsights: aiResult.keyInsights || [],
            category: aiResult.category || newItem.category,
            status: 'processed',
          };
        }
      } catch (err) {
        console.warn('Auto-understand error, saving standard capture:', err);
      }
    }

    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  // Update Item
  const updateItem = useCallback((id: string, updates: Partial<KnowledgeItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        if (updates.content !== undefined) {
          updated.wordCount = updates.content.trim().split(/\s+/).filter(Boolean).length;
        }
        return updated;
      })
    );
  }, []);

  // Delete Item
  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  }, [selectedItemId]);

  // Archive Item
  const archiveItem = useCallback((id: string) => {
    updateItem(id, { status: 'archived' });
  }, [updateItem]);

  // Pin Item
  const pinItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 'pinned' ? 'processed' : 'pinned' } : item
      )
    );
  }, []);

  // Process an inbox item
  const processInboxItem = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      const aiResult = await aiService.understand({
        text: item.content,
        title: item.title,
        type: item.type,
        sourceUrl: item.sourceUrl,
      });

      const newTasks: ActionItem[] = (aiResult.actionItems || []).map((t, idx) => ({
        id: `act-${id}-${idx}-${Date.now()}`,
        text: t.text,
        done: false,
        priority: t.priority || 'medium',
        suggestedTimeframe: (t.suggestedTimeframe as any) || 'this-week',
        originItemId: id,
        originItemTitle: aiResult.title || item.title,
        projectId: item.projectId,
      }));

      updateItem(id, {
        title: aiResult.title || item.title,
        rawSummary: aiResult.summary,
        topics: aiResult.topics,
        entities: aiResult.entities,
        actionItems: [...item.actionItems, ...newTasks],
        keyInsights: aiResult.keyInsights,
        category: aiResult.category,
        status: 'processed',
      });
    } catch (err) {
      console.error('Failed to process inbox item:', err);
      updateItem(id, { status: 'processed' });
    }
  }, [items, updateItem]);

  // Task Operations
  const toggleTask = useCallback((originItemId: string, taskId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== originItemId) return item;
        return {
          ...item,
          actionItems: item.actionItems.map((act) =>
            act.id === taskId ? { ...act, done: !act.done } : act
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addTask = useCallback((
    originItemId: string, 
    text: string, 
    priority: 'high' | 'medium' | 'low' = 'medium',
    projectId?: string
  ) => {
    const origin = items.find((i) => i.id === originItemId);
    const newTask: ActionItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text,
      done: false,
      priority,
      originItemId,
      originItemTitle: origin?.title || 'Direct Task',
      projectId,
    };

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== originItemId) return item;
        return {
          ...item,
          actionItems: [...item.actionItems, newTask],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [items]);

  const deleteTask = useCallback((originItemId: string, taskId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== originItemId) return item;
        return {
          ...item,
          actionItems: item.actionItems.filter((t) => t.id !== taskId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Project Operations
  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const newProj: Project = {
      ...projectData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Remove project reference from items
    setItems((prev) =>
      prev.map((item) => (item.projectId === id ? { ...item, projectId: undefined } : item))
    );
  }, []);

  const linkItemToProject = useCallback((itemId: string, projectId: string) => {
    updateItem(itemId, { projectId });
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && !p.linkedItemIds.includes(itemId)) {
          return { ...p, linkedItemIds: [...p.linkedItemIds, itemId] };
        }
        return p;
      })
    );
  }, [updateItem]);

  // Collection Operations
  const addCollection = useCallback((colData: Omit<Collection, 'id' | 'createdAt'>) => {
    const id = `col-${Date.now()}`;
    const newCol: Collection = {
      ...colData,
      id,
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => [newCol, ...prev]);
    return newCol;
  }, []);

  const updateCollection = useCallback((id: string, updates: Partial<Collection>) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setItems((prev) =>
      prev.map((item) => (item.collectionId === id ? { ...item, collectionId: undefined } : item))
    );
  }, []);

  const linkItemToCollection = useCallback((itemId: string, collectionId: string) => {
    updateItem(itemId, { collectionId });
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id === collectionId && !c.itemIds.includes(itemId)) {
          return { ...c, itemIds: [...c.itemIds, itemId] };
        }
        return c;
      })
    );
  }, [updateItem]);

  // Graph Connection Analysis
  const runGraphConnectionAnalysis = useCallback(async () => {
    if (items.length < 2) return;
    setIsAnalyzingConnections(true);
    try {
      const result = await aiService.connect(items);
      if (result && result.connections) {
        // Merge discovered connections into items
        setItems((prev) => {
          const map = new Map(prev.map((i) => [i.id, { ...i, connections: [...i.connections] }]));
          
          for (const conn of result.connections) {
            const source = map.get(conn.sourceId);
            const target = map.get(conn.targetId);
            if (source && target) {
              const exists = source.connections.some((c) => c.targetId === conn.targetId);
              if (!exists) {
                source.connections.push({
                  targetId: conn.targetId,
                  targetTitle: target.title,
                  reason: conn.reason,
                  strength: conn.strength,
                  type: conn.type,
                });
              }
            }
          }
          return Array.from(map.values());
        });
      }

      if (result && result.insights && result.insights.length > 0) {
        const newInsights: MemoryInsight[] = result.insights.map((ins, idx) => ({
          id: `ins-${Date.now()}-${idx}`,
          title: ins.title,
          description: ins.description,
          type: ins.type as any,
          relatedItemIds: ins.relatedItemIds,
          date: new Date().toISOString(),
        }));
        setMemoryInsights((prev) => [...newInsights, ...prev]);
      }
    } catch (err) {
      console.error('Error running connection analysis:', err);
    } finally {
      setIsAnalyzingConnections(false);
    }
  }, [items]);

  // Export Data
  const exportData = useCallback(() => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items,
      projects,
      collections,
      memoryInsights,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuvora_knowledge_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items, projects, collections, memoryInsights]);

  // Import Data
  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.items && Array.isArray(parsed.items)) {
        setItems(parsed.items);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.collections) setCollections(parsed.collections);
        if (parsed.memoryInsights) setMemoryInsights(parsed.memoryInsights);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup JSON file:', e);
    }
    return false;
  }, []);

  // Reset to Sample Data
  const resetToSampleData = useCallback(() => {
    setItems(SEED_KNOWLEDGE_ITEMS);
    setProjects(SEED_PROJECTS);
    setCollections(SEED_COLLECTIONS);
    setMemoryInsights(SEED_MEMORY_INSIGHTS);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    localStorage.removeItem(STORAGE_KEY_COLLECTIONS);
    localStorage.removeItem(STORAGE_KEY_INSIGHTS);
  }, []);

  // Computed counts & sets
  const inboxCount = useMemo(() => items.filter((i) => i.status === 'inbox').length, [items]);
  
  const openTasksCount = useMemo(() => {
    let count = 0;
    for (const item of items) {
      for (const t of item.actionItems) {
        if (!t.done) count++;
      }
    }
    return count;
  }, [items]);

  const activeProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'active').length,
    [projects]
  );

  const totalConnectionsCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.connections?.length || 0), 0);
  }, [items]);

  const allTopics = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => (item.topics || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const allEntities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => (item.entities || []).forEach((e) => set.add(e)));
    return Array.from(set).sort();
  }, [items]);

  return (
    <KnowledgeContext.Provider
      value={{
        currentUser,
        loginWithGoogle,
        loginWithEmail,
        loginAsGuest,
        logout,

        items,
        projects,
        collections,
        memoryInsights,
        activeTab,
        setActiveTab,
        selectedItemId,
        setSelectedItemId,
        isCaptureOpen,
        setIsCaptureOpen,
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

        addItem,
        updateItem,
        deleteItem,
        archiveItem,
        pinItem,
        processInboxItem,

        toggleTask,
        addTask,
        deleteTask,

        addProject,
        updateProject,
        deleteProject,
        linkItemToProject,

        addCollection,
        updateCollection,
        deleteCollection,
        linkItemToCollection,

        runGraphConnectionAnalysis,
        isAnalyzingConnections,

        exportData,
        importData,
        resetToSampleData,

        inboxCount,
        openTasksCount,
        activeProjectsCount,
        totalConnectionsCount,
        allTopics,
        allEntities,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => {
  const ctx = useContext(KnowledgeContext);
  if (!ctx) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return ctx;
};
