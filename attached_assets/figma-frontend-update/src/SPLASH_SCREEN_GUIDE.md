# 📱 Splash Screen Quick Guide

## Zugriff zum Splash Screen

### Option 1: Vom Admin Dashboard
1. Öffne `/admin-dashboard`
2. Klicke oben rechts auf den Button **"📱 iPhone App"** (blauer Button)
3. Du landest direkt beim Splash Screen (`/app`)
4. Der Splash Screen erscheint für ~1.2 Sekunden
5. Automatische Weiterleitung:
   - ✅ **Token vorhanden** → `/app/jobs` (Jobs-Liste)
   - ❌ **Kein Token** → `/app/login` (Login-Screen)

### Option 2: Direkte URL
- Gehe direkt zu: `/app`
- Der Splash Screen startet sofort

### Option 3: Von der App-Übersicht
1. Gehe zu `/app-overview`
2. Klicke auf **"🚀 Zur App"** (grüner Button im Banner)
3. Oder klicke auf **"🚀 App jetzt starten"** in der Info-Box

## Splash Screen Features

### ✨ Visuelle Elemente
- **PIX.IMMO Logo** - 96px, mit Pulse-Animation
- **Wortmarke** - "PIX.IMMO" in Inter 28pt
- **Status-Text** - Zeigt aktuellen Status:
  - "App wird geladen…"
  - "Session wird geprüft…"
  - "Anmeldung erfolgreich ✓" (bei Token)
  - "Anmeldung erforderlich" (kein Token)
- **Progress Bar** - Animierte Fortschrittsanzeige (0-100%)
- **Spinner** - Rotierender Ladekreis
- **Debug-Banner** - Oben: "📱 Splash Screen · Session-Check läuft…"
- **Version** - Unten: "Version 1.0.0"

### 🔐 Session-Handling

```
/app (Splash Screen)
    ↓
Token-Check (1.2s)
    ↓
    ├─→ Token vorhanden & gültig
    │   └─→ /app/jobs (Auto-Login ✅)
    │
    └─→ Kein Token / ungültig
        └─→ /app/login (Login erforderlich)
```

### 🧪 Demo-Flow testen

#### Szenario 1: Erste App-Nutzung (kein Token)
1. `/app` → Splash Screen
2. Status: "Anmeldung erforderlich"
3. → `/app/login`

#### Szenario 2: Nach Login (Token vorhanden)
1. Login durchführen bei `/app/login`
2. Token wird gespeichert (24h / 30d / 2h Demo)
3. Browser neu laden oder `/app` aufrufen
4. Splash Screen → "Anmeldung erfolgreich ✓"
5. → `/app/jobs` (kein Login nötig!)

#### Szenario 3: Token abgelaufen
1. Warte bis Token abläuft oder lösche manuell:
   ```js
   localStorage.removeItem('pix_session_token')
   localStorage.removeItem('pix_token_expiry')
   ```
2. `/app` → Splash Screen
3. Status: "Anmeldung erforderlich"
4. → `/app/login`

## Token-Status im Browser überprüfen

### Console-Befehle (DevTools):

```javascript
// Token anzeigen
localStorage.getItem('pix_session_token')

// Ablaufdatum anzeigen
localStorage.getItem('pix_token_expiry')

// Token manuell löschen
localStorage.removeItem('pix_session_token')
localStorage.removeItem('pix_token_expiry')

// Demo-Token erstellen (2h gültig)
const token = 'demo_token_' + Date.now();
const expiry = new Date();
expiry.setHours(expiry.getHours() + 2);
localStorage.setItem('pix_session_token', token);
localStorage.setItem('pix_token_expiry', expiry.toISOString());
```

## Häufige Fragen

### ❓ "Ich sehe nur den Login, nicht den Splash Screen"
**Antwort:** Der Splash Screen wird nur für ~1.2 Sekunden angezeigt. Du siehst ihn, aber sehr kurz! 

**Beweise:**
- Achte auf den Debug-Banner oben: "📱 Splash Screen · Session-Check läuft…"
- Achte auf den Status-Text, der sich ändert
- Achte auf die Progress Bar (0 → 100%)

### ❓ "Wie kann ich den Splash Screen länger sehen?"
**Antwort:** Öffne `/pages/app-splash.tsx` und ändere die Timeouts:

```typescript
// Zeile ~15: Von 400ms auf z.B. 2000ms ändern
await new Promise(resolve => setTimeout(resolve, 2000));
```

### ❓ "Auto-Login funktioniert nicht"
**Prüfe:**
1. Token vorhanden? → DevTools Console: `localStorage.getItem('pix_session_token')`
2. Token noch gültig? → Vergleiche `pix_token_expiry` mit aktuellem Datum
3. Browser-Cache gelöscht? → Token ist weg

## Navigation-Map

```
┌─────────────────────────────────────────────────┐
│  Admin Dashboard (/admin-dashboard)             │
│  → Button: "📱 iPhone App" (oben rechts)        │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│  Splash Screen (/app)                           │
│  • Logo Animation (Pulse)                       │
│  • Progress Bar (0-100%)                        │
│  • Status: "Session wird geprüft…"              │
│  • Dauer: ~1.2 Sekunden                         │
└────────────────────┬────────────────────────────┘
                     ↓
        ┌────────────┴──────────────┐
        ↓                           ↓
┌─────────────────┐       ┌──────────────────────┐
│ Login           │       │ Jobs-Liste           │
│ (/app/login)    │       │ (/app/jobs)          │
│                 │       │                      │
│ Kein Token      │       │ Token vorhanden ✓    │
│ gefunden        │       │ Auto-Login!          │
└─────────────────┘       └──────────────────────┘
```

## Design-Spezifikation

| Element | Wert |
|---------|------|
| **Hintergrund Light** | `#FFFFFF` |
| **Hintergrund Dark** | `#0E0E0E` |
| **Logo Größe** | 96 × 96 px |
| **Wortmarke** | Inter 28pt / 600 |
| **Status-Text** | Inter 15pt / 400 / 60% Opacity |
| **Progress Bar Höhe** | 4px (1 pt iOS) |
| **Progress Bar Farbe** | `#3B82F6` |
| **Spinner Größe** | 32 × 32 px |
| **Spinner Farbe** | `#3B82F6` |
| **Animation** | Fade-In 700ms |
| **Dauer** | 1200ms (1.2s) |

## Routing-Übersicht

| Route | Component | Beschreibung |
|-------|-----------|--------------|
| `/app` | `AppSplash` | **Splash Screen** mit Session-Check |
| `/app/login` | `AppLogin` | Login-Formular (E-Mail + Passwort) |
| `/app/jobs` | `AppJobs` | Jobs-Liste (Protected) |
| `/app/settings` | `AppSettings` | Einstellungen (Protected) |
| `/app-overview` | `AppIndex` | Dokumentation & Übersicht |

## Entwickler-Notizen

### Production-Anpassungen

```typescript
// pages/app-splash.tsx

// DEVELOPMENT (aktuell)
const sessionToken = localStorage.getItem('pix_session_token');

// PRODUCTION (iOS Native App)
import * as SecureStore from 'expo-secure-store';
const sessionToken = await SecureStore.getItemAsync('pix_session_token');
```

### Timeout-Konfiguration

```typescript
// Aktuell: 3 Steps à 400ms = 1200ms total
await new Promise(resolve => setTimeout(resolve, 400)); // Schritt 1
await new Promise(resolve => setTimeout(resolve, 400)); // Schritt 2  
await new Promise(resolve => setTimeout(resolve, 400)); // Schritt 3

// Für schnellere Demo:
// → Reduziere auf 200ms (total: 600ms)

// Für langsamere Demo:  
// → Erhöhe auf 800ms (total: 2400ms)
```

---

**Erstellt:** 5. November 2025  
**Version:** 1.0.0  
**Autor:** PIX.IMMO Dev Team
