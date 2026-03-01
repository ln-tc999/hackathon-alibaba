'use client';

import { useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Image } from 'lucide-react';
import type { OpenRouterNodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * OpenRouter Node component for AI image generation
 */
export default function OpenRouterNode({ data, selected }: NodeProps<OpenRouterNodeData & { error?: string }>) {
  const handleModelChange = useCallback(
    (_event: React.ChangeEvent<HTMLSelectElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const handleWidthChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const handleHeightChange = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>) => {
      // Note: Node data updates will be handled by React Flow's internal state management
      // TODO: Implement proper data flow when integrating with workflow execution
    },
    []
  );

  const handleNegativePromptChange = useCallback(
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
      icon={Image}
      title="OpenRouter Image Generation"
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
            <option value="black-forest-labs/flux-1.1-pro">Flux 1.1 Pro</option>
            <option value="stability-ai/stable-diffusion-3">Stable Diffusion 3</option>
            <option value="prompthero/openjourney">Openjourney</option>
            <option value="stability-ai/sdxl">SDXL</option>
          </select>
        </div>

        {/* Width input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            type="number"
            value={data.width}
            onChange={handleWidthChange}
            min="256"
            max="1024"
            step="64"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Height input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="number"
            value={data.height}
            onChange={handleHeightChange}
            min="256"
            max="1024"
            step="64"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Negative prompt input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Negative Prompt (optional)
          </label>
          <input
            type="text"
            value={data.negative_prompt || ''}
            onChange={handleNegativePromptChange}
            placeholder="Things to avoid in the image..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </BaseNode>
  );
}