# Admin Interne Buchung

## Übersicht
Die Admin Interne Buchungsseite (`/admin/internal-booking`) ermöglicht Administratoren, Fotografie-Aufträge manuell im Namen von Kunden zu erstellen. Die Seite bietet eine vollständige Service-Auswahl aus dem importierten Preiskatalog mit automatischer Preisberechnung und SMS-Benachrichtigung.

## Zugriff
- **Route**: `/admin/internal-booking`
- **Navigation**: Admin-Sidebar → Services → "Buchen"
- **Berechtigung**: Nur für eingeloggte Admin-Benutzer

## Funktionen

### 1. Service-Auswahl
- **25 importierte Services** aus `preise_piximmo_internal_1760967461292.md`
- Gruppiert nach Kategorien:
  - Fotografie-Pakete (Standard, Erweitert, Premium, Architektur)
  - Einzelleistungen (Innenaufnahmen, Außenaufnahmen, Luftaufnahmen)
  - Video-Services (Kurz, Mittel, Lang, Premium)
  - Zusatzleistungen (Grundriss 2D, 3D-Visualisierung, Virtuelle Tour, Twilight)
  - Spezialservices (Aerial Panorama, HDR-Bracketing, Infrarot)
  - Regionale Services (Hamburg HH, Extended EXT, Berlin AB)

### 2. Quantity-Steuerung
- **+ / - Buttons** für jede Serviceleistung
- Aktueller Zähler sichtbar zwischen den Buttons
- Minimum: 0 (Service nicht gewählt)
- Maximum: unbegrenzt

### 3. Preisberechnung (Echtzeit)
```
Netto-Summe = Σ (Service-Preis × Quantity)
MwSt (19%) = Netto × 0.19
Brutto-Summe = Netto + MwSt
```

**Checkout-Summary zeigt:**
- Netto-Betrag
- MwSt-Betrag (19%)
- **Brutto-Gesamtbetrag** (fett hervorgehoben)

### 4. Fahrtkostenberechnung
- **Region HH (Hamburg)**: Keine Fahrtkosten (0-30 km Umkreis)
- **Region EXT (Extended)**: €0.80/km (aktuell) → **TODO: Korrigieren auf €0.60/km**
  - **TODO**: Berechnung ab Hamburg Stadtgrenze (nicht >30km)
- **Eingabefeld**: Kilometer manuell eingeben
- Fahrtkosten werden zu Netto-Summe addiert

### 5. Kundendaten
**Kontaktinformationen:**
- `contactName` - Name des Maklers/Kunden (Pflichtfeld)
- `contactEmail` - E-Mail-Adresse (Pflichtfeld, validiert)
- `contactMobile` - Telefonnummer (Pflichtfeld, Format: +49...)

**Objektdaten:**
- `propertyName` - Bezeichnung der Immobilie (Pflichtfeld)
- `propertyAddress` - Adresse der Immobilie (Pflichtfeld)

### 6. Terminauswahl
- `preferredDate` - Gewünschter Termin (Datum-Picker)
- `preferredTime` - Gewünschte Uhrzeit (Zeitauswahl)

## Backend-Integration

### API Endpoint
```
POST /api/bookings
```

### Payload-Struktur
```json
{
  "contactName": "Test Makler GmbH",
  "contactEmail": "makler@example.com",
  "contactMobile": "+49 170 1234567",
  "propertyName": "Einfamilienhaus Elbchaussee",
  "propertyAddress": "Elbchaussee 123, 22609 Hamburg",
  "preferredDate": "2025-11-20",
  "preferredTime": "14:00",
  "region": "HH",
  "kilometers": 0,
  "serviceSelections": {
    "service-id-1": 1,
    "service-id-2": 2
  },
  "totalNetPrice": 57900,
  "vatAmount": 11001,
  "grossAmount": 68901,
  "agbAccepted": true
}
```

**Hinweis**: Preise in Cent (€579.00 = 57900)

### Datenbankoperationen
1. **Booking erstellen** (`bookings` Tabelle)
   - Speichert Kundendaten, Objektdaten, Termin, Preise
   - Status: "pending"
   
2. **BookingItems erstellen** (automatisch)
   - Für jeden Service mit Quantity > 0
   - Verknüpft mit Service-ID und Booking-ID

3. **SMS-Benachrichtigung senden**
   - An `contactMobile`
   - Bestätigungstext mit Termindetails

## SMS-Benachrichtigung

**Twilio-Integration:**
- Sendet automatisch nach erfolgreicher Buchung
- Verwendet Felder: `contactMobile`, `contactName`, `preferredDate`, `preferredTime`

**Beispiel-Text:**
```
Hallo [contactName],

Ihre Buchung wurde bestätigt.
Termin: [preferredDate] um [preferredTime] Uhr

Ich freue mich Sie dort zu treffen.

Mit freundlichen Grüßen
pix.immo Team
```

## Validierung

**Zod-Schema (`insertBookingSchema`):**
- Alle Pflichtfelder müssen ausgefüllt sein
- E-Mail muss valides Format haben
- Telefonnummer muss angegeben sein
- Mindestens ein Service muss ausgewählt sein (serviceSelections nicht leer)
- Preise müssen größer 0 sein

## TODOs für nächste Updates

1. ✅ **Berlin (AB) Service entfernen**
   - Aus aktiver Service-Liste nehmen
   - In seed-services.ts deaktivieren

2. ✅ **Kilometergeld korrigieren**
   - Von €0.80/km auf **€0.60/km** ändern

3. ✅ **Fahrtkosten-Berechnung anpassen**
   - Extended (EXT) Berechnung ab **Hamburg Stadtgrenze** (nicht >30km)
   - Logik überarbeiten

4. ❓ **Objektbezeichnung prüfen**
   - Feld-Label oder Format anpassen?
   - Details vom Benutzer erfragen

5. ❓ **Google Calendar Integration testen**
   - Prüfen ob Termine automatisch eingetragen werden

## Technische Details

### Dateistruktur
- **Frontend**: `client/src/pages/admin-internal-booking.tsx`
- **Backend**: `server/routes.ts` (POST /api/bookings)
- **Schema**: `shared/schema.ts` (bookings, bookingItems)
- **Storage**: `server/storage.ts` (createBooking)
- **Notifications**: `server/notifications.ts` (sendBookingConfirmationSMS)
- **Services**: `server/seed-services.ts` (Preisliste)

### Dependencies
- React Hook Form + Zod Validation
- TanStack Query (Mutations)
- Shadcn UI Components
- Twilio SDK (SMS)
- Google Calendar API (Termine)

### State Management
- `useForm` für Formular-State
- `useMutation` für API-Calls
- `useState` für Service-Quantities und Preis-Summary

## Testing

**End-to-End Test benötigt:**
1. Login als Admin
2. Navigation zur Buchungsseite
3. Services auswählen (mindestens 2)
4. Alle Pflichtfelder ausfüllen
5. Region wählen (HH/EXT)
6. Formular absenden
7. Erfolgs-Toast prüfen
8. SMS-Empfang prüfen
9. Datenbank-Eintrag verifizieren
10. Google Calendar-Eintrag prüfen

---

**Letzte Aktualisierung**: 18. November 2025
**Status**: Implementiert, Testing ausstehend
