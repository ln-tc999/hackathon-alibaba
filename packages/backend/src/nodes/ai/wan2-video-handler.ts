/**
 * Wan2 Video Node Handler
 * 
 * Handles execution of wan2-video nodes which generate videos from text prompts
 * using Alibaba Cloud's Wan2 Video AI service.
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  Wan2VideoNodeData
} from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';
import { Wan2VideoClient } from '../../integrations/wan2-video';
import { rateLimiter } from '../../services/rate-limiter.service';

export class Wan2VideoNodeHandler implements NodeHandler {
  private wan2VideoClient: Wan2VideoClient | null = null;

  /**
   * Execute a wan2-video node
   * 
   * @param node - The wan2-video node to execute
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
      // Check rate limit
      const userId = context.userId || 'anonymous';
      const rateLimit = rateLimiter.checkLimit(userId, 'videoGeneration');
      
      if (!rateLimit.allowed) {
        const endTime = new Date().toISOString();
        const resetDate = new Date(rateLimit.resetAt).toLocaleString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `Rate limit exceeded. You can generate ${rateLimiter['configs'].videoGeneration.maxRequests} videos per day. Resets at ${resetDate}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Extract prompt from input data
      const inputValues = Object.values(inputs);
      
      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Wan2 Video node. Connect a prompt-text node.',
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

      // Get DashScope API key from environment
      const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
      
      if (!dashscopeApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'DASHSCOPE_API_KEY environment variable is required for Wan2 video generation',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize Wan2 Video client if not already done
      if (!this.wan2VideoClient) {
        this.wan2VideoClient = new Wan2VideoClient(dashscopeApiKey);
      }

      // Extract node configuration
      const nodeData = node.data as Wan2VideoNodeData;

      // Call Wan2VideoClient with prompt and node configuration
      const result = await this.wan2VideoClient.generateVideo({
        prompt,
        model: nodeData.model,
        size: nodeData.size,
        negativePrompt: nodeData.negativePrompt
      });

      // Return video URL in output
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: result.videoUrl,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Wan2 Video node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
