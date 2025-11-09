# 🔄 Upload Error Protocol & Retry System

## Überblick

Das PIX.IMMO Upload-System verfügt über ein **umfassendes Error-Tracking & Retry-System** mit automatischer Nachforderung fehlgeschlagener Dateien und Stack-Level Stornierung.

## Features

```
✅ Fehlerprotokoll für jeden Upload
✅ Automatisches Nachfordern fehlgeschlagener Dateien
✅ Stack-Level Retry (alle fehlgeschlagenen Dateien eines Stapels)
✅ Stack-Level Cancellation (nur komplette Stapel)
✅ Exponential Backoff für Retries
✅ Error Analytics & Reporting
✅ Persistent Error Storage
✅ User-friendly Error UI

❌ NICHT: File-Level Cancellation
   → Einzelne Bilder können NICHT storniert werden
   → Nur komplette Stapel können storniert werden
```

## Upload Error Types

### Error-Kategorien

```typescript
type ErrorType = 
  | 'network'      // Netzwerkfehler (timeout, disconnect)
  | 'checksum'     // Checksum-Verifizierung fehlgeschlagen
  | 'timeout'      // Upload-Timeout überschritten
  | 'server'       // Server-Fehler (5xx)
  | 'quota'        // Speicherplatz-Limit erreicht
  | 'unknown';     // Unbekannter Fehler
```

### Error-Eigenschaften

```typescript
interface UploadError {
  errorId: string;              // "error_20251105_abc123"
  fileId: string;               // "shot_001"
  fileName: string;             // "stack_001_shot_001.dng"
  stackId: string;              // "stack_001"
  errorType: ErrorType;
  errorMessage: string;         // Human-readable message
  timestamp: string;            // ISO 8601
  attemptNumber: number;        // 1, 2, 3...
  canRetry: boolean;            // true if retry possible
}
```

## Stack Upload Status

### Status-Typen

```typescript
type StackStatus = 
  | 'pending'      // Noch nicht gestartet
  | 'uploading'    // Aktuell am Hochladen
  | 'completed'    // Alle Dateien erfolgreich
  | 'partial'      // Einige Dateien hochgeladen, einige fehlgeschlagen
  | 'failed'       // Alle Dateien fehlgeschlagen
  | 'cancelled';   // User hat Stapel storniert
```

### Stack Tracking

```typescript
interface StackUploadStatus {
  stackId: string;              // "stack_001"
  stackName: string;            // "Wohnzimmer"
  totalFiles: number;           // 3 (für Pro) oder 5 (für Standard)
  uploadedFiles: number;        // Anzahl erfolgreich hochgeladener Dateien
  failedFiles: number;          // Anzahl fehlgeschlagener Dateien
  status: StackStatus;
  errors: UploadError[];        // Alle Fehler dieses Stapels
  retryCount: number;           // Anzahl Wiederholungen
  lastAttempt: string;          // ISO 8601 des letzten Versuchs
}
```

## Upload Protocol

### Complete Protocol Structure

```typescript
interface UploadProtocol {
  uploadId: string;             // "upload_20251105_143022"
  sessionId: string;            // "session_20251105_143022"
  photographerId: string;       // User ID
  startTime: string;            // ISO 8601
  endTime?: string;             // ISO 8601
  status: ProtocolStatus;
  
  // Stack-level tracking
  stacks: StackUploadStatus[];
  
  // Summary
  totalStacks: number;          // 8
  completedStacks: number;      // 6
  failedStacks: number;         // 1
  cancelledStacks: number;      // 1
  
  totalFiles: number;           // 24
  uploadedFiles: number;        // 18
  failedFiles: number;          // 3
  
  totalSize: number;            // Bytes
  uploadedSize: number;         // Bytes
  
  // All errors across all stacks
  errors: UploadError[];
  
  // Metadata
  networkType: 'wifi' | 'cellular';
  deviceType: 'pro' | 'standard';
  appVersion: string;           // "1.0.0"
}
```

### Protocol Status

```typescript
type ProtocolStatus = 
  | 'in_progress'  // Upload läuft noch
  | 'completed'    // Alle Stapel erfolgreich
  | 'failed'       // Alle Stapel fehlgeschlagen
  | 'partial'      // Einige Stapel erfolgreich, einige fehlgeschlagen
  | 'cancelled';   // User hat kompletten Upload storniert
```

## Error Tracking Implementation

### 1. Create Error Tracker

```typescript
import { UploadErrorTracker } from '../utils/upload-error-tracking';

const tracker = new UploadErrorTracker(
  uploadId: "upload_20251105_143022",
  sessionId: "session_20251105_143022",
  photographerId: "user_abc123",
  stacks: photoStacks,
  networkType: "wifi",
  deviceType: "pro"
);
```

### 2. Record Success

```typescript
// Wenn Datei erfolgreich hochgeladen wurde
tracker.recordSuccess(
  stackId: "stack_001",
  fileId: "shot_001",
  fileSize: 28311552  // bytes
);

// Tracker updates automatically:
// - stack.uploadedFiles++
// - protocol.uploadedFiles++
// - protocol.uploadedSize += fileSize
// - Removes file from retry queue
// - Updates stack status if complete
```

### 3. Record Error

```typescript
// Wenn Datei-Upload fehlschlägt
const error = tracker.recordError(
  stackId: "stack_001",
  fileId: "shot_001",
  fileName: "stack_001_shot_001.dng",
  errorType: "network",
  errorMessage: "Connection timeout after 30s",
  attemptNumber: 1,
  file: originalFile  // for retry queue
);

// Tracker updates automatically:
// - Adds error to protocol.errors
// - Adds error to stack.errors
// - stack.failedFiles++
// - protocol.failedFiles++
// - Updates stack status
// - Adds to retry queue if canRetry
```

### 4. Get Protocol

```typescript
const protocol = tracker.getProtocol();

console.log(`Status: ${protocol.status}`);
console.log(`Files: ${protocol.uploadedFiles}/${protocol.totalFiles}`);
console.log(`Errors: ${protocol.errors.length}`);
```

## Retry System

### Retry Queue

```typescript
interface RetryQueueItem {
  stackId: string;              // "stack_001"
  fileId: string;               // "shot_001"
  fileName: string;             // "stack_001_shot_001.dng"
  file: File;                   // Original File object
  attemptNumber: number;        // Next attempt (1, 2, 3...)
  lastError?: UploadError;      // Previous error
  priority: 'high' | 'normal' | 'low';
}
```

### Priority Rules

```
High Priority:
├─ Network errors (temporary issues)
└─ Erste Wiederholung

Normal Priority:
├─ Timeout errors
└─ Zweite Wiederholung

Low Priority:
├─ Unknown errors
└─ Dritte+ Wiederholung
```

### Get Retry Queue

```typescript
// Alle ausstehenden Retries
const queue = tracker.getRetryQueue();
console.log(`${queue.length} files need retry`);

// Nur für einen bestimmten Stack
const stackQueue = tracker.getStackRetryQueue("stack_001");
console.log(`${stackQueue.length} files in stack need retry`);

// Alle Stacks die Retry brauchen
const stacksNeedingRetry = tracker.getStacksNeedingRetry();
stacksNeedingRetry.forEach(stack => {
  console.log(`${stack.stackName}: ${stack.failedFiles} failed files`);
});
```

## Stack Retry

### Automatic Retry with Exponential Backoff

```typescript
const result = await tracker.retryStack(
  stackId: "stack_001",
  uploadFunction: async (item: RetryQueueItem) => {
    // Your upload logic here
    try {
      await uploadFile(item.file, uploadUrl);
      return true;  // Success
    } catch (error) {
      return false; // Failed
    }
  },
  onProgress: (current, total, item) => {
    console.log(`Retrying ${current}/${total}: ${item.fileName}`);
    toast.info(`Wiederhole ${item.fileName}... (${current}/${total})`);
  }
);

// Result
console.log(`Success: ${result.success}`);
console.log(`Uploaded: ${result.uploaded}`);
console.log(`Failed: ${result.failed}`);
```

### Exponential Backoff

```
Attempt 1: Immediate
Attempt 2: 2s delay
Attempt 3: 4s delay
Attempt 4: 8s delay
...
```

```typescript
// Automatic exponential backoff in retryStack()
if (item.attemptNumber > 1) {
  const delay = 2000 * Math.pow(2, item.attemptNumber - 2);
  await new Promise(resolve => setTimeout(resolve, delay));
}
```

## Stack Cancellation

### User storniert kompletten Stapel

```typescript
// WICHTIG: Nur komplette Stapel können storniert werden!
// Einzelne Bilder NICHT!

tracker.cancelStack("stack_001");

// Was passiert:
// - stack.status = 'cancelled'
// - protocol.cancelledStacks++
// - Alle Dateien aus Retry-Queue entfernt
// - Alle Fehler als non-retryable markiert
// - Tracker speichert Protocol
```

### UI Flow

```
User sieht fehlgeschlagenen Stapel:
┌──────────────────────────────────┐
│ Wohnzimmer                       │
│ 1/3 hochgeladen · 2 fehler       │
│ ────────────────────────────────│
│ [Wiederholen] [X Stapel cancel] │
└──────────────────────────────────┘

User klickt "X Stapel cancel":
   ↓
Confirmation Dialog:
   ↓
"Möchten Sie den Stapel 'Wohnzimmer' 
 wirklich stornieren?
 
 Hinweis: Einzelne Bilder können nicht 
 storniert werden, nur komplette Stapel."
 
[Abbrechen] [Ja, stornieren]
   ↓
Stack wird storniert:
   ↓
✅ Toast: "Stapel 'Wohnzimmer' wurde storniert"
```

## Error Report

### Generate Report

```typescript
const report = tracker.generateErrorReport();
console.log(report);
```

### Report Format

```
═══════════════════════════════════════════════════
           UPLOAD ERROR PROTOCOL
═══════════════════════════════════════════════════

Upload ID:     upload_20251105_143022
Session ID:    session_20251105_143022
Status:        PARTIAL
Started:       05.11.2025, 14:30:22
Ended:         05.11.2025, 14:35:45
Duration:      323s
Network:       WIFI
Device:        PRO

───────────────────────────────────────────────────
                    SUMMARY
───────────────────────────────────────────────────

Stacks:
  Total:       8
  Completed:   6
  Failed:      1
  Cancelled:   1
  Partial:     0

Files:
  Total:       24
  Uploaded:    18
  Failed:      3
  Success:     75.0%

Size:
  Total:       421.06 MB
  Uploaded:    315.79 MB
  Remaining:   105.27 MB

───────────────────────────────────────────────────
                     ERRORS
───────────────────────────────────────────────────

Error Types:
  network         2
  timeout         1

Failed Stacks:
  Wohnzimmer (stack_001)
    Files: 1/3 uploaded, 2 failed
    Retries: 1
    ❌ stack_001_shot_002.dng
       Type: network
       Message: Connection timeout after 30s
       Attempt: 2
       Can Retry: Yes
    ❌ stack_001_shot_003.dng
       Type: timeout
       Message: Upload timeout exceeded
       Attempt: 1
       Can Retry: Yes

───────────────────────────────────────────────────
                  RETRY QUEUE
───────────────────────────────────────────────────

Pending Retries: 2

1. stack_001_shot_002.dng
   Stack:    stack_001
   Priority: high
   Attempt:  3/3
   Last Error: Connection timeout after 30s

2. stack_001_shot_003.dng
   Stack:    stack_001
   Priority: normal
   Attempt:  2/3
   Last Error: Upload timeout exceeded

═══════════════════════════════════════════════════
```

## Persistent Storage

### Save Protocol

```typescript
// Auto-save to localStorage
tracker.saveToLocalStorage();

// Stored as:
// Key: upload_protocol_upload_20251105_143022
// Value: JSON of UploadProtocol
```

### Load Protocol

```typescript
// Load specific protocol
const protocol = UploadErrorTracker.loadFromLocalStorage(
  "upload_20251105_143022"
);

if (protocol) {
  console.log(`Loaded protocol for ${protocol.uploadId}`);
}
```

### Get All Protocols

```typescript
import { getAllUploadProtocols } from '../utils/upload-error-tracking';

const protocols = getAllUploadProtocols();
console.log(`Found ${protocols.length} protocols`);

// Filter failed uploads
const failed = protocols.filter(p => 
  p.status === 'failed' || p.status === 'partial'
);

console.log(`${failed.length} uploads need attention`);
```

### Cleanup Old Protocols

```typescript
import { cleanupOldProtocols } from '../utils/upload-error-tracking';

// Delete protocols older than 30 days
cleanupOldProtocols();
```

## UI Integration

### Failed Uploads Section

```
Fehlgeschlagene Uploads [3 anzeigen]
┌──────────────────────────────────────┐
│ ╔════════════════════════════════╗  │
│ ║ Wohnzimmer                     ║  │
│ ║ 1/3 hochgeladen · 2 fehler     ║  │
│ ║ ──────────────────────────────║  │
│ ║ [🔄 Wiederholen] [X Stornieren]║  │
│ ╚════════════════════════════════╝  │
│                                      │
│ ╔════════════════════════════════╗  │
│ ║ Küche                          ║  │
│ ║ 0/3 hochgeladen · 3 fehler     ║  │
│ ║ ──────────────────────────────║  │
│ ║ [🔄 Wiederholen] [X Stornieren]║  │
│ ╚════════════════════════════════╝  │
└──────────────────────────────────────┘

ℹ️ Hinweis: Nur komplette Stapel können 
storniert werden, nicht einzelne Bilder.
```

### Retry Flow

```
User klickt "Wiederholen":
   ↓
Toast: "🔄 Wiederhole Upload für Wohnzimmer..."
   ↓
Für jede fehlgeschlagene Datei:
   ↓
Toast: "Wiederhole stack_001_shot_002.dng... (1/2)"
   ↓
Exponential Backoff (wenn Attempt > 1)
   ↓
Upload Datei
   ↓
Success?
   ├─ Ja → Nächste Datei
   └─ Nein → Füge zu Retry Queue hinzu
   ↓
Alle Dateien verarbeitet:
   ↓
Success?
   ├─ Ja → ✅ Toast: "Wohnzimmer erfolgreich hochgeladen!"
   │        Entferne von Failed List
   └─ Nein → ❌ Toast: "2 Dateien konnten nicht hochgeladen werden"
               Bleibe in Failed List
```

## Error Handling Strategies

### Network Errors

```
Strategy: Exponential Backoff mit Retry
Max Retries: 3
Backoff: 2s → 4s → 8s

Beispiel:
Attempt 1: Upload → Network Error
Warte 2s
Attempt 2: Upload → Network Error  
Warte 4s
Attempt 3: Upload → Success ✅
```

### Checksum Errors

```
Strategy: Einmaliger Retry
Max Retries: 1

Reason:
- Checksum-Fehler bedeutet Daten-Korruption
- File könnte korrupt sein
- Neuberechnung von Checksum nötig
```

### Timeout Errors

```
Strategy: Retry mit größeren Chunks
Max Retries: 3

Beispiel:
Attempt 1: 5MB Chunks → Timeout
Attempt 2: 2MB Chunks → Timeout
Attempt 3: 1MB Chunks → Success ✅
```

### Server Errors (5xx)

```
Strategy: Exponential Backoff
Max Retries: 3
Backoff: 5s → 10s → 20s

Reason:
- Server könnte überlastet sein
- Längere Wartezeiten
```

### Quota Errors

```
Strategy: KEIN Retry
canRetry: false

Reason:
- User hat Speicherlimit erreicht
- Retry würde erneut fehlschlagen
- User-Action nötig (Upgrade, Cleanup)
```

## Best Practices

### 1. Stack-Level Operations

```
✅ DO:
- Retry ganzen Stapel
- Cancel ganzen Stapel
- Status für ganzen Stapel

❌ DON'T:
- Einzelne Dateien stornieren
- Einzelne Dateien aus Stack entfernen
- Stack ohne alle Dateien
```

**Reason:** HDR Bracketing braucht ALLE Belichtungen!

### 2. User Communication

```
✅ CLEAR:
"Wohnzimmer: 1/3 hochgeladen · 2 fehler"
"Wiederholen Sie den Stapel 'Wohnzimmer'"

❌ UNCLEAR:
"Einige Dateien fehlgeschlagen"
"Upload-Fehler"
```

### 3. Auto-Retry vs. Manual Retry

```
Auto-Retry:
├─ Network errors (1 Retry automatisch)
├─ Timeout (1 Retry automatisch)
└─ Dann: Zeige in Failed List

Manual Retry:
├─ User entscheidet wann
├─ User sieht Details
└─ User kann stornieren
```

### 4. Error Protocol Persistence

```
✅ SAVE:
- Nach jedem Upload
- Nach jedem Retry
- Nach Cancellation

✅ LOAD:
- App Start
- Upload-Seite öffnen

✅ CLEANUP:
- Protocols > 30 Tage alt
- Completed Uploads optional
```

## Complete Implementation Example

```typescript
// In app-upload.tsx

import { UploadErrorTracker, getAllUploadProtocols } from '../utils/upload-error-tracking';

export default function AppUpload() {
  const [failedProtocols, setFailedProtocols] = useState<UploadProtocol[]>([]);
  const [retryingStack, setRetryingStack] = useState<string | null>(null);

  // Load failed uploads on mount
  useEffect(() => {
    const protocols = getAllUploadProtocols();
    const failed = protocols.filter(p => 
      p.status === 'failed' || p.status === 'partial'
    );
    setFailedProtocols(failed);
  }, []);

  // Retry stack handler
  const handleRetryStack = async (protocol: UploadProtocol, stackId: string) => {
    const stack = protocol.stacks.find(s => s.stackId === stackId);
    if (!stack) return;

    setRetryingStack(stackId);
    toast.info(`🔄 Wiederhole Upload für ${stack.stackName}...`);

    try {
      const tracker = new UploadErrorTracker(/* ... */);
      
      const result = await tracker.retryStack(
        stackId,
        async (item) => {
          // Actual upload logic
          return await uploadFile(item.file);
        },
        (current, total, item) => {
          toast.info(`Wiederhole ${item.fileName}... (${current}/${total})`);
        }
      );

      if (result.success) {
        toast.success(`✅ ${stack.stackName} erfolgreich hochgeladen!`);
        // Remove from failed list
        setFailedProtocols(prev => prev.filter(p => p.uploadId !== protocol.uploadId));
      } else {
        toast.error(`❌ ${result.failed} Dateien konnten nicht hochgeladen werden`);
      }
    } catch (error) {
      toast.error('Retry fehlgeschlagen');
    } finally {
      setRetryingStack(null);
    }
  };

  // Cancel stack handler
  const handleCancelStack = (protocol: UploadProtocol, stackId: string) => {
    const stack = protocol.stacks.find(s => s.stackId === stackId);
    if (!stack) return;

    if (confirm(`Stapel "${stack.stackName}" stornieren?\n\nEinzelne Bilder können nicht storniert werden.`)) {
      const tracker = new UploadErrorTracker(/* ... */);
      tracker.cancelStack(stackId);
      tracker.saveToLocalStorage();

      toast.success(`Stapel "${stack.stackName}" wurde storniert`);
      
      // Update UI
      setFailedProtocols(prev => 
        prev.map(p => p.uploadId === protocol.uploadId ? tracker.getProtocol() : p)
      );
    }
  };

  return (
    // ... UI with failed uploads section
  );
}
```

## Zusammenfassung

Das Upload Error & Retry System bietet:

✅ **Vollständiges Error-Tracking** - Jeder Fehler wird erfasst  
✅ **Stack-Level Retry** - Automatisches Nachfordern fehlgeschlagener Dateien  
✅ **Stack-Level Cancellation** - Nur komplette Stapel stornierbar  
✅ **Exponential Backoff** - Intelligente Retry-Strategie  
✅ **Persistent Storage** - Fehler überleben App-Restart  
✅ **User-Friendly UI** - Klare Fehleranzeige & einfache Bedienung  
✅ **Detailed Reporting** - Umfassende Error-Protokolle  

**Resultat:** Robustes Upload-System das mit Fehlern umgehen kann und dem User volle Kontrolle gibt! 🔄✨

---
*Dokumentation: Upload Error Protocol & Retry System - 05.11.2025*
