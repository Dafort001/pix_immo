# PIX.IMMO Navigation Map

## Haupt-Dashboard (`/dashboard`)
**Erreichbar von:** Alle Seiten mit Login → "PIX.IMMO" Logo

### Dashboard enthält Links zu:
1. ✅ **Meine Aufträge** → `/jobs`
2. ✅ **Neuer Termin** → `/booking`
3. ✅ **Galerie** → `/galerie`
4. ✅ **Upload → Editing Team** → `/upload-editing-team`
5. ✅ **Eingegangene Uploads** → `/eingegangene-uploads`
6. ✅ **pixcapture.app Demo** → `/pixcapture`
7. ✅ **Admin Dashboard** → `/admin-dashboard`

---

## Admin Dashboard (`/admin-dashboard`)
**Erreichbar von:** `/dashboard` → "Admin Dashboard" Card

### Header Navigation:
- ✅ **PIX.IMMO** → `/` (Startseite)
- ✅ **Dashboard** → `/dashboard` (Zurück-Button)
- ✅ **Abmelden** → `/login`

### Tab-Navigation (6 Tabs):
1. ✅ **Aufträge** - Auftragsliste mit KPIs
2. ✅ **QC** - Qualitätskontrolle (Platzhalter)
3. ✅ **Editor Return** - Rückgaben (Platzhalter)
4. ✅ **Kunden** - Kundenverwaltung (Platzhalter)
5. ✅ **Rechnungen** - DATEV Export (Platzhalter)
6. ✅ **System** - Integrationen & Admin-Links

### System Tab enthält Links zu:
**Admin-Bereiche:**
- ✅ `/eingegangene-uploads` - Upload-Verwaltung
- ✅ `/upload-editing-team` - Upload für Editing
- ✅ `/galerie` - Kunden-Galerie
- ✅ `/admin-editorial` - Editorial Content
- ✅ `/admin-seo` - SEO Management
- ✅ `/ai-lab` - AI Lab
- ✅ `/gallery-classify` - Gallery Classify

**Demo & Tools:**
- ✅ `/pixcapture` - iPhone Upload Interface
- ✅ `/demo-jobs` - Demo Jobs
- ✅ `/demo-upload` - Demo Upload
- ✅ `/downloads` - Downloads
- ✅ `/docs-rooms-spec` - Rooms Specification

---

## Eingegangene Uploads (`/eingegangene-uploads`)
**Erreichbar von:** 
- `/dashboard` → "Eingegangene Uploads" Card
- `/admin-dashboard` → System Tab → "Eingegangene Uploads"

### Header Navigation:
- ✅ **Zurück** → `/admin-dashboard`
- ✅ **PIX.IMMO** → `/` (Startseite)
- ✅ **Settings** (Icon-Button)
- ✅ **Abmelden** → `/login`

---

## Upload → Editing Team (`/upload-editing-team`)
**Erreichbar von:**
- `/dashboard` → "Upload → Editing Team" Card
- `/admin-dashboard` → System Tab → "Upload → Editing Team"

### Header Navigation:
- ✅ **PIX.IMMO** → `/` (Startseite)
- ✅ **Dashboard** → `/dashboard` (Zurück-Button)
- ✅ **Abmelden** → `/login`

---

## pixcapture.app (`/pixcapture`)
**Erreichbar von:**
- `/dashboard` → "pixcapture.app Demo" Card
- `/admin-dashboard` → System Tab → "pixcapture.app (iPhone)"

**Exit:**
- ✅ **"Demo beenden" Button** (oben links, außerhalb iPhone) → `/dashboard`

**Beschreibung:** iPhone 15 Pro Max Simulator mit 4-Screen Upload-Flow:
1. Login (OTP)
2. Upload-Formular
3. Upload-Status
4. Upload-Erfolg

---

## Kunden-Galerie (`/galerie`)
**Erreichbar von:**
- `/dashboard` → "Galerie" Card
- `/admin-dashboard` → System Tab → "Kunden-Galerie"

---

## Öffentliche Seiten (ohne Login)
- ✅ `/` - Startseite
- ✅ `/about` - Über uns
- ✅ `/preise` - Preise
- ✅ `/portfolio` & `/gallery` - Portfolio/Galerie
- ✅ `/blog` - Blog
- ✅ `/contact` & `/kontakt` - Kontakt
- ✅ `/faq` - FAQ
- ✅ `/impressum` - Impressum
- ✅ `/datenschutz` - Datenschutz
- ✅ `/agb` - AGB

---

## Auth-Seiten
- ✅ `/login` - Login
- ✅ `/login-otp-request` - OTP anfordern
- ✅ `/login-otp-verify` - OTP verifizieren
- ✅ `/register` - Registrierung
- ✅ `/register-verify` - Registrierung verifizieren

---

## Workflow-Seiten (geschützt)
- ✅ `/jobs` - Meine Aufträge
- ✅ `/booking` - Neuer Termin buchen
- ✅ `/booking-confirmation` - Buchungsbestätigung
- ✅ `/intake` - Intake-Formular
- ✅ `/review/:jobId/:shootId` - Review-Seite
- ✅ `/order-form` - Bestellformular
- ✅ `/preisliste` - Preisliste (intern)

---

## Admin-Seiten (nur Admin)
- ✅ `/admin-dashboard` - Admin Dashboard (Zentrale)
- ✅ `/admin-editorial` - Editorial Content Management
- ✅ `/admin-seo` - SEO Management
- ✅ `/eingegangene-uploads` - Upload-Verwaltung
- ✅ `/upload-editing-team` - Upload für Editing Team

---

## Tools & Spezial-Seiten
- ✅ `/ai-lab` - AI Lab
- ✅ `/gallery-classify` - Gallery Classify
- ✅ `/downloads` - Downloads
- ✅ `/demo-jobs` - Demo Jobs
- ✅ `/demo-job-detail/:id` - Demo Job Detail
- ✅ `/demo-upload` - Demo Upload
- ✅ `/pixcapture` - pixcapture.app (iPhone Simulator)

---

## Dokumentation
- ✅ `/docs-rooms-spec` - Rooms Specification

---

## Navigation-Zusammenfassung

### Von Startseite (`/`) aus:
- Header: About, Preise, Portfolio, Blog, Kontakt, FAQ, Login/Register

### Nach Login → Dashboard (`/dashboard`):
- 7 Cards für alle Hauptfunktionen
- Direkte Links zu Jobs, Booking, Galerie, Uploads, Admin

### Admin Dashboard (`/admin-dashboard`):
- Zentrale Steuerzentrale für Upload → QC → Delivery
- 6 Tabs (Aufträge, QC, Editor Return, Kunden, Rechnungen, System)
- System Tab: Alle Admin-Bereiche, Demo & Tools erreichbar

### Alle Admin-Seiten haben:
- ✅ PIX.IMMO Logo → `/` (Startseite)
- ✅ Zurück-Button → `/admin-dashboard` oder `/dashboard`
- ✅ Settings Icon (Platzhalter)
- ✅ Abmelden → `/login`

---

## Status: ✅ Navigation vollständig verbunden

Alle 34 `.tsx` Seiten sind über eine logische, schlüssige Navigation miteinander verbunden:
- **Öffentliche Seiten** über Header-Navigation
- **Dashboard** als Zentrale nach Login
- **Admin Dashboard** für Workflow-Management
- **Alle Admin-Seiten** haben konsistente Zurück-Navigation
- **System Tab** im Admin Dashboard als Hub für alle Tools
