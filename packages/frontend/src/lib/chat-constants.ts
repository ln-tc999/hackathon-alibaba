export const SESSION_PREFIX = 'session_';

export const DEFAULT_MESSAGES = [
  {
    id: '1',
    role: 'assistant',
    content: `Hi! I'm your AI assistant.

Tell me what you want to create, and I'll build an optimized workflow automatically.

Try: "Create a viral meme and post to Instagram"`,
    timestamp: new Date(),
  },
];

export const MODIFICATION_KEYWORDS = [
  'post to',
  'add',
  'also',
  'and post',
  'share on',
  'upload to',
];

export const isModificationRequest = (prompt: string): boolean => {
  const promptLower = prompt.toLowerCase();
  return MODIFICATION_KEYWORDS.some(keyword => promptLower.includes(keyword));
};

// Node type label mapping
export const NODE_LABELS: Record<string, string> = {
  'prompt-text': 'Prompt',
  'prompt-enhancer-image': 'Enhancer',
  'prompt-enhancer-video': 'Video',
  'vision-analyzer': 'Vision',
  'wan2': 'Image',
  'twitter': 'Twitter',
  'instagram': 'Instagram',
  'facebook': 'Facebook',
  'tiktok': 'TikTok',
  'youtube': 'YouTube',
};

export const getNodeLabel = (nodeType: string): string => {
  return NODE_LABELS[nodeType] || 'Node';
};
