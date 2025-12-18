/**
 * Intent Projection - Predictive communication drafting
 * Proactively generates and stages communications based on predicted future needs
 */

export type CommunicationType = 'email' | 'message' | 'notification' | 'calendar_invite';

export interface DraftCommunication {
  id: string;
  userId: string;
  communicationType: CommunicationType;
  recipient: string;
  subject?: string;
  body: string;
  confidence: number; // 0-1
  status: 'DRAFT' | 'SENT' | 'DISCARDED';
  predictedIntent: string;
  timestamp: number;
  sentAt?: number;
}

export interface IntentPrediction {
  userId: string;
  predictedAction: string;
  confidence: number;
  timeToAction: number; // milliseconds
  reasoning: string;
  suggestedCommunications: DraftCommunication[];
}

export interface UserCommunicationStyle {
  formalityLevel: number; // 0-1, 0 = casual, 1 = formal
  averageLength: number; // words
  commonPhrases: string[];
  sentimentBias: number; // -1 to 1
  responseTime: number; // average milliseconds to respond
}

/**
 * Intent Projection Engine
 */
export class IntentProjectionEngine {
  private drafts: Map<string, DraftCommunication[]> = new Map();
  private communicationStyles: Map<string, UserCommunicationStyle> = new Map();
  private predictions: Map<string, IntentPrediction[]> = new Map();

  /**
   * Predict user's next action and generate draft communications
   */
  async predictAndDraft(
    userId: string,
    context: {
      currentLocation?: string;
      currentTime: number;
      recentMessages: string[];
      calendar?: Array<{ title: string; time: number }>;
      emotionVector?: Record<string, number>;
      frictionScore?: number;
    }
  ): Promise<IntentPrediction> {
    // Analyze context to predict intent
    const predictedAction = this.analyzeContext(context);
    const confidence = this.calculateConfidence(context, predictedAction);

    // Generate draft communications
    const suggestedCommunications = await this.generateDrafts(userId, predictedAction, context);

    const prediction: IntentPrediction = {
      userId,
      predictedAction,
      confidence,
      timeToAction: this.estimateTimeToAction(context, predictedAction),
      reasoning: this.generateReasoning(context, predictedAction),
      suggestedCommunications,
    };

    // Store prediction
    if (!this.predictions.has(userId)) {
      this.predictions.set(userId, []);
    }
    this.predictions.get(userId)!.push(prediction);

    return prediction;
  }

  /**
   * Analyze context to determine likely next action
   */
  private analyzeContext(context: {
    currentLocation?: string;
    currentTime: number;
    recentMessages: string[];
    calendar?: Array<{ title: string; time: number }>;
    emotionVector?: Record<string, number>;
    frictionScore?: number;
  }): string {
    // Simple heuristic-based prediction
    const now = new Date(context.currentTime);
    const hour = now.getHours();

    // Check for upcoming calendar events
    if (context.calendar && context.calendar.length > 0) {
      const nextEvent = context.calendar[0];
      const timeUntilEvent = nextEvent.time - context.currentTime;

      if (timeUntilEvent < 15 * 60 * 1000) {
        // Within 15 minutes
        return `MEETING_SOON: ${nextEvent.title}`;
      }
    }

    // Check emotion vector
    if (context.emotionVector) {
      if (context.emotionVector.rushed > 0.6) {
        return 'USER_RUSHED';
      }
      if (context.emotionVector.tired > 0.7) {
        return 'USER_TIRED';
      }
    }

    // Time-based prediction
    if (hour >= 17 && hour < 19) {
      return 'LEAVING_WORK';
    }
    if (hour >= 8 && hour < 9) {
      return 'MORNING_COMMUTE';
    }

    return 'ROUTINE_ACTIVITY';
  }

  /**
   * Calculate confidence of prediction
   */
  private calculateConfidence(context: any, predictedAction: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on context signals
    if (context.calendar && context.calendar.length > 0) {
      confidence += 0.2;
    }
    if (context.emotionVector) {
      confidence += 0.15;
    }
    if (context.recentMessages && context.recentMessages.length > 0) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  /**
   * Generate draft communications
   */
  private async generateDrafts(
    userId: string,
    predictedAction: string,
    context: any
  ): Promise<DraftCommunication[]> {
    const drafts: DraftCommunication[] = [];
    const style = this.communicationStyles.get(userId) || this.getDefaultStyle();

    // Generate drafts based on predicted action
    if (predictedAction.startsWith('MEETING_SOON')) {
      const meetingName = predictedAction.split(': ')[1];

      drafts.push({
        id: `draft-${Date.now()}-1`,
        userId,
        communicationType: 'message',
        recipient: 'meeting-organizer',
        body: this.generateMessage(`I'm on my way to ${meetingName}`, style),
        confidence: 0.85,
        status: 'DRAFT',
        predictedIntent: predictedAction,
        timestamp: Date.now(),
      });
    } else if (predictedAction === 'USER_RUSHED') {
      drafts.push({
        id: `draft-${Date.now()}-2`,
        userId,
        communicationType: 'message',
        recipient: 'recent-contact',
        body: this.generateMessage('Running a bit behind schedule', style),
        confidence: 0.75,
        status: 'DRAFT',
        predictedIntent: predictedAction,
        timestamp: Date.now(),
      });
    } else if (predictedAction === 'LEAVING_WORK') {
      drafts.push({
        id: `draft-${Date.now()}-3`,
        userId,
        communicationType: 'message',
        recipient: 'family',
        body: this.generateMessage('Heading home now', style),
        confidence: 0.8,
        status: 'DRAFT',
        predictedIntent: predictedAction,
        timestamp: Date.now(),
      });
    }

    // Store drafts
    if (!this.drafts.has(userId)) {
      this.drafts.set(userId, []);
    }
    this.drafts.get(userId)!.push(...drafts);

    return drafts;
  }

  /**
   * Generate message based on communication style
   */
  private generateMessage(baseMessage: string, style: UserCommunicationStyle): string {
    let message = baseMessage;

    // Add formality
    if (style.formalityLevel > 0.7) {
      message = `I wanted to inform you that ${message.toLowerCase()}`;
    } else if (style.formalityLevel < 0.3) {
      message = `Hey, ${message.toLowerCase()}`;
    }

    // Add common phrases
    if (style.commonPhrases.length > 0) {
      const phrase = style.commonPhrases[Math.floor(Math.random() * style.commonPhrases.length)];
      message = `${message}. ${phrase}`;
    }

    return message;
  }

  /**
   * Estimate time until predicted action occurs
   */
  private estimateTimeToAction(context: any, predictedAction: string): number {
    if (predictedAction.startsWith('MEETING_SOON')) {
      return 10 * 60 * 1000; // 10 minutes
    }
    if (predictedAction === 'USER_RUSHED') {
      return 5 * 60 * 1000; // 5 minutes
    }
    if (predictedAction === 'LEAVING_WORK') {
      return 30 * 60 * 1000; // 30 minutes
    }

    return 60 * 60 * 1000; // 1 hour default
  }

  /**
   * Generate reasoning for prediction
   */
  private generateReasoning(context: any, predictedAction: string): string {
    const reasons: string[] = [];

    if (context.calendar && context.calendar.length > 0) {
      reasons.push('Upcoming calendar event detected');
    }
    if (context.emotionVector?.rushed > 0.6) {
      reasons.push('User emotion vector shows rushed state');
    }
    if (context.frictionScore && context.frictionScore > 0.5) {
      reasons.push('High friction score indicates time pressure');
    }

    return reasons.join('; ') || 'Based on contextual analysis';
  }

  /**
   * Accept and send a draft
   */
  async sendDraft(userId: string, draftId: string): Promise<boolean> {
    const userDrafts = this.drafts.get(userId) || [];
    const draft = userDrafts.find((d) => d.id === draftId);

    if (!draft) {
      return false;
    }

    // In production, this would actually send the communication
    draft.status = 'SENT';
    draft.sentAt = Date.now();

    console.log(`Sent ${draft.communicationType} to ${draft.recipient}: ${draft.body}`);

    return true;
  }

  /**
   * Discard a draft
   */
  discardDraft(userId: string, draftId: string): boolean {
    const userDrafts = this.drafts.get(userId) || [];
    const draft = userDrafts.find((d) => d.id === draftId);

    if (!draft) {
      return false;
    }

    draft.status = 'DISCARDED';
    return true;
  }

  /**
   * Get pending drafts for user
   */
  getPendingDrafts(userId: string): DraftCommunication[] {
    const userDrafts = this.drafts.get(userId) || [];
    return userDrafts.filter((d) => d.status === 'DRAFT');
  }

  /**
   * Get prediction history
   */
  getPredictionHistory(userId: string, limit: number = 20): IntentPrediction[] {
    const userPredictions = this.predictions.get(userId) || [];
    return userPredictions.slice(-limit);
  }

  /**
   * Set communication style for user
   */
  setCommunicationStyle(userId: string, style: UserCommunicationStyle): void {
    this.communicationStyles.set(userId, style);
  }

  /**
   * Get default communication style
   */
  private getDefaultStyle(): UserCommunicationStyle {
    return {
      formalityLevel: 0.5,
      averageLength: 50,
      commonPhrases: ['Thanks', 'See you soon', 'Let me know'],
      sentimentBias: 0.3,
      responseTime: 5 * 60 * 1000, // 5 minutes
    };
  }
}

/**
 * Example usage and test helper
 */
export function createSamplePrediction(): IntentPrediction {
  return {
    userId: 'user-123',
    predictedAction: 'MEETING_SOON: Team Standup',
    confidence: 0.85,
    timeToAction: 10 * 60 * 1000,
    reasoning: 'Upcoming calendar event detected; user emotion vector shows focused state',
    suggestedCommunications: [
      {
        id: 'draft-1',
        userId: 'user-123',
        communicationType: 'message',
        recipient: 'team-lead',
        body: 'On my way to the standup meeting',
        confidence: 0.85,
        status: 'DRAFT',
        predictedIntent: 'MEETING_SOON: Team Standup',
        timestamp: Date.now(),
      },
    ],
  };
}
