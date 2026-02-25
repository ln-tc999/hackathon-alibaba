'use client';

import { useState, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import NodePalette from '@/components/canvas/NodePalette';
import ExecutionPanel from '@/components/canvas/ExecutionPanel';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { executeWorkflow } from '@/lib/api-client';
import { toast } from 'sonner';

export default function Home() {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'demo-workflow',
    name: 'Demo Workflow',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | undefined>(undefined);

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleExecute = useCallback(async () => {
    if (workflow.nodes.length === 0) {
      toast.error('Cannot execute empty workflow');
      return;
    }

    setExecutionStatus('running');
    setExecutionResult(undefined);
    
    try {
      // TODO: Get credentials from user settings or environment
      const credentials = {
        wan2ApiKey: process.env.NEXT_PUBLIC_WAN2_API_KEY,
        composioApiKey: process.env.NEXT_PUBLIC_COMPOSIO_API_KEY,
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

  return (
    <main className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold">VlowGen Platform</h1>
          <p className="text-sm text-gray-600">
            Visual workflow automation for content generation
          </p>
        </div>
        <ConnectButton />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <NodePalette />

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            workflow={workflow}
            onWorkflowChange={handleWorkflowChange}
            onExecute={handleExecute}
            executionStatus={executionStatus}
            executionResult={executionResult}
          />
        </div>
      </div>

      {/* Execution Panel */}
      {executionResult && (
        <ExecutionPanel
          execution={executionResult}
          onClose={handleCloseExecutionPanel}
        />
      )}
    </main>
  );
}
