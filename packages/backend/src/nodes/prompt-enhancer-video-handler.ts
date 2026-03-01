import type { PromptEnhancerVideoNodeData, WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from './handler';

/**
 * System prompt for Video Prompt Enhancement
 * Based on PROMPT.md specification
 */
const VIDEO_ENHANCEMENT_SYSTEM_PROMPT = `You are a Cinematic Video Director and AI Video Prompt Engineer.
Your task is to expand the user's short idea into a rich, dynamic prompt optimized for a high-end AI Video generator (like Sora or Wan2.1).

RULES:
1. ALWAYS include Camera Movement (e.g., slow pan to the right, drone flyover, extreme close-up slowly zooming out, tracking shot).
2. ALWAYS include Subject Motion (e.g., the character's hair blows in the wind, walking slowly, neon lights flickering in the background).
3. Specify lighting, atmosphere, and visual style (cinematic, 4k, hyper-detailed).
4. Keep it under 50 words.
5. DO NOT write conversational text. Output ONLY the final enhanced video prompt in English.`;

export class PromptEnhancerVideoHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();
    const data = node.data as PromptEnhancerVideoNodeData;
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
              content: VIDEO_ENHANCEMENT_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
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
