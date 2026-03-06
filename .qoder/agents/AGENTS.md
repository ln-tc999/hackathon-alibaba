# AGENTS.md - Developer Guide for VlowGen Platform

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

VlowGen is a visual workflow automation platform for content generation and distribution. It uses a monorepo structure with pnpm workspaces.

## Repository Structure

```
/packages
  /frontend     # Astro + React frontend (port 4321)
  /backend      # Express API service (port 3001)
  /shared       # Shared TypeScript types and utilities
```

## Build, Lint, and Test Commands

### Root Commands (pnpm workspaces)

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests matching a pattern (e.g., Property tests)
pnpm test:properties

# Lint all packages
pnpm lint

# Type-check all packages
pnpm type-check

# Format code (Prettier)
pnpm format

# Run all packages in dev mode
pnpm dev
```

### Package-Specific Commands

```bash
# Using pnpm filter
pnpm --filter @vlowgen/backend dev       # Start with hot reload
pnpm --filter @vlowgen/backend build    # Compile TypeScript
pnpm --filter @vlowgen/backend test     # Run vitest
pnpm --filter @vlowgen/shared build      # Compile shared types first
```

### Running a Single Test

```bash
# Run a specific test file
pnpm test path/to/file.test.ts

# Run tests matching a pattern (vitest)
pnpm test --grep "test name pattern"

# Run tests in a specific package
cd packages/backend && pnpm test

# Run a single test by name (vitest)
pnpm test -- -t "should sort a simple linear workflow"
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled** - All TypeScript code must compile with strict checks
- **Target**: ES2020
- **Module**: CommonJS

### Formatting (Prettier)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint Rules

- Extends: `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `prettier`
- `any` type is allowed (`@typescript-eslint/no-explicit-any`: off)
- Unused vars with `_` prefix are allowed (`argsIgnorePattern: "^_"`)
- Empty functions allowed (`@typescript-eslint/no-empty-function`: off)

### Imports Order

1. Node.js built-in modules (e.g., `crypto`, `fs`)
2. External packages (alphabetical)
3. @vlowgen scoped packages (e.g., `@vlowgen/shared`)
4. Local relative imports

```typescript
// Good
import { randomUUID } from 'crypto';
import axios from 'axios';
import express from 'express';
import { Workflow, WorkflowNode } from '@vlowgen/shared';
import { WorkflowValidator } from './validator';
```

### Naming Conventions

- **Classes**: PascalCase (e.g., `WorkflowExecutionEngine`)
- **Interfaces**: PascalCase (e.g., `RateLimitConfig`)
- **Functions/variables**: camelCase (e.g., `checkLimit`, `nodeHandlers`)
- **Constants**: camelCase or UPPER_SNAKE_CASE for config objects
- **Files**: kebab-case (e.g., `execution-engine.ts`, `rate-limiter.service.ts`)

### Types

- Use explicit types for function parameters and return values
- Use `any` sparingly - prefer `unknown` or specific types
- Use interfaces for object shapes, type aliases for unions

```typescript
// Good
async function execute(workflow: Workflow, context: ExecutionContext): Promise<ExecutionResult> {
  // ...
}

// Avoid
async function execute(workflow, context) {
  // ...
}
```

### Error Handling

Always use `instanceof Error` checks when handling caught errors:

```typescript
try {
  // risky operation
} catch (error) {
  return {
    status: 'error',
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}
```

### JSDoc Comments

Use JSDoc for public APIs, classes, and complex functions:

```typescript
/**
 * Executes a workflow and returns the execution result
 * Requirements: 7.1, 7.2, 7.4
 */
async execute(workflow: Workflow, context: ExecutionContext): Promise<ExecutionResult> {
  // ...
}
```

### Testing Conventions

- Test file naming: `*.test.ts` (e.g., `execution-engine.test.ts`)
- Use **vitest** as the test framework
- Use `describe` blocks for grouping tests
- Use clear test names: `should [expected behavior]`
- Include mock data inline for simple tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('WorkflowExecutionEngine', () => {
  let engine: WorkflowExecutionEngine;

  beforeEach(() => {
    engine = new WorkflowExecutionEngine();
  });

  it('should sort a simple linear workflow', async () => {
    // test code
  });
});
```

### General Code Patterns

- Use `Map` for key-value collections
- Use `Record<string, T>` for object dictionaries
- Prefer `const` over `let`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use early returns to reduce nesting

### Service Pattern

Services are typically singleton instances exported at module level:

```typescript
export class RateLimiterService {
  // class implementation
}

export const rateLimiter = new RateLimiterService();
```

### Project Structure Conventions

- React components in `packages/frontend/src/components/`
- API routes in `packages/backend/src/api/`
- Shared types in `packages/shared/src/types/`
- Node handlers in `packages/backend/src/nodes/`
- Integration clients in `packages/backend/src/integrations/`

### Workflow Node Types

Available node types in this platform:

- `prompt-text`, `wan2`, `wan2-video`, `preview`
- `twitter`, `instagram`, `facebook`, `tiktok`, `youtube`
- `prompt-enhancer-image`, `prompt-enhancer-video`, `vision-analyzer`

## Environment Variables

Copy `.env.production.template` to `.env` and configure required values before running.

### Required API Keys

| Variable             | Description                                  |
| -------------------- | -------------------------------------------- |
| `DASHSCOPE_API_KEY`  | Alibaba Cloud Wan2.1 for AI image generation |
| `COMPOSIO_API_KEY`   | Social media integrations                    |
| `OPENROUTER_API_KEY` | Alternative AI provider (optional)           |
