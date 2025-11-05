# 📸 Manuelle Kamera-Einstellungen - Checkliste

**pix.immo Mobile PWA Camera App**

Vollständige Feature-Liste aller manuellen Kamera-Kontrollen und intelligenten Assistenzsysteme.

---

## 🎛️ Kern-Einstellungen (Expert Mode)

### 📊 ISO
- **Bereich**: 32 - 6400
- **Auto-Modus**: Ja ✅
- **Anzeige**: Numerisch (z.B. "ISO 800")
- **Verwendung**: Lichtempfindlichkeit

### ⏱️ Verschlusszeit (Shutter Speed)
- **Bereich**: 1/8000s - 30s
- **Auto-Modus**: Ja ✅
- **Presets**:
  - Tag: 1/500s
  - Dämmerung: 1/60s
  - Nacht: 1/15s
- **Anzeige**: Bruchformat (z.B. "1/500") oder Sekunden (z.B. "2s")

### 🌡️ Weißabgleich (White Balance)
- **Kelvin-Bereich**: 2800K - 7500K
- **Presets**:
  - ☀️ Daylight (5500K)
  - ☁️ Cloudy (6500K)
  - 💡 Tungsten (3200K)
  - 🔦 Fluorescent (4000K)
  - 🌳 Shade (7000K)
  - 🎨 Custom (manuell)
- **Anzeige**: "5500K" oder "Daylight"

### 📁 Dateiformat
- **Optionen**:
  - JPEG (~3 MB)
  - HEIC (~2 MB)
  - RAW/DNG (~25 MB) 🔐
- **RAW-Zugriff**: Nur mit **Office-Pro Registration**
- **Voraussetzung**: ProRAW-fähiges Gerät (iPhone 12 Pro+)

---

## ⚙️ Basis-Einstellungen (Immer verfügbar)

### ☀️ Belichtungskorrektur (EV)
- **Bereich**: -4 EV bis +4 EV
- **Schritte**: 1/3 EV
- **Anzeige**: "+1.3 EV" oder "-0.7 EV"
- **Verwendung**: Helligkeit anpassen

### 📷 HDR Bracketing
- **Optionen**:
  - HDR 3 Brackets: -2 / 0 / +2 EV
  - HDR 5 Brackets: -4 / -2 / 0 / +2 / +4 EV
- **Verwendung**: Gegenlicht, Innenräume mit Fenstern
- **Capture-Sequenz**: Automatisch mit EV-Offsets

### 🔍 Zoom / Objektiv
- **Stufen**: 0.5× / 1× / 2× / 3×
- **Anzeige**: "1×" oder "2×"
- **Verfügbarkeit**: Geräteabhängig

### 🎯 Fokus
- **Modi**:
  - Auto (Continuous AF)
  - Manuell (Distance 0-1)
- **Focus Peaking**: Optional (Kantenhervorhebung)
- **Focus Lock**: Bei manueller Distanz

---

## 🖼️ Anzeige & Hilfslinien

### 📐 Grid Type
- **Optionen**:
  - Aus (none)
  - 3×3 Raster
  - Goldener Schnitt
- **Verwendung**: Bildkomposition

### 🧭 Level Indicator (Wasserwaage)
- **Funktion**: Horizontale Ausrichtung
- **Anzeige**: Visuelle Bubble + Grad-Anzeige
- **Empfindlichkeit**:
  - Standard
  - Strikt
  - Locker
- **Grad-Anzeige**: Ein/Aus (z.B. "2.3°")

### 📊 Histogram
- **Funktion**: Helligkeitsverteilung
- **Verwendung**: Clipping-Erkennung
- **Anzeige**: Echtzeit während Aufnahme

### 📸 Capture Thumbnail
- **Funktion**: Vorschau nach Aufnahme
- **Optionen**:
  - Ein/Aus
  - Auto-Hide (nach 3 Sek)
  - Progress-Anzeige (bei HDR)

---

## 🔧 Erweiterte Einstellungen

### 🎚️ Metering Mode
- **Optionen**:
  - Matrix (Ganze Szene)
  - Center-weighted (Mittenbetont)
  - Spot (Punktmessung)
- **Verwendung**: Belichtungsmessung

### 🛡️ Bildstabilisierung (OIS)
- **Status**: Ein/Aus
- **Auto-Deaktivierung**: Bei Tripod Mode
- **Verwendung**: Verwacklungsschutz

### 🦾 Tripod Mode
- **Funktion**: Stativ-optimiert
- **Effekt**: OIS aus, längere Belichtung möglich
- **Verwendung**: Langzeitbelichtung

### 🌙 Night Mode
- **Funktion**: Low-Light-Boost
- **Effekt**: Kein Flash
- **Verwendung**: Dunkle Innenräume

---

## 🤖 Intelligente Assistenzsysteme

### ⚠️ Tripod & Motion Warnings (v1.0)

#### 1️⃣ Pre-Capture Stability Check
- **Trigger**: HDR/Night Mode
- **Methode**: DeviceMotionEvent (700ms Sampling)
- **Warnung**: "Stativ empfohlen" Dialog
- **Feature Flag**: `tripodCheck`

#### 2️⃣ Post-Capture Bracket Alignment
- **Trigger**: HDR 3/5 Brackets
- **Methode**: Congruency Score (<70%/80%)
- **Warnung**: "Bewegung erkannt" Dialog
- **Feature Flag**: `congruencyCheck`

#### 3️⃣ Long Exposure Tip
- **Trigger**: Shutter Speed >1/30s
- **Warnung**: "Stativ empfohlen für lange Belichtung"
- **Auto-Dismiss**: Nach 5 Sekunden
- **Feature Flag**: `longShutterTip`

### 💡 Live Recommendations (Heuristic MVP)

#### Scene Analysis Features
- **Histogram Clipping Detection**: Highlights & Shadows >10%
- **Window Detection**: Edge brightness analysis
- **White Balance Estimation**: Gray-world algorithm

#### Empfehlungen
- **HDR + EV Suggestion**: Bei Gegenlicht
  - "Gegenlicht erkannt – HDR 5 + EV −0.3?"
  - 1-Tap Apply
- **Window WB Correction**: Bei Fenstern im Bild
  - "Fenster erkannt – WB 6500K?"
- **Neutral Scene WB**: Bei neutralen Szenen
  - "Neutrale Szene – WB 5500K?"

#### Throttling
- **Frequenz**: Max 1 Empfehlung pro 8-10 Sekunden
- **Feature Flag**: `liveRecommendations`
- **Toggle**: In Expert Settings

---

## 📋 Feature Flags (Ein/Aus)

Alle Assistenzsysteme können einzeln deaktiviert werden:

```typescript
{
  tripodCheck: true,           // Pre-capture stability
  congruencyCheck: true,       // Post-capture alignment
  longShutterTip: true,        // Long exposure warning
  liveRecommendations: true,   // Scene-based suggestions
}
```

---

## 🔐 Office-Pro Features

Folgende Features erfordern **Office-Pro Registration**:

- ✅ RAW/DNG Dateiformat
- ✅ Erweiterte Metadaten (ISO, Shutter, WB in EXIF)
- ✅ Professionelle Workflows

**Voraussetzung**: ProRAW-fähiges Gerät (iPhone 12 Pro+)

**Registration**: Button in App Camera Screen

---

## 📊 Metadata-Export

Alle manuellen Einstellungen werden in **object_meta.json** gespeichert:

```json
{
  "ev": -0.3,
  "wb_mode": "daylight",
  "wb_k": 5500,
  "hdr_brackets": 5,
  "lens": 1,
  "iso": 400,
  "shutter_speed": "1/500",
  "file_format": "jpg"
}
```

---

## ✅ Vollständige Feature-Matrix

| Feature | Verfügbar | Expert Mode | Office-Pro |
|---------|-----------|-------------|------------|
| ISO | ✅ | ✅ | - |
| Shutter Speed | ✅ | ✅ | - |
| White Balance | ✅ | ✅ | - |
| File Format (HEIC/JPG) | ✅ | ✅ | - |
| **File Format (RAW/DNG)** | ✅ | ✅ | **✅** |
| EV Compensation | ✅ | - | - |
| HDR Bracketing | ✅ | - | - |
| Zoom/Lens | ✅ | - | - |
| Focus Mode | ✅ | - | - |
| Grid Type | ✅ | - | - |
| Level Indicator | ✅ | - | - |
| Histogram | ✅ | - | - |
| Capture Thumbnail | ✅ | - | - |
| Metering Mode | ✅ | ✅ | - |
| OIS | ✅ | ✅ | - |
| Tripod Mode | ✅ | ✅ | - |
| Night Mode | ✅ | ✅ | - |
| Tripod Check | ✅ | - | - |
| Congruency Check | ✅ | - | - |
| Long Shutter Tip | ✅ | - | - |
| Live Recommendations | ✅ | - | - |

**Gesamt**: 20 manuelle Einstellungen + 4 intelligente Assistenzsysteme

---

## 📱 UI-Zugang

### Hauptsteuerung
- **Button**: "M" (Manual Mode) in Camera Screen
- **Panel**: Bottom-Right expandable
- **Toggle**: Expert Mode Switch

### Kategorien im Panel
1. **Expert-Only** (ISO, Shutter, WB, Format)
2. **Basis** (EV, HDR, Zoom, Focus)
3. **Anzeige** (Grid, Level, Histogram, Thumbnail)

### Quick Access
- **EV-Slider**: Immer sichtbar (nicht in Panel)
- **Grid-Toggle**: Camera Screen Header
- **Zoom-Buttons**: Camera Screen Bottom

---

## 🎯 Best Practices

### Immobilienfotografie
- **Standard**: ISO Auto, 1/500s, 5500K, EV 0
- **Fenster**: HDR 5, EV -0.3, 6500K
- **Nacht**: ISO 800, 1/15s, Tripod Mode

### Performance
- **Live Recommendations**: Nur bei Bedarf (hoher CPU-Verbrauch)
- **Histogram**: Deaktivieren bei schwachen Geräten
- **RAW**: Nur bei wichtigen Aufnahmen (große Dateien)

---

**Aktualisiert**: November 2025  
**Version**: Manual Controls v3.1 + Stability Warnings v1.0
