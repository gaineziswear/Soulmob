/**
 * Environmental Orchestrator (EO) - Smart home integration and synchronization
 * Manages the user's physical environment based on emotional state and friction score
 */

export interface SmartHomeDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'light' | 'thermostat' | 'speaker' | 'lock' | 'camera' | 'other';
  state: Record<string, any>;
  lastSyncedAt?: number;
}

export interface EnvironmentalPolicy {
  id: string;
  userId: string;
  policyName: string;
  condition: {
    emotionVector?: Record<string, number>;
    frictionScore?: { min?: number; max?: number };
    timeOfDay?: { start: string; end: string };
  };
  action: {
    devices: Array<{
      deviceId: string;
      command: string;
      parameters: Record<string, any>;
    }>;
  };
  isActive: boolean;
  createdAt: number;
}

export interface EmotionVector {
  bored: number;
  rushed: number;
  playful: number;
  lonely: number;
  focused: number;
  tired: number;
  hype: number;
}

export interface OrchestrationResult {
  policyId: string;
  policyName: string;
  triggeredAt: number;
  actions: Array<{
    deviceId: string;
    command: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Environmental Orchestrator Engine
 */
export class EnvironmentalOrchestratorEngine {
  private devices: Map<string, SmartHomeDevice[]> = new Map();
  private policies: Map<string, EnvironmentalPolicy[]> = new Map();
  private orchestrationHistory: OrchestrationResult[] = [];

  /**
   * Register a smart home device
   */
  registerDevice(device: SmartHomeDevice): void {
    if (!this.devices.has(device.userId)) {
      this.devices.set(device.userId, []);
    }

    const userDevices = this.devices.get(device.userId)!;
    const existingIndex = userDevices.findIndex((d) => d.deviceId === device.deviceId);

    if (existingIndex >= 0) {
      userDevices[existingIndex] = device;
    } else {
      userDevices.push(device);
    }
  }

  /**
   * Create an environmental policy
   */
  createPolicy(policy: EnvironmentalPolicy): void {
    if (!this.policies.has(policy.userId)) {
      this.policies.set(policy.userId, []);
    }

    this.policies.get(policy.userId)!.push(policy);
  }

  /**
   * Evaluate and execute policies based on current state
   */
  async orchestrate(
    userId: string,
    emotionVector: EmotionVector,
    frictionScore: number
  ): Promise<OrchestrationResult[]> {
    const userPolicies = this.policies.get(userId) || [];
    const results: OrchestrationResult[] = [];

    for (const policy of userPolicies) {
      if (!policy.isActive) continue;

      // Check if policy conditions are met
      if (this.evaluateCondition(policy.condition, emotionVector, frictionScore)) {
        const result = await this.executePolicy(userId, policy);
        results.push(result);
        this.orchestrationHistory.push(result);
      }
    }

    return results;
  }

  /**
   * Evaluate policy condition
   */
  private evaluateCondition(
    condition: EnvironmentalPolicy['condition'],
    emotionVector: EmotionVector,
    frictionScore: number
  ): boolean {
    // Check emotion vector condition
    if (condition.emotionVector) {
      for (const [emotion, threshold] of Object.entries(condition.emotionVector)) {
        if ((emotionVector as any)[emotion] < threshold) {
          return false;
        }
      }
    }

    // Check friction score condition
    if (condition.frictionScore) {
      if (condition.frictionScore.min !== undefined && frictionScore < condition.frictionScore.min) {
        return false;
      }
      if (condition.frictionScore.max !== undefined && frictionScore > condition.frictionScore.max) {
        return false;
      }
    }

    // Check time of day condition
    if (condition.timeOfDay) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (currentTime < condition.timeOfDay.start || currentTime > condition.timeOfDay.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a policy (mock implementation)
   */
  private async executePolicy(userId: string, policy: EnvironmentalPolicy): Promise<OrchestrationResult> {
    const userDevices = this.devices.get(userId) || [];
    const actions = [];

    for (const actionSpec of policy.action.devices) {
      const device = userDevices.find((d) => d.deviceId === actionSpec.deviceId);

      if (device) {
        // Mock device command execution
        const success = await this.sendDeviceCommand(device, actionSpec.command, actionSpec.parameters);

        actions.push({
          deviceId: actionSpec.deviceId,
          command: actionSpec.command,
          success,
          error: success ? undefined : 'Device command failed',
        });
      } else {
        actions.push({
          deviceId: actionSpec.deviceId,
          command: actionSpec.command,
          success: false,
          error: 'Device not found',
        });
      }
    }

    return {
      policyId: policy.id,
      policyName: policy.policyName,
      triggeredAt: Date.now(),
      actions,
    };
  }

  /**
   * Send command to a device (mock implementation)
   */
  private async sendDeviceCommand(device: SmartHomeDevice, command: string, parameters: Record<string, any>): Promise<boolean> {
    // In production, this would communicate with the actual smart home API
    console.log(`Sending command to ${device.deviceName}: ${command}`, parameters);

    // Simulate device state update
    device.state = { ...device.state, ...parameters, lastCommand: command, lastCommandTime: Date.now() };
    device.lastSyncedAt = Date.now();

    return true;
  }

  /**
   * Get orchestration history
   */
  getHistory(userId: string, limit: number = 50): OrchestrationResult[] {
    return this.orchestrationHistory.filter((r) => r.triggeredAt).slice(-limit);
  }

  /**
   * Get user's smart home devices
   */
  getDevices(userId: string): SmartHomeDevice[] {
    return this.devices.get(userId) || [];
  }

  /**
   * Get user's policies
   */
  getPolicies(userId: string): EnvironmentalPolicy[] {
    return this.policies.get(userId) || [];
  }
}

/**
 * Example usage and test helper
 */
export function createSampleDevices(): SmartHomeDevice[] {
  return [
    {
      id: '1',
      userId: 'user-123',
      deviceId: 'light-living-room',
      deviceName: 'Living Room Light',
      deviceType: 'light',
      state: { brightness: 100, color: 'white', on: true },
      lastSyncedAt: Date.now(),
    },
    {
      id: '2',
      userId: 'user-123',
      deviceId: 'thermostat-main',
      deviceName: 'Main Thermostat',
      deviceType: 'thermostat',
      state: { temperature: 72, mode: 'auto', humidity: 45 },
      lastSyncedAt: Date.now(),
    },
    {
      id: '3',
      userId: 'user-123',
      deviceId: 'speaker-bedroom',
      deviceName: 'Bedroom Speaker',
      deviceType: 'speaker',
      state: { volume: 50, playing: false, currentTrack: null },
      lastSyncedAt: Date.now(),
    },
  ];
}

export function createSamplePolicy(): EnvironmentalPolicy {
  return {
    id: 'policy-1',
    userId: 'user-123',
    policyName: 'Focus Mode',
    condition: {
      emotionVector: { focused: 0.7 },
      frictionScore: { min: 0.3, max: 0.8 },
    },
    action: {
      devices: [
        {
          deviceId: 'light-living-room',
          command: 'set_brightness',
          parameters: { brightness: 60, color: 'warm' },
        },
        {
          deviceId: 'speaker-bedroom',
          command: 'play_playlist',
          parameters: { playlist: 'focus-music', volume: 30 },
        },
        {
          deviceId: 'thermostat-main',
          command: 'set_temperature',
          parameters: { temperature: 70 },
        },
      ],
    },
    isActive: true,
    createdAt: Date.now(),
  };
}
