import { describe, it, expect } from 'vitest';
import { DEMO_WORKFLOW } from './demo-workflow';

/**
 * Unit tests for demo workflow data structure
 * Validates: Requirements 12.1
 */
describe('Demo Workflow', () => {
  it('should have correct workflow structure', () => {
    expect(DEMO_WORKFLOW.id).toBe('demo-workflow');
    expect(DEMO_WORKFLOW.name).toBe('Demo: Text to Image to Twitter');
    expect(DEMO_WORKFLOW.nodes).toHaveLength(3);
    expect(DEMO_WORKFLOW.edges).toHaveLength(2);
  });

  it('should have prompt text node with correct configuration', () => {
    const promptNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'prompt-text');
    expect(promptNode).toBeDefined();
    expect(promptNode?.id).toBe('prompt-node');
    expect(promptNode?.data.type).toBe('prompt-text');
    expect(promptNode?.data).toHaveProperty('promptText', 'A futuristic city at sunset, digital art');
  });

  it('should have OpenRouter node with correct configuration', () => {
    const openRouterNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'openrouter');
    expect(openRouterNode).toBeDefined();
    expect(openRouterNode?.id).toBe('openrouter-node');
    expect(openRouterNode?.data.type).toBe('openrouter');
    expect(openRouterNode?.data).toHaveProperty('model', 'black-forest-labs/flux-1.1-pro');
    expect(openRouterNode?.data).toHaveProperty('width', 1024);
    expect(openRouterNode?.data).toHaveProperty('height', 1024);
  });

  it('should have Twitter node', () => {
    const twitterNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'twitter');
    expect(twitterNode).toBeDefined();
    expect(twitterNode?.id).toBe('twitter-node');
    expect(twitterNode?.data.type).toBe('twitter');
  });

  it('should have correct edge connections', () => {
    const edge1 = DEMO_WORKFLOW.edges.find((e) => e.id === 'edge-prompt-openrouter');
    expect(edge1).toBeDefined();
    expect(edge1?.source).toBe('prompt-node');
    expect(edge1?.target).toBe('openrouter-node');

    const edge2 = DEMO_WORKFLOW.edges.find((e) => e.id === 'edge-openrouter-twitter');
    expect(edge2).toBeDefined();
    expect(edge2?.source).toBe('openrouter-node');
    expect(edge2?.target).toBe('twitter-node');
  });

  it('should form a valid pipeline: Prompt → OpenRouter → Twitter', () => {
    // Verify the workflow forms a linear pipeline
    const promptNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'prompt-text');
    const openRouterNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'openrouter');
    const twitterNode = DEMO_WORKFLOW.nodes.find((n) => n.type === 'twitter');

    const edge1 = DEMO_WORKFLOW.edges.find(
      (e) => e.source === promptNode?.id && e.target === openRouterNode?.id
    );
    const edge2 = DEMO_WORKFLOW.edges.find(
      (e) => e.source === openRouterNode?.id && e.target === twitterNode?.id
    );

    expect(edge1).toBeDefined();
    expect(edge2).toBeDefined();
  });

  it('should have valid node positions', () => {
    DEMO_WORKFLOW.nodes.forEach((node) => {
      expect(node.position).toBeDefined();
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
      expect(node.position.x).toBeGreaterThanOrEqual(0);
      expect(node.position.y).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have timestamps', () => {
    expect(DEMO_WORKFLOW.createdAt).toBeDefined();
    expect(DEMO_WORKFLOW.updatedAt).toBeDefined();
    expect(new Date(DEMO_WORKFLOW.createdAt).toString()).not.toBe('Invalid Date');
    expect(new Date(DEMO_WORKFLOW.updatedAt).toString()).not.toBe('Invalid Date');
  });
});