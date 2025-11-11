/**
 * Worker Test Runner
 * Executes Hono worker handlers with injected mocks
 */

import type { R2MockInstance } from './r2Mock';
import type { FetchMockInstance } from './fetchMock';

// Renamed to avoid declaration merging with workers/edge.ts Env interface
export interface TestWorkerEnv {
  R2_BUCKET: any; // R2MockInstance
  ORIGIN_API_BASE: string;
  CF_R2_ACCOUNT_ID?: string;
  CF_R2_ACCESS_KEY?: string;
  CF_R2_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
  PHASE_B1B_ENABLED?: string; // "true" to enable B1b upload routes
  DATABASE_URL?: string;
  SESSION_SECRET?: string;
}

export interface WorkerTestContext {
  r2Mock: R2MockInstance;
  fetchMock: FetchMockInstance;
  env?: Partial<TestWorkerEnv>;
}

/**
 * Create a Hono worker instance with mocked bindings
 * Uses the complete Worker fetch() handler (includes route definitions)
 */
export async function createWorkerTestApp(context: WorkerTestContext) {
  // Dynamic import to avoid circular dependencies
  const workerModule = await import('../../workers/edge');
  const workerDefault = workerModule.default;

  // Create mock environment
  const mockEnv: TestWorkerEnv = {
    R2_BUCKET: context.r2Mock,
    ORIGIN_API_BASE: process.env.ORIGIN_API_BASE || 'http://localhost:5000',
    ALLOWED_ORIGINS: '*',
    ...context.env,
  };

  // Override global fetch with mock
  const originalFetch = global.fetch;
  global.fetch = context.fetchMock.fetch as any;

  return {
    /**
     * Execute a request against the worker
     * Calls the complete worker fetch() handler with routes
     */
    request: async (path: string, init?: RequestInit): Promise<Response> => {
      // Override fetch again for request execution
      global.fetch = context.fetchMock.fetch as any;

      try {
        const request = new Request(`http://localhost${path}`, init);
        
        // Execute request through worker's fetch() handler (includes routes)
        const response = await workerDefault.fetch(request, mockEnv as any, {} as any);
        
        return response;
      } finally {
        // Restore global fetch
        global.fetch = originalFetch;
      }
    },
    /**
     * Cleanup resources
     */
    cleanup: () => {
      global.fetch = originalFetch;
    },
  };
}

/**
 * Execute a single worker request (simplified helper)
 */
export async function executeWorkerRequest(
  path: string,
  options: RequestInit,
  context: WorkerTestContext
): Promise<Response> {
  const testApp = await createWorkerTestApp(context);
  try {
    return await testApp.request(path, options);
  } finally {
    testApp.cleanup();
  }
}
