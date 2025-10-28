#!/bin/bash

# Manual Integration Tests for POST /api/jobs Server-Side Deduplication
# Task 17 - Offline-First Sync Queue Deduplication
#
# Prerequisites: 
# - Dev server running on http://localhost:5000
# - curl and jq installed
#
# Usage: bash server/tests/job-deduplication-manual.sh

BASE_URL="http://localhost:5000"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}POST /api/jobs Deduplication Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test counter
PASSED=0
FAILED=0

# Helper function to check status code
check_status() {
  local expected=$1
  local actual=$2
  local test_name=$3
  
  if [ "$expected" -eq "$actual" ]; then
    echo -e "${GREEN}✓ PASSED${NC}: $test_name (Status: $actual)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC}: $test_name (Expected: $expected, Got: $actual)"
    ((FAILED++))
    return 1
  fi
}

# ==============================================
# INT1: POST with localId → 201 Created
# ==============================================
echo -e "\n${YELLOW}[INT1] Testing: POST with localId → 201 Created${NC}"

RESPONSE_INT1=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d '{
    "localId": "ULID123TEST001",
    "propertyName": "Test Property INT1",
    "customerName": "Test Customer",
    "propertyAddress": "Teststraße 1, 10115 Berlin",
    "deliverGallery": true,
    "deliverAlttext": true,
    "deliverExpose": false
  }')

STATUS_INT1=$(echo "$RESPONSE_INT1" | tail -n1)
BODY_INT1=$(echo "$RESPONSE_INT1" | sed '$d')

check_status 201 "$STATUS_INT1" "INT1: Create job with localId"

if [ "$STATUS_INT1" -eq 201 ]; then
  LOCAL_ID=$(echo "$BODY_INT1" | jq -r '.localId')
  JOB_NUMBER=$(echo "$BODY_INT1" | jq -r '.jobNumber')
  
  echo "  → Job created: $JOB_NUMBER"
  echo "  → Local ID: $LOCAL_ID"
  
  if [ "$LOCAL_ID" = "ULID123TEST001" ]; then
    echo -e "  ${GREEN}✓ localId stored correctly${NC}"
  else
    echo -e "  ${RED}✗ localId mismatch${NC}"
    ((FAILED++))
  fi
fi

# ==============================================
# INT2: Duplicate POST → 409 Conflict
# ==============================================
echo -e "\n${YELLOW}[INT2] Testing: Duplicate localId → 409 Conflict${NC}"

# First request - create job
RESPONSE_INT2_FIRST=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d '{
    "localId": "ULID456TEST002",
    "propertyName": "Test Property INT2 Original",
    "customerName": "Original Customer"
  }')

STATUS_INT2_FIRST=$(echo "$RESPONSE_INT2_FIRST" | tail -n1)
BODY_INT2_FIRST=$(echo "$RESPONSE_INT2_FIRST" | sed '$d')

echo "  Step 1: Creating original job..."
check_status 201 "$STATUS_INT2_FIRST" "INT2: Create original job"

ORIGINAL_JOB_ID=$(echo "$BODY_INT2_FIRST" | jq -r '.id')
echo "  → Original Job ID: $ORIGINAL_JOB_ID"

# Second request - attempt duplicate
sleep 1
RESPONSE_INT2_SECOND=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d '{
    "localId": "ULID456TEST002",
    "propertyName": "Test Property INT2 Duplicate",
    "customerName": "Duplicate Customer"
  }')

STATUS_INT2_SECOND=$(echo "$RESPONSE_INT2_SECOND" | tail -n1)
BODY_INT2_SECOND=$(echo "$RESPONSE_INT2_SECOND" | sed '$d')

echo "  Step 2: Attempting duplicate with same localId..."
check_status 409 "$STATUS_INT2_SECOND" "INT2: Detect duplicate and return 409"

if [ "$STATUS_INT2_SECOND" -eq 409 ]; then
  RETURNED_JOB_ID=$(echo "$BODY_INT2_SECOND" | jq -r '.job.id')
  RETURNED_PROPERTY=$(echo "$BODY_INT2_SECOND" | jq -r '.job.propertyName')
  
  echo "  → Returned Job ID: $RETURNED_JOB_ID"
  echo "  → Returned Property: $RETURNED_PROPERTY"
  
  if [ "$RETURNED_JOB_ID" = "$ORIGINAL_JOB_ID" ]; then
    echo -e "  ${GREEN}✓ Correct job ID returned${NC}"
  else
    echo -e "  ${RED}✗ Wrong job ID returned${NC}"
    ((FAILED++))
  fi
  
  if [ "$RETURNED_PROPERTY" = "Test Property INT2 Original" ]; then
    echo -e "  ${GREEN}✓ Original data preserved (not overwritten)${NC}"
  else
    echo -e "  ${RED}✗ Data was overwritten${NC}"
    ((FAILED++))
  fi
fi

# ==============================================
# INT3: POST without localId (legacy) → 201
# ==============================================
echo -e "\n${YELLOW}[INT3] Testing: Legacy client without localId → 201 Created${NC}"

RESPONSE_INT3=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d '{
    "propertyName": "Test Property INT3 Legacy",
    "customerName": "Legacy Customer",
    "propertyAddress": "Altbaustraße 42, 80331 München"
  }')

STATUS_INT3=$(echo "$RESPONSE_INT3" | tail -n1)
BODY_INT3=$(echo "$RESPONSE_INT3" | sed '$d')

check_status 201 "$STATUS_INT3" "INT3: Legacy client works (no regression)"

if [ "$STATUS_INT3" -eq 201 ]; then
  LOCAL_ID_INT3=$(echo "$BODY_INT3" | jq -r '.localId')
  
  if [ "$LOCAL_ID_INT3" = "null" ]; then
    echo -e "  ${GREEN}✓ localId is null for legacy clients${NC}"
  else
    echo -e "  ${RED}✗ localId should be null but got: $LOCAL_ID_INT3${NC}"
    ((FAILED++))
  fi
fi

# ==============================================
# INT4: Queue worker retry → 201 then 409
# ==============================================
echo -e "\n${YELLOW}[INT4] Testing: Queue worker retry → 201 then 409${NC}"

QUEUE_PAYLOAD='{
  "localId": "ULID789QUEUE001",
  "propertyName": "Queue Test Property",
  "customerName": "Queue Customer",
  "selectedUserId": "user-123",
  "selectedUserInitials": "DF",
  "selectedUserCode": "K9M2P"
}'

# First sync attempt
echo "  Step 1: Initial queue sync..."
RESPONSE_INT4_FIRST=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d "$QUEUE_PAYLOAD")

STATUS_INT4_FIRST=$(echo "$RESPONSE_INT4_FIRST" | tail -n1)
BODY_INT4_FIRST=$(echo "$RESPONSE_INT4_FIRST" | sed '$d')

check_status 201 "$STATUS_INT4_FIRST" "INT4: First sync succeeds"

SERVER_JOB_ID=$(echo "$BODY_INT4_FIRST" | jq -r '.id')
SERVER_JOB_NUMBER=$(echo "$BODY_INT4_FIRST" | jq -r '.jobNumber')
echo "  → Server Job ID: $SERVER_JOB_ID"
echo "  → Server Job Number: $SERVER_JOB_NUMBER"

# Retry after simulated network failure
sleep 1
echo "  Step 2: Retry after network failure..."
RESPONSE_INT4_RETRY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/jobs" \
  -H "$CONTENT_TYPE" \
  -d "$QUEUE_PAYLOAD")

STATUS_INT4_RETRY=$(echo "$RESPONSE_INT4_RETRY" | tail -n1)
BODY_INT4_RETRY=$(echo "$RESPONSE_INT4_RETRY" | sed '$d')

check_status 409 "$STATUS_INT4_RETRY" "INT4: Retry returns 409 Conflict"

if [ "$STATUS_INT4_RETRY" -eq 409 ]; then
  RETRY_JOB_ID=$(echo "$BODY_INT4_RETRY" | jq -r '.job.id')
  RETRY_JOB_NUMBER=$(echo "$BODY_INT4_RETRY" | jq -r '.job.jobNumber')
  
  echo "  → Retry returned Job ID: $RETRY_JOB_ID"
  echo "  → Retry returned Job Number: $RETRY_JOB_NUMBER"
  
  if [ "$RETRY_JOB_ID" = "$SERVER_JOB_ID" ]; then
    echo -e "  ${GREEN}✓ Same job returned on retry${NC}"
    echo -e "  ${GREEN}✓ Client can mark queue item as synced with serverId: $RETRY_JOB_ID${NC}"
  else
    echo -e "  ${RED}✗ Different job ID on retry${NC}"
    ((FAILED++))
  fi
fi

# ==============================================
# Test Summary
# ==============================================
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"

TOTAL=$((PASSED + FAILED))

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed! ($PASSED/$TOTAL)${NC}"
  echo -e "\n${GREEN}Server-side deduplication is working correctly!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed ($FAILED/$TOTAL failed, $PASSED/$TOTAL passed)${NC}"
  exit 1
fi
