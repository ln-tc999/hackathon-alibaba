/**
 * Image History Service
 * 
 * Tracks generated images for workflow continuation and AI model access
 */

export interface ImageHistoryEntry {
  id: string;
  nodeId: string;
  workflowId: string;
  executionId: string;
  minioUrl: string;
  dashscopeUrl: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  size: string;
  timestamp: string;
  userId?: string;
}

class ImageHistoryService {
  private history: Map<string, ImageHistoryEntry[]> = new Map();
  private maxHistoryPerUser = 100;

  /**
   * Add generated image to history
   */
  addImage(entry: ImageHistoryEntry): void {
    const userId = entry.userId || 'anonymous';
    
    if (!this.history.has(userId)) {
      this.history.set(userId, []);
    }

    const userHistory = this.history.get(userId)!;
    userHistory.unshift(entry); // Add to beginning

    // Keep only last N images
    if (userHistory.length > this.maxHistoryPerUser) {
      userHistory.pop();
    }

    console.log(`[ImageHistory] Added image for user ${userId}. Total: ${userHistory.length}`);
  }

  /**
   * Get recent images for a user
   */
  getRecentImages(userId: string, limit: number = 10): ImageHistoryEntry[] {
    const userHistory = this.history.get(userId) || [];
    return userHistory.slice(0, limit);
  }

  /**
   * Get image by ID
   */
  getImageById(imageId: string, userId: string): ImageHistoryEntry | null {
    const userHistory = this.history.get(userId) || [];
    return userHistory.find(img => img.id === imageId) || null;
  }

  /**
   * Get images from specific workflow
   */
  getImagesByWorkflow(workflowId: string, userId: string): ImageHistoryEntry[] {
    const userHistory = this.history.get(userId) || [];
    return userHistory.filter(img => img.workflowId === workflowId);
  }

  /**
   * Get images from specific execution
   */
  getImagesByExecution(executionId: string, userId: string): ImageHistoryEntry[] {
    const userHistory = this.history.get(userId) || [];
    return userHistory.filter(img => img.executionId === executionId);
  }

  /**
   * Get the most recent image for a user
   */
  getLatestImage(userId: string): ImageHistoryEntry | null {
    const userHistory = this.history.get(userId) || [];
    return userHistory[0] || null;
  }

  /**
   * Search images by prompt keywords
   */
  searchByPrompt(userId: string, keywords: string): ImageHistoryEntry[] {
    const userHistory = this.history.get(userId) || [];
    const lowerKeywords = keywords.toLowerCase();
    
    return userHistory.filter(img => 
      img.prompt.toLowerCase().includes(lowerKeywords)
    );
  }

  /**
   * Clear history for a user
   */
  clearHistory(userId: string): void {
    this.history.delete(userId);
    console.log(`[ImageHistory] Cleared history for user ${userId}`);
  }

  /**
   * Get total images count for a user
   */
  getImageCount(userId: string): number {
    const userHistory = this.history.get(userId) || [];
    return userHistory.length;
  }
}

// Singleton instance
export const imageHistoryService = new ImageHistoryService();
