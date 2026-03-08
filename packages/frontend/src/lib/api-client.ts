/**
 * API client for backend communication
 * Provides typed methods for workflow execution and validation
 */

import type {
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  ValidateWorkflowRequest,
  ValidateWorkflowResponse,
  ErrorResponse,
  Workflow,
  ServiceCredentials,
} from '@vlowgen/shared';

// Use relative path for nginx reverse proxy, fallback to /api
const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

/**
 * Custom error class for API errors with user-friendly messages
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: 'user' | 'validation' | 'service' | 'system',
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error logger for debugging
 * Logs API errors to browser console with request/response details
 * Classifies errors as user vs system errors
 * Requirements: 15.3, 15.4
 */
class ErrorLogger {
  /**
   * Log API error with full context
   */
  logApiError(
    endpoint: string,
    method: string,
    requestBody: any,
    error: ApiError,
    responseData?: any
  ): void {
    const isUserError = error.type === 'user' || error.type === 'validation';
    const isSystemError = error.type === 'service' || error.type === 'system';

    // Create structured log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      errorType: error.type,
      errorClassification: isUserError ? 'USER_ERROR' : 'SYSTEM_ERROR',
      statusCode: error.statusCode,
      message: error.message,
      retryable: error.retryable,
      request: {
        body: requestBody,
      },
      response: responseData,
      details: error.details,
    };

    // Log to console with appropriate level
    if (isUserError) {
      console.warn('[API User Error]', logEntry);
    } else if (isSystemError) {
      console.error('[API System Error]', logEntry);
    } else {
      console.error('[API Unknown Error]', logEntry);
    }

    // Log stack trace for system errors
    if (isSystemError && error.stack) {
      console.error('[Stack Trace]', error.stack);
    }
  }

  /**
   * Log network error
   */
  logNetworkError(endpoint: string, method: string, error: Error): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      errorType: 'network',
      errorClassification: 'SYSTEM_ERROR',
      message: error.message,
      stack: error.stack,
    };

    console.error('[API Network Error]', logEntry);
  }
}

const errorLogger = new ErrorLogger();

/**
 * Maps backend error responses to user-friendly messages
 */
function mapErrorToUserMessage(error: ErrorResponse['error']): string {
  switch (error.type) {
    case 'user':
      return error.message;
    case 'validation':
      return `Workflow validation failed: ${error.message}`;
    case 'service':
      return `External service error: ${error.message}. ${error.retryable ? 'Please try again.' : ''}`;
    case 'system':
      return 'An unexpected error occurred. Please try again later.';
    default:
      return 'An unknown error occurred.';
  }
}

/**
 * Makes an HTTP request to the backend API
 * Logs all errors with request/response details for debugging
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const method = options.method || 'GET';
  let requestBody: any;

  try {
    // Parse request body for logging
    if (options.body && typeof options.body === 'string') {
      try {
        requestBody = JSON.parse(options.body);
      } catch {
        requestBody = options.body;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });


    const data = await response.json();

    if (!response.ok) {
      // Handle error response
      const errorData = data as ErrorResponse;
      const userMessage = mapErrorToUserMessage(errorData.error);

      const apiError = new ApiError(
        userMessage,
        response.status,
        errorData.error.type,
        errorData.error.retryable,
        errorData.error.details
      );

      // Log error with full context
      errorLogger.logApiError(endpoint, method, requestBody, apiError, data);

      throw apiError;
    }

    return data as T;
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error instanceof ApiError) {
      console.error('[API Client] ApiError:', error.message, error.statusCode);
      throw error;
    }

    // Log network error
    if (error instanceof Error) {
      console.error('[API Client] Network error:', error.message, error.stack);
      errorLogger.logNetworkError(endpoint, method, error);
    }

    throw new ApiError(
      'Network error: Unable to connect to the server. Please check your connection.',
      0,
      'system',
      true
    );
  }
}

/**
 * Executes a workflow on the backend
 */
export async function executeWorkflow(
  workflow: Workflow,
  credentials: ServiceCredentials
): Promise<ExecuteWorkflowResponse> {
  const request: ExecuteWorkflowRequest = {
    workflow,
    credentials,
  };


  return apiRequest<ExecuteWorkflowResponse>('/api/workflows/execute', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Validates a workflow structure without executing it
 */
export async function validateWorkflow(workflow: Workflow): Promise<ValidateWorkflowResponse> {
  const request: ValidateWorkflowRequest = {
    workflow,
  };

  return apiRequest<ValidateWorkflowResponse>('/api/workflows/validate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Gets the Twitter OAuth authorization URL from Composio
 */
export async function getTwitterAuthUrl(): Promise<{ authUrl: string }> {
  return apiRequest<{ authUrl: string }>('/api/auth/twitter/url', {
    method: 'GET',
  });
}

/**
 * Handles the Twitter OAuth callback
 */
export async function handleTwitterCallback(
  code: string
): Promise<{ token: string; accountHandle: string }> {
  return apiRequest<{ token: string; accountHandle: string }>('/api/auth/twitter/callback', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
