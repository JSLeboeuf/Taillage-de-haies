#!/bin/bash

# Acquisition API Test Examples
# Usage: DASHBOARD_KEY=your_key bash test-examples.sh

API_URL="http://localhost:3000/api/acquisitions"
DASHBOARD_KEY="${DASHBOARD_KEY:-test-key}"

echo "=== Acquisition API Tests ==="
echo "Using DASHBOARD_KEY: ${DASHBOARD_KEY:0:10}..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Get stats
echo -e "${GREEN}[TEST 1] Get pipeline stats${NC}"
curl -s -X GET "${API_URL}/stats" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
echo ""

# Test 2: Create a single prospect
echo -e "${GREEN}[TEST 2] Create a prospect${NC}"
PROSPECT_RESPONSE=$(curl -s -X POST "${API_URL}/prospects" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Green Landscaping Co",
    "owner_name": "Pierre Dupont",
    "owner_email": "pierre@greenlandscaping.qc.ca",
    "owner_phone": "+1-514-555-1234",
    "territory": "Montreal",
    "source": "directory",
    "estimated_age_years": 5,
    "priority": "high",
    "notes": "Strong fit for acquisition"
  }')
echo "$PROSPECT_RESPONSE" | jq '.'

# Extract prospect ID for further tests
PROSPECT_ID=$(echo "$PROSPECT_RESPONSE" | jq -r '.prospect.id // empty')
echo "Prospect ID: $PROSPECT_ID"
echo ""

# Test 3: Get prospect details
if [ ! -z "$PROSPECT_ID" ]; then
  echo -e "${GREEN}[TEST 3] Get prospect details${NC}"
  curl -s -X GET "${API_URL}/prospects/${PROSPECT_ID}" \
    -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
  echo ""
fi

# Test 4: Update prospect
if [ ! -z "$PROSPECT_ID" ]; then
  echo -e "${GREEN}[TEST 4] Update prospect status${NC}"
  curl -s -X PATCH "${API_URL}/prospects/${PROSPECT_ID}" \
    -H "Authorization: Bearer ${DASHBOARD_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "contacted",
      "priority": "critical",
      "call_notes": "Initial conversation scheduled for Monday 10am"
    }' | jq '.'
  echo ""
fi

# Test 5: List prospects with filters
echo -e "${GREEN}[TEST 5] List prospects (status=contacted)${NC}"
curl -s -X GET "${API_URL}/prospects?status=contacted&limit=10" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
echo ""

# Test 6: Bulk import
echo -e "${GREEN}[TEST 6] Bulk import prospects${NC}"
curl -s -X POST "${API_URL}/import" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "prospects": [
      {
        "company_name": "Montreal Tree Services",
        "owner_name": "Jean-Claude Marchand",
        "owner_email": "jc@mtltrees.qc.ca",
        "territory": "Montreal",
        "source": "directory",
        "estimated_age_years": 8,
        "notes": "Largest tree service in QC"
      },
      {
        "company_name": "Estrie Landscaping Group",
        "owner_name": "Marie-Louise Garand",
        "owner_email": "ml@estrielandscape.qc.ca",
        "territory": "Sherbrooke",
        "source": "referral",
        "estimated_age_years": 3,
        "notes": "Fast growing startup"
      },
      {
        "company_name": "Laval Hedge & Garden",
        "owner_name": "Robert Leblanc",
        "owner_email": "robert@lavalhg.qc.ca",
        "territory": "Laval",
        "source": "directory",
        "estimated_age_years": 6,
        "notes": "Strong cash flow, expansion phase"
      }
    ]
  }' | jq '.'
echo ""

# Test 7: Search prospects
echo -e "${GREEN}[TEST 7] Search prospects (company_name contains 'Green')${NC}"
curl -s -X GET "${API_URL}/prospects?search=green" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
echo ""

# Test 8: Get stats again (to see updated numbers)
echo -e "${GREEN}[TEST 8] Get stats (after tests)${NC}"
curl -s -X GET "${API_URL}/stats" \
  -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
echo ""

# Test 9: Archive prospect (if we created one)
if [ ! -z "$PROSPECT_ID" ]; then
  echo -e "${GREEN}[TEST 9] Archive prospect${NC}"
  curl -s -X DELETE "${API_URL}/prospects/${PROSPECT_ID}" \
    -H "Authorization: Bearer ${DASHBOARD_KEY}" | jq '.'
  echo ""
fi

# Test 10: Error handling
echo -e "${GREEN}[TEST 10] Test error handling (unauthorized)${NC}"
curl -s -X GET "${API_URL}/stats" \
  -H "Authorization: Bearer wrong-key" | jq '.'
echo ""

echo -e "${GREEN}=== Tests Complete ===${NC}"
