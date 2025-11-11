/**
 * HALT B1 - Canary Middleware
 * Detects X-Canary header and routes to native or proxy
 */

import type { Context, Next } from 'hono';

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
 */
export const DEFAULT_CANARY_CONFIG: CanaryConfig = {
  phaseB1a: {
    enabled: true,
    routes: new Set([
      'GET /api/shoots/:id/stacks',
      'GET /api/shoots/:id/images',
      'GET /api/jobs',
      'GET /api/jobs/:id',
      'GET /api/notifications',
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
