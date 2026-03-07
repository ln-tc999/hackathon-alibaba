/**
 * Chat API
 * Handles conversational AI interactions
 */

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router: Router = Router();

// Simple AI responses (in production, integrate with OpenRouter/Qwen API)
const AI_RESPONSES: Record<string, string> = {
  greeting: "Hi there! 👋 I'm your AI workflow assistant. I can help you:\n\n• Create automated workflows\n• Post to social media (Twitter, Instagram, Facebook, YouTube, TikTok)\n• Generate AI images and videos\n• Answer questions about the platform\n\nWhat would you like to create today?",
  
  help: "I'd be happy to help! Here's what I can do:\n\n**Create Workflows:**\n• Generate AI images from text\n• Auto-post to social media\n• Multi-platform posting\n\n**Just tell me what you want to create!**\n\nFor example:\n• \"Create a viral meme about AI\"\n• \"Post this to Instagram and Twitter\"\n• \"Help me automate my content\"",
  
  workflow: "A **workflow** is an automated sequence of steps that creates and posts content for you!\n\n**Example workflow:**\n1. You provide a prompt\n2. AI enhances the prompt\n3. Wan2.1 generates an image\n4. Content is posted to social media\n\n**Want to create one?** Just tell me what you'd like to make!",
  
  connect: "To connect your social media accounts:\n\n**Via Node UI:**\n1. Drag a platform node (Twitter, Instagram, etc.)\n2. Click \"Connect {Platform}\" button\n3. Authorize in the popup\n4. Done! ✅\n\n**Via Composio:**\n1. Go to app.composio.dev\n2. Connect your accounts\n3. Copy Connected Account ID\n4. Add to .env file\n\n**Which platform do you want to connect?**",
};

/**
 * POST /api/chat
 * Chat with AI assistant
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];
    const lower = lastMessage.content.toLowerCase();
    
    // Simple keyword-based responses (in production, call AI API)
    let response = '';
    const suggestions: string[] = [];
    
    if (/^(hi|hello|hey|halo|helo)/.test(lower)) {
      response = AI_RESPONSES.greeting;
      suggestions.push('Create a viral meme about AI', 'Help me automate social media', 'How does workflow work?');
    } else if (lower.includes('help') || lower.includes('bantu') || lower.includes('how do i')) {
      response = AI_RESPONSES.help;
      suggestions.push('Create workflow for Instagram', 'Generate AI images', 'Connect social media');
    } else if (lower.includes('workflow')) {
      response = AI_RESPONSES.workflow;
      suggestions.push('Create a simple workflow', 'Show me an example', 'How to connect social media?');
    } else if (lower.includes('connect') || lower.includes('account')) {
      response = AI_RESPONSES.connect;
      suggestions.push('Connect Twitter', 'Connect Instagram', 'Connect Facebook');
    } else if (/^(what|how|why|when|where|who|apa|bagaimana)/.test(lower)) {
      response = "That's a great question! Could you provide more details about what you're trying to achieve?\n\nI'm here to help with:\n• Workflow creation\n• Social media automation\n• AI content generation\n• Platform connections";
      suggestions.push('Tell me about workflows', 'How to post automatically', 'What AI models you use');
    } else {
      response = "I understand! I'm here to help you create automated workflows and post content to social media.\n\n**What would you like to create?**\n\nI can help you:\n• Generate AI images\n• Post to social media\n• Automate your content workflow\n\nJust describe what you have in mind!";
      suggestions.push('Create a viral meme', 'Post to Instagram', 'Automate my workflow');
    }
    
    res.json({
      response,
      suggestions,
    });
  } catch (error) {
    logger.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to chat' });
  }
});

/**
 * POST /api/chat/intent
 * Analyze message intent
 */
router.post('/intent', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const lower = message.toLowerCase();
    
    // Simple intent detection (in production, use AI model)
    let intent: { type: string; confidence: number; platforms?: string[] } = { type: 'chat', confidence: 0.5 };
    
    if (/^(hi|hello|hey|halo)/.test(lower)) {
      intent = { type: 'greeting', confidence: 0.95 };
    } else if (lower.includes('help') || lower.includes('bantu')) {
      intent = { type: 'help', confidence: 0.85 };
    } else if (lower.includes('create') || lower.includes('buat')) {
      intent = { type: 'workflow_create', confidence: 0.8 };
    } else if (lower.includes('instagram') || lower.includes('facebook') || lower.includes('twitter')) {
      intent = { type: 'workflow_modify', platforms: extractPlatforms(lower), confidence: 0.8 };
    } else if (/^(what|how|why|apa|bagaimana)/.test(lower)) {
      intent = { type: 'question', confidence: 0.75 };
    }
    
    res.json(intent);
  } catch (error) {
    logger.error('Intent API error:', error);
    res.status(500).json({ error: 'Failed to analyze intent' });
  }
});

/**
 * POST /api/chat/caption
 * Generate social media caption
 */
router.post('/caption', async (req: Request, res: Response) => {
  try {
    const { prompt, platforms } = req.body;
    
    const captions: Record<string, string> = {
      twitter: `🚀 "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n#AI #VlowGen #Automation`,
      instagram: `✨ "${prompt.substring(0, 80)}${prompt.length > 80 ? '...' : ''}"\n\n.\n.\n.\n#AI #VlowGen #Automation #ContentCreation #AIArt`,
      facebook: `Check out this amazing content created with AI: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\nCreated with VlowGen - AI Workflow Automation`,
      youtube: `🎬 "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"\n\nCreated with VlowGen AI Workflow\n\n#AI #VlowGen #Automation`,
      tiktok: `🎵 "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"\n\n#AI #VlowGen #fyp #automation`,
    };
    
    const caption = (platforms || [])
      .map((p: string) => captions[p] || '')
      .filter(Boolean)
      .join('\n\n');
    
    res.json({ caption });
  } catch (error) {
    logger.error('Caption API error:', error);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

// Helper function
function extractPlatforms(message: string): string[] {
  const platforms: string[] = [];
  if (message.includes('instagram') || message.includes('ig')) platforms.push('instagram');
  if (message.includes('facebook') || message.includes('fb')) platforms.push('facebook');
  if (message.includes('twitter') || message.includes('x')) platforms.push('twitter');
  if (message.includes('youtube') || message.includes('yt')) platforms.push('youtube');
  if (message.includes('tiktok') || message.includes('tik tok')) platforms.push('tiktok');
  return platforms;
}

export default router;
