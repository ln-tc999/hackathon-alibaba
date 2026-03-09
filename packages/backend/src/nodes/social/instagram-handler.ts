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
    context?: any
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

    // Get connected Instagram account ID from context (per-user)
    // Priority: 1. Context credentials, 2. User-specific env, 3. Fallback (deprecated)
    let connectedAccountId = context?.credentials?.instagramConnectedAccountId;

    if (!connectedAccountId) {
      // Try to get from user-specific environment variable
      const userId = context?.credentials?.userId;
      if (userId) {
        connectedAccountId = process.env[`INSTAGRAM_CONNECTED_ACCOUNT_ID_${userId.toUpperCase()}`];
      }
    }

    if (!connectedAccountId) {
      // Fallback to shared env (deprecated - will be removed)
      connectedAccountId = process.env.INSTAGRAM_CONNECTED_ACCOUNT_ID;
      console.warn('[Instagram Handler] Using shared connected account ID. This is deprecated!');
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
