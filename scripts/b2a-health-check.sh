#!/bin/bash
# ==========================================================
# B2a Health Check - Production Monitoring Script
# Usage: ./scripts/b2a-health-check.sh
# Frequency: Run every 2 hours during 24h monitoring period
# ==========================================================

set -e

DOMAIN="${1:-https://api.pix.immo}"

echo "==================================================="
echo "B2a Health Check - $(date)"
echo "Target: $DOMAIN"
echo "==================================================="

# 1. Check /qa endpoint
echo ""
echo "1. /qa Endpoint Health:"
QA_RESPONSE=$(curl -s "$DOMAIN/api/qa")
echo "$QA_RESPONSE" | jq '{
  canary: .canary,
  health: .health
}'

# Extract canary percent for validation
CANARY_PERCENT=$(echo "$QA_RESPONSE" | jq -r '.canary.percent')
EMERGENCY_PROXY=$(echo "$QA_RESPONSE" | jq -r '.canary.emergency_proxy')

echo ""
echo "   Config: ${CANARY_PERCENT}% canary, emergency_proxy=${EMERGENCY_PROXY}"

# 2. Sample cohort distribution (100 requests)
echo ""
echo "2. Cohort Distribution (100 samples):"
echo "   Sampling..."
COHORT_DIST=$(for i in {1..100}; do
  curl -s "$DOMAIN/api/qa" | jq -r '.canary.cohort' 2>/dev/null || echo "error"
done | sort | uniq -c)

echo "$COHORT_DIST"

# Calculate expected ratio
NATIVE_COUNT=$(echo "$COHORT_DIST" | grep "native" | awk '{print $1}' || echo "0")
PROXY_COUNT=$(echo "$COHORT_DIST" | grep "proxy" | awk '{print $1}' || echo "0")

# Check if we got valid cohort data (TOTAL > 0)
TOTAL=$((NATIVE_COUNT + PROXY_COUNT))

if [ "$TOTAL" -gt 0 ]; then
  # Safe division (TOTAL > 0)
  NATIVE_PCT=$((NATIVE_COUNT * 100 / TOTAL))
  PROXY_PCT=$((PROXY_COUNT * 100 / TOTAL))
  
  echo ""
  echo "   Observed: ${NATIVE_COUNT} native (${NATIVE_PCT}%), ${PROXY_COUNT} proxy (${PROXY_PCT}%)"
  echo "   Expected: ~${CANARY_PERCENT}% native, ~$((100 - CANARY_PERCENT))% proxy"
  
  # Validate distribution (±5% tolerance)
  LOWER_BOUND=$((CANARY_PERCENT - 5))
  UPPER_BOUND=$((CANARY_PERCENT + 5))
  
  if [ "$NATIVE_PCT" -ge "$LOWER_BOUND" ] && [ "$NATIVE_PCT" -le "$UPPER_BOUND" ]; then
    echo "   ✅ Distribution within expected range"
  else
    echo "   ⚠️  Distribution outside expected range (±5% tolerance)"
  fi
else
  # /qa endpoint down or returning invalid data
  echo ""
  echo "   ⚠️  CRITICAL: No valid cohort data received (0 successful samples)"
  echo "   Possible causes:"
  echo "   - /qa endpoint is down or unreachable"
  echo "   - Network issues preventing curl requests"
  echo "   - Worker deployment failed"
  echo ""
  echo "   Action: Investigate /qa endpoint immediately"
fi

# 3. Check recent logs in R2
echo ""
echo "3. Recent Logs (R2 bucket logs-canary):"
echo "   HTTP Requests:"
npx wrangler r2 object list logs-canary --prefix b2a/http_requests/ 2>/dev/null | tail -2 || echo "   (No logs yet or wrangler not authenticated)"

echo ""
echo "   Workers Trace Events:"
npx wrangler r2 object list logs-canary --prefix b2a/workers_trace_events/ 2>/dev/null | tail -2 || echo "   (No logs yet or wrangler not authenticated)"

# 4. Sample recent errors (if any)
echo ""
echo "4. Recent Errors (last 3 error logs, if any):"
LATEST_LOG=$(npx wrangler r2 object list logs-canary --prefix b2a/workers_trace_events/ 2>/dev/null | tail -1 | awk '{print $1}' || echo "")

if [ -n "$LATEST_LOG" ]; then
  echo "   Downloading: $LATEST_LOG"
  npx wrangler r2 object get "logs-canary/$LATEST_LOG" --file=/tmp/b2a_latest.log.gz 2>/dev/null
  
  if [ -f /tmp/b2a_latest.log.gz ]; then
    gunzip -c /tmp/b2a_latest.log.gz 2>/dev/null | jq 'select(.Logs.Level=="ERROR")' 2>/dev/null | head -3 || echo "   (No errors in recent logs)"
    rm -f /tmp/b2a_latest.log.gz
  else
    echo "   (Could not download log file)"
  fi
else
  echo "   (No log files found - may need 5-15 min after enabling Logpush)"
fi

# 5. Summary
echo ""
echo "==================================================="
echo "Health Check Summary:"
echo "==================================================="

# Extract health status
DB_STATUS=$(echo "$QA_RESPONSE" | jq -r '.health.database')
R2_STATUS=$(echo "$QA_RESPONSE" | jq -r '.health.r2_bucket')
PROXY_STATUS=$(echo "$QA_RESPONSE" | jq -r '.health.proxy_origin')

echo "   Database:      $DB_STATUS"
echo "   R2 Bucket:     $R2_STATUS"
echo "   Proxy Origin:  $PROXY_STATUS"
echo "   Canary:        ${CANARY_PERCENT}% (emergency: $EMERGENCY_PROXY)"
echo "   Distribution:  ${NATIVE_PCT:-?}% native, ${PROXY_PCT:-?}% proxy"
echo ""

# Overall health
if [ "$DB_STATUS" = "ok" ] && [ "$R2_STATUS" = "ok" ] && [ "$PROXY_STATUS" = "ok" ]; then
  echo "   Overall: ✅ HEALTHY"
else
  echo "   Overall: ⚠️  DEGRADED"
  echo ""
  echo "   Action Required:"
  [ "$DB_STATUS" != "ok" ] && echo "   - Check database connection"
  [ "$R2_STATUS" != "ok" ] && echo "   - Check R2 bucket configuration"
  [ "$PROXY_STATUS" != "ok" ] && echo "   - Check proxy origin server"
fi

echo "==================================================="
echo "Next Check: $(date -d '+2 hours' 2>/dev/null || date -v+2H 2>/dev/null || echo 'In 2 hours')"
echo "==================================================="
