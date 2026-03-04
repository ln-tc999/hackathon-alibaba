/**
 * Core workflow data types for VlowGen platform
 */

export type NodeType = 
  | 'prompt-text' 
  | 'wan2' 
  | 'wan2-video'
  | 'preview'
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
  | PreviewNodeData
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
  model: 
    // Turbo models (fastest, cheapest)
    | 'wan2.1-t2i-turbo' 
    | 'wan2.1-t2i-plus'
    // Latest models (best quality)
    | 'wan2.6-t2i'
    | 'wan2.6-image'
    // Preview models
    | 'wan2.5-t2i-preview'
    // Qwen image
    | 'qwen-image-plus';
  size: '1024*1024' | '512*512' | '720*1280' | '1280*720';
  style?: string;
  negativePrompt?: string;
}

export interface Wan2VideoNodeData {
  type: 'wan2-video';
  model: 
    // Text-to-Video
    | 'wan2.5-t2v-preview'
    | 'wan2.6-t2v'
    // Image-to-Video
    | 'wan2.1-i2v-turbo'
    | 'wan2.5-i2v-preview'
    | 'wan2.6-i2v'
    | 'wan2.6-i2v-flash'
    // Keyframe-to-Video
    | 'wan2.1-kf2v-plus'
    // Reference-to-Video
    | 'wan2.6-r2v'
    | 'wan2.6-r2v-flash';
  size: '832*480' | '720*1280' | '1280*720' | '1920*1080';
  duration?: number; // 2-15 seconds
  negativePrompt?: string;
}

export interface PreviewNodeData {
  type: 'preview';
  mediaType: 'image' | 'video' | 'auto';
  showMetadata?: boolean;
  previewUrl?: string;
  approved?: boolean;
}

export interface TwitterNodeData {
  type: 'twitter';
  authenticated: boolean;
  accountHandle?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  requiresAuth?: boolean;
}

export interface InstagramNodeData {
  type: 'instagram';
  authenticated: boolean;
  accountHandle?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  requiresAuth?: boolean;
}

export interface FacebookNodeData {
  type: 'facebook';
  authenticated: boolean;
  accountHandle?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  requiresAuth?: boolean;
}

export interface TikTokNodeData {
  type: 'tiktok';
  authenticated: boolean;
  accountHandle?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  requiresAuth?: boolean;
}

export interface YouTubeNodeData {
  type: 'youtube';
  authenticated: boolean;
  channelName?: string;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  requiresAuth?: boolean;
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
