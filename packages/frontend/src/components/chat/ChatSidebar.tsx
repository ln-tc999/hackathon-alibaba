import { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  Send,
  Loader2,
  Download,
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Wand2,
  Video,
  Eye,
  Image as ImageIcon,
  Twitter,
  Instagram,
  Sparkles
} from 'lucide-react';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@vlowgen/shared';
import { saveChatSession } from '@/lib/db';
import { getUserId } from '@/lib/user';
import { sessionEvents } from '@/lib/session-events';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflow?: Workflow;
}

interface ChatSidebarProps {
  sessionId?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  workflow?: Workflow;
}

// Memoized Message Component
const MessageBubble = memo(({
  message,
  isUser
}: {
  message: Message;
  isUser: boolean;
}) => (
  <div
    className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${isUser
      ? 'bg-blue-600 text-white'
      : 'bg-gray-50 text-gray-900 border border-gray-200'
      }`}
  >
    <p className="text-sm whitespace-pre-line leading-relaxed font-sans">{message.content}</p>
    <span className={`text-xs mt-1.5 block ${isUser ? 'text-blue-100' : 'text-gray-500'
      }`}>
      {message.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </span>
  </div>
));

MessageBubble.displayName = 'MessageBubble';

export default function ChatSidebar({
  sessionId,
  onWorkflowGenerated,
  workflow
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI assistant.\n\nTell me what you want to create, and I\'ll build an optimized workflow automatically.\n\nTry: "Create a viral meme and post to Instagram"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | undefined>(workflow);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session messages when sessionId changes
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || sessionId.startsWith('session_')) {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hi! I\'m your AI assistant.\n\nTell me what you want to create, and I\'ll build an optimized workflow automatically.\n\nTry: "Create a viral meme and post to Instagram"',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const { getChatSession } = await import('@/lib/db');
      const session = await getChatSession(sessionId);

      if (session && session.messages.length > 0) {
        const loadedMessages: Message[] = session.messages.map((m, idx) => ({
          id: `msg-${idx}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(loadedMessages);
      }
    };

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
    }
  }, [workflow]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const generateNewWorkflow = (prompt: string): Workflow => {
    const promptLower = prompt.toLowerCase();
    
    const nodes: WorkflowNode[] = [
      {
        id: 'node-1',
        type: 'prompt-text',
        position: { x: 100, y: 100 },
        data: {
          type: 'prompt-text',
          promptText: prompt,
        },
      },
      {
        id: 'node-2',
        type: 'prompt-enhancer-image',
        position: { x: 400, y: 100 },
        data: {
          type: 'prompt-enhancer-image',
          userPrompt: prompt,
        },
      },
      {
        id: 'node-3',
        type: 'wan2',
        position: { x: 700, y: 100 },
        data: {
          type: 'wan2',
          model: 'wan2.1-t2i-turbo',
          size: '1024*1024',
        },
      },
    ];

    const edges: WorkflowEdge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      },
      {
        id: 'edge-2',
        source: 'node-2',
        target: 'node-3',
      },
    ];

    const previewNode: WorkflowNode = {
      id: 'node-preview',
      type: 'preview',
      position: { x: 1000, y: 100 },
      data: {
        type: 'preview',
        mediaType: 'auto',
        showMetadata: true,
      },
    };
    nodes.push(previewNode);
    edges.push({
      id: 'edge-preview',
      source: 'node-3',
      target: 'node-preview',
    });

    const isTwitterRequested = promptLower.includes('twitter') || promptLower.includes('x');
    const isInstagramRequested = promptLower.includes('instagram') || promptLower.includes('ig');
    let currentY = 50;

    if (isTwitterRequested) {
      nodes.push({
        id: 'node-twitter',
        type: 'twitter',
        position: { x: 1300, y: currentY },
        data: {
          type: 'twitter',
          authenticated: false,
        },
      });
      edges.push({
        id: `edge-twitter`,
        source: 'node-preview',
        target: 'node-twitter',
      });
      currentY += 150;
    }

    if (isInstagramRequested) {
      nodes.push({
        id: 'node-instagram',
        type: 'instagram',
        position: { x: 1300, y: currentY },
        data: {
          type: 'instagram',
          authenticated: false,
        },
      });
      edges.push({
        id: `edge-instagram`,
        source: 'node-preview',
        target: 'node-instagram',
      });
    }

    return {
      id: `workflow-${Date.now()}`,
      name: 'AI Generated Workflow',
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const modifyExistingWorkflow = (existingWorkflow: Workflow, prompt: string): Workflow => {
    const promptLower = prompt.toLowerCase();
    const nodes = [...existingWorkflow.nodes];
    const edges = [...existingWorkflow.edges];

    const previewNode = nodes.find(n => n.type === 'preview');
    if (!previewNode) {
      return generateNewWorkflow(prompt);
    }

    const addInstagram = promptLower.includes('instagram') || promptLower.includes('ig');
    const addTwitter = promptLower.includes('twitter') || promptLower.includes('x');
    const addFacebook = promptLower.includes('facebook') || promptLower.includes('fb');
    const addTikTok = promptLower.includes('tiktok') || promptLower.includes('tik tok');
    const addYouTube = promptLower.includes('youtube') || promptLower.includes('yt');

    let currentY = 50;
    let modified = false;

    if (addInstagram && !nodes.some(n => n.type === 'instagram')) {
      nodes.push({
        id: `node-instagram-${Date.now()}`,
        type: 'instagram',
        position: { x: previewNode.position.x + 300, y: currentY },
        data: { type: 'instagram', authenticated: false },
      });
      edges.push({
        id: `edge-instagram-${Date.now()}`,
        source: previewNode.id,
        target: `node-instagram-${Date.now()}`,
      });
      currentY += 150;
      modified = true;
    }

    if (addTwitter && !nodes.some(n => n.type === 'twitter')) {
      nodes.push({
        id: `node-twitter-${Date.now()}`,
        type: 'twitter',
        position: { x: previewNode.position.x + 300, y: currentY },
        data: { type: 'twitter', authenticated: false },
      });
      edges.push({
        id: `edge-twitter-${Date.now()}`,
        source: previewNode.id,
        target: `node-twitter-${Date.now()}`,
      });
      currentY += 150;
      modified = true;
    }

    if (addFacebook && !nodes.some(n => n.type === 'facebook')) {
      nodes.push({
        id: `node-facebook-${Date.now()}`,
        type: 'facebook',
        position: { x: previewNode.position.x + 300, y: currentY },
        data: { type: 'facebook', authenticated: false },
      });
      edges.push({
        id: `edge-facebook-${Date.now()}`,
        source: previewNode.id,
        target: `node-facebook-${Date.now()}`,
      });
      currentY += 150;
      modified = true;
    }

    if (addTikTok && !nodes.some(n => n.type === 'tiktok')) {
      nodes.push({
        id: `node-tiktok-${Date.now()}`,
        type: 'tiktok',
        position: { x: previewNode.position.x + 300, y: currentY },
        data: { type: 'tiktok', authenticated: false },
      });
      edges.push({
        id: `edge-tiktok-${Date.now()}`,
        source: previewNode.id,
        target: `node-tiktok-${Date.now()}`,
      });
      currentY += 150;
      modified = true;
    }

    if (addYouTube && !nodes.some(n => n.type === 'youtube')) {
      nodes.push({
        id: `node-youtube-${Date.now()}`,
        type: 'youtube',
        position: { x: previewNode.position.x + 300, y: currentY },
        data: { type: 'youtube', authenticated: false },
      });
      edges.push({
        id: `edge-youtube-${Date.now()}`,
        source: previewNode.id,
        target: `node-youtube-${Date.now()}`,
      });
      modified = true;
    }

    if (!modified) {
      return existingWorkflow;
    }

    return {
      ...existingWorkflow,
      nodes,
      edges,
      updatedAt: new Date().toISOString(),
    };
  };

  const generateWorkflowFromPrompt = async (
    prompt: string,
    existingWorkflow?: Workflow
  ): Promise<Workflow> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const promptLower = prompt.toLowerCase();
    const isModificationRequest = 
      promptLower.includes('post to') || 
      promptLower.includes('add') ||
      promptLower.includes('also') ||
      promptLower.includes('and post') ||
      promptLower.includes('share on') ||
      promptLower.includes('upload to');

    if (existingWorkflow && existingWorkflow.nodes.length > 0 && isModificationRequest) {
      return modifyExistingWorkflow(existingWorkflow, prompt);
    }

    return generateNewWorkflow(prompt);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const workflow = await generateWorkflowFromPrompt(input, currentWorkflow);
      setCurrentWorkflow(workflow);

      const isModification = currentWorkflow && workflow.id === currentWorkflow.id;

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: isModification 
          ? `Great! I've updated your workflow:\n\n${input}\n\nCheck the canvas to see the changes.`
          : `Perfect! I've created your workflow:\n\n${input}\n\nSteps:\n1. Prompt enhancement\n2. Image generation\n3. Multi-platform posting\n\nCheck the canvas to see your workflow.`,
        timestamp: new Date(),
        workflow,
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      onWorkflowGenerated(workflow);

      if (sessionId) {
        const userId = getUserId();
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');

        const { saveWorkflow: saveWorkflowToDb } = await import('@/lib/workflow-api');
        await saveWorkflowToDb(workflow);

        await saveChatSession(
          sessionId,
          userId,
          title,
          updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.getTime(),
          })),
          workflow.id
        );

        sessionEvents.emit();
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, there was an error creating the workflow. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getNodeLabel = useCallback((nodeType: string): { icon: JSX.Element; label: string } => {
    const iconMap: Record<string, { icon: JSX.Element; label: string }> = {
      'prompt-text': { icon: <FileText className="w-3 h-3" />, label: 'Prompt' },
      'prompt-enhancer-image': { icon: <Wand2 className="w-3 h-3" />, label: 'AI Enhancer' },
      'prompt-enhancer-video': { icon: <Video className="w-3 h-3" />, label: 'Video Enhancer' },
      'vision-analyzer': { icon: <Eye className="w-3 h-3" />, label: 'Vision AI' },
      'wan2': { icon: <ImageIcon className="w-3 h-3" />, label: 'Image Gen' },
      'twitter': { icon: <Twitter className="w-3 h-3" />, label: 'Twitter' },
      'instagram': { icon: <Instagram className="w-3 h-3" />, label: 'Instagram' },
    };
    return iconMap[nodeType] || { icon: <Sparkles className="w-3 h-3" />, label: 'Unknown' };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#0446ff] flex items-center justify-center shadow-lg shadow-[#0446ff]/25">
            <img src="/logo.svg" alt="VlowGen" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 font-sans">AI Assistant</h2>
            <p className="text-xs text-gray-500">Workflow Builder</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <MessageBubble message={message} isUser={message.role === 'user'} />
            </div>

            {/* Workflow Preview for assistant messages */}
            {message.role === 'assistant' && message.workflow && (
              <div className="flex justify-start mt-3">
                <div className="max-w-[85%]">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-blue-900">Workflow Updated</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {message.workflow.nodes.slice(0, 4).map((node, idx) => {
                        const { icon, label } = getNodeLabel(node.type);
                        return (
                          <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                            <div className="px-2 py-1.5 bg-white rounded-lg border border-blue-200 shadow-sm">
                              <div className="flex items-center gap-1 text-xs font-medium text-gray-700 whitespace-nowrap">
                                {icon}
                                <span>{label}</span>
                              </div>
                            </div>
                            {idx < Math.min(3, message.workflow!.nodes.length - 1) && (
                              <ArrowRight className="w-3 h-3 text-blue-400" />
                            )}
                          </div>
                        );
                      })}
                      {message.workflow.nodes.length > 4 && (
                        <span className="text-xs text-blue-600">+{message.workflow.nodes.length - 4} more</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{message.workflow!.nodes.length} nodes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-gray-50 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-700">Generating workflow...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your workflow..."
            disabled={isGenerating}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
