/**
 * Validation-related types
 */

import { NodeType } from './workflow';

export interface ValidationError {
  type: 'connection' | 'configuration' | 'structure';
  nodeId?: string;
  edgeId?: string;
  message: string;
}

export interface ConnectionRule {
  sourceType: NodeType;
  targetType: NodeType;
  allowed: boolean;
}

/**
 * Connection rules for MVP
 * Defines which node types can connect to each other
 * 
 * Proper flow: Prompt → Generate (Wan2/Video) → Preview → Social Media
 */
export const CONNECTION_RULES: ConnectionRule[] = [
  // Prompt connections
  { sourceType: 'prompt-text', targetType: 'wan2', allowed: true },
  { sourceType: 'prompt-text', targetType: 'wan2-video', allowed: true },
  { sourceType: 'prompt-text', targetType: 'twitter', allowed: true }, // Twitter supports text-only posts
  { sourceType: 'prompt-text', targetType: 'prompt-text', allowed: false },
  { sourceType: 'prompt-text', targetType: 'preview', allowed: false },
  
  // Wan2 (image) connections - should go to preview first
  { sourceType: 'wan2', targetType: 'preview', allowed: true },
  { sourceType: 'wan2', targetType: 'vision-analyzer', allowed: true }, // Can analyze generated images
  { sourceType: 'wan2', targetType: 'twitter', allowed: true }, // Direct posting still allowed
  { sourceType: 'wan2', targetType: 'instagram', allowed: true },
  { sourceType: 'wan2', targetType: 'facebook', allowed: true },
  { sourceType: 'wan2', targetType: 'tiktok', allowed: true },
  { sourceType: 'wan2', targetType: 'youtube', allowed: true },
  { sourceType: 'wan2', targetType: 'prompt-text', allowed: false },
  { sourceType: 'wan2', targetType: 'wan2', allowed: false },
  
  // Wan2 Video connections - should go to preview first
  { sourceType: 'wan2-video', targetType: 'preview', allowed: true },
  { sourceType: 'wan2-video', targetType: 'twitter', allowed: true }, // Direct posting still allowed
  { sourceType: 'wan2-video', targetType: 'instagram', allowed: true },
  { sourceType: 'wan2-video', targetType: 'facebook', allowed: true },
  { sourceType: 'wan2-video', targetType: 'tiktok', allowed: true },
  { sourceType: 'wan2-video', targetType: 'youtube', allowed: true },
  { sourceType: 'wan2-video', targetType: 'prompt-text', allowed: false },
  { sourceType: 'wan2-video', targetType: 'wan2', allowed: false },
  { sourceType: 'wan2-video', targetType: 'wan2-video', allowed: false },
  
  // Preview connections - can go to any social media
  { sourceType: 'preview', targetType: 'twitter', allowed: true },
  { sourceType: 'preview', targetType: 'instagram', allowed: true },
  { sourceType: 'preview', targetType: 'facebook', allowed: true },
  { sourceType: 'preview', targetType: 'tiktok', allowed: true },
  { sourceType: 'preview', targetType: 'youtube', allowed: true },
  { sourceType: 'preview', targetType: 'prompt-text', allowed: false },
  { sourceType: 'preview', targetType: 'wan2', allowed: false },
  { sourceType: 'preview', targetType: 'wan2-video', allowed: false },
  { sourceType: 'preview', targetType: 'preview', allowed: false },
  
  // Social media nodes cannot connect to anything
  { sourceType: 'twitter', targetType: 'prompt-text', allowed: false },
  { sourceType: 'twitter', targetType: 'wan2', allowed: false },
  { sourceType: 'twitter', targetType: 'twitter', allowed: false },
  { sourceType: 'twitter', targetType: 'preview', allowed: false },
  { sourceType: 'instagram', targetType: 'preview', allowed: false },
  { sourceType: 'facebook', targetType: 'preview', allowed: false },
  { sourceType: 'tiktok', targetType: 'preview', allowed: false },
  { sourceType: 'youtube', targetType: 'preview', allowed: false },

  // Prompt Enhancer connections
  { sourceType: 'prompt-text', targetType: 'prompt-enhancer-image', allowed: true },
  { sourceType: 'prompt-text', targetType: 'prompt-enhancer-video', allowed: true },
  { sourceType: 'prompt-enhancer-image', targetType: 'wan2', allowed: true },
  { sourceType: 'prompt-enhancer-video', targetType: 'wan2-video', allowed: true },

  // Vision Analyzer connections
  { sourceType: 'vision-analyzer', targetType: 'prompt-text', allowed: true },
  { sourceType: 'vision-analyzer', targetType: 'prompt-enhancer-image', allowed: true },
  { sourceType: 'vision-analyzer', targetType: 'prompt-enhancer-video', allowed: true },
  { sourceType: 'vision-analyzer', targetType: 'wan2', allowed: true },
  { sourceType: 'vision-analyzer', targetType: 'wan2-video', allowed: true },
];
