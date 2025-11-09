/**
 * Upload Error Tracking & Retry System
 * 
 * Features:
 * - Error Protocol für jeden Upload
 * - Automatisches Nachfordern fehlgeschlagener Dateien
 * - Stack-Level Cancellation (nicht File-Level)
 * - Retry-Queue Management
 * - Error Analytics & Reporting
 */

export interface UploadError {
  errorId: string;
  fileId: string;
  fileName: string;
  stackId: string;
  errorType: 'network' | 'checksum' | 'timeout' | 'server' | 'quota' | 'unknown';
  errorMessage: string;
  timestamp: string;
  attemptNumber: number;
  canRetry: boolean;
}

export interface StackUploadStatus {
  stackId: string;
  stackName: string;
  totalFiles: number;
  uploadedFiles: number;
  failedFiles: number;
  status: 'pending' | 'uploading' | 'completed' | 'partial' | 'failed' | 'cancelled';
  errors: UploadError[];
  retryCount: number;
  lastAttempt: string;
}

export interface UploadProtocol {
  uploadId: string;
  sessionId: string;
  photographerId: string;
  startTime: string;
  endTime?: string;
  status: 'in_progress' | 'completed' | 'failed' | 'partial' | 'cancelled';
  
  // Stack-level tracking
  stacks: StackUploadStatus[];
  
  // Summary
  totalStacks: number;
  completedStacks: number;
  failedStacks: number;
  cancelledStacks: number;
  
  totalFiles: number;
  uploadedFiles: number;
  failedFiles: number;
  
  totalSize: number;
  uploadedSize: number;
  
  // Errors
  errors: UploadError[];
  
  // Metadata
  networkType: 'wifi' | 'cellular';
  deviceType: 'pro' | 'standard';
  appVersion: string;
}

export interface RetryQueueItem {
  stackId: string;
  fileId: string;
  fileName: string;
  file: File;
  attemptNumber: number;
  lastError?: UploadError;
  priority: 'high' | 'normal' | 'low';
}

/**
 * Upload Error Tracker
 */
export class UploadErrorTracker {
  private protocol: UploadProtocol;
  private retryQueue: RetryQueueItem[] = [];
  private maxRetries: number = 3;
  private retryDelay: number = 2000; // 2s base delay
  
  constructor(
    uploadId: string,
    sessionId: string,
    photographerId: string,
    stacks: any[],
    networkType: 'wifi' | 'cellular',
    deviceType: 'pro' | 'standard'
  ) {
    this.protocol = {
      uploadId,
      sessionId,
      photographerId,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      
      stacks: stacks.map(stack => ({
        stackId: stack.stackId,
        stackName: stack.room,
        totalFiles: stack.shots.length,
        uploadedFiles: 0,
        failedFiles: 0,
        status: 'pending',
        errors: [],
        retryCount: 0,
        lastAttempt: new Date().toISOString(),
      })),
      
      totalStacks: stacks.length,
      completedStacks: 0,
      failedStacks: 0,
      cancelledStacks: 0,
      
      totalFiles: stacks.reduce((acc, s) => acc + s.shots.length, 0),
      uploadedFiles: 0,
      failedFiles: 0,
      
      totalSize: stacks.reduce((acc, s) => 
        acc + s.shots.reduce((a: number, shot: any) => a + (shot.file?.size || 0), 0), 0
      ),
      uploadedSize: 0,
      
      errors: [],
      
      networkType,
      deviceType,
      appVersion: '1.0.0',
    };
  }
  
  /**
   * Get current protocol
   */
  getProtocol(): UploadProtocol {
    return this.protocol;
  }
  
  /**
   * Record successful file upload
   */
  recordSuccess(stackId: string, fileId: string, fileSize: number): void {
    const stack = this.protocol.stacks.find(s => s.stackId === stackId);
    if (stack) {
      stack.uploadedFiles++;
      stack.lastAttempt = new Date().toISOString();
      
      // Check if stack is complete
      if (stack.uploadedFiles === stack.totalFiles) {
        stack.status = 'completed';
        this.protocol.completedStacks++;
      } else if (stack.uploadedFiles > 0) {
        stack.status = 'uploading';
      }
    }
    
    this.protocol.uploadedFiles++;
    this.protocol.uploadedSize += fileSize;
    
    // Remove from retry queue if present
    this.retryQueue = this.retryQueue.filter(
      item => !(item.stackId === stackId && item.fileId === fileId)
    );
  }
  
  /**
   * Record upload error
   */
  recordError(
    stackId: string,
    fileId: string,
    fileName: string,
    errorType: UploadError['errorType'],
    errorMessage: string,
    attemptNumber: number,
    file?: File
  ): UploadError {
    const error: UploadError = {
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileId,
      fileName,
      stackId,
      errorType,
      errorMessage,
      timestamp: new Date().toISOString(),
      attemptNumber,
      canRetry: attemptNumber < this.maxRetries && errorType !== 'quota',
    };
    
    // Add to protocol
    this.protocol.errors.push(error);
    
    // Add to stack errors
    const stack = this.protocol.stacks.find(s => s.stackId === stackId);
    if (stack) {
      stack.errors.push(error);
      stack.failedFiles++;
      stack.lastAttempt = new Date().toISOString();
      
      // Update stack status
      if (stack.failedFiles === stack.totalFiles) {
        stack.status = 'failed';
        this.protocol.failedStacks++;
      } else if (stack.uploadedFiles > 0 || stack.failedFiles > 0) {
        stack.status = 'partial';
      }
    }
    
    this.protocol.failedFiles++;
    
    // Add to retry queue if retryable
    if (error.canRetry && file) {
      this.addToRetryQueue({
        stackId,
        fileId,
        fileName,
        file,
        attemptNumber: attemptNumber + 1,
        lastError: error,
        priority: errorType === 'network' ? 'high' : 'normal',
      });
    }
    
    return error;
  }
  
  /**
   * Add item to retry queue
   */
  private addToRetryQueue(item: RetryQueueItem): void {
    // Remove existing entry if present
    this.retryQueue = this.retryQueue.filter(
      existing => !(existing.stackId === item.stackId && existing.fileId === item.fileId)
    );
    
    // Add new entry
    this.retryQueue.push(item);
    
    // Sort by priority (high first)
    this.retryQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  /**
   * Get retry queue
   */
  getRetryQueue(): RetryQueueItem[] {
    return [...this.retryQueue];
  }
  
  /**
   * Get retry queue for specific stack
   */
  getStackRetryQueue(stackId: string): RetryQueueItem[] {
    return this.retryQueue.filter(item => item.stackId === stackId);
  }
  
  /**
   * Get stacks that need retry
   */
  getStacksNeedingRetry(): StackUploadStatus[] {
    return this.protocol.stacks.filter(
      stack => stack.status === 'partial' && stack.errors.some(e => e.canRetry)
    );
  }
  
  /**
   * Cancel entire stack (not individual files)
   */
  cancelStack(stackId: string): void {
    const stack = this.protocol.stacks.find(s => s.stackId === stackId);
    if (stack) {
      stack.status = 'cancelled';
      this.protocol.cancelledStacks++;
      
      // Remove all files of this stack from retry queue
      this.retryQueue = this.retryQueue.filter(item => item.stackId !== stackId);
      
      // Mark stack errors as non-retryable
      stack.errors.forEach(error => {
        error.canRetry = false;
      });
    }
  }
  
  /**
   * Retry failed files of a stack
   */
  async retryStack(
    stackId: string,
    uploadFunction: (item: RetryQueueItem) => Promise<boolean>,
    onProgress?: (current: number, total: number, item: RetryQueueItem) => void
  ): Promise<{ success: boolean; uploaded: number; failed: number }> {
    const stackQueue = this.getStackRetryQueue(stackId);
    
    if (stackQueue.length === 0) {
      return { success: true, uploaded: 0, failed: 0 };
    }
    
    const stack = this.protocol.stacks.find(s => s.stackId === stackId);
    if (stack) {
      stack.retryCount++;
      stack.lastAttempt = new Date().toISOString();
    }
    
    let uploaded = 0;
    let failed = 0;
    
    for (let i = 0; i < stackQueue.length; i++) {
      const item = stackQueue[i];
      
      if (onProgress) {
        onProgress(i + 1, stackQueue.length, item);
      }
      
      // Exponential backoff delay
      if (item.attemptNumber > 1) {
        const delay = this.retryDelay * Math.pow(2, item.attemptNumber - 2);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      try {
        const success = await uploadFunction(item);
        
        if (success) {
          this.recordSuccess(stackId, item.fileId, item.file.size);
          uploaded++;
        } else {
          this.recordError(
            stackId,
            item.fileId,
            item.fileName,
            'unknown',
            'Retry upload failed',
            item.attemptNumber,
            item.file
          );
          failed++;
        }
      } catch (error) {
        this.recordError(
          stackId,
          item.fileId,
          item.fileName,
          'network',
          (error as Error).message,
          item.attemptNumber,
          item.file
        );
        failed++;
      }
    }
    
    // Update stack status
    if (stack) {
      if (stack.uploadedFiles === stack.totalFiles) {
        stack.status = 'completed';
        this.protocol.completedStacks++;
      } else if (stack.failedFiles === stack.totalFiles) {
        stack.status = 'failed';
        this.protocol.failedStacks++;
      } else {
        stack.status = 'partial';
      }
    }
    
    return {
      success: failed === 0,
      uploaded,
      failed,
    };
  }
  
  /**
   * Complete upload protocol
   */
  complete(): void {
    this.protocol.endTime = new Date().toISOString();
    
    if (this.protocol.cancelledStacks === this.protocol.totalStacks) {
      this.protocol.status = 'cancelled';
    } else if (this.protocol.completedStacks === this.protocol.totalStacks) {
      this.protocol.status = 'completed';
    } else if (this.protocol.failedStacks === this.protocol.totalStacks) {
      this.protocol.status = 'failed';
    } else {
      this.protocol.status = 'partial';
    }
  }
  
  /**
   * Generate error report
   */
  generateErrorReport(): string {
    const { protocol } = this;
    
    let report = '═══════════════════════════════════════════════════\n';
    report += '           UPLOAD ERROR PROTOCOL\n';
    report += '═══════════════════════════════════════════════════\n\n';
    
    report += `Upload ID:     ${protocol.uploadId}\n`;
    report += `Session ID:    ${protocol.sessionId}\n`;
    report += `Status:        ${protocol.status.toUpperCase()}\n`;
    report += `Started:       ${new Date(protocol.startTime).toLocaleString('de-DE')}\n`;
    if (protocol.endTime) {
      report += `Ended:         ${new Date(protocol.endTime).toLocaleString('de-DE')}\n`;
      const duration = new Date(protocol.endTime).getTime() - new Date(protocol.startTime).getTime();
      report += `Duration:      ${Math.round(duration / 1000)}s\n`;
    }
    report += `Network:       ${protocol.networkType.toUpperCase()}\n`;
    report += `Device:        ${protocol.deviceType.toUpperCase()}\n\n`;
    
    report += '───────────────────────────────────────────────────\n';
    report += '                    SUMMARY\n';
    report += '───────────────────────────────────────────────────\n\n';
    
    report += `Stacks:\n`;
    report += `  Total:       ${protocol.totalStacks}\n`;
    report += `  Completed:   ${protocol.completedStacks}\n`;
    report += `  Failed:      ${protocol.failedStacks}\n`;
    report += `  Cancelled:   ${protocol.cancelledStacks}\n`;
    report += `  Partial:     ${protocol.stacks.filter(s => s.status === 'partial').length}\n\n`;
    
    report += `Files:\n`;
    report += `  Total:       ${protocol.totalFiles}\n`;
    report += `  Uploaded:    ${protocol.uploadedFiles}\n`;
    report += `  Failed:      ${protocol.failedFiles}\n`;
    report += `  Success:     ${((protocol.uploadedFiles / protocol.totalFiles) * 100).toFixed(1)}%\n\n`;
    
    report += `Size:\n`;
    report += `  Total:       ${(protocol.totalSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `  Uploaded:    ${(protocol.uploadedSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `  Remaining:   ${((protocol.totalSize - protocol.uploadedSize) / 1024 / 1024).toFixed(2)} MB\n\n`;
    
    if (protocol.errors.length > 0) {
      report += '───────────────────────────────────────────────────\n';
      report += '                     ERRORS\n';
      report += '───────────────────────────────────────────────────\n\n';
      
      const errorsByType = protocol.errors.reduce((acc, error) => {
        acc[error.errorType] = (acc[error.errorType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      report += 'Error Types:\n';
      Object.entries(errorsByType).forEach(([type, count]) => {
        report += `  ${type.padEnd(15)} ${count}\n`;
      });
      report += '\n';
      
      report += 'Failed Stacks:\n';
      protocol.stacks
        .filter(s => s.status === 'failed' || s.status === 'partial')
        .forEach(stack => {
          report += `  ${stack.stackName} (${stack.stackId})\n`;
          report += `    Files: ${stack.uploadedFiles}/${stack.totalFiles} uploaded, ${stack.failedFiles} failed\n`;
          report += `    Retries: ${stack.retryCount}\n`;
          
          if (stack.errors.length > 0) {
            stack.errors.forEach(error => {
              report += `    ❌ ${error.fileName}\n`;
              report += `       Type: ${error.errorType}\n`;
              report += `       Message: ${error.errorMessage}\n`;
              report += `       Attempt: ${error.attemptNumber}\n`;
              report += `       Can Retry: ${error.canRetry ? 'Yes' : 'No'}\n`;
            });
          }
          report += '\n';
        });
    }
    
    if (this.retryQueue.length > 0) {
      report += '───────────────────────────────────────────────────\n';
      report += '                  RETRY QUEUE\n';
      report += '───────────────────────────────────────────────────\n\n';
      
      report += `Pending Retries: ${this.retryQueue.length}\n\n`;
      
      this.retryQueue.forEach((item, index) => {
        report += `${index + 1}. ${item.fileName}\n`;
        report += `   Stack:    ${item.stackId}\n`;
        report += `   Priority: ${item.priority}\n`;
        report += `   Attempt:  ${item.attemptNumber}/${this.maxRetries}\n`;
        if (item.lastError) {
          report += `   Last Error: ${item.lastError.errorMessage}\n`;
        }
        report += '\n';
      });
    }
    
    report += '═══════════════════════════════════════════════════\n';
    
    return report;
  }
  
  /**
   * Save protocol to localStorage
   */
  saveToLocalStorage(): void {
    const key = `upload_protocol_${this.protocol.uploadId}`;
    localStorage.setItem(key, JSON.stringify(this.protocol));
  }
  
  /**
   * Load protocol from localStorage
   */
  static loadFromLocalStorage(uploadId: string): UploadProtocol | null {
    const key = `upload_protocol_${uploadId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

/**
 * Get all upload protocols from localStorage
 */
export function getAllUploadProtocols(): UploadProtocol[] {
  const protocols: UploadProtocol[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('upload_protocol_')) {
      const data = localStorage.getItem(key);
      if (data) {
        protocols.push(JSON.parse(data));
      }
    }
  }
  
  // Sort by start time (newest first)
  return protocols.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
}

/**
 * Delete old protocols (older than 30 days)
 */
export function cleanupOldProtocols(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith('upload_protocol_')) {
      const data = localStorage.getItem(key);
      if (data) {
        const protocol: UploadProtocol = JSON.parse(data);
        const startTime = new Date(protocol.startTime).getTime();
        
        if (startTime < thirtyDaysAgo) {
          localStorage.removeItem(key);
        }
      }
    }
  }
}
