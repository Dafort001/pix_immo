# B2a Rollback Runbook

**HALT Phase B2a - Emergency Procedures & Incident Response**

Last Updated: 2025-11-12

---

## Overview

This runbook provides immediate response procedures for B2a canary rollout incidents. All rollback actions use Workers KV for instant execution without redeployment.

**Rollback Capability:**
- ⏱️ **Response Time:** < 30 seconds (KV propagation)
- 🔄 **No Redeploy:** All changes via KV configuration
- 📊 **Verification:** `/qa` endpoint for instant validation
- 🎯 **Granular Control:** Emergency stop, gradual reduction, or complete disable

**Prerequisites:**
- ✅ wrangler CLI authenticated (`npx wrangler login`)
- ✅ KV namespace configured (`KV_CANARY_CONFIG`)
- ✅ Access to Cloudflare Analytics dashboards
- ✅ Access to PagerDuty/Slack alerts (if configured)

---

## 1. Incident Detection - Alert Thresholds

### Automated Alerts (Recommended Setup)

| Metric | Threshold | Duration | Action |
|--------|-----------|----------|--------|
| **Error Rate (Native)** | > 1.5% | 5 minutes | ⚠️ Warning → Reduce sampling |
| **Error Rate (Native)** | > 3.0% | 3 minutes | 🚨 Critical → Emergency rollback |
| **Latency p90 (Native)** | > 600ms | 10 minutes | ⚠️ Warning → Investigate |
| **Latency p90 (Native)** | > Proxy + 20% | 5 minutes | ⚠️ Warning → Reduce sampling |
| **Latency p90 (Native)** | > Proxy + 50% | 3 minutes | 🚨 Critical → Emergency rollback |
| **R2 Upload Failures** | > 5/min | 3 minutes | 🚨 Critical → Emergency rollback |
| **Orphaned Intents** | > 10/hour | N/A | ⚠️ Warning → Investigate |

### Manual Monitoring (Cloudflare Dashboard)

**Path:** Workers & Pages → Analytics → Custom Panels

**Check These Panels Every Hour (during rollout):**
1. **Requests by Cohort** - Verify 10:90 ratio maintained
2. **Error Rate by Cohort** - Native vs Proxy comparison
3. **Latency p90** - Performance regression detection
4. **Rollout Timeline** - Traffic distribution over time

---

## 2. Rollback Decision Tree

```
┌─────────────────────────────────────┐
│ Incident Detected (Alert Triggered)│
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Severity Assessment│
    └───┬────────────┬───┘
        │            │
   CRITICAL      WARNING
        │            │
        ▼            ▼
┌──────────────┐  ┌──────────────┐
│ A) NOT-AUS   │  │ B) Reduce %  │
│ (100% Proxy) │  │ (10% → 5%)   │
└──────────────┘  └──────────────┘
        │            │
        └────┬───────┘
             ▼
    ┌─────────────────┐
    │ Validate (5 min)│
    └────┬────────────┘
         │
    ┌────▼─────┐
    │ Resolved?│
    └─┬────┬───┘
      │    │
     YES   NO
      │    │
      │    └──► ┌────────────────┐
      │         │ C) Disable (0%)│
      │         └────────────────┘
      ▼
┌────────────────────┐
│ Return to Normal   │
│ (emergency=false)  │
└────────────────────┘
```

---

## 3. Rollback Procedures

### A) NOT-AUS - Emergency Proxy (100% Fallback)

**When to Use:**
- 🚨 Error rate (native) > 3% for 3 minutes
- 🚨 Latency p90 > Proxy + 50% for 3 minutes
- 🚨 R2 upload failures spiking (> 5/min)
- 🚨 Database connection errors (native handlers)
- 🚨 Any critical production incident affecting users

**Command:**
```bash
# ⚠️ EMERGENCY: Force 100% traffic to proxy immediately
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":0,"canary_tag":"B2a","emergency_proxy":true,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Verification:**
```bash
# Check /qa endpoint (expect: cohort=proxy, reason=emergency)
curl -i https://api.pix.immo/api/qa | grep "X-Pix-Canary"
# Expected: X-Pix-Canary: 1;tag=B2a;cohort=proxy;reason=emergency

# Verify KV config
npx wrangler kv:key get --binding=KV_CANARY_CONFIG config
# Expected: {"canary_percent":0,"canary_tag":"B2a","emergency_proxy":true,...}
```

**Effect:**
- ⏱️ Takes effect in < 30 seconds (KV propagation)
- ✅ All traffic routes to proxy (native handlers bypassed)
- ✅ Sticky cookies ignored (emergency flag overrides all logic)
- ✅ Users experience no interruption (proxy = stable production)

**Post-Rollback:**
1. Monitor error rate for 5 minutes → should drop immediately
2. Verify Analytics dashboard shows 100% proxy traffic
3. Begin incident investigation (see Section 5)

---

### B) Reduce Sampling (10% → 5%)

**When to Use:**
- ⚠️ Error rate (native) > 1.5% for 5 minutes
- ⚠️ Latency p90 approaching threshold (550-600ms)
- ⚠️ Gradual degradation (not critical yet)
- ⚠️ Precautionary measure during high traffic events

**Command:**
```bash
# Reduce canary traffic from 10% to 5%
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":5,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Verification:**
```bash
# Check /qa endpoint
curl https://api.pix.immo/api/qa | jq '.canary'
# Expected: {"percent":5,"tag":"B2a","emergency_proxy":false,...}

# Monitor cohort distribution (5 minutes)
# Analytics should show ~5% native, ~95% proxy
```

**Effect:**
- ⏱️ Takes effect in < 30 seconds
- ✅ Reduces load on native handlers by 50%
- ✅ Existing users with native cookies remain in native cohort (sticky)
- ✅ New users sampled at 5% instead of 10%

**Post-Reduction:**
1. Monitor error rate for 10 minutes
2. If resolved → maintain 5% for 24 hours → gradually increase
3. If unresolved → proceed to Option C (Disable)

---

### C) Disable Sampling (0%, No Emergency Flag)

**When to Use:**
- ⚠️ Reduction to 5% didn't resolve issue
- ⚠️ Planned maintenance on native handlers
- ⚠️ Investigating database/R2 issues
- ⚠️ Non-urgent rollback (controlled shutdown)

**Command:**
```bash
# Disable canary sampling (0% native, no emergency flag)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":0,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Verification:**
```bash
curl https://api.pix.immo/api/qa | jq '.canary'
# Expected: {"percent":0,"tag":"B2a","emergency_proxy":false,...}
```

**Effect:**
- ⏱️ Takes effect in < 30 seconds
- ✅ No new users assigned to native cohort
- ✅ Existing users with native cookies still route to native (sticky behavior)
- ⚠️ **Not an emergency stop** (cookies still honored)

**Difference from Emergency Proxy:**
- `emergency_proxy=false, percent=0`: Sticky cookies still work (gradual wind-down)
- `emergency_proxy=true, percent=0`: All traffic to proxy (instant stop)

---

## 4. Return to Normal Operation

**Prerequisites:**
- ✅ Root cause identified and fixed
- ✅ Error rate normalized (< 1%)
- ✅ Latency within acceptable range (< 500ms)
- ✅ Post-mortem documented (see Section 6)

**Command:**
```bash
# Restore 10% canary rollout
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'
```

**Verification:**
```bash
# Verify restoration
curl https://api.pix.immo/api/qa | jq '.canary'
# Expected: {"percent":10,"tag":"B2a","emergency_proxy":false,...}

# Monitor for 1 hour
# - Error rate should remain < 1.5%
# - Latency p90 should remain < 600ms
# - No new incidents triggered
```

**Gradual Re-Rollout (If Needed):**
```bash
# Step 1: Start at 5% (conservative)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":5,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

# Wait 2 hours, monitor metrics

# Step 2: Increase to 10% (if stable)
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false,"last_updated":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}'

# Wait 24 hours, monitor metrics

# Step 3: Continue rollout (B2b: 25%, 50%, 100%)
```

---

## 5. Incident Investigation

### Immediate Actions (During Incident)

1. **Capture Logs:**
   ```bash
   # Download recent logs for forensic analysis
   npx wrangler r2 object list logs-canary --prefix b2a/ | tail -10
   npx wrangler r2 object get logs-canary/<latest-log>.gz --file=incident.log.gz
   gunzip incident.log.gz
   ```

2. **Check Cloudflare Analytics:**
   - Error rate spike timestamp
   - Affected endpoints (which routes failed)
   - Geographic distribution (region-specific issue?)
   - User-agent patterns (mobile vs desktop)

3. **Query Workers Logs:**
   ```bash
   # Extract error logs
   cat incident.log | jq 'select(.level=="ERROR")' > errors.json
   
   # Group by error message
   cat errors.json | jq -r '.context.error' | sort | uniq -c | sort -nr
   ```

4. **Database Health Check:**
   ```bash
   # Connect to database, check connection pool
   psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity;"
   
   # Check for long-running queries
   psql $DATABASE_URL -c "SELECT pid, now() - query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC LIMIT 10;"
   ```

5. **R2 Bucket Status:**
   ```bash
   # Check bucket availability
   npx wrangler r2 bucket list | grep piximmo-media
   
   # Test write operation
   echo "test" | npx wrangler r2 object put piximmo-media/health-check.txt --pipe
   ```

---

### Root Cause Categories

**Common B2a Issues:**

| Category | Symptoms | Investigation |
|----------|----------|---------------|
| **Native Handler Bug** | High error rate (5xx) | Check exception logs, stack traces |
| **Database Connection** | Timeouts, connection pool exhausted | Check Neon dashboard, connection count |
| **R2 Latency** | Slow uploads, timeouts | Check R2 region, network latency |
| **Session Drift** | Orphaned intents, 404s | Verify sticky cookie logic, database queries |
| **KV Propagation** | Config changes delayed | Check KV replication status, edge locations |

---

## 6. Post-Incident Documentation

**Create:** `docs/INCIDENTS/YYYY-MM-DD_b2a_incident.md`

**Template:**
```markdown
# B2a Incident - [Brief Description]

**Date:** 2025-11-12
**Severity:** Critical / Warning
**Duration:** 14:30 - 14:45 UTC (15 minutes)
**Impact:** ~500 users experienced errors (~0.05% of traffic)

## Timeline (UTC)

- **14:25** - Error rate alert triggered (native: 2.5%)
- **14:28** - On-call engineer notified via PagerDuty
- **14:30** - Emergency rollback executed (NOT-AUS)
- **14:32** - Error rate drops to < 0.5%
- **14:35** - Investigation begins (log analysis)
- **14:45** - Root cause identified (database connection pool)

## Root Cause

Native upload handlers exhausted database connection pool due to missing `pg.pool.max` configuration. Default pool size (10) insufficient for 10% traffic load during peak hours.

## Impact Analysis

- **Users Affected:** ~500 (upload failures)
- **Requests Failed:** 1,250 (0.05% of total)
- **Data Loss:** None (intents preserved, users retried)
- **Revenue Impact:** None (free tier users)

## Fix

1. Updated database pool config: `pg.pool.max = 50`
2. Added pool monitoring (Grafana dashboard)
3. Set alert: pool utilization > 80% → PagerDuty

## Prevention

- [ ] Add connection pool metrics to /qa endpoint
- [ ] Pre-production load testing (simulate 10% traffic)
- [ ] Gradual rollout validation (5% → 10% → 25%)
- [ ] Runbook update: connection pool troubleshooting

## Lessons Learned

1. **Load testing critical:** Native handlers need production-scale testing
2. **Observability gaps:** Missing connection pool metrics delayed diagnosis
3. **Rollback effective:** KV-based emergency stop worked as designed

## Sign-Off

- **Incident Commander:** [Name]
- **Date Closed:** 2025-11-12 15:00 UTC
```

---

## 7. Communication Templates

### Internal Slack (During Incident)

```
🚨 B2a Incident - Emergency Rollback Executed

Status: RESOLVED
Time: 14:30 UTC
Action: Emergency proxy enabled (100% fallback)
Impact: ~500 users (0.05% traffic)
Next: Investigation ongoing, ETA 30 min

Updates: #incidents channel
```

### User-Facing Status Page (If Needed)

```
Investigating Performance Issues

We're currently experiencing degraded performance on upload endpoints.
Our team has implemented a fix and is monitoring the situation.

Most users are unaffected. Upload functionality remains available.

Update: 14:35 UTC - Issue resolved. Uploads processing normally.
```

---

## 8. Runbook Validation Checklist

**Test Emergency Procedures Quarterly:**

- [ ] Execute NOT-AUS in staging environment
- [ ] Verify KV propagation time (< 30 seconds)
- [ ] Confirm /qa endpoint reflects changes
- [ ] Test gradual rollback (10% → 5% → 0%)
- [ ] Practice return to normal operation
- [ ] Review alert thresholds (adjust if needed)
- [ ] Update contact lists (PagerDuty, Slack)

**Last Tested:** 2025-11-12 (B2a.5 Integration Tests)

---

## Quick Reference Card

**Print and keep near workstation:**

```
═══════════════════════════════════════════════════
        B2a EMERGENCY ROLLBACK CHEAT SHEET
═══════════════════════════════════════════════════

🚨 NOT-AUS (100% Proxy):
wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":0,"canary_tag":"B2a",
  "emergency_proxy":true,"last_updated":"<NOW>"}'

⚠️ REDUCE (10% → 5%):
wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":5,"canary_tag":"B2a",
  "emergency_proxy":false,"last_updated":"<NOW>"}'

🔄 RESTORE (Back to 10%):
wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a",
  "emergency_proxy":false,"last_updated":"<NOW>"}'

📊 VERIFY:
curl https://api.pix.immo/api/qa | jq '.canary'

═══════════════════════════════════════════════════
On-Call: [PagerDuty Rotation]
Slack: #incidents
Docs: docs/runbooks/rollback_b2a.md
═══════════════════════════════════════════════════
```

---

## Next: B2a.7 Production Validation

After reviewing rollback procedures, proceed to **B2a.7 - Production Deploy** for live canary rollout with 24-hour monitoring and GO/NO-GO decision.
