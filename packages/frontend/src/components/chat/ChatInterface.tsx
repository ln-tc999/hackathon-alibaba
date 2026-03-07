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
  Upload,
  X,
  User,
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
  researchOptions?: string[];
  selectedResearchTopic?: string;
}

interface ChatInterfaceProps {
  sessionId?: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onContinueToWorkflow?: () => void;
  workflow?: Workflow;
}

// Memoized Message Component
const MessageBubble = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
  <div className={`flex items-end gap-2 sm:gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    {/* Avatar */}
    <div
      className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center ${isUser
          ? 'bg-[#0446ff] text-white'
          : 'bg-white border border-slate-200 text-slate-600'
        }`}
      style={{ boxShadow: isUser ? '0 2px 12px rgba(4,70,255,0.4)' : '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
    </div>

    <div
      className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-line ${isUser
          ? 'bg-[#0446ff] text-white'
          : 'bg-white border border-slate-200 text-slate-800'
        }`}
      style={{
        boxShadow: isUser
          ? '0 4px 20px rgba(4,70,255,0.3)'
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {message.content}
      <div className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
        {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showResearchOptions, setShowResearchOptions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    'berita',
    'gadget',
    'tech',
    'sport',
    'football',
    'dance',
    'challenge',
  ];

  const isViralResearchQuery = (prompt: string): boolean => {
    const promptLower = prompt.toLowerCase();
    return viralKeywords.some((keyword) => promptLower.includes(keyword));
  };

  const isPostToSocial = (prompt: string): { platform: string; hasWorkflow: boolean } | null => {
    const promptLower = prompt.toLowerCase();
    if (
      promptLower.includes('post') ||
      promptLower.includes('share') ||
      promptLower.includes('upload')
    ) {
      if (promptLower.includes('instagram')) return { platform: 'instagram', hasWorkflow: true };
      if (promptLower.includes('twitter') || promptLower.includes('x.com'))
        return { platform: 'twitter', hasWorkflow: true };
      if (promptLower.includes('tiktok')) return { platform: 'tiktok', hasWorkflow: true };
      if (promptLower.includes('facebook')) return { platform: 'facebook', hasWorkflow: true };
      if (promptLower.includes('youtube')) return { platform: 'youtube', hasWorkflow: true };
    }
    return null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setUploadedImage({ file, preview });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[Chat] Image uploaded:', result.url);
      }
    } catch (error) {
      console.error('[Chat] Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.preview);
      setUploadedImage(null);
    }
  };

  const generateWorkflowFromPrompt = async (
    prompt: string,
    existingWorkflow?: Workflow
  ): Promise<{
    workflow?: Workflow;
    researchResult?: Message['researchResult'];
    enhancedPrompt?: string;
    researchOptions?: string[];
  }> => {
    const promptLower = prompt.toLowerCase();

    const postToSocial = isPostToSocial(prompt);

    if (postToSocial && existingWorkflow && existingWorkflow.nodes.length > 0) {
      const workflow = addSocialToWorkflow(existingWorkflow, postToSocial.platform);
      return { workflow };
    }

    if (postToSocial && !existingWorkflow) {
      const workflow = createSimplePostWorkflow(prompt);
      return { workflow };
    }

    const wantsResearch =
      promptLower.includes('riset') ||
      promptLower.includes('research') ||
      promptLower.includes('cari topik') ||
      promptLower.includes('apa trending');

    if (
      selectedTopic &&
      (promptLower.includes('mau') ||
        promptLower.includes('buat') ||
        promptLower.includes('create') ||
        promptLower.includes('generate'))
    ) {
      const fullQuery = `${selectedTopic} ${prompt}`;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/nodes/viral-research`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: fullQuery,
              nodeId: 'viral-research-node',
              enhanceWithQwen: true,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.output) {
            const research = data.output;
            let finalPrompt = research.qwenResponse || research.enhancedPrompt;
            if (!finalPrompt && research.suggestedTitles?.[0]) {
              finalPrompt = `${research.suggestedTitles[0]} ${research.hashtags
                .slice(0, 5)
                .map((h: string) => '#' + h)
                .join(' ')}`;
            }
            if (finalPrompt) {
              const workflow = generateViralWorkflow(finalPrompt, research);
              return { workflow, researchResult: research, enhancedPrompt: finalPrompt };
            }
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

  const addSocialToWorkflow = (existingWorkflow: Workflow, platform: string): Workflow => {
    const lastNode = existingWorkflow.nodes[existingWorkflow.nodes.length - 1];
    const newNodes = [...existingWorkflow.nodes];
    const newEdges = [...existingWorkflow.edges];

    const platformNodeId = `node-${platform}-${Date.now()}`;
    const platformNode: WorkflowNode = {
      id: platformNodeId,
      type: platform as any,
      position: { x: lastNode.position.x + 300, y: lastNode.position.y },
      data: { type: platform as any, authenticated: false },
    };

    newNodes.push(platformNode);
    newEdges.push({
      id: `edge-to-${platform}`,
      source: lastNode.id,
      target: platformNodeId,
    });

    return {
      ...existingWorkflow,
      nodes: newNodes,
      edges: newEdges,
      updatedAt: new Date().toISOString(),
    };
  };

  const createSimplePostWorkflow = (prompt: string): Workflow => {
    const promptLower = prompt.toLowerCase();
    const platform = promptLower.includes('instagram')
      ? 'instagram'
      : promptLower.includes('twitter') || promptLower.includes('x.com')
        ? 'twitter'
        : promptLower.includes('tiktok')
          ? 'tiktok'
          : promptLower.includes('facebook')
            ? 'facebook'
            : 'instagram';

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

    nodes.push({
      id: `node-${platform}`,
      type: platform as any,
      position: { x: 1300, y: 100 },
      data: { type: platform, authenticated: false },
    });
    edges.push({ id: `edge-to-${platform}`, source: 'node-preview', target: `node-${platform}` });

    return {
      id: `workflow-${Date.now()}`,
      name: `Post to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
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
            `Viral Content Research + AI Generation\n\n` +
            `Prompt: ${result.enhancedPrompt}\n\n` +
            `Hashtags: ${r.hashtags
              .slice(0, 8)
              .map((h: string) => '#' + h)
              .join(' ')}\n\n` +
            `Workflow created successfully!`,
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
            `Viral Content Research Results\n\n` +
            `Topics: ${r.relevantTopics.join(', ')}\n\n` +
            `Titles: ${r.suggestedTitles.join(', ')}\n\n` +
            `Hashtags: ${r.hashtags.map((h: string) => '#' + h).join(' ')}\n\n` +
            `${r.insights}`,
          timestamp: new Date(),
          researchResult: r,
        };
      } else if (result.researchOptions) {
        setShowResearchOptions(true);
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: 'Pilih topik yang ingin dibuat:',
          timestamp: new Date(),
          researchOptions: result.researchOptions,
        };
      } else if (result.workflow) {
        setCurrentWorkflow(result.workflow);
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: `Workflow created for: ${input}\n\nClick "Open Editor" to review and execute.`,
          timestamp: new Date(),
          workflow: result.workflow,
        };
      } else {
        assistantMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: 'Sorry, there was an error. Please try again.',
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

  const quickViralTags = [
    { label: 'Funny', desc: 'Humor & meme viral Indonesia', query: 'viral lucu indonesia', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Love', desc: 'Konten romantis & emosional', query: 'viral love emotional', icon: <Zap className="w-4 h-4" /> },
    { label: 'News', desc: 'Berita & trending terkini', query: 'viral berita indonesia', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Gadget', desc: 'Review & unboxing teknologi', query: 'viral gadget tech', icon: <Eye className="w-4 h-4" /> },
    { label: 'Sports', desc: 'Highlight olahraga terbaik', query: 'viral football sports', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Dance', desc: 'Challenge dance & choreography', query: 'viral dance challenge', icon: <Wand2 className="w-4 h-4" /> },
  ];

  const quickCreateTags = [
    { label: 'Product Photo', desc: 'Foto produk profesional & post ke Instagram', query: 'Create a professional product photo and post to Instagram', icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Viral Meme', desc: 'Buat meme AI lucu & viral di Twitter', query: 'Generate a viral meme about AI and share on Twitter', icon: <Twitter className="w-4 h-4" /> },
    { label: 'Video Content', desc: 'Video sinematik & post ke semua platform', query: 'Create cinematic video of a dragon and post everywhere', icon: <Video className="w-4 h-4" /> },
  ];

  return (
    <div
      className="flex items-start sm:items-center justify-center min-h-full p-3 sm:p-6 lg:p-8 font-sans overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #f0f4ff 100%)' }}
    >
      <div className="w-full max-w-3xl space-y-4 sm:space-y-6 py-2 sm:py-0">

        {/* Welcome Header */}
        {messages.length === 0 && (
          <div className="text-center space-y-2 sm:space-y-3 animate-fade-in-up pb-2">
            <div
              className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-1"
              style={{
                background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
                boxShadow: '0 8px 32px rgba(4,70,255,0.35)',
              }}
            >
              <img src="/logo.svg" alt="VlowGen" className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                VlowGen <span style={{ color: '#0446ff' }}>AI</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 px-4">
                Describe your content idea — get a full automated workflow instantly.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 px-2">
              {[
                { icon: <Zap className="w-3 h-3" />, label: 'Instant Generation' },
                { icon: <Sparkles className="w-3 h-3" />, label: 'AI-Enhanced' },
                { icon: <TrendingUp className="w-3 h-3" />, label: 'Viral Research' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500">
                  <span style={{ color: '#0446ff' }}>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 max-h-[40vh] sm:max-h-[45vh] lg:max-h-[55vh] overflow-y-auto px-1">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <MessageBubble message={message} isUser={message.role === 'user'} />

                {/* Research Options */}
                {message.role === 'assistant' && message.researchOptions && (
                  <div className="flex justify-start pl-8 sm:pl-10 mt-2">

                    <div className="max-w-[85%] space-y-2">
                      <p className="text-xs text-slate-500 font-medium">Pilih topik:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.researchOptions.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTopic(option);
                              setInput(`oke mau buat konten ${option}`);
                              setShowResearchOptions(false);
                              setTimeout(() => handleSend(), 100);
                            }}
                            className="px-3 py-1.5 text-xs bg-white border border-slate-200 hover:border-[#0446ff] hover:text-[#0446ff] transition-all text-slate-700 font-medium"
                            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Workflow Preview */}
                {message.role === 'assistant' && message.workflow && (
                  <div className="flex justify-start pl-8 sm:pl-10 mt-2">

                    <div className="max-w-[90%] w-full">
                      <div
                        className="border p-4 space-y-3"
                        style={{
                          background: 'linear-gradient(135deg, rgba(4,70,255,0.04) 0%, rgba(4,70,255,0.02) 100%)',
                          borderColor: 'rgba(4,70,255,0.2)',
                          boxShadow: '0 4px 20px rgba(4,70,255,0.08)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 animate-pulse"
                            style={{ background: '#0446ff' }}
                          />
                          <span className="text-xs font-semibold" style={{ color: '#0446ff' }}>
                            Workflow Ready
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {message.workflow.nodes.length} nodes · {message.workflow.edges.length} edges
                          </span>
                        </div>

                        {/* Node pipeline */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {message.workflow.nodes.map((node, idx) => {
                            const { icon, label } = getNodeLabel(node.type);
                            return (
                              <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                                <div
                                  className="px-2.5 py-1.5 bg-white border flex items-center gap-1.5 text-xs font-medium text-slate-700"
                                  style={{
                                    borderColor: 'rgba(4,70,255,0.15)',
                                    boxShadow: '0 1px 4px rgba(4,70,255,0.08)',
                                  }}
                                >
                                  <span style={{ color: '#0446ff' }}>{icon}</span>
                                  <span>{label}</span>
                                </div>
                                {idx < message.workflow!.nodes.length - 1 && (
                                  <ArrowRight className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleDownloadWorkflow}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                          <button
                            onClick={onContinueToWorkflow}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                            style={{
                              background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
                              boxShadow: '0 2px 12px rgba(4,70,255,0.35)',
                            }}
                          >
                            Open Editor
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Generating indicator */}
            {isGenerating && (
              <div className="flex items-end gap-2.5">
                <div
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-white border border-slate-200"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <Bot className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div
                  className="px-4 py-3 bg-white border border-slate-200"
                  style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#0446ff' }} />
                    <span className="text-sm text-slate-500">Generating workflow...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Box */}
        <div
          className="bg-white border border-slate-200 p-2 sm:p-3"
          style={{ boxShadow: '0 8px 40px rgba(4,70,255,0.08), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          {/* Image preview */}
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage.preview}
                alt="Uploaded"
                className="max-h-20 border border-slate-200"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 hover:bg-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Upload */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="chat-image-upload"
            />
            <label
              htmlFor="chat-image-upload"
              className="flex items-center justify-center p-2.5 text-slate-400 hover:text-[#0446ff] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </label>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                uploadedImage
                  ? 'Describe what to do with this image...'
                  : 'Describe your content idea...'
              }
              disabled={isGenerating}
              className="flex-1 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:ring-0 font-sans disabled:opacity-50"
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !uploadedImage) || isGenerating}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
                boxShadow: '0 2px 12px rgba(4,70,255,0.4)',
              }}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {uploadedImage ? 'Analyze' : 'Generate'}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Cards */}
        <div className="space-y-5">

          {/* Section: Viral Research */}
          <div className="space-y-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#0446ff' }} />
              Cari konten viral
            </p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {quickViralTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => setInput(tag.query)}
                  className="group flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white border border-slate-200 text-center transition-all hover:-translate-y-0.5 hover:border-[#0446ff] hover:shadow-md"
                  style={{ borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                >
                  <span
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 group-hover:bg-blue-50 transition-colors"
                    style={{ borderRadius: '8px' }}
                  >
                    <span className="group-hover:text-[#0446ff] transition-colors text-slate-400">
                      {tag.icon}
                    </span>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-[#0446ff] transition-colors">
                      {tag.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                      {tag.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Create Content */}
          <div className="space-y-2.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              Atau buat konten
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {quickCreateTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => setInput(tag.query)}
                  className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-white border border-slate-200 text-left transition-all hover:-translate-y-0.5 hover:border-[#0446ff] hover:shadow-md"
                  style={{ borderRadius: '10px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                >
                  <span
                    className="w-9 h-9 flex items-center justify-center bg-slate-50 flex-shrink-0 group-hover:bg-blue-50 transition-colors"
                    style={{ borderRadius: '8px' }}
                  >
                    <span className="text-slate-400 group-hover:text-[#0446ff] transition-colors">
                      {tag.icon}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-tight group-hover:text-[#0446ff] transition-colors">
                      {tag.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {tag.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
