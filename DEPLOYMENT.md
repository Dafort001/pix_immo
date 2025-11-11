# Deployment Guide - pix.immo Cloudflare Workers

Vollständige Deployment-Dokumentation für Preview/Production mit Canary-Rollout (HALT B1).

---

## 1. Übersicht

**Frontend:**
- Cloudflare Pages (Preview + Production)
- Build: Vite → `dist/public`
- Domains: `pix-immo.pages.dev` (Preview), `www.pix.immo` (Production)

**Backend:**
- Cloudflare Workers (Edge API)
- Canary-Routing: B1a (GET routes), B1b (Upload routes)
- Proxy-Fallback: Alt-Backend (Express) für alle nicht-nativen Routen
- R2 Storage: `piximmo-media` (Signed PUT/GET URLs)

**Architektur:**
```
Client → Cloudflare Workers (Canary + Proxy) → Origin (Express)
                    ↓
               R2 Storage (piximmo-media)
```

**Kein E2E-Test nötig für Deployment** - Integration-Tests validieren Parity lokal.

---

## 2. Voraussetzungen

### Cloudflare Account Setup
- ✅ Cloudflare Workers Account (kostenfrei oder Paid Plan)
- ✅ Cloudflare Pages Account (verbunden mit GitHub Repo)
- ✅ R2 Storage aktiviert (Bucket: `piximmo-media`)

### Repository
- ✅ `wrangler.toml` vorhanden (Routes, R2 Bindings)
- ✅ `.env.example` dokumentiert alle ENV-Variablen
- ✅ Secrets lokal NICHT committed (`.env` in `.gitignore`)

### Secrets (Cloudflare Dashboard)
Folgende Secrets müssen gesetzt sein:

**Workers Secrets:**
```bash
wrangler secret put JWT_SECRET              # Session/Auth Secret
wrangler secret put DATABASE_URL            # Neon PostgreSQL URL
wrangler secret put SESSION_SECRET          # Express Session Secret
wrangler secret put ORIGIN_API_BASE         # Alt-Backend URL (z.B. https://api.pix.immo)
```

**Pages Environment Variables:**
- Preview + Production separat konfigurieren (siehe Abschnitt 3)

### CORS & Cookies
- ✅ `ALLOWED_ORIGINS` in `wrangler.toml` enthält Preview + Production Domains
- ✅ `COOKIE_SAMESITE=None` (Cross-Origin)
- ✅ `COOKIE_SECURE=true` (HTTPS-only)

---

## 3. Environment-Variablen

### Cloudflare Pages - Preview
```bash
VITE_API_BASE_URL=https://api-preview.pix.immo
VITE_APP_ENV=preview
VITE_FEATURE_QA_GUARD=true                  # Aktiviert /qa Route
VITE_STRIPE_PUBLIC_KEY=<Preview Key>
```

### Cloudflare Pages - Production
```bash
VITE_API_BASE_URL=https://api.pix.immo
VITE_APP_ENV=production
VITE_FEATURE_QA_GUARD=false                 # Deaktiviert /qa Route
VITE_STRIPE_PUBLIC_KEY=<Production Key>
```

### Cloudflare Workers - `wrangler.toml` [vars]
```toml
[env.preview.vars]
ORIGIN_API_BASE = "https://api-preview.pix.immo"  # oder Secret
ALLOWED_ORIGINS = "https://pix-immo.pages.dev,https://preview.pix.immo"
COOKIE_SAMESITE = "None"
COOKIE_SECURE = "true"
PHASE_B1B_ENABLED = "true"                  # Aktiviert Upload-Routes

[env.production.vars]
ORIGIN_API_BASE = "https://api.pix.immo"
ALLOWED_ORIGINS = "https://www.pix.immo,https://pix.immo"
COOKIE_SAMESITE = "None"
COOKIE_SECURE = "true"
PHASE_B1B_ENABLED = "true"
```

**Wichtig:** `ORIGIN_API_BASE` kann auch als Secret gesetzt werden:
```bash
wrangler secret put ORIGIN_API_BASE --env preview
wrangler secret put ORIGIN_API_BASE --env production
```

---

## 4. Build & Deploy

### 4.1 Frontend (Cloudflare Pages)

**Preview-Deployment:**
```bash
# Automatisch bei Git Push (GitHub Integration)
git push origin feature/branch-name

# Oder manuell via Script
./scripts/deploy-frontend.sh preview
```

**Ergebnis:**
- Preview-URL: `https://<commit-hash>.pix-immo.pages.dev`
- Auto-Deploy bei jedem Push

**Production-Deployment:**
```bash
# Nach erfolgreichem QA-Check auf Preview
# Cloudflare Dashboard → Pages → Production → Promote Deployment
```

### 4.2 Workers (Cloudflare Edge API)

**Preview-Deployment:**
```bash
# Deploy to preview environment
wrangler deploy --env preview

# Verify deployment
curl https://api-preview.pix.immo/healthz
# Expected: {"status":"ok","worker":"edge","phase":{"b1a":true,"b1b":true}}
```

**Production-Deployment:**
```bash
# Deploy to production (nach GO-Entscheidung)
wrangler deploy --env production

# Verify deployment
curl https://api.pix.immo/healthz
```

**Canary-Header (nur intern für QA):**
```bash
# Test native handlers (Canary-Route)
curl -H "X-Canary: 1" https://api-preview.pix.immo/api/jobs

# Test proxy fallback (ohne Header)
curl https://api-preview.pix.immo/api/jobs
```

---

## 5. Canary-Rollout (HALT B1)

### Phase B1a - GET Routes (Read-Only)
Native Worker-Handler für folgende Routen:
- `GET /api/shoots/:shootId/stacks` - Photo Stacks
- `GET /api/shoots/:shootId/images` - Images in Stack
- `GET /api/jobs` - All Jobs (gefiltert nach User)
- `GET /api/jobs/:jobId` - Single Job Details

**Aktivierung:**
- Header: `X-Canary: 1` (nur für QA/Testing)
- Ohne Header: Proxy an `ORIGIN_API_BASE`

### Phase B1b - Upload Routes
Native Worker-Handler für Upload-Flow:
- `POST /api/pixcapture/upload/intent` - Generate Signed R2 URL
- `POST /api/pixcapture/upload/finalize` - Verify R2 + DB Finalization

**Aktivierung:**
- ENV: `PHASE_B1B_ENABLED=true`
- Header: `X-Canary: 1`

**Parity-Garantie:**
- Antworten identisch zu Origin (Schema, Status, Headers)
- Integration-Tests validieren Parity lokal (Task 8)

### Rollout-Strategie (geplant für HALT B2)
1. **10% Traffic** - Canary-Header + 10% Random Traffic
2. **50% Traffic** - Monitor Errors/Latency
3. **100% Traffic** - Full Native, Proxy nur für Legacy-Routes

**Aktuell (B1):**
- Canary nur via Header `X-Canary: 1` (nicht production-exposed)
- Kein automatisches Traffic-Splitting

---

## 6. Smoke-/QA-Checks (Preview)

### QA-Route aufrufen
```bash
# Nur bei VITE_FEATURE_QA_GUARD=true verfügbar
https://pix-immo.pages.dev/qa
```

**PASS-Kriterien:**
- ✅ API-URL korrekt erkannt (`VITE_API_BASE_URL`)
- ✅ CORS/Preflight kein `TypeError` (401/403 erlaubt)
- ✅ Credentials-Check: 200 (eingeloggt) oder 401 (nicht eingeloggt)
- ✅ Signed-URL Dry-Run: SKIP ohne Login (kein 5xx Error)

**Ergebnis dokumentieren:**
- Datei: `QA/GO_NO_GO_FINAL.md`
- Format: Tabelle mit Testfall, Status (PASS/FAIL), Bemerkungen

**Beispiel QA-Ergebnis:**
```markdown
| Test | Status | Bemerkung |
|------|--------|-----------|
| API-URL | PASS | https://api-preview.pix.immo |
| CORS Preflight | PASS | OPTIONS 204 No Content |
| Credentials | PASS | 401 Unauthorized (not logged in) |
| Signed URL | SKIP | Requires login |
```

---

## 7. CORS & Cookies

### CORS-Konfiguration (Workers)
```typescript
// workers/edge.ts - CORS Middleware
Access-Control-Allow-Origin: <origin>       // Dynamisch aus ALLOWED_ORIGINS
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Canary, X-Device-Token, Cookie, X-Requested-With
Access-Control-Expose-Headers: Set-Cookie, X-RateLimit-Limit, X-RateLimit-Remaining
Access-Control-Max-Age: 86400              // 24 Stunden
```

**Preflight (OPTIONS):**
- Status: `204 No Content`
- Kein Body erforderlich

### Cookie-Konfiguration
```typescript
// Session-Cookie Settings
Set-Cookie: auth_session=<token>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

**Wichtig:**
- `SameSite=None` erforderlich für Cross-Origin (Pages ≠ Workers Domain)
- `Secure=true` nur über HTTPS (automatisch bei Cloudflare)
- `HttpOnly=true` verhindert XSS-Angriffe

### R2-CORS (Bucket-Level)
```json
{
  "AllowedOrigins": ["https://www.pix.immo", "https://pix-immo.pages.dev"],
  "AllowedMethods": ["GET", "PUT"],
  "AllowedHeaders": ["Content-Type", "Content-MD5", "x-amz-*"],
  "ExposeHeaders": ["ETag", "Location"],
  "MaxAgeSeconds": 3600
}
```

**Konfiguration via Cloudflare Dashboard:**
1. R2 → Bucket `piximmo-media` → Settings → CORS
2. JSON oben einfügen

---

## 8. Rollback

### Frontend-Rollback (Cloudflare Pages)
1. Cloudflare Dashboard → Pages → `pix-immo` → Deployments
2. Vorherige Deployment auswählen → **"Revert to this deployment"**
3. Bestätigen

**Ergebnis:**
- Sofortiges Rollback (< 1 Minute)
- Keine Code-Änderungen nötig

### Workers-Rollback (Canary deaktivieren)
**Option 1: Canary-Header entfernen (0% native)**
- Alle Requests proxied an `ORIGIN_API_BASE`
- Kein Deployment erforderlich

**Option 2: PHASE_B1B_ENABLED deaktivieren**
```bash
# wrangler.toml anpassen
PHASE_B1B_ENABLED = "false"

# Re-deploy
wrangler deploy --env production
```

**Option 3: Vorherige Worker-Version deployen**
```bash
# Git History prüfen
git log --oneline workers/edge.ts

# Checkout vorherige Version
git checkout <commit-hash> workers/

# Re-deploy
wrangler deploy --env production
```

### Alt-Backend (Express)
- **Bleibt unverändert erreichbar** unter `ORIGIN_API_BASE`
- Keine Rollback-Aktion erforderlich

---

## 9. Troubleshooting

### 401/403 in Preview - Session/Cookies
**Problem:** Requests fehlschlagen mit 401 Unauthorized

**Lösungen:**
1. **SameSite-Cookie prüfen:**
   ```bash
   # Browser DevTools → Application → Cookies
   # Verify: SameSite=None, Secure=true
   ```

2. **Domain-Mismatch:**
   - Pages: `pix-immo.pages.dev`
   - Workers: `api-preview.pix.immo`
   - Cookie muss `Domain=.pix.immo` haben (nicht subdomain-spezifisch)

3. **CORS Preflight:**
   ```bash
   curl -X OPTIONS https://api-preview.pix.immo/api/jobs \
     -H "Origin: https://pix-immo.pages.dev" \
     -H "Access-Control-Request-Method: GET"
   # Expected: 204 No Content
   ```

### CORS-TypeError
**Problem:** `TypeError: Failed to fetch` im Browser

**Lösungen:**
1. **Origin fehlt in ALLOWED_ORIGINS:**
   ```toml
   # wrangler.toml
   ALLOWED_ORIGINS = "https://pix-immo.pages.dev,https://preview.pix.immo"
   ```

2. **Preflight nicht korrekt:**
   - OPTIONS-Route muss `204 No Content` zurückgeben
   - Keine Auth-Prüfung bei Preflight

### Upload 409 bei finalize
**Problem:** `POST /api/pixcapture/upload/finalize` gibt 409 Conflict

**Ursache:**
- R2 HEAD-Check fehlgeschlagen (Objekt nicht gefunden)

**Lösungen:**
1. **Intent neu ausführen:**
   ```bash
   POST /api/pixcapture/upload/intent
   # → signedUrl generieren
   
   PUT <signedUrl>
   # → Datei hochladen
   
   POST /api/pixcapture/upload/finalize
   # → Jetzt sollte R2 HEAD erfolgreich sein
   ```

2. **R2-Bucket prüfen:**
   - Cloudflare Dashboard → R2 → `piximmo-media`
   - Objekt manuell suchen

### Signed URL 410/403
**Problem:** Signed URL gibt 410 Gone oder 403 Forbidden

**Ursache:**
- TTL abgelaufen (5 Minuten Default)

**Lösung:**
```bash
# Intent neu anfordern
POST /api/pixcapture/upload/intent
# → Neue signedUrl mit frischem TTL
```

### 5xx Spike (Proxy-Timeout/Origin Down)
**Problem:** Massive 502/504 Errors

**Sofort-Maßnahmen:**
1. **Canary auf 0% setzen:**
   - Alle Requests via Proxy
   - Keine nativen Handler

2. **Origin-Health prüfen:**
   ```bash
   curl https://api.pix.immo/healthz
   # Expected: 200 OK
   ```

3. **Cloudflare Analytics prüfen:**
   - Dashboard → Workers → Analytics → Errors
   - Filter: Last 1 hour, Group by: Status Code

---

## 10. Verifikation (Checkliste vor Production)

### Pre-Deploy Checklist
- [ ] `/qa` = PASS (kein Rollback-Banner, alle Checks grün)
- [ ] GET-Routen Parity OK (Canary vs Proxy identisch)
- [ ] intent/finalize Parity OK (Schema + Status)
- [ ] `ALLOWED_ORIGINS` korrekt (Preview + Production Domains)
- [ ] Secrets gesetzt (`JWT_SECRET`, `DATABASE_URL`, `ORIGIN_API_BASE`)
- [ ] `README.md` + `DEPLOYMENT.md` aktuell
- [ ] `wrangler.toml` keine Secrets hardcoded
- [ ] R2-CORS konfiguriert (Bucket `piximmo-media`)

### Post-Deploy Verification
```bash
# 1. Health Check
curl https://api.pix.immo/healthz
# Expected: {"status":"ok","worker":"edge"}

# 2. Canary GET (mit Header)
curl -H "X-Canary: 1" https://api.pix.immo/api/jobs
# Expected: 200 OK (oder 401 wenn nicht eingeloggt)

# 3. Proxy GET (ohne Header)
curl https://api.pix.immo/api/jobs
# Expected: 200 OK (identisch zu Canary)

# 4. Upload Intent (mit Session Cookie)
curl -X POST https://api.pix.immo/api/pixcapture/upload/intent \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_session=<token>" \
  -d '{"filename":"test.jpg","mimeType":"image/jpeg","fileSize":1024}'
# Expected: 200 OK mit signedUrl
```

### Monitoring (Post-Deploy)
- **Cloudflare Analytics:** Workers → Analytics → Requests/Errors (24h)
- **Error Rate:** < 1% (akzeptabel für Canary-Phase)
- **Latency:** p95 < 500ms
- **CORS Errors:** 0 (kritisch, sofort fixen)

---

## Anhang: Nützliche Kommandos

### Wrangler CLI
```bash
# Secrets verwalten
wrangler secret put <NAME> --env preview
wrangler secret list --env production

# Logs live verfolgen
wrangler tail --env production

# Deployment History
wrangler deployments list

# Rollback zu vorheriger Version
wrangler rollback --message "Rollback wegen 5xx Spike"
```

### R2 CLI
```bash
# Objekte auflisten
wrangler r2 object list piximmo-media --prefix "pixcapture/uploads/"

# Objekt herunterladen
wrangler r2 object get piximmo-media/pixcapture/uploads/test.jpg --file=./test.jpg

# Objekt löschen
wrangler r2 object delete piximmo-media/pixcapture/uploads/test.jpg
```

### Debugging
```bash
# Worker Logs (Echtzeit)
wrangler tail --env production --format pretty

# Spezifische Route debuggen
wrangler tail --env production --format pretty --grep "/api/uploads/intent"

# Headers inspizieren
curl -v https://api.pix.immo/api/jobs
```

---

## Support & Eskalation

**Bei kritischen Issues (5xx Spike, CORS-Errors):**
1. **Sofort:** Canary auf 0% setzen (Proxy-Only)
2. **Eskalation:** Cloudflare Support Ticket (Enterprise Plan)
3. **Kommunikation:** Status-Update an Team via Slack/Email

**Nicht-kritische Issues:**
- GitHub Issues erstellen (Label: `deployment`, `cloudflare`)
- Task-Board aktualisieren (HALT Tracking)

---

**Letzte Aktualisierung:** 2025-01-15 (HALT B1 - Canary-Routing)  
**Nächster Review:** Nach HALT B2 (Traffic-Splitting 10% → 100%)
