# 🚀 Bravostudio Deployment Guide

Diese Anleitung erklärt Schritt für Schritt, wie du das PIX.IMMO Projekt an Bravostudio übergibst.

## Was ist Bravostudio?

Bravostudio ist eine No-Code-Plattform, die React-Webapps in native iOS- und Android-Apps konvertiert, ohne dass du den Code ändern musst.

Website: https://www.bravostudio.app/

## Voraussetzungen

- ✅ GitHub Account
- ✅ Bravostudio Account (kostenlos starten möglich)
- ✅ Dieses vollständige React-Projekt

## Schritt-für-Schritt Anleitung

### 1. GitHub Repository erstellen

```bash
# Initialisiere Git (falls noch nicht geschehen)
git init

# Füge alle Dateien hinzu
git add .

# Erstelle ersten Commit
git commit -m "Initial commit: PIX.IMMO React App - 47 Seiten"

# Erstelle Repository auf GitHub und verbinde es
git remote add origin https://github.com/DEIN-USERNAME/pix-immo.git

# Push zu GitHub
git push -u origin main
```

### 2. Bravostudio Account erstellen

1. Gehe zu https://www.bravostudio.app/
2. Klicke auf "Sign Up" oder "Get Started"
3. Erstelle einen Account (kostenlose Trial verfügbar)
4. Bestätige deine E-Mail-Adresse

### 3. Neues Projekt in Bravostudio erstellen

1. **Login** bei Bravostudio
2. Klicke auf **"New Project"**
3. Wähle **"Import from GitHub"**
4. Verbinde dein GitHub-Konto (wenn noch nicht verbunden)
5. Wähle das **pix-immo** Repository aus

### 4. Projekt-Konfiguration

Nach dem Import konfiguriere folgende Einstellungen:

#### Build Settings:
```
Entry Point: App.tsx
Build Command: npm run build
Install Command: npm install
Output Directory: dist
Node Version: 18.x oder höher
```

#### Framework Settings:
```
Framework: React
Routing: Wouter (Single Page Application)
TypeScript: Enabled
CSS Framework: Tailwind CSS v4.0
```

### 5. Environment Variables (optional)

Falls du später APIs integrierst:
```
VITE_API_URL=https://api.pix.immo
VITE_SUPABASE_URL=deine-supabase-url
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

### 6. App-Konfiguration

#### App Name:
```
PIX.IMMO
```

#### App Icon:
- Verwende ein quadratisches Logo (1024x1024 px)
- Format: PNG mit transparentem Hintergrund
- Farbe: #1A1A1C (PIX.IMMO Schwarz)

#### Splash Screen:
- Hintergrund: #FFFFFF (Weiß)
- Logo: PIX.IMMO in #1A1A1C
- Minimal und clean

### 7. Navigation Setup

Bravostudio erkennt automatisch Wouter-Routing. Stelle sicher:

- ✅ Home Route (`/`) ist definiert
- ✅ Deep Links funktionieren
- ✅ Back-Navigation ist aktiv

### 8. Testing

1. **Web Preview**: Teste zuerst im Browser
   - Klicke auf "Preview" in Bravostudio
   - Teste alle 47 Seiten
   - Prüfe Navigation und Links

2. **Mobile Preview**: Teste auf echten Geräten
   - Scanne QR-Code mit der Bravostudio App
   - Teste auf iOS und Android
   - Prüfe Responsive Design

### 9. Build & Publish

#### iOS (Apple App Store):
1. **Apple Developer Account** erforderlich ($99/Jahr)
2. App Store Connect Zugangsdaten in Bravostudio eingeben
3. App-Metadaten konfigurieren:
   - App Name: PIX.IMMO
   - Kategorie: Business / Photography
   - Keywords: Immobilienfotografie, Real Estate, Hamburg
4. Screenshots erstellen (verschiedene Gerätegrößen)
5. Submit for Review

#### Android (Google Play Store):
1. **Google Play Developer Account** erforderlich ($25 einmalig)
2. Play Console Zugangsdaten in Bravostudio eingeben
3. App-Metadaten konfigurieren
4. Screenshots erstellen
5. Submit for Review

## Wichtige Hinweise

### ⚠️ Limitierungen beachten:

1. **Keine nativen Features out-of-the-box:**
   - Kamera-Zugriff benötigt zusätzliche Konfiguration
   - Push-Notifications benötigen Setup
   - Geolocation muss aktiviert werden

2. **Performance:**
   - Bilder sollten optimiert sein (WebP empfohlen)
   - Lazy Loading ist implementiert
   - Code-Splitting für bessere Performance

3. **Responsive Design:**
   - Alle Seiten sind bereits responsive
   - Mobile-first Ansatz umgesetzt
   - Breakpoints: sm (640px), md (768px), lg (1024px)

### ✅ Bereits implementiert:

- Alle 47 Seiten vollständig responsiv
- Wouter Routing funktioniert einwandfrei
- Tailwind CSS v4.0 optimiert
- Footer auf allen Seiten
- Konsistentes Header-Layout
- Einheitliches Design-System

## Troubleshooting

### Problem: Build schlägt fehl
**Lösung**: 
```bash
# Lokale Tests
npm install
npm run build
npm run preview
```

### Problem: Routing funktioniert nicht
**Lösung**: Stelle sicher, dass Bravostudio auf "SPA Mode" eingestellt ist

### Problem: Bilder werden nicht geladen
**Lösung**: Überprüfe, ob alle Bild-Pfade relativ sind und keine absoluten URLs verwenden

### Problem: CSS wird nicht korrekt angezeigt
**Lösung**: Stelle sicher, dass Tailwind CSS v4.0 richtig konfiguriert ist in `styles/globals.css`

## Support & Dokumentation

- **Bravostudio Docs**: https://docs.bravostudio.app/
- **Bravostudio Community**: https://community.bravostudio.app/
- **GitHub Issues**: Erstelle Issues in deinem Repository

## Kosten-Übersicht

### Bravostudio Pläne:
- **Starter**: Kostenlos (limitierte Features)
- **Pro**: ~$19/Monat (empfohlen für Production)
- **Business**: ~$49/Monat (Team-Features)

### App Store Gebühren:
- **Apple**: $99/Jahr
- **Google**: $25 einmalig

### Optional:
- **Backend (Supabase)**: Kostenlos bis 500MB, dann ab $25/Monat
- **Domain**: ~$10-15/Jahr für pix.immo

## pixcapture.app Specific Settings

### Dual Domain Setup:
```
Primary Domain: pix.immo (Professional Workflow)
Secondary Domain: pixcapture.app (Self-Service Platform)
```

### Routes Overview:
```
PIX.IMMO Routes:
- / (Home)
- /portfolio
- /booking
- /dashboard (Customer Portal)
- /admin-* (Admin Pages)
- /editor-* (Editor Workflow)
- /qc-* (Quality Check)

pixcapture.app Routes:
- /pixcapture-home (Landing)
- /app-upload (Self-Service Upload)
- /app-login
- /pixcapture-help (Guide)
- /pixcapture-expert-call (Coming Soon)
- /pixcapture-about
```

### Feature Flags:
```typescript
// In environment variables
VITE_ENABLE_EXPERT_CALLS=false  // Coming Soon
VITE_ENABLE_ANDROID_UPLOAD=false // Coming Soon
VITE_ENABLE_PRO_FEATURES=true
```

### Deep Links Setup:
```
iOS Universal Links:
- https://pix.immo/* → Main App
- https://pixcapture.app/* → Self-Service Flow

Android App Links:
- pixcapture://upload → Direct Upload
- pixcapture://help → Help Section
```

## Nächste Schritte

### Phase 1: Initial Launch (pixcapture.app)
1. ✅ GitHub Repository erstellt
2. ✅ Bravostudio Account angelegt
3. ⏳ Projekt importiert
4. ⏳ Build-Settings konfiguriert
5. ⏳ pixcapture.app Routes getestet
6. ⏳ iPhone Upload Flow getestet
7. ⏳ Icons & Assets hochgeladen
8. ⏳ TestFlight Beta (iOS)

### Phase 2: Feature Rollout
9. ⏳ Android Upload Support aktivieren
10. ⏳ Expert Call System integrieren
11. ⏳ Push Notifications setup
12. ⏳ Backend Integration (Cloudflare)

### Phase 3: Production
13. ⏳ App Store Review (iOS)
14. ⏳ Play Store Review (Android)
15. ⏳ Domain DNS Setup
16. ⏳ Live Launch 🚀

## Alternativen zu Bravostudio

Falls Bravostudio nicht passt:

1. **Expo** (React Native): https://expo.dev/
2. **Capacitor** (Ionic): https://capacitorjs.com/
3. **PWA** (Progressive Web App): Günstigste Option, keine App Stores

## Kontakt & Support

Bei Fragen zum Code:
- Siehe `README.md`
- Siehe `COMPLETE_PAGES_OVERVIEW.md`
- Siehe `NAVIGATION_MAP.md`

---

**Viel Erfolg mit deinem PIX.IMMO App Launch! 🚀**
