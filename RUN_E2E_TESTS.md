# 🚀 E2E Tests ausführen – Schritt-für-Schritt

## ✅ Voraussetzungen (lokal)

Die E2E-Tests können **NICHT in Replit** ausgeführt werden (fehlende Browser-Dependencies).

**Du musst die Tests auf deiner lokalen Maschine ausführen.**

---

## 📋 Setup (einmalig)

### 1. Repository klonen

```bash
git clone <dein-repo-url>
cd pix-immo
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Playwright Browser installieren

```bash
npx playwright install chromium
```

**Hinweis**: Dies installiert die Chromium-Browser-Binaries (~200 MB).

---

### 4. Umgebungsvariablen konfigurieren

Erstelle `.env.local` mit Test-Datenbank:

```bash
# Test-Database (verwende NICHT production!)
DATABASE_URL=postgresql://user:pass@localhost:5432/piximmo_test
PGHOST=localhost
PGPORT=5432
PGUSER=piximmo_test
PGPASSWORD=test_password
PGDATABASE=piximmo_test

# Session Secret
SESSION_SECRET=test-session-secret-key-12345

# R2 Storage (optional für Tests, da nur presigned URLs geprüft werden)
CF_R2_ACCESS_KEY=test_key
CF_R2_SECRET_KEY=test_secret
CF_R2_ENDPOINT=https://test.r2.cloudflarestorage.com
CF_R2_BUCKET=test-bucket
```

**Wichtig**: Verwende eine separate Test-Datenbank, NICHT die Production-DB!

---

### 5. Test-Datenbank initialisieren

```bash
# Schema in Test-DB pushen
npm run db:push
```

---

## 🧪 Tests ausführen

### Alle E2E-Tests

```bash
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts
```

**Erwartete Ausgabe**:
```
Running 5 tests using 1 worker

  ✓  [chromium] › download-auth.spec.ts:6:3 › Scenario 1: Client can download own selected images (5s)
  ✓  [chromium] › download-auth.spec.ts:37:3 › Scenario 2: Client cannot download other client's images (4s)
  ✓  [chromium] › download-auth.spec.ts:74:3 › Scenario 3: Admin can download any images (bypass) (3s)
  ✓  [chromium] › download-auth.spec.ts:116:3 › Scenario 4: Client cannot download unselected images (2s)
  ✓  [chromium] › download-auth.spec.ts:145:3 › Scenario 5: Client can download extra_free (kulanz) images (2s)

  5 passed (16s)
```

---

### Mit UI Mode (interaktives Debugging)

```bash
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts --ui
```

**Features**:
- Schritt-für-Schritt-Ausführung
- Live-DOM-Inspektion
- Network-Tab für API-Calls
- Screenshots + Traces

---

### Mit sichtbarem Browser (Headed Mode)

```bash
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts --headed
```

**Nützlich für**: Visuelle Überprüfung der User-Flows.

---

### Einzelnes Szenario ausführen

```bash
# Nur Scenario 1
NODE_ENV=test npx playwright test -g "Scenario 1"

# Nur Scenario 4 (unselected images)
NODE_ENV=test npx playwright test -g "Scenario 4"
```

---

### Mit Debug-Logging

```bash
DEBUG=pw:api NODE_ENV=test npx playwright test e2e/download-auth.spec.ts
```

Zeigt alle HTTP-Requests und Browser-Events.

---

## 🐛 Troubleshooting

### Error: "Browser not found"

```bash
npx playwright install chromium
```

---

### Error: "Connection refused" (localhost:5000)

Die Tests starten automatisch den Dev-Server (`npm run dev`) via `playwright.config.ts`.

**Manueller Fix** (falls webServer nicht startet):

```bash
# Terminal 1: Server starten
NODE_ENV=test npm run dev

# Terminal 2: Tests ausführen
NODE_ENV=test npx playwright test
```

---

### Error: "Test helper routes not found (404)"

Stelle sicher, dass `NODE_ENV=test` gesetzt ist:

```bash
# ❌ Falsch (NODE_ENV fehlt)
npx playwright test

# ✅ Richtig
NODE_ENV=test npx playwright test
```

Die Test-Helper-Routes (`/api/test/*`) werden nur bei `NODE_ENV=test` registriert.

---

### Error: "Database connection failed"

Prüfe `.env.local`:

```bash
# Test ob DB erreichbar ist
psql $DATABASE_URL -c "SELECT 1;"
```

---

## 📊 Test-Reports

### HTML Report (nach fehlgeschlagenen Tests)

```bash
npx playwright show-report
```

Öffnet interaktiven HTML-Report mit:
- Screenshots (bei Fehlern)
- Traces (Browser-Events)
- Logs (Console, Network)

---

### JSON Report (für CI/CD)

```bash
NODE_ENV=test npx playwright test --reporter=json > test-results.json
```

---

## 🧹 Cleanup (nach Tests)

Tests erstellen echte Daten in der Test-DB.

**Manuelle Bereinigung**:

```bash
# Test-User löschen
psql $DATABASE_URL -c "DELETE FROM users WHERE email LIKE 'test-%@example.com';"

# Test-Jobs löschen
psql $DATABASE_URL -c "DELETE FROM jobs WHERE customer_name = 'Test Customer';"

# Oder: Gesamte Test-DB zurücksetzen
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

---

## ✅ Erwartete Test-Ergebnisse

Alle 5 Szenarien sollten **PASS** sein:

| Scenario | Beschreibung | Expected Result |
|----------|--------------|-----------------|
| 1 | Client downloads `selectionState='included'` | **200 OK** + presigned URL |
| 2 | Client versucht Download von fremden Files | **403 Forbidden** |
| 3 | Admin bypassed Ownership-Check | **200 OK** |
| 4 | Client versucht Download von `selectionState='none'` | **403 Forbidden** |
| 5 | Client downloads `selectionState='extra_free'` | **200 OK** |

---

## 🔒 Sicherheits-Hinweise

1. **Niemals Production-DB verwenden**: Tests erstellen/löschen Daten
2. **NODE_ENV=test erforderlich**: Test-Helper-Routes nur in test-mode
3. **Secrets in .env.local**: Keine Secrets in Git committen

---

## 📚 Weitere Infos

- **Detaillierte Doku**: `e2e/README.md`
- **Test-Code**: `e2e/download-auth.spec.ts`
- **Fixtures**: `e2e/helpers/fixtures.ts`
- **Auth-Helpers**: `e2e/helpers/auth.ts`

---

## 🚨 WICHTIG: Warum nicht in Replit?

Playwright benötigt Browser-Binaries mit System-Dependencies:

```
libglib2.0-0
libnss3
libx11-6
libx11-xcb1
libxcb1
libxcomposite1
libxcursor1
libxdamage1
libxext6
libxfixes3
libxi6
libxrandr2
libxrender1
libxss1
libxtst6
```

Diese können in Replit **nicht ohne sudo** installiert werden.

**Lösung**: Tests lokal oder in CI/CD (GitHub Actions) ausführen.

---

**Last Updated**: 2025-01-14
