/**
 * Workflow execution engine
 * Processes workflows in topological order and orchestrates node execution
 */

import { randomUUID } from 'crypto';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  ExecutionResult,
  NodeExecutionResult,
  ExecutionContext,
  ValidationError
} from '@vlowgen/shared';
import { WorkflowValidator } from './validator';

/**
 * NodeHandler interface for executing individual nodes
 * This will be implemented by specific node handlers in task 6
 */
interface NodeHandler {
  execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}

export class WorkflowExecutionEngine {
  private validator: WorkflowValidator;
  private nodeHandlers: Map<string, NodeHandler>;

  constructor(nodeHandlers?: Map<string, NodeHandler>) {
    this.validator = new WorkflowValidator();
    this.nodeHandlers = nodeHandlers || new Map();
  }

  /**
   * Executes a workflow and returns the execution result
   * Requirements: 7.1, 7.2, 7.4
   */
  async execute(
    workflow: Workflow,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const executionId = randomUUID();
    const startTime = new Date().toISOString();

    // Add executionId and workflowId to context
    const enrichedContext: ExecutionContext = {
      ...context,
      executionId,
      workflowId: workflow.id,
    };

    // Validate workflow first
    const validationErrors = this.validator.validate(workflow);
    if (validationErrors.length > 0) {
      return {
        executionId,
        workflowId: workflow.id,
        status: 'error',
        nodeResults: {},
        startTime,
        endTime: new Date().toISOString(),
        error: `Workflow validation failed: ${validationErrors.map(e => e.message).join(', ')}`
      };
    }

    const nodeResults: Record<string, NodeExecutionResult> = {};
    const nodeOutputs: Record<string, any> = {};

    try {
      // Get nodes in topological order
      const sortedNodes = this.topologicalSort(workflow);

      // Execute nodes in order
      for (const node of sortedNodes) {
        // Gather inputs from predecessor nodes
        const inputs = this.gatherNodeInputs(node.id, workflow.edges, nodeOutputs);

        // Execute the node with enriched context
        const result = await this.executeNode(node, inputs, enrichedContext);
        nodeResults[node.id] = result;

        // If node failed, stop execution and propagate error
        if (result.status === 'error') {
          return {
            executionId,
            workflowId: workflow.id,
            status: 'error',
            nodeResults,
            startTime,
            endTime: new Date().toISOString(),
            error: `Node ${node.id} failed: ${result.error}`
          };
        }

        // Store output for downstream nodes
        nodeOutputs[node.id] = result.output;
      }

      // All nodes executed successfully
      return {
        executionId,
        workflowId: workflow.id,
        status: 'success',
        nodeResults,
        startTime,
        endTime: new Date().toISOString()
      };
    } catch (error) {
      return {
        executionId,
        workflowId: workflow.id,
        status: 'error',
        nodeResults,
        startTime,
        endTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown execution error'
      };
    }
  }

  /**
   * Executes a single node by calling its handler
   * Requirements: 7.2, 7.4
   */
  private async executeNode(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get the handler for this node type
      const handler = this.nodeHandlers.get(node.type);
      
      if (!handler) {
        // No handler registered - return error
        const endTime = new Date().toISOString();
        return {
          nodeId: node.id,
          status: 'error',
          error: `No handler registered for node type: ${node.type}`,
          startTime,
          endTime,
          duration: new Date(endTime).getTime() - new Date(startTime).getTime()
        };
      }

      // Execute the handler
      const result = await handler.execute(node, inputs, context);
      
      return result;
    } catch (error) {
      const endTime = new Date().toISOString();
      return {
        nodeId: node.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown node execution error',
        startTime,
        endTime,
        duration: new Date(endTime).getTime() - new Date(startTime).getTime()
      };
    }
  }

  /**
   * Gathers inputs for a node from its predecessor nodes
   * Requirements: 7.2
   */
  private gatherNodeInputs(
    nodeId: string,
    edges: WorkflowEdge[],
    nodeOutputs: Record<string, any>
  ): Record<string, any> {
    const inputs: Record<string, any> = {};

    // Find all edges that target this node
    const incomingEdges = edges.filter(edge => edge.target === nodeId);

    // Collect outputs from source nodes
    for (const edge of incomingEdges) {
      const sourceOutput = nodeOutputs[edge.source];
      if (sourceOutput !== undefined) {
        // Use source node ID as the input key
        inputs[edge.source] = sourceOutput;
      }
    }

    return inputs;
  }

  /**
   * Performs topological sort using Kahn's algorithm
   * Handles disconnected nodes and multiple starting points
   * Requirements: 7.1
   */
  private topologicalSort(workflow: Workflow): WorkflowNode[] {
    const nodes = workflow.nodes;
    const edges = workflow.edges;

    // Build adjacency list and in-degree map
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize all nodes with in-degree 0
    for (const node of nodes) {
      adjacencyList.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // Build the graph
    for (const edge of edges) {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);

      // Increment in-degree for target node
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // Find all nodes with in-degree 0 (starting points)
    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    // Process nodes in topological order
    const sortedNodeIds: string[] = [];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      sortedNodeIds.push(nodeId);

      // Process neighbors
      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        // Decrease in-degree
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);

        // If in-degree becomes 0, add to queue
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Convert node IDs back to node objects
    const nodeMap = new Map<string, WorkflowNode>();
    for (const node of nodes) {
      nodeMap.set(node.id, node);
    }

    const sortedNodes: WorkflowNode[] = [];
    for (const nodeId of sortedNodeIds) {
      const node = nodeMap.get(nodeId);
      if (node) {
        sortedNodes.push(node);
      }
    }

    return sortedNodes;
  }

  /**
   * Registers a node handler for a specific node type
   */
  registerNodeHandler(nodeType: string, handler: NodeHandler): void {
    this.nodeHandlers.set(nodeType, handler);
  }
}
