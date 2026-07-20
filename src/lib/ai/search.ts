// Keyword-based content search — no external API, no embeddings needed.
// Works entirely offline. We'll upgrade to real vector search later.

import { createAdminClient } from '../supabase/admin';

interface SearchResult {
  content: string;
  score: number;
  source: string;
}

function tokenize(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
    'her', 'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these',
    'those', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
    'not', 'no', 'nor', 'but', 'if', 'so', 'as', 'up', 'down', 'out',
    'about', 'into', 'over', 'after', 'before', 'between', 'through',
    'during', 'with', 'without', 'by', 'from', 'than', 'then', 'also',
    'very', 'just', 'can', 'need', 'like', 'more', 'some', 'any', 'every',
    'each', 'both', 'few', 'own', 'same', 'such', 'there', 'here',
  ]);

  return words.filter((w) => w.length > 1 && !stopWords.has(w));
}

function scoreChunk(chunk: string, queryTerms: string[]): number {
  const chunkLower = chunk.toLowerCase();
  const chunkTerms = tokenize(chunk);

  let score = 0;
  for (const term of queryTerms) {
    // Exact word match
    const matches = chunkTerms.filter((t) => t === term).length;
    if (matches > 0) {
      score += matches;
    }

    // Partial/substring match (lower weight)
    if (chunkLower.includes(term) && !chunkTerms.includes(term)) {
      score += 0.3;
    }
  }

  // Normalize by chunk length to avoid bias toward long chunks
  if (chunkTerms.length > 0) {
    score = score / Math.sqrt(chunkTerms.length);
  }

  return score;
}

export async function searchContent(query: string, limit = 5): Promise<SearchResult[]> {
  const queryTerms = tokenize(query);

  if (queryTerms.length === 0) {
    return [];
  }

  const supabase = createAdminClient();
  const results: SearchResult[] = [];

  // Get all project chunks
  const { data: projectChunks } = await supabase
    .from('project_embeddings')
    .select('id, content, project_id');

  if (projectChunks) {
    for (const chunk of projectChunks) {
      const score = scoreChunk(chunk.content, queryTerms);
      if (score > 0) {
        results.push({ content: chunk.content, score, source: 'project' });
      }
    }
  }

  // Get all profile chunks
  const { data: profileChunks } = await supabase
    .from('profile_embeddings')
    .select('id, content, profile_id');

  if (profileChunks) {
    for (const chunk of profileChunks) {
      const score = scoreChunk(chunk.content, queryTerms);
      if (score > 0) {
        results.push({ content: chunk.content, score, source: 'profile' });
      }
    }
  }

  // Sort by score descending and return top results
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

// Split content into chunks for storage
export function chunkText(text: string, maxChunkSize = 800): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.trim()];
}
