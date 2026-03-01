import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
} from '@vlowgen/shared';
import { NodeHandler } from './handler';

export abstract class BasePromptEnhancer implements NodeHandler {
  abstract get systemPrompt(): string;
  abstract get enhancerType(): 'image' | 'video';

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

  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();
    const data = node.data as any;
    const { userPrompt } = data;

    if (!userPrompt || userPrompt.trim() === '') {
      return this.createErrorResult(node.id, 'User prompt is required', startTime);
    }

    const openRouterApiKey = context.credentials.openRouterApiKey;
    if (!openRouterApiKey) {
      return this.createErrorResult(
        node.id,
        'OpenRouter API key is required for prompt enhancement',
        startTime
      );
    }

    try {
      const enhancedPrompt = await this.enhancePrompt(userPrompt, openRouterApiKey);
      return this.createSuccessResult(node.id, { enhancedPrompt }, startTime);
    } catch (error) {
      return this.createErrorResult(
        node.id,
        `Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }

  private async enhancePrompt(userPrompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vlowgen.com',
        'X-Title': 'VlowGen Prompt Enhancer',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json() as any;
    const enhancedPrompt = result.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt');
    }

    return enhancedPrompt;
  }
}
