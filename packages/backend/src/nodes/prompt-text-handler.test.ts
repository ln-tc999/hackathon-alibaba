/**
 * Tests for PromptTextNodeHandler
 * Requirements: 8.1, 8.2, 8.3
 */

import { describe, it, expect } from 'vitest';
import { PromptTextNodeHandler } from './prompt-text-handler';
import { WorkflowNode, ExecutionContext } from '@vlowgen/shared';

describe('PromptTextNodeHandler', () => {
  const handler = new PromptTextNodeHandler();
  
  const mockContext: ExecutionContext = {
    credentials: {}
  };

  const createPromptTextNode = (promptText: string): WorkflowNode => ({
    id: 'test-node-1',
    type: 'prompt-text',
    position: { x: 0, y: 0 },
    data: {
      type: 'prompt-text',
      promptText
    }
  });

  describe('successful execution', () => {
    it('should output the exact input text for valid prompt', async () => {
      // Requirement 8.1: Output user-entered text as string
      const node = createPromptTextNode('Generate a sunset image');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('Generate a sunset image');
      expect(result.nodeId).toBe('test-node-1');
    });

    it('should handle text with special characters', async () => {
      const node = createPromptTextNode('Text with "quotes" and \'apostrophes\'');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('Text with "quotes" and \'apostrophes\'');
    });

    it('should handle text with leading/trailing spaces', async () => {
      const node = createPromptTextNode('  text with spaces  ');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe('  text with spaces  ');
    });

    it('should handle multiline text', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      const node = createPromptTextNode(multilineText);
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('success');
      expect(result.output).toBe(multilineText);
    });
  });

  describe('validation errors', () => {
    it('should return error for empty string', async () => {
      // Requirement 8.2, 8.3: Validate non-empty input
      const node = createPromptTextNode('');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('empty');
    });

    it('should return error for whitespace-only string', async () => {
      // Requirement 8.2, 8.3: Validate not only whitespace
      const node = createPromptTextNode('   ');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('empty');
    });

    it('should return error for tabs and newlines only', async () => {
      const node = createPromptTextNode('\t\n\t\n');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.status).toBe('error');
      expect(result.error).toContain('empty');
    });
  });

  describe('execution metadata', () => {
    it('should include timing information', async () => {
      const node = createPromptTextNode('Test prompt');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should include node ID in result', async () => {
      const node = createPromptTextNode('Test prompt');
      const result = await handler.execute(node, {}, mockContext);

      expect(result.nodeId).toBe('test-node-1');
    });
  });
});
