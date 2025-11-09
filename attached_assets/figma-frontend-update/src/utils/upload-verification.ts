/**
 * Upload Verification System with Checksum Handshake
 * 
 * Three-Way Handshake:
 * 1. App → Server: Pre-Upload Manifest (What & How Much)
 * 2. Server → App: Upload Session Created (Ready to receive)
 * 3. App → Server: Upload Files with Checksums
 * 4. Server → App: Post-Upload Verification (Success confirmation)
 */

export interface FileManifest {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum: string; // MD5 or SHA256 hash
  chunkCount: number;
  chunkSize: number;
}

export interface UploadManifest {
  manifestId: string;
  uploadId: string;
  photographerId: string;
  totalFiles: number;
  totalSize: number;
  files: FileManifest[];
  metadata: {
    stacksCount: number;
    deviceType: 'pro' | 'standard';
    networkType: 'wifi' | 'cellular';
    appVersion: string;
    timestamp: string;
  };
  manifestChecksum: string; // Checksum of the entire manifest
}

export interface ServerAcknowledgment {
  success: boolean;
  uploadSessionId: string;
  expiresAt: string;
  uploadUrls: Map<string, string>; // fileId → signed upload URL
  maxChunkSize: number;
  allowedRetries: number;
  message: string;
}

export interface ChunkVerification {
  chunkIndex: number;
  chunkChecksum: string;
  verified: boolean;
  error?: string;
}

export interface UploadVerificationResult {
  success: boolean;
  uploadId: string;
  filesVerified: number;
  filesTotal: number;
  checksumMatches: boolean;
  verificationDetails: {
    fileId: string;
    fileName: string;
    uploadedSize: number;
    expectedSize: number;
    uploadedChecksum: string;
    expectedChecksum: string;
    verified: boolean;
  }[];
  message: string;
  timestamp: string;
}

/**
 * Calculate MD5 checksum for a file
 */
export async function calculateMD5(file: File): Promise<string> {
  // Modern browsers support crypto.subtle for hashing
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate checksum for a chunk
 */
export async function calculateChunkChecksum(chunk: Blob): Promise<string> {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate manifest checksum (hash of all file checksums combined)
 */
export function calculateManifestChecksum(fileChecksums: string[]): string {
  const combined = fileChecksums.sort().join('|');
  // Simple hash for demo - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Create upload manifest from photo stacks
 */
export async function createUploadManifest(
  uploadId: string,
  photographerId: string,
  stacks: any[],
  deviceType: 'pro' | 'standard',
  networkType: 'wifi' | 'cellular'
): Promise<UploadManifest> {
  const files: FileManifest[] = [];
  let totalSize = 0;
  
  // Process each stack and calculate checksums
  for (const stack of stacks) {
    for (const shot of stack.shots) {
      // Calculate checksum for each file
      const checksum = await calculateMD5(shot.file);
      
      // Determine chunk size (5 MB for WiFi, 2 MB for cellular)
      const chunkSize = networkType === 'wifi' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
      const chunkCount = Math.ceil(shot.file.size / chunkSize);
      
      files.push({
        fileId: shot.id,
        fileName: `${stack.stackId}_${shot.id}.${shot.fileFormat.toLowerCase()}`,
        fileSize: shot.file.size,
        mimeType: shot.fileFormat === 'DNG' ? 'image/x-adobe-dng' : 'image/jpeg',
        checksum,
        chunkCount,
        chunkSize,
      });
      
      totalSize += shot.file.size;
    }
  }
  
  // Calculate manifest checksum
  const fileChecksums = files.map(f => f.checksum);
  const manifestChecksum = calculateManifestChecksum(fileChecksums);
  
  const manifest: UploadManifest = {
    manifestId: `manifest_${Date.now()}`,
    uploadId,
    photographerId,
    totalFiles: files.length,
    totalSize,
    files,
    metadata: {
      stacksCount: stacks.length,
      deviceType,
      networkType,
      appVersion: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    manifestChecksum,
  };
  
  return manifest;
}

/**
 * Send manifest to server and get acknowledgment
 * (In production: POST to /api/upload/initiate)
 */
export async function sendManifestToServer(
  manifest: UploadManifest
): Promise<ServerAcknowledgment> {
  // Simulate API call to Supabase Edge Function
  console.log('📤 Sending manifest to server:', {
    uploadId: manifest.uploadId,
    files: manifest.totalFiles,
    size: `${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB`,
    checksum: manifest.manifestChecksum,
  });
  
  // Simulate server processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate server acknowledgment
  const acknowledgment: ServerAcknowledgment = {
    success: true,
    uploadSessionId: `session_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h expiry
    uploadUrls: new Map(
      manifest.files.map(f => [
        f.fileId,
        `https://supabase.co/storage/v1/object/raw-captures/${manifest.uploadId}/${f.fileName}`
      ])
    ),
    maxChunkSize: manifest.metadata.networkType === 'wifi' ? 5 * 1024 * 1024 : 2 * 1024 * 1024,
    allowedRetries: 3,
    message: 'Upload session created successfully. Ready to receive files.',
  };
  
  console.log('✅ Server acknowledgment received:', {
    sessionId: acknowledgment.uploadSessionId,
    expiresAt: acknowledgment.expiresAt,
  });
  
  return acknowledgment;
}

/**
 * Upload file in chunks with verification
 */
export async function uploadFileWithVerification(
  file: File,
  fileManifest: FileManifest,
  uploadUrl: string,
  onProgress?: (progress: number, chunkIndex: number) => void
): Promise<ChunkVerification[]> {
  const chunks: ChunkVerification[] = [];
  const chunkSize = fileManifest.chunkSize;
  
  for (let i = 0; i < fileManifest.chunkCount; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    // Calculate chunk checksum
    const chunkChecksum = await calculateChunkChecksum(chunk);
    
    // Upload chunk (simulated)
    console.log(`📦 Uploading chunk ${i + 1}/${fileManifest.chunkCount} (${chunk.size} bytes)`);
    
    // Simulate upload delay based on chunk size
    const uploadDelay = (chunk.size / (1024 * 1024)) * 100; // ~100ms per MB
    await new Promise(resolve => setTimeout(resolve, uploadDelay));
    
    // Verify chunk (in production: server verifies and responds)
    chunks.push({
      chunkIndex: i,
      chunkChecksum,
      verified: true,
    });
    
    // Report progress
    const progress = Math.round(((i + 1) / fileManifest.chunkCount) * 100);
    if (onProgress) {
      onProgress(progress, i);
    }
  }
  
  return chunks;
}

/**
 * Verify upload completion on server
 * (In production: POST to /api/upload/verify)
 */
export async function verifyUploadOnServer(
  uploadId: string,
  manifest: UploadManifest
): Promise<UploadVerificationResult> {
  console.log('🔍 Requesting server verification for upload:', uploadId);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate server verification
  const verificationDetails = manifest.files.map(file => ({
    fileId: file.fileId,
    fileName: file.fileName,
    uploadedSize: file.fileSize,
    expectedSize: file.fileSize,
    uploadedChecksum: file.checksum,
    expectedChecksum: file.checksum,
    verified: true,
  }));
  
  const result: UploadVerificationResult = {
    success: true,
    uploadId,
    filesVerified: manifest.totalFiles,
    filesTotal: manifest.totalFiles,
    checksumMatches: true,
    verificationDetails,
    message: 'All files uploaded and verified successfully',
    timestamp: new Date().toISOString(),
  };
  
  console.log('✅ Server verification complete:', {
    filesVerified: result.filesVerified,
    filesTotal: result.filesTotal,
    checksumMatches: result.checksumMatches,
  });
  
  return result;
}

/**
 * Complete Three-Way Handshake Upload Process
 */
export async function performVerifiedUpload(
  uploadId: string,
  photographerId: string,
  stacks: any[],
  deviceType: 'pro' | 'standard',
  networkType: 'wifi' | 'cellular',
  onProgress?: (phase: string, progress: number, details?: any) => void
): Promise<UploadVerificationResult> {
  
  // PHASE 1: Create and send manifest
  if (onProgress) onProgress('manifest', 0, { message: 'Erstelle Upload-Manifest...' });
  
  const manifest = await createUploadManifest(
    uploadId,
    photographerId,
    stacks,
    deviceType,
    networkType
  );
  
  if (onProgress) onProgress('manifest', 50, { 
    message: 'Berechne Checksums...',
    files: manifest.totalFiles,
  });
  
  // PHASE 2: Get server acknowledgment
  if (onProgress) onProgress('handshake', 0, { message: 'Warte auf Server-Bestätigung...' });
  
  const acknowledgment = await sendManifestToServer(manifest);
  
  if (!acknowledgment.success) {
    throw new Error('Server rejected upload manifest');
  }
  
  if (onProgress) onProgress('handshake', 100, { 
    message: 'Server bereit für Upload',
    sessionId: acknowledgment.uploadSessionId,
  });
  
  // PHASE 3: Upload files with verification
  if (onProgress) onProgress('upload', 0, { message: 'Starte Upload...' });
  
  let uploadedFiles = 0;
  for (const stack of stacks) {
    for (const shot of stack.shots) {
      const fileManifest = manifest.files.find(f => f.fileId === shot.id);
      if (!fileManifest) continue;
      
      const uploadUrl = acknowledgment.uploadUrls.get(shot.id);
      if (!uploadUrl) continue;
      
      // Upload file in chunks
      await uploadFileWithVerification(
        shot.file,
        fileManifest,
        uploadUrl,
        (chunkProgress, chunkIndex) => {
          const fileProgress = (uploadedFiles / manifest.totalFiles) * 100;
          const currentFileProgress = chunkProgress / manifest.totalFiles;
          const totalProgress = Math.round(fileProgress + currentFileProgress);
          
          if (onProgress) onProgress('upload', totalProgress, {
            message: `Upload ${fileManifest.fileName}`,
            chunk: chunkIndex + 1,
            totalChunks: fileManifest.chunkCount,
          });
        }
      );
      
      uploadedFiles++;
    }
  }
  
  if (onProgress) onProgress('upload', 100, { message: 'Alle Dateien hochgeladen' });
  
  // PHASE 4: Server verification
  if (onProgress) onProgress('verification', 0, { message: 'Warte auf Server-Verifizierung...' });
  
  const verification = await verifyUploadOnServer(uploadId, manifest);
  
  if (!verification.success || !verification.checksumMatches) {
    throw new Error('Upload verification failed - checksum mismatch');
  }
  
  if (onProgress) onProgress('verification', 100, { 
    message: 'Upload erfolgreich verifiziert',
    filesVerified: verification.filesVerified,
  });
  
  return verification;
}

/**
 * Generate upload summary for user display
 */
export function generateUploadSummary(
  manifest: UploadManifest,
  verification: UploadVerificationResult
): string {
  const duration = new Date(verification.timestamp).getTime() - new Date(manifest.metadata.timestamp).getTime();
  const durationSec = Math.round(duration / 1000);
  const speed = manifest.totalSize / duration * 1000 / 1024 / 1024; // MB/s
  
  return `
Upload Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files:     ${verification.filesVerified}/${verification.filesTotal}
Size:      ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB
Duration:  ${durationSec}s
Speed:     ${speed.toFixed(2)} MB/s
Network:   ${manifest.metadata.networkType.toUpperCase()}
Checksum:  ✅ VERIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
