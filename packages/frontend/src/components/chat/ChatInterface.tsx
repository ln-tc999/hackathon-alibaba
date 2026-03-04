import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Send,
  Sparkles,
  Loader2,
  Download,
  ArrowRight,
  Bot,
  CheckCircle2,
  Image as ImageIcon,
  Twitter,
  Instagram,
  FileText,
  Wand2,
  Video,
  Eye,
  MessageSquare,
  Zap,
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

// Memoized Message Component
const MessageBubble = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
    {!isUser && (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
      </div>
    )}
    <div
      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200'
          : 'bg-white text-gray-800 shadow-sm border border-gray-100'
      }`}
    >
      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      <span
        className={`text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 block ${isUser ? 'text-blue-100' : 'text-gray-400'}`}
      >
        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    {isUser && (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0 mt-0.5">
        <span className="text-xs font-semibold text-gray-600">U</span>
      </div>
    )}
  </div>
));

MessageBubble.displayName = 'MessageBubble';

export default function ChatInterface({
  sessionId,
  onWorkflowGenerated,
  onContinueToWorkflow,
  workflow,
  centered = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hi! I\'m your AI assistant.\n\nTell me what you want to create, and I\'ll build an optimized workflow automatically.\n\nTry: "Create a viral meme and post to Instagram"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load session messages when sessionId changes
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || sessionId.startsWith('session_')) {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content:
              'Hi! I\'m your AI assistant.\n\nTell me what you want to create, and I\'ll build an optimized workflow automatically.\n\nTry: "Create a viral meme and post to Instagram"',
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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const nodes: WorkflowNode[] = [
      {
        id: 'node-1',
        type: 'prompt-text',
        position: { x: 100, y: 100 },
        data: { type: 'prompt-text', promptText: prompt },
      },
      {
        id: 'node-2',
        type: 'prompt-enhancer-image',
        position: { x: 400, y: 100 },
        data: { type: 'prompt-enhancer-image', userPrompt: prompt },
      },
      {
        id: 'node-3',
        type: 'wan2',
        position: { x: 700, y: 100 },
        data: { type: 'wan2', model: 'wan2.1-t2i-turbo', size: '1024*1024' },
      },
    ];

    const edges: WorkflowEdge[] = [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' },
    ];

    const previewNode: WorkflowNode = {
      id: 'node-preview',
      type: 'preview',
      position: { x: 1000, y: 100 },
      data: { type: 'preview', mediaType: 'auto', showMetadata: true },
    };
    nodes.push(previewNode);
    edges.push({ id: 'edge-preview', source: 'node-3', target: 'node-preview' });

    const isTwitterRequested =
      prompt.toLowerCase().includes('twitter') || prompt.toLowerCase().includes(' x ');
    const isInstagramRequested =
      prompt.toLowerCase().includes('instagram') || prompt.toLowerCase().includes('ig');
    let currentY = 50;

    if (isTwitterRequested) {
      nodes.push({
        id: 'node-twitter',
        type: 'twitter',
        position: { x: 1300, y: currentY },
        data: { type: 'twitter', authenticated: false },
      });
      edges.push({ id: 'edge-twitter', source: 'node-preview', target: 'node-twitter' });
      currentY += 150;
    }

    if (isInstagramRequested) {
      nodes.push({
        id: 'node-instagram',
        type: 'instagram',
        position: { x: 1300, y: currentY },
        data: { type: 'instagram', authenticated: false },
      });
      edges.push({ id: 'edge-instagram', source: 'node-preview', target: 'node-instagram' });
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

    setMessages((prev) => [...prev, userMessage]);
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

      if (sessionId) {
        const userId = getUserId();
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');

        const { saveWorkflow: saveWorkflowToDb } = await import('@/lib/workflow-api');
        await saveWorkflowToDb(workflow);

        await saveChatSession(
          sessionId,
          userId,
          title,
          updatedMessages.map((m) => ({
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
      setMessages((prev) => [...prev, errorMessage]);
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
      wan2: { icon: <ImageIcon className="w-3 h-3" />, label: 'Image Gen' },
      twitter: { icon: <Twitter className="w-3 h-3" />, label: 'Twitter' },
      instagram: { icon: <Instagram className="w-3 h-3" />, label: 'Instagram' },
    };
    return iconMap[nodeType] || { icon: <Sparkles className="w-3 h-3" />, label: 'AI Node' };
  }, []);

  const hasGeneratedWorkflow = useMemo(() => workflow && workflow.nodes.length > 0, [workflow]);

  // Example prompts
  const examplePrompts = [
    {
      icon: <Instagram className="w-3.5 h-3.5" />,
      label: 'Product Photo',
      action: () => setInput('Create a professional product photo and post to Instagram'),
    },
    {
      icon: <Twitter className="w-3.5 h-3.5" />,
      label: 'Viral Meme',
      action: () => setInput('Generate a viral meme about AI and share on Twitter'),
    },
    {
      icon: <Video className="w-3.5 h-3.5" />,
      label: 'Video Content',
      action: () => setInput('Create cinematic video of a dragon and post everywhere'),
    },
  ];

  // ─── CENTERED MODE (Hero / Landing page) ───────────────────────────────────
  if (centered) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, rgba(219,234,254,0.45) 0%, rgba(238,242,255,0.3) 50%, rgba(255,255,255,0) 100%)',
        }}
      >
        <div className="w-full max-w-2xl flex flex-col gap-2.5 sm:gap-3 md:gap-4">
          {/* Header */}
          <div className="text-center px-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs sm:text-sm font-medium mb-2.5 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Powered by Qwen AI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-1.5 sm:mb-2">
              VlowGen
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto">
              AI-powered workflow automation. Describe what you want, and watch it build
              automatically.
            </p>
          </div>

          {/* Messages area (shown only after first message) */}
          {messages.length > 1 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 max-h-60 sm:max-h-72 md:max-h-80 overflow-y-auto">
              {messages.slice(1).map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2.5 sm:mb-3`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 sm:mr-2.5 flex-shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-100'
                          : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>

                  {/* Workflow preview card */}
                  {message.role === 'assistant' && message.workflow && hasGeneratedWorkflow && (
                    <div className="ml-7 sm:ml-9 mb-2.5 sm:mb-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-2.5 sm:p-3">
                        <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 uppercase tracking-wide">
                            Workflow Preview
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                          {message.workflow.nodes.map((node, idx) => {
                            const { icon, label } = getNodeLabel(node.type);
                            return (
                              <div
                                key={node.id}
                                className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
                              >
                                <div className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white rounded-lg border border-blue-100 shadow-sm">
                                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-gray-700 whitespace-nowrap">
                                    {icon}
                                    <span>{label}</span>
                                  </div>
                                </div>
                                {idx < message.workflow!.nodes.length - 1 && (
                                  <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300 flex-shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-blue-500">
                          <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>
                            {message.workflow.nodes.length} nodes • {message.workflow.edges.length}{' '}
                            connections
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-2">
                        <button
                          onClick={handleDownloadWorkflow}
                          className="px-2.5 sm:px-3 py-1.5 bg-white text-gray-600 rounded-lg hover:bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={onContinueToWorkflow}
                          className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1.5 transition-opacity shadow-sm shadow-blue-200"
                        >
                          <span>Open Editor</span>
                          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start mb-2.5 sm:mb-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 sm:mr-2.5 flex-shrink-0">
                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 animate-spin" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        Building your workflow...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input card — single flex row */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/80">
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want to create..."
                disabled={isGenerating}
                className="flex-1 text-sm sm:text-base text-gray-700 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-opacity shadow-sm shadow-blue-200 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Example prompt pills */}
          <div className="text-center px-2">
            <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-2.5 flex items-center justify-center gap-1.5">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Quick examples:</span>
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-2.5 justify-center">
              {examplePrompts.map((ex) => (
                <button
                  key={ex.label}
                  onClick={ex.action}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-full text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium transition-all shadow-sm hover:shadow"
                >
                  {ex.icon}
                  <span>{ex.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SIDEBAR / PANEL MODE ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 bg-white">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
          <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-semibold text-gray-800">AI Assistant</p>
          <p className="text-[10px] sm:text-[11px] text-gray-400">Workflow Builder</p>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] sm:text-[11px] text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-1">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isUser={message.role === 'user'} />
        ))}
        {isGenerating && (
          <div className="flex justify-start mb-3 sm:mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 shadow-sm">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 animate-spin" />
                <span className="text-xs sm:text-sm text-gray-500">Building your workflow...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-2.5 sm:px-3 py-2.5 sm:py-3 border-t border-gray-100 bg-white">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          {/* Input row */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 pb-2 sm:pb-2.5 pt-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your workflow..."
              disabled={isGenerating}
              rows={1}
              className="flex-1 text-xs sm:text-sm text-gray-700 placeholder-gray-400 resize-none border-0 focus:outline-none focus:ring-0 bg-transparent disabled:opacity-50 leading-relaxed"
              style={{ minHeight: '24px', maxHeight: '96px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-opacity shadow-sm shadow-blue-200 flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
