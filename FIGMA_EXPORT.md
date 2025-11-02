# 📄 HTML Export für Figma - Quick Start

## Schnellstart (3 Schritte)

### 1️⃣ Server starten
```bash
npm run dev
```
✅ Warte bis Server auf `http://localhost:5000` läuft

### 2️⃣ HTML exportieren
```bash
./scripts/export-html.sh
```
✅ Exportiert alle 52 Seiten als HTML-Dateien

### 3️⃣ Ergebnis prüfen
```bash
open export/html/00_index.html
```
✅ Zeigt Übersicht aller exportierten Seiten

---

## 📁 Export-Struktur

Nach dem Export finden Sie hier alle HTML-Dateien:

```
export/html/
├── 00_index.html              ← START HIER (Übersicht)
│
├── home.html                  
├── about.html                 
├── pricing.html              
│
├── portal-gallery-upload.html
├── portal-gallery-photographer.html
│
├── app-camera.html           
├── app-gallery.html          
│
└── ... (52 Seiten gesamt)
```

---

## 🎨 Figma Import (2 Methoden)

### Methode 1: Drag & Drop ⭐ EINFACHSTE

1. Öffne Figma
2. Ziehe HTML-Datei direkt in Figma
3. Fertig! ✅

### Methode 2: File → Import

1. Figma öffnen
2. `File → Import...`
3. HTML-Datei auswählen
4. Fertig! ✅

---

## ⚡ Wichtige Tipps

### ✅ DO's
- **Importiere nur 5-10 Seiten gleichzeitig** (Figma-Performance)
- **Erstelle separate Files pro Kategorie**:
  - `pix.immo - Marketing.fig` (Home, About, Pricing)
  - `pix.immo - Portal.fig` (Gallery Upload, Payment)
  - `pix.immo - Mobile PWA.fig` (Camera, Gallery)

### ❌ DON'Ts
- **NICHT alle 52 Seiten in ein File** (Figma wird langsam)
- **NICHT Screenshot-Plugin nutzen** (HTML ist besser)

---

## 📋 Seiten-Kategorien

Arbeite die Kategorien einzeln ab:

### 1. Marketing (7 Seiten) - START HIER
```
home.html, about.html, pricing.html, preisliste.html,
blog.html, galerie.html, downloads.html
```

### 2. Portal (6 Seiten)
```
portal-uploads-overview.html
portal-gallery-upload.html
portal-gallery-photographer.html
portal-payment.html
portal-delivery.html
portal-status-timeline.html
```

### 3. Mobile PWA (5 Seiten)
```
app-splash.html, app-camera.html, app-gallery.html,
app-upload.html, app-settings.html
```

### 4. Admin Tools (3 Seiten)
```
admin-editorial.html, admin-seo.html, ai-lab.html
```

### 5. Authentication (2 Seiten)
```
login.html, register.html
```

---

## 🔧 Troubleshooting

### Problem: Server läuft nicht
```bash
# Lösung
npm run dev
```

### Problem: Export dauert zu lange
**Lösung**: Editiere `tools/export-html.ts` und entferne unwichtige Routen

### Problem: Figma kann HTML nicht öffnen
**Alternative**: Nutze Screenshots statt HTML:
```bash
tsx tools/page-screenshots.ts
```

---

## 📖 Ausführliche Dokumentation

Für Details siehe: **[docs/figma-html-export.md](docs/figma-html-export.md)**

---

## 💡 Workflow-Empfehlung

**Woche 1**: Design System
1. Importiere `home.html`, `portal-gallery-upload.html`, `app-camera.html`
2. Definiere Farben, Typography, Components
3. Erstelle Component Library

**Woche 2**: Marketing-Seiten (7 Seiten)

**Woche 3**: Portal + Mobile (11 Seiten)

**Woche 4**: Admin + Rest (20+ Seiten)

---

## ✅ Checkliste

- [ ] Server läuft (`npm run dev`)
- [ ] Export ausgeführt (`./scripts/export-html.sh`)
- [ ] Index geöffnet (`open export/html/00_index.html`)
- [ ] Erste 5 Seiten in Figma importiert
- [ ] Design System erstellt
- [ ] Component Library angelegt

---

**Happy Designing! 🎨**
