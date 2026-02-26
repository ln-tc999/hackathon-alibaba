/**
 * Tests for OpenRouterNodeHandler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterNodeHandler } from './openrouter-handler';
import { WorkflowNode, ExecutionContext, OpenRouterNodeData } from '@vlowgen/shared';
import { OpenRouterClient } from '../integrations/openrouter';

// Mock the OpenRouterClient
vi.mock('../integrations/openrouter');

describe('OpenRouterNodeHandler', () => {
  let handler: OpenRouterNodeHandler;
  let mockOpenRouterClient: any;

  const mockContext: ExecutionContext = {
    credentials: {
      openRouterApiKey: 'test-api-key'
    }
  };

  const createOpenRouterNode = (): WorkflowNode => ({
    id: 'test-openrouter-node',
    type: 'openrouter',
    position: { x: 0, y: 0 },
    data: {
      type: 'openrouter',
      model: 'black-forest-labs/flux-1.1-pro',
      width: 1024,
      height: 1024,
      negative_prompt: 'blurry, low quality'
    }
  });

  beforeEach(() => {
    handler = new OpenRouterNodeHandler();
    
    // Setup mock client
    mockOpenRouterClient = {
      generateImage: vi.fn()
    };
    
    // Mock the constructor
    vi.mocked(OpenRouterClient).mockImplementation(() => mockOpenRouterClient);
  });

  describe('successful execution', () => {
    it('should generate image and return URL', async () => {
      const inputs = { 'prompt-node-1': 'A beautiful sunset' };
      const node = createOpenRouterNode();

      mockOpenRouterClient.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.jpg'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('https://example.com/image.jpg');
      
      // Verify the client was called with correct parameters
      expect(mockOpenRouterClient.generateImage).toHaveBeenCalledWith({
        prompt: 'A beautiful sunset',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
        negative_prompt: 'blurry, low quality'
      });
    });
  });

  describe('input validation', () => {
    it('should return error when no inputs are provided', async () => {
      const inputs = {};
      const node = createOpenRouterNode();

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('No input provided');
    });

    it('should return error when prompt is empty', async () => {
      const inputs = { 'prompt-node-1': '' };
      const node = createOpenRouterNode();

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid prompt input');
    });

    it('should return error when prompt is not a string', async () => {
      const inputs = { 'prompt-node-1': 123 };
      const node = createOpenRouterNode();

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid prompt input');
    });
  });

  describe('credential validation', () => {
    it('should return error when API key is missing', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createOpenRouterNode();
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
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createOpenRouterNode();

      mockOpenRouterClient.generateImage.mockRejectedValue(
        new Error('OpenRouter API error (500): Internal server error')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('OpenRouter API error');
    });

    it('should handle timeout errors', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createOpenRouterNode();

      mockOpenRouterClient.generateImage.mockRejectedValue(
        new Error('OpenRouter API request timeout after 60 seconds')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('timeout');
    });
  });

  describe('execution metadata', () => {
    it('should include timing information', async () => {
      const inputs = { 'prompt-node-1': 'Test prompt' };
      const node = createOpenRouterNode();

      mockOpenRouterClient.generateImage.mockResolvedValue({
        imageUrl: 'https://example.com/image.jpg'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});