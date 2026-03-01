'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import ChatInterface from '@/components/chat/ChatInterface';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { executeWorkflow } from '@/lib/api-client';
import { toast } from 'sonner';
import { MessageSquare, Clock, Bot, Zap } from 'lucide-react';

// Lazy load heavy components
const WorkflowCanvas = dynamic(() => import('@/components/canvas/WorkflowCanvas'), {
  loading: () => <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>,
  ssr: false
});

const SessionHistory = dynamic(() => import('@/components/sidebar/SessionHistory'), {
  loading: () => <div className="animate-pulse bg-gray-100 h-full rounded-xl"></div>,
  ssr: false
});

const ExecutionPanel = dynamic(() => import('@/components/canvas/ExecutionPanel'), {
  loading: () => null,
  ssr: false
});

type AppMode = 'chat' | 'workflow';

// Memoized Header Component
const AppHeader = memo(({ appMode }: { appMode: AppMode }) => (
  <div className="px-6 pt-6 pb-0">
    <div className="flex justify-between items-center px-6 py-3 bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 shadow-lg shadow-gray-200/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">VlowGen</h1>
          <p className="text-xs text-gray-500">AI Workflow Platform</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Mode indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-semibold text-green-700">
            {appMode === 'chat' ? 'AI Mode' : 'Building'}
          </span>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <ConnectButton />
        </div>
      </div>
    </div>
  </div>
));

AppHeader.displayName = 'AppHeader';

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

  const handleWorkflowChange = useCallback((updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow);
  }, []);

  const handleWorkflowGenerated = useCallback((generatedWorkflow: Workflow) => {
    setWorkflow(generatedWorkflow);
  }, []);

  const handleContinueToWorkflow = useCallback(() => {
    // Small delay to ensure workflow state is fully updated
    setTimeout(() => {
      setAppMode('workflow');
    }, 100);
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
  }, [workflow.nodes.length, workflow]);

  const handleCloseExecutionPanel = useCallback(() => {
    setExecutionResult(undefined);
    setExecutionStatus('idle');
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen(prev => !prev);
  }, []);

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Floating Header */}
      <AppHeader appMode={appMode} />

      {/* Main content */}
      {appMode === 'chat' ? (
        /* Chat Mode - Full screen chat */
        <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 gap-6">
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
                onClick={toggleRightSidebar}
                className="absolute top-8 right-8 p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all z-10 group hover:scale-105"
                aria-label="Open session history"
              >
                <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}
          </div>
          {rightSidebarOpen && (
            <div className="w-80 flex-shrink-0">
              <SessionHistory onToggle={toggleRightSidebar} />
            </div>
          )}
        </div>
      ) : (
        /* Workflow Mode - Canvas with sidebars */
        <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 gap-6">
          {/* Left Sidebar - AI Chat Only */}
          <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* AI Chat Content */}
            <div className="flex-1 overflow-hidden">
              <ChatInterface 
                onWorkflowGenerated={handleWorkflowGenerated}
                onContinueToWorkflow={handleContinueToWorkflow}
                workflow={workflow}
              />
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 flex gap-6">
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
                  onClick={toggleRightSidebar}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all z-10 group hover:scale-105"
                  aria-label="Open session history"
                >
                  <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
              )}
            </div>

            {/* Right Sidebar */}
            {rightSidebarOpen && (
              <div className="w-80 flex-shrink-0">
                <SessionHistory onToggle={toggleRightSidebar} />
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
