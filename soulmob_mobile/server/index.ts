import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import core modules
import { QuantumDecisionEngine, FrictionScoreCalculator, AnchorCore } from './quantum/quaternaryLogic';
import { TemporalEchoEngine } from './features/temporalEcho';
import { EnvironmentalOrchestratorEngine } from './features/environmentalOrchestrator';
import { IntentProjectionEngine } from './features/intentProjection';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize core engines
const quantumEngine = new QuantumDecisionEngine();
const temporalEcho = new TemporalEchoEngine();
const environmentalOrchestrator = new EnvironmentalOrchestratorEngine();
const intentProjection = new IntentProjectionEngine();
const anchorCore = new AnchorCore();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.4.0-beta',
    features: {
      quantumLogic: true,
      temporalEcho: process.env.ENABLE_TEMPORAL_ECHO === 'true',
      environmentalOrchestrator: process.env.ENABLE_ENVIRONMENTAL_ORCHESTRATOR === 'true',
      intentProjection: process.env.ENABLE_INTENT_PROJECTION === 'true',
    },
  });
});

// Quantum Decision Engine endpoints
app.post('/api/quantum/decide', (req: Request, res: Response) => {
  try {
    const { userId, features, emotionVector, frictionScore, multiDeviceContext, deviceIds } = req.body;

    const context = {
      userId,
      features,
      emotionVector,
      frictionScore,
      multiDeviceContext,
      deviceIds,
    };

    const result = quantumEngine.decide(context);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/quantum/friction-score', (req: Request, res: Response) => {
  try {
    const { batteryEntropy, freeRam, behavioralAuthErrorRate, typingErrorRate, emotionVector } = req.body;

    const score = FrictionScoreCalculator.calculate({
      batteryEntropy,
      freeRam,
      behavioralAuthErrorRate,
      typingErrorRate,
      emotionVector,
    });

    res.json({
      success: true,
      data: { frictionScore: score },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Temporal Echo endpoints
app.post('/api/temporal-echo/store', (req: Request, res: Response) => {
  try {
    const memory = req.body;
    temporalEcho.storeMemory(memory);

    res.json({
      success: true,
      message: 'Memory stored successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/temporal-echo/query', (req: Request, res: Response) => {
  try {
    const queryParams = req.body;
    const result = temporalEcho.queryMemories(queryParams);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.get('/api/temporal-echo/stats/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = temporalEcho.getMemoryStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/temporal-echo/cleanup/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const removed = temporalEcho.cleanupExpiredMemories(userId);

    res.json({
      success: true,
      data: { removed },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Environmental Orchestrator endpoints
app.post('/api/orchestrator/register-device', (req: Request, res: Response) => {
  try {
    const device = req.body;
    environmentalOrchestrator.registerDevice(device);

    res.json({
      success: true,
      message: 'Device registered successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/orchestrator/create-policy', (req: Request, res: Response) => {
  try {
    const policy = req.body;
    environmentalOrchestrator.createPolicy(policy);

    res.json({
      success: true,
      message: 'Policy created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/orchestrator/orchestrate', async (req: Request, res: Response) => {
  try {
    const { userId, emotionVector, frictionScore } = req.body;
    const results = await environmentalOrchestrator.orchestrate(userId, emotionVector, frictionScore);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.get('/api/orchestrator/devices/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const devices = environmentalOrchestrator.getDevices(userId);

    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Intent Projection endpoints
app.post('/api/intent-projection/predict', async (req: Request, res: Response) => {
  try {
    const { userId, context } = req.body;
    const prediction = await intentProjection.predictAndDraft(userId, context);

    res.json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/intent-projection/send-draft', async (req: Request, res: Response) => {
  try {
    const { userId, draftId } = req.body;
    const result = await intentProjection.sendDraft(userId, draftId);

    res.json({
      success: true,
      data: { sent: result },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/intent-projection/discard-draft', (req: Request, res: Response) => {
  try {
    const { userId, draftId } = req.body;
    const result = intentProjection.discardDraft(userId, draftId);

    res.json({
      success: true,
      data: { discarded: result },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.get('/api/intent-projection/pending/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const drafts = intentProjection.getPendingDrafts(userId);

    res.json({
      success: true,
      data: drafts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Anchor Core endpoints
app.post('/api/anchor/store-state', (req: Request, res: Response) => {
  try {
    const state = req.body;
    anchorCore.storeState(state);

    res.json({
      success: true,
      message: 'State stored successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.get('/api/anchor/get-state/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const state = anchorCore.getState(userId);

    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

app.post('/api/anchor/sync', async (req: Request, res: Response) => {
  try {
    const { userId, deviceIds } = req.body;
    const result = await anchorCore.syncAcrossDevices(userId, deviceIds);

    res.json({
      success: true,
      data: { synced: result },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🧠 SoulMob 0x04 Server running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

export default app;
