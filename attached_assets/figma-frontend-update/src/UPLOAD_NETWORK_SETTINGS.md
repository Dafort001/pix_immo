# 📡 Upload Network Settings & WLAN-First Strategy

## Überblick

Das PIX.IMMO Upload-System implementiert eine **WLAN-First Strategy** mit optionalem Mobile-Fallback, um große HDR-Dateien effizient und kostenschonend zu übertragen.

## Warum WLAN-First?

### Dateigrößen

**Typische Upload-Größen:**
```
Pro Model (DNG):
├── 1 Stack = 3 Shots à ~28 MB
├── Stack Total = ~84 MB
└── 5 Stacks = ~420 MB ⚠️

Standard Model (JPG):
├── 1 Stack = 5 Shots à ~4 MB
├── Stack Total = ~20 MB
└── 5 Stacks = ~100 MB

Durchschnittlicher Shooting:
├── 15-30 Stacks
├── Pro: 1.2-2.5 GB 🔴
└── Standard: 300-600 MB 🟡
```

### Mobile Datenkosten

```
Deutschland Durchschnitt 2025:
├── 1 GB Mobil: ~€8-12
├── Upload 2 GB: ~€16-24 💸
└── WLAN: Flatrate (€0) ✅

Fotograf-Use-Case:
├── 3 Shootings/Woche
├── 6 GB Upload/Woche
└── €48-72 Mobilkosten/Woche! 😱
```

### User Experience

```
WLAN (100 Mbit/s):
├── 2 GB Upload = ~3 Minuten
└── ✅ Schnell & zuverlässig

4G/LTE (20 Mbit/s):
├── 2 GB Upload = ~15 Minuten
└── ⚠️ Langsamer, aber machbar

3G (1 Mbit/s):
├── 2 GB Upload = ~4 Stunden
└── ❌ Praktisch unmöglich
```

## Upload-Ziel: PIX.IMMO Webapp

### Workflow-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE FLOW                             │
└─────────────────────────────────────────────────────────────┘

📱 iPhone App
   │
   ├─ 📸 Capture (HDR Bracketing)
   ├─ 🏷️ Room Assignment
   ├─ ✅ Stack Selection
   │
   └─ ☁️ UPLOAD
       │
       ↓ HTTPS/Supabase Storage
       │
🌐 PIX.IMMO Webapp (pix-immo.de)
   │
   ├─ 📦 Receive & Store
   ├─ 📧 Notify Processing Team
   ├─ 🎯 Job Assignment
   │
   └─ 🔄 Forward to Processing
       │
       ↓
       │
👨‍🎨 Processing Team
   │
   ├─ 💻 Download Stacks
   ├─ 🎨 HDR Merge & Edit
   ├─ ✅ QC
   │
   └─ 📤 Upload Finals
       │
       ↓
       │
🌐 PIX.IMMO Webapp
   │
   └─ 📧 Client Delivery
```

**Warum nicht direkt an Processing Team?**

```
❌ Direkt an Processing Team:
   - Keine zentrale Datenhaltung
   - Kein Backup
   - Keine Web-Übersicht
   - Kompliziertes Access Management
   - Keine Client-Schnittstelle

✅ Via Webapp (Supabase):
   - Zentrale Datenhaltung
   - Automatisches Backup
   - Web-Interface für Fotografen
   - Web-Interface für Processing Team
   - Web-Interface für Clients
   - Einfaches Access Management
   - Audit Trail
```

## Network Settings

### 1. WLAN-Only Mode (Default)

**Aktiviert:**
```
Settings → Upload → "Nur über WLAN"
└─ ✅ ON (Default)

Verhalten:
├─ Upload startet NUR bei WLAN
├─ Bei Mobilnetz → Warning Modal
└─ User kann Override wählen
```

**Deaktiviert:**
```
Settings → Upload → "Nur über WLAN"
└─ ❌ OFF

Verhalten:
├─ Upload startet bei WLAN UND Mobil
├─ Keine Warnung
└─ User trägt Verantwortung
```

### 2. Auto-Upload Mode

**Aktiviert:**
```
Settings → Upload → "Automatischer Upload"
└─ ✅ ON

Verhalten:
├─ Nach jedem Shooting-Stack
├─ Automatisch zur Upload-Queue
├─ Bei WLAN: Sofort hochladen
└─ Bei Mobil: Warten auf WLAN (wenn WLAN-Only)
```

**Deaktiviert (Default):**
```
Settings → Upload → "Automatischer Upload"
└─ ❌ OFF (Default)

Verhalten:
├─ Manueller Upload via Gallery
├─ User wählt Stacks aus
├─ User startet Upload explizit
└─ Volle Kontrolle
```

## Network Detection

### Implementation

**Network Information API:**
```typescript
const checkNetworkType = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const type = connection?.effectiveType || connection?.type;
    
    // Network Types:
    // - 'wifi' = WiFi
    // - '4g' = 4G/LTE (fast, treat as WiFi-like)
    // - '3g' = 3G (slow)
    // - '2g', 'slow-2g' = Very slow
    
    const isWifi = ['wifi', '4g'].includes(type);
    setIsWifi(isWifi);
  }
};

// Listen to network changes
connection.addEventListener('change', checkNetworkType);
```

**Bravostudio Production:**
```javascript
// Native iOS Network Check
// Use: Capacitor Network Plugin
import { Network } from '@capacitor/network';

const checkNetwork = async () => {
  const status = await Network.getStatus();
  
  // status.connectionType:
  // - 'wifi' = WiFi
  // - 'cellular' = Mobile
  // - 'none' = Offline
  
  setIsWifi(status.connectionType === 'wifi');
  setIsOnline(status.connected);
};

// Listen to changes
Network.addListener('networkStatusChange', (status) => {
  setIsWifi(status.connectionType === 'wifi');
});
```

### Visual Indicators

**Network Status Badge:**
```
┌────────────────────────────┐
│ Upload zur Webapp   [WLAN] │  ← Grün, WiFi icon
└────────────────────────────┘

┌────────────────────────────┐
│ Upload zur Webapp   [Mobil]│  ← Gelb, Signal icon
└────────────────────────────┘

┌────────────────────────────┐
│ Upload zur Webapp [Offline]│  ← Rot, No-WiFi icon
└────────────────────────────┘
```

**Colors:**
- 🟢 WLAN: Green (#64BF49)
- 🟡 Mobil: Yellow (#C9B55A)
- 🔴 Offline: Red (#C94B38)

## Upload Flow mit Network Check

### Normal Flow (WLAN verfügbar)

```
1. User wählt Stacks in Gallery
   ↓
2. Navigiert zu Upload-Seite
   ↓
3. Sieht [WLAN] Badge (grün)
   ↓
4. Füllt Formular aus:
   - Immobilienadresse
   - Notizen
   ↓
5. Klickt "Jetzt hochladen"
   ↓
6. Upload startet sofort
   ↓
7. Progress: 0% → 100%
   ↓
8. Success Toast
   ↓
9. Return to Gallery
```

### Mobile Network Flow (WLAN-Only aktiviert)

```
1. User wählt Stacks in Gallery
   ↓
2. Navigiert zu Upload-Seite
   ↓
3. Sieht [Mobil] Badge (gelb)
   ↓
4. Füllt Formular aus
   ↓
5. Klickt "Jetzt hochladen"
   ↓
6. ⚠️ Network Warning Modal:
   │
   ├─ "Keine WLAN-Verbindung"
   ├─ "Große Dateien (420 MB) sollten..."
   │
   └─ 3 Optionen:
       │
       ├─ [Zu Einstellungen] → Settings
       │
       ├─ [Trotzdem hochladen] → Upload + disable WLAN-only
       │
       └─ [Abbrechen] → Close modal
```

### Warning Modal

**UI:**
```
┌──────────────────────────────┐
│                              │
│         🚫 WiFi Icon         │
│                              │
│  Keine WLAN-Verbindung       │
│                              │
│  Sie haben "Nur über WLAN"   │
│  aktiviert. Große Dateien    │
│  (420 MB) sollten über WLAN  │
│  hochgeladen werden.         │
│                              │
│  [Zu Einstellungen]          │  ← Blau, Primary
│  [Trotzdem hochladen]        │  ← Gelb, Warning
│  [Abbrechen]                 │  ← Grau, Text
│                              │
└──────────────────────────────┘
```

**Code:**
```typescript
const handleUpload = async () => {
  // Validation
  if (uploadStacks.length === 0) {
    toast.error('Keine Stapel ausgewählt');
    return;
  }
  
  if (!propertyAddress.trim()) {
    toast.error('Immobilienadresse erforderlich');
    return;
  }
  
  // Network Check
  if (wifiOnlyEnabled && !isWifi) {
    setShowNetworkWarning(true);
    return;
  }
  
  // Start Upload
  performUpload();
};

// Network Warning Modal Actions
const handleOverride = () => {
  // Disable WLAN-only temporarily
  setWifiOnlyEnabled(false);
  localStorage.setItem('pix_upload_wifi_only', 'false');
  
  // Show success
  toast.success('Upload über Mobilnetz erlaubt');
  
  // Close modal
  setShowNetworkWarning(false);
  
  // Retry upload
  handleUpload();
};
```

## Upload zu Webapp (Supabase)

### Supabase Storage Buckets

**Bucket Structure:**
```
pix-immo-storage/
├── raw-captures/           ← App uploads hier
│   ├── {jobId}/
│   │   ├── {stackId}/
│   │   │   ├── photo_1.dng
│   │   │   ├── photo_2.dng
│   │   │   ├── photo_3.dng
│   │   │   └── metadata.json
│   │   └── ...
│   └── ...
│
├── processed-images/       ← Processing Team uploads hier
│   ├── {jobId}/
│   │   ├── final/
│   │   │   ├── wohnzimmer_01.jpg
│   │   │   ├── kueche_01.jpg
│   │   │   └── ...
│   │   └── thumbnails/
│   └── ...
│
└── client-delivery/        ← Client downloads hier
    ├── {clientId}/
    │   ├── {propertyId}/
    │   │   └── ...
    │   └── ...
    └── ...
```

### Upload Implementation

**Basic Upload:**
```typescript
const performUpload = async () => {
  setUploading(true);
  setUploadProgress(0);
  
  const jobId = `job_${Date.now()}`;
  const totalFiles = uploadStacks.reduce((acc, s) => acc + s.shots.length, 0);
  let uploadedFiles = 0;
  
  // Upload each stack
  for (const stack of uploadStacks) {
    // Upload each shot in stack
    for (const shot of stack.shots) {
      const filePath = `${jobId}/${stack.stackId}/${shot.id}.${shot.fileFormat.toLowerCase()}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('raw-captures')
        .upload(filePath, shot.file, {
          cacheControl: '3600',
          contentType: shot.fileFormat === 'DNG' 
            ? 'image/x-adobe-dng' 
            : 'image/jpeg'
        });
      
      if (error) {
        console.error('Upload error:', error);
        toast.error(`Fehler beim Upload: ${shot.id}`);
        continue;
      }
      
      uploadedFiles++;
      setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100));
    }
    
    // Upload metadata
    await uploadStackMetadata(jobId, stack);
  }
  
  // Create job record
  await createJobRecord(jobId);
  
  // Success
  setUploading(false);
  toast.success('Upload erfolgreich!');
  
  // Return to gallery
  setTimeout(() => {
    setLocation('/app/gallery');
  }, 1500);
};
```

**With Progress Tracking:**
```typescript
interface UploadTask {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

// Visual Progress per File
{uploadTasks.map(task => (
  <div key={task.fileId}>
    <span>{task.fileName}</span>
    <ProgressBar value={task.progress} />
    <StatusIcon status={task.status} />
  </div>
))}
```

### Job Record in Database

```sql
-- Create job in processing_jobs table
INSERT INTO processing_jobs (
  id,
  photographer_id,
  property_address,
  notes,
  status,
  stacks,
  total_photos,
  total_size_mb,
  upload_network_type,
  created_at
) VALUES (
  'job_20251105_143022',
  'user_123',
  'Elbchaussee 42, 22763 Hamburg',
  'Besonders helle Räume',
  'uploaded',
  '[...]', -- JSON with stack info
  8,
  420.5,
  'wifi', -- 'wifi' or 'cellular'
  NOW()
);
```

## Network Optimization

### Chunked Upload

**For large files:**
```typescript
const uploadLargeFile = async (file: File, filePath: string) => {
  const chunkSize = 5 * 1024 * 1024; // 5 MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    await supabase.storage
      .from('raw-captures')
      .upload(`${filePath}.part${i}`, chunk, {
        // Resumable upload
      });
    
    setUploadProgress(Math.round((i + 1) / chunks * 100));
  }
  
  // Merge chunks on server (via Edge Function)
  await supabase.functions.invoke('merge-upload-chunks', {
    body: { filePath, chunks }
  });
};
```

### Compression

**Before upload (optional):**
```typescript
// For JPGs only (DNGs should not be compressed)
const compressImage = async (file: File): Promise<File> => {
  if (file.type !== 'image/jpeg') return file;
  
  // Use browser image compression
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = await createImageBitmap(file);
  
  canvas.width = img.width;
  canvas.height = img.height;
  ctx?.drawImage(img, 0, 0);
  
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      'image/jpeg',
      0.9 // 90% quality
    );
  });
  
  return new File([blob], file.name, { type: 'image/jpeg' });
};
```

### Background Upload

**iOS Background Upload (Bravostudio):**
```typescript
// Use Capacitor Background Task
import { BackgroundTask } from '@capacitor/background-task';

const uploadInBackground = async () => {
  let taskId = await BackgroundTask.beforeExit(async () => {
    // Perform upload
    await performUpload();
    
    // Finish task
    BackgroundTask.finish({ taskId });
  });
};

// Start background upload
if (autoUploadEnabled) {
  uploadInBackground();
}
```

## Error Handling

### Network Errors

```typescript
const handleUploadError = (error: any) => {
  if (error.message.includes('network')) {
    toast.error('Netzwerkfehler. Bitte Verbindung prüfen.');
    
    // Retry option
    setTimeout(() => {
      toast.info('Upload wird automatisch fortgesetzt...', {
        action: {
          label: 'Abbrechen',
          onClick: () => cancelUpload()
        }
      });
    }, 3000);
  } else if (error.message.includes('storage')) {
    toast.error('Speicherfehler. Bitte später erneut versuchen.');
  } else {
    toast.error('Upload fehlgeschlagen.');
  }
};
```

### Offline Mode

```typescript
// Detect offline
window.addEventListener('offline', () => {
  if (uploading) {
    pauseUpload();
    toast.warning('Verbindung verloren. Upload pausiert.');
  }
});

// Detect back online
window.addEventListener('online', () => {
  if (uploadPaused) {
    resumeUpload();
    toast.success('Verbindung wiederhergestellt. Upload fortgesetzt.');
  }
});
```

### Retry Logic

```typescript
const uploadWithRetry = async (
  file: File,
  path: string,
  maxRetries = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.storage
        .from('raw-captures')
        .upload(path, file);
      
      if (!error) return data;
      
      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, attempt * 1000)
        );
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
  
  throw new Error('Upload failed after retries');
};
```

## Best Practices

### User Guidelines

**Recommended Workflow:**
```
1. ✅ Shooting vor Ort mit App
2. ✅ Review & Room Assignment vor Ort
3. ❌ NICHT upload über Mobil (wenn möglich)
4. ✅ Zurück im Office/Hotel
5. ✅ WLAN verbinden
6. ✅ Upload starten
7. ✅ Während Upload: Nächsten Job vorbereiten
```

**When to use Mobile Upload:**
```
✅ Dringende Uploads
✅ Kleine Jobs (<100 MB)
✅ Gute LTE-Abdeckung
✅ Unlimited Mobile Data Plan

❌ Routine-Uploads
❌ Große Jobs (>500 MB)
❌ Schlechte Netzabdeckung
❌ Begrenztes Datenvolumen
```

### Performance Tips

**App-Side:**
- ✅ Compress JPGs before upload (DNGs not!)
- ✅ Upload during idle time
- ✅ Use chunked upload for large files
- ✅ Implement resume capability
- ✅ Show detailed progress

**Server-Side:**
- ✅ Use CDN for faster uploads
- ✅ Implement multipart upload
- ✅ Process files asynchronously
- ✅ Send upload confirmation
- ✅ Auto-cleanup failed uploads

## Analytics & Monitoring

### Track Upload Metrics

```typescript
// Track upload performance
const trackUpload = (metrics: {
  jobId: string;
  totalSize: number;
  totalFiles: number;
  duration: number;
  networkType: 'wifi' | 'cellular';
  success: boolean;
}) => {
  // Send to analytics
  analytics.track('upload_completed', metrics);
  
  // Store in database for optimization
  supabase
    .from('upload_metrics')
    .insert({
      ...metrics,
      upload_speed: metrics.totalSize / metrics.duration,
      timestamp: new Date().toISOString()
    });
};
```

### Dashboard Insights

```
Upload Statistics (Last 30 Days):
├── Total Uploads: 245
├── Success Rate: 98.2%
├── Average Size: 380 MB
├── Average Duration: 4.2 min
│
├── By Network Type:
│   ├── WiFi: 89% (218 uploads)
│   └── Mobile: 11% (27 uploads)
│
├── Failed Uploads:
│   ├── Network Error: 3
│   ├── Timeout: 1
│   └── Storage Error: 0
│
└── Peak Upload Times:
    ├── 18:00-20:00 (Evening)
    └── 12:00-14:00 (Lunch)
```

## Zusammenfassung

Das Upload-System bietet:

✅ **WLAN-First Strategy** für kosteneffiziente Uploads  
✅ **Mobile Fallback** für dringende Fälle  
✅ **Network Detection** mit Visual Feedback  
✅ **Warning System** bei Mobilnetz-Upload  
✅ **Flexible Settings** (WLAN-only, Auto-Upload)  
✅ **Upload zur Webapp** (nicht direkt Processing)  
✅ **Progress Tracking** mit detailliertem Status  
✅ **Error Handling** mit Retry-Logic  
✅ **Background Upload** Support  

**Resultat:** Effiziente, kostenschonende und zuverlässige Uploads! 📡✨

---
*Dokumentation: Upload Network Settings - 05.11.2025*
