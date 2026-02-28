import type { VisionAnalyzerNodeData, WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from './handler';

/**
 * System prompt for Vision Analysis
 * Based on PROMPT.md specification
 */
const VISION_ANALYZER_SYSTEM_PROMPT = `You are a Master Visual Trend Analyst and Meme Formatter.
You will be provided with an image (a currently viral meme or trending photo) and a specific niche/theme from the user.
Your task is to analyze the core visual joke, emotion, or layout of the provided image, and then write a NEW image generation prompt that REPLICATES this viral format but adapts it entirely to the user's niche.

RULES:
1. Analyze the input image: Identify the subject's emotion, the relationship between objects, and the layout (e.g., "Subject A is happily ignoring the chaos of Object B").
2. Adapt to the Niche: Replace the original subjects with elements relevant to the user's niche.
3. Your output must be an English prompt optimized for Wan2.1 or Midjourney.
4. DO NOT copy the original image exactly (to avoid copyright issues). Keep the "vibe" or "format" but make the content new.
5. Specify lighting, style, and camera angles to make it high quality.
6. Output ONLY the final image prompt. No conversational text.`;

export class VisionAnalyzerHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const data = node.data as VisionAnalyzerNodeData;
    const { imageUrl, videoUrl, niche } = data;

    if (!imageUrl && !videoUrl) {
      return {
        nodeId: node.id,
        status: 'error',
        error: 'Image URL or Video URL is required for vision analysis',
        executedAt: new Date().toISOString(),
      };
    }

    // Use OpenRouter API with vision model
    const openRouterApiKey = context.credentials.openRouterApiKey;
    if (!openRouterApiKey) {
      return {
        nodeId: node.id,
        status: 'error',
        error: 'OpenRouter API key is required for vision analysis',
        executedAt: new Date().toISOString(),
      };
    }

    try {
      const userMessage = niche 
        ? `Analyze this ${videoUrl ? 'video' : 'image'} and create a new prompt adapted to this niche: ${niche}`
        : `Analyze this ${videoUrl ? 'video' : 'image'} and create a new prompt that replicates its format and style.`;

      // Choose model based on content type
      const model = videoUrl 
        ? 'nvidia/nemotron-nano-12b-v2-vl:free' // Video to text
        : 'qwen/qwen3-vl-30b-a3b-thinking'; // Image to text

      const contentUrl = videoUrl || imageUrl;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://vlowgen.com',
          'X-Title': 'VlowGen Vision Analyzer',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: VISION_ANALYZER_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: contentUrl,
                  },
                },
                {
                  type: 'text',
                  text: userMessage,
                },
              ],
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        return {
          nodeId: node.id,
          status: 'error',
          error: `OpenRouter API error: ${errorData.error?.message || response.statusText}`,
          executedAt: new Date().toISOString(),
        };
      }

      const result = await response.json() as any;
      const analyzedPrompt = result.choices[0]?.message?.content?.trim();

      if (!analyzedPrompt) {
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Failed to analyze content and generate prompt',
          executedAt: new Date().toISOString(),
        };
      }

      return {
        nodeId: node.id,
        status: 'success',
        output: { analyzedPrompt },
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        nodeId: node.id,
        status: 'error',
        error: `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executedAt: new Date().toISOString(),
      };
    }
  }
}
