import { Page } from '@playwright/test';

export interface TestJob {
  id: string;
  jobNumber: string;
  userId: string;
  includedImages: number;
  allImagesIncluded: boolean;
}

export interface TestFile {
  id: string;
  orderId: string;
  originalFilename: string;
  selectionState: 'none' | 'included' | 'extra_pending' | 'extra_paid' | 'extra_free' | 'blocked';
  isCandidate: boolean;
  objectKey: string;
}

export async function createTestJob(
  page: Page,
  data: {
    propertyName: string;
    includedImages?: number;
    allImagesIncluded?: boolean;
  }
): Promise<TestJob> {
  // P1: Create job via API (requires auth)
  const response = await page.request.post('/api/jobs', {
    data: {
      propertyName: data.propertyName,
      propertyAddress: '123 Test St, Hamburg',
      serviceType: 'photography',
      includedImages: data.includedImages || 25,
      allImagesIncluded: data.allImagesIncluded || false,
    },
  });

  if (!response.ok()) {
    throw new Error(`Job creation failed: ${response.status()} ${await response.text()}`);
  }

  const job = await response.json();
  return job;
}

export async function createTestFile(
  page: Page,
  data: {
    orderId: string;
    originalFilename: string;
    selectionState?: 'none' | 'included' | 'extra_pending' | 'extra_paid' | 'extra_free' | 'blocked';
    isCandidate?: boolean;
  }
): Promise<TestFile> {
  // P1: Create uploadedFile via API (simulate upload)
  // This would normally be done via upload endpoint, but for testing we use a helper endpoint
  const response = await page.request.post('/api/test/create-file', {
    data: {
      orderId: data.orderId,
      originalFilename: data.originalFilename,
      selectionState: data.selectionState || 'none',
      isCandidate: data.isCandidate !== false,
      mimeType: 'image/jpeg',
      sizeBytes: 1024 * 100, // 100 KB
      objectKey: `test/${Date.now()}_${data.originalFilename}`,
    },
  });

  if (!response.ok()) {
    throw new Error(`File creation failed: ${response.status()} ${await response.text()}`);
  }

  const file = await response.json();
  return file;
}
