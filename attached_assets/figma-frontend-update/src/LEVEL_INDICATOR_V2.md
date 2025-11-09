# Level Indicator V2 - Schlichte Horizon-Line Design

## Übersicht

Neues, minimalistisches Design für den Level Indicator - inspiriert von professionellen Kameras mit rotierender Horizon-Line statt vertikaler Bar.

---

## Design Philosophy

### ❌ Alt: Vertical Bar (V1)
```
Problem:
├─ Nimmt Platz am Bildschirmrand
├─ Kollidiert mit Grid lines
├─ Nicht intuitiv (welche Richtung ist level?)
└─ Zu aufdringlich

Visual:
    |═○═|  ← Vertikale Bar am Rand
    | | |     mit Dot und Tick Marks
    | | |
```

### ✅ Neu: Rotating Horizon Line (V2)
```
Vorteile:
├─ Im Center des Viewfinders
├─ Integriert sich perfekt mit Grid
├─ Intuitiv: Linie horizontal = level
├─ Minimal und schlicht
└─ Folgt echter Horizont-Metapher

Visual:
    ⭘  ← Referenz-Kreis (fix)
   ━━━ ← Horizon Line (rotiert)
    ●  ← Center Dot
```

---

## Visual Design

### Component Structure

```
┌─────────────────────────────┐
│                             │
│        Viewfinder           │
│                             │
│          ⭘─━━━─             │ ← Horizon Line
│                             │    (rotiert mit Device)
│                             │
└─────────────────────────────┘

Detail View (Center):
        ╭───────╮
        │       │  ← Reference Circle (fix)
    ────●────      ← Horizon Line (rotiert)
        │       │     Center Dot
        ╰───────╯
```

### States

#### 1. Level (±2°)
```
Color: Grün (#64BF49)
Glow: 0 0 8px rgba(100, 191, 73, 0.6)

        ⭘
    ━━━━●━━━━  ← Grüne Linie, horizontal
        
Status: ✅ LEVEL
```

#### 2. Slight Tilt (2° - 5°)
```
Color: Weiß (rgba(255, 255, 255, 0.9))
Angle Display: +3.5°

        ⭘
      ━━●━━     ← Weiße Linie, leicht geneigt
        ╱
   [+3.5°]      ← Winkel-Anzeige
```

#### 3. Strong Tilt (>5°)
```
Color: Weiß (rgba(255, 255, 255, 0.9))
Angle Display: -7.2°

        ⭘
       ━●━      ← Weiße Linie, stark geneigt
      ╱
   [-7.2°]      ← Winkel-Anzeige
```

---

## Technical Implementation

### Component Props

```typescript
interface LevelIndicatorProps {
  orientation: 'portrait' | 'landscape';
}
```

### Key Elements

#### 1. Reference Circle (Fixed)
```typescript
Position: Center (50%, 50%)
Size: 24x24px
Border: 2px solid rgba(255, 255, 255, 0.6)
Purpose: Visual reference point
Z-Index: Static
```

#### 2. Horizon Line (Rotating)
```typescript
Width: 120px
Height: 3px
Transform: rotate(${tiltAngle}deg)
Background: Gradient (fade at edges)
  - Level:    #64BF49
  - Not Level: rgba(255, 255, 255, 0.9)
Transition: 0.2s ease
```

#### 3. Center Dot
```typescript
Size: 8x8px
Border-radius: 50%
Background: Color-coded (same as line)
Shadow: Glow effect when level
Position: Center of horizon line
```

#### 4. Angle Display (Conditional)
```typescript
Visibility: Only when |tilt| > 0.5° AND not level
Font: 11px, 600 weight
Color: rgba(255, 255, 255, 0.7)
Background: rgba(0, 0, 0, 0.5) with blur
Format: "+3.5°" or "-2.1°"
```

### Fixed Horizon Reference
```typescript
Width: 200px (full width)
Height: 1px
Background: rgba(255, 255, 255, 0.4)
Purpose: Show true horizontal reference
```

---

## Integration with Grid

### Perfect Harmony

```
Grid 3×3 + Level Indicator:

┌─────┬─────┬─────┐
│     │     │     │
├─────┼──⭘──┼─────┤  ← Grid lines + Level center
│     │ ━●━ │     │     perfekt aligned!
├─────┼─────┼─────┤
│     │     │     │
└─────┴─────┴─────┘

Advantages:
├─ Level indicator uses grid center
├─ No overlap with grid lines
├─ Minimal visual clutter
└─ Professional camera feel
```

### Z-Index Strategy

```
Layer Stack:
├─ zIndex 1: Camera Feed
├─ zIndex 2: Safe-Zone Masks
├─ zIndex 3: Format Frame
├─ zIndex 4: Grid Overlay
├─ zIndex 15: Level Indicator ← Over grid
└─ zIndex 20+: Controls & UI
```

---

## User Experience

### Workflow

#### Step 1: Activate
```
User Action:
└─ Tap Level Indicator Button [⚖️]

Result:
└─ Horizon line appears in center
```

#### Step 2: Align
```
User sees:
┌─────────┐
│    ⭘    │  ← Reference circle
│   ━●━   │  ← Line tilted (white)
│  ╱      │
└─────────┘

User Action:
├─ Tilts phone left/right
└─ Watches line rotate to horizontal

Target:
┌─────────┐
│    ⭘    │
│  ━━●━━  │  ← Line horizontal (green) ✅
│         │
└─────────┘
```

#### Step 3: Capture
```
When level (±2°):
├─ Line turns green
├─ Subtle glow effect
├─ Angle display disappears
└─ User captures photo with perfect horizon
```

---

## Visual Specifications

### Colors

```css
Level State (±2°):
├─ Line: #64BF49 (Green)
├─ Dot: #64BF49 (Green)
├─ Glow: rgba(100, 191, 73, 0.6)
└─ Shadow: 0 0 8px rgba(100, 191, 73, 0.8)

Not Level (>2°):
├─ Line: rgba(255, 255, 255, 0.9) (White)
├─ Dot: rgba(255, 255, 255, 0.9) (White)
└─ Shadow: 0 0 4px rgba(0, 0, 0, 0.4)

Reference Elements:
├─ Circle: rgba(255, 255, 255, 0.6)
├─ Horizon: rgba(255, 255, 255, 0.4)
└─ Angle Text: rgba(255, 255, 255, 0.7)
```

### Gradients

```css
Horizon Line Gradient:
linear-gradient(
  90deg,
  transparent 0%,
  [color] 30%,
  [color] 70%,
  transparent 100%
)

Purpose: Fade at edges for softer look
```

### Animations

```css
Color Transition:
├─ Property: background
├─ Duration: 0.2s
├─ Easing: ease
└─ Trigger: Level state change

Rotation:
├─ Property: transform rotate
├─ Updates: Every 50ms (from DeviceMotion)
└─ Smooth: Native browser animation
```

---

## Comparison: V1 vs V2

### Size & Space

```
V1 (Vertical Bar):
├─ Width: 4px
├─ Height: 200px
├─ Position: Left edge
├─ Total Area: ~800px²
└─ Screen Usage: Edge blocking

V2 (Horizon Line):
├─ Width: 120px
├─ Height: 3px
├─ Position: Center
├─ Total Area: ~360px²
└─ Screen Usage: Minimal, centered
```

### Intuition

```
V1: "Is the dot in the middle?"
└─ Not immediately clear what's "level"

V2: "Is the line horizontal?"
└─ Instantly recognizable (real horizon)
```

### Integration

```
V1 with Grid:
├─ Conflicts with vertical grid lines
└─ Separate visual elements

V2 with Grid:
├─ Uses grid center point
└─ Harmonious integration ✅
```

---

## Mobile Optimization

### Portrait Mode
```
Position: Center (50%, 50%)
Size: Optimal for one-hand use
Touch Target: N/A (pointer-events: none)
```

### Landscape Mode
```
Position: Center (50%, 50%)
Size: Same as portrait
Rotation: Works identically
```

---

## Accessibility

### Visual Clarity

```
1. High Contrast:
   ├─ White line on dark background
   ├─ Green level state very visible
   └─ No small elements (<8px)

2. Color Coding:
   ├─ Green = Good (universal)
   ├─ White = Neutral/Adjust
   └─ Numerical angle for color-blind users

3. Size:
   ├─ Reference circle: 24px (WCAG minimum)
   ├─ Horizon line: 120px wide (easy to see)
   └─ Angle text: 11px (readable)
```

---

## Performance

### Rendering

```
Update Frequency: 20 FPS (50ms interval)
Elements: 5 DOM nodes total
Animations: CSS transform (GPU-accelerated)
Memory: <2KB
```

### Battery Impact

```
DeviceMotion API:
├─ Native browser event
├─ Low power consumption
└─ Only active when indicator enabled

Recommendation:
└─ Disable when not needed (toggle button)
```

---

## Use Cases

### Real Estate Photography

```
Scenario: Innenraum-Foto
├─ Horizon muss perfekt sein
├─ Fenster/Türen als Referenz
└─ Level Indicator zeigt ±0.3° → Perfekt! ✅
```

### Exterior Shots

```
Scenario: Gebäudefassade
├─ Vertikale Linien wichtig
├─ Auch horizontale Ausrichtung kritisch
└─ Level + Grid kombiniert → Perfekte Geometrie
```

---

## Future Enhancements

### V3 Ideas

```
1. Dual-Axis Level:
   ├─ Horizontal: Current implementation
   ├─ Vertical: Add pitch indicator
   └─ Show both axes simultaneously

2. Calibration:
   ├─ User can calibrate "true level"
   ├─ Offset compensation
   └─ Save per device

3. Audio Feedback:
   ├─ Beep when reaching level
   ├─ Haptic feedback (iOS)
   └─ Accessibility enhancement

4. Advanced Modes:
   ├─ "Unlock" level at specific angle
   ├─ Show degree grid (every 5°)
   └─ Match horizon to scene element
```

---

## Testing Checklist

### Visual Tests

- [ ] Horizon line renders correctly
- [ ] Reference circle visible
- [ ] Center dot aligned
- [ ] Gradient fade at edges
- [ ] Green glow when level
- [ ] Angle display appears/disappears
- [ ] Smooth rotation animation

### Functional Tests

- [ ] DeviceMotion API integration
- [ ] Tilt angle calculation accurate
- [ ] Level threshold (±2°) works
- [ ] Color change at threshold
- [ ] Angle display threshold (>0.5°)
- [ ] Toggle on/off works
- [ ] No performance issues

### Integration Tests

- [ ] Works with Grid 3×3
- [ ] Works with Grid 4×4
- [ ] Works with Golden Grid
- [ ] Doesn't overlap controls
- [ ] Doesn't block viewfinder
- [ ] Portrait mode OK
- [ ] Landscape mode OK

---

## Conclusion

**V2 Level Indicator ist:**
- ✅ **Schlichter** - Minimales Design
- ✅ **Intuitiver** - Echte Horizon-Metapher
- ✅ **Kompakter** - Weniger Platz
- ✅ **Eleganter** - Perfekt mit Grid integriert
- ✅ **Professionell** - Wie echte Kameras

**Perfect für PIX.IMMO! 🎯**

---
*Level Indicator V2 Documentation - Horizon-Line Design - 05.11.2025*
