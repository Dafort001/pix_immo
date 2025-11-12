# Phase B2a - Design v2 (Architect-Reviewed)

## Overview
Production Canary Rollout mit 10% Traffic-Sampling unter Berücksichtigung der Architect-Feedback zu Session Consistency, Rollback Speed, und Observability.

---

## Critical Architect Findings

### 1. Session Drift Risk ❌
**Problem:** Pure per-request randomization kann Upload-Flows brechen:
- POST /api/pixcapture/upload/intent → **Proxy** (90% chance)
- POST /api/pixcapture/upload/finalize → **Native** (10% chance)
- Result: Finalize findet Intent-Record nicht (verschiedene Backends)

**Solution:** **Sticky Sampling** via Cookie `_canary_cohort`
- Once sampled into `native` or `proxy` cohort → stay for 24h
- Upload-Flows bleiben konsistent (intent + finalize beide native ODER beide proxy)
- Cookie: `_canary_cohort=native; Max-Age=86400; HttpOnly; Secure; SameSite=None`

---

### 2. Rollback Too Slow ❌
**Problem:** `CANARY_PERCENT` in wrangler.toml requires full redeploy (minutes)
- Incident: Error rate spikes → need instant rollback
- wrangler redeploy: 2-5 minutes downtime

**Solution:** **Workers KV + Circuit Breaker**
- Move `CANARY_PERCENT` to Workers KV (`canary-config` namespace)
- Dashboard-editable without deployment
- Emergency: Set `EMERGENCY_PROXY=true` KV key → instant 100% proxy fallback
- Rollback: `CANARY_PERCENT=0` in KV → takes effect within seconds

**KV Schema:**
```json
{
  "canary_percent": 10,
  "canary_tag": "B2a",
  "emergency_proxy": false,
  "last_updated": "2025-11-15T10:30:00Z"
}
```

---

### 3. Monitoring Gaps ❌
**Current B2a Spec:** Vague "monitor errors/latency"
**Architect Requirements:**
- Concrete error/latency targets (e.g., p90 < 500ms, error rate < 1%)
- Per-phase counters (B1a, B1b, Proxy separate)
- Alert thresholds (PagerDuty/Email integration)
- Structured logs with histograms

**Solution:** **Enhanced Observability Stack**
1. **Metrics:** (Cloudflare Analytics)
   - `canary_requests_total{cohort=native|proxy, phase=b1a|b1b}`
   - `canary_errors_total{cohort, phase, status_code}`
   - `canary_duration_ms_histogram{cohort, phase, p50|p90|p99}`
   - `r2_upload_failures_total{cohort}`
   - `db_query_failures_total{cohort}`

2. **Logs:** (Logpush to R2)
   - Structured JSON logs (not plain text)
   - Fields: timestamp, rayID, cohort, phase, status, duration_ms, error_msg
   - Sampling: 100% errors, 10% success (reduce volume)

3. **Alerts:** (via Cloudflare Workers Analytics)
   - Error rate > 1.5% (any cohort) → PagerDuty/Email
   - p90 latency > 600ms → Warning
   - R2 failures > 5/min → Critical

4. **Dashboards:**
   - Real-time: Requests by cohort, Error rate by phase
   - Historical: Latency histogram, Rollout timeline

---

### 4. X-Canary Header Override ❌
**Problem:** Unclear if `X-Canary: 1` should work in parallel or override percentage-gating

**Solution:** **Explicit Override Hierarchy**
```
Decision Priority:
1. EMERGENCY_PROXY=true (KV) → force 100% Proxy
2. X-Canary: 1 (header) → force 100% Native
3. _canary_cohort cookie → sticky 24h
4. Math.random() < CANARY_PERCENT → new sampling
5. Default → Proxy
```

**Implementation:**
```typescript
function getCanaryDecision(c: Context, env: Env): {
  cohort: 'native' | 'proxy';
  reason: 'emergency' | 'header' | 'cookie' | 'sampled' | 'default';
} {
  // 1. Emergency proxy (KV)
  if (env.KV_CANARY_CONFIG?.emergency_proxy === true) {
    return { cohort: 'proxy', reason: 'emergency' };
  }
  
  // 2. X-Canary header (explicit opt-in)
  if (c.req.header('x-canary') === '1') {
    return { cohort: 'native', reason: 'header' };
  }
  
  // 3. Sticky cookie
  const cookie = c.req.cookie('_canary_cohort');
  if (cookie === 'native' || cookie === 'proxy') {
    return { cohort: cookie, reason: 'cookie' };
  }
  
  // 4. Sample new cohort
  const percent = env.KV_CANARY_CONFIG?.canary_percent || 0;
  const cohort = Math.random() < (percent / 100) ? 'native' : 'proxy';
  return { cohort, reason: 'sampled' };
}
```

**Response Headers:**
```
X-Pix-Canary: 1;tag=B2a;cohort=native;reason=sampled
X-Pix-Decision: native (10% sample)
```

---

### 5. Worker /qa Endpoint ❌
**Current:** Pages-only `/qa` with `useSmokeChecks` hook
**Architect Requirement:** Mirror on Worker with native/proxy health + sampling state

**Solution:** **Unified /qa Response**

**Worker Endpoint:** `GET /qa`
```json
{
  "endpoint": "worker /qa",
  "timestamp": "2025-11-15T10:45:00Z",
  "canary": {
    "sampling_active": true,
    "percent": 10,
    "tag": "B2a",
    "cohort": "native",
    "decision_reason": "sampled",
    "emergency_proxy": false
  },
  "health": {
    "native": {
      "status": "healthy",
      "db_ping_ms": 45,
      "r2_accessible": true
    },
    "proxy": {
      "status": "healthy",
      "origin_ping_ms": 120,
      "reachable": true
    }
  },
  "metrics_24h": {
    "requests_native": 12450,
    "requests_proxy": 112050,
    "error_rate_native": "0.8%",
    "error_rate_proxy": "0.5%",
    "p90_latency_native_ms": 380,
    "p90_latency_proxy_ms": 520
  }
}
```

**Pages Endpoint:** `GET /qa` (existing `useSmokeChecks`)
- Keep current 5 checks (API URL, CORS, Credentials, Signed URLs, Downloads)
- Add new check: **Worker Canary Config** (fetch Worker `/qa`, validate response)

---

### 6. Session Consistency ✅
**Architect Note:** Evaluate flows requiring sequential native calls

**Analysis:**
1. **Upload Flows:** Intent → Finalize (CRITICAL - requires sticky cohort)
2. **Job Dashboards:** GET /jobs → GET /jobs/:id (Safe - both read-only)
3. **Auth Sessions:** Login → API calls (Safe - shared session store)

**Solution:** Sticky cohort cookie ensures upload flows stay consistent.

**Edge Case:** User clears cookies mid-flow
- Fallback: Proxy (safer default)
- Monitoring: Track `intent_without_finalize_count` (orphaned intents)

---

## Revised Implementation Plan

### Task B2a.1: ENV Vars + KV Setup ✅
- wrangler.toml: Add KV binding `canary-config`
- Seed KV with initial config: `{ canary_percent: 10, canary_tag: "B2a", emergency_proxy: false }`
- Keep `FEATURE_QA_GUARD=true` in wrangler vars (non-secret)

### Task B2a.2: Sticky Canary Middleware ✅
- Implement `getCanaryDecision()` with 5-level hierarchy
- Set `_canary_cohort` cookie on new sampling
- Emit `X-Pix-Canary` response header with decision metadata

### Task B2a.3: Worker /qa Endpoint ✅
- Expose canary config, health checks, 24h metrics
- Rate-limit to 10 req/min (prevent abuse)

### Task B2a.4: Observability Stack ✅
- Structured logs: JSON format, cohort/phase/status tags
- Logpush config: R2 destination `logs-canary/b2a/`
- Analytics: Dashboards + Alert rules

### Task B2a.5: Integration Tests ✅
- Test sticky cohort (intent → finalize both native)
- Test header override (X-Canary: 1 forces native)
- Test emergency proxy (KV toggle instant rollback)
- Test cookie expiry (new sampling after 24h)

### Task B2a.6: Rollback Procedures ✅
- Document KV-based instant rollback
- Document circuit breaker (emergency_proxy flag)
- Define error thresholds (when to rollback)

### Task B2a.7: Production Validation ✅
- Deploy to Preview first (test KV + sticky cohort)
- Run /qa checks (Worker + Pages)
- Validate metrics/logs in Analytics
- GO/NO-GO decision → Production deploy

---

## Rollback Decision Tree

```
Error Rate > 1.5% (sustained 5 min)?
├─ YES → Emergency: Set emergency_proxy=true in KV (instant 100% proxy)
└─ NO  → Continue

p90 Latency > 600ms (sustained 10 min)?
├─ YES → Warning: Set canary_percent=5 in KV (reduce to 5%)
└─ NO  → Continue

R2 Failures > 5/min (sustained 3 min)?
├─ YES → Critical: Set emergency_proxy=true in KV
└─ NO  → Continue

Orphaned Intents > 10/hour?
├─ YES → Session Drift Issue → Set canary_percent=0 (disable sampling)
└─ NO  → Continue
```

---

## Security Considerations

1. **FEATURE_QA_GUARD:** Default `false` in production, require SRE token for `/qa` access
2. **KV Write Access:** Dashboard-only, no API-based writes (prevent abuse)
3. **Cookie Tampering:** Sign `_canary_cohort` cookie with HMAC (prevent user forcing native)

---

## Next Steps

1. ✅ Get User approval for Design v2 (sticky cohort + KV config)
2. Implement B2a.1 (KV setup)
3. Implement B2a.2 (Sticky middleware)
4. Implement B2a.3 (Worker /qa)
5. Implement B2a.4 (Observability)
6. Test in Preview
7. Deploy to Production with 10% sampling
8. Monitor for 24h → GO/NO-GO for B2b (50% ramp-up)

---

**Design Status:** ✅ Architect-Reviewed (Production-Safe)  
**Next Action:** User approval → Implementation
