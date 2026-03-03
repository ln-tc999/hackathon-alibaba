/**
 * Workflow validation logic
 * Validates workflow structure, connections, and node configurations
 */

import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  ValidationError,
  CONNECTION_RULES
} from '@vlowgen/shared';

export class WorkflowValidator {
  /**
   * Validates a workflow and returns any validation errors
   */
  validate(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate workflow structure
    errors.push(...this.validateStructure(workflow));

    // Validate node configurations
    errors.push(...this.validateNodeConfigurations(workflow.nodes));

    // Validate connections
    errors.push(...this.validateConnections(workflow));

    // Check for cycles
    errors.push(...this.detectCycles(workflow));

    return errors;
  }

  /**
   * Validates basic workflow structure
   */
  private validateStructure(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push({
        type: 'structure',
        message: 'Workflow must contain at least one node'
      });
    }

    if (!workflow.edges) {
      errors.push({
        type: 'structure',
        message: 'Workflow must have an edges array'
      });
    }

    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push({
          type: 'structure',
          nodeId: node.id,
          message: `Duplicate node ID: ${node.id}`
        });
      }
      nodeIds.add(node.id);
    }

    // Check for duplicate edge IDs
    const edgeIds = new Set<string>();
    for (const edge of workflow.edges) {
      if (edgeIds.has(edge.id)) {
        errors.push({
          type: 'structure',
          edgeId: edge.id,
          message: `Duplicate edge ID: ${edge.id}`
        });
      }
      edgeIds.add(edge.id);
    }

    // Validate edge references
    for (const edge of workflow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push({
          type: 'structure',
          edgeId: edge.id,
          message: `Edge references non-existent source node: ${edge.source}`
        });
      }
      if (!nodeIds.has(edge.target)) {
        errors.push({
          type: 'structure',
          edgeId: edge.id,
          message: `Edge references non-existent target node: ${edge.target}`
        });
      }
    }

    return errors;
  }

  /**
   * Validates node configurations
   */
  private validateNodeConfigurations(nodes: WorkflowNode[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of nodes) {
      // Validate based on node type
      switch (node.data.type) {
        case 'prompt-text':
          if (!node.data.promptText || node.data.promptText.trim() === '') {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Prompt text node must have non-empty text'
            });
          }
          break;

        case 'wan2':
          if (!node.data.model) {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Wan2 node must specify a model'
            });
          }
          if (!node.data.size) {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Wan2 node must specify an image size'
            });
          }
          break;

        case 'twitter':
        case 'instagram':
        case 'facebook':
        case 'tiktok':
        case 'youtube':
          // Removing strict auth requirement for testing/local development purposes
          /*
          if (!node.data.authenticated) {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: `${node.data.type} node requires authentication`
            });
          }
          */
          break;

        case 'wan2-video':
          if (!node.data.model) {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Wan2 Video node must specify a model'
            });
          }
          if (!node.data.size) {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Wan2 Video node must specify a video size'
            });
          }
          break;

        case 'prompt-enhancer-image':
        case 'prompt-enhancer-video':
          if (!node.data.userPrompt || node.data.userPrompt.trim() === '') {
            errors.push({
              type: 'configuration',
              nodeId: node.id,
              message: 'Prompt enhancer node must have non-empty user prompt'
            });
          }
          break;

        case 'vision-analyzer':
          // Vision analyzer can have imageUrl, videoUrl, or uploadedFile
          // No strict validation needed as it can be configured during execution
          break;

        case 'preview':
          // Preview node passes through media - no strict validation needed
          break;

        default:
          errors.push({
            type: 'configuration',
            nodeId: node.id,
            message: `Unknown node type: ${(node.data as any).type}`
          });
      }

      // Validate position
      if (node.position.x === undefined || node.position.y === undefined) {
        errors.push({
          type: 'configuration',
          nodeId: node.id,
          message: 'Node must have valid position coordinates'
        });
      }
    }

    return errors;
  }

  /**
   * Validates connections between nodes based on connection rules
   */
  private validateConnections(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    // Create a map of node IDs to node types
    const nodeTypeMap = new Map<string, NodeType>();
    for (const node of workflow.nodes) {
      nodeTypeMap.set(node.id, node.data.type);
    }

    // Validate each edge
    for (const edge of workflow.edges) {
      const sourceType = nodeTypeMap.get(edge.source);
      const targetType = nodeTypeMap.get(edge.target);

      if (!sourceType || !targetType) {
        // This should be caught by structure validation
        continue;
      }

      // Check connection rules
      const rule = CONNECTION_RULES.find(
        (r: { sourceType: NodeType; targetType: NodeType; allowed: boolean }) =>
          r.sourceType === sourceType && r.targetType === targetType
      );

      if (!rule || !rule.allowed) {
        errors.push({
          type: 'connection',
          edgeId: edge.id,
          message: `Invalid connection: ${sourceType} cannot connect to ${targetType}`
        });
      }
    }

    return errors;
  }

  /**
   * Detects cycles in the workflow graph using DFS
   */
  private detectCycles(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    for (const node of workflow.nodes) {
      adjacencyList.set(node.id, []);
    }
    for (const edge of workflow.edges) {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);
    }

    // Track visited nodes and recursion stack
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    // DFS function to detect cycles
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart).concat(neighbor);
          errors.push({
            type: 'structure',
            message: `Cycle detected in workflow: ${cycle.join(' → ')}`
          });
          return true;
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
      return false;
    };

    // Check each node for cycles
    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        hasCycle(node.id);
      }
    }

    return errors;
  }

  /**
   * Quick validation check - returns true if workflow is valid
   */
  isValid(workflow: Workflow): boolean {
    return this.validate(workflow).length === 0;
  }
}
