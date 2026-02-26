import type { Workflow } from '@vlowgen/shared';

/**
 * Demo workflow for VlowGen platform
 * Contains three nodes: Prompt Text → OpenRouter → Twitter
 * Demonstrates end-to-end content generation and distribution using OpenRouter
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
        promptText: 'A futuristic city at sunset, digital art',
      },
    },
    {
      id: 'openrouter-node',
      type: 'openrouter',
      position: { x: 400, y: 200 },
      data: {
        type: 'openrouter',
        model: 'black-forest-labs/flux-1.1-pro',
        width: 1024,
        height: 1024,
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
      id: 'edge-prompt-openrouter',
      source: 'prompt-node',
      target: 'openrouter-node',
    },
    {
      id: 'edge-openrouter-twitter',
      source: 'openrouter-node',
      target: 'twitter-node',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
