import { InstagramNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class InstagramNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'Instagram';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    return 'image';
  }

  protected async postToSocialMedia(
    text: string,
    imageUrl: string,
    _videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    // Validate image URL
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error(
        'Instagram requires a valid image URL. Please ensure the image generation node is connected.'
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (error) {
      throw new Error(
        `Invalid image URL format: "${imageUrl}". ` +
        `Please check that the image generation node output is correct.`
      );
    }

    // Get connected Instagram account ID
    const connectedAccountId = await this.composioClient.getConnectedAccountId('INSTAGRAM');

    try {
      const result = await this.composioClient.postToInstagram({
        imageUrl,
        caption: text || 'Posted via VlowGen',
        connectedAccountId,
      });

      return result.postUrl || 'Posted successfully to Instagram';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to post to Instagram: ${errorMessage}\n` +
        `Please verify:\n` +
        `1. The image URL is publicly accessible\n` +
        `2. The image meets Instagram requirements (JPEG/PNG, max 8MB)\n` +
        `3. Your Instagram account is properly connected`
      );
    }
  }
}
