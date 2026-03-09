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

    // Log context for debugging
    console.log('[Facebook Handler] Received context:', {
      hasContext: !!context,
      hasCredentials: !!context?.credentials,
      credentialsUserId: context?.credentials?.userId,
    });

    // Get user ID from context for per-user account lookup
    const userId = context?.credentials?.userId;

    if (!userId) {
      console.error('[Facebook Handler] ERROR: userId is undefined or null!');
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
        // Find active Facebook connection
        const facebookAccount = connectedAccounts.find(
          (acc: any) => acc.toolkit?.slug === 'facebook' && acc.status === 'ACTIVE'
        );

        if (facebookAccount) {
          // Use UUID from deprecated field for v2 API (not ca_XXX format)
          connectedAccountId = facebookAccount.deprecated?.uuid || facebookAccount.uuid || facebookAccount.id;
          console.log(`[Facebook Handler] Found connected account: ${connectedAccountId}`);
          console.log(`[Facebook Handler] Account details:`, {
            id: facebookAccount.id,
            uuid: facebookAccount.uuid,
            deprecated: facebookAccount.deprecated?.uuid,
            usingId: connectedAccountId,
          });
        } else {
          console.error('[Facebook Handler] No ACTIVE Facebook account found!');
          console.error('[Facebook Handler] Available accounts:', connectedAccounts.map((acc: any) => ({
            id: acc.id,
            toolkit: acc.toolkit?.slug,
            status: acc.status,
          })));
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
