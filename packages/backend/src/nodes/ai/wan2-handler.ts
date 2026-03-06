/**
 * Wan2.1 Node Handler
 * 
 * Handles execution of wan2 nodes which generate images from text prompts
 * using Alibaba Cloud's Wan2.1 AI service.
 * 
 * Requirements: 9.1, 9.2
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  Wan2NodeData
} from '@vlowgen/shared';
import { NodeHandler } from '../base/handler';
import { Wan2Client } from '../../integrations/wan2';
import { rateLimiter } from '../../services/rate-limiter.service';
import { minioService } from '../../services/minio.service';
import { imageHistoryService } from '../../services/image-history.service';
import { randomUUID } from 'crypto';

export class Wan2NodeHandler implements NodeHandler {
  private wan2Client: Wan2Client | null = null;

  /**
   * Pre-process prompt to optimize text rendering quality
   * Detects text elements and enhances them for better AI rendering
   */
  private preprocessPrompt(prompt: string): { processedPrompt: string; enhancements: string[] } {
    const enhancements: string[] = [];
    
    // Detect text patterns and suggest improvements
    const textPatterns = [
      { pattern: /\bwith\s+text\s+['"][^'"]+['"]/i, message: 'Text element detected' },
      { pattern: /\bwritten\s+on\s+it/i, message: 'Text on object detected' },
      { pattern: /\bsign\s+that\s+says/i, message: 'Sign text detected' },
      { pattern: /\blogo\s+with/i, message: 'Logo text detected' },
      { pattern: /\btitle\s*[:=]/i, message: 'Title specification detected' },
      { pattern: /\blabelled?\s+as/i, message: 'Label text detected' },
      { pattern: /\bnamed?\s+['"][^'"]+['"]/i, message: 'Named object detected' },
      { pattern: /\b[A-Z]{2,}\b/g, message: 'ALL CAPS text detected' },
    ];

    for (const { pattern, message } of textPatterns) {
      const matches = prompt.match(pattern);
      if (matches) {
        enhancements.push(`✓ ${message} - will be enhanced for better text rendering`);
      }
    }

    // Add text quality boosters if text is detected
    const hasText = textPatterns.some(({ pattern }) => pattern.test(prompt));
    if (hasText) {
      enhancements.push('✓ Adding text quality boosters: sharp text, crisp typography, high contrast');
    }

    return {
      processedPrompt: prompt,
      enhancements
    };
  }

  /**
   * Enhance prompt with text rendering optimizations
   * Adds quality boosters and contrast specifications for better text clarity
   */
  private enhancePromptForTextRendering(prompt: string, textRendering: 'precision' | 'quality' | 'balanced' | 'disabled' = 'balanced'): string {
    const textQualityBoosters = {
      precision: [
        'crisp sharp text rendering',
        'professional typography',
        'high contrast text',
        'legible lettering',
        'clean font rendering',
        'no text distortion',
        'accurate text spelling'
      ],
      quality: [
        'sharp text',
        'clear typography',
        'professional text rendering',
        'high quality lettering',
        'readable text'
      ],
      balanced: [
        'sharp text rendering',
        'clear typography',
        'professional quality'
      ],
      disabled: []  // No text boosters when disabled
    };

    const boosters = textQualityBoosters[textRendering];
    
    // If disabled or no boosters, return original prompt
    if (!boosters || boosters.length === 0) {
      return prompt;
    }
    
    // Check if prompt already contains text quality keywords
    const lowerPrompt = prompt.toLowerCase();
    const hasTextKeywords = ['sharp text', 'typography', 'clear text', 'crisp text', 'legible', 'readable'].some(
      keyword => lowerPrompt.includes(keyword)
    );

    if (!hasTextKeywords) {
      return `${prompt}, ${boosters.join(', ')}`;
    }

    return prompt;
  }

  /**
   * Analyze prompt for text contrast and suggest optimizations
   * High contrast is critical for legible text rendering
   */
  private optimizeTextContrast(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if prompt already has contrast specifications
    const hasContrast = ['high contrast', 'white text', 'black text', 'dark background', 'light background', 'contrasting'].some(
      keyword => lowerPrompt.includes(keyword)
    );

    if (hasContrast) {
      return prompt; // Already has contrast specification
    }

    // Detect if text is mentioned but no contrast specified
    const hasText = ['text', 'lettering', 'typography', 'written', 'label', 'sign', 'logo'].some(
      keyword => lowerPrompt.includes(keyword)
    );

    if (hasText) {
      // Add default high-contrast recommendation
      return `${prompt}, high contrast between text and background for clear readability`;
    }

    return prompt;
  }

  /**
   * Add font style specifications for better text rendering
   * Specific font descriptions help AI render text more accurately
   */
  private specifyFontStyle(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if font style already specified
    const hasFontStyle = ['font', 'serif', 'sans-serif', 'script', 'bold', 'italic', 'handwritten', 'calligraphy'].some(
      keyword => lowerPrompt.includes(keyword)
    );

    if (hasFontStyle) {
      return prompt; // Already has font specification
    }

    // Detect text without font style
    const hasText = ['text', 'lettering', 'typography', 'written', 'label', 'sign', 'logo'].some(
      keyword => lowerPrompt.includes(keyword)
    );

    if (hasText) {
      // Add default professional font style
      return `${prompt}, clean professional sans-serif font style`;
    }

    return prompt;
  }

  /**
   * Generate smart negative prompt based on positive prompt context
   * Uses AI-powered analysis to determine what to avoid
   * For text rendering: uses POSITIVE prompting approach instead of negative
   */
  private generateSmartNegativePrompt(prompt: string, style?: string, textRendering: 'precision' | 'quality' | 'balanced' | 'disabled' = 'balanced'): string {
    const baseNegatives = [
      'blurry',
      'low quality',
      'distorted',
      'ugly',
      'bad anatomy',
      'watermark',
      'signature',
      'low resolution',
      'pixelated',
      'jpeg artifacts'
    ];

    // For text rendering, we use POSITIVE prompting instead of negative
    // Modern AI models respond better to "what you want" than "what you don't want"
    // Only add minimal text-related negatives to avoid over-constraining
    if (textRendering !== 'disabled') {
      // Minimal negatives - only prevent obvious artifacts
      baseNegatives.push(
        'misspelled text',  // Prevent misspellings
        'garbled text'      // Prevent garbled letters
      );
      // Note: We DON'T add 'text', 'typography', etc. to negatives
      // because we WANT text to appear, just rendered correctly
    }

    const contextualNegatives: string[] = [];

    // Analyze prompt for context
    const lowerPrompt = prompt.toLowerCase();

    // For human/portrait content
    if (lowerPrompt.match(/\b(person|people|human|face|portrait|selfie|man|woman|child)\b/)) {
      contextualNegatives.push(
        'deformed face',
        'extra fingers',
        'extra limbs',
        'missing fingers',
        'mutated hands',
        'poorly drawn face',
        'poorly drawn hands',
        'disfigured'
      );
    }

    // For landscape/nature content
    if (lowerPrompt.match(/\b(landscape|nature|mountain|forest|ocean|sky|sunset|sunrise)\b/)) {
      contextualNegatives.push(
        'overexposed',
        'underexposed',
        'washed out colors',
        'unnatural colors'
      );
    }

    // For product/commercial content
    if (lowerPrompt.match(/\b(product|commercial|advertisement|brand|logo)\b/)) {
      contextualNegatives.push(
        'copyright',
        'trademark',
        'brand name',
        'text overlay'
      );
    }

    // For architectural content
    if (lowerPrompt.match(/\b(building|architecture|house|interior|room)\b/)) {
      contextualNegatives.push(
        'crooked lines',
        'distorted perspective',
        'unrealistic proportions'
      );
    }

    // Style-specific negatives
    if (style) {
      const lowerStyle = style.toLowerCase();
      
      if (lowerStyle.includes('photorealistic') || lowerStyle.includes('realistic')) {
        contextualNegatives.push(
          'cartoon',
          'anime',
          'illustration',
          'painting',
          'drawing',
          'sketch'
        );
      }
      
      if (lowerStyle.includes('anime') || lowerStyle.includes('manga')) {
        contextualNegatives.push(
          'realistic',
          'photorealistic',
          '3d render'
        );
      }
    }

    // Combine and deduplicate
    const allNegatives = [...baseNegatives, ...contextualNegatives];
    const uniqueNegatives = [...new Set(allNegatives)];

    return uniqueNegatives.join(', ');
  }

  /**
   * Execute a wan2 node
   * 
   * @param node - The wan2 node to execute
   * @param inputs - Input data from upstream nodes (should contain prompt text)
   * @param context - Execution context with credentials
   * @returns Promise resolving to node execution result
   */
  async execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Check rate limit
      const userId = context.userId || 'anonymous';
      const rateLimit = rateLimiter.checkLimit(userId, 'imageGeneration');

      if (!rateLimit.allowed) {
        const endTime = new Date().toISOString();
        const resetDate = new Date(rateLimit.resetAt).toLocaleString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `Rate limit exceeded. You can generate ${rateLimiter['configs'].imageGeneration.maxRequests} images per day. Resets at ${resetDate}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Extract prompt from input data (Requirement 9.1)
      // Input should come from upstream prompt-text node
      const inputValues = Object.values(inputs);

      if (inputValues.length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'No input provided to Wan2 node. Connect a prompt-text node.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Get the prompt text from the first input
      let prompt = inputValues[0];

      // Handle input from prompt enhancer node (which returns an object { enhancedPrompt: string })
      if (typeof prompt === 'object' && prompt !== null && 'enhancedPrompt' in prompt) {
        prompt = prompt.enhancedPrompt;
      }

      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'Invalid prompt input. Expected non-empty string.',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Pre-process prompt to detect and enhance text elements
      const promptAnalysis = this.preprocessPrompt(prompt);

      // Log enhancements if text patterns detected
      if (promptAnalysis.enhancements.length > 0) {
        console.log('[Wan2Handler] Text rendering enhancements:', promptAnalysis.enhancements);
      }

      // Get DashScope API key from environment (same key used for Qwen and Wan2)
      const dashscopeApiKey = process.env.DASHSCOPE_API_KEY || context.credentials.wan2ApiKey;


      console.log('[Wan2Handler] Using API key:', dashscopeApiKey ? dashscopeApiKey.substring(0, 10) + '...' : 'NOT FOUND');

      
      console.log('[Wan2Handler] Using API key:', dashscopeApiKey ? dashscopeApiKey.substring(0, 10) + '...' : 'NOT FOUND');
      
      if (!dashscopeApiKey) {
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: 'DASHSCOPE_API_KEY environment variable is required for Wan2 image generation',
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Initialize Wan2 client if not already done
      if (!this.wan2Client) {
        this.wan2Client = new Wan2Client(dashscopeApiKey);
      }

      // Extract node configuration
      const nodeData = node.data as Wan2NodeData;

      // Use textRendering setting from node data (default to 'balanced' for good text quality)
      const textRendering = nodeData.textRendering || 'balanced';

      // Apply text enhancement pipeline for better text rendering
      let enhancedPrompt = prompt;
      
      // Step 1: Add text quality boosters based on rendering mode
      enhancedPrompt = this.enhancePromptForTextRendering(enhancedPrompt, textRendering);
      
      // Step 2: Optimize text contrast for better readability
      if (textRendering === 'precision' || textRendering === 'quality') {
        enhancedPrompt = this.optimizeTextContrast(enhancedPrompt);
      }
      
      // Step 3: Add font style specifications for accurate rendering
      if (textRendering === 'precision') {
        enhancedPrompt = this.specifyFontStyle(enhancedPrompt);
      }

      // Generate smart negative prompt with minimal text constraints
      const smartNegativePrompt = this.generateSmartNegativePrompt(enhancedPrompt, nodeData.style, textRendering);

      console.log('[Wan2Handler] Enhanced prompt:', enhancedPrompt);
      console.log('[Wan2Handler] Auto-generated negative prompt:', smartNegativePrompt);
      console.log('[Wan2Handler] Text rendering mode:', textRendering);

      // Call Wan2Client with enhanced prompt and node configuration (Requirement 9.1)
      const result = await this.wan2Client.generateImage({
        prompt: enhancedPrompt,
        negativePrompt: smartNegativePrompt,
        model: nodeData.model,
        size: nodeData.size,
        style: nodeData.style
      });

      console.log('[Wan2Handler] Image generated, uploading to MinIO...');

      // Upload image to MinIO for persistent storage
      const fileName = `wan2-${node.id}-${Date.now()}`;
      const minioUrl = await minioService.uploadImageFromUrl(result.imageUrl, fileName);

      console.log('[Wan2Handler] Image uploaded to MinIO:', minioUrl);

      // Save to image history for workflow continuation
      const imageId = randomUUID();
      imageHistoryService.addImage({
        id: imageId,
        nodeId: node.id,
        workflowId: context.workflowId || 'unknown',
        executionId: context.executionId || 'unknown',
        minioUrl,
        dashscopeUrl: result.imageUrl,
        prompt,
        negativePrompt: smartNegativePrompt,
        model: nodeData.model || 'wan2.1-t2i-turbo',
        size: nodeData.size || '1024*1024',
        timestamp: new Date().toISOString(),
        userId: context.userId,
      });

      console.log('[Wan2Handler] Image saved to history:', imageId);

      // IMPORTANT: Use Dashscope URL for social media posting (publicly accessible)
      // MinIO URL is for internal storage only (localhost not accessible from Instagram API)
      const publicImageUrl = result.imageUrl; // Use Dashscope URL which is publicly accessible

      console.log('[Wan2Handler] Using public URL for output:', publicImageUrl);

      // Return public Dashscope URL in output (Requirement 9.2)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'success',
        output: {
          imageUrl: publicImageUrl, // Use public Dashscope URL
          minioUrl, // Keep MinIO URL for reference
          imageId,
          prompt,
          model: nodeData.model || 'wan2.1-t2i-turbo',
        },
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    } catch (error) {
      // Propagate errors from Wan2 service (Requirement 9.4)
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error in Wan2 node',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }
}
