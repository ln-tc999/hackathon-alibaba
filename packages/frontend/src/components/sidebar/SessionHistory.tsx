import { useEffect, useState, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, MessageSquare, Trash2, Sparkles, Calendar, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { getUserChatSessions, deleteChatSession, getMediaStats } from '@/lib/db';
import { getUserId } from '@/lib/user';
import { toast } from 'sonner';
import { sessionEvents } from '@/lib/session-events';
import MediaHistoryGallery from './MediaHistoryGallery';

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
  onSessionDeleted?: (deletedSessionId: string) => void;
}

export default function SessionHistory({
  onToggle,
  onSelectSession,
  currentSessionId,
  onSessionDeleted
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'media'>('chat');
  const [mediaStats, setMediaStats] = useState<{ total: number; images: number; videos: number } | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const data = await getUserChatSessions(userId);
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

    const unsubscribe = sessionEvents.subscribe(() => {
      loadSessions();
    });

    return unsubscribe;
  }, [loadSessions]);

  useEffect(() => {
    if (activeTab === 'media') {
      const loadStats = async () => {
        try {
          const userId = getUserId();
          const stats = await getMediaStats(userId);
          setMediaStats(stats);
        } catch (error) {
          console.error('Failed to load media stats:', error);
        }
      };
      loadStats();
    }
  }, [activeTab]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Delete this chat session? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteChatSession(id);
      setSessions(sessions.filter(s => s.id !== id));

      if (id === currentSessionId && onSessionDeleted) {
        onSessionDeleted(id);
      }

      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectSession = useCallback(async (session: ChatSession) => {
    if (onSelectSession) {
      setSelectingId(session.id);
      try {
        await onSelectSession(session);
      } finally {
        setSelectingId(null);
      }
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
    const content = lastUserMessage?.content || 'New conversation';
    return content.length > 100 ? content.slice(0, 100) + '...' : content;
  };

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
    <div className="h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg flex flex-col overflow-hidden" style={{ height: '100%' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-none bg-[#0446ff] flex items-center justify-center shadow-lg shadow-[#0446ff]/25">
            <img src="/logo.svg" alt="VlowGen" className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 font-sans">History</h2>
            <p className="text-xs text-gray-600">
              {activeTab === 'chat' 
                ? `${sessions.length} conversation${sessions.length !== 1 ? 's' : ''}`
                : mediaStats 
                  ? `${mediaStats.total} media (${mediaStats.images} images, ${mediaStats.videos} videos)`
                  : 'Loading...'
              }
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'text-[#0446ff] bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-l border-gray-200 ${
              activeTab === 'media'
                ? 'text-[#0446ff] bg-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3">
          {activeTab === 'chat' && (
            <button
              onClick={() => loadSessions()}
              disabled={loading}
              className="p-2 hover:bg-white/80 transition-all group rounded-lg"
              aria-label="Refresh sessions"
              title="Refresh sessions"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
              )}
            </button>
          )}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/80 transition-all group rounded-lg ml-auto"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ minHeight: 0 }}>
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
              <p className="text-xs text-gray-500 max-w-[200px] mx-auto mb-4">
                Start chatting with AI to create your first workflow
              </p>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('newChat'));
                }}
                className="px-4 py-2 bg-[#0446ff] text-white text-sm font-semibold rounded-none hover:opacity-90 transition-opacity shadow-lg shadow-[#0446ff]/25"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            groupOrder.map((groupKey) => {
              const groupSessions = groupedSessions[groupKey];
              if (!groupSessions || groupSessions.length === 0) return null;

              return (
                <div key={groupKey} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {groupKey}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="space-y-2">
                    {groupSessions.map((session) => {
                      const isActive = currentSessionId === session.id;
                      const isDeleting = deletingId === session.id;
                      const isSelecting = selectingId === session.id;

                      return (
                        <button
                          key={session.id}
                          onClick={() => handleSelectSession(session)}
                          disabled={isDeleting || isSelecting}
                          className={`w-full p-3 rounded-none transition-all text-left border group relative overflow-hidden ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-[#0446ff] shadow-md ring-2 ring-[#0446ff]/30'
                              : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-gray-200 hover:border-[#0446ff] hover:shadow-md'
                          } ${isDeleting || isSelecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0446ff]"></div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 transition-all ${
                              isActive
                                ? 'bg-[#0446ff] shadow-md shadow-[#0446ff]/25'
                                : 'bg-gray-100 group-hover:bg-blue-100'
                            }`}>
                              {isSelecting ? (
                                <Loader2 className="w-4 h-4 text-[#0446ff] animate-spin" />
                              ) : isActive ? (
                                <img src="/logo.svg" alt="VlowGen" className="w-4 h-4" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-[#0446ff]" />
                              )}
                            </div>

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
      ) : (
        <MediaHistoryGallery />
      )}

      {/* Stats Footer */}
      {activeTab === 'chat' && sessions.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
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
