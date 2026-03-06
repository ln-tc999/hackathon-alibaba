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
    videoUrl: string
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
    const connectedAccountId = await this.composioClient.getConnectedAccountId('INSTAGRAM');

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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
