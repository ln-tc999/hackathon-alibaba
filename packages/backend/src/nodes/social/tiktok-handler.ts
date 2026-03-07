import { TikTokNodeData } from '@vlowgen/shared';
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
    videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    try {
      // Validate video URL
      if (!videoUrl || videoUrl.trim() === '') {
        throw new Error('TikTok requires a valid video URL. Please ensure the video generation node is connected.');
      }

      // Get connected TikTok account ID
      let connectedAccountId = process.env.TIKTOK_CONNECTED_ACCOUNT_ID;
      
      if (!connectedAccountId) {
        console.log('[TikTok Handler] No connected account ID in env, fetching from Composio...');
        connectedAccountId = await this.composioClient.getConnectedAccountId('TIKTOK');
      }

      if (!connectedAccountId) {
        throw new Error('No TikTok connected account found. Please connect your TikTok account in Composio first.');
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
