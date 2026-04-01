#!/bin/bash
# =============================================================================
# Test E2E — SMS AI Lead Qualifier
# Simule le flow complet: creation lead → SMS IA → conversation multi-tour
# Usage: ./test-flow.sh [phone] [name]
# =============================================================================

set -euo pipefail

# Config
WORKER_URL="https://sms-ai-qualifier.haielite.workers.dev"
TEST_PHONE="${1:-+15145550001}"
TEST_NAME="${2:-Jean Test}"
FIRST_NAME=$(echo "$TEST_NAME" | cut -d' ' -f1)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN} SMS AI Lead Qualifier — Test E2E${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "Worker: ${WORKER_URL}"
echo -e "Phone:  ${TEST_PHONE}"
echo -e "Name:   ${TEST_NAME}"
echo ""

# Get Infisical secrets
INFISICAL_TOKEN=$(infisical login --method=universal-auth \
  --client-id=9c0ecdc4-1e5e-4d19-bacc-28b9166739a6 \
  --client-secret=2424d678bd9055c39518cc7298952bc8c81183da1e3fd98d40b8b19a4cb64436 \
  --silent --plain 2>/dev/null)

get_secret() {
  infisical secrets get "$1" --env=prod \
    --projectId=5915781f-9d5a-459e-9cf7-c4663c1e4a1e \
    --token="$INFISICAL_TOKEN" -o json --silent 2>/dev/null | \
    python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['secretValue'] if isinstance(d,list) else d['secretValue'])" 2>/dev/null
}

SUPABASE_URL=$(get_secret HAIELITE_SUPABASE_URL)
SUPABASE_KEY=$(get_secret HAIELITE_SUPABASE_SERVICE_ROLE_KEY)

sb_query() {
  curl -s "${SUPABASE_URL}/rest/v1/$1" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    "${@:2}"
}

# =============================================================================
# Step 1: Create test lead in Supabase
# =============================================================================
echo -e "${YELLOW}[1/5] Creation du lead test...${NC}"

# Clean up previous test data for this phone
sb_query "sms_conversations?phone_number=eq.${TEST_PHONE}" -X DELETE >/dev/null 2>&1
sb_query "cascade_tracking?lead_id=in.(select id from leads where phone='${TEST_PHONE}')" -X DELETE >/dev/null 2>&1

LEAD=$(sb_query "leads" -X POST -d "{
  \"name\": \"${TEST_NAME}\",
  \"phone\": \"${TEST_PHONE}\",
  \"city\": \"Laval\",
  \"source\": \"meta_ads\",
  \"hedge_sides\": 4,
  \"status\": \"new\"
}")
LEAD_ID=$(echo "$LEAD" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)

if [ -z "$LEAD_ID" ]; then
  echo -e "${RED}Erreur: impossible de creer le lead${NC}"
  echo "$LEAD"
  exit 1
fi
echo -e "${GREEN}  Lead cree: ${LEAD_ID}${NC}"

# =============================================================================
# Step 2: Create SMS conversation + cascade tracking
# =============================================================================
echo -e "${YELLOW}[2/5] Creation conversation SMS + cascade tracking...${NC}"

GREETING="Salut ${FIRST_NAME}! C'est Haie Lite, suite a ta demande de soumission. T'es proprietaire? Reponds STOP pour te desinscrire."

CONV=$(sb_query "sms_conversations" -X POST -d "{
  \"lead_id\": \"${LEAD_ID}\",
  \"phone_number\": \"${TEST_PHONE}\",
  \"state\": \"qualifying\",
  \"messages\": [{\"role\": \"assistant\", \"content\": \"${GREETING}\"}],
  \"qualification_data\": {\"hedge_sides\": 4, \"city\": \"Laval\"},
  \"qualification_score\": 2,
  \"turn_count\": 1,
  \"consent_sms\": true
}")
CONV_ID=$(echo "$CONV" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
echo -e "${GREEN}  Conversation: ${CONV_ID}${NC}"

CASCADE=$(sb_query "cascade_tracking" -X POST -d "{
  \"lead_id\": \"${LEAD_ID}\",
  \"current_tier\": 1,
  \"tier1_sms_sent_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
}")
echo -e "${GREEN}  Cascade tracking cree${NC}"
echo -e "${CYAN}  → SMS greeting envoye: \"${GREETING:0:60}...\"${NC}"

# =============================================================================
# Step 3: Test Worker health
# =============================================================================
echo -e "${YELLOW}[3/5] Test Worker health...${NC}"
HEALTH=$(curl -s "${WORKER_URL}/health")
echo -e "${GREEN}  ${HEALTH}${NC}"

# =============================================================================
# Step 4: Simuler conversation multi-tour
# =============================================================================
echo -e "${YELLOW}[4/5] Conversation multi-tour avec Claude Haiku...${NC}"
echo ""

MESSAGES=(
  "Oui je suis proprietaire"
  "4 cotes plus le dessus"
  "Laval, secteur Fabreville"
  "Oui cette semaine ca serait bon"
)

for i in "${!MESSAGES[@]}"; do
  MSG="${MESSAGES[$i]}"
  TURN=$((i + 1))

  echo -e "${CYAN}  [Tour ${TURN}] Prospect: \"${MSG}\"${NC}"

  RESPONSE=$(curl -s -X POST "${WORKER_URL}/sms" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "From=${TEST_PHONE}&To=%2B16626548845&Body=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${MSG}'))")&MessageSid=SM_TEST_$(printf '%03d' $TURN)")

  # Extract SMS text from TwiML
  SMS_TEXT=$(echo "$RESPONSE" | python3 -c "
import sys, re
xml = sys.stdin.read()
match = re.search(r'<Message>(.*?)</Message>', xml)
if match:
    text = match.group(1)
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&apos;', \"'\").replace('&quot;', '\"')
    print(text)
else:
    print('[TwiML vide — pas de reponse]')
" 2>/dev/null)

  echo -e "${GREEN}  [Tour ${TURN}] IA:       \"${SMS_TEXT}\"${NC}"

  # Get current score from Supabase
  CONV_STATE=$(curl -s "${SUPABASE_URL}/rest/v1/sms_conversations?id=eq.${CONV_ID}&select=state,qualification_score,turn_count" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}")
  SCORE=$(echo "$CONV_STATE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'score={d[0][\"qualification_score\"]}/10 state={d[0][\"state\"]} turns={d[0][\"turn_count\"]}')" 2>/dev/null)
  echo -e "           ${SCORE}"
  echo ""

  # Small delay to avoid rate limiting
  sleep 1
done

# =============================================================================
# Step 5: Verification finale
# =============================================================================
echo -e "${YELLOW}[5/5] Verification finale...${NC}"

FINAL_CONV=$(curl -s "${SUPABASE_URL}/rest/v1/sms_conversations?id=eq.${CONV_ID}&select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

python3 -c "
import json, sys
data = json.loads(sys.stdin.read())[0]
print(f'  State:       {data[\"state\"]}')
print(f'  Score:       {data[\"qualification_score\"]}/10')
print(f'  Turns:       {data[\"turn_count\"]}')
print(f'  Tokens in:   {data[\"total_input_tokens\"]}')
print(f'  Tokens out:  {data[\"total_output_tokens\"]}')
print(f'  Cost:        \${float(data[\"cost_usd\"]):.6f}')
print(f'  Opt-out:     {data[\"opt_out\"]}')
msgs = data.get('messages', [])
print(f'  Messages:    {len(msgs)} total')
qual = data.get('qualification_data', {})
if qual:
    print(f'  Qual data:   {json.dumps(qual, ensure_ascii=False)}')
" <<< "$FINAL_CONV"

FINAL_CASCADE=$(curl -s "${SUPABASE_URL}/rest/v1/cascade_tracking?lead_id=eq.${LEAD_ID}&select=*" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}")

python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
if data:
    d = data[0]
    print(f'  Cascade:     tier {d[\"current_tier\"]}, responded={d[\"tier1_sms_responded\"]}')
" <<< "$FINAL_CASCADE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Test termine!${NC}"
echo -e "${GREEN}========================================${NC}"
