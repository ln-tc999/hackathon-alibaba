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

    console.log('[InstagramHandler] Posting to Instagram with imageUrl:', imageUrl);

    // Validate image URL
    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error(
        'Instagram requires a valid image URL. Please ensure:\n' +
        '1. The Wan2 node is connected to this Instagram node\n' +
        '2. The Wan2 node successfully generated an image\n' +
        '3. The workflow execution order is correct (Wan2 → Instagram)'
      );
    }

    // Validate URL format
    try {
      const url = new URL(imageUrl);
      console.log('[InstagramHandler] Valid URL format:', url.href);
      
      // Check if URL is accessible (basic check)
      if (!url.protocol.startsWith('http')) {
        throw new Error(`Invalid URL protocol: ${url.protocol}. Must be http or https.`);
      }
    } catch (error) {
      throw new Error(
        `Invalid image URL format: "${imageUrl}". ` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        `Please check that the Wan2 node output is correct.`
      );
    }

    console.log('[InstagramHandler] Getting connected Instagram account...');

    // Get connected Instagram account ID
    const connectedAccountId = await this.composioClient.getConnectedAccountId('INSTAGRAM');

    console.log('[InstagramHandler] Connected account ID:', connectedAccountId);
    console.log('[InstagramHandler] Calling Composio API with:', {
      imageUrl,
      caption: text || 'Posted via VlowGen',
      connectedAccountId
    });

    try {
      const result = await this.composioClient.postToInstagram({
        imageUrl,
        caption: text || 'Posted via VlowGen',
        connectedAccountId,
      });

      console.log('[InstagramHandler] Post successful:', result);

      return result.postUrl || 'Posted successfully to Instagram';
    } catch (error) {
      console.error('[InstagramHandler] Post failed:', error);
      
      // Enhance error message with debugging info
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to post to Instagram: ${errorMessage}\n` +
        `Image URL used: ${imageUrl}\n` +
        `Please verify:\n` +
        `1. The image URL is publicly accessible\n` +
        `2. The image meets Instagram requirements (JPEG/PNG, max 8MB)\n` +
        `3. Your Instagram account is properly connected`
      );
    }
  }
}
