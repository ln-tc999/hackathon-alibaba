import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  Download,
  ArrowRight,
  Bot,
  CheckCircle2,
  Zap,
  Image as ImageIcon,
  Twitter,
  Instagram,
  FileText,
  Wand2,
  Video,
  Eye,
  Palette,
  MessageSquare
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

interface ChatInterfaceProps {
  sessionId?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onContinueToWorkflow?: () => void;
  workflow?: Workflow;
  centered?: boolean;
}

// Memoized Message Component for better performance
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
    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
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

export default function ChatInterface({
  sessionId,
  onWorkflowGenerated,
  onContinueToWorkflow,
  workflow,
  centered = false
}: ChatInterfaceProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session messages when sessionId changes
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || sessionId.startsWith('session_')) {
        // New session, reset to default message
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

      // Load existing session
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
    // Simulate AI generating workflow
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI intelligently creates workflow based on user intent
    // This demonstrates the "AI shows its work" concept
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

    const isTwitterRequested = prompt.toLowerCase().includes('twitter') || prompt.toLowerCase().includes('x');
    const isInstagramRequested = prompt.toLowerCase().includes('instagram') || prompt.toLowerCase().includes('ig');
    let currentY = 50;

    // Add twitter node if mentioned
    if (isTwitterRequested) {
      nodes.push({
        id: 'node-twitter',
        type: 'twitter',
        position: { x: 1000, y: currentY },
        data: {
          type: 'twitter',
          authenticated: false,
        },
      });
      edges.push({
        id: `edge-twitter`,
        source: 'node-3',
        target: 'node-twitter',
      });
      currentY += 150;
    }

    // Add instagram node if mentioned
    if (isInstagramRequested) {
      nodes.push({
        id: 'node-instagram',
        type: 'instagram',
        position: { x: 1000, y: currentY },
        data: {
          type: 'instagram',
          authenticated: false,
        },
      });
      edges.push({
        id: `edge-instagram`,
        source: 'node-3',
        target: 'node-instagram',
      });
    }

    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: 'AI Generated Workflow',
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return workflow;
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
      const workflow = await generateWorkflowFromPrompt(input);

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `Perfect! I've created your workflow:\n\n${input}\n\nSteps:\n1. Prompt enhancement\n2. Image generation\n3. Multi-platform posting\n\nClick "Open Editor" to review and execute.`,
        timestamp: new Date(),
        workflow,
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      onWorkflowGenerated(workflow);

      // Save workflow first, then save session
      if (sessionId) {
        const userId = getUserId();
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');

        // Save workflow to IndexedDB
        const { saveWorkflow: saveWorkflowToDb } = await import('@/lib/workflow-api');
        await saveWorkflowToDb(workflow);

        // Then save chat session with workflow reference
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

        // Notify session list to refresh
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

  const handleDownloadWorkflow = useCallback(() => {
    if (!workflow) return;

    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [workflow]);

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

  const hasGeneratedWorkflow = useMemo(() =>
    workflow && workflow.nodes.length > 0,
    [workflow]
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-blue-500 to-indigo-600">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              VlowGen
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              AI-powered workflow automation. Describe what you want, and watch it build automatically.
            </p>
          </div>

          {/* Messages - with card containers */}
          {messages.length > 1 && (
            <div className="space-y-4 max-h-96 overflow-y-auto px-2">
              {messages.slice(1).map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>

                  {/* Action buttons below AI message if workflow was generated */}
                  {message.role === 'assistant' && message.workflow && hasGeneratedWorkflow && (
                    <div className="flex justify-start mt-3">
                      <div className="max-w-[85%] space-y-3">
                        {/* Mini Workflow Preview */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-semibold text-blue-900">Workflow Preview</span>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {message.workflow.nodes.map((node, idx) => {
                              const { icon, label } = getNodeLabel(node.type);
                              return (
                                <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                                  <div className="px-3 py-2 bg-white rounded-lg border border-blue-200 shadow-sm">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
                                      {icon}
                                      <span>{label}</span>
                                    </div>
                                  </div>
                                  {idx < message.workflow!.nodes.length - 1 && (
                                    <ArrowRight className="w-3 h-3 text-blue-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{message.workflow!.nodes.length} nodes • {message.workflow!.edges.length} connections</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleDownloadWorkflow}
                            className="px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-300 shadow-sm"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={onContinueToWorkflow}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm"
                          >
                            <span>Open Editor</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-700">Generating workflow...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input - standalone */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want to create..."
                disabled={isGenerating}
                className="flex-1 px-4 py-3 text-sm border-0 focus:outline-none focus:ring-0 disabled:bg-white disabled:text-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Quick examples:</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setInput('Create a professional product photo and post to Instagram')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2"
              >
                <Instagram className="w-3 h-3" />
                <span>Product Photo</span>
              </button>
              <button
                onClick={() => setInput('Generate a viral meme about AI and share on Twitter')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2"
              >
                <Twitter className="w-3 h-3" />
                <span>Viral Meme</span>
              </button>
              <button
                onClick={() => setInput('Create cinematic video of a dragon and post everywhere')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-2"
              >
                <Video className="w-3 h-3" />
                <span>Video Content</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-xs text-gray-500">Autonomous Workflow Builder</p>
          </div>
        </div>
      </div>

      {/* Messages - with card containers */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <MessageBubble message={message} isUser={message.role === 'user'} />
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
