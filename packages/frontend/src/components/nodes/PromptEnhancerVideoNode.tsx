'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Video } from 'lucide-react';
import type { PromptEnhancerVideoNodeData } from '@vlowgen/shared';

interface PromptEnhancerVideoNodeProps {
  id: string;
  data: PromptEnhancerVideoNodeData;
  selected?: boolean;
}

function PromptEnhancerVideoNode({ id, data, selected }: PromptEnhancerVideoNodeProps) {
  return (
    <BaseNode
      id={id}
      title="Video Prompt Enhancer"
      icon={Video}
      selected={selected}
      color="indigo"
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            User Prompt
          </label>
          <textarea
            value={data.userPrompt || ''}
            readOnly
            placeholder="Short video idea from user..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 resize-none"
            rows={2}
          />
        </div>

        {data.enhancedPrompt && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Enhanced Prompt
            </label>
            <textarea
              value={data.enhancedPrompt}
              readOnly
              className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg bg-indigo-50 resize-none"
              rows={4}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 bg-indigo-50 p-2 rounded border border-indigo-200">
          <p className="font-medium text-indigo-700 mb-1">AI Enhancement:</p>
          <p>Adds camera movement, subject motion, lighting, and cinematic details for video generation.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(PromptEnhancerVideoNode);
