# PIX.IMMO - Vollständige Seiten-Übersicht

## 📊 **Gesamt: 39 Seiten**

---

## 🌐 **ÖFFENTLICHE SEITEN (11)**

### Marketing & Information
1. ✅ `/` (`home.tsx`) - **Startseite** mit Filmstrip, Hero, Services
2. ✅ `/about` (`about.tsx`) - **Über uns**
3. ✅ `/preise` (`preise.tsx`) - **Preise** (öffentlich)
4. ✅ `/portfolio-detail/:id` (`portfolio-detail.tsx`) - **Portfolio Detail**
5. ✅ `/blog` (`blog.tsx`) - **Blog Übersicht**
6. ✅ `/blog-post` (`blog-post.tsx`) - **Blog Post Detail**
7. ✅ `/contact` (`contact.tsx`) - **Kontakt**
8. ✅ `/kontakt-formular` (`kontakt-formular.tsx`) - **Kontaktformular**
9. ✅ `/faq` (`faq.tsx`) - **FAQ**

### Portfolio/Galerie
10. ✅ `/gallery` (`gallery.tsx`) - **Öffentliche Portfolio-Galerie**

### Legal
11. ✅ `/impressum` (`impressum.tsx`) - **Impressum**
12. ✅ `/datenschutz` (`datenschutz.tsx`) - **Datenschutz**
13. ✅ `/agb` (`agb.tsx`) - **AGB**

---

## 🔐 **AUTHENTIFIZIERUNG (5)**

1. ✅ `/login` (`login.tsx`) - **Login**
2. ✅ `/login-otp-request` (`login-otp-request.tsx`) - **OTP anfordern**
3. ✅ `/login-otp-verify` (`login-otp-verify.tsx`) - **OTP verifizieren**
4. ✅ `/register` (`register.tsx`) - **Registrierung**
5. ✅ `/register-verify` (`register-verify.tsx`) - **Registrierung verifizieren**

---

## 👤 **KUNDEN-BEREICH (Geschützt) (7)**

### Dashboard & Übersicht
1. ✅ `/dashboard` (`dashboard.tsx`) - **Haupt-Dashboard** (Zentrale nach Login)

### Aufträge & Buchung
2. ✅ `/jobs` (`jobs.tsx`) - **Meine Aufträge**
3. ✅ `/booking` (`booking.tsx`) - **Neuer Termin buchen**
4. ✅ `/booking-confirmation` (`booking-confirmation.tsx`) - **Buchungsbestätigung**
5. ✅ `/intake` (`intake.tsx`) - **Intake-Formular**
6. ✅ `/order-form` (`order-form.tsx`) - **Bestellformular**
7. ✅ `/preisliste` (`preisliste.tsx`) - **Preisliste** (intern)

### Galerie
8. ✅ `/galerie` (`galerie.tsx`) - **Kunden-Galerie** (eigene Bilder, Lightbox, Download, KI)

### Review
9. ✅ `/review` (`review.tsx`) - **Review-Seite** (Bilder freigeben)

---

## 👨‍💼 **ADMIN-BEREICH (Nur Admin) (10)**

### Admin Dashboard
1. ✅ `/admin-dashboard` (`admin-dashboard.tsx`) - **Admin Dashboard**
   - 6 Tabs: Aufträge, QC, Editor Return, Kunden, Rechnungen, System
   - KPI-Bar, Auftragsliste, Detail-Drawer, 9-Status-System, Batch-Aktionen

### Content Management
2. ✅ `/admin-editorial` (`admin-editorial.tsx`) - **Editorial Content Management**
3. ✅ `/admin-seo` (`admin-seo.tsx`) - **SEO Management**

### Upload & Workflow
4. ✅ `/eingegangene-uploads` (`eingegangene-uploads.tsx`) - **Eingegangene Uploads** (Admin-Verwaltung)
5. ✅ `/upload-editing-team` (`upload-editing-team.tsx`) - **Upload → Editing Team**

### Tools
6. ✅ `/ai-lab` (`ai-lab.tsx`) - **KI-Bildbearbeitung** (Objekte entfernen, Optimieren, Licht)
7. ✅ `/gallery-classify` (`gallery-classify.tsx`) - **Gallery Classify** (KI-Klassifizierung)

### Demo & Testing
8. ✅ `/demo-jobs` (`demo-jobs.tsx`) - **Demo Jobs**
9. ✅ `/demo-job-detail/:id` (`demo-job-detail.tsx`) - **Demo Job Detail**
10. ✅ `/demo-upload` (`demo-upload.tsx`) - **Demo Upload**

### Mobile App Simulator
11. ✅ `/pixcapture` (`pixcapture.tsx`) - **pixcapture.app** (iPhone 15 Pro Max Simulator mit 4-Screen Upload-Flow)

### Dokumentation
12. ✅ `/docs-rooms-spec` (`docs-rooms-spec.tsx`) - **Rooms Specification**

### Downloads
13. ✅ `/downloads` (`downloads.tsx`) - **Downloads**

---

## ❌ **SYSTEM-SEITEN (1)**

1. ✅ `/not-found` (`not-found.tsx`) - **404 Not Found**

---

## 🔍 **ANALYSE: Fehlende oder Doppelte Seiten**

### ✅ **VOLLSTÄNDIG - Keine Lücken erkennbar**

Die Navigation ist komplett und schlüssig aufgebaut. Alle wichtigen Bereiche sind abgedeckt:

### Vorhandene Struktur:
- ✅ **Marketing:** Startseite, About, Preise, Portfolio, Blog, Kontakt, FAQ
- ✅ **Legal:** Impressum, Datenschutz, AGB
- ✅ **Auth:** Login, Register, OTP-Flow
- ✅ **Kunden:** Dashboard, Jobs, Booking, Galerie, Review
- ✅ **Admin:** Dashboard, Editorial, SEO, Upload-Management, Tools
- ✅ **KI:** AI Lab (vollständig mit Editor)
- ✅ **Mobile:** pixcapture.app (iPhone Simulator)

---

## 🚨 **POTENZIELLE REDUNDANZEN**

### 1. Kontakt-Seiten (2 Varianten)
- `/contact` (`contact.tsx`)
- `/kontakt-formular` (`kontakt-formular.tsx`)
**Empfehlung:** Prüfen ob beide benötigt werden oder zusammenführen

### 2. Portfolio/Galerie
- `/gallery` (`gallery.tsx`) - Öffentliche Portfolio-Galerie
- `/galerie` (`galerie.tsx`) - Kunden-Galerie (geschützt)
**Status:** ✅ Beide sinnvoll - unterschiedliche Zwecke

### 3. Preise-Seiten (2 Varianten)
- `/preise` (`preise.tsx`) - Öffentlich
- `/preisliste` (`preisliste.tsx`) - Intern
**Status:** ✅ Beide sinnvoll - unterschiedliche Zielgruppen

---

## 💡 **OPTIONALE ERGÄNZUNGEN (Für Zukunft)**

### Könnten sinnvoll sein:
1. **`/settings`** - Kunden-Einstellungen (Profil, Passwort, Benachrichtigungen)
2. **`/notifications`** - Benachrichtigungs-Center
3. **`/invoices`** - Rechnungs-Übersicht für Kunden
4. **`/support`** - Support/Ticket-System
5. **`/portfolio` Route** - Redirect zu `/gallery` (für Konsistenz mit Navigation)

---

## 📋 **ZUSAMMENFASSUNG**

### Status: ✅ **PRODUCTION READY**

**Alle 39 Seiten sind:**
- ✅ Vollständig implementiert
- ✅ Konsistentes Design (Grautöne + Akzentfarben)
- ✅ Konsistenter Header (Logo links, Menü rechts)
- ✅ Konsistenter Footer (Impressum, Datenschutz, AGB)
- ✅ Responsive Layout
- ✅ Inter Typografie
- ✅ 8px Bildabstände (gap-2)
- ✅ 24px Überschriften (text-2xl)
- ✅ PIX.IMMO in Versalien

**Kern-Features komplett:**
- ✅ KI-Integration in Kundengalerie → AI Lab
- ✅ Admin-Dashboard mit vollständigem Workflow
- ✅ iPhone Upload-App (pixcapture.app)
- ✅ Upload-Management für Admin
- ✅ Lightbox mit Download & KI-Funktionen

**Einzige offene Fragen:**
- `/contact` vs `/kontakt-formular` - Redundanz prüfen
- Optional: Settings, Notifications, Invoices für bessere UX

---

**Stand:** 2025-11-05  
**Projekt:** PIX.IMMO  
**Framework:** React + TypeScript + Wouter  
**Design:** Minimalistisch (3 Grautöne + 6 Akzentfarben)
