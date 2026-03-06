/**
 * Viral Research API Router
 *
 * Provides endpoints for viral content research queries.
 */

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { viralResearchHandler } from '../nodes/prompt/viral-research-handler';

const router: RouterType = Router();

router.post('/', async (req: Request, res: Response) => {
  console.log('[Viral Research API] POST called');

  try {
    const { query, nodeId, enhanceWithQwen = true } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
      });
    }

    const result = await viralResearchHandler.execute(
      {
        id: nodeId || 'viral-research-node',
        type: 'prompt-enhancer-image',
        position: { x: 0, y: 0 },
        data: { query, enhanceWithQwen },
      } as any,
      { query },
      { userId: 'chat-user' } as any
    );

    if (result.status === 'error') {
      return res.status(500).json({
        error: result.error,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error('[Viral Research API] Error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
