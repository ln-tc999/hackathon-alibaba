import { TwitterNodeData, ExecutionContext } from '@vlowgen/shared';
import { BaseSocialMediaHandler } from '../base/social-handler';
import { TwitterDirectClient } from '../../integrations/twitter-direct';

export class TwitterNodeHandler extends BaseSocialMediaHandler {
  get platformName(): string {
    return 'Twitter';
  }

  get requiresMedia(): 'image' | 'video' | 'any' | 'none' {
    // Twitter supports text-only, images, and videos
    return 'any';
  }

  protected async postToSocialMedia(
    text: string,
    imageUrl: string,
    videoUrl: string,
    context?: ExecutionContext
  ): Promise<string> {
    // Check if we have Twitter OAuth 1.0a credentials for direct API
    const hasDirectCredentials =
      process.env.TWITTER_CONSUMER_KEY &&
      process.env.TWITTER_CONSUMER_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET;

    if (!hasDirectCredentials) {
      throw new Error(
        'Twitter Direct API credentials not configured. Please add TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_TOKEN_SECRET to your .env file. ' +
        'Note: Composio is no longer supported for Twitter media uploads. Use Twitter Developer API directly.'
      );
    }

    const hasVideo = videoUrl && videoUrl.trim() !== '';
    const hasImage = imageUrl && imageUrl.trim() !== '';
    const hasMedia = hasVideo || hasImage;

    // Use Direct Twitter API (Composio does NOT support media uploads)
    try {
      const twitterClient = new TwitterDirectClient({
        consumerKey: process.env.TWITTER_CONSUMER_KEY!,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
      });

      // If has media, download and upload
      if (hasMedia) {
        const mediaUrl = hasVideo ? videoUrl : imageUrl;
        const filePath = await twitterClient.downloadMedia(mediaUrl);

        try {
          const mediaId = await twitterClient.uploadMedia(filePath);
          const result = await twitterClient.createTweet(
            text || 'Posted via VlowGen',
            [mediaId]
          );

          return `https://twitter.com/i/web/status/${result.data.id}`;
        } finally {
          // Clean up downloaded file
          twitterClient.deleteFile(filePath);
        }
      } else {
        // Text-only tweet
        const result = await twitterClient.createTweet(
          text || 'Posted via VlowGen',
          []
        );

        return `https://twitter.com/i/web/status/${result.data.id}`;
      }
    } catch (error) {
      throw new Error(
        `Failed to post to Twitter: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Please check your Twitter API credentials and try again.'
      );
    }
  }
}
