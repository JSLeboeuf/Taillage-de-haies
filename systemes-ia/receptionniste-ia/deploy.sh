#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Haie Lite Receptionniste IA - Deployment ==="
echo ""

# Check dependencies
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "ERROR: npx is not installed"
    exit 1
fi

echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Type checking..."
npm run type-check

echo ""
echo "3. Building..."
npm run build

echo ""
echo "4. Deploying to Cloudflare Workers..."

if [ -n "$VAPI_ACCOUNT_ID" ]; then
    echo "   Using VAPI_ACCOUNT_ID: $VAPI_ACCOUNT_ID"
fi

npx wrangler deploy

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Webhook URL: https://haie-lite-receptionniste.haielite.workers.dev/webhook"
echo "Health Check: https://haie-lite-receptionniste.haielite.workers.dev/"
echo ""
echo "Next steps:"
echo "1. Set environment variables:"
echo "   npx wrangler secret put TWILIO_ACCOUNT_SID"
echo "   npx wrangler secret put TWILIO_AUTH_TOKEN"
echo "   npx wrangler secret put TWILIO_PHONE_NUMBER"
echo "   npx wrangler secret put SERVICEM8_TOKEN"
echo ""
echo "2. Configure VAPI assistant webhook to: https://haie-lite-receptionniste.haielite.workers.dev/webhook"
echo ""
echo "Test the webhook:"
echo "  curl -X POST https://haie-lite-receptionniste.haielite.workers.dev/webhook \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\": {\"type\": \"function-call\", \"functionCall\": {\"name\": \"availableSlots\", \"parameters\": {}}}}'"
echo ""
