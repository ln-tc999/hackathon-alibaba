
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Eye, Upload, Image as ImageIcon } from 'lucide-react';
import type { VisionAnalyzerNodeData } from '@vlowgen/shared';

interface VisionAnalyzerNodeProps {
  id: string;
  data: VisionAnalyzerNodeData;
  selected?: boolean;
}

function VisionAnalyzerNode({ id, data, selected }: VisionAnalyzerNodeProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Vision Analyzer"
      icon={Eye}
      selected={selected}
      color="emerald"
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Upload Image/Video
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id={`file-upload-${id}`}
            />
            <label
              htmlFor={`file-upload-${id}`}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Choose file</span>
            </label>
          </div>
        </div>

        {(previewUrl || data.imageUrl) && (
          <div className="relative">
            <img
              src={previewUrl || data.imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Target Niche (Optional)
          </label>
          <input
            type="text"
            value={data.niche || ''}
            readOnly
            placeholder="e.g., Tech Startups, Fitness, Travel..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        {data.analyzedPrompt && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Generated Prompt
            </label>
            <textarea
              value={data.analyzedPrompt}
              readOnly
              className="w-full px-3 py-2 text-sm border border-emerald-300 rounded-lg bg-emerald-50 resize-none"
              rows={4}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 bg-emerald-50 p-2 rounded border border-emerald-200">
          <p className="font-medium text-emerald-700 mb-1">Vision AI:</p>
          <p>Analyzes viral images/videos and generates prompts that replicate the format for your niche.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(VisionAnalyzerNode);
