import { FacebookNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from './base-social-handler';

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
    videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    const result = await this.composioClient.postToFacebook({
      text: text || 'Posted via VlowGen',
      mediaUrl: imageUrl || videoUrl || undefined,
    });

    return result.postUrl || 'Posted successfully to Facebook';
  }
}
