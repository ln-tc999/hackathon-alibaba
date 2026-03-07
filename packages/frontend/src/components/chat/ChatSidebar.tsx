import { useState, useRef, useCallback, memo, Suspense, useEffect } from 'react';
import { Send, Loader2, Plus } from 'lucide-react';
import type { Workflow } from '@vlowgen/shared';
import { saveWorkflow as saveWorkflowToDb } from '@/lib/workflow-api';
import { executeWorkflow } from '@/lib/api-client';
import { useWorkflowGenerator } from '@/hooks/useWorkflowGenerator';
import { useChatSession } from '@/hooks/useChatSession';
import { getNodeLabel } from '@/lib/chat-constants';
import WorkflowPreview from './WorkflowPreview';
import { toast } from 'sonner';
import { detectIntent, getSuggestions } from '@/lib/intent-detector';
import { chatWithAI, generateCaption } from '@/lib/ai-chat-api';

interface ChatSidebarProps {
  sessionId: string;
  onWorkflowGenerated: (workflow: Workflow) => void;
  workflow?: Workflow;
  onNewSession?: () => void;
}

// Memoized Message Bubble
const MessageBubble = memo(({
  message,
  isUser
}: {
  message: { id: string; role: string; content: string; timestamp: Date; type?: string };
  isUser: boolean;
}) => (
  <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
    <div
      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white"
      style={{
        background: isUser
          ? 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)'
          : '#f1f5f9',
        boxShadow: isUser ? '0 2px 8px rgba(4,70,255,0.35)' : 'none',
      }}
    >
      {isUser ? (
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ) : (
        <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
      )}
    </div>

    <div
      className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed font-sans whitespace-pre-line ${
        isUser ? 'text-white' : 'text-slate-700 bg-white border border-slate-200'
      }`}
      style={isUser
        ? {
          background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
          boxShadow: '0 2px 12px rgba(4,70,255,0.3)',
        }
        : {
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }
      }
    >
      {message.content}
      <div className={`text-[10px] mt-1 ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
        {message.timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  </div>
));

MessageBubble.displayName = 'MessageBubble';

export default function ChatSidebar({
  sessionId,
  onWorkflowGenerated,
  workflow,
  onNewSession
}: ChatSidebarProps) {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { messages, addMessage, saveSession } = useChatSession(sessionId);
  const { generateWorkflowFromPrompt } = useWorkflowGenerator();

  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | undefined>(workflow);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show initial greeting and suggestions
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: 'msg-greeting',
        role: 'assistant',
        content: "Hi! 👋 I'm your AI workflow assistant. I can help you:\n\n• Create automated workflows\n• Post to social media (Twitter, Instagram, Facebook, YouTube, TikTok)\n• Generate AI images and videos\n• Answer questions about the platform\n\nWhat would you like to create today?",
        timestamp: new Date(),
        type: 'greeting',
      });
      setSuggestions(getSuggestions({ type: 'greeting', confidence: 1 }));
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsGenerating(true);
    setSuggestions([]);

    try {
      // Step 1: Detect intent
      const intent = detectIntent(input);
      
      // Step 2: Handle based on intent
      if (intent.type === 'greeting') {
        // Respond to greeting
        const aiResponse = await chatWithAI([...messages, userMessage]);
        addMessage({
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
          type: 'greeting',
        });
        setSuggestions(aiResponse.suggestions || []);
        
      } else if (intent.type === 'help') {
        // Provide help
        const aiResponse = await chatWithAI([...messages, userMessage]);
        addMessage({
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
          type: 'help',
        });
        setSuggestions(aiResponse.suggestions || []);
        
      } else if (intent.type === 'question') {
        // Answer question
        const aiResponse = await chatWithAI([...messages, userMessage]);
        addMessage({
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
          type: 'answer',
        });
        setSuggestions(aiResponse.suggestions || []);
        
      } else if (intent.type === 'workflow_create' || (intent.type === 'chat' && intent.confidence < 0.6)) {
        // Create new workflow
        const newWorkflow = generateWorkflowFromPrompt(input, undefined);
        setCurrentWorkflow(newWorkflow);
        onWorkflowGenerated(newWorkflow);

        const credentials = {
          wan2ApiKey: import.meta.env.PUBLIC_WAN2_API_KEY || '',
          openRouterApiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
          composioApiKey: import.meta.env.PUBLIC_COMPOSIO_API_KEY || '',
        };

        const result = await executeWorkflow(newWorkflow, credentials);

        if (result.status === 'success') {
          const aiCaption = await generateCaption(input, intent.platforms || []);
          
          addMessage({
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: `Perfect! I've created your workflow:\n\n${aiCaption}\n\n**Steps:**\n1. Prompt enhancement\n2. Image generation with Wan2.1\n3. Ready to post to social media\n\nCheck the canvas to see your workflow! 🎨`,
            timestamp: new Date(),
            type: 'workflow_result',
            workflowId: newWorkflow.id,
          });

          const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
          await saveWorkflowToDb(newWorkflow);
          await saveSession(title, newWorkflow.id);

          toast.success('Workflow created successfully!');
        } else {
          addMessage({
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: `I've created your workflow, but execution failed:\n\n${result.error || 'Unknown error'}\n\nYou can still see and edit the workflow in the canvas.`,
            timestamp: new Date(),
            type: 'workflow_result',
            workflowId: newWorkflow.id,
          });
          toast.error('Workflow execution failed');
        }
        
      } else if (intent.type === 'workflow_modify' && currentWorkflow) {
        // Modify existing workflow
        const newWorkflow = generateWorkflowFromPrompt(input, currentWorkflow);
        setCurrentWorkflow(newWorkflow);
        onWorkflowGenerated(newWorkflow);

        const credentials = {
          wan2ApiKey: import.meta.env.PUBLIC_WAN2_API_KEY || '',
          openRouterApiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY || '',
          composioApiKey: import.meta.env.PUBLIC_COMPOSIO_API_KEY || '',
        };

        const result = await executeWorkflow(newWorkflow, credentials);

        if (result.status === 'success') {
          const platformNames = getPlatformNames(newWorkflow, currentWorkflow);
          const aiCaption = await generateCaption(input, intent.platforms || []);
          
          addMessage({
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: `Great! I've added **${platformNames}** to your workflow.\n\n${aiCaption}\n\nThe workflow executed successfully! Check the canvas to see the results. ✅`,
            timestamp: new Date(),
            type: 'workflow_result',
            workflowId: newWorkflow.id,
          });

          toast.success('Workflow updated successfully!');
        } else {
          addMessage({
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: `I've updated your workflow, but execution failed:\n\n${result.error || 'Unknown error'}`,
            timestamp: new Date(),
            type: 'workflow_result',
            workflowId: newWorkflow.id,
          });
          toast.error('Workflow execution failed');
        }
        
      } else if (intent.type === 'workflow_modify' && !currentWorkflow) {
        // User wants to modify but no workflow exists
        addMessage({
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: "I'd be happy to help you post to those platforms! But first, let's create a workflow. Could you tell me what content you'd like to post?",
          timestamp: new Date(),
          type: 'suggestion',
        });
        setSuggestions([
          'Create a viral meme',
          'Generate an AI image',
          'Make content for Instagram',
        ]);
        
      } else {
        // Default chat response
        const aiResponse = await chatWithAI([...messages, userMessage]);
        addMessage({
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: aiResponse.response,
          timestamp: new Date(),
          type: 'chat',
        });
        setSuggestions(aiResponse.suggestions || []);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Still generate workflow even if execution fails
      const newWorkflow = generateWorkflowFromPrompt(input, currentWorkflow);
      setCurrentWorkflow(newWorkflow);
      onWorkflowGenerated(newWorkflow);

      addMessage({
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `I've created your workflow, but there was an error:\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nYou can still see and edit the workflow in the canvas.`,
        timestamp: new Date(),
        type: 'workflow_result',
        workflowId: newWorkflow.id,
      });
      toast.error('Failed to execute workflow');
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, currentWorkflow, messages, generateWorkflowFromPrompt, onWorkflowGenerated, addMessage, saveSession]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleNewChat = useCallback(() => {
    onNewSession?.();
  }, [onNewSession]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  // Helper function to get platform names that were added
  const getPlatformNames = useCallback((newWorkflow: Workflow, oldWorkflow: Workflow): string => {
    const oldPlatformTypes = new Set(oldWorkflow.nodes.filter(n => 
      ['twitter', 'instagram', 'facebook', 'youtube', 'tiktok'].includes(n.type)
    ).map(n => n.type));
    
    const newPlatforms = newWorkflow.nodes
      .filter(n => ['twitter', 'instagram', 'facebook', 'youtube', 'tiktok'].includes(n.type) && !oldPlatformTypes.has(n.type))
      .map(n => n.type.charAt(0).toUpperCase() + n.type.slice(1));
    
    return newPlatforms.join(' & ');
  }, []);

  return (
    <div className="flex flex-col h-full font-sans" style={{ background: '#fafbff', height: '100%' }}>
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 border-b border-slate-200 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.95)' }}
      >
        <div
          className="w-7 h-7 flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
            boxShadow: '0 2px 10px rgba(4,70,255,0.35)',
          }}
        >
          <img src="/logo.svg" alt="VlowGen" className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-gray-900 leading-tight">AI Assistant</h2>
          <p className="text-[11px] text-gray-500 leading-tight">Workflow Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title="Start new session"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-gray-500 hidden sm:inline">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 min-h-0" ref={messagesEndRef} style={{ minHeight: 0 }}>
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <MessageBubble message={message} isUser={message.role === 'user'} />

            {message.role === 'assistant' && 'workflowId' in message && message.workflowId && currentWorkflow && (
              <Suspense fallback={<div className="pl-8 text-sm text-gray-400">Loading preview...</div>}>
                <WorkflowPreview workflow={currentWorkflow} />
              </Suspense>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-end gap-2">
            <div
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
              style={{ background: '#f1f5f9' }}
            >
              <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
            </div>
            <div
              className="px-3 py-2 bg-white border border-gray-200"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#0446ff' }} />
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-3 py-2 space-y-2 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div
          className="flex items-center gap-2 border border-gray-200 px-3 py-2 bg-white"
          style={{ boxShadow: '0 2px 12px rgba(4,70,255,0.06)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chat with AI assistant..."
            disabled={isGenerating}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent border-0 outline-none focus:ring-0 font-sans disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="flex items-center justify-center w-8 h-8 text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0446ff 0%, #0341e0 100%)',
              boxShadow: '0 2px 8px rgba(4,70,255,0.4)',
            }}
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
