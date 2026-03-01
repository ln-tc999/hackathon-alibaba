/**
 * Workflow API Router
 * 
 * Provides REST API endpoints for workflow execution and validation.
 * 
 * Requirements: 13.2, 13.3, 13.4
 */

import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import {
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  ValidateWorkflowRequest,
  ValidateWorkflowResponse,
  ErrorResponse
} from '@vlowgen/shared';
import { WorkflowExecutionEngine } from '../engine/execution-engine';
import { WorkflowValidator } from '../engine/validator';
import { PromptTextNodeHandler } from '../nodes/prompt-text-handler';
import { Wan2NodeHandler } from '../nodes/wan2-handler';
import { OpenRouterNodeHandler } from '../nodes/openrouter-handler';
import { TwitterNodeHandler } from '../nodes/twitter-handler';
import { InstagramNodeHandler } from '../nodes/instagram-handler';
import { FacebookNodeHandler } from '../nodes/facebook-handler';
import { TikTokNodeHandler } from '../nodes/tiktok-handler';
import { YouTubeNodeHandler } from '../nodes/youtube-handler';
import { PromptEnhancerImageHandler } from '../nodes/prompt-enhancer-image-handler';
import { PromptEnhancerVideoHandler } from '../nodes/prompt-enhancer-video-handler';
import { VisionAnalyzerHandler } from '../nodes/vision-analyzer-handler';
import { ComposioClient } from '../integrations/composio';

const router: RouterType = Router();

// In-memory token storage (for MVP - should use database in production)
const tokenStorage = new Map<string, { token: string; accountHandle: string }>();

/**
 * POST /api/workflows/execute
 * 
 * Execute a workflow with provided credentials
 * Requirements: 13.2, 13.3, 13.4
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const requestBody = req.body as ExecuteWorkflowRequest;

    if (!requestBody.workflow) {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Missing workflow in request body',
          retryable: false
        }
      } as ErrorResponse);
    }

    if (!requestBody.credentials) {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Missing credentials in request body',
          retryable: false
        }
      } as ErrorResponse);
    }

    // Create execution engine with node handlers
    const engine = new WorkflowExecutionEngine();
    
    // Register node handlers
    engine.registerNodeHandler('prompt-text', new PromptTextNodeHandler());
    engine.registerNodeHandler('wan2', new Wan2NodeHandler());
    engine.registerNodeHandler('openrouter', new OpenRouterNodeHandler());
    engine.registerNodeHandler('twitter', new TwitterNodeHandler());
    engine.registerNodeHandler('instagram', new InstagramNodeHandler());
    engine.registerNodeHandler('facebook', new FacebookNodeHandler());
    engine.registerNodeHandler('tiktok', new TikTokNodeHandler());
    engine.registerNodeHandler('youtube', new YouTubeNodeHandler());
    engine.registerNodeHandler('prompt-enhancer-image', new PromptEnhancerImageHandler());
    engine.registerNodeHandler('prompt-enhancer-video', new PromptEnhancerVideoHandler());
    engine.registerNodeHandler('vision-analyzer', new VisionAnalyzerHandler());

    // Execute workflow
    const executionResult = await engine.execute(requestBody.workflow, {
      credentials: requestBody.credentials
    });

    // Return execution results
    const response: ExecuteWorkflowResponse = {
      executionId: executionResult.executionId,
      status: executionResult.status === 'success' ? 'success' : 'error',
      results: executionResult,
      error: executionResult.error
    };

    res.json(response);
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    res.status(500).json({
      error: {
        type: 'system',
        message: error instanceof Error ? error.message : 'Unknown execution error',
        retryable: true
      }
    } as ErrorResponse);
  }
});

/**
 * POST /api/workflows/validate
 * 
 * Validate a workflow structure without executing it
 * Requirements: 13.3
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const requestBody = req.body as ValidateWorkflowRequest;

    if (!requestBody.workflow) {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Missing workflow in request body',
          retryable: false
        }
      } as ErrorResponse);
    }

    // Create validator and validate workflow
    const validator = new WorkflowValidator();
    const errors = validator.validate(requestBody.workflow);

    // Return validation results
    const response: ValidateWorkflowResponse = {
      valid: errors.length === 0,
      errors
    };

    res.json(response);
  } catch (error) {
    console.error('Workflow validation error:', error);
    
    res.status(500).json({
      error: {
        type: 'system',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        retryable: true
      }
    } as ErrorResponse);
  }
});

/**
 * GET /api/auth/twitter/url
 * 
 * Get Twitter OAuth authorization URL
 * Requirements: 11.2
 */
router.get('/auth/twitter/url', async (req: Request, res: Response) => {
  try {
    // Get Composio API key from environment
    const composioApiKey = process.env.COMPOSIO_API_KEY;
    
    if (!composioApiKey) {
      return res.status(500).json({
        error: {
          type: 'system',
          message: 'Composio API key not configured',
          retryable: false
        }
      } as ErrorResponse);
    }

    // Create Composio client and get auth URL
    const composioClient = new ComposioClient(composioApiKey);
    const authResponse = await composioClient.getTwitterAuthUrl();

    res.json({
      authUrl: authResponse.authUrl,
      state: authResponse.state
    });
  } catch (error) {
    console.error('Twitter OAuth URL error:', error);
    
    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to get Twitter auth URL',
        retryable: true
      }
    } as ErrorResponse);
  }
});

/**
 * GET /api/auth/twitter/callback
 * 
 * Handle Twitter OAuth callback and store token
 * Requirements: 11.3
 */
router.get('/auth/twitter/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Missing or invalid authorization code',
          retryable: false
        }
      } as ErrorResponse);
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).json({
        error: {
          type: 'user',
          message: 'Missing or invalid state parameter',
          retryable: false
        }
      } as ErrorResponse);
    }

    // Get Composio API key from environment
    const composioApiKey = process.env.COMPOSIO_API_KEY;
    
    if (!composioApiKey) {
      return res.status(500).json({
        error: {
          type: 'system',
          message: 'Composio API key not configured',
          retryable: false
        }
      } as ErrorResponse);
    }

    // Create Composio client and handle callback
    const composioClient = new ComposioClient(composioApiKey);
    const callbackResponse = await composioClient.handleTwitterCallback(code, state);

    // Store token securely (in-memory for MVP, should use encrypted database in production)
    // Using state as the key for simplicity
    tokenStorage.set(state, {
      token: callbackResponse.token,
      accountHandle: callbackResponse.accountHandle
    });

    res.json({
      success: true,
      accountHandle: callbackResponse.accountHandle,
      tokenKey: state // Return state as token key for frontend to use
    });
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    
    res.status(500).json({
      error: {
        type: 'service',
        message: error instanceof Error ? error.message : 'Failed to complete Twitter authentication',
        retryable: true
      }
    } as ErrorResponse);
  }
});

/**
 * GET /api/auth/twitter/token/:tokenKey
 * 
 * Retrieve stored Twitter token by key
 * Helper endpoint for frontend to get token for workflow execution
 */
router.get('/auth/twitter/token/:tokenKey', (req: Request, res: Response) => {
  try {
    const { tokenKey } = req.params;

    const tokenData = tokenStorage.get(tokenKey);

    if (!tokenData) {
      return res.status(404).json({
        error: {
          type: 'user',
          message: 'Token not found. Please authenticate again.',
          retryable: false
        }
      } as ErrorResponse);
    }

    res.json({
      token: tokenData.token,
      accountHandle: tokenData.accountHandle
    });
  } catch (error) {
    console.error('Token retrieval error:', error);
    
    res.status(500).json({
      error: {
        type: 'system',
        message: error instanceof Error ? error.message : 'Failed to retrieve token',
        retryable: false
      }
    } as ErrorResponse);
  }
});

export default router;
