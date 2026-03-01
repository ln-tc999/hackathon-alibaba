import { TikTokNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from './base-social-handler';

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
    videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    const result = await this.composioClient.postToTikTok({
      videoUrl,
      caption: text || 'Posted via VlowGen',
    });

    return result.postUrl || 'Posted successfully to TikTok';
  }
}
