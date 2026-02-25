/**
 * Workflow API Router Tests
 * 
 * Tests for workflow execution, validation, and Twitter OAuth endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import workflowRouter from './workflows';
import { Workflow, ExecuteWorkflowRequest, ValidateWorkflowRequest } from '@vlowgen/shared';

describe('Workflow API Router', () => {
  let app: Express;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/workflows', workflowRouter);
    // OAuth endpoints are also in the workflow router
    app.use('/api', workflowRouter);
  });

  describe('POST /api/workflows/validate', () => {
    it('should validate a valid workflow', async () => {
      const validWorkflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: {
              type: 'prompt-text',
              promptText: 'Test prompt'
            }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const requestBody: ValidateWorkflowRequest = {
        workflow: validWorkflow
      };

      const response = await request(app)
        .post('/api/workflows/validate')
        .send(requestBody)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.errors).toEqual([]);
    });

    it('should return validation errors for invalid workflow', async () => {
      const invalidWorkflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: {
              type: 'prompt-text',
              promptText: '' // Empty prompt text - invalid
            }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const requestBody: ValidateWorkflowRequest = {
        workflow: invalidWorkflow
      };

      const response = await request(app)
        .post('/api/workflows/validate')
        .send(requestBody)
        .expect(200);

      expect(response.body.valid).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing workflow', async () => {
      const response = await request(app)
        .post('/api/workflows/validate')
        .send({})
        .expect(400);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('Missing workflow');
    });
  });

  describe('POST /api/workflows/execute', () => {
    it('should return 400 for missing workflow', async () => {
      const response = await request(app)
        .post('/api/workflows/execute')
        .send({ credentials: {} })
        .expect(400);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('Missing workflow');
    });

    it('should return 400 for missing credentials', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/workflows/execute')
        .send({ workflow })
        .expect(400);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('Missing credentials');
    });

    it('should execute a simple prompt-text workflow', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: {
              type: 'prompt-text',
              promptText: 'Hello, world!'
            }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const requestBody: ExecuteWorkflowRequest = {
        workflow,
        credentials: {
          wan2ApiKey: 'test-key',
          composioApiKey: 'test-key'
        }
      };

      const response = await request(app)
        .post('/api/workflows/execute')
        .send(requestBody)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.executionId).toBeDefined();
      expect(response.body.results.nodeResults['node-1'].status).toBe('success');
      expect(response.body.results.nodeResults['node-1'].output).toBe('Hello, world!');
    });

    it('should return error for workflow with validation errors', async () => {
      const workflow: Workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'prompt-text',
            position: { x: 0, y: 0 },
            data: {
              type: 'prompt-text',
              promptText: '' // Empty - will fail validation
            }
          }
        ],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const requestBody: ExecuteWorkflowRequest = {
        workflow,
        credentials: {
          wan2ApiKey: 'test-key',
          composioApiKey: 'test-key'
        }
      };

      const response = await request(app)
        .post('/api/workflows/execute')
        .send(requestBody)
        .expect(200);

      expect(response.body.status).toBe('error');
      expect(response.body.error).toContain('validation failed');
    });
  });

  describe('GET /api/auth/twitter/url', () => {
    it('should return 500 if COMPOSIO_API_KEY is not configured', async () => {
      // Save original env var
      const originalKey = process.env.COMPOSIO_API_KEY;
      delete process.env.COMPOSIO_API_KEY;

      const response = await request(app)
        .get('/api/auth/twitter/url')
        .expect(500);

      expect(response.body.error.type).toBe('system');
      expect(response.body.error.message).toContain('not configured');

      // Restore env var
      if (originalKey) {
        process.env.COMPOSIO_API_KEY = originalKey;
      }
    });
  });

  describe('GET /api/auth/twitter/callback', () => {
    it('should return 400 for missing code parameter', async () => {
      const response = await request(app)
        .get('/api/auth/twitter/callback')
        .query({ state: 'test-state' })
        .expect(400);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('authorization code');
    });

    it('should return 400 for missing state parameter', async () => {
      const response = await request(app)
        .get('/api/auth/twitter/callback')
        .query({ code: 'test-code' })
        .expect(400);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('state parameter');
    });
  });

  describe('GET /api/auth/twitter/token/:tokenKey', () => {
    it('should return 404 for non-existent token', async () => {
      const response = await request(app)
        .get('/api/auth/twitter/token/non-existent-key')
        .expect(404);

      expect(response.body.error.type).toBe('user');
      expect(response.body.error.message).toContain('Token not found');
    });
  });
});
