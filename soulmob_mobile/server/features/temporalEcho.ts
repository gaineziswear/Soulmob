/**
 * Temporal Echo - On-device memory and context management
 * Provides queryable access to user's past interactions and context
 */

export interface MemoryEntry {
  id: string;
  userId: string;
  contentType: 'message' | 'photo' | 'note' | 'calendar' | 'email' | 'voice';
  content: string;
  embedding?: number[]; // Vector embedding for semantic search
  metadata: {
    sender?: string;
    recipient?: string;
    timestamp: number;
    source?: string;
    tags?: string[];
    sentiment?: number; // -1 to 1
  };
  expiresAt?: number; // TTL in milliseconds
  createdAt: number;
}

export interface MemoryQuery {
  userId: string;
  query: string;
  embedding?: number[];
  contentTypes?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
  limit?: number;
  minSimilarity?: number; // 0-1
}

export interface QueryResult {
  entries: MemoryEntry[];
  totalCount: number;
  queryTime: number;
}

/**
 * Simple vector similarity calculation (cosine similarity)
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Temporal Echo Engine
 */
export class TemporalEchoEngine {
  private memories: Map<string, MemoryEntry[]> = new Map();
  private embeddings: Map<string, number[][]> = new Map();

  /**
   * Store a memory entry
   */
  storeMemory(entry: MemoryEntry): void {
    if (!this.memories.has(entry.userId)) {
      this.memories.set(entry.userId, []);
      this.embeddings.set(entry.userId, []);
    }

    this.memories.get(entry.userId)!.push(entry);

    // Store embedding if provided
    if (entry.embedding) {
      this.embeddings.get(entry.userId)!.push(entry.embedding);
    }
  }

  /**
   * Query memories using semantic search
   */
  queryMemories(queryParams: MemoryQuery): QueryResult {
    const startTime = Date.now();
    const userMemories = this.memories.get(queryParams.userId) || [];

    let results = userMemories;

    // Filter by content type
    if (queryParams.contentTypes && queryParams.contentTypes.length > 0) {
      results = results.filter((m) => queryParams.contentTypes!.includes(m.contentType));
    }

    // Filter by time range
    if (queryParams.timeRange) {
      results = results.filter(
        (m) => m.createdAt >= queryParams.timeRange!.start && m.createdAt <= queryParams.timeRange!.end
      );
    }

    // Semantic search if embedding provided
    if (queryParams.embedding) {
      const minSimilarity = queryParams.minSimilarity || 0.5;
      const userEmbeddings = this.embeddings.get(queryParams.userId) || [];

      results = results
        .map((memory, index) => {
          const similarity = userEmbeddings[index] ? cosineSimilarity(queryParams.embedding!, userEmbeddings[index]) : 0;
          return { memory, similarity };
        })
        .filter(({ similarity }) => similarity >= minSimilarity)
        .sort(({ similarity: a }, { similarity: b }) => b - a)
        .map(({ memory }) => memory);
    }

    // Limit results
    const limit = queryParams.limit || 10;
    const limitedResults = results.slice(0, limit);

    const queryTime = Date.now() - startTime;

    return {
      entries: limitedResults,
      totalCount: results.length,
      queryTime,
    };
  }

  /**
   * Get recent memories
   */
  getRecentMemories(userId: string, limit: number = 10): MemoryEntry[] {
    const userMemories = this.memories.get(userId) || [];
    return userMemories.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }

  /**
   * Clean up expired memories
   */
  cleanupExpiredMemories(userId: string): number {
    const userMemories = this.memories.get(userId) || [];
    const now = Date.now();
    const beforeCount = userMemories.length;

    const filtered = userMemories.filter((m) => !m.expiresAt || m.expiresAt > now);

    this.memories.set(userId, filtered);

    return beforeCount - filtered.length;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(userId: string): {
    totalMemories: number;
    byContentType: Record<string, number>;
    oldestMemory?: number;
    newestMemory?: number;
  } {
    const userMemories = this.memories.get(userId) || [];

    const byContentType: Record<string, number> = {};
    userMemories.forEach((m) => {
      byContentType[m.contentType] = (byContentType[m.contentType] || 0) + 1;
    });

    const timestamps = userMemories.map((m) => m.createdAt);

    return {
      totalMemories: userMemories.length,
      byContentType,
      oldestMemory: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestMemory: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
    };
  }
}

/**
 * Example usage and test helper
 */
export function createSampleMemories(): MemoryEntry[] {
  const now = Date.now();

  return [
    {
      id: '1',
      userId: 'user-123',
      contentType: 'message',
      content: 'Hey, running late for the meeting',
      metadata: {
        sender: 'alice@example.com',
        timestamp: now - 3600000, // 1 hour ago
        source: 'WhatsApp',
        sentiment: 0.3,
      },
      createdAt: now - 3600000,
    },
    {
      id: '2',
      userId: 'user-123',
      contentType: 'email',
      content: 'Project deadline has been moved to next Friday',
      metadata: {
        sender: 'boss@company.com',
        timestamp: now - 7200000, // 2 hours ago
        source: 'Gmail',
        sentiment: 0.5,
      },
      createdAt: now - 7200000,
    },
    {
      id: '3',
      userId: 'user-123',
      contentType: 'note',
      content: 'Remember to buy groceries on the way home',
      metadata: {
        timestamp: now - 1800000, // 30 minutes ago
        tags: ['personal', 'todo'],
      },
      createdAt: now - 1800000,
    },
  ];
}
