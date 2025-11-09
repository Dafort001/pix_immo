# 👥 Editor-Zuweisungssystem

## Übersicht

Das pix.immo Editor-Zuweisungssystem ermöglicht es, Jobs intelligent an verschiedene Editoren zu verteilen – entweder automatisch (Auto-Assign) oder manuell. Das System berücksichtigt Auslastung, Spezialisierung, Qualität und Pipeline-Präferenzen.

---

## 🎯 Features

### ✅ Auto-Assign (Smart Matching)
- **Automatische Zuweisung** basierend auf Multi-Faktor-Scoring
- Berücksichtigt: Workload, Qualität, Turnaround-Zeit, Spezialisierung
- Optimiert für schnellste Bearbeitung bei höchster Qualität

### 👤 Manuelle Zuweisung
- **Admin/QC kann explizit wählen** welcher Editor den Job bekommt
- Übersicht über verfügbare Editoren mit Live-Statistiken
- Warnings bei Überlastung oder Offline-Status

### 📊 Performance-Tracking
- **Qualitätsscore** (0-100%)
- **Durchschnittliche Bearbeitungszeit** (in Stunden)
- **Abgeschlossene Jobs** (Lifetime-Counter)
- **Aktuelle Auslastung** (Current/Max Jobs)

### 🔄 Pipeline-Präferenzen
- Editoren können **bevorzugte Pipelines** haben (App vs. Professional)
- Auto-Assign berücksichtigt diese Präferenzen

---

## 👨‍💻 Editor-Profile

### Struktur

```typescript
interface Editor {
  id: string;                          // Eindeutige ID
  name: string;                        // Vollständiger Name
  email: string;                       // Kontakt-Email
  status: EditorStatus;                // available | busy | offline
  specialization: EditorSpecialization[];  // Spezialisierungen
  currentJobs: number;                 // Aktuell zugewiesene Jobs
  maxJobs: number;                     // Maximale Kapazität
  completedJobs: number;               // Abgeschlossene Jobs (gesamt)
  avgTurnaroundHours: number;          // Ø Bearbeitungszeit
  qualityScore: number;                // 0-100 (aus QC-Feedback)
  preferredSources?: ('app' | 'professional')[]; // Pipeline-Präferenz
}
```

### Spezialisierungen

| Typ | Beschreibung |
|-----|--------------|
| `interior` | Innenaufnahmen (Wohnzimmer, Küche, Bad, etc.) |
| `exterior` | Außenaufnahmen (Fassade, Garten) |
| `twilight` | Blaue Stunde / Dämmerungsaufnahmen |
| `aerial` | Drohnenaufnahmen |
| `luxury` | High-End Immobilien |
| `standard` | Standard-Bearbeitung |

### Status

| Status | Bedeutung |
|--------|-----------|
| `available` | 🟢 Verfügbar, kann Jobs annehmen |
| `busy` | 🟠 Ausgelastet (>70% Kapazität) |
| `offline` | 🔴 Nicht verfügbar (Urlaub, krank, etc.) |

---

## 🤖 Auto-Assign Algorithmus

### Scoring-System

Der Auto-Assign-Algorithmus vergibt Punkte (0-100) basierend auf:

```typescript
// Gewichtung der Faktoren:
const score = 
  workloadScore * 0.40 +      // 40% - Verfügbarkeit
  qualityScore * 0.30 +        // 30% - Qualität
  turnaroundScore * 0.20 +     // 20% - Geschwindigkeit
  bonuses * 0.10;              // 10% - Priorität, Source-Match
```

### Workload-Score (40%)
- Basiert auf **aktueller Auslastung**
- Editor mit 2/8 Jobs = höherer Score als 6/8 Jobs
- Formel: `(1 - currentJobs/maxJobs) * 40`

### Quality-Score (30%)
- Basiert auf **historischem Qualitätsscore**
- Aus QC-Feedback (Ablehnungsrate, Revisionen)
- Formel: `(qualityScore / 100) * 30`

### Turnaround-Score (20%)
- **Schnellere Editoren** erhalten höheren Score
- Durchschnittliche Bearbeitungszeit in Stunden
- Formel: `max(0, 100 - avgTurnaroundHours * 2) / 100 * 20`

### Bonus-Punkte (10%)
- **Prioritäts-Bonus:** +10 Punkte für dringende Jobs wenn Editor <20h avg.
- **Source-Präferenz-Bonus:** +10 Punkte wenn Editor diese Pipeline bevorzugt

### Beispiel-Berechnung

**Job:** 20251106-AB123 (App-Upload, 24 Bilder, Priorität: Normal)

**Editor-Kandidaten:**

| Editor | Workload | Quality | Turnaround | Bonuses | **Total** |
|--------|----------|---------|------------|---------|-----------|
| Sarah M. | 30 (2/8) | 29.4 (98%) | 16.4 (18h) | +10 (Pro) | **85.8** |
| Tom K. | 20 (5/10) | 28.8 (96%) | 16.8 (16h) | +10 (App) | **75.6** ← Winner! |
| Julia W. | 5 (7/8) | 29.7 (99%) | 15.2 (24h) | +10 (Pro) | **59.9** |

**Gewinner:** Tom K. (höchster Score = 75.6)

---

## 📱 UI-Integration

### 1. QC Quality Check → Editor-Zuweisung

Nach erfolgreicher QC-Freigabe öffnet sich ein Dialog:

```tsx
<Dialog>
  <DialogTitle>Editor zuweisen</DialogTitle>
  <Select>
    <SelectItem value="auto">🤖 Auto-Assign (empfohlen)</SelectItem>
    <SelectItem value="editor-001">Sarah M. · 2/8 Jobs · 18h avg.</SelectItem>
    <SelectItem value="editor-002">Tom K. · 5/10 Jobs · 16h avg.</SelectItem>
    <SelectItem value="editor-003">Julia W. · 7/8 Jobs · 24h avg.</SelectItem>
  </Select>
</Dialog>
```

### 2. Admin Editor Management

Vollständige Editor-Verwaltung mit:

- **Team-Übersicht** (Grid mit allen Editoren)
- **Live-Statistiken** (Verfügbar, Ausgelastet, Offline)
- **Auslastungs-Anzeige** (Progress Bars)
- **Performance-Metriken** (Quality Score, Avg. Zeit)
- **Editor-Detail-Dialog** (Detaillierte Infos)

### 3. Editor Dashboard → Filter

Editoren sehen nur ihre eigenen Jobs:

```tsx
// Filter nach zugewiesenem Editor
const myJobs = jobs.filter(job => job.editorId === currentUser.id);
```

---

## 🔄 Workflow-Beispiele

### Szenario 1: Auto-Assign für Standard-Job

```
1. Kunde uploaded 24 Bilder via App
2. QC prüft und gibt 22 Bilder frei
3. QC klickt "An Editor senden"
4. Dialog öffnet sich → "Auto-Assign" ist vorausgewählt
5. QC bestätigt
6. System wählt Tom K. (beste Verfügbarkeit + App-Präferenz)
7. Tom K. erhält Benachrichtigung
8. Job erscheint in Tom's Editor Dashboard
```

### Szenario 2: Manuelle Zuweisung für Luxury-Job

```
1. Professional-Shooting mit 45 Luxury-Bildern
2. QC prüft und gibt alle frei
3. QC klickt "An Editor senden"
4. Dialog öffnet sich
5. QC wählt manuell "Julia W." (Luxury-Spezialisierung)
6. System zeigt Warning: "Editor ist ausgelastet (7/8 Jobs)"
7. QC bestätigt trotzdem (Julia ist Luxury-Expertin)
8. Julia erhält Benachrichtigung
9. Job wird mit Priority "hoch" markiert
```

### Szenario 3: Umverteilung bei Überlastung

```
1. Sarah M. hat 8/8 Jobs (voll ausgelastet)
2. Admin öffnet Editor Management
3. Klickt auf Sarah's Profil
4. System schlägt Reassignment vor:
   - "Tom K. hat freie Kapazität (5/10)"
   - "Max S. hat freie Kapazität (1/6)"
5. Admin verschiebt 2 Jobs von Sarah zu Tom
6. Sarah: 6/8 Jobs, Tom: 7/10 Jobs
```

---

## 🧮 Validierung & Warnings

### Validierungs-Checks bei Zuweisung

```typescript
validateAssignment(editorId, jobPriority) returns {
  valid: boolean;
  warnings: string[];
}
```

### Mögliche Warnings:

| Warning | Bedeutung |
|---------|-----------|
| Editor ist offline | Status = `offline` |
| Editor hat maximale Kapazität erreicht | `currentJobs >= maxJobs` |
| Editor ist nahezu ausgelastet | `currentJobs >= maxJobs * 0.8` |
| Längere Bearbeitungszeit bei dringendem Job | `avgTurnaroundHours > 24` && `priority === 'dringend'` |

**Admin kann Warnings ignorieren** und trotzdem zuweisen (z.B. bei Spezialisierung).

---

## 📊 Editor-Statistiken

### Globale Stats

```typescript
const stats = getEditorStats();
// Returns:
{
  totalEditors: 5,
  availableEditors: 3,
  busyEditors: 1,
  offlineEditors: 1,
  totalCurrentJobs: 15,
  totalCapacity: 40,
  capacityUtilization: 37.5,  // in %
  avgQualityScore: 96.8
}
```

### Editor-spezifische Stats

Für jeden Editor:
- **Workload-Ratio:** `currentJobs / maxJobs`
- **Completion-Rate:** `completedJobs` (Lifetime)
- **Quality-Score:** Aus QC-Feedback
- **Turnaround:** Durchschnittliche Bearbeitungszeit

---

## 🔮 Zukünftige Erweiterungen

### 1. Machine Learning-basiertes Matching
- **Job-Charakteristiken** (Bildanzahl, Räume, Stil)
- **Editor-Performance-Patterns** (Stärken bei bestimmten Job-Typen)
- **Lernende Algorithmen** optimieren Zuweisung über Zeit

### 2. Workload-Prognose
- **Vorausschauende Planung** basierend auf historischen Daten
- **"Dieser Editor wird in 2h frei"** Predictions
- **Auto-Balancing** bei ungleicher Verteilung

### 3. Editor-Präferenzen
- Editoren können **Spezialisierungen angeben**
- **Bevorzugte Arbeitszeiten** (z.B. nur Vormittags)
- **Job-Typen ablehnen** (z.B. keine Aerial-Shots)

### 4. Quality-Feedback-Loop
- **Automatische Score-Anpassung** basierend auf QC-Ergebnissen
- **Revisionen tracken** (mehr Revisionen = niedrigerer Score)
- **Kunden-Ratings** nach Delivery

### 5. Deadline-Integration
- **Automatische Deadline-Berechnung** (24h/48h/72h)
- **Editor-Auswahl basierend auf Deadline** (schnellste zuerst)
- **Escalation bei verpassten Deadlines**

---

## 🛠️ API-Integration (Backend ToDo)

### 1. Editor-Verwaltung

```http
GET /api/editors
GET /api/editors/:id
POST /api/editors
PUT /api/editors/:id
DELETE /api/editors/:id
```

### 2. Job-Zuweisung

```http
POST /api/jobs/:jobId/assign
{
  "editorId": "editor-002",
  "assignedBy": "admin-001",
  "priority": "hoch",
  "notes": "Bitte bis morgen 18:00 Uhr"
}
```

### 3. Auto-Assign

```http
POST /api/jobs/:jobId/auto-assign
{
  "source": "app",
  "imageCount": 24,
  "priority": "normal"
}

Response:
{
  "assignedEditor": {
    "id": "editor-002",
    "name": "Tom K.",
    "estimatedCompletion": "2025-11-07T18:00:00Z"
  }
}
```

### 4. Workload-Update

```http
PUT /api/editors/:id/workload
{
  "action": "increment" | "decrement",
  "jobId": "20251106-AB123"
}
```

### 5. Performance-Tracking

```http
POST /api/editors/:id/performance
{
  "jobId": "20251106-AB123",
  "completedAt": "2025-11-07T14:30:00Z",
  "qualityRating": 98,
  "revisionCount": 0
}
```

---

## 📈 Monitoring & Analytics

### Editor-Performance-Dashboard

**Metriken:**
- Jobs pro Tag/Woche/Monat
- Durchschnittliche Bearbeitungszeit (Trend)
- Qualitätsscore-Entwicklung
- Revisionsrate
- Deadline-Einhaltung

**Alerts:**
- ⚠️ Editor überlastet (>90% Kapazität)
- ⚠️ Qualitätsscore sinkt (<95%)
- ⚠️ Deadline verpasst
- ⚠️ Ungleiche Workload-Verteilung

---

## 🎓 Best Practices

### Für QC-Team:
1. **Nutze Auto-Assign für Standard-Jobs** (spart Zeit, ist optimiert)
2. **Manuell zuweisen bei Spezialisierung** (z.B. Luxury, Twilight)
3. **Workload regelmäßig prüfen** (Editor Management Dashboard)
4. **Warnings ernst nehmen** (überlastete Editoren = längere Bearbeitungszeit)

### Für Admins:
1. **Max-Jobs realistisch setzen** (basierend auf Editor-Feedback)
2. **Qualitätsscores pflegen** (aus echtem QC-Feedback)
3. **Spezialisierungen aktuell halten** (neue Skills hinzufügen)
4. **Workload ausbalancieren** (nicht alle Jobs auf einen Editor)

### Für Editoren:
1. **Status aktuell halten** (Urlaub → offline setzen)
2. **Feedback geben** bei falscher Zuweisung
3. **Spezialisierungen kommunizieren** (neue Fähigkeiten melden)

---

## 📋 Checkliste: Editor-Setup

- [ ] Editor in `/utils/editor-assignment.ts` hinzufügen
- [ ] Spezialisierungen definieren
- [ ] Bevorzugte Pipelines setzen (App/Pro)
- [ ] Max-Jobs festlegen (realistisch)
- [ ] Qualitätsscore initial auf 95% setzen
- [ ] Avg. Turnaround-Zeit schätzen (15-25h)
- [ ] Zugang zu Editor-Dashboard einrichten
- [ ] Push-Benachrichtigungen aktivieren

---

## 🔗 Related Documentation

- `DUAL_PIPELINE_SYSTEM.md` - Zweigleisiges Pipeline-System
- `PUSH_SYSTEM.md` - Push-Benachrichtigungen
- `QUALITY_CHECK_PROTOCOL.md` - QC-Richtlinien

---

**Status:** ✅ Implementiert (Frontend)  
**Backend-Integration:** 🚧 Ausstehend (Cloudflare Workers + D1)  
**Testing:** ⏳ Pending
