# 📋 pix.immo - Externe TODO-Liste

Alles was außerhalb von Replit erledigt werden muss, bevor die Entwicklung weitergehen kann.

---

## 🎯 Übersicht

| Task | Status | Priorität | Dauer |
|------|--------|-----------|-------|
| Figma Design-Review | ⏳ Offen | **JETZT** | 2-4h |
| Stripe Setup | 🔄 In Arbeit | HOCH | 30min |
| Mailgun Setup | 🔄 In Arbeit | HOCH | 45min |
| Twilio Setup | ⏳ Offen | MITTEL | 20min |
| Google Maps Review | ⏳ Optional | NIEDRIG | 15min |

---

## 🎨 1. Figma Design-Review (Priorität: JETZT)

### ✅ Status: Exports fertig (51 HTML-Dateien)

### Aufgabe:
Design-Entscheidungen für alle Seiten treffen und finale Guidelines festlegen.

### Wie:

**Option A: Lokal im Browser**
```bash
# Im Projekt-Verzeichnis:
open design/html/index.html
```

**Option B: In Figma importieren**
1. Figma öffnen
2. "File" → "Import"
3. Eine oder mehrere HTML-Dateien aus `design/html/` auswählen
4. Figma konvertiert automatisch zu Frames

**Option C: Nach GitHub-Push via URL** (später)
```
https://raw.githubusercontent.com/Dafort001/EstateSandbox/main/design/html/[filename]
```

### Design-Entscheidungen treffen:

**1. Farben finalisieren:**
- Aktuelle Brand Colors (Sage & Clay v3):
  - Sage Dark `#4A5849` - Primary
  - UI-Sage `#6E7E6B` - Secondary
  - Copper `#A85B2E` - Accent
  - Copper Dark `#8F4C28` - Hover
  - Neutral White `#FAFAFA` - Background
- Behalten oder anpassen?

**2. Typography:**
- Font Family festlegen (aktuell: system-ui)
- Font Sizes definieren (H1-H6, Body, Small)
- Line Heights

**3. Spacing System:**
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px
- Anpassen?

**4. Komponenten-Varianten:**
- Buttons (Primary, Secondary, Ghost, etc.)
- Cards
- Forms
- Navigation

### Deliverable:
☐ **Design-Guidelines-Dokument** mit:
- Farben (Hex-Codes)
- Fonts (Name, Sizes, Weights)
- Spacing-System
- Komponenten-Specs

**ODER:**

☐ **Aktualisierte Figma-Designs** die ich als Referenz nutzen kann

---

## 💳 2. Stripe Setup (Priorität: HOCH)

### ✅ Status: Account angelegt ✓

### Noch zu erledigen:

#### Schritt 1: Verifizierung abschließen

**URL:** https://dashboard.stripe.com

**Checkliste:**
- ☐ Email-Adresse verifiziert
- ☐ Geschäftsinformationen eingetragen
  - Firmenname
  - Adresse
  - Steuernummer / UID
- ☐ Bankkonto hinterlegt (für Auszahlungen)
- ☐ Identitätsprüfung abgeschlossen (falls erforderlich)

**⚠️ Wichtig:** Erst nach Verifizierung können echte Zahlungen akzeptiert werden.

---

#### Schritt 2: Test-Mode vs. Live-Mode entscheiden

**Test-Mode (empfohlen für Start):**
- ✅ Keine echten Zahlungen
- ✅ Testkarten verwenden
- ✅ Sicheres Testen

**Live-Mode (für Production):**
- ⚠️ Echte Zahlungen
- ⚠️ Stripe-Gebühren (1,4% + 25ct)
- ⚠️ Erst nach vollständiger Verifizierung

**Entscheidung:** 
☐ Test-Mode (für Entwicklung)
☐ Live-Mode (für Production)

---

#### Schritt 3: API Keys holen

**URL:** https://dashboard.stripe.com/apikeys

**Für Test-Mode:**
```
1. In Stripe Dashboard → "Developers" → "API keys"
2. Toggle auf "Test mode" setzen (oben rechts)
3. Keys kopieren:
```

**Benötigt:**
```
✓ Secret key (Backend):
  sk_test_51...

✓ Publishable key (Frontend):
  pk_test_51...
```

**Für Live-Mode:**
```
1. Toggle auf "Live mode" setzen
2. Keys kopieren (beginnen mit sk_live_... und pk_live_...)
```

**⚠️ Sicherheit:**
- Secret Key NIEMALS im Frontend verwenden
- Secret Key NIEMALS in Git committen
- Nur mir geben für Secrets-Konfiguration

**Mir geben:**
```
STRIPE_SECRET_KEY=sk_test_... (oder sk_live_...)
VITE_STRIPE_PUBLIC_KEY=pk_test_... (oder pk_live_...)
```

---

#### Schritt 4: Produkte/Preise konfigurieren

**URL:** https://dashboard.stripe.com/products

**Produkte anlegen (basierend auf /preise Seite):**

**1. Fotografie-Pakete:**
- ☐ Basic Shoot (€299)
  - Name: "pix.immo Basic Shoot"
  - Preis: €299,00 (einmalig)
  - Beschreibung: "Professionelle Immobilienfotografie"

- ☐ Premium Shoot (€499)
- ☐ Luxury Shoot (€799)

**2. Add-Ons:**
- ☐ Drohnenaufnahmen (€149)
- ☐ Virtual Tour 360° (€299)
- ☐ Bildbearbeitung pro Bild (€6)
- ☐ Video-Produktion (€399)

**Für jedes Produkt:**
1. "Products" → "Add product"
2. Name eingeben
3. Preis festlegen (EUR)
4. "One time" oder "Recurring" wählen
5. "Save product"

**Notieren:**
- ☐ Product IDs (price_xxx) für jedes Produkt
- (Brauche ich später für Integration)

---

#### Schritt 5: Webhook-Endpoint (Optional - mache ich später)

**Kann übersprungen werden** - konfiguriere ich nach Integration.

---

#### Schritt 6: Testing mit Testkarten

**Test-Kreditkarten:** https://stripe.com/docs/testing

**Erfolgreiche Zahlung:**
```
Kartennummer: 4242 4242 4242 4242
Ablaufdatum: Beliebig (Zukunft)
CVC: Beliebig (3 Ziffern)
```

**Abgelehnte Zahlung:**
```
Kartennummer: 4000 0000 0000 0002
```

**3D Secure erforderlich:**
```
Kartennummer: 4000 0027 6000 3184
```

---

## 📧 3. Mailgun Setup (Priorität: HOCH)

### ✅ Status: Account angelegt ✓

### Noch zu erledigen:

#### Schritt 1: Domain verifizieren

**URL:** https://app.mailgun.com/app/sending/domains

**Option A: Eigene Domain (empfohlen für Production)**

**Domain:** `mg.pix.immo` (Subdomain!)

**Schritte:**
1. "Add New Domain" klicken
2. Domain eingeben: `mg.pix.immo`
3. Region wählen: `EU` (DSGVO-konform)
4. "Add Domain" klicken

**⚠️ Wichtig:** Subdomain verwenden (nicht Haupt-Domain pix.immo)!

---

**Option B: Sandbox-Domain (nur für Tests)**

```
sandbox-xyz123.mailgun.org
```

**Einschränkungen:**
- Max. 5 Email-Adressen
- Nur für Tests
- Keine Production-Nutzung

**Für Start OK**, später auf eigene Domain wechseln.

---

#### Schritt 2: DNS-Einträge setzen

**Wo:** Domain-Provider (z.B. Cloudflare, Namecheap, etc.)

**Mailgun zeigt dir nach Domain-Hinzufügen:**

**DNS-Records hinzufügen:**

**1. SPF-Record (TXT):**
```
Type: TXT
Name: mg.pix.immo (oder @)
Value: v=spf1 include:mailgun.org ~all
TTL: 3600
```

**2. DKIM-Records (TXT):**
```
Type: TXT
Name: k1._domainkey.mg.pix.immo
Value: k=rsa; p=MIGfMA0GCSqGSIb3... (von Mailgun angezeigt)
TTL: 3600
```

**3. CNAME-Record (Tracking):**
```
Type: CNAME
Name: email.mg.pix.immo
Value: mailgun.org
TTL: 3600
```

**4. MX-Records (Optional - nur wenn Empfang gewünscht):**
```
Type: MX
Name: mg.pix.immo
Priority: 10
Value: mxa.eu.mailgun.org

Type: MX
Name: mg.pix.immo
Priority: 10
Value: mxb.eu.mailgun.org
```

**Verifizierung:**
- DNS-Propagierung dauert 5-60 Minuten
- Mailgun zeigt Status: "Verified" wenn fertig
- ☐ Warten bis alle Records grün sind

---

#### Schritt 3: API Key holen

**URL:** https://app.mailgun.com/app/account/security/api_keys

**Schritte:**
1. "API Keys" → "Private API key"
2. Key anzeigen (mit "Click to show" Button)
3. Kopieren

**Benötigt:**
```
✓ API Key:
  key-abcdef123456...
  
✓ Domain:
  mg.pix.immo (oder sandbox-xyz.mailgun.org)
```

**Mir geben:**
```
MAILGUN_API_KEY=key-abcdef123456...
MAILGUN_DOMAIN=mg.pix.immo
```

---

#### Schritt 4: Absender-Email konfigurieren

**Empfohlene Absender-Adressen:**
```
noreply@mg.pix.immo      → System-Emails
info@mg.pix.immo         → Support-Emails
booking@mg.pix.immo      → Buchungsbestätigungen
```

**Wichtig:**
- MUSS Subdomain verwenden (mg.pix.immo)
- NICHT Haupt-Domain (pix.immo) verwenden
- Sonst funktioniert SPF/DKIM nicht

---

#### Schritt 5: Test-Email senden

**Im Mailgun Dashboard:**
1. "Sending" → "Overview"
2. "Send a test email"
3. An eigene Email-Adresse senden
4. Prüfen ob Email ankommt

**Checkliste:**
- ☐ Email kommt an
- ☐ Landet NICHT im Spam
- ☐ SPF/DKIM Checks bestanden (Email-Header prüfen)

---

#### Schritt 6: Limits prüfen

**Free Tier:**
- 5.000 Emails/Monat
- Erste 3 Monate gratis
- Dann $35/Monat

**Für pix.immo wahrscheinlich ausreichend:**
- Password Resets: ~50/Monat
- Buchungsbestätigungen: ~200/Monat
- Benachrichtigungen: ~500/Monat
- **Gesamt:** ~750/Monat

**Falls mehr benötigt:**
- ☐ Bezahl-Plan wählen
- ☐ Billing-Details hinterlegen

---

## 📱 4. Twilio Setup (Priorität: MITTEL)

### ⏳ Status: Noch zu erledigen

### Wofür?
SMS-Benachrichtigungen für:
- Booking-Erinnerungen
- Order-Status-Updates
- Dringende Benachrichtigungen

**Alternative:** Nur Email nutzen (günstiger)

---

### Entscheidung treffen:

**Option A: Twilio nutzen (empfohlen für vollständige Lösung)**
- ✅ SMS-Benachrichtigungen
- ✅ Professioneller
- ⚠️ Kosten: ~€0.075 pro SMS
- ⚠️ Phone Number: ~€1/Monat

**Option B: Nur Email (günstiger)**
- ✅ Kostenlos (via Mailgun)
- ⚠️ Weniger direkt
- ⚠️ User müssen Emails lesen

**Ihre Entscheidung:**
☐ Twilio setup (weiter unten)
☐ Nur Email (Twilio überspringen)

---

### Falls Twilio gewünscht:

#### Schritt 1: Account erstellen

**URL:** https://www.twilio.com/try-twilio

**Schritte:**
1. "Sign up" klicken
2. Email, Passwort eingeben
3. Phone Number verifizieren
4. Account-Details ausfüllen

**Trial Account:**
- $15 Gratis-Credits
- Ausreichend für ~200 Test-SMS

---

#### Schritt 2: Phone Number kaufen

**URL:** https://console.twilio.com/us1/develop/phone-numbers/manage/search

**Schritte:**
1. "Buy a number" klicken
2. Land wählen: **Deutschland** (+49)
3. Number Type: **Mobile**
4. Capabilities:
   - ☑ SMS
   - ☐ Voice (optional)
   - ☐ MMS (optional)
5. "Search" klicken
6. Number auswählen (z.B. +49 30 12345678)
7. "Buy" klicken (~€1/Monat)

**⚠️ Kosten:**
- Number: ~€1,00/Monat
- SMS: ~€0.075/SMS nach Deutschland

---

#### Schritt 3: API Credentials holen

**URL:** https://console.twilio.com/

**Im Dashboard finden:**

```
✓ Account SID:
  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  
✓ Auth Token:
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  (mit "View" Button anzeigen)
  
✓ Phone Number:
  +49 30 12345678
```

**Mir geben:**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxx...
TWILIO_AUTH_TOKEN=xxxxxxxx...
TWILIO_PHONE_NUMBER=+4930123456789
```

---

#### Schritt 4: Messaging Service erstellen (Optional)

**Für professionellere SMS:**

**URL:** https://console.twilio.com/us1/develop/sms/services

1. "Create Messaging Service"
2. Name: "pix.immo Notifications"
3. Use Case: "Notify my users"
4. Sender Pool: Phone Number hinzufügen
5. "Create"

**Dann zusätzlich:**
```
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxx...
```

---

#### Schritt 5: Test-SMS senden

**Im Twilio Console:**
1. "Develop" → "Phone Numbers" → "Manage" → "Active numbers"
2. Deine Number anklicken
3. "Try it out" → "Send a test SMS"
4. An eigene Nummer senden
5. Prüfen ob SMS ankommt

**Checkliste:**
- ☐ SMS kommt an
- ☐ Absender-Nummer korrekt
- ☐ Text lesbar

---

#### Schritt 6: Geographic Permissions

**Wichtig für internationale SMS:**

**URL:** https://console.twilio.com/us1/develop/sms/settings/geo-permissions

**Länder aktivieren:**
- ☑ Deutschland
- ☑ Österreich
- ☑ Schweiz
- ☑ Weitere EU-Länder (falls Kunden dort)

**Default:** Nur USA aktiviert!

---

## 🗺️ 5. Google Maps API Review (Optional - Priorität: NIEDRIG)

### ✅ Status: Bereits implementiert

### Nur prüfen:

#### Schritt 1: Console öffnen

**URL:** https://console.cloud.google.com

1. Projekt wählen (oder erstellen)
2. "APIs & Services" → "Enabled APIs & services"

**Prüfen ob aktiviert:**
- ☐ Places API
- ☐ Geocoding API
- ☐ Maps Static API

---

#### Schritt 2: Quota & Limits prüfen

**URL:** https://console.cloud.google.com/google/maps-apis/quotas

**Aktuelle Limits:**
- Places Autocomplete: 1.000 Requests/Tag (gratis)
- Geocoding: 40.000 Requests/Tag (gratis)
- Static Maps: 28.000 Requests/Tag (gratis)

**Für pix.immo geschätzt:**
- ~100 Bookings/Monat → ~100 Autocomplete/Monat
- Weit unter Limits ✅

---

#### Schritt 3: Billing prüfen

**URL:** https://console.cloud.google.com/billing

**Checkliste:**
- ☐ Billing Account verknüpft
- ☐ Zahlungsmethode hinterlegt
- ☐ Budgets/Alerts konfiguriert (optional)

**⚠️ Wichtig:** Billing MUSS aktiviert sein, auch für Gratis-Nutzung!

---

#### Schritt 4: API Key Restrictions (Sicherheit)

**URL:** https://console.cloud.google.com/google/maps-apis/credentials

**Empfohlene Restrictions:**
1. API Key anklicken
2. "API restrictions" → "Restrict key"
3. Auswählen:
   - ☑ Places API
   - ☑ Geocoding API
   - ☑ Maps Static API
4. "Application restrictions" → "HTTP referrers"
5. Referrer hinzufügen:
   ```
   https://pix.immo/*
   https://*.replit.dev/*
   ```
6. "Save"

**⚠️ Wichtig:** Verhindert API-Key-Missbrauch

---

## 📊 Zusammenfassung - Was ich jetzt brauche:

### **Minimum (für Production-Launch):**

1. ✅ **Design-Entscheidungen**
   - Farben (final)
   - Fonts (Name, Sizes)
   - Spacing-System
   - Komponenten-Specs

2. 🔑 **Stripe Credentials**
   ```
   STRIPE_SECRET_KEY=sk_test_... (oder sk_live_...)
   VITE_STRIPE_PUBLIC_KEY=pk_test_... (oder pk_live_...)
   ```

3. 📧 **Mailgun Credentials**
   ```
   MAILGUN_API_KEY=key-...
   MAILGUN_DOMAIN=mg.pix.immo
   ```

### **Optional (für SMS):**

4. 📱 **Twilio Credentials** (falls SMS gewünscht)
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+49...
   ```

---

## ⏱️ Geschätzter Zeitaufwand:

| Task | Dauer | Wann |
|------|-------|------|
| **Figma Design-Review** | 2-4 Stunden | JETZT |
| **Stripe fertig setup** | 30 Minuten | HEUTE |
| **Mailgun fertig setup** | 45 Minuten | HEUTE |
| **Twilio komplett** | 20 Minuten | HEUTE |
| **Google Maps Review** | 15 Minuten | OPTIONAL |
| **GESAMT** | **~4-6 Stunden** | |

---

## 🚀 Next Steps (nachdem alles erledigt):

**Dann kann ich:**

1. ✅ **Stripe Integration aktivieren**
   - Payment-Flow implementieren
   - Checkout-Seiten verbinden
   - Webhooks konfigurieren

2. ✅ **Mailgun Integration implementieren**
   - Email-Templates erstellen
   - Password-Reset-Flow
   - Booking-Confirmation-Emails
   - Order-Notifications

3. ✅ **Twilio Integration** (falls gewünscht)
   - SMS-Notification-System
   - Booking-Reminders
   - Status-Updates

4. ✅ **Testing & Production-Deployment**
   - End-to-End Tests
   - Payment-Flow testen
   - Email-Flow testen
   - Production-Deployment vorbereiten

---

## 📝 Notizen:

**Wichtige Hinweise:**

- **API Keys NIEMALS in Git committen!**
- **Alle Secrets nur mir geben** (für Replit Secrets)
- **Stripe Test-Mode für Entwicklung** nutzen
- **Mailgun Subdomain** verwenden (mg.pix.immo)
- **DNS-Records brauchen Zeit** (5-60 Min)

**Bei Problemen:**
- Stripe Support: https://support.stripe.com
- Mailgun Support: https://help.mailgun.com
- Twilio Support: https://support.twilio.com

---

**Erstellt:** Oktober 2025  
**Projekt:** pix.immo  
**Version:** 1.0  
**Status:** In Progress
