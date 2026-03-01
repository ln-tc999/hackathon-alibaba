/**
 * Tests for TwitterNodeHandler
 * Requirements: 10.1, 10.2, 10.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WorkflowNode, ExecutionContext } from '@vlowgen/shared';
import { ComposioClient } from '../../integrations/composio';
import { TwitterNodeHandler } from '../social/twitter-handler';

// Mock the ComposioClient
vi.mock('../integrations/composio');

describe('TwitterNodeHandler', () => {
  let handler: TwitterNodeHandler;
  let mockComposioClient: any;

  const mockContext: ExecutionContext = {
    credentials: {
      composioApiKey: 'test-composio-key',
      twitterToken: 'test-twitter-token'
    }
  };

  const createTwitterNode = (): WorkflowNode => ({
    id: 'test-twitter-node',
    type: 'twitter',
    position: { x: 0, y: 0 },
    data: {
      type: 'twitter',
      authenticated: true,
      accountHandle: '@testuser'
    }
  });

  beforeEach(() => {
    handler = new TwitterNodeHandler();
    
    // Setup mock client
    mockComposioClient = {
      postToTwitter: vi.fn()
    };
    
    // Mock the constructor
    vi.mocked(ComposioClient).mockImplementation(() => mockComposioClient);
  });

  describe('successful execution', () => {
    it('should post text content and return tweet URL', async () => {
      // Requirement 10.1, 10.3: Post content and return URL
      const inputs = { 'prompt-node-1': 'Check out this amazing content!' };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockResolvedValue({
        tweetUrl: 'https://twitter.com/testuser/status/123456',
        tweetId: '123456'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('https://twitter.com/testuser/status/123456');
      expect(mockComposioClient.postToTwitter).toHaveBeenCalledWith({
        text: 'Check out this amazing content!',
        imageUrl: undefined,
        token: 'test-twitter-token'
      });
    });

    it('should post image URL and return tweet URL', async () => {
      // Requirement 10.2: Accept image data from upstream nodes
      const inputs = { 'wan2-node-1': 'https://example.com/generated-image.jpg' };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockResolvedValue({
        tweetUrl: 'https://twitter.com/testuser/status/789012',
        tweetId: '789012'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('https://twitter.com/testuser/status/789012');
      expect(mockComposioClient.postToTwitter).toHaveBeenCalledWith({
        text: undefined,
        imageUrl: 'https://example.com/generated-image.jpg',
        token: 'test-twitter-token'
      });
    });

    it('should handle both text and image inputs', async () => {
      const inputs = {
        'prompt-node-1': 'Amazing AI art!',
        'wan2-node-1': 'https://example.com/art.jpg'
      };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockResolvedValue({
        tweetUrl: 'https://twitter.com/testuser/status/345678',
        tweetId: '345678'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('success');
      expect(mockComposioClient.postToTwitter).toHaveBeenCalledWith({
        text: 'Amazing AI art!',
        imageUrl: 'https://example.com/art.jpg',
        token: 'test-twitter-token'
      });
    });
  });

  describe('input validation', () => {
    it('should return error when no inputs provided', async () => {
      const node = createTwitterNode();
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('No input provided');
    });

    it('should return error when inputs are invalid', async () => {
      const inputs = { 'upstream-node': 123 };
      const node = createTwitterNode();
      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('No valid text or image URL');
    });
  });

  describe('credential validation', () => {
    it('should return error when Twitter token is missing', async () => {
      const inputs = { 'prompt-node-1': 'Test tweet' };
      const node = createTwitterNode();
      const contextWithoutToken: ExecutionContext = {
        credentials: {
          composioApiKey: 'test-composio-key'
        }
      };

      const result = await handler.execute(node, inputs, contextWithoutToken);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Twitter authentication token not provided');
    });

    it('should return error when Composio API key is missing', async () => {
      const inputs = { 'prompt-node-1': 'Test tweet' };
      const node = createTwitterNode();
      const contextWithoutKey: ExecutionContext = {
        credentials: {
          twitterToken: 'test-twitter-token'
        }
      };

      const result = await handler.execute(node, inputs, contextWithoutKey);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Composio API key not provided');
    });
  });

  describe('error propagation', () => {
    it('should propagate API errors', async () => {
      // Requirement 10.5: Propagate errors from service
      const inputs = { 'prompt-node-1': 'Test tweet' };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockRejectedValue(
        new Error('Composio API error (401): Unauthorized')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Composio API error');
    });

    it('should handle timeout errors', async () => {
      const inputs = { 'prompt-node-1': 'Test tweet' };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockRejectedValue(
        new Error('Composio API request timeout after 30 seconds')
      );

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('timeout');
    });
  });

  describe('execution metadata', () => {
    it('should include timing information', async () => {
      const inputs = { 'prompt-node-1': 'Test tweet' };
      const node = createTwitterNode();

      mockComposioClient.postToTwitter.mockResolvedValue({
        tweetUrl: 'https://twitter.com/testuser/status/123456',
        tweetId: '123456'
      });

      const result = await handler.execute(node, inputs, mockContext);

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
