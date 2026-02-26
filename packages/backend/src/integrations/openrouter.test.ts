/**
 * Unit tests for OpenRouterClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenRouterClient } from './openrouter';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('OpenRouterClient', () => {
  let client: OpenRouterClient;
  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://openrouter.ai/api/v1';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockInstance = {
      post: vi.fn(),
    };
    mockedAxios.create = vi.fn(() => mockInstance);
    
    client = new OpenRouterClient(mockApiKey, mockApiUrl);
  });

  describe('constructor', () => {
    it('should create client with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockApiUrl,
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`,
        },
      });
    });

    it('should use default API URL if not provided', () => {
      vi.clearAllMocks();
      new OpenRouterClient(mockApiKey);
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://openrouter.ai/api/v1',
        })
      );
    });
  });

  describe('generateImage', () => {
    it('should successfully generate image with valid parameters', async () => {
      const mockResponse = {
        data: {
          data: [
            { url: 'https://example.com/image.jpg' }
          ],
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
      };

      const result = await client.generateImage(params);

      expect(mockPost).toHaveBeenCalledWith('/images/generations', {
        model: 'black-forest-labs/flux-1.1-pro',
        prompt: 'A futuristic city',
        width: 1024,
        height: 1024,
      });

      expect(result).toEqual({
        imageUrl: 'https://example.com/image.jpg',
      });
    });

    it('should include negative prompt parameter when provided', async () => {
      const mockResponse = {
        data: {
          data: [
            { url: 'https://example.com/image.jpg' }
          ],
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
        negative_prompt: 'blurry, low quality',
      };

      await client.generateImage(params);

      expect(mockPost).toHaveBeenCalledWith('/images/generations', {
        model: 'black-forest-labs/flux-1.1-pro',
        prompt: 'A futuristic city',
        width: 1024,
        height: 1024,
        negative_prompt: 'blurry, low quality',
      });
    });

    it('should throw error when API response is missing image URL', async () => {
      const mockResponse = {
        data: {
          data: [],
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'Invalid API response: missing image URL'
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 60000ms exceeded',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(timeoutError);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'OpenRouter API request timeout after 60 seconds'
      );
    });

    it('should handle API error responses', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid prompt',
            },
          },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(apiError);
      (client as any).client.post = mockPost;

      const params = {
        prompt: '',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'OpenRouter API error (400): Invalid prompt'
      );
    });

    it('should handle network errors', async () => {
      const networkError = {
        isAxiosError: true,
        message: 'Network Error',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(networkError);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'OpenRouter API network error: Network Error'
      );
    });
  });
});