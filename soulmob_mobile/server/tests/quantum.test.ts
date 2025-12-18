import { describe, it, expect } from 'vitest';
import {
  TriState,
  QuatState,
  collapseQubit,
  checkEntanglement,
  QuantumDecisionEngine,
  FrictionScoreCalculator,
  AnchorCore,
} from '../quantum/quaternaryLogic';

describe('Quaternary Logic Engine', () => {
  describe('collapseQubit', () => {
    it('should collapse to FALSE for observation < 0.33', () => {
      expect(collapseQubit(0.1)).toBe(TriState.FALSE);
      expect(collapseQubit(0.32)).toBe(TriState.FALSE);
    });

    it('should collapse to TRUE for observation between 0.33 and 0.66', () => {
      expect(collapseQubit(0.33)).toBe(TriState.TRUE);
      expect(collapseQubit(0.5)).toBe(TriState.TRUE);
      expect(collapseQubit(0.65)).toBe(TriState.TRUE);
    });

    it('should collapse to SUPERPOSITION for observation >= 0.66', () => {
      expect(collapseQubit(0.66)).toBe(TriState.SUPERPOSITION);
      expect(collapseQubit(0.9)).toBe(TriState.SUPERPOSITION);
    });
  });

  describe('checkEntanglement', () => {
    it('should return true for multi-device context', () => {
      const context = {
        userId: 'user-1',
        features: [0.5],
        multiDeviceContext: true,
        deviceIds: ['phone', 'tablet'],
      };
      expect(checkEntanglement(context)).toBe(true);
    });

    it('should return false for single device', () => {
      const context = {
        userId: 'user-1',
        features: [0.5],
        multiDeviceContext: false,
        deviceIds: ['phone'],
      };
      expect(checkEntanglement(context)).toBe(false);
    });

    it('should return false when multiDeviceContext is undefined', () => {
      const context = {
        userId: 'user-1',
        features: [0.5],
      };
      expect(checkEntanglement(context)).toBe(false);
    });
  });

  describe('QuantumDecisionEngine', () => {
    it('should make a decision based on context', () => {
      const engine = new QuantumDecisionEngine(42); // Seeded for reproducibility
      const context = {
        userId: 'user-1',
        features: [0.1, 0.5, 0.9],
      };

      const result = engine.decide(context);

      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('triState');
      expect(result).toHaveProperty('reasoning');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return ORCHESTRATE_SYNC for multi-device entanglement with TRUE state', () => {
      const engine = new QuantumDecisionEngine(42);
      const context = {
        userId: 'user-1',
        features: [0.5, 0.5, 0.5], // Likely to collapse to TRUE
        multiDeviceContext: true,
        deviceIds: ['phone', 'tablet'],
      };

      const result = engine.decide(context);

      if (result.triState === TriState.TRUE) {
        expect(result.action).toBe('ORCHESTRATE_SYNC');
        expect(result.quatState).toBe(QuatState.ENTANGLEMENT);
      }
    });

    it('should return DEFER_UNTIL_COLLAPSE for SUPERPOSITION state', () => {
      const engine = new QuantumDecisionEngine(42);
      const context = {
        userId: 'user-1',
        features: [0.7, 0.7, 0.7], // Likely to collapse to SUPERPOSITION
      };

      const result = engine.decide(context);

      if (result.triState === TriState.SUPERPOSITION) {
        expect(result.action).toBe('DEFER_UNTIL_COLLAPSE');
      }
    });
  });

  describe('FrictionScoreCalculator', () => {
    it('should calculate friction score correctly', () => {
      const metrics = {
        batteryEntropy: 0.3,
        freeRam: 2 * 1024 * 1024 * 1024, // 2GB
        behavioralAuthErrorRate: 0.1,
        typingErrorRate: 0.05,
        emotionVector: { rushed: 0.6, tired: 0.2 },
      };

      const score = FrictionScoreCalculator.calculate(metrics);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return 0 for perfect conditions', () => {
      const metrics = {
        batteryEntropy: 0,
        freeRam: 4 * 1024 * 1024 * 1024, // 4GB
        behavioralAuthErrorRate: 0,
        typingErrorRate: 0,
      };

      const score = FrictionScoreCalculator.calculate(metrics);

      expect(score).toBe(0);
    });

    it('should increase with rushed emotion', () => {
      const metricsCalm = {
        batteryEntropy: 0.2,
        freeRam: 3 * 1024 * 1024 * 1024,
        behavioralAuthErrorRate: 0.05,
        typingErrorRate: 0.02,
        emotionVector: { rushed: 0.1, tired: 0.1 },
      };

      const metricsRushed = {
        batteryEntropy: 0.2,
        freeRam: 3 * 1024 * 1024 * 1024,
        behavioralAuthErrorRate: 0.05,
        typingErrorRate: 0.02,
        emotionVector: { rushed: 0.8, tired: 0.1 },
      };

      const scoreCalm = FrictionScoreCalculator.calculate(metricsCalm);
      const scoreRushed = FrictionScoreCalculator.calculate(metricsRushed);

      expect(scoreRushed).toBeGreaterThan(scoreCalm);
    });
  });

  describe('AnchorCore', () => {
    it('should store and retrieve anchor state', () => {
      const anchor = new AnchorCore();
      const state = {
        userId: 'user-1',
        emotionVector: { playful: 0.7 },
        frictionScore: 0.3,
        clipboardHistory: ['text1', 'text2'],
        timestamp: Date.now(),
      };

      anchor.storeState(state);
      const retrieved = anchor.getState('user-1');

      expect(retrieved).toEqual(state);
    });

    it('should return undefined for non-existent user', () => {
      const anchor = new AnchorCore();
      const retrieved = anchor.getState('non-existent');

      expect(retrieved).toBeUndefined();
    });

    it('should sync across devices', async () => {
      const anchor = new AnchorCore();
      const state = {
        userId: 'user-1',
        emotionVector: { playful: 0.7 },
        frictionScore: 0.3,
        clipboardHistory: [],
        timestamp: Date.now(),
      };

      anchor.storeState(state);
      const result = await anchor.syncAcrossDevices('user-1', ['phone', 'tablet']);

      expect(result).toBe(true);
    });

    it('should return false when syncing for non-existent user', async () => {
      const anchor = new AnchorCore();
      const result = await anchor.syncAcrossDevices('non-existent', ['phone']);

      expect(result).toBe(false);
    });
  });
});
