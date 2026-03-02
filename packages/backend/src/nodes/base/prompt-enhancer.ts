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

    // Use Qwen for prompt enhancement via DashScope
    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
      return this.createErrorResult(
        node.id,
        'DASHSCOPE_API_KEY environment variable is required for prompt enhancement',
        startTime
      );
    }

    try {
      const enhancedPrompt = await this.enhancePrompt(userPrompt, dashscopeApiKey);
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
    // Use Qwen via OpenAI-compatible endpoint
    const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
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
      throw new Error(`Qwen API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json() as any;
    const enhancedPrompt = result.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt');
    }

    return enhancedPrompt;
  }
}
