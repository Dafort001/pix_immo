# pix.immo Capture - Professional Real Estate Photography Platform

> Professionelle Immobilienfotografie-Plattform mit iPhone Camera App (Landscape-optimiert) und Web-Portal für Auftragsabwicklung.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20(Landscape)%20%2B%20Web-lightgrey.svg)
![React](https://img.shields.io/badge/react-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6-3178c6.svg)

---

## 🎯 Projekt-Übersicht

**pix.immo Capture** ist eine vollständige Plattform für professionelle Immobilienfotografie bestehend aus:

1. **📱 iPhone Camera App** - Spezialisierte Kamera-App für iPhone Pro Modelle im **Querformat (Landscape)** mit RAW-Aufnahmen
2. **💻 Web-Portal** - Komplettes Auftragsmanagement mit Upload, Zahlung, Status-Tracking und Download

### Features

#### iPhone App (4 Screens) - PORTRAIT OPTIMIERT
- ✅ **Hochformat-First** (393 × 852 pt) - Ideal für Foto-Galerie Navigation
- ✅ **Live-Kamera** mit MediaDevices API (DNG + HEIC)
- ✅ **Profi-Tools**: Gitter, Horizont-Linie, 4-fach Zoom (0.5×–2×), Histogramm
- ✅ **HDR Bracketing**: 3×/5× Belichtungsreihen mit Badge-Anzeige (Layers-Icon)
- ✅ **Apple Photos Design**: 3-Spalten Grid, Floating Action Button, Selection Mode
- ✅ **Smart Gallery**: 22 Raumtypen, Bottom Sheet, Bulk-Assignment
- ✅ **Auto-Upload**: WiFi/Mobile-Data, Progress-Tracking
- ✅ **Haptic Feedback**: Native iOS Vibration API
- ✅ **Swipe-Navigation**: Flüssige Screen-Transitions
- ✅ **Bottom Navigation**: iOS-native Tab Bar (4 Tabs mit Badges)
- ✅ **iPhone-Frame**: Authentisches iPhone 15 Pro Design mit Dynamic Island

#### Web-Portal (6 Screens)
- ✅ **Uploads-Übersicht**: Dashboard mit Status-Karten (Neu, In Bearbeitung, Fertig)
- ✅ **Galerie/Auswahl**: Foto-Grid mit Live-Preis-Kalkulation (3,50€/Foto)
- ✅ **Zahlung**: Stripe Integration + Rechnungs-Option
- ✅ **Status-Timeline**: Visueller Fortschritt (Upload → Editing → Delivery)
- ✅ **Lieferung**: Download-Bereich mit Alt-Text-Export & Rating
- ✅ **Revision**: Nachbearbeitungs-Anfragen mit 6 Kategorien (kostenlos innerhalb 7 Tagen)

---

## 🚀 Quick Start

### Option 1: Replit Import (Empfohlen - 2 Minuten)

**📖 Siehe:** `/SCHNELL_EXPORT.md` für Step-by-Step Anleitung

**Kurz:**
1. Erstelle GitHub Repo: https://github.com/new
2. Upload alle Dateien (Drag & Drop)
3. Replit → "Import from GitHub"
4. Fertig! ✅

### Option 2: Lokale Entwicklung

#### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Modern Browser mit ES2020+ Support

#### Installation

```bash
# Repository klonen
git clone https://github.com/YOUR_USERNAME/pix-immo-capture.git
cd pix-immo-capture

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App läuft auf `http://localhost:5173` (oder dem von Vite zugewiesenen Port).

#### Für Live-Kamera-Test
```bash
# HTTPS für MediaDevices API erforderlich
npm run dev -- --host --https
```

Oder deploye auf **Replit/Vercel/Netlify** für automatisches HTTPS.

---

## 📱 Screens

### 1. Splash Screen
- Hero-Logo mit pix.immo Branding
- Fade-in Animation (1.5s)
- "Neues Projekt" / "Projekt fortsetzen"

### 2. Camera Screen
- Live-Vorschau (MediaDevices API)
- Gitter-Overlay (3×3)
- Horizont-Linie (animiert)
- Zoom-Controls: 0.5×, 1×, 1.5×, 2×
- Format-Toggle: DNG ↔ HEIC
- Timer: 0s / 3s / 10s
- **Histogramm**: Toggle-fähig, Live-Belichtungsanalyse (Shadows/Midtones/Highlights)

### 3. Gallery Screen
- 2-spaltige Rasterdarstellung
- Status-Badges (✅ OK, ⚠️ Warning)
- Auswahl mit Checkboxes
- Raumtyp-Dropdown (Wohnzimmer, Küche, Bad, etc.)
- Filter: Alle / Unzugeordnet / Ausgewählt

### 4. Upload Screen
- Upload-Zusammenfassung (Anzahl, Größe)
- Gesamtfortschritt + Einzelfortschritt
- WiFi/Mobile-Data Toggle
- Status-Banner (Offline, Low Storage)

---

## 🎨 Design System

### Farben
```css
--pix-green-grey: #4A5849;  /* Primärfarbe (Grün-Grau) */
--background: #FFFFFF;       /* Haupthintergrund */
--text-primary: #000000;     /* Haupttext */
--text-secondary: #6B7280;   /* Sekundärtext */
```

### Typografie
- **Font**: Inter / SF Pro Display
- **Text**: 14–16px (0.875–1rem)
- **Titel**: 22–28px (1.375–1.75rem)
- **Headlines**: 28px+

### Komponenten
- Buttons: Rounded, 16px Padding, Shadow-md
- Cards: Border-radius 12px, Shadow-sm
- Badges: 12px Font, Glassmorphism
- Icons: Lucide React, Stroke-width 1.5

---

## 🏗️ Technologie-Stack

### Frontend
- **Framework**: React 18.3 + TypeScript 5.6
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (framer-motion fork)
- **Icons**: Lucide React
- **UI Components**: shadcn/ui

### APIs
- **Camera**: MediaDevices API (getUserMedia)
- **Haptics**: Vibration API
- **Orientation**: DeviceOrientation API (geplant)

### Build Tools
- **Bundler**: Vite 6.0
- **Package Manager**: npm

---

## 📂 Projekt-Struktur

```
pix-immo-capture/
├── components/
│   ├── screens/              # iPhone App Screens
│   │   ├── SplashScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── GalleryScreen.tsx
│   │   └── UploadScreen.tsx
│   ├── web-screens/          # Web-Portal Screens
│   │   ├── UploadsOverviewScreen.tsx
│   │   ├── GallerySelectionScreen.tsx
│   │   ├── PaymentScreen.tsx
│   │   ├── StatusTimelineScreen.tsx
│   │   ├── DeliveryScreen.tsx
│   │   └── RevisionScreen.tsx
│   ├── ui/                   # shadcn/ui Komponenten
│   ├── figma/                # Figma-Import Komponenten
│   ├── HapticButton.tsx      # Custom Button mit Haptic
│   ├── PhoneFrame.tsx        # iPhone 15 Pro Frame
│   ├── StatusBar.tsx         # iOS Status Bar
│   └── WebPortalApp.tsx      # Web-Portal Router
├── hooks/
│   └── useHaptic.ts          # Vibration API Hook
├── styles/
│   └── globals.css           # Tailwind + Grün-Grau Tokens
├── guidelines/
│   └── Guidelines.md         # Design Brief
├── App.tsx                   # Root Component (Mode-Switcher)
└── main.tsx                  # Entry Point
```

---

## 🔧 Konfiguration

### Umgebungsvariablen (optional)
```env
VITE_API_URL=https://api.pix-immo.com
VITE_UPLOAD_ENDPOINT=/upload
```

### Browser-Support
- ✅ Chrome/Edge 90+
- ✅ Safari 14+ (iOS 14+)
- ✅ Firefox 88+
- ⚠️ MediaDevices API benötigt HTTPS (außer localhost)

---

## 📝 Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Komponenten in PascalCase
- Hooks in camelCase mit `use` Prefix

### Commit Conventions
```
feat: Neue Swipe-Navigation
fix: Kamera-Error-Handling verbessert
docs: README aktualisiert
style: Tailwind-Klassen optimiert
```

### Branching
- `main` - Production-ready
- `develop` - Development branch
- `feature/*` - Feature branches

---

## 🚢 Deployment

### Replit (Empfohlen)
1. Importiere GitHub-Repo in Replit
2. Automatisches HTTPS & Deployment
3. `.replit` Config wird erkannt

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🧪 Testing

```bash
# Unit Tests (wenn implementiert)
npm run test

# Build-Test
npm run build
npm run preview
```

---

## 📱 iPhone-Spezifische Features

### Kamera-Zugriff
```typescript
// Berechtigung automatisch angefordert
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment',  // Rückkamera
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
});
```

### Haptic Feedback
```typescript
// Vibration API
navigator.vibrate([10, 50, 10]); // Kurz-Pause-Kurz
```

### PWA-Support (geplant)
- Offline-Funktionalität
- Home-Screen Installation
- Push-Notifications für Upload-Status

---

## 🗺️ Roadmap

### Version 1.0 (Current) ✅
- [x] Alle 4 iPhone-Screens implementiert
- [x] Alle 6 Web-Portal-Screens implementiert
- [x] Live-Kamera Integration
- [x] Haptic Feedback
- [x] Swipe-Navigation
- [x] iPhone 15 Pro Frame
- [x] Mode-Switcher (iPhone ↔ Web)
- [x] Responsive Design (Desktop + Mobile)

### Version 1.1 (Next)
- [ ] Backend Integration (API)
- [ ] User Authentication
- [ ] Stripe Payment (Live)
- [ ] File Upload zu Cloud Storage
- [ ] Email-Notifications

### Version 2.0 (Future)
- [ ] DeviceOrientation API für echte Horizont-Linie
- [ ] Canvas-basierte Fotobearbeitung
- [ ] IndexedDB für Offline-Storage
- [ ] Service Worker für PWA
- [ ] Team-Collaboration
- [ ] Analytics Dashboard

---

## 🤝 Contributing

Contributions sind willkommen! Bitte erstelle ein Issue oder Pull Request.

### Development Setup
1. Fork das Repository
2. Erstelle einen Feature-Branch: `git checkout -b feature/amazing-feature`
3. Commit deine Änderungen: `git commit -m 'feat: Add amazing feature'`
4. Push zum Branch: `git push origin feature/amazing-feature`
5. Öffne einen Pull Request

---

## 📄 Lizenz

Dieses Projekt ist proprietär und gehört zu **pix.immo**.  
Alle Rechte vorbehalten © 2025 pix.immo

---

## 🆘 Support

- **Dokumentation**: [TRANSFER_TO_REPLIT.md](./TRANSFER_TO_REPLIT.md)
- **Design Guidelines**: [guidelines/Guidelines.md](./guidelines/Guidelines.md)
- **Issues**: GitHub Issues

---

## 👥 Team

- **Design & Entwicklung**: AI-assisted Development mit Figma Make
- **Konzept**: pix.immo Team

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Lucide](https://lucide.dev/) - Icon Library
- [Motion](https://motion.dev/) - Animation Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling Framework

---

**Built with ❤️ for professional real estate photography**