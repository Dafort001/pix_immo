# 📱 iPhone App Quick Reference

## Zugriff
```
/app-overview    → Übersicht aller App-Seiten
/app            → Login-Seite (Standard)
/app/login      → Login-Seite (explizit)
```

## Design Tokens

### Farben
```css
/* Light Mode */
--bg: #FFFFFF
--text-primary: #111111
--text-secondary: #6B7280
--brand: #3B82F6
--border: #E5E7EB

/* Dark Mode */
--bg: #0E0E0E
--text-primary: #FFFFFF
--text-secondary: #A3A3A3
--brand: rgba(59,130,246,0.9)
--border: #2C2C2C
```

### Typografie
```css
/* Inter Font Family */
H1: 22pt SemiBold / 28pt (PIX.IMMO)
H2: 17pt Regular / 22pt (Aufnahme)
Body: 15pt Regular / 21pt
Small: 13pt Regular / 18pt

/* Tracking */
H1: 0.05em letter-spacing
```

### Spacing
```css
/* 8pt Grid System */
Safe Area Top: 64pt
Safe Area Bottom: 24pt
Content Padding: 24pt (horizontal)

/* Components */
Field Height: 56pt
Button Height: 56pt
Corner Radius: 16pt
Field Gap: 12pt
Section Gap: 32pt
```

### Touch Targets
```css
Minimum: 44pt × 44pt
Icon Tap Area: 44pt × 44pt
Button Height: 56pt (exceeds minimum)
```

## Components

### Input Field
```tsx
<Input
  style={{
    height: '56pt',
    borderRadius: '16pt',
    paddingLeft: '48pt',
    fontSize: '17pt',
  }}
/>
```

### Primary Button
```tsx
<Button
  className="bg-[#3B82F6]"
  style={{
    height: '56pt',
    borderRadius: '16pt',
    fontSize: '17pt',
    fontWeight: 600,
  }}
>
  Anmelden
</Button>
```

### Secondary Button
```tsx
<Button
  variant="outline"
  className="border-[#3B82F6] text-[#3B82F6]"
  style={{
    height: '56pt',
    borderRadius: '16pt',
    fontSize: '17pt',
  }}
>
  Demo starten
</Button>
```

### iOS Switch
```tsx
<Switch
  checked={value}
  onCheckedChange={setValue}
/>
```

## Layout Structure

```
┌─────────────────────────┐
│  Safe Area (Status Bar) │
├─────────────────────────┤
│  Top Padding (64pt)     │
├─────────────────────────┤
│  Logo (64px)            │
│  H1 "PIX.IMMO"          │
│  H2 "Aufnahme"          │
│  Subtitle               │
├─────────────────────────┤
│  Gap (32pt)             │
├─────────────────────────┤
│  E-Mail Field (56pt)    │
│  Gap (12pt)             │
│  Password Field (56pt)  │
│  Gap (12pt)             │
│  Switch + Label         │
│  Gap (8pt)              │
│  "Passwort vergessen?"  │
├─────────────────────────┤
│  Gap (16pt)             │
├─────────────────────────┤
│  Primary Button (56pt)  │
│  Gap (24pt)             │
│  Divider "oder"         │
│  Gap (24pt)             │
│  Secondary Button (56pt)│
├─────────────────────────┤
│  Spacer (flex-1)        │
├─────────────────────────┤
│  Footer                 │
│  Bottom Padding (24pt)  │
├─────────────────────────┤
│  Safe Area (Home Indic.)│
└─────────────────────────┘
```

## States

### Button States
```
Normal:   bg-[#3B82F6]
Hover:    bg-[#3B82F6]/90
Pressed:  bg-[#3B82F6] + darker
Disabled: opacity-55
Loading:  Spinner (white, 20pt)
```

### Input States
```
Normal:  border @ 20% opacity
Focus:   border @ 100%, brand color
Error:   border-red-500
Success: border-green-500
```

## Icons

```tsx
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Standard Size
<Mail size={20} />

// Navigation
<ChevronLeft size={24} />
```

## Navigation

```tsx
import { Link, useLocation } from 'wouter';

// Link
<Link href="/register">
  <button>Registrieren</button>
</Link>

// Programmatic
const [, setLocation] = useLocation();
setLocation('/dashboard');
```

## Dark Mode

```tsx
// Automatisch via Tailwind
<div className="bg-white dark:bg-[#0E0E0E]">
  <p className="text-[#111111] dark:text-white">Text</p>
</div>
```

## Testing

```bash
# Development
npm run dev

# Öffne: http://localhost:5173/app

# Teste in verschiedenen Modi:
# - Light Mode (Browser Standard)
# - Dark Mode (OS Setting ändern)
# - Mobile Viewport (iPhone 15 Pro: 393 × 852)
```

## Cheat Sheet

| Element | Height | Radius | Font |
|---------|--------|--------|------|
| Input | 56pt | 16pt | 17pt Regular |
| Button | 56pt | 16pt | 17pt SemiBold |
| Logo | 64px | 12pt | - |
| Icon | 20pt | - | - |
| H1 | auto | - | 22pt SemiBold |
| H2 | auto | - | 17pt Regular |
| Body | auto | - | 15pt Regular |

## Next Steps

1. ✅ Login-Seite fertig
2. ⏳ Dashboard erstellen
3. ⏳ Kamera-Integration
4. ⏳ Job-Details
5. ⏳ Settings

---

**Letzte Aktualisierung**: 2025-11-05  
**Version**: 1.0.0  
**Status**: ✅ Login Production Ready
