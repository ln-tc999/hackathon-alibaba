import { memo } from 'react';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { ChevronLeft } from 'lucide-react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import SessionHistory from '@/components/sidebar/SessionHistory';

interface WorkflowViewProps {
  sessionId: string;
  workflow: Workflow;
  rightSidebarOpen: boolean;
  executionStatus: 'idle' | 'running' | 'success' | 'error';
  executionResult: ExecutionResult | undefined;
  onWorkflowChange: (workflow: Workflow) => void;
  onWorkflowGenerated: (workflow: Workflow) => void;
  onExecute: () => void;
  onToggleSidebar: () => void;
  onSelectSession: (session: any) => void;
  onCloseExecutionPanel: () => void;
  onSessionDeleted?: (sessionId: string) => void;
}

const WorkflowView = memo(function WorkflowView({
  sessionId,
  workflow,
  rightSidebarOpen,
  executionStatus,
  executionResult,
  onWorkflowChange,
  onWorkflowGenerated,
  onExecute,
  onToggleSidebar,
  onSelectSession,
  onCloseExecutionPanel,
  onSessionDeleted,
}: WorkflowViewProps) {
  return (
    <div className="flex flex-1 overflow-hidden px-2 sm:px-4 lg:px-6 pt-2 sm:pt-3 lg:pt-4 pb-4 gap-2 sm:gap-4 lg:gap-6">
      {/* Left Sidebar - AI Chat */}
      <div className="hidden md:flex w-72 lg:w-80 flex-shrink-0 flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
        <ChatSidebar
          sessionId={sessionId}
          onWorkflowGenerated={onWorkflowGenerated}
          workflow={workflow}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 flex gap-2 sm:gap-4 lg:gap-6 min-w-0">
        <div className="flex-1 relative min-w-0">
          <WorkflowCanvas
            workflow={workflow}
            onWorkflowChange={onWorkflowChange}
            onExecute={onExecute}
            executionStatus={executionStatus}
            executionResult={executionResult}
          />

          {/* Floating button to open right sidebar */}
          {!rightSidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex absolute top-4 right-4 items-center gap-2 pl-2.5 pr-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl transition-all z-[100] group hover:border-[#0446ff]/40"
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

        {/* Right Sidebar */}
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
    </div>
  );
});

export default WorkflowView;
