/**
 * Prompt Text Node Handler
 * 
 * Handles execution of prompt-text nodes which capture and output user text input.
 * Validates that input is non-empty and not only whitespace.
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  PromptTextNodeData
} from '@vlowgen/shared';
import { NodeHandler } from './handler';

export class PromptTextNodeHandler implements NodeHandler {
  /**
   * Execute a prompt-text node
   * 
   * @param node - The prompt-text node to execute
   * @param inputs - Input data from upstream nodes (unused for prompt-text nodes)
   * @param context - Execution context
   * @returns Promise resolving to node execution result
   */
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Extract prompt text from node data
      const nodeData = node.data as PromptTextNodeData;
      const promptText = nodeData.promptText;

      // Validate that text input is not empty (Requirement 8.2)
      if (!promptText || promptText.trim().length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Prompt text cannot be empty or only whitespace',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Output the user-entered text as a string (Requirement 8.1)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: promptText,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in prompt-text node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
