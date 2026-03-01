import { PromptEnhancerVideoNodeData } from '@vlowgen/shared';
import { BasePromptEnhancer } from '../base/prompt-enhancer';

const VIDEO_ENHANCEMENT_SYSTEM_PROMPT = `You are a Master Video Director and Expert AI Prompt Engineer.
Your task is to take the user's short idea and expand it into a highly detailed, descriptive prompt optimized for AI video generation.

RULES:
1. Describe the main action or scene in detail (movement, transitions, key moments).
2. Describe the environment, setting, and atmosphere.
3. Specify the lighting and mood (e.g., cinematic lighting, dramatic shadows, vibrant colors).
4. Specify camera movements and angles (e.g., slow pan, tracking shot, aerial view, close-up).
5. Specify the style and quality (e.g., 4k resolution, cinematic, smooth motion, professional grade).
6. DO NOT write conversational text. Output ONLY the final enhanced prompt in English.`;

export class PromptEnhancerVideoHandler extends BasePromptEnhancer {
  get systemPrompt(): string {
    return VIDEO_ENHANCEMENT_SYSTEM_PROMPT;
  }

  get enhancerType(): 'image' | 'video' {
    return 'video';
  }
}
