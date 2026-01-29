import crypto from 'crypto';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  dailyCount: number;
  dailyResetTime: number;
}

// In-memory store for rate limiting
// In production, consider Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>();

// Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

// Get client IP from request
export function getClientIP(request: Request): string {
  // Check various headers for real IP (Vercel provides these)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  
  const ip = vercelIP || forwarded?.split(',')[0] || realIP || 'unknown';
  return hashIP(ip.trim());
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  dailyRemaining: number;
  dailyResetTime: number;
}

export function checkRateLimit(
  clientId: string,
  hourlyLimit: number = 100,
  dailyLimit: number = 500
): RateLimitResult {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  const dayInMs = 24 * hourInMs;
  
  let entry = rateLimitStore.get(clientId);
  
  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + hourInMs,
      dailyCount: 0,
      dailyResetTime: now + dayInMs,
    };
  }
  
  // Reset hourly counter if expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + hourInMs;
  }
  
  // Reset daily counter if expired
  if (now >= entry.dailyResetTime) {
    entry.dailyCount = 0;
    entry.dailyResetTime = now + dayInMs;
  }
  
  // Check limits
  const hourlyAllowed = entry.count < hourlyLimit;
  const dailyAllowed = entry.dailyCount < dailyLimit;
  const allowed = hourlyAllowed && dailyAllowed;
  
  if (allowed) {
    entry.count++;
    entry.dailyCount++;
    rateLimitStore.set(clientId, entry);
  }
  
  return {
    allowed,
    remaining: Math.max(0, hourlyLimit - entry.count),
    resetTime: entry.resetTime,
    dailyRemaining: Math.max(0, dailyLimit - entry.dailyCount),
    dailyResetTime: entry.dailyResetTime,
  };
}

// Cleanup old entries periodically (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries that are expired on both counters
    if (now >= entry.resetTime && now >= entry.dailyResetTime && entry.count === 0 && entry.dailyCount === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
