# HTML Export für Figma Import

## Übersicht

Dieses Tool exportiert alle 52 Seiten der pix.immo Web-App als separate HTML-Dateien, die Sie dann einzeln in Figma importieren und überarbeiten können.

## Warum HTML statt Screenshots?

- ✅ **Bearbeitbar**: HTML behält die Struktur bei, die Figma in Ebenen konvertiert
- ✅ **Styles erhalten**: Alle CSS-Styles bleiben erhalten
- ✅ **Auswählbare Elemente**: Jedes Element wird zu einem separaten Figma-Frame
- ✅ **Einzeln bearbeitbar**: Jede Seite ist eine separate Datei (keine Überlastung)

## Verwendung

### 1. Server starten

Stelle sicher, dass der Development-Server läuft:

```bash
npm run dev
```

Der Server muss auf `http://localhost:5000` laufen.

### 2. HTML exportieren

```bash
npm run export:html
# oder
./scripts/export-html.sh
```

Das Tool:
- ✅ Besucht automatisch alle 52 Routen
- ✅ Speichert jede Seite als separate HTML-Datei
- ✅ Entfernt JavaScript (nur CSS + HTML bleiben)
- ✅ Erstellt einen Index mit Übersicht

### 3. Ergebnis prüfen

```bash
# Öffne die Übersicht
open export/html/00_index.html
```

## Export-Verzeichnis

```
export/html/
├── 00_index.html              # Übersicht aller Seiten
├── home.html                  # Homepage
├── login.html                 # Login-Seite
├── register.html              # Registrierung
├── dashboard.html             # Dashboard
├── portal-uploads-overview.html
├── portal-gallery-upload.html
├── app-camera.html            # Mobile PWA Kamera
├── app-gallery.html
└── ... (52 Seiten gesamt)
```

## Figma Import Anleitung

### Methode 1: Drag & Drop (einfachste)

1. **Öffne Figma**
2. **Erstelle ein neues File** oder öffne ein bestehendes
3. **Drag & Drop** die HTML-Datei direkt in Figma
4. ✨ Figma konvertiert automatisch zu Frames

### Methode 2: File Import

1. **Figma öffnen**
2. Gehe zu: `File → Import...`
3. Wähle eine HTML-Datei aus `export/html/`
4. Figma importiert das Layout

### Methode 3: Plugin verwenden

1. Installiere das **"HTML to Figma"** Plugin
2. Öffne das Plugin in Figma
3. Lade die HTML-Datei hoch
4. Mehr Kontrolle über den Import-Prozess

## Tipps für Figma-Bearbeitung

### Nach dem Import

1. **Auto-Layout anwenden**
   - Wähle die importierten Frames
   - Drücke `Shift + A` für Auto-Layout
   - Passt Abstände automatisch an

2. **Komponenten erstellen**
   - Wiederholende Elemente (Header, Footer, Buttons)
   - Rechtsklick → "Create Component" (`Ctrl/Cmd + Alt + K`)

3. **Styles extrahieren**
   - Farben: Rechtsklick → "Create color style"
   - Text: Rechtsklick → "Create text style"
   - Effekte: Rechtsklick → "Create effect style"

4. **Gruppen umbenennen**
   - Figma generiert automatische Namen
   - Benenne wichtige Frames um für bessere Übersicht

### Arbeiten mit mehreren Seiten

**Tipp**: Importiere nicht alle 52 Seiten auf einmal! Das überfordert Figma.

**Empfohlene Strategie**:

1. **Kategorisiere die Seiten**:
   - Marketing (Home, About, Pricing)
   - Portal (Uploads, Gallery, Payment)
   - Mobile PWA (Camera, Gallery, Upload)
   - Admin (Editorial, SEO, AI Lab)

2. **Erstelle separate Figma Files**:
   - `pix.immo - Marketing.fig`
   - `pix.immo - Portal.fig`
   - `pix.immo - Mobile PWA.fig`
   - `pix.immo - Admin.fig`

3. **Pro Kategorie 5-10 Seiten**:
   ```
   Marketing.fig:
   - home.html
   - about.html
   - pricing.html
   - blog.html
   - galerie.html
   ```

## Kategorien-Übersicht

### 📱 Marketing Seiten (7 Seiten)
- `home.html` - Homepage
- `about.html` - Über uns
- `pricing.html` / `preisliste.html` - Preise
- `blog.html` - Blog-Übersicht
- `galerie.html` - Portfolio
- `downloads.html` - Downloads

### 🏢 Portal Seiten (6 Seiten)
- `portal-uploads-overview.html`
- `portal-gallery-upload.html`
- `portal-gallery-photographer.html`
- `portal-gallery-editing.html`
- `portal-payment.html`
- `portal-delivery.html`

### 📸 Mobile PWA (5 Seiten)
- `app-splash.html`
- `app-camera.html`
- `app-gallery.html`
- `app-upload.html`
- `app-settings.html`

### 🎯 Capture Workflow (4 Seiten)
- `capture-index.html`
- `capture-camera.html`
- `capture-review.html`
- `capture-upload.html`

### 🔐 Authentication (2 Seiten)
- `login.html`
- `register.html`

### ⚙️ Admin Tools (3 Seiten)
- `admin-editorial.html`
- `admin-seo.html`
- `ai-lab.html`

### 📋 Legal & Support (6 Seiten)
- `imprint.html` / `impressum.html`
- `agb.html`
- `datenschutz.html`
- `contact.html` / `kontakt-formular.html`
- `faq.html`

### 🛠️ Demo & Test (5+ Seiten)
- `demo-upload.html`
- `demo-jobs.html`
- `test-debug.html`
- `docs-rooms-spec.html`

## Empfohlener Workflow

### Phase 1: Design System (Woche 1)

1. **Importiere 3-5 repräsentative Seiten**:
   - `home.html` (Marketing)
   - `portal-gallery-upload.html` (Portal)
   - `app-camera.html` (Mobile)

2. **Erstelle Design Tokens**:
   - Farben (Sage Dark #4A5849, Copper #A85B2E)
   - Typography
   - Spacing System
   - Components (Button, Card, Form)

3. **Baue Component Library**:
   - Header/Footer
   - Navigation
   - Forms
   - Cards
   - Buttons

### Phase 2: Seiten-Redesign (Woche 2-4)

Pro Woche eine Kategorie bearbeiten:

**Woche 2**: Marketing (7 Seiten)
```bash
# Importiere Marketing-Seiten
- home.html
- about.html
- pricing.html
...
```

**Woche 3**: Portal + Mobile (11 Seiten)

**Woche 4**: Admin + Legal (14 Seiten)

### Phase 3: Export & Handoff (Woche 5)

1. **Exportiere Designs**:
   - PNG für Previews
   - SVG für Icons
   - CSS-Code via Figma Inspect

2. **Developer Handoff**:
   - Figma Share-Link
   - Design Specs
   - Asset-Ordner

## Technische Details

### Viewport-Einstellungen

Das Tool exportiert mit:
- **Desktop**: 1920×1080px
- **Mobile**: Separate Exports möglich (siehe unten)

### Mobile Viewport Export

Falls Sie mobile Varianten brauchen, editieren Sie `tools/export-html.ts`:

```typescript
// Zeile 90
await page.setViewport({
  width: 375,   // iPhone viewport
  height: 812,
});
```

Dann:
```bash
tsx tools/export-html.ts
```

### Was wird entfernt?

- ✅ Alle `<script>` Tags (außer Schema.org JSON-LD)
- ✅ Event-Handler (`onclick`, `onchange`, etc.)
- ✅ Interaktive JavaScript-Features

### Was bleibt erhalten?

- ✅ Komplettes CSS (Tailwind + Custom)
- ✅ HTML-Struktur
- ✅ Bilder (als URLs)
- ✅ SVG-Icons
- ✅ Fonts

## Troubleshooting

### Problem: Server nicht erreichbar

**Lösung**:
```bash
# Prüfe ob Server läuft
curl http://localhost:5000

# Starte Server neu
npm run dev
```

### Problem: Puppeteer Error

**Lösung**:
```bash
# Installiere Chromium
npx puppeteer install

# Oder nutze System Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

### Problem: Export dauert zu lange

**Lösung**: Reduziere die Anzahl der Routen in `tools/export-html.ts`:

```typescript
// Nur wichtigste Seiten exportieren
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/portal/gallery-upload', name: 'portal-gallery-upload' },
  // ... füge nur die Seiten hinzu, die du brauchst
];
```

### Problem: Figma kann HTML nicht importieren

**Alternative**: Screenshot-Export nutzen:

```bash
npm run export:screenshots
```

## Automation

### Automatischer täglicher Export

Erstelle einen Cronjob für nächtliche Exports:

```bash
# crontab -e
0 2 * * * cd /path/to/pix.immo && npm run export:html
```

### CI/CD Integration

```yaml
# .github/workflows/figma-export.yml
name: Figma Export
on:
  push:
    branches: [main]
jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run dev &
      - run: npm run export:html
      - uses: actions/upload-artifact@v3
        with:
          name: html-export
          path: export/html/
```

## FAQ

**Q: Kann ich nur einzelne Seiten exportieren?**
A: Ja! Editiere `ROUTES` Array in `tools/export-html.ts`

**Q: Funktioniert das mit anderen Design-Tools?**
A: Ja! Sketch, Adobe XD und Framer können auch HTML importieren

**Q: Werden Bilder mit exportiert?**
A: Bilder bleiben als URLs (werden von Server geladen)

**Q: Wie oft sollte ich re-exportieren?**
A: Nach größeren UI-Änderungen oder wöchentlich für Design-Reviews

## Support

Bei Fragen oder Problemen:
- GitHub Issues: [Repository]
- Dokumentation: `docs/`
- Tool-Code: `tools/export-html.ts`
