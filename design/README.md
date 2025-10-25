# pix.immo - Design Exports

Statische HTML-Exports aller pix.immo-Seiten für Figma Design-Reviews.

---

## 📂 Struktur

```
design/
├── README.md           → Diese Datei
└── html/               → Statische HTML-Exports
    ├── index.html      → Navigation zu allen Exports
    ├── *_v1.html       → Versionierte Page-Exports
    └── ...
```

---

## 🎯 Zweck

Diese HTML-Dateien dienen als **Design-Referenz für Figma**.

**Use Cases:**
- Designer können HTML-Dateien in Figma importieren
- Design-Reviews ohne laufende Dev-Umgebung
- Versionskontrolle von UI-States
- Stakeholder-Präsentationen

---

## 📄 Verfügbare Exports (v1)

### Public Pages
- `index_v1.html` - Homepage
- `gallery_v1.html` - Gallery
- `pricing_v1.html` - Pricing
- `booking_v1.html` - Booking Form
- `login_v1.html` - Login Page
- `contact_v1.html` - Contact Form

### Portal Pages (Gallery Upload System V1.0)
- `portal_uploads_v1.html` - Uploads Overview
- `portal_gallery_upload_v1.html` - Customer Upload
- `portal_photographer_v1.html` - Photographer RAW Upload
- `portal_editing_v1.html` - Final Editing
- `portal_payment_v1.html` - Payment (Stripe)
- `portal_status_v1.html` - Status Timeline
- `portal_delivery_v1.html` - Delivery

### Mobile App (PWA)
- `app_splash_v1.html` - Splash Screen
- `app_camera_v1.html` - Camera Interface
- `app_gallery_v1.html` - Photo Gallery
- `app_upload_v1.html` - Upload Progress

### Additional
- `dashboard_v1.html` - User Dashboard
- `order_v1.html` - Order Form

---

## 🚀 Verwendung

### Lokal öffnen
```bash
# Navigation-Seite öffnen
open design/html/index.html

# Einzelne Seite öffnen
open design/html/portal_gallery_upload_v1.html
```

### In Figma importieren

**Option 1: Lokaler Import**
1. Figma öffnen
2. "File" → "Import"
3. HTML-Datei auswählen
4. Figma konvertiert HTML zu Frames

**Option 2: GitHub Raw URL**
```
https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/portal_gallery_upload_v1.html
```

1. URL kopieren
2. Figma → "File" → "Import from URL"
3. URL einfügen

---

## 🔄 Versioning

**Naming Convention:**
```
<page_name>_v<version>.html

Beispiele:
- booking_v1.html    → Version 1
- booking_v2.html    → Version 2 (nach Design-Update)
- booking_v3.html    → Version 3
```

**Bei Updates:**
```bash
# Export-Script anpassen (neue Version)
# In scripts/export-html.ts: filename von *_v1.html zu *_v2.html ändern

# Erneut exportieren
tsx scripts/export-html.ts

# Nach GitHub pushen
git add design/html/*_v2.html
git commit -m "chore(design): export static HTML for Figma review [v2]"
git push
```

---

## 🛠️ Export-System

### Automatischer Export

**Script:** `scripts/export-html.ts`

**Ausführen:**
```bash
tsx scripts/export-html.ts
```

**Was passiert:**
1. Liest Route-Definitionen aus Array
2. Generiert statische HTML mit inline CSS
3. Speichert in `design/html/`
4. Erstellt Navigation-Index

### Neue Seite hinzufügen

**In `scripts/export-html.ts`:**
```typescript
const PAGES_TO_EXPORT = [
  // Bestehende Seiten...
  
  // Neue Seite hinzufügen:
  { 
    route: '/neue-seite', 
    filename: 'neue_seite_v1.html', 
    title: 'Neue Seite' 
  },
];
```

**Dann:**
```bash
tsx scripts/export-html.ts
```

---

## 🎨 Design-Guidelines

### Brand Colors
```css
--sage-dark: #4A5849       /* Primary */
--ui-sage: #6E7E6B         /* Secondary */
--copper: #A85B2E          /* Accent */
--copper-dark: #8F4C28     /* Hover */
--neutral-white: #FAFAFA   /* Background */
--pure-white: #FFFFFF      /* Content */
--border-gray: #E5E5E5     /* Borders */
```

### Typography
- Font Family: `system-ui, -apple-system, sans-serif`
- Headings: Bold, Sage Dark
- Body: Regular, UI-Sage
- Links: Copper

### Spacing
- Small: 0.5rem (8px)
- Medium: 1rem (16px)
- Large: 1.5rem (24px)
- XL: 2rem (32px)

---

## 📊 Features der Exports

### ✅ Eigenständig lauffähig
- Alle Styles inline eingebettet
- Keine externen Dependencies
- Funktioniert offline

### ✅ Responsiv
- Mobile-First Design
- Breakpoints: 768px (tablet), 1024px (desktop)
- Grid-Layouts für alle Screen-Sizes

### ✅ Interaktiv (visuell)
- Buttons, Inputs, Forms
- Placeholder-Content
- Dummy-Daten für Realismus

### ✅ Versioniert
- Klare Versionskennung (_v1, _v2, etc.)
- Git-History für alle Änderungen

---

## 🔗 GitHub Integration

**Repository:** https://github.com/Dafort001/EstateSandbox

**Commit-Message Format:**
```
chore(design): export static HTML for Figma review [v1]
```

**Raw URLs:**
```
https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/index.html
https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/portal_gallery_upload_v1.html
```

---

## 📝 Changelog

### v1 (Oktober 2025)
- ✅ Initial Export: 19 Seiten
- ✅ Public Pages (6)
- ✅ Portal Pages (7)
- ✅ Mobile App (4)
- ✅ Additional (2)
- ✅ Navigation-Index

---

## 🆘 Troubleshooting

### Figma Import schlägt fehl

**Problem:** "Invalid HTML structure"

**Lösung:**
1. HTML-Datei in Browser öffnen → DevTools → Console
2. Fehler prüfen
3. Export-Script anpassen

### Styles fehlen in Figma

**Problem:** CSS wird nicht übernommen

**Lösung:**
- Figma importiert nur inline Styles
- Prüfen: Alle Styles in `<style>`-Tag?
- Ggf. wichtige Styles als inline-Attribute

### GitHub Raw URL funktioniert nicht

**Problem:** 404 Not Found

**Lösung:**
1. Datei committed und gepusht?
2. Branch = `main` oder `master`?
3. Korrekter Pfad: `/design/html/...`

---

## 🔮 Roadmap

### Geplant für v2:
- [ ] Interaktive Prototypes (Framer Export)
- [ ] Design-Tokens JSON
- [ ] Component Library (Storybook)
- [ ] Accessibility Annotations
- [ ] Dark Mode Variants

---

**Erstellt:** Oktober 2025  
**Version:** v1  
**Export-Script:** `scripts/export-html.ts`  
**Letztes Update:** $(date)
