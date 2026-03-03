
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseNode from './BaseNode';
import { Sparkles } from 'lucide-react';
import type { PromptEnhancerImageNodeData } from '@vlowgen/shared';

interface PromptEnhancerImageNodeProps {
  id: string;
  data: PromptEnhancerImageNodeData;
  selected?: boolean;
}

function PromptEnhancerImageNode({ id, data, selected }: PromptEnhancerImageNodeProps) {
  return (
    <BaseNode
      id={id}
      title="Image Prompt Enhancer"
      icon={Sparkles}
      selected={selected}
      color="purple"
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
            placeholder="Short prompt from user..."
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
              className="w-full px-3 py-2 text-sm border border-purple-300 rounded-lg bg-purple-50 resize-none"
              rows={4}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 bg-purple-50 p-2 rounded border border-purple-200">
          <p className="font-medium text-purple-700 mb-1">AI Enhancement:</p>
          <p>Expands short prompts into detailed, optimized descriptions for image generation with lighting, style, and camera details.</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </BaseNode>
  );
}

export default memo(PromptEnhancerImageNode);
