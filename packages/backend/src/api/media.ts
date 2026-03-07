/**
 * Media History API
 * Handles media metadata storage and retrieval
 */

import { Router, Request, Response } from 'express';
import { minioService } from '../services/minio.service';
import { logger } from '../utils/logger';
import { saveMediaToHistory, getUserMedia, getMediaStats as getServiceStats, deleteMedia } from '../services/media-history.service';

const router: Router = Router();

interface MediaRecord {
  id: string;
  userId: string;
  minioUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  sessionId?: string;
  workflowId?: string;
  platform?: string;
  createdAt: number;
}

// In-memory store for media metadata (in production, use database)
const mediaStore: Map<string, MediaRecord> = new Map();

/**
 * POST /api/media
 * Save media metadata after upload to MinIO
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      minioUrl,
      mediaType,
      prompt,
      sessionId,
      workflowId,
      platform,
    } = req.body;

    if (!minioUrl || !mediaType || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: minioUrl, mediaType, prompt',
      });
    }

    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    const id = await saveMediaToHistory({
      userId,
      minioUrl,
      mediaType,
      prompt,
      sessionId,
      workflowId,
      platform,
    });

    logger.info('Media saved', { id, mediaType, minioUrl });

    res.json({
      success: true,
      id,
    });
  } catch (error) {
    logger.error('Failed to save media', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/media
 * Get user's media history with optional filters
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    const { mediaType, sessionId, limit } = req.query;

    let media = getUserMedia(userId);

    if (mediaType) {
      media = media.filter(m => m.mediaType === mediaType);
    }

    if (sessionId) {
      media = media.filter(m => m.sessionId === sessionId);
    }

    if (limit) {
      media = media.slice(0, parseInt(limit as string));
    }

    res.json({
      success: true,
      count: media.length,
      media,
    });
  } catch (error) {
    logger.error('Failed to get media', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/media/stats
 * Get media statistics for user
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'anonymous';

    const stats = getServiceStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Failed to get media stats', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/media/:id
 * Delete media from MinIO and metadata store
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete from MinIO and store
    await deleteMedia(id, minioService);

    logger.info('Media deleted', { id });

    res.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    logger.error('Failed to delete media', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
