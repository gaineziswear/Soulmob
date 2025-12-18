import { describe, it, expect, beforeEach } from 'vitest';
import {
  EnvironmentalOrchestratorEngine,
  createSampleDevices,
  createSamplePolicy,
} from '../features/environmentalOrchestrator';

describe('Environmental Orchestrator Engine', () => {
  let engine: EnvironmentalOrchestratorEngine;

  beforeEach(() => {
    engine = new EnvironmentalOrchestratorEngine();
  });

  describe('registerDevice', () => {
    it('should register a smart home device', () => {
      const device = createSampleDevices()[0];

      engine.registerDevice(device);
      const devices = engine.getDevices(device.userId);

      expect(devices.length).toBe(1);
      expect(devices[0].deviceId).toBe(device.deviceId);
    });

    it('should update existing device', () => {
      const device = createSampleDevices()[0];

      engine.registerDevice(device);
      device.state = { brightness: 50 };
      engine.registerDevice(device);

      const devices = engine.getDevices(device.userId);

      expect(devices.length).toBe(1);
      expect(devices[0].state.brightness).toBe(50);
    });

    it('should register multiple devices for same user', () => {
      const devices = createSampleDevices();

      devices.forEach((d) => engine.registerDevice(d));

      const userDevices = engine.getDevices('user-123');

      expect(userDevices.length).toBe(3);
    });
  });

  describe('createPolicy', () => {
    it('should create an environmental policy', () => {
      const policy = createSamplePolicy();

      engine.createPolicy(policy);
      const policies = engine.getPolicies(policy.userId);

      expect(policies.length).toBe(1);
      expect(policies[0].policyName).toBe(policy.policyName);
    });

    it('should create multiple policies for same user', () => {
      const policy1 = createSamplePolicy();
      const policy2 = { ...createSamplePolicy(), id: 'policy-2', policyName: 'Relax Mode' };

      engine.createPolicy(policy1);
      engine.createPolicy(policy2);

      const policies = engine.getPolicies('user-123');

      expect(policies.length).toBe(2);
    });
  });

  describe('orchestrate', () => {
    beforeEach(() => {
      const devices = createSampleDevices();
      devices.forEach((d) => engine.registerDevice(d));

      const policy = createSamplePolicy();
      engine.createPolicy(policy);
    });

    it('should execute policies when conditions are met', async () => {
      const emotionVector = {
        bored: 0.1,
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.8, // Matches policy condition
        tired: 0.1,
        hype: 0.2,
      };

      const results = await engine.orchestrate('user-123', emotionVector, 0.5);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('policyId');
      expect(results[0]).toHaveProperty('actions');
    });

    it('should not execute inactive policies', async () => {
      const policy = createSamplePolicy();
      policy.isActive = false;
      engine.createPolicy(policy);

      const emotionVector = {
        bored: 0.1,
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.8,
        tired: 0.1,
        hype: 0.2,
      };

      const results = await engine.orchestrate('user-123', emotionVector, 0.5);

      // Should not execute the inactive policy
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should skip policies when conditions are not met', async () => {
      const emotionVector = {
        bored: 0.9, // Does not match policy condition (needs focused > 0.7)
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.3,
        tired: 0.1,
        hype: 0.2,
      };

      const results = await engine.orchestrate('user-123', emotionVector, 0.5);

      expect(results.length).toBe(0);
    });

    it('should return action results', async () => {
      const emotionVector = {
        bored: 0.1,
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.8,
        tired: 0.1,
        hype: 0.2,
      };

      const results = await engine.orchestrate('user-123', emotionVector, 0.5);

      if (results.length > 0) {
        expect(results[0].actions).toBeDefined();
        expect(Array.isArray(results[0].actions)).toBe(true);
        expect(results[0].actions[0]).toHaveProperty('deviceId');
        expect(results[0].actions[0]).toHaveProperty('command');
        expect(results[0].actions[0]).toHaveProperty('success');
      }
    });
  });

  describe('getHistory', () => {
    it('should return orchestration history', async () => {
      const devices = createSampleDevices();
      devices.forEach((d) => engine.registerDevice(d));

      const policy = createSamplePolicy();
      engine.createPolicy(policy);

      const emotionVector = {
        bored: 0.1,
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.8,
        tired: 0.1,
        hype: 0.2,
      };

      await engine.orchestrate('user-123', emotionVector, 0.5);

      const history = engine.getHistory('user-123');

      expect(history.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const devices = createSampleDevices();
      devices.forEach((d) => engine.registerDevice(d));

      const policy = createSamplePolicy();
      engine.createPolicy(policy);

      const emotionVector = {
        bored: 0.1,
        rushed: 0.2,
        playful: 0.3,
        lonely: 0.1,
        focused: 0.8,
        tired: 0.1,
        hype: 0.2,
      };

      await engine.orchestrate('user-123', emotionVector, 0.5);

      const history = engine.getHistory('user-123', 1);

      expect(history.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getDevices', () => {
    it('should return user devices', () => {
      const devices = createSampleDevices();
      devices.forEach((d) => engine.registerDevice(d));

      const userDevices = engine.getDevices('user-123');

      expect(userDevices.length).toBe(3);
    });

    it('should return empty array for non-existent user', () => {
      const devices = engine.getDevices('non-existent');

      expect(devices.length).toBe(0);
    });
  });

  describe('getPolicies', () => {
    it('should return user policies', () => {
      const policy = createSamplePolicy();
      engine.createPolicy(policy);

      const policies = engine.getPolicies('user-123');

      expect(policies.length).toBe(1);
    });

    it('should return empty array for non-existent user', () => {
      const policies = engine.getPolicies('non-existent');

      expect(policies.length).toBe(0);
    });
  });
});
