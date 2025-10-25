# 📘 piximmo_gallery_spec_v1.md

## 🧾 Projekt: pix.immo  
### Upload- & Editing-Galerien – Replit Spezifikation V1.0  

---

## 🎯 Ziel  
Das Galerie-System dient als Kernkomponente für Upload, Bearbeitung und Review von Immobilienbildern.  
Es muss **in der ersten Live-Version vollständig funktionieren** – ohne spätere Nachreichungen.  
Alle beschriebenen Funktionen gelten als **Pflichtumfang**.

---

## 🧱 1️⃣ Galerie-Typen  

### A. Customer Upload Gallery  
- Für Kunden (z. B. Makler oder Eigentümer).  
- Upload von Smartphone- oder Kameraaufnahmen.  
- Vorschau jedes Bilds mit Kommentar- und Markierungsfunktion.  
- Globaler Button **„Alles nach Standard bearbeiten“** (nutzt Default-Preset).  
- Optional: individuelle Einstellungen pro Bild.

### B. Photographer Upload Gallery  
- Für Fotografen / Admins.  
- Upload kompletter Serien oder ZIP-Ordner.  
- Unterstützt alle gängigen RAW-Formate.  
- Nach Upload: automatische Thumbnail-Erzeugung.  
- Option: „Direkt an Bearbeitung übergeben“.

### C. Editing Gallery  
- Interne Bearbeitungs- und Review-Ansicht.  
- Anzeigen, filtern, freigeben, kommentieren.  
- Speicherung der finalen `gallery_meta.json` und Übergabe an AI/Editor.

---

## 📥 2️⃣ Upload-Handling  

**Dateiformate:**  
`jpg, jpeg, png, heic, dng, cr2, cr3, nef, arw, orf, rw2, raf`

**Technik:**  
- Chunked Upload über Cloudflare R2 mit Fortschrittsanzeige.  
- Automatische Thumbnail-Generierung nach Abschluss.  
- Namensschema:  
  `{date}-{shootcode}_{roomtype}_{index}_v{ver}.jpg`  
- Metadaten pro Galerie als JSON.

**Beispiel:**
```json
{
  "gallery_id": "shoot_2025_0101",
  "uploaded_by": "user_456",
  "files": [
    {
      "filename": "2025-10-25_sh001_livingroom_01_v1.jpg",
      "filetype": "jpg",
      "filesize_mb": 18.2,
      "room_type": "livingroom"
    }
  ]
}
```

---

## 🎛️ 3️⃣ UI-Struktur  

### Hauptansicht  
- Scrollbare Raster-Galerie mit Thumbnails  
- Multi-Select und Filter (Raumtyp, Status)  
- **Top-Bar:**  
  - 📤 Upload  
  - ⚙️ Bearbeitung anpassen  
  - ✅ Zur Bearbeitung freigeben  
  - 🔍 Filter  

### Upload-Dialog  
- Drag-and-Drop-Zone + Dateiauswahl  
- Fortschrittsbalken pro Datei  
- Nach Upload: Thumbnail + „Bearbeitung öffnen“  

### Sidebar / Detail-Panel  
- Großansicht des Bilds  
- Dropdowns:
  - Stil: PURE / EDITORIAL / CLASSIC  
  - Fenster: CLEAR / SCANDINAVIAN / BRIGHT  
  - Himmel: CLEAR BLUE / PASTEL CLOUDS / DAYLIGHT SOFT / EVENING HAZE  
- Checkboxen:
  - 🔥 Kaminfeuer  
  - 🧹 Standard-Retusche (Kabel, Tonnen)  
  - 🌿 Smart Enhancements  
- Kommentarfeld (max 500 Zeichen)  
- ✏️ Markierungs-Tool (roter Freihand-Stift → PNG-Maske)  
- Button: „Auf ähnliche Bilder anwenden“

---

## ⚙️ 4️⃣ Backend  

- **Speicherorte (Cloudflare R2):**
  - `/uploads/raw/…` → Originale  
  - `/uploads/thumbs/…` → Thumbnails  
  - `/uploads/meta/gallery_meta.json`  
  - `/uploads/masks/…` → Masken  

- **API-Endpoints:**
  - `POST /api/upload`  
  - `POST /api/gallery/save`  
  - `GET /api/gallery/:id`  
  - `POST /api/mask/upload`  
  - `POST /api/gallery/finalize`  

---

## 🧠 5️⃣ Systemlogik  

| Status | Bedeutung |
|--------|------------|
| `uploaded` | Datei vollständig hochgeladen |
| `annotated` | Kommentare / Markierungen vorhanden |
| `reviewed` | intern geprüft |
| `editing` | an AI / Editor übergeben |
| `delivered` | fertiggestellt & an Kunde gesendet |

---

## 🧮 6️⃣ Automatische Prozesse  

Nach `finalize`:  
1. `gallery_meta.json` erzeugen  
2. Übergabe an Modal Worker (AI Analyse + Captioning)  
3. Ergebnisse in `/delivery/…` speichern  
4. Benachrichtigung an Admin senden  

---

## ✅ 7️⃣ Anforderungen an Stabilität  

- Kein Beta-Release, keine Version 2.  
- Alle beschriebenen Features **Pflichtumfang V1.0**:  
  - RAW-Upload  
  - Masken-System  
  - Per-Bild Overrides  
  - Global Settings  
  - Export `gallery_meta.json`  
- System muss sofort produktionsfähig, reproduzierbar und fehlerfrei laufen.  

---

## 🚀 Ziel  
Eine stabile, professionelle Galerie-Infrastruktur für Upload, Annotation, Bearbeitung und Auslieferung –  
zentraler Bestandteil der pix.immo-Plattform.  
