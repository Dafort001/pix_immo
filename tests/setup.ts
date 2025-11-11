/**
 * Vitest Global Setup
 * Runs before all tests
 */

import { beforeEach, afterEach } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production';
process.env.ORIGIN_API_BASE = 'http://localhost:5000';

// Global cleanup hooks
beforeEach(() => {
  // Reset global state before each test
});

afterEach(() => {
  // Clean up after each test
});
