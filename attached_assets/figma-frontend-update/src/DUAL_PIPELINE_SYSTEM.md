# 🔄 Zweigleisiges Editor-Pipeline-System

## Übersicht

Das pix.immo Editor-System verarbeitet zwei getrennte Upload-Quellen, die durch dieselbe Bearbeitungs-Pipeline laufen, aber in unterschiedlichen Kundengalerien landen:

### 1️⃣ **App-Pipeline** (Self-Service)
- **Quelle:** pixcapture.app iPhone App
- **Upload:** Kunden fotografieren selbst mit der App
- **Ziel-Galerie:** `https://pixcapture.app/app-gallery`
- **Branding:** pixcapture.app (Sekundärfarben #74A4EA, #64BF49)
- **Use Case:** Self-Service für Makler, kleinere Immobilienprojekte

### 2️⃣ **Professional-Pipeline**
- **Quelle:** Professionelle Shootings von pix.immo Fotografen
- **Upload:** Über `/upload-editing-team` oder Direktupload
- **Ziel-Galerie:** `https://pix.immo/galerie/{jobId}`
- **Branding:** pix.immo (Primärfarbe #1A1A1C)
- **Use Case:** Hochwertige Immobilienfotografie, Premium-Kunden

---

## 📋 Workflow

### Phase 1: Upload & Quality Check
```
┌─────────────────┐         ┌──────────────────┐
│  App-Upload     │────────▶│                  │
│  (pixcapture)   │         │  QC Dashboard    │
└─────────────────┘         │  Quality Check   │
                            │                  │
┌─────────────────┐         │  - Technische    │
│  Professional   │────────▶│    Prüfung       │
│  Upload         │         │  - Freigabe      │
└─────────────────┘         │  - Ablehnung     │
                            └──────────┬───────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │ Editor-Zuweisung │
                            │                  │
                            │ - Auto-Assign    │
                            │ - Manuell        │
                            └──────────────────┘
                                     │
                                     ▼
```

### Phase 2: Editing
```
                            ┌──────────────────┐
                            │                  │
                            │ Editor Dashboard │
                            │                  │
                            │ - Gemeinsame     │
                            │   Bearbeitung    │
                            │ - Filter: App    │
                            │   oder Pro       │
                            │ - Filter: Editor │
                            └──────────────────┘
                                     │
                                     ▼
```

### Phase 3: Delivery & Gallery Routing
```
                            ┌──────────────────┐
                            │                  │
                            │ Gallery Router   │
                            │                  │
                            └────────┬─────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
         ┌─────────────────────┐         ┌──────────────────────┐
         │  App-Galerie        │         │  Professional        │
         │  pixcapture.app     │         │  Galerie pix.immo    │
         │                     │         │                      │
         │  - Self-Service     │         │  - Premium-Kunden    │
         │  - Push: App-Icon   │         │  - Push: pix.immo    │
         └─────────────────────┘         └──────────────────────┘
```

---

## 🗂️ Neue Seiten & Komponenten

### Seiten

| Datei | Funktion | Features |
|-------|----------|----------|
| `/pages/qc-quality-check.tsx` | Quality Check Dashboard | - Bulk-Approve<br>- Technische Issues markieren<br>- Revision anfordern<br>- Source-Badge (App/Pro)<br>- **Editor-Zuweisung** |
| `/pages/editor-dashboard.tsx` | Editor Jobübersicht | - Filter nach Source<br>- Prioritäten<br>- Status-Tracking |
| `/pages/editor-job-detail.tsx` | Einzelner Job mit Bildern | - Source-Anzeige<br>- Delivery mit Gallery-Routing<br>- Push-Notification |
| `/pages/admin-editor-management.tsx` | **Editor-Verwaltung** | - Team-Übersicht<br>- Auslastungs-Monitoring<br>- Performance-Metriken<br>- Status-Management |

### Utilities

| Datei | Funktion |
|-------|----------|
| `/utils/gallery-router.ts` | Gallery Routing Logic |
| `/utils/push-templates.ts` | Push-Nachrichten Templates |
| `/utils/editor-assignment.ts` | **Editor-Zuweisung & Auto-Assign** |

---

## 🏷️ Source-Kennzeichnung

Jeder Job hat ein `source` Property:

```typescript
type UploadSource = 'app' | 'professional';

interface EditorJob {
  jobId: string;
  customer: string;
  source: UploadSource;  // 👈 Routing-Entscheidung
  // ...
}
```

### Visuelle Kennzeichnung

**App-Upload Badge:**
```tsx
<Badge className="bg-[#74A4EA]/10 text-[#74A4EA]">
  <Smartphone /> App-Upload
</Badge>
```

**Professional Badge:**
```tsx
<Badge className="bg-[#1A1A1C]/10 text-[#1A1A1C]">
  <Camera /> Professional
</Badge>
```

---

## 🎯 Gallery Routing

### Routing-Funktion

```typescript
import { getGalleryDestination } from '/utils/gallery-router';

const destination = getGalleryDestination('app', '20251106-AB123');
// Returns:
// {
//   type: 'app',
//   url: 'https://pixcapture.app/gallery/20251106-AB123',
//   customerPortal: 'https://pixcapture.app/app-gallery',
//   apiEndpoint: '/api/galleries/app/20251106-AB123/deliver'
// }
```

### Push-Benachrichtigungen

```typescript
import { getPushNotificationConfig } from '/utils/gallery-router';

const pushConfig = getPushNotificationConfig('app');
// Returns:
// {
//   title: 'pix.immo',
//   messageDE: 'Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.',
//   messageEN: 'Your edited photos are now available in your gallery.',
//   deeplink: 'pixcapture://app-gallery'
// }
```

---

## 🔐 Backend-Integration (ToDo)

### API-Endpunkte

#### 1. Delivery Endpoint
```http
POST /api/galleries/{source}/{jobId}/deliver
Content-Type: application/json

{
  "images": ["img1.jpg", "img2.jpg"],
  "editorId": "sarah-m",
  "timestamp": "2025-11-06T18:30:00Z"
}
```

#### 2. Push Notification Trigger
```http
POST /internal/notify
Content-Type: application/json
X-Signature: HMAC-SHA256

{
  "event": "push_edit_done",
  "userId": "user-123",
  "jobId": "20251106-AB123",
  "source": "app",
  "language": "de"
}
```

### Datenhaltung

#### D1 Database Schema
```sql
-- Jobs Table
CREATE TABLE jobs (
  job_id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK(source IN ('app', 'professional')),
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME
);

-- Images Table
CREATE TABLE images (
  image_id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(job_id),
  filename TEXT NOT NULL,
  qc_status TEXT CHECK(qc_status IN ('pending', 'approved', 'rejected', 'needs-revision')),
  delivery_gallery TEXT CHECK(delivery_gallery IN ('app', 'professional')),
  delivered BOOLEAN DEFAULT FALSE
);
```

#### R2 Storage Structure
```
/uploads/
  /app/
    /20251106-AB123/
      /raw/          # Original Uploads
      /edited/       # Bearbeitete Bilder
  /professional/
    /20251105-CD456/
      /raw/
      /edited/
```

---

## 📊 Quality Check Workflow

### Status-Lifecycle

```
pending → approved → delivered
   ↓           ↑
rejected   needs-revision
```

### QC-Kriterien

**Technische Issues (Auto-Detection):**
- ❌ Unterbelichtet / Überbelichtet
- ❌ Weißabgleich inkorrekt
- ❌ Unscharf / Motion Blur
- ❌ Reflexionen
- ❌ Perspektivkorrektur fehlt

**Manuelle Checks:**
- ✅ Raumqualität (aufgeräumt, sauber)
- ✅ Styling (Kissen, Deko positioniert)
- ✅ Keine störenden Elemente
- ✅ Korrekte Raumzuordnung

---

## 🚀 Filter-System

### Editor Dashboard Filter

```typescript
// Status Filter
'alle' | 'neu' | 'in-bearbeitung' | 'revision' | 'fertig' | 'geliefert'

// Source Filter
'alle' | 'app' | 'professional'

// Priority Filter
'alle' | 'normal' | 'hoch' | 'dringend'
```

### Beispiel-Filter-Kombination
```
Status: neu
Source: app
Priority: dringend
→ Zeigt nur neue, dringende App-Uploads
```

---

## 📱 Push-Benachrichtigungen

### Events

| Event | Trigger | Empfänger | Galerie |
|-------|---------|-----------|---------|
| `push_upload_done` | Upload abgeschlossen | Kunde | - |
| `push_job_confirmed` | QC freigegeben | Kunde | - |
| `push_edit_done` | Editor liefert | Kunde | App/Pro |
| `push_editor_comment` | Rückfrage | Kunde | - |

### Delivery Push
```typescript
// App-Upload
{
  titleDE: "pix.immo",
  messageDE: "Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.",
  deeplink: "pixcapture://app-gallery"
}

// Professional
{
  titleDE: "pix.immo",
  messageDE: "Ihre professionellen Aufnahmen wurden bearbeitet und sind jetzt verfügbar.",
  deeplink: "pixcapture://dashboard"
}
```

---

## 🎨 Design-System

### App-Pipeline (pixcapture.app)
- **Primary:** #74A4EA (Blau)
- **Secondary:** #64BF49 (Grün)
- **Background:** #F9F9F7
- **Icon:** `<Smartphone />`

### Professional-Pipeline (pix.immo)
- **Primary:** #1A1A1C (Dunkelgrau)
- **Secondary:** #64BF49 (Grün)
- **Background:** #F9F9F7
- **Icon:** `<Camera />`

---

## ✅ Checkliste: Editor-Workflow

- [ ] Upload kommt in `/eingegangene-uploads` an
- [ ] Source wird korrekt erkannt (app/professional)
- [ ] QC prüft technische Qualität
- [ ] Bei Issues: Ablehnung mit Kommentar
- [ ] Bei Freigabe: An Editor-Dashboard weitergeleitet
- [ ] Editor bearbeitet Bilder (gemeinsame Pipeline)
- [ ] Delivery → Gallery-Router entscheidet Ziel
- [ ] Push-Benachrichtigung an Kunden
- [ ] Bilder landen in korrekter Galerie (App vs. Pro)

---

## 🔮 Zukünftige Erweiterungen

1. **Auto-QC mit AI**
   - Belichtung, Weißabgleich, Schärfe automatisch prüfen
   - ML-basierte Qualitätsbewertung

2. **Batch-Processing**
   - Preset-Anwendung auf mehrere Bilder
   - Bulk-Editing für wiederkehrende Kunden

3. **Customer-Feedback Loop**
   - Kunden können Änderungswünsche direkt in Galerie angeben
   - Revision-Requests zurück an Editor

4. **Analytics Dashboard**
   - Durchschnittliche Bearbeitungszeit
   - QC-Erfolgsrate (App vs. Pro)
   - Editor-Performance-Metriken

---

## 📞 Support & Dokumentation

**Frontend:**
- `/pages/qc-quality-check.tsx` - Quality Check Dashboard
- `/pages/editor-dashboard.tsx` - Editor Übersicht
- `/pages/editor-job-detail.tsx` - Einzelner Job
- `/utils/gallery-router.ts` - Routing-Logic

**Backend (Cloudflare Workers):**
- `POST /api/galleries/{source}/{jobId}/deliver`
- `POST /internal/notify`

**Weitere Docs:**
- `PUSH_SYSTEM.md` - Push-Benachrichtigungen
- `UPLOAD_FLOW.md` - Upload-Workflow
- `GALLERY_SYSTEM.md` - Galerie-Struktur
