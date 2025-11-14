# E2E Tests – Download Authorization (P1)

## Overview

End-to-End tests für **P0 Download Authorization** Security-Feature. Verifiziert Ownership-Checks und selectionState-basierte Zugriffsrechte.

---

## Test Scenarios (5 total)

### ✅ Scenario 1: Client can download own selected images
- Client erstellt Job + File mit `selectionState='included'`
- Download via `/api/files/{id}/download` → **200 OK** mit presigned URL

### ✅ Scenario 2: Client cannot download other client's images
- Client 1 erstellt Job + File
- Client 2 versucht Download → **403 Forbidden**

### ✅ Scenario 3: Admin can download any images (bypass)
- Client erstellt Job + File
- Admin wird via `/api/test/promote-admin` promoted
- Admin lädt File herunter → **200 OK** (Ownership-Check bypassed)

### ✅ Scenario 4: Client cannot download unselected images
- Client erstellt File mit `selectionState='none'`
- Download-Versuch → **403 Forbidden**

### ✅ Scenario 5: Client can download extra_free (kulanz) images
- Client erstellt File mit `selectionState='extra_free'`
- Download via `/api/files/{id}/download` → **200 OK**

---

## Architecture

### Storage-Backed Test Helpers (NODE_ENV guards)

Tests verwenden **Storage-Layer-Methoden** statt direkter DB-Zugriffe:

**server/storage.ts** (Lines 4140-4233):
```typescript
async createJobForTests(userId: string, data: {
  propertyName: string;
  includedImages?: number;
  allImagesIncluded?: boolean;
}): Promise<Job>

async createUploadedFileForTests(data: {
  userId: string;
  orderId: string;
  originalFilename: string;
  selectionState?: 'none' | 'included' | 'extra_free' | 'blocked';
  isCandidate?: boolean;
}): Promise<UploadedFile>
```

**Sicherheit**: 
- Beide Methoden werfen Error wenn `process.env.NODE_ENV !== 'test'`
- Audit-Logs werden korrekt emittiert
- Selection-Stats werden aktualisiert
- Domain-Logik bleibt intakt

---

### Test Helper Routes (Lines 1094-1177 in server/routes.ts)

Nur verfügbar wenn `process.env.NODE_ENV === 'test'`:

```typescript
POST /api/test/create-job
Body: { propertyName, includedImages?, allImagesIncluded? }
Returns: Job

POST /api/test/create-file
Body: { orderId, originalFilename, selectionState?, isCandidate? }
Returns: UploadedFile

POST /api/test/promote-admin
Body: { email }
Returns: User (with role='admin')
```

**Sicherheit**:
- Alle Routes erfordern Authentifizierung
- Nur in test-environment registriert (`if (process.env.NODE_ENV === 'test')`)
- Keine Secrets/Tokens in Response-Bodies

---

### E2E Test Fixtures (e2e/helpers/fixtures.ts)

```typescript
createTestJob(page: Page, data): Promise<TestJob>
createTestFile(page: Page, data): Promise<TestFile>
```

Beide Funktionen rufen die Test-Helper-Routes auf (kein direkter DB-Zugriff).

---

### Auth Helpers (e2e/helpers/auth.ts)

```typescript
registerUser(page: Page, user: TestUser): Promise<void>
loginUser(page: Page, user: TestUser): Promise<void>
logoutUser(page: Page): Promise<void>
createTestUser(role: 'client' | 'admin', suffix?: string): TestUser
```

Verwenden Session-basierte Auth (`/api/auth/register`, `/api/auth/login`).

---

## Running Tests

### Prerequisites

```bash
# Install Playwright browsers (ONLY on local machine, NOT in Replit)
npx playwright install
```

**Replit Limitation**: Browser-Dependencies (`libglib2.0`, `libnss3`, `libx11-6`, etc.) sind in Replit nicht installierbar. Tests müssen lokal oder in CI/CD (GitHub Actions) ausgeführt werden.

---

### Local Execution

```bash
# Set NODE_ENV to 'test' (enables test helper routes)
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts

# Run with UI mode (interactive debugging)
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts --ui

# Run with headed browser (visible Chrome window)
NODE_ENV=test npx playwright test e2e/download-auth.spec.ts --headed

# Run specific scenario
NODE_ENV=test npx playwright test -g "Scenario 1"
```

---

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: NODE_ENV=test npx playwright test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          SESSION_SECRET: test-secret-key
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Configuration

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**webServer**: Startet automatisch `npm run dev` vor Test-Ausführung.

---

## Debugging Failed Tests

### 1. Check Playwright HTML Report

```bash
# Nach fehlgeschlagenen Tests:
npx playwright show-report
```

Zeigt Screenshots, Traces und Logs pro Test-Szenario.

---

### 2. Enable Verbose Logging

```bash
DEBUG=pw:api NODE_ENV=test npx playwright test
```

Zeigt alle HTTP-Requests und Browser-Interaktionen.

---

### 3. Use UI Mode for Step-Through Debugging

```bash
NODE_ENV=test npx playwright test --ui
```

Ermöglicht:
- Schritt-für-Schritt-Ausführung
- Live-DOM-Inspektion
- Network-Tab für API-Calls

---

## Test Data Cleanup

**Wichtig**: Tests erstellen echte Daten in der Test-Database. 

### Manual Cleanup (after local runs)

```bash
# Delete test users/jobs (PostgreSQL)
psql $DATABASE_URL -c "DELETE FROM users WHERE email LIKE 'test-%@example.com';"
psql $DATABASE_URL -c "DELETE FROM jobs WHERE customer_name = 'Test Customer';"
```

### Automatic Cleanup (Future Enhancement)

```typescript
// e2e/helpers/cleanup.ts (NOT IMPLEMENTED)
export async function cleanupTestData() {
  // Delete all test users/jobs created in this test run
  // Use timestamps or test-specific markers
}
```

**TODO**: Implement `afterAll()` Hook in test spec für automatische Bereinigung.

---

## Architecture Review Status

✅ **Architect Approved** (2025-01-14):
- Storage-backed helpers preserve domain logic
- Test helpers correctly forward all parameters (includedImages, allImagesIncluded, selectionState='none')
- NODE_ENV guards prevent production misuse
- No security concerns identified

---

## Known Limitations

### 1. Replit Environment

❌ **Cannot execute tests in Replit** due to missing browser dependencies.

**Workaround**: Run tests locally or in CI/CD.

---

### 2. Test Database State

⚠️ Tests create real data in test database (not isolated).

**Impact**: Multiple test runs create duplicate users/jobs.

**Mitigation**: Implement cleanup hooks or use unique test database per run.

---

### 3. R2 Object Storage

⚠️ Test files use `objectKey: test/{ulid}.jpg` (not real uploads).

**Impact**: Download URLs are presigned, but files don't exist in R2.

**Mitigation**: Tests only verify authorization logic, not actual file delivery.

---

## Related Documentation

- **P0 Security**: `docs/SECURITY_IMPLEMENTATION.md`
- **P1 Status**: `docs/P1_IMPLEMENTATION_STATUS.md`
- **Audit Logs**: `docs/AUDIT_LOG_IMPLEMENTATION.md`
- **Gallery Flow**: `docs/GALLERY_FLOW_UPLOADEDFILES.md`

---

## Summary

| Component | Status | Location |
|-----------|--------|----------|
| Test Specs | ✅ Complete | `e2e/download-auth.spec.ts` |
| Auth Helpers | ✅ Complete | `e2e/helpers/auth.ts` |
| Fixtures | ✅ Complete | `e2e/helpers/fixtures.ts` |
| Storage Helpers | ✅ Complete | `server/storage.ts` (Lines 4140-4233) |
| Test Routes | ✅ Complete | `server/routes.ts` (Lines 1094-1177) |
| Playwright Config | ✅ Complete | `playwright.config.ts` |
| CI/CD Integration | ⏸️ Pending | `.github/workflows/e2e-tests.yml` |

**Production Readiness**: ✅ Infrastructure complete, tests runnable locally/CI.

**Last Updated**: 2025-01-14
