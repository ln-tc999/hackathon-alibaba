import { TwitterNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class TwitterNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'Twitter';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    return 'any';
  }

  protected async postToSocialMedia(
    text: string,
    imageUrl: string,
    _videoUrl: string
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    const result = await this.composioClient.postToTwitter({
      text: text || undefined,
      imageUrl: imageUrl || undefined,
      token: '',
    });

    return result.tweetUrl || 'Posted successfully to Twitter';
  }
}
