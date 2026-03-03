import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface Wan2VideoNodeProps {
  data: {
    model: 'wan2.1-t2v-turbo' | 'wan2.1-t2v-plus';
    size: '832*480' | '720*1280' | '1280*720';
    negativePrompt?: string;
    onChange?: (data: any) => void;
  };
}

export const Wan2VideoNode: React.FC<Wan2VideoNodeProps> = ({ data }) => {
  const [model, setModel] = useState(data.model || 'wan2.1-t2v-turbo');
  const [size, setSize] = useState(data.size || '832*480');
  const [negativePrompt, setNegativePrompt] = useState(data.negativePrompt || '');

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as 'wan2.1-t2v-turbo' | 'wan2.1-t2v-plus';
    setModel(newModel);
    data.onChange?.({ ...data, model: newModel });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value as '832*480' | '720*1280' | '1280*720';
    setSize(newSize);
    data.onChange?.({ ...data, size: newSize });
  };

  const handleNegativePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNegativePrompt = e.target.value;
    setNegativePrompt(newNegativePrompt);
    data.onChange?.({ ...data, negativePrompt: newNegativePrompt });
  };

  const getPricing = () => {
    if (size === '832*480') return '$0.25 (5s × $0.05/s)';
    if (size === '1280*720') return '$0.50 (5s × $0.10/s)';
    return '$0.50 (5s × $0.10/s)';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-500 p-4 min-w-[280px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-purple-500 border-2 border-white" />
      
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🎬</span>
          <h3 className="font-bold text-gray-800">Wan2 Video</h3>
        </div>
        <p className="text-xs text-gray-500">Text-to-Video (5s, silent)</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={model}
            onChange={handleModelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="wan2.1-t2v-turbo">wan2.1-t2v-turbo (Cheapest)</option>
            <option value="wan2.1-t2v-plus">wan2.1-t2v-plus (Better Quality)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resolution
          </label>
          <select
            value={size}
            onChange={handleSizeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="832*480">480P (16:9) - Cheapest</option>
            <option value="1280*720">720P (16:9)</option>
            <option value="720*1280">720P (9:16) Portrait</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Cost: {getPricing()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Negative Prompt (Optional)
          </label>
          <textarea
            value={negativePrompt}
            onChange={handleNegativePromptChange}
            placeholder="e.g., low quality, blurry, distorted"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={2}
          />
          <p className="text-xs text-gray-500 mt-1">Exclude unwanted elements</p>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            ⚡ Duration: 5 seconds (fixed)
          </p>
          <p className="text-xs text-gray-600">
            🔇 Audio: Silent video
          </p>
          <p className="text-xs text-gray-600">
            🎯 Free quota: 50 seconds
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-purple-500 border-2 border-white" />
    </div>
  );
};
