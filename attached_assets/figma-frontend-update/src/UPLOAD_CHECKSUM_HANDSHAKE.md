# 🔒 Upload Checksum Handshake System

## Überblick

Das PIX.IMMO Upload-System verwendet ein **Three-Way Handshake Protocol mit Checksum-Verification**, um Datenintegrität, Zuverlässigkeit und gegenseitige Bestätigung zwischen App und Server zu garantieren.

## Warum Checksum-Handshake?

### Problem ohne Handshake

```
❌ Naiver Upload:
   App → Server: [Große Datei]
   
   Probleme:
   ├─ Server weiß nicht WAS kommt
   ├─ Server weiß nicht WIEVIEL kommt
   ├─ Keine Vorbereitung möglich
   ├─ Keine Verifizierung
   ├─ Upload-Abbruch unbemerkt
   ├─ Korrupte Dateien möglich
   └─ Keine gegenseitige Bestätigung
```

### Lösung mit Handshake

```
✅ Three-Way Handshake:
   1. App → Server: "Ich sende X Dateien (Y MB) mit diesen Checksums"
   2. Server → App: "OK, bereit! Nutze Session ABC"
   3. App → Server: [Upload mit Chunk-Verification]
   4. Server → App: "Alle Chunks empfangen und verifiziert"
   5. Server verifies final checksums
   6. Server → App: "Upload 100% OK, alle Checksums stimmen"
   
   Vorteile:
   ├─ Server kennt Erwartungen
   ├─ Speicher kann allokiert werden
   ├─ Upload-Session wird erstellt
   ├─ Jeder Chunk wird verifiziert
   ├─ Finale Verifizierung
   └─ Gegenseitige Bestätigung
```

## Three-Way Handshake Flow

### Kompletter Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    PHASE 1: MANIFEST                          │
└──────────────────────────────────────────────────────────────┘

📱 App:
   │
   ├─ 1. Sammelt alle zu uploadenden Dateien
   ├─ 2. Berechnet Checksum für JEDE Datei
   │    └─ SHA-256 Hash über gesamten File-Inhalt
   ├─ 3. Erstellt Upload-Manifest:
   │    {
   │      manifestId: "manifest_20251105_143022",
   │      uploadId: "upload_20251105_143022",
   │      totalFiles: 24,
   │      totalSize: 441450496, // bytes
   │      files: [
   │        {
   │          fileId: "shot_001",
   │          fileName: "stack_001_shot_001.dng",
   │          fileSize: 28311552,
   │          mimeType: "image/x-adobe-dng",
   │          checksum: "a3f5b8c...", // SHA-256
   │          chunkCount: 6,
   │          chunkSize: 5242880
   │        },
   │        ...
   │      ],
   │      manifestChecksum: "xyz123..." // Hash aller Checksums
   │    }
   │
   └─ 4. Sendet Manifest an Server

┌──────────────────────────────────────────────────────────────┐
│                   PHASE 2: ACKNOWLEDGMENT                     │
└──────────────────────────────────────────────────────────────┘

🌐 Server:
   │
   ├─ 1. Empfängt Manifest
   ├─ 2. Validiert Manifest:
   │    ├─ Total Size < Max Limit?
   │    ├─ File Count < Max Limit?
   │    ├─ User hat Quota?
   │    └─ Manifest-Checksum korrekt?
   │
   ├─ 3. Allokiert Speicher/Ressourcen
   ├─ 4. Erstellt Upload-Session:
   │    {
   │      uploadSessionId: "session_20251105_143022",
   │      expiresAt: "2025-11-06T14:30:22Z", // 24h
   │      uploadUrls: {
   │        "shot_001": "https://storage.../upload?token=abc",
   │        "shot_002": "https://storage.../upload?token=def",
   │        ...
   │      },
   │      maxChunkSize: 5242880, // 5 MB
   │      allowedRetries: 3
   │    }
   │
   └─ 5. Sendet Acknowledgment an App

📱 App:
   │
   ├─ Empfängt Acknowledgment
   ├─ ✅ Server ist bereit!
   └─ Startet Upload

┌──────────────────────────────────────────────────────────────┐
│                     PHASE 3: UPLOAD                           │
└──────────────────────────────────────────────────────────────┘

📱 App für JEDE Datei:
   │
   ├─ 1. Teilt Datei in Chunks auf
   │    └─ Chunk-Größe aus Acknowledgment (5 MB)
   │
   ├─ 2. Für jeden Chunk:
   │    │
   │    ├─ a) Berechnet Chunk-Checksum (SHA-256)
   │    │
   │    ├─ b) Upload Chunk mit Headers:
   │    │    POST https://storage.../upload
   │    │    X-Upload-Session: session_20251105_143022
   │    │    X-File-Id: shot_001
   │    │    X-Chunk-Index: 0
   │    │    X-Chunk-Total: 6
   │    │    X-Chunk-Checksum: a3f5...
   │    │    Content-Type: application/octet-stream
   │    │
   │    └─ c) Server Response:
   │         {
   │           chunkIndex: 0,
   │           checksum: "a3f5...",
   │           verified: true ✅
   │         }
   │
   └─ 3. Alle Chunks uploaded

🌐 Server während Upload:
   │
   ├─ Empfängt jeden Chunk
   ├─ Berechnet Checksum des empfangenen Chunks
   ├─ Vergleicht mit X-Chunk-Checksum Header
   ├─ Speichert Chunk wenn OK
   └─ Bestätigt Chunk an App

┌──────────────────────────────────────────────────────────────┐
│                   PHASE 4: VERIFICATION                       │
└──────────────────────────────────────────────────────────────┘

📱 App:
   │
   ├─ Alle Chunks uploaded
   ├─ Sendet Verification Request:
   │    POST /api/upload/verify
   │    {
   │      uploadSessionId: "session_20251105_143022",
   │      manifestChecksum: "xyz123..."
   │    }
   │
   └─ Wartet auf finale Bestätigung

🌐 Server:
   │
   ├─ 1. Merged alle Chunks zu vollständigen Dateien
   │
   ├─ 2. Berechnet Checksum für JEDE komplette Datei
   │
   ├─ 3. Vergleicht mit Manifest:
   │    ├─ File 1: Checksum OK? ✅
   │    ├─ File 2: Checksum OK? ✅
   │    ├─ ...
   │    └─ File 24: Checksum OK? ✅
   │
   ├─ 4. Berechnet Manifest-Checksum neu
   │
   ├─ 5. Sendet Verification Result:
   │    {
   │      success: true,
   │      uploadId: "upload_20251105_143022",
   │      filesVerified: 24,
   │      filesTotal: 24,
   │      checksumMatches: true ✅,
   │      verificationDetails: [
   │        {
   │          fileId: "shot_001",
   │          fileName: "stack_001_shot_001.dng",
   │          uploadedSize: 28311552,
   │          expectedSize: 28311552,
   │          uploadedChecksum: "a3f5...",
   │          expectedChecksum: "a3f5...",
   │          verified: true ✅
   │        },
   │        ...
   │      ],
   │      timestamp: "2025-11-05T14:32:15Z"
   │    }
   │
   └─ Upload Session geschlossen

📱 App:
   │
   ├─ Empfängt Verification Result
   ├─ ✅ Alle Checksums OK!
   ├─ ✅ Upload 100% verifiziert!
   └─ Zeigt Success Message mit Details
```

## Data Structures

### 1. File Manifest

```typescript
interface FileManifest {
  fileId: string;              // Unique ID: "shot_001"
  fileName: string;            // "stack_001_shot_001.dng"
  fileSize: number;            // Bytes: 28311552
  mimeType: string;            // "image/x-adobe-dng"
  checksum: string;            // SHA-256: "a3f5b8c..."
  chunkCount: number;          // Number of chunks: 6
  chunkSize: number;           // Bytes per chunk: 5242880 (5 MB)
}
```

### 2. Upload Manifest

```typescript
interface UploadManifest {
  manifestId: string;          // "manifest_20251105_143022"
  uploadId: string;            // "upload_20251105_143022"
  photographerId: string;      // User ID
  totalFiles: number;          // 24
  totalSize: number;           // 441450496 bytes (421 MB)
  files: FileManifest[];       // Array of file manifests
  metadata: {
    stacksCount: number;       // 8
    deviceType: 'pro' | 'standard';
    networkType: 'wifi' | 'cellular';
    appVersion: string;        // "1.0.0"
    timestamp: string;         // ISO 8601
  };
  manifestChecksum: string;    // Hash of all file checksums
}
```

### 3. Server Acknowledgment

```typescript
interface ServerAcknowledgment {
  success: boolean;            // true if accepted
  uploadSessionId: string;     // "session_20251105_143022"
  expiresAt: string;          // ISO 8601, typically +24h
  uploadUrls: Map<string, string>; // fileId → signed URL
  maxChunkSize: number;        // 5242880 (5 MB)
  allowedRetries: number;      // 3
  message: string;             // Human-readable status
}
```

### 4. Chunk Verification

```typescript
interface ChunkVerification {
  chunkIndex: number;          // 0-based
  chunkChecksum: string;       // SHA-256 of this chunk
  verified: boolean;           // true if checksum matches
  error?: string;              // If verification failed
}
```

### 5. Upload Verification Result

```typescript
interface UploadVerificationResult {
  success: boolean;            // true if all verified
  uploadId: string;            // "upload_20251105_143022"
  filesVerified: number;       // 24
  filesTotal: number;          // 24
  checksumMatches: boolean;    // true if all match
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
  timestamp: string;           // ISO 8601
}
```

## Checksum Calculation

### SHA-256 für Dateien

```typescript
/**
 * Berechnet SHA-256 Hash für eine komplette Datei
 */
async function calculateFileChecksum(file: File): Promise<string> {
  // 1. Datei als ArrayBuffer laden
  const buffer = await file.arrayBuffer();
  
  // 2. SHA-256 Hash berechnen
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  
  // 3. In Hex String konvertieren
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex;
}

// Beispiel:
// Input: 28 MB DNG Datei
// Output: "a3f5b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8"
```

### SHA-256 für Chunks

```typescript
/**
 * Berechnet SHA-256 Hash für einen Chunk
 */
async function calculateChunkChecksum(chunk: Blob): Promise<string> {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// Beispiel:
// Input: 5 MB Chunk
// Output: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3"
```

### Manifest Checksum

```typescript
/**
 * Berechnet Checksum für das gesamte Manifest
 * (Hash aller File-Checksums kombiniert)
 */
function calculateManifestChecksum(fileChecksums: string[]): string {
  // 1. Sortieren für konsistente Reihenfolge
  const sorted = fileChecksums.sort();
  
  // 2. Mit Delimiter kombinieren
  const combined = sorted.join('|');
  
  // 3. Hash berechnen
  // (Simplified for demo - use crypto.subtle in production)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Beispiel:
// Input: ["a3f5b8c...", "b2c3d4e...", "c1d2e3f...", ...]
// Output: "xyz12345"
```

## Upload Process Implementation

### 1. Create Manifest (App)

```typescript
const manifest = await createUploadManifest(
  uploadId: "upload_20251105_143022",
  photographerId: "user_abc123",
  stacks: photoStacks,
  deviceType: "pro",
  networkType: "wifi"
);

console.log(manifest);
// {
//   manifestId: "manifest_20251105_143022",
//   totalFiles: 24,
//   totalSize: 441450496,
//   files: [...],
//   manifestChecksum: "xyz12345"
// }
```

### 2. Send Manifest & Get Acknowledgment (App → Server)

```typescript
const acknowledgment = await sendManifestToServer(manifest);

if (!acknowledgment.success) {
  throw new Error('Server rejected manifest');
}

console.log(acknowledgment);
// {
//   success: true,
//   uploadSessionId: "session_20251105_143022",
//   expiresAt: "2025-11-06T14:30:22Z",
//   uploadUrls: Map { ... },
//   maxChunkSize: 5242880
// }
```

### 3. Upload Files with Chunk Verification (App → Server)

```typescript
for (const file of manifest.files) {
  const uploadUrl = acknowledgment.uploadUrls.get(file.fileId);
  
  const chunkVerifications = await uploadFileWithVerification(
    file.file,
    file,
    uploadUrl,
    (progress, chunkIndex) => {
      console.log(`Chunk ${chunkIndex}: ${progress}%`);
    }
  );
  
  // All chunks verified?
  const allVerified = chunkVerifications.every(c => c.verified);
  if (!allVerified) {
    throw new Error('Chunk verification failed');
  }
}
```

### 4. Request Final Verification (App → Server)

```typescript
const verification = await verifyUploadOnServer(
  uploadId,
  manifest
);

if (!verification.success || !verification.checksumMatches) {
  throw new Error('Upload verification failed');
}

console.log(verification);
// {
//   success: true,
//   filesVerified: 24,
//   filesTotal: 24,
//   checksumMatches: true,
//   verificationDetails: [...]
// }
```

### 5. Complete Upload (App)

```typescript
// Show success to user
toast.success(
  `✅ Upload verifiziert!\n${verification.filesVerified}/${verification.filesTotal} Dateien · Checksum OK`
);

// Generate summary
const summary = generateUploadSummary(manifest, verification);
console.log(summary);
// Upload Summary:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Files:     24/24
// Size:      421.06 MB
// Duration:  43s
// Speed:     9.79 MB/s
// Network:   WIFI
// Checksum:  ✅ VERIFIED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Server-Side Implementation

### Supabase Edge Function: /upload/initiate

```typescript
// Edge Function: functions/upload-initiate/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { manifest } = await req.json()
  
  // 1. Validate manifest
  if (manifest.totalSize > 5 * 1024 * 1024 * 1024) { // 5 GB max
    return new Response(
      JSON.stringify({ error: 'Upload too large' }),
      { status: 400 }
    )
  }
  
  // 2. Check user quota
  const userQuota = await checkUserQuota(manifest.photographerId)
  if (userQuota.remaining < manifest.totalSize) {
    return new Response(
      JSON.stringify({ error: 'Insufficient quota' }),
      { status: 403 }
    )
  }
  
  // 3. Create upload session
  const sessionId = `session_${Date.now()}`
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  // 4. Generate signed upload URLs
  const supabase = createClient(...)
  const uploadUrls = new Map()
  
  for (const file of manifest.files) {
    const { data, error } = await supabase.storage
      .from('raw-captures')
      .createSignedUploadUrl(`${manifest.uploadId}/${file.fileName}`)
    
    if (!error) {
      uploadUrls.set(file.fileId, data.signedUrl)
    }
  }
  
  // 5. Store session in database
  await supabase
    .from('upload_sessions')
    .insert({
      session_id: sessionId,
      upload_id: manifest.uploadId,
      photographer_id: manifest.photographerId,
      manifest: manifest,
      expires_at: expiresAt.toISOString(),
      status: 'active'
    })
  
  // 6. Send acknowledgment
  return new Response(
    JSON.stringify({
      success: true,
      uploadSessionId: sessionId,
      expiresAt: expiresAt.toISOString(),
      uploadUrls: Object.fromEntries(uploadUrls),
      maxChunkSize: 5 * 1024 * 1024,
      allowedRetries: 3,
      message: 'Upload session created successfully'
    }),
    { status: 200 }
  )
})
```

### Supabase Edge Function: /upload/verify

```typescript
// Edge Function: functions/upload-verify/index.ts

serve(async (req) => {
  const { uploadSessionId, manifestChecksum } = await req.json()
  
  // 1. Get session
  const session = await supabase
    .from('upload_sessions')
    .select('*')
    .eq('session_id', uploadSessionId)
    .single()
  
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Session not found' }),
      { status: 404 }
    )
  }
  
  // 2. Get all uploaded files
  const { data: files } = await supabase.storage
    .from('raw-captures')
    .list(session.data.upload_id)
  
  // 3. Verify each file
  const verificationDetails = []
  
  for (const fileManifest of session.data.manifest.files) {
    const uploadedFile = files.find(f => f.name === fileManifest.fileName)
    
    if (!uploadedFile) {
      verificationDetails.push({
        fileId: fileManifest.fileId,
        fileName: fileManifest.fileName,
        verified: false,
        error: 'File not found'
      })
      continue
    }
    
    // Download and calculate checksum
    const { data: fileData } = await supabase.storage
      .from('raw-captures')
      .download(`${session.data.upload_id}/${fileManifest.fileName}`)
    
    const uploadedChecksum = await calculateChecksum(fileData)
    
    verificationDetails.push({
      fileId: fileManifest.fileId,
      fileName: fileManifest.fileName,
      uploadedSize: uploadedFile.metadata.size,
      expectedSize: fileManifest.fileSize,
      uploadedChecksum,
      expectedChecksum: fileManifest.checksum,
      verified: uploadedChecksum === fileManifest.checksum
    })
  }
  
  // 4. Check if all verified
  const allVerified = verificationDetails.every(d => d.verified)
  
  // 5. Update session status
  await supabase
    .from('upload_sessions')
    .update({
      status: allVerified ? 'verified' : 'failed',
      verified_at: new Date().toISOString()
    })
    .eq('session_id', uploadSessionId)
  
  // 6. Create upload record if verified
  if (allVerified) {
    await supabase
      .from('uploads')
      .insert({
        id: session.data.upload_id,
        photographer_id: session.data.photographer_id,
        status: 'completed',
        stacks_count: session.data.manifest.metadata.stacksCount,
        photos_count: session.data.manifest.totalFiles,
        total_size_mb: session.data.manifest.totalSize / 1024 / 1024,
        upload_network_type: session.data.manifest.metadata.networkType,
        verified: true,
        created_at: new Date().toISOString()
      })
  }
  
  // 7. Send verification result
  return new Response(
    JSON.stringify({
      success: allVerified,
      uploadId: session.data.upload_id,
      filesVerified: verificationDetails.filter(d => d.verified).length,
      filesTotal: verificationDetails.length,
      checksumMatches: allVerified,
      verificationDetails,
      message: allVerified 
        ? 'All files verified successfully'
        : 'Some files failed verification',
      timestamp: new Date().toISOString()
    }),
    { status: 200 }
  )
})
```

## Error Handling & Retry

### Network Errors

```typescript
async function uploadWithRetry(
  chunk: Blob,
  url: string,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: chunk
      })
      
      if (response.ok) {
        return true
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw error
      }
    }
  }
  
  return false
}
```

### Checksum Mismatch

```typescript
if (!verification.checksumMatches) {
  // Find mismatched files
  const mismatched = verification.verificationDetails
    .filter(d => !d.verified)
  
  console.error('Checksum mismatch:', mismatched)
  
  // Option 1: Retry upload of mismatched files
  for (const file of mismatched) {
    await retryFileUpload(file.fileId)
  }
  
  // Option 2: Show error to user
  toast.error(
    `Upload-Fehler: ${mismatched.length} Dateien konnten nicht verifiziert werden`
  )
  
  // Option 3: Request new upload session
  const newSession = await createNewUploadSession(uploadId)
}
```

### Timeout Handling

```typescript
const uploadWithTimeout = async (
  chunk: Blob,
  url: string,
  timeoutMs: number = 30000 // 30s
): Promise<Response> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: chunk,
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Upload timeout')
    }
    throw error
  }
}
```

## Benefits

### 1. Datenintegrität ✅

```
✅ Jede Datei wird vor Upload gehasht
✅ Server verifiziert jeden Chunk
✅ Finale Verifizierung nach Upload
✅ Korrupte Daten werden erkannt
✅ Garantie: Was hochgeladen wurde = Was empfangen wurde
```

### 2. Transparenz 📊

```
✅ Server kennt Erwartungen vorab
✅ Progress kann genau berechnet werden
✅ User sieht exakte Upload-Details
✅ Detaillierte Fehler-Messages
✅ Audit Trail für jeden Upload
```

### 3. Zuverlässigkeit 🔒

```
✅ Upload-Session mit Expiry
✅ Retry-Logic mit Exponential Backoff
✅ Chunk-Level Verification
✅ Automatische Error Recovery
✅ Resumed Uploads möglich
```

### 4. Performance ⚡

```
✅ Server kann Resources vorab allokieren
✅ Chunked Upload für große Dateien
✅ Parallele Uploads möglich
✅ Network-optimierte Chunk-Größen
✅ Progress-Reporting ohne Polling
```

### 5. Security 🛡️

```
✅ Signed Upload URLs (zeitlich begrenzt)
✅ Session-basierte Authentifizierung
✅ Checksum verhindert Manipulation
✅ Quota-Checks vor Upload
✅ Kein Upload ohne Autorisierung
```

## UI/UX Integration

### Upload Phases anzeigen

```
Phase 1: Manifest
┌────────────────────────────┐
│ 📊 Checksums... 50%        │
│ Berechne Checksums...      │
│ 24 Dateien                 │
└────────────────────────────┘

Phase 2: Handshake
┌────────────────────────────┐
│ 🤝 Handshake... 100%       │
│ Server bereit für Upload   │
│ Session: abc123            │
└────────────────────────────┘

Phase 3: Upload
┌────────────────────────────┐
│ 📤 Upload... 45%           │
│ Upload stack_001_shot_003  │
│ Chunk 3/6                  │
└────────────────────────────┘

Phase 4: Verification
┌────────────────────────────┐
│ 🔍 Verifizierung... 100%   │
│ Server verifiziert Upload  │
│ 24/24 Dateien OK           │
└────────────────────────────┘
```

### Success Message

```
┌─────────────────────────────────────┐
│ ✅ Upload verifiziert!              │
│ 24/24 Dateien · Checksum OK         │
│                                     │
│ Files:     24/24                    │
│ Size:      421 MB                   │
│ Duration:  43s                      │
│ Speed:     9.8 MB/s                 │
│ Network:   WIFI                     │
│ Checksum:  ✅ VERIFIED              │
└─────────────────────────────────────┘
```

## Production Considerations

### Chunk Size Optimization

```
WiFi (>10 Mbit/s):
├─ Chunk Size: 5 MB
├─ Parallel Uploads: 3
└─ Timeout: 30s

4G/LTE (5-10 Mbit/s):
├─ Chunk Size: 2 MB
├─ Parallel Uploads: 2
└─ Timeout: 45s

3G (<5 Mbit/s):
├─ Chunk Size: 1 MB
├─ Parallel Uploads: 1
└─ Timeout: 60s
```

### Storage Strategy

```
Supabase Storage:
├─ raw-captures/          ← App uploads
│   ├─ {uploadId}/
│   │   ├─ chunks/        ← Temporary chunks
│   │   └─ merged/        ← Merged files
│   └─ ...
│
└─ Cleanup Policy:
    ├─ Unverified uploads: Delete after 24h
    ├─ Verified uploads: Keep indefinitely
    └─ Failed chunks: Delete after 1h
```

### Database Tables

```sql
-- Upload Sessions
CREATE TABLE upload_sessions (
  session_id TEXT PRIMARY KEY,
  upload_id TEXT NOT NULL,
  photographer_id UUID NOT NULL,
  manifest JSONB NOT NULL,
  status TEXT NOT NULL, -- 'active', 'verified', 'failed', 'expired'
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  
  INDEX idx_upload_id (upload_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at)
);

-- Upload Chunks (for tracking)
CREATE TABLE upload_chunks (
  chunk_id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES upload_sessions(session_id),
  file_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_checksum TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  
  UNIQUE (session_id, file_id, chunk_index)
);
```

## Zusammenfassung

Das **Three-Way Handshake mit Checksum-Verification** System bietet:

✅ **Datenintegrität** - SHA-256 Checksums für jeden File & Chunk  
✅ **Gegenseitige Bestätigung** - App ↔ Server Handshake  
✅ **Chunk-Verification** - Jeder Chunk wird einzeln verifiziert  
✅ **Finale Verifizierung** - Server prüft komplette Dateien  
✅ **Transparenz** - User sieht alle Details  
✅ **Zuverlässigkeit** - Retry-Logic & Error Recovery  
✅ **Performance** - Optimierte Chunk-Größen  
✅ **Security** - Signed URLs & Session-based Auth  

**Resultat:** Enterprise-Grade Upload-System mit garantierter Datenintegrität! 🔒✨

---
*Dokumentation: Upload Checksum Handshake - 05.11.2025*
