'use client';

import { useState, useCallback } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import WorkflowCanvas from '@/components/canvas/WorkflowCanvas';
import ChatInterface from '@/components/chat/ChatInterface';
import NodePalette from '@/components/canvas/NodePalette';
import SessionHistory from '@/components/sidebar/SessionHistory';
import ExecutionPanel from '@/components/canvas/ExecutionPanel';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { executeWorkflow } from '@/lib/api-client';
import { toast } from 'sonner';
import { MessageSquare, Blocks, Clock } from 'lucide-react';

type SidebarMode = 'chat' | 'nodes';
type AppMode = 'chat' | 'workflow';

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('chat');
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
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
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('chat');

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleWorkflowGenerated = useCallback((generatedWorkflow: Workflow) => {
    setWorkflow(generatedWorkflow);
  }, []);

  const handleContinueToWorkflow = useCallback(() => {
    setAppMode('workflow');
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
        wan2ApiKey: process.env.NEXT_PUBLIC_WAN2_API_KEY,
        openRouterApiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
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
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header - Always visible */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <h1 className="text-lg font-semibold">VlowGen</h1>
        </div>
        <ConnectButton />
      </div>

      {/* Main content */}
      {appMode === 'chat' ? (
        /* Chat Mode - Full screen chat */
        <div className="flex flex-1 overflow-hidden p-4 gap-4">
          <div className="flex-1 relative">
            <ChatInterface 
              onWorkflowGenerated={handleWorkflowGenerated}
              onContinueToWorkflow={handleContinueToWorkflow}
              workflow={workflow}
              centered 
            />
            
            {/* Floating button to open right sidebar when collapsed */}
            {!rightSidebarOpen && (
              <button
                onClick={() => setRightSidebarOpen(true)}
                className="absolute top-8 right-8 p-3 bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all z-10 group hover:scale-105"
                aria-label="Open session history"
              >
                <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
          </div>
          {rightSidebarOpen && (
            <div className="w-80 flex-shrink-0">
              <SessionHistory onToggle={() => setRightSidebarOpen(false)} />
            </div>
          )}
        </div>
      ) : (
        /* Workflow Mode - Canvas with sidebars */
        <div className="flex flex-1 overflow-hidden p-4 gap-4">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex p-2 bg-gray-50 gap-1">
              <button
                onClick={() => setSidebarMode('chat')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg ${
                  sidebarMode === 'chat'
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
              <button
                onClick={() => setSidebarMode('nodes')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-lg ${
                  sidebarMode === 'nodes'
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Blocks className="w-4 h-4" />
                <span>Manual</span>
              </button>
            </div>

            {/* Content based on mode */}
            <div className="flex-1 overflow-hidden">
              {sidebarMode === 'chat' ? (
                <ChatInterface 
                  onWorkflowGenerated={handleWorkflowGenerated}
                  onContinueToWorkflow={handleContinueToWorkflow}
                  workflow={workflow}
                />
              ) : (
                <NodePalette />
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex gap-4">
            <div className="flex-1 relative">
              <WorkflowCanvas
                workflow={workflow}
                onWorkflowChange={handleWorkflowChange}
                onExecute={handleExecute}
                executionStatus={executionStatus}
                executionResult={executionResult}
              />
              
              {/* Floating button to open right sidebar when collapsed */}
              {!rightSidebarOpen && (
                <button
                  onClick={() => setRightSidebarOpen(true)}
                  className="absolute top-4 right-4 p-3 bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all z-10 group hover:scale-105"
                  aria-label="Open session history"
                >
                  <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
              )}
            </div>

            {/* Right Sidebar */}
            {rightSidebarOpen && (
              <div className="w-80 flex-shrink-0">
                <SessionHistory onToggle={() => setRightSidebarOpen(false)} />
              </div>
            )}
          </div>
        </div>
      )}

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
