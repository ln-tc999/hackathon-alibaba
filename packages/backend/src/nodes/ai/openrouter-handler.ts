/**
 * OpenRouter Node Handler
 * 
 * Handles execution of openrouter nodes which generate images from text prompts
 * using OpenRouter AI service.
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  OpenRouterNodeData
} from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';
import { OpenRouterClient } from '../../integrations/openrouter';

export class OpenRouterNodeHandler implements NodeHandler {
  private openRouterClient: OpenRouterClient | null = null;

  /**
   * Execute an openrouter node
   * 
   * @param node - The openrouter node to execute
   * @param inputs - Input data from upstream nodes (should contain prompt text)
   * @param context - Execution context with credentials
   * @returns Promise resolving to node execution result
   */
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Extract prompt from input data
      // Input should come from upstream prompt-text node
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to OpenRouter node. Connect a prompt-text node.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Get the prompt text from the first input
      const prompt = inputValues[0];

      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Invalid prompt input. Expected non-empty string.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Get OpenRouter API credentials
      if (!context.credentials.openRouterApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'OpenRouter API key not provided in execution context',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize OpenRouter client if not already done
      if (!this.openRouterClient) {
        this.openRouterClient = new OpenRouterClient(context.credentials.openRouterApiKey);
      }

      // Extract node configuration
      const nodeData = node.data as OpenRouterNodeData;

      // Call OpenRouterClient with prompt and node configuration
      const result = await this.openRouterClient.generateImage({
        prompt,
        model: nodeData.model,
        width: nodeData.width,
        height: nodeData.height,
        negative_prompt: nodeData.negative_prompt
      });

      // Return image URL in output
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: result.imageUrl,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      // Propagate errors from OpenRouter service
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in OpenRouter node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}