/**
 * Scheduler Service
 * Handles automatic posting of scheduled content to social media
 */

import { WorkflowExecutionEngine } from '../engine/execution-engine';
import type { Workflow, ExecutionContext } from '@vlowgen/shared';

export interface ScheduledPost {
  id: string;
  content: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';
  scheduledTime: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  status: 'pending' | 'posted' | 'failed';
  workflowId?: string;
  userId?: string;
}

class SchedulerService {
  private scheduledPosts: Map<string, ScheduledPost> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private executionEngine: WorkflowExecutionEngine;

  constructor() {
    this.executionEngine = new WorkflowExecutionEngine();
    this.registerNodeHandlers();
    this.loadScheduledPosts();
  }

  /**
   * Register all node handlers with the execution engine
   */
  private registerNodeHandlers() {
    // Import and register all handlers
    import('../nodes')
      .then((nodes) => {
        // Register all handlers directly on execution engine
        this.executionEngine.registerNodeHandler('prompt-text', new nodes.PromptTextNodeHandler());
        this.executionEngine.registerNodeHandler(
          'prompt-enhancer-image',
          new nodes.PromptEnhancerImageHandler()
        );
        this.executionEngine.registerNodeHandler(
          'prompt-enhancer-video',
          new nodes.PromptEnhancerVideoHandler()
        );
        this.executionEngine.registerNodeHandler('wan2', new nodes.Wan2NodeHandler());
        this.executionEngine.registerNodeHandler(
          'vision-analyzer',
          new nodes.VisionAnalyzerHandler()
        );
        this.executionEngine.registerNodeHandler('preview', new nodes.PreviewNodeHandler());
        this.executionEngine.registerNodeHandler('twitter', new nodes.TwitterNodeHandler());
        this.executionEngine.registerNodeHandler('instagram', new nodes.InstagramNodeHandler());
        this.executionEngine.registerNodeHandler('facebook', new nodes.FacebookNodeHandler());
        this.executionEngine.registerNodeHandler('tiktok', new nodes.TikTokNodeHandler());
        this.executionEngine.registerNodeHandler('youtube', new nodes.YouTubeNodeHandler());

      })
      .catch((error) => {
        console.error('[Scheduler] Failed to register node handlers:', error);
      });
  }

  /**
   * Load scheduled posts from storage (localStorage in browser, DB in production)
   */
  private loadScheduledPosts() {
    // In production, load from database
    // For now, we'll sync with frontend localStorage via API
  }

  /**
   * Add a new scheduled post
   */
  addScheduledPost(post: ScheduledPost): void {
    this.scheduledPosts.set(post.id, post);
  }

  /**
   * Remove a scheduled post
   */
  removeScheduledPost(postId: string): void {
    this.scheduledPosts.delete(postId);
  }

  /**
   * Update scheduled post status
   */
  updatePostStatus(postId: string, status: ScheduledPost['status']): void {
    const post = this.scheduledPosts.get(postId);
    if (post) {
      post.status = status;
    }
  }

  /**
   * Get all scheduled posts
   */
  getAllScheduledPosts(): ScheduledPost[] {
    return Array.from(this.scheduledPosts.values());
  }

  /**
   * Get pending posts that are due for posting
   */
  private getDuePosts(): ScheduledPost[] {
    const now = new Date();
    return Array.from(this.scheduledPosts.values()).filter((post) => {
      if (post.status !== 'pending') return false;

      const scheduledTime = new Date(post.scheduledTime);
      // Post is due if scheduled time is in the past or within next minute
      return scheduledTime <= new Date(now.getTime() + 60000);
    });
  }

  /**
   * Create a workflow for posting to social media
   */
  private createPostWorkflow(post: ScheduledPost): Workflow {
    const nodes: any[] = [];
    const edges: any[] = [];

    // Node 1: Prompt text (content)
    const promptNodeId = 'prompt-node';
    nodes.push({
      id: promptNodeId,
      type: 'prompt-text',
      position: { x: 0, y: 0 },
      data: {
        type: 'prompt-text',
        promptText: post.content,
      },
    });

    // Node 2: Social media platform
    const socialNodeId = `${post.platform}-node`;
    nodes.push({
      id: socialNodeId,
      type: post.platform,
      position: { x: 200, y: 0 },
      data: {
        type: post.platform,
        authenticated: true,
      },
    });

    // Edge: Connect prompt to social media (text content)
    edges.push({
      id: `${promptNodeId}-${socialNodeId}`,
      source: promptNodeId,
      target: socialNodeId,
    });

    // If media URL exists, we need to pass it to the social node
    // For scheduled posts, we'll store it in the node data and the handler will use it
    if (post.mediaUrl) {
      const mediaNode = nodes.find((n) => n.id === socialNodeId);
      if (mediaNode) {
        mediaNode.data.mediaUrl = post.mediaUrl;
        mediaNode.data.mediaType = post.mediaType;
      }
    }

    return {
      id: `scheduled-${post.id}`,
      name: `Scheduled Post - ${post.platform}`,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Execute a scheduled post
   */
  private async executePost(post: ScheduledPost): Promise<void> {

    try {
      // Create workflow for this post
      const workflow = this.createPostWorkflow(post);

      // Create execution context
      const context: ExecutionContext = {
        userId: post.userId || 'scheduler',
        executionId: `scheduled-${post.id}-${Date.now()}`,
        workflowId: workflow.id,
        credentials: {
          composioApiKey: process.env.COMPOSIO_API_KEY || '',
          composioApiUrl: process.env.COMPOSIO_API_URL,
        },
      };

      // Execute workflow
      const result = await this.executionEngine.execute(workflow, context);

      if (result.status === 'success') {
        this.updatePostStatus(post.id, 'posted');
      } else {
        this.updatePostStatus(post.id, 'failed');
        console.error(`[Scheduler] Failed to post ${post.id}:`, result.error);
      }
    } catch (error) {
      this.updatePostStatus(post.id, 'failed');
      console.error(`[Scheduler] Error executing post ${post.id}:`, error);
    }
  }

  /**
   * Check for due posts and execute them
   */
  private async checkAndExecuteDuePosts(): Promise<void> {
    const duePosts = this.getDuePosts();

    if (duePosts.length > 0) {

      for (const post of duePosts) {
        await this.executePost(post);
      }
    }
  }

  /**
   * Start the scheduler (check every minute)
   */
  start(): void {
    if (this.checkInterval) {
      return;
    }


    // Check immediately
    this.checkAndExecuteDuePosts();

    // Then check every minute
    this.checkInterval = setInterval(() => {
      this.checkAndExecuteDuePosts();
    }, 60000); // 60 seconds

  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): { running: boolean; totalPosts: number; pendingPosts: number } {
    const posts = Array.from(this.scheduledPosts.values());
    return {
      running: this.checkInterval !== null,
      totalPosts: posts.length,
      pendingPosts: posts.filter((p) => p.status === 'pending').length,
    };
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();
