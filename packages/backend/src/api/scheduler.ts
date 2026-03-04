/**
 * Scheduler API endpoints
 * Handles scheduled posts management
 */

import { Router, Request, Response } from 'express';
import { schedulerService } from '../services/scheduler.service';
import type { ScheduledPost } from '../services/scheduler.service';

const router = Router();

/**
 * Sync scheduled posts from frontend
 * POST /api/scheduler/sync
 */
router.post('/sync', (req: Request, res: Response) => {
    try {
        const posts: ScheduledPost[] = req.body.posts || [];

        console.log(`[Scheduler API] Syncing ${posts.length} scheduled posts`);

        // Clear existing posts and add new ones
        // In production, you'd want to merge/update instead of replace
        posts.forEach(post => {
            schedulerService.addScheduledPost(post);
        });

        res.json({
            success: true,
            message: `Synced ${posts.length} posts`,
        });
    } catch (error) {
        console.error('[Scheduler API] Sync error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * Get all scheduled posts
 * GET /api/scheduler/posts
 */
router.get('/posts', (req: Request, res: Response) => {
    try {
        const posts = schedulerService.getAllScheduledPosts();

        res.json({
            success: true,
            posts,
        });
    } catch (error) {
        console.error('[Scheduler API] Get posts error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * Get scheduler status
 * GET /api/scheduler/status
 */
router.get('/status', (req: Request, res: Response) => {
    try {
        const status = schedulerService.getStatus();

        res.json({
            success: true,
            ...status,
        });
    } catch (error) {
        console.error('[Scheduler API] Status error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * Start scheduler
 * POST /api/scheduler/start
 */
router.post('/start', (req: Request, res: Response) => {
    try {
        schedulerService.start();

        res.json({
            success: true,
            message: 'Scheduler started',
        });
    } catch (error) {
        console.error('[Scheduler API] Start error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

/**
 * Stop scheduler
 * POST /api/scheduler/stop
 */
router.post('/stop', (req: Request, res: Response) => {
    try {
        schedulerService.stop();

        res.json({
            success: true,
            message: 'Scheduler stopped',
        });
    } catch (error) {
        console.error('[Scheduler API] Stop error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

export default router;
