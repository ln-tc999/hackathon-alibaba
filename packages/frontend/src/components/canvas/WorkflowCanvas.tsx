import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  ConnectionLineType,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  Node,
  Edge,
  Connection,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  NodeTypes,
} from 'reactflow';
import { toast } from 'sonner';
import type { Workflow, WorkflowNode, WorkflowEdge, NodeType, NodeData, ExecutionResult } from '@vlowgen/shared';
import { CONNECTION_RULES } from '@vlowgen/shared';
import PromptTextNode from '../nodes/PromptTextNode';
import Wan2Node from '../nodes/Wan2Node';
import { Wan2VideoNode } from '../nodes/Wan2VideoNode';
import TwitterNode from '../nodes/TwitterNode';
import InstagramNode from '../nodes/InstagramNode';
import FacebookNode from '../nodes/FacebookNode';
import TikTokNode from '../nodes/TikTokNode';
import YouTubeNode from '../nodes/YouTubeNode';
import PromptEnhancerImageNode from '../nodes/PromptEnhancerImageNode';
import PromptEnhancerVideoNode from '../nodes/PromptEnhancerVideoNode';
import VisionAnalyzerNode from '../nodes/VisionAnalyzerNode';
import PreviewNode from '../nodes/PreviewNode';
import { saveWorkflow, updateWorkflow } from '../../lib/workflow-api';
import { initializeUser } from '../../lib/user';

interface WorkflowCanvasProps {
  workflow?: Workflow;
  onWorkflowChange?: (workflow: Workflow) => void;
  onExecute?: () => void;
  executionStatus?: 'idle' | 'running' | 'success' | 'error';
  executionResult?: ExecutionResult;
}

/**
 * Main visual workflow editor component using React Flow
 * Handles node placement, connections, and workflow state management
 */
function WorkflowCanvasInner({
  workflow,
  onWorkflowChange,
  onExecute,
  executionStatus = 'idle',
  executionResult,
}: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Register custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      'prompt-text': PromptTextNode,
      'wan2': Wan2Node,
      'wan2-video': Wan2VideoNode,
      'preview': PreviewNode,
      'twitter': TwitterNode,
      'instagram': InstagramNode,
      'facebook': FacebookNode,
      'tiktok': TikTokNode,
      'youtube': YouTubeNode,
      'prompt-enhancer-image': PromptEnhancerImageNode,
      'prompt-enhancer-video': PromptEnhancerVideoNode,
      'vision-analyzer': VisionAnalyzerNode,
    }),
    []
  );

  // Convert workflow nodes/edges to React Flow format
  const initialNodes: Node[] = workflow?.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: node.data,
  })) || [];

  const initialEdges: Edge[] = workflow?.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowId, setWorkflowId] = useState<string | null>(workflow?.id || null);
  const [isSaving, setIsSaving] = useState(false);

  // Update nodes and edges when workflow prop changes
  useEffect(() => {
    if (!workflow) return;

    const newNodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));

    const newEdges: Edge[] = workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));

    // Only update if there are actual changes
    if (newNodes.length > 0 || newEdges.length > 0) {
      setNodes(newNodes);
      setEdges(newEdges);
      setWorkflowId(workflow.id);
    }
  }, [workflow, setNodes, setEdges]);

  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, []);

  // Auto-save workflow when nodes or edges change
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) return;

    const saveTimer = setTimeout(async () => {
      try {
        setIsSaving(true);

        const workflowData: Workflow = {
          id: workflowId || '',
          name: workflow?.name || 'Untitled Workflow',
          nodes: nodes.map((node) => ({
            id: node.id,
            type: node.type as NodeType,
            position: node.position,
            data: node.data as NodeData,
          })),
          edges: edges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
          })),
        };

        if (workflowId) {
          await updateWorkflow(workflowId, workflowData);
        } else {
          await saveWorkflow(workflowData);
          if (workflowData.id) {
            setWorkflowId(workflowData.id);
          }
        }
      } catch (error) {
        console.error('Failed to save workflow:', error);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(saveTimer);
  }, [nodes, edges, workflowId, workflow?.name]);

  // Update node styles based on execution results
  // Highlights failed nodes with red border, success with green, running with blue
  useEffect(() => {
    if (!executionResult) {
      // Reset all node styles when no execution
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            border: undefined,
            boxShadow: undefined,
          },
          data: {
            ...node.data,
            error: undefined,
            executionStatus: undefined,
          },
        }))
      );
      return;
    }

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const nodeResult = executionResult.nodeResults[node.id];

        if (!nodeResult) {
          // Node hasn't been executed yet - show as pending if execution is running
          if (executionStatus === 'running') {
            return {
              ...node,
              style: {
                ...node.style,
                border: '2px solid #94a3b8',
                boxShadow: '0 0 0 2px rgba(148, 163, 184, 0.2)',
                opacity: 0.6,
              },
              data: {
                ...node.data,
                executionStatus: 'pending',
              },
            };
          }
          return node;
        }

        // Add error styling for failed nodes
        if (nodeResult.status === 'error') {
          return {
            ...node,
            style: {
              ...node.style,
              border: '2px solid #dc2626',
              boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)',
              backgroundColor: '#fef2f2',
            },
            data: {
              ...node.data,
              error: nodeResult.error,
              executionStatus: 'error',
            },
          };
        }

        // Add success styling for successful nodes
        if (nodeResult.status === 'success') {
          return {
            ...node,
            style: {
              ...node.style,
              border: '2px solid #16a34a',
              boxShadow: '0 0 0 4px rgba(22, 163, 74, 0.2)',
              backgroundColor: '#f0fdf4',
            },
            data: {
              ...node.data,
              error: undefined,
              executionStatus: 'success',
            },
          };
        }

        // Default: reset styling
        return {
          ...node,
          style: {
            ...node.style,
            border: undefined,
            boxShadow: undefined,
            backgroundColor: undefined,
          },
          data: {
            ...node.data,
            error: undefined,
            executionStatus: undefined,
          },
        };
      })
    );
  }, [executionResult, executionStatus, setNodes]);

  // Notify parent of workflow changes
  const notifyWorkflowChange = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (!onWorkflowChange) return;

      const workflowNodes: WorkflowNode[] = updatedNodes.map((node) => ({
        id: node.id,
        type: node.type as NodeType,
        position: node.position,
        data: node.data,
      }));

      const workflowEdges: WorkflowEdge[] = updatedEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      }));

      const updatedWorkflow: Workflow = {
        id: workflow?.id || 'new-workflow',
        name: workflow?.name || 'Untitled Workflow',
        nodes: workflowNodes,
        edges: workflowEdges,
        createdAt: workflow?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        onWorkflowChange(updatedWorkflow);
      }, 0);
    },
    [workflow, onWorkflowChange]
  );

  // Generate unique node ID
  const generateNodeId = useCallback(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  // Create default node data based on type
  const createDefaultNodeData = useCallback((nodeType: NodeType): NodeData => {
    switch (nodeType) {
      case 'prompt-text':
        return {
          type: 'prompt-text',
          promptText: '',
        };
      case 'wan2':
        return {
          type: 'wan2',
          model: 'wan2.1-t2i-turbo',
          size: '1024*1024',
        };
      case 'preview':
        return {
          type: 'preview',
          mediaType: 'auto',
          showMetadata: true,
        };
      case 'twitter':
        return {
          type: 'twitter',
          authenticated: false,
        };
      case 'instagram':
        return {
          type: 'instagram',
          authenticated: false,
        };
      case 'facebook':
        return {
          type: 'facebook',
          authenticated: false,
        };
      case 'tiktok':
        return {
          type: 'tiktok',
          authenticated: false,
        };
      case 'youtube':
        return {
          type: 'youtube',
          authenticated: false,
        };
      case 'prompt-enhancer-image':
        return {
          type: 'prompt-enhancer-image',
          userPrompt: '',
        };
      case 'prompt-enhancer-video':
        return {
          type: 'prompt-enhancer-video',
          userPrompt: '',
        };
      case 'vision-analyzer':
        return {
          type: 'vision-analyzer',
        };
      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  }, []);

  // Handle drag over event
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event to add new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!nodeType) return;

      // Get drop position in flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: generateNodeId(),
        type: nodeType,
        position,
        data: createDefaultNodeData(nodeType),
      };

      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode);
        notifyWorkflowChange(updatedNodes, edges);
        return updatedNodes;
      });
    },
    [screenToFlowPosition, generateNodeId, createDefaultNodeData, setNodes, edges, notifyWorkflowChange]
  );

  // Handle node changes (position, selection, etc.)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      
      // Only notify parent for significant changes (not during drag)
      const hasSignificantChange = changes.some(
        (change) => change.type === 'remove' || change.type === 'add' || change.type === 'reset'
      );
      
      if (hasSignificantChange) {
        setNodes((currentNodes) => {
          notifyWorkflowChange(currentNodes, edges);
          return currentNodes;
        });
      }
    },
    [onNodesChange, setNodes, edges, notifyWorkflowChange]
  );

  // Handle edge changes (deletion, selection, etc.)
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      // Notify parent after state update
      setEdges((currentEdges) => {
        notifyWorkflowChange(nodes, currentEdges);
        return currentEdges;
      });
    },
    [onEdgesChange, setEdges, nodes, notifyWorkflowChange]
  );

  // Validate connection based on node types
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return false;

      const sourceType = sourceNode.type as NodeType;
      const targetType = targetNode.type as NodeType;

      // Check connection rules
      const rule = CONNECTION_RULES.find(
        (r) => r.sourceType === sourceType && r.targetType === targetType
      );

      return rule?.allowed || false;
    },
    [nodes]
  );

  // Handle new connections between nodes
  const handleConnect: OnConnect = useCallback(
    (connection) => {
      if (!isValidConnection(connection)) {
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        toast.error('Invalid Connection', {
          description: `Cannot connect ${sourceNode?.type || 'unknown'} to ${targetNode?.type || 'unknown'}`,
        });

        return;
      }

      setEdges((eds) => {
        const newEdges = addEdge(connection, eds);
        notifyWorkflowChange(nodes, newEdges);
        return newEdges;
      });
    },
    [isValidConnection, setEdges, nodes, notifyWorkflowChange]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative bg-gray-50 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          type: 'smoothstep',
        }}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        panOnScroll
        panOnDrag={[1, 2]} // Only pan with middle mouse or right mouse
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        preventScrolling={true}
        nodesFocusable={true}
        edgesFocusable={true}
        autoPanOnNodeDrag={true}
        autoPanOnConnect={true}
      >
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          position="top-left"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          color="#94a3b8"
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'prompt-text') return '#a78bfa';
            if (node.type === 'wan2' || node.type === 'wan2-video') return '#60a5fa';
            if (node.type?.includes('twitter')) return '#38bdf8';
            if (node.type?.includes('instagram')) return '#ec4899';
            if (node.type?.includes('facebook')) return '#6366f1';
            return '#94a3b8';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-right"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      {/* Save indicator */}
      {isSaving && (
        <div className="absolute top-4 left-4 z-[100] px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Saving...</span>
        </div>
      )}

      {/* Toolbar with execute button */}
      <div className="absolute top-4 right-4 z-[100] flex gap-2">
        <button
          onClick={onExecute}
          disabled={executionStatus === 'running' || nodes.length === 0}
          className={`px-4 py-2 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2 ${
            executionStatus === 'running'
              ? 'bg-blue-500 text-white cursor-wait'
              : executionStatus === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : executionStatus === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } ${nodes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {executionStatus === 'running' && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {executionStatus === 'success' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {executionStatus === 'error' && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>
            {executionStatus === 'running'
              ? 'Executing...'
              : executionStatus === 'success'
              ? 'Success!'
              : executionStatus === 'error'
              ? 'Failed'
              : 'Execute Workflow'}
          </span>
        </button>
      </div>
      
      {/* Execution status indicator */}
      {executionStatus === 'running' && (
        <div className="absolute top-20 right-4 z-[100] px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Executing Workflow</p>
              <p className="text-xs text-blue-600">Processing nodes...</p>
            </div>
          </div>
        </div>
      )}
      
      {executionStatus === 'success' && executionResult && (
        <div className="absolute top-20 right-4 z-[100] px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-900">Execution Complete</p>
              <p className="text-xs text-green-600">
                {Object.keys(executionResult.nodeResults).length} nodes executed
              </p>
            </div>
          </div>
        </div>
      )}
      
      {executionStatus === 'error' && executionResult && (
        <div className="absolute top-20 right-4 z-[100] px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-900">Execution Failed</p>
              <p className="text-xs text-red-600 mt-1 break-words">
                {executionResult.error || 'Unknown error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper component that provides ReactFlowProvider context
 */
export default function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
