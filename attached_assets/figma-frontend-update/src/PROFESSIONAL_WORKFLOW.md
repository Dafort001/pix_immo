# 🎨 Professional Image Processing Workflow

## Überblick

PIX.IMMO verwendet einen **professionellen Bildverarbeitungs-Workflow**, bei dem echte HDR-Belichtungsreihen an spezialisierte Bildbearbeiter gesendet werden, statt automatisches HDR-Merging in der App.

## Warum Professional Processing?

### ✅ Vorteile

**1. Konsistente Qualität**
```
🎨 Professionelle Editoren
   → Einheitlicher Look & Feel
   → Marken-Konsistenz garantiert
   → Jahrelange Erfahrung
```

**2. Individuelle Bearbeitung**
```
👁️ Menschliches Auge
   → Jedes Bild wird einzeln beurteilt
   → Problemstellen werden erkannt
   → Kreative Entscheidungen
```

**3. Höhere Qualität**
```
💻 Desktop Software
   → Adobe Lightroom Classic
   → Photoshop für Retusche
   → Mehr Rechenleistung
   → Bessere Algorithmen
```

**4. Spezial-Behandlungen**
```
✨ Advanced Editing
   → Deghosting bei Bewegung
   → Perspektivkorrektur
   → Objekt-Entfernung
   → Sky Replacement
   → Virtuelle Möblierung
```

### ❌ Warum NICHT automatisches In-App HDR?

```
📱 App-basiertes HDR:
   ❌ Inkonsistente Ergebnisse
   ❌ Begrenzte Rechenleistung
   ❌ Keine Qualitätskontrolle
   ❌ Einheitslook schwierig
   ❌ Keine Sonderwünsche
   ❌ Batterie-intensiv
   
🎨 Professional Processing:
   ✅ Garantierte Konsistenz
   ✅ Workstation-Power
   ✅ Manuelle QC
   ✅ Brand Guidelines
   ✅ Custom Requests
   ✅ Keine App-Belastung
```

## Workflow-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPLETE WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1️⃣ CAPTURE (Fotograf vor Ort)
   📸 PIX.IMMO Camera App
      → HDR Bracketing System
      → 3× DNG (Pro) oder 5× JPG (Standard)
      → Stack-basierte Erfassung
      → EXIF-Metadaten vollständig
   
   ⏱️ Duration: ~5-10 Min pro Raum

2️⃣ REVIEW (Fotograf vor Ort)
   🖼️ Gallery App
      → Stacks durchsehen
      → Qualität prüfen
      → Fehlerhafte Aufnahmen neu machen
      → Auswahl für Upload
   
   ⏱️ Duration: ~2-5 Min

3️⃣ UPLOAD (Fotograf vor Ort oder später)
   ☁️ Upload to Processing Team
      → Stapel auswählen
      → Immobilienadresse eingeben
      → Notizen hinzufügen
      → Upload starten
   
   ⏱️ Duration: ~5-15 Min (je nach Dateigröße & Verbindung)

4️⃣ PROCESSING (Processing Team, Remote)
   🎨 Professional Editing
      → HDR Merge in Lightroom
      → Tone Mapping
      → Farbkorrektur
      → Retusche
      → Export & QC
   
   ⏱️ Duration: 24-48 Stunden

5️⃣ DELIVERY (Automatisch)
   📧 Client Notification
      → E-Mail an Auftraggeber
      → Download-Link
      → Galerie-Zugang
   
   ⏱️ Duration: Sofort nach Processing

6️⃣ USAGE (Client)
   🏠 Property Marketing
      → Website
      → Exposé
      → Social Media
      → MLS Listings
```

## Stack Upload System

### Galerie-Interface

**Selection Mode:**
```
┌──────────────────────────────────┐
│ Galerie               [Upload]   │
├──────────────────────────────────┤
│                                  │
│  ┌─────┐  ┌─────┐  ┌─────┐      │
│  │  ✓  │  │  ✓  │  │     │      │  ← Stacks mit Checkmarks
│  │ 3×  │  │ 5×  │  │ 3×  │      │
│  │ DNG │  │ JPG │  │ DNG │      │
│  └─────┘  └─────┘  └─────┘      │
│  Wohnz.    Küche    Schlafz.     │
│                                  │
├──────────────────────────────────┤
│     [2 Stapel hochladen]         │  ← FAB Button
└──────────────────────────────────┘
```

**Features:**
- ✅ Multi-Select für Stacks
- ✅ "Alle auswählen" / "Keine"
- ✅ Anzahl ausgewählter Stacks
- ✅ Gesamtzahl Fotos & Dateigröße
- ✅ FAB mit Upload-Button

### Upload-Interface

**Form:**
```
┌──────────────────────────────────┐
│ Upload zum Processing Team       │
├──────────────────────────────────┤
│                                  │
│ 📦 Upload-Zusammenfassung        │
│    Stapel: 2                     │
│    Fotos: 8                      │
│    Größe: ~112 MB                │
│                                  │
│ Immobilienadresse *              │
│ [Musterstr. 123, 20095 HH     ]  │
│                                  │
│ Anmerkungen (optional)           │
│ [Besondere Wünsche...         ]  │
│ [                             ]  │
│                                  │
│ ℹ️ Ihre Belichtungsreihen werden │
│   an unser Processing Team ge-   │
│   sendet. Fertige Bilder in     │
│   24-48 Stunden.                 │
│                                  │
│     [📤 Jetzt hochladen]         │
│                                  │
│ Ausgewählte Stapel (2)           │
│  ┌────────────────────────────┐  │
│  │ [thumb] Wohnzimmer  [PRO] │  │
│  │ 3× DNG · 14:30            │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ [thumb] Küche       [STD] │  │
│  │ 5× JPG · 15:01            │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Upload Process

**1. Vorbereitung:**
```typescript
// Collect stack metadata
const uploadPayload = {
  jobId: generateJobId(),
  photographer: currentUser,
  property: {
    address: formData.address,
    notes: formData.notes
  },
  stacks: selectedStacks.map(stack => ({
    stackId: stack.stackId,
    shots: stack.shots.map(shot => ({
      id: shot.id,
      exposureValue: shot.exposureValue,
      realShutterSpeed: shot.realShutterSpeed,
      fileFormat: shot.fileFormat,
      fileSize: shot.fileSize,
      exifData: shot.exif
    }))
  })),
  totalPhotos: totalPhotos,
  totalSize: totalSize,
  timestamp: new Date().toISOString()
};
```

**2. Upload:**
```typescript
// Upload to cloud storage (Supabase Storage)
for (const stack of stacks) {
  for (const shot of stack.shots) {
    // Upload actual image file
    const { data, error } = await supabase.storage
      .from('raw-captures')
      .upload(
        `${jobId}/${stack.stackId}/${shot.id}.${shot.fileFormat.toLowerCase()}`,
        shot.file,
        {
          cacheControl: '3600',
          upsert: false,
          contentType: shot.fileFormat === 'DNG' ? 'image/x-adobe-dng' : 'image/jpeg'
        }
      );
    
    // Upload EXIF metadata separately
    await supabase.storage
      .from('raw-captures')
      .upload(
        `${jobId}/${stack.stackId}/${shot.id}.json`,
        JSON.stringify(shot.exifData),
        { contentType: 'application/json' }
      );
  }
}

// Create job record in database
await supabase
  .from('processing_jobs')
  .insert({
    id: jobId,
    status: 'uploaded',
    photographer_id: currentUser.id,
    property_address: formData.address,
    notes: formData.notes,
    stacks: uploadPayload.stacks,
    total_photos: totalPhotos,
    total_size: totalSize,
    created_at: new Date().toISOString()
  });

// Notify processing team
await supabase.functions.invoke('notify-processing-team', {
  body: { jobId }
});
```

**3. Progress Tracking:**
```
Upload läuft...

┌────────────────────────┐
│   Wird hochgeladen     │
│         75%            │
│ ████████████████░░░░   │
└────────────────────────┘

Files: 6/8 hochgeladen
Verbleibend: ~30 Sekunden
```

## Processing Team Workflow

### 1. Job Eingang

**Notification:**
```
📧 Neue Upload-Benachrichtigung

Von: PIX.IMMO System
An: processing@pix-immo.de

Neuer Processing Job verfügbar!

Job ID: job_20251105_143022
Fotograf: Max Mustermann
Immobilie: Elbchaussee 42, 22763 Hamburg
Stapel: 2 (8 Fotos total)
Format: 3× DNG, 5× JPG
Größe: 112 MB

Notizen: "Bitte Fenster-Details besonders beachten"

[Zum Processing Dashboard →]
```

**Processing Dashboard:**
```
┌─────────────────────────────────────────────────┐
│ PIX.IMMO Processing Dashboard                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🆕 NEUE JOBS (3)                                │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Job #2051105-001                     [NEU] │ │
│ │ Elbchaussee 42, Hamburg                    │ │
│ │ 2 Stapel · 8 Fotos · 112 MB                │ │
│ │ Fotograf: Max Mustermann                   │ │
│ │ Hochgeladen: Heute, 14:30                  │ │
│ │                                            │ │
│ │ [Herunterladen] [Bearbeiten starten]       │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ 🔄 IN BEARBEITUNG (5)                           │
│ ⏳ WARTE AUF QC (2)                             │
│ ✅ HEUTE FERTIG (12)                            │
└─────────────────────────────────────────────────┘
```

### 2. Download & Import

**Batch Download:**
```bash
# Processing Team lädt Job herunter
$ pix-immo-cli download job_20251105_143022

Downloading job_20251105_143022...
├── stack_20251105T143022_a7f3k9/
│   ├── photo_1_1.dng (-2 EV, 1/500s) ✓
│   ├── photo_1_2.dng (0 EV, 1/125s)  ✓
│   ├── photo_1_3.dng (+2 EV, 1/30s)  ✓
│   └── metadata.json                 ✓
├── stack_20251105T150145_b8g4m2/
│   ├── photo_2_1.jpg (-2 EV)         ✓
│   ├── photo_2_2.jpg (-1 EV)         ✓
│   ├── photo_2_3.jpg (0 EV)          ✓
│   ├── photo_2_4.jpg (+1 EV)         ✓
│   ├── photo_2_5.jpg (+2 EV)         ✓
│   └── metadata.json                 ✓
└── job_metadata.json                 ✓

Download complete: 112 MB in 8 files
Ready for processing!
```

### 3. HDR Processing (Lightroom)

**Step-by-Step:**
```
1. Import Stack in Lightroom
   File → Import Photos...
   → Select all shots from stack
   
2. Create HDR
   Select all 3/5 images
   Photo → Photo Merge → HDR
   
   Settings:
   ☑️ Auto Align
   ☑️ Auto Tone
   ☑️ Deghost: Medium (if movement)
   ☐ Create Stack (not needed)
   
   → Creates: stack_xyz_HDR.dng

3. Edit HDR
   Basic:
   - Exposure: Adjust to taste
   - Contrast: +15-25
   - Highlights: -60 to -80 (recover windows!)
   - Shadows: +40 to +60 (lift dark areas)
   - Whites: +10 to +20
   - Blacks: -10 to -15
   
   HSL:
   - Blues: Saturation +10, Luminance +5
   - Greens: Saturation +5
   - Yellows: Saturation -5
   
   Detail:
   - Sharpening: 60-70
   - Noise Reduction: 20-30
   
   Lens Corrections:
   ☑️ Remove Chromatic Aberration
   ☑️ Enable Profile Corrections
   
   Transform:
   - Auto (or Manual if needed)
   - Constrain Crop

4. Apply PIX.IMMO Preset
   Develop → User Presets → PIX.IMMO Standard
   → Ensures brand consistency

5. Export
   File → Export
   Format: JPEG
   Quality: 95%
   Color Space: sRGB
   Size: 4000px longest edge
   Sharpening: High for Screen
   Metadata: Copyright + PIX.IMMO watermark
```

### 4. Quality Control

**QC Checklist:**
```
✓ Exposure korrekt?
✓ Fenster haben Details (nicht ausgebrannt)?
✓ Schatten haben Details?
✓ Weißabgleich natürlich?
✓ Vertikale Linien gerade?
✓ Keine Ghosting-Artefakte?
✓ Keine störenden Objekte?
✓ Konsistent mit anderen Bildern des Sets?
✓ PIX.IMMO Brand Guidelines eingehalten?
```

**Spezial-Behandlungen:**
- **Fenster überbelichtet:** Brightness Mask verwenden
- **Ghosting:** Manuelle Retusche in Photoshop
- **Krumme Linien:** Transform Tool
- **Störende Objekte:** Clone Stamp / Content Aware Fill
- **Dunkle Ecken:** Radial Filter mit +Exposure

### 5. Export & Upload

**Export Settings:**
```
Format: JPEG
Quality: 95%
Color Space: sRGB IEC61966-2.1
Resolution: 72 PPI (web)
Size: 4000px longest edge
Metadata: Copyright, Creator, Keywords
Watermark: PIX.IMMO (optional)
Naming: [JobID]_[Room]_[Number].jpg
  → job_20251105_001_wohnzimmer_01.jpg
```

**Upload zu Delivery:**
```typescript
// Processing Team uploaded fertige Bilder
await supabase.storage
  .from('processed-images')
  .upload(
    `${jobId}/final/wohnzimmer_01.jpg`,
    finalImage,
    {
      contentType: 'image/jpeg',
      cacheControl: '3600'
    }
  );

// Update job status
await supabase
  .from('processing_jobs')
  .update({
    status: 'completed',
    processed_at: new Date().toISOString(),
    processed_by: editor.id,
    final_image_count: finalImages.length
  })
  .eq('id', jobId);

// Trigger client notification
await supabase.functions.invoke('notify-client-delivery', {
  body: { jobId }
});
```

## Client Delivery

### Notification Email

```
Von: PIX.IMMO <noreply@pix-immo.de>
An: kunde@example.com
Betreff: ✅ Ihre Immobilienfotos sind fertig!

Hallo Herr/Frau Musterkunde,

Ihre professionell bearbeiteten Immobilienfotos sind nun verfügbar!

📍 Immobilie: Elbchaussee 42, 22763 Hamburg
📸 Anzahl Bilder: 8 HDR-Fotos
⏱️ Bearbeitet: 05.11.2025, 16:45

[Fotos jetzt herunterladen →]
[Online-Galerie ansehen →]

Die Bilder stehen Ihnen 30 Tage zum Download zur Verfügung.

Viel Erfolg bei der Vermarktung!
Ihr PIX.IMMO Team

---
Bei Fragen: support@pix-immo.de
```

### Download Portal

```
┌─────────────────────────────────────────┐
│ PIX.IMMO Delivery                       │
├─────────────────────────────────────────┤
│                                         │
│ Elbchaussee 42, Hamburg                 │
│ 8 HDR-Fotos · Bearbeitet: 05.11.2025   │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │     │ │     │ │     │ │     │        │
│ │     │ │     │ │     │ │     │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│ Wohnz.   Küche   Schlaf. Bad           │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │     │ │     │ │     │ │     │        │
│ │     │ │     │ │     │ │     │        │
│ └─────┘ └─────┘ └─────┘ └─────┘        │
│ Balkon   Eingang Außen1  Außen2        │
│                                         │
│ [ Alle herunterladen (24 MB) ]         │
│ [ Einzeln auswählen... ]               │
│                                         │
│ Lizenz: Kommerzielle Nutzung erlaubt   │
│ Gültig bis: 05.12.2025                 │
└─────────────────────────────────────────┘
```

## Technische Implementation

### Database Schema (Supabase)

```sql
-- Processing Jobs
CREATE TABLE processing_jobs (
  id TEXT PRIMARY KEY,
  photographer_id UUID REFERENCES auth.users(id),
  property_address TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded',
    -- uploaded, downloading, processing, qc, completed
  
  -- Stack information
  stacks JSONB NOT NULL,
  total_photos INTEGER NOT NULL,
  total_size_mb REAL NOT NULL,
  
  -- Processing info
  assigned_to UUID REFERENCES editors(id),
  processed_at TIMESTAMPTZ,
  final_image_count INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB
);

-- Editors (Processing Team)
CREATE TABLE editors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  
  -- Stats
  jobs_completed INTEGER DEFAULT 0,
  avg_processing_time_hours REAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processed Images
CREATE TABLE processed_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT REFERENCES processing_jobs(id),
  
  -- Image info
  room_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_mb REAL NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- HDR source
  source_stack_id TEXT NOT NULL,
  source_shots INTEGER NOT NULL, -- 3 or 5
  
  -- Edit info
  edited_by UUID REFERENCES editors(id),
  edit_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Buckets
-- raw-captures: DNG/JPG from app
-- processed-images: Final HDR JPEGs
```

### Edge Functions

**notify-processing-team:**
```typescript
// Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { jobId } = await req.json();
  
  // Get job details
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: job } = await supabase
    .from('processing_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  
  // Send email to processing team
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: 'processing@pix-immo.de' }]
      }],
      from: { email: 'system@pix-immo.de', name: 'PIX.IMMO System' },
      subject: `🆕 Neuer Processing Job: ${job.property_address}`,
      content: [{
        type: 'text/html',
        value: `
          <h2>Neuer Processing Job verfügbar!</h2>
          <p><strong>Job ID:</strong> ${job.id}</p>
          <p><strong>Immobilie:</strong> ${job.property_address}</p>
          <p><strong>Stapel:</strong> ${job.stacks.length} (${job.total_photos} Fotos)</p>
          <p><strong>Größe:</strong> ${job.total_size_mb} MB</p>
          ${job.notes ? `<p><strong>Notizen:</strong> ${job.notes}</p>` : ''}
          <p><a href="https://pix-immo.de/processing/dashboard">Zum Dashboard →</a></p>
        `
      }]
    })
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**notify-client-delivery:**
```typescript
// Similar edge function for client notification
// Sends email when processing is complete
```

## SLA & Quality Standards

### Service Level Agreement

**Processing Time:**
- Standard: 24-48 Stunden
- Express (+50%): 12-24 Stunden
- Rush (+100%): 4-8 Stunden

**Quality Standards:**
- ✓ Alle Fenster mit Details (keine Überbelichtung)
- ✓ Alle Schatten mit Details (kein Absaufen)
- ✓ Vertikale Linien ± 2° (außer kreative Wahl)
- ✓ Konsistenter Look über gesamtes Set
- ✓ Keine sichtbaren Artefakte oder Ghosting
- ✓ sRGB Farbraum, 95% JPEG Qualität
- ✓ PIX.IMMO Brand Guidelines eingehalten

### Brand Guidelines

**PIX.IMMO Look:**
- Natürliche, warme Farbtemperatur (5000-5500K)
- Kontrast: Medium-High (+20-30)
- Sättigung: Natural (+5-10)
- Schatten: Slightly lifted (+40-60)
- Highlights: Protected (-60 to -80)
- Clarity: Subtle (+10-20)
- Vibrance: +15-25
- Schärfe: 60-70

**Spezial-Regeln:**
- Fenster IMMER mit Details
- Keine übersättigten Farben
- Keine "HDR-Look" Effekte
- Natürliche Lichtstimmung erhalten
- Warme Töne in Innenräumen
- Kühle Töne in Außenaufnahmen

## Zusammenfassung

Der Professional Workflow garantiert:

✅ **Konsistente Qualität** durch manuelle Bearbeitung  
✅ **Brand Compliance** durch PIX.IMMO Presets  
✅ **Flexibilität** für Sonderwünsche  
✅ **Skalierbarkeit** durch Processing Team  
✅ **Zuverlässigkeit** durch SLA  

**Von Capture bis Delivery - alles aus einer Hand, aber mit menschlicher Expertise! 🎨✨**

---
*Dokumentation: Professional Workflow - 05.11.2025*
