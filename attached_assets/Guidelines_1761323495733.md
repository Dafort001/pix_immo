# PIX.IMMO – Figma Full Design Brief

> Ziel: Ein modernes, ruhiges und professionelles Design, das technisch versierte wie nicht-technische Nutzer gleichermaßen anspricht.  
> **Design-Freigabe** ist die verbindliche Startfreigabe für die Implementierung auf Replit (MCP → Replit).

---

## ✅ DESIGN-APPROVED (iPhone App v2.3 - PORTRAIT + LOGIN + DEDICATED UPLOAD)
**Status:** FREIGEGEBEN ✓  
**Datum:** 24. Oktober 2025  
**Orientierung:** **Hochformat (Portrait)** 393 × 852 pt  
**Umfang:** 4 iPhone-Screens (Login, Camera, Upload, Gallery)  
**Features:** iOS-Login-Screen, Live-Kamera, Haptic Feedback, Swipe-Navigation, iPhone 15 Pro Frame, Histogramm, Bottom Navigation (4 Tabs), **Apple Photos Design**, **HDR Bracketing**, **Custom Brand Scrollbars**

**Neu in v2.3:**
- 🔐 **Login-Screen** statt Feature-Onboarding - Email/Passwort + Demo-Modus, iOS-Style
- 📤 **Upload als separater Screen** - Eigener Tab in Bottom Navigation für direkten Zugriff
- 🎯 **4-Tab Navigation** - Start, Kamera, Upload, Galerie (Upload-Tab zurück)
- 🎨 **Custom Scrollbars** - Brand-Farben (#4A5849), 6px dünn, iOS-Style in allen Scrollable Areas
- 📷 **57 Raumtypen** - Vollständige professionelle Immobilien-Kategorisierung
- 🖼️ **Upload Photo Selection** - 2-Spalten Grid, individuelle Auswahl, Live-Updates, Smart Pre-Selection
- 🎯 **Visual Selection Feedback** - Border, Overlay, Checkmark-Badges, Dynamic Button States
- 📱 **Smart Badge Positioning** - HDR oben links, Warning smart positioning (keine Überlappung)

**Redesign:** Galerie im **Apple Fotos Stil** - 3-Spalten Grid, FAB Upload Button, Selection Mode, Multi-Select  
**HDR:** Badge in Galerie (🟦 3×/5×) und Kamera (Toggle-Badge)

**Nächster Schritt:** Export zu Replit für Production-Build  

## ✅ DESIGN-APPROVED (Web Portal v1.0)
**Status:** FREIGEGEBEN ✓  
**Datum:** 23. Oktober 2025  
**Umfang:** Alle 6 Web-Portal Screens implementiert  
**Features:** Responsive Design, Live-Preis-Kalkulation, Stripe-Integration (Mock), Status-Timeline

**Implementierte Screens:**
1. ✅ **Uploads-Übersicht** – Dashboard mit Status-Filtern, Projekt-Karten, Thumbnails
2. ✅ **Galerie/Auswahl** – Raster-Grid, Stil-Auswahl, Live-Preis-Panel (Sticky Sidebar)
3. ✅ **Zahlung** – Stripe Checkout + Rechnungs-Option, Order Summary, Trust Badges
4. ✅ **Status-Timeline** – Visuelle Timeline mit Icons (Upload → Editing → Delivery)
5. ✅ **Lieferung** – Download-Bereich mit Auswahl, Alt-Text-Export, Rechnung, Rating
6.  **Revision** – Foto-Auswahl, Revision-Optionen (6 Kategorien), Kommentare, kostenlos innerhalb 7 Tagen

---

## 1. Branding & Stil
- Minimalistisch, hell, mit hohem Weißanteil.  
- Typografie: Inter oder SF Pro, 14–16 pt Text, 22–28 pt Titel.  
- Farben: neutral (Weiß, Hellgrau, Schwarz) mit Akzentfarbe Grün‑Grau (#4A5849).  
- Icons: klar, dünn (strokeWidth 1.5), kompakt (w-4 h-4 standard), Material‑ähnlich.  

---

## 2. iPhone‑App Screens ✅ IMPLEMENTIERT

### A. Login ✅
- iOS-Style Login-Screen mit Email/Passwort-Feldern.
- Option für Demo-Modus.
- Animation (Fade‑in, 1.5 s).  
- Hero‑Logo + Schriftzug *PIX.IMMO Capture*.  
- Professional Design mit Trust Badges.

### B. Kamera ✅
- Live‑Vorschau mit Gitter, Horizont‑Linie, Zoom‑Overlay (0.5×–2×).  
- Unten: großer Auslöser, Galerie‑Button, Timer (0 / 3 / 10 s).  
- Rechts: Format‑Badge (DNG / HEIC).  
- **Histogramm**: Toggle-Button (unten rechts), Live-Anzeige oben links mit Luminanz-Verteilung (Shadows/Midtones/Highlights)
- **HDR Bracketing**: Toggle-Badge (unten rechts), Optionen 3×/5× HDR-Belichtungsreihen

### C. Upload ✅
- **Separater Upload Screen** - eigener Tab in Bottom Navigation.
- **Photo Selection Grid**:
  - 2-Spalten Grid mit Thumbnails (aspect-square, rounded-lg).
  - Individuelles An/Abwählen per Click auf jedes Foto.
  - Visual Feedback: Border (#4A5849 bei selected), Overlay (10% opacity).
  - Checkmark Badges: ✓ bei selected, ○ bei unselected.
  - Room Type Labels: Badge unten auf jedem Thumbnail.
  - HDR Badges: 🟦 3×/5× Badge oben links.
  - Warning Indicators: ⚠️ gelber Dot bei Status-Warnings.
- **Select All/None Toggle**: Button oben ("Alle auswählen" / "Keine auswählen").
- **Live Updates**:
  - Header: "X von Y Fotos ausgewählt" (dynamisch).
  - File Count: "Ausgewählte Dateien: X".
  - File Size: Dynamische Berechnung (X × 8.5 MB).
  - Upload Button: "X Foto(s) hochladen" (disabled bei 0 selected).
- **Smart Pre-Selection**:
  - Bei Galerie Selection Mode: Nur ausgewählte Fotos.
  - Bei normalem Modus: Alle Fotos pre-selected.
- **WiFi Toggle**: Umschalter „Nur WLAN / Mobil erlaubt".
- **Security Info**: Banner mit Verschlüsselungs-Hinweis (blau, ℹ️ Icon).
- **Custom Scrollbars**: Brand-Farben (#4A5849), 8px breit, 2px Border, help-scrollbar Klasse.
- **Sticky Action Buttons**: Upload starten / Abbrechen (fixed bottom).
- **Motion Animations**: Smooth scale (0.9 → 1) beim Öffnen der Photos.
- **Haptic Feedback**: Light bei Toggle, Success bei Upload-Start.

### D. Galerie ✅
- **Apple Photos Style**: 3-Spalten Grid ohne Gaps, Floating Action Button (FAB).
- Rasterdarstellung, Thumbnails mit Status‑Badges (✅ ⚠️).  
- **Multi-Select**: Selection Mode mit Checkboxes, Toolbar mit Aktionen.
- **Raumtyp-Zuordnung**: 57 professionelle Immobilien-Kategorien (Bottom Sheet).
- **Upload-Integration**: Upload auch als Bottom Sheet verfügbar (Alternative zum Upload-Tab).
- **Custom Scrollbars**: Brand-Farben (#4A5849), 6px dünn, Hover-Effekt (#3A4839).
- Filterleiste: Unzugeordnet, Ausgewählt.  
- **HDR Bracketing**: Badge (🟦 3×/5×) für HDR-Belichtungsreihen.

### E. Navigation ✅
- **Bottom Navigation**: 4 Tabs (Start, Kamera, Upload, Galerie) - Upload-Tab zurück.
- Badge auf Galerie-Tab (Photo Count).
- Swipe-Gesten zwischen Screens.
- Haptic Feedback bei allen Interaktionen.

---

## 3. Web‑Portal Screens ✅ IMPLEMENTIERT

1. **Uploads‑Übersicht** ✅ – Dashboard mit Status-Filtern, Projekt-Karten, Thumbnails
2. **Galerie / Auswahl** ✅ – Raster-Grid, Stil-Auswahl, Live-Preis-Panel (Sticky Sidebar)
3. **Zahlung** ✅ – Stripe-Checkout + Rechnungs-Option, Order Summary, Trust Badges
4. **Status‑Timeline** ✅ – Visuelle Timeline mit Icons (Upload → Editing → Delivery)
5. **Lieferung** ✅ – Download-Bereich mit Auswahl, Alt-Text-Export, Rechnung, Rating
6. **Revision** ✅ – Foto-Auswahl, Revision-Optionen (6 Kategorien), Kommentare, kostenlos innerhalb 7 Tagen

---

## 4. Komponenten
Buttons, Chips, Status‑Badges, Progressbars, Form‑Dropdowns, Snackbars, Modals.  
Responsives Verhalten (Mobil / Tablet / Desktop).  

---

## 5. Export‑Regeln (MCP → Replit)
- Exportiert werden:  
  - Screens (Page „iOS Capture", „Portal Web")  
  - Komponenten‑Bibliothek (JSON / SVG)  
  - Typografie‑ und Farb‑Tokens  
- Nach Freigabe wird ein **Design‑Approved‑Flag** gesetzt.  
  Erst dann darf Replit mit dem Build beginnen.

---

## 6. Technische Implementierung ✅

### Fertiggestellt:
- ✅ React 18.3 + TypeScript 5.6
- ✅ Tailwind CSS 4.0 mit Design-Tokens
- ✅ Motion (Framer Motion) für Animationen
- ✅ shadcn/ui Komponenten-Library
- ✅ MediaDevices API (Live-Kamera)
- ✅ Vibration API (Haptic Feedback)
- ✅ Swipe-Gesten (Motion Drag)
- ✅ iPhone 15 Pro Frame mit Dynamic Island
- ✅ Responsive Design (Desktop + Mobile)
- ✅ Web-Portal (alle 6 Screens)
- ✅ Mode-Switcher (iPhone ↔ Web)
- ✅ iOS-Style Login-Screen (Email/Passwort + Demo)
- ✅ Apple Photos Galerie-Design (3-Spalten Grid, FAB, Multi-Select)
- ✅ Upload als separater Screen (4. Tab in Bottom Navigation)
- ✅ Upload Photo Selection Grid (2-Spalten, individuelle Auswahl, Live-Updates)
- ✅ Smart Pre-Selection (basierend auf Galerie Selection Mode)
- ✅ Visual Selection Feedback (Borders, Overlays, Checkmarks, Dynamic States)
- ✅ Smart Badge Positioning (HDR oben links, Warning keine Überlappung)
- ✅ 4-Tab Bottom Navigation (Start, Kamera, Upload, Galerie)
- ✅ Custom Brand Scrollbars (#4A5849, 8px breit, 2px Border, help-scrollbar)
- ✅ 57 professionelle Raumtypen (Immobilien-Kategorisierung)
- ✅ HDR Bracketing (3×/5× Belichtungsreihen)
- ✅ Live Histogramm (Shadows/Midtones/Highlights)

### Bereit für:
- 🚀 Replit Deployment (HTTPS für Live-Kamera)
- 🚀 GitHub Repository Upload
- 🚀 Production Build
- 🚀 Beide Plattformen (iPhone + Web) vollständig

### Nächste Phase:
- ⏳ Backend Integration (Upload, Stripe API)
- ⏳ Authentifizierung (User Accounts)
- ⏳ PWA Features (Offline, Push)