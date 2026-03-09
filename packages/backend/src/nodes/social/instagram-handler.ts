import { InstagramNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class InstagramNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'Instagram';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    return 'any'; // Instagram supports both images and videos (reels)
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

    // Check if we have video or image
    const hasVideo = videoUrl && videoUrl.trim() !== '';
    const hasImage = imageUrl && imageUrl.trim() !== '';

    if (!hasVideo && !hasImage) {
      throw new Error(
        'Instagram requires either an image or video URL. Please ensure the media generation node is connected.'
      );
    }

    // Get connected Instagram account ID
    // Fetch from Composio API using user ID
    const userId = context?.credentials?.userId;
    
    if (!userId) {
      throw new Error('User ID not provided in execution context. Cannot fetch Instagram connected account.');
    }

    let connectedAccountId: string | null = null;

    try {
      console.log(`[Instagram Handler] Fetching connected account for user: ${userId}`);
      
      // List connected accounts for this user
      const connectedAccounts = await this.composioClient.getConnectedAccounts({
        userId,
        app: 'instagram',
        statuses: ['ACTIVE'],
      });

      console.log(`[Instagram Handler] Found ${connectedAccounts.length} connected account(s)`);

      if (connectedAccounts && connectedAccounts.length > 0) {
        // Find active Instagram connection
        const instagramAccount = connectedAccounts.find(
          (acc: any) => acc.appName === 'instagram' && acc.status === 'ACTIVE'
        );

        if (instagramAccount) {
          connectedAccountId = instagramAccount.id;
          console.log(`[Instagram Handler] Found connected account: ${connectedAccountId}`);
        }
      }
    } catch (error) {
      console.error('[Instagram Handler] Failed to fetch connected accounts:', error);
    }

    if (!connectedAccountId) {
      throw new Error('No Instagram connected account found. Please connect your Instagram account via the Connect Instagram button in the UI.');
    }

    try {
      // Post video (reel) if available, otherwise post image
      if (hasVideo) {
        console.log('[Instagram Handler] Posting video (reel) to Instagram');
        
        // Validate video URL format
        try {
          new URL(videoUrl);
        } catch (error) {
          throw new Error(
            `Invalid video URL format: "${videoUrl}". ` +
            `Please check that the video generation node output is correct.`
          );
        }

        const result = await this.composioClient.postVideoToInstagram({
          videoUrl,
          caption: text || 'Posted via VlowGen',
          connectedAccountId,
        });

        return result.postUrl || 'Posted video successfully to Instagram';
      } else {
        console.log('[Instagram Handler] Posting image to Instagram');
        
        // Validate image URL format
        try {
          new URL(imageUrl);
        } catch (error) {
          throw new Error(
            `Invalid image URL format: "${imageUrl}". ` +
            `Please check that the image generation node output is correct.`
          );
        }

        const result = await this.composioClient.postToInstagram({
          imageUrl,
          caption: text || 'Posted via VlowGen',
          connectedAccountId,
        });

        return result.postUrl || 'Posted successfully to Instagram';
      }
    } catch (composioError: any) {
      console.error('[Instagram Handler] Composio API error:', composioError?.response?.data || composioError?.message);
      
      // Check for 401 Unauthorized specifically
      if (composioError?.response?.status === 401) {
        throw new Error('Instagram connection expired. Please reconnect your Instagram account in Composio dashboard. Go to app.composio.dev and reconnect Instagram, then update INSTAGRAM_CONNECTED_ACCOUNT_ID in your .env file.');
      }
      
      const errorMessage = composioError instanceof Error ? composioError.message : String(composioError);
      const mediaType = hasVideo ? 'video' : 'image';
      throw new Error(
        `Failed to post ${mediaType} to Instagram: ${errorMessage}\n` +
        `Please verify:\n` +
        `1. The ${mediaType} URL is publicly accessible\n` +
        `2. The ${mediaType} meets Instagram requirements\n` +
        `3. Your Instagram account is properly connected`
      );
    }
  }
}
