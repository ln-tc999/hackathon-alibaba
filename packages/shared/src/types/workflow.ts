/**
 * Core workflow data types for VlowGen platform
 */

export type NodeType = 
  | 'prompt-text' 
  | 'wan2' 
  | 'openrouter' 
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'prompt-enhancer-image'
  | 'prompt-enhancer-video'
  | 'vision-analyzer';

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeData = 
  | PromptTextNodeData 
  | Wan2NodeData 
  | OpenRouterNodeData 
  | TwitterNodeData
  | InstagramNodeData
  | FacebookNodeData
  | TikTokNodeData
  | YouTubeNodeData
  | PromptEnhancerImageNodeData
  | PromptEnhancerVideoNodeData
  | VisionAnalyzerNodeData;

export interface PromptTextNodeData {
  type: 'prompt-text';
  promptText: string;
}

export interface Wan2NodeData {
  type: 'wan2';
  model: 'wanx-v1' | 'wanx-v2';
  size: '1024x1024' | '512x512';
  style?: string;
}

export interface OpenRouterNodeData {
  type: 'openrouter';
  model: string;
  width: number;
  height: number;
  negative_prompt?: string;
}

export interface TwitterNodeData {
  type: 'twitter';
  authenticated: boolean;
  accountHandle?: string;
}

export interface InstagramNodeData {
  type: 'instagram';
  authenticated: boolean;
  accountHandle?: string;
}

export interface FacebookNodeData {
  type: 'facebook';
  authenticated: boolean;
  accountHandle?: string;
}

export interface TikTokNodeData {
  type: 'tiktok';
  authenticated: boolean;
  accountHandle?: string;
}

export interface YouTubeNodeData {
  type: 'youtube';
  authenticated: boolean;
  channelName?: string;
}

export interface PromptEnhancerImageNodeData {
  type: 'prompt-enhancer-image';
  userPrompt: string;
  enhancedPrompt?: string;
}

export interface PromptEnhancerVideoNodeData {
  type: 'prompt-enhancer-video';
  userPrompt: string;
  enhancedPrompt?: string;
}

export interface VisionAnalyzerNodeData {
  type: 'vision-analyzer';
  imageUrl?: string;
  videoUrl?: string;
  uploadedFile?: {
    name: string;
    size: number;
    type: string;
  };
  niche?: string;
  analyzedPrompt?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
