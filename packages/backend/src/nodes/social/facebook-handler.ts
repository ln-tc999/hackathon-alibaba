import { FacebookNodeData, ExecutionContext } from '@vlowgen/shared';
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

    // Get user ID from context for per-user account lookup
    const userId = context?.credentials?.userId;

    if (!userId) {
      throw new Error('User ID not provided in execution context. Cannot fetch Facebook connected account.');
    }

    let connectedAccountId: string | null = null;

    try {
      console.log(`[Facebook Handler] Fetching connected account for user: ${userId}`);

      // List connected accounts for this user
      const connectedAccounts = await this.composioClient.getConnectedAccounts({
        userId,
        app: 'facebook',
        statuses: ['ACTIVE'],
      });

      console.log(`[Facebook Handler] Found ${connectedAccounts.length} connected account(s)`);

      if (connectedAccounts && connectedAccounts.length > 0) {
        const facebookAccount = connectedAccounts.find(
          (acc: any) => acc.appName === 'facebook' && acc.status === 'ACTIVE'
        );

        if (facebookAccount) {
          connectedAccountId = facebookAccount.id;
          console.log(`[Facebook Handler] Found connected account: ${connectedAccountId}`);
        }
      }
    } catch (error) {
      console.error('[Facebook Handler] Failed to fetch connected accounts:', error);
    }

    if (!connectedAccountId) {
      throw new Error('No Facebook connected account found. Please connect your Facebook account via the Connect Facebook button in the UI.');
    }

    try {
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
        throw new Error('Facebook connection expired. Please reconnect your Facebook account in Composio dashboard.');
      }

      throw composioError;
    }
  }
}
