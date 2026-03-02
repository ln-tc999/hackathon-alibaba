import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ErrorResponse } from '@vlowgen/shared';
import workflowRouter from './api/workflows';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/workflows', workflowRouter);
// OAuth routes are also in the workflow router, mounted at /api
app.use('/api', workflowRouter);

// 404 handler
app.use((req: Request, res: Response) => {
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
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

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

  // Send error response
  res.status(statusCode).json({
    error: {
      type: errorType,
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      retryable
    }
  } as ErrorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
