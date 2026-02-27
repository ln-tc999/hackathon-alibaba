'use client';

import { Clock, CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';

interface SessionItem {
  id: string;
  name: string;
  status: 'success' | 'error' | 'running';
  timestamp: Date;
  nodes: number;
}

interface SessionHistoryProps {
  onToggle: () => void;
}

export default function SessionHistory({ onToggle }: SessionHistoryProps) {
  // Mock data - replace with actual data from API
  const sessions: SessionItem[] = [
    {
      id: '1',
      name: 'Image to Twitter',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      nodes: 3,
    },
    {
      id: '2',
      name: 'Content Generator',
      status: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      nodes: 4,
    },
    {
      id: '3',
      name: 'AI Workflow',
      status: 'error',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      nodes: 2,
    },
  ];

  const getStatusIcon = (status: SessionItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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
            <p className="text-xs text-gray-500">Recent sessions</p>
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
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No sessions yet</p>
            <p className="text-xs text-gray-500">Your workflow history will appear here</p>
          </div>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              className="w-full p-3 bg-white hover:bg-gray-50 rounded-lg transition-all text-left border border-gray-200 hover:border-gray-300 hover:shadow-sm group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {session.name}
                </span>
                <div className="flex-shrink-0 ml-2">
                  {getStatusIcon(session.status)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                  {session.nodes} nodes
                </span>
                <span className="text-gray-400">{formatTime(session.timestamp)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-gray-900">12</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Runs</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xl font-bold text-green-600">10</div>
            <div className="text-xs text-gray-500 mt-0.5">Successful</div>
          </div>
        </div>
      </div>
    </div>
  );
}
