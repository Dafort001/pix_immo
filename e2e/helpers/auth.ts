import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'client' | 'admin';
}

export async function registerUser(page: Page, user: TestUser): Promise<void> {
  const response = await page.request.post('/api/auth/register', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
  }
}

export async function loginUser(page: Page, user: TestUser): Promise<void> {
  const response = await page.request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }
}

export async function logoutUser(page: Page): Promise<void> {
  await page.request.post('/api/auth/logout');
}

export function createTestUser(role: 'client' | 'admin', suffix: string = ''): TestUser {
  const timestamp = Date.now();
  return {
    email: `test-${role}-${timestamp}${suffix}@example.com`,
    password: 'TestPassword123!',
    role,
  };
}
