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
 */
export const CONNECTION_RULES: ConnectionRule[] = [
  { sourceType: 'prompt-text', targetType: 'wan2', allowed: true },
  { sourceType: 'prompt-text', targetType: 'twitter', allowed: false },
  { sourceType: 'prompt-text', targetType: 'prompt-text', allowed: false },
  { sourceType: 'wan2', targetType: 'twitter', allowed: true },
  { sourceType: 'wan2', targetType: 'instagram', allowed: true },
  { sourceType: 'wan2', targetType: 'facebook', allowed: true },
  { sourceType: 'wan2', targetType: 'tiktok', allowed: true },
  { sourceType: 'wan2', targetType: 'youtube', allowed: true },
  { sourceType: 'wan2', targetType: 'prompt-text', allowed: false },
  { sourceType: 'wan2', targetType: 'wan2', allowed: false },
  { sourceType: 'twitter', targetType: 'prompt-text', allowed: false },
  { sourceType: 'twitter', targetType: 'wan2', allowed: false },
  { sourceType: 'twitter', targetType: 'twitter', allowed: false },
];
