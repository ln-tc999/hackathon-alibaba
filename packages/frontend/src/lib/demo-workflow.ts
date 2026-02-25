import type { Workflow } from '@vlowgen/shared';

/**
 * Demo workflow for VlowGen platform
 * Contains three nodes: Prompt Text → Wan2.1 → Twitter
 * Demonstrates end-to-end content generation and distribution
 * 
 * Validates: Requirements 12.1
 */
export const DEMO_WORKFLOW: Workflow = {
  id: 'demo-workflow',
  name: 'Demo: Text to Image to Twitter',
  nodes: [
    {
      id: 'prompt-node',
      type: 'prompt-text',
      position: { x: 100, y: 200 },
      data: {
        type: 'prompt-text',
        promptText: 'A futuristic city at sunset',
      },
    },
    {
      id: 'wan2-node',
      type: 'wan2',
      position: { x: 400, y: 200 },
      data: {
        type: 'wan2',
        model: 'wanx-v1',
        size: '1024x1024',
      },
    },
    {
      id: 'twitter-node',
      type: 'twitter',
      position: { x: 700, y: 200 },
      data: {
        type: 'twitter',
        authenticated: false,
      },
    },
  ],
  edges: [
    {
      id: 'edge-prompt-wan2',
      source: 'prompt-node',
      target: 'wan2-node',
    },
    {
      id: 'edge-wan2-twitter',
      source: 'wan2-node',
      target: 'twitter-node',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
