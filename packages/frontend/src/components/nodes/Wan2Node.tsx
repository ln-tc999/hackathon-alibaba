
import { useCallback } from 'react';
import { NodeProps, useReactFlow } from 'reactflow';
import { Palette, Zap, Sparkles, Target, Star, Scale, X } from 'lucide-react';
import type { Wan2NodeData } from '@vlowgen/shared';
import BaseNode from './BaseNode';

/**
 * Wan2.1 Node component for AI image generation
 * Requirements: 5.2, 5.5, 15.1, 15.2
 */
export default function Wan2Node({ data, selected, id }: NodeProps<Wan2NodeData & { error?: string }>) {
  const { setNodes } = useReactFlow();

  const handleModelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newModel = event.target.value as Wan2NodeData['model'];
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                model: newModel,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = event.target.value as Wan2NodeData['size'];
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                size: newSize,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleStyleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newStyle = event.target.value;
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                style: newStyle,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleTextRenderingChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newTextRendering = event.target.value as Wan2NodeData['textRendering'];
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                textRendering: newTextRendering,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const executionError = (data as any).error;

  const getModelInfo = (model: string) => {
    if (model.includes('turbo')) {
      return { icon: Zap, text: 'Fast generation (~10s)', color: 'text-yellow-600' };
    }
    if (model.includes('plus')) {
      return { icon: Zap, text: 'Balanced speed & quality (~15s)', color: 'text-blue-600' };
    }
    if (model.includes('2.6')) {
      return { icon: Star, text: 'Best quality for text rendering (~45s)', color: 'text-purple-600' };
    }
    if (model.includes('preview')) {
      return { icon: Sparkles, text: 'Preview model', color: 'text-gray-600' };
    }
    if (model.includes('qwen')) {
      return { icon: Palette, text: 'Qwen image model', color: 'text-pink-600' };
    }
    return { icon: Zap, text: '', color: 'text-gray-600' };
  };

  const getTextRenderingInfo = (mode: string) => {
    if (mode === 'precision') {
      return { icon: Target, text: 'Maximum text accuracy with character-level enhancement' };
    }
    if (mode === 'quality') {
      return { icon: Star, text: 'Good text rendering with contrast optimization' };
    }
    if (mode === 'disabled') {
      return { icon: X, text: 'No text enhancement applied' };
    }
    return { icon: Scale, text: 'Moderate text enhancement (recommended)' };
  };

  const modelInfo = getModelInfo(data.model);
  const ModelIcon = modelInfo.icon;
  const textRenderingInfo = getTextRenderingInfo(data.textRendering || 'balanced');
  const TextRenderingIcon = textRenderingInfo.icon;

  return (
    <BaseNode
      selected={selected}
      error={executionError}
      icon={Palette}
      title="Wan2.1 Image Generation"
      color="purple"
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <optgroup label="Turbo (Fastest & Cheapest)">
              <option value="wan2.1-t2i-turbo">Wan2.1 Turbo - $0.025</option>
              <option value="wan2.1-t2i-plus">Wan2.1 Plus - $0.05</option>
            </optgroup>
            <optgroup label="Latest (Best Quality)">
              <option value="wan2.6-t2i">Wan2.6 T2I - $0.03</option>
              <option value="wan2.6-image">Wan2.6 Image - $0.03</option>
            </optgroup>
            <optgroup label="Preview">
              <option value="wan2.5-t2i-preview">Wan2.5 Preview</option>
            </optgroup>
            <optgroup label="Qwen">
              <option value="qwen-image-plus">Qwen Image Plus</option>
            </optgroup>
          </select>
          {modelInfo.text && (
            <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${modelInfo.color}`}>
              <ModelIcon className="w-3 h-3" />
              <span>{modelInfo.text}</span>
            </div>
          )}
        </div>

        {/* Size selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={data.size}
            onChange={handleSizeChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1024*1024">1024×1024 (Square)</option>
            <option value="512*512">512×512 (Small)</option>
            <option value="720*1280">720×1280 (Portrait)</option>
            <option value="1280*720">1280×720 (Landscape)</option>
          </select>
        </div>

        {/* Text Rendering Mode (for better text accuracy) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Text Rendering
          </label>
          <select
            value={data.textRendering || 'balanced'}
            onChange={handleTextRenderingChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="precision">Precision (Best for ads/logos)</option>
            <option value="quality">Quality (Good for text)</option>
            <option value="balanced">Balanced (Default)</option>
            <option value="disabled">Disabled (No text)</option>
          </select>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
            <TextRenderingIcon className="w-3 h-3" />
            <span>{textRenderingInfo.text}</span>
          </div>
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </BaseNode>
  );
}
