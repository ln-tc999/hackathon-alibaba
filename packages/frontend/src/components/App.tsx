import { Suspense, lazy, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import { useViewSync, type AppView } from '@/hooks/useViewSync';
import { useLenisScroll } from '@/hooks/useLenisScroll';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';
import { useSessionHandlers } from '@/hooks/useSessionHandlers';
import { useSidebarHandlers } from '@/hooks/useSidebarHandlers';
import { useSessionId } from '@/hooks/useSessionId';
import AppHeader from '@/components/app/AppHeader';
import { startScheduler, getSchedulerStatus } from '@/lib/scheduler-api';
import ChatView from '@/components/app-views/ChatView';
import WorkflowView from '@/components/app-views/WorkflowView';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy load Schedule view only
const ScheduleView = lazy(() => import('@/components/app-views/ScheduleView'));

// Lazy load heavy components
const ExecutionPanel = lazy(() => import('@/components/canvas/ExecutionPanel'));

export default function App() {
  // View management
  const { view, setView } = useViewSync();

  // Session ID management (persisted across refreshes)
  const { sessionId, updateSessionId, createNewSession } = useSessionId();

  // Scroll management (Lenis for landing only)
  useLenisScroll(view);

  // Scheduled posts management
  const { scheduledPosts, schedulerStatus, handleAddPost, handleEditPost, handleDeletePost } = useScheduledPosts();

  // Workflow management
  const {
    workflow,
    executionStatus,
    executionResult,
    handleWorkflowChange,
    handleWorkflowGenerated,
    handleExecute,
    handleCloseExecutionPanel,
    setWorkflow,
  } = useWorkflowExecution();

  // Create new session when switching from landing to chat/workflow
  const handleViewChange = useCallback((newView: AppView) => {
    if (view === 'landing' && (newView === 'chat' || newView === 'workflow')) {
      // Coming from landing, create new session
      createNewSession();
    }
    setView(newView);
  }, [view, setView, createNewSession]);

  // Session handlers
  const {
    handleContinueToWorkflow,
    handleBackToChat,
    handleSelectSession,
    handleScheduleClick,
  } = useSessionHandlers(handleViewChange, handleWorkflowGenerated, updateSessionId);

  // Handle back to landing separately
  const handleBackToLanding = useCallback(() => {
    handleViewChange('landing');
  }, [handleViewChange]);

  // Handle session deleted from history
  const handleSessionDeleted = useCallback((deletedSessionId: string) => {
    // If the deleted session was current, create a new one
    if (deletedSessionId === sessionId) {
      createNewSession();
    }
  }, [sessionId, createNewSession]);

  // Sidebar handlers
  const {
    rightSidebarOpen,
    mobileHistoryOpen,
    toggleRightSidebar,
    toggleMobileHistory,
  } = useSidebarHandlers();

  // Auto-start scheduler when app mounts
  useEffect(() => {
    const startSchedulerOnMount = async () => {
      try {
        // Check if scheduler is already running
        const status = await getSchedulerStatus();
        
        if (!status.running) {
          await startScheduler();
        }
      } catch (error) {
        console.error('[App] Failed to auto-start scheduler:', error);
      }
    };
    
    startSchedulerOnMount();
  }, []);

  // Don't render anything for landing view - Astro handles it
  if (view === 'landing') {
    return <Toaster />;
  }

  return (
    <>
      <AppHeader
        view={view}
        onBackToChat={handleBackToChat}
        onBackToLanding={handleBackToLanding}
        onScheduleClick={handleScheduleClick}
        onToggleMobileHistory={toggleMobileHistory}
      />

      <main className="flex flex-col bg-gray-50 h-screen overflow-hidden">
        {/* Mobile/Tablet History Drawer */}
        {mobileHistoryOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={toggleMobileHistory}
            />
            {/* Drawer */}
            <div
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col"
              style={{ animation: 'slideInRight 0.25s ease-out' }}
            >
              {view === 'chat' && (
                <ChatView
                  sessionId={sessionId}
                  workflow={workflow}
                  rightSidebarOpen={rightSidebarOpen}
                  onWorkflowGenerated={handleWorkflowGenerated}
                  onContinueToWorkflow={handleContinueToWorkflow}
                  onToggleSidebar={toggleRightSidebar}
                  onSelectSession={handleSelectSession}
                  onNewSession={createNewSession}
                  onSessionDeleted={handleSessionDeleted}
                />
              )}
              {view === 'workflow' && (
                <WorkflowView
                  sessionId={sessionId}
                  workflow={workflow}
                  rightSidebarOpen={rightSidebarOpen}
                  executionStatus={executionStatus}
                  executionResult={executionResult}
                  onWorkflowChange={handleWorkflowChange}
                  onWorkflowGenerated={handleWorkflowGenerated}
                  onExecute={handleExecute}
                  onToggleSidebar={toggleRightSidebar}
                  onSelectSession={handleSelectSession}
                  onCloseExecutionPanel={handleCloseExecutionPanel}
                  onSessionDeleted={handleSessionDeleted}
                />
              )}
            </div>
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
          </>
        )}

        {/* Main content based on view */}
        {view === 'chat' && (
          <ChatView
            sessionId={sessionId}
            workflow={workflow}
            rightSidebarOpen={rightSidebarOpen}
            onWorkflowGenerated={handleWorkflowGenerated}
            onContinueToWorkflow={handleContinueToWorkflow}
            onToggleSidebar={toggleRightSidebar}
            onSelectSession={handleSelectSession}
            onNewSession={createNewSession}
            onSessionDeleted={handleSessionDeleted}
          />
        )}
        {view === 'workflow' && (
          <WorkflowView
            sessionId={sessionId}
            workflow={workflow}
            rightSidebarOpen={rightSidebarOpen}
            executionStatus={executionStatus}
            executionResult={executionResult}
            onWorkflowChange={handleWorkflowChange}
            onWorkflowGenerated={handleWorkflowGenerated}
            onExecute={handleExecute}
            onToggleSidebar={toggleRightSidebar}
            onSelectSession={handleSelectSession}
            onCloseExecutionPanel={handleCloseExecutionPanel}
            onSessionDeleted={handleSessionDeleted}
          />
        )}
        {view === 'schedule' && (
          <Suspense fallback={<LoadingSpinner />}>
            <ScheduleView
              scheduledPosts={scheduledPosts}
              schedulerStatus={schedulerStatus}
              onAddPost={handleAddPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onBackToChat={handleBackToChat}
            />
          </Suspense>
        )}

        {/* Execution Panel - only loaded when needed */}
        {executionResult && view === 'workflow' && (
          <Suspense fallback={null}>
            <ExecutionPanel execution={executionResult} onClose={handleCloseExecutionPanel} />
          </Suspense>
        )}
      </main>
      <Toaster />
    </>
  );
}
