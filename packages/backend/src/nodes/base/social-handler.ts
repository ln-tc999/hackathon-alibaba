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
    return nodeData.authenticated === true;
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

    for (const input of Object.values(inputs)) {
      if (typeof input === 'string') {
        if (input.startsWith('http://') || input.startsWith('https://')) {
          if (input.includes('video') || input.includes('.mp4')) {
            videoUrl = input;
          } else {
            imageUrl = input;
          }
        } else {
          text = input;
        }
      } else if (input && typeof input === 'object') {
        if (input.text) text = input.text;
        if (input.imageUrl) imageUrl = input.imageUrl;
        if (input.videoUrl) videoUrl = input.videoUrl;
        if (input.caption) text = input.caption;
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

      const { text, imageUrl, videoUrl } = this.extractMediaFromInputs(inputs);

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
