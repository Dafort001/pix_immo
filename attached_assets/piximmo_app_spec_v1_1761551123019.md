# 📱 PIX.IMMO – iPhone App Spezifikation (Übergabe an Replit)

**Version:** 1.0  
**Stand:** 27.10.2025  
**Sprachen:** Deutsch 🇩🇪 / Englisch 🇬🇧  
**Ziel:** Vollständige Funktionsbeschreibung der App für den aktuellen Entwicklungsstand (Frontend + Logik)

---

## 🔹 A. Startseite & Login / Start Screen & Login

**DE:**  
- Die Buttons „Start“, „Camera“, „Galerie“, „Upload“ und „Manuell“ dürfen **nicht direkt auf der Startseite** erscheinen.  
- Sie gehören in die Navigationsleiste **nach dem Login**.  
- Die Startseite zeigt: App-Logo, Login-Felder, „Demo-Modus starten“ und **Sprachumschalt-Button (DE/EN)**.  
- Login ermöglicht eindeutige Benutzerzuordnung. Ohne Login → eingeschränkter **Demo-Modus (24 h)**.  
- Option „Angemeldet bleiben“ soll Login-Daten speichern.  

**EN:**  
- The buttons “Start”, “Camera”, “Gallery”, “Upload”, and “Manual” must **not appear directly** on the start screen.  
- They belong in the **navigation bar after login**.  
- Start screen shows: app logo, login form, “Start Demo Mode”, and **language switch (DE/EN)**.  
- Login assigns each user a unique account. Without login → limited **Demo Mode (24 h)**.  
- Option “Stay signed in” should store login data.

---

## 🔹 B. Kameraseite / Camera Page

**DE:**  
- Galerie- und Upload-Button tauschen Position.  
- Ausrichtungskreuz doppelt so groß, mittig mit Schatten.  
- Untere Button-Leiste leicht nach unten verschoben, knapp oberhalb des Bildschirmrands.  
- Raumwähler + Histogramm werden in diese Leiste integriert.  
- Raumwähler erhält „Schließen/X“-Button.  
- Neuer Button für Formatwahl (2:3 / 4:3 / 16:9) oben mittig.  
- Auslösebutton exakt mittig unten, haptisches Feedback.  
- Histogramm als **interaktiver Slider** für Helligkeitskorrektur.  
- Obere Leiste:
  1️⃣ Grid (aktivieren)  
  2️⃣ Wasserwaage (Symbol anpassen)  
  3️⃣ Selbstauslöser (bleibt)  
  4️⃣ „x“-Button entfernen.  

**EN:**  
- Swap positions of Gallery and Upload buttons.  
- Center cross twice as large with subtle shadow.  
- Bottom button bar slightly lowered, just above screen edge.  
- Room selector + histogram integrated into the same bar.  
- Room selector gets a “Close/X” button.  
- New button for format selection (2:3 / 4:3 / 16:9) at the top center.  
- Shutter button perfectly centered at bottom, with haptic feedback.  
- Histogram as **interactive brightness slider**.  
- Top row:
  1️⃣ Grid (enable)  
  2️⃣ Level (update icon)  
  3️⃣ Self-timer (keep)  
  4️⃣ Remove “x” button.

---

## 🔹 C. Galerie / Gallery Page

**DE:**  
- Jede Galerie gehört zu einem **Job** mit Name + Code.  
- Automatische Job-Erkennung (GPS > 150 m oder Zeit > 45 min).  
- Manuelles Job-Anlegen möglich.  
- Kachelansicht mit Dateinamen + Raumtyp.  
- Stapellogik: Belichtungsreihen (3 Bilder) → eine Kachel.  
- PWA = Software-Helligkeit, iPhone = echte Belichtung.  
- Nach Auswahl: Overlay mit Raumname + Notizfeld.  
- Batch-Edit für mehrere Motive.  
- Status-Badges: 🟢 Neu / 🟡 Geändert / 🔵 Zur Uploadliste / ⚪ Hochgeladen / 🔴 Fehler.  
- Filter & Sortierung (Zeit, Raumname, Dateiname).  
- Lazy Loading + lokaler Cache.  
- Fehlerszenarien: kein Job, defekte Dateien, kein Zugriff.  
- Barrierefrei, Sprachen: DE / EN.  

**EN:**  
- Each gallery belongs to a **job** with name and code.  
- Auto job detection (GPS > 150 m or time > 45 min).  
- Manual job creation possible.  
- Tile view with filename + room type.  
- Exposure stacks (3 images) = one tile.  
- PWA = software brightness; iPhone = real exposure.  
- After selection: overlay with editable room name + note.  
- Batch edit for multiple images.  
- Status badges: 🟢 New / 🟡 Changed / 🔵 Upload list / ⚪ Uploaded / 🔴 Error.  
- Filter & sorting (time, room, filename).  
- Lazy loading + local cache.  
- Error handling: no job, broken files, no permission.  
- Accessible, languages: DE / EN.

---

## 🔹 D. Upload / Upload Module

**DE:**  
- Upload arbeitet pro Job (Jobname + Code).  
- Nur markierte Motive, Reihenfolge beibehalten, keine Duplikate.  
- Untere Leiste: immer sichtbar (44–56 pt), oberhalb Safe Area.  
- Vor Upload: Dialog „Nur WLAN / WLAN + Mobil“ + Datenvolumenhinweis.  
- „Job finalisieren“ Pflicht vor Upload → Retusche-Option, Stilwahl, Hinweise.  
- Kein In-App-Kauf, nur Server-Übertragung.  
- Chunked Upload (5–10 MB), Resume, Checksummen, Retry, TLS, Akkuwarnung.  
- Fortschrittsanzeige pro Datei und gesamt, „Pause / Fortsetzen / Anhalten“.  
- Nach Upload: Badge „Hochgeladen“ in Galerie.  
- Logging auf Client + Server (upload_ticket_id).  

**EN:**  
- Upload runs per job (name + code).  
- Only selected files, keep order, no duplicates.  
- Bottom bar: always visible (44–56 pt), above safe area.  
- Pre-upload dialog: “Wi-Fi only / Wi-Fi + Mobile” with data estimate.  
- “Finalize job” required → retouch level, style, notes.  
- No in-app payment; only server transfer.  
- Chunked upload (5–10 MB), resume, checksums, retries, TLS, low-battery warning.  
- Progress bar per file and overall; “Pause / Resume / Stop”.  
- After upload: “Uploaded” badge in gallery.  
- Logging client + server (upload_ticket_id).

---

## 🔹 E. Sprachumschaltung / Language Switch

**DE:**  
- Auf der Startseite befindet sich unten oder oben rechts ein Button **„DE / EN“**.  
- Beim Tippen wechselt die Sprache dynamisch (State = „de“ ↔ „en“).  
- Einstellung wird in `localStorage` gespeichert.  
- JSON-basierte Sprachdateien:  
  ```
  /lang/de.json
  /lang/en.json
  ```
- Beispiel `de.json`:
  ```json
  {
    "login_title": "Anmeldung",
    "login_button": "Einloggen",
    "demo_mode": "Demo-Modus starten",
    "language_button": "EN"
  }
  ```

**EN:**  
- A button **“DE / EN”** appears on the start screen (bottom or top right).  
- Tapping toggles the language dynamically (state “de” ↔ “en”).  
- Preference saved in `localStorage`.  
- JSON-based language files:  
  ```
  /lang/de.json
  /lang/en.json
  ```

---

## 🔹 F. Manueller Kameramodus / Manual Camera Mode

**DE:**  
- Aktivierung über Button „Manuell“ in der unteren Leiste.  
- Öffnet **halbtransparentes Overlay** über Live-Vorschau (ca. 30 % Dunkelung).  
- Regler für ISO, Verschlusszeit, Weißabgleich (K), Fokus, Belichtungskorrektur (EV), Night Mode.  
- ISO: 50–3200 • Zeit: 1/8000 s–10 s • WB: 2500–7500 K  
- Night Mode = 5-fach Stack für Lowlight.  
- „Auto“-Button setzt alle Werte zurück.  
- Anzeige oben rechts: **M [ISO 800 | 1/60 s | 5000 K]**  
- Werte werden pro Job gespeichert.  
- Vibrationsfeedback bei Aktivierung.  
- PWA: simulierte Werte; iOS: native Camera-API.  

**EN:**  
- Activated via “Manual” button in the bottom bar.  
- Opens **semi-transparent overlay** over live preview (~30 % dark).  
- Sliders for ISO, shutter, white balance (K), focus, exposure comp (EV), night mode.  
- ISO: 50–3200 • Shutter: 1/8000 s–10 s • WB: 2500–7500 K  
- Night Mode = 5-frame stack for low light.  
- “Auto” resets all parameters.  
- Top-right display: **M [ISO 800 | 1/60 s | 5000 K]**  
- Values stored per job.  
- Haptic feedback on toggle.  
- PWA = simulated; iOS = native Camera API.

---

## 🔹 G. Zusammenfassung / Summary

**DE:**  
Diese Spezifikation beschreibt die vollständige App-Logik für die Version 1.0 –  
inklusive Startbildschirm, Kamera, Galerie, Upload, Sprachumschaltung und manueller Steuerung.  
Replit soll die UI-Komponenten modular aufbauen, Safe-Areas berücksichtigen und die Sprachdateien per JSON laden.  

**EN:**  
This specification defines the full app logic for version 1.0 –  
including start screen, camera, gallery, upload, language toggle, and manual controls.  
Replit should build modular UI components, respect safe areas, and load language files via JSON.

---
