/**
 * Media History Service
 * 
 * Handles saving media metadata for frontend gallery
 * In production, this would save to database
 * For now, uses in-memory store
 */

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

// In-memory store (in production, use database)
const mediaStore: Map<string, MediaRecord> = new Map();

/**
 * Save media to history store
 */
export async function saveMediaToHistory(media: {
  userId: string;
  minioUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  sessionId?: string;
  workflowId?: string;
  platform?: string;
}): Promise<string> {
  const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const record: MediaRecord = {
    id,
    ...media,
    createdAt: Date.now(),
  };
  
  mediaStore.set(id, record);
  
  return id;
}

/**
 * Get all media for user
 */
export function getUserMedia(userId: string): MediaRecord[] {
  return Array.from(mediaStore.values())
    .filter(m => m.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get media stats for user
 */
export function getMediaStats(userId: string): { total: number; images: number; videos: number } {
  const media = getUserMedia(userId);
  
  return {
    total: media.length,
    images: media.filter(m => m.mediaType === 'image').length,
    videos: media.filter(m => m.mediaType === 'video').length,
  };
}

/**
 * Delete media from store
 */
export async function deleteMedia(id: string, minioService?: any): Promise<void> {
  const media = mediaStore.get(id);
  
  if (media) {
    // Delete from MinIO if service provided
    if (minioService) {
      try {
        const urlParts = media.minioUrl.split('/');
        const objectName = urlParts[urlParts.length - 1];
        await minioService.deleteImage(objectName);
      } catch (error) {
        console.error('Failed to delete from MinIO:', error);
      }
    }
    
    mediaStore.delete(id);
  }
}
