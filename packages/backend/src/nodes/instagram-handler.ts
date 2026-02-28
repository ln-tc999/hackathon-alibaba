/**
 * Instagram Node Handler
 * 
 * Handles execution of instagram nodes which post content to Instagram
 * using Composio integration.
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  InstagramNodeData
} from '@vlowgen/shared';
import { NodeHandler } from './handler';
import { ComposioClient } from '../integrations/composio';

export class InstagramNodeHandler implements NodeHandler {
  private composioClient: ComposioClient | null = null;

  /**
   * Execute an instagram node
   * 
   * @param node - The instagram node to execute
   * @param inputs - Input data from upstream nodes (should contain content and/or image)
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
      // Extract content from input data
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Instagram node. Connect an image or text node.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Get content from the first input (could be text or image URL)
      const content = inputValues[0];

      // Get Composio API credentials
      if (!context.credentials.composioApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Composio API key not provided in execution context',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize Composio client if not already done
      if (!this.composioClient) {
        this.composioClient = new ComposioClient(
          context.credentials.composioApiKey,
          context.credentials.composioApiUrl
        );
      }

      // Check if node is authenticated
      const nodeData = node.data as InstagramNodeData;
      if (!nodeData.authenticated) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Instagram account not connected. Please authenticate first.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Determine if content is an image URL or text
      const isImageUrl = typeof content === 'string' && 
        (content.startsWith('http://') || content.startsWith('https://'));

      // Post to Instagram
      let result;
      if (isImageUrl) {
        // Post image with optional caption
        result = await this.composioClient.postToInstagram({
          imageUrl: content,
          caption: 'Posted via VlowGen',
        });
      } else {
        // Instagram requires images, so we can't post text-only
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Instagram requires an image. Please connect an image generation node.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Return success with post URL
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: result.postUrl || 'Posted successfully to Instagram',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      // Propagate errors from Composio service
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Instagram node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
