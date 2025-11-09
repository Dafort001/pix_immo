# pixcapture.app – Projektstruktur & Dokumentation

## 📋 Projektübersicht

**pixcapture.app** ist die Self-Service-Plattform für Immobilienfotografie mit iPhone.
Das Projekt nutzt das **exakt gleiche Design-System** wie pix.immo, hat aber eigene Inhalte und rechtliche Seiten.

---

## 🎯 Projektaufteilung

### pix.immo
- **Domain:** https://pix.immo
- **Zweck:** Professionelle Immobilienfotografie-Dienstleistungen
- **Features:** Portfolio, Preise, Buchung, Blog
- **Zielgruppe:** Makler:innen, die professionelle Fotografie buchen

### pixcapture.app
- **Domain:** https://pixcapture.app
- **Zweck:** Self-Service-Plattform für DIY-Fotografie
- **Features:** Upload, Camera-App, Bildbearbeitung
- **Zielgruppe:** Makler:innen und Eigentümer:innen, die selbst fotografieren

---

## 🏗️ Dateistruktur

### Startseite
```
/pages/pixcapture-home.tsx
```
- Identisches Layout zu pix.immo home.tsx
- Eigene Navigation: Upload, About, Login
- Eigene Bilder in ScrollingImageStrip (Self-Service-Charakter)
- Logo: "pixcapture.app"

### About-Seite
```
/pages/pixcapture-about.tsx
```
- Beschreibung der Self-Service-Plattform
- 3-Schritte-Anleitung:
  1. Mit dem iPhone fotografieren
  2. Bilder hochladen
  3. Professionell bearbeiten lassen
- CTA zu Login und pix.immo

### Rechtliche Seiten
```
/pages/pixcapture-impressum.tsx
/pages/pixcapture-datenschutz.tsx
/pages/pixcapture-agb.tsx
```
- Eigenständige rechtliche Texte für pixcapture.app
- Basieren auf pix.immo-Struktur
- Angepasste Inhalte für Self-Service-Plattform

### Komponenten
```
/components/FooterPixCapture.tsx
```
- Eigener Footer mit Links zu pixcapture.app rechtlichen Seiten
- Cross-Domain-Link zu pix.immo: "Professionelle Fotografie: pix.immo"

### Bilddaten
```
/data/images.ts
```
- Neue Bildgruppe: `pixCaptureImages`
- 8 Bilder mit Self-Service-Charakter:
  - iPhone-Fotografie
  - Person beim Fotografieren
  - Smartphone in Wohnung
  - Mobile Photography
  - Etc.

---

## 🎨 Design-System

### Identisch zu pix.immo

**Farben:**
```css
--color-white: #FFFFFF
--color-black: #1A1A1C
--color-grey: #8E9094
--color-light-grey: #E5E5E5
--color-accent: #C2352D (Rot)
```

**Schriften:**
- Font-Family: Inter, -apple-system, sans-serif
- Keine font-size, font-weight, line-height Tailwind-Klassen
- Verwendung der globals.css Typography

**Layout:**
```
Hero-Bereich:      65vh + 31px White Space
Buttons:           40px Höhe, Desktop only
Image Strip:       Flex-shrink-0
Footer Spacer:     50vh
```

**Abstände:**
- Container: max-w-[1200px]
- Padding: px-4 md:px-8
- Logo Position: top-6 left-8

---

## 📱 Navigation

### Desktop (lg+)
```
pixcapture.app
                              Upload  About  Login

[Scrolling Image Strip]
```

### Mobile
```
pixcapture.app           [☰]

[Hamburger Menu Opens:]
  Upload
  About
  Login
```

---

## 🔗 Cross-Domain-Links

### Footer von pix.immo
```
Impressum | Datenschutz | AGB | Selbst fotografieren: pixcapture.app
```

### Footer von pixcapture.app
```
Impressum | Datenschutz | AGB | Professionelle Fotografie: pix.immo
```

---

## 📄 Seiten-Übersicht

| Seite | Datei | Route | Beschreibung |
|-------|-------|-------|--------------|
| **Startseite** | `pixcapture-home.tsx` | `/pixcapture-home` | Identisch zu pix.immo, aber eigene Buttons & Bilder |
| **About** | `pixcapture-about.tsx` | `/pixcapture-about` | Erklärung der Plattform, 3-Schritte-Anleitung |
| **Impressum** | `pixcapture-impressum.tsx` | `/pixcapture-impressum` | Rechtliche Angaben |
| **Datenschutz** | `pixcapture-datenschutz.tsx` | `/pixcapture-datenschutz` | DSGVO-konforme Datenschutzerklärung |
| **AGB** | `pixcapture-agb.tsx` | `/pixcapture-agb` | Allgemeine Geschäftsbedingungen |

---

## 🖼️ Bilder

### pixCaptureImages (8 Bilder)

| ID | Beschreibung | Zweck |
|----|--------------|-------|
| `pixcap-001` | iPhone Camera Photography | Hands-on iPhone-Fotografie |
| `pixcap-002` | Person Taking Real Estate Photo | Self-Service in Aktion |
| `pixcap-003` | Smartphone Apartment Photo | Wohnung fotografieren |
| `pixcap-004` | Mobile Photography House | Mobile Immobilienfotografie |
| `pixcap-005` | iPhone Real Estate Interior | Innenräume mit iPhone |
| `pixcap-006` | Self-Service Photography | Selbst fotografieren und hochladen |
| `pixcap-007` | Modern Living Room | Wohnzimmer |
| `pixcap-008` | Real Estate Kitchen | Küche |

**Verwendung:**
```typescript
import { pixCaptureImages, formatForScrollingStrip } from "../data/images";
const pixImages = formatForScrollingStrip(pixCaptureImages);
```

---

## 🧩 Komponenten

### FooterPixCapture.tsx

**Design:** Identisch zu Footer.tsx von pix.immo

**Links:**
1. Impressum → `/pixcapture-impressum`
2. Datenschutz → `/pixcapture-datenschutz`
3. AGB → `/pixcapture-agb`
4. Cross-Link → `https://pix.immo` (externe Domain)

**Code:**
```tsx
import { FooterPixCapture } from "../components/FooterPixCapture";

// In Page:
<FooterPixCapture />
```

---

## 📐 Layout-Specs

### Startseite (pixcapture-home.tsx)

```
┌─────────────────────────────────────────┐
│ pixcapture.app              [☰]         │  ← Fixed Top
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         65vh + 31px White Space         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ Upload  About  Login                    │  ← Desktop Navigation (40px)
├─────────────────────────────────────────┤
│ [Scrolling Image Strip]                 │  ← Flex-shrink-0
├─────────────────────────────────────────┤
│                                         │
│         50vh Spacer                     │
│                                         │
├─────────────────────────────────────────┤
│ Impressum | Datenschutz | AGB |         │  ← Footer
│ Professionelle Fotografie: pix.immo     │
└─────────────────────────────────────────┘
```

### About-Seite (pixcapture-about.tsx)

```
┌─────────────────────────────────────────┐
│ pixcapture.app          [← Zurück]      │  ← Sticky Header
├─────────────────────────────────────────┤
│                                         │
│  Immobilienfotos selbst erstellen       │
│                                         │
│  Intro-Text                             │
│                                         │
│  ┌──────┐  1. Mit dem iPhone           │
│  │  📷  │     fotografieren             │
│  └──────┘                               │
│                                         │
│  ┌──────┐  2. Bilder hochladen          │
│  │  ⬆️  │                               │
│  └──────┘                               │
│                                         │
│  ┌──────┐  3. Professionell             │
│  │  ✨  │     bearbeiten lassen         │
│  └──────┘                               │
│                                         │
│  [Zur Anmeldung]  [Professionelle ...]  │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

### Rechtliche Seiten

```
┌─────────────────────────────────────────┐
│ pixcapture.app          [← Zurück]      │  ← Sticky Header
├─────────────────────────────────────────┤
│                                         │
│  Impressum / Datenschutz / AGB          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Card mit Inhalt                   │  │
│  │                                   │  │
│  │ 1. Abschnitt                      │  │
│  │ 2. Abschnitt                      │  │
│  │ ...                               │  │
│  │                                   │  │
│  │ Stand: November 2025              │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

---

## ⚖️ Rechtliche Inhalte

### Impressum
- Verantwortlicher: Daniel Fortmann
- Adresse: Kaiser-Wilhelm-Straße 47, 20355 Hamburg
- E-Mail: mail@pix.immo
- USt-IdNr.: DE117975393
- TDM-Vorbehalt (§ 44b UrhG)
- Haftungsausschluss

### Datenschutz
- Verantwortlicher (Art. 13 DSGVO)
- Erhebung personenbezogener Daten:
  - E-Mail-Adresse
  - Hochgeladene Bilder + Metadaten
  - Technische Daten
  - App-Nutzungsdaten
- Zwecke der Verarbeitung
- Rechtsgrundlagen (Art. 6 DSGVO)
- Speicherdauer
- Nutzerrechte (Auskunft, Berichtigung, Löschung, etc.)
- Beschwerderecht

### AGB
1. Geltungsbereich
2. Leistungsumfang (Camera-App, Upload, Bildbearbeitung)
3. Nutzerkonto und Zugang
4. Pflichten des Nutzers
5. Urheberrechte und Nutzungsrechte
6. Vergütung und Zahlungsbedingungen
7. Gewährleistung und Haftung
8. Datenschutz
9. Vertragsdauer und Kündigung
10. Änderung der AGB
11. Schlussbestimmungen

---

## 🚀 Integration mit bestehenden Features

### Camera-App
- Verknüpfung über `/app-login` → Login zur Camera-App
- Bilder werden über pixcapture.app hochgeladen
- Navigation: "Upload" führt zu `/app/upload`

### Upload-System
- Bestehende Upload-Infrastruktur wird genutzt
- Route: `/app/upload` (bereits vorhanden)
- Integration mit existierendem Upload-Flow

### Existing Pages (weiterhin verfügbar)
```
/pages/pixcapture.tsx          → iPhone Upload Demo (existiert bereits)
/pages/app-camera.tsx          → Camera App (existiert bereits)
/pages/app-gallery.tsx         → Galerie (existiert bereits)
/pages/app-upload.tsx          → Upload (existiert bereits)
/pages/app-login.tsx           → Login (existiert bereits)
```

---

## 🔄 Deployment-Strategie

### Phase 1: Entwicklung (aktuell)
- Alle Seiten in einem Projekt
- Routes mit Prefix: `/pixcapture-*`
- Lokale Entwicklung und Testing

### Phase 2: Separation (später)
1. **pix.immo Deployment:**
   - Home, About, Gallery, Preise, Blog, Login
   - Rechtliche Seiten: impressum, datenschutz, agb
   - Footer mit Link zu pixcapture.app

2. **pixcapture.app Deployment:**
   - pixcapture-home, pixcapture-about
   - App-Routes: app-login, app-camera, app-gallery, app-upload
   - Rechtliche Seiten: pixcapture-impressum, pixcapture-datenschutz, pixcapture-agb
   - Footer mit Link zu pix.immo

### Phase 3: DNS & Routing
- DNS A-Record für pixcapture.app
- SSL-Zertifikat für pixcapture.app
- Server-Routing für beide Domains

---

## ✅ Implementierungs-Checklist

### Erledigt ✅
- [x] Bilddaten für pixcapture.app erstellt (`pixCaptureImages`)
- [x] Footer-Komponente für pixcapture.app (`FooterPixCapture.tsx`)
- [x] Cross-Domain-Link in pix.immo Footer hinzugefügt
- [x] Startseite erstellt (`pixcapture-home.tsx`)
- [x] About-Seite erstellt (`pixcapture-about.tsx`)
- [x] Impressum erstellt (`pixcapture-impressum.tsx`)
- [x] Datenschutz erstellt (`pixcapture-datenschutz.tsx`)
- [x] AGB erstellt (`pixcapture-agb.tsx`)
- [x] Dokumentation erstellt (`PIXCAPTURE_APP_STRUCTURE.md`)

### Offen (für später)
- [ ] Cookie-Banner Komponente (Platzhalter)
- [ ] App.tsx Routes für pixcapture.app konfigurieren
- [ ] Testing der neuen Seiten
- [ ] SEO-Optimierung für pixcapture.app
- [ ] Deployment-Konfiguration für beide Domains

---

## 📝 Wichtige Hinweise

### Design-Konsistenz
✅ **DO:**
- Exakt gleiche Farben, Schriften, Abstände wie pix.immo
- Verwendung von `globals.css` Typography
- Keine Tailwind font-size/font-weight Klassen

❌ **DON'T:**
- Kein neues Layout erfinden
- Keine Animationen hinzufügen
- Kein CTA-Ton (pixcapture.app ist Self-Service, nicht Sales)

### Unterschiede zu pix.immo
**Nur 3 Unterschiede:**
1. **Buttons:** Upload, About, Login (statt Portfolio, Preise, Blog, Login)
2. **Bilder:** Self-Service-Charakter (iPhone, DIY-Fotografie)
3. **Rechtliche Seiten:** Eigene Texte für pixcapture.app

**Alles andere ist identisch!**

---

## 🎯 Zielgruppe & Tonalität

### pix.immo
- **Zielgruppe:** Makler:innen, die professionelle Fotografie buchen
- **Tonalität:** Professionell, Premium, Service-orientiert
- **CTA:** "Jetzt buchen", "Portfolio ansehen"

### pixcapture.app
- **Zielgruppe:** Makler:innen und Eigentümer:innen, die selbst fotografieren
- **Tonalität:** Sachlich, informativ, Self-Service
- **CTA:** "Jetzt starten", "Zur Anmeldung"

---

## 📞 Kontakt & Support

**Betreiber:** Daniel Fortmann  
**E-Mail:** mail@pix.immo  
**Standort:** Hamburg, Deutschland

**Projekt-Status:** ✅ Ready for Review  
**Stand:** 05. November 2025

---

**Nächste Schritte:** Warten auf Freigabe vor weiteren Änderungen! 🎉
