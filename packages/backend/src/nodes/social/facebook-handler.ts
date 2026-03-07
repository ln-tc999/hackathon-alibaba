import { FacebookNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class FacebookNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'Facebook';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    return 'any';
  }

  protected async postToSocialMedia(
    text: string,
    imageUrl: string,
    videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    try {
      // Get connected Facebook account ID
      let connectedAccountId = process.env.FACEBOOK_CONNECTED_ACCOUNT_ID;
      
      if (!connectedAccountId) {
        console.log('[Facebook Handler] No connected account ID in env, fetching from Composio...');
        connectedAccountId = await this.composioClient.getConnectedAccountId('FACEBOOK');
      }

      if (!connectedAccountId) {
        throw new Error('No Facebook connected account found. Please connect your Facebook account in Composio first.');
      }

      this.composioClient.setDefaultConnectedAccountId(connectedAccountId);

      const result = await this.composioClient.postToFacebook({
        text: text || 'Posted via VlowGen',
        mediaUrl: imageUrl || videoUrl || undefined,
        connectedAccountId,
      });

      return result.postUrl || 'Posted successfully to Facebook';
    } catch (composioError: any) {
      console.error('[Facebook Handler] Composio API error:', composioError?.response?.data || composioError?.message);
      
      // Check for 401 Unauthorized specifically
      if (composioError?.response?.status === 401) {
        throw new Error('Facebook connection expired. Please reconnect your Facebook account in Composio dashboard. Go to app.composio.dev and reconnect Facebook, then update FACEBOOK_CONNECTED_ACCOUNT_ID in your .env file.');
      }
      
      throw composioError;
    }
  }
}
