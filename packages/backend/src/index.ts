import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import fs from 'fs';
import { ErrorResponse } from '@vlowgen/shared';
import workflowRouter from './api/workflows';
import imageHistoryRouter from './api/image-history';
import schedulerRouter from './api/scheduler';
import { schedulerService } from './services/scheduler.service';
import { logger } from './utils/logger';
import {
  rateLimit,
  securityHeaders,
  sanitizeRequest,
  validateApiKey,
  getCorsOptions,
  requestLogger,
} from './middleware/security';

// Load environment variables from packages/backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const USE_SSL = process.env.USE_SSL === 'true';
const SSL_CERT_PATH = process.env.SSL_CERT_PATH;
const SSL_KEY_PATH = process.env.SSL_KEY_PATH;

// Security middleware
app.use(securityHeaders);
app.use(sanitizeRequest);
app.use(rateLimit(100, 60000)); // 100 requests per minute

// CORS configuration
app.use(cors(getCorsOptions()));

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// API routes
app.use('/api/workflows', workflowRouter);
app.use('/api/image-history', imageHistoryRouter);
app.use('/api/scheduler', schedulerRouter);
// OAuth routes are also in the workflow router, mounted at /api
app.use('/api', workflowRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', { method: req.method, path: req.path });
  res.status(404).json({
    error: {
      type: 'user',
      message: `Route ${req.method} ${req.path} not found`,
      retryable: false
    }
  } as ErrorResponse);
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details (safe for production)
  logger.error('Request error', {
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || 500,
  });

  // Don't expose stack traces in production
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Error stack', { stack: err.stack });
  }

  // Determine error type
  let errorType: 'user' | 'validation' | 'service' | 'system' = 'system';
  let statusCode = 500;
  let retryable = false;

  if (err.name === 'ValidationError') {
    errorType = 'validation';
    statusCode = 400;
    retryable = false;
  } else if (err.name === 'UserError') {
    errorType = 'user';
    statusCode = 400;
    retryable = false;
  } else if (err.name === 'ServiceError') {
    errorType = 'service';
    statusCode = 502;
    retryable = true;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  }

  // Send error response (no stack trace in production)
  res.status(statusCode).json({
    error: {
      type: errorType,
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      retryable
    }
  } as ErrorResponse);
});

// Start server with optional SSL
function startServer(): https.Server | ReturnType<typeof app.listen> {
  let server: https.Server | ReturnType<typeof app.listen>;

  if (USE_SSL && SSL_CERT_PATH && SSL_KEY_PATH) {
    try {
      const cert = fs.readFileSync(SSL_CERT_PATH, 'utf8');
      const key = fs.readFileSync(SSL_KEY_PATH, 'utf8');

      server = https.createServer({ cert, key }, app);
      logger.info('HTTPS server created with SSL certificates');
    } catch (error) {
      logger.error('Failed to load SSL certificates', { error: (error as Error).message });
      logger.info('Falling back to HTTP');
      server = app.listen(PORT);
    }
  } else {
    server = app.listen(PORT);
  }

  if (server instanceof https.Server || 'listen' in server) {
    const protocol = USE_SSL && SSL_CERT_PATH && SSL_KEY_PATH ? 'HTTPS' : 'HTTP';
    
    if (server instanceof https.Server) {
      server.listen(PORT, () => {
        logger.info(`Backend server started`, {
          protocol,
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
          ssl: USE_SSL,
        });

        // Auto-start scheduler service
        logger.info('Starting scheduler service...');
        schedulerService.start();
      });
    }
  }

  return server;
}

const server = startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  schedulerService.stop();
  if (server && typeof (server as any).close === 'function') {
    (server as any).close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  schedulerService.stop();
  if (server && typeof (server as any).close === 'function') {
    (server as any).close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error.message });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});
