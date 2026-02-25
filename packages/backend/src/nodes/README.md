# Node Handlers

This directory contains the node execution handlers for the VlowGen platform.

## Overview

Node handlers implement the `NodeHandler` interface and are responsible for executing individual nodes in a workflow. Each node type has its own handler that processes inputs, performs the node's operation, and returns results.

## Available Handlers

### PromptTextNodeHandler
Handles `prompt-text` nodes that capture and output user text input.

**Requirements**: 8.1, 8.2, 8.3

**Behavior**:
- Validates input is non-empty and not only whitespace
- Returns the input text as output
- Returns error if validation fails

### Wan2NodeHandler
Handles `wan2` nodes that generate images from text prompts using Alibaba Cloud's Wan2.1 service.

**Requirements**: 9.1, 9.2

**Behavior**:
- Extracts prompt from input data (from upstream nodes)
- Calls Wan2Client with prompt and node configuration
- Returns image URL in output
- Propagates API errors

### TwitterNodeHandler
Handles `twitter` nodes that post content to Twitter via Composio.

**Requirements**: 10.1, 10.2, 10.3

**Behavior**:
- Extracts text and image data from inputs
- Calls ComposioClient to post to Twitter
- Returns tweet URL in output
- Propagates API errors

## Usage Example

```typescript
import { WorkflowExecutionEngine } from '../engine/execution-engine';
import { 
  NodeHandlerRegistry,
  PromptTextNodeHandler,
  Wan2NodeHandler,
  TwitterNodeHandler
} from './index';

// Create handler registry
const registry = new NodeHandlerRegistry();

// Register handlers
registry.register('prompt-text', new PromptTextNodeHandler());
registry.register('wan2', new Wan2NodeHandler());
registry.register('twitter', new TwitterNodeHandler());

// Create execution engine with handlers
const engine = new WorkflowExecutionEngine();
registry.getRegisteredTypes().forEach(type => {
  const handler = registry.get(type);
  if (handler) {
    engine.registerNodeHandler(type, handler);
  }
});

// Execute workflow
const result = await engine.execute(workflow, {
  credentials: {
    wan2ApiKey: process.env.WAN2_API_KEY,
    composioApiKey: process.env.COMPOSIO_API_KEY,
    twitterToken: userTwitterToken
  }
});
```

## Handler Interface

All handlers must implement the `NodeHandler` interface:

```typescript
interface NodeHandler {
  execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}
```

### Parameters

- **node**: The workflow node to execute, containing type, data, and configuration
- **inputs**: Input data from upstream nodes, keyed by source node ID
- **context**: Execution context containing credentials and optional logger

### Return Value

Returns a `NodeExecutionResult` with:
- **nodeId**: ID of the executed node
- **status**: 'success' or 'error'
- **output**: Output data (if successful)
- **error**: Error message (if failed)
- **startTime**: ISO timestamp when execution started
- **endTime**: ISO timestamp when execution ended
- **duration**: Execution duration in milliseconds

## Testing

Each handler has comprehensive unit tests covering:
- Successful execution scenarios
- Input validation
- Credential validation
- Error propagation
- Execution metadata

Run tests with:
```bash
npm test --workspace=packages/backend -- src/nodes --run
```

## Adding New Handlers

To add a new node handler:

1. Create a new file `{node-type}-handler.ts`
2. Implement the `NodeHandler` interface
3. Add comprehensive tests in `{node-type}-handler.test.ts`
4. Export the handler in `index.ts`
5. Register the handler in the execution engine setup
