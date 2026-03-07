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

    try {
      // Validate video URL
      if (!videoUrl || videoUrl.trim() === '') {
        throw new Error(
          'YouTube requires a valid video URL. Please ensure the video generation node is connected.'
        );
      }

      // Use connected account ID from environment or get first connected account
      let connectedAccountId = process.env.YOUTUBE_CONNECTED_ACCOUNT_ID;
      
      if (!connectedAccountId) {
        console.log('[YouTube Handler] No connected account ID in env, fetching from Composio...');
        connectedAccountId = await this.composioClient.getConnectedAccountId('YOUTUBE');
      }

      if (!connectedAccountId) {
        throw new Error('No YouTube connected account found. Please connect your YouTube account in Composio first.');
      }

      console.log('[YouTube Handler] Using connected account:', connectedAccountId);
      console.log('[YouTube Handler] Video URL:', videoUrl);

      const result = await this.composioClient.uploadToYouTube({
        videoUrl,
        title: text || 'VlowGen Video',
        description: text || 'Uploaded via VlowGen',
        connectedAccountId,
      });

      console.log('[YouTube Handler] Upload result:', result);

      // Check if manual upload is required
      if (result.manualUpload && result.instructions) {
        return result.instructions;
      }

      return result.videoUrl || 'Uploaded successfully to YouTube';
    } catch (composioError: any) {
      console.error('[YouTube Handler] Composio API error:', composioError?.response?.data || composioError?.message);
      
      // Check for 401 Unauthorized specifically
      if (composioError?.response?.status === 401) {
        throw new Error('YouTube connection expired. Please reconnect your YouTube account in Composio dashboard. Go to app.composio.dev and reconnect YouTube, then update YOUTUBE_CONNECTED_ACCOUNT_ID in your .env file.');
      }
      
      throw composioError;
    }
  }
}
