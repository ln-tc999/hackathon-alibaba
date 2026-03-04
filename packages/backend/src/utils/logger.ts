/**
 * Secure Logger Utility
 * Provides safe logging with sensitive data masking
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  maskSensitiveData: boolean;
  environment: string;
}

class Logger {
  private config: LoggerConfig;
  private sensitivePatterns = [
    /api[_-]?key/i,
    /secret/i,
    /password/i,
    /token/i,
    /bearer/i,
    /authorization/i,
    /credential/i,
  ];

  constructor() {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'info',
      maskSensitiveData: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Mask sensitive data in logs
   */
  private maskSensitive(data: any): any {
    if (!this.config.maskSensitiveData) {
      return data;
    }

    if (typeof data === 'string') {
      // Mask API keys, tokens, etc.
      if (data.length > 10 && (data.startsWith('sk-') || data.startsWith('ak_'))) {
        return data.substring(0, 10) + '***';
      }
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const masked: any = Array.isArray(data) ? [] : {};

      for (const [key, value] of Object.entries(data)) {
        // Check if key contains sensitive pattern
        const isSensitive = this.sensitivePatterns.some(pattern => pattern.test(key));

        if (isSensitive && typeof value === 'string') {
          masked[key] = value.length > 10 ? value.substring(0, 10) + '***' : '***';
        } else if (typeof value === 'object' && value !== null) {
          masked[key] = this.maskSensitive(value);
        } else {
          masked[key] = value;
        }
      }

      return masked;
    }

    return data;
  }

  /**
   * Format log message
   */
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (meta) {
      const maskedMeta = this.maskSensitive(meta);
      return `${prefix} ${message} ${JSON.stringify(maskedMeta)}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('debug', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.format('info', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, meta));
    }
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, meta));
    }
  }

  /**
   * Log HTTP request (safe for production)
   */
  http(method: string, path: string, statusCode?: number, duration?: number): void {
    if (this.shouldLog('info')) {
      const message = statusCode
        ? `${method} ${path} ${statusCode} ${duration ? `${duration}ms` : ''}`
        : `${method} ${path}`;
      this.info(message);
    }
  }
}

export const logger = new Logger();
