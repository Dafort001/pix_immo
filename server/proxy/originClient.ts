/**
 * HALT B1 - Origin Proxy Client
 * HTTP client for proxying requests to the alt-backend (Express)
 */

export interface ProxyRequest {
  method: string;
  path: string;
  headers: Headers;
  body?: string | ArrayBuffer;
  startTime?: number; // Timestamp for latency calculation
}

export interface ProxyResponse {
  status: number;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
}

/**
 * Headers to forward from client to origin
 */
const FORWARD_HEADERS = [
  'authorization',
  'cookie',
  'x-device-token',
  'content-type',
  'x-requested-with',
  'content-md5',
  'user-agent',
  'accept',
  'accept-encoding',
  'accept-language',
] as const;

/**
 * Header prefixes to forward (for wildcards like x-amz-*)
 */
const FORWARD_HEADER_PREFIXES = ['x-amz-'] as const;

/**
 * Headers to forward from origin back to client
 */
const RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'cache-control',
  'etag',
  'last-modified',
  'set-cookie',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
] as const;

/**
 * Proxy request to origin backend
 * Preserves auth cookies, headers, and error responses
 */
export async function proxyToOrigin(
  request: ProxyRequest,
  originBaseUrl: string,
  options: {
    timeout?: number;
    logContext?: {
      reqId: string;
      route: string;
    };
  } = {}
): Promise<ProxyResponse> {
  const { timeout = 30000, logContext } = options;
  const url = `${originBaseUrl}${request.path}`;

  // Build headers to forward
  const forwardHeaders: Record<string, string> = {};
  
  // Forward explicit headers
  FORWARD_HEADERS.forEach((header) => {
    const value = request.headers.get(header);
    if (value) {
      forwardHeaders[header] = value;
    }
  });

  // Forward wildcard headers (e.g., x-amz-*)
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (FORWARD_HEADER_PREFIXES.some(prefix => lowerKey.startsWith(prefix))) {
      forwardHeaders[key] = value;
    }
  });

  // Add X-Forwarded headers for traceability
  forwardHeaders['x-forwarded-for'] = request.headers.get('cf-connecting-ip') || 'unknown';
  forwardHeaders['x-forwarded-proto'] = 'https';
  forwardHeaders['x-forwarded-host'] = request.headers.get('host') || 'unknown';

  // Log proxy request
  if (logContext) {
    console.log(JSON.stringify({
      type: 'proxy_request',
      req_id: logContext.reqId,
      route: logContext.route,
      method: request.method,
      origin_url: url,
      timestamp: new Date().toISOString(),
    }));
  }

  try {
    // Make request to origin with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: request.method,
      headers: forwardHeaders,
      body: request.body,
      signal: controller.signal,
      // Preserve credentials/cookies
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    // Build response headers to forward
    const responseHeaders = new Headers();
    RESPONSE_HEADERS.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    });

    // Log proxy response
    if (logContext) {
      const latency = request.startTime ? Date.now() - request.startTime : 0;
      console.log(JSON.stringify({
        type: 'proxy_response',
        req_id: logContext.reqId,
        route: logContext.route,
        status: response.status,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      }));
    }

    return {
      status: response.status,
      headers: responseHeaders,
      body: response.body,
    };
  } catch (error) {
    // Log proxy error
    if (logContext) {
      console.error(JSON.stringify({
        type: 'proxy_error',
        req_id: logContext.reqId,
        route: logContext.route,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }));
    }

    // Return 502 Bad Gateway on proxy failure
    // Don't leak stack traces to client
    return {
      status: 502,
      headers: new Headers({ 'content-type': 'application/json' }),
      body: new ReadableStream({
        start(controller) {
          const message = JSON.stringify({
            error: 'Bad Gateway',
            message: 'Failed to reach backend service',
          });
          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      }),
    };
  }
}

/**
 * Check if origin is healthy (for monitoring)
 */
export async function checkOriginHealth(originBaseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${originBaseUrl}/healthz`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Forward upload intent to origin (creates uploadedFile record)
 * Returns signed URL + file metadata from origin
 */
export async function forwardUploadIntent(
  originBaseUrl: string,
  objectKey: string,
  filename: string,
  mimeType: string, // Match shared schema field name
  fileSize: number,
  headers: Headers, // Must contain auth cookie
  reqId?: string
): Promise<{ signedUrl: string; fileId: string; expiresAt: string }> {
  const body = JSON.stringify({
    objectKey,
    filename,
    mimeType, // Use mimeType to match uploadIntentSchema
    fileSize,
  });

  const response = await proxyToOrigin(
    {
      method: 'POST',
      path: '/api/pixcapture/upload/intent',
      headers,
      body,
    },
    originBaseUrl,
    {
      logContext: reqId ? { reqId, route: 'upload-intent' } : undefined,
    }
  );

  if (response.status !== 200) {
    throw new Error(`Origin intent failed with status ${response.status}`);
  }

  const text = await streamToText(response.body);
  return JSON.parse(text);
}

/**
 * Forward upload finalize to origin (finalizes uploadedFile record)
 * Returns finalized file metadata from origin
 */
export async function forwardUploadFinalize(
  originBaseUrl: string,
  objectKey: string,
  checksum: string,
  exifMeta: Record<string, any> | undefined,
  headers: Headers, // Must contain auth cookie
  reqId?: string
): Promise<{ fileId: string; url: string; status: string }> {
  const body = JSON.stringify({
    objectKey,
    checksum,
    exifMeta,
  });

  const response = await proxyToOrigin(
    {
      method: 'POST',
      path: '/api/pixcapture/upload/finalize',
      headers,
      body,
    },
    originBaseUrl,
    {
      logContext: reqId ? { reqId, route: 'upload-finalize' } : undefined,
    }
  );

  if (response.status !== 200) {
    throw new Error(`Origin finalize failed with status ${response.status}`);
  }

  const text = await streamToText(response.body);
  return JSON.parse(text);
}

/**
 * Helper: Convert ReadableStream to text
 */
async function streamToText(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!stream) return '';
  
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    result += decoder.decode(); // Flush
    return result;
  } finally {
    reader.releaseLock();
  }
}
