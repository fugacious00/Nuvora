export type ItemType = 
  | 'note' 
  | 'idea' 
  | 'document' 
  | 'voice' 
  | 'scan' 
  | 'web' 
  | 'task' 
  | 'meeting' 
  | 'bookmark'
  | 'file';

export type ItemStatus = 'inbox' | 'processed' | 'archived' | 'pinned';

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  suggestedTimeframe?: 'immediate' | 'this-week' | 'someday';
  projectId?: string;
  originItemId?: string;
  originItemTitle?: string;
}

export interface ConnectionLink {
  targetId: string;
  targetTitle?: string;
  reason: string;
  strength: number; // 0 to 1
  type: 'semantic' | 'project_opportunity' | 'contradiction' | 'foundation' | 'temporal';
}

export interface KnowledgeItem {
  id: string;
  type: ItemType;
  title: string;
  content: string;
  rawSummary?: string;
  status: ItemStatus;
  topics: string[];
  entities: string[];
  actionItems: ActionItem[];
  connections: ConnectionLink[];
  keyInsights?: string[];
  category?: string;
  projectId?: string;
  collectionId?: string;
  sourceUrl?: string;
  mediaUrl?: string;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planning' | 'completed' | 'abandoned';
  color: string;
  targetDate?: string;
  tags: string[];
  linkedItemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  itemIds: string[];
  createdAt: string;
}

export interface MemoryInsight {
  id: string;
  type: 'forgotten_idea' | 'repeated_thought' | 'connection_discovered' | 'unacted_task' | 'knowledge_gap';
  title: string;
  description: string;
  relatedItemIds: string[];
  date: string;
}

export interface AskMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sourceItemIds?: string[];
  suggestedActions?: string[];
  relatedTopics?: string[];
  temporalMemory?: string;
  timestamp: string;
}

export type ViewTab = 
  | 'home' 
  | 'inbox' 
  | 'knowledge' 
  | 'ask' 
  | 'projects' 
  | 'tasks' 
  | 'collections' 
  | 'graph' 
  | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email' | 'guest';
  createdAt: string;
}
