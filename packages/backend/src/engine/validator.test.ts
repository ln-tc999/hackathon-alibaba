/**
 * Tests for WorkflowValidator
 */

import { describe, it, expect } from 'vitest';
import { WorkflowValidator } from './validator';
import { Workflow, WorkflowNode } from '@vlowgen/shared';

describe('WorkflowValidator', () => {
  const validator = new WorkflowValidator();

  describe('validateStructure', () => {
    it('should reject workflow with no nodes', () => {
      const workflow: Workflow = {
        id: 'test-1',
        name: 'Empty Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('structure');
      expect(errors[0].message).toContain('at least one node');
    });

    it('should reject workflow with duplicate node IDs', () => {
      const workflow: Workflow = {
        id: 'test-2',
        name: 'Duplicate Nodes',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test' }
          },
          {
            id: 'node-1',
            type: 'wan2',
            position: { x: 100, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('Duplicate node ID'))).toBe(true);
    });

    it('should reject edges referencing non-existent nodes', () => {
      const workflow: Workflow = {
        id: 'test-3',
        name: 'Invalid Edge',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'non-existent-node'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('non-existent'))).toBe(true);
    });
  });

  describe('validateNodeConfigurations', () => {
    it('should reject prompt-text node with empty text', () => {
      const workflow: Workflow = {
        id: 'test-4',
        name: 'Empty Prompt',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: '' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('non-empty text'))).toBe(true);
    });

    it('should reject wan2 node without model', () => {
      const workflow: Workflow = {
        id: 'test-5',
        name: 'Invalid Wan2',
        nodes: [
          {
            id: 'node-1',
            type: 'wan2',
            position: { x: 0, y: 0 },
            data: { type: 'wan2', model: '' as any, size: '1024x1024' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('must specify a model'))).toBe(true);
    });

    it('should reject twitter node without authentication', () => {
      const workflow: Workflow = {
        id: 'test-6',
        name: 'Unauthenticated Twitter',
        nodes: [
          {
            id: 'node-1',
            type: 'twitter',
            position: { x: 0, y: 0 },
            data: { type: 'twitter', authenticated: false }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('requires authentication'))).toBe(true);
    });
  });

  describe('validateConnections', () => {
    it('should allow prompt-text → wan2 connection', () => {
      const workflow: Workflow = {
        id: 'test-7',
        name: 'Valid Connection',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test prompt' }
          },
          {
            id: 'node-2',
            type: 'wan2',
            position: { x: 200, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.type === 'connection')).toBe(false);
    });

    it('should allow wan2 → twitter connection', () => {
      const workflow: Workflow = {
        id: 'test-8',
        name: 'Valid Connection',
        nodes: [
          {
            id: 'node-1',
            type: 'wan2',
            position: { x: 0, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          },
          {
            id: 'node-2',
            type: 'twitter',
            position: { x: 200, y: 0 },
            data: { type: 'twitter', authenticated: true }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.type === 'connection')).toBe(false);
    });

    it('should reject prompt-text → twitter connection', () => {
      const workflow: Workflow = {
        id: 'test-9',
        name: 'Invalid Connection',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test' }
          },
          {
            id: 'node-2',
            type: 'twitter',
            position: { x: 200, y: 0 },
            data: { type: 'twitter', authenticated: true }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.type === 'connection' && e.message.includes('cannot connect'))).toBe(true);
    });
  });

  describe('detectCycles', () => {
    it('should detect simple cycle', () => {
      const workflow: Workflow = {
        id: 'test-10',
        name: 'Cycle Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test' }
          },
          {
            id: 'node-2',
            type: 'prompt-text',
            position: { x: 200, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test' }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-1'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors.some(e => e.message.includes('Cycle detected'))).toBe(true);
    });

    it('should accept valid DAG', () => {
      const workflow: Workflow = {
        id: 'test-11',
        name: 'Valid DAG',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test prompt' }
          },
          {
            id: 'node-2',
            type: 'wan2',
            position: { x: 200, y: 0 },
            data: { type: 'wan2', model: 'wanx-v1', size: '1024x1024' }
          },
          {
            id: 'node-3',
            type: 'twitter',
            position: { x: 400, y: 0 },
            data: { type: 'twitter', authenticated: true }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2'
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const errors = validator.validate(workflow);
      expect(errors).toHaveLength(0);
    });
  });

  describe('isValid', () => {
    it('should return true for valid workflow', () => {
      const workflow: Workflow = {
        id: 'test-12',
        name: 'Valid Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: { type: 'prompt-text', promptText: 'Test prompt' }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(validator.isValid(workflow)).toBe(true);
    });

    it('should return false for invalid workflow', () => {
      const workflow: Workflow = {
        id: 'test-13',
        name: 'Invalid Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(validator.isValid(workflow)).toBe(false);
    });
  });
});
