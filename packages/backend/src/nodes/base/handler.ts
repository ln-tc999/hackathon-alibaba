/**
 * Base NodeHandler interface and registry for node execution
 * 
 * This module defines the interface that all node handlers must implement
 * and provides a registry for looking up handlers by node type.
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

import {
  WorkflowNode,
  NodeExecutionResult,
  ExecutionContext,
  NodeType
} from '@vlowgen/shared';

/**
 * NodeHandler interface for executing individual nodes
 * Each node type must implement this interface
 */
export interface NodeHandler {
  /**
   * Execute a node with given inputs and context
   * 
   * @param node - The workflow node to execute
   * @param inputs - Input data from upstream nodes (keyed by source node ID)
   * @param context - Execution context with credentials and logger
   * @returns Promise resolving to node execution result
   */
  execute(
    node: WorkflowNode,
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
}

/**
 * NodeHandlerRegistry manages the mapping of node types to their handlers
 */
export class NodeHandlerRegistry {
  private handlers: Map<NodeType, NodeHandler>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Register a handler for a specific node type
   * 
   * @param nodeType - The type of node this handler processes
   * @param handler - The handler instance
   */
  register(nodeType: NodeType, handler: NodeHandler): void {
    this.handlers.set(nodeType, handler);
  }

  /**
   * Get the handler for a specific node type
   * 
   * @param nodeType - The type of node to get handler for
   * @returns The handler instance or undefined if not registered
   */
  get(nodeType: NodeType): NodeHandler | undefined {
    return this.handlers.get(nodeType);
  }

  /**
   * Check if a handler is registered for a node type
   * 
   * @param nodeType - The type of node to check
   * @returns True if handler is registered, false otherwise
   */
  has(nodeType: NodeType): boolean {
    return this.handlers.has(nodeType);
  }

  /**
   * Get all registered node types
   * 
   * @returns Array of registered node types
   */
  getRegisteredTypes(): NodeType[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}
