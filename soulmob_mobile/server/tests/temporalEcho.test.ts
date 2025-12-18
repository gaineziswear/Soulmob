import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalEchoEngine, createSampleMemories } from '../features/temporalEcho';

describe('Temporal Echo Engine', () => {
  let engine: TemporalEchoEngine;

  beforeEach(() => {
    engine = new TemporalEchoEngine();
  });

  describe('storeMemory', () => {
    it('should store a memory entry', () => {
      const memory = {
        id: '1',
        userId: 'user-1',
        contentType: 'message' as const,
        content: 'Hello world',
        metadata: { timestamp: Date.now() },
        createdAt: Date.now(),
      };

      engine.storeMemory(memory);
      const stats = engine.getMemoryStats('user-1');

      expect(stats.totalMemories).toBe(1);
    });

    it('should store multiple memories for same user', () => {
      const memories = createSampleMemories();

      memories.forEach((m) => engine.storeMemory(m));

      const stats = engine.getMemoryStats('user-123');
      expect(stats.totalMemories).toBe(3);
    });
  });

  describe('queryMemories', () => {
    beforeEach(() => {
      const memories = createSampleMemories();
      memories.forEach((m) => engine.storeMemory(m));
    });

    it('should query memories by content type', () => {
      const result = engine.queryMemories({
        userId: 'user-123',
        query: 'test',
        contentTypes: ['message'],
      });

      expect(result.entries.length).toBe(1);
      expect(result.entries[0].contentType).toBe('message');
    });

    it('should query memories by time range', () => {
      const now = Date.now();
      const result = engine.queryMemories({
        userId: 'user-123',
        query: 'test',
        timeRange: {
          start: now - 5 * 3600000, // 5 hours ago
          end: now - 1 * 3600000, // 1 hour ago
        },
      });

      expect(result.entries.length).toBeGreaterThan(0);
    });

    it('should return total count of matching memories', () => {
      const result = engine.queryMemories({
        userId: 'user-123',
        query: 'test',
      });

      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('should respect limit parameter', () => {
      const result = engine.queryMemories({
        userId: 'user-123',
        query: 'test',
        limit: 1,
      });

      expect(result.entries.length).toBeLessThanOrEqual(1);
    });

    it('should return query time', () => {
      const result = engine.queryMemories({
        userId: 'user-123',
        query: 'test',
      });

      expect(result.queryTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecentMemories', () => {
    beforeEach(() => {
      const memories = createSampleMemories();
      memories.forEach((m) => engine.storeMemory(m));
    });

    it('should return recent memories in order', () => {
      const recent = engine.getRecentMemories('user-123', 2);

      expect(recent.length).toBeLessThanOrEqual(2);
      expect(recent[0].createdAt).toBeGreaterThanOrEqual(recent[1]?.createdAt || 0);
    });

    it('should respect limit parameter', () => {
      const recent = engine.getRecentMemories('user-123', 1);

      expect(recent.length).toBeLessThanOrEqual(1);
    });
  });

  describe('cleanupExpiredMemories', () => {
    it('should remove expired memories', () => {
      const now = Date.now();
      const expiredMemory = {
        id: '1',
        userId: 'user-1',
        contentType: 'note' as const,
        content: 'Expired note',
        metadata: { timestamp: now },
        expiresAt: now - 1000, // Expired 1 second ago
        createdAt: now - 1000,
      };

      const validMemory = {
        id: '2',
        userId: 'user-1',
        contentType: 'note' as const,
        content: 'Valid note',
        metadata: { timestamp: now },
        expiresAt: now + 1000, // Expires in 1 second
        createdAt: now,
      };

      engine.storeMemory(expiredMemory);
      engine.storeMemory(validMemory);

      const removed = engine.cleanupExpiredMemories('user-1');

      expect(removed).toBe(1);
      expect(engine.getMemoryStats('user-1').totalMemories).toBe(1);
    });

    it('should not remove memories without expiry', () => {
      const memory = {
        id: '1',
        userId: 'user-1',
        contentType: 'note' as const,
        content: 'Permanent note',
        metadata: { timestamp: Date.now() },
        createdAt: Date.now(),
      };

      engine.storeMemory(memory);
      const removed = engine.cleanupExpiredMemories('user-1');

      expect(removed).toBe(0);
      expect(engine.getMemoryStats('user-1').totalMemories).toBe(1);
    });
  });

  describe('getMemoryStats', () => {
    beforeEach(() => {
      const memories = createSampleMemories();
      memories.forEach((m) => engine.storeMemory(m));
    });

    it('should return correct total count', () => {
      const stats = engine.getMemoryStats('user-123');

      expect(stats.totalMemories).toBe(3);
    });

    it('should count memories by content type', () => {
      const stats = engine.getMemoryStats('user-123');

      expect(stats.byContentType['message']).toBe(1);
      expect(stats.byContentType['email']).toBe(1);
      expect(stats.byContentType['note']).toBe(1);
    });

    it('should track oldest and newest memories', () => {
      const stats = engine.getMemoryStats('user-123');

      expect(stats.oldestMemory).toBeLessThanOrEqual(stats.newestMemory || 0);
    });

    it('should return empty stats for non-existent user', () => {
      const stats = engine.getMemoryStats('non-existent');

      expect(stats.totalMemories).toBe(0);
      expect(stats.byContentType).toEqual({});
      expect(stats.oldestMemory).toBeUndefined();
      expect(stats.newestMemory).toBeUndefined();
    });
  });
});
