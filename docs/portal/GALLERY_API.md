# Gallery Upload System V1.0 - API Documentation

## 📋 Übersicht

Das Gallery Upload System verwaltet drei Workflow-Typen:
- **Customer Upload** (`customer_upload`) - Kunden-Referenzbilder
- **Photographer RAW** (`photographer_raw`) - RAW-Dateien vom Fotografen
- **Final Edited** (`final_edited`) - Bearbeitete Bilder zur Freigabe

## 🔐 Authentifizierung

Alle API-Endpunkte erfordern Authentifizierung via Session-Cookie.

**Login:**
```bash
POST /api/login
Content-Type: application/json

{
  "email": "admin@pix.immo",
  "password": "Test2025!"
}
```

## 📡 API Endpoints

### Gallery Management

#### 1. Gallery erstellen
```http
POST /api/gallery
Content-Type: application/json

{
  "type": "customer_upload",
  "name": "Luxury Villa Hamburg",
  "description": "Customer reference images"
}

Response: 200 OK
{
  "id": 123,
  "type": "customer_upload",
  "name": "Luxury Villa Hamburg",
  "status": "active",
  "createdAt": "2025-10-25T10:30:00Z",
  "updatedAt": "2025-10-25T10:30:00Z"
}
```

#### 2. Gallery abrufen
```http
GET /api/gallery/:id

Response: 200 OK
{
  "id": 123,
  "type": "customer_upload",
  "name": "Luxury Villa Hamburg",
  "status": "active",
  "files": [...],
  "exportData": null,
  ...
}
```

### File Upload

#### 3. Dateien hochladen
```http
POST /api/gallery/:id/upload
Content-Type: multipart/form-data

files: [File, File, ...]

Response: 200 OK
[
  {
    "id": 1001,
    "filename": "galleries/123/1729858200000-image.jpg",
    "originalName": "image.jpg",
    "fileType": "JPEG",
    "fileSize": 2458624,
    "thumbnailUrl": "https://...",
    "stylePreset": "PURE",
    "windowPreset": "CLEAR",
    "skyPreset": "CLEAR BLUE",
    ...
  }
]
```

**Unterstützte Formate:**
- **Standard:** JPEG, PNG, HEIC
- **RAW:** DNG, CR2, NEF, ARW, ORF, RW2, RAF, PEF, SR2, X3F, 3FR, FFF, MEF

### File Settings

#### 4. File-Settings aktualisieren
```http
PATCH /api/gallery/:galleryId/files/:fileId/settings
Content-Type: application/json

{
  "stylePreset": "EDITORIAL",
  "windowPreset": "SCANDINAVIAN",
  "skyPreset": "PASTEL CLOUDS",
  "verticalCorrection": true,
  "deNoiseFloor": true,
  "removePowerCables": false
}

Response: 200 OK
{
  "id": 1001,
  "stylePreset": "EDITORIAL",
  ...
}
```

**Preset-Werte:**
- `stylePreset`: `PURE` | `EDITORIAL` | `CLASSIC`
- `windowPreset`: `CLEAR` | `SCANDINAVIAN` | `BRIGHT`
- `skyPreset`: `CLEAR BLUE` | `PASTEL CLOUDS` | `DAYLIGHT SOFT` | `EVENING HAZE`

**Boolean-Settings:**
- `verticalCorrection` - Vertikale Perspektivkorrektur
- `deNoiseFloor` - Boden-Entrauschen
- `deNoiseWall` - Wand-Entrauschen
- `deNoiseCeiling` - Decken-Entrauschen
- `removePowerCables` - Stromkabel entfernen
- `removePlumbing` - Rohrleitungen entfernen

#### 5. Globale Settings auf mehrere Files anwenden
```http
POST /api/gallery/:id/global-settings
Content-Type: application/json

{
  "fileIds": [1001, 1002, 1003],
  "stylePreset": "CLASSIC",
  "windowPreset": "BRIGHT",
  "skyPreset": "EVENING HAZE"
}

Response: 200 OK
{
  "message": "Settings applied to 3 files"
}
```

### Annotations

#### 6. Annotation hinzufügen
```http
POST /api/gallery/file/:fileId/annotation
Content-Type: application/json

{
  "type": "comment",
  "notes": "Please brighten the left corner"
}

Response: 200 OK
{
  "id": 5001,
  "fileId": 1001,
  "type": "comment",
  "notes": "Please brighten the left corner",
  "createdAt": "2025-10-25T11:15:00Z"
}
```

#### 7. Mask PNG hochladen
```http
POST /api/gallery/file/:fileId/mask-upload
Content-Type: multipart/form-data

mask: [PNG File]

Response: 200 OK
{
  "maskUrl": "https://r2.pix.immo/galleries/123/masks/..."
}
```

### Finalize & Export

#### 8. Gallery finalisieren
```http
POST /api/gallery/:id/finalize

Response: 200 OK
{
  "id": 123,
  "status": "finalized",
  "exportedAt": "2025-10-25T14:45:30Z",
  "exportData": {
    "version": "1.0.0",
    "gallery": {...},
    "files": [...]
  }
}
```

Das `exportData` JSON folgt dem Schema in `schemas/gallery_meta.schema.json`.

### Delete Operations

#### 9. File löschen
```http
DELETE /api/gallery/:galleryId/files/:fileId

Response: 200 OK
{
  "message": "File deleted"
}
```

#### 10. Annotation löschen
```http
DELETE /api/gallery/annotation/:id

Response: 200 OK
{
  "message": "Annotation deleted"
}
```

## 🔄 Workflow-Beispiel

```bash
# 1. Login
curl -c cookies.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pix.immo","password":"Test2025!"}'

# 2. Gallery erstellen
curl -b cookies.txt -X POST http://localhost:5000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{"type":"customer_upload","name":"Test Gallery"}'

# 3. Datei hochladen
curl -b cookies.txt -X POST http://localhost:5000/api/gallery/1/upload \
  -F "files=@image.jpg"

# 4. Settings ändern
curl -b cookies.txt -X PATCH http://localhost:5000/api/gallery/1/files/1/settings \
  -H "Content-Type: application/json" \
  -d '{"stylePreset":"EDITORIAL","verticalCorrection":true}'

# 5. Gallery finalisieren
curl -b cookies.txt -X POST http://localhost:5000/api/gallery/1/finalize

# 6. Export abrufen
curl -b cookies.txt http://localhost:5000/api/gallery/1 | jq .exportData
```

## 📐 Schema Validierung

**Schema validieren:**
```bash
node scripts/validate-meta.js
```

**Output:**
```
✅ gallery_meta.json ist gültig!

📊 Sample enthält:
  • Gallery: Luxury Villa Hamburg (customer_upload)
  • Files: 2
  • Status: finalized
  • Exported: 2025-10-25T14:45:30.000Z
```

## 🎯 Error Handling

### Häufige Fehler

**400 Bad Request - Validation Error:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "stylePreset",
      "message": "Invalid enum value. Expected 'PURE' | 'EDITORIAL' | 'CLASSIC'"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Gallery not found"
}
```

## 💾 Storage

**Cloudflare R2 Bucket-Struktur:**
```
galleries/
├── {galleryId}/
│   ├── {timestamp}-{filename}.{ext}      # Original files
│   ├── thumbnails/
│   │   └── {timestamp}-{filename}.jpg    # Generated thumbnails (600x600)
│   └── masks/
│       └── {timestamp}-{filename}.png    # Annotation masks
```

**Thumbnail-Generierung:**
- Automatisch via Sharp
- Max. 600x600px
- JPEG-Format (80% Qualität)
- Unterstützt RAW-Formate

## 🔧 Development

**Server starten:**
```bash
npm run dev
```

**Schema validieren:**
```bash
node scripts/validate-meta.js
```

**Datenbank pushen:**
```bash
npm run db:push
```
