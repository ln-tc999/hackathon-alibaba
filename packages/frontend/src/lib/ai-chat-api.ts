/**
 * AI Chat API Client
 * Handles conversational AI interactions
 */

// Use relative path for nginx reverse proxy
const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  response: string;
  intent?: {
    type: string;
    confidence: number;
    platforms?: string[];
  };
  suggestions?: string[];
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        timestamp: Date.now(),
      }),
      timeout: 30000,
    });

    if (!response.ok) {
      // Fallback to local responses if API fails
      return getFallbackResponse(messages);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Chat API] Error:', error);
    // Fallback to local responses
    return getFallbackResponse(messages);
  }
}

/**
 * Get intent analysis
 */
export async function analyzeIntent(message: string) {
  try {
    const response = await fetch(`${API_URL}/api/chat/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error('Intent API failed');
    }

    return await response.json();
  } catch (error) {
    console.error('[Intent API] Error:', error);
    // Fallback to local intent detection
    const { detectIntent } = await import('./intent-detector');
    return detectIntent(message);
  }
}

/**
 * Fallback responses when API is unavailable
 */
function getFallbackResponse(messages: ChatMessage[]): ChatResponse {
  const lastMessage = messages[messages.length - 1];
  const lower = lastMessage.content.toLowerCase();
  
  // Greeting responses
  if (/^(hi|hello|hey|halo|helo)/.test(lower)) {
    return {
      response: "Hi there! 👋 I'm your AI workflow assistant. I can help you:\n\n• Create automated workflows\n• Post to social media (Twitter, Instagram, Facebook, YouTube, TikTok)\n• Generate AI images and videos\n• Answer questions about the platform\n\nWhat would you like to create today?",
      suggestions: [
        'Create a viral meme about AI',
        'Help me automate social media posting',
        'How does workflow automation work?',
      ],
    };
  }
  
  // Help responses
  if (lower.includes('help') || lower.includes('bantu') || lower.includes('how do i')) {
    return {
      response: "I'd be happy to help! Here's what I can do:\n\n**Create Workflows:**\n• Generate AI images from text\n• Auto-post to social media\n• Multi-platform posting\n\n**Just tell me what you want to create!**\n\nFor example:\n• \"Create a viral meme about AI\"\n• \"Post this to Instagram and Twitter\"\n• \"Help me automate my content\"",
      suggestions: [
        'Create a workflow for Instagram',
        'Generate AI images automatically',
        'Connect my social media accounts',
      ],
    };
  }
  
  // Question responses
  if (/^(what|how|why|when|where|who|apa|bagaimana)/.test(lower)) {
    if (lower.includes('workflow')) {
      return {
        response: "A **workflow** is an automated sequence of steps that creates and posts content for you!\n\n**Example workflow:**\n1. You provide a prompt\n2. AI enhances the prompt\n3. Wan2.1 generates an image\n4. Content is posted to social media\n\n**Want to create one?** Just tell me what you'd like to make!",
        suggestions: [
          'Create a simple workflow',
          'Show me an example',
          'How do I connect social media?',
        ],
      };
    }
    
    if (lower.includes('connect') || lower.includes('account')) {
      return {
        response: "To connect your social media accounts:\n\n**Via Node UI:**\n1. Drag a platform node (Twitter, Instagram, etc.)\n2. Click \"Connect {Platform}\" button\n3. Authorize in the popup\n4. Done! ✅\n\n**Via Composio:**\n1. Go to app.composio.dev\n2. Connect your accounts\n3. Copy Connected Account ID\n4. Add to .env file\n\n**Which platform do you want to connect?**",
        suggestions: [
          'Connect Twitter',
          'Connect Instagram',
          'Connect Facebook',
        ],
      };
    }
    
    // Generic question response
    return {
      response: "That's a great question! Let me help you with that.\n\nCould you provide more details about what you're trying to achieve? I'm here to help with:\n\n• Workflow creation\n• Social media automation\n• AI content generation\n• Platform connections\n\nWhat would you like to know more about?",
      suggestions: [
        'Tell me about workflows',
        'How to post automatically',
        'What AI models you use',
      ],
    };
  }
  
  // Default chat response
  return {
    response: "I understand! I'm here to help you create automated workflows and post content to social media.\n\n**What would you like to create?**\n\nI can help you:\n• Generate AI images\n• Post to social media\n• Automate your content workflow\n\nJust describe what you have in mind!",
    suggestions: [
      'Create a viral meme',
      'Post to Instagram',
      'Automate my workflow',
    ],
  };
}

/**
 * Generate AI caption for social media
 */
export async function generateCaption(
  prompt: string,
  platforms: string[]
): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/chat/caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        platforms,
      }),
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error('Caption API failed');
    }

    const data = await response.json();
    return data.caption;
  } catch (error) {
    console.error('[Caption API] Error:', error);
    // Fallback to local caption generation
    return generateFallbackCaption(prompt, platforms);
  }
}

/**
 * Fallback caption generation
 */
function generateFallbackCaption(prompt: string, platforms: string[]): string {
  const captions: Record<string, string> = {
    twitter: `🚀 "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n#AI #VlowGen #Automation`,
    instagram: `✨ "${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}"\n\n.\n.\n.\n#AI #VlowGen #Automation #ContentCreation #AIArt`,
    facebook: `Check out this amazing content created with AI: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\nCreated with VlowGen - AI Workflow Automation`,
    youtube: `🎬 "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"\n\nCreated with VlowGen AI Workflow\n\n#AI #VlowGen #Automation`,
    tiktok: `🎵 "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n#AI #VlowGen #fyp #automation`,
  };
  
  return platforms
    .map(p => captions[p] || '')
    .filter(Boolean)
    .join('\n\n');
}
