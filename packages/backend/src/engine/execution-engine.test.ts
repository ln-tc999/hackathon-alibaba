/**
 * Unit tests for WorkflowExecutionEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowExecutionEngine } from './execution-engine';
import {
  Workflow,
  WorkflowNode,
  ExecutionContext,
  NodeExecutionResult
} from '@vlowgen/shared';

describe('WorkflowExecutionEngine', () => {
  let engine: WorkflowExecutionEngine;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    engine = new WorkflowExecutionEngine();
    mockContext = {
      credentials: {
        wan2ApiKey: 'test-key',
        composioApiKey: 'test-key'
      }
    };
  });

  describe('topologicalSort', () => {
    it('should sort a simple linear workflow', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test' }
          },
          {
            id: 'node-2',
            type: 'wan2',
            position: { x: 100, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          },
          {
            id: 'node-3',
            type: 'twitter',
            position: { x: 200, y: 0 },
            data: { type: 'twitter', authenticated: true }
          }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' },
          { id: 'edge-2', source: 'node-2', target: 'node-3' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Register mock handlers
      const executionOrder: string[] = [];
      
      for (const nodeType of ['prompt-text', 'wan2', 'twitter']) {
        engine.registerNodeHandler(nodeType, {
          async execute(node, inputs, context) {
            executionOrder.push(node.id);
            return {
              nodeId: node.id,
              status: 'success',
              output: `output-${node.id}`,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              duration: 10
            };
          }
        });
      }

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('success');
      expect(executionOrder).toEqual(['node-1', 'node-2', 'node-3']);
    });

    it('should handle disconnected nodes', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test' }
          },
          {
            id: 'node-2',
            type: 'prompt-text',
            position: { x: 100, y: 0 },
            data: { type: 'prompt-text', promptText: 'test2' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const executionOrder: string[] = [];
      
      engine.registerNodeHandler('prompt-text', {
        async execute(node, inputs, context) {
          executionOrder.push(node.id);
          return {
            nodeId: node.id,
            status: 'success',
            output: `output-${node.id}`,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 10
          };
        }
      });

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('success');
      expect(executionOrder.length).toBe(2);
      expect(executionOrder).toContain('node-1');
      expect(executionOrder).toContain('node-2');
    });

    it('should handle multiple starting points', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test1' }
          },
          {
            id: 'node-2',
            type: 'prompt-text',
            position: { x: 0, y: 100 },
            data: { type: 'prompt-text', promptText: 'test2' }
          },
          {
            id: 'node-3',
            type: 'wan2',
            position: { x: 100, y: 50 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-3' },
          { id: 'edge-2', source: 'node-2', target: 'node-3' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const executionOrder: string[] = [];
      
      for (const nodeType of ['prompt-text', 'wan2']) {
        engine.registerNodeHandler(nodeType, {
          async execute(node, inputs, context) {
            executionOrder.push(node.id);
            return {
              nodeId: node.id,
              status: 'success',
              output: `output-${node.id}`,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              duration: 10
            };
          }
        });
      }

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('success');
      expect(executionOrder.length).toBe(3);
      
      // node-3 should come after both node-1 and node-2
      const node3Index = executionOrder.indexOf('node-3');
      const node1Index = executionOrder.indexOf('node-1');
      const node2Index = executionOrder.indexOf('node-2');
      
      expect(node3Index).toBeGreaterThan(node1Index);
      expect(node3Index).toBeGreaterThan(node2Index);
    });
  });

  describe('execute', () => {
    it('should validate workflow before execution', async () => {
      const invalidWorkflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await engine.execute(invalidWorkflow, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('validation failed');
    });

    it('should pass data between connected nodes', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test' }
          },
          {
            id: 'node-2',
            type: 'wan2',
            position: { x: 100, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let node2Inputs: Record<string, any> = {};

      engine.registerNodeHandler('prompt-text', {
        async execute(node, inputs, context) {
          return {
            nodeId: node.id,
            status: 'success',
            output: 'prompt-output',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 10
          };
        }
      });

      engine.registerNodeHandler('wan2', {
        async execute(node, inputs, context) {
          node2Inputs = inputs;
          return {
            nodeId: node.id,
            status: 'success',
            output: 'image-url',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 10
          };
        }
      });

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('success');
      expect(node2Inputs['node-1']).toBe('prompt-output');
    });

    it('should stop execution and report error when a node fails', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test' }
          },
          {
            id: 'node-2',
            type: 'wan2',
            position: { x: 100, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      engine.registerNodeHandler('prompt-text', {
        async execute(node, inputs, context) {
          return {
            nodeId: node.id,
            status: 'error',
            error: 'Test error',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 10
          };
        }
      });

      engine.registerNodeHandler('wan2', {
        async execute(node, inputs, context) {
          return {
            nodeId: node.id,
            status: 'success',
            output: 'should-not-execute',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 10
          };
        }
      });

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('node-1');
      expect(result.error).toContain('Test error');
      expect(result.nodeResults['node-2']).toBeUndefined();
    });

    it('should return error when no handler is registered for node type', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'test' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await engine.execute(workflow, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('No handler registered');
    });
  });
});
