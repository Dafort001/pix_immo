/**
 * B2a Observability - Structured Logging
 * 
 * Provides structured JSON logging for canary rollout monitoring.
 * Logs include cohort, phase, status codes, latency, and error tracking.
 */

export interface CanaryLogContext {
  cohort: 'native' | 'proxy';
  decision_reason: string;
  canary_tag: string; // Required for rollout attribution (B2a, B2b, etc.)
  request_path?: string;
  method?: string;
  status_code?: number;
  duration_ms?: number;
  error?: string;
  upload_intent_id?: string;
  r2_operation?: 'put' | 'get' | 'list' | 'delete';
}

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context: CanaryLogContext;
  request_id?: string;
}

/**
 * Create structured log entry
 */
export function createLogEntry(
  level: LogEntry['level'],
  message: string,
  context: CanaryLogContext,
  requestId?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    request_id: requestId,
  };
}

/**
 * Log canary request (INFO level)
 * 
 * B2a Cost Optimization: 10% sampling for successful requests ONLY
 * - 100% logging for errors (4xx/5xx status codes)
 * - 10% sampling for success (2xx/3xx status codes)
 * - Reduces log volume by ~90% while maintaining full error visibility
 */
export function logCanaryRequest(
  cohort: 'native' | 'proxy',
  reason: string,
  canaryTag: string,
  path: string,
  method: string,
  statusCode?: number,
  durationMs?: number,
  requestId?: string
): void {
  // Determine if this is an error response (4xx/5xx)
  const isError = statusCode !== undefined && statusCode >= 400;
  
  // 100% logging for errors, 10% sampling for success
  if (!isError && Math.random() >= 0.1) {
    return; // Skip 90% of success logs only
  }

  const entry = createLogEntry(
    'INFO',
    'Canary request processed',
    {
      cohort,
      decision_reason: reason,
      canary_tag: canaryTag,
      request_path: path,
      method,
      status_code: statusCode,
      duration_ms: durationMs,
    },
    requestId
  );
  
  console.log(JSON.stringify(entry));
}

/**
 * Log canary error (ERROR level)
 */
export function logCanaryError(
  cohort: 'native' | 'proxy',
  reason: string,
  canaryTag: string,
  path: string,
  error: string,
  method?: string,
  statusCode?: number,
  durationMs?: number,
  requestId?: string
): void {
  const entry = createLogEntry(
    'ERROR',
    'Canary request failed',
    {
      cohort,
      decision_reason: reason,
      canary_tag: canaryTag,
      request_path: path,
      method,
      status_code: statusCode,
      duration_ms: durationMs,
      error,
    },
    requestId
  );
  
  console.error(JSON.stringify(entry));
}

/**
 * Log R2 operation (INFO or ERROR)
 */
export function logR2Operation(
  cohort: 'native' | 'proxy',
  canaryTag: string,
  operation: 'put' | 'get' | 'list' | 'delete',
  success: boolean,
  error?: string,
  durationMs?: number,
  requestId?: string
): void {
  const level = success ? 'INFO' : 'ERROR';
  const message = success ? 'R2 operation succeeded' : 'R2 operation failed';
  
  const entry = createLogEntry(
    level,
    message,
    {
      cohort,
      decision_reason: 'r2-operation',
      canary_tag: canaryTag,
      r2_operation: operation,
      duration_ms: durationMs,
      error,
    },
    requestId
  );
  
  if (success) {
    console.log(JSON.stringify(entry));
  } else {
    console.error(JSON.stringify(entry));
  }
}

/**
 * Log upload intent tracking
 */
export function logUploadIntent(
  cohort: 'native' | 'proxy',
  canaryTag: string,
  intentId: string,
  phase: 'intent' | 'finalize' | 'orphaned',
  error?: string,
  requestId?: string
): void {
  const level = error ? 'ERROR' : 'INFO';
  const message = `Upload ${phase}`;
  
  const entry = createLogEntry(
    level,
    message,
    {
      cohort,
      decision_reason: `upload-${phase}`,
      canary_tag: canaryTag,
      upload_intent_id: intentId,
      error,
    },
    requestId
  );
  
  if (error) {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
