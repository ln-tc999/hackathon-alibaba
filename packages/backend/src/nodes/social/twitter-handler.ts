import { TwitterNodeData } from '@vlowgen/shared';
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
    videoUrl: string
  ): Promise<string> {
    console.log('[Twitter Handler] postToSocialMedia called with:', { text: text?.substring(0, 50), imageUrl: imageUrl?.substring(0, 50), videoUrl: videoUrl?.substring(0, 50) });
    
    // Check if we have Twitter OAuth 1.0a credentials for direct API
    const hasDirectCredentials = 
      process.env.TWITTER_CONSUMER_KEY &&
      process.env.TWITTER_CONSUMER_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_TOKEN_SECRET;

    console.log('[Twitter Handler] Direct credentials check:', {
      hasConsumerKey: !!process.env.TWITTER_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.TWITTER_CONSUMER_SECRET,
      hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
      hasAccessTokenSecret: !!process.env.TWITTER_ACCESS_TOKEN_SECRET,
      hasDirectCredentials,
    });

    const hasVideo = videoUrl && videoUrl.trim() !== '';
    const hasImage = imageUrl && imageUrl.trim() !== '';
    const hasMedia = hasVideo || hasImage;

    console.log('[Twitter Handler] Media check:', { hasVideo, hasImage, hasMedia });

    // Use direct Twitter API if credentials are available AND we have media
    if (hasDirectCredentials && hasMedia) {
      console.log('[Twitter Handler] Using direct Twitter API with OAuth 1.0a');
      
      try {
        const twitterClient = new TwitterDirectClient({
          consumerKey: process.env.TWITTER_CONSUMER_KEY!,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
          accessToken: process.env.TWITTER_ACCESS_TOKEN!,
          accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
        });

        // Download media and upload to Twitter
        const mediaUrl = hasVideo ? videoUrl : imageUrl;
        console.log('[Twitter Handler] Downloading media from:', mediaUrl);
        
        const filePath = await twitterClient.downloadMedia(mediaUrl);
        
        try {
          console.log('[Twitter Handler] Uploading media to Twitter...');
          const mediaId = await twitterClient.uploadMedia(filePath);
          
          console.log('[Twitter Handler] Creating tweet with media...');
          const result = await twitterClient.createTweet(
            text || 'Posted via VlowGen',
            [mediaId]
          );

          const tweetUrl = `https://twitter.com/i/web/status/${result.data.id}`;
          console.log('[Twitter Handler] Tweet posted successfully:', tweetUrl);
          
          return tweetUrl;
        } finally {
          // Clean up downloaded file
          twitterClient.deleteFile(filePath);
        }
      } catch (error) {
        console.error('[Twitter Handler] Direct API failed, falling back to Composio:', error);
        // Fall through to Composio fallback
      }
    }

    // Fallback to Composio API (works for text-only or if direct API fails)
    console.log('[Twitter Handler] Using Composio API');
    
    if (!this.composioClient) {
      throw new Error('Composio client not initialized');
    }

    // Get connected Twitter account ID from environment or fetch
    const connectedAccountId = process.env.TWITTER_CONNECTED_ACCOUNT_ID || 
      await this.composioClient.getConnectedAccountId('TWITTER');
    
    this.composioClient.setDefaultConnectedAccountId(connectedAccountId);

    console.log('[Twitter Handler] Using connected account:', connectedAccountId);

    if (hasVideo) {
      console.log('[Twitter Handler] Posting video to Twitter via Composio');
      
      const result = await this.composioClient.postVideoToTwitter({
        connectedAccountId,
        text: text || undefined,
        videoUrl: videoUrl,
        token: '',
      });

      return result.tweetUrl || 'Posted video successfully to Twitter';
    } else if (hasImage) {
      console.log('[Twitter Handler] Posting image to Twitter via Composio');
      
      const result = await this.composioClient.postToTwitter({
        connectedAccountId,
        text: text || undefined,
        imageUrl: imageUrl,
        token: '',
      });

      return result.tweetUrl || 'Posted successfully to Twitter';
    } else {
      // Post text-only tweet
      console.log('[Twitter Handler] Posting text-only tweet via Composio');
      
      const result = await this.composioClient.postToTwitter({
        connectedAccountId,
        text: text || 'Posted via VlowGen',
        token: '',
      });

      return result.tweetUrl || 'Posted successfully to Twitter';
    }
  }
}
