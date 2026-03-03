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
import { NodeHandler } from '../base/handler';
import { Wan2Client } from '../../integrations/wan2';
import { rateLimiter } from '../../services/rate-limiter.service';
import { minioService } from '../../services/minio.service';
import { imageHistoryService } from '../../services/image-history.service';
import { randomUUID } from 'crypto';

export class Wan2NodeHandler implements NodeHandler {
  private wan2Client: Wan2Client | null = null;

  /**
   * Generate smart negative prompt based on positive prompt context
   * Uses AI-powered analysis to determine what to avoid
   */
  private generateSmartNegativePrompt(prompt: string, style?: string): string {
    const baseNegatives = [
      'blurry',
      'low quality',
      'distorted',
      'ugly',
      'bad anatomy',
      'watermark',
      'text',
      'signature',
      'low resolution',
      'pixelated',
      'jpeg artifacts'
    ];

    const contextualNegatives: string[] = [];

    // Analyze prompt for context
    const lowerPrompt = prompt.toLowerCase();

    // For human/portrait content
    if (lowerPrompt.match(/\b(person|people|human|face|portrait|selfie|man|woman|child)\b/)) {
      contextualNegatives.push(
        'deformed face',
        'extra fingers',
        'extra limbs',
        'missing fingers',
        'mutated hands',
        'poorly drawn face',
        'poorly drawn hands',
        'disfigured'
      );
    }

    // For landscape/nature content
    if (lowerPrompt.match(/\b(landscape|nature|mountain|forest|ocean|sky|sunset|sunrise)\b/)) {
      contextualNegatives.push(
        'overexposed',
        'underexposed',
        'washed out colors',
        'unnatural colors'
      );
    }

    // For product/commercial content
    if (lowerPrompt.match(/\b(product|commercial|advertisement|brand|logo)\b/)) {
      contextualNegatives.push(
        'copyright',
        'trademark',
        'brand name',
        'text overlay'
      );
    }

    // For architectural content
    if (lowerPrompt.match(/\b(building|architecture|house|interior|room)\b/)) {
      contextualNegatives.push(
        'crooked lines',
        'distorted perspective',
        'unrealistic proportions'
      );
    }

    // Style-specific negatives
    if (style) {
      const lowerStyle = style.toLowerCase();
      
      if (lowerStyle.includes('photorealistic') || lowerStyle.includes('realistic')) {
        contextualNegatives.push(
          'cartoon',
          'anime',
          'illustration',
          'painting',
          'drawing',
          'sketch'
        );
      }
      
      if (lowerStyle.includes('anime') || lowerStyle.includes('manga')) {
        contextualNegatives.push(
          'realistic',
          'photorealistic',
          '3d render'
        );
      }
    }

    // Combine and deduplicate
    const allNegatives = [...baseNegatives, ...contextualNegatives];
    const uniqueNegatives = [...new Set(allNegatives)];

    return uniqueNegatives.join(', ');
  }

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
      // Check rate limit
      const userId = context.userId || 'anonymous';
      const rateLimit = rateLimiter.checkLimit(userId, 'imageGeneration');

      if (!rateLimit.allowed) {
        const endTime = new Date().toISOString();
        const resetDate = new Date(rateLimit.resetAt).toLocaleString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `Rate limit exceeded. You can generate ${rateLimiter['configs'].imageGeneration.maxRequests} images per day. Resets at ${resetDate}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

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
      let prompt = inputValues[0];

      // Handle input from prompt enhancer node (which returns an object { enhancedPrompt: string })
      if (typeof prompt === 'object' && prompt !== null && 'enhancedPrompt' in prompt) {
        prompt = prompt.enhancedPrompt;
      }

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

      // Get DashScope API key from environment (same key used for Qwen and Wan2)
      const dashscopeApiKey = process.env.DASHSCOPE_API_KEY || context.credentials.wan2ApiKey;

      console.log('[Wan2Handler] Using API key:', dashscopeApiKey ? dashscopeApiKey.substring(0, 10) + '...' : 'NOT FOUND');

      if (!dashscopeApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'DASHSCOPE_API_KEY environment variable is required for Wan2 image generation',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize Wan2 client if not already done
      if (!this.wan2Client) {
        this.wan2Client = new Wan2Client(dashscopeApiKey);
      }

      // Extract node configuration
      const nodeData = node.data as Wan2NodeData;

      // Auto-generate smart negative prompt based on positive prompt
      const smartNegativePrompt = this.generateSmartNegativePrompt(prompt, nodeData.style);

      console.log('[Wan2Handler] Auto-generated negative prompt:', smartNegativePrompt);

      // Call Wan2Client with prompt and node configuration (Requirement 9.1)
      const result = await this.wan2Client.generateImage({
        prompt,
        negativePrompt: smartNegativePrompt,
        model: nodeData.model,
        size: nodeData.size,
        style: nodeData.style
      });

      console.log('[Wan2Handler] Image generated, uploading to MinIO...');

      // Upload image to MinIO for persistent storage
      const fileName = `wan2-${node.id}-${Date.now()}`;
      const minioUrl = await minioService.uploadImageFromUrl(result.imageUrl, fileName);

      console.log('[Wan2Handler] Image uploaded to MinIO:', minioUrl);

      // Save to image history for workflow continuation
      const imageId = randomUUID();
      imageHistoryService.addImage({
        id: imageId,
        nodeId: node.id,
        workflowId: context.workflowId || 'unknown',
        executionId: context.executionId || 'unknown',
        minioUrl,
        dashscopeUrl: result.imageUrl,
        prompt,
        negativePrompt: smartNegativePrompt,
        model: nodeData.model || 'wan2.1-t2i-turbo',
        size: nodeData.size || '1024*1024',
        timestamp: new Date().toISOString(),
        userId: context.userId,
      });

      console.log('[Wan2Handler] Image saved to history:', imageId);

      // Return MinIO URL in output (Requirement 9.2)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: {
          imageUrl: minioUrl,
          imageId,
          prompt,
          model: nodeData.model || 'wan2.1-t2i-turbo',
        },
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
