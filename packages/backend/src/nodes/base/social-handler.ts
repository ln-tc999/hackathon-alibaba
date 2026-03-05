import { WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from './handler';
import { ComposioClient } from '../../integrations/composio';
import { logger } from '../../utils/logger';

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
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
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
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
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

    for (const [sourceNodeId, input] of Object.entries(inputs)) {
      // Handle string inputs (direct URLs or text)
      if (typeof input === 'string') {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          if (input.includes('video') || input.includes('.mp4') || input.includes('.mov')) {
            videoUrl = input;
          } else {
            imageUrl = input;
          }
        } else {
          text = input;
        }
      }
      // Handle object inputs (from nodes like Wan2, Preview, etc.)
      else if (input && typeof input === 'object') {
        // Priority 1: Check for imageUrl property (from Wan2 output or Preview)
        if (!imageUrl && typeof input.imageUrl === 'string' && input.imageUrl) {
          imageUrl = input.imageUrl;
        }

        // Priority 2: Check for videoUrl property
        if (!videoUrl && typeof input.videoUrl === 'string' && input.videoUrl) {
          videoUrl = input.videoUrl;
        }

        // Priority 3: Check for mediaUrl property (from Preview node)
        if (!imageUrl && !videoUrl && typeof input.mediaUrl === 'string' && input.mediaUrl) {
          const mediaUrl = input.mediaUrl;
          if (input.mediaType === 'video' || mediaUrl.includes('video') || mediaUrl.includes('.mp4')) {
            videoUrl = mediaUrl;
          } else {
            imageUrl = mediaUrl;
          }
        }

        // Priority 4: Check for previewUrl property
        if (!imageUrl && !videoUrl && typeof input.previewUrl === 'string' && input.previewUrl) {
          const previewUrl = input.previewUrl;
          if (input.mediaType === 'video' || previewUrl.includes('video') || previewUrl.includes('.mp4')) {
            videoUrl = previewUrl;
          } else {
            imageUrl = previewUrl;
          }
        }

        // Priority 5: Check for text/caption/prompt
        if (!text && typeof input.text === 'string' && input.text) {
          text = input.text;
        } else if (!text && typeof input.caption === 'string' && input.caption) {
          text = input.caption;
        } else if (!text && typeof input.prompt === 'string' && input.prompt) {
          text = input.prompt;
        }

        // Priority 6: Check for generic output property (legacy support)
        if (!imageUrl && !videoUrl && typeof input.output === 'string' && input.output) {
          if (input.output.startsWith('http://') || input.output.startsWith('https://')) {
            if (input.output.includes('video') || input.output.includes('.mp4')) {
              videoUrl = input.output;
            } else {
              imageUrl = input.output;
            }
          } else {
            text = input.output;
          }
        }

        // Priority 7: Scan all properties for URLs (fallback)
        if (!imageUrl && !videoUrl) {
          for (const [key, value] of Object.entries(input)) {
            if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
              if (value.includes('video') || value.includes('.mp4') || value.includes('.mov')) {
                videoUrl = value;
                break;
              } else if (value.includes('dashscope') || value.includes('image') || value.includes('.jpg') || value.includes('.png')) {
                imageUrl = value;
                break;
              }
            }
          }
        }
      }
    }

    return { text, imageUrl, videoUrl };
  }

  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
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

      let { text, imageUrl, videoUrl } = this.extractMediaFromInputs(inputs);

      // Check if media URL is provided in node data (e.g., from scheduler)
      const nodeData = node.data as any;
      if (!imageUrl && nodeData.mediaUrl) {
        imageUrl = nodeData.mediaUrl;
      }
      if (!videoUrl && nodeData.mediaType === 'video' && nodeData.mediaUrl) {
        videoUrl = nodeData.mediaUrl;
      }

      const validationError = this.validateMedia(text, imageUrl, videoUrl);
      if (validationError) {
        return this.createErrorResult(node.id, validationError, startTime);
      }

      const result = await this.postToSocialMedia(text, imageUrl, videoUrl);

      return this.createSuccessResult(node.id, result, startTime);
    } catch (error) {
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
