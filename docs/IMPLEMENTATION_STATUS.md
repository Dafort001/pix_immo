# PIX.IMMO - Implementation Status

**Last Updated**: 2025-01-09  
**Version**: Alpha (Pre-Staging)  
**Author**: Development Team

---

## Executive Summary

PIX.IMMO ist eine Dual-SPA-Plattform für professionelle Immobilienfotografie:
- **pix.immo** (`/`): Professional Portal (Orders-System)
- **pixcapture.app** (`/pixcapture`): DIY Mobile App (Jobs-System)

**Aktueller Stand**:
- ✅ Backend: ~90% vollständig (Core APIs + Security P0 Features komplett)
- ⚠️ Frontend: ~70% vollständig (Pages existieren, teilweise Mock-Daten)
- ✅ Security (P0): 100% implementiert (Download-Auth + Rate-Limiting + CORS Hardening)
- 🚧 Selection Flow: Backend fertig, Frontend teilweise, E2E-Tests blockiert

**P0 Security Features** (✅ FERTIG - Nov 13, 2025):
1. ✅ Download-Autorisierung (Owner/Admin + selectionState validation)
2. ✅ Rate-Limiting (Auth 5/15min, Global 60/min, Upload 30/min)
3. ✅ CORS Hardening (Strikte Allowlist, keine Wildcards)

**P1 Remaining**:
4. ⚠️ Audit-Logs Schema fertig, Emission fehlt → Compliance-Lücke

---

## 1. Aktueller Backend-Stand

### 1.1 API-Endpunkte Übersicht

#### Authentication & Users
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/register` | POST | ✅ Complete | User-Registrierung (Email + Password) |
| `/api/login` | POST | ✅ Complete | Session-basiertes Login |
| `/api/logout` | POST | ✅ Complete | Session-Invalidierung |
| `/api/user` | GET | ✅ Complete | Aktueller User (session-based) |
| `/api/password-reset/request` | POST | ✅ Complete | Password-Reset-Token anfordern |
| `/api/password-reset/verify` | POST | ✅ Complete | Token validieren |
| `/api/password-reset/reset` | POST | ✅ Complete | Passwort zurücksetzen |

**Status**: ✅ **Vollständig implementiert**  
**Security**: HTTP-only cookies, Scrypt hashing, rate-limiting FEHLT

---

#### Jobs System (DIY - PixCapture App)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/jobs` | GET | ✅ Complete | Alle Jobs des Users |
| `/api/jobs` | POST | ✅ Complete | Neuen Job erstellen |
| `/api/jobs/:id` | GET | ✅ Complete | Job-Details |
| `/api/jobs/:id` | PATCH | ✅ Complete | Job-Status updaten |
| `/api/jobs/:id` | DELETE | ✅ Complete | Job löschen |
| `/api/jobs/:id/upload-intent` | POST | ✅ Complete | R2-Upload-Intent für RAW-Dateien |
| `/api/jobs/:id/finalize-upload` | POST | ✅ Complete | Upload-Finalisierung |
| `/api/jobs/:id/gallery` | GET | ⚠️ Partial | Job-Galerie (KEINE Auth-Filterung!) |
| `/api/jobs/:id/images` | GET | ⚠️ Partial | Alias für /gallery |
| `/api/jobs/:id/select-image` | POST | ⚠️ Partial | Bildauswahl (Package-Limit-Check) |
| `/api/jobs/:id/download-zip` | GET | ✅ Complete | ZIP-Download (P0 Security: Owner/Admin + selectionState) |
| `/api/jobs/:id/demo-process` | POST | ✅ Complete | Demo AI-Processing trigger |
| `/api/jobs/:id/shoots` | GET | ✅ Complete | Alle Shoots für Job |
| `/api/jobs/:id/stacks` | GET | ✅ Complete | Photo-Stacks (HDR-Gruppen) |
| `/api/jobs/:id/classify-image` | POST | ✅ Complete | Einzelbild-Raumtyp-Klassifikation |
| `/api/jobs/:id/bulk-classify` | POST | ✅ Complete | Batch-Klassifikation |
| `/api/jobs/:id/assign-room-type` | POST | ✅ Complete | Manuelle Raumtyp-Zuweisung |

**Status**: ✅ **Vollständig implementiert**
- ✅ CRUD-Operationen vollständig
- ✅ Upload-Flow funktionsfähig
- ✅ Photo-Stack-Management
- ✅ **Download-Autorisierung** (P0: Owner/Admin + selectionState validation)
- ✅ **Rate-Limiting** (P0: Auth 5/15min, Global 60/min, Upload 30/min)

---

#### Orders System (Professional - pix.immo Portal)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/orders` | GET | ✅ Complete | Alle Orders des Users |
| `/api/orders` | POST | ✅ Complete | Neue Order erstellen |
| `/api/orders/:id` | GET | ✅ Complete | Order-Details |
| `/api/orders/:id` | PATCH | ✅ Complete | Order-Status updaten |
| `/api/orders/:id` | DELETE | ✅ Complete | Order löschen |

**Status**: ✅ **Vollständig implementiert**  
**Note**: Weniger Features als Jobs-System (einfachere Workflows)

---

#### Upload System (Manifest-Based)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/upload-manifest/sessions` | POST | ✅ Complete | Upload-Session erstellen |
| `/api/upload-manifest/sessions/:id` | GET | ✅ Complete | Session-Status abrufen |
| `/api/upload-manifest/sessions/:id/items/:itemId/upload` | POST | ✅ Complete | Datei hochladen (multipart) |
| `/api/upload-manifest/sessions/:id/complete` | POST | ✅ Complete | Session abschließen |

**Status**: ✅ **Vollständig implementiert**  
**Flow**:
1. Client erstellt Session mit File-Manifest
2. Client uploaded Dateien einzeln (mit Retry-Logik)
3. Client finalisiert Session → Backend validiert Checksums
4. Session-State: `pending` → `in_progress` → `complete` / `error`

**Security**: ❌ Rate-Limiting fehlt (DoS-Risiko bei Spam-Uploads)

---

#### Order Files Management (PixCapture Web Uploader)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/order-files` | GET | ✅ Complete | Dateien für Order listen |
| `/api/order-files/:id` | GET | ✅ Complete | Einzelne Datei-Details |
| `/api/order-files/:id/download` | GET | ✅ Complete | Datei-Download → Deprecated, use `/api/uploaded-files/:id/download` (P0 Security) |
| `/api/order-files/bulk-mark` | POST | ✅ Complete | Mehrere Dateien markieren |
| `/api/order-files/bulk-delete` | POST | ✅ Complete | Mehrere Dateien löschen |
| `/api/order-files/:id/note` | POST | ✅ Complete | Notiz zu Datei hinzufügen |
| `/api/order-files/:id/notes` | GET | ✅ Complete | Alle Notizen für Datei |

**Status**: ✅ **Vollständig implementiert**
- ✅ File-Management-Funktionen
- ✅ **Download-Autorisierung** (P0: New endpoint `/api/uploaded-files/:id/download`)

---

#### Gallery System (Image Selection & Package Management)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/gallery/:jobId/images` | GET | ✅ Complete | Galerie-Bilder mit Selection-State |
| `/api/gallery/:jobId/selection` | POST | ✅ Complete | Bildauswahl (Package-Limit-Enforcement) |
| `/api/gallery/:jobId/stats` | GET | ✅ Complete | Auswahl-Statistiken |
| `/api/gallery/:jobId/favorites` | GET | ✅ Complete | Favorisierte Bilder |
| `/api/gallery/:jobId/favorites` | POST | ✅ Complete | Bild favorisieren |
| `/api/gallery/:jobId/comments` | GET | ✅ Complete | Kommentare zu Bildern |
| `/api/gallery/:jobId/comments` | POST | ✅ Complete | Kommentar hinzufügen |

**Status**: ✅ **Vollständig implementiert**  
**Features**:
- ✅ Package-Limit-Enforcement (included_images, maxSelectable)
- ✅ Kulanz-Override (allImagesIncluded)
- ✅ Selection-States (none, included, extra_pending, extra_paid, extra_free, blocked)
- ✅ Favoriten & Kommentare

---

#### Download Authorization (P0 Security)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/files/:id/preview` | GET | ✅ Complete | Presigned preview URL (P0: Owner/Admin + selectionState, 5min expiry) |
| `/api/jobs/:id/download-zip` | GET | ✅ Complete | ZIP-Download selected files (P0: Owner/Admin + selectionState) |
| `/api/uploaded-files/:id/download` | GET | ✅ Complete | Presigned download URL (P0: Owner/Admin + selectionState, 5min expiry) |

**Status**: ✅ **Vollständig implementiert** (P0-1)  
**Security Guards**:
- ✅ `assertJobAccessOrThrow` (Owner OR Admin)
- ✅ `assertFileDownloadableOrThrow` (selectionState ∈ {included, extra_paid, extra_free})
- ✅ Presigned URLs mit 5-Minuten-Ablauf (R2)
- ✅ Defense-in-depth (Route + Storage Layer validation)

---

#### Edit Workflow (Image Processing Queue)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/orders/:id/submit-edits` | POST | ✅ Complete | Edit-Jobs erstellen (File-Locking) |
| `/api/orders/:id/status` | GET | ✅ Complete | Edit-Queue-Status |

**Status**: ✅ **Vollständig implementiert**  
**Background Worker**: Cron-basiert (2-Min-Interval), Sharp-Processing

---

#### Editor Management (Admin-Only)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/admin/editors` | GET | ✅ Complete | Alle Editoren auflisten |
| `/api/admin/editors/:id` | GET | ✅ Complete | Editor-Details |
| `/api/admin/editors/:id` | PUT | ✅ Complete | Editor aktualisieren |
| `/api/admin/shoots/:id/assign-editor` | POST | ✅ Complete | Editor zu Shoot zuweisen |
| `/api/admin/shoots/:id/unassign-editor` | POST | ✅ Complete | Editor-Zuweisung entfernen |

**Status**: ✅ **Vollständig implementiert**

---

#### AI Tools (Replicate Integration)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/ai-tools` | GET | ✅ Complete | Verfügbare AI-Tools auflisten |
| `/api/ai-tools/:id` | GET | ✅ Complete | Tool-Details |
| `/api/ai-tools/:id/run` | POST | ✅ Complete | AI-Tool ausführen |

**Status**: ✅ **Vollständig implementiert**  
**Supported Tools**: Upscaling, Denoise, Background Removal, Sky Enhancement

---

#### Media Library (Admin CMS)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/media-library` | GET | ✅ Complete | Media-Dateien auflisten |
| `/api/media-library` | POST | ✅ Complete | Media hochladen |
| `/api/media-library/:id` | DELETE | ✅ Complete | Media löschen |

**Status**: ✅ **Vollständig implementiert**

---

#### Blog, Services, Bookings (CMS)
| Route | Method | Status | Zweck |
|-------|--------|--------|-------|
| `/api/blog-posts` | GET/POST | ✅ Complete | Blog CRUD |
| `/api/services` | GET/POST | ✅ Complete | Service Catalog CRUD |
| `/api/bookings` | GET/POST | ✅ Complete | Bookings CRUD |
| `/api/invoices` | GET/POST | ✅ Complete | Invoice Generation |

**Status**: ✅ **Vollständig implementiert**

---

### 1.2 Upload-Endpunkte Details

#### Upload-Session-Flow (Manifest-Based)

**Status-Enum**:
```typescript
enum UploadSessionState {
  pending      // Session erstellt, keine Uploads
  in_progress  // Mindestens 1 Upload läuft
  complete     // Alle Items uploaded + verified
  error        // Upload-Fehler
  stale        // >24h ohne Activity
}
```

**Item-Status-Enum**:
```typescript
enum UploadItemStatus {
  pending      // Wartet auf Upload
  uploading    // Upload läuft
  uploaded     // Upload fertig, Checksum pending
  verified     // Checksum OK
  failed       // Upload-Fehler (max 3 retries)
}
```

**Finalize-Endpoint**:
- **Route**: `POST /api/upload-manifest/sessions/:id/complete`
- **Status**: ✅ **Vollständig implementiert**
- **Validierung**:
  - Alle Items müssen `verified` sein
  - Checksums werden validiert
  - Session-State → `complete`
- **Fehlerfall**:
  - Fehlende/unvalidierte Items → 400 Error
  - Session-State → `error`

---

### 1.3 Fehlende/Unvollständige Endpunkte

#### ❌ **Kritisch: Download-Autorisierung**
**Betroffene Endpunkte**:
- `GET /api/jobs/:id/download-zip` - Kein selection_state-Check
- `GET /api/order-files/:id/download` - Kein Job-Ownership-Check
- `GET /api/files/:id/preview` - Kein Auth-Check
- Presigned URL Generation in `r2-client.ts` - Keine Auth vor Signierung

**Risiko**: Kunden könnten alle Bilder downloaden (inkl. blocked/extra_pending)

---

#### ❌ **Kritisch: Rate-Limiting**
**Fehlende Limits**:
- Login-Endpunkte (Brute-Force-anfällig)
- Upload-Endpunkte (DoS-Risiko)
- Password-Reset (Token-Flooding)

**Status**: `express-rate-limit` installiert, NICHT konfiguriert

---

#### ❌ **Audit-Log-Emission**
**Status**: Schema fertig, Emission fehlt komplett
- Keine Logs bei `included_images`-Änderungen
- Keine Logs bei `allImagesIncluded`-Toggle
- Keine Logs bei `selection_state → extra_free`

---

## 2. Aktueller Frontend-Stand

### 2.1 Seiten-Übersicht

#### ✅ **Vollständig (echte Backend-Daten)**

| Datei | Zweck | Status | Notizen |
|-------|-------|--------|---------|
| `home.tsx` | Landing Page | ✅ Complete | Static Content |
| `login.tsx` | Login-Formular | ✅ Complete | Session-Auth |
| `register.tsx` | Registrierung | ✅ Complete | Email/Password |
| `dashboard.tsx` | User-Dashboard | ✅ Complete | Jobs-Liste |
| `jobs.tsx` | Job-Übersicht | ✅ Complete | TanStack Query |
| `admin-jobs.tsx` | Admin Job-Verwaltung | ✅ Complete | Full CRUD |
| `admin-editor-management.tsx` | Editor-Zuweisungen | ✅ Complete | Drag&Drop |
| `blog.tsx` / `blog-post.tsx` | Blog CMS | ✅ Complete | Markdown-Rendering |
| `pricing.tsx` / `preisliste.tsx` | Preise | ✅ Complete | Static |
| `agb.tsx` / `datenschutz.tsx` | Legal Pages | ✅ Complete | Static |

**Count**: 15 vollständige Seiten

---

#### ⚠️ **Teilweise (teilweise Mock-Daten oder unvollständig)**

| Datei | Zweck | Status | Fehlende Features |
|-------|-------|--------|-------------------|
| `portal/gallery-selection.tsx` | Bildauswahl | ⚠️ Partial | ❌ Backend-Anbindung teilweise, E2E-Tests blockiert |
| `portal/gallery-upload.tsx` | Upload-Interface | ⚠️ Partial | ❌ Hook-Order-Bugs fixed, Backend-Tests pending |
| `portal/uploads-overview.tsx` | Upload-Übersicht | ⚠️ Partial | ❌ Mock-Status-Daten |
| `portal/status-timeline.tsx` | Job-Status-Tracker | ⚠️ Partial | ❌ Mock Timeline-Events |
| `portal/payment.tsx` | Zahlungsabwicklung | ⚠️ Partial | ❌ Stripe-Integration unvollständig |
| `portal/delivery.tsx` | Download-Portal | ⚠️ Partial | ❌ Keine Download-Auth (kritisch!) |
| `app/camera.tsx` | PWA-Kamera | ⚠️ Partial | ✅ MediaDevices API, ❌ RAW-Support incomplete |
| `app/gallery.tsx` | PWA-Galerie | ⚠️ Partial | ❌ Offline-Sync incomplete |
| `app/upload.tsx` | PWA-Upload | ⚠️ Partial | ❌ Retry-Logic funktionsfähig, UI-Polish fehlt |
| `demo-jobs.tsx` | Demo-Job-List | ⚠️ Partial | ❌ Mock-Daten |
| `gallery-classify.tsx` | Raum-Klassifikation | ⚠️ Partial | ✅ AI-Integration, ❌ Batch-UI incomplete |
| `admin-bookings.tsx` | Buchungsverwaltung | ⚠️ Partial | ❌ Kalender-Integration fehlt |
| `editor-dashboard.tsx` | Editor-Dashboard | ⚠️ Partial | ❌ File-Download fehlt |

**Count**: 13 teilweise fertige Seiten

---

#### ❌ **Fehlend (existieren als Stub oder TODO)**

| Datei | Zweck | Status | Notizen |
|-------|-------|--------|---------|
| `portal/gallery-editing.tsx` | Bildbearbeitung | ❌ Stub | Edit-Presets UI fehlt |
| `portal/gallery-photographer.tsx` | Fotografen-Ansicht | ❌ Stub | Shoot-Assignment UI fehlt |
| `orders/review.tsx` | Order-Review | ❌ Stub | Approval-Workflow fehlt |
| `qc-quality-check.tsx` | QC-Interface | ❌ Stub | QC-Status-Workflow fehlt |

**Count**: 4+ fehlende Core-Features

---

### 2.2 Mock-Daten vs. Echte Daten

#### **Echte Backend-Daten**:
- ✅ User-Auth (Sessions)
- ✅ Jobs CRUD
- ✅ Upload-Sessions
- ✅ Gallery-Images (teilweise)
- ✅ Blog/Services/Bookings

#### **Mock/Simulation**:
- ❌ Timeline-Events (portal/status-timeline.tsx)
- ❌ Package-Selection-Stats (frontend berechnet lokal)
- ❌ Editor-Assignments (Admin kann zuweisen, Editor sieht nichts)
- ❌ Payment-Status (Stripe-Webhooks fehlen)
- ❌ Download-ZIP-Progress (kein Backend-Streaming)

---

## 3. Datenmodelle (Schema)

### 3.1 Core-Tabellen

#### **users**
```typescript
{
  id: varchar PRIMARY KEY
  email: varchar UNIQUE NOT NULL
  hashedPassword: text NOT NULL  // Scrypt-hashed
  role: varchar NOT NULL DEFAULT 'client'  // 'client' | 'admin'
  credits: bigint DEFAULT 0  // AI-Processing-Credits
  stripeCustomerId: varchar
  createdAt: bigint NOT NULL
}
```

---

#### **jobs** (DIY-System)
```typescript
{
  id: varchar PRIMARY KEY
  localId: varchar UNIQUE  // Client-generierte ULID (Offline-Dedup)
  jobNumber: varchar UNIQUE NOT NULL  // Display-ID (z.B. PIX-1763032963406-XUKVM)
  userId: varchar NOT NULL → users.id
  customerName: varchar  // Kunde/Agentur-Name
  propertyName: varchar NOT NULL
  propertyAddress: text
  addressLat/Lng/PlaceId/Formatted: varchar  // Google Maps verified
  status: varchar DEFAULT 'created'  // 'created', 'uploading', 'processing', 'delivered'
  deadlineAt: bigint
  
  // Package & Selection Logic
  includedImages: integer DEFAULT 20  // Anzahl inkludierter Bilder
  maxSelectable: integer  // Hard-Limit (null = same as includedImages)
  extraPricePerImage: integer  // Cents (z.B. 500 = €5.00)
  allowFreeExtras: boolean DEFAULT true  // Kulanz erlaubt?
  freeExtraQuota: integer  // Max Kulanz-Extras (null = unlimited für Admins)
  allImagesIncluded: boolean DEFAULT false  // Kulanz: Alle Bilder frei
  
  // Delivery Options
  deliverGallery: varchar DEFAULT 'true'
  deliverAlttext: varchar DEFAULT 'true'
  deliverExpose: varchar DEFAULT 'false'
  
  // Editor Assignment
  selectedUserId: varchar  // App-User UUID (localStorage, kein FK)
  selectedUserInitials: varchar  // z.B. "DF"
  selectedUserCode: varchar  // z.B. "K9M2P"
  
  createdAt: bigint NOT NULL
}
```

**Relations**:
- `jobs` ← `shoots` (1:N)
- `jobs` ← `jobShoots` (N:M Mapping-Table)
- `jobs` ← `auditLogs` (1:N, neues Security-Feature)

---

#### **shoots**
```typescript
{
  id: varchar PRIMARY KEY
  shootCode: varchar(5) UNIQUE NOT NULL  // z.B. "AB3KQ"
  jobId: varchar NOT NULL → jobs.id
  status: varchar DEFAULT 'initialized'  // 'uploading', 'intake_complete', 'handoff_generated'
  
  // Editor Assignment
  assignedEditorId: varchar  // Editor-ID aus editor-assignment.ts
  editorAssignedAt: bigint
  editorAssignedBy: varchar → users.id
  
  // Handoff Package
  handoffPackagePath: text  // R2-Path zum ZIP
  handoffToken: text UNIQUE  // Secure Token für Editor-Download
  handoffGeneratedAt: bigint
  
  createdAt: bigint NOT NULL
}
```

**Relations**:
- `shoots` → `jobs` (N:1)
- `shoots` ← `images` (1:N)
- `shoots` ← `stacks` (1:N)

---

#### **images** (DIY-System - Einzelbilder/RAW-Dateien)
```typescript
{
  id: varchar PRIMARY KEY
  shootId: varchar NOT NULL → shoots.id
  stackId: varchar → stacks.id  // HDR-Stack-Zuordnung
  originalFilename: varchar(255) NOT NULL
  renamedFilename: varchar(255)  // Filename v3.1 Pattern
  filePath: text NOT NULL  // R2-Storage-Path (RAW)
  previewPath: text  // R2-Path für 3000px sRGB Preview
  fileSize: bigint
  mimeType: varchar(100)
  
  // EXIF & Metadata
  exifDate: bigint
  exposureValue: varchar(10)  // 'e0', 'e-2', 'e+2'
  positionInStack: bigint
  
  // Naming Policy v3.1
  roomType: varchar(50)  // Klassifizierter Raumtyp (siehe shared/room-types.ts)
  filenamePatternVersion: varchar(10) DEFAULT 'v3.1'
  validatedAt: bigint  // Timestamp der Filename-Validierung
  classifiedAt: bigint  // Timestamp der Raumtyp-Klassifikation
  
  // QC Quality Check
  qcStatus: varchar(20) DEFAULT 'pending'  // 'approved', 'rejected', 'needs-revision'
  qcComment: text
  qcTechnicalIssues: text[]  // Array von Issue-Strings
  qcBy: varchar → users.id
  qcAt: bigint
  
  createdAt: bigint NOT NULL
}
```

**WICHTIG**: `images` Tabelle hat **KEIN** `selectionState`-Feld!  
→ DIY-Captures haben keine Package-Selection-Logik  
→ Für Selection Flow siehe `uploadedFiles` (Orders-System)

---

#### **uploadedFiles** (Orders-System - Web-Portal-Uploads)
```typescript
{
  id: varchar PRIMARY KEY
  userId: varchar NOT NULL → users.id
  orderId: varchar → orders.id
  objectKey: text UNIQUE NOT NULL  // R2-Path
  originalFilename: varchar(255) NOT NULL
  mimeType: varchar(100) NOT NULL
  fileSize: bigint NOT NULL
  checksum: varchar(64)  // SHA256
  
  // Processing Status
  status: varchar DEFAULT 'uploaded'  // 'queued', 'in_progress', 'done', 'failed'
  locked: boolean DEFAULT false  // Edit-Job-Processing-Lock
  
  // Filename Schema v3.1
  roomType: varchar(50) DEFAULT 'undefined_space'
  stackId: varchar(20)  // Stack-Gruppe (z.B. 'g003')
  index: bigint DEFAULT 1  // Position innerhalb room_type
  ver: bigint DEFAULT 1  // Version (für Re-Uploads)
  
  // Package Selection Logic (ORDERS-SYSTEM ONLY!)
  isCandidate: boolean DEFAULT false  // Auswählbar für Package?
  selectionState: selection_state_enum DEFAULT 'none'
  // Enum: 'none', 'included', 'extra_pending', 'extra_paid', 'extra_free', 'blocked'
  
  selectedAt: bigint  // Timestamp der Auswahl
  
  // Edit Workflow
  editJobId: varchar → editJobs.id
  editCompletedAt: bigint
  resultPath: text  // R2-Path zu bearbeitetem Bild
  
  // Annotations
  annotationData: jsonb  // Drawing/Markup-Daten
  marked: boolean DEFAULT false  // User-Markierung
  tags: text[]
  notes: text
  
  createdAt: bigint NOT NULL
}
```

**Relations**:
- `uploadedFiles` → `orders` (N:1)
- `uploadedFiles` ← `editJobs` (1:1)
- `uploadedFiles` ← `auditLogs` (1:N, Security-Feature)

**KRITISCH**: `uploadedFiles.selectionState` ist der **einzige Ort** für Package-Selection!

---

#### **uploadManifestSessions** (Upload-Session-Tracking)
```typescript
{
  id: varchar PRIMARY KEY
  userId: varchar NOT NULL → users.id
  jobId: varchar → jobs.id
  clientType: varchar(50)  // 'pixcapture_ios', 'web_uploader'
  totalFiles: integer NOT NULL
  totalBytes: bigint NOT NULL
  uploadedFiles: integer DEFAULT 0
  uploadedBytes: bigint DEFAULT 0
  state: upload_session_state_enum DEFAULT 'pending'
  // Enum: 'pending', 'in_progress', 'complete', 'error', 'stale'
  errorCount: integer DEFAULT 0
  createdAt: bigint NOT NULL
  lastActivityAt: bigint NOT NULL
  completedAt: bigint
}
```

---

#### **uploadManifestItems** (Einzelne Upload-Items)
```typescript
{
  id: varchar PRIMARY KEY
  sessionId: varchar NOT NULL → uploadManifestSessions.id
  objectKey: text UNIQUE NOT NULL  // R2-Key
  sizeBytes: bigint NOT NULL
  checksum: varchar(64)  // SHA256
  status: upload_item_status_enum DEFAULT 'pending'
  // Enum: 'pending', 'uploading', 'uploaded', 'verified', 'failed'
  errorMessage: text
  retryCount: integer DEFAULT 0  // Max 3
  createdAt: bigint NOT NULL
  uploadedAt: bigint
  verifiedAt: bigint
}
```

**Flow**:
1. Client erstellt Session → `uploadManifestSessions` (state='pending')
2. Für jede Datei: `uploadManifestItems` (status='pending')
3. Upload → Item-Status: `uploading` → `uploaded` → `verified`
4. Session abschließen → Session-State: `complete`

---

#### **editJobs** (Image-Processing-Queue)
```typescript
{
  id: varchar PRIMARY KEY
  fileId: varchar NOT NULL → uploadedFiles.id
  orderId: varchar → orders.id
  userId: varchar NOT NULL → users.id
  status: varchar DEFAULT 'queued'  // 'in_progress', 'done', 'failed'
  express: boolean DEFAULT false
  retryCount: bigint DEFAULT 0  // Max 3
  processingNotes: text
  resultPath: text  // R2-Path (processed/)
  previewPath: text  // R2-Path (preview/)
  resultFileSize: bigint
  createdAt: bigint NOT NULL
  startedAt: bigint
  finishedAt: bigint
  error: text
}
```

**Background Worker**: Cron (2-Min-Interval), Sharp-based processing

---

#### **auditLogs** (Security Feature - NEU!)
```typescript
{
  id: varchar PRIMARY KEY
  timestamp: bigint NOT NULL
  adminUserId: varchar NOT NULL → users.id
  jobId: varchar NOT NULL → jobs.id
  affectedUploadedFileId: varchar → uploadedFiles.id
  affectedLegacyImageId: varchar → images.id
  
  // Action Classification
  entityScope: audit_entity_scope_enum NOT NULL  // 'job', 'uploaded_file', 'legacy_image'
  actionType: audit_action_type_enum NOT NULL
  // Enum: 'update_included_images', 'set_all_images_included', 
  //       'change_selection_state_extra_free', ...
  
  // Change Tracking
  oldValue: jsonb  // Structured diff (before)
  newValue: jsonb  // Structured diff (after)
  
  // Admin Notes
  reason: text
  reasonCode: varchar(50)
  
  // Soft-Delete (24-Month Retention)
  deletedAt: bigint
}
```

**Status**: ✅ Schema fertig, ❌ Emission fehlt komplett

---

### 3.2 Relations-Übersicht

```
users (1) ←→ (N) jobs
users (1) ←→ (N) orders
users (1) ←→ (N) uploadedFiles
users (1) ←→ (N) auditLogs

jobs (1) ←→ (N) shoots
jobs (1) ←→ (N) jobShoots  // N:M Mapping
jobs (1) ←→ (N) auditLogs

shoots (1) ←→ (N) images
shoots (1) ←→ (N) stacks

uploadedFiles (1) ←→ (1) editJobs
uploadedFiles (1) ←→ (N) auditLogs

uploadManifestSessions (1) ←→ (N) uploadManifestItems
```

---

## 4. Logik für Bild-Auswahl & Paketgrößen

### 4.1 Package-Selection-Felder

#### **Job-Level (jobs Tabelle)**
```typescript
includedImages: integer = 20       // Basis-Paket (z.B. 20 Bilder inkludiert)
maxSelectable: integer = null      // Hard-Limit (null = same as includedImages)
extraPricePerImage: integer = 500  // Preis pro Extra-Bild (Cents, z.B. €5.00)
allowFreeExtras: boolean = true    // Kulanz erlaubt?
freeExtraQuota: integer = null     // Max Kulanz-Extras (null = unlimited)
allImagesIncluded: boolean = false // Override: Alle Bilder frei
```

#### **File-Level (uploadedFiles Tabelle)**
```typescript
isCandidate: boolean = false           // Auswählbar?
selectionState: enum = 'none'          // Aktueller Zustand
selectedAt: bigint = null              // Timestamp der Auswahl
```

**Selection-State-Enum**:
```typescript
'none'           // Nicht ausgewählt
'included'       // Im Paket enthalten (zählt gegen includedImages)
'extra_pending'  // Extra gewünscht, nicht bezahlt
'extra_paid'     // Extra bezahlt (€5/Bild)
'extra_free'     // Kulanz-Extra (Admin-granted)
'blocked'        // Admin-blockiert (nicht downloadbar)
```

---

### 4.2 Selection-Logik (Implementiert)

#### **Backend-Funktionen** (`server/storage.ts`)

**getJobSelectionStats(jobId)**:
```typescript
{
  totalCandidates: number      // Anzahl Bilder mit isCandidate=true
  includedCount: number         // selectionState='included'
  extraPendingCount: number     // selectionState='extra_pending'
  extraPaidCount: number        // selectionState='extra_paid'
  extraFreeCount: number        // selectionState='extra_free'
  blockedCount: number          // selectionState='blocked'
  downloadableCount: number     // included + extra_paid + extra_free
}
```

**updateFileSelectionState(fileId, newState)**:
```typescript
// Validierung:
1. File existiert?
2. File.isCandidate = true?
3. Job.allImagesIncluded? → Auto-approve
4. Package-Limit erreicht? → Reject (wenn newState='included')

// Update:
- uploadedFiles.selectionState = newState
- uploadedFiles.selectedAt = Date.now()
```

**getJobCandidateFiles(jobId)**:
```typescript
// ❌ AKTUELL FALSCH IMPLEMENTIERT!
// Momentan: Sucht in `images` Tabelle (DIY-System)
// SOLLTE: Sucht in `uploadedFiles` Tabelle (Orders-System)

// KORREKT:
SELECT * FROM uploaded_files
WHERE order_id = jobId AND is_candidate = true
ORDER BY created_at DESC
```

---

### 4.3 Frontend-Package-UI

**Component**: `portal/gallery-selection.tsx`

**Features**:
- ✅ Package-Status anzeigen ("12 / 20 ausgewählt")
- ✅ Extra-Bilder zählen (3 Extra-Bilder = +€15.00)
- ✅ Kulanz-Badge ("2 Gratis-Extras")
- ✅ Limit-Enforcement (Button disabled bei 20/20)
- ⚠️ **Backend-Anbindung teilweise** (Hook-Order-Bugs fixed, E2E-Tests blockiert)

**UI-States**:
```typescript
// Bild-Card States:
'none'         → Grauer Rahmen, Klickbar
'included'     → Grüner Rahmen, "Im Paket"
'extra_paid'   → Gelber Rahmen, "+€5.00"
'extra_free'   → Blauer Rahmen, "Gratis-Extra"
'blocked'      → Roter Rahmen, "Gesperrt", nicht klickbar
```

---

### 4.4 ZIP-Download-Logik

**Endpoint**: `GET /api/jobs/:id/download-zip`

**❌ AKTUELLER STAND (UNSICHER!)**:
```typescript
// KEINE Filterung nach selection_state!
// Packt ALLE Dateien in ZIP (inkl. blocked/extra_pending)

const files = await storage.getJobCandidateFiles(jobId);
// → Erstellt ZIP mit ALLEN Files
```

**✅ KORREKTE Implementierung (TODO)**:
```typescript
import { filterDownloadableFiles } from './download-auth';

const job = await storage.getJob(jobId);
const allFiles = await storage.getJobCandidateFiles(jobId);

// Filter: Nur downloadable Files
const downloadableFiles = filterDownloadableFiles(allFiles, job);
// → Nur selectionState ∈ {included, extra_paid, extra_free}
//   ODER job.allImagesIncluded = true

// ZIP erstellen nur mit downloadableFiles
```

**Status**: ❌ **NICHT IMPLEMENTIERT** (Sicherheitslücke!)

---

## 5. Sicherheitsfeatures (Stand heute)

### 5.1 ✅ Implementierte Security-Features

#### **Authentication**
- ✅ Session-based Auth (HTTP-only cookies)
- ✅ Scrypt password hashing (N=16384, r=8, p=1)
- ✅ Password-Reset-Flow (Token-based)
- ✅ Role-based access (`client`, `admin`)
- ✅ Session-Middleware (`req.user` injection)

**Files**: `server/auth.ts`, `server/routes.ts` (Session-Middleware)

---

#### **Request Validation**
- ✅ Zod-Schema-Validierung (`validateBody` middleware)
- ✅ UUID-Param-Validierung (`validateUuidParam`)
- ✅ CSRF-Protection (SameSite cookies)

**Files**: `server/routes.ts`

---

#### **Response Sanitization**
- ✅ Stack-Traces nie an Client (Global Error Handler)
- ✅ Generic "Internal Server Error" bei 500
- ✅ Request-ID-Logging für Support

**Files**: `server/routes.ts` (Line 3201-3238)

---

#### **CORS Configuration**
- ⚠️ **Dev**: Wildcards erlaubt (`*` für localhost)
- ❌ **Production**: Noch nicht gehärtet (TODO)

**Current Config**:
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://pix.immo', 'https://pixcapture.app']  // Planned
    : '*',  // ❌ UNSICHER für Production!
  credentials: true
}));
```

**Status**: ⚠️ **Muss vor Staging gehärtet werden**

---

### 5.2 ⚠️ Teilweise Implementierte Features

#### **Audit-Logging**
- ✅ Schema komplett (`auditLogs` Tabelle)
- ✅ Error-Handler loggt `DownloadUnauthorizedError`
- ❌ Emission bei Kulanz-Changes fehlt komplett

**Status**: 30% fertig

---

#### **Download-Authorization**
- ✅ Helper-Functions erstellt (`download-auth.ts`)
- ✅ Error-Classes erstellt (`download-errors.ts`)
- ✅ Error-Handler updated
- ❌ **Endpunkte NICHT gesichert** (kritisch!)

**Betroffene Endpunkte**:
```typescript
❌ GET /api/jobs/:id/download-zip
❌ GET /api/order-files/:id/download
❌ GET /api/files/:id/preview
❌ Presigned URL Generation (r2-client.ts)
```

**Status**: 40% fertig, **NICHT produktionsreif**

---

### 5.3 ❌ Fehlende Security-Features

#### **Rate-Limiting**
**Status**: ❌ **Komplett fehlend**

**Betroffene Endpunkte**:
- Login (`/api/login`) → Brute-Force-anfällig
- Password-Reset (`/api/password-reset/*`) → Token-Flooding
- Upload (`/api/upload-manifest/*`) → DoS-Risiko
- Registration (`/api/register`) → Spam-Accounts

**Risiko**: **HOCH** (Production-Blocker)

---

#### **Input Sanitization**
- ❌ Keine XSS-Protection (HTML-Encoding fehlt)
- ❌ Keine SQL-Injection-Protection (ORM hilft, aber nicht 100%)
- ❌ Keine File-Upload-Validation (MIME-Type-Spoofing möglich)

**Risiko**: **MITTEL**

---

#### **Secrets Management**
- ⚠️ Environment-Vars über Replit-Secrets (OK)
- ❌ Keine Secret-Rotation
- ❌ Secrets im Code-Review sichtbar (z.B. Stripe-Keys)

**Risiko**: **NIEDRIG** (Replit-managed)

---

### 5.4 Download-Berechtigung (Kritischer Punkt)

**Aktueller Stand**: ❌ **NICHT implementiert**

**Was SOLL passieren**:
```typescript
// 1. Job-Zugriff prüfen
if (job.userId !== req.user.id && req.user.role !== 'admin') {
  throw new DownloadUnauthorizedError('Job access denied');
}

// 2. File-Download-Berechtigung prüfen
if (!job.allImagesIncluded) {
  const allowedStates = ['included', 'extra_paid', 'extra_free'];
  if (!allowedStates.includes(file.selectionState)) {
    throw new DownloadUnauthorizedError('File not approved');
  }
}
```

**Was JETZT passiert**:
```typescript
// NICHTS! Jeder kann alles downloaden wenn er Job-ID kennt
```

**Status**: ✅ Helper-Functions fertig, ❌ Integration fehlt

---

## 6. Offene Punkte / Bekannte Lücken

### 6.1 ✅ P0 Security Features (COMPLETED - Nov 13, 2025)

#### ✅ **P0-1: Download-Autorisierung** 
**Status**: IMPLEMENTIERT (Nov 13, 2025)  
**Implementierte Endpoints**:
- ✅ `GET /api/files/:id/preview` (Presigned URL, 5min expiry)
- ✅ `GET /api/jobs/:id/download-zip` (ZIP with selectionState validation)
- ✅ `GET /api/uploaded-files/:id/download` (Presigned URL, 5min expiry)

**Security Guards**:
- ✅ `assertJobAccessOrThrow` (Owner OR Admin)
- ✅ `assertFileDownloadableOrThrow` (selectionState validation)
- ✅ Defense-in-depth (Route + Storage Layer)

**Dokumentation**: `SECURITY_IMPLEMENTATION.md` Section 6

---

#### ✅ **P0-2: Rate-Limiting**
**Status**: IMPLEMENTIERT  
**Konfiguration**:
- ✅ Auth Endpoints: 5 req/15min (brute-force protection)
- ✅ Global API: 60 req/min (production)
- ✅ Upload Endpoints: 30 req/min
- ✅ Abuse Logging: Console.warn after 5x 429 in 10min

**Dokumentation**: `SECURITY_IMPLEMENTATION.md` Section 4

---

#### ✅ **P0-3: CORS Hardening**
**Status**: IMPLEMENTIERT  
**Production Origins** (strikte Allowlist, KEINE Wildcards):
- ✅ `https://pix.immo`
- ✅ `https://www.pix.immo`
- ✅ `https://pixcapture.app`

**Dokumentation**: `SECURITY_IMPLEMENTATION.md` Section 1

---

### 6.2 Wichtige Features (Staging-Blocker)

#### ⚠️ **P1: Audit-Log-Emission fehlt**
**Problem**: Keine Logs bei Kulanz-Changes  
**Impact**: Compliance-Lücke, keine Nachvollziehbarkeit  
**ETA**: 1 Tag

---

#### ⚠️ **P1: Admin-UI für Audit-Logs fehlt**
**Problem**: Logs existieren, aber nicht abfragbar  
**Impact**: Admins können Kulanz-Missbrauch nicht nachvollziehen  
**ETA**: 2 Tage

---

#### ⚠️ **P1: E2E-Tests blockiert (Selection Flow)**
**Problem**: `getJobCandidateFiles` sucht in falscher Tabelle (`images` statt `uploadedFiles`)  
**Impact**: Selection-Flow nicht testbar  
**ETA**: 2 Stunden (Quick-Fix)

---

### 6.3 Abweichungen von Anforderungen

#### **User-Request**: "Selection Flow E2E-Tests vor Upload-Security"
**Status**: ❌ Tests blockiert (Schema-Mismatch)  
**Architect-Entscheidung**: Selection Flow = Orders-System (`uploadedFiles`), NICHT Jobs (`images`)  
**Action**: Fix `getJobCandidateFiles` + `getJobSelectionStats`

---

#### **User-Request**: "Drei Sicherheits-Erweiterungen VOR Staging"
**Status**: 
1. Download-Auth: 40% (Helper fertig, Endpunkte fehlen)
2. Rate-Limiting: 0% (komplett fehlt)
3. Audit-Logs: 60% (Schema + Error-Handler fertig, Emission fehlt)

**Timeline**: 3-4 Tage für alle drei Punkte

---

### 6.4 Technische Schulden

#### **Schema-Inkonsistenzen**
- ❌ `images` vs `uploadedFiles`: Zwei Systeme, verwirrende Naming
- ❌ `selectionState` nur in `uploadedFiles`, NICHT in `images`
- ❌ `isCandidate` nur in `uploadedFiles`

**Impact**: Code-Verwirrung, falsche Tabellen-Queries

---

#### **Frontend Mock-Daten**
- ❌ Status-Timeline simuliert Events
- ❌ Package-Stats teilweise lokal berechnet
- ❌ Payment-Status nicht mit Stripe synchronisiert

**Impact**: UI zeigt ungenaue Daten

---

#### **Missing Tests**
- ❌ Keine Unit-Tests für `download-auth.ts`
- ❌ Keine E2E-Tests für Download-Authorization
- ❌ Keine Load-Tests für Upload-System

**Impact**: Bugs in Production möglich

---

## 7. Letzte Änderungen (Changelog - 7 Tage)

### **2025-01-09** (Heute)

#### **Security Features (WIP)**
**Files**: `server/download-auth.ts`, `server/download-errors.ts`, `shared/schema.ts`

**Changes**:
- ✅ Created `auditLogs` table (Schema + ENUMs + Indexes)
- ✅ Created `download-auth.ts` (Auth helper functions)
- ✅ Created `download-errors.ts` (Custom error classes)
- ✅ Updated Error-Handler to log `DownloadUnauthorizedError`
- ❌ **Endpunkte NICHT aktualisiert** (Architect: "Guards not wired")

**Reason**: User-Request für Sicherheits-Pflichtanforderungen

---

#### **Bug Fixes**
**Files**: `client/src/pages/portal/gallery-selection.tsx`, `client/src/pages/portal/gallery-upload.tsx`

**Changes**:
- ✅ Fixed React Hook-Order violations (Rendered more hooks error)
- ✅ Moved all Hooks BEFORE conditional returns

**Reason**: E2E-Tests waren blockiert durch Hook-Order-Bugs

---

#### **Route Aliases**
**Files**: `server/routes.ts`

**Changes**:
- ✅ Added `/api/jobs/:id/images` alias for `/gallery`
- ✅ Dual-parameter support (path params + query strings)

**Reason**: Backward compatibility mit PixCapture-App

---

#### **Schema Synchronization**
**Files**: `shared/schema.ts`, Database (ALTER TABLE)

**Changes**:
- ✅ Added QC fields to `images` table (qc_comment, qc_technical_issues, qc_by, qc_at)
- ✅ Added editor assignment fields to `shoots` table

**Reason**: Feature-Parity zwischen Schema-Definition und Datenbank

---

### **2025-01-08**

#### **Upload Manifest System**
**Files**: `server/routes.ts`, `server/storage.ts`, `shared/schema.ts`

**Changes**:
- ✅ Implemented Upload-Manifest-Sessions (CRUD)
- ✅ Implemented Upload-Items with Retry-Logic
- ✅ Added Checksum-Validation
- ✅ Added Session-State-Machine (pending → complete)

**Reason**: Robustes Upload-System für große Dateien

---

### **2025-01-07**

#### **Gallery Package System**
**Files**: `server/routes.ts`, `server/storage.ts`

**Changes**:
- ✅ Implemented Package-Selection API (`/api/jobs/:id/select-image`)
- ✅ Implemented Selection-Stats API
- ✅ Added Package-Limit-Enforcement
- ✅ Added Kulanz-Override (`allImagesIncluded`)

**Reason**: Paket-basierte Bildauswahl für Kunden

---

### **2025-01-06**

#### **Edit Workflow System**
**Files**: `server/edit-workflow-routes.ts`, `server/storage.ts`, `shared/schema.ts`

**Changes**:
- ✅ Implemented Edit-Job-Queue
- ✅ Implemented File-Locking during processing
- ✅ Added Cron-Worker (2-Min-Interval)
- ✅ Added Sharp-based image processing

**Reason**: Asynchrone Bildbearbeitung ohne User-Blocking

---

### **2025-01-05**

#### **Order Files Management**
**Files**: `server/order-files-routes.ts`, `server/storage.ts`

**Changes**:
- ✅ Implemented Bulk-Operations (Mark, Delete)
- ✅ Implemented File-Notes/Comments
- ✅ Implemented Stack-based File-Grouping

**Reason**: PixCapture Web-Uploader File-Management

---

### **2025-01-04**

#### **PWA Camera Integration**
**Files**: `client/src/pages/app/camera.tsx`

**Changes**:
- ✅ Implemented MediaDevices API
- ✅ Added Self-Timer (3s, 5s, 10s)
- ✅ Added Grid-Overlay (Rule-of-Thirds)
- ✅ Added Zoom-Controls

**Reason**: iOS PWA-Support für On-Site-Fotografie

---

### **2025-01-03**

#### **Editor Management System**
**Files**: `server/editor-routes.ts`, `server/storage.ts`

**Changes**:
- ✅ Implemented Editor-CRUD
- ✅ Implemented Shoot-to-Editor-Assignment
- ✅ Added Handoff-Token-Generation

**Reason**: Externe Editor-Integration

---

---

## Zusammenfassung

### **Produktionsreife-Matrix**

| Komponente | Status | Blocker |
|------------|--------|---------|
| Backend-Core | ✅ 90% | P0 Security Features komplett |
| Frontend-Core | ⚠️ 70% | Mock-Daten, Polish |
| Security (P0) | ✅ 100% | **Download-Auth + Rate-Limiting + CORS** |
| Testing | ❌ 10% | E2E-Tests blockiert |
| Compliance | ⚠️ 60% | Audit-Log-Emission fehlt (P1) |

**Timeline bis Staging**: 4-5 Tage (bei Vollzeit-Arbeit)

**Kritischer Pfad**:
1. Download-Auth implementieren (1 Tag)
2. Rate-Limiting hinzufügen (4h)
3. CORS härten (1h)
4. Audit-Log-Emission (1 Tag)
5. E2E-Tests fixen (2h)
6. Admin-UI für Audit-Logs (2 Tage)

---

**Ende der Dokumentation**
