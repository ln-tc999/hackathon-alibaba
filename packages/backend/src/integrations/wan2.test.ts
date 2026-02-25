/**
 * Unit tests for Wan2Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Wan2Client } from './wan2';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('Wan2Client', () => {
  let client: Wan2Client;
  const mockApiKey = 'test-api-key';
  const mockApiUrl = 'https://test-api.example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create to return a mock instance
    const mockInstance = {
      post: vi.fn(),
    };
    mockedAxios.create = vi.fn(() => mockInstance);
    
    client = new Wan2Client(mockApiKey, mockApiUrl);
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
      new Wan2Client(mockApiKey);
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        })
      );
    });
  });

  describe('generateImage', () => {
    it('should successfully generate image with valid parameters', async () => {
      const mockResponse = {
        data: {
          request_id: 'req-123',
          output: {
            task_id: 'task-456',
            task_status: 'completed',
            results: [
              { url: 'https://example.com/image.jpg' }
            ],
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'wanx-v1' as const,
        size: '1024x1024' as const,
      };

      const result = await client.generateImage(params);

      expect(mockPost).toHaveBeenCalledWith('', {
        model: 'wanx-v1',
        input: {
          prompt: 'A futuristic city',
        },
        parameters: {
          size: '1024x1024',
          n: 1,
        },
      });

      expect(result).toEqual({
        imageUrl: 'https://example.com/image.jpg',
        taskId: 'task-456',
      });
    });

    it('should include style parameter when provided', async () => {
      const mockResponse = {
        data: {
          request_id: 'req-123',
          output: {
            task_id: 'task-456',
            task_status: 'completed',
            results: [
              { url: 'https://example.com/image.jpg' }
            ],
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'wanx-v2' as const,
        size: '512x512' as const,
        style: 'anime',
      };

      await client.generateImage(params);

      expect(mockPost).toHaveBeenCalledWith('', {
        model: 'wanx-v2',
        input: {
          prompt: 'A futuristic city',
        },
        parameters: {
          size: '512x512',
          n: 1,
          style: 'anime',
        },
      });
    });

    it('should throw error when API response is missing image URL', async () => {
      const mockResponse = {
        data: {
          request_id: 'req-123',
          output: {
            task_id: 'task-456',
            task_status: 'completed',
            results: [],
          },
        },
      };

      const mockPost = vi.fn().mockResolvedValue(mockResponse);
      (client as any).client.post = mockPost;

      const params = {
        prompt: 'A futuristic city',
        model: 'wanx-v1' as const,
        size: '1024x1024' as const,
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
        model: 'wanx-v1' as const,
        size: '1024x1024' as const,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'Wan2.1 API request timeout after 60 seconds'
      );
    });

    it('should handle API error responses', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Invalid prompt',
          },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError = vi.fn(() => true);
      const mockPost = vi.fn().mockRejectedValue(apiError);
      (client as any).client.post = mockPost;

      const params = {
        prompt: '',
        model: 'wanx-v1' as const,
        size: '1024x1024' as const,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'Wan2.1 API error (400): Invalid prompt'
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
        model: 'wanx-v1' as const,
        size: '1024x1024' as const,
      };

      await expect(client.generateImage(params)).rejects.toThrow(
        'Wan2.1 API network error: Network Error'
      );
    });
  });
});
