/**
 * Composio Service Client for Social Media integrations
 *
 * This client handles social media posting through the Composio integration platform
 * using API v2 with proper action names.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createHash } from 'crypto';
import FormData from 'form-data';

const streamPipeline = promisify(pipeline);

export interface PostToTwitterParams {
  connectedAccountId?: string;
  text?: string;
  imageUrl?: string;
  token: string;
}

export interface PostVideoToTwitterParams {
  connectedAccountId?: string;
  text?: string;
  videoUrl?: string;
  token: string;
}

export interface PostToInstagramParams {
  imageUrl: string;
  caption?: string;
  connectedAccountId?: string;
  igUserId?: string;
}

export interface PostVideoToInstagramParams {
  videoUrl: string;
  caption?: string;
  connectedAccountId?: string;
  igUserId?: string;
}

export interface PostToFacebookParams {
  text: string;
  mediaUrl?: string;
  connectedAccountId?: string;
}

export interface PostToTikTokParams {
  videoUrl: string;
  caption?: string;
  connectedAccountId?: string;
}

export interface UploadToYouTubeParams {
  videoUrl: string;
  title: string;
  description?: string;
  connectedAccountId?: string;
}

export interface PostToTwitterResponse {
  tweetUrl: string;
  tweetId: string;
}

export interface PostToInstagramResponse {
  postUrl?: string;
  postId?: string;
}

export interface PostToFacebookResponse {
  postUrl?: string;
  postId?: string;
}

export interface PostToTikTokResponse {
  postUrl?: string;
  postId?: string;
}

export interface UploadToYouTubeResponse {
  videoUrl?: string;
  videoId?: string;
  manualUpload?: boolean;
  instructions?: string;
}

export interface TwitterAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface TwitterCallbackResponse {
  token: string;
  accountHandle: string;
}

export interface ComposioApiResponse {
  data?: any;
  error?: string | null;
  successful?: boolean;
  successfull?: boolean;
  logId?: string;
}

export interface ConnectionRequest {
  id: string;
  redirectUrl: string;
  waitForConnection: () => Promise<any>;
}

export class ComposioClient {
  private client: AxiosInstance;
  private apiKey: string;
  private defaultConnectedAccountId: string = 'default';

  constructor(apiKey: string, apiUrl: string = 'https://backend.composio.dev/api') {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 60000, // 60 second timeout
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
    });
  }

  /**
   * Initiate OAuth connection using Auth Config ID
   * This is the proper way to let users connect their own accounts
   * API: POST /api/v3/connected_accounts
   */
  async initiateConnection(
    userId: string,
    authConfigId: string,
    options?: { callbackUrl?: string }
  ): Promise<ConnectionRequest> {
    try {
      const response = await this.client.post('/v3/connected_accounts', {
        auth_config: {
          id: authConfigId,
        },
        connection: {
          user_id: userId,
          callback_url: options?.callbackUrl,
        },
      });

      const connectionId = response.data.id;
      // Handle multiple possible response formats from Composio
      const redirectUrl = 
        response.data.redirect_url || 
        response.data.redirectUrl ||
        response.data.connectionData?.val?.redirectUrl || 
        response.data.connectionData?.val?.authUri;

      if (!redirectUrl) {
        throw new Error('No redirect URL received from Composio');
      }

      return {
        id: connectionId,
        redirectUrl,
        waitForConnection: async () => {
          // Poll for connection status
          const maxAttempts = 60; // 5 minutes
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            try {
              const statusResponse = await this.client.get(`/v3/connected_accounts/${connectionId}`);
              if (statusResponse.data.status === 'ACTIVE') {
                return statusResponse.data;
              }
            } catch (error) {
              // Continue polling
            }
          }
          throw new Error('Connection timeout');
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to initiate connection: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get first connected account ID for a platform
   */
  async getConnectedAccountId(appName: string): Promise<string> {
    try {
      const response = await this.client.get('/v3/connectedAccounts', {
        params: { appNames: appName },
      });

      const accounts = response.data.items || [];
      if (accounts.length === 0) {
        throw new Error(`No connected ${appName} account found. Please complete OAuth first.`);
      }

      return accounts[0].id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Failed to get connected account: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * List connected accounts with filters
   */
  async getConnectedAccounts(filters: {
    userId: string;
    app: string;
    statuses?: string[];
  }): Promise<any[]> {
    try {
      const params: any = {};
      params.user_id = filters.userId;
      params.appNames = filters.app;
      if (filters.statuses) params.statuses = filters.statuses;

      const response = await this.client.get('/v3/connectedAccounts', { params });

      return response.data.items || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Composio] Failed to list connected accounts:', error.response?.data);
        throw new Error(`Failed to list connected accounts: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Set default connected account ID for all requests
   */
  setDefaultConnectedAccountId(accountId: string) {
    this.defaultConnectedAccountId = accountId;
  }

  /**
   * Upload media to Twitter using presigned URL flow
   *
   * @param mediaUrl - URL of the media (image or video) to upload
   * @returns Promise resolving to media ID (s3key)
   * @throws Error if upload fails
   */
  async uploadMediaToTwitter(mediaUrl: string): Promise<string> {
    let tempFilePath: string | null = null;

    try {
      
      // Step 1: Download media to temporary file
      tempFilePath = await this.downloadVideo(mediaUrl); // Works for both image and video

      const stats = fs.statSync(tempFilePath);

      // Determine if it's image or video based on URL
      const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('video');
      const mimetype = isVideo ? 'video/mp4' : 'image/png';
      const filename = isVideo ? 'media.mp4' : 'media.png';

      // Step 2: Calculate MD5 hash
      const md5Hash = await this.calculateMD5(tempFilePath);

      // Step 3: Request presigned URL from Composio
      const { s3key, presignedUrl } = await this.requestPresignedUrl(
        filename,
        mimetype,
        md5Hash,
        'twitter',
        'TWITTER_UPLOAD_MEDIA'
      );

      // Step 4: Upload file to presigned URL (direct to S3)
      await this.uploadToPresignedUrl(tempFilePath, presignedUrl, mimetype);

      
      // Return s3key as media ID
      return s3key;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    } finally {
      // Always clean up temporary file
      if (tempFilePath) {
        this.deleteFile(tempFilePath);
      }
    }
  }

  /**
   * Upload file to Composio storage for tool execution using v3 API
   */
  private async uploadFileToComposio(
    fileUrl: string,
    toolSlug: string,
    toolkitSlug: string
  ): Promise<any> {
    let tempFilePath: string | null = null;

    try {

      // Step 1: Download file
      tempFilePath = await this.downloadVideo(fileUrl);
      const stats = fs.statSync(tempFilePath);
      const fileName = path.basename(tempFilePath);

      // Step 2: Calculate MD5
      const md5Hash = await this.calculateMD5(tempFilePath);

      // Determine mimetype
      const mimetype = fileName.endsWith('.mp4') ? 'video/mp4' : 'image/png';

      // Step 3: Request presigned URL
      const { s3key, presignedUrl } = await this.requestPresignedUrl(
        fileName,
        mimetype,
        md5Hash,
        toolkitSlug,
        toolSlug
      );

      // Step 4: Upload to presigned URL
      await this.uploadToPresignedUrl(tempFilePath, presignedUrl, mimetype);


      // Return file metadata in format expected by Composio
      return {
        name: fileName,
        mimetype: mimetype,
        s3key: s3key,
      };
    } catch (error) {
      console.error('[Composio] File upload failed:', error);
      throw error;
    } finally {
      if (tempFilePath) {
        this.deleteFile(tempFilePath);
      }
    }
  }

  /**
   * Upload media to Twitter using v1.1 endpoint (via Composio)
   * Returns media_id_string for use in tweet creation
   */
  private async uploadMediaToTwitterV1(
    mediaUrl: string,
    connectedAccountId: string,
    mediaType: 'image' | 'video'
  ): Promise<string> {
    try {

      // Download media to temp file
      const tempFilePath = await this.downloadVideo(mediaUrl);
      
      try {
        const fileBuffer = fs.readFileSync(tempFilePath);
        const stats = fs.statSync(tempFilePath);
        

        // Create form data for multipart upload
        const formData = new FormData();
        formData.append('media', fileBuffer, {
          filename: path.basename(tempFilePath),
          contentType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
        });

        // Upload using Twitter v1.1 media/upload endpoint via Composio
        const response = await this.client.post<ComposioApiResponse>(
          '/v1/twitter/media/upload',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'X-Connected-Account-Id': connectedAccountId,
            },
          }
        );


        if (response.data.successful || response.data.successfull) {
          const mediaId = response.data.data?.media_id_string || response.data.data?.media_id;
          if (mediaId) {
            return mediaId;
          }
        }

        throw new Error(response.data.error || 'Failed to upload media to Twitter');
      } finally {
        // Clean up temp file
        this.deleteFile(tempFilePath);
      }
    } catch (error) {
      console.error('[Composio] Media upload failed:', error);
      throw error;
    }
  }

  /**
   * Post content to Twitter via Composio API v2
   * Supports text-only and text with media (image/video)
   *
   * @param params - Post parameters including text and optional image URL
   * @returns Promise resolving to tweet URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToTwitter(params: PostToTwitterParams): Promise<PostToTwitterResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      const input: any = {
        text: params.text || 'Posted via VlowGen',
      };

      // If image URL is provided, upload it first
      if (params.imageUrl) {
        try {
          const mediaId = await this.uploadMediaToTwitterV1(
            params.imageUrl,
            connectedAccountId,
            'image'
          );
          input.media__media__ids = [mediaId];
        } catch (uploadError) {
          console.warn('[Composio] Image upload failed, posting text-only:', uploadError);
          // Continue with text-only if upload fails
        }
      }


      const response = await this.client.post<ComposioApiResponse>(
        '/v2/actions/TWITTER_CREATION_OF_A_POST/execute',
        {
          connectedAccountId,
          input,
        }
      );


      if (!response.data.successful && !response.data.successfull) {
        throw new Error(response.data.error || 'Failed to post to Twitter');
      }

      const tweetId = response.data.data?.data?.id || response.data.data?.id;
      const tweetUrl = tweetId ? `https://twitter.com/i/web/status/${tweetId}` : '';

      return {
        tweetUrl,
        tweetId: tweetId || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Post video to Twitter via Composio API v2
   * Supports text-only and text with video
   *
   * @param params - Post parameters including text and optional video URL
   * @returns Promise resolving to tweet URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postVideoToTwitter(params: PostVideoToTwitterParams): Promise<PostToTwitterResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      const input: any = {
        text: params.text || 'Posted via VlowGen',
      };

      // If video URL is provided, upload it first
      if (params.videoUrl) {
        try {
          const mediaId = await this.uploadMediaToTwitterV1(
            params.videoUrl,
            connectedAccountId,
            'video'
          );
          input.media__media__ids = [mediaId];
        } catch (uploadError) {
          console.warn('[Composio] Video upload failed, posting text-only:', uploadError);
          // Continue with text-only if upload fails
        }
      }


      const response = await this.client.post<ComposioApiResponse>(
        '/v2/actions/TWITTER_CREATION_OF_A_POST/execute',
        {
          connectedAccountId,
          input,
        }
      );


      if (!response.data.successful && !response.data.successfull) {
        throw new Error(response.data.error || 'Failed to post video to Twitter');
      }

      const tweetId = response.data.data?.data?.id || response.data.data?.id;
      const tweetUrl = tweetId ? `https://twitter.com/i/web/status/${tweetId}` : '';

      return {
        tweetUrl,
        tweetId: tweetId || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

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

          throw new Error(`Composio API error (${status}): ${data?.message || axiosError.message}`);
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

          throw new Error(`Composio API error (${status}): ${data?.message || axiosError.message}`);
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Post content to Instagram via Composio API v2
   * Uses 2-step process: create media container, then publish
   *
   * @param params - Post parameters including image URL and caption
   * @returns Promise resolving to post URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToInstagram(params: PostToInstagramParams): Promise<PostToInstagramResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      // Get Instagram User ID if not provided
      let igUserId = params.igUserId;
      if (!igUserId) {
        const userInfo = await this.client.post<ComposioApiResponse>(
          '/v2/actions/INSTAGRAM_GET_USER_INFO/execute',
          {
            connectedAccountId,
            input: {},
          }
        );
        igUserId = userInfo.data.data?.id;
        if (!igUserId) {
          throw new Error('Failed to get Instagram User ID');
        }
      }

      // Step 1: Create media container
      const containerResponse = await this.client.post<ComposioApiResponse>(
        '/v2/actions/INSTAGRAM_CREATE_MEDIA_CONTAINER/execute',
        {
          connectedAccountId,
          input: {
            ig_user_id: igUserId,
            image_url: params.imageUrl,
            caption: params.caption || '',
          },
        }
      );

      if (!containerResponse.data.successful && !containerResponse.data.successfull) {
        throw new Error(containerResponse.data.error || 'Failed to create media container');
      }

      const containerId = containerResponse.data.data?.id;
      if (!containerId) {
        throw new Error('Failed to get container ID from response');
      }

      // Step 2: Wait a bit for Instagram to process (simplified - no status check)
      // Composio API might not support INSTAGRAM_GET_MEDIA_CONTAINER_STATUS
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3: Publish the media container
      const publishResponse = await this.client.post<ComposioApiResponse>(
        '/v2/actions/INSTAGRAM_CREATE_POST/execute',
        {
          connectedAccountId,
          input: {
            ig_user_id: igUserId,
            creation_id: containerId,
          },
        }
      );

      if (!publishResponse.data.successful && !publishResponse.data.successfull) {
        throw new Error(publishResponse.data.error || 'Failed to publish post');
      }


      return {
        postUrl: publishResponse.data.data?.permalink,
        postId: publishResponse.data.data?.id,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Post video (reel) to Instagram via Composio API v2
   * Uses 2-step process: create video container, then publish
   *
   * @param params - Post parameters including video URL and caption
   * @returns Promise resolving to post URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postVideoToInstagram(params: PostVideoToInstagramParams): Promise<PostToInstagramResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      // Get Instagram User ID if not provided
      let igUserId = params.igUserId;
      if (!igUserId) {
        const userInfo = await this.client.post<ComposioApiResponse>(
          '/v2/actions/INSTAGRAM_GET_USER_INFO/execute',
          {
            connectedAccountId,
            input: {},
          }
        );
        igUserId = userInfo.data.data?.id;
        if (!igUserId) {
          throw new Error('Failed to get Instagram User ID');
        }
      }


      // Step 1: Create video container (reel)
      const containerResponse = await this.client.post<ComposioApiResponse>(
        '/v2/actions/INSTAGRAM_CREATE_MEDIA_CONTAINER/execute',
        {
          connectedAccountId,
          input: {
            ig_user_id: igUserId,
            video_url: params.videoUrl,
            caption: params.caption || '',
            media_type: 'REELS', // Instagram reels for video
          },
        }
      );

      if (!containerResponse.data.successful && !containerResponse.data.successfull) {
        throw new Error(containerResponse.data.error || 'Failed to create video container');
      }

      const containerId = containerResponse.data.data?.id;
      if (!containerId) {
        throw new Error('Failed to get container ID from response');
      }


      // Step 2: Wait longer for video processing (videos take more time than images)
      // Instagram needs time to download and process the video
      // Try multiple times with increasing wait time
      
      let publishSuccess = false;
      let lastError = null;
      const maxAttempts = 6; // Try up to 6 times
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Wait before attempting to publish (exponential backoff)
        const waitTime = attempt * 10000; // 10s, 20s, 30s, 40s, 50s, 60s
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        // Step 3: Try to publish the video container
        
        try {
          const publishResponse = await this.client.post<ComposioApiResponse>(
            '/v2/actions/INSTAGRAM_CREATE_POST/execute',
            {
              connectedAccountId,
              input: {
                ig_user_id: igUserId,
                creation_id: containerId,
              },
            }
          );

          if (publishResponse.data.successful || publishResponse.data.successfull) {
            publishSuccess = true;
            
            return {
              postUrl: publishResponse.data.data?.permalink,
              postId: publishResponse.data.data?.id,
            };
          } else {
            lastError = publishResponse.data.error || 'Failed to publish video';
          }
        } catch (attemptError) {
          if (axios.isAxiosError(attemptError)) {
            const axiosError = attemptError as AxiosError;
            const errorData = axiosError.response?.data as any;
            lastError = errorData?.error?.error_user_msg || errorData?.error?.message || 'Unknown error';
            
            // If error is not about media not ready, throw immediately
            if (errorData?.error?.error_subcode !== 2207027) {
              throw attemptError;
            }
          } else {
            throw attemptError;
          }
        }
      }

      // If we get here, all attempts failed
      throw new Error(`Failed to publish video after ${maxAttempts} attempts. Last error: ${lastError}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Wait for Instagram media container to be ready for publishing
   * Polls the container status until it's ready or timeout
   *
   * @param connectedAccountId - Connected account ID
   * @param igUserId - Instagram user ID
   * @param containerId - Media container ID
   * @param maxAttempts - Maximum number of polling attempts (default: 15)
   * @param delayMs - Delay between attempts in milliseconds (default: 1000)
   */
  private async waitForMediaReady(
    connectedAccountId: string,
    igUserId: string,
    containerId: string,
    maxAttempts: number = 15,
    delayMs: number = 1000
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

      try {
        // Check container status
        const statusResponse = await this.client.post<ComposioApiResponse>(
          '/v2/actions/INSTAGRAM_GET_MEDIA_CONTAINER_STATUS/execute',
          {
            connectedAccountId,
            input: {
              ig_user_id: igUserId,
              container_id: containerId,
            },
          }
        );

        const status = statusResponse.data.data?.status_code;

        // Status codes:
        // - "FINISHED" or "PUBLISHED": Media is ready
        // - "IN_PROGRESS": Still processing
        // - "ERROR": Processing failed
        if (status === 'FINISHED' || status === 'PUBLISHED') {
          return;
        }

        if (status === 'ERROR') {
          const errorMessage = statusResponse.data.data?.error_message || 'Unknown error';
          throw new Error(`Media processing failed on Instagram: ${errorMessage}`);
        }

        // Wait before next attempt (exponential backoff for first few attempts)
        if (attempt < maxAttempts) {
          const waitTime = attempt <= 3 ? delayMs : delayMs * 1.5;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        // If status check fails, wait and retry
        console.warn(`[Composio] Status check failed (attempt ${attempt}):`, error);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          // Last attempt failed, try to publish anyway
          console.warn('[Composio] Status check failed, attempting to publish anyway...');
        }
      }
    }

    // If we reach here, media is still not ready after max attempts
    // Try to publish anyway - Instagram might accept it
    console.warn('[Composio] Media status check timeout, attempting to publish anyway...');
  }

  /**
   * Post content to Facebook via Composio API v2
   *
   * @param params - Post parameters including text and optional media URL
   * @returns Promise resolving to post URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToFacebook(params: PostToFacebookParams): Promise<PostToFacebookResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      // Use FACEBOOK_CREATE_PHOTO_POST if media is provided, otherwise FACEBOOK_CREATE_POST
      const action = params.mediaUrl ? 'FACEBOOK_CREATE_PHOTO_POST' : 'FACEBOOK_CREATE_POST';

      const input: any = {
        message: params.text,
      };

      if (params.mediaUrl) {
        input.url = params.mediaUrl;
      }

      const response = await this.client.post<ComposioApiResponse>(
        `/v2/actions/${action}/execute`,
        {
          connectedAccountId,
          input,
        }
      );

      if (!response.data.successful && !response.data.successfull) {
        throw new Error(response.data.error || 'Failed to post to Facebook');
      }

      return {
        postUrl: response.data.data?.permalink_url || response.data.data?.url,
        postId: response.data.data?.id,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Post video to TikTok via Composio API v2
   *
   * @param params - Post parameters including video URL and caption
   * @returns Promise resolving to post URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToTikTok(params: PostToTikTokParams): Promise<PostToTikTokResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      // Step 1: Upload video
      const uploadResponse = await this.client.post<ComposioApiResponse>(
        '/v2/actions/TIKTOK_UPLOAD_VIDEO/execute',
        {
          connectedAccountId,
          input: {
            video_url: params.videoUrl,
          },
        }
      );

      if (!uploadResponse.data.successful && !uploadResponse.data.successfull) {
        throw new Error(uploadResponse.data.error || 'Failed to upload video to TikTok');
      }

      // Step 2: Publish video
      const publishResponse = await this.client.post<ComposioApiResponse>(
        '/v2/actions/TIKTOK_PUBLISH_VIDEO/execute',
        {
          connectedAccountId,
          input: {
            post_info: {
              title: params.caption || 'Posted via VlowGen',
              privacy_level: 'PUBLIC_TO_EVERYONE',
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
              video_cover_timestamp_ms: 1000,
            },
          },
        }
      );

      if (!publishResponse.data.successful && !publishResponse.data.successfull) {
        throw new Error(publishResponse.data.error || 'Failed to publish video to TikTok');
      }

      return {
        postUrl: publishResponse.data.data?.share_url,
        postId: publishResponse.data.data?.publish_id,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('Composio API request timeout after 60 seconds');
        }

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          throw new Error(
            `Composio API error (${status}): ${data?.error || data?.message || axiosError.message}`
          );
        }

        throw new Error(`Composio API network error: ${axiosError.message}`);
      }

      throw error;
    }
  }

  /**
   * Download video from URL to temporary file
   * 
   * @param videoUrl - URL of the video to download
   * @returns Promise resolving to local file path
   */
  private async downloadVideo(videoUrl: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `video-${Date.now()}.mp4`;
    const filePath = path.join(tempDir, fileName);


    try {
      const response = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        timeout: 120000, // 2 minutes timeout for download
      });

      await streamPipeline(response.data, fs.createWriteStream(filePath));

      return filePath;
    } catch (error) {
      // Clean up partial file if download failed
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error(`Failed to download video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete temporary file
   * 
   * @param filePath - Path to file to delete
   */
  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('[Composio] Failed to delete temporary file:', error);
    }
  }

  /**
   * Calculate MD5 hash of a file
   * 
   * @param filePath - Path to file
   * @returns Promise resolving to MD5 hash string
   */
  private async calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Request presigned URL for file upload to Composio S3
   * 
   * @param filename - Name of the file
   * @param mimetype - MIME type of the file
   * @param md5Hash - MD5 hash of the file
   * @param toolkitSlug - Toolkit slug (e.g., 'youtube')
   * @param toolSlug - Tool slug (e.g., 'YOUTUBE_UPLOAD_VIDEO')
   * @returns Promise resolving to s3key and presigned URL
   */
  private async requestPresignedUrl(
    filename: string,
    mimetype: string,
    md5Hash: string,
    toolkitSlug: string,
    toolSlug: string
  ): Promise<{ s3key: string; presignedUrl: string }> {
    try {
      
      const response = await this.client.post<any>(
        '/v3/files/upload/request',
        {
          toolkit_slug: toolkitSlug,
          tool_slug: toolSlug,
          filename: filename,
          mimetype: mimetype,
          md5: md5Hash,
        }
      );

      if (!response.data || !response.data.key || !response.data.new_presigned_url) {
        console.error('[Composio] Presigned URL response:', JSON.stringify(response.data, null, 2));
        throw new Error('Failed to get presigned URL from Composio');
      }

      
      return {
        s3key: response.data.key,
        presignedUrl: response.data.new_presigned_url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;
          console.error('[Composio] Presigned URL error response:', JSON.stringify(data, null, 2));
          throw new Error(
            `Composio presigned URL request error (${status}): ${JSON.stringify(data?.error || data?.message || data)}`
          );
        }
      }
      throw error;
    }
  }

  /**
   * Upload file to presigned URL
   * 
   * @param filePath - Local file path to upload
   * @param presignedUrl - Presigned URL from Composio
   * @param mimetype - MIME type of the file
   */
  private async uploadToPresignedUrl(
    filePath: string,
    presignedUrl: string,
    mimetype: string
  ): Promise<void> {
    try {
      
      const fileBuffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);
      

      // Upload directly to S3 presigned URL using PUT
      const response = await axios.put(presignedUrl, fileBuffer, {
        headers: {
          'Content-Type': mimetype,
          'Content-Length': stats.size,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('[Composio] Upload to presigned URL failed');
        console.error('[Composio] Status:', axiosError.response?.status);
        console.error('[Composio] Response:', axiosError.response?.data);
        throw new Error(
          `Failed to upload file to presigned URL (${axiosError.response?.status}): ${axiosError.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Prepare YouTube upload metadata (manual upload flow)
   * Since Composio YouTube API has limitations, we provide a manual upload helper
   *
   * @param params - Upload parameters including video URL, title, and description
   * @returns Promise resolving to manual upload instructions
   */
  async uploadToYouTube(params: UploadToYouTubeParams): Promise<UploadToYouTubeResponse> {
    try {

      // Return manual upload instructions with metadata
      const instructions = {
        videoUrl: params.videoUrl,
        uploadUrl: 'https://studio.youtube.com/channel/UC/videos/upload',
        metadata: {
          title: params.title,
          description: params.description || '',
          tags: ['VlowGen', 'AI Generated'],
          category: 'People & Blogs',
          privacy: 'Public',
        },
        instructions: [
          '1. Download the video from the provided URL',
          '2. Go to YouTube Studio upload page',
          '3. Upload the video file',
          '4. Copy the title, description, and tags provided below',
          '5. Set category to "People & Blogs" and privacy to "Public"',
          '6. Click "Publish" when ready',
        ],
      };


      return {
        videoUrl: undefined,
        videoId: undefined,
        manualUpload: true,
        instructions: JSON.stringify(instructions, null, 2),
      };
    } catch (error) {
      throw new Error(`Failed to prepare YouTube upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
