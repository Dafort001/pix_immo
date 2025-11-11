/**
 * HALT B1 Upload Integration Tests
 * Validates parity between Canary (native handlers) and Proxy (origin delegation)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createR2Mock, R2MockInstance } from '../helpers/r2Mock';
import { createFetchMock, FetchMockInstance, defaultUploadMocks } from '../helpers/fetchMock';
import { createSessionCookie, createDeviceToken } from '../helpers/jwtSession';
import { executeWorkerRequest } from '../helpers/workerTestRunner';
import uploadFixtures from '../fixtures/upload.json';

// Mock implementations will be injected into workers
let r2Mock: R2MockInstance;
let fetchMock: FetchMockInstance;

describe('B1 Upload Routes - Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    r2Mock = createR2Mock();
    fetchMock = createFetchMock({ defaultResponses: defaultUploadMocks });
  });

  afterEach(() => {
    // Clean up after each test
    r2Mock.reset();
    fetchMock.reset();
  });

  describe('1. intent_canary_ok - Native handler validates and forwards', () => {
    it('should return signed URL with valid schema when X-Canary: 1', async () => {
      const sessionCookie = createSessionCookie({ userId: 'user-123', role: 'client' });
      const payload = uploadFixtures.validIntent;

      // Mock origin response for intent
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/intent',
        {
          status: 200,
          body: uploadFixtures.originResponses.intentSuccess,
        }
      );

      // Execute worker request with mocks
      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Validate response
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Check required fields
      expect(data).toHaveProperty('signedUrl');
      expect(data).toHaveProperty('fileId');
      expect(data).toHaveProperty('expiresAt');
      
      // Validate types
      expect(typeof data.signedUrl).toBe('string');
      expect(typeof data.fileId).toBe('string');
      expect(data.signedUrl).toMatch(/^https?:\/\//); // Valid URL
      
      // Verify origin was called (proxy delegation)
      expect(fetchMock.verifyRequest('POST', '/api/pixcapture/upload/intent')).toBe(true);
    });
  });

  describe('2. intent_proxy_fallback - Without canary proxies to origin', () => {
    it('should proxy to origin when X-Canary header is missing', async () => {
      const sessionCookie = createSessionCookie({ userId: 'user-456' });
      const payload = uploadFixtures.validIntent;

      // Mock origin response
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/intent',
        {
          status: 200,
          body: uploadFixtures.originResponses.intentSuccess,
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            // NO X-Canary header
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Should still succeed via proxy
      expect(response.status).toBe(200);
      
      // Verify origin was called
      expect(fetchMock.verifyRequest('POST', '/api/pixcapture/upload/intent')).toBe(true);
      
      // Response schema should match origin
      const data = await response.json();
      expect(data).toEqual(uploadFixtures.originResponses.intentSuccess);
    });
  });

  describe('3. finalize_canary_not_found - R2 HEAD returns 404', () => {
    it('should return 409 when object not found in R2', async () => {
      const sessionCookie = createSessionCookie({ userId: 'user-789' });
      const payload = uploadFixtures.validFinalize;

      // R2 mock returns null (object not found)
      // Default r2Mock has no objects

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/finalize',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Should return conflict error
      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toMatch(/not found|verification failed/i);
      
      // Origin should NOT be called (early return on R2 check)
      expect(fetchMock.verifyRequest('POST', '/api/pixcapture/upload/finalize')).toBe(false);
    });
  });

  describe('4. finalize_canary_ok - R2 HEAD passes, origin finalizes', () => {
    it('should finalize upload when R2 object exists', async () => {
      const sessionCookie = createSessionCookie({ userId: 'user-101' });
      const payload = uploadFixtures.validFinalize;

      // Add object to R2 mock
      r2Mock.addObject(payload.objectKey);

      // Mock origin finalize response
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/finalize',
        {
          status: 200,
          body: uploadFixtures.originResponses.finalizeSuccess,
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/finalize',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Should succeed
      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Validate response fields
      expect(data).toHaveProperty('fileId');
      expect(data).toHaveProperty('status');
      expect(data.status).toBe('uploaded');
      
      // Verify origin was called
      expect(fetchMock.verifyRequest('POST', '/api/pixcapture/upload/finalize')).toBe(true);
    });
  });

  describe('5. auth_required - Rejects unauthenticated requests', () => {
    it('should return 401/403 for intent without auth', async () => {
      const payload = uploadFixtures.validIntent;

      // Mock origin auth rejection
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/intent',
        {
          status: 401,
          body: { error: 'Unauthorized' },
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            // NO Cookie or Device-Token
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Should reject
      expect([401, 403]).toContain(response.status);
    });

    it('should return 401/403 for finalize without auth', async () => {
      const payload = uploadFixtures.validFinalize;
      r2Mock.addObject(payload.objectKey);

      // Mock origin auth rejection
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/finalize',
        {
          status: 401,
          body: { error: 'Unauthorized' },
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/finalize',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('6. device_token_flow - X-Device-Token auth alternative', () => {
    it('should accept X-Device-Token for intent', async () => {
      const deviceToken = createDeviceToken('device-mobile-001');
      const payload = uploadFixtures.validIntent;

      // Mock origin accepts device token
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/intent',
        {
          status: 200,
          body: uploadFixtures.originResponses.intentSuccess,
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'X-Device-Token': deviceToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('signedUrl');
    });

    it('should accept X-Device-Token for finalize', async () => {
      const deviceToken = createDeviceToken('device-mobile-002');
      const payload = uploadFixtures.validFinalize;
      r2Mock.addObject(payload.objectKey);

      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/finalize',
        {
          status: 200,
          body: uploadFixtures.originResponses.finalizeSuccess,
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/finalize',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'X-Device-Token': deviceToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect(response.status).toBe(200);
    });
  });

  describe('7. parity_headers - Response headers match', () => {
    it('should return consistent headers for canary vs proxy', async () => {
      const sessionCookie = createSessionCookie();
      const payload = uploadFixtures.validIntent;

      // Test with Canary
      const canaryResponse = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Test without Canary (proxy)
      const proxyResponse = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      // Both should have same status
      expect(canaryResponse.status).toBe(proxyResponse.status);
      
      // Both should have Content-Type: application/json
      expect(canaryResponse.headers.get('Content-Type')).toMatch(/application\/json/);
      expect(proxyResponse.headers.get('Content-Type')).toMatch(/application\/json/);
      
      // No sensitive headers should leak
      expect(canaryResponse.headers.has('X-Database-Password')).toBe(false);
      expect(canaryResponse.headers.has('X-Internal-Token')).toBe(false);
    });
  });

  describe('8. rate_limit_optional - 429 handling (if implemented)', () => {
    it('should return 429 with Retry-After header when rate limited', async () => {
      const sessionCookie = createSessionCookie();
      const payload = uploadFixtures.validIntent;

      // Mock rate limit response from origin
      fetchMock.mockEndpoint(
        'POST',
        'http://localhost:5000/api/pixcapture/upload/intent',
        {
          status: 429,
          body: { error: 'Too many requests' },
          headers: { 'Retry-After': '60' },
        }
      );

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect(response.status).toBe(429);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      
      // Optional: Check for Retry-After header
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) {
        expect(parseInt(retryAfter)).toBeGreaterThan(0);
      }
    });
  });

  describe('Negative Cases - Input Validation', () => {
    it('should return 400 for invalid MIME type', async () => {
      const sessionCookie = createSessionCookie();
      const payload = uploadFixtures.invalidIntent;

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for missing required fields', async () => {
      const sessionCookie = createSessionCookie();
      const payload = { filename: 'test.jpg' }; // Missing mimeType, fileSize

      const response = await executeWorkerRequest(
        '/api/pixcapture/upload/intent',
        {
          method: 'POST',
          headers: {
            'X-Canary': '1',
            'Cookie': sessionCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        { r2Mock, fetchMock, env: { PHASE_B1B_ENABLED: 'true' } }
      );

      expect(response.status).toBe(400);
    });
  });
});

// Helper function to replace all simulateWorkerRequest calls
// Note: All test cases should use executeWorkerRequest from workerTestRunner
