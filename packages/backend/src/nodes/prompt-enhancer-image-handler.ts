import type { PromptEnhancerImageNodeData, WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from './handler';

/**
 * System prompt for Image Prompt Enhancement
 * Based on PROMPT.md specification
 */
const IMAGE_ENHANCEMENT_SYSTEM_PROMPT = `You are a Master Art Director and Expert AI Prompt Engineer.
Your task is to take the user's short idea and expand it into a highly detailed, descriptive prompt optimized for a high-end AI image generator (like Midjourney or Wan2.1).

RULES:
1. Describe the main subject in detail (features, clothing, expression).
2. Describe the environment and background.
3. Specify the lighting (e.g., cinematic lighting, neon glow, golden hour, volumetric rays).
4. Specify the camera angle and style (e.g., 8k resolution, photorealistic, 35mm lens, macro photography, unreal engine 5 render).
5. DO NOT write conversational text. Output ONLY the final enhanced prompt in English.`;

export class PromptEnhancerImageHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();
    const data = node.data as PromptEnhancerImageNodeData;
    const { userPrompt } = data;

    if (!userPrompt || userPrompt.trim() === '') {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: 'User prompt is required',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }

    // Use OpenRouter API to enhance the prompt
    const openRouterApiKey = context.credentials.openRouterApiKey;
    if (!openRouterApiKey) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: 'OpenRouter API key is required for prompt enhancement',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://vlowgen.com',
          'X-Title': 'VlowGen Prompt Enhancer',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: IMAGE_ENHANCEMENT_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `OpenRouter API error: ${errorData.error?.message || response.statusText}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      const result = await response.json() as any;
      const enhancedPrompt = result.choices[0]?.message?.content?.trim();

      if (!enhancedPrompt) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Failed to generate enhanced prompt',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: { enhancedPrompt },
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: `Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
