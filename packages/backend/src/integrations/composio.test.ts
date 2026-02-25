/**
 * Unit tests for ComposioClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComposioClient } from './composio';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('ComposioClient', () => {
  let client: ComposioClient;
  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://test-api.example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockInstance = {
      post: vi.fn(),
      get: vi.fn(),
    };
    mockedAxios.create = vi.fn(() => mockInstance);
    
    client = new ComposioClient(mockApiKey, mockApiUrl);
  });

  describe('constructor', () => {
    it('should create client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockApiUrl,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': mockApiKey,
        },
      });
    });

    it('should use default API URL if not provided', () => {
      vi.clearAllMocks();
      new ComposioClient(mockApiKey);
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.composio.dev',
        })
      );
    });
  });

  describe('postToTwitter', () => {
    it('should successfully post text to Twitter', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tweet-123',
            text: 'Hello Twitter',
            url: 'https://twitter.com/user/status/tweet-123',
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        text: 'Hello Twitter',
        token: 'user-token',
      };

      const result = await client.postToTwitter(params);

      expect(mockPost).toHaveBeenCalledWith('/v1/twitter/post', {
        text: 'Hello Twitter',
        token: 'user-token',
      });

      expect(result).toEqual({
        tweetUrl: 'https://twitter.com/user/status/tweet-123',
        tweetId: 'tweet-123',
      });
    });

    it('should successfully post image to Twitter', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tweet-456',
            text: '',
            url: 'https://twitter.com/user/status/tweet-456',
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        imageUrl: 'https://example.com/image.jpg',
        token: 'user-token',
      };

      const result = await client.postToTwitter(params);

      expect(mockPost).toHaveBeenCalledWith('/v1/twitter/post', {
        media: [{ url: 'https://example.com/image.jpg' }],
        token: 'user-token',
      });

      expect(result).toEqual({
        tweetUrl: 'https://twitter.com/user/status/tweet-456',
        tweetId: 'tweet-456',
      });
    });

    it('should post both text and image to Twitter', async () => {
      const mockResponse = {
        data: {
          data: {
            id: 'tweet-789',
            text: 'Check this out!',
            url: 'https://twitter.com/user/status/tweet-789',
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        text: 'Check this out!',
        imageUrl: 'https://example.com/image.jpg',
        token: 'user-token',
      };

      await client.postToTwitter(params);

      expect(mockPost).toHaveBeenCalledWith('/v1/twitter/post', {
        text: 'Check this out!',
        media: [{ url: 'https://example.com/image.jpg' }],
        token: 'user-token',
      });
    });

    it('should throw error when API response is missing tweet data', async () => {
      const mockResponse = {
        data: {
          data: {},
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        text: 'Hello',
        token: 'user-token',
      };

      await expect(client.postToTwitter(params)).rejects.toThrow(
        'Invalid API response: missing tweet ID or URL'
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(timeoutError);
      (client as any).client.post = mockPost;

      const params = {
        text: 'Hello',
        token: 'user-token',
      };

      await expect(client.postToTwitter(params)).rejects.toThrow(
        'Composio API request timeout after 30 seconds'
      );
    });

    it('should handle API error responses', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            message: 'Invalid token',
          },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(apiError);
      (client as any).client.post = mockPost;

      const params = {
        text: 'Hello',
        token: 'invalid-token',
      };

      await expect(client.postToTwitter(params)).rejects.toThrow(
        'Composio API error (401): Invalid token'
      );
    });
  });

  describe('getTwitterAuthUrl', () => {
    it('should successfully get Twitter auth URL', async () => {
      const mockResponse = {
        data: {
          auth_url: 'https://twitter.com/oauth/authorize?state=abc123',
          state: 'abc123',
        },
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.get = mockGet;

      const result = await client.getTwitterAuthUrl();

      expect(mockGet).toHaveBeenCalledWith('/v1/twitter/auth/url');
      expect(result).toEqual({
        authUrl: 'https://twitter.com/oauth/authorize?state=abc123',
        state: 'abc123',
      });
    });

    it('should throw error when auth URL is missing', async () => {
      const mockResponse = {
        data: {},
      };

      const mockGet = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.get = mockGet;

      await expect(client.getTwitterAuthUrl()).rejects.toThrow(
        'Invalid API response: missing auth URL'
      );
    });

    it('should handle API errors', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockGet = vi.fn().mockRejectedValue(apiError);
      (client as any).client.get = mockGet;

      await expect(client.getTwitterAuthUrl()).rejects.toThrow(
        'Composio API error (500): Internal server error'
      );
    });
  });

  describe('handleTwitterCallback', () => {
    it('should successfully handle Twitter callback', async () => {
      const mockResponse = {
        data: {
          token: 'access-token-xyz',
          account_handle: '@testuser',
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const result = await client.handleTwitterCallback('auth-code', 'state-123');

      expect(mockPost).toHaveBeenCalledWith('/v1/twitter/auth/callback', {
        code: 'auth-code',
        state: 'state-123',
      });

      expect(result).toEqual({
        token: 'access-token-xyz',
        accountHandle: '@testuser',
      });
    });

    it('should handle missing account handle', async () => {
      const mockResponse = {
        data: {
          token: 'access-token-xyz',
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const result = await client.handleTwitterCallback('auth-code', 'state-123');

      expect(result).toEqual({
        token: 'access-token-xyz',
        accountHandle: '',
      });
    });

    it('should throw error when token is missing', async () => {
      const mockResponse = {
        data: {},
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      await expect(
        client.handleTwitterCallback('auth-code', 'state-123')
      ).rejects.toThrow('Invalid API response: missing access token');
    });

    it('should handle invalid authorization code', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Invalid authorization code',
          },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(apiError);
      (client as any).client.post = mockPost;

      await expect(
        client.handleTwitterCallback('invalid-code', 'state-123')
      ).rejects.toThrow('Composio API error (400): Invalid authorization code');
    });
  });
});
