import { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  Send,
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
  Sparkles,
  TrendingUp,
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
  researchResult?: {
    relevantTopics: string[];
    suggestedTitles: string[];
    recommendedReferences: string[];
    hashtags: string[];
    insights: string;
  };
}

interface ChatInterfaceProps {
  sessionId?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onContinueToWorkflow?: () => void;
  workflow?: Workflow;
}

// Memoized Message Component
const MessageBubble = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
  <div
    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
      isUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'
    }`}
  >
    <p className="text-sm whitespace-pre-line leading-relaxed font-sans">{message.content}</p>
  </div>
));

MessageBubble.displayName = 'MessageBubble';

export default function ChatInterface({
  sessionId,
  onWorkflowGenerated,
  onContinueToWorkflow,
  workflow,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | undefined>(workflow);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session messages when sessionId changes
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || sessionId.startsWith('session_')) {
        setMessages([]);
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

  const viralKeywords = [
    'viral',
    'trending',
    'konten',
    'research',
    'lucu',
    'funny',
    'comedy',
    'love',
    'emotional',
    'meme',
    'hot',
    'most',
  ];

  const isViralResearchQuery = (prompt: string): boolean => {
    const promptLower = prompt.toLowerCase();
    return viralKeywords.some((keyword) => promptLower.includes(keyword));
  };

  const generateWorkflowFromPrompt = async (
    prompt: string,
    existingWorkflow?: Workflow
  ): Promise<{
    workflow?: Workflow;
    researchResult?: Message['researchResult'];
    enhancedPrompt?: string;
  }> => {
    const promptLower = prompt.toLowerCase();

    if (isViralResearchQuery(prompt)) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/nodes/viral-research`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: prompt,
              nodeId: 'viral-research-node',
              enhanceWithQwen: true,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.output) {
            const research = data.output;

            // Use Qwen-enhanced prompt if available, otherwise fall back to suggested titles
            let finalPrompt = research.qwenResponse || research.enhancedPrompt;

            if (!finalPrompt && research.suggestedTitles && research.suggestedTitles.length > 0) {
              finalPrompt = `${research.suggestedTitles[0]} ${research.hashtags
                .slice(0, 5)
                .map((h: string) => '#' + h)
                .join(' ')}`;
            }

            if (finalPrompt) {
              const workflow = generateViralWorkflow(finalPrompt, research);
              return { workflow, researchResult: research, enhancedPrompt: finalPrompt };
            }

            return { researchResult: research };
          }
        }
      } catch (error) {
        console.error('Viral research error:', error);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { workflow: generateNewWorkflow(prompt) };
  };

  const generateViralWorkflow = (
    enhancedPrompt: string,
    research: Message['researchResult']
  ): Workflow => {
    const hashtags = research?.hashtags?.slice(0, 5).join(' ') || 'viral fyp';

    const nodes: WorkflowNode[] = [
      {
        id: 'node-1',
        type: 'prompt-text',
        position: { x: 100, y: 100 },
        data: {
          type: 'prompt-text',
          promptText: enhancedPrompt,
        },
      },
      {
        id: 'node-2',
        type: 'prompt-enhancer-image',
        position: { x: 400, y: 100 },
        data: {
          type: 'prompt-enhancer-image',
          userPrompt: enhancedPrompt,
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
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' },
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
    edges.push({ id: 'edge-preview', source: 'node-3', target: 'node-preview' });

    // Add social platforms
    let currentY = 50;

    nodes.push({
      id: 'node-twitter',
      type: 'twitter',
      position: { x: 1300, y: currentY },
      data: { type: 'twitter', authenticated: false },
    });
    edges.push({ id: 'edge-twitter', source: 'node-preview', target: 'node-twitter' });
    currentY += 150;

    nodes.push({
      id: 'node-instagram',
      type: 'instagram',
      position: { x: 1300, y: currentY },
      data: { type: 'instagram', authenticated: false },
    });
    edges.push({ id: 'edge-instagram', source: 'node-preview', target: 'node-instagram' });

    return {
      id: `workflow-${Date.now()}`,
      name: 'Viral Content Workflow',
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
      const result = await generateWorkflowFromPrompt(input, currentWorkflow);

      let assistantMessage: Message;

      if (result.researchResult && result.workflow) {
        const r = result.researchResult;
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content:
            `📊 **Viral Content Research + AI Generation**\n\n` +
            `**Research Insights:**\n${r.insights.slice(0, 200)}...\n\n` +
            `**Selected Title:** ${result.enhancedPrompt}\n\n` +
            `**Hashtags:** ${r.hashtags
              .slice(0, 8)
              .map((h: string) => `#${h}`)
              .join(' ')}\n\n` +
            `✅ Generated workflow with viral-optimized prompt!`,
          timestamp: new Date(),
          workflow: result.workflow,
          researchResult: r,
        };
      } else if (result.researchResult) {
        const r = result.researchResult;
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content:
            `📊 **Viral Content Research Results**\n\n` +
            `**Top Topics:**\n${r.relevantTopics.map((t) => `• ${t}`).join('\n')}\n\n` +
            `**Trending Titles:**\n${r.suggestedTitles.map((t) => `• ${t}`).join('\n')}\n\n` +
            `**Hashtags:** ${r.hashtags.map((h) => `#${h}`).join(' ')}\n\n` +
            `💡 ${r.insights}`,
          timestamp: new Date(),
          researchResult: r,
        };
      } else if (result.workflow) {
        setCurrentWorkflow(result.workflow);
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: `Perfect! I've created your workflow:\n\n${input}\n\nSteps:\n1. Prompt enhancement\n2. Image generation\n3. Multi-platform posting\n\nClick "Open Editor" to review and execute.`,
          timestamp: new Date(),
          workflow: result.workflow,
        };
      } else {
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date(),
        };
      }

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      if (result.workflow) {
        onWorkflowGenerated(result.workflow);

        if (sessionId) {
          const userId = getUserId();
          const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');

          const { saveWorkflow: saveWorkflowToDb } = await import('@/lib/workflow-api');
          await saveWorkflowToDb(result.workflow);

          await saveChatSession(
            sessionId,
            userId,
            title,
            updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp.getTime(),
            })),
            result.workflow.id
          );

          sessionEvents.emit();
        }
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
    return iconMap[nodeType] || { icon: <Sparkles className="w-3 h-3" />, label: 'Unknown' };
  }, []);

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-none mb-3 sm:mb-4 bg-[#0446ff] shadow-lg shadow-[#0446ff]/25">
            <img src="/logo.svg" alt="VlowGen" className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 font-sans">VlowGen</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            AI-powered workflow automation. Describe what you want, and watch it build
            automatically.
          </p>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 max-h-48 sm:max-h-64 lg:max-h-96 overflow-y-auto px-2">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <MessageBubble message={message} isUser={message.role === 'user'} />
                </div>

                {/* Workflow Preview */}
                {message.role === 'assistant' && message.workflow && (
                  <div className="flex justify-start mt-3">
                    <div className="max-w-[85%] space-y-3">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-xs font-semibold text-blue-900">
                            Workflow Preview
                          </span>
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
                          <span>
                            {message.workflow!.nodes.length} nodes •{' '}
                            {message.workflow!.edges.length} connections
                          </span>
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

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe what you want to create..."
              disabled={isGenerating}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm border-0 focus:outline-none focus:ring-0 disabled:bg-white disabled:text-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 font-medium text-sm whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>
        </div>

        {/* Quick Actions - Viral Research */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <span>Cari konten viral:</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setInput('viral lucu indonesia')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-pink-400 to-pink-500 text-white border-0 rounded-lg hover:from-pink-500 hover:to-pink-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Funny</span>
            </button>
            <button
              onClick={() => setInput('viral love emotional')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-red-400 to-red-500 text-white border-0 rounded-lg hover:from-red-500 hover:to-red-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Love</span>
            </button>
            <button
              onClick={() => setInput('viral berita indonesia')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-400 to-blue-500 text-white border-0 rounded-lg hover:from-blue-500 hover:to-blue-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>News</span>
            </button>
            <button
              onClick={() => setInput('viral gadget tech')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-green-400 to-green-500 text-white border-0 rounded-lg hover:from-green-500 hover:to-green-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Gadget</span>
            </button>
            <button
              onClick={() => setInput('viral football sports')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-orange-400 to-orange-500 text-white border-0 rounded-lg hover:from-orange-500 hover:to-orange-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Sports</span>
            </button>
            <button
              onClick={() => setInput('viral dance challenge')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 rounded-lg hover:from-purple-500 hover:to-purple-600 hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Dance</span>
            </button>
          </div>
        </div>

        {/* Quick Actions - Create Content */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Atau buat konten:</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setInput('Create a professional product photo and post to Instagram')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <Instagram className="w-3 h-3" />
              <span>Product Photo</span>
            </button>
            <button
              onClick={() => setInput('Generate a viral meme about AI and share on Twitter')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-1.5 sm:gap-2"
            >
              <Twitter className="w-3 h-3" />
              <span>Viral Meme</span>
            </button>
            <button
              onClick={() => setInput('Create cinematic video of a dragon and post everywhere')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-1.5 sm:gap-2"
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
