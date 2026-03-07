import { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, Image, Video, Filter, Loader2 } from 'lucide-react';
import { getUserMediaHistory, deleteMediaHistory, type MediaHistory } from '@/lib/db';
import { getUserId } from '@/lib/user';
import { toast } from 'sonner';

interface MediaHistoryGalleryProps {
  onMediaSelect?: (media: MediaHistory) => void;
}

export default function MediaHistoryGallery({ onMediaSelect }: MediaHistoryGalleryProps) {
  const [media, setMedia] = useState<MediaHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaHistory | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const data = await getUserMediaHistory(userId);
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleDownload = async (mediaItem: MediaHistory) => {
    setDownloadingId(mediaItem.id);
    try {
      const response = await fetch(mediaItem.minioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vlowgen-${mediaItem.mediaType}-${mediaItem.id.slice(0, 8)}.${
        mediaItem.mediaType === 'video' ? 'mp4' : 'png'
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media? This cannot be undone.')) return;
    
    try {
      setDeletingId(id);
      await deleteMediaHistory(id);
      setMedia(media.filter(m => m.id !== id));
      toast.success('Media deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(m => m.mediaType === filter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Filter Bar */}
      <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-white">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
        >
          <option value="all">All Media</option>
          <option value="image">Images Only</option>
          <option value="video">Videos Only</option>
        </select>
        <span className="text-xs text-gray-500 ml-auto">
          {filteredMedia.length} item{filteredMedia.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <Image className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">No media yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Generated images and videos will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#0446ff] transition-all"
                onClick={() => setSelectedMedia(item)}
              >
                {item.mediaType === 'image' ? (
                  <img
                    src={item.minioUrl}
                    alt={item.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Video className="w-8 h-8 text-white" />
                    {item.minioUrl && (
                      <img
                        src={item.minioUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    )}
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                        disabled={downloadingId === item.id}
                        className="flex-1 p-1.5 bg-white/90 hover:bg-white rounded text-xs disabled:opacity-50"
                        title="Download"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        disabled={deletingId === item.id}
                        className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded text-white text-xs disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-1 right-1">
                  {item.mediaType === 'video' ? (
                    <span className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded flex items-center gap-0.5">
                      <Image className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Media Details</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                {selectedMedia.mediaType === 'image' ? (
                  <img
                    src={selectedMedia.minioUrl}
                    alt={selectedMedia.prompt}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.minioUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prompt</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {selectedMedia.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-1 flex items-center gap-2">
                      {selectedMedia.mediaType === 'video' ? (
                        <Video className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Image className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium capitalize">{selectedMedia.mediaType}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</label>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{new Date(selectedMedia.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {selectedMedia.platform && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</label>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{selectedMedia.platform}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50">
              <button
                onClick={() => handleDownload(selectedMedia)}
                disabled={downloadingId === selectedMedia.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {downloadingId === selectedMedia.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedMedia.id);
                  setSelectedMedia(null);
                }}
                disabled={deletingId === selectedMedia.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === selectedMedia.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
              <button
                onClick={() => setSelectedMedia(null)}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
