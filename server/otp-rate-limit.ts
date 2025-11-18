/**
 * Rate Limiting for OTP Requests
 * 
 * Implements two levels of rate limiting:
 * 1. Email-based: Max 1 OTP request per minute per email address
 * 2. IP-based: Max 10 OTP requests per hour per IP address
 * 
 * Uses in-memory storage for rate limit tracking.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

// In-memory rate limit storage
const emailRateLimits = new Map<string, RateLimitEntry>();
const ipRateLimits = new Map<string, RateLimitEntry>();

// Rate limit windows (in milliseconds)
const EMAIL_WINDOW_MS = 60 * 1000; // 1 minute
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Rate limit thresholds
const EMAIL_MAX_REQUESTS = 1; // 1 request per minute per email
const IP_MAX_REQUESTS = 10; // 10 requests per hour per IP

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  
  // Clean email rate limits
  for (const [email, entry] of emailRateLimits.entries()) {
    if (now - entry.firstAttempt > EMAIL_WINDOW_MS) {
      emailRateLimits.delete(email);
    }
  }
  
  // Clean IP rate limits
  for (const [ip, entry] of ipRateLimits.entries()) {
    if (now - entry.firstAttempt > IP_WINDOW_MS) {
      ipRateLimits.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Check if an email address has exceeded the rate limit
 * 
 * @param email - Normalized email address (lowercase, trimmed)
 * @returns Object with allowed status and retry info
 */
export function checkEmailRateLimit(email: string): {
  allowed: boolean;
  retryAfter?: number;
  message?: string;
} {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  const entry = emailRateLimits.get(normalizedEmail);
  
  // No previous request - allow
  if (!entry) {
    emailRateLimits.set(normalizedEmail, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return { allowed: true };
  }
  
  // Check if window has expired
  const windowExpired = now - entry.firstAttempt > EMAIL_WINDOW_MS;
  
  if (windowExpired) {
    // Reset window
    emailRateLimits.set(normalizedEmail, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return { allowed: true };
  }
  
  // Within window - check limit
  if (entry.count >= EMAIL_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + EMAIL_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Bitte warte ${retryAfter} Sekunden, bevor du einen neuen Code anforderst.`,
    };
  }
  
  // Increment count
  entry.count++;
  entry.lastAttempt = now;
  return { allowed: true };
}

/**
 * Check if an IP address has exceeded the rate limit
 * 
 * @param ip - Client IP address
 * @returns Object with allowed status and retry info
 */
export function checkIpRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
  message?: string;
} {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);
  
  // No previous request - allow
  if (!entry) {
    ipRateLimits.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return { allowed: true };
  }
  
  // Check if window has expired
  const windowExpired = now - entry.firstAttempt > IP_WINDOW_MS;
  
  if (windowExpired) {
    // Reset window
    ipRateLimits.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return { allowed: true };
  }
  
  // Within window - check limit
  if (entry.count >= IP_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.firstAttempt + IP_WINDOW_MS - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Zu viele Anfragen von dieser IP-Adresse. Bitte versuche es in ${Math.ceil(retryAfter / 60)} Minuten erneut.`,
    };
  }
  
  // Increment count
  entry.count++;
  entry.lastAttempt = now;
  return { allowed: true };
}

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
export function getClientIp(req: any): string {
  // Try various headers that proxies might set
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first IP
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return realIp;
  }
  
  // Fallback to socket address
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Reset rate limit for a specific email (for testing/admin purposes)
 */
export function resetEmailRateLimit(email: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  emailRateLimits.delete(normalizedEmail);
}

/**
 * Reset rate limit for a specific IP (for testing/admin purposes)
 */
export function resetIpRateLimit(ip: string): void {
  ipRateLimits.delete(ip);
}

/**
 * Get current rate limit stats (for monitoring/debugging)
 */
export function getRateLimitStats() {
  return {
    emailRateLimits: {
      total: emailRateLimits.size,
      entries: Array.from(emailRateLimits.entries()).map(([email, entry]) => ({
        email: email.replace(/^(.{3}).*(@.*)$/, "$1***$2"), // Mask email for privacy
        count: entry.count,
        firstAttempt: new Date(entry.firstAttempt).toISOString(),
        lastAttempt: new Date(entry.lastAttempt).toISOString(),
      })),
    },
    ipRateLimits: {
      total: ipRateLimits.size,
      entries: Array.from(ipRateLimits.entries()).map(([ip, entry]) => ({
        ip: ip.replace(/(\d+\.\d+\.\d+\.)\d+/, "$1***"), // Mask last octet for privacy
        count: entry.count,
        firstAttempt: new Date(entry.firstAttempt).toISOString(),
        lastAttempt: new Date(entry.lastAttempt).toISOString(),
      })),
    },
  };
}
