/**
 * Image History API Routes
 * 
 * Provides endpoints for accessing generated image history
 */

import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { imageHistoryService } from '../services/image-history.service';

const router: ExpressRouter = Router();

/**
 * GET /api/image-history/recent
 * Get recent images for the current user
 */
router.get('/recent', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'anonymous';
    const limit = parseInt(req.query.limit as string) || 10;

    const images = imageHistoryService.getRecentImages(userId, limit);

    res.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    console.error('[ImageHistory API] Error fetching recent images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent images',
    });
  }
});

/**
 * GET /api/image-history/latest
 * Get the most recent image for the current user
 */
router.get('/latest', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'anonymous';

    const image = imageHistoryService.getLatestImage(userId);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'No images found',
      });
    }

    res.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error('[ImageHistory API] Error fetching latest image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest image',
    });
  }
});

/**
 * GET /api/image-history/:imageId
 * Get specific image by ID
 */
router.get('/:imageId', (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    const userId = req.query.userId as string || 'anonymous';

    const image = imageHistoryService.getImageById(imageId, userId);

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
      });
    }

    res.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error('[ImageHistory API] Error fetching image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch image',
    });
  }
});

/**
 * GET /api/image-history/workflow/:workflowId
 * Get all images from a specific workflow
 */
router.get('/workflow/:workflowId', (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const userId = req.query.userId as string || 'anonymous';

    const images = imageHistoryService.getImagesByWorkflow(workflowId, userId);

    res.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    console.error('[ImageHistory API] Error fetching workflow images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow images',
    });
  }
});

/**
 * GET /api/image-history/search
 * Search images by prompt keywords
 */
router.get('/search', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'anonymous';
    const keywords = req.query.q as string;

    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Search keywords required',
      });
    }

    const images = imageHistoryService.searchByPrompt(userId, keywords);

    res.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error) {
    console.error('[ImageHistory API] Error searching images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search images',
    });
  }
});

/**
 * DELETE /api/image-history
 * Clear image history for the current user
 */
router.delete('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'anonymous';

    imageHistoryService.clearHistory(userId);

    res.json({
      success: true,
      message: 'Image history cleared',
    });
  } catch (error) {
    console.error('[ImageHistory API] Error clearing history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear history',
    });
  }
});

export default router;
