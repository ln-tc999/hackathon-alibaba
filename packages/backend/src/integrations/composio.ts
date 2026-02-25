/**
 * Composio Service Client for Twitter integration
 * 
 * This client handles Twitter posting and OAuth authentication
 * through the Composio integration platform.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface PostToTwitterParams {
  text?: string;
  imageUrl?: string;
  token: string;
}

export interface PostToTwitterResponse {
  tweetUrl: string;
  tweetId: string;
}

export interface TwitterAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface TwitterCallbackResponse {
  token: string;
  accountHandle: string;
}

export interface ComposioApiPostResponse {
  data: {
    id: string;
    text: string;
    url: string;
  };
}

export class ComposioClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string, apiUrl: string = 'https://api.composio.dev') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 30000, // 30 second timeout as per requirements
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
  }

  /**
   * Post content to Twitter via Composio
   * 
   * @param params - Post parameters including text, image URL, and user token
   * @returns Promise resolving to tweet URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToTwitter(params: PostToTwitterParams): Promise<PostToTwitterResponse> {
    try {
      const requestBody: any = {
        token: params.token,
      };

      if (params.text) {
        requestBody.text = params.text;
      }

      if (params.imageUrl) {
        requestBody.media = [{ url: params.imageUrl }];
      }

      const response = await this.client.post<ComposioApiPostResponse>(
        '/v1/twitter/post',
        requestBody
      );

      if (!response.data.data?.id || !response.data.data?.url) {
        throw new Error('Invalid API response: missing tweet ID or URL');
      }

      return {
        tweetUrl: response.data.data.url,
        tweetId: response.data.data.id,
      };
    } catch (error) {
      // Map API errors to standard error format
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 30 seconds');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `Composio API error (${status}): ${data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`Composio API network error: ${axiosError.message}`);
      }
      
      // Re-throw non-Axios errors
      throw error;
    }
  }

  /**
   * Get Twitter OAuth authorization URL
   * 
   * @returns Promise resolving to OAuth URL and state parameter
   * @throws Error if API request fails
   */
  async getTwitterAuthUrl(): Promise<TwitterAuthUrlResponse> {
    try {
      const response = await this.client.get<{ auth_url: string; state: string }>(
        '/v1/twitter/auth/url'
      );

      if (!response.data.auth_url) {
        throw new Error('Invalid API response: missing auth URL');
      }

      return {
        authUrl: response.data.auth_url,
        state: response.data.state,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 30 seconds');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `Composio API error (${status}): ${data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`Composio API network error: ${axiosError.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Handle Twitter OAuth callback and exchange code for token
   * 
   * @param code - OAuth authorization code from callback
   * @param state - State parameter for CSRF protection
   * @returns Promise resolving to access token and account handle
   * @throws Error if API request fails or code is invalid
   */
  async handleTwitterCallback(code: string, state: string): Promise<TwitterCallbackResponse> {
    try {
      const response = await this.client.post<{ token: string; account_handle: string }>(
        '/v1/twitter/auth/callback',
        { code, state }
      );

      if (!response.data.token) {
        throw new Error('Invalid API response: missing access token');
      }

      return {
        token: response.data.token,
        accountHandle: response.data.account_handle || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 30 seconds');
        }
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          
          throw new Error(
            `Composio API error (${status}): ${data?.message || axiosError.message}`
          );
        }
        
        throw new Error(`Composio API network error: ${axiosError.message}`);
      }
      
      throw error;
    }
  }
}
