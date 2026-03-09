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

    // Get user ID from context for per-user account lookup
    const userId = context?.credentials?.userId;

    if (!userId) {
      throw new Error('User ID not provided in execution context. Cannot fetch TikTok connected account.');
    }

    let connectedAccountId: string | null = null;

    try {
      console.log(`[TikTok Handler] Fetching connected account for user: ${userId}`);

      // List connected accounts for this user
      const connectedAccounts = await this.composioClient.getConnectedAccounts({
        userId,
        app: 'tiktok',
        statuses: ['ACTIVE'],
      });

      console.log(`[TikTok Handler] Found ${connectedAccounts.length} connected account(s)`);

      if (connectedAccounts && connectedAccounts.length > 0) {
        const tiktokAccount = connectedAccounts.find(
          (acc: any) => acc.appName === 'tiktok' && acc.status === 'ACTIVE'
        );

        if (tiktokAccount) {
          connectedAccountId = tiktokAccount.id;
          console.log(`[TikTok Handler] Found connected account: ${connectedAccountId}`);
        }
      }
    } catch (error) {
      console.error('[TikTok Handler] Failed to fetch connected accounts:', error);
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
