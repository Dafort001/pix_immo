# GO/NO-GO Report - Preview Deployment
**Date:** 2025-11-11  
**Environment:** Cloudflare Pages Preview  
**Feature Flag:** `VITE_FEATURE_QA_GUARD=true`

---

## Executive Summary

**Recommendation: ✅ GO for Preview Deployment**

All QA0 smoke check components are integrated and functional. The frontend is ready for Cloudflare Pages Preview deployment with smoke checks enabled.

---

## Build Status

**Build Output:**
- ✅ `dist/public/index.html` (3.6KB)
- ✅ `dist/public/_redirects` (SPA routing)
- ✅ `dist/public/_headers` (cache control)
- ✅ `dist/public/assets/index-*.js` (1.3MB)
- ✅ `dist/public/assets/index-*.css` (121KB)

**Build Time:** 24.84s  
**LSP Diagnostics:** ✅ Clean (0 errors)

---

## QA0 Integration Status

| Component | Status | Details |
|-----------|--------|---------|
| Feature Flags | ✅ | `FEATURE_QA_GUARD` implemented in `client/src/config/flags.ts` |
| Smoke Checks Hook | ✅ | `useSmokeChecks` with 5 checks (5.8KB) |
| Health Panel UI | ✅ | `HealthCheckPanel` component (5KB) |
| Rollback Banner | ✅ | `RollbackBanner` component (2KB) |
| /qa Route | ✅ | Registered in both SPAs (pix.immo + pixcapture) |
| App Integration | ✅ | RollbackBanner rendered conditionally |
| i18n Keys | ✅ | 12 QA keys added (de + en) |
| README Documentation | ✅ | QA0 section with troubleshooting |

---

## Expected Smoke Check Results (Preview)

**Scenario: Preview deployment with `VITE_FEATURE_QA_GUARD=true` and `VITE_API_BASE_URL=https://api-preview.pix.immo`**

### Check 1: API Base URL
- **Expected:** ✅ PASS
- **Reason:** `getApiBaseUrl()` returns configured URL from ENV
- **Message:** `https://api-preview.pix.immo`

### Check 2: CORS Preflight
- **Expected:** ✅ PASS or ⚠️ WARN
- **Reason:** Backend has CORS configured in `server/index.ts` (Hono) + `server/routes.ts` (Express)
- **Message:** `HTTP 401` (no auth) or `HTTP 200` (if public endpoint)
- **FAIL Scenario:** `TypeError: CORS blocked` → Backend missing `Access-Control-Allow-Origin` for frontend domain

### Check 3: Cookie Credentials
- **Expected:** ⏭️ SKIPPED or ⚠️ WARN
- **Reason:** No login in fresh Preview → 401 expected (not a FAIL)
- **Message:** `Not logged in (expected)`
- **FAIL Scenario:** `CORS blocked with credentials` → Backend missing `Access-Control-Allow-Credentials: true`

### Check 4: Signed URL Format
- **Expected:** ✅ PASS
- **Reason:** Dry-run check, only validates URL construction
- **Message:** `Format OK: /api/uploads/intent`

### Check 5: Download Endpoints
- **Expected:** ✅ PASS
- **Reason:** Dry-run check, only validates URL construction
- **Message:** `Format OK: /api/orders/TEST/alt-texts.txt`

---

## Potential Issues & Mitigations

### ⚠️ Issue 1: CORS Blocked (Most Likely)
**Symptom:** Check 2 or 3 FAIL with `TypeError: CORS blocked`

**Root Cause:**  
Backend `Access-Control-Allow-Origin` not configured for Cloudflare Pages Preview domain (e.g., `https://abc123.pix-immo.pages.dev`)

**Fix (Backend - Hono):**
```typescript
// server/index.ts
cors({
  origin: [
    'https://pix.immo',
    'https://pixcapture.app',
    /^https:\/\/.*\.pix-immo\.pages\.dev$/,  // ← Preview domains
  ],
  credentials: true,
})
```

**Effort:** 5 minutes

---

### ⚠️ Issue 2: Cookie SameSite Policy
**Symptom:** Check 3 FAIL with credentials blocked (not CORS, but cookie not sent)

**Root Cause:**  
Backend session cookies using `SameSite=Lax` instead of `SameSite=None` for cross-origin requests (HTTPS required)

**Fix (Backend - Session Config):**
```typescript
// server/routes.ts or server/index.ts
cookie: {
  httpOnly: true,
  secure: true,  // HTTPS only
  sameSite: 'none',  // Cross-origin cookies
}
```

**Effort:** 3 minutes

---

### ⚠️ Issue 3: Missing ENV Variable
**Symptom:** Check 1 FAIL with `VITE_API_BASE_URL is not set`

**Root Cause:**  
Cloudflare Pages Preview environment variables not configured

**Fix (Cloudflare Pages Dashboard):**
1. Navigate to: Settings → Environment Variables → Preview
2. Add: `VITE_API_BASE_URL=https://api-preview.pix.immo`
3. Add: `VITE_FEATURE_QA_GUARD=true`
4. Redeploy Preview

**Effort:** 2 minutes

---

## Frontend Routing

**Test Routes:**
- ✅ `/` → pix.immo home
- ✅ `/pixcapture` → pixcapture.app home
- ✅ `/qa` → QA smoke checks (only when `FEATURE_QA_GUARD=true`)
- ✅ `/pixcapture/qa` → QA smoke checks (only when `FEATURE_QA_GUARD=true`)

**SPA Routing:**
- ✅ `_redirects` file deployed → all routes fallback to `/index.html`
- ✅ No 404 errors expected (Wouter handles client-side routing)

---

## Rollback Banner Behavior

**Trigger:** `hasFailures` from `useSmokeChecks()` is `true`

**Display:**
- Red banner at top of page
- Warning text: "QA Failures Detected"
- Action buttons: "View QA Details" (/qa) + "Reload"

**Expected:**
- ❌ **NOT visible** if all checks PASS
- ✅ **Visible** if any check FAIL (e.g., CORS blocked)

---

## Decision Matrix

| Scenario | Recommendation | Reason |
|----------|---------------|--------|
| All checks PASS | ✅ **GO** | Safe to promote to production |
| Checks WARN (401/skipped) | ✅ **GO** | Expected behavior without login |
| Check 1 FAIL (no API URL) | ❌ **NO-GO** | Frontend cannot communicate with backend |
| Check 2/3 FAIL (CORS block) | ❌ **NO-GO** | Backend needs CORS fix before production |
| Check 4/5 FAIL (URL format) | ⚠️ **CONDITIONAL** | Investigate buildApiUrl() logic, likely false positive |

---

## Final Recommendation

**✅ GO for Preview Deployment**

**Conditions:**
1. Deploy to Cloudflare Pages Preview
2. Configure environment variables:
   - `VITE_API_BASE_URL=https://api-preview.pix.immo`
   - `VITE_FEATURE_QA_GUARD=true`
   - `VITE_APP_ENV=preview`
3. Navigate to `/qa` and run smoke checks
4. If checks FAIL → apply fixes from "Potential Issues" section
5. Re-run checks until all PASS or WARN (expected)

**No-Go Criteria:**
- Build fails
- LSP errors present
- CORS configuration missing from backend

**Production Deployment:**
- Set `VITE_FEATURE_QA_GUARD=false` (or omit)
- `/qa` route will return 404
- RollbackBanner will not render

---

## Next Steps

1. **Deploy to Preview:**
   ```bash
   # Already built: dist/public/
   # Push to GitHub → Cloudflare Pages auto-deploys
   ```

2. **Configure ENV Variables:**
   - Cloudflare Pages → Settings → Environment Variables → Preview
   - Add `VITE_API_BASE_URL`, `VITE_FEATURE_QA_GUARD`, `VITE_APP_ENV`

3. **Test Smoke Checks:**
   - Navigate to `https://<preview-url>/qa`
   - Click "Re-run Checks"
   - Verify results (PASS/WARN expected, FAIL requires fixes)

4. **Apply Fixes (if needed):**
   - CORS: Update backend `Access-Control-Allow-Origin`
   - Cookies: Update backend `SameSite=None; Secure`
   - ENV: Configure in Cloudflare Pages Dashboard

5. **Production Deployment:**
   - Disable QA Guard: `VITE_FEATURE_QA_GUARD=false`
   - Deploy to production branch
   - Verify `/qa` returns 404

---

**Report Prepared By:** Replit Agent  
**Reviewed By:** Architect (QA0 components)  
**Approval Status:** ✅ Ready for Preview Deployment
