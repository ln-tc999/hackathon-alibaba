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

      let mediaUrl: string;
      let mediaType: 'image' | 'video' = 'image';
      const input = inputValues[0];

      // Handle different input formats
      if (typeof input === 'string') {
        // Direct URL string
        mediaUrl = input;
      } else if (typeof input === 'object' && input !== null) {
        // Object from Wan2Handler or video handler
        if ('imageUrl' in input) {
          mediaUrl = input.imageUrl;
          mediaType = 'image';
        } else if ('videoUrl' in input) {
          mediaUrl = input.videoUrl;
          mediaType = 'video';
        } else {
          const endTime = new Date().toISOString();
          return {
            nodeId: node.id,
            status: 'error',
            error: 'Invalid input format. Expected object with imageUrl or videoUrl property.',
            startTime,
            endTime,
            duration: new Date(endTime).getTime() - new Date(startTime).getTime()
          };
        }
      } else {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Invalid media input. Expected string URL or object with imageUrl/videoUrl.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      if (!mediaUrl || !mediaUrl.trim()) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Empty media URL received.',
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

      console.log(`[PreviewHandler] Preview ${mediaType}:`, mediaUrl);

      // Pass through the media URL with metadata
      const output: any = {
        mediaUrl,
        mediaType,
        previewUrl: mediaUrl,
      };

      // Add imageUrl or videoUrl for social media handlers
      if (mediaType === 'image') {
        output.imageUrl = mediaUrl;
      } else if (mediaType === 'video') {
        output.videoUrl = mediaUrl;
      }

      // Pass through additional properties from input
      if (typeof input === 'object' && input !== null) {
        for (const [key, value] of Object.entries(input)) {
          if (!output[key] && value !== undefined && value !== null) {
            output[key] = value;
          }
        }
      }

      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output,
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