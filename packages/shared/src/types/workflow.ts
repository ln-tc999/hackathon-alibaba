/**
 * Core workflow data types for VlowGen platform
 */

export type NodeType = 'prompt-text' | 'wan2' | 'twitter';

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeData = PromptTextNodeData | Wan2NodeData | TwitterNodeData;

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

export interface TwitterNodeData {
  type: 'twitter';
  authenticated: boolean;
  accountHandle?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
