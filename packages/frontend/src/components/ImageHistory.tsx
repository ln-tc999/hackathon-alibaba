/**
 * Image History Component
 * 
 * Displays recent generated images with ability to:
 * - View image details
 * - Copy URL for workflow continuation
 * - Use in Vision Analyzer
 */

import { useState, useEffect } from 'react';
import { getUserId } from '../lib/user';

interface ImageHistoryEntry {
  id: string;
  minioUrl: string;
  prompt: string;
  model: string;
  size: string;
  timestamp: string;
}

export function ImageHistory() {
  const [images, setImages] = useState<ImageHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/image-history/recent?userId=${userId}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setImages(data.images);
      } else {
        setError(data.error || 'Failed to load images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add toast notification here
    console.log('URL copied:', url);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading image history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No images generated yet. Create a workflow to generate images!
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Image History</h2>
        <button
          onClick={loadImages}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative">
              <img
                src={image.minioUrl}
                alt={image.prompt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(image.minioUrl)}
                  className="px-3 py-1.5 bg-white text-gray-900 rounded text-sm font-medium hover:bg-gray-100"
                >
                  Copy URL
                </button>
              </div>
            </div>

            <div className="p-2">
              <p className="text-xs text-gray-600 line-clamp-2" title={image.prompt}>
                {image.prompt}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{image.model}</span>
                <span className="text-xs text-gray-400">
                  {new Date(image.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
