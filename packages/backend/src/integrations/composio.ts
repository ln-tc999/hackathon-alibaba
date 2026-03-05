/**
 * Composio Service Client for Social Media integrations
 *
 * This client handles social media posting through the Composio integration platform
 * using API v2 with proper action names.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface PostToTwitterParams {
  connectedAccountId?: string;
  text?: string;
  imageUrl?: string;
  token: string;
}

export interface PostToInstagramParams {
  imageUrl: string;
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
   * Get first connected account ID for a platform
   */
  async getConnectedAccountId(appName: string): Promise<string> {
    try {
      const response = await this.client.get('/v1/connectedAccounts', {
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
   * Set default connected account ID for all requests
   */
  setDefaultConnectedAccountId(accountId: string) {
    this.defaultConnectedAccountId = accountId;
  }

  /**
   * Upload media to Twitter and get media ID
   *
   * @param imageUrl - URL of the image to upload
   * @returns Promise resolving to media ID
   * @throws Error if upload fails
   */
  async uploadMediaToTwitter(imageUrl: string): Promise<string> {
    try {
      const response = await this.client.post<ComposioApiResponse>(
        '/v2/actions/TWITTER_MEDIA_UPLOAD_MEDIA/execute',
        {
          connectedAccountId: this.defaultConnectedAccountId,
          input: {
            media_url: imageUrl,
          },
        }
      );

      if (!response.data.successful && !response.data.successfull) {
        throw new Error(response.data.error || 'Failed to upload media to Twitter');
      }

      const mediaId = response.data.data?.media_id_string || response.data.data?.media_id;
      if (!mediaId) {
        throw new Error('Failed to get media ID from Twitter upload response');
      }

      console.log('[Composio] Media uploaded successfully, media ID:', mediaId);
      return mediaId;
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
   * Post content to Twitter via Composio API v2
   *
   * @param params - Post parameters including text, image URL, and user token
   * @returns Promise resolving to tweet URL and ID
   * @throws Error if API request fails or returns an error
   */
  async postToTwitter(params: PostToTwitterParams): Promise<PostToTwitterResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      const input: any = {};

      if (params.text) {
        input.text = params.text;
      }

      // If image URL is provided, upload it first and get media ID
      if (params.imageUrl) {
        console.log('[Composio] Uploading image to Twitter:', params.imageUrl);
        const mediaId = await this.uploadMediaToTwitter(params.imageUrl);

        // Add media ID to attachments
        input.attachments = [
          {
            media_id: mediaId,
          },
        ];
        console.log('[Composio] Image uploaded, media ID:', mediaId);
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

      const tweetId = response.data.data?.id;
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
      console.log('[Composio] Waiting 3 seconds for Instagram to process media...');
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

      console.log('[Composio] Post published successfully');

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
      console.log(`[Composio] Checking media status (attempt ${attempt}/${maxAttempts})...`);

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
        console.log(`[Composio] Media status: ${status}`);

        // Status codes:
        // - "FINISHED" or "PUBLISHED": Media is ready
        // - "IN_PROGRESS": Still processing
        // - "ERROR": Processing failed
        if (status === 'FINISHED' || status === 'PUBLISHED') {
          console.log('[Composio] Media is ready for publishing');
          return;
        }

        if (status === 'ERROR') {
          const errorMessage = statusResponse.data.data?.error_message || 'Unknown error';
          throw new Error(`Media processing failed on Instagram: ${errorMessage}`);
        }

        // Wait before next attempt (exponential backoff for first few attempts)
        if (attempt < maxAttempts) {
          const waitTime = attempt <= 3 ? delayMs : delayMs * 1.5;
          console.log(`[Composio] Media not ready yet, waiting ${waitTime}ms...`);
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
   * Upload video to YouTube via Composio API v2
   *
   * @param params - Upload parameters including video URL, title, and description
   * @returns Promise resolving to video URL and ID
   * @throws Error if API request fails or returns an error
   */
  async uploadToYouTube(params: UploadToYouTubeParams): Promise<UploadToYouTubeResponse> {
    try {
      const connectedAccountId = params.connectedAccountId || this.defaultConnectedAccountId;

      const response = await this.client.post<ComposioApiResponse>(
        '/v2/actions/YOUTUBE_UPLOAD_VIDEO/execute',
        {
          connectedAccountId,
          input: {
            video_url: params.videoUrl,
            title: params.title,
            description: params.description || '',
            privacy_status: 'public',
            category_id: '22', // People & Blogs
          },
        }
      );

      if (!response.data.successful && !response.data.successfull) {
        throw new Error(response.data.error || 'Failed to upload video to YouTube');
      }

      const videoId = response.data.data?.id;
      const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined;

      return {
        videoUrl,
        videoId,
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
}
