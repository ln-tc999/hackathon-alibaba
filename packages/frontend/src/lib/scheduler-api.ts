/**
 * Scheduler API Client
 * Handles communication with backend scheduler service
 */

import type { ScheduledPost } from '@/components/schedule/types';

// Use relative path - endpoints already include /api prefix
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || '';

export interface SchedulerStatus {
    running: boolean;
    totalPosts: number;
    pendingPosts: number;
}

/**
 * Sync scheduled posts to backend
 */
export async function syncScheduledPosts(posts: ScheduledPost[]): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scheduler/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ posts }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync posts: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Scheduler API] Sync successful:', data.message);
    } catch (error) {
        console.error('[Scheduler API] Sync failed:', error);
        throw error;
    }
}

/**
 * Get scheduler status
 */
export async function getSchedulerStatus(): Promise<SchedulerStatus> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scheduler/status`);

        if (!response.ok) {
            throw new Error(`Failed to get status: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            running: data.running,
            totalPosts: data.totalPosts,
            pendingPosts: data.pendingPosts,
        };
    } catch (error) {
        console.error('[Scheduler API] Get status failed:', error);
        throw error;
    }
}

/**
 * Start scheduler service
 */
export async function startScheduler(): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scheduler/start`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Failed to start scheduler: ${response.statusText}`);
        }

        console.log('[Scheduler API] Scheduler started');
    } catch (error) {
        console.error('[Scheduler API] Start failed:', error);
        throw error;
    }
}

/**
 * Stop scheduler service
 */
export async function stopScheduler(): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scheduler/stop`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`Failed to stop scheduler: ${response.statusText}`);
        }

        console.log('[Scheduler API] Scheduler stopped');
    } catch (error) {
        console.error('[Scheduler API] Stop failed:', error);
        throw error;
    }
}
