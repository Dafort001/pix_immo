# 📱 pixcapture.app – Platform Expansion & Support System

## Übersicht

pixcapture.app wurde erweitert um:
1. **Android-Zugang** (Upload von Android-Geräten)
2. **Help-Seite** mit Schritt-für-Schritt-Anleitung
3. **Experten-Call-Buchung** (Video/Telefon-Support)
4. **Verbesserte Navigation** (Hilfe im Footer)

---

## 🆕 Neue Seiten

### 1. `/pixcapture-help` – Hilfe & Funktionen

**Zweck:** Vollständige Anleitung zur App-Nutzung

**Inhalte:**
- **5 Hauptschritte** (Fotografieren, Upload, Stil, Bezahlung, Status)
- **Expandable Steps** (Klick öffnet Details + Video-Placeholder)
- **Platform Support** (iPhone vs. Android Features)
- **FAQ-Sektion** (6 häufig gestellte Fragen)
- **CTA** zu Experten-Call

**Features:**
```tsx
const steps = [
  { id: 1, icon: Camera, title: 'Fotografieren', ... },
  { id: 2, icon: Upload, title: 'Upload starten', ... },
  { id: 3, icon: Palette, title: 'Stil auswählen', ... },
  { id: 4, icon: CreditCard, title: 'Bezahlung', ... },
  { id: 5, icon: Bell, title: 'Status & Benachrichtigungen', ... },
];
```

**Design-Highlights:**
- Gradient-Hero (Blau → Grün)
- Interaktive Step-Cards (Click to Expand)
- Video-Placeholder (Play-Icon + "Demnächst verfügbar")
- Zwei Platform-Cards (iPhone / Android)

---

### 2. `/pixcapture-expert-call` – Experten-Call Buchung

**Zweck:** Kostenlose Beratungsgespräche buchen

**Inhalte:**
- **Call-Type Auswahl** (Video oder Telefon)
- **Themen-Auswahl** (6 Kategorien)
- **Expert-Profile** (3 Experten mit Spezialisierung)
- **Buchungsformular** (Name, E-Mail, Telefon, Wunschtermin)

**Themen:**
```typescript
const topics = [
  { value: 'smartphone-photo', label: 'Smartphone-Fotografie-Tipps' },
  { value: 'app-usage', label: 'App-Nutzung & Funktionen' },
  { value: 'style-selection', label: 'Stilauswahl & Bearbeitung' },
  { value: 'pricing', label: 'Preise & Pakete' },
  { value: 'technical', label: 'Technischer Support' },
  { value: 'other', label: 'Sonstiges' },
];
```

**Experten-Profile:**
| Name | Rolle | Spezialisierung | Verfügbarkeit |
|------|-------|-----------------|---------------|
| Lisa Schneider | Fotografie-Expertin | Smartphone & Staging | Mo-Fr 9-18 Uhr |
| Thomas Wagner | Technischer Support | App & Upload | Mo-Fr 8-20 Uhr |
| Sarah Müller | Beratung & Bearbeitung | Stilwahl & Optimierung | Di-Sa 10-16 Uhr |

**Integration-Hinweis:**
```typescript
// TODO: Integration mit TidyCal / Google Calendar API
const handleSubmit = (formData) => {
  // POST /api/expert-calls/request
  // Response: { confirmationId, suggestedTimes[] }
}
```

---

### 3. `/app-upload` – Android-Support

**Neu:** Upload-Source-Selection am Anfang

**Optionen:**
1. **iPhone Kamera** (Native Integration)
   - Badge: "Empfohlen"
   - Icon: Camera
   - Farbe: Blau (#74A4EA)
   - Features: HDR, Wasserwaage, Pro-Controls

2. **Android / Dateien auswählen** (File Picker)
   - Badge: "Neu"
   - Icon: Smartphone
   - Farbe: Grün (#64BF49)
   - Features: Galerie, Auto-Kompression, Google Drive

**UI-Flow:**
```
┌─────────────────────────────────────┐
│  Upload von:                        │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📷 iPhone Kamera             │  │
│  │ Empfohlen                    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 📱 Android / Dateien         │  │
│  │ Neu                          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Implementierung:**
```tsx
const [uploadSource, setUploadSource] = useState<'camera' | 'files' | null>(null);

// iPhone Option
<button onClick={() => {
  setUploadSource('camera');
  setLocation('/app-camera');
}}>
  <Camera /> iPhone Kamera
</button>

// Android Option
<button onClick={() => {
  setUploadSource('files');
  // TODO: Trigger file picker
  // - Android: Intent to photo gallery
  // - Web: <input type="file" multiple accept="image/*">
}}>
  <Smartphone /> Android / Dateien auswählen
</button>
```

---

## 🧭 Navigation & Footer

### Navigation (Main Menu)

**Neue Struktur:**
```
Start               → /pixcapture-home
Upload              → /app-upload
Hilfe               → /pixcapture-help (NEU)
Expertengespräch    → /pixcapture-expert-call (NEU)
Mein Konto          → /app-login
```

### Footer (FooterPixCapture.tsx)

**Aktualisiert:**
```tsx
<footer>
  Hilfe                    → /pixcapture-help
  Experten-Support         → /pixcapture-expert-call
  |
  Impressum               → /pixcapture-impressum
  Datenschutz             → /pixcapture-datenschutz
  AGB                     → /pixcapture-agb
  |
  pix.immo (External)     → https://pix.immo
</footer>
```

---

## 📱 Platform-Spezifikationen

### iPhone (iOS 14+)

**Supported Features:**
- ✅ Native Camera Integration (`/app-camera`)
- ✅ HDR & Bracket-Shooting
- ✅ Wasserwaage / Level-Indicator
- ✅ Pro-Controls (ISO, Shutter, EV)
- ✅ Push-Benachrichtigungen
- ✅ iCloud-Sync (optional)

**Camera API:**
```typescript
// iOS Native Camera
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',
    width: { ideal: 4032 },
    height: { ideal: 3024 },
  }
});
```

### Android (Android 10+)

**Supported Features:**
- ✅ File Picker (Galerie-Auswahl)
- ✅ Automatische Kompression
- ✅ EXIF-Metadata-Extraktion
- ✅ Push-Benachrichtigungen
- ✅ Google Drive-Integration (optional)
- ⚠️ Kamera-Features eingeschränkt (Browser-Limitierung)

**File Upload API:**
```typescript
// Android File Picker
<input 
  type="file" 
  multiple 
  accept="image/*"
  capture="environment"  // Optional: Direkt Kamera öffnen
  onChange={handleFileUpload}
/>
```

**Unterschiede:**
| Feature | iPhone | Android |
|---------|--------|---------|
| Native Kamera | ✅ Full Control | ⚠️ Limited |
| HDR-Bracketing | ✅ | ❌ |
| Wasserwaage | ✅ | ❌ |
| Pro-Controls | ✅ | ❌ |
| File Upload | ✅ | ✅ |
| Push Notifications | ✅ | ✅ |
| Background Upload | ✅ | ✅ |

---

## 🎥 Video-Tutorial Placeholders

### Struktur

**Jeder Step hat einen Video-Placeholder:**
```tsx
<div className="bg-[#F0F0F0] rounded-lg aspect-video">
  <Play className="h-12 w-12 text-[#74A4EA]" />
  <p>Tutorial: Professionell fotografieren</p>
  <Button disabled>Demnächst verfügbar</Button>
</div>
```

**Geplante Videos:**
1. **Fotografieren** (3-5 Min.)
   - Wasserwaage aktivieren
   - HDR nutzen
   - Richtige Perspektive
   - Licht-Tipps

2. **Upload** (2-3 Min.)
   - Upload starten
   - Fortschritt überwachen
   - Was tun bei Fehler?

3. **Stilwahl** (2 Min.)
   - Natural vs. Bright vs. Dramatic
   - Beispielvergleiche
   - Änderung möglich

4. **Bezahlung** (1-2 Min.)
   - Preisübersicht
   - Zahlungsmethoden
   - Rechnung erhalten

5. **Status** (1 Min.)
   - Push-Benachrichtigungen
   - Download aus Galerie

**Video-Integration (zukünftig):**
```tsx
// YouTube Embed
<iframe 
  src="https://www.youtube.com/embed/VIDEO_ID"
  width="100%"
  height="100%"
  frameBorder="0"
  allow="autoplay; fullscreen"
/>

// Vimeo Embed
<iframe 
  src="https://player.vimeo.com/video/VIDEO_ID"
  width="100%"
  height="100%"
  frameBorder="0"
  allow="autoplay; fullscreen"
/>
```

---

## 📞 Expert-Call API Integration

### Backend-Endpoints (ToDo)

#### 1. Create Call Request
```http
POST /api/expert-calls/request
Content-Type: application/json

{
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49 40 1234567",
  "company": "Immobilien Mustermann GmbH",
  "callType": "video",
  "topic": "smartphone-photo",
  "preferredDate": "2025-11-08",
  "preferredTime": "14:00",
  "message": "Ich brauche Hilfe bei der Smartphone-Fotografie..."
}

Response:
{
  "requestId": "CALL-20251106-001",
  "status": "pending",
  "suggestedTimes": [
    "2025-11-08T14:00:00Z",
    "2025-11-08T16:00:00Z",
    "2025-11-09T10:00:00Z"
  ],
  "assignedExpert": {
    "id": "expert-001",
    "name": "Lisa Schneider",
    "email": "lisa@pix.immo"
  }
}
```

#### 2. Confirm Call Time
```http
POST /api/expert-calls/:requestId/confirm
Content-Type: application/json

{
  "confirmedTime": "2025-11-08T14:00:00Z",
  "timezone": "Europe/Berlin"
}

Response:
{
  "callId": "CALL-20251106-001",
  "status": "confirmed",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "calendarEvent": {
    "ics": "BEGIN:VCALENDAR...",
    "googleCalendar": "https://calendar.google.com/..."
  }
}
```

#### 3. TidyCal Integration
```http
POST https://tidycal.com/api/bookings
Authorization: Bearer TIDYCAL_API_KEY
Content-Type: application/json

{
  "event_type_id": "expert-call-15min",
  "start_time": "2025-11-08T14:00:00Z",
  "name": "Max Mustermann",
  "email": "max@beispiel.de",
  "phone": "+49 40 1234567",
  "notes": "Thema: Smartphone-Fotografie"
}
```

### Email-Templates

**Confirmation Email (an Kunde):**
```html
Subject: Dein Experten-Call wurde angefragt ✅

Hallo Max,

vielen Dank für deine Anfrage!

📅 Wunschtermin: 08.11.2025, 14:00 Uhr
👤 Experte: Lisa Schneider
📞 Art: Video-Call (Google Meet)
💬 Thema: Smartphone-Fotografie-Tipps

Wir melden uns innerhalb von 24 Stunden per E-Mail oder Telefon, 
um den Termin zu bestätigen.

Bis bald!
Das pixcapture.app Team
```

**Notification Email (an Experten):**
```html
Subject: Neue Call-Anfrage: Max Mustermann

Neue Experten-Call-Anfrage:

Name: Max Mustermann
Firma: Immobilien Mustermann GmbH
Thema: Smartphone-Fotografie-Tipps
Wunschtermin: 08.11.2025, 14:00 Uhr
Call-Art: Video

Nachricht:
"Ich brauche Hilfe bei der Smartphone-Fotografie..."

→ Jetzt bestätigen: https://admin.pixcapture.app/calls/CALL-20251106-001
```

---

## 🎨 Design-System

### Farben (pixcapture.app)

| Element | Primär | Sekundär | Hintergrund |
|---------|--------|----------|-------------|
| **App-Pipeline** | #74A4EA (Blau) | #64BF49 (Grün) | #F9F9F7 (Off-White) |
| **Professional** | #1A1A1C (Grau) | #64BF49 (Grün) | #F9F9F7 (Off-White) |

### Icons

| Platform | Icon | Farbe |
|----------|------|-------|
| iPhone | `<Camera />` | #74A4EA |
| Android | `<Smartphone />` | #64BF49 |
| Video-Call | `<Video />` | #74A4EA |
| Telefon | `<Phone />` | #64BF49 |

### Badges

**Empfohlen:**
```tsx
<Badge className="bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20">
  Empfohlen
</Badge>
```

**Neu:**
```tsx
<Badge className="bg-[#64BF49]/10 text-[#64BF49] border-[#64BF49]/20">
  Neu
</Badge>
```

---

## 🧪 Testing

### Test-Szenarien

#### 1. iPhone Upload Flow
```bash
1. App öffnen → /pixcapture-home
2. Upload klicken → /app-upload
3. "iPhone Kamera" wählen
4. Fotos aufnehmen → /app-camera
5. Upload abschließen
6. Verify: Photos in App-Galerie
```

#### 2. Android Upload Flow
```bash
1. App öffnen → /pixcapture-home
2. Upload klicken → /app-upload
3. "Android / Dateien" wählen
4. File Picker öffnet sich
5. Bilder aus Galerie auswählen
6. Upload abschließen
7. Verify: Photos in App-Galerie
```

#### 3. Help-Seite Navigation
```bash
1. Footer → "Hilfe" klicken
2. Verify: /pixcapture-help öffnet
3. Step 1 klicken → Expand
4. Verify: Details + Video-Placeholder angezeigt
5. "Experten-Call buchen" klicken
6. Verify: /pixcapture-expert-call öffnet
```

#### 4. Expert-Call Buchung
```bash
1. /pixcapture-expert-call öffnen
2. Call-Type: Video wählen
3. Formular ausfüllen (Name, E-Mail, Telefon)
4. Thema: "Smartphone-Fotografie" wählen
5. Datum/Zeit eingeben
6. Submit
7. Verify: Success-Toast + Email-Bestätigung
```

---

## 📊 Analytics & Tracking

### Events

**Help-Seite:**
```javascript
// Step Expand
analytics.track('help_step_expanded', {
  step: 1,
  title: 'Fotografieren'
});

// Video-Placeholder Click
analytics.track('help_video_placeholder_clicked', {
  video: 'tutorial_fotografieren'
});
```

**Expert-Call:**
```javascript
// Form Submit
analytics.track('expert_call_requested', {
  callType: 'video',
  topic: 'smartphone-photo',
  source: 'help_page'
});

// Call Confirmed
analytics.track('expert_call_confirmed', {
  callId: 'CALL-20251106-001',
  expert: 'Lisa Schneider'
});
```

**Android Upload:**
```javascript
// Source Selection
analytics.track('upload_source_selected', {
  source: 'android_files',
  platform: 'android'
});

// Upload Complete
analytics.track('upload_completed', {
  source: 'android_files',
  fileCount: 24,
  totalSize: '45.2 MB'
});
```

---

## 🚀 Deployment Checklist

### Frontend
- [x] `/pixcapture-help` erstellt
- [x] `/pixcapture-expert-call` erstellt
- [x] `/app-upload` erweitert (Android-Option)
- [x] `FooterPixCapture` aktualisiert
- [ ] Routing in `App.tsx` hinzufügen
- [ ] Mobile-Responsive testen
- [ ] Dark-Mode testen

### Backend (ToDo)
- [ ] POST `/api/expert-calls/request` implementieren
- [ ] TidyCal API-Integration
- [ ] Email-Templates erstellen
- [ ] Google Calendar Integration
- [ ] Admin-Dashboard für Call-Verwaltung

### Content
- [ ] Video-Tutorials aufnehmen
- [ ] FAQ-Inhalte vervollständigen
- [ ] Experten-Profile mit echten Daten
- [ ] Screenshot-Guides erstellen

---

## 📚 Weitere Dokumentation

- `PIXCAPTURE_APP_STRUCTURE.md` - App-Architektur
- `DUAL_PIPELINE_SYSTEM.md` - Pipeline-System
- `UPLOAD_FLOW.md` - Upload-Prozess
- `PUSH_SYSTEM.md` - Push-Benachrichtigungen

---

**Status:** ✅ Frontend implementiert  
**Backend-Integration:** 🚧 Ausstehend  
**Video-Tutorials:** ⏳ Geplant  
**Last Updated:** 2025-11-06
