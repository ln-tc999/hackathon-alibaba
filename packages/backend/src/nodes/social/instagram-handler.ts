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

    // Get connected Instagram account ID
    const connectedAccountId = await this.composioClient.getConnectedAccountId('INSTAGRAM');

    const result = await this.composioClient.postToInstagram({
      imageUrl,
      caption: text || 'Posted via VlowGen',
      connectedAccountId,
    });

    return result.postUrl || 'Posted successfully to Instagram';
  }
}
