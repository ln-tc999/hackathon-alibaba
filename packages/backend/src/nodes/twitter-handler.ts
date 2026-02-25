/**
 * Twitter Node Handler
 * 
 * Handles execution of twitter nodes which post content to Twitter
 * via the Composio integration platform.
 * 
 * Requirements: 10.1, 10.2, 10.3
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  TwitterNodeData
} from '@vlowgen/shared';
import { NodeHandler } from './handler';
import { ComposioClient } from '../integrations/composio';

export class TwitterNodeHandler implements NodeHandler {
  private composioClient: ComposioClient | null = null;

  /**
   * Execute a twitter node
   * 
   * @param node - The twitter node to execute
   * @param inputs - Input data from upstream nodes (text and/or image)
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
      // Extract text and image data from inputs (Requirements 10.1, 10.2)
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Twitter node. Connect upstream nodes.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Determine if inputs contain text or image URL
      // First input could be text (from prompt-text) or image URL (from wan2)
      // For MVP, we support single input which could be either text or image URL
      let text: string | undefined;
      let imageUrl: string | undefined;

      // Check each input to determine type
      for (const input of inputValues) {
        if (typeof input === 'string') {
          // If it looks like a URL, treat as image URL
          if (input.startsWith('http://') || input.startsWith('https://')) {
            imageUrl = input;
          } else {
            // Otherwise treat as text
            text = input;
          }
        }
      }

      // Validate we have at least one type of content
      if (!text && !imageUrl) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No valid text or image URL provided to Twitter node',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Get Twitter token from credentials
      if (!context.credentials.twitterToken) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Twitter authentication token not provided in execution context',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

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
        this.composioClient = new ComposioClient(context.credentials.composioApiKey);
      }

      // Call ComposioClient to post to Twitter (Requirement 10.1)
      const result = await this.composioClient.postToTwitter({
        text,
        imageUrl,
        token: context.credentials.twitterToken
      });

      // Return tweet URL in output (Requirement 10.3)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: result.tweetUrl,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      // Propagate errors from Composio service (Requirement 10.5)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Twitter node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
