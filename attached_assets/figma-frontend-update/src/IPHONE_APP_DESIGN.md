# 📱 PIX.IMMO iPhone App Design System

Dieses Dokument beschreibt die Design-Spezifikationen für die PIX.IMMO iPhone App basierend auf iPhone 15 Pro im Portrait-Modus.

## 🎯 Device Spezifikationen

### Frame-Einstellungen
```
Gerät: iPhone 15 Pro / Portrait
Screen Size: 393 × 852 pt
Safe Area: ON (aktiv)
Top-Padding: 64 pt (ab Safe Area)
Bottom-Padding: 24 pt (über Home Indicator)
Layout-Grid: 8 pt-Raster aktiv
Content-Padding horizontal: 24 pt (6 × 8 pt Grid)
```

## 🎨 Farb-System

### Light Mode
| Element | Farbe | Hex |
|---------|-------|-----|
| Background | Weiß | `#FFFFFF` |
| Text Primary | Schwarz | `#111111` |
| Text Secondary | Grau | `#6B7280` |
| Placeholder | Primary Text @ 60% | `rgba(17,17,17,0.6)` |
| Border/Outline | Hellgrau @ 20% | `#E5E7EB` |
| Brand/Button | Blau | `#3B82F6` |

### Dark Mode
| Element | Farbe | Hex |
|---------|-------|-----|
| Background | Dunkel | `#0E0E0E` |
| Text Primary | Weiß | `#FFFFFF` |
| Text Secondary | Hellgrau | `#A3A3A3` |
| Placeholder | Primary Text @ 60% | `rgba(255,255,255,0.6)` |
| Border/Outline | Dunkelgrau @ 40% | `#2C2C2C` |
| Brand/Button | Blau @ 90% | `rgba(59,130,246,0.9)` |

## 📐 Layout-Struktur

### 1. Header / Brandblock
```
Top Position: Safe Area + 64 pt
Alignment: Center
```

| Element | Spezifikation |
|---------|---------------|
| Logo/Icon | 64 px Höhe, zentriert, max Breite 128 px |
| H1 „PIX.IMMO" | Inter SemiBold 22 pt, Zeilenabstand 28 pt, Letter-spacing 0.05em |
| H2 „Aufnahme" | Inter Regular 17 pt, Zeilenabstand 22 pt |
| Subtitle | Inter Regular 15 pt, Zeilenabstand 21 pt, 60% Opacity |
| Abstände vertikal | Logo → H1: 8 pt, H1 → H2: 8 pt, H2 → Subtitle: 6 pt |
| Abstand zum Form-Block | 32 pt |

### 2. Login-Formular-Block

| Element | Spezifikation |
|---------|---------------|
| **Input Fields** ||
| Höhe | 56 pt |
| Corner-Radius | 16 pt |
| Abstand zwischen Feldern | 12 pt |
| Border | 1 px, 20% opacity (Light) / 40% opacity (Dark) |
| Text Size | 17 pt |
| Icon Size | 20 pt |
| Icon Position | Links, 16 pt vom Rand |
| Text Padding | Links: 48 pt, Rechts: 16 pt |
| **E-Mail Field** ||
| Leading Icon | Mail Icon, 20 pt |
| Placeholder | 60% opacity |
| Autofill | Aktiv (`autocomplete="email"`) |
| **Password Field** ||
| Leading Icon | Lock Icon, 20 pt |
| Trailing Icon | Eye/EyeOff Icon, 20 pt |
| Tap Area (Eye Icon) | 44 pt × 44 pt |
| Text Padding Right | 56 pt (für Icon) |
| **Switch „Angemeldet bleiben"** ||
| Label | Inter Regular 15 pt, links |
| iOS Switch | Rechts |
| Vertical Padding | 8 pt |
| Min-Height | 44 pt (Touch Target) |
| **Link „Passwort vergessen?"** ||
| Position | Unter Password-Field, linksbündig |
| Spacing oben | 8 pt |
| Text | Inter Regular 15 pt, Brand-Farbe |
| Tap-Target | Min 44 pt Höhe |

### 3. Buttons-Bereich

| Element | Spezifikation |
|---------|---------------|
| **Primary Button „Anmelden"** ||
| Farbe | Brand-Farbe `#3B82F6` |
| Höhe | 56 pt |
| Corner-Radius | 16 pt |
| Text | Inter SemiBold 17 pt, Weiß |
| Abstand zum Feld | 16 pt |
| States | Enabled / Disabled (55% opacity) / Pressed (10% dunkler) / Loading (Spinner) |
| **Divider „oder"** ||
| Linie | 1 px, 20% opacity |
| Abstand oben/unten | 24 pt |
| Text | Inter Regular 15 pt, Secondary Text Color |
| **Secondary Button „Demo starten"** ||
| Style | Outline |
| Border | 1 px Brand-Farbe, 25% opacity |
| Höhe | 56 pt |
| Corner-Radius | 16 pt |
| Text | Inter SemiBold 17 pt, Brand-Farbe |
| Abstand oben | 16 pt (nach Divider) |

### 4. Footer

| Element | Spezifikation |
|---------|---------------|
| Position | Bottom (mit Spacer) |
| Bottom Padding | 24 pt + Bottom Safe Area |
| **Text „Noch kein Account?"** ||
| Font | Inter Regular 15 pt |
| Color | Primary Text |
| **Link „Jetzt registrieren"** ||
| Font | Inter Medium 15 pt |
| Color | Brand-Farbe |
| Tap-Target | Min 44 pt unsichtbarer Frame |
| **Gerätehinweis** ||
| Font | Inter Regular 13 pt |
| Color | Secondary Text @ 60% opacity |
| Text | z.B. „iPhone App · Version 1.0.0" |

## 📱 Implementierte Seiten

### 1. Splash Screen / Session Check (`/app`)

**Features:**
- ✅ App-Start Animation (Fade-In, 1.2s)
- ✅ Automatischer Token-Check (SecureStorage/localStorage)
- ✅ Auto-Login bei gültigem Token → `/app/jobs`
- ✅ Redirect zu Login bei ungültigem Token → `/app/login`
- ✅ PIX.IMMO Logo (96px) zentriert
- ✅ Loading Spinner mit Brand-Farbe
- ✅ Light & Dark Mode

**Zugriff:**
```
/app
```

### 2. Login-Seite (`/app/login`)

**Features:**
- ✅ Responsive für iPhone 15 Pro
- ✅ Safe Area Support
- ✅ Light & Dark Mode
- ✅ E-Mail + Passwort Login
- ✅ „Angemeldet bleiben" Toggle (30 Tage Token)
- ✅ Session Token wird in localStorage gespeichert
- ✅ „Passwort vergessen?" Link → OTP-Login
- ✅ Primary Button mit Loading State
- ✅ Secondary Button „Demo starten" (2h Demo-Token)
- ✅ Link zur Registrierung
- ✅ Version Info im Footer

**Zugriff:**
```
/app/login
```

### 3. Jobs-Liste (`/app/jobs`)

**Features:**
- ✅ Job-Übersicht mit Status-Badges
- ✅ Search-Funktion (Titel, Adresse)
- ✅ Filter-Button
- ✅ Job-Cards mit Details (Datum, Zeit, Fotos, Räume)
- ✅ Status: Geplant / In Bearbeitung / Abgeschlossen
- ✅ Action-Buttons je nach Status
- ✅ Bottom Navigation (Jobs, Kamera, Settings)
- ✅ FAB „Neuer Job" (rechts unten)
- ✅ Logout-Button im Header

**Zugriff:**
```
/app/jobs
```

### 4. Einstellungen (`/app/settings`)

**Features:**
- ✅ Profil-Anzeige mit E-Mail
- ✅ Push-Benachrichtigungen Toggle
- ✅ Dark Mode Toggle
- ✅ Passwort ändern
- ✅ Hilfe & FAQ
- ✅ Links zu Impressum & Datenschutz
- ✅ Logout mit Bestätigungs-Dialog
- ✅ Token wird bei Logout gelöscht
- ✅ Version Info
- ✅ Bottom Navigation

**Zugriff:**
```
/app/settings
```

## 🎯 Accessibility (A11y)

### Touch Targets
- Minimum: 44 pt × 44 pt (Apple HIG)
- Alle interaktiven Elemente erfüllen diese Vorgabe
- Icons haben erweiterte Tap-Areas

### Farb-Kontraste
- Text Primary: WCAG AAA (7:1+)
- Text Secondary: WCAG AA (4.5:1+)
- Brand-Farbe auf Weiß: WCAG AA konform

### Screen Reader Support
- Alle Inputs haben Labels
- Aria-Labels für Icon-Buttons
- Semantisches HTML

## 🔄 States & Interaktionen

### Button States

**Primary Button:**
```
Normal: bg-[#3B82F6], text-white
Hover: bg-[#3B82F6]/90
Pressed: bg-[#3B82F6] + 10% darker
Disabled: opacity-55
Loading: Spinner zentriert, Text ausgeblendet
```

**Secondary Button:**
```
Normal: border-[#3B82F6] @ 25%, text-[#3B82F6]
Hover: bg-[#3B82F6]/5
Pressed: bg-[#3B82F6]/10
```

### Input States
```
Normal: border @ 20% opacity
Focus: border @ 100% opacity, Brand-Farbe
Error: border-red-500
Success: border-green-500
```

## 🔐 Session Handling

### Token-Speicherung
```typescript
// Login erfolgreich - Token speichern
localStorage.setItem('pix_session_token', token);
localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
localStorage.setItem('pix_user_email', email);

// Token-Gültigkeit prüfen
const token = localStorage.getItem('pix_session_token');
const expiry = new Date(localStorage.getItem('pix_token_expiry'));
const isValid = expiry > new Date();

// Logout - Token löschen
localStorage.removeItem('pix_session_token');
localStorage.removeItem('pix_token_expiry');
localStorage.removeItem('pix_user_email');
```

### Token-Laufzeit
- **Normal Login**: 24 Stunden
- **„Angemeldet bleiben"**: 30 Tage
- **Demo-Modus**: 2 Stunden

### App-Flow
```
1. App Start → Splash Screen (/app)
2. Token-Check (1.2s)
3a. Token gültig → Jobs-Liste (/app/jobs)
3b. Token ungültig → Login (/app/login)
4. Nach Login → Token speichern → Jobs-Liste
5. Nach Logout → Token löschen → Login
```

## 🚀 Nächste Schritte

### Weitere App-Seiten:
1. **App Kamera** (`/app/camera`)
   - Native Camera Integration
   - Foto-Upload mit Preview
   - Metadaten-Erfassung (GPS, Raum-Info)

2. **App Job-Detail** (`/app/job/:id`)
   - Job-Informationen Detail-Ansicht
   - Foto-Galerie für Job
   - Upload-Status & Progress

3. **App Registrierung** (`/app/register`)
   - Multi-Step Formular
   - E-Mail Verifizierung
   - Willkommens-Screen

4. **App Profil-Bearbeiten** (`/app/profile`)
   - Profil-Daten ändern
   - Avatar hochladen
   - Benachrichtigungs-Einstellungen

## 📚 Referenzen

- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **iOS Safe Areas**: https://developer.apple.com/design/human-interface-guidelines/layout
- **Inter Font**: https://rsms.me/inter/

## 🎨 Design-Assets

### Logo
- Format: SVG
- Größe: 64 × 64 pt
- Corner-Radius: 12 pt
- Farben: Schwarz (#1A1A1C) / Weiß je nach Theme

### Icons
- Library: Lucide React
- Size: 20 pt (Standard), 24 pt (Navigation)
- Stroke-Width: 2 px
- Color: Secondary Text oder Brand

## 🔧 Technische Details

### Dependencies
```json
{
  "react": "^18.3.1",
  "wouter": "^3.3.5",
  "lucide-react": "^0.468.0",
  "@radix-ui/react-switch": "^1.1.2"
}
```

### Routing
```typescript
// App.tsx
<Route path="/app" component={AppSplash} />
<Route path="/app/login" component={AppLogin} />
<Route path="/app/jobs" component={AppJobs} />
<Route path="/app/settings" component={AppSettings} />
```

### Dark Mode Detection
```typescript
// Automatisch via Tailwind dark: Klassen
// Folgt System-Einstellung (prefers-color-scheme)
```

## ✅ Testing Checklist

- [ ] iPhone 15 Pro (393 × 852 pt)
- [ ] iPhone 15 Pro Max (430 × 932 pt)
- [ ] iPhone SE (375 × 667 pt)
- [ ] iPad (verschiedene Größen)
- [ ] Light Mode
- [ ] Dark Mode
- [ ] Landscape Orientation
- [ ] VoiceOver (Screen Reader)
- [ ] Dynamic Type (Text-Größe Anpassung)
- [ ] Reachability (One-Hand Use)

---

**Status**: ✅ Splash, Login, Jobs-Liste & Settings implementiert  
**Version**: 1.0.0  
**Nächster Step**: Kamera-Integration & Job-Details
