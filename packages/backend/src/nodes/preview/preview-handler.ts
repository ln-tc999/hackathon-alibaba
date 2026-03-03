/**
 * Preview Node Handler
 * 
 * Displays preview of generated media (image/video) before posting to social media.
 * Acts as a pass-through node that stores the media URL for preview.
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  PreviewNodeData
} from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';

export class PreviewNodeHandler implements NodeHandler {
  /**
   * Execute preview node - pass through media URL and store for preview
   * 
   * @param node - The preview node
   * @param inputs - Input data (should contain image or video URL)
   * @param context - Execution context
   * @returns Promise resolving to node execution result with media URL
   */
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get media URL from input
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Preview node. Connect an image or video generation node.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      const mediaUrl = inputValues[0];

      if (typeof mediaUrl !== 'string' || !mediaUrl.trim()) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Invalid media URL. Expected non-empty string.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Validate URL format
      try {
        new URL(mediaUrl);
      } catch {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `Invalid URL format: ${mediaUrl}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Pass through the media URL
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: mediaUrl,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };

    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Preview node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}