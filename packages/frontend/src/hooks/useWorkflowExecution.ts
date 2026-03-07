import { useState, useCallback } from 'react';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { executeWorkflow } from '@/lib/api-client';
import { toast } from 'sonner';

interface UseWorkflowExecutionReturn {
  workflow: Workflow;
  executionStatus: 'idle' | 'running' | 'success' | 'error';
  executionResult: ExecutionResult | undefined;
  handleWorkflowChange: (workflow: Workflow) => void;
  handleWorkflowGenerated: (workflow: Workflow) => void;
  handleExecute: () => Promise<void>;
  handleCloseExecutionPanel: () => void;
  setWorkflow: (workflow: Workflow) => void;
}

const DEFAULT_WORKFLOW: Workflow = {
  id: 'demo-workflow',
  name: 'Demo Workflow',
  nodes: [],
  edges: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Hook untuk manage workflow state dan execution
 */
export function useWorkflowExecution(): UseWorkflowExecutionReturn {
  const [workflow, setWorkflow] = useState<Workflow>(DEFAULT_WORKFLOW);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | undefined>(undefined);

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleWorkflowGenerated = useCallback((generatedWorkflow: Workflow) => {
    setWorkflow(generatedWorkflow);
  }, []);

  const handleExecute = useCallback(async () => {

    if (workflow.nodes.length === 0) {
      toast.error('Cannot execute empty workflow');
      return;
    }

    setExecutionStatus('running');
    setExecutionResult(undefined);

    try {

      const credentials = {
        wan2ApiKey: import.meta.env.PUBLIC_WAN2_API_KEY,
        openRouterApiKey: import.meta.env.PUBLIC_OPENROUTER_API_KEY,
        composioApiKey: import.meta.env.PUBLIC_COMPOSIO_API_KEY,
      };

      const result = await executeWorkflow(workflow, credentials);


      if (result.status === 'success') {
        setExecutionStatus('success');
        setExecutionResult(result.results);
        toast.success('Workflow executed successfully!');
      } else {
        setExecutionStatus('error');
        setExecutionResult(result.results);
        toast.error('Workflow execution failed', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('[useWorkflowExecution] Execution error:', error);
      setExecutionStatus('error');
      toast.error('Workflow execution failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [workflow]);

  const handleCloseExecutionPanel = useCallback(() => {
    setExecutionResult(undefined);
    setExecutionStatus('idle');
  }, []);

  return {
    workflow,
    executionStatus,
    executionResult,
    handleWorkflowChange,
    handleWorkflowGenerated,
    handleExecute,
    handleCloseExecutionPanel,
    setWorkflow,
  };
}
