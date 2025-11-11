# Statuscheck HALT 0–QA0
**Datum:** 11. November 2025  
**Branch:** main  
**Ziel:** Vollständige Erfassung des Umsetzungsstands aller Halte (0–QA0)

---

## Status-Tabelle

| Halt | Beschreibung | Status | Anmerkung |
|------|--------------|--------|-----------|
| **Backend-Core** | | | |
| Auth | Session-based Auth (Scrypt, HTTP-only cookies) | ✅ | `server/auth.ts` vorhanden, replit.md dokumentiert |
| Storage | PostgreSQL (Neon) + Drizzle ORM | ✅ | `shared/schema.ts` (63KB), DB-Push funktioniert |
| Upload | Multi-format upload (JPEG/PNG/HEIC + 13 RAW) | ✅ | `server/uploadHandler.ts`, R2 integration |
| Booking | Service Catalog + Multi-step Wizard | ✅ | Laut replit.md "COMPLETED + E2E tested" |
| Job Dedup | Server-side ULID-based deduplication | ✅ | replit.md dokumentiert, 409 Conflict bei Duplikaten |
| Filename v3.1 | Standardized naming pattern | ✅ | `shared/filename-v31.ts` (8.8KB) |
| Sidecar Export | CRM-compatible object_meta.json + alt_text.txt | ✅ | `shared/sidecar-export.ts` (8.5KB) |
| | | | |
| **B0 – CORS/Infra** | | | |
| CORS | Cross-origin headers für Cloudflare Pages | ✅ | `server/index.ts` (Hono), `server/routes.ts` (Express) |
| Cookies | SameSite=None, Secure, credentials:include | ✅ | In beiden CORS configs vorhanden |
| Preflight | OPTIONS handling | ✅ | Hono cors() + Express cors() middleware |
| | | | |
| **F3 – Frontend Deployment** | | | |
| Runtime Config | getApiBaseUrl(), getAppEnv() | ✅ | `client/src/config/runtime.ts` (1.3KB) |
| Build API URL | buildApiUrl() mit absolute URL detection | ✅ | `client/pixcapture/src/lib/queryClient.ts` (architect-reviewed) |
| SPA Routing | _redirects für Cloudflare Pages | ✅ | `client/public/_redirects` (116 bytes) |
| Cache Headers | _headers mit no-cache für index.html | ✅ | `client/public/_headers` (594 bytes) |
| ENV Examples | .env.production.example + .env.preview.example | ✅ | Beide vorhanden, VITE_API_BASE_URL dokumentiert |
| Build Check | scripts/check-deploy.js | ✅ | Build erfolgreich (dist/public/index.html 3.6KB) |
| README | Cloudflare Pages Deployment-Anleitung | ✅ | README.md erweitert mit Troubleshooting |
| | | | |
| **QA0 – Preview Smoketests** | | | |
| Feature Flags | FEATURE_QA_GUARD (ENV-gesteuert) | ✅ | `client/src/config/flags.ts` (273 bytes) |
| Smoke Checks | useSmokeChecks Hook (5 Checks) | ✅ | `client/src/hooks/useSmokeChecks.ts` (5.8KB) |
| Health Panel | HealthCheckPanel UI Component | ✅ | `client/src/qa/HealthCheckPanel.tsx` (5KB) |
| Rollback Banner | RollbackBanner bei FAIL | ✅ | `client/src/components/RollbackBanner.tsx` (2KB) |
| /qa Route | QA Page Component | ✅ | `client/src/routes/qa.tsx` (2.1KB) |
| App Integration | Route in App.tsx registriert | ❌ | **FEHLT** - Route nicht in beiden SPAs integriert |
| Header Link | QA-Link in Navigation (Flag-basiert) | ❌ | **FEHLT** - Keine Header-Integration |
| i18n Keys | QA-Texte (de/en) | ❌ | **FEHLT** - Keine i18n-Integration |
| README QA0 | QA0-Abschnitt mit Troubleshooting | ❌ | **FEHLT** - README nicht erweitert |

---

## Zusammenfassung

**Umsetzungsstand: 24 von 28 Punkten abgeschlossen (85,7%)**

### Vollständig ✅
- **Backend-Core (7/7)**: Alle Features implementiert, dokumentiert und laut replit.md teilweise E2E-getestet
- **B0 – CORS/Infra (3/3)**: CORS-Middleware in beiden Servern (Hono + Express), SameSite=None konfiguriert
- **F3 – Frontend Deployment (7/7)**: Build-System produktionsreif, architect-reviewed, check-deploy.js erfolgreich

### Unvollständig ⚠️
- **QA0 – Preview Smoketests (7/11)**: Core-Komponenten fertig, aber **App-Integration fehlt**

### Fehlende Punkte ❌
1. **App.tsx Integration**: `/qa` Route in `client/src/App.tsx` + `client/pixcapture/src/App.tsx` registrieren
2. **Header/Navigation**: QA-Link hinzufügen (nur wenn `FEATURE_QA_GUARD=true`)
3. **i18n Keys**: QA-Texte in `client/src/lib/i18n/translations.ts` (de/en)
4. **README QA0**: Abschnitt mit Smoke-Check-Erklärung und Troubleshooting

### Quick-Fix Möglich
**Ja** – Alle 4 fehlenden Punkte können in ~30-45 Minuten nachgeholt werden:
- App Integration: 2 Dateien editieren (10 Min)
- Header Link: Navigation-Component erweitern (10 Min)
- i18n: 8-10 Keys hinzufügen (10 Min)
- README: 1 Abschnitt schreiben (10 Min)

### Deployment-Readiness
- **Build**: ✅ Erfolgreich (`dist/public/index.html` 3.6KB)
- **Frontend**: ✅ Produktionsreif für Cloudflare Pages
- **Backend**: ✅ CORS konfiguriert, kann mit CF Pages kommunizieren
- **QA**: ⚠️ Komponenten fertig, aber nicht im UI sichtbar (Route fehlt)

### Handlungsempfehlung
1. **Sofort deploybar**: Frontend kann auf Cloudflare Pages deployed werden (F3 abgeschlossen)
2. **QA0 vervollständigen**: Quick-Fix (~45 Min) für vollständige Preview-Smoke-Checks
3. **Testing**: Keine E2E-Tests nötig (laut Weisung), manuelle Verifikation ausreichend

---

## Definition of Done – Check

### F3 (Cloudflare Pages Deployment)
- [x] `dist/public/index.html` exists
- [x] `dist/public/_redirects` exists (SPA routing)
- [x] `dist/public/_headers` exists (caching rules)
- [x] Environment variables documented (.env.*.example)
- [x] README mit Deployment-Guide
- [x] Build-Check-Script funktioniert
- [x] Architect-Review passed (buildApiUrl() robust)

### QA0 (Preview Smoketests)
- [x] Feature Flag System (flags.ts)
- [x] Smoke Checks Hook (useSmokeChecks.ts)
- [x] Health Panel Component (HealthCheckPanel.tsx)
- [x] Rollback Banner Component (RollbackBanner.tsx)
- [x] QA Route Component (qa.tsx)
- [ ] **Route in App.tsx registriert** ❌
- [ ] **Header/Navigation mit QA-Link** ❌
- [ ] **i18n Keys für QA-Texte** ❌
- [ ] **README QA0-Abschnitt** ❌

### B0 (CORS/Infra)
- [x] CORS-Middleware in server/index.ts (Hono)
- [x] CORS-Middleware in server/routes.ts (Express)
- [x] SameSite=None + Secure Cookies
- [x] Preflight (OPTIONS) handling

---

## Nächste Schritte

**Option 1: QA0 Quick-Fix (empfohlen)**
1. App.tsx Integration (beide SPAs)
2. Header-Link hinzufügen
3. i18n Keys erweitern
4. README QA0-Abschnitt
→ **Dauer: ~45 Minuten**

**Option 2: Deployment ohne QA0**
1. Frontend direkt auf Cloudflare Pages deployen
2. QA0 nachträglich integrieren
→ `/qa` Route existiert, ist aber nicht erreichbar

---

**Status-Check abgeschlossen.**  
**Nächster HALT:** QA0 Quick-Fix oder B1 (Backend Migration zu CF Workers)
