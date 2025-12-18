/**
 * Quaternary Logic Engine for SoulMob 0x04
 * Extends TernaryLogic with ENTANGLEMENT state for multi-device synchronization
 */

export enum TriState {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  SUPERPOSITION = 'SUPERPOSITION',
}

export enum QuatState {
  ENTANGLEMENT = 'ENTANGLEMENT',
}

export interface Qubit {
  state: TriState | QuatState;
  confidence: number; // 0-1
  timestamp: number;
}

export interface DecisionContext {
  userId: string;
  features: number[]; // Feature vector for decision
  emotionVector?: Record<string, number>;
  frictionScore?: number;
  multiDeviceContext?: boolean;
  deviceIds?: string[];
}

export interface DecisionResult {
  action: 'PROCEED_LOCAL' | 'SKIP_LOCAL' | 'DEFER_UNTIL_COLLAPSE' | 'ORCHESTRATE_SYNC';
  confidence: number;
  triState: TriState;
  quatState?: QuatState;
  reasoning: string;
}

/**
 * Collapse a qubit state based on observation
 */
export function collapseQubit(observation: number): TriState {
  if (observation < 0.33) {
    return TriState.FALSE;
  } else if (observation < 0.66) {
    return TriState.TRUE;
  } else {
    return TriState.SUPERPOSITION;
  }
}

/**
 * Determine if multi-device entanglement is needed
 */
export function checkEntanglement(context: DecisionContext): boolean {
  return (
    context.multiDeviceContext === true &&
    context.deviceIds !== undefined &&
    context.deviceIds.length > 1
  );
}

/**
 * Main Quaternary Decision Engine
 */
export class QuantumDecisionEngine {
  private rng: () => number;

  constructor(seed?: number) {
    // Use a seeded RNG for reproducibility in testing
    if (seed !== undefined) {
      this.rng = this.seededRandom(seed);
    } else {
      this.rng = Math.random;
    }
  }

  /**
   * Make a decision based on context
   */
  decide(context: DecisionContext): DecisionResult {
    // Collapse each feature into a trit
    const trits = context.features.map((feature) => {
      const observation = this.rng();
      return collapseQubit(observation);
    });

    // Determine majority state
    const triCounts = {
      [TriState.TRUE]: trits.filter((t) => t === TriState.TRUE).length,
      [TriState.FALSE]: trits.filter((t) => t === TriState.FALSE).length,
      [TriState.SUPERPOSITION]: trits.filter((t) => t === TriState.SUPERPOSITION).length,
    };

    const majorityTriState = Object.entries(triCounts).sort(([, a], [, b]) => b - a)[0][0] as TriState;

    // Check for multi-device entanglement
    const hasEntanglement = checkEntanglement(context);

    // Determine action
    let action: DecisionResult['action'];
    let reasoning: string;

    if (hasEntanglement && majorityTriState === TriState.TRUE) {
      action = 'ORCHESTRATE_SYNC';
      reasoning = 'Multi-device synchronization required for this action';
    } else if (majorityTriState === TriState.TRUE) {
      action = 'PROCEED_LOCAL';
      reasoning = 'Majority vote indicates proceed';
    } else if (majorityTriState === TriState.FALSE) {
      action = 'SKIP_LOCAL';
      reasoning = 'Majority vote indicates skip';
    } else {
      action = 'DEFER_UNTIL_COLLAPSE';
      reasoning = 'Superposition state detected; deferring until more data available';
    }

    // Calculate confidence
    const confidence = Math.max(...Object.values(triCounts)) / trits.length;

    return {
      action,
      confidence,
      triState: majorityTriState,
      quatState: hasEntanglement ? QuatState.ENTANGLEMENT : undefined,
      reasoning,
    };
  }

  /**
   * Seeded random number generator for reproducibility
   */
  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
}

/**
 * Friction Score Calculator
 * Measures user cognitive load and environmental resistance
 */
export class FrictionScoreCalculator {
  /**
   * Calculate friction score from metrics
   */
  static calculate(metrics: {
    batteryEntropy: number; // 0-1
    freeRam: number; // bytes
    behavioralAuthErrorRate: number; // 0-1
    typingErrorRate: number; // 0-1
    emotionVector?: Record<string, number>;
  }): number {
    const batteryFriction = metrics.batteryEntropy;
    const ramFriction = Math.max(0, 1 - metrics.freeRam / (4 * 1024 * 1024 * 1024)); // Assuming 4GB threshold
    const authFriction = metrics.behavioralAuthErrorRate;
    const typingFriction = metrics.typingErrorRate;

    // Emotion-based friction
    let emotionFriction = 0;
    if (metrics.emotionVector) {
      emotionFriction = (metrics.emotionVector.rushed || 0) * 0.5 + (metrics.emotionVector.tired || 0) * 0.3;
    }

    // Weighted average
    const frictionScore =
      batteryFriction * 0.2 + ramFriction * 0.2 + authFriction * 0.2 + typingFriction * 0.2 + emotionFriction * 0.2;

    return Math.min(1, Math.max(0, frictionScore));
  }
}

/**
 * Anchor Core - Cross-device state synchronization
 */
export interface AnchorState {
  userId: string;
  emotionVector: Record<string, number>;
  frictionScore: number;
  currentTask?: string;
  clipboardHistory: string[];
  timestamp: number;
}

export class AnchorCore {
  private states: Map<string, AnchorState> = new Map();

  /**
   * Store anchor state for a user
   */
  storeState(state: AnchorState): void {
    this.states.set(state.userId, state);
  }

  /**
   * Retrieve anchor state for a user
   */
  getState(userId: string): AnchorState | undefined {
    return this.states.get(userId);
  }

  /**
   * Synchronize state across devices (mock implementation)
   */
  async syncAcrossDevices(userId: string, deviceIds: string[]): Promise<boolean> {
    const state = this.getState(userId);
    if (!state) {
      return false;
    }

    // In production, this would use P2P encryption and CRDT
    console.log(`Syncing state for user ${userId} across devices: ${deviceIds.join(', ')}`);
    return true;
  }
}
