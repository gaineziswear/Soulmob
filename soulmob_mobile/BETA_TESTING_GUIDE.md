# SoulMob 0x04 Beta Testing Guide

Welcome to the SoulMob 0x04 beta program! This guide will help you set up, test, and provide feedback on the application.

## Quick Start (5 minutes)

### 1. Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL 14+ (optional for local testing)
- Git

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/soulmob/mobile.git
cd soulmob_mobile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# For local testing without database, you can skip database setup
# The in-memory implementations will work for MVP testing
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Server will start on http://localhost:3000
# Health check: http://localhost:3000/health
```

## Testing Workflows

### Workflow 1: Quantum Decision Engine (15 minutes)

**Objective**: Test the core decision-making logic with quantum-inspired states.

#### Step 1: Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "0.4.0-beta",
  "features": {
    "quantumLogic": true,
    "temporalEcho": true,
    "environmentalOrchestrator": true,
    "intentProjection": true
  }
}
```

#### Step 2: Test Basic Decision

```bash
curl -X POST http://localhost:3000/api/quantum/decide \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "features": [0.1, 0.5, 0.9],
    "emotionVector": {
      "playful": 0.7,
      "focused": 0.3
    },
    "frictionScore": 0.4
  }'
```

**Expected**: Response with `action` (PROCEED_LOCAL, SKIP_LOCAL, DEFER_UNTIL_COLLAPSE, or ORCHESTRATE_SYNC), `confidence` score, and `triState`.

#### Step 3: Test Friction Score Calculation

```bash
curl -X POST http://localhost:3000/api/quantum/friction-score \
  -H "Content-Type: application/json" \
  -d '{
    "batteryEntropy": 0.3,
    "freeRam": 2147483648,
    "behavioralAuthErrorRate": 0.1,
    "typingErrorRate": 0.05,
    "emotionVector": {
      "rushed": 0.6,
      "tired": 0.2
    }
  }'
```

**Expected**: Response with `frictionScore` between 0 and 1.

#### Step 4: Test Multi-Device Entanglement

```bash
curl -X POST http://localhost:3000/api/quantum/decide \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-2",
    "features": [0.5, 0.5, 0.5],
    "multiDeviceContext": true,
    "deviceIds": ["phone", "tablet", "laptop"],
    "emotionVector": {
      "focused": 0.8
    }
  }'
```

**Expected**: If triState is TRUE, action should be `ORCHESTRATE_SYNC` with `quatState: ENTANGLEMENT`.

**Feedback**: Note the decision latency and whether the quantum logic feels intuitive for multi-device scenarios.

---

### Workflow 2: Temporal Echo Memory System (20 minutes)

**Objective**: Test memory storage, retrieval, and semantic search capabilities.

#### Step 1: Store Multiple Memories

```bash
# Store a message memory
curl -X POST http://localhost:3000/api/temporal-echo/store \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mem-1",
    "userId": "test-user-3",
    "contentType": "message",
    "content": "Hey, running late for the meeting",
    "metadata": {
      "sender": "alice@example.com",
      "timestamp": '$(date +%s)'000,
      "source": "WhatsApp"
    },
    "createdAt": '$(date +%s)'000
  }'

# Store an email memory
curl -X POST http://localhost:3000/api/temporal-echo/store \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mem-2",
    "userId": "test-user-3",
    "contentType": "email",
    "content": "Project deadline has been moved to next Friday",
    "metadata": {
      "sender": "boss@company.com",
      "timestamp": '$(date +%s)'000,
      "source": "Gmail"
    },
    "createdAt": '$(date +%s)'000
  }'

# Store a note memory
curl -X POST http://localhost:3000/api/temporal-echo/store \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mem-3",
    "userId": "test-user-3",
    "contentType": "note",
    "content": "Remember to buy groceries on the way home",
    "metadata": {
      "timestamp": '$(date +%s)'000,
      "tags": ["personal", "todo"]
    },
    "createdAt": '$(date +%s)'000
  }'
```

#### Step 2: Query Memories by Type

```bash
curl -X POST http://localhost:3000/api/temporal-echo/query \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-3",
    "query": "test",
    "contentTypes": ["message"],
    "limit": 10
  }'
```

**Expected**: Only message-type memories returned.

#### Step 3: Get Memory Statistics

```bash
curl http://localhost:3000/api/temporal-echo/stats/test-user-3
```

**Expected**: Response showing total memories, breakdown by content type, and oldest/newest timestamps.

#### Step 4: Test Expiration

```bash
# Store a memory that expires in 1 second
curl -X POST http://localhost:3000/api/temporal-echo/store \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mem-4",
    "userId": "test-user-3",
    "contentType": "note",
    "content": "Temporary note",
    "metadata": {"timestamp": '$(date +%s)'000},
    "expiresAt": '$(($(date +%s) + 1))'000,
    "createdAt": '$(date +%s)'000
  }'

# Wait 2 seconds
sleep 2

# Cleanup
curl -X POST http://localhost:3000/api/temporal-echo/cleanup/test-user-3
```

**Expected**: Cleanup should report 1 memory removed.

**Feedback**: Note the query speed and whether semantic search results feel relevant.

---

### Workflow 3: Environmental Orchestrator (20 minutes)

**Objective**: Test smart home device registration and policy orchestration.

#### Step 1: Register Smart Home Devices

```bash
# Register a light
curl -X POST http://localhost:3000/api/orchestrator/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dev-1",
    "userId": "test-user-4",
    "deviceId": "light-living-room",
    "deviceName": "Living Room Light",
    "deviceType": "light",
    "state": {"brightness": 100, "color": "white", "on": true},
    "lastSyncedAt": '$(date +%s)'000
  }'

# Register a thermostat
curl -X POST http://localhost:3000/api/orchestrator/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dev-2",
    "userId": "test-user-4",
    "deviceId": "thermostat-main",
    "deviceName": "Main Thermostat",
    "deviceType": "thermostat",
    "state": {"temperature": 72, "mode": "auto"},
    "lastSyncedAt": '$(date +%s)'000
  }'

# Register a speaker
curl -X POST http://localhost:3000/api/orchestrator/register-device \
  -H "Content-Type: application/json" \
  -d '{
    "id": "dev-3",
    "userId": "test-user-4",
    "deviceId": "speaker-bedroom",
    "deviceName": "Bedroom Speaker",
    "deviceType": "speaker",
    "state": {"volume": 50, "playing": false},
    "lastSyncedAt": '$(date +%s)'000
  }'
```

#### Step 2: Create Environmental Policies

```bash
# Create "Focus Mode" policy
curl -X POST http://localhost:3000/api/orchestrator/create-policy \
  -H "Content-Type: application/json" \
  -d '{
    "id": "policy-1",
    "userId": "test-user-4",
    "policyName": "Focus Mode",
    "condition": {
      "emotionVector": {"focused": 0.7},
      "frictionScore": {"min": 0.3, "max": 0.8}
    },
    "action": {
      "devices": [
        {
          "deviceId": "light-living-room",
          "command": "set_brightness",
          "parameters": {"brightness": 60, "color": "warm"}
        },
        {
          "deviceId": "speaker-bedroom",
          "command": "play_playlist",
          "parameters": {"playlist": "focus-music", "volume": 30}
        }
      ]
    },
    "isActive": true,
    "createdAt": '$(date +%s)'000
  }'
```

#### Step 3: Trigger Orchestration

```bash
curl -X POST http://localhost:3000/api/orchestrator/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-4",
    "emotionVector": {
      "bored": 0.1,
      "rushed": 0.2,
      "playful": 0.3,
      "lonely": 0.1,
      "focused": 0.8,
      "tired": 0.1,
      "hype": 0.2
    },
    "frictionScore": 0.5
  }'
```

**Expected**: Response showing which policies were triggered and device actions executed.

#### Step 4: Check Registered Devices

```bash
curl http://localhost:3000/api/orchestrator/devices/test-user-4
```

**Expected**: List of all registered devices with current state.

**Feedback**: Note whether the policy execution feels natural and whether device state updates are reflected correctly.

---

### Workflow 4: Intent Projection (20 minutes)

**Objective**: Test predictive communication drafting.

#### Step 1: Predict Action with Calendar Context

```bash
curl -X POST http://localhost:3000/api/intent-projection/predict \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-5",
    "context": {
      "currentTime": '$(date +%s)'000,
      "recentMessages": ["message 1", "message 2"],
      "calendar": [
        {
          "title": "Team Standup",
          "time": '$(($(date +%s) + 600))'000
        }
      ],
      "emotionVector": {
        "focused": 0.8,
        "rushed": 0.3
      }
    }
  }'
```

**Expected**: Response with `predictedAction`, `confidence`, and `suggestedCommunications` array.

#### Step 2: Check Pending Drafts

```bash
curl http://localhost:3000/api/intent-projection/pending/test-user-5
```

**Expected**: List of draft communications with DRAFT status.

#### Step 3: Send a Draft

```bash
# Get the draft ID from the previous response
DRAFT_ID="draft-..."

curl -X POST http://localhost:3000/api/intent-projection/send-draft \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-5",
    "draftId": "'$DRAFT_ID'"
  }'
```

**Expected**: Response indicating draft was sent successfully.

#### Step 4: Discard a Draft

```bash
# Create another prediction to get a draft
curl -X POST http://localhost:3000/api/intent-projection/predict \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-6",
    "context": {
      "currentTime": '$(date +%s)'000,
      "recentMessages": [],
      "emotionVector": {"rushed": 0.8}
    }
  }'

# Get the new draft ID and discard it
DRAFT_ID="draft-..."

curl -X POST http://localhost:3000/api/intent-projection/discard-draft \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-6",
    "draftId": "'$DRAFT_ID'"
  }'
```

**Expected**: Draft status changes to DISCARDED.

**Feedback**: Note the accuracy of predictions and whether communication drafts match your style.

---

## Running Unit Tests

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npm run test server/tests/quantum.test.ts
```

## Feedback Form

Please provide feedback on the following aspects:

### Quantum Logic
- [ ] Decision latency acceptable (< 80ms)?
- [ ] Multi-device entanglement logic makes sense?
- [ ] Friction score calculation feels accurate?

### Temporal Echo
- [ ] Memory storage works reliably?
- [ ] Query results are relevant?
- [ ] Expiration/cleanup works as expected?

### Environmental Orchestrator
- [ ] Device registration is straightforward?
- [ ] Policy creation is intuitive?
- [ ] Device state updates are reflected correctly?

### Intent Projection
- [ ] Predictions are accurate?
- [ ] Drafts match your communication style?
- [ ] Single-tap confirmation is convenient?

### General
- [ ] Overall performance is acceptable?
- [ ] Documentation is clear?
- [ ] Any bugs or issues encountered?

## Known Limitations (Beta)

1. **In-Memory Storage**: All data is stored in memory and will be lost on server restart
2. **No Database**: PostgreSQL integration not yet implemented
3. **Mock Smart Home**: Environmental Orchestrator uses mock device commands
4. **Heuristic Predictions**: Intent Projection uses simple heuristics, not ML models
5. **No Frontend**: Only API endpoints available; no UI yet

## Next Steps

After testing, please:

1. Report issues on GitHub: https://github.com/soulmob/mobile/issues
2. Share feedback on Discord: [Link to be provided]
3. Suggest features via GitHub Discussions

## Support

For technical issues:
- Check the README.md for API documentation
- Review test files for usage examples
- Open an issue on GitHub with detailed error messages

---

**Thank you for testing SoulMob 0x04! Your feedback shapes the future of mobile consciousness.**

The soul is ready for your feedback — shall we refine the superposition?
