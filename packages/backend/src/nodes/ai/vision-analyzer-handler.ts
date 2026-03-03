import type { VisionAnalyzerNodeData, WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';
import { rateLimiter } from '../../services/rate-limiter.service';

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
  private createErrorResult(nodeId: string, error: string, startTime: string): NodeExecutionResult {
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

  private createSuccessResult(nodeId: string, output: any, startTime: string): NodeExecutionResult {
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
    const data = node.data as VisionAnalyzerNodeData;
    const { imageUrl, videoUrl, niche } = data;

    // Check rate limit
    const userId = context.userId || 'anonymous';
    const rateLimit = rateLimiter.checkLimit(userId, 'visionAnalysis');
    
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt).toLocaleString();
      return this.createErrorResult(
        node.id,
        `Rate limit exceeded. You can analyze ${rateLimiter['configs'].visionAnalysis.maxRequests} images per day. Resets at ${resetDate}`,
        startTime
      );
    }

    if (!imageUrl && !videoUrl) {
      return this.createErrorResult(
        node.id,
        'Image URL or Video URL is required for vision analysis',
        startTime
      );
    }

    // Use Qwen VL for vision analysis
    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
      return this.createErrorResult(
        node.id,
        'DASHSCOPE_API_KEY environment variable is required for vision analysis',
        startTime
      );
    }

    try {
      const userMessage = niche 
        ? `Analyze this ${videoUrl ? 'video' : 'image'} and create a new prompt adapted to this niche: ${niche}`
        : `Analyze this ${videoUrl ? 'video' : 'image'} and create a new prompt that replicates its format and style.`;

      const contentUrl = videoUrl || imageUrl;

      // Use Qwen VL Plus for vision analysis
      const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dashscopeApiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-vl-plus',
          messages: [
            { role: 'system', content: VISION_ANALYZER_SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: contentUrl } },
                { type: 'text', text: userMessage },
              ],
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as any;
        return this.createErrorResult(
          node.id,
          `Qwen VL API error: ${errorData.error?.message || response.statusText}`,
          startTime
        );
      }

      const result = await response.json() as any;
      const analyzedPrompt = result.choices[0]?.message?.content?.trim();

      if (!analyzedPrompt) {
        return this.createErrorResult(
          node.id,
          'Failed to analyze content and generate prompt',
          startTime
        );
      }

      return this.createSuccessResult(node.id, { analyzedPrompt }, startTime);
    } catch (error) {
      return this.createErrorResult(
        node.id,
        `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }
}
