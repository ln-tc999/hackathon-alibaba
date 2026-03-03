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

    // Get connected Twitter account ID
    const connectedAccountId = await this.composioClient.getConnectedAccountId('TWITTER');
    this.composioClient.setDefaultConnectedAccountId(connectedAccountId);

    const result = await this.composioClient.postToTwitter({
      connectedAccountId,
      text: text || undefined,
      imageUrl: imageUrl || undefined,
      token: '',
    });

    return result.tweetUrl || 'Posted successfully to Twitter';
  }
}
