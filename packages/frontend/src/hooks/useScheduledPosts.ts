import { useState, useEffect, useCallback } from 'react';
import type { ScheduledPost } from '@/components/schedule/types';
import { syncScheduledPosts, getSchedulerStatus, type SchedulerStatus } from '@/lib/scheduler-api';
import { toast } from 'sonner';

interface UseScheduledPostsReturn {
  scheduledPosts: ScheduledPost[];
  schedulerStatus: SchedulerStatus | null;
  handleAddPost: (post: Omit<ScheduledPost, 'id'>) => void;
  handleEditPost: (id: string, updates: Partial<ScheduledPost>) => void;
  handleDeletePost: (id: string) => void;
}

/**
 * Hook untuk manage scheduled posts
 * - Load dari localStorage on mount
 * - Save ke localStorage + sync backend saat berubah
 * - Fetch scheduler status periodic
 */
export function useScheduledPosts(): UseScheduledPostsReturn {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
    try {
      const saved = localStorage.getItem('vlowgen_scheduled_posts');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
      return [];
    }
  });

  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);

  // Save to localStorage + sync backend
  useEffect(() => {
    try {
      localStorage.setItem('vlowgen_scheduled_posts', JSON.stringify(scheduledPosts));

      // Debounced sync to backend
      const timeoutId = setTimeout(() => {
        syncScheduledPosts(scheduledPosts).catch((error) => {
          console.error('Failed to sync posts to backend:', error);
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to save scheduled posts:', error);
    }
  }, [scheduledPosts]);

  // Fetch scheduler status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSchedulerStatus();
        setSchedulerStatus(status);
      } catch (error) {
        console.error('Failed to fetch scheduler status:', error);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleAddPost = useCallback((post: Omit<ScheduledPost, 'id'>) => {
    const newPost: ScheduledPost = {
      ...post,
      id: `post-${Date.now()}`,
    };
    setScheduledPosts((prev) => [...prev, newPost]);
    toast.success('Post scheduled successfully!');
  }, []);

  const handleEditPost = useCallback((id: string, updates: Partial<ScheduledPost>) => {
    setScheduledPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...updates } : post))
    );
    toast.success('Post updated!');
  }, []);

  const handleDeletePost = useCallback((id: string) => {
    setScheduledPosts((prev) => prev.filter((post) => post.id !== id));
    toast.success('Post deleted!');
  }, []);

  return {
    scheduledPosts,
    schedulerStatus,
    handleAddPost,
    handleEditPost,
    handleDeletePost,
  };
}
