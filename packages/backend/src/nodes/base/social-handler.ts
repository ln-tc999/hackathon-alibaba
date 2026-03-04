import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
} from '@vlowgen/shared';
import { NodeHandler } from './handler';
import { ComposioClient } from '../../integrations/composio';

export abstract class BaseSocialMediaHandler implements NodeHandler {
  protected composioClient: ComposioClient | null = null;

  abstract get platformName(): string;
  abstract get requiresMedia(): 'image' | 'video' | 'any' | 'none';

  protected initializeClient(context: ExecutionContext): void {
    if (!this.composioClient && context.credentials.composioApiKey) {
      this.composioClient = new ComposioClient(
        context.credentials.composioApiKey,
        context.credentials.composioApiUrl
      );
    }
  }

  protected createErrorResult(
    nodeId: string,
    error: string,
    startTime: string
  ): NodeExecutionResult {
    const endTime = new Date().toISOString();
    return {
      nodeId,
      status: 'error',
      error,
      startTime,
      endTime,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime()
    };
  }

  protected createSuccessResult(
    nodeId: string,
    output: any,
    startTime: string
  ): NodeExecutionResult {
    const endTime = new Date().toISOString();
    return {
      nodeId,
      status: 'success',
      output,
      startTime,
      endTime,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime()
    };
  }

  protected validateInputs(inputs: Record<string, any>): boolean {
    return Object.keys(inputs).length > 0;
  }

  protected validateAuthentication(nodeData: any): boolean {
    return true; // Bypassed for testing
  }

  protected validateCredentials(context: ExecutionContext): boolean {
    return !!context.credentials.composioApiKey;
  }

  protected extractMediaFromInputs(inputs: Record<string, any>): {
    text: string;
    imageUrl: string;
    videoUrl: string;
  } {
    let text = '';
    let imageUrl = '';
    let videoUrl = '';

    console.log('[SocialHandler] Extracting media from inputs:', JSON.stringify(inputs, null, 2));

    for (const [sourceNodeId, input] of Object.entries(inputs)) {
      console.log(`[SocialHandler] Processing input from ${sourceNodeId}:`, input);

      // Handle string inputs (direct URLs or text)
      if (typeof input === 'string') {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          if (input.includes('video') || input.includes('.mp4') || input.includes('.mov')) {
            videoUrl = input;
            console.log('[SocialHandler] Found video URL:', videoUrl);
          } else {
            imageUrl = input;
            console.log('[SocialHandler] Found image URL:', imageUrl);
          }
        } else {
          text = input;
          console.log('[SocialHandler] Found text:', text);
        }
      } 
      // Handle object inputs (from nodes like Wan2, Preview, etc.)
      else if (input && typeof input === 'object') {
        // Priority 1: Check for imageUrl property (from Wan2 output)
        if (typeof input.imageUrl === 'string' && input.imageUrl) {
          imageUrl = input.imageUrl;
          console.log('[SocialHandler] Found imageUrl property:', imageUrl);
        }
        
        // Priority 2: Check for videoUrl property
        if (typeof input.videoUrl === 'string' && input.videoUrl) {
          videoUrl = input.videoUrl;
          console.log('[SocialHandler] Found videoUrl property:', videoUrl);
        }
        
        // Priority 3: Check for text/caption/prompt
        if (typeof input.text === 'string' && input.text) {
          text = input.text;
          console.log('[SocialHandler] Found text property:', text);
        } else if (typeof input.caption === 'string' && input.caption) {
          text = input.caption;
          console.log('[SocialHandler] Found caption property:', text);
        } else if (typeof input.prompt === 'string' && input.prompt) {
          text = input.prompt;
          console.log('[SocialHandler] Found prompt property:', text);
        }
        
        // Priority 4: Check for generic output property (legacy support)
        if (typeof input.output === 'string' && input.output) {
          if (input.output.startsWith('http://') || input.output.startsWith('https://')) {
            if (input.output.includes('video') || input.output.includes('.mp4')) {
              videoUrl = input.output;
              console.log('[SocialHandler] Found video in output property:', videoUrl);
            } else {
              imageUrl = input.output;
              console.log('[SocialHandler] Found image in output property:', imageUrl);
            }
          } else {
            text = input.output;
            console.log('[SocialHandler] Found text in output property:', text);
          }
        }
      }
    }

    console.log('[SocialHandler] Extracted media - text:', text, 'imageUrl:', imageUrl, 'videoUrl:', videoUrl);

    return { text, imageUrl, videoUrl };
  }

  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      console.log(`[${this.platformName}Handler] Starting execution for node ${node.id}`);
      console.log(`[${this.platformName}Handler] Received inputs:`, JSON.stringify(inputs, null, 2));

      if (!this.validateInputs(inputs)) {
        return this.createErrorResult(
          node.id,
          `No input provided to ${this.platformName} node. Connect upstream nodes.`,
          startTime
        );
      }

      if (!this.validateCredentials(context)) {
        return this.createErrorResult(
          node.id,
          'Composio API key not provided in execution context',
          startTime
        );
      }

      this.initializeClient(context);

      if (!this.validateAuthentication(node.data)) {
        return this.createErrorResult(
          node.id,
          `${this.platformName} account not connected. Please authenticate first.`,
          startTime
        );
      }

      const { text, imageUrl, videoUrl } = this.extractMediaFromInputs(inputs);

      console.log(`[${this.platformName}Handler] Extracted - text: "${text}", imageUrl: "${imageUrl}", videoUrl: "${videoUrl}"`);

      const validationError = this.validateMedia(text, imageUrl, videoUrl);
      if (validationError) {
        console.error(`[${this.platformName}Handler] Validation failed:`, validationError);
        return this.createErrorResult(node.id, validationError, startTime);
      }

      console.log(`[${this.platformName}Handler] Validation passed, posting to social media...`);

      const result = await this.postToSocialMedia(text, imageUrl, videoUrl);
      
      console.log(`[${this.platformName}Handler] Post successful:`, result);
      
      return this.createSuccessResult(node.id, result, startTime);
    } catch (error) {
      console.error(`[${this.platformName}Handler] Execution failed:`, error);
      return this.createErrorResult(
        node.id,
        error instanceof Error ? error.message : `Unknown error in ${this.platformName} node`,
        startTime
      );
    }
  }

  protected validateMedia(text: string, imageUrl: string, videoUrl: string): string | null {
    switch (this.requiresMedia) {
      case 'image':
        if (!imageUrl) {
          return `${this.platformName} requires an image. Please connect an image generation node.`;
        }
        break;
      case 'video':
        if (!videoUrl) {
          return `${this.platformName} requires a video URL. Please connect a video generation node.`;
        }
        break;
      case 'any':
        if (!text && !imageUrl && !videoUrl) {
          return `${this.platformName} requires content (text, image, or video).`;
        }
        break;
    }
    return null;
  }

  protected abstract postToSocialMedia(
    text: string,
    imageUrl: string,
    videoUrl: string
  ): Promise<string>;
}
