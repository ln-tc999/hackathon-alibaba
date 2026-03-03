import { useState, useCallback, useMemo, memo, useEffect, lazy, Suspense } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import type { Workflow, ExecutionResult } from '@vlowgen/shared';
import { executeWorkflow } from '@/lib/api-client';
import { toast, Toaster } from 'sonner';
import { MessageSquare, Clock, Bot, Zap, CalendarDays } from 'lucide-react';
import { initializeUser } from '@/lib/user';
import type { ScheduledPost } from '@/components/schedule/types';
import { syncScheduledPosts, getSchedulerStatus } from '@/lib/scheduler-api';
import type { SchedulerStatus } from '@/lib/scheduler-api';

// Lazy load heavy components
const WorkflowCanvas = lazy(() => import('@/components/canvas/WorkflowCanvas'));
const SessionHistory = lazy(() => import('@/components/sidebar/SessionHistory'));
const ExecutionPanel = lazy(() => import('@/components/canvas/ExecutionPanel'));
const ScheduleCalendar = lazy(() => import('@/components/schedule/ScheduleCalendar'));
const AddPostModal = lazy(() => import('@/components/schedule/AddPostModal'));

type AppMode = 'chat' | 'workflow' | 'schedule';

// Loading spinner component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// Memoized Header Component
const AppHeader = memo(({ appMode, onBackToChat, onBackToHome, onScheduleClick }: { 
    appMode: AppMode; 
    onBackToChat?: () => void; 
    onBackToHome?: () => void;
    onScheduleClick?: () => void;
}) => (
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
                {/* Back to Home button - show when onBackToHome is provided */}
                {onBackToHome && (
                    <button
                        onClick={onBackToHome}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg hover:from-gray-100 hover:to-slate-100 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                        <span className="text-xs font-semibold text-gray-700">Back to Home</span>
                    </button>
                )}

                {/* Back to Chat button - only show in workflow mode */}
                {appMode === 'workflow' && onBackToChat && (
                    <button
                        onClick={onBackToChat}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">Back to Chat</span>
                    </button>
                )}

                {/* Mode indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <Zap className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">
                        {appMode === 'chat' ? 'AI Mode' : appMode === 'workflow' ? 'Building' : 'Schedule'}
                    </span>
                </div>

                {/* Schedule button */}
                {onScheduleClick && (
                    <button
                        onClick={onScheduleClick}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                            appMode === 'schedule'
                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                                : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <CalendarDays className={`w-3.5 h-3.5 ${appMode === 'schedule' ? 'text-purple-600' : 'text-gray-600'}`} />
                        <span className={`text-xs font-semibold ${appMode === 'schedule' ? 'text-purple-700' : 'text-gray-700'}`}>
                            Schedule
                        </span>
                    </button>
                )}
            </div>
        </div>
    </div>
));

AppHeader.displayName = 'AppHeader';

interface AppProps {
    onBackToHome?: () => void;
}

export default function App({ onBackToHome }: AppProps = {}) {
    const [appMode, setAppMode] = useState<AppMode>('chat');
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [currentSessionId, setCurrentSessionId] = useState<string>('');
    const [showAddPostModal, setShowAddPostModal] = useState(false);
    const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
    
    // Load scheduled posts from localStorage on mount
    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(() => {
        try {
            const saved = localStorage.getItem('vlowgen_scheduled_posts');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load scheduled posts:', error);
            return [];
        }
    });

    // Save scheduled posts to localStorage and sync to backend whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('vlowgen_scheduled_posts', JSON.stringify(scheduledPosts));
            
            // Sync to backend (debounced to avoid too many requests)
            const timeoutId = setTimeout(() => {
                syncScheduledPosts(scheduledPosts).catch(error => {
                    console.error('Failed to sync posts to backend:', error);
                });
            }, 1000);
            
            return () => clearTimeout(timeoutId);
        } catch (error) {
            console.error('Failed to save scheduled posts:', error);
        }
    }, [scheduledPosts]);

    // Fetch scheduler status periodically when in schedule mode
    useEffect(() => {
        if (appMode !== 'schedule') return;
        
        const fetchStatus = async () => {
            try {
                const status = await getSchedulerStatus();
                setSchedulerStatus(status);
            } catch (error) {
                console.error('Failed to fetch scheduler status:', error);
            }
        };
        
        // Fetch immediately
        fetchStatus();
        
        // Then fetch every 30 seconds
        const intervalId = setInterval(fetchStatus, 30000);
        
        return () => clearInterval(intervalId);
    }, [appMode]);
    const [workflow, setWorkflow] = useState<Workflow>({
        id: 'demo-workflow',
        name: 'Demo Workflow',
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    // Initialize user session on mount
    useEffect(() => {
        initializeUser().catch(console.error);
        // Generate initial session ID
        setCurrentSessionId(`session_${Date.now()}`);
    }, []);

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

    const handleBackToChat = useCallback(() => {
        setAppMode('chat');
        // Generate new session ID for new chat
        setCurrentSessionId(`session_${Date.now()}`);
    }, []);

    const handleSelectSession = useCallback(async (session: any) => {
        setCurrentSessionId(session.id);
        setAppMode('chat');

        // If session has workflow, load it
        if (session.workflowId) {
            try {
                const { loadWorkflow } = await import('@/lib/workflow-api');
                const loadedWorkflow = await loadWorkflow(session.workflowId);
                setWorkflow(loadedWorkflow);
                handleWorkflowGenerated(loadedWorkflow);
            } catch (error) {
                console.error('Failed to load workflow:', error);
                // Workflow not found, but session can still be loaded
                // Just show the chat messages without the workflow
            }
        }
    }, [handleWorkflowGenerated]);

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

    // Schedule management
    const handleAddPost = useCallback((post: Omit<ScheduledPost, 'id'>) => {
        const newPost: ScheduledPost = {
            ...post,
            id: `post-${Date.now()}`,
        };
        setScheduledPosts(prev => [...prev, newPost]);
        toast.success('Post scheduled successfully!');
    }, []);

    const handleEditPost = useCallback((id: string, updates: Partial<ScheduledPost>) => {
        setScheduledPosts(prev => prev.map(post => 
            post.id === id ? { ...post, ...updates } : post
        ));
        toast.success('Post updated!');
    }, []);

    const handleDeletePost = useCallback((id: string) => {
        setScheduledPosts(prev => prev.filter(post => post.id !== id));
        toast.success('Post deleted!');
    }, []);

    const handleScheduleClick = useCallback(() => {
        setAppMode('schedule');
    }, []);

    return (
        <>
            <main className="flex h-screen flex-col bg-gray-50">
                {/* Floating Header */}
                <AppHeader 
                    appMode={appMode} 
                    onBackToChat={handleBackToChat} 
                    onBackToHome={onBackToHome}
                    onScheduleClick={handleScheduleClick}
                />

                {/* Main content */}
                {appMode === 'chat' ? (
                    /* Chat Mode - Full screen chat */
                    <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 gap-6">
                        <div className="flex-1 relative">
                            <ChatInterface
                                sessionId={currentSessionId}
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
                                <Suspense fallback={<div className="animate-pulse bg-gray-100 h-full rounded-xl"></div>}>
                                    <SessionHistory
                                        onToggle={toggleRightSidebar}
                                        onSelectSession={handleSelectSession}
                                        currentSessionId={currentSessionId}
                                    />
                                </Suspense>
                            </div>
                        )}
                    </div>
                ) : appMode === 'schedule' ? (
                    /* Schedule Mode - Calendar view */
                    <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 flex-col gap-4">
                        {/* Scheduler Status Banner */}
                        {schedulerStatus && (
                            <div className={`px-6 py-3 rounded-xl border flex items-center justify-between ${
                                schedulerStatus.running 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-yellow-50 border-yellow-200'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        schedulerStatus.running ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        Scheduler {schedulerStatus.running ? 'Running' : 'Stopped'} • 
                                        {' '}{schedulerStatus.pendingPosts} pending post(s)
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Auto-posting enabled
                                </span>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-hidden">
                            <Suspense fallback={<LoadingSpinner />}>
                                <ScheduleCalendar
                                    scheduledPosts={scheduledPosts}
                                    onAddPost={handleAddPost}
                                    onEditPost={handleEditPost}
                                    onDeletePost={handleDeletePost}
                                />
                            </Suspense>
                        </div>
                    </div>
                ) : (
                    /* Workflow Mode - Canvas with sidebars */
                    <div className="flex flex-1 overflow-hidden px-6 pb-6 pt-4 gap-6">
                        {/* Left Sidebar - AI Chat Only */}
                        <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* AI Chat Content */}
                            <div className="flex-1 overflow-hidden">
                                <ChatInterface
                                    sessionId={currentSessionId}
                                    onWorkflowGenerated={handleWorkflowGenerated}
                                    onContinueToWorkflow={handleContinueToWorkflow}
                                    workflow={workflow}
                                    centered={false}
                                />
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 flex gap-6">
                            <div className="flex-1 relative h-full">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <WorkflowCanvas
                                        workflow={workflow}
                                        onWorkflowChange={handleWorkflowChange}
                                        onExecute={handleExecute}
                                        executionStatus={executionStatus}
                                        executionResult={executionResult}
                                    />
                                </Suspense>

                                {/* Floating button to open right sidebar when collapsed */}
                                {!rightSidebarOpen && (
                                    <button
                                        onClick={toggleRightSidebar}
                                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all z-[100] group hover:scale-105"
                                        aria-label="Open session history"
                                    >
                                        <Clock className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                    </button>
                                )}
                            </div>

                            {/* Right Sidebar */}
                            {rightSidebarOpen && (
                                <div className="w-80 flex-shrink-0">
                                    <Suspense fallback={<div className="animate-pulse bg-gray-100 h-full rounded-xl"></div>}>
                                        <SessionHistory
                                            onToggle={toggleRightSidebar}
                                            onSelectSession={handleSelectSession}
                                            currentSessionId={currentSessionId}
                                        />
                                    </Suspense>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Execution Panel */}
                {executionResult && (
                    <Suspense fallback={null}>
                        <ExecutionPanel
                            execution={executionResult}
                            onClose={handleCloseExecutionPanel}
                        />
                    </Suspense>
                )}

                {/* Add Post Modal */}
                {showAddPostModal && (
                    <Suspense fallback={null}>
                        <AddPostModal
                            isOpen={showAddPostModal}
                            onClose={() => setShowAddPostModal(false)}
                            onAdd={handleAddPost}
                        />
                    </Suspense>
                )}
            </main>
            <Toaster />
        </>
    );
}
