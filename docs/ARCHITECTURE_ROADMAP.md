# Architecture Roadmap – pix.immo / PixCapture

**Status**: 📋 **PLANNING DOCUMENT** (keine aktive Implementierung)  
**Erstellt**: 2025-01-14  
**Zweck**: Architektonische Vorbereitung für KI-Integration, Self-Editing, Avatar-/Video-Generation und externe Exporte

---

## Übersicht

Dieses Dokument definiert die zukünftige Architektur für:
- **KI-Pipeline**: Vision (fal.ai) + GPT (OpenAI) für Bildanalyse und Captions
- **Self-Editing**: Objektentfernung in PixCapture-App
- **Avatar/Video**: AI-generierte Avatare und Video-Content
- **Externe Exporte**: ArtSpace, ScenePlates, 360°-Pano

**Wichtig**: Keines dieser Features ist aktuell implementiert. Diese Planung verhindert spätere Architektur-Umbauten.

---

## 1. R2 Object Storage Struktur

### Definierte Prefixes (Cloudflare R2)

```
raw/{shoot_id}/...
├── {image_id}_g001_e-2.dng          # RAW-Bracket (Underexposed)
├── {image_id}_g001_e0.dng           # RAW-Bracket (Normal)
└── {image_id}_g001_e+2.dng          # RAW-Bracket (Overexposed)

archive/{shoot_id}/...
└── {image_id}_hr.jpg                 # Highres-JPEG vom Editing-Team (final entwickelt)

master/{shoot_id}/...
└── {image_id}_3000.jpg               # 3000px Master-Version (Basis für KI + Galerie)

analysis/{shoot_id}/...
├── {image_id}.vision.json            # fal.ai Florence-2 Detection-Ergebnisse
├── {image_id}.mask_sky.png           # SAM2 Segmentierungsmasken
├── {image_id}.mask_floor.png
├── {image_id}.gpt.json               # OpenAI GPT-Vision Captions & Metadata
└── summary.json                       # Konsolidierte Shoot-Zusammenfassung (später)

edits/{shoot_id}/{image_id}/...
├── base.jpg                          # Kopie von master/ (erste Self-Edit-Basis)
├── clean_v1.jpg                      # Objektentfernung Version 1
├── clean_v2.jpg                      # Objektentfernung Version 2
└── ...
```

### Aktueller Status
- ✅ `raw/` bereits in Nutzung (Mobile Upload Workflow)
- ⏸️ `archive/`, `master/`, `analysis/`, `edits/` - reserviert, nicht aktiv

---

## 2. Datenbank-Felder (images-Tabelle)

### Geplante Erweiterungen

```typescript
// shared/schema.ts - images table extensions (FUTURE)
export const images = pgTable("images", {
  // ... existing fields ...

  // KI-Pipeline Status Flags
  ready_for_vision: boolean("ready_for_vision").notNull().default(false),
  vision_done: boolean("vision_done").notNull().default(false),
  gpt_done: boolean("gpt_done").notNull().default(false),
  
  // Self-Editing Flags
  has_edits: boolean("has_edits").notNull().default(false),
  best_version: varchar("best_version", { length: 50 }).default("master"), // "master", "clean_v1", ...
  
  // Multi-Tenant/Context (optional, für spätere Erweiterungen)
  shoot_code: varchar("shoot_code", { length: 10 }), // e.g. "AB3KQ"
  room_type: varchar("room_type", { length: 50 }),   // e.g. "wohnzimmer", "kueche"
  customer_id: varchar("customer_id", { length: 50 }),
  photographer_id: varchar("photographer_id", { length: 50 }),
});
```

### Aktueller Status
- ⏸️ Felder NICHT hinzugefügt (HALT aktiv)
- 📋 Schema dokumentiert für zukünftige Migration

---

## 3. Editor-Return als KI-Einstiegspunkt

### Workflow (geplant)

```
1. Editing-Team liefert Highres-JPEG zurück
   └─> Speichern: archive/{shoot_id}/{image_id}_hr.jpg

2. Backend erzeugt 3000px Master-Version
   └─> Speichern: master/{shoot_id}/{image_id}_3000.jpg
   └─> Sharp resize: width=3000, quality=92, progressive

3. DB-Flags setzen
   └─> ready_for_vision = true
   └─> vision_done = false
   └─> gpt_done = false

4. KI-Orchestrierung (später)
   └─> Vision-Orchestrator liest master/, schreibt analysis/
   └─> GPT-Orchestrator liest master/ + vision.json, schreibt gpt.json
```

### Aktueller Status
- ⏸️ Editor-Return API NICHT implementiert
- 📋 Workflow definiert als Einstiegspunkt für KI-Pipeline

---

## 4. Service-Hooks / Orchestratoren

### Geplante Backend-Services (Struktur-Platzhalter)

```
server/services/
├── vision-orchestrator/
│   ├── index.ts                      # fal.ai Florence-2 + SAM2 Integration
│   ├── object-detection.ts           # VISION_OBJECT_DETECTION_MODEL
│   ├── caption.ts                    # VISION_CAPTION_MODEL
│   ├── regional-caption.ts           # VISION_REGIONAL_CAPTION_MODEL
│   ├── segmentation.ts               # VISION_SEGMENTATION_MODEL (SAM2)
│   └── object-removal.ts             # VISION_OBJECT_REMOVAL_MODEL
│
├── gpt-orchestrator/
│   ├── index.ts                      # OpenAI GPT-Vision Integration
│   ├── caption-generator.ts          # Deutsche/englische Bildbeschreibungen
│   ├── metadata-extractor.ts         # Room type, features, QC-Checks
│   └── expose-text-generator.ts      # Marketing-Texte aus Bildanalyse
│
├── avatar-orchestrator/              # Platzhalter für Avatar-Generation
│   └── index.ts                      # Input: summary.json → Video/Avatar
│
├── video-orchestrator/               # Platzhalter für Video-Generation
│   └── index.ts                      # Sora/Veo/fal-Video Integration
│
├── gallery-export-orchestrator/      # ArtSpace-Hook
│   └── index.ts                      # Export zu 3D-Galerie-Plattformen
│
├── sceneplates-export-orchestrator/  # ScenePlates-Hook
│   └── index.ts                      # Automotive/Backplate-Exporte
│
├── pano-export-orchestrator/         # 360°-Hook
│   └── index.ts                      # Pano2VR/Gaussian-Splatting-Exports
│
└── external-sync-orchestrator/       # Generische Reserve-Schnittstelle
    └── index.ts                      # Webhooks für externe Systeme
```

### Aktueller Status
- ⏸️ Services NICHT erstellt (nur Struktur-Planung)
- 📋 Ordner-Hierarchie definiert für spätere Entwicklung

---

## 5. Environment Variables (geplant)

### Vision Provider (fal.ai)

```bash
# Vision Provider Configuration
VISION_PROVIDER=fal
VISION_API_BASE_URL=https://fal.run
VISION_API_KEY=<secret>

# fal.ai Model Endpoints
VISION_OBJECT_DETECTION_MODEL=fal-ai/florence-2-large/object-detection
VISION_CAPTION_MODEL=fal-ai/florence-2-large/caption
VISION_REGIONAL_CAPTION_MODEL=fal-ai/florence-2-large/regional-caption
VISION_SEGMENTATION_MODEL=fal-ai/sam2
VISION_OBJECT_REMOVAL_MODEL=fal-ai/object-removal

# Vision Service Limits
VISION_MAX_CONCURRENT_JOBS=5
VISION_REQUEST_TIMEOUT_MS=30000
VISION_JOB_RETRY_COUNT=3
```

### GPT (OpenAI Vision)

```bash
# OpenAI Configuration (already exists: OPENAI_API_KEY)
OPENAI_API_KEY=<secret>
GPT_VISION_MODEL=gpt-4o              # oder gpt-4.5-vision (wenn verfügbar)
GPT_LOCALE_DEFAULT=de                # Deutsche Captions als Standard
GPT_MAX_TOKENS=1000
GPT_TEMPERATURE=0.7
```

### Avatar / Video (Platzhalter)

```bash
# Avatar Generation (zukünftig)
AVATAR_PROVIDER=<TBD>
AVATAR_API_KEY=<secret>
AVATAR_MODEL=<TBD>

# Video Generation (fal.ai oder andere)
VIDEO_GEN_PROVIDER=fal
VIDEO_GEN_MODEL=<TBD>
VIDEO_MOTION_FILL_MODEL=<TBD>
VISION_OUTPAINT_MODEL=<TBD>
```

### Aktueller Status
- ✅ `OPENAI_API_KEY` bereits vorhanden
- ⏸️ Neue ENV-Variablen NICHT hinzugefügt (warten auf Implementation)
- 📋 Naming-Convention definiert für spätere Konfiguration

---

## 6. Self-Edit / PixCapture API (geplant)

### Objektentfernung Workflow

```typescript
// FUTURE API Route (NOT IMPLEMENTED)
POST /api/remove-object

// Request Body
{
  shoot_id: string,
  image_id: string,
  version: "master" | "clean_v1" | "clean_v2" | ...,
  mask: {
    format: "png" | "pixelmap",
    data: string // Base64-encoded mask
  }
}

// Workflow
1. Bild laden aus master/{shoot_id}/ oder edits/{shoot_id}/{image_id}/
2. Maske + Bild an VISION_OBJECT_REMOVAL_MODEL (fal.ai) senden
3. Ergebnis speichern:
   - edits/{shoot_id}/{image_id}/clean_vX.jpg
4. DB-Update:
   - has_edits = true
   - best_version = "clean_vX"

// Response
{
  success: true,
  new_version: "clean_v3",
  preview_url: "https://r2.../edits/AB3KQ/img_001/clean_v3.jpg"
}
```

### PixCapture Integration

Die PixCapture-App erhält später:
- Canvas-Tool für Masken-Zeichnung (Pinsel-Interface)
- API-Call zu `/api/remove-object`
- Echtzeit-Preview der bereinigten Version
- Version-History (clean_v1, v2, v3...)

### Aktueller Status
- ⏸️ API-Route NICHT implementiert
- 📋 Workflow dokumentiert für Self-Editing Feature

---

## 7. Summary pro Shoot (Avatar-/Video-Hook)

### summary.json Format (geplant)

```json
// analysis/{shoot_id}/summary.json
{
  "shoot_id": "AB3KQ",
  "shoot_code": "AB3KQ",
  "property": {
    "name": "Musterwohnung Eppendorf",
    "address": "Eppendorfer Weg 42, 20259 Hamburg",
    "type": "apartment",
    "size_sqm": 85
  },
  "images": {
    "total": 42,
    "by_room": {
      "wohnzimmer": 8,
      "kueche": 6,
      "schlafzimmer": 5,
      "bad": 4,
      "balkon": 3,
      "flur": 2,
      "fassade": 2
    }
  },
  "highlights": [
    "Modernes Design mit großen Fenstern",
    "Hochwertige Küche mit Miele-Geräten",
    "Balkon mit Blick ins Grüne"
  ],
  "gpt_aggregated": {
    "common_features": ["modern", "hell", "gepflegt"],
    "quality_score": 8.5,
    "recommended_for": ["young_professionals", "couples"]
  },
  "vision_stats": {
    "detected_objects": {
      "furniture": 156,
      "windows": 24,
      "doors": 12
    },
    "dominant_colors": ["white", "beige", "gray"]
  },
  "export_ready": {
    "avatar": false,
    "video": false,
    "artspace": false
  },
  "generated_at": 1705219200000
}
```

### Verwendung

- **Avatar-Orchestrator**: Generiert AI-Avatar mit Sprachausgabe basierend auf summary.json
- **Video-Orchestrator**: Erzeugt Property-Tour-Video aus Bildsequenzen + GPT-Texten
- **ArtSpace-Export**: Bereitet 3D-Galerie-Daten vor
- **ScenePlates-Export**: Automotive-Backplates mit Metadaten

### Aktueller Status
- ⏸️ summary.json NICHT generiert
- 📋 JSON-Schema dokumentiert als Input für nachgelagerte Services

---

## 8. Implementation Priorities (FUTURE)

### Phase 1: KI-Pipeline Foundation
1. Editor-Return API implementieren
2. 3000px Master-Generation (Sharp)
3. DB-Migration: Flags hinzufügen (ready_for_vision, vision_done, gpt_done)
4. R2-Prefixes: archive/, master/ aktivieren

### Phase 2: Vision Integration
1. fal.ai SDK einbinden
2. Vision-Orchestrator implementieren
3. Object-Detection + Segmentation (Florence-2, SAM2)
4. analysis/{shoot_id}/ Ergebnisse speichern

### Phase 3: GPT Integration
1. OpenAI GPT-Vision API integrieren
2. GPT-Orchestrator implementieren
3. Deutsche/englische Captions generieren
4. gpt.json nach analysis/ schreiben

### Phase 4: Self-Editing
1. POST /api/remove-object implementieren
2. PixCapture: Canvas-Tool für Masken
3. edits/{shoot_id}/{image_id}/ Versionierung
4. has_edits, best_version DB-Logik

### Phase 5: Avatar/Video/Export
1. summary.json Generator implementieren
2. Avatar-Orchestrator (TBD Provider)
3. Video-Orchestrator (Sora/Veo/fal)
4. Externe Exporte (ArtSpace, ScenePlates, 360°)

---

## 9. Technische Abhängigkeiten

### Neue Package-Dependencies (später)
```json
{
  "@fal-ai/serverless-client": "^0.x.x",
  "openai": "^4.x.x",
  "sharp": "^0.33.x" // bereits vorhanden
}
```

### R2 Bucket Configuration
- Alle Prefixes im selben Bucket: `repl-default-bucket-{REPL_ID}`
- CORS-Policy für Self-Edit Canvas-Uploads erweitern
- Lifecycle-Rules für archive/ (Retention: 90 Tage)

### Database Migration Strategy
- Drizzle-Schema erweitern (images table)
- `npm run db:push` für neue Felder
- Backfill-Script für existing images (alle Flags auf false setzen)

---

## 10. Security & Performance

### Rate Limiting (fal.ai / OpenAI)
- Max concurrent Vision-Jobs: 5 (VISION_MAX_CONCURRENT_JOBS)
- Request Timeout: 30s (VISION_REQUEST_TIMEOUT_MS)
- Retry Count: 3 (VISION_JOB_RETRY_COUNT)
- GPT Rate Limit: 60 requests/min (OpenAI Standard)

### Object Storage Costs
- archive/: Highres-JPEGs (~5-10 MB/Bild)
- master/: 3000px JPEGs (~2-3 MB/Bild)
- analysis/: JSON + Masken (~500 KB/Bild)
- edits/: Self-Edit Versionen (~2 MB/Version)

**Schätzung pro Shoot (40 Bilder)**:
- archive/: 400 MB
- master/: 120 MB
- analysis/: 20 MB
- **Total**: ~540 MB/Shoot

### KI-API Kosten (Schätzung)
- fal.ai Florence-2: ~$0.01/Bild
- fal.ai SAM2: ~$0.02/Bild
- OpenAI GPT-Vision: ~$0.05/Bild
- **Total KI-Kosten**: ~$0.08/Bild → ~$3.20/Shoot (40 Bilder)

---

## 11. Monitoring & Observability (zukünftig)

### Geplante Metriken
- Vision-Job Success Rate (%)
- GPT-Job Success Rate (%)
- Avg. Processing Time (Vision + GPT)
- R2 Storage Growth (GB/month)
- Self-Edit Usage (Objektentfernungen/Woche)
- Summary-Generation Errors

### Audit-Logs erweitern
```typescript
// Neue auditActionType values (FUTURE)
"vision_job_started"
"vision_job_completed"
"vision_job_failed"
"gpt_job_started"
"gpt_job_completed"
"gpt_job_failed"
"self_edit_object_removed"
"summary_generated"
"avatar_generated"
"video_generated"
```

---

## 12. Zusammenfassung

### Was IST dokumentiert
✅ R2-Prefixes für alle Bildversionen  
✅ DB-Felder für KI-Pipeline Status  
✅ Editor-Return als KI-Einstiegspunkt  
✅ Service-Orchestrator Struktur  
✅ ENV-Variablen Naming-Convention  
✅ Self-Edit API Workflow  
✅ summary.json Schema  

### Was NICHT implementiert ist
⏸️ Keine neuen DB-Felder hinzugefügt  
⏸️ Keine neuen API-Routes erstellt  
⏸️ Keine Service-Orchestratoren gebaut  
⏸️ Keine ENV-Variablen gesetzt  
⏸️ Keine fal.ai/OpenAI Integration  

### Nächste Schritte (NACH HALT-Freigabe)
1. User-Freigabe für Phase 1 einholen
2. DB-Migration planen (images table extensions)
3. Editor-Return API implementieren
4. fal.ai Account + API-Keys einrichten
5. Vision-Orchestrator Prototyp bauen

---

**Dokumentation gültig ab**: 2025-01-14  
**Letzte Aktualisierung**: 2025-01-14  
**Status**: 📋 PLANNING (keine aktive Entwicklung)
