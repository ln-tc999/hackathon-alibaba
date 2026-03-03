/**
 * Core workflow data types for VlowGen platform
 */

export type NodeType = 
  | 'prompt-text' 
  | 'wan2' 
  | 'wan2-video'
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
  | Wan2VideoNodeData
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
  model: 'wanx-v1' | 'wanx-v2' | 'wan2.1-t2i-turbo' | 'wan2.1-t2i-plus' | 'wan2.6-t2i';
  size: '1024*1024' | '512*512' | '720*1280' | '1280*720';
  style?: string;
}

export interface Wan2VideoNodeData {
  type: 'wan2-video';
  model: 'wan2.1-t2v-turbo' | 'wan2.1-t2v-plus';
  size: '832*480' | '720*1280' | '1280*720';
  negativePrompt?: string;
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
