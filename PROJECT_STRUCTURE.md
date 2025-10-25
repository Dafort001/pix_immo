# pix.immo - Projektstruktur & Deployment-Strategie

## Übersicht

pix.immo besteht aus **zwei logisch getrennten Anwendungen** im Mono-Repository:

```
pix.immo/
├── 📱 Mobile PWA (iOS App)          → /app/*, /capture/*
└── 🌐 Web Portal (Cloudflare)       → /portal/*, Root-Routes
```

---

## 1️⃣ Mobile PWA (iOS App)

### Zweck
Progressive Web App für Fotografen vor Ort mit nativer Kamera-Integration.

### Routes
```
/app/                          → Splash Screen
/app/camera                    → Kamera-Interface
/app/gallery                   → Foto-Review
/app/upload                    → Upload-Workflow

/capture/*                     → DEPRECATED (Legacy Routes)
```

### Komponenten
```
client/src/
├── pages/app/                 → Mobile App Screens
│   ├── splash.tsx
│   ├── camera.tsx
│   ├── gallery.tsx
│   └── upload.tsx
├── components/mobile/         → Mobile-spezifische UI
│   ├── StatusBar.tsx          → iOS StatusBar
│   ├── HapticButton.tsx       → Touch Feedback
│   ├── BottomNav.tsx          → Tab Navigation
│   └── Histogram.tsx          → Foto-Analyse
└── hooks/
    ├── useCamera.ts           → MediaDevices API Wrapper
    └── useHaptic.ts           → Vibration API
```

### Features
- ✅ MediaDevices API (Kamera-Zugriff)
- ✅ iOS Design Patterns (Safe-Area, Notch)
- ✅ SessionStorage Photo Management
- ✅ Offline-Support (Service Worker)
- ✅ Install-to-Homescreen (PWA)

### Deployment
**Strategie:** PWA wird mit Web Portal gebündelt, aber auf `/app/*` isoliert.

**Besonderheiten:**
- Separates `manifest.json` für Mobile
- Service Worker nur für `/app/*` Routes
- Kann später als native iOS App gebaut werden (React Native Export)

### Dokumentation
- 📄 `MOBILE_PWA.md` → Architektur & Features
- 📄 `MOBILE_CAMERA_INTEGRATION.md` → Kamera-API Details
- 📄 `docs/mobile/` → Mobile-spezifische Docs

---

## 2️⃣ Web Portal (Cloudflare Workers)

### Zweck
Professionelles Client/Admin Portal für Order Management und Gallery Upload.

### Routes
```
/                              → Homepage
/dashboard                     → User Dashboard
/portal/uploads                → Upload Overview
/portal/gallery-upload         → Customer Upload
/portal/gallery-photographer   → RAW Upload
/portal/gallery-editing        → Final Editing
/portal/payment                → Stripe Checkout
/portal/status                 → Timeline Tracker
/portal/delivery               → Download Packages
```

### Komponenten
```
client/src/
├── pages/portal/              → Portal Screens
│   ├── uploads-overview.tsx
│   ├── gallery-upload.tsx
│   ├── gallery-photographer.tsx
│   ├── gallery-editing.tsx
│   ├── payment.tsx
│   ├── status-timeline.tsx
│   └── delivery.tsx
├── components/gallery/        → Gallery-System
│   ├── GalleryGrid.tsx
│   ├── UploadDialog.tsx
│   ├── DetailSidebar.tsx
│   └── MaskEditor.tsx
└── components/
    ├── WebHeader.tsx          → Desktop Navigation
    └── AddressAutocomplete.tsx → Google Maps
```

### Features
- ✅ Session-based Authentication
- ✅ Role-based Access (Admin/Client)
- ✅ Gallery Upload System V1.0
- ✅ Stripe Integration
- ✅ Google Maps Integration
- ✅ PostgreSQL (Neon)
- ✅ R2 Object Storage

### Deployment
**Ziel:** Cloudflare Workers

**Build-Prozess:**
```bash
npm run build              # Vite Build
wrangler deploy            # Cloudflare Deployment
```

**Umgebung:**
- Produktion: Cloudflare Workers
- Development: Express + Vite (HMR)

### Dokumentation
- 📄 `CLOUDFLARE_SETUP_GUIDE.md` → Deployment
- 📄 `docs/GALLERY_SYSTEM.md` → Gallery Upload V1.0
- 📄 `docs/GALLERY_API.md` → API Reference

---

## 🏗️ Shared Infrastructure

### Gemeinsam genutzt:

```
shared/
├── schema.ts                  → Drizzle Models (beide Apps)
└── types.ts                   → TypeScript Types

server/
├── routes.ts                  → Hono Routes (beide Apps)
├── storage.ts                 → Database Interface
├── gallery-routes.ts          → Gallery API
└── auth.ts                    → Session Management
```

### Warum Mono-Repo?
- ✅ Code-Sharing (shared/schema.ts)
- ✅ Einheitliche API für beide Apps
- ✅ Gemeinsame Entwicklungsumgebung
- ✅ Single npm install

---

## 📦 Deployment-Szenarien

### Szenario A: Bundled Deployment (Aktuell)
**Eine App, beide Features gebündelt**

```
pix.immo (Cloudflare Workers)
├── /                → Web Portal
├── /portal/*        → Web Portal
└── /app/*           → Mobile PWA (gebündelt)
```

**Vorteile:**
- Einfaches Deployment (ein Befehl)
- Shared Backend/API
- Einheitliche Domain

**Nachteile:**
- Mobile PWA läuft auf Cloudflare (evtl. unnötig)
- Bundle-Size größer

---

### Szenario B: Separate Deployments (Empfohlen für Zukunft)
**Zwei Apps, separate Deployments**

```
portal.pix.immo (Cloudflare Workers)
├── /                → Web Portal
└── /portal/*        → Web Portal

app.pix.immo (Vercel/Netlify)
└── /app/*           → Mobile PWA
```

**Vorteile:**
- Optimierte Deployments (kleinere Bundles)
- Separate Skalierung
- Mobile kann später zu nativer App migriert werden

**Nachteile:**
- Zwei Deployment-Prozesse
- Shared Backend-Integration komplexer

---

## 🎯 Empfohlene nächste Schritte

### 1. Dokumentations-Reorganisation

```bash
docs/
├── mobile/
│   ├── README.md              → Mobile PWA Übersicht
│   ├── ARCHITECTURE.md        → iOS Design Patterns
│   └── CAMERA_API.md          → MediaDevices Integration
├── portal/
│   ├── README.md              → Web Portal Übersicht
│   ├── GALLERY_SYSTEM.md      → Upload System V1.0
│   └── DEPLOYMENT.md          → Cloudflare Setup
└── shared/
    ├── API.md                 → Shared API Reference
    └── DATABASE.md            → Schema Documentation
```

### 2. Build-Prozess Optimierung

**package.json anpassen:**
```json
{
  "scripts": {
    "dev": "tsx server/dev.ts",
    "build": "npm run build:all",
    "build:all": "vite build",
    "build:portal": "vite build --mode portal",
    "build:mobile": "vite build --mode mobile",
    "deploy:portal": "wrangler deploy",
    "deploy:mobile": "npm run build:mobile && ..."
  }
}
```

### 3. Separate README-Dateien

```
README.md                      → Gesamtprojekt
docs/mobile/README.md          → Mobile PWA
docs/portal/README.md          → Web Portal
```

---

## 🔮 Zukunftsplanung

### Option 1: Mobile wird native iOS App
- React Native Export von `/app/*`
- Separates GitHub Repo: `pix-immo-ios`
- App Store Distribution

### Option 2: Micro-Frontends
- `/app/*` als separate SPA
- `/portal/*` als separate SPA
- Shared Hono Backend

---

## 📊 Aktuelle Entscheidung

**Status Quo beibehalten (Bundled Deployment)**  
Aber mit klarer Dokumentations-Trennung:

✅ Mono-Repo behalten  
✅ Dokumentation reorganisieren (docs/mobile/, docs/portal/)  
✅ Build-Prozess dokumentieren  
✅ Deployment-Strategien dokumentieren  
✅ Migration-Path zu Separate Deployments vorbereiten  

**Nächster Schritt:** Dokumentations-Struktur umsetzen

