import { TikTokNodeData, ExecutionContext } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class TikTokNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'TikTok';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    return 'video';
  }

  protected async postToSocialMedia(
    text: string,
    _imageUrl: string,
    videoUrl: string,
    context?: ExecutionContext
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    try {
      // Validate video URL
      if (!videoUrl || videoUrl.trim() === '') {
        throw new Error('TikTok requires a valid video URL. Please ensure the video generation node is connected.');
      }

      // Get connected TikTok account ID from context (per-user)
      // Priority: 1. Context credentials, 2. User-specific env, 3. Fallback (deprecated)
      let connectedAccountId = context?.credentials?.tiktokConnectedAccountId;

      if (!connectedAccountId) {
        // Try to get from user-specific environment variable
        const userId = context?.credentials?.userId;
        if (userId) {
          connectedAccountId = process.env[`TIKTOK_CONNECTED_ACCOUNT_ID_${userId.toUpperCase()}`];
        }
      }

      if (!connectedAccountId) {
        // Fallback to shared env (deprecated - will be removed)
        connectedAccountId = process.env.TIKTOK_CONNECTED_ACCOUNT_ID;
        console.warn('[TikTok Handler] Using shared connected account ID. This is deprecated!');
      }

      if (!connectedAccountId) {
        throw new Error('No TikTok connected account found. Please connect your TikTok account via the Connect TikTok button in the UI.');
      }

      const result = await this.composioClient.postToTikTok({
        videoUrl,
        caption: text || 'Posted via VlowGen',
        connectedAccountId,
      });

      return result.postUrl || 'Posted successfully to TikTok';
    } catch (composioError: any) {
      console.error('[TikTok Handler] Composio API error:', composioError?.response?.data || composioError?.message);
      
      // Check for 401 Unauthorized specifically
      if (composioError?.response?.status === 401) {
        throw new Error('TikTok connection expired. Please reconnect your TikTok account in Composio dashboard. Go to app.composio.dev and reconnect TikTok, then update TIKTOK_CONNECTED_ACCOUNT_ID in your .env file.');
      }
      
      throw composioError;
    }
  }
}
