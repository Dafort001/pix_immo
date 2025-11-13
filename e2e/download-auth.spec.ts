import { test, expect } from '@playwright/test';
import { createTestUser, registerUser, loginUser, logoutUser } from './helpers/auth';
import { createTestJob, createTestFile } from './helpers/fixtures';

test.describe('Download Authorization (P0 Security)', () => {
  test('Scenario 1: Client can download own selected images', async ({ page }) => {
    // Setup: Create client user
    const client = createTestUser('client', '-scenario1');
    await registerUser(page, client);
    await loginUser(page, client);

    // Create job
    const job = await createTestJob(page, {
      propertyName: 'Test Property 1',
      includedImages: 25,
    });

    // Create file with selectionState = 'included'
    const file = await createTestFile(page, {
      orderId: job.id,
      originalFilename: 'test_image_001.jpg',
      selectionState: 'included',
      isCandidate: true,
    });

    // Attempt download
    const response = await page.request.get(`/api/files/${file.id}/download`);
    
    // Expect 200 OK with presigned URL
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.url).toBeTruthy();
    expect(data.filename).toBe('test_image_001.jpg');
    expect(data.expiresAt).toBeGreaterThan(Date.now());
  });

  test('Scenario 2: Client cannot download other client\'s images', async ({ page, context }) => {
    // Setup: Create two client users
    const client1 = createTestUser('client', '-scenario2-owner');
    const client2 = createTestUser('client', '-scenario2-attacker');

    await registerUser(page, client1);
    await loginUser(page, client1);

    // Client 1 creates job + file
    const job = await createTestJob(page, {
      propertyName: 'Test Property 2',
      includedImages: 25,
    });

    const file = await createTestFile(page, {
      orderId: job.id,
      originalFilename: 'client1_image.jpg',
      selectionState: 'included',
      isCandidate: true,
    });

    // Client 1 logs out
    await logoutUser(page);

    // Client 2 registers + logs in
    await registerUser(page, client2);
    await loginUser(page, client2);

    // Client 2 attempts to download Client 1's file
    const response = await page.request.get(`/api/files/${file.id}/download`);

    // Expect 403 Forbidden
    expect(response.status()).toBe(403);
    const error = await response.json();
    expect(error.error).toContain('Unauthorized');
  });

  test('Scenario 3: Admin can download any images (bypass)', async ({ page }) => {
    // Setup: Create client user with job
    const client = createTestUser('client', '-scenario3-client');
    await registerUser(page, client);
    await loginUser(page, client);

    const job = await createTestJob(page, {
      propertyName: 'Test Property 3',
      includedImages: 25,
    });

    const file = await createTestFile(page, {
      orderId: job.id,
      originalFilename: 'admin_bypass_test.jpg',
      selectionState: 'included',
      isCandidate: true,
    });

    // Client logs out
    await logoutUser(page);

    // Admin logs in
    const admin = createTestUser('admin', '-scenario3');
    await registerUser(page, admin);

    // Manually promote to admin role (requires DB update or test helper)
    // P1: For testing, we need a /api/test/promote-admin endpoint
    await page.request.post('/api/test/promote-admin', {
      data: { email: admin.email },
    });

    await loginUser(page, admin);

    // Admin attempts download (should bypass ownership check)
    const response = await page.request.get(`/api/files/${file.id}/download`);

    // Expect 200 OK
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.url).toBeTruthy();
  });

  test('Scenario 4: Client cannot download unselected images', async ({ page }) => {
    // Setup: Create client user
    const client = createTestUser('client', '-scenario4');
    await registerUser(page, client);
    await loginUser(page, client);

    // Create job
    const job = await createTestJob(page, {
      propertyName: 'Test Property 4',
      includedImages: 25,
    });

    // Create file with selectionState = 'none' (not selected)
    const file = await createTestFile(page, {
      orderId: job.id,
      originalFilename: 'unselected_image.jpg',
      selectionState: 'none',
      isCandidate: true,
    });

    // Attempt download
    const response = await page.request.get(`/api/files/${file.id}/download`);

    // Expect 403 Forbidden
    expect(response.status()).toBe(403);
    const error = await response.json();
    expect(error.error).toContain('Unauthorized');
  });

  test('Scenario 5: Client can download extra_free (kulanz) images', async ({ page }) => {
    // Setup: Create client user
    const client = createTestUser('client', '-scenario5');
    await registerUser(page, client);
    await loginUser(page, client);

    // Create job
    const job = await createTestJob(page, {
      propertyName: 'Test Property 5',
      includedImages: 25,
    });

    // Create file with selectionState = 'extra_free' (admin kulanz)
    const file = await createTestFile(page, {
      orderId: job.id,
      originalFilename: 'kulanz_image.jpg',
      selectionState: 'extra_free',
      isCandidate: true,
    });

    // Attempt download
    const response = await page.request.get(`/api/files/${file.id}/download`);

    // Expect 200 OK
    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data.url).toBeTruthy();
  });
});
