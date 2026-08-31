import React from 'react';
import { KnowledgeItem } from '../types';

/**
 * Tokenizes a search query into clean, unique words for matching.
 */
export function tokenizeQuery(query: string): string[] {
  if (!query || !query.trim()) return [];
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, ''))
    .filter((w) => w.length > 0);
  return Array.from(new Set(words));
}

/**
 * Strips common markdown formatting to produce clean plaintext for snippet extraction.
 */
export function cleanMarkdown(md: string): string {
  if (!md) return '';
  return md
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // link text
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // inline/block code
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italic
    .replace(/~~(.*?)~~/g, '$1') // strikethrough
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/^\s*[-+*]\s+/gm, '') // unordered lists
    .replace(/^\s*\d+\.\s+/gm, '') // ordered lists
    .replace(/\n+/g, ' ') // collapse newlines
    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
    .trim();
}

/**
 * Extracts a context snippet around the best match of query tokens in the text.
 */
export function extractMatchSnippet(
  text: string,
  query: string,
  maxLength: number = 180
): { snippet: string; matchWord: string; occurrences: number } | null {
  if (!text || !query.trim()) return null;

  const cleanText = cleanMarkdown(text);
  if (!cleanText) return null;

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return null;

  const lowerText = cleanText.toLowerCase();

  // Find all matches for all tokens
  const matchIndices: { index: number; token: string }[] = [];
  tokens.forEach((token) => {
    let pos = 0;
    while ((pos = lowerText.indexOf(token, pos)) !== -1) {
      matchIndices.push({ index: pos, token });
      pos += token.length;
    }
  });

  if (matchIndices.length === 0) return null;

  // Sort by index
  matchIndices.sort((a, b) => a.index - b.index);

  // Pick the first strong match as anchor
  const firstMatch = matchIndices[0];
  const matchIdx = firstMatch.index;
  const matchLen = firstMatch.token.length;

  // Calculate window boundaries
  const halfWindow = Math.floor(maxLength / 2);
  let startIdx = Math.max(0, matchIdx - halfWindow);
  let endIdx = Math.min(cleanText.length, matchIdx + matchLen + halfWindow);

  // Try expanding to word boundaries
  if (startIdx > 0) {
    const spaceBefore = cleanText.lastIndexOf(' ', startIdx);
    if (spaceBefore !== -1 && spaceBefore >= startIdx - 20) {
      startIdx = spaceBefore + 1;
    }
  }

  if (endIdx < cleanText.length) {
    const spaceAfter = cleanText.indexOf(' ', endIdx);
    if (spaceAfter !== -1 && spaceAfter <= endIdx + 20) {
      endIdx = spaceAfter;
    }
  }

  let snippet = cleanText.substring(startIdx, endIdx).trim();
  if (startIdx > 0) snippet = '… ' + snippet;
  if (endIdx < cleanText.length) snippet = snippet + ' …';

  return {
    snippet,
    matchWord: firstMatch.token,
    occurrences: matchIndices.length,
  };
}

/**
 * Extracts multiple distinct snippets across the text for deeper context.
 */
export function extractAllMatchSnippets(
  text: string,
  query: string,
  maxSnippets: number = 3,
  maxLength: number = 140
): string[] {
  if (!text || !query.trim()) return [];
  const cleanText = cleanMarkdown(text);
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [];

  const lowerText = cleanText.toLowerCase();
  const foundIndices: number[] = [];

  tokens.forEach((token) => {
    let pos = 0;
    while ((pos = lowerText.indexOf(token, pos)) !== -1) {
      foundIndices.push(pos);
      pos += Math.max(token.length, 120); // space them out
    }
  });

  if (foundIndices.length === 0) return [];
  foundIndices.sort((a, b) => a - b);

  const snippets: string[] = [];
  const halfWindow = Math.floor(maxLength / 2);

  for (let i = 0; i < Math.min(foundIndices.length, maxSnippets); i++) {
    const matchIdx = foundIndices[i];
    let startIdx = Math.max(0, matchIdx - halfWindow);
    let endIdx = Math.min(cleanText.length, matchIdx + halfWindow + 20);

    if (startIdx > 0) {
      const spaceBefore = cleanText.lastIndexOf(' ', startIdx);
      if (spaceBefore !== -1 && spaceBefore >= startIdx - 15) {
        startIdx = spaceBefore + 1;
      }
    }

    if (endIdx < cleanText.length) {
      const spaceAfter = cleanText.indexOf(' ', endIdx);
      if (spaceAfter !== -1 && spaceAfter <= endIdx + 15) {
        endIdx = spaceAfter;
      }
    }

    let snip = cleanText.substring(startIdx, endIdx).trim();
    if (startIdx > 0) snip = '… ' + snip;
    if (endIdx < cleanText.length) snip = snip + ' …';

    if (!snippets.some((s) => s === snip)) {
      snippets.push(snip);
    }
  }

  return snippets;
}

export type MatchLocationType = 'title' | 'summary' | 'content' | 'topic' | 'entity' | 'task' | 'connection';

export interface MatchAnalysis {
  hasMatch: boolean;
  score: number;
  matchesTitle: boolean;
  matchesSummary: boolean;
  matchesContent: boolean;
  matchedTopics: string[];
  matchedEntities: string[];
  matchedActions: { id: string; text: string }[];
  matchedConnections: { targetTitle: string; reason: string }[];
  locations: MatchLocationType[];
  primarySnippet: {
    location: MatchLocationType;
    label: string;
    text: string;
    occurrences: number;
  } | null;
  allContentSnippets: string[];
  totalOccurrences: number;
}

/**
 * Performs deep semantic inspection on a KnowledgeItem against a search query,
 * identifying all matched fields, ranking relevance, and creating highlighted excerpts.
 */
export function analyzeItemSearchMatch(item: KnowledgeItem, query: string): MatchAnalysis {
  if (!query || !query.trim()) {
    return {
      hasMatch: true,
      score: 0,
      matchesTitle: false,
      matchesSummary: false,
      matchesContent: false,
      matchedTopics: [],
      matchedEntities: [],
      matchedActions: [],
      matchedConnections: [],
      locations: [],
      primarySnippet: null,
      allContentSnippets: [],
      totalOccurrences: 0,
    };
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return {
      hasMatch: true,
      score: 0,
      matchesTitle: false,
      matchesSummary: false,
      matchesContent: false,
      matchedTopics: [],
      matchedEntities: [],
      matchedActions: [],
      matchedConnections: [],
      locations: [],
      primarySnippet: null,
      allContentSnippets: [],
      totalOccurrences: 0,
    };
  }

  const qLower = query.trim().toLowerCase();
  const titleLower = item.title.toLowerCase();
  const summaryLower = (item.rawSummary || '').toLowerCase();
  const contentLower = item.content.toLowerCase();

  // 1. Check Title
  const matchesTitle = tokens.some((t) => titleLower.includes(t));
  const exactTitleMatch = titleLower.includes(qLower);

  // 2. Check Summary
  const matchesSummary = tokens.some((t) => summaryLower.includes(t));
  const summarySnippetData = matchesSummary && item.rawSummary ? extractMatchSnippet(item.rawSummary, query, 160) : null;

  // 3. Check Content
  const matchesContent = tokens.some((t) => contentLower.includes(t));
  const contentSnippetData = matchesContent ? extractMatchSnippet(item.content, query, 180) : null;
  const allContentSnippets = matchesContent ? extractAllMatchSnippets(item.content, query, 2, 140) : [];

  // 4. Check Topics
  const matchedTopics = (item.topics || []).filter((t) =>
    tokens.some((token) => t.toLowerCase().includes(token))
  );

  // 5. Check Entities
  const matchedEntities = (item.entities || []).filter((e) =>
    tokens.some((token) => e.toLowerCase().includes(token))
  );

  // 6. Check Action Items
  const matchedActions = (item.actionItems || [])
    .filter((a) => tokens.some((t) => a.text.toLowerCase().includes(t)))
    .map((a) => ({ id: a.id, text: a.text }));

  // 7. Check Connections
  const matchedConnections = (item.connections || [])
    .filter((c) => 
      tokens.some((t) => (c.targetTitle || '').toLowerCase().includes(t) || c.reason.toLowerCase().includes(t))
    )
    .map((c) => ({ targetTitle: c.targetTitle || '', reason: c.reason }));

  const locations: MatchLocationType[] = [];
  if (matchesTitle) locations.push('title');
  if (matchesContent) locations.push('content');
  if (matchesSummary) locations.push('summary');
  if (matchedTopics.length > 0) locations.push('topic');
  if (matchedEntities.length > 0) locations.push('entity');
  if (matchedActions.length > 0) locations.push('task');
  if (matchedConnections.length > 0) locations.push('connection');

  const hasMatch = locations.length > 0;

  // Calculate occurrences and score
  let totalOccurrences = 0;
  if (contentSnippetData) totalOccurrences += contentSnippetData.occurrences;
  if (summarySnippetData) totalOccurrences += summarySnippetData.occurrences;
  if (matchesTitle) totalOccurrences += 1;
  totalOccurrences += matchedTopics.length + matchedEntities.length + matchedActions.length;

  let score = 0;
  if (exactTitleMatch) score += 100;
  else if (matchesTitle) score += 60;
  if (matchedTopics.length > 0) score += 40 * matchedTopics.length;
  if (matchesSummary) score += 30;
  if (matchesContent) score += 20 + Math.min(totalOccurrences * 2, 20);
  if (matchedActions.length > 0) score += 25;
  if (matchedEntities.length > 0) score += 15;

  // Determine primary display snippet
  let primarySnippet: MatchAnalysis['primarySnippet'] = null;

  if (contentSnippetData) {
    primarySnippet = {
      location: 'content',
      label: 'Matched in Document Content',
      text: contentSnippetData.snippet,
      occurrences: contentSnippetData.occurrences,
    };
  } else if (summarySnippetData) {
    primarySnippet = {
      location: 'summary',
      label: 'Matched in Executive Summary',
      text: summarySnippetData.snippet,
      occurrences: summarySnippetData.occurrences,
    };
  } else if (matchedActions.length > 0) {
    primarySnippet = {
      location: 'task',
      label: 'Matched in Action Task',
      text: matchedActions[0].text,
      occurrences: matchedActions.length,
    };
  } else if (matchedTopics.length > 0) {
    primarySnippet = {
      location: 'topic',
      label: 'Matched in Topic Taxonomy',
      text: `Topic tag: "${matchedTopics.join(', ')}"`,
      occurrences: matchedTopics.length,
    };
  } else if (matchedEntities.length > 0) {
    primarySnippet = {
      location: 'entity',
      label: 'Matched in Extracted Entity',
      text: `Entity: "${matchedEntities.join(', ')}"`,
      occurrences: matchedEntities.length,
    };
  }

  return {
    hasMatch,
    score,
    matchesTitle,
    matchesSummary,
    matchesContent,
    matchedTopics,
    matchedEntities,
    matchedActions,
    matchedConnections,
    locations,
    primarySnippet,
    allContentSnippets,
    totalOccurrences,
  };
}

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders text with all occurrences of search query tokens wrapped in styled highlight marks.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-[#FEEA9F] text-[#543805] font-semibold px-1 py-0.5 rounded-sm shadow-2xs transition-all',
  fallback = null,
}) => {
  if (!text) return <>{fallback}</>;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex matching any of the tokens (case-insensitive)
  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <mark
              key={index}
              className={highlightClassName}
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
