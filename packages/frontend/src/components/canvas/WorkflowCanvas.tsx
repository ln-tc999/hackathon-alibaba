'use client';

import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  useReactFlow,
  ReactFlowProvider,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
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
import { DEMO_WORKFLOW } from '../../lib/demo-workflow';
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
  })) || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowId, setWorkflowId] = useState<string | null>(workflow?.id || null);
  const [isSaving, setIsSaving] = useState(false);

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
  // Highlights failed nodes with red border (Requirement 15.2)
  useEffect(() => {
    if (!executionResult) return;

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const nodeResult = executionResult.nodeResults[node.id];
        
        if (!nodeResult) return node;

        // Add error styling for failed nodes
        if (nodeResult.status === 'error') {
          return {
            ...node,
            style: {
              ...node.style,
              border: '2px solid #dc2626',
              boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)',
            },
            data: {
              ...node.data,
              error: nodeResult.error,
            },
          };
        }

        // Reset styling for successful nodes
        return {
          ...node,
          style: {
            ...node.style,
            border: undefined,
            boxShadow: undefined,
          },
          data: {
            ...node.data,
            error: undefined,
          },
        };
      })
    );
  }, [executionResult, setNodes]);

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

      onWorkflowChange(updatedWorkflow);
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
          size: '1024x1024',
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
      // Notify parent after state update
      setNodes((currentNodes) => {
        notifyWorkflowChange(currentNodes, edges);
        return currentNodes;
      });
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

  // Handle loading demo workflow
  const handleLoadDemo = useCallback(() => {
    // Convert demo workflow nodes to React Flow format
    const demoNodes: Node[] = DEMO_WORKFLOW.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));

    const demoEdges: Edge[] = DEMO_WORKFLOW.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }));

    // Load demo workflow into canvas
    setNodes(demoNodes);
    setEdges(demoEdges);
    
    // Notify parent of workflow change
    notifyWorkflowChange(demoNodes, demoEdges);

    toast.success('Demo Workflow Loaded', {
      description: 'Click "Execute Workflow" to run the demo',
    });

    // Automatically trigger execution after a short delay
    setTimeout(() => {
      if (onExecute) {
        onExecute();
      }
    }, 500);
  }, [setNodes, setEdges, notifyWorkflowChange, onExecute]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      
      {/* Save indicator */}
      {isSaving && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-blue-700">Saving...</span>
        </div>
      )}
      
      {/* Toolbar with execute button */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleLoadDemo}
          disabled={executionStatus === 'running'}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
        >
          Run Demo
        </button>
        <button
          onClick={onExecute}
          disabled={executionStatus === 'running' || nodes.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
        >
          {executionStatus === 'running' ? 'Executing...' : 'Execute Workflow'}
        </button>
      </div>
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
