# B2a Observability Stack

**HALT Phase B2a - Production Canary Monitoring**

Last Updated: 2025-11-12

---

## Overview

B2a observability infrastructure enables real-time monitoring of canary rollout health, sticky cohort behavior, and error/latency metrics. This stack ensures safe gradual rollout with instant rollback capability.

**Architecture:**
- **Structured Logging** → Cloudflare Workers Logs → Logpush → R2 Storage
- **Real-time Analytics** → Cloudflare Workers Analytics → GraphQL API
- **Alert System** → Analytics Engine → Email/PagerDuty notifications

---

## 1. Structured Logging

### Log Format (JSON)

All canary requests generate structured JSON logs:

```json
{
  "timestamp": "2025-11-12T08:00:00.123Z",
  "level": "INFO",
  "message": "Canary request processed",
  "context": {
    "cohort": "native",
    "decision_reason": "sampled",
    "canary_tag": "B2a",
    "request_path": "/api/uploads/intent",
    "method": "POST",
    "status_code": 200,
    "duration_ms": 45
  },
  "request_id": "req_1762934000123_a4b2c9d"
}
```

### Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| `INFO` | Successful requests, cohort assignments | `"Canary request processed"` |
| `WARN` | Degraded health, slow responses | `"R2 operation slow (>500ms)"` |
| `ERROR` | Failed requests, R2 errors | `"Canary request failed"` |

### Key Log Fields

| Field | Description | Example |
|-------|-------------|---------|
| `cohort` | Traffic cohort (`native` or `proxy`) | `"native"` |
| `decision_reason` | Cohort assignment reason | `"sampled"`, `"cookie"`, `"emergency"` |
| `canary_tag` | Deployment tag (KV config) | `"B2a"`, `"B2b"` |
| `request_path` | API endpoint | `"/api/uploads/intent"` |
| `status_code` | HTTP status | `200`, `500` |
| `duration_ms` | Request latency | `45` |
| `request_id` | Unique request ID (correlation) | `"req_1762934000123_a4b2c9d"` |
| `upload_intent_id` | Upload flow tracking | `"intent_01HQWXYZ..."` |
| `r2_operation` | R2 operation type | `"put"`, `"get"` |
| `error` | Error message (on failures) | `"R2 bucket unavailable"` |

---

## 2. Logpush Configuration

### Setup (Cloudflare Dashboard)

1. **Navigate to Workers → Logs → Logpush**
2. **Create Destination:**
   - Type: `R2`
   - Bucket: `logs-canary`
   - Path: `b2a/`
3. **Filter Logs:**
   - Include: `context.cohort != null` (only canary requests)
   - Exclude: `status_code == 304` (skip not-modified responses)
4. **Compression:** `gzip` (reduce storage costs)
5. **Retention:** 30 days (compliance + cost balance)

### Logpush Destination

```
r2://logs-canary/b2a/YYYY/MM/DD/HH/YYYYMMDD_HH_<worker-name>_<batch-id>.log.gz
```

**Example:** `r2://logs-canary/b2a/2025/11/12/08/20251112_08_pix-api_abc123.log.gz`

### Query Logs (Wrangler CLI)

```bash
# List recent logs
wrangler r2 object list logs-canary --prefix b2a/2025/11/12

# Download logs for analysis
wrangler r2 object get logs-canary/b2a/2025/11/12/08/20251112_08_pix-api_abc123.log.gz \
  --file=./logs_20251112_08.log.gz

# Extract and parse
gunzip ./logs_20251112_08.log.gz
cat ./logs_20251112_08.log | jq '.context.cohort' | sort | uniq -c
```

### Cost Optimization

- **Logpush:** $0.05 per GB written
- **R2 Storage:** $0.015 per GB/month
- **Estimated Cost (B2a):** ~$2/month for 10% canary traffic

---

## 3. Analytics Dashboards

### Cloudflare Workers Analytics

**Access:** Cloudflare Dashboard → Workers → Analytics → GraphQL API

**GraphQL Endpoint:** `https://api.cloudflare.com/client/v4/graphql`

**Authentication:** `Authorization: Bearer <API_TOKEN>` (Analytics Read scope)

### Query 1: Canary Traffic Distribution

```graphql
query CanaryTrafficDistribution {
  viewer {
    zones(filter: { zoneTag: "<ZONE_ID>" }) {
      workersInvocationsAdaptive(
        filter: {
          datetime_geq: "2025-11-12T00:00:00Z"
          datetime_lt: "2025-11-13T00:00:00Z"
        }
        limit: 1000
      ) {
        sum {
          requests
        }
        dimensions {
          canary_cohort: customData1  # Custom dimension
        }
      }
    }
  }
}
```

**Expected Output:**
```json
{
  "native": 1234,   // 10% traffic
  "proxy": 11106    // 90% traffic
}
```

### Query 2: Error Rate by Cohort

```graphql
query CanaryErrorRate {
  viewer {
    zones(filter: { zoneTag: "<ZONE_ID>" }) {
      workersInvocationsAdaptive(
        filter: {
          datetime_geq: "2025-11-12T00:00:00Z"
          datetime_lt: "2025-11-13T00:00:00Z"
          status_gte: 400
        }
        limit: 1000
      ) {
        sum {
          requests
        }
        dimensions {
          canary_cohort: customData1
          status
        }
      }
    }
  }
}
```

**Expected Output:**
```json
{
  "native": { "400": 5, "500": 2 },  // 7 errors / 1234 requests = 0.57% error rate
  "proxy": { "400": 10, "500": 3 }   // 13 errors / 11106 requests = 0.12% error rate
}
```

### Query 3: Latency Percentiles (p50, p90, p99)

```graphql
query CanaryLatency {
  viewer {
    zones(filter: { zoneTag: "<ZONE_ID>" }) {
      workersInvocationsAdaptive(
        filter: {
          datetime_geq: "2025-11-12T00:00:00Z"
          datetime_lt: "2025-11-13T00:00:00Z"
        }
        limit: 1000
      ) {
        quantiles {
          cpuTimeP50
          cpuTimeP90
          cpuTimeP99
        }
        dimensions {
          canary_cohort: customData1
        }
      }
    }
  }
}
```

**Target Metrics (Design Requirement):**
- **p50:** < 200ms
- **p90:** < 600ms
- **p99:** < 1500ms

### Dashboard Setup (Grafana/Cloudflare Dashboard)

**Pre-built Dashboard JSON:** (Import into Cloudflare Analytics)

```json
{
  "dashboard": {
    "title": "B2a Canary Monitoring",
    "panels": [
      {
        "title": "Traffic Distribution",
        "type": "pie",
        "query": "CanaryTrafficDistribution"
      },
      {
        "title": "Error Rate by Cohort",
        "type": "bar",
        "query": "CanaryErrorRate",
        "threshold": { "warning": 1.0, "critical": 1.5 }
      },
      {
        "title": "Latency p90 (ms)",
        "type": "line",
        "query": "CanaryLatency",
        "threshold": { "warning": 500, "critical": 600 }
      }
    ]
  }
}
```

---

## 4. Alert Rules

### Alert Thresholds (Design Requirements)

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **Error Rate** (native) | > 1.0% | > 1.5% | Set `emergency_proxy=true` in KV |
| **p90 Latency** (native) | > 500ms | > 600ms | Investigate slow R2 operations |
| **R2 Failures** | > 5/min | > 10/min | Check R2 bucket health |
| **Orphaned Intents** | > 10/hour | > 50/hour | Session drift detected |

### Email Alert (Workers Analytics)

**Setup:** Cloudflare Dashboard → Workers → Analytics → Notifications

**Rule 1: Error Rate Spike**
```yaml
name: "B2a Native Error Rate Spike"
trigger: "error_rate_native > 1.5%"
actions:
  - email: "ops@pix.immo"
  - webhook: "https://events.pagerduty.com/v2/enqueue"
message: |
  🚨 CRITICAL: B2a native cohort error rate exceeds 1.5%
  
  Current: {{ error_rate_native }}%
  Threshold: 1.5%
  
  ACTION REQUIRED:
  1. Set emergency_proxy=true in KV config (instant rollback)
  2. Investigate logs: wrangler tail --format=json | grep ERROR
  3. Check R2 bucket health
```

**Rule 2: Latency Spike**
```yaml
name: "B2a Native Latency Spike"
trigger: "p90_latency_native > 600ms"
actions:
  - email: "ops@pix.immo"
message: |
  ⚠️ WARNING: B2a native cohort p90 latency exceeds 600ms
  
  Current: {{ p90_latency_native }}ms
  Threshold: 600ms
  
  INVESTIGATE:
  1. Check R2 operation latency (slow uploads?)
  2. Review DB query performance
  3. Check origin proxy health
```

### PagerDuty Integration

**Webhook Setup:**
```bash
# Create integration in PagerDuty → Services → Cloudflare Workers
# Copy Integration Key: abcd1234ef567890

# Configure webhook in Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/alerting/destinations/pagerduty" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -d '{
    "name": "B2a PagerDuty",
    "integration_key": "abcd1234ef567890"
  }'
```

---

## 5. Log Analysis Examples

### Find All Errors

```bash
# Download logs
wrangler tail --format=json > logs.jsonl

# Extract errors
cat logs.jsonl | jq 'select(.level == "ERROR")' | jq '.context'
```

**Output:**
```json
{
  "cohort": "native",
  "decision_reason": "sampled",
  "request_path": "/api/uploads/finalize",
  "status_code": 500,
  "error": "R2 bucket unavailable",
  "upload_intent_id": "intent_01HQWXYZ..."
}
```

### Calculate Error Rate

```bash
# Count total requests
total=$(cat logs.jsonl | jq -s 'length')

# Count errors
errors=$(cat logs.jsonl | jq 'select(.level == "ERROR")' | jq -s 'length')

# Calculate error rate
error_rate=$(echo "scale=2; $errors * 100 / $total" | bc)
echo "Error Rate: ${error_rate}%"
```

### Identify Orphaned Intents

```bash
# Find intents without finalize
cat logs.jsonl | jq 'select(.context.upload_intent_id != null)' | \
  jq -r '[.context.upload_intent_id, .message] | @tsv' | \
  awk '{intents[$1]++; if($2 ~ /intent/) intent[$1]=1; if($2 ~ /finalize/) finalize[$1]=1} 
       END {for(i in intents) if(intent[i] && !finalize[i]) print i}'
```

**Output:**
```
intent_01HQWXYZ...
intent_01HQWABC...
```

### Latency Histogram

```bash
# Extract duration_ms values
cat logs.jsonl | jq -r '.context.duration_ms' | \
  awk '{buckets[int($1/100)*100]++} 
       END {for(b in buckets) print b"-"b+99"ms: "buckets[b]}'
```

**Output:**
```
0-99ms: 1234
100-199ms: 567
200-299ms: 89
300-399ms: 12
500-599ms: 3
```

---

## 6. Rollback Procedures

### Instant Rollback (KV-based)

**Scenario:** Error rate exceeds 1.5% or critical latency spike

**Action:**
```bash
# Set emergency_proxy=true in KV config
wrangler kv:key put --binding=CANARY_CONFIG "config" \
  '{"canary_percent":0,"canary_tag":"emergency-rollback","emergency_proxy":true,"last_updated":"2025-11-12T08:30:00Z"}'
```

**Effect:**
- All traffic immediately routes to proxy (origin server)
- Native handlers disabled globally
- Rollback time: **< 5 seconds** (KV propagation)

### Gradual Rollback (Reduce canary_percent)

**Scenario:** Error rate elevated but not critical (e.g., 1.2%)

**Action:**
```bash
# Reduce canary from 10% → 5%
wrangler kv:key put --binding=CANARY_CONFIG "config" \
  '{"canary_percent":5,"canary_tag":"B2a-reduced","emergency_proxy":false,"last_updated":"2025-11-12T08:35:00Z"}'
```

**Effect:**
- Native cohort traffic reduced by 50%
- Error rate should decrease proportionally
- Monitor for 15 minutes before next action

### Full Deployment Rollback (wrangler.toml)

**Scenario:** Catastrophic failure (Workers crash, DB corruption)

**Action:**
```bash
# Revert to previous Workers deployment
git checkout <PREVIOUS_TAG>
wrangler deploy
```

**Effect:**
- Full code rollback (middleware + handlers)
- Rollback time: **~2 minutes** (redeploy + DNS propagation)

---

## 7. Monitoring Checklist

**Pre-Deployment:**
- [ ] Logpush configured (R2 destination: `logs-canary/b2a/`)
- [ ] Analytics dashboard created (traffic, errors, latency)
- [ ] Alert rules configured (error >1.5%, p90 >600ms)
- [ ] PagerDuty integration tested

**During Rollout (24h):**
- [ ] Monitor error rate (target: < 1%)
- [ ] Monitor p90 latency (target: < 600ms)
- [ ] Check R2 operation success rate (target: > 99%)
- [ ] Review orphaned intent count (< 10/hour)

**Post-Rollout (GO/NO-GO):**
- [ ] Error rate stable for 24h
- [ ] Latency within SLA targets
- [ ] No critical incidents
- [ ] Logs archived to R2 (retention policy active)

---

## 8. Reference

**Documentation:**
- [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/)
- [Logpush to R2](https://developers.cloudflare.com/logs/get-started/enable-destinations/r2/)
- [Workers Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/)
- [GraphQL API](https://developers.cloudflare.com/analytics/graphql-api/)

**Tools:**
- [wrangler tail](https://developers.cloudflare.com/workers/wrangler/commands/#tail) - Real-time log streaming
- [jq](https://stedolan.github.io/jq/) - JSON log parsing
- [Grafana Cloud](https://grafana.com/products/cloud/) - Alternative dashboard (Cloudflare integration)

**Contact:**
- Engineering: ops@pix.immo
- PagerDuty: B2a Canary Alerts (auto-escalation)

---

**Status:** ✅ **READY FOR PRODUCTION**  
**Last Updated:** 2025-11-12  
**Author:** Replit Agent (Architect-Reviewed)
