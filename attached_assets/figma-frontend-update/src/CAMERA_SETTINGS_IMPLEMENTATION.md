# 🎯 Camera Settings Implementation Checklist

## Übersicht

Finale Implementation-Anleitung für manuelle Kamera-Einstellungen basierend auf **realen Anforderungen** für Immobilienfotografie.

---

## Phase 1: Standard Mode Features (DIESE WOCHE)

### 1. EV Compensation Slider
```
Priority: CRITICAL
Location: Immer sichtbar (über Controls)
Range: -2.0 EV bis +2.0 EV
Steps: 0.3 EV (fein genug für Präzision)

UI:
┌────────────────────────────────┐
│ [-2 EV] ─────●────── [+2 EV]   │
│           -0.7 EV              │
└────────────────────────────────┘

Implementation:
├─ Slider Component (bereits vorhanden für Zoom)
├─ Live-Anzeige des aktuellen Werts
├─ Persist in LocalStorage
└─ EXIF Metadata export
```

**Code Location:** `/pages/app-camera.tsx`
```typescript
const [evCompensation, setEvCompensation] = useState(0.0); // -2.0 to +2.0

// In metadata export:
metadata.ev_compensation = evCompensation;
```

---

### 2. Level Indicator (Wasserwaage)
```
Priority: CRITICAL
Location: Header Button + Overlay
Display: Bubble + Grad-Anzeige

UI (Header):
[⚖️] ← Toggle Button

UI (Overlay when active):
┌────────────────────────────────┐
│         ═══○═══                │
│          0.5°                  │
└────────────────────────────────┘

States:
🟢 Grün:   -1° bis +1° (perfekt)
🟡 Gelb:   -3° bis +3° (akzeptabel)
🔴 Rot:    >3° (zu schief!)

Implementation:
├─ Component: /components/LevelIndicator.tsx ✅ (bereits vorhanden!)
├─ DeviceMotion API für Neigung
├─ Real-time Update (30 FPS)
└─ Toggle in Header
```

**Code Location:** `/components/LevelIndicator.tsx` (bereits erstellt!)
- Nur noch in `/pages/app-camera.tsx` einbinden

---

### 3. White Balance Settings
```
Priority: CRITICAL
Location: Quick Access Header
Modes: 4 Presets + Kelvin-Slider (nur JPG)

UI (Presets):
┌────────────────────────────────┐
│ White Balance                  │
├────────────────────────────────┤
│ ● Auto (aktuell: 5600K)        │
│ ○ ☀️ Daylight (5500K)          │
│ ○ ☁️ Cloudy (6500K)            │
│ ○ 💡 Tungsten (3200K)          │
└────────────────────────────────┘

UI (Manual Kelvin - nur JPG):
┌────────────────────────────────┐
│ [2800K] ─────●──────── [7500K] │
│           5400K                │
└────────────────────────────────┘

Implementation:
├─ 4 Preset Buttons
├─ Kelvin Slider (conditional: nur wenn JPG Mode)
├─ WB Lock bei HDR Bracketing! (KRITISCH!)
└─ EXIF export
```

**Code Location:** `/pages/app-camera.tsx`
```typescript
const [whiteBalanceMode, setWhiteBalanceMode] = useState<'auto' | 'daylight' | 'cloudy' | 'tungsten'>('auto');
const [whiteBalanceKelvin, setWhiteBalanceKelvin] = useState(5500);
const [whiteBalanceLocked, setWhiteBalanceLocked] = useState(false);

// Kelvin values
const WB_PRESETS = {
  auto: null, // iOS determines
  daylight: 5500,
  cloudy: 6500,
  tungsten: 3200,
};

// In HDR Bracketing:
async function captureHDRBracket() {
  // Lock WB BEFORE first shot!
  const currentWB = whiteBalanceMode === 'auto' 
    ? await getCurrentAutoWBKelvin() 
    : WB_PRESETS[whiteBalanceMode];
  
  setWhiteBalanceLocked(true);
  
  // ... capture brackets with locked WB ...
  
  setWhiteBalanceLocked(false);
}
```

---

## Phase 2: Expert Mode (NÄCHSTE WOCHE)

### 4. Expert Mode Toggle
```
Location: Settings Panel
Default: OFF (Standard Mode)

UI:
┌────────────────────────────────┐
│ Expert Mode              [OFF] │
├────────────────────────────────┤
│ Aktiviert manuelle ISO,        │
│ Verschlusszeit, Fokus und      │
│ erweiterte Kontrollen.         │
└────────────────────────────────┘

When ON:
├─ [M] Button erscheint in Header
└─ Öffnet Expert Panel (Slide-Up)
```

**Code Location:** `/pages/app-settings.tsx`
```typescript
const [expertModeEnabled, setExpertModeEnabled] = useState(false);

// Persist to LocalStorage
localStorage.setItem('pix_expert_mode', expertModeEnabled.toString());
```

---

### 5. ISO Control
```
Priority: HIGH (Expert Mode)
Range: 100 - 3200
Modes: Auto (default) | Manual

UI:
┌────────────────────────────────┐
│ ISO                            │
├────────────────────────────────┤
│ ● Auto  ○ Manual               │
│                                │
│ [100] ─────●────── [3200]      │
│          800                   │
└────────────────────────────────┘

Warnings:
>1600 → "Hohes ISO = Bildrauschen"

Implementation:
├─ Auto Mode: iOS bestimmt ISO
├─ Manual: Slider mit 100er Steps (100, 200, 400, 800, 1600, 3200)
├─ ISO Lock bei HDR Bracketing! (KRITISCH!)
└─ EXIF export
```

**Code Location:** `/pages/app-camera.tsx`
```typescript
const [isoMode, setIsoMode] = useState<'auto' | 'manual'>('auto');
const [isoValue, setIsoValue] = useState(400);

// In HDR Bracketing:
// ISO MUST stay locked during entire bracket series!
```

---

### 6. Shutter Speed Control
```
Priority: HIGH (Expert Mode)
Range: 1/8000s - 1s (volle Flexibilität!)
Display: Bruchformat (1/500s) oder Sekunden (0.5s)

UI (Presets):
┌────────────────────────────────┐
│ Verschlusszeit                 │
├────────────────────────────────┤
│ Preset: [Standard ▼]           │
│   • Sehr Hell: 1/4000s         │
│   • Standard:  1/125s          │
│   • Dämmerung: 1/60s           │
│   • Dunkel:    1/15s           │
├────────────────────────────────┤
│ [1/8000] ─────●────── [1s]     │
│         1/125s                 │
└────────────────────────────────┘

Warnings:
<1/60s → Stability Monitor zeigt "STATIV PFLICHT"

Real-World:
├─ Sonniger Tag: ISO 200 → 1/4000s normal
├─ Heller Innenraum: 1/250s - 1/1000s
└─ Dunkler Raum: 1/15s - 1/60s (Stativ!)

Implementation:
├─ 4 Presets für schnellen Zugriff
├─ Slider für Feinabstimmung
├─ Shutter ist EINZIGER variabler Parameter bei HDR!
├─ Display Formatter: denominator → "1/500s"
└─ EXIF export mit tatsächlicher exposure_time
```

**Code Location:** `/pages/app-camera.tsx`
```typescript
const [shutterSpeed, setShutterSpeed] = useState(125); // Denominator (1/125s)

// Presets
const SHUTTER_PRESETS = {
  very_bright: 4000,  // 1/4000s
  standard: 125,      // 1/125s
  dusk: 60,           // 1/60s
  dark: 15,           // 1/15s
};

// Format for display
function formatShutterSpeed(denominator: number): string {
  if (denominator >= 1) {
    return `1/${denominator}s`;
  } else {
    return `${(1 / denominator).toFixed(1)}s`;
  }
}

// HDR Bracketing EV to Shutter calculation
function calculateShutterForEV(base: number, evOffset: number): number {
  const multiplier = Math.pow(2, -evOffset);
  return Math.round(base * multiplier);
}
```

---

### 7. Focus Mode Control
```
Priority: MEDIUM (Expert Mode)
Modes: Auto (Continuous AF) | Lock

UI:
┌────────────────────────────────┐
│ Fokus                          │
├────────────────────────────────┤
│ ● Auto  ○ Lock                 │
│                                │
│ Tap-to-Focus: Aktiv ✅         │
└────────────────────────────────┘

Implementation:
├─ Auto: iOS Continuous AF (default)
├─ Lock: Focus & Recompose
├─ Visual Indicator: AF Badge (grün = locked)
├─ Focus Lock bei HDR Bracketing! (KRITISCH!)
└─ EXIF export
```

---

### 8. Metering Mode
```
Priority: LOW (Expert Mode)
Modes: Matrix (default) | Spot

UI:
┌────────────────────────────────┐
│ Messmethode                    │
├────────────────────────────────┤
│ ● Matrix  ○ Spot               │
└────────────────────────────────┘

Implementation:
├─ Matrix: Ganze Szene (95% der Fälle)
├─ Spot: Punktmessung (spezielle Fälle)
└─ EXIF export
```

---

## HDR Bracketing - KRITISCHE REQUIREMENTS

### Settings Lock Protocol

```typescript
/**
 * KRITISCH: Bei HDR Bracketing darf sich NUR Shutter Speed ändern!
 * Alle anderen Settings MÜSSEN locked sein!
 */

interface HDRBracketSettings {
  // ✅ LOCKED (darf sich NICHT ändern)
  iso: number;
  whiteBalance: number;  // Kelvin
  focus: number;
  zoom: number;
  meteringMode: string;
  
  // ✅ VARIABLE (einziger Parameter der sich ändert!)
  shutterSpeed: number;  // Wird pro Shot berechnet basierend auf EV
}

async function captureHDRBracket(deviceType: 'pro' | 'standard') {
  // STEP 1: Lock ALL settings
  const lockedSettings: HDRBracketSettings = {
    iso: getCurrentISO(),
    whiteBalance: getCurrentWBKelvin(),
    focus: getCurrentFocus(),
    zoom: getCurrentZoom(),
    meteringMode: getCurrentMeteringMode(),
    shutterSpeed: getCurrentShutterSpeed(), // Base shutter
  };
  
  // Lock in camera
  await camera.lockISO(lockedSettings.iso);
  await camera.lockWhiteBalance(lockedSettings.whiteBalance);
  await camera.lockFocus(lockedSettings.focus);
  await camera.lockZoom(lockedSettings.zoom);
  
  console.log('🔒 HDR Settings Locked:', lockedSettings);
  
  // STEP 2: Capture brackets with ONLY shutter changing
  const evOffsets = deviceType === 'pro' ? [-2, 0, +2] : [-2, -1, 0, +1, +2];
  
  for (const ev of evOffsets) {
    // Calculate new shutter speed for this EV
    const newShutter = calculateShutterForEV(
      lockedSettings.shutterSpeed,
      ev
    );
    
    // ✅ ONLY change shutter speed!
    await camera.setShutterSpeed(newShutter);
    
    // ❌ DO NOT change anything else!
    
    await capturePhoto();
    await delay(100);
  }
  
  // STEP 3: Unlock all settings
  await camera.unlockISO();
  await camera.unlockWhiteBalance();
  await camera.unlockFocus();
  await camera.unlockZoom();
  
  console.log('🔓 HDR Settings Unlocked');
}
```

### White Balance Lock (BESONDERS KRITISCH!)

```
⚠️ GOLDENE REGEL:
   "Lieber falscher WB als Wechsel im Stack!"

Warum?
├─ HDR-Merge Software erwartet konsistente Farbtemperatur
├─ Unterschiedliche WB → Farbstiche → Ghosting
└─ Stack wird UNBRAUCHBAR!

Implementation:
1. VOR erstem Shot: WB Lock aktivieren
2. Während Serie: WB bleibt 100% identisch
3. Nach letztem Shot: WB Unlock

Auch bei Auto WB:
├─ Capture aktuellen Auto WB Kelvin-Wert
├─ Lock auf diesen Wert (switch zu Manual)
├─ Alle Shots nutzen diesen Wert
└─ Nach Serie: zurück zu Auto
```

---

## EXIF Metadata Structure

### Complete Metadata Export

```json
{
  "capture_id": "20251105_143022_abc123",
  "stack_id": "stack_20251105T143022_def456",
  "room_type": "living",
  "format_ratio": "3:2",
  "orientation": "landscape",
  
  // STANDARD MODE (immer vorhanden)
  "ev_compensation": -0.7,
  "white_balance_mode": "daylight",
  "white_balance_kelvin": 5500,
  "white_balance_locked": true,
  "level_angle": 0.5,
  "level_status": "stable",
  "hdr_brackets": 3,
  "grid_mode": "3x3",
  "histogram_enabled": true,
  "timer": "off",
  
  // EXPERT MODE (wenn aktiviert)
  "expert_mode": true,
  "iso": 400,
  "iso_mode": "manual",
  "iso_locked": true,
  "shutter_speed": "1/125",
  "shutter_denominator": 125,
  "shutter_locked": false,
  "exposure_time": 0.008,
  "focus_mode": "auto",
  "focus_distance": 0.85,
  "focus_locked": true,
  "zoom_level": 1.0,
  "zoom_locked": true,
  "metering_mode": "matrix",
  
  // DEVICE INFO
  "device_type": "pro",
  "file_format": "dng",
  
  // STABILITY INFO
  "stability_status": "stable",
  "acceleration": 0.02,
  "recommended_shutter_min": 60,
  
  // HDR BRACKET INFO (wenn stack)
  "stack_type": "hdr_bracket",
  "bracket_count": 3,
  "locked_settings": {
    "iso": 400,
    "white_balance_kelvin": 5500,
    "focus_distance": 0.85,
    "zoom_level": 1.0
  },
  "shots": [
    {
      "shot_id": "shot_001",
      "ev_offset": -2,
      "shutter_speed": "1/500",
      "shutter_denominator": 500,
      "file_name": "stack_001_shot_001.dng"
    },
    {
      "shot_id": "shot_002",
      "ev_offset": 0,
      "shutter_speed": "1/125",
      "shutter_denominator": 125,
      "file_name": "stack_001_shot_002.dng"
    },
    {
      "shot_id": "shot_003",
      "ev_offset": +2,
      "shutter_speed": "1/31",
      "shutter_denominator": 31,
      "file_name": "stack_001_shot_003.dng"
    }
  ],
  
  // TIMESTAMPS
  "timestamp": "2025-11-05T14:30:22.123Z",
  "app_version": "1.0.0"
}
```

---

## UI Layout

### Portrait Mode - Complete Layout

```
┌────────────────────────────────┐
│ ☰  PIX.IMMO  ⚙️  [3x3] [⚖️] [🌡️] │ ← AppNavigationBar + WB + Level
├────────────────────────────────┤
│                                │
│    [Level Indicator]           │ ← Wenn aktiviert
│         ═══○═══                │
│          0.5° 🟢               │
│                                │
│    [Histogram]                 │ ← Wenn aktiviert
│    ╱╲╱╲╱╲╱╲                   │
│                                │
│    [Viewfinder Area]           │
│         CAMERA                 │
│         PREVIEW                │
│                                │
│    [Stability Monitor]         │
│      🟢 Stabil 1/125s          │
│                                │
├────────────────────────────────┤
│ [-2 EV] ─────●────── [+2 EV]   │ ← EV Slider (immer sichtbar!)
│           -0.7 EV              │
├────────────────────────────────┤
│  🌡️ ⏱️ 🎯  [M]                 │ ← Quick Access
│  WB Timer Focus Expert         │
├────────────────────────────────┤
│  [3:2] ● [HDR] [BT]            │ ← Controls
│  Format Shutter  Bluetooth     │
│         (80x80)                │
├────────────────────────────────┤
│  [Gallery] [Room: Living ▼]    │ ← Bottom Actions
└────────────────────────────────┘
```

### Expert Panel (Slide-Up from Bottom)

```
┌────────────────────────────────┐
│ 🎛️ EXPERT MODE            [X]  │
├────────────────────────────────┤
│ ISO                            │
│ ● Auto  ○ Manual               │
│ [100] ─────●────── [3200]      │
│          800                   │
├────────────────────────────────┤
│ Verschlusszeit                 │
│ Preset: [Standard ▼]           │
│ [1/8000] ─────●────── [1s]     │
│         1/125s                 │
├────────────────────────────────┤
│ Fokus                          │
│ ● Auto  ○ Lock                 │
│ Tap-to-Focus: ✅               │
├────────────────────────────────┤
│ Zoom                           │
│ [0.5x] ─────●────── [10.0x]    │
│          1.0x                  │
├────────────────────────────────┤
│ Messmethode                    │
│ ● Matrix  ○ Spot               │
└────────────────────────────────┘
```

---

## Implementation Order

### Week 1: Standard Mode
```
Day 1-2:
✅ EV Compensation Slider
✅ Level Indicator Integration
✅ White Balance Presets

Day 3-4:
✅ White Balance Kelvin Slider (JPG only)
✅ WB Lock für HDR Bracketing
✅ EXIF Metadata Export

Day 5:
✅ Testing & Bug Fixes
✅ UI Polish
```

### Week 2: Expert Mode
```
Day 1-2:
✅ Expert Mode Toggle in Settings
✅ Expert Panel UI (Slide-Up)
✅ ISO Control (Auto/Manual)

Day 3-4:
✅ Shutter Speed Control (Presets + Slider)
✅ Focus Mode (Auto/Lock)
✅ Metering Mode Toggle

Day 5:
✅ Settings Lock Protocol für HDR
✅ Validation & Testing
```

---

## Testing Checklist

### Standard Mode Tests

```
EV Compensation:
├─ ✅ Slider funktioniert (-2 bis +2)
├─ ✅ Wert wird angezeigt
├─ ✅ Persist in LocalStorage
└─ ✅ EXIF Export

Level Indicator:
├─ ✅ Toggle funktioniert
├─ ✅ Bubble bewegt sich korrekt
├─ ✅ Grad-Anzeige aktualisiert
├─ ✅ Farb-Status korrekt (grün/gelb/rot)
└─ ✅ Performance (30 FPS)

White Balance:
├─ ✅ 4 Presets funktionieren
├─ ✅ Kelvin-Slider (nur JPG Mode)
├─ ✅ WB Lock bei HDR Bracketing
├─ ✅ WB bleibt konstant im Stack
└─ ✅ EXIF Export
```

### Expert Mode Tests

```
ISO Control:
├─ ✅ Auto Mode funktioniert
├─ ✅ Manual Slider funktioniert
├─ ✅ ISO Lock bei HDR Bracketing
└─ ✅ Warnung bei >1600 ISO

Shutter Speed:
├─ ✅ Presets funktionieren
├─ ✅ Slider funktioniert (1/8000s - 1s)
├─ ✅ Shutter variiert korrekt bei HDR
├─ ✅ Andere Settings bleiben locked
└─ ✅ Stativ-Warnung bei <1/60s

Focus Mode:
├─ ✅ Auto funktioniert
├─ ✅ Lock funktioniert
├─ ✅ Focus Lock bei HDR Bracketing
└─ ✅ Visual Indicator
```

### HDR Bracketing Tests

```
Settings Lock:
├─ ✅ ISO bleibt konstant
├─ ✅ WB bleibt konstant (KRITISCH!)
├─ ✅ Focus bleibt konstant
├─ ✅ Zoom bleibt konstant
└─ ✅ NUR Shutter Speed variiert

Bracket Validation:
├─ ✅ Pro: 3 DNG mit 2 EV Steps
├─ ✅ Standard: 5 JPG mit 1 EV Steps
├─ ✅ EV Calculation korrekt
├─ ✅ Shutter Range Check
└─ ✅ Post-Capture Validation

EXIF Metadata:
├─ ✅ Alle locked Settings dokumentiert
├─ ✅ Alle variable Settings dokumentiert
├─ ✅ Stack ID korrekt
└─ ✅ Consistency Flags gesetzt
```

---

## Zusammenfassung

### Features Count
```
Standard Mode:  9 Features
Expert Mode:    5 Features
Total:         14 Features (schlankes, fokussiertes System!)
```

### Critical Path
```
1. EV Compensation     → Sofort nützlich
2. Level Indicator     → Immobilien-kritisch
3. White Balance       → Farbqualität
4. WB Lock für HDR     → HDR-Stacking funktioniert!
5. Expert Mode         → Für Profis
```

### Success Criteria
```
✅ Standard Mode: Schneller Workflow, kein Fumbling
✅ Expert Mode: Volle Kontrolle für Profis
✅ HDR Bracketing: Settings Lock funktioniert perfekt
✅ EXIF Metadata: Vollständige Dokumentation
✅ UI/UX: Intuitiv und nicht überladen
```

**Let's build it! 🚀**

---
*Camera Settings Implementation Checklist - 05.11.2025*
