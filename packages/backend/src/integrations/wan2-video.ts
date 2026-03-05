/**
 * Wan2 Video Service Client for Alibaba Cloud text-to-video generation
 * 
 * This client handles communication with Alibaba Cloud's Wan2 Video API
 * for AI-powered video generation from text prompts.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface Wan2VideoGenerateParams {
  prompt: string;
  model:
    | 'wan2.5-t2v-preview'
    | 'wan2.6-t2v'
    | 'wan2.1-i2v-turbo'
    | 'wan2.5-i2v-preview'
    | 'wan2.6-i2v'
    | 'wan2.6-i2v-flash'
    | 'wan2.1-kf2v-plus'
    | 'wan2.6-r2v'
    | 'wan2.6-r2v-flash';
  size: '832*480' | '720*1280' | '1280*720' | '1920*1080';
  negativePrompt?: string;
}

export interface Wan2VideoGenerateResponse {
  videoUrl: string;
  taskId: string;
}

export interface Wan2VideoTaskResponse {
  request_id: string;
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    video_url?: string;
    code?: string;
    message?: string;
  };
}

export class Wan2VideoClient {
  private client: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://dashscope-intl.aliyuncs.com/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 300000, // 5 minutes timeout for video generation
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  /**
   * Generate a video from a text prompt using Wan2 Video API (async)
   * 
   * @param params - Generation parameters including prompt, model, size
   * @returns Promise resolving to video URL and task ID
   * @throws Error if API request fails or returns an error
   */
  async generateVideo(params: Wan2VideoGenerateParams): Promise<Wan2VideoGenerateResponse> {
    try {
      // Step 1: Create task
      const requestBody = {
        model: params.model,
        input: {
          prompt: params.prompt,
          ...(params.negativePrompt && { negative_prompt: params.negativePrompt }),
        },
        parameters: {
          size: params.size,
          prompt_extend: true,
        },
      };

      const createResponse = await this.client.post<Wan2VideoTaskResponse>(
        '/services/aigc/video-generation/video-synthesis',
        requestBody,
        {
          headers: {
            'X-DashScope-Async': 'enable',
          },
        }
      );

      const taskId = createResponse.data.output.task_id;

      // Step 2: Poll for result (max 5 minutes)
      const maxAttempts = 60; // 60 attempts × 5 seconds = 5 minutes
      const pollInterval = 5000; // 5 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await this.sleep(pollInterval);

        const statusResponse = await this.client.get<Wan2VideoTaskResponse>(
          `/tasks/${taskId}`
        );

        const status = statusResponse.data.output.task_status;

        if (status === 'SUCCEEDED') {
          if (!statusResponse.data.output.video_url) {
            throw new Error('Video generation succeeded but no video URL returned');
          }

          return {
            videoUrl: statusResponse.data.output.video_url,
            taskId,
          };
        } else if (status === 'FAILED') {
          const errorMsg = statusResponse.data.output.message || 'Video generation failed';
          throw new Error(`Wan2 Video API error: ${errorMsg}`);
        } else if (status === 'UNKNOWN') {
          throw new Error('Task expired or not found');
        }

        // Continue polling if PENDING or RUNNING
      }

      throw new Error('Video generation timeout after 5 minutes');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Wan2 Video API request timeout');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `Wan2 Video API error (${status}): ${data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`Wan2 Video API network error: ${axiosError.message}`);
      }
      
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
