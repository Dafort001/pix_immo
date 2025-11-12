/**
 * B2a - Worker QA Endpoint
 * Production validation with canary config, health checks, and metrics
 */

import type { Context } from 'hono';
import type { Env, CanaryKVConfig } from '../edge';
import { getCanaryConfig } from '../../server/middleware/canary';

/**
 * Health check result
 */
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  db_ping_ms?: number;
  r2_accessible?: boolean;
  origin_ping_ms?: number;
  reachable?: boolean;
  error?: string;
}

/**
 * QA endpoint response
 */
interface QAResponse {
  endpoint: string;
  timestamp: string;
  canary: {
    sampling_active: boolean;
    percent: number;
    tag: string;
    cohort: 'native' | 'proxy' | 'unknown';
    decision_reason: string;
    emergency_proxy: boolean;
  };
  health: {
    native: HealthStatus;
    proxy: HealthStatus;
  };
  metrics_24h?: {
    requests_native: number;
    requests_proxy: number;
    error_rate_native: string;
    error_rate_proxy: string;
    p90_latency_native_ms: number;
    p90_latency_proxy_ms: number;
  };
}

/**
 * Check database health
 */
async function checkDatabaseHealth(env: Env): Promise<HealthStatus> {
  try {
    const start = Date.now();
    
    // Create DB connection and test with lightweight query
    const { createDb } = await import('../db');
    const db = await createDb(env.DATABASE_URL);
    
    // Execute SELECT 1 to verify real connection
    await db.execute('SELECT 1');
    
    const pingMs = Date.now() - start;
    
    return {
      status: 'healthy',
      db_ping_ms: pingMs,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Check R2 storage health
 */
async function checkR2Health(env: Env): Promise<boolean> {
  try {
    if (!env.R2_BUCKET) {
      return false;
    }
    
    // Try to list objects (limit 1 for speed)
    const list = await env.R2_BUCKET.list({ limit: 1 });
    return list !== null;
  } catch (err) {
    console.error('[QA] R2 health check failed:', err);
    return false;
  }
}

/**
 * Check proxy/origin health
 */
async function checkProxyHealth(env: Env): Promise<HealthStatus> {
  try {
    const start = Date.now();
    const originUrl = env.ORIGIN_API_BASE || 'http://localhost:5000';
    
    // Ping origin /healthz endpoint (Express health check)
    const response = await fetch(`${originUrl}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    const pingMs = Date.now() - start;
    
    return {
      status: response.ok ? 'healthy' : 'degraded',
      origin_ping_ms: pingMs,
      reachable: true,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      reachable: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Worker QA endpoint handler
 * GET /qa
 */
export async function qaHandler(c: Context): Promise<Response> {
  const env = c.env as Env;
  
  // Check FEATURE_QA_GUARD (default: enabled for now)
  const qaGuardEnabled = env.FEATURE_QA_GUARD !== 'false';
  if (!qaGuardEnabled) {
    return c.json({
      error: 'QA endpoint disabled via FEATURE_QA_GUARD',
      hint: 'Set FEATURE_QA_GUARD=true to enable',
    }, 403);
  }
  
  // Get canary config from KV
  const kvConfig = await getCanaryConfig(env);
  
  // Get current cohort decision from context (set by middleware)
  const decision = c.get('canaryDecision') || {
    cohort: 'unknown',
    reason: 'no-middleware',
  };
  
  // Run health checks in parallel
  const [dbHealth, r2Accessible, proxyHealth] = await Promise.all([
    checkDatabaseHealth(env),
    checkR2Health(env),
    checkProxyHealth(env),
  ]);
  
  const response: QAResponse = {
    endpoint: 'worker /qa',
    timestamp: new Date().toISOString(),
    canary: {
      sampling_active: kvConfig.canary_percent > 0,
      percent: kvConfig.canary_percent,
      tag: kvConfig.canary_tag,
      cohort: decision.cohort || 'unknown',
      decision_reason: decision.reason || 'unknown',
      emergency_proxy: kvConfig.emergency_proxy,
    },
    health: {
      native: {
        status: dbHealth.status === 'healthy' && r2Accessible ? 'healthy' : 'degraded',
        db_ping_ms: dbHealth.db_ping_ms,
        r2_accessible: r2Accessible,
      },
      proxy: proxyHealth,
    },
    // TODO: Implement 24h metrics from Analytics API or Logpush
    // For now, stub with placeholder
    metrics_24h: undefined,
  };
  
  return c.json(response, 200);
}
