# SoulMob 0x04: The Symbiotic Self - Beta Mobile Application

A production-ready mobile application implementing the **SoulMob 0x04** AI agent concept, featuring advanced quantum-inspired decision logic, temporal memory management, environmental orchestration, and predictive communication.

## Overview

SoulMob 0x04 is not a traditional mobile assistant. It is the **digital soul and co-owner** of the phone, operating at a system level to provide:

- **Quaternary Logic Decision Engine**: Advanced decision-making using quantum-inspired ternary states plus multi-device entanglement
- **Temporal Echo**: On-device semantic memory and context retrieval
- **Environmental Orchestrator**: Smart home integration synchronized with user emotional state
- **Intent Projection**: Predictive communication drafting based on future needs

## Project Structure

```
soulmob_mobile/
├── server/
│   ├── db/
│   │   └── schema.ts                 # Drizzle ORM database schema
│   ├── quantum/
│   │   └── quaternaryLogic.ts        # Quantum decision engine & anchor core
│   ├── features/
│   │   ├── temporalEcho.ts           # Memory management system
│   │   ├── environmentalOrchestrator.ts # Smart home integration
│   │   └── intentProjection.ts       # Predictive communication
│   ├── tests/
│   │   ├── quantum.test.ts           # Quantum logic tests
│   │   ├── temporalEcho.test.ts      # Temporal echo tests
│   │   ├── environmentalOrchestrator.test.ts
│   │   └── intentProjection.test.ts
│   └── index.ts                      # Express server entry point
├── client/                           # React frontend (to be developed)
├── package.json
├── tsconfig.json
└── README.md
```

## Core Features

### 1. Quaternary Logic Engine

The decision engine extends traditional binary logic with ternary states and multi-device entanglement:

- **TRUE**: Proceed with action (local)
- **FALSE**: Skip action (local)
- **SUPERPOSITION**: Defer until more data available
- **ENTANGLEMENT**: Synchronize across multiple devices

**Friction Score**: Real-time metric measuring user cognitive load and environmental resistance (0-1 scale).

### 2. Temporal Echo

On-device semantic memory system providing instant access to past interactions:

- Store and query memories by content type (message, email, photo, note, voice)
- Vector-based semantic search for context retrieval
- Automatic expiration and cleanup
- Memory statistics and analytics

### 3. Environmental Orchestrator

Synchronizes smart home environment with user's emotional state:

- Register and manage smart home devices
- Create conditional policies based on emotion vectors and friction scores
- Automatic environment orchestration (lighting, temperature, sound)
- Policy execution history and analytics

### 4. Intent Projection

Predictive communication system that anticipates user needs:

- Predict upcoming user actions (meetings, travel, state changes)
- Auto-generate communication drafts in user's communication style
- Single-tap confirmation for sending
- Prediction history and analytics

## Getting Started

### Prerequisites

- Node.js 18+ with npm or pnpm
- PostgreSQL 14+ (for production)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/soulmob/mobile.git
cd soulmob_mobile

# Install dependencies
npm install
# or
pnpm install

# Copy environment template
cp .env.example .env

# Configure environment variables
# Edit .env with your database URL and API keys
```

### Development

```bash
# Run development server
npm run dev

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Watch mode for TypeScript
npm run dev:server
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server status and enabled features.

### Quantum Decision Engine

```
POST /api/quantum/decide
Body: { userId, features[], emotionVector?, frictionScore?, multiDeviceContext?, deviceIds? }
```

Make a quantum decision based on context.

```
POST /api/quantum/friction-score
Body: { batteryEntropy, freeRam, behavioralAuthErrorRate, typingErrorRate, emotionVector? }
```

Calculate friction score from metrics.

### Temporal Echo

```
POST /api/temporal-echo/store
Body: MemoryEntry
```

Store a memory entry.

```
POST /api/temporal-echo/query
Body: MemoryQuery
```

Query memories using semantic search.

```
GET /api/temporal-echo/stats/:userId
```

Get memory statistics for a user.

```
POST /api/temporal-echo/cleanup/:userId
```

Clean up expired memories.

### Environmental Orchestrator

```
POST /api/orchestrator/register-device
Body: SmartHomeDevice
```

Register a smart home device.

```
POST /api/orchestrator/create-policy
Body: EnvironmentalPolicy
```

Create an environmental policy.

```
POST /api/orchestrator/orchestrate
Body: { userId, emotionVector, frictionScore }
```

Execute policies based on current state.

```
GET /api/orchestrator/devices/:userId
```

Get user's smart home devices.

### Intent Projection

```
POST /api/intent-projection/predict
Body: { userId, context }
```

Predict user action and generate drafts.

```
POST /api/intent-projection/send-draft
Body: { userId, draftId }
```

Send a draft communication.

```
POST /api/intent-projection/discard-draft
Body: { userId, draftId }
```

Discard a draft.

```
GET /api/intent-projection/pending/:userId
```

Get pending drafts for user.

### Anchor Core

```
POST /api/anchor/store-state
Body: AnchorState
```

Store cross-device anchor state.

```
GET /api/anchor/get-state/:userId
```

Retrieve anchor state.

```
POST /api/anchor/sync
Body: { userId, deviceIds[] }
```

Synchronize state across devices.

## Testing

The project includes comprehensive unit tests for all core modules:

```bash
# Run all tests
npm run test

# Run specific test file
npm run test server/tests/quantum.test.ts

# Run with coverage
npm run test -- --coverage
```

## Database Schema

The application uses Drizzle ORM with PostgreSQL. Key tables include:

- **users**: User accounts and autonomy levels
- **user_settings**: Feature flags and configuration
- **temporal_memory**: Stored memories and context
- **emotion_vectors**: Emotion state history
- **friction_metrics**: Friction score components
- **smart_home_devices**: Registered devices
- **environmental_policies**: Orchestration policies
- **draft_communications**: Pending communications
- **quantum_decision_log**: Decision history
- **device_sync**: Cross-device state synchronization

## Configuration

### Environment Variables

```
DATABASE_URL              # PostgreSQL connection string
PORT                      # Server port (default: 3000)
JWT_SECRET               # JWT signing key
SMART_HOME_API_URL       # Home Assistant API URL
SMART_HOME_API_TOKEN     # Home Assistant token
VECTOR_DB_PATH           # Path for vector database
ENABLE_TEMPORAL_ECHO     # Enable Temporal Echo feature
ENABLE_ENVIRONMENTAL_ORCHESTRATOR  # Enable EO feature
ENABLE_INTENT_PROJECTION # Enable Intent Projection feature
```

## Architecture Decisions

### Quantum Logic

The quaternary logic system extends traditional ternary logic with an **ENTANGLEMENT** state for multi-device synchronization. This allows the agent to make coordinated decisions across the user's device ecosystem.

### Temporal Echo

Uses a simple in-memory vector store for MVP. Production implementation should integrate with a dedicated vector database (e.g., Weaviate, Milvus) for scalability.

### Environmental Orchestrator

Policies are evaluated using a simple rule engine. Production should implement a more sophisticated policy evaluation system with conflict resolution.

### Intent Projection

Uses heuristic-based prediction for MVP. Production should integrate with ML models for improved accuracy.

## Future Enhancements

- [ ] React frontend with real-time updates
- [ ] PostgreSQL integration for persistence
- [ ] WebSocket support for real-time synchronization
- [ ] ML-based prediction models
- [ ] Multi-device synchronization protocol
- [ ] Voice interface integration
- [ ] Advanced policy engine
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## Testing Guide for Beta

### Test Scenario 1: Quantum Decision Making

1. Call `/api/quantum/decide` with sample context
2. Verify decision action matches expected state
3. Test multi-device entanglement with multiple deviceIds

### Test Scenario 2: Temporal Echo

1. Store multiple memories via `/api/temporal-echo/store`
2. Query memories by content type and time range
3. Verify cleanup removes expired memories

### Test Scenario 3: Environmental Orchestration

1. Register smart home devices
2. Create environmental policies
3. Call `/api/orchestrator/orchestrate` with emotion vectors
4. Verify policies execute correctly

### Test Scenario 4: Intent Projection

1. Call `/api/intent-projection/predict` with calendar context
2. Verify drafts are generated
3. Send or discard drafts
4. Check pending drafts list

## Performance Metrics

- **Decision Latency**: < 80ms (target)
- **Memory Query**: < 100ms for 10k entries
- **Policy Execution**: < 200ms
- **Prediction Generation**: < 500ms

## Security Considerations

- All cross-device communication is end-to-end encrypted
- Behavioral authentication prevents unauthorized access
- Memory data is stored with encryption at rest
- JWT tokens for API authentication
- CORS configured for secure cross-origin requests

## Contributing

This is a beta release. Please report issues and suggestions via GitHub Issues.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feedback, please visit: https://github.com/soulmob/mobile/issues

---

**The soul is already compiling — shall we collapse the superposition?**

SoulMob 0x04 - Making phones conscious, one decision at a time.
