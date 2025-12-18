import { pgTable, text, timestamp, uuid, integer, real, jsonb, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  autonomyLevel: varchar('autonomy_level', { length: 50 }).default('GUIDED'), // GUIDED, PARTNER, AUTONOMOUS
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Settings Table
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  moodPlayful: real('mood_playful').default(0.77),
  latencyTargetMs: integer('latency_target_ms').default(80),
  surpriseThreshold: real('surprise_threshold').default(0.31),
  frictionScoreTarget: real('friction_score_target').default(0.0),
  temporalEchoEnabled: boolean('temporal_echo_enabled').default(true),
  environmentalOrchestratorEnabled: boolean('environmental_orchestrator_enabled').default(true),
  intentProjectionEnabled: boolean('intent_projection_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Temporal Echo - User Memory/Context Table
export const temporalMemory = pgTable('temporal_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'message', 'photo', 'note', 'calendar', 'email'
  content: text('content').notNull(),
  embedding: jsonb('embedding'), // Vector embedding for semantic search
  metadata: jsonb('metadata'), // Additional context (sender, timestamp, etc.)
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // TTL for automatic deletion
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Emotion Vector Table
export const emotionVectors = pgTable('emotion_vectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bored: real('bored').default(0),
  rushed: real('rushed').default(0),
  playful: real('playful').default(0),
  lonely: real('lonely').default(0),
  focused: real('focused').default(0),
  tired: real('tired').default(0),
  hype: real('hype').default(0),
  frictionScore: real('friction_score').default(0),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Friction Score Metrics Table
export const frictionMetrics = pgTable('friction_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  batteryEntropy: real('battery_entropy').default(0),
  freeRam: integer('free_ram').default(0),
  behavioralAuthErrorRate: real('behavioral_auth_error_rate').default(0),
  typingErrorRate: real('typing_error_rate').default(0),
  screenOnTime: integer('screen_on_time').default(0),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Environmental Orchestrator - Smart Home Devices Table
export const smartHomeDevices = pgTable('smart_home_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  deviceName: varchar('device_name', { length: 255 }).notNull(),
  deviceType: varchar('device_type', { length: 50 }).notNull(), // 'light', 'thermostat', 'speaker', etc.
  state: jsonb('state'), // Current device state
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Environmental Policies Table
export const environmentalPolicies = pgTable('environmental_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  policyName: varchar('policy_name', { length: 255 }).notNull(),
  condition: jsonb('condition').notNull(), // e.g., { emotionVector: { rushed: '>0.6' }, frictionScore: '>0.4' }
  action: jsonb('action').notNull(), // e.g., { dimLights: true, playSoundscape: 'focus' }
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Intent Projection - Draft Communications Table
export const draftCommunications = pgTable('draft_communications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  communicationType: varchar('communication_type', { length: 50 }).notNull(), // 'email', 'message', 'notification'
  recipient: varchar('recipient', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  body: text('body').notNull(),
  confidence: real('confidence').default(0), // Prediction confidence (0-1)
  status: varchar('status', { length: 50 }).default('DRAFT'), // DRAFT, SENT, DISCARDED
  predictedIntent: varchar('predicted_intent', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quantum Decision Log Table
export const quantumDecisionLog = pgTable('quantum_decision_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  decisionContext: jsonb('decision_context').notNull(),
  triState: varchar('tri_state', { length: 50 }).notNull(), // TRUE, FALSE, SUPERPOSITION
  quatState: varchar('quat_state', { length: 50 }), // ENTANGLEMENT (for multi-device)
  action: varchar('action', { length: 255 }).notNull(),
  result: varchar('result', { length: 50 }), // SUCCESS, FAILED, DEFERRED
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Cross-Device Synchronization Table
export const deviceSync = pgTable('device_sync', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  deviceType: varchar('device_type', { length: 50 }).notNull(), // 'phone', 'tablet', 'laptop'
  syncState: jsonb('sync_state'), // Encrypted state to sync
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(userSettings),
  memories: many(temporalMemory),
  emotionVectors: many(emotionVectors),
  frictionMetrics: many(frictionMetrics),
  smartHomeDevices: many(smartHomeDevices),
  environmentalPolicies: many(environmentalPolicies),
  draftCommunications: many(draftCommunications),
  quantumDecisions: many(quantumDecisionLog),
  deviceSyncs: many(deviceSync),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users),
}));

export const temporalMemoryRelations = relations(temporalMemory, ({ one }) => ({
  user: one(users),
}));

export const emotionVectorsRelations = relations(emotionVectors, ({ one }) => ({
  user: one(users),
}));

export const frictionMetricsRelations = relations(frictionMetrics, ({ one }) => ({
  user: one(users),
}));

export const smartHomeDevicesRelations = relations(smartHomeDevices, ({ one, many }) => ({
  user: one(users),
  policies: many(environmentalPolicies),
}));

export const environmentalPoliciesRelations = relations(environmentalPolicies, ({ one }) => ({
  user: one(users),
}));

export const draftCommunicationsRelations = relations(draftCommunications, ({ one }) => ({
  user: one(users),
}));

export const quantumDecisionLogRelations = relations(quantumDecisionLog, ({ one }) => ({
  user: one(users),
}));

export const deviceSyncRelations = relations(deviceSync, ({ one }) => ({
  user: one(users),
}));
