/**
 * Wan2.1 Node Handler
 * 
 * Handles execution of wan2 nodes which generate images from text prompts
 * using Alibaba Cloud's Wan2.1 AI service.
 * 
 * Requirements: 9.1, 9.2
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  Wan2NodeData
} from '@vlowgen/shared';
import { NodeHandler } from './handler';
import { Wan2Client } from '../integrations/wan2';

export class Wan2NodeHandler implements NodeHandler {
  private wan2Client: Wan2Client | null = null;

  /**
   * Execute a wan2 node
   * 
   * @param node - The wan2 node to execute
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
      // Extract prompt from input data (Requirement 9.1)
      // Input should come from upstream prompt-text node
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Wan2 node. Connect a prompt-text node.',
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

      // Get Wan2 API credentials
      if (!context.credentials.wan2ApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Wan2 API key not provided in execution context',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize Wan2 client if not already done
      if (!this.wan2Client) {
        this.wan2Client = new Wan2Client(context.credentials.wan2ApiKey);
      }

      // Extract node configuration
      const nodeData = node.data as Wan2NodeData;

      // Call Wan2Client with prompt and node configuration (Requirement 9.1)
      const result = await this.wan2Client.generateImage({
        prompt,
        model: nodeData.model,
        size: nodeData.size,
        style: nodeData.style
      });

      // Return image URL in output (Requirement 9.2)
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
      // Propagate errors from Wan2 service (Requirement 9.4)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Wan2 node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
