import { useCallback } from 'react';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@vlowgen/shared';

interface UseWorkflowGeneratorReturn {
  generateNewWorkflow: (prompt: string) => Workflow;
  modifyExistingWorkflow: (workflow: Workflow, prompt: string) => Workflow;
  generateWorkflowFromPrompt: (prompt: string, existingWorkflow?: Workflow) => Workflow;
}

const DEFAULT_POSITIONS = {
  startX: 100,
  startY: 100,
  nodeSpacing: 300,
  platformSpacing: 150,
};

/**
 * Hook untuk generate workflow dari prompt
 * - Create new workflow dari scratch
 * - Modify existing workflow (add platforms)
 */
export function useWorkflowGenerator(): UseWorkflowGeneratorReturn {
  // Create base workflow nodes
  const createBaseNodes = (prompt: string): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } => {
    const promptLower = prompt.toLowerCase();
    
    // Detect if user wants video or image
    const isVideoRequest = 
      promptLower.includes('video') || 
      promptLower.includes('cinematic') || 
      promptLower.includes('motion') ||
      promptLower.includes('animate') ||
      promptLower.includes('moving') ||
      promptLower.includes('film') ||
      promptLower.includes('movie');
    
    const nodes: WorkflowNode[] = [
      {
        id: 'node-1',
        type: 'prompt-text',
        position: { x: DEFAULT_POSITIONS.startX, y: DEFAULT_POSITIONS.startY },
        data: {
          type: 'prompt-text',
          promptText: prompt,
        },
      },
      {
        id: 'node-2',
        type: isVideoRequest ? 'prompt-enhancer-video' : 'prompt-enhancer-image',
        position: { x: DEFAULT_POSITIONS.startX + DEFAULT_POSITIONS.nodeSpacing, y: DEFAULT_POSITIONS.startY },
        data: {
          type: isVideoRequest ? 'prompt-enhancer-video' : 'prompt-enhancer-image',
          userPrompt: prompt,
        },
      },
      {
        id: 'node-3',
        type: isVideoRequest ? 'wan2-video' : 'wan2',
        position: { x: DEFAULT_POSITIONS.startX + DEFAULT_POSITIONS.nodeSpacing * 2, y: DEFAULT_POSITIONS.startY },
        data: {
          type: isVideoRequest ? 'wan2-video' : 'wan2',
          model: isVideoRequest ? 'wan2-video' : 'wan2.1-t2i-turbo',
          size: '1024*1024',
        },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' },
    ];

    // Add preview node
    nodes.push({
      id: 'node-preview',
      type: 'preview',
      position: { x: DEFAULT_POSITIONS.startX + DEFAULT_POSITIONS.nodeSpacing * 3, y: DEFAULT_POSITIONS.startY },
      data: {
        type: 'preview',
        mediaType: isVideoRequest ? 'video' : 'image',
        showMetadata: true,
      },
    });
    edges.push({ id: 'edge-preview', source: 'node-3', target: 'node-preview' });

    return { nodes, edges };
  };

  // Add platform nodes to workflow
  const addPlatformNodes = (
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    prompt: string,
    previewNodeId: string
  ): void => {
    const promptLower = prompt.toLowerCase();
    const platforms = [
      { keyword: ['twitter', 'x'], type: 'twitter', label: 'Twitter' },
      { keyword: ['instagram', 'ig'], type: 'instagram', label: 'Instagram' },
      { keyword: ['facebook', 'fb'], type: 'facebook', label: 'Facebook' },
      { keyword: ['tiktok', 'tik tok'], type: 'tiktok', label: 'TikTok' },
      { keyword: ['youtube', 'yt'], type: 'youtube', label: 'YouTube' },
    ];

    let currentY = DEFAULT_POSITIONS.startY - 50;

    platforms.forEach(({ keyword, type, label }) => {
      const isRequested = keyword.some(k => promptLower.includes(k));
      const alreadyExists = nodes.some(n => n.type === type);

      if (isRequested && !alreadyExists) {
        const nodeId = `node-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        nodes.push({
          id: nodeId,
          type,
          position: { x: DEFAULT_POSITIONS.startX + DEFAULT_POSITIONS.nodeSpacing * 4, y: currentY },
          data: {
            type,
            authenticated: false,
          },
        });
        edges.push({
          id: `edge-${type}-${Date.now()}`,
          source: previewNodeId,
          target: nodeId,
        });
        currentY += DEFAULT_POSITIONS.platformSpacing;
      }
    });
  };

  // Generate new workflow from scratch
  const generateNewWorkflow = useCallback((prompt: string): Workflow => {
    const { nodes, edges } = createBaseNodes(prompt);
    addPlatformNodes(nodes, edges, prompt, 'node-preview');

    return {
      id: `workflow-${Date.now()}`,
      name: 'AI Generated Workflow',
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  // Modify existing workflow (add platforms)
  const modifyExistingWorkflow = useCallback((
    existingWorkflow: Workflow,
    prompt: string
  ): Workflow => {
    const nodes = [...existingWorkflow.nodes];
    const edges = [...existingWorkflow.edges];

    const previewNode = nodes.find(n => n.type === 'preview');
    if (!previewNode) {
      return generateNewWorkflow(prompt);
    }

    const initialNodeCount = nodes.length;
    addPlatformNodes(nodes, edges, prompt, previewNode.id);

    // If no changes made, return original
    if (nodes.length === initialNodeCount) {
      return existingWorkflow;
    }

    return {
      ...existingWorkflow,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };
  }, [generateNewWorkflow]);

  // Main workflow generation logic
  const generateWorkflowFromPrompt = useCallback((
    prompt: string,
    existingWorkflow?: Workflow
  ): Workflow => {
    const promptLower = prompt.toLowerCase();
    
    // Detect modification requests (add platform to existing workflow)
    const isModificationRequest =
      promptLower.includes('post to') ||
      promptLower.includes('post it to') ||
      promptLower.includes('add') ||
      promptLower.includes('also') ||
      promptLower.includes('and post') ||
      promptLower.includes('share on') ||
      promptLower.includes('upload to') ||
      promptLower.includes('twitter') ||
      promptLower.includes('instagram') ||
      promptLower.includes('facebook') ||
      promptLower.includes('tiktok') ||
      promptLower.includes('youtube');

    if (existingWorkflow && existingWorkflow.nodes.length > 0 && isModificationRequest) {
      return modifyExistingWorkflow(existingWorkflow, prompt);
    }

    return generateNewWorkflow(prompt);
  }, [generateNewWorkflow, modifyExistingWorkflow]);

  return {
    generateNewWorkflow,
    modifyExistingWorkflow,
    generateWorkflowFromPrompt,
  };
}
