/**
 * Media API Client
 * Handles media history operations with backend
 */

// Use relative path for nginx reverse proxy
const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

export interface MediaRecord {
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

export interface MediaStats {
  total: number;
  images: number;
  videos: number;
}

/**
 * Save media metadata to backend
 */
export async function saveMedia(media: {
  minioUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  sessionId?: string;
  workflowId?: string;
  platform?: string;
}): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(media),
    });

    if (!response.ok) {
      throw new Error(`Failed to save media: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('[Media API] Save failed:', error);
    throw error;
  }
}

/**
 * Get user's media history
 */
export async function getUserMedia(options?: {
  mediaType?: 'image' | 'video';
  sessionId?: string;
  limit?: number;
}): Promise<MediaRecord[]> {
  try {
    const params = new URLSearchParams();
    if (options?.mediaType) params.append('mediaType', options.mediaType);
    if (options?.sessionId) params.append('sessionId', options.sessionId);
    if (options?.limit) params.append('limit', options.limit.toString());

    const response = await fetch(`${API_URL}/api/media?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get media: ${response.statusText}`);
    }

    const data = await response.json();
    return data.media || [];
  } catch (error) {
    console.error('[Media API] Get failed:', error);
    throw error;
  }
}

/**
 * Get media statistics
 */
export async function getMediaStats(): Promise<MediaStats> {
  try {
    const response = await fetch(`${API_URL}/api/media/stats`);

    if (!response.ok) {
      throw new Error(`Failed to get media stats: ${response.statusText}`);
    }

    const data = await response.json();
    return data.stats || { total: 0, images: 0, videos: 0 };
  } catch (error) {
    console.error('[Media API] Stats failed:', error);
    throw error;
  }
}

/**
 * Delete media
 */
export async function deleteMedia(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/media/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete media: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[Media API] Delete failed:', error);
    throw error;
  }
}
