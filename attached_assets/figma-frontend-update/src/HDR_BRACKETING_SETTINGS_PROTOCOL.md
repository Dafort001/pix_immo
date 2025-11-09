# 📸 HDR Bracketing Settings Protocol

## Kritische Regel für Belichtungsreihen

```
╔═══════════════════════════════════════════════════╗
║  BEI HDR BRACKETING:                              ║
║                                                   ║
║  ✅ DARF sich ändern:                             ║
║     - Verschlusszeit (Shutter Speed)              ║
║                                                   ║
║  ❌ DARF NICHT ändern:                            ║
║     - ISO                                         ║
║     - White Balance (WB)                          ║
║     - Fokus                                       ║
║     - Zoom                                        ║
║     - Metering Mode                               ║
║     - Alle anderen Settings                       ║
╚═══════════════════════════════════════════════════╝
```

## Warum ist das kritisch?

### HDR-Stacking Anforderungen

```
HDR-Merge Software (Photomatix, Aurora HDR, etc.) erwartet:
├─ Identische Perspektive (Kamera bewegt sich nicht)
├─ Identischer Fokus (Schärfeebene gleich)
├─ Identische Farbtemperatur (WB konstant)
└─ NUR Helligkeit unterschiedlich (via Shutter Speed)

Wenn WB sich ändert:
├─ Farbstiche in verschiedenen Belichtungen
├─ Ghosting-Artefakte beim Mergen
├─ Ungleichmäßige Farbwiedergabe
└─ Stack ist UNBRAUCHBAR!
```

### Real-World Example

**❌ FALSCH (Auto WB):**
```
Shot 1 (Underexposed):  1/2000s, ISO 200, WB Auto → 5800K
Shot 2 (Normal):        1/500s,  ISO 200, WB Auto → 5600K
Shot 3 (Overexposed):   1/125s,  ISO 200, WB Auto → 5400K

Problem: Kamera passt WB pro Shot an
→ Unterschiedliche Farbtemperaturen
→ HDR-Merge FAILED!
```

**✅ RICHTIG (Locked WB):**
```
VOR erstem Shot: WB Lock auf 5500K (Daylight)

Shot 1 (Underexposed):  1/2000s, ISO 200, WB 5500K ✅
Shot 2 (Normal):        1/500s,  ISO 200, WB 5500K ✅
Shot 3 (Overexposed):   1/125s,  ISO 200, WB 5500K ✅

Result: Konsistente Farbtemperatur
→ HDR-Merge SUCCESS!
```

## Implementation Requirements

### 1. Pre-Capture Lock

```typescript
async function prepareHDRCapture() {
  // STEP 1: Lock ALL settings außer Shutter Speed
  
  // Lock White Balance (kritisch!)
  const currentWB = getCurrentWhiteBalance();
  lockWhiteBalance(currentWB); // MUSS locked sein!
  
  // Lock ISO
  const currentISO = getCurrentISO();
  lockISO(currentISO);
  
  // Lock Focus
  const currentFocus = getCurrentFocus();
  lockFocus(currentFocus);
  
  // Lock Zoom
  const currentZoom = getCurrentZoom();
  lockZoom(currentZoom);
  
  // Log locked values
  console.log('HDR Capture Settings Locked:');
  console.log(`  WB: ${currentWB}K`);
  console.log(`  ISO: ${currentISO}`);
  console.log(`  Focus: ${currentFocus}`);
  console.log(`  Zoom: ${currentZoom}x`);
}
```

### 2. Bracketing Sequence

```typescript
async function captureHDRBracket(deviceType: 'pro' | 'standard') {
  // Settings already locked from prepareHDRCapture()
  
  if (deviceType === 'pro') {
    // iPhone Pro: 3 DNG Brackets mit 2 EV Steps
    const evOffsets = [-2, 0, +2]; // EV values
    
    for (const ev of evOffsets) {
      // Calculate shutter speed for this EV offset
      const shutterSpeed = calculateShutterForEV(
        baseShutter,
        ev
      );
      
      // ✅ ONLY change shutter speed
      setShutterSpeed(shutterSpeed);
      
      // ❌ DO NOT change anything else!
      // - ISO stays locked
      // - WB stays locked
      // - Focus stays locked
      
      await capturePhoto();
      await delay(100); // Brief delay between shots
    }
  } else {
    // iPhone Standard: 5 JPG Brackets mit 1 EV Steps
    const evOffsets = [-2, -1, 0, +1, +2];
    
    for (const ev of evOffsets) {
      const shutterSpeed = calculateShutterForEV(baseShutter, ev);
      setShutterSpeed(shutterSpeed);
      await capturePhoto();
      await delay(100);
    }
  }
}
```

### 3. EV to Shutter Speed Calculation

```typescript
/**
 * Convert EV offset to shutter speed
 * 
 * EV Formula: Each EV step doubles/halves light
 * +1 EV = 2× light = Shutter Speed / 2
 * -1 EV = 0.5× light = Shutter Speed × 2
 */
function calculateShutterForEV(
  baseShutter: number,    // e.g. 125 (= 1/125s)
  evOffset: number        // e.g. -2, 0, +2
): number {
  // EV offset to multiplier
  const multiplier = Math.pow(2, -evOffset);
  
  // New shutter speed (denominator)
  const newShutter = Math.round(baseShutter * multiplier);
  
  return newShutter;
}

// Examples:
calculateShutterForEV(125, -2)  // → 31   (1/31s, +2 EV brighter)
calculateShutterForEV(125, 0)   // → 125  (1/125s, base)
calculateShutterForEV(125, +2)  // → 500  (1/500s, -2 EV darker)
```

## Shutter Speed Range

### Realistic Ranges for Immobilienfotografie

```
Sonniger Tag (Außen):
├─ ISO: 100-200
├─ Typische Shutter: 1/1000s - 1/4000s
└─ Mit Bracketing: bis 1/8000s möglich

Heller Innenraum (Fenster):
├─ ISO: 200-400
├─ Typische Shutter: 1/250s - 1/1000s
└─ Mit Bracketing: bis 1/2000s

Normaler Innenraum:
├─ ISO: 400-800
├─ Typische Shutter: 1/60s - 1/250s
└─ Mit Bracketing: 1/15s - 1/1000s

Dunkler Innenraum:
├─ ISO: 800-1600
├─ Typische Shutter: 1/15s - 1/60s
└─ Mit Bracketing: 1/4s - 1/250s (Stativ!)

⚠️ Range-Empfehlung: 1/8000s - 1s
   (Deckt 99% aller Immobilien-Szenarien ab)
```

### Shutter Speed Limits bei Bracketing

```typescript
// Calculate safe shutter range for bracketing
function getSafeShutterRange(
  baseShutter: number,
  deviceType: 'pro' | 'standard'
): { min: number; max: number } {
  
  const evRange = deviceType === 'pro' ? 2 : 2; // ±2 EV
  
  // Darkest shot (highest EV offset)
  const maxShutter = baseShutter * Math.pow(2, evRange);
  
  // Brightest shot (lowest EV offset)
  const minShutter = baseShutter / Math.pow(2, evRange);
  
  // Clamp to camera limits
  const cameraMin = 8000; // 1/8000s
  const cameraMax = 1;     // 1s (denominator = 1 means 1/1s = 1s)
  
  return {
    min: Math.max(minShutter, 1 / cameraMax), // Don't exceed 1s
    max: Math.min(maxShutter, cameraMin),      // Don't exceed 1/8000s
  };
}

// Example:
// Base Shutter: 1/500s (denominator = 500)
// Device: Pro (±2 EV)
// 
// Darkest:  500 × 4 = 2000 → 1/2000s ✅
// Normal:   500          → 1/500s ✅
// Brightest: 500 / 4 = 125 → 1/125s ✅
```

## White Balance Handling

### Lock Strategies

```typescript
interface WhiteBalanceSettings {
  mode: 'auto' | 'preset' | 'manual';
  preset?: 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent';
  kelvin?: number; // 2800 - 7500K
  locked: boolean;
}

// Strategy 1: Lock Current Auto WB
async function lockCurrentAutoWB(): Promise<number> {
  // Get current Auto WB kelvin value
  const currentKelvin = await camera.getCurrentWhiteBalanceKelvin();
  
  // Lock it for bracketing
  await camera.setWhiteBalance({
    mode: 'manual',
    kelvin: currentKelvin,
    locked: true,
  });
  
  return currentKelvin;
}

// Strategy 2: Use Preset and Lock
async function lockPresetWB(preset: string): Promise<number> {
  const kelvinMap = {
    daylight: 5500,
    cloudy: 6500,
    tungsten: 3200,
    fluorescent: 4000,
  };
  
  const kelvin = kelvinMap[preset];
  
  await camera.setWhiteBalance({
    mode: 'manual',
    kelvin: kelvin,
    locked: true,
  });
  
  return kelvin;
}

// Strategy 3: Manual Kelvin and Lock
async function lockManualWB(kelvin: number): Promise<void> {
  await camera.setWhiteBalance({
    mode: 'manual',
    kelvin: kelvin,
    locked: true,
  });
}
```

### User Workflow

```
User bereitet HDR Capture vor:

1. Wählt WB-Modus:
   ┌────────────────────────────┐
   │ White Balance              │
   ├────────────────────────────┤
   │ ● Auto (aktuell: 5600K)    │
   │ ○ Daylight (5500K)         │
   │ ○ Cloudy (6500K)           │
   │ ○ Tungsten (3200K)         │
   │ ○ Manual: [2800K ─●── 7500K] │
   └────────────────────────────┘

2. User klickt Shutter Button
   
3. System:
   ✅ Locks aktuellen WB (z.B. 5600K)
   ✅ Locks ISO
   ✅ Locks Focus
   ✅ Beginnt Bracketing
   
4. Während Bracketing:
   Shot 1: 1/2000s, WB 5600K ✅
   Shot 2: 1/500s,  WB 5600K ✅
   Shot 3: 1/125s,  WB 5600K ✅
   
5. Nach Bracketing:
   ✅ Unlocks alle Settings
   ✅ WB kehrt zu Original-Modus zurück
```

## LED-Licht Problem

### Warum verschätzt sich Auto WB bei LED?

```
LED-Spektrum:
├─ Nicht kontinuierlich wie Sonne/Glühbirne
├─ "Spiky" Spektrum mit Peaks
├─ Farbtemperatur schwer zu messen
└─ Auto WB oft zu kalt oder zu warm

Lösung: Manuelle Kelvin-Einstellung
├─ User testet verschiedene Kelvin-Werte
├─ Findet besten Wert visuell
├─ Locked diesen für Bracketing
└─ Alle Brackets haben konsistente Farbe
```

### Manual Kelvin Slider (nur JPG)

```
Warum nur JPG?
├─ DNG (RAW): WB ist nicht "baked in"
│   └─ Kann in Post-Processing geändert werden
│   └─ Kelvin-Slider in Camera nicht nötig
│
└─ JPG: WB ist "baked in"
    └─ MUSS in Camera richtig sein!
    └─ Kelvin-Slider KRITISCH für LED-Szenen

UI:
┌────────────────────────────────┐
│ White Balance (JPG Mode)       │
├────────────────────────────────┤
│ [2800K] ─────●──────── [7500K] │
│           5400K                │
│                                │
│ Presets:                       │
│ [☀️ 5500K] [☁️ 6500K] [💡 3200K] │
└────────────────────────────────┘
```

## EXIF Metadata

### HDR Bracket Stack Metadata

```json
{
  "stack_id": "stack_20251105T143022_abc123",
  "stack_type": "hdr_bracket",
  "device_type": "pro",
  "file_format": "dng",
  "bracket_count": 3,
  
  // LOCKED SETTINGS (same for all shots in stack)
  "locked_settings": {
    "iso": 200,
    "white_balance_mode": "manual",
    "white_balance_kelvin": 5500,
    "focus_mode": "locked",
    "focus_distance": 0.85,
    "zoom_level": 1.0,
    "metering_mode": "matrix"
  },
  
  // VARIABLE SETTINGS (different per shot)
  "shots": [
    {
      "shot_id": "shot_001",
      "ev_offset": -2,
      "shutter_speed": "1/2000",
      "shutter_denominator": 2000,
      "exposure_time": 0.0005,
      "file_name": "stack_001_shot_001.dng"
    },
    {
      "shot_id": "shot_002",
      "ev_offset": 0,
      "shutter_speed": "1/500",
      "shutter_denominator": 500,
      "exposure_time": 0.002,
      "file_name": "stack_001_shot_002.dng"
    },
    {
      "shot_id": "shot_003",
      "ev_offset": +2,
      "shutter_speed": "1/125",
      "shutter_denominator": 125,
      "exposure_time": 0.008,
      "file_name": "stack_001_shot_003.dng"
    }
  ],
  
  // Verification
  "wb_consistency_check": true,
  "iso_consistency_check": true,
  "focus_consistency_check": true
}
```

## Quality Checks

### Post-Capture Validation

```typescript
// Validate that settings stayed locked during bracketing
function validateBracketConsistency(
  stack: BracketStack
): ValidationResult {
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check WB consistency
  const wbValues = stack.shots.map(s => s.white_balance_kelvin);
  const wbUnique = new Set(wbValues);
  
  if (wbUnique.size > 1) {
    errors.push(
      `❌ WB inconsistent: ${Array.from(wbUnique).join(', ')}K`
    );
  }
  
  // Check ISO consistency
  const isoValues = stack.shots.map(s => s.iso);
  const isoUnique = new Set(isoValues);
  
  if (isoUnique.size > 1) {
    errors.push(
      `❌ ISO inconsistent: ${Array.from(isoUnique).join(', ')}`
    );
  }
  
  // Check Focus consistency
  const focusValues = stack.shots.map(s => s.focus_distance);
  const focusDelta = Math.max(...focusValues) - Math.min(...focusValues);
  
  if (focusDelta > 0.05) { // 5% tolerance
    warnings.push(
      `⚠️ Focus shifted by ${(focusDelta * 100).toFixed(1)}%`
    );
  }
  
  // Check Shutter Speed progression
  const shutterValues = stack.shots.map(s => s.shutter_denominator);
  const isProgressive = shutterValues.every((val, i, arr) => 
    i === 0 || val <= arr[i-1] * 3 // Each step should be ~2-4× (for EV steps)
  );
  
  if (!isProgressive) {
    warnings.push(
      `⚠️ Shutter progression irregular: ${shutterValues.join(', ')}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

## User Warnings

### Pre-Capture Warnings

```
Wenn User HDR Bracketing startet:

⚠️ Check 1: Shutter Speed Range
┌────────────────────────────────┐
│ ⚠️ Achtung                      │
├────────────────────────────────┤
│ Dunkelstes Bild benötigt       │
│ 1/31s Verschlusszeit.          │
│                                │
│ Stativ empfohlen!              │
│                                │
│ [Abbrechen] [Trotzdem]         │
└────────────────────────────────┘

⚠️ Check 2: Brightest Shot Clipped
┌────────────────────────────────┐
│ ⚠️ Achtung                      │
├────────────────────────────────┤
│ Hellstes Bild könnte überstrahlt│
│ sein (1/8000s Limit erreicht). │
│                                │
│ ISO reduzieren?                │
│                                │
│ [ISO runter] [Trotzdem]        │
└────────────────────────────────┘
```

### Post-Capture Warnings

```
Nach Bracketing:

✅ Success
┌────────────────────────────────┐
│ ✅ HDR Stack komplett           │
├────────────────────────────────┤
│ 3 DNG Belichtungen gespeichert │
│                                │
│ • WB: 5500K ✅ (konsistent)    │
│ • ISO: 200 ✅ (konsistent)     │
│ • Shutter: 1/2000 → 1/125s ✅  │
│                                │
│ Stack bereit für HDR-Merge!    │
└────────────────────────────────┘

❌ Error
┌────────────────────────────────┐
│ ❌ Inkonsistenter Stack!        │
├────────────────────────────────┤
│ White Balance hat sich geändert:│
│ • Shot 1: 5500K                │
│ • Shot 2: 5600K ⚠️             │
│ • Shot 3: 5400K ⚠️             │
│                                │
│ Stack für HDR ungeeignet!      │
│                                │
│ [Stack löschen] [Behalten]     │
└────────────────────────────────┘
```

## Best Practices

### DO's ✅

```
✅ Lock WB VOR erstem Shot
✅ Verwende konsistenten WB für gesamte Serie
✅ Bei LED-Licht: Manueller Kelvin statt Auto
✅ Lieber falscher WB als Wechsel im Stack
✅ Check Shutter Range VOR Bracketing
✅ Verwende Stativ bei Shutter <1/60s
✅ Validate Stack consistency nach Capture
✅ Dokumentiere locked settings in EXIF
```

### DON'Ts ❌

```
❌ Auto WB während Bracketing
❌ ISO ändern zwischen Shots
❌ Focus ändern zwischen Shots
❌ Zoom ändern zwischen Shots
❌ Metering Mode ändern
❌ Kamera bewegen während Serie
❌ Unterschiedliche WB pro Shot
❌ Zu große EV-Steps (>2 EV bei Pro, >1 EV bei Standard)
```

## Zusammenfassung

```
╔═══════════════════════════════════════════════════╗
║  HDR BRACKETING - GOLDENE REGEL:                  ║
║                                                   ║
║  "NUR VERSCHLUSSZEIT VARIIERT,                    ║
║   ALLES ANDERE BLEIBT KONSTANT!"                  ║
║                                                   ║
║  Besonders kritisch:                              ║
║  • White Balance (WB Lock ist PFLICHT!)           ║
║  • ISO (muss locked sein)                         ║
║  • Focus (muss locked sein)                       ║
║                                                   ║
║  Shutter Speed Range:                             ║
║  • 1/8000s - 1s (deckt 99% aller Szenarien)       ║
║  • Realität: ISO 200 + Sonne = 1/4000s problemlos ║
║                                                   ║
║  LED-Licht:                                       ║
║  • Auto WB verschätzt sich oft                    ║
║  • Kelvin-Slider für manuelle Feinabstimmung      ║
║  • Nur bei JPG nötig (DNG = RAW, flexibel)        ║
╚═══════════════════════════════════════════════════╝
```

---
*HDR Bracketing Settings Protocol - 05.11.2025*
