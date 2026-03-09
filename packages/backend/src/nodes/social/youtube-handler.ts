import { YouTubeNodeData, ExecutionContext } from '@vlowgen/shared';
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
    videoUrl: string,
    context?: ExecutionContext
  ): Promise<string> {
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    // Validate video URL
    if (!videoUrl || videoUrl.trim() === '') {
      throw new Error('YouTube requires a valid video URL. Please ensure the video generation node is connected.');
    }

    // Get user ID from context for per-user account lookup
    const userId = context?.credentials?.userId;

    if (!userId) {
      throw new Error('User ID not provided in execution context. Cannot fetch YouTube connected account.');
    }

    let connectedAccountId: string | null = null;

    try {
      console.log(`[YouTube Handler] Fetching connected account for user: ${userId}`);

      // List connected accounts for this user
      const connectedAccounts = await this.composioClient.getConnectedAccounts({
        userId,
        app: 'youtube',
        statuses: ['ACTIVE'],
      });

      console.log(`[YouTube Handler] Found ${connectedAccounts.length} connected account(s)`);

      if (connectedAccounts && connectedAccounts.length > 0) {
        const youtubeAccount = connectedAccounts.find(
          (acc: any) => acc.appName === 'youtube' && acc.status === 'ACTIVE'
        );

        if (youtubeAccount) {
          connectedAccountId = youtubeAccount.id;
          console.log(`[YouTube Handler] Found connected account: ${connectedAccountId}`);
        }
      }
    } catch (error) {
      console.error('[YouTube Handler] Failed to fetch connected accounts:', error);
    }

    if (!connectedAccountId) {
      throw new Error('No YouTube connected account found. Please connect your YouTube account via the Connect YouTube button in the UI.');
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
  }
}
