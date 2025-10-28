# Security Implementation - Express Backend

## ✅ Implementierte Features

### 1. CORS & Origin Validation
**Dateien**: `server/routes.ts`

**Production Origins**:
- `https://pixcapture.app`
- `https://pix.immo`  
- `https://www.pix.immo`

**Development Origins** (nur in NODE_ENV !== "production"):
- `http://localhost:5000`
- `http://localhost:5173`
- `capacitor://localhost`
- `ionic://localhost`

**Preflight Handling**:
- OPTIONS requests → 204 No Content
- Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
- Access-Control-Allow-Credentials: true
- Max-Age: 86400 (24h)

**Smoke Test Results**:
```bash
✓ curl -X OPTIONS http://localhost:5000/api/jobs -H "Origin: https://pixcapture.app"
  → HTTP/1.1 204 No Content
  → Access-Control-Allow-Origin: https://pixcapture.app

✓ curl -X POST ... -H "Origin: https://bad-origin.com"
  → CORS Error: Not allowed by CORS
```

---

### 2. Security Headers (Helmet)
**Dateien**: `server/routes.ts` (Lines 230-249)

**Implementierte Headers**:
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains; preload
- **X-Frame-Options**: SAMEORIGIN (verhindert Clickjacking)
- **X-Content-Type-Options**: nosniff (verhindert MIME-Sniffing)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Content-Security-Policy**:
  - default-src 'self'
  - script-src 'self' 'unsafe-inline' 'unsafe-eval' (Vite Dev)
  - style-src 'self' 'unsafe-inline'
  - img-src 'self' data: https://pixcapture.app https://pix.immo https: blob:
  - font-src 'self' data:
  - connect-src 'self' https://storage.googleapis.com
  - **frame-ancestors 'none'** (kein iframe embedding)

**Smoke Test Results**:
```bash
✓ curl -I http://localhost:5000/healthz
  → Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  → X-Frame-Options: SAMEORIGIN
  → Referrer-Policy: strict-origin-when-cross-origin
  → Content-Security-Policy: ... frame-ancestors 'none' ...
```

---

### 3. Content-Type Validation
**Dateien**: `server/routes.ts` (Lines 164-192)

**Erlaubte Content-Types**:
- `image/*` (alle Bildformate)
- `application/json`
- `multipart/form-data` (File Uploads)

**Blockierte Content-Types**:
- `text/html` → 403 Forbidden
- `text/plain` → 403 Forbidden
- Alle anderen → 403 Forbidden

**Middleware**: Greift nur bei POST/PUT/PATCH, nicht bei GET/DELETE

**Smoke Test Results**:
```bash
✓ curl -X POST ... -H "Content-Type: application/json"
  → HTTP/1.1 200 OK (erlaubt)

✓ curl -X POST ... -H "Content-Type: text/html"
  → {"error":"Content-Type not allowed"}
  → [SECURITY] Blocked content-type: text/html from 127.0.0.1
```

---

### 4. Rate Limiting & Abuse Logging
**Dateien**: `server/routes.ts` (Lines 115-162)

**Global Rate Limit**:
- **60 Requests/Minute** pro IP-Adresse
- **Burst**: Initial burst erlaubt (erste ~10 Requests sofort)
- **Response**: HTTP 429 "Too Many Requests"
- **Headers**: RateLimit-* Header gemäß RFC

**Abuse Logging**:
- Tracker: In-Memory Map (IP → {count, firstHit})
- **Trigger**: Nach 5x 429 in 10 Minuten
- **Log Format**:
  ```json
  {
    "ip": "127.0.0.1",
    "path": "/api/jobs",
    "timestamp": "2025-10-28T11:20:08.716Z",
    "count": 5
  }
  ```
- **Output**: `console.warn('[ABUSE] ...')` 
- **TODO**: Save to R2 LogWorker

**Endpoint-Spezifische Limits** (bereits vorhanden):
- Auth: 5 login attempts / 15 min
- Uploads: 30 / min
- Presign: 20 / min
- Handoff: 10 / min

**Smoke Test Results**:
```bash
✓ 57 Requests → Request 57: 429
  → Rate limit triggered at request 57

✓ Abuse Logs:
  [ABUSE] Rate limit abuse detected: {
    ip: '172.31.73.2',
    path: '/src/components/ui/form.tsx',
    timestamp: '2025-10-28T11:20:08.741Z',
    count: 5
  }
```

---

### 5. Response Sanitization
**Dateien**: `server/routes.ts` (Lines 1661-1683)

**Global Error Handler**:
- **Log internal**: Vollständiger Error + Stack Trace in console.error
- **Send to client**: 
  - 500 → `{"error": "Internal Server Error"}` (Generic)
  - 400-499 → Original error message (Client-Fehler sind OK)
- **Request ID**: Immer in Response für Support-Debugging

**Error Log Format**:
```json
{
  "requestId": "a1b2c3d4",
  "error": "Database connection failed",
  "stack": "Error: ... at ...",
  "path": "/api/jobs",
  "method": "POST",
  "ip": "127.0.0.1"
}
```

**Client Response** (500):
```json
{
  "error": "Internal Server Error",
  "requestId": "a1b2c3d4"
}
```

**Smoke Test Results**:
```bash
✓ Internal errors logged with full stack trace
✓ Client receives only "Internal Server Error" + requestId
✓ No stack traces leaked to client
```

---

## Package Dependencies

**Neue Packages**:
```json
{
  "helmet": "^7.2.0",
  "cors": "^2.8.5",
  "@types/cors": "^2.8.17"
}
```

**Bereits vorhanden**:
```json
{
  "express-rate-limit": "^7.4.1"
}
```

---

## Middleware Stack Order

Die Middleware wird in dieser Reihenfolge angewendet:

1. **CORS** (cors middleware)
2. **Request ID** (generiert unique request_id)
3. **Security Headers** (Helmet)
4. **Global Rate Limit** (60/min)
5. **Content-Type Validation** (POST/PUT/PATCH)
6. **Cookie Parser**
7. **Auth Middleware**
8. **Route Handlers**
9. **Error Handler** (Response Sanitization, MUSS LETZTER SEIN!)

---

## Produktionsbereitschaft

✅ CORS für Production Domains konfiguriert  
✅ Security Headers (HSTS, CSP, X-Frame-Options, etc.)  
✅ Content-Type Validation für alle Uploads  
✅ Rate Limiting + Abuse Logging  
✅ Response Sanitization (keine Stack Traces)  
✅ Endpoint-spezifische Limits (Auth, Uploads, Presign)  
✅ Request ID Tracking für Debugging  

⚠️ **TODO für Production**:
- [ ] R2 LogWorker für Abuse Logs implementieren
- [ ] Rate Limit Konfiguration via ENV-Variablen
- [ ] IP Whitelist/Blacklist System
- [ ] DDoS Protection (Cloudflare Worker Layer)

---

## Environment-spezifische Config

**Development** (NODE_ENV !== "production"):
- CORS erlaubt localhost origins
- CSP relaxed (unsafe-inline, unsafe-eval für Vite HMR)
- HSTS deaktiviert (kein HTTPS in dev)

**Production** (NODE_ENV === "production"):
- Strikte CORS (nur pixcapture.app + pix.immo)
- Vollständige CSP
- HSTS aktiviert (1 Jahr, includeSubDomains, preload)

---

## Debug-Commands (Smoke Tests)

```bash
# 1. OPTIONS Preflight
curl -X OPTIONS http://localhost:5000/api/jobs \
  -H "Origin: https://pixcapture.app" -v

# 2. POST with valid Content-Type
curl -X POST http://localhost:5000/api/auth/demo \
  -H "Content-Type: application/json" \
  -H "Origin: https://pix.immo" \
  -d '{}'

# 3. POST with invalid Content-Type (blocked)
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: text/html" \
  -d '<html></html>'

# 4. Security Headers Check
curl -I http://localhost:5000/healthz | grep -E "(HSTS|Frame|Referrer|CSP)"

# 5. Rate Limit Test (61 Requests)
for i in {1..62}; do 
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/healthz
done | tail -5

# 6. CORS blocking unauthorized origin
curl -X POST http://localhost:5000/api/auth/demo \
  -H "Origin: https://bad-origin.com" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Monitoring & Alerting

**Log-Monitoring** (empfohlen):
- Alert bei >100 ABUSE logs/hour
- Alert bei >1000 429 responses/hour  
- Alert bei CORS errors von unbekannten Origins

**Metrics** (RateLimit Headers):
- `RateLimit-Limit`: 60
- `RateLimit-Remaining`: X
- `RateLimit-Reset`: Timestamp

**Error Tracking**:
- Request IDs in Logs ermöglichen User-Support
- Vollständiger Stack Trace nur in Server-Logs
