'use client';

import type { NodeType } from '@vlowgen/shared';

interface NodeTypeInfo {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
}

const NODE_TYPES: NodeTypeInfo[] = [
  {
    type: 'prompt-text',
    label: 'Prompt Text',
    description: 'Text input for AI prompts',
    icon: '📝',
  },
  {
    type: 'wan2',
    label: 'Wan2.1 Image',
    description: 'Generate images with AI',
    icon: '🎨',
  },
  {
    type: 'twitter',
    label: 'Twitter Post',
    description: 'Post content to Twitter',
    icon: '🐦',
  },
];

/**
 * Node palette component with draggable node types
 * Users can drag nodes from the palette onto the canvas
 */
export default function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Node Palette</h2>
      <div className="space-y-2">
        {NODE_TYPES.map((nodeType) => (
          <div
            key={nodeType.type}
            draggable
            onDragStart={(e) => onDragStart(e, nodeType.type)}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{nodeType.icon}</span>
              <span className="font-medium">{nodeType.label}</span>
            </div>
            <p className="text-xs text-gray-600">{nodeType.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
