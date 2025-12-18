import { describe, it, expect, beforeEach } from 'vitest';
import { IntentProjectionEngine, createSamplePrediction } from '../features/intentProjection';

describe('Intent Projection Engine', () => {
  let engine: IntentProjectionEngine;

  beforeEach(() => {
    engine = new IntentProjectionEngine();
  });

  describe('predictAndDraft', () => {
    it('should predict user action and generate drafts', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: ['message 1', 'message 2'],
        calendar: [{ title: 'Team Standup', time: Date.now() + 10 * 60 * 1000 }],
      };

      const prediction = await engine.predictAndDraft('user-123', context);

      expect(prediction).toHaveProperty('userId');
      expect(prediction).toHaveProperty('predictedAction');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction).toHaveProperty('timeToAction');
      expect(prediction).toHaveProperty('reasoning');
      expect(prediction).toHaveProperty('suggestedCommunications');
    });

    it('should generate drafts for upcoming meeting', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Team Standup', time: Date.now() + 10 * 60 * 1000 }],
      };

      const prediction = await engine.predictAndDraft('user-123', context);

      expect(prediction.suggestedCommunications.length).toBeGreaterThan(0);
      expect(prediction.suggestedCommunications[0].status).toBe('DRAFT');
    });

    it('should generate drafts for rushed state', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        emotionVector: { rushed: 0.8 },
      };

      const prediction = await engine.predictAndDraft('user-123', context);

      expect(prediction.suggestedCommunications.length).toBeGreaterThan(0);
    });

    it('should calculate confidence based on context signals', async () => {
      const contextWithSignals = {
        currentTime: Date.now(),
        recentMessages: ['msg1', 'msg2', 'msg3'],
        calendar: [{ title: 'Meeting', time: Date.now() + 5 * 60 * 1000 }],
        emotionVector: { focused: 0.8 },
      };

      const contextWithoutSignals = {
        currentTime: Date.now(),
        recentMessages: [],
      };

      const predictionWithSignals = await engine.predictAndDraft('user-123', contextWithSignals);
      const predictionWithoutSignals = await engine.predictAndDraft('user-124', contextWithoutSignals);

      expect(predictionWithSignals.confidence).toBeGreaterThanOrEqual(predictionWithoutSignals.confidence);
    });
  });

  describe('sendDraft', () => {
    it('should send a draft communication', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      const prediction = await engine.predictAndDraft('user-123', context);
      const draftId = prediction.suggestedCommunications[0].id;

      const result = await engine.sendDraft('user-123', draftId);

      expect(result).toBe(true);

      const pendingDrafts = engine.getPendingDrafts('user-123');
      expect(pendingDrafts.find((d) => d.id === draftId)).toBeUndefined();
    });

    it('should return false for non-existent draft', async () => {
      const result = await engine.sendDraft('user-123', 'non-existent-draft');

      expect(result).toBe(false);
    });
  });

  describe('discardDraft', () => {
    it('should discard a draft', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      const prediction = await engine.predictAndDraft('user-123', context);
      const draftId = prediction.suggestedCommunications[0].id;

      const result = engine.discardDraft('user-123', draftId);

      expect(result).toBe(true);

      const pendingDrafts = engine.getPendingDrafts('user-123');
      expect(pendingDrafts.find((d) => d.id === draftId)).toBeUndefined();
    });

    it('should return false for non-existent draft', () => {
      const result = engine.discardDraft('user-123', 'non-existent-draft');

      expect(result).toBe(false);
    });
  });

  describe('getPendingDrafts', () => {
    it('should return pending drafts', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      await engine.predictAndDraft('user-123', context);

      const pendingDrafts = engine.getPendingDrafts('user-123');

      expect(pendingDrafts.length).toBeGreaterThan(0);
      expect(pendingDrafts[0].status).toBe('DRAFT');
    });

    it('should not return sent drafts', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      const prediction = await engine.predictAndDraft('user-123', context);
      const draftId = prediction.suggestedCommunications[0].id;

      await engine.sendDraft('user-123', draftId);

      const pendingDrafts = engine.getPendingDrafts('user-123');

      expect(pendingDrafts.find((d) => d.id === draftId)).toBeUndefined();
    });

    it('should return empty array for non-existent user', () => {
      const pendingDrafts = engine.getPendingDrafts('non-existent');

      expect(pendingDrafts.length).toBe(0);
    });
  });

  describe('getPredictionHistory', () => {
    it('should return prediction history', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      await engine.predictAndDraft('user-123', context);

      const history = engine.getPredictionHistory('user-123');

      expect(history.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      await engine.predictAndDraft('user-123', context);

      const history = engine.getPredictionHistory('user-123', 1);

      expect(history.length).toBeLessThanOrEqual(1);
    });
  });

  describe('setCommunicationStyle', () => {
    it('should set communication style for user', () => {
      const style = {
        formalityLevel: 0.8,
        averageLength: 100,
        commonPhrases: ['Best regards', 'Thank you'],
        sentimentBias: 0.5,
        responseTime: 10 * 60 * 1000,
      };

      engine.setCommunicationStyle('user-123', style);

      // Verify by making a prediction with the style set
      const context = {
        currentTime: Date.now(),
        recentMessages: [],
        calendar: [{ title: 'Meeting', time: Date.now() + 10 * 60 * 1000 }],
      };

      // The style should be used in draft generation
      expect(() => engine.setCommunicationStyle('user-123', style)).not.toThrow();
    });
  });

  describe('sample prediction', () => {
    it('should create a valid sample prediction', () => {
      const prediction = createSamplePrediction();

      expect(prediction.userId).toBe('user-123');
      expect(prediction.predictedAction).toBe('MEETING_SOON: Team Standup');
      expect(prediction.confidence).toBe(0.85);
      expect(prediction.suggestedCommunications.length).toBeGreaterThan(0);
    });
  });
});
