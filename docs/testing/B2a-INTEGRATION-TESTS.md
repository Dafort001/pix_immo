# B2a.5 Integration Tests

**HALT Phase B2a - Canary Rollout Validation**

Last Updated: 2025-11-12

---

## Overview

Integration tests validate sticky cohort behavior, header overrides, emergency circuit breaker, upload flow consistency, and observability infrastructure. These tests ensure safe production rollout with instant rollback capability.

**Prerequisites:**
- ✅ B2a.1-4 Complete (KV setup, middleware, /qa endpoint, observability)
- ✅ Workers deployed to Preview environment
- ✅ KV namespace configured and seeded
- ✅ Logpush enabled (R2 bucket `logs-canary`)

**Test Environment:**
- Preview: `https://api-preview.pix.immo`
- Production: `https://api.pix.immo` (after validation)

---

## 1. Basis-Check: /qa Endpoint + Header + Cookie

### Test 1.1: QA Endpoint Response Structure

**Command:**
```bash
curl -i https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
HTTP/2 200
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=sampled
Set-Cookie: _canary_cohort=native; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=None

{
  "status": "healthy",
  "canary": {
    "percent": 10,
    "tag": "B2a",
    "emergency_proxy": false,
    "cohort": "native",
    "reason": "sampled"
  },
  "health": {
    "database": "ok",
    "r2_bucket": "ok",
    "proxy_origin": "ok"
  }
}
```

**Validation:**
- ✅ `X-Pix-Canary` header present with format: `1;tag=B2a;cohort=(native|proxy);reason=...`
- ✅ `Set-Cookie: _canary_cohort` set with 86400s (24h) Max-Age
- ✅ JSON body includes `canary.percent=10`, `emergency_proxy=false`
- ✅ Health checks: database, R2, proxy all `"ok"`

---

### Test 1.2: Sticky Cohort - Native Cookie

**Command:**
```bash
curl -i --cookie "_canary_cohort=native" https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=cookie
```

**Validation:**
- ✅ `cohort=native` (matches cookie value)
- ✅ `reason=cookie` (sticky behavior, not new sampling)
- ✅ No new `Set-Cookie` header (cookie already valid)

---

### Test 1.3: Sticky Cohort - Proxy Cookie

**Command:**
```bash
curl -i --cookie "_canary_cohort=proxy" https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
X-Pix-Canary: 1;tag=B2a;cohort=proxy;reason=cookie
```

**Validation:**
- ✅ `cohort=proxy` (matches cookie value)
- ✅ `reason=cookie` (sticky behavior)

---

## 2. Header Override (Force 100% Native)

### Test 2.1: X-Canary Header Override

**Command:**
```bash
curl -i -H "X-Canary: 1" https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=header
```

**Validation:**
- ✅ `cohort=native` (forced by header)
- ✅ `reason=header` (not cookie or sampled)
- ✅ Cookie remains unchanged (override affects only this request)

**Use Case:** Developer testing, forced canary activation for debugging.

---

## 3. Emergency Circuit Breaker (100% Proxy Fallback)

### Test 3.1: Enable Emergency Proxy

**Setup:**
```bash
# ⚠️ CAUTION: This forces 100% traffic to proxy (instant rollback)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":true,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Command:**
```bash
curl -i https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
X-Pix-Canary: 1;tag=B2a;cohort=proxy;reason=emergency
```

**Validation:**
- ✅ `cohort=proxy` (100% proxy, regardless of cookies/sampling)
- ✅ `reason=emergency` (KV circuit breaker active)
- ✅ JSON body: `"emergency_proxy": true`

**Multiple Requests:**
```bash
for i in {1..10}; do
  curl -s https://api-preview.pix.immo/api/qa | jq -r '.canary.cohort'
done
```

**Expected Output:**
```
proxy
proxy
proxy
proxy
proxy
proxy
proxy
proxy
proxy
proxy
```

**All requests route to proxy, confirming emergency_proxy flag overrides all other logic.**

---

### Test 3.2: Restore Normal Operation

**Command:**
```bash
# Restore canary rollout (10% sampling)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Verification:**
```bash
curl -i https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=sampled
```

**Validation:**
- ✅ `emergency_proxy=false` in JSON body
- ✅ Normal sampling resumes (10% native, 90% proxy)

---

## 4. Upload Flow Consistency (Intent → Finalize)

**Purpose:** Verify sticky cohort prevents orphaned upload intents (cross-cohort data loss).

### Test 4.1: Proxy Cohort - Full Upload Flow

**Step 1: Create Intent (Proxy)**
```bash
curl -i --cookie "_canary_cohort=proxy" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/intent \
  -H "Content-Type: application/json" \
  -d '{
    "shootId": "shoot_test_001",
    "stackCount": 3,
    "totalBytes": 15728640
  }'
```

**Expected Response:**
```http
HTTP/2 201
X-Pix-Canary: 1;tag=B2a;cohort=proxy;reason=cookie

{
  "intentId": "intent_01HQWXYZ...",
  "uploadUrls": [...]
}
```

**Note intentId for next step.**

**Step 2: Finalize Upload (Proxy)**
```bash
curl -i --cookie "_canary_cohort=proxy" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "intentId": "intent_01HQWXYZ...",
    "uploadedFiles": [
      {"key": "raw/file1.dng", "size": 5242880}
    ]
  }'
```

**Expected Response:**
```http
HTTP/2 200
X-Pix-Canary: 1;tag=B2a;cohort=proxy;reason=cookie

{
  "status": "success",
  "filesProcessed": 1
}
```

**Validation:**
- ✅ Both requests use `cohort=proxy;reason=cookie` (sticky)
- ✅ Finalize finds intent created in Step 1 (no "Intent not found" error)
- ✅ Status 200 (success)

---

### Test 4.2: Native Cohort - Full Upload Flow

**Step 1: Create Intent (Native)**
```bash
curl -i --cookie "_canary_cohort=native" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/intent \
  -H "Content-Type: application/json" \
  -d '{
    "shootId": "shoot_test_002",
    "stackCount": 2,
    "totalBytes": 10485760
  }'
```

**Expected Response:**
```http
HTTP/2 201
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=cookie

{
  "intentId": "intent_01HQWXYZ...",
  "uploadUrls": [...]
}
```

**Step 2: Finalize Upload (Native)**
```bash
curl -i --cookie "_canary_cohort=native" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "intentId": "intent_01HQWXYZ...",
    "uploadedFiles": [
      {"key": "raw/file2.dng", "size": 5242880}
    ]
  }'
```

**Expected Response:**
```http
HTTP/2 200
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=cookie

{
  "status": "success",
  "filesProcessed": 1
}
```

**Validation:**
- ✅ Both requests use `cohort=native;reason=cookie` (sticky)
- ✅ No data loss or intent mismatch
- ✅ Status 200 (success)

---

### Test 4.3: Cross-Cohort Intent (Should Fail or Route to Proxy)

**Anti-Pattern Test:** Verify system handles cross-cohort requests gracefully.

**Step 1: Create Intent (Native)**
```bash
curl -i --cookie "_canary_cohort=native" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/intent \
  -d '{"shootId": "shoot_test_003", "stackCount": 1, "totalBytes": 5242880}'
```

**Step 2: Finalize Upload (Proxy - different cohort)**
```bash
curl -i --cookie "_canary_cohort=proxy" \
  -X POST https://api-preview.pix.immo/api/pixcapture/upload/finalize \
  -d '{"intentId": "<INTENT_FROM_STEP1>", "uploadedFiles": [...]}'
```

**Expected Behavior (depends on implementation):**
- **Option A:** Proxy successfully finds intent (shared database, no isolation)
- **Option B:** 404 Not Found (cohort isolation enforced)

**Validation:**
- ✅ No data corruption or unhandled errors
- ✅ Clear error message if intent not found

**Note:** Sticky cookies prevent this scenario in production (same user = same cohort).

---

## 5. Rate Limit - /qa Soft Guard

**Purpose:** Verify /qa endpoint has rate limiting to prevent abuse.

**Command:**
```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code}\n" https://api-preview.pix.immo/api/qa
done
```

**Expected Output:**
```
200
200
200
200
200
200
200
200
200
200
429
429
```

**Validation:**
- ✅ First ~10 requests succeed (200)
- ✅ Subsequent requests rate-limited (429)
- ✅ Response body: `{"error": "rate_limited"}`

**Rate Limit Configuration:**
- Limit: 10 requests per minute per IP
- Window: 60 seconds
- Type: Soft guard (not cryptographic protection)

---

## 6. Logs & Dashboards Verification

### Test 6.1: Logpush - HTTP Requests

**Wait Time:** 5-15 minutes after first test requests.

**Command:**
```bash
npx wrangler r2 object list logs-canary --prefix b2a/http_requests/ | head -20
```

**Expected Output:**
```
b2a/http_requests/2025/11/12/08/20251112_08_abc123.log.gz
b2a/http_requests/2025/11/12/08/20251112_08_abc124.log.gz
```

**Validation:**
- ✅ Log files present in R2 bucket
- ✅ Path structure: `b2a/http_requests/YYYY/MM/DD/HH/`
- ✅ gzip compression applied

**Inspect Log Content:**
```bash
npx wrangler r2 object get logs-canary/b2a/http_requests/.../file.log.gz --file=http.log.gz
gunzip http.log.gz
cat http.log | jq -r '.ClientRequestHeaders."X-Pix-Canary"' | sort | uniq -c
```

**Expected Distribution:**
```
  90 1;tag=B2a;cohort=proxy;reason=sampled
  10 1;tag=B2a;cohort=native;reason=sampled
```

**Validation:**
- ✅ ~10% native, ~90% proxy (matches canary_percent)

---

### Test 6.2: Logpush - Workers Trace Events

**Command:**
```bash
npx wrangler r2 object list logs-canary --prefix b2a/workers_trace_events/ | head -20
```

**Expected Output:**
```
b2a/workers_trace_events/2025/11/12/08/20251112_08_xyz789.log.gz
```

**Inspect Log Content:**
```bash
npx wrangler r2 object get logs-canary/b2a/workers_trace_events/.../file.log.gz --file=workers.log.gz
gunzip workers.log.gz
cat workers.log | jq -r 'select(.Logs.Message | contains("cohort")) | .Logs.Message' | jq -r '.level'
```

**Expected Output:**
```
INFO
INFO
ERROR
INFO
ERROR
```

**Validation:**
- ✅ Success logs (level=INFO) ~10% sampled
- ✅ Error logs (level=ERROR) 100% logged
- ✅ Structured JSON format with `cohort`, `decision_reason`, `canary_tag`

---

### Test 6.3: Cloudflare Analytics Dashboards

**Path:** Cloudflare Dashboard → Workers & Pages → Analytics

**Panel A: Requests by Cohort**
- **Expected:** ~10% native, ~90% proxy
- **Query:** Group by `ClientRequestHeaders."X-Pix-Canary"` → Extract cohort

**Panel B: Error Rate by Cohort**
- **Expected:** Native < 1.5%, Proxy < 1.0%
- **Alert Threshold:** Native > Proxy + 0.5% → Warning

**Panel C: Latency p90**
- **Expected:** Native p90 < 600ms
- **Alert Threshold:** Native p90 > Proxy p90 + 20% → Warning

**Panel D: Rollout Timeline**
- **Expected:** B2a tag visible in all requests
- **Annotations:** B2a start timestamp

**Validation:**
- ✅ All panels show data (not empty)
- ✅ Metrics within expected ranges
- ✅ No abnormal spikes or anomalies

---

## 7. GO/NO-GO Checklist

### Integration Test Results

| Test | Status | Notes |
|------|--------|-------|
| ✅ /qa endpoint structure | PASS/FAIL | Header + JSON body correct |
| ✅ Sticky cohort (native cookie) | PASS/FAIL | reason=cookie, cohort=native |
| ✅ Sticky cohort (proxy cookie) | PASS/FAIL | reason=cookie, cohort=proxy |
| ✅ Header override (X-Canary: 1) | PASS/FAIL | reason=header, cohort=native |
| ✅ Emergency proxy (KV flag) | PASS/FAIL | 100% proxy, reason=emergency |
| ✅ Upload flow (proxy cohort) | PASS/FAIL | Intent → Finalize success |
| ✅ Upload flow (native cohort) | PASS/FAIL | Intent → Finalize success |
| ✅ /qa rate limiting | PASS/FAIL | 429 after 10 requests |
| ✅ Logpush HTTP requests | PASS/FAIL | Files in R2, 10:90 ratio |
| ✅ Logpush Workers events | PASS/FAIL | Structured logs, sampling |
| ✅ Analytics dashboards | PASS/FAIL | Data visible, metrics healthy |

### Acceptance Criteria

**PASS (Proceed to B2a.7 - Production Deploy):**
- ✅ All critical tests pass (sticky cohorts, emergency proxy, upload flow)
- ✅ Logpush delivering data to R2
- ✅ Analytics dashboards operational
- ✅ Error rate < 1.5%, latency p90 < 600ms

**FAIL (Block Production Deploy):**
- ❌ Upload flow inconsistency (orphaned intents)
- ❌ Emergency proxy not working (circuit breaker broken)
- ❌ Missing logs (Logpush configuration issue)
- ❌ Error rate > 3% or latency p90 > 1000ms

---

## 8. Test Documentation

**Create:** `docs/QA/GO_NO_GO_PROD.md`

**Template:**
```markdown
# B2a.5 Integration Test Results

**Date:** 2025-11-12 14:30 Europe/Berlin
**Environment:** Preview (https://api-preview.pix.immo)
**Tester:** [Your Name]

## Test Execution Summary

- Total Tests: 11
- Passed: 11
- Failed: 0
- Blocked: 0

## Screenshots

### /qa Endpoint Response
![qa-response](./screenshots/b2a-qa-response.png)

### Analytics Dashboard
![analytics](./screenshots/b2a-analytics-dashboard.png)

## Issues Found

None.

## Decision

**GO** - Proceed to B2a.7 (Production Deploy)

Rationale:
- All integration tests pass
- Observability stack operational
- Error rates within acceptable thresholds
- Emergency rollback verified working

## Next Steps

1. Execute KV setup script: `./scripts/b2a-kv-setup.sh`
2. Deploy to production: `npx wrangler deploy`
3. Monitor metrics for 24 hours
4. Gradual rollout: 10% → 25% → 50% → 100%
```

---

## Next: B2a.6 Rollback Procedures

After successful integration tests, proceed to **docs/runbooks/rollback_b2a.md** for emergency procedures and incident response.
