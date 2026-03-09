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

    // Log context for debugging
    console.log('[YouTube Handler] Received context:', {
      hasContext: !!context,
      hasCredentials: !!context?.credentials,
      credentialsUserId: context?.credentials?.userId,
    });

    // Get user ID from context for per-user account lookup
    const userId = context?.credentials?.userId;

    if (!userId) {
      console.error('[YouTube Handler] ERROR: userId is undefined or null!');
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
        // Find active YouTube connection
        const youtubeAccount = connectedAccounts.find(
          (acc: any) => acc.toolkit?.slug === 'youtube' && acc.status === 'ACTIVE'
        );

        if (youtubeAccount) {
          // Use UUID from deprecated field for v2 API (not ca_XXX format)
          connectedAccountId = youtubeAccount.deprecated?.uuid || youtubeAccount.uuid || youtubeAccount.id;
          console.log(`[YouTube Handler] Found connected account: ${connectedAccountId}`);
          console.log(`[YouTube Handler] Account details:`, {
            id: youtubeAccount.id,
            uuid: youtubeAccount.uuid,
            deprecated: youtubeAccount.deprecated?.uuid,
            usingId: connectedAccountId,
          });
        } else {
          console.error('[YouTube Handler] No ACTIVE YouTube account found!');
          console.error('[YouTube Handler] Available accounts:', connectedAccounts.map((acc: any) => ({
            id: acc.id,
            toolkit: acc.toolkit?.slug,
            status: acc.status,
          })));
        }
      }
    } catch (error) {
      console.error('[YouTube Handler] Failed to fetch connected accounts:', error);
    }

    if (!connectedAccountId) {
      throw new Error('No YouTube connected account found. Please connect your YouTube account via the Connect YouTube button in the UI.');
    }

    try {
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

      // Provide helpful error message with fallback option
      let errorMessage = 'Failed to upload video to YouTube. ';
      
      if (composioError?.response?.status === 401) {
        errorMessage += 'YouTube connection expired. Please reconnect your YouTube account in Composio dashboard.';
      } else if (composioError?.response?.status === 400) {
        errorMessage += 'Invalid video format or size. Please ensure the video meets YouTube requirements.';
      } else {
        errorMessage += 'Please try again or upload manually to YouTube.';
      }

      throw new Error(errorMessage);
    }
  }
}
