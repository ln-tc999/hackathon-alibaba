interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiterService {
  private limits: Map<string, RateLimitRecord> = new Map();

  private configs: Record<string, RateLimitConfig> = {
    imageGeneration: {
      maxRequests: 5,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
    },
    visionAnalysis: {
      maxRequests: 10,
      windowMs: 24 * 60 * 60 * 1000,
    },
    workflowExecution: {
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
  };

  checkLimit(userId: string, action: string): { allowed: boolean; remaining: number; resetAt: number } {
    const config = this.configs[action];
    if (!config) {
      return { allowed: true, remaining: Infinity, resetAt: 0 };
    }

    const key = `${userId}:${action}`;
    const now = Date.now();
    const record = this.limits.get(key);

    if (!record || now >= record.resetAt) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: now + config.windowMs,
      };
      this.limits.set(key, newRecord);
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: newRecord.resetAt,
      };
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    record.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }

  reset(userId: string, action: string): void {
    const key = `${userId}:${action}`;
    this.limits.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now >= record.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiterService();

// Cleanup expired records every hour
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);
