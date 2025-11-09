# 📱🌐 App-Webapp Workflow Integration

## Überblick

Die PIX.IMMO iPhone App ist ein **Capture & Upload Tool** - sie fotografiert und lädt hoch. Die **Job-Erstellung und Beauftragung** erfolgt ausschließlich über die Webapp.

## Workflow-Trennung

### App-Verantwortung

```
📱 iPhone App:
├─ ✅ HDR Bracketing aufnehmen
├─ ✅ Raum-Zuordnung
├─ ✅ Stack-Management
├─ ✅ Upload zur Webapp
└─ ✅ Jobs ansehen (read-only)

❌ NICHT in App:
├─ ❌ Job-Erstellung
├─ ❌ Processing Team beauftragen
├─ ❌ Preis-Kalkulation
├─ ❌ Client-Details eingeben
└─ ❌ Rechnungsstellung
```

### Webapp-Verantwortung

```
🌐 PIX.IMMO Webapp:
├─ ✅ Uploads empfangen
├─ ✅ Job-Erstellung
├─ ✅ Client-Details erfassen
├─ ✅ Processing Team beauftragen
├─ ✅ Preis-Kalkulation
├─ ✅ Fortschritt-Tracking
├─ ✅ Fertige Bilder empfangen
├─ ✅ Client Delivery
└─ ✅ Rechnungsstellung

📸 Processing Team:
├─ ✅ Job-Benachrichtigung
├─ ✅ Download von Webapp
├─ ✅ HDR-Merge & Editing
├─ ✅ QC
└─ ✅ Upload fertiger Bilder
```

## Complete Workflow

### 1. Shooting (App)

```
📱 Fotograf vor Ort
   │
   ├─ 📸 App starten
   ├─ 🔐 Login (Session Token)
   ├─ 📷 Camera öffnen
   │
   ├─ Pro Model:
   │  └─ 3 DNG @ -2 EV, 0 EV, +2 EV
   │
   ├─ Standard Model:
   │  └─ 5 JPG @ -2, -1, 0, +1, +2 EV
   │
   ├─ 🏷️ Raum wählen (z.B. "Wohnzimmer")
   ├─ 📸 Aufnehmen (Auto-Stack in Gallery)
   │
   └─ Wiederholen für alle Räume
```

### 2. Upload (App)

```
📱 Nach Shooting
   │
   ├─ 📋 Zur Galerie
   ├─ ✅ Stacks auswählen (Multi-Select)
   ├─ 🔼 "Upload" Button
   │
   ├─ 📡 Network Check:
   │  ├─ WLAN? ✅ Upload
   │  └─ Mobil + WLAN-Only? ⚠️ Warning
   │
   ├─ ☁️ Upload zur Webapp (Supabase Storage)
   │  └─ Progress: 0% → 100%
   │
   └─ ✅ Toast: "Upload erfolgreich! Job in Webapp erstellen."
```

**Wichtig:** App erstellt KEINEN Job!

### 3. Job-Erstellung (Webapp)

```
🌐 Fotograf öffnet Webapp (pix-immo.de)
   │
   ├─ 🔐 Login mit gleichem Account
   ├─ 📦 "Eingegangene Uploads" Seite
   │
   ├─ Sieht neuen Upload:
   │  ├─ Upload ID: upload_20251105_143022
   │  ├─ Anzahl Stacks: 8
   │  ├─ Fotos: 24
   │  ├─ Größe: 420 MB
   │  └─ Status: "Bereit für Job-Erstellung"
   │
   ├─ 🆕 "Job erstellen" Button
   │
   └─ Job-Formular:
      │
      ├─ 📍 Immobilienadresse
      ├─ 👤 Client-Name
      ├─ 📧 Client-Email
      ├─ 📞 Client-Telefon
      ├─ 📅 Shooting-Datum
      ├─ 🎯 Service-Level:
      │  ├─ Express (24h)
      │  ├─ Standard (48h)
      │  └─ Economy (72h)
      │
      ├─ 💰 Preis-Berechnung:
      │  ├─ Basis: 24 Fotos × €8 = €192
      │  ├─ Express: +50% = €96
      │  └─ Total: €288
      │
      ├─ 📝 Spezielle Anweisungen
      ├─ 🎨 Style-Preferences
      │  ├─ Natural
      │  ├─ Bright & Airy
      │  └─ Dramatic
      │
      └─ ✅ "Job erstellen & Processing beauftragen"
```

### 4. Processing (Processing Team)

```
👨‍🎨 Processing Team erhält Benachrichtigung
   │
   ├─ 📧 Email: "Neuer Job #20251105-001"
   ├─ 🌐 Webapp öffnen (processing.pix-immo.de)
   ├─ 📋 Jobs-Dashboard
   │
   ├─ Job Details ansehen:
   │  ├─ Client: Mustermann GmbH
   │  ├─ Adresse: Elbchaussee 42, Hamburg
   │  ├─ Deadline: 06.11.2025 14:30
   │  ├─ Service: Express
   │  ├─ Style: Bright & Airy
   │  └─ 8 Stacks, 24 Fotos
   │
   ├─ 📥 Download Stacks von Supabase
   │
   ├─ 🎨 HDR Merge & Processing:
   │  ├─ Stack 1 (Wohnzimmer) → 3 DNG → Merge
   │  ├─ Stack 2 (Küche) → 3 DNG → Merge
   │  └─ ...
   │
   ├─ ✨ Editing:
   │  ├─ Exposure Correction
   │  ├─ Color Grading
   │  ├─ Vertical Lines
   │  ├─ Perspective Correction
   │  └─ Retouching
   │
   ├─ 🔍 Quality Check
   │
   └─ 📤 Upload zu Webapp:
      ├─ job_20251105_001_wohnzimmer_01.jpg
      ├─ job_20251105_001_kueche_01.jpg
      └─ ...
```

### 5. Delivery (Webapp)

```
🌐 Webapp empfängt fertige Bilder
   │
   ├─ ✅ Status Update: "Processing Complete"
   ├─ 📧 Email an Fotograf: "Job fertig"
   ├─ 📧 Email an Client: "Ihre Bilder sind fertig"
   │
   ├─ 👤 Client öffnet Delivery Link:
   │  ├─ Galerie mit allen Bildern
   │  ├─ Download ZIP
   │  ├─ Share-Optionen
   │  └─ Feedback-Formular
   │
   └─ 💰 Rechnungsstellung (automatisch)
```

## App Upload Details

### Upload-Seite Vereinfacht

**Was die App NICHT mehr abfragt:**

```
❌ Entfernt:
├─ ❌ Immobilienadresse (wird in Webapp eingegeben)
├─ ❌ Client-Details (wird in Webapp eingegeben)
├─ ❌ Service-Level (wird in Webapp eingegeben)
├─ ❌ Deadline (wird in Webapp eingegeben)
└─ ❌ Preis (wird in Webapp berechnet)
```

**Was die App abfragt:**

```
✅ Minimal:
├─ ✅ Stacks (aus Gallery auswählen)
├─ ✅ Upload-Notiz (optional, intern)
└─ ✅ Network-Präferenz (WLAN/Mobil)
```

### Upload-Formular

```
┌──────────────────────────────────┐
│ Upload zur Webapp       [WLAN]  │
│ Fotos werden hochgeladen.        │
│ Job-Erstellung in Webapp.        │
├──────────────────────────────────┤
│                                  │
│ ┌────────────────────────────┐  │
│ │ 📦 Upload-Übersicht        │  │
│ │ Stapel: 8                  │  │
│ │ Fotos: 24                  │  │
│ │ Größe: ~420 MB             │  │
│ └────────────────────────────┘  │
│                                  │
│ ┌────────────────────────────┐  │
│ │ ℹ️ Nächster Schritt        │  │
│ │ Nach Upload Job in Webapp  │  │
│ │ erstellen und Processing   │  │
│ │ Team beauftragen.          │  │
│ └────────────────────────────┘  │
│                                  │
│ Upload-Notiz (optional)          │
│ ┌────────────────────────────┐  │
│ │ Interne Notiz...           │  │
│ └────────────────────────────┘  │
│                                  │
│ [Jetzt hochladen]                │
│                                  │
└──────────────────────────────────┘
```

### Upload-Status

**Stati:**

```
✅ completed = Hochgeladen
   → Bereit für Job-Erstellung in Webapp
   → KEIN Processing Job erstellt
   → KEIN Team benachrichtigt

⏳ uploading = Wird hochgeladen
   → Progress anzeigen
   → Nicht abbrechen

❌ failed = Fehler
   → Retry möglich
   → Details anzeigen
```

## App Jobs-Ansicht

### Read-Only Display

```
📱 App → Jobs Tab
   │
   ├─ Zeigt Jobs die VIA WEBAPP erstellt wurden
   ├─ Read-only (keine Bearbeitung)
   │
   └─ Job-Details:
      │
      ├─ 🏠 Adresse
      ├─ 📅 Datum
      ├─ 📊 Status:
      │  ├─ Uploaded (Webapp Job noch nicht erstellt)
      │  ├─ Processing (Team arbeitet)
      │  └─ Completed (Fertig)
      │
      ├─ 📸 Stacks-Vorschau
      └─ 🔗 "In Webapp öffnen" Button
```

**Wichtig:** App erstellt keine Jobs, zeigt nur an!

## Data Flow

### Upload zu Webapp

```typescript
// App Upload
const uploadToWebapp = async (stacks: PhotoStack[]) => {
  const uploadId = `upload_${Date.now()}`;
  
  // 1. Upload files to Supabase Storage
  for (const stack of stacks) {
    for (const shot of stack.shots) {
      await supabase.storage
        .from('raw-captures')
        .upload(`${uploadId}/${stack.stackId}/${shot.id}.dng`, shot.file);
    }
  }
  
  // 2. Create upload record (NOT a job!)
  await supabase
    .from('uploads')
    .insert({
      id: uploadId,
      photographer_id: userId,
      status: 'completed',
      stacks_count: stacks.length,
      photos_count: totalPhotos,
      total_size_mb: totalSize,
      upload_network_type: isWifi ? 'wifi' : 'cellular',
      notes: uploadNotes,
      created_at: new Date().toISOString()
    });
  
  // 3. NO job creation!
  // 4. NO processing team notification!
  
  toast.success('Upload erfolgreich! Job in Webapp erstellen.');
};
```

### Webapp Job Creation

```typescript
// Webapp Job Creation
const createJobFromUpload = async (uploadId: string, jobDetails: JobDetails) => {
  // 1. Fetch upload data
  const upload = await supabase
    .from('uploads')
    .select('*')
    .eq('id', uploadId)
    .single();
  
  // 2. Create processing job
  const job = await supabase
    .from('processing_jobs')
    .insert({
      upload_id: uploadId,
      photographer_id: upload.photographer_id,
      client_name: jobDetails.clientName,
      client_email: jobDetails.clientEmail,
      property_address: jobDetails.propertyAddress,
      service_level: jobDetails.serviceLevel,
      deadline: calculateDeadline(jobDetails.serviceLevel),
      total_price: calculatePrice(upload.photos_count, jobDetails.serviceLevel),
      status: 'assigned',
      special_instructions: jobDetails.instructions,
      style_preference: jobDetails.stylePreference,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  // 3. Notify processing team
  await sendProcessingTeamNotification(job);
  
  // 4. Send confirmation to photographer
  await sendPhotographerConfirmation(job);
  
  return job;
};
```

## Database Schema

### uploads Table

```sql
CREATE TABLE uploads (
  id TEXT PRIMARY KEY,              -- upload_20251105_143022
  photographer_id UUID NOT NULL,
  status TEXT NOT NULL,             -- 'completed', 'uploading', 'failed'
  stacks_count INTEGER NOT NULL,
  photos_count INTEGER NOT NULL,
  total_size_mb DECIMAL NOT NULL,
  upload_network_type TEXT,         -- 'wifi' or 'cellular'
  notes TEXT,                       -- Internal upload notes
  job_id TEXT,                      -- NULL until job created in webapp
  created_at TIMESTAMP NOT NULL,
  
  FOREIGN KEY (photographer_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES processing_jobs(id)
);
```

### processing_jobs Table

```sql
CREATE TABLE processing_jobs (
  id TEXT PRIMARY KEY,              -- job_20251105_001
  upload_id TEXT NOT NULL,          -- Links to uploads table
  photographer_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  property_address TEXT NOT NULL,
  shooting_date DATE NOT NULL,
  service_level TEXT NOT NULL,      -- 'express', 'standard', 'economy'
  deadline TIMESTAMP NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT NOT NULL,             -- 'assigned', 'processing', 'completed'
  special_instructions TEXT,
  style_preference TEXT,            -- 'natural', 'bright_airy', 'dramatic'
  assigned_to UUID,                 -- Processing team member
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  
  FOREIGN KEY (upload_id) REFERENCES uploads(id),
  FOREIGN KEY (photographer_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### Relationship

```
uploads (1) ──> (0..1) processing_jobs
   │
   └─ Ein Upload kann OHNE Job existieren
   └─ Ein Upload kann genau EINEN Job haben
   └─ Job wird via Webapp erstellt, nicht App
```

## UI States & Messaging

### App Upload Success

```
Toast nach Upload:
┌──────────────────────────────────┐
│ ✅ Upload erfolgreich!           │
│ Erstellen Sie jetzt einen Job    │
│ in der Webapp.                   │
└──────────────────────────────────┘

(2s Delay → zurück zu Gallery)
```

### App Upload History

```
Letzte Uploads
Job-Erstellung erfolgt in der Webapp

┌────────────────────────────────┐
│ Upload 143022        [✅]      │
│ 05.11.2025 · 14:30            │
│ ────────────────────────────  │
│ 📦 8 Stapel  📸 24 Fotos      │
│ ✅ Erfolgreich hochgeladen    │
└────────────────────────────────┘
```

### Webapp Uploads Page

```
Eingegangene Uploads
Erstellen Sie Jobs für neue Uploads

┌────────────────────────────────┐
│ Upload #143022                 │
│ 05.11.2025 · 14:30            │
│ Von: Max Mustermann           │
│ ────────────────────────────  │
│ 📦 8 Stapel  📸 24 Fotos      │
│ 💾 420 MB                     │
│                               │
│ [Job erstellen]               │  ← Primärer CTA
└────────────────────────────────┘

┌────────────────────────────────┐
│ Upload #142918                 │
│ 04.11.2025 · 16:15            │
│ Von: Max Mustermann           │
│ ────────────────────────────  │
│ 📦 12 Stapel  📸 36 Fotos     │
│ 💼 Job #20251104-001          │  ← Job erstellt
│                               │
│ ✅ Job aktiv                  │
└────────────────────────────────┘
```

## Benefits dieser Trennung

### ✅ Vorteile

**1. Separation of Concerns**
```
App = Capture Tool (einfach, fokussiert)
Webapp = Business Logic (komplex, vollständig)
```

**2. Flexibility**
```
Fotograf kann:
├─ Vor Ort fotografieren
├─ Später im Büro Job erstellen
├─ Mehrere Uploads kombinieren
└─ Details in Ruhe eingeben
```

**3. Better UX**
```
App:
├─ Kein komplexes Formular
├─ Schneller Workflow
└─ Fokus auf Fotografie

Webapp:
├─ Vollständige Eingabemöglichkeiten
├─ Bessere Übersicht
├─ Desktop-optimiert
└─ Mehr Platz für Details
```

**4. Data Integrity**
```
Webapp:
├─ Single Source of Truth
├─ Bessere Validation
├─ Audit Trail
└─ Einfachere Verwaltung
```

**5. Scalability**
```
Verschiedene Upload-Quellen möglich:
├─ iPhone App
├─ Android App (zukünftig)
├─ Desktop Upload
└─ API für Partner
```

## User Journey Comparison

### ❌ VORHER (Falsch - Job in App)

```
App:
1. Fotografieren
2. Upload-Formular:
   - Adresse ⌨️
   - Client ⌨️
   - Service ⌨️
   - Preis ⌨️
   (Nerviges Tippen am Telefon!)
3. Upload
4. Job erstellt ✅

Problem:
- Komplexe Eingabe am Telefon
- Keine Übersicht
- Schwer zu korrigieren
- Duplicate State (App + Webapp)
```

### ✅ NACHHER (Korrekt - Job in Webapp)

```
App:
1. Fotografieren
2. Upload (minimal)
3. Fertig! ✅

Webapp (später, im Büro):
4. Uploads ansehen
5. Job-Details eingeben (Desktop!)
6. Processing beauftragen
7. Job-Tracking

Vorteile:
- Einfacher App-Workflow
- Bessere Eingabemöglichkeiten
- Single Source of Truth
- Flexibler Zeitpunkt
```

## Implementation Checklist

### App Changes

```
✅ Upload-Seite vereinfacht
   ├─ ✅ Adresse-Feld entfernt
   ├─ ✅ Client-Details entfernt
   ├─ ✅ Service-Level entfernt
   ├─ ✅ Nur Upload-Notiz optional
   └─ ✅ Info-Box: "Job in Webapp erstellen"

✅ Success Message geändert
   ├─ ✅ "Upload erfolgreich!"
   └─ ✅ "Job in Webapp erstellen"

✅ Upload History geändert
   ├─ ✅ Status: "Hochgeladen" statt "Fertig"
   └─ ✅ Hinweis: "Job in Webapp"

✅ Jobs-Ansicht (read-only)
   ├─ ✅ Zeigt Webapp-Jobs
   └─ ✅ "In Webapp öffnen" Button
```

### Webapp Changes

```
📋 TODO:
├─ ⬜ "Eingegangene Uploads" Seite
├─ ⬜ Upload → Job Conversion Flow
├─ ⬜ Job-Creation Formular
├─ ⬜ Processing Team Notification
├─ ⬜ Client Notification
└─ ⬜ Upload-Job Linking in DB
```

## Zusammenfassung

**Clear Workflow:**

```
📱 APP
   └─ Capture & Upload
      └─ Simple & Fast

🌐 WEBAPP
   └─ Job Creation & Management
      └─ Complete & Flexible

👨‍🎨 PROCESSING TEAM
   └─ Download, Edit, Upload
      └─ Professional & Quality
```

**Resultat:** Klare Verantwortlichkeiten, bessere UX, mehr Flexibilität! 🎯✨

---
*Dokumentation: App-Webapp Workflow Integration - 05.11.2025*
