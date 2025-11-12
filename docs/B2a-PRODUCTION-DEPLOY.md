# B2a.7 Production Deployment Guide

**HALT Phase B2a - 10% Canary Rollout auf Production**

Last Updated: 2025-11-12

---

## Overview

This guide walks through the complete production deployment of B2a canary infrastructure, from KV setup through 24-hour monitoring and GO/NO-GO decision. All steps are designed for safe rollout with instant rollback capability.

**Deployment Timeline:**
- **Day 1 (0h):** KV setup + Preview deploy + Integration tests (4 hours)
- **Day 1 (4h):** Production deploy + Initial monitoring (2 hours)
- **Day 1-2 (6h-30h):** 24-hour observation period
- **Day 2 (30h):** GO/NO-GO decision → Phase B2b (25%) or Rollback

**Prerequisites:**
- ✅ B2a.1-6 Complete (all integration tests documented)
- ✅ Cloudflare account with Workers + KV access
- ✅ wrangler CLI installed (`npm install wrangler`)
- ✅ Team briefed on rollback procedures (docs/runbooks/rollback_b2a.md)

---

## Phase 1: KV Setup (Manual Execution Required)

### Step 1.1: Wrangler Login

**Command:**
```bash
npx wrangler login
```

**Expected:**
- Browser opens automatically
- Login with Cloudflare account credentials
- Terminal shows: `✅ Successfully logged in`

**Verification:**
```bash
npx wrangler whoami
```

**Expected Output:**
```
Account Name: Your Cloudflare Account
Account ID: abc123...
User ID: user_xyz...
```

**⚠️ CRITICAL:** Do NOT proceed without successful login. KV operations will fail.

---

### Step 1.2: Execute KV Setup Script

**Command:**
```bash
./scripts/b2a-kv-setup.sh
```

**Interactive Prompts:**

1. **Account ID (if missing in wrangler.toml):**
   ```
   ⚠️  account_id fehlt in wrangler.toml
   Account ID eingeben (oder Enter zum Überspringen): <YOUR_ACCOUNT_ID>
   ```
   - Get Account ID from: `npx wrangler whoami` or Cloudflare Dashboard
   - Enter the ID and press Enter
   - Script adds it to `wrangler.toml` automatically

2. **Deploy Prompt (at the end):**
   ```
   Jetzt deployen? (y/N):
   ```
   - **Answer: N** (we'll deploy separately in Phase 2)
   - This skips automatic deployment for controlled rollout

**Expected Script Output:**
```
===================================================
B2a.1 - KV Namespace Setup für Canary Rollout
===================================================

✅ wrangler authentifiziert
✅ account_id bereits vorhanden

📦 Erstelle KV Namespaces...

▶ PREVIEW Namespace:
🌀 Creating namespace with title "canary-config-preview"
✅ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "KV_CANARY_CONFIG", preview_id = "abc123..." }

▶ PRODUCTION Namespace:
🌀 Creating namespace with title "canary-config"
✅ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "KV_CANARY_CONFIG", id = "xyz789..." }

📝 Notierte IDs:
   Preview:    abc123...
   Production: xyz789...

📄 Aktualisiere wrangler.toml mit KV Namespace IDs...
✅ wrangler.toml aktualisiert (Backup: wrangler.toml.backup)

📤 Schreibe initiale KV-Konfiguration...
   Datei: kv_config.json
   Inhalt: {"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"2025-11-12T14:30:00Z"}

▶ PREVIEW Environment:
Writing the value "{"canary_percent":10,...}" to key "config" on namespace abc123...

▶ PRODUCTION Environment:
Writing the value "{"canary_percent":10,...}" to key "config" on namespace xyz789...

🔍 Prüfe KV-Konfiguration...

▶ PREVIEW:
{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"2025-11-12T14:30:00Z"}

▶ PRODUCTION:
{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"2025-11-12T14:30:00Z"}

Jetzt deployen? (y/N): N

===================================================
✅ B2a.1 Setup COMPLETE!
===================================================
```

---

### Step 1.3: Verify KV Configuration

**Check wrangler.toml:**
```bash
grep -A3 "kv_namespaces" wrangler.toml
```

**Expected Output:**
```toml
[[kv_namespaces]]
binding = "KV_CANARY_CONFIG"
id = "xyz789..."
preview_id = "abc123..."
```

**Verification:**
- ✅ `binding = "KV_CANARY_CONFIG"` (matches middleware)
- ✅ `id` is a 32-character hex string (production)
- ✅ `preview_id` is a 32-character hex string (preview)

**Check KV Values:**
```bash
# Preview environment
npx wrangler kv:key get --binding=KV_CANARY_CONFIG config --preview

# Production environment
npx wrangler kv:key get --binding=KV_CANARY_CONFIG config
```

**Expected Output (both environments):**
```json
{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"2025-11-12T14:30:00Z"}
```

**Validation:**
- ✅ `canary_percent: 10` (10% traffic to native)
- ✅ `canary_tag: "B2a"` (phase identifier)
- ✅ `emergency_proxy: false` (rollout active, not emergency mode)

---

## Phase 2: Preview Deployment + Testing

### Step 2.1: Deploy to Preview

**Command:**
```bash
npx wrangler deploy --env preview
```

**Expected Output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded pix-immo-api-preview (X.XX sec)
Published pix-immo-api-preview (X.XX sec)
  https://pix-immo-api-preview.workers.dev
  https://api-preview.pix.immo
Current Deployment ID: deployment-abc123...
```

**Verification:**
- ✅ Build succeeds (no TypeScript errors)
- ✅ Upload completes
- ✅ Custom domain active (api-preview.pix.immo)

---

### Step 2.2: Test /qa Endpoint

**Command:**
```bash
curl -i https://api-preview.pix.immo/api/qa
```

**Expected Response:**
```http
HTTP/2 200
content-type: application/json
x-pix-canary: 1;tag=B2a;cohort=native;reason=sampled
set-cookie: _canary_cohort=native; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=None

{
  "status": "healthy",
  "environment": "preview",
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

**Validation Checklist:**
- ✅ Status 200 (endpoint accessible)
- ✅ `X-Pix-Canary` header present
- ✅ `Set-Cookie: _canary_cohort` set (sticky behavior)
- ✅ `canary.percent = 10` (KV config loaded)
- ✅ `emergency_proxy = false` (rollout active)
- ✅ All health checks: `"ok"` (database, R2, proxy)

**❌ If health checks fail:**
```json
"health": {
  "database": "error: connection timeout",
  "r2_bucket": "ok",
  "proxy_origin": "ok"
}
```

**Troubleshooting:**
- Database: Check `DATABASE_URL` environment variable
- R2: Verify bucket name in environment variables
- Proxy: Confirm origin server running (Express backend)

---

### Step 2.3: Run Integration Tests

**Execute all 11 tests from `docs/testing/B2a-INTEGRATION-TESTS.md`:**

**Quick Test Suite:**
```bash
# Test 1: Sticky Cohort (Native)
curl -i --cookie "_canary_cohort=native" https://api-preview.pix.immo/api/qa | grep "cohort=native;reason=cookie"

# Test 2: Sticky Cohort (Proxy)
curl -i --cookie "_canary_cohort=proxy" https://api-preview.pix.immo/api/qa | grep "cohort=proxy;reason=cookie"

# Test 3: Header Override
curl -i -H "X-Canary: 1" https://api-preview.pix.immo/api/qa | grep "cohort=native;reason=header"

# Test 4: Emergency Proxy
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config --preview \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":true,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

curl -i https://api-preview.pix.immo/api/qa | grep "cohort=proxy;reason=emergency"

# Restore normal operation
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config --preview \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

# Test 5: Rate Limiting
for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" https://api-preview.pix.immo/api/qa; done | tail -2
# Expected: 429, 429
```

**Document Results:**

Create `docs/QA/GO_NO_GO_PREVIEW.md`:
```markdown
# B2a Preview Deployment - Test Results

**Date:** 2025-11-12 15:00 Europe/Berlin
**Environment:** Preview (https://api-preview.pix.immo)
**Tester:** [Your Name]

## Test Execution

| Test | Status | Notes |
|------|--------|-------|
| /qa endpoint structure | ✅ PASS | Header + JSON correct |
| Sticky cohort (native) | ✅ PASS | reason=cookie |
| Sticky cohort (proxy) | ✅ PASS | reason=cookie |
| Header override | ✅ PASS | X-Canary forces native |
| Emergency proxy | ✅ PASS | 100% proxy, instant |
| Rate limiting | ✅ PASS | 429 after 10 requests |

## Decision

**GO** - Proceed to Production Deploy

All critical tests pass. Ready for production rollout.

## Next Steps

1. Deploy to production: `npx wrangler deploy`
2. Configure Logpush (Cloudflare Dashboard)
3. Monitor for 24 hours
```

---

## Phase 3: Production Deployment

### Step 3.1: Final Pre-Flight Check

**Checklist:**
- ✅ Preview tests: ALL PASS
- ✅ Team notified (Slack #deployments)
- ✅ Rollback runbook reviewed (docs/runbooks/rollback_b2a.md)
- ✅ PagerDuty on-call rotation confirmed
- ✅ Maintenance window scheduled (low traffic period preferred)

**Recommended Deploy Time:**
- **Weekday:** Tuesday-Thursday, 10:00-14:00 UTC (avoid Monday/Friday)
- **Traffic:** Monitor Cloudflare Analytics for typical low-traffic window
- **Team Availability:** Ensure 2+ engineers available for 4 hours post-deploy

---

### Step 3.2: Production Deploy

**Command:**
```bash
npx wrangler deploy
```

**Expected Output:**
```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded pix-immo-api (X.XX sec)
Published pix-immo-api (X.XX sec)
  https://pix-immo-api.workers.dev
  https://api.pix.immo
Current Deployment ID: deployment-xyz789...
```

**⏱️ Deployment Time:** ~30 seconds (global edge propagation)

---

### Step 3.3: Immediate Verification (T+0 to T+5 min)

**Test 1: /qa Endpoint (Production)**
```bash
curl -i https://api.pix.immo/api/qa
```

**Expected:**
- ✅ Status 200
- ✅ `environment: "production"` (not "preview")
- ✅ `canary.percent: 10`
- ✅ `emergency_proxy: false`
- ✅ All health checks: `"ok"`

**Test 2: Sample 100 Requests (Cohort Distribution)**
```bash
for i in {1..100}; do
  curl -s https://api.pix.immo/api/qa | jq -r '.canary.cohort'
done | sort | uniq -c
```

**Expected Output:**
```
  10 native
  90 proxy
```

**Validation:**
- ✅ ~10% native (±3% variance acceptable)
- ✅ ~90% proxy

**❌ If distribution is wrong (e.g., 50/50 or 0/100):**
```bash
# Check KV config
npx wrangler kv:key get --binding=KV_CANARY_CONFIG config

# If incorrect, update immediately
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

---

### Step 3.4: Slack Notification

**Post to #deployments:**
```
🚀 B2a Production Deploy LIVE

Environment: Production (https://api.pix.immo)
Canary: 10% native, 90% proxy
Deploy Time: 2025-11-12 14:30 UTC
Status: ✅ Healthy (all checks passing)

Monitoring:
- Analytics: https://dash.cloudflare.com/.../analytics
- Logs: R2 bucket logs-canary
- Rollback: docs/runbooks/rollback_b2a.md

On-Call: @engineer1, @engineer2
Next Review: +24h (2025-11-13 14:30 UTC)
```

---

## Phase 4: Logpush Configuration (Dashboard UI)

**⚠️ IMPORTANT:** Logpush must be configured via Cloudflare Dashboard (not CLI).

Follow detailed instructions in: **`docs/B2a-LOGPUSH-SETUP.md`**

**Quick Setup Summary:**

1. **Create R2 Bucket:**
   ```bash
   npx wrangler r2 bucket create logs-canary
   ```

2. **Enable Logpush (Dashboard):**
   - Path: Cloudflare Dashboard → Analytics & Logs → Logpush
   - Dataset 1: HTTP Requests → R2 `logs-canary/b2a/http_requests/`
   - Dataset 2: Workers Trace Events → R2 `logs-canary/b2a/workers_trace_events/`
   - Format: JSON (gzip)
   - Sampling: 100% (canary already 10%)

3. **Verify Logs Appear (15 min wait):**
   ```bash
   npx wrangler r2 object list logs-canary --prefix b2a/
   ```

**Expected:**
```
b2a/http_requests/2025/11/12/14/20251112_14_abc123.log.gz
b2a/workers_trace_events/2025/11/12/14/20251112_14_xyz789.log.gz
```

---

## Phase 5: 24-Hour Monitoring

### Monitoring Schedule

| Time | Action | Metrics to Check |
|------|--------|------------------|
| **T+0 (Deploy)** | Immediate verification | /qa endpoint, cohort distribution |
| **T+30min** | First check-in | Error rate, latency p50/p90 |
| **T+2h** | Stability review | No anomalies, log volume normal |
| **T+6h** | Evening check (if deployed morning) | Traffic patterns stable |
| **T+12h** | Overnight monitoring (automated alerts) | PagerDuty on-call |
| **T+24h** | GO/NO-GO decision | Full metrics review |

---

### Key Metrics (Cloudflare Analytics)

**Dashboard Path:** Workers & Pages → pix-immo-api → Analytics

**Panel 1: Requests by Cohort**
- **Metric:** Total Requests
- **Group By:** `X-Pix-Canary` header → Extract `cohort` value
- **Expected:** ~10% native, ~90% proxy (consistent over 24h)
- **Alert:** Ratio shifts >±5% → Investigate

**Panel 2: Error Rate (5xx) by Cohort**
- **Metric:** `(Status >= 500) / Total * 100`
- **Group By:** `cohort`
- **Expected:**
  - Native: < 1.5%
  - Proxy: < 1.0%
- **Alert:**
  - Native > 1.5% for 5 min → ⚠️ Warning
  - Native > 3.0% for 3 min → 🚨 Critical (NOT-AUS)

**Panel 3: Latency p50/p90/p99**
- **Metric:** `EdgeTimeToFirstByteMs`
- **Group By:** `cohort`
- **Expected:**
  - Native p50: < 300ms
  - Native p90: < 600ms
  - Native p99: < 1200ms
- **Alert:**
  - Native p90 > 600ms for 10 min → ⚠️ Warning
  - Native p90 > Proxy + 20% for 5 min → ⚠️ Warning

**Panel 4: Request Volume Over Time**
- **Metric:** Total Requests (hourly aggregation)
- **Expected:** Consistent traffic patterns (matches historical baseline)
- **Alert:** Sudden drop >30% → Investigate (possible routing issue)

---

### Automated Alerts (Recommended Setup)

**Configure in Cloudflare Notifications:**

**Alert 1: High Error Rate (Native)**
- Condition: `error_rate_native > 1.5%` for 5 minutes
- Action: PagerDuty page + Slack #incidents
- Severity: Warning

**Alert 2: Critical Error Rate (Native)**
- Condition: `error_rate_native > 3.0%` for 3 minutes
- Action: PagerDuty urgent + Slack #incidents
- Severity: Critical
- Runbook: docs/runbooks/rollback_b2a.md (NOT-AUS)

**Alert 3: High Latency (Native)**
- Condition: `latency_p90_native > 600ms` for 10 minutes
- Action: PagerDuty page + Slack #incidents
- Severity: Warning

**Alert 4: R2 Upload Failures**
- Condition: `r2_upload_errors > 5/min` for 3 minutes
- Action: PagerDuty urgent
- Severity: Critical

---

### Manual Checks (Every 2 Hours)

**Script:** `scripts/b2a-health-check.sh` (create this)

```bash
#!/bin/bash
# B2a Health Check - Run every 2 hours during 24h monitoring

echo "==================================================="
echo "B2a Health Check - $(date)"
echo "==================================================="

# 1. Check /qa endpoint
echo ""
echo "1. /qa Endpoint:"
curl -s https://api.pix.immo/api/qa | jq '{
  canary: .canary,
  health: .health
}'

# 2. Sample cohort distribution
echo ""
echo "2. Cohort Distribution (100 samples):"
for i in {1..100}; do
  curl -s https://api.pix.immo/api/qa | jq -r '.canary.cohort'
done | sort | uniq -c

# 3. Check recent logs
echo ""
echo "3. Recent Logs (last 2 files):"
npx wrangler r2 object list logs-canary --prefix b2a/workers_trace_events/ | tail -2

# 4. Error log sample (if any)
echo ""
echo "4. Recent Errors (if any):"
LATEST_LOG=$(npx wrangler r2 object list logs-canary --prefix b2a/workers_trace_events/ | tail -1 | awk '{print $1}')
if [ -n "$LATEST_LOG" ]; then
  npx wrangler r2 object get "logs-canary/$LATEST_LOG" --file=/tmp/latest.log.gz
  gunzip -c /tmp/latest.log.gz | jq 'select(.Logs.Level=="ERROR")' | head -3
  rm -f /tmp/latest.log.gz
fi

echo ""
echo "==================================================="
echo "Health Check Complete"
echo "==================================================="
```

**Make executable:**
```bash
chmod +x scripts/b2a-health-check.sh
```

**Usage:**
```bash
./scripts/b2a-health-check.sh
```

---

## Phase 6: GO/NO-GO Decision (T+24h)

### Decision Matrix

**GO (Proceed to B2b - 25% Rollout):**
- ✅ Error rate (native) < 1.5% (averaged over 24h)
- ✅ Latency p90 (native) < 600ms
- ✅ Latency p90 (native) ≤ Proxy + 20%
- ✅ No incidents requiring rollback
- ✅ Upload flow working (no orphaned intents)
- ✅ Logs delivering to R2 consistently
- ✅ Team consensus: stable

**NO-GO (Rollback to 0%, Fix Issues):**
- ❌ Error rate (native) > 2.0% sustained
- ❌ Latency p90 (native) > 800ms sustained
- ❌ Any critical incidents (NOT-AUS triggered)
- ❌ Data loss or orphaned uploads
- ❌ Team concern: risk too high

**HOLD (Maintain 10%, Investigate Further):**
- ⚠️ Error rate 1.5%-2.0% (borderline)
- ⚠️ Latency regression 10%-20%
- ⚠️ Minor issues resolved but need observation
- ⚠️ Low traffic period (insufficient data)

---

### GO Decision - Next Steps

**If metrics healthy after 24h:**

1. **Document Success:**
   ```bash
   # Create success report
   cat > docs/QA/GO_NO_GO_PROD_B2a.md <<EOF
   # B2a Production Rollout - SUCCESS

   **Date:** 2025-11-12 14:30 - 2025-11-13 14:30 UTC
   **Duration:** 24 hours
   **Traffic:** ~1M requests (10% canary = 100k native)

   ## Metrics Summary

   | Metric | Native | Proxy | Target | Status |
   |--------|--------|-------|--------|--------|
   | Error Rate | 0.8% | 0.6% | <1.5% | ✅ PASS |
   | Latency p50 | 245ms | 230ms | <300ms | ✅ PASS |
   | Latency p90 | 520ms | 480ms | <600ms | ✅ PASS |
   | Latency p99 | 980ms | 920ms | <1200ms | ✅ PASS |

   ## Incidents

   None.

   ## Decision

   **GO** - Proceed to B2b (25% rollout)

   ## Sign-Off

   - Tech Lead: [Name]
   - DevOps: [Name]
   - Date: 2025-11-13 14:30 UTC
   EOF
   ```

2. **Increase to 25% (B2b):**
   ```bash
   npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
     --value '{"canary_percent":25,"canary_tag":"B2b","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
   ```

3. **Monitor B2b for 48h** (repeat monitoring process)

---

### NO-GO Decision - Rollback

**If metrics fail after 24h:**

1. **Execute Rollback:**
   ```bash
   # Disable canary (0%, no emergency flag)
   npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
     --value '{"canary_percent":0,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
   ```

2. **Create Post-Mortem:**
   - Follow template in `docs/runbooks/rollback_b2a.md` Section 6
   - Root cause analysis
   - Fix plan
   - Re-rollout timeline

3. **Team Debrief:**
   - What went wrong?
   - What metrics missed the issue?
   - How to prevent in future?

---

## Appendix: Quick Reference Commands

### Check Canary Status
```bash
curl https://api.pix.immo/api/qa | jq '.canary'
```

### Update Canary Percentage
```bash
# 10% → 5%
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":5,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

# 10% → 25% (B2b)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":25,"canary_tag":"B2b","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

### Emergency Rollback
```bash
# NOT-AUS (100% proxy)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":0,"canary_tag":"B2a","emergency_proxy":true,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

### View Logs
```bash
# List log files
npx wrangler r2 object list logs-canary --prefix b2a/

# Download latest
npx wrangler r2 object get logs-canary/<file>.log.gz --file=latest.log.gz
gunzip latest.log.gz
cat latest.log | jq 'select(.level=="ERROR")'
```

---

## Success Criteria Summary

**B2a Rollout Successful If:**
- ✅ 10% traffic routed to native handlers
- ✅ Error rate < 1.5%
- ✅ Latency p90 < 600ms
- ✅ No data loss or orphaned uploads
- ✅ Rollback tested and verified working
- ✅ 24-hour stability confirmed

**Next Milestone:** B2b - 25% Rollout (48-hour observation)

---

**End of B2a.7 Production Deploy Guide**
