/**
 * API request and response types
 */

import { Workflow } from './workflow';
import { ExecutionResult, ServiceCredentials } from './execution';
import { ValidationError } from './validation';

export interface ExecuteWorkflowRequest {
  workflow: Workflow;
  credentials: ServiceCredentials;
}

export interface ExecuteWorkflowResponse {
  executionId: string;
  status: 'success' | 'error';
  results: ExecutionResult;
  error?: string;
}

export interface ValidateWorkflowRequest {
  workflow: Workflow;
}

export interface ValidateWorkflowResponse {
  valid: boolean;
  errors: ValidationError[];
}

export interface ErrorResponse {
  error: {
    type: 'user' | 'validation' | 'service' | 'system';
    message: string;
    nodeId?: string;
    details?: any;
    retryable: boolean;
  };
}
