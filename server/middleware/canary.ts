/**
 * HALT B2a - Canary Middleware
 * Sticky cohort-based sampling with KV config and circuit breaker
 */

import type { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { CanaryKVConfig } from '../../workers/edge';

/**
 * Canary configuration
 */
export interface CanaryConfig {
  /**
   * Phase B1a: Read-only GET routes
   */
  phaseB1a: {
    enabled: boolean;
    routes: Set<string>;
  };
  /**
   * Phase B1b: Upload routes (intent/finalize)
   */
  phaseB1b: {
    enabled: boolean;
    routes: Set<string>;
  };
}

/**
 * Default canary config - matches actual Worker routes
 * NOTE: /api/notifications excluded from B1a (no storage implementation yet)
 */
export const DEFAULT_CANARY_CONFIG: CanaryConfig = {
  phaseB1a: {
    enabled: true,
    routes: new Set([
      'GET /api/shoots/:id/stacks',
      'GET /api/shoots/:id/images',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      // NOTE: /api/notifications NOT included - proxies to origin
    ]),
  },
  phaseB1b: {
    enabled: false, // Controlled by PHASE_B1B_ENABLED env var
    routes: new Set([
      'POST /api/pixcapture/upload/intent',
      'POST /api/pixcapture/upload/finalize',
    ]),
  },
};

/**
 * Normalize path for pattern matching
 * Replaces UUIDs and numeric IDs with :id parameter
 */
function normalizePath(path: string): string {
  return path
    // Replace UUID patterns (8-4-4-4-12 hex digits)
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/|$)/gi, '/:id$1')
    // Replace numeric IDs (e.g., /123/, /456)
    .replace(/\/\d+(\/|$)/g, '/:id$1')
    // Normalize trailing slashes
    .replace(/\/+$/, '');
}

/**
 * Check if canary is enabled for this request
 */
export function isCanaryEnabled(c: Context): boolean {
  const header = c.req.header('x-canary');
  return header === '1' || header === 'true';
}

/**
 * Check if route should be handled natively (vs proxied)
 */
export function shouldHandleNatively(
  method: string,
  path: string,
  config: CanaryConfig,
  canaryEnabled: boolean
): { native: boolean; phase: 'b1a' | 'b1b' | 'proxy' } {
  if (!canaryEnabled) {
    return { native: false, phase: 'proxy' };
  }

  // Normalize path for pattern matching
  const normalizedPath = normalizePath(path);
  const routeKey = `${method} ${normalizedPath}`;

  // Check Phase B1a (read-only GET)
  if (config.phaseB1a.enabled && config.phaseB1a.routes.has(routeKey)) {
    return { native: true, phase: 'b1a' };
  }

  // Check Phase B1b (uploads)
  if (config.phaseB1b.enabled && config.phaseB1b.routes.has(routeKey)) {
    return { native: true, phase: 'b1b' };
  }

  return { native: false, phase: 'proxy' };
}

/**
 * Canary middleware factory
 * Sets c.get('canary') and c.get('canaryPhase') for use in routes
 */
export function canaryMiddleware(config: CanaryConfig = DEFAULT_CANARY_CONFIG) {
  return async (c: Context, next: Next) => {
    const canaryEnabled = isCanaryEnabled(c);
    const method = c.req.method;
    const path = c.req.path;

    const decision = shouldHandleNatively(method, path, config, canaryEnabled);

    // Store canary state in context
    c.set('canary', canaryEnabled);
    c.set('canaryPhase', decision.phase);
    c.set('nativeHandler', decision.native);

    await next();
  };
}

/**
 * Require canary for route
 * Use with: app.get('/path', requireCanary, nativeHandler, proxyFallback)
 */
export function requireCanary(c: Context, next: Next) {
  if (!c.get('nativeHandler')) {
    // Don't proceed to native handler, skip to proxy
    return;
  }
  return next();
}

// =============================================================================
// B2a - Sticky Canary Decision Logic
// =============================================================================

/**
 * Cohort assignment result
 */
export interface CanaryDecision {
  cohort: 'native' | 'proxy';
  reason: 'emergency' | 'header' | 'cookie' | 'sampled' | 'default';
  kvConfig?: CanaryKVConfig;
  sampledNew?: boolean; // true if new cohort assignment
}

/**
 * Get canary configuration from Workers KV
 * Falls back to safe defaults if KV unavailable
 */
export async function getCanaryConfig(env: any): Promise<CanaryKVConfig> {
  // KV not bound or missing
  if (!env?.CANARY_CONFIG) {
    return {
      canary_percent: 0,
      canary_tag: 'kv-disabled',
      emergency_proxy: false,
    };
  }

  try {
    const raw = await env.CANARY_CONFIG.get('config', { type: 'json' });
    if (!raw) {
      return {
        canary_percent: 0,
        canary_tag: 'kv-missing',
        emergency_proxy: false,
      };
    }

    // Validate and sanitize config
    return {
      canary_percent: Math.max(0, Math.min(100, Number(raw.canary_percent || 0))),
      canary_tag: String(raw.canary_tag || 'unknown'),
      emergency_proxy: Boolean(raw.emergency_proxy),
      last_updated: raw.last_updated,
    };
  } catch (err) {
    console.error('[Canary] KV read error:', err);
    return {
      canary_percent: 0,
      canary_tag: 'kv-error',
      emergency_proxy: false,
    };
  }
}

/**
 * Get canary decision with 5-level hierarchy
 * 
 * Priority:
 * 1. EMERGENCY_PROXY (KV) → force 100% proxy
 * 2. X-Canary: 1 (header) → force 100% native
 * 3. _canary_cohort (cookie) → sticky 24h
 * 4. Math.random() < CANARY_PERCENT → new sampling
 * 5. Default → proxy
 */
export async function getCanaryDecision(
  c: Context,
  env: any
): Promise<CanaryDecision> {
  const kvConfig = await getCanaryConfig(env);

  // 1. Emergency proxy (KV circuit breaker)
  if (kvConfig.emergency_proxy === true) {
    return {
      cohort: 'proxy',
      reason: 'emergency',
      kvConfig,
    };
  }

  // 2. X-Canary header (explicit opt-in for testing)
  const headerValue = c.req.header('x-canary');
  if (headerValue === '1' || headerValue === 'true') {
    return {
      cohort: 'native',
      reason: 'header',
      kvConfig,
    };
  }

  // 3. Sticky cohort cookie (24h persistence)
  const cookieValue = getCookie(c, '_canary_cohort');
  if (cookieValue === 'native' || cookieValue === 'proxy') {
    return {
      cohort: cookieValue,
      reason: 'cookie',
      kvConfig,
    };
  }

  // 4. Sample new cohort (probabilistic assignment)
  const randomValue = Math.random() * 100;
  const cohort = randomValue < kvConfig.canary_percent ? 'native' : 'proxy';

  return {
    cohort,
    reason: 'sampled',
    kvConfig,
    sampledNew: true,
  };
}

/**
 * Set sticky cohort cookie (24h TTL)
 * Prevents session drift in multi-request flows (upload intent → finalize)
 */
export function setCanaryCohortCookie(
  c: Context,
  cohort: 'native' | 'proxy',
  env: any
) {
  const maxAge = 86400; // 24 hours in seconds
  const secure = env?.COOKIE_SECURE === 'true';
  const sameSite = (env?.COOKIE_SAMESITE || 'Lax') as 'Strict' | 'Lax' | 'None';

  setCookie(c, '_canary_cohort', cohort, {
    maxAge,
    path: '/',
    httpOnly: true,
    secure,
    sameSite,
  });
}

/**
 * Set X-Pix-Canary response header for observability
 * Format: X-Pix-Canary: 1;tag=B2a;cohort=native;reason=sampled
 */
export function setCanaryResponseHeader(c: Context, decision: CanaryDecision) {
  const parts = [
    '1', // Version indicator
    `tag=${decision.kvConfig?.canary_tag || 'unknown'}`,
    `cohort=${decision.cohort}`,
    `reason=${decision.reason}`,
  ];

  c.header('X-Pix-Canary', parts.join(';'));
}

/**
 * B2a Canary Middleware
 * Combines sticky cohort decision with route-based native handling
 */
export function canaryMiddlewareV2(config: CanaryConfig = DEFAULT_CANARY_CONFIG) {
  return async (c: Context, next: Next) => {
    // Get environment bindings (Workers only - Express uses env vars)
    const env = c.env || {};

    // Get sticky cohort decision
    const decision = await getCanaryDecision(c, env);

    // Set cookie if new sampling occurred
    if (decision.sampledNew) {
      setCanaryCohortCookie(c, decision.cohort, env);
    }

    // Set observability header
    setCanaryResponseHeader(c, decision);

    // Store cohort in context
    c.set('canary', decision.cohort === 'native');
    c.set('canaryDecision', decision);

    // Route-based eligibility (B1a/B1b phases)
    const method = c.req.method;
    const path = c.req.path;
    const canaryEnabled = decision.cohort === 'native';

    const routeDecision = shouldHandleNatively(method, path, config, canaryEnabled);

    // Store route decision in context
    c.set('canaryPhase', routeDecision.phase);
    c.set('nativeHandler', routeDecision.native);

    await next();
  };
}
