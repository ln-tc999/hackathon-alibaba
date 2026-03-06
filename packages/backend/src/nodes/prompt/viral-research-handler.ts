import { WorkflowNode, NodeExecutionResult, ExecutionContext } from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';
import { viralContentResearch } from '../research/viral-research';

export class ViralResearchHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();
    const data = node.data as any;
    const { query, enhanceWithQwen = false } = data;

    if (!query || query.trim() === '') {
      return this.createErrorResult(node.id, 'Query is required', startTime);
    }

    try {
      const researchResult = viralContentResearch.searchViralContent(query);

      let enhancedPrompt = researchResult.suggestedTitles[0] || '';
      let qwenResponse = null;

      if (enhanceWithQwen) {
        const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
        if (dashscopeApiKey) {
          const context = viralContentResearch.buildContextForQwen(query);
          qwenResponse = await this.enhanceWithQwen(context, query, dashscopeApiKey);
          if (qwenResponse) {
            enhancedPrompt = qwenResponse;
          }
        }
      }

      return this.createSuccessResult(
        node.id,
        {
          ...researchResult,
          enhancedPrompt,
          qwenEnhanced: !!qwenResponse,
          qwenResponse: qwenResponse,
        },
        startTime
      );
    } catch (error) {
      return this.createErrorResult(
        node.id,
        `Viral research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }

  private async enhanceWithQwen(
    context: string,
    query: string,
    apiKey: string
  ): Promise<string | null> {
    const systemPrompt = `You are an expert viral content strategist. Based on the research data provided, create an optimized prompt for AI image/video generation.

The prompt should:
1. Be concise but compelling (max 100 words)
2. Include trending elements from the research
3. Use viral title formulas
4. Include relevant hashtags
5. Be ready for AI image generation`;

    try {
      const response = await fetch(
        'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'qwen-plus',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `${context}\n\nCreate an AI image/video prompt for: ${query}`,
              },
            ],
            temperature: 0.8,
            max_tokens: 300,
          }),
        }
      );

      if (!response.ok) return null;

      const result = (await response.json()) as any;
      return result.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error('Qwen enhancement error:', error);
      return null;
    }
  }

  private createErrorResult(nodeId: string, error: string, startTime: string): NodeExecutionResult {
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

  private createSuccessResult(nodeId: string, output: any, startTime: string): NodeExecutionResult {
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
}

export class ViralResearchPromptHandler implements NodeHandler {
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();
    const data = node.data as any;
    const { userPrompt, useResearch = true } = data;

    if (!userPrompt || userPrompt.trim() === '') {
      return this.createErrorResult(node.id, 'User prompt is required', startTime);
    }

    const dashscopeApiKey = process.env.DASHSCOPE_API_KEY;
    if (!dashscopeApiKey) {
      return this.createErrorResult(
        node.id,
        'DASHSCOPE_API_KEY environment variable is required',
        startTime
      );
    }

    try {
      let finalPrompt = userPrompt;
      let researchContext = '';

      if (useResearch && viralContentResearch.isViralQuery(userPrompt)) {
        researchContext = viralContentResearch.buildContextForQwen(userPrompt);
      }

      if (researchContext) {
        finalPrompt = `${researchContext}\n\n---\n\nUSER PROMPT:\n${userPrompt}`;
      }

      const enhancedPrompt = await this.enhancePrompt(finalPrompt, dashscopeApiKey);

      return this.createSuccessResult(
        node.id,
        {
          originalPrompt: userPrompt,
          enhancedPrompt,
          researchContext: researchContext || null,
          usedResearch: !!researchContext,
        },
        startTime
      );
    } catch (error) {
      return this.createErrorResult(
        node.id,
        `Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        startTime
      );
    }
  }

  private async enhancePrompt(prompt: string, apiKey: string): Promise<string> {
    const systemPrompt = `You are an expert content creator specializing in viral content for social media (TikTok, Instagram, X/Twitter). 
You enhance user prompts by incorporating viral content trends, effective titles, hashtags, and references.

Guidelines:
- Use trending hashtags (#viral, #fyp, #foryou, #trending)
- Suggest engaging titles that spark curiosity
- Include regional trends (Indonesian: dagelan, ngakak, kucing lucu)
- Mix universal emotions with local cultural elements
- Keep the enhanced prompt concise but compelling`;

    const response = await fetch(
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as any;
      throw new Error(`Qwen API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = (await response.json()) as any;
    const enhancedPrompt = result.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt');
    }

    return enhancedPrompt;
  }

  private createErrorResult(nodeId: string, error: string, startTime: string): NodeExecutionResult {
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

  private createSuccessResult(nodeId: string, output: any, startTime: string): NodeExecutionResult {
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
}

export const viralResearchHandler = new ViralResearchHandler();
export const viralResearchPromptHandler = new ViralResearchPromptHandler();
