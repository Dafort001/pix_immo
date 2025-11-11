/**
 * Fetch Mock Helper for Origin API
 * Simulates Express backend responses for integration tests
 */

import uploadFixtures from '../fixtures/upload.json';

export interface MockResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
}

export interface FetchMockOptions {
  defaultResponses?: Record<string, MockResponse>;
}

/**
 * Create a fetch mock for origin API calls
 */
export function createFetchMock(options: FetchMockOptions = {}) {
  const responses = new Map<string, MockResponse>(
    Object.entries(options.defaultResponses || {})
  );

  const requestLog: Array<{
    url: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
  }> = [];

  return {
    /**
     * Mock fetch implementation
     */
    fetch: async (url: string | URL, init?: RequestInit): Promise<Response> => {
      const urlString = url.toString();
      const method = init?.method || 'GET';
      const key = `${method} ${urlString}`;

      // Log request for verification
      requestLog.push({
        url: urlString,
        method,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
        headers: init?.headers as Record<string, string>,
      });

      // Find matching mock response
      const mockResponse = responses.get(key);
      if (!mockResponse) {
        return new Response(JSON.stringify({ error: 'Not mocked' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(mockResponse.body), {
        status: mockResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...mockResponse.headers,
        },
      });
    },

    /**
     * Add mock response for specific endpoint
     */
    mockEndpoint: (method: string, url: string, response: MockResponse) => {
      responses.set(`${method} ${url}`, response);
    },

    /**
     * Get request log (for verification)
     */
    getRequests: () => requestLog,

    /**
     * Reset mock state
     */
    reset: () => {
      responses.clear();
      requestLog.length = 0;
      if (options.defaultResponses) {
        Object.entries(options.defaultResponses).forEach(([key, resp]) => {
          responses.set(key, resp);
        });
      }
    },

    /**
     * Verify that a request was made
     */
    verifyRequest: (
      method: string,
      urlPattern: string | RegExp
    ): boolean => {
      return requestLog.some((req) => {
        const methodMatch = req.method === method;
        const urlMatch =
          typeof urlPattern === 'string'
            ? req.url.includes(urlPattern)
            : urlPattern.test(req.url);
        return methodMatch && urlMatch;
      });
    },
  };
}

export type FetchMockInstance = ReturnType<typeof createFetchMock>;

/**
 * Default mock responses for upload endpoints
 */
export const defaultUploadMocks = {
  'POST http://localhost:5000/api/pixcapture/upload/intent': {
    status: 200,
    body: uploadFixtures.originResponses.intentSuccess,
  },
  'POST http://localhost:5000/api/pixcapture/upload/finalize': {
    status: 200,
    body: uploadFixtures.originResponses.finalizeSuccess,
  },
};
