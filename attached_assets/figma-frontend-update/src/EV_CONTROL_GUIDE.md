# 📸 Apple-Style EV Compensation Control

## Übersicht

Das EV Control System folgt dem Apple iOS Kamera-App Pattern für intuitive Belichtungssteuerung ohne permanente UI-Elemente.

---

## Interaction Pattern

### 1. Activation (Long-Press)

```
User Action:
├─ Finger auf Viewfinder halten
├─ Nach 500ms → Control erscheint
└─ Sonnensymbol zeigt Aktivierung

Visual Feedback:
┌──────────┐
│    ☀     │ ← Gelbes Sonnen-Icon (44x44px)
│  Glow    │    mit subtiler Animation
└──────────┘
┌──────────┐
│   +0.0   │ ← EV-Wert Display
└──────────┘
    |●|      ← Vertikale Skala
    | |         Position-Indicator
    |─|         Center Marker (0 EV)
    | |
    | |
```

### 2. Adjustment (Vertical Drag)

```
Drag Mapping:
├─ 100px nach oben   = +1.0 EV (heller)
├─ 100px nach unten  = -1.0 EV (dunkler)
├─ Range: -2.0 bis +2.0 EV
└─ Smooth interpolation (0.1 EV steps)

Visual:
[+2.0 EV] ─┬─  ← Top (maximale Helligkeit)
           │
[+1.0 EV] ─┼─
           │
[ 0.0 EV] ═╪═  ← Center (neutral)
           │
[-1.0 EV] ─┼─
           │
[-2.0 EV] ─┴─  ← Bottom (maximale Dunkelheit)

Position-Dot Position:
├─ -2.0 EV → 100% (unten)
├─  0.0 EV →  50% (mitte)
└─ +2.0 EV →   0% (oben)
```

### 3. Deactivation (Auto-Hide)

```
Timeline:
├─ User releases finger
├─ Control bleibt 1.5s sichtbar
├─ Fade-out Animation (200ms)
└─ Badge zeigt aktiven EV-Wert permanent
```

---

## UI Components

### Component 1: Sun Icon

```typescript
Appearance:
├─ Size: 44x44px
├─ Shape: Circle
├─ Background: rgba(255, 204, 0, 0.9) [Gelb]
├─ Icon: White sun with rays
├─ Shadow: 0 4px 12px rgba(255, 204, 0, 0.4)
└─ Position: Folgt Finger, -120% offset (über Finger)

Animation:
├─ Fade-in: 200ms
├─ Scale: 0.8 → 1.0
└─ Smooth transition
```

### Component 2: EV Value Display

```typescript
Appearance:
├─ Background: rgba(0, 0, 0, 0.8)
├─ Padding: 6px 12px
├─ Border-radius: 12px
├─ Font: 13px, bold
├─ Min-width: 60px
├─ Text-align: center

Color Coding:
├─ EV = 0   → White (#FFFFFF)
├─ EV > 0   → Yellow (#FFCC00)
└─ EV < 0   → Orange (#FF9500)

Format:
├─ +0.5 EV → "+0.5"
├─  0.0 EV → "0.0"
└─ -1.2 EV → "-1.2"
```

### Component 3: Vertical Scale

```typescript
Appearance:
├─ Width: 2px
├─ Height: 80px
├─ Background: rgba(255, 255, 255, 0.3)
├─ Border-radius: 1px

Elements:
1. Center Marker (0 EV):
   ├─ Width: 8px
   ├─ Height: 2px
   ├─ Background: rgba(255, 255, 255, 0.6)
   └─ Position: 50% (center)

2. Position Indicator (Current EV):
   ├─ Size: 10x10px
   ├─ Shape: Circle
   ├─ Background: Color-coded (see below)
   ├─ Shadow: 0 2px 4px rgba(0, 0, 0, 0.3)
   └─ Position: Calculated from EV value

Color Coding:
├─ EV = 0   → White
├─ EV > 0   → Yellow (#FFCC00)
└─ EV < 0   → Orange (#FF9500)
```

### Component 4: Persistent Badge (Top Right)

```typescript
Visibility:
└─ Only shown when EV ≠ 0

Appearance:
├─ Position: Below Device Type Badge
├─ Background: Color-coded
├─ Padding: 6px 12px
├─ Border-radius: 12px
├─ Font: 12px, bold

Background Color:
├─ EV > 0 → rgba(255, 204, 0, 0.9) [Gelb]
└─ EV < 0 → rgba(255, 149, 0, 0.9) [Orange]

Content:
├─ Sun Icon (14x14px, white)
├─ Gap: 6px
└─ EV Value (e.g., "+0.7")
```

---

## Touch Handler Logic

### handleTouchStart(e: TouchEvent)

```typescript
1. Get touch coordinates (x, y)
2. Start long-press timer (500ms)
3. If timer expires:
   ├─ Show EV Control at (x, y)
   ├─ Store initial Y position
   ├─ Store initial EV value
   └─ Enable drag mode
```

### handleTouchMove(e: TouchEvent)

```typescript
If EV Control active:
  1. Get current touch Y position
  2. Calculate deltaY = startY - currentY (inverted!)
  3. Calculate EV change:
     evChange = deltaY / 100  // 100px = 1 EV
  4. Calculate new EV:
     newEV = clamp(startEV + evChange, -2.0, 2.0)
  5. Update EV compensation state
  6. Update control position to follow finger

Else (Long-press not complete):
  1. Cancel long-press timer (finger moved)
```

### handleTouchEnd()

```typescript
1. Clear long-press timer if active
2. If EV Control shown:
   ├─ Start 1.5s hide timer
   └─ Fade out EV Control
3. Badge remains visible if EV ≠ 0
```

---

## User Workflows

### Workflow 1: Quick EV Adjustment

```
Scenario: Gegenlicht-Szene, Fenster überstrahlt

Steps:
1. User hält Finger auf dunklen Bereich
2. Nach 500ms: Sonnensymbol erscheint
3. User wischt nach unten (darker)
4. EV ändert sich: 0.0 → -0.3 → -0.7 → -1.2
5. Badge zeigt: [☀ -1.2]
6. User macht Foto → Fenster korrekt belichtet ✅
```

### Workflow 2: Korrektur nach Vorschau

```
Scenario: Foto zu dunkel, nochmal versuchen

Steps:
1. User sieht zu dunkles Vorschaubild
2. Long-Press auf Viewfinder
3. Wischt nach oben (brighter)
4. EV ändert sich: -1.2 → -0.5 → 0.0 → +0.5
5. Badge update: [☀ +0.5]
6. User macht Foto → Bessere Belichtung ✅
```

### Workflow 3: Reset zu 0

```
Scenario: EV zurücksetzen

Steps:
1. Badge zeigt: [☀ -1.5]
2. Long-Press auf Viewfinder
3. Wischt nach oben bis Center Marker
4. EV = 0.0
5. Badge verschwindet (nur bei EV ≠ 0)
6. Neutral Exposure ✅
```

---

## HDR Bracketing Integration

### EV Compensation + HDR

```
Wichtig:
├─ evCompensation ist BASE Wert
├─ HDR Bracketing addiert EV-Offsets
└─ Finale EV = evCompensation + bracketOffset

Example:
User setzt: evCompensation = -0.7
HDR Pro Mode (3 shots):
├─ Shot 1: -0.7 + (-2) = -2.7 EV (underexposed)
├─ Shot 2: -0.7 + (0)  = -0.7 EV (base)
└─ Shot 3: -0.7 + (+2) = +1.3 EV (overexposed)

EXIF Export:
{
  "evCompensationBase": -0.7,
  "shots": [
    { "ev_offset": -2, "ev_total": -2.7 },
    { "ev_offset": 0,  "ev_total": -0.7 },
    { "ev_offset": +2, "ev_total": +1.3 }
  ]
}
```

---

## Accessibility

### Visual Feedback

```
1. Sun Icon:
   ├─ Universally recognized symbol
   ├─ High contrast (yellow on dark)
   └─ Large touch target (44x44px)

2. Color Coding:
   ├─ Yellow (+EV) = Brighter
   ├─ Orange (-EV) = Darker
   └─ White (0 EV) = Neutral

3. Numerical Display:
   ├─ Always shows exact value
   ├─ Clear +/- prefix
   └─ High contrast text
```

### Haptic Feedback (Native App)

```
Recommended Haptics:
├─ Long-press activation → Light impact
├─ Pass through 0 EV → Medium impact
├─ Reach -2/+2 limit → Notification impact
└─ Touch end → Selection impact
```

---

## Performance

### Rendering

```
Optimization:
├─ Control only rendered when visible
├─ No continuous animation loops
├─ CSS transforms for positioning
└─ requestAnimationFrame for smooth updates

Metrics:
├─ Touch latency: <50ms
├─ Drag responsiveness: 60 FPS
└─ Memory footprint: ~5KB
```

### Battery Impact

```
Long-Press Detection:
├─ Single setTimeout (500ms)
├─ No polling
└─ Negligible battery impact

Drag Handling:
├─ TouchMove events only when active
├─ Throttled position updates
└─ Auto-cleanup after 1.5s
```

---

## Testing Checklist

### Functional Tests

- [ ] Long-press activates after 500ms
- [ ] Control appears at correct position
- [ ] Drag up increases EV (+)
- [ ] Drag down decreases EV (-)
- [ ] 100px drag = 1 EV change
- [ ] EV clamped to -2.0 / +2.0
- [ ] Control follows finger during drag
- [ ] Control auto-hides after 1.5s
- [ ] Badge shows when EV ≠ 0
- [ ] Badge hides when EV = 0
- [ ] EXIF export includes evCompensationBase

### Visual Tests

- [ ] Sun icon renders correctly
- [ ] EV value displays with correct color
- [ ] Vertical scale visible
- [ ] Position dot moves smoothly
- [ ] Center marker visible
- [ ] Badge positioned correctly
- [ ] Fade-in animation smooth
- [ ] Fade-out animation smooth

### Edge Cases

- [ ] Moving finger cancels long-press
- [ ] Multiple touches handled gracefully
- [ ] Control doesn't block camera controls
- [ ] Works in portrait mode
- [ ] Works in landscape mode
- [ ] Badge doesn't overlap other badges
- [ ] EV persists across captures
- [ ] EV resets work correctly

---

## Comparison: Old vs New

### Old System (Slider)

```
Pros:
├─ Always visible
├─ Precise value selection
└─ Familiar slider pattern

Cons:
├─ Takes up screen space (280px wide)
├─ Always in the way
├─ Less intuitive for quick adjustments
└─ Not mobile-optimized
```

### New System (Apple-Style)

```
Pros:
├─ No permanent UI clutter ✅
├─ Contextual (appears where needed) ✅
├─ Fast adjustment (drag vs slider) ✅
├─ Professional/familiar pattern (iOS) ✅
├─ Badge shows active state ✅
└─ More screen space for viewfinder ✅

Cons:
├─ Discoverability (users must know to long-press)
└─ Requires 500ms wait (but this is iOS standard)
```

---

## Future Enhancements

### V2 Ideas

```
1. Focus + EV Combined Control:
   ├─ Long-press sets focus point
   ├─ Horizontal drag = Focus adjust
   └─ Vertical drag = EV adjust

2. Preset EV Values:
   ├─ Double-tap → EV presets menu
   ├─ Quick access: -1.0, -0.5, 0, +0.5, +1.0
   └─ Custom presets in settings

3. Scene-Based Auto-EV:
   ├─ Detect high-contrast scenes
   ├─ Suggest EV adjustment
   └─ "Gegenlicht erkannt: -0.7 EV empfohlen?"

4. EV Lock:
   ├─ Double-tap on badge to lock
   ├─ Locked EV persists across sessions
   └─ Visual indicator (🔒)
```

---

## Conclusion

Das Apple-Style EV Control System ist:
- ✅ **Intuitiv** - Natürliche Touch-Geste
- ✅ **Kompakt** - Nur sichtbar wenn benötigt
- ✅ **Schnell** - Direktes Feedback
- ✅ **Professional** - iOS-Standard Pattern
- ✅ **Flexibel** - Funktioniert mit HDR Bracketing

**Perfect für Immobilienfotografie! 📸**

---
*EV Control Guide - Apple-Style Implementation - 05.11.2025*
