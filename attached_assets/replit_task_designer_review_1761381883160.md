# Task: Designer-Review-Exports (HTML → GitHub)

## Ziel
Für das Projekt **pix.immo** sollen alle existierenden Seiten als saubere statische HTML-Dateien exportiert werden, um sie in **Figma** für Design-Reviews überarbeiten zu können.

---

## Anforderungen

### 1. Projektscope
Erstelle für jede bestehende Seite des Projekts eine separate `.html`-Datei im Verzeichnis  
```
/design/html/
```
Die Zielseiten sind mindestens:
- `index.html`
- `upload.html`
- `gallery.html`
- `booking.html`
- `checkout.html`
- `login.html`

---

### 2. Inhaltliche Anforderungen
- Jede Datei soll **vollständig eigenständig lauffähig** sein (alle CSS- und JS-Verknüpfungen relativ oder inline eingebunden).  
- Keine dynamischen Daten oder Serverabhängigkeiten – nur statisches HTML + CSS.  
- Alle sichtbaren UI-Elemente müssen enthalten sein (Buttons, Textfelder, Placeholder-Inhalte, Dummy-Bilder etc.), damit Designer das Layout visuell beurteilen können.  
- Falls nötig, Platzhalter-Texte verwenden (z. B. *„Kundenname“*, *„Objektadresse“*, *„Bild-Upload“*, *„Kommentarbereich“*).

---

### 3. Versionslogik
Lege die Dateien versioniert an, z. B.:
```
upload_v1.html
gallery_v1.html
checkout_v1.html
```
Bei künftigen Änderungen:
```
upload_v2.html
```
usw.

---

### 4. GitHub-Integration
- Nach der Erstellung sollen die Dateien **automatisch in das verbundene GitHub-Repository gepusht** werden unter dem Pfad:
  ```
  /design/html/
  ```
- Commit-Message-Format:
  ```
  chore(design): export static HTML for Figma review [v1]
  ```

---

### 5. Ziel der Übergabe
Diese Dateien dienen ausschließlich als **Referenz für Figma-Designreviews.**  
Designer können sie über GitHub-Raw-Links oder durch manuelles Hochladen in Figma importieren, z. B.:

```
https://raw.githubusercontent.com/<repo>/main/design/html/gallery_v1.html
```

---

## Zusätzliche Hinweise
- Sicherstellen, dass das CSS-System konsistent eingebunden ist (aktuell genutzte Styles aus `/public/css/` übernehmen).  
- Alle eingebundenen Assets (z. B. Logos, Icons) müssen relativ zum Projektpfad funktionieren.  
- Keine Backend-Logik, kein Fetch, kein Hono-Routing — reine Darstellung.  

---

**Ergebnis:**  
Ein sauberes, statisches HTML-Paket aller pix.immo-Seiten für Figma-Review, versioniert und automatisch nach GitHub exportiert.
