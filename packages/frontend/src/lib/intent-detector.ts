/**
 * Intent Detector
 * Analyzes user messages to determine their intent
 */

export type IntentType = 
  | 'chat' 
  | 'workflow_create' 
  | 'workflow_modify' 
  | 'question'
  | 'greeting'
  | 'help';

export interface Intent {
  type: IntentType;
  confidence: number;
  platforms?: string[];
  action?: string;
}

/**
 * Extract platforms from message
 */
function extractPlatforms(message: string): string[] {
  const platforms: string[] = [];
  const lower = message.toLowerCase();
  
  if (lower.includes('instagram') || lower.includes('ig') || lower.includes('insta')) {
    platforms.push('instagram');
  }
  if (lower.includes('facebook') || lower.includes('fb') || lower.includes('facebook')) {
    platforms.push('facebook');
  }
  if (lower.includes('twitter') || lower.includes('x.com') || lower.includes('tweet')) {
    platforms.push('twitter');
  }
  if (lower.includes('youtube') || lower.includes('yt') || lower.includes('video')) {
    platforms.push('youtube');
  }
  if (lower.includes('tiktok') || lower.includes('tik tok') || lower.includes('tik-tok')) {
    platforms.push('tiktok');
  }
  
  return platforms;
}

/**
 * Detect intent from user message
 */
export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  
  // Greetings
  if (/^(hi|hello|hey|halo|helo|pagi|siang|malam)/.test(lower)) {
    return {
      type: 'greeting',
      confidence: 0.95,
    };
  }
  
  // Help requests
  if (lower.includes('help') || lower.includes('bantu') || lower.includes('how do i') || lower.includes('cara')) {
    return {
      type: 'help',
      confidence: 0.85,
    };
  }
  
  // Questions
  if (/^(what|how|why|when|where|who|apa|bagaimana|kenapa|kapan|dimana)/.test(lower) ||
      lower.includes('?')) {
    return {
      type: 'question',
      confidence: 0.8,
    };
  }
  
  // Workflow creation
  if (lower.includes('create') || lower.includes('buat') || lower.includes('generate') || 
      lower.includes('make') || lower.includes('setup') || lower.includes('new workflow')) {
    if (lower.includes('workflow') || lower.includes('automation') || lower.includes('auto')) {
      return {
        type: 'workflow_create',
        confidence: 0.9,
      };
    }
  }
  
  // Platform-specific creation
  const hasPlatform = extractPlatforms(lower).length > 0;
  if (hasPlatform && (lower.includes('post') || lower.includes('upload') || lower.includes('share'))) {
    if (lower.includes('also') || lower.includes('too') || lower.includes('juga') || 
        lower.includes('tambah') || lower.includes('lagi')) {
      // Modifying existing workflow
      return {
        type: 'workflow_modify',
        platforms: extractPlatforms(lower),
        confidence: 0.85,
      };
    } else {
      // Creating new workflow with platform
      return {
        type: 'workflow_create',
        platforms: extractPlatforms(lower),
        confidence: 0.85,
      };
    }
  }
  
  // Modification keywords
  if (lower.includes('add') || lower.includes('modify') || lower.includes('change') || 
      lower.includes('update') || lower.includes('tambah') || lower.includes('ubah')) {
    if (hasPlatform) {
      return {
        type: 'workflow_modify',
        platforms: extractPlatforms(lower),
        confidence: 0.8,
      };
    }
  }
  
  // Default to chat
  return {
    type: 'chat',
    confidence: 0.5,
  };
}

/**
 * Get suggested responses based on intent
 */
export function getSuggestions(intent: Intent): string[] {
  switch (intent.type) {
    case 'greeting':
      return [
        'Create a viral meme about AI',
        'Help me automate social media posting',
        'How does workflow automation work?',
      ];
    
    case 'help':
      return [
        'Create a workflow for Instagram posting',
        'Generate AI images automatically',
        'Connect my social media accounts',
      ];
    
    case 'question':
      return [
        'Tell me more about Wan2.1',
        'How do I connect Twitter?',
        'What platforms are supported?',
      ];
    
    default:
      return [
        'Create a viral meme',
        'Post to Instagram',
        'Automate my workflow',
      ];
  }
}
