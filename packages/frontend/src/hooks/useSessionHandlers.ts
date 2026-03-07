import { useCallback } from 'react';
import type { Workflow } from '@vlowgen/shared';
import type { AppView } from './useViewSync';

interface UseSessionHandlersReturn {
  handleContinueToWorkflow: () => void;
  handleBackToChat: () => void;
  handleBackToLanding: () => void;
  handleSelectSession: (session: any) => Promise<void>;
  handleScheduleClick: () => void;
}

/**
 * Hook untuk manage session handlers
 * @param setView - Function to change view
 * @param onWorkflowGenerated - Callback when workflow is generated
 * @param updateSessionId - Callback to update session ID (for persistence)
 */
export function useSessionHandlers(
  setView: (view: AppView) => void,
  onWorkflowGenerated?: (workflow: Workflow) => void,
  updateSessionId?: (sessionId: string) => void
): UseSessionHandlersReturn {
  const handleContinueToWorkflow = useCallback(() => {
    setTimeout(() => {
      setView('workflow');
    }, 100);
  }, [setView]);

  const handleBackToChat = useCallback(() => {
    setView('chat');
    // Don't reset session ID - let useSessionId manage it
  }, [setView]);

  const handleBackToLanding = useCallback(() => {
    setView('landing');
  }, [setView]);

  const handleSelectSession = useCallback(
    async (session: any) => {

      // Update session ID to selected session
      if (updateSessionId) {
        updateSessionId(session.id);
      }
      
      setView('chat');

      // Reset workflow first
      const emptyWorkflow: Workflow = {
        id: 'demo-workflow',
        name: 'Demo Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // If session has workflow, load it
      if (session.workflowId && onWorkflowGenerated) {
        try {
          const { loadWorkflow } = await import('@/lib/workflow-api');
          const loadedWorkflow = await loadWorkflow(session.workflowId);
          onWorkflowGenerated(loadedWorkflow);
        } catch (error) {
          console.error('[useSessionHandlers] Failed to load workflow:', error);
        }
      }
    },
    [setView, onWorkflowGenerated, updateSessionId]
  );

  const handleScheduleClick = useCallback(() => {
    setView('schedule');
  }, [setView]);

  return {
    handleContinueToWorkflow,
    handleBackToChat,
    handleBackToLanding,
    handleSelectSession,
    handleScheduleClick,
  };
}
