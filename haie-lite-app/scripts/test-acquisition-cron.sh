#!/bin/bash

# Test script for acquisition outreach cron
# Usage: ./scripts/test-acquisition-cron.sh [secret]

set -e

CRON_SECRET="${1:-test-secret-123}"
BASE_URL="${2:-http://localhost:3000}"
ENDPOINT="$BASE_URL/api/cron/acquisition-outreach"

echo "=== Acquisition Outreach Cron Test ==="
echo ""
echo "Testing: $ENDPOINT"
echo "Auth: Bearer $CRON_SECRET"
echo ""

# Test 1: Missing authorization
echo "Test 1: Missing authorization header..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$STATUS" = "401" ]; then
    echo "✓ PASS — Correctly rejected unauthorized request (401)"
else
    echo "✗ FAIL — Expected 401, got $STATUS"
fi
echo ""

# Test 2: Wrong authorization
echo "Test 2: Wrong authorization header..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer wrong-secret" "$ENDPOINT")
STATUS=$(echo "$RESPONSE" | tail -1)

if [ "$STATUS" = "401" ]; then
    echo "✓ PASS — Correctly rejected wrong secret (401)"
else
    echo "✗ FAIL — Expected 401, got $STATUS"
fi
echo ""

# Test 3: Correct authorization
echo "Test 3: Correct authorization header..."
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $CRON_SECRET" "$ENDPOINT")
STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$STATUS" = "200" ]; then
    echo "✓ PASS — Authorized request successful (200)"
    echo "Response: $BODY"

    # Validate JSON response
    if echo "$BODY" | grep -q '"processed":'; then
        echo "✓ PASS — Response contains 'processed' field"
    else
        echo "✗ FAIL — Response missing 'processed' field"
    fi

    if echo "$BODY" | grep -q '"sent":'; then
        echo "✓ PASS — Response contains 'sent' field"
    else
        echo "✗ FAIL — Response missing 'sent' field"
    fi

    if echo "$BODY" | grep -q '"errors":'; then
        echo "✓ PASS — Response contains 'errors' field"
    else
        echo "✗ FAIL — Response missing 'errors' field"
    fi
else
    echo "✗ FAIL — Expected 200, got $STATUS"
    echo "Response: $BODY"
fi
echo ""

echo "=== Test Complete ==="
