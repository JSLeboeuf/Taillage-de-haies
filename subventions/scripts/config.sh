#!/bin/bash

# RS&DE Tracker Configuration
# Source this file to customize API cost estimates and hourly rates
# or pass ENV vars directly to rsde-tracker.sh

# Hourly rate for developer (adjust to actual rate)
export HOURLY_RATE=60

# Monthly API & Infrastructure Costs (estimates, update with real invoices)
export ANTHROPIC_EST=80      # Claude API calls
export OPENAI_EST=40         # GPT-4 / ChatGPT
export DEEPGRAM_EST=15       # Speech-to-text
export ELEVENLABS_EST=20     # Text-to-speech
export VERCEL_EST=20         # Next.js hosting
export SUPABASE_EST=25       # PostgreSQL + Auth
export CLOUDFLARE_EST=5      # Workers + CDN
export TWILIO_EST=30         # SMS / Voice calls

# Total API costs
export TOTAL_API_COST=$((ANTHROPIC_EST + OPENAI_EST + DEEPGRAM_EST + ELEVENLABS_EST + VERCEL_EST + SUPABASE_EST + CLOUDFLARE_EST + TWILIO_EST))

# CRA Tax Credit Rates
export FEDERAL_RATE=35       # CTRC (federal)
export PROVINCIAL_RATE=30    # CRIC (Quebec)

# Overhead proxy method (not included in labor calculation, added by comptable)
export OVERHEAD_RATE=55

# Notes for custom configuration:
#
# To use custom rates, source this file before running rsde-tracker.sh:
#   source subventions/scripts/config.sh
#   ./rsde-tracker.sh 2026-03
#
# Or override specific values:
#   HOURLY_RATE=75 ./subventions/scripts/rsde-tracker.sh 2026-03
#   ANTHROPIC_EST=120 ./subventions/scripts/rsde-tracker.sh 2026-03
#
# To update costs with real invoices:
# 1. Open subventions/scripts/config.sh
# 2. Replace EST values with actual invoice amounts
# 3. Run script again to regenerate report
#
# Example with actual February 2026 invoices:
#   export ANTHROPIC_EST=95
#   export OPENAI_EST=48
#   export VERCEL_EST=22
#   export DEEPGRAM_EST=18
#   ./subventions/scripts/rsde-tracker.sh 2026-02

echo "✅ RS&DE Tracker config loaded"
echo ""
echo "Current settings:"
echo "  Hourly rate: \$${HOURLY_RATE}/h"
echo "  Total API estimate: \$${TOTAL_API_COST}/month"
echo "  Federal credit rate: ${FEDERAL_RATE}%"
echo "  Provincial credit rate: ${PROVINCIAL_RATE}%"
echo ""
