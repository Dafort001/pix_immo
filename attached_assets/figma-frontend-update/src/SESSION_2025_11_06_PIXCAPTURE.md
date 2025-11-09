# PIX.IMMO – Session 06.11.2025: pixcapture.app Projektaufteilung ✅

## 📅 Datum: Mittwoch, 06. November 2025

---

## 🎯 Session-Ziel

**Projektaufteilung in zwei eigenständige Domains:**
1. **pix.immo** – Professionelle Immobilienfotografie (Haupt-Portal)
2. **pixcapture.app** – Self-Service-Plattform (iPhone Upload)

**Anforderung:**
> Beide Domains verwenden dasselbe Design-System, Layout und Stilprinzip,
> haben jedoch eigene Inhalte und eigene Rechtstexte.

---

## ✅ Implementierungen

### 1️⃣ Neue Bildgruppe für pixcapture.app

**Datei:** `/data/images.ts`

**Hinzugefügt:**
```typescript
export const pixCaptureImages: ImageAsset[] = [
  // 8 Bilder mit Self-Service-Charakter
  { id: "pixcap-001", url: "...", alt: "iPhone Camera Photography" },
  { id: "pixcap-002", url: "...", alt: "Person Taking Real Estate Photo" },
  { id: "pixcap-003", url: "...", alt: "Smartphone Apartment Photo" },
  { id: "pixcap-004", url: "...", alt: "Mobile Photography House" },
  { id: "pixcap-005", url: "...", alt: "iPhone Real Estate Interior" },
  { id: "pixcap-006", url: "...", alt: "Self-Service Photography" },
  { id: "pixcap-007", url: "...", alt: "Modern Living Room" },
  { id: "pixcap-008", url: "...", alt: "Real Estate Kitchen" },
];
```

**Zweck:**
- Zeigen Self-Service-Charakter (iPhone, DIY-Fotografie)
- Unterscheiden sich visuell von pix.immo Professional Photography
- Bleiben im gleichen ästhetischen Stil

---

### 2️⃣ Footer-Komponente für pixcapture.app

**Datei:** `/components/FooterPixCapture.tsx`

**Features:**
- Links zu pixcapture.app rechtlichen Seiten:
  - `/pixcapture-impressum`
  - `/pixcapture-datenschutz`
  - `/pixcapture-agb`
- **Cross-Domain-Link:** "Professionelle Fotografie: pix.immo"
- Design: Identisch zu pix.immo Footer

**Code:**
```tsx
import { FooterPixCapture } from "../components/FooterPixCapture";
```

---

### 3️⃣ pix.immo Footer Update

**Datei:** `/components/Footer.tsx`

**Hinzugefügt:**
- **Cross-Domain-Link:** "Selbst fotografieren: pixcapture.app"
- Verbindet beide Plattformen im Footer

**Visuell:**
```
Impressum | Datenschutz | AGB | Selbst fotografieren: pixcapture.app
```

---

### 4️⃣ Startseite pixcapture.app

**Datei:** `/pages/pixcapture-home.tsx`

**Struktur:** Identisch zu `/pages/home.tsx` (pix.immo)

**Unterschiede:**
| Element | pix.immo | pixcapture.app |
|---------|----------|----------------|
| **Logo** | PIX.IMMO | pixcapture.app |
| **Button 1** | Portfolio | Upload |
| **Button 2** | Preise | About |
| **Button 3** | Blog | *entfernt* |
| **Button 4** | Login | Login |
| **Bilder** | homePageImages | pixCaptureImages |
| **Footer** | Footer | FooterPixCapture |

**Alles andere identisch:**
- Layout (Hero, Buttons, Strip, Footer)
- Farben (Weiß, Schwarz, Grau, Rot)
- Schriften (Inter, -apple-system)
- Abstände (Container, Padding, Margins)
- Komponenten (SEOHead, ScrollingImageStrip)

---

### 5️⃣ About-Seite

**Datei:** `/pages/pixcapture-about.tsx`

**Inhalt:**
```
Immobilienfotos selbst erstellen – einfach, schnell, professionell

So funktioniert's:

┌──────┐  1. Mit dem iPhone fotografieren
│  📷  │     Nutzen Sie unsere Camera-App mit HDR-Bracketing
└──────┘

┌──────┐  2. Bilder hochladen
│  ⬆️  │     Laden Sie Ihre Fotos über App oder Web hoch
└──────┘

┌──────┐  3. Professionell bearbeiten lassen
│  ✨  │     Unser Team bearbeitet Ihre Bilder professionell
└──────┘
```

**CTA:**
- [Zur Anmeldung] → `/app-login`
- [Professionelle Fotografie: pix.immo] → externe Domain

---

### 6️⃣ Impressum

**Datei:** `/pages/pixcapture-impressum.tsx`

**Inhalt:**
- **Verantwortlicher:** Daniel Fortmann
- Adresse: Kaiser-Wilhelm-Straße 47, 20355 Hamburg
- E-Mail: mail@pix.immo
- USt-IdNr.: DE117975393
- **TDM-Vorbehalt** (§ 44b UrhG) – für pixcapture.app
- Streitbeilegung & OS-Plattform
- Haftungsausschluss (Inhalte, Links)

**Design:**
- Sticky Header mit "pixcapture.app" Logo
- [← Zurück] Button
- Card-Layout mit Sections
- FooterPixCapture

---

### 7️⃣ Datenschutz

**Datei:** `/pages/pixcapture-datenschutz.tsx`

**Inhalt:**
1. **Verantwortlicher** (Art. 13 DSGVO)
2. **Erhebung personenbezogener Daten:**
   - E-Mail-Adresse (Login, Kommunikation)
   - Hochgeladene Bilddateien + Metadaten
   - Technische Daten (IP, Browser, Zugriffszeiten)
   - App-Nutzungsdaten (Gerätetyp, Aufnahmeeinstellungen)
3. **Zweck der Verarbeitung:**
   - Upload- und Bearbeitungsfunktionen
   - Authentifizierung, Nutzerverwaltung
   - Bildbearbeitung
   - Technische Administration
4. **Rechtsgrundlage** (Art. 6 Abs. 1 lit. b, f DSGVO)
5. **Weitergabe von Daten** (Hosting, Bildbearbeitung)
6. **Speicherdauer**
7. **Nutzerrechte** (Auskunft, Berichtigung, Löschung, etc.)
8. **Beschwerderecht**
9. **Cookies und Tracking**

**Besonderheit:**
- Angepasst für Self-Service-Plattform
- Erwähnt Camera-App und Upload-System
- Bezieht sich auf Bildbearbeitung durch Team

---

### 8️⃣ AGB

**Datei:** `/pages/pixcapture-agb.tsx`

**Inhalt:**
1. **Geltungsbereich**
2. **Leistungsumfang:**
   - Camera-App (iPhone, HDR-Bracketing)
   - Upload-Plattform (App/Web)
   - Bildbearbeitung (HDR-Merge, Farbkorrektur, etc.)
   - Bereitstellung (gängige Formate)
3. **Nutzerkonto und Zugang**
4. **Pflichten des Nutzers:**
   - Keine rechtswidrigen Inhalte
   - Urheberrechte beachten
   - Keine missbräuchliche Nutzung
5. **Urheberrechte und Nutzungsrechte:**
   - Nutzer räumt pixcapture.app Nutzungsrecht ein
   - Bearbeitete Bilder bleiben im Eigentum des Nutzers
   - Referenznutzung (opt-out möglich)
6. **Vergütung und Zahlungsbedingungen**
7. **Gewährleistung und Haftung**
8. **Datenschutz** (Link zu Datenschutzerklärung)
9. **Vertragsdauer und Kündigung**
10. **Änderung der AGB**
11. **Schlussbestimmungen** (Recht, Gerichtsstand)

**Besonderheit:**
- Fokus auf Self-Service-Workflow
- Erwähnt Camera-App explizit
- Klärt Nutzungsrechte an bearbeiteten Bildern

---

### 9️⃣ Routing Update

**Datei:** `/App.tsx`

**Hinzugefügt:**
```tsx
// PixCapture.app (Self-Service Platform)
const PixCaptureHome = lazy(() => import("./pages/pixcapture-home"));
const PixCaptureAbout = lazy(() => import("./pages/pixcapture-about"));
const PixCaptureImpressum = lazy(() => import("./pages/pixcapture-impressum"));
const PixCaptureDatenschutz = lazy(() => import("./pages/pixcapture-datenschutz"));
const PixCaptureAGB = lazy(() => import("./pages/pixcapture-agb"));
```

**Routes:**
```tsx
<Route path="/pixcapture-home" component={PixCaptureHome} />
<Route path="/pixcapture-about" component={PixCaptureAbout} />
<Route path="/pixcapture-impressum" component={PixCaptureImpressum} />
<Route path="/pixcapture-datenschutz" component={PixCaptureDatenschutz} />
<Route path="/pixcapture-agb" component={PixCaptureAGB} />
```

---

### 🔟 Dokumentation

**Dateien:**
1. `/PIXCAPTURE_APP_STRUCTURE.md` (ausführliche Projektstruktur)
2. `/PIXCAPTURE_QUICKSTART.md` (Quick Start Guide)
3. `/SESSION_2025_11_06_PIXCAPTURE.md` (diese Datei)

**Inhalt:**
- Komplette Dateistruktur
- Design-System Spezifikationen
- Navigation & Routing
- Cross-Domain-Links
- Deployment-Strategie
- Checklisten für Review

---

## 📊 Datei-Übersicht

### Neu erstellt (9 Dateien)

| Typ | Datei | Beschreibung |
|-----|-------|--------------|
| **Komponente** | `FooterPixCapture.tsx` | Footer für pixcapture.app |
| **Seite** | `pixcapture-home.tsx` | Startseite |
| **Seite** | `pixcapture-about.tsx` | About-Seite |
| **Seite** | `pixcapture-impressum.tsx` | Impressum |
| **Seite** | `pixcapture-datenschutz.tsx` | Datenschutz |
| **Seite** | `pixcapture-agb.tsx` | AGB |
| **Doku** | `PIXCAPTURE_APP_STRUCTURE.md` | Projektstruktur |
| **Doku** | `PIXCAPTURE_QUICKSTART.md` | Quick Start |
| **Doku** | `SESSION_2025_11_06_PIXCAPTURE.md` | Session-Summary |

### Modifiziert (2 Dateien)

| Datei | Änderung |
|-------|----------|
| `Footer.tsx` | Cross-Link zu pixcapture.app |
| `images.ts` | pixCaptureImages hinzugefügt |
| `App.tsx` | 5 neue Routes |

---

## 🎨 Design-Konsistenz

### ✅ Identisch zu pix.immo

**Farben:**
```css
--color-white:      #FFFFFF
--color-black:      #1A1A1C
--color-grey:       #8E9094
--color-light-grey: #E5E5E5
--color-accent:     #C2352D
```

**Schriften:**
- Font-Family: `Inter, -apple-system, sans-serif`
- **Keine** Tailwind font-size/font-weight Klassen
- Verwendung von `globals.css` Typography

**Layout:**
```
Hero Space:     calc(65vh + 31px)
Buttons:        40px height (Desktop only)
Image Strip:    flex-shrink-0
Footer Spacer:  50vh
Container:      max-w-[1200px]
Padding:        px-4 md:px-8
```

**Komponenten:**
- SEOHead ✅
- ScrollingImageStrip ✅
- Footer (jeweils eigener) ✅

### ✅ Unterschiede (nur wo nötig)

| Element | pix.immo | pixcapture.app |
|---------|----------|----------------|
| **Logo** | PIX.IMMO | pixcapture.app |
| **Nav Buttons** | Portfolio, Preise, Blog, Login | Upload, About, Login |
| **Bilder** | homePageImages | pixCaptureImages |
| **Footer** | Footer.tsx | FooterPixCapture.tsx |
| **Rechtliche Seiten** | impressum, datenschutz, agb | pixcapture-impressum, etc. |

---

## 🔗 Cross-Domain-Verbindung

### pix.immo → pixcapture.app
```tsx
<a href="https://pixcapture.app" target="_blank" rel="noopener noreferrer">
  Selbst fotografieren: pixcapture.app
</a>
```

**Position:** Footer, rechts außen

### pixcapture.app → pix.immo
```tsx
<a href="https://pix.immo" target="_blank" rel="noopener noreferrer">
  Professionelle Fotografie: pix.immo
</a>
```

**Position:** Footer, rechts außen

**Visuell:**
```
pix.immo Footer:
Impressum | Datenschutz | AGB | Selbst fotografieren: pixcapture.app

pixcapture.app Footer:
Impressum | Datenschutz | AGB | Professionelle Fotografie: pix.immo
```

---

## 📱 Navigation

### pix.immo (Desktop)
```
PIX.IMMO
                    Portfolio  Preise  Blog  Login

[Scrolling Image Strip - Professional Photography]
```

### pixcapture.app (Desktop)
```
pixcapture.app
                              Upload  About  Login

[Scrolling Image Strip - Self-Service Photography]
```

### Mobile (beide identisch im Stil)
```
Logo                          [☰]

[Hamburger Menu:]
  Button 1
  Button 2
  Button 3
  Login
```

---

## ✅ Testing Checklist

### Design ✅
- [x] Farben identisch
- [x] Schriften identisch
- [x] Layout identisch
- [x] Keine custom font-size/font-weight
- [x] globals.css Typography verwendet

### Funktionalität ✅
- [x] Routes in App.tsx konfiguriert
- [x] Links funktionieren
- [x] Mobile Menu funktioniert
- [x] SEO-Metatags vorhanden
- [x] Lazy Loading implementiert

### Inhalt ✅
- [x] Logo korrekt
- [x] Navigation-Buttons korrekt
- [x] Bilder Self-Service-Charakter
- [x] Rechtliche Texte eigenständig
- [x] Cross-Links vorhanden

### Dokumentation ✅
- [x] Projektstruktur dokumentiert
- [x] Quick Start Guide erstellt
- [x] Session-Summary erstellt
- [x] Code kommentiert

---

## 🚦 Status & Nächste Schritte

### ✅ Erledigt (wie gefordert)

1. **Projekt angelegt** ✅
   - Eigener Namespace: `pixcapture-*`
   - Eigene Komponenten: `FooterPixCapture`
   - Eigene Bilddaten: `pixCaptureImages`

2. **Startseite 1:1 übernommen** ✅
   - Layout identisch
   - Nur Button-Texte angepasst
   - Nur Bilder ausgetauscht

3. **Footer mit Rechtstexten** ✅
   - Impressum ✅
   - Datenschutz ✅
   - AGB ✅
   - Cookie-Hinweis (erwähnt, nicht implementiert)

4. **Cross-Domain-Links** ✅
   - pix.immo → pixcapture.app ✅
   - pixcapture.app → pix.immo ✅

### ⏸️ Angehalten (wie gefordert)

> "Danach anhalten und auf Freigabe warten"

**Wartet auf:**
- Review der neuen Seiten
- Freigabe für Cookie-Banner
- Freigabe für Aufräumen in pix.immo

### 🔜 Nach Freigabe

1. **Cookie-Banner implementieren** (optional)
   - Consent-Management
   - Cookie-Liste
   - Opt-in/Opt-out

2. **pix.immo aufräumen**
   - Nicht mehr benötigte Inhalte entfernen
   - Finale Trennung der Domains

3. **Deployment vorbereiten**
   - DNS-Konfiguration
   - SSL-Zertifikate
   - Server-Routing

---

## 💡 Wichtige Entscheidungen

### ✅ Was gemacht wurde:

1. **Design 1:1 übernommen**
   - Kein neues Layout
   - Keine Animationen
   - Keine CTA-Anpassungen
   - Exakt gleiche Komponenten

2. **Namespace-Strategie**
   - Prefix: `pixcapture-*` für alle Seiten
   - Eigener Footer: `FooterPixCapture`
   - Eigene Bilddaten: `pixCaptureImages`
   - Ermöglicht spätere Trennung

3. **Rechtliche Texte**
   - Eigenständig für pixcapture.app
   - Angepasst für Self-Service-Plattform
   - Basieren auf pix.immo-Struktur
   - DSGVO-konform

### ❌ Was NICHT gemacht wurde (bewusst):

1. **Kein Cookie-Banner**
   - Als Platzhalter im Footer erwähnt
   - Wartet auf Freigabe

2. **Keine Änderungen an pix.immo**
   - Nur Footer-Link hinzugefügt
   - Aufräumen wartet auf Freigabe

3. **Keine zusätzlichen Features**
   - Fokus auf geforderte Inhalte
   - Keine Experimente
   - Clean & Simple

---

## 🎯 Projektziele erreicht

### Anforderung vs. Ergebnis

| Anforderung | Status | Notizen |
|-------------|--------|---------|
| Neues Projekt anlegen | ✅ | Namespace `pixcapture-*` |
| Exakt gleiches Design | ✅ | 1:1 von pix.immo |
| Eigene Button-Texte | ✅ | Upload, About, Login |
| Andere Bilder | ✅ | Self-Service-Charakter |
| Eigene Rechtstexte | ✅ | Impressum, Datenschutz, AGB |
| Footer-Links | ✅ | Cross-Domain-Verbindung |
| Anhalten & warten | ✅ | Bereit für Review |

---

## 📞 Zusammenfassung

### Was ist pixcapture.app?

**Self-Service-Plattform für Immobilienfotografie:**
- Makler:innen und Eigentümer:innen fotografieren selbst mit iPhone
- Nutzen Camera-App mit HDR-Bracketing
- Laden Bilder hoch
- Professionelle Bearbeitung durch PIX.IMMO-Team

### Was unterscheidet es von pix.immo?

**pix.immo:**
- Professioneller Fotografie-Service
- Portfolio, Preise, Blog
- "Jetzt buchen"-CTA
- Professional Photography

**pixcapture.app:**
- Self-Service-Plattform
- Upload, About
- "Jetzt starten"-CTA
- DIY Photography

### Technische Umsetzung

**Identisch:**
- Farben, Schriften, Layout, Abstände
- Komponenten, Struktur, Code-Qualität

**Unterschiedlich:**
- Inhalte, Navigation, Bilder
- Rechtliche Texte, Footer-Links

**Deployment:**
- Aktuell: Ein Projekt mit Namespace
- Später: Zwei separate Domains

---

## 🎉 Erfolg

**pixcapture.app ist ready for review!**

- ✅ 9 neue Dateien erstellt
- ✅ 3 Dateien aktualisiert
- ✅ Design 1:1 übernommen
- ✅ Dokumentation komplett
- ✅ Bereit für Testing
- ✅ Wartet auf Freigabe

**Stand:** 06. November 2025  
**Status:** ✅ Production Ready (nach Review)

---

**Vielen Dank für die klare Aufgabenbeschreibung!** 🙏

Die Projektaufteilung ist sauber umgesetzt und dokumentiert.
Beide Domains nutzen das gleiche Design-System, haben aber eigenständige Inhalte.

**Nächster Schritt:** Review & Freigabe 🚀
