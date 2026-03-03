/**
 * Wan2.1 Service Client for Alibaba Cloud text-to-image generation
 * 
 * This client handles communication with Alibaba Cloud's Wan2.1 API
 * for AI-powered image generation from text prompts.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface Wan2GenerateParams {
  prompt: string;
  model: 'wanx-v1' | 'wanx-v2' | 'wan2.1-t2i-turbo' | 'wan2.1-t2i-plus' | 'wan2.6-t2i';
  size: '1024x1024' | '512x512';
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

  constructor(apiKey: string, apiUrl: string = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis') {
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
   * Generate an image from a text prompt using Wan2.1 API
   * 
   * @param params - Generation parameters including prompt, model, size, and optional style
   * @returns Promise resolving to image URL and task ID
   * @throws Error if API request fails or returns an error
   */
  async generateImage(params: Wan2GenerateParams): Promise<Wan2GenerateResponse> {
    try {
      const requestBody = {
        model: params.model,
        input: {
          prompt: params.prompt,
        },
        parameters: {
          size: params.size,
          n: 1,
          ...(params.style && { style: params.style }),
        },
      };

      const response = await this.client.post<Wan2ApiResponse>('', requestBody);

      // Extract image URL from response
      if (!response.data.output?.results?.[0]?.url) {
        throw new Error('Invalid API response: missing image URL');
      }

      return {
        imageUrl: response.data.output.results[0].url,
        taskId: response.data.output.task_id,
      };
    } catch (error) {
      // Map API errors to standard error format
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Wan2.1 API request timeout after 60 seconds');
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
}
