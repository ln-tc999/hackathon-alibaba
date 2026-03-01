'use client';

import { FileText, Image, Layers, Twitter, Sparkles, Video, Eye, Instagram, Facebook, Music, Youtube } from 'lucide-react';
import type { NodeType } from '@vlowgen/shared';

interface NodeTypeInfo {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NODE_TYPES: NodeTypeInfo[] = [
  {
    type: 'prompt-text',
    label: 'Prompt Text',
    description: 'Text input for AI prompts',
    icon: FileText,
  },
  {
    type: 'prompt-enhancer-image',
    label: 'Image Prompt Enhancer',
    description: 'Enhance prompts for image generation',
    icon: Sparkles,
  },
  {
    type: 'prompt-enhancer-video',
    label: 'Video Prompt Enhancer',
    description: 'Enhance prompts for video generation',
    icon: Video,
  },
  {
    type: 'vision-analyzer',
    label: 'Vision Analyzer',
    description: 'Generate prompt from image/video',
    icon: Eye,
  },
  {
    type: 'wan2',
    label: 'Wan2.1 Image',
    description: 'Generate images with AI',
    icon: Image,
  },
  {
    type: 'openrouter',
    label: 'OpenRouter Image',
    description: 'Generate images with OpenRouter',
    icon: Layers,
  },
  {
    type: 'twitter',
    label: 'Twitter Post',
    description: 'Post content to Twitter',
    icon: Twitter,
  },
  {
    type: 'instagram',
    label: 'Instagram Post',
    description: 'Post content to Instagram',
    icon: Instagram,
  },
  {
    type: 'facebook',
    label: 'Facebook Post',
    description: 'Post content to Facebook',
    icon: Facebook,
  },
  {
    type: 'tiktok',
    label: 'TikTok Post',
    description: 'Post videos to TikTok',
    icon: Music,
  },
  {
    type: 'youtube',
    label: 'YouTube Upload',
    description: 'Upload videos to YouTube',
    icon: Youtube,
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
    <div className="h-full bg-white p-4">
      <div className="space-y-2">
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.type)}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-sm">{nodeType.label}</span>
              </div>
              <p className="text-xs text-gray-600 ml-11">{nodeType.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
