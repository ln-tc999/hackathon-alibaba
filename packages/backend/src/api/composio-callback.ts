/**
 * Composio OAuth Callback
 * Handles OAuth redirect from Composio after user authorizes
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router: Router = Router();

/**
 * GET /api/composio/callback
 * Handle OAuth callback from Composio
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { connectionId, userId, platform, error } = req.query;

    logger.info('Composio OAuth callback', { connectionId, userId, platform });

    if (error) {
      // OAuth failed
      return res.status(400).json({
        success: false,
        error: typeof error === 'string' ? error : 'OAuth failed',
      });
    }

    if (!connectionId || !userId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: connectionId, userId, platform',
      });
    }

    // At this point, Composio has already processed the OAuth
    // The connection should be active in Composio's system
    // We just need to redirect the user back to the frontend

    const frontendUrl = process.env.FRONTEND_URL || 'https://www.vlowgen-hacks.my.id';
    
    // Redirect to frontend with success message
    // Frontend will poll /api/composio/connected to verify connection
    res.redirect(
      `${frontendUrl}?oauth_success=true&platform=${platform}&connectionId=${connectionId}`
    );
  } catch (error) {
    logger.error('Composio callback error', { error });
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.vlowgen-hacks.my.id';
    res.redirect(`${frontendUrl}?oauth_error=true`);
  }
});

/**
 * POST /api/composio/callback
 * Handle POST callback (for webhook-style notifications)
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { connectionId, userId, platform, status } = req.body;

    logger.info('Composio webhook callback', { connectionId, userId, platform, status });

    // This is for webhook-style notifications from Composio
    // Mark the connection as active in our system
    res.json({ success: true });
  } catch (error) {
    logger.error('Composio webhook callback error', { error });
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

export default router;
