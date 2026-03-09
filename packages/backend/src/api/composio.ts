/**
 * Composio OAuth Routes
 * Handle social media account connections via Composio
 * 
 * IMPORTANT: Each user has their own connected accounts
 * Never share connected accounts between users!
 */

import { Router, Request, Response } from 'express';
import { ComposioClient } from '../integrations/composio';
import { ErrorResponse } from '@vlowgen/shared';

const router = Router();

// In-memory store for user connected accounts (temporary - should use database in production)
// Key: userId, Value: Map<platform, connectedAccountId>
const userConnectedAccounts = new Map<string, Map<string, string>>();

/**
 * Get or create user's connected account map
 */
function getUserAccountMap(userId: string): Map<string, string> {
  if (!userConnectedAccounts.has(userId)) {
    userConnectedAccounts.set(userId, new Map<string, string>());
  }
  return userConnectedAccounts.get(userId)!;
}

/**
 * POST /api/composio/connect
 * Get OAuth URL for connecting social media accounts
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { platform, userId } = req.body;

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Platform is required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'User ID is required for per-user account connection',
          retryable: false,
        },
      } as ErrorResponse);
    }

    // Get Composio API key from environment
    const composioApiKey = process.env.COMPOSIO_API_KEY;
    const composioApiUrl = process.env.COMPOSIO_API_URL || 'https://api.composio.dev';
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.vlowgen-hacks.my.id';

    if (!composioApiKey) {
      return res.status(500).json({
        error: {
          type: 'system',
          message: 'Composio API key not configured',
          retryable: false,
        },
      } as ErrorResponse);
    }

    // Create Composio client
    const composioClient = new ComposioClient(composioApiKey, composioApiUrl);

    // Get auth URL based on platform
    let authUrl: string;
    const platformUpper = platform.toUpperCase();

    // Check if user already has a connected account
    const userAccounts = getUserAccountMap(userId);
    const existingConnectedId = userAccounts.get(platformUpper);

    if (existingConnectedId) {
      // User already connected, return success
      return res.json({
        success: true,
        alreadyConnected: true,
        connectedAccountId: existingConnectedId,
        platform,
        message: `Your ${platform} account is already connected`,
      });
    }

    // Generate unique state with userId for callback
    const state = `vlowgen_${userId}_${platform}_${Date.now()}`;

    // Get OAuth URL from Composio
    switch (platformUpper) {
      case 'TWITTER':
        const twitterAuth = await composioClient.getTwitterAuthUrl();
        authUrl = `${twitterAuth.authUrl}${twitterAuth.authUrl.includes('?') ? '&' : '?'}state=${state}`;
        break;
      case 'INSTAGRAM':
        authUrl = `https://app.composio.dev/integrations/instagram?redirect_uri=${encodeURIComponent(frontendUrl)}&state=${state}`;
        break;
      case 'FACEBOOK':
        authUrl = `https://app.composio.dev/integrations/facebook?redirect_uri=${encodeURIComponent(frontendUrl)}&state=${state}`;
        break;
      case 'TIKTOK':
        authUrl = `https://app.composio.dev/integrations/tiktok?redirect_uri=${encodeURIComponent(frontendUrl)}&state=${state}`;
        break;
      case 'YOUTUBE':
        authUrl = `https://app.composio.dev/integrations/youtube?redirect_uri=${encodeURIComponent(frontendUrl)}&state=${state}`;
        break;
      default:
        return res.status(400).json({
          error: {
            type: 'user',
            message: `Unsupported platform: ${platform}`,
            retryable: false,
          },
        } as ErrorResponse);
    }

    res.json({
      success: true,
      authUrl,
      state,
      platform,
      message: `Please authorize your ${platform} account`,
    });
  } catch (error) {
    console.error('Composio connect error:', error);

    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to connect account',
        retryable: true,
      },
    } as ErrorResponse);
  }
});

/**
 * POST /api/composio/callback
 * Handle OAuth callback and store connected account for user
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { userId, platform, connectedAccountId, authCode } = req.body;

    if (!userId || !platform || !connectedAccountId) {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'userId, platform, and connectedAccountId are required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    // Store connected account for this specific user
    const userAccounts = getUserAccountMap(userId);
    userAccounts.set(platform.toUpperCase(), connectedAccountId);

    console.log(`[Composio] Connected ${platform} for user ${userId}: ${connectedAccountId}`);

    res.json({
      success: true,
      connectedAccountId,
      platform,
      message: `${platform} account connected successfully`,
    });
  } catch (error) {
    console.error('Composio callback error:', error);

    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to save connected account',
        retryable: true,
      },
    } as ErrorResponse);
  }
});

/**
 * GET /api/composio/connected
 * Check if user has connected account for a platform
 */
router.get('/connected', async (req: Request, res: Response) => {
  try {
    const { platform, userId } = req.query;

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Platform is required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'User ID is required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    // Get user's connected accounts
    const userAccounts = getUserAccountMap(userId);
    const connectedAccountId = userAccounts.get(platform.toUpperCase());

    res.json({
      success: true,
      connected: !!connectedAccountId,
      connectedAccountId,
      platform,
      userId, // Return userId to confirm it's per-user
    });
  } catch (error) {
    console.error('Composio connected check error:', error);

    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to check connection status',
        retryable: true,
      },
    } as ErrorResponse);
  }
});

/**
 * DELETE /api/composio/disconnect
 * Disconnect a platform account for a user
 */
router.delete('/disconnect', async (req: Request, res: Response) => {
  try {
    const { userId, platform } = req.body;

    if (!userId || !platform) {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'userId and platform are required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    const userAccounts = getUserAccountMap(userId);
    const deleted = userAccounts.delete(platform.toUpperCase());

    res.json({
      success: true,
      disconnected: deleted,
      platform,
      message: deleted ? `${platform} account disconnected` : `${platform} account was not connected`,
    });
  } catch (error) {
    console.error('Composio disconnect error:', error);

    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to disconnect account',
        retryable: true,
      },
    } as ErrorResponse);
  }
});

export default router;
