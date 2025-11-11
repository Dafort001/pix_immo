/**
 * Edit Queue Worker (HALT F4a)
 * Processes queued EditJobs asynchronously
 * Runs every 2 minutes, processes up to 10 jobs
 */

import { storage } from "./storage";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

// R2 Client Configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CF_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY || "",
    secretAccessKey: process.env.CF_R2_SECRET_KEY || "",
  },
});

const BUCKET_NAME = process.env.CF_R2_BUCKET || "";
const BATCH_SIZE = 10;
const PREVIEW_MAX_WIDTH = 1280;
const MAX_RETRIES = 3;
const STALE_JOB_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Process a single EditJob
 */
async function processEditJob(job: any): Promise<void> {
  const startTime = Date.now();
  console.log(`[WORKER] Processing EditJob ${job.id} for file ${job.fileId}`);

  try {
    // 1. Lock the file
    await storage.lockFile(job.fileId);
    
    // 2. Update job status to in_progress
    await storage.updateEditJobStatus(job.id, 'in_progress', {
      startedAt: Date.now(),
    });

    // 3. Get original file info (assume it's in raw/ folder)
    const originalFile = await storage.getUploadedFile(job.fileId);
    if (!originalFile) {
      throw new Error(`File ${job.fileId} not found`);
    }

    const originalKey = originalFile.objectKey; // e.g., "raw/abc123.jpg"
    
    // 4. Download file from R2
    const getObjectResponse = await r2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: originalKey,
      })
    );

    if (!getObjectResponse.Body) {
      throw new Error(`Failed to download file from R2: ${originalKey}`);
    }

    const fileBuffer = await streamToBuffer(getObjectResponse.Body as any);
    const fileSize = fileBuffer.length;

    // 5. Generate processed file (for now, just copy)
    const processedKey = originalKey.replace("raw/", "processed/");
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: processedKey,
        Body: fileBuffer,
        ContentType: originalFile.mimeType,
      })
    );

    // 6. Generate preview (resize to 1280px width)
    let previewBuffer: Buffer;
    if (originalFile.mimeType.startsWith("image/")) {
      try {
        previewBuffer = await sharp(fileBuffer)
          .resize(PREVIEW_MAX_WIDTH, null, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (err) {
        console.warn(`[WORKER] Sharp resize failed, using original: ${err}`);
        previewBuffer = fileBuffer;
      }
    } else {
      // Non-image files: just copy
      previewBuffer = fileBuffer;
    }

    const previewKey = originalKey.replace("raw/", "preview/").replace(/\.\w+$/, ".jpg");
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: previewKey,
        Body: previewBuffer,
        ContentType: "image/jpeg",
      })
    );

    // 7. Update job status to done
    const duration = Date.now() - startTime;
    await storage.updateEditJobStatus(job.id, 'done', {
      finishedAt: Date.now(),
      resultPath: processedKey,
      previewPath: previewKey,
      resultFileSize: fileSize,
    });

    // 8. Unlock the file
    await storage.unlockFile(job.fileId);

    // 9. Update file status to 'completed'
    await storage.updateFileStatus(job.fileId, 'completed');

    console.log(`[WORKER] ✅ Completed EditJob ${job.id} in ${duration}ms (${fileSize} bytes)`);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[WORKER] ❌ Failed EditJob ${job.id} after ${duration}ms:`, error.message);

    // Check retry count
    const currentRetries = job.retryCount || 0;
    if (currentRetries < MAX_RETRIES) {
      // Retry: reset to queued
      await storage.retryEditJob(job.id);
      console.log(`[WORKER] 🔄 Retrying EditJob ${job.id} (attempt ${currentRetries + 1}/${MAX_RETRIES})`);
    } else {
      // Max retries exceeded: mark as failed
      await storage.updateEditJobStatus(job.id, 'failed', {
        finishedAt: Date.now(),
        error: error.message,
      });
      await storage.updateFileStatus(job.fileId, 'failed');
      console.log(`[WORKER] ❌ EditJob ${job.id} failed permanently after ${MAX_RETRIES} retries`);
    }

    // Always unlock file on error
    await storage.unlockFile(job.fileId);
  }
}

/**
 * Main worker tick - runs every 2 minutes
 */
export async function processEditQueue(): Promise<void> {
  try {
    console.log(`[WORKER] Starting queue processing tick`);

    // 1. Check for stale jobs (in_progress for >15min) and requeue them
    const allInProgress = await storage.getEditJobsByStatus('in_progress', 100);
    for (const job of allInProgress) {
      if (job.startedAt && Date.now() - job.startedAt > STALE_JOB_TIMEOUT_MS) {
        console.warn(`[WORKER] Stale job detected: ${job.id}, requeueing...`);
        await storage.unlockFile(job.fileId); // Ensure unlocked
        await storage.retryEditJob(job.id);
      }
    }

    // 2. Get queued jobs (oldest first, limit 10)
    const queuedJobs = await storage.getEditJobsByStatus('queued', BATCH_SIZE);
    
    if (queuedJobs.length === 0) {
      console.log(`[WORKER] No queued jobs, idle.`);
      return;
    }

    console.log(`[WORKER] Processing ${queuedJobs.length} queued jobs`);

    // 3. Process each job sequentially (could be parallelized with Promise.all)
    for (const job of queuedJobs) {
      await processEditJob(job);
    }

    console.log(`[WORKER] Queue processing tick completed`);
  } catch (error: any) {
    console.error(`[WORKER] Queue processing error:`, error);
  }
}

/**
 * Convert Node.js Readable stream to buffer (AWS SDK compatibility)
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  // Use for-await-of for Node.js Readable streams
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Start the cron worker (call from server/index.ts)
 */
export function startEditQueueWorker(): void {
  const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
  
  console.log(`[WORKER] Starting Edit Queue Worker (interval: ${INTERVAL_MS / 1000}s)`);
  
  // Run immediately on startup
  processEditQueue().catch(err => {
    console.error(`[WORKER] Initial tick failed:`, err);
  });
  
  // Then run every 2 minutes
  setInterval(() => {
    processEditQueue().catch(err => {
      console.error(`[WORKER] Tick failed:`, err);
    });
  }, INTERVAL_MS);
}
