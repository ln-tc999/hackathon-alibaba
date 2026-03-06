# API Specification

## Overview

VlowGen Platform API documentation for backend services, smart contract interactions, and third-party integrations.

## Base URL

```
Development: http://localhost:3001/api
Production:  https://api.vlowgen.com/api
```

## Authentication

### Wallet Authentication
```typescript
// Connect wallet and get session token
POST /auth/connect
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x...",
  "message": "Sign in to VlowGen"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "credits": 100
  }
}
```

### API Key Authentication
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Workflows

#### Create Workflow
```typescript
POST /workflows
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workflow",
  "nodes": [
    {
      "id": "node-1",
      "type": "prompt-text",
      "position": { "x": 100, "y": 100 },
      "data": {
        "type": "prompt-text",
        "promptText": "A beautiful sunset"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}

Response: 201 Created
{
  "id": "workflow-123",
  "name": "My Workflow",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### Get Workflow
```typescript
GET /workflows/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "workflow-123",
  "name": "My Workflow",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### List Workflows
```typescript
GET /workflows?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "workflows": [...],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### Update Workflow
```typescript
PUT /workflows/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Workflow",
  "nodes": [...],
  "edges": [...]
}

Response: 200 OK
```

#### Delete Workflow
```typescript
DELETE /workflows/:id
Authorization: Bearer <token>

Response: 204 No Content
```

### 2. Workflow Execution

#### Execute Workflow
```typescript
POST /workflows/:id/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "credentials": {
    "wan2ApiKey": "xxx",
    "openRouterApiKey": "xxx",
    "composioApiKey": "xxx"
  }
}

Response: 202 Accepted
{
  "executionId": "exec-456",
  "status": "running",
  "workflowId": "workflow-123"
}
```

#### Get Execution Status
```typescript
GET /executions/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "exec-456",
  "workflowId": "workflow-123",
  "status": "success",
  "results": {
    "nodeResults": {
      "node-1": {
        "nodeId": "node-1",
        "status": "success",
        "output": { "text": "A beautiful sunset" },
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:00:01Z",
        "duration": 1000
      }
    }
  },
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:00:05Z"
}
```

#### List Executions
```typescript
GET /executions?workflowId=workflow-123&page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "executions": [...],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### 3. Credits & Payments

#### Get Credit Balance
```typescript
GET /credits/balance
Authorization: Bearer <token>

Response: 200 OK
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "credits": 100,
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

#### Purchase Credits
```typescript
POST /credits/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "paymentMethod": "eth",
  "txHash": "0x..."
}

Response: 200 OK
{
  "credits": 200,
  "transaction": {
    "hash": "0x...",
    "amount": 100,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Transaction History
```typescript
GET /credits/transactions?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "transactions": [
    {
      "id": "tx-789",
      "type": "purchase",
      "amount": 100,
      "credits": 100,
      "txHash": "0x...",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

### 4. NFT Minting

#### Mint NFT
```typescript
POST /nft/mint
Authorization: Bearer <token>
Content-Type: application/json

{
  "workflowId": "workflow-123",
  "executionId": "exec-456",
  "imageUrl": "https://...",
  "recipientAddress": "0x..."
}

Response: 202 Accepted
{
  "mintId": "mint-789",
  "status": "pending",
  "ipfsHash": "QmXxx..."
}
```

#### Get Mint Status
```typescript
GET /nft/mint/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "mint-789",
  "status": "completed",
  "ipfsHash": "QmXxx...",
  "metadataHash": "QmYyy...",
  "txHash": "0x...",
  "tokenId": 123,
  "contractAddress": "0x...",
  "openseaUrl": "https://opensea.io/assets/..."
}
```

#### List User NFTs
```typescript
GET /nft/user/:address?page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "nfts": [
    {
      "tokenId": 123,
      "ipfsHash": "QmXxx...",
      "workflowId": "workflow-123",
      "mintedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

### 5. AI Chat

#### Generate Workflow from Prompt
```typescript
POST /ai/generate-workflow
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Create a workflow that generates an image and posts to Twitter"
}

Response: 200 OK
{
  "workflow": {
    "name": "AI Generated Workflow",
    "nodes": [...],
    "edges": [...]
  },
  "explanation": "This workflow will..."
}
```

#### Chat with AI
```typescript
POST /ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How do I add a new node?",
  "conversationId": "conv-123"
}

Response: 200 OK
{
  "response": "To add a new node...",
  "conversationId": "conv-123"
}
```

## WebSocket API

### Real-time Execution Updates

```typescript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: '<jwt-token>'
}));

// Subscribe to execution updates
ws.send(JSON.stringify({
  type: 'subscribe',
  executionId: 'exec-456'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'execution-update') {
    console.log('Node completed:', data.nodeId);
    console.log('Status:', data.status);
  }
};
```

### Event Types

```typescript
// Node started
{
  "type": "node-started",
  "executionId": "exec-456",
  "nodeId": "node-1",
  "timestamp": "2024-01-15T10:00:00Z"
}

// Node completed
{
  "type": "node-completed",
  "executionId": "exec-456",
  "nodeId": "node-1",
  "status": "success",
  "output": {...},
  "timestamp": "2024-01-15T10:00:01Z"
}

// Execution completed
{
  "type": "execution-completed",
  "executionId": "exec-456",
  "status": "success",
  "timestamp": "2024-01-15T10:00:05Z"
}

// Error occurred
{
  "type": "error",
  "executionId": "exec-456",
  "nodeId": "node-1",
  "error": "API key invalid",
  "timestamp": "2024-01-15T10:00:01Z"
}
```

## Error Responses

### Standard Error Format
```typescript
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Workflow validation failed",
    "details": {
      "field": "nodes",
      "reason": "At least one node is required"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_INPUT` | 400 | Invalid request data |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits to execute workflow |
| `EXECUTION_FAILED` | 500 | Workflow execution failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

### Limits
- Free tier: 100 requests/hour
- Paid tier: 1000 requests/hour
- Enterprise: Custom limits

## Webhooks

### Configure Webhook
```typescript
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["execution.completed", "nft.minted"],
  "secret": "your-webhook-secret"
}

Response: 201 Created
{
  "id": "webhook-123",
  "url": "https://your-app.com/webhook",
  "events": ["execution.completed", "nft.minted"],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Webhook Payload
```typescript
POST https://your-app.com/webhook
X-VlowGen-Signature: sha256=...
Content-Type: application/json

{
  "event": "execution.completed",
  "data": {
    "executionId": "exec-456",
    "workflowId": "workflow-123",
    "status": "success",
    "timestamp": "2024-01-15T10:00:05Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { VlowGenClient } from '@vlowgen/sdk';

const client = new VlowGenClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.vlowgen.com'
});

// Execute workflow
const execution = await client.workflows.execute('workflow-123', {
  credentials: {
    wan2ApiKey: 'xxx'
  }
});

// Listen for updates
execution.on('node-completed', (data) => {
  console.log('Node completed:', data.nodeId);
});

await execution.wait();
console.log('Workflow completed!');
```

### Python
```python
from vlowgen import VlowGenClient

client = VlowGenClient(api_key='your-api-key')

# Execute workflow
execution = client.workflows.execute('workflow-123', {
    'credentials': {
        'wan2ApiKey': 'xxx'
    }
})

# Wait for completion
result = execution.wait()
print(f'Workflow completed: {result.status}')
```

## Testing

### Test Credentials
```
API Base URL: https://api-testnet.vlowgen.com
Test Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Test API Key: test_key_123456789
```

### Postman Collection
Download: [VlowGen API Postman Collection](./postman/vlowgen-api.json)

## Support

- Documentation: https://docs.vlowgen.com
- Discord: https://discord.gg/vlowgen
- Email: support@vlowgen.com
