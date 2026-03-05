
import { useEffect, useState, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, ChevronRight, MessageSquare, Trash2, Sparkles, Calendar } from 'lucide-react';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const data = await getUserChatSessions(userId);
      // Sort by updatedAt descending (newest first)
      const sortedData = data.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(sortedData);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    
    // Subscribe to session updates
    const unsubscribe = sessionEvents.subscribe(() => {
      loadSessions();
    });
    
    return unsubscribe;
  }, [loadSessions]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Delete this chat session? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteChatSession(id);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSession = useCallback((session: ChatSession) => {
    if (onSelectSession) {
      console.log('[SessionHistory] Selecting session:', session.id);
      onSelectSession(session);
    }
  }, [onSelectSession]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastUserMessage = [...session.messages]
      .reverse()
      .find(m => m.role === 'user');
    return lastUserMessage?.content.slice(0, 60) || 'New conversation';
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.updatedAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Older';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  return (
    <div className="h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#0446ff] flex items-center justify-center shadow-lg shadow-[#0446ff]/25">
            <img src="/logo.svg" alt="VlowGen" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 font-sans">Chat History</h2>
            <p className="text-xs text-gray-600">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-white/80 rounded-lg transition-all group"
          aria-label="Collapse sidebar"
        >
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-4 w-20 rounded mb-2"></div>
                <div className="bg-gray-100 h-24 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-none bg-[#0446ff] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0446ff]/25">
              <img src="/logo.svg" alt="VlowGen" className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-2 font-sans">No conversations yet</p>
            <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
              Start chatting with AI to create your first workflow
            </p>
          </div>
        ) : (
          groupOrder.map((groupKey) => {
            const groupSessions = groupedSessions[groupKey];
            if (!groupSessions || groupSessions.length === 0) return null;

            return (
              <div key={groupKey} className="space-y-2">
                {/* Group Header */}
                <div className="flex items-center gap-2 px-2">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {groupKey}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Sessions in Group */}
                <div className="space-y-2">
                  {groupSessions.map((session) => {
                    const isActive = currentSessionId === session.id;
                    const isDeleting = deletingId === session.id;

                    return (
                      <button
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        disabled={isDeleting}
                        className={`w-full p-3 rounded-none transition-all text-left border group relative overflow-hidden ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-[#0446ff] shadow-md ring-2 ring-[#0446ff]/30'
                            : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-gray-200 hover:border-[#0446ff] hover:shadow-md'
                        } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0446ff]"></div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive
                              ? 'bg-[#0446ff] shadow-md shadow-[#0446ff]/25'
                              : 'bg-gray-100 group-hover:bg-blue-100'
                          }`}>
                            {isActive ? (
                              <img src="/logo.svg" alt="VlowGen" className="w-4 h-4" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-[#0446ff]" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-semibold line-clamp-1 mb-1 transition-colors font-sans ${
                              isActive
                                ? 'text-[#0446ff]'
                                : 'text-gray-900 group-hover:text-[#0446ff]'
                            }`}>
                              {session.title}
                            </h3>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                              {getSessionPreview(session)}
                            </p>

                            {/* Meta info */}
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-gray-400 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {session.messages.length}
                              </span>
                              <span className="text-gray-400">{formatTime(session.updatedAt)}</span>
                              {session.workflowId && (
                                <span className="px-2 py-0.5 bg-[#0446ff]/10 text-[#0446ff] rounded-none flex items-center gap-1 font-medium border border-[#0446ff]/20">
                                  <Sparkles className="w-3 h-3" />
                                  Workflow
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(session.id, e)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all flex-shrink-0 disabled:opacity-50"
                            aria-label="Delete session"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {sessions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-white rounded-none border border-gray-200 shadow-sm">
              <div className="text-lg font-bold text-gray-900 font-sans">{sessions.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total</div>
            </div>
            <div className="text-center p-3 bg-white rounded-none border border-gray-200 shadow-sm">
              <div className="text-lg font-bold text-[#0446ff] font-sans">
                {sessions.filter(s => s.workflowId).length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Workflows</div>
            </div>
            <div className="text-center p-3 bg-white rounded-none border border-gray-200 shadow-sm">
              <div className="text-lg font-bold text-purple-600 font-sans">
                {sessions.reduce((sum, s) => sum + s.messages.length, 0)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Messages</div>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
