/**
 * Execution-related types for workflow processing
 */

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error';
  output?: any;
  error?: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'running' | 'success' | 'error';
  nodeResults: Record<string, NodeExecutionResult>;
  startTime: string;
  endTime?: string;
  error?: string;
}

export interface ExecutionContext {
  credentials: ServiceCredentials;
  logger?: Logger;
  userId?: string;
  workflowId?: string;
  executionId?: string;
}

export interface ServiceCredentials {
  wan2ApiKey?: string;
  composioApiKey?: string;
  composioApiUrl?: string;
  twitterToken?: string;
  userId?: string;  // Add userId for per-user account lookup
}

export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}
