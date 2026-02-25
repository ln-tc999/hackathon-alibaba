/**
 * Tests for NodeHandler interface and registry
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NodeHandlerRegistry, NodeHandler } from './handler';
import { WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';

// Mock handler for testing
class MockNodeHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    return {
      nodeId: node.id,
      status: 'success',
      output: 'mock output',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      duration: 0
    };
  }
}

describe('NodeHandlerRegistry', () => {
  let registry: NodeHandlerRegistry;
  let mockHandler: MockNodeHandler;

  beforeEach(() => {
    registry = new NodeHandlerRegistry();
    mockHandler = new MockNodeHandler();
  });

  it('should register a handler for a node type', () => {
    registry.register('prompt-text', mockHandler);
    expect(registry.has('prompt-text')).toBe(true);
  });

  it('should retrieve a registered handler', () => {
    registry.register('prompt-text', mockHandler);
    const handler = registry.get('prompt-text');
    expect(handler).toBe(mockHandler);
  });

  it('should return undefined for unregistered node type', () => {
    const handler = registry.get('prompt-text');
    expect(handler).toBeUndefined();
  });

  it('should return false for has() on unregistered node type', () => {
    expect(registry.has('prompt-text')).toBe(false);
  });

  it('should return all registered node types', () => {
    registry.register('prompt-text', mockHandler);
    registry.register('wan2', mockHandler);
    
    const types = registry.getRegisteredTypes();
    expect(types).toContain('prompt-text');
    expect(types).toContain('wan2');
    expect(types).toHaveLength(2);
  });

  it('should clear all registered handlers', () => {
    registry.register('prompt-text', mockHandler);
    registry.register('wan2', mockHandler);
    
    registry.clear();
    
    expect(registry.has('prompt-text')).toBe(false);
    expect(registry.has('wan2')).toBe(false);
    expect(registry.getRegisteredTypes()).toHaveLength(0);
  });

  it('should allow overwriting a handler for the same node type', () => {
    const handler1 = new MockNodeHandler();
    const handler2 = new MockNodeHandler();
    
    registry.register('prompt-text', handler1);
    registry.register('prompt-text', handler2);
    
    expect(registry.get('prompt-text')).toBe(handler2);
  });
});
