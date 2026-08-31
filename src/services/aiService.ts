import { KnowledgeItem, ConnectionLink, MemoryInsight } from '../types';

export interface UnderstandResult {
  title: string;
  summary: string;
  topics: string[];
  entities: string[];
  actionItems: { text: string; priority: 'high' | 'medium' | 'low'; suggestedTimeframe?: string }[];
  keyInsights: string[];
  suggestedConnections: string[];
  category?: string;
}

export interface AskResult {
  answer: string;
  sourceItemIds: string[];
  suggestedActions: string[];
  relatedTopics: string[];
  temporalMemory?: string;
}

export interface ConnectResult {
  connections: {
    sourceId: string;
    targetId: string;
    reason: string;
    type: 'semantic' | 'project_opportunity' | 'contradiction' | 'foundation';
    strength: number;
  }[];
  insights: {
    title: string;
    description: string;
    type: 'forgotten_idea' | 'repeated_thought' | 'potential_project' | 'knowledge_gap';
    relatedItemIds: string[];
  }[];
}

export interface TransformResult {
  title: string;
  content: string;
  suggestedTasks: string[];
  targetOutcome: string;
}

export interface DailyDigestResult {
  greeting: string;
  headline: string;
  executiveSummary: string;
  coreFocus: string;
  suggestedPriorities: string[];
  knowledgeHighlight: string;
  productivityQuote: string;
}

export const aiService = {
  // 1. Understand a capture (extract title, summary, topics, entities, tasks, insights)
  async understand(payload: {
    text: string;
    title?: string;
    type?: string;
    sourceUrl?: string;
  }): Promise<UnderstandResult> {
    const res = await fetch('/api/gemini/understand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to understand capture');
    }

    return res.json();
  },

  // 2. Ask anything across the user's personal knowledge base
  async ask(payload: {
    query: string;
    items: KnowledgeItem[];
    history?: { role: string; content: string }[];
  }): Promise<AskResult> {
    const res = await fetch('/api/gemini/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to query knowledge base');
    }

    return res.json();
  },

  // 3. Multi-item semantic connect & pattern discovery
  async connect(items: KnowledgeItem[]): Promise<ConnectResult> {
    const res = await fetch('/api/gemini/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze connections');
    }

    return res.json();
  },

  // 4. Transform notes into structured action plans, briefs, or study guides
  async transform(payload: {
    items: KnowledgeItem[];
    transformType: string;
    customInstructions?: string;
  }): Promise<TransformResult> {
    const res = await fetch('/api/gemini/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to transform knowledge');
    }

    return res.json();
  },

  // 5. Transcribe voice thought
  async transcribeVoice(textAudioTranscription: string, context?: string) {
    const res = await fetch('/api/gemini/transcribe-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textAudioTranscription, context }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to transcribe voice');
    }

    return res.json();
  },

  // 6. Generate Daily Morning Briefing Digest
  async generateDailyDigest(payload: {
    items: KnowledgeItem[];
    projects: any[];
    userName?: string;
    targetDate?: string;
    formattedDate?: string;
  }): Promise<DailyDigestResult> {
    const res = await fetch('/api/gemini/daily-digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate daily digest');
    }

    return res.json();
  },
};
