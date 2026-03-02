import { checkRateLimit, cleanupExpiredRateLimits } from './db';
import { getUserId } from './user';

// Rate limit configurations
const RATE_LIMITS = {
  imageGeneration: { max: 5, window: 24 * 60 * 60 * 1000 }, // 5 per day
  visionAnalysis: { max: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
  workflowExecution: { max: 20, window: 60 * 60 * 1000 }, // 20 per hour
};

export type RateLimitAction = keyof typeof RATE_LIMITS;

export async function checkLimit(action: RateLimitAction): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
}> {
  const userId = getUserId();
  const config = RATE_LIMITS[action];

  return await checkRateLimit(userId, action, config.max, config.window);
}

// Cleanup expired rate limits every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredRateLimits().catch(console.error);
  }, 60 * 60 * 1000);
}
