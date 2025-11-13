/**
 * Download Authorization Errors
 * 
 * Custom error classes for download authorization failures
 * Used by Express error middleware to generate uniform 403 responses
 */

export class DownloadUnauthorizedError extends Error {
  public readonly statusCode: number = 403;
  public readonly reason: string;
  public readonly jobId?: string;
  public readonly fileId?: string;

  constructor(reason: string, jobId?: string, fileId?: string) {
    super(reason);
    this.name = "DownloadUnauthorizedError";
    this.reason = reason;
    this.jobId = jobId;
    this.fileId = fileId;

    // Maintain proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DownloadUnauthorizedError);
    }
  }
}

export class JobNotFoundError extends Error {
  public readonly statusCode: number = 404;
  public readonly jobId: string;

  constructor(jobId: string) {
    super(`Job not found: ${jobId}`);
    this.name = "JobNotFoundError";
    this.jobId = jobId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, JobNotFoundError);
    }
  }
}

export class FileNotFoundError extends Error {
  public readonly statusCode: number = 404;
  public readonly fileId: string;

  constructor(fileId: string) {
    super(`File not found: ${fileId}`);
    this.name = "FileNotFoundError";
    this.fileId = fileId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileNotFoundError);
    }
  }
}
