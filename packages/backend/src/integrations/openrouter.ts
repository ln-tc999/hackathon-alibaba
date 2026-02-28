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
   * Uses bytedance-seed/seedream-4.5 model for image generation
   * 
   * @param params - Generation parameters including prompt, model, dimensions, and optional negative prompt
   * @returns Promise resolving to image URL
   * @throws Error if API request fails or returns an error
   */
  async generateImage(params: OpenRouterGenerateParams): Promise<OpenRouterGenerateResponse> {
    try {
      // Use bytedance-seed/seedream-4.5 for image generation
      const imageModel = 'bytedance-seed/seedream-4.5';
      
      const requestBody = {
        model: imageModel,
        messages: [
          {
            role: 'user',
            content: params.prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      };

      const response = await this.client.post('/chat/completions', requestBody, {
        headers: {
          'HTTP-Referer': 'https://vlowgen.com',
          'X-Title': 'VlowGen Image Generator',
        },
      });

      // Extract image URL from response
      const imageUrl = response.data.choices?.[0]?.message?.content;
      
      if (!imageUrl) {
        throw new Error('Invalid API response: missing image URL');
      }

      return {
        imageUrl,
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