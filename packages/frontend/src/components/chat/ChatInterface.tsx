'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Download, ArrowRight } from 'lucide-react';
import type { Workflow } from '@vlowgen/shared';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflow?: Workflow;
}

interface ChatInterfaceProps {
  onWorkflowGenerated: (workflow: Workflow) => void;
  onContinueToWorkflow?: () => void;
  workflow?: Workflow;
  centered?: boolean;
}

export default function ChatInterface({ 
  onWorkflowGenerated, 
  onContinueToWorkflow,
  workflow,
  centered = false 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your AI workflow assistant. 🤖\n\nJust tell me what you want to create, and I\'ll:\n✨ Build an optimized workflow\n📊 Show you each step visually\n🚀 Execute it automatically\n\nTry: "Create a viral meme and post to Instagram"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateWorkflowFromPrompt = async (prompt: string): Promise<Workflow> => {
    // Simulate AI generating workflow
    await new Promise(resolve => setTimeout(resolve, 2000));

    // AI intelligently creates workflow based on user intent
    // This demonstrates the "AI shows its work" concept
    const workflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: 'AI Generated Workflow',
      nodes: [
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
            model: 'wanx-v1',
            size: '1024x1024',
          },
        },
        {
          id: 'node-4',
          type: 'twitter',
          position: { x: 1000, y: 50 },
          data: {
            type: 'twitter',
            authenticated: false,
          },
        },
        {
          id: 'node-5',
          type: 'instagram',
          position: { x: 1000, y: 150 },
          data: {
            type: 'instagram',
            authenticated: false,
          },
        },
      ],
      edges: [
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
        {
          id: 'edge-3',
          source: 'node-3',
          target: 'node-4',
        },
        {
          id: 'edge-4',
          source: 'node-3',
          target: 'node-5',
        },
      ],
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
        content: `Perfect! I've created an optimized workflow for you:\n\n✨ **Workflow Steps:**\n1. 📝 Your prompt: "${input}"\n2. 🎨 AI Prompt Enhancer - Optimizing for better results\n3. 🖼️ Image Generation - Creating high-quality image\n4. 📱 Multi-platform Post - Twitter & Instagram\n\n💡 **Why this workflow?**\nI added a Prompt Enhancer to automatically improve your prompt with professional details like lighting, composition, and style. This ensures your generated image looks amazing!\n\nClick "Open Editor" below to see the visual workflow and execute it.`,
        timestamp: new Date(),
        workflow,
      };

      setMessages(prev => [...prev, assistantMessage]);
      onWorkflowGenerated(workflow);
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

  const handleDownloadWorkflow = () => {
    if (!workflow) return;
    
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name || 'workflow'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getNodeLabel = (nodeType: string): string => {
    const labels: Record<string, string> = {
      'prompt-text': '📝 Prompt',
      'prompt-enhancer-image': '✨ AI Enhancer',
      'prompt-enhancer-video': '🎬 Video Enhancer',
      'vision-analyzer': '👁️ Vision AI',
      'wan2': '🖼️ Image Gen',
      'openrouter': '🎨 Image Gen',
      'twitter': '🐦 Twitter',
      'instagram': '📸 Instagram',
    };
    return labels[nodeType] || '❓ Unknown';
  };

  const hasGeneratedWorkflow = workflow && workflow.nodes.length > 0;

  if (centered) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4">
              <img src="/logo.svg" alt="VlowGen Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to VlowGen
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              AI that shows its work. Describe your workflow and watch as AI builds it step-by-step with visual nodes.
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                        message.role === 'user'
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
                            {message.workflow.nodes.map((node, idx) => (
                              <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                                <div className="px-3 py-2 bg-white rounded-lg border border-blue-200 shadow-sm">
                                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                                    {getNodeLabel(node.type)}
                                  </div>
                                </div>
                                {idx < message.workflow!.nodes.length - 1 && (
                                  <div className="text-blue-400">→</div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-blue-700">
                            {message.workflow!.nodes.length} nodes • {message.workflow!.edges.length} connections
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
                placeholder="E.g., Create a workflow that generates an image and posts to Twitter"
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
            <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setInput('Create a professional product photo and post to Instagram')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Product Photo → Instagram
              </button>
              <button
                onClick={() => setInput('Generate a viral meme about AI and share on Twitter')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Viral Meme → Twitter
              </button>
              <button
                onClick={() => setInput('Create cinematic video of a dragon and post everywhere')}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Video → Multi-platform
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/logo.svg" alt="VlowGen Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-xs text-gray-500">Workflow Generator</p>
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
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <span className={`text-xs mt-1.5 block ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
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
