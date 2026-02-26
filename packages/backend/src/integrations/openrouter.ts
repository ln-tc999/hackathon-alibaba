/**
 * OpenRouter Service Client for AI image generation
 * 
 * This client handles communication with OpenRouter's API
 * for AI-powered image generation from text prompts.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface OpenRouterGenerateParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  negative_prompt?: string;
}

export interface OpenRouterGenerateResponse {
  imageUrl: string;
  taskId?: string;
}

export interface OpenRouterApiResponse {
  data: Array<{
    url: string;
  }>;
}

export class OpenRouterClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, apiUrl: string = 'https://openrouter.ai/api/v1') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  /**
   * Generate an image from a text prompt using OpenRouter API
   * 
   * @param params - Generation parameters including prompt, model, dimensions, and optional negative prompt
   * @returns Promise resolving to image URL
   * @throws Error if API request fails or returns an error
   */
  async generateImage(params: OpenRouterGenerateParams): Promise<OpenRouterGenerateResponse> {
    try {
      const requestBody = {
        model: params.model,
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        ...(params.negative_prompt && { negative_prompt: params.negative_prompt }),
      };

      const response = await this.client.post<OpenRouterApiResponse>('/images/generations', requestBody);

      // Extract image URL from response
      if (!response.data.data?.[0]?.url) {
        throw new Error('Invalid API response: missing image URL');
      }

      return {
        imageUrl: response.data.data[0].url,
      };
    } catch (error) {
      // Map API errors to standard error format
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('OpenRouter API request timeout after 60 seconds');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `OpenRouter API error (${status}): ${data?.error?.message || data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`OpenRouter API network error: ${axiosError.message}`);
      }
      
      // Re-throw non-Axios errors
      throw error;
    }
  }
}