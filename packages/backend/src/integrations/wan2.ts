/**
 * Wan2.1 Service Client for Alibaba Cloud text-to-image generation
 * 
 * This client handles communication with Alibaba Cloud's Wan2.1 API
 * for AI-powered image generation from text prompts.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface Wan2GenerateParams {
  prompt: string;
  negativePrompt?: string;
  model: 'wanx-v1' | 'wanx-v2' | 'wan2.1-t2i-turbo' | 'wan2.1-t2i-plus' | 'wan2.6-t2i';
  size: '1024*1024' | '512*512' | '720*1280' | '1280*720';
  style?: string;
}

export interface Wan2GenerateResponse {
  imageUrl: string;
  taskId: string;
}

export interface Wan2ApiResponse {
  request_id: string;
  output: {
    task_id: string;
    task_status: string;
    results: Array<{
      url: string;
    }>;
  };
}

export class Wan2Client {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, apiUrl: string = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 60000, // 60 second timeout as per requirements
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  /**
   * Generate an image from a text prompt using Wan2.1 API (async with polling)
   * 
   * @param params - Generation parameters including prompt, model, size, and optional style
   * @returns Promise resolving to image URL and task ID
   * @throws Error if API request fails or returns an error
   */
  async generateImage(params: Wan2GenerateParams): Promise<Wan2GenerateResponse> {
    try {
      // Step 1: Create async task
      const requestBody = {
        model: params.model,
        input: {
          prompt: params.prompt,
          ...(params.negativePrompt && { negative_prompt: params.negativePrompt }),
        },
        parameters: {
          size: params.size,
          n: 1,
          ...(params.style && { style: params.style }),
        },
      };

      const createResponse = await this.client.post<Wan2ApiResponse>('', requestBody, {
        headers: {
          'X-DashScope-Async': 'enable',
        },
      });

      const taskId = createResponse.data.output.task_id;

      // Step 2: Poll for result (max 2 minutes for image)
      const maxAttempts = 40; // 40 attempts × 3 seconds = 2 minutes
      const pollInterval = 3000; // 3 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await this.sleep(pollInterval);

        const statusResponse = await axios.get<Wan2ApiResponse>(
          `https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
            },
          }
        );

        const status = statusResponse.data.output.task_status;

        if (status === 'SUCCEEDED') {
          if (!statusResponse.data.output.results?.[0]?.url) {
            throw new Error('Image generation succeeded but no image URL returned');
          }

          return {
            imageUrl: statusResponse.data.output.results[0].url,
            taskId,
          };
        } else if (status === 'FAILED') {
          throw new Error('Image generation failed');
        } else if (status === 'UNKNOWN') {
          throw new Error('Task expired or not found');
        }

        // Continue polling if PENDING or RUNNING
      }

      throw new Error('Image generation timeout after 2 minutes');
    } catch (error) {
      // Map API errors to standard error format
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Wan2.1 API request timeout');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `Wan2.1 API error (${status}): ${data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`Wan2.1 API network error: ${axiosError.message}`);
      }
      
      // Re-throw non-Axios errors
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
