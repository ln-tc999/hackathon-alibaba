/**
 * Composio OAuth Routes
 * Handle social media account connections via Composio
 */

import { Router, Request, Response } from 'express';
import { ComposioClient } from '../integrations/composio';
import { ErrorResponse } from '@vlowgen/shared';

const router = Router();

/**
 * POST /api/composio/connect
 * Get OAuth URL for connecting social media accounts
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { platform } = req.body;

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Platform is required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    // Get Composio API key from environment
    const composioApiKey = process.env.COMPOSIO_API_KEY;
    const composioApiUrl = process.env.COMPOSIO_API_URL || 'https://api.composio.dev';

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
    let connectedAccountId: string | undefined;

    switch (platform.toUpperCase()) {
      case 'TWITTER':
        const twitterAuth = await composioClient.getTwitterAuthUrl();
        authUrl = twitterAuth.authUrl;
        break;
      case 'INSTAGRAM':
        connectedAccountId = await composioClient.getConnectedAccountId('INSTAGRAM');
        authUrl = `https://app.composio.dev/integrations/instagram?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:4321')}`;
        break;
      case 'FACEBOOK':
        connectedAccountId = await composioClient.getConnectedAccountId('FACEBOOK');
        authUrl = `https://app.composio.dev/integrations/facebook?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:4321')}`;
        break;
      case 'TIKTOK':
        connectedAccountId = await composioClient.getConnectedAccountId('TIKTOK');
        authUrl = `https://app.composio.dev/integrations/tiktok?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:4321')}`;
        break;
      case 'YOUTUBE':
        connectedAccountId = await composioClient.getConnectedAccountId('YOUTUBE');
        authUrl = `https://app.composio.dev/integrations/youtube?redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:4321')}`;
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
      connectedAccountId,
      platform,
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
 * GET /api/composio/connected
 * Check if account is connected for a platform
 */
router.get('/connected', async (req: Request, res: Response) => {
  try {
    const { platform } = req.query;

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Platform is required',
          retryable: false,
        },
      } as ErrorResponse);
    }

    const composioApiKey = process.env.COMPOSIO_API_KEY;
    const composioApiUrl = process.env.COMPOSIO_API_URL || 'https://api.composio.dev';

    if (!composioApiKey) {
      return res.status(500).json({
        error: {
          type: 'system',
          message: 'Composio API key not configured',
          retryable: false,
        },
      } as ErrorResponse);
    }

    const composioClient = new ComposioClient(composioApiKey, composioApiUrl);
    const connectedAccountId = await composioClient.getConnectedAccountId(platform.toUpperCase());

    res.json({
      success: true,
      connected: !!connectedAccountId,
      connectedAccountId,
      platform,
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

export default router;
