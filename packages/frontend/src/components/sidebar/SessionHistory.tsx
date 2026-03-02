'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, ChevronRight, MessageSquare, Trash2 } from 'lucide-react';
import { getUserChatSessions, deleteChatSession } from '@/lib/db';
import { getUserId } from '@/lib/user';
import { toast } from 'sonner';
import { sessionEvents } from '@/lib/session-events';

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
  workflowId?: string;
  createdAt: number;
  updatedAt: number;
}

interface SessionHistoryProps {
  onToggle: () => void;
  onSelectSession?: (session: ChatSession) => void;
  currentSessionId?: string;
}

export default function SessionHistory({ onToggle, onSelectSession, currentSessionId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    
    // Subscribe to session updates
    const unsubscribe = sessionEvents.subscribe(() => {
      loadSessions();
    });
    
    return unsubscribe;
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const data = await getUserChatSessions(userId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this chat session?')) {
      return;
    }

    try {
      await deleteChatSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = [...session.messages]
      .reverse()
      .find(m => m.role === 'user');
    return lastUserMessage?.content.slice(0, 50) || 'New chat';
  };

  return (
    <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">History</h2>
            <p className="text-xs text-gray-500">{sessions.length} sessions</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-white rounded-lg transition-all group"
          aria-label="Collapse sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-20 rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No chat sessions yet</p>
            <p className="text-xs text-gray-500">Start chatting to create sessions</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession?.(session)}
              className={`w-full p-3 rounded-lg transition-all text-left border hover:shadow-sm group relative ${
                currentSessionId === session.id
                  ? 'bg-blue-50 border-blue-300 shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium line-clamp-1 transition-colors ${
                    currentSessionId === session.id
                      ? 'text-blue-700'
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {getSessionPreview(session)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all flex-shrink-0"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  {session.messages.length} messages
                </span>
                <span className="text-gray-400">{formatTime(session.updatedAt)}</span>
              </div>
              {session.workflowId && (
                <div className="mt-2 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Has workflow
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{sessions.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Chats</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-blue-600">
              {sessions.filter(s => s.workflowId).length}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">With Workflow</div>
          </div>
        </div>
      </div>
    </div>
  );
}
