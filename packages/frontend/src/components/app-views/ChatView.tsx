import { memo } from 'react';
import type { Workflow } from '@vlowgen/shared';
import { ChevronLeft } from 'lucide-react';
import ChatInterface from '@/components/chat/ChatInterface';
import SessionHistory from '@/components/sidebar/SessionHistory';

interface ChatViewProps {
  sessionId: string;
  workflow: Workflow;
  rightSidebarOpen: boolean;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onContinueToWorkflow: () => void;
  onToggleSidebar: () => void;
  onSelectSession: (session: any) => void;
  onNewSession?: () => void;
  onSessionDeleted?: (sessionId: string) => void;
}

const ChatView = memo(function ChatView({
  sessionId,
  workflow,
  rightSidebarOpen,
  onWorkflowGenerated,
  onContinueToWorkflow,
  onToggleSidebar,
  onSelectSession,
  onNewSession,
  onSessionDeleted,
}: ChatViewProps) {
  return (
    <div className="flex flex-1 overflow-hidden px-2 sm:px-4 lg:px-6 pt-2 sm:pt-3 lg:pt-4 pb-4 gap-3 lg:gap-6">
      <div className="flex-1 relative min-w-0">
        <ChatInterface
          sessionId={sessionId}
          onWorkflowGenerated={onWorkflowGenerated}
          onContinueToWorkflow={onContinueToWorkflow}
          workflow={workflow}
          onNewSession={onNewSession}
        />

        {/* Floating button to open right sidebar when collapsed */}
        {!rightSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex absolute top-8 right-4 items-center gap-2 pl-2.5 pr-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all z-10 group hover:border-[#0446ff]/40"
            style={{ borderRadius: '10px' }}
            aria-label="Open session history"
            title="Open session history"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-[#0446ff] transition-colors" />
            <span className="text-xs font-medium text-slate-500 group-hover:text-[#0446ff] transition-colors">
              History
            </span>
          </button>
        )}
      </div>

      {/* Session history sidebar — only on large screens */}
      {rightSidebarOpen && (
        <div className="hidden lg:block w-80 flex-shrink-0 overflow-auto">
          <SessionHistory
            onToggle={onToggleSidebar}
            onSelectSession={onSelectSession}
            currentSessionId={sessionId}
            onSessionDeleted={onSessionDeleted}
          />
        </div>
      )}
    </div>
  );
});

export default ChatView;
