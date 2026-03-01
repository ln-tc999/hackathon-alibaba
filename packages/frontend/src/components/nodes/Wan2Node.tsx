'use client';

import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Palette } from 'lucide-react';
import type { Wan2NodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * Wan2.1 Node component for AI image generation
 * Requirements: 5.2, 5.5, 15.1, 15.2
 */
export default function Wan2Node({ data, selected }: NodeProps<Wan2NodeData & { error?: string }>) {
  const handleModelChange = useCallback(
    (_event: React.ChangeEvent<HTMLSelectElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const handleSizeChange = useCallback(
    (_event: React.ChangeEvent<HTMLSelectElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const handleStyleChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const executionError = (data as any).error;

  return (
    <BaseNode
      selected={selected}
      error={executionError}
      icon={Palette}
      title="Wan2.1 Image Generation"
    >
      <div className="space-y-3">
        {/* Model selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={data.model}
            onChange={handleModelChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="wanx-v1">Wanx V1</option>
            <option value="wanx-v2">Wanx V2</option>
          </select>
        </div>

        {/* Size selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={data.size}
            onChange={handleSizeChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1024x1024">1024x1024</option>
            <option value="512x512">512x512</option>
          </select>
        </div>

        {/* Optional style input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Style (optional)
          </label>
          <input
            type="text"
            value={data.style || ''}
            onChange={handleStyleChange}
            placeholder="e.g., photorealistic, anime, watercolor"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </BaseNode>
  );
}
