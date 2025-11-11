/**
 * HALT B1 - Cloudflare Workers Edge Handler
 * Hono-based API with canary routing and proxy fallback
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { canaryMiddleware, DEFAULT_CANARY_CONFIG } from '../server/middleware/canary';
import { proxyToOrigin } from '../server/proxy/originClient';
import type { Context } from 'hono';

/**
 * Cloudflare Workers bindings
 */
export interface Env {
  R2_BUCKET: any; // R2Bucket type from @cloudflare/workers-types
  SESSION_SECRET: string;
  ORIGIN_API_BASE: string;
  ALLOWED_ORIGINS?: string;
  PHASE_B1B_ENABLED?: string; // "true" to enable upload routes
}

/**
 * Context variables set by middleware
 */
type Variables = {
  reqId: string;
  startTime: number;
  canary: boolean;
  canaryPhase: 'b1a' | 'b1b' | 'proxy';
  nativeHandler: boolean;
};

/**
 * Create Hono app for Workers
 */
function createWorkerApp() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  // Structured logging middleware
  app.use('*', logger((message, ...rest) => {
    console.log(JSON.stringify({
      type: 'request',
      message,
      timestamp: new Date().toISOString(),
    }));
  }));

  // CORS middleware (B0 - parity with Express)
  app.use('*', async (c, next) => {
    const origin = c.req.header('origin');
    
    // Determine if origin is allowed (wildcard support)
    let isAllowed = false;
    if (!origin) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      isAllowed = true;
    } else {
      const allowedOrigins = (c.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
      
      // Check explicit origins
      isAllowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin);
      
      // Allow Replit preview domains
      if (!isAllowed && origin.endsWith('.replit.dev')) {
        isAllowed = true;
      }
      
      // Allow Cloudflare Pages preview deployments
      if (!isAllowed && origin.endsWith('.pixcapture.pages.dev')) {
        isAllowed = true;
      }
    }
    
    if (isAllowed && origin) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Canary, X-Device-Token, Cookie, X-Requested-With');
      c.header('Access-Control-Expose-Headers', 'Set-Cookie, X-RateLimit-Limit, X-RateLimit-Remaining');
      c.header('Access-Control-Max-Age', '86400'); // 24 hours
    }

    // Handle preflight (204 No Content)
    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    await next();
  });

  // Canary detection middleware - apply config dynamically
  app.use('*', async (c, next) => {
    // Get B1b phase toggle from environment
    const b1bEnabled = c.env.PHASE_B1B_ENABLED === 'true';
    
    // Create dynamic config
    const config = {
      phaseB1a: DEFAULT_CANARY_CONFIG.phaseB1a,
      phaseB1b: {
        ...DEFAULT_CANARY_CONFIG.phaseB1b,
        enabled: b1bEnabled,
      },
    };
    
    // Apply canary middleware with dynamic config
    return canaryMiddleware(config)(c, next);
  });

  // Request logging middleware
  app.use('*', async (c, next) => {
    const startTime = Date.now();
    const reqId = crypto.randomUUID();
    
    c.set('reqId', reqId);
    c.set('startTime', startTime);

    await next();

    const latency = Date.now() - startTime;
    console.log(JSON.stringify({
      type: 'response',
      req_id: reqId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      canary: c.get('canary') || false,
      phase: c.get('canaryPhase') || 'proxy',
      native: c.get('nativeHandler') || false,
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    }));
  });

  return app;
}

/**
 * Create proxy handler for non-canary routes
 */
function createProxyHandler() {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>) => {
    const originBaseUrl = c.env.ORIGIN_API_BASE;
    const reqId = c.get('reqId') || 'unknown';

    // Build proxy request with startTime
    const proxyReq = {
      method: c.req.method,
      path: c.req.path,
      headers: c.req.raw.headers,
      body: c.req.method !== 'GET' && c.req.method !== 'HEAD' 
        ? await c.req.arrayBuffer()
        : undefined,
      startTime: c.get('startTime'),
    };

    // Proxy to origin
    const proxyRes = await proxyToOrigin(proxyReq, originBaseUrl, {
      timeout: 30000,
      logContext: {
        reqId,
        route: c.req.path,
      },
    });

    // Forward response
    return new Response(proxyRes.body, {
      status: proxyRes.status,
      headers: proxyRes.headers,
    });
  };
}

/**
 * Main application entry point
 */
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> { // ExecutionContext from @cloudflare/workers-types
    const app = createWorkerApp();
    const proxyHandler = createProxyHandler();

    // ========== Phase B1a: Read-only GET routes ==========

    // GET /api/shoots/:id/stacks
    app.get('/api/shoots/:id/stacks', async (c) => {
      if (!c.get('nativeHandler')) {
        return proxyHandler(c);
      }

      // Native handler (stub - will be implemented in next task)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // GET /api/shoots/:id/images
    app.get('/api/shoots/:id/images', async (c) => {
      if (!c.get('nativeHandler')) {
        return proxyHandler(c);
      }

      // Native handler (stub)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // GET /api/jobs
    app.get('/api/jobs', async (c) => {
      if (!c.get('nativeHandler')) {
        return proxyHandler(c);
      }

      // Native handler (stub)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // GET /api/jobs/:id
    app.get('/api/jobs/:id', async (c) => {
      if (!c.get('nativeHandler')) {
        return proxyHandler(c);
      }

      // Native handler (stub)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // GET /api/notifications
    app.get('/api/notifications', async (c) => {
      if (!c.get('nativeHandler')) {
        return proxyHandler(c);
      }

      // Native handler (stub)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // ========== Phase B1b: Upload routes ==========

    // POST /api/pixcapture/upload/intent
    app.post('/api/pixcapture/upload/intent', async (c) => {
      // Check if B1b is enabled
      const b1bEnabled = env.PHASE_B1B_ENABLED === 'true';
      
      if (!c.get('nativeHandler') || !b1bEnabled) {
        return proxyHandler(c);
      }

      // Native handler (stub - will be implemented in Task 6)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // POST /api/pixcapture/upload/finalize
    app.post('/api/pixcapture/upload/finalize', async (c) => {
      const b1bEnabled = env.PHASE_B1B_ENABLED === 'true';
      
      if (!c.get('nativeHandler') || !b1bEnabled) {
        return proxyHandler(c);
      }

      // Native handler (stub)
      return c.json({ error: 'Not implemented - proxying to origin' }, 501);
    });

    // ========== Default: Proxy all other routes ==========
    app.all('*', proxyHandler);

    // ========== Health check (native, no proxy) ==========
    app.get('/healthz', (c) => {
      return c.json({
        status: 'ok',
        worker: 'edge',
        phase: {
          b1a: true,
          b1b: env.PHASE_B1B_ENABLED === 'true',
        },
        timestamp: new Date().toISOString(),
      });
    });

    return app.fetch(request, env, ctx);
  },
};
