import { Job, UploadedFile, Image } from "@shared/schema";
import { DownloadUnauthorizedError, JobNotFoundError, FileNotFoundError } from "./download-errors";

/**
 * Download Authorization Module
 * 
 * Security Requirement #1: Serverseitige Download-Prüfung
 * 
 * Ensures:
 * - Users can only download images from jobs they own
 * - Only approved images can be downloaded (selection_state check)
 * - 403 errors for unauthorized access (no silent fails)
 * 
 * Dual-System Architecture:
 * - Orders system (uploadedFiles): selection_state check required
 * - DIY system (images): QC approval check required (TODO: implement qcStatus gate)
 * 
 * Admin Policy:
 * - Admins bypass job ownership checks
 * - Admins MUST respect selection_state unless allImagesIncluded
 *   (prevents accidental leak of upsell-only assets)
 */

export interface AuthContext {
  userId: string;
  role: string; // 'client' | 'admin'
}

export interface JobAuthResult {
  authorized: boolean;
  reason?: string; // Error message if not authorized
}

export interface ImageAuthResult {
  authorized: boolean;
  reason?: string; // Error message if not authorized
}

/**
 * Check if user can access a job
 * 
 * Rules:
 * - User must own the job (job.userId === user.id)
 * - Admins can access all jobs
 * 
 * @returns Authorization result with reason if denied
 */
export function canUserAccessJob(
  job: Job,
  authContext: AuthContext
): JobAuthResult {
  // Admin override: admins can access all jobs
  if (authContext.role === "admin") {
    return { authorized: true };
  }

  // Job ownership check
  if (job.userId !== authContext.userId) {
    return {
      authorized: false,
      reason: "You do not have permission to access this job",
    };
  }

  return { authorized: true };
}

/**
 * Check if a file (uploadedFiles) can be downloaded
 * 
 * Rules (from security doc):
 * - selection_state ∈ { 'included', 'extra_paid', 'extra_free' } OR
 * - job.allImagesIncluded === true
 * 
 * Blocked states: 'none', 'blocked', 'extra_pending'
 * 
 * @returns Authorization result with reason if denied
 */
export function canUserDownloadFile(
  file: UploadedFile,
  job: Job
): ImageAuthResult {
  // Kulanz override: if all images included, allow all
  if (job.allImagesIncluded) {
    return { authorized: true };
  }

  // Check selection state
  const allowedStates = ['included', 'extra_paid', 'extra_free'];
  
  if (!file.selectionState || !allowedStates.includes(file.selectionState)) {
    return {
      authorized: false,
      reason: `Image not approved for download (status: ${file.selectionState || 'none'})`,
    };
  }

  return { authorized: true };
}

/**
 * Check if an image (images table - DIY system) can be downloaded
 * 
 * Note: Images table doesn't have selection_state.
 * For DIY captures, we check job.allImagesIncluded or other criteria.
 * 
 * Current policy: All images from DIY jobs are downloadable (future: add QC status check)
 */
export function canUserDownloadImage(
  image: Image,
  job: Job
): ImageAuthResult {
  // For now: all images from owned jobs are downloadable
  // Future: Add QC status check (qcStatus === 'approved')
  
  if (job.allImagesIncluded) {
    return { authorized: true };
  }

  // Future enhancement: check image.qcStatus
  // if (image.qcStatus !== 'approved') {
  //   return { authorized: false, reason: 'Image not approved by QC' };
  // }

  return { authorized: true };
}

/**
 * Filter files to only include downloadable ones
 * 
 * Used for ZIP generation and gallery display
 * 
 * @returns Only files that pass authorization
 */
export function filterDownloadableFiles(
  files: UploadedFile[],
  job: Job
): UploadedFile[] {
  return files.filter(file => canUserDownloadFile(file, job).authorized);
}

/**
 * Filter images to only include downloadable ones
 * 
 * Used for DIY system galleries
 */
export function filterDownloadableImages(
  images: Image[],
  job: Job
): Image[] {
  return images.filter(image => canUserDownloadImage(image, job).authorized);
}

/**
 * Assert utilities for download authorization
 * 
 * These throw DownloadUnauthorizedError for Express error middleware
 * to generate uniform 403 JSON responses
 */

/**
 * Assert user can access job, throw if not
 * 
 * @throws DownloadUnauthorizedError if access denied
 * @throws JobNotFoundError if job is null
 */
export function assertJobAccessOrThrow(
  job: Job | null,
  authContext: AuthContext,
  jobId: string
): asserts job is Job {
  if (!job) {
    throw new JobNotFoundError(jobId);
  }

  const result = canUserAccessJob(job, authContext);
  if (!result.authorized) {
    throw new DownloadUnauthorizedError(
      result.reason || "Job access denied",
      jobId
    );
  }
}

/**
 * Assert file can be downloaded, throw if not
 * 
 * @throws DownloadUnauthorizedError if download not allowed
 * @throws FileNotFoundError if file is null
 */
export function assertFileDownloadableOrThrow(
  file: UploadedFile | null,
  job: Job,
  fileId: string
): asserts file is UploadedFile {
  if (!file) {
    throw new FileNotFoundError(fileId);
  }

  const result = canUserDownloadFile(file, job);
  if (!result.authorized) {
    throw new DownloadUnauthorizedError(
      result.reason || "File download not authorized",
      job.id,
      fileId
    );
  }
}

/**
 * Assert image can be downloaded, throw if not
 * 
 * @throws DownloadUnauthorizedError if download not allowed
 * @throws FileNotFoundError if image is null
 */
export function assertImageDownloadableOrThrow(
  image: Image | null,
  job: Job,
  imageId: string
): asserts image is Image {
  if (!image) {
    throw new FileNotFoundError(imageId);
  }

  const result = canUserDownloadImage(image, job);
  if (!result.authorized) {
    throw new DownloadUnauthorizedError(
      result.reason || "Image download not authorized",
      job.id,
      imageId
    );
  }
}
