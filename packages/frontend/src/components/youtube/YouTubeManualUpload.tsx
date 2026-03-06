import { useState } from 'react';
import { Download, ExternalLink, Copy, Check } from 'lucide-react';

interface YouTubeManualUploadProps {
  data: {
    videoUrl: string;
    uploadUrl: string;
    metadata: {
      title: string;
      description: string;
      tags: string[];
      category: string;
      privacy: string;
    };
    instructions: string[];
  };
}

export function YouTubeManualUpload({ data }: YouTubeManualUploadProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadVideo = () => {
    window.open(data.videoUrl, '_blank');
  };

  const openYouTubeStudio = () => {
    window.open(data.uploadUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">YouTube Manual Upload</h3>
          <p className="text-sm text-gray-600 mt-1">
            Follow these steps to upload your video to YouTube
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadVideo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Video
          </button>
          <button
            onClick={openYouTubeStudio}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open YouTube Studio
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Upload Instructions</h4>
        <ol className="space-y-2">
          {data.instructions.map((instruction, index) => (
            <li key={index} className="text-sm text-blue-800 flex gap-2">
              <span className="font-semibold min-w-[20px]">{index + 1}.</span>
              <span>{instruction.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Metadata to Copy */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Video Metadata (Click to Copy)</h4>

        {/* Title */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <button
              onClick={() => copyToClipboard(data.metadata.title, 'title')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {copiedField === 'title' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-900">{data.metadata.title}</p>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <button
              onClick={() => copyToClipboard(data.metadata.description, 'description')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {copiedField === 'description' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{data.metadata.description}</p>
        </div>

        {/* Tags */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <button
              onClick={() => copyToClipboard(data.metadata.tags.join(', '), 'tags')}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              {copiedField === 'tags' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.metadata.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Category & Privacy */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Category</label>
            <p className="text-sm text-gray-900">{data.metadata.category}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">Privacy</label>
            <p className="text-sm text-gray-900">{data.metadata.privacy}</p>
          </div>
        </div>
      </div>

      {/* Video Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Video Preview</h4>
        <video
          src={data.videoUrl}
          controls
          className="w-full rounded-lg"
          style={{ maxHeight: '400px' }}
        />
      </div>
    </div>
  );
}
