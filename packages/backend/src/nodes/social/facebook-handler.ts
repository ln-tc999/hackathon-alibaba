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
    videoUrl: string,
    context?: ExecutionContext
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    try {
      // Get connected Facebook account ID from context (per-user)
      // Priority: 1. Context credentials, 2. User-specific env, 3. Fallback (deprecated)
      let connectedAccountId = context?.credentials?.facebookConnectedAccountId;

      if (!connectedAccountId) {
        // Try to get from user-specific environment variable
        const userId = context?.credentials?.userId;
        if (userId) {
          connectedAccountId = process.env[`FACEBOOK_CONNECTED_ACCOUNT_ID_${userId.toUpperCase()}`];
        }
      }

      if (!connectedAccountId) {
        // Fallback to shared env (deprecated - will be removed)
        connectedAccountId = process.env.FACEBOOK_CONNECTED_ACCOUNT_ID;
        console.warn('[Facebook Handler] Using shared connected account ID. This is deprecated!');
      }

      if (!connectedAccountId) {
        throw new Error('No Facebook connected account found. Please connect your Facebook account via the Connect Facebook button in the UI.');
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
