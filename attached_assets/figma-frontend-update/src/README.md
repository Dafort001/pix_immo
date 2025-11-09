# PIX.IMMO - Professionelle Immobilienfotografie

Eine moderne React-Webanwendung für professionelle Immobilienfotografie in Hamburg.

## 🎨 Design System

- **Primäre Farben**: `#FFFFFF`, `#8E9094`, `#1A1A1C`
- **Akzentfarben**: `#64BF49`, `#74A4EA`, `#C94B38`, `#C9B55A`, `#D87088`, `#C8B048`
- **Typografie**: Inter
- **Routing**: Wouter
- **UI Components**: Radix UI + Tailwind CSS v4.0

## 📱 Projektstruktur

```
├── App.tsx                 # Main App mit Routing
├── pages/                  # 47 vollständige Seiten
│   ├── home.tsx           # Startseite mit Filmstrip
│   ├── dashboard.tsx      # Kunden-Dashboard
│   ├── admin-dashboard.tsx # Admin-Dashboard
│   ├── galerie.tsx        # Hauptgalerie
│   ├── booking.tsx        # Buchungsformular
│   └── ...                # Weitere Seiten
├── components/            # Wiederverwendbare Komponenten
│   ├── Footer.tsx         # Globaler Footer
│   ├── ui/               # UI-Komponenten (Radix UI)
│   └── ...
├── data/                  # Datenquellen
└── styles/
    └── globals.css        # Tailwind v4.0 + CSS Variablen
```

## 🚀 Features

### Öffentliche Seiten
- ✅ Home mit animiertem Filmstrip
- ✅ Portfolio/Gallery (Masonry Grid)
- ✅ Preise & Pakete
- ✅ Blog mit Grid-Layout
- ✅ Kontaktformular
- ✅ FAQ
- ✅ Impressum, Datenschutz, AGB

### Kunden-Portal
- ✅ Dashboard mit Job-Übersicht
- ✅ Booking/Auftragsformular
- ✅ Galerie mit Download-Funktion
- ✅ Upload-Status Tracking
- ✅ Mini-Gallery für Reviews
- ✅ Einstellungen & Rechnungen

### Admin-Bereich
- ✅ Admin Dashboard mit KPIs
- ✅ QC Dashboard (Quality Control)
- ✅ Editor Revision Workflow
- ✅ Delivery Prep
- ✅ Upload Management (Eingegangene Uploads)
- ✅ AI Lab & Gallery Classification
- ✅ Editorial & SEO Management
- ✅ Dev Notes & Dokumentation

### Workflow & Tools
- ✅ iPhone App "PIX Capture" Interface
- ✅ Demo Jobs & Demo Upload
- ✅ Rooms Specification Docs
- ✅ QC & Upload Workflow Diagramme

### Authentifizierung
- ✅ Login (E-Mail/Passwort)
- ✅ OTP Login (Magic Link)
- ✅ Registrierung mit Verifizierung

### iPhone App (iOS Design)
- ✅ Splash Screen mit Session-Handling & Auto-Login
- ✅ App Login-Seite (iPhone 15 Pro optimiert)
- ✅ Jobs-Liste mit Search & Filter
- ✅ App-Einstellungen mit Profil & Logout
- ✅ iOS Design System implementiert
- ✅ Safe Area Support & Light/Dark Mode
- ✅ Token-basierte Authentifizierung
- ⏳ Kamera-Integration (geplant)
- ⏳ Job-Details (geplant)

## 🔗 Routing

Alle 47 Seiten sind über Wouter-Routing erreichbar:

**Hauptnavigation:**
- `/` - Home
- `/portfolio` oder `/gallery` - Portfolio
- `/preise` - Preise
- `/blog` - Blog
- `/contact` oder `/kontakt` - Kontakt
- `/faq` - FAQ

**Kunden-Portal:**
- `/dashboard` - Dashboard
- `/jobs` - Jobs Übersicht
- `/booking` - Neue Buchung
- `/galerie` - Galerie
- `/upload-status` - Upload Status
- `/mini-gallery` - Mini Gallery
- `/settings` - Einstellungen
- `/invoices` - Rechnungen

**Admin:**
- `/admin-dashboard` - Admin Dashboard
- `/qc-dashboard` - QC Dashboard
- `/editor-revision` - Editor Revision
- `/delivery-prep` - Delivery Prep
- `/eingegangene-uploads` - Upload Management
- `/upload-editing-team` - Upload für Editing Team
- `/ai-lab` - AI Lab
- `/gallery-classify` - Gallery Classification
- `/admin/editorial` - Editorial Management
- `/admin/seo` - SEO Management

**Auth:**
- `/login` - Login
- `/login-otp-request` - OTP anfordern
- `/login-otp-verify` - OTP verifizieren
- `/register` - Registrierung
- `/register-verify` - Registrierung verifizieren

**Legal:**
- `/impressum` - Impressum
- `/datenschutz` - Datenschutz
- `/agb` - AGB

**Weitere Tools:**
- `/pixcapture` - PIX Capture App
- `/demo-jobs` - Demo Jobs
- `/demo-upload` - Demo Upload
- `/downloads` - Downloads
- `/docs/rooms-spec` - Rooms Specification
- `/dev-notes-qc` - Dev Notes QC & Upload

**iPhone App:**
- `/app-overview` - App-Übersicht & Dokumentation
- `/app` - Splash Screen (Auto-Login)
- `/app/login` - iOS-optimierte Login-Seite
- `/app/jobs` - Jobs-Liste mit Search
- `/app/settings` - Einstellungen & Profil

## 📦 Installation

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
npm run preview
```

## 🎯 Bravostudio Integration

Dieses Projekt ist optimiert für Bravostudio:

1. **React + TypeScript** - Vollständig typsicher
2. **Wouter Routing** - Leichtgewichtiges Routing
3. **Tailwind CSS v4.0** - Moderne Styling-Lösung
4. **Radix UI** - Accessible UI Components
5. **Responsive Design** - Mobile-first Ansatz
6. **48 vollständige Seiten** - Production-ready
7. **iPhone App Design** - iOS HIG konform (iPhone 15 Pro)

### Bravostudio Setup

1. Erstelle ein GitHub Repository
2. Pushe diesen Code
3. Verbinde Bravostudio mit dem Repository
4. Konfiguriere die Build-Einstellungen:
   - **Entry Point**: `App.tsx`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## 🎨 Design-Prinzipien

- **Minimalistisch**: Klares, reduziertes Design
- **Konsistent**: Einheitliche Abstände (gap-2 = 8px für Bilder)
- **Typografie**: Alle Überschriften in text-2xl (24px)
- **Marke**: PIX.IMMO immer in VERSALIEN
- **Header**: Logo links, Hamburger-Menü rechts
- **Footer**: Impressum, Datenschutz, AGB - immer am Ende

## 📄 Dokumentation

Siehe auch:
- `COMPLETE_PAGES_OVERVIEW.md` - Vollständige Seitenübersicht
- `NAVIGATION_MAP.md` - Navigations-Struktur
- `GALERIE_STATUS_REPORT.md` - Galerie-Status
- `IPHONE_APP_DESIGN.md` - iPhone App Design System
- `guidelines/Guidelines.md` - Design Guidelines

## 👨‍💻 Entwickler

Erstellt für PIX.IMMO - Professionelle Immobilienfotografie  
Hamburg

---

**Status**: ✅ Production Ready - 51 Seiten implementiert (inkl. iPhone App: Splash, Login, Jobs, Settings)
