import { YouTubeNodeData } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';

export class YouTubeNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'YouTube';
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

    const result = await this.composioClient.uploadToYouTube({
      videoUrl,
      title: 'VlowGen Video',
      description: text || 'Uploaded via VlowGen',
    });

    return result.videoUrl || 'Uploaded successfully to YouTube';
  }
}
