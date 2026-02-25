/**
 * Tests for Wan2NodeHandler
 * Requirements: 9.1, 9.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Wan2NodeHandler } from './wan2-handler';
import { WorkflowNode, ExecutionContext } from '@vlowgen/shared';
import { Wan2Client } from '../integrations/wan2';

// Mock the Wan2Client
vi.mock('../integrations/wan2');

describe('Wan2NodeHandler', () => {
  let handler: Wan2NodeHandler;
  let mockWan2Client: any;

  const mockContext: ExecutionContext = {
    credentials: {
      wan2ApiKey: 'test-api-key'
    }
  };

  const createWan2Node = (): WorkflowNode => ({
    id: 'test-wan2-node',
    type: 'wan2',
    position: { x: 0, y: 0 },
    data: {
      type: 'wan2',
      model: 'wanx-v1',
      size: '1024x1024',
      style: 'photographic'
    }
  });

  beforeEach(() => {
    handler = new Wan2NodeHandler();
    
    // Setup mock client
    mockWan2Client = {
      generateImage: vi.fn()
    };
    
    // Mock the constructor
    vi.mocked(Wan2Client).mockImplementation(() => mockWan2Client);
  });

  describe('successful execution', () => {
    it('should generate image and return URL', async () => {
      // Requirement 9.1, 9.2: Send prompt to API and return image URL
      const inputs = { 'prompt-node-1': 'A beautiful sunset' };
      const node = createWan2Node();

      mockWan2Client.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.jpg',
        taskId: 'task-123'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('https://example.com/image.jpg');
      expect(mockWan2Client.generateImage).toHaveBeenCalledWith({
        prompt: 'A beautiful sunset',
        model: 'wanx-v1',
        size: '1024x1024',
        style: 'photographic'
      });
    });

    it('should handle node without style parameter', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node: WorkflowNode = {
        id: 'test-wan2-node',
        type: 'wan2',
        position: { x: 0, y: 0 },
        data: {
          type: 'wan2',
          model: 'wanx-v2',
          size: '512x512'
        }
      };

      mockWan2Client.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image2.jpg',
        taskId: 'task-456'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(mockWan2Client.generateImage).toHaveBeenCalledWith({
        prompt: 'Test prompt',
        model: 'wanx-v2',
        size: '512x512',
        style: undefined
      });
    });
  });

  describe('input validation', () => {
    it('should return error when no inputs provided', async () => {
      const node = createWan2Node();
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('No input provided');
    });

    it('should return error when input is not a string', async () => {
      const inputs = { 'upstream-node': 123 };
      const node = createWan2Node();
      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid prompt input');
    });

    it('should return error when input is empty string', async () => {
      const inputs = { 'upstream-node': '' };
      const node = createWan2Node();
      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid prompt input');
    });

    it('should return error when input is whitespace only', async () => {
      const inputs = { 'upstream-node': '   ' };
      const node = createWan2Node();
      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid prompt input');
    });
  });

  describe('credential validation', () => {
    it('should return error when API key is missing', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createWan2Node();
      const contextWithoutKey: ExecutionContext = {
        credentials: {}
      };

      const result = await handler.execute(node, inputs, contextWithoutKey);

      expect(result.status).toBe('error');
      expect(result.error).toContain('API key not provided');
    });
  });

  describe('error propagation', () => {
    it('should propagate API errors', async () => {
      // Requirement 9.4: Propagate errors from service
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createWan2Node();

      mockWan2Client.generateImage.mockRejectedValue(
        new Error('Wan2.1 API error (500): Internal server error')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Wan2.1 API error');
    });

    it('should handle timeout errors', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createWan2Node();

      mockWan2Client.generateImage.mockRejectedValue(
        new Error('Wan2.1 API request timeout after 60 seconds')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('timeout');
    });
  });

  describe('execution metadata', () => {
    it('should include timing information', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createWan2Node();

      mockWan2Client.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.jpg',
        taskId: 'task-123'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
