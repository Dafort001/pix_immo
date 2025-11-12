# B2a Logpush Setup Guide

**Cloudflare Dashboard-Based Configuration**

Last Updated: 2025-11-12

---

## Prerequisites

- ✅ Cloudflare Workers deployed (`npx wrangler deploy`)
- ✅ B2a canary middleware active (structured logs enabled)
- ✅ Cloudflare account with Workers Analytics access

---

## 1. Create R2 Bucket for Logs

**Option A: Wrangler CLI (Recommended)**

```bash
npx wrangler r2 bucket create logs-canary
```

**Option B: Cloudflare Dashboard**

1. Navigate to **R2 → Create Bucket**
2. Name: `logs-canary`
3. Location: Auto (default)
4. Click **Create Bucket**

---

## 2. Enable Logpush (Dashboard UI)

**Path:** Cloudflare Dashboard → Account → Analytics & Logs → Logpush

### Dataset 1: HTTP Requests

**Purpose:** Request-level metrics (status codes, latency, headers)

1. Click **Create Logpush Job**
2. **Dataset:** Select `HTTP requests (http_requests)`
3. **Destination:** 
   - Type: `R2`
   - Bucket: `logs-canary`
   - Path prefix: `b2a/http_requests/`
4. **Output Format:** `JSON (Newline-delimited)`
5. **Compression:** `gzip` (recommended)
6. **Fields to Include:**
   - `ClientIP`
   - `EdgeStartTimestamp`
   - `RayID`
   - `ClientRequestHost`
   - `ClientRequestMethod`
   - `ClientRequestPath`
   - `EdgeResponseStatus`
   - `OriginResponseStatus`
   - `EdgeTimeToFirstByteMs`
   - `UserAgent`
   - **Custom Headers (Whitelist):**
     - `X-Pix-Canary` (cohort tracking)
     - `X-Pix-Error` (error correlation)
7. **Sampling Rate:** 100% (for 10% canary traffic)
8. Click **Save & Enable**

**Expected Output Path:**
```
r2://logs-canary/b2a/http_requests/YYYY/MM/DD/HH/YYYYMMDD_HH_<batch-id>.log.gz
```

---

### Dataset 2: Workers Trace Events

**Purpose:** Application-level logs (console.log, console.error, exceptions)

1. Click **Create Logpush Job**
2. **Dataset:** Select `Workers Trace Events (workers_trace_events)`
3. **Destination:**
   - Type: `R2`
   - Bucket: `logs-canary`
   - Path prefix: `b2a/workers_trace_events/`
4. **Output Format:** `JSON (Newline-delimited)`
5. **Compression:** `gzip`
6. **Fields to Include:**
   - `ScriptName`
   - `EventTimestampMs`
   - `Logs.Message` (JSON structured logs)
   - `Logs.Level` (info, warn, error)
   - `Outcome` (success, exception)
   - `Exceptions` (stack traces)
7. **Filters (Optional):**
   - Include: `Logs.Message contains "cohort"` (canary logs only)
8. Click **Save & Enable**

**Expected Output Path:**
```
r2://logs-canary/b2a/workers_trace_events/YYYY/MM/DD/HH/YYYYMMDD_HH_<batch-id>.log.gz
```

---

## 3. Verify Logpush

**Wait Time:** First logs appear within 5-15 minutes after enabling Logpush.

### Check R2 Bucket (Wrangler CLI)

```bash
# List recent logs
npx wrangler r2 object list logs-canary --prefix b2a/

# Expected output:
# b2a/http_requests/2025/11/12/08/20251112_08_abc123.log.gz
# b2a/workers_trace_events/2025/11/12/08/20251112_08_xyz789.log.gz
```

### Download & Inspect Logs

```bash
# Download HTTP request logs
npx wrangler r2 object get logs-canary/b2a/http_requests/2025/11/12/08/20251112_08_abc123.log.gz \
  --file=http_requests.log.gz

# Extract and view
gunzip http_requests.log.gz
head -n 5 http_requests.log

# Parse with jq (cohort distribution)
cat http_requests.log | jq -r '.ClientRequestHeaders."X-Pix-Canary"' | sort | uniq -c
# Expected:
#   90 1;tag=B2a;cohort=proxy;reason=sampled
#   10 1;tag=B2a;cohort=native;reason=sampled
```

---

## 4. Dashboard Analytics Setup

**Path:** Cloudflare Dashboard → Workers & Pages → Analytics

### Panel A: Requests by Cohort

**Purpose:** Verify 10:90 canary:proxy ratio

1. **Metric:** `Requests`
2. **Filter:** None (all traffic)
3. **Group By:** `ClientRequestHeaders."X-Pix-Canary"` → Extract `cohort` value
4. **Time Range:** Last 24 hours
5. **Visualization:** Pie Chart or Stacked Bar

**Expected Ratio:**
- `cohort=native`: ~10%
- `cohort=proxy`: ~90%

---

### Panel B: Error Rate by Cohort

**Purpose:** Ensure native handlers don't increase errors

1. **Metric:** `Error Rate (%)` 
   - Formula: `(Status >= 500) / Total Requests * 100`
2. **Group By:** `cohort` (from X-Pix-Canary header)
3. **Time Range:** Last 24 hours
4. **Alert Threshold:**
   - Native: < 1.5%
   - Proxy: < 1.0%

**GO/NO-GO Criteria:**
- ✅ Native error rate ≤ Proxy + 0.5%
- ❌ Native error rate > Proxy + 1% → ROLLBACK

---

### Panel C: Latency (p50/p90/p99)

**Purpose:** Detect native handler performance regressions

1. **Metric:** `EdgeTimeToFirstByteMs`
2. **Aggregation:** Percentiles (p50, p90, p99)
3. **Group By:** `cohort`
4. **Time Range:** Last 24 hours
5. **Alert Threshold:**
   - Native p90 < 600ms
   - Native p90 ≤ Proxy p90 + 20%

**Example Target:**
- Proxy p90: 450ms → Native p90 must be < 540ms

---

### Panel D: Rollout Timeline

**Purpose:** Track canary percentage changes over time

1. **Metric:** `Requests (Total)`
2. **Group By:** `canary_tag` (from X-Pix-Canary)
3. **Time Range:** Last 7 days
4. **Annotations:**
   - B2a Start: 2025-11-12 08:00
   - KV Update (10% → 25%): 2025-11-14 14:00
   - Full Rollout (100%): 2025-11-18 10:00

---

## 5. Cost Estimates

### Logpush Costs

| Component | Volume (10% Canary) | Cost |
|-----------|---------------------|------|
| Logpush Write | ~500 MB/day | $0.75/month |
| R2 Storage (30 days) | ~15 GB | $0.23/month |
| **Total** | | **~$1/month** |

**Optimization:**
- ✅ 10% sampling for SUCCESS logs (shared/observability.ts)
- ✅ 100% logging for ERROR logs (no sampling)
- ✅ gzip compression (~70% reduction)
- ✅ 30-day retention (auto-delete via R2 lifecycle)

---

## 6. Troubleshooting

### No Logs Appearing

**Check 1: Logpush Job Status**
```bash
# List active Logpush jobs
curl -X GET "https://api.cloudflare.com/client/v4/accounts/{account_id}/logpush/jobs" \
  -H "Authorization: Bearer {api_token}"

# Expected: "enabled": true
```

**Check 2: Worker Deployment**
```bash
npx wrangler deploy

# Verify structured logs:
# - console.log outputs JSON
# - Contains "cohort" field
```

**Check 3: R2 Bucket Permissions**
- Ensure Logpush has write access to `logs-canary`
- Check bucket CORS settings (not required for Logpush)

### Incorrect Cohort Ratios

**Symptom:** Native:Proxy ratio not 10:90

**Fix:**
```bash
# Check KV config
npx wrangler kv:key get --binding=KV_CANARY_CONFIG config

# Expected: {"canary_percent":10, ...}

# Update if incorrect:
npx wrangler kv:key put --binding=KV_CANARY_CONFIG config \
  --value '{"canary_percent":10,"canary_tag":"B2a","emergency_proxy":false}'
```

---

## Next Steps

1. ✅ Verify logs appear in R2 bucket (5-15 min)
2. ✅ Create Analytics dashboards (4 panels)
3. ✅ Set alert thresholds (error rate, latency)
4. → Proceed to **B2a.6: Rollback Procedures**
