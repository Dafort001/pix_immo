# ⚡ Editor-System Quick Reference

## 🎯 Übersicht

**Zweigleisiges Pipeline-System** mit intelligentem Editor-Zuweisungssystem:

```
App-Upload (Self-Service) ──┐
                             ├──→ QC → Auto/Manual Assign → Editor → Galerie
Professional-Upload ─────────┘
```

---

## 📄 Neue Seiten

| Route | Beschreibung |
|-------|--------------|
| `/qc-quality-check` | Quality Check + Editor-Zuweisung |
| `/editor-dashboard` | Job-Übersicht (mit Source-Filter) |
| `/editor-job-detail` | Einzelner Job + Delivery |
| `/admin-editor-management` | Team-Verwaltung + Performance |

---

## 🔑 Key Features

### 1️⃣ Source-Trennung
- **App-Uploads** (📱 pixcapture.app) → `source: 'app'`
- **Professional-Uploads** (📷 pix.immo) → `source: 'professional'`
- Beide nutzen **dieselbe Editor-Pipeline**
- Landing in **unterschiedlichen Galerien**

### 2️⃣ Editor-Zuweisung
- **Auto-Assign** (🤖 empfohlen): Smart Matching
- **Manuelle Zuweisung**: Admin/QC wählt Editor
- **Scoring-System**: Workload (40%) + Qualität (30%) + Speed (20%) + Bonuses (10%)

### 3️⃣ Editor-Profile
```typescript
{
  name: "Sarah Müller",
  status: "available",
  specialization: ["interior", "luxury"],
  currentJobs: 2,
  maxJobs: 8,
  qualityScore: 98,
  avgTurnaroundHours: 18,
  preferredSources: ["professional"]
}
```

### 4️⃣ Gallery-Routing
```typescript
// App-Upload → pixcapture.app
getGalleryDestination('app', jobId)
// Professional → pix.immo
getGalleryDestination('professional', jobId)
```

---

## 🚀 Workflow

### QC → Editor-Zuweisung

1. QC prüft Bilder in `/qc-quality-check`
2. Freigabe mit "An Editor senden" Button
3. Dialog öffnet sich:
   - 🤖 Auto-Assign (empfohlen)
   - 👤 Manuell: Sarah M., Tom K., Julia W.
4. System weist Job zu
5. Editor erhält Benachrichtigung
6. Job erscheint in `/editor-dashboard`

### Editor → Delivery

1. Editor bearbeitet Bilder
2. Wählt bearbeitete Bilder aus
3. "Bilder liefern" Button
4. Delivery-Dialog zeigt Ziel-Galerie:
   - App → `pixcapture.app/app-gallery`
   - Pro → `pix.immo/galerie/{jobId}`
5. Push-Benachrichtigung an Kunden
6. Bilder erscheinen in Galerie

---

## 🧮 Auto-Assign Scoring

```
Score = Workload×0.4 + Qualität×0.3 + Speed×0.2 + Bonuses×0.1

Sarah M.: 85.8 Punkte
Tom K.:   75.6 Punkte ← Gewinner
Julia W.: 59.9 Punkte
```

**Faktoren:**
- 📊 Workload: Weniger Jobs = höher
- ⭐ Qualität: Historischer QC-Score
- ⚡ Speed: Schnellere Bearbeitung = höher
- 🎁 Bonuses: Pipeline-Match, Dringlichkeit

---

## 📱 UI-Elemente

### Source-Badges

**App:**
```tsx
<Badge className="bg-[#74A4EA]/10 text-[#74A4EA]">
  <Smartphone /> App-Upload
</Badge>
```

**Professional:**
```tsx
<Badge className="bg-[#1A1A1C]/10 text-[#1A1A1C]">
  <Camera /> Professional
</Badge>
```

### Status-Badges

- 🟢 `available` - Verfügbar
- 🟠 `busy` - Ausgelastet
- 🔴 `offline` - Offline

---

## 🛠️ Utilities

### `/utils/editor-assignment.ts`

```typescript
// Auto-Assign
autoAssignEditor(jobId, source, priority, imageCount)

// Verfügbare Editoren
getAvailableEditors({ source: 'app', maxCurrentJobs: 6 })

// Editor finden
getEditorById(editorId)

// Statistiken
getEditorStats()
```

### `/utils/gallery-router.ts`

```typescript
// Galerie-Ziel
getGalleryDestination(source, jobId)

// Push-Config
getPushNotificationConfig(source)

// Routing-Validierung
validateJobRouting(jobId, source)
```

---

## 🎨 Design-System

### Farben

| Element | App | Professional |
|---------|-----|--------------|
| Primary | #74A4EA (Blau) | #1A1A1C (Grau) |
| Secondary | #64BF49 (Grün) | #64BF49 (Grün) |
| Icon | 📱 Smartphone | 📷 Camera |

### Typo

- **Headlines:** Inter, 700, 24-32pt
- **Body:** Inter, 400, 13-14pt
- **Captions:** Inter, 400, 11-12pt

---

## 📊 Editor-Management

### Stats (Admin Dashboard)

- **Verfügbar:** 3/5 Editoren
- **Workload:** 15/40 Jobs (37.5%)
- **Avg. Qualität:** 96.8%

### Editor-Karte

```
┌─────────────────────────────────────────┐
│ SM  Sarah Müller        🟢 Verfügbar    │
│     sarah@pix.immo                      │
│                                         │
│ interior | luxury | professional        │
│                                         │
│ Workload: 2/8  [████░░░░] 25%          │
│ Qualität: 98%  |  Avg. Zeit: 18h       │
│ Abgeschlossen: 342                      │
└─────────────────────────────────────────┘
```

---

## ⚙️ Konfiguration

### Editor hinzufügen

1. In `/utils/editor-assignment.ts` → `EDITORS` Array
2. Properties setzen:
   - `name`, `email`, `status`
   - `specialization`: Array von Skills
   - `currentJobs`, `maxJobs`
   - `qualityScore` (initial: 95)
   - `avgTurnaroundHours` (initial: 18-24)
   - `preferredSources`: ['app'] oder ['professional']

### Source bei Job setzen

```typescript
const job = {
  jobId: '20251106-AB123',
  source: 'app',  // oder 'professional'
  // ...
}
```

---

## 🔔 Push-Benachrichtigungen

### Events

| Event | Trigger | Empfänger |
|-------|---------|-----------|
| `push_job_confirmed` | QC Freigabe | Kunde |
| `push_editor_assigned` | Job zugewiesen | Editor |
| `push_edit_done` | Delivery | Kunde |
| `push_editor_comment` | Rückfrage | Kunde |

### Templates

**Edit Done (App):**
```
Title: pix.immo
Message: Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.
Deeplink: pixcapture://app-gallery
```

**Edit Done (Professional):**
```
Title: pix.immo
Message: Ihre professionellen Aufnahmen wurden bearbeitet.
Deeplink: pixcapture://dashboard
```

---

## 🧪 Testing

### Scenario 1: App-Upload → Auto-Assign

```bash
1. Upload via /app-upload
2. QC → /qc-quality-check?id=20251106-AB123
3. Approve images
4. "An Editor senden" → Auto-Assign
5. Verify: Job appears in /editor-dashboard
6. Filter: source = 'app'
```

### Scenario 2: Professional → Manual Assign

```bash
1. Upload via /upload-editing-team
2. QC → /qc-quality-check?id=20251106-CD456
3. Approve images
4. "An Editor senden" → Manual: Julia W.
5. Verify: Job assigned to Julia
6. Julia's dashboard shows job
```

### Scenario 3: Editor → Delivery

```bash
1. Editor opens /editor-job-detail?id=20251106-AB123
2. Select edited images
3. "Bilder liefern"
4. Verify: Dialog shows correct gallery (App vs. Pro)
5. Confirm delivery
6. Verify: Customer receives push
7. Verify: Images in correct gallery
```

---

## 📚 Weitere Dokumentation

- `DUAL_PIPELINE_SYSTEM.md` - Komplettes Pipeline-System
- `EDITOR_ASSIGNMENT_SYSTEM.md` - Detailliertes Zuweisungssystem
- `PUSH_SYSTEM.md` - Push-Benachrichtigungen

---

**Last Updated:** 2025-11-06  
**Version:** 1.0  
**Status:** ✅ Production Ready (Frontend)
