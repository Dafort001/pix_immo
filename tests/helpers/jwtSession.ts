/**
 * Session Cookie Helper for Integration Tests
 * Generates valid auth_session cookies for testing
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-do-not-use-in-production';
const SESSION_COOKIE_NAME = 'auth_session';

export interface SessionUser {
  userId: string;
  email: string;
  role: 'admin' | 'client';
}

/**
 * Create a valid session cookie for testing
 */
export function createSessionCookie(user: Partial<SessionUser> = {}): string {
  const sessionData: SessionUser = {
    userId: user.userId || 'test-user-123',
    email: user.email || 'test@example.com',
    role: user.role || 'client',
  };

  const token = jwt.sign(sessionData, JWT_SECRET, {
    expiresIn: '1h',
  });

  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/`;
}

/**
 * Parse session cookie to extract user data (for verification)
 */
export function parseSessionCookie(cookieHeader: string): SessionUser | null {
  const match = cookieHeader.match(/auth_session=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = jwt.verify(match[1], JWT_SECRET) as SessionUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Create device token header (alternative auth method)
 */
export function createDeviceToken(deviceId: string = 'device-test-001'): string {
  const tokenData = {
    deviceId,
    type: 'mobile_pwa',
    createdAt: new Date().toISOString(),
  };

  return jwt.sign(tokenData, JWT_SECRET, { expiresIn: '30d' });
}
