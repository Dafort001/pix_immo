# ⚙️ Pro Controls Chevron System (Apple-Style)

## Übersicht

Implementation des Apple Kamera-Patterns: **Kleines Chevron-Icon öffnet erweiterte Pro-Einstellungen** - hält die Haupt-UI clean und versteckt Expert-Features elegant.

---

## Problem: UI-Überfrachtung vermeiden

### Challenge

```
16 Kamera-Features total:

Phase 1 (Standard Mode):
├─ Grid Toggle
├─ Level Indicator
├─ White Balance
├─ EV Compensation (Long-Press)
├─ Histogram
└─ Stability Monitor

Phase 2 (Expert Mode):
├─ ISO Control
├─ Shutter Speed
├─ Focus Mode (Auto/Manual)
├─ Focus Distance
├─ Exposure Mode
├─ ... 8 weitere Features

Problem:
❌ Alle Buttons sichtbar = UI überladen
❌ Zu viele Controls = verwirrend
❌ Nicht professionell/elegant
❌ Nicht wie Apple
```

---

## Lösung: Apple Chevron Pattern

### Konzept

```
Apple iOS Camera App:
├─ Haupt-UI: Minimal, clean (Flash, Timer, Ratio)
├─ Chevron "^" oben: Click → Dropdown mit weiteren Settings
└─ Expert Features: Versteckt, aber zugänglich

Unser Design:
├─ Standard Mode: Grid, Level, WB, EV (sichtbar)
├─ Chevron "^": Click → Pro Controls Panel
└─ Expert Mode: ISO, Shutter, Focus, ... (versteckt)
```

### Visual Design

```
Top Bar:

┌────────────────────────────────┐
│ [#][⚖][🌡][→] [^] ROOM [⚙][RAW]│ ← Chevron neben Room
│                                │
│     ┌──────────────────────┐   │
│     │ ⚙️ Pro Controls      │   │ ← Slide-down Panel
│     ├──────────────────────┤   │
│     │ [ISO] [Shutter]      │   │
│     │ [Focus] [Exposure]   │   │
│     └──────────────────────┘   │
└────────────────────────────────┘

Chevron States:
├─ Inactive: Schwarz, Pfeil nach unten ↓
├─ Active: Gelb, Pfeil nach oben ↑
└─ Rotation: 180° beim Toggle
```

---

## Chevron Button Specs

### Design

```typescript
Size: 32×32px (wie andere Buttons)
Icon: 16×16px Chevron (nach unten)
Position: Top Center-Left (120px links vom Room Button)

Background:
├─ Inactive: rgba(0, 0, 0, 0.5) [Schwarz]
└─ Active: rgba(255, 204, 0, 0.9) [Gelb]

Animation:
├─ Rotation: 180° (0.2s ease)
├─ Panel: slideDown (0.3s ease)
└─ Backdrop: blur(20px)

States:
1. Closed: Pfeil ↓, Panel hidden
2. Open: Pfeil ↑, Panel visible
```

### Code

```typescript
<button
  onClick={() => setShowProControls(!showProControls)}
  style={{
    width: '32px',
    height: '32px',
    background: showProControls 
      ? 'rgba(255, 204, 0, 0.9)' 
      : 'rgba(0, 0, 0, 0.5)',
    // ... positioning
  }}
>
  <svg 
    style={{
      transform: showProControls 
        ? 'rotate(180deg)' 
        : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
    }}
  >
    <path d="M6 9L12 15L18 9" />
  </svg>
</button>
```

---

## Pro Controls Panel

### Layout

```
Panel Design:
├─ Position: Slide-down from top
├─ Top Offset: Below Room Button (+48px)
├─ Background: rgba(0, 0, 0, 0.95) + blur
├─ Max Height: 60vh (scrollable)
├─ Border: Bottom border (separator)
└─ Z-Index: 90 (über alles außer Overlays)

Grid Layout:
├─ 2 Columns (1fr 1fr)
├─ Gap: 12px
└─ Responsive auf kleinen Screens

Controls:
├─ 4 Main Features (initial)
│  ├─ ISO Control
│  ├─ Shutter Speed
│  ├─ Focus Mode
│  └─ Exposure Mode
└─ Erweiterbar mit weiteren Features
```

### Pro Control Cards

```typescript
Card Design:
├─ Background: rgba(255, 255, 255, 0.08)
├─ Border: 1px rgba(255, 255, 255, 0.1)
├─ Border-radius: 12px
├─ Padding: 12px

Structure:
┌─────────────────┐
│ ISO         ← Label (12px, gray)
│ 400         ← Value (20px, white, bold)
│ [Slider]    ← Control
└─────────────────┘
```

---

## Pro Features (Phase 2)

### 1. ISO Control

```typescript
Range: 50 - 3200
Steps: 50
Default: 100

Display:
├─ Label: "ISO"
├─ Value: Dynamic (e.g. "400")
└─ Control: Range Slider

Use Case:
├─ Low ISO (50-200): Bright scenes, low noise
├─ Medium ISO (400-800): Indoor, balanced
└─ High ISO (1600-3200): Dark scenes, more noise
```

### 2. Shutter Speed

```typescript
Presets: [500, 250, 125, 60, 30, 15] (1/x seconds)
Default: 125

Display:
├─ Label: "Shutter"
├─ Value: "1/125s"
└─ Control: Quick-Select Buttons (6 buttons)

Use Case:
├─ Fast (1/500s): Moving subjects
├─ Medium (1/125s): General photography
├─ Slow (1/30s): Low light, tripod needed
└─ Very Slow (1/15s): Long exposure, tripod required

Integration:
└─ Verbunden mit Stability Monitor
   └─ Warnung bei slow shutter + unstable
```

### 3. Focus Mode

```typescript
Modes: ['auto', 'manual']
Default: 'auto'

Display:
├─ Label: "Focus"
├─ Toggle: AUTO / MANUAL buttons
└─ Slider: Manual focus distance (0-100%, nur bei manual)

Use Case:
├─ Auto: Quick shooting, moving subjects
└─ Manual: Precise control, static subjects

Manual Focus:
├─ 0%: Infinity (landscape, architecture)
├─ 50%: Mid-range (3-5m, room shots)
└─ 100%: Close-up (macro, details)
```

### 4. Exposure Mode

```typescript
Modes: ['auto', 'manual']
Default: 'auto'

Display:
├─ Label: "Exposure"
└─ Toggle: AUTO / MANUAL buttons

Use Case:
├─ Auto: Camera determines exposure
└─ Manual: Full control (ISO + Shutter + EV)

Note:
└─ Manual mode aktiviert ISO + Shutter Controls
└─ Auto mode nutzt Camera's Metering
```

---

## User Workflow

### Scenario 1: Standard Photographer

```
User Workflow:
1. Öffnet Kamera → Clean UI
2. Nutzt Grid, Level, WB (Standard Features)
3. Chevron bleibt zu → Kein Clutter
4. Shutter → Perfect Workflow ✅

Result:
└─ Simple, elegant, nicht überladen
```

### Scenario 2: Pro Photographer

```
User Workflow:
1. Öffnet Kamera → Clean UI
2. Click Chevron → Pro Controls öffnen
3. Adjust ISO → 400 (Indoor)
4. Adjust Shutter → 1/60s (Low light)
5. Set Focus → Manual (Precise composition)
6. Chevron wieder zu → Shooting
7. Shutter → Perfect Workflow ✅

Result:
└─ Powerful, aber versteckt wenn nicht gebraucht
```

### Scenario 3: Immobilien-Shoot (Critical)

```
Pro Workflow:
1. Ankunft Location → Licht-Check
2. Click Chevron → Pro Controls
3. ISO: 200 (Low noise, bright rooms)
4. Shutter: 1/125s (Handheld-safe)
5. WB: Daylight (5500K, locked für HDR)
6. EV: +0.5 (Fenster richtig belichten)
7. Grid: 3×3 (Composition)
8. Level: ON (Perfekte Horizon)
9. Chevron zu → Clean view
10. Shutter → 3× DNG @ ±2 EV

Session:
├─ 15-20 Räume fotografiert
├─ Pro Controls nur 1× eingestellt
├─ Dann clean UI für restlichen Shoot
└─ Konsistente Ergebnisse ✅
```

---

## Integration mit Existing Features

### HDR Bracketing

```
Pro Controls + Bracketing:

Click Shutter:
1. Read evCompensation (base EV)
2. Read isoValue (locked)
3. Read shutterSpeed (base)
4. Lock WB (whiteBalanceLocked = true)
5. Capture Sequence:
   Pro Mode (RAW):
   ├─ Shot 1: EV - 2.0 → Shutter × 4
   ├─ Shot 2: EV + 0.0 → Shutter × 1
   └─ Shot 3: EV + 2.0 → Shutter ÷ 4
   
   Standard Mode (JPG):
   ├─ Shot 1: EV - 2.0 → Shutter × 4
   ├─ Shot 2: EV - 1.0 → Shutter × 2
   ├─ Shot 3: EV + 0.0 → Shutter × 1
   ├─ Shot 4: EV + 1.0 → Shutter ÷ 2
   └─ Shot 5: EV + 2.0 → Shutter ÷ 4
6. Unlock WB

Critical:
└─ ISO bleibt konstant (Pro Control locked)
└─ Nur Shutter Speed variiert (EV Control Protocol)
└─ WB locked für consistency
```

### Stability Monitor

```
Pro Controls + Stability:

Shutter Speed → Stability Thresholds:

Fast (≥ 1/60s):
├─ Stable: < 0.05 m/s²
├─ Warning: 0.05 - 0.15 m/s²
└─ Unstable: > 0.15 m/s²

Critical (1/30s - 1/60s):
├─ Stable: < 0.03 m/s²
├─ Warning: 0.03 - 0.10 m/s²
└─ Unstable: > 0.10 m/s²

Slow (< 1/30s):
├─ Stable: < 0.02 m/s²
├─ Warning: 0.02 - 0.05 m/s²
└─ Unstable: > 0.05 m/s² → ⚠️ TRIPOD REQUIRED

Adaptive Warning:
└─ Stability Monitor adjusts thresholds based on shutterSpeed
└─ Badge zeigt: "⚠️ PFLICHT" bei slow shutter + unstable
```

---

## Visual Hierarchy

### Z-Index Stack

```
Layer Stack (von unten nach oben):

├─ 1:  Camera Feed
├─ 2:  Safe-Zone Masks
├─ 3:  Format Frame
├─ 4:  Grid Overlay
├─ 15: Level Indicator
├─ 20: Device Type Badge
├─ 20: EV Badge
├─ 20: Chevron Button
├─ 30: Navigation Bar
├─ 40: Control Buttons
├─ 50: EV Long-Press Control
├─ 90: Pro Controls Panel ← Neu!
└─ 100: Settings/Room Overlays
```

### Backdrop Behavior

```
Pro Controls Panel Open:
├─ Panel: Z-Index 90, backdrop blur
├─ Chevron: Z-Index 30, rotated 180°
├─ Room Button: Still visible (below panel)
├─ Other Buttons: Still accessible
└─ Click outside → Does NOT close panel
   └─ Must click Chevron or X to close
```

---

## Animation Details

### Slide-Down Animation

```css
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

Duration: 0.3s ease
Effect: Smooth slide from top
```

### Chevron Rotation

```css
Chevron Icon Transform:
├─ Closed: rotate(0deg)
├─ Open: rotate(180deg)
└─ Transition: 0.2s ease

Visual:
Closed: ↓ (Pfeil nach unten)
Open:   ↑ (Pfeil nach oben)
```

---

## Keyboard Shortcuts

### New Shortcuts

```typescript
Key Bindings:
├─ P: Toggle Pro Controls Panel
├─ I: Adjust ISO (wenn Panel open)
├─ S: Adjust Shutter Speed (wenn Panel open)
├─ F: Toggle Focus Mode
└─ Esc: Close Pro Controls Panel

Existing (unchanged):
├─ R: Toggle Orientation
├─ G: Toggle Grid
├─ H: Toggle Histogram
├─ L: Toggle Level
├─ W: Toggle White Balance
└─ Space: Shutter
```

---

## Mobile/Touch Optimization

### Touch Targets

```
Chevron Button:
├─ Size: 32×32px (visual)
├─ Touch Area: 44×44px (WCAG minimum)
├─ Padding: 6px around button
└─ Gap to Room Button: 120px (safe distance)

Panel Controls:
├─ Buttons: Min 40×40px touch area
├─ Sliders: 44px height
├─ Grid Cards: 12px gap (prevent miss-taps)
└─ Scroll: Smooth, momentum-based
```

### Gesture Support

```
Gestures:
├─ Tap Chevron: Toggle Panel
├─ Tap outside: Keep Panel open (deliberate choice)
├─ Scroll Panel: Vertical scroll (wenn > 60vh content)
└─ Swipe Down: Future enhancement (close panel)
```

---

## Responsive Design

### Portrait Mode

```
Pro Controls Panel:
├─ Top: SAFE_AREA_TOP + 48px (below Room)
├─ Left/Right: 0 (full width)
├─ Max Height: 60vh
├─ Grid: 2 columns
└─ Scroll: Vertical (wenn nötig)
```

### Landscape Mode

```
Pro Controls Panel:
├─ Top: 56px (below Room)
├─ Left/Right: 0
├─ Max Height: 60vh (wichtiger in landscape)
├─ Grid: 2 columns (noch OK)
└─ Scroll: Wahrscheinlicher (weniger height)
```

---

## Feature Expansion

### Current (V1)

```
4 Pro Controls:
├─ ISO (50-3200)
├─ Shutter Speed (1/500 - 1/15)
├─ Focus Mode (Auto/Manual)
└─ Exposure Mode (Auto/Manual)
```

### Future (V2)

```
Zusätzliche Controls:
├─ Aspect Ratio Quick-Select
├─ Flash Control (wenn verfügbar)
├─ HDR Toggle (Auto/Off/On)
├─ Night Mode (iPhone 12+)
├─ RAW+ (RAW + HEIC gleichzeitig)
├─ Color Profile (Standard/Vivid/Neutral)
├─ Noise Reduction (Low/Medium/High)
├─ Sharpness (-2 to +2)
├─ Saturation (-2 to +2)
└─ Bracketing Count (3/5/7/9 shots)

Organization:
├─ Tab System (Camera / Image / Advanced)
├─ Collapsible Sections
└─ Search/Filter (bei vielen Controls)
```

---

## Best Practices

### When to Use Pro Controls

```
Use Cases:
✅ Low-light environments (ISO + Shutter)
✅ Specific creative intent (Manual Focus)
✅ Consistent session settings (Lock ISO/WB)
✅ Challenging exposure (Manual Exposure)
✅ Architectural precision (Grid + Level + Manual)

Don't Use:
❌ Quick snapshots (Standard Mode ausreichend)
❌ Dynamic scenes (Auto handles better)
❌ Beginners (zu viel Complexity)
```

### Settings Persistence

```
Pro Controls State:
├─ Session: Bleibt während Session
├─ App Close: Reset to defaults
├─ Job Switch: Bleibt (job-specific)
└─ Settings: Save preferred defaults

Rationale:
└─ Jeder Job kann andere Requirements haben
└─ Aber innerhalb Job: Consistency wichtig
```

---

## Testing Checklist

### Visual Tests

- [ ] Chevron Button sichtbar neben Room
- [ ] Chevron rotiert smooth (180°)
- [ ] Panel slide-down animation smooth
- [ ] Panel blur backdrop korrekt
- [ ] 2-column grid responsive
- [ ] Cards sauber aligned
- [ ] Scroll funktioniert bei overflow
- [ ] X-Button sichtbar zum Schließen

### Interaction Tests

- [ ] Click Chevron → Panel öffnet
- [ ] Click Chevron again → Panel schließt
- [ ] Click X → Panel schließt
- [ ] ISO Slider funktioniert (50-3200)
- [ ] Shutter Speed Buttons funktionieren
- [ ] Focus Mode Toggle funktioniert
- [ ] Manual Focus Slider erscheint
- [ ] Exposure Mode Toggle funktioniert
- [ ] Panel scrollbar bei overflow
- [ ] Room Button noch klickbar

### Integration Tests

- [ ] Pro Controls + HDR Bracketing
- [ ] ISO locked während Bracketing
- [ ] Shutter variiert für EV offsets
- [ ] Stability Monitor adjusts thresholds
- [ ] WB Lock funktioniert mit Pro Controls
- [ ] EV Control kombiniert mit Manual Exposure
- [ ] Keyboard Shortcuts (P, Esc)
- [ ] Portrait Mode Layout OK
- [ ] Landscape Mode Layout OK

---

## Performance

### Rendering

```
Pro Controls Panel:
├─ Components: ~15-20 elements
├─ Render Time: <5ms
├─ Memory: ~10KB
├─ Animation: GPU-accelerated
└─ Scroll: Smooth (60fps)

Optimization:
├─ Conditional render (nur wenn open)
├─ CSS animations (nicht JS)
├─ Backdrop-filter (native blur)
└─ Lazy load weitere controls (future)
```

---

## Accessibility

### Screen Readers

```
ARIA Labels:
├─ Chevron: "Toggle Pro Controls"
├─ Panel: role="dialog" aria-label="Pro Camera Controls"
├─ ISO: aria-label="ISO sensitivity" aria-valuetext="400"
├─ Shutter: aria-label="Shutter speed" aria-valuetext="1/125 second"
└─ Focus: aria-label="Focus mode" aria-valuetext="Auto"
```

### Keyboard Navigation

```
Tab Order:
1. Chevron Button
2. Pro Controls Panel (wenn open)
   ├─ Close Button (X)
   ├─ ISO Slider
   ├─ Shutter Buttons (1-6)
   ├─ Focus Buttons (Auto/Manual)
   ├─ Focus Slider (wenn Manual)
   └─ Exposure Buttons
3. Other Camera Controls
```

---

## Conclusion

Das **Pro Controls Chevron System** bringt:

✅ **Clean UI** - Expert Features versteckt
✅ **Apple-Style** - Vertrautes Pattern
✅ **Powerful** - Full manual control when needed
✅ **Elegant** - Smooth animations, professional
✅ **Scalable** - Easy to add more controls
✅ **Optional** - Beginners never see it

**Perfect für PIX.IMMO: Simple für Standard, Powerful für Pros! 📸⚙️**

---
*Pro Controls Chevron System - Apple-Inspired Expert Mode - 05.11.2025*
