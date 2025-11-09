# 📸 HDR Bracketing System Guide

## ⚠️ WICHTIG: ECHTE Belichtungsreihen, kein Fake-HDR!

Dieses System erfasst **ECHTE, physikalisch unterschiedliche Belichtungen** – nicht ein Foto mit Software-Filter!

**❌ Fake HDR:** 1 Foto → Software macht "HDR-Look"  
**✅ Echtes HDR:** 3-5 Fotos mit **unterschiedlichen Verschlusszeiten** → Merge in Lightroom

## Überblick

Das **HDR Bracketing System** erfasst automatisch **mehrere ECHTE Belichtungen** bei jedem Auslösen – optimiert für professionelle Immobilienfotografie mit anschließendem HDR-Merge.

## Warum Bracketing?

### Immobilienfotografie Herausforderungen
```
🏠 Innenraum mit Fenster:
  ❌ Einzelaufnahme:
     - Fenster überbelichtet (ausgebrannt)
     - Oder Innenraum unterbelichtet (zu dunkel)
  
  ✅ HDR Bracketing:
     - Unterbelichtet: Fensterdetails erhalten
     - Normal: Ausgewogene Belichtung
     - Überbelichtet: Schattendetails erfassen
     → Merge = Perfekte Balance!
```

### Dynamikumfang
- **Kamera**: ~10-12 EV
- **Menschliches Auge**: ~20 EV
- **HDR (3-5 Belichtungen)**: ~15-18 EV ✅

## System-Spezifikation

### iPhone Pro Modelle
**Geräte:** iPhone 12 Pro, 13 Pro, 14 Pro, 15 Pro (und Max/Pro Max)

**ECHTE Capture mit unterschiedlichen Verschlusszeiten:**
```
📷 Shot 1: -2 EV (Unterbelichtet)
   → Verschlusszeit: z.B. 1/500s (4× SCHNELLER!)
   → Highlights physikalisch geschützt
   → Fenster NICHT überbelichtet
   → Echte Details im Himmel
   
📷 Shot 2:  0 EV (Normal)
   → Verschlusszeit: z.B. 1/125s (Basis)
   → Ausgewogene Belichtung
   → Mitteltöne korrekt
   
📷 Shot 3: +2 EV (Überbelichtet)
   → Verschlusszeit: z.B. 1/30s (4× LÄNGER!)
   → Schatten physikalisch aufgehellt
   → Echte Details in dunklen Ecken
   → Mehr Licht auf Sensor
```

**⚠️ WICHTIG:** Jede Aufnahme verwendet eine **andere Verschlusszeit**! Das ist der Unterschied zu Fake-HDR.

**Format:** DNG (RAW)
- 12-14 Bit Farbtiefe
- Voller Sensor-Dynamikumfang
- Maximale Post-Processing Flexibilität

**Total:** 3 Dateien pro Stack

### Standard Modelle
**Geräte:** iPhone 11, 12, 13, 14, 15 (Standard, Plus, Mini)

**Capture:**
```
📷 Shot 1: -2 EV (Sehr dunkel)
📷 Shot 2: -1 EV (Dunkel)
📷 Shot 3:  0 EV (Normal)
📷 Shot 4: +1 EV (Hell)
📷 Shot 5: +2 EV (Sehr hell)
```

**Format:** JPG
- 8 Bit Farbtiefe
- Prozessierte Dateien
- Kleinere Dateigröße
- Feinere EV-Schritte (1 EV statt 2 EV)

**Total:** 5 Dateien pro Stack

## Technische Implementation

### Device Detection

```javascript
// Auto-Detect auf Basis von:
1. User Agent (iPhone Model)
2. Screen Width (Pro = ≥390px)
3. MediaDevices Capabilities (falls verfügbar)

// Fallback: Conservative (Standard Mode)
```

**Detection Logik:**
```javascript
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIPhone = /iphone/.test(userAgent);
  
  const isPro = isIPhone && (
    userAgent.includes('iphone15') ||
    userAgent.includes('iphone14 pro') ||
    userAgent.includes('iphone13 pro') ||
    userAgent.includes('iphone12 pro')
  );
  
  const hasHighEndCamera = window.screen.width >= 390;
  
  return isPro || hasHighEndCamera ? 'pro' : 'standard';
};
```

### Stack-ID System

**Format:**
```
stack_YYYYMMDDTHHMMSS_random6
```

**Beispiel:**
```
stack_20251105T143022_a7f3k9

Shot 1: IMG_20251105_143022_001_-2EV.dng
Shot 2: IMG_20251105_143022_002_0EV.dng
Shot 3: IMG_20251105_143022_003_+2EV.dng
```

### EXIF Metadaten

**Pro Shot 2 (0 EV):**
```json
{
  "stackId": "stack_20251105T143022_a7f3k9",
  "stackIndex": 2,
  "stackTotal": 3,
  "exposureValue": 0,
  "fileFormat": "DNG",
  "deviceType": "pro",
  "room": "living",
  "format": "3:2",
  "orientation": "landscape",
  "zoom": 1.0,
  "shutterSpeed": "1/125s",
  "timestamp": "2025-11-05T14:30:22.456Z",
  "stability": {
    "enabled": true,
    "status": "stable",
    "acceleration": "0.032",
    "adaptiveThresholds": {
      "stable": 0.05,
      "warning": 0.15
    }
  }
}
```

**Standard Shot 3 (0 EV):**
```json
{
  "stackId": "stack_20251105T143522_b8g4m2",
  "stackIndex": 3,
  "stackTotal": 5,
  "exposureValue": 0,
  "fileFormat": "JPG",
  "deviceType": "standard",
  "room": "kitchen",
  "format": "16:9",
  "orientation": "portrait",
  "zoom": 1.5,
  "shutterSpeed": "1/60s",
  "timestamp": "2025-11-05T14:35:22.789Z",
  "stability": {
    "enabled": false
  }
}
```

## Capture-Sequenz

### Timeline (Pro - 3 Shots)
```
t=0ms:     Shutter Press
           ├─ Stability Check
           ├─ Generate Stack ID
           └─ Start Sequence

t=0ms:     Shot 1 (-2 EV)
           ├─ Flash Animation
           ├─ EXIF Write
           └─ Visual Feedback

t=200ms:   Stabilization Pause

t=200ms:   Shot 2 (0 EV)
           ├─ Flash Animation
           ├─ EXIF Write
           └─ Progress Update (2/3)

t=400ms:   Stabilization Pause

t=400ms:   Shot 3 (+2 EV)
           ├─ Flash Animation
           ├─ EXIF Write
           └─ Complete

t=600ms:   Toast: "✅ 3 Aufnahmen als Stapel gespeichert"
```

### Timeline (Standard - 5 Shots)
```
Total Duration: ~1000ms (1 second)
Pause between shots: 200ms

Shot intervals:
0ms → 200ms → 400ms → 600ms → 800ms
```

## UI/UX Features

### Progress Indicator

**Erscheinung:**
```
┌──────────────────────────┐
│                          │
│         2/3              │  ← Large, 48px
│   Belichtungsreihe DNG   │  ← 14px, muted
│                          │
│   ████████░░░░░░░░░░     │  ← Progress Bar
│                          │
└──────────────────────────┘

Background: rgba(0, 0, 0, 0.9)
Backdrop Blur: 20px
Border: 2px Powder Blue
```

**Flash Animation:**
- Weißer Overlay (opacity 0.8 → 0)
- Duration: 200ms
- Timing: Bei jeder Aufnahme

### Device Badge

**Position:** Top Right (unter Orientation Toggle)

**Pro Mode:**
```
● Pro · 3× DNG
Color: #64BF49 (Grün)
```

**Standard Mode:**
```
● 5× JPG
Color: #8E9094 (Grau)
```

### Toast Notifications

**Start:**
```
📸 Belichtungsreihe startet (3 DNG)
📸 Belichtungsreihe startet (5 JPG)
Duration: 2s
```

**Complete:**
```
✅ 3 Aufnahmen als Stapel gespeichert
✅ 5 Aufnahmen als Stapel gespeichert
Duration: 3s
```

**Mit Stabilität-Warnung:**
```
⚠️ Verwenden Sie ein Stativ für beste Ergebnisse
⚠️ Stativ erforderlich bei 1/15s!
→ Dann normale Capture-Sequenz
```

## Galerie-Integration

### Stack-Darstellung

**Konzept:**
```
┌─────────────┐
│             │
│    [1/3]    │  ← Stack Badge
│             │
│  ▲ ▲ ▲      │  ← Stack Indicator (3 Icons)
└─────────────┘
```

**Funktionalität:**
1. **Thumbnail**: Zeigt 0 EV (mittlere Belichtung)
2. **Badge**: "1/3" oder "1/5"
3. **Tap**: Expandiert Stack → Alle Aufnahmen sichtbar
4. **Swipe**: Durch Stack navigieren
5. **Select All**: Wählt ganzen Stack

### Stack-Metadaten in Galerie

```javascript
interface PhotoStack {
  stackId: string;
  shots: Photo[];
  thumbnail: Photo;  // 0 EV shot
  deviceType: 'pro' | 'standard';
  format: 'DNG' | 'JPG';
  timestamp: Date;
  room: string;
}
```

## Post-Processing Workflow

### Für Fotografen

**1. Export aus Galerie:**
```
✓ Stack auswählen
✓ "Stapel exportieren"
✓ Als ZIP oder einzelne Dateien
```

**2. HDR Merge (Adobe Lightroom):**
```
1. Import DNG/JPG Stack
2. Select all 3/5 images
3. Photo → Photo Merge → HDR
4. Auto-align ✓
5. Auto tone ✓
6. Deghost if needed
7. Create HDR.dng
```

**3. Alternative Tools:**
- **Aurora HDR** (Skylum)
- **Photomatix Pro**
- **Affinity Photo**
- **Native iOS**: Smart HDR (automatisch)

## Best Practices

### Für optimale Ergebnisse

**✅ DO:**
- Stativ verwenden bei < 1/60s
- Stability Monitor aktivieren
- Ruhig atmen zwischen Aufnahmen
- Auf stabilen Zeitpunkt warten (grüner Badge)
- Statische Szenen fotografieren

**❌ DON'T:**
- Bewegliche Objekte (Ghosting!)
- Handheld bei langen Verschlusszeiten
- Kamera bewegen während Capture
- In extremen Lichtverhältnissen ohne Stativ

### Szenarien

**Perfekt für:**
- 🏠 Innenräume mit Fenstern
- 🌅 Sonnenauf-/untergänge
- 🏙️ Stadtansichten mit Kontrasten
- 🌃 Nachtaufnahmen mit Lichtern
- 🖼️ Architektur mit Schatten

**Nicht ideal für:**
- 🏃 Bewegte Motive (Sport, Kinder)
- 🌊 Wasser (außer als Effekt)
- 🚗 Verkehr
- 🌳 Wind (bewegte Blätter)

## Technische Limitierungen

### Native App (iOS)
✅ **Volle Unterstützung**
- Zugriff auf RAW (DNG) bei Pro Modellen
- MediaDevices API für echte Capture
- File System für Stack-Speicherung
- Volle EXIF-Integration

### Web Browser
⚠️ **Simuliert**
- Keine echte Multi-Exposure Capture
- Keine DNG-Generierung
- Demo-Modus für Development
- EXIF als JSON in LocalStorage

### Performance

**Pro (3× DNG):**
- File Size: ~25-30 MB pro Shot
- Total: ~75-90 MB pro Stack
- Capture Time: ~600ms
- Write Time: ~2-3 Sekunden

**Standard (5× JPG):**
- File Size: ~3-5 MB pro Shot
- Total: ~15-25 MB pro Stack
- Capture Time: ~1000ms
- Write Time: ~1-2 Sekunden

## Zukunft / Roadmap

### Geplante Features

**v7.0 - Advanced Bracketing:**
- [ ] Custom EV Steps (User-definiert)
- [ ] 7-Shot Mode für extreme Kontraste
- [ ] Auto-HDR Merge in-app
- [ ] Preview mit Tone-mapped Thumbnail
- [ ] Stack-Editor (Shots entfernen/neu ordnen)

**v7.1 - Smart Features:**
- [ ] Scene Detection (Auto EV-Range)
- [ ] Deghosting Preview
- [ ] Alignment Check
- [ ] Focus Stacking Integration
- [ ] Batch Processing

**v7.2 - Cloud Integration:**
- [ ] Stack-Sync über Supabase
- [ ] Collaborative Editing
- [ ] HDR Processing in Cloud
- [ ] Delivery mit fertigen HDRs

## Zusammenfassung

Das HDR Bracketing System bietet:
- ✅ **ECHTE Belichtungsreihen** - nicht Fake-HDR!
- ✅ **Physikalisch unterschiedliche Verschlusszeiten** pro Shot
- ✅ **Professionelle HDR-Erfassung** wie bei DSLRs
- ✅ **Device-optimiert** (Pro: 3×DNG vs Standard: 5×JPG)
- ✅ **Stack-basiert** für einfaches Management
- ✅ **EXIF-vollständig** mit tatsächlichen Verschlusszeiten
- ✅ **UX-optimiert** mit klarem Visual Feedback
- ✅ **Galerie-ready** für Lightroom Post-Processing

**Resultat:** Perfekte Immobilienfotos mit maximalem Dynamikumfang! 🏡✨

**Validierung:** Prüfe EXIF-Daten - jeder Shot MUSS unterschiedliche ExposureTime haben!

---
**Siehe auch:** `/REAL_CAMERA_INTEGRATION.md` für technische Details der Camera API Integration

---
*Dokumentation: v6.2 - 05.11.2025*
