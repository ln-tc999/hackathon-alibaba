import { useState, useEffect, useCallback } from 'react';
import { saveChatSession, getChatSession, createChatSession } from '@/lib/db';
import { getUserId } from '@/lib/user';
import { sessionEvents } from '@/lib/session-events';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowId?: string;
}

interface UseChatSessionReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  saveSession: (title: string, workflowId: string) => Promise<void>;
  clearMessages: () => void;
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `Hi! I'm your AI assistant.

Tell me what you want to create, and I'll build an optimized workflow automatically.

Try: "Create a viral meme and post to Instagram"`,
    timestamp: new Date(),
  },
];

const SESSION_PREFIX = 'session_';

/**
 * Hook untuk manage chat session
 * - Load session dari DB
 * - Save session ke DB (auto-create jika temporary)
 * - Manage messages state
 */
export function useChatSession(sessionId?: string): UseChatSessionReturn {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session when sessionId changes
  useEffect(() => {
    const loadSession = async () => {
      // Reset to default for new/temporary sessions
      if (!sessionId || sessionId.startsWith(SESSION_PREFIX)) {
        setMessages(DEFAULT_MESSAGES);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const session = await getChatSession(sessionId);

        if (session && session.messages.length > 0) {
          const loadedMessages: Message[] = session.messages.map((m, idx) => ({
            id: `msg-${idx}`,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp),
            workflowId: session.workflowId,
          }));
          setMessages(loadedMessages);
        } else {
          setMessages(DEFAULT_MESSAGES);
        }
      } catch (err) {
        console.error('Failed to load chat session:', err);
        setError('Failed to load chat history');
        setMessages(DEFAULT_MESSAGES);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages(DEFAULT_MESSAGES);
  }, []);

  const saveSession = useCallback(async (
    title: string,
    workflowId: string
  ) => {
    if (!sessionId) {
      return;
    }

    try {
      const userId = getUserId();
      const messagesToSave = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.getTime(),
      }));

      let finalSessionId = sessionId;

      // If sessionId is temporary, create new session in DB
      if (sessionId.startsWith(SESSION_PREFIX)) {
        const newSessionId = await createChatSession(
          userId,
          title,
          messagesToSave,
          workflowId
        );
        finalSessionId = newSessionId;
        // Update localStorage with new session ID
        localStorage.setItem('vlowgen_current_session', newSessionId);
        // Dispatch event to update parent component
        window.dispatchEvent(new CustomEvent('sessionIdChange', { detail: { sessionId: newSessionId } }));
      } else {
        // Update existing session
        await saveChatSession(finalSessionId, userId, title, messagesToSave, workflowId);
      }

      sessionEvents.emit();
    } catch (err) {
      console.error('Failed to save chat session:', err);
      throw err;
    }
  }, [sessionId, messages]);

  return {
    messages,
    isLoading,
    error,
    addMessage,
    saveSession,
    clearMessages,
  };
}
